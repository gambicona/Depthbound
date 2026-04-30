const gridSize = 7;

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
      hero: { ...templates.hero, hp: templates.hero.maxHp, alive: true },
      monster: { ...templates.monster, hp: templates.monster.maxHp, alive: true },
    },
    log: [
      {
        text: "A crypt guard scrapes its blade across the stones. Roll initiative when ready.",
        type: "important",
      },
    ],
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
  if (!attacker.alive || !defender.alive) return;

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
    endTurn();
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

  endTurn();
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
      makeAttack(state.fighters.monster, state.fighters.hero);
    }
  }, 650);
}

function renderRoom() {
  els.room.innerHTML = "";

  for (let y = 0; y < gridSize; y += 1) {
    for (let x = 0; x < gridSize; x += 1) {
      const tile = document.createElement("div");
      tile.className = "tile";
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
      <div class="stat-pill"><b>${abilityLabel(fighter.initiativeBonus)}</b><span>Init</span></div>
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

  els.rollInitiative.disabled = state.combatStarted;
  els.attack.disabled = !heroTurn;
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
