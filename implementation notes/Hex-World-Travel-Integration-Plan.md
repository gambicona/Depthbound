# Hex World Travel Integration Plan

Date: 2026-05-31

## Vision

Tie the `hexagonalworldbuilder` into Depthbound as an overworld travel layer between Home, Village, camp, random encounters, structures, and dungeon runs.

Current loop:

`Home -> choose dungeon from menu -> dungeon run -> return home`

Target loop:

`Home village -> Travel map -> route/day events -> camp/rest -> structure/encounter/dungeon -> continue route or return home`

Keep the existing dungeon engine intact. The world map decides where the party is, what terrain they cross, and which event or structure they encounter. Existing dungeon start/state builders should still create the actual tactical dungeon.

## Main Player Flow

1. Starting a new adventure creates a first `10x10` hex world chunk at `0,0`, using the big-world implementation.
2. The heroes' home is anchored to the village closest to the middle of chunk `0,0`.
   - Must be a village, not a city.
   - If generation produces no valid village, force-place a village near the center on suitable land.
3. The current Home room stays as the interior hero home.
4. The Home menu gains a `Travel` option.
5. `Travel` opens a scrollable world map view.
6. The map shows:
   - Current party location.
   - Home village marker.
   - Biomes.
   - Structures.
   - Planned route.
   - Tooltips for hovered biomes and structures.
7. The player can select an adjacent hex for one-day travel, or chain adjacent hexes into a longer route.
8. Confirming the route starts travel.
9. Each hex costs one day.
10. Empty hexes may trigger:
    - Random dungeon run of appropriate theme and size.
    - Small text encounter with checks.
    - Nothing.
11. Each evening, the party reaches camp.
12. Camp allows:
    - Long rest.
    - Forage.
    - Review/change route.
    - Continue travel.
    - Manage small tent comfort items later.
13. Arriving at structures opens structure-specific actions, events, dungeons, or boss fights.

## Existing Code Hooks

Useful current hooks:

- `index.html`
  - Home menu currently has `Village`, `Build Your Home`, and `Adventure`.
  - Add `Travel` near those buttons.
- `src/scripts/app/bootstrap.js`
  - Add DOM binding for the travel button and travel overlay elements.
- `src/scripts/app.js`
  - Add `els.goTravel` click handler.
  - Add overlay close/click/input handlers.
- `src/scripts/app/ui-dialogs-character.js`
  - `startNewAdventure()` creates the initial character/home state.
  - Add initial world generation here.
  - Existing dungeon start functions can be reused by travel.
- `src/scripts/app/game-state.js`
  - `createHomeState()` builds Home mode.
  - `createDungeonStateForParty()` builds generated dungeon states.
  - `createCustomDungeonStateFromTemplate()` builds custom/campaign/one-shot dungeon states.
  - `worldDay` already exists.
  - `advanceWorldDay(days)` already exists.
  - `partyResources` already exists and is good for rations.
  - `normalizeLoadedState()` is the save migration point.
- `hexagonalworldbuilder/app.js`
  - `currentChunkData()` gives the exportable chunk shape.
  - `createWorldProject()` gives big-map project shape.
  - `chunkKey()` gives chunk identity.
  - `generateCurrentChunk()` and surrounding helpers are the generation logic to extract or port.
- `src/scripts/shared/world-name-generator.js`
  - Shared browser-safe label generator exposed as `window.DepthboundWorldNames`.
  - Use this from both the builder and the main game for villages, cities, lakes, rivers, ruins, shrines, caves, burrows, camps, roads, regions, and landmarks.
  - Names should be generated once when a world feature is created, then saved/exported as part of world data.

## Proposed State Shape

Add this to save state:

```js
state.world = {
  version: 1,
  chunkWidth: 10,
  chunkHeight: 10,
  currentHex: { chunkX: 0, chunkY: 0, row: 5, col: 5 },
  homeHex: { chunkX: 0, chunkY: 0, row: 4, col: 5 },
  homeVillageId: "village-0,0-4,5",
  chunks: {
    "0,0": {
      width: 10,
      height: 10,
      tiles: [],
      climateGrid: [],
      middleObjects: [],
      rivers: [],
      roads: [],
      paths: []
    }
  },
  namedFeatures: {},
  discoveredHexes: {},
  visitedStructures: {},
  travelPlan: [],
  routeHistory: []
};
```

