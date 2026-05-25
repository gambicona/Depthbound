# Vision, Light, and Detection Implementation Log

Date: 2026-05-24

## Goal

Add a real D&D-style light and vision system that separates map knowledge from actual lighting, makes bright light, dim light, and darkness matter mechanically, and gives the player a clear visual read of lit, dim, and dark areas.

This system should unlock or improve:

- Light
- Dancing Lights
- Darkness
- Daylight
- See Invisibility
- True Seeing
- Sunbeam
- Sunburst
- Maddening Darkness
- Torches and lanterns
- Glowing furniture such as mushrooms, forge furnaces, and other dungeon fixtures
- Racial darkvision and special senses
- Perception and Investigation penalties in poor light

## Current System Read

The game already has a map memory and discovery system:

- `activeTileKeys()` returns tiles in currently discovered/active rooms.
- `rememberedTileKeys()` keeps previously seen tiles visible as map memory.
- `isKnownTile()` and `visibleWalkable()` are used for interaction, movement, and rendering.
- `renderRoom()` applies tile classes such as `fog-memory`, `hidden-tile`, `seen-wall`, `reachable`, spell previews, persistent area, blocker, and difficult terrain.

This is not the same as lighting. A tile can be known because the party has explored it, but still be dark. The light system should not replace the existing known/remembered tile system.

The game also already has useful building blocks:

- `rollD20ForFighter(fighter, { advantage, disadvantage })` supports disadvantage.
- `skillCheckBonus()` exists.
- Hidden door search and trap spotting already use Perception/Investigation style checks.
- Persistent spell areas already exist and can be extended for Darkness, Daylight, Maddening Darkness, and similar effects.
- Furniture already has a loose `lightSource` component, for example glowing mushrooms and forge furnaces, but it is currently visual-only.

## Core Design Decision

Light level should be a derived tile state, not a permanent status effect written onto heroes every render.

Each relevant tile should resolve to one of:

- `bright`
- `dim`
- `darkness`
- `magicalDarkness`

Heroes can display a derived condition such as "Dim Light" or "Darkness" while standing there, but the source of truth should be the lighting map. This avoids stale conditions when a hero moves, a torch goes out, or a spell ends.

## D&D 5e Mapping

For game purposes:

- Bright light: no lighting penalty.
- Dim light: lightly obscured. Perception and Investigation checks relying on sight should be disadvantaged unless the hero has a suitable sense.
- Darkness: heavily obscured. Perception and Investigation checks relying on sight should be disadvantaged unless the hero has a suitable sense.
- Darkvision: for this game, darkvision prevents dim/darkness penalties within its range, matching the requested behavior.
- Magical darkness: blocks normal darkvision. Truesight or a special feature such as Devil's Sight can ignore it.
- Invisible creatures: remain separate from darkness, but use the same future `canSeeFighter(observer, target)` visibility pipeline.

Strict 5e darkvision treats darkness as dim light, which would still normally matter for sight-based Perception. The requested game behavior is clearer and friendlier: darkvision removes the Perception/Investigation light penalty inside range.

## Light Source Model

Normalize all light emitters to a shared shape:

```js
{
  id,
  origin: { x, y },
  brightRadius,
  dimRadius,
  color,
  sourceType,
  magical,
  suppressible,
  ownerId,
  areaId
}
```

Supported source types:

- `ambient`: room, dungeon, village, or biome default light
- `furniture`: glowing mushrooms, braziers, forge furnaces, crystals
- `item`: torch, hooded lantern, bullseye lantern
- `spell`: Light, Dancing Lights, Daylight, Sunbeam, Sunburst
- `darkness`: Darkness and Maddening Darkness areas
- `actor`: creature or summon emitting light

Legacy furniture components like `{ type: "lightSource", radius: 4 }` should continue to work. The migration can interpret legacy radius as dim radius, then gradually replace content with explicit bright/dim values.

## Lighting Map

