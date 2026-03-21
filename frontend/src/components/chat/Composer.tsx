import { useLayoutEffect, useRef, type KeyboardEvent } from "react";

type ComposerProps = {
  disabled?: boolean;
  isBusy?: boolean;
  onChange: (nextValue: string) => void;
  onSubmit: () => void;
  placeholder: string;
  value: string;
  variant?: "dock" | "landing";
};

export function Composer({
  disabled = false,
  isBusy = false,
  onChange,
  onSubmit,
  placeholder,
  value,
  variant = "landing"
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }, [value]);

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if (event.key !== "Enter" || event.altKey) {
      return;
    }

    event.preventDefault();
    onSubmit();
  }

  return (
    <form
      className={`composer composer--${variant} glass-surface`}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="visually-hidden" htmlFor="chat-composer">
        向 Polaris 提问
      </label>
      <div className="composer__body">
        <textarea
          ref={textareaRef}
          disabled={disabled}
          id="chat-composer"
          className="composer__input"
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={variant === "landing" ? 2 : 1}
          value={value}
        />
      </div>
      <div className="composer__footer">
        <div className="composer__meta">
          <div className="composer__tools" aria-label="输入扩展能力">
            <button className="composer__tool-button" disabled={disabled} type="button">
              <span aria-hidden="true" className="material-symbols-outlined">
                attach_file
              </span>
              <span>附件</span>
            </button>
            <button className="composer__tool-button" disabled={disabled} type="button">
              <span aria-hidden="true" className="material-symbols-outlined">
                link
              </span>
              <span>链接</span>
            </button>
          </div>
          <p className="composer__hint">Enter 发送，Option + Enter 换行</p>
        </div>
        <button className="composer__submit" disabled={disabled} type="submit">
          <span>{isBusy ? "生成中..." : "发送"}</span>
          <span aria-hidden="true" className="material-symbols-outlined">
            north_east
          </span>
        </button>
      </div>
    </form>
  );
}
