function createInitialState(heroNameOverride = "", heroForDifficulty = null, heroOptions = {}, themeId = defaultContent.theme) {
  const dungeonDefinition = getContentDefinition("dungeons", defaultContent.dungeon);
  const theme = getContentDefinition("themes", themeId);
  const dungeonOptions = {
    ...(dungeonDefinition?.options ?? window.DungeonConfig.dungeon),
  };
  const partySize = partySizeForSwarm(heroForDifficulty);
  const isSoloFirstLevelDungeon = (heroForDifficulty?.level === 1 || heroForDifficulty == null) && partySize <= 1;
  if (isSoloFirstLevelDungeon) {
    dungeonOptions.roomCount = 10;
  }
  Object.assign(dungeonOptions, theme?.generator ?? {});
  const category = categoryForHeroLevel(heroForDifficulty?.level ?? 1);
  const categoryRoomCount = theme?.generator?.roomCountByCategory?.[category];
  if (categoryRoomCount && (category !== 1 || partySize <= 1)) dungeonOptions.roomCount = categoryRoomCount;
  const dungeon = generateDungeon(dungeonOptions);
  const classId = heroOptions.classId ?? defaultContent.heroClass;
  const heroTemplate = applyHeroCreationOptions(
    {
      ...getHeroTemplate(classId),
      id: "hero",
      name: heroNameOverride.trim() || getHeroTemplate(classId).name,
      position: { x: 0, y: 0 },
    },
    heroOptions,
  );
  const hero = createCombatant({
    ...heroTemplate,
  });
  hero.token = tokenFromName(hero.name, hero.token);
  hero.position = { ...dungeon.startPosition };
  const firstRoom = dungeon.rooms.find((room) => room.id === dungeon.entranceRoomId) ?? dungeon.rooms[0];
  const exit = createDungeonExit(dungeon, hero.position);
  const dungeonObjects = createDungeonObjects(dungeon, [hero.position, exit.position], themeId);
  const monsters = createDungeonMonsters(dungeon, hero.position, heroForDifficulty ?? hero, exit.roomId, dungeonObjects, themeId);

  return {
    themeId,
    combatStarted: false,
    mode: "exploration",
    round: 0,
    activeIndex: 0,
    initiative: [],
    room: {
      id: dungeon.id,
      name: theme?.name ?? dungeonDefinition?.name ?? "Generated Dungeon",
      gridSize: dungeon.gridSize,
      tileSizePx,
    },
    dungeon,
    exploration: {
      discoveredRoomIds: [dungeon.entranceRoomId],
      openedDoorKeys: [],
      openedCorridorKeys: [],
    },
    exit,
    completed: false,
    d20Mode: heroOptions.d20Mode ?? defaultD20Mode,
    d20FailureStreak: 0,
    shortRestsUsed: 0,
    shortRestLimit: theme?.rest?.shortRestLimit ?? 3,
    chest: [],
    chestMoney: { cp: 0, sp: 0, gp: 0 },
    campaignProgress: {},
    lootPiles: [],
    dungeonObjects,
    party: {
      activeHeroId: "hero",
      heroIds: ["hero"],
      rosterIds: ["hero"],
    },
    fighters: {
      hero,
      ...monsters,
    },
    log: [
      {
        text: `Generated ${dungeon.roomCount} rooms for ${theme?.name ?? dungeonDefinition?.name ?? "Generated Dungeon"}. ${hero.name} starts at the entrance of ${firstRoom.name}.`,
        type: "important",
      },
    ],
  };
}

function dungeonStartPositions(dungeon, count, blockedKeys = new Set()) {
  const entranceRoom = dungeon.rooms.find((room) => room.id === dungeon.entranceRoomId) ?? dungeon.rooms[0];
  const blocked = new Set([...(entranceRoom?.doors ?? []).map(positionKey), ...blockedKeys]);
  return (entranceRoom?.cells ?? [])
    .filter((cell) => !blocked.has(positionKey(cell)))
    .sort((a, b) => distance(a, dungeon.startPosition) - distance(b, dungeon.startPosition))
    .slice(0, count);
}

function createDungeonStateForParty(partyMembers, previousState, themeId = defaultContent.theme) {
  const leader = partyMembers[0] ?? previousState?.fighters?.hero;
  const partyDifficulty = {
    ...(leader ?? {}),
    level: averagePartyLevel({ level: leader?.level ?? 1 }),
    partySize: partyMembers.length,
  };
  const nextState = createInitialState(leader?.name ?? getHeroTemplate().name, partyDifficulty, {}, themeId);
  const blockedKeys = new Set((nextState.dungeonObjects ?? []).filter(objectBlocksMovement).flatMap(objectCells).map(positionKey));
  const positions = dungeonStartPositions(nextState.dungeon, partyMembers.length, blockedKeys);
  const partyIds = new Set(partyMembers.map((hero) => hero.id));
  const previousRosterIds = previousState?.party?.rosterIds ?? partyMembers.map((hero) => hero.id);
  const previousRoster = previousRosterIds.map((id) => previousState?.fighters?.[id]).filter(Boolean);
  const heroes = {};
  partyMembers.forEach((hero, index) => {
    const position = positions[index] ?? nextState.dungeon.startPosition;
    refreshItemChargesForFighter(hero, "newDungeon");
    heroes[hero.id] = refreshDerivedStats({
      ...hero,
      position: { ...position },
      hp: hero.maxHp,
      hitDiceRemaining: hero.level ?? 1,
      movementLeft: Math.floor(hero.speedFeet / feetPerSquare),
      hasAction: true,
      hasBonusAction: true,
      alive: true,
    });
    resetFighterAbilityUses(heroes[hero.id]);
  });
  previousRoster
    .filter((hero) => !partyIds.has(hero.id))
    .forEach((hero) => {
      heroes[hero.id] = {
        ...hero,
        position: { x: -1, y: -1 },
        alive: false,
      };
    });
  const monsters = Object.fromEntries(Object.entries(nextState.fighters).filter(([id]) => !nextState.party.heroIds.includes(id)));
  nextState.fighters = { ...heroes, ...monsters };
  nextState.party = {
    activeHeroId: partyMembers[0]?.id ?? "hero",
    heroIds: partyMembers.map((hero) => hero.id).slice(0, 4),
    rosterIds: previousRosterIds,
  };
  nextState.saveSlotId = previousState?.saveSlotId ?? activeSaveSlot;
  nextState.chest = previousState?.chest ?? [];
  nextState.chestMoney = normalizeMoney(previousState?.chestMoney ?? {});
  nextState.d20Mode = normalizeD20Mode(previousState?.d20Mode);
  nextState.d20FailureStreak = previousState?.d20FailureStreak ?? 0;
  return nextState;
}

function itemInstancesFromIds(itemIds = [], prefix = "object") {
  return itemIds
    .map((itemId) => createItemInstance(itemId, prefix))
    .filter(Boolean);
}

function customRoomForPosition(dungeon, position) {
  return (dungeon?.rooms ?? []).find((room) => roomHasCell(room, position)) ?? null;
}

function createCustomDungeonObject(templateObject, index) {
  const template = objectTemplate(templateObject.type);
  if (!template) return null;
  const lockComponent = objectComponent(templateObject.type, "lock");
  const lockDc = templateObject.lockDc ?? lockComponent?.dc;
  const locked =
    typeof templateObject.locked === "boolean"
      ? templateObject.locked
      : lockComponent
        ? Math.random() < (lockComponent.chance ?? 0.5)
        : undefined;
  return {
    id: templateObject.id ?? `${templateObject.type}-${index + 1}`,
    type: templateObject.type,
    position: { ...(templateObject.position ?? { x: 0, y: 0 }) },
    width: templateObject.width ?? template.width ?? 1,
    height: templateObject.height ?? template.height ?? 1,
    ...(templateObject.pairId ? { pairId: templateObject.pairId } : {}),
    ...(templateObject.trap ? { trap: { ...templateObject.trap } } : {}),
    ...(lockDc ? { lockDc } : {}),
    ...(typeof locked === "boolean" ? { locked } : {}),
    items: itemInstancesFromIds(templateObject.items ?? [], "object"),
  };
}

function createCustomDungeonMonsters(template, dungeon, hero) {
  const monsters = {};
  for (const [index, entry] of (template.monsters ?? []).entries()) {
    const monsterTemplate = getMonsterTemplate(entry.monsterId);
    if (!monsterTemplate) continue;
    const idPrefix = entry.isBoss ? "boss" : "monster";
    const id = entry.id ?? `${idPrefix}-custom-${index + 1}`;
    const monster = createCombatant({
      ...monsterTemplate,
      ...(entry.overrides ?? {}),
      id,
      name: entry.name || monsterTemplate.name,
      extraLoot: (entry.extraLoot ?? []).map((itemId) => ({ kind: "item", itemId })),
    });
    for (const itemId of Object.values(entry.overrides?.equipment ?? {}).filter(Boolean)) {
      if (!(monster.inventory?.items ?? []).some((item) => item.baseItemId === itemId || item.id === itemId)) {
        const item = createItemInstance(itemId, "monster");
        if (item) monster.inventory.items.push(item);
      }
    }
    monster.baseMonsterId = entry.customized ? entry.id : entry.monsterId;
    if (entry.isBoss) {
      monster.customBoss = true;
      monster.tags = Array.from(new Set([...(monster.tags ?? []), "boss"]));
    }
    applyMonsterCategoryScaling(monster, hero);
    monster.position = { ...(entry.position ?? dungeon.startPosition) };
    monster.roomId = entry.roomId ?? customRoomForPosition(dungeon, monster.position)?.id ?? dungeon.entranceRoomId;
    monsters[monster.id] = monster;
  }
  return monsters;
}

function customDungeonMonsterSummary(monsters = {}) {
  const summary = {};
  for (const monster of Object.values(monsters)) {
    const baseId = monster.baseMonsterId ?? monster.templateId ?? monster.id;
    summary[baseId] = (summary[baseId] ?? 0) + 1;
  }
  return summary;
}

function createCustomDungeonStateFromTemplate(partyMembers, previousState, template) {
  if (!template) return null;
  for (const item of template.customItems ?? []) {
    window.DungeonContent.register("items", item.id, item);
  }
  const theme = getContentDefinition("themes", template.themeId) ?? getContentDefinition("themes", defaultContent.theme);
  const dungeon = ensureCorridorPassages(template.dungeon);
  const leader = partyMembers[0] ?? previousState?.fighters?.hero;
  const partyDifficulty = {
    ...(leader ?? {}),
    level: averagePartyLevel({ level: leader?.level ?? 1 }),
    partySize: partyMembers.length,
  };
  const objects = (template.objects ?? []).map(createCustomDungeonObject).filter(Boolean);
  const monsters = createCustomDungeonMonsters(template, dungeon, partyDifficulty);
  const blockedKeys = new Set(objects.filter(objectBlocksMovement).flatMap(objectCells).map(positionKey));
  const positions = dungeonStartPositions(dungeon, partyMembers.length, blockedKeys);
  const partyIds = new Set(partyMembers.map((hero) => hero.id));
  const previousRosterIds = previousState?.party?.rosterIds ?? partyMembers.map((hero) => hero.id);
  const previousRoster = previousRosterIds.map((id) => previousState?.fighters?.[id]).filter(Boolean);
  const heroes = {};
  partyMembers.forEach((hero, index) => {
    const position = positions[index] ?? dungeon.startPosition;
    refreshItemChargesForFighter(hero, "newDungeon");
    heroes[hero.id] = refreshDerivedStats({
      ...hero,
      position: { ...position },
      hp: hero.maxHp,
      hitDiceRemaining: hero.level ?? 1,
      movementLeft: Math.floor(hero.speedFeet / feetPerSquare),
      hasAction: true,
      hasBonusAction: true,
      alive: true,
    });
    resetFighterAbilityUses(heroes[hero.id]);
  });
  previousRoster
    .filter((hero) => !partyIds.has(hero.id))
    .forEach((hero) => {
      heroes[hero.id] = {
        ...hero,
        position: { x: -1, y: -1 },
        alive: false,
      };
    });

  return {
    themeId: template.themeId ?? defaultContent.theme,
    customDungeonId: template.id,
    campaignId: template.campaignId ?? null,
    campaignIndex: template.campaignIndex ?? null,
    customDungeon: {
      id: template.id,
      name: template.name,
      goal: template.goal ?? { type: "reachExit" },
      monsterSummary: customDungeonMonsterSummary(monsters),
      intro: template.intro ?? { text: "", images: [] },
      outro: template.outro ?? { text: "", images: [] },
    },
    combatStarted: false,
    mode: "exploration",
    round: 0,
    activeIndex: 0,
    initiative: [],
    room: {
      id: dungeon.id,
      name: template.name,
      gridSize: dungeon.gridSize,
      tileSizePx,
    },
    dungeon,
    exploration: {
      discoveredRoomIds: [dungeon.entranceRoomId],
      openedDoorKeys: [],
      openedCorridorKeys: [],
    },
    exit: template.exit,
    completed: false,
    d20Mode: normalizeD20Mode(previousState?.d20Mode),
    d20FailureStreak: previousState?.d20FailureStreak ?? 0,
    shortRestsUsed: 0,
    shortRestLimit: theme?.rest?.shortRestLimit ?? 3,
    chest: previousState?.chest ?? [],
    chestMoney: normalizeMoney(previousState?.chestMoney ?? {}),
    campaignProgress: cloneData(previousState?.campaignProgress ?? {}),
    lootPiles: [],
    dungeonObjects: objects,
    party: {
      activeHeroId: partyMembers[0]?.id ?? "hero",
      heroIds: partyMembers.map((hero) => hero.id).slice(0, 4),
      rosterIds: previousRosterIds,
    },
    saveSlotId: previousState?.saveSlotId ?? activeSaveSlot,
    fighters: {
      ...heroes,
      ...monsters,
    },
    log: [
      {
        text: `${partyMembers.map((hero) => hero.name).join(", ")} enter ${template.name}.`,
        type: "important",
      },
    ],
  };
}

function createCustomDungeonStateForParty(partyMembers, previousState, customDungeonId) {
  return createCustomDungeonStateFromTemplate(partyMembers, previousState, window.DungeonCustom?.get(customDungeonId));
}

function homeHeroPositions(heroIds) {
  return heroIds.map((id, index) => ({ id, position: { x: 3 + (index % 4), y: 5 + Math.floor(index / 4) } }));
}

function prepareRestedHero(hero, position) {
  if (isWildShaped(hero)) revertWildShape(hero);
  refreshItemChargesForFighter(hero, "home");
  refreshItemChargesForFighter(hero, "longRest");
  refreshItemChargesForFighter(hero, "newDungeon");
  if (hero.dead) {
    return refreshDerivedStats({
      ...hero,
      hp: 0,
      position: { ...position },
      alive: false,
      deathSaves: hero.deathSaves ?? { successes: 0, failures: 3 },
    });
  }
  const restedHero = refreshDerivedStats({
    ...hero,
    hp: hero.maxHp,
    hitDiceRemaining: hero.level ?? 1,
    position: { ...position },
    movementLeft: Math.floor(hero.speedFeet / feetPerSquare),
    hasAction: true,
    hasBonusAction: true,
    alive: true,
    deathSaves: { successes: 0, failures: 0 },
    relentlessEnduranceUsed: false,
  });
  resetFighterAbilityUses(restedHero);
  restedHero.spellPoints = spellPointMaximum(restedHero);
  ensureSpellPointState(restedHero);
  return restedHero;
}

function createHomeState(heroOrHeroes, chest = [], chestMoney = { cp: 0, sp: 0, gp: 0 }, partyData = null) {
  const cells = Array.from({ length: 100 }, (_, index) => ({ x: index % 10, y: Math.floor(index / 10) }));
  const homeDoor = { x: 9, y: 5, roomId: "home-room", to: "outside" };
  const incomingHeroes = Array.isArray(heroOrHeroes) ? heroOrHeroes : [heroOrHeroes];
  const rosterIds = partyData?.rosterIds?.length ? partyData.rosterIds : incomingHeroes.map((hero) => hero.id);
  const livingRosterIds = rosterIds.filter((id) => !incomingHeroes.find((hero) => hero.id === id)?.dead);
  const heroIds = (partyData?.heroIds?.length ? partyData.heroIds : livingRosterIds.slice(0, 1)).filter((id) => livingRosterIds.includes(id));
  const positions = new Map(homeHeroPositions(rosterIds).map((entry) => [entry.id, entry.position]));
  const fighters = Object.fromEntries(
    incomingHeroes.map((hero, index) => {
      const id = hero.id ?? (index === 0 ? "hero" : `hero-${Date.now()}-${index}`);
      const position = positions.get(id) ?? { x: 3 + (index % 4), y: 5 + Math.floor(index / 4) };
      return [id, prepareRestedHero({ ...hero, id, partyRole: hero.partyRole ?? (id === "hero" ? "tank" : "dd") }, position)];
    }),
  );
  const activeHeroId = fighters[partyData?.activeHeroId] && !fighters[partyData.activeHeroId].dead ? partyData.activeHeroId : heroIds.find((id) => fighters[id] && !fighters[id].dead) ?? livingRosterIds[0] ?? "hero";

  return {
    combatStarted: false,
    mode: "home",
    round: 0,
    activeIndex: 0,
    initiative: [],
    room: {
      id: "home",
      name: "Home",
      gridSize: 10,
      tileSizePx,
    },
    dungeon: {
      id: "home",
      roomCount: 1,
      gridSize: 10,
      rooms: [{ id: "home-room", name: "Home", cells, doors: [homeDoor] }],
      walkable: cells,
      corridors: [],
      doors: [homeDoor],
      corridorPassages: [],
      entranceRoomId: "home-room",
      startPosition: { x: 4, y: 5 },
    },
    exploration: {
      discoveredRoomIds: ["home-room"],
      openedDoorKeys: [],
      openedCorridorKeys: [],
    },
    exit: {
      roomId: "home-room",
      position: { ...homeDoor },
    },
    completed: false,
    d20Mode: normalizeD20Mode(partyData?.d20Mode ?? state?.d20Mode ?? defaultD20Mode),
    d20FailureStreak: partyData?.d20FailureStreak ?? state?.d20FailureStreak ?? 0,
    shortRestsUsed: 0,
    shortRestLimit: 3,
    chest,
    chestMoney: normalizeMoney(chestMoney),
    campaignProgress: cloneData(partyData?.campaignProgress ?? {}),
    lootPiles: [],
    dungeonObjects: [],
    party: {
      activeHeroId,
      heroIds: heroIds.filter((id) => fighters[id] && !fighters[id].dead).slice(0, 4),
      rosterIds: rosterIds.filter((id) => fighters[id]),
    },
    fighters,
    log: [
      {
        text: `${fighters[activeHeroId]?.name ?? "The party"} returns home and takes a long rest.`,
        type: "important",
      },
    ],
  };
}