Add a lighting resolver that computes a tile map for the current dungeon room context:

1. Start with room/theme ambient light.
2. Add static furniture light sources.
3. Add active item light sources carried or dropped by heroes.
4. Add active spell light sources and persistent spell areas.
5. Apply darkness and magical darkness overlays.
6. Resolve final tile light level and source metadata.

The lighting map should be separate from explored/remembered tiles:

- Known tile: the player remembers it.
- Lit tile: it currently has bright or dim light.
- Dark tile: it may be known, but it is currently dark.

Line of sight should matter for light propagation where possible. A torch should not fully light tiles behind a wall or blocking spell template. The first pass can use existing grid/blocker checks and then improve toward more exact ray/flood behavior.

## Ambient Light

Add ambient light at theme/room level:

```js
ambientLight: "bright" | "dim" | "darkness"
```

Recommended defaults:

- Village/base: bright
- Normal dungeon rooms: darkness
- Rooms with bioluminescence, lava, active forge, shrine glow, or magical fixtures: dim or bright depending on content
- Previously explored but unlit rooms: still visible as map memory, but visually darkened

This avoids making old exploration impossible while still letting darkness matter.

## Racial and Special Senses

Extend species/race selection data with senses:

```js
senses: {
  darkvision: 60
}
```

Expected 2014-style racial coverage to verify against the current species list before coding:

- Dwarf: darkvision 60
- Elf: darkvision 60
- Half-Elf: darkvision 60
- Gnome: darkvision 60
- Half-Orc: darkvision 60
- Tiefling: darkvision 60
- Drow: darkvision 120
- Duergar: darkvision 120
- Deep Gnome/Svirfneblin: darkvision 120
- Aasimar: darkvision 60 if present in the current ruleset/content
- Fire Genasi: darkvision 60 if present in the current ruleset/content
- Human, Halfling, and 2014 Dragonborn: no darkvision

Do not overwrite beast or monster senses. Add racial senses as one input and resolve effective senses from:

- racial senses
- class/subclass features
- spell statuses
- item bonuses
- wild shape/monster form senses

Future senses:

- blindsight
- tremorsense
- truesight
- see invisible
- Devil's Sight style magical darkness bypass

## Detection and Skill Checks

Add a shared helper:

```js
lightingCheckContext(fighter, skillId, position)
```

This should return whether a sight-based check has disadvantage because of light.

Add or extend a skill roll helper:

```js
rollSkillCheck(fighter, ability, skillId, {
  position,
  sightBased,
  advantage,
  disadvantage
})
```

Initial mechanical hooks:

- Hidden door search: Investigation/Perception penalties in dim/darkness.
- Trap spotting: Perception penalties in dim/darkness.
- Passive Perception and Passive Investigation: apply the 5e passive disadvantage rule as `-5`.
- Future stealth/targeting: route through `canSeeFighter(observer, target)`.

Do not apply lighting penalties to checks that are clearly not sight-based.

## Spell Integration

### Light

Unhide it once the lighting map exists.

Expected game behavior:

- Cantrip.
- Creates bright light 20 ft and dim light 20 ft beyond that.
- Attaches to caster, ally, carried object, or selected point depending on current targeting support.
- Duration: 1 hour or encounter-friendly equivalent.
- Counts as magical light.

### Dancing Lights

Unhide it once movable light sources exist.

Expected game behavior:

- Cantrip.
- Concentration.
- Creates dim light in a small area.
- Simplify as one movable clustered light source at first, with a clear note that four independent lights can be added later.

### Darkness

Improve existing persistent area behavior.

Expected game behavior:

- Creates magical darkness in its area.
- Suppresses normal/nonmagical light inside the area.
- Blocks normal darkvision.
- Truesight or Devil's Sight style effects can see through it.

### Daylight

Expected game behavior:

- Creates a large bright light source.
- Suppresses or dispels Darkness-style effects when appropriate.
- Strong visual contrast: clean radiant light against dark/dim overlays.

