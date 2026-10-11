# Tenzies

A small React dice game. Hold matching numbers and roll the rest until all ten dice match. Your lowest roll count is saved in this browser.

## Run locally

Use Node.js 24 and npm. The repository includes `.nvmrc` and a committed lockfile.

```sh
git clone https://github.com/ahmadkassar1/react-tenzies-challenge.git
cd react-tenzies-challenge
npm ci --ignore-scripts
npm run dev
```

Open the localhost URL printed by Vite. No environment variables, account or backend are required.

```sh
npm run lint
npm test
npm run build
npm run preview
```

`build` produces the static site in `dist/`. `preview` serves that production build locally. A public deployment is not yet verified; this README intentionally has no placeholder demo link.

## Playing

- Select a die to hold or release it. Held dice keep their value on the next roll.
- Match and hold all ten dice to finish. The completed round stays locked until **New game**.
- If every die is held but the numbers differ, release a die before rolling.
- Fewer rolls is better. A tied score does not count as a new record; a zero-roll win is valid.

Buttons support Enter and Space, with visible focus and distinct die names and pressed states. Victory is announced through a live status region, and focus moves to **New game**, then to the first die on restart. Dice have a minimum 44px target. Short screens scroll naturally. Reduced-motion preferences disable CSS motion and confetti.

## Structure

```text
src/
  App.jsx                    Round state, interaction and focus
  game.js                    Pure dice and record rules
  score-storage.js           Validation and guarded browser persistence
  hooks/useReducedMotion.js  System motion preference subscription
  components/
    GameStats.jsx            Roll count and best score
    dice/Dice.jsx            One accessible die button
  App.css / index.css        Layout and shared styles
tests/                       Game and storage regression tests
.github/workflows/check.yml  Lint, tests and production build
```

The game keeps ten stable slot IDs during a round. Victory is derived from the dice instead of synchronized through an effect. Storage writes happen in the completion interaction. Confetti is loaded only when a win calls for it. There is no global state library or server for this single-screen game.

## Saved scores and limitations

The existing `bestScore` localStorage key is retained. Valid scores are nonnegative safe integers, including zero. Only the best score persists; an unfinished round resets on reload. Nothing is sent to a server or shared between devices.

Denied reads, failed writes and invalid saved values do not stop play. The UI explains when the best score is available only in the current session. Invalid existing data is left unchanged, and unrelated storage keys are never cleared. To repair an invalid value manually, remove only this site's `bestScore` key through browser developer tools, then reload.

Saving rereads the current best before writing, so an observed better score is preserved. There is no live cross-tab synchronization or transactional guarantee for simultaneous writes.

## Verification

Node's built-in test runner checks held values and stable IDs, completed-round locking, ineffective rolls, strict record improvement, zero and malformed scores, denied storage, quota failure and preservation of unrelated data. GitHub Actions runs lint with zero warnings, these tests and the production build on Node 24. Browser interaction and layout checks are separate from these unit tests; they do not certify every device or screen reader.

## License

[MIT](LICENSE). This repair retains the existing project's license and React/CSS foundation.
