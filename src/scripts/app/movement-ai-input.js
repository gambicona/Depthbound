function movementWalkableFor(fighter) {
  return isRosterHeroId(fighter.id) && (state.mode === "exploration" || state.mode === "home") ? visibleWalkable() : currentWalkable();
}

function detectedArmedTrapKeys() {
  const keys = new Set();
  for (const object of state.dungeonObjects ?? []) {
    if (!objectIsTrap(object) || !object.detected || object.spent || object.disarmed || object.armed === false) continue;
    objectCells(object).forEach((cell) => keys.add(positionKey(cell)));
  }
  return keys;
}

function isDetectedArmedTrapPosition(position) {
  return detectedArmedTrapKeys().has(positionKey(position));
}

function trapAwareWalkableFor(fighter, destination = null) {
  const walkable = new Set(movementWalkableFor(fighter));
  const destinationKey = destination ? positionKey(destination) : "";
  const currentKey = positionKey(fighter.position);
  detectedArmedTrapKeys().forEach((tileKey) => {
    if (tileKey !== currentKey && tileKey !== destinationKey) walkable.delete(tileKey);
  });
  return walkable;
}

function movementLimitFor(fighter) {
  return state.mode === "combat" ? fighter.movementLeft : Infinity;
}

function occupyingFighterAt(position, ignoredFighter = null) {
  return Object.values(state.fighters).find(
    (fighter) =>
      fighter.alive &&
      fighter.id !== ignoredFighter?.id &&
      fighter.position.x === position.x &&
      fighter.position.y === position.y,
  ) ?? null;
}

function canMoveThroughOccupiedTile(fighter, position) {
  const occupant = occupyingFighterAt(position, fighter);
  if (occupant && state.mode === "home" && isRosterHeroId(fighter.id) && isRosterHeroId(occupant.id)) return true;
  if (occupant && isPartyHeroId(fighter.id) && isPartyHeroId(occupant.id)) return true;
  return Boolean(fighter.canMoveThroughMonsters && occupant && hostileTo(fighter, occupant));
}

function isValidPathStep(fighter, from, to, path = []) {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  if (dx + dy !== 1) return false;
  if (!window.DungeonGrid.isInsideGrid(to, currentGridSize())) return false;
  if (!movementWalkableFor(fighter).has(positionKey(to))) return false;
  if (!canTraverseMovementEdge(fighter, from, to, path)) return false;
  if (window.DungeonGrid.isOccupied(to, state.fighters, fighter) && !canMoveThroughOccupiedTile(fighter, to)) return false;
  return !path.some((step) => positionKey(step) === positionKey(to));
}