function isPartyHeroId(id) {
  return (state?.party?.heroIds ?? ["hero"]).includes(id);
}

function isRosterHeroId(id) {
  return (state?.party?.rosterIds ?? state?.party?.heroIds ?? ["hero"]).includes(id);
}

function normalizeD20Mode(mode) {
  return Object.prototype.hasOwnProperty.call(d20ModeLabels, mode) ? mode : defaultD20Mode;
}

function d20ModeOptionsMarkup(selectedMode = state?.d20Mode ?? defaultD20Mode) {
  const selected = normalizeD20Mode(selectedMode);
  return Object.entries(d20ModeLabels)
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`)
    .join("");
}

function playerControlledFighter(fighter) {
  return Boolean(fighter && (isPartyHeroId(fighter.id) || isRosterHeroId(fighter.id) || fighter.friendly || fighter.team === "heroes"));
}

function tymoraD20Roll() {
  const first = rollDie(20);
  if (Math.random() >= 0.35) return first;
  return Math.max(first, rollDie(20));
}

function baseD20ForMode(mode = state?.d20Mode) {
  return normalizeD20Mode(mode) === "tymora" ? tymoraD20Roll() : rollDie(20);
}

function karmicD20Bonus() {
  const streak = state?.d20FailureStreak ?? 0;
  if (streak >= 4) return 5;
  if (streak >= 3) return 2;
  return 0;
}

function rollD20ForFighter(fighter, options = {}) {
  const usePlayerMode = playerControlledFighter(fighter);
  const mode = usePlayerMode ? normalizeD20Mode(state?.d20Mode) : "random";
  const rollOne = () => {
    const roll = baseD20ForMode(mode);
    if (fighter?.racialTraits?.halflingLucky && roll === 1) {
      if (state?.log) addLog(`${fighter.name}'s Halfling Lucky rerolls a natural 1.`, "important");
      return baseD20ForMode(mode);
    }
    return roll;
  };
  const rawRolls = options.disadvantage || options.advantage ? [rollOne(), rollOne()] : [rollOne()];
  const hiddenBonus = usePlayerMode && mode === "karmic" ? karmicD20Bonus() : 0;
  const rolls = rawRolls.map((roll) => Math.min(20, roll + hiddenBonus));
  const roll = options.disadvantage ? Math.min(...rolls) : options.advantage ? Math.max(...rolls) : rolls[0];
  return { roll, rolls, rawRolls, mode, hiddenBonus };
}

function recordD20OutcomeForFighter(fighter, success) {
  if (!playerControlledFighter(fighter) || normalizeD20Mode(state?.d20Mode) !== "karmic") return;
  state.d20FailureStreak = success ? 0 : Math.max(0, Math.floor(state.d20FailureStreak ?? 0)) + 1;
}

function activeHero() {
  const activeId = state?.party?.activeHeroId ?? "hero";
  return state?.fighters?.[activeId] ?? state?.fighters?.hero;
}

function setActiveHero(heroId) {
  if (!state?.fighters?.[heroId] || state.fighters[heroId].dead || !isRosterHeroId(heroId)) return false;
  if (state.mode !== "home" && !isPartyHeroId(heroId)) return false;
  state.party.activeHeroId = heroId;
  selectedHeroIds = new Set([heroId]);
  return true;
}

function selectableHeroIds() {
  return new Set(
    (state.mode === "home" ? rosterHeroes() : partyHeroes())
      .filter((hero) => heroCanAct(hero))
      .map((hero) => hero.id),
  );
}

function selectedMovableHeroes(anchorId = activeHero()?.id) {
  const allowedIds = selectableHeroIds();
  const ids = Array.from(selectedHeroIds).filter((id) => allowedIds.has(id));
  if (anchorId && allowedIds.has(anchorId) && !ids.includes(anchorId)) ids.unshift(anchorId);
  return ids.map((id) => state.fighters[id]).filter(Boolean);
}

function toggleHeroSelection(heroId) {
  const allowedIds = selectableHeroIds();
  if (!allowedIds.has(heroId)) return false;
  const nextSelection = new Set(selectedHeroIds);
  if (nextSelection.has(heroId) && nextSelection.size > 1) {
    nextSelection.delete(heroId);
  } else {
    nextSelection.add(heroId);
  }
  selectedHeroIds = nextSelection;
  state.party.activeHeroId = heroId;
  return true;
}

function selectActivePartyForMovement() {
  const ids = partyHeroes()
    .filter((hero) => heroCanAct(hero))
    .map((hero) => hero.id);
  if (ids.length === 0) return false;
  selectedHeroIds = new Set(ids);
  if (!selectedHeroIds.has(state.party.activeHeroId)) state.party.activeHeroId = ids[0];
  render();
  return true;
}

function rosterHeroes() {
  return (state?.party?.rosterIds ?? state?.party?.heroIds ?? ["hero"])
    .map((id) => state.fighters[id])
    .filter(Boolean);
}

function livingPartyHeroIds() {
  return (state.party?.heroIds ?? ["hero"]).filter((id) => state.fighters[id] && !state.fighters[id].dead);
}

function promoteMainHero(heroId) {
  if (!state.fighters[heroId] || state.fighters[heroId].dead) return;
  const currentIds = (state.party.heroIds ?? ["hero"]).filter((id) => id !== heroId && state.fighters[id] && !state.fighters[id].dead);
  state.party.heroIds = [heroId, ...currentIds].slice(0, 4);
  state.party.activeHeroId = heroId;
}

function normalizeHomeLayout(gameState) {
  if (gameState?.mode !== "home") return;
  const cells = Array.from({ length: 100 }, (_, index) => ({ x: index % 10, y: Math.floor(index / 10) }));
  const homeDoor = { x: 9, y: 5, roomId: "home-room", to: "outside" };
  gameState.combatStarted = false;
  gameState.activeIndex = 0;
  gameState.initiative = [];
  gameState.room = {
    id: "home",
    name: "Home",
    gridSize: 10,
    tileSizePx,
  };
  gameState.dungeon = {
    ...(gameState.dungeon ?? {}),
    id: "home",
    roomCount: 1,
    gridSize: 10,
    rooms: [{ id: "home-room", name: "Home", cells, doors: [homeDoor] }],
    walkable: cells,
    corridors: [],
    doors: [homeDoor],
    corridorPassages: [],
    entranceRoomId: "home-room",
    startPosition: { x: 4, y: 5 },
  };
  gameState.exit = { roomId: "home-room", position: { ...homeDoor } };
  gameState.exploration = {
    ...(gameState.exploration ?? {}),
    discoveredRoomIds: ["home-room"],
    openedDoorKeys: [],
    openedCorridorKeys: [],
  };
  gameState.dungeonObjects = [];
  gameState.lootPiles = [];
  const rosterIds = new Set(gameState.party?.rosterIds ?? gameState.party?.heroIds ?? ["hero"]);
  for (const fighterId of Object.keys(gameState.fighters ?? {})) {
    if (!rosterIds.has(fighterId)) delete gameState.fighters[fighterId];
  }
  const positions = new Map(homeHeroPositions(gameState.party?.rosterIds ?? ["hero"]).map((entry) => [entry.id, entry.position]));
  for (const heroId of gameState.party?.rosterIds ?? ["hero"]) {
    const hero = gameState.fighters?.[heroId];
    if (!hero) continue;
    hero.position = { ...(positions.get(heroId) ?? { x: 4, y: 5 }) };
    if (!hero.dead) hero.alive = true;
  }
  gameState.party.heroIds = (gameState.party.heroIds ?? ["hero"]).filter((id) => gameState.fighters[id] && !gameState.fighters[id].dead).slice(0, 4);
  if (!gameState.fighters[gameState.party.activeHeroId] || gameState.fighters[gameState.party.activeHeroId].dead) {
    gameState.party.activeHeroId = gameState.party.heroIds[0] ?? gameState.party.rosterIds.find((id) => gameState.fighters[id] && !gameState.fighters[id].dead) ?? "hero";
  }
}

function createDungeonExit(dungeon, heroPosition) {
  const entranceRoomId = dungeon.entranceRoomId;
  const exitRoom =
    dungeon.rooms
      .filter((room) => room.id !== entranceRoomId)
      .sort((a, b) => {
        const aDistance = Math.max(...a.cells.map((cell) => distance(cell, heroPosition)));
        const bDistance = Math.max(...b.cells.map((cell) => distance(cell, heroPosition)));
        return bDistance - aDistance;
      })[0] ?? dungeon.rooms[0];
  const position =
    exitRoom.cells
      .slice()
      .sort((a, b) => distance(b, heroPosition) - distance(a, heroPosition))[0] ?? exitRoom.cells[0];

  return {
    roomId: exitRoom.id,
    position: { ...position },
  };
}

function ensureCorridorPassages(dungeon) {
  if (Array.isArray(dungeon?.corridorPassages) && dungeon.corridorPassages.length > 0) return dungeon;

  const corridors = dungeon?.corridors ?? [];
  const corridorKeys = new Set(corridors.map(positionKey));
  const edges = [];
  for (const cell of corridors) {
    for (const next of [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
    ]) {
      if (corridorKeys.has(positionKey(next))) {
        edges.push(movementEdgeKey(cell, next));
      }
    }
  }

  return {
    ...dungeon,
    corridorPassages: [
      {
        id: "legacy-corridors",
        cells: corridors.map((cell) => ({ ...cell })),
        edges,
      },
    ],
  };
}

function tokenFromName(name, fallback = "M") {
  return (name.trim()[0] || fallback).toUpperCase();
}

function loadCustomHeroTokenArt() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(heroTokenArtStorageKey) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    let migrated = false;
    const entries = parsed
      .map((entry) => {
        if (!entry?.id) return null;
        const clean = {
          id: String(entry.id),
          name: entry.name ?? entry.tokenName ?? "custom_token",
          tokenName: entry.tokenName ?? entry.name ?? "custom_token",
          dataUrl: typeof entry.dataUrl === "string" ? entry.dataUrl : "",
          tokenArt: entry.tokenArt?.type === "custom-file" && entry.tokenArt.path ? entry.tokenArt : null,
          crop: entry.crop && typeof entry.crop === "object" ? { ...entry.crop } : undefined,
        };
        if (entry.fullDataUrl || entry.fullName) migrated = true;
        return clean.dataUrl || clean.tokenArt ? clean : null;
      })
      .filter(Boolean);
    if (migrated || entries.length !== parsed.length) {
      try {
        saveCustomHeroTokenArt(entries);
      } catch {
        // Best-effort migration cleanup only.
      }
    }
    return entries;
  } catch {
    return [];
  }
}

function saveCustomHeroTokenArt(entries) {
  window.localStorage.setItem(heroTokenArtStorageKey, JSON.stringify(entries));
}

async function migrateCustomHeroTokenArtToFiles() {
  const status = window.DungeonSave?.getStatus?.() ?? {};
  if (status.mode !== "file" || !window.DungeonSave?.writeTokenFile) return;
  const entries = loadCustomHeroTokenArt();
  let changed = false;
  for (const entry of entries) {
    if (!entry.dataUrl || entry.tokenArt?.type === "custom-file") continue;
    try {
      const blob = await dataUrlToBlob(entry.dataUrl);
      const path = await window.DungeonSave.writeTokenFile(entry.id, blob);
      if (!path) continue;
      const runtimeUrl = URL.createObjectURL(blob);
      window.DungeonSave.rememberTokenUrl?.(path, runtimeUrl);
      entry.tokenArt = { type: "custom-file", id: entry.id, path, name: entry.tokenName ?? entry.name ?? "Custom token", crop: entry.crop };
      entry.dataUrl = "";
      changed = true;
    } catch (error) {
      console.warn("Could not migrate custom token image.", error);
    }
  }
  if (changed) saveCustomHeroTokenArt(entries);
}

window.addEventListener("dungeon-save-slots-updated", () => {
  void migrateCustomHeroTokenArtToFiles();
});

async function loadPredefinedHeroTokenArt() {
  try {
    const response = await fetch(preheroTokenManifestPath, { cache: "no-cache" });
    if (!response.ok) return;
    const files = await response.json();
    predefinedHeroTokenArt = (Array.isArray(files) ? files : [])
      .filter((file) => typeof file === "string" && /\.(png|jpe?g|webp|gif|svg)$/i.test(file))
      .map((file) => ({
        name: file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        path: `assets/tokens/preheros/${file}`,
      }));
  } catch {
    predefinedHeroTokenArt = [];
  }
}

function heroTokenArtOptions() {
  const presets = predefinedHeroTokenArt.map((entry) => ({
    label: entry.name,
    value: entry.path,
    custom: false,
  }));
  const custom = loadCustomHeroTokenArt().map((entry) => ({
    label: entry.tokenName ?? entry.name ?? "Custom token",
    value: `${customHeroTokenArtPrefix}${entry.id}`,
    dataUrl: entry.dataUrl,
    custom: true,
  }));
  return [
    { label: "No picture", value: noHeroTokenArtValue },
    ...presets,
    ...custom,
  ];
}

function resolveHeroTokenArtSelection(value) {
  if (!value || value === noHeroTokenArtValue) return "";
  if (!value.startsWith(customHeroTokenArtPrefix)) return value;
  const customId = value.slice(customHeroTokenArtPrefix.length);
  const entry = loadCustomHeroTokenArt().find((candidate) => candidate.id === customId);
  return entry?.tokenArt ?? entry?.dataUrl ?? "";
}

function selectionValueForHeroTokenArt(tokenArt) {
  if (!tokenArt) return noHeroTokenArtValue;
  if (tokenArt?.type === "custom-file") return `${customHeroTokenArtPrefix}${tokenArt.id}`;
  const custom = loadCustomHeroTokenArt().find((entry) => entry.dataUrl === tokenArt);
  return custom ? `${customHeroTokenArtPrefix}${custom.id}` : tokenArt;
}

function safeTokenArtName(name, suffix) {
  const cleaned = String(name || "hero")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return `${cleaned || "hero"}_${suffix}`;
}

function deleteCustomHeroTokenArt(selectionValue) {
  if (!selectionValue?.startsWith(customHeroTokenArtPrefix)) return false;
  const customId = selectionValue.slice(customHeroTokenArtPrefix.length);
  const entries = loadCustomHeroTokenArt();
  const nextEntries = entries.filter((entry) => entry.id !== customId);
  if (nextEntries.length === entries.length) return false;
  saveCustomHeroTokenArt(nextEntries);
  return true;
}

function renameCustomHeroTokenArt(selectionValue, heroName) {
  if (!selectionValue?.startsWith(customHeroTokenArtPrefix)) return;
  const customId = selectionValue.slice(customHeroTokenArtPrefix.length);
  const entries = loadCustomHeroTokenArt();
  const entry = entries.find((candidate) => candidate.id === customId);
  if (!entry) return;
  entry.name = safeTokenArtName(heroName, "token");
  entry.tokenName = safeTokenArtName(heroName, "token");
  if (entry.tokenArt) entry.tokenArt.name = entry.tokenName;
  saveCustomHeroTokenArt(entries);
}

function imageFileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Not an image file."));
      return;
    }
    const reader = new FileReader();
    reader.addEventListener("error", () => reject(new Error("Could not read image.")));
    reader.addEventListener("load", () => resolve(reader.result));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("error", () => reject(new Error("Could not load image.")));
    image.addEventListener("load", () => resolve(image));
    image.src = src;
  });
}

function tokenCropDrawMetrics(imageSize, outputSize, crop = {}) {
  const width = Math.max(1, imageSize?.width ?? outputSize);
  const height = Math.max(1, imageSize?.height ?? outputSize);
  const zoom = clamp(Number(crop.zoom ?? 1), 1, 4);
  const scale = Math.max(outputSize / width, outputSize / height) * zoom;
  const centerX = clamp(Number(crop.x ?? 0.5), 0, 1) * width;
  const centerY = clamp(Number(crop.y ?? 0.5), 0, 1) * height;
  return {
    width,
    height,
    scale,
    drawWidth: width * scale,
    drawHeight: height * scale,
    left: outputSize / 2 - centerX * scale,
    top: outputSize / 2 - centerY * scale,
  };
}

async function cropTokenDataUrl(fullDataUrl, crop = {}) {
  const image = await loadImageElement(fullDataUrl);
  const canvas = document.createElement("canvas");
  canvas.width = heroTokenArtSize;
  canvas.height = heroTokenArtSize;
  const context = canvas.getContext("2d");
  const metrics = tokenCropDrawMetrics(image, heroTokenArtSize, crop);
  context.clearRect(0, 0, heroTokenArtSize, heroTokenArtSize);
  context.drawImage(
    image,
    metrics.left,
    metrics.top,
    metrics.drawWidth,
    metrics.drawHeight,
  );
  return canvas.toDataURL("image/png");
}

async function dataUrlToBlob(dataUrl) {
  return (await fetch(dataUrl)).blob();
}

function combatantRoleLabel(combatant) {
  const species = combatant?.speciesName ? ` ${combatant.speciesName}` : "";
  if (combatant.id === "hero" || isRosterHeroId(combatant?.id)) return `Level ${combatant.level ?? 1}${species} ${combatant.className ?? "Fighter"}`;
  return combatant.role;
}

function fighterAbilityDefinitions(fighter = state?.fighters?.hero) {
  const source = [...(fighter?.abilities ?? (isRosterHeroId(fighter?.id) ? getHeroTemplate(fighter?.classId).abilities : []) ?? [])];
  if (fighter?.racialTraits?.dragonDamageType && !source.some((ability) => ability.id === "dragonbornBreath")) {
    source.push({ id: "dragonbornBreath", name: "Breath Weapon", description: "Ancestral 15 ft cone. DEX/CON save by ancestry, half damage on success.", resource: "action", refresh: "shortRest", uses: 1 });
  }
  for (const ability of racialSpellAbilityDefinitions(fighter)) {
    if (!source.some((entry) => entry.id === ability.id)) source.push(ability);
  }
  return source
    .filter((ability) => ability.id !== "eldritchBlast")
    .map((ability) => ({
      ...ability,
      usesByLevel: Array.isArray(ability.usesByLevel) ? ability.usesByLevel.map((entry) => ({ ...entry })) : undefined,
    }));
}

