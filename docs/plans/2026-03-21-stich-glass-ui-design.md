# Stich Glass UI Design

## Goal

Align the Polaris frontend to the updated Stich design while preserving the current data flow and backend contracts.

The redesign covers both `/chat` and `/admin`.

## Scope

- Rebuild the chat page into a glassmorphism-style workspace with:
  - fixed translucent top navigation
  - 72px left action rail
  - centered hero, composer, and suggestion row
  - preserved chat streaming behavior once a conversation begins
- Rebuild the admin page into an overview-first console with:
  - fixed translucent top header
  - glass scene tree sidebar
  - tabbed content area
  - overview dashboard as the default tab
- Preserve existing logic for:
  - scene loading
  - session creation and streaming
  - scene selection
  - model config editing and saving

## Non-Goals

- No backend API changes
- No new persistence for admin overview metrics
- No new release workflow implementation
- No change to the existing chat request/stream protocol

## Layout Strategy

### Chat

The chat page will move from a single bordered shell to a page-level layout:

- translucent top bar with scene selector and route navigation
- fixed left icon rail
- main content column centered in the viewport
- decorative background glow layers

The content area has two visual states:

- empty state: matches the Stich landing composition with hero, composer card, and suggestion chips
- active conversation state: keeps the same shell and composer, but inserts the message stream above the composer and reduces the hero prominence

### Admin

The admin page will move from stacked edit panels to a console layout:

- fixed translucent admin header with search and actions
- fixed left scene sidebar
- right content area with tab navigation

The default tab is `overview`, which mirrors the new Stich admin overview:

- scene summary card
- access control card
- draft intelligence card
- interaction performance card grid

Existing editing flows remain accessible through secondary tabs.

## Component Mapping

## Shared Layout

- `AppShell` becomes a light routing container instead of a universal header shell.
- Page-level layouts are owned by the route pages.
- Shared visual tokens live in `frontend/src/styles/app.css`.

## Chat Route

- `ChatPage`
  - keeps `useScenes` and `useChatSession`
  - derives the active scene title/description from scene data
  - decides whether to render the landing-oriented empty state or active conversation state
- `ChatShell`
  - becomes the structural container for the hero, conversation block, composer, and suggestions
- `Composer`
  - keeps submit/change semantics
  - updates to the glass card layout from the Stich file
- `SuggestionChips`
  - visually matches the glass chips in the new mock
  - keeps the current non-mutating behavior

## Admin Route

- `AdminPage`
  - adds local tab state with `overview` as default
  - keeps scene detail loading and model config save behavior
- `SceneTree`
  - becomes the fixed glass sidebar grouped into base scenes and business scenes
- `PromptPanel`
  - is repurposed as the `model` tab content
- `SkillPanel`
  - is repurposed as the `skills` tab content
- `WorkspacePanel`
  - is repurposed as the `workspace` tab content
- New overview-only cards render presentational content derived from current scene data and static placeholders

## Data Model and State

- Existing hooks stay unchanged:
  - `useScenes`
  - `useBaseScenes`
  - `useSceneDetail`
  - `useUpdateSceneDetail`
  - `useChatSession`
- New UI-only state:
  - selected admin tab
  - derived chat empty vs active layout mode
- Placeholder overview metrics remain local constants until backend support exists

## Error Handling

- Existing chat error messaging remains visible inside the chat content column
- Model config save state remains tied to the current mutation state
- Missing scene detail falls back to the currently selected scene summary
- Overview cards degrade gracefully when scene detail is not yet loaded

## Responsive Behavior

- Desktop is optimized first to match the Stich composition
- On smaller screens:
  - the chat rail collapses visually and content padding reduces
  - the admin sidebar becomes a top section inside the main flow
  - overview card grids collapse from multi-column to single-column
  - top navigation reduces to essential controls

## Styling System

- Introduce global CSS variables for:
  - primary/secondary text colors
  - glass surfaces
  - border alpha
  - glow gradients
  - shadows
  - radii
- Keep typography aligned to the Stich file:
  - `Inter` for prominent headings
  - `IBM Plex Sans` for body and controls
- Prefer semantic class names over directly copying Tailwind utility strings

## Testing and Verification

- Run the frontend test suite after refactoring
- Manually verify:
  - `/chat` empty state matches the new visual design
  - `/chat` still sends and streams messages
  - `/admin` defaults to the overview tab
  - `/admin` model tab still saves `base_url` and `model_name`
  - scene switching updates admin content
  - narrow layouts remain usable

## Risks

- Large layout changes may break existing test snapshots or query assumptions
- The new admin overview introduces more presentational structure than current data supports, so placeholder content must be clearly bounded
- Shared shell refactors can unintentionally affect both routes if not kept page-local

## Implementation Notes

- Do not modify backend contracts
- Do not wire placeholder admin metrics to fake APIs
- Keep the user-edited `docs/stichui/ui_script.html` as the source visual reference, not an implementation artifact
