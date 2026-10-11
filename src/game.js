export const DICE_COUNT = 10;

function randomFace() {
  return Math.floor(Math.random() * 6) + 1;
}

export function createGame(nextFace = randomFace) {
  return {
    dice: Array.from({ length: DICE_COUNT }, (_, id) => ({
      id,
      value: nextFace(),
      isHeld: false,
    })),
    rolls: 0,
  };
}

export function hasWon(game) {
  return (
    game.dice.length === DICE_COUNT &&
    game.dice.every((die) => die.isHeld && die.value === game.dice[0].value)
  );
}

export function holdDie(game, id) {
  if (hasWon(game) || !game.dice.some((die) => die.id === id)) return game;
  return {
    ...game,
    dice: game.dice.map((die) =>
      die.id === id ? { ...die, isHeld: !die.isHeld } : die,
    ),
  };
}

export function rollDice(game, nextFace = randomFace) {
  if (hasWon(game) || game.dice.every((die) => die.isHeld)) return game;
  return {
    dice: game.dice.map((die) =>
      die.isHeld ? die : { ...die, value: nextFace() },
    ),
    rolls: game.rolls + 1,
  };
}

export function improvesRecord(rolls, best) {
  return best === null || rolls < best;
}
