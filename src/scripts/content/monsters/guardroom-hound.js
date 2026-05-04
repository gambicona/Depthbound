(() => {
window.DungeonContent.register("monsters", "guardroomHound", {
  name: "Guardroom Hound",
  role: "Undead hunting dog",
  maxHp: 12,
  category: 1,
  xp: 60,
  ac: 13,
  attackBonus: 5,
  damage: { count: 1, sides: 6, bonus: 2, type: "piercing", label: "1d6 + 2 piercing" },
  damageVulnerabilities: ["bludgeoning"],
  damageImmunities: ["poison"],
  initiativeBonus: 3,
  speedFeet: 40,
  behavior: "melee",
  token: "H",
  tokenArt: "assets/tokens/guardroom-hound.png",
});
})();