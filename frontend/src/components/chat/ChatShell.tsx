import type { ReactNode, Ref } from "react";

type ChatShellProps = {
  title: ReactNode;
  errorMessage?: string | null;
  composer: ReactNode;
  suggestions?: ReactNode;
  conversation?: ReactNode;
  mode: "conversation" | "landing";
  conversationViewportRef?: Ref<HTMLDivElement>;
  onConversationScroll?: () => void;
};

export function ChatShell({
  title,
  errorMessage,
  composer,
  suggestions,
  conversation,
  mode,
  conversationViewportRef,
  onConversationScroll
}: ChatShellProps) {
  return (
    <section className={`chat-shell chat-shell--${mode}`}>
      <div className="chat-shell__panel">
        <div className="chat-shell__hero">
          <div className="chat-shell__title">{title}</div>
        </div>
        {errorMessage ? <p className="chat-shell__error">{errorMessage}</p> : null}
        {mode === "landing" ? <div className="chat-shell__composer">{composer}</div> : null}
        {mode === "landing" && suggestions ? <div className="chat-shell__suggestions">{suggestions}</div> : null}
        {mode === "conversation" && conversation ? (
          <div
            ref={conversationViewportRef}
            className="chat-shell__conversation"
            onScroll={onConversationScroll}
          >
            {conversation}
          </div>
        ) : null}
      </div>
      {mode === "conversation" ? <div className="chat-shell__dock">{composer}</div> : null}
    </section>
  );
}
