const achievementStorageKey = "depthbound.achievements.v1";

const achievementCategories = [
  { id: "milestone", label: "Milestones" },
  { id: "challenge", label: "Challenges" },
  { id: "collection", label: "Collections" },
  { id: "faction", label: "Factions" },
  { id: "world", label: "World Deeds" },
  { id: "home", label: "Home Trophies" },
];

const achievementDefinitions = [
  { id: "first-blood", category: "milestone", name: "First Blood", description: "Defeat the first monster.", trophy: "Boss Skull Plaque" },
  { id: "first-boss", category: "milestone", name: "Boss Key Without The Key", description: "Defeat a boss monster.", trophy: "Boss Skull Plaque" },
  { id: "boots-on-the-stone", category: "milestone", name: "Boots On The Stone", description: "Complete the first dungeon.", trophy: "Dungeon Door Plaque" },
  { id: "silent-cathedral", category: "milestone", name: "Silent Cathedral", description: "Play the haunted organ in The Barrow Crown's fifth dungeon.", trophy: "Grave-Bronze Organ Pipe" },
  { id: "ripple-no", category: "milestone", name: "RIPPLE NO!", description: "Take the Barrow Crown from the altar in The Crown Vault.", trophy: "Crown-Shaped Warning Sign" },
  { id: "clean-exit", category: "challenge", name: "Clean Exit", description: "Complete a dungeon without any hero dying.", trophy: "Unbroken Lantern" },
  { id: "vicious-last-word", category: "challenge", name: "Vicious Last Word", description: "Kill an enemy with Vicious Mockery.", trophy: "Jeering Mask" },
  { id: "nobody-stayed-down", category: "challenge", name: "Nobody Stayed Down", description: "Complete a dungeon where every active class hero rolled death saves and everyone returned alive.", trophy: "Scuffed Death-Save Ledger" },
  { id: "last-breath-stand", category: "challenge", name: "Last Breath Stand", description: "Win a fight after a hero succeeds on death saves.", trophy: "Last Breath Banner" },
  { id: "the-healer-was-busy", category: "challenge", name: "The Healer Was Busy", description: "Revive a dead companion with a spell.", trophy: "Cracked Diamond Chip" },
  { id: "one-more-door", category: "challenge", name: "One More Door", description: "Complete a dungeon after using the last available short rest.", trophy: "Empty Bedroll Strap" },
  { id: "the-boss-had-pockets", category: "challenge", name: "The Boss Had Pockets", description: "Loot a magic item from a boss.", trophy: "Boss Pocket Lining" },
  { id: "twelve-rounds-later", category: "challenge", name: "Twelve Rounds Later", description: "Defeat a boss after a fight reaches round twelve.", trophy: "Twelve-Notch Turn Counter" },
  { id: "no-potion-panic", category: "challenge", name: "No Potion Panic", description: "Complete a dungeon without drinking a healing potion.", trophy: "Unopened Red Bottle" },
  { id: "back-on-their-feet", category: "challenge", name: "Back On Their Feet", description: "Roll a natural 20 on a death save.", trophy: "Lucky Death-Save Die" },
  { id: "steady-pulse", category: "challenge", name: "Steady Pulse", description: "Stabilize from three successful death saves.", trophy: "Three-Tick Pulse Charm" },
  { id: "barrow-crown-complete", category: "milestone", name: "Crowned In Barrow Dust", description: "Finish The Barrow Crown.", trophy: "Campaign Banner" },
  { id: "thornwood-pact-complete", category: "milestone", name: "The Pact Breaker", description: "Finish The Thornwood Pact.", trophy: "Campaign Banner" },
  { id: "embervein-first-claim-complete", category: "milestone", name: "First Claim Returned", description: "Finish The First Claim Of Embervein.", trophy: "Campaign Banner" },
  { id: "dwarven-smithy-complete", category: "milestone", name: "The Ember Oath Reforged", description: "Finish The Dwarven Smithy Ember Oath.", trophy: "Campaign Banner" },
  { id: "milepost-ledger-complete", category: "world", name: "The Ledger Holds", description: "Finish The Milepost Ledger.", trophy: "Milepost Stone Miniature" },
  { id: "posted-work", category: "world", name: "Posted Work", description: "Accept a settlement board quest.", trophy: "Pinned Notice" },
  { id: "stamp-paid", category: "world", name: "Stamp Paid", description: "Complete a settlement board quest.", trophy: "Stamped Contract" },
  { id: "one-segment-safer", category: "world", name: "One Segment Safer", description: "Build a road segment.", trophy: "Road Charter Frame" },
  { id: "line-on-the-ledger", category: "world", name: "Line On The Ledger", description: "File a completed Expedition Board road project.", trophy: "Road Charter Frame" },
  { id: "first-structure-visit", category: "world", name: "Marked On The Map", description: "Visit a world-map structure.", trophy: "Map Pin" },
  { id: "old-circle-new-shortcut", category: "world", name: "Old Circle, New Shortcut", description: "Discover or place a non-home teleportation circle.", trophy: "Teleport Chalkboard" },
  { id: "the-first-good-bed", category: "home", name: "The First Good Bed", description: "Assign a hero to a bed at home.", trophy: "Bedside Nameplate" },
  { id: "soup-before-steel", category: "home", name: "Soup Before Steel", description: "Cook a hearty meal before adventuring.", trophy: "Kitchen Ladle" },
  { id: "green-thumb-red-hands", category: "home", name: "Green Thumb, Red Hands", description: "Harvest the home herb garden.", trophy: "Dried Herb Bundle" },
  { id: "room-with-a-tune", category: "home", name: "Room With A Tune", description: "Play an instrument at home.", trophy: "Music Stand" },
  { id: "interior-adventurer", category: "home", name: "Interior Adventurer", description: "Place twenty home objects.", trophy: "House Plaque" },
  { id: "familiar-company", category: "home", name: "Familiar Company", description: "Have four Find Familiar companions at home at the same time.", trophy: "Tiny Pawprints" },
  { id: "lodge-card", category: "faction", name: "Lodge Card", description: "Unlock the Trophy Lodge.", trophy: "Hunter's Clean Hook" },
  { id: "clean-trophy", category: "faction", name: "Clean Trophy", description: "Complete a Trophy Lodge contract or turn-in.", trophy: "Hunter's Clean Hook" },
  { id: "grave-candle", category: "faction", name: "Grave Candle", description: "Unlock the Gravebinders.", trophy: "Grave Candle Stand" },
  { id: "names-for-the-nameless", category: "faction", name: "Names For The Nameless", description: "Complete a Gravebinder contract or turn-in.", trophy: "Grave Candle Stand" },
  { id: "element-logged", category: "faction", name: "Element Logged", description: "Complete a Crucible Collegium contract or turn-in.", trophy: "Collegium Element Jar" },
  { id: "catalogued-not-cursed", category: "faction", name: "Catalogued, Not Cursed", description: "Complete an Antiquarian Society contract or turn-in.", trophy: "Antiquarian Label Cabinet" },
  { id: "signed-scout", category: "faction", name: "Signed Scout", description: "Unlock the Expedition Board.", trophy: "Board Ledger Stamp" },
  { id: "board-regular", category: "faction", name: "Board Regular", description: "Complete an Expedition Board contract, turn-in, or road filing.", trophy: "Board Ledger Stamp" },
  { id: "do-not-shake-the-box", category: "faction", name: "Do Not Shake The Box", description: "Complete a Boom Club experiment or sample turn-in.", trophy: "Boom Club Sample Box" },
  { id: "bell-rings-once", category: "faction", name: "Bell Rings Once", description: "Clear the first Fighting Pit wave.", trophy: "Pit Banner" },
  { id: "category-climber", category: "faction", name: "Category Climber", description: "Defeat a Fighting Pit boss wave.", trophy: "Pit Banner" },
  { id: "crowd-favorite", category: "faction", name: "Crowd Favorite", description: "Earn 200 Fighting Pit renown.", trophy: "Arena Laurel" },
  { id: "monster-notebook", category: "collection", name: "Monster Notebook", description: "Record five monster kills in the compendium.", trophy: "Monster Notebook" },
  { id: "trophy-wall", category: "collection", name: "Trophy Wall", description: "Unlock ten achievements.", trophy: "Trophy Wall" },
];

