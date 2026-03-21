from langchain_core.messages import AIMessageChunk

from app.runtime.chat_runner import stream_chat_chunks


def test_stream_chat_chunks_yields_stream_events():
    class FakeAgent:
        def __init__(self):
            self.calls = []

        def stream(self, payload, *, stream_mode, config):
            self.calls.append((payload, stream_mode, config))
            yield {
                "type": "messages",
                "data": (AIMessageChunk(content="hello"), {"langgraph_node": "model"}),
            }
            yield {
                "type": "messages",
                "data": (AIMessageChunk(content=" world"), {"langgraph_node": "model"}),
            }
            yield {
                "type": "updates",
                "data": {"ignored": True},
            }

    agent = FakeAgent()
    chunks = list(stream_chat_chunks(agent, "Need a follow-up", session_id="session-001"))

    assert chunks == ["hello", " world"]
    payload, stream_mode, config = agent.calls[0]
    assert payload["messages"][0].content == "Need a follow-up"
    assert stream_mode == "messages"
    assert config["configurable"]["thread_id"] == "session-001"


def test_stream_chat_chunks_reads_text_blocks_from_message_content():
    class FakeAgent:
        def stream(self, payload, *, stream_mode, config):
            yield (
                AIMessageChunk(
                    content=[
                        {"type": "text", "text": "hello"},
                        {"type": "tool_call", "name": "ignored"},
                        {"type": "text", "text": " world"},
                    ]
                ),
                {"langgraph_node": "model"},
            )

    chunks = list(stream_chat_chunks(FakeAgent(), "Need a follow-up", session_id="session-001"))

    assert chunks == ["hello", " world"]
