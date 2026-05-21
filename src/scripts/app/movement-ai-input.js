function movementWalkableFor(fighter) {
  return isRosterHeroId(fighter.id) && (state.mode === "exploration" || state.mode === "home") ? visibleWalkable(fighter) : currentWalkable(fighter);
}

function detectedArmedTrapKeys(fighter = null) {
  const keys = new Set();
  for (const object of state.dungeonObjects ?? []) {
    if (!objectIsTrap(object) || !object.detected || object.spent || object.disarmed || object.armed === false) continue;
    if (fighterIsFlying(fighter) && objectHasTag(object, "floor")) continue;
    objectCells(object).forEach((cell) => keys.add(positionKey(cell)));
  }
  return keys;
}

function isDetectedArmedTrapPosition(position) {
  return detectedArmedTrapKeys().has(positionKey(position));
}

function hazardousTerrainKeys(fighter = null) {
  const keys = new Set();
  for (const object of state.dungeonObjects ?? []) {
    if (!objectIsHazardousTerrain(object)) continue;
    if (fighterIsFlying(fighter) && objectHasTag(object, "floor")) continue;
    objectCells(object).forEach((cell) => keys.add(positionKey(cell)));
  }
  return keys;
}

function trapAwareWalkableFor(fighter, destination = null) {
  const walkable = new Set(movementWalkableFor(fighter));
  const destinationKey = destination ? positionKey(destination) : "";
  const currentKey = positionKey(fighter.position);
  detectedArmedTrapKeys(fighter).forEach((tileKey) => {
    if (tileKey !== currentKey && tileKey !== destinationKey) walkable.delete(tileKey);
  });
  return walkable;
}

function aiAllySafeWalkableFor(fighter, destination = null) {
  const walkable = trapAwareWalkableFor(fighter, destination);
  const currentKey = positionKey(fighter.position);
  detectedArmedTrapKeys(fighter).forEach((tileKey) => {
    if (tileKey !== currentKey) walkable.delete(tileKey);
  });
  hazardousTerrainKeys(fighter).forEach((tileKey) => {
    if (tileKey !== currentKey) walkable.delete(tileKey);
  });
  return walkable;
}

function isAiAllySafeStep(fighter, position, destination = null) {
  return aiAllySafeWalkableFor(fighter, destination).has(positionKey(position));
}

function movementLimitFor(fighter) {
  return state.mode === "combat" ? fighter.movementLeft : Infinity;
}

function occupyingFighterAt(position, ignoredFighter = null) {
  return window.DungeonGrid.occupiedFighterAt(position, state.fighters, ignoredFighter);
}

function carriedFighterOccupiesPosition(fighter, position) {
  const carried = grabbedFighterForCarrier(fighter);
  return Boolean(carried?.position && carried.position.x === position.x && carried.position.y === position.y);
}

function canMoveThroughOccupiedTile(fighter, position) {
  const occupant = occupyingFighterAt(position, fighter);
  if (occupant && grabbedFighterForCarrier(fighter)?.id === occupant.id) return true;
  if (occupant && state.mode === "home" && isRosterHeroId(fighter.id) && isRosterHeroId(occupant.id)) return true;
  if (occupant && !hostileTo(fighter, occupant) && !hostileTo(occupant, fighter)) return true;
  return Boolean(fighter.canMoveThroughMonsters && occupant && hostileTo(fighter, occupant));
}

function canEndMovementOnTile(fighter, position) {
  return window.DungeonGrid.fighterCells(fighter, position).every(
    (cell) => !window.DungeonGrid.isOccupied(cell, state.fighters, fighter) || carriedFighterOccupiesPosition(fighter, cell),
  );
}

function fighterFootprintWalkableAt(fighter, position, walkable = movementWalkableFor(fighter)) {
  return window.DungeonGrid.fighterCells(fighter, position).every(
    (cell) => window.DungeonGrid.isInsideGrid(cell, currentGridSize()) && walkable.has(positionKey(cell)),
  );
}

function canMoveThroughOccupiedFootprint(fighter, position) {
  return window.DungeonGrid.fighterCells(fighter, position).every(
    (cell) => !window.DungeonGrid.isOccupied(cell, state.fighters, fighter) || canMoveThroughOccupiedTile(fighter, cell),
  );
}

function canFighterOccupyPosition(fighter, position, walkable = movementWalkableFor(fighter), allowMoveThrough = false) {
  if (!fighterFootprintWalkableAt(fighter, position, walkable)) return false;
  return allowMoveThrough ? canMoveThroughOccupiedFootprint(fighter, position) : canEndMovementOnTile(fighter, position);
}

function canTraverseFootprintMovementEdge(fighter, from, to, path = []) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return false;
  const previousKeys = new Set(window.DungeonGrid.fighterCells(fighter, from).map(positionKey));
  const enteringCells = window.DungeonGrid.fighterCells(fighter, to).filter((cell) => !previousKeys.has(positionKey(cell)));
  return enteringCells.every((cell) =>
    canTraverseMovementEdge(fighter, { x: cell.x - dx, y: cell.y - dy }, cell, path),
  );
}

function isValidPathStep(fighter, from, to, path = []) {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  if (dx + dy !== 1) return false;
  if (!window.DungeonGrid.isInsideGrid(to, currentGridSize())) return false;
  if (!canFighterOccupyPosition(fighter, to, movementWalkableFor(fighter), true)) return false;
  if (!canTraverseFootprintMovementEdge(fighter, from, to, path)) return false;
  return !path.some((step) => positionKey(step) === positionKey(to));
}

function findMovementPath(fighter, destination) {
  const options = {
    gridSize: currentGridSize(),
    canTraverse: (from, to, path) => canTraverseFootprintMovementEdge(fighter, from, to, path),
    stateKey: (position, path) => movementStateKey(fighter, position, path),
    canEnterOccupied: (position) => canMoveThroughOccupiedTile(fighter, position),
    canOccupy: (position) => canFighterOccupyPosition(fighter, position, movementWalkableFor(fighter), true),
  };
  const safePath = findPath(fighter.position, destination, fighter, state.fighters, {
    ...options,
    walkable: trapAwareWalkableFor(fighter, destination),
    canOccupy: (position) => canFighterOccupyPosition(fighter, position, trapAwareWalkableFor(fighter, destination), true),
  });
  if (safePath) return safePath;
  return findPath(fighter.position, destination, fighter, state.fighters, {
    ...options,
    walkable: movementWalkableFor(fighter),
  });
}

