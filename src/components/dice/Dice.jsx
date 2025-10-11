import "./Dice.css";

export default function Dice(dice) {
  return (
    <button
      onClick={() => dice.triggerButton(dice.id)}
      className={`dice ${dice.isHeld ? "held" : ""}`}
    >
      <div className="dice-inner">
        <span className="dice-value">{dice.value}</span>
        {dice.isHeld && <div className="lock-icon">🔒</div>}
      </div>
      <div className="dice-glow"></div>
    </button>
  );
}