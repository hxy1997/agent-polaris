type SuggestionChipsProps = {
  onSelect?: (suggestion: string) => void;
  suggestions: string[];
};

export function SuggestionChips({ onSelect, suggestions }: SuggestionChipsProps) {
  return (
    <div className="suggestion-chips" aria-label="建议提示词">
      {suggestions.map((suggestion) => (
        <button key={suggestion} onClick={() => onSelect?.(suggestion)} type="button">
          {suggestion}
        </button>
      ))}
    </div>
  );
}
