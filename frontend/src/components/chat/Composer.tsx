type ComposerProps = {
  placeholder: string;
};

export function Composer({ placeholder }: ComposerProps) {
  return (
    <form className="composer">
      <label className="composer__label" htmlFor="chat-composer">
        Ask Polaris
      </label>
      <textarea
        id="chat-composer"
        className="composer__input"
        placeholder={placeholder}
        rows={5}
      />
      <div className="composer__actions">
        <button type="button">Attach</button>
        <button type="button">Tools</button>
        <button className="composer__submit" type="submit">
          Send
        </button>
      </div>
    </form>
  );
}