function racialSpellAbilityDefinitions(fighter = state?.fighters?.hero) {
  const race = fighter?.raceSelection?.raceId ?? fighter?.race;
  const subrace = fighter?.raceSelection?.subraceId ?? fighter?.subrace;
  const abilities = [];
  const add = (ability) => abilities.push({ uses: 1, refresh: "longRest", level: 1, ...ability });

  if (subrace === "eladrin") {
    add({
      id: "eladrinFeyStep",
      name: "Fey Step",
      description: "Racial teleport. Bonus action to blink to a visible empty square within 30 ft.",
      resource: "bonusAction",
      refresh: "shortRest",
      racialSpellId: "eladrin-fey-step",
    });
  }
  if (subrace === "shadar-kai") {
    add({
      id: "shadarKaiBlessing",
      name: "Blessing of the Raven Queen",
      description: "Racial teleport. Bonus action to slip through shadow to a visible empty square within 30 ft.",
      resource: "bonusAction",
      refresh: "shortRest",
      racialSpellId: "shadar-kai-blessing",
    });
  }
  if (subrace === "duergar") {
    add({
      id: "duergarEnlarge",
      name: "Duergar Enlarge",
      description: "Once per long rest. Grow battle-hardened for 3 rounds: temporary HP and extra weapon damage.",
      resource: "action",
      level: 3,
      racialSpellId: "duergar-enlarge",
    });
  }
  if (subrace === "drow" || subrace === "drow-half-elf") {
    add({
      id: "drowFaerieFire",
      name: "Drow Faerie Fire",
      description: "Once per long rest. Expose enemies in a small area; DEX save negates.",
      resource: "action",
      level: 3,
      racialSpellId: "drow-faerie-fire",
    });
  }
  if (race === "tiefling" && subrace === "baalzebul") {
    add({
      id: "baalzebulRayOfSickness",
      name: "Ray of Sickness",
      description: "Once per long rest. Poison ray that can sicken a visible enemy.",
      resource: "action",
      level: 3,
      racialSpellId: "baalzebul-ray-of-sickness",
    });
  }
  if (race === "tiefling" && subrace === "levistus") {
    add({
      id: "levistusArmorOfAgathys",
      name: "Armor of Agathys",
      description: "Once per long rest. Gain icy protection and temporary HP.",
      resource: "action",
      level: 3,
      racialSpellId: "levistus-armor-of-agathys",
    });
  }
  if (race === "tiefling" && subrace === "mephistopheles") {
    add({
      id: "mephistophelesBurningHands",
      name: "Burning Hands",
      description: "Once per long rest. Fan hellfire in a 15 ft cone; DEX save half.",
      resource: "action",
      level: 3,
      racialSpellId: "mephistopheles-burning-hands",
    });
  }
  if (race === "tiefling" && subrace === "zariel") {
    add({
      id: "zarielBrandingSmite",
      name: "Branding Smite",
      description: "Once per long rest. Bonus action; your next hit brands the target with radiant power.",
      resource: "bonusAction",
      level: 3,
      racialSpellId: "zariel-branding-smite",
    });
  }
  if (race === "aasimar") {
    add({
      id: "aasimarHealingHands",
      name: "Healing Hands",
      description: "Once per long rest. Touch yourself or an adjacent hero to restore HP equal to your level.",
      resource: "action",
    });
  }
  if (race === "aasimar" && subrace === "protector") {
    add({
      id: "aasimarRadiantSoul",
      name: "Radiant Soul",
      description: "Once per long rest at level 3. Divine battle-form with radiant extra damage.",
      resource: "action",
      level: 3,
      racialSpellId: "aasimar-radiant-soul",
    });
  }
  if (race === "aasimar" && subrace === "scourge") {
    add({
      id: "aasimarRadiantConsumption",
      name: "Radiant Consumption",
      description: "Once per long rest at level 3. Dangerous radiant battle-form: strong damage, lower defense.",
      resource: "action",
      level: 3,
      racialSpellId: "aasimar-radiant-consumption",
    });
  }
  if (race === "aasimar" && subrace === "fallen") {
    add({
      id: "aasimarNecroticShroud",
      name: "Necrotic Shroud",
      description: "Once per long rest at level 3. Necrotic battle-form that frightens nearby enemies.",
      resource: "action",
      level: 3,
      racialSpellId: "aasimar-necrotic-shroud",
    });
  }
  if (race === "goliath") {
    add({
      id: "goliathStoneEndurance",
      name: "Stone's Endurance",
      description: "Reaction. When damaged, reduce damage by 1d12 + CON. Refreshes on short rest.",
      resource: "reaction",
      refresh: "shortRest",
    });
  }
  if (race === "yuan-ti") {
    add({
      id: "yuanTiSuggestion",
      name: "Suggestion",
      description: "Once per long rest at level 3. Charm-like command that briefly disables one enemy.",
      resource: "action",
      level: 3,
      racialSpellId: "yuan-ti-suggestion",
    });
  }
  if (race === "genasi" && subrace === "air") {
    add({
      id: "airGenasiLevitate",
      name: "Levitate",
      description: "Once per long rest at level 3. Float above danger for a short defensive lift.",
      resource: "action",
      level: 3,
      racialSpellId: "air-genasi-levitate",
    });
  }
  if (race === "genasi" && subrace === "fire") {
    add({
      id: "fireGenasiBurningHands",
      name: "Burning Hands",
      description: "Once per long rest at level 3. 15 ft cone, DEX save half.",
      resource: "action",
      level: 3,
      racialSpellId: "fire-genasi-burning-hands",
    });
  }

  return abilities;
}

function racialCantripSpellIdsForFighter(fighter = state?.fighters?.hero) {
  const race = fighter?.raceSelection?.raceId ?? fighter?.race;
  const subrace = fighter?.raceSelection?.subraceId ?? fighter?.subrace;
  const spells = [];
  if (subrace === "high-elf" || subrace === "high-half-elf") spells.push("high-elf-fire-bolt");
  if (subrace === "forest-gnome" || (race === "tiefling" && subrace === "glasya")) spells.push("minor-illusion");
  if (race === "tiefling" && subrace === "levistus") spells.push("levistus-ray-of-frost");
  if (race === "yuan-ti") spells.push("yuan-ti-poison-spray");
  if (race === "genasi" && subrace === "earth") spells.push("blade-ward");
  if (race === "genasi" && subrace === "fire") spells.push("produce-flame");
  if (race === "genasi" && subrace === "water") spells.push("acid-splash");
  return spells;
}

function abilityMaxUses(fighter, ability) {
  const level = fighter.level ?? 1;
  if (ability.resourcePool === "ki") return Math.max(0, level);
  if (ability.resourcePool === "bardicInspiration") return Math.max(1, abilityMod(fighter, "cha"));
  if (ability.resourcePool === "wildShape") return 2;
  if (ability.resourcePool === "layOnHands") return Math.max(0, level * 5);
  if (ability.resourcePool === "arcaneRecovery") return 1;
  if (ability.resourcePool === "metamagic") return Math.max(0, level);
  let uses = ability.uses ?? 1;
  for (const entry of ability.usesByLevel ?? []) {
    if (level >= entry.level) uses = entry.uses;
  }
  return uses;
}

function canonicalSpellId(spellId) {
  const spell = getContentDefinition("spells", spellId);
  return spell?.aliasOf ?? spellId;
}

function spellPointMaximum(fighter) {
  const level = fighter?.level ?? 1;
  const progression = fighter?.spellPointProgression ?? {};
  let points = fighter?.spellPointMax ?? progression[level] ?? 0;
  for (const [entryLevel, value] of Object.entries(progression)) {
    if (level >= Number(entryLevel)) points = value;
  }
  return Math.max(0, Number(points) || 0);
}

function classSpellListForFighter(fighter = state?.fighters?.hero) {
  return [...(fighter?.classSpellList ?? fighter?.spellList ?? fighter?.spells ?? [])];
}

function classCantripListForFighter(fighter = state?.fighters?.hero) {
  return [...(fighter?.classCantripList ?? fighter?.cantripList ?? [])];
}

function classKnownSpellListForFighter(fighter = state?.fighters?.hero) {
  return Array.from(new Set([...classCantripListForFighter(fighter), ...classSpellListForFighter(fighter)]));
}

function spellDefinitionsForFighter(fighter = state?.fighters?.hero) {
  if (isWildShaped(fighter) && (fighter.level ?? 1) < 18) return [];
  const spellIds = [...(fighter?.spells ?? []), ...racialCantripSpellIdsForFighter(fighter)];
  return Array.from(new Set(spellIds.map(canonicalSpellId)))
    .map((spellId) => getContentDefinition("spells", canonicalSpellId(spellId)))
    .filter((spell) => spell && spellUnlockedForFighter(fighter, spell));
}

function activePartyKnowsSpell(spellId) {
  return partyHeroes().some((hero) => (hero.spells ?? []).map(canonicalSpellId).includes(spellId));
}

function guidanceSkillBonus() {
  return activePartyKnowsSpell("guidance") ? rollDie(4) : 0;
}

function casterTypeForFighter(fighter) {
  return fighter?.casterType ?? (["paladin", "ranger"].includes(fighter?.classId) ? "half" : fighter?.classId === "warlock" ? "pact" : "full");
}

function maxSpellLevelForFighter(fighter) {
  const level = fighter?.level ?? 1;
  const casterType = casterTypeForFighter(fighter);
  if (casterType === "none") return 0;
  if (casterType === "pact") return level >= 9 ? 5 : level >= 7 ? 4 : level >= 5 ? 3 : level >= 3 ? 2 : 1;
  if (casterType === "half") return level >= 17 ? 5 : level >= 13 ? 4 : level >= 9 ? 3 : level >= 5 ? 2 : 1;
  return level >= 17 ? 9 : level >= 15 ? 8 : level >= 13 ? 7 : level >= 11 ? 6 : level >= 9 ? 5 : level >= 7 ? 4 : level >= 5 ? 3 : level >= 3 ? 2 : 1;
}

function spellUnlockedForFighter(fighter, spell) {
  if (!fighter || !spell) return false;
  return spellBaseLevel(spell) <= maxSpellLevelForFighter(fighter);
}

function ensureSpellPointState(fighter) {
  const max = spellPointMaximum(fighter);
  fighter.spellPointMax = max;
  fighter.spellPoints = Math.min(max, fighter.spellPoints ?? max);
  fighter.classSpellList = classSpellListForFighter(fighter);
  fighter.classCantripList = classCantripListForFighter(fighter);
  fighter.classSpellList = fighter.classSpellList.map(canonicalSpellId);
  fighter.classCantripList = fighter.classCantripList.map(canonicalSpellId);
  const knownSpellList = classKnownSpellListForFighter(fighter).map(canonicalSpellId);
  fighter.spells = [...(fighter.spells ?? [])].map(canonicalSpellId).filter((spellId) => knownSpellList.includes(spellId));
  return fighter;
}

function resetFighterAbilityUses(fighter, refresh = "all") {
  fighter.abilityUses = refresh === "all" ? {} : { ...(fighter.abilityUses ?? {}) };
  for (const ability of fighterAbilityDefinitions(fighter)) {
    if ((fighter.level ?? 1) >= (ability.level ?? 1) && (refresh === "all" || ability.refresh === refresh || ability.refresh === "turn")) {
      fighter.abilityUses[ability.id] = 0;
    }
  }
}

function ensureFighterAbilityState(fighter) {
  fighter.abilities = fighterAbilityDefinitions(fighter);
  fighter.abilityUses = { ...(fighter.abilityUses ?? {}) };
  for (const ability of fighter.abilities) {
    if ((fighter.level ?? 1) >= (ability.level ?? 1)) {
      fighter.abilityUses[ability.id] = Math.min(fighter.abilityUses[ability.id] ?? 0, abilityMaxUses(fighter, ability));
    }
  }
  ensureSpellPointState(fighter);
  return fighter;
}

function scoreToMod(score) {
  return Math.floor((score - 10) / 2);
}

function abilityModsFromScores(scores = {}) {
  return Object.fromEntries(abilities.map((ability) => [ability, scoreToMod(scores[ability] ?? 10)]));
}

function proficiencyBonus(fighter) {
  return 2 + Math.floor(((fighter?.level ?? 1) - 1) / 4);
}

function skillCheckBonus(fighter, ability, skillId) {
  const proficiencies = new Set(fighter?.skillProficiencies ?? []);
  const expertise = new Set(fighter?.expertiseSkills ?? []);
  const prof = proficiencies.has(skillId) ? proficiencyBonus(fighter) : 0;
  const expert = expertise.has(skillId) ? proficiencyBonus(fighter) : 0;
  return abilityMod(fighter, ability) + prof + expert;
}

function thievesToolsTraining(fighter) {
  const expertTools = new Set(fighter?.expertiseTools ?? []);
  const proficientTools = new Set(fighter?.toolProficiencies ?? []);
  if (expertTools.has("thieves-tools")) return 2;
  if (proficientTools.has("thieves-tools")) return 1;
  return 0;
}

function thievesToolsCheckBonus(fighter) {
  return abilityMod(fighter, "dex") + thievesToolsTraining(fighter) * proficiencyBonus(fighter);
}

function firstSubraceId(raceId) {
  return Object.keys(speciesDefinitions[raceId]?.subraces ?? {})[0] ?? "";
}

function normalizeRaceSelection(selection = defaultRaceSelection) {
  const raceId = speciesDefinitions[selection?.raceId] ? selection.raceId : defaultRaceSelection.raceId;
  const subraces = speciesDefinitions[raceId]?.subraces ?? {};
  const subraceId = subraces[selection?.subraceId] ? selection.subraceId : firstSubraceId(raceId);
  const subrace = subraces[subraceId] ?? {};
  const dragonCategory = subrace.dragonCategory;
  const ancestries = dragonCategory ? dragonAncestries[dragonCategory] ?? {} : {};
  const dragonAncestryId =
    dragonCategory && ancestries[selection?.dragonAncestryId]
      ? selection.dragonAncestryId
      : dragonCategory
        ? Object.keys(ancestries)[0]
        : "";
  return {
    raceId,
    subraceId,
    dragonAncestryId,
    abilityChoices: Array.isArray(selection?.abilityChoices) ? selection.abilityChoices.filter((ability) => abilities.includes(ability)) : [],
  };
}

function mergeAbilityBonuses(...bonuses) {
  const merged = {};
  for (const bonus of bonuses) {
    for (const [ability, value] of Object.entries(bonus ?? {})) {
      if (!abilities.includes(ability)) continue;
      merged[ability] = (merged[ability] ?? 0) + value;
    }
  }
  return merged;
}

function uniqueValues(values = []) {
  return Array.from(new Set(values.filter(Boolean)));
}

function proficiencyEntries(values = []) {
  return uniqueValues(values.map((value) => String(value).toLowerCase()));
}

function classWeaponProficiencies(classTemplate = {}) {
  return proficiencyEntries(classTemplate.weaponProficiencies ?? []);
}

function classArmorProficiencies(classTemplate = {}) {
  return proficiencyEntries(classTemplate.armorProficiencies ?? []);
}

function classProficiencyPlan(classId = defaultContent.heroClass) {
  return classProficiencyPlans[classId] ?? {};
}

function classToolProficiencies(classId = defaultContent.heroClass) {
  return uniqueValues(classProficiencyPlan(classId).toolProficiencies ?? []);
}

function expertisePlanForClassLevel(classId = defaultContent.heroClass, level = 1) {
  return classProficiencyPlan(classId).expertiseByLevel?.[level] ?? null;
}

function skillName(skillId) {
  return skillDefinitions[skillId]?.name ?? String(skillId).replace(/-/g, " ");
}

function toolName(toolId) {
  return toolDefinitions[toolId]?.name ?? String(toolId).replace(/-/g, " ");
}

function raceTraitsForSelection(selection = defaultRaceSelection) {
  const normalized = normalizeRaceSelection(selection);
  const race = speciesDefinitions[normalized.raceId];
  const subrace = race?.subraces?.[normalized.subraceId] ?? {};
  const base = race?.base ?? {};
  const ancestry = subrace.dragonCategory ? dragonAncestries[subrace.dragonCategory]?.[normalized.dragonAncestryId] : null;
  const chosenBonuses = {};
  const choiceCount = base.abilityChoiceCount ?? subrace.abilityChoiceCount ?? 0;
  for (const ability of normalized.abilityChoices.slice(0, choiceCount)) {
    chosenBonuses[ability] = (chosenBonuses[ability] ?? 0) + 1;
  }
  const abilityBonuses = mergeAbilityBonuses(base.abilityBonuses, subrace.abilityBonuses, chosenBonuses);
  const damageResistances = uniqueValues([...(base.damageResistances ?? []), ...(subrace.damageResistances ?? []), ancestry?.damageType]);
  const damageImmunities = uniqueValues([...(base.damageImmunities ?? []), ...(subrace.damageImmunities ?? [])]);
  return {
    raceId: normalized.raceId,
    subraceId: normalized.subraceId,
    dragonAncestryId: normalized.dragonAncestryId,
    raceName: race?.name ?? "Human",
    subraceName: subrace.name ?? "Standard Human",
    ancestryName: ancestry?.name ?? "",
    abilityBonuses,
    speedFeet: subrace.speedFeet ?? base.speedFeet ?? 30,
    size: subrace.size ?? base.size ?? "medium",
    hpPerLevel: (base.hpPerLevel ?? 0) + (subrace.hpPerLevel ?? 0),
    damageResistances,
    damageImmunities,
    weaponProficiencies: proficiencyEntries([...(base.weaponProficiencies ?? []), ...(subrace.weaponProficiencies ?? [])]),
    armorProficiencies: proficiencyEntries([...(base.armorProficiencies ?? []), ...(subrace.armorProficiencies ?? [])]),
    skillProficiencies: uniqueValues([...(base.skillProficiencies ?? []), ...(subrace.skillProficiencies ?? [])]),
    skillChoiceCount: (base.skillChoiceCount ?? 0) + (subrace.skillChoiceCount ?? 0),
    skillChoices: uniqueValues([...(base.skillChoices ?? allSkillIds), ...(subrace.skillChoices ?? [])]),
    toolProficiencies: uniqueValues([...(base.toolProficiencies ?? []), ...(subrace.toolProficiencies ?? [])]),
    toolChoiceCount: (base.toolChoiceCount ?? 0) + (subrace.toolChoiceCount ?? 0),
    toolChoices: uniqueValues([...(base.toolChoices ?? []), ...(subrace.toolChoices ?? [])]),
    traits: uniqueValues([...(base.traits ?? []), ...(subrace.traits ?? [])]),
    spellTraits: uniqueValues([...(base.spellTraits ?? []), ...(subrace.spellTraits ?? [])]),
    halflingLucky: Boolean(base.halflingLucky || subrace.halflingLucky),
    relentlessEndurance: Boolean(base.relentlessEndurance || subrace.relentlessEndurance),
    savageAttacks: Boolean(base.savageAttacks || subrace.savageAttacks),
    dragonDamageType: ancestry?.damageType ?? "",
    dragonBreathSaveAbility: ancestry?.saveAbility ?? "dex",
  };
}

