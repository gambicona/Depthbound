# Refactor Notes

## Extracted Modules

- `src/scripts/app/bootstrap.js`: shared constants, mutable runtime state, DOM element references, species data, sound data, equipment slots, and class creation tables.
- `src/scripts/app/game-state.js`: adventure/home state creation, race and class setup, inventory normalization, equipment rules, derived stats, monster and dungeon object creation, save/load normalization.
- `src/scripts/app/ui-dialogs-character.js`: save slot UI, dialogs, character creation, race/class/ability selection, tutorial setup, adventure start/load/save flow.
- `src/scripts/app/combat-map.js`: death saves, turn resources, visibility and fog of war, doors, line of sight, attack targeting, combat resolution, loot, traps, spells, and encounter flow.
- `src/scripts/app/movement-ai-input.js`: movement pathing, group movement, keyboard/drag input, admin teleport, monster AI planning and execution, map panning.
- `src/scripts/app/rendering-inventory.js`: token and tile rendering, object/character inspection panels, home chest/planning table UI, inventory/store/use-item/ability/short-rest menus, equipment drag and drop, control rendering.
- `src/scripts/app.js`: final bootstrap tail, performance overlay helpers, `render()`, event listener wiring, and startup calls.

## Stayed In Main File

- The final event wiring remains in `src/scripts/app.js` so browser load order is easy to inspect.
- The render entrypoint and performance overlay update remain there because they coordinate the extracted rendering and control functions.

## Circular Dependency Risks

- The files are still loaded as ordered browser scripts, not ES modules. They share the same global lexical scope and rely on `index.html` script order.
- Several systems still call across boundaries, especially combat, rendering, inventory, and state normalization. This preserves behavior but means the next refactor should introduce explicit namespaces or dependency objects before moving to ES modules.
- `rendering-inventory.js` depends on combat/state helpers, while combat helpers call `render()`. This is an existing runtime relationship preserved by script order.

## Behavior Intentionally Left Unchanged

- Game mechanics, combat math, pathfinding behavior, inventory actions, save format handling, AI behavior, spell behavior, and dungeon generation logic were left unchanged.
- The refactor only moved existing code into themed files and updated script loading.
- Missing weapon and armor proficiency warnings now render in reddish text for visibility; the underlying proficiency mechanics are unchanged from the previous fix.