Future expansion:

```js
state.camp = {
  hex: { chunkX: 0, chunkY: 0, row: 5, col: 6 },
  routeRemaining: [],
  tents: {
    hero: { comfortItems: [] }
  },
  watchAssignments: [],
  lastForageResult: null
};
```

## World Generation Strategy

First pass:

1. Extract or port the minimal generator from `hexagonalworldbuilder/app.js`.
2. Generate only chunk `0,0` at adventure start.
3. Store it in `state.world.chunks["0,0"]`.
4. Use existing tile ids and structure ids so the builder and game speak the same language.
5. Label generated structures and named natural features with the shared name generator before saving the chunk.

Later:

1. Generate neighboring chunks lazily when the party approaches chunk edges.
2. Preserve world climate/elevation parameters so chunk borders match.
3. Let the player export/import generated world projects between builder and game.

## Shared World Labeler

The shared name generator lives at:

`src/scripts/shared/world-name-generator.js`

It exposes:

```js
window.DepthboundWorldNames.generateName(kind, options);
window.DepthboundWorldNames.generateMany(kind, count, options);
window.DepthboundWorldNames.nameFeature(feature, options);
window.DepthboundWorldNames.structureKind(tileId);
window.DepthboundWorldNames.biomeGroup(tileOrGroup);
```

Use it as the single source for generated names in both apps:

- `hexagonalworldbuilder` uses it while generating/exporting chunks.
- Main game uses it when creating new chunks, importing old unnamed maps, or migrating old saves.
- The generator itself stays shared and pure: no DOM dependency, no game-state dependency, no builder-state dependency.

Important rule:

Generate labels once and persist them. Do not call the generator every render, or the same village/lake may appear with a different name later.

Structure label fields:

```js
{
  tile: "village_forest",
  layer: "structures",
  generatedCell: { row: 4, col: 5 },
  name: "Mossford",
  nameKind: "village",
  generatedName: true
}
```

Natural feature labels:

```js
world.namedFeatures = {
  "lake:0,0:lake-1": {
    id: "lake:0,0:lake-1",
    kind: "lake",
    name: "Lake Veyra",
    hexes: [{ chunkX: 0, chunkY: 0, row: 2, col: 6 }]
  },
  "river:0,0:river-1": {
    id: "river:0,0:river-1",
    kind: "river",
    name: "River Ashbrook",
    points: []
  }
};
```

Deterministic seed convention:

```js
DepthboundWorldNames.generateName("village", {
  seed: "structure:0,0:4,5:village_forest",
  biome: "forest_normal"
});
```

Suggested feature kinds:

- Settlements: `village`, `hamlet`, `town`, `city`, `harbor`.
- Water: `lake`, `river`.
- Wild features: `forest`, `swamp`, `mountain`, `region`, `island`.
- Structures: `ruin`, `shrine`, `cave`, `burrow`, `camp`, `castle`, `battlefield`, `road`.

Builder export/import should preserve existing `name`, `nameKind`, and `generatedName` fields. If imported map data lacks names, the main game can fill them during `normalizeWorldState()`.

## Home Village Selection

Algorithm:

1. Search chunk `0,0` structures.
2. Keep structures whose tile id starts with `village`.
3. Exclude structures whose tile id starts with `city`.
4. Find the closest village to the center of a 10x10 chunk.
5. Set `homeHex` and `currentHex` to that village's hex.
6. If no village exists, force-place one near the center.

Village candidates from builder include things like:

- `village`
- `village_farming`
- `village_hamlet`
- `village_fishing`
- `village_forest`
- `village_desert`
- `village_mountain`
- `village_swamp`
- `village_arctic`
- `village_jungle`

## Travel UI

Add a full-screen or large dialog overlay:

```html
<div id="travel-map-menu" class="fighter-info hidden" role="dialog" aria-modal="true">
  ...
</div>
```

Initial MVP controls:

- Close.
- Confirm route.
- Clear route.
- Return to home village if already at home.
- Scrollable map surface.
- Tooltip panel.
- Route summary: days, rations needed, destination.

Map display:

- Use a CSS/DOM hex grid first for speed of implementation.
- Use builder tile images if straightforward.
- Otherwise use colored biome hexes first, then add art once behavior works.