function findMovementPathWithWalkable(fighter, destination, walkable) {
  return findPath(fighter.position, destination, fighter, state.fighters, {
    gridSize: currentGridSize(),
    walkable,
    canTraverse: (from, to, path) => canTraverseFootprintMovementEdge(fighter, from, to, path),
    stateKey: (position, path) => movementStateKey(fighter, position, path),
    canEnterOccupied: (position) => canMoveThroughOccupiedTile(fighter, position),
    canOccupy: (position) => canFighterOccupyPosition(fighter, position, walkable, true),
  });
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function moveFighterAlongPath(fighter, path, silent = false) {
  if (!heroCanAct(fighter) || (state.mode === "combat" && fighter.movementLeft <= 0)) return false;
  const pathCost = (path ?? []).reduce((total, step) => total + movementCostAtPosition(step, fighter), 0);
  if (!path || path.length === 0 || pathCost > movementLimitFor(fighter)) return false;
  if (!canEndMovementOnTile(fighter, path.at(-1))) return false;

  let previous = fighter.position;
  for (const step of path) {
    if (!isValidPathStep(fighter, previous, step, path.slice(0, path.indexOf(step)))) return false;
    if (!canMoveGrabbedEntityWithCarrier(fighter, previous, step)) return false;
    previous = step;
  }

  movementInProgress = true;
  dragPath = null;
  dragHeroId = null;
  render();

  let movedSteps = 0;
  let movedCost = 0;
  let stoppedByOpportunityDamage = false;
  for (const step of path) {
    const opportunityAttackers = Object.values(state.fighters).filter((candidate) => canOpportunityAttack(candidate, fighter, fighter.position, step));
    for (const attacker of opportunityAttackers) {
      if (!(await shouldTakeOpportunityAttack(attacker, fighter))) continue;
      await opportunityAttack(attacker, fighter);
      if (!fighter.alive || fighter.hp <= 0) {
        stoppedByOpportunityDamage = true;
        break;
      }
      if (state.mode === "combat" && fighter.movementLeft <= 0) break;
    }
    if (!fighter.alive || fighter.hp <= 0 || (state.mode === "combat" && fighter.movementLeft <= 0)) break;
    if (!canMoveGrabbedEntityWithCarrier(fighter, fighter.position, step)) {
      addLog(`${fighter.name} cannot drag ${grabbedEntityMovementLabel(fighter)} any farther.`, "important");
      break;
    }

    const previousPosition = { ...fighter.position };
    const previousRoomId = roomForPosition(fighter.position)?.id ?? "";
    fighter.position = { ...step };
    moveGrabbedEntityWithCarrier(fighter, previousPosition, step);
    const nextRoom = roomForPosition(fighter.position);
    if (isPlayerControlledPartyFighter(fighter) && nextRoom && nextRoom.id !== previousRoomId) {
      checkPassiveHiddenDoorsForRoom(nextRoom);
      void triggerCustomDungeonStory("enterRoom", { roomId: nextRoom.id, room: nextRoom, fighter });
    }
    movedSteps += 1;
    movedCost += movementCostAtPosition(step, fighter);
    if (isPlayerControlledPartyFighter(fighter) && !checkStealthProximity(fighter, previousPosition)) break;
    collectLootAtPosition(fighter, step);
    triggerTrapAtPosition(fighter, step);
    triggerGrabbedEntityTileEffects(fighter, previousPosition);
    if (state.mode !== "combat" && isPlayerControlledPartyFighter(fighter)) moveAutonomousAlliesWithLeaderStep(fighter);
    const usedPortal = triggerPortalAtPosition(fighter, fighter.position);
    const openedDoor = autoOpenAdjacentExplorationDoor(fighter);
    render();
    const explorationFollowerMove = silent && state.mode !== "combat" && isAutonomousAlly(fighter);
    const normalDelay = movedSteps > longMoveFastAfterSteps ? Math.max(25, Math.round(tokenSlideMs * longMoveFastMultiplier)) : tokenSlideMs;
    const stepDelay = explorationFollowerMove ? Math.max(20, Math.round(tokenSlideMs * 0.25)) : normalDelay;
    await sleep(stepDelay);
    if (!fighter.alive || fighter.hp <= 0) break;
    if (usedPortal) {
      movementInProgress = false;
      dragPath = null;
      dragHeroId = null;
      render();
      break;
    }
    if (openedDoor && threatPresent()) break;
  }

  if (state.mode === "combat") {
    fighter.movementLeft = Math.max(0, fighter.movementLeft - movedCost);
  }
  fighter.lastMoveFeet = movedSteps * feetPerSquare;

  if (!silent) {
    const suffix = state.mode === "combat" ? ` ${fighter.movementLeft * feetPerSquare} ft remains.` : "";
    const dragText = fighterIsDraggingEntity(fighter) ? " while dragging" : "";
    addLog(`${fighter.name} moves ${movedSteps * feetPerSquare} ft${dragText}.${suffix}`);
    if (stoppedByOpportunityDamage) addLog(`${fighter.name}'s movement stops where the opportunity attack landed.`, "important");
  }

  movementInProgress = false;
  if (state.mode !== "combat" && isPlayerControlledPartyFighter(fighter)) await moveAutonomousAlliesNearLeader(fighter);
  if (fighter.hp > 0 && isPlayerControlledPartyFighter(fighter) && checkDungeonCompletion(fighter)) return true;
  render();
  return true;
}

async function moveFighter(fighter, destination, silent = false) {
  const path = findMovementPath(fighter, destination);
  return moveFighterAlongPath(fighter, path, silent);
}

function moveGrabbedEntityWithCarrier(carrier, previousCarrierPosition, carrierStep) {
  const grabbedFighter = grabbedFighterForCarrier(carrier);
  if (grabbedFighter) {
    grabbedFighter.position = { ...previousCarrierPosition };
    return;
  }

  const grabbedObject = grabbedObjectForCarrier(carrier);
  if (!grabbedObject) return;
  const dx = carrierStep.x - previousCarrierPosition.x;
  const dy = carrierStep.y - previousCarrierPosition.y;
  grabbedObject.position = {
    x: grabbedObject.position.x + dx,
    y: grabbedObject.position.y + dy,
  };
}

function canMoveGrabbedEntityWithCarrier(carrier, previousCarrierPosition, carrierStep) {
  const grabbedFighter = grabbedFighterForCarrier(carrier);
  if (grabbedFighter) {
    return Boolean(
      window.DungeonGrid.isInsideGrid(previousCarrierPosition, currentGridSize()) &&
        movementWalkableFor(grabbedFighter).has(positionKey(previousCarrierPosition)) &&
        (!window.DungeonGrid.isOccupied(previousCarrierPosition, state.fighters, grabbedFighter) ||
          positionKey(carrier.position) === positionKey(previousCarrierPosition)),
    );
  }

  const grabbedObject = grabbedObjectForCarrier(carrier);
  if (!grabbedObject) return true;
  const dx = carrierStep.x - previousCarrierPosition.x;
  const dy = carrierStep.y - previousCarrierPosition.y;
  const movedObject = {
    ...grabbedObject,
    position: { x: grabbedObject.position.x + dx, y: grabbedObject.position.y + dy },
  };
  const walkable = movementWalkableFor(carrier);
  return objectCells(movedObject).every((cell) =>
    window.DungeonGrid.isInsideGrid(cell, currentGridSize()) &&
      walkable.has(positionKey(cell)) &&
      !Object.values(state.fighters).some((fighter) =>
        fighter.alive &&
          fighter.id !== carrier.id &&
          fighter.position.x === cell.x &&
          fighter.position.y === cell.y,
      ),
  );
}

function triggerGrabbedEntityTileEffects(carrier, previousCarrierPosition) {
  const grabbedFighter = grabbedFighterForCarrier(carrier);
  if (!grabbedFighter?.alive) return;
  collectLootAtPosition(grabbedFighter, previousCarrierPosition);
  triggerTrapAtPosition(grabbedFighter, previousCarrierPosition);
}

function grabbedEntityMovementLabel(carrier) {
  const grabbedFighter = grabbedFighterForCarrier(carrier);
  if (grabbedFighter) return grabbedFighter.name;
  const grabbedObject = grabbedObjectForCarrier(carrier);
  return objectTemplate(grabbedObject?.type)?.name ?? "that";
}

function autonomousPartyAllies() {
  return partyHeroes().filter((fighter) => isAutonomousAlly(fighter) && heroCanAct(fighter));
}

function mainPartyLeaderForFollowers(preferredLeader = activeHero()) {
  if (preferredLeader?.alive && isClassHero(preferredLeader)) return preferredLeader;
  return (
    (state.party?.heroIds ?? [])
      .map((id) => state.fighters[id])
      .find((fighter) => fighter?.alive && isClassHero(fighter)) ??
    preferredLeader ??
    activeHero()
  );
}

function followDistanceForAlly(ally) {
  return Math.max(1, Math.min(5, Number(ally?.followDistanceSquares ?? 3) || 3));
}

function followLeaderForAlly(ally, preferredLeader = activeHero()) {
  const assigned = state.fighters?.[ally?.followHeroId];
  if (assigned?.alive && isClassHero(assigned) && isPartyHeroId(assigned.id)) return assigned;
  return mainPartyLeaderForFollowers(preferredLeader);
}

function followTargetPositionForAlly(ally, leader) {
  const followDistance = followDistanceForAlly(ally);
  const walkable = aiAllySafeWalkableFor(ally);
  const occupied = new Set(
    Object.values(state.fighters)
      .filter((fighter) => fighter.alive && fighter.id !== ally.id)
      .flatMap((fighter) => window.DungeonGrid.fighterCells(fighter).map(positionKey)),
  );
  return Array.from(walkable)
    .map(positionFromKey)
    .filter((position) => distance(position, leader.position) <= followDistance)
    .filter((position) => !occupied.has(positionKey(position)))
    .sort((a, b) => distance(ally.position, a) - distance(ally.position, b) || distance(a, leader.position) - distance(b, leader.position))[0] ?? null;
}

function moveAutonomousAlliesWithLeaderStep(preferredLeader = activeHero()) {
  if (state.mode === "combat") return;
  for (const ally of autonomousPartyAllies()) {
    const leader = followLeaderForAlly(ally, preferredLeader);
    if (!leader?.alive) continue;
    if (distance(ally.position, leader.position) <= followDistanceForAlly(ally)) continue;
    const destination = followTargetPositionForAlly(ally, leader);
    if (!destination) continue;
    const step = adjacentCells(ally.position)
      .filter((position) => isValidPathStep(ally, ally.position, position, []))
      .filter((position) => isAiAllySafeStep(ally, position, destination))
      .sort((a, b) => distance(a, destination) - distance(b, destination) || distance(a, leader.position) - distance(b, leader.position))[0];
    if (!step || !isValidPathStep(ally, ally.position, step, [])) continue;
    ally.position = { ...step };
    ally.lastMoveFeet = (ally.lastMoveFeet ?? 0) + feetPerSquare;
    collectLootAtPosition(ally, step);
    triggerTrapAtPosition(ally, step);
  }
}

async function moveAutonomousAlliesNearLeader(preferredLeader = activeHero()) {
  if (state.mode === "combat") return;
  await Promise.all(
    autonomousPartyAllies().map(async (ally) => {
      const leader = followLeaderForAlly(ally, preferredLeader);
      if (!leader?.alive) return;
      if (distance(ally.position, leader.position) <= followDistanceForAlly(ally)) return;
      const destination = followTargetPositionForAlly(ally, leader);
      if (!destination) return;
      const path = findMovementPathWithWalkable(ally, destination, aiAllySafeWalkableFor(ally, destination));
      if (path?.length) await moveFighterAlongPath(ally, path.slice(0, Math.floor(ally.speedFeet / feetPerSquare)), true);
    }),
  );
}

function occupiedByUnselectedHeroOrObstacle(position, movingHeroIds) {
  return Object.values(state.fighters).some(
    (fighter) =>
      fighter.alive &&
      window.DungeonGrid.fighterOccupies(fighter, position) &&
      !movingHeroIds.has(fighter.id),
  );
}

function groupMoveDestinations(destination, heroes, anchorHero = heroes[0], anchorPath = null) {
  const movingHeroIds = new Set(heroes.map((hero) => hero.id));
  const walkable = new Set(state.mode === "home" || state.mode === "exploration" ? visibleWalkable(anchorHero) : movementWalkableFor(anchorHero));
  hazardousTerrainKeys(anchorHero).forEach((tileKey) => walkable.delete(tileKey));
  const unselectedBlockedKeys = new Set(
    Object.values(state.fighters)
      .filter((fighter) => fighter.alive && !movingHeroIds.has(fighter.id))
      .flatMap((fighter) => window.DungeonGrid.fighterCells(fighter).map(positionKey)),
  );
  const assigned = new Set();
  const sortedHeroes = [
    anchorHero,
    ...heroes
      .filter((hero) => hero.id !== anchorHero?.id)
      .sort((a, b) => distance(a.position, destination) - distance(b.position, destination)),
  ].filter(Boolean);
  const destinationRoom = roomForPosition(destination);
  const candidateAreaPenalty = (position) => {
    const room = roomForPosition(position);
    if (destinationRoom) return room?.id === destinationRoom.id ? 0 : 30;
    return room ? 18 : 0;
  };
  const candidates = Array.from(walkable)
    .map(positionFromKey)
    .filter((position) => !unselectedBlockedKeys.has(positionKey(position)))
    .sort((a, b) => candidateAreaPenalty(a) - candidateAreaPenalty(b) || distance(a, destination) - distance(b, destination))
    .slice(0, Math.max(48, heroes.length * 18));

  const plans = [];
  for (const hero of sortedHeroes) {
    const heroWalkable = new Set(state.mode === "home" || state.mode === "exploration" ? visibleWalkable(hero) : movementWalkableFor(hero));
    hazardousTerrainKeys(hero).forEach((tileKey) => heroWalkable.delete(tileKey));
    if (hero.id === anchorHero?.id && Array.isArray(anchorPath) && anchorPath.length) {
      const key = positionKey(destination);
      if (!heroWalkable.has(key) || unselectedBlockedKeys.has(key)) return [];
      plans.push({ hero, destination, path: anchorPath });
      assigned.add(key);
      continue;
    }
    const heroCandidates =
      plans.length === 0
        ? [destination, ...candidates]
        : candidates;
    let selected = null;
    let attempts = 0;
    for (const position of heroCandidates) {
      if (attempts >= 24 && selected) break;
      const key = positionKey(position);
      if (assigned.has(key)) continue;
      if (!heroWalkable.has(key)) continue;
      if (unselectedBlockedKeys.has(key)) continue;
      attempts += 1;
      const path = findMovementPathWithWalkable(hero, position, heroWalkable);
      if (!path?.length && positionKey(hero.position) !== key) continue;
      const pathLength = path?.length ?? 0;
      const finalDistance = distance(position, destination);
      const score = candidateAreaPenalty(position) + finalDistance * 4 + pathLength;
      const option = { hero, destination: position, path: path ?? [], key, score, pathLength, finalDistance };
      if (!selected || option.score < selected.score || (option.score === selected.score && option.pathLength < selected.pathLength)) selected = option;
      if (finalDistance <= 1 && pathLength <= Math.max(1, distance(hero.position, position) + 2)) break;
    }
    if (!selected) return [];
    plans.push({ hero, destination: selected.destination, path: selected.path });
    assigned.add(selected.key);
  }

  return plans;
}

async function moveFightersAlongPathsTogether(plans) {
  const activePlans = plans.filter((plan) => plan.path.length > 0);
  if (!activePlans.length) return false;

  movementInProgress = true;
  dragPath = null;
  dragHeroId = null;
  render();

  const maxLength = Math.max(...activePlans.map((plan) => plan.path.length));
  const blockedTrapKeys = detectedArmedTrapKeys();
  const blockedHazardKeys = hazardousTerrainKeys();
  const stoppedBeforeTrap = new Set();
  let stoppedByStealthDetection = false;
  for (let stepIndex = 0; stepIndex < maxLength; stepIndex += 1) {
    let anyMovedThisTick = false;
    for (const plan of activePlans) {
      if (plan.stoppedBeforeTrap) continue;
      const step = plan.path[stepIndex];
      if (!step || !plan.hero.alive) continue;
      const stepKey = positionKey(step);
      if (
        (blockedTrapKeys.has(stepKey) && detectedArmedTrapKeys(plan.hero).has(stepKey)) ||
        (blockedHazardKeys.has(stepKey) && hazardousTerrainKeys(plan.hero).has(stepKey))
      ) {
        plan.stoppedBeforeTrap = true;
        stoppedBeforeTrap.add(plan.hero.id);
        continue;
      }
      const previousPosition = { ...plan.hero.position };
      const previousRoomId = roomForPosition(plan.hero.position)?.id ?? "";
      plan.hero.position = { ...step };
      const nextRoom = roomForPosition(plan.hero.position);
      if (isPlayerControlledPartyFighter(plan.hero) && nextRoom && nextRoom.id !== previousRoomId) {
        checkPassiveHiddenDoorsForRoom(nextRoom);
        void triggerCustomDungeonStory("enterRoom", { roomId: nextRoom.id, room: nextRoom, fighter: plan.hero });
      }
      anyMovedThisTick = true;
      if (isPlayerControlledPartyFighter(plan.hero) && !checkStealthProximity(plan.hero, previousPosition)) {
        plan.stoppedBeforeTrap = true;
        stoppedByStealthDetection = true;
        continue;
      }
      collectLootAtPosition(plan.hero, step);
      if (triggerTrapAtPosition(plan.hero, step)) {
        const trap = objectAt(step);
        if (trap && objectIsTrap(trap)) objectCells(trap).forEach((cell) => blockedTrapKeys.add(positionKey(cell)));
      }
      triggerPortalAtPosition(plan.hero, plan.hero.position);
      autoOpenAdjacentExplorationDoor(plan.hero);
    }
    if (anyMovedThisTick) renderRoom();
    await sleep(Math.max(30, Math.round(tokenSlideMs * 0.35)));
    if (stoppedByStealthDetection) break;
  }

  for (const plan of activePlans) {
    const reachedIndex = plan.path.findIndex((step) => positionKey(step) === positionKey(plan.hero.position));
    plan.hero.lastMoveFeet = Math.max(0, reachedIndex + 1) * feetPerSquare;
  }
  addLog(`${activePlans.length} heroes move together.`);
  if (stoppedBeforeTrap.size > 0) addLog("The party stops short of danger instead of marching everyone through it.", "important");
  movementInProgress = false;
  await moveAutonomousAlliesNearLeader(activePlans[0]?.hero);
  const exitHero = activePlans.map((plan) => plan.hero).find((hero) => isPlayerControlledPartyFighter(hero) && isExitPosition(hero.position));
  if (exitHero && checkDungeonCompletion(exitHero)) return true;
  render();
  return true;
}

async function moveSelectedHeroesTo(destination, anchorHero, anchorPath = null) {
  if (state.mode === "combat") return false;
  const heroes = selectedMovableHeroes(anchorHero.id);
  if (heroes.length <= 1) return false;
  const plans = groupMoveDestinations(destination, heroes, anchorHero, anchorPath);
  if (plans.length !== heroes.length) return false;
  return moveFightersAlongPathsTogether(plans);
}

function canAdminTeleportTo(position) {
  if (!adminEnabled() || !adminTeleportEnabled) return false;
  const key = positionKey(position);
  if (!window.DungeonGrid.isInsideGrid(position, currentGridSize())) return false;
  if (!isKnownTile(position)) return false;
  if (!dungeonFloorKeys().has(key)) return false;
  if (blockingObjectKeys().has(key)) return false;
  if (!canFighterOccupyPosition(activeHero(), position, currentWalkable(activeHero()))) return false;
  return true;
}

function adminTeleportHero(position) {
  const hero = activeHero();
  if (!hero?.alive || state.completed) return false;
  if (!canAdminTeleportTo(position)) {
    addLog("Admin teleport needs an empty dungeon floor, room, door, or hallway tile.", "important");
    render();
    return false;
  }

  hero.position = { ...position };
  const nextRoom = roomForPosition(hero.position);
  if (nextRoom) {
    checkPassiveHiddenDoorsForRoom(nextRoom);
    void triggerCustomDungeonStory("enterRoom", { roomId: nextRoom.id, room: nextRoom, fighter: hero });
  }
  dragPath = null;
  dragHeroId = null;
  collectLootAtPosition(hero, position);
  triggerTrapAtPosition(hero, position);
  autoOpenAdjacentExplorationDoor(hero);
  addLog(`Admin teleported ${hero.name}.`, "important");
  if (checkDungeonCompletion()) return true;
  render();
  window.requestAnimationFrame(nudgeViewForHeroNearEdge);
  return true;
}

function handleTileClick(position) {
  const hero = activeHero();
  if (suppressNextTileClick) {
    suppressNextTileClick = false;
    return;
  }
  if (pendingSpellTargeting) {
    suppressInspectionAfterTargetSelection();
    void confirmPendingSpellTarget(position);
    return;
  }
  if (pendingEldritchBlast) {
    suppressInspectionAfterTargetSelection();
    void confirmPendingEldritchBlast(position);
    return;
  }
  if (applyHomeBuildAt(position)) return;
  if (movementInProgress || dragPath) return;
  if (adminEnabled() && adminTeleportEnabled) {
    adminTeleportHero(position);
    return;
  }
  if (state.mode === "combat" && (activeFighter()?.id !== hero?.id || !combatNeedsHeroTurns())) return;
  if (state.mode === "combat" && hero.hp <= 0) return;

  if (canHeroUseHomeExit(hero) && isExitPosition(position) && distance(hero.position, position) <= 1) {
    showHomeMenu();
    return;
  }

  if (state.completed) return;

  if (toggleHomeDoor(position, hero)) return;

  const door = canOpenDoor(position);
  if (door) {
    openDoor(door, hero);
    return;
  }

  if (state.mode === "exploration" && threatPresent()) {
    addLog("A hostile creature is present. Roll initiative before moving.");
    render();
    return;
  }

  if (hero.position.x !== position.x || hero.position.y !== position.y) {
    addLog(`Drag ${hero.name} through each square to move.`);
    render();
  }
}

async function moveHeroByKeyboard(delta) {
  if (!gameHasStarted || movementInProgress || dragPath || state.completed) return;
  const hero = activeHero();
  if (!heroCanAct(hero)) return;
  if (isAutonomousAlly(hero)) return;
  if (state.mode === "combat" && (activeFighter()?.id !== hero.id || !combatNeedsHeroTurns())) return;
  if (state.mode === "combat" && hero.hp <= 0) return;

  const destination = { x: hero.position.x + delta.x, y: hero.position.y + delta.y };
  if (!window.DungeonGrid.isInsideGrid(destination, currentGridSize())) return;

  const door = canOpenDoor(destination);
  if (door) {
    openDoor(door, hero);
    return;
  }

  if (state.mode === "exploration" && threatPresent()) {
    addLog("A hostile creature is present. Roll initiative before moving.");
    render();
    return;
  }

  if (state.mode !== "combat" && selectedMovableHeroes(hero.id).length > 1) {
    const movedTogether = await moveSelectedHeroesTo(destination, hero);
    if (movedTogether) {
      window.requestAnimationFrame(nudgeViewForHeroNearEdge);
      return true;
    }
  }

  if (!isValidPathStep(hero, hero.position, destination, [])) return;
  await moveFighterAlongPath(hero, [destination]);
  window.requestAnimationFrame(nudgeViewForHeroNearEdge);
  return true;
}

function movementDeltaForKey(key) {
  const movementKeys = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
  };
  return movementKeys[key] ?? null;
}

