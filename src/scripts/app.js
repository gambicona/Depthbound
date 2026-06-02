
const minRoomZoom = 0.5;
const maxRoomZoom = 2;

function gridPointFromClientPoint(clientX, clientY) {
  if (!els.room) return viewportCenterGridPoint();
  const rect = els.room.getBoundingClientRect();
  if (!rect.width || !rect.height) return viewportCenterGridPoint();
  return {
    x: clamp(((clientX - rect.left) / rect.width) * currentGridSize(), 0, currentGridSize()),
    y: clamp(((clientY - rect.top) / rect.height) * currentGridSize(), 0, currentGridSize()),
  };
}

function setRoomZoom(value, focusPoint = viewportCenterGridPoint()) {
  const nextZoom = clamp(Number(value) || 1, minRoomZoom, maxRoomZoom);
  const roundedZoom = Number(nextZoom.toFixed(2));
  if (Math.abs(roomZoom - roundedZoom) < 0.001) {
    renderControls();
    return;
  }
  roomZoom = roundedZoom;
  renderKeepingGridFocus(focusPoint);
}

function adjustRoomZoom(delta, focusPoint = viewportCenterGridPoint()) {
  setRoomZoom(roomZoom + delta, focusPoint);
}

function touchDistance(touchA, touchB) {
  return Math.hypot(touchA.clientX - touchB.clientX, touchA.clientY - touchB.clientY);
}

function touchMidpoint(touchA, touchB) {
  return {
    x: (touchA.clientX + touchB.clientX) / 2,
    y: (touchA.clientY + touchB.clientY) / 2,
  };
}

function beginRoomPinchZoom(event) {
  if (!gameHasStarted || event.touches.length !== 2) return;
  if (event.target?.closest?.("input, textarea, select, button, .fighter-info, .topbar")) return;
  const [touchA, touchB] = event.touches;
  const startDistance = touchDistance(touchA, touchB);
  if (startDistance < 24) return;
  const midpoint = touchMidpoint(touchA, touchB);
  roomPinchZoom = {
    startDistance,
    startZoom: roomZoom,
    focusPoint: gridPointFromClientPoint(midpoint.x, midpoint.y),
  };
  if (roomScrollAnimation) {
    window.cancelAnimationFrame(roomScrollAnimation);
    roomScrollAnimation = null;
  }
  event.preventDefault();
}

function updateRoomPinchZoom(event) {
  if (!roomPinchZoom || event.touches.length !== 2) return;
  const [touchA, touchB] = event.touches;
  const distance = touchDistance(touchA, touchB);
  if (distance <= 0) return;
  event.preventDefault();
  setRoomZoom(roomPinchZoom.startZoom * (distance / roomPinchZoom.startDistance), roomPinchZoom.focusPoint);
}

function finishRoomPinchZoom(event) {
  if (!roomPinchZoom || event.touches.length >= 2) return;
  roomPinchZoom = null;
}

function handleDungeonCtrlWheelZoom(event) {
  if (!event.ctrlKey || !gameHasStarted) return;
  const target = event.target;
  if (target?.closest?.("input, textarea, select, .fighter-info")) return;
  event.preventDefault();
  event.stopPropagation();
  const focusPoint = els.roomScroll?.contains(target) ? gridPointFromClientPoint(event.clientX, event.clientY) : viewportCenterGridPoint();
  adjustRoomZoom(event.deltaY > 0 ? -0.1 : 0.1, focusPoint);
}

function ensurePerfOverlay() {
  if (perfOverlayElement) return perfOverlayElement;
  perfOverlayElement = document.createElement("div");
  perfOverlayElement.id = "perf-overlay";
  perfOverlayElement.style.cssText = [
    "position:fixed",
    "left:12px",
    "top:12px",
    "z-index:50",
    "padding:8px 10px",
    "background:rgba(12,10,8,0.86)",
    "color:#f3e7cc",
    "border:1px solid rgba(215,168,79,0.45)",
    "border-radius:6px",
    "font:12px/1.35 monospace",
    "pointer-events:none",
    "white-space:pre",
  ].join(";");
  document.body.append(perfOverlayElement);
  return perfOverlayElement;
}

function updatePerfOverlay() {
  perfStats.frames += 1;
  const now = performance.now();
  const elapsed = now - perfStats.lastSecondAt;
  if (elapsed >= 1000) {
    perfStats.fps = Math.round((perfStats.frames * 1000) / elapsed);
    perfStats.aiUpdatesPerSecond = perfStats.aiUpdates;
    perfStats.pathfindingJobsPerSecond = perfStats.pathfindingJobs;
    perfStats.frames = 0;
    perfStats.aiUpdates = 0;
    perfStats.pathfindingJobs = 0;
    perfStats.lastSecondAt = now;
  }

  const overlay = ensurePerfOverlay();
  overlay.style.display = adminEnabled() ? "" : "none";
  if (!adminEnabled()) {
    perfStats.pathfindingJobsLastFrame = 0;
    return;
  }
  overlay.textContent = [
    `FPS ${perfStats.fps} | render ${perfStats.renderMs.toFixed(1)}ms`,
    `tiles ${perfStats.renderedTiles}/${perfStats.visibleTiles}`,
    `entities ${perfStats.activeEntities} active, ${perfStats.sleepingEntities} sleeping, ${perfStats.totalEntities} total`,
    `AI ${perfStats.aiUpdatesPerSecond}/s | paths ${perfStats.pathfindingJobsPerSecond}/s (${perfStats.pathfindingJobsLastFrame} last)`,
  ].join("\n");
  perfStats.pathfindingJobsLastFrame = 0;
}

function render() {
  const renderStart = performance.now();
  if (typeof processTavernHirelingPayments === "function") processTavernHirelingPayments();
  processDungeonPassiveObjects();
  renderRoom();
  renderPartyRoster();
  renderHeroStatusCard(els.heroCard, activeHero());
  activateFledMonstersWithLineOfSight();
  renderInitiative();
  renderLog();
  renderControls();
  if (state?.world?.travelCamp?.active && !els.homeMenu?.classList.contains("hidden")) renderTravelCampMenu();
  scheduleInitiativePromptIfNeeded();
  if (typeof scheduleFactionFirstContacts === "function") scheduleFactionFirstContacts();
  updateInteractiveTutorial();
  perfStats.renderMs = performance.now() - renderStart;
  updatePerfOverlay();
  updateBackgroundMusic();
}

