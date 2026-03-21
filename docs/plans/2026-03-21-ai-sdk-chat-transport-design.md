# AI SDK Chat Transport Design

## Goal

Migrate the chat page to Vercel AI SDK while preserving the existing FastAPI backend and fixing the current layout behavior:

- Before the first message, the composer must be visually centered in the main viewport.
- After the first message, the conversation becomes the primary layout and the composer stays docked to the bottom.
- The frontend should adopt AI SDK message/state primitives so future work such as attachments can build on a standard chat abstraction.

## Constraints

- The backend currently uses a three-step flow: create session, post message, stream response.
- The backend stream endpoint emits SSE events with JSON payloads shaped like `{ "chunk": "..." }`.
- Existing tests already validate draft restore, keyboard submit behavior, backend error handling, and docked composer switching.
- The worktree is dirty, so changes must stay scoped to the chat surface.

## Options Considered

### 1. Layout-only refactor

Keep the existing custom hook and only repair layout states.

Pros:
- Smallest change.
- Lowest short-term risk.

Cons:
- Keeps a custom chat state model that will need to be replaced later for attachments and richer message parts.

### 2. AI SDK on the frontend with a custom transport

Use `@ai-sdk/react` for chat state and implement a transport that adapts the current backend contract.

Pros:
- Preserves the existing Python backend.
- Unlocks the SDK message model and standard chat lifecycle.
- Keeps future attachment work on the intended abstraction boundary.

Cons:
- Requires protocol adaptation because the backend is not AI SDK-native.
- Error and stream conversion logic must be implemented carefully.

### 3. Full AI SDK protocol migration

Change both frontend and backend to AI SDK UI message stream endpoints.

Pros:
- Cleanest long-term protocol.
- Better alignment with SDK defaults.

Cons:
- Larger backend refactor than needed for this UI correction.

## Approved Direction

Option 2.

## Design

### Frontend chat state

Replace the bespoke `useChatSession` message/status state with AI SDK `useChat`. The hook will still manage the backend session identifier because the current backend does not create sessions inside a single chat POST request.

The hook responsibilities will be:

- ensure a session exists for the active scene before the first send;
- adapt the latest submitted user message into the backend `POST /messages` call;
- convert the backend SSE chunk stream into AI SDK `UIMessageChunk` text events;
- expose `messages`, `status`, `error`, `input`, `setInput`, and `sendMessage`-style helpers to the page.

### Custom transport

Add a dedicated transport implementation on the frontend instead of changing the backend protocol. The transport will:

- inspect the most recent user message from AI SDK `messages`;
- create a backend session on first send;
- submit the latest message to `/api/chat/sessions/{id}/messages`;
- fetch `/api/chat/sessions/{id}/stream`;
- parse SSE `data:` frames;
- emit `text-start`, `text-delta`, and `text-end` chunks to AI SDK.

The transport will throw normalized `Error` instances on failed session creation, message submission, or stream setup.

### Layout states

The page will use an explicit two-state layout:

- `landing`: centered hero, centered composer, centered suggestion chips;
- `conversation`: compact hero, scrollable conversation region, bottom-docked composer.

The switch happens once AI SDK `messages.length > 0`.

### Composer behavior

The composer remains a controlled textarea, but it will become a thinner, more chat-like surface with:

- autosizing-friendly dimensions without a giant empty card at launch;
- a clear primary action;
- attachment affordance placeholder kept visible for future work;
- no duplicated layout logic between landing and docked modes.

### Testing

Update the chat page tests to cover:

- landing state render;
- backend error surfacing through AI SDK integration;
- draft retention on failed send;
- submit on `Enter` and newline on `Option + Enter`;
- transition to docked composer after the first completed send.

## Risks

- AI SDK chunk shape mismatches can break assistant rendering if the transport emits incomplete events.
- Dirty workspace changes in chat files may conflict with the refactor and require careful merge discipline.
- Attachments will still need backend support later; this change only puts the frontend on the right abstraction.
