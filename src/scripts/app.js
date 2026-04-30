(() => {
const { gridSize, feetPerSquare, tileSizePx, tokenSlideMs, templates } = window.DungeonConfig;
const { rollDie, rollDice, abilityLabel } = window.DungeonDice;
const { distance, isAdjacent, positionKey, findPath, reachableTiles } = window.DungeonGrid;
const { generateDungeon, roomHasCell } = window.DungeonGenerator;
const { getSlots, save, load } = window.DungeonSave;

let state = createInitialState();
let roomIsBuilt = false;
let monsterTurnTimer = null;
let gameHasStarted = false;
let activeSaveSlot = 1;
let showDungeonLayout = false;
const fighterStatsOpen = {
  hero: true,
  monster: true,
};

const els = {
  mainMenu: document.querySelector("#main-menu"),
  startAdventure: document.querySelector("#start-adventure"),
  saveSlots: document.querySelector("#save-slots"),
  saveStatus: document.querySelector("#save-status"),
  room: document.querySelector("#room"),
  heroCard: document.querySelector("#hero-card"),
  monsterCard: document.querySelector("#monster-card"),
  log: document.querySelector("#combat-log"),
  roundLabel: document.querySelector("#round-label"),
  turnLabel: document.querySelector("#turn-label"),
  initiativeList: document.querySelector("#initiative-list"),
  rollInitiative: document.querySelector("#roll-initiative"),
  attack: document.querySelector("#attack"),
  endTurn: document.querySelector("#end-turn"),
  newGame: document.querySelector("#new-game"),
  saveGame: document.querySelector("#save-game"),
  toggleLayout: document.querySelector("#toggle-layout"),
  clearLog: document.querySelector("#clear-log"),
};

function createInitialState() {
  const dungeon = generateDungeon(window.DungeonConfig.dungeon);
  const hero = createFighter(templates.hero);
  const monster = createFighter(templates.monster);
  hero.position = { ...dungeon.startPosition };
  const firstRoom = dungeon.rooms[0];
  monster.position = firstRoom.cells.find((cell) => distance(cell, hero.position) >= 4) ?? firstRoom.cells[firstRoom.cells.length - 1];

  return {
    combatStarted: false,
    mode: "exploration",
    round: 0,
    activeIndex: 0,
    initiative: [],
    room: {
      id: dungeon.id,
      name: "Generated Dungeon",
      gridSize: dungeon.gridSize,
      tileSizePx,
    },
    dungeon,
    exploration: {
      discoveredRoomIds: [dungeon.entranceRoomId],
      openedDoorKeys: [],
      openedCorridorKeys: [],
    },
    fighters: {
      hero,
      monster,
    },
    log: [
      {
        text: `Generated ${dungeon.roomCount} rooms. Mira starts at the entrance of ${firstRoom.name}.`,
        type: "important",
      },
    ],
  };
}

function createFighter(template) {
  return {
    ...template,
    damage: { ...template.damage },
    position: { ...template.position },
    hp: template.maxHp,
    alive: true,
    movementLeft: Math.floor(template.speedFeet / feetPerSquare),
    hasAction: true,
  };
}

function aliveFighters() {
  return Object.values(state.fighters).filter((fighter) => fighter.alive);
}

function activeFighter() {
  const entry = state.initiative[state.activeIndex];
  return entry ? state.fighters[entry.fighterId] : null;
}

function normalizeLoadedState(loadedState) {
  const freshState = createInitialState();
  const normalized = {
    ...freshState,
    ...loadedState,
    mode: loadedState.mode ?? (loadedState.combatStarted ? "combat" : "exploration"),
    fighters: {
      ...freshState.fighters,
      ...loadedState.fighters,
    },
    dungeon: loadedState.dungeon ?? freshState.dungeon,
    exploration: {
      ...freshState.exploration,
      ...loadedState.exploration,
    },
    log: Array.isArray(loadedState.log) ? loadedState.log : [],
    initiative: Array.isArray(loadedState.initiative) ? loadedState.initiative : [],
  };

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

  return normalized;
}

function updateSaveStatus(message = "") {
  renderSaveSlots();
  if (message) {
    els.saveStatus.textContent = message;
  } else {
    const savedCount = getSlots().filter((slot) => slot.hasSave).length;
    els.saveStatus.textContent = savedCount > 0 ? `${savedCount} save slot${savedCount === 1 ? "" : "s"} available.` : "No saved adventure found.";
  }
}

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function renderSaveSlots() {
  els.saveSlots.innerHTML = getSlots()
    .map((slot) => {
      const savedAt = slot.savedAt ? new Date(slot.savedAt).toLocaleString() : "Empty";
      const activeClass = slot.id === activeSaveSlot ? " active" : "";
      return `
        <div class="save-slot${activeClass}" data-slot="${slot.id}">
          <div class="save-slot-main">
            <label for="save-slot-name-${slot.id}">Slot ${slot.id}</label>
            <input id="save-slot-name-${slot.id}" type="text" value="${escapeAttribute(slot.name)}" maxlength="32" />
            <span>${savedAt}</span>
          </div>
          <div class="save-slot-actions">
            <button type="button" data-action="save-slot" data-slot="${slot.id}">Save</button>
            <button type="button" data-action="load-slot" data-slot="${slot.id}" ${slot.hasSave ? "" : "disabled"}>Load</button>
          </div>
        </div>
      `;
    })
    .join("");
}

function showMainMenu(message = "") {
  gameHasStarted = false;
  window.clearTimeout(monsterTurnTimer);
  els.mainMenu.classList.remove("hidden");
  updateSaveStatus(message);
  renderControls();
}

function hideMainMenu() {
  gameHasStarted = true;
  els.mainMenu.classList.add("hidden");
  renderControls();
}

function startNewAdventure() {
  window.clearTimeout(monsterTurnTimer);
  showDungeonLayout = false;
  state = createInitialState();
  roomIsBuilt = false;
  hideMainMenu();
  render();
}

function loadAdventure(slotId) {
  try {
    const payload = load(slotId);
    if (!payload) {
      updateSaveStatus("No saved adventure found.");
      return;
    }

    window.clearTimeout(monsterTurnTimer);
    activeSaveSlot = slotId;
    state = normalizeLoadedState(payload.state);
    showDungeonLayout = false;
    roomIsBuilt = false;
    hideMainMenu();
    addLog(`Loaded "${payload.name}".`, "important");
    render();
    maybeRunMonsterTurn();
  } catch (error) {
    updateSaveStatus("Could not load the saved adventure.");
  }
}

function saveAdventure(slotId = activeSaveSlot) {
  const nameInput = els.saveSlots.querySelector(`#save-slot-name-${slotId}`);
  const slot = getSlots().find((entry) => entry.id === slotId);
  const slotName = nameInput?.value.trim() || slot?.name || `Save Slot ${slotId}`;
  const savedAt = new Date().toLocaleString();
  activeSaveSlot = slotId;
  addLog(`Saved "${slotName}" at ${savedAt}.`, "important");
  const payload = save(slotId, slotName, state);
  render();
  updateSaveStatus(`Saved "${payload.name}" at ${new Date(payload.savedAt).toLocaleString()}.`);
}

function addLog(text, type = "") {
  state.log.push({ text, type });
  if (state.log.length > 80) {
    state.log.shift();
  }
}

function resetTurnResources(fighter) {
  fighter.movementLeft = Math.floor(fighter.speedFeet / feetPerSquare);
  fighter.hasAction = true;
}

function currentGridSize() {
  return state.dungeon?.gridSize ?? gridSize;
}

function currentWalkable() {
  return new Set((state.dungeon?.walkable ?? []).map(positionKey));
}

function currentOpenedKeys() {
  return new Set([...(state.exploration?.openedDoorKeys ?? []), ...(state.exploration?.openedCorridorKeys ?? [])]);
}

function currentDiscoveredRoomIds() {
  return new Set(state.exploration?.discoveredRoomIds ?? []);
}

function isKnownTile(position) {
  if (showDungeonLayout) return true;
  const tileKey = positionKey(position);
  if (currentOpenedKeys().has(tileKey)) return true;
  return (state.dungeon?.rooms ?? []).some((room) => currentDiscoveredRoomIds().has(room.id) && roomHasCell(room, position));
}

function visibleWalkable() {
  const known = new Set();
  for (const room of state.dungeon?.rooms ?? []) {
    if (currentDiscoveredRoomIds().has(room.id)) {
      room.cells.forEach((cell) => known.add(positionKey(cell)));
    }
  }
  currentOpenedKeys().forEach((tileKey) => known.add(tileKey));
  return known;
}

function doorAt(position) {
  const tileKey = positionKey(position);
  return (state.dungeon?.doors ?? []).find((door) => positionKey(door) === tileKey) ?? null;
}

function reciprocalDoor(door) {
  const targetRoom = (state.dungeon?.rooms ?? []).find((room) => room.id === door.to);
  return targetRoom?.doors.find((targetDoor) => targetDoor.to === door.roomId) ?? null;
}

function corridorPathBetweenDoors(door, targetDoor) {
  if (!door?.corridor || !targetDoor?.corridor) return [];
  const corridorKeys = new Set((state.dungeon?.corridors ?? []).map(positionKey));
  const queue = [{ position: door.corridor, path: [door.corridor] }];
  const visited = new Set([positionKey(door.corridor)]);
  const goalKey = positionKey(targetDoor.corridor);

  while (queue.length > 0) {
    const current = queue.shift();
    if (positionKey(current.position) === goalKey) return current.path;

    for (const next of [
      { x: current.position.x, y: current.position.y - 1 },
      { x: current.position.x + 1, y: current.position.y },
      { x: current.position.x, y: current.position.y + 1 },
      { x: current.position.x - 1, y: current.position.y },
    ]) {
      const nextKey = positionKey(next);
      if (visited.has(nextKey) || !corridorKeys.has(nextKey)) continue;
      visited.add(nextKey);
      queue.push({ position: next, path: [...current.path, next] });
    }
  }

  return [door.corridor, targetDoor.corridor];
}

function openDoor(door) {
  const targetRoom = (state.dungeon?.rooms ?? []).find((room) => room.id === door.to);
  const targetDoor = reciprocalDoor(door);
  if (!targetRoom || !targetDoor) return false;

  const discovered = currentDiscoveredRoomIds();
  const openedDoorKeys = new Set(state.exploration.openedDoorKeys);
  const openedCorridorKeys = new Set(state.exploration.openedCorridorKeys);

  discovered.add(targetRoom.id);
  openedDoorKeys.add(positionKey(door));
  openedDoorKeys.add(positionKey(targetDoor));
  corridorPathBetweenDoors(door, targetDoor).forEach((cell) => openedCorridorKeys.add(positionKey(cell)));

  state.exploration.discoveredRoomIds = Array.from(discovered);
  state.exploration.openedDoorKeys = Array.from(openedDoorKeys);
  state.exploration.openedCorridorKeys = Array.from(openedCorridorKeys);
  addLog(`${state.fighters.hero.name} opens the door to ${targetRoom.name}.`, "important");
  render();
  return true;
}

function canOpenDoor(position) {
  const hero = state.fighters.hero;
  const door = doorAt(position);
  if (!door || !isKnownTile(position)) return null;
  return distance(hero.position, position) <= 1 ? door : null;
}

function threatPresent() {
  return Object.values(state.fighters).some(
    (fighter) => fighter.id !== "hero" && fighter.alive && isKnownTile(fighter.position),
  );
}

function rollInitiative() {
  if (state.combatStarted) return;

  const heroRoll = rollDie(20);
  const monsterRoll = rollDie(20);

  state.initiative = [
    {
      fighterId: "hero",
      roll: heroRoll,
      total: heroRoll + state.fighters.hero.initiativeBonus,
    },
    {
      fighterId: "monster",
      roll: monsterRoll,
      total: monsterRoll + state.fighters.monster.initiativeBonus,
    },
  ].sort((a, b) => b.total - a.total || (a.fighterId === "hero" ? -1 : 1));

  state.combatStarted = true;
  state.mode = "combat";
  state.round = 1;
  state.activeIndex = 0;
  resetTurnResources(activeFighter());

  addLog(
    `Initiative: Mira rolls ${heroRoll} ${abilityLabel(state.fighters.hero.initiativeBonus)} = ${
      heroRoll + state.fighters.hero.initiativeBonus
    }; Crypt Guard rolls ${monsterRoll} ${abilityLabel(state.fighters.monster.initiativeBonus)} = ${
      monsterRoll + state.fighters.monster.initiativeBonus
    }.`,
    "important",
  );
  addLog(`${activeFighter().name} acts first.`, "important");

  render();
  maybeRunMonsterTurn();
}

function makeAttack(attacker, defender) {
  if (!attacker.alive || !defender.alive || !attacker.hasAction) return;

  if (!isAdjacent(attacker, defender)) {
    addLog(`${attacker.name} is too far away to attack ${defender.name}. Move adjacent first.`);
    render();
    return;
  }

  attacker.hasAction = false;

  const attackRoll = rollDie(20);
  const totalAttack = attackRoll + attacker.attackBonus;
  const isCritical = attackRoll === 20;
  const isMiss = attackRoll === 1 || totalAttack < defender.ac;

  addLog(
    `${attacker.name} attacks: d20 ${attackRoll} ${abilityLabel(attacker.attackBonus)} = ${totalAttack} vs AC ${
      defender.ac
    }.`,
  );

  if (isMiss) {
    addLog(attackRoll === 1 ? "Natural 1. The attack misses badly." : `${defender.name} avoids the blow.`);
    render();
    return;
  }

  const damageRoll = rollDice(attacker.damage.count * (isCritical ? 2 : 1), attacker.damage.sides);
  const damage = Math.max(1, damageRoll.total + attacker.damage.bonus);
  defender.hp = Math.max(0, defender.hp - damage);
  defender.alive = defender.hp > 0;

  const critText = isCritical ? " Critical hit." : "";
  addLog(
    `${attacker.name} hits for ${damage} damage (${damageRoll.rolls.join(" + ")} ${
      abilityLabel(attacker.damage.bonus)
    }).${critText}`,
    "damage",
  );

  if (!defender.alive) {
    addLog(`${defender.name} drops to 0 HP. ${attacker.id === "hero" ? "Victory." : "Defeat."}`, "important");
    if (attacker.id === "hero") {
      state.combatStarted = false;
      state.mode = "exploration";
      state.initiative = [];
      state.activeIndex = 0;
      resetTurnResources(state.fighters.hero);
      addLog("The room falls quiet. Exploration resumes.", "important");
    }
  }

  render();
}

function endTurn() {
  if (!state.combatStarted || aliveFighters().length < 2) {
    render();
    return;
  }

  state.activeIndex = (state.activeIndex + 1) % state.initiative.length;
  if (state.activeIndex === 0) {
    state.round += 1;
    addLog(`Round ${state.round} begins.`, "important");
  }
  resetTurnResources(activeFighter());

  render();
  maybeRunMonsterTurn();
}

function maybeRunMonsterTurn() {
  const fighter = activeFighter();
  if (!fighter || fighter.id !== "monster" || aliveFighters().length < 2) return;

  els.attack.disabled = true;
  els.endTurn.disabled = true;
  window.clearTimeout(monsterTurnTimer);
  monsterTurnTimer = window.setTimeout(() => {
    if (activeFighter()?.id === "monster") {
      runMonsterAi(state.fighters.monster);
    }
  }, tokenSlideMs);
}

function moveFighter(fighter, destination, silent = false) {
  if (!fighter.alive || (state.mode === "combat" && fighter.movementLeft <= 0)) return false;

  const moveLimit = state.mode === "combat" ? fighter.movementLeft : Infinity;
  const knownWalkable = state.mode === "combat" ? currentWalkable() : visibleWalkable();
  const path = findPath(fighter.position, destination, fighter, state.fighters, {
    gridSize: currentGridSize(),
    walkable: knownWalkable,
  });
  if (!path || path.length === 0 || path.length > moveLimit) return false;

  fighter.position = { ...destination };
  if (state.mode === "combat") {
    fighter.movementLeft -= path.length;
  }

  if (!silent) {
    const suffix = state.mode === "combat" ? ` ${fighter.movementLeft * feetPerSquare} ft remains.` : "";
    addLog(`${fighter.name} moves ${path.length * feetPerSquare} ft.${suffix}`);
  }

  render();
  return true;
}

function handleTileClick(position) {
  const hero = state.fighters.hero;
  if (state.mode === "combat" && (activeFighter()?.id !== "hero" || aliveFighters().length < 2)) return;
  if (state.mode === "exploration" && threatPresent()) {
    addLog("A hostile creature is present. Roll initiative before moving.");
    render();
    return;
  }

  const door = canOpenDoor(position);
  if (door) {
    openDoor(door);
    return;
  }

  if (hero.position.x === position.x && hero.position.y === position.y) return;
  if (!moveFighter(hero, position)) {
    addLog(state.mode === "combat" ? "That square is out of reach or blocked." : "That square is blocked or not discovered yet.");
    render();
  }
}

function bestStepToward(mover, target) {
  const reachable = Array.from(
    reachableTiles(mover, state.fighters, {
      gridSize: currentGridSize(),
      walkable: currentWalkable(),
    }).entries(),
  ).map(([key, cost]) => {
    const [x, y] = key.split(",").map(Number);
    return { position: { x, y }, cost };
  });

  if (reachable.length === 0) return null;

  reachable.sort((a, b) => {
    const distanceDifference = distance(a.position, target.position) - distance(b.position, target.position);
    return distanceDifference || b.cost - a.cost;
  });

  return reachable[0].position;
}

function runMonsterAi(monster) {
  const target = state.fighters.hero;
  if (!monster.alive || !target.alive) return;

  if (monster.behavior === "melee") {
    if (!isAdjacent(monster, target)) {
      const destination = bestStepToward(monster, target);
      if (destination) {
        const before = { ...monster.position };
        moveFighter(monster, destination, true);
        const movedSquares = distance(before, monster.position);
        addLog(`${monster.name} advances ${movedSquares * feetPerSquare} ft toward ${target.name}.`);
      }
    }

    window.setTimeout(() => {
      if (activeFighter()?.id === "monster" && isAdjacent(monster, target) && monster.hasAction) {
        makeAttack(monster, target);
      }

      window.setTimeout(() => {
        if (activeFighter()?.id === "monster" && aliveFighters().length === 2) {
          endTurn();
        }
      }, tokenSlideMs);
    }, tokenSlideMs);
  }
}

function buildRoom() {
  els.room.innerHTML = "";
  const mapGridSize = currentGridSize();
  const roomSizePx = mapGridSize * tileSizePx;
  const tokenSizePx = Math.round(tileSizePx * 0.62);
  els.room.style.setProperty("--grid-size", mapGridSize);
  els.room.style.setProperty("--tile-size", `${tileSizePx}px`);
  els.room.style.setProperty("--room-size", `${roomSizePx}px`);
  els.room.style.setProperty("--token-size", `${tokenSizePx}px`);

  const tileLayer = document.createElement("div");
  tileLayer.className = "tile-layer";

  for (let y = 0; y < mapGridSize; y += 1) {
    for (let x = 0; x < mapGridSize; x += 1) {
      const tile = document.createElement("button");
      tile.className = "tile";
      tile.type = "button";
      tile.dataset.x = x;
      tile.dataset.y = y;
      tile.addEventListener("click", () => handleTileClick({ x, y }));
      tileLayer.append(tile);
    }
  }

  const tokenLayer = document.createElement("div");
  tokenLayer.className = "token-layer";

  for (const fighter of Object.values(state.fighters)) {
    const token = document.createElement("div");
    token.className = `token ${fighter.id}`;
    token.dataset.fighter = fighter.id;
    token.textContent = fighter.token;
    token.title = fighter.name;
    tokenLayer.append(token);
  }

  els.room.append(tileLayer, tokenLayer);
  roomIsBuilt = true;
}

function placeToken(fighter) {
  const token = els.room.querySelector(`[data-fighter="${fighter.id}"]`);
  if (!token) return;

  token.style.left = `${(fighter.position.x + 0.5) * tileSizePx}px`;
  token.style.top = `${(fighter.position.y + 0.5) * tileSizePx}px`;
  token.classList.toggle("defeated", !fighter.alive);
}

function renderRoom() {
  if (!roomIsBuilt) buildRoom();

  const hero = state.fighters.hero;
  const heroTurn = state.mode === "combat" && activeFighter()?.id === "hero" && aliveFighters().length === 2;
  const walkable = currentWalkable();
  const doorKeys = new Set((state.dungeon?.doors ?? []).map(positionKey));
  const openedDoorKeys = new Set(state.exploration?.openedDoorKeys ?? []);
  const reachable = heroTurn
      ? reachableTiles(hero, state.fighters, {
          gridSize: currentGridSize(),
          walkable,
        })
      : state.mode === "exploration"
        ? reachableTiles(hero, state.fighters, {
            gridSize: currentGridSize(),
            walkable: visibleWalkable(),
            maxCost: currentGridSize() * currentGridSize(),
          })
        : new Map();

  els.room.querySelectorAll(".tile").forEach((tile) => {
    const position = { x: Number(tile.dataset.x), y: Number(tile.dataset.y) };
    const key = positionKey(position);
    const isReachable = reachable.has(key);
    const isWalkable = walkable.has(key);
    const isDoor = doorKeys.has(key);
    const isKnown = isKnownTile(position);
    tile.classList.toggle("walkable", isWalkable && isKnown);
    tile.classList.toggle("hidden-tile", !isKnown);
    tile.classList.toggle("door", isDoor && isKnown);
    tile.classList.toggle("open-door", openedDoorKeys.has(key));
    tile.classList.toggle("reachable", isReachable);
    const openableDoor = Boolean(canOpenDoor(position));
    tile.classList.toggle("openable-door", openableDoor);
    tile.disabled = (!isReachable && !openableDoor) || !isKnown;
    tile.title = openableDoor ? "Open door" : isReachable ? `${reachable.get(key) * feetPerSquare} ft` : "";
  });

  Object.values(state.fighters).forEach(placeToken);
}

function renderFighterCard(element, fighter) {
  const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
  const isOpen = fighterStatsOpen[fighter.id];
  element.innerHTML = `
    <div class="fighter-top">
      <div>
        <div class="fighter-name">${fighter.name}</div>
        <div class="fighter-role">${fighter.role}</div>
      </div>
      <div class="stat-pill"><b>${fighter.ac}</b><span>AC</span></div>
    </div>
    <div class="hp-line">
      <div class="hp-text"><span>HP</span><span>${fighter.hp} / ${fighter.maxHp}</span></div>
      <div class="hp-bar"><div class="hp-fill" style="width: ${hpPercent}%"></div></div>
    </div>
    <details class="stats-details" ${isOpen ? "open" : ""}>
      <summary>Stats</summary>
      <div class="stat-grid">
        <div class="stat-pill"><b>${abilityLabel(fighter.attackBonus)}</b><span>Attack</span></div>
        <div class="stat-pill"><b>${fighter.damage.label}</b><span>Damage</span></div>
        <div class="stat-pill"><b>${fighter.speedFeet} ft</b><span>Speed</span></div>
        <div class="stat-pill"><b>${fighter.movementLeft * feetPerSquare} ft</b><span>Move Left</span></div>
        <div class="stat-pill"><b>${abilityLabel(fighter.initiativeBonus)}</b><span>Init</span></div>
        <div class="stat-pill"><b>${fighter.hasAction ? "Yes" : "No"}</b><span>Action</span></div>
      </div>
    </details>
  `;

  const details = element.querySelector(".stats-details");
  details.addEventListener("toggle", () => {
    fighterStatsOpen[fighter.id] = details.open;
  });
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
          <span>${fighter.name}</span>
          <strong>${entry.total}</strong>
        </div>
      `;
    })
    .join("");
}

function renderLog() {
  els.log.innerHTML = state.log
    .map((entry) => `<li class="${entry.type}">${escapeHtml(entry.text)}</li>`)
    .join("");
  els.log.scrollTop = els.log.scrollHeight;
}

function renderControls() {
  const fighter = activeFighter();
  const heroTurn = state.mode === "combat" && fighter?.id === "hero" && aliveFighters().length === 2;
  const heroCanAttack =
    heroTurn && state.fighters.hero.hasAction && isAdjacent(state.fighters.hero, state.fighters.monster);

  els.rollInitiative.disabled = state.mode === "combat" || !threatPresent();
  els.attack.disabled = !heroCanAttack;
  els.endTurn.disabled = !heroTurn;
  els.saveGame.disabled = !gameHasStarted;
  els.toggleLayout.textContent = showDungeonLayout ? "Hide Dungeon Layout" : "Show Dungeon Layout";
  els.toggleLayout.disabled = !gameHasStarted;
  els.roundLabel.textContent = state.mode === "combat" ? `Round ${state.round}` : "Out of turn order";

  if (state.mode !== "combat") {
    els.turnLabel.textContent = threatPresent() ? "Danger present" : "Exploration";
  } else if (aliveFighters().length < 2) {
    els.turnLabel.textContent = state.fighters.hero.alive ? "Encounter won" : "Encounter lost";
  } else {
    els.turnLabel.textContent = `${fighter.name}'s turn`;
  }
}

function render() {
  renderRoom();
  renderFighterCard(els.heroCard, state.fighters.hero);
  renderFighterCard(els.monsterCard, state.fighters.monster);
  renderInitiative();
  renderLog();
  renderControls();
}

els.rollInitiative.addEventListener("click", rollInitiative);
els.attack.addEventListener("click", () => makeAttack(state.fighters.hero, state.fighters.monster));
els.endTurn.addEventListener("click", endTurn);
els.newGame.addEventListener("click", () => {
  showMainMenu();
});
els.toggleLayout.addEventListener("click", () => {
  showDungeonLayout = !showDungeonLayout;
  render();
});
els.saveGame.addEventListener("click", () => saveAdventure(activeSaveSlot));
els.startAdventure.addEventListener("click", startNewAdventure);
els.saveSlots.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const slotId = Number(button.dataset.slot);
  if (button.dataset.action === "save-slot") {
    saveAdventure(slotId);
  }
  if (button.dataset.action === "load-slot") {
    loadAdventure(slotId);
  }
});
els.clearLog.addEventListener("click", () => {
  state.log = [];
  renderLog();
});

render();
showMainMenu();
})();