function clearHeldMovementKeys() {
  heldMovementKeys.clear();
}

function startHeldMovement(key, delta) {
  if (heldMovementKeys.has(key)) return;

  const entry = { active: true, moving: false, timer: null };
  heldMovementKeys.set(key, entry);

  const step = async () => {
    if (!entry.active || entry.moving) return;
    entry.moving = true;
    const moved = await moveHeroByKeyboard(delta);
    entry.moving = false;
    if (!entry.active || !moved) {
      stopHeldMovement(key);
      return;
    }
    entry.timer = window.setTimeout(step, 45);
  };

  step();
}

function stopHeldMovement(key) {
  const entry = heldMovementKeys.get(key);
  if (!entry) return;
  entry.active = false;
  if (entry.timer) window.clearTimeout(entry.timer);
  heldMovementKeys.delete(key);
}

function partyHeroes() {
  return (state.party?.heroIds ?? ["hero"])
    .map((id) => state.fighters[id])
    .filter((fighter) => fighter?.alive && !fighter.dead);
}

function monsterTargetableHeroes() {
  return partyHeroes().filter((fighter) => (fighter.hp ?? 0) > 0);
}

function aiTargetableEnemiesFor(fighter) {
  return Object.values(state.fighters).filter((candidate) => candidate?.alive && !candidate.dead && (candidate.hp ?? 0) > 0 && hostileTo(fighter, candidate));
}

