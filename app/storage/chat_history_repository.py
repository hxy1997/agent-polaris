import json
import shutil
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path


def utc_now_iso() -> str:
    return datetime.now(UTC).isoformat()


@dataclass
class ChatHistoryEntry:
    session_id: str
    user_id: str
    scene_id: str
    title: str
    created_at: str
    updated_at: str


class ChatHistoryRepository:
    def __init__(self, session_root: Path):
        self.history_root = session_root / "history"

    def list_entries(self, user_id: str, scene_id: str) -> list[ChatHistoryEntry]:
        path = self._index_path(user_id, scene_id)
        if not path.exists():
            return []

        payload = json.loads(path.read_text(encoding="utf-8"))
        entries = [ChatHistoryEntry(**entry) for entry in payload.get("entries", [])]
        return sorted(entries, key=lambda entry: entry.updated_at, reverse=True)

    def upsert_entry(
        self,
        *,
        session_id: str,
        user_id: str,
        scene_id: str,
        title: str | None = None,
        updated_at: str | None = None,
    ) -> ChatHistoryEntry:
        entries = self.list_entries(user_id, scene_id)
        now = updated_at or utc_now_iso()
        existing = next((entry for entry in entries if entry.session_id == session_id), None)

        if existing is None:
            entry = ChatHistoryEntry(
                session_id=session_id,
                user_id=user_id,
                scene_id=scene_id,
                title=title or "未命名会话",
                created_at=now,
                updated_at=now,
            )
            entries.insert(0, entry)
        else:
            entry = ChatHistoryEntry(
                session_id=existing.session_id,
                user_id=existing.user_id,
                scene_id=existing.scene_id,
                title=title or existing.title,
                created_at=existing.created_at,
                updated_at=now,
            )
            entries = [entry if current.session_id == session_id else current for current in entries]

        self._write_entries(user_id, scene_id, entries)
        return entry

    def get_entry(self, user_id: str, scene_id: str, session_id: str) -> ChatHistoryEntry | None:
        return next(
            (entry for entry in self.list_entries(user_id, scene_id) if entry.session_id == session_id),
            None,
        )

    def find_session(self, user_id: str, session_id: str) -> ChatHistoryEntry | None:
        user_root = self.history_root / user_id
        if not user_root.exists():
            return None

        for scene_dir in user_root.iterdir():
            index_path = scene_dir / "index.json"
            if not index_path.exists():
                continue

            payload = json.loads(index_path.read_text(encoding="utf-8"))
            for entry in payload.get("entries", []):
                if entry.get("session_id") == session_id:
                    return ChatHistoryEntry(**entry)

        return None

    def delete_user(self, user_id: str) -> None:
        user_root = self.history_root / user_id
        if user_root.exists():
            shutil.rmtree(user_root)

    def _index_path(self, user_id: str, scene_id: str) -> Path:
        return self.history_root / user_id / scene_id / "index.json"

    def _write_entries(self, user_id: str, scene_id: str, entries: list[ChatHistoryEntry]) -> None:
        path = self._index_path(user_id, scene_id)
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "entries": [
                {
                    "session_id": entry.session_id,
                    "user_id": entry.user_id,
                    "scene_id": entry.scene_id,
                    "title": entry.title,
                    "created_at": entry.created_at,
                    "updated_at": entry.updated_at,
                }
                for entry in sorted(entries, key=lambda entry: entry.updated_at, reverse=True)
            ]
        }
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
