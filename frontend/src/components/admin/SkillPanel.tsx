const skills = ["摘要生成", "会议纪要", "竞品简报", "回复起草"];

export function SkillPanel() {
  return (
    <section className="admin-panel glass-surface">
      <header className="admin-panel__header">
        <div>
          <h3>技能绑定</h3>
          <p>控制哪些通用能力来自基础场景继承，哪些能力由业务场景单独管理。</p>
        </div>
      </header>
      <div className="admin-pill-grid">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </section>
  );
}
