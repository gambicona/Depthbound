(() => {
function register(type, id, definition) {
  window.DungeonContent.register(type, id, { id, ...definition });
}

register("professions", "alchemist", {
  name: "Alchemist",
  serviceTypes: ["brewPotion", "refineMaterial", "convertMonsterParts"],
  acceptedTags: ["alchemy", "reagent", "herb", "mushroom", "poison", "venom", "blood", "dust", "ash", "oil", "essence", "extract", "crystal", "monster-part", "magic-reagent"],
  preferredCategories: ["herb", "alchemy reagent", "monster part", "arcane reagent"],
  recipeGroups: ["basic-alchemy"],
});

register("professions", "herbalist", {
  name: "Herbalist",
  serviceTypes: ["brewPotion", "refineMaterial", "cookFood"],
  acceptedTags: ["herb", "plant", "root", "flower", "mushroom", "food", "healing", "nature"],
  preferredCategories: ["herb", "food ingredient"],
  recipeGroups: ["basic-herbalism", "old-lady-cooking"],
});

register("professions", "cook", {
  name: "Cook",
  serviceTypes: ["cookFood", "craftQuestObject"],
  acceptedTags: ["food", "meat", "herb", "plant", "healing"],
  preferredCategories: ["food ingredient", "herb"],
  recipeGroups: ["old-lady-cooking"],
});

register("professions", "blacksmith", {
  name: "Blacksmith",
  serviceTypes: ["craftItem", "repairEquipment", "upgradeEquipment", "refineMaterial"],
  acceptedTags: ["metal", "iron", "steel", "repair", "upgrade", "building"],
  preferredCategories: ["metal", "repair material", "upgrade material"],
  recipeGroups: ["basic-smithing"],
});

register("professions", "relic-scholar", {
  name: "Relic Scholar",
  serviceTypes: ["identifyRelic", "cleanseCursedItem", "craftQuestObject"],
  acceptedTags: ["relic", "old-guardroom", "arcane-reagent", "magic-reagent", "undead", "bone"],
  preferredCategories: ["relic", "arcane reagent", "monster part"],
  recipeGroups: ["relic-work"],
});

register("recipes", "old-lady-hearty-soup", {
  name: "Hearty Soup",
  profession: "cook",
  serviceType: "cookFood",
  recipeGroup: "old-lady-cooking",
  output: { itemId: "old-lady-hearty-soup", quantity: 1 },
  requirements: [
    { label: "Any healing herb", quantity: 2, type: "component", tagsAll: ["herb", "healing"] },
    { label: "Any food ingredient", quantity: 1, type: "component", tagsAny: ["food", "meat"] },
  ],
  unlock: { flagsAny: ["oldLadyAvailable", "flag.oldLady.greenVinesDone"] },
  description: "A flexible cooking recipe for future NPC service UI.",
});

register("recipes", "basic-healing-potion", {
  name: "Healing Potion",
  profession: "alchemist",
  serviceType: "brewPotion",
  recipeGroup: "basic-alchemy",
  output: { itemId: "potion-healing", quantity: 1 },
  requirements: [
    { label: "Any common herb", quantity: 2, type: "component", tagsAll: ["herb"], rarity: "common" },
    { label: "Any alchemy reagent", quantity: 1, type: "component", tagsAny: ["alchemy", "reagent"] },
  ],
  description: "A starter recipe for an alchemist NPC that trades craft for materials instead of coins.",
});

register("recipes", "repair-armor-iron-scrap", {
  name: "Armor Repair",
  profession: "blacksmith",
  serviceType: "repairEquipment",
  recipeGroup: "basic-smithing",
  requirements: [{ label: "Iron repair material", quantity: 3, type: "component", tagsAll: ["iron", "repair"] }],
  description: "A data stub for future equipment repair services.",
});
})();
