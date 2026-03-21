const suggestions = [
  "Summarize product strengths",
  "Draft a customer reply",
  "Compare against a competitor",
  "Condense meeting notes"
];

export function SuggestionChips() {
  return (
    <div className="suggestion-chips" aria-label="Suggested prompts">
      {suggestions.map((suggestion) => (
        <button key={suggestion} type="button">
          {suggestion}
        </button>
      ))}
    </div>
  );
}
