# Story Campaign Dungeon Implementation Notes

Use this checklist when creating hand-built story campaign dungeons like the Barrow Crown dungeons.

## Start From The Campaign Rules

- Match the campaign slot exactly: `campaigns/<campaign-folder>/DungeonN.json`.
- Keep the top-level id aligned with the file and campaign order, for example `the-barrow-crown-dungeon-5`.
- Use the campaign's existing theme unless the story clearly needs another theme.
- Prefer hand-built layout JSON for story dungeons over generator output when the dungeon has named rooms, story beats, or custom goals.
- Keep player-facing names clean. Avoid implementation terms like `custom-item-1`, `linear generator`, `AI ally`, or raw theme names.

## Layout Rules

- Make the room layout readable as a place, not only a combat grid. Each room should have a clear narrative purpose.
- Use normal doors between rooms and corridors unless the story specifically calls for an open arch, broken wall, or hidden entrance.
- Every top-level dungeon door must:
  - sit on a room cell,
  - point to an adjacent corridor cell,
  - have a matching counterpart on the connected room where appropriate.
- After editing, validate:
  - no bad door-to-corridor adjacency,
  - no objects on door cells,
  - no monsters on blocked objects,
  - no object overlaps,
  - path exists from start to exit.
- If using multi-cell furniture, always check its footprint after rotation. Width/height mistakes are easy, especially for organs, bars, carpets, altars, and large tables.

## Object Placement

- Cabinets, shelves, reliquaries, wardrobes, wall trophies, wall candles, and similar objects should usually be against walls.
- Tables, altars, organs, rugs, fountains, and ceremonial pieces may be central if the room is designed around them.
- Do not block required doors, corridors, stairs, bells, quest objects, or exit paths with furniture.
- Large centerpiece objects need enough walkable space around them for inspection and interaction.
- If a story object is meant to be interacted with, make sure its furniture definition is `inspectable` or otherwise exposes its interaction in the object menu.

## Quest Goals

- Use goals the engine already supports unless the story genuinely needs new mechanics.
- For "collect X ritual objects" goals, prefer:
  - `type: "collectItemCount"`,
  - a custom quest item with a readable name,
  - `consumeOnComplete: true` if the item should be used up when the ritual/door opens.
- If the goal is simply to defeat the final enemy, use `type: "killBoss"` and do not invent fake collection text.
- Make goal hints player-facing:
  - good: "Find and ring the three funeral bells."
  - bad: "Collect custom-item-1."
- If the exit should not work until the goal is done, make sure the goal text tells the player what remains.

## Loot

- Use existing magic item ids when an item is already implemented, especially campaign-specific items.
- Avoid duplicate main rewards in both a chest and boss loot unless the story wants two copies.
- Put main story loot on the boss, final chest, or final altar in a way that matches the narrative.
- Custom quest items should usually have `customDungeonItem: true`, `sell.rate: 0`, and `not-for-random-store` tags.
- Match loot value and rarity to the intended party tier.

## Monsters

- Verify every `monsterId` exists in `src/scripts/content/monsters`.
- Match difficulty to the campaign step and party expectation. For Barrow Crown 4-5, mostly Category 2 enemies are appropriate.
- Do not overuse one monster family unless the story calls for it. Mix skeletal, zombie, ghost, ghoul, wraith, caster, and brute roles for undead dungeons.
- Boss names should describe the story role, not the template id.
- Avoid generic ids like `zombie` unless they are confirmed registered content ids.

## Story Text

- Intro and outro should use paragraphs. Avoid giant blocks of text.
- Keep quest goals at the end of the intro in direct player language.
- Use important NPC names, faction names, relics, and locations consistently.
- Clean obvious typos while preserving the user's intended voice and story.
- Do not expose DM-only notes in player-facing text. Turn them into implemented mechanics or leave them out.
- Story triggers should mark major room reveals, not every room.

## Special Furniture And Music

- New dungeon furniture belongs in `src/scripts/content/furniture/dungeon-furniture-pack.js` unless it is home decor.
- Asset path convention for furniture art is `assets/furniture/<furniture-id>.png`.
- Instrument music currently uses `assets/sounds/music/instruments/<instrument-name>.mp3` unless the definition points somewhere else.
- For magical instruments that anyone can play, add `magicalAutoplay: true` to the `playableInstrument` component.
- After adding a playable furniture piece, verify the object menu shows Music and the button is enabled while standing adjacent.

## Validation Commands

Run at least:

```powershell
node --check src\scripts\content\furniture\dungeon-furniture-pack.js
node --check src\scripts\app\rendering-inventory.js
```

For each new hand-built dungeon, run a local JSON geometry validation script that checks:

- JSON parses.
- Door-to-corridor adjacency is valid.
- Door cells belong to their room.
- Object footprints are on walkable cells.
- Objects do not overlap.
- Objects are not on doors.
- Monsters are on walkable, unblocked cells.
- Start can path to exit.
- All monster ids exist.

## Common Mistakes To Avoid

- Rotating width and height the wrong way.
- Placing shelves/cabinets in the middle of rooms.
- Forgetting to remove placeholder goals like `custom-item-1`.
- Leaving duplicate main loot in a boss and chest.
- Using a monster id that sounds plausible but is not registered.
- Letting a lantern, pew, chest, or altar cover a door.
- Writing player-facing text that mentions implementation mechanics.
- Assuming old dungeon saves are the problem when the source JSON itself still has layout issues.
