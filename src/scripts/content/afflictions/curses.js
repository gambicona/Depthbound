(() => {
const afflictions = window.DungeonAfflictions ?? { poisons: {}, diseases: {}, curses: {} };
window.DungeonAfflictions = afflictions;

const curse = (id, definition) => {
  afflictions.curses[id] = {
    id,
    type: "curse",
    mode: "equip",
    removePriceCp: 0,
    requiredResource: "demon-ichor",
    requiredQuantity: 1,
    ...definition,
  };
};

curse("binding-spite", {
  name: "Binding Spite",
  description: "The item refuses to leave its bearer until the curse is broken.",
  cannotUnequip: true,
  status: { label: "Binding Spite", curse: true, saveBonus: -1, conditionDescription: "Cursed. This item cannot be unequipped until Remove Curse breaks the binding." },
});

curse("hungry-shadow", {
  name: "Hungry Shadow",
  description: "The curse clings after the item is removed and makes necrotic wounds bite deeper.",
  persistsAfterUnequip: true,
  status: { label: "Hungry Shadow", curse: true, vulnerabilities: ["necrotic"], conditionDescription: "Cursed. Necrotic damage is more dangerous until the curse is removed." },
});

curse("crooked-fortune", {
  name: "Crooked Fortune",
  description: "Good luck sours into hesitation and bad timing.",
  status: { label: "Crooked Fortune", curse: true, attackBonus: -1, skillBonus: -1, conditionDescription: "Cursed. Attacks and skill checks suffer a small penalty." },
});

curse("leaden-steps", {
  name: "Leaden Steps",
  description: "The bearer moves as if the floor remembers every mistake.",
  status: { label: "Leaden Steps", curse: true, speedBonusFeet: -10, conditionDescription: "Cursed. Movement speed is reduced." },
});

curse("pain-tithe", {
  name: "Pain Tithe",
  description: "Using the item exacts a blood-price.",
  mode: "use",
  persistsAfterUnequip: true,
  status: { label: "Pain Tithe", curse: true, maxHpBonus: -5, conditionDescription: "Cursed. Maximum HP is reduced until the curse is removed." },
});
})();
