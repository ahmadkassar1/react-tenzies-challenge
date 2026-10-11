import { lazy, Suspense, useEffect, useRef, useState } from "react";
import "./App.css";
import Dice from "./components/dice/Dice";
import GameStats from "./components/GameStats";
import { createGame, hasWon, holdDie, improvesRecord, rollDice } from "./game";
import { readBestScore, saveBestScore } from "./score-storage";
import { useReducedMotion } from "./hooks/useReducedMotion";

const Confetti = lazy(() => import("react-confetti"));

function startSession() {
  return { game: createGame(), record: readBestScore(), newRecord: false };
}

export default function App() {
  const [session, setSession] = useState(startSession);
  const { game, record, newRecord } = session;
  const won = hasWon(game);
  const allHeld = game.dice.every((die) => die.isHeld);
  const reducedMotion = useReducedMotion();
  const rollButton = useRef(null);
  const firstDie = useRef(null);
  const restartRequested = useRef(false);

  useEffect(() => {
    if (won) rollButton.current?.focus();
    else if (restartRequested.current) {
      firstDie.current?.focus();
      restartRequested.current = false;
    }
  }, [won]);

  function toggleDie(id) {
    const nextGame = holdDie(game, id);
    if (nextGame === game) return;
    if (!hasWon(nextGame)) {
      setSession({ ...session, game: nextGame });
      return;
    }
    const improved = improvesRecord(nextGame.rolls, record.score);
    const nextRecord = improved
      ? record.writable
        ? saveBestScore(nextGame.rolls)
        : { ...record, score: nextGame.rolls, improved: true }
      : record;
    setSession({
      game: nextGame,
      record: nextRecord,
      newRecord: improved && nextRecord.improved,
    });
  }

  function handleRoll() {
    if (won) {
      restartRequested.current = true;
      setSession({ game: createGame(), record, newRecord: false });
      return;
    }
    const nextGame = rollDice(game);
    if (nextGame !== game) setSession({ ...session, game: nextGame });
  }

  const announcement = won
    ? `You won in ${game.rolls} ${game.rolls === 1 ? "roll" : "rolls"}!${newRecord ? " New best score." : ""}`
    : allHeld
      ? "All dice are held. Release a die before rolling again."
      : "";

  return (
    <main>
      {won && !reducedMotion && (
        <div aria-hidden="true">
          <Suspense fallback={null}>
            <Confetti
              numberOfPieces={160}
              recycle={false}
              style={{
                position: "fixed",
                pointerEvents: "none",
                width: "100vw",
                height: "100vh",
                zIndex: 3,
              }}
            />
          </Suspense>
        </div>
      )}
      <div className="card">
        <header className="card-header">
          <div className="game-badge" aria-hidden="true">
            🎲 TENZIES 🎲
          </div>
          <h1 className="game-title">
            <span className="title-text">ULTIMATE</span>
            <span className="title-highlight">TENZIES</span>
            <span className="title-text">CHALLENGE</span>
          </h1>
          <p className="game-description" id="game-help">
            Hold matching numbers, then roll the others. Match and hold all ten
            dice to win.
          </p>
        </header>
        <GameStats
          rolls={game.rolls}
          best={record.score}
          saved={record.writable}
        />
        <div className="dices-container">
          <div
            className="dices-wrapper"
            role="group"
            aria-label="Ten dice"
            aria-describedby="game-help"
          >
            {game.dice.map((die, index) => (
              <Dice
                key={die.id}
                {...die}
                position={index + 1}
                disabled={won}
                onToggle={toggleDie}
                buttonRef={index === 0 ? firstDie : undefined}
              />
            ))}
          </div>
        </div>
        <button
          ref={rollButton}
          type="button"
          onClick={handleRoll}
          disabled={!won && allHeld}
          className={`roll-button ${won ? "won" : ""}`}
        >
          <span className="button-shine" aria-hidden="true" />
          <span className="button-text">{won ? "New game" : "Roll dice"}</span>
        </button>
        <div
          className="victory-message"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="victory-text">{announcement}</p>
        </div>
        {newRecord && won && (
          <p className="new-record">
            {record.writable ? "New record!" : "New session record!"}
          </p>
        )}
        <p className="storage-message" role="status">
          {record.message}
        </p>
        <p className="storage-help">
          Only your best score is saved in this browser. An unfinished game
          resets on reload.
        </p>
      </div>
    </main>
  );
}