els.rollInitiative.addEventListener("click", rollInitiative);
els.initiativeList?.addEventListener("click", (event) => {
  const item = event.target.closest("[data-initiative-fighter]");
  const fighter = item ? state.fighters[item.dataset.initiativeFighter] : null;
  if (!isPlayerControlledPartyFighter(fighter)) return;
  if (setActiveHero(fighter.id)) render();
});
els.selectParty?.addEventListener("click", selectActivePartyForMovement);
els.selectPartyRoster?.addEventListener("click", selectActivePartyForMovement);
els.partyRoster?.addEventListener("click", (event) => {
  const art = event.target.closest("[data-combatant-art]");
  if (art && fighterInfoMatches(art.dataset.combatantArt) && showCombatantArtDialog(art.dataset.combatantArt)) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const entry = event.target.closest("[data-party-hero]");
  if (!entry) return;
  const heroId = entry.dataset.partyHero;
  if (entry.dataset.adminAiAlly && adminEnabled() && isAutonomousAlly(state.fighters?.[heroId])) {
    showCombatantInfo(state.fighters[heroId]);
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  const changed = (event.shiftKey || event.ctrlKey || event.metaKey) && state.mode !== "combat"
    ? toggleHeroSelection(heroId)
    : setActiveHero(heroId);
  if (changed) render();
});
els.attack.addEventListener("click", () => {
  void performAttackWithPrompt();
});
els.actionButton.addEventListener("click", () => {
  const fighter = state.mode === "combat" ? activeFighter() : activeHero();
  if (activeGrabForCarrier(fighter)) {
    releaseGrabForFighter(fighter);
    return;
  }
  showActionMenu();
});
els.favoriteActions?.addEventListener("click", showFavoriteActionsMenu);
els.useItem.addEventListener("click", showUseItemMenu);
els.abilities.addEventListener("click", showAbilitiesMenu);
els.shortRest.addEventListener("click", takeShortRest);
els.toggleDungeonTimer?.addEventListener("click", () => {
  toggleDungeonClockPaused();
  if (window.DepthboundPlaytest?.syncNow) window.DepthboundPlaytest.syncNow();
  render();
});
els.questLogButton?.addEventListener("click", toggleQuestLog);
els.returnHome.addEventListener("click", () => {
  if (state.mode === "combat") {
    fleeCombat();
    return;
  }
  returnHomeEarly();
});
els.endTurn.addEventListener("click", endTurn);
els.heroCard.addEventListener("contextmenu", (event) => {
  event.preventDefault();
  showCombatantInfo(activeHero());
});
els.heroCard.addEventListener("click", (event) => {
  const art = event.target.closest("[data-combatant-art]");
  if (art && fighterInfoMatches(art.dataset.combatantArt) && showCombatantArtDialog(art.dataset.combatantArt)) {
    event.preventDefault();
    event.stopPropagation();
  }
});
els.newGame.addEventListener("click", () => {
  showMainMenu();
});

window.setInterval(() => {
  if (!gameHasStarted || state?.mode === "home") return;
  if (dungeonClockIsPaused()) {
    renderDungeonClock();
    renderHeroStatusCard(els.heroCard, activeHero());
    return;
  }
  const advanced = syncDungeonClock();
  const expired = advanced > 0 ? expireTimedDungeonEffects() : 0;
  const passive = advanced > 0 ? processDungeonPassiveObjects() : { spawned: 0, recruited: 0 };
  if (expired > 0 || passive.spawned > 0 || passive.recruited > 0) render();
  else {
    renderDungeonClock();
    renderHeroStatusCard(els.heroCard, activeHero());
  }
}, 1000);
const bugReportUrl = window.DungeonConfig?.bugReport?.formUrl ?? "";
if (els.bugReport) {
  if (bugReportUrl) {
    els.bugReport.href = bugReportUrl;
  }
  els.bugReport.addEventListener("click", (event) => {
    if (!bugReportUrl || bugReportUrl.includes("REPLACE_WITH_YOUR_BUG_REPORT_FORM")) {
      event.preventDefault();
      window.alert("Bug report form is not connected yet. Add your Google Form URL in src/scripts/config.js.");
    }
  });
}
els.showDungeonIntro?.addEventListener("click", () => {
  const intro = state.customDungeon?.intro;
  if (!intro?.text && !(intro?.images ?? []).length) return;
  void showDungeonStoryDialog({
    title: state.customDungeon?.name ?? state.room.name,
    text: intro.text,
    images: intro.images,
    actionLabel: "Close",
    goalText: customGoalStatus().text,
  });
});
els.tutorial.addEventListener("click", showTutorial);
els.mainTutorial?.addEventListener("click", startInteractiveTutorial);
els.loadMenu?.addEventListener("click", () => showMainMenuSubmenu("load"));
els.settingsMenu?.addEventListener("click", () => showMainMenuSubmenu("settings"));
els.mainMenuBack?.addEventListener("click", showMainMenuRoot);
els.tutorialTourBack?.addEventListener("click", () => {
  if (!interactiveTutorialActive) return;
  interactiveTutorialStep = Math.max(0, interactiveTutorialStep - 1);
  updateInteractiveTutorial();
});
els.tutorialTourNext?.addEventListener("click", () => {
  if (!interactiveTutorialActive) return;
  if (interactiveTutorialStep >= interactiveTutorialSteps.length - 1) {
    finishInteractiveTutorial();
    return;
  }
  interactiveTutorialStep += 1;
  updateInteractiveTutorial();
});
els.tutorialTourClose?.addEventListener("click", finishInteractiveTutorial);
els.toggleAdminMode.addEventListener("click", () => {
  adminMode = !adminMode;
  if (!adminMode) disableAdminModeOptions();
  addLog(adminMode ? "Admin tools enabled." : "Admin tools disabled.", "important");
  render();
  if (!els.homeMenu?.classList.contains("hidden")) renderHomeAdventurePanels();
  if (isHomeBuilderOpen()) renderHomeBuilder();
});
els.toggleLayout.addEventListener("click", () => {
  if (!adminEnabled()) return;
  showDungeonLayout = !showDungeonLayout;
  render();
});
els.zoomOut.addEventListener("click", () => adjustRoomZoom(-0.1));
els.zoomIn.addEventListener("click", () => adjustRoomZoom(0.1));
els.zoomSlider?.addEventListener("input", (event) => {
  setRoomZoom(Number(event.target.value) / 100);
});
els.volumeSliders?.forEach((slider) => {
  slider.addEventListener("input", (event) => {
    soundVolume = clamp(Number(event.target.value) / 100, 0, 1);
    window.localStorage.setItem("dungeonCrawler.soundVolume.v1", String(soundVolume));
    if (currentMusic) currentMusic.volume = 0.1 * soundVolume;
    renderControls();
  });
});
els.buttonThemeSelect?.addEventListener("change", (event) => {
  applyButtonTheme(event.target.value);
  renderControls();
});
els.saveRollModeSelect?.addEventListener("change", (event) => {
  applySaveRollMode(event.target.value);
  addLog(`Roll save mode set to ${saveRollModeLabels[normalizeSaveRollMode(state?.saveRollMode ?? saveRollMode)]}.`, "important");
  renderControls();
});
els.manageTokenArt?.addEventListener("click", showTokenArtManager);
function handleAdminQuickAction(action) {
  if (!adminEnabled()) return false;
  if (action === "toggle-admin-teleport") {
    adminTeleportEnabled = !adminTeleportEnabled;
    addLog(adminTeleportEnabled ? "Admin teleport enabled." : "Admin teleport disabled.", "important");
    render();
    if (!els.inventoryMenu.classList.contains("hidden")) renderInventoryMenu();
    return true;
  }
  if (action === "toggle-admin-god") {
    adminGodMode = !adminGodMode;
    addLog(adminGodMode ? "God mode enabled." : "God mode disabled.", "important");
    render();
    if (!els.inventoryMenu.classList.contains("hidden")) renderInventoryMenu();
    return true;
  }
  if (action === "admin-heal") {
    adminFullHeal();
    return true;
  }
  if (action === "admin-refresh") {
    adminRefreshActions();
    return true;
  }
  if (action === "admin-reveal-current-room") {
    adminRevealCurrentRoom();
    return true;
  }
  if (action === "admin-open-visible-doors") {
    adminOpenVisibleDoors();
    return true;
  }
  if (action === "admin-collect-visible-loot") {
    adminCollectVisibleLoot();
    return true;
  }
  if (action === "admin-clear-combat") {
    adminClearCombat();
    return true;
  }
  return false;
}
els.topAdminActions?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  if (button.dataset.action === "toggle-admin-monsters") {
    adminMonsterCatalogOpen = !adminMonsterCatalogOpen;
    renderControls();
    event.preventDefault();
    return;
  }
  if (button.dataset.action === "spawn-admin-monster") {
    spawnAdminMonster(button.dataset.monster);
    event.preventDefault();
    return;
  }
  if (handleAdminQuickAction(button.dataset.action)) event.preventDefault();
});
els.topAdminActions?.addEventListener("input", (event) => {
  if (event.target.id !== "admin-monster-search") return;
  adminMonsterSearch = event.target.value;
  renderControls();
});
els.debugKill.addEventListener("click", debugKillVisibleMonsters);
els.saveGame.addEventListener("click", () => void saveAdventure(state.saveSlotId ?? activeSaveSlot));
els.chooseSaveFolder?.addEventListener("click", () => void chooseSaveFolderFromMenu());
els.startAdventure.addEventListener("click", startNewAdventure);
els.saveSlots.addEventListener("click", async (event) => {
  const slotElement = event.target.closest("[data-slot]");
  if (slotElement) selectSaveSlot(Number(slotElement.dataset.slot));

  const button = event.target.closest("button");
  if (!button) return;

  const slotId = Number(button.dataset.slot);
  if (button.dataset.action === "save-slot") {
    await saveAdventure(slotId);
  }
  if (button.dataset.action === "load-slot") {
    await loadAdventure(slotId);
  }
  if (button.dataset.action === "export-slot") {
    await exportAdventure(slotId);
  }
  if (button.dataset.action === "import-slot") {
    await importAdventure(slotId);
  }
  if (button.dataset.action === "delete-slot") {
    await deleteAdventure(slotId);
  }
});
els.saveSlots.addEventListener("input", (event) => {
  const slotElement = event.target.closest("[data-slot]");
  if (slotElement) activeSaveSlot = Number(slotElement.dataset.slot);
});
els.clearLog.addEventListener("click", () => {
  state.log = [];
  renderLog();
});
els.expandLog?.addEventListener("click", () => {
  combatLogExpanded = !combatLogExpanded;
  renderLog();
});
els.closeFighterInfo.addEventListener("click", hideFighterInfo);
els.fighterInfo.addEventListener("click", (event) => {
  if (event.target === els.fighterInfo) {
    hideFighterInfo();
    return;
  }

  const art = event.target.closest("[data-combatant-art]");
  if (art && showCombatantArtDialog(art.dataset.combatantArt)) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "take-object-item") {
    takeObjectItem(button.dataset.object, button.dataset.item);
  }
  if (button.dataset.action === "loot-corpse-item") {
    lootCorpseItem(button.dataset.corpse, button.dataset.item);
  }
  if (button.dataset.action === "loot-corpse-money") {
    lootCorpseMoney(button.dataset.corpse);
  }
  if (button.dataset.action === "transport-corpse-base") {
    transportCorpseToBase(button.dataset.corpse);
  }
  if (button.dataset.action === "cast-corpse-spell") {
    castCorpseSpell(button.dataset.corpse, button.dataset.caster, button.dataset.spell);
  }
  if (button.dataset.action === "pick-lock") {
    pickObjectLock(button.dataset.object);
  }
  if (button.dataset.action === "answer-special-lock") {
    void answerObjectSpecialLock(button.dataset.object);
  }
  if (button.dataset.action === "disarm-trap") {
    disarmTrap(button.dataset.object);
  }
  if (button.dataset.action === "dispel-trap") {
    dispelMagicTrap(button.dataset.object);
  }
  if (button.dataset.action === "investigate-object") {
    investigateObject(button.dataset.object);
  }
  if (button.dataset.action === "farm-resource-node") {
    farmResourceNode(button.dataset.object);
  }
  if (button.dataset.action === "use-object-interaction") {
    useObjectInteraction(button.dataset.object);
  }
  if (button.dataset.action === "attack-object") {
    attackDestructibleObject(state.mode === "combat" ? activeFighter() : activeHero(), dungeonObjectForId(button.dataset.object));
  }
  if (button.dataset.action === "free-captive") {
    freeCaptiveCreature(button.dataset.object);
  }
  if (button.dataset.action === "home-store-item") {
    storeHomeChestItem(button.dataset.item, button.dataset.object ?? "home-chest");
  }
  if (button.dataset.action === "home-store-all-items") {
    storeAllHomeChestItems(button.dataset.object ?? "home-chest");
  }
  if (button.dataset.action === "home-take-all-items") {
    takeAllHomeChestItems(button.dataset.object ?? "home-chest");
  }
  if (button.dataset.action === "home-deposit-custom-coins") {
    moveCustomMoneyFromHomeChestPanel("deposit");
  }
  if (button.dataset.action === "home-withdraw-custom-coins") {
    moveCustomMoneyFromHomeChestPanel("withdraw");
  }
  if (button.dataset.action === "home-deposit-all-coins") {
    moveMoneyBetweenHeroAndChest("deposit", moneyToCp(activeHero().inventory.money));
    showHomeChestInfo();
  }
  if (button.dataset.action === "home-withdraw-all-coins") {
    moveMoneyBetweenHeroAndChest("withdraw", moneyToCp(state.chestMoney ?? {}));
    showHomeChestInfo();
  }
  if (button.dataset.action === "open-monster-compendium") {
    openMonsterCompendium();
  }
  if (button.dataset.action === "open-library-tutorial") {
    showHomeLibraryTutorial(button.dataset.topic);
  }
  if (button.dataset.action === "library-tutorial-step") {
    showHomeLibraryTutorial(button.dataset.topic, button.dataset.step);
  }
  if (button.dataset.action === "preview-monster-art") {
    showMonsterArtPreview(button.dataset.art, button.dataset.name);
  }
  if (button.dataset.action === "cook-home-meal") {
    cookHomeMeal();
  }
  if (button.dataset.action === "camp-use-rations") {
    travelUseCampRations();
    hideFighterInfo();
  }
  if (button.dataset.action === "inn-buy-refreshment") {
    travelBuyInnRefreshment(button.dataset.refreshment);
    hideFighterInfo();
  }
  if (button.dataset.action === "harvest-home-herbs") {
    harvestHomeHerbs();
  }
  if (button.dataset.action === "home-build-tool") {
    homeBuildTool = button.dataset.tool ?? "floor";
    homeMoveSelection = null;
    renderHomeBuilder();
  }
  if (button.dataset.action === "home-build-furniture") {
    homeBuildFurnitureId = button.dataset.furniture ?? homeBuildFurnitureId;
    homeBuildTool = "furniture";
    homeMoveSelection = null;
    renderHomeBuilder();
  }
  if (button.dataset.action === "home-paint-color") {
    homeBuildPaintColor = button.dataset.color ?? homeBuildPaintColor;
    renderHomeBuilder();
  }
  if (button.dataset.action === "home-rotate-furniture") {
    rotateHomeFurnitureSelection();
  }
  if (button.dataset.action === "home-save-build") {
    saveHomeBuilderChanges();
  }
  if (button.dataset.action === "home-restore-build") {
    restoreHomeBuilderChanges();
  }
  if (button.dataset.action === "show-bed-range") {
    showHomeBedRange(button.dataset.object);
  }
  if (button.dataset.action === "play-home-instrument") {
    void playHomeInstrument(button.dataset.object);
  }
  if (button.dataset.action === "create-roster-hero") {
    createRosterHero();
  }
  if (button.dataset.action === "show-quest-log") {
    showQuestLog();
  }
  if (button.dataset.action === "add-party-hero") {
    addHeroToParty(button.dataset.hero);
  }
  if (button.dataset.action === "remove-party-hero") {
    removeHeroFromParty(button.dataset.hero);
  }
  if (button.dataset.action === "retire-party-member") {
    retirePartyMember(button.dataset.hero);
  }
  if (button.dataset.action === "dismiss-tavern-hireling") {
    dismissTavernHirelingFromParty(button.dataset.hero);
  }
  if (button.dataset.action === "show-ai-ally-stat-block") {
    const ally = state.fighters?.[button.dataset.hero];
    if (adminEnabled() && isAutonomousAlly(ally)) showCombatantInfo(ally);
  }
  if (button.dataset.action === "make-main-hero") {
    makeMainHero(button.dataset.hero);
  }
  if (button.dataset.action === "toggle-inspect-admin") {
    const details = button.closest(".fighter-info-body")?.querySelector(".inspect-admin-details");
    details?.classList.toggle("hidden");
    button.classList.toggle("active", !details?.classList.contains("hidden"));
  }
});
els.fighterInfo.addEventListener("change", (event) => {
  const allyFollowHero = event.target.closest("select[data-action='ally-follow-hero']");
  if (allyFollowHero) {
    setAllyFollowHero(allyFollowHero.dataset.ally, allyFollowHero.value);
    return;
  }
  const allyFollowDistance = event.target.closest("select[data-action='ally-follow-distance']");
  if (allyFollowDistance) {
    setAllyFollowDistance(allyFollowDistance.dataset.ally, allyFollowDistance.value);
    return;
  }
  const d20Select = event.target.closest("select[data-action='d20-mode']");
  if (d20Select) {
    setD20Mode(d20Select.value);
    showPlanningTableInfo();
    return;
  }
  const saveRollSelect = event.target.closest("select[data-action='save-roll-mode']");
  if (saveRollSelect) {
    setSaveRollMode(saveRollSelect.value);
    showPlanningTableInfo();
    return;
  }
  const bedSelect = event.target.closest("select[data-action='assign-home-bed']");
  if (bedSelect) {
    assignHomeBed(bedSelect.dataset.object, bedSelect.value);
    return;
  }
  const select = event.target.closest("select[data-action='party-role']");
  if (!select) return;
  setHeroRole(select.dataset.hero, select.value);
  showPlanningTableInfo();
});
els.fighterInfo.addEventListener("input", (event) => {
  if (event.target.id === "home-build-search") {
    homeBuildSearch = event.target.value;
    renderHomeBuilder();
    const searchInput = els.fighterInfo.querySelector("#home-build-search");
    searchInput?.focus();
    searchInput?.setSelectionRange(searchInput.value.length, searchInput.value.length);
  }
  if (event.target.id === "home-paint-color") {
    homeBuildPaintColor = event.target.value;
    renderHomeBuilder();
  }
  if (event.target.id === "home-paint-alpha") {
    homeBuildPaintAlpha = Math.max(0.05, Math.min(1, Number(event.target.value) / 100 || 1));
    renderHomeBuilder();
  }
});
els.closeInventory.addEventListener("click", hideInventoryMenu);
els.closeUseItem.addEventListener("click", hideUseItemMenu);
els.closeActionMenu.addEventListener("click", hideActionMenu);
els.closeFavoriteActions?.addEventListener("click", hideFavoriteActionsMenu);
els.closeAbilities.addEventListener("click", hideAbilitiesMenu);
els.closeHomeMenu.addEventListener("click", hideHomeMenu);
els.closeVillage?.addEventListener("click", hideVillageMenu);
els.closeTravelMap?.addEventListener("click", () => {
  hideTravelMapMenu();
  if (state?.world?.travelCamp?.active) showHomeMenu();
});
els.closeStore.addEventListener("click", hideStoreMenu);
els.backStoreVillage?.addEventListener("click", () => {
  hideStoreMenu();
  showVillageMenu();
});
els.goVillage?.addEventListener("click", showVillageMenu);
els.buildHome?.addEventListener("click", showHomeBuilder);
els.goTravel?.addEventListener("click", showTravelMapMenu);
els.goAdventure?.addEventListener("click", () => setHomeMenuPanel("adventure"));
els.goBarrowCrown?.addEventListener("click", () => void startCampaignDungeon("barrow-crown"));
els.goThornwoodPact?.addEventListener("click", () => void startCampaignDungeon("thornwood-pact"));
els.goEmberveinFirstClaim?.addEventListener("click", () => void startCampaignDungeon("embervein-first-claim"));
els.goDwarvenSmithyEmberOath?.addEventListener("click", () => void startCampaignDungeon("dwarven-smithy-ember-oath"));
els.goNewDungeon?.addEventListener("click", startNewDungeonWithHero);
els.levelUp.addEventListener("click", levelUpHero);
els.replaceRangerCompanion?.addEventListener("click", () => void replaceDeadBeastMasterCompanion());
els.storeMenu.addEventListener("click", (event) => {
  if (event.target === els.storeMenu) {
    hideStoreMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "back-to-village") {
    hideStoreMenu();
    showVillageMenu();
    return;
  }
  if (button?.dataset.action === "inspect-npc") {
    showNpcInspection(button.dataset.npc);
    return;
  }
  if (button?.dataset.action === "buy-store-item") {
    buyStoreItem(button.dataset.item);
  }
  if (button?.dataset.action === "sell-store-item") {
    sellStoreItem(button.dataset.item);
  }
  if (button?.dataset.action === "accept-smith-commission") {
    acceptSmithMaterialCommission(button.dataset.npc);
  }
  if (button?.dataset.action === "complete-smith-commission") {
    completeSmithMaterialCommission(button.dataset.npc);
  }
  if (button?.dataset.action === "accept-borren-claim-hammer") {
    acceptBorrenClaimHammerQuest();
  }
  if (button?.dataset.action === "complete-borren-claim-hammer") {
    completeBorrenClaimHammerQuest();
  }
  if (button?.dataset.action === "apothecary-cure-disease") {
    apothecaryCureDisease(button.dataset.hero, button.dataset.disease);
  }
  if (button?.dataset.action === "wizard-remove-curse") {
    wizardRemoveCurse(button.dataset.hero, { itemId: button.dataset.item || null, effectId: button.dataset.effect || null });
  }
});
els.storeMenu.addEventListener("input", (event) => {
  if (event.target.id !== "store-search") return;
  storeSearch = event.target.value;
  renderStoreMenu();
  const searchInput = els.storeMenu.querySelector("#store-search");
  searchInput?.focus();
  searchInput?.setSelectionRange(searchInput.value.length, searchInput.value.length);
});
let gameDialogPointerStartedInside = false;
els.gameDialog.addEventListener("pointerdown", (event) => {
  gameDialogPointerStartedInside = event.target !== els.gameDialog;
});
els.gameDialog.addEventListener("click", (event) => {
  if (gameDialogPointerStartedInside) {
    gameDialogPointerStartedInside = false;
    return;
  }
  if (event.target === els.gameDialog && activeDialogCancel) {
    activeDialogCancel();
  }
});
els.homeMenu.addEventListener("click", (event) => {
  if (event.target === els.homeMenu && !state?.world?.travelCamp?.active) {
    hideHomeMenu();
    return;
  }
  const button = event.target.closest("button");
    if (button?.dataset.action === "camp-add-furniture") {
      addTravelCampFurniture(button.dataset.hero, button.dataset.furniture);
      return;
    }
    if (button?.dataset.action === "buy-camp-gear") {
      buyTravelCampGear(button.dataset.hero, button.dataset.furniture);
      return;
    }
    if (button?.dataset.action === "inn-buy-refreshment") {
      travelBuyInnRefreshment(button.dataset.refreshment);
      return;
    }
    if (button?.dataset.action === "open-party-inventory") {
      openPartyInventory();
      return;
    }
    if (button?.dataset.homeMenu) {
      setHomeMenuPanel(button.dataset.homeMenu);
      return;
    }
    if (button?.dataset.randomDungeonTheme) {
    void startRandomDungeonWithHero(button.dataset.randomDungeonTheme);
    return;
  }
  if (button?.dataset.oneShotDungeonId) {
    void startOneShotDungeonWithHero(button.dataset.oneShotDungeonId);
    return;
  }
  if (button?.dataset.customDungeonId) {
    void startCustomDungeonWithHero(button.dataset.customDungeonId);
  }
});
els.travelMapMenu?.addEventListener("click", (event) => {
  if (event.target === els.travelMapMenu) {
    hideTravelMapMenu();
  }
});
els.travelMapGrid?.addEventListener("pointerover", (event) => {
  const hex = event.target.closest("[data-travel-row][data-travel-col]");
  if (!hex) return;
  renderTravelMapTooltip(Number(hex.dataset.travelRow), Number(hex.dataset.travelCol), Number(hex.dataset.travelChunkX), Number(hex.dataset.travelChunkY));
});
els.travelMapGrid?.addEventListener("focusin", (event) => {
  const hex = event.target.closest("[data-travel-row][data-travel-col]");
  if (!hex) return;
  renderTravelMapTooltip(Number(hex.dataset.travelRow), Number(hex.dataset.travelCol), Number(hex.dataset.travelChunkX), Number(hex.dataset.travelChunkY));
});
els.travelMapGrid?.addEventListener("click", (event) => {
  if (travelMapAnimating) return;
  if (suppressNextTravelHexClick) {
    suppressNextTravelHexClick = false;
    return;
  }
  const hex = event.target.closest("[data-travel-row][data-travel-col]");
  if (!hex) return;
  handleTravelMapHexSelection(Number(hex.dataset.travelRow), Number(hex.dataset.travelCol), Number(hex.dataset.travelChunkX), Number(hex.dataset.travelChunkY));
});
els.travelMapScroll?.addEventListener("pointerdown", (event) => {
  if (travelMapAnimating) return;
  if (event.button !== 0 || event.target.closest("input, textarea, select, a, #travel-map-event, .panel-actions")) return;
  const rect = els.travelMapScroll.getBoundingClientRect();
  const inHorizontalScrollbar = event.clientY >= rect.bottom - Math.max(12, els.travelMapScroll.offsetHeight - els.travelMapScroll.clientHeight);
  const inVerticalScrollbar = event.clientX >= rect.right - Math.max(12, els.travelMapScroll.offsetWidth - els.travelMapScroll.clientWidth);
  if (inHorizontalScrollbar || inVerticalScrollbar) return;
  const hex = event.target.closest("[data-travel-row][data-travel-col]");
  travelMapPan = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: els.travelMapScroll.scrollLeft,
    scrollTop: els.travelMapScroll.scrollTop,
    hexRow: hex ? Number(hex.dataset.travelRow) : null,
    hexCol: hex ? Number(hex.dataset.travelCol) : null,
    hexChunkX: hex ? Number(hex.dataset.travelChunkX) : null,
    hexChunkY: hex ? Number(hex.dataset.travelChunkY) : null,
    moved: false,
  };
  els.travelMapScroll.setPointerCapture?.(event.pointerId);
  els.travelMapScroll.classList.add("panning");
});
els.travelMapScroll?.addEventListener("pointermove", (event) => {
  if (!travelMapPan || travelMapPan.pointerId !== event.pointerId) return;
  const deltaX = event.clientX - travelMapPan.startX;
  const deltaY = event.clientY - travelMapPan.startY;
  if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) travelMapPan.moved = true;
  els.travelMapScroll.scrollLeft = travelMapPan.scrollLeft - (event.clientX - travelMapPan.startX);
  els.travelMapScroll.scrollTop = travelMapPan.scrollTop - (event.clientY - travelMapPan.startY);
  event.preventDefault();
});
const finishTravelMapPan = (event) => {
  if (!travelMapPan || travelMapPan.pointerId !== event.pointerId) return;
  if (!travelMapPan.moved && travelMapPan.hexRow !== null && travelMapPan.hexCol !== null) {
    handleTravelMapHexSelection(travelMapPan.hexRow, travelMapPan.hexCol, travelMapPan.hexChunkX, travelMapPan.hexChunkY);
    suppressNextTravelHexClick = true;
    window.setTimeout(() => {
      suppressNextTravelHexClick = false;
    }, 0);
  } else if (travelMapPan.moved) {
    suppressNextTravelHexClick = true;
    window.setTimeout(() => {
      suppressNextTravelHexClick = false;
    }, 0);
  }
  els.travelMapScroll.releasePointerCapture?.(event.pointerId);
  els.travelMapScroll.classList.remove("panning");
  travelMapPan = null;
};
els.travelMapScroll?.addEventListener("pointerup", finishTravelMapPan);
els.travelMapScroll?.addEventListener("pointercancel", finishTravelMapPan);
els.travelMapScroll?.addEventListener("wheel", (event) => {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  event.stopPropagation();
  adjustTravelMapZoom(event.deltaY > 0 ? -0.1 : 0.1, travelMapViewportFocus(event.clientX, event.clientY));
}, { passive: false });
els.travelMapScroll?.addEventListener("scroll", positionTravelMapEvent);
els.travelZoomOut?.addEventListener("click", () => adjustTravelMapZoom(-0.1));
els.travelZoomIn?.addEventListener("click", () => adjustTravelMapZoom(0.1));
els.travelZoomSlider?.addEventListener("input", (event) => setTravelMapZoom(Number(event.target.value) / 100));
els.travelGenerateChunks?.addEventListener("click", () => void scoutTravelRouteEdgeChunks());
els.travelClearRoute?.addEventListener("click", () => clearTravelRoute());
els.travelConfirmRoute?.addEventListener("click", confirmTravelRoutePlan);
els.travelStartRoute?.addEventListener("click", travelOneDay);
els.travelCampReviewRoute?.addEventListener("click", showTravelMapMenu);
els.travelCampUseRations?.addEventListener("click", travelUseCampRations);
els.travelCampForage?.addEventListener("click", travelForageForCamp);
els.travelCampHungryRest?.addEventListener("click", travelHungryRestAtCamp);
els.travelCampBuildRoad?.addEventListener("click", buildManualRoadSegmentAtCamp);
els.travelCampClearRoadDanger?.addEventListener("click", () => void travelClearBlockedRoadDanger());
els.travelCampLongRest?.addEventListener("click", travelLongRestAtCamp);
els.travelCampExploreHere?.addEventListener("click", travelStayHereOneDay);
els.travelCampVentureOffTrack?.addEventListener("click", () => travelOneDay({ roadMode: "offroad" }));
els.travelCampContinue?.addEventListener("click", travelOneDay);
els.campHomeReviewRoute?.addEventListener("click", showTravelMapMenu);
els.campHomeUseRations?.addEventListener("click", travelUseCampRations);
els.campHomeForage?.addEventListener("click", travelForageForCamp);
els.campHomeHungryRest?.addEventListener("click", travelHungryRestAtCamp);
els.campHomeBuildRoad?.addEventListener("click", buildManualRoadSegmentAtCamp);
els.campHomeClearRoadDanger?.addEventListener("click", () => void travelClearBlockedRoadDanger());
els.campHomeLongRest?.addEventListener("click", travelLongRestAtCamp);
els.campHomeExploreHere?.addEventListener("click", travelStayHereOneDay);
els.campHomeVentureOffTrack?.addEventListener("click", () => travelOneDay({ roadMode: "offroad" }));
els.campHomeContinue?.addEventListener("click", travelOneDay);
els.closeTravelCamp?.addEventListener("click", hideTravelCampMenu);
els.travelCampMenu?.addEventListener("click", (event) => {
  if (event.target === els.travelCampMenu) {
    hideTravelCampMenu();
    return;
  }
  const button = event.target.closest("button");
  if (button?.dataset.action === "open-party-inventory") openPartyInventory();
});
els.villageMenu?.addEventListener("click", (event) => {
  if (event.target === els.villageMenu) {
    hideVillageMenu();
    return;
  }
  const button = event.target.closest("button");
  if (button?.dataset.action === "visit-village-npc") {
    visitVillageNpc(button.dataset.npc);
  }
  if (button?.dataset.action === "visit-settlement-faction") {
    visitSettlementFaction(button.dataset.npc);
  }
  if (button?.dataset.action === "visit-tavern-guest") {
    visitTavernGuest(button.dataset.guest);
  }
  if (button?.dataset.action === "tavern-walk-to-guest") {
    void tavernWalkToGuestAndTalk(button.dataset.guest);
  }
  if (button?.dataset.action === "tavern-chat-guest") {
    tavernChatWithGuest(button.dataset.guest);
  }
  if (button?.dataset.action === "tavern-chat-option") {
    window.tavernChooseGuestChatOption?.(button.dataset.guest, button.dataset.option);
  }
  if (button?.dataset.action === "tavern-finish-chat-guest") {
    tavernFinishGuestChat(button.dataset.guest);
  }
  if (button?.dataset.action === "tavern-barkeeper-guests") {
    tavernBarkeeperChatGuests();
  }
  if (button?.dataset.action === "tavern-faction-check") {
    tavernFactionCheck(button.dataset.guest);
  }
  if (button?.dataset.action === "tavern-faction-explain") {
    tavernFactionExplain(button.dataset.guest);
  }
  if (button?.dataset.action === "tavern-buy-guest-item") {
    tavernBuyGuestItem(button.dataset.guest, button.dataset.item);
  }
  if (button?.dataset.action === "tavern-recruit-guest") {
    tavernRecruitGuest(button.dataset.guest);
  }
  if (button?.dataset.action === "tavern-complete-material-ask") {
    tavernCompleteMaterialAsk(button.dataset.guest);
  }
  if (button?.dataset.action === "tavern-complete-monster-ask") {
    tavernCompleteMonsterAsk(button.dataset.guest);
  }
  if (button?.dataset.action === "tavern-ask-rumor") {
    window.tavernAskRumor?.(button.dataset.guest);
  }
  if (button?.dataset.action === "inn-buy-refreshment") {
    travelBuyInnRefreshment(button.dataset.refreshment);
    renderTavernBarkeeperMenu();
  }
  if (button?.dataset.action === "camp-use-rations") {
    travelUseCampRations();
    renderTavernBarkeeperMenu();
  }
  if (button?.dataset.action === "inn-hungry-fallback") {
    travelInnTryHungryFallback();
    renderTavernBarkeeperMenu();
  }
  if (button?.dataset.action === "open-graveyard") {
    renderGraveyardMenu();
  }
  if (button?.dataset.action === "open-teleport-circles") {
    renderTeleportCirclesMenu();
  }
  if (button?.dataset.action === "teleport-circle") {
    teleportToKnownCircle(button.dataset.circle);
  }
  if (button?.dataset.action === "open-camp-gear") {
    renderVillageCampGearMenu();
  }
  if (button?.dataset.action === "open-home-decor") {
    renderVillageHomeDecorMenu();
  }
  if (button?.dataset.action === "buy-camp-gear") {
    buyTravelCampGear(button.dataset.hero, button.dataset.furniture);
    renderVillageCampGearMenu();
  }
  if (button?.dataset.action === "buy-home-decor") {
    buyHomeDecorFurniture(button.dataset.furniture);
  }
  if (button?.dataset.action === "open-settlement-storefront") {
    renderSettlementStorefrontMenu(button.dataset.storefront);
  }
  if (button?.dataset.action === "open-settlement-quest-board") {
    renderSettlementQuestBoardMenu();
  }
  if (button?.dataset.action === "accept-settlement-board-quest") {
    acceptSettlementBoardQuest(button.dataset.quest);
  }
  if (button?.dataset.action === "claim-settlement-board-quest") {
    claimSettlementBoardQuest(button.dataset.quest);
  }
  if (button?.dataset.action === "buy-settlement-stock") {
    buySettlementStorefrontStock(button.dataset.storefront, button.dataset.stock);
  }
  if (button?.dataset.action === "settlement-cure-disease") {
    settlementCureDisease(button.dataset.hero, button.dataset.disease, button.dataset.storefront);
  }
  if (button?.dataset.action === "settlement-treat-exhaustion") {
    settlementTreatExhaustion(button.dataset.hero, button.dataset.storefront);
  }
  if (button?.dataset.action === "settlement-revive-corpse") {
    settlementReviveCorpse(button.dataset.corpse, button.dataset.rite, button.dataset.storefront);
  }
  if (button?.dataset.action === "back-to-settlement-list") {
    renderSettlementMenu();
  }
  if (button?.dataset.action === "settlement-return-inn") {
    hideVillageMenu();
    showHomeMenu();
  }
  if (button?.dataset.action === "open-party-inventory") {
    openPartyInventory();
  }
  if (button?.dataset.action === "inspect-npc") {
    showNpcInspection(button.dataset.npc);
  }
  if (button?.dataset.action === "back-to-village-list") {
    renderVillageMenu();
  }
  if (button?.dataset.action === "return-npc-visit") {
    returnToNpcVisit(button.dataset.npc);
  }
  if (button?.dataset.action === "accept-npc-quest") {
    acceptNpcQuest(button.dataset.npc, button.dataset.quest);
  }
  if (button?.dataset.action === "complete-npc-quest") {
    completeNpcQuest(button.dataset.npc, button.dataset.quest);
  }
  if (button?.dataset.action === "accept-guild-contract") {
    if (button.dataset.npc === "monster-guild") acceptMonsterHunterContract(button.dataset.contract);
    if (button.dataset.npc === "gravebinders") acceptGravebinderContract(button.dataset.contract);
    if (button.dataset.npc === "crucible-collegium") acceptCrucibleContract(button.dataset.contract);
    if (button.dataset.npc === "antiquarian-society") acceptAntiquarianContract(button.dataset.contract);
    if (button.dataset.npc === "expedition-board") acceptExpeditionContract(button.dataset.contract);
    if (button.dataset.npc === "boom-club") acceptBoomClubContract(button.dataset.contract);
  }
  if (button?.dataset.action === "complete-guild-contract") {
    if (button.dataset.npc === "monster-guild") completeMonsterHunterContract(button.dataset.contract);
    if (button.dataset.npc === "gravebinders") completeGravebinderContract(button.dataset.contract);
    if (button.dataset.npc === "crucible-collegium") completeCrucibleContract(button.dataset.contract);
    if (button.dataset.npc === "antiquarian-society") completeAntiquarianContract(button.dataset.contract);
    if (button.dataset.npc === "expedition-board") completeExpeditionContract(button.dataset.contract);
    if (button.dataset.npc === "boom-club") completeBoomClubContract(button.dataset.contract);
  }
  if (button?.dataset.action === "complete-guild-turn-in") {
    if (button.dataset.npc === "monster-guild") completeMonsterHunterTurnIn(button.dataset.turnIn);
    if (button.dataset.npc === "gravebinders") completeGravebinderTurnIn(button.dataset.turnIn);
    if (button.dataset.npc === "crucible-collegium") completeCrucibleTurnIn(button.dataset.turnIn);
    if (button.dataset.npc === "antiquarian-society") completeAntiquarianTurnIn(button.dataset.turnIn);
    if (button.dataset.npc === "expedition-board") completeExpeditionTurnIn(button.dataset.turnIn);
    if (button.dataset.npc === "boom-club") completeBoomClubTurnIn(button.dataset.turnIn);
  }
  if (button?.dataset.action === "hire-gravebinder-recruit") {
    hireGravebinderRecruit(button.dataset.recruit);
  }
  if (button?.dataset.action === "accept-road-project") {
    acceptExpeditionRoadProject(button.dataset.project);
  }
  if (button?.dataset.action === "claim-road-project") {
    claimExpeditionRoadProject(button.dataset.project);
  }
  if (button?.dataset.action === "buy-road-kit") {
    buyExpeditionRoadKit();
  }
  if (button?.dataset.action === "start-expedition-milepost") {
    void startExpeditionMilepostMission(button.dataset.index);
  }
  if (button?.dataset.action === "buy-faction-set-item") {
    buyFactionSetItem(button.dataset.faction, button.dataset.item, button.dataset.method);
  }
  if (button?.dataset.action === "set-monster-hunter-panel") {
    setMonsterHunterBoardPanel(button.dataset.panel);
  }
  if (button?.dataset.action === "set-gravebinder-panel") {
    setGravebinderBoardPanel(button.dataset.panel);
  }
  if (button?.dataset.action === "set-crucible-panel") {
    setCrucibleBoardPanel(button.dataset.panel);
  }
  if (button?.dataset.action === "set-antiquarian-panel") {
    setAntiquarianBoardPanel(button.dataset.panel);
  }
  if (button?.dataset.action === "set-compact-guild-panel") {
    window.DungeonNpcBehaviors?.[button.dataset.faction]?.setBoardPanel?.(button.dataset.panel);
  }
  if (button?.dataset.action === "set-fighting-pit-panel") {
    setFightingPitBoardPanel(button.dataset.panel);
  }
  if (button?.dataset.action === "admin-faction-rank") {
    setFactionAdminRank(button.dataset.faction, button.dataset.direction);
  }
  if (button?.dataset.action === "show-quest-log") {
    showQuestLog();
  }
  if (button?.dataset.action === "start-fighting-pit") {
    void startFightingPitRun();
  }
  if (button?.dataset.action === "start-npc-chat") {
    startNpcChat(button.dataset.npc, button.dataset.chatState);
  }
  if (button?.dataset.action === "npc-chat-option") {
    useNpcChatOption(button.dataset.npc, button.dataset.chatState, button.dataset.option);
  }
  if (button?.dataset.action === "close-village") {
    hideVillageMenu();
    showHomeMenu();
  }
  if (button?.dataset.action === "loot-corpse-item") {
    lootCorpseItem(button.dataset.corpse, button.dataset.item);
  }
  if (button?.dataset.action === "loot-corpse-money") {
    lootCorpseMoney(button.dataset.corpse);
  }
  if (button?.dataset.action === "cast-corpse-spell") {
    castCorpseSpell(button.dataset.corpse, button.dataset.caster, button.dataset.spell);
  }
});
els.useItemMenu.addEventListener("click", (event) => {
  if (event.target === els.useItemMenu) {
    hideUseItemMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "use-belt-item") {
    useBeltItem(button.dataset.item, button.dataset.target ?? null);
  }
});
els.actionMenu.addEventListener("click", (event) => {
  if (event.target === els.actionMenu) {
    hideActionMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "grab-target") {
    void useGrabAction(button.dataset.grabKind, button.dataset.grabId);
    return;
  }
  if (button?.dataset.action === "release-grab") {
    releaseGrabForFighter();
    return;
  }
  if (button?.dataset.action === "toggle-ability-favorite") {
    toggleAbilityFavorite(button.dataset.favoriteKey);
    return;
  }
  if (button?.dataset.action === "combat-action") {
    void useCombatAction(button.dataset.combatAction, button.dataset.target ?? null);
  }
});
els.favoriteActionsMenu?.addEventListener("click", (event) => {
  if (event.target === els.favoriteActionsMenu) {
    hideFavoriteActionsMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "toggle-ability-favorite") {
    toggleAbilityFavorite(button.dataset.favoriteKey);
    return;
  }
  if (button?.dataset.action === "move-ability-favorite") {
    moveAbilityFavorite(button.dataset.favoriteKey, Number(button.dataset.direction) || 0);
    return;
  }
  if (button?.dataset.action === "grab-target") {
    void useGrabAction(button.dataset.grabKind, button.dataset.grabId);
    return;
  }
  if (button?.dataset.action === "release-grab") {
    releaseGrabForFighter();
    return;
  }
  if (button?.dataset.action === "combat-action") {
    hideFavoriteActionsMenu();
    void useCombatAction(button.dataset.combatAction, button.dataset.target ?? null);
    return;
  }
  if (button?.dataset.action === "use-fighter-ability") {
    hideFavoriteActionsMenu();
    void useFighterAbility(button.dataset.ability);
    return;
  }
  if (button?.dataset.action === "cast-spell") {
    hideFavoriteActionsMenu();
    void chooseAndCastSpell(button.dataset.spell, button.dataset.castLevel);
    return;
  }
  if (button?.dataset.action === "dismiss-spell-effect") {
    hideFavoriteActionsMenu();
    dismissSpellEffect(button.dataset.spell);
  }
});
els.abilitiesMenu.addEventListener("click", (event) => {
  if (event.target === els.abilitiesMenu) {
    hideAbilitiesMenu();
    return;
  }

  const button = event.target.closest("button");
  if (event.target.closest("summary")) {
    trackAbilityMenuSectionToggle(event.target);
  }
  if (button?.dataset.action === "toggle-ability-favorite") {
    toggleAbilityFavorite(button.dataset.favoriteKey);
    return;
  }
  if (button?.dataset.action === "move-ability-favorite") {
    moveAbilityFavorite(button.dataset.favoriteKey, Number(button.dataset.direction) || 0);
    return;
  }
  if (button?.dataset.action === "use-fighter-ability") {
    void useFighterAbility(button.dataset.ability);
  }
  if (button?.dataset.action === "cast-spell") {
    void chooseAndCastSpell(button.dataset.spell, button.dataset.castLevel);
    return;
  }
  if (button?.dataset.action === "dismiss-spell-effect") {
    dismissSpellEffect(button.dataset.spell);
  }
});
els.inventoryMenu.addEventListener("click", (event) => {
  if (event.target === els.inventoryMenu) {
    hideInventoryMenu();
    return;
  }

  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "inventory-tab") {
    setInventoryTab(button.dataset.inventoryTab);
    return;
  }
  if (button.dataset.action === "toggle-admin") {
    if (!adminEnabled()) return;
    inventoryAdminOpen = !inventoryAdminOpen;
    if (inventoryAdminOpen) setInventoryTab("vault");
    else if (activeInventoryTab === "vault") setInventoryTab("equipment");
    else renderInventoryMenu();
  }
  if (button.dataset.action === "toggle-admin-teleport") {
    handleAdminQuickAction(button.dataset.action);
  }
  if (button.dataset.action === "toggle-admin-god") {
    handleAdminQuickAction(button.dataset.action);
  }
  if (button.dataset.action === "toggle-admin-monsters") {
    adminMonsterCatalogOpen = !adminMonsterCatalogOpen;
    renderInventoryMenu();
  }
  if (button.dataset.action === "toggle-admin-progress") {
    adminProgressOpen = !adminProgressOpen;
    renderInventoryMenu();
  }
  if (button.dataset.action === "set-admin-progress") {
    setNpcAdminProgress(button.dataset.npc, button.dataset.progress);
  }
  if (button.dataset.action === "set-admin-campaign-progress") {
    setAdminCampaignProgress(button.dataset.campaign, button.dataset.progress);
    renderInventoryMenu();
  }
  if (button.dataset.action === "admin-heal") {
    handleAdminQuickAction(button.dataset.action);
  }
  if (button.dataset.action === "admin-refresh") {
    handleAdminQuickAction(button.dataset.action);
  }
  if (button.dataset.action === "admin-reveal-current-room") {
    handleAdminQuickAction(button.dataset.action);
  }
  if (button.dataset.action === "admin-open-visible-doors") {
    handleAdminQuickAction(button.dataset.action);
  }
  if (button.dataset.action === "admin-collect-visible-loot") {
    handleAdminQuickAction(button.dataset.action);
  }
  if (button.dataset.action === "admin-clear-combat") {
    handleAdminQuickAction(button.dataset.action);
  }
  if (button.dataset.action === "spawn-admin-monster") {
    spawnAdminMonster(button.dataset.monster);
  }
  if (button.dataset.action === "add-admin-item") {
    if (!adminEnabled()) return;
    addAdminItemToInventory(button.dataset.item);
  }
  if (button.dataset.action === "add-admin-coins") {
    if (!adminEnabled()) return;
    addAdminCoins(Number(button.dataset.cp));
  }
  if (button.dataset.action === "add-admin-hero-tokens") {
    if (!adminEnabled()) return;
    addAdminHeroTokens(Number(button.dataset.tokens));
  }
  if (button.dataset.action === "inspect-party-resource") {
    showPartyResourceInfo(button.dataset.item);
  }
  if (button.dataset.action === "toggle-quest-satchel") {
    questSatchelOpen = !questSatchelOpen;
    renderInventoryMenu();
  }
  if (button.dataset.action === "add-admin-xp") {
    if (!adminEnabled()) return;
    addAdminXp(Number(button.dataset.xp));
  }
  if (button.dataset.action === "deposit-coins") {
    moveMoneyBetweenHeroAndChest("deposit", Number(button.dataset.cp));
  }
  if (button.dataset.action === "withdraw-coins") {
    moveMoneyBetweenHeroAndChest("withdraw", Number(button.dataset.cp));
  }
  if (button.dataset.action === "deposit-custom-coins") {
    moveCustomMoneyBetweenHeroAndChest("deposit");
  }
  if (button.dataset.action === "withdraw-custom-coins") {
    moveCustomMoneyBetweenHeroAndChest("withdraw");
  }
  if (button.dataset.action === "unequip") {
    unequipSlot(button.dataset.slot);
  }
  if (button.dataset.action === "equip") {
    equipItem(button.dataset.item, button.dataset.slot);
  }
  if (button.dataset.action === "attune-item") {
    changeItemAttunement(activeHero(), button.dataset.item, true);
  }
  if (button.dataset.action === "unattune-item") {
    changeItemAttunement(activeHero(), button.dataset.item, false);
  }
  if (button.dataset.action === "inspect-item") {
    showInventoryItemInfo(button.dataset.item);
  }
  if (button.dataset.action === "use-carried-consumable") {
    useCarriedConsumable(button.dataset.item);
  }
  if (button.dataset.action === "give-item") {
    const select = button.closest(".equip-actions")?.querySelector("select[data-transfer-target]");
    transferInventoryItem(button.dataset.item, select?.value);
  }
});
els.inventoryMenu.addEventListener("input", (event) => {
  if (event.target.id === "admin-item-search") {
    inventoryAdminSearch = event.target.value;
  } else if (event.target.id === "admin-monster-search") {
    adminMonsterSearch = event.target.value;
  } else {
    return;
  }
  renderInventoryMenu();
  const searchInput = els.inventoryMenu.querySelector(`#${event.target.id}`);
  searchInput?.focus();
  searchInput?.setSelectionRange(searchInput.value.length, searchInput.value.length);
});
els.inventoryMenu.addEventListener("dragstart", handleInventoryDragStart);
els.inventoryMenu.addEventListener("dragover", handleInventoryDragOver);
els.inventoryMenu.addEventListener("dragleave", handleInventoryDragLeave);
els.inventoryMenu.addEventListener("drop", handleInventoryDrop);
els.inventoryMenu.addEventListener("dragend", handleInventoryDragEnd);
els.roomScroll.addEventListener("pointerdown", handleMapPanPointerDown);
els.roomScroll.addEventListener("pointermove", handleMapPanPointerMove);
els.roomScroll.addEventListener("pointerup", finishMapPan);
els.roomScroll.addEventListener("pointercancel", finishMapPan);
els.roomScroll.addEventListener("touchstart", beginRoomPinchZoom, { passive: false });
els.roomScroll.addEventListener("touchmove", updateRoomPinchZoom, { passive: false });
els.roomScroll.addEventListener("touchend", finishRoomPinchZoom);
els.roomScroll.addEventListener("touchcancel", finishRoomPinchZoom);
els.roomScroll.addEventListener("scroll", () => {
  if (interactiveTutorialActive) updateInteractiveTutorial();
});
window.addEventListener("wheel", handleDungeonCtrlWheelZoom, { passive: false, capture: true });
window.addEventListener("resize", () => {
  if (interactiveTutorialActive) updateInteractiveTutorial();
});
window.addEventListener(
  "pointerdown",
  () => {
    updateBackgroundMusic();
  },
  { capture: true },
);
els.roomScroll.addEventListener("contextmenu", (event) => {
  if (pendingSpellTargeting || pendingEldritchBlast) {
    event.preventDefault();
    event.stopPropagation();
    if (pendingSpellTargeting) clearPendingSpellTargeting();
    if (pendingEldritchBlast) cancelPendingEldritchBlast();
  }
});
window.addEventListener("dungeon-save-slots-updated", () => {
  if (!els.mainMenu.classList.contains("hidden")) updateSaveStatus();
});
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearHeldMovementKeys();
    if (pendingSpellTargeting) {
      clearPendingSpellTargeting();
      return;
    }
    if (pendingEldritchBlast) {
      cancelPendingEldritchBlast();
      return;
    }
    if (activeDialogCancel) {
      activeDialogCancel();
      return;
    }
    hideFighterInfo();
    hideInventoryMenu();
    hideUseItemMenu();
    hideAbilitiesMenu();
    hideActionMenu();
    hideFavoriteActionsMenu();
    if (!state?.world?.travelCamp?.active) hideHomeMenu();
    hideTravelMapMenu();
    hideStoreMenu();
    return;
  }

  const overlayOpen = [els.mainMenu, els.fighterInfo, els.inventoryMenu, els.useItemMenu, els.actionMenu, els.favoriteActionsMenu, els.abilitiesMenu, state?.world?.travelCamp?.active ? null : els.homeMenu, els.travelMapMenu, els.storeMenu].some(
    (element) => element && !element.classList.contains("hidden"),
  );
  const key = event.key.toLowerCase();
  const target = event.target;
  const typing = target?.matches?.("input, textarea, select") || target?.isContentEditable;
  const favoriteMenuOpen = !els.favoriteActionsMenu?.classList.contains("hidden");
  if (key === "i" && gameHasStarted && !activeDialogCancel) {
    if (!typing && !event.ctrlKey && !event.altKey && !event.metaKey) {
      if (overlayOpen && els.inventoryMenu.classList.contains("hidden")) return;
      event.preventDefault();
      if (els.inventoryMenu.classList.contains("hidden")) {
        showInventoryMenu();
      } else {
        hideInventoryMenu();
      }
      return;
    }
  }
  if (key === "j" && gameHasStarted && !activeDialogCancel) {
    if (!typing && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      toggleQuestLog();
      return;
    }
  }
  if (key === "j" && gameHasStarted && questLogIsOpen()) {
    event.preventDefault();
    toggleQuestLog();
    return;
  }
  if (key === "f" && gameHasStarted && !activeDialogCancel && !typing && !event.ctrlKey && !event.altKey && !event.metaKey) {
    if (overlayOpen && !favoriteMenuOpen) return;
    if (els.favoriteActions.disabled && !favoriteMenuOpen) return;
    event.preventDefault();
    if (favoriteMenuOpen) hideFavoriteActionsMenu();
    else showFavoriteActionsMenu();
    return;
  }
  if (/^[1-9]$/.test(key) && gameHasStarted && !activeDialogCancel && !typing && !event.ctrlKey && !event.altKey && !event.metaKey) {
    if (overlayOpen && !favoriteMenuOpen) return;
    if (els.favoriteActions.disabled && !favoriteMenuOpen) return;
    event.preventDefault();
    useFavoriteActionByIndex(Number(key) - 1);
    return;
  }
  if (activeDialogCancel || overlayOpen || event.ctrlKey || event.altKey || event.metaKey) return;
  if (typing) return;

  const movementDelta = movementDeltaForKey(key);
  if (movementDelta) {
    event.preventDefault();
    startHeldMovement(key, movementDelta);
    return;
  }
  if (key === "tab" && cycleAttackTarget()) {
    event.preventDefault();
    return;
  }
  if (key === "r" && !els.rollInitiative.disabled) {
    event.preventDefault();
    rollInitiative();
  }
  if (key === "x" && !els.actionButton.disabled) {
    event.preventDefault();
    showActionMenu();
  }
  if (key === "t" && !els.attack.disabled) {
    event.preventDefault();
    void performAttackWithPrompt();
  }
  if (key === "u" && !els.useItem.disabled) {
    event.preventDefault();
    showUseItemMenu();
  }
  if (key === "b" && !els.abilities.disabled) {
    event.preventDefault();
    showAbilitiesMenu();
  }
  if (key === "q" && els.selectParty && !els.selectParty.disabled) {
    event.preventDefault();
    selectActivePartyForMovement();
    return;
  }
  if (key === "q" && !els.shortRest.disabled) {
    event.preventDefault();
    takeShortRest();
    return;
  }
  if (key === "h" && !els.returnHome.disabled) {
    event.preventDefault();
    if (state.mode === "combat") {
      fleeCombat();
    } else {
      returnHomeEarly();
    }
  }
  if (key === "e" && !els.endTurn.disabled) {
    event.preventDefault();
    endTurn();
  }
});

window.addEventListener("keyup", (event) => {
  stopHeldMovement(event.key.toLowerCase());
});

window.addEventListener("blur", clearHeldMovementKeys);

Promise.allSettled([window.DungeonSave.ready, loadPredefinedHeroTokenArt()]).finally(() => {
  renderControls();
  updateSaveStatus();
});
applyButtonTheme(buttonTheme);
applySaveRollMode(saveRollMode);
state = createInitialState();
render();
showMainMenu();
