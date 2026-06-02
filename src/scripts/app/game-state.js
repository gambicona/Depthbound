const dungeonSizeOptions = [
  { id: "small", name: "Short Delve", roomCount: 10, encounterRange: [4, 5], description: "A brief descent with a few dangerous chambers." },
  { id: "medium", name: "Deep Delve", roomCount: 15, encounterRange: [6, 8], description: "A longer push with more rooms, risks, and chances for treasure." },
  { id: "large", name: "Full Expedition", roomCount: 20, encounterRange: [8, 10], description: "A long venture for a prepared party with supplies and nerve." },
  { id: "massive", name: "Massive", roomCount: 30, encounterRange: [10, 15], description: "A massive dungeon, for the experienced adventurers." },
  {
    id: "insane",
    name: "Insane",
    roomCount: 50,
    gridSize: 110,
    encounterRange: [20, 30],
    resourceNodes: { min: 8, max: 12, chance: 1 },
    description: "Good Luck I guess, I dunno. You psycho.",
  },
];

function dungeonSizeDefinition(sizeId = "large") {
  return dungeonSizeOptions.find((option) => option.id === sizeId) ?? dungeonSizeOptions.find((option) => option.id === "large") ?? dungeonSizeOptions[0];
}

function randomDungeonSizeEncounterTarget(sizeId = "large", roomCount = 20) {
  const definition = dungeonSizeDefinition(sizeId);
  const [minimum, maximum] = definition.encounterRange ?? [8, 10];
  const min = Math.max(0, Math.floor(Number(minimum) || 0));
  const max = Math.max(min, Math.floor(Number(maximum) || min));
  return Math.min(roomCount, min + Math.floor(Math.random() * (max - min + 1)));
}

function dungeonArrivalLogText(dungeonName = "the dungeon", entranceRoomName = "the entrance") {
  return `The party leaves home and arrives in the ${entranceRoomName} of the ${dungeonName}.`;
}

