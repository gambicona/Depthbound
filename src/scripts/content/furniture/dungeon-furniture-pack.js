(() => {
window.DungeonContent.register("furniture", "table", {
  name: "Table",
  kind: "furniture",
  tags: ["furniture", "wooden", "room", "old-guardroom"],
  width: 2,
  height: 1,
  blocksMovement: true,
  blocksLineOfSight: false,
  interactable: false,
  spawnChance: 0.5,
  placement: "room-center",
  description: "A heavy wooden table. Nothing special, right?",
});

window.DungeonContent.register("furniture", "bigRock", {
  name: "Big Rock",
  kind: "obstacle",
  tags: ["furniture", "obstacle", "stone", "rock", "forest", "old-guardroom"],
  width: 1,
  height: 1,
  blocksMovement: true,
  blocksLineOfSight: true,
  interactable: false,
  spawnChance: 0.18,
  placement: "random-room-cell",
  description: "A large chunk of stone. You have to go around it.",
});

window.DungeonContent.register("furniture", "chest", {
  name: "Dungeon Chest",
  kind: "container",
  tags: ["furniture", "container", "loot", "chest", "forest", "old-guardroom"],
  width: 1,
  height: 1,
  blocksMovement: true,
  blocksLineOfSight: false,
  interactable: true,
  spawnChance: 0.2,
  placement: "wall-adjacent",
  description: "A sturdy dungeon chest placed beside a wall. It can hold treasure.",
});

window.DungeonContent.register("furniture", "portal", {
  name: "Paired Portal",
  kind: "portal",
  tags: ["furniture", "portal", "magic", "old-guardroom"],
  width: 1,
  height: 1,
  blocksMovement: false,
  blocksLineOfSight: false,
  interactable: false,
  spawnChance: 0.35,
  placement: "paired-dungeon-cells",
  description: "A paired magical portal. In exploration, stepping on it teleports the character to its twin.",
});

window.DungeonContent.register("furniture", "trap", {
  name: "Spike Trap",
  kind: "trap",
  tags: ["trap", "hazard", "floor", "spike", "piercing", "old-guardroom", "forest"],
  width: 1,
  height: 1,
  blocksMovement: false,
  blocksLineOfSight: false,
  interactable: false,
  damage: { count: 1, sides: 4, type: "piercing" },
  spotDcs: [
    { label: "Easy", dc: 10 },
    { label: "Normal", dc: 12 },
    { label: "Hard", dc: 15 },
  ],
  description: "A concealed spike trap. It deals 1d4 piercing damage when a creature steps on it.",
});
})();