function partyRoleFor(fighter) {
  if ((state.party?.heroIds ?? ["hero"]).length <= 1 && fighter?.id === "hero") return "tank";
  return fighter?.partyRole ?? "dd";
}

function visibleTrapKeysForMonster(monster) {
  if (abilityScore(monster, "wis") <= 10) return new Set();
  const keys = new Set();
  for (const object of state.dungeonObjects ?? []) {
    if (!objectIsTrap(object) || !object.detected || object.spent || object.disarmed || object.armed === false) continue;
    if (fighterIsFlying(monster) && objectHasTag(object, "floor")) continue;
    objectCells(object).forEach((cell) => keys.add(positionKey(cell)));
  }
  return keys;
}

function monsterMovementWalkable(monster, baseWalkable = null) {
  const base = baseWalkable ?? currentWalkable(monster);
  const walkable = new Set(base);
  visibleTrapKeysForMonster(monster).forEach((tileKey) => {
    if (tileKey !== positionKey(monster.position)) walkable.delete(tileKey);
  });
  return walkable;
}

function consumeMonsterPathfindingJob(monster, force = false) {
  if (!monster || !monster.alive) return false;
  if (force) {
    perfStats.pathfindingJobs += 1;
    perfStats.pathfindingJobsLastFrame += 1;
    return true;
  }
  if (pathfindingJobsThisTurn >= monsterPathfindingBudgetPerTurn) return false;
  pathfindingJobsThisTurn += 1;
  perfStats.pathfindingJobs += 1;
  perfStats.pathfindingJobsLastFrame += 1;
  return true;
}

function monsterReachableTiles(monster, options) {
  if (!consumeMonsterPathfindingJob(monster, options?.forcePathfinding)) return new Map();
  return reachableTiles(monster, state.fighters, {
    moveCost: (_from, to) => movementCostAtPosition(to, monster),
    ...options,
    canEnterOccupied: options?.canEnterOccupied ?? ((position) => canMoveThroughOccupiedTile(monster, position)),
    canOccupy: options?.canOccupy ?? ((position) => canFighterOccupyPosition(monster, position, options?.walkable ?? monsterMovementWalkable(monster), true)),
  });
}

function pathProvokesOpportunity(mover, path = []) {
  let from = mover.position;
  for (const step of path) {
    if (Object.values(state.fighters).some((candidate) => canOpportunityAttack(candidate, mover, from, step))) return true;
    from = step;
  }
  return false;
}

function canAttackFromPosition(attacker, target, position) {
  const range = attackRangeSquares(attacker);
  const movedAttacker = { ...attacker, position };
  if (range <= 1) {
    return hasMeleeAccess(movedAttacker, target);
  }
  return attackGridDistanceBetweenFighters(movedAttacker, target) <= range && hasClearLineOfSightBetweenFighters(movedAttacker, target);
}

function fighterDistanceFromPosition(fighter, position, target) {
  return attackGridDistanceBetweenFighters({ ...fighter, position }, target);
}

function pathForMonster(monster, destination, walkable = monsterMovementWalkable(monster), options = {}) {
  if (!consumeMonsterPathfindingJob(monster, options.forcePathfinding)) return null;
  return findPath(monster.position, destination, monster, state.fighters, {
    gridSize: currentGridSize(),
    walkable,
    canTraverse: (from, to, path) => canTraverseFootprintMovementEdge(monster, from, to, path),
    stateKey: (position, path) => movementStateKey(monster, position, path),
    canEnterOccupied: (position) => canMoveThroughOccupiedTile(monster, position),
    canOccupy: (position) => canFighterOccupyPosition(monster, position, walkable, true),
  });
}

function isRoomKitingBehavior(behavior) {
  return ["rangedKiter", "artillery", "controller"].includes(behavior);
}

function attackPlanAgainst(monster, target, avoidOpportunity = false, baseWalkable = null, options = {}) {
  const monsterRoom = isRoomKitingBehavior(effectiveMonsterBehavior(monster)) ? roomForPosition(monster.position) : null;
  const movementBase = monsterRoom ? roomWalkableSet(monsterRoom, monster) : baseWalkable;
  const walkable = monsterMovementWalkable(monster, movementBase);
  const reachable = Array.from(
    monsterReachableTiles(monster, {
      gridSize: currentGridSize(),
      walkable,
      maxCost: monster.movementLeft,
      canTraverse: (from, to, path) => canTraverseFootprintMovementEdge(monster, from, to, path),
      stateKey: (position, path) => movementStateKey(monster, position, path),
      forcePathfinding: options.forcePathfinding,
    }).keys(),
  ).map(positionFromKey);

  const candidates = [monster.position, ...reachable]
    .filter((position, index, positions) => positions.findIndex((entry) => positionKey(entry) === positionKey(position)) === index)
    .filter((position) => positionKey(position) === positionKey(monster.position) || canEndMovementOnTile(monster, position))
    .filter((position) => canAttackFromPosition(monster, target, position))
    .map((position) => {
      const path = positionKey(position) === positionKey(monster.position) ? [] : pathForMonster(monster, position, walkable, options);
      return path ? { target, position, path, cost: path.length } : null;
    })
    .filter(Boolean)
    .filter((plan) => !avoidOpportunity || !pathProvokesOpportunity(monster, plan.path));

  return candidates.sort((a, b) => a.cost - b.cost || fighterDistanceFromPosition(monster, a.position, target) - fighterDistanceFromPosition(monster, b.position, target))[0] ?? null;
}

function closestTargetTo(monster, targets = aiTargetableEnemiesFor(monster)) {
  const candidates = targets.filter((target) => (target.hp ?? 0) > 0);
  return candidates.slice().sort((a, b) => attackGridDistanceBetweenFighters(monster, a) - attackGridDistanceBetweenFighters(monster, b) || a.id.localeCompare(b.id))[0] ?? null;
}

function lowestLifeTarget(targets) {
  return targets
    .slice()
    .sort((a, b) => a.hp / Math.max(1, a.maxHp) - b.hp / Math.max(1, b.maxHp) || a.hp - b.hp || a.id.localeCompare(b.id))[0] ?? null;
}

function monsterTargetsInCurrentAttackRange(monster) {
  return aiTargetableEnemiesFor(monster).filter((target) => isInAttackRange(monster, target));
}

function chooseMonsterMultiattackTarget(monster, preferredTarget = null, previousTarget = null) {
  const candidates = monsterTargetsInCurrentAttackRange(monster);
  if (!candidates.length) return null;
  const config = typeof monsterMultiattackConfig === "function" ? monsterMultiattackConfig(monster) : null;
  if (preferredTarget && candidates.some((target) => target.id === preferredTarget.id)) return preferredTarget;
  if (config?.switchTargets && previousTarget && candidates.length > 1) {
    return lowestLifeTarget(candidates.filter((target) => target.id !== previousTarget.id)) ?? lowestLifeTarget(candidates);
  }
  if (previousTarget && candidates.some((target) => target.id === previousTarget.id)) return previousTarget;
  return lowestLifeTarget(candidates) ?? closestTargetTo(monster, candidates);
}

async function performMonsterAttackSequence(monster, initialTarget) {
  const config = typeof monsterMultiattackConfig === "function" ? monsterMultiattackConfig(monster) : null;
  const maxAttacks = config?.attacks ?? 1;
  let previousTarget = null;
  for (let attackIndex = 0; attackIndex < maxAttacks; attackIndex += 1) {
    if (activeFighter()?.id !== monster.id || !monster.hasAction || !monster.alive || partyDefeatedOrDying()) return;
    const target = chooseMonsterMultiattackTarget(monster, attackIndex === 0 ? initialTarget : null, previousTarget);
    if (!target) {
      addAdminLog(`${monster.name} has no in-range target for attack ${attackIndex + 1}/${maxAttacks}.`);
      return;
    }
    if (previousTarget && target.id !== previousTarget.id) {
      addAdminLog(`${monster.name} switches multiattack target from ${previousTarget.name} to ${target.name}.`);
    }
    await makeAttack(monster, target, { actionLabel: attackIndex > 0 ? "follows up against" : undefined });
    previousTarget = target;
    if (attackIndex < maxAttacks - 1 && monster.hasAction) await sleep(Math.max(100, Math.floor(tokenSlideMs / 2)));
  }
}

function monsterTacticalTags(monster) {
  return new Set((monster?.tags ?? []).map((tag) => String(tag).toLowerCase()));
}

function monsterTacticalText(monster) {
  const specialNames = typeof monsterSpecialNames === "function" ? monsterSpecialNames(monster) : monster?.specialAbility ?? [];
  return `${monster?.role ?? ""} ${monster?.name ?? ""} ${(specialNames ?? []).join(" ")} ${(monster?.tags ?? []).join(" ")}`.toLowerCase();
}

