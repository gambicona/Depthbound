(() => {
window.DungeonContent.register("furniture", "furnitureTemplate", {
  name: "Furniture Template",
  kind: "furniture",
  tags: ["furniture", "theme-or-biome-tag"],
  width: 1,
  height: 1,
  blocksMovement: true,
  blocksLineOfSight: false,
  interactable: false,
  spawnChance: 0.25,
  placement: "random-room-cell",
  damage: { count: 1, sides: 4, type: "piercing" },
  spotDcs: [
    { label: "Normal", dc: 12 },
  ],
  description: "Short object description for the inspection panel.",
});
})();