### See Invisibility

Expected game behavior:

- Grants `seeInvisible`.
- Does not create light.
- Feeds into `canSeeFighter()`.

### True Seeing

Expected game behavior:

- Grants truesight.
- Sees invisible creatures.
- Ignores normal and magical darkness within range.
- Improves detection without changing the tile's actual light level.

### Sunbeam and Sunburst

Expected game behavior:

- Keep current damage/blindness behavior.
- Add radiant light/flash behavior.
- Sunburst should strongly interact with darkness effects, likely clearing eligible magical darkness.

### Maddening Darkness

Expected game behavior:

- Persistent magical darkness plus existing psychic/hazard behavior.
- Uses the same magical darkness visibility rules as Darkness.
- More severe visual treatment than ordinary darkness.

## Items

Add or activate usable utility light items:

- Torch: bright 20 ft, dim 20 ft, limited duration.
- Hooded lantern: bright 30 ft, dim 30 ft; can be hooded to reduce light.
- Bullseye lantern: cone light later; first pass can use a forward-biased or normal radius if cones are not ready.

Required item actions:

- Light/ignite
- Extinguish
- Possibly drop/place

Inventory UI should show whether the item is lit and how much duration remains if duration tracking already exists or is added.

## Furniture

Convert visual-only glow into real light sources:

- Glowing mushrooms: dim light, usually no bright center or only very small bright radius.
- Forge furnace: bright center plus wider dim radius.
- Braziers, lanterns, crystals, altars, lava, and magical runes: explicit bright/dim/color values.

Furniture should still look like it glows, but now it should also influence the lighting map and checks.

## Visual Plan

The player needs to instantly read the light state without opening a tooltip.

Recommended tile visuals:

- Bright: warm or source-colored rim glow, high tile clarity.
- Dim: cool low-saturation veil, reduced contrast, subtle blue/green/gray wash.
- Darkness: deep shadow overlay, low detail, visible map-memory silhouette only.
- Magical darkness: darker inky overlay with violet edge/noise treatment.
- Daylight/radiant: bright gold-white highlight with clean edge.
- Bioluminescence: teal/green source-colored dim glow.

Implementation path:

- Add tile classes such as `lit-bright`, `lit-dim`, `lit-darkness`, and `lit-magical-darkness`.
- Use CSS variables for color and intensity when possible.
- Add source halo styling to furniture/object elements.
- Keep fog-of-war classes separate from light classes.

Avoid making darkness unreadable. The player should understand what is there from map memory, but also understand that the hero cannot see well.

## Detection/Visibility Pipeline

Add a central predicate over time:

```js
canSeeFighter(observer, target, options)
```

Inputs:

- map knowledge
- line of sight
- lighting at target tile
- observer senses
- target invisibility
- magical darkness
- blindness and similar conditions

Initial use cases:

- Invisible creature targeting
- Monster perception against stealth
- Hidden door/trap discovery
- Spell targeting restrictions if needed later

This avoids each spell or subsystem inventing its own visibility rules.

## Implementation Phases

### Phase 1: Data model and lighting resolver

- Add normalized light source helpers.
- Collect furniture, item, spell, actor, ambient, and darkness sources.
- Compute current lighting map.
- Keep known/remembered tiles unchanged.

Status: implemented.

Landed in `src/scripts/app/combat-map.js`:

- Added canonical light levels: `bright`, `dim`, and `darkness`.
- Added normalized light source helpers that accept explicit `brightRadius`/`dimRadius`, feet-based radius fields, and legacy furniture `{ type: "lightSource", radius }` components.
- Added source collection for:
  - ambient dungeon/home/room light metadata
  - furniture light sources
  - actor/status light sources
  - carried/equipped item light sources
  - persistent spell light sources
  - magical darkness areas
