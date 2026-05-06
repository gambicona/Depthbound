(() => {
window.DungeonContent.register("traps", "needleTrap", {
  name: "Needle Trap",
  tags: ["trap", "chest", "needle", "piercing", "old-guardroom", "forest"],
  placement: "chest",
  spotDc: 12,
  spotDifficulty: "Normal",
  damage: { count: 1, sides: 4, type: "piercing" },
  description: "A spring-loaded needle hidden in the chest latch. It deals 1d4 piercing damage.",
});
})();
