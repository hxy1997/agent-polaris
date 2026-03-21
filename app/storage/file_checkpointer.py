from __future__ import annotations

import base64
import json
import shutil
from collections.abc import AsyncIterator, Iterator, Sequence
from pathlib import Path
from typing import Any

from langgraph.checkpoint.base import (
    BaseCheckpointSaver,
    ChannelVersions,
    Checkpoint,
    CheckpointMetadata,
    CheckpointTuple,
    get_checkpoint_id,
)
from langchain_core.runnables import RunnableConfig


class FileCheckpointSaver(BaseCheckpointSaver[str]):
    def __init__(self, root: Path):
        super().__init__()
        self.root = root

    def get_tuple(self, config: RunnableConfig) -> CheckpointTuple | None:
        thread_id = self._thread_id(config)
        checkpoint_ns = self._checkpoint_ns(config)
        checkpoint_id = get_checkpoint_id(config) or self._latest_checkpoint_id(thread_id, checkpoint_ns)
        if checkpoint_id is None:
            return None

        checkpoint_path = self._checkpoint_path(thread_id, checkpoint_ns, checkpoint_id)
        if not checkpoint_path.exists():
            return None

        payload = json.loads(checkpoint_path.read_text(encoding="utf-8"))
        checkpoint = self.serde.loads_typed(self._decode_typed(payload["checkpoint"]))
        metadata = self.serde.loads_typed(self._decode_typed(payload["metadata"]))
        writes = [
            (
                write["task_id"],
                write["channel"],
                self.serde.loads_typed(self._decode_typed(write["value"])),
            )
            for write in payload.get("writes", [])
        ]
        parent_checkpoint_id = payload.get("parent_checkpoint_id")

        return CheckpointTuple(
            config={
                "configurable": {
                    "thread_id": thread_id,
                    "checkpoint_ns": checkpoint_ns,
                    "checkpoint_id": checkpoint_id,
                }
            },
            checkpoint=checkpoint,
            metadata=metadata,
            pending_writes=writes,
            parent_config=(
                {
                    "configurable": {
                        "thread_id": thread_id,
                        "checkpoint_ns": checkpoint_ns,
                        "checkpoint_id": parent_checkpoint_id,
                    }
                }
                if parent_checkpoint_id
                else None
            ),
        )

    def list(
        self,
        config: RunnableConfig | None,
        *,
        filter: dict[str, Any] | None = None,
        before: RunnableConfig | None = None,
        limit: int | None = None,
    ) -> Iterator[CheckpointTuple]:
        if config is None:
            return iter(())

        thread_id = self._thread_id(config)
        checkpoint_ns = self._checkpoint_ns(config)
        checkpoint_ids = sorted(
            [path.stem for path in self._namespace_dir(thread_id, checkpoint_ns).glob("*.json")],
            reverse=True,
        )

        if before is not None:
            before_id = get_checkpoint_id(before)
            checkpoint_ids = [checkpoint_id for checkpoint_id in checkpoint_ids if checkpoint_id < before_id]

        matches: list[CheckpointTuple] = []
        for checkpoint_id in checkpoint_ids:
            checkpoint_tuple = self.get_tuple(
                {
                    "configurable": {
                        "thread_id": thread_id,
                        "checkpoint_ns": checkpoint_ns,
                        "checkpoint_id": checkpoint_id,
                    }
                }
            )
            if checkpoint_tuple is None:
                continue
            if filter and not all(checkpoint_tuple.metadata.get(key) == value for key, value in filter.items()):
                continue
            matches.append(checkpoint_tuple)
            if limit is not None and len(matches) >= limit:
                break

        return iter(matches)

    def put(
        self,
        config: RunnableConfig,
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: ChannelVersions,
    ) -> RunnableConfig:
        thread_id = self._thread_id(config)
        checkpoint_ns = self._checkpoint_ns(config)
        checkpoint_id = checkpoint["id"]
        parent_checkpoint_id = get_checkpoint_id(config)
        path = self._checkpoint_path(thread_id, checkpoint_ns, checkpoint_id)
        path.parent.mkdir(parents=True, exist_ok=True)

        payload = {
            "checkpoint": self._encode_typed(self.serde.dumps_typed(checkpoint)),
            "metadata": self._encode_typed(self.serde.dumps_typed(metadata)),
            "new_versions": new_versions,
            "parent_checkpoint_id": parent_checkpoint_id,
            "writes": self._load_writes(path),
        }
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

        return {
          "configurable": {
              "thread_id": thread_id,
              "checkpoint_ns": checkpoint_ns,
              "checkpoint_id": checkpoint_id,
          }
        }

    def put_writes(
        self,
        config: RunnableConfig,
        writes: Sequence[tuple[str, Any]],
        task_id: str,
        task_path: str = "",
    ) -> None:
        thread_id = self._thread_id(config)
        checkpoint_ns = self._checkpoint_ns(config)
        checkpoint_id = get_checkpoint_id(config)
        if checkpoint_id is None:
            return

        path = self._checkpoint_path(thread_id, checkpoint_ns, checkpoint_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
        stored_writes = payload.get("writes", [])
        stored_writes.extend(
            {
                "task_id": task_id,
                "task_path": task_path,
                "channel": channel,
                "value": self._encode_typed(self.serde.dumps_typed(value)),
            }
            for channel, value in writes
        )
        payload["writes"] = stored_writes
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    def delete_thread(self, thread_id: str) -> None:
        thread_root = self.root / thread_id
        if thread_root.exists():
            shutil.rmtree(thread_root)

    def delete_for_runs(self, run_ids: Sequence[str]) -> None:
        for run_id in run_ids:
            self.delete_thread(run_id)

    def copy_thread(self, source_thread_id: str, target_thread_id: str) -> None:
        source_root = self.root / source_thread_id
        target_root = self.root / target_thread_id
        if not source_root.exists():
            return
        if target_root.exists():
            shutil.rmtree(target_root)
        shutil.copytree(source_root, target_root)

    def prune(self, thread_ids: Sequence[str], *, strategy: str = "keep_latest") -> None:
        for thread_id in thread_ids:
            if strategy == "delete":
                self.delete_thread(thread_id)
                continue

            if strategy != "keep_latest":
                continue

            thread_root = self.root / thread_id
            if not thread_root.exists():
                continue

            for namespace_dir in thread_root.iterdir():
                checkpoint_paths = sorted(namespace_dir.glob("*.json"))
                for checkpoint_path in checkpoint_paths[:-1]:
                    checkpoint_path.unlink(missing_ok=True)

    async def aget_tuple(self, config: RunnableConfig) -> CheckpointTuple | None:
        return self.get_tuple(config)

    async def alist(
        self,
        config: RunnableConfig | None,
        *,
        filter: dict[str, Any] | None = None,
        before: RunnableConfig | None = None,
        limit: int | None = None,
    ) -> AsyncIterator[CheckpointTuple]:
        for item in self.list(config, filter=filter, before=before, limit=limit):
            yield item

    async def aput(
        self,
        config: RunnableConfig,
        checkpoint: Checkpoint,
        metadata: CheckpointMetadata,
        new_versions: ChannelVersions,
    ) -> RunnableConfig:
        return self.put(config, checkpoint, metadata, new_versions)

    async def aput_writes(
        self,
        config: RunnableConfig,
        writes: Sequence[tuple[str, Any]],
        task_id: str,
        task_path: str = "",
    ) -> None:
        self.put_writes(config, writes, task_id, task_path)

    async def adelete_thread(self, thread_id: str) -> None:
        self.delete_thread(thread_id)

    async def adelete_for_runs(self, run_ids: Sequence[str]) -> None:
        self.delete_for_runs(run_ids)

    async def acopy_thread(self, source_thread_id: str, target_thread_id: str) -> None:
        self.copy_thread(source_thread_id, target_thread_id)

    async def aprune(self, thread_ids: Sequence[str], *, strategy: str = "keep_latest") -> None:
        self.prune(thread_ids, strategy=strategy)

    def _thread_id(self, config: RunnableConfig) -> str:
        return str(config["configurable"]["thread_id"])

    def _checkpoint_ns(self, config: RunnableConfig) -> str:
        return str(config["configurable"].get("checkpoint_ns", ""))

    def _namespace_dir(self, thread_id: str, checkpoint_ns: str) -> Path:
        thread_root = self.root / thread_id
        return thread_root if not checkpoint_ns else thread_root / checkpoint_ns

    def _checkpoint_path(self, thread_id: str, checkpoint_ns: str, checkpoint_id: str) -> Path:
        return self._namespace_dir(thread_id, checkpoint_ns) / f"{checkpoint_id}.json"

    def _latest_checkpoint_id(self, thread_id: str, checkpoint_ns: str) -> str | None:
        namespace_dir = self._namespace_dir(thread_id, checkpoint_ns)
        if not namespace_dir.exists():
            return None

        checkpoint_ids = sorted(path.stem for path in namespace_dir.glob("*.json"))
        return checkpoint_ids[-1] if checkpoint_ids else None

    def _encode_typed(self, typed_value: tuple[str, bytes]) -> dict[str, str]:
        type_name, value = typed_value
        return {
            "type": type_name,
            "data": base64.b64encode(value).decode("ascii"),
        }

    def _decode_typed(self, typed_value: dict[str, str]) -> tuple[str, bytes]:
        return typed_value["type"], base64.b64decode(typed_value["data"].encode("ascii"))

    def _load_writes(self, path: Path) -> list[dict[str, Any]]:
        if not path.exists():
            return []

        payload = json.loads(path.read_text(encoding="utf-8"))
        return payload.get("writes", [])
