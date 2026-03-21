const suggestions = [
  "总结产品优势",
  "起草客户回复",
  "对比竞品方案",
  "压缩会议纪要"
];

type SuggestionChipsProps = {
  onSelect?: (suggestion: string) => void;
};

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
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
