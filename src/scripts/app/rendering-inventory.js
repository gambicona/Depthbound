const heroClassTokenColors = {
  barbarian: "#e0452d",
  bard: "#d86df0",
  cleric: "#f0d56d",
  druid: "#65c96f",
  fighter: "#664627",
  monk: "#59c7c9",
  paladin: "#e9cd72",
  ranger: "#7fbf4d",
  rogue: "#8f96a3",
  sorcerer: "#ff6f91",
  warlock: "#9b72ff",
  wizard: "#6fa8ff",
};

function heroClassTokenColor(fighter) {
  return heroClassTokenColors[fighter?.classId] ?? "#c8d7df";
}

function customHeroTokenEntryMatchesFighter(entry, fighter) {
  if (!entry || !fighter) return false;
  const fighterName = String(fighter.name ?? "").trim();
  if (!fighterName || /^new hero$/i.test(fighterName)) return false;
  const names = new Set([
    safeTokenArtName(fighterName, "token"),
    fighterName.toLowerCase(),
    String(fighter.id ?? "").trim().toLowerCase(),
  ].filter(Boolean));
  return [entry.id, entry.name, entry.tokenName, entry.tokenArt?.id, entry.tokenArt?.name]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .some((value) => names.has(value) || [...names].some((name) => value.startsWith(`${name}-`) || value.startsWith(`${name}_`)));
}

function recoverHeroTokenArtFromLibrary(fighter) {
  if (window.DepthboundPlaytest?.role === "guest") return "";
  if (!isRosterHeroId(fighter?.id) || fighter?.tokenArt) return "";
  const entries = loadCustomHeroTokenArt();
  const matching = entries.filter((entry) => customHeroTokenEntryMatchesFighter(entry, fighter));
  const entry = matching[0] ?? null;
  if (!entry) return "";
  const recovered = entry.tokenArt ?? entry.dataUrl ?? "";
  if (recovered) {
    fighter.tokenArt = recovered;
    addLog(`${fighter.name}'s token picture was restored from the custom token library.`, "important");
  }
  return recovered;
}

function clearAccidentalGenericHeroToken(fighter) {
  if (!isRosterHeroId(fighter?.id) || !/^new hero$/i.test(String(fighter.name ?? "").trim())) return;
  const art = fighter.tokenArt;
  const values = [art?.id, art?.name, art?.path, typeof art === "string" ? art : ""]
    .map((value) => String(value ?? "").toLowerCase());
  if (!values.some((value) => value.includes("new_hero_token") || value.includes("new-hero-token"))) return;
  fighter.tokenArt = "";
}

function showCombatantTokenArt(token) {
  const tokenImage = token?.querySelector(".token-art");
  const tokenLabel = token?.querySelector(".token-label");
  tokenImage?.classList.remove("hidden");
  tokenLabel?.classList.add("hidden");
  token?.classList.add("has-token-art");
}

function hideCombatantTokenArt(token) {
  const tokenImage = token?.querySelector(".token-art");
  const tokenLabel = token?.querySelector(".token-label");
  tokenImage?.removeAttribute("src");
  tokenImage?.classList.add("hidden");
  tokenLabel?.classList.remove("hidden");
  token?.classList.remove("has-token-art");
}

function targetSelectionActive() {
  return Boolean(pendingSpellTargeting || pendingEldritchBlast);
}

function suppressInspectionAfterTargetSelection() {
  suppressInspectUntil = performance.now() + 350;
}

function inspectionSuppressedByTargeting() {
  return targetSelectionActive() || performance.now() < suppressInspectUntil;
}

function consumeTokenTargetSelection(event, combatantId) {
  if (!targetSelectionActive()) return false;
  const current = state.fighters[combatantId];
  if (pendingSpellTargeting && current?.position) {
    suppressInspectionAfterTargetSelection();
    void confirmPendingSpellTarget(current.position);
  } else if (pendingEldritchBlast && current?.position) {
    suppressInspectionAfterTargetSelection();
    void confirmPendingEldritchBlast(current.position);
  }
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  return true;
}

const combatantTokenArtCache = new Map();

function combatantTokenArtCacheKey(fighter, art) {
  const artKey =
    typeof art === "string"
      ? art
      : art?.type === "custom-file"
        ? art.path || art.id || art.name || ""
        : art?.id || art?.path || art?.name || "";
  return `${fighter?.id ?? ""}|${artKey}`;
}

function rememberCombatantTokenArt(fighter, art, resolved) {
  if (!fighter?.id || typeof resolved !== "string" || !resolved) return resolved;
  combatantTokenArtCache.set(combatantTokenArtCacheKey(fighter, art), resolved);
  combatantTokenArtCache.set(String(fighter.id), resolved);
  return resolved;
}

function rememberedCombatantTokenArt(fighter, art) {
  if (!fighter?.id) return "";
  return combatantTokenArtCache.get(combatantTokenArtCacheKey(fighter, art)) ?? combatantTokenArtCache.get(String(fighter.id)) ?? "";
}

function forgetCombatantTokenArt(fighter, art) {
  if (!fighter?.id) return;
  combatantTokenArtCache.delete(combatantTokenArtCacheKey(fighter, art));
  combatantTokenArtCache.delete(String(fighter.id));
}

function setCombatantTokenArt(token, art) {
  const tokenImage = token?.querySelector(".token-art");
  if (!tokenImage) return;
  if (typeof art !== "string") art = "";
  if (!art) {
    if (token.classList.contains("has-token-art") && tokenImage.getAttribute("src")) return;
    hideCombatantTokenArt(token);
    return;
  }
  if (tokenImage.getAttribute("src") !== art) {
    const tokenLabel = token.querySelector(".token-label");
    tokenImage.classList.add("hidden");
    tokenLabel?.classList.remove("hidden");
    token.classList.remove("has-token-art");
    tokenImage.src = art;
  }
  if (tokenImage.complete && tokenImage.naturalWidth > 0) {
    showCombatantTokenArt(token);
  }
}

const tokenMovementTimers = new Map();

function updateTokenMovementClass(token, fighter) {
  if (!token || !fighter?.position) return;
  const nextKey = positionKey(fighter.position);
  const previousKey = token.dataset.positionKey;
  token.dataset.positionKey = nextKey;
  if (!previousKey || previousKey === nextKey) return;

  token.classList.add("token-moving");
  const existingTimer = tokenMovementTimers.get(fighter.id);
  if (existingTimer) window.clearTimeout(existingTimer);
  tokenMovementTimers.set(
    fighter.id,
    window.setTimeout(() => {
      token.classList.remove("token-moving");
      tokenMovementTimers.delete(fighter.id);
    }, tokenSlideMs + 90),
  );
}

function heroCanReachWaitingRecruit(recruit, hero = activeHero()) {
  return Boolean(recruit?.dungeonRecruitWaiting && hero?.alive && attackGridDistanceBetweenFighters(hero, recruit) <= 1);
}

async function showWaitingRecruitDialog(recruitId) {
  const recruit = state.fighters?.[recruitId];
  if (!recruit?.dungeonRecruitWaiting) return;
  const hero = activeHero();
  if (!heroCanReachWaitingRecruit(recruit, hero)) {
    addLog(`${hero?.name ?? "A hero"} needs to stand next to ${recruit.name} to speak with them.`, "important");
    render();
    return;
  }
  const dialogue = recruit.recruitDialogue ?? {};
  const choice = await showChoiceDialog({
    title: dialogue.title ?? recruit.name,
    message: dialogue.text ?? `${recruit.name} is waiting here.`,
    actor: recruit,
    choices: [
      { value: "recruit", label: dialogue.recruitLabel ?? "Recruit" },
      { value: dialogBackValue, label: dialogue.backLabel ?? "Back" },
    ],
  });
  if (choice !== "recruit" || !state.fighters?.[recruitId]?.dungeonRecruitWaiting) return;
  recruit.dungeonRecruitWaiting = false;
  state.party.rosterIds = uniqueValues([...(state.party.rosterIds ?? []), recruit.id]);
  if (isClassHero(recruit) && activeClassHeroIds().length >= activeClassHeroLimit()) {
    state.party.maxActiveHeroSlots = Math.max(activeClassHeroLimit(), 5);
  }
  state.party.heroIds = uniqueValues([...(state.party.heroIds ?? []), recruit.id]);
  if (!state.party.activeHeroId) state.party.activeHeroId = recruit.id;
  const marker = (state.dungeonObjects ?? []).find((object) => object.id === recruit.recruitMarkerId);
  if (marker) {
    marker.recruited = true;
    marker.spent = true;
  }
  if (state.mode === "combat" && typeof addMonsterToInitiative === "function") addMonsterToInitiative(recruit);
  addLog(`${recruit.name} joins the party.`, "important");
  render();
}

function createCombatantToken(combatant) {
  const token = document.createElement("div");
  const heroToken = isRosterHeroId(combatant.id);
  token.className = `token ${heroToken ? "hero" : "monster-token"} ${combatant.id}`;
  token.dataset.combatant = combatant.id;
  token.title = combatant.name;

  if (heroToken) {
    token.style.setProperty("--token-ring-color", heroClassTokenColor(combatant));
    token.title = `${combatant.name} - ${combatant.className ?? "Hero"}`;
  } else {
    const category = Math.max(1, Math.min(10, Number(monsterCategory(combatant)) || 1));

    token.classList.add(`monster-category-${category}`);
    token.dataset.category = String(category);
    token.style.setProperty("--token-ring-color", monsterCategoryRingColor(combatant));
    token.title = `${combatant.name} - Category ${category}`;
  }

  const tokenArtPath = combatantTokenArt(combatant);

  const tokenImage = document.createElement("img");
  tokenImage.className = "token-art hidden";
  tokenImage.alt = combatant.name;
  tokenImage.draggable = false;

  const tokenLabel = document.createElement("span");
  tokenLabel.className = "token-label";
  tokenLabel.textContent = combatant.token;

  const wildShapeBadge = document.createElement("span");
  wildShapeBadge.className = "wildshape-token-badge";
  wildShapeBadge.textContent = "W";
  wildShapeBadge.title = "Wild Shape";

  const stealthBadge = document.createElement("span");
  stealthBadge.className = "stealth-token-badge";
  stealthBadge.textContent = "H";
  stealthBadge.title = "Hidden";

  tokenImage.addEventListener("load", () => showCombatantTokenArt(token));
  tokenImage.addEventListener("error", () => {
    forgetCombatantTokenArt(state.fighters?.[combatant.id], state.fighters?.[combatant.id]?.tokenArt ?? combatant.tokenArt);
    hideCombatantTokenArt(token);
  });

  token.append(tokenImage, tokenLabel, wildShapeBadge, stealthBadge);
  setCombatantTokenArt(token, tokenArtPath);

  const hpBar = document.createElement("div");
  hpBar.className = "token-hp";
  const hpFill = document.createElement("div");
  hpFill.className = "token-hp-fill";
  hpBar.append(hpFill);
  token.append(hpBar);

  token.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const current = state.fighters[combatant.id];
    if (targetSelectionActive()) {
      clearPendingSpellTargeting();
      cancelPendingEldritchBlast();
      return;
    }
    if (current && (current.id === "hero" || isKnownTile(current.position))) {
      showCombatantInfo(current);
    }
  });
  token.addEventListener("mouseenter", () => {
    const current = state.fighters[combatant.id];
    if (current?.position) hoverSpellTarget(current.position);
  });
  token.addEventListener("click", (event) => consumeTokenTargetSelection(event, combatant.id), { capture: true });

  if (heroToken) {
    token.addEventListener("pointerdown", handleHeroPointerDown);
    token.addEventListener("click", (event) => {
      if (pendingSpellTargeting) {
        const current = state.fighters[combatant.id];
        if (current?.position) {
          suppressInspectionAfterTargetSelection();
          void confirmPendingSpellTarget(current.position);
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (pendingEldritchBlast) {
        const current = state.fighters[combatant.id];
        if (current?.position) {
          suppressInspectionAfterTargetSelection();
          void confirmPendingEldritchBlast(current.position);
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (suppressNextHeroClick) {
        suppressNextHeroClick = false;
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      const current = state.fighters[combatant.id];
      if (!current || !isRosterHeroId(current.id)) return;
      if (current.dead) {
        showCombatantInfo(current);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if ((event.shiftKey || event.ctrlKey || event.metaKey) && state.mode !== "combat") {
        toggleHeroSelection(current.id);
      } else {
        setActiveHero(current.id);
      }
      event.preventDefault();
      event.stopPropagation();
      render();
    });
  } else {
    token.addEventListener("click", (event) => {
      const current = state.fighters[combatant.id];
      if (pendingSpellTargeting) {
        if (current?.position) {
          suppressInspectionAfterTargetSelection();
          void confirmPendingSpellTarget(current.position);
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (pendingEldritchBlast) {
        if (current?.position) {
          suppressInspectionAfterTargetSelection();
          void confirmPendingEldritchBlast(current.position);
        }
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (!current?.alive || !isKnownTile(current.position)) return;
      if (current.dungeonRecruitWaiting) {
        void showWaitingRecruitDialog(current.id);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (inspectionSuppressedByTargeting()) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (state.mode === "combat" && selectedHeroCanTargetMonster(current)) {
        selectAttackTarget(current.id);
      } else {
        selectAttackTarget(current.id);
        showCombatantInfo(current);
      }
      event.preventDefault();
      event.stopPropagation();
    });
  }

  return token;
}
function combatantTokenArt(fighter) {
  clearAccidentalGenericHeroToken(fighter);
  if (window.DepthboundPlaytest?.role === "guest" && fighter?.playtestTokenArtId) {
    try {
      const stored = window.localStorage.getItem(`depthbound.playtest.tokenArt.${fighter.playtestTokenArtId}`);
      if (stored) return rememberCombatantTokenArt(fighter, fighter.playtestTokenArtId, stored);
    } catch {
      return rememberedCombatantTokenArt(fighter, fighter.playtestTokenArtId);
    }
  }
  let art = fighter.tokenArt ?? fighter.tokenImage ?? fighter.art ?? fighter.portrait ?? fighter.avatar ?? "";
  if (!art) art = recoverHeroTokenArtFromLibrary(fighter);
  if (art?.type === "custom-file") {
    const libraryEntry = loadCustomHeroTokenArt().find((entry) => entry.id === art.id || entry.tokenArt?.id === art.id);
    if (libraryEntry?.dataUrl) return rememberCombatantTokenArt(fighter, art, libraryEntry.dataUrl);
    const cached = art.runtimeUrl ?? window.DungeonSave?.cachedTokenUrl?.(art.path) ?? "";
    if (cached) return rememberCombatantTokenArt(fighter, art, cached);
    if (window.DungeonSave?.resolveTokenPath && art.path && !art.resolvePending) {
      art.resolvePending = true;
      window.DungeonSave.resolveTokenPath(art.path).then((url) => {
        art.resolvePending = false;
        if (url) {
          art.runtimeUrl = url;
          rememberCombatantTokenArt(fighter, art, url);
          render();
        }
      });
    }
    return rememberedCombatantTokenArt(fighter, art);
  }
  return rememberCombatantTokenArt(fighter, art, typeof art === "string" ? art : "");
}

function combatantArtworkMarkup(fighter, className = "combatant-art") {
  const art = combatantTokenArt(fighter);
  if (art) {
    return `<div class="${className}"><img src="${escapeAttribute(art)}" alt="${escapeAttribute(fighter.name)} artwork" /></div>`;
  }
  return `<div class="${className} empty"><span>${escapeHtml(fighter.token ?? tokenFromName(fighter.name, "M"))}</span></div>`;
}

function furnitureArtworkMarkup(template, object) {
  if (template?.invisiblePlayer && !adminEnabled()) return "";
  const art = furnitureIconPath(template, object.type);
  if (art) return `<div class="inspect-art furniture-inspect-art"><img src="${escapeAttribute(art)}" alt="${escapeAttribute(template.name)} artwork" /></div>`;
  return "";
}

function ensureCombatantToken(fighter) {
  if (els.room.querySelector(`[data-combatant="${fighter.id}"]`)) return;
  els.room.querySelector(".token-layer")?.prepend(createCombatantToken(fighter));
}

function createTileButton(position) {
  const tile = document.createElement("button");
  tile.className = "tile";
  tile.type = "button";
  tile.dataset.x = String(position.x);
  tile.dataset.y = String(position.y);
  tile.addEventListener("pointerdown", (event) => {
    if (!isHomeBuilderOpen()) return;
    event.preventDefault();
    event.stopPropagation();
    homePaintPointerId = event.pointerId;
    document.addEventListener("pointerup", clearHomePaintPointer, { once: true });
    document.addEventListener("pointercancel", clearHomePaintPointer, { once: true });
    applyHomeBuildAt(position, event);
  });
  tile.addEventListener("pointerenter", (event) => {
    if (!isHomeBuilderOpen() || homePaintPointerId === null) return;
    if (!["floor", "erase", "paintFloor", "paintWall"].includes(homeBuildTool)) return;
    applyHomeBuildAt(position, event);
  });
  tile.addEventListener("click", () => handleTileClick(position));
  tile.addEventListener("mouseenter", () => hoverSpellTarget(position));
  tile.addEventListener("contextmenu", (event) => {
    if (pendingSpellTargeting) {
      event.preventDefault();
      event.stopPropagation();
      clearPendingSpellTargeting();
      return;
    }
    if (pendingEldritchBlast) {
      event.preventDefault();
      event.stopPropagation();
      cancelPendingEldritchBlast();
      return;
    }
    const table = planningTablePosition();
    if (!isHomeBuilderOpen() && state.mode === "home" && position.y === table.y && position.x >= table.x && position.x < table.x + 2) {
      event.preventDefault();
      showPlanningTableInfo();
      return;
    }
    if (state.mode === "home" && toggleHomeDoor(position, activeHero())) {
      event.preventDefault();
    }
  });
  return tile;
}

function homeGridPositionFromPointerEvent(event) {
  const rect = els.room?.getBoundingClientRect();
  const gridSize = currentGridSize();
  if (!rect?.width || !rect?.height) return null;
  return {
    x: Math.max(0, Math.min(gridSize - 1, Math.floor(((event.clientX - rect.left) / rect.width) * gridSize))),
    y: Math.max(0, Math.min(gridSize - 1, Math.floor(((event.clientY - rect.top) / rect.height) * gridSize))),
  };
}

function buildRoom() {
  els.room.innerHTML = "";
  renderedTileKeys = new Set();
  const mapGridSize = currentGridSize();
  const scaledTileSizePx = currentTileSizePx();
  const roomSizePx = mapGridSize * scaledTileSizePx;
  const tokenSizePx = Math.round(scaledTileSizePx * 0.62);
  els.room.style.setProperty("--grid-size", mapGridSize);
  els.room.style.setProperty("--tile-size", `${scaledTileSizePx}px`);
  els.room.style.setProperty("--room-size", `${roomSizePx}px`);
  els.room.style.setProperty("--token-size", `${tokenSizePx}px`);
  els.room.style.setProperty("--token-slide-ms", `${tokenSlideMs}ms`);

  const tileLayer = document.createElement("div");
  tileLayer.className = "tile-layer";

  const lightingLayer = document.createElement("div");
  lightingLayer.className = "lighting-layer";
  const darknessLayer = document.createElement("div");
  darknessLayer.className = "lighting-darkness";
  const glowLayer = document.createElement("div");
  glowLayer.className = "lighting-glow";
  lightingLayer.append(darknessLayer, glowLayer);

  const tokenLayer = document.createElement("div");
  tokenLayer.className = "token-layer";

  const wallEdgeLayer = document.createElement("div");
  wallEdgeLayer.className = "wall-edge-layer";

  for (const fighter of Object.values(state.fighters).filter((entry) => isRosterHeroId(entry.id))) {
    tokenLayer.append(createCombatantToken(fighter));
  }

  const exitToken = document.createElement("div");
  exitToken.className = "exit-token";
  exitToken.dataset.exit = "dungeon";
  exitToken.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    if (isHomeBuilderOpen()) return;
    if (targetSelectionActive()) return;
    if (canHeroUseHomeExit(activeHero())) showHomeMenu();
  });
  exitToken.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isHomeBuilderOpen()) return;
    if (pendingSpellTargeting) {
      suppressInspectionAfterTargetSelection();
      void confirmPendingSpellTarget(state.exit.position);
      return;
    }
    if (pendingEldritchBlast) {
      suppressInspectionAfterTargetSelection();
      void confirmPendingEldritchBlast(state.exit.position);
      return;
    }
    const hero = activeHero();
    if (canHeroUseHomeExit(hero)) {
      showHomeMenu();
      return;
    }
    if (inspectionSuppressedByTargeting()) return;
    showDungeonObjectInfo({
      id: "dungeon-exit",
      type: state.mode === "home" ? "homeExit" : "dungeonExit",
      position: state.exit.position,
    });
  });
  exitToken.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isHomeBuilderOpen()) return;
    if (pendingSpellTargeting) {
      clearPendingSpellTargeting();
      return;
    }
    if (pendingEldritchBlast) {
      cancelPendingEldritchBlast();
      return;
    }
    if (canHeroUseHomeExit(activeHero())) {
      showHomeMenu();
      return;
    }
    showDungeonObjectInfo({
      id: "dungeon-exit",
      type: state.mode === "home" ? "homeExit" : "dungeonExit",
      position: state.exit.position,
    });
  });
  tokenLayer.append(exitToken);

  const homeMoveOutButton = document.createElement("button");
  homeMoveOutButton.className = "home-move-out-button hidden";
  homeMoveOutButton.type = "button";
  homeMoveOutButton.textContent = "Adventure";
  homeMoveOutButton.title = "Choose an adventure";
  homeMoveOutButton.setAttribute("aria-label", "Choose an adventure");
  homeMoveOutButton.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  homeMoveOutButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isHomeBuilderOpen()) return;
    showHomeMenu();
  });
  tokenLayer.append(homeMoveOutButton);

  const chestToken = document.createElement("button");
  chestToken.className = "chest-token hidden";
  chestToken.type = "button";
  chestToken.title = "Home chest";
  configureFurnitureIconToken(chestToken, { name: "Home Chest" }, "home-chest", "C", "home-special-object-icon", "home-special-object-label");
  const openChest = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (selectHomeMoveTarget({ kind: "special", id: "chest", label: "Home Chest" })) return;
    if (isHomeBuilderOpen()) return;
    const hero = activeHero();
    if (state.mode === "home" && hero) {
      showHomeChestInfo();
    }
  };
  const inspectChest = (event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (isHomeBuilderOpen()) return;
    if (pendingSpellTargeting) {
      clearPendingSpellTargeting();
      return;
    }
    if (pendingEldritchBlast) {
      cancelPendingEldritchBlast();
      return;
    }
    if (state.mode === "home") {
      showHomeChestInfo();
    }
  };
  chestToken.addEventListener("click", openChest);
  chestToken.addEventListener("contextmenu", inspectChest);
  tokenLayer.append(chestToken);

  const planningToken = document.createElement("button");
  planningToken.className = "planning-table-token hidden";
  planningToken.type = "button";
  planningToken.title = "Planning Table";
  configureFurnitureIconToken(planningToken, { name: "Planning Table" }, "planning-table", "PT", "home-special-object-icon", "home-special-object-label");
  planningToken.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isHomeBuilderOpen()) return;
    if (pendingSpellTargeting) {
      clearPendingSpellTargeting();
      return;
    }
    if (pendingEldritchBlast) {
      cancelPendingEldritchBlast();
      return;
    }
    if (state.mode === "home") showPlanningTableInfo();
  });
  planningToken.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (selectHomeMoveTarget({ kind: "special", id: "planningTable", label: "Planning Table" })) return;
    if (isHomeBuilderOpen()) return;
    if (state.mode === "home") showPlanningTableInfo();
  });
  tokenLayer.append(planningToken);

  const lootLayer = document.createElement("div");
  lootLayer.className = "loot-layer";
  tokenLayer.append(lootLayer);

  const objectLayer = document.createElement("div");
  objectLayer.className = "object-layer";
  tokenLayer.append(objectLayer);

  els.room.append(tileLayer, lightingLayer, wallEdgeLayer, tokenLayer);
  roomIsBuilt = true;
}

function renderWallEdges() {
  const edgeLayer = els.room.querySelector(".wall-edge-layer");
  if (!edgeLayer) return;

  edgeLayer.innerHTML = "";
  const scaledTileSizePx = currentTileSizePx();
  for (const segment of wallEdgeSegments()) {
    const edge = document.createElement("div");
    edge.className = `wall-edge wall-edge-${segment.direction}`;
    const homeWallColor = state.mode === "home" ? state.home?.wallColors?.[homeWallEdgeKey(segment.position, segment.direction)] : null;
    if (homeWallColor) {
      edge.classList.add("home-painted-wall");
      edge.style.setProperty("--home-wall-color", homeWallColor);
    }
    if (segment.direction === "east" || segment.direction === "west") {
      edge.style.left = `${(segment.position.x + 1) * scaledTileSizePx}px`;
      if (segment.direction === "west") edge.style.left = `${segment.position.x * scaledTileSizePx}px`;
      edge.style.top = `${segment.position.y * scaledTileSizePx}px`;
      edge.style.height = `${scaledTileSizePx + 2}px`;
    } else {
      edge.style.left = `${segment.position.x * scaledTileSizePx}px`;
      edge.style.top = `${(segment.position.y + 1) * scaledTileSizePx}px`;
      if (segment.direction === "north") edge.style.top = `${segment.position.y * scaledTileSizePx}px`;
      edge.style.width = `${scaledTileSizePx + 2}px`;
    }
    edgeLayer.append(edge);
  }
}

function renderTileButtons(tileKeys) {
  const tileLayer = els.room.querySelector(".tile-layer");
  if (!tileLayer) return;

  for (const tileKey of Array.from(renderedTileKeys)) {
    if (tileKeys.has(tileKey)) continue;
    tileLayer.querySelector(`[data-tile-key="${tileKey}"]`)?.remove();
    renderedTileKeys.delete(tileKey);
  }

  const scaledTileSizePx = currentTileSizePx();
  for (const tileKey of tileKeys) {
    const position = positionFromKey(tileKey);
    if (renderedTileKeys.has(tileKey)) {
      const existing = tileLayer.querySelector(`[data-tile-key="${tileKey}"]`);
      if (existing) {
        existing.style.left = `${position.x * scaledTileSizePx}px`;
        existing.style.top = `${position.y * scaledTileSizePx}px`;
      }
      continue;
    }
    const tile = createTileButton(position);
    tile.dataset.tileKey = tileKey;
    tile.style.left = `${position.x * scaledTileSizePx}px`;
    tile.style.top = `${position.y * scaledTileSizePx}px`;
    tileLayer.append(tile);
    renderedTileKeys.add(tileKey);
  }
}

function renderLootPiles() {
  const lootLayer = els.room.querySelector(".loot-layer");
  if (!lootLayer) return;

  lootLayer.innerHTML = "";
  const scaledTileSizePx = currentTileSizePx();
  const activeTiles = activeTileKeys();
  for (const pile of state.lootPiles ?? []) {
    if (!activeTiles.has(positionKey(pile.position)) || !isKnownTile(pile.position)) continue;

    const token = document.createElement("div");
    token.className = "loot-token";
    token.title = "Loot pile";
    token.textContent = "$";
    token.style.left = `${(pile.position.x + 0.5) * scaledTileSizePx}px`;
    token.style.top = `${(pile.position.y + 0.5) * scaledTileSizePx}px`;
    lootLayer.append(token);
  }
}

function furnitureIconFilename(template, type) {
  const source = template?.name || type || "";
  return source
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function furnitureIconPath(template, type) {
  const filename = furnitureIconFilename(template, type);
  return filename ? `assets/furniture/${filename}.png` : "";
}

const furnitureIconLoadStatus = new Map();

function setFurnitureIconLoaded(element, icon, label, iconPath) {
  furnitureIconLoadStatus.set(iconPath, "loaded");
  icon.classList.remove("hidden");
  label.classList.add("hidden");
  element.classList.add("has-furniture-icon");
}

function setFurnitureIconMissing(element, icon, label, iconPath) {
  furnitureIconLoadStatus.set(iconPath, "missing");
  icon.removeAttribute("src");
  icon.classList.add("hidden");
  label.classList.remove("hidden");
  element.classList.remove("has-furniture-icon");
}

function configureFurnitureIconToken(element, template, type, fallbackSymbol, iconClass, labelClass) {
  const iconPath = furnitureIconPath(template, type);
  const icon = document.createElement("img");
  const iconStatus = iconPath ? furnitureIconLoadStatus.get(iconPath) : "missing";
  icon.className = `${iconClass}${iconStatus === "loaded" ? "" : " hidden"}`;
  icon.alt = "";
  icon.draggable = false;

  const label = document.createElement("span");
  label.className = `${labelClass}${iconStatus === "loaded" ? " hidden" : ""}`;
  label.textContent = fallbackSymbol;

  if (iconStatus === "loaded") {
    icon.src = iconPath;
    element.classList.add("has-furniture-icon");
  } else if (iconPath && iconStatus !== "missing") {
    icon.addEventListener("load", () => {
      setFurnitureIconLoaded(element, icon, label, iconPath);
    });
    icon.addEventListener("error", () => {
      setFurnitureIconMissing(element, icon, label, iconPath);
    });
    icon.src = iconPath;
    if (icon.complete) {
      if (icon.naturalWidth > 0) setFurnitureIconLoaded(element, icon, label, iconPath);
      else setFurnitureIconMissing(element, icon, label, iconPath);
    }
  }

  element.replaceChildren(icon, label);
}

function wallLightAnchorClass(object) {
  const cells = objectCells(object);
  if (!cells.length) return "wall-light-east";
  const floorKeys = state.mode === "home"
    ? new Set(activeTileKeys())
    : new Set([...(state.dungeon?.walkable ?? []), ...(state.dungeon?.corridors ?? []), ...(state.dungeon?.doors ?? [])].map(positionKey));
  const directions = [
    { id: "north", dx: 0, dy: -1 },
    { id: "south", dx: 0, dy: 1 },
    { id: "west", dx: -1, dy: 0 },
    { id: "east", dx: 1, dy: 0 },
  ].map((direction) => ({
    ...direction,
    blocked: cells.filter((cell) => !floorKeys.has(positionKey({ x: cell.x + direction.dx, y: cell.y + direction.dy }))).length,
  }));
  const best = directions.sort((a, b) => b.blocked - a.blocked)[0];
  return `wall-light-${best?.blocked ? best.id : "east"}`;
}

function renderDungeonObjects() {
  const objectLayer = els.room.querySelector(".object-layer");
  if (!objectLayer) return;

  checkTrapDetectionOnReveal();
  objectLayer.innerHTML = "";
  const scaledTileSizePx = currentTileSizePx();
  const activeTiles = activeTileKeys();
  for (const object of state.dungeonObjects ?? []) {
    if (!objectCells(object).some((cell) => activeTiles.has(positionKey(cell)) && isKnownTile(cell))) continue;
    const template = objectTemplate(object.type);
    if (!template) continue;
    if (template.invisiblePlayer && !adminEnabled()) continue;
    if (objectIsTrap(object) && !object.detected && !object.spent && !object.disarmed) continue;

    const element = document.createElement("button");
    const objectRotation = normalizeObjectRotation(object.rotation ?? 0);
    const objectSize = objectRotatedSize({
      width: object.width ?? template.width ?? 1,
      height: object.height ?? template.height ?? 1,
      rotation: objectRotation,
    });
    const behaviorClasses = objectComponents(object)
      .map((component) => `feature-${component.type.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`)
      .join(" ");
    const lightComponent = objectComponents(object).find((component) => component.type === "lightSource");
    const floorCovering = objectTypeIsFloorCovering(object.type) || homeObjectTypeIsFloorCovering(object.type);
    const wallLightSide = objectHasTag(object, "wall-light") ? wallLightAnchorClass(object) : "";
    element.className = `dungeon-object ${object.type} ${behaviorClasses}${wallLightSide ? ` ${wallLightSide}` : ""}${floorCovering ? " floor-covering" : ""}${object.spent ? " spent" : ""}${object.disarmed ? " disarmed" : ""}${object.detected ? " detected" : ""}`;
    element.classList.toggle("attackable-object", selectedHeroCanTargetObject(object));
    element.classList.toggle("selected-target", selectedAttackTarget()?.id === object.id);
    element.classList.toggle("active-light-source", Boolean(lightComponent));
    if (lightComponent) element.style.setProperty("--object-light-color", lightComponent.color ?? "#7dd3fc");
    element.type = "button";
    element.title = template.name;
    const fallbackSymbol = objectHasTag(object, "terrain-floor")
      ? ""
      : template.symbol ?? (objectIsTrap(object) ? "!" : objectHasLoot(object) ? "$" : "?");
    const iconPath = furnitureIconPath(template, object.type);
    const icon = document.createElement("img");
    const iconStatus = iconPath ? furnitureIconLoadStatus.get(iconPath) : "missing";
    icon.className = `dungeon-object-icon${iconStatus === "loaded" ? "" : " hidden"}`;
    icon.alt = "";
    icon.draggable = false;
    if (!wallLightSide) icon.style.transform = `rotate(${objectRotation}deg)`;
    if (!wallLightSide && (objectRotation === 90 || objectRotation === 270)) {
      icon.style.width = `${Math.min(82, (objectSize.height / objectSize.width) * 82)}%`;
      icon.style.height = `${Math.min(82, (objectSize.width / objectSize.height) * 82)}%`;
    }
    const label = document.createElement("span");
    label.className = `dungeon-object-label${iconStatus === "loaded" ? " hidden" : ""}`;
    label.textContent = fallbackSymbol;
    label.style.transform = `rotate(${objectRotation}deg)`;
    if (iconStatus === "loaded") {
      icon.src = iconPath;
      element.classList.add("has-furniture-icon");
    } else if (iconPath && iconStatus !== "missing") {
      icon.addEventListener("load", () => {
        setFurnitureIconLoaded(element, icon, label, iconPath);
      });
      icon.addEventListener("error", () => {
        setFurnitureIconMissing(element, icon, label, iconPath);
      });
      icon.src = iconPath;
      if (icon.complete) {
        if (icon.naturalWidth > 0) setFurnitureIconLoaded(element, icon, label, iconPath);
        else setFurnitureIconMissing(element, icon, label, iconPath);
      }
    }
    element.append(icon, label);
    element.style.left = `${object.position.x * scaledTileSizePx}px`;
    element.style.top = `${object.position.y * scaledTileSizePx}px`;
    element.style.width = `${objectSize.width * scaledTileSizePx}px`;
    element.style.height = `${objectSize.height * scaledTileSizePx}px`;
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (isHomeBuilderOpen() && homeBuildTool === "move" && object.homePlaced) {
        if (homeMoveSelection && homeObjectTypeIsFloorCovering(object.type)) {
          if (applyHomeBuildAt(homeGridPositionFromPointerEvent(event) ?? object.position, event)) return;
        }
        selectHomeMoveTarget({ kind: "object", id: object.id, label: template.name });
        return;
      }
      if (applyHomeBuildAt(object.position)) return;
      if (pendingSpellTargeting) {
        suppressInspectionAfterTargetSelection();
        void confirmPendingSpellTarget(object.position);
        return;
      }
      if (pendingEldritchBlast) {
        suppressInspectionAfterTargetSelection();
        void confirmPendingEldritchBlast(object.position);
        return;
      }
      if (state.mode === "combat" && selectedHeroCanTargetObject(object)) {
        const monster = preferredMonsterTargetOverObject(object);
        if (monster) {
          selectAttackTarget(monster.id);
          return;
        }
        selectAttackTarget(object.id);
        return;
      }
      if (inspectionSuppressedByTargeting()) return;
      showDungeonObjectInfo(object);
    });
    element.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (isHomeBuilderOpen()) return;
      if (targetSelectionActive()) {
        clearPendingSpellTargeting();
        cancelPendingEldritchBlast();
        return;
      }
      if (inspectionSuppressedByTargeting()) return;
      showDungeonObjectInfo(object);
    });
    objectLayer.append(element);
  }
}

function preferredMonsterTargetOverObject(object) {
  const objectKeys = new Set(objectCells(object).map(positionKey));
  return visibleMonsters()
    .filter((monster) => window.DungeonGrid.fighterCells(monster).some((cell) => objectKeys.has(positionKey(cell))))
    .find((monster) => selectedHeroCanTargetMonster(monster)) ?? null;
}

function placeExitToken() {
  const token = els.room.querySelector("[data-exit='dungeon']");
  if (!token || !state.exit?.position) return;

  const scaledTileSizePx = currentTileSizePx();
  token.title = state.mode === "home" ? "Home door" : "Dungeon exit";
  token.textContent = state.mode === "home" ? "H" : "E";
  token.style.left = `${(state.exit.position.x + 0.5) * scaledTileSizePx}px`;
  token.style.top = `${(state.exit.position.y + 0.5) * scaledTileSizePx}px`;
  token.classList.toggle("hidden", state.completed || !isKnownTile(state.exit.position));

  const homeMoveOutButton = els.room.querySelector(".home-move-out-button");
  if (homeMoveOutButton) {
    homeMoveOutButton.style.left = `${(state.exit.position.x + 1.35) * scaledTileSizePx}px`;
    homeMoveOutButton.style.top = `${(state.exit.position.y + 0.5) * scaledTileSizePx}px`;
    homeMoveOutButton.classList.toggle("hidden", state.mode !== "home" || state.completed);
  }
}

function homeChestPosition() {
  return { ...(state.home?.specialPositions?.chest ?? { x: 18, y: 11 }) };
}

function planningTablePosition() {
  return { ...(state.home?.specialPositions?.planningTable ?? { x: 14, y: 18 }) };
}

function placeHomeChestToken() {
  const token = els.room.querySelector(".chest-token");
  if (!token) return;
  token.classList.toggle("hidden", state.mode !== "home");
  if (state.mode !== "home") return;

  const position = homeChestPosition();
  const scaledTileSizePx = currentTileSizePx();
  token.style.left = `${(position.x + 0.5) * scaledTileSizePx}px`;
  token.style.top = `${(position.y + 0.5) * scaledTileSizePx}px`;
}

function placePlanningTableToken() {
  const token = els.room.querySelector(".planning-table-token");
  if (!token) return;
  token.classList.toggle("hidden", state.mode !== "home");
  if (state.mode !== "home") return;
  const position = planningTablePosition();
  const scaledTileSizePx = currentTileSizePx();
  token.style.left = `${(position.x + 1) * scaledTileSizePx}px`;
  token.style.top = `${(position.y + 0.5) * scaledTileSizePx}px`;
  token.style.width = `${2 * scaledTileSizePx}px`;
  token.style.height = `${scaledTileSizePx}px`;
}

let renderedDragPathKeys = new Set();

function tileElementAt(position) {
  if (!position) return null;
  return els.room.querySelector(`.tile[data-x="${position.x}"][data-y="${position.y}"]`);
}

function clearRenderedDragPathPreview() {
  for (const key of renderedDragPathKeys) {
    const tile = tileElementAt(positionFromKey(key));
    if (!tile) continue;
    tile.classList.remove("path-preview");
    tile.textContent = "";
  }
  renderedDragPathKeys = new Set();
}

function renderDragPathPreview() {
  const path = dragPath ?? [];
  const nextKeys = new Set(path.map(positionKey));
  for (const key of renderedDragPathKeys) {
    if (nextKeys.has(key)) continue;
    const tile = tileElementAt(positionFromKey(key));
    if (!tile) continue;
    tile.classList.remove("path-preview");
    tile.textContent = "";
  }
  path.forEach((step, index) => {
    const tile = tileElementAt(step);
    if (!tile) return;
    tile.classList.add("path-preview");
    tile.textContent = String(index + 1);
  });
  renderedDragPathKeys = nextKeys;
}

function placeToken(fighter) {
  ensureCombatantToken(fighter);
  const token = els.room.querySelector(`[data-combatant="${fighter.id}"]`);
  if (!token) return;

  const scaledTileSizePx = currentTileSizePx();
  const footprint = window.DungeonGrid.fighterFootprintDimensions(fighter);
  updateTokenMovementClass(token, fighter);
  token.style.left = `${(fighter.position.x + footprint.width / 2) * scaledTileSizePx}px`;
  token.style.top = `${(fighter.position.y + footprint.height / 2) * scaledTileSizePx}px`;
  if (footprint.width > 1 || footprint.height > 1) {
    token.style.width = `${footprint.width * scaledTileSizePx}px`;
    token.style.height = `${footprint.height * scaledTileSizePx}px`;
  } else {
    token.style.removeProperty("width");
    token.style.removeProperty("height");
  }
  const heroToken = isRosterHeroId(fighter.id);
  if (heroToken) {
    token.style.setProperty("--token-ring-color", heroClassTokenColor(fighter));
    token.title = `${fighter.name} - ${fighter.className ?? "Hero"}`;
  }
  const corpseToken = heroToken && fighter.dead && heroCorpseLocation(fighter) === "dungeon" && state.mode !== "home" && isKnownTile(fighter.position);
  const visibleHero = heroToken && ((fighter.alive && (state.mode === "home" || isPartyHeroId(fighter.id))) || corpseToken);
  token.classList.toggle("hidden", heroToken ? !visibleHero : !fighter.alive || !isKnownTile(fighter.position));
  token.classList.toggle("defeated", !heroToken && !fighter.alive);
  token.classList.toggle("corpse-token", false);
  token.classList.toggle("dragging", (fighter.id === dragHeroId || (heroToken && selectedHeroIds.has(fighter.id))) && Boolean(dragPath));
  token.classList.toggle("active-hero", fighter.id === activeHero()?.id);
  token.classList.toggle("selected-hero", heroToken && selectedHeroIds.has(fighter.id));
  token.classList.toggle("in-attack-range", !heroToken && attackTargets().some((target) => target.id === fighter.id));
  token.classList.toggle("selected-target", !heroToken && selectedAttackTarget()?.id === fighter.id);
  const spellTargeting = currentPendingSpellTargeting();
  token.classList.toggle("spell-click-target", isSpellTokenTargetable(spellTargeting, fighter));
  token.classList.toggle("flying-token", fighterIsFlying(fighter));
  token.classList.toggle("wildshaped-druid-token", heroToken && fighter.classId === "druid" && isWildShaped(fighter));
  token.classList.toggle("stealthing-hero-token", heroToken && fighterIsStealthing(fighter));
  token.classList.toggle("dying-hero-token", heroToken && fighter.alive && !fighter.dead && (fighter.hp ?? 0) <= 0);
  token.classList.remove("emits-light");
  token.style.removeProperty("--token-light-color");
  const art = combatantTokenArt(fighter);
  setCombatantTokenArt(token, art);
  const hpFill = token.querySelector(".token-hp-fill");
  if (hpFill) {
    const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
    hpFill.style.width = `${hpPercent}%`;
  }
}

function renderableFighters(activeTiles = activeTileKeys()) {
  const initiativeIds = new Set((state.initiative ?? []).map((entry) => entry.fighterId));
  return Object.values(state.fighters).filter((fighter) => {
    if (isRosterHeroId(fighter.id)) return true;
    if (!fighter.alive) return false;
    const visible = showDungeonLayout || initiativeIds.has(fighter.id) || window.DungeonGrid.fighterCells(fighter).some((cell) => activeTiles.has(positionKey(cell)));
    if (visible && !fighter.dungeonRecruitWaiting) recordMonsterEncounter(fighter);
    return visible;
  });
}

function renderRoom() {
  if (!roomIsBuilt) buildRoom();
  refreshRoomScrollMode?.();

  const mapGridSize = currentGridSize();
  const scaledTileSizePx = currentTileSizePx();
  els.room.style.setProperty("--grid-size", mapGridSize);
  els.room.style.setProperty("--tile-size", `${scaledTileSizePx}px`);
  els.room.style.setProperty("--room-size", `${mapGridSize * scaledTileSizePx}px`);
  els.room.style.setProperty("--token-size", `${Math.round(scaledTileSizePx * 0.62)}px`);
  els.room.style.setProperty("--token-slide-ms", `${tokenSlideMs}ms`);
  els.room.classList.toggle("home-room", state.mode === "home");

  const hero = activeHero();
  const heroTurn = state.mode === "combat" && activeFighter()?.id === hero?.id && isPlayerControlledPartyFighter(hero) && combatNeedsHeroTurns();
  const activeTiles = activeTileKeys();
  const rememberedTiles =
    isHomeBuilderOpen()
      ? new Set(Array.from({ length: mapGridSize * mapGridSize }, (_, index) => positionKey({ x: index % mapGridSize, y: Math.floor(index / mapGridSize) })))
      : rememberedTileKeys();
  renderTileButtons(rememberedTiles);
  const walkable = currentWalkable(hero);
  const doorKeys = new Set((state.dungeon?.doors ?? []).filter(doorIsVisibleToPlayers).map(positionKey));
  const openedDoorKeys = new Set(state.exploration?.openedDoorKeys ?? []);
  const visibleWalls = exposedWallKeys();
  const spellTargeting = currentPendingSpellTargeting();
  const spellPreview = spellPreviewCells(spellTargeting);
  const persistentAreas = persistentAreaTileKeys();
  const persistentBlockingAreas = typeof persistentAreaBlockingTileKeys === "function" ? persistentAreaBlockingTileKeys() : new Set();
  const persistentDifficultAreas = typeof persistentAreaDifficultTerrainKeys === "function" ? persistentAreaDifficultTerrainKeys() : new Set();
  const lightingMap = state.mode === "home" || typeof currentLightingMap !== "function" ? { tiles: new Map(), sources: [] } : currentLightingMap();
  const lightingSourcesById = new Map((lightingMap.sources ?? []).map((source) => [source.id, source]));
  const visibleLightTileKeys = new Set([...activeTiles].filter((key) => isKnownTile(positionFromKey(key))));
  renderLightingLayer(lightingMap, scaledTileSizePx, visibleLightTileKeys);
  renderedLightingSourcesByOwner = new Map();
  for (const source of lightingMap.sources ?? []) {
    if (
      source.ownerId &&
      source.sourceType !== "ambient" &&
      source.sourceType !== "darkness" &&
      !source.magicalDarkness &&
      Math.max(source.brightRadius ?? 0, source.dimRadius ?? 0) > 0 &&
      !renderedLightingSourcesByOwner.has(source.ownerId)
    ) {
      renderedLightingSourcesByOwner.set(source.ownerId, source);
    }
  }
  const shouldShowReachable = !movementInProgress && heroTurn;
  const reachable = !shouldShowReachable
    ? new Map()
    : heroTurn
      ? reachableTiles(hero, state.fighters, {
          gridSize: currentGridSize(),
          walkable,
          canTraverse: (from, to, path) => canTraverseFootprintMovementEdge(hero, from, to, path),
          moveCost: (_from, to) => movementCostAtPosition(to, hero),
          stateKey: (position, path) => movementStateKey(hero, position, path),
          canEnterOccupied: (position) => canMoveThroughOccupiedTile(hero, position),
          canOccupy: (position) => canFighterOccupyPosition(hero, position, walkable, true),
        })
      : new Map();
  const dragPathIndexByKey = new Map((dragPath ?? []).map((step, index) => [positionKey(step), index]));

  perfStats.visibleTiles = rememberedTiles.size;
  perfStats.renderedTiles = renderedTileKeys.size;
  els.room.querySelectorAll(".tile").forEach((tile) => {
    const position = { x: Number(tile.dataset.x), y: Number(tile.dataset.y) };
    const key = positionKey(position);
    const isActiveTile = activeTiles.has(key);
    const isReachable = reachable.has(key);
    const isWalkable = walkable.has(key);
    const doorsHere = (state.dungeon?.doors ?? []).filter((door) => positionKey(door) === key && doorIsVisibleToPlayers(door));
    const renderableDoorsHere = doorsHere.filter((entry) => entry.edge || entry.corridor);
    const door = renderableDoorsHere[0] ?? null;
    const isDoor = renderableDoorsHere.length > 0 || (doorKeys.has(key) && Boolean(door));
    const isKnown = isKnownTile(position);
    const isSeenWall = !isWalkable && visibleWalls.has(key);
    const pathIndex = dragPathIndexByKey.get(key) ?? -1;
    const isAdminTeleportTarget = canAdminTeleportTo(position);
    const spellTargetAtTile = fighterAtPosition(position);
    const isSpellAffected = spellPreview.has(key);
    const isHomeBuildTarget = isHomeBuilderOpen();
    const isPersistentSpellArea = persistentAreas.has(key);
    const isPersistentSpellBlocker = persistentBlockingAreas.has(key);
    const isPersistentDifficult = persistentDifficultAreas.has(key);
    const lighting = lightingMap.tiles?.get(key) ?? null;
    const lightingSource =
      lightingSourcesById.get(lighting?.brightSources?.[0]) ??
      lightingSourcesById.get(lighting?.dimSources?.[0]) ??
      lightingSourcesById.get(lighting?.darknessSources?.[0]) ??
      null;
    const showTileLighting = state.mode !== "home";
    const isLitTile = showTileLighting && isKnown && isWalkable && Boolean(lighting);
    const isSpellOrigin = spellTargeting?.hoverPosition && positionKey(spellTargeting.hoverPosition) === key;
    const isSpellTargetable =
      spellTargeting?.mode === "point"
        ? isValidSpellPointTarget(spellTargeting.caster, spellTargeting.spell, position)
        : spellTargeting?.mode === "direction"
          ? Boolean(directionFromCasterToPosition(spellTargeting.caster, position))
          : isValidSpellTarget(spellTargeting?.caster, spellTargeting?.spell, spellTargetAtTile);
    tile.classList.toggle("walkable", isWalkable && isKnown);
    tile.classList.toggle("fog-memory", isKnown && !isActiveTile);
    tile.classList.toggle("hidden-tile", !isKnown && !isSeenWall);
    tile.classList.toggle("seen-wall", isSeenWall);
    tile.classList.toggle("door", isDoor && isKnown);
    tile.classList.toggle("hidden-door-revealed", isDoor && isKnown && renderableDoorsHere.some(doorIsHidden));
    tile.classList.toggle("door-north", isDoor && isKnown && renderableDoorsHere.some((entry) => homeDoorDirection(entry, position) === "north"));
    tile.classList.toggle("door-east", isDoor && isKnown && renderableDoorsHere.some((entry) => homeDoorDirection(entry, position) === "east"));
    tile.classList.toggle("door-south", isDoor && isKnown && renderableDoorsHere.some((entry) => homeDoorDirection(entry, position) === "south"));
    tile.classList.toggle("door-west", isDoor && isKnown && renderableDoorsHere.some((entry) => homeDoorDirection(entry, position) === "west"));
    tile.classList.toggle("open-door", isKnown && openedDoorKeys.has(key));
    tile.classList.toggle("reachable", isReachable && !(adminEnabled() && adminTeleportEnabled));
    tile.classList.toggle("path-preview", pathIndex >= 0);
    tile.classList.toggle("spell-targetable", Boolean(isSpellTargetable));
    tile.classList.toggle("spell-origin", Boolean(isSpellOrigin));
    tile.classList.toggle("spell-aoe-preview", isSpellAffected);
    tile.classList.toggle("persistent-spell-area", isPersistentSpellArea);
    tile.classList.toggle("persistent-spell-blocker", isPersistentSpellBlocker);
    tile.classList.toggle("persistent-spell-difficult", isPersistentDifficult);
    tile.classList.toggle("light-bright", isLitTile && lighting.level === "bright" && !lighting.magicalDarkness);
    tile.classList.toggle("light-dim", isLitTile && lighting.level === "dim" && !lighting.magicalDarkness);
    tile.classList.toggle("light-darkness", isLitTile && lighting.level === "darkness" && !lighting.magicalDarkness);
    tile.classList.toggle("light-magical-darkness", isLitTile && lighting.magicalDarkness);
    if (lightingSource) {
      tile.style.setProperty("--tile-light-color", lightingSourceColor(lightingSource));
    } else {
      tile.style.removeProperty("--tile-light-color");
    }
    tile.classList.toggle("spell-affected-occupied", isSpellAffected && Boolean(spellTargetAtTile));
    tile.classList.toggle("home-comfort-range", state.mode === "home" && homeComfortRangePreviewKeys.has(key));
    const homeFloorColor = state.mode === "home" ? state.home?.floorColors?.[key] : null;
    tile.classList.toggle("home-painted-floor", Boolean(homeFloorColor && isWalkable && isKnown));
    if (homeFloorColor && isWalkable && isKnown) {
      tile.style.setProperty("--home-floor-color", homeFloorColor);
    } else {
      tile.style.removeProperty("--home-floor-color");
    }
    tile.textContent = pathIndex >= 0 ? String(pathIndex + 1) : "";
    const openableDoor = isActiveTile && Boolean(canOpenDoor(position));
    const homeDoorToggleTarget =
      state.mode === "home" && !isHomeBuilderOpen() && Boolean(doorCandidateForPosition(position, hero)) && distance(hero.position, doorCandidateForPosition(position, hero)) <= 1;
    tile.classList.toggle("openable-door", openableDoor && state.mode === "combat");
    tile.disabled = isHomeBuildTarget
      ? false
      : spellTargeting || pendingEldritchBlast
      ? false
      : adminEnabled() && adminTeleportEnabled
        ? !isAdminTeleportTarget
        : ((!isReachable && !openableDoor && !homeDoorToggleTarget) || !isKnown) && !dragPath;
    tile.title = pendingEldritchBlast
      ? "Target Eldritch Blast"
      : spellTargeting
      ? isSpellAffected
        ? `${spellTargeting.spell.name} affects this square`
        : isSpellTargetable
          ? `Cast ${spellTargeting.spell.name} here`
          : ""
      : isHomeBuildTarget
        ? `Build: ${homeBuildTool}`
      : homeDoorToggleTarget
        ? "Open or close door"
      : isAdminTeleportTarget
        ? "Admin teleport here"
        : openableDoor
          ? "Open door"
          : isReachable
            ? `${reachable.get(key) * feetPerSquare} ft`
            : "";
    const lightTitle = isKnown && showTileLighting && lighting ? tileLightingLabel(lighting) : "";
    if (lightTitle) tile.title = [tile.title, lightTitle].filter(Boolean).join(" - ");
  });

  const renderable = renderableFighters(activeTiles);
  const renderableIds = new Set(renderable.map((fighter) => fighter.id));
  els.room.querySelectorAll("[data-combatant]").forEach((token) => {
    const id = token.dataset.combatant;
    if (!isRosterHeroId(id) && !renderableIds.has(id)) token.remove();
  });
  renderable.forEach(placeToken);
  perfStats.totalEntities = Object.values(state.fighters).length + (state.lootPiles?.length ?? 0) + (state.dungeonObjects?.length ?? 0);
  perfStats.activeEntities = renderable.length;
  perfStats.sleepingEntities = Math.max(0, aliveMonsters().length - renderable.filter((fighter) => !isRosterHeroId(fighter.id)).length);
  perfStats.renderedEntities = renderable.length;
  placeExitToken();
  placeHomeChestToken();
  placePlanningTableToken();
  renderLootPiles();
  renderDungeonObjects();
  renderWallEdges();
  renderedDragPathKeys = new Set((dragPath ?? []).map(positionKey));
}

function renderHeroStatusCard(element, fighter) {
  refreshDerivedStats(fighter);
  const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
  const temporaryHpText = (fighter.temporaryHp ?? 0) > 0 ? ` <small>(+${fighter.temporaryHp} temp)</small>` : "";
  const weapon = activeWeapon(fighter);
  const armor = equippedItem(fighter, "torso");
  const beast = wildShapeBeastById(fighter.wildShapeState?.beastFormId);
  const temporaryEffects = temporaryEffectsForFighter(fighter);
  const loadoutText = isWildShaped(fighter)
    ? `${escapeHtml(fighter.damage?.weaponName ?? "Beast Attack")} / ${escapeHtml(beast?.name ?? "Beast Form")}`
    : `${escapeHtml(weapon?.name ?? "Unarmed")} / ${escapeHtml(armor?.name ?? "No armor")}`;
  const classResourceText = importantClassResourceText(fighter);
  const stealth = stealthState(fighter);
  const canToggleStealth = gameHasStarted && state.mode === "exploration" && heroCanAct(fighter) && !isAutonomousAlly(fighter);
  const stealthTitle = stealth
    ? `Stealth ${stealth.total}. Click to stop stealthing.`
    : !gameHasStarted
      ? "Start an adventure before stealthing."
      : isAutonomousAlly(fighter)
        ? "Companions follow the party's stealth rhythm."
        : state.mode !== "exploration"
          ? "Stealth is available while exploring."
          : !heroCanAct(fighter)
            ? "This hero cannot act right now."
            : "Roll Stealth";
  const searchRoom = roomForPosition(fighter.position);
  const canSearchRoom =
    gameHasStarted &&
    state.mode === "exploration" &&
    heroCanAct(fighter) &&
    !isAutonomousAlly(fighter) &&
    Boolean(searchRoom) &&
    !hiddenDoorSearchAttempted(fighter, searchRoom);
  const searchTitle = searchRoom
    ? hiddenDoorSearchAttempted(fighter, searchRoom)
      ? `Already searched ${searchRoom.name ?? "this room"}`
      : `Search ${searchRoom.name ?? "room"}`
    : !gameHasStarted
      ? "Start an adventure before searching."
      : state.mode !== "exploration"
        ? "Search is available while exploring."
        : "No room to search here.";
  const lightCondition = derivedLightConditionForFighter(fighter);
  const statusPills = [
    fighter.dodging ? '<span class="status-pill status-dodge">Dodging</span>' : "",
    fighter.disengaged ? '<span class="status-pill status-disengage">Disengaged</span>' : "",
    stealth ? `<span class="status-pill status-dodge" title="Current Stealth total ${stealth.total}">Stealth ${stealth.total}</span>` : "",
    lightCondition ? `<span class="status-pill status-light" title="${escapeAttribute([lightCondition.detail, lightCondition.duration].filter(Boolean).join(" - "))}">${escapeHtml(lightCondition.label)}</span>` : "",
    ...(fighter.statusEffects ?? []).map((effect) => `<span class="status-pill status-dodge" title="${escapeAttribute(temporaryEffectDetails(effect))}">${escapeHtml(statusEffectPillText(effect))}</span>`),
    fighter.hp <= 0 && !fighter.dead && heroIsStableAtZero(fighter) ? '<span class="status-pill status-dodge">Stable</span>' : "",
    fighter.hp <= 0 && !fighter.dead && !heroIsStableAtZero(fighter) ? `<span class="status-pill status-dodge">Death saves ${fighter.deathSaves?.successes ?? 0}/3 | ${fighter.deathSaves?.failures ?? 0}/3</span>` : "",
    fighter.dead ? '<span class="status-pill status-disengage">Dead</span>' : "",
  ].filter(Boolean);
  element.innerHTML = `
    <div class="fighter-top">
      ${combatantArtworkMarkup(fighter, "sidebar-hero-art")}
      <div class="fighter-summary">
        <div class="fighter-name">${fighter.name}</div>
        <div class="fighter-role">${escapeHtml(combatantRoleLabel(fighter))}</div>
      </div>
      <div class="card-actions">
        <button class="icon-button open-inventory" type="button" title="Inventory and equipment" aria-label="Inventory and equipment" data-tooltip="Inventory and equipment" data-ui-icon="inventory" ${canFighterReceiveInventory(fighter) ? "" : "disabled"}></button>
        <button class="icon-button rename-hero" type="button" title="Rename character" aria-label="Rename character" data-tooltip="Rename character" data-ui-icon="rename" ${fighter.renameable === false ? "disabled" : ""}></button>
        <button class="icon-button stealth-hero stealth-hero-button ${stealth ? "active" : ""}" type="button" title="${escapeAttribute(stealthTitle)}" aria-label="${stealth ? "Stop stealthing" : "Roll stealth"}" data-tooltip="${escapeAttribute(stealthTitle)}" data-ui-icon="stealth" ${canToggleStealth ? "" : "disabled"}></button>
        <button class="icon-button search-room-button" type="button" title="${escapeAttribute(searchTitle)}" aria-label="Search room" data-tooltip="${escapeAttribute(searchTitle)}" data-ui-icon="search" ${canSearchRoom ? "" : "disabled"}></button>
      </div>
    </div>
    <div class="hp-line">
      <div class="hp-text"><span>HP</span><span>${fighter.hp} / ${fighter.maxHp}${temporaryHpText}</span></div>
      <div class="hp-bar"><div class="hp-fill" style="width: ${hpPercent}%"></div></div>
    </div>
    <div class="loadout-line">
      <span>AC ${fighter.ac}</span>
      <span>${loadoutText}</span>
    </div>
    ${statusPills.length ? `<div class="status-line">${statusPills.join("")}</div>` : ""}
    <button class="temporary-effects-button" type="button" ${temporaryEffects.length ? "" : "disabled"}>
      Temporary effects <span>${temporaryEffects.length}</span>
    </button>
    ${classResourceText ? `<div class="wallet-line">${escapeHtml(classResourceText)}</div>` : ""}
    <div class="wallet-line">XP: ${fighter.xp ?? 0} / ${xpForNextLevel(fighter.level ?? 1)} - Hit Dice: ${fighter.hitDiceRemaining ?? 0}/${fighter.level ?? 1}${(fighter.spellPointMax ?? 0) > 0 ? ` - Spell Points: ${fighter.spellPoints ?? 0}/${fighter.spellPointMax ?? 0}` : ""} - Rests: ${state.shortRestsUsed ?? 0}/${state.shortRestLimit ?? 3} - Inventory: ${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>
  `;

  element.querySelector(".stealth-hero").addEventListener("click", () => beginHeroStealth(fighter));
  element.querySelector(".search-room-button").addEventListener("click", () => searchRoomForHiddenDoors(fighter));
  element.querySelector(".rename-hero").addEventListener("click", renameHero);
  element.querySelector(".open-inventory").addEventListener("click", showInventoryMenu);
  element.querySelector(".temporary-effects-button").addEventListener("click", () => showTemporaryEffectsInfo(fighter));
}

function partyRosterEntryMarkup(fighter) {
  const active = fighter.id === state.party?.activeHeroId;
  const selected = selectedHeroIds.has(fighter.id);
  const selectable = selectableHeroIds().has(fighter.id);
  const ally = isAutonomousAlly(fighter);
  const hpText = `${Math.max(0, fighter.hp ?? 0)} / ${fighter.maxHp ?? 0}`;
  return `
    <button type="button" class="party-roster-entry${active ? " active" : ""}${selected ? " selected" : ""}${ally ? " ally" : ""}" data-party-hero="${escapeAttribute(fighter.id)}" ${selectable ? "" : "disabled"}>
      ${combatantArtworkMarkup(fighter, "party-roster-art")}
      <span>
        <b>${escapeHtml(fighter.name ?? "Hero")}</b>
        <small>${escapeHtml(ally ? "Companion" : combatantRoleLabel(fighter))}</small>
      </span>
      <strong>${escapeHtml(hpText)}</strong>
    </button>
  `;
}

function renderPartyRoster() {
  if (!els.partyRoster) return;
  if (!gameHasStarted || state.completed) {
    els.partyRoster.innerHTML = "";
    return;
  }
  const entries = partyHeroes();
  els.partyRoster.innerHTML = entries.length ? entries.map(partyRosterEntryMarkup).join("") : `<p class="empty-note">No active party.</p>`;
}

function statusEffectPillText(effect) {
  const label = effect.label ?? effect.conditionLabel ?? effect.id ?? "Effect";
  const duration = temporaryEffectDurationText(effect);
  return duration && duration !== "Temporary" ? `${label} (${duration})` : label;
}

function lightingSourceColor(source) {
  return source?.color ?? (source?.sourceType === "darkness" ? "#191126" : "#f3d28b");
}

function sourceGradientStop(source, scaledTileSizePx, kind = "light") {
  const origin = source?.origin;
  if (!origin) return null;
  const centerX = Math.round((origin.x + 0.5) * scaledTileSizePx);
  const centerY = Math.round((origin.y + 0.5) * scaledTileSizePx);
  const brightPx = Math.max(0, Math.round((source.brightRadius ?? 0) * scaledTileSizePx));
  const dimPx = Math.max(brightPx + Math.round(scaledTileSizePx * 0.45), Math.round((source.dimRadius ?? source.brightRadius ?? 0) * scaledTileSizePx));
  const color = lightingSourceColor(source);
  if (kind === "darkness") {
    const radiusPx = Math.max(Math.round(scaledTileSizePx * 1.2), dimPx || Math.round(scaledTileSizePx * 3));
    const inner = source.magicalDarkness ? "rgba(27, 12, 40, 0.74)" : "rgba(0, 0, 0, 0.54)";
    const mid = source.magicalDarkness ? "rgba(12, 5, 20, 0.56)" : "rgba(0, 0, 0, 0.38)";
    return `radial-gradient(circle ${radiusPx}px at ${centerX}px ${centerY}px, ${inner} 0, ${mid} 58%, rgba(0, 0, 0, 0) 100%)`;
  }
  const brightEdgePx = Math.max(0, brightPx - Math.round(scaledTileSizePx * 0.22));
  const dimNearPx = Math.round(brightPx + (dimPx - brightPx) * 0.28);
  const dimMidPx = Math.round(brightPx + (dimPx - brightPx) * 0.58);
  const dimEdgePx = Math.max(brightPx, dimPx - Math.round(scaledTileSizePx * 0.4));
  const brightBoundary = brightPx > scaledTileSizePx * 0.55
    ? `radial-gradient(circle ${Math.max(brightPx + scaledTileSizePx * 0.28, scaledTileSizePx)}px at ${centerX}px ${centerY}px, transparent 0, transparent ${brightEdgePx}px, color-mix(in srgb, ${color} 18%, transparent) ${brightPx}px, transparent ${Math.round(brightPx + scaledTileSizePx * 0.38)}px)`
    : null;
  const dimBoundary = dimPx > brightPx + scaledTileSizePx
    ? `radial-gradient(circle ${Math.max(dimPx + scaledTileSizePx * 0.35, scaledTileSizePx)}px at ${centerX}px ${centerY}px, transparent 0, transparent ${dimEdgePx}px, color-mix(in srgb, ${color} 9%, transparent) ${dimPx}px, transparent ${Math.round(dimPx + scaledTileSizePx * 0.42)}px)`
    : null;
  const core = `radial-gradient(circle ${Math.max(brightPx + scaledTileSizePx * 0.7, scaledTileSizePx)}px at ${centerX}px ${centerY}px, color-mix(in srgb, ${color} 46%, transparent) 0, color-mix(in srgb, ${color} 32%, transparent) ${brightEdgePx}px, color-mix(in srgb, ${color} 20%, transparent) ${brightPx}px, transparent 100%)`;
  const halo = `radial-gradient(circle ${dimPx}px at ${centerX}px ${centerY}px, transparent 0, transparent ${Math.max(0, brightPx - Math.round(scaledTileSizePx * 0.15))}px, color-mix(in srgb, ${color} 11%, transparent) ${dimNearPx}px, color-mix(in srgb, ${color} 8%, transparent) ${dimMidPx}px, color-mix(in srgb, ${color} 5%, transparent) ${dimEdgePx}px, transparent 100%)`;
  return [dimBoundary, brightBoundary, halo, core].filter(Boolean).join(", ");
}

function cellGradientStops(source, scaledTileSizePx, limit = 36) {
  const cells = (source?.cells ?? []).slice(0, limit);
  const color = lightingSourceColor(source);
  return cells.map((cell) => {
    const centerX = Math.round((cell.x + 0.5) * scaledTileSizePx);
    const centerY = Math.round((cell.y + 0.5) * scaledTileSizePx);
    const radiusPx = Math.round(scaledTileSizePx * 1.22);
    return source.magicalDarkness
      ? `radial-gradient(circle ${radiusPx}px at ${centerX}px ${centerY}px, rgba(17, 7, 24, 0.66) 0, rgba(0, 0, 0, 0.34) 68%, transparent 100%)`
      : `radial-gradient(circle ${radiusPx}px at ${centerX}px ${centerY}px, color-mix(in srgb, ${color} 38%, transparent) 0, color-mix(in srgb, ${color} 18%, transparent) 64%, transparent 100%)`;
  });
}

function sourceRadiusFromCells(source) {
  if (!source?.origin || !source?.cells?.length) return null;
  let radius = 0;
  for (const cell of source.cells) {
    radius = Math.max(radius, Math.hypot(cell.x - source.origin.x, cell.y - source.origin.y) + 1);
  }
  return radius;
}

let lightingMaskCacheKey = "";
let lightingMaskCacheValue = null;

function lightingMaskForTiles(tileKeys, scaledTileSizePx) {
  const cacheKey = `${scaledTileSizePx}|${[...(tileKeys ?? [])].sort().join(";")}`;
  if (cacheKey === lightingMaskCacheKey && lightingMaskCacheValue) return lightingMaskCacheValue;
  const masks = [];
  const positions = [];
  const sizes = [];
  const rowRuns = new Map();
  for (const key of tileKeys ?? []) {
    const position = positionFromKey(key);
    const row = rowRuns.get(position.y) ?? [];
    row.push(position.x);
    rowRuns.set(position.y, row);
  }
  for (const [y, xs] of rowRuns) {
    xs.sort((a, b) => a - b);
    let start = null;
    let previous = null;
    const flush = () => {
      if (start == null || previous == null) return;
      const width = previous - start + 1;
      masks.push("linear-gradient(#000, #000)");
      positions.push(`${Math.round(start * scaledTileSizePx)}px ${Math.round(y * scaledTileSizePx)}px`);
      sizes.push(`${Math.ceil(width * scaledTileSizePx)}px ${Math.ceil(scaledTileSizePx)}px`);
    };
    for (const x of xs) {
      if (start == null) {
        start = x;
        previous = x;
        continue;
      }
      if (x === previous + 1) {
        previous = x;
        continue;
      }
      flush();
      start = x;
      previous = x;
    }
    flush();
  }
  if (!masks.length) {
    for (const key of tileKeys ?? []) {
      const position = positionFromKey(key);
      masks.push("linear-gradient(#000, #000)");
      positions.push(`${Math.round(position.x * scaledTileSizePx)}px ${Math.round(position.y * scaledTileSizePx)}px`);
      sizes.push(`${Math.ceil(scaledTileSizePx)}px ${Math.ceil(scaledTileSizePx)}px`);
    }
  }
  lightingMaskCacheKey = cacheKey;
  lightingMaskCacheValue = { images: masks.join(", "), positions: positions.join(", "), sizes: sizes.join(", "), signature: cacheKey };
  return lightingMaskCacheValue;
}

function setLightingMask(element, tileKeys, scaledTileSizePx) {
  if (!element) return null;
  const mask = lightingMaskForTiles(tileKeys, scaledTileSizePx);
  element.style.webkitMaskImage = mask.images;
  element.style.webkitMaskPosition = mask.positions;
  element.style.webkitMaskSize = mask.sizes;
  element.style.webkitMaskRepeat = "no-repeat";
  element.style.maskImage = mask.images;
  element.style.maskPosition = mask.positions;
  element.style.maskSize = mask.sizes;
  element.style.maskRepeat = "no-repeat";
  return mask;
}

function clearLightingMask(element) {
  if (!element) return;
  element.style.removeProperty("-webkit-mask-image");
  element.style.removeProperty("-webkit-mask-position");
  element.style.removeProperty("-webkit-mask-size");
  element.style.removeProperty("-webkit-mask-repeat");
  element.style.removeProperty("mask-image");
  element.style.removeProperty("mask-position");
  element.style.removeProperty("mask-size");
  element.style.removeProperty("mask-repeat");
}

function litTileKeysForLightingMap(lightingMap, visibleLightTileKeys = new Set()) {
  const keys = new Set();
  for (const [key, entry] of lightingMap?.tiles ?? []) {
    if (!visibleLightTileKeys.has(key)) continue;
    if (entry.magicalDarkness) continue;
    if (entry.level === "bright" || entry.level === "dim") keys.add(key);
  }
  return keys;
}

function renderLightingLayer(lightingMap, scaledTileSizePx, visibleLightTileKeys = new Set()) {
  const layer = els.room.querySelector(".lighting-layer");
  if (!layer) return;
  const darknessLayer = layer.querySelector(".lighting-darkness") ?? layer;
  const glowLayer = layer.querySelector(".lighting-glow") ?? layer;
  const showLighting = state.mode !== "home" && Boolean(lightingMap?.sources?.length) && visibleLightTileKeys.size > 0;
  layer.classList.toggle("hidden", !showLighting);
  els.room.classList.toggle("has-dungeon-lighting", showLighting);
  if (!showLighting) {
    layer.dataset.lightingSignature = "";
    glowLayer.style.removeProperty("--lighting-gradients");
    darknessLayer.style.removeProperty("--darkness-gradients");
    clearLightingMask(glowLayer);
    clearLightingMask(darknessLayer);
    return;
  }

  const lightGradients = [];
  const darknessGradients = [];
  for (const source of lightingMap.sources ?? []) {
    if (!source || source.sourceType === "ambient") continue;
    const target = source.magicalDarkness ? darknessGradients : lightGradients;
    if (source.cells?.length) {
      if (!source.magicalDarkness && source.origin) {
        const cellRadius = sourceRadiusFromCells(source);
        const gradient = sourceGradientStop({
          ...source,
          brightRadius: Math.max(source.brightRadius ?? 0, Math.max(0, Math.min(cellRadius ?? 0, 1) - 1)),
          dimRadius: Math.max(source.dimRadius ?? 0, cellRadius ?? 0),
        }, scaledTileSizePx, "light");
        if (gradient) target.push(gradient);
        continue;
      }
      target.push(...cellGradientStops(source, scaledTileSizePx));
      continue;
    }
    const gradient = sourceGradientStop(source, scaledTileSizePx, source.magicalDarkness ? "darkness" : "light");
    if (gradient) target.push(gradient);
  }

  const glowTileKeys = litTileKeysForLightingMap(lightingMap, visibleLightTileKeys);
  const darknessMask = setLightingMask(darknessLayer, visibleLightTileKeys, scaledTileSizePx);
  const glowMask = setLightingMask(glowLayer, glowTileKeys, scaledTileSizePx);
  const lightingValue = lightGradients.length ? lightGradients.join(", ") : "none";
  const darknessValue = darknessGradients.length ? darknessGradients.join(", ") : "none";
  const signature = [
    scaledTileSizePx,
    lightingValue,
    darknessValue,
    darknessMask?.signature ?? "",
    glowMask?.signature ?? "",
  ].join("|");
  if (layer.dataset.lightingSignature === signature) return;
  layer.dataset.lightingSignature = signature;
  glowLayer.style.setProperty("--lighting-gradients", lightingValue);
  darknessLayer.style.setProperty("--darkness-gradients", darknessValue);
}

function tileLightingLabel(lighting) {
  if (!lighting) return "";
  if (lighting.magicalDarkness) return "Magical darkness";
  if (lighting.level === "bright") return "Bright light";
  if (lighting.level === "dim") return "Dim light";
  return "Darkness";
}

let renderedLightingSourcesByOwner = new Map();

function actorEmittedLightSource(fighter) {
  if (!fighter?.id || typeof collectLightSources !== "function") return null;
  return renderedLightingSourcesByOwner.get(fighter.id) ?? null;
}

function derivedLightConditionForFighter(fighter) {
  if (!fighter?.position || typeof lightingAtPosition !== "function") return null;
  const lighting = lightingAtPosition(fighter.position);
  if (!lighting || lighting.level === "bright") return null;
  const senses = typeof fighterEffectiveSenses === "function" ? fighterEffectiveSenses(fighter) : fighter.senses ?? {};
  const hasDarkvision = Number(senses.darkvision ?? 0) > 0 || senses.darkvision === true;
  const hasTruesight = Number(senses.truesight ?? 0) > 0 || senses.truesight === true;
  const senseText = lighting.magicalDarkness
    ? hasTruesight
      ? "Truesight can pierce this magical darkness."
      : "Normal darkvision does not pierce magical darkness."
    : hasDarkvision
      ? `Darkvision ${senses.darkvision === true ? "" : `${senses.darkvision} ft `}covers this light level.`
      : "Sight-based Perception and Investigation checks are impaired.";
  if (lighting.magicalDarkness) {
    return {
      id: "derived-light-magical-darkness",
      label: hasTruesight ? "Magical Darkness (Truesight)" : "Magical Darkness",
      detail: senseText,
      duration: "Current tile",
    };
  }
  if (lighting.level === "darkness") {
    return {
      id: "derived-light-darkness",
      label: hasDarkvision ? "Darkness (Darkvision)" : "Darkness",
      detail: senseText,
      duration: "Current tile",
    };
  }
  return {
    id: "derived-light-dim",
    label: hasDarkvision ? "Dim Light (Darkvision)" : "Dim Light",
    detail: senseText,
    duration: "Current tile",
  };
}

function resourcePoolSpent(fighter, poolId) {
  return fighterAbilityDefinitions(fighter)
    .filter((ability) => ability.resourcePool === poolId)
    .reduce((sum, ability) => sum + (fighter?.abilityUses?.[ability.id] ?? 0), 0);
}

function importantClassResourceText(fighter) {
  const parts = [];
  const abilities = fighterAbilityDefinitions(fighter);
  const poolSummary = (poolId, label) => {
    const ability = abilities.find((entry) => entry.resourcePool === poolId);
    if (!ability) return;
    const max = abilityMaxUses(fighter, ability);
    const remaining = Math.max(0, max - resourcePoolSpent(fighter, poolId));
    parts.push(`${label}: ${remaining}/${max}`);
  };
  poolSummary("superiority", "Superiority Dice");
  poolSummary("arcaneShot", "Arcane Shots");
  poolSummary("psionicEnergy", "Psionic Energy");
  const namedAbilitySummary = (abilityId, label) => {
    const ability = abilities.find((entry) => entry.id === abilityId);
    if (!ability) return;
    const max = abilityMaxUses(fighter, ability);
    const remaining = Math.max(0, max - (fighter.abilityUses?.[ability.id] ?? 0));
    parts.push(`${label}: ${remaining}/${max}`);
  };
  namedAbilitySummary("giantsMight", "Giant's Might");
  namedAbilitySummary("fightingSpirit", "Fighting Spirit");
  namedAbilitySummary("rage", "Rage");
  return parts.join(" - ");
}

function subclassGameplayGuideText(subclass) {
  return (subclass?.gameplayGuide ?? []).join(" ");
}

function subclassGameplayGuideMarkup(subclass) {
  const guide = subclass?.gameplayGuide ?? [];
  if (!guide.length) return "";
  return `
    <div class="subclass-guide">
      <div class="subclass-guide-title"><span class="choice-info-glyph" aria-hidden="true">i</span><b>How to use this subclass</b></div>
      ${guide.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
    </div>
  `;
}

function inspectDetailsMarkup({ title, meta = "", body = "", emptyText = "", open = false }) {
  const content = body || (emptyText ? `<p class="empty-note">${escapeHtml(emptyText)}</p>` : "");
  if (!content) return "";
  return `
    <details class="inspect-collapse" ${open ? "open" : ""}>
      <summary>
        <span>${escapeHtml(title)}</span>
        ${meta ? `<small>${escapeHtml(meta)}</small>` : ""}
      </summary>
      <div class="inspect-collapse-body">${content}</div>
    </details>
  `;
}

function featureLineMarkup(line) {
  const [name, ...rest] = String(line ?? "").split(":");
  if (!rest.length) return `<p class="feature-line"><b>${escapeHtml(name)}</b></p>`;
  return `<p class="feature-line"><b>${escapeHtml(name)}</b>: ${escapeHtml(rest.join(":").trim())}</p>`;
}

function spellLevelLabel(level) {
  return level === 0 ? "Cantrips" : `Level ${level} Spells`;
}

function groupedSpellsByLevel(spells = []) {
  return [...spells]
    .sort((a, b) => spellBaseLevel(a) - spellBaseLevel(b) || a.name.localeCompare(b.name))
    .reduce((groups, spell) => {
      const level = spellBaseLevel(spell);
      if (!groups.has(level)) groups.set(level, []);
      groups.get(level).push(spell);
      return groups;
    }, new Map());
}

function spellbookInspectMarkup(spells = []) {
  return Array.from(groupedSpellsByLevel(spells).entries())
    .map(
      ([level, levelSpells]) => `
        <details class="inspect-nested-collapse">
          <summary>${escapeHtml(spellLevelLabel(level))} <small>${levelSpells.length}</small></summary>
          <div class="inspect-collapse-body">
            ${levelSpells
              .map((spell) => `<p><b>${escapeHtml(spell.name)}</b>${spell.description ? ` ${escapeHtml(spell.description)}` : ""}</p>`)
              .join("")}
          </div>
        </details>
      `,
    )
    .join("");
}

function temporaryEffectDurationText(effect) {
  if (effect.expiresAtHome) return "";
  if (effect.expiresAtStartOfTurn) return "Until start of turn";
  if (effect.expiresAtEndOfTurn) return "Until end of turn";
  if (effect.startsOnNextEncounter && !effect.expiresAtDungeonTimeSeconds) return "Next encounter";
  const remainingSeconds = timedEffectRemainingSeconds(effect);
  if (remainingSeconds != null) return formatDuration(remainingSeconds);
  if (effect.durationRounds) return `${effect.durationRounds} round${effect.durationRounds === 1 ? "" : "s"}`;
  return "Temporary";
}

function temporaryEffectDetails(effect) {
  const parts = [];
  if (effect.acBonus) parts.push(`${abilityLabel(effect.acBonus)} AC`);
  if (effect.attackBonus) parts.push(`${abilityLabel(effect.attackBonus)} to attack`);
  if (effect.spellAttackBonus) parts.push(`${abilityLabel(effect.spellAttackBonus)} to spell attacks`);
  if (effect.saveDcBonus) parts.push(`${abilityLabel(effect.saveDcBonus)} spell save DC`);
  if (effect.damageBonus) parts.push(`${abilityLabel(effect.damageBonus)} damage`);
  if (effect.skillBonus) parts.push(`${abilityLabel(effect.skillBonus)} skill checks`);
  if (effect.saveBonus) parts.push(`${abilityLabel(effect.saveBonus)} saves`);
  if (effect.speedBonusFeet) parts.push(`${abilityLabel(effect.speedBonusFeet)} ft speed`);
  if (effect.speedMultiplier != null && effect.speedMultiplier !== 1) parts.push(`${Math.round(effect.speedMultiplier * 100)}% speed`);
  if (effect.maxHpBonus) parts.push(`${abilityLabel(effect.maxHpBonus)} max HP`);
  if (effect.maxHpMultiplier != null && effect.maxHpMultiplier !== 1) parts.push(`${Math.round(effect.maxHpMultiplier * 100)}% max HP`);
  if (effect.maxHpPenaltyPercent) parts.push(`-${effect.maxHpPenaltyPercent}% max HP`);
  if (effect.healingReceivedMultiplier === 0) parts.push("cannot heal");
  else if (effect.healingReceivedMultiplier != null && effect.healingReceivedMultiplier < 1) parts.push(`${Math.round(effect.healingReceivedMultiplier * 100)}% healing received`);
  if (effect.extraHitDice) parts.push(`${abilityLabel(effect.extraHitDice)} hit dice`);
  if (effect.secondWindBonus) parts.push(`${abilityLabel(effect.secondWindBonus)} Second Wind use`);
  if (effect.spellPointBonus && !effect.classBonusLines?.length) parts.push(`${abilityLabel(effect.spellPointBonus)} spell points`);
  if (effect.sneakAttackDiceBonus) parts.push(`${abilityLabel(effect.sneakAttackDiceBonus)} Sneak Attack dice`);
  if (effect.classBonusLines?.length) parts.push(...effect.classBonusLines);
  if (effect.attackAdvantage) parts.push("attack advantage");
  if (effect.incomingAttackAdvantage) parts.push("attackers have advantage");
  if (effect.meleeAutoCritical) parts.push("hits from within 5 ft are critical");
  if (effect.stealthAdvantage) parts.push("Stealth advantage");
  if (effect.ignoredByMonsters) parts.push("ignored by monsters when targeted");
  if (effect.speedLocked) parts.push("movement locked");
  if (effect.actionLocked) parts.push("action locked");
  if (effect.resistances?.length) parts.push(`resists ${effect.resistances.join(", ")}`);
  if (effect.immunities?.length || effect.damageImmunities?.length) parts.push(`immune to ${(effect.immunities ?? effect.damageImmunities).join(", ")}`);
  if (effect.vulnerabilities?.length) parts.push(`vulnerable to ${effect.vulnerabilities.join(", ")}`);
  if (effect.tempHp) parts.push(`${effect.tempHp} temporary HP`);
  if (effect.conditionDescription) parts.push(effect.conditionDescription);
  return parts.join("; ");
}

function restRefreshLabel(refresh) {
  if (refresh === "shortRest") return "short rest";
  if (refresh === "longRest") return "long rest";
  if (refresh === "turn") return "turn";
  if (refresh === "encounter") return "combat";
  return "rest";
}

function scaledSubclassValue(hero, value, fallback = 0) {
  if (typeof value === "number") return value;
  if (!value || typeof value !== "object") return fallback;
  const level = hero?.level ?? 1;
  let total = Number(value.base ?? 0);
  if (value.levelMultiplier) total += level * value.levelMultiplier;
  if (value.proficiencyMultiplier) total += proficiencyBonus(hero) * value.proficiencyMultiplier;
  if (value.ability && value.abilityMultiplier) total += abilityMod(hero, value.ability) * value.abilityMultiplier;
  for (const entry of value.byLevel ?? []) {
    if (level >= (entry.level ?? 1)) total = entry.value;
  }
  return Math.max(value.min ?? -Infinity, Math.floor(total));
}

function scaledSubclassDice(hero, dice = {}) {
  const level = hero?.level ?? 1;
  let sides = dice.sides ?? 6;
  for (const entry of dice.sidesByLevel ?? []) {
    if (level >= (entry.level ?? 1)) sides = entry.sides;
  }
  return {
    ...dice,
    count: scaledSubclassValue(hero, dice.count, 1),
    sides: scaledSubclassValue(hero, sides, 6),
    bonus: scaledSubclassValue(hero, dice.bonus, 0),
  };
}

function scaledSubclassStatus(hero, status = {}) {
  const scaled = { ...status };
  for (const key of ["acBonus", "attackBonus", "damageBonus", "skillBonus", "saveBonus", "speedBonusFeet", "maxHpBonus", "extraHitDice", "secondWindBonus", "spellPointBonus", "sneakAttackDiceBonus", "tempHp"]) {
    if (scaled[key] && typeof scaled[key] === "object") scaled[key] = scaledSubclassValue(hero, scaled[key]);
  }
  return scaled;
}

function scaledSubclassAmount(hero, value) {
  return scaledSubclassValue(hero, value, Number(value ?? 0) || 0);
}

function diceFormulaText(hero, dice) {
  if (!dice) return "";
  const scaled = scaledSubclassDice(hero, dice);
  const count = scaled.count ?? 1;
  const sides = scaled.sides ?? 6;
  const bonus = scaled.bonus ? ` ${scaled.bonus > 0 ? "+" : "-"} ${Math.abs(scaled.bonus)}` : "";
  return `${count}d${sides}${bonus}`;
}

function subclassStatusTargetLabel(kind, target) {
  if (kind === "partyStatus" || target === "party") return "the party";
  if (kind === "allyStatus" || target === "ally") return "one ally";
  if (kind === "targetStatus") return "one enemy";
  return "you";
}

function subclassEffectMechanicalText(hero, effect = {}) {
  if (!effect.kind) return "";
  if (["selfStatus", "allyStatus", "partyStatus", "targetStatus"].includes(effect.kind)) {
    const target = subclassStatusTargetLabel(effect.kind, effect.target);
    const status = scaledSubclassStatus(hero, effect.status ?? {});
    const details = temporaryEffectDetails(status);
    const duration = temporaryEffectDurationText(status);
    return details ? `${target} gains ${details} for ${duration}.` : "";
  }
  if (effect.kind === "partyHeal") return `Heals the party for ${scaledSubclassAmount(hero, effect.amount)} HP.`;
  if (effect.kind === "partyHealStatus") {
    const status = scaledSubclassStatus(hero, effect.status ?? {});
    const details = temporaryEffectDetails(status);
    const duration = temporaryEffectDurationText(status);
    return `Heals the party for ${scaledSubclassAmount(hero, effect.amount)} HP${details ? `, then the party gains ${details} for ${duration}` : ""}.`;
  }
  if (effect.kind === "selfHeal") return `Heals you for ${scaledSubclassAmount(hero, effect.amount)} HP.`;
  if (effect.kind === "restoreSpellPoints") return `Restores ${scaledSubclassAmount(hero, effect.amount)} spell points.`;
  if (effect.kind === "bonusAttack") return "Make one extra weapon attack.";
  if (effect.kind === "summonAlly") return `Summons ${effect.name ?? "an ally"} to fight beside the party${effect.durationRounds ? ` for ${effect.durationRounds} rounds` : " for this fight"}.`;
  if (effect.kind === "dominateTarget") return `Briefly turns one enemy against its allies for ${effect.durationRounds ?? 1} round; powerful foes are weakened instead.`;
  if (effect.kind === "interruptSpell") return `Reaction prompt: interrupt an enemy spell-like power${effect.restoreSpellPoints ? ` and restore ${effect.restoreSpellPoints} spell points` : ""}.`;
  if (effect.kind === "revealTraps") {
    const details = temporaryEffectDetails(scaledSubclassStatus(hero, effect.status ?? {}));
    return `Reveals nearby traps${details ? ` and gives you ${details}` : ""}.`;
  }
  if (effect.kind === "wildSurge") return "Rolls a useful random wild-magic combat boon.";
  if (effect.kind === "rider") {
    const damage = diceFormulaText(hero, effect.dice);
    const rider = effect.riderStatus ? ` and applies ${effect.riderStatus}` : "";
    return `Your next weapon hit deals ${damage} ${effect.damageType ?? "damage"}${rider}.`;
  }
  if (effect.kind === "damageTarget") {
    const damage = diceFormulaText(hero, effect.dice);
    const rider = effect.riderStatus ? ` and applies ${effect.riderStatus}` : "";
    return `Deals ${damage} ${effect.damageType ?? "damage"} to one enemy${rider}.`;
  }
  if (effect.kind === "aoeDamage") {
    const damage = diceFormulaText(hero, effect.dice);
    const rider = effect.riderStatus ? ` and applies ${effect.riderStatus}` : "";
    return `Deals ${damage} ${effect.damageType ?? "damage"} in a ${effect.radius ?? 3}-tile burst${rider}.`;
  }
  return "";
}

function subclassAbilityMechanicalText(hero, ability) {
  if (!ability) return "";
  const cost = abilityCostLabel(ability);
  const maxUses = abilityMaxUses(hero, ability);
  const refresh = abilityRefreshForFighter(hero, ability);
  const useText = maxUses > 0 ? `${maxUses}/${restRefreshLabel(refresh)}` : restRefreshLabel(refresh);
  const pool = ability.resourcePool ? ` Spends ${ability.resourcePool}.` : "";
  const effectText = subclassEffectMechanicalText(hero, ability.subclassEffect);
  return `${ability.name}: ${cost}, ${useText}.${pool}${effectText ? ` ${effectText}` : ""}`;
}

function bardicInspirationDieSidesForLevel(level) {
  return level >= 15 ? 12 : level >= 10 ? 10 : level >= 5 ? 8 : 6;
}

function classSneakAttackDiceForLevel(level) {
  return Math.ceil(Math.max(1, level) / 2);
}

function classMovementBonusText(hero) {
  const level = hero?.level ?? 1;
  if (hero?.classId === "barbarian" && level >= 5) return "Your speed increases by 10 ft while you are not wearing heavy armor.";
  if (hero?.classId === "monk" && level >= 2) {
    const bonus = level >= 18 ? 30 : level >= 14 ? 25 : level >= 10 ? 20 : level >= 6 ? 15 : 10;
    return `Your speed increases by ${bonus} ft while you are not wearing armor or using a shield.`;
  }
  return "";
}

function proficiencyListText(values = [], formatter = (value) => value) {
  const entries = uniqueValues(values).filter(Boolean);
  return entries.length ? entries.map(formatter).join(", ") : "None";
}

function heroProficienciesMarkup(fighter, classTemplate = null) {
  const saveText = proficiencyListText(fighter.savingThrowProficiencies ?? classTemplate?.savingThrowProficiencies ?? [], (value) => String(value).toUpperCase());
  const skillText = proficiencyListText(fighter.skillProficiencies ?? [], skillName);
  const toolText = proficiencyListText(fighter.toolProficiencies ?? [], toolName);
  const armorText = proficiencyListText(fighter.armorProficiencies ?? classTemplate?.armorProficiencies ?? [], titleCaseTag);
  const weaponText = proficiencyListText(fighter.weaponProficiencies ?? classTemplate?.weaponProficiencies ?? [], titleCaseTag);
  return `
    <div class="equipment-summary">
      <div><b>Saving Throws</b><span>${escapeHtml(saveText)}</span></div>
      <div><b>Skills</b><span>${escapeHtml(skillText)}</span></div>
      <div><b>Tools</b><span>${escapeHtml(toolText)}</span></div>
      <div><b>Armor</b><span>${escapeHtml(armorText)}</span></div>
      <div><b>Weapons</b><span>${escapeHtml(weaponText)}</span></div>
    </div>
  `;
}

function classFeatureInspectionDescription(hero, feature, abilityDefinitions = []) {
  const level = hero?.level ?? 1;
  const name = feature.name ?? "";
  const ability = abilityDefinitions.find((entry) => entry.name === name || entry.id === name);
  if (hero?.classId === "barbarian") {
    if (name === "Rage") return `Bonus action. ${abilityMaxUses(hero, ability)} uses per long rest at this level. For 10 rounds, resist bludgeoning, piercing, and slashing damage and add +${rageDamageBonus(hero)} damage to Strength-based melee hits. The damage bonus becomes +3 at level 9 and +4 at level 16.`;
    if (name === "Reckless Attack") return "Free once per turn. Your attack rolls have advantage until the end of your turn, then attacks against you have advantage until your next turn starts.";
    if (name === "Fast Movement") return classMovementBonusText(hero) || feature.description;
    if (name === "Feral Instinct") return "You roll initiative with advantage, helping you act earlier when combat begins.";
    if (name === "Brutal Critical") return `On a melee critical hit, roll extra weapon damage dice: +${level >= 17 ? 3 : level >= 13 ? 2 : 1} weapon die at this level.`;
    if (name === "Primal Champion") return "Your Strength and Constitution each increase by 4, raising attacks, damage, HP, and Constitution-based checks.";
  }
  if (hero?.classId === "monk") {
    if (name === "Martial Arts") return `Your unarmed strikes use a d${monkMartialArtsDamageDie(hero)} Martial Arts die at this level. The die becomes d6 at level 5, d8 at level 11, and d10 at level 17.`;
    if (name === "Ki") return `You have ${abilityMaxUses(hero, { resourcePool: "ki" })} ki at this level, refreshing on a short or long rest. Spend it on monk techniques such as Flurry of Blows and Patient Defense.`;
    if (name === "Unarmored Movement") return classMovementBonusText(hero) || feature.description;
    if (name === "Extra Attack") return "When you take the Attack action, you attack twice.";
    if (name === "Stunning Strike") return "Bonus action before a hit. Spend 1 ki; your next hit stuns the target for 1 round, locking movement and actions.";
    if (name === "Perfect Self") return "When combat begins and all your ki is spent, you automatically recover 4 ki.";
  }
  if (hero?.classId === "paladin") {
    if (name === "Lay on Hands") return `Action. Your healing pool is ${abilityMaxUses(hero, ability)} HP at this level, equal to 5 x paladin level. Choose yourself or an adjacent ally, then spend points to heal or spend 5 points to cure one disease.`;
    if (name === "Divine Smite") return "Bonus action before a weapon hit. Spend up to 5 spell points; the next hit deals radiant damage starting at 2d8 and increasing with more spell points.";
    if (name === "Aura of Protection") return `Allies within 10 ft add +${Math.max(1, abilityMod(hero, "cha"))} to saving throws from your Charisma.`;
  }
  if (hero?.classId === "rogue") {
    if (name === "Sneak Attack") return `Once per turn, deal +${classSneakAttackDiceForLevel(level)}d6 damage with a finesse or ranged weapon when you have advantage or an ally is next to the target.`;
    if (name === "Cunning Action") return "Bonus action each turn: Dash, Disengage, or Hide.";
    if (name === "Uncanny Dodge") return "Reaction once per round: when an attack hits you, halve that attack's damage.";
    if (name === "Evasion") return "On Dexterity saving throws against area damage, take no damage on a success and half damage on a failure.";
    if (name === "Reliable Talent") return "When you make a proficient skill check, d20 rolls from 2 to 9 count as 10.";
  }
  if (hero?.classId === "bard") {
    if (name === "Bardic Inspiration") return `Bonus action. ${abilityMaxUses(hero, ability)} uses per ${restRefreshLabel(abilityRefreshForFighter(hero, ability))}. Give an ally a d${bardicInspirationDieSidesForLevel(level)} they can add to a missed attack or failed save. The die becomes d8 at level 5, d10 at level 10, and d12 at level 15.`;
    if (name === "Jack of All Trades") return `Add +${Math.floor(proficiencyBonus(hero) / 2)} to skill checks where you are not proficient.`;
    if (name === "Font of Inspiration") return "Starting at level 5, Bardic Inspiration refreshes on a short rest instead of only a long rest.";
  }
  if (hero?.classId === "cleric") {
    if (name === "Channel Divinity") return `Action. ${abilityMaxUses(hero, ability)} use${abilityMaxUses(hero, ability) === 1 ? "" : "s"} per short rest. This version releases a radiant burst against nearby enemies; domains may add other uses.`;
    if (name === "Blessed Strike") return "Once per turn, your weapon hit or damaging cantrip adds 1d8 extra divine damage.";
  }
  if (hero?.classId === "druid") {
    if (name === "Wild Shape") return "Bonus action. 2 uses per short rest. Transform into an unlocked beast form; beast HP absorbs damage first, and overflow carries over when you revert.";
  }
  if (hero?.classId === "wizard") {
    if (name === "Arcane Recovery") return `Free action once per long rest. Recover ${Math.max(1, Math.ceil(level / 2))} spell point${Math.max(1, Math.ceil(level / 2)) === 1 ? "" : "s"}.`;
    if (name === "Spell Mastery") return "Free action once per short rest at level 18. Recover 4 spell points for your mastered low-level magic.";
    if (name === "Signature Spells") return "Free action once per long rest at level 20. Recover 10 spell points for your favored wizard spells.";
  }
  if (hero?.classId === "warlock") {
    if (name === "Pact Magic") return `Your spell points are pact magic and come back on a short rest. Current maximum: ${spellPointMaximum(hero)} SP.`;
    if (name === "Eldritch Blast") return "Action. Fire your signature force blast; it gains more beams as warlock level rises.";
    if (name === "Mystic Arcanum") return "Action once per long rest at level 11. Blast one visible enemy for 6d8 force damage and briefly banish it.";
    if (name === "Eldritch Master") return "Action once per long rest at level 20. Restore pact spell points to full.";
  }
  if (ability) return `${feature.description ?? ""} ${subclassAbilityMechanicalText(hero, ability)}`.trim();
  return feature.description ?? "";
}

function subclassFeatureInspectionDescription(hero, subclass, feature) {
  const base = feature.description ?? "";
  const featureName = String(feature.name ?? "").toLowerCase();
  const relatedAbilities = (subclass?.abilities ?? []).filter((ability) => {
    if ((ability.level ?? 1) !== (feature.level ?? 1)) return false;
    const abilityName = String(ability.name ?? "").toLowerCase();
    return abilityName === featureName || abilityName.includes(featureName) || featureName.includes(abilityName);
  });
  const mechanicalText = relatedAbilities
    .map((ability) => subclassAbilityMechanicalText(hero, ability))
    .filter(Boolean)
    .join(" ");
  if (!mechanicalText) return base;
  return `${base} ${mechanicalText}`;
}

function temporaryEffectsForFighter(fighter) {
  const effects = [];
  if (!fighter) return effects;
  if (fighter.hp <= 0 && !fighter.dead) {
    const stable = heroIsStableAtZero(fighter);
    effects.push({
      id: stable ? "stable" : "dying",
      label: stable ? "Stable" : "Dying",
      detail: stable
        ? "Stable at 0 HP."
        : `Death saves ${fighter.deathSaves?.successes ?? 0}/3 successes, ${fighter.deathSaves?.failures ?? 0}/3 failures.`,
      duration: "Until healed or death saves resolve",
    });
  }
  if (fighter.dodging) effects.push({ id: "dodging", label: "Dodging", detail: "Incoming attacks have disadvantage.", duration: "Until start of next turn" });
  if (fighter.disengaged) effects.push({ id: "disengaged", label: "Disengaged", detail: "Movement does not provoke opportunity attacks.", duration: "Until end of turn" });
  const lightCondition = derivedLightConditionForFighter(fighter);
  if (lightCondition) effects.push(lightCondition);
  for (const effect of fighter.statusEffects ?? []) {
    effects.push({
      id: effect.id,
      label: effect.label ?? effect.id,
      detail: temporaryEffectDetails(effect),
      duration: temporaryEffectDurationText(effect),
    });
  }
  return effects;
}

function temporaryEffectsMarkup(fighter) {
  const effects = temporaryEffectsForFighter(fighter);
  if (!effects.length) return `<p class="empty-note">No active temporary effects.</p>`;
  return `
    <section class="temporary-effects-list">
      ${effects
        .map(
          (effect) => `
            <div class="temporary-effect-row">
              <b>${escapeHtml(effect.label)}</b>
              <span>${escapeHtml([effect.detail, effect.duration].filter(Boolean).join(" - "))}</span>
            </div>
          `,
        )
        .join("")}
    </section>
  `;
}

function showTemporaryEffectsInfo(fighter = activeHero()) {
  if (!fighter) return;
  els.fighterInfo.classList.remove("home-builder-dock");
  els.fighterInfoName.textContent = `${fighter.name} - Temporary Effects`;
  els.fighterInfoBody.innerHTML = temporaryEffectsMarkup(fighter);
  els.fighterInfo.classList.remove("hidden");
}

function allyFollowControlsMarkup(ally) {
  if (!isAutonomousAlly(ally) || !isPartyHeroId(ally.id)) return "";
  const heroes = partyHeroes().filter((fighter) => isClassHero(fighter) && !fighter.dead);
  if (!heroes.length) return "";
  const selectedHeroId = heroes.some((hero) => hero.id === ally.followHeroId)
    ? ally.followHeroId
    : followLeaderForAlly(ally)?.id ?? heroes[0].id;
  const selectedDistance = followDistanceForAlly(ally);
  return `
    <section class="inspect-section">
      <h3>Follow</h3>
      <div class="equipment-summary">
        <div>
          <b>Hero</b>
          <span>
            <select data-action="ally-follow-hero" data-ally="${escapeAttribute(ally.id)}">
              ${heroes.map((hero) => `<option value="${escapeAttribute(hero.id)}" ${hero.id === selectedHeroId ? "selected" : ""}>${escapeHtml(hero.name)}</option>`).join("")}
            </select>
          </span>
        </div>
        <div>
          <b>Distance</b>
          <span>
            <select data-action="ally-follow-distance" data-ally="${escapeAttribute(ally.id)}">
              ${[1, 2, 3, 4, 5].map((value) => `<option value="${value}" ${value === selectedDistance ? "selected" : ""}>${value} sq</option>`).join("")}
            </select>
          </span>
        </div>
      </div>
    </section>
  `;
}

function setAllyFollowHero(allyId, heroId) {
  const ally = state.fighters[allyId];
  const hero = state.fighters[heroId];
  if (!isAutonomousAlly(ally) || !isClassHero(hero) || !isPartyHeroId(hero.id)) return;
  ally.followHeroId = hero.id;
  syncAutonomousAllyStealthWithLeader(hero);
  addLog(`${ally.name} now follows ${hero.name}.`, "important");
  showCombatantInfo(ally);
  render();
}

function setAllyFollowDistance(allyId, distanceSquares) {
  const ally = state.fighters[allyId];
  if (!isAutonomousAlly(ally)) return;
  ally.followDistanceSquares = Math.max(1, Math.min(5, Number(distanceSquares) || 3));
  addLog(`${ally.name} keeps within ${ally.followDistanceSquares} sq of ${state.fighters[ally.followHeroId]?.name ?? followLeaderForAlly(ally)?.name ?? "the party leader"}.`, "important");
  showCombatantInfo(ally);
  render();
}

async function renameHero() {
  const hero = activeHero();
  if (hero?.renameable === false) {
    addLog(`${hero.name} cannot be renamed.`, "important");
    render();
    return;
  }
  const identity = await showHeroIdentityDialog({
    title: "Character Name",
    message: "Rename your adventurer.",
    nameValue: hero.name,
    tokenArt: hero.tokenArt ?? "",
    confirmText: "Rename",
  });
  if (!identity) return;

  hero.name = (identity.name || hero.name).slice(0, 32);
  hero.tokenArt = identity.tokenArt;
  hero.token = tokenFromName(hero.name, hero.token);
  addLog(`Character renamed to ${hero.name}.`, "important");
  render();
}

function corpseCanBeHandledHere(corpseHero) {
  if (!corpseHero?.dead) return false;
  if (state.mode === "home") return heroCorpseLocation(corpseHero) === "base";
  if (heroCorpseLocation(corpseHero) !== "dungeon") return false;
  const hero = activeHero();
  if (!heroCanAct(hero)) return false;
  if (state.mode === "combat" && activeFighter()?.id !== hero.id) return false;
  return corpseHero.position && hero.position && distance(hero.position, corpseHero.position) <= 1;
}

function corpseLootRows(corpseHero, canLoot) {
  const items = corpseHero.inventory?.items ?? [];
  const moneyCp = moneyToCp(corpseHero.inventory?.money ?? {});
  const heroTokens = corpseHero.inventory?.heroTokens ?? 0;
  const rows = items.map((item) => {
    const equipped = Object.values(corpseHero.equipment ?? {}).includes(item.id);
    return `
      <div class="object-inventory-row">
        <div>
          <b>${escapeHtml(item.name)}</b>
          <span>${escapeHtml(`${itemDetails(item)}${equipped ? " - equipped" : ""}`)}</span>
        </div>
        <button type="button" data-action="loot-corpse-item" data-corpse="${escapeAttribute(corpseHero.id)}" data-item="${escapeAttribute(item.id)}" ${canLoot ? "" : "disabled"}>Take</button>
      </div>
    `;
  });
  if (moneyCp > 0 || heroTokens > 0) {
    rows.unshift(`
      <div class="object-inventory-row">
        <div>
          <b>Coins and Tokens</b>
          <span>${escapeHtml([moneyCp ? moneyText(corpseHero.inventory.money) : "", heroTokens ? `${heroTokens} Hero Token${heroTokens === 1 ? "" : "s"}` : ""].filter(Boolean).join(" - "))}</span>
        </div>
        <button type="button" data-action="loot-corpse-money" data-corpse="${escapeAttribute(corpseHero.id)}" ${canLoot ? "" : "disabled"}>Take</button>
      </div>
    `);
  }
  return rows.join("") || `<p class="empty-note">No belongings remain on the body.</p>`;
}

function corpseSpellChoices(corpseHero, spellIds, { requireBase = false } = {}) {
  if (requireBase && state.mode !== "home") return [];
  const casters = (state.mode === "home" ? rosterHeroes() : [activeHero()]).filter((hero) => heroCanAct(hero) && !hero.dead);
  const choices = [];
  for (const caster of casters) {
    for (const spellId of spellIds) {
      const baseSpell = spellDefinitionsForFighter(caster).find((spell) => spell.id === spellId || spell.aliasOf === spellId);
      if (!baseSpell) continue;
      const spell = spellWithCastLevel(baseSpell, spellBaseLevel(baseSpell));
      const allowed =
        spell.effect?.kind === "revive"
          ? canSpellReviveCorpse(caster, spell, corpseHero)
          : spell.effect?.kind === "preserveCorpse" && canPaySpellCost(caster, spell);
      choices.push({ caster, spell, allowed });
    }
  }
  return choices;
}

function corpseSpellButtons(corpseHero, spellIds, options = {}) {
  return corpseSpellChoices(corpseHero, spellIds, options)
    .map(({ caster, spell, allowed }) => {
      const cost = spellPointCost(spell);
      return `<button type="button" data-action="cast-corpse-spell" data-corpse="${escapeAttribute(corpseHero.id)}" data-caster="${escapeAttribute(caster.id)}" data-spell="${escapeAttribute(spell.id)}" ${allowed ? "" : "disabled"}>${escapeHtml(spell.name)} - ${escapeHtml(caster.name)} (${cost} SP)</button>`;
    })
    .join("");
}

function corpseInfoMarkup(corpseHero) {
  ensureHeroCorpseState(corpseHero);
  const canHandle = corpseCanBeHandledHere(corpseHero);
  const status = corpseDecompositionStatus(corpseHero);
  const preservationButtons = corpseSpellButtons(corpseHero, ["gentle-repose"]);
  const dungeonReviveButtons = state.mode !== "home" ? corpseSpellButtons(corpseHero, ["revivify"]) : "";
  const transportButton =
    state.mode !== "home" && heroCorpseLocation(corpseHero) === "dungeon"
      ? `<button type="button" data-action="transport-corpse-base" data-corpse="${escapeAttribute(corpseHero.id)}" ${canHandle ? "" : "disabled"}>Transport to Base</button>`
      : "";
  return `
    <section class="inspect-section corpse-inspect-section">
      <h3>Corpse</h3>
      <p class="empty-note">${escapeHtml(status.label)} - ${escapeHtml(status.detail)}</p>
      <div class="object-actions">
        ${transportButton}
        ${preservationButtons || ""}
        ${dungeonReviveButtons || ""}
      </div>
      <section class="object-inventory">
        <h3>Belongings</h3>
        ${corpseLootRows(corpseHero, canHandle)}
      </section>
    </section>
  `;
}

function showCombatantInfo(fighter) {
  els.fighterInfo.classList.remove("home-builder-dock");
  refreshDerivedStats(fighter);
  const heroView = (isClassHero(fighter) || isSidekickWarrior(fighter)) && (isPartyHeroId(fighter.id) || isRosterHeroId(fighter.id));
  const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
  const temporaryHpText = (fighter.temporaryHp ?? 0) > 0 ? ` <small>(+${fighter.temporaryHp} temp)</small>` : "";
  const weapon = activeWeapon(fighter);
  const torso = equippedItem(fighter, "torso");
  const profileRange = fighter.damage?.range ?? weapon?.range ?? { kind: "melee", feet: 5 };
  const range = `${profileRange.kind}${profileRange.feet ? ` ${profileRange.feet} ft` : ""}`;
  const weaponName = weapon?.name ?? fighter.damage?.weaponName ?? fighter.baseDamage?.weaponName ?? "Natural weapon";
  const abilities = ["str", "dex", "con", "int", "wis", "cha"];
  const heroTemplate = heroView ? getHeroTemplate(fighter.classId) : null;
  const racialTraits = heroView && isClassHero(fighter) ? activeRaceFeatureLinesForFighter(fighter).slice(2) : [];
  const subclass = heroView ? subclassDefinitionForHero(fighter) : null;
  const subclassFeatures = subclass
    ? (subclass.features ?? []).filter((feature) => (feature.level ?? 1) <= (fighter.level ?? 1))
    : [];
  const classAbilityDefinitions = heroView
    ? (getHeroTemplate(fighter.classId)?.abilities ?? fighter.abilities ?? [])
    : [];
  const classFeatures = heroView
    ? Array.from(
        new Map(
          [
            ...(heroTemplate?.classFeatures ?? [])
              .filter((feature) => (feature.level ?? 1) <= (fighter.level ?? 1))
              .map((feature) => {
                const ability = classAbilityDefinitions.find((entry) => entry.name === feature.name);
                return [feature.name, { name: feature.name, description: feature.description ?? ability?.description ?? "" }];
              }),
            ...classAbilityDefinitions
              .filter((ability) => (ability.level ?? 1) <= (fighter.level ?? 1))
              .map((ability) => [ability.name, { name: ability.name, description: ability.description ?? "" }]),
          ],
        ).values(),
      )
    : [];
  const spells = heroView
    ? (fighter.spells ?? [])
        .map((spellId) => getContentDefinition("spells", spellId))
        .filter(Boolean)
    : [];
  els.fighterInfoName.textContent = fighter.name;
  els.fighterInfoBody.innerHTML = `
    ${combatantArtworkMarkup(fighter, "inspect-art")}
    <div class="fighter-role">${escapeHtml(combatantRoleLabel(fighter))}</div>
    ${
      heroView
        ? `
          <div class="hp-line">
            <div class="hp-text"><span>HP</span><span>${fighter.hp} / ${fighter.maxHp}${temporaryHpText}</span></div>
            <div class="hp-bar"><div class="hp-fill" style="width: ${hpPercent}%"></div></div>
          </div>
          <div class="stat-grid player-stat-grid">
            <div class="stat-pill"><b>${fighter.ac}</b><span>AC</span></div>
            <div class="stat-pill"><b>${abilityLabel(attackBonus(fighter))}</b><span>To Hit</span></div>
            <div class="stat-pill"><b>${escapeHtml(fighter.damage.label)}</b><span>Damage</span></div>
          </div>
          <div class="equipment-summary">
            <div><b>${isSidekickWarrior(fighter) ? "Creature" : "Race"}</b><span>${escapeHtml(isSidekickWarrior(fighter) ? fighterCreatureType(fighter) || "companion" : [fighter.speciesName, fighter.subraceName].filter(Boolean).join(" - ") || "Unknown")}</span></div>
            <div><b>Class</b><span>${escapeHtml(fighter.className ?? "Adventurer")} ${fighter.level ?? 1}</span></div>
            <div><b>Weapon</b><span>${escapeHtml(weaponName)}</span></div>
            <div><b>Push/Drag/Lift</b><span>${fighter.pushDragLiftLb ?? refreshPushDragLiftStats(fighter)} lb${fighter.racialTraits?.powerfulBuild ? " (Powerful Build)" : ""}</span></div>
          </div>
          <div class="stat-grid ability-grid">
            ${abilities
              .map(
                (ability) => `
                  <div class="stat-pill">
                    <b>${abilityScore(fighter, ability)}</b>
                    <span>${ability.toUpperCase()} ${abilityLabel(abilityMod(fighter, ability))}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
          ${inspectDetailsMarkup({
            title: "Racial Features",
            meta: racialTraits.length ? `${racialTraits.length}` : "",
            body: racialTraits.map(featureLineMarkup).join(""),
            open: true,
          })}
          ${inspectDetailsMarkup({
            title: "Proficiencies",
            meta: "Class and training",
            body: heroProficienciesMarkup(fighter, heroTemplate),
          })}
          ${inspectDetailsMarkup({
            title: "Class Features",
            meta: classFeatures.length ? `${classFeatures.length}` : "",
            body: classFeatures
              .map((feature) => {
                const description = classFeatureInspectionDescription(fighter, feature, classAbilityDefinitions);
                return `<p><b>${escapeHtml(feature.name)}</b>${description ? ` ${escapeHtml(description)}` : ""}</p>`;
              })
              .join(""),
            open: true,
          })}
          ${
            subclass
              ? inspectDetailsMarkup({
                  title: `Subclass Features: ${fullSubclassName(subclass)}`,
                  meta: `${subclassFeatures.length}`,
                  open: true,
                  body: `
                    ${subclassGameplayGuideMarkup(subclass)}
                    ${
                      subclassFeatures.length
                        ? subclassFeatures
                            .map(
                              (feature) => {
                                const description = subclassFeatureInspectionDescription(fighter, subclass, feature);
                                return `<p><b>${escapeHtml(feature.name)}</b> <small>Level ${feature.level ?? 1}</small>${description ? ` ${escapeHtml(description)}` : ""}</p>`;
                              },
                            )
                            .join("")
                        : `<p class="empty-note">No subclass features unlocked yet.</p>`
                    }
                  `,
                })
              : ""
          }
          ${inspectDetailsMarkup({
            title: "Feats",
            meta: fighterFeatDefinitions(fighter).length ? `${fighterFeatDefinitions(fighter).length}` : "",
            body: fighterFeatDefinitions(fighter)
              .map(({ definition }) => `<p><b>${escapeHtml(definition.name)}</b>${definition.description ? ` ${escapeHtml(definition.description)}` : ""}</p>`)
              .join(""),
            open: true,
          })}
          ${inspectDetailsMarkup({
            title: "Spellbook",
            meta: spells.length ? `${spells.length} spells - ${fighter.spellPoints ?? 0}/${fighter.spellPointMax ?? 0} SP` : "",
            body: spells.length ? spellbookInspectMarkup(spells) : "",
          })}
          ${fighter.dead ? corpseInfoMarkup(fighter) : ""}
        `
        : `
          <p class="empty-note">${escapeHtml(fighter.description ?? fighter.role ?? "A hostile creature.")}</p>
          <div class="equipment-summary">
            <div><b>Armor</b><span>${escapeHtml(torso?.name ?? "None")}</span></div>
            <div><b>Weapon</b><span>${escapeHtml(weaponName)}</span></div>
          </div>
        `
    }
    <section class="inspect-section">
      <h3>Temporary Effects</h3>
      ${temporaryEffectsMarkup(fighter)}
    </section>
    ${allyFollowControlsMarkup(fighter)}
    <button type="button" class="inspect-admin-toggle" data-action="toggle-inspect-admin" aria-label="Show technical details">i</button>
    <section class="inspect-admin-details hidden">
      <div class="stat-grid">
        <div class="stat-pill"><b>${fighter.ac}</b><span>AC</span></div>
        <div class="stat-pill"><b>${abilityLabel(attackBonus(fighter))}</b><span>Attack</span></div>
        <div class="stat-pill"><b>${fighter.damage.label}</b><span>Damage</span></div>
        <div class="stat-pill"><b>${fighter.speedFeet} ft</b><span>Speed</span></div>
        <div class="stat-pill"><b>${fighter.movementLeft * feetPerSquare} ft</b><span>Move Left</span></div>
        <div class="stat-pill"><b>${abilityLabel(fighter.initiativeBonus)}</b><span>Init</span></div>
        <div class="stat-pill"><b>${fighter.hasAction ? "Yes" : "No"}</b><span>Action</span></div>
        <div class="stat-pill"><b>${fighter.hasBonusAction ? "Yes" : "No"}</b><span>Bonus</span></div>
        <div class="stat-pill"><b>${fighter.alive ? "Yes" : "No"}</b><span>Alive</span></div>
        <div class="stat-pill"><b>${fighter.level ?? 1}</b><span>Level</span></div>
        <div class="stat-pill"><b>${fighter.xp ?? 0}</b><span>XP</span></div>
      </div>
      <div class="equipment-summary">
        <div><b>Range</b><span>${escapeHtml(range)}</span></div>
        <div><b>ID</b><span>${escapeHtml(fighter.id ?? "")}</span></div>
      </div>
      ${heroView ? `<div class="wallet-line">Money: ${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>` : ""}
    </section>
  `;
  els.fighterInfo.classList.remove("hidden");
}

function showDungeonObjectInfo(object) {
  els.fighterInfo.classList.remove("home-builder-dock");
  const template =
    object.type === "homeChest"
      ? { name: "Home Chest", kind: "container", width: 1, height: 1, blocksMovement: true, interactable: true, description: "Your home storage chest." }
      : object.type === "dungeonExit"
        ? { name: "Dungeon Exit", kind: "exit", width: 1, height: 1, blocksMovement: false, interactable: true, description: "The way out. Reach it after clearing the exit room to complete the dungeon." }
      : object.type === "homeExit"
        ? { name: "Home Door", kind: "exit", width: 1, height: 1, blocksMovement: false, interactable: true, description: "The door leading from home to the next dungeon." }
      : objectTemplate(object.type);
  if (!template) return;
  void triggerCustomDungeonStory("inspectObject", { objectId: object.id, object });
  const hero = activeHero();
  const objectInteractionAdjacent = (cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1;
  const objectAdjacent =
    object.type === "homeChest"
      ? distance(hero.position, homeChestPosition()) <= 1
      : object.type === "dungeonExit" || object.type === "homeExit"
        ? distance(hero.position, object.position) <= 1
        : objectCells(object).some(objectInteractionAdjacent);
  const canActInCombat = state.mode !== "combat" || activeFighter()?.id === hero?.id;
  const isHomeChest = object.type === "homeChest";
  const isHomePlacedContainer = homeObjectIsStorage(object, template);
  const isHomeStorage = isHomeChest || isHomePlacedContainer;
  const homeBed = state.mode === "home" && object.homePlaced ? objectComponent(object.type, "homeBed") : null;
  const playableInstrument = state.mode === "home" && object.homePlaced ? objectComponent(object.type, "playableInstrument") : null;
  const objectLocked = !isHomeChest && object.locked === true;
  const specialLock = normalizeSpecialLock(object.specialLock);
  const canLootObject = (objectHasLoot(object) || isHomeChest || isHomePlacedContainer) && objectAdjacent && canActInCombat && !objectLocked;
  const heroTriedLock = Boolean(object.lockAttemptsByHero?.[hero.id]);
  const canPickLock = objectLocked && !specialLock && objectAdjacent && canActInCombat && !heroTriedLock;
  const canAnswerSpecialLock = objectLocked && specialLock && objectAdjacent && canActInCombat;
  const disarmTarget = object.trap ?? object;
  const heroTriedDisarm = Boolean(disarmTarget.disarmAttemptsByHero?.[hero.id]);
  const canDisarm =
    state.mode !== "combat" &&
    objectAdjacent &&
    ((objectIsTrap(object) && object.detected && object.armed !== false && !object.disarmed) ||
      object.trap?.detected) &&
    !heroTriedDisarm;
  const canDispelTrap = canDispelMagicTrap(hero, disarmTarget, object);
  const visibleTrap = object.trap?.detected ? object.trap : objectIsTrap(object) && object.detected ? object : null;
  const canInvestigate = state.mode !== "combat" && objectCanInspect(object) && objectAdjacent && !object.investigated;
  const uniqueInteraction = object.uniqueInteractionClaimed ? null : objectComponent(object, "uniqueInteraction");
  const uniqueInteractionAvailable = Boolean(uniqueInteraction && state.mode !== "combat" && objectAdjacent && canActInCombat);
  const captive = captiveCreatureComponent(object);
  const canFreeCaptive = canFreeCaptiveObject(object);
  const captiveName = captiveCreatureLabel(object);
  const resourceNode = object.resourceNodeClaimed ? null : objectComponent(object, "resourceNode");
  const canFarmResourceNode = Boolean(resourceNode && state.mode !== "combat" && objectAdjacent && canActInCombat);
  const canReachInstrument = Boolean(playableInstrument && objectAdjacent && canActInCombat);
  const instrumentTool = playableInstrument?.requiredTool ?? playableInstrument?.instrument;
  const hasInstrumentProficiency = Boolean(instrumentTool && heroHasToolProficiency(hero, instrumentTool));
  const canPlayInstrument = Boolean(canReachInstrument && hasInstrumentProficiency && playableInstrument?.songs?.length);
  const instrumentLockText = playableInstrument
    ? !objectAdjacent
      ? `Stand next to the ${template.name} to play.`
      : !hasInstrumentProficiency
        ? `Requires ${toolName(instrumentTool)} proficiency.`
        : ""
    : "";
  const destructible = objectIsDestructible(object) ? ensureDestructibleObjectState(object) : null;
  const canAttackObject =
    destructible &&
    canActInCombat &&
    (state.mode !== "combat" || activeFighter()?.hasAction) &&
    isObjectInAttackRangeWithProfile(hero, object, damageProfile(hero));
  const chestItems = object.type === "chest" || isHomeChest || isHomePlacedContainer ? object.items ?? [] : [];
  const objectItems = objectHasLoot(object) || isHomeChest || isHomePlacedContainer ? object.items ?? [] : [];
  const componentLabels = objectComponents(object)
    .map((component) => component.label ?? component.type.replace(/([A-Z])/g, " $1").toLowerCase())
    .join(", ");

  els.fighterInfoName.textContent = template.name;
  els.fighterInfoBody.innerHTML = `
    ${furnitureArtworkMarkup(template, object)}
    <p class="empty-note">${escapeHtml(template.description)}</p>
    ${object.lastResult ? `<p class="object-result">${escapeHtml(object.lastResult)}</p>` : ""}
    ${
      visibleTrap
        ? `<p class="empty-note">${escapeHtml(visibleTrap.description ?? objectTemplate(object.type)?.description ?? "A detected trap.")} Disarm: ${escapeHtml(
            trapDisarmSummary(visibleTrap, object),
          )}${trapIsMagical(visibleTrap, object) ? "; Dispel Magic can also suppress it." : ""}</p>`
        : ""
    }
    ${
      object.type === "home-bookshelf"
        ? `<div class="object-actions">
            <button type="button" data-action="open-monster-compendium">Open Compendium</button>
            <button type="button" data-action="open-library-tutorial" data-topic="homeExpansion">Home Expansion Guide</button>
            <button type="button" data-action="open-library-tutorial" data-topic="comfortZones">Comfort Zones Guide</button>
            <button type="button" data-action="open-library-tutorial" data-topic="stealth">Stealth Guide</button>
          </div>`
        : object.type === "home-cooking-pot"
          ? `<button type="button" data-action="cook-home-meal">Cook Hearty Meal</button>`
          : object.type === "home-herb-garden"
            ? `<button type="button" data-action="harvest-home-herbs">Harvest Medicinal Herbs</button>`
            : ""
    }
    ${
      homeBed
        ? `<section class="object-inventory">
            <h3>Assigned Hero</h3>
            <p class="empty-note">Comfort: ${homeBed.comfort ?? 0}. Nearby furnishings within a ${homeBed.range ?? 4}-square room box may add more.</p>
            <label class="inline-transfer">
              <span>Hero</span>
              <select data-action="assign-home-bed" data-object="${escapeAttribute(object.id)}">
                <option value="">Unassigned</option>
                ${rosterHeroes()
                  .filter((hero) => isClassHero(hero) && !hero.dead)
                  .map((hero) => `<option value="${escapeAttribute(hero.id)}" ${object.assignedHeroId === hero.id ? "selected" : ""}>${escapeHtml(hero.name)}</option>`)
                  .join("")}
              </select>
            </label>
            <button type="button" data-action="show-bed-range" data-object="${escapeAttribute(object.id)}">Show Range</button>
          </section>`
        : ""
    }
    ${
      playableInstrument
        ? `<section class="object-inventory">
            <h3>Music</h3>
            <p class="empty-note">${escapeHtml(instrumentLockText || `${hero.name} can play ${toolName(instrumentTool)} here.`)}</p>
            <button type="button" data-action="play-home-instrument" data-object="${escapeAttribute(object.id)}" ${canPlayInstrument ? "" : "disabled"} ${
              instrumentLockText ? `title="${escapeAttribute(instrumentLockText)}"` : ""
            }>Play</button>
          </section>`
        : ""
    }
    ${
      captive
        ? `<p class="empty-note">A ${escapeHtml(captiveName)} is trapped inside. Freeing it requires ${escapeHtml(skillName(captive.skill ?? "animal-handling"))} DC ${captive.dc ?? 13}; failure releases it hostile.</p>
           <button type="button" data-action="free-captive" data-object="${escapeAttribute(object.id)}" ${canFreeCaptive ? "" : "disabled"}>Free ${escapeHtml(captiveName)}</button>`
        : object.captiveFreed
          ? `<p class="empty-note">The crate is open and empty.</p>`
          : ""
    }
    ${
      resourceNode
        ? `<p class="empty-note">Farmable resource. ${escapeHtml(resourceNodeCheckLabel(resourceNode))} DC ${resourceNode.dc ?? 12}; takes ${escapeHtml(
            formatDuration(resourceNode.timeSeconds ?? 900),
          )}. Better checks produce more material.</p>
           <button type="button" data-action="farm-resource-node" data-object="${escapeAttribute(object.id)}" ${canFarmResourceNode ? "" : "disabled"}>Gather Resources</button>`
        : object.resourceNodeClaimed
          ? `<p class="empty-note">This resource point has already been harvested by the party.</p>`
          : ""
    }
    ${
      uniqueInteraction
        ? `<p class="empty-note">${escapeHtml(uniqueInteraction.tooltip ?? uniqueInteractionSummary(uniqueInteraction))}</p>
           <button type="button" data-action="use-object-interaction" data-object="${escapeAttribute(object.id)}" ${uniqueInteractionAvailable ? "" : "disabled"}>${
             object.uniqueInteractionClaimed ? "Used" : escapeHtml(uniqueInteraction.label ?? "Use Feature")
           }</button>`
        : object.uniqueInteractionClaimed
          ? `<p class="empty-note">This feature has already been used by the party.</p>`
          : ""
    }
    ${
      destructible
        ? `<p class="empty-note">AC ${objectArmorClass(object)} - HP ${object.hp}/${object.maxHp}</p>
           <button type="button" data-action="attack-object" data-object="${escapeAttribute(object.id)}" ${canAttackObject ? "" : "disabled"}>Attack Object</button>`
        : ""
    }
    ${
      objectLocked
        ? specialLock
          ? `<p class="empty-note">Locked by ${escapeHtml(specialLock.label)}. Contents hidden until the key is given.${
              object.trap ? " A trap must be disarmed first or it will trigger during unlocking." : ""
            }</p>
             <button type="button" data-action="answer-special-lock" data-object="${escapeAttribute(object.id)}" ${canAnswerSpecialLock ? "" : "disabled"}>Enter Key</button>`
          : `<p class="empty-note">Locked. Contents hidden until the lock is picked.${
              object.trap ? " A trap must be disarmed first or it will trigger during lockpicking." : ""
            }</p>
             <button type="button" data-action="pick-lock" data-object="${escapeAttribute(object.id)}" ${canPickLock ? "" : "disabled"}>${
               heroTriedLock ? "Lock Attempt Spent" : `Pick Lock (DC ${object.lockDc ?? 12})`
             }</button>`
        : ""
    }
    ${
      objectCanInspect(object)
        ? `<button type="button" data-action="investigate-object" data-object="${escapeAttribute(object.id)}" ${canInvestigate ? "" : "disabled"}>${
            object.investigated ? "Investigated" : "Investigate"
          }</button>`
        : ""
    }
    ${
      objectIsTrap(object)
        ? `<button type="button" data-action="disarm-trap" data-object="${escapeAttribute(object.id)}" ${canDisarm ? "" : "disabled"}>Disarm</button>${
            canDispelTrap ? `<button type="button" data-action="dispel-trap" data-object="${escapeAttribute(object.id)}">Dispel Magic</button>` : ""
          }`
        : ""
    }
    ${
      object.trap?.detected
        ? `<button type="button" data-action="disarm-trap" data-object="${escapeAttribute(object.id)}" ${canDisarm ? "" : "disabled"}>Disarm ${escapeHtml(
            object.trap.name,
          )}</button>${canDispelTrap ? `<button type="button" data-action="dispel-trap" data-object="${escapeAttribute(object.id)}">Dispel Magic</button>` : ""}`
        : ""
    }
    ${
      objectHasLoot(object) && !isHomePlacedContainer && !objectLocked
        ? `
          <section class="object-inventory">
            <h3>Contents</h3>
            ${
              objectItems.length
                ? objectItems
                    .map(
                      (item) => `
                        <div class="object-inventory-row">
                          <div>
                            <b>${escapeHtml(item.name)}</b>
                            <span>${escapeHtml(itemDetails(item))}</span>
                          </div>
                          <button type="button" data-action="take-object-item" data-object="${escapeAttribute(object.id)}" data-item="${escapeAttribute(item.id)}" ${
                            canLootObject ? "" : "disabled"
                          }>Add to Bag</button>
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="empty-note">Empty.</p>`
            }
          </section>
        `
        : ""
    }
    ${
      isHomeStorage
        ? `
          ${
            isHomeChest
              ? `<section class="object-inventory">
                  <h3>Stored Coins</h3>
                  <div class="chest-money">
                    <div><b>Carried Coins</b><span>${escapeHtml(moneyText(hero.inventory.money))}</span></div>
                    <div><b>Chest Coins</b><span>${escapeHtml(moneyText(state.chestMoney ?? {}))}</span></div>
                    <div class="chest-coin-fields" aria-label="Coin amount">
                      <label><span>CP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-home-coin-input="cp" /></label>
                      <label><span>SP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-home-coin-input="sp" /></label>
                      <label><span>GP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-home-coin-input="gp" /></label>
                    </div>
                    <p class="chest-money-error" aria-live="polite"></p>
                    <div class="chest-money-actions">
                      <button type="button" data-action="home-deposit-custom-coins">Deposit</button>
                      <button type="button" data-action="home-withdraw-custom-coins">Withdraw</button>
                      <button type="button" data-action="home-deposit-all-coins" ${moneyToCp(hero.inventory.money) > 0 ? "" : "disabled"}>Deposit All</button>
                      <button type="button" data-action="home-withdraw-all-coins" ${moneyToCp(state.chestMoney ?? {}) > 0 ? "" : "disabled"}>Withdraw All</button>
                    </div>
                  </div>
                </section>`
              : ""
          }
          <section class="object-inventory">
            <h3>Bag</h3>
            <div class="chest-money-actions">
              <button type="button" data-action="home-store-all-items" data-object="${escapeAttribute(object.id)}" ${unequippedInventoryItems(hero).length ? "" : "disabled"}>Deposit All</button>
            </div>
            ${
              unequippedInventoryItems(hero).length
                ? unequippedInventoryItems(hero)
                    .map(
                      (item) => `
                        <div class="object-inventory-row">
                          <div><b>${escapeHtml(item.name)}</b><span>${escapeHtml(itemDetails(item))}</span></div>
                          <button type="button" data-action="home-store-item" data-object="${escapeAttribute(object.id)}" data-item="${escapeAttribute(item.id)}">Store</button>
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="empty-note">No carried bag items.</p>`
            }
          </section>
          <section class="object-inventory">
            <h3>Chest Contents</h3>
            <div class="chest-money-actions">
              <button type="button" data-action="home-take-all-items" data-object="${escapeAttribute(object.id)}" ${chestItems.length ? "" : "disabled"}>Withdraw All</button>
            </div>
            ${
              chestItems.length
                ? chestItems
                    .map(
                      (item) => `
                        <div class="object-inventory-row">
                          <div><b>${escapeHtml(item.name)}</b><span>${escapeHtml(itemDetails(item))}</span></div>
                          <button type="button" data-action="take-object-item" data-object="${escapeAttribute(object.id)}" data-item="${escapeAttribute(item.id)}">Add to Bag</button>
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="empty-note">Empty.</p>`
            }
          </section>
        `
        : ""
    }
    <button type="button" class="inspect-admin-toggle" data-action="toggle-inspect-admin" aria-label="Show technical details">i</button>
    <section class="inspect-admin-details hidden">
      <div class="stat-grid">
        <div class="stat-pill"><b>${object.width ?? template.width}x${object.height ?? template.height}</b><span>Size</span></div>
        <div class="stat-pill"><b>${objectBlocksMovement(object) ? "No" : "Yes"}</b><span>Crossable</span></div>
        <div class="stat-pill"><b>${template.interactable ? "Yes" : "No"}</b><span>Interactable</span></div>
        ${componentLabels ? `<div class="stat-pill"><b>${escapeHtml(componentLabels)}</b><span>Features</span></div>` : ""}
        ${objectIsTrap(object) ? `<div class="stat-pill"><b>${object.armed === false ? "Spent" : "Armed"}</b><span>State</span></div>` : ""}
        ${objectIsTrap(object) ? `<div class="stat-pill"><b>${object.spotDc ?? 12}</b><span>Spot DC</span></div>` : ""}
        ${objectIsTrap(object) ? `<div class="stat-pill"><b>${object.detected ? "Spotted" : "Hidden"}</b><span>Detection</span></div>` : ""}
        ${visibleTrap ? `<div class="stat-pill"><b>${trapIsMagical(visibleTrap, object) ? "Magical" : "Mechanical"}</b><span>Trap Type</span></div>` : ""}
        ${object.trap?.detected ? `<div class="stat-pill"><b>${object.trap.spotDc ?? 12}</b><span>Trap DC</span></div>` : ""}
        ${object.lockDc || specialLock ? `<div class="stat-pill"><b>${object.locked ? "Locked" : "Open"}</b><span>Lock</span></div>` : ""}
        ${specialLock ? `<div class="stat-pill"><b>${escapeHtml(specialLock.label)}</b><span>Key Lock</span></div>` : object.lockDc ? `<div class="stat-pill"><b>${object.lockDc}</b><span>Lock DC</span></div>` : ""}
        ${destructible ? `<div class="stat-pill"><b>${objectArmorClass(object)}</b><span>AC</span></div>` : ""}
        ${destructible ? `<div class="stat-pill"><b>${object.hp}/${object.maxHp}</b><span>HP</span></div>` : ""}
      </div>
    </section>
  `;
  els.fighterInfo.classList.remove("hidden");
}

function dungeonObjectForId(objectId) {
  return (state.dungeonObjects ?? []).find((object) => object.id === objectId) ?? null;
}

function heroHasToolProficiency(hero, toolId) {
  if (!hero || !toolId) return false;
  return proficiencyEntries(hero.toolProficiencies ?? []).includes(String(toolId).toLowerCase());
}

async function playHomeInstrument(objectId) {
  const object = dungeonObjectForId(objectId);
  const instrument = object ? objectComponent(object.type, "playableInstrument") : null;
  const hero = activeHero();
  if (!object || !instrument || state.mode !== "home") return;
  const requiredTool = instrument.requiredTool ?? instrument.instrument;
  if (!instrumentPerformerAdjacent(hero, object)) {
    object.lastResult = `${hero.name} needs to stand next to ${objectTemplate(object.type)?.name ?? "the instrument"} to play.`;
    showDungeonObjectInfo(object);
    return;
  }
  if (!heroHasToolProficiency(hero, requiredTool)) {
    object.lastResult = `${hero.name} needs ${toolName(requiredTool)} proficiency to play.`;
    showDungeonObjectInfo(object);
    return;
  }
  const songs = (instrument.songs ?? []).filter((song) => song?.id && song?.src);
  if (!songs.length) return;
  const songId = await showSelectChoiceDialog({
    title: `Play ${objectTemplate(object.type)?.name ?? "Instrument"}`,
    message: `Choose a piece for ${hero.name} to play.`,
    actor: hero,
    label: "Piece",
    choices: songs.map((song) => ({
      value: song.id,
      label: song.name ?? song.id,
      description: song.description ?? `${toolName(requiredTool)} performance.`,
    })),
    defaultValue: activeInstrumentPerformance?.objectId === object.id ? activeInstrumentPerformance.songId : songs[0].id,
    confirmText: "Play",
    cancelText: "Back",
  });
  if (!songId) {
    showDungeonObjectInfo(object);
    return;
  }
  const song = songs.find((entry) => entry.id === songId) ?? songs[0];
  activeInstrumentPerformance = {
    heroId: hero.id,
    objectId: object.id,
    songId: song.id,
    songs,
  };
  object.lastResult = `${hero.name} plays ${song.name ?? "a piece"} on the ${toolName(requiredTool)}.`;
  addLog(object.lastResult, "important");
  updateBackgroundMusic();
  showDungeonObjectInfo(object);
}

async function playInventoryInstrument(itemId) {
  const hero = activeHero();
  const item = itemForId(hero, itemId);
  if (!item || item.use?.kind !== "instrumentPerformance" || state.mode === "combat") return;
  const requiredTool = item.use.requiredTool ?? item.use.instrument;
  if (!heroHasToolProficiency(hero, requiredTool)) {
    addLog(`${hero.name} needs ${toolName(requiredTool)} proficiency to play ${item.name}.`, "important");
    render();
    return;
  }
  const songs = (item.use.songs ?? []).filter((song) => song?.id && song?.src);
  if (!songs.length) {
    addLog(`No ${toolName(requiredTool)} pieces are available yet.`, "important");
    render();
    return;
  }
  const songId = await showSelectChoiceDialog({
    title: `Play ${item.name}`,
    message: `Choose a piece for ${hero.name} to play. The performance continues while ${hero.name} stands still.`,
    actor: hero,
    label: "Piece",
    choices: songs.map((song) => ({
      value: song.id,
      label: song.name ?? song.id,
      description: song.description ?? `${toolName(requiredTool)} performance.`,
    })),
    defaultValue: activeInstrumentPerformance?.itemId === item.id ? activeInstrumentPerformance.songId : songs[0].id,
    confirmText: "Play",
    cancelText: "Back",
  });
  if (!songId) return;
  const song = songs.find((entry) => entry.id === songId) ?? songs[0];
  activeInstrumentPerformance = {
    heroId: hero.id,
    itemId: item.id,
    songId: song.id,
    songs,
    startPosition: { ...hero.position },
  };
  addLog(`${hero.name} plays ${song.name ?? "a piece"} on ${item.name}.`, "important");
  updateBackgroundMusic();
  render();
  if (!els.inventoryMenu.classList.contains("hidden")) renderInventoryMenu();
}

function homeStorageObjectForId(objectId) {
  if (objectId === "home-chest") return homeChestObject();
  const object = dungeonObjectForId(objectId);
  const template = object ? objectTemplate(object.type) : null;
  return object && template && homeObjectIsStorage(object, template) ? object : null;
}

function homeObjectIsStorage(object, template = objectTemplate(object?.type)) {
  if (state.mode !== "home" || !object?.homePlaced || !template) return false;
  return homeObjectTypeIsStorage(object.type, template);
}

function triggerChestTrap(chest, hero = activeHero()) {
  const trap = chest.trap;
  if (!trap) return false;

  const damageRoll = rollDice(trap.damage.count ?? 1, trap.damage.sides ?? 4);
  const rawDamage = damageRoll.total + (trap.damage.bonus ?? 0);
  if (adminEnabled() && adminGodMode) {
    chest.lastResult = `${hero.name} triggered ${trap.name}, but god mode prevented the damage.`;
    addLog(`${hero.name} triggers ${trap.name}. God mode prevents the damage.`, "important");
    delete chest.trap;
    return true;
  }
  const modified = calculateDamageModifiers(hero, rawDamage, trap.damage.type);
  applyDamageToFighter(hero, modified.damage);
  chest.lastResult = `${hero.name} triggered ${trap.name} for ${modified.damage} ${trap.damage.type ?? "damage"} damage (${damageRoll.rolls.join(" + ")}).`;
  const adjustmentNote = modified.reason ? ` ${hero.name} is ${modified.reason} to ${trap.damage.type} damage.` : "";
  addLog(`${hero.name} triggers ${trap.name} for ${modified.damage} ${trap.damage.type ?? "damage"} damage (${damageRoll.rolls.join(" + ")}).${adjustmentNote}`, "damage");
  if (!hero.alive) {
    addLog(`${hero.name} drops to 0 HP.`, "important");
    handleHeroDeath();
  }
  delete chest.trap;
  return true;
}

function triggerContainerTrapDuringUnlock(object, hero = activeHero()) {
  if (!object?.trap || !hero) return false;
  const objectName = objectTemplate(object.type)?.name ?? "the container";
  const trapName = object.trap.name ?? "the trap";
  object.lastResult = `${hero.name} disturbs ${trapName} while trying to unlock ${objectName}.`;
  addLog(object.lastResult, "important");
  triggerChestTrap(object, hero);
  render();
  showDungeonObjectInfo(object);
  return true;
}

function homeChestObject() {
  return {
    id: "home-chest",
    type: "homeChest",
    position: homeChestPosition(),
    items: state.chest ?? [],
  };
}

let homeBuildTool = null;
let homeBuildFurnitureId = "home-bookshelf";
let homeBuildSearch = "";
let homeBuildPaintColor = "#5a4638";
let homeBuildPaintAlpha = 0.35;
let homeBuildRotation = 0;
let homeBuilderSnapshot = null;
let homeMoveSelection = null;
let homePaintPointerId = null;
let homeComfortRangePreviewKeys = new Set();
const homeDefaultPaintValue = "default";
const homePaintPalette = ["#5a4638", "#7a5c3a", "#6f7357", "#445f66", "#66465d", "#7f3f35", "#3f4c6b", "#2f2d2b"];
const homeCatalogueStoryLockedIds = new Set(["home-cooking-pot", "home-herb-garden", "portal"]);
const homeCatalogueAdminOnlyIds = new Set(["beast-crate", "beast-companion-crate", "undead-crate"]);
const homeFloorBuildCostCp = 100;
const homeStorageFurnitureCostCp = 2;
const homeComfortScores = {
  chest: 1,
  "iron-banded-chest": 2,
  table: 1,
  "weapon-rack": 2,
  "armor-stand": 2,
  "arcane-lectern": 5,
};

function homePaintColorValue() {
  const color = normalizeHomeColor(homeBuildPaintColor);
  if (!color) return null;
  const hex = color.startsWith("#") ? color : homePaintPalette[0];
  const red = parseInt(hex.slice(1, 3), 16);
  const green = parseInt(hex.slice(3, 5), 16);
  const blue = parseInt(hex.slice(5, 7), 16);
  const alpha = Math.max(0.05, Math.min(1, Number(homeBuildPaintAlpha) || 1));
  return `rgba(${red}, ${green}, ${blue}, ${Number(alpha.toFixed(2))})`;
}

function isHomeBuilderOpen() {
  return state?.mode === "home" && els.fighterInfo.classList.contains("home-builder-dock");
}

function clearHomePaintPointer() {
  homePaintPointerId = null;
}

function syncHomeLayoutToDungeon() {
  if (state.mode !== "home") return;
  state.home = normalizeHomeData({
    ...(state.home ?? {}),
    cells: state.home?.cells,
    doors: state.home?.doors,
    objects: state.dungeonObjects ?? state.home?.objects,
    floorColors: state.home?.floorColors,
    wallColors: state.home?.wallColors,
  });
  state.room.gridSize = state.home.gridSize;
  state.dungeon.gridSize = state.home.gridSize;
  state.dungeon.rooms = [{ id: "home-room", name: "Home", cells: state.home.cells, doors: state.home.doors }];
  state.dungeon.walkable = state.home.cells;
  state.dungeon.doors = state.home.doors;
  state.dungeonObjects = state.home.objects;
  state.exploration.discoveredRoomIds = ["home-room"];
}

function homeCellKeys() {
  return new Set((state.home?.cells ?? []).map(positionKey));
}

function homeObjectCellsForType(type, position, rotation = 0) {
  const template = objectTemplate(type);
  if (!template) return [];
  const { width, height } = objectRotatedSize({ width: template.width ?? 1, height: template.height ?? 1, rotation });
  return Array.from({ length: width * height }, (_, index) => ({ x: position.x + (index % width), y: position.y + Math.floor(index / width) }));
}

function homeObjectOverlaps(type, position, ignoreId = null, rotation = 0) {
  const template = objectTemplate(type);
  if (!template) return true;
  const keys = homeCellKeys();
  const cells = homeObjectCellsForType(type, position, rotation);
  if (cells.some((cell) => !keys.has(positionKey(cell)))) return true;
  const candidateIsCovering = homeObjectTypeIsFloorCovering(type);
  return (state.dungeonObjects ?? []).some((object) => {
    if (object.id === ignoreId) return false;
    const existingIsCovering = homeObjectTypeIsFloorCovering(object.type);
    if (candidateIsCovering !== existingIsCovering) return false;
    return objectCells({ ...object, type: object.type }).some((cell) => cells.some((candidate) => positionKey(candidate) === positionKey(cell)));
  });
}

function objectTypeIsFloorCovering(type, template = objectTemplate(type)) {
  const tags = template?.tags ?? [];
  return Boolean(!template?.blocksMovement && tags.includes("terrain-floor"));
}

function homeObjectTypeIsFloorCovering(type, template = objectTemplate(type)) {
  const tags = template?.tags ?? [];
  return Boolean(objectComponent(type, "homeDecor") && !template?.blocksMovement && (tags.includes("rug") || tags.includes("floor")));
}

function homeDoorEdgeFromEvent(position, event) {
  const tile = event?.target?.closest?.(".tile");
  const rect = tile?.getBoundingClientRect();
  if (!rect) return "east";
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  const distances = [
    ["north", y],
    ["east", 1 - x],
    ["south", 1 - y],
    ["west", x],
  ];
  return distances.sort((a, b) => a[1] - b[1])[0][0];
}

function homeDoorForEdge(position, edge, to = "home-room") {
  const delta = edge === "north" ? { x: 0, y: -1 } : edge === "east" ? { x: 1, y: 0 } : edge === "south" ? { x: 0, y: 1 } : { x: -1, y: 0 };
  return { ...position, edge, corridor: { x: position.x + delta.x, y: position.y + delta.y }, roomId: "home-room", to };
}

function homeDoorDirection(door, position = door) {
  return door.edge ?? (door.corridor?.y < position.y ? "north" : door.corridor?.x > position.x ? "east" : door.corridor?.y > position.y ? "south" : "west");
}

function homeDoorNeighbor(position, edge) {
  const delta = edge === "north" ? { x: 0, y: -1 } : edge === "east" ? { x: 1, y: 0 } : edge === "south" ? { x: 0, y: 1 } : { x: -1, y: 0 };
  return { x: position.x + delta.x, y: position.y + delta.y };
}

function homeDoorHasSideWalls(position, edge, cells) {
  const neighbor = homeDoorNeighbor(position, edge);
  const sideCells =
    edge === "north" || edge === "south"
      ? [
          { x: position.x - 1, y: position.y },
          { x: neighbor.x - 1, y: neighbor.y },
          { x: position.x + 1, y: position.y },
          { x: neighbor.x + 1, y: neighbor.y },
        ]
      : [
          { x: position.x, y: position.y - 1 },
          { x: neighbor.x, y: neighbor.y - 1 },
          { x: position.x, y: position.y + 1 },
          { x: neighbor.x, y: neighbor.y + 1 },
        ];
  return sideCells.filter((cell) => !cells.has(positionKey(cell))).length >= 2;
}

function homeDoorKey(door) {
  return `${door.x},${door.y},${door.edge ?? "east"}`;
}

function homeWallEdgeKey(position, edge) {
  return `${position.x},${position.y},${edge}`;
}

function homeWallEdgeExists(position, edge, cells = homeCellKeys()) {
  if (!cells.has(positionKey(position))) return false;
  const neighbor = homeDoorNeighbor(position, edge);
  if (neighbor.x < 0 || neighbor.y < 0 || neighbor.x >= (state.home?.gridSize ?? currentGridSize()) || neighbor.y >= (state.home?.gridSize ?? currentGridSize())) return false;
  return !cells.has(positionKey(neighbor));
}

function homeExitPosition() {
  return state.exit?.position ?? (state.home?.doors ?? []).find((door) => door.to === "outside") ?? { x: 19, y: 15 };
}

function homeReservedNoFloorKeys() {
  const exitDoor = (state.home?.doors ?? []).find((door) => door.to === "outside") ?? { ...homeExitPosition(), edge: "east" };
  return reservedHomeNoFloorKeys(exitDoor, state.home?.gridSize ?? currentGridSize());
}

function isHomeReservedNoFloorPosition(position) {
  return homeReservedNoFloorKeys().has(positionKey(position));
}

function homeProtectedKeys(home = state.home) {
  const keys = new Set([positionKey(homeExitPosition())]);
  const special = home?.specialPositions ?? {};
  if (special.chest) keys.add(positionKey(special.chest));
  if (special.planningTable) {
    keys.add(positionKey(special.planningTable));
    keys.add(positionKey({ x: special.planningTable.x + 1, y: special.planningTable.y }));
  }
  for (const object of state.dungeonObjects ?? []) {
    if (object.type === "home-bookshelf") objectCells(object).forEach((cell) => keys.add(positionKey(cell)));
  }
  for (const fighter of Object.values(state.fighters ?? {}).filter((entry) => isRosterHeroId(entry.id))) {
    window.DungeonGrid.fighterCells(fighter).forEach((cell) => keys.add(positionKey(cell)));
  }
  return keys;
}

function homeReachableFloorKeys(home = state.home) {
  const cells = new Set((home?.cells ?? []).map(positionKey));
  const start = positionKey(homeExitPosition());
  if (!cells.has(start)) return new Set();
  const reachable = new Set([start]);
  const queue = [homeExitPosition()];
  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacentCells(current)) {
      const key = positionKey(next);
      if (!cells.has(key) || reachable.has(key)) continue;
      reachable.add(key);
      queue.push(next);
    }
  }
  return reachable;
}

function homePositionIsExitReachable(position, home = state.home) {
  return homeReachableFloorKeys(home).has(positionKey(position));
}

function canEraseHomeCell(position, cells) {
  const key = positionKey(position);
  if (homeProtectedKeys().has(key)) return false;
  const nextHome = { ...state.home, cells: Array.from(cells.values()).filter((cell) => positionKey(cell) !== key) };
  const reachable = homeReachableFloorKeys(nextHome);
  for (const protectedKey of homeProtectedKeys()) {
    if (!reachable.has(protectedKey)) return false;
  }
  return true;
}

function selectHomeMoveTarget(selection) {
  if (!isHomeBuilderOpen() || homeBuildTool !== "move") return false;
  homeMoveSelection = selection;
  renderHomeBuilder();
  return true;
}

function rotateHomeFurnitureSelection() {
  if (!isHomeBuilderOpen()) return;
  if (homeMoveSelection?.kind === "object") {
    const object = (state.dungeonObjects ?? []).find((entry) => entry.id === homeMoveSelection.id);
    if (!object) return;
    const nextRotation = normalizeObjectRotation((object.rotation ?? 0) + 90);
    if (homeObjectOverlaps(object.type, object.position, object.id, nextRotation)) {
      addLog("That rotation needs open home floor.", "important");
      renderHomeBuilder();
      return;
    }
    object.rotation = nextRotation;
    syncHomeLayoutToDungeon();
    renderHomeBuilder();
    render();
    return;
  }
  homeBuildRotation = normalizeObjectRotation(homeBuildRotation + 90);
  renderHomeBuilder();
}

function homeFurnitureCatalogueEntries() {
  const query = homeBuildSearch.trim().toLowerCase();
  return window.DungeonContent
    .list("furniture")
    .filter((entry) => entry.kind !== "trap")
    .filter(homeCatalogueEntryVisible)
    .filter((entry) => !query || `${entry.name} ${entry.id} ${(entry.tags ?? []).join(" ")}`.toLowerCase().includes(query))
    .slice(0, 180);
}

function homeFurnitureCatalogue() {
  const groups = new Map([
    ["homeUtility", { label: "Home Utility", entries: [] }],
    ["homeDecor", { label: "Home Decor", entries: [] }],
    ["guardroomDecor", { label: "Guardroom Decor", entries: [] }],
    ["natureDecor", { label: "Nature Decor", entries: [] }],
    ["misc", { label: "Misc", entries: [] }],
  ]);
  for (const entry of homeFurnitureCatalogueEntries()) {
    groups.get(homeFurnitureCategory(entry)).entries.push(entry);
  }
  return Array.from(groups.values()).filter((group) => group.entries.length);
}

function homeFurnitureCategory(entry) {
  if (objectComponent(entry.id, "homeDecor") || entry.tags?.includes("home-decor")) return "homeDecor";
  if (homeObjectTypeIsStorage(entry.id, entry) || entry.tags?.includes("bed") || entry.tags?.includes("home") || objectComponent(entry.id, "homeBed")) return "homeUtility";
  if (entry.id === "bigRock") return "natureDecor";
  if (
    entry.tags?.includes("forest") ||
    entry.tags?.includes("wilds") ||
    entry.tags?.includes("underdark") ||
    entry.tags?.includes("cave") ||
    entry.tags?.includes("rock")
  ) return "natureDecor";
  if (entry.tags?.includes("old-guardroom") || entry.tags?.includes("dungeon") || entry.tags?.includes("crypt") || entry.tags?.includes("ruin")) return "guardroomDecor";
  return "misc";
}

function homeCatalogueEntryVisible(entry) {
  if (adminEnabled()) return true;
  if (homeCatalogueAdminOnlyIds.has(entry.id) || (entry.id.includes("crate") && objectHasComponent(entry.id, "captiveCreature"))) return false;
  if (!homeCatalogueStoryLockedIds.has(entry.id)) return true;
  return (state.home?.unlockedFurniture ?? []).includes(entry.id);
}

function homeBuilderNewFloorKeys() {
  if (!homeBuilderSnapshot) return new Set();
  const snapshotKeys = new Set((homeBuilderSnapshot.cells ?? []).map(positionKey));
  return new Set((state.home?.cells ?? []).map(positionKey).filter((key) => !snapshotKeys.has(key)));
}

function homeBuilderCostCp() {
  if (adminEnabled()) return 0;
  return homeBuilderNewFloorKeys().size * homeFloorBuildCostCp + homeBuilderNewObjectCostCp();
}

function homeBuilderCanAfford() {
  return adminEnabled() || moneyToCp(state.chestMoney ?? {}) >= homeBuilderCostCp();
}

function homeBuilderNewObjectCostCp() {
  if (!homeBuilderSnapshot) return 0;
  const snapshotIds = new Set((homeBuilderSnapshot.objects ?? []).map((object) => object.id));
  return (state.dungeonObjects ?? [])
    .filter((object) => object.homePlaced && !snapshotIds.has(object.id))
    .reduce((sum, object) => sum + homeFurnitureBuildCostCp(object.type), 0);
}

function homeFurnitureBuildCostCp(type) {
  const bed = objectComponent(type, "homeBed");
  if (bed?.priceCp !== undefined) return bed.priceCp;
  const decor = objectComponent(type, "homeDecor");
  if (decor?.priceCp !== undefined) return decor.priceCp;
  return homeObjectTypeIsStorage(type) ? homeStorageFurnitureCostCp : 0;
}

function homeObjectTypeIsStorage(type, template = objectTemplate(type)) {
  const tags = template?.tags ?? [];
  const storageName = `${type ?? ""} ${template?.name ?? ""}`.toLowerCase();
  return (
    template?.kind === "container" ||
    tags.includes("container") ||
    tags.includes("loot") ||
    /\b(chest|crate|locker|cabinet|reliquary|sarcophagus)\b/.test(storageName)
  );
}

function renderHomeBuilder() {
  if (state.mode !== "home") return;
  const groups = homeFurnitureCatalogue();
  const entries = groups.flatMap((group) => group.entries);
  if (!entries.some((entry) => entry.id === homeBuildFurnitureId)) homeBuildFurnitureId = entries[0]?.id ?? "home-bookshelf";
  const defaultPaintActive = homeBuildPaintColor === homeDefaultPaintValue;
  const normalizedPaintColor = normalizeHomeColor(homeBuildPaintColor) ?? homePaintPalette[0];
  const paintAlphaPercent = Math.round(Math.max(0.05, Math.min(1, Number(homeBuildPaintAlpha) || 1)) * 100);
  const showPaintTools = ["paintFloor", "paintWall"].includes(homeBuildTool);
  const movingObject = homeMoveSelection?.kind === "object" ? (state.dungeonObjects ?? []).find((object) => object.id === homeMoveSelection.id) : null;
  const activeRotation = normalizeObjectRotation(movingObject?.rotation ?? homeBuildRotation);
  const buildCostCp = homeBuilderCostCp();
  const canAffordBuild = homeBuilderCanAfford();
  const costText = buildCostCp > 0 ? moneyText(cpToMoney(buildCostCp)) : "Free";
  els.fighterInfo.classList.add("home-builder-dock");
  els.fighterInfoName.textContent = "Build Your Home";
  els.fighterInfoBody.innerHTML = `
    <p class="empty-note">Choose a tool. Floor, erase, and color painting can be dragged. Save commits this edit session; restore rolls it back.</p>
    <section class="home-builder-tools" aria-label="Home building tools">
      ${[
        ["floor", "Floor"],
        ["door", "Door"],
        ["furniture", "Furniture"],
        ["move", "Move"],
        ["erase", "Erase"],
        ["paintFloor", "Paint Floor"],
        ["paintWall", "Paint Walls"],
      ]
        .map(([tool, label]) => `<button type="button" data-action="home-build-tool" data-tool="${tool}" class="${homeBuildTool === tool ? "active" : ""}">${label}</button>`)
        .join("")}
    </section>
    <section class="home-builder-tools" aria-label="Furniture rotation">
      <button type="button" data-action="home-rotate-furniture" ${homeBuildTool === "furniture" || movingObject ? "" : "disabled"}>Rotate ${activeRotation}°</button>
    </section>
    ${
      showPaintTools
        ? `<section class="home-paint-tools" aria-label="Paint colors">
            <div class="home-paint-swatches">
              <button type="button" data-action="home-paint-color" data-color="${homeDefaultPaintValue}" class="home-paint-default ${defaultPaintActive ? "active" : ""}" aria-label="Use default color">Default</button>
              ${homePaintPalette
                .map(
                  (color) => `
                    <button type="button" data-action="home-paint-color" data-color="${escapeAttribute(color)}" class="${!defaultPaintActive && normalizedPaintColor === color ? "active" : ""}" style="--swatch-color: ${escapeAttribute(color)}" aria-label="Use color ${escapeAttribute(color)}"></button>
                  `,
                )
                .join("")}
            </div>
            <label class="home-color-picker">
              <span>Custom</span>
              <input id="home-paint-color" type="color" value="${escapeAttribute(normalizedPaintColor)}" />
            </label>
            <label class="home-alpha-picker">
              <span>Tint ${paintAlphaPercent}%</span>
              <input id="home-paint-alpha" type="range" min="5" max="100" step="5" value="${paintAlphaPercent}" ${defaultPaintActive ? "disabled" : ""} />
            </label>
          </section>`
        : ""
    }
    ${homeMoveSelection ? `<p class="empty-note">Moving: ${escapeHtml(homeMoveSelection.label)}. Click a valid floor tile.</p>` : ""}
    <label class="home-builder-search">
      <span>Furniture</span>
      <input id="home-build-search" type="search" value="${escapeAttribute(homeBuildSearch)}" placeholder="Search catalogue" />
    </label>
    <section class="home-furniture-catalogue" aria-label="Furniture catalogue">
      ${groups
        .map(
          (group) => `
            <details class="home-furniture-group" open>
              <summary>${escapeHtml(group.label)}</summary>
              <div class="home-furniture-group-list">
                ${group.entries
                  .map((entry) => {
                    const cost = homeFurnitureBuildCostCp(entry.id);
                    return `
                      <button type="button" data-action="home-build-furniture" data-furniture="${escapeAttribute(entry.id)}" class="${homeBuildFurnitureId === entry.id ? "active" : ""}">
                        <b>${escapeHtml(entry.symbol ?? "?")}</b>
                        <span>${escapeHtml(entry.name)}${cost ? `<small>${escapeHtml(moneyText(cpToMoney(cost)))}</small>` : ""}</span>
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </details>
          `,
        )
        .join("")}
    </section>
    <section class="home-builder-tools home-builder-footer" aria-label="Home save tools">
      <button type="button" data-action="home-save-build" class="${canAffordBuild ? "home-build-cost-ok" : "home-build-cost-bad"}" ${canAffordBuild ? "" : "disabled"}>Save Home (${escapeHtml(costText)})</button>
      <button type="button" data-action="home-restore-build">Restore</button>
    </section>
  `;
  els.fighterInfo.classList.remove("hidden");
}

function showHomeBuilder() {
  if (state.mode !== "home") return;
  hideHomeMenu();
  syncHomeLayoutToDungeon();
  homeBuilderSnapshot = cloneData(state.home);
  homeBuildTool = null;
  homeBuildRotation = 0;
  homeMoveSelection = null;
  homePaintPointerId = null;
  renderHomeBuilder();
  render();
}

function saveHomeBuilderChanges() {
  if (!isHomeBuilderOpen()) return;
  state.chestMoney = normalizeMoney(state.chestMoney ?? {});
  const buildCostCp = homeBuilderCostCp();
  if (buildCostCp > 0 && !spendMoney(state.chestMoney, buildCostCp)) {
    addLog(`Home chest needs ${moneyText(cpToMoney(buildCostCp))} to save these new floor tiles.`, "important");
    renderHomeBuilder();
    return;
  }
  syncHomeLayoutToDungeon();
  homeBuilderSnapshot = cloneData(state.home);
  addLog(buildCostCp > 0 ? `Home layout saved. Paid ${moneyText(cpToMoney(buildCostCp))} from the home chest.` : "Home layout saved.", "important");
  renderHomeBuilder();
  render();
}

function restoreHomeBuilderChanges() {
  if (!isHomeBuilderOpen() || !homeBuilderSnapshot) return;
  state.home = cloneData(homeBuilderSnapshot);
  state.dungeonObjects = cloneData(state.home.objects ?? []);
  homeMoveSelection = null;
  homeBuildRotation = 0;
  homePaintPointerId = null;
  syncHomeLayoutToDungeon();
  addLog("Home layout restored to the state from when the builder opened.", "important");
  renderHomeBuilder();
  render();
}

function homeDoorAt(position) {
  return (state.home?.doors ?? []).find((door) => positionKey(door) === positionKey(position));
}

function removeHomeObjectAt(position) {
  const target = (state.dungeonObjects ?? []).find((object) => object.homePlaced && objectCells(object).some((cell) => positionKey(cell) === positionKey(position)));
  if (!target) return false;
  if (target.type === "home-bookshelf") {
    addLog("The compendium bookshelf can be moved, but not deleted.", "important");
    return true;
  }
  state.dungeonObjects = (state.dungeonObjects ?? []).filter((object) => object.id !== target.id);
  return true;
}

function applyHomeBuildAt(position, event = null) {
  if (!isHomeBuilderOpen()) return false;
  if (!homeBuildTool) return true;
  const home = normalizeHomeData(state.home);
  state.home = home;
  const key = positionKey(position);
  const cells = new Map(home.cells.map((cell) => [positionKey(cell), cell]));
  if (homeBuildTool === "floor") {
    if (position.x < 0 || position.y < 0 || position.x >= home.gridSize || position.y >= home.gridSize) return true;
    if (isHomeReservedNoFloorPosition(position)) return true;
    cells.set(key, { ...position });
  } else if (homeBuildTool === "door") {
    if (!cells.has(key)) return true;
    const edge = homeDoorEdgeFromEvent(position, event);
    const neighbor = homeDoorNeighbor(position, edge);
    if (!cells.has(positionKey(neighbor))) return true;
    if (!homeDoorHasSideWalls(position, edge, cells)) return true;
    const exitKey = positionKey(homeExitPosition());
    const door = homeDoorForEdge(position, edge, key === exitKey ? "outside" : "home-room");
    const doorKey = homeDoorKey(door);
    const doors = home.doors.filter((entry) => homeDoorKey(entry) !== doorKey);
    doors.push(door);
    state.home.doors = doors;
  } else if (homeBuildTool === "furniture") {
    const rotation = normalizeObjectRotation(homeBuildRotation);
    if (!cells.has(key) || homeObjectOverlaps(homeBuildFurnitureId, position, null, rotation)) {
      addLog("That furniture needs open home floor.", "important");
      renderHomeBuilder();
      return true;
    }
    const template = objectTemplate(homeBuildFurnitureId);
    const instanceNumber = (state.dungeonObjects ?? []).filter((object) => object.id?.startsWith(`home-${homeBuildFurnitureId}-`)).length + 1;
    state.dungeonObjects.push({
      id: `home-${homeBuildFurnitureId}-${Date.now()}-${instanceNumber}`,
      type: homeBuildFurnitureId,
      position: { ...position },
      width: template.width ?? 1,
      height: template.height ?? 1,
      rotation,
      homePlaced: true,
      items: [],
    });
  } else if (homeBuildTool === "move") {
    if (!homeMoveSelection) return true;
    if (!cells.has(key) || !homePositionIsExitReachable(position, { ...state.home, cells: Array.from(cells.values()) })) {
      addLog("Protected home pieces must stay on floor connected to the home door.", "important");
      return true;
    }
    if (homeMoveSelection.kind === "special") {
      const width = homeMoveSelection.id === "planningTable" ? 2 : 1;
      const targetCells = Array.from({ length: width }, (_, index) => ({ x: position.x + index, y: position.y }));
      if (targetCells.some((cell) => !cells.has(positionKey(cell)) || !homePositionIsExitReachable(cell, { ...state.home, cells: Array.from(cells.values()) }))) {
        addLog("That special furniture needs connected home floor.", "important");
        return true;
      }
      state.home.specialPositions = { ...(state.home.specialPositions ?? {}), [homeMoveSelection.id]: { ...position } };
    } else if (homeMoveSelection.kind === "object") {
      const object = (state.dungeonObjects ?? []).find((entry) => entry.id === homeMoveSelection.id);
      if (!object || homeObjectOverlaps(object.type, position, object.id, object.rotation ?? 0)) {
        addLog("That furniture needs open home floor.", "important");
        return true;
      }
      object.position = { ...position };
    }
    homeMoveSelection = null;
  } else if (homeBuildTool === "paintFloor") {
    if (!cells.has(key)) return true;
    const color = homePaintColorValue();
    state.home.floorColors = { ...(state.home.floorColors ?? {}) };
    if (color) state.home.floorColors[key] = color;
    else delete state.home.floorColors[key];
  } else if (homeBuildTool === "paintWall") {
    const edge = homeDoorEdgeFromEvent(position, event);
    if (!homeWallEdgeExists(position, edge, cells)) return true;
    const color = homePaintColorValue();
    state.home.wallColors = { ...(state.home.wallColors ?? {}) };
    const wallKey = homeWallEdgeKey(position, edge);
    if (color) state.home.wallColors[wallKey] = color;
    else delete state.home.wallColors[wallKey];
  } else if (homeBuildTool === "erase") {
    if (!removeHomeObjectAt(position)) {
      state.home.doors = home.doors.filter((door) => positionKey(door) !== key || door.to === "outside");
      if (canEraseHomeCell(position, cells)) {
        cells.delete(key);
        if (state.home.floorColors) delete state.home.floorColors[key];
      } else {
        addLog("That tile supports protected or connected home features.", "important");
      }
    }
  }
  state.home.cells = Array.from(cells.values());
  syncHomeLayoutToDungeon();
  renderHomeBuilder();
  render();
  return true;
}

function openMonsterCompendium() {
  els.fighterInfo.classList.remove("home-builder-dock");
  state.monsterCompendium = normalizeMonsterCompendium(state.monsterCompendium);
  const groups = new Map();
  for (const monster of window.DungeonContent.list("monsters")) {
    if (monster.id === "monsterTemplate") continue;
    const type = monster.tags?.[0] ?? "other";
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push(monster);
  }
  const knownForMonster = (monster) => {
    const progress = state.monsterCompendium[monster.id] ?? { encountered: false, kills: 0 };
    return progress.encountered || progress.kills > 0;
  };
  els.fighterInfoName.textContent = "Monster Compendium";
  els.fighterInfoBody.innerHTML = `
    <p class="empty-note">Names unlock after an encounter. Kills reveal deeper details at 5 and 10.</p>
    ${Array.from(groups.entries())
      .sort(([a, aMonsters], [b, bMonsters]) => Number(bMonsters.some(knownForMonster)) - Number(aMonsters.some(knownForMonster)) || a.localeCompare(b))
      .map(
        ([type, monsters]) => `
          <details class="compendium-group" ${monsters.some(knownForMonster) ? "open" : ""}>
            <summary>${escapeHtml(titleCaseTag(type || "other"))}</summary>
            ${monsters
              .sort((a, b) => Number(knownForMonster(b)) - Number(knownForMonster(a)) || a.name.localeCompare(b.name))
              .map((monster) => {
                const progress = state.monsterCompendium[monster.id] ?? { encountered: false, kills: 0 };
                const known = progress.encountered || progress.kills > 0;
                const kills = progress.kills ?? 0;
                const hints = monsterDungeonHints(monster);
                const art = monster.tokenArt ?? monster.art ?? "";
                return `
                  <article class="compendium-entry ${known ? "" : "unknown"}">
                    <h4 class="compendium-entry-title">
                      ${
                        known && art
                          ? `<button type="button" class="compendium-art-button" data-action="preview-monster-art" data-art="${escapeAttribute(art)}" data-name="${escapeAttribute(monster.name)}" aria-label="Enlarge ${escapeAttribute(monster.name)} artwork"><img src="${escapeAttribute(art)}" alt="" /></button>`
                          : ""
                      }
                      <span>${known ? escapeHtml(monster.name) : "????"}</span>
                    </h4>
                    <p>${known ? escapeHtml(monster.description ?? "No notes yet.") : `Unencountered creature. ${hints.length ? `Likely found in: ${escapeHtml(hints.join(", "))}.` : "No dungeon hint available yet."}`}</p>
                    <div class="stat-grid">
                      <div class="stat-pill"><b>${known ? kills : "?"}</b><span>Kills</span></div>
                      <div class="stat-pill"><b>${known ? monster.maxHp ?? "?" : "?"}</b><span>HP</span></div>
                      <div class="stat-pill"><b>${known ? monster.ac ?? "?" : "?"}</b><span>AC</span></div>
                      <div class="stat-pill"><b>${known ? monster.speedFeet ?? "?" : "?"}</b><span>Speed</span></div>
                    </div>
                    ${known && kills >= 5 ? `<p><b>Resistances:</b> ${escapeHtml((monster.resistances ?? []).join(", ") || "None")}<br><b>Vulnerabilities:</b> ${escapeHtml((monster.vulnerabilities ?? []).join(", ") || "None")}</p>` : ""}
                    ${known && kills >= 10 ? `<p><b>Traits:</b> ${escapeHtml([...(monster.traits ?? []), ...(monster.specialAbility ?? [])].join(", ") || "None recorded.")}</p>` : ""}
                  </article>
                `;
              })
              .join("")}
          </details>
        `,
      )
      .join("")}
  `;
  els.fighterInfo.classList.remove("hidden");
}

const homeLibraryTutorials = {
  homeExpansion: {
    title: "Home Expansion Guide",
    steps: [
      {
        title: "Open The Builder",
        body: "Use the home door or Adventure menu to open Build Your Home. The menu stays on the left while the home map remains clickable.",
      },
      {
        title: "Paint New Floor",
        body: "Select Floor, then click or drag over empty dungeon space. New floor tiles cost 1 gp each when you save the session.",
      },
      {
        title: "Doors Need Real Walls",
        body: "Select Door and click an edge between two floor squares. A valid door needs floor on both sides and wall space beside the opening.",
      },
      {
        title: "Place And Move Furniture",
        body: "Select Furniture to place catalogue pieces. Select Move, then click furniture such as the chest, planning table, compendium shelf, or beds and choose a new connected floor tile.",
      },
      {
        title: "Save Or Restore",
        body: "Save Home commits the current building session and pays its cost from the home chest. Restore returns the home to the state from when the builder was opened.",
      },
    ],
  },
  comfortZones: {
    title: "Comfort Zones Guide",
    steps: [
      {
        title: "Beds Create Comfort",
        body: "Place a bed and assign it to a class hero. The bed gives its own comfort points and also checks nearby furniture.",
      },
      {
        title: "Range Depends On Bed Quality",
        body: "Shabby hay beds count 1 square around them. Broken wooden beds count 2, comfortable beds count 3, and luxury beds count 4.",
      },
      {
        title: "The Zone Is A Room Box",
        body: "The comfort zone fills the square box around the bed, but only connected floor counts. It cannot pass through walls or doors.",
      },
      {
        title: "Shared Furniture Splits Value",
        body: "If one furniture piece supports multiple heroes, its comfort value is split between them and rounded down for each hero.",
      },
      {
        title: "Leaving Home Grants Bonuses",
        body: "The Planning Table shows each hero's comfort score as x/100. When active heroes leave for a dungeon, their current comfort score grants temporary run bonuses that vanish when they return home.",
      },
    ],
  },
  stealth: {
    title: "Stealth Guide",
    steps: [
      {
        title: "Start Stealth",
        body: "In exploration, press Stealth on a hero card to roll Dexterity (Stealth). The result is shown on the hero card and with an H badge on the map token.",
      },
      {
        title: "Sneak Past Rooms",
        body: "When a stealthing hero opens a door to monsters, their Stealth total is compared to each monster's passive Perception. If Stealth wins, initiative does not start.",
      },
      {
        title: "Who Breaks Stealth",
        body: "A non-stealthing hero entering the monster room starts danger normally. AI allies automatically stealth when the hero they follow is stealthing.",
      },
      {
        title: "New Checks",
        body: "A new Stealth roll happens when a stealthing hero acts in a monster room, such as opening another door, looting a chest, disarming a trap, investigating furniture, or using a feature.",
      },
      {
        title: "Too Close",
        body: "Moving within 5 ft of a monster also rolls a new Stealth check. The nearby monster rolls active Perception with advantage. If the hero is noticed, initiative starts.",
      },
    ],
  },
};

function showHomeLibraryTutorial(topic = "homeExpansion", stepIndex = 0) {
  const tutorial = homeLibraryTutorials[topic] ?? homeLibraryTutorials.homeExpansion;
  const index = Math.max(0, Math.min(tutorial.steps.length - 1, Number(stepIndex) || 0));
  const step = tutorial.steps[index];
  els.fighterInfo.classList.remove("home-builder-dock");
  els.fighterInfoName.textContent = tutorial.title;
  els.fighterInfoBody.innerHTML = `
    <section class="library-tutorial" aria-live="polite">
      <div class="library-tutorial-step">Step ${index + 1} / ${tutorial.steps.length}</div>
      <h3>${escapeHtml(step.title)}</h3>
      <p>${escapeHtml(step.body)}</p>
      <div class="library-tutorial-actions">
        <button type="button" data-action="library-tutorial-step" data-topic="${escapeAttribute(topic)}" data-step="${index - 1}" ${index <= 0 ? "disabled" : ""}>Previous Step</button>
        <button type="button" data-action="library-tutorial-step" data-topic="${escapeAttribute(topic)}" data-step="${index + 1}" ${index >= tutorial.steps.length - 1 ? "disabled" : ""}>Next Step</button>
      </div>
    </section>
  `;
  els.fighterInfo.classList.remove("hidden");
}

function titleCaseTag(tag) {
  return String(tag ?? "other")
    .split(/[-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function monsterDungeonHints(monster) {
  const hints = window.DungeonContent
    .list("themes")
    .filter((theme) => !theme.hidden)
    .filter((theme) => {
      if (theme.monsterIds?.includes(monster.id) || theme.bossMonsterIds?.includes(monster.id)) return true;
      const monsterGroups = normalizeTagGroups(theme.monsterTagGroups, theme.monsterTags);
      const bossGroups = normalizeTagGroups(theme.bossMonsterTagGroups, theme.bossMonsterTags);
      return contentMatchesAnyTagGroup(monster, monsterGroups) || contentMatchesAnyTagGroup(monster, bossGroups);
    })
    .map((theme) => theme.name ?? theme.id)
    .filter(Boolean);
  return Array.from(new Set(hints)).slice(0, 3);
}

function showMonsterArtPreview(src, name = "Monster") {
  if (!src) return;
  hideMonsterArtPreview();
  const overlay = document.createElement("div");
  overlay.className = "monster-art-preview";
  overlay.innerHTML = `
    <section class="monster-art-preview-panel" role="dialog" aria-modal="true" aria-label="${escapeAttribute(name)} artwork">
      <button type="button" class="icon-button monster-art-preview-close" data-action="close-monster-art-preview" aria-label="Close">x</button>
      <img src="${escapeAttribute(src)}" alt="${escapeAttribute(name)} artwork" />
      <h3>${escapeHtml(name)}</h3>
    </section>
  `;
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay || event.target.closest("[data-action='close-monster-art-preview']")) hideMonsterArtPreview();
  });
  document.body.append(overlay);
}

function hideMonsterArtPreview() {
  document.querySelector(".monster-art-preview")?.remove();
}

function cookHomeMeal() {
  for (const hero of rosterHeroes().filter((entry) => !entry.dead)) {
    hero.statusEffects = (hero.statusEffects ?? []).filter((effect) => effect.id !== "home-hearty-meal");
    hero.statusEffects.push({ id: "home-hearty-meal", label: "Hearty Meal", maxHpBonus: 2, saveBonus: 1, expiresAtHome: true });
    refreshDerivedStats(hero);
  }
  addLog("The party shares a hearty meal: +2 max HP and +1 saves until returning home.", "important");
  render();
  showDungeonObjectInfo(dungeonObjectForId("home-cooking-pot") ?? { type: "home-cooking-pot", position: { x: 2, y: 1 }, homePlaced: true });
}

function harvestHomeHerbs() {
  state.home = normalizeHomeData(state.home);
  if (state.home.herbsReady === false) {
    addLog("The herb garden has not regrown yet. Clear another dungeon to refresh it.", "important");
    showDungeonObjectInfo(dungeonObjectForId("home-herb-garden") ?? { type: "home-herb-garden", position: { x: 11, y: 18 }, homePlaced: true });
    return;
  }
  const potion = createItemInstance("potion-healing", "home-garden");
  if (potion) {
    addItemToInventory(activeHero(), potion, "home-garden");
    addLog(`${activeHero().name} harvests herbs and prepares ${potion.name}.`, "important");
    state.home.herbsReady = false;
    syncHomeLayoutToDungeon();
  }
  render();
  showDungeonObjectInfo(dungeonObjectForId("home-herb-garden") ?? { type: "home-herb-garden", position: { x: 11, y: 18 }, homePlaced: true });
}

function showHomeChestInfo() {
  showDungeonObjectInfo(homeChestObject());
}

function assignHomeBed(objectId, heroId) {
  const bed = dungeonObjectForId(objectId);
  if (!bed || !objectComponent(bed.type, "homeBed")) return;
  const normalizedHeroId = heroId && isClassHero(state.fighters[heroId]) ? heroId : "";
  for (const object of state.dungeonObjects ?? []) {
    if (object.id !== objectId && object.assignedHeroId === normalizedHeroId && objectComponent(object.type, "homeBed")) {
      delete object.assignedHeroId;
    }
  }
  if (normalizedHeroId) {
    bed.assignedHeroId = normalizedHeroId;
    addLog(`${objectTemplate(bed.type)?.name ?? "Bed"} assigned to ${state.fighters[normalizedHeroId].name}.`, "important");
  } else {
    delete bed.assignedHeroId;
    addLog(`${objectTemplate(bed.type)?.name ?? "Bed"} is now unassigned.`, "important");
  }
  syncHomeLayoutToDungeon();
  render();
  showDungeonObjectInfo(dungeonObjectForId(objectId));
}

function showHomeBedRange(objectId) {
  const bed = dungeonObjectForId(objectId);
  const bedComponent = bed ? objectComponent(bed.type, "homeBed") : null;
  if (!bed || !bedComponent) return;
  homeComfortRangePreviewKeys = homeComfortReachableKeysFromObject(bed, bedComponent.range ?? 4);
  hideFighterInfo();
  render();
  window.setTimeout(() => {
    document.addEventListener("pointerdown", clearHomeBedRangePreview, { once: true, capture: true });
  }, 0);
}

function clearHomeBedRangePreview() {
  if (!homeComfortRangePreviewKeys.size) return;
  homeComfortRangePreviewKeys = new Set();
  render();
}

function homeComfortReachableKeysFromObject(object, range = 4) {
  const floorKeys = homeCellKeys();
  const objectFloorCells = objectCells(object).filter((cell) => floorKeys.has(positionKey(cell)));
  if (!objectFloorCells.length) return new Set();
  const bounds = objectFloorCells.reduce(
    (box, cell) => ({
      minX: Math.min(box.minX, cell.x),
      maxX: Math.max(box.maxX, cell.x),
      minY: Math.min(box.minY, cell.y),
      maxY: Math.max(box.maxY, cell.y),
    }),
    { minX: objectFloorCells[0].x, maxX: objectFloorCells[0].x, minY: objectFloorCells[0].y, maxY: objectFloorCells[0].y },
  );
  const boxKeys = new Set();
  for (let y = bounds.minY - range; y <= bounds.maxY + range; y += 1) {
    for (let x = bounds.minX - range; x <= bounds.maxX + range; x += 1) {
      const key = positionKey({ x, y });
      if (floorKeys.has(key)) boxKeys.add(key);
    }
  }
  const connected = new Set(objectFloorCells.map(positionKey));
  const queue = [...objectFloorCells];
  while (queue.length) {
    const current = queue.shift();
    for (const next of adjacentCells(current)) {
      const key = positionKey(next);
      if (!boxKeys.has(key) || connected.has(key) || homeDoorBlocksComfortBetween(current, next)) continue;
      connected.add(key);
      queue.push(next);
    }
  }
  return new Set([...boxKeys].filter((key) => connected.has(key)));
}

function homeDoorBlocksComfortBetween(from, to) {
  const fromKey = positionKey(from);
  const toKey = positionKey(to);
  return (state.home?.doors ?? []).some((door) => {
    const doorKey = positionKey(door);
    const corridorKey = positionKey(door.corridor ?? homeDoorNeighbor(door, homeDoorDirection(door)));
    return (fromKey === doorKey && toKey === corridorKey) || (fromKey === corridorKey && toKey === doorKey);
  });
}

function homeObjectComfortPoints(object) {
  const bed = objectComponent(object.type, "homeBed");
  if (bed) return bed.comfort ?? 0;
  const decor = objectComponent(object.type, "homeDecor");
  if (decor) return Math.max(0, Math.min(10, decor.comfort ?? 1));
  if (homeComfortScores[object.type] !== undefined) return homeComfortScores[object.type];
  return homeObjectIsComfortDecor(object) ? 1 : 0;
}

function homeObjectIsComfortDecor(object) {
  const template = objectTemplate(object?.type);
  if (!object?.homePlaced || !template) return false;
  if (objectComponent(object.type, "homeBed")) return false;
  if (homeObjectTypeIsStorage(object.type, template)) return false;
  if (["home-bookshelf", "home-cooking-pot", "home-herb-garden", "portal"].includes(object.type)) return false;
  if (template.kind === "trap" || objectHasComponent(object.type, "trap") || objectHasComponent(object.type, "captiveCreature")) return false;
  return true;
}

function homeComfortContributionData() {
  const data = new Map();
  const bedsByHero = new Map();
  const sharedObjects = new Map();
  for (const bed of (state.dungeonObjects ?? []).filter((object) => object.assignedHeroId && objectComponent(object.type, "homeBed"))) {
    const hero = state.fighters[bed.assignedHeroId];
    if (!hero || !isClassHero(hero)) continue;
    const bedComponent = objectComponent(bed.type, "homeBed");
    bedsByHero.set(hero.id, bed);
    data.get(hero.id)?.contributions ?? data.set(hero.id, { contributions: [] });
    data.get(hero.id).contributions.push({ name: objectTemplate(bed.type)?.name ?? "Bed", points: bedComponent.comfort ?? 0, basePoints: bedComponent.comfort ?? 0, shared: false });
    const reachable = homeComfortReachableKeysFromObject(bed, bedComponent.range ?? 4);
    for (const object of state.dungeonObjects ?? []) {
      if (object.id === bed.id || objectComponent(object.type, "homeBed")) continue;
      const points = homeObjectComfortPoints(object);
      if (points <= 0) continue;
      if (!objectCells(object).some((cell) => reachable.has(positionKey(cell)))) continue;
      sharedObjects.set(object.id, {
        object,
        basePoints: points,
        heroIds: new Set([...(sharedObjects.get(object.id)?.heroIds ?? []), hero.id]),
      });
    }
  }
  for (const { object, basePoints, heroIds } of sharedObjects.values()) {
    const shareCount = heroIds.size;
    const awardedPoints = Math.floor(basePoints / shareCount);
    for (const heroId of heroIds) {
      data.get(heroId)?.contributions ?? data.set(heroId, { contributions: [] });
      data.get(heroId).contributions.push({
        name: objectTemplate(object.type)?.name ?? object.type,
        points: awardedPoints,
        basePoints,
        shared: shareCount > 1,
        shareCount,
      });
    }
  }
  for (const [heroId, entry] of data.entries()) {
    entry.total = entry.contributions.reduce((sum, contribution) => sum + contribution.points, 0);
    entry.bed = bedsByHero.get(heroId) ?? null;
  }
  return data;
}

function homeComfortDetailsForHero(heroId, data = homeComfortContributionData()) {
  return data.get(heroId) ?? { total: 0, contributions: [] };
}

function objectAdjacentToHero(object, hero = activeHero()) {
  if (!object || !hero?.position) return false;
  return objectCells(object).some((cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1);
}

function captiveCreatureComponent(object) {
  return object?.captiveFreed ? null : objectComponent(object, "captiveCreature");
}

function captiveCreatureMonsterId(object) {
  const component = captiveCreatureComponent(object);
  if (!component) return null;
  if (object.captiveMonsterId) return object.captiveMonsterId;
  const monsterIds = component.monsterIds ?? (component.monsterId ? [component.monsterId] : []);
  return monsterIds.find((monsterId) => getMonsterTemplate(monsterId)) ?? null;
}

function captiveCreatureLabel(object) {
  const template = getMonsterTemplate(captiveCreatureMonsterId(object));
  return template?.name ?? "Captive creature";
}

function canFreeCaptiveObject(object) {
  const hero = activeHero();
  return Boolean(
    captiveCreatureComponent(object) &&
      captiveCreatureMonsterId(object) &&
      objectAdjacentToHero(object, hero) &&
      (state.mode !== "combat" || activeFighter()?.id === hero?.id) &&
      (state.mode !== "combat" || activeFighter()?.hasAction),
  );
}

function addRecruitedAllyToParty(ally) {
  state.fighters[ally.id] = ally;
  state.party.rosterIds = [...new Set([...(state.party.rosterIds ?? []), ally.id])];
  state.party.heroIds = [...new Set([...(state.party.heroIds ?? []), ally.id])];
  if (state.mode === "combat") addMonsterToInitiative(ally);
}

function spawnCaptiveHostile(monsterId, object, position) {
  const template = getMonsterTemplate(monsterId);
  if (!template) return null;
  const monster = createCombatant({
    ...template,
    id: `captive-hostile-${monsterId}-${Date.now()}`,
    name: `${template.name} (Freed)`,
    position,
  });
  applyMonsterCategoryScaling(monster, activeHero());
  monster.roomId = roomForPosition(position)?.id ?? roomForPosition(object.position)?.id ?? "captive";
  state.fighters[monster.id] = monster;
  if (state.mode === "combat") addMonsterToInitiative(monster);
  return monster;
}

function freeCaptiveCreature(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  const component = captiveCreatureComponent(object);
  const monsterId = captiveCreatureMonsterId(object);
  const template = monsterId ? getMonsterTemplate(monsterId) : null;
  if (!object || !component || !template || !hero) return;
  if (!objectAdjacentToHero(object, hero)) {
    addLog(`${hero.name} needs to be next to ${objectTemplate(object.type)?.name ?? "the crate"} to open it.`);
    renderLog();
    return;
  }
  if (state.mode === "combat" && activeFighter()?.id !== hero.id) return;
  if (state.mode === "combat" && !hero.hasAction) return;
  if (!activeStealthCheckInMonsterRoom(hero, `opens ${objectTemplate(object.type)?.name ?? "a cage"}`)) return;

  const position = nearestOpenCellAroundObject(object, template);
  if (!position) {
    object.lastResult = `There is no room to free ${template.name}.`;
    addLog(object.lastResult, "important");
    showDungeonObjectInfo(object);
    return;
  }

  const rollResult = rollD20ForFighter(hero);
  const guidance = guidanceSkillBonus();
  const skillId = component.skill ?? "animal-handling";
  const ability = component.ability ?? skillDefinitions[skillId]?.ability ?? "wis";
  const roll = reliableTalentRoll(hero, skillId, rollResult.roll);
  const bonus = skillCheckBonus(hero, ability, skillId);
  const total = roll + bonus + guidance;
  const dc = component.dc ?? 13;
  const skillLabel = skillName(skillId);
  const guidanceText = guidance ? ` + Guidance ${guidance}` : "";
  const checkText = `${hero.name} frees ${template.name}: ${skillLabel} ${roll} ${abilityLabel(bonus)}${guidanceText} = ${total} vs DC ${dc}.`;
  const success = total >= dc;

  object.captiveFreed = true;
  object.spent = true;
  object.lastResult = checkText;
  if (state.mode === "combat") hero.hasAction = false;
  addLog(checkText, "important");
  addAdminCheckLog({ actor: hero, label: `${skillLabel} check to free captive`, target: template.name, rollResult, bonus, guidance, total, dc, success, note: success ? `recruited as ${component.control === "player" ? "player companion" : "AI ally"}` : "released hostile" });
  recordD20OutcomeForFighter(hero, success);

  if (success) {
    const ally = createFriendlyBeastFromMonster(monsterId, {
      id: `ally-${monsterId}-${Date.now()}`,
      name: template.name,
      position,
      kind: component.kind ?? "ally",
      control: component.control ?? "ai",
      renameable: true,
      className: component.allyKind ?? (template.tags?.[0] === "undead" ? "Undead Ally" : "Beast Ally"),
    });
    if (ally) {
      ally.roomId = roomForPosition(position)?.id ?? roomForPosition(object.position)?.id ?? "captive";
      addRecruitedAllyToParty(ally);
      object.lastResult += ` ${ally.name} joins the party.`;
      addLog(`${ally.name} joins the party.`, "important");
    }
  } else {
    const monster = spawnCaptiveHostile(monsterId, object, position);
    object.lastResult += ` ${monster?.name ?? template.name} turns hostile.`;
    addLog(`${monster?.name ?? template.name} turns hostile.`, "important");
  }

  render();
  showDungeonObjectInfo(object);
}

function roleOptionsMarkup(selectedRole) {
  return ["tank", "dd", "heal"]
    .map((role) => `<option value="${role}" ${selectedRole === role ? "selected" : ""}>${role.toUpperCase()}</option>`)
    .join("");
}

function planningClassLabel(hero) {
  const subclass = hero?.subclassName ? ` (${hero.subclassName})` : "";
  return `Level ${hero?.level ?? 1} ${hero?.className ?? "Hero"}${subclass}`;
}

function showPlanningTableInfo() {
  const unboundRemoved = normalizeActivePartyOwnerBindings();
  if (unboundRemoved.length) {
    addLog(`${unboundRemoved.map((id) => state.fighters[id]?.name ?? "A companion").join(", ")} cannot join the active party without their bonded hero.`, "important");
  }
  els.fighterInfo.classList.remove("home-builder-dock");
  const activeIds = state.party?.heroIds ?? ["hero"];
  const rosterIds = state.party?.rosterIds ?? activeIds;
  const allPlanningIds = [...new Set([...activeIds, ...rosterIds])];
  const activeClassIds = activeIds.filter((id) => isClassHero(state.fighters[id]));
  const activeSupportIds = activeIds.filter((id) => state.fighters[id] && !isClassHero(state.fighters[id]));
  const benchIds = rosterIds.filter((id) => !activeIds.includes(id));
  const canRetireMember = (hero) => Boolean(hero && (!isClassHero(hero) || allPlanningIds.filter((id) => id !== hero.id && isClassHero(state.fighters[id]) && !state.fighters[id].dead).length > 0));
  const retireButtonMarkup = (hero) => {
    const disabled = canRetireMember(hero) ? "" : "disabled";
    const title = disabled ? ` title="Create or keep another class hero before retiring ${escapeAttribute(hero.name)}."` : "";
    return `<button class="delete-save" type="button" data-action="retire-party-member" data-hero="${escapeAttribute(hero.id)}" ${disabled}${title}>Retire</button>`;
  };
  const slotMarkup = Array.from({ length: 4 }, (_, index) => {
    const heroId = activeClassIds[index];
    const hero = heroId ? state.fighters[heroId] : null;
    return `
      <div class="planning-slot">
        <div>
          <b>${index + 1}. ${hero ? escapeHtml(hero.name) : "Empty Slot"}</b>
          <span>${hero ? `${hero.dead ? "Dead" : escapeHtml(planningClassLabel(hero))}${index === 0 ? " - Main" : ""}` : "Add a hero from the roster"}</span>
        </div>
        ${
          hero
            ? `<select data-action="party-role" data-hero="${escapeAttribute(hero.id)}">${roleOptionsMarkup(partyRoleFor(hero))}</select>
               <button type="button" data-action="make-main-hero" data-hero="${escapeAttribute(hero.id)}" ${index === 0 || hero.dead ? "disabled" : ""}>Main</button>
               <button type="button" data-action="remove-party-hero" data-hero="${escapeAttribute(hero.id)}" ${activeClassIds.length <= 1 ? "disabled" : ""}>Remove</button>
               ${retireButtonMarkup(hero)}`
            : ""
        }
      </div>
    `;
  }).join("");
  const supportMarkup = activeSupportIds.length
    ? activeSupportIds
        .map((id) => {
          const hero = state.fighters[id];
          return `
            <div class="planning-slot bench-slot">
              <div>
                <b>${escapeHtml(hero.name)}</b>
                <span>${escapeHtml(hero.className ?? (partyMemberKind(hero) === "companion" ? "Companion" : "Ally"))}${hero.companionControl === "ai" ? " - AI controlled" : " - Player controlled"}</span>
              </div>
              <button type="button" data-action="remove-party-hero" data-hero="${escapeAttribute(hero.id)}">Remove</button>
              ${retireButtonMarkup(hero)}
            </div>
          `;
        })
        .join("")
    : `<p class="empty-note">No active allies or companions.</p>`;
  const benchMarkup = benchIds.length
    ? benchIds
        .map((id) => {
          const hero = state.fighters[id];
          if (!hero) return "";
          const classHero = isClassHero(hero);
          const ownerId = boundCompanionOwnerId(hero);
          const missingOwner = ownerId && !activeIds.includes(ownerId);
          const addDisabled = (classHero && activeClassIds.length >= activeClassHeroLimit()) || hero.dead || missingOwner;
          const addTitle = missingOwner ? ` title="Requires ${escapeAttribute(state.fighters[ownerId]?.name ?? "bonded hero")} in the active party."` : "";
          return `
            <div class="planning-slot bench-slot">
              <div>
                <b>${escapeHtml(hero.name)}</b>
                <span>${hero.dead ? "Dead" : classHero ? escapeHtml(planningClassLabel(hero)) : `${escapeHtml(hero.className ?? "Ally")}${hero.companionControl === "ai" ? " - AI controlled" : " - Player controlled"}${missingOwner ? ` - bound to ${escapeHtml(state.fighters[ownerId]?.name ?? "hero")}` : ""}`}</span>
              </div>
              ${classHero ? `<select data-action="party-role" data-hero="${escapeAttribute(hero.id)}">${roleOptionsMarkup(partyRoleFor(hero))}</select>` : ""}
              <button type="button" data-action="add-party-hero" data-hero="${escapeAttribute(hero.id)}" ${addDisabled ? "disabled" : ""}${addTitle}>Add</button>
              ${retireButtonMarkup(hero)}
            </div>
          `;
        })
        .join("")
    : `<p class="empty-note">No reserve heroes yet.</p>`;
  const comfortData = homeComfortContributionData();
  const comfortMarkup = rosterIds
    .map((id) => state.fighters[id])
    .filter((hero) => hero && isClassHero(hero))
    .map((hero) => {
      const comfort = homeComfortDetailsForHero(hero.id, comfortData);
      return `
        <details class="comfort-details">
          <summary><span>${escapeHtml(hero.name)}</span><b>${comfort.total}/100</b></summary>
          ${
            comfort.contributions.length
              ? comfort.contributions
                  .map(
                    (entry) => `
                      <div class="comfort-row">
                        <span>${escapeHtml(entry.name)}${entry.shared ? ` <small>shared ${entry.basePoints} / ${entry.shareCount}</small>` : ""}</span>
                        <b>+${entry.points}</b>
                      </div>
                    `,
                  )
                  .join("")
              : `<p class="empty-note">No assigned bed or comfort furniture in range.</p>`
          }
        </details>
      `;
    })
    .join("");

  els.fighterInfoName.textContent = "Planning Table";
  els.fighterInfoBody.innerHTML = `
    <div class="object-description">Choose the active party and set each hero's role before leaving home.</div>
    <section class="planning-party">
      <h3>Dice Feel</h3>
      <label class="inline-transfer">
        <span>Hero roll style</span>
        <select data-action="d20-mode">${d20ModeOptionsMarkup()}</select>
      </label>
      <p class="planning-helper">${escapeHtml(d20ModeDescriptions[normalizeD20Mode(state.d20Mode)] ?? "")}</p>
    </section>
    <section class="planning-party">
      <h3>Active Class Heroes</h3>
      ${slotMarkup}
    </section>
    <section class="planning-party">
      <h3>Active Allies and Companions</h3>
      ${supportMarkup}
    </section>
    <section class="planning-party">
      <h3>Hero Roster</h3>
      ${benchMarkup}
    </section>
    <section class="planning-party">
      <h3>Home Comfort</h3>
      ${comfortMarkup || `<p class="empty-note">No class heroes in the roster.</p>`}
    </section>
    <div class="object-actions">
      <button type="button" data-action="show-quest-log">Quest Log [J]</button>
      <button type="button" data-action="create-roster-hero">Create New Hero</button>
    </div>
  `;
  els.fighterInfo.classList.remove("hidden");
}

function defaultPartyRoleForHero(hero) {
  const role = hero?.classRole ?? hero?.className ?? hero?.class ?? "fighter";
  return String(role).toLowerCase().includes("fighter") ? "tank" : "dd";
}

async function createRosterHero() {
  let chosenName = "";
  let heroOptions = null;
  let chosenTokenArt = "";
  let raceSelection = defaultRaceSelection;
  let classId = defaultContent.heroClass;
  while (!heroOptions) {
    const identity = await showHeroIdentityDialog({
      title: "New Hero Name",
      message: "Name the new hero for your roster.",
      nameValue: chosenName || "New Hero",
      tokenArt: chosenTokenArt,
      confirmText: "Create Hero",
    });
    if (!identity) {
      showPlanningTableInfo();
      return;
    }
    chosenName = identity.name || "New Hero";
    chosenTokenArt = identity.tokenArt;
    const chosenClass = await showHeroClassDialog();
    if (chosenClass === dialogBackValue) {
      heroOptions = null;
      continue;
    }
    if (!chosenClass) {
      showPlanningTableInfo();
      return;
    }
    classId = chosenClass;
    const chosenRace = await showHeroRaceDialog({ selection: raceSelection });
    if (chosenRace === dialogBackValue) {
      heroOptions = null;
      continue;
    }
    if (!chosenRace) {
      showPlanningTableInfo();
      return;
    }
    raceSelection = chosenRace;
    heroOptions = await createCharacterOptions(raceSelection, classId);
    if (heroOptions === dialogBackValue) {
      heroOptions = null;
      continue;
    }
  }
  if (!heroOptions) {
    showPlanningTableInfo();
    return;
  }
  const heroId = `hero-${Date.now()}`;
  const hero = createCombatant(
    applyHeroCreationOptions(
      {
        ...getHeroTemplate(classId),
        id: heroId,
        name: chosenName.trim() || "New Hero",
        tokenArt: chosenTokenArt,
        position: planningTablePosition(),
      },
      { ...heroOptions, raceSelection, classId },
    ),
  );
  if (!(await chooseStartingFeatsForHero(hero, heroOptions.startingFeatChoiceCount, heroOptions.startingFeatSourceName))) {
    showPlanningTableInfo();
    return;
  }
  hero.id = heroId;
  hero.token = tokenFromName(hero.name, hero.token);
  hero.partyRole = defaultPartyRoleForHero(hero);
  const rosterIds = new Set(state.party.rosterIds ?? state.party.heroIds ?? ["hero"]);
  rosterIds.add(heroId);
  state.party.rosterIds = Array.from(rosterIds);
  state.fighters[heroId] = prepareRestedHero(hero, homeHeroPositions(state.party.rosterIds).find((entry) => entry.id === heroId)?.position ?? { x: 4, y: 6 });
  const addedToActiveParty = isClassHero(state.fighters[heroId]) && activeClassHeroIds().length < activeClassHeroLimit();
  if (addedToActiveParty) {
    state.party.heroIds = uniqueValues([...(state.party.heroIds ?? ["hero"]), heroId]);
    state.party.activeHeroId = state.party.activeHeroId ?? heroId;
  }
  roomIsBuilt = false;
  addLog(`${hero.name} joins the roster${addedToActiveParty ? " and active party" : ""}.`, "important");
  window.DepthboundPlaytest?.submitRosterHero?.(state.fighters[heroId]);
  render();
  showPlanningTableInfo();
}

function addHeroToParty(heroId) {
  const hero = state.fighters[heroId];
  if (!hero || hero.dead || isPartyHeroId(heroId)) return;
  const ownerId = boundCompanionOwnerId(hero);
  if (ownerId && !isPartyHeroId(ownerId)) {
    addLog(`${hero.name} is bound to ${state.fighters[ownerId]?.name ?? "their hero"} and cannot join without them.`, "important");
    render();
    showPlanningTableInfo();
    return;
  }
  if (isClassHero(hero) && activeClassHeroIds().length >= activeClassHeroLimit()) return;
  state.party.heroIds = uniqueValues([...(state.party.heroIds ?? ["hero"]), heroId]);
  if (isClassHero(hero)) {
    const boundIds = boundCompanionsForOwner(heroId)
      .map((companion) => companion.id)
      .filter((id) => (state.party.rosterIds ?? []).includes(id) && !state.fighters[id]?.dead);
    state.party.heroIds = uniqueValues([...state.party.heroIds, ...boundIds]);
  }
  state.party.activeHeroId = state.party.activeHeroId ?? heroId;
  addLog(`${state.fighters[heroId].name} joins the active party.`, "important");
  render();
  showPlanningTableInfo();
}

function removeHeroFromParty(heroId) {
  if (isClassHero(state.fighters[heroId]) && activeClassHeroIds().length <= 1) return;
  const removeIds = new Set([heroId]);
  if (isClassHero(state.fighters[heroId])) {
    for (const companion of boundCompanionsForOwner(heroId)) removeIds.add(companion.id);
  }
  state.party.heroIds = (state.party.heroIds ?? ["hero"]).filter((id) => !removeIds.has(id));
  if (state.party.heroIds.length === 0) state.party.heroIds = ["hero"];
  if (state.party.activeHeroId === heroId) state.party.activeHeroId = state.party.heroIds.find((id) => !isAutonomousAlly(state.fighters[id])) ?? state.party.heroIds[0];
  addLog(`${state.fighters[heroId]?.name ?? "Hero"} leaves the active party.`, "important");
  render();
  showPlanningTableInfo();
}

async function retirePartyMember(heroId) {
  const hero = state.fighters[heroId];
  if (!hero || state.mode !== "home") return;
  const allRosterIds = [...new Set([...(state.party?.heroIds ?? []), ...(state.party?.rosterIds ?? [])])];
  const remainingClassHeroIds = allRosterIds.filter((id) => id !== heroId && isClassHero(state.fighters[id]) && !state.fighters[id].dead);
  if (isClassHero(hero) && remainingClassHeroIds.length === 0) {
    addLog("You need at least one class hero in the roster.", "important");
    showPlanningTableInfo();
    return;
  }

  const choice = await showChoiceDialog({
    title: `Retire ${hero.name}?`,
    message: `${hero.name} will be permanently removed from the active party and roster. This cannot be undone, and any carried items will be lost.`,
    choices: [
      { value: "cancel", label: "Keep" },
      { value: "retire", label: "Retire" },
    ],
    actor: hero,
  });
  if (choice !== "retire") {
    showPlanningTableInfo();
    return;
  }

  state.party.heroIds = (state.party.heroIds ?? ["hero"]).filter((id) => id !== heroId);
  state.party.rosterIds = (state.party.rosterIds ?? state.party.heroIds ?? ["hero"]).filter((id) => id !== heroId);
  state.initiative = (state.initiative ?? []).filter((entry) => entry.fighterId !== heroId);
  selectedHeroIds.delete(heroId);
  delete state.fighters[heroId];

  const fallbackId =
    state.party.heroIds.find((id) => state.fighters[id] && isPlayerControlledPartyFighter(state.fighters[id])) ??
    state.party.rosterIds.find((id) => state.fighters[id] && isClassHero(state.fighters[id])) ??
    remainingClassHeroIds[0] ??
    "hero";
  if (!state.party.heroIds.length && state.fighters[fallbackId]) state.party.heroIds = [fallbackId];
  state.party.activeHeroId = fallbackId;
  selectedHeroIds = new Set(state.fighters[fallbackId] ? [fallbackId] : []);
  addLog(`${hero.name} is retired from the roster.`, "important");
  roomIsBuilt = false;
  render();
  showPlanningTableInfo();
}

function makeMainHero(heroId) {
  if (!isPartyHeroId(heroId) || state.fighters[heroId]?.dead) return;
  promoteMainHero(heroId);
  addLog(`${state.fighters[heroId].name} takes the main party slot.`, "important");
  render();
  showPlanningTableInfo();
}

function setHeroRole(heroId, role) {
  if (!["tank", "dd", "heal"].includes(role) || !state.fighters[heroId]) return;
  state.fighters[heroId].partyRole = role;
  render();
}

function setD20Mode(mode) {
  const nextMode = normalizeD20Mode(mode);
  state.d20Mode = nextMode;
  state.d20FailureStreak = 0;
  addLog(`Dice feel set to ${d20ModeLabels[nextMode]}.`, "important");
  render();
}

function takeObjectItem(objectId, itemId) {
  const homeStorage = homeStorageObjectForId(objectId);
  if (homeStorage) {
    moveHomeStorageItemToInventory(objectId, itemId);
    showDungeonObjectInfo(homeStorageObjectForId(objectId));
    return;
  }

  const object = dungeonObjectForId(objectId);
  if (!object || !objectHasLoot(object)) return;
  if (object.locked) {
    object.lastResult = `${objectTemplate(object.type)?.name ?? "The container"} is locked.`;
    showDungeonObjectInfo(object);
    return;
  }
  const hero = activeHero();
  if (
    (state.mode === "combat" && activeFighter()?.id !== hero.id) ||
    !objectCells(object).some((cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1)
  ) {
    addLog(`${hero.name} needs to be next to ${objectTemplate(object.type)?.name ?? "it"} to loot it${state.mode === "combat" ? " on their turn" : ""}.`);
    renderLog();
    return;
  }
  if (!activeStealthCheckInMonsterRoom(hero, `opens ${objectTemplate(object.type)?.name ?? "a container"}`)) return;

  if (object.trap) {
    const mageHand = (hero.statusEffects ?? []).some((effect) => effect.id === "mage-hand");
    if (mageHand) {
      hero.statusEffects = (hero.statusEffects ?? []).filter((effect) => effect.id !== "mage-hand");
      delete object.trap;
      object.lastResult = `${hero.name}'s Mage Hand opens ${objectTemplate(object.type)?.name ?? "it"} without triggering its trap.`;
      addLog(object.lastResult, "important");
    } else {
      triggerChestTrap(object);
      render();
      showDungeonObjectInfo(object);
      return;
    }
  }

  const item = (object.items ?? []).find((entry) => entry.id === itemId);
  if (!item) return;

  void triggerCustomDungeonStory("openObject", { objectId: object.id, object });
  object.items = (object.items ?? []).filter((entry) => entry.id !== itemId);
  addItemToInventory(hero, item, "object-stack");
  addLog(`${hero.name} takes ${item.name} from ${objectTemplate(object.type)?.name ?? "the feature"}.`, "important");
  logTomeStorageForItem(item);
  render();
  showDungeonObjectInfo(object);
}

function corpseById(corpseId) {
  const hero = state.fighters?.[corpseId];
  return hero?.dead ? hero : null;
}

function lootCorpseMoney(corpseId) {
  const corpse = corpseById(corpseId);
  const hero = activeHero();
  if (!corpse || !corpseCanBeHandledHere(corpse) || !heroCanAct(hero) || !canFighterReceiveInventory(hero)) return;
  const coins = moneyToCp(corpse.inventory?.money ?? {});
  const tokens = corpse.inventory?.heroTokens ?? 0;
  if (coins > 0) addMoney(hero.inventory.money, coins);
  if (tokens > 0) hero.inventory.heroTokens = (hero.inventory.heroTokens ?? 0) + tokens;
  corpse.inventory.money = normalizeMoney();
  corpse.inventory.heroTokens = 0;
  addLog(`${hero.name} takes ${[coins ? moneyText(cpToMoney(coins)) : "", tokens ? `${tokens} Hero Token${tokens === 1 ? "" : "s"}` : ""].filter(Boolean).join(" and ") || "nothing"} from ${corpse.name}.`, "important");
  render();
  showCombatantInfo(corpse);
}

function lootCorpseItem(corpseId, itemId) {
  const corpse = corpseById(corpseId);
  const hero = activeHero();
  if (!corpse || !corpseCanBeHandledHere(corpse) || !heroCanAct(hero) || !canFighterReceiveInventory(hero)) return;
  const item = (corpse.inventory?.items ?? []).find((entry) => entry.id === itemId);
  if (!item) return;
  corpse.inventory.items = (corpse.inventory.items ?? []).filter((entry) => entry.id !== itemId);
  for (const slot of equipmentSlots) {
    if (corpse.equipment?.[slot.id] === itemId) corpse.equipment[slot.id] = null;
  }
  addItemToInventory(hero, item, "corpse-loot");
  refreshDerivedStats(corpse);
  addLog(`${hero.name} takes ${item.name} from ${corpse.name}'s body.`, "important");
  render();
  showCombatantInfo(corpse);
}

function transportCorpseToBase(corpseId) {
  const corpse = corpseById(corpseId);
  if (!corpse || !corpseCanBeHandledHere(corpse)) return;
  const record = ensureHeroCorpseState(corpse);
  record.location = "base";
  record.transportedAtDungeonTimeSeconds = dungeonElapsedSeconds({ sync: false });
  record.transportedAtCampaignTimeSeconds = campaignElapsedSeconds({ sync: false });
  corpse.corpseAtBase = true;
  state.party.heroIds = livingPartyHeroIds();
  selectedHeroIds.delete(corpse.id);
  if (state.party.activeHeroId === corpse.id || !state.fighters[state.party.activeHeroId] || state.fighters[state.party.activeHeroId].dead) {
    state.party.activeHeroId = state.party.heroIds.find((id) => state.fighters[id] && !state.fighters[id].dead) ?? "hero";
  }
  addLog(`${activeHero()?.name ?? "The party"} sends ${corpse.name}'s body back to base.`, "important");
  render();
  hideFighterInfo();
}

function castCorpseSpell(corpseId, casterId, spellId) {
  const corpse = corpseById(corpseId);
  const caster = state.fighters?.[casterId];
  if (!corpse || !caster || !corpseCanBeHandledHere(corpse)) return;
  const baseSpell = spellDefinitionsForFighter(caster).find((spell) => spell.id === spellId || spell.aliasOf === spellId);
  if (!baseSpell) return;
  const spell = spellWithCastLevel(baseSpell, spellBaseLevel(baseSpell));
  let success = false;
  if (spell.effect?.kind === "revive") success = reviveCorpseWithSpell(caster, corpse, spell);
  if (spell.effect?.kind === "preserveCorpse") success = preserveCorpseWithSpell(caster, corpse, spell);
  if (!success) return;
  render();
  if (state.mode === "home") renderGraveyardMenu();
  else if (corpse.dead) showCombatantInfo(corpse);
  else hideFighterInfo();
}

function pickObjectLock(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  if (!object || !object.locked || normalizeSpecialLock(object.specialLock)) return;
  if (
    (state.mode === "combat" && activeFighter()?.id !== hero.id) ||
    !objectCells(object).some((cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1)
  ) {
    addLog(`${hero.name} needs to be next to ${objectTemplate(object.type)?.name ?? "it"} to pick the lock${state.mode === "combat" ? " on their turn" : ""}.`);
    renderLog();
    return;
  }
  if (!activeStealthCheckInMonsterRoom(hero, `picks ${objectTemplate(object.type)?.name ?? "a lock"}`)) return;
  if (triggerContainerTrapDuringUnlock(object, hero)) return;

  const rollResult = rollD20ForFighter(hero);
  const roll = reliableTalentRoll(hero, "disarm", rollResult.roll);
  const bonus = thievesToolsCheckBonus(hero);
  const total = roll + bonus;
  const dc = object.lockDc ?? 12;
  const training = thievesToolsTraining(hero);
  const trainingLabel = training === 2 ? " with thieves' tools expertise" : training === 1 ? " with thieves' tools proficiency" : "";
  const attemptText = `${hero.name} picks the lock${trainingLabel}: DEX ${roll} ${abilityLabel(bonus)} = ${total} vs DC ${dc}.`;
  object.lockAttemptsByHero ??= {};
  object.lockAttemptsByHero[hero.id] = true;
  object.lastResult = attemptText;
  addLog(attemptText, "important");
  addAdminCheckLog({ actor: hero, label: "Thieves' Tools check to pick lock", target: objectTemplate(object.type)?.name ?? "object", rollResult, bonus, total, dc, success: total >= dc, note: trainingLabel ? trainingLabel.trim() : "not proficient" });
  if (total >= dc) {
    object.locked = false;
    object.lastResult += " The lock clicks open.";
    addLog("The lock clicks open.", "important");
    recordD20OutcomeForFighter(hero, true);
  } else {
    object.lastResult += " The lock holds.";
    addLog("The lock holds.");
    recordD20OutcomeForFighter(hero, false);
  }
  render();
  showDungeonObjectInfo(object);
}

async function answerObjectSpecialLock(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  const specialLock = normalizeSpecialLock(object?.specialLock);
  if (!object || !object.locked || !specialLock) return;
  if (
    (state.mode === "combat" && activeFighter()?.id !== hero.id) ||
    !objectCells(object).some((cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1)
  ) {
    addLog(`${hero.name} needs to be next to ${objectTemplate(object.type)?.name ?? "it"} to use the lock${state.mode === "combat" ? " on their turn" : ""}.`);
    renderLog();
    return;
  }
  if (!activeStealthCheckInMonsterRoom(hero, `tries ${objectTemplate(object.type)?.name ?? "a keyed lock"}`)) return;
  if (triggerContainerTrapDuringUnlock(object, hero)) return;
  const answer = await showGameDialog({
    title: specialLock.label,
    message: specialLock.prompt,
    input: { label: "Key", value: "", maxLength: 120 },
    confirmText: "Unlock",
    cancelText: "Cancel",
  });
  if (answer === null) return;
  if (specialLockAnswerMatches(specialLock, answer)) {
    object.locked = false;
    object.specialLock = { ...specialLock, unlocked: true };
    object.lastResult = `${specialLock.label} accepts the key.`;
    addLog(`${hero.name} unlocks ${objectTemplate(object.type)?.name ?? "the lock"}.`, "important");
  } else {
    object.lastResult = `${specialLock.label} rejects the key.`;
    addLog(`${specialLock.label} rejects the key.`);
  }
  render();
  showDungeonObjectInfo(object);
}

function storeHomeChestItem(itemId, objectId = "home-chest") {
  moveInventoryItemToHomeStorage(itemId, objectId);
  showDungeonObjectInfo(homeStorageObjectForId(objectId) ?? homeChestObject());
}

function storeAllHomeChestItems(objectId = "home-chest") {
  unequippedInventoryItems(activeHero())
    .map((item) => item.id)
    .forEach((itemId) => moveInventoryItemToHomeStorage(itemId, objectId));
  showDungeonObjectInfo(homeStorageObjectForId(objectId) ?? homeChestObject());
}

function takeAllHomeChestItems(objectId = "home-chest") {
  const storage = homeStorageObjectForId(objectId);
  (storage?.items ?? [])
    .map((item) => item.id)
    .forEach((itemId) => moveHomeStorageItemToInventory(objectId, itemId));
  showDungeonObjectInfo(homeStorageObjectForId(objectId) ?? homeChestObject());
}

function trapComponentForObject(object) {
  return objectComponent(object, "trap") ?? objectComponent(object?.type, "trap");
}

function trapIsMagical(trap, object = null) {
  return Boolean(trap?.magical || trapComponentForObject(object)?.magical);
}

function trapDisarmOptions(trap, object = null) {
  const component = trapComponentForObject(object);
  const configured = trap?.disarmSkillOptions ?? component?.disarmSkillOptions;
  if (Array.isArray(configured) && configured.length) {
    return configured.map((option) => ({
      skill: option.skill ?? "investigation",
      ability: option.ability ?? skillDefinitions[option.skill ?? "investigation"]?.ability ?? "int",
      dc: option.dc,
    }));
  }
  if (trap?.disarmSkill || component?.disarmSkill) {
    const skill = trap?.disarmSkill ?? component?.disarmSkill;
    return [{ skill, ability: trap?.disarmAbility ?? component?.disarmAbility ?? skillDefinitions[skill]?.ability ?? "int" }];
  }
  if (trapIsMagical(trap, object)) return [{ skill: "arcana", ability: "int" }];
  if (object?.trap) return [{ skill: "sleight-of-hand", ability: "dex" }, { skill: "investigation", ability: "int", dc: (trap?.spotDc ?? 12) + 2 }];
  return [{ skill: "investigation", ability: "int" }, { skill: "sleight-of-hand", ability: "dex", dc: (trap?.spotDc ?? object?.spotDc ?? 12) + 2 }];
}

function bestTrapDisarmOption(hero, trap, object = null) {
  const baseDc = trap?.spotDc ?? object?.spotDc ?? 12;
  return trapDisarmOptions(trap, object)
    .map((option) => ({
      ...option,
      dc: option.dc ?? baseDc,
      bonus: skillCheckBonus(hero, option.ability ?? "int", option.skill ?? "investigation"),
    }))
    .sort((a, b) => b.bonus - a.bonus || a.dc - b.dc)[0] ?? { skill: "investigation", ability: "int", dc: baseDc, bonus: skillCheckBonus(hero, "int", "investigation") };
}

function trapDisarmSummary(trap, object = null) {
  return trapDisarmOptions(trap, object)
    .map((option) => `${skillName(option.skill ?? "investigation")} DC ${option.dc ?? trap?.spotDc ?? object?.spotDc ?? 12}`)
    .join(" or ");
}

function heroKnowsDispelMagic(hero) {
  return spellDefinitionsForFighter(hero).some((spell) => canonicalSpellId(spell.id) === "dispel-magic");
}

function dispelMagicTrapSpell(hero) {
  const spell = getContentDefinition("spells", "dispel-magic");
  if (!spell || !heroKnowsDispelMagic(hero)) return null;
  return spellWithCastLevel(spell, Math.max(3, spellBaseLevel(spell)));
}

function canDispelMagicTrap(hero, trap, object = null) {
  const spell = dispelMagicTrapSpell(hero);
  return Boolean(state.mode !== "combat" && trapIsMagical(trap, object) && spell && canCastSpell(hero, spell));
}

function clearTrapFromObject(object, trap) {
  if (object?.trap && trap === object.trap) {
    delete object.trap;
    return;
  }
  if (trap) {
    trap.disarmed = true;
    trap.armed = false;
    trap.spent = false;
  }
}

function dispelMagicTrap(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  if (!object || !hero || state.mode === "combat") return;
  if (!objectCells(object).some((cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1)) return;
  const trap = object.trap ?? object;
  if (!trap || !trap.detected || trap.armed === false || trap.disarmed || !canDispelMagicTrap(hero, trap, object)) return;
  if (!activeStealthCheckInMonsterRoom(hero, `dispels ${trap.name ?? objectTemplate(object.type)?.name ?? "a magical trap"}`)) return;
  const spell = dispelMagicTrapSpell(hero);
  spendSpellResources(hero, spell);
  clearTrapFromObject(object, trap);
  object.lastResult = `${hero.name} casts Dispel Magic and unravels ${trap.name ?? objectTemplate(object.type)?.name ?? "the magical trap"}.`;
  addLog(object.lastResult, "important");
  awardHeroXp(25, "dispelling a magical trap");
  render();
  showDungeonObjectInfo(object);
}

function disarmTrap(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  if (
    !object ||
    state.mode === "combat" ||
    !objectCells(object).some((cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1)
  ) return;

  const trap = object.trap ?? object;
  if (!trap || !trap.detected || trap.armed === false || trap.disarmed) return;
  trap.disarmAttemptsByHero ??= {};
  if (trap.disarmAttemptsByHero[hero.id]) return;
  if (!activeStealthCheckInMonsterRoom(hero, `disarms ${objectTemplate(object.type)?.name ?? "a trap"}`)) return;

  const option = bestTrapDisarmOption(hero, trap, object);
  const disarmPosition = objectCells(object)[0] ?? object.position ?? hero.position;
  const check = typeof rollSkillCheck === "function"
    ? rollSkillCheck(hero, option.ability ?? "int", option.skill, { sightBased: ["perception", "investigation"].includes(option.skill), position: disarmPosition, guidance: true })
    : {
        rollResult: rollD20ForFighter(hero),
        roll: 0,
        bonus: option.bonus,
        guidance: guidanceSkillBonus(),
        lightContext: null,
      };
  if (!check.roll) check.roll = reliableTalentRoll(hero, option.skill, check.rollResult.roll);
  check.total = check.total ?? check.roll + check.bonus + check.guidance;
  const { rollResult, roll, bonus, guidance, total, lightContext } = check;
  const dc = option.dc ?? trap.spotDc ?? 12;
  trap.disarmAttemptsByHero[hero.id] = true;
  const guidanceText = guidance ? ` + Guidance ${guidance}` : "";
  const disadvantageText = lightContext?.disadvantage ? " with disadvantage" : "";
  const lightNote = typeof lightContextNote === "function" ? lightContextNote(lightContext, "; ") : "";
  const attemptText = `${hero.name} attempts to disarm the trap${disadvantageText}: ${String(option.ability ?? "int").toUpperCase()} ${skillName(option.skill)} ${roll} ${abilityLabel(bonus)}${guidanceText} = ${total} vs DC ${dc}${lightNote}.`;
  object.lastResult = attemptText;
  addLog(attemptText, "important");
  addAdminCheckLog({ actor: hero, label: "Disarm check", target: objectTemplate(object.type)?.name ?? "trap", rollResult, bonus, guidance, total, dc, success: roll !== 1 && total >= dc, note: [roll === 1 ? "natural 1 triggers trap" : "", lightContext?.note].filter(Boolean).join("; ") });
  if (roll === 1) {
    recordD20OutcomeForFighter(hero, false);
    object.lastResult += " Critical failure — the trap triggers.";
    addLog("Critical failure — the trap triggers.", "important");
    if (object.trap) {
      triggerChestTrap(object, hero);
    } else {
      triggerTrapAtPosition(hero, object.position);
    }
  } else if (total >= dc) {
    recordD20OutcomeForFighter(hero, true);
    clearTrapFromObject(object, trap);
    object.lastResult += " The trap is disarmed.";
    addLog("The trap is disarmed.", "important");
    awardHeroXp(25, "disarming a trap");
  } else {
    recordD20OutcomeForFighter(hero, false);
    object.lastResult += " The trap remains armed.";
    addLog("The trap remains armed.");
  }
  render();
  showDungeonObjectInfo(object);
}

function nearestOpenCellAroundObject(object, footprintSource = null) {
  const startCells = objectCells(object);
  const walkable = currentWalkable();
  const queue = startCells.flatMap((cell) => adjacentCells(cell).map((position) => ({ position, distance: 1 })));
  const visited = new Set(startCells.map(positionKey));

  while (queue.length > 0) {
    const current = queue.shift();
    const key = positionKey(current.position);
    if (visited.has(key)) continue;
    visited.add(key);

    if (window.DungeonGrid.fighterCells(footprintSource ?? {}, current.position).every((cell) =>
      walkable.has(positionKey(cell)) &&
        !window.DungeonGrid.isOccupied(cell, state.fighters) &&
        window.DungeonGrid.isInsideGrid(cell, currentGridSize()),
    )) {
      return current.position;
    }

    for (const next of adjacentCells(current.position)) {
      const nextKey = positionKey(next);
      if (!visited.has(nextKey) && window.DungeonGrid.isInsideGrid(next, currentGridSize())) {
        queue.push({ position: next, distance: current.distance + 1 });
      }
    }
  }

  return null;
}

function spawnInvestigationAmbush(object) {
  const objectRoom = roomForPosition(object.position);
  const blockedKeys = new Set([
    ...blockingObjectKeys(),
    ...Object.values(state.fighters)
      .filter((fighter) => fighter.alive)
      .flatMap((fighter) => window.DungeonGrid.fighterCells(fighter).map(positionKey)),
  ]);
  const monsterTemplate = getMonsterTemplate(pickWeightedMonsterId(weightedMonsterIdsForHero(activeHero())));
  const position = objectRoom
    ? safeRoomSpawnCell(objectRoom, activeHero().position, blockedKeys, currentGridSize(), spawnFloorKeysForDungeon(), monsterTemplate)
    : nearestOpenCellAroundObject(object, monsterTemplate);
  if (!position) {
    addLog("Something stirs nearby, but there is no space for it to emerge.");
    object.lastResult = "Something stirs nearby, but there is no space for it to emerge.";
    return null;
  }

  const monster = createCombatant({
    ...monsterTemplate,
    id: `ambush-${Date.now()}`,
    name: `${monsterTemplate.name} Ambusher`,
    position,
  });
  applyMonsterCategoryScaling(monster, activeHero());
  monster.roomId = roomForPosition(position)?.id ?? "ambush";
  state.fighters[monster.id] = monster;
  addLog(`${monster.name} bursts from hiding near ${objectTemplate(object.type)?.name ?? "the feature"}.`, "important");
  object.lastResult = `${monster.name} bursts from hiding near ${objectTemplate(object.type)?.name ?? "the feature"}.`;
  return monster;
}

function inspectEventMonsterIds(component = {}) {
  return component.monsterIds ?? (component.monsterId ? [component.monsterId] : []);
}

function inspectEventSpawnMonsters(object, component = {}) {
  const hero = activeHero();
  const objectRoom = roomForPosition(object.position);
  const monsterIds = inspectEventMonsterIds(component).filter((monsterId) => getMonsterTemplate(monsterId));
  const monsterId = monsterIds[Math.floor(Math.random() * monsterIds.length)];
  const monsterTemplate = monsterId ? getMonsterTemplate(monsterId) : null;
  if (!hero || !objectRoom || !monsterTemplate) return [];

  const blockedKeys = new Set([
    ...blockingObjectKeys(),
    ...Object.values(state.fighters)
      .filter((fighter) => fighter.alive)
      .flatMap((fighter) => window.DungeonGrid.fighterCells(fighter).map(positionKey)),
  ]);
  const spawnCount = component.count ?? roomMonsterSpawnCount(monsterTemplate, hero);
  const spawned = [];
  for (let index = 0; index < spawnCount; index += 1) {
    const position = safeRoomSpawnCell(objectRoom, hero.position, blockedKeys, currentGridSize(), spawnFloorKeysForDungeon(), monsterTemplate);
    if (!position) continue;
    const monster = createCombatant({
      ...monsterTemplate,
      id: `inspect-event-${monsterTemplate.id}-${Date.now()}-${index + 1}`,
      name: `${monsterTemplate.name}${spawnCount > 1 ? ` ${index + 1}` : ""}`,
      position,
    });
    applyMonsterCategoryScaling(monster, hero);
    monster.roomId = objectRoom.id;
    state.fighters[monster.id] = monster;
    window.DungeonGrid.fighterCells(monster).forEach((cell) => blockedKeys.add(positionKey(cell)));
    spawned.push(monster);
  }
  if (spawned.length && state.mode === "combat") spawned.forEach(addMonsterToInitiative);
  return spawned;
}

function grantInspectEventLoot(hero, object, component = {}) {
  const loot = component.loot ?? component;
  const items = Array.isArray(loot.items) && loot.count
    ? shuffledCopy(loot.items).slice(0, Math.min(loot.items.length, Math.max(1, Math.floor(Number(loot.count) || 1))))
    : loot.items;
  const temporaryComponent = {
    reward: loot.reward,
    gold: loot.gold,
    item: loot.item,
    items,
    count: loot.count,
  };
  return grantFeatureInspectionReward(hero, object, temporaryComponent);
}

function resolveInspectEvent(hero, object, component = {}) {
  const spawnChance = component.spawnChance ?? 0.5;
  const shouldSpawn = Math.random() < spawnChance;
  if (shouldSpawn) {
    const spawned = inspectEventSpawnMonsters(object, component);
    if (spawned.length) {
      const names = spawned.map((monster) => monster.name).join(", ");
      object.lastResult += ` ${names} emerge.`;
      addLog(`${names} emerge from ${objectTemplate(object.type)?.name ?? "the feature"}.`, "important");
      return true;
    }
  }
  if (grantInspectEventLoot(hero, object, component)) return true;
  object.lastResult += " Found nothing out of the ordinary.";
  addLog(`${hero.name} finds nothing out of the ordinary.`);
  return false;
}

function grantFeatureInspectionReward(hero, object, component) {
  if (!component || component.claimed) return false;
  if (component.reward === "smallGold" || component.gold) {
    const dice = component.gold ?? { count: 1, sides: 6 };
    const coins = rollDice(dice.count ?? 1, dice.sides ?? 6).total + (dice.bonus ?? 0);
    addMoney(hero.inventory.money, coins);
    object.lastResult += ` Found ${moneyText(cpToMoney(coins))}.`;
    addLog(`${hero.name} finds ${moneyText(cpToMoney(coins))}.`, "important");
    return true;
  }
  const items = rollFeatureLoot(component, "found");
  if (items.length) {
    items.forEach((item) => addItemToInventory(hero, item, "found-stack"));
    object.lastResult += ` Found ${items.map((item) => item.name).join(", ")}.`;
    addLog(`${hero.name} finds ${items.map((item) => item.name).join(", ")}.`, "important");
    logTomeStorageForItems(items);
    return true;
  }
  return false;
}

function resourceNodeCheckLabel(component = {}) {
  const ability = String(component.ability ?? "wis").toUpperCase();
  return component.skill ? `${ability} ${skillName(component.skill)}` : ability;
}

function uniqueInteractionOptions(component = {}) {
  if (Array.isArray(component.skillOptions) && component.skillOptions.length) return component.skillOptions;
  if (Array.isArray(component.skills) && component.skills.length) {
    return component.skills.map((skill) => ({ skill, ability: skillDefinitions[skill]?.ability ?? component.ability ?? "int" }));
  }
  const skill = component.skill ?? "investigation";
  return [{ skill, ability: component.ability ?? skillDefinitions[skill]?.ability ?? "int" }];
}

function uniqueInteractionCheckLabels(component = {}) {
  return uniqueInteractionOptions(component).map((option) => `${String(option.ability ?? skillDefinitions[option.skill]?.ability ?? "int").toUpperCase()} ${skillName(option.skill)}`);
}

function uniqueInteractionSummary(component = {}) {
  const checks = uniqueInteractionCheckLabels(component).join(", ");
  return `${checks} DC ${component.dc ?? 13}; takes ${formatDuration(component.timeSeconds ?? 600)}. One party attempt.`;
}

function bestUniqueInteractionOption(hero, component = {}) {
  const options = uniqueInteractionOptions(component);
  return options
    .map((option) => {
      const skillId = option.skill ?? "investigation";
      const ability = option.ability ?? skillDefinitions[skillId]?.ability ?? "int";
      return { skill: skillId, ability, bonus: skillCheckBonus(hero, ability, skillId) };
    })
    .sort((a, b) => b.bonus - a.bonus || skillName(a.skill).localeCompare(skillName(b.skill)))[0] ?? { skill: "investigation", ability: "int", bonus: 0 };
}

function applyObjectInteractionDamage(hero, object, damage = { count: 1, sides: 6, type: "force" }, label = "backlash") {
  const roll = rollDice(damage.count ?? 1, damage.sides ?? 6);
  const rawDamage = Math.max(1, roll.total + (damage.bonus ?? 0));
  const modified = calculateDamageModifiers(hero, rawDamage, damage.type ?? "damage");
  applyDamageToFighter(hero, modified.damage);
  const note = modified.reason ? ` ${hero.name} is ${modified.reason} to ${damage.type} damage.` : "";
  addLog(`${hero.name} suffers ${modified.damage} ${damage.type ?? "damage"} damage from ${label}.${note}`, "damage");
  if (!hero.alive) {
    addLog(`${hero.name} drops to 0 HP.`, "important");
    handleHeroDeath();
  }
  return modified.damage;
}

function grantObjectInteractionItem(hero, itemId, source = "feature") {
  const item = createItemInstance(itemId, source);
  if (!item) return "";
  addItemToInventory(hero, item, "feature-stack");
  return item.name;
}

function healObjectInteractionTarget(target, amount) {
  const healed = applyHealingToHero(target, amount);
  return healed > 0 ? `${target.name} restores ${healed} HP.` : `${target.name} is already at full HP.`;
}

function cleanseCommonBadStatuses(hero) {
  const removeIds = new Set(["frightened", "shaken", "drained", "poisoned", "nauseated", "sickened", "smoke-choked", "smoke-blinded"]);
  const before = hero.statusEffects?.length ?? 0;
  hero.statusEffects = (hero.statusEffects ?? []).filter((effect) => !removeIds.has(effect.id) && !removeIds.has(String(effect.label ?? "").toLowerCase()));
  refreshDerivedStats(hero);
  return before - (hero.statusEffects?.length ?? 0);
}

function revealExitRoomFromFeature() {
  const roomId = state.exit?.roomId;
  if (!roomId) return false;
  state.exploration ??= {};
  state.exploration.discoveredRoomIds = Array.from(new Set([...(state.exploration.discoveredRoomIds ?? []), roomId]));
  return true;
}

function revealNearbyFeatureTraps(object) {
  const room = roomForPosition(object.position);
  const roomIds = new Set(room ? [room.id] : []);
  let revealed = 0;
  for (const entry of state.dungeonObjects ?? []) {
    const entryRoom = roomForPosition(entry.position);
    if (roomIds.size && entryRoom && !roomIds.has(entryRoom.id)) continue;
    if (objectIsTrap(entry) && !entry.detected) {
      entry.detected = true;
      revealed += 1;
    }
    if (entry.trap && !entry.trap.detected) {
      entry.trap.detected = true;
      revealed += 1;
    }
  }
  return revealed;
}

function disarmOneNearbyFeatureTrap(object) {
  const room = roomForPosition(object.position);
  const candidate = (state.dungeonObjects ?? []).find((entry) => {
    const entryRoom = roomForPosition(entry.position);
    if (room && entryRoom?.id !== room.id) return false;
    return (objectIsTrap(entry) && entry.armed !== false && !entry.disarmed) || entry.trap;
  });
  if (!candidate) return false;
  if (candidate.trap) {
    delete candidate.trap;
  } else {
    candidate.disarmed = true;
    candidate.armed = false;
  }
  return true;
}

function addObjectInteractionBlessing(hero, component, total, greatSuccess) {
  const targets = greatSuccess ? partyHeroes().filter((entry) => entry.alive).slice(0, component.maxTargetsOnGreat ?? 99) : [hero];
  for (const target of targets) {
    applyStatusEffect(target, {
      id: component.statusId ?? `feature-${component.effect ?? "blessing"}`,
      label: component.statusLabel ?? component.label ?? "Blessed",
      ...(component.status ?? { saveBonus: 1 }),
      expiresAtHome: component.expiresAtHome ?? true,
      durationRounds: component.durationRounds,
      startsOnNextEncounter: Boolean(component.durationRounds),
    });
  }
  return `${targets.map((target) => target.name).join(", ")} gain ${component.statusLabel ?? component.label ?? "a blessing"}.`;
}

function objectInteractionResistanceType(object, component = {}) {
  if (component.resistance) return component.resistance;
  const tags = objectTags(object);
  if (tags.includes("poison") || tags.includes("swamp") || tags.includes("bog")) return "poison";
  if (tags.includes("sun-temple") || tags.includes("radiant")) return "radiant";
  if (tags.includes("fire") || tags.includes("hell") || tags.includes("infernal") || tags.includes("forge")) return "fire";
  if (tags.includes("undead") || tags.includes("crypt")) return "necrotic";
  return "force";
}

function resolveObjectInteractionSuccess(hero, object, component, total, rollResult) {
  const effect = component.effect ?? "blessing";
  const dc = component.dc ?? 13;
  const greatSuccess = total >= dc + (component.greatSuccessMargin ?? 5) || rollResult.roll === 20;
  const messages = [];

  if (effect === "manaWell") {
    const max = spellPointMaximum(hero);
    if (max <= 0) {
      messages.push("The well hums, but this hero cannot hold spell points.");
    } else {
      const abilityModBonus = Math.max(abilityMod(hero, "int"), abilityMod(hero, "wis"), abilityMod(hero, "cha"), 0);
      const restore = greatSuccess ? Math.max(3, proficiencyBonus(hero) + abilityModBonus) : Math.max(2, proficiencyBonus(hero));
      const before = hero.spellPoints ?? 0;
      hero.spellPoints = Math.min(max, before + restore);
      messages.push(`${hero.name} regains ${hero.spellPoints - before} spell points.`);
    }
  } else if (effect === "runeCircle") {
    messages.push(addObjectInteractionBlessing(hero, component, total, greatSuccess));
  } else if (effect === "soulCage") {
    const tempHp = Math.max(3, proficiencyBonus(hero) + Math.max(0, abilityMod(hero, "cha")));
    for (const target of partyHeroes().filter((entry) => entry.alive)) {
      applyStatusEffect(target, { id: "freed-soul", label: "Freed Soul", tempHp, durationRounds: 10, startsOnNextEncounter: true });
    }
    messages.push(`The freed soul shields the party with ${tempHp} temporary HP.`);
  } else if (effect === "contractLectern") {
    for (const target of partyHeroes().filter((entry) => entry.alive)) {
      applyStatusEffect(target, { id: "contract-loophole", label: "Contract Loophole", resistances: ["fire"], durationRounds: 10, startsOnNextEncounter: true });
    }
    messages.push("The party gains fire resistance for the next encounter.");
    if (greatSuccess) {
      const name = grantObjectInteractionItem(hero, "devil-blood", "contract");
      if (name) messages.push(`Found ${name}.`);
    }
  } else if (effect === "futureReflection") {
    applyStatusEffect(hero, { id: "future-reflection", label: "Future Reflection", saveBonus: 2, initiativeBonus: 2, durationRounds: 10, startsOnNextEncounter: true });
    messages.push(`${hero.name} reads a useful future reflection.`);
    if (greatSuccess && revealExitRoomFromFeature()) messages.push("The exit room is revealed.");
  } else if (effect === "spellbookStand") {
    const max = spellPointMaximum(hero);
    if (max > 0) {
      const before = hero.spellPoints ?? 0;
      hero.spellPoints = Math.min(max, before + (greatSuccess ? 2 : 1));
      messages.push(`${hero.name} recovers ${hero.spellPoints - before} spell point${hero.spellPoints - before === 1 ? "" : "s"}.`);
    }
    if (greatSuccess) {
      const name = grantObjectInteractionItem(hero, "crystal-shard", "spellbook");
      if (name) messages.push(`Found ${name}.`);
    }
  } else if (effect === "arcaneLectern") {
    const revealed = revealNearbyFeatureTraps(object);
    messages.push(revealed ? `${revealed} nearby trap${revealed === 1 ? "" : "s"} revealed.` : "No nearby traps answer the lectern.");
    if (greatSuccess && disarmOneNearbyFeatureTrap(object)) messages.push("One nearby trap is disarmed.");
  } else if (effect === "glyphExit") {
    revealExitRoomFromFeature();
    messages.push("The glyphs mark the dungeon exit room on the map.");
  } else if (effect === "confessionScreen") {
    const removed = cleanseCommonBadStatuses(hero);
    if (removed > 0) messages.push(`${hero.name} sheds ${removed} harmful effect${removed === 1 ? "" : "s"}.`);
    else {
      applyStatusEffect(hero, { id: "confessed", label: "Confessed", saveBonus: 1, durationRounds: 10, startsOnNextEncounter: true });
      messages.push(`${hero.name} gains +1 to saves for the next encounter.`);
    }
  } else if (effect === "offeringBlessing") {
    messages.push(addObjectInteractionBlessing(hero, { ...component, statusLabel: "Offering Blessing", status: { tempHp: Math.max(2, proficiencyBonus(hero)), saveBonus: 1 } }, total, greatSuccess));
  } else if (effect === "sacredFont") {
    const removed = cleanseCommonBadStatuses(hero);
    messages.push(healObjectInteractionTarget(hero, rollDice(2, 4).total + proficiencyBonus(hero)));
    if (removed > 0) messages.push(`${removed} harmful effect${removed === 1 ? "" : "s"} cleansed.`);
    if (greatSuccess) {
      const name = grantObjectInteractionItem(hero, "sacred-ash", "font");
      if (name) messages.push(`Created ${name}.`);
    }
  } else if (effect === "burialRite") {
    object.investigated = true;
    const name = grantObjectInteractionItem(hero, greatSuccess ? "grave-wax" : "bone-dust", "burial");
    messages.push(name ? `The dead rest quietly. Found ${name}.` : "The dead rest quietly.");
  } else if (effect === "mirageCrystal") {
    const revealed = revealNearbyFeatureTraps(object);
    messages.push(revealed ? `${revealed} nearby hidden danger${revealed === 1 ? "" : "s"} revealed.` : "The illusion thins, but reveals no traps nearby.");
    if (greatSuccess) applyStatusEffect(hero, { id: "mirage-decoy", label: "Mirage Decoy", acBonus: 2, durationRounds: 10, startsOnNextEncounter: true });
  } else if (effect === "eggHarvest") {
    object.investigated = true;
    const name = grantObjectInteractionItem(hero, objectTags(object).includes("web") ? "spider-silk" : "glowspore-dust", "egg-cluster");
    messages.push(name ? `Extracted ${name}.` : "The cluster is safely neutralized.");
  } else if (effect === "safePool") {
    const removed = cleanseCommonBadStatuses(hero);
    messages.push(healObjectInteractionTarget(hero, rollDice(1, 6).total + proficiencyBonus(hero)));
    if (removed > 0) messages.push(`${removed} harmful effect${removed === 1 ? "" : "s"} washed away.`);
  } else if (effect === "acidCollect") {
    object.armed = false;
    object.spent = true;
    const name = grantObjectInteractionItem(hero, "abyssal-bile", "acid");
    messages.push(name ? `Neutralized the acid and collected ${name}.` : "The acid is neutralized.");
  } else if (effect === "forgeHeat") {
    const itemId = objectTags(object).includes("brimstone") ? "brimstone-chunk" : objectTags(object).includes("slag") ? "slag-glass" : "hellfire-ember";
    const name = grantObjectInteractionItem(hero, itemId, "forge");
    if (name) messages.push(`Drew heat into ${name}.`);
    if (greatSuccess) {
      applyStatusEffect(hero, { id: "forge-heated-weapon", label: "Forge Heat", weaponRider: true, damageBonus: rollDie(6), damageType: "fire", expiresAtHome: true });
      messages.push(`${hero.name}'s next weapon hits carry forge fire.`);
    }
  } else if (effect === "anvilTune") {
    applyStatusEffect(hero, { id: "tempered-gear", label: "Tempered Gear", acBonus: 1, damageBonus: 1, expiresAtHome: true });
    messages.push(`${hero.name}'s gear is tempered for the dungeon.`);
  } else if (effect === "incenseWard") {
    const resistance = objectInteractionResistanceType(object, component);
    applyStatusEffect(hero, { id: `${resistance}-incense-ward`, label: "Incense Ward", resistances: [resistance], durationRounds: 10, startsOnNextEncounter: true });
    messages.push(`${hero.name} gains ${resistance} resistance for the next encounter.`);
  } else {
    messages.push(addObjectInteractionBlessing(hero, component, total, greatSuccess));
  }

  return messages.filter(Boolean).join(" ");
}

function resolveObjectInteractionFailure(hero, object, component) {
  const damage = component.failureDamage ?? { count: 1, sides: 6, type: component.failureType ?? "force" };
  if (component.failureStatus) applyStatusEffect(hero, { ...component.failureStatus });
  const label = component.failureLabel ?? component.label ?? objectTemplate(object.type)?.name ?? "the feature";
  applyObjectInteractionDamage(hero, object, damage, label);
  if (component.effect === "burialRite" || component.effect === "eggHarvest") {
    spawnInvestigationAmbush(object);
  }
  return component.failureText ?? `${hero.name} mishandles ${objectTemplate(object.type)?.name ?? "the feature"}.`;
}

function useObjectInteraction(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  const template = object ? objectTemplate(object.type) : null;
  const component = object && !object.uniqueInteractionClaimed ? objectComponent(object, "uniqueInteraction") : null;
  if (!object || !hero || !template || !component || state.mode === "combat") return;
  if (!objectAdjacentToHero(object, hero)) {
    addLog(`${hero.name} needs to be next to ${template.name} to use it.`);
    renderLog();
    return;
  }
  if (!activeStealthCheckInMonsterRoom(hero, `uses ${template.name}`)) return;

  const option = bestUniqueInteractionOption(hero, component);
  const interactionPosition = objectCells(object)[0] ?? object.position ?? hero.position;
  const check = typeof rollSkillCheck === "function"
    ? rollSkillCheck(hero, option.ability ?? skillDefinitions[option.skill]?.ability ?? "int", option.skill, { sightBased: ["perception", "investigation"].includes(option.skill), position: interactionPosition, guidance: true })
    : {
        rollResult: rollD20ForFighter(hero),
        roll: 0,
        bonus: option.bonus,
        guidance: guidanceSkillBonus(),
        lightContext: null,
      };
  if (!check.roll) check.roll = reliableTalentRoll(hero, option.skill, check.rollResult.roll);
  check.total = check.total ?? check.roll + check.bonus + check.guidance;
  const { rollResult, roll, bonus, guidance, total, lightContext } = check;
  const dc = component.dc ?? 13;
  const success = total >= dc;
  const guidanceText = guidance ? ` + Guidance ${guidance}` : "";
  const checkLabel = `${String(option.ability).toUpperCase()} ${skillName(option.skill)}`;
  const disadvantageText = lightContext?.disadvantage ? " with disadvantage" : "";
  const lightNote = typeof lightContextNote === "function" ? lightContextNote(lightContext, "; ") : "";
  const checkText = `${hero.name} uses ${template.name}${disadvantageText}: ${checkLabel} ${roll} ${abilityLabel(bonus)}${guidanceText} = ${total} vs DC ${dc}${lightNote}.`;
  object.uniqueInteractionClaimed = true;
  object.spent = true;
  object.lastResult = checkText;
  addLog(checkText, "important");
  recordD20OutcomeForFighter(hero, success);
  addAdminCheckLog({ actor: hero, label: `${component.label ?? template.name} interaction`, target: template.name, rollResult, bonus, guidance, total, dc, success, note: [component.effect ?? "uniqueInteraction", lightContext?.note].filter(Boolean).join("; ") });

  const resultText = success ? resolveObjectInteractionSuccess(hero, object, component, total, rollResult) : resolveObjectInteractionFailure(hero, object, component);
  object.lastResult = `${checkText} ${resultText}`;
  addLog(resultText, success ? "important" : "damage");
  advanceDungeonTime(component.timeSeconds ?? 600, `${hero.name} using ${template.name}`, { force: true });

  render();
  showDungeonObjectInfo(object);
}

function resourceNodeQuantity(reward = {}, component = {}, total = 0, rollResult = {}) {
  const dc = component.dc ?? 12;
  if (total < dc) return 0;
  const baseQuantity = Math.max(1, Math.floor(Number(reward.baseQuantity ?? 1) || 1));
  const maxQuantity = Math.max(baseQuantity, Math.floor(Number(reward.maxQuantity ?? baseQuantity) || baseQuantity));
  const step = Math.max(1, Math.floor(Number(reward.quantityStep ?? component.quantityStep ?? 5) || 5));
  const qualityBonus = Math.floor(Math.max(0, total - dc) / step);
  const naturalTwentyBonus = rollResult.roll === 20 ? 1 : 0;
  return Math.min(maxQuantity, baseQuantity + qualityBonus + naturalTwentyBonus);
}

function resourceNodeRewardEntries(component = {}, total = 0, rollResult = {}) {
  const rewards = Array.isArray(component.rewards)
    ? component.rewards
    : component.itemId
      ? [{ itemId: component.itemId, baseQuantity: component.baseQuantity, maxQuantity: component.maxQuantity, quantityStep: component.quantityStep }]
      : [];
  return rewards
    .map((reward) => ({
      itemId: reward.itemId ?? reward.item,
      quantity: resourceNodeQuantity(reward, component, total, rollResult),
    }))
    .filter((entry) => entry.itemId && entry.quantity > 0);
}

function addResourceNodeRewards(hero, entries = []) {
  const granted = [];
  for (const entry of entries) {
    const item = createItemInstance(entry.itemId, "resource-node");
    if (!item) continue;
    item.quantity = Math.max(1, Math.floor(Number(entry.quantity) || 1));
    addItemToInventory(hero, item, "resource-node-stack");
    granted.push({ item, quantity: item.quantity });
  }
  return granted;
}

function resourceNodeRewardsText(granted = []) {
  return granted.map((entry) => `${entry.quantity} ${entry.item.name}`).join(", ");
}

function farmResourceNode(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  const template = object ? objectTemplate(object.type) : null;
  const component = object && !object.resourceNodeClaimed ? objectComponent(object, "resourceNode") : null;
  if (!object || !hero || !template || !component || state.mode === "combat") return;
  if (!objectAdjacentToHero(object, hero)) {
    addLog(`${hero.name} needs to be next to ${template.name} to gather resources.`);
    renderLog();
    return;
  }
  if (!activeStealthCheckInMonsterRoom(hero, `gathers from ${template.name}`)) return;

  const skillId = component.skill ?? null;
  const ability = component.ability ?? (skillId ? skillDefinitions[skillId]?.ability : null) ?? "wis";
  const gatherPosition = objectCells(object)[0] ?? object.position ?? hero.position;
  const check = typeof rollSkillCheck === "function" && skillId
    ? rollSkillCheck(hero, ability, skillId, { sightBased: ["perception", "investigation"].includes(skillId), position: gatherPosition, guidance: true })
    : {
        rollResult: rollD20ForFighter(hero),
        roll: 0,
        bonus: skillCheckBonus(hero, ability, skillId),
        guidance: guidanceSkillBonus(),
        lightContext: null,
      };
  if (!check.roll) check.roll = skillId ? reliableTalentRoll(hero, skillId, check.rollResult.roll) : check.rollResult.roll;
  check.total = check.total ?? check.roll + check.bonus + check.guidance;
  const { rollResult, roll, bonus, guidance, total, lightContext } = check;
  const dc = component.dc ?? 12;
  const success = total >= dc;
  const guidanceText = guidance ? ` + Guidance ${guidance}` : "";
  const checkLabel = resourceNodeCheckLabel(component);
  const disadvantageText = lightContext?.disadvantage ? " with disadvantage" : "";
  const lightNote = typeof lightContextNote === "function" ? lightContextNote(lightContext, "; ") : "";
  const checkText = `${hero.name} gathers from ${template.name}${disadvantageText}: ${checkLabel} ${roll} ${abilityLabel(bonus)}${guidanceText} = ${total} vs DC ${dc}${lightNote}.`;
  const entries = resourceNodeRewardEntries(component, total, rollResult);
  const granted = success ? addResourceNodeRewards(hero, entries) : [];
  const rewardText = granted.length ? ` Gained ${resourceNodeRewardsText(granted)}.` : " No usable resources recovered.";

  object.resourceNodeClaimed = true;
  object.spent = true;
  object.lastResult = `${checkText}${rewardText}`;
  recordD20OutcomeForFighter(hero, success);
  addLog(object.lastResult, success ? "important" : undefined);
  addAdminCheckLog({
    actor: hero,
    label: `${checkLabel} resource gathering`,
    target: template.name,
    rollResult,
    bonus,
    guidance,
    total,
    dc,
    success,
    note: [granted.length ? rewardText.trim() : "resource node spent", lightContext?.note].filter(Boolean).join("; "),
  });
  advanceDungeonTime(component.timeSeconds ?? component.durationSeconds ?? 900, `${hero.name} gathering from ${template.name}`, { force: true });

  render();
  showDungeonObjectInfo(object);
}

function investigateObject(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  const template = object ? objectTemplate(object.type) : null;
  if (!object || !objectCanInspect(object) || object.investigated || state.mode === "combat") return;
  if (!objectCells(object).some((cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1)) return;
  if (!activeStealthCheckInMonsterRoom(hero, `investigates ${template.name}`)) return;

  object.investigated = true;
  const inspectEvent = objectComponent(object, "inspectEvent");
  const hiddenLoot = objectComponent(object, "hiddenLoot") ?? objectComponent(object, "harvestableResource");
  const ambush = objectComponent(object, "ambushOnInspect");
  const inspectDc = inspectEvent?.dc ?? hiddenLoot?.dc ?? template.inspectDc ?? template.spotDc ?? 13;
  const inspectPosition = objectCells(object)[0] ?? object.position ?? hero.position;
  const check = typeof rollSkillCheck === "function"
    ? rollSkillCheck(hero, "int", "investigation", { sightBased: true, position: inspectPosition, guidance: true })
    : {
        rollResult: rollD20ForFighter(hero),
        roll: 0,
        bonus: skillCheckBonus(hero, "int", "investigation"),
        guidance: guidanceSkillBonus(),
        lightContext: null,
      };
  if (!check.roll) check.roll = check.rollResult.roll;
  check.total = check.total ?? check.roll + check.bonus + check.guidance;
  const { rollResult, roll, bonus, guidance, total, lightContext } = check;
  recordD20OutcomeForFighter(hero, total >= inspectDc);
  const guidanceText = guidance ? ` + Guidance ${guidance}` : "";
  const disadvantageText = lightContext?.disadvantage ? " with disadvantage" : "";
  const lightNote = typeof lightContextNote === "function" ? lightContextNote(lightContext, "; ") : "";
  const checkText = `${hero.name} investigates ${template.name}${disadvantageText}: INT ${roll} ${abilityLabel(bonus)}${guidanceText} = ${total} vs DC ${inspectDc}${lightNote}.`;
  object.lastResult = checkText;
  addLog(checkText, "important");
  addAdminCheckLog({ actor: hero, label: "Investigation check", target: template.name, rollResult, bonus, guidance, total, dc: inspectDc, success: total >= inspectDc, note: [inspectEvent ? "event: monster or loot" : hiddenLoot ? "hidden loot/resource possible" : ambush ? "ambush trigger possible" : "generic inspection", lightContext?.note].filter(Boolean).join("; ") });

  const ambushOnNaturalOne = ambush && (ambush.trigger === "natural1" || ambush.naturalOne);
  const ambushByChance = ambush && !ambushOnNaturalOne && Math.random() < (ambush.chance ?? 1);
  if (!inspectEvent && ((roll === 1 && (ambushOnNaturalOne || !ambush)) || ambushByChance)) {
    spawnInvestigationAmbush(object);
  } else if (total >= inspectDc && inspectEvent && Math.random() < (inspectEvent.chance ?? 1)) {
    resolveInspectEvent(hero, object, inspectEvent);
  } else if (total >= inspectDc && hiddenLoot && Math.random() < (hiddenLoot.chance ?? 1)) {
    if (!grantFeatureInspectionReward(hero, object, hiddenLoot)) {
      object.lastResult += " Found nothing out of the ordinary.";
      addLog(`${hero.name} finds nothing out of the ordinary.`);
    }
  } else if (total >= inspectDc && !hiddenLoot && Math.random() < 0.5) {
    if (Math.random() < 0.5) {
      const potion = createItemInstance("potion-healing", "found");
      if (potion) {
        addItemToInventory(hero, potion, "found-stack");
        object.lastResult += ` Found ${potion.name}.`;
        addLog(`${hero.name} finds ${potion.name}.`, "important");
      }
    } else {
      const coins = rollDie(10);
      addMoney(hero.inventory.money, coins);
      object.lastResult += ` Found ${moneyText(cpToMoney(coins))}.`;
      addLog(`${hero.name} finds ${moneyText(cpToMoney(coins))}.`, "important");
    }
  } else {
    object.lastResult += " Found nothing out of the ordinary.";
    addLog(`${hero.name} finds nothing out of the ordinary.`);
  }

  render();
  showDungeonObjectInfo(object);
}

function hideFighterInfo() {
  const wasHomeBuilderOpen = isHomeBuilderOpen();
  els.fighterInfo.classList.remove("home-builder-dock");
  els.fighterInfo.classList.add("hidden");
  if (wasHomeBuilderOpen) {
    homeBuildTool = null;
    homeMoveSelection = null;
    homePaintPointerId = null;
    render();
  }
}

function moneyText(money) {
  const totalCp = moneyToCp(money);
  if (totalCp === 0) return "0 gp";
  const parts = [];
  const normalized = normalizeMoney(money);
  if (normalized.gp) parts.push(`${normalized.gp} gp`);
  if (normalized.sp) parts.push(`${normalized.sp} sp`);
  if (normalized.cp) parts.push(`${normalized.cp} cp`);
  return parts.join(", ");
}

function priceText(cpAmount) {
  return moneyText(cpToMoney(cpAmount));
}

function statusEffectDetails(status = {}) {
  const parts = [];
  if (status.tempHp) parts.push(`${status.tempHp} temp HP`);
  if (status.acBonus) parts.push(`${abilityLabel(status.acBonus)} AC`);
  if (status.attackBonus) parts.push(`${abilityLabel(status.attackBonus)} to attack`);
  if (status.damageBonus) parts.push(`${abilityLabel(status.damageBonus)} damage`);
  if (status.saveBonus) parts.push(`${abilityLabel(status.saveBonus)} saves`);
  if (status.speedBonusFeet) parts.push(`${abilityLabel(status.speedBonusFeet)} ft speed`);
  if (status.speedMultiplier && status.speedMultiplier !== 1) parts.push(`speed x${status.speedMultiplier}`);
  if (status.speedOverrideFeet) parts.push(`speed at least ${status.speedOverrideFeet} ft`);
  if (status.flying) parts.push("flying");
  if (status.waterBreathing) parts.push("water breathing");
  if (status.swimSpeed) parts.push("swim movement");
  if (status.lightSource) {
    const source = status.lightSource;
    const bright = Number(source.brightRadiusFeet ?? source.brightFeet ?? 0) || 0;
    const dim = Number(source.dimRadiusFeet ?? source.dimFeet ?? 0) || 0;
    parts.push(`light ${bright}/${dim} ft`);
  }
  if (status.resistances?.length) parts.push(`resist ${status.resistances.join(", ")}`);
  if (status.vulnerabilities?.length) parts.push(`vulnerable ${status.vulnerabilities.join(", ")}`);
  for (const [ability, value] of Object.entries(status.abilityScoreMinimums ?? {})) parts.push(`${ability.toUpperCase()} at least ${value}`);
  if (status.potionBreath?.type) parts.push(`${status.potionBreath.uses ?? 0} ${status.potionBreath.type} breath uses`);
  return parts;
}

function statusDurationText(status = {}) {
  if (status.expiresAtHome) return "until home";
  if (status.expiresAtEndOfTurn) return "until end of turn";
  if (status.startsOnNextEncounter) return "next encounter";
  if (status.durationRounds) return `${status.durationRounds} rounds`;
  if (status.durationHours) return `${status.durationHours} hour${status.durationHours === 1 ? "" : "s"}`;
  if (status.durationMinutes) return `${status.durationMinutes} minute${status.durationMinutes === 1 ? "" : "s"}`;
  return "temporary";
}

function itemUseEffectText(item) {
  const use = item?.use;
  if (!use) return "";
  if (use.description) return use.description;
  if (use.kind === "spellScroll") {
    return `Cast ${item.scroll?.spellName ?? use.spellId ?? "the inscribed spell"} once from the scroll.`;
  }
  if (use.kind === "light" && use.status?.lightSource) {
    const source = use.status.lightSource;
    const bright = Number(source.brightRadiusFeet ?? source.brightFeet ?? 0) || 0;
    const dim = Number(source.dimRadiusFeet ?? source.dimFeet ?? 0) || 0;
    const duration = statusDurationText(use.status);
    const fuel = use.fuelItemName ? ` Consumes 1 ${use.fuelItemName} when lit.` : "";
    return `Toggle light: bright ${bright} ft${dim > bright ? `, dim to ${dim} ft` : ""}; ${duration}.${fuel}`;
  }
  if (use.kind === "healing" && use.dice) {
    const bonus = Number(use.bonus) || 0;
    return `Restore ${use.dice.count ?? 1}d${use.dice.sides ?? 1}${bonus ? ` + ${bonus}` : ""} HP.`;
  }
  if (use.status) {
    const parts = statusEffectDetails(use.status);
    const effect = parts.length ? parts.join("; ") : use.status.label ?? item.category ?? "temporary effect";
    return `${effect} for ${statusDurationText(use.status)}.`;
  }
  if (use.kind === "buff") {
    const status = itemStatusFromEffects(item, use.effects ?? item.magic?.effects ?? {}, use);
    const parts = statusEffectDetails(status);
    return `${parts.join("; ") || "Gain a temporary magic boon"} for ${statusDurationText(status)}.`;
  }
  if (use.kind === "weaponBuff") {
    const extra = use.extraDamage;
    return extra?.count && extra?.sides
      ? `Your next weapon hit deals +${extra.count}d${extra.sides} ${extra.type ?? "damage"}.`
      : "Your next weapon hit gains the listed magic rider.";
  }
  if (use.kind === "poison" && use.poison) {
    const poison = use.poison;
    const save = poison.saveDc ? `DC ${poison.saveDc} CON` : "CON save";
    if (poison.delivery === "injury") return `Coat a piercing or slashing weapon. The next hit subjects the target to ${save}.`;
    return `Expose a creature to this ${poison.delivery} poison (${save}).`;
  }
  if (use.kind === "instrumentPerformance") {
    const count = use.songs?.length ?? 0;
    return count ? `Play ${count} prepared ${toolName(use.requiredTool ?? use.instrument)} piece${count === 1 ? "" : "s"}.` : `No ${toolName(use.requiredTool ?? use.instrument)} pieces available yet.`;
  }
  return itemDisplayDescription(item);
}

function itemUseResourceText(item) {
  const resource = itemUseResource(item);
  if (resource === "reaction") return "Reaction";
  if (resource === "bonusAction" || resource === "weaponRider") return "Bonus action";
  return "Action";
}

function itemChargeText(item) {
  if (!item?.use?.charges) return "";
  return `charges ${item.use.charges.remaining ?? item.use.charges.max}/${item.use.charges.max}`;
}

function itemDetails(item) {
  if (!item) return "Empty";
  const cost = item.cost?.text ? `; ${item.cost.text}` : "";
  const weight = item.weightLb || item.weightLb === 0 ? `; ${item.weightLb} lb.` : "";
  const quantityText = item.stackable ? `x${Math.max(1, Math.floor(Number(item.quantity) || 1))}; ` : "";
  const magicText = item.magic ? magicItemDetails(item) : "";
  const chargeText = item.use?.charges ? `; charges ${item.use.charges.remaining ?? item.use.charges.max}/${item.use.charges.max} (${item.use.charges.refresh})` : "";
  const starterText = item.starterEquipment ? "; starter equipment, no resale value" : "";
  if (item.type === "weapon") {
    const ability = attackAbilityForWeapon(item, activeHero());
    const bonus = abilityMod(activeHero(), ability);
    const damage = formatDamage({ ...item.damage, bonus });
    const range = item.range ? `${item.range.kind}${item.range.feet ? ` ${item.range.feet} ft` : ""}` : "melee";
    const propertyText = item.properties?.length ? `; ${item.properties.join(", ")}` : "";
    const proficiencyText = missingProficiencyText(activeHero(), item);
    return `${damage}, ${range}${propertyText}${magicText}${cost}${weight}${starterText}${proficiencyText ? `; ${proficiencyText}` : ""}`;
  }
  if (item.type === "armor") {
    const ac = item.armor?.bonus ? `+${item.armor.bonus} AC` : `AC ${item.armor?.base ?? "?"}`;
    const req = item.requirements?.strength ? `; Str ${item.requirements.strength}` : "";
    const stealth = item.stealthDisadvantage ? "; stealth disadvantage" : "";
    const proficiencyText = missingProficiencyText(activeHero(), item);
    return `${ac}${req}${stealth}${magicText}${cost}${weight}${starterText}${proficiencyText ? `; ${proficiencyText}` : ""}`;
  }
  if (item.type === "ammunition") {
    return `${item.ammo?.quantity ?? 0} ${item.ammo?.kind ?? "ammo"}${cost}${weight}${starterText}`;
  }
  if (item.type === "consumable") {
    if (item.use?.kind === "spellScroll") {
      const level = item.scroll?.level ?? item.use?.castLevel ?? 0;
      const levelText = level === 0 ? "cantrip" : `level ${level}`;
      const classText = item.scroll?.classes?.length ? `; ${item.scroll.classes.join(", ")}` : "";
      return `${item.scroll?.spellName ?? item.use?.spellId ?? "Spell"} scroll; ${levelText}; ${itemUseResourceText(item).toLowerCase()}${classText}${cost}${weight}${starterText}`;
    }
    if (item.use?.kind === "fullHealing") {
      return `Full heal; ${item.use.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
    }
    if (item.use?.kind === "healing") {
      return `${item.use.dice.count}d${item.use.dice.sides} + ${item.use.bonus} HP; ${item.use.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
    }
    if (item.use?.kind === "light") {
      return `${quantityText}${itemUseEffectText(item)}; ${item.use?.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
    }
    if (item.use?.status) {
      const status = item.use.status;
      const parts = statusEffectDetails(status);
      const duration = statusDurationText(status);
      return `${parts.join("; ") || item.category || "Consumable"}; ${duration}; ${item.use?.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
    }
    if (item.use?.kind === "buff") {
      const status = itemStatusFromEffects(item, item.use.effects ?? item.magic?.effects ?? {}, item.use);
      const parts = statusEffectDetails(status);
      return `${parts.join("; ") || item.category || "Magic buff"}; ${statusDurationText(status)}; ${item.use?.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
    }
    if (item.use?.kind === "weaponBuff") {
      return `${itemUseEffectText(item)}; ${item.use?.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
    }
    return `${quantityText}${item.category ?? "Consumable"}; ${item.use?.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
  }
  if (item.type === "accessory") return `${magicText.replace(/^; /, "") || item.loot?.rarity || "magic"}${chargeText}${cost}${weight}${starterText}`;
  if (item.type === "tool") {
    const proficiency = item.use?.requiredTool ?? item.use?.instrument ?? item.id;
    const songText = item.use?.kind === "instrumentPerformance" ? `; ${(item.use.songs ?? []).length} piece${(item.use.songs ?? []).length === 1 ? "" : "s"}` : "";
    return `${toolName(proficiency)} tool${songText}${cost}${weight}${starterText}`;
  }
  if (item.type === "handout") return `Ancient Tome handout${cost}`;
  if (item.type === "treasure") return `${item.treasure?.kind ?? item.category ?? "treasure"}; value ${item.cost?.text ?? priceText(item.treasure?.valueCp ?? 0)}${weight}${starterText}`;
  return item.type ?? "Item";
}

function itemDisplayDescription(item) {
  if (!item) return "";
  const isCustomDungeonItem = item.customDungeonItem || /^custom-item-\d+/.test(String(item.baseItemId ?? item.itemId ?? item.id ?? ""));
  if (item.type === "handout" || item.handout) return item.handout?.text ?? item.customDescription ?? item.description ?? "";
  if (isCustomDungeonItem) return item.customDescription || item.description || item.magic?.description || item.treasure?.description || "";
  return item.magic?.description || item.treasure?.description || item.description || "";
}

function itemInventoryText(item) {
  const description = itemDisplayDescription(item);
  const starterWarning = item?.starterEquipment ? " Starter equipment has no resale value." : "";
  const proficiencyWarning = missingProficiencyText(activeHero(), item);
  if (!description) return itemDetails(item);
  const chargeText = item.use?.charges ? ` Charges ${item.use.charges.remaining ?? item.use.charges.max}/${item.use.charges.max} (${item.use.charges.refresh}).` : "";
  return `${description}${chargeText}${starterWarning}${proficiencyWarning ? ` ${proficiencyWarning}` : ""}`;
}

function itemInventoryMarkup(item) {
  const description = itemDisplayDescription(item);
  const starterWarning = item?.starterEquipment ? " Starter equipment has no resale value." : "";
  const proficiencyWarning = missingProficiencyText(activeHero(), item);
  if (!description) {
    const details = itemDetails(item);
    return `${escapeHtml(details)}${proficiencyWarning ? ` <span class="proficiency-warning">${escapeHtml(proficiencyWarning)}</span>` : ""}`;
  }
  const chargeText = item.use?.charges ? ` Charges ${item.use.charges.remaining ?? item.use.charges.max}/${item.use.charges.max} (${item.use.charges.refresh}).` : "";
  return `${escapeHtml(`${description}${chargeText}${starterWarning}`)}${proficiencyWarning ? ` <span class="proficiency-warning">${escapeHtml(proficiencyWarning)}</span>` : ""}`;
}

function showInventoryItemInfo(itemId) {
  const item =
    itemForId(activeHero(), itemId) ??
    chestItemForId(itemId) ??
    (state.chest ?? []).find((entry) => entry.id === itemId) ??
    getItemTemplate(itemId);
  if (!item) return;
  els.fighterInfoName.textContent = item.name;
  els.fighterInfoBody.innerHTML = `
    <div class="combatant-card">
      <p>${itemInventoryMarkup(item)}</p>
      <div class="stat-grid">
        <div class="stat-pill"><b>${escapeHtml(item.type ?? "item")}</b><span>Type</span></div>
        <div class="stat-pill"><b>${escapeHtml(item.category ?? item.magic?.kind ?? item.treasure?.kind ?? "-")}</b><span>Kind</span></div>
        <div class="stat-pill"><b>${escapeHtml(item.cost?.text ?? priceText(itemValueCp(item)))}</b><span>Value</span></div>
        <div class="stat-pill"><b>${escapeHtml(item.weightLb || item.weightLb === 0 ? `${item.weightLb} lb.` : "-")}</b><span>Weight</span></div>
      </div>
      <h3>Stats</h3>
      <p>${escapeHtml(itemDetails(item))}</p>
      ${
        item.tags?.length
          ? `<h3>Tags</h3><p>${escapeHtml(item.tags.join(", "))}</p>`
          : ""
      }
    </div>
  `;
  els.fighterInfo.classList.remove("hidden");
}

function magicItemDetails(item) {
  const magic = item.magic ?? {};
  const effects = magic.effects ?? {};
  const parts = [];
  if (magic.rarity) parts.push(magic.rarity);
  if (itemRequiresAttunement(item)) parts.push(fighterIsAttunedToItem(activeHero(), item) ? "attuned" : "requires attunement");
  if (magic.attackBonus) parts.push(`+${magic.attackBonus} to attack`);
  if (magic.damageBonus) parts.push(`+${magic.damageBonus} damage`);
  if (magic.properties?.length) parts.push(...magic.properties);
  if (effects.acBonus) parts.push(`+${effects.acBonus} AC`);
  if (effects.maxHpBonus) parts.push(`+${effects.maxHpBonus} max HP`);
  if (effects.speedBonusFeet) parts.push(`${abilityLabel(effects.speedBonusFeet)} ft speed`);
  if (effects.initiativeBonus) parts.push(`${abilityLabel(effects.initiativeBonus)} initiative`);
  for (const [ability, value] of Object.entries(effects.abilityScoreBonuses ?? {})) parts.push(`${ability.toUpperCase()} ${abilityLabel(value)}`);
  for (const [ability, value] of Object.entries(effects.abilityScorePenalties ?? {})) parts.push(`${ability.toUpperCase()} ${abilityLabel(value)}`);
  const resistances = [...(effects.resistances ?? []), ...(magic.resistances ?? [])];
  const vulnerabilities = [...(effects.vulnerabilities ?? []), ...(magic.vulnerabilities ?? [])];
  const immunities = [...(effects.immunities ?? []), ...(magic.immunities ?? [])];
  if (resistances.length) parts.push(`resist ${resistances.join(", ")}`);
  if (immunities.length) parts.push(`immune ${immunities.join(", ")}`);
  if (vulnerabilities.length) parts.push(`vulnerable ${vulnerabilities.join(", ")}`);
  const extraDamage = [...(effects.extraDamage ?? []), ...(magic.extraDamage ?? [])];
  if (extraDamage.length) parts.push(`extra ${extraDamage.map((entry) => `${entry.count}d${entry.sides} ${entry.type}`).join(", ")}`);
  const itemCurses = item.curses ?? magic.curses ?? [];
  if (itemCurses.length) parts.push(`cursed: ${itemCurses.map((entry) => window.DungeonAfflictions?.curses?.[entry.id ?? entry]?.name ?? entry.id ?? entry).join(", ")}`);
  else if (magic.curse || effects.vulnerabilities?.length) parts.push("cursed");
  return parts.length ? `; ${parts.join("; ")}` : "";
}

function itemCategoryLabel(item) {
  const type = item.type ? item.type[0].toUpperCase() + item.type.slice(1) : "Item";
  return item.category ? `${type} - ${item.category}` : type;
}

function searchableItemText(item) {
  return [
    item.name,
    item.type,
    item.category,
    item.weaponRange,
    item.ammo?.kind,
    item.armor?.base,
    item.armor?.bonus,
    item.magic?.rarity,
    item.loot?.rarity,
    item.treasure?.kind,
    item.treasure?.valueGp,
    ...(item.properties ?? []),
    ...(item.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function adminCatalogItems() {
  const query = inventoryAdminSearch.trim().toLowerCase();
  return window.DungeonContent.list("items")
    .filter((item) => !query || searchableItemText(item).includes(query))
    .sort((a, b) => itemCategoryLabel(a).localeCompare(itemCategoryLabel(b)) || a.name.localeCompare(b.name));
}

function searchableMonsterText(monster) {
  return [
    monster.id,
    monster.name,
    monster.role,
    monster.behavior,
    monster.category,
    monster.cat,
    ...(monster.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function adminCatalogMonsters() {
  const query = adminMonsterSearch.trim().toLowerCase();
  return window.DungeonContent
    .list("monsters")
    .filter((monster) => !query || searchableMonsterText(monster).includes(query))
    .sort((a, b) => monsterCategory(a) - monsterCategory(b) || a.name.localeCompare(b.name));
}

function renderAdminMonsterCatalog() {
  const monsters = adminCatalogMonsters();
  return `
    <section class="admin-catalog admin-monster-catalog" aria-label="Admin monster catalogue">
      <div class="admin-catalog-top">
        <label for="admin-monster-search">Spawn Monster</label>
        <button class="admin-toggle ${adminMonsterCatalogOpen ? "active" : ""}" type="button" data-action="toggle-admin-monsters">
          ${adminMonsterCatalogOpen ? "Hide" : "Show"}
        </button>
      </div>
      ${
        adminMonsterCatalogOpen
          ? `
            <input id="admin-monster-search" type="search" placeholder="Search monsters" value="${escapeAttribute(adminMonsterSearch)}" />
            <div class="admin-monster-grid">
              ${
                monsters.length
                  ? monsters
                      .map(
                        (monster) => `
                          <button type="button" data-action="spawn-admin-monster" data-monster="${escapeAttribute(monster.id)}">
                            <b>${escapeHtml(monster.name)}</b>
                            <span>Cat ${monsterCategory(monster)} - ${escapeHtml(monster.role ?? monster.behavior ?? "monster")}</span>
                          </button>
                        `,
                      )
                      .join("")
                  : `<p class="empty-note">No matching monsters.</p>`
              }
            </div>
          `
          : `<p class="empty-note">Monster catalog hidden.</p>`
      }
    </section>
  `;
}

function renderAdminProgressCatalog(options = {}) {
  const forceOpen = Boolean(options.forceOpen);
  const showToggle = options.showToggle !== false;
  const progressOpen = forceOpen || adminProgressOpen;
  const entries = [
    ...adminCampaignProgressEntries(),
    ...npcAdminProgressEntries(),
  ];
  const groups = new Map();
  for (const entry of entries) {
    const groupId = entry.groupId ?? entry.campaignId ?? entry.npcId ?? "general";
    if (!groups.has(groupId)) {
      groups.set(groupId, {
        id: groupId,
        label: entry.groupLabel ?? entry.campaignName ?? entry.npcName ?? entry.npcId ?? "Progress",
        entries: [],
      });
    }
    groups.get(groupId).entries.push(entry);
  }
  const groupMarkup = Array.from(groups.values())
    .map(
      (group) => `
        <details class="admin-progress-group" ${group.entries.some((entry) => entry.active) ? "open" : ""}>
          <summary>${escapeHtml(group.label)} <span>${group.entries.length}</span></summary>
          <div class="admin-progress-grid">
            ${group.entries
              .map(
                (entry) => `
                  <button type="button" class="${entry.active ? "active" : ""}" data-action="${escapeAttribute(entry.action ?? "set-admin-progress")}" ${entry.npcId ? `data-npc="${escapeAttribute(entry.npcId)}"` : ""} ${entry.campaignId ? `data-campaign="${escapeAttribute(entry.campaignId)}"` : ""} data-progress="${escapeAttribute(entry.id)}">
                    <b>${escapeHtml(entry.label)}</b>
                    <span>${escapeHtml(entry.description ?? "")}</span>
                  </button>
                `,
              )
              .join("")}
          </div>
        </details>
      `,
    )
    .join("");
  return `
    <section class="admin-catalog admin-progress-catalog" aria-label="Admin progress controls">
      <div class="admin-catalog-top">
        <label>Progress</label>
        ${
          showToggle
            ? `<button class="admin-toggle ${progressOpen ? "active" : ""}" type="button" data-action="toggle-admin-progress">
                ${progressOpen ? "Hide" : "Show"}
              </button>`
            : ""
        }
      </div>
      ${
        progressOpen
          ? groupMarkup
            ? groupMarkup
            : `<p class="empty-note">No progress controls registered.</p>`
          : `<p class="empty-note">Progress controls hidden.</p>`
      }
    </section>
  `;
}

function renderAdminItemCatalog() {
  if (!adminEnabled() || !inventoryAdminOpen) return "";

  const items = adminCatalogItems();
  const groups = new Map();
  for (const item of items) {
    const category = itemCategoryLabel(item);
    if (!groups.has(category)) groups.set(category, []);
    groups.get(category).push(item);
  }

  const groupMarkup = Array.from(groups.entries())
    .map(
      ([category, groupItems]) => `
        <details class="admin-item-group" open>
          <summary>${escapeHtml(category)} <span>${groupItems.length}</span></summary>
          <div class="admin-item-grid">
            ${groupItems
              .map(
                (item) => `
                  <div class="admin-item-card">
                    ${draggableItemCard(item, "admin")}
                    <button type="button" data-action="add-admin-item" data-item="${item.id}">Add to Bag</button>
                  </div>
                `,
              )
              .join("")}
          </div>
        </details>
      `,
    )
    .join("");

  return `
    <section class="admin-catalog" data-drop-admin-trash="true" aria-label="Admin item catalogue">
      <div class="admin-catalog-top">
        <label for="admin-item-search">Item Vault</label>
        <input id="admin-item-search" type="search" placeholder="Search items" value="${escapeAttribute(inventoryAdminSearch)}" />
      </div>
      <div class="admin-coin-row" aria-label="Admin coins">
        <button type="button" data-action="add-admin-coins" data-cp="100">+1 gp</button>
        <button type="button" data-action="add-admin-coins" data-cp="1000">+10 gp</button>
        <button type="button" data-action="add-admin-coins" data-cp="10000">+100 gp</button>
        <button type="button" data-action="add-admin-coins" data-cp="100000">+1000 gp</button>
      </div>
      <div class="admin-coin-row" aria-label="Admin experience">
        <button type="button" data-action="add-admin-xp" data-xp="50">+50 XP</button>
        <button type="button" data-action="add-admin-xp" data-xp="300">+300 XP</button>
        <button type="button" data-action="add-admin-xp" data-xp="1000">+1000 XP</button>
      </div>
      <div class="admin-trash">Drop carried or equipped items here to delete them.</div>
      ${groupMarkup || `<p class="empty-note">No matching items.</p>`}
    </section>
  `;
}

function addAdminCoins(cpAmount) {
  addMoney(activeHero().inventory.money, cpAmount);
  addLog(`Added ${moneyText(cpToMoney(cpAmount))}.`, "important");
  render();
  renderInventoryMenu();
}

function addAdminXp(xpAmount) {
  const hero = activeHero();
  hero.xp = (hero.xp ?? 0) + xpAmount;
  addLog(`Added ${xpAmount} XP to ${hero.name}.`, "important");
  render();
  renderInventoryMenu();
}

function freeAdminSpawnPosition(footprintSource = null) {
  const hero = activeHero();
  const room = roomForPosition(hero.position);
  const visibleCells = Array.from(visibleWalkable()).map(positionFromKey);
  const blockedKeys = new Set([
    ...blockingObjectKeys(),
    ...Object.values(state.fighters)
      .filter((fighter) => fighter.alive)
      .flatMap((fighter) => window.DungeonGrid.fighterCells(fighter).map(positionKey)),
  ]);
  const candidates = room ? roomSpawnCells(room, blockedKeys, currentGridSize(), spawnFloorKeysForDungeon(), footprintSource) : visibleCells;
  const currentKey = positionKey(hero.position);

  return candidates
    .slice()
    .sort((a, b) => distance(a, hero.position) - distance(b, hero.position))
    .find(
    (position) =>
      window.DungeonGrid.isInsideGrid(position, currentGridSize()) &&
      currentWalkable().has(positionKey(position)) &&
      positionKey(position) !== currentKey &&
      isKnownTile(position) &&
      window.DungeonGrid.fighterCells(footprintSource ?? {}, position).every((cell) =>
        currentWalkable().has(positionKey(cell)) &&
          isKnownTile(cell) &&
          !window.DungeonGrid.isOccupied(cell, state.fighters),
      ),
  );
}

function addMonsterToInitiative(monster) {
  const currentActiveId = activeFighter()?.id;
  const roll = rollDie(20);
  state.initiative.push({
    fighterId: monster.id,
    roll,
    total: roll + monster.initiativeBonus,
  });
  state.initiative.sort((a, b) => b.total - a.total || (isPartyHeroId(a.fighterId) ? -1 : 1));
  state.activeIndex = Math.max(0, state.initiative.findIndex((entry) => entry.fighterId === currentActiveId));
}

function spawnAdminMonster(monsterId) {
  if (!adminEnabled()) return;
  const template = getMonsterTemplate(monsterId);
  const position = template ? freeAdminSpawnPosition(template) : null;
  if (!template || !position) {
    addLog("Admin: no open space for that monster.", "important");
    render();
    renderInventoryMenu();
    return;
  }

  const spawnRoom = roomForPosition(position);
  const hero = activeHero();
  const spawnCount = template.behavior === "swarm" && spawnRoom ? swarmSpawnCount(template, hero) : 1;
  const blockedKeys = new Set([
    ...blockingObjectKeys(),
    ...Object.values(state.fighters)
      .filter((fighter) => fighter.alive)
      .flatMap((fighter) => window.DungeonGrid.fighterCells(fighter).map(positionKey)),
  ]);
  const spawned = [];
  for (let index = 0; index < spawnCount; index += 1) {
    const spawnPosition = spawnRoom
      ? safeRoomSpawnCell(spawnRoom, hero.position, blockedKeys, currentGridSize(), spawnFloorKeysForDungeon(), template)
      : position;
    if (!spawnPosition) continue;
    adminItemInstanceCounter += 1;
    const monster = createCombatant({
      ...template,
      id: `admin-monster-${template.id}-${Date.now()}-${adminItemInstanceCounter}`,
      name: `${template.name}${spawnCount > 1 ? ` ${index + 1}` : ""} (Admin)`,
      position: spawnPosition,
    });
    applyMonsterCategoryScaling(monster, hero);
    monster.roomId = roomForPosition(spawnPosition)?.id ?? "admin-spawn";
    state.fighters[monster.id] = monster;
    window.DungeonGrid.fighterCells(monster).forEach((cell) => blockedKeys.add(positionKey(cell)));
    spawned.push(monster);
  }
  if (spawned.length === 0) {
    addLog("Admin: no open room floor for that monster.", "important");
    render();
    renderInventoryMenu();
    return;
  }
  addLog(`Admin spawned ${spawned.length} ${template.name}${spawned.length === 1 ? "" : "s"}. Roll initiative before the character acts.`, "important");

  if (state.mode === "combat" && state.combatStarted) {
    spawned.forEach(addMonsterToInitiative);
  } else {
    state.combatStarted = false;
    state.mode = "exploration";
    state.initiative = [];
    state.activeIndex = 0;
  }

  render();
  renderInventoryMenu();
}

function adminRevealCurrentRoom() {
  const heroRoom = roomForPosition(activeHero().position);
  if (!heroRoom) return;
  const discovered = new Set(state.exploration?.discoveredRoomIds ?? []);
  discovered.add(heroRoom.id);
  state.exploration.discoveredRoomIds = Array.from(discovered);
  addLog(`Admin revealed ${heroRoom.name}.`, "important");
  render();
  renderInventoryMenu();
}

function adminFullHeal() {
  const hero = activeHero();
  hero.hp = hero.maxHp;
  hero.alive = true;
  addLog("Admin restored the character to full HP.", "important");
  render();
  renderInventoryMenu();
}

function adminRefreshActions() {
  resetTurnResources(activeHero());
  addLog("Admin refreshed movement, action, and bonus action.", "important");
  render();
  renderInventoryMenu();
}

function adminClearCombat() {
  state.combatStarted = false;
  state.initiative = [];
  state.activeIndex = 0;
  if (state.mode === "combat") state.mode = "exploration";
  partyHeroes().forEach(resetTurnResources);
  addLog("Admin cleared turn order.", "important");
  render();
  renderInventoryMenu();
}

function adminOpenVisibleDoors() {
  if (!adminEnabled()) return;
  const visibleKeys = activeTileKeys();
  const doors = (state.dungeon?.doors ?? []).filter((door) => {
    const doorKey = positionKey(door);
    return doorIsVisibleToPlayers(door) && visibleKeys.has(doorKey) && isKnownTile(door) && !sharedDoorPassagesAreOpen(door);
  });
  const uniqueDoors = Array.from(new Map(doors.map((door) => [`${door.roomId}:${positionKey(door)}`, door])).values());
  let opened = 0;
  for (const door of uniqueDoors) {
    if (openDoor(door)) opened += 1;
  }
  addLog(`Admin opened ${opened} visible door${opened === 1 ? "" : "s"}.`, "important");
  render();
  renderInventoryMenu();
}

function adminCollectVisibleLoot() {
  if (!adminEnabled()) return;
  const hero = activeHero();
  if (!hero || !canFighterReceiveInventory(hero)) return;
  const visibleKeys = activeTileKeys();
  const visiblePiles = (state.lootPiles ?? []).filter((pile) => visibleKeys.has(positionKey(pile.position)) && isKnownTile(pile.position));
  let collected = 0;
  for (const pile of [...visiblePiles]) {
    if (collectLootAtPosition(hero, pile.position)) collected += 1;
  }
  addLog(`Admin collected ${collected} visible loot pile${collected === 1 ? "" : "s"}.`, "important");
  render();
  renderInventoryMenu();
}

function createAdminInventoryItem(templateId) {
  return createItemInstance(templateId, "admin");
}

function addAdminItemToInventory(templateId) {
  const hero = activeHero();
  const item = createAdminInventoryItem(templateId);
  if (!item) return;

  addItemToInventory(hero, item, "admin-stack");
  addLog(`Added ${item.name} to inventory.`, "important");
  logTomeStorageForItem(item);
  render();
  renderInventoryMenu();
}

function addAdminItemToSlot(templateId, slotId) {
  const hero = activeHero();
  const item = createAdminInventoryItem(templateId);
  if (!item || !itemCanEquipInSlot(hero, item, slotId)) return;

  const addedItems = addItemToInventory(hero, item, "admin-stack");
  addLog(`Added ${item.name} to ${equipmentSlots.find((slot) => slot.id === slotId)?.label ?? "equipment"}.`, "important");
  equipItem(addedItems[0]?.id ?? item.id, slotId);
}

function equipActionForItem(fighter, item) {
  const usableSlots = equipmentSlots.filter((slot) => itemCanUseSlot(item, slot.id));
  if (!usableSlots.length) return "";

  return usableSlots
    .map((slot) => {
      const occupied = Boolean(fighter.equipment?.[slot.id]);
      const disabledReason =
        item.type === "armor" && !armorStrengthRequirementMet(fighter, item)
          ? `Requires STR ${item.requirements.strength}`
          : item.type === "armor" && !heroHasArmorProficiency(fighter, item)
            ? "Missing proficiency"
          : "";
      return disabledReason
        ? `<button type="button" disabled>${disabledReason}</button>`
        : `<button type="button" class="equip-slot-button ${occupied ? "occupied-slot" : "empty-slot"}" data-action="equip" data-item="${item.id}" data-slot="${slot.id}" title="${occupied ? `Replace ${equippedItem(fighter, slot.id)?.name ?? "equipped item"}` : "Empty slot"}">${slot.label}</button>`;
    })
    .join("");
}

function removeInventoryItem(itemId) {
  const hero = activeHero();
  const item = itemForId(hero, itemId);
  if (!item) return;

  for (const slot of equipmentSlots) {
    if (hero.equipment[slot.id] === itemId) {
      hero.equipment[slot.id] = null;
    }
  }
  hero.inventory.items = hero.inventory.items.filter((entry) => entry.id !== itemId);
  addLog(`Deleted ${item.name} from inventory.`, "important");
  refreshDerivedStats(hero);
  render();
  renderInventoryMenu();
}

function moveInventoryItemToChest(itemId) {
  moveInventoryItemToHomeStorage(itemId, "home-chest");
}

function moveChestItemToInventory(itemId) {
  moveHomeStorageItemToInventory("home-chest", itemId);
}

function moveInventoryItemToHomeStorage(itemId, objectId = "home-chest") {
  if (state.mode !== "home") return;
  const storage = homeStorageObjectForId(objectId);
  const hero = activeHero();
  const item = itemForId(hero, itemId);
  if (!storage || !item) return;

  for (const slot of equipmentSlots) {
    if (hero.equipment[slot.id] === itemId) {
      hero.equipment[slot.id] = null;
    }
  }
  hero.inventory.items = hero.inventory.items.filter((entry) => entry.id !== itemId);
  if (objectId === "home-chest") {
    state.chest = [...(state.chest ?? []), item];
  } else {
    storage.items = [...(storage.items ?? []), item];
    syncHomeLayoutToDungeon();
  }
  refreshDerivedStats(hero);
  render();
  renderInventoryMenu();
}

function moveHomeStorageItemToInventory(objectId = "home-chest", itemId) {
  if (state.mode !== "home") return;
  const storage = homeStorageObjectForId(objectId);
  const item = objectId === "home-chest" ? chestItemForId(itemId) : (storage?.items ?? []).find((entry) => entry.id === itemId);
  if (!item) return;

  if (objectId === "home-chest") {
    state.chest = (state.chest ?? []).filter((entry) => entry.id !== itemId);
  } else {
    storage.items = (storage.items ?? []).filter((entry) => entry.id !== itemId);
    syncHomeLayoutToDungeon();
  }
  addItemToInventory(activeHero(), item, "storage-stack");
  render();
  renderInventoryMenu();
}

function moveMoneyBetweenHeroAndChest(direction, cpAmount) {
  if (state.mode !== "home" || cpAmount <= 0) return;
  const heroMoney = activeHero().inventory.money;
  state.chestMoney = normalizeMoney(state.chestMoney ?? {});
  const from = direction === "deposit" ? heroMoney : state.chestMoney;
  const to = direction === "deposit" ? state.chestMoney : heroMoney;
  if (!spendMoney(from, cpAmount)) return;
  addMoney(to, cpAmount);
  addLog(`${direction === "deposit" ? "Stored" : "Withdrew"} ${moneyText(cpToMoney(cpAmount))}.`, "important");
  render();
  renderInventoryMenu();
}

function readChestCoinTransferAmount() {
  const values = { cp: 0, sp: 0, gp: 0 };
  for (const unit of Object.keys(values)) {
    const input = els.inventoryMenu.querySelector(`[data-coin-input="${unit}"]`);
    const rawValue = input?.value.trim() ?? "0";
    const value = rawValue === "" ? 0 : Number(rawValue);
    if (!Number.isInteger(value) || value < 0) {
      return { error: "Use whole coin amounts of 0 or more." };
    }
    values[unit] = value;
  }

  const cpAmount = moneyToCp(values);
  if (cpAmount <= 0) return { error: "Enter at least one coin to transfer." };
  return { cpAmount };
}

function showChestMoneyError(message) {
  const error = els.inventoryMenu.querySelector(".chest-money-error");
  if (error) error.textContent = message;
}

function moveCustomMoneyBetweenHeroAndChest(direction) {
  const result = readChestCoinTransferAmount();
  if (result.error) {
    showChestMoneyError(result.error);
    return;
  }

  const available = direction === "deposit" ? activeHero().inventory.money : state.chestMoney;
  if (moneyToCp(available) < result.cpAmount) {
    showChestMoneyError(direction === "deposit" ? "You do not have that many carried coins." : "The chest does not hold that many coins.");
    return;
  }

  moveMoneyBetweenHeroAndChest(direction, result.cpAmount);
}

function readHomeChestCoinTransferAmount() {
  const values = { cp: 0, sp: 0, gp: 0 };
  for (const unit of Object.keys(values)) {
    const input = els.fighterInfo.querySelector(`[data-home-coin-input="${unit}"]`);
    const rawValue = input?.value.trim() ?? "0";
    const value = rawValue === "" ? 0 : Number(rawValue);
    if (!Number.isInteger(value) || value < 0) {
      return { error: "Use whole coin amounts of 0 or more." };
    }
    values[unit] = value;
  }

  const cpAmount = moneyToCp(values);
  if (cpAmount <= 0) return { error: "Enter at least one coin to transfer." };
  return { cpAmount };
}

function showHomeChestMoneyError(message) {
  const error = els.fighterInfo.querySelector(".chest-money-error");
  if (error) error.textContent = message;
}

function moveCustomMoneyFromHomeChestPanel(direction) {
  const result = readHomeChestCoinTransferAmount();
  if (result.error) {
    showHomeChestMoneyError(result.error);
    return;
  }

  const available = direction === "deposit" ? activeHero().inventory.money : state.chestMoney;
  if (moneyToCp(available) < result.cpAmount) {
    showHomeChestMoneyError(direction === "deposit" ? "You do not have that many carried coins." : "The chest does not hold that many coins.");
    return;
  }

  moveMoneyBetweenHeroAndChest(direction, result.cpAmount);
  showHomeChestInfo();
}

function slotLayoutClass(slotId) {
  const classes = {
    head: "slot-head",
    cloak: "slot-cloak",
    amulet: "slot-amulet",
    mainHand: "slot-main-hand",
    torso: "slot-torso",
    offHand: "slot-off-hand",
    bracers: "slot-bracers",
    gauntlets: "slot-gauntlets",
    ring1: "slot-ring-one",
    ring2: "slot-ring-two",
    boots: "slot-boots",
    quiver: "slot-quiver",
    belt1: "slot-belt-one",
    belt2: "slot-belt-two",
    belt3: "slot-belt-three",
    belt4: "slot-belt-four",
    belt5: "slot-belt-five",
  };
  return classes[slotId] ?? "";
}

function slotIconName(slotId) {
  const icons = {
    head: "slot-armor",
    cloak: "slot-cloak",
    amulet: "slot-amulet",
    mainHand: "slot-weapon",
    torso: "slot-torso",
    offHand: "slot-weapon",
    bracers: "slot-bracers",
    gauntlets: "slot-gauntlets",
    ring1: "slot-ring",
    ring2: "slot-ring",
    boots: "slot-boots",
    quiver: "slot-bow",
    belt1: "slot-pack",
    belt2: "slot-pack",
    belt3: "slot-pack",
    belt4: "slot-pack",
    belt5: "slot-pack",
  };
  return icons[slotId] ?? "slot-pack";
}

function draggableItemCard(item, source = "") {
  if (!item) return `<span class="equipment-empty">Drop item</span>`;

  return `
    <div class="equipment-item" draggable="true" data-drag-item="${item.id}" data-drag-source="${source}">
      <b>${escapeHtml(item.name)}</b>
      <span>${itemInventoryMarkup(item)}</span>
      <button type="button" data-action="inspect-item" data-item="${escapeAttribute(item.id)}">Inspect</button>
    </div>
  `;
}

function carriedItemUseDisabledReason(fighter, item) {
  if (state.mode === "combat") return "Use from the action menu in combat.";
  if (item?.use?.kind === "instrumentPerformance") {
    const requiredTool = item.use.requiredTool ?? item.use.instrument;
    if (!heroHasToolProficiency(fighter, requiredTool)) return `Requires ${toolName(requiredTool)} proficiency.`;
    if (!(item.use.songs ?? []).length) return `No ${toolName(requiredTool)} pieces are available yet.`;
  }
  return canUseBeltItem(fighter, item) ? "" : "Cannot use right now.";
}

function carriedConsumableUseButton(fighter, item) {
  const carriedUse = state.mode !== "combat" && (item?.type === "consumable" || item?.use?.kind === "instrumentPerformance");
  if (!carriedUse) return "";
  const disabledReason = carriedItemUseDisabledReason(fighter, item);
  return `<button type="button" class="small-action-button" data-action="use-carried-consumable" data-item="${escapeAttribute(item.id)}" ${
    disabledReason ? "disabled" : ""
  } title="${escapeAttribute(disabledReason)}">Use</button>`;
}

let shortRestAttunementWindowOpen = false;

function canChangeAttunementNow() {
  return state.mode === "home" || shortRestAttunementWindowOpen;
}

function attunementCount(fighter) {
  return attunedItemIds(fighter).length;
}

function attunementStatusText(fighter, item) {
  if (!itemRequiresAttunement(item)) return "";
  return fighterIsAttunedToItem(fighter, item) ? "Attuned" : "Requires attunement";
}

function attunementActionForItem(fighter, item, options = {}) {
  if (!itemRequiresAttunement(item)) return "";
  const isAttuned = fighterIsAttunedToItem(fighter, item);
  const count = attunementCount(fighter);
  const atLimit = !isAttuned && count >= attunementLimit;
  const allowed = canChangeAttunementNow() && !atLimit;
  const reason = atLimit ? `Attunement limit ${attunementLimit}/${attunementLimit}` : state.mode === "home" ? "" : "Available during a short rest";
  const action = isAttuned ? "unattune-item" : "attune-item";
  const actionAttributes = options.rest
    ? `data-rest-action="${escapeAttribute(action)}" data-hero="${escapeAttribute(fighter.id)}"`
    : `data-action="${escapeAttribute(action)}"`;
  return `
    <span class="attunement-status">${escapeHtml(attunementStatusText(fighter, item))}</span>
    <button type="button" class="small-action-button" ${actionAttributes} data-item="${escapeAttribute(item.id)}" ${allowed ? "" : "disabled"} title="${escapeAttribute(reason)}">
      ${isAttuned ? "Unattune" : "Attune"}
    </button>
  `;
}

function attunementSummaryMarkup(fighter) {
  normalizeAttunementState(fighter);
  return `<div class="stat-pill"><b>${attunementCount(fighter)}/${attunementLimit}</b><span>Attuned</span></div>`;
}

function changeItemAttunement(fighter, itemId, shouldAttune, options = {}) {
  if (!fighter || !canFighterReceiveInventory(fighter)) return false;
  normalizeAttunementState(fighter);
  if (!options.force && !canChangeAttunementNow()) {
    addLog("Attunement can be changed at home or during a short rest.", "important");
    renderLog();
    return false;
  }
  const item = itemForId(fighter, itemId);
  if (!item || !itemRequiresAttunement(item)) return false;
  const ids = new Set(attunedItemIds(fighter));
  if (shouldAttune) {
    if (ids.has(item.id)) return false;
    if (ids.size >= attunementLimit) {
      addLog(`${fighter.name} already has ${attunementLimit} attuned items.`, "important");
      renderLog();
      return false;
    }
    ids.add(item.id);
    addLog(`${fighter.name} attunes to ${item.name}.`, "important");
  } else {
    if (!ids.has(item.id)) return false;
    if (typeof itemHasBindingCurse === "function" && itemHasBindingCurse(item)) {
      addLog(`${item.name} refuses to release its attunement. Remove Curse can break the binding.`, "important");
      renderLog();
      return false;
    }
    ids.delete(item.id);
    addLog(`${fighter.name} ends attunement to ${item.name}.`, "important");
  }
  fighter.attunement = { ...(fighter.attunement ?? {}), itemIds: Array.from(ids).slice(0, attunementLimit) };
  refreshDerivedStats(fighter);
  render();
  renderInventoryMenu();
  return true;
}

function inventoryCategoryForItem(item) {
  const type = item?.type ?? "";
  if (type === "weapon") return { id: "weapons", label: "Weapons", order: 10 };
  if (type === "armor") return { id: "armor", label: "Armor", order: 20 };
  if (type === "accessory") return { id: "accessories", label: "Accessories", order: 30 };
  if (type === "consumable") return { id: "consumables", label: "Consumables", order: 40 };
  if (type === "component") return { id: "materials", label: "Materials", order: 50 };
  if (item?.category) return { id: `category-${String(item.category).toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, label: item.category, order: 60 };
  return { id: "gear", label: "Gear", order: 90 };
}

function renderCarriedInventoryItem(fighter, item) {
  return `
    <div class="inventory-item">
      ${draggableItemCard(item, "inventory")}
      <div class="equip-actions">
        ${carriedConsumableUseButton(fighter, item)}
        ${attunementActionForItem(fighter, item)}
        ${equipActionForItem(fighter, item)}
        ${transferControlsForItem(fighter, item)}
      </div>
    </div>
  `;
}

function renderChestInventoryItem(item) {
  return `
    <div class="inventory-item">
      ${draggableItemCard(item, "chest")}
    </div>
  `;
}

let openInventoryItemGroups = null;

function inventoryItemGroupOpen(groupId, defaultOpen = false) {
  return openInventoryItemGroups ? openInventoryItemGroups.has(groupId) : defaultOpen;
}

function rememberOpenInventoryItemGroups() {
  if (!els.inventoryMenu || els.inventoryMenu.classList.contains("hidden")) return;
  const groups = Array.from(els.inventoryMenu.querySelectorAll("details[data-inventory-item-group]"));
  if (!groups.length) return;
  openInventoryItemGroups = new Set(groups.filter((details) => details.open).map((details) => details.dataset.inventoryItemGroup));
}

function groupedInventoryItemsMarkup(items, { emptyText, renderItem }) {
  if (!items.length) return `<p class="empty-note">${escapeHtml(emptyText)}</p>`;
  const groups = new Map();
  for (const item of items) {
    const category = inventoryCategoryForItem(item);
    if (!groups.has(category.id)) groups.set(category.id, { ...category, items: [] });
    groups.get(category.id).items.push(item);
  }
  return Array.from(groups.values())
    .sort((a, b) => a.order - b.order || a.label.localeCompare(b.label))
    .map((group, index) => {
      const sortedItems = [...group.items].sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
      return `
        <details class="inventory-item-group" data-inventory-item-group="${escapeAttribute(group.id)}" ${inventoryItemGroupOpen(group.id, index === 0) ? "open" : ""}>
          <summary>${escapeHtml(group.label)} <span>${sortedItems.length}</span></summary>
          <div class="inventory-item-group-body">
            ${sortedItems.map((item) => renderItem(item)).join("")}
          </div>
        </details>
      `;
    })
    .join("");
}

let activeInventoryTab = "equipment";

function inventoryTabs() {
  return [
    { id: "equipment", label: "Equipment" },
    { id: "items", label: "Items" },
    ...(state.mode === "home" ? [{ id: "chest", label: "Chest" }] : []),
    ...(adminEnabled() && inventoryAdminOpen ? [{ id: "vault", label: "Vault" }] : []),
    { id: "materials", label: "Materials" },
  ];
}

function normalizeInventoryTab(tabId) {
  const tabs = inventoryTabs();
  return tabs.some((tab) => tab.id === tabId) ? tabId : tabs[0]?.id ?? "equipment";
}

function inventoryTabsMarkup(activeTab) {
  return `
    <div class="inventory-tabs" role="tablist" aria-label="Inventory sections">
      ${inventoryTabs()
        .map(
          (tab) => `
            <button type="button" role="tab" data-action="inventory-tab" data-inventory-tab="${tab.id}" aria-selected="${tab.id === activeTab ? "true" : "false"}" class="${
              tab.id === activeTab ? "active" : ""
            }">
              ${escapeHtml(tab.label)}
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function setInventoryTab(tabId) {
  activeInventoryTab = normalizeInventoryTab(tabId);
  if (activeInventoryTab === "materials") questSatchelOpen = true;
  renderInventoryMenu();
}

function renderInventoryMenu() {
  rememberOpenInventoryItemGroups();
  const fighter = activeHero();
  refreshDerivedStats(fighter);
  const equippedIds = new Set(Object.values(fighter.equipment).filter(Boolean));
  const carriedItems = fighter.inventory.items.filter((item) => !equippedIds.has(item.id));
  const equippedWeapon = equippedItem(fighter, "mainHand");
  const consumableCount = fighter.inventory.items.filter((item) => item?.type === "consumable").length;
  const chestItems = state.chest ?? [];
  const chestMoney = normalizeMoney(state.chestMoney ?? {});
  activeInventoryTab = normalizeInventoryTab(activeInventoryTab);

  const equipmentMarkup = `
    <section class="paper-doll" aria-label="Equipment slots">
      ${equipmentSlots
        .map((slot) => {
          const item = equippedItem(fighter, slot.id);
          const slotStateClass = item ? "is-equipped" : "is-empty";
          return `
            <div class="equipment-slot ${slotStateClass} ${slotLayoutClass(slot.id)}" data-drop-slot="${slot.id}">
              <div class="slot-label">
                <b><span class="slot-icon" data-slot-icon="${slotIconName(slot.id)}" aria-hidden="true"></span>${slot.label}</b>
                ${item ? "" : `<small>Empty</small>`}
              </div>
              ${draggableItemCard(item, slot.id)}
              ${item ? attunementActionForItem(fighter, item) : ""}
              ${item ? `<button type="button" data-action="unequip" data-slot="${slot.id}">Unequip</button>` : ""}
            </div>
          `;
        })
        .join("")}
    </section>
  `;
  const itemsMarkup = `
    <section class="inventory-list" data-drop-inventory="true" aria-label="Carried items">
      <h3>Carried Items</h3>
      ${groupedInventoryItemsMarkup(carriedItems, {
        emptyText: "No carried items outside equipped gear.",
        renderItem: (item) => renderCarriedInventoryItem(fighter, item),
      })}
    </section>
  `;
  const chestMarkup = `
    <section class="inventory-list chest-list" data-drop-chest="true" aria-label="Home chest">
      <h3>Home Chest</h3>
      <div class="chest-money">
        <div>
          <b>Carried Coins</b>
          <span>${escapeHtml(moneyText(fighter.inventory.money))}</span>
        </div>
        <div>
          <b>Chest Coins</b>
          <span>${escapeHtml(moneyText(chestMoney))}</span>
        </div>
        <div class="chest-coin-fields" aria-label="Coin amount">
          <label><span>CP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-coin-input="cp" /></label>
          <label><span>SP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-coin-input="sp" /></label>
          <label><span>GP</span><input type="number" inputmode="numeric" min="0" step="1" value="0" data-coin-input="gp" /></label>
        </div>
        <p class="chest-money-error" aria-live="polite"></p>
        <div class="chest-money-actions" aria-label="Coin transfers">
          <button type="button" data-action="deposit-custom-coins">Deposit</button>
          <button type="button" data-action="withdraw-custom-coins">Withdraw</button>
          <button type="button" data-action="deposit-coins" data-cp="${moneyToCp(fighter.inventory.money)}" ${moneyToCp(fighter.inventory.money) > 0 ? "" : "disabled"}>Store All</button>
          <button type="button" data-action="withdraw-coins" data-cp="${moneyToCp(chestMoney)}" ${moneyToCp(chestMoney) > 0 ? "" : "disabled"}>Take All</button>
        </div>
      </div>
      ${groupedInventoryItemsMarkup(chestItems, {
        emptyText: "Drop items here to leave them at home.",
        renderItem: renderChestInventoryItem,
      })}
    </section>
  `;
  const tabPanels = {
    equipment: equipmentMarkup,
    items: itemsMarkup,
    chest: state.mode === "home" ? chestMarkup : itemsMarkup,
    vault: renderAdminItemCatalog(),
    materials: partyResourceInventoryMarkup(),
  };

  els.inventoryBody.innerHTML = `
    <div class="inventory-stats">
      ${combatantArtworkMarkup(fighter, "inventory-hero-art")}
      <div class="stat-pill"><b>${fighter.ac}</b><span>AC</span></div>
      <div class="stat-pill"><b>${abilityLabel(attackBonus(fighter))}</b><span>To Hit</span></div>
      <div class="stat-pill"><b>${escapeHtml(fighter.damage.label)}</b><span>Damage</span></div>
      <div class="stat-pill inventory-summary-pill"><b>${escapeHtml(equippedWeapon?.name ?? "Unarmed")}</b><span>Main Hand</span></div>
      <div class="stat-pill"><b>${consumableCount}</b><span>Consumables</span></div>
      ${attunementSummaryMarkup(fighter)}
      ${
        adminEnabled()
          ? `<button class="admin-toggle ${inventoryAdminOpen ? "active" : ""}" type="button" data-action="toggle-admin">
              ${inventoryAdminOpen ? "Hide Vault" : "Item Vault"}
            </button>`
          : ""
      }
      <div class="wallet-line">${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>
    </div>
    ${inventoryTabsMarkup(activeInventoryTab)}
    <div class="inventory-tab-panel" role="tabpanel">
      ${tabPanels[activeInventoryTab] ?? tabPanels.equipment}
    </div>
  `;
}

function partyResourceInventoryMarkup() {
  const resources = normalizePartyResources(state.partyResources ?? {});
  const entries = Object.entries(resources);
  const groupedEntries = new Map();
  for (const [itemId, quantity] of entries) {
    const item = getItemTemplate(itemId);
    const group = item?.category ?? item?.component?.kind ?? "material";
    if (!groupedEntries.has(group)) groupedEntries.set(group, []);
    groupedEntries.get(group).push({ itemId, quantity, item });
  }
  const groupMarkup = Array.from(groupedEntries.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([group, groupEntries]) => `
        <details class="material-satchel-group" open>
          <summary>${escapeHtml(group)} <span>${groupEntries.reduce((sum, entry) => sum + entry.quantity, 0)}</span></summary>
          <div>
            ${groupEntries
              .sort((a, b) => (a.item?.name ?? a.itemId).localeCompare(b.item?.name ?? b.itemId))
              .map(
                ({ itemId, quantity, item }) => `
                  <span>
                    <b>${escapeHtml(item?.name ?? itemId)}</b> x${quantity}
                    <button type="button" data-action="inspect-party-resource" data-item="${escapeAttribute(itemId)}">Inspect</button>
                  </span>
                `,
              )
              .join("")}
          </div>
        </details>
      `,
    )
    .join("");
  return `
    <section class="party-resource-inventory ${questSatchelOpen ? "open" : "collapsed"}">
      <button type="button" class="quest-satchel-toggle" data-action="toggle-quest-satchel" aria-expanded="${questSatchelOpen ? "true" : "false"}">
        <span>Material Satchel</span>
        <small>${entries.length ? `${entries.reduce((sum, [, quantity]) => sum + quantity, 0)} item${entries.reduce((sum, [, quantity]) => sum + quantity, 0) === 1 ? "" : "s"}` : "Empty"}</small>
      </button>
      ${
        questSatchelOpen
          ? entries.length
            ? groupMarkup
            : `<p class="empty-note">No shared materials yet.</p>`
          : ""
      }
    </section>
  `;
}

function showPartyResourceInfo(itemId) {
  const item = getItemTemplate(itemId);
  const quantity = partyResourceCount(itemId);
  if (!item || quantity <= 0) return;
  showGameDialog({
    title: item.name ?? "Material",
    message: `${item.flavor?.description ?? item.description ?? item.flavor?.short ?? "A shared crafting material."}\n\nMaterial Satchel: ${quantity}`,
    confirmText: "Close",
    cancelText: "Close",
  });
}

function handoutInlineMarkup(text) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function handoutTextMarkup(text = "") {
  const lines = String(text ?? "").replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(`<p>${handoutInlineMarkup(paragraph.join(" "))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    blocks.push(`<ul>${list.map((item) => `<li>${handoutInlineMarkup(item)}</li>`).join("")}</ul>`);
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }
    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      flushList();
      const level = Math.min(4, heading[1].length + 2);
      blocks.push(`<h${level}>${handoutInlineMarkup(heading[2])}</h${level}>`);
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(trimmed);
    if (bullet) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }
    flushList();
    paragraph.push(trimmed);
  }
  flushParagraph();
  flushList();
  return blocks.join("") || `<p class="empty-note">This page is blank.</p>`;
}

function unequippedInventoryItems(fighter) {
  const equippedIds = new Set(Object.values(fighter.equipment).filter(Boolean));
  return fighter.inventory.items.filter((item) => !equippedIds.has(item.id));
}

function itemTransferRangeFeet() {
  return state.mode === "combat" ? 20 : 60;
}

function itemTransferTargets(source = activeHero()) {
  if (!source?.alive) return [];
  const candidates = state.mode === "home" ? rosterHeroes() : partyHeroes();
  const maxSquares = itemTransferRangeFeet() / feetPerSquare;
  return candidates
    .filter((hero) => hero.id !== source.id && hero.alive && !hero.dead)
    .filter((hero) => canFighterReceiveInventory(hero))
    .filter((hero) => attackGridDistanceBetweenFighters(source, hero) <= maxSquares);
}

function dropItemBesideFighter(fighter, item) {
  if (!fighter || !item) return;
  addLootPile({
    id: `loot-ally-drop-${item.id}-${Date.now()}`,
    position: thrownWeaponLandingPosition(fighter.position),
    money: normalizeMoney(),
    items: [item],
  });
}

function autoEquipHumanoidAllyItem(ally, item) {
  if (!isAutonomousAlly(ally) || !isHumanoidFighter(ally) || !item || !["weapon", "armor"].includes(item.type)) return false;
  const usableSlots = equipmentSlots.filter((slot) => itemCanUseSlot(item, slot.id));
  const preferredSlot = usableSlots.find((slot) => (item.type === "weapon" ? slot.id === "mainHand" : slot.id === "torso")) ?? usableSlots[0];
  if (!preferredSlot || !itemCanEquipInSlot(ally, item, preferredSlot.id)) return false;

  const oldItemIds = new Set();
  const equippingHand = isHandSlot(preferredSlot.id);
  for (const slot of equipmentSlots) {
    if (ally.equipment[slot.id] === item.id || (equippingHand && isHandSlot(slot.id) && itemRequiresTwoHands(equippedItem(ally, slot.id)))) {
      ally.equipment[slot.id] = null;
    }
  }
  if (itemRequiresTwoHands(item)) {
    ["mainHand", "offHand"].forEach((slotId) => {
      if (ally.equipment[slotId] && ally.equipment[slotId] !== item.id) oldItemIds.add(ally.equipment[slotId]);
      ally.equipment[slotId] = item.id;
    });
  } else {
    if (ally.equipment[preferredSlot.id] && ally.equipment[preferredSlot.id] !== item.id) oldItemIds.add(ally.equipment[preferredSlot.id]);
    ally.equipment[preferredSlot.id] = item.id;
  }

  for (const oldItemId of oldItemIds) {
    const oldItem = itemForId(ally, oldItemId);
    if (!oldItem) continue;
    ally.inventory.items = ally.inventory.items.filter((entry) => entry.id !== oldItemId);
    dropItemBesideFighter(ally, oldItem);
    addLog(`${ally.name} drops ${oldItem.name}.`, "important");
  }
  refreshDerivedStats(ally);
  addLog(`${ally.name} equips ${item.name}.`, "important");
  return true;
}

function transferControlsForItem(fighter, item) {
  const targets = itemTransferTargets(fighter);
  if (!targets.length) return "";
  return `
    <label class="inline-transfer">
      <span>Give</span>
      <select data-transfer-target="${escapeAttribute(item.id)}">
        ${targets.map((hero) => `<option value="${escapeAttribute(hero.id)}">${escapeHtml(hero.name)}</option>`).join("")}
      </select>
    </label>
    <button type="button" data-action="give-item" data-item="${escapeAttribute(item.id)}">Give</button>
  `;
}

function transferInventoryItem(itemId, targetId) {
  const source = activeHero();
  const target = state.fighters[targetId];
  const item = itemForId(source, itemId);
  if (!source || !target || !item) return;
  if (Object.values(source.equipment ?? {}).includes(itemId)) {
    addLog("Unequip an item before giving it to another hero.");
    return;
  }
  if (!itemTransferTargets(source).some((hero) => hero.id === target.id)) {
    addLog(`${target.name} is too far away to receive ${item.name}.`, "important");
    renderInventoryMenu();
    return;
  }

  source.inventory.items = source.inventory.items.filter((entry) => entry.id !== itemId);
  if (!canFighterReceiveInventory(target)) {
    addLog(`${target.name} cannot carry items.`, "important");
    addItemToInventory(source, item, "transfer-stack");
    renderInventoryMenu();
    return;
  }
  addItemToInventory(target, item, "transfer-stack");
  autoEquipHumanoidAllyItem(target, item);
  addLog(`${source.name} gives ${item.name} to ${target.name}.`, "important");
  refreshDerivedStats(source);
  refreshDerivedStats(target);
  render();
  renderInventoryMenu();
}

function showInventoryMenu() {
  if (!canFighterReceiveInventory(activeHero())) {
    addLog(`${activeHero().name} cannot carry items.`, "important");
    render();
    return;
  }
  clearHeldMovementKeys();
  renderInventoryMenu();
  els.inventoryMenu.classList.remove("hidden");
}

function hideInventoryMenu() {
  els.inventoryMenu.classList.add("hidden");
}

function beltItems(fighter = state.fighters.hero) {
  return equipmentSlots
    .filter((slot) => isBeltSlot(slot.id))
    .map((slot) => ({ slot, item: equippedItem(fighter, slot.id) }))
    .filter((entry) => entry.item);
}

function usableEquippedItems(fighter = state.fighters.hero) {
  const seen = new Set();
  return equipmentSlots
    .map((slot) => ({ slot, item: equippedItem(fighter, slot.id) }))
    .filter((entry) => {
      if (!entry.item?.use || seen.has(entry.item.id)) return false;
      seen.add(entry.item.id);
      return true;
    });
}

function itemUseResource(item) {
  return item?.use?.resource ?? "action";
}

function ensureItemCharges(item) {
  if (!item?.use?.charges) return item;
  item.use.charges.remaining = Math.min(item.use.charges.max ?? 1, item.use.charges.remaining ?? item.use.charges.max ?? 1);
  return item;
}

function itemChargeRefreshKey(item) {
  if (!item?.use?.charges?.refresh) return null;
  return `${state.customDungeonId ?? state.dungeon?.id ?? state.themeId ?? "dungeon"}:${state.campaignIndex ?? "standalone"}`;
}

function itemHasCharges(item) {
  ensureItemCharges(item);
  if (item?.use?.charges?.refresh === "newDungeon" && item.use.charges.lastUsedKey === itemChargeRefreshKey(item)) return false;
  return !item?.use?.charges || (item.use.charges.remaining ?? 0) > 0;
}

function spendItemCharge(item) {
  ensureItemCharges(item);
  if (!item?.use?.charges) return true;
  if (item.use.charges.refresh === "newDungeon" && item.use.charges.lastUsedKey === itemChargeRefreshKey(item)) return false;
  if ((item.use.charges.remaining ?? 0) <= 0) return false;
  item.use.charges.remaining -= 1;
  if (item.use.charges.refresh === "newDungeon") item.use.charges.lastUsedKey = itemChargeRefreshKey(item);
  return true;
}

function refreshItemChargesForFighter(fighter, refresh) {
  for (const item of fighter?.inventory?.items ?? []) {
    if (item.use?.charges?.refresh === refresh) {
      item.use.charges.remaining = item.use.charges.max ?? 1;
      delete item.use.charges.lastUsedKey;
    }
  }
}

function refreshPartyItemCharges(refresh) {
  rosterHeroes().forEach((hero) => refreshItemChargesForFighter(hero, refresh));
}

function statusDurationForItemUse(use = {}) {
  if (use.duration === "newDungeon" || use.duration === "dungeon") return { expiresAtHome: true };
  if (use.duration === "turn") return { expiresAtEndOfTurn: true };
  if (use.duration === "encounter") return { durationRounds: 10 };
  if (Number(use.durationRounds) > 0) return { durationRounds: Number(use.durationRounds) };
  return { durationRounds: 3 };
}

function itemStatusFromEffects(item, effects = {}, use = item?.use ?? {}) {
  return {
    id: `item-${item.id}`,
    label: item.name,
    tempHp: effects.tempHp ?? 0,
    acBonus: effects.acBonus ?? 0,
    attackBonus: effects.attackBonus ?? 0,
    damageBonus: effects.damageBonus ?? 0,
    saveBonus: effects.saveBonus ?? 0,
    skillBonus: effects.skillBonus ?? 0,
    speedBonusFeet: effects.speedBonusFeet ?? 0,
    speedMultiplier: effects.speedMultiplier,
    speedOverrideFeet: effects.speedOverrideFeet,
    maxHpBonus: effects.maxHpBonus ?? 0,
    abilityScoreBonuses: { ...(effects.abilityScoreBonuses ?? {}) },
    abilityScorePenalties: { ...(effects.abilityScorePenalties ?? {}) },
    abilityScoreCaps: { ...(effects.abilityScoreCaps ?? {}) },
    abilityScoreMinimums: { ...(effects.abilityScoreMinimums ?? {}) },
    flying: Boolean(effects.flying),
    ignoredByMonsters: Boolean(effects.ignoredByMonsters),
    attackAdvantage: Boolean(effects.attackAdvantage),
    stealthAdvantage: Boolean(effects.stealthAdvantage),
    waterBreathing: Boolean(effects.waterBreathing),
    swimSpeed: Boolean(effects.swimSpeed),
    resistances: [...(effects.resistances ?? [])],
    vulnerabilities: [...(effects.vulnerabilities ?? [])],
    ...statusDurationForItemUse(use),
  };
}

function itemWeaponRiderStatus(item) {
  const extra = item?.use?.extraDamage ?? item?.magic?.effects?.extraDamage?.[0] ?? item?.magic?.effects?.extraDamage;
  if (!extra?.count || !extra?.sides) return null;
  const roll = rollDice(extra.count, extra.sides);
  return {
    id: `item-rider-${item.id}`,
    label: item.name,
    weaponRider: true,
    damageBonus: roll.total,
    damageType: extra.type ?? "damage",
    rollText: roll.rolls.join(" + "),
    ...statusDurationForItemUse(item.use ?? { duration: "encounter" }),
  };
}

function itemPoisonRiderStatus(item) {
  const poison = item?.use?.poison;
  if (!poison || poison.delivery !== "injury") return null;
  return {
    id: `item-poison-${item.id}`,
    label: poison.name ?? item.name,
    weaponRider: true,
    poison,
    durationRounds: 10,
  };
}

function itemUseConsumesInventory(item) {
  return item.use?.consume !== false && !item.use?.charges;
}

function itemUseIsSupported(item) {
  const kind = item?.use?.kind;
  return Boolean(["healing", "fullHealing", "buff", "weaponBuff", "poison", "light", "special", "spellScroll", "breathPotion", "instrumentPerformance", "thrownConsumable"].includes(kind) || item?.use?.status);
}

function canUseBeltItem(fighter, item) {
  if (!fighter || !item || !heroCanAct(fighter)) return false;
  if (itemRequiresAttunement(item) && !fighterIsAttunedToItem(fighter, item)) return false;
  if (!itemUseIsSupported(item)) return false;
  if (item.use?.kind === "spellScroll" && fighter.classId === "barbarian" && (fighter.statusEffects ?? []).some((effect) => effect.id === "rage")) return false;
  if (!itemHasCharges(item)) return false;
  if (state.mode !== "combat") return true;
  const resource = itemUseResource(item);
  if (resource === "reaction") return false;
  return ["bonusAction", "weaponRider"].includes(resource) ? fighter.hasBonusAction : fighter.hasAction;
}

function equippedSlotsForItem(fighter, itemId) {
  return equipmentSlots.map((slot) => slot.id).filter((slotId) => fighter?.equipment?.[slotId] === itemId);
}

function consumeInventoryItemByTemplateId(fighter, templateId) {
  const index = (fighter?.inventory?.items ?? []).findIndex((item) => (item.baseItemId ?? item.itemId ?? item.id) === templateId);
  if (index < 0) return null;
  return consumeInventoryItemQuantity(fighter, fighter.inventory.items[index].id, 1);
}

function lightItemStatus(item, hero) {
  const equippedSlots = equippedSlotsForItem(hero, item.id);
  const requiredSlots = item.use?.requiredSlots ?? item.slots ?? [];
  return {
    ...item.use.status,
    lightItemId: item.id,
    requiredSlots,
    detail: equippedSlots.length ? `Equipped in ${equippedSlots.map((slotId) => equipmentSlots.find((slot) => slot.id === slotId)?.label ?? slotId).join(", ")}` : "",
  };
}

function canUseHealingItemOnTarget(actor, item, target) {
  if (!actor || !target || !item || !["healing", "fullHealing"].includes(item.use?.kind)) return false;
  if (!itemHasCharges(item)) return false;
  if (!heroCanAct(actor) || target.dead || target.hp > 0) return false;
  if (!isPartyHeroId(actor.id) || !isPartyHeroId(target.id) || actor.id === target.id) return false;
  if (state.mode === "combat" && !actor.hasAction) return false;
  return hasMeleeAccess(actor, target);
}

function dyingPotionTargets(actor, item) {
  if (!["healing", "fullHealing"].includes(item?.use?.kind)) return [];
  return partyHeroes().filter((target) => canUseHealingItemOnTarget(actor, item, target));
}

function renderUseItemMenu() {
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  const entries = usableEquippedItems(hero);
  els.useItemBody.innerHTML = entries.length
    ? `
      <div class="use-item-list">
        ${entries
          .map(({ slot, item }) => {
            const disabled = canUseBeltItem(hero, item) ? "" : "disabled";
            const effectText = itemUseEffectText(item);
            const chargeText = itemChargeText(item);
            const targetButtons = dyingPotionTargets(hero, item)
              .map((target) => {
                const targetDisabled = canUseHealingItemOnTarget(hero, item, target) ? "" : "disabled";
                return `<button type="button" data-action="use-belt-item" data-item="${item.id}" data-target="${target.id}" ${targetDisabled}>Use on ${escapeHtml(target.name)}</button>`;
              })
              .join("");
            return `
              <div class="use-item-row">
                <div>
                  <b>${escapeHtml(item.name)}</b>
                  <span>${escapeHtml(slot.label)} - ${escapeHtml(itemUseResourceText(item))}${chargeText ? ` - ${escapeHtml(chargeText)}` : ""}</span>
                  ${effectText ? `<span class="use-item-effect">${escapeHtml(effectText)}</span>` : ""}
                </div>
                <div class="use-item-actions">
                  <button type="button" data-action="use-belt-item" data-item="${item.id}" ${disabled}>Use</button>
                  ${targetButtons}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `
    : `<p class="empty-note">No usable equipped items.</p>`;
}

function showUseItemMenu() {
  renderUseItemMenu();
  els.useItemMenu.classList.remove("hidden");
}

function hideUseItemMenu() {
  els.useItemMenu.classList.add("hidden");
}

function adjacentDyingHeroes(fighter) {
  if (!fighter || state.mode !== "combat") return [];
  return partyHeroes().filter(
    (hero) =>
      hero.id !== fighter.id &&
      heroIsUnstableDying(hero) &&
      hasMeleeAccess(fighter, hero),
  );
}

function medicineTargetsMarkup(fighter) {
  const targets = adjacentDyingHeroes(fighter);
  if (!targets.length) {
    return `<button type="button" data-action="combat-action" data-combat-action="medicine" disabled>Medicine Check</button>`;
  }
  return targets
    .map(
      (target) =>
        `<button type="button" data-action="combat-action" data-combat-action="medicine" data-target="${escapeAttribute(target.id)}" ${fighter.hasAction ? "" : "disabled"}>Stabilize ${escapeHtml(target.name)}</button>`,
    )
    .join("");
}

function combatManeuverTarget(fighter) {
  const target = attackTarget();
  if (!fighter || !target || objectIsDestructible(target) || !target.alive) return null;
  return hasMeleeAccess(fighter, target) ? target : null;
}

function combatManeuverButtonsMarkup(fighter) {
  const target = combatManeuverTarget(fighter);
  const disabled = !fighter?.hasAction || !target;
  const targetName = target ? escapeHtml(target.name) : "target";
  return `
    <button type="button" data-action="combat-action" data-combat-action="grapple" ${disabled ? "disabled" : ""}>Grapple ${targetName}</button>
    <button type="button" data-action="combat-action" data-combat-action="shovePush" ${disabled ? "disabled" : ""}>Shove 5 ft ${targetName}</button>
    <button type="button" data-action="combat-action" data-combat-action="shoveProne" ${disabled ? "disabled" : ""}>Shove Prone ${targetName}</button>
  `;
}

function actionOptionMarkup(buttonMarkup, description, favoriteMarkup = "", hotkeyMarkup = "") {
  return `
    <div class="action-option-row">
      ${hotkeyMarkup}
      <div class="action-option-controls">
        ${favoriteMarkup}
        <div class="action-option-buttons">${buttonMarkup}</div>
      </div>
      <p>${description}</p>
    </div>
  `;
}

let openActionMenuSections = null;

function actionDetailsOpen(key, defaultOpen = false) {
  return openActionMenuSections ? openActionMenuSections.has(key) : defaultOpen;
}

function rememberOpenActionMenuSections() {
  if (els.actionMenu?.classList.contains("hidden")) return;
  openActionMenuSections = new Set(
    Array.from(els.actionMenuBody.querySelectorAll("details[data-action-section][open]"))
      .map((details) => details.dataset.actionSection)
      .filter(Boolean),
  );
}

function actionMenuSectionMarkup(title, rows, { open = false } = {}) {
  const content = rows.filter(Boolean).join("");
  if (!content) return "";
  const key = title;
  return `
    <details class="action-menu-section" data-action-section="${escapeAttribute(key)}" ${actionDetailsOpen(key, open) ? "open" : ""}>
      <summary>${escapeHtml(title)}</summary>
      <div class="action-menu-section-body">
        ${content}
      </div>
    </details>
  `;
}

function touchDistance(a, b) {
  return Math.max(Math.abs((a?.x ?? 0) - (b?.x ?? 0)), Math.abs((a?.y ?? 0) - (b?.y ?? 0)));
}

function grabEligibleFighter(carrier, target) {
  if (!carrier?.position || !target?.position || target.id === carrier.id || target.dead) return false;
  const friendly =
    isPartyHeroId(target.id) ||
    target.team === "heroes" ||
    target.friendly ||
    target.summonedByHeroId ||
    target.companionOwnerId;
  return Boolean(friendly && touchDistance(carrier.position, target.position) <= 1);
}

function objectWithinGrabReach(carrier, object) {
  return Boolean(carrier?.position && objectCells(object).some((cell) => touchDistance(carrier.position, cell) <= 1));
}

function grabCandidateFighters(carrier) {
  return Object.values(state.fighters ?? {}).filter((target) => grabEligibleFighter(carrier, target));
}

function grabCandidateObjects(carrier) {
  return (state.dungeonObjects ?? []).filter((object) => objectCanBeGrabbedBy(carrier, object) && objectWithinGrabReach(carrier, object));
}

function grabCandidateButtonsMarkup(fighter, disabled = false) {
  const fighterButtons = grabCandidateFighters(fighter).map((target) =>
    `<button type="button" data-action="grab-target" data-grab-kind="fighter" data-grab-id="${escapeAttribute(target.id)}" ${disabled ? "disabled" : ""}>Grab ${escapeHtml(target.name)} (auto)</button>`,
  );
  const objectButtons = grabCandidateObjects(fighter).map((object) => {
    const template = objectTemplate(object.type);
    const weight = objectGrabWeight(object);
    const dc = pushDragLiftAttemptDc(fighter, weight);
    const checkText = dc > 0 ? `Athletics DC ${dc}` : "auto";
    return `<button type="button" data-action="grab-target" data-grab-kind="object" data-grab-id="${escapeAttribute(object.id)}" ${disabled ? "disabled" : ""}>Grab ${escapeHtml(template?.name ?? object.type)} (${weight} lb, ${checkText})</button>`;
  });
  return [...fighterButtons, ...objectButtons].join("");
}

function canOpenGrabMenu(fighter) {
  if (!gameHasStarted || movementInProgress || !heroCanAct(fighter)) return false;
  if (state.mode === "combat" && (activeFighter()?.id !== fighter?.id || !combatNeedsHeroTurns())) return false;
  if (activeGrabForCarrier(fighter)) return true;
  if (state.mode === "combat" && !fighter?.hasAction) return false;
  return grabCandidateFighters(fighter).length > 0 || grabCandidateObjects(fighter).length > 0;
}

function grabbedEntityName(grab) {
  if (!grab) return "";
  if (grab.kind === "fighter") return state.fighters?.[grab.targetId]?.name ?? "target";
  const object = dungeonObjectForId(grab.targetId);
  return objectTemplate(object?.type)?.name ?? object?.type ?? "object";
}

function tacticFavoriteKey(actionId) {
  return `tactic:${actionId ?? ""}`;
}

function combatActionButtonMarkup(actionId, label, disabled = false, targetId = null) {
  return `<button type="button" data-action="combat-action" data-combat-action="${escapeAttribute(actionId)}" ${targetId ? `data-target="${escapeAttribute(targetId)}"` : ""} ${
    disabled ? "disabled" : ""
  }>${escapeHtml(label)}</button>`;
}

function combatTacticDefinitions(fighter) {
  const canUseAttackAction = Boolean(fighter?.hasAction);
  const maneuverTarget = combatManeuverTarget(fighter);
  const maneuverDisabled = !fighter?.hasAction || !maneuverTarget;
  const maneuverName = maneuverTarget ? maneuverTarget.name : "target";
  const activeGrab = activeGrabForCarrier(fighter);
  const grabButtons = fighter && !activeGrab ? grabCandidateButtonsMarkup(fighter, state.mode === "combat" && !fighter.hasAction) : "";
  return [
    {
      id: "dash",
      section: "Movement and defense",
      open: true,
      controls: combatActionButtonMarkup("dash", "Dash", !canUseAttackAction),
      description: "Gain extra movement equal to your base movement. Uses your Attack action.",
    },
    {
      id: "dodge",
      section: "Movement and defense",
      open: true,
      controls: combatActionButtonMarkup("dodge", "Dodge", !canUseAttackAction),
      description: "Attacks against you have disadvantage until your next turn. Uses your Attack action.",
    },
    {
      id: "disengage",
      section: "Movement and defense",
      open: true,
      controls: combatActionButtonMarkup("disengage", "Disengage", !canUseAttackAction),
      description: "Move without provoking opportunity attacks this turn. Uses your Attack action.",
    },
    {
      id: "offHandAttack",
      section: "Bonus actions",
      controls: combatActionButtonMarkup("offHandAttack", "Off-Hand Attack", !canOffHandAttack(fighter)),
      description: "Attack with a light off-hand weapon. Uses your Bonus action.",
    },
    {
      id: "getBehind",
      section: "Bonus actions",
      controls: combatActionButtonMarkup("getBehind", "Get Behind", !fighter?.hasBonusAction),
      description: "DEX DC 12. On success, use your Bonus action to move through monsters this turn.",
    },
    {
      id: "grapple",
      section: "Maneuvers",
      controls: combatActionButtonMarkup("grapple", `Grapple ${maneuverName}`, maneuverDisabled),
      description: "Grapple an adjacent enemy with Athletics. Uses one attack from your Attack action.",
    },
    {
      id: "shovePush",
      section: "Maneuvers",
      controls: combatActionButtonMarkup("shovePush", `Shove 5 ft ${maneuverName}`, maneuverDisabled),
      description: "Push an adjacent enemy away with Athletics. Uses one attack from your Attack action.",
    },
    {
      id: "shoveProne",
      section: "Maneuvers",
      controls: combatActionButtonMarkup("shoveProne", `Shove Prone ${maneuverName}`, maneuverDisabled),
      description: "Knock an adjacent enemy prone with Athletics. Uses one attack from your Attack action.",
    },
    {
      id: "medicine",
      section: "Aid and grab",
      controls: medicineTargetsMarkup(fighter),
      description: "WIS DC 10 to stabilize an adjacent dying hero. Uses your Attack action.",
    },
    {
      id: "grab",
      section: "Aid and grab",
      controls: grabButtons || `<button type="button" disabled>Grab</button>`,
      description: "Grab an adjacent ally, companion, or pushable object. Uses your Attack action; movement costs double while dragging.",
    },
  ];
}

function tacticRowMarkup(hero, tactic, favoriteOptions = {}) {
  const key = tacticFavoriteKey(tactic.id);
  return actionOptionMarkup(
    tactic.controls,
    escapeHtml(tactic.description),
    `<div class="action-option-favorite">
      ${favoriteMoveButtonsMarkup(key, favoriteOptions.favoriteIndex ?? null, favoriteOptions.favoriteTotal ?? 0)}
      ${favoriteButtonMarkup(hero, key)}
    </div>`,
    favoriteHotkeyMarkup(favoriteOptions.hotkeyIndex),
  );
}

function combatTacticSectionsMarkup(hero, fighter) {
  const tactics = combatTacticDefinitions(fighter);
  const sections = [...new Set(tactics.map((entry) => entry.section))];
  return sections
    .map((section) => {
      const rows = tactics.filter((entry) => entry.section === section).map((entry) => tacticRowMarkup(hero, entry));
      return actionMenuSectionMarkup(section, rows, { open: tactics.some((entry) => entry.section === section && entry.open) });
    })
    .join("");
}

function renderActionMenu() {
  rememberOpenActionMenuSections();
  const fighter = activeFighter();
  const actingFighter = state.mode === "combat" ? fighter : activeHero();
  const activeGrab = activeGrabForCarrier(actingFighter);
  const grabButtons = actingFighter && !activeGrab ? grabCandidateButtonsMarkup(actingFighter, state.mode === "combat" && !actingFighter.hasAction) : "";
  if (els.actionMenuTitle) {
    els.actionMenuTitle.textContent = activeGrab ? "Release Grab" : state.mode === "combat" ? "Tactics" : "Grab";
  }
  els.actionMenuBody.innerHTML = actingFighter && heroCanAct(actingFighter) && (state.mode === "combat" || state.mode === "exploration" || state.mode === "home")
    ? activeGrab
      ? `
      <div class="action-options action-options-simple">
        <button type="button" data-action="release-grab">Release ${escapeHtml(grabbedEntityName(activeGrab))}</button>
        <p>Stop dragging the grabbed target.</p>
      </div>
    `
      : state.mode === "combat"
      ? `
      <div class="action-options combat-action-menu">
        <p class="action-menu-intro">${escapeHtml(actingFighter.name)} can spend actions on movement, defense, control, or rescue.</p>
        ${combatTacticSectionsMarkup(actingFighter, fighter)}
      </div>
    `
      : `
      <div class="action-options action-options-simple">
        ${activeGrab ? `<button type="button" data-action="release-grab">Release ${escapeHtml(grabbedEntityName(activeGrab))}</button><p>Stop dragging the grabbed target.</p>` : ""}
        ${grabButtons || `<button type="button" disabled>Grab</button>`}
        <p>Grab an adjacent ally, companion, or pushable object. Movement costs double while dragging.</p>
      </div>
    `
    : `<p class="empty-note">No action options available.</p>`;
}

function showActionMenu() {
  openActionMenuSections = null;
  renderActionMenu();
  els.actionMenu.classList.remove("hidden");
}

function hideActionMenu() {
  els.actionMenu.classList.add("hidden");
  openActionMenuSections = null;
}

async function useCombatAction(action, targetId = null) {
  const fighter = activeFighter();
  if (!fighter || !heroCanAct(fighter) || state.mode !== "combat") return;
  const baseMovement = Math.floor(fighter.speedFeet / feetPerSquare);

  if (action === "getBehind") {
    if (!fighter.hasBonusAction) return;
    const rollResult = rollD20ForFighter(fighter);
    const roll = rollResult.roll;
    const bonus = abilityMod(fighter, "dex");
    const total = roll + bonus;
    recordD20OutcomeForFighter(fighter, total >= 12);
    addLog(`${fighter.name} tries to Get Behind: DEX ${roll} ${abilityLabel(bonus)} = ${total} vs DC 12.`, "important");
    addAdminCheckLog({ actor: fighter, label: "Dexterity check to Get Behind", rollResult, bonus, total, dc: 12, success: total >= 12 });
    if (total >= 12) {
      fighter.canMoveThroughMonsters = true;
      fighter.hasBonusAction = false;
      addLog(`${fighter.name} can move through monster spaces this turn.`, "important");
    } else {
      addLog(`${fighter.name} cannot slip through the opening.`);
    }
    hideActionMenu();
    render();
    return;
  }

  if (action === "offHandAttack") {
    const target = attackTarget();
    if (!target || !canOffHandAttack(fighter)) return;
    hideActionMenu();
    const options = {
      weaponSlot: "offHand",
      resource: "bonusAction",
      includeDamageModifier: false,
      actionLabel: "makes an off-hand attack",
    };
    if (objectIsDestructible(target)) void attackDestructibleObject(fighter, target, options);
    else void makeAttack(fighter, target, options);
    return;
  }

  if (!fighter.hasAction) return;

  if (action === "grapple" || action === "shovePush" || action === "shoveProne") {
    const target = combatManeuverTarget(fighter);
    if (!target) return;
    hideActionMenu();
    if (action === "grapple") await performGrappleAction(fighter, target);
    else await performShoveAction(fighter, target, action === "shovePush" ? "push" : "prone");
    return;
  }

  if (action === "medicine") {
    const targets = adjacentDyingHeroes(fighter);
    const target = targets.find((hero) => hero.id === targetId) ?? targets[0];
    if (!target) return;
    const rollResult = rollD20ForFighter(fighter);
    const roll = rollResult.roll;
    const bonus = abilityMod(fighter, "wis");
    const total = roll + bonus;
    fighter.hasAction = false;
    recordD20OutcomeForFighter(fighter, total >= 10);
    addLog(`${fighter.name} makes a Medicine check for ${target.name}: WIS ${roll} ${abilityLabel(bonus)} = ${total} vs DC 10.`, "important");
    addAdminCheckLog({ actor: fighter, label: "Medicine check to stabilize", target: target.name, rollResult, bonus, total, dc: 10, success: total >= 10 });
    if (total >= 10) {
      markFighterStableAtZero(target);
      addLog(`${target.name} is stabilized at 0 HP.`, "heal");
      void maybeFinishEncounterAfterHeroRecovery();
    } else {
      addLog(`${fighter.name} cannot stabilize ${target.name} yet.`);
    }
    hideActionMenu();
    render();
    return;
  }

  if (action === "dash") {
    fighter.movementLeft = (fighter.movementLeft ?? 0) + baseMovement;
    fighter.hasAction = false;
    addLog(`${fighter.name} uses Dash and gains ${baseMovement * feetPerSquare} ft extra movement.`, "important");
  }

  if (action === "dodge") {
    fighter.dodging = true;
    fighter.hasAction = false;
    const drownedShieldId = "magic-undead-barrowcrown-shield-drowned-legion";
    const drownedShield = typeof activeMagicItemByTemplate === "function" ? activeMagicItemByTemplate(fighter, drownedShieldId) : null;
    const advanceKey = typeof itemPowerKey === "function" ? itemPowerKey(drownedShieldId, "drownedAdvance") : `${drownedShieldId}:drownedAdvance`;
    if (drownedShield && typeof canUseItemPower === "function" && typeof spendItemPower === "function" && canUseItemPower(fighter, advanceKey)) {
      fighter.movementLeft = (fighter.movementLeft ?? 0) + 2;
      fighter.disengaged = true;
      spendItemPower(fighter, advanceKey, "shortRest");
      addLog(`${fighter.name}'s Shield of the Drowned Legion grants Drowned Advance: +10 ft movement and no opportunity attacks this turn.`, "important");
    }
    addLog(`${fighter.name} uses Dodge. Attacks against them have disadvantage until their next turn.`, "important");
  }

  if (action === "disengage") {
    fighter.disengaged = true;
    fighter.hasAction = false;
    addLog(`${fighter.name} uses Disengage. Movement this turn does not trigger opportunity attacks.`, "important");
  }

  hideActionMenu();
  render();
}

function releaseGrabForFighter(fighter = state.mode === "combat" ? activeFighter() : activeHero()) {
  const grab = activeGrabForCarrier(fighter);
  if (!grab) return false;
  state.grabbedEntity = null;
  addLog(`${fighter.name} releases ${grabbedEntityName(grab)}.`, "important");
  hideActionMenu();
  render();
  return true;
}

async function useGrabAction(kind, targetId) {
  const fighter = state.mode === "combat" ? activeFighter() : activeHero();
  if (!fighter || !heroCanAct(fighter)) return;
  if (state.mode === "combat" && (activeFighter()?.id !== fighter.id || !combatNeedsHeroTurns() || !fighter.hasAction)) return;

  const valid =
    kind === "fighter"
      ? grabCandidateFighters(fighter).some((target) => target.id === targetId)
      : grabCandidateObjects(fighter).some((object) => object.id === targetId);
  if (!valid) return;

  if (kind === "object") {
    const object = dungeonObjectForId(targetId);
    if (!(await passPushDragLiftCheck(fighter, object))) return;
  }

  state.grabbedEntity = { carrierId: fighter.id, kind, targetId };
  if (state.mode === "combat") fighter.hasAction = false;
  addLog(`${fighter.name} grabs ${grabbedEntityName(state.grabbedEntity)}. Movement costs double while dragging.`, "important");
  hideActionMenu();
  render();
}

async function passPushDragLiftCheck(fighter, object) {
  const weight = objectGrabWeight(object);
  if (!object || weight === null || !objectCanBeGrabbedBy(fighter, object)) return false;
  const dc = pushDragLiftAttemptDc(fighter, weight);
  if (dc <= 0) return true;
  const rollResult = rollD20ForFighter(fighter);
  const roll = reliableTalentRoll(fighter, "athletics", rollResult.roll);
  const bonus = skillCheckBonus(fighter, "str", "athletics");
  const total = roll + bonus;
  const name = objectTemplate(object.type)?.name ?? object.type;
  const success = total >= dc;
  recordD20OutcomeForFighter(fighter, success);
  addLog(`${fighter.name} tries to move ${name}: Athletics ${roll} ${abilityLabel(bonus)} = ${total} vs DC ${dc}.`, "important");
  addAdminCheckLog({ actor: fighter, label: "Athletics check to push/drag/lift", target: name, rollResult, bonus, total, dc, success, note: `${weight} lb` });
  if (!success) {
    addLog(`${fighter.name} cannot get ${name} moving.`, "important");
    if (state.mode === "combat") fighter.hasAction = false;
    hideActionMenu();
    render();
  }
  return success;
}

function availableFighterAbilities(fighter = state.fighters.hero) {
  ensureFighterAbilityState(fighter);
  return fighter.abilities.filter((ability) => (fighter.level ?? 1) >= (ability.level ?? 1));
}

function canUseFighterAbility(fighter, ability) {
  return !fighterAbilityUnavailableReason(fighter, ability);
}

function abilityResourceSpent(fighter, ability) {
  if (!ability?.resourcePool) return fighter?.abilityUses?.[ability?.id] ?? 0;
  return fighterAbilityDefinitions(fighter)
    .filter((entry) => entry.resourcePool === ability.resourcePool)
    .reduce((sum, entry) => sum + (fighter?.abilityUses?.[entry.id] ?? 0), 0);
}

function fighterAbilityUnavailableReason(fighter, ability) {
  if (!heroCanAct(fighter) || !ability) return "Unable to act.";
  if (ability.id === "wildShape" && isWildShaped(fighter)) {
    if (state.mode === "combat" && activeFighter()?.id !== fighter.id) return "Not this hero's turn.";
    if (state.mode === "combat" && ability.resource === "bonusAction" && !fighter.hasBonusAction) return "Bonus action already used.";
    return "";
  }
  if (ability.invocationOption && ability.resource === "passive") return "";
  if (ability.resource === "passive") return "";
  if (abilityResourceSpent(fighter, ability) >= abilityMaxUses(fighter, ability)) return "No uses remaining.";
  if (ability.id === "rage" && fighterWearsHeavyArmor(fighter)) return "Cannot rage while wearing heavy armor.";
  if (ability.id === "layOnHands" && !partyHeroes().some((target) => !target.dead && (target.id === fighter.id || hasMeleeAccess(fighter, target)) && ((target.hp ?? 0) < (target.maxHp ?? 0) || (typeof fighterDiseases === "function" && fighterDiseases(target).length > 0)))) {
    return "No wounded or diseased adjacent hero.";
  }
  if (ability.id === "actionSurge" && state.mode !== "combat") return "Only usable in combat.";
  if (["battleragerSpikes", "battleragerCharge", "frenzy", "elementalCleaver", "mightyImpel", "stormAuraPulse", "totemSurge", "unstableBacklash"].includes(ability.id) && !isBarbarianRaging(fighter)) {
    return "Requires Rage.";
  }
  if (ability.id === "uncannyDodge") return "Triggers as a reaction when this hero is hit.";
  if (ability.id === "indomitable") return "Triggers automatically when this companion fails a saving throw.";
  if (ability.id === "goliathStoneEndurance") return "Triggers as a reaction when this hero takes damage.";
  if (ability.metamagicOption) return "Choose this while casting an eligible spell.";
  if (ability.subclassEffect?.kind === "interruptSpell") return "Triggers as a reaction prompt when an enemy uses a spell-like power.";
  if (ability.id === "cuttingWords") return "Triggers as a reaction prompt when an enemy attack threatens a hero.";
  if (
    [
      "maneuverParry",
      "maneuverRiposte",
      "maneuverBrace",
      "protectiveField",
      "wardingManeuver",
      "runicShield",
      "cloudRune",
      "stoneRune",
      "shadowMartyr",
      "spiritShield",
      "retaliation",
      "unstableBacklash",
      "wrathOfTheStorm",
      "tipsySway",
      "soulOfVengeance",
      "multiattackDefense",
      "bendLuck",
      "armorOfHexes",
      "entropicWard",
    ].includes(ability.id)
  ) return "Triggers as a reaction prompt when its condition happens.";
  if (ability.id === "maneuverAmbush") return "Triggers as a prompt when initiative is rolled.";
  if (ability.id === "steadyAim" && state.mode !== "combat") return "Only usable in combat.";
  if (ability.id === "steadyAim" && ((fighter.lastMoveFeet ?? 0) > 0 || (fighter.movementLeft ?? 0) < Math.floor(fighter.speedFeet / feetPerSquare))) return "Steady Aim requires not moving this turn.";
  if (ability.id === "eldritchBlast" && state.mode !== "combat") return "Only usable in combat.";
  if (ability.id === "eldritchBlast" && visibleMonsters().length === 0) return "No visible target.";
  if (ability.potionBreathAction) {
    const status = (fighter.statusEffects ?? []).find((effect) => effect.id === ability.potionBreathAction.statusId);
    if (!status || (Number(status.potionBreath?.uses ?? 0) || 0) <= 0) return "No breath uses remaining.";
  }
  if (state.mode === "combat") {
    if (activeFighter()?.id !== fighter.id) return "Not this hero's turn.";
    if (ability.resource === "bonusAction" && !fighter.hasBonusAction) return "Bonus action already used.";
    if (ability.resource === "action" && !fighter.hasAction) return "Action already used.";
    if (ability.resource === "reaction" && !fighter.hasReaction) return "Reaction already used.";
    if (ability.id === "actionSurge" && fighter.hasAction) return "Use your action first.";
  }
  return "";
}

function hasSpentShortRestAbility(fighter) {
  return availableFighterAbilities(fighter).some((ability) => (fighter.abilityUses?.[ability.id] ?? 0) > 0 && ability.refresh === "shortRest");
}

function abilityFavoriteKey(ability) {
  return `ability:${ability?.id ?? ""}`;
}

function spellFavoriteKey(spell) {
  return `spell:${spell?.id ?? ""}`;
}

function heroAbilityFavorites(hero) {
  if (!hero) return [];
  hero.abilityFavorites = uniqueValues((hero.abilityFavorites ?? []).filter(Boolean));
  return hero.abilityFavorites;
}

function abilityIsFavorite(hero, key) {
  return heroAbilityFavorites(hero).includes(key);
}

function favoriteButtonMarkup(hero, key) {
  const active = abilityIsFavorite(hero, key);
  return `<button type="button" class="favorite-toggle ${active ? "active" : ""}" data-action="toggle-ability-favorite" data-favorite-key="${escapeAttribute(key)}" title="${active ? "Remove favorite" : "Add favorite"}" aria-label="${active ? "Remove favorite" : "Add favorite"}">${active ? "&hearts;" : "&#9825;"}</button>`;
}

function favoriteMoveButtonsMarkup(key, favoriteIndex = null, favoriteTotal = 0) {
  if (favoriteIndex === null) return "";
  return `
    <button type="button" class="favorite-move" data-action="move-ability-favorite" data-favorite-key="${escapeAttribute(key)}" data-direction="-1" ${favoriteIndex <= 0 ? "disabled" : ""} title="Move favorite up" aria-label="Move favorite up">↑</button>
    <button type="button" class="favorite-move" data-action="move-ability-favorite" data-favorite-key="${escapeAttribute(key)}" data-direction="1" ${favoriteIndex >= favoriteTotal - 1 ? "disabled" : ""} title="Move favorite down" aria-label="Move favorite down">↓</button>
  `;
}

function abilityCostLabel(ability) {
  if (ability?.resource === "bonusAction") return "Bonus Action";
  if (ability?.resource === "reaction") return "Reaction";
  if (ability?.resource === "action") return "Action";
  return "Free";
}

function favoriteHotkeyMarkup(index = null) {
  if (index === null || index < 0 || index > 8) return "";
  const key = String(index + 1);
  return `<small class="favorite-hotkey" aria-label="Shortcut ${key}">${key}</small>`;
}

function abilityRowMarkup(hero, ability, { favoriteIndex = null, favoriteTotal = 0, hotkeyIndex = null } = {}) {
  const used = abilityResourceSpent(hero, ability);
  const maxUses = abilityMaxUses(hero, ability);
  const unavailableReason = fighterAbilityUnavailableReason(hero, ability);
  const disabled = unavailableReason ? "disabled" : "";
  const buttonLabel = ability.id === "wildShape" && isWildShaped(hero) ? "Revert" : "Use";
  const favoriteKey = abilityFavoriteKey(ability);
  const passive = ability.resource === "passive";
  const atWill = ability.invocationOption && maxUses >= 99;
  const breathStatus = ability.potionBreathAction ? (hero.statusEffects ?? []).find((effect) => effect.id === ability.potionBreathAction.statusId) : null;
  const useText = passive ? "Passive." : ability.potionBreathAction ? `Uses: ${breathStatus?.potionBreath?.uses ?? 0}.` : atWill ? "At will." : `Uses: ${used}/${maxUses}.`;
  const actionMarkup = passive
    ? `<small class="ability-cost">Passive</small>`
    : `<button type="button" data-action="use-fighter-ability" data-ability="${escapeAttribute(ability.id)}" ${disabled}>${buttonLabel}</button>`;
  return `
    <div class="use-item-row">
      <div>
        <b>${favoriteHotkeyMarkup(hotkeyIndex)}${escapeHtml(ability.name)} <small class="ability-cost">${escapeHtml(abilityCostLabel(ability))}</small></b>
        <span>${escapeHtml(ability.description)} ${escapeHtml(useText)}</span>
        ${unavailableReason ? `<small class="ability-warning">${escapeHtml(unavailableReason)}</small>` : ""}
      </div>
      <div class="use-item-actions">
        ${favoriteMoveButtonsMarkup(favoriteKey, favoriteIndex, favoriteTotal)}
        ${favoriteButtonMarkup(hero, favoriteKey)}
        ${actionMarkup}
      </div>
    </div>
  `;
}

function spellRowMarkup(hero, spell, { favoriteIndex = null, favoriteTotal = 0, hotkeyIndex = null } = {}) {
  const castLevels = spellAvailableCastLevels(hero, spell);
  const favoriteKey = spellFavoriteKey(spell);
  const activeDismissible = activeDismissibleSpellEffect(hero, spell);
  const castButtons = activeDismissible
    ? `<button type="button" data-action="dismiss-spell-effect" data-spell="${escapeAttribute(spell.id)}">End</button>`
    : castLevels
      .map((castLevel) => {
        const castSpell = spellWithCastLevel(spell, castLevel);
        const disabled = canStartSpellCast(hero, castSpell) ? "" : "disabled";
        const upcast = castLevel > spellBaseLevel(spell) ? ` L${castLevel}` : "";
        return `<button type="button" data-action="cast-spell" data-spell="${escapeAttribute(spell.id)}" data-cast-level="${castLevel}" ${disabled}>${spellBaseLevel(spell) === 0 ? "Use" : `Cast${upcast}`}</button>`;
      })
      .join("");
  const costText = spellBaseLevel(spell) === 0 ? "At will" : castLevels.map((level) => `L${level}: ${spellPointCost(spellWithCastLevel(spell, level))} SP`).join(", ");
  const concentration = spell.concentration ? " Concentration." : "";
  const levelText = spellBaseLevel(spell) === 0 ? "Cantrip" : `L${spellBaseLevel(spell)}`;
  return `
    <div class="use-item-row">
      <div>
        <b>${favoriteHotkeyMarkup(hotkeyIndex)}${escapeHtml(spell.name)} <small>${escapeHtml(levelText)}</small></b>
        <span>${escapeHtml(spell.description)} ${escapeHtml(spellResourceLabel(spell))}.${concentration} Costs: ${escapeHtml(costText)}.</span>
      </div>
      <div class="use-item-actions">
        ${favoriteMoveButtonsMarkup(favoriteKey, favoriteIndex, favoriteTotal)}
        ${favoriteButtonMarkup(hero, favoriteKey)}
        ${castButtons}
      </div>
    </div>
  `;
}

let openAbilityMenuSections = null;

function abilityDetailsOpen(key, defaultOpen = false) {
  return openAbilityMenuSections ? openAbilityMenuSections.has(key) : defaultOpen;
}

function rememberOpenAbilityMenuSections() {
  if (els.abilitiesMenu?.classList.contains("hidden")) return;
  openAbilityMenuSections = new Set(
    Array.from(els.abilitiesBody.querySelectorAll("details[data-ability-section][open]"))
      .map((details) => details.dataset.abilitySection)
      .filter(Boolean),
  );
}

function abilityCategoryMarkup({ title, meta = "", rows = "", sectionKey, open = false, emptyText = "" }) {
  if (!rows && !emptyText) return "";
  const key = sectionKey ?? title;
  return `
    <details class="ability-category" data-ability-section="${escapeAttribute(key)}" ${abilityDetailsOpen(key, open) ? "open" : ""}>
      <summary>
        <span>${escapeHtml(title)}</span>
        ${meta ? `<small>${escapeHtml(meta)}</small>` : ""}
      </summary>
      <div class="use-item-list">${rows || `<p class="empty-note">${escapeHtml(emptyText)}</p>`}</div>
    </details>
  `;
}

function abilityMenuGroups(hero, entries, spells) {
  const classAbilityIds = new Set((getHeroTemplate(hero?.classId)?.abilities ?? []).map((ability) => ability.id));
  const subclassAbilityIds = new Set((subclassDefinitionForFighter(hero)?.abilities ?? []).map((ability) => ability.id));
  const groups = {
    class: [],
    subclass: [],
    racial: [],
    other: [],
  };
  for (const ability of entries) {
    if (ability.racialSpellId || ["dragonbornBreath", "goliathStoneEndurance"].includes(ability.id)) groups.racial.push(ability);
    else if (subclassAbilityIds.has(ability.id)) groups.subclass.push(ability);
    else if (classAbilityIds.has(ability.id)) groups.class.push(ability);
    else groups.other.push(ability);
  }
  const spellGroups = groupedSpellsByLevel(spells);
  return { ...groups, spellGroups };
}

function favoriteRowsForAbilityMenu(hero, entries, spells) {
  const abilitiesByKey = new Map(entries.map((ability) => [abilityFavoriteKey(ability), ability]));
  const spellsByKey = new Map(spells.map((spell) => [spellFavoriteKey(spell), spell]));
  const validFavorites = heroAbilityFavorites(hero).filter((key) => abilitiesByKey.has(key) || spellsByKey.has(key));
  return validFavorites
    .map((key, index) => {
      if (abilitiesByKey.has(key)) return abilityRowMarkup(hero, abilitiesByKey.get(key), { favoriteIndex: index, favoriteTotal: validFavorites.length });
      return spellRowMarkup(hero, spellsByKey.get(key), { favoriteIndex: index, favoriteTotal: validFavorites.length });
    })
    .join("");
}

function favoriteRowsForActionMenu(hero) {
  if (!hero) return "";
  const entries = availableFighterAbilities(hero);
  const spells = spellDefinitionsForFighter(hero);
  const abilitiesByKey = new Map(entries.map((ability) => [abilityFavoriteKey(ability), ability]));
  const spellsByKey = new Map(spells.map((spell) => [spellFavoriteKey(spell), spell]));
  const tacticsByKey = new Map(state.mode === "combat" ? combatTacticDefinitions(hero).map((tactic) => [tacticFavoriteKey(tactic.id), tactic]) : []);
  const validFavorites = heroAbilityFavorites(hero).filter((key) => abilitiesByKey.has(key) || spellsByKey.has(key) || tacticsByKey.has(key));
  return validFavorites
    .map((key, index) => {
      const options = { favoriteIndex: index, favoriteTotal: validFavorites.length, hotkeyIndex: index };
      if (abilitiesByKey.has(key)) return abilityRowMarkup(hero, abilitiesByKey.get(key), options);
      if (spellsByKey.has(key)) return spellRowMarkup(hero, spellsByKey.get(key), options);
      return tacticRowMarkup(hero, tacticsByKey.get(key), options);
    })
    .join("");
}

function favoriteActionCount(hero) {
  if (!hero) return 0;
  const entries = availableFighterAbilities(hero);
  const spells = spellDefinitionsForFighter(hero);
  const validKeys = new Set([
    ...entries.map(abilityFavoriteKey),
    ...spells.map(spellFavoriteKey),
    ...(state.mode === "combat" ? combatTacticDefinitions(hero).map((tactic) => tacticFavoriteKey(tactic.id)) : []),
  ]);
  return heroAbilityFavorites(hero).filter((key) => validKeys.has(key)).length;
}

function useFavoriteActionByIndex(index) {
  if (!gameHasStarted || !els.favoriteActionsMenu || !els.favoriteActionsBody || index < 0) return false;
  if (els.favoriteActionsMenu.classList.contains("hidden")) showFavoriteActionsMenu();
  else renderFavoriteActionsMenu();
  const rows = Array.from(els.favoriteActionsBody.querySelectorAll(".favorite-action-list > .use-item-row, .favorite-action-list > .action-option-row"));
  const row = rows[index];
  if (!row) return false;
  const actionButton = Array.from(row.querySelectorAll("button")).find((button) =>
    !button.disabled && ["use-fighter-ability", "cast-spell", "dismiss-spell-effect", "combat-action", "grab-target"].includes(button.dataset.action),
  );
  if (!actionButton) return false;
  actionButton.click();
  return true;
}

function abilityMenuHero() {
  return window.DepthboundPlaytest?.role === "guest"
    ? window.DepthboundPlaytest.selectedHero?.() ?? (state.mode === "combat" ? activeFighter() : activeHero())
    : state.mode === "combat" ? activeFighter() : activeHero();
}

function renderAbilitiesMenu() {
  rememberOpenAbilityMenuSections();
  const hero = abilityMenuHero();
  const entries = availableFighterAbilities(hero);
  const spells = spellDefinitionsForFighter(hero);
  const groups = abilityMenuGroups(hero, entries, spells);
  const favoriteRows = favoriteRowsForAbilityMenu(hero, entries, spells);
  const abilityFavoriteKeys = new Set([...entries.map(abilityFavoriteKey), ...spells.map(spellFavoriteKey)]);
  const abilityFavoriteCount = heroAbilityFavorites(hero).filter((key) => abilityFavoriteKeys.has(key)).length;
  const spellbookRows = Array.from(groups.spellGroups.entries())
    .map(
      ([level, levelSpells]) => `
        <details class="ability-spell-level" data-ability-section="spell-level:${level}" ${abilityDetailsOpen(`spell-level:${level}`, false) ? "open" : ""}>
          <summary>${escapeHtml(spellLevelLabel(level))} <small>${levelSpells.length}</small></summary>
          <div class="use-item-list">${levelSpells.map((spell) => spellRowMarkup(hero, spell)).join("")}</div>
        </details>
      `,
    )
    .join("");
  els.abilitiesBody.innerHTML = entries.length || spells.length
    ? `
      <div class="ability-category-list">
        ${abilityCategoryMarkup({ title: "Favourites", sectionKey: "favorites", meta: `${abilityFavoriteCount}`, rows: favoriteRows, open: true, emptyText: "Heart abilities or spells below to pin them here." })}
        ${abilityCategoryMarkup({ title: "Class Abilities", sectionKey: "class", meta: `${groups.class.length}`, rows: groups.class.map((ability) => abilityRowMarkup(hero, ability)).join("") })}
        ${abilityCategoryMarkup({ title: "Subclass Abilities", sectionKey: "subclass", meta: `${groups.subclass.length}`, rows: groups.subclass.map((ability) => abilityRowMarkup(hero, ability)).join("") })}
        ${abilityCategoryMarkup({ title: "Racial Abilities", sectionKey: "racial", meta: `${groups.racial.length}`, rows: groups.racial.map((ability) => abilityRowMarkup(hero, ability)).join("") })}
        ${abilityCategoryMarkup({ title: "Spellbook", sectionKey: "spellbook", meta: `${spells.length} spells - ${hero.spellPoints ?? 0}/${hero.spellPointMax ?? 0} SP`, rows: spellbookRows })}
        ${abilityCategoryMarkup({ title: "Other Abilities", sectionKey: "other", meta: `${groups.other.length}`, rows: groups.other.map((ability) => abilityRowMarkup(hero, ability)).join("") })}
      </div>
    `
    : `<p class="empty-note">No extra abilities or spells available yet.</p>`;
}

function trackAbilityMenuSectionToggle(target) {
  const details = target?.closest?.("details[data-ability-section]");
  if (!details) return;
  const key = details.dataset.abilitySection;
  if (!key) return;
  if (!openAbilityMenuSections) openAbilityMenuSections = new Set(["favorites"]);
  window.setTimeout(() => {
    if (details.open) openAbilityMenuSections.add(key);
    else openAbilityMenuSections.delete(key);
  }, 0);
}

function toggleAbilityFavorite(key) {
  const hero = abilityMenuHero();
  if (!hero || !key) return;
  const favorites = heroAbilityFavorites(hero);
  hero.abilityFavorites = favorites.includes(key)
    ? favorites.filter((entry) => entry !== key)
    : [...favorites, key];
  if (!els.abilitiesMenu.classList.contains("hidden")) renderAbilitiesMenu();
  if (!els.actionMenu.classList.contains("hidden")) renderActionMenu();
  if (!els.favoriteActionsMenu.classList.contains("hidden")) renderFavoriteActionsMenu();
  render();
}

function moveAbilityFavorite(key, direction) {
  const hero = abilityMenuHero();
  const favorites = heroAbilityFavorites(hero);
  const from = favorites.indexOf(key);
  const to = Math.max(0, Math.min(favorites.length - 1, from + direction));
  if (from < 0 || from === to) return;
  const next = [...favorites];
  const [entry] = next.splice(from, 1);
  next.splice(to, 0, entry);
  hero.abilityFavorites = next;
  if (!els.abilitiesMenu.classList.contains("hidden")) renderAbilitiesMenu();
  if (!els.actionMenu.classList.contains("hidden")) renderActionMenu();
  if (!els.favoriteActionsMenu.classList.contains("hidden")) renderFavoriteActionsMenu();
  render();
}

function showAbilitiesMenu() {
  openAbilityMenuSections = null;
  renderAbilitiesMenu();
  els.abilitiesMenu.classList.remove("hidden");
}

function hideAbilitiesMenu() {
  els.abilitiesMenu.classList.add("hidden");
  openAbilityMenuSections = null;
}

function renderFavoriteActionsMenu() {
  const hero = abilityMenuHero();
  const rows = favoriteRowsForActionMenu(hero);
  els.favoriteActionsBody.innerHTML = rows
    ? `<div class="ability-category-list favorite-action-list">${rows}</div>`
    : `<p class="empty-note">Heart abilities, spells, or tactics to pin them here.</p>`;
}

function showFavoriteActionsMenu() {
  renderFavoriteActionsMenu();
  els.favoriteActionsMenu.classList.remove("hidden");
}

function hideFavoriteActionsMenu() {
  els.favoriteActionsMenu.classList.add("hidden");
}

let homeMenuPanel = "main";

function availableLocalCustomDungeons() {
  return window.DungeonCustom?.list?.() ?? [];
}

function availableOneShotDungeons() {
  return window.DungeonOneShots?.list?.() ?? [];
}

function completedOneShotDungeons() {
  const completed = state.questFlags?.oneShotDungeonCompletions;
  return completed && typeof completed === "object" && !Array.isArray(completed) ? completed : {};
}

function completedDungeonCount() {
  const campaignCompletions = Object.values(state.campaignProgress ?? {}).reduce(
    (sum, value) => sum + Math.max(0, Math.floor(Number(value) || 0)),
    0,
  );
  return campaignCompletions + Object.keys(completedOneShotDungeons()).length;
}

function shouldShowHomeObjectiveChip() {
  if (!gameHasStarted || state.completed || state.mode !== "home") return false;
  const highestHeroLevel = Math.max(1, ...partyHeroes().map((hero) => Number(hero.level) || 1));
  return highestHeroLevel < 2 && completedDungeonCount() < 1;
}

function setHomeMenuPanel(panel = "main") {
  homeMenuPanel = panel === "custom-dungeons" && availableLocalCustomDungeons().length === 0 ? "adventure" : panel;
  renderHomeAdventurePanels();
}

function homeMenuTitleForPanel(panel = homeMenuPanel) {
  if (panel === "adventure") return "Choose Adventure";
  if (panel === "main-story") return "Main Story";
  if (panel === "one-shot-dungeons") return "One-Shot Dungeons";
  if (panel === "random-dungeons") return "Random Runs";
  if (panel === "custom-dungeons") return "Custom Dungeons";
  return "Home";
}

function campaignProgressText(campaignId, count) {
  return `${state.campaignProgress?.[campaignId] ?? 0}/${count}`;
}

function renderHomeAdventurePanels() {
  const customDungeons = availableLocalCustomDungeons();
  const oneShotDungeons = availableOneShotDungeons();
  const oneShotCompletions = completedOneShotDungeons();
  if (homeMenuPanel === "custom-dungeons" && customDungeons.length === 0) homeMenuPanel = "adventure";
  const panels = {
    main: els.homeMainActions,
    adventure: els.homeAdventureActions,
    "main-story": els.homeMainStoryActions,
    "one-shot-dungeons": els.homeOneShotDungeonActions,
    "random-dungeons": els.homeRandomDungeonActions,
    "custom-dungeons": els.homeCustomDungeonActions,
  };
  Object.entries(panels).forEach(([key, panel]) => panel?.classList.toggle("hidden", key !== homeMenuPanel));
  if (els.homeMenuTitle) els.homeMenuTitle.textContent = homeMenuTitleForPanel();
  const barrowCompleted = state.campaignProgress?.["barrow-crown"] ?? 0;
  const thornwoodCompleted = state.campaignProgress?.["thornwood-pact"] ?? 0;
  const emberveinCompleted = state.campaignProgress?.["embervein-first-claim"] ?? 0;
  const smithyCompleted = state.campaignProgress?.["dwarven-smithy-ember-oath"] ?? 0;
  const smithyUnlocked = window.DungeonCampaigns?.isUnlocked?.("dwarven-smithy-ember-oath", state) ?? false;
  els.goBarrowCrown?.querySelector("[data-campaign-progress]")?.replaceChildren(document.createTextNode(`${barrowCompleted}/7`));
  els.goThornwoodPact?.querySelector("[data-campaign-progress]")?.replaceChildren(document.createTextNode(`${thornwoodCompleted}/8`));
  els.goEmberveinFirstClaim?.querySelector("[data-campaign-progress]")?.replaceChildren(document.createTextNode(`${emberveinCompleted}/1`));
  els.goDwarvenSmithyEmberOath?.querySelector("[data-campaign-progress]")?.replaceChildren(document.createTextNode(`${smithyCompleted}/8`));
  els.goDwarvenSmithyEmberOath?.classList.toggle("hidden", !smithyUnlocked);
  els.homeAdventureActions?.querySelector('[data-home-menu="custom-dungeons"]')?.classList.toggle("hidden", customDungeons.length === 0);

  if (els.homeOneShotDungeonActions) {
    els.homeOneShotDungeonActions.innerHTML = `
      ${oneShotDungeons
        .map((dungeon) => {
          const completed = Boolean(oneShotCompletions[dungeon.id]);
          return `<button type="button" data-one-shot-dungeon-id="${escapeAttribute(dungeon.id)}"><span>${escapeHtml(dungeon.name)}</span>${completed ? "<small>✓</small>" : ""}</button>`;
        })
        .join("")}
      <hr />
      <button type="button" data-home-menu="adventure">Back</button>
    `;
  }

  if (els.homeRandomDungeonActions) {
    const themes = window.DungeonContent
      .list("themes")
      .filter((theme) => !theme.hidden)
      .sort((a, b) => a.name.localeCompare(b.name));
    els.homeRandomDungeonActions.innerHTML = `
      ${themes
        .map(
          (theme) => `
            <button type="button" class="random-dungeon-theme-button" data-random-dungeon-theme="${escapeAttribute(theme.id)}">
              <span>${escapeHtml(theme.name)}</span>
              ${theme.description ? `<small>${escapeHtml(theme.description)}</small>` : ""}
            </button>
          `,
        )
        .join("")}
      <hr />
      <button type="button" data-home-menu="adventure">Back</button>
    `;
  }

  if (els.homeCustomDungeonActions) {
    els.homeCustomDungeonActions.innerHTML = `
      ${
        customDungeons.length
          ? customDungeons.map((dungeon) => `<button type="button" data-custom-dungeon-id="${escapeAttribute(dungeon.id)}">${escapeHtml(dungeon.name)}</button>`).join("")
          : `<p class="small-note">No local custom dungeons saved yet.</p>`
      }
      <hr />
      <button type="button" data-home-menu="adventure">Back</button>
    `;
  }
}

function showHomeMenu() {
  maybeUnlockNpcProgress();
  const hero = activeHero();
  const canTrain = canTrainAsSidekick(hero);
  const canReplaceCompanion = canReplaceDeadBeastMasterCompanion(hero);
  els.levelPanel?.classList.toggle("hidden", isAutonomousAlly(hero));
  els.levelUp.textContent = canTrain ? "Train" : "Level Up";
  els.levelUp.disabled = !canTrain && !canLevelUp(hero);
  els.replaceRangerCompanion?.classList.toggle("hidden", !canReplaceCompanion);
  if (els.replaceRangerCompanion) els.replaceRangerCompanion.disabled = !canReplaceCompanion;
  setHomeMenuPanel("main");
  els.homeMenu.classList.remove("hidden");
  maybeTriggerNpcArrivals();
}

function hideHomeMenu() {
  els.homeMenu.classList.add("hidden");
  homeMenuPanel = "main";
}

function villageNpcs() {
  return (window.DungeonContent.list("npcs") ?? [])
    .filter((npc) => npc.village)
    .filter((npc) => !npc.village?.hiddenUntilUnlocked || npcIsUnlocked(npc))
    .sort((a, b) => (a.village?.order ?? 999) - (b.village?.order ?? 999) || a.name.localeCompare(b.name));
}

function npcIsUnlocked(npc) {
  if (npc?.village?.adminAvailable && adminEnabled()) return true;
  if (npc?.village?.unlocked === false) return false;
  const flag = npc?.village?.unlockFlag;
  return !flag || Boolean(state?.storyFlags?.[flag] || state?.campaignFlags?.[flag] || state?.questFlags?.[flag]);
}

function npcEntryLine(npc) {
  const lines = npc?.dialogue?.entryLines ?? [];
  if (!lines.length) return "";
  return lines[Math.floor(Math.random() * lines.length)];
}

function npcPortraitMarkup(npc, className = "npc-portrait", { clickable = true } = {}) {
  const fallback = npc?.token?.fallbackLabel ?? npc?.name?.slice(0, 2).toUpperCase() ?? "?";
  const src = npc?.portrait;
  const tag = clickable ? "button" : "div";
  const actionAttributes = clickable ? ` type="button" data-action="inspect-npc" data-npc="${escapeAttribute(npc.id)}" title="Inspect ${escapeAttribute(npc.name ?? "merchant")}"` : "";
  if (!src) return `<${tag} class="${className} ${clickable ? "npc-portrait-button" : ""} empty"${actionAttributes}><span>${escapeHtml(fallback)}</span></${tag}>`;
  return `
    <${tag} class="${className} ${clickable ? "npc-portrait-button" : ""}"${actionAttributes}>
      <img src="${escapeAttribute(src)}" alt="" onerror="const parent=this.parentElement; this.remove(); if(parent){ parent.classList.add('empty'); parent.innerHTML='<span>${escapeAttribute(fallback)}</span>'; }" />
    </${tag}>
  `;
}

function villageNpcIconMarkup(npc) {
  const fallback = npc?.token?.fallbackLabel ?? npc?.name?.slice(0, 2).toUpperCase() ?? "?";
  const factionSymbol = factionSymbolDefinitions[npc?.id];
  if (factionSymbol?.src) {
    return `
      <span class="village-entry-icon village-faction-symbol" title="${escapeAttribute(factionSymbol.name)} symbol">
        <img src="${escapeAttribute(factionSymbol.src)}" alt="" onerror="const parent=this.parentElement; this.remove(); if(parent){ parent.classList.add('empty'); parent.textContent='${escapeAttribute(factionSymbol.fallback ?? fallback)}'; }" />
      </span>
    `;
  }
  const src = npc?.portrait;
  if (!src) return `<span class="village-entry-icon empty">${escapeHtml(fallback)}</span>`;
  return `
    <span class="village-entry-icon">
      <img src="${escapeAttribute(src)}" alt="" onerror="const parent=this.parentElement; this.remove(); if(parent){ parent.classList.add('empty'); parent.textContent='${escapeAttribute(fallback)}'; }" />
    </span>
  `;
}

function villageNpcGroup(npc) {
  const id = npc?.id ?? "";
  if (["monster-guild", "gravebinders", "crucible-collegium", "antiquarian-society", "expedition-board", "boom-club", "fighting-pit"].includes(id)) {
    return { id: "guilds", title: "Guilds & Boards", note: "Faction boards, arena work, and reputation paths.", order: 30 };
  }
  if (["alchemist", "arcanist", "grumpy-wizard", "apothecary"].includes(id)) {
    return { id: "arcane", title: "Arcane & Care", note: "Magic, alchemy, treatment, and stranger services.", order: 20 };
  }
  return { id: "shops", title: "Shops & Services", note: "Everyday gear, weapons, armor, and practical supplies.", order: 10 };
}

function villageNpcTypeLabel(npc) {
  if (["monster-guild", "gravebinders", "crucible-collegium", "antiquarian-society", "expedition-board", "boom-club", "fighting-pit"].includes(npc?.id)) return "Faction";
  if (npc?.shop?.type) return "Shop";
  return "Service";
}

function villageMusicKeyForNpc(npcId) {
  if (!["monster-guild", "gravebinders", "crucible-collegium", "antiquarian-society", "expedition-board", "boom-club", "fighting-pit"].includes(npcId)) return "";
  return `village:${npcId}`;
}

function setVillageMusicKey(key = "") {
  activeVillageMusicKey = key;
  updateBackgroundMusic();
}

function resetVillageScroll() {
  if (els.villageBody) els.villageBody.scrollTop = 0;
}

function setVillageBackButtonVisible(visible) {
  els.backVillageList?.classList.toggle("hidden", !visible);
}

const factionSymbolDefinitions = {
  "monster-guild": { name: "Trophy Lodge", src: "assets/factions/trophy-lodge-symbol.png", fallback: "TL" },
  gravebinders: { name: "The Gravebinders", src: "assets/factions/gravebinders-symbol.png", fallback: "GB" },
  "crucible-collegium": { name: "Crucible Collegium", src: "assets/factions/crucible-collegium-symbol.png", fallback: "CC" },
  "antiquarian-society": { name: "Antiquarian Society", src: "assets/factions/antiquarian-society-symbol.png", fallback: "AS" },
  "expedition-board": { name: "Expedition Board", src: "assets/factions/expedition-board-symbol.png", fallback: "EB" },
  "boom-club": { name: "Fizzwick's Boom Club", src: "assets/factions/boom-club-symbol.png", fallback: "BC" },
  "fighting-pit": { name: "Fighting Pit", src: "assets/factions/fighting-pit-symbol.png", fallback: "FP" },
};

function factionSymbolMarkup(factionId, className = "guild-symbol") {
  const symbol = factionSymbolDefinitions[factionId];
  const fallback = symbol?.fallback ?? String(factionId ?? "?").slice(0, 2).toUpperCase();
  const label = symbol?.name ?? "Faction";
  if (!symbol?.src) return `<div class="${className} empty" title="${escapeAttribute(label)} symbol"><span>${escapeHtml(fallback)}</span></div>`;
  return `
    <div class="${className}" title="${escapeAttribute(label)} symbol">
      <img src="${escapeAttribute(symbol.src)}" alt="" onerror="const parent=this.parentElement; this.remove(); if(parent){ parent.classList.add('empty'); parent.innerHTML='<span>${escapeAttribute(fallback)}</span>'; }" />
    </div>
  `;
}

function guildNpcNameButtonMarkup(npc, fallbackName = "Faction Contact") {
  const npcId = npc?.id ?? "";
  const name = npc?.name ?? fallbackName;
  return `
    <button class="guild-npc-name-button" type="button" data-action="inspect-npc" data-npc="${escapeAttribute(npcId)}" title="Inspect ${escapeAttribute(name)}">
      ${escapeHtml(name)}
    </button>
  `;
}

function villageNpcCardMarkup(npc) {
  const unlocked = npcIsUnlocked(npc);
  const label = npc.village?.label ?? npc.title ?? npc.name;
  const description = unlocked ? npc.village?.description ?? npc.description ?? npc.name : npc.village?.lockText ?? "Locked";
  return `
    <button class="village-entry-card" type="button" data-action="visit-village-npc" data-npc="${escapeAttribute(npc.id)}" ${unlocked ? "" : "disabled"}>
      ${villageNpcIconMarkup(npc)}
      <span class="village-entry-copy">
        <b>${escapeHtml(label)}</b>
        <small>${escapeHtml(description)}</small>
      </span>
      <span class="village-entry-meta">
        <em>${escapeHtml(villageNpcTypeLabel(npc))}</em>
        <i aria-hidden="true">›</i>
      </span>
    </button>
  `;
}

function showNpcInspection(npcId = activeStoreNpcId) {
  const npc = window.DungeonContent.get("npcs", npcId);
  if (!npc) return;
  els.gameDialogTitle.textContent = npc.title ?? npc.name ?? "Merchant";
  els.gameDialogMessage.innerHTML = `
    <section class="npc-inspection">
      ${npcPortraitMarkup(npc, "npc-inspection-portrait", { clickable: false })}
      <div>
        <b>${escapeHtml(npc.title ?? "Merchant")}</b>
        <span>Name: ${escapeHtml(npc.name ?? "Unknown")}</span>
      </div>
      <p>${escapeHtml(npc.inspection ?? npc.description ?? "")}</p>
    </section>
  `;
  els.gameDialogField.classList.add("hidden");
  els.gameDialogActions.innerHTML = `<button type="button" data-dialog-action="close-npc-inspection">Close</button>`;
  const cleanup = () => {
    els.gameDialogActions.removeEventListener("click", handleClick);
    els.gameDialog.classList.add("hidden");
    activeDialogCancel = null;
  };
  const handleClick = (event) => {
    if (event.target.closest("[data-dialog-action='close-npc-inspection']")) cleanup();
  };
  els.gameDialogActions.addEventListener("click", handleClick);
  activeDialogCancel = cleanup;
  els.gameDialog.classList.remove("hidden");
}

function renderVillageMenu() {
  els.villageMenu?.classList.remove("npc-chat-open", "guild-open");
  els.villageMenu?.classList.add("village-index-open");
  setVillageBackButtonVisible(false);
  setVillageMusicKey("");
  const npcs = villageNpcs();
  const graveyardCount = deadRosterHeroes().length;
  const groups = new Map();
  for (const npc of npcs) {
    const group = villageNpcGroup(npc);
    if (!groups.has(group.id)) groups.set(group.id, { ...group, entries: [] });
    groups.get(group.id).entries.push(npc);
  }
  const groupedEntries = Array.from(groups.values()).sort((a, b) => a.order - b.order);
  els.villageBody.innerHTML = `
    <section class="village-directory">
      <header class="village-directory-hero">
        <div>
          <span>Village Directory</span>
          <h3>Choose a place to visit</h3>
          <p>Shops, healers, guild halls, job boards, and the village records are grouped by what they do.</p>
        </div>
        <button type="button" data-action="close-village">Back</button>
      </header>
      <section class="village-directory-section village-directory-memorial">
        <div class="village-section-heading">
          <div>
            <span>Records</span>
            <h3>Memorials</h3>
          </div>
          <small>${escapeHtml(graveyardCount ? `${graveyardCount} recorded` : "Clear")}</small>
        </div>
        <button class="village-entry-card graveyard-card" type="button" data-action="open-graveyard">
          <span class="village-entry-icon empty">GY</span>
          <span class="village-entry-copy">
            <b>Graveyard</b>
            <small>${graveyardCount ? `${graveyardCount} dead companion${graveyardCount === 1 ? "" : "s"} in memory or keeping` : "No dead companions"}</small>
          </span>
          <span class="village-entry-meta"><em>Records</em><i aria-hidden="true">›</i></span>
        </button>
      </section>
      ${groupedEntries
        .map(
          (group) => `
            <section class="village-directory-section village-group-${escapeAttribute(group.id)}">
              <div class="village-section-heading">
                <div>
                  <span>${escapeHtml(group.note)}</span>
                  <h3>${escapeHtml(group.title)}</h3>
                </div>
                <small>${escapeHtml(group.entries.length)} place${group.entries.length === 1 ? "" : "s"}</small>
              </div>
              <div class="village-entry-grid">
                ${group.entries.map(villageNpcCardMarkup).join("")}
              </div>
            </section>
          `,
        )
        .join("")}
    </section>
  `;
}

function graveyardCorpseMarkup(corpse) {
  const status = corpseDecompositionStatus(corpse);
  const reviveButtons = corpseSpellButtons(corpse, ["revivify", "raise-dead", "resurrection", "true-resurrection"], { requireBase: true });
  const preserveButtons = corpseSpellButtons(corpse, ["gentle-repose"], { requireBase: true });
  const location = heroCorpseLocation(corpse) === "base" ? "At base" : "Still in dungeon";
  return `
    <section class="graveyard-entry">
      <div>
        <b>${escapeHtml(corpse.name)}</b>
        <span>${escapeHtml(`${location} - ${status.label}`)}</span>
        <small>${escapeHtml(status.detail)}</small>
      </div>
      <div class="object-actions">
        ${preserveButtons || ""}
        ${reviveButtons || ""}
      </div>
      <details>
        <summary>Belongings</summary>
        ${corpseLootRows(corpse, heroCorpseLocation(corpse) === "base")}
      </details>
    </section>
  `;
}

function renderGraveyardMenu() {
  els.villageMenu?.classList.remove("npc-chat-open", "guild-open", "village-index-open");
  setVillageBackButtonVisible(true);
  setVillageMusicKey("");
  const dead = deadRosterHeroes();
  els.villageBody.innerHTML = `
    <p class="empty-note">Dead companions can be preserved, looted, or restored here once their body has been sent home.</p>
    <section class="graveyard-list">
      ${dead.length ? dead.map(graveyardCorpseMarkup).join("") : `<p class="empty-note">No dead companions are recorded.</p>`}
    </section>
  `;
  resetVillageScroll();
}

function showVillageMenu() {
  hideHomeMenu();
  renderVillageMenu();
  els.villageMenu.classList.remove("hidden");
}

function hideVillageMenu() {
  setVillageMusicKey("");
  setVillageBackButtonVisible(false);
  els.villageMenu.classList.add("hidden");
}

function visitVillageNpc(npcId) {
  const npc = window.DungeonContent.get("npcs", npcId);
  if (!npc || !npcIsUnlocked(npc)) return;
  els.villageMenu?.classList.remove("village-index-open");
  if (npc.shop?.type) {
    showStoreMenu(npc.id);
    return;
  }
  const behavior = npcBehavior(npc.id);
  if (behavior?.visit) {
    setVillageBackButtonVisible(true);
    behavior.visit(npc);
    return;
  }
  renderVillageMenu();
}

function npcBehavior(npcId) {
  return window.DungeonNpcBehaviors?.[npcId] ?? null;
}

function acceptNpcQuest(npcId, questId) {
  npcBehavior(npcId)?.acceptQuest?.(questId);
}

function completeNpcQuest(npcId, questId) {
  npcBehavior(npcId)?.completeQuest?.(questId);
}

function cancelNpcQuest(npcId, questId) {
  return npcBehavior(npcId)?.cancelQuest?.(questId) ?? false;
}

function adminCampaignProgressEntries() {
  return (window.DungeonCampaigns?.list?.() ?? [])
    .filter((campaign) => !campaign.hidden && campaign.count > 0)
    .flatMap((campaign) => {
      const count = Math.max(0, Math.floor(Number(campaign.count) || 0));
      const completed = Math.max(0, Math.min(count, Math.floor(Number(state?.campaignProgress?.[campaign.id]) || 0)));
      return Array.from({ length: count + 1 }, (_, index) => ({
        id: String(index),
        action: "set-admin-campaign-progress",
        campaignId: campaign.id,
        campaignName: campaign.name,
        groupId: `campaign-${campaign.id}`,
        groupLabel: `Main Story - ${campaign.name}`,
        label: index === 0 ? "Not Started" : index >= count ? "Complete" : `Dungeon ${index} Complete`,
        description: `${index}/${count} campaign dungeons marked complete`,
        active: completed === index,
      }));
    });
}

function setAdminCampaignProgress(campaignId, progressValue) {
  if (!adminEnabled()) return;
  const campaign = window.DungeonCampaigns?.get?.(campaignId);
  if (!campaign) return;
  const count = Math.max(0, Math.floor(Number(campaign.count) || 0));
  const progress = Math.max(0, Math.min(count, Math.floor(Number(progressValue) || 0)));
  state.campaignProgress = { ...(state.campaignProgress ?? {}), [campaignId]: progress };
  addLog(`Admin set ${campaign.name} progress to ${progress}/${count}.`, "important");
}

function npcAdminProgressEntries() {
  return Object.values(window.DungeonNpcBehaviors ?? {})
    .flatMap((behavior) => behavior.adminProgressEntries?.() ?? [])
    .filter(Boolean);
}

function setNpcAdminProgress(npcId, progressId) {
  if (!adminEnabled()) return;
  npcBehavior(npcId)?.setAdminProgress?.(progressId);
}

function returnToNpcVisit(npcId) {
  npcBehavior(npcId)?.returnToVisit?.();
}

function startNpcChat(npcId, chatStateId) {
  npcBehavior(npcId)?.startChat?.(chatStateId);
}

function useNpcChatOption(npcId, chatStateId, optionId) {
  npcBehavior(npcId)?.useChatOption?.(chatStateId, optionId);
}

function maybeUnlockNpcProgress() {
  return Object.values(window.DungeonNpcBehaviors ?? {}).some((behavior) => behavior.maybeUnlockFromProgress?.());
}

function maybeTriggerNpcArrivals() {
  return Object.values(window.DungeonNpcBehaviors ?? {}).some((behavior) => behavior.maybeTriggerArrival?.());
}

function handleNpcDungeonComplete(context) {
  return Object.values(window.DungeonNpcBehaviors ?? {}).some((behavior) => behavior.onDungeonComplete?.(context));
}

function recordNpcMonsterKill(monster) {
  for (const behavior of Object.values(window.DungeonNpcBehaviors ?? {})) behavior.recordMonsterKill?.(monster);
}

const monsterHunterGuildId = "monster-guild";
const monsterHunterStateKey = "monsterHunterGuild";
const monsterHunterRanks = [
  { name: "Stranger", threshold: 0, reward: "The lodge will post basic beast contracts." },
  { name: "Associate", threshold: 25, reward: "Hunter notes mark contracted beasts more clearly in the quest log." },
  { name: "Trusted Hunter", threshold: 75, reward: "Kessa opens better trophy rates and harder warrants." },
  { name: "Trophy Warden", threshold: 150, reward: "The lodge treats the party as proven monster specialists." },
  { name: "Guild Agent", threshold: 300, reward: "Reserved for future elite hunts and named monster warrants." },
];
const monsterHunterContracts = [
  {
    id: "wolf-trouble",
    name: "Wolf Trouble",
    group: "Beast Hunts",
    summary: "Cull dangerous beasts before they learn village roads.",
    objective: { type: "killTag", tag: "beast", count: 5, label: "Beasts slain" },
    rewardCp: 7500,
    reputation: 25,
    minRank: 0,
  },
  {
    id: "fang-ledger",
    name: "Fang Ledger",
    group: "Beast Hunts",
    summary: "The Lodge wants enough clean kills to compare bite marks, claw marks, and ambush patterns.",
    objective: { type: "killTag", tag: "beast", count: 10, label: "Beasts documented" },
    rewardCp: 12500,
    reputation: 40,
    minRank: 1,
  },
  {
    id: "big-game-warrant",
    name: "Big Game Warrant",
    group: "Warrants",
    summary: "Bring down elite quarry: bosses, huge beasts, or anything with enough muscle to become a tavern lie.",
    objective: { type: "killBigGame", count: 2, label: "Large quarry slain" },
    rewardCp: 22500,
    reputation: 70,
    minRank: 2,
  },
];
const monsterHunterTurnIns = [
  {
    id: "fangs-and-claws",
    name: "Fangs and Claws",
    summary: "Clean points, intact roots, and no campfire scorch marks.",
    requirement: { type: "component", tagsAll: ["beast"], tagsAny: ["fang", "claw"] },
    quantity: 4,
    rewardCp: 3500,
    reputation: 8,
  },
  {
    id: "good-hides",
    name: "Good Hides",
    summary: "Usable hide from beasts that were inconsiderate enough to grow armor.",
    requirement: { itemId: "beast-hide" },
    quantity: 3,
    rewardCp: 4500,
    reputation: 10,
  },
  {
    id: "venom-proof",
    name: "Venom Proof",
    summary: "Sealed glands only. Mara will not pay extra for panic.",
    requirement: { itemId: "venom-gland" },
    quantity: 2,
    rewardCp: 7000,
    reputation: 14,
  },
  {
    id: "trophy-table",
    name: "Trophy Table",
    summary: "Anything suitable for the lodge wall, charm-makers, or a very specific warning label.",
    requirement: { type: "component", tagsAll: ["monster-part"], tagsAny: ["trophy", "horn", "antler", "scale", "shell"] },
    quantity: 3,
    rewardCp: 8000,
    reputation: 16,
  },
];

function monsterHunterProgress() {
  state.questFlags = { ...(state.questFlags ?? {}) };
  state.questFlags[monsterHunterStateKey] ??= {};
  const progress = state.questFlags[monsterHunterStateKey];
  progress.reputation = Math.max(0, Math.floor(Number(progress.reputation) || 0));
  progress.contracts ??= {};
  progress.completedContracts ??= {};
  progress.turnIns ??= {};
  return progress;
}

function monsterHunterRank(progress = monsterHunterProgress()) {
  const reputation = Math.max(0, Math.floor(Number(progress.reputation) || 0));
  let rank = 0;
  monsterHunterRanks.forEach((entry, index) => {
    if (reputation >= entry.threshold) rank = index;
  });
  return rank;
}

function monsterHunterNextRank(rank = monsterHunterRank()) {
  return monsterHunterRanks[rank + 1] ?? null;
}

function monsterHunterContractState(contractId) {
  const progress = monsterHunterProgress();
  progress.contracts[contractId] ??= { status: "available", progress: 0 };
  return progress.contracts[contractId];
}

function monsterHunterContractReady(contract) {
  const contractState = monsterHunterContractState(contract.id);
  const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
  return contractState.status === "accepted" && Math.max(0, Math.floor(Number(contractState.progress) || 0)) >= target;
}

function monsterHunterContractUnlocked(contract) {
  return monsterHunterRank() >= Math.max(0, Math.floor(Number(contract.minRank) || 0));
}

function monsterHunterObjectiveText(contract) {
  const objective = contract.objective ?? {};
  const contractState = monsterHunterContractState(contract.id);
  const target = Math.max(1, Math.floor(Number(objective.count) || 1));
  const progress = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)));
  return `${objective.label ?? "Objective"}: ${progress}/${target}`;
}

function monsterHunterTurnInReady(turnIn) {
  return materialCountForRequirement(turnIn.requirement) >= Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
}

function monsterHunterRankBarMarkup(progress = monsterHunterProgress()) {
  const rank = monsterHunterRank(progress);
  const current = monsterHunterRanks[rank] ?? monsterHunterRanks[0];
  const next = monsterHunterNextRank(rank);
  const currentThreshold = current?.threshold ?? 0;
  const nextThreshold = next?.threshold ?? currentThreshold;
  const span = Math.max(1, nextThreshold - currentThreshold);
  const filled = next ? Math.min(100, Math.max(0, ((progress.reputation - currentThreshold) / span) * 100)) : 100;
  return `
    <section class="guild-status">
      <div>
        <span>Rank</span>
        <b>${escapeHtml(current?.name ?? "Stranger")}</b>
      </div>
      <div>
        <span>Reputation</span>
        <b>${escapeHtml(progress.reputation)}${next ? ` / ${escapeHtml(next.threshold)}` : "+"}</b>
      </div>
      <div class="guild-rep-track" aria-hidden="true"><i style="width: ${escapeAttribute(filled.toFixed(1))}%"></i></div>
      <p>${escapeHtml(next ? `Next: ${next.name} - ${next.reward}` : current?.reward ?? "The lodge knows your name.")}</p>
    </section>
  `;
}

function monsterHunterContractRow(contract) {
  const contractState = monsterHunterContractState(contract.id);
  const unlocked = monsterHunterContractUnlocked(contract);
  const completed = contractState.status === "completed";
  const accepted = contractState.status === "accepted";
  const ready = monsterHunterContractReady(contract);
  return `
    <article class="guild-contract-row ${ready ? "ready" : ""}">
      <div>
        <b>${escapeHtml(contract.name)}</b>
        <span>${escapeHtml(contract.summary)}</span>
        <small>${escapeHtml(monsterHunterObjectiveText(contract))} - ${escapeHtml(priceText(contract.rewardCp))}, ${escapeHtml(contract.reputation)} rep</small>
      </div>
      ${
        !unlocked
          ? `<button type="button" disabled>Rank ${escapeHtml(contract.minRank)}</button>`
          : completed
            ? `<button type="button" disabled>Complete</button>`
            : accepted
              ? `<button type="button" data-action="complete-guild-contract" data-npc="${escapeAttribute(monsterHunterGuildId)}" data-contract="${escapeAttribute(contract.id)}" ${ready ? "" : "disabled"}>${ready ? "Claim" : "Hunting"}</button>`
              : `<button type="button" data-action="accept-guild-contract" data-npc="${escapeAttribute(monsterHunterGuildId)}" data-contract="${escapeAttribute(contract.id)}">Accept</button>`
      }
    </article>
  `;
}

function monsterHunterContractsMarkup() {
  const groups = new Map();
  for (const contract of monsterHunterContracts) {
    if (!groups.has(contract.group)) groups.set(contract.group, []);
    groups.get(contract.group).push(contract);
  }
  return `
    <section class="guild-section">
      <h3>Contracts</h3>
      <div class="guild-groups">
        ${Array.from(groups.entries())
          .map(
            ([group, contracts]) => `
              <details class="guild-group" open>
                <summary>${escapeHtml(group)} <small>${escapeHtml(contracts.length)}</small></summary>
                <div>${contracts.map(monsterHunterContractRow).join("")}</div>
              </details>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function monsterHunterTurnInRow(turnIn) {
  const quantity = Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
  const have = materialCountForRequirement(turnIn.requirement);
  const ready = have >= quantity;
  return `
    <article class="guild-contract-row ${ready ? "ready" : ""}">
      <div>
        <b>${escapeHtml(turnIn.name)}</b>
        <span>${escapeHtml(turnIn.summary)}</span>
        <small>Have ${escapeHtml(Math.min(have, quantity))}/${escapeHtml(quantity)} - ${escapeHtml(priceText(turnIn.rewardCp))}, ${escapeHtml(turnIn.reputation)} rep</small>
      </div>
      <button type="button" data-action="complete-guild-turn-in" data-npc="${escapeAttribute(monsterHunterGuildId)}" data-turn-in="${escapeAttribute(turnIn.id)}" ${ready ? "" : "disabled"}>${ready ? "Hand In" : "Need Trophies"}</button>
    </article>
  `;
}

function monsterHunterTurnInsMarkup() {
  return `
    <section class="guild-section">
      <h3>Trophy Turn-Ins</h3>
      <div class="guild-contract-list">
        ${monsterHunterTurnIns.map(monsterHunterTurnInRow).join("")}
      </div>
    </section>
  `;
}

function monsterHunterRankRewardsMarkup() {
  const rank = monsterHunterRank();
  return `
    <section class="guild-section">
      <h3>Rank Rewards</h3>
      <div class="guild-rewards">
        ${monsterHunterRanks
          .map(
            (entry, index) => `
              <div class="${index <= rank ? "unlocked" : ""}">
                <b>${escapeHtml(entry.name)}</b>
                <span>${escapeHtml(index <= rank ? entry.reward : `${entry.threshold} reputation required`)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function monsterHunterBoardStats(progress = monsterHunterProgress()) {
  const activeContracts = monsterHunterContracts.filter((contract) => monsterHunterContractState(contract.id).status === "accepted").length;
  const readyContracts = monsterHunterContracts.filter(monsterHunterContractReady).length;
  const readyTurnIns = monsterHunterTurnIns.filter(monsterHunterTurnInReady).length;
  return { activeContracts, readyContracts, readyTurnIns, rank: monsterHunterRank(progress) };
}

function monsterHunterBoardHeaderMarkup(npc, progress) {
  const stats = monsterHunterBoardStats(progress);
  return `
    <section class="guild-hero">
      ${factionSymbolMarkup(monsterHunterGuildId)}
      ${npcPortraitMarkup(npc, "guild-portrait", { clickable: false })}
      <div class="guild-hero-text">
        <span>The Trophy Lodge</span>
        <h3>${guildNpcNameButtonMarkup(npc, "Lodge Contact")}</h3>
        <b>${escapeHtml(npc.title)}</b>
        <p>${escapeHtml(npcEntryLine(npc) || npc.description || "")}</p>
      </div>
      <div class="guild-hero-stats">
        <div>
          <span>Active</span>
          <b>${escapeHtml(stats.activeContracts)}</b>
        </div>
        <div>
          <span>Ready</span>
          <b>${escapeHtml(stats.readyContracts + stats.readyTurnIns)}</b>
        </div>
        <div>
          <span>Rank</span>
          <b>${escapeHtml(stats.rank)}</b>
        </div>
      </div>
    </section>
  `;
}

function monsterHunterBoardActionsMarkup() {
  const readyContracts = monsterHunterContracts.filter(monsterHunterContractReady).length;
  const readyTurnIns = monsterHunterTurnIns.filter(monsterHunterTurnInReady).length;
  return `
    <section class="guild-actions-panel">
      <h3>Lodge Desk</h3>
      <button type="button" data-action="show-quest-log">Quest Log</button>
      <div>
        <span>${escapeHtml(readyContracts)} contract${readyContracts === 1 ? "" : "s"} ready to claim</span>
        <span>${escapeHtml(readyTurnIns)} trophy turn-in${readyTurnIns === 1 ? "" : "s"} ready</span>
      </div>
    </section>
  `;
}

function renderMonsterHunterGuild(npc = window.DungeonContent.get("npcs", monsterHunterGuildId)) {
  els.villageMenu?.classList.remove("npc-chat-open");
  els.villageMenu?.classList.add("guild-open");
  setVillageBackButtonVisible(true);
  const progress = monsterHunterProgress();
  els.villageBody.innerHTML = `
    <section class="guild-board">
      ${monsterHunterBoardHeaderMarkup(npc, progress)}
      <div class="guild-board-grid">
        <aside class="guild-board-side">
          ${monsterHunterRankBarMarkup(progress)}
          ${monsterHunterBoardActionsMarkup()}
        </aside>
        <main class="guild-board-main">
          ${monsterHunterContractsMarkup()}
          ${monsterHunterTurnInsMarkup()}
        </main>
        <aside class="guild-board-rewards">
          ${monsterHunterRankRewardsMarkup()}
        </aside>
      </div>
    </section>
  `;
  els.villageMenu.classList.remove("hidden");
  resetVillageScroll();
  setVillageMusicKey(villageMusicKeyForNpc(monsterHunterGuildId));
}

function acceptMonsterHunterContract(contractId) {
  const contract = monsterHunterContracts.find((entry) => entry.id === contractId);
  if (!contract || !monsterHunterContractUnlocked(contract)) return;
  const contractState = monsterHunterContractState(contract.id);
  if (contractState.status === "completed" || contractState.status === "accepted") return;
  contractState.status = "accepted";
  contractState.progress = 0;
  contractState.acceptedAt = Date.now();
  addLog(`Kessa Briarhook posts a Trophy Lodge contract: ${contract.name}.`, "important");
  renderMonsterHunterGuild();
  renderQuestLogButton();
}

function completeMonsterHunterContract(contractId) {
  const contract = monsterHunterContracts.find((entry) => entry.id === contractId);
  if (!contract || !monsterHunterContractReady(contract)) return;
  const contractState = monsterHunterContractState(contract.id);
  contractState.status = "completed";
  contractState.completedAt = Date.now();
  addMoney(activeHero().inventory.money, contract.rewardCp);
  const progress = monsterHunterProgress();
  progress.reputation += Math.max(0, Math.floor(Number(contract.reputation) || 0));
  progress.completedContracts[contract.id] = (progress.completedContracts[contract.id] ?? 0) + 1;
  addLog(`The Trophy Lodge pays ${priceText(contract.rewardCp)} for ${contract.name}. Reputation +${contract.reputation}.`, "important");
  render();
  renderMonsterHunterGuild();
}

function completeMonsterHunterTurnIn(turnInId) {
  const turnIn = monsterHunterTurnIns.find((entry) => entry.id === turnInId);
  if (!turnIn || !monsterHunterTurnInReady(turnIn)) return;
  const quantity = Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
  if (!consumeMaterialsForRequirement(turnIn.requirement, quantity)) return;
  addMoney(activeHero().inventory.money, turnIn.rewardCp);
  const progress = monsterHunterProgress();
  progress.reputation += Math.max(0, Math.floor(Number(turnIn.reputation) || 0));
  progress.turnIns[turnIn.id] = (progress.turnIns[turnIn.id] ?? 0) + 1;
  addLog(`Kessa Briarhook accepts ${turnIn.name} and pays ${priceText(turnIn.rewardCp)}. Trophy Lodge reputation +${turnIn.reputation}.`, "important");
  render();
  renderMonsterHunterGuild();
}

function cancelMonsterHunterContract(contractId) {
  const contract = monsterHunterContracts.find((entry) => entry.id === contractId);
  const contractState = contract ? monsterHunterContractState(contract.id) : null;
  if (!contract || contractState?.status !== "accepted") return false;
  contractState.status = "available";
  contractState.cancelledAt = Date.now();
  contractState.progress = 0;
  addLog(`The Trophy Lodge contract ${contract.name} is no longer accepted.`, "important");
  return true;
}

function monsterHunterMatchesContract(monster, contract) {
  const objective = contract?.objective ?? {};
  const tags = new Set((monster?.tags ?? []).map((tag) => String(tag).toLowerCase()));
  const text = [monster?.name, monster?.role, monster?.description, monster?.baseMonsterId, monster?.templateId, monster?.id]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (objective.type === "killTag") return tags.has(String(objective.tag ?? "").toLowerCase()) || text.includes(String(objective.tag ?? "").toLowerCase());
  if (objective.type === "killBigGame") {
    const category = Math.max(0, Math.floor(Number(monster?.category ?? monster?.monsterCategory ?? 0) || 0));
    return tags.has("boss") || monster?.customBoss || category >= 2 || /\b(huge|giant|hydra|bear|rhino|boss|matriarch|herdmaster)\b/.test(text);
  }
  return false;
}

function recordMonsterHunterKill(monster) {
  if (!monster || isPartyHeroId(monster.id)) return;
  const progress = monsterHunterProgress();
  let changed = false;
  for (const contract of monsterHunterContracts) {
    const contractState = progress.contracts?.[contract.id];
    if (contractState?.status !== "accepted" || !monsterHunterMatchesContract(monster, contract)) continue;
    const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
    contractState.progress = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)) + 1);
    changed = true;
    if (contractState.progress >= target) addLog(`Trophy Lodge contract ready: ${contract.name}.`, "important");
  }
  if (changed) renderQuestLogButton();
}

function monsterHunterQuestLogEntries() {
  return monsterHunterContracts
    .filter((contract) => monsterHunterContractState(contract.id).status === "accepted")
    .map((contract) => {
      const contractState = monsterHunterContractState(contract.id);
      const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
      const current = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)));
      return {
        id: `monster-hunter-${contract.id}`,
        giver: "Trophy Lodge",
        title: contract.name,
        description: contract.summary,
        ready: current >= target,
        cancelable: true,
        cancelType: "monster-hunter",
        questId: contract.id,
        objectives: [
          {
            label: contract.objective?.label ?? "Contract",
            progress: current,
            target,
          },
        ],
      };
    });
}

window.DungeonNpcBehaviors ??= {};
window.DungeonNpcBehaviors[monsterHunterGuildId] = {
  visit: renderMonsterHunterGuild,
  returnToVisit: () => renderMonsterHunterGuild(),
  recordMonsterKill: recordMonsterHunterKill,
  questLogEntries: monsterHunterQuestLogEntries,
  cancelQuest: cancelMonsterHunterContract,
  adminProgressEntries() {
    const progress = monsterHunterProgress();
    return [
      {
        id: "locked",
        npcId: monsterHunterGuildId,
        groupId: monsterHunterGuildId,
        groupLabel: "Trophy Lodge",
        label: "Locked",
        description: "Hide the Trophy Lodge until its story unlock.",
        active: !state.questFlags?.["flag.village.monsterHunterGuildUnlocked"],
      },
      {
        id: "unlocked",
        npcId: monsterHunterGuildId,
        groupId: monsterHunterGuildId,
        groupLabel: "Trophy Lodge",
        label: "Unlocked",
        description: "Show the Trophy Lodge with no extra reputation.",
        active: Boolean(state.questFlags?.["flag.village.monsterHunterGuildUnlocked"]) && progress.reputation < 75,
      },
      {
        id: "trusted",
        npcId: monsterHunterGuildId,
        groupId: monsterHunterGuildId,
        groupLabel: "Trophy Lodge",
        label: "Trusted Hunter",
        description: "Unlock the first tougher Trophy Lodge contracts.",
        active: progress.reputation >= 75 && progress.reputation < 150,
      },
      {
        id: "warden",
        npcId: monsterHunterGuildId,
        groupId: monsterHunterGuildId,
        groupLabel: "Trophy Lodge",
        label: "Trophy Warden",
        description: "Set high reputation for testing advanced guild rewards.",
        active: progress.reputation >= 150,
      },
    ];
  },
  setAdminProgress(progressId) {
    if (!adminEnabled()) return;
    state.questFlags = { ...(state.questFlags ?? {}) };
    const progress = monsterHunterProgress();
    if (progressId === "locked") {
      delete state.questFlags["flag.village.monsterHunterGuildUnlocked"];
      progress.reputation = 0;
    } else {
      state.questFlags["flag.village.monsterHunterGuildUnlocked"] = true;
      progress.reputation = progressId === "trusted" ? 75 : progressId === "warden" ? 150 : 0;
    }
    addLog(`Admin set Trophy Lodge progress: ${progressId}.`, "important");
  },
};

const gravebinderGuildId = "gravebinders";
const gravebinderStateKey = "gravebinderGuild";
const gravebinderRanks = [
  { name: "Unsworn", threshold: 0, reward: "The order will post basic undead contracts." },
  { name: "Candlebearer", threshold: 30, reward: "Gravebinder notes mark common restless dead more clearly." },
  { name: "Warden", threshold: 85, reward: "Odran opens sterner haunt warrants and better relic payments." },
  { name: "Exorcist", threshold: 170, reward: "The order trusts the party with dangerous grave work." },
  { name: "Grave-Saint", threshold: 330, reward: "Reserved for future elite haunt chains and named restless dead." },
];
const gravebinderContracts = [
  {
    id: "ashes-that-walk",
    name: "Ashes That Walk",
    group: "Restless Dead",
    summary: "Put down the common dead before their hunger finds living roads.",
    objective: { type: "killTag", tag: "undead", count: 6, label: "Undead laid to rest" },
    rewardCp: 9000,
    reputation: 30,
    minRank: 0,
  },
  {
    id: "lantern-for-the-lost",
    name: "Lantern for the Lost",
    group: "Haunts",
    summary: "Banish ghosts, wraiths, and other dead things that remember how to hate.",
    objective: { type: "killGhost", count: 4, label: "Haunts banished" },
    rewardCp: 14500,
    reputation: 45,
    minRank: 1,
  },
  {
    id: "seal-the-open-grave",
    name: "Seal the Open Grave",
    group: "Warrants",
    summary: "Destroy powerful undead, grave lords, and anything too stubborn for ordinary rites.",
    objective: { type: "killMajorUndead", count: 2, label: "Major dead sealed" },
    rewardCp: 26000,
    reputation: 80,
    minRank: 2,
  },
];
const gravebinderTurnIns = [
  {
    id: "bone-ledger",
    name: "Bone Ledger",
    summary: "Powdered, cracked, or marked remains for proper cataloging and ward work.",
    requirement: { type: "component", tagsAny: ["bone", "skull"] },
    quantity: 5,
    rewardCp: 4500,
    reputation: 10,
  },
  {
    id: "grave-wax-candles",
    name: "Grave-Wax Candles",
    summary: "Cold wax for binding candles. Keep it wrapped unless you want whispers in your pack.",
    requirement: { itemId: "grave-wax" },
    quantity: 3,
    rewardCp: 6500,
    reputation: 14,
  },
  {
    id: "ectoplasm-vials",
    name: "Ectoplasm Vials",
    summary: "Residue from spirits strong enough to leave fingerprints on the air.",
    requirement: { itemId: "ectoplasm" },
    quantity: 3,
    rewardCp: 9000,
    reputation: 18,
  },
  {
    id: "unquiet-relics",
    name: "Unquiet Relics",
    summary: "Soul echoes, cursed remains, and things that should not be kept beside a bed.",
    requirement: { type: "component", tagsAll: ["undead"], tagsAny: ["soul", "relic", "flesh", "ghost"] },
    quantity: 2,
    rewardCp: 11000,
    reputation: 22,
  },
];

function gravebinderProgress() {
  state.questFlags = { ...(state.questFlags ?? {}) };
  state.questFlags[gravebinderStateKey] ??= {};
  const progress = state.questFlags[gravebinderStateKey];
  progress.reputation = Math.max(0, Math.floor(Number(progress.reputation) || 0));
  progress.contracts ??= {};
  progress.completedContracts ??= {};
  progress.turnIns ??= {};
  return progress;
}

function gravebinderRank(progress = gravebinderProgress()) {
  const reputation = Math.max(0, Math.floor(Number(progress.reputation) || 0));
  let rank = 0;
  gravebinderRanks.forEach((entry, index) => {
    if (reputation >= entry.threshold) rank = index;
  });
  return rank;
}

function gravebinderNextRank(rank = gravebinderRank()) {
  return gravebinderRanks[rank + 1] ?? null;
}

function gravebinderContractState(contractId) {
  const progress = gravebinderProgress();
  progress.contracts[contractId] ??= { status: "available", progress: 0 };
  return progress.contracts[contractId];
}

function gravebinderContractReady(contract) {
  const contractState = gravebinderContractState(contract.id);
  const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
  return contractState.status === "accepted" && Math.max(0, Math.floor(Number(contractState.progress) || 0)) >= target;
}

function gravebinderContractUnlocked(contract) {
  return gravebinderRank() >= Math.max(0, Math.floor(Number(contract.minRank) || 0));
}

function gravebinderObjectiveText(contract) {
  const objective = contract.objective ?? {};
  const contractState = gravebinderContractState(contract.id);
  const target = Math.max(1, Math.floor(Number(objective.count) || 1));
  const progress = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)));
  return `${objective.label ?? "Objective"}: ${progress}/${target}`;
}

function gravebinderTurnInReady(turnIn) {
  return materialCountForRequirement(turnIn.requirement) >= Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
}

function gravebinderRankBarMarkup(progress = gravebinderProgress()) {
  const rank = gravebinderRank(progress);
  const current = gravebinderRanks[rank] ?? gravebinderRanks[0];
  const next = gravebinderNextRank(rank);
  const currentThreshold = current?.threshold ?? 0;
  const nextThreshold = next?.threshold ?? currentThreshold;
  const span = Math.max(1, nextThreshold - currentThreshold);
  const filled = next ? Math.min(100, Math.max(0, ((progress.reputation - currentThreshold) / span) * 100)) : 100;
  return `
    <section class="guild-status">
      <div>
        <span>Rank</span>
        <b>${escapeHtml(current?.name ?? "Unsworn")}</b>
      </div>
      <div>
        <span>Reputation</span>
        <b>${escapeHtml(progress.reputation)}${next ? ` / ${escapeHtml(next.threshold)}` : "+"}</b>
      </div>
      <div class="guild-rep-track" aria-hidden="true"><i style="width: ${escapeAttribute(filled.toFixed(1))}%"></i></div>
      <p>${escapeHtml(next ? `Next: ${next.name} - ${next.reward}` : current?.reward ?? "The dead know your name.")}</p>
    </section>
  `;
}

function gravebinderContractRow(contract) {
  const contractState = gravebinderContractState(contract.id);
  const unlocked = gravebinderContractUnlocked(contract);
  const completed = contractState.status === "completed";
  const accepted = contractState.status === "accepted";
  const ready = gravebinderContractReady(contract);
  return `
    <article class="guild-contract-row ${ready ? "ready" : ""}">
      <div>
        <b>${escapeHtml(contract.name)}</b>
        <span>${escapeHtml(contract.summary)}</span>
        <small>${escapeHtml(gravebinderObjectiveText(contract))} - ${escapeHtml(priceText(contract.rewardCp))}, ${escapeHtml(contract.reputation)} rep</small>
      </div>
      ${
        !unlocked
          ? `<button type="button" disabled>Rank ${escapeHtml(contract.minRank)}</button>`
          : completed
            ? `<button type="button" disabled>Sealed</button>`
            : accepted
              ? `<button type="button" data-action="complete-guild-contract" data-npc="${escapeAttribute(gravebinderGuildId)}" data-contract="${escapeAttribute(contract.id)}" ${ready ? "" : "disabled"}>${ready ? "Claim" : "Warding"}</button>`
              : `<button type="button" data-action="accept-guild-contract" data-npc="${escapeAttribute(gravebinderGuildId)}" data-contract="${escapeAttribute(contract.id)}">Accept</button>`
      }
    </article>
  `;
}

function gravebinderContractsMarkup() {
  const groups = new Map();
  for (const contract of gravebinderContracts) {
    if (!groups.has(contract.group)) groups.set(contract.group, []);
    groups.get(contract.group).push(contract);
  }
  return `
    <section class="guild-section">
      <h3>Contracts</h3>
      <div class="guild-groups">
        ${Array.from(groups.entries())
          .map(
            ([group, contracts]) => `
              <details class="guild-group" open>
                <summary>${escapeHtml(group)} <small>${escapeHtml(contracts.length)}</small></summary>
                <div>${contracts.map(gravebinderContractRow).join("")}</div>
              </details>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function gravebinderTurnInRow(turnIn) {
  const quantity = Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
  const have = materialCountForRequirement(turnIn.requirement);
  const ready = have >= quantity;
  return `
    <article class="guild-contract-row ${ready ? "ready" : ""}">
      <div>
        <b>${escapeHtml(turnIn.name)}</b>
        <span>${escapeHtml(turnIn.summary)}</span>
        <small>Have ${escapeHtml(Math.min(have, quantity))}/${escapeHtml(quantity)} - ${escapeHtml(priceText(turnIn.rewardCp))}, ${escapeHtml(turnIn.reputation)} rep</small>
      </div>
      <button type="button" data-action="complete-guild-turn-in" data-npc="${escapeAttribute(gravebinderGuildId)}" data-turn-in="${escapeAttribute(turnIn.id)}" ${ready ? "" : "disabled"}>${ready ? "Hand In" : "Need Remains"}</button>
    </article>
  `;
}

function gravebinderTurnInsMarkup() {
  return `
    <section class="guild-section">
      <h3>Grave Turn-Ins</h3>
      <div class="guild-contract-list">
        ${gravebinderTurnIns.map(gravebinderTurnInRow).join("")}
      </div>
    </section>
  `;
}

function gravebinderRankRewardsMarkup() {
  const rank = gravebinderRank();
  return `
    <section class="guild-section">
      <h3>Rank Rewards</h3>
      <div class="guild-rewards">
        ${gravebinderRanks
          .map(
            (entry, index) => `
              <div class="${index <= rank ? "unlocked" : ""}">
                <b>${escapeHtml(entry.name)}</b>
                <span>${escapeHtml(index <= rank ? entry.reward : `${entry.threshold} reputation required`)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function gravebinderBoardStats(progress = gravebinderProgress()) {
  const activeContracts = gravebinderContracts.filter((contract) => gravebinderContractState(contract.id).status === "accepted").length;
  const readyContracts = gravebinderContracts.filter(gravebinderContractReady).length;
  const readyTurnIns = gravebinderTurnIns.filter(gravebinderTurnInReady).length;
  return { activeContracts, readyContracts, readyTurnIns, rank: gravebinderRank(progress) };
}

function gravebinderBoardHeaderMarkup(npc, progress) {
  const stats = gravebinderBoardStats(progress);
  return `
    <section class="guild-hero gravebinder-hero">
      ${factionSymbolMarkup(gravebinderGuildId)}
      ${npcPortraitMarkup(npc, "guild-portrait", { clickable: false })}
      <div class="guild-hero-text">
        <span>The Gravebinders</span>
        <h3>${guildNpcNameButtonMarkup(npc, "Gravebinder Contact")}</h3>
        <b>${escapeHtml(npc.title)}</b>
        <p>${escapeHtml(npcEntryLine(npc) || npc.description || "")}</p>
      </div>
      <div class="guild-hero-stats">
        <div>
          <span>Active</span>
          <b>${escapeHtml(stats.activeContracts)}</b>
        </div>
        <div>
          <span>Ready</span>
          <b>${escapeHtml(stats.readyContracts + stats.readyTurnIns)}</b>
        </div>
        <div>
          <span>Rank</span>
          <b>${escapeHtml(stats.rank)}</b>
        </div>
      </div>
    </section>
  `;
}

function gravebinderBoardActionsMarkup() {
  const readyContracts = gravebinderContracts.filter(gravebinderContractReady).length;
  const readyTurnIns = gravebinderTurnIns.filter(gravebinderTurnInReady).length;
  return `
    <section class="guild-actions-panel">
      <h3>Candle Desk</h3>
      <button type="button" data-action="show-quest-log">Quest Log</button>
      <div>
        <span>${escapeHtml(readyContracts)} rite${readyContracts === 1 ? "" : "s"} ready to claim</span>
        <span>${escapeHtml(readyTurnIns)} grave turn-in${readyTurnIns === 1 ? "" : "s"} ready</span>
      </div>
    </section>
  `;
}

function renderGravebinderGuild(npc = window.DungeonContent.get("npcs", gravebinderGuildId)) {
  els.villageMenu?.classList.remove("npc-chat-open");
  els.villageMenu?.classList.add("guild-open");
  setVillageBackButtonVisible(true);
  const progress = gravebinderProgress();
  els.villageBody.innerHTML = `
    <section class="guild-board gravebinder-board">
      ${gravebinderBoardHeaderMarkup(npc, progress)}
      <div class="guild-board-grid">
        <aside class="guild-board-side">
          ${gravebinderRankBarMarkup(progress)}
          ${gravebinderBoardActionsMarkup()}
        </aside>
        <main class="guild-board-main">
          ${gravebinderContractsMarkup()}
          ${gravebinderTurnInsMarkup()}
        </main>
        <aside class="guild-board-rewards">
          ${gravebinderRankRewardsMarkup()}
        </aside>
      </div>
    </section>
  `;
  els.villageMenu.classList.remove("hidden");
  resetVillageScroll();
  setVillageMusicKey(villageMusicKeyForNpc(gravebinderGuildId));
}

function acceptGravebinderContract(contractId) {
  const contract = gravebinderContracts.find((entry) => entry.id === contractId);
  if (!contract || !gravebinderContractUnlocked(contract)) return;
  const contractState = gravebinderContractState(contract.id);
  if (contractState.status === "completed" || contractState.status === "accepted") return;
  contractState.status = "accepted";
  contractState.progress = 0;
  contractState.acceptedAt = Date.now();
  addLog(`Odran Vellshade opens a Gravebinder rite: ${contract.name}.`, "important");
  renderGravebinderGuild();
  renderQuestLogButton();
}

function completeGravebinderContract(contractId) {
  const contract = gravebinderContracts.find((entry) => entry.id === contractId);
  if (!contract || !gravebinderContractReady(contract)) return;
  const contractState = gravebinderContractState(contract.id);
  contractState.status = "completed";
  contractState.completedAt = Date.now();
  addMoney(activeHero().inventory.money, contract.rewardCp);
  const progress = gravebinderProgress();
  progress.reputation += Math.max(0, Math.floor(Number(contract.reputation) || 0));
  progress.completedContracts[contract.id] = (progress.completedContracts[contract.id] ?? 0) + 1;
  addLog(`The Gravebinders pay ${priceText(contract.rewardCp)} for ${contract.name}. Reputation +${contract.reputation}.`, "important");
  render();
  renderGravebinderGuild();
}

function completeGravebinderTurnIn(turnInId) {
  const turnIn = gravebinderTurnIns.find((entry) => entry.id === turnInId);
  if (!turnIn || !gravebinderTurnInReady(turnIn)) return;
  const quantity = Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
  if (!consumeMaterialsForRequirement(turnIn.requirement, quantity)) return;
  addMoney(activeHero().inventory.money, turnIn.rewardCp);
  const progress = gravebinderProgress();
  progress.reputation += Math.max(0, Math.floor(Number(turnIn.reputation) || 0));
  progress.turnIns[turnIn.id] = (progress.turnIns[turnIn.id] ?? 0) + 1;
  addLog(`Odran Vellshade accepts ${turnIn.name} and pays ${priceText(turnIn.rewardCp)}. Gravebinder reputation +${turnIn.reputation}.`, "important");
  render();
  renderGravebinderGuild();
}

function cancelGravebinderContract(contractId) {
  const contract = gravebinderContracts.find((entry) => entry.id === contractId);
  const contractState = contract ? gravebinderContractState(contract.id) : null;
  if (!contract || contractState?.status !== "accepted") return false;
  contractState.status = "available";
  contractState.cancelledAt = Date.now();
  contractState.progress = 0;
  addLog(`The Gravebinder rite ${contract.name} is no longer accepted.`, "important");
  return true;
}

function gravebinderMatchesContract(monster, contract) {
  const objective = contract?.objective ?? {};
  const tags = new Set((monster?.tags ?? []).map((tag) => String(tag).toLowerCase()));
  const text = [monster?.name, monster?.role, monster?.description, monster?.baseMonsterId, monster?.templateId, monster?.id]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const undead = tags.has("undead") || tags.has("skeletal") || tags.has("skeleton") || tags.has("zombie") || /undead|skeleton|skeletal|zombie|ghoul|wight|mummy|vampire|lich/.test(text);
  const ghost = tags.has("ghost") || tags.has("specter") || tags.has("wraith") || tags.has("banshee") || tags.has("spirit") || /ghost|specter|spectre|wraith|banshee|spirit|phantom|haunt/.test(text);
  if (objective.type === "killTag") return undead || tags.has(String(objective.tag ?? "").toLowerCase());
  if (objective.type === "killGhost") return ghost;
  if (objective.type === "killMajorUndead") {
    const category = Math.max(0, Math.floor(Number(monster?.category ?? monster?.monsterCategory ?? 0) || 0));
    return (undead || ghost) && (tags.has("boss") || monster?.customBoss || category >= 2 || /\b(lord|king|queen|matriarch|champion|ancient|boss)\b/.test(text));
  }
  return false;
}

function recordGravebinderKill(monster) {
  if (!monster || isPartyHeroId(monster.id)) return;
  const progress = gravebinderProgress();
  let changed = false;
  for (const contract of gravebinderContracts) {
    const contractState = progress.contracts?.[contract.id];
    if (contractState?.status !== "accepted" || !gravebinderMatchesContract(monster, contract)) continue;
    const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
    contractState.progress = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)) + 1);
    changed = true;
    if (contractState.progress >= target) addLog(`Gravebinder rite ready: ${contract.name}.`, "important");
  }
  if (changed) renderQuestLogButton();
}

function gravebinderQuestLogEntries() {
  return gravebinderContracts
    .filter((contract) => gravebinderContractState(contract.id).status === "accepted")
    .map((contract) => {
      const contractState = gravebinderContractState(contract.id);
      const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
      const current = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)));
      return {
        id: `gravebinder-${contract.id}`,
        giver: "The Gravebinders",
        title: contract.name,
        description: contract.summary,
        ready: current >= target,
        cancelable: true,
        cancelType: "gravebinder",
        questId: contract.id,
        objectives: [
          {
            label: contract.objective?.label ?? "Rite",
            progress: current,
            target,
          },
        ],
      };
    });
}

window.DungeonNpcBehaviors[gravebinderGuildId] = {
  visit: renderGravebinderGuild,
  returnToVisit: () => renderGravebinderGuild(),
  recordMonsterKill: recordGravebinderKill,
  questLogEntries: gravebinderQuestLogEntries,
  cancelQuest: cancelGravebinderContract,
  adminProgressEntries() {
    const progress = gravebinderProgress();
    return [
      {
        id: "locked",
        npcId: gravebinderGuildId,
        groupId: gravebinderGuildId,
        groupLabel: "Gravebinders",
        label: "Locked",
        description: "Hide the Gravebinders until their story unlock.",
        active: !state.questFlags?.["flag.village.gravebindersUnlocked"],
      },
      {
        id: "unlocked",
        npcId: gravebinderGuildId,
        groupId: gravebinderGuildId,
        groupLabel: "Gravebinders",
        label: "Unlocked",
        description: "Show the Gravebinders with no extra reputation.",
        active: Boolean(state.questFlags?.["flag.village.gravebindersUnlocked"]) && progress.reputation < 85,
      },
      {
        id: "warden",
        npcId: gravebinderGuildId,
        groupId: gravebinderGuildId,
        groupLabel: "Gravebinders",
        label: "Warden",
        description: "Unlock stronger haunt contracts.",
        active: progress.reputation >= 85 && progress.reputation < 170,
      },
      {
        id: "exorcist",
        npcId: gravebinderGuildId,
        groupId: gravebinderGuildId,
        groupLabel: "Gravebinders",
        label: "Exorcist",
        description: "Set high reputation for testing advanced grave work.",
        active: progress.reputation >= 170,
      },
    ];
  },
  setAdminProgress(progressId) {
    if (!adminEnabled()) return;
    state.questFlags = { ...(state.questFlags ?? {}) };
    const progress = gravebinderProgress();
    if (progressId === "locked") {
      delete state.questFlags["flag.village.gravebindersUnlocked"];
      progress.reputation = 0;
    } else {
      state.questFlags["flag.village.gravebindersUnlocked"] = true;
      progress.reputation = progressId === "warden" ? 85 : progressId === "exorcist" ? 170 : 0;
    }
    addLog(`Admin set Gravebinders progress: ${progressId}.`, "important");
  },
};

const crucibleGuildId = "crucible-collegium";
const crucibleStateKey = "crucibleCollegium";
const crucibleRanks = [
  { name: "Observer", threshold: 0, reward: "The Collegium will post basic elemental field work." },
  { name: "Field Adept", threshold: 30, reward: "Tavren accepts more refined elemental samples." },
  { name: "Crucible Fellow", threshold: 90, reward: "Major rift studies and stronger essence payments open." },
  { name: "Planar Savant", threshold: 180, reward: "The Collegium trusts the party with unstable planar work." },
  { name: "Chair of Calamities", threshold: 350, reward: "Reserved for future elite rift chains and planar sovereigns." },
];
const crucibleContracts = [
  {
    id: "motes-in-motion",
    name: "Motes in Motion",
    group: "Field Studies",
    summary: "Break down active elementals and return with observations, preferably not smoking.",
    objective: { type: "killTag", tag: "elemental", count: 5, label: "Elementals dispersed" },
    rewardCp: 9500,
    reputation: 30,
    minRank: 0,
  },
  {
    id: "fourfold-sample",
    name: "Fourfold Sample",
    group: "Elemental Balance",
    summary: "Collect combat data from fire, air, earth, or water expressions. Tavren insists variety is science.",
    objective: { type: "killElementalAspect", count: 8, label: "Aspect samples recorded" },
    rewardCp: 16000,
    reputation: 50,
    minRank: 1,
  },
  {
    id: "rift-tempering",
    name: "Rift Tempering",
    group: "Rift Warrants",
    summary: "Disperse powerful elementals, paraelemental champions, or planar cores before the floor becomes a theory.",
    objective: { type: "killMajorElemental", count: 2, label: "Major elementals dispersed" },
    rewardCp: 28000,
    reputation: 85,
    minRank: 2,
  },
];
const crucibleTurnIns = [
  {
    id: "loose-motes",
    name: "Loose Motes",
    summary: "Raw elemental knots. Do not store them beside soup, ink, pets, or opinions.",
    requirement: { itemId: "elemental-mote" },
    quantity: 4,
    rewardCp: 6500,
    reputation: 12,
  },
  {
    id: "balanced-essences",
    name: "Balanced Essences",
    summary: "Any refined elemental essence, logged by color, temperature, smell, and level of personal insult.",
    requirement: { type: "component", tagsAll: ["elemental"], tagsAny: ["fire", "air", "earth", "water", "storm", "ice", "stone"] },
    quantity: 3,
    rewardCp: 10500,
    reputation: 18,
  },
  {
    id: "pressure-and-crystal",
    name: "Pressure and Crystal",
    summary: "Stable housings, cracked focuses, and anything that clicks when no one touched it.",
    requirement: { type: "component", tagsAny: ["pressure", "crystal", "gear", "steam", "arcane-reagent"] },
    quantity: 3,
    rewardCp: 9000,
    reputation: 16,
  },
  {
    id: "primal-core-study",
    name: "Primal Core Study",
    summary: "A rare elemental heart for serious research, heavy gloves, and several exits.",
    requirement: { itemId: "primal-core" },
    quantity: 1,
    rewardCp: 14000,
    reputation: 26,
  },
];

function crucibleProgress() {
  state.questFlags = { ...(state.questFlags ?? {}) };
  state.questFlags[crucibleStateKey] ??= {};
  const progress = state.questFlags[crucibleStateKey];
  progress.reputation = Math.max(0, Math.floor(Number(progress.reputation) || 0));
  progress.contracts ??= {};
  progress.completedContracts ??= {};
  progress.turnIns ??= {};
  return progress;
}

function crucibleRank(progress = crucibleProgress()) {
  const reputation = Math.max(0, Math.floor(Number(progress.reputation) || 0));
  let rank = 0;
  crucibleRanks.forEach((entry, index) => {
    if (reputation >= entry.threshold) rank = index;
  });
  return rank;
}

function crucibleNextRank(rank = crucibleRank()) {
  return crucibleRanks[rank + 1] ?? null;
}

function crucibleContractState(contractId) {
  const progress = crucibleProgress();
  progress.contracts[contractId] ??= { status: "available", progress: 0 };
  return progress.contracts[contractId];
}

function crucibleContractReady(contract) {
  const contractState = crucibleContractState(contract.id);
  const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
  return contractState.status === "accepted" && Math.max(0, Math.floor(Number(contractState.progress) || 0)) >= target;
}

function crucibleContractUnlocked(contract) {
  return crucibleRank() >= Math.max(0, Math.floor(Number(contract.minRank) || 0));
}

function crucibleObjectiveText(contract) {
  const objective = contract.objective ?? {};
  const contractState = crucibleContractState(contract.id);
  const target = Math.max(1, Math.floor(Number(objective.count) || 1));
  const progress = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)));
  return `${objective.label ?? "Objective"}: ${progress}/${target}`;
}

function crucibleTurnInReady(turnIn) {
  return materialCountForRequirement(turnIn.requirement) >= Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
}

function crucibleRankBarMarkup(progress = crucibleProgress()) {
  const rank = crucibleRank(progress);
  const current = crucibleRanks[rank] ?? crucibleRanks[0];
  const next = crucibleNextRank(rank);
  const currentThreshold = current?.threshold ?? 0;
  const nextThreshold = next?.threshold ?? currentThreshold;
  const span = Math.max(1, nextThreshold - currentThreshold);
  const filled = next ? Math.min(100, Math.max(0, ((progress.reputation - currentThreshold) / span) * 100)) : 100;
  return `
    <section class="guild-status">
      <div>
        <span>Rank</span>
        <b>${escapeHtml(current?.name ?? "Observer")}</b>
      </div>
      <div>
        <span>Reputation</span>
        <b>${escapeHtml(progress.reputation)}${next ? ` / ${escapeHtml(next.threshold)}` : "+"}</b>
      </div>
      <div class="guild-rep-track" aria-hidden="true"><i style="width: ${escapeAttribute(filled.toFixed(1))}%"></i></div>
      <p>${escapeHtml(next ? `Next: ${next.name} - ${next.reward}` : current?.reward ?? "The elements know your variables.")}</p>
    </section>
  `;
}

function crucibleContractRow(contract) {
  const contractState = crucibleContractState(contract.id);
  const unlocked = crucibleContractUnlocked(contract);
  const completed = contractState.status === "completed";
  const accepted = contractState.status === "accepted";
  const ready = crucibleContractReady(contract);
  return `
    <article class="guild-contract-row ${ready ? "ready" : ""}">
      <div>
        <b>${escapeHtml(contract.name)}</b>
        <span>${escapeHtml(contract.summary)}</span>
        <small>${escapeHtml(crucibleObjectiveText(contract))} - ${escapeHtml(priceText(contract.rewardCp))}, ${escapeHtml(contract.reputation)} rep</small>
      </div>
      ${
        !unlocked
          ? `<button type="button" disabled>Rank ${escapeHtml(contract.minRank)}</button>`
          : completed
            ? `<button type="button" disabled>Filed</button>`
            : accepted
              ? `<button type="button" data-action="complete-guild-contract" data-npc="${escapeAttribute(crucibleGuildId)}" data-contract="${escapeAttribute(contract.id)}" ${ready ? "" : "disabled"}>${ready ? "Claim" : "Studying"}</button>`
              : `<button type="button" data-action="accept-guild-contract" data-npc="${escapeAttribute(crucibleGuildId)}" data-contract="${escapeAttribute(contract.id)}">Accept</button>`
      }
    </article>
  `;
}

function crucibleContractsMarkup() {
  const groups = new Map();
  for (const contract of crucibleContracts) {
    if (!groups.has(contract.group)) groups.set(contract.group, []);
    groups.get(contract.group).push(contract);
  }
  return `
    <section class="guild-section">
      <h3>Contracts</h3>
      <div class="guild-groups">
        ${Array.from(groups.entries())
          .map(
            ([group, contracts]) => `
              <details class="guild-group" open>
                <summary>${escapeHtml(group)} <small>${escapeHtml(contracts.length)}</small></summary>
                <div>${contracts.map(crucibleContractRow).join("")}</div>
              </details>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function crucibleTurnInRow(turnIn) {
  const quantity = Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
  const have = materialCountForRequirement(turnIn.requirement);
  const ready = have >= quantity;
  return `
    <article class="guild-contract-row ${ready ? "ready" : ""}">
      <div>
        <b>${escapeHtml(turnIn.name)}</b>
        <span>${escapeHtml(turnIn.summary)}</span>
        <small>Have ${escapeHtml(Math.min(have, quantity))}/${escapeHtml(quantity)} - ${escapeHtml(priceText(turnIn.rewardCp))}, ${escapeHtml(turnIn.reputation)} rep</small>
      </div>
      <button type="button" data-action="complete-guild-turn-in" data-npc="${escapeAttribute(crucibleGuildId)}" data-turn-in="${escapeAttribute(turnIn.id)}" ${ready ? "" : "disabled"}>${ready ? "Hand In" : "Need Samples"}</button>
    </article>
  `;
}

function crucibleTurnInsMarkup() {
  return `
    <section class="guild-section">
      <h3>Sample Turn-Ins</h3>
      <div class="guild-contract-list">
        ${crucibleTurnIns.map(crucibleTurnInRow).join("")}
      </div>
    </section>
  `;
}

function crucibleRankRewardsMarkup() {
  const rank = crucibleRank();
  return `
    <section class="guild-section">
      <h3>Rank Rewards</h3>
      <div class="guild-rewards">
        ${crucibleRanks
          .map(
            (entry, index) => `
              <div class="${index <= rank ? "unlocked" : ""}">
                <b>${escapeHtml(entry.name)}</b>
                <span>${escapeHtml(index <= rank ? entry.reward : `${entry.threshold} reputation required`)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function crucibleBoardStats(progress = crucibleProgress()) {
  const activeContracts = crucibleContracts.filter((contract) => crucibleContractState(contract.id).status === "accepted").length;
  const readyContracts = crucibleContracts.filter(crucibleContractReady).length;
  const readyTurnIns = crucibleTurnIns.filter(crucibleTurnInReady).length;
  return { activeContracts, readyContracts, readyTurnIns, rank: crucibleRank(progress) };
}

function crucibleBoardHeaderMarkup(npc, progress) {
  const stats = crucibleBoardStats(progress);
  return `
    <section class="guild-hero crucible-hero">
      ${factionSymbolMarkup(crucibleGuildId)}
      ${npcPortraitMarkup(npc, "guild-portrait", { clickable: false })}
      <div class="guild-hero-text">
        <span>Crucible Collegium</span>
        <h3>${guildNpcNameButtonMarkup(npc, "Collegium Contact")}</h3>
        <b>${escapeHtml(npc.title)}</b>
        <p>${escapeHtml(npcEntryLine(npc) || npc.description || "")}</p>
      </div>
      <div class="guild-hero-stats">
        <div>
          <span>Active</span>
          <b>${escapeHtml(stats.activeContracts)}</b>
        </div>
        <div>
          <span>Ready</span>
          <b>${escapeHtml(stats.readyContracts + stats.readyTurnIns)}</b>
        </div>
        <div>
          <span>Rank</span>
          <b>${escapeHtml(stats.rank)}</b>
        </div>
      </div>
    </section>
  `;
}

function crucibleBoardActionsMarkup() {
  const readyContracts = crucibleContracts.filter(crucibleContractReady).length;
  const readyTurnIns = crucibleTurnIns.filter(crucibleTurnInReady).length;
  return `
    <section class="guild-actions-panel">
      <h3>Research Desk</h3>
      <button type="button" data-action="show-quest-log">Quest Log</button>
      <div>
        <span>${escapeHtml(readyContracts)} study${readyContracts === 1 ? "" : "ies"} ready to file</span>
        <span>${escapeHtml(readyTurnIns)} sample turn-in${readyTurnIns === 1 ? "" : "s"} ready</span>
      </div>
    </section>
  `;
}

function renderCrucibleGuild(npc = window.DungeonContent.get("npcs", crucibleGuildId)) {
  els.villageMenu?.classList.remove("npc-chat-open");
  els.villageMenu?.classList.add("guild-open");
  setVillageBackButtonVisible(true);
  const progress = crucibleProgress();
  els.villageBody.innerHTML = `
    <section class="guild-board crucible-board">
      ${crucibleBoardHeaderMarkup(npc, progress)}
      <div class="guild-board-grid">
        <aside class="guild-board-side">
          ${crucibleRankBarMarkup(progress)}
          ${crucibleBoardActionsMarkup()}
        </aside>
        <main class="guild-board-main">
          ${crucibleContractsMarkup()}
          ${crucibleTurnInsMarkup()}
        </main>
        <aside class="guild-board-rewards">
          ${crucibleRankRewardsMarkup()}
        </aside>
      </div>
    </section>
  `;
  els.villageMenu.classList.remove("hidden");
  resetVillageScroll();
  setVillageMusicKey(villageMusicKeyForNpc(crucibleGuildId));
}

function acceptCrucibleContract(contractId) {
  const contract = crucibleContracts.find((entry) => entry.id === contractId);
  if (!contract || !crucibleContractUnlocked(contract)) return;
  const contractState = crucibleContractState(contract.id);
  if (contractState.status === "completed" || contractState.status === "accepted") return;
  contractState.status = "accepted";
  contractState.progress = 0;
  contractState.acceptedAt = Date.now();
  addLog(`Tavren Quillflare opens a Collegium study: ${contract.name}.`, "important");
  renderCrucibleGuild();
  renderQuestLogButton();
}

function completeCrucibleContract(contractId) {
  const contract = crucibleContracts.find((entry) => entry.id === contractId);
  if (!contract || !crucibleContractReady(contract)) return;
  const contractState = crucibleContractState(contract.id);
  contractState.status = "completed";
  contractState.completedAt = Date.now();
  addMoney(activeHero().inventory.money, contract.rewardCp);
  const progress = crucibleProgress();
  progress.reputation += Math.max(0, Math.floor(Number(contract.reputation) || 0));
  progress.completedContracts[contract.id] = (progress.completedContracts[contract.id] ?? 0) + 1;
  addLog(`The Crucible Collegium pays ${priceText(contract.rewardCp)} for ${contract.name}. Reputation +${contract.reputation}.`, "important");
  render();
  renderCrucibleGuild();
}

function completeCrucibleTurnIn(turnInId) {
  const turnIn = crucibleTurnIns.find((entry) => entry.id === turnInId);
  if (!turnIn || !crucibleTurnInReady(turnIn)) return;
  const quantity = Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
  if (!consumeMaterialsForRequirement(turnIn.requirement, quantity)) return;
  addMoney(activeHero().inventory.money, turnIn.rewardCp);
  const progress = crucibleProgress();
  progress.reputation += Math.max(0, Math.floor(Number(turnIn.reputation) || 0));
  progress.turnIns[turnIn.id] = (progress.turnIns[turnIn.id] ?? 0) + 1;
  addLog(`Tavren Quillflare accepts ${turnIn.name} and pays ${priceText(turnIn.rewardCp)}. Collegium reputation +${turnIn.reputation}.`, "important");
  render();
  renderCrucibleGuild();
}

function cancelCrucibleContract(contractId) {
  const contract = crucibleContracts.find((entry) => entry.id === contractId);
  const contractState = contract ? crucibleContractState(contract.id) : null;
  if (!contract || contractState?.status !== "accepted") return false;
  contractState.status = "available";
  contractState.cancelledAt = Date.now();
  contractState.progress = 0;
  addLog(`The Collegium study ${contract.name} is no longer accepted.`, "important");
  return true;
}

function crucibleMatchesContract(monster, contract) {
  const objective = contract?.objective ?? {};
  const tags = new Set((monster?.tags ?? []).map((tag) => String(tag).toLowerCase()));
  const text = [monster?.name, monster?.role, monster?.description, monster?.baseMonsterId, monster?.templateId, monster?.id]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const elemental = tags.has("elemental") || /elemental|paraelemental|myrmidon|efreeti|salamander|magma|storm|tide|quake|gale/.test(text);
  const aspect = ["fire", "air", "earth", "water", "ash", "smoke", "storm", "wind", "lightning", "thunder", "stone", "crystal", "mud", "sand", "ice", "frost", "steam", "mist", "magma", "lava"].some((tag) => tags.has(tag) || text.includes(tag));
  if (objective.type === "killTag") return elemental || tags.has(String(objective.tag ?? "").toLowerCase());
  if (objective.type === "killElementalAspect") return elemental && aspect;
  if (objective.type === "killMajorElemental") {
    const category = Math.max(0, Math.floor(Number(monster?.category ?? monster?.monsterCategory ?? 0) || 0));
    return elemental && (tags.has("boss") || monster?.customBoss || category >= 2 || /\b(lord|queen|king|regent|sovereign|avatar|colossus|titan|boss|core)\b/.test(text));
  }
  return false;
}

function recordCrucibleKill(monster) {
  if (!monster || isPartyHeroId(monster.id)) return;
  const progress = crucibleProgress();
  let changed = false;
  for (const contract of crucibleContracts) {
    const contractState = progress.contracts?.[contract.id];
    if (contractState?.status !== "accepted" || !crucibleMatchesContract(monster, contract)) continue;
    const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
    contractState.progress = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)) + 1);
    changed = true;
    if (contractState.progress >= target) addLog(`Collegium study ready: ${contract.name}.`, "important");
  }
  if (changed) renderQuestLogButton();
}

function crucibleQuestLogEntries() {
  return crucibleContracts
    .filter((contract) => crucibleContractState(contract.id).status === "accepted")
    .map((contract) => {
      const contractState = crucibleContractState(contract.id);
      const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
      const current = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)));
      return {
        id: `crucible-${contract.id}`,
        giver: "Crucible Collegium",
        title: contract.name,
        description: contract.summary,
        ready: current >= target,
        cancelable: true,
        cancelType: "crucible",
        questId: contract.id,
        objectives: [
          {
            label: contract.objective?.label ?? "Study",
            progress: current,
            target,
          },
        ],
      };
    });
}

window.DungeonNpcBehaviors[crucibleGuildId] = {
  visit: renderCrucibleGuild,
  returnToVisit: () => renderCrucibleGuild(),
  recordMonsterKill: recordCrucibleKill,
  questLogEntries: crucibleQuestLogEntries,
  cancelQuest: cancelCrucibleContract,
  adminProgressEntries() {
    const progress = crucibleProgress();
    return [
      {
        id: "locked",
        npcId: crucibleGuildId,
        groupId: crucibleGuildId,
        groupLabel: "Crucible Collegium",
        label: "Locked",
        description: "Hide the Crucible Collegium until its story unlock.",
        active: !state.questFlags?.["flag.village.crucibleCollegiumUnlocked"],
      },
      {
        id: "unlocked",
        npcId: crucibleGuildId,
        groupId: crucibleGuildId,
        groupLabel: "Crucible Collegium",
        label: "Unlocked",
        description: "Show the Crucible Collegium with no extra reputation.",
        active: Boolean(state.questFlags?.["flag.village.crucibleCollegiumUnlocked"]) && progress.reputation < 90,
      },
      {
        id: "fellow",
        npcId: crucibleGuildId,
        groupId: crucibleGuildId,
        groupLabel: "Crucible Collegium",
        label: "Crucible Fellow",
        description: "Unlock major elemental studies.",
        active: progress.reputation >= 90 && progress.reputation < 180,
      },
      {
        id: "savant",
        npcId: crucibleGuildId,
        groupId: crucibleGuildId,
        groupLabel: "Crucible Collegium",
        label: "Planar Savant",
        description: "Set high reputation for testing unstable planar work.",
        active: progress.reputation >= 180,
      },
    ];
  },
  setAdminProgress(progressId) {
    if (!adminEnabled()) return;
    state.questFlags = { ...(state.questFlags ?? {}) };
    const progress = crucibleProgress();
    if (progressId === "locked") {
      delete state.questFlags["flag.village.crucibleCollegiumUnlocked"];
      progress.reputation = 0;
    } else {
      state.questFlags["flag.village.crucibleCollegiumUnlocked"] = true;
      progress.reputation = progressId === "fellow" ? 90 : progressId === "savant" ? 180 : 0;
    }
    addLog(`Admin set Crucible Collegium progress: ${progressId}.`, "important");
  },
};

const antiquarianGuildId = "antiquarian-society";
const antiquarianStateKey = "antiquarianSociety";
const antiquarianRanks = [
  { name: "Visitor", threshold: 0, reward: "The Society will accept basic field notes and relic cataloging." },
  { name: "Cataloger", threshold: 30, reward: "Professor Inkglass accepts better provenance work and fragile finds." },
  { name: "Archivist", threshold: 90, reward: "Rare relic commissions and stronger appraisal payments open." },
  { name: "Curator", threshold: 180, reward: "The Society trusts the party with dangerous history." },
  { name: "Keeper of Lost Rooms", threshold: 350, reward: "Reserved for future archive wings and named relic chains." },
];
const antiquarianContracts = [
  {
    id: "field-notes",
    name: "Field Notes",
    group: "Archive Work",
    summary: "Recover written fragments, dungeon notes, or ancient tome pages before damp, fire, or adventurers improve them.",
    objective: { type: "collectTome", count: 2, label: "Tomes or notes cataloged" },
    rewardCp: 8500,
    reputation: 30,
    minRank: 0,
  },
  {
    id: "objects-of-provenance",
    name: "Objects of Provenance",
    group: "Relic Surveys",
    summary: "Bring back art objects, valuables, and cultural pieces with enough context to make scholars argue politely.",
    objective: { type: "collectTreasure", count: 4, label: "Relic objects cataloged" },
    rewardCp: 15000,
    reputation: 50,
    minRank: 1,
  },
  {
    id: "dangerous-antiquities",
    name: "Dangerous Antiquities",
    group: "Rare Finds",
    summary: "Recover rare, magical, royal, or funerary pieces. If the object resents being observed, note the tone.",
    objective: { type: "collectMajorRelic", count: 2, label: "Major relics cataloged" },
    rewardCp: 30000,
    reputation: 90,
    minRank: 2,
  },
];
const antiquarianTurnIns = [
  {
    id: "tome-pages",
    name: "Tome Pages",
    summary: "Readable pages, field notes, inscriptions, and anything that makes the archive smell older.",
    requirement: { type: "handout", tagsAny: ["ancient-tome", "handout", "journal"] },
    quantity: 1,
    rewardCp: 7000,
    reputation: 14,
  },
  {
    id: "small-antiquities",
    name: "Small Antiquities",
    summary: "Art objects and old valuables. Shine is optional. Context is not.",
    requirement: { type: "treasure", tagsAny: ["art", "art-object", "valuable", "trade-good"] },
    quantity: 2,
    rewardCp: 10000,
    reputation: 18,
  },
  {
    id: "reliquary-cases",
    name: "Reliquary Cases",
    summary: "Reliquaries, saint icons, funerary pieces, and other objects people once whispered near.",
    requirement: { type: "treasure", tagsAny: ["relic", "reliquary", "saint", "funerary", "prayer"] },
    quantity: 1,
    rewardCp: 14000,
    reputation: 24,
  },
  {
    id: "royal-provenance",
    name: "Royal Provenance",
    summary: "Crowns, charters, regalia, and objects expensive enough to have caused paperwork in three kingdoms.",
    requirement: { type: "treasure", tagsAny: ["royal", "crown", "charter", "signet", "coronet"], minValueGp: 250 },
    quantity: 1,
    rewardCp: 22000,
    reputation: 34,
  },
];

function antiquarianProgress() {
  state.questFlags = { ...(state.questFlags ?? {}) };
  state.questFlags[antiquarianStateKey] ??= {};
  const progress = state.questFlags[antiquarianStateKey];
  progress.reputation = Math.max(0, Math.floor(Number(progress.reputation) || 0));
  progress.contracts ??= {};
  progress.completedContracts ??= {};
  progress.turnIns ??= {};
  return progress;
}

function antiquarianRank(progress = antiquarianProgress()) {
  const reputation = Math.max(0, Math.floor(Number(progress.reputation) || 0));
  let rank = 0;
  antiquarianRanks.forEach((entry, index) => {
    if (reputation >= entry.threshold) rank = index;
  });
  return rank;
}

function antiquarianNextRank(rank = antiquarianRank()) {
  return antiquarianRanks[rank + 1] ?? null;
}

function antiquarianContractState(contractId) {
  const progress = antiquarianProgress();
  progress.contracts[contractId] ??= { status: "available", progress: 0 };
  return progress.contracts[contractId];
}

function antiquarianContractReady(contract) {
  const contractState = antiquarianContractState(contract.id);
  const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
  return contractState.status === "accepted" && Math.max(0, Math.floor(Number(contractState.progress) || 0)) >= target;
}

function antiquarianContractUnlocked(contract) {
  return antiquarianRank() >= Math.max(0, Math.floor(Number(contract.minRank) || 0));
}

function antiquarianObjectiveText(contract) {
  const objective = contract.objective ?? {};
  const contractState = antiquarianContractState(contract.id);
  const target = Math.max(1, Math.floor(Number(objective.count) || 1));
  const progress = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)));
  return `${objective.label ?? "Objective"}: ${progress}/${target}`;
}

function antiquarianTurnInReady(turnIn) {
  return antiquarianTurnInCount(turnIn) >= Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
}

function antiquarianTurnInUsesTomes(turnIn) {
  return turnIn?.requirement?.type === "handout";
}

function antiquarianTomeTurnInEntries(turnIn) {
  if (!antiquarianTurnInUsesTomes(turnIn)) return [];
  const requirement = turnIn.requirement ?? {};
  return normalizePartyTomes(state?.partyTomes ?? []).filter((entry) => {
    const itemLike = {
      id: entry.baseItemId || entry.id,
      type: "handout",
      tags: ["handout", "journal", ...(entry.tags ?? []), ...(entry.categories ?? []).map((category) => String(category).toLowerCase())],
      handout: { categories: entry.categories ?? [] },
    };
    return itemMatchesRequirement(itemLike, requirement);
  });
}

function antiquarianTurnInCount(turnIn) {
  if (antiquarianTurnInUsesTomes(turnIn)) return antiquarianTomeTurnInEntries(turnIn).length;
  return materialCountForRequirement(turnIn.requirement);
}

function consumeAntiquarianTurnIn(turnIn, quantity) {
  if (!antiquarianTurnInUsesTomes(turnIn)) return consumeMaterialsForRequirement(turnIn.requirement, quantity);
  const entries = antiquarianTomeTurnInEntries(turnIn).slice(0, quantity);
  if (entries.length < quantity) return false;
  const consumedIds = new Set(entries.map((entry) => entry.id));
  state.partyTomes = normalizePartyTomes(state.partyTomes ?? []).filter((entry) => !consumedIds.has(entry.id));
  return true;
}

function antiquarianRankBarMarkup(progress = antiquarianProgress()) {
  const rank = antiquarianRank(progress);
  const current = antiquarianRanks[rank] ?? antiquarianRanks[0];
  const next = antiquarianNextRank(rank);
  const currentThreshold = current?.threshold ?? 0;
  const nextThreshold = next?.threshold ?? currentThreshold;
  const span = Math.max(1, nextThreshold - currentThreshold);
  const filled = next ? Math.min(100, Math.max(0, ((progress.reputation - currentThreshold) / span) * 100)) : 100;
  return `
    <section class="guild-status">
      <div>
        <span>Rank</span>
        <b>${escapeHtml(current?.name ?? "Visitor")}</b>
      </div>
      <div>
        <span>Reputation</span>
        <b>${escapeHtml(progress.reputation)}${next ? ` / ${escapeHtml(next.threshold)}` : "+"}</b>
      </div>
      <div class="guild-rep-track" aria-hidden="true"><i style="width: ${escapeAttribute(filled.toFixed(1))}%"></i></div>
      <p>${escapeHtml(next ? `Next: ${next.name} - ${next.reward}` : current?.reward ?? "The archive knows your name.")}</p>
    </section>
  `;
}

function antiquarianContractRow(contract) {
  const contractState = antiquarianContractState(contract.id);
  const unlocked = antiquarianContractUnlocked(contract);
  const completed = contractState.status === "completed";
  const accepted = contractState.status === "accepted";
  const ready = antiquarianContractReady(contract);
  return `
    <article class="guild-contract-row ${ready ? "ready" : ""}">
      <div>
        <b>${escapeHtml(contract.name)}</b>
        <span>${escapeHtml(contract.summary)}</span>
        <small>${escapeHtml(antiquarianObjectiveText(contract))} - ${escapeHtml(priceText(contract.rewardCp))}, ${escapeHtml(contract.reputation)} rep</small>
      </div>
      ${
        !unlocked
          ? `<button type="button" disabled>Rank ${escapeHtml(contract.minRank)}</button>`
          : completed
            ? `<button type="button" disabled>Filed</button>`
            : accepted
              ? `<button type="button" data-action="complete-guild-contract" data-npc="${escapeAttribute(antiquarianGuildId)}" data-contract="${escapeAttribute(contract.id)}" ${ready ? "" : "disabled"}>${ready ? "Claim" : "Cataloging"}</button>`
              : `<button type="button" data-action="accept-guild-contract" data-npc="${escapeAttribute(antiquarianGuildId)}" data-contract="${escapeAttribute(contract.id)}">Accept</button>`
      }
    </article>
  `;
}

function antiquarianContractsMarkup() {
  const groups = new Map();
  for (const contract of antiquarianContracts) {
    if (!groups.has(contract.group)) groups.set(contract.group, []);
    groups.get(contract.group).push(contract);
  }
  return `
    <section class="guild-section">
      <h3>Commissions</h3>
      <div class="guild-groups">
        ${Array.from(groups.entries())
          .map(
            ([group, contracts]) => `
              <details class="guild-group" open>
                <summary>${escapeHtml(group)} <small>${escapeHtml(contracts.length)}</small></summary>
                <div>${contracts.map(antiquarianContractRow).join("")}</div>
              </details>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function antiquarianTurnInRow(turnIn) {
  const quantity = Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
  const have = antiquarianTurnInCount(turnIn);
  const ready = have >= quantity;
  return `
    <article class="guild-contract-row ${ready ? "ready" : ""}">
      <div>
        <b>${escapeHtml(turnIn.name)}</b>
        <span>${escapeHtml(turnIn.summary)}</span>
        <small>Have ${escapeHtml(Math.min(have, quantity))}/${escapeHtml(quantity)} - ${escapeHtml(priceText(turnIn.rewardCp))}, ${escapeHtml(turnIn.reputation)} rep</small>
      </div>
      <button type="button" data-action="complete-guild-turn-in" data-npc="${escapeAttribute(antiquarianGuildId)}" data-turn-in="${escapeAttribute(turnIn.id)}" ${ready ? "" : "disabled"}>${ready ? "Hand In" : "Need Finds"}</button>
    </article>
  `;
}

function antiquarianTurnInsMarkup() {
  return `
    <section class="guild-section">
      <h3>Archive Turn-Ins</h3>
      <div class="guild-contract-list">
        ${antiquarianTurnIns.map(antiquarianTurnInRow).join("")}
      </div>
    </section>
  `;
}

function antiquarianRankRewardsMarkup() {
  const rank = antiquarianRank();
  return `
    <section class="guild-section">
      <h3>Rank Rewards</h3>
      <div class="guild-rewards">
        ${antiquarianRanks
          .map(
            (entry, index) => `
              <div class="${index <= rank ? "unlocked" : ""}">
                <b>${escapeHtml(entry.name)}</b>
                <span>${escapeHtml(index <= rank ? entry.reward : `${entry.threshold} reputation required`)}</span>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function antiquarianBoardStats(progress = antiquarianProgress()) {
  const activeContracts = antiquarianContracts.filter((contract) => antiquarianContractState(contract.id).status === "accepted").length;
  const readyContracts = antiquarianContracts.filter(antiquarianContractReady).length;
  const readyTurnIns = antiquarianTurnIns.filter(antiquarianTurnInReady).length;
  return { activeContracts, readyContracts, readyTurnIns, rank: antiquarianRank(progress) };
}

function antiquarianBoardHeaderMarkup(npc, progress) {
  const stats = antiquarianBoardStats(progress);
  return `
    <section class="guild-hero antiquarian-hero">
      ${factionSymbolMarkup(antiquarianGuildId)}
      ${npcPortraitMarkup(npc, "guild-portrait", { clickable: false })}
      <div class="guild-hero-text">
        <span>Antiquarian Society</span>
        <h3>${guildNpcNameButtonMarkup(npc, "Society Contact")}</h3>
        <b>${escapeHtml(npc.title)}</b>
        <p>${escapeHtml(npcEntryLine(npc) || npc.description || "")}</p>
      </div>
      <div class="guild-hero-stats">
        <div>
          <span>Active</span>
          <b>${escapeHtml(stats.activeContracts)}</b>
        </div>
        <div>
          <span>Ready</span>
          <b>${escapeHtml(stats.readyContracts + stats.readyTurnIns)}</b>
        </div>
        <div>
          <span>Rank</span>
          <b>${escapeHtml(stats.rank)}</b>
        </div>
      </div>
    </section>
  `;
}

function antiquarianBoardActionsMarkup() {
  const readyContracts = antiquarianContracts.filter(antiquarianContractReady).length;
  const readyTurnIns = antiquarianTurnIns.filter(antiquarianTurnInReady).length;
  return `
    <section class="guild-actions-panel">
      <h3>Archive Desk</h3>
      <button type="button" data-action="show-quest-log">Quest Log</button>
      <div>
        <span>${escapeHtml(readyContracts)} commission${readyContracts === 1 ? "" : "s"} ready to file</span>
        <span>${escapeHtml(readyTurnIns)} archive turn-in${readyTurnIns === 1 ? "" : "s"} ready</span>
      </div>
    </section>
  `;
}

function renderAntiquarianGuild(npc = window.DungeonContent.get("npcs", antiquarianGuildId)) {
  els.villageMenu?.classList.remove("npc-chat-open");
  els.villageMenu?.classList.add("guild-open");
  setVillageBackButtonVisible(true);
  const progress = antiquarianProgress();
  els.villageBody.innerHTML = `
    <section class="guild-board antiquarian-board">
      ${antiquarianBoardHeaderMarkup(npc, progress)}
      <div class="guild-board-grid">
        <aside class="guild-board-side">
          ${antiquarianRankBarMarkup(progress)}
          ${antiquarianBoardActionsMarkup()}
        </aside>
        <main class="guild-board-main">
          ${antiquarianContractsMarkup()}
          ${antiquarianTurnInsMarkup()}
        </main>
        <aside class="guild-board-rewards">
          ${antiquarianRankRewardsMarkup()}
        </aside>
      </div>
    </section>
  `;
  els.villageMenu.classList.remove("hidden");
  resetVillageScroll();
  setVillageMusicKey(villageMusicKeyForNpc(antiquarianGuildId));
}

function acceptAntiquarianContract(contractId) {
  const contract = antiquarianContracts.find((entry) => entry.id === contractId);
  if (!contract || !antiquarianContractUnlocked(contract)) return;
  const contractState = antiquarianContractState(contract.id);
  if (contractState.status === "completed" || contractState.status === "accepted") return;
  contractState.status = "accepted";
  contractState.progress = 0;
  contractState.acceptedAt = Date.now();
  addLog(`Professor Seraphel Inkglass opens an Antiquarian Society commission: ${contract.name}.`, "important");
  renderAntiquarianGuild();
  renderQuestLogButton();
}

function completeAntiquarianContract(contractId) {
  const contract = antiquarianContracts.find((entry) => entry.id === contractId);
  if (!contract || !antiquarianContractReady(contract)) return;
  const contractState = antiquarianContractState(contract.id);
  contractState.status = "completed";
  contractState.completedAt = Date.now();
  addMoney(activeHero().inventory.money, contract.rewardCp);
  const progress = antiquarianProgress();
  progress.reputation += Math.max(0, Math.floor(Number(contract.reputation) || 0));
  progress.completedContracts[contract.id] = (progress.completedContracts[contract.id] ?? 0) + 1;
  addLog(`The Antiquarian Society pays ${priceText(contract.rewardCp)} for ${contract.name}. Reputation +${contract.reputation}.`, "important");
  render();
  renderAntiquarianGuild();
}

function completeAntiquarianTurnIn(turnInId) {
  const turnIn = antiquarianTurnIns.find((entry) => entry.id === turnInId);
  if (!turnIn || !antiquarianTurnInReady(turnIn)) return;
  const quantity = Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
  if (!consumeAntiquarianTurnIn(turnIn, quantity)) return;
  addMoney(activeHero().inventory.money, turnIn.rewardCp);
  const progress = antiquarianProgress();
  progress.reputation += Math.max(0, Math.floor(Number(turnIn.reputation) || 0));
  progress.turnIns[turnIn.id] = (progress.turnIns[turnIn.id] ?? 0) + 1;
  addLog(`Professor Seraphel Inkglass accepts ${turnIn.name} and pays ${priceText(turnIn.rewardCp)}. Antiquarian reputation +${turnIn.reputation}.`, "important");
  render();
  renderAntiquarianGuild();
}

function cancelAntiquarianContract(contractId) {
  const contract = antiquarianContracts.find((entry) => entry.id === contractId);
  const contractState = contract ? antiquarianContractState(contract.id) : null;
  if (!contract || contractState?.status !== "accepted") return false;
  contractState.status = "available";
  contractState.cancelledAt = Date.now();
  contractState.progress = 0;
  addLog(`The Antiquarian Society commission ${contract.name} is no longer accepted.`, "important");
  return true;
}

function antiquarianItemMatchesContract(item, contract) {
  const objective = contract?.objective ?? {};
  const tags = new Set((item?.tags ?? []).map((tag) => String(tag).toLowerCase()));
  const text = [item?.name, item?.description, item?.customDescription, item?.category, item?.treasure?.kind, item?.treasure?.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const isTome = itemUsesTomeInventory(item) || item?.type === "handout" || tags.has("ancient-tome") || tags.has("journal");
  const isTreasure = item?.type === "treasure" || tags.has("treasure");
  const isRelic = isTreasure && (["art", "art-object", "valuable", "relic", "reliquary", "gem", "gemstone", "trade-good"].some((tag) => tags.has(tag)) || /relic|reliquary|idol|tablet|mask|icon|charter|crown|helm|astrolabe|ancient|royal|saint|funerary/.test(text));
  const valueGp = Number(item?.treasure?.valueGp ?? item?.treasure?.valueTierGp ?? 0) || itemValueCopper(item) / 100;
  if (objective.type === "collectTome") return isTome;
  if (objective.type === "collectTreasure") return isRelic;
  if (objective.type === "collectMajorRelic") return isRelic && (valueGp >= 250 || /royal|crown|reliquary|charter|funerary|ancient|idol|sapphire|emerald|diamond|ruby/.test(text));
  return false;
}

function recordAntiquarianItemCollected(item) {
  if (!item) return;
  const progress = antiquarianProgress();
  let changed = false;
  for (const contract of antiquarianContracts) {
    const contractState = progress.contracts?.[contract.id];
    if (contractState?.status !== "accepted" || !antiquarianItemMatchesContract(item, contract)) continue;
    const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
    contractState.progress = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)) + 1);
    changed = true;
    if (contractState.progress >= target) addLog(`Antiquarian commission ready: ${contract.name}.`, "important");
  }
  if (changed) renderQuestLogButton();
}

function antiquarianQuestLogEntries() {
  return antiquarianContracts
    .filter((contract) => antiquarianContractState(contract.id).status === "accepted")
    .map((contract) => {
      const contractState = antiquarianContractState(contract.id);
      const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
      const current = Math.min(target, Math.max(0, Math.floor(Number(contractState.progress) || 0)));
      return {
        id: `antiquarian-${contract.id}`,
        giver: "Antiquarian Society",
        title: contract.name,
        description: contract.summary,
        ready: current >= target,
        cancelable: true,
        cancelType: "antiquarian",
        questId: contract.id,
        objectives: [
          {
            label: contract.objective?.label ?? "Commission",
            progress: current,
            target,
          },
        ],
      };
    });
}

window.DungeonNpcBehaviors[antiquarianGuildId] = {
  visit: renderAntiquarianGuild,
  returnToVisit: () => renderAntiquarianGuild(),
  recordItemCollected: recordAntiquarianItemCollected,
  questLogEntries: antiquarianQuestLogEntries,
  cancelQuest: cancelAntiquarianContract,
  adminProgressEntries() {
    const progress = antiquarianProgress();
    return [
      {
        id: "locked",
        npcId: antiquarianGuildId,
        groupId: antiquarianGuildId,
        groupLabel: "Antiquarian Society",
        label: "Locked",
        description: "Hide the Antiquarian Society until its story unlock.",
        active: !state.questFlags?.["flag.village.antiquarianSocietyUnlocked"],
      },
      {
        id: "unlocked",
        npcId: antiquarianGuildId,
        groupId: antiquarianGuildId,
        groupLabel: "Antiquarian Society",
        label: "Unlocked",
        description: "Show the Antiquarian Society with no extra reputation.",
        active: Boolean(state.questFlags?.["flag.village.antiquarianSocietyUnlocked"]) && progress.reputation < 90,
      },
      {
        id: "archivist",
        npcId: antiquarianGuildId,
        groupId: antiquarianGuildId,
        groupLabel: "Antiquarian Society",
        label: "Archivist",
        description: "Unlock better rare-find commissions.",
        active: progress.reputation >= 90 && progress.reputation < 180,
      },
      {
        id: "curator",
        npcId: antiquarianGuildId,
        groupId: antiquarianGuildId,
        groupLabel: "Antiquarian Society",
        label: "Curator",
        description: "Set high reputation for testing dangerous history.",
        active: progress.reputation >= 180,
      },
    ];
  },
  setAdminProgress(progressId) {
    if (!adminEnabled()) return;
    state.questFlags = { ...(state.questFlags ?? {}) };
    const progress = antiquarianProgress();
    if (progressId === "locked") {
      delete state.questFlags["flag.village.antiquarianSocietyUnlocked"];
      progress.reputation = 0;
    } else {
      state.questFlags["flag.village.antiquarianSocietyUnlocked"] = true;
      progress.reputation = progressId === "archivist" ? 90 : progressId === "curator" ? 180 : 0;
    }
    addLog(`Admin set Antiquarian Society progress: ${progressId}.`, "important");
  },
};

function createCompactGuildBoard(config) {
  const stateKey = config.stateKey;
  const ranks = config.ranks ?? [];
  const contracts = config.contracts ?? [];
  const turnIns = config.turnIns ?? [];

  function progress() {
    state.questFlags = { ...(state.questFlags ?? {}) };
    state.questFlags[stateKey] ??= {};
    const entry = state.questFlags[stateKey];
    entry.reputation = Math.max(0, Math.floor(Number(entry.reputation) || 0));
    entry.contracts ??= {};
    entry.completedContracts ??= {};
    entry.turnIns ??= {};
    return entry;
  }

  function rank(entry = progress()) {
    const reputation = Math.max(0, Math.floor(Number(entry.reputation) || 0));
    let current = 0;
    ranks.forEach((rankEntry, index) => {
      if (reputation >= rankEntry.threshold) current = index;
    });
    return current;
  }

  function nextRank(currentRank = rank()) {
    return ranks[currentRank + 1] ?? null;
  }

  function contractState(contractId) {
    const entry = progress();
    entry.contracts[contractId] ??= { status: "available", progress: 0 };
    return entry.contracts[contractId];
  }

  function contractReady(contract) {
    const entry = contractState(contract.id);
    const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
    return entry.status === "accepted" && Math.max(0, Math.floor(Number(entry.progress) || 0)) >= target;
  }

  function contractUnlocked(contract) {
    return rank() >= Math.max(0, Math.floor(Number(contract.minRank) || 0));
  }

  function objectiveText(contract) {
    const objective = contract.objective ?? {};
    const entry = contractState(contract.id);
    const target = Math.max(1, Math.floor(Number(objective.count) || 1));
    const current = Math.min(target, Math.max(0, Math.floor(Number(entry.progress) || 0)));
    return `${objective.label ?? "Objective"}: ${current}/${target}`;
  }

  function turnInReady(turnIn) {
    return materialCountForRequirement(turnIn.requirement) >= Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
  }

  function rankBarMarkup(entry = progress()) {
    const currentRank = rank(entry);
    const current = ranks[currentRank] ?? ranks[0];
    const upcoming = nextRank(currentRank);
    const currentThreshold = current?.threshold ?? 0;
    const nextThreshold = upcoming?.threshold ?? currentThreshold;
    const span = Math.max(1, nextThreshold - currentThreshold);
    const filled = upcoming ? Math.min(100, Math.max(0, ((entry.reputation - currentThreshold) / span) * 100)) : 100;
    return `
      <section class="guild-status">
        <div>
          <span>Rank</span>
          <b>${escapeHtml(current?.name ?? "New")}</b>
        </div>
        <div>
          <span>Reputation</span>
          <b>${escapeHtml(entry.reputation)}${upcoming ? ` / ${escapeHtml(upcoming.threshold)}` : "+"}</b>
        </div>
        <div class="guild-rep-track" aria-hidden="true"><i style="width: ${escapeAttribute(filled.toFixed(1))}%"></i></div>
        <p>${escapeHtml(upcoming ? `Next: ${upcoming.name} - ${upcoming.reward}` : current?.reward ?? config.completeRewardText ?? "Fully trusted.")}</p>
      </section>
    `;
  }

  function contractRow(contract) {
    const entry = contractState(contract.id);
    const unlocked = contractUnlocked(contract);
    const completed = entry.status === "completed";
    const accepted = entry.status === "accepted";
    const ready = contractReady(contract);
    return `
      <article class="guild-contract-row ${ready ? "ready" : ""}">
        <div>
          <b>${escapeHtml(contract.name)}</b>
          <span>${escapeHtml(contract.summary)}</span>
          <small>${escapeHtml(objectiveText(contract))} - ${escapeHtml(priceText(contract.rewardCp))}, ${escapeHtml(contract.reputation)} rep</small>
        </div>
        ${
          !unlocked
            ? `<button type="button" disabled>Rank ${escapeHtml(contract.minRank)}</button>`
            : completed
              ? `<button type="button" disabled>${escapeHtml(config.completedLabel ?? "Complete")}</button>`
              : accepted
                ? `<button type="button" data-action="complete-guild-contract" data-npc="${escapeAttribute(config.id)}" data-contract="${escapeAttribute(contract.id)}" ${ready ? "" : "disabled"}>${ready ? escapeHtml(config.claimLabel ?? "Claim") : escapeHtml(config.workingLabel ?? "Working")}</button>`
                : `<button type="button" data-action="accept-guild-contract" data-npc="${escapeAttribute(config.id)}" data-contract="${escapeAttribute(contract.id)}">Accept</button>`
        }
      </article>
    `;
  }

  function contractsMarkup() {
    const groups = new Map();
    for (const contract of contracts) {
      if (!groups.has(contract.group)) groups.set(contract.group, []);
      groups.get(contract.group).push(contract);
    }
    return `
      <section class="guild-section">
        <h3>${escapeHtml(config.contractsTitle ?? "Contracts")}</h3>
        <div class="guild-groups">
          ${Array.from(groups.entries())
            .map(
              ([group, entries]) => `
                <details class="guild-group" open>
                  <summary>${escapeHtml(group)} <small>${escapeHtml(entries.length)}</small></summary>
                  <div>${entries.map(contractRow).join("")}</div>
                </details>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function turnInRow(turnIn) {
    const quantity = Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
    const have = materialCountForRequirement(turnIn.requirement);
    const ready = have >= quantity;
    return `
      <article class="guild-contract-row ${ready ? "ready" : ""}">
        <div>
          <b>${escapeHtml(turnIn.name)}</b>
          <span>${escapeHtml(turnIn.summary)}</span>
          <small>Have ${escapeHtml(Math.min(have, quantity))}/${escapeHtml(quantity)} - ${escapeHtml(priceText(turnIn.rewardCp))}, ${escapeHtml(turnIn.reputation)} rep</small>
        </div>
        <button type="button" data-action="complete-guild-turn-in" data-npc="${escapeAttribute(config.id)}" data-turn-in="${escapeAttribute(turnIn.id)}" ${ready ? "" : "disabled"}>${ready ? escapeHtml(config.turnInReadyLabel ?? "Hand In") : escapeHtml(config.turnInWaitingLabel ?? "Need Items")}</button>
      </article>
    `;
  }

  function turnInsMarkup() {
    return `
      <section class="guild-section">
        <h3>${escapeHtml(config.turnInsTitle ?? "Turn-Ins")}</h3>
        <div class="guild-contract-list">
          ${turnIns.map(turnInRow).join("")}
        </div>
      </section>
    `;
  }

  function rankRewardsMarkup() {
    const currentRank = rank();
    return `
      <section class="guild-section">
        <h3>Rank Rewards</h3>
        <div class="guild-rewards">
          ${ranks
            .map(
              (entry, index) => `
                <div class="${index <= currentRank ? "unlocked" : ""}">
                  <b>${escapeHtml(entry.name)}</b>
                  <span>${escapeHtml(index <= currentRank ? entry.reward : `${entry.threshold} reputation required`)}</span>
                </div>
              `,
            )
            .join("")}
        </div>
      </section>
    `;
  }

  function boardStats(entry = progress()) {
    const activeContracts = contracts.filter((contract) => contractState(contract.id).status === "accepted").length;
    const readyContracts = contracts.filter(contractReady).length;
    const readyTurnIns = turnIns.filter(turnInReady).length;
    return { activeContracts, readyContracts, readyTurnIns, rank: rank(entry) };
  }

  function headerMarkup(npc, entry) {
    const stats = boardStats(entry);
    return `
      <section class="guild-hero ${escapeAttribute(config.heroClass ?? "")}">
        ${factionSymbolMarkup(config.id)}
        ${npcPortraitMarkup(npc, "guild-portrait", { clickable: false })}
        <div class="guild-hero-text">
          <span>${escapeHtml(config.label)}</span>
          <h3>${guildNpcNameButtonMarkup(npc, config.label)}</h3>
          <b>${escapeHtml(npc?.title ?? "")}</b>
          <p>${escapeHtml(npcEntryLine(npc) || npc?.description || "")}</p>
        </div>
        <div class="guild-hero-stats">
          <div>
            <span>Active</span>
            <b>${escapeHtml(stats.activeContracts)}</b>
          </div>
          <div>
            <span>Ready</span>
            <b>${escapeHtml(stats.readyContracts + stats.readyTurnIns)}</b>
          </div>
          <div>
            <span>Rank</span>
            <b>${escapeHtml(stats.rank)}</b>
          </div>
        </div>
      </section>
    `;
  }

  function actionsMarkup() {
    const readyContracts = contracts.filter(contractReady).length;
    const readyTurnIns = turnIns.filter(turnInReady).length;
    return `
      <section class="guild-actions-panel">
        <h3>${escapeHtml(config.actionsTitle ?? "Guild Desk")}</h3>
        <button type="button" data-action="show-quest-log">Quest Log</button>
        <div>
          <span>${escapeHtml(readyContracts)} ${escapeHtml(config.readyContractText ?? "contract")}${readyContracts === 1 ? "" : "s"} ready</span>
          <span>${escapeHtml(readyTurnIns)} ${escapeHtml(config.readyTurnInText ?? "turn-in")}${readyTurnIns === 1 ? "" : "s"} ready</span>
        </div>
      </section>
    `;
  }

  function renderGuild(npc = window.DungeonContent.get("npcs", config.id)) {
    els.villageMenu?.classList.remove("npc-chat-open");
    els.villageMenu?.classList.add("guild-open");
    setVillageBackButtonVisible(true);
    const entry = progress();
    els.villageBody.innerHTML = `
      <section class="guild-board ${escapeAttribute(config.boardClass ?? "")}">
        ${headerMarkup(npc, entry)}
        <div class="guild-board-grid">
          <aside class="guild-board-side">
            ${rankBarMarkup(entry)}
            ${actionsMarkup()}
          </aside>
          <main class="guild-board-main">
            ${contractsMarkup()}
            ${turnInsMarkup()}
          </main>
          <aside class="guild-board-rewards">
            ${rankRewardsMarkup()}
          </aside>
        </div>
      </section>
    `;
    els.villageMenu.classList.remove("hidden");
    resetVillageScroll();
    setVillageMusicKey(villageMusicKeyForNpc(config.id));
  }

  function acceptContract(contractId) {
    const contract = contracts.find((entry) => entry.id === contractId);
    if (!contract || !contractUnlocked(contract)) return;
    const entry = contractState(contract.id);
    if (entry.status === "completed" || entry.status === "accepted") return;
    entry.status = "accepted";
    entry.progress = 0;
    entry.acceptedAt = Date.now();
    addLog(`${config.acceptLogName} opens ${contract.name}.`, "important");
    renderGuild();
    renderQuestLogButton();
  }

  function completeContract(contractId) {
    const contract = contracts.find((entry) => entry.id === contractId);
    if (!contract || !contractReady(contract)) return;
    const entry = contractState(contract.id);
    entry.status = "completed";
    entry.completedAt = Date.now();
    addMoney(activeHero().inventory.money, contract.rewardCp);
    const guildProgress = progress();
    guildProgress.reputation += Math.max(0, Math.floor(Number(contract.reputation) || 0));
    guildProgress.completedContracts[contract.id] = (guildProgress.completedContracts[contract.id] ?? 0) + 1;
    addLog(`${config.payLogName} pays ${priceText(contract.rewardCp)} for ${contract.name}. Reputation +${contract.reputation}.`, "important");
    render();
    renderGuild();
  }

  function completeTurnIn(turnInId) {
    const turnIn = turnIns.find((entry) => entry.id === turnInId);
    if (!turnIn || !turnInReady(turnIn)) return;
    const quantity = Math.max(1, Math.floor(Number(turnIn.quantity) || 1));
    if (!consumeMaterialsForRequirement(turnIn.requirement, quantity)) return;
    addMoney(activeHero().inventory.money, turnIn.rewardCp);
    const guildProgress = progress();
    guildProgress.reputation += Math.max(0, Math.floor(Number(turnIn.reputation) || 0));
    guildProgress.turnIns[turnIn.id] = (guildProgress.turnIns[turnIn.id] ?? 0) + 1;
    addLog(`${config.turnInLogName} accepts ${turnIn.name} and pays ${priceText(turnIn.rewardCp)}. Reputation +${turnIn.reputation}.`, "important");
    render();
    renderGuild();
  }

  function cancelContract(contractId) {
    const contract = contracts.find((entry) => entry.id === contractId);
    const entry = contract ? contractState(contract.id) : null;
    if (!contract || entry?.status !== "accepted") return false;
    entry.status = "available";
    entry.cancelledAt = Date.now();
    entry.progress = 0;
    addLog(`${config.label} contract ${contract.name} is no longer accepted.`, "important");
    return true;
  }

  function recordItemCollected(item) {
    if (!item || typeof config.itemMatchesContract !== "function") return;
    const guildProgress = progress();
    let changed = false;
    for (const contract of contracts) {
      const entry = guildProgress.contracts?.[contract.id];
      if (entry?.status !== "accepted" || !config.itemMatchesContract(item, contract)) continue;
      const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
      entry.progress = Math.min(target, Math.max(0, Math.floor(Number(entry.progress) || 0)) + 1);
      changed = true;
      if (entry.progress >= target) addLog(`${config.label} contract ready: ${contract.name}.`, "important");
    }
    if (changed) renderQuestLogButton();
  }

  function onDungeonComplete(context = {}) {
    if (typeof config.dungeonMatchesContract !== "function") return false;
    const guildProgress = progress();
    let changed = false;
    for (const contract of contracts) {
      const entry = guildProgress.contracts?.[contract.id];
      if (entry?.status !== "accepted" || !config.dungeonMatchesContract(context, contract)) continue;
      const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
      entry.progress = Math.min(target, Math.max(0, Math.floor(Number(entry.progress) || 0)) + 1);
      changed = true;
      if (entry.progress >= target) addLog(`${config.label} contract ready: ${contract.name}.`, "important");
    }
    if (changed) renderQuestLogButton();
    return changed;
  }

  function questLogEntries() {
    return contracts
      .filter((contract) => contractState(contract.id).status === "accepted")
      .map((contract) => {
        const entry = contractState(contract.id);
        const target = Math.max(1, Math.floor(Number(contract.objective?.count) || 1));
        const current = Math.min(target, Math.max(0, Math.floor(Number(entry.progress) || 0)));
        return {
          id: `${config.id}-${contract.id}`,
          giver: config.label,
          title: contract.name,
          description: contract.summary,
          ready: current >= target,
          cancelable: true,
          cancelType: config.cancelType,
          questId: contract.id,
          objectives: [
            {
              label: contract.objective?.label ?? "Contract",
              progress: current,
              target,
            },
          ],
        };
      });
  }

  function adminProgressEntries() {
    const entry = progress();
    return [
      {
        id: "locked",
        npcId: config.id,
        groupId: config.id,
        groupLabel: config.label,
        label: "Locked",
        description: `Hide ${config.label} until its story unlock.`,
        active: !state.questFlags?.[config.unlockFlag],
      },
      {
        id: "unlocked",
        npcId: config.id,
        groupId: config.id,
        groupLabel: config.label,
        label: "Unlocked",
        description: `Show ${config.label} with no extra reputation.`,
        active: Boolean(state.questFlags?.[config.unlockFlag]) && entry.reputation < (config.adminMidRep ?? 80),
      },
      {
        id: "trusted",
        npcId: config.id,
        groupId: config.id,
        groupLabel: config.label,
        label: config.adminMidLabel ?? "Trusted",
        description: "Set mid reputation for testing better contracts.",
        active: entry.reputation >= (config.adminMidRep ?? 80) && entry.reputation < (config.adminHighRep ?? 170),
      },
      {
        id: "high",
        npcId: config.id,
        groupId: config.id,
        groupLabel: config.label,
        label: config.adminHighLabel ?? "High Rank",
        description: "Set high reputation for testing advanced board rewards.",
        active: entry.reputation >= (config.adminHighRep ?? 170),
      },
    ];
  }

  function setAdminProgress(progressId) {
    if (!adminEnabled()) return;
    state.questFlags = { ...(state.questFlags ?? {}) };
    const entry = progress();
    if (progressId === "locked") {
      delete state.questFlags[config.unlockFlag];
      entry.reputation = 0;
    } else {
      state.questFlags[config.unlockFlag] = true;
      entry.reputation = progressId === "trusted" ? config.adminMidRep ?? 80 : progressId === "high" ? config.adminHighRep ?? 170 : 0;
    }
    addLog(`Admin set ${config.label} progress: ${progressId}.`, "important");
  }

  window.DungeonNpcBehaviors[config.id] = {
    visit: renderGuild,
    returnToVisit: () => renderGuild(),
    recordItemCollected,
    onDungeonComplete,
    questLogEntries,
    cancelQuest: cancelContract,
    adminProgressEntries,
    setAdminProgress,
  };

  return { renderGuild, acceptContract, completeContract, completeTurnIn, cancelContract, progress, contractReady, turnInReady };
}

function itemHasAnyTag(item, tags) {
  const itemTags = new Set((item?.tags ?? []).map((tag) => String(tag).toLowerCase()));
  return (tags ?? []).some((tag) => itemTags.has(String(tag).toLowerCase()));
}

function itemSearchText(item) {
  return [item?.id, item?.baseItemId, item?.name, item?.description, item?.customDescription, item?.category, item?.material, item?.treasure?.kind, item?.treasure?.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

const expeditionBoardApi = createCompactGuildBoard({
  id: "expedition-board",
  stateKey: "expeditionBoard",
  label: "Expedition Board",
  unlockFlag: "flag.village.expeditionBoardUnlocked",
  boardClass: "expedition-board",
  heroClass: "expedition-hero",
  actionsTitle: "Route Desk",
  contractsTitle: "Postings",
  turnInsTitle: "Supply Turn-Ins",
  readyContractText: "posting",
  readyTurnInText: "supply turn-in",
  claimLabel: "File Report",
  workingLabel: "In Field",
  completedLabel: "Filed",
  turnInWaitingLabel: "Need Supplies",
  acceptLogName: "Nella Waymark",
  payLogName: "The Expedition Board",
  turnInLogName: "Nella Waymark",
  adminMidRep: 80,
  adminHighRep: 170,
  adminMidLabel: "Route Regular",
  adminHighLabel: "Trail Captain",
  cancelType: "expedition-board",
  ranks: [
    { name: "New Route", threshold: 0, reward: "The Board will post simple route and delve work." },
    { name: "Signed Scout", threshold: 30, reward: "Better route claims and useful field notes open." },
    { name: "Route Regular", threshold: 80, reward: "Nella trusts the party with longer proof-of-route contracts." },
    { name: "Trail Captain", threshold: 170, reward: "The Board treats the party as reliable expedition leaders." },
    { name: "Lantern Marshal", threshold: 340, reward: "Reserved for future caravan chains and dangerous route privileges." },
  ],
  contracts: [
    {
      id: "prove-the-road",
      name: "Prove the Road",
      group: "Route Work",
      summary: "Complete delves and return with enough confidence for Nella to mark the route as survivable.",
      objective: { type: "dungeonComplete", count: 2, label: "Dungeons completed" },
      rewardCp: 9000,
      reputation: 30,
      minRank: 0,
    },
    {
      id: "campaign-mileposts",
      name: "Campaign Mileposts",
      group: "Route Work",
      summary: "Finish campaign-linked expeditions so the Board can stop calling those roads 'optimistic'.",
      objective: { type: "campaignDungeon", count: 2, label: "Campaign expeditions completed" },
      rewardCp: 16000,
      reputation: 50,
      minRank: 1,
    },
    {
      id: "long-haul-ledger",
      name: "Long-Haul Ledger",
      group: "Reliability",
      summary: "Complete several expeditions under the same posting. The Board likes boring proof. Boring proof gets paid.",
      objective: { type: "dungeonComplete", count: 5, label: "Expeditions completed" },
      rewardCp: 32000,
      reputation: 90,
      minRank: 2,
    },
  ],
  turnIns: [
    {
      id: "torch-bundles",
      name: "Torch Bundles",
      summary: "A route is easier to sell when people can see the floor.",
      requirement: { itemId: "torch" },
      quantity: 5,
      rewardCp: 700,
      reputation: 5,
    },
    {
      id: "lamp-oil",
      name: "Lantern Oil",
      summary: "Clean flasks for long route teams and anyone who believes darkness is negotiable.",
      requirement: { itemId: "lantern-oil" },
      quantity: 4,
      rewardCp: 1200,
      reputation: 7,
    },
    {
      id: "repair-stock",
      name: "Repair Stock",
      summary: "Wood, cloth, leather, and iron for carts, packs, splints, and excuses.",
      requirement: { type: "component", tagsAny: ["wood", "cloth", "leather", "metal", "crafting"] },
      quantity: 6,
      rewardCp: 4500,
      reputation: 12,
    },
  ],
  dungeonMatchesContract(context, contract) {
    const objective = contract?.objective ?? {};
    if (objective.type === "dungeonComplete") return true;
    if (objective.type === "campaignDungeon") return Boolean(context?.campaignId);
    return false;
  },
});

function acceptExpeditionContract(contractId) {
  expeditionBoardApi.acceptContract(contractId);
}

function completeExpeditionContract(contractId) {
  expeditionBoardApi.completeContract(contractId);
}

function completeExpeditionTurnIn(turnInId) {
  expeditionBoardApi.completeTurnIn(turnInId);
}

function cancelExpeditionContract(contractId) {
  return expeditionBoardApi.cancelContract(contractId);
}

const boomClubApi = createCompactGuildBoard({
  id: "boom-club",
  stateKey: "boomClub",
  label: "Fizzwick's Boom Club",
  unlockFlag: "flag.village.boomClubUnlocked",
  boardClass: "boom-board",
  heroClass: "boom-hero",
  actionsTitle: "Test Bench",
  contractsTitle: "Experiments",
  turnInsTitle: "Volatile Turn-Ins",
  readyContractText: "experiment",
  readyTurnInText: "sample turn-in",
  claimLabel: "Present Data",
  workingLabel: "Testing",
  completedLabel: "Recorded",
  turnInReadyLabel: "Submit",
  turnInWaitingLabel: "Need Sparks",
  acceptLogName: "Fizzwick Boomwhistle",
  payLogName: "Fizzwick's Boom Club",
  turnInLogName: "Fizzwick Boomwhistle",
  adminMidRep: 70,
  adminHighRep: 160,
  adminMidLabel: "Certified Spark",
  adminHighLabel: "Blast Fellow",
  cancelType: "boom-club",
  ranks: [
    { name: "Observer", threshold: 0, reward: "Fizzwick will accept basic volatile errands." },
    { name: "Fuse Holder", threshold: 25, reward: "The club posts more interesting reagent tests." },
    { name: "Certified Spark", threshold: 70, reward: "Fizzwick trusts the party near things with labels like 'probably'." },
    { name: "Blast Fellow", threshold: 160, reward: "Rare explosive research and better volatile payments open." },
    { name: "Honorary Crater", threshold: 320, reward: "Reserved for future experimental devices and alarming applause." },
  ],
  contracts: [
    {
      id: "spark-samples",
      name: "Spark Samples",
      group: "Field Tests",
      summary: "Recover fire, brimstone, coal, or other warm-tempered materials for controlled observations.",
      objective: { type: "collectFire", count: 4, label: "Hot samples logged" },
      rewardCp: 8500,
      reputation: 25,
      minRank: 0,
    },
    {
      id: "boom-inventory",
      name: "Boom Inventory",
      group: "Field Tests",
      summary: "Bring back explosive tools, alchemical fire, or reagents that make shelves nervous.",
      objective: { type: "collectExplosive", count: 3, label: "Boom items logged" },
      rewardCp: 14000,
      reputation: 45,
      minRank: 1,
    },
    {
      id: "pressure-and-regret",
      name: "Pressure and Regret",
      group: "Advanced Mischief",
      summary: "Collect pressure cores, primal motes, and volatile planar matter. Fizzwick promises to squint responsibly.",
      objective: { type: "collectBoom", count: 3, label: "Advanced samples logged" },
      rewardCp: 28000,
      reputation: 85,
      minRank: 2,
    },
  ],
  turnIns: [
    {
      id: "coal-and-brimstone",
      name: "Coal and Brimstone",
      summary: "The dependable foundation of every lecture that ends with everyone stepping back.",
      requirement: { type: "component", tagsAny: ["coal", "brimstone", "sulfur"] },
      quantity: 5,
      rewardCp: 3500,
      reputation: 9,
    },
    {
      id: "fire-reagents",
      name: "Fire Reagents",
      summary: "Embers, flame essence, hot ash, and similar substances with opinions about furniture.",
      requirement: { type: "component", tagsAny: ["fire", "ember", "ash", "heat", "lava"] },
      quantity: 3,
      rewardCp: 8000,
      reputation: 16,
    },
    {
      id: "pressure-parts",
      name: "Pressure Parts",
      summary: "Cores, gears, slag glass, and crystal bits for safer casings. Safer than last time, anyway.",
      requirement: { type: "component", tagsAny: ["pressure", "gear", "slag", "glass", "crystal", "arcane-reagent"] },
      quantity: 4,
      rewardCp: 11000,
      reputation: 20,
    },
    {
      id: "infernal-volatiles",
      name: "Infernal Volatiles",
      summary: "Hellfire, demon ichor, abyssal bile, and materials best stored in boxes labeled 'no'.",
      requirement: { type: "component", tagsAny: ["infernal", "abyssal", "hell", "demon", "devil", "chaos"] },
      quantity: 2,
      rewardCp: 15000,
      reputation: 28,
    },
  ],
  itemMatchesContract(item, contract) {
    const objective = contract?.objective ?? {};
    const text = itemSearchText(item);
    const fire = itemHasAnyTag(item, ["fire", "ember", "ash", "heat", "lava", "brimstone", "sulfur", "coal"]) || /\b(fire|ember|ash|heat|lava|brimstone|sulfur|coal)\b/.test(text);
    const explosive =
      itemHasAnyTag(item, ["bomb", "explosive", "boom", "alchemy", "volatile"]) ||
      /\b(alchemist's fire|alchemists-fire|bomb|explosive|volatile|boom)\b/.test(text);
    const advanced =
      itemHasAnyTag(item, ["pressure", "primal", "chaos", "infernal", "abyssal", "arcane-reagent", "magic-reagent"]) ||
      /\b(pressure core|primal|chaos|infernal|abyssal|hellfire|ichor|bile|slag|crystal)\b/.test(text);
    if (objective.type === "collectFire") return fire;
    if (objective.type === "collectExplosive") return explosive || item?.id === "alchemists-fire";
    if (objective.type === "collectBoom") return advanced || (fire && explosive);
    return false;
  },
});

function acceptBoomClubContract(contractId) {
  boomClubApi.acceptContract(contractId);
}

function completeBoomClubContract(contractId) {
  boomClubApi.completeContract(contractId);
}

function completeBoomClubTurnIn(turnInId) {
  boomClubApi.completeTurnIn(turnInId);
}

function cancelBoomClubContract(contractId) {
  return boomClubApi.cancelContract(contractId);
}

const fightingPitId = "fighting-pit";
const fightingPitStateKey = "fightingPit";
const fightingPitMaxCategory = 10;
const fightingPitBossInterval = 4;
const fightingPitShortRestLimit = 5;
const fightingPitRenownByCategory = 8;
const fightingPitRewardCpByCategory = 1800;

function fightingPitProgress() {
  state.questFlags = { ...(state.questFlags ?? {}) };
  state.questFlags[fightingPitStateKey] ??= {};
  const progress = state.questFlags[fightingPitStateKey];
  progress.renown = Math.max(0, Math.floor(Number(progress.renown) || 0));
  progress.bestWave = Math.max(0, Math.floor(Number(progress.bestWave) || 0));
  progress.bestCategory = Math.max(0, Math.floor(Number(progress.bestCategory) || 0));
  progress.totalDefeated = Math.max(0, Math.floor(Number(progress.totalDefeated) || 0));
  progress.bossesDefeated = Math.max(0, Math.floor(Number(progress.bossesDefeated) || 0));
  progress.runs = Math.max(0, Math.floor(Number(progress.runs) || 0));
  return progress;
}

function fightingPitWaveCategory(wave = 1) {
  return clamp(Math.ceil(Math.max(1, Math.floor(Number(wave) || 1)) / fightingPitBossInterval), 1, fightingPitMaxCategory);
}

function fightingPitWaveIsBoss(wave = 1) {
  return Math.max(1, Math.floor(Number(wave) || 1)) % fightingPitBossInterval === 0;
}

function fightingPitWaveLabel(wave = 1) {
  const category = fightingPitWaveCategory(wave);
  return `Wave ${Math.max(1, Math.floor(Number(wave) || 1))} - Category ${category}${fightingPitWaveIsBoss(wave) ? " Boss" : ""}`;
}

function fightingPitCurrentRun() {
  const run = state?.questFlags?.fightingPitRun;
  return run && typeof run === "object" ? run : null;
}

function fightingPitMonsterTemplates(category, boss = false) {
  const desired = Math.max(1, Math.floor(Number(category) || 1));
  const entries = window.DungeonContent
    .list("monsters")
    .filter((monster) => Math.max(1, Math.floor(Number(monsterCategory(monster)) || 1)) === desired)
    .filter((monster) => {
      const tags = new Set((monster.tags ?? []).map((tag) => String(tag).toLowerCase()));
      const text = [monster.id, monster.name, monster.role].filter(Boolean).join(" ").toLowerCase();
      const isBoss = tags.has("boss") || /\bboss\b|champion|lord|matriarch|overseer/.test(text);
      return boss ? isBoss : !isBoss;
    });
  if (entries.length) return entries;
  return window.DungeonContent.list("monsters").filter((monster) => Math.max(1, Math.floor(Number(monsterCategory(monster)) || 1)) === desired);
}

function fightingPitPickMonsterTemplate(category, boss = false, index = 0) {
  const templates = fightingPitMonsterTemplates(category, boss);
  return templates[index % Math.max(1, templates.length)] ?? getMonsterTemplate(defaultContent.monster);
}

function fightingPitArenaTemplate() {
  const cells = [];
  for (let y = 5; y <= 20; y += 1) {
    for (let x = 5; x <= 24; x += 1) cells.push({ x, y });
  }
  return {
    id: "fighting-pit-arena",
    name: "Fighting Pit",
    themeId: currentThemeId?.() ?? defaultContent.theme,
    dungeon: {
      id: "fighting-pit-arena",
      roomCount: 1,
      gridSize: 30,
      rooms: [{ id: "pit-floor", name: "Pit Floor", cells, doors: [] }],
      walkable: cells,
      corridors: [],
      doors: [],
      corridorPassages: [],
      entranceRoomId: "pit-floor",
      startPosition: { x: 14, y: 13 },
    },
    objects: [],
    monsters: [],
    exit: { roomId: "pit-floor", position: { x: 14, y: 4 } },
    goal: { type: "fightingPit" },
    intro: { text: "", images: [] },
    outro: { text: "", images: [] },
  };
}

function fightingPitSpawnPositions(count) {
  const positions = [
    { x: 14, y: 7 },
    { x: 10, y: 8 },
    { x: 18, y: 8 },
    { x: 7, y: 12 },
    { x: 21, y: 12 },
    { x: 10, y: 17 },
    { x: 18, y: 17 },
    { x: 14, y: 19 },
  ];
  const occupied = new Set(partyHeroes().flatMap((hero) => window.DungeonGrid.fighterCells(hero)).map(positionKey));
  return positions.filter((position) => !occupied.has(positionKey(position))).slice(0, count);
}

function fightingPitWaveMonsterCount(category, boss = false) {
  if (boss) return 1;
  const template = fightingPitPickMonsterTemplate(category, false, 0);
  const hero = {
    ...(activeHero() ?? {}),
    level: Math.max(1, category * 2 - 1),
    partySize: partyHeroes().length,
    partyAverageLevel: Math.max(1, category * 2 - 1),
  };
  return roomMonsterSpawnCount(template, hero);
}

function clearFightingPitWaveMonsters() {
  const partyIds = new Set(state.party?.heroIds ?? ["hero"]);
  for (const [id, fighter] of Object.entries(state.fighters ?? {})) {
    if (!partyIds.has(id) && fighter?.fightingPitMonster) delete state.fighters[id];
  }
  state.initiative = [];
  state.activeIndex = 0;
  state.combatStarted = false;
  state.mode = "exploration";
}

async function spawnFightingPitWave() {
  const run = fightingPitCurrentRun();
  if (!run || state.completed) return false;
  clearFightingPitWaveMonsters();
  const wave = Math.max(1, Math.floor(Number(run.wave) || 1));
  const category = fightingPitWaveCategory(wave);
  const boss = fightingPitWaveIsBoss(wave);
  const hero = {
    ...(activeHero() ?? {}),
    level: Math.max(1, category * 2 - 1),
    partySize: partyHeroes().length,
    partyAverageLevel: Math.max(1, category * 2 - 1),
  };
  const count = fightingPitWaveMonsterCount(category, boss);
  const positions = fightingPitSpawnPositions(count);
  const room = state.dungeon?.rooms?.find((entry) => entry.id === "pit-floor") ?? state.dungeon?.rooms?.[0];
  for (let index = 0; index < positions.length; index += 1) {
    const template = fightingPitPickMonsterTemplate(category, boss, index);
    if (!template) continue;
    const monster = createCombatant({
      ...template,
      id: `pit-wave-${wave}-${index + 1}`,
      name: boss ? `${template.name} of the Pit` : `${template.name}${positions.length > 1 ? ` ${index + 1}` : ""}`,
      baseMonsterId: template.id,
      templateId: template.id,
    });
    if (boss) {
      monster.customBoss = true;
      monster.tags = Array.from(new Set([...(monster.tags ?? []), "boss"]));
      monster.maxHp = Math.ceil((monster.maxHp ?? 1) * Math.max(1.2, partyHeroes().length * 0.85));
      monster.hp = monster.maxHp;
    }
    applyMonsterCategoryScaling(monster, hero);
    monster.fightingPitMonster = true;
    monster.fightingPitWave = wave;
    monster.roomId = room?.id ?? "pit-floor";
    monster.position = { ...positions[index] };
    state.fighters[monster.id] = monster;
  }
  run.currentWaveSpawned = positions.length;
  run.currentWaveBoss = boss;
  run.currentWaveCategory = category;
  addLog(`${fightingPitWaveLabel(wave)} begins.`, "important");
  render();
  if (positions.length > 0 && typeof rollInitiative === "function") await rollInitiative();
  return positions.length > 0;
}

function awardFightingPitWave() {
  const run = fightingPitCurrentRun();
  if (!run) return null;
  const wave = Math.max(1, Math.floor(Number(run.wave) || 1));
  const category = fightingPitWaveCategory(wave);
  const boss = fightingPitWaveIsBoss(wave);
  const defeated = Math.max(0, Math.floor(Number(run.currentWaveSpawned) || 0));
  const rewardCp = defeated * category * fightingPitRewardCpByCategory + (boss ? category * fightingPitRewardCpByCategory * 2 : 0);
  const renown = defeated * category * fightingPitRenownByCategory + (boss ? category * 20 : 0);
  addMoney(activeHero().inventory.money, rewardCp);
  run.defeated = (run.defeated ?? 0) + defeated;
  run.renown = (run.renown ?? 0) + renown;
  run.rewardCp = (run.rewardCp ?? 0) + rewardCp;
  const progress = fightingPitProgress();
  progress.renown += renown;
  progress.totalDefeated += defeated;
  progress.bestWave = Math.max(progress.bestWave, wave);
  progress.bestCategory = Math.max(progress.bestCategory, category);
  if (boss) progress.bossesDefeated += 1;
  addLog(`The pit pays ${priceText(rewardCp)} and awards ${renown} renown for ${defeated} defeated foe${defeated === 1 ? "" : "s"}.`, "important");
  return { wave, category, boss, defeated, rewardCp, renown };
}

async function grantFightingPitBossRest(category) {
  if ((state.shortRestsUsed ?? 0) >= fightingPitShortRestLimit) {
    addLog("The pit rest limit is spent. Brakka rings the next bracket in without a rest.", "important");
    return;
  }
  addLog(`Boss checkpoint cleared. The party may take a short rest before Category ${Math.min(fightingPitMaxCategory, category + 1)}, or press on.`, "important");
  const rested = await showShortRestMenu(false);
  if (!rested) addLog("The party skips the pit checkpoint rest and presses on.", "important");
}

async function handleFightingPitWaveClear() {
  const run = fightingPitCurrentRun();
  if (!run || state.completed || state.mode === "home") return false;
  const award = awardFightingPitWave();
  if (!award) return false;
  if (award.boss) await grantFightingPitBossRest(award.category);
  if (award.boss && award.category >= fightingPitMaxCategory) {
    state.completed = true;
    run.completedAt = Date.now();
    addLog("Brakka Ironbell rings the final bell. The Fighting Pit run is complete.", "important");
    render();
    return true;
  }
  run.wave = Math.max(1, Math.floor(Number(run.wave) || 1)) + 1;
  await spawnFightingPitWave();
  render();
  return true;
}

function renderFightingPit(npc = window.DungeonContent.get("npcs", fightingPitId)) {
  els.villageMenu?.classList.remove("npc-chat-open");
  els.villageMenu?.classList.add("guild-open");
  setVillageBackButtonVisible(true);
  const progress = fightingPitProgress();
  const nextWave = progress.bestWave > 0 ? progress.bestWave + 1 : 1;
  els.villageBody.innerHTML = `
    <section class="guild-board fighting-pit-board">
      <section class="guild-hero fighting-pit-hero">
        ${factionSymbolMarkup(fightingPitId)}
        ${npcPortraitMarkup(npc, "guild-portrait", { clickable: false })}
        <div class="guild-hero-text">
          <span>Fighting Pit</span>
          <h3>${guildNpcNameButtonMarkup(npc, "Pit Marshal")}</h3>
          <b>${escapeHtml(npc?.title ?? "")}</b>
          <p>${escapeHtml(npcEntryLine(npc) || npc?.description || "")}</p>
        </div>
        <div class="guild-hero-stats">
          <div><span>Renown</span><b>${escapeHtml(progress.renown)}</b></div>
          <div><span>Best Wave</span><b>${escapeHtml(progress.bestWave)}</b></div>
          <div><span>Bosses</span><b>${escapeHtml(progress.bossesDefeated)}</b></div>
        </div>
      </section>
      <div class="guild-board-grid">
        <aside class="guild-board-side">
          <section class="guild-status">
            <div><span>Next Bracket</span><b>${escapeHtml(fightingPitWaveLabel(nextWave))}</b></div>
            <div><span>Short Rests</span><b>0 / ${escapeHtml(fightingPitShortRestLimit)}</b></div>
            <p>This is a controlled fighting pit: weapons are blunted, medics are ready at the rail, and heroes cannot die here. Three normal waves per category, then a boss. Boss checkpoints offer an optional short rest.</p>
          </section>
          <section class="guild-actions-panel">
            <h3>Pit Gate</h3>
            <button type="button" data-action="start-fighting-pit">Enter the Pit</button>
          </section>
        </aside>
        <main class="guild-board-main">
          <section class="guild-section">
            <h3>Wave Rules</h3>
            <div class="guild-contract-list">
              <article class="guild-contract-row"><div><b>Category Ladder</b><span>Category 1 normal waves x3, then a Category 1 boss. The pattern repeats upward through Category ${escapeHtml(fightingPitMaxCategory)}.</span><small>Wave balance scales with active party size.</small></div></article>
              <article class="guild-contract-row"><div><b>Rewards</b><span>Coin and renown are paid after each cleared wave based on defeated foes and category. Boss waves pay extra.</span><small>Current rate: ${escapeHtml(priceText(fightingPitRewardCpByCategory))} and ${escapeHtml(fightingPitRenownByCategory)} renown per foe per category.</small></div></article>
              <article class="guild-contract-row"><div><b>Safety Rule</b><span>Blunted weapons and waiting medics make the bout nonlethal. A hero can be battered to the brink, but cannot die in the pit.</span></div></article>
              <article class="guild-contract-row"><div><b>Rest Rule</b><span>After each boss, the party may take an optional short rest checkpoint. The pit allows up to ${escapeHtml(fightingPitShortRestLimit)} short rests and never grants a long rest mid-run.</span></div></article>
            </div>
          </section>
        </main>
        <aside class="guild-board-rewards">
          <section class="guild-section">
            <h3>Pit Record</h3>
            <div class="guild-rewards">
              <div class="unlocked"><b>Total Defeated</b><span>${escapeHtml(progress.totalDefeated)} enemies</span></div>
              <div class="unlocked"><b>Best Category</b><span>${escapeHtml(progress.bestCategory || 0)}</span></div>
              <div class="unlocked"><b>Runs Started</b><span>${escapeHtml(progress.runs)}</span></div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  `;
  els.villageMenu.classList.remove("hidden");
  resetVillageScroll();
  setVillageMusicKey(villageMusicKeyForNpc(fightingPitId));
}

async function startFightingPitRun() {
  normalizeActivePartyOwnerBindings();
  const partyIds = state.party?.heroIds ?? ["hero"];
  const partyMembers = partyIds.map((id) => state.fighters[id]).filter((hero) => hero && !hero.dead);
  if (partyMembers.length === 0) {
    addLog("Choose at least one hero before entering the Fighting Pit.", "important");
    return;
  }
  const previousState = state;
  state = createCustomDungeonStateFromTemplate(partyMembers, state, fightingPitArenaTemplate());
  if (!state) {
    state = previousState;
    addLog("The Fighting Pit could not be prepared.", "important");
    return;
  }
  state.shortRestLimit = fightingPitShortRestLimit;
  state.questFlags.fightingPitRun = {
    active: true,
    wave: 1,
    defeated: 0,
    renown: 0,
    rewardCp: 0,
    startedAt: Date.now(),
  };
  fightingPitProgress().runs += 1;
  roomIsBuilt = false;
  hideVillageMenu();
  hideHomeMenu();
  render();
  window.DepthboundPlaytest?.syncNow?.();
  centerViewOnHero();
  await spawnFightingPitWave();
}

window.DungeonNpcBehaviors[fightingPitId] = {
  visit: renderFightingPit,
  returnToVisit: () => renderFightingPit(),
  adminProgressEntries() {
    const progress = fightingPitProgress();
    return [
      {
        id: "locked",
        npcId: fightingPitId,
        groupId: fightingPitId,
        groupLabel: "Fighting Pit",
        label: "Locked",
        description: "Hide the Fighting Pit until its story unlock.",
        active: !state.questFlags?.["flag.village.fightingPitUnlocked"],
      },
      {
        id: "unlocked",
        npcId: fightingPitId,
        groupId: fightingPitId,
        groupLabel: "Fighting Pit",
        label: "Unlocked",
        description: "Show the Fighting Pit with no renown.",
        active: Boolean(state.questFlags?.["flag.village.fightingPitUnlocked"]) && progress.renown < 200,
      },
      {
        id: "renowned",
        npcId: fightingPitId,
        groupId: fightingPitId,
        groupLabel: "Fighting Pit",
        label: "Renowned",
        description: "Set renown for testing pit record displays.",
        active: progress.renown >= 200,
      },
    ];
  },
  setAdminProgress(progressId) {
    if (!adminEnabled()) return;
    state.questFlags = { ...(state.questFlags ?? {}) };
    const progress = fightingPitProgress();
    if (progressId === "locked") {
      delete state.questFlags["flag.village.fightingPitUnlocked"];
      progress.renown = 0;
      progress.bestWave = 0;
      progress.bestCategory = 0;
    } else {
      state.questFlags["flag.village.fightingPitUnlocked"] = true;
      if (progressId === "renowned") {
        progress.renown = 200;
        progress.bestWave = Math.max(progress.bestWave, 8);
        progress.bestCategory = Math.max(progress.bestCategory, 2);
      }
    }
    addLog(`Admin set Fighting Pit progress: ${progressId}.`, "important");
  },
};

const nonMetalWeaponIds = new Set(["club", "greatclub", "quarterstaff", "shortbow", "longbow", "sling", "blowgun", "crossbow-light", "crossbow-hand", "crossbow-heavy", "hoopak"]);

function itemIsStandardNonMagic(item) {
  return Boolean(item && item.store?.buyable !== false && !item.tags?.includes("loot:magic") && !item.tags?.includes("magic") && !item.magic && item.type !== "treasure");
}

function itemIsWeaponsmithStock(item) {
  return item?.type === "weapon" && itemIsStandardNonMagic(item) && !nonMetalWeaponIds.has(item.id);
}

function itemIsArmorsmithStock(item) {
  return item?.type === "armor" && itemIsStandardNonMagic(item);
}

function itemIsGeneralMerchantStock(item) {
  return itemIsStandardNonMagic(item) && (item.type === "ammunition" || item.id === "potion-healing" || ["torch", "hooded-lantern", "lantern-oil"].includes(item.id));
}

function itemIsAlchemistStock(item) {
  if (!item || item.store?.buyable === false || item.tags?.includes("loot:magic") || item.type === "treasure") return false;
  if (item.type !== "consumable") return false;
  const tags = new Set((item.tags ?? []).map((tag) => String(tag).toLowerCase()));
  return item.category === "potion" || item.id === "alchemists-fire" || tags.has("potion") || tags.has("bomb") || tags.has("explosive");
}

function itemIsArcanistStock(item) {
  return Boolean(item?.type === "consumable" && item.use?.kind === "spellScroll" && item.tags?.includes("spell-scroll"));
}

function storeBuysFromParty(npc = storeNpcDefinition()) {
  return npc?.shop?.buysFromParty !== false;
}

function storeAcceptsSoldItem(item, npc = storeNpcDefinition()) {
  if (!storeBuysFromParty(npc)) return false;
  const acceptedTypes = npc?.shop?.acceptsSoldTypes ?? ["any"];
  return acceptedTypes.includes("any") || acceptedTypes.includes(item?.type);
}

function storeItemBuyValueCp(item, npc = storeNpcDefinition()) {
  const base = itemValueCp(item);
  const multiplier = Math.max(0, Number(npc?.shop?.buyPriceMultiplier ?? 1) || 1);
  return Math.max(0, Math.floor(base * multiplier));
}

function storeItemSellValueCp(item, npc = storeNpcDefinition()) {
  if (item?.starterEquipment) return 0;
  if (item?.sell?.valueCp !== undefined) return Math.max(0, Math.floor(item.sell.valueCp));
  const sellRate = Number(npc?.shop?.sellRate ?? item?.sell?.rate ?? 0.5) || 0.5;
  const baseValue = itemValueCp(item);
  if (baseValue <= 0) return 0;
  return Math.max(1, Math.floor(baseValue * sellRate));
}

function storeNpcDefinition() {
  return window.DungeonContent.get("npcs", activeStoreNpcId) ?? window.DungeonContent.get("npcs", "general-merchant") ?? {
    id: "general-merchant",
    name: "General Merchant",
    title: "General Merchant",
    shop: { type: "general", sellRate: 0.4, acceptsSoldTypes: ["any"] },
    dialogue: { entryLines: ["Welcome to my store."] },
  };
}

function smithMaterialCommissionForNpc(npcId) {
  if (!smithMaterialCommissionRequests[npcId]) return null;
  state.questFlags = { ...(state.questFlags ?? {}) };
  const commissions = smithMaterialCommissionState(state.questFlags);
  commissions[npcId] ??= randomSmithMaterialCommission(npcId);
  return commissions[npcId];
}

function smithMaterialCommissionRewardCp(commission) {
  return Math.max(0, Math.floor(Number(commission?.quantity) || 0) * Math.floor(Number(commission?.rewardGpPerResource ?? smithMaterialCommissionRewardGpPerResource) || 0) * 100);
}

function smithMaterialCommissionRequirement(commission) {
  return commission?.requirement ?? (commission?.itemId ? { itemId: commission.itemId } : {});
}

function smithMaterialCommissionLabel(commission) {
  if (commission?.label) return commission.label;
  const item = getItemTemplate(commission?.itemId);
  if (item?.name) return item.name;
  const requirement = smithMaterialCommissionRequirement(commission);
  if (requirement.category) return `any ${requirement.category}`;
  if (requirement.tagsAny?.length) return `any ${requirement.tagsAny.join(" or ")}`;
  if (requirement.tagsAll?.length) return `materials tagged ${requirement.tagsAll.join(", ")}`;
  return "matching materials";
}

function smithMaterialCommissionRequestText(npc, commission) {
  const quantity = Math.max(1, Math.floor(Number(commission?.quantity) || 1));
  const template = commission?.requestText ?? `${npc?.name ?? "The merchant"} needs {quantity} ${smithMaterialCommissionLabel(commission)}.`;
  return template
    .replaceAll("{npc}", npc?.name ?? "The merchant")
    .replaceAll("{quantity}", String(quantity))
    .replaceAll("{materials}", smithMaterialCommissionLabel(commission));
}

function titleCaseText(value) {
  return String(value ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}

function smithMaterialCommissionMarkup(npc) {
  const commission = smithMaterialCommissionForNpc(npc?.id);
  if (!commission) return "";
  const requirement = smithMaterialCommissionRequirement(commission);
  const itemName = smithMaterialCommissionLabel(commission);
  const quantity = Math.max(1, Math.floor(Number(commission.quantity) || 1));
  const have = partyResourceCountForRequirement(requirement);
  const rewardCp = smithMaterialCommissionRewardCp(commission);
  const ready = have >= quantity;
  const accepted = commission.status === "accepted";
  const completed = commission.status === "completed";
  const prompt = accepted
    ? `${smithMaterialCommissionRequestText(npc, commission)}`
    : completed
      ? `${npc.name} has paid for this order. Check back after the next outing.`
      : smithMaterialCommissionRequestText(npc, commission);
  return `
    <section class="store-section">
      <h3>Material Commission</h3>
      <div class="store-row">
        <div>
          <b>${escapeHtml(quantity)} ${escapeHtml(titleCaseText(itemName))}</b>
          <span>${escapeHtml(prompt)} Satchel: ${escapeHtml(have)}/${escapeHtml(quantity)} - Reward: ${escapeHtml(priceText(rewardCp))}</span>
        </div>
        ${
          completed
            ? `<button type="button" disabled>Paid</button>`
            : accepted
              ? `<button type="button" data-action="complete-smith-commission" data-npc="${escapeAttribute(npc.id)}" ${ready ? "" : "disabled"}>${ready ? "Hand In" : "Need Materials"}</button>`
            : `<div class="store-row-actions">
                  <button type="button" data-action="accept-smith-commission" data-npc="${escapeAttribute(npc.id)}">Accept</button>
                  <button type="button" data-action="complete-smith-commission" data-npc="${escapeAttribute(npc.id)}" ${ready ? "" : "disabled"}>${ready ? "Hand In" : "Need Materials"}</button>
                </div>`
        }
      </div>
    </section>
  `;
}

function borrenClaimHammerText() {
  return window.DungeonNpcQuestText?.borren?.questChains?.claimHammer ?? {
    itemId: "magic-embervein-claim-hammer",
    questKey: "borrenClaimHammer",
    storeSectionTitle: "Relic Claim",
    itemName: "Embervein Claim Hammer",
    rewardText: "quest reward",
    storeText: {
      available: "Borren asks to see the hammer.",
      accepted: "Borren is waiting for the hammer.",
      completed: "Borren has the hammer.",
    },
    buttons: {
      accept: "Ask Borren",
      complete: "Give Hammer",
      incomplete: "Need Hammer",
      completed: "Returned",
    },
    logs: {
      accept: "Borren asks the party to return the hammer to his forge.",
      complete: "Borren accepts the hammer.",
      cancel: "Borren's hammer request is no longer accepted.",
    },
    questLog: {
      giver: "Borren Ashmantle",
      title: "The First Claim Hammer",
      description: "Bring Borren the hammer.",
      objectiveLabel: "Embervein Claim Hammer",
    },
  };
}

const borrenClaimHammerItemId = borrenClaimHammerText().itemId;
const borrenClaimHammerQuestKey = borrenClaimHammerText().questKey;

function borrenClaimHammerRequirement() {
  return { itemId: borrenClaimHammerItemId };
}

function borrenClaimHammerState() {
  state.questFlags = { ...(state.questFlags ?? {}) };
  state.questFlags[borrenClaimHammerQuestKey] ??= { status: "available" };
  return state.questFlags[borrenClaimHammerQuestKey];
}

function borrenClaimHammerCount() {
  return materialCountForRequirement(borrenClaimHammerRequirement());
}

function borrenClaimHammerMarkup(npc) {
  if (npc?.id !== "armorsmith") return "";
  const text = borrenClaimHammerText();
  const quest = borrenClaimHammerState();
  const have = borrenClaimHammerCount();
  const accepted = quest.status === "accepted";
  const completed = quest.status === "completed";
  if (!completed && !accepted && have <= 0) return "";
  return `
    <section class="store-section">
      <h3>${escapeHtml(text.storeSectionTitle)}</h3>
      <div class="store-row">
        <div>
          <b>${escapeHtml(text.itemName)}</b>
          <span>${
            completed
              ? escapeHtml(text.storeText.completed)
              : accepted
                ? escapeHtml(text.storeText.accepted)
                : escapeHtml(text.storeText.available)
          }</span>
        </div>
        ${
          completed
            ? `<button type="button" disabled>${escapeHtml(text.buttons.completed)}</button>`
            : accepted
              ? `<button type="button" data-action="complete-borren-claim-hammer" ${have >= 1 ? "" : "disabled"}>${escapeHtml(have >= 1 ? text.buttons.complete : text.buttons.incomplete)}</button>`
              : `<button type="button" data-action="accept-borren-claim-hammer">${escapeHtml(text.buttons.accept)}</button>`
        }
      </div>
    </section>
  `;
}

function acceptBorrenClaimHammerQuest() {
  const quest = borrenClaimHammerState();
  if (quest.status === "completed") return;
  quest.status = "accepted";
  quest.acceptedAt = Date.now();
  addLog(borrenClaimHammerText().logs.accept, "important");
  renderStoreMenu();
}

function completeBorrenClaimHammerQuest() {
  const quest = borrenClaimHammerState();
  if (quest.status === "completed" || borrenClaimHammerCount() < 1) return;
  if (!consumeMaterialsForRequirement(borrenClaimHammerRequirement(), 1)) return;
  const hero = activeHero();
  addMoney(hero.inventory.money, 10000);
  addPartyResourceItem(getItemTemplate("embervein-ore"), 3);
  quest.status = "completed";
  quest.completedAt = Date.now();
  state.questFlags["flag.borren.claimHammerReturned"] = true;
  state.questFlags["flag.borren.smithChainStarted"] = true;
  addLog(borrenClaimHammerText().logs.complete, "important");
  renderStoreMenu();
  renderInventoryMenu();
}

function acceptSmithMaterialCommission(npcId) {
  const npc = window.DungeonContent.get("npcs", npcId);
  const commission = smithMaterialCommissionForNpc(npcId);
  if (!npc || !commission || commission.status === "completed") return;
  commission.status = "accepted";
  commission.acceptedAt = Date.now();
  addLog(smithMaterialCommissionRequestText(npc, commission), "important");
  renderStoreMenu();
}

function cancelSmithMaterialCommission(npcId) {
  const npc = window.DungeonContent.get("npcs", npcId);
  const commission = smithMaterialCommissionForNpc(npcId);
  if (!npc || !commission || commission.status !== "accepted") return false;
  commission.status = "available";
  commission.cancelledAt = Date.now();
  delete commission.acceptedAt;
  addLog(`${npc.name}'s material commission is no longer accepted.`, "important");
  if (!els.storeMenu.classList.contains("hidden") && activeStoreNpcId === npcId) renderStoreMenu();
  return true;
}

function completeSmithMaterialCommission(npcId) {
  showSmithMaterialCommissionHandIn(npcId);
}

function selectedSmithCommissionContributions() {
  return Array.from(els.gameDialogField.querySelectorAll("[data-errand-material-input]"))
    .map((input) => ({
      itemId: input.dataset.item,
      quantity: Math.max(0, Math.floor(Number(input.value) || 0)),
      max: Math.max(0, Math.floor(Number(input.max) || 0)),
    }))
    .filter((entry) => entry.itemId && entry.quantity > 0);
}

function validateSmithCommissionContributions(commission, contributions) {
  const requirement = smithMaterialCommissionRequirement(commission);
  const target = Math.max(1, Math.floor(Number(commission.quantity) || 1));
  const total = contributions.reduce((sum, entry) => sum + entry.quantity, 0);
  if (total !== target) return `Choose exactly ${target} total material${target === 1 ? "" : "s"}.`;
  for (const entry of contributions) {
    if (entry.quantity > entry.max) return "One of the selected quantities is higher than the satchel stack.";
    const item = getItemTemplate(entry.itemId);
    if (!item || !itemMatchesRequirement(item, requirement)) return "One of the selected materials no longer matches this errand.";
    if (partyResourceCount(entry.itemId) < entry.quantity) return "One of the selected satchel stacks has changed.";
  }
  return "";
}

function applySmithMaterialCommissionHandIn(npcId, commission, contributions) {
  const npc = window.DungeonContent.get("npcs", npcId);
  if (!npc || !commission || commission.status === "completed") return;
  const error = validateSmithCommissionContributions(commission, contributions);
  if (error) return;
  for (const entry of contributions) consumePartyResource(entry.itemId, entry.quantity);
  const rewardCp = smithMaterialCommissionRewardCp(commission);
  addMoney(activeHero().inventory.money, rewardCp);
  commission.status = "completed";
  commission.completedAt = Date.now();
  const materialText = contributions
    .map((entry) => `${entry.quantity} ${getItemTemplate(entry.itemId)?.name ?? entry.itemId}`)
    .join(", ");
  addLog(`${npc.name} takes ${materialText} and pays ${priceText(rewardCp)}.`, "important");
  render();
  renderStoreMenu();
}

function showSmithMaterialCommissionHandIn(npcId) {
  const npc = window.DungeonContent.get("npcs", npcId);
  const commission = smithMaterialCommissionForNpc(npcId);
  if (!npc || !commission || commission.status === "completed") return;
  const requirement = smithMaterialCommissionRequirement(commission);
  const quantity = Math.max(1, Math.floor(Number(commission.quantity) || 1));
  const stacks = partyResourceStacksForRequirement(requirement);
  if (stacks.reduce((sum, stack) => sum + stack.quantity, 0) < quantity) return;
  els.gameDialogTitle.textContent = `Hand In Materials`;
  els.gameDialogMessage.innerHTML = `<p>${escapeHtml(smithMaterialCommissionRequestText(npc, commission))} Choose exactly what to hand over.</p>`;
  els.gameDialogField.classList.remove("hidden");
  els.gameDialogField.innerHTML = `
    <div class="errand-material-picker">
      ${stacks
        .map(
          (stack) => `
            <label>
              <span>${escapeHtml(stack.item?.name ?? stack.itemId)} <small>have ${escapeHtml(stack.quantity)}</small></span>
              <input type="number" inputmode="numeric" min="0" max="${escapeAttribute(stack.quantity)}" step="1" value="0" data-errand-material-input data-item="${escapeAttribute(stack.itemId)}" />
            </label>
          `,
        )
        .join("")}
      <p class="ability-assignment-error" aria-live="polite">Selected: 0/${escapeHtml(quantity)}</p>
    </div>
  `;
  els.gameDialogActions.innerHTML = `
    <button type="button" data-dialog-action="confirm">Hand In</button>
    <button type="button" class="ghost-button" data-dialog-action="cancel">Cancel</button>
  `;
  const update = () => {
    const total = selectedSmithCommissionContributions().reduce((sum, entry) => sum + entry.quantity, 0);
    const error = els.gameDialogField.querySelector(".ability-assignment-error");
    if (error) error.textContent = `Selected: ${total}/${quantity}`;
  };
  const cleanup = () => {
    els.gameDialogActions.removeEventListener("click", handleClick);
    els.gameDialogField.removeEventListener("input", handleInput);
    els.gameDialog.classList.add("hidden");
    els.gameDialogField.innerHTML = "";
    els.gameDialogField.classList.add("hidden");
    activeDialogCancel = null;
  };
  const handleInput = (event) => {
    const input = event.target.closest("[data-errand-material-input]");
    if (!input) return;
    const max = Math.max(0, Math.floor(Number(input.max) || 0));
    input.value = String(Math.max(0, Math.min(max, Math.floor(Number(input.value) || 0))));
    update();
  };
  const handleClick = (event) => {
    const button = event.target.closest("[data-dialog-action]");
    if (!button) return;
    if (button.dataset.dialogAction === "cancel") {
      cleanup();
      return;
    }
    const contributions = selectedSmithCommissionContributions();
    const validation = validateSmithCommissionContributions(commission, contributions);
    if (validation) {
      const error = els.gameDialogField.querySelector(".ability-assignment-error");
      if (error) error.textContent = validation;
      return;
    }
    cleanup();
    applySmithMaterialCommissionHandIn(npcId, commission, contributions);
  };
  els.gameDialogActions.addEventListener("click", handleClick);
  els.gameDialogField.addEventListener("input", handleInput);
  activeDialogCancel = cleanup;
  els.gameDialog.classList.remove("hidden");
  els.gameDialogField.querySelector("input")?.focus();
}

function materialCommissionQuestLogEntries() {
  const commissions = smithMaterialCommissionState(state?.questFlags ?? {});
  return Object.entries(commissions)
    .filter(([, commission]) => commission?.status === "accepted")
    .map(([npcId, commission]) => {
      const npc = window.DungeonContent.get("npcs", npcId) ?? { id: npcId, name: npcId, title: "Merchant" };
      const requirement = smithMaterialCommissionRequirement(commission);
      const target = Math.max(1, Math.floor(Number(commission.quantity) || 1));
      return {
        id: `commission-${npcId}`,
        giver: npc.name ?? npc.title ?? npcId,
        title: `${target} ${titleCaseText(smithMaterialCommissionLabel(commission))}`,
        description: smithMaterialCommissionRequestText(npc, commission),
        ready: partyResourceCountForRequirement(requirement) >= target,
        cancelable: true,
        cancelType: "commission",
        npcId,
        questId: `commission-${npcId}`,
        objectives: [
          {
            label: smithMaterialCommissionLabel(commission),
            progress: Math.min(target, partyResourceCountForRequirement(requirement)),
            target,
          },
        ],
      };
    });
}

function borrenClaimHammerQuestLogEntries() {
  const quest = state?.questFlags?.[borrenClaimHammerQuestKey];
  if (quest?.status !== "accepted") return [];
  const text = borrenClaimHammerText();
  const have = borrenClaimHammerCount();
  return [
    {
      id: "borren-claim-hammer",
      giver: text.questLog.giver,
      title: text.questLog.title,
      description: text.questLog.description,
      ready: have >= 1,
      cancelable: true,
      cancelType: "borren-claim-hammer",
      objectives: [
        {
          label: text.questLog.objectiveLabel,
          progress: Math.min(1, have),
          target: 1,
        },
      ],
    },
  ];
}

function campaignQuestLogEntries() {
  const campaigns = window.DungeonCampaigns?.list?.() ?? [];
  return campaigns
    .filter((campaign) => !campaign.hidden && campaign.count > 0)
    .filter((campaign) => window.DungeonCampaigns?.isUnlocked?.(campaign.id, state) ?? true)
    .map((campaign) => {
      const completed = Math.max(0, Math.min(campaign.count, Math.floor(Number(state?.campaignProgress?.[campaign.id]) || 0)));
      const quest = campaign.quest ?? {};
      const started = completed > 0;
      const finished = completed >= campaign.count;
      const title = finished
        ? quest.completedTitle ?? `${campaign.name} Complete`
        : started
          ? quest.progressTitle ?? campaign.name
          : quest.initialTitle ?? campaign.name;
      const description = finished
        ? quest.completedDescription ?? `${campaign.name} is complete.`
        : started
          ? quest.progressDescription ?? campaign.description
          : quest.initialDescription ?? campaign.description;
      return {
        id: `campaign-${campaign.id}`,
        giver: quest.giver ?? campaign.name,
        title,
        description,
        ready: finished,
        objectives: [
          {
            label: started || finished ? campaign.name : `Begin ${campaign.name}`,
            progress: started || finished ? completed : 0,
            target: started || finished ? campaign.count : 1,
          },
        ],
      };
    });
}

function acceptedQuestLogEntries() {
  return [
    ...campaignQuestLogEntries(),
    ...Object.values(window.DungeonNpcBehaviors ?? {}).flatMap((behavior) => behavior.questLogEntries?.() ?? []),
    ...materialCommissionQuestLogEntries(),
    ...borrenClaimHammerQuestLogEntries(),
  ].filter(Boolean);
}

function ancientTomeEntries() {
  const entries = state?.mode === "home" ? permanentPartyTomes(state?.partyTomes ?? []) : normalizePartyTomes(state?.partyTomes ?? []);
  if (state?.mode === "home" && (state?.partyTomes ?? []).length !== entries.length) state.partyTomes = entries;
  return entries.sort((a, b) => (a.collectedAt ?? 0) - (b.collectedAt ?? 0) || a.title.localeCompare(b.title));
}

function ancientTomeCategoryGroups(entries = ancientTomeEntries()) {
  const groups = new Map();
  for (const entry of entries) {
    const categories = entry.categories?.length ? entry.categories : ["Uncategorized"];
    for (const category of categories) {
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(entry);
    }
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

function ancientTomeEntryMarkup(entry) {
  return `
    <details class="quest-log-entry ancient-tome-entry">
      <summary>
        <b>${escapeHtml(entry.title)}</b>
        <span>${escapeHtml([entry.temporary ? "Temporary" : "", ...(entry.categories?.length ? entry.categories : ["Uncategorized"])].filter(Boolean).join(", "))}</span>
      </summary>
      <div class="ancient-tome-text">${handoutTextMarkup(entry.text)}</div>
    </details>
  `;
}

function ancientTomeMarkup() {
  const entries = ancientTomeEntries();
  const groups = ancientTomeCategoryGroups(entries);
  return `
    <section class="quest-log-list ancient-tome-list">
      <h3>Ancient Tome</h3>
      ${
        entries.length
          ? groups
              .map(
                ([category, categoryEntries]) => `
                  <details class="ancient-tome-category" open>
                    <summary>${escapeHtml(category)} <span>${categoryEntries.length}</span></summary>
                    <div>${categoryEntries.map(ancientTomeEntryMarkup).join("")}</div>
                  </details>
                `,
              )
              .join("")
          : `<p class="empty-note">No collected handouts.</p>`
      }
    </section>
  `;
}

function cancelQuestLogEntry(entry) {
  if (!entry?.cancelable) return false;
  if (entry.cancelType === "npc") return cancelNpcQuest(entry.npcId, entry.questId);
  if (entry.cancelType === "monster-hunter") return cancelMonsterHunterContract(entry.questId);
  if (entry.cancelType === "gravebinder") return cancelGravebinderContract(entry.questId);
  if (entry.cancelType === "crucible") return cancelCrucibleContract(entry.questId);
  if (entry.cancelType === "antiquarian") return cancelAntiquarianContract(entry.questId);
  if (entry.cancelType === "expedition-board") return cancelExpeditionContract(entry.questId);
  if (entry.cancelType === "boom-club") return cancelBoomClubContract(entry.questId);
  if (entry.cancelType === "commission") return cancelSmithMaterialCommission(entry.npcId);
  if (entry.cancelType === "borren-claim-hammer") {
    const quest = borrenClaimHammerState();
    if (quest.status !== "accepted") return false;
    quest.status = "available";
    quest.cancelledAt = Date.now();
    delete quest.acceptedAt;
    addLog(borrenClaimHammerText().logs.cancel, "important");
    return true;
  }
  return false;
}

function questLogEntryMarkup(entry) {
  return `
    <article class="quest-log-entry${entry.ready ? " ready" : ""}">
      <div>
        <b>${escapeHtml(entry.title ?? "Quest")}</b>
        <span>${escapeHtml(entry.giver ?? "Quest")}${entry.ready ? " - Ready" : ""}</span>
      </div>
      ${entry.description ? `<p>${escapeHtml(entry.description)}</p>` : ""}
      ${(entry.objectives ?? [])
        .map((objective) => {
          const target = Math.max(1, objective.target ?? 1);
          const progress = Math.min(target, Math.max(0, objective.progress ?? 0));
          return `<div class="quest-progress">${escapeHtml(objective.label ?? "Objective")}: ${escapeHtml(progress)}/${escapeHtml(target)}</div>`;
        })
        .join("")}
      ${
        entry.cancelable
          ? `<button type="button" class="ghost-button" data-dialog-action="cancel-quest" data-quest-id="${escapeAttribute(entry.id)}">Cancel Quest</button>`
          : ""
      }
    </article>
  `;
}

function renderQuestLogButton() {
  if (!els.questLogButton) return;
  const questCount = gameHasStarted ? acceptedQuestLogEntries().length : 0;
  els.questLogButton.disabled = !gameHasStarted;
  els.questLogButton.innerHTML = `Quests <span>${questCount}</span>`;
  els.questLogButton.title = questCount ? `${questCount} accepted quest${questCount === 1 ? "" : "s"}` : "No accepted quests";
}

function showQuestLog() {
  if (!gameHasStarted) return;
  const entries = acceptedQuestLogEntries();
  els.gameDialogTitle.textContent = "Quest Log";
  els.gameDialogMessage.innerHTML = `
    ${
      entries.length
        ? `<section class="quest-log-list">${entries.map(questLogEntryMarkup).join("")}</section>`
        : `<p class="empty-note">No accepted quests.</p>`
    }
    ${adminEnabled() ? renderAdminProgressCatalog({ forceOpen: true, showToggle: false }) : ""}
    ${ancientTomeMarkup()}
  `;
  els.gameDialogField.classList.add("hidden");
  els.gameDialogField.innerHTML = "";
  els.gameDialogActions.innerHTML = `<button type="button" data-dialog-action="close-quest-log">Close</button>`;
  const cleanup = () => {
    els.gameDialogActions.removeEventListener("click", handleClick);
    els.gameDialogMessage.removeEventListener("click", handleMessageClick);
    els.gameDialog.classList.add("hidden");
    activeDialogCancel = null;
  };
  const handleClick = (event) => {
    if (event.target.closest("[data-dialog-action='close-quest-log']")) cleanup();
  };
  const handleMessageClick = (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.dialogAction === "cancel-quest") {
      const entry = acceptedQuestLogEntries().find((candidate) => candidate.id === button.dataset.questId);
      if (!cancelQuestLogEntry(entry)) return;
      cleanup();
      render();
      showQuestLog();
      return;
    }
    if (!adminEnabled()) return;
    if (button.dataset.action === "set-admin-progress") {
      setNpcAdminProgress(button.dataset.npc, button.dataset.progress);
      cleanup();
      render();
      showQuestLog();
      return;
    }
    if (button.dataset.action === "set-admin-campaign-progress") {
      setAdminCampaignProgress(button.dataset.campaign, button.dataset.progress);
      cleanup();
      render();
      showQuestLog();
    }
  };
  els.gameDialogActions.addEventListener("click", handleClick);
  els.gameDialogMessage.addEventListener("click", handleMessageClick);
  activeDialogCancel = cleanup;
  els.gameDialog.classList.remove("hidden");
  els.gameDialogActions.querySelector("[data-dialog-action='close-quest-log']")?.focus();
}

function questLogIsOpen() {
  return !els.gameDialog.classList.contains("hidden") && els.gameDialogTitle.textContent === "Quest Log";
}

function toggleQuestLog() {
  if (questLogIsOpen() && activeDialogCancel) {
    activeDialogCancel();
    return;
  }
  showQuestLog();
}

function storeStockItems(npc = storeNpcDefinition()) {
  const query = storeSearch.trim().toLowerCase();
  const shopType = npc?.shop?.type ?? "general";
  if (["apothecary", "cursebreaker"].includes(shopType)) return [];
  return window.DungeonContent.list("items")
    .filter((item) =>
      shopType === "weaponsmith"
        ? itemIsWeaponsmithStock(item)
        : shopType === "armorsmith"
          ? itemIsArmorsmithStock(item)
          : shopType === "alchemist"
            ? itemIsAlchemistStock(item)
            : shopType === "arcanist"
              ? itemIsArcanistStock(item)
              : itemIsGeneralMerchantStock(item),
    )
    .filter((item) => !query || searchableItemText(item).includes(query) || itemDetails(item).toLowerCase().includes(query))
    .sort((a, b) =>
      shopType === "arcanist"
        ? (a.scroll?.level ?? a.use?.castLevel ?? 0) - (b.scroll?.level ?? b.use?.castLevel ?? 0) || a.name.localeCompare(b.name)
        : itemCategoryLabel(a).localeCompare(itemCategoryLabel(b)) || a.name.localeCompare(b.name),
    );
}

function storeBuyRowMarkup(item, npc, hero) {
  const price = storeItemBuyValueCp(item, npc);
  return `
    <div class="store-row">
      <div>
        <b>${escapeHtml(item.name)}</b>
        <span>${escapeHtml(itemDetails(item))} - ${escapeHtml(priceText(price))}</span>
      </div>
      <button type="button" data-action="buy-store-item" data-item="${item.id}" ${moneyToCp(hero.inventory.money) >= price ? "" : "disabled"}>Buy</button>
    </div>
  `;
}

function arcanistScrollBuyMarkup(items, npc, hero) {
  if (!items.length) return `<p class="empty-note">Nothing for sale here yet.</p>`;
  const groups = new Map();
  for (const item of items) {
    const level = Math.max(0, Math.floor(Number(item.scroll?.level ?? item.use?.castLevel ?? 0) || 0));
    if (!groups.has(level)) groups.set(level, []);
    groups.get(level).push(item);
  }
  return `
    <div class="store-scroll-groups">
      ${Array.from(groups.entries())
        .sort(([a], [b]) => a - b)
        .map(
          ([level, levelItems]) => `
            <details class="store-scroll-level" ${storeSearch.trim() ? "open" : ""}>
              <summary>${escapeHtml(spellLevelLabel(level))} <small>${levelItems.length}</small></summary>
              <div class="store-scroll-items">
                ${levelItems.map((item) => storeBuyRowMarkup(item, npc, hero)).join("")}
              </div>
            </details>
          `,
        )
        .join("")}
    </div>
  `;
}

function storeBuyMarkup(npc, hero) {
  const items = storeStockItems(npc);
  if (npc?.shop?.type === "arcanist") return arcanistScrollBuyMarkup(items, npc, hero);
  return items.map((item) => storeBuyRowMarkup(item, npc, hero)).join("") || `<p class="empty-note">Nothing for sale here yet.</p>`;
}

function diseaseCurePriceCp(diseaseId) {
  const disease = typeof diseaseDefinition === "function" ? diseaseDefinition(diseaseId) : window.DungeonAfflictions?.diseases?.[diseaseId];
  return Math.max(0, Math.floor(disease?.curePriceCp ?? 2500));
}

function apothecaryTreatmentEntries() {
  return partyHeroes()
    .flatMap((hero) =>
      (typeof fighterDiseases === "function" ? fighterDiseases(hero) : [])
        .map((effect) => {
          const disease = typeof diseaseDefinition === "function" ? diseaseDefinition(effect.diseaseId) : window.DungeonAfflictions?.diseases?.[effect.diseaseId];
          return { hero, effect, disease, priceCp: diseaseCurePriceCp(effect.diseaseId) };
        }),
    );
}

function apothecaryTreatmentMarkup(npc) {
  if (npc?.shop?.type !== "apothecary") return "";
  const hero = activeHero();
  const entries = apothecaryTreatmentEntries();
  return `
    <section class="store-section">
      <h3>Treatment</h3>
      <div class="store-list">
        ${
          entries.length
            ? entries
                .map((entry) => {
                  const affordable = moneyToCp(hero.inventory.money) >= entry.priceCp;
                  return `
                    <div class="store-row">
                      <div>
                        <b>${escapeHtml(entry.hero.name)} - ${escapeHtml(entry.disease?.name ?? entry.effect.label ?? "Disease")}</b>
                        <span>${escapeHtml(entry.disease?.description ?? entry.effect.conditionDescription ?? "Disease treatment.")} Treatment: ${escapeHtml(priceText(entry.priceCp))}</span>
                      </div>
                      <button type="button" data-action="apothecary-cure-disease" data-hero="${escapeAttribute(entry.hero.id)}" data-disease="${escapeAttribute(entry.effect.diseaseId)}" ${affordable ? "" : "disabled"}>${affordable ? "Treat" : "Need Coin"}</button>
                    </div>
                  `;
                })
                .join("")
            : `<p class="empty-note">No party diseases to treat.</p>`
        }
      </div>
    </section>
  `;
}

function apothecaryCureDisease(heroId, diseaseId) {
  const npc = storeNpcDefinition();
  if (npc?.shop?.type !== "apothecary") return;
  const payer = activeHero();
  const target = state.fighters[heroId];
  if (!target || !diseaseId) return;
  const price = diseaseCurePriceCp(diseaseId);
  if (!spendMoney(payer.inventory.money, price)) return;
  const removed = typeof cureFighterDisease === "function" ? cureFighterDisease(target, diseaseId) : [];
  if (!removed.length) {
    addMoney(payer.inventory.money, price);
    return;
  }
  const disease = typeof diseaseDefinition === "function" ? diseaseDefinition(diseaseId) : window.DungeonAfflictions?.diseases?.[diseaseId];
  addLog(`${npc.name} treats ${target.name}'s ${disease?.name ?? removed[0]?.label ?? "disease"} for ${priceText(price)}.`, "important");
  render();
  renderStoreMenu();
}

function cursebreakerEntries() {
  return partyHeroes()
    .flatMap((hero) => {
      const statuses = (hero.statusEffects ?? []).filter((effect) => effect.curse || effect.curseId);
      const boundItems = (hero.inventory?.items ?? []).filter((item) => item.curseState?.bound || (typeof itemCurseEntries === "function" && itemCurseEntries(item).length));
      return [
        ...statuses.map((effect) => ({ hero, effect, label: effect.label ?? "Curse", item: null })),
        ...boundItems.map((item) => ({ hero, effect: null, item, label: item.magic?.curse?.name ?? item.curses?.[0]?.id ?? "Cursed Item" })),
      ];
    })
    .filter((entry, index, list) => list.findIndex((candidate) => candidate.hero.id === entry.hero.id && candidate.label === entry.label && candidate.item?.id === entry.item?.id) === index);
}

function cursebreakerMarkup(npc) {
  if (npc?.shop?.type !== "cursebreaker") return "";
  const reagentId = "demon-ichor";
  const reagent = getItemTemplate(reagentId);
  const have = partyResourceCount(reagentId);
  const entries = cursebreakerEntries();
  return `
    <section class="store-section">
      <h3>Cursebreaking</h3>
      <div class="store-list">
        ${
          entries.length
            ? entries
                .map((entry) => {
                  const ready = have >= 1;
                  return `
                    <div class="store-row">
                      <div>
                        <b>${escapeHtml(entry.hero.name)} - ${escapeHtml(entry.item?.name ?? entry.label)}</b>
                        <span>${escapeHtml(npc.name)} demands 1 ${escapeHtml(reagent?.name ?? "Demon Ichor")}. Satchel: ${escapeHtml(have)}/1</span>
                      </div>
                      <button type="button" data-action="wizard-remove-curse" data-hero="${escapeAttribute(entry.hero.id)}" data-item="${escapeAttribute(entry.item?.id ?? entry.effect?.cursedItemId ?? "")}" data-effect="${escapeAttribute(entry.effect?.id ?? "")}" ${ready ? "" : "disabled"}>${ready ? "Remove Curse" : "Need Reagent"}</button>
                    </div>
                  `;
                })
                .join("")
            : `<p class="empty-note">No party curses to break.</p>`
        }
      </div>
    </section>
  `;
}

function wizardRemoveCurse(heroId, options = {}) {
  const npc = storeNpcDefinition();
  if (npc?.shop?.type !== "cursebreaker") return;
  const target = state.fighters[heroId];
  if (!target || !consumePartyResource("demon-ichor", 1)) return;
  const result = typeof removeCursesFromFighter === "function" ? removeCursesFromFighter(target, options) : { statuses: [], items: [] };
  if (!result.statuses.length && !result.items.length) {
    addPartyResourceItem(getItemTemplate("demon-ichor"), 1);
    return;
  }
  addLog(`${npc.name} uses Demon Ichor to break ${target.name}'s curse${result.statuses.length + result.items.length === 1 ? "" : "s"}.`, "important");
  render();
  renderStoreMenu();
}

function renderStoreMenu() {
  const hero = activeHero();
  const npc = storeNpcDefinition();
  document.querySelector("#store-title").textContent = npc.title ?? "Store";
  const equippedIds = new Set(Object.values(hero.equipment).filter(Boolean));
  const query = storeSearch.trim().toLowerCase();
  const sellableItems = hero.inventory.items
    .filter((item) => !equippedIds.has(item.id))
    .filter((item) => storeAcceptsSoldItem(item, npc))
    .filter((item) => !query || searchableItemText(item).includes(query) || itemDetails(item).toLowerCase().includes(query));
  const buysFromParty = storeBuysFromParty(npc);
  els.storeBody.innerHTML = `
    <section class="npc-card">
      ${npcPortraitMarkup(npc)}
      <div>
        <b>${escapeHtml(npc.name ?? "Merchant")}</b>
        <span>${escapeHtml(npc.title ?? "Merchant")}</span>
        <p>${escapeHtml(npcEntryLine(npc) || npc.description || "Welcome.")}</p>
      </div>
    </section>
    <div class="store-wallet">${escapeHtml(moneyText(hero.inventory.money))}</div>
    ${borrenClaimHammerMarkup(npc)}
    ${smithMaterialCommissionMarkup(npc)}
    ${apothecaryTreatmentMarkup(npc)}
    ${cursebreakerMarkup(npc)}
    <label class="store-search" for="store-search">
      <span>Search</span>
      <input id="store-search" type="search" placeholder="Search store" value="${escapeAttribute(storeSearch)}" />
    </label>
    <section class="store-section">
      <h3>Buy</h3>
      <div class="store-list">
        ${storeBuyMarkup(npc, hero)}
      </div>
    </section>
    ${
      buysFromParty
        ? `<section class="store-section">
            <h3>Sell</h3>
            <div class="store-list">
              ${
                sellableItems.length
                  ? sellableItems
                      .map((item) => {
                        const price = storeItemSellValueCp(item, npc);
                        const starterWarning = item.starterEquipment ? " - starter gear has no resale value" : "";
                        return `
                          <div class="store-row">
                            <div>
                              <b>${escapeHtml(item.name)}</b>
                              <span>${escapeHtml(itemDetails(item))} - ${escapeHtml(priceText(price))}${escapeHtml(starterWarning)}</span>
                            </div>
                            <button type="button" data-action="sell-store-item" data-item="${item.id}">Sell</button>
                          </div>
                        `;
                      })
                      .join("")
                  : `<p class="empty-note">No carried items this merchant will buy.</p>`
              }
            </div>
          </section>`
        : `<section class="store-section">
            <h3>Buying Policy</h3>
            <p class="empty-note">${escapeHtml(npc.name ?? "This merchant")} does not buy party goods.</p>
          </section>`
    }
  `;
}

function showStoreMenu(npcId = "general-merchant") {
  activeStoreNpcId = npcId;
  storeSearch = "";
  hideHomeMenu();
  hideVillageMenu();
  renderStoreMenu();
  els.storeMenu.classList.remove("hidden");
}

function hideStoreMenu() {
  els.storeMenu.classList.add("hidden");
}

function buyStoreItem(itemId) {
  const hero = activeHero();
  const template = getItemTemplate(itemId);
  if (!template) return;

  const npc = storeNpcDefinition();
  if (!storeStockItems(npc).some((item) => item.id === itemId)) return;
  if (npc?.shop?.type !== "arcanist" && (template.store?.buyable === false || template.tags?.includes("loot:magic") || template.type === "treasure")) return;
  const price = storeItemBuyValueCp(template, npc);
  if (!spendMoney(hero.inventory.money, price)) return;
  addItemToInventory(hero, createItemInstance(itemId, "store"), "store-stack");
  addLog(`${hero.name} buys ${template.name}.`, "important");
  render();
  renderStoreMenu();
}

function sellStoreItem(itemId) {
  const hero = activeHero();
  const equippedIds = new Set(Object.values(hero.equipment).filter(Boolean));
  if (equippedIds.has(itemId)) return;

  const item = itemForId(hero, itemId);
  if (!item) return;
  const npc = storeNpcDefinition();
  if (!storeAcceptsSoldItem(item, npc)) return;
  hero.inventory.items = hero.inventory.items.filter((entry) => entry.id !== itemId);
  const saleValue = storeItemSellValueCp(item, npc);
  addMoney(hero.inventory.money, saleValue);
  addLog(`${hero.name} sells ${item.name} for ${priceText(saleValue)}.${item.starterEquipment ? " Starter equipment has no resale value." : ""}`, "important");
  render();
  renderStoreMenu();
}

function fighterClassFeatureNames(level) {
  const features = [];
  if (level === 1) features.push("Second Wind");
  if (level === 2) features.push("Action Surge");
  if (fighterAbilityScoreImprovementLevels.has(level)) features.push("Ability Score Improvement");
  return features;
}

function abilityScoreImprovementLevelsForClass(classId) {
  return classAbilityScoreImprovementLevels[classId] ?? new Set([4, 8, 12, 16, 19]);
}

function spellcasterSidekickCantripCount(level) {
  return level >= 10 ? 4 : level >= 4 ? 3 : 2;
}

function spellcasterSidekickSpellCount(level) {
  return Math.max(1, Math.ceil(Math.max(1, Math.min(20, level)) / 2));
}

function classFeatureNames(hero, level) {
  const features = [];
  const template = getHeroTemplate(hero.classId);
  for (const feature of template.classFeatures ?? []) {
    if (feature.level === level) features.push(feature.name);
  }
  const subclass = subclassDefinitionForHero(hero);
  features.push(...(subclass?.featureNamesByLevel?.[level] ?? []));
  if (abilityScoreImprovementLevelsForClass(hero.classId).has(level)) features.push("Ability Score Improvement / Feat");
  return features;
}

function sidekickCantripChoiceCountForLevel(hero, level) {
  if (!isSidekickSpellcaster(hero)) return 0;
  return Math.max(0, spellcasterSidekickCantripCount(level) - (hero.spells ?? []).filter((spellId) => spellBaseLevel(getContentDefinition("spells", spellId)) === 0).length);
}

function sidekickSpellChoiceCountForLevel(hero, level) {
  if (!isSidekickSpellcaster(hero)) return 0;
  return Math.max(0, spellcasterSidekickSpellCount(level) - (hero.spells ?? []).filter((spellId) => spellBaseLevel(getContentDefinition("spells", spellId)) > 0).length);
}

const sidekickWarriorSkillChoices = ["acrobatics", "animal-handling", "athletics", "intimidation", "nature", "perception", "survival"];
const sidekickExpertSaveChoices = ["dex", "int", "cha"];
const sidekickExpertSkillChoices = allSkillIds;
const sidekickSpellcasterSaveChoices = ["wis", "int", "cha"];
const sidekickSpellcasterSkillChoices = ["arcana", "history", "insight", "investigation", "medicine", "performance", "persuasion", "religion"];
const sidekickSpellLists = {
  mage: {
    label: "Mage",
    ability: "int",
    cantrips: ["mage-hand", "blade-ward", "fire-bolt", "mind-sliver", "acid-splash", "ray-of-frost", "shocking-grasp", "toll-the-dead"],
    spells: ["magic-missile", "shield", "burning-hands", "scorching-ray", "misty-step", "web", "grease", "lightning-bolt", "fireball", "haste"],
  },
  healer: {
    label: "Healer",
    ability: "wis",
    cantrips: ["guidance", "sacred-flame", "spare-the-dying", "produce-flame", "thorn-whip", "resistance", "shillelagh"],
    spells: ["cure-wounds", "healing-word", "guiding-bolt", "bless", "bane", "shield-of-faith", "spiritual-weapon", "hold-person", "entangle", "faerie-fire", "barkskin", "moonbeam", "spike-growth", "call-lightning"],
  },
  prodigy: {
    label: "Prodigy",
    ability: "cha",
    cantrips: ["vicious-mockery", "mage-hand", "blade-ward", "eldritch-blast", "thunderclap", "mind-sliver", "chill-touch"],
    spells: ["healing-word", "hold-person", "faerie-fire", "heat-metal", "shatter", "hideous-laughter", "heroism", "hypnotic-pattern", "hellish-rebuke"],
  },
};

function normalizeSidekickClassId(value) {
  const id = String(value ?? "").trim().toLowerCase();
  if (!id) return null;
  if (id === "warrior" || id === "sidekick-warrior") return "sidekick-warrior";
  if (id === "expert" || id === "sidekick-expert") return "sidekick-expert";
  if (id === "spellcaster" || id === "spell-caster" || id === "sidekick-spellcaster") return "sidekick-spellcaster";
  return null;
}

function sidekickClassTags(fighter) {
  return new Set((fighter?.tags ?? []).map((tag) => String(tag).toLowerCase()));
}

function explicitSidekickClassIds(fighter) {
  const fields = [
    fighter?.sidekickClasses,
    fighter?.sidekickEligibleClasses,
    fighter?.sidekickEligibility?.classes,
  ];
  const values = [];
  fields.forEach((field) => {
    if (Array.isArray(field)) values.push(...field);
    else if (field && typeof field === "object") {
      Object.entries(field).forEach(([key, enabled]) => {
        if (enabled) values.push(key);
      });
    } else if (field) values.push(field);
  });
  sidekickClassTags(fighter).forEach((tag) => {
    if (tag.startsWith("sidekick:")) values.push(tag.slice("sidekick:".length));
    if (tag.startsWith("sidekick-eligible:")) values.push(tag.slice("sidekick-eligible:".length));
  });
  return new Set(values.map(normalizeSidekickClassId).filter(Boolean));
}

function sidekickTextBlob(fighter) {
  const tags = Array.isArray(fighter?.tags) ? fighter.tags : [];
  const traits = Array.isArray(fighter?.traits) ? fighter.traits : [];
  const specialAbilities = Array.isArray(fighter?.specialAbilities) ? fighter.specialAbilities : [];
  const actions = Array.isArray(fighter?.actions) ? fighter.actions : [];
  return [
    fighter?.name,
    fighter?.role,
    fighter?.monsterId,
    fighter?.templateId,
    fighter?.id,
    ...tags,
    ...traits,
    ...specialAbilities,
    ...actions.map((action) => action?.name ?? action?.label ?? action?.id),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function fighterHasSpellcasterSidekickAptitude(fighter) {
  const explicit = explicitSidekickClassIds(fighter);
  if (explicit.has("sidekick-spellcaster")) return true;
  const tags = sidekickClassTags(fighter);
  const text = sidekickTextBlob(fighter);
  return Boolean(
    fighter?.casterType ||
      fighter?.spellcastingAbility ||
      (fighter?.spells ?? []).length ||
      (fighter?.classSpellList ?? []).length ||
      fighter?.damage?.attackType === "spell" ||
      fighter?.baseDamage?.attackType === "spell" ||
      ["caster", "spellcaster", "mage", "arcane", "necromancer", "warlock", "priest", "shaman", "oracle", "banshee", "wisp", "allip"].some((tag) =>
        tags.has(tag),
      ) ||
      /\b(caster|spellcaster|mage|arcane|necromancer|warlock|priest|shaman|oracle|hex|curse|witch|wizard|sorcerer|banshee|wisp|allip)\b/.test(text),
  );
}

function fighterHasExpertSidekickAptitude(fighter) {
  const explicit = explicitSidekickClassIds(fighter);
  if (explicit.has("sidekick-expert")) return true;
  const tags = sidekickClassTags(fighter);
  const text = sidekickTextBlob(fighter);
  return Boolean(
    isHumanoidFighter(fighter) ||
      fighterSpeaksLanguage(fighter) ||
      ["expert", "archer", "crossbow", "crossbowman", "artillery", "scout", "skirmisher", "sniper", "duelist", "assassin", "captain", "tactician"].some(
        (tag) => tags.has(tag),
      ) ||
      /\b(expert|archer|crossbow|crossbowman|artillery|scout|skirmisher|sniper|duelist|assassin|captain|tactician|sentry|veteran)\b/.test(text),
  );
}

function sidekickHasWeaponTrainingStatBlock(fighter) {
  return isHumanoidFighter(fighter) || Boolean(fighter?.baseDamage || fighter?.damage || activeWeapon(fighter)?.type === "weapon");
}

function sidekickClassEligibility(fighter) {
  const explicit = explicitSidekickClassIds(fighter);
  const hasExplicitList = Boolean(
    fighter?.sidekickClasses ||
      fighter?.sidekickEligibleClasses ||
      fighter?.sidekickEligibility?.classes ||
      (fighter?.tags ?? []).some((tag) => String(tag).toLowerCase().startsWith("sidekick:") || String(tag).toLowerCase().startsWith("sidekick-eligible:")),
  );
  const expertAllowed = hasExplicitList ? explicit.has("sidekick-expert") : fighterHasExpertSidekickAptitude(fighter);
  const spellcasterAllowed = hasExplicitList ? explicit.has("sidekick-spellcaster") : fighterHasSpellcasterSidekickAptitude(fighter);
  return {
    "sidekick-warrior": {
      allowed: true,
      description: "Martial sidekick. Always available.",
    },
    "sidekick-expert": {
      allowed: expertAllowed,
      description: expertAllowed
        ? "Skillful sidekick. This statblock has tactics, precision, or practical training."
        : "Locked: needs an expert-style statblock, such as archer, scout, crossbowman, artillery, or explicit sidekick expert eligibility.",
    },
    "sidekick-spellcaster": {
      allowed: spellcasterAllowed,
      description: spellcasterAllowed
        ? "Magical sidekick. This statblock has spellcasting aptitude."
        : "Locked: needs a caster-style statblock, spell attack, caster tag, or explicit sidekick spellcaster eligibility.",
    },
  };
}

async function chooseSidekickSavingThrow(title, choices) {
  const choice = await showChoiceDialog({
    title,
    message: "Choose one saving throw proficiency.",
    choices: choices.map((ability) => ({ value: ability, label: ability.toUpperCase() })),
  });
  return choice;
}

async function trainWarriorSidekick(companion) {
  const save = await chooseSidekickSavingThrow("Warrior Training", ["str", "dex", "con"]);
  if (!save) return null;
  const skills = await chooseUniqueProficiencies({
    title: "Warrior Skills",
    message: "Choose Warrior skill proficiencies.",
    count: 2,
    choices: sidekickWarriorSkillChoices,
    selected: companion.skillProficiencies ?? [],
  });
  if (!skills) return null;
  const role = await showChoiceDialog({
    title: "Martial Role",
    message: "Choose this warrior's combat focus.",
    choices: [
      { value: "attacker", label: "Attacker", description: "+2 bonus to attack rolls." },
      { value: "defender", label: "Defender", description: "Use a reaction to impose disadvantage on an attack against a nearby ally." },
    ],
    actor: companion,
  });
  if (!role) return null;
  companion.classId = "sidekick-warrior";
  companion.className = "Warrior Sidekick";
  companion.sidekickClassName = "Warrior Sidekick";
  companion.sidekickWarriorRole = role;
  companion.savingThrowProficiencies = uniqueValues([...(companion.savingThrowProficiencies ?? []), save]);
  companion.skillProficiencies = uniqueValues([...(companion.skillProficiencies ?? []), ...skills]);
  companion.armorProficiencies = proficiencyEntries([...(companion.armorProficiencies ?? []), "light", "medium", "heavy"]);
  if (sidekickHasWeaponTrainingStatBlock(companion)) {
    companion.weaponProficiencies = proficiencyEntries([...(companion.weaponProficiencies ?? []), "simple", "martial", "shield"]);
    companion.armorProficiencies = proficiencyEntries([...(companion.armorProficiencies ?? []), "shield"]);
  }
  return `Save: ${save.toUpperCase()}. Skills: ${skills.map(skillName).join(", ")}. Role: ${role}.`;
}

async function trainExpertSidekick(companion) {
  const save = await chooseSidekickSavingThrow("Expert Training", sidekickExpertSaveChoices);
  if (!save) return null;
  const skills = await chooseUniqueProficiencies({
    title: "Expert Skills",
    message: "Choose Expert skill proficiencies.",
    count: 5,
    choices: sidekickExpertSkillChoices,
    selected: companion.skillProficiencies ?? [],
  });
  if (!skills) return null;
  let tools = [];
  if (isHumanoidFighter(companion) || sidekickHasWeaponTrainingStatBlock(companion)) {
    tools = await chooseUniqueProficiencies({
      title: "Expert Tools",
      message: "Choose tool proficiencies.",
      count: 2,
      choices: Object.keys(toolDefinitions),
      selected: companion.toolProficiencies ?? [],
      valuePrefix: "tool:",
    });
    if (!tools) return null;
  }
  companion.classId = "sidekick-expert";
  companion.className = "Expert Sidekick";
  companion.sidekickClassName = "Expert Sidekick";
  companion.savingThrowProficiencies = uniqueValues([...(companion.savingThrowProficiencies ?? []), save]);
  companion.skillProficiencies = uniqueValues([...(companion.skillProficiencies ?? []), ...skills]);
  companion.toolProficiencies = uniqueValues([...(companion.toolProficiencies ?? []), ...tools]);
  companion.armorProficiencies = proficiencyEntries([...(companion.armorProficiencies ?? []), "light"]);
  if (sidekickHasWeaponTrainingStatBlock(companion)) companion.weaponProficiencies = proficiencyEntries([...(companion.weaponProficiencies ?? []), "simple"]);
  return `Save: ${save.toUpperCase()}. Skills: ${skills.map(skillName).join(", ")}${tools.length ? `. Tools: ${tools.map(toolName).join(", ")}` : ""}.`;
}

async function trainSpellcasterSidekick(companion) {
  const save = await chooseSidekickSavingThrow("Spellcaster Training", sidekickSpellcasterSaveChoices);
  if (!save) return null;
  const skills = await chooseUniqueProficiencies({
    title: "Spellcaster Skills",
    message: "Choose Spellcaster skill proficiencies.",
    count: 2,
    choices: sidekickSpellcasterSkillChoices,
    selected: companion.skillProficiencies ?? [],
  });
  if (!skills) return null;
  const role = await showChoiceDialog({
    title: "Spellcasting Role",
    message: "Choose this sidekick's spell list and casting ability.",
    choices: Object.entries(sidekickSpellLists).map(([value, entry]) => ({ value, label: entry.label, description: `${entry.ability.toUpperCase()} spellcasting.` })),
    actor: companion,
  });
  if (!role) return null;
  const list = sidekickSpellLists[role];
  companion.classId = "sidekick-spellcaster";
  companion.className = "Spellcaster Sidekick";
  companion.sidekickClassName = `${list.label} Sidekick`;
  companion.sidekickSpellcasterRole = role;
  companion.casterType = "sidekick";
  companion.spellcastingAbility = list.ability;
  companion.classCantripList = list.cantrips;
  companion.classSpellList = list.spells;
  companion.spellPointProgression = getHeroTemplate("sidekick-spellcaster").spellPointProgression;
  companion.savingThrowProficiencies = uniqueValues([...(companion.savingThrowProficiencies ?? []), save]);
  companion.skillProficiencies = uniqueValues([...(companion.skillProficiencies ?? []), ...skills]);
  companion.armorProficiencies = proficiencyEntries([...(companion.armorProficiencies ?? []), "light"]);
  if (sidekickHasWeaponTrainingStatBlock(companion)) companion.weaponProficiencies = proficiencyEntries([...(companion.weaponProficiencies ?? []), "simple"]);
  const cantrips = await chooseClassCantrips(companion, 2, companion.spells ?? []);
  companion.spells = cantrips.spells;
  const spells = await chooseClassSpells(companion, 1, companion.spells ?? []);
  companion.spells = spells.spells;
  return `Save: ${save.toUpperCase()}. Skills: ${skills.map(skillName).join(", ")}. Role: ${list.label}.`;
}

async function trainSidekickCompanion() {
  const companion = activeHero();
  if (state.mode !== "home" || !canTrainAsSidekick(companion)) return;
  const eligibility = sidekickClassEligibility(companion);
  const classChoices = [
    { value: "sidekick-warrior", label: "Warrior", description: eligibility["sidekick-warrior"].description },
    {
      value: "sidekick-expert",
      label: "Expert",
      description: eligibility["sidekick-expert"].description,
      disabled: !eligibility["sidekick-expert"].allowed,
    },
    {
      value: "sidekick-spellcaster",
      label: "Spellcaster",
      description: eligibility["sidekick-spellcaster"].description,
      disabled: !eligibility["sidekick-spellcaster"].allowed,
    },
  ];
  const classId = await showChoiceDialog({
    title: `Train ${companion.name}`,
    message: "Choose a sidekick class. Expert and Spellcaster now depend on the creature's statblock aptitude instead of language proficiency.",
    choices: classChoices,
    actor: companion,
  });
  if (!classId) return;

  companion.level = 1;
  companion.xp = 0;
  companion.hitDiceRemaining = 1;
  companion.baseMaxHp = companion.baseMaxHp ?? companion.maxHp;
  companion.abilityScores = Object.fromEntries(abilities.map((ability) => [ability, baseAbilityScore(companion, ability)]));
  let summary = null;
  if (classId === "sidekick-warrior") summary = await trainWarriorSidekick(companion);
  if (classId === "sidekick-expert") summary = await trainExpertSidekick(companion);
  if (classId === "sidekick-spellcaster") summary = await trainSpellcasterSidekick(companion);
  if (!summary) return;

  ensureFighterAbilityState(companion);
  refreshDerivedStats(companion);
  companion.hp = companion.maxHp;
  companion.spellPointMax = spellPointMaximum(companion);
  companion.spellPoints = companion.spellPointMax;
  companion.role = combatantRoleLabel(companion);
  const text = `${companion.name} trains as a level 1 ${companion.sidekickClassName ?? companion.className}. ${summary}`;
  addLog(text, "important");
  render();
  await showChoiceDialog({
    title: `Level 1 ${companion.sidekickClassName ?? companion.className}`,
    message: text,
    choices: [{ value: "ok", label: "Continue" }],
    actor: companion,
  });
}

function rageDamageBonus(hero) {
  const level = hero?.level ?? 1;
  return level >= 16 ? 4 : level >= 9 ? 3 : 2;
}

function isBarbarianRaging(hero) {
  return Boolean((hero?.statusEffects ?? []).some((effect) => effect.id === "rage"));
}

function applyBarbarianWildSurge(hero) {
  const roll = rollDie(8);
  const levelBonus = (hero.level ?? 1) >= 14 ? 2 : 0;
  const effects = [
    () => applyStatusEffect(hero, { id: "wild-surge-shadow", label: "Wild Surge: Shadow", tempHp: 5 + levelBonus, durationRounds: 10 }),
    () => applyStatusEffect(hero, { id: "wild-surge-teleport", label: "Wild Surge: Blink", speedBonusFeet: 15 + levelBonus * 5, expiresAtEndOfTurn: true }),
    () => applyStatusEffect(hero, { id: "wild-surge-thorns", label: "Wild Surge: Thorns", acBonus: 1 + levelBonus, durationRounds: 3 }),
    () => applyStatusEffect(hero, { id: "wild-surge-force", label: "Wild Surge: Force", weaponRider: true, damageBonus: rollDie(6) + levelBonus, damageType: "force", durationRounds: 10 }),
    () => applyStatusEffect(hero, { id: "wild-surge-light", label: "Wild Surge: Radiance", attackBonus: 1 + levelBonus, durationRounds: 3 }),
    () => applyStatusEffect(hero, { id: "wild-surge-vine", label: "Wild Surge: Vines", weaponRider: true, damageBonus: rollDie(6), damageType: "piercing", riderStatus: "restrained", durationRounds: 10 }),
    () => applyStatusEffect(hero, { id: "wild-surge-shield", label: "Wild Surge: Shield", acBonus: 2 + levelBonus, expiresAtStartOfTurn: true }),
    () => applyStatusEffect(hero, { id: "wild-surge-might", label: "Wild Surge: Might", skillBonus: 2 + levelBonus, damageBonus: 1 + levelBonus, durationRounds: 3 }),
  ];
  effects[roll - 1]?.();
  addLog(`${hero.name}'s Wild Surge erupts (${roll}).`, "important");
}

function showAbilityScoreImprovementDialog(hero) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = "Ability Score Improvement";
    els.gameDialogMessage.textContent = "Increase one ability score by 2, or two ability scores by 1. No score can go above 20.";
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `
      <div class="ability-assignment">
        ${abilities
          .map(
            (ability) => `
              <label>
                <span>${ability.toUpperCase()} ${baseAbilityScore(hero, ability)}</span>
                <input type="number" inputmode="numeric" min="0" max="2" step="1" value="0" data-asi-input="${ability}" />
              </label>
            `,
          )
          .join("")}
        <p class="ability-assignment-error" aria-live="polite"></p>
      </div>
      <button type="submit" data-dialog-action="confirm">Apply Improvement</button>
      <button type="button" class="ghost-button" data-dialog-action="cancel">Cancel Level Up</button>
    `;

    const cleanup = (value) => {
      els.gameDialogForm.removeEventListener("submit", handleSubmit);
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialogActions.removeEventListener("input", handleInput);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(value);
    };

    const readIncreases = () =>
      Object.fromEntries(
        Array.from(els.gameDialogActions.querySelectorAll("[data-asi-input]")).map((input) => [
          input.dataset.asiInput,
          Math.max(0, Math.floor(Number(input.value) || 0)),
        ]),
      );

    const validate = () => {
      const increases = readIncreases();
      const values = Object.values(increases);
      const error = els.gameDialogActions.querySelector(".ability-assignment-error");
      const total = values.reduce((sum, value) => sum + value, 0);
      const legalShape = values.filter(Boolean).length === 1 && values.includes(2) || values.filter((value) => value === 1).length === 2;
      const overCap = abilities.find((ability) => baseAbilityScore(hero, ability) + increases[ability] > 20);
      if (total !== 2 || !legalShape) return "Choose either one +2 or two +1 increases.";
      if (overCap) return `${overCap.toUpperCase()} cannot be increased above 20.`;
      if (error) error.textContent = "";
      return "";
    };

    const handleSubmit = (event) => {
      event.preventDefault();
      const errorText = validate();
      const error = els.gameDialogActions.querySelector(".ability-assignment-error");
      if (errorText) {
        if (error) error.textContent = errorText;
        return;
      }
      cleanup(readIncreases());
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-dialog-action='cancel']");
      if (button) cleanup(null);
    };

    const handleInput = (event) => {
      if (!event.target.matches("[data-asi-input]")) return;
      event.target.value = String(clamp(Math.floor(Number(event.target.value) || 0), 0, 2));
      validate();
    };

    els.gameDialogForm.addEventListener("submit", handleSubmit);
    els.gameDialogActions.addEventListener("click", handleClick);
    els.gameDialogActions.addEventListener("input", handleInput);
    activeDialogCancel = () => cleanup(null);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("input")?.focus();
  });
}

function featSpellIdsAvailable(feat) {
  return (feat?.spells ?? []).filter((spellId) => getContentDefinition("spells", canonicalSpellId(spellId)));
}

function featPrerequisiteMet(hero, feat) {
  const prerequisite = feat?.prerequisite ?? {};
  if (prerequisite.ability && abilityScore(hero, prerequisite.ability) < (prerequisite.min ?? 0)) return false;
  if (prerequisite.spellcasting && !heroCanCastAtLeastOneSpell(hero)) return false;
  if (prerequisite.armorProficiency && !(hero.armorProficiencies ?? []).includes(prerequisite.armorProficiency)) return false;
  const race = hero?.raceSelection?.raceId ?? hero?.race ?? "";
  const subrace = hero?.raceSelection?.subraceId ?? hero?.subrace ?? "";
  if (prerequisite.species?.length && !prerequisite.species.includes(race) && !prerequisite.species.includes(subrace)) return false;
  if (prerequisite.subrace?.length && !prerequisite.subrace.includes(subrace)) return false;
  return true;
}

function heroCanCastAtLeastOneSpell(hero) {
  return Boolean(
      (hero?.spells ?? []).length ||
      (hero?.classSpellList ?? []).length ||
      (hero?.classCantripList ?? []).length ||
      (hero?.casterType && hero.casterType !== "none") ||
      hero?.spellPointProgression,
  );
}

function featChoiceSummary(feat) {
  const parts = [];
  for (const choice of feat?.choices ?? []) {
    if (choice.type === "ability") parts.push(`+${choice.amount ?? 1} ability`);
    if (choice.type === "save") parts.push("+1 ability and save proficiency");
    if (choice.type === "skills") parts.push(`${choice.count ?? 1} skill${(choice.count ?? 1) === 1 ? "" : "s"}`);
    if (choice.type === "expertise") parts.push(`${choice.count ?? 1} expertise`);
    if (choice.type === "fightingStyle") parts.push("fighting style");
    if (choice.type === "invocation") parts.push("eldritch invocation");
    if (choice.type === "damageType") parts.push("damage type");
    if (choice.type === "maneuvers") parts.push(`${choice.count ?? 1} maneuver${(choice.count ?? 1) === 1 ? "" : "s"}`);
    if (choice.type === "metamagic") parts.push(`${choice.count ?? 1} metamagic`);
  }
  return parts.length ? `Choices: ${parts.join(", ")}.` : "";
}

function selectableFeatDefinitions(hero) {
  const known = new Set(fighterFeatIds(hero));
  return featDefinitions()
    .filter((feat) => !known.has(feat.id))
    .filter((feat) => featPrerequisiteMet(hero, feat))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function applyConstitutionMaxHpDelta(hero, oldConMod) {
  const newConMod = scoreToMod(baseAbilityScore(hero, "con"));
  const conHpGain = Math.max(0, newConMod - oldConMod) * (hero.level ?? 1);
  if (conHpGain) {
    hero.baseMaxHp = (hero.baseMaxHp ?? hero.maxHp ?? 1) + conHpGain;
    hero.maxHp = hero.baseMaxHp;
  }
  return conHpGain;
}

function applyLevelUpAbilityIncrease(hero, ability, amount, oldConMod) {
  if (!abilities.includes(ability) || !amount) return 0;
  hero.abilityScores = Object.fromEntries(abilities.map((entry) => [entry, baseAbilityScore(hero, entry)]));
  hero.abilityScores[ability] = Math.min(20, hero.abilityScores[ability] + amount);
  return applyConstitutionMaxHpDelta(hero, oldConMod);
}

function applyLevelUpAbilityIncreases(hero, increases, oldConMod) {
  hero.abilityScores = Object.fromEntries(abilities.map((ability) => [ability, baseAbilityScore(hero, ability)]));
  for (const ability of abilities) {
    hero.abilityScores[ability] = Math.min(20, hero.abilityScores[ability] + (increases[ability] ?? 0));
  }
  return applyConstitutionMaxHpDelta(hero, oldConMod);
}

async function chooseFeatAbilityIncrease(hero, feat, choice, entry, oldConMod) {
  const options = (choice.abilities ?? abilities).filter((ability) => baseAbilityScore(hero, ability) < 20);
  if (!options.length) return "";
  const ability = await showChoiceDialog({
    title: feat.name,
    message: `Choose the ability score increased by ${feat.name}.`,
    actor: hero,
    choices: options.map((value) => ({ value, label: `${value.toUpperCase()} ${baseAbilityScore(hero, value)} -> ${Math.min(20, baseAbilityScore(hero, value) + (choice.amount ?? 1))}` })),
  });
  if (!ability) return null;
  entry.choices.ability = ability;
  const conHpGain = applyLevelUpAbilityIncrease(hero, ability, choice.amount ?? 1, oldConMod);
  return ` +1 ${ability.toUpperCase()}${conHpGain ? ` (${conHpGain} max HP)` : ""}`;
}

async function chooseFeatSavingThrow(hero, feat, choice, entry, oldConMod) {
  const options = (choice.abilities ?? abilities).filter((ability) => !(hero.savingThrowProficiencies ?? []).includes(ability) || baseAbilityScore(hero, ability) < 20);
  if (!options.length) return "";
  const ability = await showChoiceDialog({
    title: feat.name,
    message: "Choose the ability improved by Resilient and its saving throw proficiency.",
    actor: hero,
    choices: options.map((value) => ({ value, label: value.toUpperCase(), description: `Current score ${baseAbilityScore(hero, value)}.` })),
  });
  if (!ability) return null;
  entry.choices.save = ability;
  const conHpGain = applyLevelUpAbilityIncrease(hero, ability, 1, oldConMod);
  hero.savingThrowProficiencies = uniqueValues([...(hero.savingThrowProficiencies ?? []), ability]);
  return ` +1 ${ability.toUpperCase()} and ${ability.toUpperCase()} saves${conHpGain ? ` (${conHpGain} max HP)` : ""}`;
}

async function chooseFeatFightingStyle(hero, feat, entry) {
  const existing = new Set(hero.fightingStyles ?? []);
  const choices = fightingStyleChoicesForClass("fighter").filter((style) => !existing.has(style.value));
  if (!choices.length) return "";
  const style = await showChoiceDialog({
    title: feat.name,
    message: "Choose a fighting style.",
    actor: hero,
    choices,
  });
  if (!style) return null;
  entry.choices.fightingStyle = style;
  hero.fightingStyles = uniqueValues([...(hero.fightingStyles ?? []), style]);
  return ` Fighting Style: ${choices.find((choice) => choice.value === style)?.label ?? style}`;
}

async function chooseFeatOptionsFromList({ hero, feat, entry, type, property, options, count, title, message }) {
  const selected = [...(hero[property] ?? [])];
  const names = [];
  for (let index = 0; index < count; index += 1) {
    const available = options.filter((option) => !selected.includes(option.id) && (hero.level ?? 1) >= (option.level ?? 1));
    if (!available.length) break;
    const choice = await showSelectChoiceDialog({
      title: title ?? feat.name,
      message: `${message} (${index + 1}/${count})`,
      actor: hero,
      label: message,
      choices: available.map((option) => ({ value: option.id, label: option.name, description: option.description })),
    });
    if (!choice) return null;
    selected.push(choice);
    names.push(available.find((option) => option.id === choice)?.name ?? choice);
  }
  hero[property] = uniqueValues(selected);
  entry.choices[type] = uniqueValues([...(entry.choices[type] ?? []), ...selected]);
  return names.length ? ` ${names.join(", ")}` : "";
}

async function applyFeatChoice(hero, feat, choice, entry, oldConMod) {
  if (choice.type === "ability") return chooseFeatAbilityIncrease(hero, feat, choice, entry, oldConMod);
  if (choice.type === "save") return chooseFeatSavingThrow(hero, feat, choice, entry, oldConMod);
  if (choice.type === "skills") {
    const picked = await chooseUniqueProficiencies({
      title: feat.name,
      message: "Choose a skill proficiency.",
      count: choice.count ?? 1,
      choices: choice.choices ?? allSkillIds,
      selected: hero.skillProficiencies ?? [],
    });
    if (picked === null) return null;
    hero.skillProficiencies = uniqueValues([...(hero.skillProficiencies ?? []), ...picked]);
    entry.choices.skills = picked;
    return picked.length ? ` Skills: ${picked.map(skillName).join(", ")}` : "";
  }
  if (choice.type === "expertise") {
    const gained = await chooseExpertiseProficiencies({
      title: feat.name,
      message: "Choose an expertise.",
      count: choice.count ?? 1,
      skillProficiencies: hero.skillProficiencies ?? [],
      toolProficiencies: hero.toolProficiencies ?? [],
      existingSkillExpertise: hero.expertiseSkills ?? [],
      existingToolExpertise: hero.expertiseTools ?? [],
    });
    if (gained === null) return null;
    hero.expertiseSkills = uniqueValues([...(hero.expertiseSkills ?? []), ...gained.skills]);
    hero.expertiseTools = uniqueValues([...(hero.expertiseTools ?? []), ...gained.tools]);
    entry.choices.expertise = { skills: gained.skills, tools: gained.tools };
    return [...gained.skills.map(skillName), ...gained.tools.map(toolName)].length ? ` Expertise: ${[...gained.skills.map(skillName), ...gained.tools.map(toolName)].join(", ")}` : "";
  }
  if (choice.type === "fightingStyle") return chooseFeatFightingStyle(hero, feat, entry);
  if (choice.type === "invocation") {
    return chooseFeatOptionsFromList({
      hero,
      feat,
      entry,
      type: "invocations",
      property: "knownInvocations",
      options: getHeroTemplate("warlock").invocationOptions ?? [],
      count: choice.count ?? 1,
      title: feat.name,
      message: "Choose an eldritch invocation.",
    });
  }
  if (choice.type === "maneuvers") {
    const battleMaster = fighterSubclassDefinitions().find((subclass) => subclass.id === "battle-master");
    return chooseFeatOptionsFromList({
      hero,
      feat,
      entry,
      type: "maneuvers",
      property: "knownManeuvers",
      options: battleMaster?.maneuverOptions ?? [],
      count: choice.count ?? 1,
      title: feat.name,
      message: "Choose a maneuver.",
    });
  }
  if (choice.type === "metamagic") {
    return chooseFeatOptionsFromList({
      hero,
      feat,
      entry,
      type: "metamagic",
      property: "knownMetamagic",
      options: getHeroTemplate("sorcerer").metamagicOptions ?? [],
      count: choice.count ?? 1,
      title: feat.name,
      message: "Choose a metamagic option.",
    });
  }
  if (choice.type === "damageType") {
    const picked = await showChoiceDialog({
      title: feat.name,
      message: "Choose a damage type.",
      actor: hero,
      choices: (choice.choices ?? []).map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) })),
    });
    if (!picked) return null;
    entry.choices[choice.property ?? "damageType"] = [picked];
    return ` ${picked[0].toUpperCase()}${picked.slice(1)}`;
  }
  return "";
}

function applyFeatStaticBenefits(hero, feat) {
  hero.skillProficiencies = uniqueValues([...(hero.skillProficiencies ?? []), ...(feat.skillProficiencies ?? [])]);
  hero.toolProficiencies = uniqueValues([...(hero.toolProficiencies ?? []), ...(feat.toolProficiencies ?? [])]);
  hero.armorProficiencies = proficiencyEntries([...(hero.armorProficiencies ?? []), ...(feat.armorProficiencies ?? [])]);
  hero.weaponProficiencies = proficiencyEntries([...(hero.weaponProficiencies ?? []), ...(feat.weaponProficiencies ?? [])]);
  hero.extraResourcePoolUses = { ...(hero.extraResourcePoolUses ?? {}) };
  for (const [pool, amount] of Object.entries(feat.extraResourcePoolUses ?? {})) {
    hero.extraResourcePoolUses[pool] = (hero.extraResourcePoolUses[pool] ?? 0) + amount;
  }
  const spells = featSpellIdsAvailable(feat);
  if (spells.length) {
    hero.spells = uniqueValues([...(hero.spells ?? []), ...spells]);
    hero.classSpellList = uniqueValues([...(hero.classSpellList ?? []), ...spells.filter((spellId) => (getContentDefinition("spells", canonicalSpellId(spellId))?.level ?? 1) > 0)]);
    hero.classCantripList = uniqueValues([...(hero.classCantripList ?? []), ...spells.filter((spellId) => (getContentDefinition("spells", canonicalSpellId(spellId))?.level ?? 1) === 0)]);
  }
}

async function chooseAndApplyFeat(hero, oldConMod, options = {}) {
  const feats = selectableFeatDefinitions(hero);
  if (!feats.length) return null;
  const oldSpellPointMax = spellPointMaximum(hero);
  const featId = await showSelectChoiceDialog({
    title: options.title ?? "Choose a Feat",
    message: options.message ?? "Choose a feat instead of the Ability Score Improvement.",
    actor: hero,
    label: "Feat",
    choices: feats.map((feat) => ({
      value: feat.id,
      label: feat.name,
      description: [feat.description, featChoiceSummary(feat)].filter(Boolean).join(" "),
    })),
    confirmText: options.confirmText ?? "Take Feat",
    cancelText: options.cancelText ?? "Cancel Level Up",
  });
  if (!featId) return null;
  const feat = featDefinition(featId);
  const entry = { id: feat.id, choices: {} };
  const notes = [];
  for (const choice of feat.choices ?? []) {
    const note = await applyFeatChoice(hero, feat, choice, entry, oldConMod);
    if (note === null) return null;
    if (note) notes.push(note.trim());
  }
  hero.feats = [...fighterFeatEntries(hero), entry];
  applyFeatStaticBenefits(hero, feat);
  ensureFighterAbilityState(hero);
  const spellPointGain = Math.max(0, spellPointMaximum(hero) - oldSpellPointMax);
  if (spellPointGain) hero.spellPoints = Math.min(spellPointMaximum(hero), (hero.spellPoints ?? 0) + spellPointGain);
  refreshDerivedStats(hero);
  return ` Feat gained: ${feat.name}${notes.length ? ` (${notes.join("; ")})` : ""}.`;
}

async function chooseStartingFeatsForHero(hero, count = 0, sourceName = "Ancestry") {
  const total = Math.max(0, Math.floor(Number(count) || 0));
  const notes = [];
  for (let index = 0; index < total; index += 1) {
    const oldConMod = scoreToMod(baseAbilityScore(hero, "con"));
    const note = await chooseAndApplyFeat(hero, oldConMod, {
      title: `${sourceName} Feat`,
      message: `${sourceName} grants a starting feat. Choose one eligible feat (${index + 1}/${total}).`,
      confirmText: "Take Feat",
      cancelText: "Cancel Character",
    });
    if (note === null) return false;
    notes.push(note.trim());
  }
  if (notes.length && state?.log) addLog(`${hero.name} gains ${notes.join(" ")}`, "important");
  return true;
}

async function chooseAbilityScoreImprovementOrFeat(hero, oldConMod) {
  const featCount = selectableFeatDefinitions(hero).length;
  const mode = await showChoiceDialog({
    title: "Ability Score Improvement",
    message: featCount ? "Choose normal ability score increases or take a feat." : "No eligible feats are available, so choose normal ability score increases.",
    actor: hero,
    choices: [
      { value: "asi", label: "Ability Scores", description: "Increase one ability score by 2, or two ability scores by 1." },
      ...(featCount ? [{ value: "feat", label: "Feat", description: "Take one eligible feat instead of ability score increases." }] : []),
    ],
  });
  if (!mode) return null;
  if (mode === "feat") return chooseAndApplyFeat(hero, oldConMod);
  hero.abilityScores = Object.fromEntries(abilities.map((ability) => [ability, baseAbilityScore(hero, ability)]));
  const increases = await showAbilityScoreImprovementDialog(hero);
  if (!increases) return null;
  const conHpGain = applyLevelUpAbilityIncreases(hero, increases, oldConMod);
  return ` Ability scores improved${conHpGain ? `; Constitution adds ${conHpGain} max HP` : ""}.`;
}

function fighterSubclassDefinitions() {
  return getHeroTemplate("fighter").subclasses ?? [];
}

function barbarianSubclassDefinitions() {
  return getHeroTemplate("barbarian").subclasses ?? [];
}

function adminSubclassDefinitions(classId) {
  return getHeroTemplate(classId).adminSubclasses ?? [];
}

function fighterSubclassById(subclassId) {
  return fighterSubclassDefinitions().find((subclass) => subclass.id === subclassId) ?? null;
}

function barbarianSubclassById(subclassId) {
  return barbarianSubclassDefinitions().find((subclass) => subclass.id === subclassId) ?? null;
}

function subclassDefinitionForHero(hero) {
  if (!hero?.classId || !hero?.subclassId) return null;
  const template = getHeroTemplate(hero.classId);
  const normal = (template.subclasses ?? []).find((subclass) => subclass.id === hero.subclassId) ?? null;
  const admin = (template.adminSubclasses ?? []).find((subclass) => subclass.id === hero.subclassId) ?? null;
  return hero.subclassVariant === "full" ? admin ?? normal : normal ?? admin;
}

function applyFighterSubclass(hero, subclass) {
  hero.subclassId = subclass.id;
  hero.subclassName = fullSubclassName(subclass);
  hero.subclassVariant = subclass.adminOnly ? "full" : "";
  hero.noSubclassChosen = false;
  const classTemplate = getHeroTemplate(hero.classId);
  if (subclass.casterType) hero.casterType = subclass.casterType;
  if (subclass.spellcastingAbility) hero.spellcastingAbility = subclass.spellcastingAbility;
  if (subclass.spellPointProgression) hero.spellPointProgression = { ...subclass.spellPointProgression };
  if (subclass.spellList) hero.classSpellList = [...subclass.spellList];
  if (subclass.expandedSpellList) hero.classSpellList = uniqueValues([...(classTemplate.classSpellList ?? classTemplate.spellList ?? []), ...subclass.expandedSpellList]);
  if (subclass.cantripList) hero.classCantripList = [...subclass.cantripList];
  if (subclass.expandedCantripList) hero.classCantripList = uniqueValues([...(classTemplate.classCantripList ?? classTemplate.cantripList ?? []), ...subclass.expandedCantripList]);
  ensureFighterAbilityState(hero);
  refreshDerivedStats(hero);
}

const levelUpCancelled = Symbol("levelUpCancelled");

function isLevelUpCancelled(value) {
  return value === levelUpCancelled || value?.cancelled === true;
}

function isSpellChoiceCancelled(value) {
  return value === dialogBackValue || value?.cancelled === true;
}

function restoreHeroSnapshot(hero, snapshot) {
  for (const key of Object.keys(hero)) delete hero[key];
  Object.assign(hero, cloneData(snapshot));
  refreshDerivedStats(hero);
}

function subclassOptionCount(subclass, kind, level) {
  let count = 0;
  for (const entry of subclass?.optionCounts?.[kind] ?? []) {
    if (level >= entry.level) count = entry.count;
  }
  return count;
}

async function chooseSubclassOptions({ hero, subclass, kind, property, options, title, message }) {
  const targetCount =
    kind === "metamagic"
      ? metamagicKnownCountForLevel(hero.level ?? 1)
      : kind === "invocations"
        ? invocationKnownCountForLevel(hero.level ?? 1)
        : kind === "pactBoon"
          ? 1
          : subclassOptionCount(subclass, kind, hero.level ?? 1);
  const selected = [...(hero[property] ?? [])].filter((id) => options.some((option) => option.id === id && (hero.level ?? 1) >= (option.level ?? 1)));
  const newlyPicked = [];
  while (selected.length < targetCount) {
    const available = options.filter((option) => (hero.level ?? 1) >= (option.level ?? 1) && !selected.includes(option.id));
    if (!available.length) break;
    const choice = await showSelectChoiceDialog({
      title,
      message: `${message} (${selected.length + 1}/${targetCount})`,
      actor: hero,
      label: message,
      choices: available.map((option) => ({
        value: option.id,
        label: option.name,
        description: option.description,
      })),
    });
    if (!choice) return null;
    selected.push(choice);
    newlyPicked.push(choice);
  }
  hero[property] = uniqueValues(selected);
  return newlyPicked
    .map((id) => options.find((option) => option.id === id)?.name)
    .filter(Boolean);
}

async function chooseFighterSubclassOptions(hero, subclass) {
  if (!subclass) return "";
  const parts = [];
  if (subclass.id === "arcane-archer") {
    const picked = await chooseSubclassOptions({
      hero,
      subclass,
      kind: "arcaneShots",
      property: "knownArcaneShots",
      options: subclass.arcaneShotOptions ?? [],
      title: "Arcane Shot Options",
      message: "Choose an Arcane Shot option.",
    });
    if (picked === null) return null;
    if (picked.length) parts.push(`Arcane Shots: ${picked.join(", ")}`);
  }
  if (subclass.id === "battle-master") {
    const picked = await chooseSubclassOptions({
      hero,
      subclass,
      kind: "maneuvers",
      property: "knownManeuvers",
      options: subclass.maneuverOptions ?? [],
      title: "Battle Master Maneuvers",
      message: "Choose a maneuver.",
    });
    if (picked === null) return null;
    if (picked.length) parts.push(`Maneuvers: ${picked.join(", ")}`);
  }
  if (subclass.id === "rune-knight") {
    const picked = await chooseSubclassOptions({
      hero,
      subclass,
      kind: "runes",
      property: "knownRunes",
      options: subclass.runeOptions ?? [],
      title: "Rune Carver",
      message: "Choose a rune.",
    });
    if (picked === null) return null;
    if (picked.length) parts.push(`Runes: ${picked.join(", ")}`);
  }
  ensureFighterAbilityState(hero);
  return parts.length ? ` ${parts.join(". ")}.` : "";
}

async function chooseBarbarianSubclassOptions(hero, subclass) {
  if (!subclass) return "";
  const parts = [];
  if (subclass.id === "storm-herald") {
    const picked = await chooseSubclassOptions({
      hero,
      subclass,
      kind: "stormAuras",
      property: "knownStormAuras",
      options: subclass.stormAuraOptions ?? [],
      title: "Storm Aura",
      message: "Choose the storm that lives in your rage.",
    });
    if (picked === null) return null;
    if (picked.length) parts.push(`Storm Aura: ${picked.join(", ")}`);
  }
  if (subclass.id === "totem-warrior") {
    const picked = await chooseSubclassOptions({
      hero,
      subclass,
      kind: "totems",
      property: "knownTotems",
      options: subclass.totemOptions ?? [],
      title: "Totem Spirit",
      message: "Choose a totem spirit.",
    });
    if (picked === null) return null;
    if (picked.length) parts.push(`Totems: ${picked.join(", ")}`);
  }
  ensureFighterAbilityState(hero);
  return parts.length ? ` ${parts.join(". ")}.` : "";
}

function metamagicKnownCountForLevel(level) {
  if (level >= 17) return 4;
  if (level >= 10) return 3;
  if (level >= 3) return 2;
  return 0;
}

async function chooseSorcererMetamagicOptions(hero) {
  if (hero.classId !== "sorcerer" || ![3, 10, 17].includes(hero.level ?? 1)) return "";
  const options = getHeroTemplate("sorcerer").metamagicOptions ?? [];
  const picked = await chooseSubclassOptions({
    hero,
    subclass: null,
    kind: "metamagic",
    property: "knownMetamagic",
    options,
    title: "Metamagic",
    message: "Choose a Metamagic option.",
  });
  if (picked === null) return null;
  ensureFighterAbilityState(hero);
  return picked.length ? ` Metamagic learned: ${picked.join(", ")}.` : "";
}

function invocationKnownCountForLevel(level) {
  if (level >= 18) return 8;
  if (level >= 15) return 7;
  if (level >= 12) return 6;
  if (level >= 9) return 5;
  if (level >= 7) return 4;
  if (level >= 5) return 3;
  if (level >= 2) return 2;
  return 0;
}

async function chooseWarlockInvocations(hero) {
  if (hero.classId !== "warlock" || ![2, 5, 7, 9, 12, 15, 18].includes(hero.level ?? 1)) return "";
  const options = getHeroTemplate("warlock").invocationOptions ?? [];
  const picked = await chooseSubclassOptions({
    hero,
    subclass: null,
    kind: "invocations",
    property: "knownInvocations",
    options,
    title: "Eldritch Invocations",
    message: "Choose an invocation.",
  });
  if (picked === null) return null;
  ensureFighterAbilityState(hero);
  return picked.length ? ` Invocations learned: ${picked.join(", ")}.` : "";
}

function applyWarlockPactBoonChoice(hero, pactId) {
  hero.pactBoon = pactId;
  if (pactId === "pactTome") {
    hero.spells = uniqueValues([...(hero.spells ?? []), "guidance", "sacred-flame", "shillelagh"]);
    hero.classCantripList = uniqueValues([...(hero.classCantripList ?? []), "guidance", "sacred-flame", "shillelagh"]);
  }
  if (pactId === "pactBlade") {
    hero.weaponProficiencies = proficiencyEntries([...(hero.weaponProficiencies ?? []), "martial"]);
  }
}

async function chooseWarlockPactBoon(hero) {
  if (hero.classId !== "warlock" || (hero.level ?? 1) !== 3 || hero.pactBoon) return "";
  const options = getHeroTemplate("warlock").pactBoonOptions ?? [];
  const choice = await showSelectChoiceDialog({
    title: "Pact Boon",
    message: "Choose the pact gift your patron grants.",
    actor: hero,
    label: "Pact",
    choices: options.map((option) => ({
      value: option.id,
      label: option.name,
      description: option.description,
    })),
  });
  if (!choice) return null;
  applyWarlockPactBoonChoice(hero, choice);
  ensureFighterAbilityState(hero);
  const name = options.find((option) => option.id === choice)?.name ?? "Pact Boon";
  return ` Pact Boon: ${name}.`;
}

const beastMasterCompanionOptions = [
  {
    id: "wolf",
    monsterId: "forestWolf",
    name: "Forest Wolf",
    description: "Fast melee hunter. Best at pursuit, Perception, and knocking wounded enemies down.",
    attackAbility: "dex",
    abilityScores: { str: 12, dex: 16, con: 12, int: 3, wis: 12, cha: 6 },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["perception", "stealth"],
  },
  {
    id: "mastiff",
    monsterId: "strayFightingDog",
    name: "War Mastiff",
    description: "Reliable guard beast. Good HP, good senses, and strong single-target pressure.",
    attackAbility: "str",
    abilityScores: { str: 14, dex: 12, con: 13, int: 3, wis: 12, cha: 7 },
    savingThrowProficiencies: ["str"],
    skillProficiencies: ["athletics", "perception"],
  },
  {
    id: "panther",
    monsterId: "summonRangerPanther",
    name: "Shadow Panther",
    description: "Agile ambusher. High Dexterity, stealth, and hard-hitting claws.",
    attackAbility: "dex",
    abilityScores: { str: 12, dex: 16, con: 12, int: 3, wis: 14, cha: 7 },
    damage: { count: 1, sides: 6, bonus: 0, type: "slashing", attackType: "weapon", weaponName: "Claws" },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["perception", "stealth"],
  },
  {
    id: "giant-badger",
    monsterId: "summonRangerGiantBadger",
    name: "Giant Badger",
    description: "Burrowing bruiser. Tough Constitution and two-claw pressure.",
    attackAbility: "str",
    abilityScores: { str: 13, dex: 10, con: 15, int: 2, wis: 12, cha: 5 },
    savingThrowProficiencies: ["con"],
    skillProficiencies: ["athletics", "perception"],
  },
  {
    id: "giant-crab",
    monsterId: "summonRangerGiantCrab",
    name: "Giant Crab",
    description: "Armored grappler. High AC, blindsight, and strong in water-heavy maps.",
    attackAbility: "str",
    abilityScores: { str: 13, dex: 15, con: 11, int: 1, wis: 9, cha: 3 },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["stealth", "athletics"],
  },
  {
    id: "giant-frog",
    monsterId: "summonRangerGiantFrog",
    name: "Giant Frog",
    description: "Amphibious controller. Good HP and useful positioning in wet dungeons.",
    attackAbility: "str",
    abilityScores: { str: 12, dex: 13, con: 11, int: 2, wis: 10, cha: 3 },
    savingThrowProficiencies: ["str"],
    skillProficiencies: ["athletics", "perception"],
  },
  {
    id: "giant-poisonous-snake",
    monsterId: "summonRangerGiantPoisonousSnake",
    name: "Giant Poisonous Snake",
    description: "Venom striker. Excellent Dexterity and accuracy, lighter durability.",
    attackAbility: "dex",
    abilityScores: { str: 10, dex: 18, con: 13, int: 2, wis: 10, cha: 3 },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["perception", "stealth"],
  },
  {
    id: "giant-wolf-spider",
    monsterId: "summonRangerGiantWolfSpider",
    name: "Giant Wolf Spider",
    description: "Climbing venom ambusher. Great stealth, darkvision, and mobility.",
    attackAbility: "dex",
    abilityScores: { str: 12, dex: 16, con: 13, int: 3, wis: 12, cha: 4 },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["perception", "stealth"],
  },
  {
    id: "pteranodon",
    monsterId: "summonRangerPteranodon",
    name: "Pteranodon",
    description: "Flying skirmisher. Fast aerial reach, but wants careful positioning.",
    attackAbility: "dex",
    abilityScores: { str: 12, dex: 15, con: 10, int: 2, wis: 9, cha: 5 },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["perception"],
  },
  {
    id: "mule",
    monsterId: "summonRangerMule",
    name: "Mule",
    description: "Sturdy pack companion. Simple, durable, and surprisingly useful.",
    attackAbility: "str",
    abilityScores: { str: 14, dex: 10, con: 13, int: 2, wis: 10, cha: 5 },
    savingThrowProficiencies: ["str", "con"],
    skillProficiencies: ["athletics", "perception"],
  },
  {
    id: "owl",
    monsterId: "summonRangerOwl",
    name: "Owl",
    description: "Night scout. Strong Perception, stealth, flight, and excellent darkvision.",
    attackAbility: "dex",
    abilityScores: { str: 3, dex: 13, con: 8, int: 2, wis: 12, cha: 7 },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["perception", "stealth"],
  },
  {
    id: "hawk",
    monsterId: "talonHawk",
    name: "Talon Hawk",
    description: "Ranged skirmisher. Keeps distance and harasses enemies from the air.",
    attackAbility: "dex",
    abilityScores: { str: 6, dex: 16, con: 10, int: 3, wis: 14, cha: 7 },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["perception"],
  },
  {
    id: "boar",
    monsterId: "brambleBoar",
    name: "Bramble Boar",
    description: "Tough charger. Strong Constitution, solid HP, and straightforward melee AI.",
    attackAbility: "str",
    abilityScores: { str: 14, dex: 11, con: 14, int: 2, wis: 10, cha: 5 },
    savingThrowProficiencies: ["con"],
    skillProficiencies: ["athletics", "perception"],
  },
  {
    id: "spider",
    monsterId: "gloomwebSpider",
    name: "Gloomweb Spider",
    description: "Poisonous ambusher. Lower damage dice, but poison resistance and stealth.",
    attackAbility: "dex",
    abilityScores: { str: 10, dex: 14, con: 12, int: 2, wis: 10, cha: 4 },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["stealth", "perception"],
  },
  {
    id: "hare",
    monsterId: "thornbackHare",
    name: "Thornback Hare",
    description: "Tiny evasive striker. High AC profile and speed, but lighter HP.",
    attackAbility: "dex",
    abilityScores: { str: 6, dex: 16, con: 10, int: 2, wis: 12, cha: 6 },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["acrobatics", "stealth"],
  },
  {
    id: "otter",
    monsterId: "marshOtter",
    name: "River Otter",
    description: "Creative skirmisher. Balanced, nimble, and useful in wet dungeon spaces.",
    attackAbility: "dex",
    abilityScores: { str: 8, dex: 16, con: 12, int: 3, wis: 12, cha: 8 },
    savingThrowProficiencies: ["dex"],
    skillProficiencies: ["acrobatics", "perception"],
  },
];

function companionSpawnPosition(owner) {
  const occupied = new Set(
    Object.values(state.fighters ?? {})
      .filter((fighter) => fighter.alive && fighter.position)
      .flatMap((fighter) => window.DungeonGrid.fighterCells(fighter).map(positionKey)),
  );
  const base = owner?.position ?? { x: 4, y: 6 };
  const candidates = [
    { x: base.x + 1, y: base.y },
    { x: base.x - 1, y: base.y },
    { x: base.x, y: base.y + 1 },
    { x: base.x, y: base.y - 1 },
    { x: base.x + 1, y: base.y + 1 },
  ];
  return candidates.find((position) => !occupied.has(positionKey(position))) ?? { x: base.x + 1, y: base.y };
}

async function chooseBeastCompanionStatIncreases(companion) {
  companion.abilityScores = Object.fromEntries(abilities.map((ability) => [ability, baseAbilityScore(companion, ability)]));
  const chosen = [];
  for (let index = 0; index < 2; index += 1) {
    const ability = await showChoiceDialog({
      title: "Companion Stat Point",
      message: `Assign stat point ${index + 1} of 2 for ${companion.name}.`,
      actor: companion,
      choices: abilities.map((value) => ({
        value,
        label: value.toUpperCase(),
        description: `Current score ${companion.abilityScores[value]}.`,
      })),
    });
    if (!ability) return null;
    companion.abilityScores[ability] = Math.min(20, companion.abilityScores[ability] + 1);
    chosen.push(ability.toUpperCase());
  }
  return chosen;
}

function createBeastMasterCompanion(hero, option, identity, options = {}) {
  const template = getMonsterTemplate(option.monsterId);
  if (!template) return null;
  const abilityScores = { ...option.abilityScores };
  const companion = createFriendlyBeastFromMonster(option.monsterId, {
    id: `beastmaster-${hero.id}-${option.id}-${Date.now()}`,
    name: (identity?.name || option.name).slice(0, 32),
    tokenArt: identity?.tokenArt || template.tokenArt,
    position: companionSpawnPosition(hero),
    kind: "companion",
    control: "player",
    renameable: true,
    classId: "sidekick-warrior",
    className: "Beast Companion",
    sidekickClassName: "Beast Companion",
    sidekickWarriorRole: "attacker",
    level: hero.level ?? 3,
    hitDiceRemaining: hero.level ?? 3,
    xp: options.xp ?? 0,
    followHeroId: hero.id,
    followDistanceSquares: 2,
    rangerCompanion: true,
    rangerCompanionOwnerId: hero.id,
    rangerCompanionNormalMaxHp: Math.max(template.maxHp ?? 1, 1),
    companionAttackAbility: option.attackAbility,
    abilityScores,
    baseAttackAbilityMod: scoreToMod(abilityScores[option.attackAbility] ?? 10),
    damage: option.damage ?? template.damage,
    savingThrowProficiencies: option.savingThrowProficiencies,
    skillProficiencies: option.skillProficiencies,
  });
  if (!companion) return null;
  companion.baseDamage = { ...(option.damage ?? template.damage) };
  companion.rangerCompanionOptionId = option.id;
  refreshDerivedStats(companion);
  companion.hp = companion.maxHp;
  return companion;
}

async function chooseBeastMasterCompanion(hero, options = {}) {
  if (hero.classId !== "ranger" || hero.subclassId !== "beast-master" || (hero.level ?? 1) < 3) return "";
  if (!options.forceReplacement && hero.beastCompanionId && state.fighters?.[hero.beastCompanionId]) return "";
  const existing = rangerBeastCompanionForOwner(hero.id);
  if (existing && !options.forceReplacement) {
    hero.beastCompanionId = existing.id;
    return "";
  }
  const choice = await showSelectChoiceDialog({
    title: "Ranger's Companion",
    message: "Choose the beast that is trained to fight beside you.",
    actor: hero,
    label: "Companion",
    choices: beastMasterCompanionOptions
      .filter((option) => getMonsterTemplate(option.monsterId))
      .map((option) => ({
        value: option.id,
        label: option.name,
        description: option.description,
        info: `Attack ability: ${option.attackAbility.toUpperCase()}. Saves: ${option.savingThrowProficiencies.map((save) => save.toUpperCase()).join(", ")}. Skills: ${option.skillProficiencies.map(skillName).join(", ")}.`,
      })),
  });
  if (!choice) return null;
  const option = beastMasterCompanionOptions.find((entry) => entry.id === choice);
  const template = getMonsterTemplate(option.monsterId);
  const identity = await showHeroIdentityDialog({
    title: "Companion Identity",
    message: "Name your companion and optionally add a custom token picture.",
    nameValue: option.name,
    tokenArt: template?.tokenArt ?? "",
    confirmText: "Choose Companion",
  });
  if (!identity) return null;
  const companion = createBeastMasterCompanion(hero, option, identity, { xp: options.inheritedXp ?? 0 });
  if (!companion) return "";
  const statChoices = await chooseBeastCompanionStatIncreases(companion);
  if (!statChoices) return null;
  refreshDerivedStats(companion);
  companion.hp = companion.maxHp;
  addRecruitedAllyToParty(companion);
  hero.beastCompanionId = companion.id;
  addLog(`${companion.name} becomes ${hero.name}'s ranger companion.`, "important");
  return ` Ranger's Companion: ${companion.name} (${option.name}); stat points ${statChoices.join(", ")}.`;
}

function canReplaceDeadBeastMasterCompanion(hero = activeHero()) {
  return Boolean(
    state.mode === "home" &&
      hero?.classId === "ranger" &&
      hero.subclassId === "beast-master" &&
      deadRangerBeastCompanionForOwner(hero.id) &&
      !rangerBeastCompanionForOwner(hero.id),
  );
}

async function replaceDeadBeastMasterCompanion() {
  const hero = activeHero();
  if (!canReplaceDeadBeastMasterCompanion(hero)) return;
  const oldCompanion = deadRangerBeastCompanionForOwner(hero.id);
  const inheritedXp = oldCompanion?.xp ?? 0;
  const text = await chooseBeastMasterCompanion(hero, { forceReplacement: true, inheritedXp });
  if (text === null) return;
  if (oldCompanion?.id) {
    state.party.heroIds = (state.party.heroIds ?? []).filter((id) => id !== oldCompanion.id);
    state.party.rosterIds = (state.party.rosterIds ?? state.party.heroIds ?? []).filter((id) => id !== oldCompanion.id);
    oldCompanion.retiredCompanion = true;
  }
  addLog(`${hero.name} calls a new ranger companion.${inheritedXp ? ` It inherits ${inheritedXp} XP from the fallen companion.` : ""}`, "important");
  hideHomeMenu();
  render();
  if (text) {
    await showChoiceDialog({
      title: "New Ranger Companion",
      message: `${text}${inheritedXp ? ` Inherited XP: ${inheritedXp}.` : ""}`,
      choices: [{ value: "ok", label: "Continue" }],
    });
  }
}

async function chooseClassSubclassOptions(hero, subclass) {
  if (hero.classId === "fighter") return chooseFighterSubclassOptions(hero, subclass);
  if (hero.classId === "barbarian") return chooseBarbarianSubclassOptions(hero, subclass);
  return "";
}

function classSubclassDefinitions(classId) {
  if (classId === "fighter") return fighterSubclassDefinitions();
  if (classId === "barbarian") return barbarianSubclassDefinitions();
  return getHeroTemplate(classId).subclasses ?? [];
}

function selectableClassSubclassDefinitions(classId) {
  const normal = classSubclassDefinitions(classId);
  if (!adminEnabled()) return normal;
  return [...normal, ...adminSubclassDefinitions(classId)];
}

function classSubclassById(classId, subclassId) {
  if (classId === "fighter") return fighterSubclassById(subclassId);
  if (classId === "barbarian") return barbarianSubclassById(subclassId);
  return classSubclassDefinitions(classId).find((subclass) => subclass.id === subclassId) ?? null;
}

function selectableClassSubclassByChoice(classId, choiceValue) {
  if (String(choiceValue ?? "").startsWith("admin:")) {
    const subclassId = String(choiceValue).slice("admin:".length);
    return adminSubclassDefinitions(classId).find((subclass) => subclass.id === subclassId) ?? null;
  }
  return classSubclassById(classId, choiceValue);
}

function fullSubclassName(subclass) {
  return subclass?.name ?? "Subclass";
}

function subclassChoiceTitle(classId) {
  if (classId === "barbarian") return "Primal Path";
  if (classId === "fighter") return "Martial Archetype";
  return "Subclass";
}

async function chooseClassSubclass(hero) {
  if (!classSubclassDefinitions(hero.classId).length || hero.subclassId || hero.noSubclassChosen || (hero.level ?? 1) < 3) return "";
  const title = subclassChoiceTitle(hero.classId);
  const selectableSubclasses = selectableClassSubclassDefinitions(hero.classId);
  const subclassId = await showSelectChoiceDialog({
    title,
    message: `Choose a subclass for ${hero.name ?? "this hero"}.`,
    actor: hero,
    label: "Choose a subclass:",
    defaultValue: "",
    choices: [
      {
        value: "",
        label: "No Subclass",
        description: "Keep this hero on the base class path. They gain no subclass features or subclass choices.",
        info: "If you want to go real hardcore. You can certainly try.",
      },
      ...selectableSubclasses.map((subclass) => ({
        value: subclass.adminOnly ? `admin:${subclass.id}` : subclass.id,
        label: fullSubclassName(subclass),
        description: subclass.summary,
        info: subclassGameplayGuideText(subclass),
      })),
    ],
  });
  if (subclassId === "") {
    hero.noSubclassChosen = true;
    hero.subclassId = "";
    hero.subclassName = "";
    hero.subclassVariant = "";
    return ` No subclass chosen.`;
  }
  if (subclassId === null) return levelUpCancelled;
  const subclass = selectableClassSubclassByChoice(hero.classId, subclassId);
  if (!subclass) return ` No subclass chosen.`;
  applyFighterSubclass(hero, subclass);
  const optionText = await chooseClassSubclassOptions(hero, subclass);
  if (optionText === null) return levelUpCancelled;

  const gained = [];
  if (hero.classId === "fighter" && subclass.id === "arcane-archer") {
    const skill = await showChoiceDialog({
      title: "Arcane Archer Lore",
      message: "Choose your Arcane Archer lore proficiency.",
      actor: hero,
      choices: [
        { value: "arcana", label: "Arcana" },
        { value: "nature", label: "Nature" },
      ],
    });
    if (!skill) return levelUpCancelled;
    if (skill) {
      hero.skillProficiencies = uniqueValues([...(hero.skillProficiencies ?? []), skill]);
      gained.push(skillName(skill));
    }
  }
  if (hero.classId === "fighter" && subclass.id === "battle-master") {
    const tool = await chooseUniqueProficiencies({
      title: "Student of War",
      message: "Choose an artisan tool proficiency.",
      count: 1,
      choices: ["smiths-tools", "alchemists-supplies", "brewers-supplies", "calligraphers-supplies", "carpenters-tools", "cooks-utensils", "masons-tools", "painters-supplies", "potters-tools", "weavers-tools", "woodcarvers-tools"],
      selected: hero.toolProficiencies ?? [],
      valuePrefix: "tool:",
    });
    if (tool === null) return levelUpCancelled;
    if (tool?.length) {
      hero.toolProficiencies = uniqueValues([...(hero.toolProficiencies ?? []), ...tool]);
      gained.push(tool.map(toolName).join(", "));
    }
  }
  if (hero.classId === "fighter" && subclass.id === "banneret") {
    hero.skillProficiencies = uniqueValues([...(hero.skillProficiencies ?? []), "persuasion"]);
    hero.expertiseSkills = uniqueValues([...(hero.expertiseSkills ?? []), "persuasion"]);
    gained.push("Persuasion expertise");
  }
  if (hero.classId === "fighter" && ["cavalier", "samurai"].includes(subclass.id)) {
    const choices = subclass.id === "cavalier"
      ? ["animal-handling", "history", "insight", "performance", "persuasion"]
      : ["history", "insight", "performance", "persuasion"];
    const skill = await chooseUniqueProficiencies({
      title: "Bonus Proficiency",
      message: `Choose a ${subclass.name} skill proficiency.`,
      count: 1,
      choices,
      selected: hero.skillProficiencies ?? [],
    });
    if (skill === null) return levelUpCancelled;
    if (skill?.length) {
      hero.skillProficiencies = uniqueValues([...(hero.skillProficiencies ?? []), ...skill]);
      gained.push(skill.map(skillName).join(", "));
    }
  }
  if (hero.classId === "fighter" && subclass.id === "rune-knight") {
    hero.toolProficiencies = uniqueValues([...(hero.toolProficiencies ?? []), "smiths-tools"]);
    hero.languages = uniqueValues([...(hero.languages ?? []), "giant"]);
    gained.push("Smith's tools, Giant");
  }
  if (hero.classId === "fighter" && subclass.id === "eldritch-knight") {
    const cantrips = await chooseClassCantrips(hero, 2, hero.spells ?? [], { cancelAborts: true });
    if (isSpellChoiceCancelled(cantrips)) return levelUpCancelled;
    hero.spells = cantrips.spells;
    hero.unusedCantripChoiceCredits = cantrips.unusedCredits;
    const spells = await chooseClassSpells(hero, 3, hero.spells ?? [], { cancelAborts: true });
    if (isSpellChoiceCancelled(spells)) return levelUpCancelled;
    hero.spells = spells.spells;
    hero.unusedSpellChoiceCredits = spells.unusedCredits;
    gained.push("wizard spellcasting");
  }
  if (subclass.casterType === "third" && !(hero.classId === "fighter" && subclass.id === "eldritch-knight")) {
    const cantrips = await chooseClassCantrips(hero, 2, hero.spells ?? [], { cancelAborts: true });
    if (isSpellChoiceCancelled(cantrips)) return levelUpCancelled;
    hero.spells = cantrips.spells;
    hero.unusedCantripChoiceCredits = cantrips.unusedCredits;
    const spells = await chooseClassSpells(hero, 3, hero.spells ?? [], { cancelAborts: true });
    if (isSpellChoiceCancelled(spells)) return levelUpCancelled;
    hero.spells = spells.spells;
    hero.unusedSpellChoiceCredits = spells.unusedCredits;
    gained.push("subclass spellcasting");
  }
  const beastCompanionText = await chooseBeastMasterCompanion(hero);
  if (beastCompanionText === null) return levelUpCancelled;

  ensureFighterAbilityState(hero);
  refreshDerivedStats(hero);
  return ` ${title}: ${fullSubclassName(subclass)}${gained.length ? ` (${gained.join("; ")})` : ""}.${optionText}${beastCompanionText}`;
}

async function applyClassSubclassLevelChoices(hero) {
  if (!hero.subclassId) return "";
  let text = "";
  if (hero.classId === "ranger" && hero.subclassId === "beast-master") {
    const companionText = await chooseBeastMasterCompanion(hero);
    if (companionText === null) return levelUpCancelled;
    text += companionText;
  }
  if (hero.classId === "fighter" && hero.subclassId === "champion" && (hero.level ?? 1) === 10) {
    const style = await chooseFightingStyle("fighter");
    if (!style) return levelUpCancelled;
    if (style) {
      hero.fightingStyles = uniqueValues([...(hero.fightingStyles ?? []), style]);
      text += ` Additional Fighting Style: ${style}.`;
    }
  }
  if (hero.classId === "fighter" && hero.subclassId === "samurai" && hero.subclassVariant === "full" && (hero.level ?? 1) === 7) {
    const saveChoices = ["wis", "int", "cha"].filter((save) => !(hero.savingThrowProficiencies ?? []).includes(save));
    const save = saveChoices.includes("wis") ? "wis" : saveChoices[0];
    if (save) {
      hero.savingThrowProficiencies = uniqueValues([...(hero.savingThrowProficiencies ?? []), save]);
      text += ` Elegant Courtier save: ${save.toUpperCase()}.`;
    }
  }
  if (hero.classId === "fighter" && hero.subclassId === "eldritch-knight") {
    const cantripChoices = ((hero.level ?? 1) === 10 ? 1 : 0) + (hero.unusedCantripChoiceCredits ?? 0);
    if (cantripChoices > 0) {
      const result = await chooseClassCantrips(hero, cantripChoices, hero.spells ?? [], { cancelAborts: true });
      if (isSpellChoiceCancelled(result)) return levelUpCancelled;
      const gained = result.spells.filter((spellId) => !(hero.spells ?? []).includes(spellId));
      hero.spells = result.spells;
      hero.unusedCantripChoiceCredits = result.unusedCredits;
      if (gained.length) text += ` New Eldritch Knight cantrip: ${gained.map((spellId) => getContentDefinition("spells", spellId)?.name ?? spellId).join(", ")}.`;
    }
    const spellChoiceLevels = hero.subclassVariant === "full"
      ? new Set([4, 7, 8, 10, 11, 13, 14, 16, 19, 20])
      : new Set([4, 6, 8, 10, 11, 13, 14, 16, 18, 20]);
    const spellChoices = (spellChoiceLevels.has(hero.level ?? 1) ? 1 : 0) + (hero.unusedSpellChoiceCredits ?? 0);
    if (spellChoices > 0) {
      const result = await chooseClassSpells(hero, spellChoices, hero.spells ?? [], { cancelAborts: true });
      if (isSpellChoiceCancelled(result)) return levelUpCancelled;
      const gained = result.spells.filter((spellId) => !(hero.spells ?? []).includes(spellId));
      hero.spells = result.spells;
      hero.unusedSpellChoiceCredits = result.unusedCredits;
      if (gained.length) text += ` New Eldritch Knight spell: ${gained.map((spellId) => getContentDefinition("spells", spellId)?.name ?? spellId).join(", ")}.`;
    }
  }
  const subclass = subclassDefinitionForHero(hero);
  if (subclass?.casterType === "third" && !(hero.classId === "fighter" && hero.subclassId === "eldritch-knight")) {
    const cantripChoices = ((hero.level ?? 1) === 10 ? 1 : 0) + (hero.unusedCantripChoiceCredits ?? 0);
    if (cantripChoices > 0) {
      const result = await chooseClassCantrips(hero, cantripChoices, hero.spells ?? [], { cancelAborts: true });
      if (isSpellChoiceCancelled(result)) return levelUpCancelled;
      const gained = result.spells.filter((spellId) => !(hero.spells ?? []).includes(spellId));
      hero.spells = result.spells;
      hero.unusedCantripChoiceCredits = result.unusedCredits;
      if (gained.length) text += ` New subclass cantrip: ${gained.map((spellId) => getContentDefinition("spells", spellId)?.name ?? spellId).join(", ")}.`;
    }
    const spellChoiceLevels = new Set([4, 6, 8, 10, 11, 13, 14, 16, 18, 20]);
    const spellChoices = (spellChoiceLevels.has(hero.level ?? 1) ? 1 : 0) + (hero.unusedSpellChoiceCredits ?? 0);
    if (spellChoices > 0) {
      const result = await chooseClassSpells(hero, spellChoices, hero.spells ?? [], { cancelAborts: true });
      if (isSpellChoiceCancelled(result)) return levelUpCancelled;
      const gained = result.spells.filter((spellId) => !(hero.spells ?? []).includes(spellId));
      hero.spells = result.spells;
      hero.unusedSpellChoiceCredits = result.unusedCredits;
      if (gained.length) text += ` New subclass spell: ${gained.map((spellId) => getContentDefinition("spells", spellId)?.name ?? spellId).join(", ")}.`;
    }
  }
  if (hero.classId === "fighter" && ["arcane-archer", "battle-master", "rune-knight"].includes(hero.subclassId)) {
    const optionText = await chooseFighterSubclassOptions(hero, subclassDefinitionForHero(hero));
    if (optionText === null) return levelUpCancelled;
    text += optionText;
  }
  if (hero.classId === "barbarian" && ["storm-herald", "totem-warrior"].includes(hero.subclassId)) {
    const optionText = await chooseBarbarianSubclassOptions(hero, subclassDefinitionForHero(hero));
    if (optionText === null) return levelUpCancelled;
    text += optionText;
  }
  return text;
}

async function levelUpHero() {
  const hero = activeHero();
  if (state.mode === "home" && canTrainAsSidekick(hero)) {
    await trainSidekickCompanion();
    return;
  }
  if (state.mode !== "home" || !canLevelUp(hero)) return;
  const levelUpSnapshot = cloneData(hero);
  const cancelLevelUp = () => {
    restoreHeroSnapshot(hero, levelUpSnapshot);
    addLog(`${hero.name}'s level up was cancelled.`, "important");
    render();
  };
  const oldConMod = scoreToMod(baseAbilityScore(hero, "con"));
  const racialHpGain = hero.racialHpPerLevel ?? 0;
  const hpRoll = isTrainedSidekick(hero) ? rollDie(hero.hitDie ?? 8) : null;
  const hpGain = isTrainedSidekick(hero)
    ? Math.max(1, hpRoll + oldConMod)
    : Math.max(1, Math.floor((hero.hitDie ?? 10) / 2) + 1 + oldConMod + racialHpGain);
  hero.level = (hero.level ?? 1) + 1;
  hero.role = combatantRoleLabel(hero);
  hero.baseMaxHp = (hero.baseMaxHp ?? hero.maxHp) + hpGain;
  hero.maxHp = hero.baseMaxHp;
  hero.hitDiceRemaining = hero.level;
  const subclassText = await chooseClassSubclass(hero);
  if (isLevelUpCancelled(subclassText)) {
    cancelLevelUp();
    return;
  }
  let asiText = "";
  if (abilityScoreImprovementLevelsForClass(hero.classId).has(hero.level ?? 1)) {
    const asiOrFeatText = await chooseAbilityScoreImprovementOrFeat(hero, oldConMod);
    if (!asiOrFeatText) {
      cancelLevelUp();
      return;
    }
    asiText = asiOrFeatText;
  }
  ensureFighterAbilityState(hero);
  const subclassLevelText = await applyClassSubclassLevelChoices(hero);
  if (isLevelUpCancelled(subclassLevelText)) {
    cancelLevelUp();
    return;
  }
  const metamagicText = await chooseSorcererMetamagicOptions(hero);
  if (metamagicText === null) {
    cancelLevelUp();
    return;
  }
  const pactBoonText = await chooseWarlockPactBoon(hero);
  if (pactBoonText === null) {
    cancelLevelUp();
    return;
  }
  const invocationText = await chooseWarlockInvocations(hero);
  if (invocationText === null) {
    cancelLevelUp();
    return;
  }
  let spellText = "";
  const cantripChoices =
    (isSidekickSpellcaster(hero) ? sidekickCantripChoiceCountForLevel(hero, hero.level ?? 1) : cantripChoiceCountForClassLevel(hero.classId, hero.level ?? 1)) +
    (hero.unusedCantripChoiceCredits ?? 0);
  if (cantripChoices > 0) {
    const result = await chooseClassCantrips(hero, cantripChoices, hero.spells ?? [], { cancelAborts: true });
    if (isSpellChoiceCancelled(result)) {
      cancelLevelUp();
      return;
    }
    const gained = result.spells.filter((spellId) => !(hero.spells ?? []).includes(spellId));
    hero.spells = result.spells;
    hero.unusedCantripChoiceCredits = result.unusedCredits;
    if (gained.length) spellText = ` New cantrip${gained.length === 1 ? "" : "s"}: ${gained.map((spellId) => getContentDefinition("spells", spellId)?.name ?? spellId).join(", ")}.`;
  }
  const spellChoices =
    (isSidekickSpellcaster(hero) ? sidekickSpellChoiceCountForLevel(hero, hero.level ?? 1) : spellChoiceCountForClassLevel(hero.classId, hero.level ?? 1)) +
    (hero.unusedSpellChoiceCredits ?? 0);
  if (spellChoices > 0) {
    const result = await chooseClassSpells(hero, spellChoices, hero.spells ?? [], { cancelAborts: true });
    if (isSpellChoiceCancelled(result)) {
      cancelLevelUp();
      return;
    }
    const gained = result.spells.filter((spellId) => !(hero.spells ?? []).includes(spellId));
    hero.spells = result.spells;
    hero.unusedSpellChoiceCredits = result.unusedCredits;
    if (gained.length) spellText += ` New spell${gained.length === 1 ? "" : "s"}: ${gained.map((spellId) => getContentDefinition("spells", spellId)?.name ?? spellId).join(", ")}.`;
  }
  let expertiseText = isClassHero(hero) ? await chooseLevelUpExpertise(hero) : "";
  if (expertiseText === null) {
    cancelLevelUp();
    return;
  }
  if (isSidekickExpert(hero) && [3, 15].includes(hero.level ?? 1)) {
    const gained = await chooseExpertiseProficiencies({
      title: "Expertise",
      message: `${hero.name}'s expert training improves. Choose skill proficiencies to master.`,
      count: 2,
      skillProficiencies: hero.skillProficiencies ?? [],
      existingSkillExpertise: hero.expertiseSkills ?? [],
      skillsOnly: true,
    });
    if (!gained) {
      cancelLevelUp();
      return;
    }
    if (gained) {
      hero.expertiseSkills = uniqueValues([...(hero.expertiseSkills ?? []), ...gained.skills]);
      expertiseText = gained.skills.length ? ` Expertise gained: ${gained.skills.map(skillName).join(", ")}.` : "";
    }
  }
  if (isSidekickExpert(hero) && (hero.level ?? 1) === 18) {
    const save = await chooseSidekickSavingThrow("Sharp Mind", ["int", "wis", "cha"]);
    if (!save) {
      cancelLevelUp();
      return;
    }
    if (save) {
      hero.savingThrowProficiencies = uniqueValues([...(hero.savingThrowProficiencies ?? []), save]);
      expertiseText += ` Sharp Mind save: ${save.toUpperCase()}.`;
    }
  }
  if (isSidekickSpellcaster(hero) && (hero.level ?? 1) === 14) {
    const school = await showChoiceDialog({
      title: "Empowered Spells",
      message: "Choose a school of magic to empower.",
      choices: ["abjuration", "conjuration", "divination", "enchantment", "evocation", "illusion", "necromancy", "transmutation", "combat"].map((value) => ({
        value,
        label: value[0].toUpperCase() + value.slice(1),
      })),
      actor: hero,
    });
    if (!school) {
      cancelLevelUp();
      return;
    }
    if (school) {
      hero.empoweredSpellSchool = school;
      expertiseText += ` Empowered school: ${school}.`;
    }
  }
  refreshDerivedStats(hero);
  syncRangerBeastCompanionsForOwner(hero).forEach((companion) => {
    companion.hp = companion.maxHp;
  });
  hero.hp = hero.maxHp;
  hero.spellPointMax = spellPointMaximum(hero);
  hero.spellPoints = hero.spellPointMax;
  const features = classFeatureNames(hero, hero.level);
  const featureText = features.length ? ` New feature${features.length === 1 ? "" : "s"}: ${features.join(", ")}.` : "";
  const racialHpText = isTrainedSidekick(hero) ? ` (${hpRoll} + CON)` : racialHpGain ? ` (${racialHpGain} from Dwarven Toughness)` : "";
  const levelUpText = `${hero.name} reaches level ${hero.level} and gains ${hpGain} max HP${racialHpText}.${featureText}${subclassText}${subclassLevelText}${metamagicText}${pactBoonText}${invocationText}${asiText}${spellText}${expertiseText}`;
  addLog(levelUpText, "important");
  hideHomeMenu();
  render();
  await showChoiceDialog({
    title: `Level ${hero.level} ${hero.className ?? "Fighter"}`,
    message: levelUpText,
    choices: [{ value: "ok", label: "Continue" }],
  });
}

function consumeEquippedItem(itemId) {
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  consumeInventoryItemQuantity(hero, itemId, 1);
}

function applyHealingToHero(target, healing) {
  const multiplier = (target.statusEffects ?? []).reduce((value, effect) => Math.min(value, effect.healingReceivedMultiplier ?? 1), 1);
  healing = Math.floor(Math.max(0, healing) * multiplier);
  const before = target.hp;
  target.hp = Math.min(target.maxHp, target.hp + healing);
  if (target.hp > 0) {
    target.alive = true;
    clearStableAtZero(target);
    resetDeathSaveCounters(target);
  }
  refreshDerivedStats(target);
  return target.hp - before;
}

function thrownConsumableTargets(hero, item) {
  if (state.mode !== "combat" || !hero) return [];
  const rangeSquares = Math.max(1, Math.floor(Number(item?.use?.rangeFeet ?? 20) / feetPerSquare));
  return visibleMonsters()
    .filter((monster) => monster.alive && hostileTo(hero, monster))
    .filter((monster) => fightersWithinSquares(hero, monster, rangeSquares) && hasClearLineOfSightBetweenFighters(hero, monster))
    .sort((a, b) => attackGridDistanceBetweenFighters(hero, a) - attackGridDistanceBetweenFighters(hero, b) || a.name.localeCompare(b.name));
}

function thrownConsumableTarget(hero, item) {
  const targets = thrownConsumableTargets(hero, item);
  if (!targets.length) return null;
  const selected = state.fighters?.[selectedAttackTargetId];
  if (selected && targets.some((target) => target.id === selected.id)) return selected;
  return targets[0];
}

function refundItemUseResource(hero, item) {
  if (state.mode !== "combat" || !hero) return;
  if (itemUseResource(item) === "bonusAction") hero.hasBonusAction = true;
  else hero.hasAction = true;
}

function useThrownConsumable(hero, item, itemId) {
  if (state.mode !== "combat") {
    refundItemUseResource(hero, item);
    addLog(`${hero.name} needs a combat target before throwing ${item.name}.`, "important");
    return false;
  }
  const target = thrownConsumableTarget(hero, item);
  if (!target) {
    refundItemUseResource(hero, item);
    addLog(`${hero.name} needs a visible enemy within ${item.use?.rangeFeet ?? 20} feet for ${item.name}.`, "important");
    return false;
  }
  if (!spendItemCharge(item)) {
    refundItemUseResource(hero, item);
    return false;
  }
  const ability = item.use?.attackAbility ?? "dex";
  const attackRollResult = rollD20ForFighter(hero);
  const attackRoll = attackRollResult.roll;
  const attackBonusValue = abilityMod(hero, ability) + proficiencyBonus(hero) + magicEffects(hero).attackBonus;
  const totalAttack = attackRoll + attackBonusValue;
  const targetAc = armorClass(target);
  addLog(`${hero.name} throws ${item.name} at ${target.name}: d20 ${attackRollResult.rolls.length > 1 ? `${attackRollResult.rolls.join(" / ")} -> ${attackRoll}` : attackRoll} ${abilityLabel(attackBonusValue)} = ${totalAttack} vs AC ${targetAc}.`, "important");
  addAdminLog(`${hero.name} thrown consumable breakdown vs ${target.name}: ${d20RollDetail(attackRollResult)} + ${ability.toUpperCase()} throw ${abilityLabel(attackBonusValue)} = ${totalAttack}; target AC ${targetAc}.`);
  if (typeof recordD20OutcomeForFighter === "function") recordD20OutcomeForFighter(hero, attackRoll !== 1 && totalAttack >= targetAc);
  if (attackRoll === 1 || totalAttack < targetAc) {
    addLog(`${item.name} shatters wide of ${target.name}.`, "important");
  } else {
    const dice = item.use?.damage ?? { count: 1, sides: 4, type: "fire" };
    const roll = rollDice(dice.count ?? 1, dice.sides ?? 4);
    const damage = Math.max(1, roll.total + (dice.bonus ?? 0));
    applySpecialDamage(hero, target, damage, dice.type ?? "fire", item.name);
    if (target.alive && item.use?.burning) {
      const repeat = item.use.burning;
      applyStatusEffect(target, {
        id: `${item.id}-burning-${hero.id}`,
        label: "Burning",
        burningRepeat: {
          sourceId: hero.id,
          sourceName: hero.name,
          label: item.name,
          damage: repeat.damage ?? { count: 1, sides: 4, type: "fire" },
        },
        durationRounds: repeat.durationRounds ?? 3,
      });
      addLog(`${target.name} is burning from ${item.name}.`, "important");
    }
  }
  if (itemUseConsumesInventory(item)) consumeEquippedItem(itemId);
  return true;
}

async function useUsableInventoryItem(itemId, targetId = null, options = {}) {
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  const item = itemForId(hero, itemId);
  if (item?.use?.kind === "instrumentPerformance") {
    await playInventoryInstrument(itemId);
    return;
  }
  const target = targetId ? state.fighters[targetId] : hero;
  const requireEquipped = options.requireEquipped !== false;
  const itemAvailable = requireEquipped
    ? usableEquippedItems(hero).some((entry) => entry.item.id === itemId)
    : hero?.inventory?.items?.some((entry) => entry.id === itemId) && !(Object.values(hero.equipment ?? {}).includes(itemId));
  const usingOnDyingHero = Boolean(targetId);
  if (!item || !itemAvailable) return;
  if (!requireEquipped && (state.mode === "combat" || item.type !== "consumable")) return;
  if (usingOnDyingHero && !canUseHealingItemOnTarget(hero, item, target)) return;
  if (!usingOnDyingHero && !canUseBeltItem(hero, item)) return;
  if (typeof triggerItemCurses === "function") triggerItemCurses(hero, item, "use");

  const spellScrollUse = item.use?.kind === "spellScroll";
  if (state.mode === "combat" && !spellScrollUse) {
    if (usingOnDyingHero) {
      hero.hasAction = false;
    } else if (itemUseResource(item) === "bonusAction") {
      hero.hasBonusAction = false;
    } else {
      hero.hasAction = false;
    }
  }

  if (item.use?.kind === "healing") {
    if (!spendItemCharge(item)) return;
    const healingRoll = rollDice(item.use.dice.count, item.use.dice.sides);
    const healing = healingRoll.total + (item.use.bonus ?? 0);
    const healed = applyHealingToHero(target, healing);
    playSoundEffect("potionDrink");
    const targetText = target.id === hero.id ? "" : ` on ${target.name}`;
    addLog(`${hero.name} uses ${item.name}${targetText} and heals ${healed} HP (${healingRoll.rolls.join(" + ")} + ${item.use.bonus ?? 0}).`, "heal");
    if (item.use.secondaryEffect) {
      const status = itemStatusFromEffects(item, item.use.secondaryEffect, { ...item.use, duration: item.use.secondaryEffect.duration ?? item.use.duration ?? "encounter" });
      applyStatusEffect(target, status);
      addLog(`${target.name} gains ${status.label}'s secondary effect.`, "important");
    }
    if (itemUseConsumesInventory(item)) consumeEquippedItem(itemId);
    void maybeFinishEncounterAfterHeroRecovery();
  } else if (item.use?.kind === "fullHealing") {
    if (!spendItemCharge(item)) return;
    const healed = applyHealingToHero(target, Math.max(0, (target.maxHp ?? 0) - (target.hp ?? 0)));
    playSoundEffect("potionDrink");
    const targetText = target.id === hero.id ? "" : ` on ${target.name}`;
    addLog(`${hero.name} uses ${item.name}${targetText} and heals ${healed} HP to full.`, "heal");
    if (itemUseConsumesInventory(item)) consumeEquippedItem(itemId);
    void maybeFinishEncounterAfterHeroRecovery();
  } else if (item.use?.kind === "light" && item.use?.status) {
    if (!spendItemCharge(item)) return;
    const statusId = item.use.status.id;
    const wasLit = Boolean(statusId && hero.statusEffects?.some((effect) => effect.id === statusId));
    if (wasLit) {
      hero.statusEffects = (hero.statusEffects ?? []).filter((effect) => effect.id !== statusId);
      addLog(`${hero.name} extinguishes ${item.name}.`, "important");
    } else {
      const fuelItemId = item.use.fuelItemId;
      if (fuelItemId && !consumeInventoryItemByTemplateId(hero, fuelItemId)) {
        addLog(`${hero.name} needs ${item.use.fuelItemName ?? "fuel"} to light ${item.name}.`, "important");
        render();
        return;
      }
      applyStatusEffect(hero, lightItemStatus(item, hero));
      addLog(`${hero.name} lights ${item.name}${fuelItemId ? `, consuming 1 ${item.use.fuelItemName ?? "fuel"}` : ""}.`, "important");
    }
    if (!wasLit && itemUseConsumesInventory(item)) consumeEquippedItem(itemId);
  } else if (item.use?.status) {
    if (!spendItemCharge(item)) return;
    const status = { ...item.use.status };
    if (status.potionBreath?.type) {
      status.id = `${status.id}-${item.id}`;
      status.potionBreath = { ...status.potionBreath };
      hero.abilityUses = { ...(hero.abilityUses ?? {}) };
      delete hero.abilityUses[`potionBreath:${status.id}`];
    }
    applyStatusEffect(hero, status);
    addLog(`${hero.name} uses ${item.name} and gains ${item.use.status.label ?? item.name}.`, "important");
    if (itemUseConsumesInventory(item)) consumeEquippedItem(itemId);
  } else if (item.use?.kind === "buff") {
    if (!spendItemCharge(item)) return;
    const status = itemStatusFromEffects(item, item.use.effects ?? item.magic?.effects ?? {}, item.use);
    applyStatusEffect(hero, status);
    addLog(`${hero.name} uses ${item.name} and gains ${statusEffectDetails(status).join("; ") || "a magic boon"} (${statusDurationText(status)}).`, "important");
    if (itemUseConsumesInventory(item)) consumeEquippedItem(itemId);
  } else if (item.use?.kind === "weaponBuff") {
    if (!spendItemCharge(item)) return;
    const rider = itemWeaponRiderStatus(item);
    if (rider) {
      applyStatusEffect(hero, rider);
      addLog(`${hero.name} uses ${item.name}; the next weapon hit deals +${rider.rollText} ${rider.damageType} damage.`, "important");
    } else {
      addLog(`${hero.name} uses ${item.name}, but its weapon coating has no supported damage rider.`, "important");
    }
    if (itemUseConsumesInventory(item)) consumeEquippedItem(itemId);
  } else if (item.use?.kind === "poison") {
    if (!spendItemCharge(item)) return;
    const poison = item.use.poison;
    if (poison?.delivery === "injury") {
      const rider = itemPoisonRiderStatus(item);
      if (rider) {
        applyStatusEffect(hero, rider);
        addLog(`${hero.name} coats a weapon with ${poison.name ?? item.name}. The next piercing or slashing hit delivers it.`, "important");
      }
    } else {
      const poisonTarget = state.mode === "combat" ? selectedAttackTarget?.() ?? hero : hero;
      await applyPoisonExposure?.(hero, poisonTarget, poison, { label: item.name, directUse: true });
    }
    if (itemUseConsumesInventory(item)) consumeEquippedItem(itemId);
  } else if (item.use?.kind === "thrownConsumable") {
    useThrownConsumable(hero, item, itemId);
  } else if (item.use?.kind === "spellScroll") {
    const spell = typeof spellForScrollItem === "function" ? spellForScrollItem(item) : null;
    if (!spell || !canCastSpell(hero, spell)) {
      addLog(`${hero.name} cannot cast ${item.name ?? "that scroll"} right now.`, "important");
      render();
      return;
    }
    if (spell.target === "self") {
      await castSpellAtTarget(hero, spell, hero);
    } else if (spellTargetingMode(spell) === "target" && !spellTargetsFor(hero, spell).length) {
      addLog(`No valid target for ${spell.name}.`, "important");
      render();
      return;
    } else {
      startSpellTargeting(hero, spell);
    }
  } else if (item.use?.kind === "special" && (item.baseItemId ?? item.itemId ?? item.id) === "magic-undead-barrowcrown-gravebreakers-lantern") {
    if (!spendItemCharge(item)) return;
    const target = state.mode === "combat" ? selectedAttackTarget?.() : null;
    if (!target || !hasClearLineOfSightBetweenFighters(hero, target) || !fightersWithinSquares(hero, target, 6)) {
      addLog(`${hero.name} needs a visible target within 30 feet for Gravebreaker's Lantern.`, "important");
      render();
      return;
    }
    const status = {
      id: `gravebreakers-lantern-${hero.id}`,
      label: "Grave-Lit",
      invisibleSuppressed: true,
      healingReceivedMultiplier: monsterIsUndead(target) ? 0 : 1,
      expiresAtStartOfTurn: true,
    };
    applyStatusEffect(target, status);
    addLog(`${hero.name} casts Gravebreaker's Lantern onto ${target.name}. ${target.name} cannot benefit from invisibility${monsterIsUndead(target) ? " or regain HP" : ""} until ${hero.name}'s next turn.`, "important");
  } else {
    addLog(`${hero.name} uses ${item.name}. Its special effect is not implemented in the current item-use UI yet.`, "important");
  }

  refreshDerivedStats(hero);
  hideUseItemMenu();
  render();
  if (!els.inventoryMenu.classList.contains("hidden")) renderInventoryMenu();
}

function useBeltItem(itemId, targetId = null) {
  useUsableInventoryItem(itemId, targetId, { requireEquipped: true });
}

function useCarriedConsumable(itemId) {
  useUsableInventoryItem(itemId, null, { requireEquipped: false });
}

async function chooseAbilityTarget(hero, title, message) {
  const targets = partyHeroes().filter((target) => heroCanAct(target));
  if (targets.length <= 1) return hero;
  const targetId = await showChoiceDialog({
    title,
    message,
    actor: hero,
    choices: targets.map((target) => ({ value: target.id, label: `${target.name} (${target.className ?? "Hero"})` })),
  });
  return targetId ? state.fighters[targetId] : null;
}

async function chooseLayOnHandsTarget(paladin) {
  const targets = partyHeroes().filter(
    (target) =>
      !target.dead &&
      (target.id === paladin.id || hasMeleeAccess(paladin, target)) &&
      ((target.hp ?? 0) < (target.maxHp ?? 0) || (typeof fighterDiseases === "function" && fighterDiseases(target).length > 0)),
  );
  if (!targets.length) return null;
  if (targets.length === 1) return targets[0];
  const targetId = await showChoiceDialog({
    title: "Lay on Hands",
    message: "Choose yourself or an adjacent hero to heal or cleanse.",
    actor: paladin,
    choices: targets.map((target) => {
      const diseases = typeof fighterDiseases === "function" ? fighterDiseases(target) : [];
      const diseaseText = diseases.length ? `, ${diseases.length} disease${diseases.length === 1 ? "" : "s"}` : "";
      return { value: target.id, label: `${target.name} (${target.hp}/${target.maxHp} HP${diseaseText})` };
    }),
  });
  return targetId ? state.fighters[targetId] : null;
}

async function chooseLayOnHandsAmount(paladin, target, remainingPool) {
  const missingHp = Math.max(1, (target.maxHp ?? 0) - (target.hp ?? 0));
  const suggested = Math.min(remainingPool, missingHp);
  const raw = await showGameDialog({
    title: "Lay on Hands",
    message: `${paladin.name} has ${remainingPool} Lay on Hands HP left. ${target.name} is missing ${missingHp} HP.`,
    input: { label: "Healing to spend", value: String(suggested), maxLength: 3 },
    confirmText: "Heal",
    cancelText: "Cancel",
  });
  if (raw === null) return null;
  const amount = Math.floor(Number(raw));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return clamp(amount, 1, Math.min(remainingPool, missingHp));
}

async function chooseLayOnHandsUse(paladin, target, remainingPool) {
  const missingHp = Math.max(0, (target.maxHp ?? 0) - (target.hp ?? 0));
  const diseases = typeof fighterDiseases === "function" ? fighterDiseases(target) : [];
  if (missingHp > 0 && (!diseases.length || remainingPool < 5)) {
    const healing = await chooseLayOnHandsAmount(paladin, target, remainingPool);
    return healing ? { kind: "heal", amount: healing } : null;
  }
  if (missingHp <= 0 && diseases.length === 1 && remainingPool >= 5) return { kind: "cureDisease", amount: 5, diseaseId: diseases[0].diseaseId, label: diseases[0].label ?? diseases[0].diseaseId };
  const choices = [];
  if (missingHp > 0) choices.push({ value: "heal", label: `Heal HP`, description: `${target.name} is missing ${missingHp} HP.` });
  if (remainingPool >= 5) {
    for (const disease of diseases) choices.push({ value: `disease:${disease.diseaseId}`, label: `Cure ${disease.label ?? disease.diseaseId}`, description: "Costs 5 Lay on Hands HP." });
  }
  if (!choices.length) {
    addLog(`${paladin.name} needs 5 Lay on Hands HP to cure ${target.name}'s disease.`, "important");
    return null;
  }
  const choice = await showChoiceDialog({ title: "Lay on Hands", message: `${paladin.name} has ${remainingPool} Lay on Hands HP left.`, actor: paladin, choices });
  if (!choice) return null;
  if (choice === "heal") {
    const healing = await chooseLayOnHandsAmount(paladin, target, remainingPool);
    return healing ? { kind: "heal", amount: healing } : null;
  }
  const diseaseId = choice.replace(/^disease:/, "");
  const disease = diseases.find((entry) => entry.diseaseId === diseaseId);
  return { kind: "cureDisease", amount: 5, diseaseId, label: disease?.label ?? diseaseId };
}

function refundFighterAbilityUse(hero, ability) {
  if (!hero || !ability) return;
  hero.abilityUses[ability.id] = Math.max(0, (hero.abilityUses?.[ability.id] ?? 1) - 1);
  if (state.mode === "combat") {
    if (ability.resource === "bonusAction") hero.hasBonusAction = true;
    if (ability.resource === "action") hero.hasAction = true;
    if (ability.resource === "reaction") hero.hasReaction = true;
  }
}

async function chooseWildShapeBeast(hero) {
  const beasts = wildShapeUnlockedBeasts(hero);
  if (!beasts.length) return null;
  const beastId = await showChoiceDialog({
    title: "Wild Shape",
    message: "Choose a beast form. Your INT, WIS, and CHA stay your own; equipment and spellcasting are suppressed while transformed.",
    actor: hero,
    choices: beasts.map((beast) => {
      const action = wildShapePrimaryAction(beast);
      const movement = Object.entries(beast.speed ?? {})
        .map(([kind, feet]) => `${kind} ${feet} ft`)
        .join(", ");
      const multi = wildShapeHasMultiattack(beast) ? " Multiattack." : "";
      return {
        value: beast.id,
        label: beast.name,
        description: `CR ${beast.cr}. AC ${beast.ac}, HP ${beast.hp}, ${movement}. ${action?.name ?? "Attack"} ${action?.damage ?? ""} ${action?.damageType ?? ""}.${multi}`,
      };
    }),
  });
  return beastId ? wildShapeBeastById(beastId) : null;
}

function subclassEffectDiceTotal(effect = {}, hero = null) {
  const dice = scaledSubclassDice(hero, effect.dice ?? {});
  if (!dice.count || !dice.sides) return Math.max(0, scaledSubclassAmount(hero, effect.amount));
  return rollDice(dice.count, dice.sides).total + (dice.bonus ?? 0);
}

function subclassEffectStatus(hero, effectStatus = {}) {
  return { durationRounds: 1, ...scaledSubclassStatus(hero, effectStatus) };
}

function subclassEffectMonsterTarget() {
  const selectedTarget = attackTarget();
  return selectedTarget && !objectIsDestructible(selectedTarget) ? selectedTarget : visibleMonsters()[0] ?? null;
}

function applyWeaponRiderNamedStatus(actor, target, status) {
  if (status === "prone") applyStatusEffect(target, { id: "prone", label: "Prone", attackBonus: -2, speedBonusFeet: -10, expiresAtEndOfTurn: true });
  if (status === "restrained") applyStatusEffect(target, { id: "restrained", label: "Restrained", speedLocked: true, attackBonus: -2, durationRounds: 1 });
  if (status === "hamstrung") applyStatusEffect(target, { id: "hamstrung", label: "Hamstrung", speedBonusFeet: -10, expiresAtEndOfTurn: true });
  if (status === "shaken") applyStatusEffect(target, { id: "shaken", label: "Shaken", attackBonus: -2, expiresAtEndOfTurn: true });
  if (status === "marked") applyStatusEffect(target, { id: `marked-by-${actor.id}`, label: "Marked", attackBonus: -1, expiresAtEndOfTurn: true });
  if (status === "distracted") applyStatusEffect(target, { id: "distracted", label: "Distracted", acBonus: -2, expiresAtEndOfTurn: true });
  if (status === "frightened") applyStatusEffect(target, { id: "frightened", label: "Frightened", attackBonus: -2, expiresAtEndOfTurn: true });
  if (status === "enfeebled") applyStatusEffect(target, { id: "enfeebled", label: "Enfeebled", damageBonus: -2, expiresAtEndOfTurn: true });
  if (status === "banished") applyStatusEffect(target, { id: "banished", label: "Banished", speedLocked: true, actionLocked: true, expiresAtEndOfTurn: true });
  if (status === "stunned") applyStatusEffect(target, { id: "stunned", label: "Stunned", speedLocked: true, actionLocked: true, durationRounds: 1 });
}

function applySubclassRider(hero, effect, label) {
  const damage = Math.max(1, subclassEffectDiceTotal(effect, hero));
  applyStatusEffect(hero, {
    id: `subclass-rider-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    label,
    weaponRider: true,
    damageBonus: damage,
    damageType: effect.damageType ?? "damage",
    riderStatus: effect.riderStatus ?? null,
    expiresAtEndOfTurn: true,
  });
  addLog(`${hero.name} prepares ${label}; the next hit deals ${damage} extra ${effect.damageType ?? "damage"} damage.`, "important");
}

function nearestOpenSummonPosition(owner) {
  const occupied = new Set(
    Object.values(state.fighters ?? {})
      .filter((fighter) => fighter.alive)
      .flatMap((fighter) => window.DungeonGrid.fighterCells(fighter).map(positionKey)),
  );
  for (const next of window.DungeonGrid.neighbors(owner.position, currentGridSize())) {
    if (!dungeonFloorKeys().has(positionKey(next)) || occupied.has(positionKey(next))) continue;
    if (canTraverseMovementEdge(owner, owner.position, next, [])) return next;
  }
  return null;
}

function summonMonsterIdForProfile(profile = "melee") {
  if (profile === "pactFamiliar") return "summonPactFamiliarImp";
  if (profile === "rangedKiter") return "skeletonArcher";
  return "forestWolf";
}

function summonChoiceLabel(monsterId) {
  return cleanSummonChoiceLabel(window.DungeonContent.get("monsters", monsterId)?.name ?? monsterId);
}

function cleanSummonChoiceLabel(name) {
  return String(name ?? "")
    .replace(/^(Familiar|Pact Familiar|Summoned|Ranger)\s+/i, "")
    .trim();
}

function summonMemoryFor(hero, key) {
  return key ? hero?.summonedCompanionMemory?.[key] ?? null : null;
}

function rememberSummonedCompanion(hero, key, options) {
  if (!hero || !key || !options?.monsterId) return;
  hero.summonedCompanionMemory = { ...(hero.summonedCompanionMemory ?? {}) };
  hero.summonedCompanionMemory[key] = {
    monsterId: options.monsterId,
    name: options.name,
    tokenArt: options.tokenArt ?? "",
  };
}

function removePreviousSummonedCompanion(hero, key) {
  if (!hero?.id || !key) return;
  const removeIds = Object.values(state.fighters ?? {})
    .filter((fighter) => fighter.summonedByHeroId === hero.id && fighter.summonMemoryKey === key)
    .map((fighter) => fighter.id);
  for (const id of removeIds) delete state.fighters[id];
  if (!removeIds.length) return;
  state.party.heroIds = (state.party.heroIds ?? []).filter((id) => !removeIds.includes(id));
  state.party.rosterIds = (state.party.rosterIds ?? []).filter((id) => !removeIds.includes(id));
  state.initiative = (state.initiative ?? []).filter((entry) => !removeIds.includes(entry.fighterId));
}

function scaleSummonedAlly(ally, owner, durationRounds) {
  const level = owner.level ?? 1;
  const prof = proficiencyBonus(owner);
  ally.level = level;
  ally.maxHp = Math.max(1, (ally.maxHp ?? 1) + level * 2);
  ally.baseMaxHp = ally.maxHp;
  ally.hp = ally.maxHp;
  ally.attackBonus = (ally.attackBonus ?? 3) + Math.max(0, prof - 2);
  ally.damage = { ...(ally.damage ?? { count: 1, sides: 6, bonus: 0, type: "damage" }), bonus: (ally.damage?.bonus ?? 0) + Math.max(1, Math.floor(level / 4)) };
  ally.baseDamage = { ...ally.damage };
  ally.summonedByHeroId = owner.id;
  ally.summonDurationRounds = durationRounds;
  ally.summonExpiresAtDungeonTimeSeconds = dungeonElapsedSeconds({ sync: false }) + durationSecondsFromDefinition({ durationRounds });
  if (ally.renameable === undefined) ally.renameable = false;
  return ally;
}

function addSummonedAllyToCombat(owner, ally) {
  state.fighters[ally.id] = ally;
  state.party.heroIds = uniqueValues([...(state.party.heroIds ?? []), ally.id]);
  state.party.rosterIds = uniqueValues([...(state.party.rosterIds ?? []), ally.id]);
  if (state.mode === "combat") {
    const activeIndex = Math.max(0, state.activeIndex ?? 0);
    state.initiative.splice(activeIndex + 1, 0, { fighterId: ally.id, initiative: state.initiative[activeIndex]?.initiative ?? 10 });
  }
}

async function handleGenericSubclassEffect(hero, ability) {
  const effect = ability.subclassEffect;
  if (!effect) return false;

  if (effect.kind === "selfStatus") {
    applyStatusEffect(hero, subclassEffectStatus(hero, effect.status));
    addLog(`${hero.name} uses ${ability.name}.`, "important");
    return true;
  }

  if (effect.kind === "allyStatus") {
    const target = await chooseAbilityTarget(hero, ability.name, effect.target === "selfOrAlly" ? "Choose yourself or an ally." : "Choose an ally.");
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      renderAbilitiesMenu();
      return true;
    }
    applyStatusEffect(target, subclassEffectStatus(hero, effect.status));
    addLog(`${hero.name} uses ${ability.name} on ${target.name}.`, "important");
    return true;
  }

  if (effect.kind === "partyStatus") {
    for (const ally of partyHeroes().filter((target) => heroCanAct(target))) applyStatusEffect(ally, subclassEffectStatus(hero, effect.status));
    addLog(`${hero.name} uses ${ability.name}; the party feels the effect.`, "important");
    return true;
  }

  if (effect.kind === "targetStatus") {
    const target = subclassEffectMonsterTarget();
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} has no target for ${ability.name}.`, "important");
      return true;
    }
    applyStatusEffect(target, subclassEffectStatus(hero, effect.status));
    addLog(`${hero.name} uses ${ability.name} on ${target.name}.`, "important");
    return true;
  }

  if (effect.kind === "rider") {
    applySubclassRider(hero, effect, ability.name);
    return true;
  }

  if (effect.kind === "damageTarget") {
    const target = subclassEffectMonsterTarget();
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} has no target for ${ability.name}.`, "important");
      return true;
    }
    const damage = Math.max(1, subclassEffectDiceTotal(effect, hero));
    applySpecialDamage(hero, target, damage, effect.damageType ?? "damage", ability.name);
    if (effect.riderStatus) applyWeaponRiderNamedStatus(hero, target, effect.riderStatus);
    if (!target.alive) {
      playSoundEffect("enemyDefeated");
      awardMonsterXp(target);
      dropLootForMonster(target);
      void finishEncounterAfterLastMonsterFalls();
    }
    return true;
  }

  if (effect.kind === "aoeDamage") {
    const targets = visibleMonsters().filter((monster) => attackGridDistanceBetweenFighters(hero, monster) <= (effect.radius ?? 3));
    if (!targets.length) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} has no enemies in range for ${ability.name}.`, "important");
      return true;
    }
    for (const target of targets) {
      const damage = Math.max(1, subclassEffectDiceTotal(effect, hero));
      applySpecialDamage(hero, target, damage, effect.damageType ?? "damage", ability.name);
      if (effect.riderStatus) applyWeaponRiderNamedStatus(hero, target, effect.riderStatus);
      if (!target.alive) {
        playSoundEffect("enemyDefeated");
        awardMonsterXp(target);
        dropLootForMonster(target);
      }
    }
    void finishEncounterAfterLastMonsterFalls();
    return true;
  }

  if (effect.kind === "partyHeal" || effect.kind === "partyHealStatus") {
    const wounded = partyHeroes().filter((ally) => !ally.dead && (ally.hp ?? 0) < (ally.maxHp ?? 0));
    const amount = Math.max(1, scaledSubclassAmount(hero, effect.amount));
    for (const ally of wounded) {
      const healed = applyHealingToHero(ally, amount);
      if (healed > 0) addLog(`${hero.name}'s ${ability.name} heals ${ally.name} for ${healed} HP.`, "heal");
      if (effect.status) applyStatusEffect(ally, subclassEffectStatus(hero, effect.status));
    }
    await maybeFinishEncounterAfterHeroRecovery();
    return true;
  }

  if (effect.kind === "selfHeal") {
    const healed = applyHealingToHero(hero, Math.max(1, scaledSubclassAmount(hero, effect.amount)));
    addLog(`${hero.name} uses ${ability.name} and heals ${healed} HP.`, "heal");
    await maybeFinishEncounterAfterHeroRecovery();
    return true;
  }

  if (effect.kind === "restoreSpellPoints") {
    ensureSpellPointState(hero);
    const before = hero.spellPoints ?? 0;
    hero.spellPoints = Math.min(spellPointMaximum(hero), before + Math.max(1, scaledSubclassAmount(hero, effect.amount)));
    addLog(`${hero.name} uses ${ability.name} and recovers ${hero.spellPoints - before} spell points.`, "important");
    return true;
  }

  if (effect.kind === "bonusAttack") {
    const target = subclassEffectMonsterTarget();
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} has no target for ${ability.name}.`, "important");
      return true;
    }
    hero.hasBonusAction = true;
    await makeAttack(hero, target, { resource: "bonusAction", actionLabel: `uses ${ability.name}` });
    return true;
  }

  if (effect.kind === "summonAlly") {
    const position = nearestOpenSummonPosition(hero);
    const target = subclassEffectMonsterTarget();
    if (!position) {
      if (target) {
        const damage = Math.max(1, rollDice(2, 6).total + proficiencyBonus(hero));
        applySpecialDamage(hero, target, damage, "force", `${ability.name} fallback strike`);
      } else {
        applyStatusEffect(hero, { id: `summon-fallback-${ability.id}`, label: ability.name, tempHp: 8 + proficiencyBonus(hero), durationRounds: 3 });
      }
      addLog(`${hero.name} cannot place an ally, so ${ability.name} becomes an immediate combat boost.`, "important");
      return true;
    }
    const memoryKey = effect.memoryKey ?? ability.id;
    const saved = summonMemoryFor(hero, memoryKey);
    let monsterId = summonMonsterIdForProfile(effect.profile);
    let identity = null;
    let resummoningSaved = false;
    if (saved?.monsterId) {
      const mode = await showChoiceDialog({
        actor: hero,
        title: ability.name,
        message: `${hero.name} remembers ${saved.name ?? summonChoiceLabel(saved.monsterId)}. Resummon that familiar or choose a new form?`,
        choices: [
          { value: "resummon", label: `Resummon ${saved.name ?? summonChoiceLabel(saved.monsterId)}` },
          { value: "new", label: "Choose New Form" },
        ],
      });
      if (!mode) {
        refundFighterAbilityUse(hero, ability);
        addLog(`${ability.name} was not completed.`, "important");
        return true;
      }
      if (mode === "resummon") {
        monsterId = saved.monsterId;
        identity = { name: saved.name, tokenArt: saved.tokenArt ?? "" };
        resummoningSaved = true;
      }
    }
    if (effect.chooseFrom?.length) {
      while (!identity) {
        const picked = await showChoiceDialog({
          actor: hero,
          title: ability.name,
          message: "Choose the familiar form to summon.",
          choices: effect.chooseFrom.map((id) => ({ value: id, label: summonChoiceLabel(id) })),
        });
        if (!picked) {
          refundFighterAbilityUse(hero, ability);
          addLog(`${ability.name} was not completed.`, "important");
          return true;
        }
        monsterId = picked;
        const template = window.DungeonContent.get("monsters", monsterId);
        if (!effect.allowIdentity || typeof showHeroIdentityDialog !== "function") {
          const formName = summonChoiceLabel(monsterId);
          identity = { name: formName || template?.name || effect.name || ability.name, tokenArt: template?.tokenArt ?? "" };
          break;
        }
        if (effect.allowIdentity && !resummoningSaved && typeof showHeroIdentityDialog === "function") {
          const formName = summonChoiceLabel(monsterId);
          const pickedIdentity = await showHeroIdentityDialog({
            title: ability.name,
            message: `Name your ${formName || "familiar"} and choose its token picture.`,
            nameValue: formName || template?.name || effect.name || ability.name,
            tokenArt: template?.tokenArt ?? "",
            confirmText: "Summon",
            backText: "Back",
            cancelText: "Cancel",
          });
          if (pickedIdentity === dialogBackValue) continue;
          if (!pickedIdentity) {
            refundFighterAbilityUse(hero, ability);
            addLog(`${ability.name} was not completed.`, "important");
            return true;
          }
          identity = pickedIdentity;
        }
      }
    }
    const template = window.DungeonContent.get("monsters", monsterId);
    identity = identity ?? { name: effect.name ?? ability.name, tokenArt: template?.tokenArt ?? "" };
    if (effect.allowIdentity && !resummoningSaved && typeof showHeroIdentityDialog === "function" && !effect.chooseFrom?.length) {
      const formName = summonChoiceLabel(monsterId);
      const pickedIdentity = await showHeroIdentityDialog({
        title: ability.name,
        message: `Name your ${formName || "familiar"} and choose its token picture.`,
        nameValue: formName || template?.name || effect.name || ability.name,
        tokenArt: template?.tokenArt ?? "",
        confirmText: "Summon",
        cancelText: "Cancel",
      });
      if (!pickedIdentity) {
        refundFighterAbilityUse(hero, ability);
        addLog(`${ability.name} was not completed.`, "important");
        return true;
      }
      identity = pickedIdentity;
    }
    rememberSummonedCompanion(hero, memoryKey, { monsterId, name: identity.name || template?.name || ability.name, tokenArt: identity.tokenArt ?? template?.tokenArt ?? "" });
    removePreviousSummonedCompanion(hero, memoryKey);
    const ally = createFriendlyBeastFromMonster(monsterId, {
      id: `${ability.id}-${hero.id}-${Date.now()}`,
      name: identity.name || effect.name || ability.name,
      position,
      tokenArt: identity.tokenArt,
      kind: effect.partyMemberKind ?? (effect.control === "player" ? "companion" : "ally"),
      control: effect.control === "player" ? "player" : "ai",
      followHeroId: hero.id,
      followDistanceSquares: 2,
      className: effect.className,
    });
    if (!ally) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${ability.name} cannot find a suitable ally template yet.`, "important");
      return true;
    }
    ally.behavior = effect.profile === "rangedKiter" || template?.behavior === "rangedKiter" ? "rangedKiter" : template?.behavior ?? "melee";
    ally.summonMemoryKey = memoryKey;
    scaleSummonedAlly(ally, hero, effect.durationRounds ?? 4);
    addSummonedAllyToCombat(hero, ally);
    addLog(`${hero.name} summons ${ally.name}, who fights beside the party.`, "important");
    return true;
  }

  if (effect.kind === "dominateTarget") {
    const target = subclassEffectMonsterTarget();
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} has no target for ${ability.name}.`, "important");
      return true;
    }
    if ((target.category ?? 0) >= 4 || target.boss || target.elite) {
      applyStatusEffect(target, { id: "domination-resisted", label: "Beguiled", attackBonus: -3, durationRounds: 1 });
      addLog(`${target.name} resists full control, but ${ability.name} leaves them beguiled.`, "important");
    } else {
      applyStatusEffect(target, { id: "dominated", label: "Dominated", dominatedByHeroId: hero.id, durationRounds: effect.durationRounds ?? 1 });
      target.team = "heroes";
      target.friendly = true;
      addLog(`${hero.name}'s ${ability.name} turns ${target.name} against the monsters for a short time.`, "important");
    }
    return true;
  }

  if (effect.kind === "revealTraps") {
    for (const object of state.dungeonObjects ?? []) {
      if (objectIsTrap(object)) object.detected = true;
      if (object.trap) object.trap.detected = true;
    }
    if (effect.status) applyStatusEffect(hero, subclassEffectStatus(hero, effect.status));
    addLog(`${hero.name}'s ${ability.name} reveals dangerous mechanisms in known rooms.`, "important");
    return true;
  }

  if (effect.kind === "wildSurge") {
    applyBarbarianWildSurge(hero);
    return true;
  }

  if (effect.kind === "interruptSpell") {
    applyStatusEffect(hero, { id: "spell-interrupt-ready", label: ability.name, spellInterrupt: true, restoreSpellPoints: effect.restoreSpellPoints ?? 0, durationRounds: 3 });
    addLog(`${hero.name} watches for enemy magic. ${ability.name} will trigger as a reaction prompt when possible.`, "important");
    return true;
  }

  return false;
}

async function chooseBeastBarbarianForm(hero) {
  const form = await showChoiceDialog({
    title: "Form of the Beast",
    message: "Choose the natural weapon your Rage creates. It lasts until this Rage ends and does not cost another bonus action.",
    actor: hero,
    choices: [
      { value: "bite", label: "Bite", description: "Your hits tear with fangs. Once each turn, a hit adds piercing damage and can heal you while badly hurt." },
      { value: "claws", label: "Claws", description: "Your empty hands become claws. Attack with a claw to make one additional claw attack as part of the same Attack action." },
      { value: "tail", label: "Tail", description: "A lashing tail guards your body, raising your AC while you rage." },
    ],
  });
  return form || "claws";
}

function fighterSubclassDieSides(hero, kind) {
  const level = hero?.level ?? 1;
  if (kind === "superiority") return level >= 18 ? 12 : level >= 10 ? 10 : 8;
  if (kind === "psionic") return level >= 17 ? 12 : level >= 11 ? 10 : level >= 5 ? 8 : 6;
  if (kind === "giantsMight") return level >= 18 ? 10 : level >= 10 ? 8 : 6;
  return 6;
}

function currentAttackTargetForAbility() {
  const target = attackTarget();
  return target && !objectIsDestructible(target) ? target : visibleMonsters()[0] ?? null;
}

function attackWeaponChoicesForTarget(fighter, target) {
  if (!fighter || !target) return [];
  return attackWeaponChoicesForFighter(fighter).filter((choice) => {
    const profile = damageProfile(fighter, { weapon: choice.options?.weapon });
    return objectIsDestructible(target)
      ? isObjectInAttackRangeWithProfile(fighter, target, profile)
      : isInAttackRangeWithProfile(fighter, target, profile);
  });
}

function hideAttackWeaponPrompt() {
  document.querySelector(".attack-weapon-prompt")?.remove();
}

function attackWouldThrowWeapon(fighter, target, options = {}) {
  const weapon = options.weapon ?? (options.weaponSlot ? weaponFromSlot(fighter, options.weaponSlot) : activeWeapon(fighter));
  if (!weapon?.properties?.includes("thrown")) return false;
  if (objectIsDestructible(target)) {
    const adjacent = objectCells(target).some((cell) => attackGridDistanceFromFighterToPosition(fighter, cell) <= 1);
    return !adjacent;
  }
  return !hasMeleeAccess(fighter, target);
}

function confirmThrowWeapon(fighter, target, options = {}) {
  const weapon = options.weapon ?? (options.weaponSlot ? weaponFromSlot(fighter, options.weaponSlot) : activeWeapon(fighter));
  const targetName = objectIsDestructible(target) ? objectTargetName(target) : target?.name ?? "the target";
  return showGameDialog({
    title: "Throw weapon?",
    message: `Throw ${weapon?.name ?? "this weapon"} at ${targetName}? It will land near the target after the attack.`,
    confirmText: "Throw",
    cancelText: "Cancel",
  });
}

function chooseAttackWeaponForTarget(fighter, target) {
  const choices = attackWeaponChoicesForTarget(fighter, target);
  if (choices.length <= 1) return Promise.resolve(choices[0]?.options ?? {});
  hideAttackWeaponPrompt();
  return new Promise((resolve) => {
    const prompt = document.createElement("div");
    prompt.className = "attack-weapon-prompt";
    prompt.innerHTML = `
      <div class="attack-weapon-title">Attack with</div>
      ${choices
        .map(
          (choice, index) => `
            <button type="button" data-attack-weapon="${index}">
              <b>${escapeHtml(choice.label)}</b>
              <span>${escapeHtml(choice.description)}</span>
            </button>
          `,
        )
        .join("")}
    `;
    const cleanup = (value) => {
      document.removeEventListener("pointerdown", handleOutside, true);
      prompt.remove();
      resolve(value);
    };
    const handleOutside = (event) => {
      if (prompt.contains(event.target) || event.target.closest("#attack")) return;
      cleanup(null);
    };
    prompt.addEventListener("click", (event) => {
      const button = event.target.closest("[data-attack-weapon]");
      if (!button) return;
      const choice = choices[Number(button.dataset.attackWeapon)];
      cleanup(choice?.options ?? null);
    });
    els.attack?.parentElement?.append(prompt);
    window.setTimeout(() => document.addEventListener("pointerdown", handleOutside, true), 0);
  });
}

async function performAttackWithPrompt() {
  const fighter = activeFighter();
  const target = attackTarget();
  if (!fighter || !target) return;
  const options = await chooseAttackWeaponForTarget(fighter, target);
  if (!options) return;
  if (attackWouldThrowWeapon(fighter, target, options)) {
    const confirmed = await confirmThrowWeapon(fighter, target, options);
    if (!confirmed) return;
  }
  if (objectIsDestructible(target)) await attackDestructibleObject(fighter, target, options);
  else await makeAttack(fighter, target, options);
}

async function useFighterAbility(abilityId) {
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  const ability = availableFighterAbilities(hero).find((entry) => entry.id === abilityId);
  if (!canUseFighterAbility(hero, ability)) return;

  if (ability.id === "wildShape" && isWildShaped(hero)) {
    if (state.mode === "combat") hero.hasBonusAction = false;
    revertWildShape(hero);
    hideAbilitiesMenu();
    render();
    return;
  }

  hero.abilityUses[ability.id] = (hero.abilityUses[ability.id] ?? 0) + 1;
  if (state.mode === "combat" && ability.resource === "bonusAction") {
    hero.hasBonusAction = false;
  } else if (state.mode === "combat" && ability.resource === "action" && ability.id !== "eldritchBlast") {
    hero.hasAction = false;
  } else if (state.mode === "combat" && ability.resource === "reaction") {
    hero.hasReaction = false;
  }

  if (await handleGenericSubclassEffect(hero, ability)) {
    refreshDerivedStats(hero);
    hideAbilitiesMenu();
    render();
    return;
  }

  if (ability.potionBreathAction) {
    hero.abilityUses[ability.id] = Math.max(0, (hero.abilityUses?.[ability.id] ?? 1) - 1);
    if (state.mode === "combat") hero.hasAction = true;
    const spell = getContentDefinition("spells", ability.potionBreathAction.spellId);
    if (!spell) {
      addLog(`${hero.name}'s breath is not ready yet.`, "important");
      renderAbilitiesMenu();
      return;
    }
    startSpellTargeting(hero, spell);
    return;
  }

  if (ability.id === "secondWind") {
    const healingRoll = rollDice(1, 10);
    const healing = healingRoll.total + (hero.level ?? 1);
    const before = hero.hp;
    hero.hp = Math.min(hero.maxHp, hero.hp + healing);
    if (hero.hp > 0) {
      hero.alive = true;
      clearStableAtZero(hero);
      resetDeathSaveCounters(hero);
    }
    addLog(`${hero.name} uses Second Wind and heals ${hero.hp - before} HP (${healingRoll.rolls[0]} + ${hero.level ?? 1}).`, "heal");
    if (hero.subclassId === "banneret" && (hero.level ?? 1) >= 3) {
      const allies = partyHeroes().filter((target) => target.id !== hero.id && !target.dead && (target.hp ?? 0) < (target.maxHp ?? 0)).slice(0, 3);
      for (const ally of allies) {
        const healed = applyHealingToHero(ally, hero.level ?? 1);
        if (healed > 0) addLog(`${hero.name}'s Rallying Cry heals ${ally.name} for ${healed} HP.`, "heal");
      }
    }
  }

  if (ability.id === "actionSurge") {
    hero.hasAction = true;
    addLog(`${hero.name} uses Action Surge and regains an action.`, "important");
    if (hero.subclassId === "banneret" && (hero.level ?? 1) >= 10) {
      const allies = partyHeroes().filter((target) => target.id !== hero.id && heroCanAct(target)).slice(0, (hero.level ?? 1) >= 18 ? 2 : 1);
      for (const ally of allies) {
        const roll = rollDice(1, 8);
        applyStatusEffect(ally, { id: `inspiring-surge-${hero.id}`, label: "Inspiring Surge", weaponRider: true, damageBonus: roll.total, damageType: ally.damage?.type ?? "damage", durationRounds: 1 });
        addLog(`${hero.name}'s Inspiring Surge readies ${ally.name}'s next hit for ${roll.total} extra damage.`, "important");
      }
    }
    if (hero.subclassId === "eldritch-knight" && (hero.level ?? 1) >= 14) {
      applyStatusEffect(hero, { id: "arcane-charge", label: "Arcane Charge", speedBonusFeet: 30, expiresAtEndOfTurn: true });
      addLog(`${hero.name}'s Arcane Charge grants a burst of teleport-like movement.`, "important");
    }
  }

  if (ability.id === "rage") {
    const rageBonus = rageDamageBonus(hero);
    applyStatusEffect(hero, { id: "rage", label: "Rage", damageBonus: rageBonus, durationRounds: 10 });
    addLog(`${hero.name} enters a Rage.`, "important");
    if (hero.subclassId === "beast" && (hero.level ?? 1) >= 3) {
      const form = await chooseBeastBarbarianForm(hero);
      const labels = { bite: "Bestial Bite", claws: "Bestial Claws", tail: "Bestial Tail" };
      const effect = {
        id: `beast-form-${form}`,
        label: labels[form] ?? "Beast Form",
        durationRounds: 10,
      };
      applyStatusEffect(hero, effect);
      hero.beastFormHitThisTurn = false;
      addLog(`${hero.name}'s Rage manifests ${labels[form] ?? "a beast form"}.`, "important");
    }
    if (hero.subclassId === "ancestral-guardian" && (hero.level ?? 1) >= 3) {
      applyStatusEffect(hero, { id: "ancestral-protectors-ready", label: "Ancestral Protectors", weaponRider: true, damageBonus: 0, riderStatus: "marked", durationRounds: 10 });
      addLog(`${hero.name}'s ancestors gather around the battlefield.`, "important");
    }
    if (hero.subclassId === "giant" && (hero.level ?? 1) >= 3) {
      applyStatusEffect(hero, { id: "giants-havoc", label: "Giant's Havoc", damageBonus: (hero.level ?? 1) >= 14 ? 3 : 2, speedBonusFeet: 5, durationRounds: 10 });
      addLog(`${hero.name}'s rage swells with giant power.`, "important");
    }
    if (hero.subclassId === "zealot" && (hero.level ?? 1) >= 3) {
      applyStatusEffect(hero, { id: "divine-fury", label: "Divine Fury", durationRounds: 10 });
      addLog(`${hero.name}'s Divine Fury will add radiant damage to the first melee hit each turn while raging.`, "important");
    }
    if (hero.subclassId === "wild-magic" && (hero.level ?? 1) >= 3) {
      applyBarbarianWildSurge(hero);
    }
  }

  if (ability.id === "recklessAttack") {
    applyStatusEffect(hero, { id: "reckless-attack", label: "Reckless Attack", attackAdvantage: true, expiresAtEndOfTurn: true });
    applyStatusEffect(hero, { id: "reckless-exposure", label: "Reckless Exposure", incomingAttackAdvantage: true, expiresAtStartOfTurn: true });
    addLog(`${hero.name} attacks recklessly. Their attacks have advantage this turn, and attacks against them have advantage until their next turn.`, "important");
    if (hero.subclassId === "battlerager" && (hero.level ?? 1) >= 6) {
      const tempHp = Math.max(1, abilityMod(hero, "con"));
      applyStatusEffect(hero, { id: "reckless-abandon", label: "Reckless Abandon", tempHp, expiresAtStartOfTurn: true });
      addLog(`${hero.name}'s Reckless Abandon grants ${tempHp} temporary HP.`, "important");
    }
  }

  if (ability.id === "patientDefense") {
    hero.dodging = true;
    addLog(`${hero.name} takes a defensive stance.`, "important");
  }

  if (ability.id === "stunningStrike") {
    applyStatusEffect(hero, { id: "stunning-strike", label: "Stunning Strike", weaponRider: true, damageBonus: 0, damageType: hero.damage?.type ?? "damage", riderStatus: "stunned", expiresAtEndOfTurn: true });
    addLog(`${hero.name} focuses ki into their next hit.`, "important");
  }

  if (ability.id === "cunningActionDash") {
    hero.movementLeft = (hero.movementLeft ?? 0) + Math.floor(hero.speedFeet / feetPerSquare);
    addLog(`${hero.name} uses Cunning Action to Dash.`, "important");
  }

  if (ability.id === "cunningActionDisengage") {
    hero.disengaged = true;
    addLog(`${hero.name} uses Cunning Action to Disengage.`, "important");
  }

  if (ability.id === "cunningActionHide") {
    applyStatusEffect(hero, { id: "hidden", label: "Hidden", attackAdvantage: true, expiresAtEndOfTurn: true });
    addLog(`${hero.name} uses Cunning Action to Hide. Their next attack has advantage.`, "important");
  }

  if (ability.id === "sidekickHelpful") {
    const target = await chooseAbilityTarget(hero, "Helpful", "Choose an ally to help.");
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      return;
    }
    const rangeSquares = (hero.level ?? 1) >= 6 ? 6 : 1;
    if (target.id !== hero.id && attackGridDistanceBetweenFighters(hero, target) > rangeSquares) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${target.name} is too far away for ${hero.name}'s help.`, "important");
      render();
      return;
    }
    applyStatusEffect(target, {
      id: `helped-by-${hero.id}`,
      label: (hero.level ?? 1) >= 11 ? `Inspired Help ${hero.level >= 20 ? "2d6" : "1d6"}` : "Helped",
      attackAdvantage: true,
      expiresAtEndOfTurn: true,
    });
    if ((hero.level ?? 1) >= 6) {
      const roll = rollDice(2, 6);
      applyStatusEffect(hero, { id: "coordinated-strike", label: "Coordinated Strike", weaponRider: true, damageBonus: roll.total, damageType: hero.damage?.type ?? "damage", expiresAtEndOfTurn: true });
    }
    addLog(`${hero.name} helps ${target.name}.`, "important");
  }

  if (ability.id === "steadyAim") {
    hero.movementLeft = 0;
    applyStatusEffect(hero, { id: "steady-aim", label: "Steady Aim", attackAdvantage: true, expiresAtEndOfTurn: true });
    addLog(`${hero.name} takes Steady Aim. Their next attack has advantage.`, "important");
  }

  if (ability.resourcePool === "arcaneShot") {
    const shot = ability.shot ?? "";
    const diceCount = ["piercing", "seeking"].includes(shot) ? ((hero.level ?? 1) >= 18 ? 2 : 1) : ((hero.level ?? 1) >= 18 ? 4 : 2);
    const damageTypeByShot = {
      banishing: "force",
      beguiling: "psychic",
      bursting: "force",
      enfeebling: "necrotic",
      grasping: "poison",
      piercing: "piercing",
      seeking: "force",
      shadow: "psychic",
    };
    const statusByShot = {
      banishing: "banished",
      beguiling: "charmed",
      enfeebling: "enfeebled",
      grasping: "hamstrung",
      piercing: null,
      seeking: null,
      shadow: "shaken",
    };
    const roll = rollDice(diceCount, 6);
    const attackBonus = shot === "seeking" ? 5 : 0;
    applyStatusEffect(hero, {
      id: ability.id,
      label: ability.name,
      weaponRider: true,
      damageBonus: roll.total,
      damageType: damageTypeByShot[shot] ?? "force",
      riderStatus: statusByShot[shot],
      attackBonus,
      expiresAtEndOfTurn: true,
    });
    addLog(`${hero.name} prepares ${ability.name} (${roll.rolls.join(" + ")} ${damageTypeByShot[shot] ?? "force"}).`, "important");
  }

  if (ability.id === "maneuverRally") {
    const target = await chooseAbilityTarget(hero, "Rally", "Choose an ally to rally.");
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      renderAbilitiesMenu();
      return;
    }
    const roll = rollDice(1, fighterSubclassDieSides(hero, "superiority"));
    applyStatusEffect(target, { id: `rallied-by-${hero.id}`, label: "Rallied", tempHp: Math.max(1, roll.total + abilityMod(hero, "cha")), durationRounds: 10 });
    addLog(`${hero.name} rallies ${target.name} for ${Math.max(1, roll.total + abilityMod(hero, "cha"))} temporary HP.`, "important");
  }

  if (ability.id === "maneuverCommandersStrike" || ability.id === "maneuverManeuvering") {
    const target = await chooseAbilityTarget(hero, ability.name, "Choose an ally to coordinate.");
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      renderAbilitiesMenu();
      return;
    }
    const roll = rollDice(1, fighterSubclassDieSides(hero, "superiority"));
    if (ability.id === "maneuverCommandersStrike") {
      applyStatusEffect(target, { id: `commanders-strike-${hero.id}`, label: "Commander's Strike", weaponRider: true, damageBonus: roll.total, damageType: target.damage?.type ?? "damage", durationRounds: 1 });
      addLog(`${hero.name} directs ${target.name}'s next strike for ${roll.total} extra damage.`, "important");
    } else {
      target.movementLeft = (target.movementLeft ?? 0) + Math.max(1, Math.floor((target.speedFeet ?? 30) / feetPerSquare / 2));
      addLog(`${hero.name}'s Maneuvering Attack opens movement for ${target.name}.`, "important");
    }
  }

  if (ability.resourcePool === "superiority" && !["maneuverRally", "maneuverCommandersStrike", "maneuverManeuvering", "maneuverParry", "maneuverRiposte", "maneuverBrace"].includes(ability.id)) {
    const roll = rollDice(1, fighterSubclassDieSides(hero, "superiority"));
    const maneuver = ability.maneuver ?? "";
    const riderStatusByManeuver = {
      disarming: "disarmed",
      distracting: "distracted",
      goading: "marked",
      grappling: "restrained",
      menacing: "frightened",
      pushing: "hamstrung",
      sweeping: "sweeping",
      trip: "prone",
    };
    if (maneuver === "precision") {
      applyStatusEffect(hero, { id: "precision-attack", label: `Precision d${fighterSubclassDieSides(hero, "superiority")}`, attackBonus: roll.total, expiresAtEndOfTurn: true });
      addLog(`${hero.name} uses Precision Attack for ${abilityLabel(roll.total)} on the next attack roll.`, "important");
    } else if (["baitAndSwitch", "evasiveFootwork"].includes(maneuver)) {
      applyStatusEffect(hero, { id: ability.id, label: ability.name, acBonus: roll.total, expiresAtStartOfTurn: true });
      addLog(`${hero.name} uses ${ability.name} for ${abilityLabel(roll.total)} AC.`, "important");
    } else if (["commandingPresence", "tacticalAssessment"].includes(maneuver)) {
      applyStatusEffect(hero, { id: ability.id, label: ability.name, skillBonus: roll.total, durationRounds: 3 });
      addLog(`${hero.name} uses ${ability.name} for ${abilityLabel(roll.total)} on upcoming checks.`, "important");
    } else if (maneuver === "feinting") {
      applyStatusEffect(hero, { id: ability.id, label: ability.name, attackAdvantage: true, weaponRider: true, damageBonus: roll.total, damageType: hero.damage?.type ?? "damage", expiresAtEndOfTurn: true });
      addLog(`${hero.name} feints; the next hit adds ${roll.total} damage.`, "important");
    } else if (maneuver === "lunging") {
      applyStatusEffect(hero, { id: ability.id, label: ability.name, speedBonusFeet: 5, weaponRider: true, damageBonus: roll.total, damageType: hero.damage?.type ?? "damage", expiresAtEndOfTurn: true });
      addLog(`${hero.name} lunges; the next hit adds ${roll.total} damage.`, "important");
    } else if (maneuver === "quickToss") {
      const target = currentAttackTargetForAbility();
      if (!target) {
        refundFighterAbilityUse(hero, ability);
        addLog(`${hero.name} has no target for Quick Toss.`, "important");
      } else {
        applyStatusEffect(hero, { id: ability.id, label: ability.name, weaponRider: true, damageBonus: roll.total, damageType: hero.damage?.type ?? "damage", expiresAtEndOfTurn: true });
        hero.hasBonusAction = true;
        await makeAttack(hero, target, { resource: "bonusAction", actionLabel: "uses Quick Toss" });
      }
    } else {
      applyStatusEffect(hero, { id: ability.id, label: ability.name, weaponRider: true, damageBonus: roll.total, damageType: hero.damage?.type ?? "damage", riderStatus: riderStatusByManeuver[maneuver] ?? null, expiresAtEndOfTurn: true });
      addLog(`${hero.name} prepares ${ability.name} (${roll.total} extra damage).`, "important");
    }
  }

  if (ability.id === "unwaveringMark") {
    const roll = Math.max(1, Math.floor((hero.level ?? 1) / 2));
    applyStatusEffect(hero, { id: "unwavering-mark", label: "Unwavering Mark", weaponRider: true, damageBonus: roll, damageType: hero.damage?.type ?? "damage", riderStatus: "marked", expiresAtEndOfTurn: true });
    addLog(`${hero.name} marks their foe; the next weapon hit deals ${roll} extra damage.`, "important");
  }

  if (ability.id === "wardingManeuver") {
    const roll = rollDice(1, 8);
    applyStatusEffect(hero, { id: "warding-maneuver", label: "Warding Maneuver", acBonus: roll.total, resistances: ["bludgeoning", "piercing", "slashing"], expiresAtStartOfTurn: true });
    addLog(`${hero.name} uses Warding Maneuver for ${abilityLabel(roll.total)} AC and weapon resistance.`, "important");
  }

  if (ability.id === "ferociousCharger") {
    const bonus = Math.max(1, abilityMod(hero, "str"));
    applyStatusEffect(hero, { id: "ferocious-charger", label: "Ferocious Charger", weaponRider: true, damageBonus: bonus, damageType: hero.damage?.type ?? "damage", riderStatus: "prone", expiresAtEndOfTurn: true });
    addLog(`${hero.name} lowers their shoulder for a Ferocious Charger hit.`, "important");
  }

  if (ability.id === "fightingSpirit") {
    const tempHp = (hero.level ?? 1) >= 15 ? 15 : (hero.level ?? 1) >= 10 ? 10 : 5;
    applyStatusEffect(hero, { id: "fighting-spirit", label: "Fighting Spirit", attackAdvantage: true, tempHp, expiresAtEndOfTurn: true });
    addLog(`${hero.name} invokes Fighting Spirit and gains ${tempHp} temporary HP.`, "important");
  }

  if (ability.id === "rapidStrike") {
    const target = currentAttackTargetForAbility();
    if (!target || !(hero.statusEffects ?? []).some((effect) => effect.id === "fighting-spirit")) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} needs Fighting Spirit and a target for Rapid Strike.`, "important");
    } else {
      hero.hasBonusAction = true;
      await makeAttack(hero, target, { resource: "bonusAction", actionLabel: "uses Rapid Strike" });
    }
  }

  if (ability.id === "manifestEcho") {
    applyStatusEffect(hero, { id: "manifest-echo", label: "Manifest Echo", speedBonusFeet: 15, expiresAtEndOfTurn: true });
    addLog(`${hero.name} manifests an echo, gaining short-range mobility this turn.`, "important");
  }

  if (ability.id === "unleashIncarnation") {
    const target = currentAttackTargetForAbility();
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name}'s echo has no target.`, "important");
    } else {
      hero.hasBonusAction = true;
      await makeAttack(hero, target, { resource: "bonusAction", actionLabel: "attacks through the echo" });
    }
  }

  if (ability.id === "shadowMartyr") {
    applyStatusEffect(hero, { id: "shadow-martyr", label: "Shadow Martyr", acBonus: 5, expiresAtStartOfTurn: true });
    addLog(`${hero.name}'s echo interposes as Shadow Martyr.`, "important");
  }

  if (ability.id === "reclaimPotential") {
    const roll = rollDice(2, 6);
    const tempHp = Math.max(1, roll.total + abilityMod(hero, "con"));
    applyStatusEffect(hero, { id: "reclaim-potential", label: "Reclaim Potential", tempHp, durationRounds: 10 });
    addLog(`${hero.name} reclaims echo potential for ${tempHp} temporary HP.`, "important");
  }

  if (ability.id === "psionicStrike") {
    const roll = rollDice(1, fighterSubclassDieSides(hero, "psionic"));
    const damage = Math.max(1, roll.total + abilityMod(hero, "int"));
    applyStatusEffect(hero, { id: "psionic-strike", label: "Psionic Strike", weaponRider: true, damageBonus: damage, damageType: "force", riderStatus: (hero.level ?? 1) >= 7 ? "prone" : null, expiresAtEndOfTurn: true });
    addLog(`${hero.name} charges a Psionic Strike for ${damage} force damage.`, "important");
  }

  if (ability.id === "protectiveField") {
    const roll = rollDice(1, fighterSubclassDieSides(hero, "psionic"));
    const reduction = Math.max(1, roll.total + abilityMod(hero, "int"));
    applyStatusEffect(hero, { id: "protective-field", label: "Protective Field", tempHp: reduction, expiresAtStartOfTurn: true });
    addLog(`${hero.name}'s Protective Field grants ${reduction} temporary HP.`, "important");
  }

  if (ability.id === "psiPoweredLeap") {
    applyStatusEffect(hero, { id: "psi-powered-leap", label: "Psi-Powered Leap", speedBonusFeet: hero.speedFeet ?? 30, expiresAtEndOfTurn: true });
    addLog(`${hero.name} launches with Psi-Powered Leap.`, "important");
  }

  if (ability.id === "bulwarkOfForce") {
    const targets = partyHeroes().filter((target) => heroCanAct(target)).slice(0, Math.max(1, abilityMod(hero, "int")));
    for (const target of targets) applyStatusEffect(target, { id: `bulwark-of-force-${hero.id}`, label: "Bulwark of Force", acBonus: 2, durationRounds: 10 });
    addLog(`${hero.name} raises a Bulwark of Force around ${targets.map((target) => target.name).join(", ")}.`, "important");
  }

  if (ability.id === "telekineticMaster") {
    applyStatusEffect(hero, { id: "telekinetic-master", label: "Telekinetic Master", damageBonus: Math.max(1, abilityMod(hero, "int")), attackAdvantage: true, durationRounds: 3 });
    addLog(`${hero.name} enters a Telekinetic Master battle focus.`, "important");
  }

  if (ability.id === "giantsMight") {
    const roll = rollDice(1, fighterSubclassDieSides(hero, "giantsMight"));
    applyStatusEffect(hero, { id: "giants-might", label: "Giant's Might", damageBonus: roll.total, skillBonus: 2, durationRounds: 10 });
    addLog(`${hero.name} grows with Giant's Might (${roll.total} extra weapon damage).`, "important");
  }

  if (ability.id === "fireRune") {
    const roll = rollDice(2, 6);
    applyStatusEffect(hero, { id: "fire-rune", label: "Fire Rune", weaponRider: true, damageBonus: roll.total, damageType: "fire", riderStatus: "restrained", expiresAtEndOfTurn: true });
    addLog(`${hero.name} invokes the Fire Rune (${roll.total} fire).`, "important");
  }

  if (ability.id === "frostRune") {
    applyStatusEffect(hero, { id: "frost-rune", label: "Frost Rune", skillBonus: 2, durationRounds: 10 });
    addLog(`${hero.name} invokes the Frost Rune.`, "important");
  }

  if (ability.id === "hillRune") {
    applyStatusEffect(hero, { id: "hill-rune", label: "Hill Rune", resistances: ["bludgeoning", "piercing", "slashing", "poison"], durationRounds: 10 });
    addLog(`${hero.name} invokes the Hill Rune.`, "important");
  }

  if (ability.id === "stormRune") {
    applyStatusEffect(hero, { id: "storm-rune", label: "Storm Rune", attackAdvantage: true, durationRounds: 10 });
    addLog(`${hero.name} invokes the Storm Rune.`, "important");
  }

  if (ability.id === "runicShield") {
    applyStatusEffect(hero, { id: "runic-shield", label: "Runic Shield", acBonus: 3, expiresAtStartOfTurn: true });
    addLog(`${hero.name} raises a Runic Shield.`, "important");
  }

  if (ability.id === "battleragerSpikes" || ability.id === "frenzy") {
    const target = currentAttackTargetForAbility();
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} has no target for ${ability.name}.`, "important");
    } else {
      hero.hasBonusAction = true;
      await makeAttack(hero, target, { resource: "bonusAction", actionLabel: `uses ${ability.name}` });
    }
  }

  if (ability.id === "battleragerCharge") {
    hero.movementLeft = (hero.movementLeft ?? 0) + Math.max(1, Math.floor((hero.speedFeet ?? 30) / feetPerSquare));
    addLog(`${hero.name} charges forward in a spike-armored rush.`, "important");
  }

  if (ability.id === "infectiousFury") {
    const damage = Math.max(1, rollDice(2, 12).total);
    applyStatusEffect(hero, { id: "infectious-fury", label: "Infectious Fury", weaponRider: true, damageBonus: damage, damageType: "psychic", riderStatus: "shaken", expiresAtEndOfTurn: true });
    addLog(`${hero.name}'s next hit carries infectious fury for ${damage} psychic damage.`, "important");
  }

  if (ability.id === "callTheHunt") {
    const allies = partyHeroes().filter((target) => heroCanAct(target));
    const tempHp = Math.max(1, 5 + abilityMod(hero, "con"));
    for (const ally of allies) applyStatusEffect(ally, { id: `call-the-hunt-${hero.id}`, label: "Call the Hunt", tempHp, durationRounds: 10 });
    applyStatusEffect(hero, { id: "call-the-hunt-damage", label: "Hunt Leader", damageBonus: Math.max(1, allies.length), durationRounds: 10 });
    addLog(`${hero.name}'s Call the Hunt grants ${tempHp} temporary HP to the party.`, "important");
  }

  if (ability.id === "intimidatingPresence") {
    const target = currentAttackTargetForAbility();
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} has no target to intimidate.`, "important");
    } else {
      applyStatusEffect(target, { id: "intimidated", label: "Frightened", attackBonus: -2, durationRounds: 2 });
      addLog(`${hero.name}'s presence frightens ${target.name}.`, "important");
    }
  }

  if (ability.id === "elementalCleaver") {
    const damage = rollDice((hero.level ?? 1) >= 14 ? 2 : 1, 6).total;
    applyStatusEffect(hero, { id: "elemental-cleaver", label: "Elemental Cleaver", weaponRider: true, damageBonus: damage, damageType: "force", expiresAtEndOfTurn: true });
    addLog(`${hero.name}'s next hit carries ${damage} elemental force.`, "important");
  }

  if (ability.id === "mightyImpel") {
    const target = currentAttackTargetForAbility();
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} has no target to impel.`, "important");
    } else {
      applyStatusEffect(target, { id: "mighty-impel", label: "Hurled", speedBonusFeet: -10, attackBonus: -1, expiresAtEndOfTurn: true });
      addLog(`${hero.name}'s giant strength hurls ${target.name} off balance.`, "important");
    }
  }

  if (ability.id === "stormAuraPulse") {
    const aura = (hero.knownStormAuras ?? [])[0] ?? "stormAuraDesert";
    if (aura === "stormAuraTundra") {
      const tempHp = Math.max(2, abilityMod(hero, "con") + Math.floor((hero.level ?? 1) / 3));
      for (const ally of partyHeroes().filter((target) => attackGridDistanceBetweenFighters(target, hero) <= 2)) applyStatusEffect(ally, { id: `tundra-aura-${hero.id}`, label: "Tundra Aura", tempHp, expiresAtStartOfTurn: true });
      addLog(`${hero.name}'s tundra aura grants ${tempHp} temporary HP nearby.`, "important");
    } else {
      const target = currentAttackTargetForAbility();
      if (!target) {
        refundFighterAbilityUse(hero, ability);
        addLog(`${hero.name}'s storm has no target.`, "important");
      } else {
        const type = aura === "stormAuraSea" ? "lightning" : "fire";
        const roll = aura === "stormAuraSea" ? rollDice(1, 6) : { total: Math.max(2, Math.floor((hero.level ?? 1) / 2)) };
        applySpecialDamage(hero, target, roll.total, type, aura === "stormAuraSea" ? "Sea Aura" : "Desert Aura");
      }
    }
  }

  if (ability.id === "totemSurge") {
    const totems = hero.knownTotems ?? [];
    if (totems.includes("totemBear")) applyStatusEffect(hero, { id: "bear-totem-surge", label: "Bear Totem", resistances: ["acid", "cold", "fire", "lightning", "necrotic", "poison", "psychic", "radiant", "thunder"], expiresAtStartOfTurn: true });
    if (totems.includes("totemEagle")) hero.movementLeft = (hero.movementLeft ?? 0) + Math.max(1, Math.floor((hero.speedFeet ?? 30) / feetPerSquare / 2));
    if (totems.includes("totemWolf")) {
      const target = currentAttackTargetForAbility();
      if (target) applyStatusEffect(target, { id: `wolf-totem-${hero.id}`, label: "Wolf Totem", acBonus: -2, expiresAtEndOfTurn: true });
    }
    addLog(`${hero.name} calls on their totem spirit.`, "important");
  }

  if (ability.id === "bolsteringMagic") {
    const target = await chooseAbilityTarget(hero, "Bolstering Magic", "Choose an ally to bolster with wild magic.");
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      renderAbilitiesMenu();
      return;
    }
    applyStatusEffect(target, { id: `bolstering-magic-${hero.id}`, label: "Bolstering Magic", attackBonus: rollDie(3), skillBonus: rollDie(3), durationRounds: 3 });
    addLog(`${hero.name}'s Bolstering Magic sparks around ${target.name}.`, "important");
  }

  if (ability.id === "unstableBacklash") {
    applyBarbarianWildSurge(hero);
  }

  if (ability.id === "zealousPresence") {
    for (const ally of partyHeroes().filter((target) => heroCanAct(target))) applyStatusEffect(ally, { id: `zealous-presence-${hero.id}`, label: "Zealous Presence", attackAdvantage: true, saveBonus: 2, durationRounds: 1 });
    addLog(`${hero.name}'s Zealous Presence rallies the party.`, "important");
  }

  if (ability.id === "eldritchBlast") {
    startEldritchBlastTargeting(hero);
    return;
  }

  if (ability.id === "armorOfShadows") {
    if (equippedItem(hero, "torso")?.armor?.base) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} must remove armor before Armor of Shadows can help.`, "important");
      renderAbilitiesMenu();
      return;
    }
    applyStatusEffect(hero, { id: "armor-of-shadows", label: "Armor of Shadows", acBonus: 3, durationRounds: 100 });
    addLog(`${hero.name} wraps themselves in Armor of Shadows.`, "important");
  }

  if (ability.id === "fiendishVigor") {
    applyStatusEffect(hero, { id: "fiendish-vigor", label: "Fiendish Vigor", tempHp: 8, durationRounds: 10 });
    addLog(`${hero.name} draws on Fiendish Vigor for 8 temporary HP.`, "important");
  }

  if (ability.id === "ascendantStep") {
    hero.movementLeft = (hero.movementLeft ?? 0) + 6;
    applyStatusEffect(hero, { id: "ascendant-step", label: "Ascendant Step", acBonus: 1, durationRounds: 3 });
    addLog(`${hero.name} rises on Ascendant Step, gaining movement and defense.`, "important");
  }

  if (ability.id === "oneWithShadows") {
    applyStatusEffect(hero, { id: "one-with-shadows", label: "One with Shadows", acBonus: 2, attackAdvantage: true, durationRounds: 1 });
    addLog(`${hero.name} becomes One with Shadows.`, "important");
  }

  if (ability.id === "mireTheMind") {
    const target = currentAttackTargetForAbility();
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} has no visible target for Mire the Mind.`, "important");
      renderAbilitiesMenu();
      return;
    }
    applyStatusEffect(target, { id: `mire-the-mind-${hero.id}`, label: "Mired Mind", speedBonusFeet: -10, attackBonus: -2, durationRounds: 2 });
    addLog(`${hero.name} mires ${target.name}'s mind.`, "important");
  }

  if (ability.id === "dreadfulWord") {
    const targets = visibleMonsters().filter((target) => attackGridDistanceBetweenFighters(hero, target) <= 6 && hasClearLineOfSightBetweenFighters(hero, target));
    if (!targets.length) {
      refundFighterAbilityUse(hero, ability);
      addLog(`${hero.name} has no nearby visible enemies for Dreadful Word.`, "important");
      renderAbilitiesMenu();
      return;
    }
    for (const target of targets) applyStatusEffect(target, { id: `dreadful-word-${hero.id}`, label: "Frightened", attackBonus: -2, durationRounds: 2 });
    addLog(`${hero.name}'s Dreadful Word frightens ${targets.map((target) => target.name).join(", ")}.`, "important");
  }

  if (ability.id === "dragonbornBreath") {
    hero.abilityUses[ability.id] = Math.max(0, (hero.abilityUses?.[ability.id] ?? 1) - 1);
    if (state.mode === "combat") hero.hasAction = true;
    const baseBreath = getContentDefinition("spells", "dragonborn-breath");
    const breath = {
      ...baseBreath,
      save: { ...baseBreath.save, ability: hero.racialTraits?.dragonBreathSaveAbility ?? "dex" },
      effect: { ...baseBreath.effect, type: hero.racialTraits?.dragonDamageType ?? baseBreath.effect?.type ?? "fire" },
    };
    startSpellTargeting(hero, breath);
    return;
  }

  if (ability.id === "aasimarHealingHands") {
    const target = await chooseLayOnHandsTarget(hero);
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      renderAbilitiesMenu();
      return;
    }
    const healed = applyHealingToHero(target, hero.level ?? 1);
    const targetText = target.id === hero.id ? "" : ` on ${target.name}`;
    addLog(`${hero.name} uses Healing Hands${targetText} and heals ${healed} HP.`, "heal");
    await maybeFinishEncounterAfterHeroRecovery();
  }

  if (ability.racialSpellId) {
    refundFighterAbilityUse(hero, ability);
    const racialSpell = getContentDefinition("spells", ability.racialSpellId);
    if (!racialSpell) {
      addLog(`${ability.name} is not ready yet.`, "important");
      renderAbilitiesMenu();
      return;
    }
    const spell = spellWithCastLevel(racialSpell, spellBaseLevel(racialSpell));
    if (!canCastSpell(hero, spell)) {
      addLog(`${hero.name} cannot use ${ability.name} right now.`, "important");
      renderAbilitiesMenu();
      return;
    }
    if (spell.target === "self") {
      await castSpellAtTarget(hero, spell, hero);
      return;
    }
    startSpellTargeting(hero, spell);
    return;
  }

  if (ability.id === "eldritchMaster") {
    hero.spellPoints = spellPointMaximum(hero);
    addLog(`${hero.name} uses Eldritch Master and restores pact spell points.`, "important");
  }

  if (ability.id === "spellMastery") {
    const before = hero.spellPoints ?? 0;
    hero.spellPoints = Math.min(spellPointMaximum(hero), before + 4);
    addLog(`${hero.name}'s Spell Mastery restores ${hero.spellPoints - before} spell points.`, "important");
  }

  if (ability.id === "signatureSpells") {
    const before = hero.spellPoints ?? 0;
    hero.spellPoints = Math.min(spellPointMaximum(hero), before + 10);
    addLog(`${hero.name}'s Signature Spells restore ${hero.spellPoints - before} spell points.`, "important");
  }

  if (ability.id === "bardicInspiration") {
    const target = await chooseAbilityTarget(hero, "Bardic Inspiration", "Choose a hero to inspire.");
    if (!target) {
      hero.abilityUses[ability.id] = Math.max(0, (hero.abilityUses[ability.id] ?? 1) - 1);
      if (state.mode === "combat") hero.hasBonusAction = true;
      renderAbilitiesMenu();
      return;
    }
    const dieSides = (hero.level ?? 1) >= 15 ? 12 : (hero.level ?? 1) >= 10 ? 10 : (hero.level ?? 1) >= 5 ? 8 : 6;
    applyStatusEffect(target, { id: "bardic-inspiration", label: `Inspired d${dieSides}`, dieSides, durationRounds: 10 });
    addLog(`${hero.name} gives Bardic Inspiration to ${target.name}.`, "important");
  }

  if (ability.id === "wildShape") {
    const beast = await chooseWildShapeBeast(hero);
    if (!beast) {
      refundFighterAbilityUse(hero, ability);
      renderAbilitiesMenu();
      return;
    }
    applyWildShape(hero, beast.id);
    addLog(`${hero.name} transforms into a ${beast.name}. Wild Shape lasts until Revert, beast HP reaches 0, or the dungeon ends.`, "important");
  }

  if (ability.id === "layOnHands") {
    const target = await chooseLayOnHandsTarget(hero);
    if (!target) {
      refundFighterAbilityUse(hero, ability);
      renderAbilitiesMenu();
      return;
    }
    const spentBefore = Math.max(0, (hero.abilityUses?.[ability.id] ?? 1) - 1);
    const remainingPool = Math.max(0, abilityMaxUses(hero, ability) - spentBefore);
    const use = await chooseLayOnHandsUse(hero, target, remainingPool);
    if (!use) {
      refundFighterAbilityUse(hero, ability);
      renderAbilitiesMenu();
      return;
    }
    hero.abilityUses[ability.id] = Math.min(abilityMaxUses(hero, ability), spentBefore + use.amount);
    const targetText = target.id === hero.id ? "" : ` on ${target.name}`;
    if (use.kind === "cureDisease") {
      const removed = typeof cureFighterDisease === "function" ? cureFighterDisease(target, use.diseaseId) : [];
      addLog(`${hero.name} spends 5 Lay on Hands HP${targetText} and cures ${removed[0]?.label ?? use.label ?? "one disease"}.`, "heal");
    } else {
      const healed = applyHealingToHero(target, use.amount);
      addLog(`${hero.name} spends ${use.amount} Lay on Hands HP${targetText} and heals ${healed} HP.`, "heal");
    }
    await maybeFinishEncounterAfterHeroRecovery();
  }

  if (ability.id === "divineSmite") {
    ensureSpellPointState(hero);
    const spend = Math.min(hero.spellPoints ?? 0, 5);
    if (spend <= 0) {
      hero.abilityUses[ability.id] = Math.max(0, (hero.abilityUses?.[ability.id] ?? 1) - 1);
      if (state.mode === "combat") hero.hasBonusAction = true;
      addLog(`${hero.name} needs spell points to prepare Divine Smite.`, "important");
    } else {
      hero.spellPoints = Math.max(0, (hero.spellPoints ?? 0) - spend);
      const dice = Math.min(5, 2 + Math.max(0, spend - 2));
      const roll = rollDice(dice, 8);
      applyStatusEffect(hero, { id: "divine-smite", label: `Divine Smite ${dice}d8`, weaponRider: true, damageBonus: roll.total, damageType: "radiant", expiresAtEndOfTurn: true });
      addLog(`${hero.name} spends ${spend} SP and prepares Divine Smite (${roll.rolls.join(" + ")} radiant).`, "important");
    }
  }

  if (ability.id === "empoweredSpell") {
    applyStatusEffect(hero, { id: "empowered-spell", label: "Empowered Spell", damageBonus: 3, durationRounds: 1 });
    addLog(`${hero.name} gathers empowered arcane force.`, "important");
  }

  if (ability.id === "arcaneRecovery") {
    const recovered = Math.min(spellPointMaximum(hero) - (hero.spellPoints ?? 0), Math.max(1, Math.ceil((hero.level ?? 1) / 2)));
    hero.spellPoints = Math.min(spellPointMaximum(hero), (hero.spellPoints ?? 0) + recovered);
    addLog(`${hero.name} uses Arcane Recovery and regains ${recovered} SP.`, "important");
  }

  if (ability.id === "channelDivinity") {
    const targets = visibleMonsters().filter((monster) => attackGridDistanceBetweenFighters(hero, monster) <= 3);
    addLog(`${hero.name} uses Channel Divinity.`, "important");
    for (const target of targets) {
      applySpecialDamage(hero, target, Math.max(1, rollDice(2, 8).total + abilityMod(hero, spellcastingAbility(hero))), "radiant", "Channel Divinity");
      if (!target.alive) {
        playSoundEffect("enemyDefeated");
        awardMonsterXp(target);
        dropLootForMonster(target);
      }
    }
    void finishEncounterAfterLastMonsterFalls();
  }

  if (ability.id === "rangerCompanion") {
    const selectedTarget = attackTarget();
    const target = selectedTarget && !objectIsDestructible(selectedTarget) ? selectedTarget : visibleMonsters()[0];
    if (target) {
      const damage = Math.max(1, rollDice(1, 8).total + proficiencyBonus(hero));
      applySpecialDamage(hero, target, damage, "piercing", "Ranger Companion");
      addLog(`${hero.name}'s companion strikes ${target.name}.`, "important");
      if (!target.alive) {
        playSoundEffect("enemyDefeated");
        awardMonsterXp(target);
        dropLootForMonster(target);
        void finishEncounterAfterLastMonsterFalls();
      }
    } else {
      addLog(`${hero.name}'s companion has no target.`, "important");
    }
  }

  refreshDerivedStats(hero);
  hideAbilitiesMenu();
  render();
}

function shortRestHeroes() {
  return partyHeroes().filter((hero) => heroCanAct(hero) || heroIsStableAtZero(hero));
}

function partyNeedsShortRest() {
  return shortRestHeroes().some(
    (hero) =>
      heroIsStableAtZero(hero) ||
      (hero.hp < hero.maxHp && (hero.hitDiceRemaining ?? hero.level ?? 1) > 0) ||
      hasSpentShortRestAbility(hero),
  );
}

function finishStableHeroesAfterShortRest() {
  for (const hero of stableUnconsciousPartyHeroes()) {
    hero.hp = 1;
    clearStableAtZero(hero);
    resetDeathSaveCounters(hero);
    refreshDerivedStats(hero);
    addLog(`${hero.name} wakes at the end of the short rest with 1 HP.`, "heal");
  }
}

function beginPartyShortRest() {
  if ((state.shortRestsUsed ?? 0) >= (state.shortRestLimit ?? 3)) return false;
  if (unstableDyingPartyHeroes().length > 0) {
    addLog("A hero is still making death saves. Stabilize them before taking a short rest.", "important");
    return false;
  }
  endRages("during the short rest");
  state.shortRestsUsed = (state.shortRestsUsed ?? 0) + 1;
  for (const hero of shortRestHeroes()) {
    resetFighterAbilityUses(hero, "shortRest");
    if (casterTypeForFighter(hero) === "pact") {
      hero.spellPoints = spellPointMaximum(hero);
      addLog(`${hero.name}'s pact spell points refresh on the short rest.`, "important");
    }
    refreshItemChargesForFighter(hero, "shortRest");
  }
  addLog("The party takes a short rest. Short-rest abilities refresh for every active hero.", "important");
  advanceDungeonTime(shortRestDurationSeconds(), "The short rest", { force: true });
  return true;
}

function shortRestAttunementMarkup(hero, spentAny) {
  normalizeAttunementState(hero);
  const attunementItems = (hero.inventory?.items ?? []).filter(itemRequiresAttunement);
  if (!attunementItems.length) {
    return `
      <div class="rest-hero-row">
        <div>
          <b>${escapeHtml(hero.name)}</b>
          <span>Attunement ${attunementCount(hero)}/${attunementLimit} - no carried attunement items.</span>
        </div>
      </div>
    `;
  }
  return `
    <div class="rest-hero-row">
      <div>
        <b>${escapeHtml(hero.name)}</b>
        <span>Attunement ${attunementCount(hero)}/${attunementLimit}</span>
        <div class="equip-actions">
          ${attunementItems
            .map(
              (item) => `
                <span>${escapeHtml(item.name)}</span>
                ${spentAny ? attunementActionForItem(hero, item, { rest: true }) : `<button type="button" disabled>Take rest first</button>`}
              `,
            )
            .join("")}
        </div>
      </div>
    </div>
  `;
}

function renderShortRestDialogBody(spentAny = false) {
  const heroes = shortRestHeroes();
  shortRestAttunementWindowOpen = spentAny;
  const shortRestsRemaining = Math.max(0, (state.shortRestLimit ?? 3) - (state.shortRestsUsed ?? 0));
  els.gameDialogMessage.innerHTML = `
    Short rests left: ${shortRestsRemaining}. A short rest is shared by the whole party and refreshes short-rest abilities for every active hero.
  `;
  els.gameDialogActions.innerHTML = `
    <div class="short-rest-panel">
      <button type="button" data-rest-action="shortRest" ${!spentAny && shortRestsRemaining > 0 ? "" : "disabled"}>Take Short Rest</button>
      ${heroes
        .map((hero) => {
          const conMod = abilityMod(hero, "con");
          hero.hitDiceRemaining = hero.hitDiceRemaining ?? hero.level ?? 1;
          const canSpend = spentAny && (hero.hp > 0 || heroIsStableAtZero(hero)) && (hero.hitDiceRemaining ?? 0) > 0 && hero.hp < hero.maxHp;
          const status = heroIsStableAtZero(hero) ? " - stable; wakes at rest end" : "";
          return `
            <div class="rest-hero-row">
              <div>
                <b>${escapeHtml(hero.name)}</b>
                <span>HP ${hero.hp}/${hero.maxHp} - Hit dice ${hero.hitDiceRemaining ?? 0}/${hero.level ?? 1} - d${hero.hitDie ?? 10} ${abilityLabel(conMod)} CON${status}</span>
              </div>
              <button type="button" data-rest-action="spend" data-hero="${hero.id}" ${canSpend ? "" : "disabled"}>Roll Hit Die</button>
            </div>
          `;
        })
        .join("")}
      <h3>Attunement</h3>
      ${heroes.map((hero) => shortRestAttunementMarkup(hero, spentAny)).join("")}
      <button type="button" class="ghost-button" data-rest-action="finish">${spentAny ? "Finish Rest" : "No Short Rest"}</button>
    </div>
  `;
}

function showShortRestMenu(initialSpentAny = false) {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = "Short Rest";
    els.gameDialogField.classList.add("hidden");
    els.gameDialogForm.classList.add("wide-dialog");
    let spentAny = Boolean(initialSpentAny);

    const cleanup = () => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialogForm.classList.remove("wide-dialog");
      els.gameDialog.classList.add("hidden");
      shortRestAttunementWindowOpen = false;
      activeDialogCancel = null;
      if (spentAny) {
        finishStableHeroesAfterShortRest();
        playSoundEffect("shortRestFinished");
      }
      resolve(spentAny);
    };

    const handleClick = (event) => {
      const button = event.target.closest("[data-rest-action]");
      if (!button) return;
      if (button.dataset.restAction === "finish") {
        cleanup();
        return;
      }
      if (button.dataset.restAction === "shortRest") {
        if (!spentAny && !beginPartyShortRest()) return;
        spentAny = true;
        render();
        els.gameDialog.classList.remove("hidden");
        renderShortRestDialogBody(spentAny);
        return;
      }
      if (button.dataset.restAction === "attune-item" || button.dataset.restAction === "unattune-item") {
        if (!spentAny) return;
        const hero = state.fighters[button.dataset.hero];
        changeItemAttunement(hero, button.dataset.item, button.dataset.restAction === "attune-item");
        els.gameDialog.classList.remove("hidden");
        renderShortRestDialogBody(spentAny);
        return;
      }
      if (button.dataset.restAction !== "spend") return;

      if (!spentAny) {
        if (!beginPartyShortRest()) return;
        spentAny = true;
      }
      const hero = state.fighters[button.dataset.hero];
      if (!hero || (hero.hitDiceRemaining ?? 0) <= 0 || hero.hp >= hero.maxHp) return;
      const healingRoll = rollDice(1, hero.hitDie ?? 10);
      const conHealing = abilityMod(hero, "con");
      const healing = Math.max(0, healingRoll.total + conHealing);
      const before = hero.hp;
      hero.hitDiceRemaining = Math.max(0, (hero.hitDiceRemaining ?? 0) - 1);
      hero.hp = Math.min(hero.maxHp, hero.hp + healing);
      if (hero.hp > 0) {
        hero.alive = true;
        clearStableAtZero(hero);
        resetDeathSaveCounters(hero);
      }
      addLog(`${hero.name} spends a hit die and heals ${hero.hp - before} HP (${healingRoll.rolls[0]} ${abilityLabel(conHealing)}).`, "heal");
      refreshDerivedStats(hero);
      render();
      els.gameDialog.classList.remove("hidden");
      renderShortRestDialogBody(spentAny);
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = cleanup;
    renderShortRestDialogBody(spentAny);
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-rest-action='spend']:not(:disabled), [data-rest-action='finish']")?.focus();
  });
}

async function takeShortRest() {
  const heroes = shortRestHeroes();
  if ((state.shortRestsUsed ?? 0) >= (state.shortRestLimit ?? 3) || state.mode === "combat" || heroes.length === 0) return;
  if (unstableDyingPartyHeroes().length > 0) {
    addLog("A hero is still making death saves. Stabilize them before taking a short rest.", "important");
    render();
    return;
  }

  for (const hero of heroes) hero.hitDiceRemaining = hero.hitDiceRemaining ?? hero.level ?? 1;
  render();
  await showShortRestMenu();
  render();
}

function unequipSlot(slotId) {
  const hero = activeHero();
  const item = equippedItem(hero, slotId);
  if (typeof itemHasBindingCurse === "function" && itemHasBindingCurse(item)) {
    addLog(`${item.name} will not come free. Remove Curse can break the binding.`, "important");
    renderLog();
    return;
  }
  if (itemRequiresTwoHands(item) && ["mainHand", "offHand"].includes(slotId)) {
    hero.equipment.mainHand = null;
    hero.equipment.offHand = null;
  } else {
    hero.equipment[slotId] = null;
  }
  if (typeof removeItemCurseEffectsOnUnequip === "function") removeItemCurseEffectsOnUnequip(hero, item);
  refreshDerivedStats(hero);
  render();
  renderInventoryMenu();
}

function equipItem(itemId, slotId) {
  const hero = activeHero();
  const item = itemForId(hero, itemId);
  if (!itemCanEquipInSlot(hero, item, slotId)) {
    if (item?.requirements?.strength) {
      addLog(`${hero.name} needs Strength ${item.requirements.strength} to equip ${item.name}.`);
    } else if (item?.type === "armor" && !heroHasArmorProficiency(hero, item)) {
      addLog(`${hero.name} lacks proficiency to equip ${item.name}.`);
    }
    renderLog();
    return;
  }

  const equippingHand = isHandSlot(slotId);
  for (const slot of equipmentSlots) {
    const current = equippedItem(hero, slot.id);
    if ((hero.equipment[slot.id] === itemId || (equippingHand && isHandSlot(slot.id) && itemRequiresTwoHands(current))) && typeof itemHasBindingCurse === "function" && itemHasBindingCurse(current)) {
      addLog(`${current.name} is bound by a curse and cannot be replaced.`, "important");
      renderLog();
      return;
    }
    if (hero.equipment[slot.id] === itemId || (equippingHand && isHandSlot(slot.id) && itemRequiresTwoHands(equippedItem(hero, slot.id)))) {
      if (typeof removeItemCurseEffectsOnUnequip === "function") removeItemCurseEffectsOnUnequip(hero, current);
      hero.equipment[slot.id] = null;
    }
  }
  const targetItem = equippedItem(hero, slotId);
  if (targetItem && targetItem.id !== itemId && typeof itemHasBindingCurse === "function" && itemHasBindingCurse(targetItem)) {
    addLog(`${targetItem.name} is bound by a curse and cannot be replaced.`, "important");
    renderLog();
    return;
  }
  if (itemRequiresTwoHands(item)) {
    hero.equipment.mainHand = itemId;
    hero.equipment.offHand = itemId;
  } else {
    if (targetItem && targetItem.id !== itemId && typeof removeItemCurseEffectsOnUnequip === "function") removeItemCurseEffectsOnUnequip(hero, targetItem);
    hero.equipment[slotId] = itemId;
  }
  if (typeof triggerItemCurses === "function") triggerItemCurses(hero, item, "equip");
  refreshDerivedStats(hero);
  render();
  renderInventoryMenu();
}

function clearInventoryDropTargets() {
  els.inventoryMenu.querySelectorAll(".drag-over, .drag-invalid").forEach((element) => {
    element.classList.remove("drag-over", "drag-invalid");
  });
}

function handleInventoryDragStart(event) {
  const itemElement = event.target.closest("[data-drag-item]");
  if (!itemElement) return;

  currentInventoryDrag = {
    itemId: itemElement.dataset.dragItem,
    source: itemElement.dataset.dragSource ?? "inventory",
  };
  event.dataTransfer.effectAllowed = currentInventoryDrag.source === "admin" ? "copy" : "move";
  event.dataTransfer.setData("application/json", JSON.stringify(currentInventoryDrag));
  itemElement.classList.add("dragging");
}

function draggedInventoryItem(event) {
  if (currentInventoryDrag) return currentInventoryDrag;
  try {
    return JSON.parse(event.dataTransfer.getData("application/json"));
  } catch {
    return null;
  }
}

function isItemEquippedInAnotherHand(itemId, targetSlot) {
  if (!["mainHand", "offHand"].includes(targetSlot)) return false;
  const hero = activeHero();
  return ["mainHand", "offHand"].some((slotId) => slotId !== targetSlot && hero.equipment[slotId] === itemId);
}

function canDropInventoryData(data, target) {
  if (!data?.itemId || !target) return false;
  if (target.dataset.dropAdminTrash) return data.source !== "admin";
  if (target.dataset.dropChest) return state.mode === "home" && data.source !== "admin" && data.source !== "chest";
  if (target.dataset.dropInventory) return data.source !== "inventory";

  const slotId = target.dataset.dropSlot;
  const item = data.source === "admin" ? getItemTemplate(data.itemId) : data.source === "chest" ? chestItemForId(data.itemId) : itemForId(activeHero(), data.itemId);
  const handConflict = data.source !== "admin" && isItemEquippedInAnotherHand(data.itemId, slotId);
  return itemCanEquipInSlot(activeHero(), item, slotId) && !handConflict;
}

function handleInventoryDragOver(event) {
  const target = event.target.closest("[data-drop-slot], [data-drop-inventory], [data-drop-admin-trash], [data-drop-chest]");
  if (!target) return;

  const data = draggedInventoryItem(event);
  const valid = canDropInventoryData(data, target);
  event.preventDefault();
  event.dataTransfer.dropEffect = valid ? (data.source === "admin" ? "copy" : "move") : "none";
  target.classList.toggle("drag-over", valid);
  target.classList.toggle("drag-invalid", !valid);
}

function handleInventoryDragLeave(event) {
  const target = event.target.closest("[data-drop-slot], [data-drop-inventory], [data-drop-admin-trash], [data-drop-chest]");
  if (!target || target.contains(event.relatedTarget)) return;
  target.classList.remove("drag-over", "drag-invalid");
}

function handleInventoryDrop(event) {
  const target = event.target.closest("[data-drop-slot], [data-drop-inventory], [data-drop-admin-trash], [data-drop-chest]");
  if (!target) return;

  event.preventDefault();
  const data = draggedInventoryItem(event);
  clearInventoryDropTargets();
  if (!canDropInventoryData(data, target)) return;

  if (target.dataset.dropAdminTrash) {
    removeInventoryItem(data.itemId);
    return;
  }

  if (target.dataset.dropChest) {
    moveInventoryItemToChest(data.itemId);
    return;
  }

  if (target.dataset.dropInventory) {
    if (data.source === "admin") {
      addAdminItemToInventory(data.itemId);
      return;
    }
    if (data.source === "chest") {
      moveChestItemToInventory(data.itemId);
      return;
    }
    unequipSlot(data.source);
    return;
  }

  if (data.source === "admin") {
    addAdminItemToSlot(data.itemId, target.dataset.dropSlot);
    return;
  }
  if (data.source === "chest") {
    const item = chestItemForId(data.itemId);
    if (!item) return;
    state.chest = (state.chest ?? []).filter((entry) => entry.id !== data.itemId);
    const addedItems = addItemToInventory(activeHero(), item, "chest-stack");
    equipItem(addedItems[0]?.id ?? data.itemId, target.dataset.dropSlot);
    return;
  }

  equipItem(data.itemId, target.dataset.dropSlot);
}

function handleInventoryDragEnd(event) {
  event.target.closest("[data-drag-item]")?.classList.remove("dragging");
  currentInventoryDrag = null;
  clearInventoryDropTargets();
}

function monsterCardFighter() {
  const visible = nearestVisibleMonster();
  if (visible) return visible;
  const monsterTemplate = getMonsterTemplate();
  return {
    ...monsterTemplate,
    hp: 0,
    movementLeft: Math.floor(monsterTemplate.speedFeet / feetPerSquare),
    hasAction: false,
    alive: false,
    name: "No visible enemy",
    role: "Exploration",
  };
}

function renderInitiative() {
  if (state.mode !== "combat") {
    els.initiativeList.innerHTML = "";
    return;
  }

  els.initiativeList.innerHTML = state.initiative
    .map((entry, index) => {
      const fighter = state.fighters[entry.fighterId];
      const activeClass = index === state.activeIndex ? " active" : "";
      const selectableClass = isPlayerControlledPartyFighter(fighter) ? " selectable" : "";
      return `
        <div class="initiative-item${activeClass}${selectableClass}" data-initiative-fighter="${escapeAttribute(fighter.id)}">
          ${combatantArtworkMarkup(fighter, "initiative-art")}
          <span>${fighter.name}</span>
          <strong>${entry.total}</strong>
        </div>
      `;
    })
    .join("");
}

function rollChipMarkup(value) {
  const roll = Number(value);
  const criticalClass = roll === 20 ? " nat20" : roll === 1 ? " nat1" : "";
  return `<span class="roll-chip${criticalClass}">${value}</span>`;
}

function decorateRollSeries(series) {
  return series.replace(/\b\d+\b/g, (value) => rollChipMarkup(value));
}

function decorateParentheticalRolls(text) {
  return text.replace(/\(([^)]*)\)/g, (match, content) => {
    if (!/\b\d+\s*\+\s*\d+\b/.test(content)) return match;
    const decorated = content.replace(/(^|[\s(])(\d+)(?=\s*(?:\+|,|\)|$))/g, (part, prefix, value) => `${prefix}${rollChipMarkup(value)}`);
    return `(${decorated})`;
  });
}

function decorateLeadRolls(text) {
  return text.replace(/\b(d20(?: true)?|STR|DEX|CON|INT|WIS|CHA)\s+((?:\d+(?:\s*\/\s*\d+)*(?:\s*->\s*(?:Gentle Fate|adjusted outcome)?\s*)?)+)/g, (match, label, series) => {
    if (!/\d/.test(series)) return match;
    return `${label} ${decorateRollSeries(series)}`;
  });
}

function decorateNamedRolls(text) {
  return text.replace(/\brolls(?: a)?\s+(\d+)\b/g, (match, value) => match.replace(value, rollChipMarkup(value)));
}

function combatLogTextMarkup(text) {
  return decorateParentheticalRolls(decorateNamedRolls(decorateLeadRolls(escapeHtml(text))));
}

function scrollSidePanelToFeed() {
  const sidePanel = els.log?.closest(".side-panel");
  if (!sidePanel) return;
  const scrollToBottom = () => {
    sidePanel.scrollTop = sidePanel.scrollHeight;
  };
  scrollToBottom();
  window.requestAnimationFrame(scrollToBottom);
}

function renderLog() {
  const panel = els.log?.closest(".log-panel");
  const inCombat = state.mode === "combat";
  panel?.classList.toggle("event-feed", !inCombat);
  panel?.classList.toggle("expanded", combatLogExpanded);
  if (els.logTitle) els.logTitle.textContent = inCombat ? "Combat Log" : "Event Feed";
  if (els.expandLog) {
    els.expandLog.textContent = combatLogExpanded ? "-" : "+";
    els.expandLog.title = combatLogExpanded ? "Collapse feed" : "Expand feed";
    els.expandLog.setAttribute("aria-label", combatLogExpanded ? "Collapse feed" : "Expand feed");
    els.expandLog.setAttribute("aria-expanded", String(combatLogExpanded));
  }
  const preserveGuestScroll = window.DepthboundPlaytest?.role === "guest";
  const previousScrollTop = els.log.scrollTop;
  const previousScrollHeight = els.log.scrollHeight;
  const nearBottom = previousScrollHeight - previousScrollTop - els.log.clientHeight < 24;
  els.log.innerHTML = state.log
    .map((entry) => `<li class="${escapeAttribute(entry.type ?? "")}">${combatLogTextMarkup(entry.text)}</li>`)
    .join("");
  if (!preserveGuestScroll || nearBottom) {
    els.log.scrollTop = els.log.scrollHeight;
  } else {
    els.log.scrollTop = Math.max(0, previousScrollTop + els.log.scrollHeight - previousScrollHeight);
  }
  scrollSidePanelToFeed();
}

function renderControls() {
  applyThemePalette();
  const fighter = activeFighter();
  const hero = activeHero();
  const heroTurn = state.mode === "combat" && fighter && isPlayerControlledPartyFighter(fighter) && combatNeedsHeroTurns();
  if (!heroTurn) selectedAttackTargetId = null;
  const actingHero = heroTurn ? fighter : hero;
  const heroCanAttack = heroTurn && actingHero.hasAction && Boolean(attackTarget());
  const heroCanUseAction = heroTurn && (actingHero.hasAction || actingHero.hasBonusAction || canOffHandAttack(actingHero));
  const heroCanUseGrabMenu = canOpenGrabMenu(actingHero);
  const heroCanUseItem =
    gameHasStarted &&
    heroCanAct(actingHero) &&
    (state.mode === "combat"
      ? usableEquippedItems(actingHero).some((entry) => canUseBeltItem(actingHero, entry.item))
      : usableEquippedItems(actingHero).some((entry) => entry.item.use && itemHasCharges(entry.item)));
  const heroCanOpenAbilities =
    gameHasStarted &&
    heroCanAct(actingHero) &&
    (availableFighterAbilities(actingHero).length > 0 || spellDefinitionsForFighter(actingHero).length > 0) &&
    (state.mode !== "combat" || heroTurn);
  const heroFavoriteActionCount = favoriteActionCount(actingHero);
  const heroCanOpenFavoriteActions = gameHasStarted && heroCanAct(actingHero) && heroFavoriteActionCount > 0 && (state.mode !== "combat" || heroTurn);

  els.rollInitiative.disabled = !gameHasStarted || state.completed || movementInProgress || state.mode === "combat" || !threatPresent();
  els.attack.disabled = movementInProgress || !heroCanAttack;
  if (els.attackNote) {
    const target = attackTarget();
    const choices = target ? attackWeaponChoicesForTarget(actingHero, target) : attackWeaponChoicesForFighter(actingHero);
    const weaponText = choices.length > 1 ? "Choose weapon" : choices[0]?.label ?? activeWeapon(actingHero)?.name ?? "Unarmed Strike";
    els.attackNote.textContent = target
      ? `${weaponText} -> ${objectIsDestructible(target) ? objectTargetName(target) : target.name}`
      : weaponText;
  }
  els.actionButton.disabled = movementInProgress || !(heroCanUseAction || heroCanUseGrabMenu);
  els.actionButton.textContent = activeGrabForCarrier(actingHero) ? "Release [X]" : state.mode === "combat" ? "Tactics [X]" : "Grab [X]";
  if (els.favoriteActions) {
    els.favoriteActions.disabled = movementInProgress || !heroCanOpenFavoriteActions;
    els.favoriteActions.textContent = heroFavoriteActionCount > 0 ? `Favorites [F] ${heroFavoriteActionCount}` : "Favorites [F]";
  }
  els.useItem.disabled = movementInProgress || !heroCanUseItem;
  els.abilities.disabled = movementInProgress || !heroCanOpenAbilities;
  els.shortRest.disabled =
    !gameHasStarted ||
    movementInProgress ||
    (state.shortRestsUsed ?? 0) >= (state.shortRestLimit ?? 3) ||
    state.mode === "combat" ||
    shortRestHeroes().length === 0 ||
    !partyNeedsShortRest();
  const fleeStatus = state.mode === "combat" ? fleeCombatStatus() : { ok: false, reason: "" };
  els.returnHome.disabled =
    state.mode === "combat"
      ? movementInProgress || !fleeStatus.ok
      : !gameHasStarted || movementInProgress || state.mode === "home" || partyHeroes().length === 0;
  els.returnHome.textContent = state.mode === "combat" ? "Flee Combat [H]" : "Return Home [H]";
  els.returnHome.title = state.mode === "combat" ? fleeStatus.reason : "";
  els.endTurn.disabled = movementInProgress || !heroTurn;

  const selectableCount = selectableHeroIds().size;
  if (els.selectParty) {
    els.selectParty.disabled = !gameHasStarted || state.mode === "combat" || selectableCount <= 1;
  }

  const setDockControlVisible = (control, visible) => {
    if (!control) return;
    const dockWrapper = control.closest(".dock-action");
    if (dockWrapper) {
      dockWrapper.style.display = visible ? "" : "none";
    } else {
      control.style.display = visible ? "" : "none";
    }
  };
  setDockControlVisible(els.rollInitiative, !els.rollInitiative.disabled);
  setDockControlVisible(els.selectParty, Boolean(els.selectParty && !els.selectParty.disabled));
  setDockControlVisible(els.attack, state.mode === "combat");
  setDockControlVisible(els.favoriteActions, state.mode === "combat");
  setDockControlVisible(els.actionButton, state.mode === "combat" || heroCanUseGrabMenu);
  setDockControlVisible(els.useItem, heroCanUseItem);
  setDockControlVisible(els.abilities, heroCanOpenAbilities);
  setDockControlVisible(els.shortRest, !els.shortRest.disabled);
  setDockControlVisible(els.returnHome, state.mode === "combat" || (gameHasStarted && state.mode !== "home" && partyHeroes().length > 0));
  setDockControlVisible(els.endTurn, state.mode === "combat");

  els.saveGame.disabled = !gameHasStarted || Boolean(state.isTutorial);
  els.toggleLayout.textContent = showDungeonLayout ? "Hide Dungeon Layout" : "Show Dungeon Layout";
  els.toggleAdminMode.classList.toggle("active", adminEnabled());
  els.toggleAdminMode.disabled = !gameHasStarted;
  els.toggleLayout.classList.toggle("hidden", !adminEnabled());
  els.debugKill.classList.toggle("hidden", !adminEnabled());
  els.toggleLayout.disabled = !adminEnabled();
  if (els.topAdminActions) {
    els.topAdminActions.classList.toggle("hidden", !adminEnabled());
    const teleport = els.topAdminActions.querySelector("[data-action='toggle-admin-teleport']");
    const god = els.topAdminActions.querySelector("[data-action='toggle-admin-god']");
    if (teleport) {
      teleport.textContent = adminTeleportEnabled ? "Teleport On" : "Teleport Off";
      teleport.classList.toggle("active", adminTeleportEnabled);
    }
    if (god) {
      god.textContent = adminGodMode ? "God Mode On" : "God Mode Off";
      god.classList.toggle("active", adminGodMode);
    }
  }
  els.zoomOut.disabled = roomZoom <= 0.5;
  els.zoomIn.disabled = roomZoom >= 2;
  els.zoomLabel.textContent = `${Math.round(roomZoom * 100)}%`;
  if (els.zoomSlider) els.zoomSlider.value = String(Math.round(roomZoom * 100));
  els.volumeSliders?.forEach((slider) => {
    slider.value = String(Math.round(soundVolume * 100));
  });
  els.volumeLabels?.forEach((label) => {
    label.textContent = `${Math.round(soundVolume * 100)}%`;
  });
  if (els.buttonThemeSelect) els.buttonThemeSelect.value = buttonTheme;
  els.debugKill.disabled = !adminEnabled() || visibleMonsters().length === 0;
  const canTrain = gameHasStarted && state.mode === "home" && canTrainAsSidekick(hero);
  const canReplaceCompanion = gameHasStarted && state.mode === "home" && canReplaceDeadBeastMasterCompanion(hero);
  els.levelPanel?.classList.toggle("hidden", isAutonomousAlly(hero));
  els.levelUp.textContent = canTrain ? "Train" : "Level Up";
  els.levelUp.disabled = !gameHasStarted || state.mode !== "home" || (!canTrain && !canLevelUp(hero));
  els.replaceRangerCompanion?.classList.toggle("hidden", !canReplaceCompanion);
  if (els.replaceRangerCompanion) els.replaceRangerCompanion.disabled = !canReplaceCompanion;
  if (els.roomTitle) els.roomTitle.textContent = state.mode === "home" ? "Home" : state.room.name;
  els.homeObjectiveChip?.classList.toggle("hidden", !shouldShowHomeObjectiveChip());
  els.showDungeonIntro?.classList.toggle("hidden", !state.customDungeon?.intro?.text && !(state.customDungeon?.intro?.images ?? []).length);
  renderDungeonClock();
  renderQuestLogButton();
  els.roundLabel.textContent = state.mode === "combat" ? `Round ${state.round}` : "Out of turn order";

  if (state.completed) {
    els.turnLabel.textContent = "Dungeon complete";
  } else if (state.mode === "home") {
    els.roundLabel.textContent = "Home";
    els.turnLabel.textContent = "Long rest complete";
  } else if (state.mode !== "combat") {
    els.turnLabel.textContent = threatPresent() ? "Danger present" : "Exploration";
  } else if (!combatNeedsHeroTurns() || partyDefeatedOrDying()) {
    els.turnLabel.textContent = combatMonsters().length === 0 ? "Encounter won" : "Encounter lost";
  } else {
    els.turnLabel.textContent = `${fighter.name}'s turn`;
  }
  updateBackgroundMusic();
}

function renderDungeonClock() {
  if (!els.dungeonTimerLabel || !els.toggleDungeonTimer) return;
  const active = gameHasStarted && state?.mode !== "home";
  els.dungeonTimerLabel.textContent = state?.mode === "home"
    ? `Day ${normalizeWorldDay(state?.worldDay)}`
    : active
      ? `Time ${formatDungeonClockTime(dungeonElapsedSeconds({ sync: false }))}`
      : "Time 00:00:00";
  const paused = dungeonClockIsPaused();
  els.toggleDungeonTimer.textContent = paused ? "Resume" : "Pause";
  els.toggleDungeonTimer.setAttribute("aria-pressed", paused ? "true" : "false");
  els.toggleDungeonTimer.disabled = !active || state?.completed;
  els.toggleDungeonTimer.classList.toggle("hidden", state?.mode === "home");
  els.toggleDungeonTimer.title = state?.mode === "combat" ? "Paused combat time stops round-based durations." : "";
}
