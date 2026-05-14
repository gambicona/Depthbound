async function handleHeroDeath() {
  if (!partyDefeatedOrDying() || state.deathPromptShown) return;
  state.deathPromptShown = true;
  window.clearTimeout(monsterTurnTimer);
  render();

  const choice = await showChoiceDialog({
    title: "Defeat",
    message: "Restart this dungeon from the hidden quicksave made when it began?",
    choices: [
      { value: "restart", label: "Restart Dungeon" },
      { value: "stay", label: "Stay Defeated" },
    ],
  });

  if (choice !== "restart") return;
  const payload = await loadQuickstart();
  if (!payload?.state) {
    addLog("No dungeon restart save was found.", "important");
    render();
    return;
  }

  window.clearTimeout(monsterTurnTimer);
  state = normalizeLoadedState(payload.state);
  selectedHeroIds = new Set([state.party.activeHeroId]);
  showDungeonLayout = false;
  roomIsBuilt = false;
  addLog("Dungeon restarted from the beginning.", "important");
  render();
  centerViewOnHero();
}

function downHero(hero) {
  hero.hp = 0;
  hero.alive = true;
  hero.deathSaves = hero.deathSaves ?? { successes: 0, failures: 0 };
  hero.hasAction = false;
  hero.hasBonusAction = false;
  hero.movementLeft = 0;
}

function killHero(hero) {
  hero.hp = 0;
  hero.alive = false;
  hero.dead = true;
  hero.deathSaves = { successes: 0, failures: 3 };
  dropLootForHero(hero);
  state.party.heroIds = livingPartyHeroIds();
  if (state.party.activeHeroId === hero.id) {
    state.party.activeHeroId = state.party.heroIds[0] ?? state.party.rosterIds.find((id) => state.fighters[id] && !state.fighters[id].dead) ?? "hero";
  }
  addLog(`${hero.name} dies.`, "important");
  handleHeroDeath();
}

function applyDamageToFighter(defender, damage) {
  const wasDown = isPartyHeroId(defender.id) && defender.hp <= 0;
  const previousHp = defender.hp;
  defender.hp = Math.max(0, defender.hp - damage);
  checkConcentrationAfterDamage(defender, damage);
  if (!isPartyHeroId(defender.id)) {
    defender.alive = defender.hp > 0;
    return;
  }
  playSoundEffect("characterDamage");
  if (
    defender.hp <= 0 &&
    previousHp > 0 &&
    defender.racialTraits?.relentlessEndurance &&
    !defender.relentlessEnduranceUsed
  ) {
    defender.hp = 1;
    defender.alive = true;
    defender.relentlessEnduranceUsed = true;
    addLog(`${defender.name}'s Relentless Endurance keeps them standing at 1 HP.`, "important");
    return;
  }
  if (defender.hp > 0) {
    defender.alive = true;
    defender.deathSaves = { successes: 0, failures: 0 };
    return;
  }
  if (wasDown) {
    defender.deathSaves.failures += 1;
    addLog(`${defender.name} takes damage while down: death save failure ${defender.deathSaves.failures}/3.`, "important");
    if (defender.deathSaves.failures >= 3) killHero(defender);
    else handleHeroDeath();
    return;
  }
  downHero(defender);
  addLog(`${defender.name} drops to 0 HP and starts making death saves.`, "important");
  handleHeroDeath();
}

function checkConcentrationAfterDamage(fighter, damage) {
  if (!fighter?.concentration || damage <= 0 || fighter.hp <= 0) return;
  const dc = Math.max(10, Math.floor(damage / 2));
  const save = savingThrow(fighter, "con", dc);
  addLog(`${fighter.name} makes a concentration save: CON ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
  if (!save.success) endConcentration(fighter, "failed concentration save");
}

function showDeathSaveMenu(hero) {
  return new Promise((resolve) => {
    const message = `${hero.name} is at 0 HP and must make a death saving throw.`;
    let resultRoll = null;
    addLog(message, "important");
    els.gameDialogTitle.textContent = "Death Save";
    els.gameDialogMessage.innerHTML = `
      ${dialogActorMarkup(hero)}
      <p>${escapeHtml(message)}</p>
      <p>Roll d20. 10 or higher is a success, 1 counts as two failures, and 20 brings the hero back with 1 HP.</p>
    `;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `<button type="button" data-death-save-roll>Roll Death Save</button>`;

    const cleanup = () => {
      if (resultRoll === null) return;
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(resultRoll);
    };

    const handleClick = (event) => {
      if (event.target.closest("[data-death-save-close]")) {
        cleanup();
        return;
      }
      if (!event.target.closest("[data-death-save-roll]")) return;
      resultRoll = rollD20ForFighter(hero).roll;
      const resultText =
        resultRoll === 20
          ? "20: the hero gets back up with 1 HP."
          : resultRoll === 1
            ? "Natural 1: two death save failures."
            : resultRoll >= 10
              ? "Success."
              : "Failure.";
      els.gameDialogMessage.innerHTML = `
        ${dialogActorMarkup(hero)}
        <p>${escapeHtml(message)}</p>
        <p><b>Result:</b> ${resultRoll}. ${escapeHtml(resultText)}</p>
      `;
      els.gameDialogActions.innerHTML = `<button type="button" data-death-save-close>Close</button>`;
      activeDialogCancel = cleanup;
      els.gameDialogActions.querySelector("[data-death-save-close]")?.focus();
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => {};
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-death-save-roll]")?.focus();
  });
}

async function rollDeathSave(hero) {
  if (!isPartyHeroId(hero.id) || hero.hp > 0 || hero.dead) return;
  hero.deathSaves = hero.deathSaves ?? { successes: 0, failures: 0 };
  if (hero.deathSaves.successes >= 3) {
    addLog(`${hero.name} is stable at 0 HP.`, "important");
    await maybeFinishEncounterAfterHeroRecovery();
    return;
  }
  const roll = await showDeathSaveMenu(hero);
  if (roll === 20) {
    hero.hp = 1;
    hero.alive = true;
    hero.deathSaves = { successes: 0, failures: 0 };
    addLog(`${hero.name} rolls a 20 death save and gets back up with 1 HP.`, "important");
    recordD20OutcomeForFighter(hero, true);
    await maybeFinishEncounterAfterHeroRecovery();
    return;
  }
  if (roll === 1) hero.deathSaves.failures += 2;
  else if (roll >= 10) hero.deathSaves.successes += 1;
  else hero.deathSaves.failures += 1;
  recordD20OutcomeForFighter(hero, roll >= 10);
  addLog(`${hero.name} death save: ${roll}. Successes ${hero.deathSaves.successes}/3, failures ${hero.deathSaves.failures}/3.`, "important");
  if (hero.deathSaves.failures >= 3) killHero(hero);
  else if (hero.deathSaves.successes >= 3) {
    hero.alive = true;
    hero.deathSaves = { successes: 3, failures: 0 };
    addLog(`${hero.name} stabilizes.`, "important");
    await maybeFinishEncounterAfterHeroRecovery();
  }
}

function heroCanAct(fighter) {
  return fighter?.alive && !fighter.dead && fighter.hp > 0;
}

function heroIsStableAtZero(hero) {
  return Boolean(hero?.alive && !hero.dead && hero.hp <= 0 && (hero.deathSaves?.successes ?? 0) >= 3);
}

function heroIsUnstableDying(hero) {
  return Boolean(hero?.alive && !hero.dead && hero.hp <= 0 && (hero.deathSaves?.successes ?? 0) < 3);
}

function unstableDyingPartyHeroes() {
  return partyHeroes().filter(heroIsUnstableDying);
}

function stableUnconsciousPartyHeroes() {
  return partyHeroes().filter(heroIsStableAtZero);
}

function partyDefeatedOrDying() {
  const heroes = partyHeroes();
  return heroes.length === 0 || heroes.every((hero) => !heroCanAct(hero));
}

function addLog(text, type = "") {
  state.log.push({ text, type });
  if (state.log.length > 80) {
    state.log.shift();
  }
}

function turnLogSideForFighter(fighter) {
  if (isPartyHeroId(fighter?.id)) return "hero";
  if (fighter?.friendly || fighter?.team === "heroes") return "friendly";
  return "enemy";
}

function addTurnStartLog(fighter) {
  if (!fighter) return;
  const side = turnLogSideForFighter(fighter);
  addLog(`${fighter.name}'s turn starts.`, `turn-start turn-${side}`);
}

function resetTurnResources(fighter) {
  agePersistentSpellAreasForCaster(fighter);
  tickStatusDurations(fighter);
  fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => !effect.expiresAtStartOfTurn);
  fighter.lastMoveFeet = 0;
  for (const ability of fighterAbilityDefinitions(fighter).filter((entry) => entry.refresh === "turn")) {
    fighter.abilityUses = { ...(fighter.abilityUses ?? {}), [ability.id]: 0 };
  }
  refreshDerivedStats(fighter);
  if (isPartyHeroId(fighter?.id) && fighter.hp <= 0) {
    endConcentration(fighter, "defeated");
    fighter.movementLeft = 0;
    fighter.hasAction = false;
    fighter.attacksRemaining = 0;
    fighter.hasBonusAction = false;
    fighter.hasReaction = false;
    fighter.dodging = false;
    fighter.disengaged = false;
    fighter.canMoveThroughMonsters = false;
    return;
  }
  const movementLocked = (fighter.statusEffects ?? []).some((effect) => effect.speedLocked);
  const actionLocked = (fighter.statusEffects ?? []).some((effect) => effect.actionLocked);
  fighter.movementLeft = movementLocked ? 0 : Math.floor(fighter.speedFeet / feetPerSquare);
  fighter.hasAction = !actionLocked;
  fighter.attacksRemaining = fighter.hasAction ? attacksPerAttackAction(fighter) : 0;
  fighter.sneakAttackUsedThisTurn = false;
  fighter.hasBonusAction = !actionLocked;
  fighter.hasReaction = !actionLocked;
  fighter.dodging = false;
  fighter.disengaged = false;
  fighter.canMoveThroughMonsters = false;
  void applyPersistentSpellAreasAtTurnStart(fighter);
}

function hasReactionAvailable(fighter) {
  return Boolean(fighter?.alive && !fighter.dead && fighter.hasReaction);
}

function consumeReaction(fighter, label = "reaction") {
  if (!hasReactionAvailable(fighter)) return false;
  fighter.hasReaction = false;
  addLog(`${fighter.name} uses their reaction${label ? ` for ${label}` : ""}.`, "important");
  return true;
}

function fighterKnowsSpell(fighter, spellId) {
  const canonical = canonicalSpellId(spellId);
  return (fighter?.spells ?? []).some((knownId) => canonicalSpellId(knownId) === canonical);
}

function canUseReactionSpell(fighter, spellId) {
  const spell = getContentDefinition("spells", spellId);
  return Boolean(spell && spell.resource === "reaction" && hasReactionAvailable(fighter) && fighterKnowsSpell(fighter, spellId) && canPaySpellCost(fighter, spell));
}

function spendReactionSpellResources(caster, spell) {
  const cost = spellPointCost(spell);
  if (cost > 0) {
    ensureSpellPointState(caster);
    caster.spellPoints = Math.max(0, (caster.spellPoints ?? 0) - cost);
    addLog(`${caster.name} spends ${cost} SP on ${spell.name}.`, "important");
  }
  consumeReaction(caster, spell.name);
}

function bardicInspirationDie(target) {
  const effect = (target?.statusEffects ?? []).find((entry) => entry.id === "bardic-inspiration");
  return effect ? { effect, sides: effect.dieSides ?? 6 } : null;
}

function consumeBardicInspiration(target) {
  target.statusEffects = (target.statusEffects ?? []).filter((entry) => entry.id !== "bardic-inspiration");
}

async function maybeUseBardicAttackDie(attacker, totalAttack, defenderAc) {
  if (!isPartyHeroId(attacker?.id) || totalAttack >= defenderAc) return { totalAttack, used: false };
  const inspiration = bardicInspirationDie(attacker);
  if (!inspiration || totalAttack + inspiration.sides < defenderAc) return { totalAttack, used: false };
  const useDie = await showReactionPrompt({
    actor: attacker,
    title: "Bardic Inspiration",
    message: `${attacker.name} missed by ${defenderAc - totalAttack}. Add 1d${inspiration.sides}?`,
    acceptLabel: "Add Die",
    declineLabel: "Save It",
  });
  if (!useDie) return { totalAttack, used: false };
  const roll = rollDie(inspiration.sides);
  consumeBardicInspiration(attacker);
  addLog(`${attacker.name} uses Bardic Inspiration: +${roll}.`, "important");
  return { totalAttack: totalAttack + roll, used: true };
}

async function maybeUseShieldReaction(defender, attacker, totalAttack, defenderAc) {
  if (!isPartyHeroId(defender?.id) || totalAttack < defenderAc || totalAttack >= defenderAc + 5 || !canUseReactionSpell(defender, "shield")) return false;
  const useShield = await showReactionPrompt({
    actor: defender,
    title: "Shield",
    message: `${attacker.name}'s attack would hit AC ${defenderAc}. Cast Shield to raise AC by 5 and block it?`,
    acceptLabel: "Cast Shield",
  });
  if (!useShield) return false;
  const spell = { ...getContentDefinition("spells", "shield"), casterLevel: defender.level ?? 1 };
  spendReactionSpellResources(defender, spell);
  applyStatusEffect(defender, { ...(spell.effect?.status ?? {}), id: "shield", label: "Shield" });
  refreshDerivedStats(defender);
  addLog(`${defender.name}'s Shield turns the attack aside.`, "important");
  return true;
}

function canUseUncannyDodge(defender, damage) {
  return Boolean(isPartyHeroId(defender?.id) && defender.classId === "rogue" && (defender.level ?? 1) >= 5 && hasReactionAvailable(defender) && damage > 0);
}

async function maybeUseUncannyDodge(defender, attacker, damage) {
  if (!canUseUncannyDodge(defender, damage)) return damage;
  const useDodge = await showReactionPrompt({
    actor: defender,
    title: "Uncanny Dodge",
    message: `${attacker.name} would deal ${damage} damage. Use Uncanny Dodge to halve it?`,
    acceptLabel: "Halve Damage",
  });
  if (!useDodge || !consumeReaction(defender, "Uncanny Dodge")) return damage;
  const reduced = Math.max(0, Math.floor(damage / 2));
  addLog(`${defender.name}'s Uncanny Dodge reduces the damage to ${reduced}.`, "important");
  return reduced;
}

async function maybeUseHellishRebuke(defender, attacker) {
  if (!isPartyHeroId(defender?.id) || !defender.alive || !attacker?.alive || !canUseReactionSpell(defender, "hellish-rebuke")) return;
  if (!isInAttackRangeWithProfile(defender, attacker, { range: { kind: "ranged", feet: 60 } }) || !hasClearLineOfSight(defender.position, attacker.position)) return;
  const useRebuke = await showReactionPrompt({
    actor: defender,
    title: "Hellish Rebuke",
    message: `${defender.name} was damaged by ${attacker.name}. Cast Hellish Rebuke?`,
    acceptLabel: "Rebuke",
  });
  if (!useRebuke) return;
  const spell = { ...getContentDefinition("spells", "hellish-rebuke"), casterLevel: defender.level ?? 1 };
  spendReactionSpellResources(defender, spell);
  const wasAlive = attacker.alive;
  await applySpellDamage(defender, attacker, spell);
  if (wasAlive && !attacker.alive && !isPartyHeroId(attacker.id)) {
    playSoundEffect("enemyDefeated");
    awardMonsterXp(attacker);
    dropLootForMonster(attacker);
    await finishEncounterAfterLastMonsterFalls();
  }
}

function tickStatusDurations(fighter) {
  if (!fighter?.statusEffects?.length) return;
  const expired = [];
  fighter.statusEffects = fighter.statusEffects
    .map((effect) => {
      if (!effect.durationRounds) return effect;
      return { ...effect, durationRounds: effect.durationRounds - 1 };
    })
    .filter((effect) => {
      const keep = !effect.durationRounds || effect.durationRounds > 0;
      if (!keep) expired.push(effect.label ?? effect.id);
      return keep;
    });
  if (expired.length) addLog(`${fighter.name}'s ${expired.join(", ")} ${expired.length === 1 ? "expires" : "expire"}.`);
}

function attacksPerAttackAction(fighter) {
  const level = fighter?.level ?? 1;
  if (!["barbarian", "fighter", "monk", "paladin", "ranger"].includes(fighter?.classId)) return 1;
  if (fighter.classId === "fighter") return level >= 20 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;
  return level >= 5 ? 2 : 1;
}

function sneakAttackDice(fighter) {
  if (fighter?.classId !== "rogue") return 0;
  return Math.ceil((fighter.level ?? 1) / 2);
}

function canApplySneakAttack(attacker, defender, weapon, rangedAttack) {
  if (attacker?.classId !== "rogue" || attacker.sneakAttackUsedThisTurn) return false;
  const eligibleWeapon = rangedAttack || weapon?.properties?.includes("finesse");
  if (!eligibleWeapon) return false;
  if ((attacker.statusEffects ?? []).some((effect) => effect.id === "steady-aim")) return true;
  return Object.values(state.fighters).some(
    (fighter) =>
      fighter.id !== attacker.id &&
      fighter.id !== defender.id &&
      fighter.alive &&
      !fighter.dead &&
      isPartyHeroId(fighter.id) === isPartyHeroId(attacker.id) &&
      hasMeleeAccess(fighter, defender),
  );
}

function consumeWeaponRider(attacker) {
  const rider = (attacker.statusEffects ?? []).find((effect) => effect.weaponRider || ["thunderous-smite", "wrathful-smite", "branding-smite", "ensnaring-strike", "hail-of-thorns"].includes(effect.id));
  if (!rider) return null;
  attacker.statusEffects = (attacker.statusEffects ?? []).filter((effect) => effect.id !== rider.id);
  return rider;
}

