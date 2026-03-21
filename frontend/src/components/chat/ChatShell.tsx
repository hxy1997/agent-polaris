import type { ReactNode, Ref } from "react";

type ChatShellProps = {
  title: string;
  description: string;
  errorMessage?: string | null;
  composer: ReactNode;
  suggestions?: ReactNode;
  conversation?: ReactNode;
  mode: "conversation" | "landing";
  emptyHint?: string;
  conversationViewportRef?: Ref<HTMLDivElement>;
  onConversationScroll?: () => void;
};

export function ChatShell({
  title,
  description,
  errorMessage,
  composer,
  suggestions,
  conversation,
  mode,
  emptyHint,
  conversationViewportRef,
  onConversationScroll
}: ChatShellProps) {
  return (
    <section className={`chat-shell chat-shell--${mode}`}>
      <div className="chat-shell__panel">
        <div className="chat-shell__hero">
          <p className="chat-shell__label">当前场景</p>
          <h2>{title}</h2>
          <p className="chat-shell__description">{description}</p>
          {mode === "landing" && emptyHint ? <p className="chat-shell__empty-hint">{emptyHint}</p> : null}
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
