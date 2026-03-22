import { useLayoutEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";

import { AppIcon } from "../common/AppIcon";

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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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

  function handleAttachmentChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
    setIsAttachmentMenuOpen(false);
  }

  function handleImageGeneration() {
    setIsAttachmentMenuOpen(false);
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
      {selectedFiles.length > 0 ? (
        <div className="composer__attachments" aria-label="待发送附件">
          {selectedFiles.map((file) => (
            <span key={`${file.name}-${file.lastModified}`} className="composer__attachment-chip">
              <AppIcon name="file" />
              <span>{file.name}</span>
            </span>
          ))}
        </div>
      ) : null}
      <div className="composer__footer">
        <div className="composer__meta">
          <div className="composer__tools" aria-label="输入扩展能力">
            <div className="composer__tool-group">
              <button
                aria-expanded={isAttachmentMenuOpen}
                aria-label="附件菜单"
                className="composer__tool-trigger"
                disabled={disabled}
                type="button"
                onClick={() => setIsAttachmentMenuOpen((current) => !current)}
              >
                <AppIcon name="plus" />
              </button>
              {isAttachmentMenuOpen ? (
                <div className="composer__tool-menu" role="menu" aria-label="附件菜单">
                  <input
                    ref={fileInputRef}
                    className="visually-hidden"
                    multiple
                    type="file"
                    onChange={handleAttachmentChange}
                  />
                  <button
                    className="composer__tool-menu-item"
                    role="menuitem"
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AppIcon name="paperclip" />
                    <span>附件</span>
                  </button>
                  <button
                    className="composer__tool-menu-item"
                    role="menuitem"
                    type="button"
                    onClick={handleImageGeneration}
                  >
                    <AppIcon name="image" />
                    <span>生成图片</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <button className="composer__submit" disabled={disabled} type="submit">
          <span className="visually-hidden">{isBusy ? "生成中..." : "发送"}</span>
          <AppIcon name="send" />
        </button>
      </div>
    </form>
  );
}