async function applyWeaponRiderSecondary(attacker, defender, rider, attackDamage) {
  if (!rider || !defender?.alive) return;
  if (rider.id === "thunderous-smite") {
    const save = await rollSavingThrow(defender, "str", 8 + proficiencyBonus(attacker) + abilityMod(attacker, "cha"), `${attacker.name}'s Thunderous Smite tries to knock ${defender.name} down.`);
    if (!save.success) {
      applyStatusEffect(defender, { id: "prone", label: "Prone", attackBonus: -1, speedBonusFeet: -10, expiresAtEndOfTurn: true });
      addLog(`${defender.name} is knocked prone by Thunderous Smite.`, "important");
    }
  }
  if (rider.id === "wrathful-smite") {
    const save = await rollSavingThrow(defender, "wis", 8 + proficiencyBonus(attacker) + abilityMod(attacker, "cha"), `${attacker.name}'s Wrathful Smite tests ${defender.name}'s courage.`);
    if (!save.success) applyStatusEffect(defender, { id: "frightened", label: "Frightened", attackBonus: -2, durationRounds: 2 });
  }
  if (rider.id === "branding-smite") {
    applyStatusEffect(defender, { id: "branded", label: "Branded", attackBonus: -1, durationRounds: 3 });
    addLog(`${defender.name} is branded and easier to track.`, "important");
  }
  if (rider.id === "ensnaring-strike") {
    const dc = 8 + proficiencyBonus(attacker) + abilityMod(attacker, spellcastingAbility(attacker));
    const save = await rollSavingThrow(defender, "str", dc, `${attacker.name}'s Ensnaring Strike wraps around ${defender.name}.`);
    if (!save.success) applyStatusEffect(defender, { id: "restrained", label: "Restrained", speedLocked: true, durationRounds: 2 });
  }
  if (rider.id === "hail-of-thorns" && attackDamage?.range?.kind !== "melee") {
    const splashTargets = Object.values(state.fighters).filter((fighter) => fighter.id !== defender.id && hostileTo(attacker, fighter) && fighter.alive && distance(defender.position, fighter.position) <= 1);
    for (const target of splashTargets) {
      const save = await rollSavingThrow(target, "dex", 8 + proficiencyBonus(attacker) + abilityMod(attacker, spellcastingAbility(attacker)), `${attacker.name}'s Hail of Thorns bursts around ${defender.name}.`);
      const damage = Math.max(1, Math.floor((rider.damageBonus ?? 5) / (save.success ? 2 : 1)));
      applySpecialDamage(attacker, target, damage, rider.damageType ?? "piercing", "Hail of Thorns");
    }
  }
}

function expireEndOfTurnEffects(fighter) {
  if (!fighter) return;
  fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => !effect.expiresAtEndOfTurn);
  refreshDerivedStats(fighter);
}

function endRages(reason = "") {
  for (const hero of partyHeroes()) {
    const hadRage = (hero.statusEffects ?? []).some((effect) => effect.id === "rage");
    if (!hadRage) continue;
    hero.statusEffects = (hero.statusEffects ?? []).filter((effect) => effect.id !== "rage");
    refreshDerivedStats(hero);
    addLog(`${hero.name}'s Rage ends${reason ? ` ${reason}` : ""}.`, "important");
  }
}

function currentGridSize() {
  return state.dungeon?.gridSize ?? gridSize;
}

function currentTileSizePx() {
  return Math.round(tileSizePx * roomZoom);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function viewportCenterGridPoint() {
  if (!els.roomScroll || !els.room) return null;

  const tileSize = currentTileSizePx();
  return {
    x: clamp((els.roomScroll.scrollLeft + els.roomScroll.clientWidth / 2 - els.room.offsetLeft) / tileSize, 0, currentGridSize()),
    y: clamp((els.roomScroll.scrollTop + els.roomScroll.clientHeight / 2 - els.room.offsetTop) / tileSize, 0, currentGridSize()),
  };
}

function scrollRoomToGridPoint(point) {
  if (!point || !els.roomScroll || !els.room) return;

  const tileSize = currentTileSizePx();
  const scrollLeft = els.room.offsetLeft + point.x * tileSize - els.roomScroll.clientWidth / 2;
  const scrollTop = els.room.offsetTop + point.y * tileSize - els.roomScroll.clientHeight / 2;
  const maxScrollLeft = Math.max(0, els.roomScroll.scrollWidth - els.roomScroll.clientWidth);
  const maxScrollTop = Math.max(0, els.roomScroll.scrollHeight - els.roomScroll.clientHeight);

  els.roomScroll.scrollLeft = clamp(scrollLeft, 0, maxScrollLeft);
  els.roomScroll.scrollTop = clamp(scrollTop, 0, maxScrollTop);
}

function animateScrollRoomToGridPoint(point, duration = 180) {
  if (!point || !els.roomScroll || !els.room) return;

  const tileSize = currentTileSizePx();
  const targetLeft = clamp(els.room.offsetLeft + point.x * tileSize - els.roomScroll.clientWidth / 2, 0, Math.max(0, els.roomScroll.scrollWidth - els.roomScroll.clientWidth));
  const targetTop = clamp(els.room.offsetTop + point.y * tileSize - els.roomScroll.clientHeight / 2, 0, Math.max(0, els.roomScroll.scrollHeight - els.roomScroll.clientHeight));
  const startLeft = els.roomScroll.scrollLeft;
  const startTop = els.roomScroll.scrollTop;
  const deltaLeft = targetLeft - startLeft;
  const deltaTop = targetTop - startTop;
  const startTime = performance.now();

  if (roomScrollAnimation) {
    window.cancelAnimationFrame(roomScrollAnimation);
    roomScrollAnimation = null;
  }

  const ease = (t) => 1 - Math.pow(1 - t, 3);

  const step = (timestamp) => {
    const elapsed = Math.max(0, timestamp - startTime);
    const progress = Math.min(1, elapsed / duration);
    const eased = ease(progress);

    els.roomScroll.scrollLeft = startLeft + deltaLeft * eased;
    els.roomScroll.scrollTop = startTop + deltaTop * eased;

    if (progress < 1) {
      roomScrollAnimation = window.requestAnimationFrame(step);
    } else {
      roomScrollAnimation = null;
    }
  };

  roomScrollAnimation = window.requestAnimationFrame(step);
}

function centerViewOnHero({ animate = false } = {}) {
  const hero = activeHero();
  window.requestAnimationFrame(() => {
    if (animate) {
      animateScrollRoomToGridPoint({ x: hero.position.x + 0.5, y: hero.position.y + 0.5 });
    } else {
      scrollRoomToGridPoint({ x: hero.position.x + 0.5, y: hero.position.y + 0.5 });
    }
  });
}

function nudgeViewForHeroNearEdge() {
  if (!els.roomScroll || !els.room) return;
  const hero = activeHero();
  const tileSize = currentTileSizePx();
  const heroCenterX = els.room.offsetLeft + (hero.position.x + 0.5) * tileSize;
  const heroCenterY = els.room.offsetTop + (hero.position.y + 0.5) * tileSize;
  const left = els.roomScroll.scrollLeft;
  const top = els.roomScroll.scrollTop;
  const right = left + els.roomScroll.clientWidth;
  const bottom = top + els.roomScroll.clientHeight;
  const marginX = Math.min(els.roomScroll.clientWidth * 0.28, tileSize * 3);
  const marginY = Math.min(els.roomScroll.clientHeight * 0.28, tileSize * 3);
  const nearEdge = heroCenterX < left + marginX || heroCenterX > right - marginX || heroCenterY < top + marginY || heroCenterY > bottom - marginY;

  if (nearEdge) {
    animateScrollRoomToGridPoint({ x: hero.position.x + 0.5, y: hero.position.y + 0.5 }, 240);
  }
}

function renderKeepingGridFocus(point) {
  render();
  window.requestAnimationFrame(() => scrollRoomToGridPoint(point));
}

function currentWalkable() {
  const walkable = new Set((state.dungeon?.walkable ?? []).map(positionKey));
  blockingObjectKeys().forEach((tileKey) => walkable.delete(tileKey));
  return walkable;
}

function dungeonFloorKeys() {
  return new Set((state.dungeon?.walkable ?? []).map(positionKey));
}

function positionFromKey(tileKey) {
  const [x, y] = tileKey.split(",").map(Number);
  return { x, y };
}

function exposedWallKeys() {
  const walkable = currentWalkable();
  const activeKeys = activeTileKeys();
  const walls = new Set();
  for (const tileKey of walkable) {
    if (!activeKeys.has(tileKey)) continue;
    const position = positionFromKey(tileKey);
    if (!isKnownTile(position)) continue;

    for (const neighbor of adjacentCells(position)) {
      const neighborKey = positionKey(neighbor);
      if (!walkable.has(neighborKey)) walls.add(neighborKey);
    }
  }
  return walls;
}

function visibleFloorEdgeKeys() {
  const keys = new Set();
  const walkable = currentWalkable();
  for (const tileKey of visibleWalkable()) {
    if (!walkable.has(tileKey)) continue;
    keys.add(tileKey);
  }
  return keys;
}

function movementEdgeKey(from, to) {
  return [positionKey(from), positionKey(to)].sort().join("|");
}

function corridorTiles() {
  return new Set((state.dungeon?.corridors ?? []).map(positionKey));
}

function corridorPassageIdsForEdge(from, to) {
  const edge = movementEdgeKey(from, to);
  return (state.dungeon?.corridorPassages ?? [])
    .filter((passage) => passage.edges?.includes(edge))
    .map((passage) => passage.id);
}

function previousPositionForPath(fighter, path) {
  if (!path || path.length <= 1) return fighter.position;
  return path[path.length - 2];
}

function activeCorridorIdsAt(fighter, position, path = []) {
  if (!corridorTiles().has(positionKey(position)) || path.length === 0) return [];
  return corridorPassageIdsForEdge(previousPositionForPath(fighter, path), position);
}

function movementStateKey(fighter, position, path = []) {
  const activeCorridors = activeCorridorIdsAt(fighter, position, path);
  return `${positionKey(position)}:${activeCorridors.sort().join("+")}`;
}

function currentOpenedKeys() {
  return new Set([...(state.exploration?.openedDoorKeys ?? []), ...(state.exploration?.openedCorridorKeys ?? [])]);
}

function currentDiscoveredRoomIds() {
  return new Set(state.exploration?.discoveredRoomIds ?? []);
}

function activeRoomIds() {
  const rooms = state.dungeon?.rooms ?? [];
  if (showDungeonLayout) return new Set(rooms.map((room) => room.id));
  if (state.mode === "home") return new Set(["home-room"]);

  const ids = new Set();
  const heroPositions = partyHeroes().map((hero) => hero.position);
  const addRoomAt = (position) => {
    const room = roomForPosition(position);
    if (room) ids.add(room.id);
  };

  partyHeroes().forEach((hero) => addRoomAt(hero.position));
  const active = activeFighter();
  if (active?.position) addRoomAt(active.position);
  combatMonsters().forEach((monster) => addRoomAt(monster.position));

  const opened = currentOpenedKeys();
  const discovered = currentDiscoveredRoomIds();
  for (const room of rooms) {
    if (ids.has(room.id) || !discovered.has(room.id)) continue;
    const hasNearbyOpenedDoor = room.doors.some((door) => {
      const doorKey = positionKey(door);
      if (!opened.has(doorKey)) return false;
      const corridor = door.corridor ?? door;
      return heroPositions.some((heroPosition) => distance(heroPosition, corridor) <= activeCorridorRadius);
    });
    if (hasNearbyOpenedDoor) ids.add(room.id);
  }

  return ids;
}

function activeTileKeys() {
  const keys = new Set();
  const rooms = state.dungeon?.rooms ?? [];
  if (showDungeonLayout) {
    (state.dungeon?.walkable ?? []).forEach((cell) => keys.add(positionKey(cell)));
    (state.dungeon?.doors ?? []).forEach((door) => keys.add(positionKey(door)));
    return keys;
  }

  const activeRooms = activeRoomIds();
  for (const room of rooms) {
    if (!activeRooms.has(room.id)) continue;
    room.cells.forEach((cell) => keys.add(positionKey(cell)));
    room.doors.forEach((door) => keys.add(positionKey(door)));
  }

  const heroPositions = partyHeroes().map((hero) => hero.position);
  const opened = currentOpenedKeys();
  for (const tileKey of opened) {
    const position = positionFromKey(tileKey);
    if (heroPositions.some((heroPosition) => distance(heroPosition, position) <= activeCorridorRadius)) {
      keys.add(tileKey);
      adjacentCells(position).forEach((cell) => {
        const key = positionKey(cell);
        if (opened.has(key)) keys.add(key);
      });
    }
  }

  for (const door of state.dungeon?.doors ?? []) {
    const doorKey = positionKey(door);
    const corridorKey = door.corridor ? positionKey(door.corridor) : "";
    if (activeRooms.has(door.roomId) || keys.has(corridorKey)) keys.add(doorKey);
  }

  return keys;
}

function rememberedTileKeys() {
  const keys = activeTileKeys();
  if (showDungeonLayout) return keys;

  const discovered = currentDiscoveredRoomIds();
  for (const room of state.dungeon?.rooms ?? []) {
    if (!discovered.has(room.id)) continue;
    room.cells.forEach((cell) => keys.add(positionKey(cell)));
    room.doors.forEach((door) => keys.add(positionKey(door)));
  }

  const opened = currentOpenedKeys();
  opened.forEach((tileKey) => keys.add(tileKey));
  for (const door of state.dungeon?.doors ?? []) {
    if (adjacentCells(door).some((cell) => opened.has(positionKey(cell)))) {
      keys.add(positionKey(door));
    }
  }

  return keys;
}

function isTileActive(position) {
  return activeTileKeys().has(positionKey(position));
}

function isKnownTile(position) {
  if (showDungeonLayout) return true;
  const tileKey = positionKey(position);
  if (currentOpenedKeys().has(tileKey)) return true;
  if (doorAt(position)) {
    const door = doorAt(position);
    if (currentDiscoveredRoomIds().has(door.roomId)) return true;
    return adjacentCells(position).some((cell) => currentOpenedKeys().has(positionKey(cell)));
  }
  return (state.dungeon?.rooms ?? []).some((room) => currentDiscoveredRoomIds().has(room.id) && roomHasCell(room, position));
}

function adjacentCells(position) {
  return [
    { x: position.x, y: position.y - 1 },
    { x: position.x + 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x - 1, y: position.y },
  ];
}

function surroundingCells(position) {
  const cells = [];
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      cells.push({ x: position.x + dx, y: position.y + dy });
    }
  }
  return cells;
}

function visibleWalkable() {
  const known = new Set();
  const openedKeys = currentOpenedKeys();
  const discovered = currentDiscoveredRoomIds();
  for (const room of state.dungeon?.rooms ?? []) {
    if (discovered.has(room.id)) {
      room.cells.forEach((cell) => known.add(positionKey(cell)));
      room.doors.forEach((door) => known.add(positionKey(door)));
    }
  }
  openedKeys.forEach((tileKey) => known.add(tileKey));
  for (const door of state.dungeon?.doors ?? []) {
    if (adjacentCells(door).some((cell) => openedKeys.has(positionKey(cell)))) {
      known.add(positionKey(door));
    }
  }
  blockingObjectKeys().forEach((tileKey) => known.delete(tileKey));
  return known;
}

function doorAt(position) {
  const tileKey = positionKey(position);
  return (state.dungeon?.doors ?? []).find((door) => positionKey(door) === tileKey) ?? null;
}

function doorPassageBetween(from, to) {
  return (state.dungeon?.doors ?? []).find((door) => {
    const doorKey = positionKey(door);
    const corridorKey = door.corridor ? positionKey(door.corridor) : "";
    const fromKey = positionKey(from);
    const toKey = positionKey(to);
    return (fromKey === doorKey && toKey === corridorKey) || (fromKey === corridorKey && toKey === doorKey);
  });
}

function canTraverseDungeonEdge(from, to) {
  const door = doorPassageBetween(from, to);
  return !door || currentOpenedKeys().has(positionKey(door));
}

function canSeeThroughDungeonEdge(from, to) {
  const door = doorPassageBetween(from, to);
  if (door) return currentOpenedKeys().has(positionKey(door));

  const fromRoom = roomForPosition(from);
  const toRoom = roomForPosition(to);
  if (fromRoom && toRoom) return fromRoom.id === toRoom.id;
  return corridorPassageIdsForEdge(from, to).length > 0;
}

function canTraverseMovementEdge(fighter, from, to, path = []) {
  const door = doorPassageBetween(from, to);
  if (door) return currentOpenedKeys().has(positionKey(door));

  const fromRoom = roomForPosition(from);
  const toRoom = roomForPosition(to);
  if (fromRoom && toRoom) return fromRoom.id === toRoom.id;

  const corridorIds = corridorPassageIdsForEdge(from, to);
  if (corridorIds.length === 0) return false;

  const activeCorridors = activeCorridorIdsAt(fighter, from, path);
  if (activeCorridors.length === 0) return true;
  return corridorIds.some((id) => activeCorridors.includes(id));
}

function hasVisibleWallEdge(position, delta, visibleWallKeys = exposedWallKeys(), visibleFloorKeys = visibleFloorEdgeKeys()) {
  const neighbor = { x: position.x + delta.x, y: position.y + delta.y };
  if (!window.DungeonGrid.isInsideGrid(neighbor, currentGridSize())) return false;
  const walkable = currentWalkable();
  const positionWalkable = walkable.has(positionKey(position));
  const neighborWalkable = walkable.has(positionKey(neighbor));
  if (!positionWalkable || !visibleFloorKeys.has(positionKey(position))) return false;
  if (!neighborWalkable) return isKnownTile(neighbor) || visibleWallKeys.has(positionKey(neighbor));
  if (doorPassageBetween(position, neighbor)) return false;
  if (!visibleFloorKeys.has(positionKey(neighbor)) && canTraverseMovementEdge(activeHero(), position, neighbor, [])) return false;
  return !canTraverseMovementEdge(activeHero(), position, neighbor, []);
}

