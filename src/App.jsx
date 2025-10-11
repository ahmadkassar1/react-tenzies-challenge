import "./App.css";
import Dice from "./components/dice/Dice";
import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import Confetti from "react-confetti";

function App() {
  const [dices, setDices] = useState(generateRandomNumbers);
  const [gameWon, setGameWon] = useState(false);
  const [rolls, setRolls] = useState(0);
  const [bestScore, setBestScore] = useState(
    parseInt(localStorage.getItem("bestScore")) || Infinity
  );

  useEffect(() => {
    console.log("effect", dices);
    if (
      dices.every((dice) => dice.value === dices[0].value) &&
      dices.every((dice) => dice.isHeld === true)
    ) {
      setGameWon(true);
      if (rolls < bestScore) {
        setBestScore(rolls);
        localStorage.setItem("bestScore", rolls);
      }
    } else {
      setGameWon(false);
    }
  }, [dices]);

  function generateRandomNumbers() {
    console.log("generate");
    let arrNumbers = [];
    for (let i = 0; i < 10; i++) {
      arrNumbers.push({
        value: Math.floor(Math.random() * 6) + 1,
        id: nanoid(),
        isHeld: false,
      });
    }
    return arrNumbers;
  }

  function triggerButton(id) {
    setDices((prevDices) =>
      prevDices.map((dice) => {
        return id === dice.id ? { ...dice, isHeld: !dice.isHeld } : dice;
      })
    );
  }

  function rollDice() {
    if (!gameWon) {
      setDices((prevDices) => {
        return prevDices.map((dice) => {
          return dice.isHeld === true
            ? { ...dice, isHeld: true }
            : {
                value: Math.floor(Math.random() * 6) + 1,
                id: nanoid(),
                isHeld: false,
              };
        });
      });
      setRolls((prev) => prev + 1);
    } else {
      setDices(generateRandomNumbers());
      setRolls(0);
    }
  }

  const dicesElements = dices.map((dice) => (
    <Dice key={dice.id} {...dice} triggerButton={triggerButton} />
  ));

  return (
    <>
      <main>
        {gameWon && <Confetti numberOfPieces={500} recycle={false} />}
        <div className="background-glow"></div>
        <div className="card">
          <div className="card-header">
            <div className="game-badge">🎲 TENZIES 🎲</div>
            <h1 className="game-title">
              <span className="title-text">ULTIMATE</span>
              <span className="title-highlight">TENZIES</span>
              <span className="title-text">CHALLENGE</span>
            </h1>
            <p className="game-description">
              {gameWon
                ? "🎉 VICTORY! You're a Tenzies Master! 🎉"
                : "Lock matching numbers and roll to victory!"}
            </p>
          </div>

          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-label">ROLLS</span>
              <span className="stat-value">{rolls}</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-label">BEST</span>
              <span className="stat-value">
                {bestScore === Infinity ? "--" : bestScore}
              </span>
            </div>
          </div>

          <div className="dices-container">
            <div className="dices-wrapper">{dicesElements}</div>
          </div>

          <button
            onClick={rollDice}
            className={`roll-button ${gameWon ? "won" : ""}`}
          >
            <span className="button-shine"></span>
            <span className="button-text">
              {gameWon ? "🎮 NEW GAME 🎮" : "🎲 ROLL DICE 🎲"}
            </span>
          </button>

          {gameWon && (
            <div className="victory-message">
              <p className="victory-text">You won in {rolls} rolls!</p>
              {rolls === bestScore && rolls > 0 && (
                <p className="new-record">🏆 NEW RECORD! 🏆</p>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default App;