function hasTacticalCue(monster, tags = [], pattern = null) {
  const tagSet = monsterTacticalTags(monster);
  return tags.some((tag) => tagSet.has(tag)) || Boolean(pattern && pattern.test(monsterTacticalText(monster)));
}

function effectiveMonsterBehavior(monster) {
  const behavior = monster?.behavior ?? "melee";
  if (behavior === "swarm") return "swarm";
  if (behavior === "rangedKiter") {
    if (hasTacticalCue(monster, ["controller"], /bind|snare|chain|grapple|charm|hex|command|compulsion|mist|fog|silence|zone|aura|screen|cover|lock/i)) return "controller";
    if (hasTacticalCue(monster, ["artillery", "caster", "ranged"], /mortar|volley|shot|spear|blast|fireball|bolt|ray|toss|breath|spit/i)) return "artillery";
    return "rangedKiter";
  }
  if (hasTacticalCue(monster, ["controller", "caster"], /bind|snare|chain|grapple|constrict|charm|hex|command|compulsion|possession|fog|mist|aura|screen|cover|lock/i)) return "controller";
  if (hasTacticalCue(monster, ["charger", "trampler", "ravager"], /charge|pounce|lunge|rush|stampede|stomp|slam|advance|dive|pouncing|crash/i)) return "charger";
  if (hasTacticalCue(monster, ["skirmisher", "hunter", "duelist", "stalker", "flying"], /skirmisher|hunter|duelist|stalker|ambush|flanker|runner|fast|flying/i)) return "skirmisher";
  if (hasTacticalCue(monster, ["guardian", "myrmidon", "soldier"], /guardian|guard|defender|sentinel|soldier|myrmidon|armored|shield/i)) return "guardian";
  if (hasTacticalCue(monster, ["brute", "colossus", "titan", "beast"], /brute|colossus|giant|titan|massive|huge|heavy|crusher|executioner/i)) return "brute";
  return behavior;
}

function chooseMonsterAttackPlan(monster, options = {}) {
  const targets = aiTargetableEnemiesFor(monster);
  if (targets.length === 0) return null;
  const intelligence = abilityScore(monster, "int");
  const smarterMovement = options.avoidOpportunity ?? intelligence >= 11;
  const targetPriority = (target, { preferWeak = false, preferHealer = false } = {}) => {
    const close = attackGridDistanceBetweenFighters(monster, target);
    const hpRatio = target.hp / Math.max(1, target.maxHp);
    const distanceScore = options.preferDistant ? -close * 0.85 : close * 1.25;
    const weakBias = preferWeak ? hpRatio * 2 : hpRatio * 0.65;
    const healerBias = preferHealer && partyRoleFor(target) === "heal" ? -1.5 : 0;
    const woundedBias = options.preferWounded ? hpRatio * 2.5 : 0;
    const nearestBias = options.preferNearest ? close * 2 : 0;
    return distanceScore + nearestBias + weakBias + woundedBias + healerBias + Math.random() * (options.randomness ?? 3.25);
  };
  const randomizedTargets = (targetOptions = {}) => {
    const priorityOptions = {
      preferWeak: Boolean(options.preferWeak || targetOptions.preferWeak),
      preferHealer: Boolean(options.preferHealer || targetOptions.preferHealer),
    };
    return targets.slice().sort((a, b) => targetPriority(a, priorityOptions) - targetPriority(b, priorityOptions));
  };

  const planFor = (target, avoid = smarterMovement) => target ? attackPlanAgainst(monster, target, avoid) : null;
  const preferredPlan = (avoid = smarterMovement, options = {}) => {
    const sorted = randomizedTargets(options);
    return sorted.map((target) => planFor(target, avoid)).find(Boolean) ?? null;
  };

  if (intelligence < 5) {
    const revengeTarget = Math.random() < 0.55 ? targets.find((target) => target.id === monster.lastDamagedById) : null;
    return planFor(revengeTarget, false) ?? preferredPlan(false);
  }
  if (intelligence < 10) return preferredPlan(false);
  if (intelligence <= 14) {
    const lowTarget = Math.random() < 0.45 ? lowestLifeTarget(targets) : null;
    return planFor(lowTarget, true) ?? preferredPlan(true, { preferWeak: true }) ?? preferredPlan(false, { preferWeak: true });
  }

  const healer = Math.random() < 0.45 ? targets.find((target) => partyRoleFor(target) === "heal") : null;
  return planFor(healer, true) ?? preferredPlan(true, { preferHealer: true, preferWeak: true }) ?? preferredPlan(false, { preferHealer: true });
}

function bestPathToward(mover, target, avoidOpportunity = false, options = {}) {
  const walkable = monsterMovementWalkable(mover);
  if (isAutonomousAlly(mover)) {
    hazardousTerrainKeys(mover).forEach((tileKey) => {
      if (tileKey !== positionKey(mover.position)) walkable.delete(tileKey);
    });
  }
  const reachable = Array.from(
    monsterReachableTiles(mover, {
      gridSize: currentGridSize(),
      walkable,
      canTraverse: (from, to, path) => canTraverseFootprintMovementEdge(mover, from, to, path),
      stateKey: (position, path) => movementStateKey(mover, position, path),
      forcePathfinding: options.forcePathfinding,
    }).entries(),
  ).map(([key, cost]) => {
    const [x, y] = key.split(",").map(Number);
    return { position: { x, y }, cost };
  });

  if (reachable.length === 0) return null;

  reachable.sort((a, b) => {
    const distanceDifference = fighterDistanceFromPosition(mover, a.position, target) - fighterDistanceFromPosition(mover, b.position, target);
    return distanceDifference || b.cost - a.cost;
  });

  for (const entry of reachable) {
    if (!canEndMovementOnTile(mover, entry.position)) continue;
    const path = pathForMonster(mover, entry.position, walkable, { forcePathfinding: options.forcePathfinding });
    if (path && (!avoidOpportunity || !pathProvokesOpportunity(mover, path))) return path;
  }
  return null;
}

function normalRangeSquares(fighter) {
  const range = damageProfile(fighter).range;
  return Math.max(1, Math.floor((range?.normal ?? range?.feet ?? 5) / feetPerSquare));
}

function positionThreatenedByEnemy(mover, position) {
  return aiTargetableEnemiesFor(mover).some((enemy) => opportunityThreatensPosition(enemy, mover, position));
}

function roomWalkableSet(room, fighter = null) {
  const walkable = new Set((room?.cells ?? []).map(positionKey));
  blockingObjectKeys(fighter).forEach((tileKey) => walkable.delete(tileKey));
  return fighter ? monsterMovementWalkable(fighter, walkable) : walkable;
}

function roomOnlyPath(mover, destination, room, options = {}) {
  const walkable = roomWalkableSet(room, mover);
  if (!consumeMonsterPathfindingJob(mover, options.forcePathfinding)) return null;
  return findPath(mover.position, destination, mover, state.fighters, {
    gridSize: currentGridSize(),
    walkable,
    canTraverse: (from, to, path) => canTraverseFootprintMovementEdge(mover, from, to, path),
    canOccupy: (position) => canFighterOccupyPosition(mover, position, walkable, true),
  });
}

function bestRoomKitePath(mover, target, avoidOpportunity = false, options = {}) {
  const room = roomForPosition(mover.position);
  if (!room) return null;

  const range = normalRangeSquares(mover);
  const avoidMelee = options.avoidMelee !== false;
  const reachable = Array.from(
    monsterReachableTiles(mover, {
      gridSize: currentGridSize(),
      walkable: roomWalkableSet(room, mover),
      maxCost: options.maxCost ?? mover.movementLeft,
      canTraverse: (from, to, path) => canTraverseFootprintMovementEdge(mover, from, to, path),
      forcePathfinding: options.forcePathfinding,
    }).entries(),
  ).map(([key, cost]) => ({ position: positionFromKey(key), cost }));

  const current = { position: mover.position, cost: 0 };
  const reachableStops = reachable.filter((entry) => canEndMovementOnTile(mover, entry.position));
  const candidates = [current, ...reachableStops].filter(
    (entry) => canAttackFromPosition(mover, target, entry.position),
  );
  const safeCandidates = avoidMelee ? candidates.filter((entry) => !positionThreatenedByEnemy(mover, entry.position)) : candidates;
  const pool = safeCandidates.length ? safeCandidates : candidates.length ? candidates : [current, ...reachableStops];
  if (pool.length === 0) return null;

  pool.sort((a, b) => {
    const attackablePool = safeCandidates.length || candidates.length;
    const threatenedDifference = Number(positionThreatenedByEnemy(mover, a.position)) - Number(positionThreatenedByEnemy(mover, b.position));
    if (threatenedDifference) return threatenedDifference;
    if (options.preferShortStep) {
      const costDifference = a.cost - b.cost;
      if (costDifference) return costDifference;
    }
    const distanceDifference = attackablePool
      ? fighterDistanceFromPosition(mover, b.position, target) - fighterDistanceFromPosition(mover, a.position, target)
      : fighterDistanceFromPosition(mover, a.position, target) - fighterDistanceFromPosition(mover, b.position, target);
    return distanceDifference || a.cost - b.cost;
  });

  for (const entry of pool) {
    if (positionKey(entry.position) === positionKey(mover.position)) return null;
    const path = roomOnlyPath(mover, entry.position, room, options);
    if (path && (!avoidOpportunity || !pathProvokesOpportunity(mover, path))) return path;
  }
  return null;
}

function quickRangedRetreatPath(mover, target) {
  if (attackRangeSquares(mover) <= 1 || !positionThreatenedByEnemy(mover, mover.position) || (mover.movementLeft ?? 0) <= 0) return null;
  const room = roomForPosition(mover.position);
  if (!room) return null;

  const range = normalRangeSquares(mover);
  const maxCost = Math.min(2, mover.movementLeft ?? 0);
  const reachable = Array.from(
    monsterReachableTiles(mover, {
      gridSize: currentGridSize(),
      walkable: roomWalkableSet(room, mover),
      maxCost,
      canTraverse: (from, to, path) => canTraverseFootprintMovementEdge(mover, from, to, path),
      forcePathfinding: true,
    }).entries(),
  ).map(([key, cost]) => ({ position: positionFromKey(key), cost }));

  const candidates = reachable
    .filter((entry) => entry.cost > 0 && canEndMovementOnTile(mover, entry.position))
    .filter((entry) => !positionThreatenedByEnemy(mover, entry.position))
    .filter((entry) => canAttackFromPosition(mover, target, entry.position))
    .sort((a, b) => a.cost - b.cost || fighterDistanceFromPosition(mover, b.position, target) - fighterDistanceFromPosition(mover, a.position, target));

  for (const entry of candidates) {
    const path = roomOnlyPath(mover, entry.position, room, { forcePathfinding: true });
    if (path?.length) return path;
  }
  return null;
}