function wallEdgeSegments() {
  const segments = [];
  const walkable = currentWalkable();
  const activeKeys = activeTileKeys();
  const visibleWallKeys = exposedWallKeys();
  const visibleFloorKeys = visibleFloorEdgeKeys();
  const north = { x: 0, y: -1 };
  const west = { x: -1, y: 0 };
  for (const tileKey of walkable) {
    if (!activeKeys.has(tileKey)) continue;
    const position = positionFromKey(tileKey);
    if (!visibleFloorKeys.has(tileKey)) continue;
    if (hasVisibleWallEdge(position, { x: 1, y: 0 }, visibleWallKeys, visibleFloorKeys)) segments.push({ position, direction: "east" });
    if (hasVisibleWallEdge(position, { x: 0, y: 1 }, visibleWallKeys, visibleFloorKeys)) segments.push({ position, direction: "south" });
    if (!walkable.has(positionKey({ x: position.x + north.x, y: position.y + north.y })) && hasVisibleWallEdge(position, north, visibleWallKeys, visibleFloorKeys)) {
      segments.push({ position, direction: "north" });
    }
    if (!walkable.has(positionKey({ x: position.x + west.x, y: position.y + west.y })) && hasVisibleWallEdge(position, west, visibleWallKeys, visibleFloorKeys)) {
      segments.push({ position, direction: "west" });
    }
  }
  return segments;
}

function reciprocalDoor(door) {
  const targetRoom = (state.dungeon?.rooms ?? []).find((room) => room.id === door.to);
  return targetRoom?.doors.find((targetDoor) => targetDoor.to === door.roomId) ?? null;
}

function roomForPosition(position) {
  return (state.dungeon?.rooms ?? []).find((room) => roomHasCell(room, position)) ?? null;
}

function doorsAtCorridorMouth(position) {
  const tileKey = positionKey(position);
  return (state.dungeon?.doors ?? []).filter((door) => door.corridor && positionKey(door.corridor) === tileKey);
}

function visibleMonsters() {
  const activeTiles = activeTileKeys();
  const activeInitiativeIds = new Set((state.initiative ?? []).map((entry) => entry.fighterId));
  return aliveMonsters().filter((monster) => (activeInitiativeIds.has(monster.id) || activeTiles.has(positionKey(monster.position))) && isKnownTile(monster.position));
}

function monsterHasLineOfSightToHero(monster) {
  return partyHeroes().some((hero) => hasClearLineOfSight(monster.position, hero.position));
}

function monsterThreatensHeroes(monster) {
  if (fledMonsterIds.has(monster.id)) {
    return monsterHasLineOfSightToHero(monster);
  }

  const monsterRoom = roomForPosition(monster.position);
  if (!monsterRoom) return true;
  return partyHeroes().some((hero) => {
    const heroRoom = roomForPosition(hero.position);
    return !heroRoom || heroRoom.id === monsterRoom.id;
  });
}

function threateningMonsters() {
  return visibleMonsters().filter(monsterThreatensHeroes);
}

function combatMonsters() {
  const heroIds = new Set([...(state.party?.heroIds ?? ["hero"]), ...(state.party?.rosterIds ?? [])]);
  return state.initiative
    .map((entry) => state.fighters[entry.fighterId])
    .filter((fighter) => fighter && !heroIds.has(fighter.id) && fighter.alive);
}

function combatNeedsHeroTurns() {
  return combatMonsters().length > 0 || unstableDyingPartyHeroes().length > 0;
}

function hasMeleeAccess(attacker, defender) {
  const dx = Math.abs(attacker.position.x - defender.position.x);
  const dy = Math.abs(attacker.position.y - defender.position.y);
  if (Math.max(dx, dy) !== 1) return false;
  if (dx + dy === 1) return canTraverseMovementEdge(attacker, attacker.position, defender.position, []);

  const cornerA = { x: defender.position.x, y: attacker.position.y };
  const cornerB = { x: attacker.position.x, y: defender.position.y };
  const walkable = dungeonFloorKeys();
  const canReachViaA =
    walkable.has(positionKey(cornerA)) &&
    canTraverseMovementEdge(attacker, attacker.position, cornerA, []) &&
    canTraverseMovementEdge(attacker, cornerA, defender.position, []);
  const canReachViaB =
    walkable.has(positionKey(cornerB)) &&
    canTraverseMovementEdge(attacker, attacker.position, cornerB, []) &&
    canTraverseMovementEdge(attacker, cornerB, defender.position, []);
  return canReachViaA || canReachViaB;
}

function adjacentMonster() {
  const hero = activeHero();
  return visibleMonsters().find((monster) => hasMeleeAccess(hero, monster)) ?? null;
}

function attackRangeSquares(fighter) {
  const range = damageProfile(fighter).range;
  return Math.max(1, Math.floor((range?.feet ?? 5) / feetPerSquare));
}

function profileRangeSquares(profile) {
  return Math.max(1, Math.floor((profile?.range?.feet ?? 5) / feetPerSquare));
}

function attackUsesRangedProfile(fighter) {
  const weapon = activeWeapon(fighter);
  const attackDamage = damageProfile(fighter);
  return weaponIsRanged(weapon) || attackDamage.range?.kind === "ranged";
}

function attackGridDistance(a, b) {
  return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

function lineCellsBetween(from, to) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const steps = Math.max(Math.abs(dx), Math.abs(dy)) * 8;
  const cells = [];
  let lastKey = "";
  for (let step = 0; step <= steps; step += 1) {
    const t = steps === 0 ? 0 : step / steps;
    const position = {
      x: Math.floor(from.x + 0.5 + dx * t),
      y: Math.floor(from.y + 0.5 + dy * t),
    };
    const key = positionKey(position);
    if (key !== lastKey) {
      cells.push(position);
      lastKey = key;
    }
  }
  return cells;
}

function hasClearLineOfSight(from, to) {
  const shootable = new Set((state.dungeon?.walkable ?? []).map(positionKey));

  lineOfSightBlockingObjectKeys().forEach((tileKey) => {
    shootable.delete(tileKey);
  });

  const cells = lineCellsBetween(from, to);
  if (cells.length === 0) return false;

  for (const cell of cells) {
    if (!shootable.has(positionKey(cell))) return false;
  }

  for (let index = 1; index < cells.length; index += 1) {
    const previous = cells[index - 1];
    const current = cells[index];
    const dx = Math.abs(current.x - previous.x);
    const dy = Math.abs(current.y - previous.y);

    if (dx + dy === 1) {
      if (!canSeeThroughDungeonEdge(previous, current)) return false;
      continue;
    }

    if (dx === 1 && dy === 1) {
      const cornerA = { x: current.x, y: previous.y };
      const cornerB = { x: previous.x, y: current.y };
      const pathA =
        shootable.has(positionKey(cornerA)) &&
        canSeeThroughDungeonEdge(previous, cornerA) &&
        canSeeThroughDungeonEdge(cornerA, current);
      const pathB =
        shootable.has(positionKey(cornerB)) &&
        canSeeThroughDungeonEdge(previous, cornerB) &&
        canSeeThroughDungeonEdge(cornerB, current);
      if (!pathA && !pathB) return false;
    }
  }

  return true;
}

function isWithinAttackDistance(attacker, defender) {
  const range = attackRangeSquares(attacker);
  if (range <= 1) return hasMeleeAccess(attacker, defender);
  return attackGridDistance(attacker.position, defender.position) <= range;
}

function isInAttackRange(attacker, defender) {
  if (!isWithinAttackDistance(attacker, defender)) return false;
  if (attackRangeSquares(attacker) > 1) return hasClearLineOfSight(attacker.position, defender.position);
  return !attackUsesRangedProfile(attacker) || hasClearLineOfSight(attacker.position, defender.position);
}

function isInAttackRangeWithProfile(attacker, defender, profile) {
  const range = profileRangeSquares(profile);
  const withinDistance = range <= 1 ? hasMeleeAccess(attacker, defender) : attackGridDistance(attacker.position, defender.position) <= range;
  if (!withinDistance) return false;
  if (range > 1) return hasClearLineOfSight(attacker.position, defender.position);
  return profile.range?.kind !== "ranged" || hasClearLineOfSight(attacker.position, defender.position);
}

function attackTargets() {
  const hero = activeFighter();
  if (state.mode !== "combat" || !hero || !isPartyHeroId(hero.id) || combatMonsters().length === 0) return [];
  return visibleMonsters().filter((monster) => isInAttackRange(hero, monster));
}

function isValidAttackTargetId(targetId) {
  return attackTargets().some((monster) => monster.id === targetId);
}

function selectedAttackTarget() {
  if (!isValidAttackTargetId(selectedAttackTargetId)) selectedAttackTargetId = null;
  const targets = attackTargets();
  if (!selectedAttackTargetId && targets.length > 0) selectedAttackTargetId = targets[0].id;
  return targets.find((monster) => monster.id === selectedAttackTargetId) ?? null;
}

function attackTarget() {
  return selectedAttackTarget();
}

function selectAttackTarget(targetId) {
  if (!isValidAttackTargetId(targetId)) return false;
  selectedAttackTargetId = targetId;
  render();
  return true;
}

function selectedHeroCanTargetMonster(monster) {
  const hero = activeFighter();
  return Boolean(monster?.alive && hero && isPartyHeroId(hero.id) && isInAttackRange(hero, monster));
}

function cycleAttackTarget() {
  const targets = attackTargets();
  if (targets.length <= 1) return false;
  const currentIndex = targets.findIndex((monster) => monster.id === selectedAttackTargetId);
  selectedAttackTargetId = targets[(currentIndex + 1) % targets.length].id;
  render();
  return true;
}

function canOffHandAttack(fighter) {
  if (state.mode !== "combat" || !fighter?.hasBonusAction || !heroCanAct(fighter) || !isPartyHeroId(fighter.id)) return false;
  const main = weaponFromSlot(fighter, "mainHand");
  const offHand = weaponFromSlot(fighter, "offHand");
  if (!main?.damage || !offHand?.damage) return false;
  if (!main.properties?.includes("light") || !offHand.properties?.includes("light")) return false;
  const target = attackTarget();
  if (!target) return false;
  const profile = damageProfile(fighter, { weapon: offHand, includeDamageModifier: false });
  return isInAttackRangeWithProfile(fighter, target, profile);
}

function nearestVisibleMonster() {
  const hero = activeHero();
  return visibleMonsters().sort((a, b) => distance(a.position, hero.position) - distance(b.position, hero.position))[0] ?? null;
}

function attackBonusForAbility(fighter, ability) {
  const weapon = activeWeapon(fighter);
  const magicBonus = (weapon?.magic?.attackBonus ?? 0) + magicEffects(fighter).attackBonus;
  if (isPartyHeroId(fighter?.id)) return abilityMod(fighter, ability) + proficiencyBonus(fighter) + magicBonus;
  const baseBonus = fighter.attackBonus ?? 0;
  const baseAbility = fighter.baseAttackAbilityMod ?? abilityMod(fighter, "str");
  return baseBonus - baseAbility + abilityMod(fighter, ability) + magicBonus;
}

function hostileTo(fighter, candidate) {
  if (!candidate.alive || candidate.id === fighter.id) return false;
  const heroIds = new Set(state.party?.heroIds ?? ["hero"]);
  const fighterIsHero = heroIds.has(fighter.id);
  const candidateIsHero = heroIds.has(candidate.id);
  return fighterIsHero ? !candidateIsHero : candidateIsHero;
}

function canOpportunityAttack(attacker, defender, from, to) {
  if (state.mode !== "combat" || !attacker.alive || !defender.alive || !hostileTo(attacker, defender)) return false;
  if (!hasReactionAvailable(attacker)) return false;
  if (defender.disengaged) return false;
  const profile = opportunityAttackProfile(attacker);
  const range = profileRangeSquares(profile);
  const hadThreat = range <= 1 ? hasMeleeAccess(attacker, { ...defender, position: from }) : attackGridDistance(attacker.position, from) <= range && hasClearLineOfSight(attacker.position, from);
  const keepsThreat = range <= 1 ? hasMeleeAccess(attacker, { ...defender, position: to }) : attackGridDistance(attacker.position, to) <= range && hasClearLineOfSight(attacker.position, to);
  return hadThreat && !keepsThreat;
}

async function shouldTakeOpportunityAttack(attacker, defender) {
  if (!hasReactionAvailable(attacker)) return false;
  if (!isPartyHeroId(attacker.id)) return consumeReaction(attacker, "opportunity attack");
  const useAttack = await showReactionPrompt({
    actor: attacker,
    title: "Opportunity Attack",
    message: `${defender.name} is leaving ${attacker.name}'s reach. Make an opportunity attack?`,
    acceptLabel: "Attack",
  });
  return useAttack && consumeReaction(attacker, "opportunity attack");
}

async function finishEncounterAfterLastMonsterFalls() {
  if (combatMonsters().length > 0) return false;

  const dyingHeroes = unstableDyingPartyHeroes();
  if (dyingHeroes.length > 0) {
    if (!state.deathSaveAfterVictoryLogged) {
      addLog("The enemies are down, but turn order continues until the dying heroes are stabilized.", "important");
      state.deathSaveAfterVictoryLogged = true;
    }
    render();
    return true;
  }

  if (combatMonsters().length === 0 && state.combatStarted && !partyDefeatedOrDying()) {
    endCurrentEncounter();
    addLog("The room falls quiet. Exploration resumes.", "important");
  }
  return true;
}

async function maybeFinishEncounterAfterHeroRecovery() {
  if (state.mode !== "combat" || !state.combatStarted || combatMonsters().length > 0) return false;
  if (unstableDyingPartyHeroes().length > 0 || partyDefeatedOrDying()) return false;
  return finishEncounterAfterLastMonsterFalls();
}

