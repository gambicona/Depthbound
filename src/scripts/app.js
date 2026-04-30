const { gridSize, feetPerSquare, tokenSlideMs, templates } = window.DungeonConfig;
const { rollDie, rollDice, abilityLabel } = window.DungeonDice;
const { distance, isAdjacent, positionKey, findPath, reachableTiles } = window.DungeonGrid;

let state = createInitialState();
let roomIsBuilt = false;
let monsterTurnTimer = null;

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

function aliveFighters() {
  return Object.values(state.fighters).filter((fighter) => fighter.alive);
}

function activeFighter() {
  return state.initiative[state.activeIndex]?.fighter;
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
  if (!fighter.alive || fighter.movementLeft <= 0) return false;

  const path = findPath(fighter.position, destination, fighter, state.fighters);
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
  const reachable = Array.from(reachableTiles(mover, state.fighters).entries()).map(([key, cost]) => {
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

  const tileLayer = document.createElement("div");
  tileLayer.className = "tile-layer";

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
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

  token.style.left = `${((fighter.position.x + 0.5) / gridSize) * 100}%`;
  token.style.top = `${((fighter.position.y + 0.5) / gridSize) * 100}%`;
  token.classList.toggle("defeated", !fighter.alive);
}

function renderRoom() {
  if (!roomIsBuilt) buildRoom();

  const hero = state.fighters.hero;
  const heroTurn = state.combatStarted && activeFighter()?.id === "hero" && aliveFighters().length === 2;
  const reachable = heroTurn ? reachableTiles(hero, state.fighters) : new Map();

  els.room.querySelectorAll(".tile").forEach((tile) => {
    const position = { x: Number(tile.dataset.x), y: Number(tile.dataset.y) };
    const key = positionKey(position);
    const isReachable = reachable.has(key);
    tile.classList.toggle("reachable", isReachable);
    tile.disabled = !isReachable;
    tile.title = isReachable ? `${reachable.get(key) * feetPerSquare} ft` : "";
  });

  Object.values(state.fighters).forEach(placeToken);
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
  window.clearTimeout(monsterTurnTimer);
  state = createInitialState();
  roomIsBuilt = false;
  render();
});
els.clearLog.addEventListener("click", () => {
  state.log = [];
  renderLog();
});

render();
