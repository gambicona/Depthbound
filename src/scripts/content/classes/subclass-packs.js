(() => {
const subclassFeatureLevels = [3, 6, 10, 14, 18];

function copyData(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}

function unique(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function feature(level, name, description) {
  return { level, name, description };
}

function ability(id, name, level, resource, description, effect, options = {}) {
  return {
    id,
    name,
    level,
    resource,
    refresh: options.refresh ?? "longRest",
    uses: options.uses ?? 1,
    usesByLevel: options.usesByLevel,
    resourcePool: options.resourcePool,
    description,
    subclassEffect: effect,
  };
}

function subclass(id, name, summary, gameplayGuide, features, abilities = [], extras = {}) {
  return {
    id,
    name,
    summary,
    gameplayGuide,
    featureNamesByLevel: Object.fromEntries(subclassFeatureLevels.map((level) => [level, features.filter((entry) => entry.level === level).map((entry) => entry.name)])),
    features,
    abilities,
    ...extras,
  };
}

function normalizeExistingSubclass(entry) {
  const normalizeLevel = (level) => level === 7 ? 6 : level === 15 ? 14 : level;
  const features = (entry.features ?? []).map((item) => ({
    ...item,
    level: normalizeLevel(item.level),
  }));
  const abilities = (entry.abilities ?? []).map((item) => ({
    ...item,
    level: normalizeLevel(item.level),
  }));
  const optionCounts = Object.fromEntries(
    Object.entries(entry.optionCounts ?? {}).map(([key, counts]) => [key, (counts ?? []).map((item) => ({ ...item, level: normalizeLevel(item.level) }))]),
  );
  const featureNamesByLevel = {};
  for (const [level, names] of Object.entries(entry.featureNamesByLevel ?? {})) {
    const normalized = normalizeLevel(Number(level));
    featureNamesByLevel[normalized] = unique([...(featureNamesByLevel[normalized] ?? []), ...(names ?? [])]);
  }
  if (!featureNamesByLevel[18]) featureNamesByLevel[18] = ["Apex Feature"];
  if (!features.some((item) => item.level === 18)) {
    features.push(feature(18, "Apex Feature", "Your subclass reaches its final upgrade, sharpening the playstyle it has taught you since level 3."));
  }
  return {
    ...entry,
    featureNamesByLevel,
    optionCounts,
    features,
    abilities,
  };
}

function asAdminSubclass(entry) {
  const normalized = copyData(entry);
  return {
    ...normalized,
    adminOnly: true,
    fullImplementation: true,
    name: `Full ${normalized.name}`,
    summary: normalized.summary
      ? `${normalized.summary} This is the larger experimental implementation kept behind admin mode for testing.`
      : "A larger experimental subclass implementation kept behind admin mode for testing.",
  };
}

function augmentClass(classId, subclasses, options = {}) {
  const template = window.DungeonContent.get("classes", classId);
  if (!template) return;
  const existing = (template.subclasses ?? []).map(normalizeExistingSubclass);
  const adminSubclasses = options.adminExisting
    ? (template.subclasses ?? []).map(asAdminSubclass)
    : (template.adminSubclasses ?? []);
  const merged = options.replaceExisting
    ? subclasses
    : [...existing, ...subclasses.filter((entry) => !existing.some((old) => old.id === entry.id))];
  window.DungeonContent.register("classes", classId, {
    ...template,
    subclassFeatureLevels,
    subclasses: merged,
    adminSubclasses,
    classFeatures: uniqueClassFeatures(template.classFeatures ?? []),
  });
}

function uniqueClassFeatures(features) {
  const hasSubclassChoice = features.some((entry) => (entry.level ?? 1) === 3 && /subclass|archetype|path|college|domain|circle|oath|origin|patron|school/i.test(entry.name ?? ""));
  if (hasSubclassChoice) return features;
  return [
    ...features,
    feature(3, "Subclass", "Choose the path that shapes how this class fights, supports allies, or uses magic in the dungeon."),
  ];
}

const common = {
  riderDamage: (dice, type, status = null) => ({ kind: "rider", dice, damageType: type, riderStatus: status }),
  self: (status) => ({ kind: "selfStatus", status }),
  ally: (status, target = "ally") => ({ kind: "allyStatus", status, target }),
  target: (status) => ({ kind: "targetStatus", status }),
  damageTarget: (dice, type, status = null) => ({ kind: "damageTarget", dice, damageType: type, riderStatus: status }),
  aoe: (dice, type, status = null, radius = 3) => ({ kind: "aoeDamage", dice, damageType: type, riderStatus: status, radius }),
  summon: (profile, name, durationRounds = 4) => ({ kind: "summonAlly", profile, name, durationRounds }),
};

const bardSubclasses = [
  subclass("college-of-lore", "College of Lore", "A sharp support bard who turns inspiration into enemy penalties, spell flexibility, and party control.", [
    "Use Cutting Words when a dangerous enemy needs to miss or hit less hard.",
    "Lore bards are tactical support casters: weaken enemies, keep allies standing, and use extra magical secrets to widen your spell answers.",
  ], [
    feature(3, "Cutting Words", "Spend Bardic Inspiration as a reaction-like curse to spoil an enemy's attack, damage, or focus."),
    feature(6, "Additional Magical Secrets", "Learn extra combat spells from outside the normal bard list."),
    feature(10, "Superior Inspiration", "When your rhythm falters, regain a burst of confidence for your next important move."),
    feature(14, "Peerless Skill", "Spend inspiration on yourself to make a key attack, save, or dungeon check more reliable."),
    feature(18, "Grand Secret", "Once per rest, recover a deep reserve of spell points for your strongest stolen magic."),
  ], [
    ability("cuttingWords", "Cutting Words", 3, "reaction", "When a visible enemy threatens the party, spend inspiration to make them less accurate and less dangerous for a round.", common.target({ id: "cutting-words", label: "Cutting Words", attackBonus: -3, damageBonus: -3, durationRounds: 1 }), { refresh: "longRest", uses: 3, resourcePool: "bardicInspiration" }),
    ability("loreSecretSpell", "Magical Secret", 6, "bonusAction", "Pull a stolen trick from your studies: your next spell or weapon hit carries extra force.", common.riderDamage({ count: 2, sides: 6 }, "force")),
    ability("superiorInspiration", "Superior Inspiration", 10, "bonusAction", "Find the beat again. Your next attack or save gains a strong bonus.", common.self({ id: "superior-inspiration", label: "Superior Inspiration", attackBonus: 3, saveBonus: 3, expiresAtEndOfTurn: true }), { refresh: "shortRest" }),
    ability("peerlessSkill", "Peerless Skill", 14, "bonusAction", "Turn inspiration inward. Your next attack, save, or important check is much more reliable.", common.self({ id: "peerless-skill", label: "Peerless Skill", attackBonus: 4, saveBonus: 4, skillBonus: 4, expiresAtEndOfTurn: true }), { uses: 1, resourcePool: "bardicInspiration" }),
    ability("grandSecret", "Grand Secret", 18, "bonusAction", "Reach into your greatest magical secret and recover spell points for one more major cast.", { kind: "restoreSpellPoints", amount: 8 }, { refresh: "longRest" }),
  ], { expandedSpellList: ["fireball", "spirit_guardians", "shield"] }),
  subclass("college-of-valor", "College of Valor", "A battle-chanter who turns inspiration into courage, armor, and weapon momentum.", [
    "Stand close enough to help the front line. Valor rewards mixing weapon attacks, healing, and inspiration.",
    "Combat Inspiration gives an ally temporary HP and a damage rider so your songs feel useful inside a fight.",
  ], [
    feature(3, "Combat Inspiration", "Your inspiration can harden an ally and make their next hit stronger."),
    feature(6, "Extra Attack", "When you take the Attack action, attack twice instead of once."),
    feature(10, "War Chant", "As a bonus action, give the party temporary HP and a short attack bonus."),
    feature(14, "Battle Magic", "After casting a bard spell, prepare a weapon strike empowered by the same rhythm."),
    feature(18, "Heroic Chorus", "Your first inspiration in combat affects more allies."),
  ], [
    ability("combatInspiration", "Combat Inspiration", 3, "bonusAction", "Inspire an ally with a battle verse. They gain temporary HP and their next hit deals extra damage.", common.ally({ id: "combat-inspiration", label: "Combat Inspiration", tempHp: 6, weaponRider: true, damageBonus: 4, damageType: "damage", durationRounds: 3 }), { uses: 3, resourcePool: "bardicInspiration" }),
    ability("warChant", "War Chant", 10, "bonusAction", "Chant over the fight. The party gains temporary HP and +1 to attack rolls for a short burst.", { kind: "partyStatus", status: { id: "war-chant", label: "War Chant", tempHp: { base: 4, proficiencyMultiplier: 1 }, attackBonus: 1, durationRounds: 2 } }, { refresh: "shortRest" }),
    ability("battleMagic", "Battle Magic", 14, "bonusAction", "Carry a spell's momentum into your weapon. Your next hit deals extra force damage.", common.riderDamage({ count: 2, sides: 8 }, "force"), { refresh: "shortRest" }),
    ability("heroicChorus", "Heroic Chorus", 18, "action", "Sing a heroic chorus that gives the whole party temporary HP and attack confidence.", { kind: "partyStatus", status: { id: "heroic-chorus", label: "Heroic Chorus", tempHp: 12, attackBonus: 2, durationRounds: 3 } }),
  ]),
  subclass("college-of-swords", "College of Swords", "A flashy duelist bard who spends inspiration on flourishes that move, defend, and cut harder.", [
    "Swords bards want to attack. Use flourishes before a weapon hit to add damage and a short defensive or control rider.",
    "You still cast spells, but your subclass identity is weaving blade work into the song.",
  ], [
    feature(3, "Blade Flourish", "Spend inspiration to turn a weapon hit into damage plus defense, movement, or control."),
    feature(6, "Extra Attack", "When you take the Attack action, attack twice instead of once."),
    feature(10, "Flourish Mastery", "Your flourish die becomes stronger and you can prepare a reliable flourish more often."),
    feature(14, "Master's Flourish", "Once per turn, prepare a smaller flourish without spending Bardic Inspiration."),
    feature(18, "Finale", "Once per rest, perform a decisive flourish that boosts your blade work and footwork."),
  ], [
    ability("bladeFlourish", "Blade Flourish", 3, "bonusAction", "Prepare a flourish. Your next weapon hit deals extra slashing damage and throws your footwork into motion.", common.riderDamage({ count: 1, sides: 8 }, "slashing", "distracted"), { uses: 3, resourcePool: "bardicInspiration" }),
    ability("flourishMastery", "Flourish Mastery", 10, "bonusAction", "Prepare a practiced flourish. Your next weapon hit deals stronger slashing damage and distracts the target.", common.riderDamage({ count: 1, sides: 10 }, "slashing", "distracted"), { refresh: "shortRest" }),
    ability("mastersFlourish", "Master's Flourish", 14, "bonusAction", "Use a lighter flourish without spending inspiration. Your next weapon hit deals extra slashing damage.", common.riderDamage({ count: 1, sides: 6 }, "slashing"), { refresh: "turn" }),
    ability("finale", "Finale", 18, "bonusAction", "Enter a dazzling finale for several rounds, gaining AC, speed, and extra weapon damage.", common.self({ id: "finale", label: "Finale", acBonus: 2, speedBonusFeet: 10, damageBonus: 3, durationRounds: 3 })),
  ]),
];

const clericSubclasses = [
  subclass("life-domain", "Life Domain", "A devoted healer whose divine magic keeps allies upright through hard fights.", [
    "Use Preserve Life when several heroes are hurt or one ally is close to falling.",
    "Life Domain is about reliable recovery, stronger healing spells, and steady party survival.",
  ], [
    feature(3, "Disciple of Life", "When you cast a healing spell, it restores extra HP equal to 2 + the spell's level."),
    feature(6, "Preserve Life", "As an action once per short rest, heal wounded party members for 5 times your cleric level HP each."),
    feature(10, "Blessed Healer", "When you heal an ally with a spell, you also recover a smaller amount of HP."),
    feature(14, "Supreme Healing", "Once per rest, flood the party with extra healing and temporary HP."),
    feature(18, "Beacon of Life", "Once per rest, surround the party with powerful healing light."),
  ], [
    ability("preserveLife", "Preserve Life", 6, "action", "Release divine healing across the party, restoring HP equal to 5 times your cleric level.", { kind: "partyHeal", amount: { levelMultiplier: 5 } }, { refresh: "shortRest", uses: 1 }),
    ability("supremeHealing", "Supreme Healing", 14, "action", "Release a perfect healing prayer. The party recovers HP and gains temporary HP.", { kind: "partyHealStatus", amount: { base: 10, levelMultiplier: 2 }, status: { id: "supreme-healing", label: "Supreme Healing", tempHp: { base: 4, proficiencyMultiplier: 2 }, durationRounds: 3 } }, { refresh: "longRest" }),
    ability("beaconOfLife", "Beacon of Life", 18, "action", "Fill the room with life-giving light. Allies heal now and gain temporary HP.", { kind: "partyHealStatus", amount: 24, status: { id: "beacon-of-life", label: "Beacon of Life", tempHp: 10, durationRounds: 3 } }),
  ], { expandedSpellList: ["aid", "cure_wounds", "mass_healing_word"] }),
  subclass("tempest-domain", "Tempest Domain", "A storm priest who answers danger with thunder, lightning, and punishing reactions.", [
    "Tempest clerics like being close enough for thunder bursts and storm retaliation.",
    "Use Destructive Wrath when clustered enemies need to be broken quickly.",
  ], [
    feature(3, "Wrath of the Storm", "When danger closes in, answer with a burst of lightning or thunder."),
    feature(6, "Destructive Wrath", "Channel Divinity turns thunder or lightning into a reliable burst."),
    feature(10, "Thunderbolt Strike", "Storm power batters enemies, slowing or knocking them off balance."),
    feature(14, "Storm Shield", "Briefly grant the party resistance against lightning and thunder."),
    feature(18, "Avatar of the Tempest", "A short storm aura damages and hinders nearby enemies."),
  ], [
    ability("wrathOfTheStorm", "Wrath of the Storm", 3, "reaction", "Answer an enemy with storm power, dealing lightning damage and shaking their attack.", common.damageTarget({ count: 2, sides: 8 }, "lightning", "shaken"), { refresh: "shortRest" }),
    ability("destructiveWrath", "Destructive Wrath", 6, "action", "Call down a controlled storm burst around you, dealing thunder damage to nearby enemies.", common.aoe({ count: 3, sides: 8 }, "thunder", "hamstrung", 3), { refresh: "shortRest" }),
    ability("thunderboltStrike", "Thunderbolt Strike", 10, "bonusAction", "Charge your next hit with thunder. It deals extra thunder damage and knocks the target off balance.", common.riderDamage({ count: 2, sides: 8 }, "thunder", "prone"), { refresh: "shortRest" }),
    ability("stormShield", "Storm Shield", 14, "bonusAction", "Raise a storm ward. The party resists lightning and thunder for several rounds.", { kind: "partyStatus", status: { id: "storm-shield", label: "Storm Shield", resistances: ["lightning", "thunder"], durationRounds: 3 } }, { refresh: "shortRest" }),
    ability("avatarTempest", "Avatar of the Tempest", 18, "bonusAction", "Wrap yourself in storm power, resisting storm damage and adding lightning to your hits.", common.self({ id: "avatar-tempest", label: "Avatar of the Tempest", resistances: ["lightning", "thunder"], damageBonus: 5, durationRounds: 3 })),
  ], { expandedSpellList: ["thunderwave", "shatter", "call_lightning"] }),
  subclass("war-domain", "War Domain", "A militant cleric who turns faith into weapon pressure, accuracy, and battle commands.", [
    "War Domain fights with weapons more than most clerics. Use War Priest when a bonus strike can finish a target.",
    "Guided Strike is your accuracy button for important smites, cantrips, or weapon hits.",
  ], [
    feature(3, "War Priest", "Make a bonus weapon strike a limited number of times."),
    feature(6, "Guided Strike", "Channel Divinity steadies an important attack."),
    feature(10, "War God's Blessing", "Bless an ally's next strike with divine accuracy."),
    feature(14, "Divine Strike", "Prepare a radiant weapon blow once per turn."),
    feature(18, "Avatar of Battle", "You resist weapon punishment and inspire the party's offense."),
  ], [
    ability("warPriestStrike", "War Priest Strike", 3, "bonusAction", "Make a quick weapon strike in the name of your deity.", { kind: "bonusAttack" }, { uses: 3 }),
    ability("guidedStrike", "Guided Strike", 6, "bonusAction", "Ask your deity to guide your next attack with a strong accuracy bonus.", common.self({ id: "guided-strike", label: "Guided Strike", attackBonus: 8, expiresAtEndOfTurn: true }), { refresh: "shortRest" }),
    ability("warGodsBlessing", "War God's Blessing", 10, "bonusAction", "Bless an ally's next attack with a strong accuracy bonus.", common.ally({ id: "war-gods-blessing", label: "War God's Blessing", attackBonus: 6, expiresAtEndOfTurn: true }), { refresh: "shortRest" }),
    ability("warDivineStrike", "Divine Strike", 14, "bonusAction", "Consecrate your next weapon hit with radiant damage.", common.riderDamage({ count: 2, sides: 8 }, "radiant"), { refresh: "turn" }),
    ability("avatarBattle", "Avatar of Battle", 18, "bonusAction", "Become a divine war banner, resisting weapon damage and empowering your own hits.", common.self({ id: "avatar-battle", label: "Avatar of Battle", resistances: ["bludgeoning", "piercing", "slashing"], damageBonus: 4, durationRounds: 3 })),
  ], { expandedSpellList: ["divine_favor", "spiritual_weapon", "spirit_guardians"] }),
];

const rogueSubclasses = [
  subclass("thief", "Thief", "A fast dungeon opportunist who turns movement, items, and dirty tricks into combat advantage.", [
    "Thief is the practical rogue. Use Fast Hands for quick pressure and Thief's Reflexes for a late-game burst of speed.",
    "You win by acting early, moving well, and creating Sneak Attack openings.",
  ], [
    feature(3, "Fast Hands", "Use a quick trick as a bonus action to distract or hinder a foe."),
    feature(6, "Second-Story Work", "Move like a dungeon climber, gaining speed and better mobility checks for a short burst."),
    feature(10, "Supreme Sneak", "Set up a careful approach that makes your next strike much more reliable."),
    feature(14, "Use Magic Device", "Trigger a stolen magical trick even without being a spellcaster."),
    feature(18, "Thief's Reflexes", "At the start of combat, gain a burst of speed and advantage."),
  ], [
    ability("fastHandsTrick", "Fast Hands Trick", 3, "bonusAction", "Throw sand, yank a strap, or exploit the room. The target becomes easier to hit.", common.damageTarget({ count: 1, sides: 4 }, "bludgeoning", "distracted"), { refresh: "turn" }),
    ability("secondStoryWork", "Second-Story Work", 6, "bonusAction", "Move through the room with practiced agility, gaining speed and mobility confidence.", common.self({ id: "second-story-work", label: "Second-Story Work", speedBonusFeet: 10, skillBonus: 3, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("supremeSneak", "Supreme Sneak", 10, "bonusAction", "Melt into a careful angle. Your next attack has advantage and your movement improves briefly.", common.self({ id: "supreme-sneak", label: "Supreme Sneak", attackAdvantage: true, speedBonusFeet: 10, expiresAtEndOfTurn: true }), { refresh: "shortRest" }),
    ability("useMagicDevice", "Use Magic Device", 14, "action", "Force a stolen magic trick to work, blasting nearby enemies with unstable force.", common.aoe({ count: 4, sides: 6 }, "force", "shaken", 3), { refresh: "longRest" }),
    ability("thiefsReflexes", "Thief's Reflexes", 18, "none", "Spring into action with rogue speed. You gain movement and advantage for this turn.", common.self({ id: "thiefs-reflexes", label: "Thief's Reflexes", speedBonusFeet: 20, attackAdvantage: true, expiresAtEndOfTurn: true })),
  ]),
  subclass("assassin", "Assassin", "A burst rogue who opens fights with deadly accuracy and punishing first strikes.", [
    "Assassin is about the first round. Start fights from a good position, then use Assassinate before your opening attack.",
    "Poisoner's Ambush gives you another simple way to make a chosen hit matter.",
  ], [
    feature(3, "Assassinate", "Your first strike against an unprepared or marked enemy hits harder."),
    feature(6, "Ambush Preparation", "Prepare a poisoned opening for your next Sneak Attack."),
    feature(10, "Marked Impostor", "Mark a target and make your next hit shake their confidence."),
    feature(14, "Death Strike", "Once per rest, prepare a devastating strike for a priority enemy."),
    feature(18, "Perfect Ambush", "If you open cleanly, your next strike becomes brutally reliable."),
  ], [
    ability("assassinate", "Assassinate", 3, "bonusAction", "Prepare a killing opening. Your next weapon hit deals extra piercing damage and shakes the target.", common.riderDamage({ count: 2, sides: 6 }, "piercing", "shaken"), { refresh: "shortRest" }),
    ability("poisonersAmbush", "Ambush Preparation", 6, "bonusAction", "Coat your next strike with poison that weakens the enemy's attacks.", common.riderDamage({ count: 2, sides: 6 }, "poison", "enfeebled"), { uses: 2 }),
    ability("markedImpostor", "Marked Impostor", 10, "bonusAction", "Single out a target. Your next hit deals extra psychic damage and shakes them.", common.riderDamage({ count: 2, sides: 8 }, "psychic", "shaken"), { refresh: "shortRest" }),
    ability("deathStrike", "Death Strike", 14, "bonusAction", "Prepare a lethal strike. Your next weapon hit deals heavy piercing damage.", common.riderDamage({ count: 5, sides: 8 }, "piercing"), { refresh: "longRest" }),
    ability("perfectAmbush", "Perfect Ambush", 18, "bonusAction", "Commit to the perfect opening. Your next attack has advantage and deals extra piercing damage.", common.self({ id: "perfect-ambush", label: "Perfect Ambush", attackAdvantage: true, weaponRider: true, damageBonus: 12, damageType: "piercing", expiresAtEndOfTurn: true }), { refresh: "shortRest" }),
  ]),
  subclass("arcane-trickster", "Arcane Trickster", "A magical rogue who uses enchantment, control, and misdirection to create Sneak Attack openings.", [
    "You gain wizard-style tricks focused on distraction, charms, pins, and magical interruptions.",
    "Use Mage Hand Trickery when you want your next attack to land against a distracted foe.",
  ], [
    feature(3, "Trickster Spellcasting", "Learn wizard cantrips and spells focused on control, movement, and debuffs."),
    feature(6, "Mage Hand Trickery", "Distract a target at range to help set up Sneak Attack."),
    feature(10, "Magical Ambush", "Your next spell or strike is harder for the enemy to resist after a setup."),
    feature(14, "Versatile Trickster", "Distract a target as a quick setup for Sneak Attack."),
    feature(18, "Spell Thief", "Use a reaction-style interrupt to blunt enemy spell-like powers."),
  ], [
    ability("mageHandTrickery", "Mage Hand Trickery", 6, "bonusAction", "Use a spectral hand to distract your target, lowering its guard for your next attack.", common.target({ id: "mage-hand-trickery", label: "Distracted", acBonus: -2, expiresAtEndOfTurn: true }), { refresh: "turn" }),
    ability("magicalAmbush", "Magical Ambush", 10, "bonusAction", "Set up a hidden magical angle. Your next attack is more accurate and your next spell is harder to resist.", common.self({ id: "magical-ambush", label: "Magical Ambush", attackBonus: 3, saveDcBonus: 2, expiresAtEndOfTurn: true }), { refresh: "shortRest" }),
    ability("versatileTrickster", "Versatile Trickster", 14, "bonusAction", "Distract a target with magic, making them easier to hit this turn.", common.target({ id: "versatile-trickster", label: "Versatile Trickster", acBonus: -3, expiresAtEndOfTurn: true }), { refresh: "turn" }),
    ability("spellThief", "Spell Thief", 18, "reaction", "Interrupt an enemy spell-like power, reducing its effect and stealing a little spell energy.", { kind: "interruptSpell", restoreSpellPoints: 3 }, { refresh: "shortRest" }),
  ], {
    casterType: "third",
    spellcastingAbility: "int",
    spellPointProgression: { 3: 4, 4: 6, 5: 6, 6: 6, 7: 14, 8: 14, 9: 14, 10: 17, 11: 17, 12: 17, 13: 27, 14: 27, 15: 27, 16: 32, 17: 32, 18: 32, 19: 38, 20: 38 },
    expandedCantripList: ["mage-hand", "mind-sliver", "blade-ward"],
    expandedSpellList: ["sleep", "grease", "hold_person", "misty_step", "web"],
  }),
];

const rangerSubclasses = [
  subclass("hunter", "Hunter", "A focused monster-killer who chooses simple, reliable combat pressure.", [
    "Hunter is the straightforward ranger. Mark a target, then use Hunter's Prey before weapon attacks.",
    "Volley adds multi-target cleanup when enemies cluster together.",
  ], [
    feature(3, "Hunter's Prey", "Your next hit deals extra damage and can slow the target."),
    feature(6, "Defensive Tactics", "Brace against your chosen prey with a short defensive stance."),
    feature(10, "Multiattack Defense", "After a dangerous exchange, harden yourself against repeat attacks."),
    feature(14, "Volley", "Spread damage through clustered enemies."),
    feature(18, "Apex Predator", "Your first focused strike in a hard fight deals major bonus damage."),
  ], [
    ability("huntersPrey", "Hunter's Prey", 3, "bonusAction", "Pick the perfect opening. Your next weapon hit deals extra damage and slows the target.", common.riderDamage({ count: 1, sides: 8 }, "damage", "hamstrung"), { refresh: "turn" }),
    ability("defensiveTactics", "Defensive Tactics", 6, "bonusAction", "Read the monster's movements. Gain AC and saving throw support for a few rounds.", common.self({ id: "defensive-tactics", label: "Defensive Tactics", acBonus: 2, saveBonus: 2, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("multiattackDefense", "Multiattack Defense", 10, "reaction", "Guard against a follow-up assault, sharply raising your AC for a short window.", common.self({ id: "multiattack-defense", label: "Multiattack Defense", acBonus: 4, durationRounds: 1 }), { refresh: "shortRest" }),
    ability("volley", "Volley", 14, "action", "Loose a sweeping volley into nearby enemies.", common.aoe({ count: 3, sides: 6 }, "piercing", null, 4), { refresh: "shortRest" }),
    ability("apexPredator", "Apex Predator", 18, "bonusAction", "Commit to a wounded or marked prey. Your next hit deals heavy extra damage.", common.riderDamage({ count: 4, sides: 8 }, "damage", "marked"), { refresh: "shortRest" }),
  ]),
  subclass("beast-master", "Beast Master", "A ranger who fights beside a loyal companion that grows with them.", [
    "At level 3, choose a permanent beast companion. You control it as a Warrior sidekick, and it uses your proficiency bonus for AC, attacks, damage, proficient saves, and proficient skills.",
    "Use Coordinated Command to point the companion at the target you care about.",
  ], [
    feature(3, "Ranger's Companion", "Choose a loyal beast companion. It fights beside you, uses your proficiency bonus, and grows through the Warrior sidekick level system."),
    feature(6, "Coordinated Attack", "Command the companion and empower your next hit against the same prey."),
    feature(10, "Bestial Defense", "Your bond gives you temporary HP and defensive confidence."),
    feature(14, "Storm of Claws", "Command a brutal companion strike that hinders the enemy."),
    feature(18, "Primal Bond", "Your companion bond reaches its peak, improving commands and durability."),
  ], [
    ability("coordinatedCommand", "Coordinated Command", 6, "bonusAction", "Mark your prey for both you and your companion. Your next hit deals extra damage.", common.riderDamage({ count: 1, sides: 8 }, "piercing", "marked"), { refresh: "turn" }),
    ability("bestialDefense", "Bestial Defense", 10, "bonusAction", "Your companion guards your flank. Gain temporary HP and AC for a few rounds.", common.self({ id: "bestial-defense", label: "Bestial Defense", tempHp: { base: 4, levelMultiplier: 1 }, acBonus: 1, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("stormOfClaws", "Storm of Claws", 14, "action", "Command a savage companion strike that deals slashing damage and knocks the target off balance.", common.damageTarget({ count: 4, sides: 6 }, "slashing", "prone"), { refresh: "shortRest" }),
    ability("primalBond", "Primal Bond", 18, "bonusAction", "Push the bond to its peak. Your next hit is stronger and your defenses rise briefly.", common.self({ id: "primal-bond", label: "Primal Bond", attackBonus: 2, acBonus: 2, weaponRider: true, damageBonus: 8, damageType: "piercing", durationRounds: 2 }), { refresh: "shortRest" }),
  ]),
  subclass("gloom-stalker", "Gloom Stalker", "An ambush ranger who strikes hard at the start of battle and fights from shadow.", [
    "Gloom Stalker wants the opening turn. Use Dread Ambusher before your first attack when a dangerous target must fall quickly.",
    "Stalker's Flurry keeps your pressure high after a bad exchange.",
  ], [
    feature(3, "Dread Ambusher", "Start combat with speed, accuracy, and extra damage."),
    feature(6, "Umbral Defense", "Become harder to hit before you fully reveal yourself."),
    feature(10, "Iron Mind", "Steady your mind against fear and control."),
    feature(14, "Stalker's Flurry", "Recover from a miss by preparing another strike."),
    feature(18, "Shadow Apex", "Your opening strike can terrify and wound a priority target."),
  ], [
    ability("dreadAmbusher", "Dread Ambusher", 3, "bonusAction", "Explode from the shadows. Gain speed and make your next hit deal extra psychic damage.", common.self({ id: "dread-ambusher", label: "Dread Ambusher", speedBonusFeet: 10, attackBonus: 2, weaponRider: true, damageBonus: 6, damageType: "psychic", expiresAtEndOfTurn: true }), { refresh: "shortRest" }),
    ability("umbralDefense", "Umbral Defense", 6, "bonusAction", "Blend into poor light and awkward angles, gaining AC and speed briefly.", common.self({ id: "umbral-defense", label: "Umbral Defense", acBonus: 2, speedBonusFeet: 10, durationRounds: 2 }), { refresh: "shortRest" }),
    ability("ironMind", "Iron Mind", 10, "bonusAction", "Lock your focus. Gain saving throw support and resistance to fear pressure for a few rounds.", common.self({ id: "iron-mind", label: "Iron Mind", saveBonus: 3, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("stalkersFlurry", "Stalker's Flurry", 14, "bonusAction", "Refocus after a bad exchange. Your next attack has advantage and extra damage.", common.self({ id: "stalkers-flurry", label: "Stalker's Flurry", attackAdvantage: true, weaponRider: true, damageBonus: 5, damageType: "damage", expiresAtEndOfTurn: true }), { refresh: "turn" }),
    ability("shadowApex", "Shadow Apex", 18, "bonusAction", "Turn the opening into a nightmare. Your next hit deals extra psychic damage and frightens the target.", common.riderDamage({ count: 3, sides: 8 }, "psychic", "frightened"), { refresh: "shortRest" }),
  ]),
];

const wizardSubclasses = [
  subclass("school-evocation", "School of Evocation", "A battle wizard who throws safer, stronger blasts.", [
    "Evocation is the direct blaster school. Use Overchannel when a spell or strike needs to hit especially hard.",
    "Use Overchannel when one spell needs to hit as hard as possible.",
  ], [
    feature(3, "Sculpt Spells", "Your area evocation spells are shaped around allies in this crawler's monster-targeting spell system."),
    feature(6, "Potent Cantrip", "Prepare a cantrip or quick blast to hit harder."),
    feature(10, "Empowered Evocation", "Drive extra Intelligence-fueled force into your next evocation hit."),
    feature(14, "Overchannel", "Once per rest, push a damage spell beyond normal limits."),
    feature(18, "Arch-Evoker", "Your first big blast in a hard fight becomes cheaper to follow up."),
  ], [
    ability("potentCantrip", "Potent Cantrip", 6, "bonusAction", "Empower a simple spell rhythm. Your next hit carries extra force damage.", common.riderDamage({ count: 1, sides: 8 }, "force"), { refresh: "shortRest" }),
    ability("empoweredEvocation", "Empowered Evocation", 10, "bonusAction", "Add raw evocation force to your next spell or weapon hit.", common.riderDamage({ count: 2, sides: 8 }, "force"), { refresh: "shortRest" }),
    ability("overchannel", "Overchannel", 14, "bonusAction", "Overload your next spell or weapon hit with raw evocation force.", common.riderDamage({ count: 4, sides: 8 }, "force"), { refresh: "longRest" }),
    ability("archEvoker", "Arch-Evoker", 18, "bonusAction", "Recover spell points after shaping a major blast, letting you keep pressure on the room.", { kind: "restoreSpellPoints", amount: 6 }, { refresh: "shortRest" }),
  ]),
  subclass("school-necromancy", "School of Necromancy", "A death mage who drains life and fights beside a simple undead ally.", [
    "Necromancy rewards finishing enemies with spells and spending actions to call an undead helper.",
    "The undead fights on its own beside the party. If the space is too crowded, its power becomes an immediate skeletal strike instead.",
  ], [
    feature(3, "Grim Harvest", "When death magic finishes a foe, recover through necromantic momentum."),
    feature(6, "Undead Thrall", "Summon a temporary skeletal ally that fights beside you."),
    feature(10, "Inured to Undeath", "Briefly harden yourself against necrotic harm and draining effects."),
    feature(14, "Command Undead", "Briefly dominate or frighten an undead or death-marked enemy."),
    feature(18, "Deathly Conduit", "Necrotic power heals you and strengthens your death magic."),
  ], [
    ability("grimHarvest", "Grim Harvest", 3, "bonusAction", "Draw strength from death magic, recovering HP before returning to the fight.", { kind: "selfHeal", amount: { base: 4, levelMultiplier: 1 } }, { refresh: "shortRest" }),
    ability("undeadThrall", "Undead Thrall", 6, "action", "Raise a skeletal ally for this fight. If there is no room, a skeletal strike hits your target instead.", common.summon("rangedKiter", "Skeletal Thrall", 5), { refresh: "shortRest" }),
    ability("inuredToUndeath", "Inured to Undeath", 10, "bonusAction", "Wrap yourself in deathly endurance, resisting necrotic damage for several rounds.", common.self({ id: "inured-to-undeath", label: "Inured to Undeath", resistances: ["necrotic"], tempHp: { base: 4, proficiencyMultiplier: 2 }, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("commandUndead", "Command Undead", 14, "action", "Force an undead or death-marked enemy to turn on its allies for a short time. Powerful foes suffer fear instead.", { kind: "dominateTarget", durationRounds: 1 }, { refresh: "longRest" }),
    ability("deathlyConduit", "Deathly Conduit", 18, "bonusAction", "Open a deathly conduit. Heal yourself and make your next hit deal necrotic damage.", common.self({ id: "deathly-conduit", label: "Deathly Conduit", tempHp: 12, weaponRider: true, damageBonus: 10, damageType: "necrotic", durationRounds: 3 }), { refresh: "longRest" }),
  ], { expandedSpellList: ["chill-touch", "vampiric_touch", "arms_of_hadar"] }),
  subclass("school-divination", "School of Divination", "A fate reader who stores luck, reveals danger, and bends key rolls.", [
    "Divination is about control and foresight. Use Portent before a key attack or save.",
    "Third Eye reveals practical dungeon threats such as traps and hidden danger.",
  ], [
    feature(3, "Portent", "Store a fate die and spend it as a bonus to your next important roll."),
    feature(6, "Expert Divination", "Reading the fight restores a little spell power."),
    feature(10, "Third Eye", "Reveal nearby traps and gain initiative foresight."),
    feature(14, "Greater Portent", "Hold an even stronger fate die for a decisive moment."),
    feature(18, "Fate Master", "Once per rest, force fate strongly toward an ally's success."),
  ], [
    ability("portentDie", "Portent Die", 3, "bonusAction", "Read the next few heartbeats. Your next attack or spell gains a strong accuracy bonus.", common.self({ id: "portent-die", label: "Portent", attackBonus: 5, saveBonus: 3, expiresAtEndOfTurn: true }), { uses: 2, refresh: "longRest" }),
    ability("expertDivination", "Expert Divination", 6, "bonusAction", "Turn a glimpse of the future into recovered spell power.", { kind: "restoreSpellPoints", amount: 3 }, { refresh: "shortRest" }),
    ability("thirdEye", "Third Eye", 10, "action", "Open your sight to the dungeon. Nearby traps are revealed and you gain initiative-like focus.", { kind: "revealTraps", status: { id: "third-eye", label: "Third Eye", skillBonus: 3, durationRounds: 3 } }, { refresh: "shortRest" }),
    ability("greaterPortent", "Greater Portent", 14, "bonusAction", "Force a stronger omen into the moment. Your next attack or save gains a major bonus.", common.self({ id: "greater-portent", label: "Greater Portent", attackBonus: 7, saveBonus: 5, expiresAtEndOfTurn: true }), { uses: 3, refresh: "longRest" }),
    ability("fateMaster", "Fate Master", 18, "bonusAction", "Bend fate hard in your favor. Your next attack has advantage and your next save is heavily protected.", common.self({ id: "fate-master", label: "Fate Master", attackAdvantage: true, saveBonus: 8, expiresAtEndOfTurn: true }), { refresh: "longRest" }),
  ]),
];

const druidSubclasses = [
  subclass("circle-moon", "Circle of the Moon", "A combat shapeshifter whose Wild Shape becomes a front-line battle form.", [
    "Moon Druid is the beast-form druid. Use Wild Shape aggressively when you need HP, melee pressure, or a different natural attack.",
    "Elemental Shape adds a short burst of resistance and damage when your form needs more pressure.",
  ], [
    feature(3, "Combat Wild Shape", "Wild Shape is your combat form, giving you a front-line HP buffer and natural attacks."),
    feature(6, "Primal Strikes", "Your beast-form pressure becomes more dangerous."),
    feature(10, "Elemental Shape", "Your form can take on elemental resistance and damage."),
    feature(14, "Thousand Forms", "Shift defensively to regain HP and adapt under pressure."),
    feature(18, "Archdruid Shape", "Recover a Wild Shape rhythm and keep spellcasting pressure while transformed."),
  ], [
    ability("combatWildShape", "Combat Wild Shape", 3, "bonusAction", "Call on your combat shape instincts, gaining temporary HP before you enter the front line.", common.self({ id: "combat-wild-shape", label: "Combat Wild Shape", tempHp: { base: 4, levelMultiplier: 1 }, durationRounds: 3 }), { refresh: "shortRest", resourcePool: "wildShape" }),
    ability("primalStrikes", "Primal Strikes", 6, "bonusAction", "Sharpen your beast-form attacks. Your next hit deals extra forceful natural damage.", common.riderDamage({ count: 1, sides: 8 }, "force"), { refresh: "shortRest" }),
    ability("moonElementalShape", "Elemental Shape", 10, "bonusAction", "Wrap your current form or body in elemental power: resist fire and add elemental damage.", common.self({ id: "elemental-shape", label: "Elemental Shape", resistances: ["fire", "cold", "lightning"], damageBonus: 4, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("thousandForms", "Thousand Forms", 14, "bonusAction", "Adapt your body mid-fight, restoring HP and gaining a short defensive buffer.", { kind: "selfHeal", amount: { base: 6, levelMultiplier: 2 } }, { refresh: "longRest" }),
    ability("archdruidShape", "Archdruid Shape", 18, "bonusAction", "Recover a Wild Shape rhythm as spell and beast instincts merge.", { kind: "restoreSpellPoints", amount: 6 }, { refresh: "shortRest" }),
  ]),
  subclass("circle-land", "Circle of the Land", "A terrain-bound caster who recovers magic and turns ground control into advantage.", [
    "Land Druid is the spell-loop druid. Use Natural Recovery to refill spell points and keep casting.",
    "Your terrain features help you move through dangerous ground and turn area control into an advantage.",
  ], [
    feature(3, "Natural Recovery", "Once per long rest, recover spell points equal to 2 times your druid level."),
    feature(6, "Circle Spells", "Learn extra land-themed combat spells."),
    feature(10, "Nature's Ward", "Ignore difficult terrain while moving through the dungeon."),
    feature(14, "Nature's Sanctuary", "Enemies struggle to strike you after nature magic."),
    feature(18, "Elder Land", "Your land magic refills enough power to keep casting through a long fight."),
  ], [
    ability("naturalRecovery", "Natural Recovery", 3, "none", "Draw power from the land and recover spell points equal to 2 times your druid level.", { kind: "restoreSpellPoints", amount: { levelMultiplier: 2 } }, { refresh: "longRest" }),
    ability("naturesSanctuary", "Nature's Sanctuary", 14, "bonusAction", "Surround yourself with warding nature. Enemies have a harder time hitting you.", common.self({ id: "natures-sanctuary", label: "Nature's Sanctuary", acBonus: 3, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("elderLand", "Elder Land", 18, "bonusAction", "Draw from the deepest roots of your circle, recovering spell points so you can keep casting.", { kind: "restoreSpellPoints", amount: 8 }, { refresh: "longRest" }),
  ], { expandedSpellList: ["spike_growth", "call_lightning", "barkskin"] }),
  subclass("circle-shepherd", "Circle of the Shepherd", "A spirit caller who supports allies and summons temporary spirits.", [
    "Shepherd is the summon/support druid. Spirit Totem helps the party even when summon positioning is imperfect.",
    "Summoned spirits act on their own beside the party, either pressing into melee or harrying from range.",
  ], [
    feature(3, "Spirit Totem", "As a bonus action once per short rest, give the party temporary HP equal to 5 + your druid level and +1 to attack rolls for 3 rounds."),
    feature(6, "Summon Spirit Ally", "Call a temporary melee spirit for 4 rounds; it acts on its own beside the party and scales with your level."),
    feature(10, "Guardian Spirit", "Your spirit aura restores a small amount of party endurance."),
    feature(14, "Faithful Summons", "When the fight turns dangerous, call stronger spirit help."),
    feature(18, "Great Spirit", "Your spirit totem becomes a stronger party-wide battle blessing."),
  ], [
    ability("spiritTotem", "Spirit Totem", 3, "bonusAction", "Call a guardian spirit that gives the party temporary HP equal to 5 + your druid level and +1 to attack rolls.", { kind: "partyStatus", status: { id: "spirit-totem", label: "Spirit Totem", tempHp: { base: 5, levelMultiplier: 1 }, attackBonus: 1, durationRounds: 3 } }, { refresh: "shortRest" }),
    ability("summonSpiritAlly", "Summon Spirit Ally", 6, "action", "Call a temporary spirit beast that acts on its own beside the party.", common.summon("melee", "Spirit Beast", 4), { refresh: "shortRest" }),
    ability("guardianSpirit", "Guardian Spirit", 10, "bonusAction", "The guardian spirit restores party endurance and keeps allies brave.", { kind: "partyHealStatus", amount: { base: 3, proficiencyMultiplier: 2 }, status: { id: "guardian-spirit", label: "Guardian Spirit", tempHp: { proficiencyMultiplier: 1 }, durationRounds: 2 } }, { refresh: "shortRest" }),
    ability("faithfulSummons", "Faithful Summons", 14, "action", "Call a stronger spirit beast to protect the party in a dangerous fight.", common.summon("melee", "Faithful Spirit", 5), { refresh: "longRest" }),
    ability("greatSpirit", "Great Spirit", 18, "bonusAction", "Call a greater spirit that gives the party larger temporary HP and +2 to attack rolls.", { kind: "partyStatus", status: { id: "great-spirit", label: "Great Spirit", tempHp: { base: 8, levelMultiplier: 1 }, attackBonus: 2, durationRounds: 3 } }, { refresh: "shortRest" }),
  ]),
];

const warlockSubclasses = [
  subclass("fiend-patron", "The Fiend", "A destructive patron path that feeds on kills, fire, and infernal resilience.", [
    "Fiend warlocks lean on infernal luck and burst damage.",
    "Use Hurl Through Hell when one target needs to disappear under a huge infernal burst.",
  ], [
    feature(3, "Dark One's Blessing", "Feed on victory, gaining temporary HP after a kill or as an infernal combat burst."),
    feature(6, "Dark One's Own Luck", "Add infernal luck to an important roll."),
    feature(10, "Fiendish Resilience", "Briefly resist common dungeon damage with infernal toughness."),
    feature(14, "Hurl Through Hell", "Banish a foe through nightmare fire for heavy damage."),
    feature(18, "Infernal Patronage", "Recover pact power and ready hellfire when your patron pushes you onward."),
  ], [
    ability("darkOnesBlessing", "Dark One's Blessing", 3, "bonusAction", "Draw infernal vigor from violence. Gain temporary HP for the next exchange.", common.self({ id: "dark-ones-blessing", label: "Dark One's Blessing", tempHp: { base: 2, levelMultiplier: 1 }, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("darkOnesLuck", "Dark One's Own Luck", 6, "bonusAction", "Call on infernal luck. Your next attack or save gains a strong bonus.", common.self({ id: "dark-ones-luck", label: "Dark One's Own Luck", attackBonus: 4, saveBonus: 4, expiresAtEndOfTurn: true }), { refresh: "shortRest" }),
    ability("fiendishResilience", "Fiendish Resilience", 10, "bonusAction", "Harden yourself with fiendish resilience, resisting fire and poison briefly.", common.self({ id: "fiendish-resilience", label: "Fiendish Resilience", resistances: ["fire", "poison"], durationRounds: 3 }), { refresh: "shortRest" }),
    ability("hurlThroughHell", "Hurl Through Hell", 14, "action", "Hurl a visible enemy through infernal torment, dealing psychic and fire damage and briefly banishing it.", common.damageTarget({ count: 6, sides: 10 }, "psychic", "banished"), { refresh: "longRest" }),
    ability("infernalPatronage", "Infernal Patronage", 18, "bonusAction", "Your patron pours power back into you. Recover pact spell points and ready hellfire.", { kind: "restoreSpellPoints", amount: 8 }, { refresh: "longRest" }),
  ], { expandedSpellList: ["burning_hands", "fireball", "scorching_ray"] }),
  subclass("hexblade", "The Hexblade", "A cursed weapon warlock who marks prey and calls a specter ally.", [
    "Hexblade plays like a curse duelist. Curse the target you want dead, then attack or blast it down.",
    "Hexblade weapon attacks use Charisma for hit and damage in this game, so CHA stays your main combat stat.",
    "Accursed Specter calls a short-lived spirit that fights beside you after you claim a soul.",
  ], [
    feature(3, "Hexblade's Curse", "Mark a foe so your hits against it are stronger."),
    feature(6, "Accursed Specter", "Call a short-duration specter ally."),
    feature(10, "Armor of Hexes", "When your curse is active, wrap yourself in defensive shadow."),
    feature(14, "Master of Hexes", "Move your curse's pressure into another strike when a target falls."),
    feature(18, "Cursed Sovereign", "Empower your curse against multiple enemies or one doomed target."),
  ], [
    ability("hexbladesCurse", "Hexblade's Curse", 3, "bonusAction", "Curse your prey. Your next weapon hit or blast deals extra necrotic damage and marks it.", common.riderDamage({ count: 1, sides: 8 }, "necrotic", "marked"), { refresh: "shortRest" }),
    ability("accursedSpecter", "Accursed Specter", 6, "action", "Call a short-lived specter that keeps its distance and harrys enemies.", common.summon("rangedKiter", "Accursed Specter", 4), { refresh: "longRest" }),
    ability("armorOfHexes", "Armor of Hexes", 10, "reaction", "Let cursed shadow bend a strike away from you, raising your AC briefly.", common.self({ id: "armor-of-hexes", label: "Armor of Hexes", acBonus: 4, durationRounds: 1 }), { refresh: "shortRest" }),
    ability("masterOfHexes", "Master of Hexes", 14, "bonusAction", "Carry your curse onward. Your next hit deals necrotic damage and marks the new target.", common.riderDamage({ count: 2, sides: 8 }, "necrotic", "marked"), { refresh: "shortRest" }),
    ability("cursedSovereign", "Cursed Sovereign", 18, "action", "Unleash your curse in a burst, damaging and marking nearby enemies.", common.aoe({ count: 4, sides: 8 }, "necrotic", "marked", 3), { refresh: "longRest" }),
  ]),
  subclass("great-old-one", "The Great Old One", "An alien mind patron that turns psychic pressure into fear, confusion, and brief domination.", [
    "Great Old One controls the fight. Use psychic marks to weaken targets before they hurt the party.",
    "Alien Thrall briefly turns a creature against its allies. Powerful foes resist full control but still suffer mental disruption.",
  ], [
    feature(3, "Psychic Intrusion", "Press alien thoughts into a target, dealing psychic damage and shaking its attacks."),
    feature(6, "Entropic Ward", "Twist probability to protect yourself and set up your next strike."),
    feature(10, "Thought Shield", "Resist psychic pressure and punish minds that strike yours."),
    feature(14, "Alien Thrall", "Briefly dominate an enemy or weaken a boss-safe target."),
    feature(18, "Elder Revelation", "Unleash a psychic burst that frightens the room."),
  ], [
    ability("psychicIntrusion", "Psychic Intrusion", 3, "bonusAction", "Press alien thoughts into a target, dealing psychic damage and shaking its attacks.", common.damageTarget({ count: 2, sides: 6 }, "psychic", "shaken"), { refresh: "shortRest" }),
    ability("entropicWard", "Entropic Ward", 6, "reaction", "Twist a dangerous moment aside. Gain AC now and advantage on your next attack.", common.self({ id: "entropic-ward", label: "Entropic Ward", acBonus: 3, attackAdvantage: true, durationRounds: 1 }), { refresh: "shortRest" }),
    ability("thoughtShield", "Thought Shield", 10, "bonusAction", "Shield your mind, resisting psychic damage and preparing a psychic backlash.", common.self({ id: "thought-shield", label: "Thought Shield", resistances: ["psychic"], weaponRider: true, damageBonus: 6, damageType: "psychic", durationRounds: 3 }), { refresh: "shortRest" }),
    ability("alienThrall", "Alien Thrall", 14, "action", "Briefly turn an enemy against its allies. Bosses suffer a weaker beguiled effect instead.", { kind: "dominateTarget", durationRounds: 1 }, { refresh: "longRest" }),
    ability("elderRevelation", "Elder Revelation", 18, "action", "Unleash a terrifying psychic wave around you.", common.aoe({ count: 5, sides: 8 }, "psychic", "frightened", 4), { refresh: "longRest" }),
  ]),
];

const sorcererSubclasses = [
  subclass("draconic-bloodline", "Draconic Bloodline", "A durable elemental sorcerer whose bloodline adds armor, damage, and fearsome presence.", [
    "Draconic sorcerers are tougher than most casters. Use Elemental Affinity before blasting with your chosen element.",
    "Draconic Presence is a short combat burst rather than an open exploration tool.",
  ], [
    feature(3, "Draconic Resilience", "Your draconic blood gives you temporary toughness and a sturdier battle stance."),
    feature(6, "Elemental Affinity", "Empower spells and attacks with your draconic element."),
    feature(10, "Dragon Wings", "Burst across the battlefield with draconic movement and defense."),
    feature(14, "Draconic Presence", "Frighten nearby enemies with ancient majesty."),
    feature(18, "Dragon Avatar", "Become a short-lived avatar of your draconic bloodline."),
  ], [
    ability("draconicResilience", "Draconic Resilience", 3, "bonusAction", "Call on your scales and bloodline, gaining temporary HP and AC for a few rounds.", common.self({ id: "draconic-resilience", label: "Draconic Resilience", tempHp: { base: 3, levelMultiplier: 1 }, acBonus: 1, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("elementalAffinity", "Elemental Affinity", 6, "bonusAction", "Draw on your draconic element. Your next hit or spell carries extra elemental damage.", common.riderDamage({ count: 2, sides: 6 }, "fire"), { refresh: "shortRest" }),
    ability("dragonWings", "Dragon Wings", 10, "bonusAction", "Unfurl spectral wings, gaining speed and AC long enough to reposition.", common.self({ id: "dragon-wings", label: "Dragon Wings", speedBonusFeet: 20, acBonus: 2, durationRounds: 2 }), { refresh: "shortRest" }),
    ability("draconicPresence", "Draconic Presence", 14, "action", "Unleash draconic majesty, frightening nearby enemies.", common.aoe({ count: 2, sides: 6 }, "psychic", "frightened", 3), { refresh: "longRest" }),
    ability("dragonAvatar", "Dragon Avatar", 18, "bonusAction", "Become a dragon avatar, resisting fire and empowering your hits for several rounds.", common.self({ id: "dragon-avatar", label: "Dragon Avatar", resistances: ["fire"], damageBonus: 5, durationRounds: 3 }), { refresh: "longRest" }),
  ]),
  subclass("wild-magic-sorcery", "Wild Magic", "A chaotic sorcerer whose magic surges into unstable buffs and bursts.", [
    "Wild Magic is high-energy and unpredictable, but every surge is useful in combat.",
    "Use Bend Luck when an important roll needs a push.",
  ], [
    feature(3, "Wild Surge", "Casting and subclass powers can spark a random combat boon."),
    feature(6, "Bend Luck", "Spend sorcery as a reaction to help an ally turn a near miss or failed save into success."),
    feature(10, "Controlled Chaos", "Trigger a more reliable wild surge when you need chaos to help."),
    feature(14, "Spell Bombardment", "Push your next damaging hit into a bigger chaotic burst."),
    feature(18, "Chaos Mastery", "Choose a decisive surge and recover sorcery power."),
  ], [
    ability("wildSorcerySurge", "Wild Sorcery Surge", 3, "bonusAction", "Let wild magic erupt into a useful combat boon.", { kind: "wildSurge" }, { refresh: "shortRest" }),
    ability("bendLuck", "Bend Luck", 6, "reaction", "When an ally barely misses an attack or fails a save, twist luck to add +3.", common.self({ id: "bend-luck", label: "Bend Luck", attackBonus: 3, saveBonus: 3, expiresAtEndOfTurn: true }), { uses: 3, resourcePool: "metamagic" }),
    ability("controlledChaos", "Controlled Chaos", 10, "bonusAction", "Shape the chaos into something useful, gaining a stronger random combat boon.", { kind: "wildSurge" }, { refresh: "shortRest" }),
    ability("spellBombardment", "Spell Bombardment", 14, "bonusAction", "Overload your next hit with chaotic force damage.", common.riderDamage({ count: 3, sides: 8 }, "force"), { refresh: "shortRest" }),
    ability("chaosMastery", "Chaos Mastery", 18, "bonusAction", "Master the surge, recovering sorcery power for another major turn.", { kind: "restoreSpellPoints", amount: 8 }, { refresh: "longRest" }),
  ]),
  subclass("divine-soul", "Divine Soul", "A sacred sorcerer who mixes arcane flexibility with healing and radiant protection.", [
    "Divine Soul is a support sorcerer. Use Favored by the Gods for key rolls and Unearthly Recovery when badly hurt.",
    "You gain more healing and radiant options than other sorcerers.",
  ], [
    feature(3, "Divine Magic", "Learn sacred spells alongside sorcerer magic."),
    feature(6, "Empowered Healing", "Boost a healing moment with divine sorcery."),
    feature(10, "Otherworldly Wings", "Move with radiant grace and protect yourself briefly."),
    feature(14, "Unearthly Recovery", "Recover a large amount of HP when badly hurt."),
    feature(18, "Divine Conduit", "Recover spell power and bless the party with temporary HP."),
  ], [
    ability("empoweredHealing", "Empowered Healing", 6, "bonusAction", "Pour divine sorcery into the party, restoring a modest amount of HP.", { kind: "partyHeal", amount: { base: 4, levelMultiplier: 1 } }, { refresh: "shortRest" }),
    ability("otherworldlyWings", "Otherworldly Wings", 10, "bonusAction", "Move with radiant grace, gaining speed, AC, and a radiant weapon rider.", common.self({ id: "otherworldly-wings", label: "Otherworldly Wings", speedBonusFeet: 20, acBonus: 2, weaponRider: true, damageBonus: 5, damageType: "radiant", durationRounds: 2 }), { refresh: "shortRest" }),
    ability("unearthlyRecovery", "Unearthly Recovery", 14, "bonusAction", "When badly hurt, flood yourself with divine recovery.", { kind: "selfHeal", amount: 40 }, { refresh: "longRest" }),
    ability("divineConduit", "Divine Conduit", 18, "action", "Open a divine conduit. The party gains temporary HP and divine protection.", { kind: "partyStatus", status: { id: "divine-conduit", label: "Divine Conduit", tempHp: 12, saveBonus: 2, durationRounds: 3 } }, { refresh: "longRest" }),
  ], { expandedSpellList: ["cure_wounds", "healing_word", "guiding_bolt", "aid"] }),
];

const monkSubclasses = [
  subclass("way-open-hand", "Way of the Open Hand", "A clean martial artist who turns flurries into control and self-healing.", [
    "Open Hand is the direct monk. Use Open Hand Technique before Flurry or an attack to knock enemies off balance.",
    "Wholeness of Body adds self-healing, and Quivering Palm gives one decisive finishing strike.",
  ], [
    feature(3, "Open Hand Technique", "Your strikes can knock prone, shove, or stagger."),
    feature(6, "Wholeness of Body", "As an action once per long rest, heal yourself for 3 times your monk level HP."),
    feature(10, "Tranquility", "Begin a hard exchange with defensive focus and temporary HP."),
    feature(14, "Quivering Palm", "Prepare a devastating delayed strike."),
    feature(18, "Perfect Body", "Recover your rhythm and sharpen Open Hand control for one more decisive turn."),
  ], [
    ability("openHandTechnique", "Open Hand Technique", 3, "bonusAction", "Set up your next strike to knock the target prone.", common.riderDamage({ count: 1, sides: 6 }, "bludgeoning", "prone"), { refresh: "shortRest", resourcePool: "ki", uses: 2 }),
    ability("wholenessOfBody", "Wholeness of Body", 6, "action", "Focus your breath and heal yourself for 3 times your monk level HP.", { kind: "selfHeal", amount: { levelMultiplier: 3 } }, { refresh: "longRest" }),
    ability("tranquility", "Tranquility", 10, "bonusAction", "Center yourself in calm. Gain temporary HP and AC for several rounds.", common.self({ id: "tranquility", label: "Tranquility", tempHp: { base: 4, levelMultiplier: 1 }, acBonus: 2, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("quiveringPalm", "Quivering Palm", 14, "bonusAction", "Place lethal vibrations in your next hit, dealing heavy force damage.", common.riderDamage({ count: 5, sides: 10 }, "force"), { refresh: "longRest" }),
    ability("perfectBody", "Perfect Body", 18, "bonusAction", "Recover your rhythm through perfect discipline, gaining defense and a stronger next strike.", common.self({ id: "perfect-body", label: "Perfect Body", acBonus: 2, weaponRider: true, damageBonus: 8, damageType: "force", durationRounds: 3 }), { refresh: "longRest" }),
  ]),
  subclass("way-shadow", "Way of Shadow", "A stealthy monk who uses darkness, silence, and sudden movement as combat tools.", [
    "Shadow monk uses practical shadow magic: defense, mobility, and enemy disruption.",
    "Use Shadow Step to reposition and attack with advantage.",
  ], [
    feature(3, "Shadow Arts", "Spend ki on shadow tricks that hinder enemies and prepare a safe attack."),
    feature(6, "Shadow Step", "Teleport-like movement gives advantage on your next strike."),
    feature(10, "Cloak of Shadows", "Become harder to hit until you strike."),
    feature(14, "Opportunist", "Prepare a reaction-like punish when an ally exposes an enemy."),
    feature(18, "Living Shadow", "Become a short-lived shadow battle-form."),
  ], [
    ability("shadowArts", "Shadow Arts", 3, "bonusAction", "Wrap a target in distracting shadow, making them easier to hit.", common.target({ id: "shadow-arts", label: "Shadow Arts", acBonus: -2, attackBonus: -2, durationRounds: 1 }), { refresh: "shortRest", resourcePool: "ki", uses: 2 }),
    ability("shadowStep", "Shadow Step", 6, "bonusAction", "Step through shadow. Gain movement and advantage on your next attack.", common.self({ id: "shadow-step", label: "Shadow Step", speedBonusFeet: 20, attackAdvantage: true, expiresAtEndOfTurn: true }), { refresh: "shortRest", resourcePool: "ki", uses: 2 }),
    ability("cloakOfShadows", "Cloak of Shadows", 10, "bonusAction", "Fade into shadow, gaining AC and advantage on your next strike.", common.self({ id: "cloak-of-shadows", label: "Cloak of Shadows", acBonus: 3, attackAdvantage: true, expiresAtEndOfTurn: true }), { refresh: "shortRest", resourcePool: "ki", uses: 2 }),
    ability("opportunist", "Opportunist", 14, "bonusAction", "Watch for an opening. Your next hit deals extra necrotic damage.", common.riderDamage({ count: 3, sides: 6 }, "necrotic"), { refresh: "turn", resourcePool: "ki", uses: 1 }),
    ability("livingShadow", "Living Shadow", 18, "bonusAction", "Become a living shadow: harder to hit, faster, and more dangerous for a few rounds.", common.self({ id: "living-shadow", label: "Living Shadow", acBonus: 3, speedBonusFeet: 20, damageBonus: 4, durationRounds: 3 }), { refresh: "longRest" }),
  ]),
  subclass("way-drunken-master", "Way of the Drunken Master", "A slippery skirmisher who turns erratic movement into defense and counterpressure.", [
    "Drunken Master is about motion. Use Drunken Technique when you want to hit and slip away safely.",
    "Intoxicated Frenzy turns a crowded fight into a strong multi-target turn.",
  ], [
    feature(3, "Drunken Technique", "After quick strikes, gain movement and defense."),
    feature(6, "Tipsy Sway", "Slip away from a bad exchange and turn your stumble into defense."),
    feature(10, "Drunkard's Luck", "Cancel a bad moment with a burst of lucky momentum."),
    feature(14, "Intoxicated Frenzy", "Turn a crowded fight into multiple strikes."),
    feature(18, "Impossible Rhythm", "Once per rest, gain both offensive and defensive momentum in the same round."),
  ], [
    ability("drunkenTechnique", "Drunken Technique", 3, "bonusAction", "Move with erratic grace. Gain speed, AC, and a small damage rider.", common.self({ id: "drunken-technique", label: "Drunken Technique", speedBonusFeet: 10, acBonus: 2, weaponRider: true, damageBonus: 4, damageType: "bludgeoning", expiresAtEndOfTurn: true }), { refresh: "shortRest", resourcePool: "ki", uses: 2 }),
    ability("tipsySway", "Tipsy Sway", 6, "reaction", "Turn a dangerous miss-step into defense, gaining AC and a small counterstrike rider.", common.self({ id: "tipsy-sway", label: "Tipsy Sway", acBonus: 3, weaponRider: true, damageBonus: 4, damageType: "bludgeoning", durationRounds: 1 }), { refresh: "shortRest", resourcePool: "ki", uses: 2 }),
    ability("drunkardsLuck", "Drunkard's Luck", 10, "bonusAction", "Let luck carry the moment. Your next attack or save gains a strong bonus.", common.self({ id: "drunkards-luck", label: "Drunkard's Luck", attackBonus: 4, saveBonus: 4, expiresAtEndOfTurn: true }), { refresh: "shortRest", resourcePool: "ki", uses: 2 }),
    ability("intoxicatedFrenzy", "Intoxicated Frenzy", 14, "action", "Spin through nearby enemies with a flurry of strikes.", common.aoe({ count: 4, sides: 6 }, "bludgeoning", "distracted", 2), { refresh: "longRest" }),
    ability("impossibleRhythm", "Impossible Rhythm", 18, "bonusAction", "Move in an impossible rhythm, gaining speed, AC, and a heavy damage rider.", common.self({ id: "impossible-rhythm", label: "Impossible Rhythm", speedBonusFeet: 20, acBonus: 3, weaponRider: true, damageBonus: 10, damageType: "bludgeoning", durationRounds: 2 }), { refresh: "longRest" }),
  ]),
];

const paladinSubclasses = [
  subclass("oath-devotion", "Oath of Devotion", "A classic holy knight who protects allies, smites evil, and shines with sacred weapon power.", [
    "Devotion is the reliable paladin. Sacred Weapon improves your attacks; Holy Nimbus punishes nearby evil.",
    "Use the oath powers before committing spell points to Divine Smite.",
  ], [
    feature(3, "Sacred Weapon", "Bless your weapon for better accuracy and radiant pressure."),
    feature(6, "Aura of Devotion", "Nearby allies resist fear and charm-like pressure through your steady faith."),
    feature(10, "Purifying Smite", "Prepare a smite that also cleanses pressure from the fight."),
    feature(14, "Holy Nimbus", "Radiant light damages nearby enemies and boosts divine defense."),
    feature(18, "Beacon of Devotion", "Your sacred weapon and aura become a stronger party-wide defensive pulse."),
  ], [
    ability("sacredWeapon", "Sacred Weapon", 3, "bonusAction", "Bless your weapon. Your next attacks are more accurate and deal radiant damage.", common.self({ id: "sacred-weapon", label: "Sacred Weapon", attackBonus: 3, damageBonus: 3, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("auraOfDevotion", "Aura of Devotion", 6, "bonusAction", "Steady the party with devotion, improving saves for a few rounds.", { kind: "partyStatus", status: { id: "aura-of-devotion", label: "Aura of Devotion", saveBonus: 2, durationRounds: 3 } }, { refresh: "shortRest" }),
    ability("purifyingSmite", "Purifying Smite", 10, "bonusAction", "Prepare a purifying smite. Your next weapon hit deals radiant damage and shakes off darkness.", common.riderDamage({ count: 2, sides: 8 }, "radiant", "shaken"), { refresh: "shortRest" }),
    ability("holyNimbusLite", "Holy Nimbus", 14, "action", "Shine with holy light, burning nearby enemies and bolstering allies.", common.aoe({ count: 3, sides: 8 }, "radiant", "frightened", 3), { refresh: "longRest" }),
    ability("beaconOfDevotion", "Beacon of Devotion", 18, "action", "Shine with holy devotion, burning nearby enemies and bolstering allies.", common.aoe({ count: 4, sides: 8 }, "radiant", "frightened", 3), { refresh: "longRest" }),
  ], { expandedSpellList: ["bless", "shield_of_faith", "spirit_guardians"] }),
  subclass("oath-vengeance", "Oath of Vengeance", "A relentless avenger who marks one enemy and tears it down.", [
    "Vengeance wants a priority target. Use Vow of Enmity on the enemy that must die first.",
    "Avenging Angel gives you a frightening radiant burst for harder fights.",
  ], [
    feature(3, "Vow of Enmity", "Mark one enemy for advantage and extra damage."),
    feature(6, "Relentless Avenger", "After committing to your prey, move faster and keep pressure on them."),
    feature(10, "Soul of Vengeance", "When a melee enemy damages you, answer with a radiant reaction strike."),
    feature(14, "Avenging Angel", "Become a frightening radiant avenger."),
    feature(18, "Final Judgment", "Your first smite-like strike against your prey becomes especially punishing."),
  ], [
    ability("vowOfEnmity", "Vow of Enmity", 3, "bonusAction", "Swear vengeance on your prey. Your next hit is more accurate and deals radiant damage.", common.self({ id: "vow-of-enmity", label: "Vow of Enmity", attackAdvantage: true, weaponRider: true, damageBonus: 8, damageType: "radiant", expiresAtEndOfTurn: true }), { refresh: "shortRest" }),
    ability("relentlessAvenger", "Relentless Avenger", 6, "bonusAction", "Close on your sworn enemy, gaining speed and a radiant rider for your next strike.", common.self({ id: "relentless-avenger", label: "Relentless Avenger", speedBonusFeet: 10, weaponRider: true, damageBonus: 4, damageType: "radiant", expiresAtEndOfTurn: true }), { refresh: "shortRest" }),
    ability("soulOfVengeance", "Soul of Vengeance", 10, "reaction", "When a melee enemy damages you, answer with a weapon strike that adds radiant damage.", common.riderDamage({ count: 2, sides: 8 }, "radiant"), { refresh: "shortRest" }),
    ability("avengingAngel", "Avenging Angel", 14, "action", "Become a radiant avenger, frightening nearby enemies.", common.aoe({ count: 3, sides: 8 }, "radiant", "frightened", 3), { refresh: "longRest" }),
    ability("finalJudgment", "Final Judgment", 18, "bonusAction", "Condemn your prey. Your next weapon hit deals heavy radiant damage.", common.riderDamage({ count: 4, sides: 8 }, "radiant", "marked"), { refresh: "longRest" }),
  ], { expandedSpellList: ["hunters_mark", "misty_step", "haste"] }),
  subclass("oath-ancients", "Oath of the Ancients", "A green knight who binds enemies, resists magic, and shields allies with old light.", [
    "Ancients plays as a protective controller. Nature's Wrath pins a foe and Elder Champion helps you endure hard fights.",
    "Elder Champion is a short nature battle-form for hard fights.",
  ], [
    feature(3, "Nature's Wrath", "Restraining vines pin or slow an enemy."),
    feature(6, "Aura of Warding", "Give the party a short protective aura against spell-like harm."),
    feature(10, "Undying Sentinel", "Once per rest, refuse to fall by drawing on ancient endurance."),
    feature(14, "Elder Champion", "Take on a regenerative nature form."),
    feature(18, "Ancient Ward", "Your ancient aura grows stronger and Nature's Wrath can spread pressure."),
  ], [
    ability("naturesWrath", "Nature's Wrath", 3, "action", "Call vines around a visible enemy, dealing damage and restraining it briefly.", common.damageTarget({ count: 2, sides: 6 }, "piercing", "restrained"), { refresh: "shortRest" }),
    ability("auraOfWarding", "Aura of Warding", 6, "bonusAction", "Raise an old-light ward. The party gains saving throw support and resistance to force briefly.", { kind: "partyStatus", status: { id: "aura-of-warding", label: "Aura of Warding", saveBonus: 2, resistances: ["force"], durationRounds: 3 } }, { refresh: "shortRest" }),
    ability("undyingSentinel", "Undying Sentinel", 10, "bonusAction", "Root yourself in ancient endurance, gaining a large temporary HP buffer.", common.self({ id: "undying-sentinel", label: "Undying Sentinel", tempHp: { base: 10, levelMultiplier: 1 }, durationRounds: 3 }), { refresh: "longRest" }),
    ability("elderChampion", "Elder Champion", 14, "bonusAction", "Become an elder champion with regeneration, resistance, and radiant nature damage.", common.self({ id: "elder-champion", label: "Elder Champion", tempHp: 15, resistances: ["necrotic", "poison"], damageBonus: 4, durationRounds: 3 }), { refresh: "longRest" }),
    ability("ancientWard", "Ancient Ward", 18, "action", "Burst with ancient warding vines, damaging and restraining nearby enemies.", common.aoe({ count: 4, sides: 6 }, "piercing", "restrained", 3), { refresh: "longRest" }),
  ], { expandedSpellList: ["ensnaring_strike", "barkskin", "moonbeam"] }),
];

const redesignedFighterManeuvers = [
  ability("maneuverPrecision", "Precision Attack", 3, "bonusAction", "Spend a superiority die before an important weapon attack. Your next strike is more accurate and deals extra damage if it lands.", common.riderDamage({ count: 1, sides: 8, sidesByLevel: [{ level: 10, sides: 10 }, { level: 18, sides: 12 }] }, "damage"), { refresh: "shortRest", uses: 4, usesByLevel: [{ level: 10, uses: 5 }, { level: 18, uses: 6 }], resourcePool: "superiority" }),
  ability("maneuverMenacing", "Menacing Attack", 3, "bonusAction", "Spend a superiority die to put fear behind your next hit. The target takes extra damage and may falter under pressure.", common.riderDamage({ count: 1, sides: 8, sidesByLevel: [{ level: 10, sides: 10 }, { level: 18, sides: 12 }] }, "damage", "frightened"), { refresh: "shortRest", uses: 4, usesByLevel: [{ level: 10, uses: 5 }, { level: 18, uses: 6 }], resourcePool: "superiority" }),
  ability("maneuverTrip", "Trip Attack", 3, "bonusAction", "Spend a superiority die to sweep or slam your foe. Your next hit deals extra damage and can knock the target prone.", common.riderDamage({ count: 1, sides: 8, sidesByLevel: [{ level: 10, sides: 10 }, { level: 18, sides: 12 }] }, "damage", "prone"), { refresh: "shortRest", uses: 4, usesByLevel: [{ level: 10, uses: 5 }, { level: 18, uses: 6 }], resourcePool: "superiority" }),
  ability("maneuverRally", "Rally", 6, "bonusAction", "Spend a superiority die to steady an ally with a commander's shout, giving them temporary HP and confidence.", common.ally({ id: "rally", label: "Rally", tempHp: 8, attackBonus: 1, durationRounds: 3 }), { refresh: "shortRest", uses: 4, usesByLevel: [{ level: 10, uses: 5 }, { level: 18, uses: 6 }], resourcePool: "superiority" }),
  ability("maneuverRiposte", "Riposte", 10, "reaction", "When a melee attacker misses you, spend a superiority die to answer with a punishing counterattack.", common.riderDamage({ count: 1, sides: 10, sidesByLevel: [{ level: 18, sides: 12 }] }, "damage"), { refresh: "shortRest", uses: 5, usesByLevel: [{ level: 18, uses: 6 }], resourcePool: "superiority" }),
];

const redesignedFighterSubclasses = [
  subclass("champion", "Champion", "A simple, reliable weapon specialist with stronger critical hits, athletic grit, and late-game survival.", [
    "Choose Champion when you want a fighter that is powerful without juggling many buttons.",
    "Most of your strength is always on: better critical hits, stronger physical talent, and the ability to recover when badly hurt.",
  ], [
    feature(3, "Improved Critical", "Your weapon attacks land critical hits more often, starting on a 19 or 20."),
    feature(6, "Remarkable Athlete", "Your physical training helps strength, dexterity, and constitution checks when you are not already trained."),
    feature(10, "Additional Fighting Style", "Broaden your martial training with one more fighting style."),
    feature(14, "Superior Critical", "Your weapon attacks become even more lethal, critting on an 18, 19, or 20."),
    feature(18, "Survivor", "When you are badly hurt, you recover HP at the start of your turns and keep fighting through the pain."),
  ]),
  subclass("battle-master", "Battle Master", "A tactical fighter who spends superiority dice on maneuvers that control enemies, protect allies, or make key attacks count.", [
    "You have superiority dice that return on a short or long rest.",
    "Pick maneuvers that match your style. Use them before important attacks, or answer enemy mistakes with reaction maneuvers.",
    "Higher levels give more dice, stronger dice, and one die back at the start of combat if you are empty.",
  ], [
    feature(3, "Combat Superiority", "Gain superiority dice and spend them on chosen maneuvers."),
    feature(6, "Tactical Expansion", "Learn another maneuver and gain a wider set of tactical answers."),
    feature(10, "Improved Combat Superiority", "Your superiority dice become d10s, so damage and accuracy maneuvers roll a larger die."),
    feature(14, "Relentless", "If combat begins and you are empty, recover one superiority die."),
    feature(18, "Master Tactician", "Your superiority dice become d12s and you can sustain tactical pressure longer in hard fights."),
  ], redesignedFighterManeuvers, {
    optionCounts: { maneuvers: [{ level: 3, count: 3 }, { level: 6, count: 4 }, { level: 10, count: 5 }] },
    maneuverOptions: redesignedFighterManeuvers,
  }),
  subclass("eldritch-knight", "Eldritch Knight", "A weapon fighter who adds wizard magic for defense, ranged pressure, and strike-then-cast tactics.", [
    "You are still a fighter first, but you learn wizard cantrips and spells using Intelligence.",
    "Use shield, blasts, control spells, and mobility magic when a plain weapon attack is not enough.",
    "Arcane Charge lets Action Surge reposition you in a flash when the fight opens up.",
  ], [
    feature(3, "Spellcasting", "Learn wizard cantrips and combat spells, giving your fighter ranged magic, defenses, and area control."),
    feature(6, "War Magic", "After a cantrip or quick spell setup, empower your next weapon hit."),
    feature(10, "Eldritch Strike", "Your weapon hits can make a target more vulnerable to your next spell."),
    feature(14, "Arcane Charge", "When you surge into action, reposition in a flash of arcane force."),
    feature(18, "Improved War Magic", "After casting a leveled spell, empower a weapon attack with stronger arcane force."),
  ], [
    ability("warMagic", "War Magic", 6, "bonusAction", "Blend cantrip rhythm into steel. Your next weapon hit deals extra force damage.", common.riderDamage({ count: 1, sides: 8 }, "force"), { refresh: "turn" }),
    ability("eldritchStrike", "Eldritch Strike", 10, "bonusAction", "Mark a target through your weapon. Your next hit deals force damage and leaves them vulnerable to magic.", common.riderDamage({ count: 2, sides: 6 }, "force", "shaken"), { refresh: "shortRest" }),
    ability("improvedWarMagic", "Improved War Magic", 18, "bonusAction", "Carry a leveled spell's force into your blade. Your next weapon hit deals heavy force damage.", common.riderDamage({ count: 3, sides: 8 }, "force"), { refresh: "shortRest" }),
  ], {
    casterType: "third",
    spellcastingAbility: "int",
    spellPointProgression: { 3: 4, 4: 6, 5: 6, 6: 6, 7: 14, 8: 14, 9: 14, 10: 17, 11: 17, 12: 17, 13: 27, 14: 27, 15: 27, 16: 32, 17: 32, 18: 32, 19: 38, 20: 38 },
    cantripList: ["mage-hand", "blade-ward", "fire-bolt", "mind-sliver", "thunderclap", "chill-touch", "acid-splash", "booming-blade", "frostbite", "green-flame-blade", "ray-of-frost", "shocking-grasp", "toll-the-dead", "true-strike"],
    spellList: ["magic-missile", "shield", "burning-hands", "sleep", "grease", "catapult", "color-spray", "earth-tremor", "expeditious-retreat", "false-life", "ice-knife", "acid-arrow", "aganazzars-scorcher", "alter-self", "blindness-deafness", "blur", "cloud-of-daggers", "crown-of-madness", "earthbind", "enlarge-reduce", "flaming-sphere", "gust-of-wind", "magic-weapon", "maximilians-earthen-grasp", "ray-of-enfeeblement", "shadow-blade", "snillocs-snowball-swarm", "bestow-curse", "blink", "enemies-abound", "erupting-earth", "flame-arrows", "gaseous-form", "melfs-minute-meteors", "plant-growth", "protection-from-energy", "sleet-storm", "slow", "stinking-cloud", "thunder-step", "wall-of-sand", "wall-of-water", "banishment", "black-tentacles", "blight", "charm-monster", "confusion", "dimension-door", "elemental-bane", "fire-shield", "greater-invisibility", "ice-storm", "phantasmal-killer", "resilient-sphere", "sickening-radiance", "stoneskin", "storm-sphere", "vitriolic-sphere", "wall-of-fire", "watery-sphere", "scorching-ray", "web", "misty-step", "shatter", "lightning-bolt", "fireball", "haste", "dispel-magic"],
  }),
];

const redesignedTotemOptions = [
  { id: "totemBear", name: "Bear Totem", totem: "bear", description: "Bear makes your rage tougher, helping you stand in front and soak punishment for the party." },
  { id: "totemEagle", name: "Eagle Totem", totem: "eagle", description: "Eagle makes your rage faster and more mobile, helping you reach priority enemies." },
  { id: "totemWolf", name: "Wolf Totem", totem: "wolf", description: "Wolf makes your rage better for the party, helping allies hit the enemies you pressure." },
];

const redesignedBarbarianSubclasses = [
  subclass("berserker", "Path of the Berserker", "A direct fury path that turns Rage into extra attacks, fear pressure, and retaliation.", [
    "Choose Berserker when you want a clear melee striker.",
    "Rage first, then use Frenzy when another attack matters. Later you can frighten enemies, strike back when hurt, and squeeze out one last surge of fury.",
  ], [
    feature(3, "Frenzy", "While raging, make an extra weapon attack as a bonus action."),
    feature(6, "Mindless Rage", "While raging, resist fear and control pressure with stronger saving throws."),
    feature(10, "Intimidating Presence", "Use raw menace to frighten or shake a visible enemy."),
    feature(14, "Retaliation", "When a nearby enemy damages you, strike back with your reaction."),
    feature(18, "Relentless Frenzy", "Once per rest, push your frenzy into one more brutal burst of attacks."),
  ], [
    ability("frenzy", "Frenzy", 3, "bonusAction", "While raging, make one extra weapon attack against your current target.", { kind: "bonusAttack" }, { refresh: "turn" }),
    ability("mindlessRage", "Mindless Rage", 6, "bonusAction", "Let rage drown out fear and control. Gain a strong saving throw bonus briefly.", common.self({ id: "mindless-rage", label: "Mindless Rage", saveBonus: 4, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("intimidatingPresence", "Intimidating Presence", 10, "action", "Frighten your current target with overwhelming menace.", common.target({ id: "frightened", label: "Frightened", attackBonus: -2, durationRounds: 2 }), { refresh: "shortRest" }),
    ability("retaliation", "Retaliation", 14, "reaction", "When a melee enemy damages you, a reaction prompt lets you strike back with your weapon.", common.riderDamage({ count: 1, sides: 8 }, "damage"), { refresh: "turn" }),
    ability("relentlessFrenzy", "Relentless Frenzy", 18, "bonusAction", "Push past normal limits and make another weapon attack while raging.", { kind: "bonusAttack" }, { refresh: "shortRest" }),
  ]),
  subclass("totem-warrior", "Path of the Totem Warrior", "A spirit-touched rager who chooses animal totems for defense, mobility, or pack tactics.", [
    "Choose Bear, Eagle, or Wolf. Your totem changes what your Rage is best at.",
    "Bear is defensive, Eagle is mobile, and Wolf helps allies pressure your target.",
    "Later upgrades deepen that identity instead of adding many unrelated buttons.",
  ], [
    feature(3, "Totem Spirit", "Choose Bear, Eagle, or Wolf to shape your Rage."),
    feature(6, "Aspect of the Beast", "Your chosen totem adds stronger dungeon and combat support."),
    feature(10, "Spirit Walker", "Reveal nearby danger and mark the flow of the fight with spirit guidance."),
    feature(14, "Totemic Attunement", "Your totem becomes a stronger battle stance for protecting, moving, or enabling allies."),
    feature(18, "Primal Avatar", "Once per rest, empower all your totem gifts for a decisive fight."),
  ], [
    ability("totemSurge", "Totem Surge", 3, "bonusAction", "While raging, call on your chosen totem for defense, speed, or pack pressure.", common.self({ id: "totem-surge", label: "Totem Surge", tempHp: 8, speedBonusFeet: 10, attackBonus: 1, durationRounds: 2 }), { refresh: "shortRest" }),
    ability("aspectOfTheBeast", "Aspect of the Beast", 6, "bonusAction", "Deepen your totem bond, gaining temporary HP, speed, and skill confidence.", common.self({ id: "aspect-of-the-beast", label: "Aspect of the Beast", tempHp: 8, speedBonusFeet: 10, skillBonus: 3, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("spiritWalker", "Spirit Walker", 10, "action", "Listen to your totem spirit. Reveal nearby traps and sharpen your combat instincts.", { kind: "revealTraps", status: { id: "spirit-walker", label: "Spirit Walker", attackBonus: 1, durationRounds: 3 } }, { refresh: "shortRest" }),
    ability("totemicAttunement", "Totemic Attunement", 14, "bonusAction", "Let your totem fully guide the fight, improving speed, defense, and ally pressure.", common.self({ id: "totemic-attunement", label: "Totemic Attunement", tempHp: 12, speedBonusFeet: 10, attackBonus: 2, durationRounds: 3 }), { refresh: "shortRest" }),
    ability("primalAvatar", "Primal Avatar", 18, "bonusAction", "Become a primal avatar of your totem, gaining a major battle-form boost.", common.self({ id: "primal-avatar", label: "Primal Avatar", tempHp: 20, speedBonusFeet: 20, attackBonus: 2, damageBonus: 4, durationRounds: 3 }), { refresh: "longRest" }),
  ], {
    optionCounts: { totems: [{ level: 3, count: 1 }] },
    totemOptions: redesignedTotemOptions,
  }),
  subclass("zealot", "Path of the Zealot", "A divine rager who burns enemies with holy fury, rallies allies, and refuses to fall.", [
    "Choose Zealot when you want a barbarian with simple divine damage and high drama.",
    "Your rage adds radiant pressure, your focus protects key saves, and your battle cry helps the whole party hit harder.",
  ], [
    feature(3, "Divine Fury", "While raging, your first weapon hit each turn burns with radiant or necrotic power."),
    feature(6, "Fanatical Focus", "Divine conviction can turn around a failed saving throw."),
    feature(10, "Zealous Presence", "Rally the party with a battle cry that improves attacks and saves."),
    feature(14, "Rage Beyond Death", "The first time you would fall while raging, divine fury can keep you standing."),
    feature(18, "Saint of Slaughter", "Your divine fury burns brighter and your rally grants temporary HP."),
  ], [
    ability("fanaticalFocus", "Fanatical Focus", 6, "none", "When you fail an important save, divine conviction can turn it around.", common.self({ id: "fanatical-focus", label: "Fanatical Focus", saveBonus: 5, expiresAtEndOfTurn: true }), { refresh: "longRest" }),
    ability("zealousPresence", "Zealous Presence", 10, "bonusAction", "Give nearby allies advantage-like confidence on their next attacks and saving throws.", { kind: "partyStatus", status: { id: "zealous-presence", label: "Zealous Presence", attackBonus: 2, saveBonus: 2, durationRounds: 2 } }, { refresh: "longRest" }),
    ability("saintOfSlaughter", "Saint of Slaughter", 18, "bonusAction", "Rally the party with divine fury, giving attacks, saves, and temporary HP.", { kind: "partyStatus", status: { id: "saint-of-slaughter", label: "Saint of Slaughter", tempHp: 12, attackBonus: 2, saveBonus: 2, durationRounds: 3 } }, { refresh: "longRest" }),
  ]),
];

augmentClass("bard", bardSubclasses);
augmentClass("cleric", clericSubclasses);
augmentClass("rogue", rogueSubclasses);
augmentClass("ranger", rangerSubclasses);
augmentClass("wizard", wizardSubclasses);
augmentClass("druid", druidSubclasses);
augmentClass("warlock", warlockSubclasses);
augmentClass("sorcerer", sorcererSubclasses);
augmentClass("monk", monkSubclasses);
augmentClass("paladin", paladinSubclasses);
augmentClass("fighter", redesignedFighterSubclasses, { replaceExisting: true, adminExisting: true });
augmentClass("barbarian", redesignedBarbarianSubclasses, { replaceExisting: true, adminExisting: true });
})();
