import { ChatShell } from "../components/chat/ChatShell";
import { Composer } from "../components/chat/Composer";
import { SuggestionChips } from "../components/chat/SuggestionChips";
import { useScenes } from "../hooks/useScenes";
import "../styles/chat.css";

export function ChatPage() {
  const { data: scenes = [] } = useScenes();
  const activeScene = scenes[0];
  const title = activeScene?.name ?? "Loading scene";
  const description = activeScene
    ? "Read customer context, organize needs, and turn raw notes into crisp business answers."
    : "Loading the latest published scene configuration.";

  return (
    <ChatShell
      title={title}
      description={description}
      composer={
        <Composer placeholder="Enter a request, customer notes, or product context" />
      }
      suggestions={<SuggestionChips />}
    />
  );
}
