
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
  renderRoom();
  renderHeroStatusCard(els.heroCard, activeHero());
  activateFledMonstersWithLineOfSight();
  renderInitiative();
  renderLog();
  renderControls();
  scheduleInitiativePromptIfNeeded();
  updateInteractiveTutorial();
  perfStats.renderMs = performance.now() - renderStart;
  updatePerfOverlay();
}

els.rollInitiative.addEventListener("click", rollInitiative);
els.selectParty?.addEventListener("click", selectActivePartyForMovement);
els.attack.addEventListener("click", () => {
  const target = attackTarget();
  if (target) {
    if (objectIsDestructible(target)) attackDestructibleObject(activeFighter(), target);
    else makeAttack(activeFighter(), target);
  }
});
els.actionButton.addEventListener("click", showActionMenu);
els.useItem.addEventListener("click", showUseItemMenu);
els.abilities.addEventListener("click", showAbilitiesMenu);
els.shortRest.addEventListener("click", takeShortRest);
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
els.newGame.addEventListener("click", () => {
  showMainMenu();
});
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
  addLog(adminMode ? "Adminmode enabled." : "Adminmode disabled.", "important");
  render();
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
els.manageTokenArt?.addEventListener("click", showTokenArtManager);
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

  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "take-object-item") {
    takeObjectItem(button.dataset.object, button.dataset.item);
  }
  if (button.dataset.action === "pick-lock") {
    pickObjectLock(button.dataset.object);
  }
  if (button.dataset.action === "disarm-trap") {
    disarmTrap(button.dataset.object);
  }
  if (button.dataset.action === "investigate-object") {
    investigateObject(button.dataset.object);
  }
  if (button.dataset.action === "attack-object") {
    attackDestructibleObject(state.mode === "combat" ? activeFighter() : activeHero(), dungeonObjectForId(button.dataset.object));
  }
  if (button.dataset.action === "free-captive") {
    freeCaptiveCreature(button.dataset.object);
  }
  if (button.dataset.action === "home-store-item") {
    storeHomeChestItem(button.dataset.item);
  }
  if (button.dataset.action === "home-store-all-items") {
    storeAllHomeChestItems();
  }
  if (button.dataset.action === "home-take-all-items") {
    takeAllHomeChestItems();
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
  if (button.dataset.action === "create-roster-hero") {
    createRosterHero();
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
  const select = event.target.closest("select[data-action='party-role']");
  if (!select) return;
  setHeroRole(select.dataset.hero, select.value);
  showPlanningTableInfo();
});
els.closeInventory.addEventListener("click", hideInventoryMenu);
els.closeUseItem.addEventListener("click", hideUseItemMenu);
els.closeActionMenu.addEventListener("click", hideActionMenu);
els.closeAbilities.addEventListener("click", hideAbilitiesMenu);
els.closeHomeMenu.addEventListener("click", hideHomeMenu);
els.closeStore.addEventListener("click", hideStoreMenu);
els.goStore.addEventListener("click", showStoreMenu);
els.goBarrowCrown?.addEventListener("click", () => void startCampaignDungeon("barrow-crown"));
els.goThornwoodPact?.addEventListener("click", () => void startCampaignDungeon("thornwood-pact"));
els.goNewDungeon.addEventListener("click", startNewDungeonWithHero);
els.levelUp.addEventListener("click", levelUpHero);
els.storeMenu.addEventListener("click", (event) => {
  if (event.target === els.storeMenu) {
    hideStoreMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "buy-store-item") {
    buyStoreItem(button.dataset.item);
  }
  if (button?.dataset.action === "sell-store-item") {
    sellStoreItem(button.dataset.item);
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
  if (event.target === els.homeMenu) {
    hideHomeMenu();
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
  if (button?.dataset.action === "combat-action") {
    useCombatAction(button.dataset.combatAction, button.dataset.target ?? null);
  }
});
els.abilitiesMenu.addEventListener("click", (event) => {
  if (event.target === els.abilitiesMenu) {
    hideAbilitiesMenu();
    return;
  }

  const button = event.target.closest("button");
  if (button?.dataset.action === "use-fighter-ability") {
    void useFighterAbility(button.dataset.ability);
  }
  if (button?.dataset.action === "cast-spell") {
    void chooseAndCastSpell(button.dataset.spell, button.dataset.castLevel);
  }
});
els.inventoryMenu.addEventListener("click", (event) => {
  if (event.target === els.inventoryMenu) {
    hideInventoryMenu();
    return;
  }

  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.action === "toggle-admin") {
    if (!adminEnabled()) return;
    inventoryAdminOpen = !inventoryAdminOpen;
    renderInventoryMenu();
  }
  if (button.dataset.action === "toggle-admin-teleport") {
    adminTeleportEnabled = !adminTeleportEnabled;
    addLog(adminTeleportEnabled ? "Admin teleport enabled." : "Admin teleport disabled.", "important");
    render();
    renderInventoryMenu();
  }
  if (button.dataset.action === "toggle-admin-god") {
    adminGodMode = !adminGodMode;
    addLog(adminGodMode ? "God mode enabled." : "God mode disabled.", "important");
    render();
    renderInventoryMenu();
  }
  if (button.dataset.action === "toggle-admin-monsters") {
    adminMonsterCatalogOpen = !adminMonsterCatalogOpen;
    renderInventoryMenu();
  }
  if (button.dataset.action === "admin-heal") {
    adminFullHeal();
  }
  if (button.dataset.action === "admin-refresh") {
    adminRefreshActions();
  }
  if (button.dataset.action === "admin-reveal-current-room") {
    adminRevealCurrentRoom();
  }
  if (button.dataset.action === "admin-clear-combat") {
    adminClearCombat();
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
  if (button.dataset.action === "inspect-item") {
    showInventoryItemInfo(button.dataset.item);
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
    hideHomeMenu();
    hideStoreMenu();
    return;
  }

  const overlayOpen = [els.mainMenu, els.fighterInfo, els.inventoryMenu, els.useItemMenu, els.abilitiesMenu, els.homeMenu, els.storeMenu].some(
    (element) => !element.classList.contains("hidden"),
  );
  const key = event.key.toLowerCase();
  if (key === "i" && gameHasStarted && !activeDialogCancel) {
    const target = event.target;
    if (!target?.matches?.("input, textarea, select") && !target?.isContentEditable && !event.ctrlKey && !event.altKey && !event.metaKey) {
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
  if (activeDialogCancel || overlayOpen || event.ctrlKey || event.altKey || event.metaKey) return;
  const target = event.target;
  if (target?.matches?.("input, textarea, select") || target?.isContentEditable) return;

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
    const targetFighter = attackTarget();
    if (targetFighter) {
      if (objectIsDestructible(targetFighter)) attackDestructibleObject(activeFighter(), targetFighter);
      else makeAttack(activeFighter(), targetFighter);
    }
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
state = createInitialState();
render();
showMainMenu();
