(() => {
  const profiles = {
    1: {
      light:  { maxHp: 9,  xp: 40,  ac: 13, attackBonus: 4, damage: { count: 1, sides: 4,  bonus: 2 }, initiativeBonus: 3, speedFeet: 40, behavior: "melee" },
      normal: { maxHp: 12, xp: 50,  ac: 13, attackBonus: 4, damage: { count: 1, sides: 6,  bonus: 2 }, initiativeBonus: 2, speedFeet: 35, behavior: "melee" },
      brute:  { maxHp: 16, xp: 60,  ac: 12, attackBonus: 4, damage: { count: 1, sides: 8,  bonus: 2 }, initiativeBonus: 0, speedFeet: 30, behavior: "melee" },
      tank:   { maxHp: 18, xp: 65,  ac: 14, attackBonus: 3, damage: { count: 1, sides: 6,  bonus: 2 }, initiativeBonus: 0, speedFeet: 25, behavior: "melee" },
      ranged: { maxHp: 10, xp: 55,  ac: 13, attackBonus: 4, damage: { count: 1, sides: 6,  bonus: 2 }, initiativeBonus: 2, speedFeet: 30, behavior: "rangedKiter", range: { kind: "ranged", normal: 40, long: 120, feet: 40 } },
      boss:   { maxHp: 28, xp: 120, ac: 13, attackBonus: 5, damage: { count: 1, sides: 8,  bonus: 3 }, initiativeBonus: 1, speedFeet: 35, behavior: "melee" },
    },

    2: {
      light:  { maxHp: 22, xp: 130, ac: 15, attackBonus: 6, damage: { count: 1, sides: 8,  bonus: 3 }, initiativeBonus: 4, speedFeet: 45, behavior: "melee" },
      normal: { maxHp: 25, xp: 140, ac: 14, attackBonus: 6, damage: { count: 1, sides: 8,  bonus: 3 }, initiativeBonus: 2, speedFeet: 35, behavior: "melee" },
      brute:  { maxHp: 32, xp: 155, ac: 13, attackBonus: 5, damage: { count: 1, sides: 10, bonus: 3 }, initiativeBonus: 0, speedFeet: 30, behavior: "melee" },
      tank:   { maxHp: 36, xp: 165, ac: 16, attackBonus: 5, damage: { count: 1, sides: 8,  bonus: 3 }, initiativeBonus: 0, speedFeet: 25, behavior: "melee" },
      ranged: { maxHp: 23, xp: 145, ac: 14, attackBonus: 6, damage: { count: 1, sides: 8,  bonus: 3 }, initiativeBonus: 3, speedFeet: 35, behavior: "rangedKiter", range: { kind: "ranged", normal: 50, long: 150, feet: 50 } },
      boss:   { maxHp: 46, xp: 250, ac: 15, attackBonus: 6, damage: { count: 1, sides: 10, bonus: 4 }, initiativeBonus: 2, speedFeet: 35, behavior: "melee" },
    },

    3: {
      light:  { maxHp: 38, xp: 250, ac: 16, attackBonus: 7, damage: { count: 1, sides: 8,  bonus: 5 }, initiativeBonus: 4, speedFeet: 50, behavior: "melee" },
      normal: { maxHp: 42, xp: 260, ac: 15, attackBonus: 7, damage: { count: 1, sides: 10, bonus: 4 }, initiativeBonus: 3, speedFeet: 40, behavior: "melee" },
      brute:  { maxHp: 52, xp: 280, ac: 14, attackBonus: 6, damage: { count: 1, sides: 12, bonus: 4 }, initiativeBonus: 0, speedFeet: 30, behavior: "melee" },
      tank:   { maxHp: 56, xp: 290, ac: 16, attackBonus: 6, damage: { count: 1, sides: 10, bonus: 4 }, initiativeBonus: 0, speedFeet: 25, behavior: "melee" },
      ranged: { maxHp: 36, xp: 270, ac: 15, attackBonus: 7, damage: { count: 1, sides: 10, bonus: 4 }, initiativeBonus: 3, speedFeet: 35, behavior: "rangedKiter", range: { kind: "ranged", normal: 60, long: 180, feet: 60 } },
      boss:   { maxHp: 70, xp: 430, ac: 16, attackBonus: 7, damage: { count: 1, sides: 12, bonus: 5 }, initiativeBonus: 2, speedFeet: 40, behavior: "melee" },
    },
  };

  window.MonsterSpecialAbilityNotes = {
    ...(window.MonsterSpecialAbilityNotes || {}),

    Charge: "If the monster moved at least 20 ft before attacking, add the listed bonus damage on hit.",
    Pounce: "If the monster moved at least 20 ft before attacking, the target makes a Str save or is pushed 5 ft.",
    VenomBite: "On hit: Con save. On failure, the target takes extra poison damage.",
    WebSnare: "Ranged special attack. Dex save. On failure, target speed becomes 0 until end of next turn.",
    BurrowAmbush: "If this monster starts combat hidden or underground, it gains advantage or +2 to its first attack.",
    ShellGuard: "Once per fight: gain +2 AC until the start of its next turn.",
    ThickHide: "Passive flavor ability. This monster has the listed resistance.",
    BloodFrenzy: "When below half HP, gain +1 attack bonus.",
    FrostHide: "Passive flavor ability. This monster has the listed cold resistance.",
    MarshAmbush: "First attack against a target in difficult terrain gains +2 to hit.",
    SewerSkulk: "This monster has better movement and hiding in urban ruins or sewers.",
    Aquatic: "This monster is intended for water rooms and should not be slowed by water.",
    RockClimber: "This monster is intended for cliffs, ledges, and mountain rooms.",
    Stampede: "15 ft line, Str save. On failure, 2d6/3d6/4d6 bludgeoning damage by category and pushed 5 ft.",
    BossRoar: "Once per fight: 10 ft radius, Wis save. On failure, target suffers -1 attack penalty until end of next turn.",
    SelfHeal: "Once per fight: restore a small amount of HP when below half HP.",
  };

  const monsters = [

    /* ============================================================
     * BEAST + DESERT
     * ============================================================ */

    // Category 1
    { id: "duneJackal", name: "Dune Jackal", role: "Small desert predator", biome: "desert", category: 1, profile: "light", damageType: "piercing", extraTags: ["jackal"], specialAbility: ["Pounce"] },
    { id: "sandScorpion", name: "Sand Scorpion", role: "Venomous desert beast", biome: "desert", category: 1, profile: "normal", damageType: "piercing", extraTags: ["scorpion", "poison"], damageResistances: ["poison"], specialAbility: ["VenomBite"] },
    { id: "dustHyena", name: "Dust Hyena", role: "Lean desert scavenger", biome: "desert", category: 1, profile: "normal", damageType: "slashing", extraTags: ["hyena"] },
    { id: "sunbackTortoise", name: "Sunback Tortoise", role: "Armored desert beast", biome: "desert", category: 1, profile: "tank", damageType: "bludgeoning", extraTags: ["tortoise"], specialAbility: ["ShellGuard"] },
    { id: "oldDuneBoar", name: "Old Dune Boar", role: "Category 1 desert beast boss", biome: "desert", category: 1, profile: "boss", damageType: "piercing", extraTags: ["boar", "boss"], specialAbility: ["Charge", "BossRoar"] },

    // Category 2
    { id: "glassFangViper", name: "Glass-Fang Viper", role: "Fast venomous desert hunter", biome: "desert", category: 2, profile: "light", damageType: "piercing", extraTags: ["snake", "poison"], damageResistances: ["poison"], specialAbility: ["VenomBite"] },
    { id: "duneLion", name: "Dune Lion", role: "Large desert stalker", biome: "desert", category: 2, profile: "normal", damageType: "slashing", extraTags: ["cat"], specialAbility: ["Pounce"] },
    { id: "ashbackCamel", name: "Ashback Camel", role: "Heavy desert charger", biome: "desert", category: 2, profile: "brute", damageType: "bludgeoning", extraTags: ["camel"], specialAbility: ["Charge"] },
    { id: "spineTailMonitor", name: "Spine-Tail Monitor", role: "Armored desert lizard", biome: "desert", category: 2, profile: "tank", damageType: "piercing", extraTags: ["lizard"], damageResistances: ["slashing"], specialAbility: ["ThickHide"] },
    { id: "scarredSandManticore", name: "Scarred Sand Manticore", role: "Category 2 desert beast boss", biome: "desert", category: 2, profile: "boss", damageType: "piercing", extraTags: ["manticore", "boss"], specialAbility: ["Pounce", "BossRoar"] },

    // Category 3
    { id: "stormDuneRaptor", name: "Storm-Dune Raptor", role: "Swift desert apex predator", biome: "desert", category: 3, profile: "light", damageType: "slashing", extraTags: ["raptor"], specialAbility: ["Pounce"] },
    { id: "bonecrackScorpion", name: "Bonecrack Scorpion", role: "Huge venomous desert beast", biome: "desert", category: 3, profile: "normal", damageType: "piercing", extraTags: ["scorpion", "poison"], damageResistances: ["poison"], specialAbility: ["VenomBite"] },
    { id: "dunehornRhino", name: "Dunehorn Rhino", role: "Massive desert charger", biome: "desert", category: 3, profile: "brute", damageType: "piercing", extraTags: ["rhino"], specialAbility: ["Charge"] },
    { id: "ancientGlassbackTortoise", name: "Ancient Glassback Tortoise", role: "Ancient armored desert beast", biome: "desert", category: 3, profile: "tank", damageType: "bludgeoning", extraTags: ["tortoise"], damageResistances: ["slashing"], specialAbility: ["ShellGuard", "ThickHide"] },
    { id: "titanSandmaw", name: "Titan Sandmaw", role: "Category 3 desert beast boss", biome: "desert", category: 3, profile: "boss", damageType: "piercing", extraTags: ["worm", "boss"], specialAbility: ["BurrowAmbush", "BossRoar"] },


    /* ============================================================
     * BEAST + UNDERGROUND
     * ============================================================ */

    // Category 1
    { id: "caveRat", name: "Cave Rat", role: "Small underground scavenger", biome: "underground", category: 1, profile: "light", damageType: "piercing", extraTags: ["rat"] },
    { id: "blindCaveHound", name: "Blind Cave Hound", role: "Echo-hunting cave predator", biome: "underground", category: 1, profile: "normal", damageType: "piercing", extraTags: ["hound"], specialAbility: ["Pounce"] },
    { id: "stonebackBeetle", name: "Stoneback Beetle", role: "Armored cave insect", biome: "underground", category: 1, profile: "tank", damageType: "bludgeoning", extraTags: ["beetle"], damageResistances: ["bludgeoning"], specialAbility: ["ThickHide"] },
    { id: "paleCaveSpider", name: "Pale Cave Spider", role: "Venomous underground ambusher", biome: "underground", category: 1, profile: "normal", damageType: "piercing", extraTags: ["spider", "poison"], damageResistances: ["poison"], specialAbility: ["VenomBite"] },
    { id: "deepTunnelBoar", name: "Deep-Tunnel Boar", role: "Category 1 underground beast boss", biome: "underground", category: 1, profile: "boss", damageType: "piercing", extraTags: ["boar", "boss"], specialAbility: ["Charge", "BossRoar"] },

    // Category 2
    { id: "gloomMole", name: "Gloom Mole", role: "Burrowing underground beast", biome: "underground", category: 2, profile: "normal", damageType: "slashing", extraTags: ["mole"], specialAbility: ["BurrowAmbush"] },
    { id: "cragToad", name: "Crag Toad", role: "Heavy cave ambusher", biome: "underground", category: 2, profile: "brute", damageType: "bludgeoning", extraTags: ["toad"] },
    { id: "razorMandibleBeetle", name: "Razor-Mandible Beetle", role: "Armored biting cave insect", biome: "underground", category: 2, profile: "tank", damageType: "piercing", extraTags: ["beetle"], damageResistances: ["slashing"], specialAbility: ["ThickHide"] },
    { id: "darkmantlePanther", name: "Darkmantle Panther", role: "Silent underground stalker", biome: "underground", category: 2, profile: "light", damageType: "slashing", extraTags: ["cat"], specialAbility: ["Pounce"] },
    { id: "oldCavernCroc", name: "Old Cavern Croc", role: "Category 2 underground beast boss", biome: "underground", category: 2, profile: "boss", damageType: "piercing", extraTags: ["crocodile", "boss"], specialAbility: ["BloodFrenzy", "BossRoar"] },

    // Category 3
    { id: "deepRiftStalker", name: "Deep-Rift Stalker", role: "Elite cave predator", biome: "underground", category: 3, profile: "light", damageType: "slashing", extraTags: ["stalker"], specialAbility: ["BurrowAmbush"] },
    { id: "crystalCarapaceScarab", name: "Crystal-Carapace Scarab", role: "Huge armored underground beetle", biome: "underground", category: 3, profile: "tank", damageType: "bludgeoning", extraTags: ["beetle"], damageResistances: ["bludgeoning", "slashing"], specialAbility: ["ShellGuard"] },
    { id: "basaltMauler", name: "Basalt Mauler", role: "Massive cave brute", biome: "underground", category: 3, profile: "brute", damageType: "bludgeoning", extraTags: ["brute"], damageResistances: ["bludgeoning"], specialAbility: ["ThickHide"] },
    { id: "nightglassSpider", name: "Nightglass Spider", role: "Huge venomous cave hunter", biome: "underground", category: 3, profile: "normal", damageType: "piercing", extraTags: ["spider", "poison"], damageResistances: ["poison"], specialAbility: ["VenomBite", "WebSnare"] },
    { id: "tunnelKingWorm", name: "Tunnel-King Worm", role: "Category 3 underground beast boss", biome: "underground", category: 3, profile: "boss", damageType: "piercing", extraTags: ["worm", "boss"], specialAbility: ["BurrowAmbush", "BossRoar"] },


    /* ============================================================
     * BEAST + SWAMP
     * ============================================================ */

    // Category 1
    { id: "bogFrog", name: "Bog Frog", role: "Leaping swamp beast", biome: "swamp", category: 1, profile: "light", damageType: "bludgeoning", extraTags: ["frog"] },
    { id: "mudSnapper", name: "Mud Snapper", role: "Small swamp biter", biome: "swamp", category: 1, profile: "normal", damageType: "piercing", extraTags: ["turtle"] },
    { id: "leechHound", name: "Leech Hound", role: "Hungry swamp predator", biome: "swamp", category: 1, profile: "normal", damageType: "piercing", extraTags: ["hound"], specialAbility: ["BloodFrenzy"] },
    { id: "reedViper", name: "Reed Viper", role: "Venomous swamp snake", biome: "swamp", category: 1, profile: "light", damageType: "piercing", extraTags: ["snake", "poison"], damageResistances: ["poison"], specialAbility: ["VenomBite"] },
    { id: "oldBogGator", name: "Old Bog Gator", role: "Category 1 swamp beast boss", biome: "swamp", category: 1, profile: "boss", damageType: "piercing", extraTags: ["crocodile", "boss"], specialAbility: ["BloodFrenzy", "BossRoar"] },

    // Category 2
    { id: "mireStag", name: "Mire Stag", role: "Swamp charger", biome: "swamp", category: 2, profile: "normal", damageType: "piercing", extraTags: ["stag"], specialAbility: ["Charge"] },
    { id: "rotwaterCroc", name: "Rotwater Croc", role: "Large swamp ambusher", biome: "swamp", category: 2, profile: "brute", damageType: "piercing", extraTags: ["crocodile"], specialAbility: ["MarshAmbush"] },
    { id: "bogbackBoar", name: "Bogback Boar", role: "Heavy swamp beast", biome: "swamp", category: 2, profile: "tank", damageType: "piercing", extraTags: ["boar"], damageResistances: ["piercing"], specialAbility: ["ThickHide"] },
    { id: "plagueMireToad", name: "Plague-Mire Toad", role: "Poisonous swamp brute", biome: "swamp", category: 2, profile: "ranged", damageType: "poison", extraTags: ["toad", "poison"], damageResistances: ["poison"], specialAbility: ["VenomBite"] },
    { id: "mossjawCroc", name: "Mossjaw Croc", role: "Category 2 swamp beast boss", biome: "swamp", category: 2, profile: "boss", damageType: "piercing", extraTags: ["crocodile", "boss"], specialAbility: ["MarshAmbush", "BossRoar"] },

    // Category 3
    { id: "fenReaperCat", name: "Fen Reaper Cat", role: "Fast swamp predator", biome: "swamp", category: 3, profile: "light", damageType: "slashing", extraTags: ["cat"], specialAbility: ["Pounce"] },
    { id: "giantSwampLeech", name: "Giant Swamp Leech", role: "Huge blood-drinking beast", biome: "swamp", category: 3, profile: "normal", damageType: "piercing", extraTags: ["leech"], specialAbility: ["BloodFrenzy"] },
    { id: "mudmawBehemoth", name: "Mudmaw Behemoth", role: "Massive swamp brute", biome: "swamp", category: 3, profile: "brute", damageType: "bludgeoning", extraTags: ["behemoth"], damageResistances: ["bludgeoning"], specialAbility: ["ThickHide"] },
    { id: "venomBogHydra", name: "Venom-Bog Hydra", role: "Poisonous swamp monster", biome: "swamp", category: 3, profile: "normal", damageType: "piercing", extraTags: ["hydra", "poison"], damageResistances: ["poison"], specialAbility: ["VenomBite"] },
    { id: "ancientMireGator", name: "Ancient Mire Gator", role: "Category 3 swamp beast boss", biome: "swamp", category: 3, profile: "boss", damageType: "piercing", extraTags: ["crocodile", "boss"], specialAbility: ["MarshAmbush", "BossRoar"] },


    /* ============================================================
     * BEAST + ARCTIC
     * ============================================================ */

    // Category 1
    { id: "snowHare", name: "Snow Hare", role: "Small arctic beast", biome: "arctic", category: 1, profile: "light", damageType: "slashing", extraTags: ["hare"] },
    { id: "iceFox", name: "Ice Fox", role: "Quick arctic predator", biome: "arctic", category: 1, profile: "light", damageType: "piercing", extraTags: ["fox"], damageResistances: ["cold"], specialAbility: ["FrostHide"] },
    { id: "frostWolf", name: "Frost Wolf", role: "Cold-land hunter", biome: "arctic", category: 1, profile: "normal", damageType: "piercing", extraTags: ["wolf"], damageResistances: ["cold"], specialAbility: ["Pounce"] },
    { id: "snowbackBoar", name: "Snowback Boar", role: "Hardy arctic charger", biome: "arctic", category: 1, profile: "brute", damageType: "piercing", extraTags: ["boar"], damageResistances: ["cold"], specialAbility: ["Charge"] },
    { id: "oldIcehornRam", name: "Old Icehorn Ram", role: "Category 1 arctic beast boss", biome: "arctic", category: 1, profile: "boss", damageType: "bludgeoning", extraTags: ["ram", "boss"], damageResistances: ["cold"], specialAbility: ["Charge", "BossRoar"] },

    // Category 2
    { id: "whiteDireWolf", name: "White Dire Wolf", role: "Large arctic wolf", biome: "arctic", category: 2, profile: "normal", damageType: "piercing", extraTags: ["wolf"], damageResistances: ["cold"], specialAbility: ["Pounce"] },
    { id: "iceClawLynx", name: "Ice-Claw Lynx", role: "Fast arctic hunter", biome: "arctic", category: 2, profile: "light", damageType: "slashing", extraTags: ["cat"], damageResistances: ["cold"] },
    { id: "tundraOx", name: "Tundra Ox", role: "Heavy arctic beast", biome: "arctic", category: 2, profile: "tank", damageType: "bludgeoning", extraTags: ["ox"], damageResistances: ["cold"], specialAbility: ["ThickHide"] },
    { id: "frostbiteViper", name: "Frostbite Viper", role: "Cold venom snake", biome: "arctic", category: 2, profile: "light", damageType: "piercing", extraTags: ["snake", "poison"], damageResistances: ["cold", "poison"], specialAbility: ["VenomBite"] },
    { id: "snowhideBear", name: "Snowhide Bear", role: "Category 2 arctic beast boss", biome: "arctic", category: 2, profile: "boss", damageType: "slashing", extraTags: ["bear", "boss"], damageResistances: ["cold"], specialAbility: ["FrostHide", "BossRoar"] },

    // Category 3
    { id: "glacierWolf", name: "Glacier Wolf", role: "Elite arctic predator", biome: "arctic", category: 3, profile: "light", damageType: "piercing", extraTags: ["wolf"], damageResistances: ["cold"], specialAbility: ["Pounce"] },
    { id: "mammothCalfRampager", name: "Mammoth Calf Rampager", role: "Young but massive arctic charger", biome: "arctic", category: 3, profile: "brute", damageType: "bludgeoning", extraTags: ["mammoth"], damageResistances: ["cold"], specialAbility: ["Charge"] },
    { id: "iceplateTortoise", name: "Iceplate Tortoise", role: "Armored arctic beast", biome: "arctic", category: 3, profile: "tank", damageType: "bludgeoning", extraTags: ["tortoise"], damageResistances: ["cold", "slashing"], specialAbility: ["ShellGuard"] },
    { id: "polarMauler", name: "Polar Mauler", role: "Huge arctic bear", biome: "arctic", category: 3, profile: "normal", damageType: "slashing", extraTags: ["bear"], damageResistances: ["cold"], specialAbility: ["BloodFrenzy"] },
    { id: "ancientFrosthornMammoth", name: "Ancient Frosthorn Mammoth", role: "Category 3 arctic beast boss", biome: "arctic", category: 3, profile: "boss", damageType: "bludgeoning", extraTags: ["mammoth", "boss"], damageResistances: ["cold"], specialAbility: ["Stampede", "BossRoar"] },


    /* ============================================================
     * BEAST + URBAN
     * ============================================================ */

    // Category 1
    { id: "alleyRat", name: "Alley Rat", role: "Urban scavenger", biome: "urban", category: 1, profile: "light", damageType: "piercing", extraTags: ["rat"], specialAbility: ["SewerSkulk"] },
    { id: "strayFightingDog", name: "Stray Fighting Dog", role: "Aggressive street hound", biome: "urban", category: 1, profile: "normal", damageType: "piercing", extraTags: ["dog"], specialAbility: ["Pounce"] },
    { id: "roofCrowSwarm", name: "Roof Crow Swarm", role: "Aggressive urban bird swarm", biome: "urban", category: 1, profile: "ranged", damageType: "slashing", extraTags: ["bird", "swarm"] },
    { id: "sewerSnapper", name: "Sewer Snapper", role: "Small sewer beast", biome: "urban", category: 1, profile: "tank", damageType: "piercing", extraTags: ["turtle"], specialAbility: ["SewerSkulk"] },
    { id: "oldYardMastiff", name: "Old Yard Mastiff", role: "Category 1 urban beast boss", biome: "urban", category: 1, profile: "boss", damageType: "piercing", extraTags: ["dog", "boss"], specialAbility: ["Pounce", "BossRoar"] },

    // Category 2
    { id: "sewerGator", name: "Sewer Gator", role: "Large sewer predator", biome: "urban", category: 2, profile: "brute", damageType: "piercing", extraTags: ["crocodile"], specialAbility: ["SewerSkulk"] },
    { id: "chimneyMarten", name: "Chimney Marten", role: "Fast rooftop predator", biome: "urban", category: 2, profile: "light", damageType: "slashing", extraTags: ["marten"], specialAbility: ["Pounce"] },
    { id: "mangeWolf", name: "Mange Wolf", role: "Diseased city wolf", biome: "urban", category: 2, profile: "normal", damageType: "piercing", extraTags: ["wolf"], specialAbility: ["BloodFrenzy"] },
    { id: "ironhideSewerBoar", name: "Ironhide Sewer Boar", role: "Armored urban brute", biome: "urban", category: 2, profile: "tank", damageType: "piercing", extraTags: ["boar"], damageResistances: ["piercing"], specialAbility: ["ThickHide"] },
    { id: "kingOfTheKennels", name: "King of the Kennels", role: "Category 2 urban beast boss", biome: "urban", category: 2, profile: "boss", damageType: "piercing", extraTags: ["dog", "boss"], specialAbility: ["Pounce", "BossRoar"] },

    // Category 3
    { id: "direSewerGator", name: "Dire Sewer Gator", role: "Huge sewer predator", biome: "urban", category: 3, profile: "brute", damageType: "piercing", extraTags: ["crocodile"], specialAbility: ["SewerSkulk"] },
    { id: "rooftopRazorwing", name: "Rooftop Razorwing", role: "Large urban flying predator", biome: "urban", category: 3, profile: "light", damageType: "slashing", extraTags: ["bird"], specialAbility: ["Pounce"] },
    { id: "plagueAlleyMastiff", name: "Plague Alley Mastiff", role: "Diseased elite street beast", biome: "urban", category: 3, profile: "normal", damageType: "piercing", extraTags: ["dog"], damageResistances: ["poison"], specialAbility: ["BloodFrenzy"] },
    { id: "cisternShellback", name: "Cistern Shellback", role: "Armored cistern beast", biome: "urban", category: 3, profile: "tank", damageType: "bludgeoning", extraTags: ["turtle"], damageResistances: ["slashing"], specialAbility: ["ShellGuard"] },
    { id: "oldSewerKing", name: "Old Sewer King", role: "Category 3 urban beast boss", biome: "urban", category: 3, profile: "boss", damageType: "piercing", extraTags: ["crocodile", "boss"], specialAbility: ["SewerSkulk", "BossRoar"] },


    /* ============================================================
     * BEAST + WATER
     * ============================================================ */

    // Category 1
    { id: "reefEel", name: "Reef Eel", role: "Small aquatic biter", biome: "water", category: 1, profile: "light", damageType: "piercing", extraTags: ["eel"], specialAbility: ["Aquatic"] },
    { id: "riverSnapper", name: "River Snapper", role: "Armored freshwater beast", biome: "water", category: 1, profile: "tank", damageType: "piercing", extraTags: ["turtle"], specialAbility: ["Aquatic", "ShellGuard"] },
    { id: "silverfinPiranha", name: "Silverfin Piranha", role: "Aggressive fish predator", biome: "water", category: 1, profile: "normal", damageType: "piercing", extraTags: ["fish"], specialAbility: ["BloodFrenzy"] },
    { id: "marshOtter", name: "Marsh Otter", role: "Quick aquatic hunter", biome: "water", category: 1, profile: "light", damageType: "slashing", extraTags: ["otter"], specialAbility: ["Aquatic"] },
    { id: "oldRiverCroc", name: "Old River Croc", role: "Category 1 water beast boss", biome: "water", category: 1, profile: "boss", damageType: "piercing", extraTags: ["crocodile", "boss"], specialAbility: ["Aquatic", "BossRoar"] },

    // Category 2
    { id: "razorfinBarracuda", name: "Razorfin Barracuda", role: "Fast aquatic striker", biome: "water", category: 2, profile: "light", damageType: "piercing", extraTags: ["fish"], specialAbility: ["Aquatic", "Pounce"] },
    { id: "blackwaterCroc", name: "Blackwater Croc", role: "Large aquatic ambusher", biome: "water", category: 2, profile: "brute", damageType: "piercing", extraTags: ["crocodile"], specialAbility: ["Aquatic"] },
    { id: "giantReefCrab", name: "Giant Reef Crab", role: "Armored aquatic beast", biome: "water", category: 2, profile: "tank", damageType: "bludgeoning", extraTags: ["crab"], damageResistances: ["slashing"], specialAbility: ["Aquatic", "ShellGuard"] },
    { id: "shockEel", name: "Shock Eel", role: "Electric water predator", biome: "water", category: 2, profile: "ranged", damageType: "lightning", extraTags: ["eel"], damageResistances: ["lightning"], specialAbility: ["Aquatic"] },
    { id: "reefjawShark", name: "Reefjaw Shark", role: "Category 2 water beast boss", biome: "water", category: 2, profile: "boss", damageType: "piercing", extraTags: ["shark", "boss"], specialAbility: ["Aquatic", "BloodFrenzy"] },

    // Category 3
    { id: "deepwaterShark", name: "Deepwater Shark", role: "Large aquatic predator", biome: "water", category: 3, profile: "normal", damageType: "piercing", extraTags: ["shark"], specialAbility: ["Aquatic", "BloodFrenzy"] },
    { id: "armoredReefCrab", name: "Armored Reef Crab", role: "Huge shell-armored beast", biome: "water", category: 3, profile: "tank", damageType: "bludgeoning", extraTags: ["crab"], damageResistances: ["slashing", "piercing"], specialAbility: ["Aquatic", "ShellGuard"] },
    { id: "stormEel", name: "Storm Eel", role: "Lightning aquatic predator", biome: "water", category: 3, profile: "ranged", damageType: "lightning", extraTags: ["eel"], damageResistances: ["lightning"], specialAbility: ["Aquatic"] },
    { id: "tideMauler", name: "Tide Mauler", role: "Massive aquatic brute", biome: "water", category: 3, profile: "brute", damageType: "bludgeoning", extraTags: ["behemoth"], specialAbility: ["Aquatic"] },
    { id: "ancientHarborShark", name: "Ancient Harbor Shark", role: "Category 3 water beast boss", biome: "water", category: 3, profile: "boss", damageType: "piercing", extraTags: ["shark", "boss"], specialAbility: ["Aquatic", "BossRoar"] },


    /* ============================================================
     * BEAST + MOUNTAIN
     * ============================================================ */

    // Category 1
    { id: "cliffGoat", name: "Cliff Goat", role: "Sure-footed mountain beast", biome: "mountain", category: 1, profile: "normal", damageType: "bludgeoning", extraTags: ["goat"], specialAbility: ["RockClimber"] },
    { id: "stoneMarmot", name: "Stone Marmot", role: "Small mountain biter", biome: "mountain", category: 1, profile: "light", damageType: "piercing", extraTags: ["marmot"], specialAbility: ["RockClimber"] },
    { id: "cragWolf", name: "Crag Wolf", role: "Mountain wolf", biome: "mountain", category: 1, profile: "normal", damageType: "piercing", extraTags: ["wolf"], specialAbility: ["Pounce", "RockClimber"] },
    { id: "talonHawk", name: "Talon Hawk", role: "Mountain bird predator", biome: "mountain", category: 1, profile: "ranged", damageType: "slashing", extraTags: ["bird"] },
    { id: "oldGraniteRam", name: "Old Granite Ram", role: "Category 1 mountain beast boss", biome: "mountain", category: 1, profile: "boss", damageType: "bludgeoning", extraTags: ["ram", "boss"], specialAbility: ["Charge", "RockClimber"] },

    // Category 2
    { id: "direCragWolf", name: "Dire Crag Wolf", role: "Large mountain hunter", biome: "mountain", category: 2, profile: "normal", damageType: "piercing", extraTags: ["wolf"], specialAbility: ["Pounce", "RockClimber"] },
    { id: "boulderBoar", name: "Boulder Boar", role: "Heavy mountain charger", biome: "mountain", category: 2, profile: "brute", damageType: "piercing", extraTags: ["boar"], specialAbility: ["Charge"] },
    { id: "ironhornRam", name: "Ironhorn Ram", role: "Armored mountain beast", biome: "mountain", category: 2, profile: "tank", damageType: "bludgeoning", extraTags: ["ram"], damageResistances: ["bludgeoning"], specialAbility: ["ThickHide", "RockClimber"] },
    { id: "ridgeLion", name: "Ridge Lion", role: "Fast mountain predator", biome: "mountain", category: 2, profile: "light", damageType: "slashing", extraTags: ["cat"], specialAbility: ["Pounce", "RockClimber"] },
    { id: "scarredPeakBear", name: "Scarred Peak Bear", role: "Category 2 mountain beast boss", biome: "mountain", category: 2, profile: "boss", damageType: "slashing", extraTags: ["bear", "boss"], specialAbility: ["BossRoar", "RockClimber"] },

    // Category 3
    { id: "avalancheRam", name: "Avalanche Ram", role: "Elite mountain charger", biome: "mountain", category: 3, profile: "normal", damageType: "bludgeoning", extraTags: ["ram"], specialAbility: ["Charge", "RockClimber"] },
    { id: "skyTalonRocling", name: "Sky-Talon Rocling", role: "Young giant mountain bird", biome: "mountain", category: 3, profile: "light", damageType: "slashing", extraTags: ["bird"], specialAbility: ["Pounce"] },
    { id: "granitebackBear", name: "Graniteback Bear", role: "Huge armored mountain bear", biome: "mountain", category: 3, profile: "tank", damageType: "slashing", extraTags: ["bear"], damageResistances: ["bludgeoning"], specialAbility: ["ThickHide"] },
    { id: "mountainManeLion", name: "Mountain-Mane Lion", role: "Apex mountain cat", biome: "mountain", category: 3, profile: "normal", damageType: "slashing", extraTags: ["cat"], specialAbility: ["Pounce", "BloodFrenzy"] },
    { id: "ancientStonehornYak", name: "Ancient Stonehorn Yak", role: "Category 3 mountain beast boss", biome: "mountain", category: 3, profile: "boss", damageType: "bludgeoning", extraTags: ["yak", "boss"], damageResistances: ["bludgeoning"], specialAbility: ["Stampede", "BossRoar"] },


    /* ============================================================
     * BEAST + GRASSLAND
     * ============================================================ */

    // Category 1
    { id: "prairieJackal", name: "Prairie Jackal", role: "Small grassland hunter", biome: "grassland", category: 1, profile: "light", damageType: "piercing", extraTags: ["jackal"], specialAbility: ["Pounce"] },
    { id: "fieldBoar", name: "Field Boar", role: "Aggressive grassland charger", biome: "grassland", category: 1, profile: "brute", damageType: "piercing", extraTags: ["boar"], specialAbility: ["Charge"] },
    { id: "swiftStepAntelope", name: "Swift-Step Antelope", role: "Fast grassland beast", biome: "grassland", category: 1, profile: "light", damageType: "bludgeoning", extraTags: ["antelope"] },
    { id: "burrowMongoose", name: "Burrow Mongoose", role: "Small darting hunter", biome: "grassland", category: 1, profile: "normal", damageType: "piercing", extraTags: ["mongoose"] },
    { id: "oldPlainstusk", name: "Old Plainstusk", role: "Category 1 grassland beast boss", biome: "grassland", category: 1, profile: "boss", damageType: "piercing", extraTags: ["boar", "boss"], specialAbility: ["Charge", "BossRoar"] },

    // Category 2
    { id: "savannaLioness", name: "Savanna Lioness", role: "Large grassland predator", biome: "grassland", category: 2, profile: "light", damageType: "slashing", extraTags: ["cat"], specialAbility: ["Pounce"] },
    { id: "plainstalkerHyena", name: "Plainstalker Hyena", role: "Enduring scavenger hunter", biome: "grassland", category: 2, profile: "normal", damageType: "piercing", extraTags: ["hyena"], specialAbility: ["BloodFrenzy"] },
    { id: "thunderhoofBison", name: "Thunderhoof Bison", role: "Heavy grassland charger", biome: "grassland", category: 2, profile: "brute", damageType: "bludgeoning", extraTags: ["bison"], specialAbility: ["Charge"] },
    { id: "shieldbackPangolin", name: "Shieldback Pangolin", role: "Armored grassland beast", biome: "grassland", category: 2, profile: "tank", damageType: "slashing", extraTags: ["pangolin"], damageResistances: ["slashing"], specialAbility: ["ShellGuard"] },
    { id: "scarredSavannaLion", name: "Scarred Savanna Lion", role: "Category 2 grassland beast boss", biome: "grassland", category: 2, profile: "boss", damageType: "slashing", extraTags: ["cat", "boss"], specialAbility: ["Pounce", "BossRoar"] },

    // Category 3
    { id: "elderPrairieLion", name: "Elder Prairie Lion", role: "Elite grassland predator", biome: "grassland", category: 3, profile: "light", damageType: "slashing", extraTags: ["cat"], specialAbility: ["Pounce"] },
    { id: "stampedeBison", name: "Stampede Bison", role: "Massive grassland charger", biome: "grassland", category: 3, profile: "brute", damageType: "bludgeoning", extraTags: ["bison"], specialAbility: ["Stampede"] },
    { id: "ironhideRhino", name: "Ironhide Rhino", role: "Armored grassland brute", biome: "grassland", category: 3, profile: "tank", damageType: "piercing", extraTags: ["rhino"], damageResistances: ["piercing"], specialAbility: ["ThickHide", "Charge"] },
    { id: "razorManeHyena", name: "Razor-Mane Hyena", role: "Savage grassland scavenger", biome: "grassland", category: 3, profile: "normal", damageType: "piercing", extraTags: ["hyena"], specialAbility: ["BloodFrenzy"] },
    { id: "ancientThunderhoof", name: "Ancient Thunderhoof", role: "Category 3 grassland beast boss", biome: "grassland", category: 3, profile: "boss", damageType: "bludgeoning", extraTags: ["bison", "boss"], specialAbility: ["Stampede", "BossRoar"] },
  ];

  function makeDamage(profile, monster) {
    const damageType = monster.damageType || "piercing";
    const damage = {
      count: profile.damage.count,
      sides: profile.damage.sides,
      bonus: profile.damage.bonus,
      type: damageType,
      attackType: monster.attackType || "weapon",
      label: `${profile.damage.count}d${profile.damage.sides} + ${profile.damage.bonus} ${damageType}`,
    };

    if (monster.range || profile.range) {
      damage.range = monster.range || profile.range;
    }

    return damage;
  }

  function registerBeast(monster) {
    const profile = profiles[monster.category][monster.profile];

    const entry = {
      name: monster.name,
      role: monster.role,
      tags: ["beast", monster.biome, ...(monster.extraTags || [])],
      maxHp: monster.maxHp ?? profile.maxHp,
      category: monster.category,
      xp: monster.xp ?? profile.xp,
      ac: monster.ac ?? profile.ac,
      attackBonus: monster.attackBonus ?? profile.attackBonus,
      damage: makeDamage(profile, monster),
      initiativeBonus: monster.initiativeBonus ?? profile.initiativeBonus,
      speedFeet: monster.speedFeet ?? profile.speedFeet,
      behavior: monster.behavior ?? profile.behavior,
      token: monster.token || monster.name[0],
    };

    if (monster.damageResistances) entry.damageResistances = monster.damageResistances;
    if (monster.damageVulnerabilities) entry.damageVulnerabilities = monster.damageVulnerabilities;
    if (monster.damageImmunities) entry.damageImmunities = monster.damageImmunities;
    if (monster.conditionImmunities) entry.conditionImmunities = monster.conditionImmunities;
    if (monster.specialAbility) entry.specialAbility = monster.specialAbility;

    if (monster.extraTags?.includes("boss")) {
      entry.extraLoot = [
        {
          kind: "randomEquipment",
        },
      ];
    }

    window.DungeonContent.register("monsters", monster.id, entry);

    window.BeastBiomeMonsterIds = window.BeastBiomeMonsterIds || {};
    window.BeastBiomeMonsterIds[monster.biome] = window.BeastBiomeMonsterIds[monster.biome] || [];
    window.BeastBiomeMonsterIds[monster.biome].push(monster.id);
  }

  monsters.forEach(registerBeast);
})();