function createInitialState(heroNameOverride = "", heroForDifficulty = null, heroOptions = {}, themeId = defaultContent.theme, dungeonSizeId = "large", generatorOverrides = {}) {
  dungeonClockRuntimePaused = false;
  const dungeonDefinition = getContentDefinition("dungeons", defaultContent.dungeon);
  const theme = getContentDefinition("themes", themeId);
  const dungeonSize = dungeonSizeDefinition(dungeonSizeId);
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
  if (dungeonSize?.roomCount) dungeonOptions.roomCount = dungeonSize.roomCount;
  if (dungeonSize?.gridSize) dungeonOptions.gridSize = dungeonSize.gridSize;
  Object.assign(dungeonOptions, generatorOverrides ?? {});
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
  const dungeonObjects = createDungeonObjects(dungeon, [hero.position, exit.position], themeId, dungeonSize?.id);
  const terrainSummary = terrainFloorSummary(dungeonObjects);
  const encounterTarget = randomDungeonSizeEncounterTarget(dungeonSize?.id, Math.max(0, dungeon.roomCount - 1));
  const monsters = createDungeonMonsters(dungeon, hero.position, heroForDifficulty ?? hero, exit.roomId, dungeonObjects, themeId, encounterTarget);

  return {
    themeId,
    worldDay: 1,
    dungeonSizeId: dungeonSize?.id ?? "large",
    dungeonSizeName: dungeonSize?.name ?? "Large",
    encounterTarget,
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
      discoveredHiddenDoorKeys: [],
      hiddenDoorSearchAttempts: {},
    },
    exit,
    completed: false,
    d20Mode: heroOptions.d20Mode ?? defaultD20Mode,
    d20FailureStreak: 0,
    saveRollMode: normalizeSaveRollMode(heroOptions.saveRollMode ?? "manual"),
    shortRestsUsed: 0,
    shortRestLimit: shortRestLimitForTheme(theme, 3),
    dungeonClock: createDungeonClock(),
    grabbedEntity: null,
    chest: [],
    chestMoney: { cp: 0, sp: 0, gp: 0 },
    home: createDefaultHomeLayout(),
    monsterCompendium: {},
    campaignProgress: {},
    questFlags: {},
    partyResources: {},
    partyTomes: [],
    world: null,
    lootPiles: [],
    dungeonObjects,
    party: {
      activeHeroId: "hero",
      heroIds: ["hero"],
      rosterIds: ["hero"],
      travelRationsInitialized: false,
    },
    fighters: {
      hero,
      ...monsters,
    },
    log: [
      {
        text: dungeonArrivalLogText(theme?.name ?? dungeonDefinition?.name ?? "Generated Dungeon", firstRoom.name),
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

function normalizePartyResources(resources = {}) {
  const normalized = {};
  if (!resources || typeof resources !== "object" || Array.isArray(resources)) return normalized;
  for (const [itemId, quantity] of Object.entries(resources)) {
    const amount = Math.max(0, Math.floor(Number(quantity) || 0));
    if (itemId && amount > 0) normalized[itemId] = amount;
  }
  return normalized;
}

function itemUsesPartyResourceInventory(item) {
  return Boolean(item?.type === "component" || item?.resourceInventory === "party" || item?.tags?.includes("party-resource") || item?.tags?.includes("quest-resource"));
}

function normalizePartyTomes(tomes = []) {
  if (!Array.isArray(tomes)) return [];
  return tomes
    .map((entry, index) => {
      if (!entry || typeof entry !== "object") return null;
      const title = String(entry.title ?? entry.name ?? entry.handout?.title ?? `Ancient Tome ${index + 1}`).trim() || `Ancient Tome ${index + 1}`;
      const text = String(entry.text ?? entry.handout?.text ?? entry.customDescription ?? entry.description ?? "").trim();
      const categories = Array.from(
        new Set([...(entry.categories ?? []), ...(entry.handout?.categories ?? []), ...(entry.journalCategories ?? [])].map((category) => String(category).trim()).filter(Boolean)),
      );
      const tags = Array.from(new Set([...(entry.tags ?? []), ...(entry.handout?.tags ?? [])].map((tag) => String(tag).trim()).filter(Boolean)));
      if (!title && !text) return null;
      return {
        id: String(entry.id ?? entry.instanceId ?? `tome-${index + 1}`),
        baseItemId: String(entry.baseItemId ?? entry.itemId ?? entry.id ?? ""),
        title,
        text,
        categories,
        tags,
        temporary: Boolean(
          entry.temporary ||
            entry.temporaryTome ||
            entry.expiresOnDungeonExit ||
            entry.handout?.temporary ||
            tags.includes("temporary-note") ||
            entry.baseItemId === "temporary-dungeon-note" ||
            entry.itemId === "temporary-dungeon-note",
        ),
        collectedAt: entry.collectedAt ?? Date.now(),
      };
    })
    .filter(Boolean);
}

function isTemporaryPartyTome(entry) {
  if (!entry) return false;
  return Boolean(
    entry.temporary ||
      entry.temporaryTome ||
      entry.expiresOnDungeonExit ||
      entry.handout?.temporary ||
      entry.baseItemId === "temporary-dungeon-note" ||
      entry.itemId === "temporary-dungeon-note" ||
      entry.id === "temporary-dungeon-note" ||
      entry.tags?.includes("temporary-note") ||
      entry.handout?.tags?.includes("temporary-note"),
  );
}

function permanentPartyTomes(tomes = []) {
  return normalizePartyTomes(tomes).filter((entry) => !isTemporaryPartyTome(entry));
}

function normalizeSpecialLock(lock = null) {
  if (!lock || typeof lock !== "object") return null;
  const answer = String(lock.answer ?? lock.key ?? lock.passphrase ?? "").trim();
  if (!answer) return null;
  return {
    prompt: String(lock.prompt ?? "Enter the key phrase.").trim() || "Enter the key phrase.",
    answer,
    label: String(lock.label ?? "Special Lock").trim() || "Special Lock",
    caseSensitive: Boolean(lock.caseSensitive),
    unlocked: Boolean(lock.unlocked),
  };
}

function specialLockAnswerMatches(lock, input) {
  const normalizedLock = normalizeSpecialLock(lock);
  if (!normalizedLock) return false;
  const submitted = String(input ?? "").trim();
  return normalizedLock.caseSensitive ? submitted === normalizedLock.answer : submitted.toLowerCase() === normalizedLock.answer.toLowerCase();
}

function itemUsesTomeInventory(item) {
  return Boolean(item?.type === "handout" || item?.tomeInventory === "party" || item?.tags?.includes("handout") || item?.tags?.includes("ancient-tome"));
}

function tomeEntryFromItem(item) {
  if (!item) return null;
  const title = String(item.handout?.title ?? item.name ?? "Ancient Tome Page").trim() || "Ancient Tome Page";
  const text = String(item.handout?.text ?? item.customDescription ?? item.description ?? "").trim();
  const categories = Array.from(
    new Set([...(item.handout?.categories ?? []), ...(item.journalCategories ?? [])].map((category) => String(category).trim()).filter(Boolean)),
  );
  const tags = Array.from(new Set((item.tags ?? []).map((tag) => String(tag).trim()).filter(Boolean)));
  const temporary = Boolean(item.temporaryTome ?? item.expiresOnDungeonExit ?? item.handout?.temporary ?? item.tags?.includes("temporary-note"));
  return {
    id: item.id ?? `${item.baseItemId ?? "handout"}-${Date.now()}`,
    baseItemId: item.baseItemId ?? item.itemId ?? item.id ?? "",
    title,
    text,
    categories,
    tags,
    temporary,
    collectedAt: Date.now(),
  };
}

function addPartyTomeItem(item) {
  const entry = tomeEntryFromItem(item);
  if (!entry) return null;
  state.partyTomes = normalizePartyTomes(state.partyTomes ?? []);
  const signature = `${entry.baseItemId}|${entry.title}|${entry.text}|${entry.categories.join(",")}|${entry.temporary ? "temporary" : "permanent"}`;
  const existing = state.partyTomes.find((tome) => `${tome.baseItemId}|${tome.title}|${tome.text}|${(tome.categories ?? []).join(",")}|${tome.temporary ? "temporary" : "permanent"}` === signature);
  if (existing) return existing;
  state.partyTomes.push(entry);
  for (const behavior of Object.values(window.DungeonNpcBehaviors ?? {})) behavior.recordItemCollected?.(item);
  return entry;
}

function logTomeStorageForItem(item) {
  if (!itemUsesTomeInventory(item) || typeof addLog !== "function") return;
  const entry = tomeEntryFromItem(item);
  if (entry) addLog(`${entry.title} is stored ${entry.temporary ? "temporarily " : ""}in the Ancient Tome journal.`, "important");
}

function logTomeStorageForItems(items = []) {
  (items ?? []).forEach(logTomeStorageForItem);
}

function addPartyResourceItem(item, quantity = 1) {
  if (!item) return 0;
  const itemId = item.baseItemId ?? item.itemId ?? item.id;
  if (!itemId) return 0;
  const amount = Math.max(1, Math.floor(Number(quantity) || 1));
  state.partyResources = normalizePartyResources(state.partyResources ?? {});
  state.partyResources[itemId] = (state.partyResources[itemId] ?? 0) + amount;
  return amount;
}

function moveInventoryPartyResourcesToSatchel(fighters = rosterHeroes()) {
  let moved = 0;
  state.partyResources = normalizePartyResources(state.partyResources ?? {});
  for (const fighter of fighters ?? []) {
    if (!fighter?.inventory?.items?.length) continue;
    const keptItems = [];
    for (const item of fighter.inventory.items) {
      if (itemUsesPartyResourceInventory(item)) {
        moved += addPartyResourceItem(item, item.quantity ?? 1);
      } else if (itemUsesTomeInventory(item)) {
        addPartyTomeItem(item);
      } else {
        keptItems.push(item);
      }
    }
    fighter.inventory.items = keptItems;
    for (const slot of equipmentSlots) {
      if (!fighter.equipment?.[slot.id]) continue;
      if (!fighter.inventory.items.some((item) => item.id === fighter.equipment[slot.id])) fighter.equipment[slot.id] = null;
    }
  }
  return moved;
}

function partyResourceCount(itemId) {
  if (!itemId) return 0;
  return normalizePartyResources(state?.partyResources ?? {})[itemId] ?? 0;
}

function consumePartyResource(itemId, quantity = 1) {
  const amount = Math.max(1, Math.floor(Number(quantity) || 1));
  if (partyResourceCount(itemId) < amount) return false;
  state.partyResources = normalizePartyResources(state.partyResources ?? {});
  state.partyResources[itemId] -= amount;
  if (state.partyResources[itemId] <= 0) delete state.partyResources[itemId];
  return true;
}

const smithMaterialCommissionRewardGpPerResource = 10;
const smithMaterialCommissionRequests = {
  "general-merchant": [
    { label: "Healing Herbs", requestText: "{npc} needs {quantity} Healing Herbs for potion stock.", requirement: { type: "component", tagsAll: ["herb", "healing"] }, quantityRange: [4, 8], rewardGpPerResource: 4 },
    { label: "Food Ingredients", requestText: "{npc} needs {quantity} Food Ingredients for trail rations.", requirement: { type: "component", category: "food ingredient" }, quantityRange: [6, 12], rewardGpPerResource: 2 },
    { itemId: "cloth-scrap", label: "Cloth Scraps", requestText: "{npc} needs {quantity} Cloth Scraps for bandages and supply bundles.", quantityRange: [8, 14], rewardGpPerResource: 2 },
    { itemId: "wood-bundle", label: "Wood Bundles", requestText: "{npc} needs {quantity} Wood Bundles for arrow shafts and crate repairs.", quantityRange: [4, 8], rewardGpPerResource: 2 },
    { label: "Cooking Herbs", requestText: "{npc} needs {quantity} Cooking Herbs for travel meals.", requirement: { type: "component", tagsAll: ["herb", "food"] }, quantityRange: [4, 8], rewardGpPerResource: 3 },
  ],
  alchemist: [
    { itemId: "coal-chunk", label: "Coal Chunks", requestText: "{npc} needs {quantity} Coal Chunks for extremely responsible blast tests.", quantityRange: [4, 8], rewardGpPerResource: 3 },
    { itemId: "brimstone-chunk", label: "Brimstone Chunks", requestText: "{npc} needs {quantity} Brimstone Chunks because sulfur is comedy with consequences.", quantityRange: [2, 5], rewardGpPerResource: 5 },
    { itemId: "hellfire-ember", label: "Hellfire Embers", requestText: "{npc} needs {quantity} Hellfire Embers for the exciting shelf.", quantityRange: [1, 3], rewardGpPerResource: 18 },
    { itemId: "slag-glass", label: "Slag Glass", requestText: "{npc} needs {quantity} Slag Glass shards for shrapnel-safe, mostly-safe casings.", quantityRange: [3, 6], rewardGpPerResource: 5 },
    { itemId: "crystal-shard", label: "Crystal Shards", requestText: "{npc} needs {quantity} Crystal Shards for spark focus experiments.", quantityRange: [2, 5], rewardGpPerResource: 7 },
    { label: "Fire Reagents", requestText: "{npc} needs {quantity} Fire Reagents. Fire is a color too.", requirement: { type: "component", tagsAny: ["fire", "sulfur", "brimstone", "ember", "ash", "heat"] }, quantityRange: [3, 7], rewardGpPerResource: 6 },
    { label: "Volatile Alchemical Materials", requestText: "{npc} needs {quantity} Volatile Alchemical Materials for boom research.", requirement: { type: "component", tagsAll: ["alchemy"], tagsAny: ["fire", "acid", "poison", "venom", "infernal", "abyssal", "arcane-reagent", "magic-reagent"] }, quantityRange: [3, 6], rewardGpPerResource: 10 },
  ],
  weaponsmith: [
    { itemId: "coal-chunk", label: "packs of coal", requestText: "{npc} needs {quantity} packs of coal for his forge.", quantityRange: [4, 7], rewardGpPerResource: 3 },
    { itemId: "iron-scrap", label: "pieces of iron scrap", requestText: "{npc} needs {quantity} pieces of iron scrap for blade fittings.", quantityRange: [8, 14], rewardGpPerResource: 3 },
    { label: "pieces of metal", requestText: "{npc} needs {quantity} pieces of any metal for a rush order.", requirement: { type: "component", category: "metal" }, quantityRange: [8, 14], rewardGpPerResource: 3 },
    { label: "packs of fuel", requestText: "{npc} needs {quantity} packs of fuel for his forge.", requirement: { type: "component", tagsAny: ["fuel", "coal", "forge"] }, quantityRange: [4, 8], rewardGpPerResource: 3 },
    { itemId: "embervein-ore", label: "nuggets of Embervein Ore", requestText: "{npc} needs {quantity} nuggets of Embervein Ore for heat-holding steel.", quantityRange: [3, 6], rewardGpPerResource: 7 },
    { itemId: "infernal-iron-shard", label: "Infernal Iron Shards", requestText: "{npc} needs {quantity} Infernal Iron Shards for warded weapon work.", quantityRange: [2, 4], rewardGpPerResource: 14 },
    { itemId: "arcane-gear", label: "Arcane Gears", requestText: "{npc} needs {quantity} Arcane Gears for a delicate weapon mechanism.", quantityRange: [1, 3], rewardGpPerResource: 12 },
  ],
  armorsmith: [
    { itemId: "iron-scrap", label: "pieces of iron scrap", requestText: "{npc} needs {quantity} pieces of iron scrap for rivets and patches.", quantityRange: [8, 14], rewardGpPerResource: 3 },
    { label: "pieces of metal", requestText: "{npc} needs {quantity} pieces of any metal for repairs.", requirement: { type: "component", category: "metal" }, quantityRange: [8, 14], rewardGpPerResource: 3 },
    { label: "pieces of leather or hide", requestText: "{npc} needs {quantity} pieces of leather or hide for straps and padding.", requirement: { type: "component", tagsAny: ["leather", "hide"] }, quantityRange: [6, 10], rewardGpPerResource: 3 },
    { itemId: "leather-scrap", label: "Leather Scraps", requestText: "{npc} needs {quantity} Leather Scraps for harness repairs.", quantityRange: [6, 10], rewardGpPerResource: 3 },
    { itemId: "beast-hide", label: "Beast Hides", requestText: "{npc} needs {quantity} Beast Hides for reinforced armor lining.", quantityRange: [3, 6], rewardGpPerResource: 6 },
    { itemId: "cloth-scrap", label: "Cloth Scraps", requestText: "{npc} needs {quantity} Cloth Scraps for gambeson padding.", quantityRange: [10, 16], rewardGpPerResource: 2 },
    { itemId: "spider-silk", label: "bundles of Spider Silk", requestText: "{npc} needs {quantity} bundles of Spider Silk for light reinforcement.", quantityRange: [3, 6], rewardGpPerResource: 7 },
  ],
};

function smithMaterialCommissionState(questFlags = state?.questFlags) {
  if (!questFlags) return {};
  questFlags.smithMaterialCommissions ??= {};
  return questFlags.smithMaterialCommissions;
}

function randomSmithMaterialCommission(npcId) {
  const requests = smithMaterialCommissionRequests[npcId] ?? [];
  const request = requests[Math.floor(Math.random() * requests.length)] ?? requests[0] ?? { itemId: "iron-scrap", quantity: 10 };
  const requirement = request.requirement ?? (request.itemId ? { itemId: request.itemId } : {});
  const [minQuantity, maxQuantity] = request.quantityRange ?? [request.quantity, request.quantity];
  const min = Math.max(1, Math.floor(Number(minQuantity) || 1));
  const max = Math.max(min, Math.floor(Number(maxQuantity) || min));

  return {
    status: "available",
    itemId: request.itemId,
    label: request.label,
    requestText: request.requestText,
    requirement: cloneData(requirement),
    quantity: min + Math.floor(Math.random() * (max - min + 1)),
    quantityRange: request.quantityRange ? [min, max] : undefined,
    rewardGpPerResource: request.rewardGpPerResource ?? smithMaterialCommissionRewardGpPerResource,
    offeredAt: Date.now(),
  };
}

function resetSmithMaterialCommissionsOnHomeArrival(questFlags = state?.questFlags) {
  const commissions = smithMaterialCommissionState(questFlags);
  for (const npcId of Object.keys(smithMaterialCommissionRequests)) {
    if (commissions[npcId]?.status === "accepted") continue;
    commissions[npcId] = randomSmithMaterialCommission(npcId);
  }
  return commissions;
}

function itemBaseId(item) {
  return item?.baseItemId ?? item?.itemId ?? item?.id ?? null;
}

function normalizedItemTags(item) {
  return new Set((item?.tags ?? []).map((tag) => String(tag).toLowerCase()));
}

function itemValueCopper(item) {
  if (item?.sell?.valueCp !== undefined) return Math.max(0, Math.floor(Number(item.sell.valueCp) || 0));
  if (!item?.cost) return 0;
  return moneyToCp({ [item.cost.unit]: item.cost.amount ?? 0 });
}

function itemMatchesRequirement(item, requirement = {}) {
  if (!item) return false;
  const templateId = itemBaseId(item);
  const template = templateId ? getItemTemplate(templateId) : null;
  const source = { ...(template ?? {}), ...(item ?? {}) };
  const tags = normalizedItemTags(source);
  const exactIds = [requirement.itemId, requirement.id, ...(requirement.itemIds ?? [])].filter(Boolean);
  if (exactIds.length && !exactIds.includes(templateId) && !exactIds.includes(source.id)) return false;
  const requiredType = requirement.type ?? requirement.itemType;
  if (requiredType && source.type !== requiredType) return false;
  const requiredCategory = requirement.category ?? requirement.itemCategory;
  if (requiredCategory && source.category !== requiredCategory) return false;
  const component = source.component ?? {};
  if (requirement.kind && component.kind !== requirement.kind) return false;
  if (requirement.material && component.material !== requirement.material) return false;
  if (requirement.form && component.form !== requirement.form) return false;
  if (requirement.rarity && (component.rarity ?? source.rarity) !== requirement.rarity) return false;
  const requiredTag = requirement.itemTag ?? requirement.lootTag ?? requirement.tag;
  if (requiredTag && !tags.has(String(requiredTag).toLowerCase())) return false;
  const allTags = requirement.tagsAll ?? requirement.itemTagsAll ?? requirement.requiredTags ?? [];
  if (allTags.some((tag) => !tags.has(String(tag).toLowerCase()))) return false;
  const anyTags = requirement.tagsAny ?? requirement.itemTagsAny ?? [];
  if (anyTags.length && !anyTags.some((tag) => tags.has(String(tag).toLowerCase()))) return false;
  const sourceTags = new Set((component.sourceTags ?? []).map((tag) => String(tag).toLowerCase()));
  const allSourceTags = requirement.sourceTagsAll ?? [];
  if (allSourceTags.some((tag) => !sourceTags.has(String(tag).toLowerCase()) && !tags.has(String(tag).toLowerCase()))) return false;
  const anySourceTags = requirement.sourceTagsAny ?? [];
  if (anySourceTags.length && !anySourceTags.some((tag) => sourceTags.has(String(tag).toLowerCase()) || tags.has(String(tag).toLowerCase()))) return false;
  if (requirement.minValueCp !== undefined && itemValueCopper(source) < requirement.minValueCp) return false;
  if (requirement.minValueGp !== undefined && itemValueCopper(source) < Number(requirement.minValueGp) * 100) return false;
  return true;
}

function materialStacksForRequirement(requirement = {}) {
  const stacks = [];
  for (const [itemId, quantity] of Object.entries(normalizePartyResources(state?.partyResources ?? {}))) {
    const item = getItemTemplate(itemId);
    if (itemMatchesRequirement(item, requirement)) stacks.push({ source: "party", itemId, item, quantity });
  }
  for (const hero of partyHeroes()) {
    for (const item of hero.inventory?.items ?? []) {
      if (itemMatchesRequirement(item, requirement)) stacks.push({ source: "hero", hero, itemId: item.id, item, quantity: item.quantity ?? 1 });
    }
  }
  for (const item of state?.chest ?? []) {
    if (itemMatchesRequirement(item, requirement)) stacks.push({ source: "chest", itemId: item.id, item, quantity: item.quantity ?? 1 });
  }
  return stacks.sort((a, b) => itemValueCopper(a.item) - itemValueCopper(b.item) || String(a.item?.name ?? "").localeCompare(String(b.item?.name ?? "")));
}

function partyResourceStacksForRequirement(requirement = {}) {
  return Object.entries(normalizePartyResources(state?.partyResources ?? {}))
    .map(([itemId, quantity]) => ({ itemId, item: getItemTemplate(itemId), quantity }))
    .filter((stack) => stack.item && itemMatchesRequirement(stack.item, requirement))
    .sort((a, b) => String(a.item?.name ?? a.itemId).localeCompare(String(b.item?.name ?? b.itemId)));
}

function partyResourceCountForRequirement(requirement = {}) {
  return partyResourceStacksForRequirement(requirement).reduce((sum, stack) => sum + Math.max(0, Math.floor(Number(stack.quantity) || 0)), 0);
}

function materialCountForRequirement(requirement = {}) {
  return materialStacksForRequirement(requirement).reduce((sum, stack) => sum + Math.max(0, Math.floor(Number(stack.quantity) || 0)), 0);
}

function consumeMaterialsForRequirement(requirement = {}, quantity = 1) {
  let remaining = Math.max(1, Math.floor(Number(quantity) || 1));
  if (materialCountForRequirement(requirement) < remaining) return false;
  for (const stack of materialStacksForRequirement(requirement)) {
    if (remaining <= 0) break;
    const consumed = Math.min(remaining, Math.max(0, Math.floor(Number(stack.quantity) || 0)));
    if (consumed <= 0) continue;
    if (stack.source === "party") {
      consumePartyResource(stack.itemId, consumed);
    } else if (stack.source === "hero") {
      stack.hero.inventory.items = (stack.hero.inventory.items ?? []).filter((item) => item.id !== stack.itemId);
      for (const slot of equipmentSlots) {
        if (stack.hero.equipment?.[slot.id] === stack.itemId) stack.hero.equipment[slot.id] = null;
      }
    } else if (stack.source === "chest") {
      state.chest = (state.chest ?? []).filter((item) => item.id !== stack.itemId);
    }
    remaining -= consumed;
  }
  return remaining <= 0;
}

function createDungeonStateForParty(partyMembers, previousState, themeId = defaultContent.theme, dungeonSizeId = "large", generatorOverrides = {}) {
  const leader = partyMembers[0] ?? previousState?.fighters?.hero;
  const partyDifficulty = {
    ...(leader ?? {}),
    level: averagePartyLevel({ level: leader?.level ?? 1 }),
    partySize: partyMembers.length,
  };
  const nextState = createInitialState(leader?.name ?? getHeroTemplate().name, partyDifficulty, {}, themeId, dungeonSizeId, generatorOverrides);
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
    heroIds: partyMembers.map((hero) => hero.id),
    rosterIds: previousRosterIds,
    travelRationsInitialized: Boolean(previousState?.party?.travelRationsInitialized),
  };
  nextState.saveSlotId = previousState?.saveSlotId ?? activeSaveSlot;
  nextState.chest = previousState?.chest ?? [];
  nextState.chestMoney = normalizeMoney(previousState?.chestMoney ?? {});
  nextState.home = normalizeHomeData(previousState?.home);
  nextState.monsterCompendium = normalizeMonsterCompendium(previousState?.monsterCompendium);
  nextState.d20Mode = normalizeD20Mode(previousState?.d20Mode);
  nextState.d20FailureStreak = previousState?.d20FailureStreak ?? 0;
  nextState.saveRollMode = normalizeSaveRollMode(previousState?.saveRollMode ?? "manual");
  nextState.worldDay = normalizeWorldDay(previousState?.worldDay);
  nextState.campaignProgress = cloneData(previousState?.campaignProgress ?? {});
  nextState.questFlags = cloneData(previousState?.questFlags ?? {});
  nextState.partyResources = normalizePartyResources(previousState?.partyResources ?? {});
  nextState.partyTomes = permanentPartyTomes(previousState?.partyTomes ?? []);
  nextState.world = window.DepthboundWorldTravel?.normalizeWorldState?.(previousState?.world) ?? previousState?.world ?? null;
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

function normalizeCustomDungeonTrap(trap = null) {
  if (!trap || typeof trap !== "object") return null;
  const template = trap.id ? getContentDefinition("traps", trap.id) : null;
  return {
    id: trap.id ?? template?.id ?? "custom-trap",
    name: trap.name ?? template?.name ?? "Custom Trap",
    spotDc: trap.spotDc ?? template?.spotDc ?? 12,
    spotDifficulty: trap.spotDifficulty ?? template?.spotDifficulty ?? "Normal",
    damage: cloneData(trap.damage ?? template?.damage ?? { count: 1, sides: 4, type: "piercing" }),
    magical: Boolean(trap.magical ?? template?.magical),
    disarmSkillOptions: cloneData(trap.disarmSkillOptions ?? template?.disarmSkillOptions ?? []),
    disarmSkill: trap.disarmSkill ?? template?.disarmSkill,
    disarmAbility: trap.disarmAbility ?? template?.disarmAbility,
    description: trap.description ?? template?.description ?? "A hidden container trap.",
  };
}

function createCustomDungeonObject(templateObject, index) {
  const template = objectTemplate(templateObject.type);
  if (!template) return null;
  const lockComponent = objectComponent(templateObject.type, "lock");
  const lockDc = templateObject.lockDc ?? lockComponent?.dc;
  const specialLock = normalizeSpecialLock(templateObject.specialLock);
  const trap = normalizeCustomDungeonTrap(templateObject.trap);
  const locked =
    typeof templateObject.locked === "boolean"
      ? templateObject.locked
      : specialLock
        ? true
      : lockComponent
        ? false
        : undefined;
  return {
    id: templateObject.id ?? `${templateObject.type}-${index + 1}`,
    type: templateObject.type,
    position: { ...(templateObject.position ?? { x: 0, y: 0 }) },
    width: templateObject.width ?? template.width ?? 1,
    height: templateObject.height ?? template.height ?? 1,
    ...(templateObject.pairId ? { pairId: templateObject.pairId } : {}),
    ...(trap ? { trap } : {}),
    ...(specialLock ? { specialLock } : {}),
    ...(!specialLock && lockDc ? { lockDc } : {}),
    ...(typeof locked === "boolean" ? { locked } : {}),
    ...(templateObject.spawner ? { spawner: cloneData(templateObject.spawner) } : {}),
    ...(templateObject.recruit ? { recruit: cloneData(templateObject.recruit) } : {}),
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
  dungeonClockRuntimePaused = false;
  if (!template) return null;
  for (const item of template.customItems ?? []) {
    window.DungeonContent.register("items", item.id, item);
  }
  const theme = getContentDefinition("themes", template.themeId) ?? getContentDefinition("themes", defaultContent.theme);
  const dungeon = ensureCorridorPassages(template.dungeon);
  const entranceRoom = dungeon.rooms.find((room) => room.id === dungeon.entranceRoomId) ?? dungeon.rooms[0];
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
      oneShotDungeon: Boolean(template.oneShotDungeon),
      oneShotDungeonId: template.oneShotDungeonId ?? (template.oneShotDungeon ? template.id : null),
      goal: template.goal ?? { type: "reachExit" },
      monsterSummary: customDungeonMonsterSummary(monsters),
      intro: template.intro ?? { text: "", images: [] },
      outro: template.outro ?? { text: "", images: [] },
      storyTriggers: Array.isArray(template.storyTriggers) ? cloneData(template.storyTriggers) : [],
      storyTriggerHistory: {},
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
      discoveredHiddenDoorKeys: [],
      hiddenDoorSearchAttempts: {},
    },
    exit: template.exit,
    completed: false,
    d20Mode: normalizeD20Mode(previousState?.d20Mode),
    d20FailureStreak: previousState?.d20FailureStreak ?? 0,
    saveRollMode: normalizeSaveRollMode(previousState?.saveRollMode ?? "manual"),
    worldDay: normalizeWorldDay(previousState?.worldDay),
    shortRestsUsed: 0,
    shortRestLimit: shortRestLimitForTheme(theme, 3),
    dungeonClock: createDungeonClock(),
    grabbedEntity: null,
    chest: previousState?.chest ?? [],
    chestMoney: normalizeMoney(previousState?.chestMoney ?? {}),
    home: normalizeHomeData(previousState?.home),
    monsterCompendium: normalizeMonsterCompendium(previousState?.monsterCompendium),
    campaignProgress: cloneData(previousState?.campaignProgress ?? {}),
    questFlags: cloneData(previousState?.questFlags ?? {}),
    partyResources: normalizePartyResources(previousState?.partyResources ?? {}),
    partyTomes: permanentPartyTomes(previousState?.partyTomes ?? []),
    world: window.DepthboundWorldTravel?.normalizeWorldState?.(previousState?.world) ?? previousState?.world ?? null,
    lootPiles: [],
    dungeonObjects: objects,
    party: {
      activeHeroId: partyMembers[0]?.id ?? "hero",
      heroIds: partyMembers.map((hero) => hero.id),
      rosterIds: previousRosterIds,
      travelRationsInitialized: Boolean(previousState?.party?.travelRationsInitialized),
    },
    saveSlotId: previousState?.saveSlotId ?? activeSaveSlot,
    fighters: {
      ...heroes,
      ...monsters,
    },
    log: [
      {
        text: dungeonArrivalLogText(template.name, entranceRoom.name),
        type: "important",
      },
    ],
  };
}

function createCustomDungeonStateForParty(partyMembers, previousState, customDungeonId) {
  return createCustomDungeonStateFromTemplate(partyMembers, previousState, window.DungeonCustom?.get(customDungeonId));
}

function roomForDungeonPosition(position, dungeon = state?.dungeon) {
  return (dungeon?.rooms ?? []).find((room) => roomHasCell(room, position)) ?? null;
}

function dungeonRecruitParseOverrides(config = {}) {
  if (config.overrides && typeof config.overrides === "object") return cloneData(config.overrides);
  if (!config.overridesText) return {};
  try {
    const parsed = JSON.parse(config.overridesText);
    if (parsed?.overrides && typeof parsed.overrides === "object") return cloneData(parsed.overrides);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function dungeonRecruitParseFullConfig(config = {}) {
  if (!config.overridesText) return {};
  try {
    const parsed = JSON.parse(config.overridesText);
    return parsed?.kind === "hero" && parsed?.overrides && typeof parsed.overrides === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function dungeonSpawnBlockedKeys() {
  return new Set([
    ...blockingObjectKeys(),
    ...Object.values(state?.fighters ?? {})
      .filter((fighter) => fighter.alive)
      .flatMap((fighter) => window.DungeonGrid.fighterCells(fighter).map(positionKey)),
  ]);
}

function nearestDungeonSpawnPosition(originObject, footprintSource = null) {
  const room = roomForDungeonPosition(originObject?.position);
  const blockedKeys = dungeonSpawnBlockedKeys();
  const floorKeys = spawnFloorKeysForDungeon();
  const startCells = objectCells(originObject);
  const queue = startCells.flatMap((cell) => adjacentCells(cell));
  const visited = new Set(startCells.map(positionKey));
  while (queue.length) {
    const position = queue.shift();
    const key = positionKey(position);
    if (visited.has(key)) continue;
    visited.add(key);
    const fits = window.DungeonGrid.fighterCells(footprintSource ?? {}, position).every((cell) =>
      window.DungeonGrid.isInsideGrid(cell, currentGridSize()) &&
        floorKeys.has(positionKey(cell)) &&
        (!room || roomHasCell(room, cell)) &&
        !blockedKeys.has(positionKey(cell)),
    );
    if (fits) return position;
    adjacentCells(position)
      .filter((cell) => !visited.has(positionKey(cell)) && window.DungeonGrid.isInsideGrid(cell, currentGridSize()))
      .forEach((cell) => queue.push(cell));
  }
  if (room) {
    const roomPosition = safeRoomSpawnCell(room, originObject.position, blockedKeys, currentGridSize(), floorKeys, footprintSource);
    if (roomPosition) return roomPosition;
  }
  return null;
}

function addRuntimeFighterToDungeon(fighter) {
  if (!fighter?.id) return false;
  state.fighters[fighter.id] = fighter;
  if (state.mode === "combat" && typeof addMonsterToInitiative === "function") addMonsterToInitiative(fighter);
  return true;
}

function spawnMonsterFromContinuousSpawner(object, monsterId) {
  const template = getMonsterTemplate(monsterId);
  if (!template) return null;
  const position = nearestDungeonSpawnPosition(object, template);
  if (!position) return null;
  const monster = createCombatant({
    ...template,
    id: `spawner-${object.id}-${monsterId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    name: template.name,
    position,
  });
  applyMonsterCategoryScaling(monster, activeHero());
  monster.baseMonsterId = template.id;
  monster.templateId = template.id;
  monster.spawnedBySpawnerId = object.id;
  monster.roomId = roomForDungeonPosition(position)?.id ?? roomForDungeonPosition(object.position)?.id ?? "spawner";
  addRuntimeFighterToDungeon(monster);
  return monster;
}

function processContinuousSpawnerObject(object, nowSeconds) {
  if (!object?.spawner || object.spent) return 0;
  const room = roomForDungeonPosition(object.position);
  const roomRevealed = dungeonRoomRevealed(room);
  if (!roomRevealed) return 0;
  const config = object.spawner;
  if (!config.startedAtSeconds) {
    config.startedAtSeconds = nowSeconds;
    config.lastSpawnAtSeconds = nowSeconds;
    return 0;
  }
  const monsterIds = (Array.isArray(config.monsterIds) ? config.monsterIds : String(config.monsterIds ?? "").split(/[,;\n]/))
    .map((entry) => String(entry).trim())
    .filter((monsterId) => getMonsterTemplate(monsterId));
  if (!monsterIds.length) return 0;
  const interval = Math.max(6, Math.floor(Number(config.intervalSeconds) || 60));
  const count = Math.max(1, Math.floor(Number(config.count) || 1));
  const maxAlive = Math.max(1, Math.floor(Number(config.maxAlive) || 8));
  const lastSpawnAt = Number(config.lastSpawnAtSeconds ?? 0) || 0;
  if (nowSeconds - lastSpawnAt < interval) return 0;
  const livingFromSpawner = Object.values(state.fighters ?? {}).filter((fighter) => fighter.spawnedBySpawnerId === object.id && fighter.alive && !fighter.dead).length;
  let remaining = Math.max(0, maxAlive - livingFromSpawner);
  if (remaining <= 0) {
    config.lastSpawnAtSeconds = nowSeconds;
    return 0;
  }
  const batches = Math.min(10, Math.floor((nowSeconds - lastSpawnAt) / interval));
  let spawned = 0;
  for (let batch = 0; batch < batches && remaining > 0; batch += 1) {
    for (let index = 0; index < count && remaining > 0; index += 1) {
      const monsterId = monsterIds[(batch + index + Math.floor(Math.random() * monsterIds.length)) % monsterIds.length];
      if (spawnMonsterFromContinuousSpawner(object, monsterId)) {
        spawned += 1;
        remaining -= 1;
      }
    }
  }
  config.lastSpawnAtSeconds = lastSpawnAt + batches * interval;
  if (spawned) addLog(`${spawned} creature${spawned === 1 ? "" : "s"} emerge nearby.`, "important");
  return spawned;
}

function dungeonRoomRevealed(room) {
  if (showDungeonLayout || !room) return true;
  if ((state.exploration?.discoveredRoomIds ?? []).includes(room.id)) return true;
  return (state.party?.heroIds ?? []).some((id) => {
    const hero = state.fighters?.[id];
    return hero?.alive && roomHasCell(room, hero.position);
  });
}

function createDungeonRecruitHero(object, config, position) {
  const fullConfig = dungeonRecruitParseFullConfig(config);
  const classId = fullConfig.classId || config.classId || defaultContent.heroClass;
  const template = getHeroTemplate(classId);
  const overrides = fullConfig.overrides ? cloneData(fullConfig.overrides) : dungeonRecruitParseOverrides(config);
  const level = Math.max(1, Math.min(20, Math.floor(Number(fullConfig.level ?? config.level ?? overrides.level ?? 1) || 1)));
  const baseMaxHp = overrides.baseMaxHp ?? overrides.maxHp ?? Math.max(template.baseMaxHp ?? template.maxHp ?? 8, (template.baseMaxHp ?? template.maxHp ?? 8) + (level - 1) * 6);
  const hero = createCombatant({
    ...template,
    ...overrides,
    id: overrides.id ?? `recruit-hero-${object.id}-${Date.now()}`,
    name: fullConfig.name || config.name || overrides.name || template.name || "New Hero",
    classId,
    className: template.className ?? template.name,
    level,
    baseMaxHp,
    maxHp: baseMaxHp,
    hp: baseMaxHp,
    tokenArt: fullConfig.tokenArt || config.tokenArt || overrides.tokenArt || template.tokenArt,
    position,
    partyMemberKind: "hero",
    dungeonRecruit: true,
    dungeonRecruitWaiting: true,
    team: "heroes",
    friendly: true,
  });
  hero.token = tokenFromName(hero.name, hero.token);
  hero.partyRole = hero.partyRole ?? defaultPartyRoleForHero(hero);
  return hero;
}

function spawnRecruitMarkerObject(object) {
  if (!object?.recruit || object.recruited || object.spent || object.recruitSpawnedId) return false;
  const room = roomForDungeonPosition(object.position);
  if (!dungeonRoomRevealed(room)) return false;
  const config = object.recruit;
  let recruit = null;
  if (config.kind === "hero") {
    const fullConfig = dungeonRecruitParseFullConfig(config);
    const position = nearestDungeonSpawnPosition(object, getHeroTemplate(fullConfig.classId || config.classId || defaultContent.heroClass));
    if (!position) return false;
    recruit = createDungeonRecruitHero(object, config, position);
  } else {
    const monsterId = config.monsterId;
    const template = getMonsterTemplate(monsterId);
    if (!template) return false;
    const position = nearestDungeonSpawnPosition(object, template);
    if (!position) return false;
    recruit = createFriendlyBeastFromMonster(monsterId, {
      id: `recruit-ally-${object.id}-${Date.now()}`,
      name: config.name || template.name,
      position,
      kind: config.companionKind === "companion" ? "companion" : "ally",
      control: config.control === "player" ? "player" : "ai",
      className: config.companionKind === "companion" ? "Companion" : "Dungeon Ally",
    });
  }
  if (!recruit) return false;
  recruit.roomId = roomForDungeonPosition(recruit.position)?.id ?? roomForDungeonPosition(object.position)?.id ?? "recruit";
  recruit.recruitMarkerId = object.id;
  recruit.dungeonRecruit = true;
  recruit.dungeonRecruitWaiting = true;
  recruit.team = "heroes";
  recruit.friendly = true;
  recruit.recruitDialogue = {
    title: config.dialogueTitle ?? "A Stranger Waits",
    text: config.dialogueText ?? "The recruit looks ready to join your expedition.",
    recruitLabel: config.recruitLabel ?? "Recruit",
    backLabel: config.backLabel ?? "Back",
  };
  state.fighters[recruit.id] = recruit;
  object.recruitSpawnedId = recruit.id;
  addLog(`${recruit.name} waits nearby.`, "important");
  return true;
}

function processDungeonPassiveObjects() {
  if (!gameHasStarted || state?.mode === "home" || state?.completed) return { spawned: 0, recruited: 0 };
  const nowSeconds = dungeonElapsedSeconds({ sync: true });
  let spawned = 0;
  let recruited = 0;
  for (const object of state.dungeonObjects ?? []) {
    spawned += processContinuousSpawnerObject(object, nowSeconds);
    if (spawnRecruitMarkerObject(object)) recruited += 1;
  }
  return { spawned, recruited };
}

function homeHeroPositions(heroIds) {
  return heroIds.map((id, index) => ({ id, position: { x: 13 + (index % 4), y: 15 + Math.floor(index / 4) } }));
}

function defaultHomeCells() {
  return [
    [16, 10], [17, 10], [18, 10], [19, 10],
    [16, 11], [17, 11], [18, 11], [19, 11],
    [16, 12], [17, 12], [18, 12], [19, 12],
    [16, 13], [16, 14], [17, 14], [18, 14], [19, 14],
    [15, 14], [16, 15], [17, 15], [18, 15], [19, 15],
    [15, 15], [15, 16], [16, 16], [17, 16], [18, 16], [19, 16],
    [16, 17], [16, 18], [17, 18], [18, 18], [19, 18],
    [16, 19], [17, 19], [18, 19], [19, 19],
    [16, 20], [17, 20], [18, 20], [19, 20],
    [12, 10], [13, 10], [14, 10],
    [12, 11], [13, 11], [14, 11],
    [12, 12], [13, 12], [14, 12],
    [13, 13],
    [12, 14], [13, 14], [14, 14],
    [12, 15], [13, 15], [14, 15],
    [12, 16], [13, 16], [14, 16],
    [13, 17],
    [12, 18], [13, 18], [14, 18],
    [12, 19], [13, 19], [14, 19],
    [12, 20], [13, 20], [14, 20],
    [8, 14], [9, 14], [10, 14],
    [8, 15], [9, 15], [10, 15], [11, 15],
    [8, 16], [9, 16], [10, 16],
  ].map(([x, y]) => ({ x, y }));
}

function createDefaultHomeLayout() {
  return {
    gridSize: 30,
    cells: defaultHomeCells(),
    doors: [
      { x: 19, y: 15, edge: "east", corridor: { x: 20, y: 15 }, roomId: "home-room", to: "outside" },
      { x: 11, y: 15, edge: "east", corridor: { x: 12, y: 15 }, roomId: "home-room", to: "home-room" },
      { x: 13, y: 13, edge: "south", corridor: { x: 13, y: 14 }, roomId: "home-room", to: "home-room" },
      { x: 13, y: 16, edge: "south", corridor: { x: 13, y: 17 }, roomId: "home-room", to: "home-room" },
      { x: 16, y: 16, edge: "south", corridor: { x: 16, y: 17 }, roomId: "home-room", to: "home-room" },
      { x: 16, y: 13, edge: "south", corridor: { x: 16, y: 14 }, roomId: "home-room", to: "home-room" },
    ],
    herbsReady: true,
    specialPositions: {
      chest: { x: 18, y: 10 },
      planningTable: { x: 17, y: 19 },
    },
    floorColors: {},
    wallColors: {},
    unlockedFurniture: [],
    objects: [
      { id: "home-bookshelf", type: "home-bookshelf", position: { x: 16, y: 10 }, width: 1, height: 1, homePlaced: true },
      { id: "home-starter-bed", type: "shabby-hay-bed", position: { x: 12, y: 20 }, width: 1, height: 1, homePlaced: true, assignedHeroId: "hero" },
    ],
  };
}

function playtestTuningValue(path, fallback) {
  const keys = String(path).split(".");
  let value = window.DungeonPlaytestTuning;
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return fallback;
  }
  return value ?? fallback;
}

function playtestTuningNumber(path, fallback) {
  const value = Number(playtestTuningValue(path, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function playtestTuningObject(path, fallback = {}) {
  const value = playtestTuningValue(path, fallback);
  return value && typeof value === "object" && !Array.isArray(value) ? { ...fallback, ...value } : { ...fallback };
}

function combatRoundSeconds() {
  return Math.max(1, playtestTuningNumber("time.combatRoundSeconds", 6));
}

function shortRestDurationSeconds() {
  return Math.max(0, playtestTuningNumber("time.shortRestSeconds", 3600));
}

function shortRestLimitForTheme(theme, fallback = 3) {
  const override = window.DungeonPlaytestTuning?.time?.shortRestLimitOverride;
  if (override !== null && override !== undefined) return Math.max(0, Math.floor(Number(override) || 0));
  return theme?.rest?.shortRestLimit ?? fallback;
}

const dungeonClockScale = Math.max(1, playtestTuningNumber("time.explorationTimeScale", 60));
let dungeonClockRuntimePaused = false;

function createDungeonClock(overrides = {}) {
  return {
    elapsedSeconds: Math.max(0, Number(overrides.elapsedSeconds ?? 0) || 0),
    explorationScale: Math.max(1, Number(overrides.explorationScale ?? dungeonClockScale) || dungeonClockScale),
    paused: Boolean(overrides.paused),
    lastRealMs: Number(overrides.lastRealMs) || Date.now(),
  };
}

function normalizeWorldDay(day = 1) {
  return Math.max(1, Math.floor(Number(day) || 1));
}

function campaignElapsedSeconds(options = {}) {
  const daySeconds = (normalizeWorldDay(state?.worldDay) - 1) * 24 * 60 * 60;
  const dungeonSeconds = state?.mode !== "home" ? dungeonElapsedSeconds(options) : 0;
  return daySeconds + dungeonSeconds;
}

function advanceWorldDay(days = 1) {
  if (!state) return 1;
  state.worldDay = normalizeWorldDay(state.worldDay) + Math.max(0, Math.floor(Number(days) || 0));
  return state.worldDay;
}

function dungeonClockApplies() {
  return gameHasStarted && state?.mode !== "home" && !state?.completed;
}

function ensureDungeonClock() {
  if (!state) return null;
  if (!state.dungeonClock || typeof state.dungeonClock !== "object") {
    state.dungeonClock = createDungeonClock();
  } else {
    state.dungeonClock.elapsedSeconds = Math.max(0, Number(state.dungeonClock.elapsedSeconds ?? 0) || 0);
    state.dungeonClock.explorationScale = Math.max(1, Number(state.dungeonClock.explorationScale ?? dungeonClockScale) || dungeonClockScale);
    state.dungeonClock.paused = Boolean(state.dungeonClock.paused || dungeonClockRuntimePaused);
    state.dungeonClock.lastRealMs = Number(state.dungeonClock.lastRealMs) || Date.now();
  }
  if (dungeonClockRuntimePaused) state.dungeonClock.paused = true;
  return state.dungeonClock;
}

function syncDungeonClock(nowMs = Date.now()) {
  const clock = ensureDungeonClock();
  if (!clock) return 0;
  if (!dungeonClockApplies() || state.mode === "combat" || dungeonClockIsPaused()) {
    clock.lastRealMs = nowMs;
    return 0;
  }
  const realDeltaSeconds = Math.max(0, (nowMs - (clock.lastRealMs ?? nowMs)) / 1000);
  clock.lastRealMs = nowMs;
  const gameDeltaSeconds = realDeltaSeconds * (clock.explorationScale ?? dungeonClockScale);
  if (gameDeltaSeconds > 0) clock.elapsedSeconds += gameDeltaSeconds;
  return gameDeltaSeconds;
}

function dungeonClockIsPaused() {
  return Boolean(dungeonClockRuntimePaused || state?.dungeonClock?.paused);
}

function dungeonElapsedSeconds(options = {}) {
  if (options.sync === true && !dungeonClockIsPaused()) syncDungeonClock();
  return Math.floor(state?.dungeonClock?.elapsedSeconds ?? 0);
}

function setDungeonClockPaused(paused) {
  const clock = ensureDungeonClock();
  if (!clock) return;
  const nextPaused = Boolean(paused);
  if (nextPaused && !dungeonClockIsPaused()) syncDungeonClock();
  dungeonClockRuntimePaused = nextPaused;
  clock.paused = nextPaused;
  clock.lastRealMs = Date.now();
}

function toggleDungeonClockPaused() {
  ensureDungeonClock();
  setDungeonClockPaused(!dungeonClockIsPaused());
}

function advanceDungeonTime(seconds, reason = "", options = {}) {
  const amount = Math.max(0, Number(seconds) || 0);
  const clock = ensureDungeonClock();
  if (!clock || amount <= 0) return 0;
  syncDungeonClock();
  if (dungeonClockIsPaused() && !options.force) return 0;
  clock.elapsedSeconds += amount;
  if (reason) addLog(`${reason} advances dungeon time by ${formatDuration(amount)}.`, "important");
  return expireTimedDungeonEffects();
}

function durationSecondsFromDefinition(source = {}) {
  const duration = source.duration ?? source;
  if (duration.seconds || source.durationSeconds) return Number(duration.seconds ?? source.durationSeconds) || 0;
  if (duration.minutes || source.durationMinutes) return (Number(duration.minutes ?? source.durationMinutes) || 0) * 60;
  if (duration.hours || source.durationHours) return (Number(duration.hours ?? source.durationHours) || 0) * 3600;
  if (duration.days || source.durationDays) return (Number(duration.days ?? source.durationDays) || 0) * 24 * 3600;
  if (duration.rounds || source.durationRounds) return (Number(duration.rounds ?? source.durationRounds) || 0) * combatRoundSeconds();
  return 0;
}

const corpseRevivifyWindowSeconds = 60;
const corpseRaiseDeadWindowSeconds = 10 * 24 * 60 * 60;
const corpseGentleReposeSeconds = 10 * 24 * 60 * 60;

function ensureHeroCorpseState(hero, options = {}) {
  if (!hero?.dead) return null;
  const nowDungeonSeconds = dungeonElapsedSeconds({ sync: false });
  const nowCampaignSeconds = campaignElapsedSeconds({ sync: false });
  const previous = hero.corpse && typeof hero.corpse === "object" ? hero.corpse : {};
  const diedAtDungeonTimeSeconds = Math.max(0, Math.floor(Number(previous.diedAtDungeonTimeSeconds ?? options.diedAtDungeonTimeSeconds ?? nowDungeonSeconds) || 0));
  const legacyAgeSeconds = Math.max(0, nowDungeonSeconds - diedAtDungeonTimeSeconds);
  const diedAtCampaignTimeSeconds = Math.max(
    0,
    Math.floor(Number(previous.diedAtCampaignTimeSeconds ?? options.diedAtCampaignTimeSeconds ?? nowCampaignSeconds - legacyAgeSeconds) || 0),
  );
  const legacyPreservedRemaining = Math.max(0, Math.floor(Number(previous.preservedUntilDungeonTimeSeconds ?? 0) || 0) - nowDungeonSeconds);
  const preservedUntilCampaignTimeSeconds = Math.max(
    0,
    Math.floor(Number(previous.preservedUntilCampaignTimeSeconds ?? (legacyPreservedRemaining > 0 ? nowCampaignSeconds + legacyPreservedRemaining : 0)) || 0),
  );
  hero.corpse = {
    diedAtDungeonTimeSeconds,
    diedAtCampaignTimeSeconds,
    location: options.location ?? previous.location ?? (previous.sentHome || hero.corpseAtBase ? "base" : "dungeon"),
    preservedUntilDungeonTimeSeconds: Math.max(0, Math.floor(Number(previous.preservedUntilDungeonTimeSeconds ?? 0) || 0)),
    preservedUntilCampaignTimeSeconds,
    transportedAtDungeonTimeSeconds: previous.transportedAtDungeonTimeSeconds ?? null,
    transportedAtCampaignTimeSeconds: previous.transportedAtCampaignTimeSeconds ?? null,
    revivedAtDungeonTimeSeconds: previous.revivedAtDungeonTimeSeconds ?? null,
    revivedAtCampaignTimeSeconds: previous.revivedAtCampaignTimeSeconds ?? null,
  };
  hero.corpseAtBase = hero.corpse.location === "base";
  return hero.corpse;
}

function heroCorpseLocation(hero) {
  if (!hero?.dead) return null;
  return ensureHeroCorpseState(hero)?.location ?? "dungeon";
}

function corpsePreserved(hero, nowSeconds = campaignElapsedSeconds({ sync: false })) {
  const corpse = ensureHeroCorpseState(hero);
  return Boolean(corpse && (corpse.preservedUntilCampaignTimeSeconds ?? 0) > nowSeconds);
}

function corpseAgeSeconds(hero, nowSeconds = campaignElapsedSeconds({ sync: false })) {
  const corpse = ensureHeroCorpseState(hero);
  if (!corpse) return 0;
  return Math.max(0, nowSeconds - (corpse.diedAtCampaignTimeSeconds ?? nowSeconds));
}

function corpseEffectiveAgeSeconds(hero, nowSeconds = campaignElapsedSeconds({ sync: false })) {
  if (corpsePreserved(hero, nowSeconds)) return 0;
  return corpseAgeSeconds(hero, nowSeconds);
}

function corpseDecompositionStatus(hero, nowSeconds = campaignElapsedSeconds({ sync: false })) {
  const corpse = ensureHeroCorpseState(hero);
  if (!corpse) return { label: "Alive", detail: "" };
  if (corpsePreserved(hero, nowSeconds)) {
    return {
      label: "Preserved",
      detail: `Gentle Repose holds decay for ${formatDuration((corpse.preservedUntilCampaignTimeSeconds ?? nowSeconds) - nowSeconds)}.`,
    };
  }
  const age = corpseAgeSeconds(hero, nowSeconds);
  if (age <= corpseRevivifyWindowSeconds) return { label: "Fresh", detail: `${formatDuration(age)} since death. Revivify is still viable.` };
  if (age <= corpseRaiseDeadWindowSeconds) return { label: "Decaying", detail: `${formatDuration(age)} since death. Raise Dead remains viable.` };
  return { label: "Decomposed", detail: `${formatDuration(age)} since death. Strong resurrection magic is required.` };
}

function deadRosterHeroes() {
  return rosterHeroes().filter((hero) => isClassHero(hero) && hero.dead);
}

function prepareTimedEffect(effect) {
  if (!effect || effect.expiresAtDungeonTimeSeconds || effect.expiresAtEndOfTurn || effect.expiresAtStartOfTurn) return effect;
  if (effect.startsOnNextEncounter && state?.mode !== "combat") return { ...effect };
  const durationSeconds = durationSecondsFromDefinition(effect);
  if (durationSeconds <= 0) return effect;
  const prepared = { ...effect, startsOnNextEncounter: false, durationSeconds };
  prepared.expiresAtDungeonTimeSeconds = dungeonElapsedSeconds({ sync: false }) + durationSeconds;
  return prepared;
}

function conditionDefinitions() {
  return {
    banished: {
      label: "Banished",
      speedLocked: true,
      actionLocked: true,
      ignoredByMonsters: true,
      conditionDescription: "Removed from the fight in this engine: cannot act, move, or be selected by monster targeting.",
    },
    blinded: {
      label: "Blinded",
      attackBonus: -3,
      incomingAttackAdvantage: true,
      conditionDescription: "Cannot see: attacks are penalized and attackers gain advantage.",
    },
    charmed: {
      label: "Charmed",
      attackBonus: -2,
      conditionDescription: "Magically influenced. The tabletop target-specific attack restriction is approximated as an attack penalty.",
    },
    deafened: {
      label: "Deafened",
      conditionDescription: "Cannot hear. No direct combat penalty exists yet in this engine.",
    },
    exhaustion: {
      label: "Exhaustion",
      conditionDescription: "Fatigued. Exhaustion is cumulative: checks suffer first, then speed, attacks/saves, maximum HP, and finally movement.",
    },
    frightened: {
      label: "Frightened",
      attackBonus: -2,
      skillBonus: -2,
      conditionDescription: "Afraid: attacks and checks are penalized.",
    },
    grappled: {
      label: "Grappled",
      speedLocked: true,
      conditionDescription: "Speed becomes 0 until the grapple ends.",
    },
    incapacitated: {
      label: "Incapacitated",
      actionLocked: true,
      conditionDescription: "Cannot take actions, bonus actions, or reactions.",
    },
    invisible: {
      label: "Invisible",
      attackAdvantage: true,
      stealthAdvantage: true,
      ignoredByMonsters: true,
      conditionDescription: "Unseen: attacks gain advantage, stealth improves, and monsters avoid targeting the creature.",
    },
    paralyzed: {
      label: "Paralyzed",
      speedLocked: true,
      actionLocked: true,
      incomingAttackAdvantage: true,
      saveBonus: -2,
      autoFailSaves: ["str", "dex"],
      meleeAutoCritical: true,
      conditionDescription: "Cannot move or act. Attackers gain advantage; save penalties approximate failed STR/DEX saves.",
    },
    petrified: {
      label: "Petrified",
      speedLocked: true,
      actionLocked: true,
      incomingAttackAdvantage: true,
      acBonus: 2,
      autoFailSaves: ["str", "dex"],
      resistances: ["bludgeoning", "piercing", "slashing"],
      conditionDescription: "Turned to stone: cannot act or move, harder to damage physically, but attackers gain advantage.",
    },
    poisoned: {
      label: "Poisoned",
      attackBonus: -2,
      skillBonus: -2,
      conditionDescription: "Sickened by poison: attacks and checks are penalized.",
    },
    prone: {
      label: "Prone",
      prone: true,
      attackBonus: -2,
      speedBonusFeet: -10,
      incomingAttackAdvantage: true,
      conditionDescription: "On the ground: attacks are penalized, movement is reduced, and nearby attackers gain advantage.",
    },
    restrained: {
      label: "Restrained",
      speedLocked: true,
      attackBonus: -2,
      incomingAttackAdvantage: true,
      saveBonus: -1,
      saveDisadvantageAbilities: ["dex"],
      conditionDescription: "Held in place: speed is 0, attacks are penalized, attackers gain advantage, and saves are slightly reduced.",
    },
    stunned: {
      label: "Stunned",
      speedLocked: true,
      actionLocked: true,
      incomingAttackAdvantage: true,
      saveBonus: -2,
      autoFailSaves: ["str", "dex"],
      conditionDescription: "Cannot move or act. Attackers gain advantage; save penalties approximate failed STR/DEX saves.",
    },
    unconscious: {
      label: "Unconscious",
      speedLocked: true,
      actionLocked: true,
      incomingAttackAdvantage: true,
      prone: true,
      autoFailSaves: ["str", "dex"],
      meleeAutoCritical: true,
      conditionDescription: "Helpless and prone: cannot move or act, and attackers gain advantage.",
    },
  };
}

function conditionAliasMap() {
  return {
    asleep: "unconscious",
    banish: "banished",
    banished: "banished",
    beguiled: "charmed",
    blind: "blinded",
    blinded: "blinded",
    charm: "charmed",
    charmed: "charmed",
    deaf: "deafened",
    deafened: "deafened",
    disabled: "incapacitated",
    dominated: "charmed",
    dominatedmonster: "charmed",
    dominatedperson: "charmed",
    exhaustion: "exhaustion",
    frightened: "frightened",
    grapple: "grappled",
    grappled: "grappled",
    held: "paralyzed",
    incapacitated: "incapacitated",
    invisible: "invisible",
    invisibility: "invisible",
    paralysis: "paralyzed",
    paralyzed: "paralyzed",
    petrification: "petrified",
    petrified: "petrified",
    petrifying: "petrified",
    poison: "poisoned",
    poisoned: "poisoned",
    prone: "prone",
    restrained: "restrained",
    stun: "stunned",
    stunned: "stunned",
    unconscious: "unconscious",
  };
}

function normalizedConditionKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function canonicalConditionId(value) {
  const key = normalizedConditionKey(value);
  if (!key) return "";
  return conditionAliasMap()[key] ?? "";
}

function conditionDefinitionFor(value) {
  const id = canonicalConditionId(value);
  return id ? conditionDefinitions()[id] : null;
}

function conditionValueList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function fighterConditionImmunities(fighter) {
  const entries = [
    ...conditionValueList(fighter?.conditionImmunities),
    ...conditionValueList(fighter?.conditionImmunity),
    ...conditionValueList(fighter?.immunities?.conditions),
  ];
  return new Set(entries.map(canonicalConditionId).filter(Boolean));
}

function fighterIsImmuneToCondition(fighter, conditionId) {
  const canonical = canonicalConditionId(conditionId);
  return Boolean(canonical && fighterConditionImmunities(fighter).has(canonical));
}

function fighterIsImmuneToDisease(fighter) {
  if (!fighter) return false;
  if (fighter.classId === "paladin" && (fighter.level ?? 1) >= 3) return true;
  const entries = [
    ...conditionValueList(fighter.diseaseImmunity),
    ...conditionValueList(fighter.diseaseImmunities),
    ...conditionValueList(fighter.immunities?.diseases),
  ];
  return entries.some((entry) => entry === true || String(entry).toLowerCase() === "all" || String(entry).toLowerCase() === "disease");
}

function mergeConditionLists(current = [], added = []) {
  return Array.from(new Set([...(current ?? []), ...(added ?? [])].filter(Boolean)));
}

function inferConditionIdFromEffect(effect = {}) {
  return canonicalConditionId(effect.condition) || canonicalConditionId(effect.id) || canonicalConditionId(effect.label);
}

function mergedConditionNumber(current, baseline) {
  if (baseline == null) return current;
  if (current == null) return baseline;
  if (baseline < 0) return Math.min(current, baseline);
  if (baseline > 0) return Math.max(current, baseline);
  return current;
}

function exhaustionLevelForEffect(effect = {}) {
  return Math.max(1, Math.min(6, Math.floor(Number(effect.exhaustionLevel ?? effect.level ?? effect.stacks ?? 1) || 1)));
}

function exhaustionDefinitionForLevel(level = 1) {
  const definition = { ...conditionDefinitions().exhaustion };
  const parts = [];
  if (level >= 1) {
    definition.skillBonus = -2;
    parts.push("ability checks are penalized");
  }
  if (level >= 2) {
    definition.speedMultiplier = 0.5;
    parts.push("speed is halved");
  }
  if (level >= 3) {
    definition.attackBonus = -2;
    definition.saveBonus = -2;
    parts.push("attacks and saves are penalized");
  }
  if (level >= 4) {
    definition.maxHpMultiplier = 0.5;
    parts.push("maximum HP is halved");
  }
  if (level >= 5) {
    definition.speedLocked = true;
    parts.push("speed becomes 0");
  }
  if (level >= 6) {
    definition.actionLocked = true;
    definition.incomingAttackAdvantage = true;
    parts.push("collapse is fatal in tabletop rules");
  }
  definition.label = `Exhaustion ${level}`;
  definition.conditionDescription = `Exhaustion level ${level}: ${parts.join(", ")}.`;
  return definition;
}

function normalizeConditionEffect(effect = {}) {
  if (!effect || typeof effect !== "object") return effect;
  const conditionId = inferConditionIdFromEffect(effect);
  if (!conditionId) return { ...effect };
  const exhaustionLevel = conditionId === "exhaustion" ? exhaustionLevelForEffect(effect) : null;
  const definition = conditionId === "exhaustion" ? exhaustionDefinitionForLevel(exhaustionLevel) : conditionDefinitions()[conditionId];
  if (!definition) return { ...effect };
  const normalized = {
    ...effect,
    condition: conditionId,
    conditionLabel: definition.label,
    conditionDescription: effect.conditionDescription ?? definition.conditionDescription,
  };
  if (exhaustionLevel) normalized.exhaustionLevel = exhaustionLevel;
  if (!normalized.label) normalized.label = definition.label;
  if (conditionId === "exhaustion") normalized.label = definition.label;
  for (const key of ["acBonus", "attackBonus", "damageBonus", "saveBonus", "skillBonus", "speedBonusFeet"]) {
    normalized[key] = mergedConditionNumber(normalized[key], definition[key]);
  }
  for (const key of ["maxHpMultiplier", "speedMultiplier"]) {
    if (definition[key] != null && normalized[key] == null) normalized[key] = definition[key];
  }
  for (const key of ["actionLocked", "attackAdvantage", "ignoredByMonsters", "incomingAttackAdvantage", "meleeAutoCritical", "prone", "speedLocked", "stealthAdvantage"]) {
    if (definition[key] && normalized[key] == null) normalized[key] = true;
  }
  if (definition.resistances?.length) normalized.resistances = mergeConditionLists(normalized.resistances, definition.resistances);
  if (definition.vulnerabilities?.length) normalized.vulnerabilities = mergeConditionLists(normalized.vulnerabilities, definition.vulnerabilities);
  if (definition.autoFailSaves?.length) normalized.autoFailSaves = mergeConditionLists(normalized.autoFailSaves, definition.autoFailSaves);
  if (definition.saveDisadvantageAbilities?.length) normalized.saveDisadvantageAbilities = mergeConditionLists(normalized.saveDisadvantageAbilities, definition.saveDisadvantageAbilities);
  return normalized;
}

function normalizeStatusEffectsForFighter(fighter) {
  if (!fighter?.statusEffects?.length) return [];
  return fighter.statusEffects
    .filter((effect) => !(effect?.disease || effect?.diseaseId) || !fighterIsImmuneToDisease(fighter))
    .map((effect) => normalizeConditionEffect(effect));
}

function timedEffectRemainingSeconds(effect) {
  if (!effect?.expiresAtDungeonTimeSeconds) return null;
  return Math.max(0, Math.ceil(effect.expiresAtDungeonTimeSeconds - dungeonElapsedSeconds({ sync: false })));
}

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m ${String(remainder).padStart(2, "0")}s`;
  if (minutes > 0) return `${minutes}m ${String(remainder).padStart(2, "0")}s`;
  return `${remainder}s`;
}

function formatDungeonClockTime(totalSeconds = dungeonElapsedSeconds({ sync: false })) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function expireTimedEffectsForFighter(fighter, nowSeconds = dungeonElapsedSeconds({ sync: false })) {
  if (!fighter?.statusEffects?.length) return 0;
  const expired = [];
  const expiredEffects = [];
  fighter.statusEffects = fighter.statusEffects.filter((effect) => {
    if (!effect.expiresAtDungeonTimeSeconds || effect.expiresAtDungeonTimeSeconds > nowSeconds) return true;
    expired.push(effect.label ?? effect.id);
    expiredEffects.push(effect);
    return false;
  });
  if (expiredEffects.some((effect) => effect.id === "dominated")) {
    fighter.team = undefined;
    fighter.friendly = false;
    addLog(`${fighter.name} shakes off domination and turns hostile again.`, "important");
  }
  for (const effect of expiredEffects) {
    if (!effect.consumeLightItemOnExpire || !effect.lightItemId) continue;
    const item = itemForId(fighter, effect.lightItemId);
    if (!item) continue;
    consumeInventoryItemQuantity(fighter, effect.lightItemId, 1);
    addLog(`${fighter.name}'s ${item.name} burns out${item.stackable && (item.quantity ?? 0) > 0 ? ` (${item.quantity} left)` : ""}.`, "important");
  }
  if (expired.length) {
    refreshDerivedStats(fighter);
    addLog(`${fighter.name}'s ${expired.join(", ")} ${expired.length === 1 ? "expires" : "expire"}.`);
  }
  return expired.length;
}

function expireTimedSpellAreas(nowSeconds = dungeonElapsedSeconds({ sync: false })) {
  if (!state?.spellAreas?.length) return 0;
  const expired = [];
  state.spellAreas = state.spellAreas.filter((area) => {
    if (!area.expiresAtDungeonTimeSeconds || area.expiresAtDungeonTimeSeconds > nowSeconds) return true;
    expired.push(area.spellName ?? area.spellId);
    return false;
  });
  for (const name of expired) addLog(`${name} fades from the battlefield.`);
  return expired.length;
}

function expireTimedSummonedAllies(nowSeconds = dungeonElapsedSeconds({ sync: false })) {
  const expiredIds = Object.values(state?.fighters ?? {})
    .filter((fighter) => fighter.summonedByHeroId && fighter.summonExpiresAtDungeonTimeSeconds && fighter.summonExpiresAtDungeonTimeSeconds <= nowSeconds)
    .map((fighter) => fighter.id);
  for (const id of expiredIds) {
    const ally = state.fighters[id];
    if (ally) addLog(`${ally.name} fades as the summoning ends.`, "important");
    delete state.fighters[id];
  }
  if (expiredIds.length) {
    state.party.heroIds = (state.party.heroIds ?? []).filter((id) => !expiredIds.includes(id));
    state.party.rosterIds = (state.party.rosterIds ?? []).filter((id) => !expiredIds.includes(id));
    state.initiative = (state.initiative ?? []).filter((entry) => !expiredIds.includes(entry.fighterId));
  }
  return expiredIds.length;
}

function clearExpiredConcentrations() {
  let cleared = 0;
  const activeConcentrationIds = new Set();
  for (const fighter of Object.values(state?.fighters ?? {})) {
    for (const effect of fighter.statusEffects ?? []) {
      if (effect.concentrationId) activeConcentrationIds.add(effect.concentrationId);
    }
  }
  for (const area of state?.spellAreas ?? []) {
    if (area.concentrationId) activeConcentrationIds.add(area.concentrationId);
  }
  for (const fighter of Object.values(state?.fighters ?? {})) {
    const id = fighter.concentration?.id;
    if (!id || activeConcentrationIds.has(id)) continue;
    const spellName = fighter.concentration.spellName;
    fighter.concentration = null;
    cleared += 1;
    addLog(`${fighter.name}'s concentration on ${spellName} ends (duration expired).`, "important");
  }
  return cleared;
}

function expireTimedDungeonEffects() {
  const nowSeconds = dungeonElapsedSeconds({ sync: false });
  let expiredCount = 0;
  if (typeof processTimedAfflictions === "function") expiredCount += processTimedAfflictions(nowSeconds);
  for (const fighter of Object.values(state?.fighters ?? {})) {
    expiredCount += expireTimedEffectsForFighter(fighter, nowSeconds);
  }
  expiredCount += expireTimedSummonedAllies(nowSeconds);
  expiredCount += expireTimedSpellAreas(nowSeconds);
  expiredCount += clearExpiredConcentrations();
  return expiredCount;
}

function startNextEncounterEffects() {
  let started = 0;
  for (const fighter of Object.values(state?.fighters ?? {})) {
    if (!fighter?.statusEffects?.length) continue;
    fighter.statusEffects = fighter.statusEffects.map((effect) => {
      if (!effect?.startsOnNextEncounter || effect.expiresAtDungeonTimeSeconds) return effect;
      started += 1;
      return prepareTimedEffect(effect);
    });
  }
  return started;
}

function normalizeHomeData(home = null) {
  const fallback = createDefaultHomeLayout();
  const legacySmallHome = Boolean(home) && Math.floor(home?.gridSize ?? 0) <= 14 && (!Array.isArray(home?.cells) || home.cells.length <= 120);
  const legacyGeneratedLargeHome =
    Boolean(home) &&
    Math.floor(home?.gridSize ?? 0) === 24 &&
    Array.isArray(home?.cells) &&
    home.cells.length >= 300 &&
    home.cells.every((cell) => cell.x >= 0 && cell.x < 18 && cell.y >= 0 && cell.y < 18);
  const useFreshDefault = legacySmallHome || legacyGeneratedLargeHome;
  const gridSize = useFreshDefault ? fallback.gridSize : Math.max(10, Math.min(30, Math.floor(home?.gridSize ?? fallback.gridSize)));
  const sourceDoors = useFreshDefault ? fallback.doors : Array.isArray(home?.doors) ? home.doors : fallback.doors;
  const outsideDoor = sourceDoors.map((door) => normalizeHomeDoor(door)).find((door) => door?.to === "outside") ?? fallback.doors[0];
  const reservedNoFloorKeys = reservedHomeNoFloorKeys(outsideDoor, gridSize);
  const seen = new Set();
  const sourceCells = useFreshDefault
    ? fallback.cells
    : Array.isArray(home?.cells) && home.cells.length
      ? home.cells
      : fallback.cells;
  const cells = sourceCells
    .map((cell) => ({ x: Math.floor(cell.x), y: Math.floor(cell.y) }))
    .filter((cell) => cell.x >= 0 && cell.y >= 0 && cell.x < gridSize && cell.y < gridSize)
    .filter((cell) => !reservedNoFloorKeys.has(positionKey(cell)))
    .filter((cell) => {
      const key = positionKey(cell);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const cellKeys = new Set(cells.map(positionKey));
  const doors = sourceDoors
    .map((door) => normalizeHomeDoor(door))
    .filter(Boolean)
    .filter((door) => cellKeys.has(positionKey(door)))
    .filter((door) => door.to === "outside" || cellKeys.has(positionKey(door.corridor)));
  if (!doors.some((door) => door.to === "outside") && cellKeys.has(positionKey(fallback.doors[0]))) {
    doors.push({ ...fallback.doors[0] });
  }
  const specialPositions = {
    chest: normalizeHomeSpecialPosition(home?.specialPositions?.chest, fallback.specialPositions.chest, cellKeys),
    planningTable: normalizeHomeSpecialPosition(home?.specialPositions?.planningTable, fallback.specialPositions.planningTable, cellKeys),
  };
  const sourceObjects = useFreshDefault ? fallback.objects : Array.isArray(home?.objects) ? home.objects : fallback.objects;
  const objects = sourceObjects
    .map((object, index) => {
      const template = objectTemplate(object.type);
      if (!template) return null;
      return {
        ...object,
        id: object.id ?? `home-object-${index + 1}`,
        position: { x: Math.floor(object.position?.x ?? 0), y: Math.floor(object.position?.y ?? 0) },
        width: object.width ?? template.width ?? 1,
        height: object.height ?? template.height ?? 1,
        rotation: normalizeObjectRotation(object.rotation),
        homePlaced: true,
        items: Array.isArray(object.items) ? object.items.map(normalizeItem) : [],
      };
    })
    .filter(Boolean)
    .filter((object) => objectCells(object).every((cell) => cellKeys.has(positionKey(cell))));
  const floorColors = normalizeHomeColorMap(home?.floorColors, cellKeys);
  const wallColors = normalizeHomeWallColorMap(home?.wallColors, cellKeys, gridSize);
  const unlockedFurniture = uniqueValues((home?.unlockedFurniture ?? []).filter((id) => typeof id === "string" && objectTemplate(id)));
  return { gridSize, cells, doors, objects, specialPositions, floorColors, wallColors, unlockedFurniture, herbsReady: home?.herbsReady !== false };
}

function normalizeHomeColorMap(map = {}, allowedKeys = null) {
  const normalized = {};
  for (const [key, color] of Object.entries(map ?? {})) {
    if (allowedKeys && !allowedKeys.has(key)) continue;
    const normalizedColor = normalizeHomeColor(color);
    if (normalizedColor) normalized[key] = normalizedColor;
  }
  return normalized;
}

function normalizeHomeColor(color) {
  const value = String(color ?? "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toLowerCase();
  const rgba = /^rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(0|1|0?\.\d+)\s*\)$/i.exec(value);
  if (!rgba) return null;
  const channels = rgba.slice(1, 4).map(Number);
  if (channels.some((channel) => channel < 0 || channel > 255)) return null;
  const alpha = Math.max(0, Math.min(1, Number(rgba[4])));
  return `rgba(${channels[0]}, ${channels[1]}, ${channels[2]}, ${Number(alpha.toFixed(2))})`;
}

function normalizeObjectRotation(rotation = 0) {
  const numeric = Number(rotation);
  if (!Number.isFinite(numeric)) return 0;
  const normalized = ((Math.round(numeric / 90) * 90) % 360 + 360) % 360;
  return normalized;
}

function objectRotatedSize(objectOrTemplate = {}, rotation = objectOrTemplate.rotation ?? 0) {
  const width = Math.max(1, Math.floor(objectOrTemplate.width ?? 1));
  const height = Math.max(1, Math.floor(objectOrTemplate.height ?? 1));
  const normalized = normalizeObjectRotation(rotation);
  return normalized === 90 || normalized === 270 ? { width: height, height: width } : { width, height };
}

function normalizeHomeWallColorMap(map = {}, cellKeys = new Set(), gridSize = 30) {
  const normalized = {};
  for (const [key, color] of Object.entries(map ?? {})) {
    const [rawX, rawY, edge] = key.split(",");
    const x = Number(rawX);
    const y = Number(rawY);
    if (!Number.isInteger(x) || !Number.isInteger(y) || !["north", "east", "south", "west"].includes(edge)) continue;
    if (!cellKeys.has(positionKey({ x, y }))) continue;
    const neighbor =
      edge === "north"
        ? { x, y: y - 1 }
        : edge === "east"
          ? { x: x + 1, y }
          : edge === "south"
            ? { x, y: y + 1 }
            : { x: x - 1, y };
    if (neighbor.x < 0 || neighbor.y < 0 || neighbor.x >= gridSize || neighbor.y >= gridSize || cellKeys.has(positionKey(neighbor))) continue;
    const normalizedColor = normalizeHomeColor(color);
    if (normalizedColor) normalized[key] = normalizedColor;
  }
  return normalized;
}

function normalizeHomeSpecialPosition(position, fallback, cellKeys) {
  const normalized = { x: Math.floor(position?.x ?? fallback.x), y: Math.floor(position?.y ?? fallback.y) };
  return cellKeys.has(positionKey(normalized)) ? normalized : { ...fallback };
}

function normalizeHomeDoor(door) {
  const x = Math.floor(door?.x);
  const y = Math.floor(door?.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;
  const edge = ["north", "east", "south", "west"].includes(door.edge) ? door.edge : door.corridor?.y < y ? "north" : door.corridor?.x > x ? "east" : door.corridor?.y > y ? "south" : "west";
  const delta = edge === "north" ? { x: 0, y: -1 } : edge === "east" ? { x: 1, y: 0 } : edge === "south" ? { x: 0, y: 1 } : { x: -1, y: 0 };
  return {
    x,
    y,
    edge,
    corridor: { x: x + delta.x, y: y + delta.y },
    roomId: "home-room",
    to: door.to ?? "home-room",
  };
}

function reservedHomeNoFloorKeys(door, gridSize = 30) {
  const keys = new Set();
  const edge = door?.edge ?? "east";
  const forward = edge === "north" ? { x: 0, y: -1 } : edge === "east" ? { x: 1, y: 0 } : edge === "south" ? { x: 0, y: 1 } : { x: -1, y: 0 };
  const side = edge === "north" || edge === "south" ? { x: 1, y: 0 } : { x: 0, y: 1 };
  for (let depth = 1; depth <= 3; depth += 1) {
    for (let offset = -1; offset <= 1; offset += 1) {
      const cell = {
        x: door.x + forward.x * depth + side.x * offset,
        y: door.y + forward.y * depth + side.y * offset,
      };
      if (cell.x >= 0 && cell.y >= 0 && cell.x < gridSize && cell.y < gridSize) keys.add(positionKey(cell));
    }
  }
  return keys;
}

function homeWithRegrownResources(home) {
  return { ...normalizeHomeData(home), herbsReady: true };
}

function normalizeMonsterCompendium(compendium = {}) {
  const normalized = {};
  for (const [monsterId, entry] of Object.entries(compendium ?? {})) {
    if (!getMonsterTemplate(monsterId)) continue;
    normalized[monsterId] = {
      encountered: Boolean(entry?.encountered),
      kills: Math.max(0, Math.floor(entry?.kills ?? 0)),
    };
  }
  return normalized;
}

function monsterCatalogId(monster) {
  const id = monster?.baseMonsterId ?? monster?.templateId ?? monster?.monsterId ?? monster?.id;
  if (getMonsterTemplate(id)) return id;
  const normalizedName = String(monster?.name ?? "").replace(/\s+\d+$/, "").trim().toLowerCase();
  if (!normalizedName) return null;
  return window.DungeonContent
    .list("monsters")
    .find((template) => String(template.name ?? "").trim().toLowerCase() === normalizedName)?.id ?? null;
}

function recordMonsterEncounter(monster) {
  const monsterId = monsterCatalogId(monster);
  if (!monsterId || !state) return false;
  state.monsterCompendium = normalizeMonsterCompendium(state.monsterCompendium);
  state.monsterCompendium[monsterId] ??= { encountered: false, kills: 0 };
  state.monsterCompendium[monsterId].encountered = true;
  return true;
}

function recordMonsterKill(monster) {
  const monsterId = monsterCatalogId(monster);
  if (!monsterId || !state) return false;
  if (monster.compendiumKillRecorded) return false;
  state.monsterCompendium = normalizeMonsterCompendium(state.monsterCompendium);
  state.monsterCompendium[monsterId] ??= { encountered: true, kills: 0 };
  state.monsterCompendium[monsterId].encountered = true;
  state.monsterCompendium[monsterId].kills = Math.max(0, Math.floor(state.monsterCompendium[monsterId].kills ?? 0)) + 1;
  monster.compendiumKillRecorded = true;
  return true;
}

function partyMemberKind(fighter) {
  return fighter?.partyMemberKind ?? "hero";
}

function isClassHero(fighter) {
  return partyMemberKind(fighter) === "hero";
}

function isClassHeroId(id) {
  return isClassHero(state?.fighters?.[id]);
}

function isAutonomousAlly(fighter) {
  return fighter?.companionControl === "ai" || partyMemberKind(fighter) === "ally";
}

function fighterCreatureType(fighter) {
  return String(fighter?.tags?.[0] ?? "").toLowerCase();
}

function isHumanoidFighter(fighter) {
  return fighterCreatureType(fighter) === "humanoid";
}

function isPlayerControlledCompanion(fighter) {
  return partyMemberKind(fighter) === "companion" && fighter?.companionControl !== "ai";
}

function isRangerBeastCompanion(fighter) {
  return Boolean(fighter?.rangerCompanionOwnerId && fighter?.rangerCompanion === true);
}

function isSpellBoundSummon(fighter) {
  return Boolean(fighter?.summonedByHeroId || fighter?.summonedBySpellId || fighter?.summonMemoryKey);
}

function isSidekickWarrior(fighter) {
  return (isPlayerControlledCompanion(fighter) || isRangerBeastCompanion(fighter)) && fighter?.classId === "sidekick-warrior";
}

function isSidekickExpert(fighter) {
  return isPlayerControlledCompanion(fighter) && fighter?.classId === "sidekick-expert";
}

function isSidekickSpellcaster(fighter) {
  return isPlayerControlledCompanion(fighter) && fighter?.classId === "sidekick-spellcaster";
}

function isTrainedSidekick(fighter) {
  return isSidekickWarrior(fighter) || isSidekickExpert(fighter) || isSidekickSpellcaster(fighter);
}

function canTrainAsSidekick(fighter) {
  return isPlayerControlledCompanion(fighter) && !isSpellBoundSummon(fighter) && !isTrainedSidekick(fighter) && !fighter.dead;
}

function fighterSpeaksLanguage(fighter) {
  return Boolean((fighter?.languages ?? fighter?.languageProficiencies ?? []).length || fighter?.speaks || fighter?.canSpeak);
}

function canFighterReceiveInventory(fighter) {
  return Boolean(fighter && (isClassHero(fighter) || isPlayerControlledCompanion(fighter) || isHumanoidFighter(fighter)));
}

function isPlayerControlledPartyFighter(fighter) {
  return Boolean(fighter && isPartyHeroId(fighter.id) && !isAutonomousAlly(fighter));
}

function activeClassHeroIds(ids = state?.party?.heroIds ?? []) {
  return ids.filter((id) => isClassHeroId(id));
}

function boundCompanionOwnerId(fighter) {
  return fighter?.rangerCompanionOwnerId ?? fighter?.summonedByHeroId ?? fighter?.companionOwnerId ?? null;
}

function isBoundCompanion(fighter) {
  return Boolean(fighter && partyMemberKind(fighter) === "companion" && boundCompanionOwnerId(fighter));
}

function boundCompanionsForOwner(ownerId, gameState = state) {
  if (!ownerId) return [];
  return Object.values(gameState?.fighters ?? {}).filter((fighter) => boundCompanionOwnerId(fighter) === ownerId && !fighter.dead);
}

function activeClassHeroLimit(gameState = state) {
  return Math.max(4, Math.min(5, Math.floor(Number(gameState?.party?.maxActiveHeroSlots ?? 4) || 4)));
}

function normalizeActivePartyOwnerBindings(gameState = state) {
  if (!gameState?.party?.heroIds?.length) return [];
  const active = new Set(gameState.party.heroIds);
  const removed = [];
  for (const id of [...active]) {
    const fighter = gameState.fighters?.[id];
    const ownerId = boundCompanionOwnerId(fighter);
    if (!ownerId || active.has(ownerId)) continue;
    active.delete(id);
    removed.push(id);
  }
  if (removed.length) {
    gameState.party.heroIds = gameState.party.heroIds.filter((id) => !removed.includes(id));
    if (!gameState.party.heroIds.length) {
      const fallback = (gameState.party.rosterIds ?? []).find((id) => isClassHero(gameState.fighters?.[id]) && !gameState.fighters[id].dead);
      if (fallback) gameState.party.heroIds = [fallback];
    }
    if (!gameState.party.heroIds.includes(gameState.party.activeHeroId)) {
      gameState.party.activeHeroId = gameState.party.heroIds.find((id) => !isAutonomousAlly(gameState.fighters[id])) ?? gameState.party.heroIds[0];
    }
  }
  return removed;
}

function rangerCompanionOwner(fighter) {
  const ownerId = fighter?.rangerCompanionOwnerId;
  const owner = ownerId ? state?.fighters?.[ownerId] : null;
  return owner?.classId === "ranger" ? owner : null;
}

function rangerCompanionProficiencyBonus(fighter) {
  return isRangerBeastCompanion(fighter) ? proficiencyBonus(rangerCompanionOwner(fighter) ?? fighter) : proficiencyBonus(fighter);
}

function rangerBeastCompanionsForOwner(ownerId) {
  return Object.values(state?.fighters ?? {}).filter((fighter) => fighter?.rangerCompanionOwnerId === ownerId && fighter?.rangerCompanion === true && !fighter.retiredCompanion);
}

function rangerBeastCompanionForOwner(ownerId) {
  return rangerBeastCompanionsForOwner(ownerId).find((fighter) => !fighter.dead) ?? null;
}

function deadRangerBeastCompanionForOwner(ownerId) {
  return rangerBeastCompanionsForOwner(ownerId).find((fighter) => fighter.dead || !fighter.alive || (fighter.hp ?? 0) <= 0) ?? null;
}

function syncRangerBeastCompanionStats(companion) {
  if (!isRangerBeastCompanion(companion)) return companion;
  const owner = rangerCompanionOwner(companion);
  if (!owner) return companion;
  const rangerHpFloor = Math.max(companion.rangerCompanionNormalMaxHp ?? 1, (owner.level ?? 1) * 4);
  companion.classId = "sidekick-warrior";
  companion.className = companion.className ?? "Beast Companion";
  companion.sidekickClassName = companion.sidekickClassName ?? "Beast Companion";
  companion.sidekickWarriorRole = companion.sidekickWarriorRole ?? "attacker";
  companion.baseMaxHp = Math.max(companion.baseMaxHp ?? companion.maxHp ?? 1, rangerHpFloor);
  companion.hitDiceRemaining = Math.min(companion.hitDiceRemaining ?? companion.level ?? 1, companion.level ?? 1);
  return companion;
}

function syncRangerBeastCompanionsForOwner(owner) {
  if (!owner?.id) return [];
  const companions = rangerBeastCompanionsForOwner(owner.id);
  companions.forEach((companion) => refreshDerivedStats(companion));
  return companions;
}

function createFriendlyBeastFromMonster(monsterId, options = {}) {
  const template = getMonsterTemplate(monsterId);
  if (!template) return null;
  const companion = options.kind === "companion";
  const fighter = createCombatant({
    ...template,
    id: options.id ?? `${monsterId}-ally-${Date.now()}`,
    name: options.name ?? template.name,
    position: options.position ?? { x: 4, y: 5 },
    token: options.token ?? template.token,
    tokenArt: options.tokenArt ?? template.tokenArt,
    partyMemberKind: options.kind ?? "ally",
    companionControl: options.control ?? "ai",
    team: "heroes",
    friendly: true,
    renameable: options.renameable ?? true,
    baseMonsterId: monsterId,
    abilityScores: options.abilityScores ?? template.abilityScores,
    abilityMods: options.abilityMods ?? template.abilityMods,
    attackBonus: options.attackBonus ?? template.attackBonus,
    baseAttackAbilityMod: options.baseAttackAbilityMod ?? template.baseAttackAbilityMod,
    damage: options.damage ?? template.damage,
    baseAc: options.baseAc ?? template.baseAc ?? template.ac,
    classId: options.classId,
    className: options.className ?? (companion ? "Beast Companion" : "Beast Ally"),
    sidekickClassName: options.sidekickClassName,
    sidekickWarriorRole: options.sidekickWarriorRole,
    rangerCompanion: options.rangerCompanion,
    rangerCompanionOwnerId: options.rangerCompanionOwnerId,
    rangerCompanionNormalMaxHp: options.rangerCompanionNormalMaxHp ?? template.maxHp,
    companionAttackAbility: options.companionAttackAbility,
    level: options.level ?? template.level ?? 1,
    xp: options.xp ?? 0,
    followHeroId: options.followHeroId ?? null,
    followDistanceSquares: Math.max(1, Math.min(5, Number(options.followDistanceSquares ?? 3) || 3)),
    hitDiceRemaining: options.hitDiceRemaining ?? 1,
    savingThrowProficiencies: options.savingThrowProficiencies ?? template.savingThrowProficiencies,
    skillProficiencies: options.skillProficiencies ?? template.skillProficiencies,
    armorProficiencies: options.armorProficiencies ?? template.armorProficiencies,
    weaponProficiencies: options.weaponProficiencies ?? template.weaponProficiencies,
    inventory: options.inventory ?? { money: { cp: 0, sp: 0, gp: 0 }, items: [] },
    equipment: options.equipment ?? {},
  });
  fighter.token = tokenFromName(fighter.name, fighter.token);
  return fighter;
}

function isLegacyTestingBeastAlly(fighter) {
  return Boolean(
    fighter?.id === "ally-forest-wolf" &&
      fighter.baseMonsterId === "forestWolf" &&
      fighter.partyMemberKind === "ally" &&
      fighter.companionControl === "ai" &&
      !isTrainedSidekick(fighter),
  );
}

function removeLegacyTestingBeastAllyFromPartyData(partyData = null) {
  if (!partyData) return;
  partyData.rosterIds = (partyData.rosterIds ?? []).filter((id) => id !== "ally-forest-wolf");
  partyData.heroIds = (partyData.heroIds ?? []).filter((id) => id !== "ally-forest-wolf");
  if (partyData.activeHeroId === "ally-forest-wolf") partyData.activeHeroId = partyData.heroIds[0] ?? "hero";
}

function prepareRestedHero(hero, position) {
  if (isWildShaped(hero)) revertWildShape(hero);
  if (hero.baseSpellPointMaxBeforeComfort !== undefined) {
    hero.spellPointMax = hero.baseSpellPointMaxBeforeComfort;
    delete hero.baseSpellPointMaxBeforeComfort;
  }
  delete hero.comfortSpellPointBonus;
  hero.abilities = (hero.abilities ?? []).filter((ability) => !ability.homeComfortGranted);
  hero.extraResourcePoolUses = {};
  hero.extraSneakAttackDice = 0;
  hero.statusEffects = (hero.statusEffects ?? []).filter((effect) => !effect.expiresAtHome);
  refreshItemChargesForFighter(hero, "home");
  refreshItemChargesForFighter(hero, "longRest");
  refreshItemChargesForFighter(hero, "newDungeon");
  if (hero.dead) {
    return refreshDerivedStats({
      ...hero,
      hp: 0,
      temporaryHp: 0,
      position: { ...position },
      alive: false,
      stableAtZero: false,
      deathSaves: hero.deathSaves ?? { successes: 0, failures: 3 },
    });
  }
  const restedHero = refreshDerivedStats({
    ...hero,
    hp: hero.maxHp,
    temporaryHp: 0,
    extraAbilityUses: {},
    extraResourcePoolUses: {},
    extraSneakAttackDice: 0,
    hitDiceRemaining: hero.level ?? 1,
    position: { ...position },
    movementLeft: Math.floor(hero.speedFeet / feetPerSquare),
    hasAction: true,
    hasBonusAction: true,
    alive: true,
    stableAtZero: false,
    deathSaves: { successes: 0, failures: 0 },
    relentlessEnduranceUsed: false,
  });
  resetFighterAbilityUses(restedHero);
  restedHero.spellPoints = spellPointMaximum(restedHero);
  ensureSpellPointState(restedHero);
  return restedHero;
}

function createHomeState(heroOrHeroes, chest = [], chestMoney = { cp: 0, sp: 0, gp: 0 }, partyData = null) {
  dungeonClockRuntimePaused = false;
  const home = normalizeHomeData(partyData ? partyData.home : state?.home);
  const cells = home.cells;
  const homeDoor = home.doors.find((door) => door.to === "outside") ?? { x: 19, y: 15, roomId: "home-room", to: "outside" };
  const normalizedPartyData = partyData ? { ...partyData, heroIds: [...(partyData.heroIds ?? [])], rosterIds: [...(partyData.rosterIds ?? [])] } : null;
  removeLegacyTestingBeastAllyFromPartyData(normalizedPartyData);
  const incomingHeroes = (Array.isArray(heroOrHeroes) ? heroOrHeroes : [heroOrHeroes]).filter((hero) => !isLegacyTestingBeastAlly(hero));
  const partyResources = normalizePartyResources(normalizedPartyData?.partyResources ?? state?.partyResources ?? {});
  const partyTomes = normalizePartyTomes(normalizedPartyData?.partyTomes ?? state?.partyTomes ?? []);
  for (const hero of incomingHeroes) {
    if (!hero?.inventory?.items?.length) continue;
    const keptItems = [];
    for (const item of hero.inventory.items) {
      if (itemUsesPartyResourceInventory(item)) {
        const itemId = item.baseItemId ?? item.itemId ?? item.id;
        const amount = Math.max(1, Math.floor(Number(item.quantity) || 1));
        if (itemId) partyResources[itemId] = (partyResources[itemId] ?? 0) + amount;
      } else if (itemUsesTomeInventory(item)) {
        const entry = tomeEntryFromItem(item);
        if (entry) partyTomes.push(entry);
      } else {
        keptItems.push(item);
      }
    }
    hero.inventory.items = keptItems;
  }
  const rosterIds = normalizedPartyData?.rosterIds?.length ? normalizedPartyData.rosterIds : incomingHeroes.map((hero) => hero.id);
  const livingRosterIds = rosterIds.filter((id) => !incomingHeroes.find((hero) => hero.id === id)?.dead);
  const heroIds = (normalizedPartyData?.heroIds?.length ? normalizedPartyData.heroIds : livingRosterIds).filter((id) => livingRosterIds.includes(id));
  const positions = new Map(homeHeroPositions(rosterIds).map((entry) => [entry.id, entry.position]));
  const fighters = Object.fromEntries(
    incomingHeroes.map((hero, index) => {
      const id = hero.id ?? (index === 0 ? "hero" : `hero-${Date.now()}-${index}`);
      const position = positions.get(id) ?? { x: 3 + (index % 4), y: 5 + Math.floor(index / 4) };
      return [id, prepareRestedHero({ ...hero, id, partyRole: hero.partyRole ?? (id === "hero" ? "tank" : "dd") }, position)];
    }),
  );
  const activeHeroId =
    fighters[normalizedPartyData?.activeHeroId] && !fighters[normalizedPartyData.activeHeroId].dead && !isAutonomousAlly(fighters[normalizedPartyData.activeHeroId])
      ? normalizedPartyData.activeHeroId
      : heroIds.find((id) => fighters[id] && !fighters[id].dead && !isAutonomousAlly(fighters[id])) ?? livingRosterIds.find((id) => fighters[id] && !isAutonomousAlly(fighters[id])) ?? "hero";
  const questFlags = cloneData(normalizedPartyData?.questFlags ?? state?.questFlags ?? {});
  resetSmithMaterialCommissionsOnHomeArrival(questFlags);
  const world = window.DepthboundWorldTravel?.normalizeWorldState?.(normalizedPartyData?.world ?? state?.world) ?? normalizedPartyData?.world ?? state?.world ?? null;

  return {
    combatStarted: false,
    worldDay: normalizeWorldDay(normalizedPartyData?.worldDay ?? (partyData ? 1 : state?.worldDay)),
    mode: "home",
    round: 0,
    activeIndex: 0,
    initiative: [],
    room: {
      id: "home",
      name: "Home",
      gridSize: home.gridSize,
      tileSizePx,
    },
    dungeon: {
      id: "home",
      roomCount: 1,
      gridSize: home.gridSize,
      rooms: [{ id: "home-room", name: "Home", cells, doors: home.doors }],
      walkable: cells,
      corridors: [],
      doors: home.doors,
      corridorPassages: [],
      entranceRoomId: "home-room",
      startPosition: { x: 13, y: 15 },
    },
    exploration: {
      discoveredRoomIds: ["home-room"],
      openedDoorKeys: [],
      openedCorridorKeys: [],
      discoveredHiddenDoorKeys: [],
      hiddenDoorSearchAttempts: {},
    },
    exit: {
      roomId: "home-room",
      position: { ...homeDoor },
    },
    completed: false,
    d20Mode: normalizeD20Mode(normalizedPartyData?.d20Mode ?? state?.d20Mode ?? defaultD20Mode),
    d20FailureStreak: normalizedPartyData?.d20FailureStreak ?? state?.d20FailureStreak ?? 0,
    saveRollMode: normalizeSaveRollMode(normalizedPartyData?.saveRollMode ?? state?.saveRollMode ?? "manual"),
    shortRestsUsed: 0,
    shortRestLimit: shortRestLimitForTheme(null, 3),
    chest,
    chestMoney: normalizeMoney(chestMoney),
    home,
    monsterCompendium: normalizeMonsterCompendium(partyData ? normalizedPartyData?.monsterCompendium : state?.monsterCompendium),
    campaignProgress: cloneData(normalizedPartyData?.campaignProgress ?? {}),
    questFlags,
    partyResources: normalizePartyResources(partyResources),
    partyTomes: permanentPartyTomes(partyTomes),
    world,
    lootPiles: [],
    dungeonObjects: home.objects,
    party: {
      activeHeroId,
      heroIds: heroIds.filter((id) => fighters[id] && !fighters[id].dead),
      rosterIds: rosterIds.filter((id) => fighters[id]),
      travelRationsInitialized: Boolean(normalizedPartyData?.travelRationsInitialized ?? state?.party?.travelRationsInitialized),
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
  return Boolean(fighter && (isPlayerControlledPartyFighter(fighter) || (state?.mode === "home" && isRosterHeroId(fighter.id) && !isAutonomousAlly(fighter))));
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
  if (state.mode !== "home" && isAutonomousAlly(state.fighters[heroId])) return false;
  state.party.activeHeroId = heroId;
  selectedHeroIds = new Set([heroId]);
  return true;
}

function selectableHeroIds() {
  return new Set(
    (state.mode === "home" ? rosterHeroes() : partyHeroes())
      .filter((hero) => heroCanAct(hero) && !isAutonomousAlly(hero))
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
  const ids = Array.from(selectableHeroIds());
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
  if (!isClassHero(state.fighters[heroId])) return;
  const currentIds = (state.party.heroIds ?? ["hero"]).filter((id) => id !== heroId && state.fighters[id] && !state.fighters[id].dead);
  state.party.heroIds = [heroId, ...currentIds];
  state.party.activeHeroId = heroId;
}

function normalizeHomeLayout(gameState) {
  if (gameState?.mode !== "home") return;
  const home = normalizeHomeData(gameState.home);
  const cells = home.cells;
  const homeDoor = home.doors.find((door) => door.to === "outside") ?? { x: 19, y: 15, roomId: "home-room", to: "outside" };
  gameState.home = home;
  gameState.combatStarted = false;
  gameState.activeIndex = 0;
  gameState.initiative = [];
  gameState.room = {
    id: "home",
    name: "Home",
    gridSize: home.gridSize,
    tileSizePx,
  };
  gameState.dungeon = {
    ...(gameState.dungeon ?? {}),
    id: "home",
    roomCount: 1,
    gridSize: home.gridSize,
    rooms: [{ id: "home-room", name: "Home", cells, doors: home.doors }],
    walkable: cells,
    corridors: [],
    doors: home.doors,
    corridorPassages: [],
    entranceRoomId: "home-room",
    startPosition: { x: 13, y: 15 },
  };
  gameState.exit = { roomId: "home-room", position: { ...homeDoor } };
  gameState.exploration = {
    ...(gameState.exploration ?? {}),
    discoveredRoomIds: ["home-room"],
    openedDoorKeys: [],
    openedCorridorKeys: [],
  };
  gameState.dungeonObjects = home.objects;
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
  gameState.party.heroIds = (gameState.party.heroIds ?? ["hero"]).filter((id) => gameState.fighters[id] && !gameState.fighters[id].dead);
  if (!gameState.fighters[gameState.party.activeHeroId] || gameState.fighters[gameState.party.activeHeroId].dead) {
    gameState.party.activeHeroId =
      gameState.party.heroIds.find((id) => gameState.fighters[id] && !isAutonomousAlly(gameState.fighters[id])) ??
      gameState.party.rosterIds.find((id) => gameState.fighters[id] && !gameState.fighters[id].dead && !isAutonomousAlly(gameState.fighters[id])) ??
      "hero";
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
      .filter((file) => typeof file === "string" && /\.(png|jpe?g|webp|gif)$/i.test(file))
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
  const subclass = combatant?.subclassName ? ` (${combatant.subclassName})` : "";
  if (isClassHero(combatant) && (combatant.id === "hero" || isRosterHeroId(combatant?.id))) return `Level ${combatant.level ?? 1}${species} ${combatant.className ?? "Fighter"}${subclass}`;
  if (isTrainedSidekick(combatant)) return `Level ${combatant.level ?? 1} ${combatant.sidekickClassName ?? combatant.className ?? "Sidekick"}`;
  return combatant.role;
}

function subclassDefinitionForFighter(fighter) {
  if (!fighter?.classId || !fighter?.subclassId) return null;
  const template = getHeroTemplate(fighter.classId);
  const normal = (template.subclasses ?? []).find((entry) => entry.id === fighter.subclassId) ?? null;
  const admin = (template.adminSubclasses ?? []).find((entry) => entry.id === fighter.subclassId) ?? null;
  return fighter.subclassVariant === "full" ? admin ?? normal : normal ?? admin;
}

function fighterAbilityDefinitions(fighter = state?.fighters?.hero) {
  if (isTrainedSidekick(fighter)) {
    const source = [...(getHeroTemplate(fighter.classId).abilities ?? []), ...(fighter?.abilities ?? [])];
    return source
      .filter((ability, index, list) => list.findIndex((entry) => entry.id === ability.id) === index)
      .map((ability) => ({
        ...ability,
        usesByLevel: Array.isArray(ability.usesByLevel) ? ability.usesByLevel.map((entry) => ({ ...entry })) : undefined,
      }));
  }
  if (fighter && !isClassHero(fighter)) return [...(fighter.abilities ?? [])];
  const subclass = subclassDefinitionForFighter(fighter);
  const source = [
    ...(fighter?.abilities ?? (isRosterHeroId(fighter?.id) ? getHeroTemplate(fighter?.classId).abilities : []) ?? []),
    ...(subclass?.abilities ?? []),
    ...featAbilityDefinitions(fighter),
  ];
  for (const effect of fighter?.statusEffects ?? []) {
    if (!effect?.potionBreath?.type) continue;
    const remaining = Number(effect.potionBreath.uses ?? 0) || 0;
    if (remaining <= 0) continue;
    const type = effect.potionBreath.type;
    source.push({
      id: `potionBreath:${effect.id}`,
      name: effect.label ?? `${type[0].toUpperCase()}${type.slice(1)} Breath`,
      description: `Exhale a 15 ft ${effect.potionBreath.shape ?? "cone"} for 4d6 ${type} damage. ${remaining} use${remaining === 1 ? "" : "s"} remaining.`,
      resource: "action",
      refresh: "status",
      uses: 99,
      potionBreathAction: { statusId: effect.id, spellId: `potion-breath-${type}` },
    });
  }
  if (fighter?.racialTraits?.dragonDamageType && !source.some((ability) => ability.id === "dragonbornBreath")) {
    source.push({ id: "dragonbornBreath", name: "Breath Weapon", description: "Ancestral 15 ft cone. DEX/CON save by ancestry, half damage on success.", resource: "action", refresh: "shortRest", uses: 1 });
  }
  for (const ability of racialSpellAbilityDefinitions(fighter)) {
    if (!source.some((entry) => entry.id === ability.id)) source.push(ability);
  }
  return source
    .filter((ability) => ability.id !== "eldritchBlast")
    .filter((ability) => {
      if (ability.id === "rangerCompanion") return false;
      if (ability.resourcePool === "arcaneShot") return (fighter?.knownArcaneShots ?? []).includes(ability.id);
      if (ability.resourcePool === "superiority") return (fighter?.knownManeuvers ?? []).includes(ability.id);
      if (ability.metamagicOption) return (fighter?.knownMetamagic ?? []).includes(ability.id);
      if (ability.invocationOption) return (fighter?.knownInvocations ?? []).includes(ability.id);
      if (ability.pactBoon) return fighter?.pactBoon === ability.pactBoon;
      if (ability.rune) return (fighter?.knownRunes ?? []).includes(ability.id);
      return true;
    })
    .filter((ability, index, list) => list.findIndex((entry) => entry.id === ability.id) === index)
    .map((ability) => ({
      ...ability,
      usesByLevel: Array.isArray(ability.usesByLevel) ? ability.usesByLevel.map((entry) => ({ ...entry })) : undefined,
    }));
}

function featDefinitions() {
  return window.DungeonContent?.list?.("feats") ?? [];
}

function featDefinition(id) {
  return window.DungeonContent?.get?.("feats", id) ?? null;
}

function fighterFeatEntries(fighter = state?.fighters?.hero) {
  return (fighter?.feats ?? [])
    .map((entry) => (typeof entry === "string" ? { id: entry } : entry))
    .filter((entry) => entry?.id);
}

function fighterFeatIds(fighter = state?.fighters?.hero) {
  return fighterFeatEntries(fighter).map((entry) => entry.id);
}

function fighterHasFeat(fighter, featId) {
  return fighterFeatIds(fighter).includes(featId);
}

function fighterFeatDefinitions(fighter = state?.fighters?.hero) {
  return fighterFeatEntries(fighter)
    .map((entry) => ({ entry, definition: featDefinition(entry.id) }))
    .filter(({ definition }) => definition);
}

function featAbilityDefinitions(fighter = state?.fighters?.hero) {
  const abilitiesFromFeats = fighterFeatDefinitions(fighter).flatMap(({ definition }) => definition.abilities ?? []);
  if (fighterHasFeat(fighter, "martial-adept")) {
    const battleMaster = (getHeroTemplate("fighter").subclasses ?? []).find((subclass) => subclass.id === "battle-master");
    abilitiesFromFeats.push(...(battleMaster?.maneuverOptions ?? []));
  }
  if (fighterHasFeat(fighter, "metamagic-adept")) {
    abilitiesFromFeats.push(...(getHeroTemplate("sorcerer").abilities ?? []).filter((ability) => ability.metamagicOption));
  }
  if (fighterHasFeat(fighter, "eldritch-adept")) {
    abilitiesFromFeats.push(...(getHeroTemplate("warlock").abilities ?? []).filter((ability) => ability.invocationOption));
  }
  return abilitiesFromFeats;
}

function featChoiceValue(fighter, featId, key) {
  const entry = fighterFeatEntries(fighter).find((feat) => feat.id === featId);
  return entry?.choices?.[key];
}

function fighterFeatSpellIds(fighter = state?.fighters?.hero) {
  return fighterFeatDefinitions(fighter)
    .flatMap(({ definition }) => definition.spells ?? [])
    .map(canonicalSpellId)
    .filter((spellId) => getContentDefinition("spells", spellId));
}

function fighterHasFeatSpell(fighter, spellId) {
  return fighterFeatSpellIds(fighter).includes(canonicalSpellId(spellId));
}

function featSpellPointBonus(fighter = state?.fighters?.hero) {
  return fighterFeatSpellIds(fighter).reduce((sum, spellId) => {
    const spell = getContentDefinition("spells", spellId);
    const spellLevel = spellBaseLevel(spell);
    if (spellLevel <= 0) return sum;
    return sum + (spell.cost ?? spell.costsByLevel?.[spellLevel] ?? ({ 1: 2, 2: 3, 3: 5 }[spellLevel] ?? 0));
  }, 0);
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
      description: "Once per long rest at level 3. Divine wings grant flight, speed, and radiant extra damage.",
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
      description: "Once per long rest at level 3. Float above danger with flight and a short defensive lift.",
      resource: "action",
      level: 3,
      racialSpellId: "air-genasi-levitate",
    });
  }
  if (race === "dragonborn" && subrace === "gem") {
    add({
      id: "gemDragonbornFlight",
      name: "Gem Flight",
      description: "Once per long rest at level 5. Spectral gem wings grant flight for the encounter.",
      resource: "bonusAction",
      level: 5,
      racialSpellId: "gem-dragonborn-flight",
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
  const poolBonus = ability.resourcePool ? fighter?.extraResourcePoolUses?.[ability.resourcePool] ?? 0 : 0;
  if (ability.resourcePool === "arcaneShot") return 2 + poolBonus;
  if (ability.resourcePool === "superiority") {
    const baseSuperiority = fighter?.classId === "fighter" && fighter?.subclassId === "battle-master" ? (level >= 15 ? 6 : level >= 7 ? 5 : 4) : 0;
    return baseSuperiority + poolBonus;
  }
  if (ability.resourcePool === "psionicEnergy") return (proficiencyBonus(fighter) * 2) + poolBonus;
  if (ability.resourcePool === "ki") return Math.max(0, level) + poolBonus;
  if (ability.resourcePool === "bardicInspiration") return Math.max(1, abilityMod(fighter, "cha")) + poolBonus;
  if (ability.resourcePool === "wildShape") return 2 + poolBonus;
  if (ability.resourcePool === "layOnHands") return Math.max(0, level * 5) + poolBonus;
  if (ability.resourcePool === "arcaneRecovery") return 1 + poolBonus;
  if (ability.resourcePool === "metamagic") return (fighter?.classId === "sorcerer" ? Math.max(0, level) : 0) + poolBonus;
  if (ability.resourcePool === "favoredFoe") return proficiencyBonus(fighter) + poolBonus;
  let uses = ability.uses ?? 1;
  for (const entry of ability.usesByLevel ?? []) {
    if (level >= entry.level) uses = entry.uses;
  }
  return uses + (fighter?.extraAbilityUses?.[ability.id] ?? 0);
}

function canonicalSpellId(spellId) {
  const spell = getContentDefinition("spells", spellId);
  return spell?.aliasOf ?? spellId;
}

function spellPointMaximum(fighter) {
  const level = fighter?.level ?? 1;
  const progression = fighter?.spellPointProgression ?? {};
  let points = Object.keys(progression).length ? (progression[level] ?? 0) : (fighter?.spellPointMax ?? 0);
  for (const [entryLevel, value] of Object.entries(progression)) {
    if (level >= Number(entryLevel)) points = value;
  }
  return Math.max(0, (Number(points) || 0) + featSpellPointBonus(fighter) + (fighter?.comfortSpellPointBonus ?? 0));
}

function classSpellListForFighter(fighter = state?.fighters?.hero) {
  const featSpells = fighterFeatSpellIds(fighter).filter((spellId) => (getContentDefinition("spells", spellId)?.level ?? 1) > 0);
  return uniqueValues([...(fighter?.classSpellList ?? fighter?.spellList ?? fighter?.spells ?? []), ...featSpells]);
}

function classCantripListForFighter(fighter = state?.fighters?.hero) {
  const featCantrips = fighterFeatSpellIds(fighter).filter((spellId) => (getContentDefinition("spells", spellId)?.level ?? 1) === 0);
  return uniqueValues([...(fighter?.classCantripList ?? fighter?.cantripList ?? []), ...featCantrips]);
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
  if (casterType === "pact") return level >= 17 ? 9 : level >= 15 ? 8 : level >= 13 ? 7 : level >= 11 ? 6 : level >= 9 ? 5 : level >= 7 ? 4 : level >= 5 ? 3 : level >= 3 ? 2 : 1;
  if (casterType === "sidekick") return level >= 17 ? 5 : level >= 13 ? 4 : level >= 9 ? 3 : level >= 5 ? 2 : 1;
  if (casterType === "half") return level >= 17 ? 5 : level >= 13 ? 4 : level >= 9 ? 3 : level >= 5 ? 2 : 1;
  if (casterType === "third") return level >= 19 ? 4 : level >= 13 ? 3 : level >= 7 ? 2 : level >= 3 ? 1 : 0;
  return level >= 17 ? 9 : level >= 15 ? 8 : level >= 13 ? 7 : level >= 11 ? 6 : level >= 9 ? 5 : level >= 7 ? 4 : level >= 5 ? 3 : level >= 3 ? 2 : 1;
}

function spellUnlockedForFighter(fighter, spell) {
  if (!fighter || !spell) return false;
  if (fighterHasFeatSpell(fighter, spell.id)) return true;
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
  fighter.spells = uniqueValues([...(fighter.spells ?? []), ...fighterFeatSpellIds(fighter)]).map(canonicalSpellId).filter((spellId) => knownSpellList.includes(spellId));
  return fighter;
}

function resetFighterAbilityUses(fighter, refresh = "all") {
  fighter.abilityUses = refresh === "all" ? {} : { ...(fighter.abilityUses ?? {}) };
  fighter.itemPowerUses = refresh === "all"
    ? {}
    : Object.fromEntries(Object.entries(fighter.itemPowerUses ?? {}).filter(([, entry]) => entry?.refresh !== refresh && entry?.refresh !== "turn"));
  if (fighter.classId === "barbarian" && (refresh === "all" || refresh === "shortRest" || refresh === "longRest")) fighter.relentlessRageDc = 10;
  for (const ability of fighterAbilityDefinitions(fighter)) {
    const abilityRefresh = abilityRefreshForFighter(fighter, ability);
    if ((fighter.level ?? 1) >= (ability.level ?? 1) && (refresh === "all" || abilityRefresh === refresh || abilityRefresh === "turn")) {
      fighter.abilityUses[ability.id] = 0;
    }
  }
}

function abilityRefreshForFighter(fighter, ability) {
  if (fighter?.classId === "bard" && ability?.id === "bardicInspiration" && (fighter.level ?? 1) >= 5) return "shortRest";
  return ability?.refresh ?? "longRest";
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
  const baseProf = rangerCompanionProficiencyBonus(fighter);
  const prof = proficiencies.has(skillId) ? baseProf : 0;
  const expert = expertise.has(skillId) ? baseProf : 0;
  const jackOfAllTrades = fighter?.classId === "bard" && (fighter.level ?? 1) >= 2 && !proficiencies.has(skillId)
    ? Math.floor(proficiencyBonus(fighter) / 2)
    : 0;
  const statusBonus = (fighter?.statusEffects ?? []).reduce((sum, effect) => sum + (effect.skillBonus ?? 0), 0) + (magicEffects(fighter).skillBonus ?? 0);
  const championAthlete = fighter?.subclassId === "champion" && (fighter.level ?? 1) >= 6 && ["str", "dex", "con"].includes(ability) && !proficiencies.has(skillId)
    ? Math.ceil(proficiencyBonus(fighter) / 2)
    : 0;
  const samuraiCourtier = fighter?.subclassId === "samurai" && (fighter.level ?? 1) >= 7 && skillId === "persuasion" ? abilityMod(fighter, "wis") : 0;
  const racialAnimalHandling = skillId === "animal-handling" && ["forest-gnome", "pureblood"].includes(fighter?.raceSelection?.subraceId ?? fighter?.subrace) ? 2 : 0;
  return abilityMod(fighter, ability) + prof + expert + jackOfAllTrades + statusBonus + championAthlete + samuraiCourtier + racialAnimalHandling;
}

function reliableTalentRoll(fighter, skillId, roll) {
  const proficiencies = new Set(fighter?.skillProficiencies ?? []);
  if (fighter?.classId === "rogue" && (fighter.level ?? 1) >= 11 && proficiencies.has(skillId) && roll > 1 && roll < 10) return 10;
  return roll;
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

function legacyRaceTextKey(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function legacyRaceTextValues(fighter = {}) {
  return uniqueValues([
    fighter.race,
    fighter.subrace,
    fighter.raceId,
    fighter.subraceId,
    fighter.raceName,
    fighter.speciesName,
    fighter.subraceName,
    fighter.species,
    fighter.ancestryName,
    fighter.dragonAncestryId,
    fighter.raceSelection?.raceId,
    fighter.raceSelection?.subraceId,
    fighter.raceSelection?.dragonAncestryId,
  ])
    .map(legacyRaceTextKey)
    .filter(Boolean);
}

function legacyDefaultSubraceId(raceId) {
  const safeDefaults = {
    dwarf: "hill-dwarf",
    elf: "high-elf",
    gnome: "forest-gnome",
    "half-elf": "high-half-elf",
    halfling: "lightfoot",
  };
  const preferred = safeDefaults[raceId];
  return speciesDefinitions[raceId]?.subraces?.[preferred] ? preferred : firstSubraceId(raceId);
}

function dragonAncestryIdFromLegacyText(category, texts = [], fallback = "") {
  const ancestries = dragonAncestries[category] ?? {};
  const textSet = new Set(texts);
  for (const [ancestryId, ancestry] of Object.entries(ancestries)) {
    if (textSet.has(legacyRaceTextKey(ancestryId)) || textSet.has(legacyRaceTextKey(ancestry.name))) return ancestryId;
  }
  return fallback;
}

function raceSelectionFromLegacyHero(fighter = {}) {
  const explicitRaceId = speciesDefinitions[fighter.raceSelection?.raceId]
    ? fighter.raceSelection.raceId
    : speciesDefinitions[fighter.race]
      ? fighter.race
      : speciesDefinitions[fighter.raceId]
        ? fighter.raceId
        : "";
  if (explicitRaceId) {
    const subraces = speciesDefinitions[explicitRaceId]?.subraces ?? {};
    const explicitSubraceId = subraces[fighter.raceSelection?.subraceId]
      ? fighter.raceSelection.subraceId
      : subraces[fighter.subrace]
        ? fighter.subrace
        : subraces[fighter.subraceId]
          ? fighter.subraceId
          : legacyDefaultSubraceId(explicitRaceId);
    return {
      ...fighter.raceSelection,
      raceId: explicitRaceId,
      subraceId: explicitSubraceId,
      dragonAncestryId: fighter.raceSelection?.dragonAncestryId ?? fighter.dragonAncestryId,
    };
  }

  const texts = legacyRaceTextValues(fighter);
  const textSet = new Set(texts);
  const haystack = ` ${texts.join(" ")} `;
  const hasPhrase = (value) => {
    const key = legacyRaceTextKey(value);
    return Boolean(key && haystack.includes(` ${key} `));
  };
  const subraceCandidates = Object.entries(speciesDefinitions).flatMap(([raceId, race]) =>
    Object.entries(race.subraces ?? {}).map(([subraceId, subrace]) => ({
      raceId,
      subraceId,
      subrace,
      keys: [subraceId, subrace.name].map(legacyRaceTextKey).filter(Boolean),
    }))
  );

  const exactSubrace = subraceCandidates
    .sort((a, b) => Math.max(...b.keys.map((key) => key.length)) - Math.max(...a.keys.map((key) => key.length)))
    .find((candidate) => candidate.keys.some((key) => textSet.has(key)));
  if (exactSubrace) {
    const subrace = speciesDefinitions[exactSubrace.raceId]?.subraces?.[exactSubrace.subraceId] ?? {};
    return {
      ...fighter.raceSelection,
      raceId: exactSubrace.raceId,
      subraceId: exactSubrace.subraceId,
      dragonAncestryId: dragonAncestryIdFromLegacyText(subrace.dragonCategory, texts, fighter.dragonAncestryId ?? fighter.raceSelection?.dragonAncestryId),
    };
  }

  const exactRace = Object.entries(speciesDefinitions)
    .sort(([, a], [, b]) => legacyRaceTextKey(b.name).length - legacyRaceTextKey(a.name).length)
    .find(([raceId, race]) => textSet.has(legacyRaceTextKey(raceId)) || textSet.has(legacyRaceTextKey(race.name)));
  if (exactRace) {
    return {
      ...fighter.raceSelection,
      raceId: exactRace[0],
      subraceId: legacyDefaultSubraceId(exactRace[0]),
      dragonAncestryId: fighter.dragonAncestryId ?? fighter.raceSelection?.dragonAncestryId,
    };
  }

  const phraseSubrace = subraceCandidates.find((candidate) => candidate.keys.some(hasPhrase));
  if (phraseSubrace) {
    const subrace = speciesDefinitions[phraseSubrace.raceId]?.subraces?.[phraseSubrace.subraceId] ?? {};
    return {
      ...fighter.raceSelection,
      raceId: phraseSubrace.raceId,
      subraceId: phraseSubrace.subraceId,
      dragonAncestryId: dragonAncestryIdFromLegacyText(subrace.dragonCategory, texts, fighter.dragonAncestryId ?? fighter.raceSelection?.dragonAncestryId),
    };
  }

  const phraseRace = Object.entries(speciesDefinitions)
    .sort(([, a], [, b]) => legacyRaceTextKey(b.name).length - legacyRaceTextKey(a.name).length)
    .find(([raceId, race]) => hasPhrase(raceId) || hasPhrase(race.name));
  if (phraseRace) {
    return {
      ...fighter.raceSelection,
      raceId: phraseRace[0],
      subraceId: legacyDefaultSubraceId(phraseRace[0]),
      dragonAncestryId: fighter.dragonAncestryId ?? fighter.raceSelection?.dragonAncestryId,
    };
  }

  return fighter.raceSelection ?? { raceId: fighter.race, subraceId: fighter.subrace, dragonAncestryId: fighter.dragonAncestryId };
}

function normalizeHeroRaceSelection(fighter = {}) {
  return normalizeRaceSelection(raceSelectionFromLegacyHero(fighter));
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
  return toolDefinitions[toolId]?.name ?? String(toolId).replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeSenses(senses = {}) {
  if (!senses || typeof senses !== "object") return {};
  const normalized = {};
  for (const [sense, value] of Object.entries(senses)) {
    if (value === true) {
      normalized[sense] = true;
      continue;
    }
    const range = Number(value);
    normalized[sense] = Number.isFinite(range) ? Math.max(0, Math.floor(range)) : value;
  }
  return normalized;
}

function mergeSenses(...senseSources) {
  const merged = {};
  for (const senses of senseSources) {
    const normalized = normalizeSenses(senses);
    for (const [sense, value] of Object.entries(normalized)) {
      if (value === true || merged[sense] === true) {
        merged[sense] = true;
        continue;
      }
      const current = Number(merged[sense] ?? 0);
      const next = Number(value ?? 0);
      merged[sense] = Number.isFinite(next) ? Math.max(Number.isFinite(current) ? current : 0, next) : value;
    }
  }
  return merged;
}

function fighterEffectiveSenses(fighter) {
  if (!fighter) return {};
  const statusSenses = (fighter.statusEffects ?? []).map((effect) => effect.senses ?? effect.grantsSenses).filter(Boolean);
  const seen = new Set();
  const itemSenses = equipmentSlots
    .map((slot) => equippedItem(fighter, slot.id))
    .filter((item) => {
      if (!item || seen.has(item.id) || !fighterIsAttunedToItem(fighter, item)) return false;
      seen.add(item.id);
      return true;
    })
    .map((item) => item.senses ?? item.grantsSenses)
    .filter(Boolean);
  return mergeSenses(fighter.racialSenses, fighter.senses, ...statusSenses, ...itemSenses);
}

function inferredCreatureSenses(fighter = {}) {
  const tags = new Set((fighter.tags ?? []).map((tag) => String(tag).toLowerCase()));
  const haystack = [fighter.id, fighter.baseMonsterId, fighter.templateId, fighter.name, ...(fighter.tags ?? [])].join(" ").toLowerCase();
  const senses = {};
  const addDarkvision = (feet) => {
    senses.darkvision = Math.max(Number(senses.darkvision ?? 0) || 0, feet);
  };
  if (tags.has("fiend") || tags.has("devil") || tags.has("demon")) addDarkvision(120);
  if (tags.has("drow") || tags.has("duergar") || tags.has("underdark") || tags.has("deep")) addDarkvision(120);
  if (tags.has("undead") || tags.has("ghost") || tags.has("phantom") || tags.has("wraith") || tags.has("zombie") || tags.has("skeletal")) addDarkvision(60);
  if (tags.has("aberration") || tags.has("monstrosity") || tags.has("elemental") || tags.has("fey")) addDarkvision(60);
  if (tags.has("ooze")) senses.blindsight = Math.max(Number(senses.blindsight ?? 0) || 0, 60);
  if (tags.has("construct") && /horror|guardian|sentinel|golem|engine|gear|forge|arcane/.test(haystack)) addDarkvision(60);
  if (
    tags.has("beast") &&
    /bat|rat|spider|cave|underground|underdark|night|nocturnal|deep|shadow|blind|cat|panther|lion|tiger|leopard|jaguar|lynx|wolf|hound|fox|jackal|hyena|owl|crocodile|alligator|gator|snake|viper|serpent|lizard/.test(haystack)
  ) {
    addDarkvision(60);
  }
  if (/bat/.test(haystack)) senses.blindsight = Math.max(Number(senses.blindsight ?? 0) || 0, 60);
  return senses;
}

function normalizeCreatureSenses(fighter = {}) {
  fighter.senses = mergeSenses(inferredCreatureSenses(fighter), fighter.senses);
  return fighter.senses;
}

function fighterDarkvisionRange(fighter) {
  const range = fighterEffectiveSenses(fighter).darkvision;
  return range === true ? Number.POSITIVE_INFINITY : Math.max(0, Number(range) || 0);
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
  const abilityBonuses = mergeAbilityBonuses(subrace.replaceBaseAbilityBonuses ? {} : base.abilityBonuses, subrace.abilityBonuses, chosenBonuses);
  const damageResistances = uniqueValues([...(base.damageResistances ?? []), ...(subrace.damageResistances ?? []), ancestry?.damageType]);
  const damageImmunities = uniqueValues([...(base.damageImmunities ?? []), ...(subrace.damageImmunities ?? [])]);
  const senses = mergeSenses(base.senses, subrace.senses);
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
    senses,
    weaponProficiencies: proficiencyEntries([...(base.weaponProficiencies ?? []), ...(subrace.weaponProficiencies ?? [])]),
    armorProficiencies: proficiencyEntries([...(base.armorProficiencies ?? []), ...(subrace.armorProficiencies ?? [])]),
    skillProficiencies: uniqueValues([...(base.skillProficiencies ?? []), ...(subrace.skillProficiencies ?? [])]),
    skillChoiceCount: (base.skillChoiceCount ?? 0) + (subrace.skillChoiceCount ?? 0),
    skillChoices: uniqueValues([...(base.skillChoices ?? allSkillIds), ...(subrace.skillChoices ?? [])]),
    startingFeatChoiceCount: (base.startingFeatChoiceCount ?? 0) + (subrace.startingFeatChoiceCount ?? 0),
    toolProficiencies: uniqueValues([...(base.toolProficiencies ?? []), ...(subrace.toolProficiencies ?? [])]),
    toolChoiceCount: (base.toolChoiceCount ?? 0) + (subrace.toolChoiceCount ?? 0),
    toolChoices: uniqueValues([...(base.toolChoices ?? []), ...(subrace.toolChoices ?? [])]),
    traits: uniqueValues([...(base.traits ?? []), ...(subrace.traits ?? [])]),
    spellTraits: uniqueValues([...(base.spellTraits ?? []), ...(subrace.spellTraits ?? [])]),
    flying: Boolean(base.flying || subrace.flying),
    powerfulBuild: Boolean(base.powerfulBuild || subrace.powerfulBuild),
    halflingLucky: Boolean(base.halflingLucky || subrace.halflingLucky),
    relentlessEndurance: Boolean(base.relentlessEndurance || subrace.relentlessEndurance),
    savageAttacks: Boolean(base.savageAttacks || subrace.savageAttacks),
    dragonDamageType: ancestry?.damageType ?? "",
    dragonBreathSaveAbility: ancestry?.saveAbility ?? "dex",
  };
}

function normalizeHeroRacialSenses(fighter = {}) {
  if (!isClassHero(fighter)) return fighter.racialSenses ?? {};
  fighter.raceSelection = normalizeHeroRaceSelection(fighter);
  const raceTraits = raceTraitsForSelection(fighter.raceSelection);
  fighter.race = raceTraits.raceId;
  fighter.subrace = raceTraits.subraceId;
  fighter.speciesName = fighter.speciesName ?? raceTraits.raceName;
  fighter.subraceName = fighter.subraceName ?? raceTraits.subraceName;
  fighter.racialTraits = {
    ...(fighter.racialTraits ?? {}),
    senses: mergeSenses(raceTraits.senses, fighter.racialTraits?.senses),
  };
  fighter.racialSenses = mergeSenses(raceTraits.senses, fighter.racialTraits?.senses, fighter.racialSenses);
  if (!isWildShaped(fighter)) fighter.senses = mergeSenses(fighter.senses, fighter.racialSenses);
  return fighter.racialSenses;
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
      senses: raceTraits.senses,
      flying: raceTraits.flying,
      powerfulBuild: raceTraits.powerfulBuild,
    },
    racialSenses: raceTraits.senses,
    senses: mergeSenses(settings.senses, raceTraits.senses),
    flying: Boolean(settings.flying || raceTraits.flying),
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
  if (String(key ?? "").startsWith("instrument:")) {
    const songId = String(key).slice("instrument:".length);
    const song = activeInstrumentPerformance?.songs?.find((entry) => entry.id === songId) ?? null;
    if (song?.src) return song.src;
  }
  const fixedMusicPaths = {
    "village:monster-guild": [`${soundAssetRoot}/music/village-trophy-lodge.mp3`],
    "village:gravebinders": [`${soundAssetRoot}/music/village-gravebinders.mp3`, `${soundAssetRoot}/music/village-gravebinders-2.mp3`],
    "village:crucible-collegium": [`${soundAssetRoot}/music/village-crucible-collegium.mp3`, `${soundAssetRoot}/music/village-crucible-collegium-2.mp3`],
    "village:antiquarian-society": [`${soundAssetRoot}/music/village-antiquarian-society.mp3`, `${soundAssetRoot}/music/village-antiquarian-society-2.mp3`],
    "village:expedition-board": [`${soundAssetRoot}/music/village-expedition-board.mp3`, `${soundAssetRoot}/music/village-expedition-board-2.mp3`],
    "village:boom-club": [`${soundAssetRoot}/music/village-boom-club.mp3`, `${soundAssetRoot}/music/village-boom-club-2.mp3`],
    "village:fighting-pit": [`${soundAssetRoot}/music/village-fighting-pit.mp3`, `${soundAssetRoot}/music/village-fighting-pit-2.mp3`],
    "inn": [`${soundAssetRoot}/music/inn.mp3`, `${soundAssetRoot}/music/inn-2.mp3`],
    "fighting-pit-arena": `${soundAssetRoot}/music/fighting-pit-arena.mp3`,
  };
  const fixedPath = fixedMusicPaths[key];
  if (Array.isArray(fixedPath)) return fixedPath[Math.floor(Math.random() * fixedPath.length)] ?? fixedPath[0];
  if (fixedPath) return fixedPath;
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
  const instrumentKey = activeInstrumentMusicKey();
  if (instrumentKey) return instrumentKey;
  if (!state) return "";
  if (state?.questFlags?.fightingPitRun?.active && state.mode !== "home") return "fighting-pit-arena";
  if (activeVillageMusicKey && !els.villageMenu?.classList.contains("hidden")) return activeVillageMusicKey;
  if (state.mode === "camp" && typeof travelCampIsInn === "function" && travelCampIsInn()) return "inn";
  if (state.mode === "home") return "home";
  if (state.mode === "combat") {
    return combatMonsters().some((monster) => monster.id?.startsWith("boss-")) ? "boss-combat" : "combat";
  }
  return state.mode === "exploration" ? "exploration" : "";
}

function activeInstrumentMusicKey() {
  if (!activeInstrumentPerformance || !state || state.mode === "combat") {
    activeInstrumentPerformance = null;
    return "";
  }
  const hero = state.fighters?.[activeInstrumentPerformance.heroId];
  const object = activeInstrumentPerformance.objectId ? (state.dungeonObjects ?? []).find((entry) => entry.id === activeInstrumentPerformance.objectId) : null;
  const samePosition =
    !activeInstrumentPerformance.startPosition ||
    (hero?.position?.x === activeInstrumentPerformance.startPosition.x && hero?.position?.y === activeInstrumentPerformance.startPosition.y);
  if (!hero || hero.dead || (object ? !instrumentPerformerAdjacent(hero, object) : !samePosition)) {
    activeInstrumentPerformance = null;
    return "";
  }
  return `instrument:${activeInstrumentPerformance.songId}`;
}

function instrumentPerformerAdjacent(hero, object) {
  if (!hero?.position || !object?.position) return false;
  return objectCells(object).some((cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1);
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
  adminProgressOpen = false;
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
  return Math.round(averagePartyLevel(hero)) % 2 === 0;
}

function monsterCategory(monster) {
  return monster.category ?? monster.cat ?? 1;
}

const monsterCategoryAverages = {
  1: { maxHp: 12, ac: 13, attackBonus: 4, damage: 5 },
  2: { maxHp: 26, ac: 14, attackBonus: 5, damage: 8 },
  3: { maxHp: 45, ac: 15, attackBonus: 6, damage: 10 },
  4: { maxHp: 72, ac: 17, attackBonus: 7, damage: 14 },
  5: { maxHp: 101, ac: 17, attackBonus: 9, damage: 18 },
  6: { maxHp: 134, ac: 18, attackBonus: 10, damage: 23 },
  7: { maxHp: 175, ac: 20, attackBonus: 11, damage: 27 },
  8: { maxHp: 224, ac: 20, attackBonus: 12, damage: 33 },
  9: { maxHp: 272, ac: 22, attackBonus: 13, damage: 38 },
  10: { maxHp: 340, ac: 23, attackBonus: 14, damage: 43 },
};

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

const swarmSpawnTuning = playtestTuningObject("monsters.swarmSpawns", {
  minimumCount: 2,
  maximumPartySize: 4,
  basePartySize: 1,
  extraPerPartyMember: 1,
  extraPerCategoryGap: 1,
  maximumExtraFromLevelGap: 4,
  absoluteMaximum: 8,
});

const roomMonsterSpawnTuning = playtestTuningObject("monsters.roomSpawns", {
  baseCount: 1,
  extraPerPartyMember: 0.65,
  categoryGapBonus: 0.45,
  randomSpread: 0.6,
  maximumCount: 5,
  entranceRoomSpawnChance: 0,
  roomSpawnChance: 0.72,
});

const monsterThrownWeaponPickupChance = playtestTuningNumber("monsters.thrownWeaponPickupChance", 0.02);
const monsterSpecialAbilityTuning = playtestTuningObject("monsters.specialAbilities", {
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
});

function monsterCategoryRingColor(monster) {
  const category = Math.max(1, Math.min(10, Number(monsterCategory(monster)) || 1));
  return monsterCategoryRingColors[category] ?? monsterCategoryRingColors[1];
}

function averagePartyLevel(hero = state?.fighters?.hero) {
  if (Number.isFinite(hero?.partyAverageLevel)) return hero.partyAverageLevel;
  if (Number.isFinite(hero?.level) && Number.isFinite(hero?.partySize)) return hero.level;
  const heroIds = state?.party?.heroIds ?? ["hero"];
  const heroes = heroIds.map((id) => state?.fighters?.[id]).filter(Boolean);
  if (heroes.length === 0) return hero?.level ?? 1;
  return heroes.reduce((sum, entry) => sum + (entry.level ?? 1), 0) / heroes.length;
}

function partyTargetMonsterCategory(hero = state?.fighters?.hero) {
  return clamp(categoryForHeroLevel(averagePartyLevel(hero)), 1, 10);
}

function partySizeForSwarm(hero = state?.fighters?.hero) {
  const stateSize = state?.party?.heroIds?.length;
  const explicitSize = hero?.partySize ?? hero?.party?.size;
  return clamp(Number(stateSize ?? explicitSize ?? 1) || 1, 1, swarmSpawnTuning.maximumPartySize);
}

function swarmSpawnCount(monsterTemplate, hero) {
  const partySize = partySizeForSwarm(hero);
  const partyLevelCategory = partyTargetMonsterCategory(hero);
  const categoryGap = Math.max(0, partyLevelCategory - monsterCategory(monsterTemplate));
  const partyExtra = Math.max(0, partySize - swarmSpawnTuning.basePartySize) * swarmSpawnTuning.extraPerPartyMember;
  const levelExtra = Math.min(swarmSpawnTuning.maximumExtraFromLevelGap, categoryGap * swarmSpawnTuning.extraPerCategoryGap);
  return clamp(swarmSpawnTuning.minimumCount + partyExtra + levelExtra, swarmSpawnTuning.minimumCount, swarmSpawnTuning.absoluteMaximum);
}

function roomMonsterSpawnCount(monsterTemplate, hero) {
  if (monsterTemplate.behavior === "swarm") return swarmSpawnCount(monsterTemplate, hero);
  const partySize = partySizeForSwarm(hero);
  const partyLevelCategory = partyTargetMonsterCategory(hero);
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
  const targetCategory = partyTargetMonsterCategory(hero);
  const allowedMonsterIds = dungeonMonsterIds(themeId);
  const entries = allowedMonsterIds
    .map((id) => ({ id, template: getMonsterTemplate(id) }))
    .filter((entry) => entry.template && monsterCategory(entry.template) <= targetCategory)
    .map((entry) => {
      const category = monsterCategory(entry.template);
      return {
        id: entry.id,
        template: entry.template,
        weight: category === targetCategory ? 3 : 1,
      };
    });

  return entries.length ? entries : allowedMonsterIds.map((id) => ({ id, template: getMonsterTemplate(id), weight: 1 }));
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

function monsterMeaningfulTags(monster = {}) {
  const ignored = new Set(["boss", "swarm", "minion", "ranged", "melee", "caster", "brute", "skirmisher", "controller", "tank", "artillery"]);
  return new Set((monster.tags ?? []).filter((tag) => tag && !ignored.has(tag)));
}

function monsterCombatRole(monster = {}) {
  const text = `${monster.behavior ?? ""} ${monster.role ?? ""} ${(monster.tags ?? []).join(" ")}`.toLowerCase();
  if (/ranged|kiter|archer|marksman|crossbow|artillery|caster|warlock|hex|oracle|invoker|mage|spell|sentry|thrower/.test(text)) return "ranged";
  if (/controller|jailer|gaoler|lock|pull|snare|chain|command/.test(text)) return "control";
  if (/tank|shield|sentinel|guard|armored|armoured|plate|brute|charger|mauler|crusher|behemoth/.test(text)) return "frontline";
  return "melee";
}

function monsterRolesComplement(a = "melee", b = "melee") {
  if (a === b) return false;
  if ((a === "ranged" && b === "melee") || (a === "melee" && b === "ranged")) return true;
  if ((a === "ranged" && b === "frontline") || (a === "frontline" && b === "ranged")) return true;
  if (a === "control" || b === "control") return true;
  return false;
}

function pickCompanionMonsterTemplate(anchorTemplate, roomTemplates, monsterEntries, usedCounts, localCounts, fallbackTemplate) {
  const anchorTags = monsterMeaningfulTags(anchorTemplate);
  const roomRoles = new Set(roomTemplates.map(monsterCombatRole));
  const anchorRole = monsterCombatRole(anchorTemplate);
  const matchingTagCandidates = monsterEntries
    .map((entry) => entry.template ?? getMonsterTemplate(entry.id))
    .filter((template) => template && template.behavior !== "swarm")
    .filter((template) => Array.from(monsterMeaningfulTags(template)).some((tag) => anchorTags.has(tag)));
  const offThemeAllowed = matchingTagCandidates.length < 2 || Math.random() < 0.08;
  const weightedCandidates = monsterEntries
    .map((entry) => ({ ...entry, template: entry.template ?? getMonsterTemplate(entry.id) }))
    .filter((entry) => entry.template && entry.template.behavior !== "swarm")
    .map((entry) => {
      const template = entry.template;
      const tags = monsterMeaningfulTags(template);
      const sharedTagCount = Array.from(tags).filter((tag) => anchorTags.has(tag)).length;
      const role = monsterCombatRole(template);
      const alreadyInRoom = localCounts[entry.id] ?? 0;
      let weight = entry.weight ?? 1;
      weight *= 1 + Math.min(3, sharedTagCount) * 1.2;
      if (sharedTagCount === 0) weight *= offThemeAllowed ? 0.04 : 0;
      if (monsterRolesComplement(anchorRole, role) || Array.from(roomRoles).some((existingRole) => monsterRolesComplement(existingRole, role))) weight *= 1.75;
      if (roomRoles.has(role)) weight *= 0.65;
      if (entry.id === anchorTemplate.id && monsterEntries.length > 1) weight *= 0.22;
      weight /= Math.max(1, (usedCounts[entry.id] ?? 0) + alreadyInRoom + 1);
      return { template, weight: weight > 0 ? Math.max(0.01, weight) : 0 };
    })
    .filter((entry) => entry.weight > 0);
  const total = weightedCandidates.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return fallbackTemplate;
  let roll = Math.random() * total;
  for (const entry of weightedCandidates) {
    roll -= entry.weight;
    if (roll <= 0) return entry.template;
  }
  return weightedCandidates.at(-1)?.template ?? fallbackTemplate;
}

function roomMonsterComposition(anchorTemplate, spawnCount, monsterEntries, usedCounts) {
  if (anchorTemplate.behavior === "swarm" || spawnCount <= 1) return Array.from({ length: spawnCount }, () => anchorTemplate);
  const templates = [anchorTemplate];
  const localCounts = { [anchorTemplate.id]: 1 };
  while (templates.length < spawnCount) {
    const companion = pickCompanionMonsterTemplate(anchorTemplate, templates, monsterEntries, usedCounts, localCounts, anchorTemplate);
    templates.push(companion);
    localCounts[companion.id] = (localCounts[companion.id] ?? 0) + 1;
  }
  return templates;
}

function bossMonsterIdForHero(hero, themeId = currentThemeId()) {
  const targetCategory = partyTargetMonsterCategory(hero);
  const bosses = dungeonBossMonsterIds(themeId)
    .map((id) => ({ id, template: getMonsterTemplate(id) }))
    .filter((entry) => entry.template && monsterCategory(entry.template) <= targetCategory)
    .sort((a, b) => monsterCategory(b.template) - monsterCategory(a.template));
  return bosses[0]?.id ?? null;
}

function averageDamageForProfile(damage = {}) {
  const flat = Number(damage.flat);
  if (Number.isFinite(flat) && flat > 0) return flat;
  const count = Number(damage.count) || 0;
  const sides = Number(damage.sides) || 0;
  const bonus = Number(damage.bonus) || 0;
  if (count <= 0 || sides <= 0) return Math.max(0, bonus);
  return count * ((sides + 1) / 2) + bonus;
}

function applyMonsterCategoryScaling(monster, hero) {
  const originalCategory = monsterCategory(monster);
  const targetCategory = partyTargetMonsterCategory(hero);
  const categoryGap = Math.max(0, targetCategory - originalCategory);
  if (categoryGap <= 0) return monster;

  const originalAverages = monsterCategoryAverages[originalCategory] ?? monsterCategoryAverages[1];
  const targetAverages = monsterCategoryAverages[targetCategory] ?? monsterCategoryAverages[10];
  const catchUp = Math.min(0.86, 0.54 + categoryGap * 0.08);

  const scaleTowardAverage = (value, sourceAverage, targetAverage, intensity = catchUp) => {
    const currentValue = Number(value);
    if (!Number.isFinite(currentValue)) return value;
    const source = Math.max(1, Number(sourceAverage) || 1);
    const target = Math.max(source, Number(targetAverage) || source);
    const targetValue = currentValue * (1 + ((target / source) - 1) * intensity);
    return Math.max(1, Math.round(targetValue));
  };

  const scaleFlatDamage = (damage, intensity = catchUp) => {
    const currentAverage = averageDamageForProfile(damage);
    if (!Number.isFinite(currentAverage) || currentAverage <= 0) return damage;
    const source = Math.max(1, originalAverages.damage);
    const target = Math.max(source, targetAverages.damage);
    const targetAverage = currentAverage * (1 + ((target / source) - 1) * intensity);
    const bonusIncrease = Math.max(0, Math.round(targetAverage - currentAverage));
    if (bonusIncrease <= 0) return damage;
    const scaledDamage = {
      ...damage,
      bonus: (damage.bonus ?? 0) + bonusIncrease,
    };
    return {
      ...scaledDamage,
      label: formatDamage(scaledDamage),
    };
  };

  const scaledMultiattack = () => {
    if (monster.behavior === "swarm") return null;
    const config = monsterMultiattackConfig(monster);
    const currentAttacks = config?.attacks ?? 1;
    const attackStyleCanScale = ["melee", "charger", "skirmisher", "guardian", "brute", "ranged", "rangedKiter"].includes(monster.behavior ?? "melee");
    if (!attackStyleCanScale) return config;

    let targetAttacks = currentAttacks;
    if (targetCategory >= 4 && categoryGap >= 3) targetAttacks = Math.max(targetAttacks, 2);
    if (targetCategory >= 7 && categoryGap >= 4) targetAttacks = Math.max(targetAttacks, 3);
    if (targetCategory >= 10 && categoryGap >= 6 && (monster.tags ?? []).includes("boss")) targetAttacks = Math.max(targetAttacks, 4);
    if (targetAttacks <= 1) return config;

    const damageMultiplier = targetAttacks >= 4 ? 0.32 : targetAttacks >= 3 ? 0.42 : 0.55;
    return {
      ...(config ?? {}),
      attacks: Math.min(4, targetAttacks),
      damageMultiplier: Math.min(config?.damageMultiplier ?? 1, damageMultiplier),
      scaledFromCategoryGap: categoryGap,
    };
  };

  monster.baseCategory = monster.baseCategory ?? originalCategory;
  monster.scaledFromCategory = originalCategory;
  monster.category = targetCategory;
  monster.scaledToCategory = targetCategory;
  monster.maxHp = scaleTowardAverage(monster.maxHp, originalAverages.maxHp, targetAverages.maxHp);
  monster.baseMaxHp = monster.maxHp;
  monster.hp = monster.maxHp;
  monster.baseAc = scaleTowardAverage(monster.baseAc ?? monster.ac ?? 10, originalAverages.ac, targetAverages.ac, Math.min(0.7, catchUp));
  monster.ac = monster.baseAc;
  monster.attackBonus = scaleTowardAverage(monster.attackBonus ?? 0, originalAverages.attackBonus, targetAverages.attackBonus, Math.min(0.78, catchUp));
  monster.baseDamage = scaleFlatDamage(monster.baseDamage ?? monster.damage ?? { count: 1, sides: 4, bonus: 0 });
  monster.damage = { ...monster.baseDamage };
  const multiattack = scaledMultiattack();
  if (multiattack) monster.multiattack = multiattack;
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
  if (typeof objectOrType !== "string" && objectOrType?.homePlaced) return [];
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

function objectTags(objectOrType) {
  const template =
    typeof objectOrType === "string"
      ? objectTemplate(objectOrType)
      : objectTemplate(objectOrType?.type);
  return template?.tags ?? [];
}

function objectHasTag(objectOrType, tag) {
  return objectTags(objectOrType).includes(tag);
}

function fighterIsFlying(fighter) {
  return Boolean(fighter?.flying || (fighter?.statusEffects ?? []).some((effect) => effect.flying));
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
  if (object?.homePlaced) return false;
  if (objectHasComponent(object, "resourceNode")) return false;
  return Boolean(
    objectHasComponent(object, "hiddenLoot") ||
      objectHasComponent(object, "harvestableResource") ||
      objectHasComponent(object, "inspectEvent"),
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

function movementCostAtPosition(position, fighter = null) {
  const mover = fighter ?? (typeof activeFighter === "function" ? activeFighter() : null) ?? (typeof activeHero === "function" ? activeHero() : null);
  const objects = objectsAtPosition(position);
  const persistentDifficultTerrain =
    typeof persistentAreaDifficultTerrainKeys === "function" && persistentAreaDifficultTerrainKeys().has(positionKey(position));
  const ignoresTerrainCost =
    (fighterIsFlying(mover) && objects.some((object) => objectHasTag(object, "floor"))) ||
    (mover?.subclassId === "circle-land" && (mover.level ?? 1) >= 10);
  const baseCost = ignoresTerrainCost || (!persistentDifficultTerrain && !objects.some((object) => objectHasComponent(object, "difficultTerrain"))) ? 1 : 2;
  return fighterIsDraggingEntity(mover) ? baseCost * 2 : baseCost;
}

function objectIsHazardousTerrain(object) {
  return Boolean(objectHasComponent(object, "hazardOnEnter") || objectHasComponent(object, "hazardOnMovement"));
}

function objectCells(object) {
  const template = objectTemplate(object.type);
  if (!template) return [];
  const { width, height } = objectRotatedSize({
    width: object.width ?? template.width ?? 1,
    height: object.height ?? template.height ?? 1,
    rotation: object.rotation ?? 0,
  });
  return Array.from({ length: width * height }, (_, index) => ({
    x: object.position.x + (index % width),
    y: object.position.y + Math.floor(index / width),
  }));
}

function objectAt(position) {
  const objects = objectsAtPosition(position);
  return objects.find((object) => !objectHasTag(object, "terrain-floor")) ?? objects[0] ?? null;
}

function objectsAtPosition(position) {
  const tileKey = positionKey(position);
  return (state.dungeonObjects ?? []).filter((object) => objectCells(object).some((cell) => positionKey(cell) === tileKey));
}

function objectBlocksMovement(object) {
  return Boolean(objectTemplate(object.type)?.blocksMovement || objectHasComponent(object, "blocksMovement"));
}

function flyingCanPassObject(object, fighter = null) {
  return fighterIsFlying(fighter) && objectBlocksMovement(object) && objectHasTag(object, "floor") && !objectBlocksLineOfSight(object);
}

function objectBlocksMovementFor(object, fighter = null) {
  if (grabbedObjectForCarrier(fighter)?.id === object?.id) return false;
  return objectBlocksMovement(object) && !flyingCanPassObject(object, fighter);
}

function activeGrabForCarrier(fighter) {
  const grab = state?.grabbedEntity;
  return grab?.carrierId && fighter?.id && grab.carrierId === fighter.id ? grab : null;
}

function fighterIsDraggingEntity(fighter) {
  return Boolean(activeGrabForCarrier(fighter));
}

function grabbedFighterForCarrier(fighter) {
  const grab = activeGrabForCarrier(fighter);
  return grab?.kind === "fighter" ? state?.fighters?.[grab.targetId] ?? null : null;
}

function grabbedObjectForCarrier(fighter) {
  const grab = activeGrabForCarrier(fighter);
  return grab?.kind === "object" ? dungeonObjectForId(grab.targetId) : null;
}

function objectGrabWeight(objectOrType) {
  const template = typeof objectOrType === "string" ? objectTemplate(objectOrType) : objectTemplate(objectOrType?.type);
  const explicitWeight = objectOrType?.weight ?? template?.weight ?? template?.grabWeight;
  const componentWeight = objectComponent(objectOrType, "pushableObject")?.weight;
  const weight = explicitWeight ?? componentWeight;
  return Number.isFinite(Number(weight)) ? Number(weight) : null;
}

function objectCanBeGrabbed(object) {
  if (!object?.id || object.homePlaced) return false;
  const weight = objectGrabWeight(object);
  if (weight === 666) return false;
  return weight !== null;
}

function objectCanBeGrabbedBy(fighter, object) {
  if (!objectCanBeGrabbed(object)) return false;
  refreshPushDragLiftStats(fighter);
  return objectGrabWeight(object) <= (fighter.pushDragLiftMaxAttemptLb ?? 0);
}

function pushDragLiftAttemptDc(fighter, weightLb) {
  refreshPushDragLiftStats(fighter);
  const autoLb = fighter.pushDragLiftAutoLb ?? abilityScore(fighter, "str") * 15;
  const normalLb = fighter.pushDragLiftLb ?? abilityScore(fighter, "str") * 30;
  const maxLb = fighter.pushDragLiftMaxAttemptLb ?? abilityScore(fighter, "str") * 40;
  if (weightLb <= autoLb) return 0;
  if (weightLb > maxLb) return Infinity;
  const pressure = (weightLb - autoLb) / Math.max(1, normalLb - autoLb);
  const dc = 10 + Math.ceil(pressure * 8);
  return Math.max(weightLb > normalLb ? 20 : 12, Math.min(25, dc));
}

function blockingObjectKeys(fighter = null) {
  const keys = new Set();
  for (const object of state?.dungeonObjects ?? []) {
    if (!objectBlocksMovementFor(object, fighter)) continue;
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

function objectTypeIsTerrainFloor(type) {
  const template = objectTemplate(type);
  return Boolean(template?.tags?.includes("terrain-floor") && !template.blocksMovement);
}

function dungeonTerrainFloorIds(themeId = currentThemeId()) {
  const theme = getContentDefinition("themes", themeId);
  if (theme?.terrainFloorIds?.length) return theme.terrainFloorIds.filter(objectTypeIsTerrainFloor);
  const tagGroups = normalizeTagGroups(theme?.terrainFloorTagGroups, theme?.terrainFloorTags);
  return idsMatchingTagGroups("furniture", tagGroups).filter(objectTypeIsTerrainFloor);
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

function objectTypeIsResourceNode(type) {
  const template = objectTemplate(type);
  return template?.kind === "resource-node" || objectHasComponent(type, "resourceNode") || objectTags(type).includes("resource-node");
}

function resourceNodeSpawnSettings(theme = null, dungeonSizeId = "large") {
  const sizeSettings = dungeonSizeDefinition(dungeonSizeId)?.resourceNodes;
  const themeSizeSettings = theme?.resourceNodesBySize?.[dungeonSizeId] ?? theme?.resourceNodeSpawnsBySize?.[dungeonSizeId];
  const settings = themeSizeSettings ?? sizeSettings ?? theme?.resourceNodes ?? theme?.resourceNodeSpawns ?? {};
  if (settings === false) return { min: 0, max: 0, chance: 0 };
  const min = Math.max(0, Math.floor(Number(settings.min ?? 1) || 0));
  const max = Math.max(min, Math.floor(Number(settings.max ?? 2) || 0));
  const chance = Math.max(0, Math.min(1, Number(settings.chance ?? 1)));
  return { min, max, chance };
}

function resourceNodeTargetCount(theme, availableTypeCount, dungeonSizeId = "large", maxPlacements = Infinity) {
  if (availableTypeCount <= 0 || maxPlacements <= 0) return 0;
  const settings = resourceNodeSpawnSettings(theme, dungeonSizeId);
  if (settings.max <= 0 || Math.random() >= settings.chance) return 0;
  const cap = Math.min(settings.max, maxPlacements);
  const min = Math.min(settings.min, cap);
  return min + Math.floor(Math.random() * (cap - min + 1));
}

function dungeonResourceNodeIds(themeId = currentThemeId(), allowedFurnitureIds = dungeonFurnitureIds(themeId)) {
  const theme = getContentDefinition("themes", themeId);
  if (theme?.resourceNodeIds?.length) return theme.resourceNodeIds.filter(objectTypeIsResourceNode);
  if (Array.isArray(theme?.resourceNodeTagGroups)) {
    const tagGroups = normalizeTagGroups(theme.resourceNodeTagGroups, theme.resourceNodeTags);
    return idsMatchingTagGroups("furniture", tagGroups).filter(objectTypeIsResourceNode);
  }
  return [...allowedFurnitureIds].filter(objectTypeIsResourceNode);
}

function shuffledCopy(values = []) {
  return values.slice().sort(() => Math.random() - 0.5);
}

function randomIntegerBetween(minimum, maximum) {
  const min = Math.floor(Number(minimum) || 0);
  const max = Math.max(min, Math.floor(Number(maximum) || min));
  return min + Math.floor(Math.random() * (max - min + 1));
}

function terrainFloorSettings(theme = null) {
  const settings = theme?.terrainFloors ?? {};
  const pools = settings.pools ?? {};
  const tilesPerPool = settings.tilesPerPool ?? {};
  return {
    minPools: Math.max(0, Math.floor(Number(pools.min ?? 0) || 0)),
    maxPools: Math.max(0, Math.floor(Number(pools.max ?? 1) || 0)),
    chance: Math.max(0, Math.min(1, Number(pools.chance ?? 0.45))),
    minTiles: Math.max(1, Math.floor(Number(tilesPerPool.min ?? 3) || 3)),
    maxTiles: Math.max(1, Math.floor(Number(tilesPerPool.max ?? 5) || 5)),
    tileOverrides: settings.tileOverrides ?? {},
    hallwayChance: Math.max(0, Math.min(1, Number(settings.hallwayChance ?? 0.04))),
    doorChance: Math.max(0, Math.min(1, Number(settings.doorChance ?? 0.03))),
  };
}

function terrainFloorTileRange(settings, type) {
  const override = settings.tileOverrides?.[type] ?? {};
  const min = Math.max(1, Math.floor(Number(override.min ?? settings.minTiles) || settings.minTiles));
  const max = Math.max(min, Math.floor(Number(override.max ?? settings.maxTiles) || settings.maxTiles));
  return { min, max };
}

function terrainFloorPoolCount(theme = null) {
  const settings = terrainFloorSettings(theme);
  if (settings.maxPools <= 0 || Math.random() >= settings.chance) return 0;
  return randomIntegerBetween(settings.minPools, Math.max(settings.minPools, settings.maxPools));
}

function pickTerrainFloorId(ids = [], theme = null) {
  if (!ids.length) return null;
  const weights = theme?.terrainFloorWeights ?? {};
  const weighted = ids.map((id) => ({ id, weight: Math.max(0.01, Number(weights[id] ?? 1) || 1) }));
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = Math.random() * total;
  for (const entry of weighted) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return weighted.at(-1)?.id ?? ids[0];
}

function roomEdgeWeight(cell, room) {
  const roomKeys = new Set(room.cells.map(positionKey));
  const openSides = adjacentCells(cell).filter((neighbor) => !roomKeys.has(positionKey(neighbor))).length;
  return 1 + openSides * 4 + (openSides >= 2 ? 8 : 0);
}

function weightedRoomEdgeCell(room, usedFloorKeys = new Set(), reservedKeys = new Set(), allowDoor = false) {
  const doorKeys = roomDoorKeys(room);
  const candidates = room.cells
    .filter((cell) => !usedFloorKeys.has(positionKey(cell)))
    .filter((cell) => !reservedKeys.has(positionKey(cell)))
    .filter((cell) => allowDoor || !doorKeys.has(positionKey(cell)))
    .map((cell) => ({ cell, weight: roomEdgeWeight(cell, room) }));
  const total = candidates.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const entry of candidates) {
    roll -= entry.weight;
    if (roll <= 0) return entry.cell;
  }
  return candidates.at(-1)?.cell ?? null;
}

function terrainFloorCluster(seed, room, targetSize, usedFloorKeys = new Set(), reservedKeys = new Set(), settings = terrainFloorSettings(), dungeon = null) {
  const roomKeys = new Set(room.cells.map(positionKey));
  const doorKeys = roomDoorKeys(room);
  const cluster = [];
  const queue = seed ? [seed] : [];
  const addCell = (cell, allowReserved = false) => {
    const key = positionKey(cell);
    if (usedFloorKeys.has(key) || (!allowReserved && reservedKeys.has(key))) return false;
    if (cluster.some((entry) => positionKey(entry) === key)) return false;
    cluster.push({ ...cell });
    usedFloorKeys.add(key);
    return true;
  };

  while (queue.length && cluster.length < targetSize) {
    const cell = queue.shift();
    if (!roomKeys.has(positionKey(cell)) || !addCell(cell)) continue;
    const neighbors = adjacentCells(cell)
      .filter((neighbor) => roomKeys.has(positionKey(neighbor)))
      .filter((neighbor) => !reservedKeys.has(positionKey(neighbor)))
      .filter((neighbor) => !doorKeys.has(positionKey(neighbor)) || Math.random() < settings.doorChance)
      .sort((a, b) => roomEdgeWeight(b, room) - roomEdgeWeight(a, room) || Math.random() - 0.5);
    neighbors.forEach((neighbor) => queue.push(neighbor));
  }

  if (dungeon?.corridors?.length && Math.random() < settings.hallwayChance && cluster.length < targetSize) {
    const corridorKeys = new Set(dungeon.corridors.map(positionKey));
    const hallway = shuffledCopy(cluster.flatMap(adjacentCells)).find((cell) => corridorKeys.has(positionKey(cell)) && !reservedKeys.has(positionKey(cell)));
    if (hallway) addCell(hallway);
  }

  if (Math.random() < settings.doorChance && cluster.length < targetSize) {
    const door = shuffledCopy(cluster.flatMap(adjacentCells)).find((cell) => doorKeys.has(positionKey(cell)));
    if (door) addCell(door, true);
  }

  return cluster;
}

function placeDungeonTerrainFloors(dungeon, objects, reservedPositions = [], themeId = currentThemeId(), objectId = (type) => `${type}-${objects.length + 1}`) {
  const theme = getContentDefinition("themes", themeId);
  const floorIds = dungeonTerrainFloorIds(themeId);
  if (!floorIds.length) return 0;
  const settings = terrainFloorSettings(theme);
  const poolCount = terrainFloorPoolCount(theme);
  if (poolCount <= 0) return 0;

  const reservedKeys = new Set((reservedPositions ?? []).map(positionKey));
  const usedFloorKeys = new Set(
    objects
      .filter((object) => objectTypeIsTerrainFloor(object.type))
      .flatMap(objectCells)
      .map(positionKey),
  );
  let placed = 0;
  const rooms = shuffledCopy(dungeon.rooms ?? []);

  for (let poolIndex = 0; poolIndex < poolCount; poolIndex += 1) {
    const room = rooms[poolIndex % Math.max(1, rooms.length)];
    if (!room) break;
    const type = pickTerrainFloorId(floorIds, theme);
    if (!type) continue;
    const seed = weightedRoomEdgeCell(room, usedFloorKeys, reservedKeys, Math.random() < settings.doorChance);
    if (!seed) continue;
    const tileRange = terrainFloorTileRange(settings, type);
    const targetSize = randomIntegerBetween(tileRange.min, tileRange.max);
    const cells = terrainFloorCluster(seed, room, targetSize, usedFloorKeys, reservedKeys, settings, dungeon);
    for (const cell of cells) {
      const floor = createFeatureObject(type, cell, objectId(type), themeId);
      floor.terrainPoolId = `terrain-${poolIndex + 1}`;
      objects.push(floor);
      placed += 1;
    }
  }

  return placed;
}

function terrainFloorSummary(objects = []) {
  const counts = {};
  for (const object of objects) {
    if (!objectTypeIsTerrainFloor(object.type)) continue;
    counts[object.type] = (counts[object.type] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([type, count]) => `${objectTemplate(type)?.name ?? type} x${count}`)
    .join(", ");
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
    magical: Boolean(component?.magical),
    disarmSkillOptions: cloneData(component?.disarmSkillOptions ?? []),
    disarmSkill: component?.disarmSkill,
    disarmAbility: component?.disarmAbility,
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
      object.magical = Boolean(trapComponent.magical);
    } else {
      const defaultChance = type === "chest" ? getContentDefinition("themes", themeId)?.traps?.chestChance ?? 0.3 : 1;
      if (Math.random() < (trapComponent.chance ?? defaultChance)) object.trap = createFeatureTrap(trapComponent, themeId);
    }
  }
  const captiveComponent = objectComponent(type, "captiveCreature");
  if (captiveComponent) {
    const monsterIds = captiveComponent.monsterIds ?? (captiveComponent.monsterId ? [captiveComponent.monsterId] : []);
    const availableIds = monsterIds.filter((monsterId) => getMonsterTemplate(monsterId));
    if (availableIds.length) object.captiveMonsterId = availableIds[Math.floor(Math.random() * availableIds.length)];
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

function chestLootPool(level = averagePartyLevel()) {
  const budget = lootBudgetForPartyLevel(level);
  const sourceItems = typeof dungeonLootItems === "function" ? dungeonLootItems() : window.DungeonContent.list("items");
  return sourceItems.filter(
    (item) =>
      ((item.use?.kind === "healing" && !item.use?.charges && lootItemValueGp(item) <= budget.potionGp) ||
        item.type === "ammunition" ||
        (item.type === "weapon" && item.store?.buyable !== false && lootItemValueGp(item) <= budget.equipmentGp)),
  );
}

function randomChestLoot(count = 2, category = currentLootCategory()) {
  const partyLevel = averagePartyLevel(activeHero());
  const pool = chestLootPool(partyLevel);
  const items = Array.from({ length: count }, () => {
    const template = pool[Math.floor(Math.random() * pool.length)];
    return template ? createItemInstance(template.id, "chest") : null;
  }).filter(Boolean);
  const treasureChance = Math.min(
    playtestTuningNumber("loot.chestTreasureChanceMax", 0.5),
    playtestTuningNumber("loot.chestTreasureChanceBase", 0.16) + partyLevel * playtestTuningNumber("loot.chestTreasureChancePerLevel", 0.025),
  );
  if (Math.random() < treasureChance) {
    const treasure = randomTreasureDrop(category);
    if (treasure) items.push(treasure);
  }
  const magicChance = Math.min(
    playtestTuningNumber("loot.chestMagicChanceMax", 0.14),
    Math.max(0, playtestTuningNumber("loot.chestMagicChanceBase", -0.005) + partyLevel * playtestTuningNumber("loot.chestMagicChancePerLevel", 0.015)),
  );
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
        magical: Boolean(template.magical),
        disarmSkillOptions: cloneData(template.disarmSkillOptions ?? []),
        disarmSkill: template.disarmSkill,
        disarmAbility: template.disarmAbility,
        description: template.description ?? "A hidden chest trap.",
      }
    : null;
}

function createDungeonObjects(dungeon, reservedPositions = [], themeId = currentThemeId(), dungeonSizeId = "large") {
  const objects = [];
  const theme = getContentDefinition("themes", themeId);
  const trapSettings = theme?.traps ?? {};
  const allowedFurniture = new Set(dungeonFurnitureIds(themeId));
  const allowedResourceNodes = dungeonResourceNodeIds(themeId, allowedFurniture);
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
      if (objectTypeIsResourceNode(type)) continue;
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

  placeDungeonTerrainFloors(dungeon, objects, reservedPositions, themeId, objectId);

  let resourceNodesToPlace = resourceNodeTargetCount(theme, allowedResourceNodes.length, dungeonSizeId, (dungeon.rooms ?? []).length);
  const resourceRooms = shuffledCopy(dungeon.rooms ?? []);
  const resourceTypes = shuffledCopy(allowedResourceNodes);
  for (const room of resourceRooms) {
    if (resourceNodesToPlace <= 0 || !resourceTypes.length) break;
    for (const type of shuffledCopy(resourceTypes)) {
      if (resourceNodesToPlace <= 0) break;
      if (placeObjectInRoom(type, room)) {
        resourceNodesToPlace -= 1;
        break;
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
  fighter.flying = Boolean(original.flying ?? fighter.racialTraits?.flying);
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
      flying: fighter.flying,
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
  fighter.flying = Boolean(beast.flying || beast.speed?.fly);
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

function itemTemplateId(item) {
  if (!item) return null;
  if (typeof item === "string") return itemAliases[item] ?? item;
  const explicitId = item.baseItemId ?? item.itemId;
  if (explicitId) return itemAliases[explicitId] ?? explicitId;
  if (getItemTemplate(item.id)) return itemAliases[item.id] ?? item.id;
  const itemId = String(item.id ?? "");
  const itemName = String(item.name ?? "").toLowerCase();
  return (
    (window.DungeonContent.list?.("items") ?? []).find((template) => {
      const templateId = itemAliases[template.id] ?? template.id;
      return itemId.includes(`-${templateId}-`) || itemName === String(template.name ?? "").toLowerCase();
    })?.id ?? null
  );
}

function normalizeItem(item) {
  const templateId = itemTemplateId(item);
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
    const itemData = cloneData(item);
    return {
      ...template,
      ...itemData,
      id: finalId,
      baseItemId: aliasedId,
      use: template.use || itemData.use ? { ...(template.use ?? {}), ...(itemData.use ?? {}), status: itemData.use?.status ?? template.use?.status } : undefined,
    };
  }
  return cloneData(item);
}

function starterEquipmentItem(itemId) {
  const item = {
    id: itemId,
    itemId,
    starterEquipment: true,
    sell: { valueCp: 0, rate: 0 },
  };
  if (itemId === "torch") item.quantity = 10;
  return item;
}

function starterEquipmentItems(itemIds = []) {
  return [
    ...itemIds.map((itemId) => (typeof itemId === "string" ? starterEquipmentItem(itemId) : { ...itemId, starterEquipment: true, sell: { ...(itemId.sell ?? {}), valueCp: 0, rate: 0 } })),
    starterEquipmentItem("torch"),
  ];
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

function compactStackableInventoryItems(fighter) {
  if (!fighter?.inventory?.items?.length) return fighter?.inventory;
  const equippedIds = new Set(Object.values(fighter.equipment ?? {}).filter(Boolean));
  const groups = new Map();
  const keep = [];
  for (const item of fighter.inventory.items) {
    if (!item?.stackable) {
      keep.push(item);
      continue;
    }
    const key = `${item.baseItemId ?? item.itemId ?? item.id}:${Boolean(item.starterEquipment)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  for (const group of groups.values()) {
    const primary = group.find((item) => equippedIds.has(item.id)) ?? group[0];
    primary.quantity = group.reduce((sum, item) => sum + Math.max(1, Math.floor(Number(item.quantity) || 1)), 0);
    const groupIds = new Set(group.map((item) => item.id));
    for (const slot of equipmentSlots) {
      if (groupIds.has(fighter.equipment?.[slot.id])) fighter.equipment[slot.id] = primary.id;
    }
    keep.push(primary);
  }
  fighter.inventory.items = keep;
  return fighter.inventory;
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
  item = ensureItemCharges(normalizeItem(item));
  if (itemUsesPartyResourceInventory(item)) {
    addPartyResourceItem(item, item.quantity ?? 1);
    for (const behavior of Object.values(window.DungeonNpcBehaviors ?? {})) behavior.recordItemCollected?.(item);
    return [item];
  }
  if (itemUsesTomeInventory(item)) {
    addPartyTomeItem(item);
    return [item];
  }
  for (const behavior of Object.values(window.DungeonNpcBehaviors ?? {})) behavior.recordItemCollected?.(item);
  if (item.stackable) {
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    const templateId = item.baseItemId ?? item.itemId ?? item.id;
    const stack = fighter.inventory.items.find(
      (entry) => entry.stackable && (entry.baseItemId ?? entry.itemId ?? entry.id) === templateId && Boolean(entry.starterEquipment) === Boolean(item.starterEquipment),
    );
    if (stack) {
      stack.quantity = Math.max(1, Math.floor(Number(stack.quantity) || 1)) + quantity;
      return [stack];
    }
    item.quantity = quantity;
    fighter.inventory.items.push(item);
    return [item];
  }
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

function consumeInventoryItemQuantity(fighter, itemId, quantity = 1) {
  if (!fighter || !itemId) return null;
  const item = itemForId(fighter, itemId);
  if (!item) return null;
  const amount = Math.max(1, Math.floor(Number(quantity) || 1));
  const currentQuantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
  if (item.stackable && currentQuantity > amount) {
    item.quantity = currentQuantity - amount;
    return item;
  }
  fighter.inventory.items = (fighter.inventory.items ?? []).filter((entry) => entry.id !== itemId);
  for (const slot of equipmentSlots) {
    if (fighter.equipment?.[slot.id] === itemId) fighter.equipment[slot.id] = null;
  }
  return item;
}

function spendMoney(money, cpAmount) {
  if (moneyToCp(money) < cpAmount) return false;
  addMoney(money, -cpAmount);
  return true;
}

function partyPurse() {
  state.chestMoney = normalizeMoney(state.chestMoney ?? {});
  return state.chestMoney;
}

function partyInventoryItems() {
  state.chest = Array.isArray(state.chest) ? state.chest : [];
  return state.chest;
}

function addItemToPartyInventory(item, prefix = "party") {
  if (!item) return [];
  const holder = { inventory: { items: partyInventoryItems(), money: {}, heroTokens: 0 } };
  const added = addItemToInventory(holder, item, prefix);
  state.chest = holder.inventory.items;
  return added;
}

function moveHeroCoinsToPartyPurse(heroes = rosterHeroes()) {
  const purse = partyPurse();
  let moved = 0;
  for (const hero of heroes ?? []) {
    if (!hero?.inventory?.money) continue;
    const amount = moneyToCp(hero.inventory.money);
    if (amount <= 0) continue;
    addMoney(purse, amount);
    hero.inventory.money = normalizeMoney();
    moved += amount;
  }
  return moved;
}

function travelEncounterLocksRetreat() {
  return Boolean(state?.travelReturnCamp?.lockRetreat || state?.customDungeon?.lockRetreat);
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
  const itemIndex = fighter?.inventory?.items?.findIndex((item) => item.id === itemId) ?? -1;
  if (itemIndex < 0) return null;
  const item = ensureItemCharges(normalizeItem(fighter.inventory.items[itemIndex]));
  fighter.inventory.items[itemIndex] = item;
  return item;
}

const attunementLimit = 3;

function itemRequiresAttunement(item) {
  return Boolean(item?.requiresAttunement ?? item?.attunementRequired ?? item?.magic?.requiresAttunement ?? false);
}

function itemBoundToOtherHero(fighter, item) {
  return Boolean(item?.boundHeroId && fighter?.id && item.boundHeroId !== fighter.id);
}

function itemBoundOwnerName(item) {
  return item?.boundHeroName ?? state?.fighters?.[item?.boundHeroId]?.name ?? "";
}

function factionSetInfo(item) {
  return item?.factionSet && item.factionSet.setId && item.factionSet.slotKey ? item.factionSet : null;
}

function attunedItemIds(fighter) {
  if (!fighter) return [];
  const source = Array.isArray(fighter.attunement?.itemIds)
    ? fighter.attunement.itemIds
    : Array.isArray(fighter.attunedItemIds)
      ? fighter.attunedItemIds
      : [];
  return uniqueValues(source.filter(Boolean));
}

function itemCanUseFreeSetAttunement(fighter, item, currentIds = attunedItemIds(fighter)) {
  const set = factionSetInfo(item);
  if (!fighter || !itemRequiresAttunement(item) || !set || !item?.id) return false;
  const ids = new Set((currentIds ?? []).filter((id) => id && id !== item.id));
  let sameSetCount = 0;
  for (const itemId of ids) {
    const other = itemForId(fighter, itemId);
    const otherSet = factionSetInfo(other);
    if (otherSet?.setId === set.setId) sameSetCount += 1;
  }
  return sameSetCount >= 3;
}

function normalizeAttunementIdsWithSetOverflow(fighter, itemIds = []) {
  const carriedIds = new Set((fighter.inventory?.items ?? []).map((item) => item.id).filter(Boolean));
  const carried = uniqueValues(itemIds.filter((itemId) => carriedIds.has(itemId)));
  const limited = carried.slice(0, attunementLimit);
  if (carried.length <= attunementLimit) return limited;

  for (const itemId of carried.slice(attunementLimit)) {
    const item = itemForId(fighter, itemId);
    if (itemCanUseFreeSetAttunement(fighter, item, carried)) return [...limited, itemId];
  }
  return limited;
}

function normalizeAttunementState(fighter) {
  if (!fighter) return [];
  const itemIds = normalizeAttunementIdsWithSetOverflow(fighter, attunedItemIds(fighter));
  fighter.attunement = { ...(fighter.attunement ?? {}), itemIds };
  delete fighter.attunedItemIds;
  return itemIds;
}

function fighterIsAttunedToItem(fighter, item) {
  if (!itemRequiresAttunement(item)) return true;
  return attunedItemIds(fighter).includes(item?.id);
}

function itemMagicActive(fighter, item) {
  return Boolean(item?.magic && fighterIsAttunedToItem(fighter, item));
}

function activeItemMagic(fighter, item) {
  return itemMagicActive(fighter, item) ? item.magic : null;
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
  if (!isPartyHeroId(fighter?.id) || !isClassHero(fighter)) return true;
  const proficiencies = new Set(proficiencyEntries(fighter.weaponProficiencies ?? []));
  const training = String(item.category ?? "").split(" ")[0];
  if (training && proficiencies.has(training)) return true;
  return weaponProficiencyAliases(item).some((entry) => proficiencies.has(entry));
}

function heroHasArmorProficiency(fighter, item) {
  if (item?.type !== "armor") return true;
  if (!isPartyHeroId(fighter?.id) || !isClassHero(fighter)) return true;
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
  return itemCanUseSlot(item, slotId) && !itemBoundToOtherHero(fighter, item) && armorStrengthRequirementMet(fighter, item) && heroHasArmorProficiency(fighter, item);
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
  normalizeAttunementState(fighter);
  const seen = new Set();
  return equipmentSlots
    .map((slot) => equippedItem(fighter, slot.id))
    .filter((item) => {
      if (!itemMagicActive(fighter, item) || seen.has(item.id)) return false;
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
    saveBonus: 0,
    skillBonus: 0,
    resistances: [],
    vulnerabilities: [],
    immunities: [],
    extraDamage: [],
  };

  for (const item of equippedMagicItems(fighter)) {
    const effects = item.magic?.effects ?? {};
    mergePassiveEffects(effects, item.magic);
  }

  for (const effects of factionSetBonusEffects(fighter)) {
    mergePassiveEffects(effects);
  }

  for (const { definition } of fighterFeatDefinitions(fighter)) {
    mergePassiveEffects(definition.effects ?? {});
  }

  function mergePassiveEffects(effects = {}, magic = {}) {
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
    if (effects.maxHpPerLevel) merged.maxHpBonus += (fighter?.level ?? 1) * effects.maxHpPerLevel;
    merged.initiativeBonus += effects.initiativeBonus ?? 0;
    merged.speedBonusFeet += effects.speedBonusFeet ?? 0;
    merged.saveBonus += effects.saveBonus ?? 0;
    merged.skillBonus += effects.skillBonus ?? 0;
    if (!magic || magicAcBonusApplies(fighter, { magic })) merged.acBonus += effects.acBonus ?? 0;
    if (magicAttackConditionApplies(fighter, effects.attackBonusCondition)) merged.attackBonus += effects.attackBonus ?? 0;
    if (magicAttackConditionApplies(fighter, effects.damageBonusCondition)) merged.damageBonus += effects.damageBonus ?? 0;
    merged.resistances.push(...(effects.resistances ?? []), ...(magic?.resistances ?? []));
    merged.vulnerabilities.push(...(effects.vulnerabilities ?? []), ...(magic?.vulnerabilities ?? []));
    merged.immunities.push(...(effects.immunities ?? []), ...(magic?.immunities ?? []));
    if (magicAttackConditionApplies(fighter, effects.extraDamageCondition)) merged.extraDamage.push(...(effects.extraDamage ?? []));
  }

  merged.resistances = Array.from(new Set(merged.resistances));
  merged.vulnerabilities = Array.from(new Set(merged.vulnerabilities));
  merged.immunities = Array.from(new Set(merged.immunities));
  return merged;
}

function factionSetBonusEffects(fighter) {
  return activeFactionSetBonuses(fighter).map((entry) => entry.effects).filter(Boolean);
}

function activeFactionSetBonuses(fighter) {
  normalizeAttunementState(fighter);
  const attunedIds = new Set(attunedItemIds(fighter));
  const activeItems = equipmentSlots
    .map((slot) => equippedItem(fighter, slot.id))
    .filter((item, index, items) => item && items.findIndex((entry) => entry?.id === item.id) === index)
    .filter((item) => attunedIds.has(item.id))
    .filter((item) => item && factionSetInfo(item));
  const bySet = new Map();
  for (const item of activeItems) {
    const set = factionSetInfo(item);
    if (!bySet.has(set.setId)) bySet.set(set.setId, []);
    bySet.get(set.setId).push(item);
  }
  const bonuses = [];
  for (const [setId, items] of bySet.entries()) {
    const definition = window.DungeonContent?.get?.("factionSets", setId);
    if (items.length < 4) continue;
    if (definition?.setBonus?.effects) {
      bonuses.push({
        setId,
        name: definition.name ?? setId,
        label: definition.setBonus.label ?? "Set Bonus",
        description: definition.setBonus.description ?? "",
        effects: definition.setBonus.effects,
      });
    }
  }
  return bonuses;
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
  const statusEffects = fighter?.statusEffects ?? [];
  const statusBonus = statusEffects.reduce((sum, effect) => sum + (effect.abilityScoreBonuses?.[ability] ?? 0) + (effect.abilityScorePenalties?.[ability] ?? 0), 0);
  const statusMinimum = statusEffects.reduce((minimum, effect) => Math.max(minimum, effect.abilityScoreMinimums?.[ability] ?? 0), 0);
  const statusCap = statusEffects.reduce((cap, effect) => Math.max(cap, effect.abilityScoreCaps?.[ability] ?? 0), 0);
  const primalChampion = fighter?.classId === "barbarian" && (fighter.level ?? 1) >= 20 && ["str", "con"].includes(ability) ? 4 : 0;
  const value = Math.max(statusMinimum, baseAbilityScore(fighter, ability) + primalChampion + (effects.abilityScoreBonuses[ability] ?? 0) + (effects.abilityScorePenalties[ability] ?? 0) + statusBonus);
  const cap = Math.max(effects.abilityScoreCaps[ability] ?? 0, statusCap);
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

function xpFloorForLevel(level) {
  const target = Math.max(1, Math.min(20, Math.floor(Number(level) || 1)));
  return target <= 1 ? 0 : xpForNextLevel(target - 1);
}

function canLevelUp(hero = state.fighters.hero) {
  return Boolean(hero && (isClassHero(hero) || isTrainedSidekick(hero)) && (hero.level ?? 1) < 20 && (hero.xp ?? 0) >= xpForNextLevel(hero.level ?? 1));
}

function warlockUsesCharismaForWeapon(fighter, weapon) {
  if (fighter?.classId !== "warlock" || !weapon?.damage) return false;
  if (fighter.subclassId === "hexblade" && (fighter.level ?? 1) >= 3) return true;
  if (fighter.pactBoon === "pactBlade" && (fighter.level ?? 1) >= 3 && !weaponIsRanged(weapon)) return true;
  return false;
}

function attackAbilityForWeapon(weapon, fighter = null) {
  if (!weapon) return "str";
  if (warlockUsesCharismaForWeapon(fighter, weapon)) return "cha";
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
  const sidekickAttackBonus = isSidekickWarrior(fighter) && (fighter.sidekickWarriorRole ?? "attacker") === "attacker" ? 2 : 0;
  const sidekickProficiencyBonus = isTrainedSidekick(fighter) && !isRangerBeastCompanion(fighter) ? Math.max(0, proficiencyBonus(fighter) - 2) : 0;
  if (isWildShaped(fighter)) return (fighter.attackBonus ?? 0) + statusBonus;
  const unarmed = !weapon?.damage;
  const attackAbility = isRangerBeastCompanion(fighter) ? fighter.companionAttackAbility ?? "str" : unarmed ? attackAbilityForUnarmed(fighter) : attackAbilityForWeapon(weapon, fighter);
  const ability = abilityMod(fighter, attackAbility);
  const weaponMagic = activeItemMagic(fighter, weapon);
  const magicBonus = (weaponMagic?.attackBonus ?? 0) + magicEffects(fighter).attackBonus + statusBonus + sidekickAttackBonus + sidekickProficiencyBonus;
  const styleBonus = fighterHasStyle(fighter, "archery") && weaponIsRanged(weapon) ? 2 : 0;
  if (isRangerBeastCompanion(fighter)) {
    return ability + rangerCompanionProficiencyBonus(fighter) + magicBonus + styleBonus;
  }
  if (isPartyHeroId(fighter?.id) && isClassHero(fighter) && unarmed) {
    return ability + proficiencyBonus(fighter) + magicBonus + styleBonus;
  }
  if (isPartyHeroId(fighter?.id) && isClassHero(fighter) && weapon?.type === "weapon") {
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

function monsterMultiattackConfig(fighter) {
  if (!fighter || isPartyHeroId(fighter.id)) return null;
  const entry = fighter.multiattack;
  if (!entry) return null;
  const attacks = Math.max(1, Math.min(4, Math.floor(Number(typeof entry === "number" ? entry : entry.attacks) || 1)));
  if (attacks <= 1) return null;
  const defaultDamageMultiplier = attacks >= 4 ? 0.35 : attacks >= 3 ? 0.45 : 0.6;
  return {
    attacks,
    damageMultiplier: Math.max(0.2, Math.min(1, Number(entry.damageMultiplier ?? entry.damageScale ?? defaultDamageMultiplier) || defaultDamageMultiplier)),
    switchTargets: entry.switchTargets !== false,
  };
}

function scaledMonsterMultiattackDamage(fighter, damage) {
  const config = monsterMultiattackConfig(fighter);
  if (!config) return damage;
  const scale = (value) => Math.max(0, Math.floor((Number(value) || 0) * config.damageMultiplier));
  const scaled = {
    ...damage,
    flat: damage.flat ? Math.max(1, scale(damage.flat)) : damage.flat,
    count: damage.count ? Math.max(1, scale(damage.count)) : (damage.count ?? 0),
    sides: damage.sides ?? 0,
    bonus: scale(damage.bonus ?? 0),
    extraDamage: (damage.extraDamage ?? []).map((extra) => ({
      ...extra,
      count: Math.max(1, Math.floor((extra.count ?? 1) * config.damageMultiplier)),
      bonus: scale(extra.bonus ?? 0),
    })),
  };
  scaled.label = formatDamage(scaled);
  return scaled;
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
  const specialNames = (target?.specialAbility ?? []).map((name) => String(name));
  const targetHasSpecial =
    typeof hasMonsterSpecial === "function"
      ? (pattern) => hasMonsterSpecial(target, pattern)
      : (pattern) => specialNames.some((name) => pattern.test(name));
  if (targetHasSpecial(/ancient photosynthesis/i) && normalizedType === "fire" && damage > 0) {
    target.usedSpecials = target.usedSpecials ?? {};
    target.usedSpecials.AncientPhotosynthesisSuppressedRound = state?.round ?? 0;
  }
  if (targetHasSpecial(/lightning feed/i) && normalizedType === "lightning" && damage > 0) {
    let healed = 0;
    if (typeof applyHealingToHero === "function") {
      healed = applyHealingToHero(target, damage);
    } else {
      const before = target.hp ?? 0;
      target.hp = Math.min(target.maxHp ?? before, before + damage);
      healed = Math.max(0, target.hp - before);
    }
    if (typeof addLog === "function") {
      addLog(
        healed > 0
          ? `${target.name}'s Lightning Feed turns the lightning into ${healed} HP.`
          : `${target.name}'s Lightning Feed absorbs the lightning, but it is already at full health.`,
        "heal",
      );
    }
    return { damage: 0, reason: null };
  }
  if (targetHasSpecial(/storm shell/i) && ["lightning", "thunder"].includes(normalizedType) && damage > 0) {
    target.usedSpecials = target.usedSpecials ?? {};
    const roundKey = `StormShellFeed-${state?.round ?? 0}`;
    if (!target.usedSpecials[roundKey]) {
      target.usedSpecials[roundKey] = true;
      const amount = Math.max(1, Math.floor(damage / 2));
      const healed = typeof applyHealingToHero === "function" ? applyHealingToHero(target, amount) : 0;
      if (healed > 0 && typeof addLog === "function") {
        addLog(`${target.name}'s Storm Shell drinks in the ${normalizedType} and restores ${healed} HP.`, "heal");
      } else if (typeof applyStatusEffect === "function") {
        applyStatusEffect(target, { id: `storm-shell-${state?.round ?? 0}`, label: "Storm-Empowered", attackBonus: 1, expiresAtEndOfTurn: true });
        if (typeof addLog === "function") addLog(`${target.name}'s Storm Shell turns the ${normalizedType} into a brief attack surge.`, "important");
      }
    }
  }
  const effects = magicEffects(target);
  const statusResistances = (target.statusEffects ?? []).flatMap((effect) => effect.resistances ?? []);
  const statusVulnerabilities = (target.statusEffects ?? []).flatMap((effect) => effect.vulnerabilities ?? []);
  const statusImmunities = (target.statusEffects ?? []).flatMap((effect) => effect.immunities ?? effect.damageImmunities ?? []);
  const resistances = [...(target.damageResistances ?? []), ...effects.resistances, ...statusResistances];
  const vulnerabilities = [...(target.damageVulnerabilities ?? []), ...effects.vulnerabilities, ...statusVulnerabilities];
  const immunities = [...(target.damageImmunities ?? []), ...effects.immunities, ...statusImmunities];
  if ((target.statusEffects ?? []).some((effect) => effect.id === "rage") && ["bludgeoning", "piercing", "slashing"].includes(normalizedType)) {
    resistances.push(normalizedType);
  }
  if ((target.statusEffects ?? []).some((effect) => effect.id === "rage") && target.subclassId === "totem-warrior" && (target.knownTotems ?? []).includes("totemBear") && normalizedType !== "psychic") {
    resistances.push(normalizedType);
  }
  if (target.subclassId === "storm-herald" && (target.level ?? 1) >= 6) {
    const aura = (target.knownStormAuras ?? [])[0];
    if (aura === "stormAuraDesert" && normalizedType === "fire") resistances.push(normalizedType);
    if (aura === "stormAuraSea" && normalizedType === "lightning") resistances.push(normalizedType);
    if (aura === "stormAuraTundra" && normalizedType === "cold") resistances.push(normalizedType);
  }
  if (target.subclassId === "psi-warrior" && (target.level ?? 1) >= 10 && normalizedType === "psychic") {
    resistances.push(normalizedType);
  }

  if (damageFlagMatches(immunities, normalizedType)) {
    return { damage: 0, reason: "immune" };
  }

  const vulnerable = damageFlagMatches(vulnerabilities, normalizedType);
  const elementalAdeptBypass = damageFlagMatches(target?.incomingElementalAdeptTypes, normalizedType);
  const resistant = !elementalAdeptBypass && damageFlagMatches(resistances, normalizedType);
  if (vulnerable && resistant) return { damage, reason: "resistance and vulnerability cancel" };
  let adjustedDamage = damage;
  let reason = null;
  if (vulnerable) {
    adjustedDamage *= 2;
    reason = "vulnerable";
  } else if (resistant) {
    adjustedDamage = Math.floor(adjustedDamage / 2);
    reason = "resistant";
  }
  if (fighterHasFeat(target, "heavy-armor-master") && fighterWearsHeavyArmor(target) && ["bludgeoning", "piercing", "slashing"].includes(normalizedType)) {
    adjustedDamage = Math.max(0, adjustedDamage - 3);
    reason = reason ? `${reason}; Heavy Armor Master -3` : "Heavy Armor Master -3";
  }
  if (elementalAdeptBypass && damageFlagMatches(resistances, normalizedType)) reason = reason ? `${reason}; Elemental Adept bypasses resistance` : "Elemental Adept bypasses resistance";
  if (adjustedDamage !== damage || reason) return { damage: adjustedDamage, reason };

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
  const weaponMagic = activeItemMagic(fighter, weapon);
  const includeDamageModifier = options.includeDamageModifier !== false;
  const statusDamageBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.damageBonus ?? 0), 0);
  if (isWildShaped(fighter)) {
    const damage = {
      ...(fighter.baseDamage ?? wildShapeDamageProfile(wildShapeBeastById(fighter.wildShapeState?.beastFormId))),
      bonus: (fighter.baseDamage?.bonus ?? 0) + statusDamageBonus,
    };
    return { ...damage, label: formatDamage(damage) };
  }
  if (!options.forceThrown && (!isPartyHeroId(fighter?.id) || !isClassHero(fighter)) && weapon?.properties?.includes("thrown") && weapon.range?.kind === "thrown" && !monsterCanThrowWeapon(fighter, weapon)) {
    return {
      ...weapon.damage,
      bonus: (includeDamageModifier ? abilityMod(fighter, "str") : 0) + (weaponMagic?.damageBonus ?? 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
      range: { kind: "melee", feet: 5 },
      extraDamage: [...(weaponMagic?.extraDamage ?? []), ...magicEffects(fighter).extraDamage],
      label: formatDamage({
        ...weapon.damage,
        bonus: (includeDamageModifier ? abilityMod(fighter, "str") : 0) + (weaponMagic?.damageBonus ?? 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
      }),
    };
  }
  if (!weapon?.damage) {
    if ((!isPartyHeroId(fighter?.id) || !isClassHero(fighter)) && (fighter.baseDamage?.count || fighter.baseDamage?.flat)) {
      if (isRangerBeastCompanion(fighter)) {
        const attackAbility = fighter.companionAttackAbility ?? "str";
        const damage = {
          flat: fighter.baseDamage.flat,
          count: fighter.baseDamage.count ?? 0,
          sides: fighter.baseDamage.sides ?? 0,
          bonus: (includeDamageModifier ? abilityMod(fighter, attackAbility) + rangerCompanionProficiencyBonus(fighter) : 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
          type: fighter.baseDamage.type,
          range: fighter.baseDamage.range ?? { kind: "melee", feet: 5 },
          weaponName: fighter.baseDamage.weaponName,
          extraDamage: magicEffects(fighter).extraDamage,
        };
        return scaledMonsterMultiattackDamage(fighter, { ...damage, label: formatDamage(damage) });
      }
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
      return scaledMonsterMultiattackDamage(fighter, { ...damage, label: formatDamage(damage) });
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
    bonus: bonus + duelingBonus + greatWeaponBonus + (weaponMagic?.damageBonus ?? 0) + magicEffects(fighter).damageBonus + statusDamageBonus,
    type: weapon.damage.type,
    range: weapon.range ?? { kind: "melee", feet: 5 },
    extraDamage: [...(weaponMagic?.extraDamage ?? []), ...magicEffects(fighter).extraDamage],
  };
  return { ...damage, label: formatDamage(damage) };
}

function opportunityAttackProfile(fighter) {
  const weapon = activeMeleeWeapon(fighter);
  if (weapon) {
    const profile = damageProfile({ ...fighter, equipment: { ...fighter.equipment, mainHand: weapon.id, offHand: fighter.equipment?.offHand } });
    const meleeReachFeet = weapon.properties?.includes("reach") ? 10 : 5;
    return {
      ...profile,
      range: { kind: "melee", feet: profile.range?.kind === "melee" ? (profile.range.feet ?? meleeReachFeet) : meleeReachFeet },
      attackAbility: attackAbilityForWeapon(weapon, fighter),
      weaponName: weapon.name,
      weapon,
    };
  }

  const baseRange = fighter.baseDamage?.range ?? { kind: "melee", feet: 5 };
  if (!activeWeapon(fighter) && baseRange.kind !== "ranged" && (fighter.baseDamage?.count || fighter.baseDamage?.flat)) {
    if (isRangerBeastCompanion(fighter)) {
      const attackAbility = fighter.companionAttackAbility ?? "str";
      const damage = {
        flat: fighter.baseDamage.flat,
        count: fighter.baseDamage.count ?? 0,
        sides: fighter.baseDamage.sides ?? 0,
        bonus: abilityMod(fighter, attackAbility) + rangerCompanionProficiencyBonus(fighter),
        type: fighter.baseDamage.type,
        range: baseRange,
      };
      return { ...scaledMonsterMultiattackDamage(fighter, { ...damage, label: formatDamage(damage) }), attackAbility, weaponName: fighter.baseDamage.weaponName ?? "Natural weapon" };
    }
    const damage = {
      flat: fighter.baseDamage.flat,
      count: fighter.baseDamage.count ?? 0,
      sides: fighter.baseDamage.sides ?? 0,
      bonus: fighter.baseDamage.bonus ?? 0,
      type: fighter.baseDamage.type,
      range: baseRange,
    };
    return { ...scaledMonsterMultiattackDamage(fighter, { ...damage, label: formatDamage(damage) }), attackAbility: "str", weaponName: fighter.baseDamage.weaponName ?? "Melee Attack" };
  }

  return unarmedDamageProfile(fighter);
}

function barbarianBeastForm(fighter) {
  const effect = (fighter?.statusEffects ?? []).find((entry) => String(entry.id ?? "").startsWith("beast-form-"));
  return effect ? String(effect.id).replace("beast-form-", "") : "";
}

function barbarianBeastClawUsable(fighter) {
  const main = equippedItem(fighter, "mainHand");
  const offHand = equippedItem(fighter, "offHand");
  if (!main && !offHand) return true;
  if (!offHand && !main?.properties?.includes("two-handed")) return true;
  return false;
}

function barbarianBeastNaturalWeapon(fighter, form = barbarianBeastForm(fighter)) {
  if (!form) return null;
  const common = {
    type: "weapon",
    category: "simple",
    weaponRange: "melee",
    properties: [],
  };
  if (form === "bite") {
    return {
      ...common,
      id: "beast-bite",
      name: "Bestial Bite",
      damage: { count: 1, sides: 8, bonus: abilityMod(fighter, "str"), type: "piercing" },
      range: { kind: "melee", feet: 5 },
    };
  }
  if (form === "claws") {
    return {
      ...common,
      id: "beast-claws",
      name: "Bestial Claws",
      damage: { count: 1, sides: 6, bonus: abilityMod(fighter, "str"), type: "slashing" },
      range: { kind: "melee", feet: 5 },
    };
  }
  if (form === "tail") {
    return {
      ...common,
      id: "beast-tail",
      name: "Bestial Tail",
      properties: ["reach"],
      damage: { count: 1, sides: 8, bonus: abilityMod(fighter, "str"), type: "piercing" },
      range: { kind: "melee", feet: 10 },
    };
  }
  return null;
}

function attackWeaponChoicesForFighter(fighter) {
  const choices = [];
  const weapon = activeWeapon(fighter);
  choices.push({
    id: weapon?.id ? `weapon:${weapon.id}` : "unarmed",
    label: weapon?.name ?? "Unarmed Strike",
    description: damageProfile(fighter, { weapon }).label,
    options: { weapon },
  });
  const form = barbarianBeastForm(fighter);
  const naturalWeapon = barbarianBeastNaturalWeapon(fighter, form);
  if (naturalWeapon && (form !== "claws" || barbarianBeastClawUsable(fighter))) {
    const formDescriptions = {
      bite: "1d8 piercing. Heals proficiency bonus once per turn if you are below half HP and damage with the bite.",
      claws: "1d6 slashing. Once per turn, attacking with claws grants one additional claw attack as part of the Attack action.",
      tail: "1d8 piercing with 10 ft reach. Also unlocks the Tail reaction AC swipe while raging.",
    };
    choices.push({
      id: `beast:${form}`,
      label: naturalWeapon.name,
      description: formDescriptions[form] ?? damageProfile(fighter, { weapon: naturalWeapon }).label,
      options: {
        weapon: naturalWeapon,
        beastFormAttack: form,
        actionLabel: form === "bite" ? "bites" : form === "tail" ? "lashes with their tail" : "slashes with claws",
      },
    });
  }
  return choices;
}

function armorClass(fighter) {
  const sidekickDefenseBonus = isSidekickWarrior(fighter) && (fighter.level ?? 1) >= 10 ? 1 : 0;
  if (isWildShaped(fighter)) {
    const statusAc = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.acBonus ?? 0), 0);
    return (fighter.baseAc ?? fighter.ac ?? 10) + statusAc + sidekickDefenseBonus;
  }
  if (isRangerBeastCompanion(fighter)) {
    const magicAc = magicEffects(fighter).acBonus;
    const statusAc = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.acBonus ?? 0), 0);
    return (fighter.baseAc ?? fighter.ac ?? 10) + rangerCompanionProficiencyBonus(fighter) + magicAc + statusAc + sidekickDefenseBonus;
  }
  const torso = equippedItem(fighter, "torso");
  const armor = armorStrengthRequirementMet(fighter, torso) && heroHasArmorProficiency(fighter, torso) ? activeArmorData(fighter, torso) : null;
  const shield = equippedItem(fighter, "offHand");
  const shieldBonus = heroHasArmorProficiency(fighter, shield) ? activeArmorData(fighter, shield)?.bonus ?? 0 : 0;
  const magicAc = magicEffects(fighter).acBonus;
  const statusAc = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.acBonus ?? 0), 0);
  const styleAc = fighterHasStyle(fighter, "defense") && Boolean(torso?.armor?.base) ? 1 : 0;
  const dualWielderAc =
    fighterHasFeat(fighter, "dual-wielder") &&
    [equippedItem(fighter, "mainHand"), equippedItem(fighter, "offHand")].every((item) => item?.damage && !weaponIsRanged(item))
      ? 1
      : 0;
  const wearingArmor = Boolean(torso?.armor?.base);
  if (!wearingArmor && fighter?.classId === "monk" && !shield?.armor?.bonus) {
    return 10 + abilityMod(fighter, "dex") + abilityMod(fighter, "wis") + magicAc + statusAc + styleAc + dualWielderAc + sidekickDefenseBonus;
  }
  if (!wearingArmor && fighter?.classId === "barbarian") {
    return 10 + abilityMod(fighter, "dex") + abilityMod(fighter, "con") + shieldBonus + magicAc + statusAc + styleAc + dualWielderAc + sidekickDefenseBonus;
  }
  if (!armor?.base) return (fighter.baseAc ?? 10) + abilityMod(fighter, "dex") + shieldBonus + magicAc + statusAc + styleAc + dualWielderAc + sidekickDefenseBonus;

  const dex = abilityMod(fighter, "dex");
  const mediumArmorCap = fighterHasFeat(fighter, "medium-armor-master") ? 3 : 2;
  const dexBonus = armor.dex === "full" ? dex : armor.dex === "max2" ? Math.min(mediumArmorCap, dex) : 0;
  return armor.base + dexBonus + shieldBonus + magicAc + statusAc + styleAc + dualWielderAc + sidekickDefenseBonus;
}

function activeArmorData(fighter, item) {
  if (!item?.armor) return null;
  const inactiveAttunementBonus = fighterIsAttunedToItem(fighter, item) ? 0 : item.magic?.acBonusAppliedToArmor ?? 0;
  if (!inactiveAttunementBonus) return item.armor;
  return {
    ...item.armor,
    base: item.armor.base != null ? Math.max(0, item.armor.base - inactiveAttunementBonus) : item.armor.base,
    bonus: item.armor.bonus != null ? Math.max(0, item.armor.bonus - inactiveAttunementBonus) : item.armor.bonus,
  };
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
  if (ammo.ammo.quantity <= 0) {
    fighter.inventory.items = (fighter.inventory.items ?? []).filter((entry) => entry.id !== ammo.id);
    if (fighter.equipment?.quiver === ammo.id) fighter.equipment.quiver = null;
  } else {
    updateAmmoStackName(ammo);
  }
  return true;
}

function hostileFightersAdjacentTo(fighter) {
  return Object.values(state.fighters).filter((candidate) => {
    if (!candidate.alive || candidate.id === fighter.id) return false;
    return hostileTo(fighter, candidate) && hasMeleeAccess(fighter, candidate);
  });
}

function classMovementSpeedBonus(fighter) {
  if (!isPartyHeroId(fighter?.id) || !isClassHero(fighter) || isWildShaped(fighter)) return 0;
  const level = fighter.level ?? 1;
  const armor = equippedItem(fighter, "torso");
  const shield = equippedItem(fighter, "offHand");
  if (fighter.classId === "barbarian" && level >= 5 && armor?.category !== "heavy") return 10;
  if (fighter.classId === "monk" && level >= 2 && !armor && shield?.type !== "armor") {
    return level >= 18 ? 30 : level >= 14 ? 25 : level >= 10 ? 20 : level >= 6 ? 15 : 10;
  }
  return 0;
}

function refreshDerivedStats(fighter) {
  if (!fighter) return fighter;
  fighter.baseMaxHp = fighter.baseMaxHp ?? fighter.maxHp ?? 1;
  if (fighter?.classId && isClassHero(fighter)) normalizeHeroRacialSenses(fighter);
  fighter.statusEffects = normalizeStatusEffectsForFighter(fighter);
  normalizeAttunementState(fighter);
  syncRangerBeastCompanionStats(fighter);
  const effects = magicEffects(fighter);
  const statusSpeedBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.speedBonusFeet ?? 0), 0);
  const statusSpeedOverride = (fighter.statusEffects ?? []).reduce((speed, effect) => Math.max(speed, effect.speedOverrideFeet ?? 0), 0);
  const statusSpeedMultiplier = (fighter.statusEffects ?? []).reduce((multiplier, effect) => {
    if (effect.speedMultiplier != null) return multiplier * Math.max(0, Number(effect.speedMultiplier) || 0);
    if (effect.speedPenaltyPercent != null) return multiplier * Math.max(0, 1 - (Number(effect.speedPenaltyPercent) || 0) / 100);
    return multiplier;
  }, 1);
  const statusMaxHpBonus = (fighter.statusEffects ?? []).reduce((sum, effect) => sum + (effect.maxHpBonus ?? 0), 0);
  const statusMaxHpMultiplier = (fighter.statusEffects ?? []).reduce((multiplier, effect) => {
    if (effect.maxHpMultiplier != null) return multiplier * Math.max(0, Number(effect.maxHpMultiplier) || 0);
    if (effect.maxHpPenaltyPercent != null) return multiplier * Math.max(0, 1 - (Number(effect.maxHpPenaltyPercent) || 0) / 100);
    return multiplier;
  }, 1);
  const rawMaxHp = isWildShaped(fighter) ? fighter.baseMaxHp + statusMaxHpBonus : fighter.baseMaxHp + (effects.maxHpBonus ?? 0) + statusMaxHpBonus;
  fighter.maxHp = Math.max(1, Math.floor(rawMaxHp * statusMaxHpMultiplier));
  if (fighter.hp > fighter.maxHp) fighter.hp = fighter.maxHp;
  const baseDerivedSpeedFeet = isWildShaped(fighter)
    ? Math.max(5, (fighter.baseSpeedFeet ?? fighter.speedFeet ?? 30) + statusSpeedBonus)
    : Math.max(5, (fighter.baseSpeedFeet ?? fighter.speedFeet ?? 30) + (effects.speedBonusFeet ?? 0) + classMovementSpeedBonus(fighter) + statusSpeedBonus);
  const derivedSpeedFeet = Math.max(0, Math.floor(baseDerivedSpeedFeet * statusSpeedMultiplier));
  fighter.speedFeet = statusSpeedOverride ? Math.max(derivedSpeedFeet, statusSpeedOverride) : derivedSpeedFeet;
  if (fighter.abilityScores) {
    fighter.abilityMods = abilityModsFromScores(fighter.abilityScores);
  }
  refreshPushDragLiftStats(fighter);
  if (isPartyHeroId(fighter.id) && isClassHero(fighter)) {
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
    feats: fighterFeatEntries(template),
    multiattack: typeof template.multiattack === "number" ? template.multiattack : template.multiattack ? { ...template.multiattack } : undefined,
    extraResourcePoolUses: { ...(template.extraResourcePoolUses ?? {}) },
    partyRole: template.partyRole ?? (template.id === "hero" ? "tank" : undefined),
    position: { ...template.position },
    sizeSquares: Math.max(1, Math.floor(Number(template.sizeSquares ?? template.spaceSquares ?? 1) || 1)),
    footprintWidth: template.footprintWidth ? Math.max(1, Math.floor(Number(template.footprintWidth) || 1)) : undefined,
    footprintHeight: template.footprintHeight ? Math.max(1, Math.floor(Number(template.footprintHeight) || 1)) : undefined,
    hp: template.maxHp,
    alive: true,
    movementLeft: Math.floor((template.baseSpeedFeet ?? template.speedFeet) / feetPerSquare),
    hasAction: true,
    hasBonusAction: true,
    hasReaction: true,
    dodging: false,
    disengaged: false,
    canMoveThroughMonsters: false,
    flying: Boolean(template.flying),
  };
  if (combatant.baseAttackAbilityMod === undefined) {
    combatant.baseAttackAbilityMod = scoreToMod(baseAbilityScore(combatant, attackAbilityForWeapon(activeWeapon(combatant), combatant)));
  }
  if (isClassHero(combatant)) ensureStarterHeroEquipment(combatant);
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

function spawnCandidateFitsFootprint(room, position, blockedKeys = new Set(), gridSize = currentGridSize(), floorKeys = null, footprintSource = null, includeDoors = false) {
  const doorKeys = roomDoorKeys(room);
  return window.DungeonGrid.fighterCells(footprintSource ?? {}, position).every((cell) => {
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

function roomSpawnCells(room, blockedKeys = new Set(), gridSize = currentGridSize(), floorKeys = null, footprintSource = null) {
  const interiorCells = openRoomCellsForSpawn(room, blockedKeys, gridSize, false, floorKeys)
    .filter((cell) => spawnCandidateFitsFootprint(room, cell, blockedKeys, gridSize, floorKeys, footprintSource, false));
  return interiorCells.length
    ? interiorCells
    : openRoomCellsForSpawn(room, blockedKeys, gridSize, true, floorKeys)
      .filter((cell) => spawnCandidateFitsFootprint(room, cell, blockedKeys, gridSize, floorKeys, footprintSource, true));
}

function clusteredSpawnCells(room, count, origin, blockedKeys = new Set(), gridSize = currentGridSize(), floorKeys = null, footprintSource = null) {
  const openCells = roomSpawnCells(room, blockedKeys, gridSize, floorKeys, footprintSource);
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

function safeRoomSpawnCell(room, origin, blockedKeys = new Set(), gridSize = currentGridSize(), floorKeys = null, footprintSource = null) {
  return clusteredSpawnCells(room, 1, origin, blockedKeys, gridSize, floorKeys, footprintSource)[0] ?? null;
}

function createMonsterForRoom(monsterTemplate, room, position, id, name, hero) {
  const monster = createCombatant({
    ...monsterTemplate,
    baseMonsterId: monsterTemplate.id,
    templateId: monsterTemplate.id,
    id,
    name,
  });
  normalizeCreatureSenses(monster);
  applyMonsterCategoryScaling(monster, hero);
  monster.roomId = room.id;
  monster.position = { ...position };
  return monster;
}

function dungeonEncounterRooms(dungeon, bossRoomId = "", encounterTarget = null) {
  const rooms = dungeon.rooms ?? [];
  const candidates = rooms.filter((room) => room.id !== dungeon.entranceRoomId && room.id !== bossRoomId);
  if (Number.isFinite(encounterTarget)) {
    const target = Math.max(0, Math.min(candidates.length, Math.floor(Number(encounterTarget) || 0)));
    return new Set(shuffledCopy(candidates).slice(0, target).map((room) => room.id));
  }
  return new Set(
    candidates
      .filter(() => Math.random() < roomMonsterSpawnTuning.roomSpawnChance)
      .map((room) => room.id),
  );
}

function createDungeonMonsters(dungeon, heroPosition, hero, exitRoomId = "", dungeonObjects = [], themeId = currentThemeId(), encounterTarget = null) {
  const monsters = {};
  const rooms = dungeon.rooms;
  const bossMonsterId = heroNeedsDungeonBoss(hero) ? bossMonsterIdForHero(hero, themeId) : null;
  const bossRoomId = bossMonsterId ? exitRoomId || createDungeonExit(dungeon, heroPosition).roomId : null;
  const encounterRoomIds = dungeonEncounterRooms(dungeon, bossRoomId, encounterTarget);
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
    if (!encounterRoomIds.has(room.id)) continue;
    const monsterId = pickWeightedMonsterId(monsterEntries, usedMonsterCounts, monsterEntries[0]?.id);
    const monsterTemplate = getMonsterTemplate(monsterId);
    if (!monsterTemplate) continue;
    const spawnCount = roomMonsterSpawnCount(monsterTemplate, hero);
    const roomTemplates = roomMonsterComposition(monsterTemplate, spawnCount, monsterEntries, usedMonsterCounts);
    const roomTemplateCounts = {};
    for (let spawnIndex = 0; spawnIndex < roomTemplates.length; spawnIndex += 1) {
      const template = roomTemplates[spawnIndex] ?? monsterTemplate;
      const position = safeRoomSpawnCell(room, heroPosition, objectBlockedKeys, dungeon.gridSize, floorKeys, template);
      if (!position) continue;
      roomTemplateCounts[template.id] = (roomTemplateCounts[template.id] ?? 0) + 1;
      usedMonsterCounts[template.id] = (usedMonsterCounts[template.id] ?? 0) + 1;
      const duplicateInRoom = roomTemplates.filter((entry) => entry.id === template.id).length > 1;
      const suffix = duplicateInRoom ? ` ${roomTemplateCounts[template.id]}` : "";
      const monster = createMonsterForRoom(template, room, position, `monster-${room.id}-${spawnIndex + 1}`, `${template.name}${suffix}`, hero);
      monsters[monster.id] = monster;
      window.DungeonGrid.fighterCells(monster).forEach((cell) => objectBlockedKeys.add(positionKey(cell)));
    }
  }

  if (bossMonsterId && bossRoomId) {
    const bossTemplate = getMonsterTemplate(bossMonsterId);
    const bossRoom = rooms.find((room) => room.id === bossRoomId);
    if (bossTemplate && bossRoom) {
      const boss = createCombatant({
        ...bossTemplate,
        baseMonsterId: bossTemplate.id,
        templateId: bossTemplate.id,
        id: `boss-${bossRoom.id}`,
        name: bossTemplate.name,
      });
      applyMonsterCategoryScaling(boss, hero);
      boss.roomId = bossRoom.id;
      boss.position = safeRoomSpawnCell(bossRoom, heroPosition, objectBlockedKeys, dungeon.gridSize, floorKeys, boss);
      if (boss.position) {
        monsters[boss.id] = boss;
        window.DungeonGrid.fighterCells(boss).forEach((cell) => objectBlockedKeys.add(positionKey(cell)));
      }
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
    .forEach((fighter) => window.DungeonGrid.fighterCells(fighter).forEach((cell) => blockedKeys.add(positionKey(cell))));

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
    const legalKeys = new Set(roomSpawnCells(room, blockedKeys, dungeon.gridSize, floorKeys, fighter).map(positionKey));
    if (legalKeys.has(currentKey)) {
      fighter.roomId = room.id;
      window.DungeonGrid.fighterCells(fighter).forEach((cell) => blockedKeys.add(positionKey(cell)));
      continue;
    }

    const replacement = safeRoomSpawnCell(room, gameState.fighters.hero?.position ?? fighter.position, blockedKeys, dungeon.gridSize, floorKeys, fighter);
    if (!replacement) {
      delete gameState.fighters[fighter.id];
      continue;
    }
    fighter.position = { ...replacement };
    fighter.roomId = room.id;
    window.DungeonGrid.fighterCells(fighter).forEach((cell) => blockedKeys.add(positionKey(cell)));
  }
}

function aliveFighters() {
  return Object.values(state.fighters).filter((fighter) => fighter.alive);
}

function aliveMonsters() {
  const heroIds = new Set([...(state.party?.heroIds ?? ["hero"]), ...(state.party?.rosterIds ?? [])]);
  return Object.values(state.fighters).filter((fighter) => !heroIds.has(fighter.id) && fighter.alive && fighter.team !== "heroes" && !fighter.friendly);
}

function pushDragLiftMultiplier(fighter) {
  return fighter?.racialTraits?.powerfulBuild ? 2 : 1;
}

function refreshPushDragLiftStats(fighter) {
  const strength = Math.max(1, Math.floor(abilityScore(fighter, "str") || 10));
  const multiplier = pushDragLiftMultiplier(fighter);
  fighter.pushDragLiftAutoLb = strength * 15 * multiplier;
  fighter.pushDragLiftLb = strength * 30 * multiplier;
  fighter.pushDragLiftMaxAttemptLb = strength * 40 * multiplier;
  return fighter.pushDragLiftLb;
}

function activeFighter() {
  const entry = state.initiative[state.activeIndex];
  return entry ? state.fighters[entry.fighterId] : null;
}

function syncActiveHeroToTurn() {
  const fighter = activeFighter();
  if (!isPlayerControlledPartyFighter(fighter)) return false;
  state.party.activeHeroId = fighter.id;
  selectedHeroIds = new Set([fighter.id]);
  return true;
}

function normalizeLoadedState(loadedState) {
  const freshState = createInitialState();
  dungeonClockRuntimePaused = Boolean(loadedState.dungeonClock?.paused);
  const loadedMode = loadedState.mode ?? (loadedState.dungeon?.id === "home" || loadedState.room?.id === "home" ? "home" : loadedState.combatStarted ? "combat" : "exploration");
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
    mode: loadedMode,
    fighters: loadedFighters,
    dungeon: ensureCorridorPassages(loadedState.dungeon ?? freshState.dungeon),
    party: {
      activeHeroId: loadedState.party?.activeHeroId ?? "hero",
      heroIds: Array.isArray(loadedState.party?.heroIds) && loadedState.party.heroIds.length ? loadedState.party.heroIds : ["hero"],
      maxActiveHeroSlots: activeClassHeroLimit(loadedState),
      rosterIds:
        Array.isArray(loadedState.party?.rosterIds) && loadedState.party.rosterIds.length
          ? loadedState.party.rosterIds
          : Array.isArray(loadedState.party?.heroIds) && loadedState.party.heroIds.length
            ? loadedState.party.heroIds
            : ["hero"],
      travelRationsInitialized: Boolean(loadedState.party?.travelRationsInitialized),
    },
    exploration: {
      ...freshState.exploration,
      ...loadedState.exploration,
    },
    exit: loadedState.exit ?? freshState.exit,
    completed: Boolean(loadedState.completed),
    d20Mode: normalizeD20Mode(loadedState.d20Mode ?? freshState.d20Mode),
    d20FailureStreak: Math.max(0, Math.floor(loadedState.d20FailureStreak ?? freshState.d20FailureStreak ?? 0)),
    saveRollMode: normalizeSaveRollMode(loadedState.saveRollMode ?? freshState.saveRollMode ?? "manual"),
    worldDay: normalizeWorldDay(loadedState.worldDay ?? freshState.worldDay),
    shortRestsUsed: loadedState.shortRestsUsed ?? (loadedState.shortRestUsed ? 1 : 0),
    shortRestLimit: loadedState.shortRestLimit ?? shortRestLimitForTheme(null, 3),
    dungeonClock: createDungeonClock({ ...loadedState.dungeonClock, lastRealMs: Date.now() }),
    grabbedEntity: loadedState.grabbedEntity ?? null,
    chest: Array.isArray(loadedState.chest) ? loadedState.chest.map(normalizeItem) : [],
    chestMoney: normalizeMoney(loadedState.chestMoney ?? {}),
    home: normalizeHomeData(loadedState.home ?? freshState.home),
    monsterCompendium: normalizeMonsterCompendium(loadedState.monsterCompendium ?? freshState.monsterCompendium),
    campaignProgress: cloneData(loadedState.campaignProgress ?? freshState.campaignProgress ?? {}),
    questFlags: cloneData(loadedState.questFlags ?? freshState.questFlags ?? {}),
    partyResources: normalizePartyResources(loadedState.partyResources ?? freshState.partyResources ?? {}),
    partyTomes: loadedMode === "home" ? permanentPartyTomes(loadedState.partyTomes ?? freshState.partyTomes ?? []) : normalizePartyTomes(loadedState.partyTomes ?? freshState.partyTomes ?? []),
    world: window.DepthboundWorldTravel?.normalizeWorldState?.(loadedState.world ?? freshState.world) ?? loadedState.world ?? freshState.world ?? null,
    lootPiles: Array.isArray(loadedState.lootPiles) ? loadedState.lootPiles : [],
    dungeonObjects: Array.isArray(loadedState.dungeonObjects) ? loadedState.dungeonObjects : [],
    log: Array.isArray(loadedState.log) ? loadedState.log : [],
    initiative: Array.isArray(loadedState.initiative) ? loadedState.initiative : [],
  };

  if (normalized.customDungeon) {
    normalized.customDungeon.storyTriggers = Array.isArray(normalized.customDungeon.storyTriggers) ? normalized.customDungeon.storyTriggers : [];
    normalized.customDungeon.storyTriggerHistory =
      normalized.customDungeon.storyTriggerHistory && typeof normalized.customDungeon.storyTriggerHistory === "object"
        ? normalized.customDungeon.storyTriggerHistory
        : {};
  }

  normalizeMonsterRoomPositions(normalized);
  if (
    normalized.grabbedEntity &&
    (!normalized.fighters?.[normalized.grabbedEntity.carrierId] ||
      (normalized.grabbedEntity.kind === "fighter" && !normalized.fighters?.[normalized.grabbedEntity.targetId]) ||
      (normalized.grabbedEntity.kind === "object" && !normalized.dungeonObjects.some((object) => object.id === normalized.grabbedEntity.targetId)))
  ) {
    normalized.grabbedEntity = null;
  }

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
  if (isLegacyTestingBeastAlly(normalized.fighters["ally-forest-wolf"])) {
    delete normalized.fighters["ally-forest-wolf"];
    removeLegacyTestingBeastAllyFromPartyData(normalized.party);
  }
  const loadedDungeonTime = Math.floor(normalized.dungeonClock?.elapsedSeconds ?? 0);
  const loadedCampaignTime = (normalizeWorldDay(normalized.worldDay) - 1) * 24 * 60 * 60 + (normalized.mode !== "home" ? loadedDungeonTime : 0);
  Object.values(normalized.fighters).forEach((fighter) => {
    if (fighter.dead) {
      fighter.hp = 0;
      fighter.alive = false;
      fighter.stableAtZero = false;
      fighter.deathSaves = fighter.deathSaves ?? { successes: 0, failures: 3 };
      const previousCorpse = fighter.corpse && typeof fighter.corpse === "object" ? fighter.corpse : {};
      const diedAtDungeonTimeSeconds = Math.max(0, Math.floor(Number(previousCorpse.diedAtDungeonTimeSeconds ?? loadedDungeonTime) || 0));
      const legacyAgeSeconds = Math.max(0, loadedDungeonTime - diedAtDungeonTimeSeconds);
      const preservedRemainingSeconds = Math.max(0, Math.floor(Number(previousCorpse.preservedUntilDungeonTimeSeconds ?? 0) || 0) - loadedDungeonTime);
      fighter.corpse = {
        ...previousCorpse,
        diedAtDungeonTimeSeconds,
        diedAtCampaignTimeSeconds: Math.max(
          0,
          Math.floor(Number(previousCorpse.diedAtCampaignTimeSeconds ?? loadedCampaignTime - legacyAgeSeconds) || 0),
        ),
        preservedUntilCampaignTimeSeconds: Math.max(
          0,
          Math.floor(Number(previousCorpse.preservedUntilCampaignTimeSeconds ?? (preservedRemainingSeconds > 0 ? loadedCampaignTime + preservedRemainingSeconds : 0)) || 0),
        ),
      };
      ensureHeroCorpseState(fighter);
    } else if (normalized.party.rosterIds.includes(fighter.id)) {
      if (fighter.hp > 0) fighter.stableAtZero = false;
      else fighter.stableAtZero = Boolean(fighter.stableAtZero || (fighter.deathSaves?.successes ?? 0) >= 3);
      fighter.deathSaves = fighter.deathSaves ?? { successes: 0, failures: 0 };
      if (fighter.stableAtZero) fighter.deathSaves = { successes: 0, failures: 0 };
    }
    if (isAutonomousAlly(fighter)) {
      fighter.followDistanceSquares = Math.max(1, Math.min(5, Number(fighter.followDistanceSquares ?? 3) || 3));
      if (!normalized.fighters[fighter.followHeroId] || !isClassHero(normalized.fighters[fighter.followHeroId])) fighter.followHeroId = null;
    }
    fighter.statusEffects = (fighter.statusEffects ?? []).map((effect) => {
      if (!effect || effect.expiresAtDungeonTimeSeconds || effect.expiresAtEndOfTurn || effect.expiresAtStartOfTurn) return effect;
      if (effect.startsOnNextEncounter) return effect;
      const durationSeconds = durationSecondsFromDefinition(effect);
      return durationSeconds > 0 ? { ...effect, durationSeconds, expiresAtDungeonTimeSeconds: loadedDungeonTime + durationSeconds } : effect;
    });
    if (fighter.summonedByHeroId && fighter.summonDurationRounds && !fighter.summonExpiresAtDungeonTimeSeconds) {
      fighter.summonExpiresAtDungeonTimeSeconds = loadedDungeonTime + durationSecondsFromDefinition({ durationRounds: fighter.summonDurationRounds });
    }
  });
  normalized.spellAreas = Array.isArray(normalized.spellAreas)
    ? normalized.spellAreas.map((area) => {
        const durationSeconds = durationSecondsFromDefinition(area);
        return area.expiresAtDungeonTimeSeconds || durationSeconds <= 0
          ? area
          : { ...area, durationSeconds, expiresAtDungeonTimeSeconds: loadedDungeonTime + durationSeconds };
      })
    : [];
  normalized.party.rosterIds = normalized.party.rosterIds.filter((id) => normalized.fighters[id]);
  if (!normalized.party.rosterIds.includes("hero") && normalized.fighters.hero) normalized.party.rosterIds.unshift("hero");
  normalized.party.heroIds = normalized.party.heroIds.filter((id) => normalized.fighters[id]);
  if (normalized.party.heroIds.length === 0 && normalized.fighters.hero) normalized.party.heroIds = ["hero"];
  normalizeActivePartyOwnerBindings(normalized);
  if (!normalized.fighters[normalized.party.activeHeroId] || isAutonomousAlly(normalized.fighters[normalized.party.activeHeroId])) {
    normalized.party.activeHeroId = normalized.party.heroIds.find((id) => normalized.fighters[id] && !isAutonomousAlly(normalized.fighters[id])) ?? "hero";
  }
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
    if (!isClassHero(fighter)) {
      if (isAutonomousAlly(fighter) && !isHumanoidFighter(fighter) && fighter.renameable === undefined) fighter.renameable = true;
      fighter.level = fighter.level ?? 1;
      fighter.xp = fighter.xp ?? 0;
      fighter.hitDie = fighter.hitDie ?? 10;
      fighter.hitDiceRemaining = fighter.hitDiceRemaining ?? fighter.level ?? 1;
      fighter.equipment = normalizeEquipment(fighter.equipment);
      fighter.inventory = canFighterReceiveInventory(fighter) ? normalizeInventory(fighter.inventory) : normalizeInventory({ money: {}, items: [], heroTokens: 0 });
      compactStackableInventoryItems(fighter);
      ensureFighterAbilityState(fighter);
      ensureSpellPointState(fighter);
      fighter.hasBonusAction = fighter.hasBonusAction ?? true;
      fighter.dodging = fighter.dodging ?? false;
      fighter.disengaged = fighter.disengaged ?? false;
      fighter.canMoveThroughMonsters = fighter.canMoveThroughMonsters ?? false;
      fighter.flying = Boolean(fighter.flying);
      normalizeCreatureSenses(fighter);
      refreshDerivedStats(fighter);
      return;
    }
    fighter.raceSelection = normalizeHeroRaceSelection(fighter);
    const raceTraits = raceTraitsForSelection(fighter.raceSelection);
    fighter.race = raceTraits.raceId;
    fighter.subrace = raceTraits.subraceId;
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
      traits: uniqueValues([...(raceTraits.traits ?? []), ...(fighter.racialTraits?.traits ?? [])]),
      spellTraits: fighter.racialTraits?.spellTraits ?? raceTraits.spellTraits,
      senses: mergeSenses(raceTraits.senses, fighter.racialTraits?.senses),
      flying: Boolean(fighter.racialTraits?.flying || raceTraits.flying),
      powerfulBuild: Boolean(fighter.racialTraits?.powerfulBuild || raceTraits.powerfulBuild),
    };
    fighter.racialSenses = mergeSenses(raceTraits.senses, fighter.racialSenses);
    if (!isWildShaped(fighter)) fighter.senses = mergeSenses(fighter.senses, fighter.racialSenses);
    fighter.flying = Boolean(fighter.flying || raceTraits.flying);
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
    const subclass = subclassDefinitionForFighter(fighter);
    fighter.subclassName = fighter.subclassName ?? subclass?.name;
    fighter.casterType = fighter.casterType ?? classTemplate.casterType;
    if (subclass?.casterType) fighter.casterType = subclass.casterType;
    fighter.spellcastingAbility = fighter.spellcastingAbility ?? subclass?.spellcastingAbility ?? classTemplate.spellcastingAbility;
    fighter.spellPointProgression = fighter.spellPointProgression ?? subclass?.spellPointProgression ?? classTemplate.spellPointProgression;
    fighter.classSpellList = fighter.classSpellList ?? subclass?.spellList ?? classTemplate.classSpellList ?? classTemplate.spellList ?? classTemplate.spells ?? [];
    fighter.classCantripList = fighter.classCantripList ?? subclass?.cantripList ?? classTemplate.classCantripList ?? classTemplate.cantripList ?? [];
    fighter.spells = fighter.spells ?? [];
    fighter.feats = fighterFeatEntries(fighter);
    fighter.extraResourcePoolUses = { ...(fighter.extraResourcePoolUses ?? {}) };
    if (fighter.classId === "warlock" && fighter.pactBoon === "pactTome") {
      fighter.spells = uniqueValues([...(fighter.spells ?? []), "guidance", "sacred-flame", "shillelagh"]);
      fighter.classCantripList = uniqueValues([...(fighter.classCantripList ?? []), "guidance", "sacred-flame", "shillelagh"]);
    }
    fighter.baseAttackAbilityMod = fighter.baseAttackAbilityMod ?? scoreToMod(baseAbilityScore(fighter, attackAbilityForWeapon(activeWeapon(fighter), fighter)));
    fighter.level = fighter.level ?? 1;
    fighter.xp = fighter.xp ?? 0;
    fighter.hitDie = fighter.hitDie ?? 10;
    fighter.hitDiceRemaining = fighter.hitDiceRemaining ?? fighter.level ?? 1;
    fighter.equipment = normalizeEquipment(fighter.equipment);
    fighter.inventory = normalizeInventory(fighter.inventory);
    compactStackableInventoryItems(fighter);
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