const achievementDefinitionMap = new Map(achievementDefinitions.map((entry) => [entry.id, entry]));
const collapsedAchievementCategories = new Set();
let achievementSearchQuery = "";
const activeAchievementPopups = new Set();
const queuedAchievementPopups = [];
let achievementPopupFlushTimer = null;

function achievementNow() {
  return Date.now();
}

function createAchievementProfile() {
  return {
    schemaVersion: 1,
    profileId: "local-browser-profile",
    updatedAt: achievementNow(),
    unlocked: {},
    counters: {},
    trophyCase: { displayed: [] },
    saveSources: {},
  };
}

function normalizeAchievementProfile(profile = null) {
  const normalized = createAchievementProfile();
  if (!profile || typeof profile !== "object") return normalized;
  normalized.schemaVersion = 1;
  normalized.profileId = String(profile.profileId ?? normalized.profileId);
  normalized.updatedAt = Math.max(0, Math.floor(Number(profile.updatedAt) || 0)) || achievementNow();
  normalized.unlocked = profile.unlocked && typeof profile.unlocked === "object" && !Array.isArray(profile.unlocked) ? profile.unlocked : {};
  normalized.counters = profile.counters && typeof profile.counters === "object" && !Array.isArray(profile.counters) ? profile.counters : {};
  normalized.trophyCase = profile.trophyCase && typeof profile.trophyCase === "object" ? profile.trophyCase : { displayed: [] };
  normalized.trophyCase.displayed = Array.isArray(normalized.trophyCase.displayed) ? normalized.trophyCase.displayed.filter((id) => achievementDefinitionMap.has(id)) : [];
  normalized.saveSources = profile.saveSources && typeof profile.saveSources === "object" && !Array.isArray(profile.saveSources) ? profile.saveSources : {};
  return normalized;
}