Required markers:

- Current party location.
- Home village.
- Selected route.
- Structures.
- Unavailable/non-adjacent hex feedback.

Tooltip content:

- Biome name.
- Structure name, if present.
- Travel cost: 1 day.
- Risk hint.
- Likely event type.
- Current/home markers if applicable.

## Route Rules

MVP:

- Player can only add a hex adjacent to current location or adjacent to the last planned route hex.
- Each hex = 1 day.
- Route can be cleared.
- Route can be edited from camp each evening.
- No automatic pathfinding yet.

Later:

- Click destination to auto-path.
- Roads reduce encounter risk or food cost.
- Mountains/swamps/desert/arctic may add DC or require supplies.
- Rivers/oceans require bridge, ford, boat, or special event.

## Travel Resolution

Route confirmation starts a day-by-day process:

```js
async function confirmTravelRoute() {
  while (state.world.travelPlan.length) {
    const nextHex = state.world.travelPlan.shift();
    await resolveTravelDay(nextHex);
    if (state.mode === "exploration" || state.mode === "combat") return;
    await showCampScreen();
  }
}
```

Day resolution:

1. Move `state.world.currentHex` to the next hex.
2. `advanceWorldDay(1)`.
3. Consume rations.
4. Resolve structure or empty-hex event.
5. If no dungeon/combat starts, enter camp.

## Empty Hex Event Table

Initial weighted table:

- 35% nothing, atmospheric travel text.
- 25% small text encounter.
- 25% small random dungeon.
- 10% medium random dungeon.
- 5% special find, resource, clue, merchant, shrine sign, buried cache.

Suggested event context:

```js
{
  biome,
  biomeGroup,
  partyLevel,
  partySize,
  worldDay,
  dangerLevel,
  hasRoad,
  nearWater,
  nearStructure
}
```

Biome-to-dungeon theme mapping examples:

- Forest/jungle -> forest/beast/ruin themes.
- Desert -> desert ruins.
- Swamp -> swamp/undead/hydra themes.
- Mountain/highlands/hills -> cave/mine/elemental earth themes.
- Volcano/ashland -> fire/hell/forge themes.
- Arctic -> ice cave.
- Wasteland -> undead/necrotic/ruins.
- Ocean/coast -> water/coral/sunken ruins later.

## Rations And Foraging

Store rations in:

```js
state.partyResources.ration = 8;
```

Rules:

- Consume 1 ration per active hero per travel day.
- If there are not enough rations:
  - Offer forage.
  - Allow eating partial rations with penalty.
  - Apply fatigue/exhaustion if no food.

Foraging:

- Choose a hero or auto-pick best Survival.
- Roll Survival.
- Rangers auto-succeed in suitable terrain for MVP, or get advantage/large bonus.
- Druids/outlanders/nature-proficient heroes get bonuses.

Suggested forage DCs:

- Forest/grassland/coast: 10.
- Hills/jungle/swamp: 12.
- Mountain/arctic: 15.
- Desert/volcano/wasteland: 17.
- Ocean: unavailable without boat/fishing event.

Results:

- Success: enough rations for the day.
- Great success: extra ration or herb/material.
- Failure: no food found.
- Bad failure: small text complication later.

## Camp Screen

Add a new `camp` mode eventually:

```js
state.mode = "camp";
```

MVP can be a modal rather than a grid.

Camp actions:

- Long Rest.
- Forage.
- Review Route.
- Continue Travel.
- Break Camp / Return to Travel Map.

Camp long rest should be weaker than Home:

- Refresh long-rest abilities.
- Heal normally if food was available.
- No village services.
- No Home comfort bonuses unless camp comfort items are present.
- Possible interruption later.

Tent comfort item ideas:

- Bedroll.
- Weatherproof tent.
- Cooking kit.
- Lantern.
- Warding charm.
- Small shrine token.
- Ranger field kit.
- Warm blankets.
- Folding cot.

## Structure Actions

Add a structure handler table:

