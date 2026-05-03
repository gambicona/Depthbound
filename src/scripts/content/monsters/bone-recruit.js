(() => {
window.DungeonContent.register("monsters", "boneRecruit", {
  name: "Bone Recruit",
  role: "Weak skeletal guard",
  maxHp: 7,
  category: 1,
  xp: 25,
  ac: 12,
  attackBonus: 3,
  damage: {
    count: 1,
    sides: 4,
    bonus: 1,
    type: "bludgeoning",
    label: "1d4 + 1 bludgeoning"
  },
  initiativeBonus: 1,
  speedFeet: 30,
  behavior: "melee",
  token: "R",
});
})();