- Added `currentLightingMap()` to compute per-tile lighting entries without altering `activeTileKeys()`, `rememberedTileKeys()`, or `isKnownTile()`.
- Added `lightingAtPosition()` as the read helper for later phases.
- Added line-of-sight-aware light propagation through `hasClearLightPath()`, with source and target cells allowed so a glowing blocking object can still emit light from its own tile.

Notes:

- Home defaults to bright ambient light.
- Dungeon defaults to darkness unless `room.ambientLight`, `state.dungeon.ambientLight`, or `theme.ambientLight` says otherwise.
- Magical darkness currently overrides light after ordinary light sources resolve.
- The lighting map is not yet visualized and does not yet affect checks. That belongs to later phases.

### Phase 2: Race senses and derived light condition

- Add racial darkvision data.
- Normalize senses onto heroes without overwriting beast/monster senses.
- Display derived dim/darkness state where useful.

Status: implemented.

Landed in:

- `src/scripts/app/bootstrap.js`
- `src/scripts/app/game-state.js`
- `src/scripts/app/rendering-inventory.js`
- `src/scripts/app/ui-dialogs-character.js`
- `src/styles/main.css`

Details:

- Added racial darkvision data to the current species/subspecies set:
  - Dwarf 60 ft
  - Duergar 120 ft
  - Elf 60 ft
  - Drow 120 ft
  - Gnome 60 ft
  - Deep Gnome 120 ft
  - Half-Elf 60 ft
  - Half-Orc 60 ft
  - Aasimar 60 ft
  - Fire Genasi 60 ft
  - Tiefling 60 ft
- Added sense normalization and merging helpers:
  - `normalizeSenses()`
  - `mergeSenses()`
  - `fighterEffectiveSenses()`
  - `fighterDarkvisionRange()`
- Race senses are stored as `racialSenses` and `racialTraits.senses`.
- Normal heroes merge racial senses into `fighter.senses`.
- Wild shaped heroes keep beast senses while transformed, so racial darkvision does not overwrite beast-form senses.
- Character creation/race previews now list senses.
- Hero status cards and the temporary effects panel now show a derived light condition when standing in:
  - dim light
  - darkness
  - magical darkness
- The derived light condition is read from `lightingAtPosition()` and is not written to `statusEffects`.

Notes:

- Darkvision is displayed as covering dim/darkness for this phase, but it does not yet alter rolls. The actual Perception/Investigation mechanics belong to Phase 3.
- Magical darkness explicitly notes that normal darkvision does not pierce it.

### Phase 3: Perception and Investigation penalties

- Add shared sight-based skill check helper.
- Apply disadvantage to active Perception/Investigation checks in poor light.
- Apply `-5` to passive checks when appropriate.

Status: implemented.

Landed in:

- `src/scripts/app/combat-map.js`
- `src/scripts/app/rendering-inventory.js`

Details:

- Added shared sight-check helpers:
  - `lightingCheckContext()`
  - `rollSkillCheck()`
  - `passiveSkillScore()`
  - `lightContextNote()`
- Sight-based checks currently cover:
  - Perception
  - Investigation
- Poor light now applies disadvantage to active sight-based Perception/Investigation checks unless the fighter's senses cover the checked position.
- Passive Perception and passive Investigation now apply `-5` when poor light impairs the observer.
- Darkvision/truesight range is checked against the target position, not only the observer's current tile.
- Magical darkness requires truesight for this phase. Normal darkvision does not prevent the penalty there.

Hooked checks:

- Monster passive Perception against stealth.
- Monster active Perception against stealth.
- Passive Investigation for hidden doors.
- Active room search Investigation.
- Trap reveal Perception checks.
- Chest trap reveal Perception checks.
- Object investigation.
- Trap disarm checks when using Perception/Investigation.
- Resource gathering and unique furniture interactions when the selected skill is Perception/Investigation.

Notes:

- This phase does not yet change targeting or line-of-sight rules for attacks/spells. That belongs to the later visibility predicate work.
- The UI already shows derived light state from Phase 2, so players can see why a check is disadvantaged.

