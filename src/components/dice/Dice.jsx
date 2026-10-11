import "./Dice.css";

export default function Dice({
  id,
  value,
  isHeld,
  position,
  disabled,
  onToggle,
  buttonRef,
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => onToggle(id)}
      disabled={disabled}
      aria-label={`Die ${position}, value ${value}`}
      aria-pressed={isHeld}
      className={`dice ${isHeld ? "held" : ""}`}
    >
      <span className="dice-inner" aria-hidden="true">
        <span className="dice-value">{value}</span>
        {isHeld && <span className="lock-icon">🔒</span>}
      </span>
      <span className="dice-glow" aria-hidden="true" />
    </button>
  );
}
