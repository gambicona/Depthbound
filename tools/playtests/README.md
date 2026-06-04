# Browser Playtests

Repeatable Playwright scenarios for Depthbound's browser app.

## Run

```bash
npm run playtest:functional
npm run playtest:multiplayer
npm run playtest:all
```

Useful options:

```bash
node tools/playtests/multiplayer-visibility-check.js --port 8011
node tools/playtests/normal-functionality-check.js --port 8013
node tools/playtests/multiplayer-visibility-check.js --no-start --port 8000
node tools/playtests/multiplayer-visibility-check.js --headed
```

## Current Scenarios

`normal-functionality-check.js` verifies the single-player app path:

- world map opens and renders hexes
- faction cards appear in the village directory
- quest-board acceptance mutates state as expected
- accepted board quests appear in the quest log
- home menu opens
- spellbooks render for representative spellcasters
- class and racial abilities render in the Abilities menu
- subclass option metadata exists across the all-class roster
- a promoted sample hero renders active subclass abilities

`multiplayer-visibility-check.js` verifies that a guest can see a progressed host state:

- faction unlocks and reputation values
- faction cards in the village directory
- accepted quest log entries, including quest-board progress
- world hex map discovery, rumors, and travel log data
- read-only protection for quest/faction mutation actions

Each script exits nonzero on failed assertions and prints a JSON report for debugging.

## Next Good Scenarios

- guest assigned hero can move and act only through host intents
- faction first-contact dialogs in host and guest sessions
- completed/claimable quest-board returns after dungeon travel
- travel camp and settlement arrival sync
- mid-combat turn ownership, reactions, and saving throws