function loadAchievementProfile() {
  try {
    return normalizeAchievementProfile(JSON.parse(window.localStorage.getItem(achievementStorageKey) || "null"));
  } catch {
    return normalizeAchievementProfile(window.DepthboundAchievementSessionProfile ?? null);
  }
}

function saveAchievementProfile(profile) {
  const normalized = normalizeAchievementProfile(profile);
  normalized.updatedAt = achievementNow();
  try {
    window.localStorage.setItem(achievementStorageKey, JSON.stringify(normalized));
  } catch {
    window.DepthboundAchievementSessionProfile = normalized;
  }
  return normalized;
}

function achievementSource(extra = {}) {
  return {
    slotId: state?.saveSlotId ?? activeSaveSlot ?? "",
    adventureId: state?.party?.adventureId ?? state?.party?.createdAt ?? "",
    partyName: state?.party?.name ?? state?.fighters?.hero?.name ?? "",
    worldDay: normalizeWorldDay?.(state?.worldDay ?? 1) ?? 1,
    ...extra,
  };
}

function appendAchievementEvent(id, type = "unlock", meta = {}) {
  if (!state?.questFlags || !id) return;
  state.questFlags.achievementEvents = Array.isArray(state.questFlags.achievementEvents) ? state.questFlags.achievementEvents : [];
  state.questFlags.achievementEvents.push({
    id,
    type,
    at: achievementNow(),
    worldDay: normalizeWorldDay?.(state.worldDay ?? 1) ?? 1,
    meta,
  });
  if (state.questFlags.achievementEvents.length > 200) state.questFlags.achievementEvents = state.questFlags.achievementEvents.slice(-200);
}

function achievementPopupAllowed() {
  if (typeof document === "undefined") return false;
  const mainMenu = document.querySelector("#main-menu");
  return !mainMenu || mainMenu.classList.contains("hidden");
}

function queueAchievementPopup(definition, meta = {}) {
  if (!definition) return;
  if (queuedAchievementPopups.some((entry) => entry.definition.id === definition.id)) return;
  queuedAchievementPopups.push({ definition, meta });
  scheduleAchievementPopupFlush();
}