### Phase 4: Visual tile treatment

- Add tile classes and CSS for bright/dim/dark/magical darkness.
- Add source glows for furniture and active light spells/items.
- Verify readability in dungeon and village views.

Status: implemented.

Landed in:

- `src/scripts/app/rendering-inventory.js`
- `src/styles/main.css`

Details:

- `renderRoom()` now reads `currentLightingMap()` once per render.
- Known walkable tiles receive lighting classes:
  - `light-bright`
  - `light-dim`
  - `light-darkness`
  - `light-magical-darkness`
- Tile tooltips now include the resolved light level.
- Tile CSS now gives each light state a distinct read:
  - bright: warm/source-colored clarity and inner glow
  - dim: cooler, muted low-light wash
  - darkness: darker desaturated shadow with subtle texture
  - magical darkness: inky violet darkness with a different edge/read
- Furniture with `lightSource` now gets an active glow/halo using its configured color when present.
- Heroes/actors carrying an active light source or spell light now get a token halo.
- Token light lookup reuses the current render's light source list instead of recomputing sources per token.

Verification:

- `node --check src/scripts/app/rendering-inventory.js`
- `node --check src/scripts/app/combat-map.js`
- Playwright/static-server visual smoke:
  - dungeon render had bright, dim, and darkness tile classes
  - test glowcap furniture rendered as a light source
  - test hero with Light rendered as a light-emitting token
  - village/home render stayed bright
  - no console errors in the direct render pass

Screenshots captured:

- `.tmp/lighting-phase4-dungeon-visible.png`
- `.tmp/lighting-phase4-village-visible.png`
- `.tmp/lighting-phase4-mobile-visible.png`

### Phase 5: Spells and items

- Unhide Light and Dancing Lights.
- Improve Darkness, Daylight, True Seeing, See Invisibility, Sunbeam, Sunburst, and Maddening Darkness.
- Add torch and lantern use actions.
- Convert glowing furniture to real light emitters.

Implemented:

- `Light` is visible again for Bard, Cleric, Sorcerer, Wizard, Eldritch Knight, and wizard-derived subclasses. It applies a real bright/dim light source to the target.
- `Dancing Lights` is visible again for Bard, Sorcerer, Wizard, Eldritch Knight, and wizard-derived subclasses. It creates a persistent dim-light point area.
- Added `Daylight` as a real level 3 spell for Cleric, Druid, Paladin, Ranger, and Sorcerer. It creates bright/dim magical light and suppresses/removes lower-level magical darkness.
- Added `See Invisibility` for Bard, Sorcerer, and Wizard. It grants a sight sense rather than a generic combat-only buff.
- Improved `True Seeing` to grant truesight and see-invisibility senses.
- Improved `Sunburst` so it burns away eligible magical darkness in its burst.
- Improved `Sunbeam` so the sustained beam creates a persistent radiant area and an emitted light source while active.
- `Darkness` and `Maddening Darkness` now participate in the magical-darkness lighting layer; daylight-style sources are resolved before darkness so they can suppress it.
- Added usable `Torch`, `Hooded Lantern`, and `Bullseye Lantern` items. They can be lit/extinguished through item use and emit real light.
- Glowcap consumables now emit dim light while active.
- Converted glowing mushrooms, crystals, braziers, forge furnaces, hellfire/deep-desert lights, and underdark glow features to explicit bright/dim light-source components.

Verification:

- `node --check` passed for touched app, spell, item, class, and furniture files.
- Browser smoke passed with no console errors.
- Browser smoke confirmed Wizard can choose Light and Dancing Lights, Cleric can choose Daylight, Daylight/Dancing Lights expose real light-source data, torch/lantern use data exists, and glow mushrooms emit real light.

### Phase 6: Visibility predicate

- Add `canSeeFighter()` and migrate invisibility/targeting gradually.
- Improve monster perception and stealth behavior.
- Add finer handling for truesight, see invisibility, and magical darkness bypass.

