const skills = ["Summarize", "Meeting Notes", "Competitor Brief", "Reply Drafting"];

export function SkillPanel() {
  return (
    <section className="admin-panel">
      <header>
        <h3>Skill bindings</h3>
        <p>Control which reusable capabilities are inherited and which are scene-owned.</p>
      </header>
      <div className="admin-pill-grid">
        {skills.map((skill) => (
          <span key={skill}>{skill}</span>
        ))}
      </div>
    </section>
  );
}