function raceAbilityBonuses(selection = defaultRaceSelection) {
  return raceTraitsForSelection(selection).abilityBonuses;
}

function raceDisplayName(selection = defaultRaceSelection) {
  const traits = raceTraitsForSelection(selection);
  const ancestry = traits.ancestryName ? ` (${traits.ancestryName})` : "";
  return `${traits.raceName} - ${traits.subraceName}${ancestry}`;
}

function abilityBonusSummary(bonuses = {}) {
  const parts = abilities
    .filter((ability) => bonuses[ability])
    .map((ability) => `${ability.toUpperCase()} ${abilityLabel(bonuses[ability])}`);
  return parts.length ? parts.join(", ") : "No ability bonus";
}

function applyHeroCreationOptions(template, options = {}) {
  const settings = { ...template, ...options };
  const classId = options.classId ?? settings.classId ?? defaultContent.heroClass;
  const raceSelection = normalizeRaceSelection(options.raceSelection);
  const raceTraits = raceTraitsForSelection(raceSelection);
  const abilityScores = options.abilityScores
    ? Object.fromEntries(abilities.map((ability) => [ability, (options.abilityScores[ability] ?? 10) + (raceTraits.abilityBonuses[ability] ?? 0)]))
    : undefined;
  const abilityMods = abilityScores ? abilityModsFromScores(abilityScores) : { ...(settings.abilityMods ?? {}) };
  const hitDie = template.hitDie ?? 10;
  const level = settings.level ?? 1;
  const maxHp = abilityScores ? hitDie + abilityMods.con + (raceTraits.hpPerLevel ?? 0) * level : (settings.maxHp ?? template.maxHp);
  return {
    ...settings,
    classId,
    className: settings.className ?? settings.class ?? "Fighter",
    raceSelection,
    race: raceTraits.raceId,
    subrace: raceTraits.subraceId,
    speciesName: raceTraits.raceName,
    subraceName: raceTraits.subraceName,
    dragonAncestryId: raceTraits.dragonAncestryId,
    racialAbilityBonuses: raceTraits.abilityBonuses,
    racialHpPerLevel: raceTraits.hpPerLevel,
    racialTraits: {
      halflingLucky: raceTraits.halflingLucky,
      relentlessEndurance: raceTraits.relentlessEndurance,
      savageAttacks: raceTraits.savageAttacks,
      dragonDamageType: raceTraits.dragonDamageType,
      dragonBreathSaveAbility: raceTraits.dragonBreathSaveAbility,
      traits: raceTraits.traits,
      spellTraits: raceTraits.spellTraits,
    },
    size: raceTraits.size,
    baseSpeedFeet: raceTraits.speedFeet,
    speedFeet: raceTraits.speedFeet,
    damageResistances: uniqueValues([...(settings.damageResistances ?? []), ...raceTraits.damageResistances]),
    damageImmunities: uniqueValues([...(settings.damageImmunities ?? []), ...raceTraits.damageImmunities]),
    weaponProficiencies: proficiencyEntries([...(settings.weaponProficiencies ?? []), ...raceTraits.weaponProficiencies]),
    armorProficiencies: proficiencyEntries([...(settings.armorProficiencies ?? []), ...raceTraits.armorProficiencies]),
    skillProficiencies: uniqueValues([...(settings.skillProficiencies ?? []), ...raceTraits.skillProficiencies]),
    expertiseSkills: uniqueValues(settings.expertiseSkills ?? []),
    toolProficiencies: uniqueValues([...(settings.toolProficiencies ?? []), ...raceTraits.toolProficiencies, ...classToolProficiencies(classId)]),
    expertiseTools: uniqueValues(settings.expertiseTools ?? []),
    proficiencySchemaVersion: 1,
    abilityScores,
    abilityMods,
    baseAttackAbilityMod: template.abilityMods?.str ?? 0,
    baseMaxHp: maxHp,
    maxHp,
    hp: maxHp,
    relentlessEnduranceUsed: false,
  };
}

function getContentDefinition(type, id) {
  return window.DungeonContent?.get(type, id) ?? null;
}

function currentThemeId() {
  return state?.themeId ?? defaultContent.theme ?? "default";
}

function applyThemePalette() {
  const palette = getContentDefinition("themes", currentThemeId())?.palette ?? {};
  const root = document.documentElement;
  for (const [name, value] of Object.entries(palette)) {
    if (name === "bodyBackground") continue;
    const cssName = name
      .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
      .replace(/([a-z])([0-9])/g, "$1-$2");
    root.style.setProperty(`--${cssName}`, value);
  }
  root.style.setProperty("--wall-edge", palette.wallEdge ?? palette.wallDetail ?? palette.wallLine ?? "rgba(246, 234, 216, 0.32)");
  if (palette.bodyBackground) {
    document.body.style.background = palette.bodyBackground;
  } else {
    document.body.style.background = "";
  }
}

function soundPathForMusic(key) {
  if (key === "mainmenu") return `${soundAssetRoot}/music/mainmenu.mp3`;
  if (key === "home") return `${soundAssetRoot}/music/home.mp3`;
  const theme = getContentDefinition("themes", currentThemeId());
  if (key === "exploration" && theme?.music?.exploration) return theme.music.exploration;
  if (key === "combat" && theme?.music?.combat) return theme.music.combat;
  if (key === "boss-combat" && (theme?.music?.bossCombat || theme?.music?.boss)) return theme.music.bossCombat ?? theme.music.boss;
  return `${soundAssetRoot}/music/${currentThemeId()}-${key}.mp3`;
}

function playSoundEffect(id) {
  const src = soundEffects[id];
  const soundEffectPitchVariation = 0.05;
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = 0.1 * soundVolume;
  const randomPitch = 1 + (Math.random() * 2 - 1) * soundEffectPitchVariation;
  audio.playbackRate = randomPitch;
  audio.play().catch(() => {});
}

function desiredMusicKey() {
  if (!gameHasStarted || !els.mainMenu?.classList.contains("hidden")) return "mainmenu";
  if (!state) return "";
  if (state.mode === "home") return "home";
  if (state.mode === "combat") {
    return combatMonsters().some((monster) => monster.id?.startsWith("boss-")) ? "boss-combat" : "combat";
  }
  return state.mode === "exploration" ? "exploration" : "";
}

function updateBackgroundMusic() {
  const key = desiredMusicKey();
  if (key === currentMusicKey) {
    if (currentMusic) {
      currentMusic.volume = 0.1 * soundVolume;
      if (currentMusic.paused) currentMusic.play().catch(() => {});
    }
    return;
  }

  if (currentMusic) {
    currentMusic.pause();
    currentMusic = null;
  }
  currentMusicKey = key;
  if (!key) return;

  currentMusic = new Audio(soundPathForMusic(key));
  currentMusic.loop = true;
  currentMusic.volume = 0.1 * soundVolume;
  currentMusic.play().catch(() => {});
}

function getHeroTemplate(classId = defaultContent.heroClass) {
  return getContentDefinition("classes", classId) ?? getContentDefinition("classes", defaultContent.heroClass) ?? templates.hero;
}

function getMonsterTemplate(monsterId = defaultContent.monster) {
  return getContentDefinition("monsters", monsterId) ?? (monsterId === defaultContent.monster ? templates.monster : null);
}

function adminEnabled() {
  return adminMode && gameHasStarted;
}

function disableAdminModeOptions() {
  showDungeonLayout = false;
  adminTeleportEnabled = false;
  adminGodMode = false;
  inventoryAdminOpen = false;
  adminMonsterCatalogOpen = false;
  adminMonsterSearch = "";
}

function monsterMatchesTags(monster, requiredTags = []) {
  const monsterTags = new Set(monster?.tags ?? []);
  return requiredTags.every((tag) => monsterTags.has(tag));
}

function contentMatchesAnyTagGroup(entry, tagGroups = []) {
  return tagGroups.some((requiredTags) => monsterMatchesTags(entry, requiredTags));
}

function normalizeTagGroups(primaryGroups = [], legacyTags = []) {
  if (Array.isArray(primaryGroups) && primaryGroups.length) return primaryGroups;
  return Array.isArray(legacyTags) && legacyTags.length ? [legacyTags] : [];
}

function monsterIdsMatchingTagGroups(tagGroups = [], options = {}) {
  if (!tagGroups.length) return [];
  const { includeBosses = true } = options;
  return window.DungeonContent
    .list("monsters")
    .filter((monster) => contentMatchesAnyTagGroup(monster, tagGroups))
    .filter((monster) => includeBosses || !monster.tags?.includes("boss"))
    .map((monster) => monster.id);
}

function idsMatchingTagGroups(type, tagGroups = [], options = {}) {
  if (!tagGroups.length) return [];
  const { excludeKinds = [] } = options;
  return window.DungeonContent
    .list(type)
    .filter((entry) => contentMatchesAnyTagGroup(entry, tagGroups))
    .filter((entry) => !excludeKinds.includes(entry.kind))
    .map((entry) => entry.id);
}

function dungeonMonsterIds(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  const tagGroups = normalizeTagGroups(theme?.monsterTagGroups, theme?.monsterTags);
  const taggedMonsterIds = monsterIdsMatchingTagGroups(tagGroups, { includeBosses: false });
  if (taggedMonsterIds.length) return taggedMonsterIds;
  return theme?.monsterIds?.length ? theme.monsterIds : [defaultContent.monster];
}

function dungeonBossMonsterIds(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  const bossTagGroups = normalizeTagGroups(theme?.bossMonsterTagGroups, theme?.bossMonsterTags);
  const taggedBossMonsterIds = monsterIdsMatchingTagGroups(bossTagGroups);
  if (taggedBossMonsterIds.length) return taggedBossMonsterIds;
  return theme?.bossMonsterIds ?? [];
}

function categoryForHeroLevel(level = 1) {
  return Math.max(1, Math.ceil(Math.max(1, level) / 2));
}

function heroNeedsDungeonBoss(hero) {
  return (hero.level ?? 1) % 2 === 0;
}

function monsterCategory(monster) {
  return monster.category ?? monster.cat ?? 1;
}

const monsterCategoryRingColors = {
  1: "#3fae5a",
  2: "#6caf48",
  3: "#98ad3f",
  4: "#bfa13a",
  5: "#c98532",
  6: "#c7662e",
  7: "#bd4630",
  8: "#9f2f2f",
  9: "#762323",
  10: "#4a1414",
};

const swarmSpawnTuning = {
  minimumCount: 2,
  maximumPartySize: 4,
  basePartySize: 1,
  extraPerPartyMember: 1,
  extraPerCategoryGap: 1,
  maximumExtraFromLevelGap: 4,
  absoluteMaximum: 8,
};

const roomMonsterSpawnTuning = {
  baseCount: 1,
  extraPerPartyMember: 0.65,
  categoryGapBonus: 0.45,
  randomSpread: 0.6,
  maximumCount: 5,
  entranceRoomSpawnChance: 0,
  roomSpawnChance: 0.72,
};

const monsterThrownWeaponPickupChance = 0.02;
const monsterSpecialAbilityTuning = {
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
};

function monsterCategoryRingColor(monster) {
  const category = Math.max(1, Math.min(10, Number(monsterCategory(monster)) || 1));
  return monsterCategoryRingColors[category] ?? monsterCategoryRingColors[1];
}

function averagePartyLevel(hero = state?.fighters?.hero) {
  const heroIds = state?.party?.heroIds ?? ["hero"];
  const heroes = heroIds.map((id) => state?.fighters?.[id]).filter(Boolean);
  if (heroes.length === 0) return hero?.level ?? 1;
  return heroes.reduce((sum, entry) => sum + (entry.level ?? 1), 0) / heroes.length;
}

function partySizeForSwarm(hero = state?.fighters?.hero) {
  const stateSize = state?.party?.heroIds?.length;
  const explicitSize = hero?.partySize ?? hero?.party?.size;
  return clamp(Number(stateSize ?? explicitSize ?? 1) || 1, 1, swarmSpawnTuning.maximumPartySize);
}

function swarmSpawnCount(monsterTemplate, hero) {
  const partySize = partySizeForSwarm(hero);
  const partyLevelCategory = categoryForHeroLevel(averagePartyLevel(hero));
  const categoryGap = Math.max(0, partyLevelCategory - monsterCategory(monsterTemplate));
  const partyExtra = Math.max(0, partySize - swarmSpawnTuning.basePartySize) * swarmSpawnTuning.extraPerPartyMember;
  const levelExtra = Math.min(swarmSpawnTuning.maximumExtraFromLevelGap, categoryGap * swarmSpawnTuning.extraPerCategoryGap);
  return clamp(swarmSpawnTuning.minimumCount + partyExtra + levelExtra, swarmSpawnTuning.minimumCount, swarmSpawnTuning.absoluteMaximum);
}

function roomMonsterSpawnCount(monsterTemplate, hero) {
  if (monsterTemplate.behavior === "swarm") return swarmSpawnCount(monsterTemplate, hero);
  const partySize = partySizeForSwarm(hero);
  const partyLevelCategory = categoryForHeroLevel(averagePartyLevel(hero));
  const categoryGap = Math.max(0, partyLevelCategory - monsterCategory(monsterTemplate));
  const expected =
    roomMonsterSpawnTuning.baseCount +
    Math.max(0, partySize - 1) * roomMonsterSpawnTuning.extraPerPartyMember +
    categoryGap * roomMonsterSpawnTuning.categoryGapBonus;
  const spread = partySize > 1 || categoryGap > 0 ? roomMonsterSpawnTuning.randomSpread : 0;
  const minimum = clamp(Math.floor(expected - spread), 1, roomMonsterSpawnTuning.maximumCount);
  const maximum = clamp(Math.ceil(expected + spread + categoryGap * 0.2), minimum, roomMonsterSpawnTuning.maximumCount);
  return minimum + Math.floor(Math.random() * (maximum - minimum + 1));
}

function weightedMonsterIdsForHero(hero, themeId = currentThemeId()) {
  const targetCategory = categoryForHeroLevel(hero.level ?? 1);
  const allowedMonsterIds = dungeonMonsterIds(themeId);
  const entries = allowedMonsterIds
    .map((id) => ({ id, template: getMonsterTemplate(id) }))
    .filter((entry) => entry.template && monsterCategory(entry.template) <= targetCategory)
    .map((entry) => {
      const category = monsterCategory(entry.template);
      return {
        id: entry.id,
        weight: category === targetCategory ? 3 : 1,
      };
    });

  return entries.length ? entries : allowedMonsterIds.map((id) => ({ id, weight: 1 }));
}

function pickWeightedMonsterId(entries, usedCounts = {}, fallbackId = defaultContent.monster) {
  if (entries.length === 0) return fallbackId;
  const adjustedEntries = entries.map((entry) => ({
    ...entry,
    weight: entry.weight / Math.max(1, (usedCounts[entry.id] ?? 0) + 1),
  }));
  const total = adjustedEntries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of adjustedEntries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return adjustedEntries.at(-1)?.id ?? fallbackId;
}

function bossMonsterIdForHero(hero, themeId = currentThemeId()) {
  const targetCategory = categoryForHeroLevel(hero.level ?? 1);
  const bosses = dungeonBossMonsterIds(themeId)
    .map((id) => ({ id, template: getMonsterTemplate(id) }))
    .filter((entry) => entry.template && monsterCategory(entry.template) <= targetCategory)
    .sort((a, b) => monsterCategory(b.template) - monsterCategory(a.template));
  return bosses[0]?.id ?? null;
}

function applyMonsterCategoryScaling(monster, hero) {
  const targetCategory = categoryForHeroLevel(hero.level ?? 1);
  const categoryGap = Math.max(0, targetCategory - monsterCategory(monster));
  if (categoryGap <= 0) return monster;

  const hpMultiplier = 1 + categoryGap * 0.1;
  monster.maxHp = Math.max(1, Math.ceil(monster.maxHp * hpMultiplier));
  monster.hp = monster.maxHp;
  return monster;
}

function objectTemplate(type) {
  return getContentDefinition("furniture", type);
}

function normalizeObjectComponent(component) {
  if (!component) return null;
  if (typeof component === "string") return { type: component };
  const type = component.type ?? component.kind ?? component.id;
  return type ? { ...component, type } : null;
}

function objectComponents(objectOrType) {
  const template =
    typeof objectOrType === "string"
      ? objectTemplate(objectOrType)
      : objectTemplate(objectOrType?.type);
  return (template?.components ?? []).map(normalizeObjectComponent).filter(Boolean);
}

function objectComponent(objectOrType, type) {
  return objectComponents(objectOrType).find((component) => component.type === type) ?? null;
}

function objectHasComponent(objectOrType, type) {
  return Boolean(objectComponent(objectOrType, type));
}

function destructibleObjectComponent(objectOrType) {
  return objectComponent(objectOrType, "destructibleObject");
}

function objectIsDestructible(object) {
  return Boolean(object?.id && destructibleObjectComponent(object) && !object.destroyed && (object.hp === undefined || object.hp > 0));
}

function objectArmorClass(object) {
  return object?.ac ?? destructibleObjectComponent(object)?.ac ?? 10;
}

function objectMaxHp(object) {
  return object?.maxHp ?? destructibleObjectComponent(object)?.hp ?? 1;
}

function ensureDestructibleObjectState(object) {
  if (!objectIsDestructible(object)) return object;
  object.maxHp = Math.max(1, Math.floor(objectMaxHp(object)));
  object.hp = Math.max(0, Math.min(object.maxHp, Math.floor(object.hp ?? object.maxHp)));
  object.ac = Math.max(1, Math.floor(objectArmorClass(object)));
  return object;
}

function objectIsTrap(object) {
  const trapComponent = objectComponent(object, "trap");
  return objectTemplate(object?.type)?.kind === "trap" || trapComponent?.mode === "floor";
}

function objectCanInspect(object) {
  const template = objectTemplate(object?.type);
  if (!template) return false;
  return Boolean(
    template.inspectable ||
      objectHasComponent(object, "hiddenLoot") ||
      objectHasComponent(object, "ambushOnInspect") ||
      objectHasComponent(object, "harvestableResource") ||
      objectHasComponent(object, "interactableToggle") ||
      objectHasComponent(object, "lightSource") ||
      objectHasComponent(object, "spawnPoint"),
  );
}

function objectHasLoot(object) {
  return Boolean(
    object?.items?.length ||
      objectHasComponent(object, "definedLootContainer") ||
      objectHasComponent(object, "harvestableResource") ||
      objectHasComponent(object, "hiddenLoot"),
  );
}

function movementCostAtPosition(position) {
  return objectHasComponent(objectAt(position), "difficultTerrain") ? 2 : 1;
}

function objectIsHazardousTerrain(object) {
  return Boolean(objectHasComponent(object, "hazardOnEnter") || objectHasComponent(object, "hazardOnMovement"));
}