function achievementPopupContainer() {
  let container = document.querySelector("#achievement-popups");
  if (container) return container;
  container = document.createElement("div");
  container.id = "achievement-popups";
  container.className = "achievement-popups";
  container.setAttribute("aria-live", "polite");
  container.setAttribute("aria-atomic", "false");
  document.body.append(container);
  return container;
}

function showAchievementPopupNow(definition, meta = {}, options = {}) {
  if (!definition || !achievementPopupAllowed()) {
    queueAchievementPopup(definition, meta);
    return false;
  }
  if (!options.fromQueue && activeAchievementPopups.size > 0) {
    queueAchievementPopup(definition, meta);
    return false;
  }
  const container = achievementPopupContainer();
  const popup = document.createElement("article");
  popup.className = "achievement-popup";
  popup.tabIndex = 0;
  popup.dataset.achievementId = definition.id;

  const medal = document.createElement("div");
  medal.className = "achievement-popup-medal";
  medal.setAttribute("aria-hidden", "true");
  medal.textContent = "*";

  const copy = document.createElement("div");
  const label = document.createElement("span");
  label.textContent = "Achievement Unlocked";
  const title = document.createElement("strong");
  title.textContent = definition.name;
  const detail = document.createElement("small");
  detail.textContent = definition.trophy ? `Trophy: ${definition.trophy}` : definition.description;
  copy.append(label, title, detail);

  popup.append(medal, copy);
  container.prepend(popup);
  activeAchievementPopups.add(popup);

  const dismiss = () => {
    if (!activeAchievementPopups.has(popup)) return;
    activeAchievementPopups.delete(popup);
    popup.classList.add("leaving");
    window.setTimeout(() => popup.remove(), 260);
  };
  popup.addEventListener("click", dismiss, { once: true });
  popup.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") dismiss();
  });
  window.setTimeout(dismiss, Math.max(2500, Math.floor(Number(meta?.popupDurationMs) || 5200)));

  const maxVisible = 3;
  for (const stale of Array.from(activeAchievementPopups).slice(0, Math.max(0, activeAchievementPopups.size - maxVisible))) {
    stale.classList.add("leaving");
    activeAchievementPopups.delete(stale);
    window.setTimeout(() => stale.remove(), 260);
  }
  return true;
}

function flushAchievementPopupQueue() {
  achievementPopupFlushTimer = null;
  if (!achievementPopupAllowed() || !queuedAchievementPopups.length) {
    scheduleAchievementPopupFlush();
    return;
  }
  if (activeAchievementPopups.size > 0) {
    scheduleAchievementPopupFlush(700);
    return;
  }
  const next = queuedAchievementPopups.shift();
  showAchievementPopupNow(next.definition, next.meta, { fromQueue: true });
  if (queuedAchievementPopups.length) scheduleAchievementPopupFlush(700);
}

function scheduleAchievementPopupFlush(delayMs = 220) {
  if (typeof window === "undefined" || achievementPopupFlushTimer || !queuedAchievementPopups.length) return;
  achievementPopupFlushTimer = window.setTimeout(flushAchievementPopupQueue, delayMs);
}

function unlockAchievement(id, source = achievementSource(), meta = {}) {
  if (!achievementDefinitionMap.has(id)) return false;
  const definition = achievementDefinitionMap.get(id);
  const profile = loadAchievementProfile();
  if (profile.unlocked[id]) return false;
  profile.unlocked[id] = { at: achievementNow(), source, meta };
  saveAchievementProfile(profile);
  appendAchievementEvent(id, "unlock", meta);
  if (state?.log && typeof addLog === "function") addLog(`Trophy unlocked: ${definition.name}.`, "important");
  showAchievementPopupNow(definition, meta);
  syncMetaAchievements();
  return true;
}

