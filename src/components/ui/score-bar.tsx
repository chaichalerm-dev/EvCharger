type ScoreBarProps = {
  label: string;
  value: number;
  compact?: boolean;
};

function scoreTone(value: number) {
  if (value >= 75) return "strong";
  if (value >= 60) return "medium";
  return "weak";
}

export function ScoreBar({ label, value, compact = false }: ScoreBarProps) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));

  return <div className={`score-bar score-${scoreTone(safeValue)} ${compact ? "compact" : ""}`}>
    <div className="score-bar-heading">
      <span>{label}</span>
      <strong>{safeValue}<small>/100</small></strong>
    </div>
    <div
      className="score-bar-track"
      role="progressbar"
      aria-label={`${label}: ${safeValue} out of 100`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
    >
      <b style={{ width: `${safeValue}%` }} />
      <i className="score-marker marker-60" aria-hidden="true" />
      <i className="score-marker marker-75" aria-hidden="true" />
    </div>
  </div>;
}