function objectCells(object) {
  const template = objectTemplate(object.type);
  if (!template) return [];
  const width = object.width ?? template.width ?? 1;
  const height = object.height ?? template.height ?? 1;
  return Array.from({ length: width * height }, (_, index) => ({
    x: object.position.x + (index % width),
    y: object.position.y + Math.floor(index / width),
  }));
}

function objectAt(position) {
  const tileKey = positionKey(position);
  return (state.dungeonObjects ?? []).find((object) => objectCells(object).some((cell) => positionKey(cell) === tileKey)) ?? null;
}

function objectBlocksMovement(object) {
  return Boolean(objectTemplate(object.type)?.blocksMovement || objectHasComponent(object, "blocksMovement"));
}

function blockingObjectKeys() {
  const keys = new Set();
  for (const object of state?.dungeonObjects ?? []) {
    if (!objectBlocksMovement(object)) continue;
    objectCells(object).forEach((cell) => keys.add(positionKey(cell)));
  }
  return keys;
}

function objectBlocksLineOfSight(object) {
  return Boolean(objectTemplate(object.type)?.blocksLineOfSight === true || objectHasComponent(object, "blocksLineOfSight"));
}

function lineOfSightBlockingObjectKeys() {
  const keys = new Set();

  for (const object of state?.dungeonObjects ?? []) {
    if (!objectBlocksLineOfSight(object)) continue;

    objectCells(object).forEach((cell) => {
      keys.add(positionKey(cell));
    });
  }

  return keys;
}

function objectOverlaps(object, blockedKeys) {
  return objectCells(object).some((cell) => blockedKeys.has(positionKey(cell)));
}

function objectTouchesBlockedCell(object, blockedKeys) {
  return objectCells(object).some((cell) =>
    surroundingCells(cell).some((candidate) => blockedKeys.has(positionKey(candidate))),
  );
}

function dungeonFurnitureIds(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  const tagGroups = normalizeTagGroups(theme?.furnitureTagGroups, theme?.furnitureTags);
  const taggedFurnitureIds = idsMatchingTagGroups("furniture", tagGroups, { excludeKinds: ["trap"] });
  if (taggedFurnitureIds.length) return taggedFurnitureIds;
  if (theme?.furnitureIds?.length) return theme.furnitureIds;
  return ["table", "bigRock", "chest", "portal"];
}

function dungeonFloorTrapIds(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  const tagGroups = normalizeTagGroups(theme?.trapTagGroups, theme?.trapTags);
  if (Array.isArray(theme?.trapTagGroups) && theme.trapTagGroups.length === 0) return [];
  const taggedTrapIds = idsMatchingTagGroups("furniture", tagGroups).filter((id) => objectTemplate(id)?.kind === "trap");
  if (taggedTrapIds.length) return taggedTrapIds;
  return theme?.trapIds ?? ["trap"];
}

function objectSpawnChance(type, fallback, themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  return theme?.furnitureSpawnChances?.[type] ?? objectTemplate(type)?.spawnChance ?? fallback;
}

function roomDoorKeys(room) {
  return new Set((room.doors ?? []).map(positionKey));
}

function tryCreateCenteredObjectForRoom(room, blockedKeys, type, id, themeId = currentThemeId()) {
  const template = objectTemplate(type);
  if (!template) return null;
  const width = template.width ?? 1;
  const height = template.height ?? 1;
  const minX = Math.min(...room.cells.map((cell) => cell.x));
  const maxX = Math.max(...room.cells.map((cell) => cell.x));
  const minY = Math.min(...room.cells.map((cell) => cell.y));
  const maxY = Math.max(...room.cells.map((cell) => cell.y));
  const centerY = Math.floor((minY + maxY - height + 1) / 2);
  const centerX = Math.floor((minX + maxX - width + 1) / 2);
  const object = createFeatureObject(type, { x: centerX, y: centerY }, id, themeId);
  const cellKeys = new Set(room.cells.map(positionKey));
  const doorKeys = roomDoorKeys(room);
  if (objectCells(object).some((cell) => !cellKeys.has(positionKey(cell)) || doorKeys.has(positionKey(cell)))) return null;
  if (objectTouchesBlockedCell(object, blockedKeys)) return null;
  objectCells(object).forEach((cell) => blockedKeys.add(positionKey(cell)));
  return object;
}

function wallAdjacentRoomCells(room) {
  const roomKeys = new Set(room.cells.map(positionKey));
  const doorKeys = roomDoorKeys(room);
  return room.cells.filter((cell) => {
    if (doorKeys.has(positionKey(cell))) return false;
    return adjacentCells(cell).some((neighbor) => !roomKeys.has(positionKey(neighbor)));
  });
}

function randomOpenCell(cells, blockedKeys) {
  return cells
    .slice()
    .sort(() => Math.random() - 0.5)
    .find((cell) => !surroundingCells(cell).some((candidate) => blockedKeys.has(positionKey(candidate)))) ?? null;
}

function randomTrapDifficulty(type = "trap") {
  const options = objectTemplate(type)?.spotDcs ?? [{ label: "Normal", dc: 12 }];
  return options[Math.floor(Math.random() * options.length)] ?? options[1];
}

function rollFeatureLoot(component, source = "found") {
  if (!component) return [];
  if (component.reward === "chestLoot") return randomChestLoot(component.count ?? Math.floor(Math.random() * 3));
  if (Array.isArray(component.items)) {
    return component.items.map((itemId) => createItemInstance(itemId, source)).filter(Boolean);
  }
  if (component.item) {
    const item = createItemInstance(component.item, source);
    return item ? [item] : [];
  }
  return [];
}

function createFeatureTrap(component, themeId = currentThemeId()) {
  const templateTrap = component?.source === "container" || component?.source === "chest" ? randomChestTrap(themeId) : null;
  if (templateTrap) return templateTrap;
  const damage = component?.damage ?? { count: 1, sides: 4, type: "piercing" };
  return {
    id: component?.id ?? "feature-trap",
    name: component?.name ?? "Hidden Trap",
    spotDc: component?.spotDc ?? component?.dc ?? 13,
    spotDifficulty: component?.spotDifficulty ?? "Normal",
    damage: { ...damage },
    description: component?.description ?? "A hidden trap built into this feature.",
  };
}

function createFeatureObject(type, position, id, themeId = currentThemeId()) {
  const template = objectTemplate(type);
  const object = {
    id,
    type,
    position: { ...position },
    width: template?.width ?? 1,
    height: template?.height ?? 1,
  };
  const lootComponent = objectComponent(type, "definedLootContainer");
  if (lootComponent) object.items = rollFeatureLoot(lootComponent, "object");
  ensureDestructibleObjectState(object);

  const lockComponent = objectComponent(type, "lock");
  if (lockComponent) {
    object.lockDc = lockComponent.dc ?? 12;
    object.locked = Math.random() < (lockComponent.chance ?? 0.5);
  }

  const trapComponent = objectComponent(type, "trap");
  if (trapComponent) {
    if (template?.kind === "trap" || trapComponent.mode === "floor") {
      const difficulty = randomTrapDifficulty(type);
      object.armed = true;
      object.spotDc = trapComponent.spotDc ?? difficulty.dc;
      object.spotDifficulty = trapComponent.spotDifficulty ?? difficulty.label;
    } else {
      const defaultChance = type === "chest" ? getContentDefinition("themes", themeId)?.traps?.chestChance ?? 0.3 : 1;
      if (Math.random() < (trapComponent.chance ?? defaultChance)) object.trap = createFeatureTrap(trapComponent, themeId);
    }
  }
  return object;
}

function portalCandidateCells(dungeon, blockedKeys, objects) {
  const furnitureAdjacentKeys = new Set(
    objects
      .filter((object) => objectTemplate(object.type)?.placement !== "paired-dungeon-cells")
      .flatMap((object) => objectCells(object).flatMap((cell) => [cell, ...adjacentCells(cell)]))
      .map(positionKey),
  );
  const doorKeys = new Set((dungeon.doors ?? []).map(positionKey));
  return (dungeon.rooms ?? []).flatMap((room) =>
    room.cells
      .filter((cell) => !doorKeys.has(positionKey(cell)))
      .filter((cell) => !blockedKeys.has(positionKey(cell)))
      .filter((cell) => !furnitureAdjacentKeys.has(positionKey(cell)))
      .map((cell) => ({ ...cell, roomId: room.id })),
  );
}

function tryCreatePortalPair(dungeon, blockedKeys, objects, objectId, themeId = currentThemeId()) {
  if ((dungeon.rooms?.length ?? 0) < 2 || Math.random() >= objectSpawnChance("portal", 0.35, themeId)) return;

  const candidates = portalCandidateCells(dungeon, blockedKeys, objects).sort(() => Math.random() - 0.5);
  const first = candidates[0];
  if (!first) return;
  const second = candidates.find((candidate) => candidate.roomId !== first?.roomId && distance(candidate, first) >= 8);
  if (!second) return;

  const firstId = `portal-${objects.length + 1}`;
  const secondId = `portal-${objects.length + 2}`;
  objects.push(
    { ...createFeatureObject("portal", { x: first.x, y: first.y }, firstId, themeId), pairId: secondId },
    { ...createFeatureObject("portal", { x: second.x, y: second.y }, secondId, themeId), pairId: firstId },
  );
  blockedKeys.add(positionKey(first));
  blockedKeys.add(positionKey(second));
}

function chestLootPool() {
  return window.DungeonContent.list("items").filter(
    (item) => (item.use?.kind === "healing" && !item.use?.charges) || item.type === "ammunition" || (item.type === "weapon" && item.store?.buyable !== false),
  );
}

function randomChestLoot(count = 2, category = currentLootCategory()) {
  const pool = chestLootPool();
  const items = Array.from({ length: count }, () => {
    const template = pool[Math.floor(Math.random() * pool.length)];
    return template ? createItemInstance(template.id, "chest") : null;
  }).filter(Boolean);
  const treasureChance = Math.min(0.5, 0.18 + category * 0.06);
  if (Math.random() < treasureChance) {
    const treasure = randomTreasureDrop(category);
    if (treasure) items.push(treasure);
  }
  const magicChance = Math.min(0.14, 0.015 + category * 0.02);
  if (Math.random() < magicChance) {
    const magic = randomMagicLootDrop(category);
    if (magic) items.push(magic);
  }
  return items;
}

function chestTrapPool(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  const tagGroups = normalizeTagGroups(theme?.trapTagGroups, theme?.trapTags);
  if (Array.isArray(theme?.trapTagGroups) && theme.trapTagGroups.length === 0) return [];
  const trapIds = idsMatchingTagGroups("traps", tagGroups);
  return window.DungeonContent
    .list("traps")
    .filter((trap) => trap.placement === "chest")
    .filter((trap) => !tagGroups.length || trapIds.includes(trap.id));
}

function randomChestTrap(themeId = currentThemeId()) {
  const pool = chestTrapPool(themeId);
  const template = pool[Math.floor(Math.random() * pool.length)];
  return template
    ? {
        id: template.id,
        name: template.name,
        spotDc: template.spotDc ?? 12,
        spotDifficulty: template.spotDifficulty ?? "Normal",
        damage: { ...(template.damage ?? { count: 1, sides: 4, type: "piercing" }) },
        description: template.description ?? "A hidden chest trap.",
      }
    : null;
}

function createDungeonObjects(dungeon, reservedPositions = [], themeId = currentThemeId()) {
  const objects = [];
  const theme = getContentDefinition("themes", themeId);
  const trapSettings = theme?.traps ?? {};
  const allowedFurniture = new Set(dungeonFurnitureIds(themeId));
  const floorTrapIds = dungeonFloorTrapIds(themeId);
  const blockedKeys = new Set((dungeon.doors ?? []).map(positionKey));
  reservedPositions.forEach((position) => blockedKeys.add(positionKey(position)));
  const objectId = (type) => `${type}-${objects.length + 1}`;

  const placeObjectInRoom = (type, room) => {
    const template = objectTemplate(type);
    if (!template || template.kind === "trap" || template.placement === "paired-dungeon-cells") return false;
    if (template.placement === "room-center") {
      const centered = tryCreateCenteredObjectForRoom(room, blockedKeys, type, objectId(type), themeId);
      if (!centered) return false;
      objects.push(centered);
      return true;
    }

    const candidates =
      template.placement === "wall-adjacent"
        ? wallAdjacentRoomCells(room)
        : room.cells.filter((cell) => !roomDoorKeys(room).has(positionKey(cell)));
    const position = randomOpenCell(candidates, blockedKeys);
    if (!position) return false;

    const object = createFeatureObject(type, position, objectId(type), themeId);
    if (objectOverlaps(object, blockedKeys) || objectTouchesBlockedCell(object, blockedKeys)) return false;
    objects.push(object);
    if (objectBlocksMovement(object)) objectCells(object).forEach((cell) => blockedKeys.add(positionKey(cell)));
    return true;
  };

  for (const room of dungeon.rooms ?? []) {
    for (const type of allowedFurniture) {
      const template = objectTemplate(type);
      if (!template || template.kind === "trap" || template.placement === "paired-dungeon-cells") continue;
      const fallbackChance = type === "table" ? 0.5 : type === "bigRock" ? 0.18 : type === "chest" ? 0.2 : 0.08;
      if (Math.random() < objectSpawnChance(type, fallbackChance, themeId)) placeObjectInRoom(type, room);
    }

    if (floorTrapIds.length && Math.random() < (trapSettings.roomChance ?? 0.28)) {
      const position = randomOpenCell(room.cells.filter((cell) => !roomDoorKeys(room).has(positionKey(cell))), blockedKeys);
      if (position) {
        const type = floorTrapIds[Math.floor(Math.random() * floorTrapIds.length)];
        objects.push(createFeatureObject(type, position, objectId(type), themeId));
      }
    }
  }

  for (const corridor of dungeon.corridors ?? []) {
    if (floorTrapIds.length && Math.random() < (trapSettings.corridorChance ?? 0.035) && !blockedKeys.has(positionKey(corridor))) {
      const type = floorTrapIds[Math.floor(Math.random() * floorTrapIds.length)];
      objects.push(createFeatureObject(type, corridor, objectId(type), themeId));
    }
  }

  if (allowedFurniture.has("portal")) {
    tryCreatePortalPair(dungeon, blockedKeys, objects, objectId, themeId);
  }

  return objects;
}

function getItemTemplate(itemId) {
  return getContentDefinition("items", itemId);
}

function defaultEquipment() {
  return Object.fromEntries(equipmentSlots.map((slot) => [slot.id, null]));
}

function cloneData(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function wildShapeBeastById(beastId) {
  return (window.DungeonDruidWildShape?.beasts ?? []).find((beast) => beast.id === beastId) ?? null;
}

function wildShapeUnlockedBeasts(fighter) {
  if (fighter?.classId !== "druid" || (fighter.level ?? 1) < 2) return [];
  const level = fighter.level ?? 1;
  const unlockedIds = new Set(
    (window.DungeonDruidWildShape?.unlocks ?? [])
      .filter((unlock) => level >= (unlock.druidLevel ?? 1))
      .flatMap((unlock) => unlock.beastIds ?? []),
  );
  return (window.DungeonDruidWildShape?.beasts ?? []).filter((beast) => unlockedIds.has(beast.id));
}

function wildShapePrimaryAction(beast) {
  return (beast?.actions ?? []).find((action) => action.type === "meleeWeaponAttack" || action.type === "rangedWeaponAttack") ?? null;
}

function wildShapeHasMultiattack(beast) {
  return (beast?.actions ?? []).some((action) => action.name === "Multiattack");
}

function parseWildShapeDamage(action = {}) {
  const match = String(action.damage ?? "").match(/(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/i);
  if (!match) return { count: 1, sides: 4, bonus: 0, type: action.damageType ?? "bludgeoning" };
  const bonus = Number(match[4] ?? 0) * (match[3] === "-" ? -1 : 1);
  return { count: Number(match[1]), sides: Number(match[2]), bonus, type: action.damageType ?? "bludgeoning" };
}

function wildShapeDamageProfile(beast) {
  const action = wildShapePrimaryAction(beast);
  const damage = parseWildShapeDamage(action);
  const range = action?.type === "rangedWeaponAttack"
    ? { kind: "ranged", feet: Number(String(action.range ?? "30").split("/")[0]) || 30 }
    : { kind: "melee", feet: action?.reach ?? 5 };
  return {
    ...damage,
    range,
    attackType: "weapon",
    weaponName: action?.name ?? "Beast Attack",
    actionName: action?.name ?? "Beast Attack",
    effects: cloneData(action?.effects ?? []),
    label: formatDamage({ ...damage, range }),
  };
}

function wildShapeDurationTurns(fighter) {
  return null;
}

function isWildShaped(fighter) {
  return Boolean(fighter?.wildShapeState?.beastFormId);
}

function revertWildShape(fighter, options = {}) {
  const stateData = fighter?.wildShapeState;
  if (!fighter || !stateData) return false;
  const overflowDamage = Math.max(0, Math.floor(options.overflowDamage ?? 0));
  const original = stateData.originalStats ?? {};
  fighter.hp = Math.max(0, (stateData.originalHp ?? original.hp ?? fighter.hp ?? 0) - overflowDamage);
  fighter.maxHp = original.maxHp ?? fighter.maxHp;
  fighter.baseMaxHp = original.baseMaxHp ?? fighter.baseMaxHp;
  fighter.baseAc = original.baseAc ?? fighter.baseAc;
  fighter.ac = original.ac ?? fighter.ac;
  fighter.baseSpeedFeet = original.baseSpeedFeet ?? fighter.baseSpeedFeet;
  fighter.speedFeet = original.speedFeet ?? fighter.speedFeet;
  fighter.abilityScores = cloneData(original.abilityScores);
  fighter.abilityMods = cloneData(original.abilityMods ?? {});
  fighter.baseDamage = cloneData(original.baseDamage ?? fighter.baseDamage);
  fighter.damage = cloneData(original.damage ?? fighter.damage);
  fighter.attackBonus = original.attackBonus ?? fighter.attackBonus;
  fighter.baseAttackAbilityMod = original.baseAttackAbilityMod ?? fighter.baseAttackAbilityMod;
  fighter.specialAbility = cloneData(original.specialAbility ?? fighter.specialAbility ?? []);
  fighter.senses = cloneData(original.senses ?? fighter.senses ?? {});
  fighter.skills = cloneData(original.skills ?? fighter.skills ?? {});
  fighter.size = original.size ?? fighter.size;
  fighter.type = original.type ?? fighter.type;
  fighter.token = original.token ?? fighter.token;
  fighter.tokenArt = original.tokenArt ?? fighter.tokenArt;
  fighter.wildShapeState = null;
  fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => effect.id !== "wild-shape");
  refreshDerivedStats(fighter);
  if (overflowDamage > 0) {
    addLog(`${fighter.name} reverts from Wild Shape and ${overflowDamage} overflow damage carries over.`, "important");
  } else {
    addLog(`${fighter.name} reverts from Wild Shape.`, "important");
  }
  return true;
}

function applyWildShape(fighter, beastId) {
  const beast = wildShapeBeastById(beastId);
  if (!fighter || !beast || isWildShaped(fighter)) return false;
  const keepScores = {
    int: baseAbilityScore(fighter, "int"),
    wis: baseAbilityScore(fighter, "wis"),
    cha: baseAbilityScore(fighter, "cha"),
  };
  const damage = wildShapeDamageProfile(beast);
  fighter.wildShapeState = {
    originalHp: fighter.hp,
    originalStats: {
      hp: fighter.hp,
      maxHp: fighter.maxHp,
      baseMaxHp: fighter.baseMaxHp,
      ac: fighter.ac,
      baseAc: fighter.baseAc,
      speedFeet: fighter.speedFeet,
      baseSpeedFeet: fighter.baseSpeedFeet,
      abilityScores: cloneData(fighter.abilityScores),
      abilityMods: cloneData(fighter.abilityMods),
      baseDamage: cloneData(fighter.baseDamage),
      damage: cloneData(fighter.damage),
      attackBonus: fighter.attackBonus,
      baseAttackAbilityMod: fighter.baseAttackAbilityMod,
      specialAbility: cloneData(fighter.specialAbility ?? []),
      senses: cloneData(fighter.senses ?? {}),
      skills: cloneData(fighter.skills ?? {}),
      size: fighter.size,
      type: fighter.type,
      token: fighter.token,
      tokenArt: fighter.tokenArt,
    },
    originalAC: fighter.ac,
    originalSpeed: fighter.speedFeet,
    originalActions: cloneData(fighter.actions ?? []),
    beastFormId: beast.id,
    beastCurrentHp: beast.hp,
    remainingDurationTurns: wildShapeDurationTurns(fighter),
  };
  fighter.baseMaxHp = beast.hp;
  fighter.maxHp = beast.hp;
  fighter.hp = beast.hp;
  fighter.baseAc = beast.ac;
  fighter.baseSpeedFeet = beast.speed?.walk ?? 30;
  fighter.abilityScores = { ...beast.abilityScores, ...keepScores };
  fighter.abilityMods = abilityModsFromScores(fighter.abilityScores);
  fighter.attackBonus = wildShapePrimaryAction(beast)?.attackBonus ?? fighter.attackBonus;
  fighter.baseAttackAbilityMod = abilityMod(fighter, "str");
  fighter.baseDamage = damage;
  fighter.damage = damage;
  fighter.specialAbility = (beast.traits ?? []).map((trait) => trait.name);
  fighter.senses = cloneData(beast.senses ?? {});
  fighter.skills = cloneData(beast.skills ?? {});
  fighter.size = beast.size;
  fighter.type = beast.type;
  fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => effect.id !== "wild-shape");
  fighter.statusEffects.push({ id: "wild-shape", label: `Wild Shape: ${beast.name}` });
  endConcentration(fighter, "Wild Shape");
  refreshDerivedStats(fighter);
  return true;
}

