const gridSize = 7;
const feetPerSquare = 5;

const templates = {
  hero: {
    id: "hero",
    name: "Mira Vale",
    role: "Level 1 Fighter",
    maxHp: 14,
    ac: 16,
    attackBonus: 5,
    damage: { count: 1, sides: 8, bonus: 3, label: "1d8 + 3" },
    initiativeBonus: 2,
    speedFeet: 30,
    position: { x: 2, y: 4 },
    token: "M",
  },
  monster: {
    id: "monster",
    name: "Crypt Guard",
    role: "Armored skeleton",
    maxHp: 13,
    ac: 13,
    attackBonus: 4,
    damage: { count: 1, sides: 6, bonus: 2, label: "1d6 + 2" },
    initiativeBonus: 2,
    speedFeet: 30,
    behavior: "melee",
    position: { x: 4, y: 2 },
    token: "C",
  },
};

let state = createInitialState();

const els = {
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
  clearLog: document.querySelector("#clear-log"),
};

function createInitialState() {
  return {
    combatStarted: false,
    round: 0,
    activeIndex: 0,
    initiative: [],
    fighters: {
      hero: createFighter(templates.hero),
      monster: createFighter(templates.monster),
    },
    log: [
      {
        text: "A crypt guard scrapes its blade across the stones. Roll initiative when ready.",
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

function rollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function rollDice(count, sides) {
  const rolls = Array.from({ length: count }, () => rollDie(sides));
  return {
    rolls,
    total: rolls.reduce((sum, roll) => sum + roll, 0),
  };
}

function abilityLabel(value) {
  return value >= 0 ? `+${value}` : `${value}`;
}

function aliveFighters() {
  return Object.values(state.fighters).filter((fighter) => fighter.alive);
}

function activeFighter() {
  return state.initiative[state.activeIndex]?.fighter;
}

function enemyOf(fighter) {
  return fighter.id === "hero" ? state.fighters.monster : state.fighters.hero;
}

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function isAdjacent(a, b) {
  return distance(a.position, b.position) === 1;
}

function isInsideGrid(position) {
  return position.x >= 0 && position.x < gridSize && position.y >= 0 && position.y < gridSize;
}

function isOccupied(position, ignoredFighter = null) {
  return Object.values(state.fighters).some(
    (fighter) =>
      fighter.alive &&
      fighter.id !== ignoredFighter?.id &&
      fighter.position.x === position.x &&
      fighter.position.y === position.y,
  );
}

function positionKey(position) {
  return `${position.x},${position.y}`;
}

function neighbors(position) {
  return [
    { x: position.x, y: position.y - 1 },
    { x: position.x + 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x - 1, y: position.y },
  ].filter(isInsideGrid);
}

function findPath(start, goal, mover) {
  if (isOccupied(goal, mover)) return null;

  const queue = [{ position: start, path: [] }];
  const visited = new Set([positionKey(start)]);

  while (queue.length > 0) {
    const current = queue.shift();
    if (current.position.x === goal.x && current.position.y === goal.y) {
      return current.path;
    }

    for (const next of neighbors(current.position)) {
      const key = positionKey(next);
      if (visited.has(key) || isOccupied(next, mover)) continue;
      visited.add(key);
      queue.push({ position: next, path: [...current.path, next] });
    }
  }

  return null;
}

function reachableTiles(fighter) {
  const reachable = new Map();
  const queue = [{ position: fighter.position, cost: 0 }];
  const visited = new Set([positionKey(fighter.position)]);

  while (queue.length > 0) {
    const current = queue.shift();

    for (const next of neighbors(current.position)) {
      const nextCost = current.cost + 1;
      const key = positionKey(next);
      if (visited.has(key) || nextCost > fighter.movementLeft || isOccupied(next, fighter)) continue;

      visited.add(key);
      reachable.set(key, nextCost);
      queue.push({ position: next, cost: nextCost });
    }
  }

  return reachable;
}

function resetTurnResources(fighter) {
  fighter.movementLeft = Math.floor(fighter.speedFeet / feetPerSquare);
  fighter.hasAction = true;
}

function addLog(text, type = "") {
  state.log.push({ text, type });
  if (state.log.length > 80) {
    state.log.shift();
  }
}

function rollInitiative() {
  if (state.combatStarted) return;

  const heroRoll = rollDie(20);
  const monsterRoll = rollDie(20);

  state.initiative = [
    {
      fighter: state.fighters.hero,
      roll: heroRoll,
      total: heroRoll + state.fighters.hero.initiativeBonus,
    },
    {
      fighter: state.fighters.monster,
      roll: monsterRoll,
      total: monsterRoll + state.fighters.monster.initiativeBonus,
    },
  ].sort((a, b) => b.total - a.total || (a.fighter.id === "hero" ? -1 : 1));

  state.combatStarted = true;
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
    render();
    return;
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
  setTimeout(() => {
    if (activeFighter()?.id === "monster") {
      runMonsterAi(state.fighters.monster);
    }
  }, 650);
}

function moveFighter(fighter, destination, silent = false) {
  if (!fighter.alive || fighter.movementLeft <= 0) return false;

  const path = findPath(fighter.position, destination, fighter);
  if (!path || path.length === 0 || path.length > fighter.movementLeft) return false;

  fighter.position = { ...destination };
  fighter.movementLeft -= path.length;

  if (!silent) {
    addLog(`${fighter.name} moves ${path.length * feetPerSquare} ft. ${fighter.movementLeft * feetPerSquare} ft remains.`);
  }

  render();
  return true;
}

function handleTileClick(position) {
  const hero = state.fighters.hero;
  if (!state.combatStarted || activeFighter()?.id !== "hero" || aliveFighters().length < 2) return;

  if (hero.position.x === position.x && hero.position.y === position.y) return;
  if (!moveFighter(hero, position)) {
    addLog("That square is out of reach or blocked.");
    render();
  }
}

function bestStepToward(mover, target) {
  const reachable = Array.from(reachableTiles(mover).entries()).map(([key, cost]) => {
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

    if (isAdjacent(monster, target) && monster.hasAction) {
      makeAttack(monster, target);
    }
  }

  setTimeout(() => {
    if (activeFighter()?.id === "monster" && aliveFighters().length === 2) {
      endTurn();
    }
  }, 500);
}

function renderRoom() {
  els.room.innerHTML = "";
  const hero = state.fighters.hero;
  const heroTurn = state.combatStarted && activeFighter()?.id === "hero" && aliveFighters().length === 2;
  const reachable = heroTurn ? reachableTiles(hero) : new Map();

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.dataset.x = x;
      tile.dataset.y = y;
      const key = positionKey({ x, y });
      if (reachable.has(key)) {
        tile.classList.add("reachable");
        tile.title = `${reachable.get(key) * feetPerSquare} ft`;
      }
      tile.addEventListener("click", () => handleTileClick({ x, y }));

      const occupant = Object.values(state.fighters).find(
        (fighter) => fighter.position.x === x && fighter.position.y === y,
      );

      if (occupant) {
        const token = document.createElement("div");
        token.className = `token ${occupant.id}`;
        token.textContent = occupant.token;
        token.title = occupant.name;
        tile.append(token);
      }

      els.room.append(tile);
    }
  }
}

function renderFighterCard(element, fighter) {
  const hpPercent = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));
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
    <div class="stat-grid">
      <div class="stat-pill"><b>${abilityLabel(fighter.attackBonus)}</b><span>Attack</span></div>
      <div class="stat-pill"><b>${fighter.damage.label}</b><span>Damage</span></div>
      <div class="stat-pill"><b>${fighter.speedFeet} ft</b><span>Speed</span></div>
      <div class="stat-pill"><b>${fighter.movementLeft * feetPerSquare} ft</b><span>Move Left</span></div>
      <div class="stat-pill"><b>${abilityLabel(fighter.initiativeBonus)}</b><span>Init</span></div>
      <div class="stat-pill"><b>${fighter.hasAction ? "Yes" : "No"}</b><span>Action</span></div>
    </div>
  `;
}

function renderInitiative() {
  if (!state.combatStarted) {
    els.initiativeList.innerHTML = "";
    return;
  }

  els.initiativeList.innerHTML = state.initiative
    .map((entry, index) => {
      const activeClass = index === state.activeIndex ? " active" : "";
      return `
        <div class="initiative-item${activeClass}">
          <span>${entry.fighter.name}</span>
          <strong>${entry.total}</strong>
        </div>
      `;
    })
    .join("");
}

function renderLog() {
  els.log.innerHTML = state.log
    .slice()
    .reverse()
    .map((entry) => `<li class="${entry.type}">${entry.text}</li>`)
    .join("");
}

function renderControls() {
  const fighter = activeFighter();
  const heroTurn = state.combatStarted && fighter?.id === "hero" && aliveFighters().length === 2;
  const heroCanAttack =
    heroTurn && state.fighters.hero.hasAction && isAdjacent(state.fighters.hero, state.fighters.monster);

  els.rollInitiative.disabled = state.combatStarted;
  els.attack.disabled = !heroCanAttack;
  els.endTurn.disabled = !heroTurn;
  els.roundLabel.textContent = `Round ${state.round}`;

  if (!state.combatStarted) {
    els.turnLabel.textContent = "Roll initiative to begin";
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
  state = createInitialState();
  render();
});
els.clearLog.addEventListener("click", () => {
  state.log = [];
  renderLog();
});

render();