function swarmTargetFor(monster) {
  const monsterRoom = roomForPosition(monster.position);
  const targets = aiTargetableEnemiesFor(monster);
  if (!targets.length) return null;
  const sameRoomTargets = monsterRoom ? targets.filter((fighter) => roomForPosition(fighter.position)?.id === monsterRoom.id) : [];
  const candidates = sameRoomTargets.length ? sameRoomTargets : targets;
  const swarmMates = monsterRoom
    ? aliveMonsters().filter((entry) => entry.behavior === "swarm" && roomForPosition(entry.position)?.id === monsterRoom.id)
    : [monster];
  return candidates
    .sort((a, b) => {
      const distanceToA = Math.min(...swarmMates.map((entry) => attackGridDistanceBetweenFighters(entry, a)));
      const distanceToB = Math.min(...swarmMates.map((entry) => attackGridDistanceBetweenFighters(entry, b)));
      return distanceToA - distanceToB || a.id.localeCompare(b.id);
    })[0] ?? null;
}

function bestSwarmPath(mover, target) {
  if (hasMeleeAccess(mover, target)) return null;

  const walkable = monsterMovementWalkable(mover);
  const reachable = Array.from(
    monsterReachableTiles(mover, {
      gridSize: currentGridSize(),
      walkable,
      maxCost: mover.movementLeft,
      canTraverse: (from, to, path) => canTraverseFootprintMovementEdge(mover, from, to, path),
      stateKey: (position, path) => movementStateKey(mover, position, path),
    }).entries(),
  ).map(([key, cost]) => ({ position: positionFromKey(key), cost }));

  const targetRoom = roomForPosition(target.position);
  const adjacentOpen = Array.from(new Map(
    window.DungeonGrid.fighterCells(target)
      .flatMap((cell) => adjacentCells(cell))
      .filter((position) => !window.DungeonGrid.fighterOccupies(target, position))
      .map((position) => [positionKey(position), position]),
  ).values())
    .filter((position) => walkable.has(positionKey(position)))
    .filter((position) => !targetRoom || roomForPosition(position)?.id === targetRoom.id)
    .filter((position) => canEndMovementOnTile(mover, position))
    .filter((position) => canTraverseMovementEdge(mover, position, target.position, []));

  const adjacentKeys = new Set(adjacentOpen.map(positionKey));
  const candidates = reachable.filter((entry) => adjacentKeys.has(positionKey(entry.position)));
  const reachableStops = reachable.filter((entry) => canEndMovementOnTile(mover, entry.position));
  const pool = candidates.length ? candidates : reachableStops;
  if (pool.length === 0) return null;

  pool.sort((a, b) => {
    const distanceDifference = fighterDistanceFromPosition(mover, a.position, target) - fighterDistanceFromPosition(mover, b.position, target);
    return distanceDifference || a.cost - b.cost;
  });

  if (positionKey(pool[0].position) === positionKey(mover.position)) return null;
  return pathForMonster(mover, pool[0].position, walkable);
}

function healingItemsForAi(fighter) {
  return (fighter?.inventory?.items ?? []).filter((item) => ["healing", "fullHealing"].includes(item.use?.kind) && itemHasCharges(item));
}

function dyingClassHeroes() {
  return partyHeroes()
    .filter((target) => isClassHero(target) && target.hp <= 0 && !target.dead)
    .sort((a, b) => (b.deathSaves?.failures ?? 0) - (a.deathSaves?.failures ?? 0));
}

function dyingHeroForAiHealing(ally) {
  return dyingClassHeroes().find((target) => hasMeleeAccess(ally, target)) ?? null;
}

async function maybeUseAiHealingPotion(ally) {
  if (!isAutonomousAlly(ally) || !canFighterReceiveInventory(ally) || !ally.hasAction) return false;
  const item = healingItemsForAi(ally)[0];
  if (!item) return false;
  let target = dyingHeroForAiHealing(ally);
  const distantDyingHero = !target ? dyingClassHeroes()[0] : null;
  if (distantDyingHero && ally.movementLeft > 0) {
    const path = bestPathToward(ally, distantDyingHero, false);
    if (path?.length) await moveFighterAlongPath(ally, path, true);
    target = dyingHeroForAiHealing(ally);
  }
  target = target ?? ((ally.hp ?? 0) > 0 && ally.hp <= ally.maxHp * 0.35 ? ally : null);
  if (!target) return false;

  ally.hasAction = false;
  if (!spendItemCharge(item)) return false;
  const healingRoll = item.use?.kind === "fullHealing" ? { rolls: [], total: Math.max(0, (target.maxHp ?? 0) - (target.hp ?? 0)) } : rollDice(item.use.dice.count, item.use.dice.sides);
  const healing = item.use?.kind === "fullHealing" ? healingRoll.total : healingRoll.total + (item.use.bonus ?? 0);
  const healed = applyHealingToHero(target, healing);
  playSoundEffect("potionDrink");
  if (item.use?.consume !== false && !item.use?.charges) {
    ally.inventory.items = ally.inventory.items.filter((entry) => entry.id !== item.id);
    for (const slot of equipmentSlots) {
      if (ally.equipment?.[slot.id] === item.id) ally.equipment[slot.id] = null;
    }
  }
  const targetText = target.id === ally.id ? "" : ` on ${target.name}`;
  addLog(
    item.use?.kind === "fullHealing"
      ? `${ally.name} uses ${item.name}${targetText} and heals ${healed} HP to full.`
      : `${ally.name} uses ${item.name}${targetText} and heals ${healed} HP (${healingRoll.rolls.join(" + ")} + ${item.use.bonus ?? 0}).`,
    "heal",
  );
  refreshDerivedStats(ally);
  refreshDerivedStats(target);
  return true;
}

function aiAllyCombatTargets(ally) {
  const activeMonsterIds = new Set(combatMonsters().map((monster) => monster.id));
  const visibleMonsterIds = new Set(visibleMonsters().map((monster) => monster.id));
  const enemies = aiTargetableEnemiesFor(ally).filter((target) => activeMonsterIds.has(target.id) || visibleMonsterIds.has(target.id));
  const preferred = enemies.length ? enemies : aiTargetableEnemiesFor(ally);
  return preferred
    .filter((target) => (target.hp ?? 0) > 0)
    .sort((a, b) => {
      const attackableA = isInAttackRange(ally, a) ? -4 : 0;
      const attackableB = isInAttackRange(ally, b) ? -4 : 0;
      return attackableA - attackableB || distance(ally.position, a.position) - distance(ally.position, b.position) || a.id.localeCompare(b.id);
    });
}

function fighterBaseMovementSquares(fighter) {
  return Math.max(1, Math.floor((fighter?.speedFeet ?? 30) / feetPerSquare));
}

function canAiDash(fighter) {
  const movementLocked = (fighter?.statusEffects ?? []).some((effect) => effect.speedLocked);
  return Boolean(fighter?.hasAction && !movementLocked && fighterBaseMovementSquares(fighter) > 0);
}

function useAiDashToward(fighter, target) {
  if (!canAiDash(fighter)) return false;
  const extraMovement = fighterBaseMovementSquares(fighter);
  fighter.movementLeft = (fighter.movementLeft ?? 0) + extraMovement;
  fighter.hasAction = false;
  addLog(`${fighter.name} uses Dash to close the distance to ${target.name}.`, "important");
  return true;
}

async function runAutonomousAllyCombatAi(ally) {
  const target = aiAllyCombatTargets(ally)[0];
  if (!target) {
    endTurn();
    return;
  }

  const avoidsOpportunity = abilityScore(ally, "int") >= 11;
  if (!isInAttackRange(ally, target)) {
    let plan =
      attackPlanAgainst(ally, target, avoidsOpportunity, null, { forcePathfinding: true }) ??
      (avoidsOpportunity ? attackPlanAgainst(ally, target, false, null, { forcePathfinding: true }) : null);
    const shouldDash = attackRangeSquares(ally) <= 1 && !plan && useAiDashToward(ally, target);
    if (shouldDash) {
      plan =
        attackPlanAgainst(ally, target, avoidsOpportunity, null, { forcePathfinding: true }) ??
        (avoidsOpportunity ? attackPlanAgainst(ally, target, false, null, { forcePathfinding: true }) : null);
    }
    const path =
      plan?.path?.length
        ? plan.path
        : bestPathToward(ally, target, avoidsOpportunity, { forcePathfinding: true }) ??
          (avoidsOpportunity ? bestPathToward(ally, target, false, { forcePathfinding: true }) : null);

    if (path?.length) {
      const before = { ...ally.position };
      await moveFighterAlongPath(ally, path, true);
      const movedSquares = path.length || distance(before, ally.position);
      addLog(`${ally.name} moves ${movedSquares * feetPerSquare} ft to engage ${target.name}.`);
    } else {
      addLog(`${ally.name} looks for a way to reach ${target.name}.`, "important");
    }
  }

  window.setTimeout(async () => {
    if (activeFighter()?.id === ally.id && isInAttackRange(ally, target) && ally.hasAction) {
      await makeAttack(ally, target);
    }

    window.setTimeout(() => {
      if (activeFighter()?.id === ally.id && !partyDefeatedOrDying()) {
        endTurn();
      }
    }, tokenSlideMs);
  }, tokenSlideMs);
}

