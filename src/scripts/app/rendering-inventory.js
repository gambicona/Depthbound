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

function setCombatantTokenArt(token, art) {
  const tokenImage = token?.querySelector(".token-art");
  if (!tokenImage) return;
  if (!art) {
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

  tokenImage.addEventListener("load", () => showCombatantTokenArt(token));
  tokenImage.addEventListener("error", () => hideCombatantTokenArt(token));

  token.append(tokenImage, tokenLabel);
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
    if (pendingSpellTargeting) {
      clearPendingSpellTargeting();
      return;
    }
    if (pendingEldritchBlast) {
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

  if (heroToken) {
    token.addEventListener("pointerdown", handleHeroPointerDown);
    token.addEventListener("click", (event) => {
      if (pendingSpellTargeting) {
        const current = state.fighters[combatant.id];
        if (current?.position) void confirmPendingSpellTarget(current.position);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (pendingEldritchBlast) {
        const current = state.fighters[combatant.id];
        if (current?.position) void confirmPendingEldritchBlast(current.position);
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
      if (!current?.alive || !isKnownTile(current.position)) return;
      if (pendingSpellTargeting) {
        void confirmPendingSpellTarget(current.position);
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (pendingEldritchBlast) {
        void confirmPendingEldritchBlast(current.position);
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
  let art = fighter.tokenArt ?? fighter.tokenImage ?? fighter.art ?? fighter.portrait ?? fighter.avatar ?? "";
  if (!art) art = recoverHeroTokenArtFromLibrary(fighter);
  if (art?.type === "custom-file") {
    const libraryEntry = loadCustomHeroTokenArt().find((entry) => entry.id === art.id || entry.tokenArt?.id === art.id);
    if (libraryEntry?.dataUrl) return libraryEntry.dataUrl;
    const cached = art.runtimeUrl ?? window.DungeonSave?.cachedTokenUrl?.(art.path) ?? "";
    if (cached) return cached;
    if (window.DungeonSave?.resolveTokenPath && art.path && !art.resolvePending) {
      art.resolvePending = true;
      window.DungeonSave.resolveTokenPath(art.path).then((url) => {
        art.resolvePending = false;
        if (url) {
          art.runtimeUrl = url;
          render();
        }
      });
    }
    return "";
  }
  return art;
}

function combatantArtworkMarkup(fighter, className = "combatant-art") {
  const art = combatantTokenArt(fighter);
  if (art) {
    return `<div class="${className}"><img src="${escapeAttribute(art)}" alt="${escapeAttribute(fighter.name)} artwork" /></div>`;
  }
  return `<div class="${className} empty"><span>${escapeHtml(fighter.token ?? tokenFromName(fighter.name, "M"))}</span></div>`;
}

function furnitureArtworkMarkup(template, object) {
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
    if (canHeroUseHomeExit(activeHero())) showHomeMenu();
  });
  exitToken.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (isHomeBuilderOpen()) return;
    if (pendingSpellTargeting) {
      void confirmPendingSpellTarget(state.exit.position);
      return;
    }
    if (pendingEldritchBlast) {
      void confirmPendingEldritchBlast(state.exit.position);
      return;
    }
    const hero = activeHero();
    if (canHeroUseHomeExit(hero)) {
      showHomeMenu();
      return;
    }
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
  homeMoveOutButton.textContent = "Move Out";
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
  chestToken.textContent = "C";
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
  planningToken.textContent = "PT";
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

  els.room.append(tileLayer, wallEdgeLayer, tokenLayer);
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
    if (objectIsTrap(object) && !object.detected && !object.spent && !object.disarmed) continue;

    const element = document.createElement("button");
    const behaviorClasses = objectComponents(object)
      .map((component) => `feature-${component.type.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`)
      .join(" ");
    element.className = `dungeon-object ${object.type} ${behaviorClasses}${object.spent ? " spent" : ""}${object.disarmed ? " disarmed" : ""}${object.detected ? " detected" : ""}`;
    element.classList.toggle("attackable-object", selectedHeroCanTargetObject(object));
    element.classList.toggle("selected-target", selectedAttackTarget()?.id === object.id);
    element.type = "button";
    element.title = template.name;
    const fallbackSymbol = template.symbol ?? (objectIsTrap(object) ? "!" : objectHasLoot(object) ? "$" : "?");
    const iconPath = furnitureIconPath(template, object.type);
    const icon = document.createElement("img");
    const iconStatus = iconPath ? furnitureIconLoadStatus.get(iconPath) : "missing";
    icon.className = `dungeon-object-icon${iconStatus === "loaded" ? "" : " hidden"}`;
    icon.alt = "";
    icon.draggable = false;
    const label = document.createElement("span");
    label.className = `dungeon-object-label${iconStatus === "loaded" ? " hidden" : ""}`;
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
    element.append(icon, label);
    element.style.left = `${object.position.x * scaledTileSizePx}px`;
    element.style.top = `${object.position.y * scaledTileSizePx}px`;
    element.style.width = `${(object.width ?? template.width) * scaledTileSizePx}px`;
    element.style.height = `${(object.height ?? template.height) * scaledTileSizePx}px`;
    element.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (isHomeBuilderOpen() && homeBuildTool === "move" && object.homePlaced) {
        selectHomeMoveTarget({ kind: "object", id: object.id, label: template.name });
        return;
      }
      if (applyHomeBuildAt(object.position)) return;
      if (pendingSpellTargeting) {
        void confirmPendingSpellTarget(object.position);
        return;
      }
      if (pendingEldritchBlast) {
        void confirmPendingEldritchBlast(object.position);
        return;
      }
      if (state.mode === "combat" && selectedHeroCanTargetObject(object)) {
        selectAttackTarget(object.id);
        return;
      }
      showDungeonObjectInfo(object);
    });
    element.addEventListener("contextmenu", (event) => {
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
      showDungeonObjectInfo(object);
    });
    objectLayer.append(element);
  }
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
  token.style.left = `${(fighter.position.x + 0.5) * scaledTileSizePx}px`;
  token.style.top = `${(fighter.position.y + 0.5) * scaledTileSizePx}px`;
  const heroToken = isRosterHeroId(fighter.id);
  if (heroToken) {
    token.style.setProperty("--token-ring-color", heroClassTokenColor(fighter));
    token.title = `${fighter.name} - ${fighter.className ?? "Hero"}`;
  }
  const visibleHero = heroToken && !fighter.dead && fighter.alive && (state.mode === "home" || isPartyHeroId(fighter.id));
  token.classList.toggle("hidden", heroToken ? !visibleHero : !fighter.alive || !isKnownTile(fighter.position));
  token.classList.toggle("defeated", !fighter.alive);
  token.classList.toggle("dragging", (fighter.id === dragHeroId || (heroToken && selectedHeroIds.has(fighter.id))) && Boolean(dragPath));
  token.classList.toggle("active-hero", fighter.id === activeHero()?.id);
  token.classList.toggle("selected-hero", heroToken && selectedHeroIds.has(fighter.id));
  token.classList.toggle("in-attack-range", !heroToken && attackTargets().some((target) => target.id === fighter.id));
  token.classList.toggle("selected-target", !heroToken && selectedAttackTarget()?.id === fighter.id);
    const spellTargeting = currentPendingSpellTargeting();
  token.classList.toggle("spell-click-target", isSpellTokenTargetable(spellTargeting, fighter));
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
    const visible = showDungeonLayout || initiativeIds.has(fighter.id) || activeTiles.has(positionKey(fighter.position));
    if (visible) recordMonsterEncounter(fighter);
    return visible;
  });
}

function renderRoom() {
  if (!roomIsBuilt) buildRoom();

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
  const walkable = currentWalkable();
  const doorKeys = new Set((state.dungeon?.doors ?? []).map(positionKey));
  const openedDoorKeys = new Set(state.exploration?.openedDoorKeys ?? []);
  const visibleWalls = exposedWallKeys();
  const spellTargeting = currentPendingSpellTargeting();
  const spellPreview = spellPreviewCells(spellTargeting);
  const persistentAreas = persistentAreaTileKeys();
  const shouldShowReachable = !movementInProgress && heroTurn;
  const reachable = !shouldShowReachable
    ? new Map()
    : heroTurn
      ? reachableTiles(hero, state.fighters, {
          gridSize: currentGridSize(),
          walkable,
          canTraverse: (from, to, path) => canTraverseMovementEdge(hero, from, to, path),
          moveCost: (_from, to) => movementCostAtPosition(to),
          stateKey: (position, path) => movementStateKey(hero, position, path),
          canEnterOccupied: (position) => canMoveThroughOccupiedTile(hero, position),
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
    const doorsHere = (state.dungeon?.doors ?? []).filter((door) => positionKey(door) === key);
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
  element.innerHTML = `
    <div class="fighter-top">
      ${combatantArtworkMarkup(fighter, "sidebar-hero-art")}
      <div>
        <div class="fighter-name">${fighter.name}</div>
        <div class="fighter-role">${escapeHtml(combatantRoleLabel(fighter))}</div>
      </div>
      <div class="card-actions">
        <button class="icon-button open-inventory" type="button" title="Inventory and equipment" aria-label="Inventory and equipment" ${canFighterReceiveInventory(fighter) ? "" : "disabled"}>I</button>
        <button class="icon-button rename-hero" type="button" title="Rename character" aria-label="Rename character" ${fighter.renameable === false ? "disabled" : ""}>...</button>
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
    <div class="status-line">
      ${fighter.dodging ? '<span class="status-pill status-dodge">Dodging</span>' : ""}
      ${fighter.disengaged ? '<span class="status-pill status-disengage">Disengaged</span>' : ""}
      ${(fighter.statusEffects ?? []).map((effect) => `<span class="status-pill status-dodge">${escapeHtml(effect.label ?? effect.id)}</span>`).join("")}
      ${fighter.hp <= 0 && !fighter.dead && heroIsStableAtZero(fighter) ? '<span class="status-pill status-dodge">Stable</span>' : ""}
      ${fighter.hp <= 0 && !fighter.dead && !heroIsStableAtZero(fighter) ? `<span class="status-pill status-dodge">Death saves ${fighter.deathSaves?.successes ?? 0}/3 | ${fighter.deathSaves?.failures ?? 0}/3</span>` : ""}
      ${fighter.dead ? '<span class="status-pill status-disengage">Dead</span>' : ""}
    </div>
    <button class="temporary-effects-button" type="button" ${temporaryEffects.length ? "" : "disabled"}>
      Temporary effects <span>${temporaryEffects.length}</span>
    </button>
    <div class="wallet-line">XP: ${fighter.xp ?? 0} / ${xpForNextLevel(fighter.level ?? 1)} - Hit Dice: ${fighter.hitDiceRemaining ?? 0}/${fighter.level ?? 1}${(fighter.spellPointMax ?? 0) > 0 ? ` - Spell Points: ${fighter.spellPoints ?? 0}/${fighter.spellPointMax ?? 0}` : ""} - Rests: ${state.shortRestsUsed ?? 0}/${state.shortRestLimit ?? 3} - Inventory: ${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>
  `;

  element.querySelector(".rename-hero").addEventListener("click", renameHero);
  element.querySelector(".open-inventory").addEventListener("click", showInventoryMenu);
  element.querySelector(".temporary-effects-button").addEventListener("click", () => showTemporaryEffectsInfo(fighter));
}

function temporaryEffectDurationText(effect) {
  if (effect.expiresAtHome) return "Until returning home";
  if (effect.expiresAtStartOfTurn) return "Until start of turn";
  if (effect.expiresAtEndOfTurn) return "Until end of turn";
  if (effect.durationRounds) return `${effect.durationRounds} round${effect.durationRounds === 1 ? "" : "s"}`;
  return "Temporary";
}

function temporaryEffectDetails(effect) {
  const parts = [];
  if (effect.acBonus) parts.push(`${abilityLabel(effect.acBonus)} AC`);
  if (effect.attackBonus) parts.push(`${abilityLabel(effect.attackBonus)} attack`);
  if (effect.damageBonus) parts.push(`${abilityLabel(effect.damageBonus)} damage`);
  if (effect.skillBonus) parts.push(`${abilityLabel(effect.skillBonus)} skill checks`);
  if (effect.saveBonus) parts.push(`${abilityLabel(effect.saveBonus)} saves`);
  if (effect.speedBonusFeet) parts.push(`${abilityLabel(effect.speedBonusFeet)} ft speed`);
  if (effect.maxHpBonus) parts.push(`${abilityLabel(effect.maxHpBonus)} max HP`);
  if (effect.extraHitDice) parts.push(`${abilityLabel(effect.extraHitDice)} hit dice`);
  if (effect.secondWindBonus) parts.push(`${abilityLabel(effect.secondWindBonus)} Second Wind use`);
  if (effect.spellPointBonus && !effect.classBonusLines?.length) parts.push(`${abilityLabel(effect.spellPointBonus)} spell points`);
  if (effect.sneakAttackDiceBonus) parts.push(`${abilityLabel(effect.sneakAttackDiceBonus)} Sneak Attack dice`);
  if (effect.classBonusLines?.length) parts.push(...effect.classBonusLines);
  if (effect.attackAdvantage) parts.push("attack advantage");
  if (effect.speedLocked) parts.push("movement locked");
  if (effect.actionLocked) parts.push("action locked");
  if (effect.resistances?.length) parts.push(`resists ${effect.resistances.join(", ")}`);
  if (effect.vulnerabilities?.length) parts.push(`vulnerable to ${effect.vulnerabilities.join(", ")}`);
  if (effect.tempHp) parts.push(`${effect.tempHp} temporary HP`);
  return parts.join("; ");
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

function showCombatantInfo(fighter) {
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
  const classFeatures = heroView
    ? Array.from(
        new Map(
          [
            ...(heroTemplate?.classFeatures ?? [])
              .filter((feature) => (feature.level ?? 1) <= (fighter.level ?? 1))
              .map((feature) => {
                const ability = fighterAbilityDefinitions(fighter).find((entry) => entry.name === feature.name);
                return [feature.name, { name: feature.name, description: feature.description ?? ability?.description ?? "" }];
              }),
            ...fighterAbilityDefinitions(fighter)
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
          ${
            racialTraits.length || classFeatures.length
              ? `
                <section class="inspect-section">
                  <h3>Traits</h3>
                  ${racialTraits.map((trait) => `<p><b>Racial</b> ${escapeHtml(trait)}</p>`).join("")}
                  ${classFeatures
                    .map(
                      (feature) =>
                        `<p><b>${escapeHtml(feature.name)}</b>${feature.description ? ` ${escapeHtml(feature.description)}` : ""}</p>`,
                    )
                    .join("")}
                </section>
              `
              : ""
          }
          ${
            spells.length
              ? `
                <section class="inspect-section">
                  <h3>Spells</h3>
                  ${spells.map((spell) => `<p><b>${escapeHtml(spell.name)}</b>${spell.description ? ` ${escapeHtml(spell.description)}` : ""}</p>`).join("")}
                </section>
              `
              : ""
          }
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
  const objectLocked = !isHomeChest && object.locked === true;
  const canLootObject = (objectHasLoot(object) || isHomeChest || isHomePlacedContainer) && objectAdjacent && canActInCombat && !objectLocked;
  const heroTriedLock = Boolean(object.lockAttemptsByHero?.[hero.id]);
  const canPickLock = objectLocked && objectAdjacent && canActInCombat && !heroTriedLock;
  const disarmTarget = object.trap ?? object;
  const heroTriedDisarm = Boolean(disarmTarget.disarmAttemptsByHero?.[hero.id]);
  const canDisarm =
    state.mode !== "combat" &&
    objectAdjacent &&
    ((objectIsTrap(object) && object.detected && object.armed !== false && !object.disarmed) ||
      object.trap?.detected) &&
    !heroTriedDisarm;
  const canInvestigate = state.mode !== "combat" && objectCanInspect(object) && objectAdjacent && !object.investigated;
  const captive = captiveCreatureComponent(object);
  const canFreeCaptive = canFreeCaptiveObject(object);
  const captiveName = captiveCreatureLabel(object);
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
      object.type === "home-bookshelf"
        ? `<div class="object-actions">
            <button type="button" data-action="open-monster-compendium">Open Compendium</button>
            <button type="button" data-action="open-library-tutorial" data-topic="homeExpansion">Home Expansion Guide</button>
            <button type="button" data-action="open-library-tutorial" data-topic="comfortZones">Comfort Zones Guide</button>
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
      captive
        ? `<p class="empty-note">A ${escapeHtml(captiveName)} is trapped inside. Freeing it requires ${escapeHtml(skillName(captive.skill ?? "animal-handling"))} DC ${captive.dc ?? 13}; failure releases it hostile.</p>
           <button type="button" data-action="free-captive" data-object="${escapeAttribute(object.id)}" ${canFreeCaptive ? "" : "disabled"}>Free ${escapeHtml(captiveName)}</button>`
        : object.captiveFreed
          ? `<p class="empty-note">The crate is open and empty.</p>`
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
        ? `<p class="empty-note">Locked. Contents hidden until the lock is picked.</p>
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
        ? `<button type="button" data-action="disarm-trap" data-object="${escapeAttribute(object.id)}" ${canDisarm ? "" : "disabled"}>Disarm</button>`
        : ""
    }
    ${
      objectHasLoot(object) && !isHomePlacedContainer && !objectLocked
        ? `
          ${
            object.trap?.detected
              ? `<button type="button" data-action="disarm-trap" data-object="${escapeAttribute(object.id)}" ${canDisarm ? "" : "disabled"}>Disarm ${escapeHtml(
                  object.trap.name,
                )}</button>`
              : ""
          }
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
        ${object.trap?.detected ? `<div class="stat-pill"><b>${object.trap.spotDc ?? 12}</b><span>Trap DC</span></div>` : ""}
        ${object.lockDc ? `<div class="stat-pill"><b>${object.locked ? "Locked" : "Open"}</b><span>Lock</span></div>` : ""}
        ${object.lockDc ? `<div class="stat-pill"><b>${object.lockDc}</b><span>Lock DC</span></div>` : ""}
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
let homeBuilderSnapshot = null;
let homeMoveSelection = null;
let homePaintPointerId = null;
let homeComfortRangePreviewKeys = new Set();
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

function homeObjectOverlaps(type, position, ignoreId = null) {
  const template = objectTemplate(type);
  if (!template) return true;
  const width = template.width ?? 1;
  const height = template.height ?? 1;
  const keys = homeCellKeys();
  const cells = Array.from({ length: width * height }, (_, index) => ({ x: position.x + (index % width), y: position.y + Math.floor(index / width) }));
  if (cells.some((cell) => !keys.has(positionKey(cell)))) return true;
  return (state.dungeonObjects ?? []).some((object) => object.id !== ignoreId && objectCells({ ...object, type: object.type }).some((cell) => cells.some((candidate) => positionKey(candidate) === positionKey(cell))));
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
    keys.add(positionKey(fighter.position));
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

function homeFurnitureCatalogueEntries() {
  const query = homeBuildSearch.trim().toLowerCase();
  return window.DungeonContent
    .list("furniture")
    .filter((entry) => entry.kind !== "trap")
    .filter(homeCatalogueEntryVisible)
    .filter((entry) => !query || `${entry.name} ${entry.id} ${(entry.tags ?? []).join(" ")}`.toLowerCase().includes(query))
    .slice(0, 72);
}

function homeFurnitureCatalogue() {
  const groups = new Map([
    ["homeUtility", { label: "Home Utility", entries: [] }],
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
  const normalizedPaintColor = normalizeHomeColor(homeBuildPaintColor) ?? homePaintPalette[0];
  const showPaintTools = ["paintFloor", "paintWall"].includes(homeBuildTool);
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
    ${
      showPaintTools
        ? `<section class="home-paint-tools" aria-label="Paint colors">
            <div class="home-paint-swatches">
              ${homePaintPalette
                .map(
                  (color) => `
                    <button type="button" data-action="home-paint-color" data-color="${escapeAttribute(color)}" class="${normalizedPaintColor === color ? "active" : ""}" style="--swatch-color: ${escapeAttribute(color)}" aria-label="Use color ${escapeAttribute(color)}"></button>
                  `,
                )
                .join("")}
            </div>
            <label class="home-color-picker">
              <span>Custom</span>
              <input id="home-paint-color" type="color" value="${escapeAttribute(normalizedPaintColor)}" />
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
    if (!cells.has(key) || homeObjectOverlaps(homeBuildFurnitureId, position)) {
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
      if (!object || homeObjectOverlaps(object.type, position, object.id)) {
        addLog("That furniture needs open home floor.", "important");
        return true;
      }
      object.position = { ...position };
    }
    homeMoveSelection = null;
  } else if (homeBuildTool === "paintFloor") {
    if (!cells.has(key)) return true;
    const color = normalizeHomeColor(homeBuildPaintColor);
    state.home.floorColors = { ...(state.home.floorColors ?? {}) };
    if (color) state.home.floorColors[key] = color;
  } else if (homeBuildTool === "paintWall") {
    const edge = homeDoorEdgeFromEvent(position, event);
    if (!homeWallEdgeExists(position, edge, cells)) return true;
    const color = normalizeHomeColor(homeBuildPaintColor);
    state.home.wallColors = { ...(state.home.wallColors ?? {}) };
    if (color) state.home.wallColors[homeWallEdgeKey(position, edge)] = color;
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
        body: "Use the home door or Move Out menu to open Build Your Home. The menu stays on the left while the home map remains clickable.",
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

  const position = nearestOpenCellAroundObject(object);
  if (!position) {
    object.lastResult = `There is no room to free ${template.name}.`;
    addLog(object.lastResult, "important");
    showDungeonObjectInfo(object);
    return;
  }

  const rollResult = rollD20ForFighter(hero);
  const roll = rollResult.roll;
  const guidance = guidanceSkillBonus();
  const skillId = component.skill ?? "animal-handling";
  const ability = component.ability ?? skillDefinitions[skillId]?.ability ?? "wis";
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

function showPlanningTableInfo() {
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
          <span>${hero ? `${hero.dead ? "Dead" : `Level ${hero.level ?? 1} ${hero.className ?? "Hero"}`}${index === 0 ? " - Main" : ""}` : "Add a hero from the roster"}</span>
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
          return `
            <div class="planning-slot bench-slot">
              <div>
                <b>${escapeHtml(hero.name)}</b>
                <span>${hero.dead ? "Dead" : classHero ? `Level ${hero.level ?? 1} ${hero.className ?? "Hero"}` : `${escapeHtml(hero.className ?? "Ally")}${hero.companionControl === "ai" ? " - AI controlled" : " - Player controlled"}`}</span>
              </div>
              ${classHero ? `<select data-action="party-role" data-hero="${escapeAttribute(hero.id)}">${roleOptionsMarkup(partyRoleFor(hero))}</select>` : ""}
              <button type="button" data-action="add-party-hero" data-hero="${escapeAttribute(hero.id)}" ${(classHero && activeClassIds.length >= 4) || hero.dead ? "disabled" : ""}>Add</button>
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
      <h3>D20 Luck</h3>
      <label class="inline-transfer">
        <span>Friendly d20 rolls</span>
        <select data-action="d20-mode">${d20ModeOptionsMarkup()}</select>
      </label>
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
  hero.id = heroId;
  hero.token = tokenFromName(hero.name, hero.token);
  hero.partyRole = defaultPartyRoleForHero(hero);
  const rosterIds = new Set(state.party.rosterIds ?? state.party.heroIds ?? ["hero"]);
  rosterIds.add(heroId);
  state.party.rosterIds = Array.from(rosterIds);
  state.fighters[heroId] = prepareRestedHero(hero, homeHeroPositions(state.party.rosterIds).find((entry) => entry.id === heroId)?.position ?? { x: 4, y: 6 });
  roomIsBuilt = false;
  addLog(`${hero.name} joins the roster.`, "important");
  render();
  showPlanningTableInfo();
}

function addHeroToParty(heroId) {
  const hero = state.fighters[heroId];
  if (!hero || hero.dead || isPartyHeroId(heroId)) return;
  if (isClassHero(hero) && activeClassHeroIds().length >= 4) return;
  state.party.heroIds = [...(state.party.heroIds ?? ["hero"]), heroId];
  state.party.activeHeroId = state.party.activeHeroId ?? heroId;
  addLog(`${state.fighters[heroId].name} joins the active party.`, "important");
  render();
  showPlanningTableInfo();
}

function removeHeroFromParty(heroId) {
  if (isClassHero(state.fighters[heroId]) && activeClassHeroIds().length <= 1) return;
  state.party.heroIds = (state.party.heroIds ?? ["hero"]).filter((id) => id !== heroId);
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
  addLog(`D20 luck set to ${d20ModeLabels[nextMode]}.`, "important");
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

  object.items = (object.items ?? []).filter((entry) => entry.id !== itemId);
  addItemToInventory(hero, item, "object-stack");
  addLog(`${hero.name} takes ${item.name} from ${objectTemplate(object.type)?.name ?? "the feature"}.`, "important");
  render();
  showDungeonObjectInfo(object);
}

function pickObjectLock(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  if (!object || !object.locked) return;
  if (
    (state.mode === "combat" && activeFighter()?.id !== hero.id) ||
    !objectCells(object).some((cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1)
  ) {
    addLog(`${hero.name} needs to be next to ${objectTemplate(object.type)?.name ?? "it"} to pick the lock${state.mode === "combat" ? " on their turn" : ""}.`);
    renderLog();
    return;
  }

  const rollResult = rollD20ForFighter(hero);
  const roll = rollResult.roll;
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

  const rollResult = rollD20ForFighter(hero);
  const roll = rollResult.roll;
  const bonus = skillCheckBonus(hero, "int", "disarm");
  const guidance = guidanceSkillBonus();
  const total = roll + bonus + guidance;
  const dc = trap.spotDc ?? 12;
  trap.disarmAttemptsByHero[hero.id] = true;
  const guidanceText = guidance ? ` + Guidance ${guidance}` : "";
  const attemptText = `${hero.name} attempts to disarm the trap: INT ${roll} ${abilityLabel(bonus)}${guidanceText} = ${total} vs DC ${dc}.`;
  object.lastResult = attemptText;
  addLog(attemptText, "important");
  addAdminCheckLog({ actor: hero, label: "Disarm check", target: objectTemplate(object.type)?.name ?? "trap", rollResult, bonus, guidance, total, dc, success: roll !== 1 && total >= dc, note: roll === 1 ? "natural 1 triggers trap" : "" });
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
    if (object.trap) {
      delete object.trap;
    } else {
      trap.disarmed = true;
      trap.armed = false;
      trap.spent = false;
    }
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

function nearestOpenCellAroundObject(object) {
  const startCells = objectCells(object);
  const walkable = currentWalkable();
  const queue = startCells.flatMap((cell) => adjacentCells(cell).map((position) => ({ position, distance: 1 })));
  const visited = new Set(startCells.map(positionKey));

  while (queue.length > 0) {
    const current = queue.shift();
    const key = positionKey(current.position);
    if (visited.has(key)) continue;
    visited.add(key);

    if (
      walkable.has(key) &&
      !window.DungeonGrid.isOccupied(current.position, state.fighters) &&
      window.DungeonGrid.isInsideGrid(current.position, currentGridSize())
    ) {
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
      .map((fighter) => positionKey(fighter.position)),
  ]);
  const position = objectRoom
    ? safeRoomSpawnCell(objectRoom, activeHero().position, blockedKeys, currentGridSize(), spawnFloorKeysForDungeon())
    : nearestOpenCellAroundObject(object);
  if (!position) {
    addLog("Something stirs nearby, but there is no space for it to emerge.");
    object.lastResult = "Something stirs nearby, but there is no space for it to emerge.";
    return null;
  }

  const monsterTemplate = getMonsterTemplate(pickWeightedMonsterId(weightedMonsterIdsForHero(activeHero())));
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
    return true;
  }
  return false;
}

function investigateObject(objectId) {
  const object = dungeonObjectForId(objectId);
  const hero = activeHero();
  const template = object ? objectTemplate(object.type) : null;
  if (!object || !objectCanInspect(object) || object.investigated || state.mode === "combat") return;
  if (!objectCells(object).some((cell) => Math.max(Math.abs(hero.position.x - cell.x), Math.abs(hero.position.y - cell.y)) === 1)) return;

  object.investigated = true;
  const hiddenLoot = objectComponent(object, "hiddenLoot") ?? objectComponent(object, "harvestableResource");
  const ambush = objectComponent(object, "ambushOnInspect");
  const inspectDc = hiddenLoot?.dc ?? template.inspectDc ?? template.spotDc ?? 13;
  const rollResult = rollD20ForFighter(hero);
  const roll = rollResult.roll;
  const bonus = skillCheckBonus(hero, "int", "investigation");
  const guidance = guidanceSkillBonus();
  const total = roll + bonus + guidance;
  recordD20OutcomeForFighter(hero, total >= inspectDc);
  const guidanceText = guidance ? ` + Guidance ${guidance}` : "";
  const checkText = `${hero.name} investigates ${template.name}: INT ${roll} ${abilityLabel(bonus)}${guidanceText} = ${total} vs DC ${inspectDc}.`;
  object.lastResult = checkText;
  addLog(checkText, "important");
  addAdminCheckLog({ actor: hero, label: "Investigation check", target: template.name, rollResult, bonus, guidance, total, dc: inspectDc, success: total >= inspectDc, note: hiddenLoot ? "hidden loot/resource possible" : ambush ? "ambush trigger possible" : "generic inspection" });

  const ambushOnNaturalOne = ambush && (ambush.trigger === "natural1" || ambush.naturalOne);
  const ambushByChance = ambush && !ambushOnNaturalOne && Math.random() < (ambush.chance ?? 1);
  if ((roll === 1 && (ambushOnNaturalOne || !ambush)) || ambushByChance) {
    spawnInvestigationAmbush(object);
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
  els.fighterInfo.classList.remove("home-builder-dock");
  els.fighterInfo.classList.add("hidden");
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

function itemDetails(item) {
  if (!item) return "Empty";
  const cost = item.cost?.text ? `; ${item.cost.text}` : "";
  const weight = item.weightLb || item.weightLb === 0 ? `; ${item.weightLb} lb.` : "";
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
    if (item.use?.kind === "healing") {
      return `${item.use.dice.count}d${item.use.dice.sides} + ${item.use.bonus} HP; ${item.use.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
    }
    if (item.use?.status) {
      const status = item.use.status;
      const parts = [];
      if (status.acBonus) parts.push(`${abilityLabel(status.acBonus)} AC`);
      if (status.attackBonus) parts.push(`${abilityLabel(status.attackBonus)} attack`);
      if (status.damageBonus) parts.push(`${abilityLabel(status.damageBonus)} damage`);
      if (status.saveBonus) parts.push(`${abilityLabel(status.saveBonus)} saves`);
      if (status.speedBonusFeet) parts.push(`${abilityLabel(status.speedBonusFeet)} ft speed`);
      if (status.resistances?.length) parts.push(`resist ${status.resistances.join(", ")}`);
      const duration = status.expiresAtHome ? "until home" : status.durationRounds ? `${status.durationRounds} rounds` : "temporary";
      return `${parts.join("; ") || item.category || "Consumable"}; ${duration}; ${item.use?.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
    }
    return `${item.category ?? "Consumable"}; ${item.use?.resource === "bonusAction" ? "bonus action" : "action"}${chargeText}${cost}${weight}${starterText}`;
  }
  if (item.type === "accessory") return `${magicText.replace(/^; /, "") || item.loot?.rarity || "magic"}${chargeText}${cost}${weight}${starterText}`;
  if (item.type === "treasure") return `${item.treasure?.kind ?? item.category ?? "treasure"}; value ${item.cost?.text ?? priceText(item.treasure?.valueCp ?? 0)}${weight}${starterText}`;
  return item.type ?? "Item";
}

function itemInventoryText(item) {
  const description = item?.magic?.description || item?.treasure?.description || item?.description;
  const starterWarning = item?.starterEquipment ? " Starter equipment has no resale value." : "";
  const proficiencyWarning = missingProficiencyText(activeHero(), item);
  if (!description) return itemDetails(item);
  const chargeText = item.use?.charges ? ` Charges ${item.use.charges.remaining ?? item.use.charges.max}/${item.use.charges.max} (${item.use.charges.refresh}).` : "";
  return `${description}${chargeText}${starterWarning}${proficiencyWarning ? ` ${proficiencyWarning}` : ""}`;
}

function itemInventoryMarkup(item) {
  const description = item?.magic?.description || item?.treasure?.description || item?.description;
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
  if (magic.attackBonus) parts.push(`+${magic.attackBonus} attack`);
  if (magic.damageBonus) parts.push(`+${magic.damageBonus} damage`);
  if (effects.acBonus) parts.push(`+${effects.acBonus} AC`);
  if (effects.maxHpBonus) parts.push(`+${effects.maxHpBonus} max HP`);
  if (effects.speedBonusFeet) parts.push(`${abilityLabel(effects.speedBonusFeet)} ft speed`);
  if (effects.initiativeBonus) parts.push(`${abilityLabel(effects.initiativeBonus)} initiative`);
  for (const [ability, value] of Object.entries(effects.abilityScoreBonuses ?? {})) parts.push(`${ability.toUpperCase()} ${abilityLabel(value)}`);
  for (const [ability, value] of Object.entries(effects.abilityScorePenalties ?? {})) parts.push(`${ability.toUpperCase()} ${abilityLabel(value)}`);
  const resistances = [...(effects.resistances ?? []), ...(magic.resistances ?? [])];
  const vulnerabilities = [...(effects.vulnerabilities ?? []), ...(magic.vulnerabilities ?? [])];
  if (resistances.length) parts.push(`resist ${resistances.join(", ")}`);
  if (vulnerabilities.length) parts.push(`vulnerable ${vulnerabilities.join(", ")}`);
  const extraDamage = [...(effects.extraDamage ?? []), ...(magic.extraDamage ?? [])];
  if (extraDamage.length) parts.push(`extra ${extraDamage.map((entry) => `${entry.count}d${entry.sides} ${entry.type}`).join(", ")}`);
  if (magic.curse || effects.vulnerabilities?.length) parts.push("cursed");
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

function renderAdminModeTools() {
  if (!adminEnabled()) return "";

  return `
    <section class="admin-catalog" aria-label="Admin controls">
      <div class="admin-coin-row" aria-label="Admin toggles">
        <button class="admin-toggle ${adminTeleportEnabled ? "active" : ""}" type="button" data-action="toggle-admin-teleport">
          ${adminTeleportEnabled ? "Teleport On" : "Teleport Off"}
        </button>
        <button class="admin-toggle ${adminGodMode ? "active" : ""}" type="button" data-action="toggle-admin-god">
          ${adminGodMode ? "God Mode On" : "God Mode Off"}
        </button>
        <button type="button" data-action="admin-heal">Full Heal</button>
        <button type="button" data-action="admin-refresh">Refresh Actions</button>
        <button type="button" data-action="admin-reveal-current-room">Reveal Room</button>
        <button type="button" data-action="admin-clear-combat">Clear Combat</button>
      </div>
    </section>
    ${renderAdminMonsterCatalog()}
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

function freeAdminSpawnPosition() {
  const hero = activeHero();
  const room = roomForPosition(hero.position);
  const visibleCells = Array.from(visibleWalkable()).map(positionFromKey);
  const blockedKeys = new Set([
    ...blockingObjectKeys(),
    ...Object.values(state.fighters)
      .filter((fighter) => fighter.alive)
      .map((fighter) => positionKey(fighter.position)),
  ]);
  const candidates = room ? roomSpawnCells(room, blockedKeys, currentGridSize(), spawnFloorKeysForDungeon()) : visibleCells;
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
      !window.DungeonGrid.isOccupied(position, state.fighters),
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
  const position = template ? freeAdminSpawnPosition() : null;
  if (!template || !position) {
    addLog("Admin: no open space for that monster.", "important");
    render();
    renderInventoryMenu();
    return;
  }

  const spawnRoom = roomForPosition(position);
  const hero = activeHero();
  const spawnCount = template.behavior === "swarm" && spawnRoom ? swarmSpawnCount(template, hero) : 1;
  const blockedKeys = new Set([...blockingObjectKeys(), ...Object.values(state.fighters).filter((fighter) => fighter.alive).map((fighter) => positionKey(fighter.position))]);
  const positions = spawnRoom ? clusteredSpawnCells(spawnRoom, spawnCount, hero.position, blockedKeys, currentGridSize(), spawnFloorKeysForDungeon()) : [position];
  const spawned = positions.slice(0, Math.min(spawnCount, positions.length)).map((spawnPosition, index) => {
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
    return monster;
  });
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

function createAdminInventoryItem(templateId) {
  return createItemInstance(templateId, "admin");
}

function addAdminItemToInventory(templateId) {
  const hero = activeHero();
  const item = createAdminInventoryItem(templateId);
  if (!item) return;

  addItemToInventory(hero, item, "admin-stack");
  addLog(`Added ${item.name} to inventory.`, "important");
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
      const disabledReason =
        item.type === "armor" && !armorStrengthRequirementMet(fighter, item)
          ? `Requires STR ${item.requirements.strength}`
          : item.type === "armor" && !heroHasArmorProficiency(fighter, item)
            ? "Missing proficiency"
          : "";
      return disabledReason
        ? `<button type="button" disabled>${disabledReason}</button>`
        : `<button type="button" data-action="equip" data-item="${item.id}" data-slot="${slot.id}">${slot.label}</button>`;
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

function draggableItemCard(item, source = "") {
  if (!item) return `<span class="equipment-empty">Empty</span>`;

  return `
    <div class="equipment-item" draggable="true" data-drag-item="${item.id}" data-drag-source="${source}">
      <b>${escapeHtml(item.name)}</b>
      <span>${itemInventoryMarkup(item)}</span>
      <button type="button" data-action="inspect-item" data-item="${escapeAttribute(item.id)}">Inspect</button>
    </div>
  `;
}

function renderInventoryMenu() {
  const fighter = activeHero();
  refreshDerivedStats(fighter);
  const equippedIds = new Set(Object.values(fighter.equipment).filter(Boolean));
  const carriedItems = fighter.inventory.items.filter((item) => !equippedIds.has(item.id));
  const chestItems = state.chest ?? [];
  const chestMoney = normalizeMoney(state.chestMoney ?? {});

  els.inventoryBody.innerHTML = `
    <div class="inventory-stats">
      ${combatantArtworkMarkup(fighter, "inventory-hero-art")}
      <div class="stat-pill"><b>${fighter.ac}</b><span>AC</span></div>
      <div class="stat-pill"><b>${abilityLabel(attackBonus(fighter))}</b><span>To Hit</span></div>
      <div class="stat-pill"><b>${escapeHtml(fighter.damage.label)}</b><span>Damage</span></div>
      ${
        adminEnabled()
          ? `<button class="admin-toggle ${inventoryAdminOpen ? "active" : ""}" type="button" data-action="toggle-admin">
              ${inventoryAdminOpen ? "Hide Vault" : "Item Vault"}
            </button>`
          : ""
      }
      <div class="wallet-line">${escapeHtml(moneyText(fighter.inventory.money))} - Hero Tokens: ${fighter.inventory.heroTokens ?? 0}</div>
    </div>
    ${renderAdminModeTools()}
    ${renderAdminItemCatalog()}
    <section class="paper-doll" aria-label="Equipment slots">
      ${equipmentSlots
        .map((slot) => {
          const item = equippedItem(fighter, slot.id);
          return `
            <div class="equipment-slot ${slotLayoutClass(slot.id)}" data-drop-slot="${slot.id}">
              <div class="slot-label">
                <b>${slot.label}</b>
              </div>
              ${draggableItemCard(item, slot.id)}
              <button type="button" data-action="unequip" data-slot="${slot.id}" ${item ? "" : "disabled"}>Unequip</button>
            </div>
          `;
        })
        .join("")}
    </section>
    <section class="inventory-list" data-drop-inventory="true" aria-label="Carried items">
      <h3>Carried Items</h3>
      ${
        carriedItems.length
          ? carriedItems
              .map(
                (item) => `
                  <div class="inventory-item">
                    ${draggableItemCard(item, "inventory")}
                    <div class="equip-actions">
                      ${equipActionForItem(fighter, item)}
                      ${transferControlsForItem(fighter, item)}
                    </div>
                  </div>
                `,
              )
              .join("")
          : `<p class="empty-note">No carried items outside equipped gear.</p>`
      }
    </section>
    ${
      state.mode === "home"
        ? `
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
            ${
              chestItems.length
                ? chestItems
                    .map(
                      (item) => `
                        <div class="inventory-item">
                          ${draggableItemCard(item, "chest")}
                        </div>
                      `,
                    )
                    .join("")
                : `<p class="empty-note">Drop items here to leave them at home.</p>`
            }
          </section>
        `
        : ""
    }
  `;
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
    .filter((hero) => distance(source.position, hero.position) <= maxSquares);
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

function itemHasCharges(item) {
  ensureItemCharges(item);
  return !item?.use?.charges || (item.use.charges.remaining ?? 0) > 0;
}

function spendItemCharge(item) {
  ensureItemCharges(item);
  if (!item?.use?.charges) return true;
  if ((item.use.charges.remaining ?? 0) <= 0) return false;
  item.use.charges.remaining -= 1;
  return true;
}

function refreshItemChargesForFighter(fighter, refresh) {
  for (const item of fighter?.inventory?.items ?? []) {
    if (item.use?.charges?.refresh === refresh) item.use.charges.remaining = item.use.charges.max ?? 1;
  }
}

function refreshPartyItemCharges(refresh) {
  rosterHeroes().forEach((hero) => refreshItemChargesForFighter(hero, refresh));
}

function canUseBeltItem(fighter, item) {
  if (!fighter || !item || !heroCanAct(fighter)) return false;
  if (!itemHasCharges(item)) return false;
  if (state.mode !== "combat") return true;
  const resource = itemUseResource(item);
  return resource === "bonusAction" ? fighter.hasBonusAction : fighter.hasAction;
}

function canUseHealingItemOnTarget(actor, item, target) {
  if (!actor || !target || !item || item.use?.kind !== "healing") return false;
  if (!itemHasCharges(item)) return false;
  if (!heroCanAct(actor) || target.dead || target.hp > 0) return false;
  if (!isPartyHeroId(actor.id) || !isPartyHeroId(target.id) || actor.id === target.id) return false;
  if (state.mode === "combat" && !actor.hasAction) return false;
  return hasMeleeAccess(actor, target);
}

function dyingPotionTargets(actor, item) {
  if (item?.use?.kind !== "healing") return [];
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
                  <span>${escapeHtml(slot.label)} - ${escapeHtml(itemDetails(item))}</span>
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
        `<button type="button" data-action="combat-action" data-combat-action="medicine" data-target="${target.id}" ${fighter.hasAction ? "" : "disabled"}>Medicine: ${escapeHtml(target.name)}</button>`,
    )
    .join("");
}

function renderActionMenu() {
  const fighter = activeFighter();
  const canUseAttackAction = Boolean(fighter?.hasAction);
  els.actionMenuBody.innerHTML = fighter && heroCanAct(fighter) && state.mode === "combat"
    ? `
      <div class="action-options">
        <button type="button" data-action="combat-action" data-combat-action="dash" ${canUseAttackAction ? "" : "disabled"}>Dash</button>
        <p>Gain extra movement equal to your base movement. Consumes your Attack action.</p>
        <button type="button" data-action="combat-action" data-combat-action="dodge" ${canUseAttackAction ? "" : "disabled"}>Dodge</button>
        <p>Attacks against you have disadvantage until your next turn. Consumes your Attack action.</p>
        <button type="button" data-action="combat-action" data-combat-action="disengage" ${canUseAttackAction ? "" : "disabled"}>Disengage</button>
        <p>Your movement does not trigger opportunity attacks this turn. Consumes your Attack action.</p>
        <button type="button" data-action="combat-action" data-combat-action="offHandAttack" ${canOffHandAttack(fighter) ? "" : "disabled"}>Off-Hand Attack</button>
        <p>Attack with a light off-hand weapon. Consumes your Bonus action and does not add STR or DEX to damage.</p>
        <button type="button" data-action="combat-action" data-combat-action="getBehind" ${fighter.hasBonusAction ? "" : "disabled"}>Get Behind</button>
        <p>DEX check DC 12. On success, spend your Bonus action to move through monsters this turn.</p>
        ${medicineTargetsMarkup(fighter)}
        <p>WIS check DC 10 to stabilize an adjacent dying hero. Consumes your Attack action.</p>
      </div>
    `
    : `<p class="empty-note">No action options available.</p>`;
}

function showActionMenu() {
  renderActionMenu();
  els.actionMenu.classList.remove("hidden");
}

function hideActionMenu() {
  els.actionMenu.classList.add("hidden");
}

function useCombatAction(action, targetId = null) {
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
    addLog(`${fighter.name} uses Dash and gains ${baseMovement} extra movement.`, "important");
  }

  if (action === "dodge") {
    fighter.dodging = true;
    fighter.hasAction = false;
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

function availableFighterAbilities(fighter = state.fighters.hero) {
  ensureFighterAbilityState(fighter);
  return fighter.abilities.filter((ability) => (fighter.level ?? 1) >= (ability.level ?? 1));
}

function canUseFighterAbility(fighter, ability) {
  return !fighterAbilityUnavailableReason(fighter, ability);
}

function fighterAbilityUnavailableReason(fighter, ability) {
  if (!heroCanAct(fighter) || !ability) return "Unable to act.";
  if (ability.id === "wildShape" && isWildShaped(fighter)) {
    if (state.mode === "combat" && activeFighter()?.id !== fighter.id) return "Not this hero's turn.";
    if (state.mode === "combat" && ability.resource === "bonusAction" && !fighter.hasBonusAction) return "Bonus action already used.";
    return "";
  }
  if ((fighter.abilityUses?.[ability.id] ?? 0) >= abilityMaxUses(fighter, ability)) return "No uses remaining.";
  if (ability.id === "rage" && fighterWearsHeavyArmor(fighter)) return "Cannot rage while wearing heavy armor.";
  if (ability.id === "layOnHands" && !partyHeroes().some((target) => !target.dead && (target.id === fighter.id || hasMeleeAccess(fighter, target)) && (target.hp ?? 0) < (target.maxHp ?? 0))) {
    return "No wounded adjacent hero.";
  }
  if (ability.id === "actionSurge" && state.mode !== "combat") return "Only usable in combat.";
  if (ability.id === "uncannyDodge") return "Triggers as a reaction when this hero is hit.";
  if (ability.id === "indomitable") return "Triggers automatically when this companion fails a saving throw.";
  if (ability.id === "goliathStoneEndurance") return "Triggers as a reaction when this hero takes damage.";
  if (ability.id === "steadyAim" && state.mode !== "combat") return "Only usable in combat.";
  if (ability.id === "steadyAim" && ((fighter.lastMoveFeet ?? 0) > 0 || (fighter.movementLeft ?? 0) < Math.floor(fighter.speedFeet / feetPerSquare))) return "Steady Aim requires not moving this turn.";
  if (ability.id === "eldritchBlast" && state.mode !== "combat") return "Only usable in combat.";
  if (ability.id === "eldritchBlast" && visibleMonsters().length === 0) return "No visible target.";
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

function renderAbilitiesMenu() {
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  const entries = availableFighterAbilities(hero);
  const spells = spellDefinitionsForFighter(hero);
  els.abilitiesBody.innerHTML = entries.length || spells.length
    ? `
      <div class="use-item-list">
        ${entries
          .map((ability) => {
            const used = hero.abilityUses?.[ability.id] ?? 0;
            const maxUses = abilityMaxUses(hero, ability);
            const unavailableReason = fighterAbilityUnavailableReason(hero, ability);
            const disabled = unavailableReason ? "disabled" : "";
            const buttonLabel = ability.id === "wildShape" && isWildShaped(hero) ? "Revert" : "Use";
            return `
              <div class="use-item-row">
                <div>
                  <b>${escapeHtml(ability.name)}</b>
                  <span>${escapeHtml(ability.description)} Uses: ${used}/${maxUses}.</span>
                  ${unavailableReason ? `<small class="ability-warning">${escapeHtml(unavailableReason)}</small>` : ""}
                </div>
                <button type="button" data-action="use-fighter-ability" data-ability="${escapeAttribute(ability.id)}" ${disabled}>${buttonLabel}</button>
              </div>
            `;
          })
          .join("")}
        ${spells
          .map((spell) => {
            const castLevels = spellAvailableCastLevels(hero, spell);
            const castButtons = castLevels
              .map((castLevel) => {
                const castSpell = spellWithCastLevel(spell, castLevel);
                const disabled = canCastSpell(hero, castSpell) ? "" : "disabled";
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
                  <b>${escapeHtml(spell.name)} <small>${escapeHtml(levelText)}</small></b>
                  <span>${escapeHtml(spell.description)} ${escapeHtml(spellResourceLabel(spell))}.${concentration} Costs: ${escapeHtml(costText)}. Spell points: ${hero.spellPoints ?? 0}/${hero.spellPointMax ?? 0}.</span>
                </div>
                <div class="use-item-actions">${castButtons}</div>
              </div>
            `;
          })
          .join("")}
      </div>
    `
    : `<p class="empty-note">No extra abilities or spells available yet.</p>`;
}

function showAbilitiesMenu() {
  renderAbilitiesMenu();
  els.abilitiesMenu.classList.remove("hidden");
}

function hideAbilitiesMenu() {
  els.abilitiesMenu.classList.add("hidden");
}

function showHomeMenu() {
  const hero = activeHero();
  const canTrain = canTrainAsSidekick(hero);
  els.levelPanel?.classList.toggle("hidden", isAutonomousAlly(hero));
  els.levelUp.textContent = canTrain ? "Train" : "Level Up";
  els.levelUp.disabled = !canTrain && !canLevelUp(hero);
  const barrowCompleted = state.campaignProgress?.["barrow-crown"] ?? 0;
  const thornwoodCompleted = state.campaignProgress?.["thornwood-pact"] ?? 0;
  els.goBarrowCrown?.querySelector("[data-campaign-progress]")?.replaceChildren(document.createTextNode(`${barrowCompleted}/7`));
  els.goThornwoodPact?.querySelector("[data-campaign-progress]")?.replaceChildren(document.createTextNode(`${thornwoodCompleted}/8`));
  els.homeMenu.classList.remove("hidden");
}

function hideHomeMenu() {
  els.homeMenu.classList.add("hidden");
}

function storeStockItems() {
  const query = storeSearch.trim().toLowerCase();
  return window.DungeonContent.list("items")
    .filter((item) => ["weapon", "armor", "ammunition"].includes(item.type) || item.id === "potion-healing")
    .filter((item) => item.store?.buyable !== false && !item.tags?.includes("loot:magic") && item.type !== "treasure")
    .filter((item) => !query || searchableItemText(item).includes(query) || itemDetails(item).toLowerCase().includes(query))
    .sort((a, b) => itemCategoryLabel(a).localeCompare(itemCategoryLabel(b)) || a.name.localeCompare(b.name));
}

function renderStoreMenu() {
  const hero = activeHero();
  const equippedIds = new Set(Object.values(hero.equipment).filter(Boolean));
  const query = storeSearch.trim().toLowerCase();
  const sellableItems = hero.inventory.items
    .filter((item) => !equippedIds.has(item.id))
    .filter((item) => !query || searchableItemText(item).includes(query) || itemDetails(item).toLowerCase().includes(query));
  els.storeBody.innerHTML = `
    <div class="store-wallet">${escapeHtml(moneyText(hero.inventory.money))}</div>
    <label class="store-search" for="store-search">
      <span>Search</span>
      <input id="store-search" type="search" placeholder="Search store" value="${escapeAttribute(storeSearch)}" />
    </label>
    <section class="store-section">
      <h3>Buy</h3>
      <div class="store-list">
        ${storeStockItems()
          .map((item) => {
            const price = itemValueCp(item);
            return `
              <div class="store-row">
                <div>
                  <b>${escapeHtml(item.name)}</b>
                  <span>${escapeHtml(itemDetails(item))} - ${escapeHtml(priceText(price))}</span>
                </div>
                <button type="button" data-action="buy-store-item" data-item="${item.id}" ${moneyToCp(hero.inventory.money) >= price ? "" : "disabled"}>Buy</button>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
    <section class="store-section">
      <h3>Sell</h3>
      <div class="store-list">
        ${
          sellableItems.length
            ? sellableItems
                .map((item) => {
                  const price = itemSellValueCp(item);
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
            : `<p class="empty-note">No carried items to sell.</p>`
        }
      </div>
    </section>
  `;
}

function showStoreMenu() {
  hideHomeMenu();
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

  const price = itemValueCp(template);
  if (template.store?.buyable === false || template.tags?.includes("loot:magic") || template.type === "treasure") return;
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
  hero.inventory.items = hero.inventory.items.filter((entry) => entry.id !== itemId);
  const saleValue = itemSellValueCp(item);
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
  if (abilityScoreImprovementLevelsForClass(hero.classId).has(level)) features.push("Ability Score Improvement");
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

function sidekickHasWeaponTrainingStatBlock(fighter) {
  return isHumanoidFighter(fighter) || Boolean(fighter?.baseDamage || fighter?.damage || activeWeapon(fighter)?.type === "weapon");
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
  const classChoices = [
    { value: "sidekick-warrior", label: "Warrior", description: "Martial sidekick. Always available." },
  ];
  if (fighterSpeaksLanguage(companion)) {
    classChoices.push(
      { value: "sidekick-expert", label: "Expert", description: "Skillful sidekick. Requires a spoken language." },
      { value: "sidekick-spellcaster", label: "Spellcaster", description: "Magical sidekick. Requires a spoken language." },
    );
  }
  const classId = await showChoiceDialog({
    title: `Train ${companion.name}`,
    message: fighterSpeaksLanguage(companion)
      ? "Choose a sidekick class."
      : "This companion cannot speak a language, so only Warrior training is available.",
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
      <button type="button" class="ghost-button" data-dialog-action="cancel">Skip</button>
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

async function levelUpHero() {
  const hero = activeHero();
  if (state.mode === "home" && canTrainAsSidekick(hero)) {
    await trainSidekickCompanion();
    return;
  }
  if (state.mode !== "home" || !canLevelUp(hero)) return;
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
  let asiText = "";
  if (abilityScoreImprovementLevelsForClass(hero.classId).has(hero.level ?? 1)) {
    hero.abilityScores = Object.fromEntries(abilities.map((ability) => [ability, baseAbilityScore(hero, ability)]));
    const increases = await showAbilityScoreImprovementDialog(hero);
    if (increases) {
      for (const ability of abilities) {
        hero.abilityScores[ability] = Math.min(20, hero.abilityScores[ability] + (increases[ability] ?? 0));
      }
      const newConMod = scoreToMod(hero.abilityScores.con);
      const conHpGain = Math.max(0, newConMod - oldConMod) * (hero.level ?? 1);
      hero.baseMaxHp += conHpGain;
      hero.maxHp = hero.baseMaxHp;
      asiText = ` Ability scores improved${conHpGain ? `; Constitution adds ${conHpGain} max HP` : ""}.`;
    }
  }
  ensureFighterAbilityState(hero);
  let spellText = "";
  const cantripChoices =
    (isSidekickSpellcaster(hero) ? sidekickCantripChoiceCountForLevel(hero, hero.level ?? 1) : cantripChoiceCountForClassLevel(hero.classId, hero.level ?? 1)) +
    (hero.unusedCantripChoiceCredits ?? 0);
  if (cantripChoices > 0) {
    const result = await chooseClassCantrips(hero, cantripChoices, hero.spells ?? []);
    const gained = result.spells.filter((spellId) => !(hero.spells ?? []).includes(spellId));
    hero.spells = result.spells;
    hero.unusedCantripChoiceCredits = result.unusedCredits;
    if (gained.length) spellText = ` New cantrip${gained.length === 1 ? "" : "s"}: ${gained.map((spellId) => getContentDefinition("spells", spellId)?.name ?? spellId).join(", ")}.`;
  }
  const spellChoices =
    (isSidekickSpellcaster(hero) ? sidekickSpellChoiceCountForLevel(hero, hero.level ?? 1) : spellChoiceCountForClassLevel(hero.classId, hero.level ?? 1)) +
    (hero.unusedSpellChoiceCredits ?? 0);
  if (spellChoices > 0) {
    const result = await chooseClassSpells(hero, spellChoices, hero.spells ?? []);
    const gained = result.spells.filter((spellId) => !(hero.spells ?? []).includes(spellId));
    hero.spells = result.spells;
    hero.unusedSpellChoiceCredits = result.unusedCredits;
    if (gained.length) spellText += ` New spell${gained.length === 1 ? "" : "s"}: ${gained.map((spellId) => getContentDefinition("spells", spellId)?.name ?? spellId).join(", ")}.`;
  }
  let expertiseText = isClassHero(hero) ? await chooseLevelUpExpertise(hero) : "";
  if (isSidekickExpert(hero) && [3, 15].includes(hero.level ?? 1)) {
    const gained = await chooseExpertiseProficiencies({
      title: "Expertise",
      message: `${hero.name}'s expert training improves. Choose skill proficiencies to master.`,
      count: 2,
      skillProficiencies: hero.skillProficiencies ?? [],
      existingSkillExpertise: hero.expertiseSkills ?? [],
      skillsOnly: true,
    });
    if (gained) {
      hero.expertiseSkills = uniqueValues([...(hero.expertiseSkills ?? []), ...gained.skills]);
      expertiseText = gained.skills.length ? ` Expertise gained: ${gained.skills.map(skillName).join(", ")}.` : "";
    }
  }
  if (isSidekickExpert(hero) && (hero.level ?? 1) === 18) {
    const save = await chooseSidekickSavingThrow("Sharp Mind", ["int", "wis", "cha"]);
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
    if (school) {
      hero.empoweredSpellSchool = school;
      expertiseText += ` Empowered school: ${school}.`;
    }
  }
  refreshDerivedStats(hero);
  hero.hp = hero.maxHp;
  hero.spellPointMax = spellPointMaximum(hero);
  hero.spellPoints = hero.spellPointMax;
  const features = classFeatureNames(hero, hero.level);
  const featureText = features.length ? ` New feature${features.length === 1 ? "" : "s"}: ${features.join(", ")}.` : "";
  const racialHpText = isTrainedSidekick(hero) ? ` (${hpRoll} + CON)` : racialHpGain ? ` (${racialHpGain} from Dwarven Toughness)` : "";
  const levelUpText = `${hero.name} reaches level ${hero.level} and gains ${hpGain} max HP${racialHpText}.${featureText}${asiText}${spellText}${expertiseText}`;
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
  for (const slot of equipmentSlots) {
    if (hero.equipment[slot.id] === itemId) {
      hero.equipment[slot.id] = null;
    }
  }
  hero.inventory.items = hero.inventory.items.filter((item) => item.id !== itemId);
}

function applyHealingToHero(target, healing) {
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

function useBeltItem(itemId, targetId = null) {
  const hero = state.mode === "combat" ? activeFighter() : activeHero();
  const item = itemForId(hero, itemId);
  const target = targetId ? state.fighters[targetId] : hero;
  const itemAvailable = usableEquippedItems(hero).some((entry) => entry.item.id === itemId);
  const usingOnDyingHero = Boolean(targetId);
  if (!item || !itemAvailable) return;
  if (usingOnDyingHero && !canUseHealingItemOnTarget(hero, item, target)) return;
  if (!usingOnDyingHero && !canUseBeltItem(hero, item)) return;

  if (state.mode === "combat") {
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
    if (item.use?.consume !== false && !item.use?.charges) consumeEquippedItem(itemId);
    void maybeFinishEncounterAfterHeroRecovery();
  } else if (item.use?.status) {
    if (!spendItemCharge(item)) return;
    applyStatusEffect(hero, { ...item.use.status });
    addLog(`${hero.name} uses ${item.name} and gains ${item.use.status.label ?? item.name}.`, "important");
    if (item.use?.consume !== false && !item.use?.charges) consumeEquippedItem(itemId);
  } else {
    if (!spendItemCharge(item)) return;
    addLog(`${hero.name} uses ${item.name}.`, "important");
    if (item.use?.consume !== false && !item.use?.charges) consumeEquippedItem(itemId);
  }

  refreshDerivedStats(hero);
  hideUseItemMenu();
  render();
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
      (target.hp ?? 0) < (target.maxHp ?? 0),
  );
  if (!targets.length) return null;
  if (targets.length === 1) return targets[0];
  const targetId = await showChoiceDialog({
    title: "Lay on Hands",
    message: "Choose yourself or an adjacent hero to heal.",
    actor: paladin,
    choices: targets.map((target) => ({ value: target.id, label: `${target.name} (${target.hp}/${target.maxHp} HP)` })),
  });
  return targetId ? state.fighters[targetId] : null;
}

function refundFighterAbilityUse(hero, ability) {
  if (!hero || !ability) return;
  hero.abilityUses[ability.id] = Math.max(0, (hero.abilityUses?.[ability.id] ?? 1) - 1);
  if (state.mode === "combat") {
    if (ability.resource === "bonusAction") hero.hasBonusAction = true;
    if (ability.resource === "action") hero.hasAction = true;
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
  }

  if (ability.id === "actionSurge") {
    hero.hasAction = true;
    addLog(`${hero.name} uses Action Surge and regains an action.`, "important");
  }

  if (ability.id === "rage") {
    applyStatusEffect(hero, { id: "rage", label: "Rage", damageBonus: rageDamageBonus(hero), durationRounds: 10 });
    addLog(`${hero.name} enters a Rage.`, "important");
  }

  if (ability.id === "recklessAttack") {
    applyStatusEffect(hero, { id: "reckless-attack", label: "Reckless", attackBonus: 2, acBonus: -2, expiresAtStartOfTurn: true });
    addLog(`${hero.name} attacks recklessly.`, "important");
  }

  if (ability.id === "patientDefense") {
    hero.dodging = true;
    addLog(`${hero.name} takes a defensive stance.`, "important");
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
    if (target.id !== hero.id && distance(hero.position, target.position) > rangeSquares) {
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

  if (ability.id === "eldritchBlast") {
    startEldritchBlastTargeting(hero);
    return;
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
    const healing = abilityMaxUses(hero, ability);
    const healed = applyHealingToHero(target, healing);
    hero.abilityUses[ability.id] = abilityMaxUses(hero, ability);
    const targetText = target.id === hero.id ? "" : ` on ${target.name}`;
    addLog(`${hero.name} uses Lay on Hands${targetText} and heals ${healed} HP.`, "heal");
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
    const targets = visibleMonsters().filter((monster) => distance(hero.position, monster.position) <= 3);
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
  return true;
}

function renderShortRestDialogBody(spentAny = false) {
  const heroes = shortRestHeroes();
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
          const canSpend = spentAny && hero.hp > 0 && (hero.hitDiceRemaining ?? 0) > 0 && hero.hp < hero.maxHp;
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
      <button type="button" class="ghost-button" data-rest-action="finish">${spentAny ? "Finish Rest" : "No Short Rest"}</button>
    </div>
  `;
}

function showShortRestMenu() {
  return new Promise((resolve) => {
    els.gameDialogTitle.textContent = "Short Rest";
    els.gameDialogField.classList.add("hidden");
    els.gameDialogForm.classList.add("wide-dialog");
    let spentAny = false;

    const cleanup = () => {
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialogForm.classList.remove("wide-dialog");
      els.gameDialog.classList.add("hidden");
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
  if (itemRequiresTwoHands(item) && ["mainHand", "offHand"].includes(slotId)) {
    hero.equipment.mainHand = null;
    hero.equipment.offHand = null;
  } else {
    hero.equipment[slotId] = null;
  }
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
    if (hero.equipment[slot.id] === itemId || (equippingHand && isHandSlot(slot.id) && itemRequiresTwoHands(equippedItem(hero, slot.id)))) {
      hero.equipment[slot.id] = null;
    }
  }
  if (itemRequiresTwoHands(item)) {
    hero.equipment.mainHand = itemId;
    hero.equipment.offHand = itemId;
  } else {
    hero.equipment[slotId] = itemId;
  }
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
      return `
        <div class="initiative-item${activeClass}">
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
  return text.replace(/\b(d20(?: true)?|STR|DEX|CON|INT|WIS|CHA)\s+((?:\d+(?:\s*\/\s*\d+)*(?:\s*->\s*(?:Karmic outcome|adjusted outcome)?\s*)?)+)/g, (match, label, series) => {
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

function renderLog() {
  const panel = els.log?.closest(".log-panel");
  panel?.classList.toggle("expanded", combatLogExpanded);
  if (els.expandLog) {
    els.expandLog.textContent = combatLogExpanded ? "-" : "+";
    els.expandLog.title = combatLogExpanded ? "Collapse log" : "Expand log";
    els.expandLog.setAttribute("aria-label", combatLogExpanded ? "Collapse log" : "Expand log");
    els.expandLog.setAttribute("aria-expanded", String(combatLogExpanded));
  }
  els.log.innerHTML = state.log
    .map((entry) => `<li class="${escapeAttribute(entry.type ?? "")}">${combatLogTextMarkup(entry.text)}</li>`)
    .join("");
  els.log.scrollTop = els.log.scrollHeight;
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

  els.rollInitiative.disabled = !gameHasStarted || state.completed || movementInProgress || state.mode === "combat" || !threatPresent();
  els.attack.disabled = movementInProgress || !heroCanAttack;
  if (els.attackNote) {
    const weapon = activeWeapon(actingHero);
    const target = attackTarget();
    els.attackNote.textContent = target
      ? `${weapon?.name ?? "Unarmed Strike"} -> ${objectIsDestructible(target) ? objectTargetName(target) : target.name}`
      : `${weapon?.name ?? "Unarmed Strike"}`;
  }
  els.actionButton.disabled = movementInProgress || !heroCanUseAction;
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

  els.attack.style.display = state.mode === "combat" ? "" : "none";
  els.actionButton.style.display = state.mode === "combat" ? "" : "none";
  els.endTurn.style.display = state.mode === "combat" ? "" : "none";
  els.shortRest.style.display = state.mode === "combat" ? "none" : "";
  els.returnHome.style.display = "";
  els.saveGame.disabled = !gameHasStarted || Boolean(state.isTutorial);
  els.toggleLayout.textContent = showDungeonLayout ? "Hide Dungeon Layout" : "Show Dungeon Layout";
  els.toggleAdminMode.classList.toggle("active", adminEnabled());
  els.toggleAdminMode.disabled = !gameHasStarted;
  els.toggleLayout.classList.toggle("hidden", !adminEnabled());
  els.debugKill.classList.toggle("hidden", !adminEnabled());
  els.toggleLayout.disabled = !adminEnabled();
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
  els.levelPanel?.classList.toggle("hidden", isAutonomousAlly(hero));
  els.levelUp.textContent = canTrain ? "Train" : "Level Up";
  els.levelUp.disabled = !gameHasStarted || state.mode !== "home" || (!canTrain && !canLevelUp(hero));
  if (els.selectParty) {
    const selectableCount = partyHeroes().filter((entry) => heroCanAct(entry) && !isAutonomousAlly(entry)).length;
    els.selectParty.disabled = !gameHasStarted || state.mode === "combat" || selectableCount <= 1;
  }
  if (els.roomTitle) els.roomTitle.textContent = state.mode === "home" ? "Home" : state.room.name;
  els.showDungeonIntro?.classList.toggle("hidden", !state.customDungeon?.intro?.text && !(state.customDungeon?.intro?.images ?? []).length);
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