function incrementAchievementCounter(counterId, amount = 1, source = achievementSource()) {
  if (!counterId) return 0;
  const profile = loadAchievementProfile();
  profile.counters[counterId] = Math.max(0, Math.floor(Number(profile.counters[counterId]) || 0)) + Math.max(0, Math.floor(Number(amount) || 0));
  profile.saveSources[source.slotId || source.saveFileName || "browser"] = { lastSeenAt: achievementNow(), adventureId: source.adventureId ?? "" };
  saveAchievementProfile(profile);
  appendAchievementEvent(counterId, "counter", { amount });
  return profile.counters[counterId];
}

function mergeAchievementProfiles(baseProfile, importedProfile) {
  const base = normalizeAchievementProfile(baseProfile);
  const imported = normalizeAchievementProfile(importedProfile);
  for (const [id, importedUnlock] of Object.entries(imported.unlocked ?? {})) {
    if (!achievementDefinitionMap.has(id)) continue;
    const current = base.unlocked[id];
    if (!current || Math.max(0, Number(importedUnlock?.at) || 0) < Math.max(0, Number(current?.at) || 0)) {
      base.unlocked[id] = importedUnlock;
    }
  }
  for (const [key, value] of Object.entries(imported.counters ?? {})) {
    if (typeof value === "number") base.counters[key] = Math.max(Math.floor(Number(base.counters[key]) || 0), Math.floor(value) || 0);
    else if (value && typeof value === "object" && !Array.isArray(value)) base.counters[key] = { ...(base.counters[key] ?? {}), ...value };
  }
  base.trophyCase.displayed = Array.from(new Set([...(base.trophyCase.displayed ?? []), ...(imported.trophyCase?.displayed ?? [])])).filter((id) => achievementDefinitionMap.has(id));
  base.saveSources = { ...(base.saveSources ?? {}), ...(imported.saveSources ?? {}) };
  return saveAchievementProfile(base);
}

function exportAchievementProfile() {
  const profile = loadAchievementProfile();
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "depthbound-achievements.json";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function importAchievementProfileFromFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      mergeAchievementProfiles(loadAchievementProfile(), imported);
      renderAchievementsPanel();
      if (typeof updateSaveStatus === "function") updateSaveStatus("Achievement profile imported.");
    } catch {
      if (typeof updateSaveStatus === "function") updateSaveStatus("Could not import that achievement profile.");
    }
  }, { once: true });
  input.click();
}

function uniqueMonsterKillCount() {
  return Object.values(state?.monsterCompendium ?? {}).filter((entry) => Math.max(0, Math.floor(Number(entry?.kills) || 0)) > 0).length;
}

function syncMetaAchievements() {
  const profile = loadAchievementProfile();
  if (Object.keys(profile.unlocked ?? {}).length >= 10) unlockAchievement("trophy-wall", achievementSource(), { count: Object.keys(profile.unlocked).length });
}

function syncAchievementsFromState() {
  if (!state) return;
  const campaignProgress = state.campaignProgress ?? {};
  if (Math.floor(Number(campaignProgress["barrow-crown"]) || 0) >= 7) unlockAchievement("barrow-crown-complete");
  if (Math.floor(Number(campaignProgress["thornwood-pact"]) || 0) >= 8) unlockAchievement("thornwood-pact-complete");
  if (Math.floor(Number(campaignProgress["embervein-first-claim"]) || 0) >= 1) unlockAchievement("embervein-first-claim-complete");
  if (Math.floor(Number(campaignProgress["dwarven-smithy-ember-oath"]) || 0) >= 8) unlockAchievement("dwarven-smithy-complete");
  if (Math.floor(Number(campaignProgress["expedition-mileposts"]) || 0) >= 4) unlockAchievement("milepost-ledger-complete");

  if (uniqueMonsterKillCount() >= 1) unlockAchievement("first-blood");
  if (uniqueMonsterKillCount() >= 5) unlockAchievement("monster-notebook", achievementSource(), { count: uniqueMonsterKillCount() });
  if ((state.questFlags?.["flag.village.monsterHunterGuildUnlocked"])) unlockAchievement("lodge-card");
  if ((state.questFlags?.["flag.village.gravebindersUnlocked"])) unlockAchievement("grave-candle");
  if ((state.questFlags?.["flag.village.expeditionBoardUnlocked"])) unlockAchievement("signed-scout");
  if (Object.values(state.world?.visitedStructures ?? {}).some((visit) => Math.max(0, Math.floor(Number(visit?.count) || 0)) > 0)) unlockAchievement("first-structure-visit");
  if (Object.values(state.world?.teleportCircles ?? {}).some((circle) => circle && !circle.home)) unlockAchievement("old-circle-new-shortcut");
  if ((state.home?.objects ?? []).filter((object) => object?.homePlaced).length >= 20) unlockAchievement("interior-adventurer");
  recordAchievementFindFamiliarCheck();
  syncMetaAchievements();
}