async function opportunityAttack(attacker, defender) {
  const profile = opportunityAttackProfile(attacker);
  const attackRollResult = rollD20ForFighter(attacker, { disadvantage: defender.dodging });
  const attackRolls = attackRollResult.rolls;
  const attackRoll = attackRollResult.roll;
  const currentAttackBonus = profile.weapon ? attackBonusForWeapon(attacker, profile.weapon) : attackBonusForAbility(attacker, profile.attackAbility ?? "str");
  const defenderAc = armorClass(defender);
  let totalAttack = attackRoll + currentAttackBonus;
  const isCritical = attackRoll === 20;
  const inspiration = await maybeUseBardicAttackDie(attacker, totalAttack, defenderAc);
  totalAttack = inspiration.totalAttack;
  const shieldBlocked = attackRoll !== 1 && totalAttack >= defenderAc ? await maybeUseShieldReaction(defender, attacker, totalAttack, defenderAc) : false;
  const isMiss = attackRoll === 1 || totalAttack < defenderAc || shieldBlocked;

  addLog(
    `${attacker.name} makes an opportunity attack with ${profile.weaponName}${defender.dodging ? " with disadvantage" : ""}: d20 ${defender.dodging ? `${attackRolls.join(" / ")} -> ${attackRoll}` : attackRoll} ${abilityLabel(currentAttackBonus)} = ${totalAttack} vs AC ${defenderAc}.`,
    "important",
  );

  if (isMiss) {
    addLog(attackRoll === 1 ? "Natural 1. The opportunity attack misses badly." : `${defender.name} slips away.`);
    recordD20OutcomeForFighter(attacker, false);
    return;
  }
  recordD20OutcomeForFighter(attacker, true);

  const damageRoll = profile.flat
    ? { total: profile.flat, rolls: [profile.flat] }
    : rollDice(profile.count * (isCritical ? 2 : 1), profile.sides);
  const packets = [
    {
      raw: Math.max(1, damageRoll.total + (profile.bonus ?? 0)),
      type: profile.type,
      label: `${damageRoll.rolls.join(" + ")} ${abilityLabel(profile.bonus ?? 0)} ${profile.type ?? "damage"}`,
    },
  ];
  for (const extra of profile.extraDamage ?? []) {
    const extraRoll = rollDice((extra.count ?? 1) * (isCritical ? 2 : 1), extra.sides ?? 4);
    packets.push({
      raw: Math.max(1, extraRoll.total + (extra.bonus ?? 0)),
      type: extra.type,
      label: `${extraRoll.rolls.join(" + ")}${extra.bonus ? ` ${abilityLabel(extra.bonus)}` : ""} ${extra.type}`,
    });
  }
  if (isPartyHeroId(defender.id) && adminEnabled() && adminGodMode) {
    addLog(`God mode prevents ${attacker.name}'s opportunity damage to ${defender.name}.`, "important");
    return;
  }
  const resolvedPackets = packets.map((packet) => ({ ...packet, ...calculateDamageModifiers(defender, packet.raw, packet.type) }));
  let totalDamage = resolvedPackets.reduce((sum, packet) => sum + packet.damage, 0);
  totalDamage = await maybeUseUncannyDodge(defender, attacker, totalDamage);
  applyDamageToFighter(defender, totalDamage);
  defender.lastDamagedById = attacker.id;
  const adjustmentNote = resolvedPackets
    .filter((packet) => packet.reason)
    .map((packet) => `${defender.name} is ${packet.reason} to ${packet.type} damage.`)
    .join(" ");
  addLog(
    `${attacker.name} hits for ${totalDamage} damage (${resolvedPackets.map((packet) => packet.label).join("; ")}).${isCritical ? " Critical hit." : ""}${adjustmentNote ? ` ${adjustmentNote}` : ""}`,
    "damage",
  );

  if (!defender.alive) {
    addLog(`${defender.name} drops to 0 HP.`, "important");
    if (isPartyHeroId(defender.id)) {
      handleHeroDeath();
    } else {
      if (isPartyHeroId(attacker.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(defender);
      dropLootForMonster(defender);
      await finishEncounterAfterLastMonsterFalls();
    }
  }
}

function monstersInRoom(roomId) {
  return aliveMonsters().filter((monster) => monster.roomId === roomId);
}

function isExitPosition(position) {
  return state.exit?.position && positionKey(state.exit.position) === positionKey(position);
}

function canHeroUseHomeExit(hero = activeHero()) {
  return state.mode === "home" && hero?.alive && isPartyHeroId(hero.id);
}

function checkDungeonCompletion(hero = activeHero()) {
  if (canHeroUseHomeExit(hero) && isExitPosition(hero.position)) {
    showHomeMenu();
    return true;
  }
  if (state.completed || !hero || !isExitPosition(hero.position)) return false;
  if (monstersInRoom(state.exit.roomId).length > 0) return false;

  const tokenAward = categoryForHeroLevel(hero.level ?? 1);
  for (const partyHero of partyHeroes()) {
    partyHero.inventory.heroTokens = (partyHero.inventory.heroTokens ?? 0) + tokenAward;
  }
  playSoundEffect("exitReached");
  state = createHomeState(rosterHeroes(), state.chest ?? [], state.chestMoney ?? {}, state.party);
  state.combatStarted = false;
  roomIsBuilt = false;
  addLog(`${hero.name} reaches the exit. Dungeon complete. The party gained ${tokenAward} Hero Token${tokenAward === 1 ? "" : "s"} each.`, "important");
  render();
  centerViewOnHero();
  return true;
}

function createLootForMonster(monster) {
  const category = Math.max(currentLootCategory(), monsterCategory(monster));
  const boss = monster.id?.startsWith("boss-") || monster.tags?.includes("boss");
  const healingPotion = rollDie(100) <= (boss ? 30 : 5) ? randomHealingPotionDrop() : null;
  const equipmentDrop = rollDie(100) <= (boss ? 18 : 2) ? randomEquipmentDrop() : null;
  const treasureDrop = rollDie(100) <= (boss ? 75 : 2) ? randomTreasureDrop(category) : null;
  const magicDrop = rollDie(100) <= (boss ? Math.min(55, 20 + category * 8) : Math.min(2, Math.max(1, Math.floor(category / 2)))) ? randomMagicLootDrop(category) : null;
  const items = [healingPotion, equipmentDrop, treasureDrop, magicDrop, ...(monster.pickedUpItems ?? []), ...definedLootForMonster(monster)].filter(Boolean);
  return {
    id: `loot-${monster.id}-${Date.now()}`,
    position: { ...monster.position },
    money: boss ? normalizeMoney({ gp: rollDie(category * 4), sp: rollDie(10), cp: rollDie(10) }) : { cp: rollDie(11) - 1, sp: 0, gp: 0 },
    items,
  };
}

function rollLootQuantity(loot) {
  const dice = loot.quantityDice;
  if (!dice) return loot.quantity ?? 1;
  return rollDice(dice.count ?? 1, dice.sides ?? 1).total + (dice.bonus ?? 0);
}

function definedLootForMonster(monster) {
  return (monster.extraLoot ?? [])
    .map((loot) => {
      if (loot.kind === "randomEquipment") return randomEquipmentDrop();
      if (loot.kind !== "item" || !loot.itemId) return null;
      const item = createItemInstance(loot.itemId, "loot");
      if (!item) return null;
      if (item.ammo) {
        item.ammo.quantity = Math.max(0, rollLootQuantity(loot));
        item.name = `${item.ammo.kind[0].toUpperCase()}${item.ammo.kind.slice(1)}s (${item.ammo.quantity})`;
      }
      return item;
    })
    .filter(Boolean);
}

function itemValueGp(item) {
  if (!item?.cost) return 1;
  const rates = { cp: 0.01, sp: 0.1, ep: 0.5, gp: 1, pp: 10 };
  return Math.max(0.01, (item.cost.amount ?? 0) * (rates[item.cost.unit] ?? 1));
}

function itemValueCp(item) {
  if (!item?.cost) return 0;
  return moneyToCp({ [item.cost.unit]: item.cost.amount ?? 0 });
}

function itemSellValueCp(item) {
  if (item?.starterEquipment) return 0;
  if (item?.sell?.valueCp !== undefined) return Math.max(0, Math.floor(item.sell.valueCp));
  const sellRate = item?.sell?.rate ?? (item?.store?.sellable === true ? 0.5 : 0.5);
  return Math.floor(itemValueCp(item) * sellRate);
}

function weightedPick(entries) {
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return null;
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
  return entries.at(-1)?.item ?? null;
}

function dungeonLootItems() {
  const table = getContentDefinition("lootTables", defaultContent.lootTable);
  const ids = table?.itemIds?.length ? new Set(table.itemIds) : null;
  return window.DungeonContent.list("items").filter((item) => !ids || ids.has(item.id));
}

function currentLootCategory() {
  return Math.max(1, categoryForHeroLevel(averagePartyLevel(activeHero())));
}

function maxLootPriceGpForCategory(category = currentLootCategory()) {
  const caps = {
    1: 2500,
    2: 9000,
    3: 35000,
    4: 90000,
    5: 200000,
  };
  return caps[Math.min(5, Math.max(1, category))] ?? 2500;
}

function lootItemAllowedForCategory(item, category = currentLootCategory()) {
  const priceGp = item.loot?.priceGp ?? item.treasure?.valueGp ?? itemValueGp(item);
  return priceGp <= maxLootPriceGpForCategory(category);
}

function weightedLootPick(items, category = currentLootCategory()) {
  const entries = items
    .filter((item) => lootItemAllowedForCategory(item, category))
    .map((item) => ({
      item,
      weight: item.loot?.dropWeight ?? item.treasure?.dropWeight ?? Math.max(1, Math.round(400 / Math.sqrt(Math.max(1, itemValueGp(item))))),
    }));
  return weightedPick(entries);
}

function randomMagicLootDrop(category = currentLootCategory()) {
  const item = weightedLootPick(
    window.DungeonContent.list("items").filter((candidate) => candidate.tags?.includes("loot:magic") || candidate.tags?.includes("magic-item")),
    category,
  );
  return item ? createItemInstance(item.id, "magic-loot") : null;
}

function randomTreasureDrop(category = currentLootCategory()) {
  const item = weightedLootPick(
    window.DungeonContent.list("items").filter((candidate) => candidate.type === "treasure" || candidate.tags?.includes("treasure")),
    category,
  );
  return item ? createItemInstance(item.id, "treasure") : null;
}

function randomHealingPotionDrop() {
  const rarityWeights = {
    "potion-healing": 75,
    "potion-greater-healing": 18,
    "potion-superior-healing": 6,
    "potion-supreme-healing": 1,
  };
  const potion = weightedPick(
    dungeonLootItems()
      .filter((item) => item.use?.kind === "healing")
      .map((item) => ({ item, weight: rarityWeights[item.id] ?? 1 })),
  );
  return potion ? createItemInstance(potion.id, "loot") : null;
}

function randomEquipmentDrop() {
  const item = weightedPick(
    dungeonLootItems()
      .filter((candidate) => candidate.use?.kind !== "healing" && candidate.store?.buyable !== false && !candidate.tags?.includes("loot:magic") && candidate.type !== "treasure")
      .map((candidate) => ({ item: candidate, weight: 1 / Math.max(1, Math.sqrt(itemValueGp(candidate))) })),
  );
  return item ? createItemInstance(item.id, "loot") : null;
}

function dropLootForMonster(monster) {
  const loot = createLootForMonster(monster);
  addLootPile(loot);
}

function addLootPile(loot) {
  if (!loot) return null;
  const existing = (state.lootPiles ?? []).find((pile) => positionKey(pile.position) === positionKey(loot.position));
  if (!existing) {
    state.lootPiles = [...(state.lootPiles ?? []), loot];
    return loot;
  }
  existing.money = cpToMoney(moneyToCp(existing.money ?? {}) + moneyToCp(loot.money ?? {}));
  existing.heroTokens = (existing.heroTokens ?? 0) + (loot.heroTokens ?? 0);
  existing.items = [...(existing.items ?? []), ...(loot.items ?? [])];
  existing.thrownByHero = Boolean(existing.thrownByHero || loot.thrownByHero);
  return existing;
}

function thrownWeaponLandingPosition(targetPosition) {
  const walkable = currentWalkable();
  const blocked = blockingObjectKeys();
  const candidates = [...adjacentCells(targetPosition), targetPosition];
  return (
    candidates.find(
      (position) =>
        walkable.has(positionKey(position)) &&
        !blocked.has(positionKey(position)) &&
        !window.DungeonGrid.isOccupied(position, state.fighters),
    ) ?? targetPosition
  );
}

function dropThrownWeapon(attacker, weapon, targetPosition) {
  if (!isPartyHeroId(attacker?.id)) return;
  if (!weapon || !attacker?.inventory?.items?.some((item) => item.id === weapon.id)) return;
  for (const slot of equipmentSlots) {
    if (attacker.equipment[slot.id] === weapon.id) attacker.equipment[slot.id] = null;
  }
  attacker.inventory.items = attacker.inventory.items.filter((item) => item.id !== weapon.id);
  addLootPile({
    id: `loot-thrown-${weapon.id}-${Date.now()}`,
    position: thrownWeaponLandingPosition(targetPosition),
    money: normalizeMoney(),
    items: [weapon],
    thrownByHero: isPartyHeroId(attacker.id),
  });
  refreshDerivedStats(attacker);
  addLog(`${attacker.name} throws ${weapon.name}. It lands near the target.`, "important");
}

function createLootForHero(hero) {
  const inventory = hero.inventory ?? normalizeInventory();
  return {
    id: `loot-${hero.id}-${Date.now()}`,
    position: { ...hero.position },
    money: normalizeMoney(inventory.money),
    heroTokens: Math.max(0, Math.floor(inventory.heroTokens ?? 0)),
    items: [...(inventory.items ?? [])],
  };
}

function dropLootForHero(hero) {
  if (!hero || hero.deathLootDropped) return;
  const loot = createLootForHero(hero);
  const hasCoins = moneyToCp(loot.money) > 0;
  const hasHeroTokens = (loot.heroTokens ?? 0) > 0;
  const hasItems = (loot.items ?? []).length > 0;
  if (hasCoins || hasHeroTokens || hasItems) {
    addLootPile(loot);
    const lootText = [
      hasCoins ? moneyText(loot.money) : "",
      hasHeroTokens ? `${loot.heroTokens} Hero Token${loot.heroTokens === 1 ? "" : "s"}` : "",
      hasItems ? `${loot.items.length} item${loot.items.length === 1 ? "" : "s"}` : "",
    ]
      .filter(Boolean)
      .join(" and ");
    addLog(`${hero.name}'s belongings drop as a loot pile (${lootText}).`, "important");
  }
  hero.deathLootDropped = true;
  hero.inventory = {
    ...(hero.inventory ?? normalizeInventory()),
    money: normalizeMoney(),
    heroTokens: 0,
    items: [],
  };
  hero.equipment = normalizeEquipment();
  refreshDerivedStats(hero);
}

function awardMonsterXp(monster) {
  const xp = monster.xp ?? 50;
  const heroes = partyHeroes();
  const share = Math.max(1, Math.ceil(xp / Math.max(1, heroes.length)));
  heroes.forEach((hero) => {
    hero.xp = (hero.xp ?? 0) + share;
  });
  addLog(`${heroes.map((hero) => hero.name).join(", ")} gain ${share} XP.`, "important");
}

function awardHeroXp(xp, reason = "") {
  const hero = activeHero();
  hero.xp = (hero.xp ?? 0) + xp;
  addLog(`${hero.name} gains ${xp} XP${reason ? ` for ${reason}` : ""}.`, "important");
}

function collectLootAtPosition(fighter, position) {
  const lootIndex = state.lootPiles.findIndex((pile) => positionKey(pile.position) === positionKey(position));
  if (lootIndex < 0) return false;
  if (!isPartyHeroId(fighter.id)) return maybeMonsterPickUpThrownWeapon(fighter, lootIndex);

  const [loot] = state.lootPiles.splice(lootIndex, 1);
  addMoney(fighter.inventory.money, moneyToCp(loot.money));
  fighter.inventory.heroTokens = (fighter.inventory.heroTokens ?? 0) + (loot.heroTokens ?? 0);
  for (const item of loot.items ?? []) {
    addItemToInventory(fighter, item, "loot-stack");
  }

  const coinText = moneyToCp(loot.money) ? moneyText(loot.money) : "";
  const tokenText = loot.heroTokens ? `${loot.heroTokens} Hero Token${loot.heroTokens === 1 ? "" : "s"}` : "";
  const itemText = (loot.items ?? []).map((item) => item.name).join(", ");
  const lootText = [coinText, tokenText, itemText].filter(Boolean).join(" and ") || "nothing";
  addLog(`${fighter.name} collects ${lootText}.`, "important");
  return true;
}

function maybeMonsterPickUpThrownWeapon(monster, lootIndex) {
  const pile = state.lootPiles[lootIndex];
  if (!pile?.thrownByHero || (pile.items ?? []).length === 0 || Math.random() >= monsterThrownWeaponPickupChance) return false;
  const [loot] = state.lootPiles.splice(lootIndex, 1);
  monster.pickedUpItems = [...(monster.pickedUpItems ?? []), ...(loot.items ?? [])];
  addLog(`${monster.name} snatches up ${loot.items[0].name}.`, "important");
  return true;
}

function triggerTrapAtPosition(fighter, position) {
  const trap = objectAt(position);
  const hazard = trap ? objectComponent(trap, "hazardOnEnter") ?? objectComponent(trap, "hazardOnMovement") : null;
  if (!trap || !fighter.alive) return false;
  if (hazard && trap.armed !== false && !trap.disarmed) {
    const damage = hazard.damage ?? objectTemplate(trap.type)?.damage ?? { count: 1, sides: 4, type: "damage" };
    const damageRoll = rollDice(damage.count, damage.sides);
    const modified = calculateDamageModifiers(fighter, damageRoll.total, damage.type);
    applyDamageToFighter(fighter, modified.damage);
    trap.lastResult = `${fighter.name} is hurt by ${objectTemplate(trap.type)?.name ?? "a hazard"} for ${modified.damage} ${damage.type} damage.`;
    addLog(`${trap.lastResult}${modified.reason ? ` ${fighter.name} is ${modified.reason} to ${damage.type} damage.` : ""}`, "damage");
    if (hazard.once) {
      trap.armed = false;
      trap.spent = true;
    }
    if (!fighter.alive) {
      addLog(`${fighter.name} drops to 0 HP.`, "important");
      handleHeroDeath();
    }
    return true;
  }
  if (!objectIsTrap(trap) || trap.armed === false || trap.disarmed) return false;

  const template = objectTemplate(trap.type);
  const trapDamage = template.damage ?? objectComponent(trap, "trap")?.damage ?? { count: 1, sides: 4, type: "piercing" };
  const damageRoll = rollDice(trapDamage.count, trapDamage.sides);
  const rawDamage = damageRoll.total;
  if (isPartyHeroId(fighter.id) && adminEnabled() && adminGodMode) {
    trap.armed = false;
    trap.spent = true;
    trap.lastResult = `${fighter.name} triggered it, but god mode prevented the damage.`;
    addLog(`${fighter.name} triggers a spike trap. God mode prevents the damage.`, "important");
    return true;
  }
  const modified = calculateDamageModifiers(fighter, rawDamage, trapDamage.type);
  applyDamageToFighter(fighter, modified.damage);
  trap.armed = false;
  trap.spent = true;
  trap.lastResult = `${fighter.name} triggered it for ${modified.damage} ${trapDamage.type} damage (${damageRoll.rolls.join(" + ")}).`;
  const adjustmentNote = modified.reason ? ` ${fighter.name} is ${modified.reason} to ${trapDamage.type} damage.` : "";
  addLog(`${fighter.name} triggers ${template.name ?? "a trap"} for ${modified.damage} ${trapDamage.type} damage (${damageRoll.rolls.join(" + ")}).${adjustmentNote}`, "damage");

  if (!fighter.alive) {
    addLog(`${fighter.name} drops to 0 HP.`, "important");
    handleHeroDeath();
  }
  return true;
}

function triggerPortalAtPosition(fighter, position) {
  if (state.mode === "combat" || fighter.id !== "hero" || !fighter.alive) return false;
  const portal = (state.dungeonObjects ?? []).find(
    (object) => object.type === "portal" && positionKey(object.position) === positionKey(position),
  );
  const pairedPortal = portal ? dungeonObjectForId(portal.pairId) : null;
  if (!portal || !pairedPortal) return false;

  fighter.position = { ...pairedPortal.position };
  const destinationRoom = roomForPosition(pairedPortal.position);
  if (destinationRoom) {
    state.exploration.discoveredRoomIds = Array.from(new Set([...(state.exploration.discoveredRoomIds ?? []), destinationRoom.id]));
  }
  addLog(`${fighter.name} steps through a portal and emerges elsewhere in the dungeon.`, "important");
  playSoundEffect("portal");
  centerViewOnHero({ animate: true });
  return true;
}

function checkTrapDetectionOnReveal() {
  const heroes = partyHeroes();
  if (!heroes.length) return;
  const activeTiles = activeTileKeys();

  for (const trap of state.dungeonObjects ?? []) {
    if (!objectIsTrap(trap) || trap.detected || !objectCells(trap).some((cell) => activeTiles.has(positionKey(cell)) && isKnownTile(cell))) continue;

    trap.spotCheckedBy = trap.spotCheckedBy ?? [];
    for (const hero of heroes.filter((entry) => !trap.spotCheckedBy.includes(entry.id))) {
      trap.spotCheckedBy.push(hero.id);
      const roll = rollD20ForFighter(hero).roll;
      const bonus = skillCheckBonus(hero, "wis", "perception");
      const guidance = guidanceSkillBonus();
      const total = roll + bonus + guidance;
      const dc = trap.spotDc ?? 12;
      trap.detected = total >= dc;
      recordD20OutcomeForFighter(hero, trap.detected);
      if (trap.detected) {
        addLog(`${hero.name} spots a hidden trap.`, "important");
        break;
      }
    }
  }

  for (const chest of state.dungeonObjects ?? []) {
    if (!chest.trap || chest.trap.detected || !objectCells(chest).some((cell) => activeTiles.has(positionKey(cell)) && isKnownTile(cell))) continue;

    chest.trap.spotCheckedBy = chest.trap.spotCheckedBy ?? [];
    for (const hero of heroes.filter((entry) => !chest.trap.spotCheckedBy.includes(entry.id))) {
      chest.trap.spotCheckedBy.push(hero.id);
      const roll = rollD20ForFighter(hero).roll;
      const bonus = skillCheckBonus(hero, "wis", "perception");
      const guidance = guidanceSkillBonus();
      const total = roll + bonus + guidance;
      const dc = chest.trap.spotDc ?? 12;
      chest.trap.detected = total >= dc;
      recordD20OutcomeForFighter(hero, chest.trap.detected);
      if (chest.trap.detected) {
        addLog(`${hero.name} spots a hidden trap on ${objectTemplate(chest.type)?.name ?? "a feature"}.`, "important");
        break;
      }
    }
  }
}

function corridorPathBetweenDoors(door, targetDoor) {
  if (!door?.corridor || !targetDoor?.corridor) return [];
  const doorKey = positionKey(door.corridor);
  const targetKey = positionKey(targetDoor.corridor);
  const passage = (state.dungeon?.corridorPassages ?? []).find((candidate) => {
    const cells = new Set((candidate.cells ?? []).map(positionKey));
    return cells.has(doorKey) && cells.has(targetKey);
  });
  if (passage) return passage.cells ?? [];

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
  const relatedDoors = (state.dungeon?.doors ?? []).filter(
    (entry) => entry.roomId === door.roomId && positionKey(entry) === positionKey(door),
  );
  const doorsToOpen = relatedDoors.length ? relatedDoors : [door];

  const discovered = currentDiscoveredRoomIds();
  const openedDoorKeys = new Set(state.exploration.openedDoorKeys);
  const openedCorridorKeys = new Set(state.exploration.openedCorridorKeys);
  const revealedRooms = [];
  let openedAnyPassage = false;

  for (const entry of doorsToOpen) {
    const targetRoom = (state.dungeon?.rooms ?? []).find((room) => room.id === entry.to);
    const doorRoom = (state.dungeon?.rooms ?? []).find((room) => room.id === entry.roomId);
    const targetDoor = reciprocalDoor(entry);
    if (!targetRoom || !doorRoom || !targetDoor) continue;

    const openingFromDiscoveredRoom = discovered.has(entry.roomId);
    const roomToReveal = openingFromDiscoveredRoom ? null : doorRoom;

    openedDoorKeys.add(positionKey(entry));
    corridorPathBetweenDoors(entry, targetDoor).forEach((cell) => openedCorridorKeys.add(positionKey(cell)));
    openedAnyPassage = true;

    if (roomToReveal && !discovered.has(roomToReveal.id)) {
      discovered.add(roomToReveal.id);
      revealedRooms.push(roomToReveal);
    }
  }

  if (!openedAnyPassage) return false;

  state.exploration.discoveredRoomIds = Array.from(discovered);
  state.exploration.openedDoorKeys = Array.from(openedDoorKeys);
  state.exploration.openedCorridorKeys = Array.from(openedCorridorKeys);
  addLog(`${activeHero()?.name ?? "The party"} opens the door${revealedRooms.length === 1 ? ` to ${revealedRooms[0].name}` : ""}.`, "important");

  if (revealedRooms.some((room) => monstersInRoom(room.id).length > 0)) {
    addLog("Hostile movement answers from within. Roll initiative.", "important");
  }

  render();
  return true;
}

function doorCandidateForPosition(position, actor = activeHero()) {
  const directDoor = doorAt(position);
  if (directDoor) return directDoor;

  const hero = actor;
  if (!hero || position.x !== hero.position.x || position.y !== hero.position.y) return null;

  const corridorDoors = doorsAtCorridorMouth(position).filter((door) => !currentOpenedKeys().has(positionKey(door)));
  if (corridorDoors.length > 0) {
    const undiscovered = corridorDoors.find((door) => !currentDiscoveredRoomIds().has(door.roomId));
    return undiscovered ?? corridorDoors[0];
  }

  return adjacentCells(position).map(doorAt).filter(Boolean)[0] ?? null;
}

function doorPassageIsOpen(door) {
  const targetDoor = reciprocalDoor(door);
  if (!targetDoor) return currentOpenedKeys().has(positionKey(door));
  const openedKeys = currentOpenedKeys();
  return openedKeys.has(positionKey(door)) && corridorPathBetweenDoors(door, targetDoor).every((cell) => openedKeys.has(positionKey(cell)));
}

function sharedDoorPassagesAreOpen(door) {
  const relatedDoors = (state.dungeon?.doors ?? []).filter(
    (entry) => entry.roomId === door.roomId && positionKey(entry) === positionKey(door),
  );
  return (relatedDoors.length ? relatedDoors : [door]).every(doorPassageIsOpen);
}

function canOpenDoor(position, actor = activeHero()) {
  const hero = actor;
  const door = doorCandidateForPosition(position, actor);
  if (!hero || !door || !isKnownTile(position) || !isKnownTile(door)) return null;
  if (sharedDoorPassagesAreOpen(door)) return null;
  const heroRoom = roomForPosition(hero.position);
  if (heroRoom && currentDiscoveredRoomIds().has(heroRoom.id) && monstersInRoom(heroRoom.id).length > 0) {
    return null;
  }
  return distance(hero.position, door) <= 1 ? door : null;
}

function autoOpenAdjacentExplorationDoor(fighter) {
  if (!isPartyHeroId(fighter.id) || state.mode !== "exploration") return false;
  const door = doorAt(fighter.position) || doorsAtCorridorMouth(fighter.position).length > 0 ? canOpenDoor(fighter.position, fighter) : null;
  return door ? openDoor(door) : false;
}

function threatPresent() {
  return threateningMonsters().length > 0;
}

function endCurrentEncounter() {
  endRages("as the fight ends");
  state.deathSaveAfterVictoryLogged = false;
  state.combatStarted = false;
  state.mode = "exploration";
  state.initiative = [];
  state.activeIndex = 0;
  partyHeroes().forEach(resetTurnResources);
  checkDungeonCompletion();
}

function combatBlockingOverlayOpen() {
  return [els.mainMenu, els.fighterInfo, els.inventoryMenu, els.useItemMenu, els.abilitiesMenu, els.homeMenu, els.storeMenu, els.gameDialog].some(
    (element) => element && !element.classList.contains("hidden"),
  );
}

function shouldPromptForInitiative() {
  return (
    gameHasStarted &&
    !state.completed &&
    !movementInProgress &&
    state.mode !== "combat" &&
    !state.combatStarted &&
    !initiativePromptOpen &&
    !activeDialogCancel &&
    !combatBlockingOverlayOpen() &&
    threatPresent()
  );
}

function scheduleInitiativePromptIfNeeded() {
  if (initiativePromptQueued || !shouldPromptForInitiative()) return;
  initiativePromptQueued = true;
  window.setTimeout(async () => {
    initiativePromptQueued = false;
    if (!shouldPromptForInitiative()) return;
    initiativePromptOpen = true;
    await rollInitiative();
    initiativePromptOpen = false;
  }, 0);
}

function activateFledMonstersWithLineOfSight() {
  if (state.mode !== "combat" || !state.combatStarted || fledMonsterIds.size === 0) return;
  const activeIds = new Set(state.initiative.map((entry) => entry.fighterId));
  const joining = visibleMonsters().filter(
    (monster) => fledMonsterIds.has(monster.id) && !activeIds.has(monster.id) && monsterHasLineOfSightToHero(monster),
  );
  for (const monster of joining) {
    fledMonsterIds.delete(monster.id);
    addMonsterToInitiative(monster);
    addLog(`${monster.name} spots the party and joins the fight.`, "important");
  }
}

function fleeCombatStatus() {
  if (!gameHasStarted || state.mode !== "combat" || !state.combatStarted) {
    return { ok: false, reason: "Fleeing is only possible during combat." };
  }
  const heroes = partyHeroes();
  const monsters = combatMonsters();
  if (heroes.length === 0 || monsters.length === 0) {
    return { ok: false, reason: "There is no active fight to flee." };
  }

  const heroRooms = new Set();
  for (const hero of heroes) {
    const room = roomForPosition(hero.position);
    if (!room) return { ok: false, reason: "All heroes must be inside a room, not in a hallway." };
    heroRooms.add(room.id);
  }

  for (const monster of monsters) {
    const room = roomForPosition(monster.position);
    if (!room) return { ok: false, reason: "A monster is already in the hallway." };
    if (heroRooms.has(room.id)) return { ok: false, reason: "A monster is in the same room as a hero." };
  }

  for (const monster of aliveMonsters()) {
    const room = roomForPosition(monster.position);
    if (room && heroRooms.has(room.id)) return { ok: false, reason: "A hero's room still has a monster in it." };
  }

  return { ok: true, reason: "" };
}

function canFleeCombat() {
  return fleeCombatStatus().ok;
}

async function fleeCombat() {
  const status = fleeCombatStatus();
  if (!status.ok) {
    addLog(status.reason, "important");
    render();
    return;
  }

  const confirmed = await showGameDialog({
    title: "Flee Combat",
    message: "End turn order and keep exploring? This is only allowed because every hero is safely away from the monsters.",
    confirmText: "Flee",
    cancelText: "Stay",
  });
  if (!confirmed) return;

  fledMonsterIds = new Set(combatMonsters().map((monster) => monster.id));
  endCurrentEncounter();
  addLog("The party breaks contact. Exploration resumes.", "important");
  render();
}

function debugKillVisibleMonsters() {
  const targets = visibleMonsters();
  if (targets.length === 0) {
    addLog("Debug: no visible monsters to kill.");
    render();
    return;
  }

  targets.forEach((monster) => {
    dropLootForMonster(monster);
    awardMonsterXp(monster);
    monster.hp = 0;
    monster.alive = false;
  });
  endCurrentEncounter();
  addLog(`Debug: removed ${targets.length} visible monster${targets.length === 1 ? "" : "s"}.`, "important");
  render();
}

async function rollInitiative() {
  if (state.combatStarted) return;

  const monsters = threateningMonsters();
  if (monsters.length === 0) return;
  const heroEntries = partyHeroes().map((hero) => {
    const heroRoll = rollD20ForFighter(hero).roll;
    return {
      fighterId: hero.id,
      fighter: hero,
      side: "hero",
      roll: heroRoll,
      total: heroRoll + hero.initiativeBonus,
    };
  });

  const monsterEntries = monsters.map((monster) => {
    const monsterRoll = rollDie(20);
    return {
      fighterId: monster.id,
      fighter: monster,
      side: "monster",
      roll: monsterRoll,
      total: monsterRoll + monster.initiativeBonus,
    };
  });

  const rolled = await showInitiativeDialog([...heroEntries, ...monsterEntries]);
  if (!rolled) return;

  state.initiative = [
    ...heroEntries,
    ...monsterEntries,
  ]
    .map(({ fighter, side, ...entry }) => entry)
    .sort((a, b) => b.total - a.total || (isPartyHeroId(a.fighterId) ? -1 : 1));

  state.combatStarted = true;
  state.mode = "combat";
  monsterEntries.forEach((entry) => fledMonsterIds.delete(entry.fighterId));
  state.round = 1;
  state.activeIndex = 0;
  syncActiveHeroToTurn();
  resetTurnResources(activeFighter());

  addLog(
    `Initiative: ${[...heroEntries, ...monsterEntries]
      .map((entry) => `${state.fighters[entry.fighterId].name} rolls ${entry.roll} ${abilityLabel(state.fighters[entry.fighterId].initiativeBonus)} = ${entry.total}`)
      .join("; ")}.`,
    "important",
  );
  addTurnStartLog(activeFighter());

  render();
  maybeRunMonsterTurn();
}

async function makeAttack(attacker, defender, options = {}) {
  if (isPartyHeroId(attacker?.id) && attacker.hp <= 0) return;
  const usesBonusAction = options.resource === "bonusAction";
  if (!attacker.alive || !defender.alive || (usesBonusAction ? !attacker.hasBonusAction : !attacker.hasAction)) return;
  const weapon = options.weapon ?? (options.weaponSlot ? weaponFromSlot(attacker, options.weaponSlot) : activeWeapon(attacker));
  const thrownAsMelee = weapon?.properties?.includes("thrown") && hasMeleeAccess(attacker, defender);
  const attackDamage = damageProfile(attacker, { weapon, includeDamageModifier: options.includeDamageModifier });
  if (thrownAsMelee) attackDamage.range = { kind: "melee", feet: 5 };

  if (!isInAttackRangeWithProfile(attacker, defender, attackDamage)) {
    addLog(`${attacker.name} is too far away to attack ${defender.name}. Move closer first.`);
    render();
    return;
  }

  if (profileRangeSquares(attackDamage) > 1 && !hasClearLineOfSight(attacker.position, defender.position)) {
    addLog(`${attacker.name} does not have a clear line of sight to ${defender.name}.`);
    render();
    return;
  }

  if (!itemHasUsableAmmo(attacker, weapon)) {
    addLog(`${attacker.name} needs ammunition in the quiver to use ${weapon.name}.`);
    render();
    return;
  }

  if (usesBonusAction) attacker.hasBonusAction = false;
  else {
    attacker.attacksRemaining = Math.max(0, (attacker.attacksRemaining ?? attacksPerAttackAction(attacker)) - 1);
    attacker.hasAction = attacker.attacksRemaining > 0;
  }
  spendAmmunition(attacker, weapon);
  if (weapon?.properties?.includes("thrown") && !thrownAsMelee) {
    recordMonsterThrownWeaponUse(attacker, weapon);
    dropThrownWeapon(attacker, weapon, defender.position);
  }

  const rangedAttack = !thrownAsMelee && (weaponIsRanged(weapon) || ["ranged", "thrown"].includes(attackDamage.range?.kind));
  playSoundEffect(rangedAttack ? "rangedAttack" : "meleeAttack");
  const adjacentHostiles = hostileFightersAdjacentTo(attacker).length > 0;
  const rangedDisadvantage = rangedAttack && adjacentHostiles;
  const attackAdvantage = (attacker.statusEffects ?? []).some((effect) => effect.attackAdvantage);
  const defenderDodge = defender.dodging;
  const hasDisadvantage = rangedDisadvantage || defenderDodge;
  const attackRollResult = rollD20ForFighter(attacker, { advantage: attackAdvantage && !hasDisadvantage, disadvantage: hasDisadvantage && !attackAdvantage });
  const attackRolls = attackRollResult.rolls;
  const attackRoll = attackRollResult.roll;
  const defenderAc = armorClass(defender);
  const currentAttackBonus = attackBonusForWeapon(attacker, weapon);
  let totalAttack = attackRoll + currentAttackBonus;
  const isCritical = attackRoll === 20;
  const inspiration = await maybeUseBardicAttackDie(attacker, totalAttack, defenderAc);
  totalAttack = inspiration.totalAttack;
  const shieldBlocked = attackRoll !== 1 && totalAttack >= defenderAc ? await maybeUseShieldReaction(defender, attacker, totalAttack, defenderAc) : false;
  const isMiss = attackRoll === 1 || totalAttack < defenderAc || shieldBlocked;

  addLog(
    `${attacker.name} ${options.actionLabel ?? "attacks"}${attackAdvantage && !hasDisadvantage ? " with advantage" : ""}${rangedDisadvantage && !attackAdvantage ? " with disadvantage" : ""}${defenderDodge && !attackAdvantage ? " because the target is dodging" : ""}: d20 ${
      attackRolls.length > 1 ? `${attackRolls.join(" / ")} -> ${attackRoll}` : attackRoll
    } ${abilityLabel(currentAttackBonus)}${inspiration.used ? " + inspiration" : ""} = ${totalAttack} vs AC ${
      defenderAc
    }.`,
  );

  if (isMiss) {
    addLog(attackRoll === 1 ? "Natural 1. The attack misses badly." : shieldBlocked ? `${defender.name} blocks the blow with Shield.` : `${defender.name} avoids the blow.`);
    recordD20OutcomeForFighter(attacker, false);
    render();
    return;
  }
  recordD20OutcomeForFighter(attacker, true);

  const damageRoll = attackDamage.flat
    ? { total: attackDamage.flat, rolls: [attackDamage.flat] }
    : rollDice(attackDamage.count * (isCritical ? 2 : 1), attackDamage.sides);
  const packets = [
    {
      raw: Math.max(1, damageRoll.total + attackDamage.bonus),
      type: attackDamage.type,
      label: `${damageRoll.rolls.join(" + ")} ${abilityLabel(attackDamage.bonus)}${attackDamage.type ? ` ${attackDamage.type}` : ""}`,
    },
  ];
  if (isCritical && !rangedAttack && attacker.racialTraits?.savageAttacks && attackDamage.sides) {
    const savageRoll = rollDice(1, attackDamage.sides);
    packets.push({
      raw: savageRoll.total,
      type: attackDamage.type,
      label: `Savage Attacks ${savageRoll.rolls.join(" + ")}${attackDamage.type ? ` ${attackDamage.type}` : ""}`,
    });
  }
  for (const extra of attackDamage.extraDamage ?? []) {
    const extraRoll = rollDice((extra.count ?? 1) * (isCritical ? 2 : 1), extra.sides ?? 4);
    packets.push({
      raw: Math.max(1, extraRoll.total + (extra.bonus ?? 0)),
      type: extra.type,
      label: `${extraRoll.rolls.join(" + ")}${extra.bonus ? ` ${abilityLabel(extra.bonus)}` : ""} ${extra.type}`,
    });
  }
  if (canApplySneakAttack(attacker, defender, weapon, rangedAttack)) {
    const diceCount = sneakAttackDice(attacker) * (isCritical ? 2 : 1);
    const sneakRoll = rollDice(diceCount, 6);
    packets.push({
      raw: sneakRoll.total,
      type: attackDamage.type,
      label: `Sneak Attack ${sneakRoll.rolls.join(" + ")} ${attackDamage.type}`,
    });
    attacker.sneakAttackUsedThisTurn = true;
  }
  const rider = consumeWeaponRider(attacker);
  if (rider?.damageBonus) {
    packets.push({
      raw: rider.damageBonus,
      type: rider.damageType ?? "radiant",
      label: `${rider.label ?? "Weapon rider"} ${rider.damageBonus} ${rider.damageType ?? "radiant"}`,
    });
    addLog(`${attacker.name}'s ${rider.label ?? "weapon rider"} is released on the hit.`, "important");
  }
  if (isPartyHeroId(defender.id) && adminEnabled() && adminGodMode) {
    addLog(`God mode prevents ${attacker.name}'s damage to ${defender.name}.`, "important");
    render();
    return;
  }
  const resolvedPackets = packets.map((packet) => ({ ...packet, ...calculateDamageModifiers(defender, packet.raw, packet.type) }));
  let totalDamage = resolvedPackets.reduce((sum, packet) => sum + packet.damage, 0);
  totalDamage = await maybeUseUncannyDodge(defender, attacker, totalDamage);
  applyDamageToFighter(defender, totalDamage);
  defender.lastDamagedById = attacker.id;
  if (!isPartyHeroId(attacker.id)) {
    await applyMonsterOnHitSpecials(attacker, defender, totalDamage, isCritical);
  }

  const critText = isCritical ? " Critical hit." : "";
  const adjustmentNote = resolvedPackets
    .filter((packet) => packet.reason)
    .map((packet) => `${defender.name} is ${packet.reason} to ${packet.type} damage.`)
    .join(" ");
  addLog(
    `${attacker.name} hits for ${totalDamage} damage (${resolvedPackets.map((packet) => packet.label).join("; ")}).${critText}${adjustmentNote ? ` ${adjustmentNote}` : ""}`,
    "damage",
  );
  await applyWeaponRiderSecondary(attacker, defender, rider, attackDamage);
  if (totalDamage > 0) await maybeUseHellishRebuke(defender, attacker);

  if (!defender.alive && maybeUseUndeadFortitude(defender, totalDamage)) {
    addLog(`${defender.name} refuses to fall and remains at 1 HP.`, "important");
  }

  if (!defender.alive) {
    addLog(`${defender.name} drops to 0 HP. ${isPartyHeroId(attacker.id) ? "Victory." : "Defeat."}`, "important");
    if (!isPartyHeroId(defender.id)) {
      if (isPartyHeroId(attacker.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(defender);
      dropLootForMonster(defender);
    } else {
      handleHeroDeath();
    }
    if (isPartyHeroId(attacker.id)) await finishEncounterAfterLastMonsterFalls();
  }

  render();
}

function monsterSpecialNames(monster) {
  return (monster?.specialAbility ?? []).map((name) => String(name));
}

function hasMonsterSpecial(monster, pattern) {
  return monsterSpecialNames(monster).some((name) => pattern.test(name));
}

function monsterSpecialDc(monster) {
  return monsterSpecialAbilityTuning.saveDcBase + monsterCategory(monster) * monsterSpecialAbilityTuning.saveDcPerCategory;
}

function shouldUseMonsterSpecial(kind = "active") {
  const chance =
    kind === "onHit"
      ? monsterSpecialAbilityTuning.onHitUseChance
      : kind === "defensive"
        ? monsterSpecialAbilityTuning.defensiveUseChance
        : monsterSpecialAbilityTuning.activeUseChance;
  return Math.random() < chance;
}

function savingThrow(target, ability, dc) {
  const roll = rollD20ForFighter(target).roll;
  const statusBonus = (target.statusEffects ?? []).reduce((sum, effect) => sum + (effect.saveBonus ?? 0), 0);
  const auraBonus = auraSaveBonus(target);
  const bonus = abilityMod(target, ability) + statusBonus + auraBonus;
  const total = roll + bonus;
  const success = total >= dc;
  recordD20OutcomeForFighter(target, success);
  return { roll, bonus, total, success };
}

function auraSaveBonus(target) {
  if (!isPartyHeroId(target?.id)) return 0;
  const paladin = partyHeroes().find((hero) => hero.alive && (hero.level ?? 1) >= 6 && hero.classId === "paladin" && distance(hero.position, target.position) <= 2);
  return paladin ? Math.max(1, abilityMod(paladin, "cha")) : 0;
}

function showSavingThrowMenu({ target, ability, dc, message }) {
  return new Promise((resolve) => {
    const abilityText = ability.toUpperCase();
    let resultSave = null;
    els.gameDialogTitle.textContent = "Saving Throw";
    els.gameDialogMessage.innerHTML = `
      ${dialogActorMarkup(target)}
      <p>${escapeHtml(message)}</p>
      <p>${escapeHtml(target.name)} must roll a ${abilityText} save against DC ${dc}.</p>
    `;
    els.gameDialogField.classList.add("hidden");
    els.gameDialogActions.innerHTML = `
      <button type="button" data-save-roll>Roll ${abilityText} Save</button>
    `;

    const cleanup = () => {
      if (!resultSave) return;
      els.gameDialogActions.removeEventListener("click", handleClick);
      els.gameDialog.classList.add("hidden");
      activeDialogCancel = null;
      resolve(resultSave);
    };

    const handleClick = (event) => {
      if (event.target.closest("[data-save-close]")) {
        cleanup();
        return;
      }
      if (!event.target.closest("[data-save-roll]")) return;
      resultSave = savingThrow(target, ability, dc);
      els.gameDialogMessage.innerHTML = `
        ${dialogActorMarkup(target)}
        <p>${escapeHtml(message)}</p>
        <p><b>Result:</b> ${resultSave.roll} ${escapeHtml(abilityLabel(resultSave.bonus))} = ${resultSave.total} vs DC ${dc}.</p>
        <p>${resultSave.success ? "Success." : "Failure."}</p>
      `;
      els.gameDialogActions.innerHTML = `<button type="button" data-save-close>Close</button>`;
      activeDialogCancel = cleanup;
      els.gameDialogActions.querySelector("[data-save-close]")?.focus();
    };

    els.gameDialogActions.addEventListener("click", handleClick);
    activeDialogCancel = () => {};
    els.gameDialog.classList.remove("hidden");
    els.gameDialogActions.querySelector("[data-save-roll]")?.focus();
  });
}

async function rollSavingThrow(target, ability, dc, message) {
  if (!isPartyHeroId(target?.id)) {
    const save = savingThrow(target, ability, dc);
    addLog(`${target.name} rolls ${ability.toUpperCase()} save: ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
    return save;
  }
  addLog(message, "important");
  const save = await showSavingThrowMenu({ target, ability, dc, message });
  if (!save.success) {
    const inspiration = bardicInspirationDie(target);
    if (inspiration && save.total + inspiration.sides >= dc) {
      const useDie = await showReactionPrompt({
        actor: target,
        title: "Bardic Inspiration",
        message: `${target.name} failed by ${dc - save.total}. Add 1d${inspiration.sides} to the save?`,
        acceptLabel: "Add Die",
        declineLabel: "Save It",
      });
      if (useDie) {
        const roll = rollDie(inspiration.sides);
        save.total += roll;
        save.success = save.total >= dc;
        consumeBardicInspiration(target);
        addLog(`${target.name} uses Bardic Inspiration on the save: +${roll}.`, "important");
      }
    }
  }
  addLog(`${target.name} rolls ${ability.toUpperCase()} save: ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
  return save;
}

function applyStatusEffect(target, effect) {
  target.statusEffects = (target.statusEffects ?? []).filter((entry) => entry.id !== effect.id);
  target.statusEffects.push(effect);
  refreshDerivedStats(target);
  if (effect.tempHp) {
    target.hp = Math.min(target.maxHp, target.hp + effect.tempHp);
  }
}

function specialDamageDice(monster, sides = 6) {
  const category = monsterCategory(monster);
  return { count: Math.max(1, Math.ceil(category / 2)), sides, bonus: Math.max(0, category - 1) };
}

function applySpecialDamage(source, target, damage, type, label) {
  if (isPartyHeroId(target.id) && adminEnabled() && adminGodMode) {
    addLog(`God mode prevents ${source.name}'s ${label} damage to ${target.name}.`, "important");
    return 0;
  }
  const modified = calculateDamageModifiers(target, damage, type);
  applyDamageToFighter(target, modified.damage);
  const note = modified.reason ? ` ${target.name} is ${modified.reason} to ${type} damage.` : "";
  addLog(`${source.name}'s ${label} deals ${modified.damage} ${type} damage to ${target.name}.${note}`, "damage");
  return modified.damage;
}

function spellcastingAbility(fighter) {
  return fighter?.spellcastingAbility ?? "wis";
}

function spellSaveDc(fighter) {
  return 8 + proficiencyBonus(fighter) + abilityMod(fighter, spellcastingAbility(fighter));
}

function spellAttackBonus(fighter) {
  return proficiencyBonus(fighter) + abilityMod(fighter, spellcastingAbility(fighter));
}

function spellBaseLevel(spell) {
  return Math.max(0, Math.min(9, spell?.level ?? 1));
}

function spellCastLevel(spell) {
  return Math.max(spellBaseLevel(spell), Math.min(9, Number(spell?.castLevel ?? spellBaseLevel(spell))));
}

function spellPointCost(spell, castLevel = spellCastLevel(spell)) {
  return spell?.costsByLevel?.[castLevel] ?? spell?.cost ?? ({ 1: 2, 2: 3, 3: 5, 4: 6, 5: 7, 6: 9, 7: 10, 8: 11, 9: 13 }[castLevel] ?? 2);
}

function spellAvailableCastLevels(fighter, spell) {
  if (!spell) return [];
  if (spellBaseLevel(spell) === 0) return [0];
  const maxSpellLevel = maxSpellLevelForFighter(fighter);
  const levels = [];
  for (let level = spellBaseLevel(spell); level <= maxSpellLevel; level += 1) levels.push(level);
  return levels;
}

function spellWithCastLevel(spell, castLevel = spellBaseLevel(spell)) {
  return { ...spell, castLevel: Math.max(spellBaseLevel(spell), Math.min(9, Number(castLevel ?? spellBaseLevel(spell)))) };
}

function spellResourceLabel(spell) {
  if (spell?.resource === "bonusAction") return "Quick action";
  if (spell?.resource === "reaction") return "Reaction";
  if (spell?.resource === "weaponRider") return "Weapon rider";
  return "Action";
}

function concentrationId(caster) {
  return caster?.id ? `concentration-${caster.id}` : "";
}

function endConcentration(caster, reason = "") {
  if (!caster?.concentration) return;
  const id = caster.concentration.id;
  const spellName = caster.concentration.spellName;
  for (const fighter of Object.values(state.fighters ?? {})) {
    fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => effect.concentrationId !== id);
    refreshDerivedStats(fighter);
  }
  state.spellAreas = (state.spellAreas ?? []).filter((area) => area.concentrationId !== id);
  caster.concentration = null;
  addLog(`${caster.name}'s concentration on ${spellName} ends${reason ? ` (${reason})` : ""}.`, "important");
}

function startConcentration(caster, spell) {
  if (!spell?.concentration) return;
  endConcentration(caster, "new concentration spell");
  caster.concentration = { id: concentrationId(caster), spellId: spell.id, spellName: spell.name };
  addLog(`${caster.name} concentrates on ${spell.name}.`, "important");
}

function canPaySpellCost(caster, spell) {
  if (spellBaseLevel(spell) === 0) return true;
  ensureSpellPointState(caster);
  return (caster.spellPoints ?? 0) >= spellPointCost(spell);
}

function canCastSpell(caster, spell) {
  if (!heroCanAct(caster) || !spell || !canPaySpellCost(caster, spell)) return false;
  if (state.mode === "combat") {
    if (spell.resource === "reaction") return Boolean(caster.hasReaction);
    if (activeFighter()?.id !== caster.id) return false;
    if (["bonusAction", "weaponRider"].includes(spell.resource)) return Boolean(caster.hasBonusAction);
    return Boolean(caster.hasAction);
  }
  return true;
}

function spendSpellResources(caster, spell) {
  if (spell.concentration) startConcentration(caster, spell);
  const cost = spellPointCost(spell);
  if (cost > 0) {
    caster.spellPoints = Math.max(0, (caster.spellPoints ?? 0) - cost);
    addLog(`${caster.name} spends ${cost} SP on ${spell.name} (spell level ${spellCastLevel(spell)}).`, "important");
  }
  if (state.mode === "combat") {
    if (spell.resource === "reaction") caster.hasReaction = false;
    else if (["bonusAction", "weaponRider"].includes(spell.resource)) caster.hasBonusAction = false;
    else caster.hasAction = false;
  }
}

function spellRangeSquares(spell) {
  return Math.max(1, Math.floor((spell.range?.feet ?? 5) / feetPerSquare));
}

function spellAreaSquares(spell) {
  const extraFeet = Math.max(0, spellCastLevel(spell) - spellBaseLevel(spell)) * (spell.upcast?.areaRadiusFeetPerLevel ?? 0);
  return Math.max(0, Math.floor(((spell.area?.radiusFeet ?? 0) + extraFeet) / feetPerSquare));
}

function spellCanTargetPoint(spell) {
  return spell?.target === "point" || (spell?.area && spell?.range?.kind === "ranged" && spell?.effect?.kind !== "healing");
}

function spellTargetingMode(spell) {
  if (spell.target === "direction" || ["breath", "cone"].includes(spell.area?.shape)) return "direction";
  if (spellCanTargetPoint(spell)) return "point";
  return "target";
}

function spellTargetCount(spell) {
  const baseTargets = { bless: 3, bane: 3, aid: 3, "mass-healing-word": 6 };
  const base = baseTargets[spell?.id] ?? 1;
  return base + Math.max(0, spellCastLevel(spell) - spellBaseLevel(spell)) * (spell?.upcast?.targetsPerLevel ?? 0);
}

function currentPendingSpellTargeting() {
  if (!pendingSpellTargeting) return null;
  const caster = state.fighters[pendingSpellTargeting.casterId];
  const spell = getContentDefinition("spells", pendingSpellTargeting.spellId);
  const castSpell = spell ? spellWithCastLevel(spell, pendingSpellTargeting.castLevel) : null;
  if (!caster || !castSpell || !canCastSpell(caster, castSpell)) {
    pendingSpellTargeting = null;
    return null;
  }
  return { ...pendingSpellTargeting, caster, spell: castSpell };
}

function clearPendingSpellTargeting() {
  if (!pendingSpellTargeting) return;
  pendingSpellTargeting = null;
  pendingMultiTargetSpell = null;
  renderRoom();
}

function fighterAtPosition(position) {
  if (!position) return null;
  return Object.values(state.fighters).find(
    (fighter) => fighter.alive && !fighter.dead && fighter.position.x === position.x && fighter.position.y === position.y,
  ) ?? null;
}

function spellTargetsFor(caster, spell) {
  const range = spellRangeSquares(spell);
  if (spell.target === "self") {
    return caster?.alive ? [caster] : [];
  }
  if (spell.target === "ally") {
    if (spell.id === "spare-the-dying") {
      return partyHeroes().filter((hero) => !hero.dead && distance(caster.position, hero.position) <= range);
    }
    return partyHeroes().filter((hero) => hero.alive && distance(caster.position, hero.position) <= range);
  }
  if (spell.target === "enemy") {
    return visibleMonsters().filter((monster) => monster.alive && distance(caster.position, monster.position) <= range && hasClearLineOfSight(caster.position, monster.position));
  }
  if (spell.target === "creature") {
    return Object.values(state.fighters).filter(
      (fighter) => fighter.alive && !fighter.dead && isKnownTile(fighter.position) && distance(caster.position, fighter.position) <= range && hasClearLineOfSight(caster.position, fighter.position),
    );
  }
  if (spell.target === "point") {
    return visibleMonsters().filter((monster) => monster.alive && distance(caster.position, monster.position) <= range && hasClearLineOfSight(caster.position, monster.position));
  }
  return [];
}

function isValidSpellTarget(caster, spell, target) {
  if (!caster || !spell || target?.dead) return false;
  if (spell.id !== "spare-the-dying" && !target?.alive) return false;
  return spellTargetsFor(caster, spell).some((entry) => entry.id === target.id);
}

function isValidSpellPointTarget(caster, spell, position) {
  if (!caster || !spell || !position) return false;
  const key = positionKey(position);
  if (!window.DungeonGrid.isInsideGrid(position, currentGridSize())) return false;
  if (!isKnownTile(position) || !currentWalkable().has(key)) return false;
  if (distance(caster.position, position) > spellRangeSquares(spell)) return false;
  if (!hasClearLineOfSight(caster.position, position)) return false;
  const casterRoom = roomForPosition(caster.position);
  const targetRoom = roomForPosition(position);
  return !casterRoom || targetRoom?.id === casterRoom.id;
}

function spellAreaCells(originPosition, spell) {
  if (!originPosition) return [];
  if (!spell.area) return [{ ...originPosition }];
  const radius = spellAreaSquares(spell);
  const cells = [];
  const walkable = currentWalkable();
  const grid = currentGridSize();
  for (let y = originPosition.y - radius; y <= originPosition.y + radius; y += 1) {
    for (let x = originPosition.x - radius; x <= originPosition.x + radius; x += 1) {
      const cell = { x, y };
      if (!window.DungeonGrid.isInsideGrid(cell, grid) || !walkable.has(positionKey(cell))) continue;
      if (spell.area.shape === "cube") {
        if (Math.abs(x - originPosition.x) <= radius && Math.abs(y - originPosition.y) <= radius) cells.push(cell);
      } else if (distance(cell, originPosition) <= radius) {
        cells.push(cell);
      }
    }
  }
  return cells;
}

function spellTargetsFromCells(cells) {
  const keys = new Set(cells.map(positionKey));
  return Object.values(state.fighters).filter((fighter) => fighter.alive && !fighter.dead && keys.has(positionKey(fighter.position)));
}

function areaTargetsForSpell(origin, spell, caster) {
  const originPosition = origin?.position ?? origin;
  const targets = spell.area ? spellTargetsFromCells(spellAreaCells(originPosition, spell)) : spellTargetsFromCells([originPosition]);
  return targets.filter((target) => spellAffectsFighter(caster, spell, target));
}

function persistentAreaSpellIds() {
  return new Set(["moonbeam", "spike-growth", "fog-cloud", "silence", "darkness", "hunger-of-hadar"]);
}

function ensureSpellAreas() {
  state.spellAreas = Array.isArray(state.spellAreas) ? state.spellAreas : [];
  return state.spellAreas;
}

function createPersistentSpellArea(caster, spell, position) {
  if (!persistentAreaSpellIds().has(spell?.id) || !position) return;
  const durationRounds = spell.duration?.rounds ?? spell.effect?.status?.durationRounds ?? 3;
  const area = {
    id: `${spell.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    spellId: spell.id,
    spellName: spell.name,
    casterId: caster.id,
    concentrationId: spell.concentration ? concentrationId(caster) : null,
    position: { ...position },
    castLevel: spellCastLevel(spell),
    durationRounds,
  };
  ensureSpellAreas().push(area);
  addLog(`${spell.name} persists in the area for ${durationRounds} rounds.`, "important");
}

function persistentAreaCells(area) {
  const spell = getContentDefinition("spells", area.spellId);
  if (!spell) return [];
  return spellAreaCells(area.position, { ...spell, castLevel: area.castLevel });
}

function persistentAreaTileKeys() {
  const keys = new Set();
  for (const area of ensureSpellAreas()) {
    for (const cell of persistentAreaCells(area)) keys.add(positionKey(cell));
  }
  return keys;
}

function agePersistentSpellAreasForCaster(caster) {
  if (!caster?.id || !state?.spellAreas?.length) return;
  const expired = [];
  state.spellAreas = state.spellAreas
    .map((area) => (area.casterId === caster.id ? { ...area, durationRounds: (area.durationRounds ?? 1) - 1 } : area))
    .filter((area) => {
      const keep = (area.durationRounds ?? 0) > 0;
      if (!keep) expired.push(area.spellName ?? area.spellId);
      return keep;
    });
  for (const name of expired) addLog(`${name} fades from the battlefield.`);
}

async function applyPersistentSpellAreasAtTurnStart(fighter) {
  if (!fighter?.alive || fighter.dead) return;
  for (const area of [...ensureSpellAreas()]) {
    const caster = state.fighters?.[area.casterId];
    const spell = getContentDefinition("spells", area.spellId);
    if (!caster || !spell || !persistentAreaCells(area).some((cell) => positionKey(cell) === positionKey(fighter.position))) continue;
    if (!spellAffectsFighter(caster, spell, fighter)) continue;
    const castSpell = { ...spell, castLevel: area.castLevel, casterLevel: caster.level ?? 1 };
    addLog(`${fighter.name} starts their turn in ${area.spellName}.`, "important");
    if (spell.effect?.kind === "damage") await applySpellDamage(caster, fighter, castSpell);
    if (spell.effect?.kind === "status") await applySpellStatus(caster, fighter, castSpell);
    if (!fighter.alive && isPartyHeroId(fighter.id)) handleHeroDeath();
  }
  await applySpiritGuardiansAtTurnStart(fighter);
}

async function applySpiritGuardiansAtTurnStart(fighter) {
  if (!fighter?.alive || fighter.dead) return;
  for (const caster of Object.values(state.fighters ?? {})) {
    const guardian = (caster.statusEffects ?? []).find((effect) => effect.id === "spirit-guardians" && effect.aura);
    if (!guardian || !hostileTo(caster, fighter) || distance(caster.position, fighter.position) > Math.floor((guardian.aura.radiusFeet ?? 15) / feetPerSquare)) continue;
    const save = await rollSavingThrow(fighter, guardian.aura.save ?? "wis", spellSaveDc(caster), `${caster.name}'s Spirit Guardians batter ${fighter.name}.`);
    const roll = rollDice(guardian.aura.damage?.count ?? 3, guardian.aura.damage?.sides ?? 8);
    const raw = save.success ? Math.floor(roll.total / 2) : roll.total;
    applySpecialDamage(caster, fighter, Math.max(1, raw), guardian.aura.damage?.type ?? "radiant", "Spirit Guardians");
    if (!fighter.alive && isPartyHeroId(fighter.id)) handleHeroDeath();
  }
}

function spellAffectsFighter(caster, spell, target) {
  if (!caster || !spell || !target?.alive || target.dead) return false;
  if (spell.target === "ally" || spell.effect?.kind === "healing") return isPartyHeroId(target.id);
  if (spell.target === "self") return target.id === caster.id;
  if (["damage", "attackDamage", "status"].includes(spell.effect?.kind)) return hostileTo(caster, target);
  return true;
}

function directionFromCasterToPosition(caster, position) {
  if (!caster || !position) return null;
  const dx = position.x - caster.position.x;
  const dy = position.y - caster.position.y;
  if (dx === 0 && dy === 0) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "east" : "west";
  return dy > 0 ? "south" : "north";
}

function spellDirectionCells(caster, direction, spell) {
  if (!caster || !direction) return [];
  const length = Math.max(1, Math.floor((spell.area?.lengthFeet ?? spell.range?.feet ?? 15) / feetPerSquare));
  const width = Math.max(1, Math.floor((spell.area?.widthFeet ?? 5) / feetPerSquare));
  const deltas = {
    north: { x: 0, y: -1 },
    east: { x: 1, y: 0 },
    south: { x: 0, y: 1 },
    west: { x: -1, y: 0 },
  };
  const delta = deltas[direction] ?? deltas.north;
  const cells = [];
  for (const tileKey of currentWalkable()) {
    const cell = positionFromKey(tileKey);
    const dx = cell.x - caster.position.x;
    const dy = cell.y - caster.position.y;
    const forward = delta.x ? dx * delta.x : dy * delta.y;
    const side = delta.x ? Math.abs(dy) : Math.abs(dx);
    if (forward <= 0 || forward > length) continue;
    if (spell.area?.shape === "cone") {
      if (side <= forward) cells.push(cell);
    } else if (side < width) {
      cells.push(cell);
    }
  }
  return cells;
}

function spellPreviewCells(targeting = currentPendingSpellTargeting()) {
  if (!targeting?.hoverPosition) return new Set();
  if (targeting.mode === "point") {
    if (!isValidSpellPointTarget(targeting.caster, targeting.spell, targeting.hoverPosition)) return new Set();
    return new Set(spellAreaCells(targeting.hoverPosition, targeting.spell).map(positionKey));
  }
  if (targeting.mode === "direction") {
    const direction = directionFromCasterToPosition(targeting.caster, targeting.hoverPosition);
    return new Set(spellDirectionCells(targeting.caster, direction, targeting.spell).map(positionKey));
  }
  const target = fighterAtPosition(targeting.hoverPosition);
  if (!isValidSpellTarget(targeting.caster, targeting.spell, target)) return new Set();
  return new Set((targeting.spell.area ? spellAreaCells(target.position, targeting.spell) : [target.position]).map(positionKey));
}

function hoverSpellTarget(position) {
  if (!currentPendingSpellTargeting()) return;
  pendingSpellTargeting.hoverPosition = position ? { ...position } : null;
  renderRoom();
}

function isSpellTokenTargetable(targeting, fighter) {
  if (!targeting || !fighter?.position) return false;
  if (targeting.mode === "point") return isValidSpellPointTarget(targeting.caster, targeting.spell, fighter.position);
  if (targeting.mode === "direction") return Boolean(directionFromCasterToPosition(targeting.caster, fighter.position));
  return isValidSpellTarget(targeting.caster, targeting.spell, fighter);
}

function startSpellTargeting(caster, spell) {
  const mode = spellTargetingMode(spell);
  const targetCount = mode === "target" ? Math.min(spellTargetCount(spell), spellTargetsFor(caster, spell).length) : 1;
  pendingMultiTargetSpell = targetCount > 1 ? { targetIds: [] } : null;
  pendingSpellTargeting = {
    casterId: caster.id,
    spellId: spell.id,
    castLevel: spellCastLevel(spell),
    mode,
    hoverPosition: mode === "target" ? spellTargetsFor(caster, spell)[0]?.position ?? null : caster.position,
  };
  const instructions = {
    point: "Choose a square for the spell area.",
    direction: "Choose a direction from the caster.",
    target: targetCount > 1 ? `Choose ${targetCount} targets.` : "Choose a creature to center or target the spell.",
  };
  addLog(`${caster.name} readies ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP. ${instructions[mode]}`, "important");
  hideAbilitiesMenu();
  render();
}

async function confirmPendingSpellTarget(position) {
  const targeting = currentPendingSpellTargeting();
  if (!targeting) return false;
  const { caster, spell, mode } = targeting;
  pendingSpellTargeting = null;
  if (mode === "point") {
    if (!isValidSpellPointTarget(caster, spell, position)) {
      pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), mode, hoverPosition: position };
      addLog(`${spell.name} needs a visible square in range inside this room.`, "important");
      render();
      return true;
    }
    await castSpellAtPoint(caster, spell, position);
    return true;
  }
  if (mode === "direction") {
    const direction = directionFromCasterToPosition(caster, position);
    if (!direction) {
      pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), mode, hoverPosition: position };
      render();
      return true;
    }
    await castSpellInDirection(caster, spell, direction);
    return true;
  }
  const target = fighterAtPosition(position);
  if (!isValidSpellTarget(caster, spell, target)) {
    pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), mode, hoverPosition: position };
    addLog(`That is not a valid target for ${spell.name}.`, "important");
    render();
    return true;
  }
  const targetCount = Math.min(spellTargetCount(spell), spellTargetsFor(caster, spell).length);
  if (targetCount > 1) {
    pendingMultiTargetSpell = pendingMultiTargetSpell ?? { targetIds: [] };
    if (!pendingMultiTargetSpell.targetIds.includes(target.id)) pendingMultiTargetSpell.targetIds.push(target.id);
    if (pendingMultiTargetSpell.targetIds.length < targetCount) {
      pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), mode, hoverPosition: position };
      addLog(`${spell.name}: choose target ${pendingMultiTargetSpell.targetIds.length + 1} of ${targetCount}.`, "important");
      render();
      return true;
    }
    const targets = pendingMultiTargetSpell.targetIds.map((id) => state.fighters[id]).filter(Boolean);
    pendingMultiTargetSpell = null;
    await castSpellAtTargets(caster, spell, targets);
    return true;
  }
  await castSpellAtTarget(caster, spell, target);
  return true;
}