Implemented:

- Added `canSeeFighter(observer, target, options)` as the shared observer-vs-target visibility predicate.
- Visibility now checks line of sight, invisibility, target lighting, darkness, magical darkness, stealth totals, darkvision, truesight, and see-invisibility senses.
- Dim light still allows sight, but keeps sight-based Perception/Investigation penalties for creatures without suitable senses.
- Darkness blocks sight unless the observer has darkvision or truesight in range.
- Magical darkness blocks sight unless the observer has truesight in range.
- See Invisibility bypasses invisible/greater-invisible target concealment, but does not bypass darkness.
- True Seeing bypasses invisible targets and poor-light/magical-darkness sight limits through truesight.
- Monster targeting now uses `canSeeFighter()` after legacy non-visual ignore effects such as sanctuary-like targeting suppression.
- Player monster visibility now uses party `canSeeFighter()` checks, so invisible or unseeable monsters are not offered as normal attack/spell targets.
- Threat detection uses encounter-relevant monsters separately from player-visible monsters, so an unseen monster can still start a fight if it can see a hero.
- Stealth passive and active Perception checks now include target invisibility in their disadvantage/passive-penalty context.
- Autonomous/AI targeting now uses `canSeeFighter()` for non-monster-vs-hero targeting too.

Verification:

- `node --check src/scripts/app/combat-map.js`
- `node --check src/scripts/app/movement-ai-input.js`
- Browser smoke passed with no console errors and confirmed `canSeeFighter`, monster targeting, visible monster helpers, AI targeting, True Seeing senses, and See Invisibility senses are loaded.

## Likely Files To Touch

- `src/scripts/app/game-state.js`
  - sense normalization
  - lighting helpers
  - skill check helpers
  - item light state

- `src/scripts/app/combat-map.js`
  - lighting map collection/resolution
  - hidden door/trap perception hooks
  - spell area interactions
  - visibility predicates

- `src/scripts/app/rendering-inventory.js`
  - tile light classes
  - item use buttons
  - derived light condition display

- `src/scripts/content/spells/core-spells.js`
  - Light, Dancing Lights, Darkness, Daylight, See Invisibility, True Seeing, Sunbeam, Sunburst, Maddening Darkness

- `src/scripts/app/bootstrap.js`
  - species/race senses

- `src/scripts/content/furniture/*.js`
  - real light component values

- `src/styles/main.css`
  - lighting overlays, glow styling, darkness readability

## Risks and Decisions

- If the whole dungeon defaults to darkness immediately, some older encounters may become too punishing. Room/theme ambient light and furniture conversion should be added in the same pass.
- Dynamic tile lighting can be expensive if recomputed too often. Cache per render/update and only recompute when sources, positions, room, or spell areas change.
- Magical darkness should not simply be "darker CSS"; it needs a gameplay flag that blocks normal darkvision.
- Light should not reveal unexplored rooms by itself unless the game intentionally supports peeking through open doors. For now, light affects known/current room tiles and detection, while exploration rules remain separate.
- Cone lighting for bullseye lanterns can be a later refinement if radius lights are needed first.

## Test Plan

- Create a human hero in a dark room and confirm Perception/Investigation checks are penalized.
- Create an elf/dwarf/tiefling in the same dark room and confirm darkvision prevents the penalty within range.
- Verify known tiles remain visible as memory even when dark.
- Verify glowing mushrooms create dim light on nearby tiles.
- Verify Light creates bright/dim tiles and appears in class spell choices.
- Verify Dancing Lights creates a dim magical light source and appears in class spell choices.
- Verify Darkness overrides normal light and blocks normal darkvision.
- Verify Daylight visibly illuminates and suppresses eligible Darkness.
- Verify True Seeing/See Invisibility affect visibility without creating light.
- Verify torch/lantern use creates/removes light.
- Browser smoke test the character sheet, dungeon rendering, village, inventory, and spell casting UI.
