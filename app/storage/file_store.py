import tomllib
from pathlib import Path

from dotenv import dotenv_values


class FileStore:
    def read_toml(self, path: Path) -> dict:
        with path.open("rb") as handle:
            return tomllib.load(handle)

    def read_env(self, path: Path) -> dict[str, str]:
        if not path.exists():
            return {}

        values = dotenv_values(path)
        return {key: value or "" for key, value in values.items() if key}

    def write_env(self, path: Path, values: dict[str, str]) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        lines = [f"{key}={value}" for key, value in values.items()]
        path.write_text("\n".join(lines) + "\n", encoding="utf-8")
