# Chat History Checkpointer Design

## Goal

Persist chat history by `user_id + scene_id` on the filesystem while keeping `deepagents` and `LangGraph` as the runtime source of truth for resumable thread state.

## Decision

Use a hybrid persistence model:

- `LangGraph checkpointer` stores thread state and message history for a session.
- a lightweight filesystem index stores list metadata for history browsing.

This avoids storing full message bodies twice while still supporting:

- history listing by `user_id + scene_id`
- session restore
- future interrupt / resume
- default titles derived from the first user message

## Storage Layout

### Thread state

- Location: `sessions/checkpoints/<session_id>/...`
- Owner: custom file-based `BaseCheckpointSaver`
- Purpose: persist `LangGraph` checkpoints and pending writes for each `thread_id=session_id`

### History index

- Location: `sessions/history/<user_id>/<scene_id>/index.json`
- Purpose: store compact metadata for UI browsing

Each index entry contains:

- `session_id`
- `user_id`
- `scene_id`
- `title`
- `created_at`
- `updated_at`

The title defaults to the first user message content, truncated for UI display if needed.

If `user_id` is not provided, the backend normalizes it to `"0000"`.

## Backend API

### Existing endpoints

- `POST /api/chat/sessions`
  - accept optional `user_id`
  - create session
  - initialize history index entry

- `GET /api/chat/sessions/{session_id}`
  - include enough metadata to validate ownership if needed later

- `POST /api/chat/sessions/{session_id}/messages`
  - accept optional `user_id`
  - validate session ownership
  - update title if this is the first user message

- `GET /api/chat/sessions/{session_id}/stream`
  - after the stream finishes, metadata `updated_at` is refreshed

### New endpoints

- `GET /api/chat/history?scene_id=...&user_id=...`
  - returns history entries for one user and one scene
  - sorted by `updated_at desc`

- `GET /api/chat/sessions/{session_id}/messages?user_id=...`
  - restores message history from the checkpointer-backed thread state
  - returns UI-friendly messages for the frontend

## Runtime Integration

`build_deep_agent()` will receive a shared file-based checkpointer instance.

When invoking the agent:

- `thread_id = session_id`
- the graph writes thread state through the checkpointer

Session restore reads from the latest checkpoint tuple and converts saved LangGraph / LangChain messages into the API schema used by the frontend.

## Frontend Changes

- stop treating history as in-memory only
- send `user_id` on chat requests, defaulting to `"0000"` for now
- fetch history list from the backend when the history panel opens
- restore a conversation by calling the new messages endpoint
- continue using the first user message as the displayed title

## Error Handling

- missing `user_id` maps to `"0000"`
- requesting history for an unknown scene returns an empty list
- requesting a session that does not belong to the provided user returns `404`
- corrupted checkpoint or index files return `500` with a clear backend log message

## Testing

### Backend

- file checkpointer round-trip
- create session with default and explicit `user_id`
- history list filtered by `scene_id + user_id`
- first user message updates title
- restored messages come from checkpoint state

### Frontend

- history panel fetches backend list
- clicking a history item restores backend messages
- history remains separated across scenes

## Follow-up

This design keeps resumable runtime state in `LangGraph` while keeping the UI history model thin. If the product later moves to SQLite or Postgres, the history index can migrate independently from the checkpointer implementation.
