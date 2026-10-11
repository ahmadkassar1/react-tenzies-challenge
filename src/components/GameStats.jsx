export default function GameStats({ rolls, best, saved }) {
  return (
    <dl className="stats-bar">
      <div className="stat-item">
        <dt className="stat-label">Rolls</dt>
        <dd className="stat-value">{rolls}</dd>
      </div>
      <div className="stat-item">
        <dt className="stat-label">{saved ? "Best" : "Session best"}</dt>
        <dd className="stat-value">{best ?? "—"}</dd>
      </div>
    </dl>
  );
}