async function runMonsterAi(monster) {
  if (!monster.alive || partyDefeatedOrDying()) return;
  const behavior = effectiveMonsterBehavior(monster);
  addAdminLog(`${monster.name} AI turn begins: behavior=${behavior}, hp=${monster.hp}/${monster.maxHp}, action=${Boolean(monster.hasAction)}, bonus=${Boolean(monster.hasBonusAction)}, movement=${(monster.movementLeft ?? 0) * feetPerSquare} ft, position=${monster.position.x},${monster.position.y}.`);
  const monsterTurnFinished = async () => {
    addAdminLog(`${monster.name} AI turn finishing: action=${Boolean(monster.hasAction)}, movement=${(monster.movementLeft ?? 0) * feetPerSquare} ft, position=${monster.position.x},${monster.position.y}.`);
    await sleep(tokenSlideMs);
    if (activeFighter()?.id === monster.id && !partyDefeatedOrDying()) await endTurn();
  };
  const attackThenFinishTurn = async (target) => {
    await sleep(tokenSlideMs);
    addAdminLog(`${monster.name} attack fallback check vs ${target?.name ?? "none"}: active=${activeFighter()?.id === monster.id}, inRange=${Boolean(target && isInAttackRange(monster, target))}, hasAction=${Boolean(monster.hasAction)}.`);
    if (activeFighter()?.id === monster.id && isInAttackRange(monster, target) && monster.hasAction) {
      await performMonsterAttackSequence(monster, target);
    } else if (target && monster.hasAction) {
      addAdminLog(`${monster.name} cannot attack ${target.name}; normal fallback will end turn after failed range/action check.`);
    }
    await monsterTurnFinished();
  };
  const actionLocked = (monster.statusEffects ?? []).some((effect) => effect.actionLocked);
  const movementLocked = (monster.statusEffects ?? []).some((effect) => effect.speedLocked);
  if (actionLocked && movementLocked) {
    addAdminLog(`${monster.name} AI stop: action and movement are locked by status effects.`);
    addLog(`${monster.name} is unable to act or move.`, "important");
    await monsterTurnFinished();
    return;
  }
  if (fighterStatusEffect(monster, "grappled") && await attemptGrappleEscape(monster)) {
    addAdminLog(`${monster.name} used its turn attempting a grapple escape.`);
    await monsterTurnFinished();
    return;
  }
  if (await maybeUseAiHealingPotion(monster)) {
    addAdminLog(`${monster.name} used AI healing potion logic.`);
    await monsterTurnFinished();
    return;
  }
  let usedStartSpecial = false;
  try {
    usedStartSpecial = await maybeUseMonsterStartSpecial(monster);
  } catch (error) {
    addAdminLog(`Monster special action failed for ${monster.name}; falling back to normal AI. ${error?.message ?? error}`);
    monster.preferredSpecialActionKind = null;
  }
  if (usedStartSpecial) {
    addAdminLog(`${monster.name} used a start/special action; normal movement/attack AI is skipped.`);
    await monsterTurnFinished();
    return;
  }
  addAdminLog(`${monster.name} did not use a start/special action; continuing to behavior AI.`);

  if (isAutonomousAlly(monster)) {
    addAdminLog(`${monster.name} is an autonomous ally; delegating to ally combat AI.`);
    await runAutonomousAllyCombatAi(monster);
    return;
  }

  if (behavior === "swarm") {
    const swarmTarget = swarmTargetFor(monster);
    if (!swarmTarget) {
      addAdminLog(`${monster.name} swarm AI found no valid swarm target; ending turn.`);
      endTurn();
      return;
    }
    const path = bestSwarmPath(monster, swarmTarget) ?? bestPathToward(monster, swarmTarget, false, { forcePathfinding: true });
    addAdminLog(`${monster.name} swarm AI target=${swarmTarget.name}, path=${path?.length ?? 0} step(s).`);
    if (path?.length) {
      await moveFighterAlongPath(monster, path, true);
      addLog(`${monster.name} swarms around ${swarmTarget.name}.`);
    }

    await attackThenFinishTurn(swarmTarget);
    return;
  }

  if (isRoomKitingBehavior(behavior)) {
    const planOptions =
      behavior === "artillery"
        ? { preferHealer: true, preferWeak: true, avoidOpportunity: true, randomness: 2 }
        : behavior === "controller"
          ? { preferHealer: true, preferWounded: true, avoidOpportunity: true, randomness: 2.25 }
          : {};
    const plan = behavior === "rangedKiter" ? null : chooseMonsterAttackPlan(monster, planOptions);
    const target = plan?.target ?? closestTargetTo(monster);
    if (!target) {
      addAdminLog(`${monster.name} ${behavior} AI found no target; ending turn.`);
      endTurn();
      return;
    }
    const avoidsOpportunity = planOptions.avoidOpportunity ?? abilityScore(monster, "int") >= 11;
    const hasShotFromCurrent = isInAttackRange(monster, target);
    const startedThreatened = positionThreatenedByEnemy(monster, monster.position);
    addAdminLog(`${monster.name} ${behavior} AI target=${target.name}, planTarget=${plan?.target?.name ?? "none"}, hasShot=${hasShotFromCurrent}, threatened=${startedThreatened}, avoidsOpportunity=${avoidsOpportunity}.`);
    const kitePath =
      quickRangedRetreatPath(monster, target) ??
      (behavior === "rangedKiter" && hasShotFromCurrent
        ? null
        : bestRoomKitePath(monster, target, avoidsOpportunity, { forcePathfinding: true })) ??
      (avoidsOpportunity ? bestRoomKitePath(monster, target, false, { forcePathfinding: true }) : null);
    const path = kitePath?.length
      ? kitePath
      : hasShotFromCurrent
        ? null
        : plan?.path?.length
          ? plan.path
          : bestPathToward(monster, target, avoidsOpportunity, { forcePathfinding: true }) ??
            (avoidsOpportunity ? bestPathToward(monster, target, false, { forcePathfinding: true }) : null);
    addAdminLog(`${monster.name} ${behavior} AI selected path=${path?.length ?? 0} step(s)${path?.length ? ` to ${path.at(-1).x},${path.at(-1).y}` : ""}.`);
    if (path?.length) {
      await moveFighterAlongPath(monster, path, true);
      const label =
        behavior === "artillery"
          ? "finds a firing angle"
          : behavior === "controller"
            ? "sets up a control angle"
            : startedThreatened
              ? "backs out of melee"
              : "repositions inside the room";
      addLog(`${monster.name} ${label}.`);
    }

    await attackThenFinishTurn(target);
    return;
  }

  if (["melee", "charger", "skirmisher", "guardian", "brute"].includes(behavior)) {
    const planOptions =
      behavior === "charger"
        ? { preferDistant: true, avoidOpportunity: false, randomness: 1.5 }
        : behavior === "skirmisher"
          ? { preferWounded: true, preferWeak: true, avoidOpportunity: true, randomness: 2 }
          : behavior === "guardian"
            ? { preferNearest: true, randomness: 1.25 }
            : behavior === "brute"
              ? { preferWeak: true, avoidOpportunity: false, randomness: 2.5 }
              : {};
    const plan = chooseMonsterAttackPlan(monster, planOptions);
    const target = plan?.target ?? closestTargetTo(monster);
    if (!target) {
      addAdminLog(`${monster.name} ${behavior} AI found no target; ending turn.`);
      endTurn();
      return;
    }
    const avoidsOpportunity = planOptions.avoidOpportunity ?? abilityScore(monster, "int") >= 11;
    addAdminLog(`${monster.name} ${behavior} AI target=${target.name}, planTarget=${plan?.target?.name ?? "none"}, hasMeleeAccess=${hasMeleeAccess(monster, target)}, avoidsOpportunity=${avoidsOpportunity}, planPath=${plan?.path?.length ?? 0}.`);
    if (!hasMeleeAccess(monster, target)) {
      let attackPlan = plan;
      const shouldDash = !attackPlan && useAiDashToward(monster, target);
      addAdminLog(`${monster.name} ${behavior} movement needed: shouldDash=${shouldDash}.`);
      if (shouldDash) {
        attackPlan =
          attackPlanAgainst(monster, target, avoidsOpportunity, null, { forcePathfinding: true }) ??
          (avoidsOpportunity ? attackPlanAgainst(monster, target, false, null, { forcePathfinding: true }) : null);
      }
      const path = attackPlan?.path?.length
        ? attackPlan.path
        : bestPathToward(monster, target, avoidsOpportunity, { forcePathfinding: true }) ??
          (avoidsOpportunity ? bestPathToward(monster, target, false, { forcePathfinding: true }) : null);
      addAdminLog(`${monster.name} ${behavior} selected approach path=${path?.length ?? 0} step(s)${path?.length ? ` to ${path.at(-1).x},${path.at(-1).y}` : ""}.`);
      if (path) {
        const before = { ...monster.position };
        await moveFighterAlongPath(monster, path, true);
        const movedSquares = path.length || distance(before, monster.position);
        const verb =
          behavior === "charger"
            ? "charges"
            : behavior === "skirmisher"
              ? "skirts toward"
              : behavior === "guardian"
                ? "presses toward"
                : behavior === "brute"
                  ? "lumbers toward"
                  : "advances toward";
        addLog(`${monster.name} ${verb} ${target.name} (${movedSquares * feetPerSquare} ft).`);
      }
    } else {
      addAdminLog(`${monster.name} already has melee access to ${target.name}; no movement needed.`);
    }

    await attackThenFinishTurn(target);
    return;
  }

  addAdminLog(`${monster.name} has unhandled behavior ${behavior}; hesitation fallback will end turn.`);
  addLog(`${monster.name} hesitates, unsure how to act.`, "important");
  await monsterTurnFinished();
}

function heroCanStartMovement() {
  const hero = activeHero();
  if (!gameHasStarted || movementInProgress || state.completed) return false;
  if (state.mode === "home") return heroCanAct(hero) && !isAutonomousAlly(hero);
  if (state.mode === "combat") {
    return activeFighter()?.id === hero?.id && combatNeedsHeroTurns() && heroCanAct(hero) && hero.movementLeft > 0;
  }
  return heroCanAct(hero) && !threatPresent();
}

