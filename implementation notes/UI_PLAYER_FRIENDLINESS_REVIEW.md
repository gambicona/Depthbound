# UI Player-Friendliness Review

Date: 2026-05-22

Scope: Desktop and narrow-mobile inspection of the current Depthbound UI, with screenshots captured from the main menu, character creation, first playable Home state, inventory overlay, and mobile Home view.

Evidence files generated during review:

- `ui-review-main-menu-1440.png`
- `ui-review-character-flow-1440.png`
- `ui-review-flow-step-1440.png`
- `ui-review-inventory-1440.png`
- `ui-review-home-mobile-390.png`

## Overall Read

The game already has a strong visual identity. The title screen is atmospheric, the teal-and-bronze interface language fits the dungeon fantasy, and the grid itself is readable once the player reaches Home.

The main issue is not visual quality. The issue is hierarchy. The interface exposes too many systems with equal weight: save controls, debug/admin tools, zoom, volume, tutorial, bug report, quest log, status, hero card, temporary effects, level up, combat log, bottom action buttons, and object buttons all compete on first playable load.

The next UI pass should focus on disclosure: keep the core play loop visible, tuck rare actions behind menus, and make the next useful action obvious.

## Highest-Impact Fixes

### 1. Create A Player HUD Mode And Move Admin/Debug Controls Out Of The Main HUD

What the player sees:
Adminmode, Save, Main Menu, Tutorial, Bug Report, zoom, and volume all appear in the main play HUD. On desktop this creates a tool-heavy topbar; on mobile it consumes the entire first screen before the player sees the map.

Why it matters:
The first playable view feels partly like a development console. It makes the player ask "what do I need?" before they have even moved.

Recommended change:

- Keep only the room title, one compact menu/settings button, and maybe Save feedback in the persistent topbar.
- Move `Adminmode`, layout/debug actions, token management, volume, zoom, and tutorial into a pause/settings drawer.
- Keep Bug Report available but not first-tier during normal play, perhaps in the pause/settings drawer.
- Add an explicit "Player UI / Admin UI" toggle if admin tools are still needed during test sessions.

Likely files:

- `index.html` topbar controls around `.topbar`
- `src/styles/main.css` topbar and responsive rules
- `src/scripts/app.js` admin/debug button behavior

### 2. Redesign The Bottom Action Bar Around Current Context

What the player sees:
The bottom bar reserves large buttons for Roll Initiative, Select Party, Use Item, Abilities, Short Rest, and Return Home even when several are disabled or low relevance.

Why it matters:
Disabled large buttons still demand attention. They also cover the playfield on mobile, where the bar sits across the map and splits the first screen.

Recommended change:

- Show one primary contextual action cluster instead of six equal buttons.
- Collapse disabled or unavailable actions into a small "More" button.
- Make combat-only actions appear only in combat.
- In Home, prioritize `Adventure / Plan`, `Inventory`, `Abilities`, and `Rest` if relevant.
- On mobile, use a bottom dock with icon buttons plus short labels, fixed to safe-area, but avoid covering the center of the map.

Likely files:

- `index.html` action buttons
- `src/scripts/app/rendering-inventory.js` `updateControls()`
- `src/styles/main.css` bottom responsive rules near the `max-width: 620px` section

### 3. Make The First Playable Home State Tell The Player What To Do Next

What the player sees:
The Home map loads with a planning table, chest, bed, and "MOVE OUT", but the UI does not clearly frame the next step. The most prominent actions are system controls and general status panels.

Why it matters:
The player can infer that the table or Move Out matters, but the UI does not guide them. This is especially risky after a long character creation flow.

Recommended change:

- Add one compact objective chip: `Prepare at the table, then move out`.
- Give the planning table and Move Out button stronger contextual affordance.
- Hide the combat log by default in Home unless an important event just happened.
- Rename or retitle `MOVE OUT` if the intended meaning is "Start Adventure", "Leave Home", or "Choose Dungeon".

Likely files:

- `src/scripts/app/rendering-inventory.js` Home object rendering and status text
- `src/styles/main.css` object prompt and status chip styling

### 4. Reduce Character Creation Friction

What the player sees:
Before play, the player steps through save folder choice, save slot, save name, character name, class, race/species, ability scores, gear choices, skill choices, fighting style, and D20 luck.

Why it matters:
This is powerful for DnD-style control, but the default path is long before the first action. It can feel like a form sequence instead of game onboarding.

Recommended change:

- Add a "Quick Start" path on the main menu or first character dialog.
- Provide class cards with a one-line role summary instead of plain class buttons.
- For each decision dialog, show progress such as `Step 4 of 10`.
- Group gear and skill choices into an optional "Customize" section after a recommended default.
- Consider starting in Home with a pregenerated hero and letting the player customize later.

Likely files:

- `src/scripts/app/ui-dialogs-character.js`
- `src/scripts/app/rendering-inventory.js` character dialog helpers
- `src/styles/main.css` dialog layout

### 5. Inventory Needs Stronger Scanning And Less Empty Slot Weight