function recordAchievementMonsterKill(monster) {
  if (!monster) return;
  unlockAchievement("first-blood", achievementSource(), { monsterId: monsterCatalogId?.(monster) ?? monster.id ?? "" });
  if (monster.id?.startsWith("boss-") || monster.tags?.includes("boss") || monster.customBoss) unlockAchievement("first-boss", achievementSource(), { monsterId: monsterCatalogId?.(monster) ?? monster.id ?? "" });
  if (uniqueMonsterKillCount() >= 5) unlockAchievement("monster-notebook", achievementSource(), { count: uniqueMonsterKillCount() });
}

function recordAchievementDungeonComplete(context = {}) {
  incrementAchievementCounter("lifetimeDungeonsCompleted", 1, achievementSource(context));
  unlockAchievement("boots-on-the-stone", achievementSource(context), context);
  if (!state?.runStats || Math.max(0, Math.floor(Number(state.runStats.heroesDied) || 0)) === 0) unlockAchievement("clean-exit", achievementSource(context), context);
  const currentClassHeroIds = (state?.party?.rosterIds ?? [])
    .map((id) => state.fighters?.[id])
    .filter(isClassHero)
    .map((hero) => hero.id);
  const deathSaveHeroIds = new Set(state?.runStats?.deathSaveHeroIds ?? []);
  const everyoneRolledDeathSaves = currentClassHeroIds.length > 0 && currentClassHeroIds.every((id) => deathSaveHeroIds.has(id));
  const everyoneAlive = currentClassHeroIds.every((id) => {
    const hero = state.fighters?.[id];
    return hero && hero.alive && !hero.dead;
  });
  if (everyoneRolledDeathSaves && everyoneAlive) unlockAchievement("nobody-stayed-down", achievementSource(context), context);
  const shortRestLimit = Math.max(0, Math.floor(Number(state?.shortRestLimit) || 0));
  if (shortRestLimit > 0 && Math.max(0, Math.floor(Number(state?.shortRestsUsed) || 0)) >= shortRestLimit) unlockAchievement("one-more-door", achievementSource(context), context);
  if (Math.max(0, Math.floor(Number(state?.runStats?.healingPotionsDrunk) || 0)) === 0) unlockAchievement("no-potion-panic", achievementSource(context), context);
  syncAchievementsFromState();
}

function recordAchievementFactionWork(factionId = "", kind = "contract") {
  const achievementByFaction = {
    "monster-guild": "clean-trophy",
    gravebinders: "names-for-the-nameless",
    "crucible-collegium": "element-logged",
    "antiquarian-society": "catalogued-not-cursed",
    "expedition-board": "board-regular",
    "boom-club": "do-not-shake-the-box",
  };
  const id = achievementByFaction[factionId];
  if (id) unlockAchievement(id, achievementSource(), { factionId, kind });
}

function recordAchievementFightingPitWave(result = {}) {
  unlockAchievement("bell-rings-once", achievementSource(), result);
  if (result?.boss) unlockAchievement("category-climber", achievementSource(), result);
  if (Math.max(0, Math.floor(Number(fightingPitProgress?.().renown) || 0)) >= 200) unlockAchievement("crowd-favorite", achievementSource(), { renown: fightingPitProgress().renown });
}

function recordAchievementHomeObjectCount() {
  if ((state?.home?.objects ?? []).filter((object) => object?.homePlaced).length >= 20) unlockAchievement("interior-adventurer");
}

