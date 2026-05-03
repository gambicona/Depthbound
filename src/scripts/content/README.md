# Content modules

Content files register data with `window.DungeonContent` and should be loaded after
`registry.js` and before `app.js`.

Examples:

```html
<script src="src/scripts/content/classes/fighter.js" defer></script>
<script src="src/scripts/content/monsters/crypt-guard.js" defer></script>
```

Supported buckets for now:

- `classes`: player character templates
- `monsters`: monster templates and AI behavior keys
- `dungeons`: procedural or future premade dungeon definitions
- `lootTables`: loot entries for treasure generation
- `themes`: theme bundles that can point at monsters, loot tables, visuals, or rules

Each file should be small and self-contained:

```js
(() => {
window.DungeonContent.register("classes", "newClassId", {
  name: "Name",
  role: "Level 1 Class",
  maxHp: 10,
  ac: 14,
  attackBonus: 4,
  damage: { count: 1, sides: 6, bonus: 2, label: "1d6 + 2" },
  initiativeBonus: 2,
  speedFeet: 30,
  token: "N",
});
})();
```

Choose active defaults in `src/scripts/config.js` under `defaultContent`.
