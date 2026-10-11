export const SCORE_KEY = "bestScore";

function parseScore(raw) {
  if (raw === null) return null;
  if (!/^\d+$/.test(raw)) return undefined;
  const score = Number(raw);
  return Number.isSafeInteger(score) ? score : undefined;
}

export function readBestScore(getStorage = () => window.localStorage) {
  try {
    const score = parseScore(getStorage().getItem(SCORE_KEY));
    if (score === undefined) {
      return {
        score: null,
        writable: false,
        message:
          "The saved best score is invalid. It has been left unchanged. You can still play; new scores will stay in this session.",
      };
    }
    return { score, writable: true, message: "" };
  } catch {
    return {
      score: null,
      writable: false,
      message:
        "Browser storage is unavailable. You can still play; your best score will stay in this session.",
    };
  }
}

export function saveBestScore(score, getStorage = () => window.localStorage) {
  if (!Number.isSafeInteger(score) || score < 0)
    throw new RangeError("Invalid best score");
  const current = readBestScore(getStorage);
  if (!current.writable) return { ...current, score, improved: true };
  const improved = current.score === null || score < current.score;
  const best = current.score === null ? score : Math.min(score, current.score);
  try {
    if (improved) getStorage().setItem(SCORE_KEY, String(best));
    return { score: best, writable: true, message: "", improved };
  } catch {
    return {
      score: best,
      writable: false,
      improved,
      message:
        "Your best score could not be saved. It is available in this session; reloading may lose it.",
    };
  }
}