function breathTemplateTargets(caster, direction, spell) {
  return spellTargetsFromCells(spellDirectionCells(caster, direction, spell)).filter((fighter) => spellAffectsFighter(caster, spell, fighter));
}

function scaledSpellDice(spell) {
  const dice = { ...(spell.effect?.dice ?? { count: 1, sides: 6 }) };
  if (spellBaseLevel(spell) === 0) {
    const casterLevel = spell.casterLevel ?? 1;
    const multiplier = casterLevel >= 17 ? 4 : casterLevel >= 11 ? 3 : casterLevel >= 5 ? 2 : 1;
    dice.count = (dice.count ?? 1) * multiplier;
    return dice;
  }
  const extraLevels = Math.max(0, spellCastLevel(spell) - spellBaseLevel(spell));
  if (spell.upcast?.diceAtLevel?.[spellCastLevel(spell)]) {
    dice.count = spell.upcast.diceAtLevel[spellCastLevel(spell)];
  } else {
    dice.count = (dice.count ?? 1) + extraLevels * (spell.upcast?.dicePerLevel ?? 0);
  }
  dice.bonus = (dice.bonus ?? 0) + extraLevels * (spell.upcast?.bonusPerLevel ?? 0);
  return dice;
}

async function applySpellDamage(caster, target, spell) {
  const dice = scaledSpellDice(spell);
  const roll = rollDice(dice.count, dice.sides);
  let raw = Math.max(1, roll.total + (dice.bonus ?? 0));
  let save = null;
  if (spell.save) {
    save = await rollSavingThrow(target, spell.save.ability, spellSaveDc(caster), `${caster.name}'s ${spell.name} forces ${target.name} to make a ${spell.save.ability.toUpperCase()} save.`);
    if (save.success && spellBaseLevel(spell) === 0 && !spell.save.halfDamage) {
      addLog(`${target.name} avoids ${spell.name}.`);
      return;
    }
    if (save.success && spell.save.halfDamage) raw = Math.floor(raw / 2);
  }
  applySpecialDamage(caster, target, raw, spell.effect.type ?? "force", spell.name);
  if (spell.effect?.status && (!save || !save.success)) await applySpellStatus(caster, target, spell, { skipSave: true });
}

