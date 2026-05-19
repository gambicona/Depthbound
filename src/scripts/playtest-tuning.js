// Fast playtest knobs.
// Change these numbers, save this file, then refresh the browser.
// Most values are multipliers/chances, so 0 disables, 0.5 means 50%, and 1 means 100%.
window.DungeonPlaytestTuning = {
  time: {
    // Exploration clock speed. 60 means 1 real second = 1 in-game minute.
    explorationTimeScale: 15,

    // One full combat round. D&D default is 6 seconds.
    combatRoundSeconds: 6,

    // Short rests always advance this much dungeon time. D&D default is 3600 seconds.
    shortRestSeconds: 3600,

    // Set to a number to override every dungeon/theme short rest limit. Use null to keep theme defaults.
    shortRestLimitOverride: null,
  },

  monsters: {
    // Chance that a monster picks up a thrown weapon from the floor.
    thrownWeaponPickupChance: 0.02,

    // Ordinary room monster counts. Higher values make rooms more crowded.
    roomSpawns: {
      baseCount: 1,
      extraPerPartyMember: 0.65,
      categoryGapBonus: 0.45,
      randomSpread: 0.6,
      maximumCount: 5,
      entranceRoomSpawnChance: 0,
      roomSpawnChance: 0.72,
    },

    // Swarm monster counts. Used only by monsters with behavior: "swarm".
    swarmSpawns: {
      minimumCount: 2,
      maximumPartySize: 4,
      basePartySize: 1,
      extraPerPartyMember: 1,
      extraPerCategoryGap: 1,
      maximumExtraFromLevelGap: 4,
      absoluteMaximum: 8,
    },

    // Monster special ability behavior and DCs.
    specialAbilities: {
      activeUseChance: 0.72,
      onHitUseChance: 0.82,
      defensiveUseChance: 0.9,
      saveDcBase: 10,
      saveDcPerCategory: 1,
      chargeMinFeet: 20,
      lineRangeFeet: 15,
      burstRangeFeet: 10,
      rangedSpecialFeet: 30,
      shellGuardAcBonus: 2,
      bossRoarAttackPenalty: -1,
    },
  },

  loot: {
    // Chest treasure chance = base + partyLevel * perLevel, capped at max.
    chestTreasureChanceBase: 0.16,
    chestTreasureChancePerLevel: 0.025,
    chestTreasureChanceMax: 0.5,

    // Chest magic item chance = base + partyLevel * perLevel, clamped between 0 and max.
    chestMagicChanceBase: -0.005,
    chestMagicChancePerLevel: 0.015,
    chestMagicChanceMax: 0.14,
  },

  performance: {
    // Delay between monster AI decisions. Raise this if monsters act too fast to follow.
    monsterAiDecisionIntervalMs: 250,

    // Pathfinding attempts per monster turn. Raise for smarter pathing, lower for smoother performance.
    monsterPathfindingBudgetPerTurn: 6,
  },
};
