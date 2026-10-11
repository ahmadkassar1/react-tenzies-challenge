import test from "node:test";
import assert from "node:assert/strict";
import {
  createGame,
  hasWon,
  holdDie,
  improvesRecord,
  rollDice,
} from "../src/game.js";

test("a round starts with ten distinct slots and no held dice", () => {
  const game = createGame(() => 4);
  assert.equal(game.dice.length, 10);
  assert.equal(new Set(game.dice.map((die) => die.id)).size, 10);
  assert.equal(game.rolls, 0);
  assert.ok(game.dice.every((die) => die.value === 4 && !die.isHeld));
});

test("holding and rolling preserve identity, held values and the previous state", () => {
  const original = createGame(() => 3);
  const held = holdDie(original, 2);
  const rolled = rollDice(held, () => 6);
  assert.deepEqual(
    rolled.dice.map((die) => die.id),
    original.dice.map((die) => die.id),
  );
  assert.equal(rolled.dice[2], held.dice[2]);
  assert.equal(rolled.dice[2].value, 3);
  assert.ok(
    rolled.dice.filter((die) => die.id !== 2).every((die) => die.value === 6),
  );
  assert.equal(rolled.rolls, 1);
  assert.ok(original.dice.every((die) => !die.isHeld && die.value === 3));
  assert.equal(holdDie(held, 2).dice[2].isHeld, false);
  assert.equal(holdDie(held, -1), held);
});

test("matching values must all be held to win; completed rounds cannot mutate", () => {
  let game = createGame(() => 2);
  assert.equal(hasWon(game), false);
  for (let id = 0; id < 10; id++) game = holdDie(game, id);
  assert.equal(hasWon(game), true);
  assert.equal(game.rolls, 0);
  assert.equal(holdDie(game, 0), game);
  assert.equal(
    rollDice(game, () => 5),
    game,
  );
  assert.equal(hasWon({ ...game, dice: game.dice.slice(0, 9) }), false);
});

test("all-held mismatched dice do not consume a roll", () => {
  let face = 0;
  let game = createGame(() => (face++ % 6) + 1);
  for (let id = 0; id < 10; id++) game = holdDie(game, id);
  assert.equal(hasWon(game), false);
  assert.equal(
    rollDice(game, () => 1),
    game,
  );
  assert.equal(game.rolls, 0);
  const released = holdDie(game, 4);
  assert.equal(rollDice(released, () => 1).rolls, 1);
});

test("records accept zero and exclude ties and worse scores", () => {
  assert.equal(improvesRecord(0, null), true);
  assert.equal(improvesRecord(0, 1), true);
  assert.equal(improvesRecord(0, 0), false);
  assert.equal(improvesRecord(8, 8), false);
  assert.equal(improvesRecord(9, 8), false);
  assert.equal(improvesRecord(7, 8), true);
});