function applySpellHealing(caster, target, spell) {
  const dice = scaledSpellDice(spell);
  const roll = rollDice(dice.count, dice.sides);
  const bonus = spell.effect?.abilityBonus === "spellcasting" ? abilityMod(caster, spellcastingAbility(caster)) : spell.effect?.bonus ?? 0;
  const healed = applyHealingToHero(target, Math.max(0, roll.total + bonus));
  addLog(`${caster.name}'s ${spell.name} heals ${target.name} for ${healed} HP (${roll.rolls.join(" + ")} ${abilityLabel(bonus)}).`, "heal");
  void maybeFinishEncounterAfterHeroRecovery();
}

async function applySpellAttack(caster, target, spell) {
  const rollResult = rollD20ForFighter(caster);
  const roll = rollResult.roll;
  const bonus = spellAttackBonus(caster);
  const total = roll + bonus;
  const targetAc = armorClass(target);
  addLog(`${caster.name} casts ${spell.name}: spell attack ${roll} ${abilityLabel(bonus)} = ${total} vs AC ${targetAc}.`, "important");
  recordD20OutcomeForFighter(caster, roll !== 1 && total >= targetAc);
  if (roll === 1 || total < targetAc) {
    addLog(`${spell.name} misses ${target.name}.`);
    return;
  }
  const dice = scaledSpellDice(spell);
  const damageRoll = rollDice(dice.count * (roll === 20 ? 2 : 1), dice.sides);
  const extra = spell.effect?.abilityBonus === "spellcasting" ? abilityMod(caster, spellcastingAbility(caster)) : 0;
  applySpecialDamage(caster, target, Math.max(1, damageRoll.total + (dice.bonus ?? 0) + extra), spell.effect?.type ?? "force", spell.name);
  if (spell.effect?.status) await applySpellStatus(caster, target, spell);
}

