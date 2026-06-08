(() => {
const empty = [];

function kebab(id) {
  return id.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function diceLabel(damage) {
  return `${damage.count}d${damage.sides}${damage.bonus ? ` + ${damage.bonus}` : ""} ${damage.type}`;
}

function damage(count, sides, bonus, type, attackType, range, weaponName) {
  const profile = { count, sides, bonus, type, attackType, label: diceLabel({ count, sides, bonus, type }), range };
  if (weaponName) profile.weaponName = weaponName;
  return profile;
}

function melee(feet = 5) {
  return { kind: "melee", feet };
}

function ranged(feet = 60, long = feet * 3) {
  return { kind: "ranged", normal: feet, long, feet };
}

function mods(str, dex, con, int, wis, cha) {
  return { str, dex, con, int, wis, cha };
}

function scores(abilityMods) {
  return Object.fromEntries(Object.entries(abilityMods).map(([key, value]) => [key, 10 + value * 2]));
}

function kit(mainHand, torso, options = {}) {
  const items = [mainHand, options.offHand, torso, options.quiver].filter(Boolean);
  return {
    equipment: {
      mainHand,
      offHand: options.offHand ?? null,
      head: null,
      torso: torso ?? null,
      boots: null,
      cloak: null,
      bracers: null,
      gauntlets: null,
      ring1: null,
      ring2: null,
      amulet: null,
      quiver: options.quiver ?? null,
    },
    inventory: {
      money: { cp: 0, sp: 0, gp: 0 },
      items,
    },
  };
}

function registerHumanoid(entry) {
  const boss = entry.tags.includes("boss");
  const abilityMods = entry.abilityMods;
  window.DungeonContent.register("monsters", entry.id, {
    name: entry.name,
    role: entry.role,
    tags: ["humanoid", "urban", ...entry.tags],
    maxHp: entry.maxHp,
    category: entry.category,
    multiattack: entry.multiattack ? { attacks: entry.multiattack } : undefined,
    xp: entry.xp,
    ac: entry.ac,
    attackBonus: entry.attackBonus,
    damage: entry.damage,
    damageResistances: entry.damageResistances ?? empty,
    damageVulnerabilities: empty,
    damageImmunities: empty,
    conditionImmunities: empty,
    specialAbility: entry.specialAbility ?? empty,
    abilityScores: scores(abilityMods),
    abilityMods,
    baseAttackAbilityMod: entry.baseAttackAbilityMod,
    initiativeBonus: entry.initiativeBonus,
    speedFeet: entry.speedFeet ?? 30,
    behavior: entry.behavior,
    token: entry.token,
    tokenArt: entry.tokenArt ?? `assets/tokens/${kebab(entry.id)}.jpg`,
    recruitClassId: entry.recruitClassId,
    recruitMockLevel: entry.recruitMockLevel,
    flying: false,
    ...entry.kit,
    extraLoot: boss ? [{ kind: "randomEquipment" }] : entry.extraLoot ?? empty,
  });
}

const packs = [
  {
    category: 1,
    xp: [15, 5, 5, 15, 255],
    entries: [
      ["cutpurseKnifeman", "Cutpurse Knifeman", "Fast melee striker", ["criminal", "skirmisher"], 13, 14, 4, damage(1, 4, 3, "piercing", "weapon", melee(), "Dagger"), mods(0, 3, 0, 0, 1, 0), 3, "melee", "K", kit("dagger", "leather"), ["Hamstring"]],
      ["roadsideBandit", "Roadside Bandit", "Basic melee thug", ["criminal", "brute"], 16, 13, 4, damage(1, 6, 2, "bludgeoning", "weapon", melee(), "Club"), mods(2, 1, 1, 0, 0, 0), 1, "melee", "B", kit("club", "leather"), []],
      ["slingRuffian", "Sling Ruffian", "Ranged skirmisher", ["criminal", "ranged", "skirmisher"], 12, 13, 4, damage(1, 4, 3, "bludgeoning", "weapon", ranged(30, 120), "Sling"), mods(0, 3, 0, 0, 1, 0), 3, "rangedKiter", "S", kit("sling", "leather", { quiver: "pebbles-20" }), []],
      ["torchThug", "Torch-Thug", "Burning utility bruiser", ["criminal", "brute", "fire"], 18, 13, 4, damage(1, 6, 2, "fire", "weapon", melee(), "Burning Club"), mods(2, 1, 1, 0, 0, 0), 1, "melee", "T", kit("club", "hide"), ["Cinder Body"]],
      ["apprenticeHexer", "Apprentice Hexer", "Category 1 humanoid boss caster", ["criminal", "caster", "boss"], 26, 13, 5, damage(1, 8, 2, "necrotic", "spell", ranged(50, 150), "Hex Bolt"), mods(0, 2, 1, 2, 1, 1), 2, "rangedKiter", "H", kit("dagger", "leather"), ["Dread Whisper"]],
    ],
  },
  {
    category: 2,
    xp: [60, 65, 75, 75, 1945],
    entries: [
      ["banditArcher", "Bandit Archer", "Reliable ranged pressure", ["criminal", "ranged"], 27, 14, 5, damage(1, 6, 3, "piercing", "weapon", ranged(80, 320), "Shortbow"), mods(0, 3, 1, 0, 1, 0), 3, "rangedKiter", "A", kit("shortbow", "leather", { quiver: "arrows-20" }), []],
      ["shieldedFootpad", "Shielded Footpad", "Defensive melee guard", ["criminal", "defender"], 34, 16, 5, damage(1, 6, 3, "slashing", "weapon", melee(), "Scimitar"), mods(2, 2, 2, 0, 1, 0), 2, "melee", "F", kit("scimitar", "studded-leather", { offHand: "shield" }), ["Shellguard"]],
      ["backAlleyDuelist", "Back-Alley Duelist", "Accurate melee striker", ["criminal", "duelist", "skirmisher"], 29, 15, 6, damage(1, 8, 3, "piercing", "weapon", melee(), "Rapier"), mods(0, 3, 1, 0, 1, 1), 3, "melee", "D", kit("rapier", "studded-leather"), ["Parrying Fade"]],
      ["noviceBattleMage", "Novice Battle-Mage", "Elemental novice caster", ["mage", "caster", "fire"], 25, 13, 5, damage(1, 10, 3, "fire", "spell", ranged(60, 180), "Elemental Bolt"), mods(0, 2, 1, 3, 1, 0), 2, "rangedKiter", "M", kit("quarterstaff", "leather"), ["Fireball"]],
      ["gangEnforcer", "Gang Enforcer", "Category 2 humanoid boss bruiser", ["criminal", "brute", "boss"], 52, 15, 6, damage(1, 10, 4, "bludgeoning", "weapon", melee(), "Maul"), mods(4, 1, 3, 0, 1, 1), 1, "melee", "E", kit("maul", "scale-mail"), ["Rush"]],
    ],
  },
  {
    category: 3,
    xp: [370, 405, 425, 425, 3485],
    entries: [
      ["mercenarySpearman", "Mercenary Spearman", "Reach melee soldier", ["mercenary", "soldier", "reach"], 46, 16, 7, damage(1, 10, 4, "piercing", "weapon", melee(10), "Pike"), mods(4, 1, 2, 0, 1, 0), 1, "melee", "P", kit("pike", "chain-mail"), ["Lunge"]],
      ["crossbowVeteran", "Crossbow Veteran", "Heavy ranged striker", ["mercenary", "soldier", "ranged"], 40, 15, 7, damage(1, 10, 4, "piercing", "weapon", ranged(100, 400), "Heavy Crossbow"), mods(1, 4, 2, 0, 1, 0), 2, "rangedKiter", "C", kit("crossbow-heavy", "chain-shirt", { quiver: "bolts-20" }), ["Hellbow Pin"]],
      ["bladeAdept", "Blade Adept", "Agile parrying melee", ["duelist", "skirmisher"], 43, 16, 7, damage(1, 8, 4, "slashing", "weapon", melee(), "Longsword"), mods(2, 4, 2, 0, 1, 1), 4, "melee", "L", kit("longsword", "breastplate"), ["Parrying Fade"]],
      ["cultAcolyte", "Cult Acolyte", "Humanoid support caster", ["cultist", "caster", "support"], 37, 14, 6, damage(1, 10, 3, "necrotic", "spell", ranged(60, 180), "Cult Hex"), mods(0, 2, 1, 2, 3, 1), 2, "rangedKiter", "U", kit("mace", "leather"), ["Battlefield Healing"]],
      ["raidCaptain", "Raid Captain", "Category 3 humanoid boss leader", ["mercenary", "soldier", "leader", "boss"], 76, 17, 8, damage(1, 8, 5, "slashing", "weapon", melee(), "Longsword"), mods(4, 2, 3, 1, 2, 2), 2, "melee", "R", kit("longsword", "chain-mail", { offHand: "shield" }), ["Bark Orders"]],
    ],
  },
  {
    category: 4,
    xp: [1005, 1095, 1095, 1175, 7810],
    entries: [
      ["blackknifeAssassin", "Blackknife Assassin", "Opening burst striker", ["assassin", "skirmisher"], 58, 17, 8, damage(2, 6, 5, "piercing", "weapon", melee(), "Blackknife"), mods(0, 5, 2, 1, 2, 1), 5, "melee", "N", kit("shortsword", "studded-leather"), ["Venom"]],
      ["warPriest", "War Priest", "Armored support bruiser", ["cultist", "priest", "support"], 70, 18, 8, damage(1, 8, 5, "radiant", "weapon", melee(), "Warhammer Smite"), mods(4, 1, 3, 1, 3, 2), 1, "melee", "W", kit("warhammer", "chain-mail", { offHand: "shield" }), ["Battlefield Healing"]],
      ["pyromancerInitiate", "Pyromancer Initiate", "Fragile area caster", ["mage", "caster", "fire"], 52, 14, 8, damage(2, 6, 4, "fire", "spell", ranged(80, 240), "Flame Bolt"), mods(0, 2, 2, 5, 1, 1), 2, "rangedKiter", "Y", kit("quarterstaff", "leather"), ["Fireball"]],
      ["ironboundGuard", "Ironbound Guard", "Heavy protective tank", ["soldier", "defender"], 82, 19, 8, damage(1, 8, 5, "bludgeoning", "weapon", melee(), "Warhammer"), mods(5, 0, 4, 0, 2, 0), 0, "melee", "G", kit("warhammer", "splint", { offHand: "shield" }), ["Iron Stance"]],
      ["alchemistBomber", "Alchemist Bomber", "Category 4 humanoid boss controller", ["criminal", "alchemist", "ranged", "boss", "fire"], 88, 16, 9, damage(2, 6, 4, "fire", "weapon", ranged(60, 180), "Bomb Satchel"), mods(1, 4, 3, 4, 2, 1), 4, "rangedKiter", "O", kit("dagger", "studded-leather"), ["Fireball", "Black Smoke Cloud"]],
    ],
  },
  {
    category: 5,
    xp: [2465, 2630, 2795, 2630, 16750],
    entries: [
      ["veteranDuelist", "Veteran Duelist", "Multiattack melee elite", ["duelist"], 88, 18, 9, damage(1, 8, 5, "piercing", "weapon", melee(), "Rapier"), mods(1, 5, 3, 1, 2, 2), 5, "melee", "V", kit("rapier", "breastplate"), ["Parrying Fade"], 2],
      ["arcaneMarksman", "Arcane Marksman", "Magic ranged hybrid", ["mage", "ranged"], 76, 16, 9, damage(1, 8, 6, "force", "spell", ranged(150, 600), "Arcane Longbow"), mods(0, 5, 2, 3, 2, 1), 5, "rangedKiter", "A", kit("longbow", "studded-leather", { quiver: "arrows-20" }), ["Hellbow Pin"]],
      ["oathbreakerKnight", "Oathbreaker Knight", "Dark heavy bruiser", ["soldier", "knight", "brute"], 105, 20, 10, damage(2, 6, 5, "necrotic", "weapon", melee(), "Dark Greatsword"), mods(5, 1, 4, 1, 2, 3), 1, "melee", "O", kit("greatsword", "plate"), ["Dread Whisper"], 2],
      ["battlefieldMedic", "Battlefield Medic", "Elite humanoid healer", ["support", "soldier"], 78, 17, 8, damage(1, 8, 4, "bludgeoning", "weapon", melee(), "Mace"), mods(2, 2, 3, 2, 5, 2), 2, "melee", "M", kit("mace", "breastplate", { offHand: "shield" }), ["Battlefield Healing"]],
      ["shadowMonk", "Shadow Monk", "Category 5 humanoid boss mobile striker", ["assassin", "monk", "skirmisher", "boss"], 118, 18, 10, damage(2, 6, 6, "psychic", "weapon", melee(), "Shadow Strike"), mods(1, 6, 3, 1, 4, 2), 6, "melee", "S", kit("shortsword", "studded-leather"), ["Fading Retreat", "Pounce"], 2],
    ],
  },
  {
    category: 6,
    xp: [3650, 3840, 3945, 3840, 24340],
    entries: [
      ["magebreakerSentinel", "Magebreaker Sentinel", "Anti-caster armored tank", ["soldier", "defender", "magebreaker"], 132, 20, 10, damage(1, 10, 6, "slashing", "weapon", melee(10), "Halberd"), mods(5, 1, 5, 1, 3, 1), 1, "melee", "M", kit("halberd", "plate"), ["Locking Chain"], 2],
      ["bloodCultHierophant", "Blood Cult Hierophant", "Ritual sacrifice caster", ["cultist", "caster", "support"], 104, 16, 10, damage(2, 8, 5, "necrotic", "spell", ranged(80, 240), "Blood Rite"), mods(0, 2, 4, 3, 5, 3), 2, "rangedKiter", "H", kit("mace", "breastplate"), ["Battlefield Healing", "Soul Siphon"]],
      ["executionerChampion", "Executioner Champion", "Heavy wounded-target striker", ["soldier", "brute"], 142, 18, 11, damage(1, 12, 7, "slashing", "weapon", melee(), "Greataxe"), mods(6, 1, 5, 0, 2, 2), 1, "melee", "E", kit("greataxe", "half-plate"), ["Charge"], 2],
      ["masterThief", "Master Thief", "Control rogue elite", ["criminal", "assassin", "skirmisher"], 102, 18, 11, damage(1, 8, 6, "piercing", "weapon", melee(), "Rapier"), mods(0, 6, 3, 3, 3, 3), 6, "melee", "T", kit("rapier", "studded-leather"), ["Black Smoke Cloud", "Hamstring"], 2],
      ["stormcallerAdept", "Stormcaller Adept", "Category 6 humanoid boss area caster", ["mage", "caster", "storm", "boss"], 136, 17, 11, damage(3, 6, 5, "lightning", "spell", ranged(90, 270), "Storm Bolt"), mods(0, 3, 4, 5, 4, 2), 3, "rangedKiter", "C", kit("quarterstaff", "breastplate"), ["Thunderclap", "Crackling Pulse"]],
    ],
  },
  {
    category: 7,
    xp: [5970, 6195, 6430, 6520, 33610],
    entries: [
      ["crimsonWarlord", "Crimson Warlord", "Leader bruiser", ["soldier", "leader"], 168, 20, 12, damage(2, 6, 7, "slashing", "weapon", melee(), "Greatsword"), mods(6, 2, 5, 2, 3, 5), 2, "melee", "W", kit("greatsword", "plate"), ["Bark Orders", "Bloodfrenzy"], 2],
      ["archduelistOfTheSilverMask", "Archduelist of the Silver Mask", "Boss-like precision striker", ["duelist", "skirmisher"], 148, 21, 13, damage(1, 8, 8, "piercing", "weapon", melee(), "Silver Rapier"), mods(1, 7, 4, 2, 4, 4), 7, "melee", "D", kit("rapier", "breastplate"), ["Parry Storm"], 3],
      ["infernalContractMage", "Infernal Contract Mage", "Dark fire and necrotic caster", ["mage", "caster", "fire"], 132, 17, 12, damage(3, 8, 6, "fire", "spell", ranged(90, 270), "Contract Flame"), mods(0, 3, 4, 6, 3, 5), 3, "rangedKiter", "I", kit("quarterstaff", "studded-leather"), ["Fireball", "Final Bargain"]],
      ["royalInquisitor", "Royal Inquisitor", "Control elite suppressor", ["priest", "leader", "controller"], 152, 19, 12, damage(2, 8, 6, "radiant", "weapon", melee(), "Inquisitor's Mace"), mods(4, 2, 4, 3, 6, 5), 2, "melee", "Q", kit("mace", "plate", { offHand: "shield" }), ["Condemning Mark", "Battlefield Healing"], 2],
      ["runeboundGuardian", "Runebound Guardian", "Category 7 humanoid boss arcane tank", ["mage", "soldier", "defender", "boss"], 196, 21, 13, damage(2, 8, 7, "force", "weapon", melee(), "Runeblade"), mods(6, 1, 6, 5, 3, 2), 1, "melee", "R", kit("longsword", "plate", { offHand: "shield" }), ["Mirror Double", "Profane Radiance"], 2],
    ],
  },
  {
    category: 8,
    xp: [10330, 10855, 11365, 11365, 23620],
    entries: [
      ["archmageOfTheBrokenTower", "Archmage of the Broken Tower", "Major multi-school caster", ["mage", "caster"], 164, 18, 13, damage(4, 8, 7, "force", "spell", ranged(100, 300), "Archmage Bolt"), mods(0, 4, 5, 8, 5, 4), 4, "rangedKiter", "A", kit("quarterstaff", "studded-leather"), ["Fireball", "Mirror Double"], 1],
      ["grandmasterAssassin", "Grandmaster Assassin", "Extreme isolated-target striker", ["assassin", "skirmisher"], 178, 21, 14, damage(2, 8, 8, "poison", "weapon", melee(), "Venomed Blade"), mods(1, 8, 5, 3, 5, 3), 8, "melee", "G", kit("shortsword", "studded-leather"), ["Venom", "Fading Retreat"], 3],
      ["dreadBannerGeneral", "Dread Banner General", "Battlefield commander", ["soldier", "leader"], 210, 21, 14, damage(2, 8, 8, "slashing", "weapon", melee(), "Banner Blade"), mods(7, 2, 6, 4, 4, 6), 2, "melee", "B", kit("longsword", "plate", { offHand: "shield" }), ["Bark Orders", "Duke's War Cry"], 2],
      ["saintOfTheIronChain", "Saint of the Iron Chain", "Divine armored bruiser", ["priest", "brute"], 220, 22, 14, damage(3, 8, 7, "radiant", "weapon", melee(), "Chain Saint Hammer"), mods(7, 1, 6, 2, 7, 5), 1, "melee", "S", kit("warhammer", "plate", { offHand: "shield" }), ["Battlefield Healing", "Profane Radiance"], 2],
      ["voidbladeMystic", "Voidblade Mystic", "Category 8 humanoid boss teleporting spellblade", ["mage", "duelist", "skirmisher", "boss"], 238, 21, 15, damage(3, 8, 8, "force", "weapon", melee(), "Voidblade"), mods(3, 7, 6, 6, 5, 5), 7, "melee", "V", kit("rapier", "breastplate"), ["Rift Charge", "Mirror Double"], 3],
    ],
  },
  {
    category: 9,
    xp: [14750, 15245, 15735, 16230, 35575],
    entries: [
      ["theBlackCrownStrategist", "The Black Crown Strategist", "Master turn-order leader", ["leader", "controller"], 230, 20, 15, damage(3, 8, 8, "psychic", "spell", ranged(100, 300), "Crown Command"), mods(1, 4, 6, 8, 7, 7), 4, "rangedKiter", "C", kit("rapier", "breastplate"), ["Bark Orders", "Condemning Mark"], 1],
      ["elderBloodMagus", "Elder Blood Magus", "Sacrifice-powered caster", ["cultist", "caster"], 220, 18, 15, damage(4, 8, 8, "necrotic", "spell", ranged(100, 300), "Elder Blood Spell"), mods(0, 4, 7, 8, 6, 6), 4, "rangedKiter", "M", kit("dagger", "studded-leather"), ["Soul Siphon", "Fireball"], 1],
      ["perfectedDuelist", "Perfected Duelist", "Near-final solo striker", ["duelist", "skirmisher"], 242, 23, 16, damage(2, 8, 9, "piercing", "weapon", melee(), "Perfected Rapier"), mods(2, 9, 6, 4, 6, 5), 9, "melee", "P", kit("rapier", "breastplate"), ["Parry Storm", "Mirror Double"], 3],
      ["titanSlayerChampion", "Titan-Slayer Champion", "Armor-breaking martial boss", ["soldier", "brute"], 286, 21, 16, damage(2, 12, 9, "slashing", "weapon", melee(), "Titan-Slayer Greataxe"), mods(9, 2, 7, 2, 5, 4), 2, "melee", "T", kit("greataxe", "plate"), ["Shattering Charge"], 3],
      ["oracleOfRuin", "Oracle of Ruin", "Category 9 humanoid boss doom caster", ["mage", "caster", "controller", "boss"], 270, 20, 16, damage(4, 10, 8, "psychic", "spell", ranged(120, 360), "Ruin Oracle Spell"), mods(0, 4, 7, 8, 8, 7), 4, "rangedKiter", "O", kit("quarterstaff", "breastplate"), ["Void Bell Toll", "Condemning Mark"], 1],
    ],
  },
  {
    category: 10,
    xp: [24415, 25390, 26365, 27350, 30270],
    entries: [
      ["theTyrantKingAscendant", "The Tyrant-King Ascendant", "Final martial commander", ["soldier", "leader"], 330, 23, 17, damage(3, 8, 10, "slashing", "weapon", melee(), "Ascendant King's Blade"), mods(9, 3, 8, 5, 6, 8), 3, "melee", "K", kit("greatsword", "plate"), ["Bark Orders", "King's Return"], 3],
      ["archlichHunterMagister", "Archlich-Hunter Magister", "Ultimate forbidden anti-life caster", ["mage", "caster"], 286, 20, 17, damage(5, 10, 9, "necrotic", "spell", ranged(120, 360), "Anti-Life Spell"), mods(0, 4, 7, 9, 7, 7), 4, "rangedKiter", "L", kit("quarterstaff", "breastplate"), ["Forbidden Chorus", "Mirror Double"], 1],
      ["theNamelessSwordSaint", "The Nameless Sword Saint", "Ultimate minimalist duelist", ["duelist", "skirmisher"], 310, 24, 18, damage(3, 8, 10, "force", "weapon", melee(), "Nameless Blade"), mods(4, 10, 7, 4, 8, 6), 10, "melee", "N", kit("longsword", "breastplate"), ["Parry Storm", "Rift Charge"], 4],
      ["highProphetOfTheEndingStar", "High Prophet of the Ending Star", "Apocalyptic ritual caster", ["cultist", "caster"], 300, 21, 18, damage(5, 10, 10, "radiant", "spell", ranged(120, 360), "Ending Star"), mods(0, 4, 8, 8, 9, 8), 4, "rangedKiter", "P", kit("mace", "plate", { offHand: "shield" }), ["Chaos Star", "Battlefield Renewal"], 1],
      ["warmasterOfTenThousandBlades", "Warmaster of Ten Thousand Blades", "Category 10 humanoid final commander", ["soldier", "leader", "boss"], 380, 24, 19, damage(4, 8, 10, "slashing", "weapon", melee(), "Ten Thousand Blades"), mods(10, 4, 9, 6, 7, 8), 4, "melee", "W", kit("greatsword", "plate"), ["Whirling Blades", "Bark Orders", "King's Return"], 4],
    ],
  },
];

const classRecruitBases = [
  {
    classId: "barbarian",
    className: "Barbarian",
    title: "Rage-Blood Bruiser",
    tags: ["recruit", "barbarian", "brute"],
    behavior: "melee",
    token: "B",
    weapon: "Greataxe",
    kit: ["greataxe", "hide"],
    attackType: "slashing",
    ability: mods(5, 1, 4, 0, 2, 0),
    hp: 24,
    ac: 14,
    attackBonus: 5,
    damage: [1, 12, 3],
    abilities: ["Rage"],
    tokenArt: "assets/tokens/quake-fist-champion.jpg",
  },
  {
    classId: "bard",
    className: "Bard",
    title: "Roadsong Support",
    tags: ["recruit", "bard", "support", "caster"],
    behavior: "rangedKiter",
    token: "D",
    weapon: "Vicious Mockery",
    kit: ["rapier", "leather"],
    attackType: "psychic",
    attackKind: "spell",
    ability: mods(0, 3, 1, 1, 1, 4),
    hp: 17,
    ac: 14,
    attackBonus: 5,
    damage: [1, 8, 3],
    abilities: ["Bardic Inspiration", "Healing Word"],
    tokenArt: "assets/tokens/cloudstep-duelist.jpg",
  },
  {
    classId: "cleric",
    className: "Cleric",
    title: "Temple Field Healer",
    tags: ["recruit", "cleric", "priest", "support"],
    behavior: "melee",
    token: "C",
    weapon: "Mace",
    kit: ["mace", "scale-mail", "shield"],
    attackType: "radiant",
    ability: mods(2, 0, 3, 1, 5, 2),
    hp: 20,
    ac: 17,
    attackBonus: 5,
    damage: [1, 8, 3],
    abilities: ["Battlefield Healing", "Bless"],
    tokenArt: "assets/tokens/corpse-candle-acolyte.jpg",
  },
  {
    classId: "druid",
    className: "Druid",
    title: "Greenward Mender",
    tags: ["recruit", "druid", "support", "caster"],
    behavior: "rangedKiter",
    token: "U",
    weapon: "Thorn Lash",
    kit: ["quarterstaff", "leather"],
    attackType: "piercing",
    attackKind: "spell",
    ability: mods(0, 2, 2, 1, 5, 1),
    hp: 18,
    ac: 14,
    attackBonus: 5,
    damage: [1, 8, 3],
    abilities: ["Battlefield Healing", "Entangle"],
    tokenArt: "assets/tokens/claybinder-acolyte.jpg",
  },
  {
    classId: "fighter",
    className: "Fighter",
    title: "Company Veteran",
    tags: ["recruit", "fighter", "soldier", "defender"],
    behavior: "melee",
    token: "F",
    weapon: "Longsword",
    kit: ["longsword", "chain-mail", "shield"],
    attackType: "slashing",
    ability: mods(4, 1, 3, 0, 2, 1),
    hp: 23,
    ac: 18,
    attackBonus: 5,
    damage: [1, 8, 3],
    abilities: ["Second Wind", "Action Surge"],
    tokenArt: "assets/tokens/rusted-shieldbearer.jpg",
  },
  {
    classId: "monk",
    className: "Monk",
    title: "Open-Hand Wanderer",
    tags: ["recruit", "monk", "skirmisher"],
    behavior: "melee",
    token: "K",
    weapon: "Open-Hand Strike",
    kit: ["quarterstaff", "leather"],
    attackType: "bludgeoning",
    ability: mods(1, 5, 2, 0, 4, 0),
    hp: 18,
    ac: 16,
    attackBonus: 5,
    damage: [1, 6, 3],
    abilities: ["Flurry of Blows", "Patient Defense"],
    tokenArt: "assets/tokens/glasswind-assassin.jpg",
  },
  {
    classId: "paladin",
    className: "Paladin",
    title: "Oathbound Protector",
    tags: ["recruit", "paladin", "defender", "support"],
    behavior: "melee",
    token: "P",
    weapon: "Oathblade",
    kit: ["longsword", "chain-mail", "shield"],
    attackType: "radiant",
    ability: mods(4, 0, 3, 0, 2, 4),
    hp: 23,
    ac: 18,
    attackBonus: 5,
    damage: [1, 8, 3],
    abilities: ["Lay on Hands", "Divine Smite"],
    tokenArt: "assets/tokens/oathbound-jailer.jpg",
  },
  {
    classId: "ranger",
    className: "Ranger",
    title: "Trail Hunter",
    tags: ["recruit", "ranger", "ranged", "skirmisher"],
    behavior: "rangedKiter",
    token: "R",
    weapon: "Longbow",
    kit: ["longbow", "studded-leather", null, "arrows-20"],
    attackType: "piercing",
    ability: mods(1, 5, 2, 0, 3, 0),
    hp: 20,
    ac: 15,
    attackBonus: 5,
    damage: [1, 8, 3],
    abilities: ["Hunter's Mark", "Ambush Shot"],
    tokenArt: "assets/tokens/black-arrow-sentry.jpg",
  },
  {
    classId: "rogue",
    className: "Rogue",
    title: "Lockstep Cutpurse",
    tags: ["recruit", "rogue", "skirmisher", "criminal"],
    behavior: "melee",
    token: "G",
    weapon: "Sneakblade",
    kit: ["rapier", "studded-leather"],
    attackType: "piercing",
    ability: mods(0, 5, 1, 2, 2, 2),
    hp: 17,
    ac: 15,
    attackBonus: 5,
    damage: [1, 8, 3],
    abilities: ["Sneak Attack", "Cunning Action"],
    tokenArt: "assets/tokens/smoke-veil-assassin.jpg",
  },
  {
    classId: "sorcerer",
    className: "Sorcerer",
    title: "Wild Spark Caster",
    tags: ["recruit", "sorcerer", "caster"],
    behavior: "rangedKiter",
    token: "S",
    weapon: "Chaos Bolt",
    kit: ["dagger", "leather"],
    attackType: "force",
    attackKind: "spell",
    ability: mods(0, 3, 2, 1, 1, 5),
    hp: 15,
    ac: 13,
    attackBonus: 5,
    damage: [1, 10, 3],
    abilities: ["Metamagic Spark", "Chaos Bolt"],
    tokenArt: "assets/tokens/graveflame-warlock.jpg",
  },
  {
    classId: "warlock",
    className: "Warlock",
    title: "Pactbound Blaster",
    tags: ["recruit", "warlock", "caster"],
    behavior: "rangedKiter",
    token: "W",
    weapon: "Eldritch Blast",
    kit: ["dagger", "studded-leather"],
    attackType: "force",
    attackKind: "spell",
    ability: mods(0, 3, 2, 1, 1, 5),
    hp: 17,
    ac: 14,
    attackBonus: 5,
    damage: [1, 10, 3],
    abilities: ["Eldritch Blast", "Hex"],
    tokenArt: "assets/tokens/ruin-choir-warlock.jpg",
  },
  {
    classId: "wizard",
    className: "Wizard",
    title: "Book-Taught Arcanist",
    tags: ["recruit", "wizard", "caster"],
    behavior: "rangedKiter",
    token: "Z",
    weapon: "Arcane Bolt",
    kit: ["quarterstaff", "leather"],
    attackType: "force",
    attackKind: "spell",
    ability: mods(0, 2, 1, 5, 2, 0),
    hp: 14,
    ac: 13,
    attackBonus: 5,
    damage: [1, 10, 3],
    abilities: ["Fireball", "Shield"],
    tokenArt: "assets/tokens/oracle-of-dead-stars.jpg",
  },
];

const classRecruitTiers = [
  { level: 1, category: 1, name: "Novice", hp: 0, ac: 0, attack: 0, damage: 0, multiattack: 1, costCp: 1400 },
  { level: 3, category: 2, name: "Tested", hp: 14, ac: 1, attack: 1, damage: 1, multiattack: 1, costCp: 3200 },
  { level: 5, category: 3, name: "Seasoned", hp: 34, ac: 2, attack: 2, damage: 2, multiattack: 2, costCp: 7600 },
  { level: 7, category: 4, name: "Veteran", hp: 58, ac: 3, attack: 3, damage: 3, multiattack: 2, costCp: 13500 },
  { level: 9, category: 5, name: "Hardened", hp: 86, ac: 4, attack: 4, damage: 4, multiattack: 2, costCp: 21000 },
  { level: 11, category: 6, name: "Elite", hp: 118, ac: 5, attack: 5, damage: 5, multiattack: 2, costCp: 32000 },
  { level: 13, category: 7, name: "Master", hp: 154, ac: 6, attack: 6, damage: 6, multiattack: 3, costCp: 47000 },
  { level: 15, category: 8, name: "Paragon", hp: 194, ac: 7, attack: 7, damage: 7, multiattack: 3, costCp: 68000 },
  { level: 17, category: 9, name: "Legendary", hp: 238, ac: 8, attack: 8, damage: 8, multiattack: 3, costCp: 95000 },
  { level: 19, category: 10, name: "Mythic", hp: 286, ac: 9, attack: 9, damage: 9, multiattack: 4, costCp: 130000 },
];

function classRecruitId(base, tier) {
  return `recruit${base.className.replace(/[^A-Za-z0-9]/g, "")}Lv${tier.level}`;
}

function registerClassRecruitMockups() {
  for (const base of classRecruitBases) {
    for (const tier of classRecruitTiers) {
      const [count, sides, bonus] = base.damage;
      const mainHand = base.kit[0];
      const torso = base.kit[1];
      const offHand = base.kit[2];
      const quiver = base.kit[3];
      registerHumanoid({
        id: classRecruitId(base, tier),
        name: `${tier.name} ${base.className}`,
        role: `${base.title} (level ${tier.level} mockup)`,
        tags: [...base.tags, `level-${tier.level}`, "hireling"],
        category: tier.category,
        xp: tier.costCp,
        maxHp: base.hp + tier.hp,
        ac: base.ac + tier.ac,
        attackBonus: base.attackBonus + tier.attack,
        damage: damage(count, sides, bonus + tier.damage, base.attackType, base.attackKind ?? "weapon", base.behavior === "rangedKiter" ? ranged(80, 240) : melee(), base.weapon),
        abilityMods: base.ability,
        baseAttackAbilityMod: base.behavior === "rangedKiter" ? Math.max(base.ability.dex, base.ability.int, base.ability.wis, base.ability.cha) : Math.max(base.ability.str, base.ability.dex),
        initiativeBonus: base.ability.dex,
        behavior: base.behavior,
        token: base.token,
        kit: kit(mainHand, torso, { offHand, quiver }),
        specialAbility: [
          ...base.abilities,
          ...(tier.level >= 3 ? [`${base.className} Path`] : []),
          ...(tier.level >= 5 ? ["Extra Attack"] : []),
          ...(tier.level >= 7 ? [`Veteran ${base.className} Instinct`] : []),
        ],
        multiattack: tier.multiattack,
        tokenArt: base.tokenArt,
        recruitClassId: base.classId,
        recruitMockLevel: tier.level,
      });
    }
  }
}

registerClassRecruitMockups();

for (const pack of packs) {
  pack.entries.forEach((entry, index) => {
    const [
      id,
      name,
      role,
      tags,
      maxHp,
      ac,
      attackBonus,
      attackDamage,
      abilityMods,
      initiativeBonus,
      behavior,
      token,
      equipmentKit,
      specialAbility,
      multiattack,
    ] = entry;
    registerHumanoid({
      id,
      name,
      role,
      tags,
      category: pack.category,
      xp: pack.xp[index],
      maxHp,
      ac,
      attackBonus,
      damage: attackDamage,
      abilityMods,
      baseAttackAbilityMod: attackDamage.range.kind === "ranged" ? abilityMods.dex : Math.max(abilityMods.str, abilityMods.dex),
      initiativeBonus,
      behavior,
      token,
      kit: equipmentKit,
      specialAbility,
      multiattack,
      tokenArt: {
        cutpurseKnifeman: "assets/tokens/oathscar-duelist.jpg",
        roadsideBandit: "assets/tokens/rusted-shieldbearer.jpg",
        slingRuffian: "assets/tokens/roof-crow-swarm.jpg",
        torchThug: "assets/tokens/soot-tunnel-rat.jpg",
        apprenticeHexer: "assets/tokens/sulphur-hexer.jpg",
        banditArcher: "assets/tokens/black-arrow-sentry.jpg",
        shieldedFootpad: "assets/tokens/rusted-shieldbearer.jpg",
        backAlleyDuelist: "assets/tokens/cloudstep-duelist.jpg",
        noviceBattleMage: "assets/tokens/ruin-choir-warlock.jpg",
        gangEnforcer: "assets/tokens/barbed-enforcer.jpg",
        mercenarySpearman: "assets/tokens/rusted-halberdier.jpg",
        crossbowVeteran: "assets/tokens/heavy-arbalester.jpg",
        bladeAdept: "assets/tokens/spectral-duelist.jpg",
        cultAcolyte: "assets/tokens/claybinder-acolyte.jpg",
        raidCaptain: "assets/tokens/guardroom-commander.jpg",
        blackknifeAssassin: "assets/tokens/smoke-veil-assassin.jpg",
        warPriest: "assets/tokens/hellchain-exarch.jpg",
        pyromancerInitiate: "assets/tokens/corpsefire-invoker.jpg",
        ironboundGuard: "assets/tokens/graveplate-sentinel.jpg",
        alchemistBomber: "assets/tokens/powder-keg-saboteur.jpg",
        veteranDuelist: "assets/tokens/oathscar-duelist.jpg",
        arcaneMarksman: "assets/tokens/hollow-marksman.jpg",
        oathbreakerKnight: "assets/tokens/oathbound-jailer.jpg",
        battlefieldMedic: "assets/tokens/corpse-candle-acolyte.jpg",
        shadowMonk: "assets/tokens/glasswind-assassin.jpg",
        magebreakerSentinel: "assets/tokens/tower-shield-remnant.jpg",
        bloodCultHierophant: "assets/tokens/graveflame-warlock.jpg",
        executionerChampion: "assets/tokens/crypt-executioner.jpg",
        masterThief: "assets/tokens/bone-lockbreaker.jpg",
        stormcallerAdept: "assets/tokens/steamstorm-oracle.jpg",
        crimsonWarlord: "assets/tokens/war-duke-asteroth.jpg",
        archduelistOfTheSilverMask: "assets/tokens/cloudstep-duelist.jpg",
        infernalContractMage: "assets/tokens/infernal-chainwright.jpg",
        royalInquisitor: "assets/tokens/inquisitor-malrec.jpg",
        runeboundGuardian: "assets/tokens/graveplate-sentinel.jpg",
        archmageOfTheBrokenTower: "assets/tokens/oracle-of-dead-stars.jpg",
        grandmasterAssassin: "assets/tokens/smoke-veil-assassin.jpg",
        dreadBannerGeneral: "assets/tokens/grave-banner-castellan.jpg",
        saintOfTheIronChain: "assets/tokens/chain-magistrate.jpg",
        voidbladeMystic: "assets/tokens/glasswind-assassin.jpg",
        theBlackCrownStrategist: "assets/tokens/black-furnace-drow-overseer.jpg",
        elderBloodMagus: "assets/tokens/blood-smoke-howler.jpg",
        perfectedDuelist: "assets/tokens/spectral-duelist.jpg",
        titanSlayerChampion: "assets/tokens/quake-fist-champion.jpg",
        oracleOfRuin: "assets/tokens/oracle-of-dead-stars.jpg",
        theTyrantKingAscendant: "assets/tokens/cloud-palace-tyrant.jpg",
        archlichHunterMagister: "assets/tokens/ruin-choir-warlock.jpg",
        theNamelessSwordSaint: "assets/tokens/oathscar-duelist.jpg",
        highProphetOfTheEndingStar: "assets/tokens/chaos-star-seraph.jpg",
        warmasterOfTenThousandBlades: "assets/tokens/war-duke-asteroth.jpg",
      }[id],
    });
  });
}
})();
