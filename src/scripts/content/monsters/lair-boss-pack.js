(() => {
const lairDamage = (count, sides, bonus, type, label) => ({
  count,
  sides,
  bonus,
  type,
  attackType: "weapon",
  label: label ?? `${count}d${sides} + ${bonus} ${type}`,
});

function lairBoss(id, data) {
  window.DungeonContent.register("monsters", id, {
    sizeSquares: 2,
    behavior: "melee",
    speedFeet: 30,
    initiativeBonus: 1,
    ...data,
    tags: [...(data.tags ?? []), "lair", "boss"],
  });
}

lairBoss("lairYoungCragDragon", {
  name: "Young Crag Dragon",
  role: "Territorial mountain dragon",
  tags: ["dragon", "mountain", "highlands", "fire", "flying"],
  maxHp: 92,
  category: 3,
  xp: 900,
  ac: 16,
  attackBonus: 7,
  damage: lairDamage(2, 8, 4, "slashing", "2d8 + 4 slashing"),
  multiattack: { attacks: 2, damageMultiplier: 0.7 },
  specialAbility: ["Cragfire Breath", "Wing Buffet"],
  initiativeBonus: 2,
  speedFeet: 40,
  token: "D",
});

lairBoss("lairCliffWyvern", {
  name: "Cliff Wyvern",
  role: "Venomous cliff-nest predator",
  tags: ["wyvern", "beast", "mountain", "highlands", "poison", "flying"],
  maxHp: 78,
  category: 3,
  xp: 720,
  ac: 15,
  attackBonus: 7,
  damage: lairDamage(1, 12, 5, "piercing", "1d12 + 5 piercing"),
  specialAbility: ["Venom Sting", "Flyby Rake"],
  initiativeBonus: 3,
  speedFeet: 40,
  token: "W",
});

lairBoss("lairCliffManticore", {
  name: "Cliff Manticore",
  role: "Spined cliff hunter",
  tags: ["manticore", "beast", "mountain", "highlands", "badlands", "flying"],
  maxHp: 70,
  category: 3,
  xp: 650,
  ac: 14,
  attackBonus: 7,
  damage: lairDamage(2, 6, 4, "piercing", "2d6 + 4 piercing"),
  specialAbility: ["Tail Spikes", "Savage Pounce"],
  initiativeBonus: 2,
  speedFeet: 35,
  token: "M",
});

lairBoss("lairHillGiantNestkeeper", {
  name: "Hill Giant Nestkeeper",
  role: "Stone-throwing lair brute",
  tags: ["giant", "hill", "mountain", "highlands", "hills"],
  maxHp: 96,
  category: 3,
  xp: 820,
  ac: 14,
  attackBonus: 7,
  damage: lairDamage(2, 8, 5, "bludgeoning", "2d8 + 5 bludgeoning"),
  specialAbility: ["Boulder Throw", "Ground Slam"],
  speedFeet: 30,
  token: "G",
});

lairBoss("lairTwoMawChimera", {
  name: "Two-Maw Chimera",
  role: "Hybrid lair horror",
  tags: ["chimera", "monstrosity", "beast", "wasteland", "badlands", "mountain", "fire", "flying"],
  maxHp: 104,
  category: 4,
  xp: 1100,
  ac: 15,
  attackBonus: 8,
  damage: lairDamage(2, 8, 5, "slashing", "2d8 + 5 slashing"),
  multiattack: { attacks: 2, damageMultiplier: 0.75 },
  specialAbility: ["Split Roar", "Scorching Breath"],
  initiativeBonus: 2,
  speedFeet: 35,
  token: "C",
});

lairBoss("lairFungalTroll", {
  name: "Fungal Troll",
  role: "Regenerating bridge lurker",
  tags: ["troll", "giant", "swamp", "forest", "fungus"],
  maxHp: 86,
  category: 3,
  xp: 760,
  ac: 15,
  attackBonus: 7,
  damage: lairDamage(2, 6, 5, "slashing", "2d6 + 5 slashing"),
  specialAbility: ["Regenerate", "Rending Claws"],
  initiativeBonus: 1,
  speedFeet: 30,
  token: "T",
});

lairBoss("lairRootfangBeast", {
  name: "Rootfang Den-Beast",
  role: "Alpha beast of the den",
  tags: ["beast", "forest", "grassland", "hills", "predator"],
  maxHp: 64,
  category: 2,
  xp: 450,
  ac: 14,
  attackBonus: 6,
  damage: lairDamage(2, 6, 3, "piercing", "2d6 + 3 piercing"),
  specialAbility: ["Territorial Charge", "Blood Scent"],
  initiativeBonus: 3,
  speedFeet: 40,
  token: "B",
});

lairBoss("lairWebmotherSpider", {
  name: "Webmother Spider",
  role: "Brood-queen ambusher",
  tags: ["beast", "spider", "forest", "swamp", "poison"],
  maxHp: 58,
  category: 2,
  xp: 430,
  ac: 14,
  attackBonus: 6,
  damage: lairDamage(2, 4, 4, "piercing", "2d4 + 4 piercing"),
  damageResistances: ["poison"],
  specialAbility: ["Web Snare", "Venom Bite"],
  initiativeBonus: 3,
  speedFeet: 30,
  token: "S",
});
})();
