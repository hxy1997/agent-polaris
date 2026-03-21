const suggestions = [
  "总结产品优势",
  "起草客户回复",
  "对比竞品方案",
  "压缩会议纪要"
];

export function SuggestionChips() {
  return (
    <div className="suggestion-chips" aria-label="建议提示词">
      {suggestions.map((suggestion) => (
        <button key={suggestion} type="button">
          {suggestion}
        </button>
      ))}
    </div>
  );
}