function recordAchievementFightComplete(result = {}) {
  if (result?.deathSaveSuccess) unlockAchievement("last-breath-stand", achievementSource(result), result);
  if (result?.boss && Math.max(0, Math.floor(Number(result.rounds) || 0)) >= 12) unlockAchievement("twelve-rounds-later", achievementSource(result), result);
}

function recordAchievementBossLoot(monster = null, items = []) {
  const hasMagicItem = (items ?? []).some((item) => item?.tags?.includes("loot:magic") || item?.tags?.includes("magic-item") || String(item?.id ?? item?.itemId ?? "").startsWith("magic-"));
  if (hasMagicItem) unlockAchievement("the-boss-had-pockets", achievementSource(), { monsterId: monster?.id ?? "", itemIds: items.map((item) => item?.id ?? item?.itemId ?? "").filter(Boolean) });
}

function activeFindFamiliarCount() {
  return Object.values(state?.fighters ?? {}).filter((fighter) =>
    fighter &&
    fighter.summonedBySpellId === "find-familiar" &&
    fighter.summonedByHeroId &&
    fighter.alive !== false &&
    !fighter.dead
  ).length;
}

function recordAchievementFindFamiliarCheck() {
  if (state?.mode !== "home") return;
  const count = activeFindFamiliarCount();
  if (count >= 4) unlockAchievement("familiar-company", achievementSource(), { count });
}

function achievementProgressText(definition, profile) {
  if (profile.unlocked?.[definition.id]) return "Unlocked";
  if (definition.id === "monster-notebook") return `${Math.min(5, uniqueMonsterKillCount())} / 5`;
  if (definition.id === "trophy-wall") return `${Math.min(10, Object.keys(profile.unlocked ?? {}).length)} / 10`;
  if (definition.id === "interior-adventurer") return `${Math.min(20, (state?.home?.objects ?? []).filter((object) => object?.homePlaced).length)} / 20`;
  if (definition.id === "familiar-company") return `${Math.min(4, activeFindFamiliarCount())} / 4`;
  if (definition.id === "crowd-favorite") return `${Math.min(200, Math.max(0, Math.floor(Number(fightingPitProgress?.().renown) || 0)))} / 200`;
  return "Locked";
}

function achievementSearchText(definition, profile) {
  const category = achievementCategories.find((entry) => entry.id === definition.category);
  return [
    definition.name,
    definition.description,
    definition.trophy,
    category?.label,
    profile.unlocked?.[definition.id] ? "unlocked" : "locked",
    achievementProgressText(definition, profile),
  ].filter(Boolean).join(" ").toLowerCase();
}