function normalizeItem(item) {
  const templateId = item?.baseItemId ?? item?.itemId;
  const aliasedId = typeof item === "string" ? itemAliases[item] ?? item : itemAliases[templateId] ?? templateId;
  if (typeof item === "string") {
    const template = cloneData(getItemTemplate(aliasedId));
    return template ? { ...template, baseItemId: aliasedId } : { id: aliasedId, baseItemId: aliasedId, name: aliasedId, type: "item", slots: [] };
  }
  if (templateId) {
    const template = cloneData(getItemTemplate(aliasedId) ?? {});
    let finalId = item.id ?? aliasedId;
    // Generate unique ID for items without one (to prevent ID collisions when multiple items share the same template)
    if (!item.id && item !== template) {
      adminItemInstanceCounter += 1;
      finalId = `item-${aliasedId}-${Date.now()}-${adminItemInstanceCounter}`;
    }
    return { ...template, ...cloneData(item), id: finalId, baseItemId: aliasedId };
  }
  return cloneData(item);
}

function starterEquipmentItem(itemId) {
  return {
    id: itemId,
    itemId,
    starterEquipment: true,
    sell: { valueCp: 0, rate: 0 },
  };
}

function starterEquipmentItems(itemIds = []) {
  return itemIds.map((itemId) => (typeof itemId === "string" ? starterEquipmentItem(itemId) : { ...itemId, starterEquipment: true, sell: { ...(itemId.sell ?? {}), valueCp: 0, rate: 0 } }));
}

function normalizeEquipment(equipment = {}) {
  const normalized = { ...defaultEquipment(), ...equipment };
  for (const slot of equipmentSlots) {
    normalized[slot.id] = itemAliases[normalized[slot.id]] ?? normalized[slot.id];
  }
  return normalized;
}

function defaultHeroItems(fighter = null) {
  return starterEquipmentItems(getHeroTemplate(fighter?.classId).inventory?.items ?? []).map(normalizeItem);
}

function normalizeInventory(template = {}) {
  const sourceMoney = template.money ?? {};
  const money = normalizeMoney({
    cp: sourceMoney.cp ?? 0,
    sp: (sourceMoney.sp ?? 0) + (sourceMoney.ep ?? 0) * 5,
    gp: (sourceMoney.gp ?? 0) + (sourceMoney.pp ?? 0) * 10,
  });
  const heroTokens = Math.max(0, Math.floor(template.heroTokens ?? 0));
  const items = Array.isArray(template.items) ? template.items.map((item) => ensureItemCharges(normalizeItem(item))) : [];
  
  // Ensure duplicate items have unique IDs
  const idCounts = {};
  for (const item of items) {
    idCounts[item.id] = (idCounts[item.id] ?? 0) + 1;
  }
  const duplicateIds = Object.keys(idCounts).filter(id => idCounts[id] > 1);
  
  if (duplicateIds.length > 0) {
    let duplicateIndex = 0;
    for (let i = 0; i < items.length; i++) {
      if (duplicateIds.includes(items[i].id)) {
        if (duplicateIndex > 0) {
          adminItemInstanceCounter += 1;
          items[i].id = `item-${items[i].baseItemId ?? items[i].id}-${Date.now()}-${adminItemInstanceCounter}`;
        }
        duplicateIndex += 1;
      }
    }
  }
  
  return { money, heroTokens, items };
}

function moneyToCp(money = {}) {
  return (money.cp ?? 0) + (money.sp ?? 0) * 10 + (money.gp ?? 0) * 100 + (money.pp ?? 0) * 1000;
}

function cpToMoney(totalCp) {
  let remaining = Math.max(0, Math.floor(totalCp));
  const gp = Math.floor(remaining / 100);
  remaining -= gp * 100;
  const sp = Math.floor(remaining / 10);
  remaining -= sp * 10;
  return { gp, sp, cp: remaining };
}

function normalizeMoney(money = {}) {
  return cpToMoney(moneyToCp(money));
}

function addMoney(money, cpAmount) {
  const normalized = cpToMoney(moneyToCp(money) + cpAmount);
  money.gp = normalized.gp;
  money.sp = normalized.sp;
  money.cp = normalized.cp;
  delete money.ep;
  delete money.pp;
}

function ammoStackLimit(item) {
  return item?.type === "ammunition" ? 20 : Infinity;
}

function updateAmmoStackName(item) {
  if (!item?.ammo) return item;
  const kind = item.ammo.kind ?? "ammo";
  const label = kind === "bolt" ? "Crossbow Bolts" : `${kind[0]?.toUpperCase() ?? "A"}${kind.slice(1)}s`;
  item.name = `${label} (${item.ammo.quantity ?? 0})`;
  return item;
}

function addItemToInventory(fighter, item, prefix = "stack") {
  if (!fighter || !item) return [];
  if (item.type !== "ammunition" || !item.ammo?.kind) {
    fighter.inventory.items.push(item);
    return [item];
  }

  const added = [];
  let remaining = Math.max(0, item.ammo.quantity ?? 0);
  const limit = ammoStackLimit(item);
  for (const stack of fighter.inventory.items) {
    if (remaining <= 0) break;
    if (stack.type !== "ammunition" || stack.ammo?.kind !== item.ammo.kind) continue;
    if (Boolean(stack.starterEquipment) !== Boolean(item.starterEquipment)) continue;
    const room = Math.max(0, limit - (stack.ammo.quantity ?? 0));
    if (room <= 0) continue;
    const moved = Math.min(room, remaining);
    stack.ammo.quantity = (stack.ammo.quantity ?? 0) + moved;
    updateAmmoStackName(stack);
    remaining -= moved;
  }

  while (remaining > 0) {
    const quantity = Math.min(limit, remaining);
    const stack =
      remaining === (item.ammo.quantity ?? 0)
        ? item
        : createItemInstance(item.baseItemId ?? item.itemId ?? item.id, prefix);
    if (!stack) break;
    stack.ammo = { ...(stack.ammo ?? {}), kind: item.ammo.kind, quantity };
    updateAmmoStackName(stack);
    fighter.inventory.items.push(stack);
    added.push(stack);
    remaining -= quantity;
  }

  return added;
}

function spendMoney(money, cpAmount) {
  if (moneyToCp(money) < cpAmount) return false;
  addMoney(money, -cpAmount);
  return true;
}

function createItemInstance(templateId, prefix = "item") {
  const template = getItemTemplate(templateId);
  if (!template) return null;

  adminItemInstanceCounter += 1;
  return ensureItemCharges(normalizeItem({
    ...template,
    id: `${prefix}-${templateId}-${Date.now()}-${adminItemInstanceCounter}`,
    baseItemId: templateId,
  }));
}

function ensureStarterHeroEquipment(fighter) {
  if (fighter.id !== "hero") return;

  if ((fighter.inventory.items ?? []).length === 0) {
    const starterItems = defaultHeroItems(fighter);
    const itemIds = new Set(fighter.inventory.items.map((item) => item.id));
    for (const item of starterItems) {
      if (!itemIds.has(item.id)) fighter.inventory.items.push(item);
    }
  }

  const templateEquipment = getHeroTemplate(fighter.classId).equipment ?? {};
  for (const slot of equipmentSlots) {
    if (fighter.equipment[slot.id] === undefined) {
      fighter.equipment[slot.id] = templateEquipment[slot.id] ?? null;
    }
  }
}

function itemForId(fighter, itemId) {
  if (!itemId) return null;
  return fighter?.inventory?.items?.find((item) => item.id === itemId) ?? null;
}

function chestItemForId(itemId) {
  return (state.chest ?? []).find((item) => item.id === itemId) ?? null;
}

function itemCanUseSlot(item, slotId) {
  return Array.isArray(item?.slots) && item.slots.includes(slotId);
}

function normalizedItemProficiencyId(item) {
  return String(item?.baseEquipmentId ?? item?.baseItemId ?? item?.itemId ?? item?.id ?? "").replace(/-\d+$/, "").toLowerCase();
}

function weaponProficiencyAliases(item) {
  const id = normalizedItemProficiencyId(item);
  const aliases = {
    "light-hammer": ["throwing hammer"],
    "crossbow-light": ["light crossbow"],
    "crossbow-hand": ["hand crossbow"],
    "crossbow-heavy": ["heavy crossbow"],
  };
  return proficiencyEntries([id, ...(aliases[id] ?? [])]);
}

function heroHasWeaponProficiency(fighter, item) {
  if (!item?.damage || item.type !== "weapon") return true;
  if (!isPartyHeroId(fighter?.id)) return true;
  const proficiencies = new Set(proficiencyEntries(fighter.weaponProficiencies ?? []));
  const training = String(item.category ?? "").split(" ")[0];
  if (training && proficiencies.has(training)) return true;
  return weaponProficiencyAliases(item).some((entry) => proficiencies.has(entry));
}

function heroHasArmorProficiency(fighter, item) {
  if (item?.type !== "armor") return true;
  if (!isPartyHeroId(fighter?.id)) return true;
  const proficiencies = new Set(proficiencyEntries(fighter.armorProficiencies ?? []));
  const category = String(item.category ?? "").toLowerCase();
  if (category === "shield") return proficiencies.has("shield");
  return proficiencies.has(category);
}

function missingProficiencyText(fighter, item) {
  if (item?.type === "weapon" && !heroHasWeaponProficiency(fighter, item)) {
    return `Missing weapon proficiency: attacks with ${item.name} do not add proficiency bonus.`;
  }
  if (item?.type === "armor" && !heroHasArmorProficiency(fighter, item)) {
    return `Missing armor proficiency: ${fighter?.name ?? "This hero"} cannot equip ${item.name}.`;
  }
  return "";
}

function itemCanEquipInSlot(fighter, item, slotId) {
  return itemCanUseSlot(item, slotId) && armorStrengthRequirementMet(fighter, item) && heroHasArmorProficiency(fighter, item);
}

function isHandSlot(slotId) {
  return ["mainHand", "offHand"].includes(slotId);
}

function isBeltSlot(slotId) {
  return slotId.startsWith("belt");
}

function equippedItem(fighter, slotId) {
  return itemForId(fighter, fighter.equipment?.[slotId]);
}