function eldritchBlastBeamCount(caster) {
  const level = caster?.level ?? 1;
  return level >= 17 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;
}

async function resolveEldritchBlastBeam(caster, target, beamIndex, beamCount) {
  if (!target?.alive || !hostileTo(caster, target) || !isInAttackRangeWithProfile(caster, target, { range: { kind: "ranged", feet: 120 } })) {
    addLog("Choose a visible enemy in range for Eldritch Blast.", "important");
    render();
    return false;
  }
  const rollResult = rollD20ForFighter(caster);
  const roll = rollResult.roll;
  const bonus = spellAttackBonus(caster);
  const total = roll + bonus;
  const targetAc = armorClass(target);
  addLog(`${caster.name}'s Eldritch Blast beam ${beamIndex}/${beamCount}: spell attack ${roll} ${abilityLabel(bonus)} = ${total} vs AC ${targetAc}.`, "important");
  recordD20OutcomeForFighter(caster, roll !== 1 && total >= targetAc);
  if (roll === 1 || total < targetAc) {
    addLog(`Eldritch Blast misses ${target.name}.`);
    return true;
  }
  const damageRoll = rollDice(roll === 20 ? 2 : 1, 10);
  applySpecialDamage(caster, target, Math.max(1, damageRoll.total), "force", "Eldritch Blast");
  if (!target.alive) {
    playSoundEffect("enemyDefeated");
    awardMonsterXp(target);
    dropLootForMonster(target);
    await finishEncounterAfterLastMonsterFalls();
  }
  return true;
}

function startEldritchBlastTargeting(caster) {
  const spell = spellDefinitionsForFighter(caster).find((entry) => entry.id === "eldritch-blast");
  if (!canCastSpell(caster, spell)) return;
  const beamCount = eldritchBlastBeamCount(caster);
  pendingEldritchBlast = { casterId: caster.id, beamsRemaining: beamCount, beamCount };
  addLog(`${caster.name} casts Eldritch Blast. Click target ${beamCount > 1 ? `1 of ${beamCount}` : ""}.`, "important");
  hideAbilitiesMenu();
  render();
}

function cancelPendingEldritchBlast() {
  if (!pendingEldritchBlast) return false;
  pendingEldritchBlast = null;
  addLog("Eldritch Blast targeting cancelled.", "important");
  render();
  return true;
}

async function confirmPendingEldritchBlast(position) {
  if (!pendingEldritchBlast) return false;
  const caster = state.fighters[pendingEldritchBlast.casterId];
  if (!caster?.alive || caster.hp <= 0 || !caster.hasAction) {
    pendingEldritchBlast = null;
    render();
    return false;
  }
  const target = fighterAtPosition(position);
  const beamIndex = pendingEldritchBlast.beamCount - pendingEldritchBlast.beamsRemaining + 1;
  const resolved = await resolveEldritchBlastBeam(caster, target, beamIndex, pendingEldritchBlast.beamCount);
  if (!resolved) return true;
  pendingEldritchBlast.beamsRemaining -= 1;
  if (pendingEldritchBlast.beamsRemaining <= 0 || combatMonsters().length === 0) {
    caster.hasAction = false;
    caster.attacksRemaining = 0;
    pendingEldritchBlast = null;
    addLog(`${caster.name}'s Eldritch Blast is complete.`, "important");
  } else {
    const nextBeam = pendingEldritchBlast.beamCount - pendingEldritchBlast.beamsRemaining + 1;
    addLog(`Click target ${nextBeam} of ${pendingEldritchBlast.beamCount} for Eldritch Blast.`, "important");
  }
  render();
  return true;
}

