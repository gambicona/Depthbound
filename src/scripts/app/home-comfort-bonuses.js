const homeComfortBonusThresholds = [
  { min: 1, tempHpPercent: 0.01 },
  { min: 5, tempHpPercent: 0.05 },
  { min: 10, extraHitDice: 1 },
  { min: 20, tempHpPercent: 0.1 },
  { min: 60, tempHpPercent: 0.2 },
];

const homeComfortSecondWindAbility = {
  id: "secondWind",
  name: "Second Wind",
  description: "Draw on home comfort to restore your own hit points once during this dungeon run.",
  resource: "bonusAction",
  refresh: "shortRest",
  uses: 0,
  level: 1,
  homeComfortGranted: true,
};

function homeComfortScoresForActiveParty(homeState = state) {
  const scores = {};
  for (const heroId of homeState.party?.heroIds ?? []) {
    const hero = homeState.fighters?.[heroId];
    if (!hero || !isClassHero(hero)) continue;
    scores[heroId] = homeComfortDetailsForHero(heroId).total;
  }
  return scores;
}

function homeComfortBonusProfile(score, hero) {
  const profile = {
    score: Math.max(0, Math.floor(score ?? 0)),
    tempHpPercent: 0,
    extraHitDice: 0,
    classBonuses: {
      abilityUses: {},
      resourcePools: {},
      spellPoints: 0,
      sneakAttackDice: 0,
      lines: [],
    },
  };
  for (const threshold of homeComfortBonusThresholds) {
    if (profile.score < threshold.min) continue;
    profile.tempHpPercent = Math.max(profile.tempHpPercent, threshold.tempHpPercent ?? 0);
    profile.extraHitDice += threshold.extraHitDice ?? 0;
  }
  applyClassSpecificComfortBonuses(profile, hero);
  return profile;
}

function applyClassSpecificComfortBonuses(profile, hero) {
  const classId = hero?.classId;
  const addSpellPoints = (amount) => {
    if ((hero?.spellPointMax ?? 0) <= 0 || amount <= 0) return;
    profile.classBonuses.spellPoints += amount;
    profile.classBonuses.lines.push(`+${amount} spell points`);
  };
  const addAbilityUse = (abilityId, amount, label) => {
    profile.classBonuses.abilityUses[abilityId] = (profile.classBonuses.abilityUses[abilityId] ?? 0) + amount;
    profile.classBonuses.lines.push(`+${amount} ${label}`);
  };
  const addResourcePool = (poolId, amount, label) => {
    profile.classBonuses.resourcePools[poolId] = (profile.classBonuses.resourcePools[poolId] ?? 0) + amount;
    profile.classBonuses.lines.push(`+${amount} ${label}`);
  };

  if (profile.score >= 40) {
    if (["bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "warlock", "wizard"].includes(classId)) addSpellPoints(2);
    if (classId === "barbarian") addAbilityUse("rage", 1, "Rage use");
    if (classId === "fighter") addAbilityUse("secondWind", 1, "Second Wind use");
    if (classId === "monk") addResourcePool("ki", 1, "ki point");
    if (classId === "rogue") {
      profile.classBonuses.sneakAttackDice += 1;
      profile.classBonuses.lines.push("+1 Sneak Attack die");
    }
  }

  if (profile.score >= 80) {
    if (classId === "barbarian") addAbilityUse("rage", 1, "Rage use");
    if (classId === "bard") addResourcePool("bardicInspiration", 1, "Bardic Inspiration use");
    if (classId === "cleric") addAbilityUse("channelDivinity", 1, "Channel Divinity use");
    if (classId === "druid") addResourcePool("wildShape", 1, "Wild Shape use");
    if (classId === "fighter") addAbilityUse("actionSurge", 1, "Action Surge use");
    if (classId === "monk") addResourcePool("ki", 1, "ki point");
    if (classId === "paladin") addResourcePool("layOnHands", 5, "Lay on Hands healing");
    if (classId === "ranger") addAbilityUse("rangerCompanion", 1, "Ranger Companion use");
    if (classId === "rogue") {
      profile.classBonuses.sneakAttackDice += 1;
      profile.classBonuses.lines.push("+1 Sneak Attack die");
    }
    if (classId === "sorcerer") addResourcePool("metamagic", 1, "Metamagic use");
    if (classId === "warlock") addSpellPoints(1);
    if (classId === "wizard") addAbilityUse("arcaneRecovery", 1, "Arcane Recovery use");
  }
}

function applyHomeComfortBonusesToDungeonState(dungeonState, comfortScores = {}) {
  for (const heroId of dungeonState.party?.heroIds ?? []) {
    const hero = dungeonState.fighters?.[heroId];
    if (!hero || !isClassHero(hero)) continue;
    const profile = homeComfortBonusProfile(comfortScores[heroId] ?? 0, hero);
    if (profile.score <= 0) continue;
    const tempHp = profile.tempHpPercent ? Math.ceil((hero.maxHp ?? hero.baseMaxHp ?? 1) * profile.tempHpPercent) : 0;
    hero.statusEffects = (hero.statusEffects ?? []).filter((effect) => effect.id !== "home-comfort");
    hero.statusEffects.push({
      id: "home-comfort",
      label: `Home Comfort ${profile.score}/100`,
      expiresAtHome: true,
      comfortScore: profile.score,
      tempHp,
      extraHitDice: profile.extraHitDice,
      classBonusLines: [...profile.classBonuses.lines],
      spellPointBonus: profile.classBonuses.spellPoints,
      sneakAttackDiceBonus: profile.classBonuses.sneakAttackDice,
    });
    if (tempHp > 0) hero.temporaryHp = Math.max(hero.temporaryHp ?? 0, tempHp);
    if (profile.extraHitDice > 0) hero.hitDiceRemaining = (hero.hitDiceRemaining ?? hero.level ?? 1) + profile.extraHitDice;
    for (const [abilityId, amount] of Object.entries(profile.classBonuses.abilityUses)) {
      hero.extraAbilityUses = { ...(hero.extraAbilityUses ?? {}), [abilityId]: (hero.extraAbilityUses?.[abilityId] ?? 0) + amount };
    }
    for (const [poolId, amount] of Object.entries(profile.classBonuses.resourcePools)) {
      hero.extraResourcePoolUses = { ...(hero.extraResourcePoolUses ?? {}), [poolId]: (hero.extraResourcePoolUses?.[poolId] ?? 0) + amount };
    }
    if ((profile.classBonuses.abilityUses.secondWind ?? 0) > 0 && !fighterAbilityDefinitions(hero).some((ability) => ability.id === "secondWind")) {
      hero.abilities = [...(hero.abilities ?? []), { ...homeComfortSecondWindAbility }];
    }
    if (profile.classBonuses.spellPoints) {
      hero.comfortSpellPointBonus = (hero.comfortSpellPointBonus ?? 0) + profile.classBonuses.spellPoints;
      hero.spellPointMax = spellPointMaximum(hero);
      hero.spellPoints = (hero.spellPoints ?? 0) + profile.classBonuses.spellPoints;
    }
    if (profile.classBonuses.sneakAttackDice) {
      hero.extraSneakAttackDice = (hero.extraSneakAttackDice ?? 0) + profile.classBonuses.sneakAttackDice;
    }
  }
}