What the player sees:
The inventory overlay is large and clear, but empty equipment slots take the same card weight as equipped items. The useful things are present, but buried among many empty boxes and repeated Unequip buttons.

Why it matters:
Inventory is a high-frequency surface. It should answer "what am I wearing, what can I use, what changed?" quickly.

Recommended change:

- Split the inventory into tabs: `Equipment`, `Items`, `Chest`, `Materials`.
- Compress empty equipment slots into smaller placeholders.
- Hide or disable Unequip controls more quietly on empty slots.
- Add a top summary row for AC, weapon, carried coins, and consumables.
- Put item descriptions behind inspect/details expansion unless the item is selected.

Likely files:

- `src/scripts/app/rendering-inventory.js` inventory markup
- `src/styles/main.css` inventory panel rules

### 6. Mobile Layout Should Become A True Mobile HUD, Not A Stacked Desktop UI

What the player sees:
On a 390px-wide viewport, the arena begins with title and controls, then the map appears lower down, the bottom action bar overlays the map, and the side panel comes after the arena in a very long page.

Why it matters:
The player must scroll through chrome and panels to understand state. The action bar also sits over map content.

Recommended change:

- Put the map first on mobile after a compact title/status strip.
- Convert the side panel into collapsible drawers: `Hero`, `Log`, `Quest`.
- Use a bottom mobile action dock that avoids the central map or reserves layout space for itself.
- Hide zoom and volume behind settings on mobile.
- Make admin/debug tools opt-in and hidden by default on mobile.

Likely files:

- `src/styles/main.css` media queries around `max-width: 980px`, `720px`, and `620px`
- `index.html` structure may be okay, but CSS order and fixed docks need adjustment

## Medium-Priority Improvements

### Combat Log

The combat log is useful, but in Home it occupies a full persistent panel for low-urgency messages. Default it to a collapsed event feed outside combat. In combat, expand it or highlight only critical events: turn start, damage, death, failed saves, loot, and objective updates.

### Hero Card

The hero card has good core data, but action buttons (`Stealth`, `Search`, `I`, `...`) mix text and cryptic symbols. Standardize this into icon-plus-tooltip or short text buttons. The `...` rename/action button is especially unclear.

### Buttons And Labels

Some labels are developer-facing or mechanically terse: `Adminmode`, `MOVE OUT`, `D20 Luck`, `Truly Random`, `Karmic / Mercy Mode`. These can remain in advanced views, but first-time player flows should use friendlier labels and a short helper line.

### Main Menu Save Prompt

The main menu says "Choose a save folder to use JSON file saves. No saved adventure found." This is practical but a little technical for first launch. Consider replacing it with a shorter status line and only explain JSON saves inside Settings or the save dialog.

### Visual Density

The UI theme works, but many panels share the same border/background treatment. Use stronger hierarchy:

- solid accent for the single primary action
- muted border panels for secondary info
- text-only or icon-only controls for tertiary tools
- disabled controls at lower opacity and smaller footprint

## Icon Pass

There is a large local icon library at `E:\OneDrive\DD\GameAssets\icons`. It is well suited for reducing text weight in the HUD, especially because the folders already match the game's concepts: `game`, `combat`, `entity`, `skill`, `class`, `hp`, `attribute`, `dice`, `condition`, `damage`, `location`, `util`, and `weapon`.

License note: the icon README identifies the set as Intrinsical's D&D 5e Icon Set by David Kor Kian Wei, licensed under Creative Commons Attribution-ShareAlike 4.0 International. Before copying icons into the game repo, add an attribution note and preserve the license requirements.

### Best First Icon Replacements

These are the places where icons would likely make the UI less noisy without making it cryptic:

| Current label | Suggested icon | Display pattern |
| --- | --- | --- |
| `Roll Initiative [R]` | `combat/initiative.svg` | Icon + short label on desktop, icon-only with tooltip on mobile |
| `Select Party [Q]` | `game/party.svg` | Icon + `Party` |
| `Use Item [U]` | `entity/potion.svg` or `entity/pack.svg` | Icon + `Item` |
| `Abilities [B]` | `game/spell.svg` or `combat/action.svg` | Icon + `Abilities` |
| `Short Rest` | `game/rest.svg` | Icon + `Rest` |
| `Return Home [H]` | `util/home.svg` or `location/hut.svg` | Icon + `Home` |
| `Quest Log [J]` | `game/adventure-book.svg` or `entity/book.svg` | Icon + `Quest` |
| `Stealth` | `skill/stealth.svg` | Icon button with tooltip |
| `Search` | `util/search.svg` or `skill/perception.svg` | Icon button with tooltip |
| Inventory button currently `I` | `entity/pack.svg` | Icon button with tooltip |
| Rename/more button currently `...` | `util/cog.svg` if settings, `entity/person.svg` if character edit | Icon button with tooltip |
| `Pause` | `entity/time.svg` | Icon + `Pause` or icon-only in compact HUD |
| `Save` | no exact save icon found in first pass; use `entity/archive.svg` if acceptable | Icon + `Save` |
| `Adminmode` | `game/dm.svg` or `util/cog.svg` | Hidden behind settings/admin drawer |
| `Bug Report` | `util/bubble.svg` | Put in settings/help drawer |
| `Level Up` | `util/star.svg` or `game/inspiration.svg` | Strong icon + label when available |
| `Temporary Effects` | `spell/concentration.svg` or `condition/*` badges | Compact badge row |