function heroCanUseDoor() {
  const hero = activeHero();
  if (!gameHasStarted || movementInProgress || state.completed) return false;
  if (isAutonomousAlly(hero)) return false;
  if (state.mode === "combat") {
    return activeFighter()?.id === hero?.id && combatNeedsHeroTurns() && heroCanAct(hero);
  }
  return heroCanAct(hero);
}

function tryOpenDoorFromHeroPosition() {
  if (!heroCanUseDoor()) return false;

  const hero = activeHero();
  if (state.mode === "home" && hero && toggleHomeDoor(hero.position, hero)) return true;
  const door = hero ? canOpenDoor(hero.position) : null;
  return door ? openDoor(door, hero) : false;
}

function tilePositionFromPoint(clientX, clientY) {
  const tileLayer = els.room.querySelector(".tile-layer");
  const rect = tileLayer?.getBoundingClientRect();
  if (!rect || clientX < rect.left || clientX >= rect.right || clientY < rect.top || clientY >= rect.bottom) return null;

  const tileSize = rect.width / currentGridSize();
  return {
    x: Math.floor((clientX - rect.left) / tileSize),
    y: Math.floor((clientY - rect.top) / tileSize),
  };
}

function autoPathSegment(fighter, from, to, path) {
  const pathGoal = { ...to };
  const maxExtraSteps = Math.max(0, movementLimitFor(fighter) - path.length);

  const search = (avoidDetectedTraps) => {
    const queue = [{ position: from, steps: [] }];
    const visited = new Set([positionKey(from), ...path.map(positionKey)]);

    while (queue.length > 0) {
      const current = queue.shift();
      if (positionKey(current.position) === positionKey(pathGoal)) {
        return current.steps;
      }
      if (current.steps.length >= maxExtraSteps) continue;

      for (const next of window.DungeonGrid.neighbors(current.position, currentGridSize())) {
        const nextKey = positionKey(next);
        if (avoidDetectedTraps && nextKey !== positionKey(pathGoal) && isDetectedArmedTrapPosition(next)) continue;
        if (visited.has(nextKey) || !isValidPathStep(fighter, current.position, next, [...path, ...current.steps])) continue;
        visited.add(nextKey);
        queue.push({ position: next, steps: [...current.steps, next] });
      }
    }

    return [];
  };

  const safeSegment = search(true);
  return safeSegment.length ? safeSegment : search(false);
}

let lastDragHoverKey = "";

function extendDragPath(position) {
  const hero = state.fighters[dragHeroId] ?? activeHero();
  if (!dragPath || !position) return;

  const key = positionKey(position);
  if (key === lastDragHoverKey) return;
  lastDragHoverKey = key;
  const existingIndex = dragPath.findIndex((step) => positionKey(step) === key);
  if (existingIndex >= 0) {
    dragPath = dragPath.slice(0, existingIndex + 1);
    renderDragPathPreview();
    return;
  }

  const originKey = positionKey(hero.position);
  if (key === originKey) {
    dragPath = [];
    renderDragPathPreview();
    return;
  }

  const currentCost = dragPath.reduce((total, step) => total + movementCostAtPosition(step, hero), 0);
  if (currentCost >= movementLimitFor(hero)) return;

  const from = dragPath[dragPath.length - 1] ?? hero.position;
  if (!isValidPathStep(hero, from, position, dragPath)) {
    const segment = autoPathSegment(hero, from, position, dragPath);
    if (segment.length === 0) return;

    dragPath = [...dragPath, ...segment];
    renderDragPathPreview();
    return;
  }

  dragPath = [...dragPath, position];
  renderDragPathPreview();
}

async function finishDragPath() {
  const path = dragPath ?? [];
  const hero = state.fighters[dragHeroId] ?? activeHero();
  dragPath = null;
  dragHeroId = null;
  lastDragHoverKey = "";
  suppressNextHeroClick = true;
  clearRenderedDragPathPreview();
  renderRoom();
  if (path.length === 0) {
    setActiveHero(hero.id);
    render();
    tryOpenDoorFromHeroPosition();
    return;
  }

  if (state.mode !== "combat" && selectedMovableHeroes(hero.id).length > 1) {
    const movedGroup = await moveSelectedHeroesTo(path.at(-1), hero, path);
    if (movedGroup) return;
  }

  const moved = await moveFighterAlongPath(hero, path);
  if (!moved) {
    addLog(state.mode === "combat" ? "That path is out of reach or blocked." : "That path is blocked or not discovered yet.");
    render();
  }
}

function cancelDragPath() {
  dragPath = null;
  dragHeroId = null;
  lastDragHoverKey = "";
  suppressNextHeroClick = true;
  clearRenderedDragPathPreview();
  renderRoom();
}

function handleHeroPointerDown(event) {
  if (event.button !== 0) return;
  if (!gameHasStarted || movementInProgress) return;
  const heroId = event.currentTarget?.dataset?.combatant;
  if (!heroId) return;
  if (pendingSpellTargeting) {
    const hero = state.fighters[heroId];
    if (hero?.position) {
      event.preventDefault();
      event.stopPropagation();
      suppressNextHeroClick = true;
      suppressInspectionAfterTargetSelection();
      void confirmPendingSpellTarget(hero.position);
    }
    return;
  }
  if (pendingEldritchBlast) {
    const hero = state.fighters[heroId];
    if (hero?.position) {
      event.preventDefault();
      event.stopPropagation();
      suppressNextHeroClick = true;
      suppressInspectionAfterTargetSelection();
      void confirmPendingEldritchBlast(hero.position);
    }
    return;
  }
  if ((event.shiftKey || event.ctrlKey || event.metaKey) && state.mode !== "combat") {
    event.preventDefault();
    event.stopPropagation();
    suppressNextHeroClick = true;
    if (toggleHeroSelection(heroId)) render();
    return;
  }
  const keepGroupSelection = state.mode !== "combat" && selectedHeroIds.size > 1 && selectedHeroIds.has(heroId);
  if (keepGroupSelection) {
    state.party.activeHeroId = heroId;
  } else if (!setActiveHero(heroId)) {
    return;
  }
  render();

  if (!heroCanStartMovement()) {
    tryOpenDoorFromHeroPosition();
    return;
  }

  event.preventDefault();
  dragPath = [];
  dragHeroId = heroId;
  lastDragHoverKey = "";
  renderRoom();

  let queuedPointerPosition = null;
  let dragFrameRequested = false;
  const handlePointerMove = (moveEvent) => {
    queuedPointerPosition = { x: moveEvent.clientX, y: moveEvent.clientY };
    if (dragFrameRequested) return;
    dragFrameRequested = true;
    requestAnimationFrame(() => {
      dragFrameRequested = false;
      if (!queuedPointerPosition) return;
      const pointer = queuedPointerPosition;
      queuedPointerPosition = null;
      extendDragPath(tilePositionFromPoint(pointer.x, pointer.y));
    });
  };

  const handlePointerUp = () => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointercancel", handlePointerCancel);
    finishDragPath();
  };

  const handlePointerCancel = () => {
    document.removeEventListener("pointermove", handlePointerMove);
    document.removeEventListener("pointerup", handlePointerUp);
    document.removeEventListener("pointercancel", handlePointerCancel);
    cancelDragPath();
  };

  document.addEventListener("pointermove", handlePointerMove);
  document.addEventListener("pointerup", handlePointerUp);
  document.addEventListener("pointercancel", handlePointerCancel);
  extendDragPath(tilePositionFromPoint(event.clientX, event.clientY));
}

function handleMapPanPointerDown(event) {
  if (event.button !== 0 || !gameHasStarted || dragPath) return;
  if (pendingSpellTargeting) {
    const position = tilePositionFromPoint(event.clientX, event.clientY);
    if (position) {
      event.preventDefault();
      event.stopPropagation();
      suppressInspectionAfterTargetSelection();
      void confirmPendingSpellTarget(position);
    }
    return;
  }
  if (pendingEldritchBlast) {
    const position = tilePositionFromPoint(event.clientX, event.clientY);
    if (position) {
      event.preventDefault();
      event.stopPropagation();
      suppressInspectionAfterTargetSelection();
      void confirmPendingEldritchBlast(position);
    }
    return;
  }
  if (adminEnabled() && adminTeleportEnabled && event.target.closest(".tile")) return;
  if (isHomeBuilderOpen() && event.target.closest(".tile")) return;
  if (event.target.closest(".token, .chest-token, .topbar, button:not(.tile)")) return;
  if (event.target === els.roomScroll) return;
  if (isPointerOnRoomScrollbar(event)) return;

  mapPan = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    scrollLeft: els.roomScroll.scrollLeft,
    scrollTop: els.roomScroll.scrollTop,
    moved: false,
  };
  els.roomScroll.setPointerCapture?.(event.pointerId);
  els.roomScroll.classList.add("panning");
}

function isPointerOnRoomScrollbar(event) {
  const rect = els.roomScroll.getBoundingClientRect();
  const verticalScrollbarWidth = els.roomScroll.offsetWidth - els.roomScroll.clientWidth;
  const horizontalScrollbarHeight = els.roomScroll.offsetHeight - els.roomScroll.clientHeight;
  const onVertical = verticalScrollbarWidth > 0 && event.clientX >= rect.right - verticalScrollbarWidth;
  const onHorizontal = horizontalScrollbarHeight > 0 && event.clientY >= rect.bottom - horizontalScrollbarHeight;
  return onVertical || onHorizontal;
}

function handleMapPanPointerMove(event) {
  if (!mapPan || mapPan.pointerId !== event.pointerId) return;

  const deltaX = event.clientX - mapPan.startX;
  const deltaY = event.clientY - mapPan.startY;
  if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) mapPan.moved = true;
  els.roomScroll.scrollLeft = mapPan.scrollLeft - deltaX;
  els.roomScroll.scrollTop = mapPan.scrollTop - deltaY;
  event.preventDefault();
}

function finishMapPan(event) {
  if (!mapPan || mapPan.pointerId !== event.pointerId) return;
  if (mapPan.moved) {
    suppressNextTileClick = true;
    window.setTimeout(() => {
      suppressNextTileClick = false;
    }, 0);
  }
  els.roomScroll.releasePointerCapture?.(event.pointerId);
  els.roomScroll.classList.remove("panning");
  mapPan = null;
}

