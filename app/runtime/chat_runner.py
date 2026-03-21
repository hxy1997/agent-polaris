from collections.abc import Iterator

from langchain_core.messages import HumanMessage


def _iter_text_chunks(content: object) -> Iterator[str]:
    if isinstance(content, str):
        if content:
            yield content
        return

    if not isinstance(content, list):
        return

    for block in content:
        if isinstance(block, str) and block:
            yield block
            continue

        if not isinstance(block, dict):
            continue

        text = block.get("text")
        if isinstance(text, str) and text:
            yield text


def stream_chat_chunks(agent, user_message: str, *, session_id: str) -> Iterator[str]:
    for part in agent.stream(
        {"messages": [HumanMessage(content=user_message)]},
        stream_mode="messages",
        config={"configurable": {"thread_id": session_id}},
    ):
        if isinstance(part, tuple):
            message, _metadata = part
        elif isinstance(part, dict) and part.get("type") == "messages":
            message, _metadata = part["data"]
        else:
            continue

        yield from _iter_text_chunks(getattr(message, "content", ""))
