import tomllib
from pathlib import Path


class FileStore:
    def read_toml(self, path: Path) -> dict:
        with path.open("rb") as handle:
            return tomllib.load(handle)