```js
const structureHandlers = {
  shrine_air: {
    label: "Air Shrine",
    actionLabel: "Enter the Crucible of Storms",
    dungeonTheme: "elementalAir",
    size: "medium"
  },
  shrine_fire: {
    label: "Fire Shrine",
    actionLabel: "Enter the Crucible of Cinders",
    dungeonTheme: "elementalFire",
    size: "medium"
  },
  shrine_water: {
    label: "Water Shrine",
    actionLabel: "Enter the Crucible of Tides",
    dungeonTheme: "elementalWater",
    size: "medium"
  },
  shrine_earth: {
    label: "Earth Shrine",
    actionLabel: "Enter the Crucible of Stone",
    dungeonTheme: "elementalEarth",
    size: "medium"
  },
  burrow_hydraswamp: {
    label: "Hydra Burrow",
    actionLabel: "Face the Hydra",
    encounterType: "singleRoomBoss",
    boss: "venom-bog-hydra"
  }
};
```

Structure categories:

- Villages: services, NPCs, local quests, safe rest.
- Cities: later, larger services, guilds, markets.
- Shrines: elemental crucibles, blessings, curses, puzzle events.
- Ruins: medium dungeon, treasure events, undead/construct encounters.
- Caves/entrances: biome-matched dungeon.
- Burrows: short monster lairs or single-room boss fights.
- Camps: social/text encounter, ambush, trade, rescue.
- Graveyards/crypts: undead dungeon or gravebinder content.
- Bridges/harbors: travel utility and events.

## Single-Room Boss Fight Support

Needed for hydra burrow and similar lairs.

Approach:

1. Create a helper that builds a custom one-room dungeon template.
2. Use `createCustomDungeonStateFromTemplate()` to start it.
3. Place boss and adds.
4. Add lair furniture and terrain by biome.
5. Completion marks structure visited/cleared.

Example:

```js
createSingleRoomBossTemplate({
  id: "world-burrow-hydraswamp-0,0-6,3",
  name: "Hydra Burrow",
  themeId: "swamp",
  bossId: "venom-bog-hydra",
  addIds: ["reed-viper", "bog-frog"],
  sourceHex
});
```

## Save Migration

In `normalizeLoadedState()`:

1. If `loadedState.world` exists, normalize it.
2. If missing, create a new default world.
3. Generate chunk `0,0`.
4. Pick or force home village.
5. Set current location to home village.

This keeps old saves usable.

## Implementation Phases

### Phase 1: World State Skeleton

- Add `src/scripts/app/world-travel.js`.
- Add `createInitialWorldState()`.
- Add `normalizeWorldState()`.
- Add `findHomeVillage()`.
- Load/use `src/scripts/shared/world-name-generator.js`.
- Add structure and natural feature labels to generated chunks.
- Add migration in `normalizeLoadedState()`.
- Generate and save world state on new adventure.

### Phase 2: Travel Entry And Overlay

- Add Travel button to Home.
- Add travel overlay HTML.
- Add DOM bindings.
- Render chunk `0,0`.
- Show current/home markers.
- Show structure markers.
- Show biome/structure tooltips.

### Phase 3: Route Planning

- Add hex adjacency helpers.
- Add route selection.
- Add route validation.
- Add route summary.
- Add confirm/clear controls.

### Phase 4: One-Day Travel

- Confirm route.
- Move one hex.
- Advance world day.
- Consume rations.
- Log travel.
- Enter camp.

### Phase 5: Camp

- Add camp screen.
- Add continue route.
- Add change route.
- Add long rest.
- Add forage.

### Phase 6: Empty Hex Events

- Add event roll table.
- Add small text encounter catalogue.
- Add biome-to-theme mapping.
- Start small/medium random dungeons from event results.

### Phase 7: Structure Events

- Add structure handler registry.
- Add shrine -> elemental crucible dungeon.
- Add ruins -> biome dungeon.
- Add burrows -> lair/boss content.
- Mark cleared/visited structures.

### Phase 8: Polish And Expansion

- Harbors/boats.
- More encounter catalogue content.
- Camp comfort item progression.
- Structure-specific story chains.

## First Useful MVP

The smallest playable slice:

1. New game creates world chunk `0,0`.
2. Home village selected and saved.
3. Home menu has Travel.
4. Travel opens scrollable map.
5. Current and home village markers appear.
6. Player selects adjacent hexes.
7. Confirm route moves one hex per day.
8. Rations are consumed.
9. Empty hex has simple event roll.
10. Camp modal appears each evening.

This gets the new fantasy online without disturbing the existing dungeon systems.