function renderAchievementsPanel() {
  if (!els.achievementsPanel) return;
  syncAchievementsFromState();
  const profile = loadAchievementProfile();
  const unlockedCount = Object.keys(profile.unlocked ?? {}).length;
  const query = achievementSearchQuery.trim().toLowerCase();
  const visibleDefinitions = query
    ? achievementDefinitions.filter((definition) => achievementSearchText(definition, profile).includes(query))
    : achievementDefinitions;
  els.achievementsPanel.innerHTML = `
    <section class="achievements-summary">
      <div>
        <span>Unlocked</span>
        <b>${escapeHtml(unlockedCount)} / ${escapeHtml(achievementDefinitions.length)}</b>
      </div>
      <div>
        <span>Dungeons</span>
        <b>${escapeHtml(profile.counters?.lifetimeDungeonsCompleted ?? 0)}</b>
      </div>
      <div>
        <span>Storage</span>
        <b>Browser Profile</b>
      </div>
    </section>
    <div class="achievement-profile-actions">
      <button type="button" data-achievement-action="export">Export Profile</button>
      <button type="button" class="ghost-button" data-achievement-action="import">Import Profile</button>
    </div>
    <label class="achievement-search">
      <span>Search</span>
      <input type="search" value="${escapeAttribute(achievementSearchQuery)}" placeholder="Achievement, trophy, category" data-achievement-search autocomplete="off">
    </label>
    <div class="achievements-scroll">
      ${achievementCategories
        .map((category) => {
          const entries = visibleDefinitions.filter((definition) => definition.category === category.id);
          if (!entries.length) return "";
          const collapsed = collapsedAchievementCategories.has(category.id);
          const unlockedInCategory = entries.filter((definition) => profile.unlocked?.[definition.id]).length;
          return `
            <section class="achievement-category ${collapsed ? "collapsed" : ""}" data-achievement-category="${escapeAttribute(category.id)}">
              <button type="button" class="achievement-category-toggle" data-achievement-action="toggle-category" data-category="${escapeAttribute(category.id)}" aria-expanded="${collapsed ? "false" : "true"}">
                <span>${escapeHtml(collapsed ? "+" : "-")}</span>
                <b>${escapeHtml(category.label)}</b>
                <small>${escapeHtml(unlockedInCategory)} / ${escapeHtml(entries.length)}</small>
              </button>
              <div class="achievement-list" ${collapsed ? "hidden" : ""}>
                ${entries
                  .map((definition) => {
                    const unlocked = profile.unlocked?.[definition.id];
                    const source = unlocked?.source;
                    const detail = unlocked
                      ? `Unlocked${source?.worldDay ? ` on day ${source.worldDay}` : ""}`
                      : achievementProgressText(definition, profile);
                    return `
                      <article class="achievement-card ${unlocked ? "unlocked" : "locked"}">
                        <div class="achievement-medal" aria-hidden="true">${unlocked ? "*" : "?"}</div>
                        <div>
                          <h4>${escapeHtml(definition.name)}</h4>
                          <p>${escapeHtml(definition.description)}</p>
                          <small>${escapeHtml(detail)}${definition.trophy ? ` - Trophy: ${escapeHtml(definition.trophy)}` : ""}</small>
                        </div>
                      </article>
                    `;
                  })
                  .join("")}
              </div>
            </section>
          `;
        })
        .join("") || `<p class="achievements-empty">No achievements found.</p>`}
    </div>
  `;
}

function showAchievementsMenu() {
  showMainMenuSubmenu("achievements");
  renderAchievementsPanel();
}

function handleAchievementsPanelClick(event) {
  const button = event.target.closest("[data-achievement-action]");
  if (!button) return;
  if (button.dataset.achievementAction === "export") exportAchievementProfile();
  if (button.dataset.achievementAction === "import") importAchievementProfileFromFile();
  if (button.dataset.achievementAction === "toggle-category") {
    const categoryId = button.dataset.category ?? "";
    if (collapsedAchievementCategories.has(categoryId)) collapsedAchievementCategories.delete(categoryId);
    else collapsedAchievementCategories.add(categoryId);
    renderAchievementsPanel();
  }
}

function handleAchievementsPanelInput(event) {
  const input = event.target.closest("[data-achievement-search]");
  if (!input) return;
  const selectionStart = input.selectionStart ?? input.value.length;
  achievementSearchQuery = input.value;
  renderAchievementsPanel();
  const nextInput = els.achievementsPanel?.querySelector("[data-achievement-search]");
  if (nextInput) {
    nextInput.focus();
    nextInput.setSelectionRange(selectionStart, selectionStart);
  }
}

window.DepthboundAchievements = {
  definitions: achievementDefinitions,
  load: loadAchievementProfile,
  save: saveAchievementProfile,
  unlock: unlockAchievement,
  increment: incrementAchievementCounter,
  export: exportAchievementProfile,
  import: importAchievementProfileFromFile,
  merge: mergeAchievementProfiles,
  syncFromState: syncAchievementsFromState,
  render: renderAchievementsPanel,
  show: showAchievementsMenu,
  handlePanelClick: handleAchievementsPanelClick,
  handlePanelInput: handleAchievementsPanelInput,
  monsterKill: recordAchievementMonsterKill,
  dungeonComplete: recordAchievementDungeonComplete,
  fightComplete: recordAchievementFightComplete,
  bossLoot: recordAchievementBossLoot,
  factionWork: recordAchievementFactionWork,
  pitWave: recordAchievementFightingPitWave,
  homeObjectCount: recordAchievementHomeObjectCount,
  findFamiliarCheck: recordAchievementFindFamiliarCheck,
};
