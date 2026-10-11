import test from "node:test";
import assert from "node:assert/strict";
import {
  readBestScore,
  saveBestScore,
  SCORE_KEY,
} from "../src/score-storage.js";

function memoryStore(raw = null) {
  const data = new Map([["unrelated", "keep me"]]);
  if (raw !== null) data.set(SCORE_KEY, raw);
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  };
}

test("missing and valid legacy scores load, including zero", () => {
  assert.deepEqual(
    readBestScore(() => memoryStore()),
    { score: null, writable: true, message: "" },
  );
  for (const raw of ["0", "15", String(Number.MAX_SAFE_INTEGER)]) {
    assert.equal(readBestScore(() => memoryStore(raw)).score, Number(raw));
  }
});

test("invalid values remain untouched and saving is paused", () => {
  for (const raw of [
    "",
    "-5",
    "3broken",
    "1.5",
    "1e3",
    "Infinity",
    "{}",
    "9007199254740992",
  ]) {
    const storage = memoryStore(raw);
    const loaded = readBestScore(() => storage);
    assert.equal(loaded.score, null);
    assert.equal(loaded.writable, false);
    assert.ok(loaded.message);
    const saved = saveBestScore(4, () => storage);
    assert.equal(saved.writable, false);
    assert.equal(storage.data.get(SCORE_KEY), raw);
  }
});

test("denied storage access and denied reads do not throw", () => {
  const deniedGetter = () => {
    throw new Error("Denied getter");
  };
  const deniedRead = () => ({
    getItem() {
      throw new Error("Denied read");
    },
  });
  for (const getStorage of [deniedGetter, deniedRead]) {
    assert.equal(readBestScore(getStorage).writable, false);
    const saved = saveBestScore(0, getStorage);
    assert.equal(saved.score, 0);
    assert.equal(saved.writable, false);
  }
});

test("quota failure retains the previous saved score and the new session score", () => {
  const storage = memoryStore("12");
  storage.setItem = () => {
    throw new Error("Quota exceeded");
  };
  const result = saveBestScore(5, () => storage);
  assert.equal(result.score, 5);
  assert.equal(result.writable, false);
  assert.ok(result.message.includes("could not be saved"));
  assert.equal(storage.data.get(SCORE_KEY), "12");
});

test("save rechecks the latest score and writes only the existing score key", () => {
  const storage = memoryStore("3");
  assert.equal(saveBestScore(8, () => storage).score, 3);
  assert.equal(storage.data.get(SCORE_KEY), "3");
  assert.equal(saveBestScore(0, () => storage).score, 0);
  assert.equal(storage.data.get(SCORE_KEY), "0");
  assert.equal(storage.data.get("unrelated"), "keep me");
  assert.equal(storage.data.size, 2);
  assert.equal(readBestScore(() => storage).score, 0);
});

test("invalid scores cannot be written", () => {
  const storage = memoryStore("12");
  for (const score of [-1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => saveBestScore(score, () => storage), RangeError);
  }
  assert.equal(storage.data.get(SCORE_KEY), "12");
});

test("an already-saved tie is not reported as a new record or written again", () => {
  const storage = memoryStore("5");
  storage.setItem = () => {
    throw new Error("An equal score does not need a write");
  };
  const result = saveBestScore(5, () => storage);
  assert.equal(result.score, 5);
  assert.equal(result.improved, false);
  assert.equal(result.writable, true);
  assert.equal(result.message, "");
});
