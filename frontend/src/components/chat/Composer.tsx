type ComposerProps = {
  disabled?: boolean;
  isBusy?: boolean;
  onChange: (nextValue: string) => void;
  onSubmit: () => void;
  placeholder: string;
  value: string;
};

export function Composer({
  disabled = false,
  isBusy = false,
  onChange,
  onSubmit,
  placeholder,
  value
}: ComposerProps) {
  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="composer__label" htmlFor="chat-composer">
        Ask Polaris
      </label>
      <textarea
        disabled={disabled}
        id="chat-composer"
        className="composer__input"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
        value={value}
      />
      <div className="composer__actions">
        <button disabled={disabled} type="button">
          Attach
        </button>
        <button disabled={disabled} type="button">
          Tools
        </button>
        <button className="composer__submit" disabled={disabled} type="submit">
          {isBusy ? "Streaming..." : "Send"}
        </button>
      </div>
    </form>
  );
}
