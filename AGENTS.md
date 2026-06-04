# Depthbound Project Context for Future Codex Chats

Read this first when starting work in this repo. It is a compact map so future sessions do not need to rediscover the whole project.

## Project Shape

- Browser game, plain HTML/CSS/JS, no framework build step.
- Main playable app: `index.html`.
- Main runtime entry: `src/scripts/app.js`.
- Global state variable is `state`, initialized in `src/scripts/app.js` with `createInitialState()`.
- Most game/state creation helpers live in `src/scripts/app/game-state.js`.
- Most rendering and UI/gameplay action handlers live in `src/scripts/app/rendering-inventory.js`; it is very large and includes travel, village, tavern, store, factions, quest board, road projects, and many home panels.
- Character dialogs, starting/loading/saving adventures, and hero creation are in `src/scripts/app/ui-dialogs-character.js`.
- Save system wrapper is `src/scripts/save.js`.
- World map generator bridge and world normalization are in `src/scripts/app/world-travel.js`.
- Travel event definitions are in `src/scripts/app/travel-events.js`.
- Combat/map mechanics are in `src/scripts/app/combat-map.js`.
- Content registry and content packs live under `src/scripts/content/`.
- Hex world builder app is under `hexagonalworldbuilder/`; the game loads it in a hidden iframe to generate chunks.

## Important Runtime Concepts

- Saves are payloads with `payload.state`; current save schema is managed in `src/scripts/save.js`.
- Old localStorage saves may still exist under `dungeonCrawler.saveSlot.v1.<slot>`.
- File-based saves are `depthbound-slot-<n>.json`.
- New adventures create an initial world during `startNewAdventure()` using `DepthboundWorldTravel.createInitialWorldState(...)`.
- Old saves before world generation can have `state.world === null`.
- `normalizeLoadedState()` in `game-state.js` merges old save state with a fresh baseline.
- `DepthboundWorldTravel.normalizeWorldState(world)` normalizes existing worlds, but returns `null` for missing worlds.
- Travel map rendering uses `renderTravelMap()` and `showTravelMapMenu()` in `rendering-inventory.js`.
- Settlement quest boards derive from generated world chunks:
  - Board state is stored in `state.questFlags.settlementBoards`.
  - Core board helpers start around `settlementBoardState()` in `rendering-inventory.js`.
  - `settlementBoardEnsure(profile)` creates board quests from nearby generated world candidates.
  - Quest targets are detected by `settlementBoardQuestAtHex(hex)`.

## Recent Old-Save World Migration

Old saves with no world map were showing "No world map is available yet." The fix added:

- `ensureWorldForLoadedSave(slotId)` in `src/scripts/app/ui-dialogs-character.js`.
- `loadAdventure(slotId)` now calls that helper after `normalizeLoadedState(...)`.
- `showTravelMapMenu()` in `src/scripts/app/rendering-inventory.js` is now `async` and retries the same helper if `state.world` is still missing.
- The helper creates a world with `DepthboundWorldTravel.createInitialWorldState(...)`, normalizes it, anchors home village state, normalizes `worldDay`, and logs that the old save was upgraded.
- After loading an old save, the player should save once to persist the generated world into the save file.

## Common Local Verification

- Syntax check touched JS:
  - `node --check src\scripts\app\ui-dialogs-character.js`
  - `node --check src\scripts\app\rendering-inventory.js`
- Lightweight local server:
  - `python -m http.server 8000 --bind 127.0.0.1`
  - Open `http://127.0.0.1:8000/index.html`
- Existing playtest server:
  - `node playtest-server.js 8000`
  - Health endpoint: `http://127.0.0.1:8000/playtest-status`
- Browser/playtest artifacts and temp files exist in the repo; do not clean unrelated artifacts unless explicitly asked.

## Git/Workspace Cautions

- The worktree is often dirty with user or generated changes. Do not revert unrelated files.
- `nextprompt.txt` is a task wishlist, not architecture documentation.
- Some useful planning logs are in `implementation notes/`, especially travel/world/faction notes.
- Prefer `rg` for search.
- Use `apply_patch` for manual edits.

## UI/Design Notes

- The app uses a dark fantasy Verdigris-like UI with dense operational panels.
- Do not turn core game screens into marketing/landing pages.
- For frontend work, verify text fit and no panel overlap on desktop and mobile.
- Use existing CSS and UI patterns in `src/styles/main.css`.

## High-Value Search Terms

- Save/load: `loadAdventure`, `saveAdventure`, `normalizeLoadedState`, `payloadForSlot`, `legacyLoad`.
- World: `DepthboundWorldTravel`, `createInitialWorldState`, `normalizeWorldState`, `generateChunk`.
- Travel UI: `showTravelMapMenu`, `renderTravelMap`, `travelOneDay`, `travelResolveStructureEvent`, `travelResolveEmptyHexEvent`.
- Quest boards: `settlementBoardEnsure`, `settlementBoardState`, `settlementBoardQuestAtHex`, `settlementBoardApplyDungeonGoal`.
- Home/village/tavern: `showHomeMenu`, `setHomeMenuPanel`, `tavernGuestsForProfile`, `settlementBoardCardMarkup`.