async function applySpellStatus(caster, target, spell, options = {}) {
  if (spell.save && !options.skipSave) {
    const save = await rollSavingThrow(target, spell.save.ability, spellSaveDc(caster), `${caster.name}'s ${spell.name} forces ${target.name} to make a ${spell.save.ability.toUpperCase()} save.`);
    if (save.success && spell.save.negatesStatus) {
      addLog(`${target.name} resists ${spell.name}.`);
      return;
    }
  }
  const effect = {
    ...(spell.effect?.status ?? {}),
    id: spell.effect?.status?.id ?? spell.id,
    label: spell.effect?.status?.label ?? spell.name,
  };
  if (spell.concentration) effect.concentrationId = concentrationId(caster);
  if (spell.resource === "weaponRider") effect.weaponRider = true;
  if (effect.weaponRider && effect.damageDice) {
    const dice = scaledSpellDice({ ...spell, effect: { dice: effect.damageDice }, casterLevel: caster.level ?? 1 });
    const damageRoll = rollDice(dice.count, dice.sides);
    effect.damageBonus = damageRoll.total + (dice.bonus ?? 0);
  }
  if (effect.weaponRider && spell.upcast?.damageBonusPerLevel) {
    effect.damageBonus = (effect.damageBonus ?? 0) + Math.max(0, spellCastLevel(spell) - spellBaseLevel(spell)) * spell.upcast.damageBonusPerLevel;
  }
  if (effect.id === "spare-the-dying" && isPartyHeroId(target.id) && target.hp <= 0) {
    target.deathSaves = { successes: 3, failures: 0 };
    addLog(`${target.name} is stabilized by ${spell.name}.`, "important");
    await maybeFinishEncounterAfterHeroRecovery();
  }
  if ((target.id?.startsWith("boss-") || target.tags?.includes("boss")) && effect.actionLocked) {
    delete effect.actionLocked;
    effect.speedBonusFeet = Math.min(effect.speedBonusFeet ?? 0, -10);
    effect.label = `${effect.label} Resisted`;
  }
  applyStatusEffect(target, effect);
  addLog(`${caster.name}'s ${spell.name} applies ${effect.label} to ${target.name}.`, "important");
}

async function castSpellAtTarget(caster, spell, target) {
  if (!canCastSpell(caster, spell) || !target) return;
  spell = { ...spell, casterLevel: caster.level ?? 1 };
  spendSpellResources(caster, spell);
  if (spell.effect?.kind === "healing") {
    applySpellHealing(caster, target, spell);
  } else if (spell.effect?.kind === "status") {
    await applySpellStatus(caster, target, spell);
  } else if (spell.effect?.kind === "attackDamage") {
    const wasAlive = target.alive;
    await applySpellAttack(caster, target, spell);
    if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
      if (isPartyHeroId(caster.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(target);
      dropLootForMonster(target);
      await finishEncounterAfterLastMonsterFalls();
    }
  } else if (spell.effect?.kind === "damage") {
    const targets = spell.area ? areaTargetsForSpell(target, spell, caster) : [target];
    addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP${spell.area ? ` at ${target.name}` : ""}.`, "important");
    for (const entry of targets) {
      const wasAlive = entry.alive;
      await applySpellDamage(caster, entry, spell);
      if (!entry.alive && isPartyHeroId(entry.id)) handleHeroDeath();
      if (wasAlive && !entry.alive && !isPartyHeroId(entry.id)) {
        if (isPartyHeroId(caster.id)) playSoundEffect("enemyDefeated");
        awardMonsterXp(entry);
        dropLootForMonster(entry);
      }
    }
    if (isPartyHeroId(caster.id)) await finishEncounterAfterLastMonsterFalls();
  }
  refreshDerivedStats(caster);
  hideAbilitiesMenu();
  render();
}

async function castSpellAtTargets(caster, spell, targets) {
  if (!canCastSpell(caster, spell) || !targets?.length) return;
  spell = { ...spell, casterLevel: caster.level ?? 1 };
  spendSpellResources(caster, spell);
  addLog(`${caster.name} casts ${spell.name} on ${targets.map((target) => target.name).join(", ")}.`, "important");
  for (const target of targets) {
    if (spell.effect?.kind === "healing") {
      applySpellHealing(caster, target, spell);
    } else if (spell.effect?.kind === "status") {
      await applySpellStatus(caster, target, spell);
    } else if (spell.effect?.kind === "damage") {
      const wasAlive = target.alive;
      await applySpellDamage(caster, target, spell);
      if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
        if (isPartyHeroId(caster.id)) playSoundEffect("enemyDefeated");
        awardMonsterXp(target);
        dropLootForMonster(target);
      }
      if (!target.alive && isPartyHeroId(target.id)) handleHeroDeath();
    }
  }
  if (isPartyHeroId(caster.id)) await finishEncounterAfterLastMonsterFalls();
  refreshDerivedStats(caster);
  hideAbilitiesMenu();
  render();
}

async function castSpellAtPoint(caster, spell, position) {
  if (!canCastSpell(caster, spell) || !position) return;
  spell = { ...spell, casterLevel: caster.level ?? 1 };
  if (spell.effect?.kind === "teleport") {
    if (window.DungeonGrid.isOccupied(position, state.fighters, caster)) {
      addLog(`${spell.name} needs an empty destination.`, "important");
      render();
      return;
    }
    spendSpellResources(caster, spell);
    caster.position = { ...position };
    addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP and teleports.`, "important");
    refreshDerivedStats(caster);
    hideAbilitiesMenu();
    render();
    return;
  }
  spendSpellResources(caster, spell);
  createPersistentSpellArea(caster, spell, position);
  const targets = spell.area ? areaTargetsForSpell(position, spell, caster) : spellTargetsFromCells([position]);
  addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP at (${position.x + 1}, ${position.y + 1}).`, "important");
  for (const target of targets) {
    const wasAlive = target.alive;
    if (spell.effect?.kind === "damage") await applySpellDamage(caster, target, spell);
    else if (spell.effect?.kind === "status") await applySpellStatus(caster, target, spell);
    if (!target.alive && isPartyHeroId(target.id)) handleHeroDeath();
    if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
      if (isPartyHeroId(caster.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(target);
      dropLootForMonster(target);
    }
  }
  if (isPartyHeroId(caster.id)) await finishEncounterAfterLastMonsterFalls();
  refreshDerivedStats(caster);
  hideAbilitiesMenu();
  render();
}

async function castSpellInDirection(caster, spell, direction) {
  if (!canCastSpell(caster, spell)) return;
  spell = { ...spell, casterLevel: caster.level ?? 1 };
  spendSpellResources(caster, spell);
  const targets = breathTemplateTargets(caster, direction, spell);
  addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP ${direction}.`, "important");
  for (const target of targets) {
    const wasAlive = target.alive;
    if (spell.effect?.kind === "damage") await applySpellDamage(caster, target, spell);
    else if (spell.effect?.kind === "status") await applySpellStatus(caster, target, spell);
    if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
      if (isPartyHeroId(caster.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(target);
      dropLootForMonster(target);
    }
    if (!target.alive && isPartyHeroId(target.id)) handleHeroDeath();
  }
  if (isPartyHeroId(caster.id)) await finishEncounterAfterLastMonsterFalls();
  hideAbilitiesMenu();
  render();
}

async function chooseAndCastSpell(spellId, castLevel = null) {
  const caster = state.mode === "combat" ? activeFighter() : activeHero();
  const baseSpell = spellDefinitionsForFighter(caster).find((entry) => entry.id === spellId);
  const spell = baseSpell ? spellWithCastLevel(baseSpell, castLevel ?? spellBaseLevel(baseSpell)) : null;
  if (!canCastSpell(caster, spell)) return;
  if (spell?.id === "eldritch-blast") {
    startEldritchBlastTargeting(caster);
    return;
  }
  if (spell?.target === "self") {
    await castSpellAtTarget(caster, spell, caster);
    return;
  }
  if (spellTargetingMode(spell) === "target" && !spellTargetsFor(caster, spell).length) {
    addLog(`No valid target for ${spell.name}.`, "important");
    renderLog();
    return;
  }
  startSpellTargeting(caster, spell);
}

function pushTargetAway(source, target) {
  const dx = Math.sign(target.position.x - source.position.x);
  const dy = Math.sign(target.position.y - source.position.y);
  const destination = { x: target.position.x + dx, y: target.position.y + dy };
  if (!window.DungeonGrid.isInsideGrid(destination, currentGridSize())) return false;
  if (!movementWalkableFor(target).has(positionKey(destination))) return false;
  if (!canTraverseMovementEdge(target, target.position, destination, [])) return false;
  if (window.DungeonGrid.isOccupied(destination, state.fighters, target)) return false;
  target.position = destination;
  return true;
}

async function applyMonsterOnHitSpecials(monster, target, baseDamage, critical) {
  if (!target.alive) return;
  const names = monsterSpecialNames(monster);
  if (!names.length || !shouldUseMonsterSpecial("onHit")) return;
  const normalized = names.join(" | ");
  const dc = monsterSpecialDc(monster);

  if (/venom|poison|sickening|claw fever|deep venom/i.test(normalized)) {
    const save = await rollSavingThrow(target, "con", dc, `${monster.name}'s venom forces ${target.name} to make a CON save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, critical ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "poison", "venom");
      if (/sickening|claw fever/i.test(normalized)) {
        applyStatusEffect(target, { id: "sickened", label: "Sickened", attackBonus: -1, expiresAtEndOfTurn: true });
      }
    }
  }

  if (/crippling|hamstring|web|snare|dragging grasp|drowning grip/i.test(normalized)) {
    const ability = /web|snare/i.test(normalized) ? "dex" : "str";
    const save = await rollSavingThrow(target, ability, dc, `${monster.name}'s restraint forces ${target.name} to make a ${ability.toUpperCase()} save.`);
    if (!save.success) {
      if (/hamstring|crippling/i.test(normalized)) {
        applyStatusEffect(target, { id: "hamstrung", label: "Hamstrung", speedBonusFeet: -10, expiresAtEndOfTurn: true });
        addLog(`${target.name}'s speed is reduced by 10 ft until the end of their next turn.`, "important");
      } else {
        applyStatusEffect(target, { id: "snared", label: "Snared", speedLocked: true, expiresAtEndOfTurn: true });
        addLog(`${target.name}'s movement is stopped until the end of their next turn.`, "important");
      }
    }
  }

  if (/charge|pounce|lunge|rush|swooping|stomp|slam/i.test(normalized) && (monster.lastMoveFeet ?? 0) >= monsterSpecialAbilityTuning.chargeMinFeet) {
    const dice = specialDamageDice(monster, critical ? 8 : 6);
    const roll = rollDice(dice.count, dice.sides);
    applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "bludgeoning", "charge");
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s charge forces ${target.name} to make a STR save.`);
    if (!save.success && pushTargetAway(monster, target)) {
      addLog(`${target.name} is shoved back by ${monster.name}.`, "important");
    }
  }
}

function maybeUseUndeadFortitude(monster, incomingDamage = 0) {
  if (isPartyHeroId(monster?.id) || !hasMonsterSpecial(monster, /undead fortitude/i)) return false;
  if (!shouldUseMonsterSpecial("defensive")) return false;
  const dc = Math.max(10, 5 + incomingDamage);
  const save = savingThrow(monster, "con", dc);
  addLog(`${monster.name} tests Undead Fortitude: CON ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}.`);
  if (!save.success) return false;
  monster.hp = 1;
  monster.alive = true;
  return true;
}

function targetsInMonsterSpecialRange(monster, feet = monsterSpecialAbilityTuning.rangedSpecialFeet) {
  const maxSquares = feet / feetPerSquare;
  return monsterTargetableHeroes().filter((hero) => hero.alive && distance(monster.position, hero.position) <= maxSquares && hasClearLineOfSight(monster.position, hero.position));
}

async function tryMonsterAreaSpecial(monster, namePattern, label, damageType, saveAbility, rangeFeet) {
  if (!hasMonsterSpecial(monster, namePattern) || !monster.hasAction || !shouldUseMonsterSpecial("active")) return false;
  const targets = targetsInMonsterSpecialRange(monster, rangeFeet);
  if (!targets.length) return false;
  monster.hasAction = false;
  const dc = monsterSpecialDc(monster);
  const dice = specialDamageDice(monster, namePattern.test("Fireball") ? 8 : 6);
  addLog(`${monster.name} uses ${label}.`, "important");
  for (const target of targets.slice(0, 3)) {
    const save = await rollSavingThrow(target, saveAbility, dc, `${monster.name}'s ${label} forces ${target.name} to make a ${saveAbility.toUpperCase()} save.`);
    const roll = rollDice(dice.count, dice.sides);
    const raw = Math.max(1, roll.total + dice.bonus);
    const damage = save.success ? Math.floor(raw / 2) : raw;
    if (save.success) addLog(`${target.name} takes half damage from ${label}.`);
    applySpecialDamage(monster, target, damage, damageType, label);
    if (!target.alive) handleHeroDeath();
  }
  return true;
}

async function maybeUseMonsterStartSpecial(monster) {
  if (!monster?.alive || isPartyHeroId(monster.id)) return false;
  monster.usedSpecials = monster.usedSpecials ?? {};

  if (hasMonsterSpecial(monster, /selfheal/i) && !monster.usedSpecials.SelfHeal && monster.hp <= monster.maxHp / 2 && shouldUseMonsterSpecial("defensive")) {
    const heal = rollDice(1, 6).total + monsterCategory(monster);
    monster.hp = Math.min(monster.maxHp, monster.hp + heal);
    monster.usedSpecials.SelfHeal = true;
    addLog(`${monster.name} uses Self Heal and recovers ${heal} HP.`, "heal");
    render();
    return false;
  }

  if (hasMonsterSpecial(monster, /shellguard|thornhide|briarhide|stubborn beast/i) && !monster.usedSpecials.ShellGuard && shouldUseMonsterSpecial("defensive")) {
    applyStatusEffect(monster, { id: "guarded", label: "Guarded", acBonus: monsterSpecialAbilityTuning.shellGuardAcBonus, expiresAtEndOfTurn: true });
    monster.usedSpecials.ShellGuard = true;
    addLog(`${monster.name} braces defensively (+${monsterSpecialAbilityTuning.shellGuardAcBonus} AC this turn).`, "important");
    render();
    return false;
  }

  if (hasMonsterSpecial(monster, /bloodfrenzy/i) && monster.hp <= monster.maxHp / 2) {
    applyStatusEffect(monster, { id: "blood-frenzy", label: "Blood Frenzy", attackBonus: 1, expiresAtEndOfTurn: true });
  }

  if (await tryMonsterAreaSpecial(monster, /fireball/i, "Fireball", "fire", "dex", monsterSpecialAbilityTuning.rangedSpecialFeet)) return true;
  if (await tryMonsterAreaSpecial(monster, /plague breath|bile spray|blight belch|rot burst|rot crown pulse/i, "Plague Breath", "poison", "con", monsterSpecialAbilityTuning.burstRangeFeet)) return true;
  if (await tryMonsterAreaSpecial(monster, /stampede|gravequake|stormhorn burst|root-rending roar|bossroar/i, "Roar", "bludgeoning", "str", monsterSpecialAbilityTuning.burstRangeFeet)) {
    for (const target of monsterTargetableHeroes()) {
      if (distance(monster.position, target.position) <= monsterSpecialAbilityTuning.burstRangeFeet / feetPerSquare) {
        applyStatusEffect(target, { id: "shaken", label: "Shaken", attackBonus: monsterSpecialAbilityTuning.bossRoarAttackPenalty, expiresAtEndOfTurn: true });
      }
    }
    return true;
  }
  if (await tryMonsterAreaSpecial(monster, /web snare|websnare|venom spit|grave spark/i, "Special Shot", /venom/i.test(monsterSpecialNames(monster).join(" ")) ? "poison" : "necrotic", "dex", monsterSpecialAbilityTuning.rangedSpecialFeet)) return true;

  return false;
}

async function endTurn() {
  if (!state.combatStarted || !combatNeedsHeroTurns() || partyDefeatedOrDying()) {
    if (state.combatStarted && combatMonsters().length === 0 && !partyDefeatedOrDying()) await finishEncounterAfterLastMonsterFalls();
    render();
    return;
  }

  expireEndOfTurnEffects(activeFighter());
  do {
    state.activeIndex = (state.activeIndex + 1) % state.initiative.length;
    if (state.activeIndex === 0) {
      state.round += 1;
      addLog(`Round ${state.round} begins.`, "important");
    }
  } while (!activeFighter()?.alive);
  syncActiveHeroToTurn();
  resetTurnResources(activeFighter());
  addTurnStartLog(activeFighter());
  if (isPartyHeroId(activeFighter()?.id) && activeFighter().hp <= 0) {
    await rollDeathSave(activeFighter());
    render();
    if (state.combatStarted && combatNeedsHeroTurns() && !partyDefeatedOrDying()) {
      window.setTimeout(endTurn, tokenSlideMs);
    } else if (state.combatStarted && combatMonsters().length === 0) {
      await finishEncounterAfterLastMonsterFalls();
    }
    return;
  }

  render();
  maybeRunMonsterTurn();
}

function maybeRunMonsterTurn() {
  const fighter = activeFighter();
  if (!fighter || isPartyHeroId(fighter.id) || !fighter.alive || partyDefeatedOrDying()) return;

  els.attack.disabled = true;
  els.useItem.disabled = true;
  els.endTurn.disabled = true;
  window.clearTimeout(monsterTurnTimer);
  const now = performance.now();
  const dueAt = fighter.nextAiDecisionAt ?? 0;
  const delay = Math.max(tokenSlideMs, dueAt - now);
  monsterTurnTimer = window.setTimeout(() => {
    const current = activeFighter();
    if (current && !isPartyHeroId(current.id)) {
      current.nextAiDecisionAt = performance.now() + monsterAiDecisionIntervalMs;
      pathfindingJobsThisTurn = 0;
      perfStats.aiUpdates += 1;
      runMonsterAi(current);
    }
  }, delay);
}

