(() => {
window.DungeonContent.register("lootTables", "basicDungeon", {
  name: "Basic Dungeon Loot",
  itemIds: window.DungeonContent.list("items").map((item) => item.id),
  entries: [
    { id: "gold-small", name: "Small coin pouch", kind: "currency", weight: 60 },
    { id: "healing-potion", name: "Healing potion", kind: "consumable", weight: 25 },
    { id: "simple-scroll", name: "Simple scroll", kind: "scroll", weight: 15 },
  ],
});
})();
