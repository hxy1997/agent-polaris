# Stich Glass UI Implementation Plan

1. Refactor the frontend route shell so chat and admin pages own their own layout chrome.
2. Rebuild the chat page structure to match the glassmorphism Stich design while preserving message streaming behavior.
3. Rebuild the admin page into an overview-first console with tabbed secondary panels.
4. Rework shared, chat, and admin CSS into design-token-driven glass surfaces and responsive layouts.
5. Update frontend tests to assert the new information architecture without weakening the existing behavior checks.
6. Run the frontend test suite and fix regressions.