function equippedMagicItems(fighter) {
  if (!fighter?.equipment) return [];
  const seen = new Set();
  return equipmentSlots
    .map((slot) => equippedItem(fighter, slot.id))
    .filter((item) => {
      if (!item?.magic || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

function magicEffects(fighter) {
  const merged = {
    abilityScoreBonuses: {},
    abilityScorePenalties: {},
    abilityScoreCaps: {},
    maxHpBonus: 0,
    acBonus: 0,
    initiativeBonus: 0,
    speedBonusFeet: 0,
    attackBonus: 0,
    damageBonus: 0,
    resistances: [],
    vulnerabilities: [],
    extraDamage: [],
  };

  for (const item of equippedMagicItems(fighter)) {
    const effects = item.magic?.effects ?? {};
    for (const [ability, value] of Object.entries(effects.abilityScoreBonuses ?? {})) {
      merged.abilityScoreBonuses[ability] = (merged.abilityScoreBonuses[ability] ?? 0) + value;
    }
    for (const [ability, value] of Object.entries(effects.abilityScorePenalties ?? {})) {
      merged.abilityScorePenalties[ability] = (merged.abilityScorePenalties[ability] ?? 0) + value;
    }
    for (const [ability, value] of Object.entries(effects.abilityScoreCaps ?? {})) {
      merged.abilityScoreCaps[ability] = Math.max(merged.abilityScoreCaps[ability] ?? 0, value);
    }
    merged.maxHpBonus += effects.maxHpBonus ?? 0;
    merged.initiativeBonus += effects.initiativeBonus ?? 0;
    merged.speedBonusFeet += effects.speedBonusFeet ?? 0;
    if (magicAcBonusApplies(fighter, item)) merged.acBonus += effects.acBonus ?? 0;
    if (magicAttackConditionApplies(fighter, effects.attackBonusCondition)) merged.attackBonus += effects.attackBonus ?? 0;
    if (magicAttackConditionApplies(fighter, effects.damageBonusCondition)) merged.damageBonus += effects.damageBonus ?? 0;
    merged.resistances.push(...(effects.resistances ?? []), ...(item.magic?.resistances ?? []));
    merged.vulnerabilities.push(...(effects.vulnerabilities ?? []), ...(item.magic?.vulnerabilities ?? []));
    if (magicAttackConditionApplies(fighter, effects.extraDamageCondition)) merged.extraDamage.push(...(effects.extraDamage ?? []));
  }

  merged.resistances = Array.from(new Set(merged.resistances));
  merged.vulnerabilities = Array.from(new Set(merged.vulnerabilities));
  return merged;
}

function magicAcBonusApplies(fighter, item) {
  const condition = item.magic?.effects?.acBonusCondition;
  if (!condition) return true;
  if (condition.includes("no torso armor") || condition.includes("no shield")) {
    return !equippedItem(fighter, "torso") && !equippedItem(fighter, "offHand")?.armor?.bonus;
  }
  return true;
}

function magicAttackConditionApplies(fighter, condition = "") {
  if (!condition) return true;
  const weapon = activeWeapon(fighter);
  const ranged = weaponIsRanged(weapon) || weapon?.range?.kind === "ranged";
  const normalized = condition.toLowerCase();
  if (normalized.includes("ranged")) return ranged;
  if (normalized.includes("melee")) return !ranged;
  return true;
}

function baseAbilityScore(fighter, ability) {
  if (fighter?.abilityScores?.[ability] || fighter?.abilityScores?.[ability] === 0) return fighter.abilityScores[ability];
  if (fighter?.abilityMods?.[ability] || fighter?.abilityMods?.[ability] === 0) return fighter.abilityMods[ability] * 2 + 10;
  return 10;
}

function abilityMod(fighter, ability) {
  return scoreToMod(abilityScore(fighter, ability));
}

function abilityScore(fighter, ability) {
  if (isWildShaped(fighter)) return baseAbilityScore(fighter, ability);
  const effects = magicEffects(fighter);
  const value = baseAbilityScore(fighter, ability) + (effects.abilityScoreBonuses[ability] ?? 0) + (effects.abilityScorePenalties[ability] ?? 0);
  const cap = effects.abilityScoreCaps[ability];
  return cap ? Math.min(cap, value) : value;
}

function xpForNextLevel(level) {
  const thresholds = {
    1: 300,
    2: 900,
    3: 2700,
    4: 6500,
    5: 14000,
    6: 23000,
    7: 34000,
    8: 48000,
    9: 64000,
    10: 85000,
    11: 100000,
    12: 120000,
    13: 140000,
    14: 165000,
    15: 195000,
    16: 225000,
    17: 265000,
    18: 305000,
    19: 355000,
  };
  return thresholds[level] ?? Infinity;
}

function canLevelUp(hero = state.fighters.hero) {
  return (hero.xp ?? 0) >= xpForNextLevel(hero.level ?? 1);
}

function attackAbilityForWeapon(weapon, fighter = null) {
  if (!weapon) return "str";
  if (weapon.weaponRange === "ranged" || weapon.range?.kind === "ranged") return "dex";
  if (fighter && weapon.properties?.includes("finesse") && abilityMod(fighter, "dex") > abilityMod(fighter, "str")) return "dex";
  return "str";
}

function attackAbilityForUnarmed(fighter = null) {
  return fighter?.classId === "monk" && abilityMod(fighter, "dex") > abilityMod(fighter, "str") ? "dex" : "str";
}

function monsterThrownUsesRemaining(fighter, weapon) {
  if (isPartyHeroId(fighter?.id) || !weapon?.properties?.includes("thrown")) return Infinity;
  return Math.max(0, 4 - (fighter.thrownWeaponUses?.[weapon.id] ?? 0));
}

function monsterCanThrowWeapon(fighter, weapon) {
  return monsterThrownUsesRemaining(fighter, weapon) > 0;
}

function recordMonsterThrownWeaponUse(fighter, weapon) {
  if (isPartyHeroId(fighter?.id) || !weapon?.properties?.includes("thrown")) return;
  fighter.thrownWeaponUses = { ...(fighter.thrownWeaponUses ?? {}) };
  fighter.thrownWeaponUses[weapon.id] = (fighter.thrownWeaponUses[weapon.id] ?? 0) + 1;
}

function weaponIsRanged(weapon) {
  return weapon?.weaponRange === "ranged" || weapon?.range?.kind === "ranged";
}

function fighterHasStyle(fighter, styleId) {
  return fighter?.fightingStyle === styleId || (fighter?.fightingStyles ?? []).includes(styleId);
}

function attackBonus(fighter) {
  return attackBonusForWeapon(fighter, activeWeapon(fighter));
}

function attackBonusForWeapon(fighter, weapon = activeWeapon(fighter)) {
  const statusBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.attackBonus ?? 0), 0);
  if (isWildShaped(fighter)) return (fighter.attackBonus ?? 0) + statusBonus;
  const unarmed = !weapon?.damage;
  const ability = abilityMod(fighter, unarmed ? attackAbilityForUnarmed(fighter) : attackAbilityForWeapon(weapon, fighter));
  const magicBonus = (weapon?.magic?.attackBonus ?? 0) + magicEffects(fighter).attackBonus + statusBonus;
  const styleBonus = fighterHasStyle(fighter, "archery") && weaponIsRanged(weapon) ? 2 : 0;
  if (isPartyHeroId(fighter?.id) && unarmed) {
    return ability + proficiencyBonus(fighter) + magicBonus + styleBonus;
  }
  if (isPartyHeroId(fighter?.id) && weapon?.type === "weapon") {
    return ability + (heroHasWeaponProficiency(fighter, weapon) ? proficiencyBonus(fighter) : 0) + magicBonus + styleBonus;
  }
  const baseBonus = fighter.attackBonus ?? 0;
  const baseAbility = fighter.baseAttackAbilityMod ?? abilityMod(fighter, "str");
  return baseBonus - baseAbility + ability + magicBonus + styleBonus;
}

function formatDamage(damage) {
  if (damage.flat) {
    const bonusText = damage.bonus === 0 ? "" : ` ${abilityLabel(damage.bonus)}`;
    return `${damage.flat}${bonusText}${damage.type ? ` ${damage.type}` : ""}`;
  }

  const bonus = damage.bonus ?? 0;
  const bonusText = bonus === 0 ? "" : ` ${abilityLabel(bonus)}`;
  return `${damage.count}d${damage.sides}${bonusText}${damage.type ? ` ${damage.type}` : ""}`;
}

function damageFlagMatches(flags, type) {
  if (!type) return false;
  const normalizedType = String(type).toLowerCase();
  const entries = Array.isArray(flags) ? flags : flags ? [flags] : [];
  return entries.some((flag) => String(flag).toLowerCase() === normalizedType);
}

function calculateDamageModifiers(target, damage, type) {
  const normalizedType = String(type ?? "").toLowerCase();
  if (!normalizedType) return { damage, reason: null };
  const effects = magicEffects(target);
  const statusResistances = (target.statusEffects ?? []).flatMap((effect) => effect.resistances ?? []);
  const statusVulnerabilities = (target.statusEffects ?? []).flatMap((effect) => effect.vulnerabilities ?? []);
  const resistances = [...(target.damageResistances ?? []), ...effects.resistances, ...statusResistances];
  const vulnerabilities = [...(target.damageVulnerabilities ?? []), ...effects.vulnerabilities, ...statusVulnerabilities];
  if ((target.statusEffects ?? []).some((effect) => effect.id === "rage") && ["bludgeoning", "piercing", "slashing"].includes(normalizedType)) {
    resistances.push(normalizedType);
  }

  if (damageFlagMatches(target.damageImmunities, normalizedType)) {
    return { damage: 0, reason: "immune" };
  }

  const vulnerable = damageFlagMatches(vulnerabilities, normalizedType);
  const resistant = damageFlagMatches(resistances, normalizedType);
  if (vulnerable && resistant) return { damage, reason: "resistance and vulnerability cancel" };
  if (vulnerable) return { damage: damage * 2, reason: "vulnerable" };
  if (resistant) return { damage: Math.floor(damage / 2), reason: "resistant" };

  return { damage, reason: null };
}

function activeWeapon(fighter) {
  if (isWildShaped(fighter)) return null;
  return equippedItem(fighter, "mainHand") ?? equippedItem(fighter, "offHand");
}

function weaponFromSlot(fighter, slotId = "mainHand") {
  return equippedItem(fighter, slotId);
}

function activeMeleeWeapon(fighter) {
  const weapons = [equippedItem(fighter, "mainHand"), equippedItem(fighter, "offHand")].filter(Boolean);
  return weapons.find((weapon) => weapon.damage && !weaponIsRanged(weapon) && weapon.range?.kind !== "ranged") ?? null;
}

function monkMartialArtsDamageDie(fighter) {
  const level = fighter?.level ?? 1;
  return level >= 17 ? 10 : level >= 11 ? 8 : level >= 5 ? 6 : 4;
}

function unarmedDamageProfile(fighter) {
  const attackAbility = attackAbilityForUnarmed(fighter);
  const damage =
    fighter?.classId === "monk"
      ? {
          count: 1,
          sides: monkMartialArtsDamageDie(fighter),
          bonus: abilityMod(fighter, attackAbility) + magicEffects(fighter).damageBonus,
          type: "bludgeoning",
          range: { kind: "melee", feet: 5 },
          extraDamage: magicEffects(fighter).extraDamage,
        }
      : {
          flat: 1,
          count: 0,
          sides: 0,
          bonus: abilityMod(fighter, "str") + magicEffects(fighter).damageBonus,
          type: "bludgeoning",
          range: { kind: "melee", feet: 5 },
          extraDamage: magicEffects(fighter).extraDamage,
        };
  return { ...damage, label: formatDamage(damage), attackAbility, weaponName: "Unarmed Strike" };
}

function unarmedDamageProfileWithOptions(fighter, options = {}) {
  const profile = unarmedDamageProfile(fighter);
  if (options.includeDamageModifier !== false) return profile;
  const damage = {
    ...profile,
    bonus: magicEffects(fighter).damageBonus,
  };
  return { ...damage, label: formatDamage(damage) };
}

function damageProfile(fighter, options = {}) {
  const weapon = options.weapon ?? activeWeapon(fighter);
  const includeDamageModifier = options.includeDamageModifier !== false;
  const statusDamageBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.damageBonus ?? 0), 0);
  if (isWildShaped(fighter)) {
    const damage = {
      ...(fighter.baseDamage ?? wildShapeDamageProfile(wildShapeBeastById(fighter.wildShapeState?.beastFormId))),
      bonus: (fighter.baseDamage?.bonus ?? 0) + statusDamageBonus,
    };
    return { ...damage, label: formatDamage(damage) };
  }
  if (!options.forceThrown && !isPartyHeroId(fighter?.id) && weapon?.properties?.includes("thrown") && weapon.range?.kind === "thrown" && !monsterCanThrowWeapon(fighter, weapon)) {
    return {
      ...weapon.damage,
      bonus: (includeDamageModifier ? abilityMod(fighter, "str") : 0) + (weapon.magic?.damageBonus ?? 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
      range: { kind: "melee", feet: 5 },
      extraDamage: [...(weapon.magic?.extraDamage ?? []), ...magicEffects(fighter).extraDamage],
      label: formatDamage({
        ...weapon.damage,
        bonus: (includeDamageModifier ? abilityMod(fighter, "str") : 0) + (weapon.magic?.damageBonus ?? 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
      }),
    };
  }
  if (!weapon?.damage) {
    if (!isPartyHeroId(fighter?.id) && (fighter.baseDamage?.count || fighter.baseDamage?.flat)) {
      const damage = {
        flat: fighter.baseDamage.flat,
        count: fighter.baseDamage.count ?? 0,
        sides: fighter.baseDamage.sides ?? 0,
        bonus: (includeDamageModifier ? (fighter.baseDamage.bonus ?? 0) : 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
        type: fighter.baseDamage.type,
        range: fighter.baseDamage.range ?? { kind: "melee", feet: 5 },
        weaponName: fighter.baseDamage.weaponName,
        extraDamage: magicEffects(fighter).extraDamage,
      };
      return { ...damage, label: formatDamage(damage) };
    }
    const damage = unarmedDamageProfileWithOptions(fighter, { includeDamageModifier });
    damage.bonus = (damage.bonus ?? 0) + statusDamageBonus;
    damage.label = formatDamage(damage);
    return damage;
  }

  const bonusAbility = attackAbilityForWeapon(weapon, fighter);
  const bonus = includeDamageModifier ? abilityMod(fighter, bonusAbility) : 0;
  const oneHandingVersatile = weapon.properties?.includes("versatile") && !equippedItem(fighter, "offHand");
  const damageDice = oneHandingVersatile ? weapon.propertyData?.versatile ?? weapon.damage : weapon.damage;
  const offHand = equippedItem(fighter, "offHand");
  const duelingBonus = fighterHasStyle(fighter, "dueling") && !weaponIsRanged(weapon) && (!offHand || offHand.armor) && !weapon.properties?.includes("two-handed") ? 2 : 0;
  const greatWeaponBonus = fighterHasStyle(fighter, "greatWeaponFighting") && !weaponIsRanged(weapon) && weapon.properties?.includes("two-handed") ? 1 : 0;
  const damage = {
    flat: damageDice.flat,
    count: damageDice.count ?? 0,
    sides: damageDice.sides ?? 0,
    bonus: bonus + duelingBonus + greatWeaponBonus + (weapon.magic?.damageBonus ?? 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
    type: weapon.damage.type,
    range: weapon.range ?? { kind: "melee", feet: 5 },
    extraDamage: [...(weapon.magic?.extraDamage ?? []), ...magicEffects(fighter).extraDamage],
  };
  return { ...damage, label: formatDamage(damage) };
}

function opportunityAttackProfile(fighter) {
  const weapon = activeMeleeWeapon(fighter);
  if (weapon) {
    return {
      ...damageProfile({ ...fighter, equipment: { ...fighter.equipment, mainHand: weapon.id, offHand: fighter.equipment?.offHand } }),
      attackAbility: attackAbilityForWeapon(weapon, fighter),
      weaponName: weapon.name,
      weapon,
    };
  }

  const baseRange = fighter.baseDamage?.range ?? { kind: "melee", feet: 5 };
  if (!activeWeapon(fighter) && baseRange.kind !== "ranged" && (fighter.baseDamage?.count || fighter.baseDamage?.flat)) {
    const damage = {
      flat: fighter.baseDamage.flat,
      count: fighter.baseDamage.count ?? 0,
      sides: fighter.baseDamage.sides ?? 0,
      bonus: fighter.baseDamage.bonus ?? 0,
      type: fighter.baseDamage.type,
      range: baseRange,
    };
    return { ...damage, label: formatDamage(damage), attackAbility: "str", weaponName: fighter.baseDamage.weaponName ?? "Melee Attack" };
  }

  return unarmedDamageProfile(fighter);
}

function armorClass(fighter) {
  if (isWildShaped(fighter)) {
    const statusAc = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.acBonus ?? 0), 0);
    return (fighter.baseAc ?? fighter.ac ?? 10) + statusAc;
  }
  const torso = equippedItem(fighter, "torso");
  const armor = armorStrengthRequirementMet(fighter, torso) && heroHasArmorProficiency(fighter, torso) ? torso?.armor : null;
  const shield = equippedItem(fighter, "offHand");
  const shieldBonus = heroHasArmorProficiency(fighter, shield) ? shield?.armor?.bonus ?? 0 : 0;
  const magicAc = magicEffects(fighter).acBonus;
  const statusAc = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.acBonus ?? 0), 0);
  const styleAc = fighterHasStyle(fighter, "defense") && Boolean(torso?.armor?.base) ? 1 : 0;
  const wearingArmor = Boolean(torso?.armor?.base);
  if (!wearingArmor && fighter?.classId === "monk" && !shield?.armor?.bonus) {
    return 10 + abilityMod(fighter, "dex") + abilityMod(fighter, "wis") + magicAc + statusAc + styleAc;
  }
  if (!wearingArmor && fighter?.classId === "barbarian") {
    return 10 + abilityMod(fighter, "dex") + abilityMod(fighter, "con") + shieldBonus + magicAc + statusAc + styleAc;
  }
  if (!armor?.base) return (fighter.baseAc ?? 10) + abilityMod(fighter, "dex") + shieldBonus + magicAc + statusAc + styleAc;

  const dex = abilityMod(fighter, "dex");
  const dexBonus = armor.dex === "full" ? dex : armor.dex === "max2" ? Math.min(2, dex) : 0;
  return armor.base + dexBonus + shieldBonus + magicAc + statusAc + styleAc;
}

function itemRequiresTwoHands(item) {
  return item?.properties?.includes("two-handed");
}

function armorStrengthRequirementMet(fighter, item) {
  return !item?.requirements?.strength || abilityScore(fighter, "str") >= item.requirements.strength;
}

function fighterWearsHeavyArmor(fighter) {
  return equippedItem(fighter, "torso")?.category === "heavy";
}

function itemHasUsableAmmo(fighter, item) {
  if (!item?.properties?.includes("ammunition")) return true;
  const ammo = equippedItem(fighter, "quiver");
  return Boolean(ammo?.ammo?.quantity > 0 && (!ammo.ammo.kind || !item.ammoKind || ammo.ammo.kind === item.ammoKind));
}

function spendAmmunition(fighter, item) {
  if (!item?.properties?.includes("ammunition")) return true;
  const ammo = equippedItem(fighter, "quiver");
  if (!ammo?.ammo?.quantity || (ammo.ammo.kind && item.ammoKind && ammo.ammo.kind !== item.ammoKind)) return false;

  ammo.ammo.quantity = Math.max(0, ammo.ammo.quantity - 1);
  updateAmmoStackName(ammo);
  return true;
}

function hostileFightersAdjacentTo(fighter) {
  return Object.values(state.fighters).filter((candidate) => {
    if (!candidate.alive || candidate.id === fighter.id) return false;
    return hostileTo(fighter, candidate) && hasMeleeAccess(fighter, candidate);
  });
}

function refreshDerivedStats(fighter) {
  fighter.baseMaxHp = fighter.baseMaxHp ?? fighter.maxHp ?? 1;
  const effects = magicEffects(fighter);
  const statusSpeedBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.speedBonusFeet ?? 0), 0);
  const statusMaxHpBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.maxHpBonus ?? 0), 0);
  fighter.maxHp = isWildShaped(fighter) ? Math.max(1, fighter.baseMaxHp + statusMaxHpBonus) : Math.max(1, fighter.baseMaxHp + (effects.maxHpBonus ?? 0) + statusMaxHpBonus);
  if (fighter.hp > fighter.maxHp) fighter.hp = fighter.maxHp;
  fighter.speedFeet = isWildShaped(fighter)
    ? Math.max(5, (fighter.baseSpeedFeet ?? fighter.speedFeet ?? 30) + statusSpeedBonus)
    : Math.max(5, (fighter.baseSpeedFeet ?? fighter.speedFeet ?? 30) + (effects.speedBonusFeet ?? 0) + statusSpeedBonus);
  if (fighter.abilityScores) {
    fighter.abilityMods = abilityModsFromScores(fighter.abilityScores);
  }
  if (isPartyHeroId(fighter.id)) {
    fighter.initiativeBonus = abilityMod(fighter, "dex") + (effects.initiativeBonus ?? 0);
  }
  fighter.ac = armorClass(fighter);
  fighter.damage = damageProfile(fighter);
  fighter.currentAttackBonus = attackBonus(fighter);
  return fighter;
}

function createCombatant(template) {
  const combatant = {
    ...template,
    baseAc: template.baseAc ?? template.ac ?? 10,
    baseDamage: { ...template.damage },
    abilityScores: template.abilityScores ? { ...template.abilityScores } : undefined,
    abilityMods: { ...(template.abilityMods ?? {}) },
    baseAttackAbilityMod: template.baseAttackAbilityMod,
    level: template.level ?? 1,
    xp: template.xp ?? 0,
    hitDie: template.hitDie ?? 10,
    hitDiceRemaining: template.hitDiceRemaining ?? template.level ?? 1,
    baseMaxHp: template.baseMaxHp ?? template.maxHp,
    baseSpeedFeet: template.baseSpeedFeet ?? template.speedFeet,
    damage: { ...template.damage },
    equipment: normalizeEquipment(template.equipment),
    inventory: normalizeInventory(template.inventory),
    abilities: fighterAbilityDefinitions(template),
    abilityUses: { ...(template.abilityUses ?? {}) },
    casterType: template.casterType,
    spellcastingAbility: template.spellcastingAbility,
    spellPointProgression: template.spellPointProgression ? { ...template.spellPointProgression } : undefined,
    spellPointMax: template.spellPointMax,
    spellPoints: template.spellPoints,
    classSpellList: [...(template.classSpellList ?? template.spellList ?? template.spells ?? [])],
    classCantripList: [...(template.classCantripList ?? template.cantripList ?? [])],
    spells: [...(template.spells ?? [])],
    partyRole: template.partyRole ?? (template.id === "hero" ? "tank" : undefined),
    position: { ...template.position },
    hp: template.maxHp,
    alive: true,
    movementLeft: Math.floor((template.baseSpeedFeet ?? template.speedFeet) / feetPerSquare),
    hasAction: true,
    hasBonusAction: true,
    dodging: false,
    disengaged: false,
    canMoveThroughMonsters: false,
  };
  if (combatant.baseAttackAbilityMod === undefined) {
    combatant.baseAttackAbilityMod = scoreToMod(baseAbilityScore(combatant, attackAbilityForWeapon(activeWeapon(combatant), combatant)));
  }
  ensureStarterHeroEquipment(combatant);
  ensureFighterAbilityState(combatant);
  ensureSpellPointState(combatant);
  return refreshDerivedStats(combatant);
}

function spawnFloorKeysForDungeon(dungeon = state?.dungeon) {
  return new Set((dungeon?.walkable ?? []).map(positionKey));
}

function openRoomCellsForSpawn(room, blockedKeys = new Set(), gridSize = currentGridSize(), includeDoors = false, floorKeys = null) {
  const doorKeys = roomDoorKeys(room);
  return (room?.cells ?? []).filter((cell) => {
    const key = positionKey(cell);
    return (
      window.DungeonGrid.isInsideGrid(cell, gridSize) &&
      roomHasCell(room, cell) &&
      (!floorKeys || floorKeys.has(key)) &&
      (includeDoors || !doorKeys.has(key)) &&
      !blockedKeys.has(key)
    );
  });
}

