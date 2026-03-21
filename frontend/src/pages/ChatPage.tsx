import { ChatShell } from "../components/chat/ChatShell";
import { Composer } from "../components/chat/Composer";
import { SuggestionChips } from "../components/chat/SuggestionChips";
import "../styles/chat.css";

export function ChatPage() {
  return (
    <ChatShell
      title="Sales Assistant"
      description="Read customer context, organize needs, and turn raw notes into crisp business answers."
      composer={
        <Composer placeholder="Enter a request, customer notes, or product context" />
      }
      suggestions={<SuggestionChips />}
    />
  );
}
