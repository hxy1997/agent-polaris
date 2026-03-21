from collections.abc import Iterable, Iterator


def stream_chat_chunks(chunks: Iterable[str]) -> Iterator[str]:
    for chunk in chunks:
        yield chunk