function roomSpawnCells(room, blockedKeys = new Set(), gridSize = currentGridSize(), floorKeys = null) {
  const interiorCells = openRoomCellsForSpawn(room, blockedKeys, gridSize, false, floorKeys);
  return interiorCells.length ? interiorCells : openRoomCellsForSpawn(room, blockedKeys, gridSize, true, floorKeys);
}

function clusteredSpawnCells(room, count, origin, blockedKeys = new Set(), gridSize = currentGridSize(), floorKeys = null) {
  const openCells = roomSpawnCells(room, blockedKeys, gridSize, floorKeys);
  if (openCells.length === 0) return [];
  const openKeys = new Set(openCells.map(positionKey));
  const seeds = openCells
    .slice()
    .sort((a, b) => distance(b, origin) - distance(a, origin));

  for (const seed of seeds) {
    const cluster = [];
    const queue = [seed];
    const visited = new Set();
    while (queue.length > 0 && cluster.length < count) {
      const current = queue.shift();
      const key = positionKey(current);
      if (visited.has(key) || !openKeys.has(key)) continue;
      visited.add(key);
      cluster.push(current);
      adjacentCells(current)
        .filter((cell) => openKeys.has(positionKey(cell)) && !visited.has(positionKey(cell)))
        .sort((a, b) => distance(a, seed) - distance(b, seed))
        .forEach((cell) => queue.push(cell));
    }
    if (cluster.length >= Math.min(count, openCells.length)) return cluster;
  }

  return openCells.slice(0, count);
}

function safeRoomSpawnCell(room, origin, blockedKeys = new Set(), gridSize = currentGridSize(), floorKeys = null) {
  return clusteredSpawnCells(room, 1, origin, blockedKeys, gridSize, floorKeys)[0] ?? null;
}

function createMonsterForRoom(monsterTemplate, room, position, id, name, hero) {
  const monster = createCombatant({
    ...monsterTemplate,
    id,
    name,
  });
  applyMonsterCategoryScaling(monster, hero);
  monster.roomId = room.id;
  monster.position = { ...position };
  return monster;
}

function createDungeonMonsters(dungeon, heroPosition, hero, exitRoomId = "", dungeonObjects = [], themeId = currentThemeId()) {
  const monsters = {};
  const rooms = dungeon.rooms;
  const bossMonsterId = heroNeedsDungeonBoss(hero) ? bossMonsterIdForHero(hero, themeId) : null;
  const bossRoomId = bossMonsterId ? exitRoomId || createDungeonExit(dungeon, heroPosition).roomId : null;
  const monsterEntries = weightedMonsterIdsForHero(hero, themeId);
  const usedMonsterCounts = {};
  const floorKeys = spawnFloorKeysForDungeon(dungeon);
  const objectBlockedKeys = new Set(
    [
      heroPosition,
      ...dungeonObjects.filter(objectBlocksMovement).flatMap(objectCells),
    ].map(positionKey),
  );

  for (const [index, room] of rooms.entries()) {
    const isEntranceRoom = room.id === dungeon.entranceRoomId;
    const spawnChance = isEntranceRoom ? roomMonsterSpawnTuning.entranceRoomSpawnChance : roomMonsterSpawnTuning.roomSpawnChance;
    if (room.id === bossRoomId || Math.random() >= spawnChance) continue;
    const monsterId = pickWeightedMonsterId(monsterEntries, usedMonsterCounts, monsterEntries[0]?.id);
    const monsterTemplate = getMonsterTemplate(monsterId);
    if (!monsterTemplate) continue;
    const spawnCount = roomMonsterSpawnCount(monsterTemplate, hero);
    const spawnCells = clusteredSpawnCells(room, spawnCount, heroPosition, objectBlockedKeys, dungeon.gridSize, floorKeys);
    if (spawnCells.length === 0) continue;
    usedMonsterCounts[monsterId] = (usedMonsterCounts[monsterId] ?? 0) + 1;
    const actualCount = Math.min(spawnCount, spawnCells.length);
    for (let swarmIndex = 0; swarmIndex < actualCount; swarmIndex += 1) {
      const position = spawnCells[swarmIndex];
      if (!position) continue;
      const suffix = spawnCount > 1 ? ` ${swarmIndex + 1}` : index === 0 ? "" : ` ${index + 1}`;
      const monster = createMonsterForRoom(monsterTemplate, room, position, `monster-${room.id}${spawnCount > 1 ? `-${swarmIndex + 1}` : ""}`, `${monsterTemplate.name}${suffix}`, hero);
      monsters[monster.id] = monster;
      objectBlockedKeys.add(positionKey(position));
    }
  }

  if (bossMonsterId && bossRoomId) {
    const bossTemplate = getMonsterTemplate(bossMonsterId);
    const bossRoom = rooms.find((room) => room.id === bossRoomId);
    if (bossTemplate && bossRoom) {
      const boss = createCombatant({
        ...bossTemplate,
        id: `boss-${bossRoom.id}`,
        name: bossTemplate.name,
      });
      applyMonsterCategoryScaling(boss, hero);
      boss.roomId = bossRoom.id;
      boss.position = safeRoomSpawnCell(bossRoom, heroPosition, objectBlockedKeys, dungeon.gridSize, floorKeys);
      if (boss.position) monsters[boss.id] = boss;
    }
  }

  return monsters;
}

function normalizeMonsterRoomPositions(gameState) {
  const dungeon = gameState?.dungeon;
  if (!dungeon?.rooms || !gameState?.fighters) return;
  const floorKeys = spawnFloorKeysForDungeon(dungeon);
  const blockedKeys = new Set(
    (gameState.dungeonObjects ?? [])
      .filter(objectBlocksMovement)
      .flatMap(objectCells)
      .map(positionKey),
  );
  Object.values(gameState.fighters)
    .filter((fighter) => fighter.id === "hero" || gameState.party?.heroIds?.includes(fighter.id))
    .forEach((fighter) => blockedKeys.add(positionKey(fighter.position)));

  for (const fighter of Object.values(gameState.fighters)) {
    if (fighter.id === "hero" || gameState.party?.heroIds?.includes(fighter.id) || !fighter.alive) continue;
    const assignedRoom = dungeon.rooms.find((room) => room.id === fighter.roomId);
    const currentRoom = dungeon.rooms.find((room) => roomHasCell(room, fighter.position));
    const room = assignedRoom ?? currentRoom;
    if (!room) {
      delete gameState.fighters[fighter.id];
      continue;
    }

    const currentKey = positionKey(fighter.position);
    const legalKeys = new Set(roomSpawnCells(room, blockedKeys, dungeon.gridSize, floorKeys).map(positionKey));
    if (legalKeys.has(currentKey)) {
      fighter.roomId = room.id;
      blockedKeys.add(currentKey);
      continue;
    }

    const replacement = safeRoomSpawnCell(room, gameState.fighters.hero?.position ?? fighter.position, blockedKeys, dungeon.gridSize, floorKeys);
    if (!replacement) {
      delete gameState.fighters[fighter.id];
      continue;
    }
    fighter.position = { ...replacement };
    fighter.roomId = room.id;
    blockedKeys.add(positionKey(replacement));
  }
}

function aliveFighters() {
  return Object.values(state.fighters).filter((fighter) => fighter.alive);
}

function aliveMonsters() {
  const heroIds = new Set([...(state.party?.heroIds ?? ["hero"]), ...(state.party?.rosterIds ?? [])]);
  return Object.values(state.fighters).filter((fighter) => !heroIds.has(fighter.id) && fighter.alive);
}

function activeFighter() {
  const entry = state.initiative[state.activeIndex];
  return entry ? state.fighters[entry.fighterId] : null;
}

function syncActiveHeroToTurn() {
  const fighter = activeFighter();
  if (!isPartyHeroId(fighter?.id)) return false;
  state.party.activeHeroId = fighter.id;
  selectedHeroIds = new Set([fighter.id]);
  return true;
}

function normalizeLoadedState(loadedState) {
  const freshState = createInitialState();
  const loadedFighters =
    loadedState.fighters && Object.keys(loadedState.fighters).length
      ? { ...loadedState.fighters }
      : { ...freshState.fighters };
  if (!loadedFighters.hero && freshState.fighters.hero) loadedFighters.hero = freshState.fighters.hero;
  const normalized = {
    ...freshState,
    ...loadedState,
    themeId: loadedState.themeId ?? freshState.themeId ?? defaultContent.theme,
    saveSlotId: loadedState.saveSlotId ?? activeSaveSlot,
    mode: loadedState.mode ?? (loadedState.combatStarted ? "combat" : "exploration"),
    fighters: loadedFighters,
    dungeon: ensureCorridorPassages(loadedState.dungeon ?? freshState.dungeon),
    party: {
      activeHeroId: loadedState.party?.activeHeroId ?? "hero",
      heroIds: Array.isArray(loadedState.party?.heroIds) && loadedState.party.heroIds.length ? loadedState.party.heroIds : ["hero"],
      rosterIds:
        Array.isArray(loadedState.party?.rosterIds) && loadedState.party.rosterIds.length
          ? loadedState.party.rosterIds
          : Array.isArray(loadedState.party?.heroIds) && loadedState.party.heroIds.length
            ? loadedState.party.heroIds
            : ["hero"],
    },
    exploration: {
      ...freshState.exploration,
      ...loadedState.exploration,
    },
    exit: loadedState.exit ?? freshState.exit,
    completed: Boolean(loadedState.completed),
    d20Mode: normalizeD20Mode(loadedState.d20Mode ?? freshState.d20Mode),
    d20FailureStreak: Math.max(0, Math.floor(loadedState.d20FailureStreak ?? freshState.d20FailureStreak ?? 0)),
    shortRestsUsed: loadedState.shortRestsUsed ?? (loadedState.shortRestUsed ? 1 : 0),
    shortRestLimit: loadedState.shortRestLimit ?? 3,
    chest: Array.isArray(loadedState.chest) ? loadedState.chest.map(normalizeItem) : [],
    chestMoney: normalizeMoney(loadedState.chestMoney ?? {}),
    campaignProgress: cloneData(loadedState.campaignProgress ?? freshState.campaignProgress ?? {}),
    lootPiles: Array.isArray(loadedState.lootPiles) ? loadedState.lootPiles : [],
    dungeonObjects: Array.isArray(loadedState.dungeonObjects) ? loadedState.dungeonObjects : [],
    log: Array.isArray(loadedState.log) ? loadedState.log : [],
    initiative: Array.isArray(loadedState.initiative) ? loadedState.initiative : [],
  };

  normalizeMonsterRoomPositions(normalized);

  normalized.initiative = normalized.initiative
    .map((entry) => ({
      fighterId: entry.fighterId ?? entry.fighter?.id,
      roll: entry.roll,
      total: entry.total,
    }))
    .filter((entry) => entry.fighterId && normalized.fighters[entry.fighterId]);

  if (normalized.activeIndex >= normalized.initiative.length) {
    normalized.activeIndex = 0;
  }

  if (normalized.fighters.hero) {
    normalized.fighters.hero.id = "hero";
    normalized.fighters.hero.partyRole = normalized.fighters.hero.partyRole ?? "tank";
    normalized.fighters.hero.token = tokenFromName(normalized.fighters.hero.name, normalized.fighters.hero.token);
  }
  Object.values(normalized.fighters).forEach((fighter) => {
    if (fighter.dead) {
      fighter.hp = 0;
      fighter.alive = false;
      fighter.deathSaves = fighter.deathSaves ?? { successes: 0, failures: 3 };
    } else if (normalized.party.rosterIds.includes(fighter.id)) {
      fighter.deathSaves = fighter.deathSaves ?? { successes: 0, failures: 0 };
    }
  });
  normalized.party.rosterIds = normalized.party.rosterIds.filter((id) => normalized.fighters[id]);
  if (!normalized.party.rosterIds.includes("hero") && normalized.fighters.hero) normalized.party.rosterIds.unshift("hero");
  normalized.party.heroIds = normalized.party.heroIds.filter((id) => normalized.fighters[id]).slice(0, 4);
  if (normalized.party.heroIds.length === 0 && normalized.fighters.hero) normalized.party.heroIds = ["hero"];
  if (!normalized.fighters[normalized.party.activeHeroId]) normalized.party.activeHeroId = normalized.party.heroIds[0] ?? "hero";
  for (const heroId of normalized.party.heroIds ?? ["hero"]) {
    if (normalized.fighters[heroId]) {
      normalized.fighters[heroId].partyRole = normalized.fighters[heroId].partyRole ?? (heroId === "hero" ? "tank" : "dd");
    }
  }
  normalizeHomeLayout(normalized);
  Object.values(normalized.fighters).forEach((fighter) => {
    fighter.baseAc = fighter.baseAc ?? fighter.ac ?? 10;
    fighter.baseDamage = { ...(fighter.baseDamage ?? fighter.damage ?? { count: 1, sides: 4, bonus: 0 }) };
    fighter.baseMaxHp = fighter.baseMaxHp ?? fighter.maxHp ?? 1;
    fighter.baseSpeedFeet = fighter.baseSpeedFeet ?? fighter.speedFeet ?? 30;
    fighter.abilityScores = fighter.abilityScores ? { ...fighter.abilityScores } : fighter.abilityScores;
    fighter.abilityMods = { ...(fighter.abilityMods ?? {}) };
    fighter.raceSelection = normalizeRaceSelection(fighter.raceSelection ?? { raceId: fighter.race, subraceId: fighter.subrace, dragonAncestryId: fighter.dragonAncestryId });
    const raceTraits = raceTraitsForSelection(fighter.raceSelection);
    fighter.race = fighter.race ?? raceTraits.raceId;
    fighter.subrace = fighter.subrace ?? raceTraits.subraceId;
    fighter.speciesName = fighter.speciesName ?? raceTraits.raceName;
    fighter.subraceName = fighter.subraceName ?? raceTraits.subraceName;
    fighter.racialAbilityBonuses = fighter.racialAbilityBonuses ?? raceTraits.abilityBonuses;
    fighter.racialHpPerLevel = fighter.racialHpPerLevel ?? raceTraits.hpPerLevel;
    fighter.racialTraits = {
      halflingLucky: Boolean(fighter.racialTraits?.halflingLucky),
      relentlessEndurance: Boolean(fighter.racialTraits?.relentlessEndurance),
      savageAttacks: Boolean(fighter.racialTraits?.savageAttacks),
      dragonDamageType: fighter.racialTraits?.dragonDamageType ?? raceTraits.dragonDamageType,
      dragonBreathSaveAbility: fighter.racialTraits?.dragonBreathSaveAbility ?? raceTraits.dragonBreathSaveAbility,
      traits: fighter.racialTraits?.traits ?? raceTraits.traits,
      spellTraits: fighter.racialTraits?.spellTraits ?? raceTraits.spellTraits,
    };
    fighter.damageResistances = uniqueValues([...(fighter.damageResistances ?? []), ...(raceTraits.damageResistances ?? [])]);
    fighter.damageImmunities = uniqueValues([...(fighter.damageImmunities ?? []), ...(raceTraits.damageImmunities ?? [])]);
    fighter.classId = fighter.classId ?? defaultContent.heroClass;
    const classTemplate = getHeroTemplate(fighter.classId);
    fighter.weaponProficiencies = proficiencyEntries([
      ...classWeaponProficiencies(classTemplate),
      ...raceTraits.weaponProficiencies,
      ...(fighter.weaponProficiencies ?? []),
    ]);
    fighter.armorProficiencies = proficiencyEntries([
      ...classArmorProficiencies(classTemplate),
      ...raceTraits.armorProficiencies,
      ...(fighter.armorProficiencies ?? []),
    ]);
    if (!fighter.proficiencySchemaVersion) {
      if (fighter.classId === "rogue") fighter.expertiseTools = (fighter.expertiseTools ?? []).filter((toolId) => toolId !== "thieves-tools");
      if (["bard", "ranger"].includes(fighter.classId)) fighter.toolProficiencies = (fighter.toolProficiencies ?? []).filter((toolId) => toolId !== "thieves-tools");
    }
    fighter.skillProficiencies = uniqueValues([...(raceTraits.skillProficiencies ?? []), ...(fighter.skillProficiencies ?? [])]);
    fighter.toolProficiencies = uniqueValues([...(raceTraits.toolProficiencies ?? []), ...classToolProficiencies(fighter.classId), ...(fighter.toolProficiencies ?? [])]);
    fighter.expertiseSkills = uniqueValues(fighter.expertiseSkills ?? []).filter((skillId) => fighter.skillProficiencies.includes(skillId));
    fighter.expertiseTools = uniqueValues(fighter.expertiseTools ?? []).filter((toolId) => fighter.toolProficiencies.includes(toolId));
    fighter.proficiencySchemaVersion = 1;
    fighter.className = fighter.className ?? classTemplate.className ?? "Fighter";
    fighter.casterType = fighter.casterType ?? classTemplate.casterType;
    fighter.spellcastingAbility = fighter.spellcastingAbility ?? classTemplate.spellcastingAbility;
    fighter.spellPointProgression = fighter.spellPointProgression ?? classTemplate.spellPointProgression;
    fighter.classSpellList = fighter.classSpellList ?? classTemplate.classSpellList ?? classTemplate.spellList ?? classTemplate.spells ?? [];
    fighter.classCantripList = fighter.classCantripList ?? classTemplate.classCantripList ?? classTemplate.cantripList ?? [];
    fighter.spells = fighter.spells ?? [];
    fighter.baseAttackAbilityMod = fighter.baseAttackAbilityMod ?? scoreToMod(baseAbilityScore(fighter, attackAbilityForWeapon(activeWeapon(fighter), fighter)));
    fighter.level = fighter.level ?? 1;
    fighter.xp = fighter.xp ?? 0;
    fighter.hitDie = fighter.hitDie ?? 10;
    fighter.hitDiceRemaining = fighter.hitDiceRemaining ?? fighter.level ?? 1;
    fighter.equipment = normalizeEquipment(fighter.equipment);
    fighter.inventory = normalizeInventory(fighter.inventory);
    ensureFighterAbilityState(fighter);
    ensureSpellPointState(fighter);
    fighter.hasBonusAction = fighter.hasBonusAction ?? true;
    fighter.dodging = fighter.dodging ?? false;
    fighter.disengaged = fighter.disengaged ?? false;
    fighter.canMoveThroughMonsters = fighter.canMoveThroughMonsters ?? false;
    ensureStarterHeroEquipment(fighter);
    refreshDerivedStats(fighter);
  });

  return normalized;
}

