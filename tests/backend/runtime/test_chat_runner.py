from app.runtime.chat_runner import stream_chat_chunks


def test_stream_chat_chunks_yields_stream_events():
    chunks = list(stream_chat_chunks(["hello", "world"]))

    assert chunks == ["hello", "world"]
