type EmptySceneGuideProps = {
  countdown: number;
  description: string;
  onNavigate: () => void;
  title: string;
};

export function EmptySceneGuide({
  countdown,
  description,
  onNavigate,
  title
}: EmptySceneGuideProps) {
  return (
    <section className="empty-scene-guide glass-surface--strong">
      <div className="empty-scene-guide__content">
        <p className="empty-scene-guide__eyebrow">暂无可用场景</p>
        <h2>{title}</h2>
        <p>{description}</p>
        <div className="empty-scene-guide__actions">
          <button className="admin-button" type="button" onClick={onNavigate}>
            立即前往创建场景
          </button>
          <span>{countdown}s 后自动跳转</span>
        </div>
      </div>
    </section>
  );
}