### Character Creation Icons

Character creation would benefit from icon cards rather than plain text lists:

- Class selection: use `class/barbarian.svg`, `class/bard.svg`, `class/cleric.svg`, `class/druid.svg`, `class/fighter.svg`, `class/monk.svg`, `class/paladin.svg`, `class/ranger.svg`, `class/rogue.svg`, `class/sorcerer.svg`, `class/warlock.svg`, and `class/wizard.svg`.
- Ability scores: use `ability/strength.svg`, `ability/dexterity.svg`, `ability/constitution.svg`, `ability/intelligence.svg`, `ability/wisdom.svg`, and `ability/charisma.svg`.
- Skills: use the matching `skill/*.svg` files, especially for repeated skill-choice dialogs.
- D20 luck: use `dice/d20.svg`, `dice/advantage.svg`, `dice/disadvantage.svg`, and `dice/roll.svg` as visual anchors.

Recommended pattern:

- For first-time creation, use icon cards with class name and one role line.
- For advanced or repeated choice dialogs, use icon-left rows so the player can scan faster.
- Keep text labels visible for class and skill choices; these are too important to become icon-only.

### Inventory And Combat Stat Icons

The inventory screen can use icons to make the top summary and equipment grid more readable:

- AC summary: `attribute/ac.svg`
- HP summary: `hp/full.svg`, `hp/half.svg`, `hp/temp.svg`, or `hp/blood.svg` depending on state
- To-hit / attack: `d20test/attacking.svg` or `combat/melee.svg`
- Damage: use `damage/slashing.svg`, `damage/piercing.svg`, `damage/bludgeoning.svg`, etc. based on the item
- Main hand / weapon rows: `entity/weapon.svg` or specific `weapon/battleaxe.svg`, `weapon/sword.svg`, `weapon/bow.svg`, `weapon/crossbow.svg`
- Armor slots: `entity/armor.svg`
- Ring slots: `entity/ring.svg`
- Consumables: `entity/potion.svg`
- Materials: `entity/trinket.svg`, `entity/loot.svg`, or a future custom material icon
- Chest: `entity/archive.svg` or `entity/loot.svg`

Recommended pattern:

- Use icons in stat chips, equipment slot headers, and item type badges.
- Do not replace full item names with icons; item names carry too much gameplay detail.
- Make empty equipment slots visually quieter and use a faint slot/type icon instead of full card weight.

### Map And Home Object Icons

The Home screen already has object art, but UI prompts around objects can become more legible with icons:

- Home/location: `util/home.svg`, `location/hut.svg`, or `location/bastion.svg`
- Planning table / adventure start: `game/adventure-book.svg`, `entity/map.svg`, or `game/explore.svg`
- Move out / leave home: `game/explore.svg` or `location/portal.svg`
- Chest/storage: `entity/archive.svg` or `entity/loot.svg`
- Bookshelf/tutorial/compendium: `entity/book.svg` or `game/source-book.svg`
- Build/home edit tools: `util/build.svg` or `entity/tool.svg`
- Village/travel: `location/village.svg`
- Dungeon/adventure: `location/dungeon.svg`

Recommended pattern:

- Use icons inside contextual object prompts, not as replacements for object sprites.
- For `MOVE OUT`, prefer an icon-led button such as `game/explore.svg` plus a clearer label like `Adventure`.

### Implementation Guidance

- Copy only a curated subset into the game repo, for example `assets/icons/ui/`, instead of referencing `E:\OneDrive\DD\GameAssets\icons` directly.
- Start with around 20 icons: core HUD actions, class icons, skill icons used in creation, and inventory stat icons.
- Use CSS masks or inline SVGs so icons can inherit the existing teal/cream/accent colors.
- Every icon-only button needs `aria-label`, `title`, and a hover/focus tooltip.
- Keep keyboard shortcuts visible in tooltips or a help drawer rather than on every button label.
- Avoid replacing rare or ambiguous commands with icon-only controls. Icons should reduce noise, not create a memory test.

## Suggested Implementation Order

1. Hide admin/debug/system controls behind a settings drawer.
2. Replace the bottom bar with contextual actions.
3. Add a first-play objective chip and clearer Home affordances.
4. Convert mobile to map-first plus drawer panels.
5. Add Quick Start / recommended defaults for character creation.
6. Rework inventory into tabs and compact empty slots.

## Acceptance Checklist

- First playable desktop screen makes the next action obvious within 3 seconds.
- Normal play HUD uses less visual weight than the map and characters.
- Admin/debug controls are not visible in default player mode.
- Mobile first screen shows the map and primary action without scrolling past system controls.
- Disabled actions do not occupy primary-action space.
- Inventory lets a player identify equipped weapon, AC source, consumables, and chest contents without scanning every empty slot.
- Character creation offers a fast route to play and a clear customization route.
