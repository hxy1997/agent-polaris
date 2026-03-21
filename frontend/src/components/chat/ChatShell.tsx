import type { ReactNode } from "react";

type ChatShellProps = {
  title: string;
  description: string;
  errorMessage?: string | null;
  conversation: ReactNode;
  composer: ReactNode;
  suggestions: ReactNode;
};

export function ChatShell({
  title,
  description,
  errorMessage,
  conversation,
  composer,
  suggestions
}: ChatShellProps) {
  return (
    <section className="chat-shell">
      <div className="chat-shell__hero">
        <p className="chat-shell__label">当前场景</p>
        <h2>{title}</h2>
        <p className="chat-shell__description">{description}</p>
      </div>
      <div className="chat-shell__conversation">{conversation}</div>
      {errorMessage ? <p className="chat-shell__error">{errorMessage}</p> : null}
      <div className="chat-shell__composer">{composer}</div>
      <div className="chat-shell__suggestions">{suggestions}</div>
    </section>
  );
}