function findMovementPath(fighter, destination) {
  const options = {
    gridSize: currentGridSize(),
    canTraverse: (from, to, path) => canTraverseMovementEdge(fighter, from, to, path),
    stateKey: (position, path) => movementStateKey(fighter, position, path),
    canEnterOccupied: (position) => canMoveThroughOccupiedTile(fighter, position),
  };
  const safePath = findPath(fighter.position, destination, fighter, state.fighters, {
    ...options,
    walkable: trapAwareWalkableFor(fighter, destination),
  });
  if (safePath) return safePath;
  return findPath(fighter.position, destination, fighter, state.fighters, {
    ...options,
    walkable: movementWalkableFor(fighter),
  });
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function moveFighterAlongPath(fighter, path, silent = false) {
  if (!heroCanAct(fighter) || (state.mode === "combat" && fighter.movementLeft <= 0)) return false;
  const pathCost = (path ?? []).reduce((total, step) => total + movementCostAtPosition(step), 0);
  if (!path || path.length === 0 || pathCost > movementLimitFor(fighter)) return false;
  if (window.DungeonGrid.isOccupied(path.at(-1), state.fighters, fighter)) return false;

  let previous = fighter.position;
  for (const step of path) {
    if (!isValidPathStep(fighter, previous, step, path.slice(0, path.indexOf(step)))) return false;
    previous = step;
  }

  movementInProgress = true;
  dragPath = null;
  dragHeroId = null;
  render();

  let movedSteps = 0;
  let movedCost = 0;
  for (const step of path) {
    const opportunityAttackers = Object.values(state.fighters).filter((candidate) => canOpportunityAttack(candidate, fighter, fighter.position, step));
    for (const attacker of opportunityAttackers) {
      if (!(await shouldTakeOpportunityAttack(attacker, fighter))) continue;
      await opportunityAttack(attacker, fighter);
      if (!fighter.alive) break;
    }
    if (!fighter.alive) break;

    fighter.position = { ...step };
    movedSteps += 1;
    movedCost += movementCostAtPosition(step);
    collectLootAtPosition(fighter, step);
    triggerTrapAtPosition(fighter, step);
    const usedPortal = triggerPortalAtPosition(fighter, fighter.position);
    const openedDoor = autoOpenAdjacentExplorationDoor(fighter);
    render();
    const stepDelay = movedSteps > longMoveFastAfterSteps ? Math.max(25, Math.round(tokenSlideMs * longMoveFastMultiplier)) : tokenSlideMs;
    await sleep(stepDelay);
    if (!fighter.alive) break;
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
    fighter.movementLeft -= movedCost;
  }
  fighter.lastMoveFeet = movedSteps * feetPerSquare;

  if (!silent) {
    const suffix = state.mode === "combat" ? ` ${fighter.movementLeft * feetPerSquare} ft remains.` : "";
    addLog(`${fighter.name} moves ${movedSteps * feetPerSquare} ft.${suffix}`);
  }

  movementInProgress = false;
  if (isPartyHeroId(fighter.id) && checkDungeonCompletion(fighter)) return true;
  render();
  return true;
}

async function moveFighter(fighter, destination, silent = false) {
  const path = findMovementPath(fighter, destination);
  return moveFighterAlongPath(fighter, path, silent);
}

function occupiedByUnselectedHeroOrObstacle(position, movingHeroIds) {
  return Object.values(state.fighters).some(
    (fighter) =>
      fighter.alive &&
      fighter.position.x === position.x &&
      fighter.position.y === position.y &&
      !movingHeroIds.has(fighter.id),
  );
}

function groupMoveDestinations(destination, heroes, anchorHero = heroes[0]) {
  const movingHeroIds = new Set(heroes.map((hero) => hero.id));
  const walkable = state.mode === "home" || state.mode === "exploration" ? visibleWalkable() : movementWalkableFor(heroes[0]);
  const assigned = new Set();
  const sortedHeroes = [
    anchorHero,
    ...heroes
      .filter((hero) => hero.id !== anchorHero?.id)
      .sort((a, b) => distance(a.position, destination) - distance(b.position, destination)),
  ].filter(Boolean);
  const candidates = Array.from(walkable)
    .map(positionFromKey)
    .filter((position) => !occupiedByUnselectedHeroOrObstacle(position, movingHeroIds))
    .sort((a, b) => distance(a, destination) - distance(b, destination));

  const plans = [];
  for (const hero of sortedHeroes) {
    const heroCandidates =
      plans.length === 0
        ? [destination, ...candidates]
        : candidates;
    const target = heroCandidates.find((position) => {
      const key = positionKey(position);
      if (assigned.has(key)) return false;
      if (!walkable.has(key)) return false;
      if (occupiedByUnselectedHeroOrObstacle(position, movingHeroIds)) return false;
      const path = findMovementPath(hero, position);
      if (!path?.length && positionKey(hero.position) !== key) return false;
      plans.push({ hero, destination: position, path: path ?? [] });
      assigned.add(key);
      return true;
    });
    if (!target) return [];
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
  const stoppedBeforeTrap = new Set();
  for (let stepIndex = 0; stepIndex < maxLength; stepIndex += 1) {
    for (const plan of activePlans) {
      const step = plan.path[stepIndex];
      if (!step || !plan.hero.alive) continue;
      const stepKey = positionKey(step);
      if (blockedTrapKeys.has(stepKey)) {
        stoppedBeforeTrap.add(plan.hero.id);
        continue;
      }
      plan.hero.position = { ...step };
      collectLootAtPosition(plan.hero, step);
      if (triggerTrapAtPosition(plan.hero, step)) {
        const trap = objectAt(step);
        if (trap && objectIsTrap(trap)) objectCells(trap).forEach((cell) => blockedTrapKeys.add(positionKey(cell)));
      }
      triggerPortalAtPosition(plan.hero, plan.hero.position);
      autoOpenAdjacentExplorationDoor(plan.hero);
      render();
      await sleep(Math.max(20, Math.round(tokenSlideMs * 0.18)));
    }
    await sleep(Math.max(30, Math.round(tokenSlideMs * 0.35)));
  }

  for (const plan of activePlans) {
    const reachedIndex = plan.path.findIndex((step) => positionKey(step) === positionKey(plan.hero.position));
    plan.hero.lastMoveFeet = Math.max(0, reachedIndex + 1) * feetPerSquare;
  }
  addLog(`${activePlans.length} heroes move together.`);
  if (stoppedBeforeTrap.size > 0) addLog("The party stops short of the trap instead of marching everyone through it.", "important");
  movementInProgress = false;
  const exitHero = activePlans.map((plan) => plan.hero).find((hero) => isPartyHeroId(hero.id) && isExitPosition(hero.position));
  if (exitHero && checkDungeonCompletion(exitHero)) return true;
  render();
  return true;
}

async function moveSelectedHeroesTo(destination, anchorHero) {
  if (state.mode === "combat") return false;
  const heroes = selectedMovableHeroes(anchorHero.id);
  if (heroes.length <= 1) return false;
  const plans = groupMoveDestinations(destination, heroes, anchorHero);
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
  if (window.DungeonGrid.isOccupied(position, state.fighters, activeHero())) return false;
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
    void confirmPendingSpellTarget(position);
    return;
  }
  if (pendingEldritchBlast) {
    void confirmPendingEldritchBlast(position);
    return;
  }
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

  const door = canOpenDoor(position);
  if (door) {
    openDoor(door);
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
  if (state.mode === "combat" && (activeFighter()?.id !== hero.id || !combatNeedsHeroTurns())) return;
  if (state.mode === "combat" && hero.hp <= 0) return;

  const destination = { x: hero.position.x + delta.x, y: hero.position.y + delta.y };
  if (!window.DungeonGrid.isInsideGrid(destination, currentGridSize())) return;

  const door = canOpenDoor(destination);
  if (door) {
    openDoor(door);
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

function partyRoleFor(fighter) {
  if ((state.party?.heroIds ?? ["hero"]).length <= 1 && fighter?.id === "hero") return "tank";
  return fighter?.partyRole ?? "dd";
}

function visibleTrapKeysForMonster(monster) {
  if (abilityScore(monster, "wis") <= 10) return new Set();
  const keys = new Set();
  for (const object of state.dungeonObjects ?? []) {
    if (!objectIsTrap(object) || !object.detected || object.spent || object.disarmed || object.armed === false) continue;
    objectCells(object).forEach((cell) => keys.add(positionKey(cell)));
  }
  return keys;
}

function monsterMovementWalkable(monster, baseWalkable = currentWalkable()) {
  const walkable = new Set(baseWalkable);
  visibleTrapKeysForMonster(monster).forEach((tileKey) => {
    if (tileKey !== positionKey(monster.position)) walkable.delete(tileKey);
  });
  return walkable;
}

function consumeMonsterPathfindingJob(monster) {
  if (!monster || !monster.alive) return false;
  if (pathfindingJobsThisTurn >= monsterPathfindingBudgetPerTurn) return false;
  pathfindingJobsThisTurn += 1;
  perfStats.pathfindingJobs += 1;
  perfStats.pathfindingJobsLastFrame += 1;
  return true;
}

function monsterReachableTiles(monster, options) {
  if (!consumeMonsterPathfindingJob(monster)) return new Map();
  return reachableTiles(monster, state.fighters, {
    moveCost: (_from, to) => movementCostAtPosition(to),
    ...options,
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
  if (range <= 1) {
    return hasMeleeAccess({ ...attacker, position }, target);
  }
  return attackGridDistance(position, target.position) <= range && hasClearLineOfSight(position, target.position);
}

function pathForMonster(monster, destination, walkable = monsterMovementWalkable(monster)) {
  if (!consumeMonsterPathfindingJob(monster)) return null;
  return findPath(monster.position, destination, monster, state.fighters, {
    gridSize: currentGridSize(),
    walkable,
    canTraverse: (from, to, path) => canTraverseMovementEdge(monster, from, to, path),
    stateKey: (position, path) => movementStateKey(monster, position, path),
  });
}

function attackPlanAgainst(monster, target, avoidOpportunity = false, baseWalkable = currentWalkable()) {
  const monsterRoom = monster.behavior === "rangedKiter" ? roomForPosition(monster.position) : null;
  const movementBase = monsterRoom ? roomWalkableSet(monsterRoom) : baseWalkable;
  const walkable = monsterMovementWalkable(monster, movementBase);
  const reachable = Array.from(
    monsterReachableTiles(monster, {
      gridSize: currentGridSize(),
      walkable,
      maxCost: monster.movementLeft,
      canTraverse: (from, to, path) => canTraverseMovementEdge(monster, from, to, path),
      stateKey: (position, path) => movementStateKey(monster, position, path),
    }).keys(),
  ).map(positionFromKey);

  const candidates = [monster.position, ...reachable]
    .filter((position, index, positions) => positions.findIndex((entry) => positionKey(entry) === positionKey(position)) === index)
    .filter((position) => canAttackFromPosition(monster, target, position))
    .map((position) => {
      const path = positionKey(position) === positionKey(monster.position) ? [] : pathForMonster(monster, position, walkable);
      return path ? { target, position, path, cost: path.length } : null;
    })
    .filter(Boolean)
    .filter((plan) => !avoidOpportunity || !pathProvokesOpportunity(monster, plan.path));

  return candidates.sort((a, b) => a.cost - b.cost || distance(a.position, target.position) - distance(b.position, target.position))[0] ?? null;
}

function closestTargetTo(monster, targets = partyHeroes()) {
  const candidates = targets.filter((target) => (target.hp ?? 0) > 0);
  return candidates.slice().sort((a, b) => distance(monster.position, a.position) - distance(monster.position, b.position) || a.id.localeCompare(b.id))[0] ?? null;
}

function lowestLifeTarget(targets) {
  return targets
    .slice()
    .sort((a, b) => a.hp / Math.max(1, a.maxHp) - b.hp / Math.max(1, b.maxHp) || a.hp - b.hp || a.id.localeCompare(b.id))[0] ?? null;
}

function chooseMonsterAttackPlan(monster) {
  const targets = monsterTargetableHeroes();
  if (targets.length === 0) return null;
  const intelligence = abilityScore(monster, "int");
  const smarterMovement = intelligence >= 11;
  const targetPriority = (target, { preferWeak = false, preferHealer = false } = {}) => {
    const close = distance(monster.position, target.position);
    const hpRatio = target.hp / Math.max(1, target.maxHp);
    const weakBias = preferWeak ? hpRatio * 2 : hpRatio * 0.65;
    const healerBias = preferHealer && partyRoleFor(target) === "heal" ? -1.5 : 0;
    return close * 1.25 + weakBias + healerBias + Math.random() * 3.25;
  };
  const randomizedTargets = (options = {}) => targets.slice().sort((a, b) => targetPriority(a, options) - targetPriority(b, options));

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

function bestPathToward(mover, target, avoidOpportunity = false) {
  const walkable = monsterMovementWalkable(mover);
  const reachable = Array.from(
    monsterReachableTiles(mover, {
      gridSize: currentGridSize(),
      walkable,
      canTraverse: (from, to, path) => canTraverseMovementEdge(mover, from, to, path),
      stateKey: (position, path) => movementStateKey(mover, position, path),
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

  for (const entry of reachable) {
    const path = pathForMonster(mover, entry.position, walkable);
    if (path && (!avoidOpportunity || !pathProvokesOpportunity(mover, path))) return path;
  }
  return null;
}

function normalRangeSquares(fighter) {
  const range = damageProfile(fighter).range;
  return Math.max(1, Math.floor((range?.normal ?? range?.feet ?? 5) / feetPerSquare));
}

function roomWalkableSet(room, fighter = null) {
  const walkable = new Set((room?.cells ?? []).map(positionKey));
  blockingObjectKeys().forEach((tileKey) => walkable.delete(tileKey));
  return fighter ? monsterMovementWalkable(fighter, walkable) : walkable;
}

function roomOnlyPath(mover, destination, room) {
  const walkable = roomWalkableSet(room, mover);
  if (!consumeMonsterPathfindingJob(mover)) return null;
  return findPath(mover.position, destination, mover, state.fighters, {
    gridSize: currentGridSize(),
    walkable,
    canTraverse: () => true,
  });
}

function bestRoomKitePath(mover, target, avoidOpportunity = false) {
  const room = roomForPosition(mover.position);
  if (!room) return null;

  const range = normalRangeSquares(mover);
  const reachable = Array.from(
    monsterReachableTiles(mover, {
      gridSize: currentGridSize(),
      walkable: roomWalkableSet(room, mover),
      maxCost: mover.movementLeft,
      canTraverse: () => true,
    }).entries(),
  ).map(([key, cost]) => ({ position: positionFromKey(key), cost }));

  const current = { position: mover.position, cost: 0 };
  const candidates = [current, ...reachable].filter(
    (entry) => attackGridDistance(entry.position, target.position) <= range && hasClearLineOfSight(entry.position, target.position),
  );
  const pool = candidates.length ? candidates : [current, ...reachable];
  if (pool.length === 0) return null;

  pool.sort((a, b) => {
    const distanceDifference = candidates.length
      ? distance(b.position, target.position) - distance(a.position, target.position)
      : distance(a.position, target.position) - distance(b.position, target.position);
    return distanceDifference || a.cost - b.cost;
  });

  for (const entry of pool) {
    if (positionKey(entry.position) === positionKey(mover.position)) return null;
    const path = roomOnlyPath(mover, entry.position, room);
    if (path && (!avoidOpportunity || !pathProvokesOpportunity(mover, path))) return path;
  }
  return null;
}

function swarmTargetFor(monster) {
  const monsterRoom = roomForPosition(monster.position);
  const heroes = monsterTargetableHeroes();
  if (!heroes.length) return null;
  const sameRoomHeroes = monsterRoom ? heroes.filter((fighter) => roomForPosition(fighter.position)?.id === monsterRoom.id) : [];
  const candidates = sameRoomHeroes.length ? sameRoomHeroes : heroes;
  const swarmMates = monsterRoom
    ? aliveMonsters().filter((entry) => entry.behavior === "swarm" && roomForPosition(entry.position)?.id === monsterRoom.id)
    : [monster];
  return candidates
    .sort((a, b) => {
      const distanceToA = Math.min(...swarmMates.map((entry) => distance(entry.position, a.position)));
      const distanceToB = Math.min(...swarmMates.map((entry) => distance(entry.position, b.position)));
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
      canTraverse: (from, to, path) => canTraverseMovementEdge(mover, from, to, path),
      stateKey: (position, path) => movementStateKey(mover, position, path),
    }).entries(),
  ).map(([key, cost]) => ({ position: positionFromKey(key), cost }));

  const targetRoom = roomForPosition(target.position);
  const adjacentOpen = adjacentCells(target.position)
    .filter((position) => walkable.has(positionKey(position)))
    .filter((position) => !targetRoom || roomForPosition(position)?.id === targetRoom.id)
    .filter((position) => !window.DungeonGrid.isOccupied(position, state.fighters, mover))
    .filter((position) => canTraverseMovementEdge(mover, position, target.position, []));

  const adjacentKeys = new Set(adjacentOpen.map(positionKey));
  const candidates = reachable.filter((entry) => adjacentKeys.has(positionKey(entry.position)));
  const pool = candidates.length ? candidates : reachable;
  if (pool.length === 0) return null;

  pool.sort((a, b) => {
    const distanceDifference = distance(a.position, target.position) - distance(b.position, target.position);
    return distanceDifference || a.cost - b.cost;
  });

  if (positionKey(pool[0].position) === positionKey(mover.position)) return null;
  return pathForMonster(mover, pool[0].position, walkable);
}

async function runMonsterAi(monster) {
  if (!monster.alive || partyDefeatedOrDying()) return;
  if (await maybeUseMonsterStartSpecial(monster)) {
    window.setTimeout(() => {
      if (activeFighter()?.id === monster.id && !partyDefeatedOrDying()) endTurn();
    }, tokenSlideMs);
    return;
  }

  if (monster.behavior === "swarm") {
    const swarmTarget = swarmTargetFor(monster);
    if (!swarmTarget) {
      endTurn();
      return;
    }
    const path = bestSwarmPath(monster, swarmTarget);
    if (path) {
      await moveFighterAlongPath(monster, path, true);
      addLog(`${monster.name} swarms around ${swarmTarget.name}.`);
    }

    window.setTimeout(async () => {
      if (activeFighter()?.id === monster.id && isInAttackRange(monster, swarmTarget) && monster.hasAction) {
        await makeAttack(monster, swarmTarget);
      }

      window.setTimeout(() => {
        if (activeFighter()?.id === monster.id && !partyDefeatedOrDying()) {
          endTurn();
        }
      }, tokenSlideMs);
    }, tokenSlideMs);
    return;
  }

  if (monster.behavior === "rangedKiter") {
    const plan = chooseMonsterAttackPlan(monster);
    const target = plan?.target ?? closestTargetTo(monster);
    if (!target) {
      endTurn();
      return;
    }
    const avoidsOpportunity = abilityScore(monster, "int") >= 11;
    const path = plan?.path?.length
      ? plan.path
      : bestRoomKitePath(monster, target, avoidsOpportunity) ?? (avoidsOpportunity ? bestRoomKitePath(monster, target, false) : null);
    if (path) {
      await moveFighterAlongPath(monster, path, true);
      addLog(`${monster.name} repositions inside the room.`);
    }

    window.setTimeout(async () => {
      if (activeFighter()?.id === monster.id && isInAttackRange(monster, target) && monster.hasAction) {
        await makeAttack(monster, target);
      }

      window.setTimeout(() => {
        if (activeFighter()?.id === monster.id && !partyDefeatedOrDying()) {
          endTurn();
        }
      }, tokenSlideMs);
    }, tokenSlideMs);
    return;
  }

  if (monster.behavior === "melee") {
    const plan = chooseMonsterAttackPlan(monster);
    const target = plan?.target ?? closestTargetTo(monster);
    if (!target) {
      endTurn();
      return;
    }
    const avoidsOpportunity = abilityScore(monster, "int") >= 11;
    if (!hasMeleeAccess(monster, target)) {
      const path = plan?.path?.length
        ? plan.path
        : bestPathToward(monster, target, avoidsOpportunity) ?? (avoidsOpportunity ? bestPathToward(monster, target, false) : null);
      if (path) {
        const before = { ...monster.position };
        await moveFighterAlongPath(monster, path, true);
        const movedSquares = path.length || distance(before, monster.position);
        addLog(`${monster.name} advances ${movedSquares * feetPerSquare} ft toward ${target.name}.`);
      }
    }

    window.setTimeout(async () => {
      if (activeFighter()?.id === monster.id && isInAttackRange(monster, target) && monster.hasAction) {
        await makeAttack(monster, target);
      }

      window.setTimeout(() => {
        if (activeFighter()?.id === monster.id && !partyDefeatedOrDying()) {
          endTurn();
        }
      }, tokenSlideMs);
    }, tokenSlideMs);
  }
}

function heroCanStartMovement() {
  const hero = activeHero();
  if (!gameHasStarted || movementInProgress || state.completed) return false;
  if (state.mode === "home") return heroCanAct(hero);
  if (state.mode === "combat") {
    return activeFighter()?.id === hero?.id && combatNeedsHeroTurns() && heroCanAct(hero) && hero.movementLeft > 0;
  }
  return heroCanAct(hero) && !threatPresent();
}

function heroCanUseDoor() {
  const hero = activeHero();
  if (!gameHasStarted || movementInProgress || state.completed) return false;
  if (state.mode === "combat") {
    return activeFighter()?.id === hero?.id && combatNeedsHeroTurns() && heroCanAct(hero);
  }
  return heroCanAct(hero);
}

function tryOpenDoorFromHeroPosition() {
  if (!heroCanUseDoor()) return false;

  const hero = activeHero();
  const door = hero ? canOpenDoor(hero.position) : null;
  return door ? openDoor(door) : false;
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

function extendDragPath(position) {
  const hero = state.fighters[dragHeroId] ?? activeHero();
  if (!dragPath || !position) return;

  const key = positionKey(position);
  const existingIndex = dragPath.findIndex((step) => positionKey(step) === key);
  if (existingIndex >= 0) {
    dragPath = dragPath.slice(0, existingIndex + 1);
    renderRoom();
    return;
  }

  const originKey = positionKey(hero.position);
  if (key === originKey) {
    dragPath = [];
    renderRoom();
    return;
  }

  if (dragPath.length >= movementLimitFor(hero)) return;

  const from = dragPath[dragPath.length - 1] ?? hero.position;
  if (!isValidPathStep(hero, from, position, dragPath)) {
    const segment = autoPathSegment(hero, from, position, dragPath);
    if (segment.length === 0) return;

    dragPath = [...dragPath, ...segment];
    renderRoom();
    return;
  }

  dragPath = [...dragPath, position];
  renderRoom();
}

async function finishDragPath() {
  const path = dragPath ?? [];
  const hero = state.fighters[dragHeroId] ?? activeHero();
  dragPath = null;
  dragHeroId = null;
  suppressNextHeroClick = true;
  renderRoom();
  if (path.length === 0) {
    setActiveHero(hero.id);
    render();
    tryOpenDoorFromHeroPosition();
    return;
  }

  if (state.mode !== "combat" && selectedMovableHeroes(hero.id).length > 1) {
    const movedGroup = await moveSelectedHeroesTo(path.at(-1), hero);
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
  suppressNextHeroClick = true;
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
  renderRoom();

  const handlePointerMove = (moveEvent) => {
    extendDragPath(tilePositionFromPoint(moveEvent.clientX, moveEvent.clientY));
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
      void confirmPendingSpellTarget(position);
    }
    return;
  }
  if (pendingEldritchBlast) {
    const position = tilePositionFromPoint(event.clientX, event.clientY);
    if (position) {
      event.preventDefault();
      event.stopPropagation();
      void confirmPendingEldritchBlast(position);
    }
    return;
  }
  if (adminEnabled() && adminTeleportEnabled && event.target.closest(".tile")) return;
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

