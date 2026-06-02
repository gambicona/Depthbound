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
  hero.stableAtZero = false;
  resetDeathSaveCounters(hero);
  hero.hasAction = false;
  hero.hasBonusAction = false;
  hero.movementLeft = 0;
}

function fightingPitSafetyActive() {
  return typeof fightingPitCurrentRun === "function" && Boolean(fightingPitCurrentRun());
}

function killHero(hero) {
  if (isPartyHeroId(hero?.id) && fightingPitSafetyActive()) {
    hero.hp = 0;
    hero.alive = true;
    hero.dead = false;
    markFighterStableAtZero(hero);
    addLog(`${hero.name} is pulled back by pit medics before the bout can turn lethal.`, "important");
    if (typeof fightingPitPartyIsDown === "function" && fightingPitPartyIsDown() && typeof endFightingPitRunDefeat === "function") {
      endFightingPitRunDefeat();
    }
    return;
  }
  hero.hp = 0;
  hero.alive = false;
  hero.dead = true;
  hero.stableAtZero = false;
  hero.deathSaves = { successes: 0, failures: 3 };
  ensureHeroCorpseState(hero, { location: "dungeon" });
  dropLootForHero(hero);
  state.party.heroIds = livingPartyHeroIds();
  if (state.party.activeHeroId === hero.id) {
    state.party.activeHeroId = state.party.heroIds[0] ?? state.party.rosterIds.find((id) => state.fighters[id] && !state.fighters[id].dead) ?? "hero";
  }
  addLog(`${hero.name} dies.`, "important");
  handleHeroDeath();
}

function resetDeathSaveCounters(fighter) {
  if (!fighter) return;
  fighter.deathSaves = { successes: 0, failures: 0 };
}

function clearStableAtZero(fighter) {
  if (!fighter) return;
  fighter.stableAtZero = false;
}

function markFighterStableAtZero(fighter) {
  if (!fighter) return;
  fighter.alive = true;
  fighter.stableAtZero = true;
  resetDeathSaveCounters(fighter);
}

function applyDamageToFighter(defender, damage) {
  if (isWildShaped(defender)) {
    const previousBeastHp = defender.hp;
    defender.hp = Math.max(0, defender.hp - damage);
    defender.wildShapeState.beastCurrentHp = defender.hp;
    checkConcentrationAfterDamage(defender, damage);
    if (defender.hp > 0) return;
    const overflowDamage = Math.max(0, damage - previousBeastHp);
    const beast = wildShapeBeastById(defender.wildShapeState.beastFormId);
    addLog(`${defender.name}'s ${beast?.name ?? "beast form"} is broken.`, "important");
    revertWildShape(defender);
    if (overflowDamage > 0) applyDamageToFighter(defender, overflowDamage);
    return;
  }
  const wasDown = isPartyHeroId(defender.id) && defender.hp <= 0;
  const previousHp = defender.hp;
  const temporaryAbsorbed = Math.min(defender.temporaryHp ?? 0, damage);
  defender.temporaryHp = Math.max(0, (defender.temporaryHp ?? 0) - temporaryAbsorbed);
  const hpDamage = Math.max(0, damage - temporaryAbsorbed);
  defender.hp = Math.max(0, defender.hp - hpDamage);
  checkConcentrationAfterDamage(defender, hpDamage);
  if (hpDamage > 0) maybeTriggerDiseaseOnDamage(defender);
  if (!isPartyHeroId(defender.id)) {
    defender.alive = defender.hp > 0;
    return;
  }
  playSoundEffect("characterDamage");
  if (fightingPitSafetyActive() && defender.hp <= 0) {
    defender.hp = 0;
    defender.alive = true;
    defender.dead = false;
    markFighterStableAtZero(defender);
    defender.hasAction = false;
    defender.hasBonusAction = false;
    defender.movementLeft = 0;
    addLog(`${defender.name} drops to 0 HP, but blunted pit weapons and ready medics stabilize them immediately.`, "important");
    if (typeof fightingPitPartyIsDown === "function" && fightingPitPartyIsDown() && typeof endFightingPitRunDefeat === "function") {
      endFightingPitRunDefeat();
    }
    return;
  }
  if (
    defender.hp <= 0 &&
    previousHp > 0 &&
    defender.racialTraits?.relentlessEndurance &&
    !defender.relentlessEnduranceUsed
  ) {
    defender.hp = 1;
    defender.alive = true;
    clearStableAtZero(defender);
    resetDeathSaveCounters(defender);
    defender.relentlessEnduranceUsed = true;
    addLog(`${defender.name}'s Relentless Endurance keeps them standing at 1 HP.`, "important");
    return;
  }
  if (defender.hp > 0) {
    defender.alive = true;
    clearStableAtZero(defender);
    resetDeathSaveCounters(defender);
    return;
  }
  if (
    previousHp > 0 &&
    activeMagicItemByTemplate(defender, barrowCrownItemIds.lastHeirRing) &&
    hasReactionAvailable(defender) &&
    canUseItemPower(defender, itemPowerKey(barrowCrownItemIds.lastHeirRing, "bloodRemembers"))
  ) {
    spendItemPower(defender, itemPowerKey(barrowCrownItemIds.lastHeirRing, "bloodRemembers"), "longRest");
    consumeReaction(defender, "Blood Remembers");
    defender.hp = 1;
    defender.alive = true;
    clearStableAtZero(defender);
    resetDeathSaveCounters(defender);
    addLog(`${defender.name}'s Ring of the Last Heir remembers the bloodline and leaves them at 1 HP.`, "important");
    return;
  }
  if (defender.classId === "barbarian" && (defender.statusEffects ?? []).some((effect) => effect.id === "rage")) {
    if (defender.subclassId === "zealot" && (defender.level ?? 1) >= 14) {
      defender.hp = 1;
      defender.alive = true;
      clearStableAtZero(defender);
      resetDeathSaveCounters(defender);
      addLog(`${defender.name}'s Rage Beyond Death keeps them fighting at 1 HP.`, "important");
      return;
    }
    if ((defender.level ?? 1) >= 11) {
      const dc = defender.relentlessRageDc ?? 10;
      const save = savingThrow(defender, "con", dc);
      defender.relentlessRageDc = dc + 5;
      addLog(`${defender.name}'s Relentless Rage: CON ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}.`, save.success ? "important" : "");
      if (save.success) {
        defender.hp = 1;
        defender.alive = true;
        clearStableAtZero(defender);
        resetDeathSaveCounters(defender);
        addLog(`${defender.name}'s rage keeps them standing at 1 HP.`, "important");
        return;
      }
    }
  }
  const strengthBeforeDeath = fighterAbilityDefinitions(defender).find((ability) => ability.id === "strengthBeforeDeath");
  if (
    defender.subclassId === "samurai" &&
    (defender.level ?? 1) >= 18 &&
    strengthBeforeDeath &&
    (defender.abilityUses?.strengthBeforeDeath ?? 0) < abilityMaxUses(defender, strengthBeforeDeath)
  ) {
    defender.abilityUses.strengthBeforeDeath = (defender.abilityUses.strengthBeforeDeath ?? 0) + 1;
    defender.hp = 1;
    defender.alive = true;
    clearStableAtZero(defender);
    resetDeathSaveCounters(defender);
    addLog(`${defender.name}'s Strength Before Death keeps them standing at 1 HP.`, "important");
    return;
  }
  if (wasDown) {
    clearStableAtZero(defender);
    defender.deathSaves = defender.deathSaves ?? { successes: 0, failures: 0 };
    defender.deathSaves.failures += 1;
    addLog(`${defender.name} takes damage while down: death save failure ${defender.deathSaves.failures}/3.`, "important");
    if (defender.deathSaves.failures >= 3) killHero(defender);
    else handleHeroDeath();
    return;
  }
  downHero(defender);
  addLog(
    partyDefeatedOrDying()
      ? `${defender.name} drops to 0 HP. With no one left standing, the party is defeated.`
      : `${defender.name} drops to 0 HP and starts making death saves.`,
    "important",
  );
  handleHeroDeath();
}

function checkConcentrationAfterDamage(fighter, damage) {
  if (!fighter?.concentration || damage <= 0 || fighter.hp <= 0) return;
  if (isSidekickSpellcaster(fighter) && (fighter.level ?? 1) >= 20) return;
  const dc = Math.max(10, Math.floor(damage / 2));
  const save = savingThrow(fighter, "con", dc);
  if (!save.success && fighterHasFeat(fighter, "war-caster")) {
    const reroll = savingThrow(fighter, "con", dc);
    if (reroll.total > save.total) Object.assign(save, reroll);
    addLog(`${fighter.name}'s War Caster focus rerolls concentration: ${reroll.roll} ${abilityLabel(reroll.bonus)} = ${reroll.total}.`, "important");
  }
  if (warlockKnowsInvocation(fighter, "eldritchMind")) {
    save.total += 5;
    save.success = save.total >= dc;
  }
  addLog(`${fighter.name} makes a concentration save: CON ${save.roll} ${abilityLabel(save.bonus)}${warlockKnowsInvocation(fighter, "eldritchMind") ? " + Eldritch Mind 5" : ""} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
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
  if (heroIsStableAtZero(hero)) {
    addLog(`${hero.name} is stable at 0 HP.`, "important");
    await maybeFinishEncounterAfterHeroRecovery();
    return;
  }
  const roll = await showDeathSaveMenu(hero);
  if (roll === 20) {
    hero.hp = 1;
    hero.alive = true;
    clearStableAtZero(hero);
    resetDeathSaveCounters(hero);
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
    markFighterStableAtZero(hero);
    addLog(`${hero.name} stabilizes.`, "important");
    await maybeFinishEncounterAfterHeroRecovery();
  }
}

function heroCanAct(fighter) {
  return fighter?.alive && !fighter.dead && fighter.hp > 0;
}

function heroIsStableAtZero(hero) {
  return Boolean(hero?.alive && !hero.dead && hero.hp <= 0 && hero.stableAtZero);
}

function heroIsUnstableDying(hero) {
  return Boolean(hero?.alive && !hero.dead && hero.hp <= 0 && !hero.stableAtZero);
}

function partyClassHeroes() {
  return partyHeroes().filter(isClassHero);
}

function unstableDyingPartyHeroes() {
  return partyHeroes().filter(heroIsUnstableDying);
}

function stableUnconsciousPartyHeroes() {
  return partyHeroes().filter(heroIsStableAtZero);
}

function partyDefeatedOrDying() {
  const party = partyHeroes();
  const controlled = party.filter((fighter) => isPlayerControlledPartyFighter(fighter));
  const autonomousCanAct = party.some((fighter) => isAutonomousAlly(fighter) && heroCanAct(fighter));
  if (controlled.length === 0) return !autonomousCanAct;
  if (controlled.some(heroCanAct)) return false;
  return !autonomousCanAct;
}

function addLog(text, type = "") {
  state.log.push({ text, type });
  if (state.log.length > 120) {
    state.log.shift();
  }
}

function addAdminLog(text) {
  if (!adminEnabled?.()) return;
  addLog(`Admin: ${text}`, "admin-log");
}

function d20RollDetail(rollResult) {
  if (!rollResult) return "d20 ?";
  const rolls = rollResult.rolls ?? [rollResult.roll];
  const rawRolls = rollResult.rawRolls ?? rolls;
  const rawChanged = rawRolls.length === rolls.length && rawRolls.some((roll, index) => roll !== rolls[index]);
  if (rawChanged) {
    const label = rollResult.mode === "karmic" ? d20ModeLabels.karmic : "adjusted outcome";
    return `d20 true ${rawRolls.join(" / ")} -> ${label} ${rolls.join(" / ")}${rolls.length > 1 ? ` -> ${rollResult.roll}` : ""}`;
  }
  return rolls.length > 1 ? `d20 true ${rolls.join(" / ")} -> ${rollResult.roll}` : `d20 true ${rolls.join(" / ")}`;
}

function monsterAttackAgainstHero(attacker, defender) {
  return !playerControlledFighter(attacker) && playerControlledFighter(defender);
}

function weaponCriticalThreshold(attacker) {
  if (attacker?.subclassId === "champion") return (attacker.level ?? 1) >= 14 ? 18 : (attacker.level ?? 1) >= 3 ? 19 : 20;
  if (isSidekickWarrior(attacker) && (attacker.level ?? 1) >= 3) return 19;
  return 20;
}

function resolveMonsterHeroCritical(attacker, defender, attackRoll) {
  const criticalThreshold = weaponCriticalThreshold(attacker);
  const criticalHit = attackRoll >= criticalThreshold;
  if (!criticalHit || attackRoll !== 20 || !monsterAttackAgainstHero(attacker, defender)) {
    return { attackRoll, isCritical: criticalHit, doublesDamage: criticalHit, forcedHit: false, note: criticalHit && criticalThreshold < 20 ? "Improved Critical." : "" };
  }
  const mode = normalizeD20Mode(state?.d20Mode);
  if (mode === "karmic" && Math.random() < 0.5) {
    return {
      attackRoll: 19,
      isCritical: false,
      doublesDamage: false,
      forcedHit: true,
      note: `${d20ModeLabels.karmic}: monster natural 20 becomes a natural 19 hit.`,
    };
  }
  if (mode === "tymora") {
    return {
      attackRoll,
      isCritical: true,
      doublesDamage: false,
      forcedHit: false,
      note: `${d20ModeLabels.tymora} prevents the monster critical from doubling damage.`,
    };
  }
  return { attackRoll, isCritical: true, doublesDamage: true, forcedHit: false, note: "" };
}

function addAdminCheckLog({ actor, label, rollResult, bonus = 0, guidance = 0, total, dc, target = "", success = false, note = "" }) {
  const guidanceText = guidance ? ` + Guidance ${guidance}` : "";
  const targetText = target ? ` on ${target}` : "";
  addAdminLog(`${actor?.name ?? "Unknown"} ${label}${targetText}: ${d20RollDetail(rollResult)} ${abilityLabel(bonus)}${guidanceText} = ${total} vs DC ${dc} => ${success ? "success" : "failure"}${note ? `. ${note}` : ""}.`);
}

function stealthState(fighter) {
  return fighter?.stealth && fighter.stealth.active ? fighter.stealth : null;
}

function fighterIsStealthing(fighter) {
  return Boolean(stealthState(fighter));
}

function fighterInvisibleEffects(fighter) {
  return (fighter?.statusEffects ?? []).filter((effect) => effect.id === "invisible" || effect.id === "greater-invisibility" || effect.invisible);
}

function fighterCanSeeInvisible(observer, target = null) {
  const senses = typeof fighterEffectiveSenses === "function" ? fighterEffectiveSenses(observer) : observer?.senses ?? {};
  return Boolean(
    senses.seeInvisible ||
      senses.truesight === true ||
      senses.blindsight === true ||
      (Number(senses.truesight) > 0 && (!target?.position || senseRangeCoversPosition(observer, "truesight", target.position))) ||
      (Number(senses.blindsight) > 0 && (!target?.position || senseRangeCoversPosition(observer, "blindsight", target.position))),
  );
}

function fighterIsInvisibleToMonsters(fighter, observer = null) {
  if (observer && fighterInvisibleEffects(fighter).length && fighterCanSeeInvisible(observer, fighter)) {
    return (fighter?.statusEffects ?? []).some((effect) => effect.ignoredByMonsters && !fighterInvisibleEffects(fighter).includes(effect));
  }
  return Boolean((fighter?.statusEffects ?? []).some((effect) => effect.ignoredByMonsters || effect.id === "invisible"));
}

function monsterCanTargetHero(monster, hero) {
  if (!hero?.alive || hero.dead || (hero.hp ?? 0) <= 0) return false;
  if (fighterIsInvisibleToMonsters(hero, monster)) return false;
  return true;
}

const sightBasedSkillIds = new Set(["perception", "investigation"]);

function senseRangeCoversPosition(fighter, senseId, position) {
  if (!fighter || !position) return false;
  const senses = typeof fighterEffectiveSenses === "function" ? fighterEffectiveSenses(fighter) : fighter.senses ?? {};
  const range = senses[senseId];
  if (range === true) return true;
  const feet = Number(range) || 0;
  if (feet <= 0) return false;
  return distance(fighter.position ?? position, position) * feetPerSquare <= feet;
}

function fighterSeesThroughLightLevel(fighter, lighting, position = fighter?.position) {
  if (!lighting || lighting.level === lightLevels.bright) return true;
  if (lighting.magicalDarkness) return senseRangeCoversPosition(fighter, "truesight", position) || senseRangeCoversPosition(fighter, "blindsight", position);
  return senseRangeCoversPosition(fighter, "truesight", position) || senseRangeCoversPosition(fighter, "blindsight", position) || senseRangeCoversPosition(fighter, "darkvision", position);
}

function fighterCanSeeInLightLevel(fighter, lighting, position = fighter?.position) {
  if (!lighting || lighting.level === lightLevels.bright || lighting.level === lightLevels.dim) return true;
  if (lighting.magicalDarkness) return senseRangeCoversPosition(fighter, "truesight", position) || senseRangeCoversPosition(fighter, "blindsight", position);
  return senseRangeCoversPosition(fighter, "truesight", position) || senseRangeCoversPosition(fighter, "blindsight", position) || senseRangeCoversPosition(fighter, "darkvision", position);
}

function canSeeFighter(observer, target, options = {}) {
  if (!observer || !target || !observer.alive || observer.dead || !target.alive || target.dead) return false;
  if (observer.id === target.id && options.allowSelf !== false) return true;
  if (options.requireLineOfSight !== false && !hasClearLineOfSightBetweenFighters(observer, target)) return false;
  if (fighterInvisibleEffects(target).length && !fighterCanSeeInvisible(observer, target)) return false;

  const lightingMap = options.lightingMap ?? (typeof currentLightingMap === "function" ? currentLightingMap() : null);
  const targetCells = typeof window.DungeonGrid?.fighterCells === "function" ? window.DungeonGrid.fighterCells(target) : [target.position];
  const hasVisibleCell = targetCells.some((cell) => {
    const lighting = lightingAtPosition(cell, lightingMap);
    return fighterCanSeeInLightLevel(observer, lighting, cell);
  });
  if (!hasVisibleCell) return false;

  if (!options.ignoreStealth && fighterIsStealthing(target) && (target.stealth?.total ?? 0) > passivePerception(observer, target.position)) return false;
  return true;
}

function lightingCheckContext(fighter, skillId, position = fighter?.position, options = {}) {
  if (!fighter || !position || !sightBasedSkillIds.has(skillId) || options.sightBased === false || typeof lightingAtPosition !== "function") {
    return { disadvantage: false, passivePenalty: 0, note: "" };
  }
  const notes = [];
  let disadvantage = false;
  let passivePenalty = 0;
  const lighting = lightingAtPosition(position, options.lightingMap);
  if (lighting && !fighterSeesThroughLightLevel(fighter, lighting, position)) {
    const label = lighting.magicalDarkness ? "magical darkness" : lighting.level === lightLevels.dim ? "dim light" : "darkness";
    disadvantage = true;
    passivePenalty -= 5;
    notes.push(`sight impaired by ${label}`);
  }
  if (options.target && fighterInvisibleEffects(options.target).length && !fighterCanSeeInvisible(fighter, options.target)) {
    disadvantage = true;
    passivePenalty -= 5;
    notes.push(`${options.target.name ?? "target"} is invisible`);
  }
  return {
    disadvantage,
    passivePenalty,
    note: notes.join("; "),
    lighting,
  };
}

function attackLightContext(attacker, target, options = {}) {
  if (!attacker || !target || !target.position || typeof lightingAtPosition !== "function") {
    return { disadvantage: false, note: "" };
  }
  const lightingMap = options.lightingMap ?? (typeof currentLightingMap === "function" ? currentLightingMap() : null);
  const targetCells = typeof window.DungeonGrid?.fighterCells === "function" ? window.DungeonGrid.fighterCells(target) : [target.position];
  const visibleCell = targetCells.some((cell) => {
    const lighting = lightingAtPosition(cell, lightingMap);
    if (lighting?.magicalDarkness && typeof warlockKnowsInvocation === "function" && warlockKnowsInvocation(attacker, "devilsSight")) return true;
    return fighterCanSeeInLightLevel(attacker, lighting, cell);
  });
  if (visibleCell) return { disadvantage: false, note: "" };
  const lighting = lightingAtPosition(target.position, lightingMap);
  const label = lighting?.magicalDarkness ? "magical darkness" : "darkness";
  return { disadvantage: true, note: `${target.name ?? "target"} is in ${label}` };
}

function attackLightDisadvantageText(context) {
  return context?.disadvantage ? ` because ${context.note}` : "";
}

function rollSkillCheck(fighter, ability, skillId, options = {}) {
  const lightContext = options.sightBased ? lightingCheckContext(fighter, skillId, options.position ?? fighter?.position, options) : { disadvantage: false, note: "" };
  const rollResult = rollD20ForFighter(fighter, {
    advantage: Boolean(options.advantage),
    disadvantage: Boolean(options.disadvantage || lightContext.disadvantage),
  });
  const roll = options.reliableTalent === false ? rollResult.roll : reliableTalentRoll(fighter, skillId, rollResult.roll);
  const bonus = skillCheckBonus(fighter, ability, skillId);
  const guidance = options.guidance ? guidanceSkillBonus() : 0;
  return {
    fighter,
    rollResult,
    roll,
    bonus,
    guidance,
    lightContext,
    total: roll + bonus + guidance,
  };
}

function passiveSkillScore(fighter, ability, skillId, options = {}) {
  const lightContext = options.sightBased ? lightingCheckContext(fighter, skillId, options.position ?? fighter?.position, options) : { passivePenalty: 0, note: "" };
  return 10 + skillCheckBonus(fighter, ability, skillId) + (lightContext.passivePenalty ?? 0);
}

function lightContextNote(lightContext, prefix = "") {
  return lightContext?.note ? `${prefix}${lightContext.note}` : "";
}

function passivePerception(fighter, position = fighter?.position, options = {}) {
  return passiveSkillScore(fighter, "wis", "perception", { ...options, sightBased: true, position });
}

function activePerceptionCheck(fighter, options = {}) {
  const check = rollSkillCheck(fighter, "wis", "perception", { ...options, sightBased: true, reliableTalent: false });
  return {
    fighter,
    ...check,
  };
}

function stealthCheck(hero) {
  const hasStealthAdvantage = (hero?.statusEffects ?? []).some((effect) => effect.stealthAdvantage);
  const rollResult = rollD20ForFighter(hero, { advantage: hasStealthAdvantage });
  const roll = reliableTalentRoll(hero, "stealth", rollResult.roll);
  const bonus = skillCheckBonus(hero, "dex", "stealth");
  const guidance = guidanceSkillBonus();
  return {
    rollResult,
    roll,
    bonus,
    guidance,
    total: roll + bonus + guidance,
  };
}

function setHeroStealth(hero, check, reason = "stealths") {
  if (!hero) return;
  hero.stealth = {
    active: true,
    total: check.total,
    roll: check.roll,
    bonus: check.bonus,
    guidance: check.guidance ?? 0,
    reason,
  };
}

function clearHeroStealth(hero, reason = "") {
  if (!hero?.stealth) return;
  hero.stealth = { active: false };
  if (reason) addLog(`${hero.name} is no longer stealthing: ${reason}.`, "important");
}

function roomMonstersForHero(hero) {
  const room = roomForPosition(hero?.position);
  return room ? monstersInRoom(room.id) : [];
}

function syncAutonomousAllyStealthWithLeader(leader = activeHero()) {
  if (!leader) return;
  for (const ally of partyHeroes().filter(isAutonomousAlly)) {
    if (followLeaderForAlly(ally, leader)?.id !== leader.id) continue;
    if (fighterIsStealthing(leader)) {
      ally.stealth = { ...leader.stealth, followedHeroId: leader.id, automatic: true };
    } else if (ally.stealth?.automatic && ally.stealth.followedHeroId === leader.id) {
      ally.stealth = { active: false };
    }
  }
}

function beginHeroStealth(hero = activeHero()) {
  if (!gameHasStarted || state.mode !== "exploration" || !heroCanAct(hero) || isAutonomousAlly(hero)) return false;
  if (fighterIsStealthing(hero)) {
    clearHeroStealth(hero, "the stance is dropped");
    syncAutonomousAllyStealthWithLeader(hero);
    render();
    return true;
  }

  const check = stealthCheck(hero);
  setHeroStealth(hero, check, "initial");
  const guidanceText = check.guidance ? ` + Guidance ${check.guidance}` : "";
  addLog(`${hero.name} starts stealthing: DEX Stealth ${check.roll} ${abilityLabel(check.bonus)}${guidanceText} = ${check.total}.`, "important");
  addAdminLog(`${hero.name} initial stealth breakdown: ${d20RollDetail(check.rollResult)} ${abilityLabel(check.bonus)}${guidanceText} = ${check.total}.`);
  recordD20OutcomeForFighter(hero, true);
  syncAutonomousAllyStealthWithLeader(hero);
  const roomMonsters = roomMonstersForHero(hero);
  if (roomMonsters.length && !stealthBeatsPassivePerceptionForRoom(hero, roomMonsters)) {
    revealStealthedHero(hero, roomMonsters, "is noticed while trying to hide");
  }
  render();
  return true;
}

function stealthBeatsPassivePerceptionForRoom(hero, monsters = roomMonstersForHero(hero)) {
  const stealth = stealthState(hero);
  if (!stealth) return false;
  return monsters.every((monster) => stealth.total > passivePerception(monster, hero.position, { target: hero }));
}

function revealStealthedHero(hero, monsters, reason = "is spotted") {
  const watcher = [...monsters].sort((a, b) => passivePerception(b, hero.position, { target: hero }) - passivePerception(a, hero.position, { target: hero }))[0];
  clearHeroStealth(hero);
  syncAutonomousAllyStealthWithLeader(hero);
  if (typeof hideFighterInfo === "function") hideFighterInfo();
  addLog(`${hero.name} ${reason}${watcher ? ` by ${watcher.name}` : ""}. Roll initiative.`, "important");
  if (!initiativePromptOpen) {
    initiativePromptOpen = true;
    void rollInitiative().finally(() => {
      initiativePromptOpen = false;
    });
  }
  render();
}

function checkStealthAgainstPassiveForRooms(hero, rooms = []) {
  if (!fighterIsStealthing(hero)) return true;
  for (const room of rooms) {
    const monsters = monstersInRoom(room.id);
    if (!monsters.length) continue;
    const highestPassive = Math.max(...monsters.map((monster) => passivePerception(monster, hero.position, { target: hero })));
    const success = hero.stealth.total > highestPassive;
    addLog(`${hero.name}'s stealth ${hero.stealth.total} ${success ? "beats" : "fails against"} passive Perception ${highestPassive} in ${room.name}.`, success ? "" : "important");
    if (!success) {
      revealStealthedHero(hero, monsters, "is spotted as the door opens");
      return false;
    }
  }
  return true;
}

function activeStealthCheckInMonsterRoom(hero = activeHero(), reason = "acts", options = {}) {
  if (!fighterIsStealthing(hero) || state.mode !== "exploration") return true;
  const monsters = options.monsters ?? roomMonstersForHero(hero);
  if (!monsters.length) return true;
  const check = stealthCheck(hero);
  setHeroStealth(hero, check, reason);
  const monsterChecks = monsters.map((monster) => activePerceptionCheck(monster, { advantage: options.perceptionAdvantage, position: hero.position, target: hero }));
  const best = monsterChecks.sort((a, b) => b.total - a.total)[0];
  const guidanceText = check.guidance ? ` + Guidance ${check.guidance}` : "";
  const advantageText = options.perceptionAdvantage ? " with advantage" : best?.lightContext?.disadvantage ? " with disadvantage" : "";
  const lightNote = lightContextNote(best?.lightContext, "; ");
  const success = check.total > (best?.total ?? 0);
  addLog(
    `${hero.name} ${reason} while stealthing: Stealth ${check.roll} ${abilityLabel(check.bonus)}${guidanceText} = ${check.total} vs ${best?.fighter?.name ?? "monster"} Perception${advantageText} ${best?.roll ?? "?"} ${abilityLabel(best?.bonus ?? 0)} = ${best?.total ?? "?"}${lightNote}.`,
    success ? "" : "important",
  );
  addAdminCheckLog({ actor: hero, label: "Active stealth check", rollResult: check.rollResult, bonus: check.bonus, guidance: check.guidance, total: check.total, dc: best?.total ?? 0, target: best?.fighter?.name ?? "monsters", success, note: [reason, best?.lightContext?.note].filter(Boolean).join("; ") });
  recordD20OutcomeForFighter(hero, success);
  if (!success) {
    revealStealthedHero(hero, monsters, "is heard");
    return false;
  }
  syncAutonomousAllyStealthWithLeader(hero);
  return true;
}

function adjacentMonstersForStealthProximity(hero, previousPosition = null) {
  if (!fighterIsStealthing(hero) || state.mode !== "exploration") return [];
  return aliveMonsters().filter((monster) => {
    if (!window.DungeonGrid.fighterCells(monster).some(isKnownTile) || attackGridDistanceBetweenFighters(hero, monster) > 1) return false;
    return !previousPosition || attackGridDistanceBetweenFighters({ ...hero, position: previousPosition }, monster) > 1;
  });
}

function checkStealthProximity(hero, previousPosition = null) {
  const monsters = adjacentMonstersForStealthProximity(hero, previousPosition);
  if (!monsters.length) return true;
  return activeStealthCheckInMonsterRoom(hero, "moves within 5 ft of a monster", {
    monsters,
    perceptionAdvantage: true,
  });
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
  void applyActivePoisonsAtTurnStart(fighter);
  fighter.lastMoveFeet = 0;
  for (const ability of fighterAbilityDefinitions(fighter).filter((entry) => entry.refresh === "turn")) {
    fighter.abilityUses = { ...(fighter.abilityUses ?? {}), [ability.id]: 0 };
  }
  fighter.itemPowerUses = Object.fromEntries(Object.entries(fighter.itemPowerUses ?? {}).filter(([, entry]) => entry?.refresh !== "turn"));
  refreshDerivedStats(fighter);
  maybeUseGravebreakersLanternFlare(fighter);
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
  fighter.blessedStrikeUsedThisTurn = false;
  fighter.zealotDivineFuryUsedThisTurn = false;
  fighter.beastFormHitThisTurn = false;
  fighter.beastClawExtraUsedThisTurn = false;
  fighter.mobileNoOpportunityFrom = [];
  fighter.hasBonusAction = !actionLocked;
  fighter.hasReaction = !actionLocked;
  fighter.dodging = false;
  fighter.disengaged = false;
  fighter.canMoveThroughMonsters = false;
  standUpFromProneAtTurnStart(fighter);
  void applyPersistentSpellAreasAtTurnStart(fighter);
  if (fighter.subclassId === "champion" && (fighter.level ?? 1) >= 18 && fighter.hp > 0 && fighter.hp <= Math.floor((fighter.maxHp ?? 1) / 2)) {
    const healed = Math.min((fighter.maxHp ?? 1) - fighter.hp, Math.max(1, 5 + abilityMod(fighter, "con")));
    fighter.hp += healed;
    addLog(`${fighter.name}'s Survivor restores ${healed} HP.`, "heal");
  }
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

const barrowCrownItemIds = {
  gravebreakersLantern: "magic-undead-barrowcrown-gravebreakers-lantern",
  drownedLegionShield: "magic-undead-barrowcrown-shield-drowned-legion",
  blackMarketCoin: "magic-undead-barrowcrown-black-market-coin",
  bellRingersMaul: "magic-undead-barrowcrown-bell-ringers-maul",
  bellRingersWarhammer: "magic-undead-barrowcrown-bell-ringers-warhammer",
  lastHeirRing: "magic-undead-barrowcrown-ring-last-heir",
  crownshardShortsword: "magic-undead-barrowcrown-crownshard-shortsword",
  crownshardLongsword: "magic-undead-barrowcrown-crownshard-longsword",
  crownshardGreatsword: "magic-undead-barrowcrown-crownshard-greatsword",
};

function activeItemMatchesTemplate(item, templateId) {
  return Boolean(item && [item.id, item.baseItemId, item.itemId, item.baseEquipmentId].includes(templateId));
}

function activeMagicItemByTemplate(fighter, templateId) {
  return equippedMagicItems(fighter).find((item) => activeItemMatchesTemplate(item, templateId)) ?? null;
}

function activeMagicItemByTemplates(fighter, templateIds = []) {
  return templateIds.map((id) => activeMagicItemByTemplate(fighter, id)).find(Boolean) ?? null;
}

function activeWeaponMatchesTemplate(fighter, weapon, templateIds = []) {
  if (!weapon || !activeItemMagic(fighter, weapon)) return false;
  return templateIds.some((id) => activeItemMatchesTemplate(weapon, id));
}

function itemPowerKey(templateId, power) {
  return `${templateId}:${power}`;
}

function itemPowerUseCount(fighter, key) {
  const entry = fighter?.itemPowerUses?.[key];
  return typeof entry === "number" ? entry : entry?.count ?? 0;
}

function canUseItemPower(fighter, key, max = 1) {
  return itemPowerUseCount(fighter, key) < max;
}

function spendItemPower(fighter, key, refresh = "longRest") {
  fighter.itemPowerUses = { ...(fighter.itemPowerUses ?? {}) };
  const entry = fighter.itemPowerUses[key];
  const count = typeof entry === "number" ? entry : entry?.count ?? 0;
  fighter.itemPowerUses[key] = { count: count + 1, refresh };
}

function maybeUseGravebreakersLanternFlare(fighter) {
  if (!fighter?.alive || isPartyHeroId(fighter.id) || fighter.team === "heroes" || fighter.friendly || !monsterIsUndead(fighter)) return;
  const holder = partyHeroes().find((hero) => {
    const key = itemPowerKey(barrowCrownItemIds.gravebreakersLantern, "graveFlare");
    return heroCanAct(hero) &&
      activeMagicItemByTemplate(hero, barrowCrownItemIds.gravebreakersLantern) &&
      canUseItemPower(hero, key) &&
      fightersWithinSquares(hero, fighter, 4) &&
      hasClearLineOfSightBetweenFighters(hero, fighter);
  });
  if (!holder) return;
  const key = itemPowerKey(barrowCrownItemIds.gravebreakersLantern, "graveFlare");
  spendItemPower(holder, key, "longRest");
  const save = savingThrow(fighter, "wis", 13, { source: holder, label: "Grave-Flare" });
  addLog(`${holder.name}'s Gravebreaker's Lantern flares as ${fighter.name}'s turn begins. ${fighter.name} rolls WIS ${save.total} vs DC 13.`, "important");
  if (!save.success) {
    applyStatusEffect(fighter, { id: "frightened", label: "Frightened", attackBonus: -2, expiresAtEndOfTurn: true });
    addLog(`${fighter.name} is frightened by the pale grave-flare.`, "important");
  }
}

function fighterKnowsSpell(fighter, spellId) {
  const canonical = canonicalSpellId(spellId);
  return (fighter?.spells ?? []).some((knownId) => canonicalSpellId(knownId) === canonical);
}

function fighterIsRaging(fighter) {
  return Boolean((fighter?.statusEffects ?? []).some((effect) => effect.id === "rage"));
}

function equippedSpellScrollForSpell(fighter, spellId) {
  const canonical = canonicalSpellId(spellId);
  return (fighter?.inventory?.items ?? []).find((item) => {
    const itemSpellId = item?.use?.spellId ?? item?.scroll?.spellId;
    return item?.use?.kind === "spellScroll" &&
      canonicalSpellId(itemSpellId) === canonical &&
      Object.values(fighter?.equipment ?? {}).includes(item.id);
  }) ?? null;
}

function spellForScrollItem(item) {
  const spellId = canonicalSpellId(item?.use?.spellId ?? item?.scroll?.spellId);
  const spell = spellId ? getContentDefinition("spells", spellId) : null;
  if (!spell || spellId === "guidance") return null;
  return {
    ...spellWithCastLevel(spell, item?.use?.castLevel ?? spellBaseLevel(spell)),
    castFromScroll: true,
    scrollItemId: item.id,
    scrollTemplateId: item.baseItemId ?? item.itemId ?? item.id,
  };
}

function reactionSpellSource(fighter, spellId) {
  const spell = getContentDefinition("spells", spellId);
  if (!spell || spell.resource !== "reaction" || !hasReactionAvailable(fighter)) return null;
  if (fighterKnowsSpell(fighter, spellId) && canPaySpellCost(fighter, spell)) {
    return { spell: { ...spell, casterLevel: fighter.level ?? 1 }, item: null };
  }
  if (fighter?.classId === "barbarian" && fighterIsRaging(fighter)) return null;
  const scroll = equippedSpellScrollForSpell(fighter, spellId);
  const scrollSpell = scroll ? spellForScrollItem(scroll) : null;
  return scrollSpell ? { spell: { ...scrollSpell, casterLevel: fighter.level ?? 1 }, item: scroll } : null;
}

function canUseReactionSpell(fighter, spellId) {
  return Boolean(reactionSpellSource(fighter, spellId));
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
  return { totalAttack: totalAttack + roll, used: true, roll };
}

async function maybeUseBendLuckAttack(attacker, totalAttack, defenderAc) {
  if (!isPartyHeroId(attacker?.id) || totalAttack >= defenderAc || totalAttack + 3 < defenderAc) return { totalAttack, used: false };
  const candidate = partyHeroes().find((hero) => {
    const ability = reactionAbility(hero, "bendLuck");
    return hero.id !== attacker.id && heroCanAct(hero) && hasReactionAvailable(hero) && canSpendCombatAbility(hero, ability) && fightersWithinSquares(hero, attacker, 12);
  });
  if (!candidate) return { totalAttack, used: false };
  const useLuck = await showReactionPrompt({
    actor: candidate,
    title: "Bend Luck",
    message: `${attacker.name} missed by ${defenderAc - totalAttack}. Spend sorcery to bend luck by +3?`,
    acceptLabel: "Bend Luck",
    declineLabel: "Save It",
  });
  const ability = reactionAbility(candidate, "bendLuck");
  if (!useLuck || !consumeReaction(candidate, "Bend Luck") || !canSpendCombatAbility(candidate, ability)) return { totalAttack, used: false };
  spendCombatAbilityUse(candidate, ability);
  addLog(`${candidate.name}'s Bend Luck adds +3 to ${attacker.name}'s attack.`, "important");
  return { totalAttack: totalAttack + 3, used: true };
}

async function maybeUseShieldReaction(defender, attacker, totalAttack, defenderAc) {
  const source = reactionSpellSource(defender, "shield");
  if (!isPartyHeroId(defender?.id) || totalAttack < defenderAc || totalAttack >= defenderAc + 5 || !source) return false;
  const useShield = await showReactionPrompt({
    actor: defender,
    title: "Shield",
    message: `${attacker.name}'s attack would hit AC ${defenderAc}. Cast Shield to raise AC by 5 and block it?`,
    acceptLabel: source.item ? "Read Scroll" : "Cast Shield",
  });
  if (!useShield) return false;
  const spell = source.spell;
  spendSpellResources(defender, spell);
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

function canUseStoneEndurance(defender, damage) {
  const ability = fighterAbilityDefinitions(defender).find((entry) => entry.id === "goliathStoneEndurance");
  return Boolean(
    isPartyHeroId(defender?.id) &&
      ability &&
      damage > 0 &&
      hasReactionAvailable(defender) &&
      (defender.abilityUses?.[ability.id] ?? 0) < abilityMaxUses(defender, ability),
  );
}

async function maybeUseStoneEndurance(defender, damage) {
  if (!canUseStoneEndurance(defender, damage)) return damage;
  const useEndurance = await showReactionPrompt({
    actor: defender,
    title: "Stone's Endurance",
    message: `${defender.name} would take ${damage} damage. Roll 1d12 + CON to reduce it?`,
    acceptLabel: "Reduce Damage",
    declineLabel: "Take Hit",
  });
  if (!useEndurance || !consumeReaction(defender, "Stone's Endurance")) return damage;
  const roll = rollDice(1, 12);
  const reduction = Math.max(0, roll.total + abilityMod(defender, "con"));
  defender.abilityUses = { ...(defender.abilityUses ?? {}), goliathStoneEndurance: (defender.abilityUses?.goliathStoneEndurance ?? 0) + 1 };
  const reduced = Math.max(0, damage - reduction);
  addLog(`${defender.name}'s Stone's Endurance reduces damage by ${reduction} (${roll.rolls[0]} ${abilityLabel(abilityMod(defender, "con"))}).`, "important");
  return reduced;
}

function abilityResourceSpentForCombat(fighter, ability) {
  if (!ability?.resourcePool) return fighter?.abilityUses?.[ability?.id] ?? 0;
  return fighterAbilityDefinitions(fighter)
    .filter((entry) => entry.resourcePool === ability.resourcePool)
    .reduce((sum, entry) => sum + (fighter?.abilityUses?.[entry.id] ?? 0), 0);
}

function canSpendCombatAbility(fighter, ability) {
  return Boolean(ability && (fighter.level ?? 1) >= (ability.level ?? 1) && abilityResourceSpentForCombat(fighter, ability) < abilityMaxUses(fighter, ability));
}

function spendCombatAbilityUse(fighter, ability) {
  fighter.abilityUses = { ...(fighter.abilityUses ?? {}) };
  fighter.abilityUses[ability.id] = (fighter.abilityUses[ability.id] ?? 0) + 1;
}

function reactionAbility(fighter, id) {
  return fighterAbilityDefinitions(fighter).find((entry) => entry.id === id);
}

function reactionCandidates(id, target, rangeSquares = 12, includeTarget = true) {
  return partyHeroes().filter((hero) => {
    if (!heroCanAct(hero) || !hasReactionAvailable(hero)) return false;
    if (!includeTarget && hero.id === target.id) return false;
    const ability = reactionAbility(hero, id);
    return canSpendCombatAbility(hero, ability) && fightersWithinSquares(hero, target, rangeSquares);
  });
}

function reactionWeaponAttackDamage(attacker, defender, label, extraDamage = 0, extraType = null) {
  if (!attacker?.alive || !defender?.alive || !hasMeleeAccess(attacker, defender)) return false;
  const profile = opportunityAttackProfile(attacker);
  const lightContext = attackLightContext(attacker, defender);
  const attackRollResult = rollD20ForFighter(attacker, { disadvantage: lightContext.disadvantage });
  const criticalResult = applyMeleeAutoCritical(resolveMonsterHeroCritical(attacker, defender, attackRollResult.roll), attacker, defender, true);
  const attackRoll = criticalResult.attackRoll;
  const bonus = profile.weapon ? attackBonusForWeapon(attacker, profile.weapon) : attackBonusForAbility(attacker, profile.attackAbility ?? "str");
  const total = attackRoll + bonus;
  const targetAc = armorClass(defender);
  addLog(`${attacker.name}'s ${label}${attackLightDisadvantageText(lightContext)}: d20 ${attackRoll} ${abilityLabel(bonus)} = ${total} vs AC ${targetAc}.${criticalResult.note ? ` ${criticalResult.note}` : ""}`, "important");
  addAdminLog(`${attacker.name} ${label} breakdown vs ${defender.name}: ${d20RollDetail(attackRollResult)}${criticalResult.attackRoll !== attackRollResult.roll ? ` -> d20 ${attackRoll}` : ""} + attack ${abilityLabel(bonus)} = ${total}; target AC ${targetAc}${lightContext.note ? `; ${lightContext.note}` : ""}.`);
  if (attackRoll === 1 || (!criticalResult.forcedHit && total < targetAc)) {
    addLog(`${attacker.name}'s ${label} misses.`);
    return false;
  }
  const weaponRoll = rollDice((profile.count ?? 1) * (criticalResult.doublesDamage ? 2 : 1), profile.sides ?? 6);
  const weaponDamage = Math.max(1, weaponRoll.total + (profile.bonus ?? 0));
  applySpecialDamage(attacker, defender, weaponDamage, profile.type ?? "damage", label);
  if (extraDamage > 0 && defender.alive) applySpecialDamage(attacker, defender, extraDamage, extraType ?? profile.type ?? "damage", label);
  return true;
}

async function maybeUseRunicShieldReaction(attacker, defender, totalAttack, currentAttackBonus, defenderAc) {
  const candidate = reactionCandidates("runicShield", defender, 12, false)[0];
  if (!candidate || totalAttack < defenderAc) return { totalAttack, blocked: false };
  const useShield = await showReactionPrompt({
    actor: candidate,
    title: "Runic Shield",
    message: `${attacker.name}'s attack would hit ${defender.name}. Force a reroll?`,
    acceptLabel: "Use Rune",
  });
  const ability = reactionAbility(candidate, "runicShield");
  if (!useShield || !consumeReaction(candidate, "Runic Shield") || !canSpendCombatAbility(candidate, ability)) return { totalAttack, blocked: false };
  spendCombatAbilityUse(candidate, ability);
  const reroll = rollD20ForFighter(attacker);
  const newTotal = reroll.roll + currentAttackBonus;
  const blocked = reroll.roll === 1 || newTotal < defenderAc;
  addLog(`${candidate.name}'s Runic Shield forces ${attacker.name} to reroll: d20 ${reroll.roll} ${abilityLabel(currentAttackBonus)} = ${newTotal}.${blocked ? " The attack misses." : ""}`, "important");
  return { totalAttack: newTotal, blocked };
}

async function maybeUseCloudRuneReaction(attacker, defender, totalAttack, defenderAc) {
  const candidate = reactionCandidates("cloudRune", defender, 6, true)[0];
  if (!candidate || totalAttack < defenderAc) return false;
  const useRune = await showReactionPrompt({
    actor: candidate,
    title: "Cloud Rune",
    message: `${attacker.name}'s attack would hit ${defender.name}. Invoke Cloud Rune to turn it aside?`,
    acceptLabel: "Invoke Rune",
  });
  const ability = reactionAbility(candidate, "cloudRune");
  if (!useRune || !consumeReaction(candidate, "Cloud Rune") || !canSpendCombatAbility(candidate, ability)) return false;
  spendCombatAbilityUse(candidate, ability);
  addLog(`${candidate.name}'s Cloud Rune misdirects the attack away from ${defender.name}.`, "important");
  return true;
}

async function maybeUseShadowMartyrReaction(attacker, defender, totalAttack, defenderAc) {
  const candidate = reactionCandidates("shadowMartyr", defender, 6, false)[0];
  if (!candidate || totalAttack < defenderAc) return false;
  const useMartyr = await showReactionPrompt({
    actor: candidate,
    title: "Shadow Martyr",
    message: `${attacker.name}'s attack would hit ${defender.name}. Sacrifice the echo to block it?`,
    acceptLabel: "Interpose Echo",
  });
  const ability = reactionAbility(candidate, "shadowMartyr");
  if (!useMartyr || !consumeReaction(candidate, "Shadow Martyr") || !canSpendCombatAbility(candidate, ability)) return false;
  spendCombatAbilityUse(candidate, ability);
  addLog(`${candidate.name}'s echo takes the attack meant for ${defender.name}.`, "important");
  return true;
}

async function maybeUseWardingManeuverReaction(attacker, defender, totalAttack, defenderAc) {
  const candidate = reactionCandidates("wardingManeuver", defender, 1, true)[0];
  if (!candidate || totalAttack < defenderAc) return { acBonus: 0, blocked: false, resistance: false };
  const useManeuver = await showReactionPrompt({
    actor: candidate,
    title: "Warding Maneuver",
    message: `${attacker.name}'s attack would hit ${defender.name}. Roll 1d8 to raise AC?`,
    acceptLabel: "Ward",
  });
  const ability = reactionAbility(candidate, "wardingManeuver");
  if (!useManeuver || !consumeReaction(candidate, "Warding Maneuver") || !canSpendCombatAbility(candidate, ability)) return { acBonus: 0, blocked: false, resistance: false };
  spendCombatAbilityUse(candidate, ability);
  const roll = rollDice(1, 8);
  const blocked = totalAttack < defenderAc + roll.total;
  addLog(`${candidate.name}'s Warding Maneuver adds ${roll.total} AC to ${defender.name}.${blocked ? " The attack misses." : " The hit lands, but resistance applies."}`, "important");
  return { acBonus: roll.total, blocked, resistance: !blocked };
}

async function maybeUseCuttingWordsReaction(attacker, defender, totalAttack, defenderAc) {
  const candidate = reactionCandidates("cuttingWords", defender, 12, true)[0];
  if (!candidate || totalAttack < defenderAc) return { totalAttack, blocked: false };
  const useWords = await showReactionPrompt({
    actor: candidate,
    title: "Cutting Words",
    message: `${attacker.name}'s attack would hit ${defender.name}. Spend Bardic Inspiration to cut down the attack roll?`,
    acceptLabel: "Cut Words",
  });
  const ability = reactionAbility(candidate, "cuttingWords");
  if (!useWords || !consumeReaction(candidate, "Cutting Words") || !canSpendCombatAbility(candidate, ability)) return { totalAttack, blocked: false };
  spendCombatAbilityUse(candidate, ability);
  const dieSides = (candidate.level ?? 1) >= 15 ? 12 : (candidate.level ?? 1) >= 10 ? 10 : (candidate.level ?? 1) >= 5 ? 8 : 6;
  const roll = rollDie(dieSides);
  const newTotal = totalAttack - roll;
  const blocked = newTotal < defenderAc;
  addLog(`${candidate.name}'s Cutting Words subtracts ${roll} from the attack.${blocked ? " The attack misses." : ""}`, "important");
  return { totalAttack: newTotal, blocked };
}

async function maybeUseBeastTailReaction(attacker, defender, totalAttack, defenderAc) {
  if (!isPartyHeroId(defender?.id) || defender.subclassId !== "beast" || barbarianBeastForm(defender) !== "tail") return { acBonus: 0, blocked: false };
  if (totalAttack < defenderAc || !hasReactionAvailable(defender) || !fightersWithinSquares(attacker, defender, 2) || !hasClearLineOfSightBetweenFighters(defender, attacker)) return { acBonus: 0, blocked: false };
  const useTail = await showReactionPrompt({
    actor: defender,
    title: "Bestial Tail",
    message: `${attacker.name}'s attack would hit ${defender.name}. Use your reaction to roll 1d8 and add it to AC?`,
    acceptLabel: "Swipe Tail",
  });
  if (!useTail || !consumeReaction(defender, "Bestial Tail")) return { acBonus: 0, blocked: false };
  const roll = rollDie(8);
  const blocked = totalAttack < defenderAc + roll;
  addLog(`${defender.name}'s tail adds ${roll} AC.${blocked ? " The attack misses." : ""}`, "important");
  return { acBonus: roll, blocked };
}

async function maybeUseSelfStatusHitReaction(defender, abilityId, title, message, acceptLabel, totalAttack, defenderAc) {
  if (!isPartyHeroId(defender?.id) || totalAttack < defenderAc || !hasReactionAvailable(defender)) return { acBonus: 0, blocked: false };
  const ability = reactionAbility(defender, abilityId);
  if (!canSpendCombatAbility(defender, ability)) return { acBonus: 0, blocked: false };
  const useReaction = await showReactionPrompt({
    actor: defender,
    title,
    message,
    acceptLabel,
  });
  if (!useReaction || !consumeReaction(defender, title) || !canSpendCombatAbility(defender, ability)) return { acBonus: 0, blocked: false };
  spendCombatAbilityUse(defender, ability);
  const status = subclassEffectStatus(defender, ability.subclassEffect?.status ?? {});
  applyStatusEffect(defender, status);
  const acBonus = status.acBonus ?? 0;
  const blocked = acBonus > 0 && totalAttack < defenderAc + acBonus;
  addLog(`${defender.name}'s ${ability.name} takes effect.${blocked ? " The attack misses." : ""}`, "important");
  return { acBonus, blocked };
}

async function maybeUseHitReactionDefenses(attacker, defender, totalAttack, currentAttackBonus, defenderAc) {
  if (!isPartyHeroId(defender?.id) && defender?.team !== "heroes" && !defender?.friendly) return { totalAttack, acBonus: 0, blocked: false, resistance: false };
  const cuttingWords = await maybeUseCuttingWordsReaction(attacker, defender, totalAttack, defenderAc);
  totalAttack = cuttingWords.totalAttack;
  if (cuttingWords.blocked) return { totalAttack, acBonus: 0, blocked: true, resistance: false };
  const entropicWard = await maybeUseSelfStatusHitReaction(defender, "entropicWard", "Entropic Ward", `${attacker.name}'s attack would hit ${defender.name}. Twist probability to raise defense and prime your next attack?`, "Twist Fate", totalAttack, defenderAc);
  let selfStatusAcBonus = entropicWard.acBonus;
  if (entropicWard.blocked) return { totalAttack, acBonus: selfStatusAcBonus, blocked: true, resistance: false };
  defenderAc += entropicWard.acBonus;
  const armorOfHexes = await maybeUseSelfStatusHitReaction(defender, "armorOfHexes", "Armor of Hexes", `${attacker.name}'s attack would hit ${defender.name}. Bend cursed shadow around the strike?`, "Hex Armor", totalAttack, defenderAc);
  selfStatusAcBonus += armorOfHexes.acBonus;
  if (armorOfHexes.blocked) return { totalAttack, acBonus: selfStatusAcBonus, blocked: true, resistance: false };
  defenderAc += armorOfHexes.acBonus;
  const tipsySway = await maybeUseSelfStatusHitReaction(defender, "tipsySway", "Tipsy Sway", `${attacker.name}'s attack would hit ${defender.name}. Spend ki to sway aside and ready a counter rhythm?`, "Sway", totalAttack, defenderAc);
  selfStatusAcBonus += tipsySway.acBonus;
  if (tipsySway.blocked) return { totalAttack, acBonus: selfStatusAcBonus, blocked: true, resistance: false };
  defenderAc += tipsySway.acBonus;
  const tail = await maybeUseBeastTailReaction(attacker, defender, totalAttack, defenderAc);
  if (tail.blocked) return { totalAttack, acBonus: selfStatusAcBonus + tail.acBonus, blocked: true, resistance: false };
  defenderAc += tail.acBonus;
  const runic = await maybeUseRunicShieldReaction(attacker, defender, totalAttack, currentAttackBonus, defenderAc);
  totalAttack = runic.totalAttack;
  if (runic.blocked) return { totalAttack, acBonus: selfStatusAcBonus + tail.acBonus, blocked: true, resistance: false };
  if (await maybeUseCloudRuneReaction(attacker, defender, totalAttack, defenderAc)) return { totalAttack, acBonus: selfStatusAcBonus + tail.acBonus, blocked: true, resistance: false };
  if (await maybeUseShadowMartyrReaction(attacker, defender, totalAttack, defenderAc)) return { totalAttack, acBonus: selfStatusAcBonus + tail.acBonus, blocked: true, resistance: false };
  const warding = await maybeUseWardingManeuverReaction(attacker, defender, totalAttack, defenderAc);
  return { totalAttack, ...warding, acBonus: selfStatusAcBonus + (warding.acBonus ?? 0) + tail.acBonus };
}

async function maybeUseProtectiveField(target, damage) {
  if (!isPartyHeroId(target?.id) && target?.team !== "heroes" && !target?.friendly) return damage;
  if (damage <= 0) return damage;
  const candidate = reactionCandidates("protectiveField", target, 6, true)[0];
  if (!candidate) return damage;
  const useField = await showReactionPrompt({
    actor: candidate,
    title: "Protective Field",
    message: `${target.name} would take ${damage} damage. Spend psionic energy to reduce it?`,
    acceptLabel: "Protect",
  });
  const ability = reactionAbility(candidate, "protectiveField");
  if (!useField || !consumeReaction(candidate, "Protective Field") || !canSpendCombatAbility(candidate, ability)) return damage;
  spendCombatAbilityUse(candidate, ability);
  const roll = rollDice(1, (candidate.level ?? 1) >= 17 ? 12 : (candidate.level ?? 1) >= 11 ? 10 : (candidate.level ?? 1) >= 5 ? 8 : 6);
  const reduction = Math.max(1, roll.total + abilityMod(candidate, "int"));
  addLog(`${candidate.name}'s Protective Field reduces damage by ${reduction}.`, "important");
  return Math.max(0, damage - reduction);
}

async function maybeUseSpiritShield(target, attacker, damage) {
  if ((!isPartyHeroId(target?.id) && target?.team !== "heroes" && !target?.friendly) || damage <= 0) return damage;
  const candidate = reactionCandidates("spiritShield", target, 6, true)[0];
  if (!candidate) return damage;
  const useShield = await showReactionPrompt({
    actor: candidate,
    title: "Spirit Shield",
    message: `${target.name} would take ${damage} damage. Let ancestral spirits reduce it?`,
    acceptLabel: "Shield",
  });
  const ability = reactionAbility(candidate, "spiritShield");
  if (!useShield || !consumeReaction(candidate, "Spirit Shield") || !canSpendCombatAbility(candidate, ability)) return damage;
  spendCombatAbilityUse(candidate, ability);
  const dice = (candidate.level ?? 1) >= 14 ? 4 : (candidate.level ?? 1) >= 10 ? 3 : 2;
  const roll = rollDice(dice, 6);
  const reduced = Math.max(0, damage - roll.total);
  addLog(`${candidate.name}'s Spirit Shield reduces damage by ${roll.total}.`, "important");
  if ((candidate.level ?? 1) >= 14 && attacker?.alive && roll.total > 0) applySpecialDamage(candidate, attacker, roll.total, "force", "Vengeful Ancestors");
  return reduced;
}

async function maybeUseDrownedLegionWall(defender, attacker, damage, meleeAttack) {
  if (!meleeAttack || damage <= 0 || !isPartyHeroId(defender?.id) || !hasReactionAvailable(defender)) return damage;
  if (!activeMagicItemByTemplate(defender, barrowCrownItemIds.drownedLegionShield)) return damage;
  const useWall = await showReactionPrompt({
    actor: defender,
    title: "Legion Wall",
    message: `${attacker.name} would deal ${damage} melee damage. Use Shield of the Drowned Legion to reduce it by 1d8 + proficiency?`,
    acceptLabel: "Raise Legion",
    declineLabel: "Take Hit",
  });
  if (!useWall || !consumeReaction(defender, "Legion Wall")) return damage;
  const roll = rollDice(1, 8);
  const reduction = Math.max(1, roll.total + proficiencyBonus(defender));
  addLog(`${defender.name}'s drowned legion reduces damage by ${reduction} (${roll.rolls[0]} ${abilityLabel(proficiencyBonus(defender))}).`, "important");
  return Math.max(0, damage - reduction);
}

async function maybeUseBattleMasterParry(defender, attacker, damage, meleeAttack) {
  if (!meleeAttack || damage <= 0 || !isPartyHeroId(defender?.id) || !hasReactionAvailable(defender)) return damage;
  const ability = reactionAbility(defender, "maneuverParry");
  if (!canSpendCombatAbility(defender, ability)) return damage;
  const useParry = await showReactionPrompt({
    actor: defender,
    title: "Parry",
    message: `${attacker.name} would deal ${damage} melee damage. Spend superiority to reduce it?`,
    acceptLabel: "Parry",
  });
  if (!useParry || !consumeReaction(defender, "Parry")) return damage;
  spendCombatAbilityUse(defender, ability);
  const roll = rollDice(1, (defender.level ?? 1) >= 18 ? 12 : (defender.level ?? 1) >= 10 ? 10 : 8);
  const reduction = Math.max(0, roll.total + abilityMod(defender, "dex"));
  addLog(`${defender.name}'s Parry reduces damage by ${reduction}.`, "important");
  return Math.max(0, damage - reduction);
}

async function maybeUseRiposte(defender, attacker, meleeAttack) {
  if (!meleeAttack || !isPartyHeroId(defender?.id) || !attacker?.alive || !hasReactionAvailable(defender) || !hasMeleeAccess(defender, attacker)) return;
  const ability = reactionAbility(defender, "maneuverRiposte");
  if (!canSpendCombatAbility(defender, ability)) return;
  const useRiposte = await showReactionPrompt({
    actor: defender,
    title: "Riposte",
    message: `${attacker.name} missed ${defender.name}. Spend superiority to counterattack?`,
    acceptLabel: "Riposte",
  });
  if (!useRiposte || !consumeReaction(defender, "Riposte")) return;
  spendCombatAbilityUse(defender, ability);
  const die = rollDice(1, (defender.level ?? 1) >= 18 ? 12 : (defender.level ?? 1) >= 10 ? 10 : 8);
  reactionWeaponAttackDamage(defender, attacker, "Riposte", die.total, defender.damage?.type ?? "damage");
  if (!attacker.alive && !isPartyHeroId(attacker.id)) {
    triggerMonsterDeathStory(attacker);
    playSoundEffect("enemyDefeated");
    awardMonsterXp(attacker);
    dropLootForMonster(attacker);
    await finishEncounterAfterLastMonsterFalls();
  }
}

async function maybeUseBraceBeforeAttack(attacker) {
  if (isPartyHeroId(attacker?.id) || attacker?.team === "heroes" || attacker?.friendly) return;
  if (!attacker?.alive) return;
  const candidate = partyHeroes().find((hero) => {
    const ability = reactionAbility(hero, "maneuverBrace");
    return heroCanAct(hero) && hasReactionAvailable(hero) && canSpendCombatAbility(hero, ability) && hasMeleeAccess(hero, attacker);
  });
  if (!candidate) return;
  const useBrace = await showReactionPrompt({
    actor: candidate,
    title: "Brace",
    message: `${attacker.name} is in ${candidate.name}'s reach. Spend superiority to brace and strike first?`,
    acceptLabel: "Brace",
  });
  const ability = reactionAbility(candidate, "maneuverBrace");
  if (!useBrace || !consumeReaction(candidate, "Brace") || !canSpendCombatAbility(candidate, ability)) return;
  spendCombatAbilityUse(candidate, ability);
  const profile = opportunityAttackProfile(candidate);
  const attackRoll = rollD20ForFighter(candidate);
  const bonus = profile.weapon ? attackBonusForWeapon(candidate, profile.weapon) : attackBonusForAbility(candidate, profile.attackAbility ?? "str");
  const total = attackRoll.roll + bonus;
  const targetAc = armorClass(attacker);
  addLog(`${candidate.name} braces against ${attacker.name}: d20 ${attackRoll.roll} ${abilityLabel(bonus)} = ${total} vs AC ${targetAc}.`, "important");
  if (attackRoll.roll === 1 || total < targetAc) return;
  const weaponRoll = rollDice(profile.count ?? 1, profile.sides ?? 6);
  const die = rollDice(1, (candidate.level ?? 1) >= 18 ? 12 : (candidate.level ?? 1) >= 10 ? 10 : 8);
  applySpecialDamage(candidate, attacker, Math.max(1, weaponRoll.total + (profile.bonus ?? 0) + die.total), profile.type ?? "damage", "Brace");
  if (!attacker.alive && !isPartyHeroId(attacker.id)) {
    triggerMonsterDeathStory(attacker);
    playSoundEffect("enemyDefeated");
    awardMonsterXp(attacker);
    dropLootForMonster(attacker);
    await finishEncounterAfterLastMonsterFalls();
  }
}

async function maybeUseStoneRuneAfterAttack(attacker, defender) {
  if (isPartyHeroId(attacker?.id) || attacker?.team === "heroes" || attacker?.friendly) return;
  const candidate = reactionCandidates("stoneRune", attacker, 6, true).find((hero) => hero.id !== attacker.id);
  if (!candidate || !attacker?.alive) return;
  const useRune = await showReactionPrompt({
    actor: candidate,
    title: "Stone Rune",
    message: `${attacker.name} is within 30 ft after attacking. Invoke Stone Rune to slow them?`,
    acceptLabel: "Invoke Rune",
  });
  const ability = reactionAbility(candidate, "stoneRune");
  if (!useRune || !consumeReaction(candidate, "Stone Rune") || !canSpendCombatAbility(candidate, ability)) return;
  spendCombatAbilityUse(candidate, ability);
  const save = await rollSavingThrow(attacker, "wis", 8 + proficiencyBonus(candidate) + abilityMod(candidate, "con"), `${candidate.name}'s Stone Rune clouds ${attacker.name}'s mind.`);
  if (!save.success) applyStatusEffect(attacker, { id: "stone-rune-stupor", label: "Stone Stupor", speedLocked: true, attackBonus: -3, durationRounds: 1 });
}

async function maybeUseBeastClawExtraAttack(attacker, defender, options = {}) {
  if (options.beastFormAttack !== "claws" || options.freeAttack || options.resource || attacker.beastClawExtraUsedThisTurn || !defender?.alive) return;
  attacker.beastClawExtraUsedThisTurn = true;
  const claw = barbarianBeastNaturalWeapon(attacker, "claws");
  if (!claw) return;
  addLog(`${attacker.name}'s claws make an additional attack as part of the same action.`, "important");
  await makeAttack(attacker, defender, {
    weapon: claw,
    beastFormAttack: "claws",
    freeAttack: true,
    actionLabel: "makes an additional claw attack",
  });
}

async function maybeUseBarbarianAfterDamage(defender, attacker, damage, meleeAttack) {
  if (!isPartyHeroId(defender?.id) || damage <= 0 || !attacker?.alive) return;
  const raging = (defender.statusEffects ?? []).some((effect) => effect.id === "rage");
  if (raging && defender.subclassId === "battlerager" && (defender.level ?? 1) >= 14 && meleeAttack) {
    applySpecialDamage(defender, attacker, 3, "piercing", "Spiked Retribution");
  }
  if (raging && defender.subclassId === "wild-magic" && (defender.level ?? 1) >= 10 && hasReactionAvailable(defender)) {
    const ability = reactionAbility(defender, "unstableBacklash");
    if (canSpendCombatAbility(defender, ability)) {
      const useBacklash = await showReactionPrompt({
        actor: defender,
        title: "Unstable Backlash",
        message: `${defender.name}'s wild magic can surge after taking damage. Trigger a new surge?`,
        acceptLabel: "Surge",
      });
      if (useBacklash && consumeReaction(defender, "Unstable Backlash")) {
        spendCombatAbilityUse(defender, ability);
        applyBarbarianWildSurge(defender);
      }
    }
  }
  if (defender.subclassId === "berserker" && (defender.level ?? 1) >= 14 && meleeAttack && hasReactionAvailable(defender) && hasMeleeAccess(defender, attacker)) {
    const ability = reactionAbility(defender, "retaliation");
    if (!canSpendCombatAbility(defender, ability)) return;
    const useRetaliation = await showReactionPrompt({
      actor: defender,
      title: "Retaliation",
      message: `${attacker.name} damaged ${defender.name}. Strike back?`,
      acceptLabel: "Retaliate",
    });
    if (!useRetaliation || !consumeReaction(defender, "Retaliation")) return;
    spendCombatAbilityUse(defender, ability);
    reactionWeaponAttackDamage(defender, attacker, "Retaliation");
    if (!attacker.alive && !isPartyHeroId(attacker.id)) {
      triggerMonsterDeathStory(attacker);
      playSoundEffect("enemyDefeated");
      awardMonsterXp(attacker);
      dropLootForMonster(attacker);
      await finishEncounterAfterLastMonsterFalls();
    }
  }
}

async function maybeUseSubclassAfterDamageReactions(defender, attacker, damage, meleeAttack) {
  if (!isPartyHeroId(defender?.id) || damage <= 0 || !defender.alive || !attacker?.alive || !hasReactionAvailable(defender)) return;

  const wrath = reactionAbility(defender, "wrathOfTheStorm");
  if (canSpendCombatAbility(defender, wrath) && fightersWithinSquares(defender, attacker, 12) && hasClearLineOfSightBetweenFighters(defender, attacker)) {
    const useWrath = await showReactionPrompt({
      actor: defender,
      title: "Wrath of the Storm",
      message: `${attacker.name} damaged ${defender.name}. Answer with storm power?`,
      acceptLabel: "Strike Back",
    });
    if (useWrath && consumeReaction(defender, "Wrath of the Storm") && canSpendCombatAbility(defender, wrath)) {
      spendCombatAbilityUse(defender, wrath);
      const effect = wrath.subclassEffect ?? {};
      const stormDamage = Math.max(1, subclassEffectDiceTotal(effect, defender));
      applySpecialDamage(defender, attacker, stormDamage, effect.damageType ?? "lightning", wrath.name);
      if (attacker.alive && effect.riderStatus) applyWeaponRiderNamedStatus(defender, attacker, effect.riderStatus);
      if (!attacker.alive && !isPartyHeroId(attacker.id)) {
        triggerMonsterDeathStory(attacker);
        playSoundEffect("enemyDefeated");
        awardMonsterXp(attacker);
        dropLootForMonster(attacker);
        await finishEncounterAfterLastMonsterFalls();
      }
      return;
    }
  }

  const soul = reactionAbility(defender, "soulOfVengeance");
  if (meleeAttack && canSpendCombatAbility(defender, soul) && hasMeleeAccess(defender, attacker)) {
    const useSoul = await showReactionPrompt({
      actor: defender,
      title: "Soul of Vengeance",
      message: `${attacker.name} damaged ${defender.name}. Answer with a radiant weapon strike?`,
      acceptLabel: "Strike",
    });
    if (useSoul && consumeReaction(defender, "Soul of Vengeance") && canSpendCombatAbility(defender, soul)) {
      spendCombatAbilityUse(defender, soul);
      const radiant = Math.max(1, subclassEffectDiceTotal(soul.subclassEffect ?? {}, defender));
      reactionWeaponAttackDamage(defender, attacker, "Soul of Vengeance", radiant, "radiant");
      if (!attacker.alive && !isPartyHeroId(attacker.id)) {
        triggerMonsterDeathStory(attacker);
        playSoundEffect("enemyDefeated");
        awardMonsterXp(attacker);
        dropLootForMonster(attacker);
        await finishEncounterAfterLastMonsterFalls();
      }
      return;
    }
  }

  const multiattackDefense = reactionAbility(defender, "multiattackDefense");
  if (canSpendCombatAbility(defender, multiattackDefense)) {
    const useDefense = await showReactionPrompt({
      actor: defender,
      title: "Multiattack Defense",
      message: `${attacker.name} damaged ${defender.name}. Raise AC against follow-up attacks?`,
      acceptLabel: "Defend",
    });
    if (useDefense && consumeReaction(defender, "Multiattack Defense") && canSpendCombatAbility(defender, multiattackDefense)) {
      spendCombatAbilityUse(defender, multiattackDefense);
      applyStatusEffect(defender, subclassEffectStatus(defender, multiattackDefense.subclassEffect?.status ?? {}));
      addLog(`${defender.name}'s Multiattack Defense raises their guard.`, "important");
    }
  }
}

async function maybeUseHellishRebuke(defender, attacker) {
  const source = reactionSpellSource(defender, "hellish-rebuke");
  if (!isPartyHeroId(defender?.id) || !defender.alive || !attacker?.alive || !source) return;
  if (!isInAttackRangeWithProfile(defender, attacker, { range: { kind: "ranged", feet: 60 } }) || !hasClearLineOfSight(defender.position, attacker.position)) return;
  const useRebuke = await showReactionPrompt({
    actor: defender,
    title: "Hellish Rebuke",
    message: `${defender.name} was damaged by ${attacker.name}. Cast Hellish Rebuke?`,
    acceptLabel: source.item ? "Read Scroll" : "Rebuke",
  });
  if (!useRebuke) return;
  const spell = source.spell;
  spendSpellResources(defender, spell);
  const wasAlive = attacker.alive;
  await applySpellDamage(defender, attacker, spell);
  if (wasAlive && !attacker.alive && !isPartyHeroId(attacker.id)) {
    triggerMonsterDeathStory(attacker);
    playSoundEffect("enemyDefeated");
    awardMonsterXp(attacker);
    dropLootForMonster(attacker);
    await finishEncounterAfterLastMonsterFalls();
  }
}

function warriorDefenderCandidates(attacker, target) {
  if (!attacker?.alive || !target?.alive) return [];
  return partyHeroes().filter(
    (candidate) =>
      candidate.id !== target.id &&
      candidate.id !== attacker.id &&
      isSidekickWarrior(candidate) &&
      (candidate.sidekickWarriorRole ?? "attacker") === "defender" &&
      hasReactionAvailable(candidate) &&
      heroCanAct(candidate) &&
      attackGridDistanceBetweenFighters(candidate, attacker) <= 1 &&
      hasClearLineOfSightBetweenFighters(candidate, attacker) &&
      !hostileTo(candidate, target) &&
      hostileTo(candidate, attacker),
  );
}

async function maybeUseWarriorDefender(attacker, target) {
  const candidate = warriorDefenderCandidates(attacker, target)[0];
  if (!candidate) return false;
  const useDefense = await showReactionPrompt({
    actor: candidate,
    title: "Defender",
    message: `${attacker.name} attacks ${target.name}. ${candidate.name} can impose disadvantage.`,
    acceptLabel: "Defend",
  });
  if (!useDefense || !consumeReaction(candidate, "Defender")) return false;
  addLog(`${candidate.name} uses Defender to hinder ${attacker.name}'s attack.`, "important");
  return true;
}

function tickStatusDurations(fighter) {
  expireTimedEffectsForFighter(fighter);
}

function removeSummonedAllies(reason = "fade") {
  const summonIds = Object.values(state.fighters ?? {}).filter((fighter) => fighter.summonedByHeroId).map((fighter) => fighter.id);
  for (const id of summonIds) {
    const ally = state.fighters[id];
    if (ally) addLog(`${ally.name} ${reason}.`, "important");
    delete state.fighters[id];
  }
  state.party.heroIds = (state.party.heroIds ?? []).filter((id) => !summonIds.includes(id));
  state.party.rosterIds = (state.party.rosterIds ?? []).filter((id) => !summonIds.includes(id));
  state.initiative = (state.initiative ?? []).filter((entry) => !summonIds.includes(entry.fighterId));
}

function attacksPerAttackAction(fighter) {
  if (isWildShaped(fighter)) return wildShapeHasMultiattack(wildShapeBeastById(fighter.wildShapeState?.beastFormId)) ? 2 : 1;
  const monsterMultiattack = typeof monsterMultiattackConfig === "function" ? monsterMultiattackConfig(fighter) : null;
  if (monsterMultiattack) return monsterMultiattack.attacks;
  const level = fighter?.level ?? 1;
  if (isSidekickWarrior(fighter)) return level >= 15 ? 3 : level >= 6 ? 2 : 1;
  if (fighter?.classId === "bard" && ["college-of-valor", "college-of-swords"].includes(fighter.subclassId) && level >= 6) return 2;
  if (warlockKnowsInvocation(fighter, "thirstingBlade") && level >= 5) return 2;
  if (!["barbarian", "fighter", "monk", "paladin", "ranger"].includes(fighter?.classId)) return 1;
  if (fighter.classId === "fighter") return level >= 20 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;
  return level >= 5 ? 2 : 1;
}

function consumeAttackFromAction(fighter) {
  if (!fighter?.hasAction) return false;
  fighter.attacksRemaining = Math.max(0, (fighter.attacksRemaining ?? attacksPerAttackAction(fighter)) - 1);
  fighter.hasAction = fighter.attacksRemaining > 0;
  return true;
}

function fighterStatusEffect(fighter, id) {
  return (fighter?.statusEffects ?? []).find((effect) => effect.id === id) ?? null;
}

function removeStatusEffect(fighter, id) {
  if (!fighter) return false;
  const before = fighter.statusEffects?.length ?? 0;
  fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => effect.id !== id);
  if ((fighter.statusEffects?.length ?? 0) === before) return false;
  refreshDerivedStats(fighter);
  return true;
}

function standUpFromProneAtTurnStart(fighter) {
  if (!fighterStatusEffect(fighter, "prone") || isPlayerControlledPartyFighter(fighter)) return false;
  const costFeet = Math.max(feetPerSquare, Math.ceil((fighter.speedFeet ?? 30) / 2 / feetPerSquare) * feetPerSquare);
  const costSquares = Math.max(1, Math.ceil(costFeet / feetPerSquare));
  fighter.movementLeft = Math.max(0, (fighter.movementLeft ?? 0) - costSquares);
  removeStatusEffect(fighter, "prone");
  addLog(`${fighter.name} gets back up from prone, spending ${costSquares * feetPerSquare} ft of movement.`, "important");
  return true;
}

function rollContestCheck(actor, ability, skillId = null) {
  const rollResult = rollD20ForFighter(actor);
  const roll = skillId ? reliableTalentRoll(actor, skillId, rollResult.roll) : rollResult.roll;
  const bonus = skillId ? skillCheckBonus(actor, ability, skillId) : abilityMod(actor, ability);
  return { actor, ability, skillId, rollResult, roll, bonus, total: roll + bonus };
}

function rollAthleticsContest(actor) {
  return rollContestCheck(actor, "str", "athletics");
}

function rollBestStrengthDexContest(actor) {
  const strBonus = abilityMod(actor, "str");
  const dexBonus = abilityMod(actor, "dex");
  return rollContestCheck(actor, dexBonus > strBonus ? "dex" : "str");
}

function logContestCheck(result, label, targetTotal, success) {
  const skillText = result.skillId ? " (Athletics)" : "";
  addAdminCheckLog({
    actor: result.actor,
    label: `${label} ${result.ability.toUpperCase()}${skillText}`,
    rollResult: result.rollResult,
    bonus: result.bonus,
    total: result.total,
    dc: targetTotal,
    success,
  });
}

function contestedManeuverCheck(attacker, defender, label) {
  const attackerCheck = rollAthleticsContest(attacker);
  const defenderCheck = rollBestStrengthDexContest(defender);
  const success = attackerCheck.total > defenderCheck.total;
  addLog(
    `${attacker.name} ${label}: Athletics ${attackerCheck.roll} ${abilityLabel(attackerCheck.bonus)} = ${attackerCheck.total} vs ${defender.name}'s ${defenderCheck.ability.toUpperCase()} ${defenderCheck.roll} ${abilityLabel(defenderCheck.bonus)} = ${defenderCheck.total}.`,
    "important",
  );
  logContestCheck(attackerCheck, label, defenderCheck.total, success);
  logContestCheck(defenderCheck, `resists ${label}`, attackerCheck.total, !success);
  recordD20OutcomeForFighter(attacker, success);
  return { attackerCheck, defenderCheck, success };
}

function applyGrappledCondition(target, grappler) {
  applyStatusEffect(target, { id: "grappled", label: "Grappled", speedLocked: true, grappledBy: grappler.id });
  addLog(`${target.name} is grappled and cannot move.`, "important");
}

function applyProneCondition(target, source = "shove") {
  applyStatusEffect(target, { id: "prone", label: "Prone", attackBonus: -2, prone: true, source });
  addLog(`${target.name} falls prone.`, "important");
}

function canPushTargetToPosition(attacker, target, position) {
  if (!position || !window.DungeonGrid.isInsideGrid(position, currentGridSize())) return false;
  if (!canFighterOccupyPosition(target, position, currentWalkable(target))) return false;
  const dx = Math.abs(position.x - target.position.x);
  const dy = Math.abs(position.y - target.position.y);
  if (dx + dy === 1) return canTraverseFootprintMovementEdge(target, target.position, position, []);
  if (Math.max(dx, dy) !== 1) return false;
  const cornerA = { x: position.x, y: target.position.y };
  const cornerB = { x: target.position.x, y: position.y };
  const walkable = currentWalkable(target);
  return (
    (canFighterOccupyPosition(target, cornerA, walkable) && canTraverseFootprintMovementEdge(target, target.position, cornerA, []) && canTraverseFootprintMovementEdge(target, cornerA, position, [])) ||
    (canFighterOccupyPosition(target, cornerB, walkable) && canTraverseFootprintMovementEdge(target, target.position, cornerB, []) && canTraverseFootprintMovementEdge(target, cornerB, position, []))
  );
}

function shovePushDestination(attacker, target) {
  const dx = Math.sign(target.position.x - attacker.position.x);
  const dy = Math.sign(target.position.y - attacker.position.y);
  if (!dx && !dy) return null;
  return { x: target.position.x + dx, y: target.position.y + dy };
}

function pushTargetAway(attacker, target) {
  const destination = shovePushDestination(attacker, target);
  if (!canPushTargetToPosition(attacker, target, destination)) {
    addLog(`${target.name} cannot be pushed farther away from ${attacker.name}.`, "important");
    return false;
  }
  target.position = destination;
  triggerTrapAtPosition(target, destination);
  addLog(`${attacker.name} shoves ${target.name} 5 ft away.`, "important");
  return true;
}

async function performGrappleAction(attacker, target) {
  if (!attacker?.hasAction || !target?.alive || objectIsDestructible(target) || !hasMeleeAccess(attacker, target)) return false;
  if (!consumeAttackFromAction(attacker)) return false;
  const contest = contestedManeuverCheck(attacker, target, "tries to grapple");
  if (contest.success) applyGrappledCondition(target, attacker);
  else addLog(`${target.name} avoids the grapple.`, "important");
  render();
  return true;
}

async function performShoveAction(attacker, target, mode = "prone") {
  if (!attacker?.hasAction || !target?.alive || objectIsDestructible(target) || !hasMeleeAccess(attacker, target)) return false;
  if (!consumeAttackFromAction(attacker)) return false;
  const contest = contestedManeuverCheck(attacker, target, mode === "push" ? "tries to shove away" : "tries to shove prone");
  if (contest.success) {
    if (mode === "push") pushTargetAway(attacker, target);
    else applyProneCondition(target);
  } else {
    addLog(`${target.name} holds their ground.`, "important");
  }
  render();
  return true;
}

async function attemptGrappleEscape(grappled) {
  const effect = fighterStatusEffect(grappled, "grappled");
  if (!effect) return false;
  const grappler = state.fighters?.[effect.grappledBy];
  if (!grappler?.alive || !hasMeleeAccess(grappler, grappled)) {
    removeStatusEffect(grappled, "grappled");
    addLog(`${grappled.name} is no longer grappled.`, "important");
    render();
    return false;
  }
  if (!grappled.hasAction) return false;
  const escapeCheck = rollBestStrengthDexContest(grappled);
  const holdCheck = rollAthleticsContest(grappler);
  const escaped = escapeCheck.total > holdCheck.total;
  grappled.hasAction = false;
  grappled.attacksRemaining = 0;
  addLog(
    `${grappled.name} tries to escape the grapple: ${escapeCheck.ability.toUpperCase()} ${escapeCheck.roll} ${abilityLabel(escapeCheck.bonus)} = ${escapeCheck.total} vs ${grappler.name}'s Athletics ${holdCheck.roll} ${abilityLabel(holdCheck.bonus)} = ${holdCheck.total}.`,
    "important",
  );
  logContestCheck(escapeCheck, "escapes grapple with", holdCheck.total, escaped);
  logContestCheck(holdCheck, "maintains grapple with", escapeCheck.total, !escaped);
  if (escaped) {
    removeStatusEffect(grappled, "grappled");
    addLog(`${grappled.name} breaks free of ${grappler.name}'s grapple.`, "important");
  } else {
    addLog(`${grappled.name} cannot break free.`, "important");
  }
  render();
  return true;
}

function sneakAttackDice(fighter) {
  if (fighter?.classId !== "rogue") return 0;
  return Math.ceil((fighter.level ?? 1) / 2) + (fighter.extraSneakAttackDice ?? 0);
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

function consumeWeaponRider(attacker, attackDamage = null) {
  const riders = (attacker.statusEffects ?? []).filter((effect) => effect.weaponRider || ["thunderous-smite", "wrathful-smite", "branding-smite", "ensnaring-strike", "hail-of-thorns"].includes(effect.id));
  const rider = riders.find((effect) => !effect.poison || ["piercing", "slashing"].includes(String(attackDamage?.type ?? "").toLowerCase()));
  if (!rider) return null;
  attacker.statusEffects = (attacker.statusEffects ?? []).filter((effect) => effect.id !== rider.id);
  return rider;
}

function rollPoisonDamage(poison = {}) {
  const dice = poison.damage;
  if (!dice?.count || !dice?.sides) return { raw: 0, rolls: [] };
  const roll = rollDice(dice.count, dice.sides);
  return { raw: Math.max(0, roll.total + (dice.bonus ?? 0)), rolls: roll.rolls };
}

function poisonConditionEffect(poison, condition) {
  const id = condition.id ?? `${poison.id ?? "poison"}-${condition.label ?? "effect"}`;
  const effect = {
    ...condition,
    id,
    sourcePoisonId: poison.id,
    sourcePoisonName: poison.name,
    poisonRepeatSaveDc: condition.repeatSaveEnds ? poison.saveDc : condition.poisonRepeatSaveDc,
  };
  if (effect.poisonTimedTrigger) {
    const trigger = { ...effect.poisonTimedTrigger };
    const delaySeconds = (Number(trigger.delayHours ?? trigger.intervalHours) || 0) * 3600;
    trigger.nextAtDungeonTimeSeconds = dungeonElapsedSeconds({ sync: false }) + Math.max(1, delaySeconds);
    effect.poisonTimedTrigger = trigger;
  }
  return effect;
}

async function applyPoisonExposure(source, target, poison = {}, options = {}) {
  if (!target?.alive || !poison) return false;
  const label = poison.name ?? options.label ?? "Poison";
  const saveDc = poison.saveDc ?? 10;
  const damage = rollPoisonDamage(poison);
  const save = await rollSavingThrow(target, "con", saveDc, `${label} forces ${target.name} to make a CON save.`);
  const failed = !save.success;
  if (!poison.delayedDamage && damage.raw > 0 && (failed || poison.halfDamageOnSave)) {
    const dealt = failed ? damage.raw : Math.max(0, Math.floor(damage.raw / 2));
    if (dealt > 0) applySpecialDamage(source ?? target, target, dealt, poison.damage?.type ?? "poison", label);
  }
  if (!failed) {
    addLog(`${target.name} resists ${label}.`, "important");
    return false;
  }
  for (const condition of poison.conditions ?? []) {
    applyStatusEffect(target, poisonConditionEffect(poison, condition));
  }
  for (const entry of poison.failBy ?? []) {
    if (save.total <= saveDc - (entry.amount ?? 0) && entry.status) applyStatusEffect(target, poisonConditionEffect(poison, entry.status));
  }
  if (poison.repeat?.at === "startOfTurn") {
    applyStatusEffect(target, {
      id: `poison-repeat-${poison.id ?? label}`,
      label,
      sourcePoisonId: poison.id,
      sourcePoisonName: label,
      poisonRepeat: { ...poison.repeat, successes: 0 },
      durationRounds: 10,
    });
  }
  if (poison.delayedStatus) {
    applyStatusEffect(target, poisonConditionEffect(poison, poison.delayedStatus));
    addLog(`${label} also leaves a delayed affliction marker on ${target.name}.`, "important");
  }
  return true;
}

function diseaseDefinition(diseaseId) {
  return window.DungeonAfflictions?.diseases?.[diseaseId] ?? null;
}

function fighterDiseases(fighter) {
  return (fighter?.statusEffects ?? []).filter((effect) => effect.disease || effect.diseaseId);
}

function diseaseStatusEffect(disease, source = null) {
  const base = disease?.status ?? {};
  const effect = {
    ...base,
    id: base.id ?? `disease-${disease.id}`,
    label: base.label ?? disease.name,
    disease: true,
    diseaseId: disease.id,
    sourceDiseaseName: disease.name,
    sourceId: source?.id,
  };
  if (effect.diseaseTimedTrigger) {
    const trigger = { ...effect.diseaseTimedTrigger };
    trigger.nextAtDungeonTimeSeconds = dungeonElapsedSeconds({ sync: false }) + Math.max(1, (Number(trigger.intervalHours) || 24) * 3600);
    effect.diseaseTimedTrigger = trigger;
  }
  return effect;
}

async function applyDiseaseExposure(source, target, diseaseId, options = {}) {
  const disease = typeof diseaseId === "string" ? diseaseDefinition(diseaseId) : diseaseId;
  if (!target?.alive || !disease) return false;
  const label = disease.name ?? options.label ?? "Disease";
  if (typeof fighterIsImmuneToDisease === "function" && fighterIsImmuneToDisease(target)) {
    addLog(`${target.name} is immune to ${label}.`, "important");
    return false;
  }
  if ((fighterDiseases(target) ?? []).some((effect) => effect.diseaseId === disease.id)) return false;
  const dc = options.saveDc ?? disease.saveDc ?? 12;
  const ability = disease.saveAbility ?? "con";
  const save = await rollSavingThrow(target, ability, dc, `${source?.name ?? label}'s ${label} exposure forces ${target.name} to make a ${ability.toUpperCase()} save.`);
  if (save.success) {
    addLog(`${target.name} resists ${label}.`, "important");
    return false;
  }
  applyStatusEffect(target, diseaseStatusEffect(disease, source));
  addLog(`${target.name} contracts ${label}.`, "important");
  return true;
}

function cureFighterDisease(fighter, diseaseId = null) {
  if (!fighter?.statusEffects?.length) return [];
  const removed = [];
  fighter.statusEffects = fighter.statusEffects.filter((effect) => {
    const matches = (effect.disease || effect.diseaseId) && (!diseaseId || effect.diseaseId === diseaseId);
    if (matches) removed.push(effect);
    return !matches;
  });
  if (removed.length) refreshDerivedStats(fighter);
  return removed;
}

function cureAllFighterDiseases(fighter) {
  return cureFighterDisease(fighter, null);
}

function curseDefinition(curseId) {
  return window.DungeonAfflictions?.curses?.[curseId] ?? null;
}

function itemCurseEntries(item, trigger = null) {
  const entries = [
    ...(item?.curses ?? []),
    ...(item?.magic?.curses ?? []),
    ...(item?.magic?.curse?.id ? [item.magic.curse] : []),
  ].map((entry) => (typeof entry === "string" ? { id: entry } : entry)).filter((entry) => entry?.id);
  return trigger ? entries.filter((entry) => (entry.mode ?? curseDefinition(entry.id)?.mode ?? "equip") === trigger) : entries;
}

function curseStatusEffect(curse, item, entry = {}) {
  const base = { ...(curse?.status ?? {}), ...(entry.status ?? {}) };
  const effectId = `curse-${entry.id ?? curse.id}-${item?.id ?? "item"}`;
  return {
    ...base,
    id: base.id ?? effectId,
    label: base.label ?? curse?.name ?? entry.name ?? "Curse",
    curse: true,
    curseId: entry.id ?? curse?.id,
    cursedItemId: item?.id,
    cursedItemName: item?.name,
    persistsAfterUnequip: Boolean(entry.persistsAfterUnequip ?? curse?.persistsAfterUnequip),
    conditionDescription: base.conditionDescription ?? entry.description ?? curse?.description,
  };
}

function triggerItemCurses(fighter, item, trigger = "equip") {
  if (!fighter || !item) return [];
  const triggered = [];
  for (const entry of itemCurseEntries(item, trigger)) {
    const curse = curseDefinition(entry.id);
    if (!curse) continue;
    item.curseState = { ...(item.curseState ?? {}), triggered: true, removed: false };
    if (entry.cannotUnequip ?? curse.cannotUnequip) item.curseState.bound = true;
    const status = curseStatusEffect(curse, item, entry);
    if (!(fighter.statusEffects ?? []).some((effect) => effect.id === status.id)) {
      applyStatusEffect(fighter, status);
      addLog(`${item.name}'s ${curse.name} curse takes hold of ${fighter.name}.`, "important");
    }
    triggered.push(curse);
  }
  return triggered;
}

function itemHasBindingCurse(item) {
  return Boolean(item?.curseState?.bound && itemCurseEntries(item).some((entry) => entry.cannotUnequip ?? curseDefinition(entry.id)?.cannotUnequip));
}

function removeItemCurseEffectsOnUnequip(fighter, item) {
  if (!fighter || !item?.id) return [];
  const removed = [];
  fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => {
    if (effect.cursedItemId !== item.id || effect.persistsAfterUnequip) return true;
    removed.push(effect);
    return false;
  });
  if (removed.length) refreshDerivedStats(fighter);
  return removed;
}

function removeCursesFromFighter(fighter, options = {}) {
  if (!fighter) return { statuses: [], items: [] };
  const statuses = [];
  const removedItemIds = new Set();
  fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => {
    if (!effect.curse && !effect.curseId) return true;
    if (options.itemId && effect.cursedItemId !== options.itemId) return true;
    if (options.effectId && effect.id !== options.effectId) return true;
    statuses.push(effect);
    if (effect.cursedItemId) removedItemIds.add(effect.cursedItemId);
    return false;
  });
  const items = [];
  for (const item of fighter.inventory?.items ?? []) {
    if (!item.curseState && !itemCurseEntries(item).length) continue;
    if (options.itemId && item.id !== options.itemId) continue;
    if (options.effectId && !removedItemIds.has(item.id)) continue;
    item.curseState = { ...(item.curseState ?? {}), triggered: false, bound: false, removed: false };
    items.push(item);
  }
  if (statuses.length || items.length) refreshDerivedStats(fighter);
  return { statuses, items };
}

function applyTimedPoisonTrigger(fighter, effect, nowSeconds) {
  const trigger = effect.poisonTimedTrigger;
  if (!trigger?.nextAtDungeonTimeSeconds || trigger.nextAtDungeonTimeSeconds > nowSeconds) return false;
  const label = effect.sourcePoisonName ?? effect.label ?? "Poison";
  const saveDc = trigger.saveDc ?? 10;
  const save = savingThrow(fighter, "con", saveDc);
  addLog(`${fighter.name} rolls CON save against ${label}: ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${saveDc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
  const dice = trigger.damage ?? {};
  if (!save.success || trigger.halfDamageOnSave) {
    const roll = dice.count && dice.sides ? rollDice(dice.count, dice.sides) : { total: 0, rolls: [] };
    const damage = save.success ? Math.floor(roll.total / 2) : roll.total;
    if (damage > 0) applySpecialDamage(fighter, fighter, damage, dice.type ?? "poison", label);
  }
  if (trigger.mode === "once") {
    removeStatusEffect(fighter, effect.id);
    return true;
  }
  if (save.success) trigger.successes = (trigger.successes ?? 0) + 1;
  else {
    trigger.successes = 0;
    if (trigger.damageCountStep && trigger.damage) trigger.damage.count = Math.max(1, (trigger.damage.count ?? 1) + trigger.damageCountStep);
  }
  if ((trigger.successes ?? 0) >= (trigger.successTarget ?? 1)) {
    removeStatusEffect(fighter, effect.id);
    return true;
  }
  trigger.nextAtDungeonTimeSeconds = nowSeconds + Math.max(1, (Number(trigger.intervalHours) || 24) * 3600);
  return true;
}

function applyTimedDiseaseTrigger(fighter, effect, nowSeconds) {
  const trigger = effect.diseaseTimedTrigger;
  if (!trigger?.nextAtDungeonTimeSeconds || trigger.nextAtDungeonTimeSeconds > nowSeconds) return false;
  const label = effect.sourceDiseaseName ?? effect.label ?? "Disease";
  const saveDc = trigger.saveDc ?? diseaseDefinition(effect.diseaseId)?.saveDc ?? 12;
  const save = savingThrow(fighter, "con", saveDc);
  addLog(`${fighter.name} rolls CON save against ${label}: ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${saveDc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
  if (save.success) {
    trigger.successes = (trigger.successes ?? 0) + 1;
    if ((trigger.successes ?? 0) >= (trigger.successTarget ?? 1)) {
      removeStatusEffect(fighter, effect.id);
      for (const related of [...(fighter.statusEffects ?? [])].filter((entry) => entry.diseaseId === effect.diseaseId && entry.id !== effect.id)) removeStatusEffect(fighter, related.id);
      addLog(`${fighter.name} recovers from ${label}.`, "important");
      return true;
    }
  } else {
    trigger.successes = 0;
    trigger.failures = (trigger.failures ?? 0) + 1;
    if (trigger.failPenalty) {
      for (const [key, value] of Object.entries(trigger.failPenalty)) {
        if (typeof value === "number") effect[key] = Math.max(-5, (effect[key] ?? 0) + value);
      }
      refreshDerivedStats(fighter);
    }
    if (trigger.failureBlindnessAt && trigger.blindedStatus && (trigger.failures ?? 0) >= trigger.failureBlindnessAt) {
      applyStatusEffect(fighter, { ...trigger.blindedStatus, disease: true, diseaseId: effect.diseaseId });
      addLog(`${fighter.name}'s ${label} clouds their sight completely.`, "important");
    }
  }
  trigger.nextAtDungeonTimeSeconds = nowSeconds + Math.max(1, (Number(trigger.intervalHours) || 24) * 3600);
  return true;
}

function processTimedAfflictions(nowSeconds = dungeonElapsedSeconds({ sync: false })) {
  let processed = 0;
  for (const fighter of Object.values(state?.fighters ?? {})) {
    for (const effect of [...(fighter.statusEffects ?? [])]) {
      if (applyTimedPoisonTrigger(fighter, effect, nowSeconds)) processed += 1;
      if (applyTimedDiseaseTrigger(fighter, effect, nowSeconds)) processed += 1;
    }
  }
  return processed;
}

function maybeTriggerDiseaseOnDamage(fighter) {
  for (const effect of fighterDiseases(fighter)) {
    const trigger = effect.diseaseDamageTrigger;
    if (!trigger) continue;
    if (trigger.stunnedRounds) {
      applyStatusEffect(fighter, { id: `disease-stunned-${effect.diseaseId}`, label: "Stunned", condition: "stunned", actionLocked: true, speedLocked: true, durationRounds: trigger.stunnedRounds });
      addLog(`${fighter.name}'s ${effect.label ?? "disease"} leaves them stunned by the wound.`, "important");
    }
  }
}

async function applyActivePoisonsAtTurnStart(fighter) {
  if (!fighter?.alive || !fighter.statusEffects?.length) return;
  for (const effect of [...fighter.statusEffects]) {
    if (effect.burningRepeat) {
      const repeat = effect.burningRepeat;
      const source = state.fighters?.[repeat.sourceId] ?? fighter;
      const dice = repeat.damage ?? {};
      const roll = dice.count && dice.sides ? rollDice(dice.count, dice.sides) : { total: 0, rolls: [] };
      if (roll.total > 0) applySpecialDamage(source, fighter, Math.max(1, roll.total + (dice.bonus ?? 0)), dice.type ?? "fire", repeat.label ?? effect.label ?? "Burning");
    }
    if (effect.poisonRepeat) {
      const repeat = effect.poisonRepeat;
      const save = await rollSavingThrow(fighter, "con", repeat.saveDc ?? 10, `${effect.label ?? "Poison"} continues in ${fighter.name}'s system.`);
      if (save.success) {
        effect.poisonRepeat.successes = (effect.poisonRepeat.successes ?? 0) + 1;
        if (effect.poisonRepeat.successes >= (repeat.successTarget ?? 1)) removeStatusEffect(fighter, effect.id);
      } else {
        effect.poisonRepeat.successes = 0;
        const roll = repeat.damage?.count && repeat.damage?.sides ? rollDice(repeat.damage.count, repeat.damage.sides) : { total: 0, rolls: [] };
        if (roll.total > 0) applySpecialDamage(fighter, fighter, Math.max(1, roll.total + (repeat.damage.bonus ?? 0)), repeat.damage.type ?? "poison", effect.label ?? "Poison");
      }
    } else if (effect.poisonRepeatSaveDc) {
      const save = await rollSavingThrow(fighter, "con", effect.poisonRepeatSaveDc, `${fighter.name} tries to shake off ${effect.label ?? "poison"}.`);
      if (save.success) removeStatusEffect(fighter, effect.id);
    }
    if (effect.diseaseTurnTrigger && Math.random() <= (effect.diseaseTurnTrigger.chance ?? 1)) {
      const trigger = effect.diseaseTurnTrigger;
      const save = await rollSavingThrow(fighter, "con", trigger.saveDc ?? 12, `${fighter.name}'s ${effect.label ?? "disease"} surges under stress.`);
      if (!save.success) {
        const dice = trigger.damage ?? {};
        const roll = dice.count && dice.sides ? rollDice(dice.count, dice.sides) : { total: 0, rolls: [] };
        if (roll.total > 0) applySpecialDamage(fighter, fighter, roll.total + (dice.bonus ?? 0), dice.type ?? "psychic", effect.label ?? "Disease");
        if (trigger.incapacitateRounds) applyStatusEffect(fighter, { id: `disease-incapacitated-${effect.diseaseId}`, label: "Incapacitated", condition: "incapacitated", actionLocked: true, durationRounds: trigger.incapacitateRounds });
      }
    }
  }
}

async function applyWeaponRiderSecondary(attacker, defender, rider, attackDamage) {
  if (!rider || !defender) return;
  if (rider.poison) {
    if (!["piercing", "slashing"].includes(String(attackDamage?.type ?? "").toLowerCase())) {
      return;
    }
    await applyPoisonExposure(attacker, defender, rider.poison, { label: rider.label, weaponDelivery: true });
    return;
  }
  if (!defender.alive) return;
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
  if (rider.id === "searing-smite") {
    applyStatusEffect(defender, { id: "burning", label: "Burning", acBonus: -1, durationRounds: 1 });
    addLog(`${defender.name} is scorched by Searing Smite.`, "important");
  }
  if (rider.id === "ensnaring-strike") {
    const dc = 8 + proficiencyBonus(attacker) + abilityMod(attacker, spellcastingAbility(attacker));
    const save = await rollSavingThrow(defender, "str", dc, `${attacker.name}'s Ensnaring Strike wraps around ${defender.name}.`);
    if (!save.success) applyStatusEffect(defender, { id: "restrained", label: "Restrained", speedLocked: true, durationRounds: 2 });
  }
  if (rider.id === "hail-of-thorns" && attackDamage?.range?.kind !== "melee") {
    const splashTargets = Object.values(state.fighters).filter((fighter) => fighter.id !== defender.id && hostileTo(attacker, fighter) && fighter.alive && fightersWithinSquares(defender, fighter, 1));
    for (const target of splashTargets) {
      const save = await rollSavingThrow(target, "dex", 8 + proficiencyBonus(attacker) + abilityMod(attacker, spellcastingAbility(attacker)), `${attacker.name}'s Hail of Thorns bursts around ${defender.name}.`);
      const damage = Math.max(1, Math.floor((rider.damageBonus ?? 5) / (save.success ? 2 : 1)));
      applySpecialDamage(attacker, target, damage, rider.damageType ?? "piercing", "Hail of Thorns");
    }
  }
  if (rider.id === "lightning-arrow" && attackDamage?.range?.kind !== "melee") {
    const splashTargets = Object.values(state.fighters).filter((fighter) => fighter.id !== defender.id && hostileTo(attacker, fighter) && fighter.alive && fightersWithinSquares(defender, fighter, 1));
    for (const target of splashTargets) {
      const save = await rollSavingThrow(target, "dex", 8 + proficiencyBonus(attacker) + abilityMod(attacker, spellcastingAbility(attacker)), `${attacker.name}'s Lightning Arrow bursts around ${defender.name}.`);
      const damage = Math.max(1, Math.floor((rider.damageBonus ?? 14) / (save.success ? 2 : 1)));
      applySpecialDamage(attacker, target, damage, "lightning", "Lightning Arrow");
    }
  }
}

function expireEndOfTurnEffects(fighter) {
  if (!fighter) return;
  fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => !effect.expiresAtEndOfTurn);
  refreshDerivedStats(fighter);
}

function clearTurnScopedCombatState(fighter) {
  if (!fighter) return;
  expireEndOfTurnEffects(fighter);
  fighter.dodging = false;
  fighter.disengaged = false;
  fighter.canMoveThroughMonsters = false;
}

function endRages(reason = "") {
  for (const hero of partyHeroes()) {
    const hadRage = (hero.statusEffects ?? []).some((effect) => effect.id === "rage");
    if (!hadRage) continue;
    hero.statusEffects = (hero.statusEffects ?? []).filter((effect) => effect.id !== "rage" && !String(effect.id ?? "").startsWith("beast-form-"));
    hero.beastFormHitThisTurn = false;
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

function refreshRoomScrollMode() {
  els.roomScroll?.classList.toggle("home-builder-scroll", typeof isHomeBuilderOpen === "function" && isHomeBuilderOpen());
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

function centerViewOnHero({ animate = false, bringArenaIntoView = window.matchMedia?.("(max-width: 620px)")?.matches && state?.mode !== "home", retries = 2 } = {}) {
  const hero = activeHero();
  if (!hero?.position) return;

  const center = (remainingRetries) => {
    if (!els.roomScroll || !els.room || !els.roomScroll.clientWidth || !els.roomScroll.clientHeight) {
      if (remainingRetries > 0) window.requestAnimationFrame(() => center(remainingRetries - 1));
      return;
    }
    if (bringArenaIntoView) {
      document.querySelector(".arena")?.scrollIntoView({ block: "start", inline: "nearest" });
    }
    if (animate) {
      animateScrollRoomToGridPoint({ x: hero.position.x + 0.5, y: hero.position.y + 0.5 });
    } else {
      scrollRoomToGridPoint({ x: hero.position.x + 0.5, y: hero.position.y + 0.5 });
    }
    if (remainingRetries > 0) window.requestAnimationFrame(() => center(remainingRetries - 1));
  };

  window.requestAnimationFrame(() => center(retries));
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

function currentWalkable(fighter = null, options = {}) {
  const walkable = new Set((state.dungeon?.walkable ?? []).map(positionKey));
  blockingObjectKeys(fighter).forEach((tileKey) => walkable.delete(tileKey));
  if (options.includePersistentBlocks !== false) persistentSpellBlockingTileKeys().forEach((tileKey) => walkable.delete(tileKey));
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
  const walkable = dungeonFloorKeys();
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
  const floorKeys = dungeonFloorKeys();
  const activeKeys = activeTileKeys();
  for (const tileKey of floorKeys) {
    if (!activeKeys.has(tileKey)) continue;
    if (!isKnownTile(positionFromKey(tileKey))) continue;
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

function corridorPassageIdsAtPosition(position) {
  const tileKey = positionKey(position);
  return (state.dungeon?.corridorPassages ?? [])
    .filter((passage) => passage.cells?.some((cell) => positionKey(cell) === tileKey))
    .map((passage) => passage.id);
}

function corridorPassageIndexesAtPosition(position) {
  const tileKey = positionKey(position);
  return (state.dungeon?.corridorPassages ?? [])
    .map((passage, index) => passage.cells?.some((cell) => positionKey(cell) === tileKey) ? index : -1)
    .filter((index) => index >= 0);
}

function corridorNeighborCells(position) {
  const corridorKeys = corridorTiles();
  return adjacentCells(position).filter((cell) => corridorKeys.has(positionKey(cell)));
}

function isCorridorGeometryJunction(position) {
  return corridorNeighborCells(position).length >= 3;
}

function revealCrossedCorridorPassages(openedCorridorKeys, seedCells = []) {
  const passages = state.dungeon?.corridorPassages ?? [];
  if (!passages.length || !seedCells.length) return;

  const queue = [...seedCells];
  const checkedJunctionKeys = new Set();
  const revealedPassageIndexes = new Set();
  const maxChecks = Math.max(1, (state.dungeon?.corridors ?? []).length);
  let checks = 0;

  while (queue.length > 0 && checks < maxChecks) {
    checks += 1;
    const current = queue.shift();
    const currentKey = positionKey(current);
    if (checkedJunctionKeys.has(currentKey)) continue;

    const passageIndexes = corridorPassageIndexesAtPosition(current);
    const geometryJunction = isCorridorGeometryJunction(current);
    if (passageIndexes.length <= 1 && !geometryJunction) continue;

    checkedJunctionKeys.add(currentKey);
    const revealFromCells = geometryJunction ? [current, ...corridorNeighborCells(current)] : [current];
    const indexesToReveal = new Set(revealFromCells.flatMap(corridorPassageIndexesAtPosition));
    for (const passageIndex of indexesToReveal) {
      if (revealedPassageIndexes.has(passageIndex)) continue;
      revealedPassageIndexes.add(passageIndex);

      const passage = passages[passageIndex];
      for (const cell of passage?.cells ?? []) {
        const cellKey = positionKey(cell);
        const wasHidden = !openedCorridorKeys.has(cellKey);
        openedCorridorKeys.add(cellKey);
        if (wasHidden && (corridorPassageIndexesAtPosition(cell).length > 1 || isCorridorGeometryJunction(cell))) queue.push(cell);
      }
    }
  }
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

function hiddenDoorKey(door) {
  return door ? `${door.roomId ?? ""}:${positionKey(door)}` : "";
}

function doorIsHidden(door) {
  return Boolean(door?.hidden);
}

function hiddenDoorIsDiscovered(door) {
  if (!doorIsHidden(door)) return true;
  const doorKey = hiddenDoorKey(door);
  return Boolean(
    doorKey &&
      ((state.exploration?.discoveredHiddenDoorKeys ?? []).includes(doorKey) ||
        (state.exploration?.openedDoorKeys ?? []).includes(positionKey(door))),
  );
}

function doorIsVisibleToPlayers(door) {
  return showDungeonLayout || hiddenDoorIsDiscovered(door);
}

function visibleRoomDoors(room) {
  return (room?.doors ?? []).filter((door) => doorIsVisibleToPlayers({ ...door, roomId: room.id }));
}

function hiddenDoorsInRoom(room) {
  if (!room) return [];
  return (state.dungeon?.doors ?? []).filter((door) => door.roomId === room.id && doorIsHidden(door) && !hiddenDoorIsDiscovered(door));
}

function hiddenDoorSearchAttempted(hero, room) {
  return Boolean(hero?.id && room?.id && (state.exploration?.hiddenDoorSearchAttempts?.[hero.id] ?? []).includes(room.id));
}

function markHiddenDoorSearchAttempted(hero, room) {
  if (!hero?.id || !room?.id) return;
  state.exploration ??= {};
  state.exploration.hiddenDoorSearchAttempts ??= {};
  const attempts = new Set(state.exploration.hiddenDoorSearchAttempts[hero.id] ?? []);
  attempts.add(room.id);
  state.exploration.hiddenDoorSearchAttempts[hero.id] = Array.from(attempts);
}

function revealHiddenDoor(door, finder = null, source = "search") {
  if (!door || !doorIsHidden(door)) return false;
  state.exploration ??= {};
  const discovered = new Set(state.exploration.discoveredHiddenDoorKeys ?? []);
  const key = hiddenDoorKey(door);
  if (!key || discovered.has(key)) return false;
  discovered.add(key);
  state.exploration.discoveredHiddenDoorKeys = Array.from(discovered);
  const room = (state.dungeon?.rooms ?? []).find((entry) => entry.id === door.roomId);
  const roomText = room?.name ? ` in ${room.name}` : "";
  const finderText = finder?.name ?? "The party";
  addLog(`${finderText} reveals a hidden door${roomText}.`, "important");
  return true;
}

function passiveInvestigationScore(hero, position = hero?.position) {
  return passiveSkillScore(hero, "int", "investigation", { sightBased: true, position });
}

function checkPassiveHiddenDoorsForRoom(room) {
  const doors = hiddenDoorsInRoom(room);
  if (!doors.length) return false;
  let revealed = false;
  for (const door of doors) {
    const dc = Math.max(1, Number(door.spotDc) || 15);
    const finder = partyHeroes()
      .filter((hero) => heroCanAct(hero))
      .find((hero) => passiveInvestigationScore(hero, door) >= dc);
    if (finder) {
      revealed = revealHiddenDoor(door, finder, "passive") || revealed;
      const lightContext = lightingCheckContext(finder, "investigation", door);
      addAdminLog(`${finder.name} passive Investigation ${passiveInvestigationScore(finder, door)} spots hidden door at ${door.x},${door.y} vs DC ${dc}${lightContext.note ? ` (${lightContext.note})` : ""}.`);
    }
  }
  if (revealed) render();
  return revealed;
}

function searchRoomForHiddenDoors(hero = activeHero()) {
  if (!hero || state.mode === "combat" || !heroCanAct(hero) || isAutonomousAlly(hero)) return false;
  const room = roomForPosition(hero.position);
  if (!room) {
    addLog(`${hero.name} needs to be inside a room to search it.`);
    renderLog();
    return false;
  }
  if (hiddenDoorSearchAttempted(hero, room)) {
    addLog(`${hero.name} has already searched ${room.name ?? "this room"} for hidden doors.`);
    renderLog();
    return false;
  }
  if (!activeStealthCheckInMonsterRoom(hero, "searches the room")) return false;

  markHiddenDoorSearchAttempted(hero, room);
  const doors = hiddenDoorsInRoom(room);
  const check = rollSkillCheck(hero, "int", "investigation", { sightBased: true, position: hero.position, guidance: true });
  const { rollResult, roll, bonus, guidance, total, lightContext } = check;
  const guidanceText = guidance ? ` + Guidance ${guidance}` : "";
  const disadvantageText = lightContext.disadvantage ? " with disadvantage" : "";
  const lightNote = lightContextNote(lightContext, "; ");
  let revealed = 0;
  let hardestDc = 0;
  for (const door of doors) {
    const dc = Math.max(1, Number(door.spotDc) || 15);
    hardestDc = Math.max(hardestDc, dc);
    if (total >= dc && revealHiddenDoor(door, hero, "search")) revealed += 1;
  }
  const targetDc = doors.length ? hardestDc : 15;
  recordD20OutcomeForFighter(hero, revealed > 0);
  addLog(
    `${hero.name} searches ${room.name ?? "the room"}${disadvantageText}: INT ${roll} ${abilityLabel(bonus)}${guidanceText} = ${total}${
      doors.length ? ` vs hidden door DC up to ${hardestDc}` : ""
    }${lightNote}. ${revealed ? `${revealed} hidden door${revealed === 1 ? "" : "s"} found.` : "No hidden door found."}`,
    revealed ? "important" : undefined,
  );
  addAdminCheckLog({
    actor: hero,
    label: "Investigation check to search room",
    target: room.name ?? room.id,
    rollResult,
    bonus,
    guidance,
    total,
    dc: targetDc,
    success: revealed > 0,
    note: [doors.length ? `${doors.length} hidden door candidate${doors.length === 1 ? "" : "s"}` : "no hidden doors in room", lightContext.note].filter(Boolean).join("; "),
  });
  advanceDungeonTime(600, `${hero.name} searching ${room.name ?? "the room"}`, { force: true });
  render();
  return true;
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
    const hasNearbyOpenedDoor = visibleRoomDoors(room).some((door) => {
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
    visibleRoomDoors(room).forEach((door) => keys.add(positionKey(door)));
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
    if (!doorIsVisibleToPlayers(door)) continue;
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
    visibleRoomDoors(room).forEach((door) => keys.add(positionKey(door)));
  }

  const opened = currentOpenedKeys();
  opened.forEach((tileKey) => keys.add(tileKey));
  visibleWalkable().forEach((tileKey) => keys.add(tileKey));
  for (const door of state.dungeon?.doors ?? []) {
    if (doorIsVisibleToPlayers(door) && adjacentCells(door).some((cell) => opened.has(positionKey(cell)))) {
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
    const visibleCorridors = visibleWalkable();
    return adjacentCells(position).some((cell) => currentOpenedKeys().has(positionKey(cell)) || visibleCorridors.has(positionKey(cell)));
  }
  if (corridorTiles().has(tileKey)) {
    return adjacentCells(position).some((cell) => currentOpenedKeys().has(positionKey(cell)));
  }
  return (state.dungeon?.rooms ?? []).some((room) => currentDiscoveredRoomIds().has(room.id) && roomHasCell(room, position));
}

const lightLevels = Object.freeze({
  darkness: "darkness",
  dim: "dim",
  bright: "bright",
});

const lightLevelRank = Object.freeze({
  [lightLevels.darkness]: 0,
  [lightLevels.dim]: 1,
  [lightLevels.bright]: 2,
});

const magicalDarknessSpellIds = new Set(["darkness", "maddening-darkness", "hunger-of-hadar"]);

function normalizeLightLevel(value, fallback = lightLevels.darkness) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (normalized === lightLevels.bright || normalized === "bright-light") return lightLevels.bright;
  if (normalized === lightLevels.dim || normalized === "dim-light") return lightLevels.dim;
  if (normalized === lightLevels.darkness || normalized === "dark" || normalized === "magical-darkness") return lightLevels.darkness;
  return fallback;
}

function lightRadiusSquares(value, fallback = 0) {
  const radius = Number(value);
  return Number.isFinite(radius) ? Math.max(0, Math.floor(radius)) : fallback;
}

function lightRadiusFeetToSquares(value, fallback = 0) {
  const radius = Number(value);
  return Number.isFinite(radius) ? Math.max(0, Math.floor(radius / feetPerSquare)) : fallback;
}

function normalizedLightSource(rawSource = {}, fallback = {}) {
  const raw = rawSource.lightSource ?? rawSource.emitsLight ?? rawSource;
  const legacyRadius = lightRadiusSquares(raw.radius, 0);
  const brightRadius = lightRadiusSquares(
    raw.brightRadius ?? raw.brightRadiusSquares,
    lightRadiusFeetToSquares(raw.brightRadiusFeet, lightRadiusFeetToSquares(raw.brightFeet, 0)),
  );
  const dimRadius = lightRadiusSquares(
    raw.dimRadius ?? raw.dimRadiusSquares,
    lightRadiusFeetToSquares(raw.dimRadiusFeet, lightRadiusFeetToSquares(raw.dimFeet, legacyRadius || brightRadius)),
  );
  const origin = raw.origin ?? raw.position ?? fallback.origin ?? fallback.position;
  if (!origin && !Array.isArray(raw.cells) && !Array.isArray(fallback.cells)) return null;
  const source = {
    id: raw.id ?? fallback.id ?? `light-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    origin: origin ? { x: origin.x, y: origin.y } : null,
    cells: Array.isArray(raw.cells) ? raw.cells.map((cell) => ({ x: cell.x, y: cell.y })) : Array.isArray(fallback.cells) ? fallback.cells.map((cell) => ({ x: cell.x, y: cell.y })) : null,
    brightRadius,
    dimRadius: Math.max(dimRadius, brightRadius),
    color: raw.color ?? fallback.color ?? "#f6d47a",
    sourceType: raw.sourceType ?? raw.type ?? fallback.sourceType ?? "light",
    magical: Boolean(raw.magical ?? fallback.magical),
    suppressible: raw.suppressible ?? fallback.suppressible ?? true,
    suppressesMagicalDarkness: Boolean(raw.suppressesMagicalDarkness ?? raw.dispelsMagicalDarkness ?? fallback.suppressesMagicalDarkness),
    dispelsMagicalDarkness: Boolean(raw.dispelsMagicalDarkness ?? fallback.dispelsMagicalDarkness),
    magicalDarkness: Boolean(raw.magicalDarkness ?? fallback.magicalDarkness),
    ownerId: raw.ownerId ?? fallback.ownerId ?? null,
    areaId: raw.areaId ?? fallback.areaId ?? null,
    label: raw.label ?? fallback.label ?? raw.name ?? fallback.name ?? null,
  };
  if (!source.magicalDarkness && source.brightRadius <= 0 && source.dimRadius <= 0 && !source.cells) return null;
  return source;
}

function lightSourceFromStatusEffect(fighter, effect) {
  const explicit = effect?.emitsLight ?? effect?.lightSource;
  if (explicit) {
    if (effect.lightItemId) {
      const requiredSlots = Array.isArray(effect.requiredSlots) ? effect.requiredSlots : [];
      const equipped = requiredSlots.length
        ? requiredSlots.some((slotId) => fighter.equipment?.[slotId] === effect.lightItemId)
        : Object.values(fighter.equipment ?? {}).includes(effect.lightItemId);
      if (!equipped) return null;
    }
    return normalizedLightSource(explicit, {
      id: `${fighter.id}:${effect.id ?? effect.label ?? "status-light"}`,
      origin: fighter.position,
      sourceType: "actor",
      ownerId: fighter.id,
      magical: Boolean(effect.magical),
      label: effect.label,
    });
  }

  if (effect?.id === "light") {
    return normalizedLightSource(
      { brightRadiusFeet: 20, dimRadiusFeet: 40, magical: true, color: "#ffe8a3", label: effect.label ?? "Light" },
      { id: `${fighter.id}:light`, origin: fighter.position, sourceType: "spell", ownerId: fighter.id },
    );
  }
  if (effect?.id === "dancing-lights") {
    return normalizedLightSource(
      { brightRadiusFeet: 0, dimRadiusFeet: 10, magical: true, color: "#9ee7ff", label: effect.label ?? "Dancing Lights" },
      { id: `${fighter.id}:dancing-lights`, origin: fighter.position, sourceType: "spell", ownerId: fighter.id },
    );
  }
  if (effect?.id === "daylight") {
    return normalizedLightSource(
      { brightRadiusFeet: 60, dimRadiusFeet: 120, magical: true, color: "#fff6c7", label: effect.label ?? "Daylight", suppressesMagicalDarkness: true },
      { id: `${fighter.id}:daylight`, origin: fighter.position, sourceType: "spell", ownerId: fighter.id },
    );
  }
  return null;
}

function lightSourceFromItem(fighter, item, index, location) {
  const explicit = item?.emitsLight ?? item?.lightSource ?? item?.light;
  if (!explicit || explicit.lit === false || item.lit === false || item.active === false) return null;
  return normalizedLightSource(explicit, {
    id: `${fighter.id}:${location}:${item.id ?? item.itemId ?? item.name ?? index}`,
    origin: fighter.position,
    sourceType: "item",
    ownerId: fighter.id,
    label: item.name,
  });
}

function actorLightSources() {
  const sources = [];
  for (const fighter of Object.values(state.fighters ?? {})) {
    if (!fighter?.position || !fighter.alive || fighter.dead) continue;
    for (const effect of fighter.statusEffects ?? []) {
      const source = lightSourceFromStatusEffect(fighter, effect);
      if (source) sources.push(source);
    }
    const inventoryItems = Array.isArray(fighter.inventory) ? fighter.inventory : fighter.inventory?.items ?? [];
    const carriedItems = [
      ...Object.entries(fighter.equipment ?? {}).map(([slot, itemId], index) => ({ item: inventoryItems.find((item) => item.id === itemId), index, location: `equipment:${slot}` })),
    ].filter((entry) => entry.item);
    for (const { item, index, location } of carriedItems) {
      const source = lightSourceFromItem(fighter, item, index, location);
      if (source) sources.push(source);
    }
  }
  return sources;
}

function objectLightSources() {
  const sources = [];
  for (const object of state.dungeonObjects ?? []) {
    if (!object || object.destroyed || object.spent) continue;
    const cells = objectCells(object);
    if (!cells.length) continue;
    const origin = cells[Math.floor(cells.length / 2)];
    for (const component of objectComponents(object).filter((entry) => entry.type === "lightSource")) {
      const source = normalizedLightSource(component, {
        id: `${object.id ?? object.type}:light`,
        origin,
        cells,
        sourceType: "furniture",
        label: objectTemplate(object.type)?.name ?? object.type,
        color: component.color ?? "#7dd3fc",
      });
      if (source) sources.push(source);
    }
  }
  return sources;
}

function persistentSpellLightSources() {
  const sources = [];
  for (const area of ensureSpellAreas()) {
    const spell = getContentDefinition("spells", area.spellId);
    if (!spell) continue;
    const areaCells = persistentAreaCells(area);
    if (magicalDarknessSpellIds.has(area.spellId)) {
      const source = normalizedLightSource(
        {
          cells: areaCells,
          magicalDarkness: true,
          magical: true,
          color: area.spellId === "maddening-darkness" ? "#5b1b8d" : "#15111f",
          label: area.spellName ?? spell.name,
        },
        { id: area.id, origin: area.position, sourceType: "darkness", areaId: area.id },
      );
      if (source) sources.push(source);
      continue;
    }

    const explicit = spell.lightSource ?? spell.emitsLight ?? spell.effect?.lightSource ?? spell.effect?.emitsLight;
    if (explicit) {
      const source = normalizedLightSource(explicit, {
        id: area.id,
        origin: area.position,
        cells: explicit.cellsFromArea ? areaCells : null,
        sourceType: "spell",
        areaId: area.id,
        magical: true,
        label: area.spellName ?? spell.name,
      });
      if (source) sources.push(source);
    }
  }
  return sources;
}

function ambientLightSources() {
  if (state.mode === "home") {
    return [{ id: "ambient:home", sourceType: "ambient", level: lightLevels.bright, label: "Home light" }];
  }
  const theme = getContentDefinition("themes", state?.themeId ?? defaultContent.theme);
  const sources = [];
  const dungeonLevel = state.dungeon?.ambientLight ?? theme?.ambientLight;
  if (dungeonLevel) {
    sources.push({ id: "ambient:dungeon", sourceType: "ambient", level: normalizeLightLevel(dungeonLevel), label: "Dungeon ambient light" });
  }
  for (const room of state.dungeon?.rooms ?? []) {
    if (!room.ambientLight) continue;
    sources.push({ id: `ambient:room:${room.id}`, sourceType: "ambient", level: normalizeLightLevel(room.ambientLight), roomId: room.id, label: room.name ?? room.id });
  }
  if (!sources.length) sources.push({ id: "ambient:default-darkness", sourceType: "ambient", level: lightLevels.darkness, label: "Default darkness" });
  return sources;
}

function currentAmbientLightForPosition(position) {
  if (state.mode === "home") return lightLevels.bright;
  const room = roomForPosition(position);
  const theme = getContentDefinition("themes", state?.themeId ?? defaultContent.theme);
  return normalizeLightLevel(room?.ambientLight ?? state.dungeon?.ambientLight ?? theme?.ambientLight, lightLevels.darkness);
}

function lightingCandidateTileKeys() {
  if (state.mode === "home") {
    const size = currentGridSize();
    return new Set(Array.from({ length: size * size }, (_, index) => positionKey({ x: index % size, y: Math.floor(index / size) })));
  }
  const keys = new Set((state.dungeon?.walkable ?? []).map(positionKey));
  for (const door of state.dungeon?.doors ?? []) {
    if (doorIsVisibleToPlayers(door)) keys.add(positionKey(door));
    if (door.corridor) keys.add(positionKey(door.corridor));
  }
  return keys;
}

function defaultLightingEntry(position) {
  const level = currentAmbientLightForPosition(position);
  return {
    key: positionKey(position),
    position: { ...position },
    level,
    ambientLevel: level,
    magicalDarkness: false,
    brightSources: [],
    dimSources: [],
    darknessSources: [],
  };
}

function lightEntryHasDarknessSuppressor(entry, sourceLookup) {
  return [...(entry?.brightSources ?? []), ...(entry?.dimSources ?? [])]
    .some((sourceId) => sourceLookup?.get(sourceId)?.suppressesMagicalDarkness);
}

function hasClearLightPath(from, to) {
  if (positionKey(from) === positionKey(to)) return true;
  const shootable = new Set((state.dungeon?.walkable ?? []).map(positionKey));

  lineOfSightBlockingObjectKeys().forEach((tileKey) => {
    shootable.delete(tileKey);
  });
  persistentSpellLineOfSightBlockingTileKeys().forEach((tileKey) => {
    shootable.delete(tileKey);
  });
  shootable.add(positionKey(from));
  shootable.add(positionKey(to));

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

function applyLightSourceToLightingMap(tiles, source, sourceLookup = null, floorKeys = null) {
  if (!source) return;
  const sourceId = source.id;
  if (source.magicalDarkness) {
    const cells = source.cells?.length ? source.cells : source.origin ? spellAreaCells(source.origin, { area: { shape: "circle", radiusFeet: source.dimRadius * feetPerSquare } }) : [];
    for (const cell of cells) {
      const key = positionKey(cell);
      const entry = tiles.get(key);
      if (!entry) continue;
      if (lightEntryHasDarknessSuppressor(entry, sourceLookup)) continue;
      entry.level = lightLevels.darkness;
      entry.magicalDarkness = true;
      entry.darknessSources.push(sourceId);
    }
    return;
  }

  if (source.cells?.length) {
    for (const cell of source.cells) {
      const key = positionKey(cell);
      const entry = tiles.get(key);
      if (!entry) continue;
      if (source.brightRadius > 0 || source.dimRadius <= 0) {
        if (lightLevelRank[entry.level] < lightLevelRank[lightLevels.bright]) entry.level = lightLevels.bright;
        entry.brightSources.push(sourceId);
      } else {
        if (lightLevelRank[entry.level] < lightLevelRank[lightLevels.dim]) entry.level = lightLevels.dim;
        entry.dimSources.push(sourceId);
      }
    }
  }

  if (!source.origin) return;
  const maxRadius = Math.max(source.brightRadius, source.dimRadius);
  if (maxRadius <= 0) return;
  const grid = currentGridSize();
  const candidateKeys = floorKeys ?? lightingCandidateTileKeys();
  for (let y = source.origin.y - maxRadius; y <= source.origin.y + maxRadius; y += 1) {
    for (let x = source.origin.x - maxRadius; x <= source.origin.x + maxRadius; x += 1) {
      const cell = { x, y };
      const key = positionKey(cell);
      if (!window.DungeonGrid.isInsideGrid(cell, grid) || !candidateKeys.has(key) || !tiles.has(key)) continue;
      const radius = distance(cell, source.origin);
      if (radius > maxRadius || !hasClearLightPath(source.origin, cell)) continue;
      const entry = tiles.get(key);
      if (radius <= source.brightRadius) {
        if (lightLevelRank[entry.level] < lightLevelRank[lightLevels.bright]) entry.level = lightLevels.bright;
        entry.brightSources.push(sourceId);
      } else if (radius <= source.dimRadius) {
        if (lightLevelRank[entry.level] < lightLevelRank[lightLevels.dim]) entry.level = lightLevels.dim;
        entry.dimSources.push(sourceId);
      }
    }
  }
}

function collectLightSources() {
  return [
    ...ambientLightSources(),
    ...objectLightSources(),
    ...actorLightSources(),
    ...persistentSpellLightSources(),
  ];
}

let cachedLightingMapSignature = "";
let cachedLightingMap = null;

function lightSourceSignature(source) {
  const origin = source.origin ? `${source.origin.x},${source.origin.y}` : "";
  const cells = source.cells?.length ? source.cells.map((cell) => `${cell.x},${cell.y}`).join(";") : "";
  return [
    source.id,
    source.sourceType,
    origin,
    cells,
    source.brightRadius,
    source.dimRadius,
    source.color,
    source.magicalDarkness ? 1 : 0,
    source.suppressesMagicalDarkness ? 1 : 0,
  ].join(":");
}

function lightingMapSignature(sources, candidateKeys) {
  const doorSignature = (state.dungeon?.doors ?? []).map((door) => `${door.x},${door.y}:${door.open ? 1 : 0}:${door.locked ? 1 : 0}:${door.hidden ? 1 : 0}:${door.discovered ? 1 : 0}`).sort().join(";");
  const blockerSignature = [
    ...lineOfSightBlockingObjectKeys(),
    ...persistentSpellLineOfSightBlockingTileKeys(),
  ].sort().join(";");
  return [
    state.mode,
    state.themeId ?? "",
    state.dungeon?.id ?? "",
    state.room?.id ?? "",
    currentGridSize(),
    [...candidateKeys].sort().join(";"),
    doorSignature,
    blockerSignature,
    sources.map(lightSourceSignature).sort().join("|"),
  ].join("||");
}

function currentLightingMap() {
  const candidateKeys = lightingCandidateTileKeys();
  const sources = collectLightSources();
  const signature = lightingMapSignature(sources, candidateKeys);
  if (cachedLightingMap && cachedLightingMapSignature === signature) return cachedLightingMap;

  const tiles = new Map();
  for (const tileKey of candidateKeys) {
    const position = positionFromKey(tileKey);
    tiles.set(tileKey, defaultLightingEntry(position));
  }

  const sourceLookup = new Map(sources.map((source) => [source.id, source]));
  sources.filter((source) => source.sourceType !== "ambient" && !source.magicalDarkness).forEach((source) => applyLightSourceToLightingMap(tiles, source, sourceLookup, candidateKeys));
  sources.filter((source) => source.magicalDarkness).forEach((source) => applyLightSourceToLightingMap(tiles, source, sourceLookup, candidateKeys));

  cachedLightingMapSignature = signature;
  cachedLightingMap = { tiles, sources };
  return cachedLightingMap;
}

function lightingAtPosition(position, lightingMap = currentLightingMap()) {
  if (!position) return null;
  return lightingMap.tiles.get(positionKey(position)) ?? defaultLightingEntry(position);
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

function visibleWalkable(fighter = null) {
  const known = new Set();
  const openedKeys = currentOpenedKeys();
  const discovered = currentDiscoveredRoomIds();
  for (const room of state.dungeon?.rooms ?? []) {
    if (discovered.has(room.id)) {
      room.cells.forEach((cell) => known.add(positionKey(cell)));
      visibleRoomDoors(room).forEach((door) => known.add(positionKey(door)));
    }
  }
  const corridorKeys = corridorTiles();
  openedKeys.forEach((tileKey) => {
    known.add(tileKey);
    if (corridorKeys.has(tileKey)) {
      adjacentCells(positionFromKey(tileKey)).forEach((cell) => {
        const adjacentKey = positionKey(cell);
        if (corridorKeys.has(adjacentKey)) known.add(adjacentKey);
      });
    }
  });
  for (const door of state.dungeon?.doors ?? []) {
    if (doorIsVisibleToPlayers(door) && adjacentCells(door).some((cell) => openedKeys.has(positionKey(cell)))) {
      known.add(positionKey(door));
    }
  }
  blockingObjectKeys(fighter).forEach((tileKey) => known.delete(tileKey));
  return known;
}

function doorAt(position) {
  const tileKey = positionKey(position);
  return (state.dungeon?.doors ?? []).find((door) => positionKey(door) === tileKey && doorIsVisibleToPlayers(door)) ?? null;
}

function doorPassageBetween(from, to) {
  return (state.dungeon?.doors ?? []).find((door) => {
    if (!doorIsVisibleToPlayers(door)) return false;
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
  if (corridorIds.length === 0) {
    return corridorTiles().has(positionKey(from)) && corridorTiles().has(positionKey(to));
  }

  const activeCorridors = activeCorridorIdsAt(fighter, from, path);
  if (activeCorridors.length === 0) return true;
  const junctionCorridors = corridorPassageIdsAtPosition(from);
  if (junctionCorridors.length > 1 && corridorIds.some((id) => junctionCorridors.includes(id))) return true;
  return corridorIds.some((id) => activeCorridors.includes(id));
}

function hasVisibleWallEdge(position, delta, visibleWallKeys = exposedWallKeys(), visibleFloorKeys = visibleFloorEdgeKeys()) {
  const neighbor = { x: position.x + delta.x, y: position.y + delta.y };
  if (!window.DungeonGrid.isInsideGrid(neighbor, currentGridSize())) return false;
  const walkable = dungeonFloorKeys();
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
  const walkable = dungeonFloorKeys();
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
  return (state.dungeon?.doors ?? []).filter((door) => door.corridor && positionKey(door.corridor) === tileKey && doorIsVisibleToPlayers(door));
}

function visibleMonsters() {
  const activeTiles = activeTileKeys();
  const activeInitiativeIds = new Set((state.initiative ?? []).map((entry) => entry.fighterId));
  return aliveMonsters().filter((monster) =>
    (activeInitiativeIds.has(monster.id) || window.DungeonGrid.fighterCells(monster).some((cell) => activeTiles.has(positionKey(cell)))) &&
      window.DungeonGrid.fighterCells(monster).some(isKnownTile),
  );
}

function encounterRelevantMonsters() {
  const activeTiles = activeTileKeys();
  const activeInitiativeIds = new Set((state.initiative ?? []).map((entry) => entry.fighterId));
  return aliveMonsters().filter((monster) =>
    (activeInitiativeIds.has(monster.id) || window.DungeonGrid.fighterCells(monster).some((cell) => activeTiles.has(positionKey(cell)))) &&
      window.DungeonGrid.fighterCells(monster).some(isKnownTile),
  );
}

function monsterHasLineOfSightToHero(monster) {
  return partyHeroes().some((hero) => monsterCanTargetHero(monster, hero));
}

function partyHeroInMonsterRoom(monster) {
  const monsterRoom = roomForPosition(monster?.position);
  if (!monsterRoom) return true;
  return partyHeroes().some((hero) => roomForPosition(hero.position)?.id === monsterRoom.id);
}

function monsterThreatensHeroes(monster) {
  if (fledMonsterIds.has(monster.id)) {
    return partyHeroInMonsterRoom(monster);
  }

  const monsterRoom = roomForPosition(monster.position);
  if (!monsterRoom) return true;
  return partyHeroes().some((hero) => {
    if (!monsterCanTargetHero(monster, hero)) return false;
    const heroRoom = roomForPosition(hero.position);
    if (!heroRoom) return !fighterIsStealthing(hero) || (hero.stealth?.total ?? 0) <= passivePerception(monster, hero.position);
    if (heroRoom.id !== monsterRoom.id) return false;
    return !fighterIsStealthing(hero) || (hero.stealth?.total ?? 0) <= passivePerception(monster, hero.position);
  });
}

function threateningMonsters() {
  const monsters = encounterRelevantMonsters();
  if (fledMonsterIds.size === 0) return monsters;
  return monsters.filter((monster) => {
    if (!fledMonsterIds.has(monster.id)) return true;
    return partyHeroInMonsterRoom(monster);
  });
}

function combatMonsters() {
  const heroIds = new Set([...(state.party?.heroIds ?? ["hero"]), ...(state.party?.rosterIds ?? [])]);
  return state.initiative
    .map((entry) => state.fighters[entry.fighterId])
    .filter((fighter) => {
      if (!fighter || heroIds.has(fighter.id) || !fighter.alive) return false;
      const dominated = (fighter.statusEffects ?? []).some((effect) => effect.id === "dominated");
      return dominated || (fighter.team !== "heroes" && !fighter.friendly);
    });
}

function combatNeedsHeroTurns() {
  return combatMonsters().length > 0 || unstableDyingPartyHeroes().length > 0;
}

function hasMeleeAccess(attacker, defender) {
  for (const attackerCell of window.DungeonGrid.fighterCells(attacker)) {
    for (const defenderCell of window.DungeonGrid.fighterCells(defender)) {
      const dx = Math.abs(attackerCell.x - defenderCell.x);
      const dy = Math.abs(attackerCell.y - defenderCell.y);
      if (Math.max(dx, dy) !== 1) continue;
      if (dx + dy === 1 && canTraverseMovementEdge(attacker, attackerCell, defenderCell, [])) return true;

      const cornerA = { x: defenderCell.x, y: attackerCell.y };
      const cornerB = { x: attackerCell.x, y: defenderCell.y };
      const walkable = dungeonFloorKeys();
      const canReachViaA =
        walkable.has(positionKey(cornerA)) &&
        canTraverseMovementEdge(attacker, attackerCell, cornerA, []) &&
        canTraverseMovementEdge(attacker, cornerA, defenderCell, []);
      const canReachViaB =
        walkable.has(positionKey(cornerB)) &&
        canTraverseMovementEdge(attacker, attackerCell, cornerB, []) &&
        canTraverseMovementEdge(attacker, cornerB, defenderCell, []);
      if (canReachViaA || canReachViaB) return true;
    }
  }
  return false;
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

function attackGridDistanceBetweenFighters(attacker, defender) {
  return Math.min(
    ...window.DungeonGrid.fighterCells(attacker).flatMap((attackerCell) =>
      window.DungeonGrid.fighterCells(defender).map((defenderCell) => attackGridDistance(attackerCell, defenderCell)),
    ),
  );
}

function attackGridDistanceFromFighterToPosition(fighter, position) {
  return Math.min(...window.DungeonGrid.fighterCells(fighter).map((cell) => attackGridDistance(cell, position)));
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
  persistentSpellLineOfSightBlockingTileKeys().forEach((tileKey) => {
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

function hasClearLineOfSightBetweenFighters(attacker, defender) {
  return window.DungeonGrid.fighterCells(attacker).some((attackerCell) =>
    window.DungeonGrid.fighterCells(defender).some((defenderCell) => hasClearLineOfSight(attackerCell, defenderCell)),
  );
}

function isWithinAttackDistance(attacker, defender) {
  const range = attackRangeSquares(attacker);
  if (range <= 1) return hasMeleeAccess(attacker, defender);
  return attackGridDistanceBetweenFighters(attacker, defender) <= range;
}

function isInAttackRange(attacker, defender) {
  if (!isWithinAttackDistance(attacker, defender)) return false;
  if (attackRangeSquares(attacker) > 1) return hasClearLineOfSightBetweenFighters(attacker, defender);
  return !attackUsesRangedProfile(attacker) || hasClearLineOfSightBetweenFighters(attacker, defender);
}

function isInAttackRangeWithProfile(attacker, defender, profile) {
  const range = profileRangeSquares(profile);
  const withinDistance = range <= 1 ? hasMeleeAccess(attacker, defender) : attackGridDistanceBetweenFighters(attacker, defender) <= range;
  if (!withinDistance) return false;
  if (range > 1) return hasClearLineOfSightBetweenFighters(attacker, defender);
  return profile.range?.kind !== "ranged" || hasClearLineOfSightBetweenFighters(attacker, defender);
}

function objectTargetName(object) {
  return objectTemplate(object?.type)?.name ?? object?.name ?? "Object";
}

function objectTargetPosition(object, attacker = activeFighter()) {
  const cells = objectCells(object);
  if (!cells.length) return object?.position;
  if (!attacker?.position) return cells[0];
  return cells.slice().sort((a, b) => attackGridDistanceFromFighterToPosition(attacker, a) - attackGridDistanceFromFighterToPosition(attacker, b))[0];
}

function isObjectInAttackRangeWithProfile(attacker, object, profile) {
  if (!objectIsDestructible(object)) return false;
  const range = profileRangeSquares(profile);
  const cells = objectCells(object);
  if (range <= 1) {
    return cells.some((cell) => attackGridDistanceFromFighterToPosition(attacker, cell) <= 1);
  }
  return cells.some((cell) => attackGridDistanceFromFighterToPosition(attacker, cell) <= range && window.DungeonGrid.fighterCells(attacker).some((attackerCell) => hasClearLineOfSight(attackerCell, cell)));
}

function destructibleObjectTargets(hero = activeFighter()) {
  if (state.mode !== "combat" || !hero || !isPlayerControlledPartyFighter(hero)) return [];
  const profiles = attackWeaponChoicesForFighter(hero).map((choice) => damageProfile(hero, { weapon: choice.options?.weapon }));
  return (state.dungeonObjects ?? [])
    .filter((object) => objectIsDestructible(ensureDestructibleObjectState(object)))
    .filter((object) => objectCells(object).some((cell) => isKnownTile(cell)))
    .filter((object) => profiles.some((profile) => isObjectInAttackRangeWithProfile(hero, object, profile)));
}

function attackTargets() {
  const hero = activeFighter();
  if (state.mode !== "combat" || !hero || !isPlayerControlledPartyFighter(hero) || combatMonsters().length === 0) return [];
  return [
    ...visibleMonsters().filter((monster) => attackWeaponChoicesForFighter(hero).some((choice) => isInAttackRangeWithProfile(hero, monster, damageProfile(hero, { weapon: choice.options?.weapon })))),
    ...destructibleObjectTargets(hero),
  ];
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
  return Boolean(monster?.alive && hero && isPlayerControlledPartyFighter(hero) && attackWeaponChoicesForFighter(hero).some((choice) => isInAttackRangeWithProfile(hero, monster, damageProfile(hero, { weapon: choice.options?.weapon }))));
}

function selectedHeroCanTargetObject(object) {
  const hero = activeFighter();
  return Boolean(hero && isPlayerControlledPartyFighter(hero) && attackWeaponChoicesForFighter(hero).some((choice) => isObjectInAttackRangeWithProfile(hero, object, damageProfile(hero, { weapon: choice.options?.weapon }))));
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
  if (state.mode !== "combat" || !fighter?.hasBonusAction || !heroCanAct(fighter) || !isPlayerControlledPartyFighter(fighter)) return false;
  const main = weaponFromSlot(fighter, "mainHand");
  const offHand = weaponFromSlot(fighter, "offHand");
  if (!main?.damage || !offHand?.damage) return false;
  if (!fighterHasFeat(fighter, "dual-wielder") && (!main.properties?.includes("light") || !offHand.properties?.includes("light"))) return false;
  if (fighterHasFeat(fighter, "dual-wielder") && (main.properties?.includes("two-handed") || offHand.properties?.includes("two-handed") || weaponIsRanged(main) || weaponIsRanged(offHand))) return false;
  const target = attackTarget();
  if (!target) return false;
  const profile = damageProfile(fighter, { weapon: offHand, includeDamageModifier: false });
  if (objectIsDestructible(target)) return isObjectInAttackRangeWithProfile(fighter, target, profile);
  return isInAttackRangeWithProfile(fighter, target, profile);
}

function nearestVisibleMonster() {
  const hero = activeHero();
  return visibleMonsters().sort((a, b) => attackGridDistanceBetweenFighters(a, hero) - attackGridDistanceBetweenFighters(b, hero))[0] ?? null;
}

function attackBonusForAbility(fighter, ability) {
  const weapon = activeWeapon(fighter);
  const magicBonus = (activeItemMagic(fighter, weapon)?.attackBonus ?? 0) + magicEffects(fighter).attackBonus;
  if (isPartyHeroId(fighter?.id)) return abilityMod(fighter, ability) + proficiencyBonus(fighter) + magicBonus;
  const baseBonus = fighter.attackBonus ?? 0;
  const baseAbility = fighter.baseAttackAbilityMod ?? abilityMod(fighter, "str");
  return baseBonus - baseAbility + abilityMod(fighter, ability) + magicBonus;
}

function hostileTo(fighter, candidate) {
  if (!candidate.alive || candidate.id === fighter.id) return false;
  const heroIds = new Set(state.party?.heroIds ?? ["hero"]);
  const fighterIsHero = heroIds.has(fighter.id) || fighter.team === "heroes" || fighter.friendly;
  const candidateIsHero = heroIds.has(candidate.id) || candidate.team === "heroes" || candidate.friendly;
  return fighterIsHero ? !candidateIsHero : candidateIsHero;
}

function opportunityThreatensPosition(attacker, defender, position) {
  const profile = opportunityAttackProfile(attacker);
  const range = profileRangeSquares(profile);
  const movedDefender = { ...defender, position };
  const attackerCells = new Set(window.DungeonGrid.fighterCells(attacker).map(positionKey));
  const overlapsAttacker = window.DungeonGrid.fighterCells(movedDefender).some((cell) => attackerCells.has(positionKey(cell)));
  if (overlapsAttacker) return true;
  const threatened = attackGridDistanceBetweenFighters(attacker, movedDefender) <= range;
  if (!threatened) return false;
  if (range > 1) return true;
  return hasMeleeAccess(attacker, movedDefender);
}

function canOpportunityAttack(attacker, defender, from, to) {
  if (state.mode !== "combat" || !heroCanAct(attacker) || !heroCanAct(defender) || !hostileTo(attacker, defender)) return false;
  if (!hasReactionAvailable(attacker) || defender.disengaged) return false;
  if (fighterHasFeat(defender, "mobile") && (defender.mobileNoOpportunityFrom ?? []).includes(attacker.id)) return false;
  const hadThreat = opportunityThreatensPosition(attacker, defender, from);
  const keepsThreat = opportunityThreatensPosition(attacker, defender, to);
  return hadThreat && !keepsThreat;
}

async function shouldTakeOpportunityAttack(attacker, defender) {
  if (!isPlayerControlledPartyFighter(attacker)) return true;
  const profile = opportunityAttackProfile(attacker);
  return showReactionPrompt({
    actor: attacker,
    title: "Opportunity Attack",
    message: `${defender.name} is leaving ${attacker.name}'s reach. Use your reaction to attack with ${profile.weaponName}?`,
    acceptLabel: "Attack",
    declineLabel: "Skip",
  });
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
    Object.values(state.fighters ?? {})
      .filter((fighter) => fighter?.barrowCrownDustAfterCombat && fighter.alive)
      .forEach((fighter) => {
        fighter.hp = 0;
        fighter.alive = false;
        fighter.dead = true;
        addLog(`${fighter.name} turns to dust as the Crownshard's stolen command ends.`, "important");
    });
    endCurrentEncounter();
    addLog("The room falls quiet. Exploration resumes.", "important");
    if (typeof handleFightingPitWaveClear === "function" && typeof fightingPitCurrentRun === "function" && fightingPitCurrentRun()) await handleFightingPitWaveClear();
  }
  return true;
}

async function maybeFinishEncounterAfterHeroRecovery() {
  if (state.mode !== "combat" || !state.combatStarted || combatMonsters().length > 0) return false;
  if (unstableDyingPartyHeroes().length > 0 || partyDefeatedOrDying()) return false;
  return finishEncounterAfterLastMonsterFalls();
}

function defenderGrantsAttackAdvantage(defender) {
  return Boolean((defender?.statusEffects ?? []).some((effect) => effect.incomingAttackAdvantage));
}

function defenderGrantsMeleeAutoCritical(defender) {
  return Boolean((defender?.statusEffects ?? []).some((effect) => effect.meleeAutoCritical));
}

function applyMeleeAutoCritical(criticalResult, attacker, defender, meleeAttack) {
  if (!criticalResult || !meleeAttack || !defenderGrantsMeleeAutoCritical(defender) || !hasMeleeAccess(attacker, defender)) return criticalResult;
  if (criticalResult.isCritical && criticalResult.doublesDamage) return criticalResult;
  criticalResult.isCritical = true;
  criticalResult.doublesDamage = true;
  criticalResult.note = [criticalResult.note, "Hit from within 5 ft against a helpless target is a critical hit."].filter(Boolean).join(" ");
  return criticalResult;
}

async function opportunityAttack(attacker, defender) {
  if (!consumeReaction(attacker, "an opportunity attack")) return;
  const profile = opportunityAttackProfile(attacker);
  playSoundEffect("meleeAttack");
  const targetReckless = defenderGrantsAttackAdvantage(defender);
  const lightContext = attackLightContext(attacker, defender);
  const hasDisadvantage = defender.dodging || lightContext.disadvantage;
  const hasAdvantage = targetReckless;
  const attackRollResult = rollD20ForFighter(attacker, { advantage: hasAdvantage && !hasDisadvantage, disadvantage: hasDisadvantage && !hasAdvantage });
  const attackRolls = attackRollResult.rolls;
  const criticalResult = applyMeleeAutoCritical(resolveMonsterHeroCritical(attacker, defender, attackRollResult.roll), attacker, defender, true);
  const attackRoll = criticalResult.attackRoll;
  const currentAttackBonus = profile.weapon ? attackBonusForWeapon(attacker, profile.weapon) : attackBonusForAbility(attacker, profile.attackAbility ?? "str");
  let defenderAc = armorClass(defender);
  let totalAttack = attackRoll + currentAttackBonus;
  const isCritical = criticalResult.isCritical;
  const doublesDamage = criticalResult.doublesDamage;
  const inspiration = await maybeUseBardicAttackDie(attacker, totalAttack, defenderAc);
  totalAttack = inspiration.totalAttack;
  const bendLuck = await maybeUseBendLuckAttack(attacker, totalAttack, defenderAc);
  totalAttack = bendLuck.totalAttack;
  const hitReaction = attackRoll !== 1 && totalAttack >= defenderAc ? await maybeUseHitReactionDefenses(attacker, defender, totalAttack, currentAttackBonus, defenderAc) : { totalAttack, acBonus: 0, blocked: false, resistance: false };
  totalAttack = hitReaction.totalAttack;
  defenderAc += hitReaction.acBonus ?? 0;
  const shieldBlocked = !hitReaction.blocked && attackRoll !== 1 && totalAttack >= defenderAc ? await maybeUseShieldReaction(defender, attacker, totalAttack, defenderAc) : false;
  const unfairBargainHit = !hitReaction.blocked && !shieldBlocked && attackRoll !== 1 && totalAttack < defenderAc ? await maybeUseUnfairBargain(attacker, totalAttack, defenderAc) : false;
  const isMiss = attackRoll === 1 || hitReaction.blocked || (!criticalResult.forcedHit && !unfairBargainHit && totalAttack < defenderAc) || shieldBlocked;
  const attackRollText = attackRolls.length > 1 ? `${attackRolls.join(" / ")} -> ${attackRoll}` : attackRoll;

  addLog(
    `${attacker.name} makes an opportunity attack with ${profile.weaponName}${hasAdvantage && !hasDisadvantage ? " with advantage because the target attacked recklessly" : ""}${hasDisadvantage && !hasAdvantage ? " with disadvantage" : ""}${lightContext.disadvantage && !hasAdvantage ? attackLightDisadvantageText(lightContext) : ""}: d20 ${attackRollText} ${abilityLabel(currentAttackBonus)} = ${totalAttack} vs AC ${defenderAc}.${criticalResult.note ? ` ${criticalResult.note}` : ""}`,
    "important",
  );
  addAdminLog(`${attacker.name} opportunity attack breakdown vs ${defender.name}: ${d20RollDetail(attackRollResult)}${criticalResult.attackRoll !== attackRollResult.roll ? ` -> ${d20ModeLabels.karmic} d20 ${attackRoll}` : ""} + attack ${abilityLabel(currentAttackBonus)}${inspiration.used ? ` + inspiration ${inspiration.roll}` : ""} = ${totalAttack}; target AC ${defenderAc}; ${isMiss ? "miss" : isCritical ? "critical hit" : "hit"}${criticalResult.note ? `; ${criticalResult.note}` : ""}${lightContext.note ? `; ${lightContext.note}` : ""}.`);

  if (isMiss) {
    addLog(attackRoll === 1 ? "Natural 1. The opportunity attack misses badly." : `${defender.name} slips away.`);
    recordD20OutcomeForFighter(attacker, false);
    await maybeUseRiposte(defender, attacker, true);
    await maybeUseStoneRuneAfterAttack(attacker, defender);
    return;
  }
  recordD20OutcomeForFighter(attacker, true);

  const damageRoll = profile.flat
    ? { total: profile.flat, rolls: [profile.flat] }
    : rollDice(profile.count * (doublesDamage ? 2 : 1), profile.sides);
  const packets = [
    {
      raw: Math.max(1, damageRoll.total + (profile.bonus ?? 0)),
      type: profile.type,
      label: `${damageRoll.rolls.join(" + ")} ${abilityLabel(profile.bonus ?? 0)} ${profile.type ?? "damage"}`,
    },
  ];
  for (const extra of profile.extraDamage ?? []) {
    const extraRoll = rollDice((extra.count ?? 1) * (doublesDamage ? 2 : 1), extra.sides ?? 4);
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
  addAdminLog(`${attacker.name} damage packets vs ${defender.name}: ${resolvedPackets.map((packet) => `${packet.label} => raw ${packet.raw}, final ${packet.damage}${packet.reason ? ` (${packet.reason})` : ""}`).join("; ")}.`);
  let totalDamage = resolvedPackets.reduce((sum, packet) => sum + packet.damage, 0);
  if (hitReaction.resistance) totalDamage = Math.floor(totalDamage / 2);
  totalDamage = await maybeUseUncannyDodge(defender, attacker, totalDamage);
  totalDamage = await maybeUseStoneEndurance(defender, totalDamage);
  totalDamage = await maybeUseBattleMasterParry(defender, attacker, totalDamage, true);
  totalDamage = await maybeUseProtectiveField(defender, totalDamage);
  applyDamageToFighter(defender, totalDamage);
  defender.lastDamagedById = attacker.id;
  if (fighterHasFeat(attacker, "sentinel") && defender.alive) {
    defender.movementLeft = 0;
    addLog(`${attacker.name}'s Sentinel stops ${defender.name}'s movement.`, "important");
  }
  await maybeUseSubclassAfterDamageReactions(defender, attacker, totalDamage, true);
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
  return (state.mode === "home" || (state.mode === "camp" && travelCampIsInn())) && hero?.alive && isPartyHeroId(hero.id) && !isAutonomousAlly(hero);
}

function partyHasBaseItem(itemId) {
  if (!itemId) return false;
  return partyHeroes().some((hero) => (hero.inventory?.items ?? []).some((item) => item.baseItemId === itemId || item.id === itemId)) ||
    (state.chest ?? []).some((item) => item.baseItemId === itemId || item.id === itemId);
}

function partyBaseItemCount(itemId) {
  if (!itemId) return 0;
  const partyItems = partyHeroes().flatMap((hero) => hero.inventory?.items ?? []);
  const allItems = [...partyItems, ...(state.chest ?? [])];
  return allItems.filter((item) => item.baseItemId === itemId || item.id === itemId).length;
}

function itemMatchesBaseId(item, itemId) {
  return Boolean(itemId) && (item?.baseItemId === itemId || item?.itemId === itemId || item?.id === itemId);
}

function consumeGoalItemsOnComplete() {
  const goal = state.customDungeon?.goal;
  if (!goal?.consumeOnComplete || !["collectItem", "collectItemCount"].includes(goal.type) || !goal.itemId) return 0;
  let remaining = goal.type === "collectItemCount" ? Math.max(1, Number(goal.count) || 1) : 1;
  let removed = 0;
  for (const hero of partyHeroes()) {
    if (remaining <= 0) break;
    for (const slot of equipmentSlots) {
      if (itemMatchesBaseId((hero.inventory?.items ?? []).find((item) => item.id === hero.equipment?.[slot.id]), goal.itemId)) {
        hero.equipment[slot.id] = null;
      }
    }
    const kept = [];
    for (const item of hero.inventory?.items ?? []) {
      if (remaining > 0 && itemMatchesBaseId(item, goal.itemId)) {
        remaining -= 1;
        removed += 1;
      } else {
        kept.push(item);
      }
    }
    hero.inventory.items = kept;
  }
  if (remaining > 0 && Array.isArray(state.chest)) {
    const kept = [];
    for (const item of state.chest) {
      if (remaining > 0 && itemMatchesBaseId(item, goal.itemId)) {
        remaining -= 1;
        removed += 1;
      } else {
        kept.push(item);
      }
    }
    state.chest = kept;
  }
  return removed;
}

let customStoryTriggerQueue = Promise.resolve();

function customStoryTriggerTitle(trigger, context = {}) {
  if (trigger.title) return trigger.title;
  if (trigger.event === "enterRoom") return context.room?.name ?? state.customDungeon?.name ?? "Dungeon Story";
  if (trigger.event === "killMonster") return context.monster?.name ?? "Victory";
  if (trigger.event === "inspectObject" || trigger.event === "openObject") {
    return objectTemplate(context.object?.type)?.name ?? state.customDungeon?.name ?? "Dungeon Story";
  }
  return state.customDungeon?.name ?? "Dungeon Story";
}

function customStoryTriggerMatches(trigger, event, context = {}) {
  if (!trigger || trigger.event !== event) return false;
  if (event === "enterRoom") return trigger.targetId === context.roomId;
  if (event === "inspectObject" || event === "openObject") return trigger.targetId === context.objectId;
  if (event === "killMonster") return trigger.targetId === context.monsterId;
  return false;
}

function triggerCustomDungeonStory(event, context = {}) {
  const customDungeon = state.customDungeon;
  const triggers = customDungeon?.storyTriggers ?? [];
  if (!triggers.length) return Promise.resolve(false);
  customDungeon.storyTriggerHistory ??= {};
  const matches = triggers.filter((trigger) => {
    if (!customStoryTriggerMatches(trigger, event, context)) return false;
    if (trigger.once !== false && customDungeon.storyTriggerHistory[trigger.id]) return false;
    return Boolean(trigger.text || trigger.images?.length);
  });
  if (!matches.length) return Promise.resolve(false);
  for (const trigger of matches) {
    if (trigger.once !== false) customDungeon.storyTriggerHistory[trigger.id] = true;
  }
  customStoryTriggerQueue = customStoryTriggerQueue.then(async () => {
    for (const trigger of matches) {
      await showDungeonStoryDialog({
        title: customStoryTriggerTitle(trigger, context),
        text: trigger.text,
        images: trigger.images ?? [],
        actionLabel: "Continue",
      });
    }
    return true;
  });
  return customStoryTriggerQueue;
}

function triggerMonsterDeathStory(monster) {
  if (!monster || isPartyHeroId(monster.id)) return;
  void triggerCustomDungeonStory("killMonster", { monsterId: monster.id, monster });
}

function customGoalStatus() {
  const goal = state.customDungeon?.goal;
  if (!goal || goal.type === "reachExit" || goal.type === "exit") return { met: true, text: "Reach the exit." };
  if (goal.type === "collectItem") {
    const item = getItemTemplate(goal.itemId);
    return {
      met: partyHasBaseItem(goal.itemId),
      text: `Collect ${item?.name ?? goal.itemId ?? "the required object"}.${goal.hint ? ` ${goal.hint}` : ""}`,
    };
  }
  if (goal.type === "collectItemCount") {
    const item = getItemTemplate(goal.itemId);
    const target = Math.max(1, Number(goal.count) || 1);
    const collected = partyBaseItemCount(goal.itemId);
    const itemName = item?.name ?? "marked item";
    return {
      met: collected >= target,
      text: `Collect ${target} ${itemName}${target === 1 ? "" : "s"} (${collected}/${target}).${goal.hint ? ` ${goal.hint}` : ""}`,
    };
  }
  if (goal.type === "killBoss") {
    return {
      met: !aliveMonsters().some((monster) => monster.customBoss || monster.id?.startsWith("boss-") || monster.tags?.includes("boss")),
      text: "Kill the boss.",
    };
  }
  if (goal.type === "killMonsterType") {
    const initial = state.customDungeon?.monsterSummary?.[goal.monsterId] ?? 0;
    const alive = aliveMonsters().filter((monster) => (monster.baseMonsterId ?? monster.templateId ?? monster.id) === goal.monsterId).length;
    const killed = Math.max(0, initial - alive);
    const target = Math.max(1, Number(goal.count) || 1);
    const monster = getMonsterTemplate(goal.monsterId);
    const monsterName = monster?.name ?? "marked foe";
    return {
      met: killed >= target,
      text: `Defeat ${target} ${monsterName}${target === 1 ? "" : "s"} (${killed}/${target}).`,
    };
  }
  if (goal.type === "escortNpc") {
    return { met: false, text: "Find the missing person and bring them safely to the exit." };
  }
  return { met: false, text: "Finish the marked objective before leaving." };
}

function dungeonGoalMet() {
  return customGoalStatus().met;
}

function checkDungeonCompletion(hero = activeHero()) {
  if (canHeroUseHomeExit(hero) && isExitPosition(hero.position)) {
    showHomeMenu();
    return true;
  }
  if (state.completed || !hero || !isExitPosition(hero.position)) return false;
  if (monstersInRoom(state.exit.roomId).length > 0) return false;
  if (!dungeonGoalMet()) {
    const status = customGoalStatus();
    if (state.lastExitGoalWarning !== status.text) {
      addLog(`The exit is not ready: ${status.text}`, "important");
      state.lastExitGoalWarning = status.text;
      renderLog();
    }
    return false;
  }

  const tokenAward = categoryForHeroLevel(hero.level ?? 1);
  for (const partyHero of partyHeroes()) {
    partyHero.inventory.heroTokens = (partyHero.inventory.heroTokens ?? 0) + tokenAward;
  }
  const consumedGoalItems = consumeGoalItemsOnComplete();
  playSoundEffect("exitReached");
  const outro = state.customDungeon?.outro;
  const finishDungeon = () => {
    const travelReturnCamp = state.travelReturnCamp ? cloneData(state.travelReturnCamp) : null;
    const completedContext = {
      themeId: state.themeId,
      campaignId: state.campaignId,
      campaignIndex: state.campaignIndex,
      travelReturnCamp,
      travelEventId: travelReturnCamp?.eventId ?? "",
      travelEventTitle: travelReturnCamp?.eventTitle ?? "",
      boardQuestId: travelReturnCamp?.boardQuestId ?? state.customDungeon?.settlementBoardQuestId ?? "",
      dungeonName: state.customDungeon?.name ?? state.dungeon?.name ?? "",
    };
    handleNpcDungeonComplete(completedContext);
    const completedCampaign = state.campaignId && state.campaignIndex ? { ...state.campaignProgress } : state.campaignProgress;
    const questFlags = { ...(state.questFlags ?? {}) };
    const partyResources = normalizePartyResources(state.partyResources ?? {});
    if (state.campaignId && state.campaignIndex) {
      completedCampaign[state.campaignId] = Math.max(completedCampaign[state.campaignId] ?? 0, state.campaignIndex);
    }
    if (state.customDungeon?.oneShotDungeonId) {
      questFlags.oneShotDungeonCompletions = {
        ...(questFlags.oneShotDungeonCompletions ?? {}),
        [state.customDungeon.oneShotDungeonId]: Date.now(),
      };
    }
    if (travelReturnCamp?.world && travelReturnCamp?.camp) {
      const world = window.DepthboundWorldTravel?.normalizeWorldState?.(travelReturnCamp.world) ?? travelReturnCamp.world;
      world.travelCamp = { ...travelReturnCamp.camp, active: true };
      if (world.travelCamp?.manualRoadBuild?.pendingDanger || travelReturnCamp.clearBlockedRoad) {
        world.travelCamp.manualRoadBuild = {
          ...world.travelCamp.manualRoadBuild,
          safe: true,
          pendingDanger: false,
          blockedReason: "",
          blockedDanger: null,
        };
      }
      if (travelReturnCamp.structureId) {
        world.visitedStructures = world.visitedStructures && typeof world.visitedStructures === "object" ? world.visitedStructures : {};
        const current = world.visitedStructures[travelReturnCamp.structureId] && typeof world.visitedStructures[travelReturnCamp.structureId] === "object"
          ? world.visitedStructures[travelReturnCamp.structureId]
          : { count: 1 };
        world.visitedStructures[travelReturnCamp.structureId] = {
          ...current,
          resolved: true,
          pending: false,
          cleared: true,
          clearedDay: normalizeWorldDay(state.worldDay),
          lastEventId: travelReturnCamp.eventId ?? current.lastEventId ?? "",
          lastEventTitle: travelReturnCamp.eventTitle ?? current.lastEventTitle ?? "",
          lastOutcome: "Cleared after a travel dungeon or fight.",
          lastResolvedDay: normalizeWorldDay(state.worldDay),
        };
      }
      state.questFlags = questFlags;
      const boardQuestCompletion = typeof completeSettlementBoardQuestForTravelReturn === "function"
        ? completeSettlementBoardQuestForTravelReturn(travelReturnCamp, questFlags)
        : null;
      const questFlagsAfterTravelWork = { ...(state.questFlags ?? {}) };
      const partyResourcesAfterTravelWork = normalizePartyResources(state.partyResources ?? {});
      const returningHeroes = rosterHeroes();
      const storedCoins = moveHeroCoinsToPartyPurse(returningHeroes);
      state = createHomeState(returningHeroes, state.chest ?? [], state.chestMoney ?? {}, {
        ...state.party,
        worldDay: normalizeWorldDay(state.worldDay),
        campaignProgress: completedCampaign,
        questFlags: questFlagsAfterTravelWork,
        partyResources: partyResourcesAfterTravelWork,
        partyTomes: state.partyTomes ?? [],
        home: state.home,
        monsterCompendium: state.monsterCompendium,
        world,
      });
      state.combatStarted = false;
      roomIsBuilt = false;
      addLog(`${hero.name} reaches the exit. The party returns to camp after ${travelReturnCamp.eventTitle ?? "the travel encounter"}.`, "important");
      if (boardQuestCompletion) {
        addLog(`${boardQuestCompletion.title} is complete. Return to ${boardQuestCompletion.sourceName} to claim ${priceText(boardQuestCompletion.rewardCp)}.`, "important");
      }
      if (storedCoins > 0) addLog(`${moneyText(cpToMoney(storedCoins))} is secured in the party purse.`, "important");
      if (consumedGoalItems) addLog(`${consumedGoalItems} goal item${consumedGoalItems === 1 ? " was" : "s were"} left behind.`, "important");
      render();
      showTravelCampMenu();
      window.DepthboundPlaytest?.syncNow?.();
      centerViewOnHero();
      return;
    }
    const returningHeroes = rosterHeroes();
    const storedCoins = moveHeroCoinsToPartyPurse(returningHeroes);
    state = createHomeState(returningHeroes, state.chest ?? [], state.chestMoney ?? {}, {
      ...state.party,
      worldDay: normalizeWorldDay(state.worldDay) + 1,
      campaignProgress: completedCampaign,
      questFlags,
      partyResources,
      partyTomes: state.partyTomes ?? [],
      home: homeWithRegrownResources(state.home),
      monsterCompendium: state.monsterCompendium,
    });
    state.combatStarted = false;
    roomIsBuilt = false;
    maybeUnlockNpcProgress();
    addLog(`${hero.name} reaches the exit. Dungeon complete. The party gained ${tokenAward} Hero Token${tokenAward === 1 ? "" : "s"} each.`, "important");
    if (storedCoins > 0) addLog(`${moneyText(cpToMoney(storedCoins))} is secured in the party purse.`, "important");
    if (consumedGoalItems) addLog(`${consumedGoalItems} goal item${consumedGoalItems === 1 ? " was" : "s were"} left behind.`, "important");
    render();
    maybeTriggerNpcArrivals();
    window.DepthboundPlaytest?.syncNow?.();
    centerViewOnHero();
  };
  state.completed = true;
  if (outro?.text || outro?.images?.length) {
    void showDungeonStoryDialog({
      title: state.customDungeon?.name ?? "Dungeon Complete",
      text: outro.text,
      images: outro.images,
      actionLabel: "Return Home",
      goalText: customGoalStatus().text,
    }).then(finishDungeon);
  } else {
    finishDungeon();
  }
  return true;
}

function createLootForMonster(monster) {
  const category = Math.max(currentLootCategory(), monsterCategory(monster));
  const boss = monster.id?.startsWith("boss-") || monster.tags?.includes("boss");
  const humanoid = monster.tags?.includes("humanoid");
  const healingPotion = rollDie(100) <= (boss ? 30 : 5) ? randomHealingPotionDrop() : null;
  const equipmentDrop = rollDie(100) <= (boss ? 18 : 2) ? randomEquipmentDrop() : null;
  const treasureDrop = rollDie(100) <= (boss ? 75 : 2) ? randomTreasureDrop(category) : null;
  const magicDrop = rollDie(100) <= (boss ? Math.min(55, 20 + category * 8) : Math.min(2, Math.max(1, Math.floor(category / 2)))) ? randomMagicLootDrop(category) : null;
  const items = [healingPotion, equipmentDrop, treasureDrop, magicDrop, ...(monster.pickedUpItems ?? []), ...definedLootForMonster(monster)].filter(Boolean);
  const money = humanoid
    ? boss
      ? normalizeMoney({ gp: rollDie(category * 5) + category * 2, sp: rollDie(10), cp: rollDie(10) })
      : normalizeMoney({ gp: rollDie(Math.max(1, category)), sp: rollDie(10), cp: rollDie(10) })
    : boss
      ? normalizeMoney({ gp: rollDie(category * 4), sp: rollDie(10), cp: rollDie(10) })
      : { cp: rollDie(11) - 1, sp: 0, gp: 0 };
  return {
    id: `loot-${monster.id}-${Date.now()}`,
    position: { ...monster.position },
    money,
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
      if (loot.chance !== undefined && Math.random() > Number(loot.chance)) return null;
      if (loot.kind === "randomEquipment") return randomEquipmentDrop();
      if (loot.kind !== "item" || !loot.itemId) return null;
      const item = createItemInstance(loot.itemId, "loot");
      if (!item) return null;
      const quantity = rollLootQuantity(loot);
      if (item.ammo) {
        item.ammo.quantity = Math.max(0, quantity);
        item.name = `${item.ammo.kind[0].toUpperCase()}${item.ammo.kind.slice(1)}s (${item.ammo.quantity})`;
      } else if (item.stackable || item.type === "component") {
        item.quantity = Math.max(1, quantity);
      }
      return item;
    })
    .filter(Boolean);
}

function addMonsterMaterialDrops(monster) {
  if (!monster || monster.materialDropsAdded) return;
  monster.materialDropsAdded = true;
  const ids = new Set([monster.baseMonsterId, monster.templateId, monster.id, ...(monster.tags ?? [])].filter(Boolean));
  if (ids.has("humanoid")) return;
  const textFields = [
    ...Array.from(ids),
    monster.name,
    monster.role,
    monster.description,
    monster.equipment?.armor,
    monster.equipment?.offHand,
    ...(monster.specials ?? []),
  ].filter(Boolean);
  const idText = textFields.map((id) => String(id).toLowerCase());
  const hasFoodCue = (...cues) => cues.some((cue) => {
    const normalized = String(cue).toLowerCase();
    return ids.has(normalized) || idText.some((id) => id.includes(normalized));
  });
  const hasWornMetalArmorCue = () => {
    if (ids.has("beast") || ids.has("plant") || ids.has("elemental")) return false;
    const armor = String(monster.equipment?.armor ?? "").toLowerCase();
    const offHand = String(monster.equipment?.offHand ?? "").toLowerCase();
    if (/(chain|mail|scale|plate|splint|breastplate|shield)/i.test(`${armor} ${offHand}`)) return true;
    return hasFoodCue(
      "armored",
      "armour",
      "armor",
      "plate",
      "mail",
      "chain",
      "shieldbearer",
      "tower-shield",
      "tower shield",
      "shield",
      "knight",
      "sentinel",
      "soldier",
      "halberdier",
      "pikeman",
      "arbalester",
      "crossbowman",
    );
  };
  const add = (itemId, options = {}) => {
    monster.extraLoot = [...(monster.extraLoot ?? []), { kind: "item", itemId, ...options }];
  };
  if (hasWornMetalArmorCue()) {
    add("iron-scrap", { chance: ids.has("boss") ? 0.08 : 0.045 });
  }
  if (ids.has("undead") || ids.has("skeletal") || ids.has("skeleton")) {
    add("bone-dust", { chance: 0.18 });
    add("cracked-rib-bone", { chance: 0.08 });
    add("skull-fragment", { chance: 0.035 });
    add("grave-wax", { chance: ids.has("old-guardroom") ? 0.04 : 0.02 });
    if (ids.has("zombie") || hasFoodCue("corpse", "cadaver", "flesh", "rot", "plague")) add("grave-flesh", { chance: ids.has("boss") ? 0.2 : 0.12 });
  }
  if (ids.has("ghost") || ids.has("specter") || ids.has("wraith") || ids.has("banshee") || ids.has("spirit")) {
    add("ectoplasm", { chance: 0.24 });
    add("grave-wax", { chance: 0.08 });
    add("soul-echo", { chance: ids.has("boss") ? 0.14 : 0.045 });
  }
  if (ids.has("beast")) {
    add("beast-hide", { chance: 0.22 });
    add("beast-claw", { chance: 0.12 });
    add("beast-fang", { chance: 0.12 });
    add("monster-blood", { chance: 0.1 });
    add("raw-meat", { chance: 0.18 });
    add("lean-game-meat", { chance: hasFoodCue("wolf", "stag", "hare", "predator") ? 0.14 : 0.06 });
    if (hasFoodCue("venom", "poison", "viper", "serpent", "scorpion", "spider", "basilisk", "stingray")) add("venom-gland", { chance: ids.has("boss") ? 0.2 : 0.12 });
    if (hasFoodCue("horn", "antler", "stag", "elk", "ram", "rhino", "aurochs", "bison", "yak", "bull", "mammoth")) add("horn-and-antler", { chance: ids.has("boss") ? 0.18 : 0.1 });
    if (hasFoodCue("shell", "scale", "carapace", "crab", "turtle", "tortoise", "scorpion", "croc", "alligator", "ankylosaur")) add("scale-and-shell", { chance: ids.has("boss") ? 0.18 : 0.1 });
    if (hasFoodCue("bird", "raptor", "roc", "owl", "eagle", "vulture", "crane", "harrier")) add("giant-feather", { chance: ids.has("boss") ? 0.2 : 0.14 });
    if (hasFoodCue("water", "fish", "shark", "eel", "orca", "whale", "manta", "hippo", "seal", "croc", "alligator")) add("fish-meat", { chance: ids.has("boss") ? 0.18 : 0.1 });
    if (hasFoodCue("boar")) add("boar-haunch", { chance: ids.has("boss") ? 0.22 : 0.16 });
    if (hasFoodCue("bear")) add("bear-fat", { chance: ids.has("boss") ? 0.2 : 0.14 });
    if (hasFoodCue("bird", "raptor")) add("game-bird-breast", { chance: 0.15 });
    if (hasFoodCue("spider")) add("spider-eggs", { chance: hasFoodCue("giant") || ids.has("boss") ? 0.14 : 0.08 });
  }
  if (ids.has("plant")) {
    add("living-wood", { chance: ids.has("treant") || ids.has("tree") || ids.has("wood") || ids.has("guardian") ? 0.22 : 0.1 });
    add("thorn-spike", { chance: ids.has("thorn") || ids.has("bramble") || ids.has("vine") ? 0.2 : 0.08 });
    add("verdant-sap", { chance: ids.has("forest") || ids.has("jungle") || ids.has("flower") ? 0.16 : 0.08 });
    add("glowspore-dust", { chance: ids.has("fungus") || ids.has("spore") || ids.has("myconid") || ids.has("mold") ? 0.22 : 0.045 });
    add("medicinal-herb", { chance: 0.08 });
    add("edible-fungus", { chance: hasFoodCue("fungus", "mushroom", "myconid", "mold") ? 0.18 : 0.025 });
    add("sweet-nectar-pod", { chance: hasFoodCue("flower", "jungle", "vine", "bloom") ? 0.14 : 0.035 });
  }
  if (ids.has("construct")) {
    add("iron-scrap", { chance: 0.28, quantityDice: { count: 1, sides: 2 } });
    add("arcane-gear", { chance: 0.1 });
    add("crystal-shard", { chance: 0.06 });
  }
  if (ids.has("embervein-deepworks") || ids.has("embervein") || ids.has("deepworks")) {
    add("coal-chunk", { chance: ids.has("soot") || ids.has("coal") || ids.has("smoke") ? 0.18 : 0.06 });
    add("embervein-ore", { chance: ids.has("ore") || ids.has("earth") || ids.has("mine") || ids.has("dungeon-core") ? 0.18 : 0.08 });
    add("slag-glass", { chance: ids.has("slag") || ids.has("fire") || ids.has("glass") ? 0.16 : 0.06 });
    add("pressure-core", { chance: ids.has("steam") || ids.has("gear") || ids.has("construct") || ids.has("engine") ? 0.11 : ids.has("boss") ? 0.08 : 0.025 });
  }
  if (ids.has("devil")) {
    add("devil-blood", { chance: 0.2 });
    add("hellfire-ember", { chance: ids.has("fire") || ids.has("furnace") || ids.has("hellfire") ? 0.14 : 0.075 });
    add("infernal-iron-shard", { chance: ids.has("chain") || ids.has("soldier") || ids.has("barbed") || ids.has("brute") ? 0.14 : 0.07 });
  }
  if (ids.has("demon")) {
    add("demon-ichor", { chance: 0.22 });
    add("abyssal-bile", { chance: ids.has("plague") || ids.has("acid") || ids.has("hezrou") || ids.has("maw") ? 0.15 : 0.075 });
    add("mutated-flesh", { chance: ids.has("mutation") || ids.has("brute") || ids.has("titan") ? 0.13 : 0.06 });
    add("chaos-shard", { chance: ids.has("rift") || ids.has("gate") || ids.has("boss") || ids.has("demon-prince") ? 0.12 : 0.04 });
  }
  if (ids.has("elemental")) {
    add("elemental-mote", { chance: 0.24 });
    if (hasFoodCue("coal", "soot", "cinder", "ember", "ash", "smoke", "fire", "lava", "magma", "furnace", "slag", "earth", "stone", "ore")) {
      add("coal-chunk", { chance: ids.has("boss") ? 0.1 : 0.055 });
    }
    if (ids.has("fire") || ids.has("ash") || ids.has("smoke") || ids.has("lava") || ids.has("magma") || ids.has("heat")) {
      add("flame-essence", { chance: ids.has("boss") ? 0.18 : 0.1 });
    }
    if (ids.has("air") || ids.has("storm") || ids.has("wind") || ids.has("lightning") || ids.has("thunder") || ids.has("gale")) {
      add("storm-essence", { chance: ids.has("boss") ? 0.18 : 0.1 });
    }
    if (ids.has("earth") || ids.has("stone") || ids.has("crystal") || ids.has("mud") || ids.has("sand") || ids.has("ore") || ids.has("metal")) {
      add("earth-essence", { chance: ids.has("boss") ? 0.18 : 0.1 });
    }
    if (ids.has("water") || ids.has("ice") || ids.has("frost") || ids.has("steam") || ids.has("mist") || ids.has("brine") || ids.has("coral") || ids.has("acid")) {
      add("water-essence", { chance: ids.has("boss") ? 0.18 : 0.1 });
    }
    add("primal-core", { chance: ids.has("boss") ? 0.13 : 0.025 });
  }
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
  const theme = getContentDefinition("themes", state?.themeId ?? defaultContent.theme);
  const tableIds = theme?.lootTableIds?.length ? theme.lootTableIds : [defaultContent.lootTable];
  const ids = new Set();
  for (const tableId of tableIds) {
    const table = getContentDefinition("lootTables", tableId);
    for (const itemId of table?.itemIds ?? []) ids.add(itemId);
  }
  if (!ids.size) return window.DungeonContent.list("items");
  return window.DungeonContent.list("items").filter((item) => !ids || ids.has(item.id));
}

function currentLootCategory() {
  return Math.max(1, categoryForHeroLevel(averagePartyLevel(activeHero())));
}

const lootBudgetsByLevel = [
  { level: 1, treasureGp: 100, equipmentGp: 50, magicGp: 0, potionGp: 10 },
  { level: 2, treasureGp: 250, equipmentGp: 75, magicGp: 500, potionGp: 10 },
  { level: 3, treasureGp: 500, equipmentGp: 100, magicGp: 900, potionGp: 100 },
  { level: 4, treasureGp: 750, equipmentGp: 200, magicGp: 1200, potionGp: 100 },
  { level: 5, treasureGp: 1000, equipmentGp: 400, magicGp: 1800, potionGp: 100 },
  { level: 6, treasureGp: 1000, equipmentGp: 750, magicGp: 2500, potionGp: 100 },
  { level: 7, treasureGp: 1500, equipmentGp: 1500, magicGp: 4200, potionGp: 500 },
  { level: 8, treasureGp: 2500, equipmentGp: 2500, magicGp: 6000, potionGp: 500 },
  { level: 9, treasureGp: 2500, equipmentGp: 5000, magicGp: 7500, potionGp: 500 },
  { level: 10, treasureGp: 5000, equipmentGp: 7500, magicGp: 9000, potionGp: 500 },
  { level: 11, treasureGp: 5000, equipmentGp: 10000, magicGp: 12000, potionGp: 500 },
  { level: 12, treasureGp: 7500, equipmentGp: 15000, magicGp: 24000, potionGp: 5000 },
  { level: 13, treasureGp: 7500, equipmentGp: 25000, magicGp: 32000, potionGp: 5000 },
  { level: 14, treasureGp: 10000, equipmentGp: 35000, magicGp: 45000, potionGp: 5000 },
  { level: 15, treasureGp: 10000, equipmentGp: 50000, magicGp: 75000, potionGp: 5000 },
  { level: 16, treasureGp: 15000, equipmentGp: 75000, magicGp: 100000, potionGp: 5000 },
  { level: 17, treasureGp: 25000, equipmentGp: 100000, magicGp: 180000, potionGp: 5000 },
  { level: 18, treasureGp: 25000, equipmentGp: 150000, magicGp: 200000, potionGp: 5000 },
  { level: 19, treasureGp: 50000, equipmentGp: 200000, magicGp: 200000, potionGp: 5000 },
  { level: 20, treasureGp: 50000, equipmentGp: 200000, magicGp: 200000, potionGp: 5000 },
];

function lootBudgetForPartyLevel(level = averagePartyLevel(activeHero())) {
  const partyLevel = Math.max(1, Math.min(20, Math.floor(Number(level) || 1)));
  return lootBudgetsByLevel.find((budget) => budget.level === partyLevel) ?? lootBudgetsByLevel[0];
}

function maxLootPriceGpForCategory(category = currentLootCategory()) {
  return lootBudgetForPartyLevel(Math.max(1, category) * 2 - 1).magicGp;
}

function lootItemValueGp(item) {
  return item?.loot?.priceGp ?? item?.treasure?.valueGp ?? item?.treasure?.valueTierGp ?? itemValueGp(item);
}

function lootItemAllowedForCategory(item, category = currentLootCategory()) {
  const priceGp = lootItemValueGp(item);
  return priceGp <= maxLootPriceGpForCategory(category);
}

function maxLootValueGpForKind(kind, level = averagePartyLevel(activeHero())) {
  const budget = lootBudgetForPartyLevel(level);
  if (kind === "treasure") return budget.treasureGp;
  if (kind === "equipment") return budget.equipmentGp;
  if (kind === "potion") return budget.potionGp;
  if (kind === "magic") return budget.magicGp;
  return budget.magicGp;
}

function lootItemAllowedForPartyLevel(item, kind, level = averagePartyLevel(activeHero())) {
  return lootItemValueGp(item) <= maxLootValueGpForKind(kind, level);
}

function weightedLootPick(items, options = {}) {
  const category = options.category ?? currentLootCategory();
  const maxPriceGp = options.maxPriceGp ?? maxLootValueGpForKind(options.kind ?? "magic", options.level ?? averagePartyLevel(activeHero()));
  const entries = items
    .filter((item) => lootItemValueGp(item) <= maxPriceGp)
    .map((item) => ({
      item,
      weight:
        item.loot?.dropWeight ??
        item.treasure?.dropWeight ??
        Math.max(1, Math.round(400 / Math.sqrt(Math.max(1, lootItemValueGp(item))))),
    }));
  return weightedPick(entries);
}

function randomMagicLootDrop(category = currentLootCategory()) {
  const partyLevel = averagePartyLevel(activeHero());
  const item = weightedLootPick(
    dungeonLootItems().filter((candidate) => candidate.tags?.includes("loot:magic") || candidate.tags?.includes("magic-item")),
    { category, kind: "magic", level: partyLevel },
  );
  return item ? createItemInstance(item.id, "magic-loot") : null;
}

function randomTreasureDrop(category = currentLootCategory()) {
  const partyLevel = averagePartyLevel(activeHero());
  const item = weightedLootPick(
    window.DungeonContent.list("items").filter((candidate) => candidate.type === "treasure" || candidate.tags?.includes("treasure")),
    { category, kind: "treasure", level: partyLevel },
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
  const partyLevel = averagePartyLevel(activeHero());
  const potion = weightedPick(
    dungeonLootItems()
      .filter((item) => item.use?.kind === "healing")
      .filter((item) => lootItemAllowedForPartyLevel(item, "potion", partyLevel))
      .map((item) => ({ item, weight: rarityWeights[item.id] ?? 1 })),
  );
  return potion ? createItemInstance(potion.id, "loot") : null;
}

function randomEquipmentDrop() {
  const partyLevel = averagePartyLevel(activeHero());
  const item = weightedPick(
    dungeonLootItems()
      .filter((candidate) => candidate.use?.kind !== "healing" && candidate.store?.buyable !== false && !candidate.tags?.includes("loot:magic") && candidate.type !== "treasure")
      .filter((candidate) => lootItemAllowedForPartyLevel(candidate, "equipment", partyLevel))
      .map((candidate) => ({ item: candidate, weight: 1 / Math.max(1, Math.sqrt(lootItemValueGp(candidate))) })),
  );
  return item ? createItemInstance(item.id, "loot") : null;
}

function dropLootForMonster(monster) {
  recordNpcMonsterKill(monster);
  if (monster?.fightingPitMonster) return;
  addMonsterMaterialDrops(monster);
  const loot = createLootForMonster(monster);
  const resolvedLoot = resolveMonsterLootDrop(monster, loot);
  if (!resolvedLoot) return;
  addLootPile(resolvedLoot);
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

function lootHasContents(loot) {
  return Boolean(moneyToCp(loot?.money ?? {}) > 0 || (loot?.heroTokens ?? 0) > 0 || (loot?.items ?? []).length > 0);
}

function lootContentsText(loot) {
  const coinText = moneyToCp(loot?.money ?? {}) ? moneyText(loot.money) : "";
  const tokenText = loot?.heroTokens ? `${loot.heroTokens} Hero Token${loot.heroTokens === 1 ? "" : "s"}` : "";
  const itemText = (loot?.items ?? []).map((item) => item.name).join(", ");
  return [coinText, tokenText, itemText].filter(Boolean).join(" and ") || "nothing";
}

function groundCollectingHeroes() {
  return partyHeroes().filter((hero) => heroCanAct(hero) && canFighterReceiveInventory(hero) && !fighterIsFlying(hero));
}

function lootPositionCanBeCollected(position) {
  const heroes = groundCollectingHeroes();
  if (!heroes.length) return false;
  return heroes.some((hero) => canFighterOccupyPosition(hero, position, currentWalkable(hero)));
}

function nearbyCollectableLootPosition(position) {
  if (lootPositionCanBeCollected(position)) return position;
  return surroundingCells(position)
    .filter((cell) => positionKey(cell) !== positionKey(position))
    .find((cell) => lootPositionCanBeCollected(cell)) ?? null;
}

function mainHeroForLootFallback() {
  const mainHero = state?.fighters?.hero;
  if (mainHero && !mainHero.dead && canFighterReceiveInventory(mainHero)) return mainHero;
  return [activeHero(), ...partyHeroes()].find((hero) => hero && !hero.dead && canFighterReceiveInventory(hero)) ?? null;
}

function grantLootDirectlyToHero(hero, loot, sourceName = "The loot") {
  if (!hero || !loot) return false;
  hero.inventory = normalizeInventory(hero.inventory);
  addMoney(hero.inventory.money, moneyToCp(loot.money ?? {}));
  hero.inventory.heroTokens = (hero.inventory.heroTokens ?? 0) + (loot.heroTokens ?? 0);
  for (const item of loot.items ?? []) addItemToInventory(hero, item, "loot-stack");
  addLog(`${sourceName}'s loot cannot land in a reachable space, so ${hero.name} receives ${lootContentsText(loot)} directly.`, "important");
  logTomeStorageForItems(loot.items ?? []);
  return true;
}

function resolveMonsterLootDrop(monster, loot) {
  if (!loot) return null;
  const position = nearbyCollectableLootPosition(loot.position);
  if (position) return { ...loot, position: { ...position } };
  if (!lootHasContents(loot)) return null;
  const receiver = mainHeroForLootFallback();
  return grantLootDirectlyToHero(receiver, loot, monster?.name ?? "The monster") ? null : loot;
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
  ensureHeroCorpseState(hero, { location: hero.corpse?.location ?? "dungeon" });
  hero.deathLootDropped = true;
  addLog(`${hero.name}'s body remains where they fell. Their belongings can be looted from the corpse.`, "important");
}

function awardMonsterXp(monster) {
  recordMonsterKill(monster);
  const xp = monster?.fightingPitMonster ? Math.ceil((monster.xp ?? 50) / 2) : (monster.xp ?? 50);
  const participants = partyHeroes();
  const recipients = participants.filter((fighter) => isClassHero(fighter) || isTrainedSidekick(fighter));
  const lostShares = participants.length - recipients.length;
  const share = Math.max(1, Math.ceil(xp / Math.max(1, participants.length)));
  recipients.forEach((hero) => {
    hero.xp = (hero.xp ?? 0) + share;
  });
  const recipientText = recipients.length ? `${recipients.map((hero) => hero.name).join(", ")} gain ${share} XP` : `No one gains ${share} XP`;
  addLog(`${recipientText}.${lostShares ? ` ${lostShares} ally share${lostShares === 1 ? "" : "s"} lost.` : ""}`, "important");
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
  if (!canFighterReceiveInventory(fighter)) return false;

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
  logTomeStorageForItems(loot.items ?? []);
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

function triggerTrapAtPosition(fighter, position, options = {}) {
  if (!fighter?.alive) return false;
  let triggered = false;
  for (const trap of objectsAtPosition(position)) {
    if (!fighter.alive) break;
    if (fighterIsFlying(fighter) && objectHasTag(trap, "floor")) continue;
    const hazard = objectComponent(trap, "hazardOnEnter") ?? objectComponent(trap, "hazardOnMovement");
    if (hazard && trap.armed !== false && !trap.disarmed) {
      triggered = applyObjectHazardToFighter(fighter, trap, hazard) || triggered;
    }
    if (!options.skipForcedMovement) triggered = applyForcedMovementFloorToFighter(fighter, trap) || triggered;
    if (hazard) continue;
    if (!objectIsTrap(trap) || trap.armed === false || trap.disarmed) continue;
    triggered = triggerFloorTrap(fighter, trap) || triggered;
  }
  if (fighter.alive) triggered = triggerHealingPoolAtPosition(fighter, position) || triggered;
  return triggered;
}

function triggerTerrainHazardsAtTurnStart(fighter) {
  if (!fighter?.alive || !fighter.position) return false;
  let triggered = false;
  for (const object of objectsAtPosition(fighter.position)) {
    if (!fighter.alive) break;
    if (!objectHasTag(object, "terrain-floor")) continue;
    if (fighterIsFlying(fighter) && objectHasTag(object, "floor")) continue;
    const hazard = objectComponent(object, "hazardOnEnter") ?? objectComponent(object, "hazardOnMovement");
    if (hazard && object.armed !== false && !object.disarmed) {
      triggered = applyObjectHazardToFighter(fighter, object, hazard, "starts their turn in") || triggered;
    }
    triggered = applyForcedMovementFloorToFighter(fighter, object, "starts their turn in") || triggered;
  }
  return triggered;
}

function forcedMovementDestination(fighter, object, distanceSquares = 1) {
  const cells = adjacentCells(fighter.position)
    .sort(() => Math.random() - 0.5)
    .map((cell) => {
      let destination = cell;
      const dx = Math.sign(cell.x - object.position.x);
      const dy = Math.sign(cell.y - object.position.y);
      for (let step = 1; step < distanceSquares; step += 1) {
        destination = { x: destination.x + dx, y: destination.y + dy };
      }
      return destination;
    });
  const walkable = currentWalkable(fighter);
  return cells.find((cell) => {
    if (!canFighterOccupyPosition(fighter, cell, walkable)) return false;
    return canTraverseFootprintMovementEdge(fighter, fighter.position, cell, []);
  }) ?? null;
}

function applyForcedMovementFloorToFighter(fighter, object, verb = "is caught in") {
  if (!fighter?.alive || !objectHasTag(object, "terrain-floor")) return false;
  const movement = objectComponent(object, "forcedMovementFloor");
  if (!movement || object.armed === false || object.disarmed) return false;
  const saveAbility = movement.saveAbility ?? "str";
  const dc = movement.dc ?? 13;
  const label = movement.label ?? objectTemplate(object.type)?.name ?? "forced current";
  const save = savingThrow(fighter, saveAbility, dc);
  addLog(`${fighter.name} ${verb} ${label}: ${saveAbility.toUpperCase()} ${save.roll} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}.`, save.success ? "" : "important");
  if (save.success) return false;
  if (movement.statusOnFail) applyStatusEffect(fighter, { ...movement.statusOnFail });
  const destination = forcedMovementDestination(fighter, object, movement.distanceSquares ?? 1);
  if (!destination) {
    addLog(`${fighter.name} braces against ${label} and cannot be moved.`, "important");
    return true;
  }
  fighter.position = destination;
  addLog(`${label} shoves ${fighter.name} 5 ft.`, "important");
  triggerTrapAtPosition(fighter, destination, { skipForcedMovement: true });
  return true;
}

async function resolveTurnStartHazardsForActiveFighter() {
  const fighter = activeFighter();
  triggerTerrainHazardsAtTurnStart(fighter);
  if (!fighter || fighter.alive) return false;
  render();
  if (state.combatStarted && combatMonsters().length === 0 && !partyDefeatedOrDying()) {
    await finishEncounterAfterLastMonsterFalls();
    return true;
  }
  if (state.combatStarted && combatNeedsHeroTurns() && !partyDefeatedOrDying()) {
    window.setTimeout(endTurn, tokenSlideMs);
    return true;
  }
  return true;
}

function applyObjectHazardToFighter(fighter, object, hazard, verb = "is hurt by") {
  const template = objectTemplate(object.type);
  const damage = hazard.damage ?? template?.damage ?? { count: 1, sides: 4, type: "damage" };
  const damageRoll = rollDice(damage.count, damage.sides);
  const modified = calculateDamageModifiers(fighter, damageRoll.total, damage.type);
  applyDamageToFighter(fighter, modified.damage);
  const name = template?.name ?? "a hazard";
  object.lastResult =
    verb === "is hurt by"
      ? `${fighter.name} is hurt by ${name} for ${modified.damage} ${damage.type} damage.`
      : `${fighter.name} ${verb} ${name} and takes ${modified.damage} ${damage.type} damage.`;
  addLog(`${object.lastResult}${modified.reason ? ` ${fighter.name} is ${modified.reason} to ${damage.type} damage.` : ""}`, "damage");
  if (hazard.once) {
    object.armed = false;
    object.spent = true;
  }
  if (!fighter.alive) {
    addLog(`${fighter.name} drops to 0 HP.`, "important");
    handleFighterDefeatedByTerrain(fighter);
  }
  return true;
}

function handleFighterDefeatedByTerrain(fighter) {
  if (!fighter || fighter.terrainDeathHandled) return;
  fighter.terrainDeathHandled = true;
  if (isPartyHeroId(fighter.id)) {
    handleHeroDeath();
    return;
  }
  if (fighter.team === "heroes" || fighter.friendly || fighter.summonedByHeroId || fighter.companionOwnerId) return;
  triggerMonsterDeathStory(fighter);
  awardMonsterXp(fighter);
  dropLootForMonster(fighter);
}

function triggerFloorTrap(fighter, trap) {
  const template = objectTemplate(trap.type);
  const trapDamage = template.damage ?? objectComponent(trap, "trap")?.damage ?? { count: 1, sides: 4, type: "piercing" };
  const damageRoll = rollDice(trapDamage.count, trapDamage.sides);
  const rawDamage = damageRoll.total + (trapDamage.bonus ?? 0);
  if (isPartyHeroId(fighter.id) && adminEnabled() && adminGodMode) {
    trap.armed = false;
    trap.spent = true;
    trap.lastResult = `${fighter.name} triggered it, but god mode prevented the damage.`;
    addLog(`${fighter.name} triggers ${template.name ?? "a trap"}. God mode prevents the damage.`, "important");
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
    handleFighterDefeatedByTerrain(fighter);
  }
  return true;
}

function triggerHealingPoolAtPosition(fighter, position) {
  if (!healingPoolCanAffectFighter(fighter)) return false;
  let healed = false;
  for (const object of objectsAtPosition(position)) {
    const healingPool = objectComponent(object, "healingPool");
    if (!healingPool || !objectHasTag(object, "terrain-floor")) continue;
    if (fighterIsFlying(fighter) && objectHasTag(object, "floor")) continue;
    const healedIds = new Set(object.healedFighterIds ?? []);
    if (healedIds.has(fighter.id)) continue;
    const dice = healingPool.dice ?? { count: 2, sides: 4 };
    const healingRoll = rollDice(dice.count, dice.sides);
    const amount = applyHealingToHero(fighter, healingRoll.total);
    object.healedFighterIds = [...healedIds, fighter.id];
    object.lastResult = amount > 0
      ? `${fighter.name} recovers ${amount} HP from ${objectTemplate(object.type)?.name ?? "a healing pool"}.`
      : `${fighter.name} steps into ${objectTemplate(object.type)?.name ?? "a healing pool"}, but is already at full health.`;
    addLog(`${object.lastResult} (${healingRoll.rolls.join(" + ")})`, "heal");
    healed = true;
  }
  return healed;
}

function healingPoolCanAffectFighter(fighter) {
  return Boolean(
    fighter?.alive &&
      (isPartyHeroId(fighter.id) ||
        fighter.team === "heroes" ||
        fighter.friendly ||
        fighter.summonedByHeroId ||
        fighter.companionOwnerId),
  );
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
  if (window.DepthboundPlaytest?.role === "guest") return;
  const heroes = partyHeroes();
  if (!heroes.length) return;
  const activeTiles = activeTileKeys();

  for (const trap of state.dungeonObjects ?? []) {
    if (!objectIsTrap(trap) || trap.detected || !objectCells(trap).some((cell) => activeTiles.has(positionKey(cell)) && isKnownTile(cell))) continue;

    trap.spotCheckedBy = trap.spotCheckedBy ?? [];
    const trapPosition = objectCells(trap)[0] ?? trap.position;
    for (const hero of heroes.filter((entry) => !trap.spotCheckedBy.includes(entry.id))) {
      trap.spotCheckedBy.push(hero.id);
      const check = rollSkillCheck(hero, "wis", "perception", { sightBased: true, position: trapPosition, guidance: true });
      const { rollResult, roll, bonus, guidance, total, lightContext } = check;
      const dc = trap.spotDc ?? 12;
      trap.detected = total >= dc;
      recordD20OutcomeForFighter(hero, trap.detected);
      addAdminCheckLog({ actor: hero, label: "Perception check to spot hidden trap", rollResult, bonus, guidance, total, dc, success: trap.detected, note: [`trap id ${trap.id ?? "unknown"}`, lightContext.note].filter(Boolean).join("; ") });
      if (trap.detected) {
        addLog(`${hero.name} spots a hidden trap${lightContext.disadvantage ? " despite poor light" : ""}.`, "important");
        break;
      }
    }
  }

  for (const chest of state.dungeonObjects ?? []) {
    if (!chest.trap || chest.trap.detected || !objectCells(chest).some((cell) => activeTiles.has(positionKey(cell)) && isKnownTile(cell))) continue;

    chest.trap.spotCheckedBy = chest.trap.spotCheckedBy ?? [];
    const chestPosition = objectCells(chest)[0] ?? chest.position;
    for (const hero of heroes.filter((entry) => !chest.trap.spotCheckedBy.includes(entry.id))) {
      chest.trap.spotCheckedBy.push(hero.id);
      const check = rollSkillCheck(hero, "wis", "perception", { sightBased: true, position: chestPosition, guidance: true });
      const { rollResult, roll, bonus, guidance, total, lightContext } = check;
      const dc = chest.trap.spotDc ?? 12;
      chest.trap.detected = total >= dc;
      recordD20OutcomeForFighter(hero, chest.trap.detected);
      addAdminCheckLog({ actor: hero, label: "Perception check to spot hidden trap", target: objectTemplate(chest.type)?.name ?? "a feature", rollResult, bonus, guidance, total, dc, success: chest.trap.detected, note: [`object id ${chest.id ?? "unknown"}`, lightContext.note].filter(Boolean).join("; ") });
      if (chest.trap.detected) {
        addLog(`${hero.name} spots a hidden trap on ${objectTemplate(chest.type)?.name ?? "a feature"}${lightContext.disadvantage ? " despite poor light" : ""}.`, "important");
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

function openDoor(door, actor = activeHero()) {
  if (doorHasLockedSpecialLock(door)) {
    void answerDoorSpecialLock(door, actor);
    return true;
  }
  if (actor && !activeStealthCheckInMonsterRoom(actor, "opens a door")) return false;

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
    if (!targetRoom || !targetDoor) {
      if (!doorRoom) continue;
      openedDoorKeys.add(positionKey(entry));
      if (entry.corridor) {
        openedCorridorKeys.add(positionKey(entry.corridor));
        revealCrossedCorridorPassages(openedCorridorKeys, [entry.corridor]);
      }
      if (!discovered.has(doorRoom.id)) {
        discovered.add(doorRoom.id);
        revealedRooms.push(doorRoom);
      }
      openedAnyPassage = true;
      continue;
    }

    const openingFromDiscoveredRoom = discovered.has(entry.roomId);
    const roomToReveal = openingFromDiscoveredRoom ? null : doorRoom;

    openedDoorKeys.add(positionKey(entry));
    const corridorPath = corridorPathBetweenDoors(entry, targetDoor);
    corridorPath.forEach((cell) => openedCorridorKeys.add(positionKey(cell)));
    revealCrossedCorridorPassages(openedCorridorKeys, corridorPath);
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
  addLog(`${actor?.name ?? activeHero()?.name ?? "The party"} opens the door${revealedRooms.length === 1 ? ` to ${revealedRooms[0].name}` : ""}.`, "important");

  const revealedMonsterRooms = revealedRooms.filter((room) => monstersInRoom(room.id).length > 0);
  if (actor && fighterIsStealthing(actor) && revealedMonsterRooms.length > 0) {
    checkStealthAgainstPassiveForRooms(actor, revealedMonsterRooms);
  } else if (revealedMonsterRooms.length > 0) {
    addLog("Hostile movement answers from within. Roll initiative.", "important");
  }

  render();
  return true;
}

function specialLockForDoor(door) {
  const relatedDoors = (state.dungeon?.doors ?? []).filter(
    (entry) => entry.roomId === door?.roomId && positionKey(entry) === positionKey(door),
  );
  const candidates = [...relatedDoors, door, reciprocalDoor(door)].filter(Boolean);
  return candidates.map((entry) => normalizeSpecialLock(entry.specialLock)).find(Boolean) ?? null;
}

function doorHasLockedSpecialLock(door) {
  const specialLock = specialLockForDoor(door);
  return Boolean(specialLock && !specialLock.unlocked);
}

function markDoorSpecialLockUnlocked(door, specialLock) {
  const relatedDoors = (state.dungeon?.doors ?? []).filter(
    (entry) => entry.roomId === door?.roomId && positionKey(entry) === positionKey(door),
  );
  const reciprocal = reciprocalDoor(door);
  for (const entry of [...relatedDoors, door, reciprocal].filter(Boolean)) {
    entry.specialLock = { ...specialLock, unlocked: true };
  }
}

async function answerDoorSpecialLock(door, actor = activeHero()) {
  const specialLock = specialLockForDoor(door);
  if (!door || !specialLock || specialLock.unlocked) return false;
  const answer = await showGameDialog({
    title: specialLock.label,
    message: specialLock.prompt,
    input: { label: "Key", value: "", maxLength: 120 },
    confirmText: "Unlock",
    cancelText: "Cancel",
  });
  if (answer === null) return false;
  if (!specialLockAnswerMatches(specialLock, answer)) {
    addLog(`${specialLock.label} rejects the key.`);
    render();
    return false;
  }
  markDoorSpecialLockUnlocked(door, specialLock);
  addLog(`${actor?.name ?? activeHero()?.name ?? "The party"} unlocks the door.`, "important");
  return openDoor(door, actor);
}

function toggleHomeDoor(position, actor = activeHero()) {
  if (state.mode !== "home" || isHomeBuilderOpen()) return false;
  if (!actor) return false;
  const nearbyInteriorDoors = (state.dungeon?.doors ?? [])
    .filter((door) => door.to !== "outside" && distance(actor.position, door) <= 1)
    .filter((door) => positionKey(door) === positionKey(position) || positionKey(actor.position) === positionKey(position) || distance(position, door) <= 1);
  const openedDoorKeys = new Set(state.exploration.openedDoorKeys ?? []);
  const preferredOpenDoor = nearbyInteriorDoors.find((door) => openedDoorKeys.has(positionKey(door)));
  const candidate = doorCandidateForPosition(position, actor);
  const door = preferredOpenDoor ?? (candidate?.to !== "outside" ? candidate : nearbyInteriorDoors[0]);
  if (!door || door.to === "outside" || distance(actor.position, door) > 1) return false;
  const doorKey = positionKey(door);
  const openedCorridorKeys = new Set(state.exploration.openedCorridorKeys ?? []);
  if (openedDoorKeys.has(doorKey)) {
    const relatedDoors = (state.dungeon?.doors ?? []).filter(
      (entry) => entry.roomId === door.roomId && positionKey(entry) === doorKey,
    );
    (relatedDoors.length ? relatedDoors : [door]).forEach((entry) => {
      openedDoorKeys.delete(positionKey(entry));
      if (entry.corridor) openedCorridorKeys.delete(positionKey(entry.corridor));
    });
    state.exploration.openedDoorKeys = Array.from(openedDoorKeys);
    state.exploration.openedCorridorKeys = Array.from(openedCorridorKeys);
    addLog(`${actor.name} closes the door.`, "important");
    render();
    return true;
  }
  return openDoor(door, actor);
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
  if (heroRoom && currentDiscoveredRoomIds().has(heroRoom.id) && monstersInRoom(heroRoom.id).length > 0 && !fighterIsStealthing(hero)) {
    return null;
  }
  return distance(hero.position, door) <= 1 ? door : null;
}

function autoOpenAdjacentExplorationDoor(fighter) {
  if (!isPartyHeroId(fighter.id) || state.mode !== "exploration") return false;
  const door = doorAt(fighter.position) || doorsAtCorridorMouth(fighter.position).length > 0 ? canOpenDoor(fighter.position, fighter) : null;
  return door ? openDoor(door, fighter) : false;
}

function threatPresent() {
  return threateningMonsters().length > 0;
}

function endCurrentEncounter() {
  endRages("as the fight ends");
  removeSummonedAllies("fades as the fight ends");
  partyHeroes().forEach(clearTurnScopedCombatState);
  state.deathSaveAfterVictoryLogged = false;
  state.combatStarted = false;
  state.mode = "exploration";
  ensureDungeonClock().lastRealMs = Date.now();
  state.initiative = [];
  state.activeIndex = 0;
  partyHeroes().forEach(resetTurnResources);
  checkDungeonCompletion();
}

function combatBlockingOverlayOpen() {
  return [els.mainMenu, els.fighterInfo, els.inventoryMenu, els.useItemMenu, els.abilitiesMenu, els.homeMenu, els.travelMapMenu, els.travelCampMenu, els.villageMenu, els.storeMenu, els.gameDialog].some(
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
    (monster) => fledMonsterIds.has(monster.id) && !activeIds.has(monster.id) && partyHeroInMonsterRoom(monster),
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
  if (travelEncounterLocksRetreat()) {
    return { ok: false, reason: state.travelReturnCamp?.lockRetreatReason ?? "This encounter must be finished before the party can leave." };
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
  const shouldClearFightingPitWave =
    typeof handleFightingPitWaveClear === "function" &&
    typeof fightingPitCurrentRun === "function" &&
    fightingPitCurrentRun() &&
    !aliveMonsters().some((monster) => monster.fightingPitMonster);
  endCurrentEncounter();
  addLog(`Debug: removed ${targets.length} visible monster${targets.length === 1 ? "" : "s"}.`, "important");
  if (shouldClearFightingPitWave) {
    void handleFightingPitWaveClear();
  } else {
    render();
  }
}

async function rollInitiative() {
  if (state.combatStarted) return;

  const monsters = threateningMonsters();
  if (monsters.length === 0) return;
  syncDungeonClock();
  const heroEntries = partyHeroes().map((hero) => {
    const rollResult = rollD20ForFighter(hero, { advantage: (isSidekickWarrior(hero) && (hero.level ?? 1) >= 7) || (hero.classId === "barbarian" && (hero.level ?? 1) >= 7) });
    const heroRoll = rollResult.roll;
    return {
      fighterId: hero.id,
      fighter: hero,
      side: "hero",
      roll: heroRoll,
      rolls: rollResult.rolls,
      total: heroRoll + hero.initiativeBonus,
    };
  });
  for (const entry of heroEntries) {
    const hero = entry.fighter;
    const ambush = reactionAbility(hero, "maneuverAmbush");
    if (!canSpendCombatAbility(hero, ambush)) continue;
    const useAmbush = await showReactionPrompt({
      actor: hero,
      title: "Ambush",
      message: `${hero.name} rolled ${entry.total} initiative. Spend superiority to add a die?`,
      acceptLabel: "Add Die",
      declineLabel: "Save It",
    });
    if (!useAmbush) continue;
    spendCombatAbilityUse(hero, ambush);
    const die = rollDice(1, (hero.level ?? 1) >= 18 ? 12 : (hero.level ?? 1) >= 10 ? 10 : 8);
    entry.total += die.total;
    addLog(`${hero.name} uses Ambush for +${die.total} initiative.`, "important");
  }

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
  startNextEncounterEffects();
  for (const entry of state.initiative) {
    const fighter = state.fighters[entry.fighterId];
    if (!fighter || !heroCanAct(fighter)) continue;
    const actionLocked = (fighter.statusEffects ?? []).some((effect) => effect.actionLocked);
    fighter.hasReaction = !actionLocked;
  }
  partyHeroes().forEach((hero) => {
    if (hero.stealth) hero.stealth = { active: false };
  });
  monsterEntries.forEach((entry) => fledMonsterIds.delete(entry.fighterId));
  state.round = 1;
  state.activeIndex = 0;
  for (const hero of partyHeroes()) {
    const restoreOne = (abilityId, featureName) => {
      const ability = fighterAbilityDefinitions(hero).find((entry) => entry.id === abilityId);
      if (ability && (hero.abilityUses?.[abilityId] ?? 0) >= abilityMaxUses(hero, ability)) {
        hero.abilityUses[abilityId] = Math.max(0, (hero.abilityUses?.[abilityId] ?? 0) - 1);
        addLog(`${hero.name}'s ${featureName} restores one use.`, "important");
      }
    };
    if (hero.subclassId === "arcane-archer" && (hero.level ?? 1) >= 15) restoreOne("arcaneShotBursting", "Ever-Ready Shot");
    if (hero.subclassId === "battle-master" && (hero.level ?? 1) >= 14) restoreOne("maneuverPrecision", "Relentless");
    if (hero.subclassId === "samurai" && (hero.level ?? 1) >= 10) restoreOne("fightingSpirit", "Tireless Spirit");
    if (hero.subclassId === "echo-knight" && (hero.level ?? 1) >= 18) restoreOne("unleashIncarnation", "Legion of One");
    if (hero.classId === "monk" && (hero.level ?? 1) >= 20) {
      const kiAbilities = fighterAbilityDefinitions(hero).filter((ability) => ability.resourcePool === "ki");
      const spentKi = kiAbilities.reduce((sum, ability) => sum + (hero.abilityUses?.[ability.id] ?? 0), 0);
      if (spentKi >= Math.max(0, hero.level ?? 1)) {
        hero.abilityUses = { ...(hero.abilityUses ?? {}) };
        let restored = 0;
        for (const ability of kiAbilities) {
          while ((hero.abilityUses[ability.id] ?? 0) > 0 && restored < 4) {
            hero.abilityUses[ability.id] -= 1;
            restored += 1;
          }
          if (restored >= 4) break;
        }
        addLog(`${hero.name}'s Perfect Self restores 4 ki as combat begins.`, "important");
      }
    }
  }
  syncActiveHeroToTurn();
  resetTurnResources(activeFighter());

  addLog(
    `Initiative: ${[...heroEntries, ...monsterEntries]
      .map((entry) => `${state.fighters[entry.fighterId].name} rolls ${entry.roll} ${abilityLabel(state.fighters[entry.fighterId].initiativeBonus)} = ${entry.total}`)
      .join("; ")}.`,
    "important",
  );
  addTurnStartLog(activeFighter());
  if (await resolveTurnStartHazardsForActiveFighter()) return;

  render();
  maybeRunMonsterTurn();
}

function destroyDungeonObject(object, source = activeFighter()) {
  const name = objectTargetName(object);
  const position = objectTargetPosition(object, source) ?? object.position;
  if ((object.items ?? []).length > 0) {
    addLootPile({
      id: `loot-object-${object.id}-${Date.now()}`,
      position: { ...position },
      money: normalizeMoney(),
      items: [...object.items],
    });
  }
  state.dungeonObjects = (state.dungeonObjects ?? []).filter((entry) => entry.id !== object.id);
  if (selectedAttackTargetId === object.id) selectedAttackTargetId = null;
  addLog(`${name} is destroyed.`, "important");
}

async function attackDestructibleObject(attacker, object, options = {}) {
  if (!attacker || !objectIsDestructible(object)) return;
  ensureDestructibleObjectState(object);
  const usesCombatAction = state.mode === "combat";
  const usesBonusAction = options.resource === "bonusAction";
  if (!heroCanAct(attacker) || (usesCombatAction && (usesBonusAction ? !attacker.hasBonusAction : !attacker.hasAction))) return;

  const weapon = options.weapon ?? (options.weaponSlot ? weaponFromSlot(attacker, options.weaponSlot) : activeWeapon(attacker));
  const attackDamage = damageProfile(attacker, { weapon, includeDamageModifier: options.includeDamageModifier });
  const thrownAsMelee = weapon?.properties?.includes("thrown") && objectCells(object).some((cell) => attackGridDistanceFromFighterToPosition(attacker, cell) <= 1);
  if (thrownAsMelee) attackDamage.range = { kind: "melee", feet: 5 };
  if (!isObjectInAttackRangeWithProfile(attacker, object, attackDamage)) {
    addLog(`${attacker.name} is too far away to attack ${objectTargetName(object)}. Move closer first.`);
    render();
    return;
  }

  if (!itemHasUsableAmmo(attacker, weapon)) {
    addLog(`${attacker.name} needs ammunition in the quiver to use ${weapon.name}.`);
    render();
    return;
  }

  if (usesCombatAction) {
    if (usesBonusAction) attacker.hasBonusAction = false;
    else {
      attacker.attacksRemaining = Math.max(0, (attacker.attacksRemaining ?? attacksPerAttackAction(attacker)) - 1);
      attacker.hasAction = attacker.attacksRemaining > 0;
    }
  }
  spendAmmunition(attacker, weapon);
  if (weapon?.properties?.includes("thrown") && !thrownAsMelee) {
    recordMonsterThrownWeaponUse(attacker, weapon);
    dropThrownWeapon(attacker, weapon, objectTargetPosition(object, attacker));
  }
  const rangedAttack = !thrownAsMelee && (weaponIsRanged(weapon) || ["ranged", "thrown"].includes(attackDamage.range?.kind));
  playSoundEffect(rangedAttack ? "rangedAttack" : "meleeAttack");

  const attackAdvantage = (attacker.statusEffects ?? []).some((effect) => effect.attackAdvantage);
  const attackRollResult = rollD20ForFighter(attacker, { advantage: attackAdvantage });
  const attackRoll = attackRollResult.roll;
  const attackRolls = attackRollResult.rolls;
  const currentAttackBonus = attackBonusForWeapon(attacker, weapon);
  const targetAc = objectArmorClass(object);
  const totalAttack = attackRoll + currentAttackBonus;
  const isCritical = attackRoll === 20;
  const isMiss = attackRoll === 1 || totalAttack < targetAc;
  const targetName = objectTargetName(object);
  addLog(`${attacker.name} attacks ${targetName}${attackAdvantage ? " with advantage" : ""}: d20 ${attackRolls.length > 1 ? `${attackRolls.join(" / ")} -> ${attackRoll}` : attackRoll} ${abilityLabel(currentAttackBonus)} = ${totalAttack} vs AC ${targetAc}.`);
  addAdminLog(`${attacker.name} object attack breakdown vs ${targetName}: ${d20RollDetail(attackRollResult)} + attack ${abilityLabel(currentAttackBonus)} = ${totalAttack}; target AC ${targetAc}; ${isMiss ? "miss" : isCritical ? "critical hit" : "hit"}.`);

  if (isMiss) {
    addLog(attackRoll === 1 ? `Natural 1. ${attacker.name} fails to damage ${targetName}.` : `${attacker.name}'s blow glances off ${targetName}.`);
    recordD20OutcomeForFighter(attacker, false);
    render();
    return;
  }
  recordD20OutcomeForFighter(attacker, true);

  const damageRoll = attackDamage.flat
    ? { total: attackDamage.flat, rolls: [attackDamage.flat] }
    : rollDice(attackDamage.count * (isCritical ? 2 : 1), attackDamage.sides);
  let totalDamage = Math.max(1, damageRoll.total + attackDamage.bonus);
  for (const extra of attackDamage.extraDamage ?? []) {
    const extraRoll = rollDice((extra.count ?? 1) * (isCritical ? 2 : 1), extra.sides ?? 4);
    totalDamage += Math.max(1, extraRoll.total + (extra.bonus ?? 0));
  }
  if (activeWeaponMatchesTemplate(attacker, weapon, [barrowCrownItemIds.bellRingersMaul, barrowCrownItemIds.bellRingersWarhammer])) {
    totalDamage *= 2;
    addLog(`${attacker.name}'s Bell-Ringer weapon resonates through ${targetName}, doubling the damage.`, "important");
  }
  object.hp = Math.max(0, (object.hp ?? objectMaxHp(object)) - totalDamage);
  const critText = isCritical ? " Critical hit." : "";
  addLog(`${attacker.name} hits ${targetName} for ${totalDamage} damage (${damageRoll.rolls.join(" + ")} ${abilityLabel(attackDamage.bonus)}${attackDamage.type ? ` ${attackDamage.type}` : ""}). ${object.hp}/${object.maxHp} HP remains.${critText}`, "damage");
  const destroyed = object.hp <= 0;
  if (destroyed) destroyDungeonObject(object, attacker);
  render();
  if (destroyed) hideFighterInfo?.();
  else if (!els.fighterInfo.classList.contains("hidden")) showDungeonObjectInfo(object);
}

function targetHasCommandBreakingCondition(target) {
  return monsterIsUndead(target) || (target.statusEffects ?? []).some((effect) => {
    const text = `${effect.id ?? ""} ${effect.label ?? ""}`.toLowerCase();
    return /charmed|frightened|possessed|commanded|dominated|beguiled/.test(text);
  });
}

async function maybeApplyBlackMarketCoin(attacker, packets) {
  if (!isPartyHeroId(attacker?.id) || !activeMagicItemByTemplate(attacker, barrowCrownItemIds.blackMarketCoin)) return;
  const key = itemPowerKey(barrowCrownItemIds.blackMarketCoin, `paidInBlood:${state.round ?? 0}:${attacker.id}`);
  if (!canUseItemPower(attacker, key)) return;
  const useCoin = await showReactionPrompt({
    actor: attacker,
    title: "Paid in Blood",
    message: "Flip the Black Market Coin for this hit? 1-3 hurts you; 4-6 adds necrotic damage.",
    acceptLabel: "Flip Coin",
    declineLabel: "No",
  });
  if (!useCoin) return;
  spendItemPower(attacker, key, "turn");
  const roll = rollDie(6);
  if (roll <= 3) {
    const damage = proficiencyBonus(attacker);
    applySpecialDamage(attacker, attacker, damage, "necrotic", "Black Market Coin");
    addLog(`${attacker.name}'s Black Market Coin shows blood. ${attacker.name} takes ${damage} necrotic damage.`, "important");
  } else {
    const damage = Math.max(1, proficiencyBonus(attacker) * 2);
    packets.push({ raw: damage, type: "necrotic", label: `Black Market Coin ${damage} necrotic` });
    addLog(`${attacker.name}'s Black Market Coin shows profit. The hit gains ${damage} necrotic damage.`, "important");
  }
}

async function maybeUseUnfairBargain(attacker, totalAttack, defenderAc) {
  if (!isPartyHeroId(attacker?.id) || totalAttack >= defenderAc || !activeMagicItemByTemplate(attacker, barrowCrownItemIds.blackMarketCoin)) return false;
  const key = itemPowerKey(barrowCrownItemIds.blackMarketCoin, "unfairBargain");
  if (!canUseItemPower(attacker, key)) return false;
  const useBargain = await showReactionPrompt({
    actor: attacker,
    title: "Unfair Bargain",
    message: `The attack misses AC ${defenderAc}. Use Black Market Coin to make it hit?`,
    acceptLabel: "Make It Hit",
    declineLabel: "Miss",
  });
  if (!useBargain) return false;
  const payExhaustion = await showReactionPrompt({
    actor: attacker,
    title: "Pay the Coin",
    message: "Pay with one level of exhaustion? Decline to take necrotic damage equal to twice your level instead.",
    acceptLabel: "Exhaustion",
    declineLabel: "Necrotic",
  });
  spendItemPower(attacker, key, "longRest");
  if (payExhaustion) {
    applyStatusEffect(attacker, { id: "exhaustion", label: "Exhaustion", condition: "exhaustion" });
    addLog(`${attacker.name} pays the Black Market Coin with exhaustion.`, "important");
  } else {
    const damage = Math.max(1, (attacker.level ?? 1) * 2);
    applySpecialDamage(attacker, attacker, damage, "necrotic", "Black Market Coin");
    addLog(`${attacker.name} pays the Black Market Coin with ${damage} necrotic damage.`, "important");
  }
  return true;
}

async function maybeApplyRingOfLastHeir(attacker, defender) {
  if (!isPartyHeroId(attacker?.id) || !defender?.alive || !activeMagicItemByTemplate(attacker, barrowCrownItemIds.lastHeirRing)) return;
  const key = itemPowerKey(barrowCrownItemIds.lastHeirRing, "royalCommand");
  if (!canUseItemPower(attacker, key)) return;
  const useCommand = await showReactionPrompt({
    actor: attacker,
    title: "Royal Command",
    message: `Command ${defender.name} to kneel? DC 14 Wisdom save; charm-immune targets have advantage.`,
    acceptLabel: "Command",
    declineLabel: "Save It",
  });
  if (!useCommand) return;
  spendItemPower(attacker, key, "shortRest");
  const charmImmune = damageFlagMatches(defender.conditionImmunities ?? [], "charmed");
  const save = savingThrow(defender, "wis", 14, { source: attacker, label: "Royal Command", advantage: charmImmune });
  addLog(`${attacker.name}'s Ring of the Last Heir commands ${defender.name} to kneel: WIS ${save.total} vs DC 14${charmImmune ? " with advantage" : ""}.`, "important");
  if (!save.success) {
    applyStatusEffect(defender, { id: "royal-command", label: "Commanded to Kneel", prone: true, speedLocked: true, expiresAtStartOfTurn: true });
    addLog(`${defender.name} falls prone and cannot move until ${attacker.name}'s next turn begins.`, "important");
  }
}

async function maybeApplyCrownshardSeverCommand(attacker, defender, weapon) {
  if (!isPartyHeroId(attacker?.id) || !monsterIsUndead(defender) || !activeWeaponMatchesTemplate(attacker, weapon, [barrowCrownItemIds.crownshardShortsword, barrowCrownItemIds.crownshardLongsword, barrowCrownItemIds.crownshardGreatsword])) return;
  const key = itemPowerKey(weapon.baseItemId ?? weapon.itemId ?? weapon.id, "severCommand");
  if (!canUseItemPower(attacker, key)) return;
  const useSever = await showReactionPrompt({
    actor: attacker,
    title: "Sever Command",
    message: `Attempt to command ${defender.name}? DC 16 Charisma save. On failure it fights beside the party for this combat.`,
    acceptLabel: "Sever Command",
    declineLabel: "Save It",
  });
  if (!useSever) return;
  spendItemPower(attacker, key, "shortRest");
  const save = savingThrow(defender, "cha", 16, { source: attacker, label: "Sever Command" });
  addLog(`${attacker.name}'s Crownshard attempts to sever command: ${defender.name} rolls CHA ${save.total} vs DC 16.`, "important");
  if (!save.success) {
    defender.team = "heroes";
    defender.friendly = true;
    defender.aiControlled = true;
    defender.barrowCrownDustAfterCombat = true;
    applyStatusEffect(defender, { id: "sever-command", label: "Severed Command", durationRounds: 99 });
    addLog(`${defender.name} is bound to fight beside the party for this combat. The Crownshard will turn it to dust afterward.`, "important");
  }
}

async function maybeApplyCrownshardCrownbreaker(attacker, defender, weapon, isCritical) {
  if (!isCritical || !isPartyHeroId(attacker?.id) || !activeWeaponMatchesTemplate(attacker, weapon, [barrowCrownItemIds.crownshardShortsword, barrowCrownItemIds.crownshardLongsword, barrowCrownItemIds.crownshardGreatsword])) return;
  const key = itemPowerKey(weapon.baseItemId ?? weapon.itemId ?? weapon.id, "crownbreaker");
  if (!canUseItemPower(attacker, key)) return;
  const targets = visibleMonsters().filter((monster) => monster.alive && fightersWithinSquares(attacker, monster, 3));
  if (!targets.length) return;
  const useCrownbreaker = await showReactionPrompt({
    actor: attacker,
    title: "Crownbreaker",
    message: `Force ${targets.length} hostile creature${targets.length === 1 ? "" : "s"} within 15 feet to save against fear?`,
    acceptLabel: "Break Them",
    declineLabel: "Save It",
  });
  if (!useCrownbreaker) return;
  spendItemPower(attacker, key, "longRest");
  for (const target of targets) {
    const save = savingThrow(target, "wis", 16, { source: attacker, label: "Crownbreaker" });
    addLog(`${target.name} rolls WIS ${save.total} vs DC 16 against Crownbreaker.`, "important");
    if (!save.success) applyStatusEffect(target, { id: "frightened", label: "Frightened", attackBonus: -2, expiresAtEndOfTurn: true });
  }
}

async function maybeApplyBarrowCrownOnHit(attacker, defender, weapon, packets, isCritical) {
  await maybeApplyBlackMarketCoin(attacker, packets);
  await maybeApplyRingOfLastHeir(attacker, defender);
  if (activeWeaponMatchesTemplate(attacker, weapon, [barrowCrownItemIds.bellRingersMaul, barrowCrownItemIds.bellRingersWarhammer])) {
    const key = itemPowerKey(weapon.baseItemId ?? weapon.itemId ?? weapon.id, `funeralToll:${state.round ?? 0}:${attacker.id}`);
    const splash = visibleMonsters().find((monster) => monster.id !== defender.id && monster.alive && fightersWithinSquares(monster, defender, 2));
    if (splash && canUseItemPower(attacker, key)) {
      spendItemPower(attacker, key, "turn");
      applySpecialDamage(attacker, splash, Math.max(1, proficiencyBonus(attacker)), "thunder", "Funeral Toll");
    }
  }
  if (activeWeaponMatchesTemplate(attacker, weapon, [barrowCrownItemIds.crownshardShortsword, barrowCrownItemIds.crownshardLongsword, barrowCrownItemIds.crownshardGreatsword])) {
    if (targetHasCommandBreakingCondition(defender)) {
      const roll = rollDice(1, 8);
      packets.push({ raw: Math.max(1, roll.total), type: monsterIsUndead(defender) ? "radiant" : "necrotic", label: `No King Above Me ${roll.rolls[0]} ${monsterIsUndead(defender) ? "radiant" : "necrotic"}` });
    }
    await maybeApplyCrownshardSeverCommand(attacker, defender, weapon);
    await maybeApplyCrownshardCrownbreaker(attacker, defender, weapon, isCritical);
  }
}

async function makeAttack(attacker, defender, options = {}) {
  if (isPartyHeroId(attacker?.id) && attacker.hp <= 0) return;
  const usesBonusAction = options.resource === "bonusAction";
  const usesFreeAttack = Boolean(options.freeAttack);
  if (!attacker.alive || !defender.alive || (!usesFreeAttack && (usesBonusAction ? !attacker.hasBonusAction : !attacker.hasAction))) return;
  const weapon = options.weapon ?? (options.weaponSlot ? weaponFromSlot(attacker, options.weaponSlot) : activeWeapon(attacker));
  const thrownAsMelee = weapon?.properties?.includes("thrown") && hasMeleeAccess(attacker, defender);
  const attackDamage = damageProfile(attacker, { weapon, includeDamageModifier: options.includeDamageModifier });
  if (thrownAsMelee) attackDamage.range = { kind: "melee", feet: 5 };

  if (!isInAttackRangeWithProfile(attacker, defender, attackDamage)) {
    addLog(`${attacker.name} is too far away to attack ${defender.name}. Move closer first.`);
    render();
    return;
  }

  if (profileRangeSquares(attackDamage) > 1 && !hasClearLineOfSightBetweenFighters(attacker, defender)) {
    addLog(`${attacker.name} does not have a clear line of sight to ${defender.name}.`);
    render();
    return;
  }

  if (!itemHasUsableAmmo(attacker, weapon)) {
    addLog(`${attacker.name} needs ammunition in the quiver to use ${weapon.name}.`);
    render();
    return;
  }

  await maybeUseBraceBeforeAttack(attacker);
  if (!attacker.alive) {
    render();
    return;
  }

  if (usesFreeAttack) {
    // Part of the same Attack action, such as Beast Barbarian claws.
  } else if (usesBonusAction) attacker.hasBonusAction = false;
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
  if (fighterHasFeat(attacker, "mobile") && !rangedAttack) {
    attacker.mobileNoOpportunityFrom = uniqueValues([...(attacker.mobileNoOpportunityFrom ?? []), defender.id]);
  }
  playSoundEffect(rangedAttack ? "rangedAttack" : "meleeAttack");
  const adjacentHostiles = hostileFightersAdjacentTo(attacker).length > 0;
  const rangedDisadvantage = rangedAttack && adjacentHostiles && !fighterHasFeat(attacker, "crossbow-expert") && !fighterHasFeat(attacker, "gunner");
  const lightContext = attackLightContext(attacker, defender);
  const targetReckless = defenderGrantsAttackAdvantage(defender);
  const attackAdvantage =
    targetReckless ||
    (attacker.statusEffects ?? []).some((effect) => effect.attackAdvantage) ||
    (fighterHasFeat(attacker, "grappler") && fighterStatusEffect(defender, "grappled")?.grappledBy === attacker.id) ||
    (warlockKnowsInvocation(attacker, "devilsSight") && targetIsInMagicalDarkness(defender)) ||
    (warlockKnowsInvocation(attacker, "witchSight") && targetIsCursedOrObscured(defender));
  const defenderDodge = defender.dodging;
  const defendedBySidekick = await maybeUseWarriorDefender(attacker, defender);
  const hasDisadvantage = rangedDisadvantage || defenderDodge || defendedBySidekick || lightContext.disadvantage;
  const attackRollResult = rollD20ForFighter(attacker, { advantage: attackAdvantage && !hasDisadvantage, disadvantage: hasDisadvantage && !attackAdvantage });
  const attackRolls = attackRollResult.rolls;
  const criticalResult = applyMeleeAutoCritical(resolveMonsterHeroCritical(attacker, defender, attackRollResult.roll), attacker, defender, hasMeleeAccess(attacker, defender));
  const attackRoll = criticalResult.attackRoll;
  let defenderAc = armorClass(defender);
  const currentAttackBonus = attackBonusForWeapon(attacker, weapon);
  let totalAttack = attackRoll + currentAttackBonus;
  const isCritical = criticalResult.isCritical;
  const doublesDamage = criticalResult.doublesDamage;
  const inspiration = await maybeUseBardicAttackDie(attacker, totalAttack, defenderAc);
  totalAttack = inspiration.totalAttack;
  const bendLuck = await maybeUseBendLuckAttack(attacker, totalAttack, defenderAc);
  totalAttack = bendLuck.totalAttack;
  const hitReaction = attackRoll !== 1 && totalAttack >= defenderAc ? await maybeUseHitReactionDefenses(attacker, defender, totalAttack, currentAttackBonus, defenderAc) : { totalAttack, acBonus: 0, blocked: false, resistance: false };
  totalAttack = hitReaction.totalAttack;
  defenderAc += hitReaction.acBonus ?? 0;
  const shieldBlocked = !hitReaction.blocked && attackRoll !== 1 && totalAttack >= defenderAc ? await maybeUseShieldReaction(defender, attacker, totalAttack, defenderAc) : false;
  const isMiss = attackRoll === 1 || hitReaction.blocked || (!criticalResult.forcedHit && totalAttack < defenderAc) || shieldBlocked;

  addLog(
    `${attacker.name} ${options.actionLabel ?? "attacks"}${attackAdvantage && !hasDisadvantage ? targetReckless ? " with advantage because the target attacked recklessly" : " with advantage" : ""}${rangedDisadvantage && !attackAdvantage ? " with disadvantage" : ""}${defenderDodge && !attackAdvantage ? " because the target is dodging" : ""}${defendedBySidekick && !attackAdvantage ? " because of Defender" : ""}${lightContext.disadvantage && !attackAdvantage ? attackLightDisadvantageText(lightContext) : ""}: d20 ${
      attackRolls.length > 1 ? `${attackRolls.join(" / ")} -> ${attackRoll}` : attackRoll
    } ${abilityLabel(currentAttackBonus)}${inspiration.used ? " + inspiration" : ""} = ${totalAttack} vs AC ${
      defenderAc
    }.${criticalResult.note ? ` ${criticalResult.note}` : ""}`,
  );
  addAdminLog(`${attacker.name} attack breakdown vs ${defender.name}: ${d20RollDetail(attackRollResult)}${criticalResult.attackRoll !== attackRollResult.roll ? ` -> ${d20ModeLabels.karmic} d20 ${attackRoll}` : ""} + attack ${abilityLabel(currentAttackBonus)}${inspiration.used ? ` + inspiration ${inspiration.roll}` : ""} = ${totalAttack}; target AC ${defenderAc}; ${isMiss ? "miss" : isCritical ? "critical hit" : "hit"}${criticalResult.note ? `; ${criticalResult.note}` : ""}${lightContext.note ? `; ${lightContext.note}` : ""}.`);

  if (isMiss) {
    addLog(attackRoll === 1 ? "Natural 1. The attack misses badly." : shieldBlocked ? `${defender.name} blocks the blow with Shield.` : `${defender.name} avoids the blow.`);
    recordD20OutcomeForFighter(attacker, false);
    await maybeUseRiposte(defender, attacker, !rangedAttack);
    await maybeUseStoneRuneAfterAttack(attacker, defender);
    await maybeUseBeastClawExtraAttack(attacker, defender, options);
    render();
    return;
  }
  recordD20OutcomeForFighter(attacker, true);

  const damageRoll = attackDamage.flat
    ? { total: attackDamage.flat, rolls: [attackDamage.flat] }
    : rollDice(attackDamage.count * (doublesDamage ? 2 : 1), attackDamage.sides);
  const packets = [
    {
      raw: Math.max(1, damageRoll.total + attackDamage.bonus),
      type: attackDamage.type,
      label: `${damageRoll.rolls.join(" + ")} ${abilityLabel(attackDamage.bonus)}${attackDamage.type ? ` ${attackDamage.type}` : ""}`,
    },
  ];
  if (doublesDamage && !rangedAttack && attacker.racialTraits?.savageAttacks && attackDamage.sides) {
    const savageRoll = rollDice(1, attackDamage.sides);
    packets.push({
      raw: savageRoll.total,
      type: attackDamage.type,
      label: `Savage Attacks ${savageRoll.rolls.join(" + ")}${attackDamage.type ? ` ${attackDamage.type}` : ""}`,
    });
  }
  if (doublesDamage && !rangedAttack && attacker.classId === "barbarian" && (attacker.level ?? 1) >= 9 && attackDamage.sides) {
    const brutalDice = (attacker.level ?? 1) >= 17 ? 3 : (attacker.level ?? 1) >= 13 ? 2 : 1;
    const brutalRoll = rollDice(brutalDice, attackDamage.sides);
    packets.push({
      raw: brutalRoll.total,
      type: attackDamage.type,
      label: `Brutal Critical ${brutalRoll.rolls.join(" + ")}${attackDamage.type ? ` ${attackDamage.type}` : ""}`,
    });
  }
  for (const extra of attackDamage.extraDamage ?? []) {
    const extraRoll = rollDice((extra.count ?? 1) * (doublesDamage ? 2 : 1), extra.sides ?? 4);
    packets.push({
      raw: Math.max(1, extraRoll.total + (extra.bonus ?? 0)),
      type: extra.type,
      label: `${extraRoll.rolls.join(" + ")}${extra.bonus ? ` ${abilityLabel(extra.bonus)}` : ""} ${extra.type}`,
    });
  }
  if (canApplySneakAttack(attacker, defender, weapon, rangedAttack)) {
    const diceCount = sneakAttackDice(attacker) * (doublesDamage ? 2 : 1);
    const sneakRoll = rollDice(diceCount, 6);
    packets.push({
      raw: sneakRoll.total,
      type: attackDamage.type,
      label: `Sneak Attack ${sneakRoll.rolls.join(" + ")} ${attackDamage.type}`,
    });
    attacker.sneakAttackUsedThisTurn = true;
  }
  if (attacker.classId === "cleric" && (attacker.level ?? 1) >= 8 && !attacker.blessedStrikeUsedThisTurn) {
    const blessedRoll = rollDice(1, 8);
    packets.push({
      raw: blessedRoll.total,
      type: "radiant",
      label: `Blessed Strike ${blessedRoll.rolls.join(" + ")} radiant`,
    });
    attacker.blessedStrikeUsedThisTurn = true;
  }
  const favoredFoePacket = await maybeApplyFavoredFoe(attacker, defender);
  if (favoredFoePacket) packets.push(favoredFoePacket);
  if (!rangedAttack && warlockKnowsInvocation(attacker, "lifedrinker")) {
    const lifeDamage = Math.max(1, abilityMod(attacker, "cha"));
    packets.push({
      raw: lifeDamage,
      type: "necrotic",
      label: `Lifedrinker ${lifeDamage} necrotic`,
    });
  }
  if (!rangedAttack && warlockHasPact(attacker, "pactBlade")) {
    const bladeDamage = Math.max(1, Math.floor(proficiencyBonus(attacker) / 2));
    packets.push({
      raw: bladeDamage,
      type: "force",
      label: `Pact Blade ${bladeDamage} force`,
    });
  }
  if (!rangedAttack && attacker.subclassId === "zealot" && (attacker.level ?? 1) >= 3 && !attacker.zealotDivineFuryUsedThisTurn && (attacker.statusEffects ?? []).some((effect) => effect.id === "rage")) {
    const divineRoll = rollDice(1, 6);
    const divineBonus = Math.max(1, Math.floor((attacker.level ?? 1) / 2));
    packets.push({
      raw: divineRoll.total + divineBonus,
      type: "radiant",
      label: `Divine Fury ${divineRoll.rolls.join(" + ")} ${abilityLabel(divineBonus)} radiant`,
    });
    attacker.zealotDivineFuryUsedThisTurn = true;
  }
  const rider = consumeWeaponRider(attacker, attackDamage);
  if (rider?.damageBonus) {
    packets.push({
      raw: rider.damageBonus,
      type: rider.damageType ?? "radiant",
      label: `${rider.label ?? "Weapon rider"} ${rider.damageBonus} ${rider.damageType ?? "radiant"}`,
    });
    addLog(`${attacker.name}'s ${rider.label ?? "weapon rider"} is released on the hit.`, "important");
    if (rider.riderStatus === "prone") applyStatusEffect(defender, { id: "prone", label: "Prone", attackBonus: -2, speedBonusFeet: -10, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "restrained") applyStatusEffect(defender, { id: "restrained", label: "Restrained", speedLocked: true, attackBonus: -2, durationRounds: 1 });
    if (rider.riderStatus === "hamstrung") applyStatusEffect(defender, { id: "hamstrung", label: "Hamstrung", speedBonusFeet: -10, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "shaken") applyStatusEffect(defender, { id: "shaken", label: "Shaken", attackBonus: -2, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "marked") applyStatusEffect(defender, { id: `marked-by-${attacker.id}`, label: "Marked", attackBonus: -1, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "disarmed") applyStatusEffect(defender, { id: "disarmed", label: "Disarmed", attackBonus: -2, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "distracted") applyStatusEffect(defender, { id: "distracted", label: "Distracted", acBonus: -2, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "frightened") applyStatusEffect(defender, { id: "frightened", label: "Frightened", attackBonus: -2, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "enfeebled") applyStatusEffect(defender, { id: "enfeebled", label: "Enfeebled", damageBonus: -2, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "blinded") applyStatusEffect(defender, { id: "blinded", label: "Blinded", attackBonus: -3, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "banished") applyStatusEffect(defender, { id: "banished", label: "Banished", speedLocked: true, actionLocked: true, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "charmed") applyStatusEffect(defender, { id: "beguiled", label: "Beguiled", attackBonus: -2, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "stunned") applyStatusEffect(defender, { id: "stunned", label: "Stunned", speedLocked: true, actionLocked: true, durationRounds: 1 });
    if (rider.riderStatus === "sweeping") {
      const splash = visibleMonsters().find((monster) => monster.id !== defender.id && fightersWithinSquares(monster, defender, 1));
      if (splash) applySpecialDamage(attacker, splash, Math.max(1, Math.floor(rider.damageBonus / 2)), attackDamage.type, "Sweeping Attack");
    }
  }
  if (rider?.poison) await applyWeaponRiderSecondary(attacker, defender, rider, attackDamage);
  await maybeApplyBarrowCrownOnHit(attacker, defender, weapon, packets, isCritical);
  if (isPartyHeroId(defender.id) && adminEnabled() && adminGodMode) {
    addLog(`God mode prevents ${attacker.name}'s damage to ${defender.name}.`, "important");
    render();
    return;
  }
  const resolvedPackets = packets.map((packet) => ({ ...packet, ...calculateDamageModifiers(defender, packet.raw, packet.type) }));
  addAdminLog(`${attacker.name} damage packets vs ${defender.name}: ${resolvedPackets.map((packet) => `${packet.label} => raw ${packet.raw}, final ${packet.damage}${packet.reason ? ` (${packet.reason})` : ""}`).join("; ")}.`);
  const packetTotalDamage = resolvedPackets.reduce((sum, packet) => sum + packet.damage, 0);
  const packetNecroticDamage = resolvedPackets.reduce((sum, packet) => sum + (String(packet.type ?? "").toLowerCase() === "necrotic" ? packet.damage : 0), 0);
  let totalDamage = packetTotalDamage;
  if (hitReaction.resistance) totalDamage = Math.floor(totalDamage / 2);
  totalDamage = maybeUseMonsterDamageReduction(defender, attacker, totalDamage, !rangedAttack);
  totalDamage = await maybeUseUncannyDodge(defender, attacker, totalDamage);
  totalDamage = await maybeUseStoneEndurance(defender, totalDamage);
  totalDamage = await maybeUseBattleMasterParry(defender, attacker, totalDamage, !rangedAttack);
  totalDamage = await maybeUseProtectiveField(defender, totalDamage);
  totalDamage = await maybeUseSpiritShield(defender, attacker, totalDamage);
  totalDamage = await maybeUseDrownedLegionWall(defender, attacker, totalDamage, !rangedAttack);
  applyDamageToFighter(defender, totalDamage);
  defender.lastDamagedById = attacker.id;
  const encounterDefeated = partyDefeatedOrDying();
  const finalNecroticDamage =
    packetTotalDamage > 0 && packetNecroticDamage > 0 ? Math.max(0, Math.floor((packetNecroticDamage * totalDamage) / packetTotalDamage)) : 0;
  if (!encounterDefeated) maybeUseMonsterSoulSiphon(attacker, finalNecroticDamage, "necrotic");
  if (!encounterDefeated && !rangedAttack && warlockKnowsInvocation(attacker, "lifedrinker") && totalDamage > 0) {
    const healed = applyHealingToHero(attacker, Math.max(1, Math.floor(abilityMod(attacker, "cha") / 2)));
    if (healed > 0) addLog(`${attacker.name}'s Lifedrinker restores ${healed} HP.`, "heal");
  }
  if (!encounterDefeated && !isPartyHeroId(attacker.id)) {
    await applyMonsterOnHitSpecials(attacker, defender, totalDamage, doublesDamage);
  }
  if (!encounterDefeated && !isPartyHeroId(defender.id)) {
    await applyMonsterReactiveSpecials(defender, attacker, totalDamage, !rangedAttack, attackDamage.type);
  }
  if (!encounterDefeated) await maybeUseBarbarianAfterDamage(defender, attacker, totalDamage, !rangedAttack);
  if (!encounterDefeated) await maybeUseSubclassAfterDamageReactions(defender, attacker, totalDamage, !rangedAttack);
  if (!encounterDefeated && options.beastFormAttack === "bite" && totalDamage > 0 && !attacker.beastFormHitThisTurn && (attacker.hp ?? 0) < ((attacker.maxHp ?? 1) / 2)) {
    attacker.beastFormHitThisTurn = true;
    const healed = Math.min((attacker.maxHp ?? 0) - (attacker.hp ?? 0), Math.max(1, proficiencyBonus(attacker)));
    if (healed > 0) {
      attacker.hp += healed;
      addLog(`${attacker.name}'s Bestial Bite restores ${healed} HP.`, "heal");
    }
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
  await maybeUseStoneRuneAfterAttack(attacker, defender);
  if (!rider?.poison) await applyWeaponRiderSecondary(attacker, defender, rider, attackDamage);
  await applyWildShapeAttackEffects(attacker, defender, attackDamage);
  if (totalDamage > 0) await maybeUseHellishRebuke(defender, attacker);
  await maybeUseStoneRuneAfterAttack(attacker, defender);
  await maybeUseBeastClawExtraAttack(attacker, defender, options);

  if (!defender.alive && maybeUseMonsterDeathDefiance(defender, resolvedPackets)) {
    addLog(`${defender.name} claws back from the edge at 1 HP.`, "important");
  } else if (!defender.alive && maybeUseUndeadFortitude(defender, totalDamage)) {
    addLog(`${defender.name} refuses to fall and remains at 1 HP.`, "important");
  }

  maybeUseMonsterDropHealing(attacker, defender);

  if (!defender.alive) {
    addLog(`${defender.name} drops to 0 HP. ${isPartyHeroId(attacker.id) ? "Victory." : "Defeat."}`, "important");
    if (!isPartyHeroId(defender.id)) {
      await maybeTriggerMonsterDeathBurst(defender);
      triggerMonsterDeathStory(defender);
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

function monsterSpecialNameMatching(monster, pattern) {
  return monsterSpecialNames(monster).find((name) => pattern.test(name)) ?? null;
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

function monsterHasAnyTag(monster, tags = []) {
  const monsterTags = monster?.tags ?? [];
  return tags.some((tag) => monsterTags.includes(tag));
}

function monsterIsUndead(monster) {
  return monsterHasAnyTag(monster, ["undead", "ghost", "phantom", "wraith", "skeletal", "zombie"]);
}

function monsterIsFungusOrPlant(monster) {
  return monsterHasAnyTag(monster, ["plant", "fungus", "mycelium", "mushroom", "spore"]);
}

function healMonsterWithSpecial(source, target, amount, label) {
  if (!target?.alive || amount <= 0 || (target.hp ?? 0) >= (target.maxHp ?? 0)) return 0;
  const healed = applyHealingToHero(target, amount);
  if (healed > 0) addLog(`${source.name}'s ${label} heals ${target.name} for ${healed} HP.`, "heal");
  return healed;
}

function woundedMonsterAlliesInRange(monster, rangeFeet = 30, options = {}) {
  const rangeSquares = rangeFeet / feetPerSquare;
  return combatMonsters()
    .filter((candidate) => {
      if (!candidate?.alive) return false;
      if (!options.includeSelf && candidate.id === monster.id) return false;
      if ((candidate.hp ?? 0) >= (candidate.maxHp ?? 0)) return false;
      if (!fightersWithinSquares(candidate, monster, rangeSquares)) return false;
      return options.predicate ? options.predicate(candidate) : true;
    })
    .sort((a, b) => (a.hp ?? 0) / Math.max(1, a.maxHp ?? 1) - (b.hp ?? 0) / Math.max(1, b.maxHp ?? 1));
}

function monsterCanUsePreferredSpecialKind(monster, kind) {
  return !monster?.preferredSpecialActionKind || monster.preferredSpecialActionKind === kind;
}

function shouldAttemptMonsterActiveSpecial(monster, kind) {
  return monster?.preferredSpecialActionKind ? monsterCanUsePreferredSpecialKind(monster, kind) : shouldUseMonsterSpecial("active");
}

function monsterAiTargetSummary(targets, limit = 4) {
  const list = (targets ?? []).slice(0, limit).map((target) => `${target.name} ${target.hp ?? "?"}/${target.maxHp ?? "?"} HP`);
  const extra = (targets ?? []).length > limit ? `, +${targets.length - limit} more` : "";
  return list.length ? `${list.join("; ")}${extra}` : "none";
}

const monsterAreaSpecialPattern =
  /fireball|mass grave mortar|corpse cart spill|ashen burst|ember mortar|volcanic pulse|eruption cycle|open the pyre|caldera gate|world-pyre ascension|magma breath|dead sky|suffocating rain|blinding cyclone|crater slam|faultline strike|lava wake|split the battlefield|dust spin|thunderclap|crackling pulse|pressure rift|choir blast|tempest choir|split the heavens|starstorm fall|city-eater winds|neverending storm|cathedral winds|regent stormfall|tyrant downburst|queenly thunderbolt|baronial cyclone|breath of the plane|worldstorm body|needle spray|royal tremor|collapse district|open sinkhole|sovereign faultline|fault throne|tectonic verdict|crown of cairns|avalanche hammer|pillar fall|quake fist|graveyard slam|seismic sentence|boiling spray|tsunami front|crushing wave|endless deluge|drown the world|worldspring eruption|abyssal pressure|crown tide|leviathan roll|crush of oceans|corpse tide|hailglass volley|iceberg break|cloudburst devour|glacial advance|soot breath|furnace vent|valve twist|throw keg|molten slag breath|lava breath|anvil breath|drop the hook|anvil drop|colossus hammerfall|cave-in groan|support-beam breaker|pressure release|overpressure burst|grinding floor|plague breath|bile spray|blight belch|rot burst|rot crown pulse|doom scream|void bell toll|mournful cry|hollow wail|banshee keening|white bell wail|royal wail|grief pulse|origin wail|duke's war cry|crown of the ninefold pact|howl of hunger|panic shriek|abyssal roar|horror judgement|triple condemnation|chaos star|abyss unleashed|shriek alarm|panic spores|overmind spores|hurl debris|ethereal stomp|pit quake|world-stamp|world-cracker slam|dance of six deaths|whirling blades|rootquake|canopy collapse|first forest awakens|corpse slam|soul lantern|grave breath|soul furnace|moonlit dominion|forbidden chorus|corrupt wish|profane radiance|hellhound breath|branding lash|guilty flame|brimstone shell|burning hand of command|confession by fire|impaling advance|abyssal bile|vomit plague|dazzling spores|carrion spores|spores of filth|venom bloom|titan sporefall|midnight spores|plague king's mass|unstable fire|soul tempest|abyss storm|flaming whipstorm|gate pulse|maw of the abyss|reality tear|rift sovereignty|stampede|gravequake|stormhorn burst|root-rending roar|bossroar|venom spit|grave spark/i;

const monsterControlSpecialPattern =
  /false horizon|gravityless zone|silence of no air|thin air aura|drying wind|fog cover|foam screen|mist choke|drowning mist|black pool|blackwater seep|coral growth|absolute stillness|topple curse|reverse weight|gemscale flash|resonant note|coal toss|black smoke cloud|false lantern|lesser possession|noble possession|petty bargain|sulphur hex|sweetened damnation|infernal verdict|name in the ledger|praetor's challenge|chains of grace|false promise|prince's mark|musk charm|luring scent|locking chain|sentence to chains|living chains|chains of the ninth gate|root snare|constricting coil|stranglehold|forest judgment|living jungle|command the brambles|web snare|websnare/i;

function monsterHealingActionTargets(monster) {
  if (hasMonsterSpecial(monster, /unholy benediction/i) && !monster.usedSpecials?.UnholyBenediction) {
    return woundedMonsterAlliesInRange(monster, 30, { includeSelf: true, predicate: monsterIsUndead });
  }
  if (hasMonsterSpecial(monster, /brood spores/i) && !monster.usedSpecials?.BroodSpores) {
    return woundedMonsterAlliesInRange(monster, 30, { includeSelf: true, predicate: monsterIsFungusOrPlant });
  }
  if (hasMonsterSpecial(monster, /first forest awakens/i) && !monster.usedSpecials?.FirstForestHealing) {
    return woundedMonsterAlliesInRange(monster, 30, { includeSelf: true, predicate: monsterIsFungusOrPlant });
  }
  if (monsterSpecialNameMatching(monster, /healing|mending|renewal|benediction|regrowth|photosynthesis/i)) {
    return woundedMonsterAlliesInRange(monster, 30, { includeSelf: false });
  }
  return [];
}

function chooseMonsterSpecialActionKind(monster) {
  if (!monster?.hasAction) {
    addAdminLog(`${monster?.name ?? "Monster"} special scorer: no action available.`);
    return null;
  }
  const names = monsterSpecialNames(monster).join(" | ");
  const candidates = [];
  const healTargets = monsterHealingActionTargets(monster);
  if (healTargets.length) {
    const missing = healTargets.reduce((sum, target) => sum + Math.max(0, (target.maxHp ?? 0) - (target.hp ?? 0)), 0);
    const worstRatio = Math.min(...healTargets.map((target) => (target.hp ?? 0) / Math.max(1, target.maxHp ?? 1)));
    candidates.push({
      kind: "heal",
      score: 18 + Math.min(36, missing / 3) + (worstRatio <= 0.35 ? 16 : worstRatio <= 0.6 ? 8 : 0) + Math.min(8, healTargets.length * 2),
    });
    addAdminLog(`${monster.name} special scorer: heal candidate, missing HP ${missing}, worst ally ${Math.round(worstRatio * 100)}%, targets ${monsterAiTargetSummary(healTargets)}.`);
  } else {
    addAdminLog(`${monster.name} special scorer: no healing candidate in 30 ft.`);
  }

  if (monsterAreaSpecialPattern.test(names)) {
    const burstTargets = targetsInMonsterSpecialRange(monster, monsterSpecialAbilityTuning.burstRangeFeet).length;
    const rangedTargets = targetsInMonsterSpecialRange(monster, monsterSpecialAbilityTuning.rangedSpecialFeet).length;
    const targetCount = Math.max(burstTargets, rangedTargets);
    if (targetCount) {
      candidates.push({
        kind: "area",
        score: 14 + targetCount * 13 + (targetCount >= 2 ? 14 : 0) + monsterCategory(monster),
      });
      addAdminLog(`${monster.name} special scorer: area candidate, burst targets ${burstTargets}, ranged targets ${rangedTargets}, chosen count ${targetCount}.`);
    } else {
      addAdminLog(`${monster.name} special scorer: area specials known, but no target is in range/line of sight.`);
    }
  }

  if (monsterControlSpecialPattern.test(names)) {
    const closeTargets = targetsInMonsterSpecialRange(monster, monsterSpecialAbilityTuning.burstRangeFeet).length;
    const farTargets = targetsInMonsterSpecialRange(monster, monsterSpecialAbilityTuning.rangedSpecialFeet).length;
    const targetCount = Math.max(closeTargets, farTargets);
    if (targetCount) {
      candidates.push({
        kind: "control",
        score: 12 + targetCount * 10 + (targetCount >= 2 ? 10 : 0) + Math.ceil(monsterCategory(monster) / 2),
      });
      addAdminLog(`${monster.name} special scorer: control candidate, close targets ${closeTargets}, ranged targets ${farTargets}, chosen count ${targetCount}.`);
    } else {
      addAdminLog(`${monster.name} special scorer: control specials known, but no target is in range/line of sight.`);
    }
  }

  if (!candidates.length) {
    addAdminLog(`${monster.name} special scorer: no active special candidate; normal AI will decide.`);
    return null;
  }
  candidates.sort((a, b) => b.score - a.score);
  addAdminLog(`${monster.name} special scorer candidates: ${candidates.map((entry) => `${entry.kind} ${Math.round(entry.score)}`).join(", ")}. Picked ${candidates[0].kind}.`);
  return candidates[0].kind;
}

function maybeUseMonsterSoulSiphon(monster, damage, type) {
  if (!monster?.alive || isPartyHeroId(monster.id) || damage <= 0 || String(type ?? "").toLowerCase() !== "necrotic") return 0;
  if (!hasMonsterSpecial(monster, /soul siphon/i)) return 0;
  monster.usedSpecials = monster.usedSpecials ?? {};
  const roundKey = `SoulSiphon-${state.round ?? 0}`;
  if (monster.usedSpecials[roundKey]) return 0;
  monster.usedSpecials[roundKey] = true;
  const healed = applyHealingToHero(monster, Math.max(1, Math.floor(damage / 2)));
  if (healed > 0) addLog(`${monster.name}'s Soul Siphon restores ${healed} HP.`, "heal");
  return healed;
}

function maybeUseMonsterDropHealing(monster, target) {
  if (!monster?.alive || isPartyHeroId(monster.id) || target?.alive) return false;
  const label = monsterSpecialNameMatching(monster, /harvest contract|devouring bloom/i);
  if (!label) return false;
  const dice = /harvest contract/i.test(label) ? rollDice(5, 8) : rollDice(4, 8);
  const healed = applyHealingToHero(monster, dice.total);
  if (/harvest contract/i.test(label)) {
    applyStatusEffect(monster, { id: "harvest-contract", label: "Harvest Contract", attackBonus: 1 });
  } else {
    monster.hasAction = true;
    monster.attacksRemaining = Math.max(monster.attacksRemaining ?? 0, 1);
  }
  addLog(
    healed > 0
      ? `${monster.name}'s ${label} restores ${healed} HP as ${target.name} falls.`
      : `${monster.name}'s ${label} flares as ${target.name} falls, but ${monster.name} is already at full health.`,
    "heal",
  );
  return true;
}

function maybeUseAncientPhotosynthesis(monster) {
  if (!hasMonsterSpecial(monster, /ancient photosynthesis/i) || (monster.hp ?? 0) >= (monster.maxHp ?? 0)) return false;
  const suppressedRound = monster.usedSpecials?.AncientPhotosynthesisSuppressedRound;
  if (typeof suppressedRound === "number" && (state.round ?? 0) <= suppressedRound + 1) return false;
  const roll = rollDice(1, 8);
  const healed = applyHealingToHero(monster, Math.max(1, roll.total + monsterCategory(monster)));
  if (healed > 0) {
    addLog(`${monster.name}'s Ancient Photosynthesis restores ${healed} HP.`, "heal");
    render();
    return true;
  }
  return false;
}

async function maybeUseMonsterAllyHealingAction(monster) {
  if (!monster?.hasAction) {
    addAdminLog(`${monster?.name ?? "Monster"} healing action skipped: no action available.`);
    return false;
  }
  if (!monsterCanUsePreferredSpecialKind(monster, "heal")) {
    addAdminLog(`${monster.name} healing action skipped: scorer preferred ${monster.preferredSpecialActionKind}.`);
    return false;
  }
  monster.usedSpecials = monster.usedSpecials ?? {};
  if (hasMonsterSpecial(monster, /unholy benediction/i) && !monster.usedSpecials.UnholyBenediction) {
    const targets = woundedMonsterAlliesInRange(monster, 30, { includeSelf: true, predicate: monsterIsUndead });
    if (targets.length) {
      const label = monsterSpecialNameMatching(monster, /unholy benediction/i) ?? "Unholy Benediction";
      addAdminLog(`${monster.name} chooses ${label}: wounded undead targets ${monsterAiTargetSummary(targets)}.`);
      const roll = rollDice(4, 8);
      monster.usedSpecials.UnholyBenediction = true;
      monster.hasAction = false;
      let healedAny = false;
      for (const target of targets) {
        healedAny = healMonsterWithSpecial(monster, target, roll.total, label) > 0 || healedAny;
        applyStatusEffect(target, { id: "unholy-benediction", label: "Benediction", attackBonus: 1, durationRounds: 1 });
      }
      if (healedAny) addLog(`${label} also gives the healed undead +1 attack until next round.`, "important");
      render();
      return true;
    }
    addAdminLog(`${monster.name} did not use Unholy Benediction: no wounded undead target in 30 ft.`);
  }

  if (hasMonsterSpecial(monster, /brood spores/i) && !monster.usedSpecials.BroodSpores) {
    const targets = woundedMonsterAlliesInRange(monster, 30, { includeSelf: true, predicate: monsterIsFungusOrPlant });
    if (targets.length) {
      const label = monsterSpecialNameMatching(monster, /brood spores/i) ?? "Brood Spores";
      addAdminLog(`${monster.name} chooses ${label}: wounded fungus/plant targets ${monsterAiTargetSummary(targets)}.`);
      const dice = specialDamageDice(monster, 8);
      const roll = rollDice(dice.count, dice.sides);
      monster.usedSpecials.BroodSpores = true;
      monster.hasAction = false;
      for (const target of targets.slice(0, 3)) {
        healMonsterWithSpecial(monster, target, Math.max(1, roll.total + dice.bonus), label);
      }
      render();
      return true;
    }
    addAdminLog(`${monster.name} did not use Brood Spores: no wounded fungus/plant target in 30 ft.`);
  }

  if (hasMonsterSpecial(monster, /first forest awakens/i) && !monster.usedSpecials.FirstForestHealing) {
    const targets = woundedMonsterAlliesInRange(monster, 30, { includeSelf: true, predicate: monsterIsFungusOrPlant });
    if (targets.length) {
      const label = monsterSpecialNameMatching(monster, /first forest awakens/i) ?? "First Forest Awakens";
      addAdminLog(`${monster.name} chooses ${label} as healing: wounded fungus/plant targets ${monsterAiTargetSummary(targets)}.`);
      const roll = rollDice(3, 8);
      monster.usedSpecials.FirstForestHealing = true;
      monster.hasAction = false;
      for (const target of targets.slice(0, 4)) {
        healMonsterWithSpecial(monster, target, Math.max(1, roll.total + monsterCategory(monster)), label);
      }
      render();
      return true;
    }
    addAdminLog(`${monster.name} did not use First Forest healing: no wounded fungus/plant target in 30 ft.`);
  }

  const label = monsterSpecialNameMatching(monster, /healing|mending|renewal|benediction|regrowth|photosynthesis/i);
  if (label) {
    const [target] = woundedMonsterAlliesInRange(monster, 30, { includeSelf: false });
    if (target) {
      const roll = rollDice(2, 8);
      monster.hasAction = false;
      addAdminLog(`${monster.name} chooses ${label}: healing lowest-health ally ${target.name} at ${target.hp}/${target.maxHp} HP.`);
      healMonsterWithSpecial(monster, target, Math.max(1, roll.total + monsterCategory(monster)), label);
      render();
      return true;
    }
    addAdminLog(`${monster.name} did not use ${label}: no wounded monster ally in 30 ft.`);
  }
  return false;
}

function maybeUseMonsterDamageReduction(defender, attacker, incomingDamage, meleeAttack) {
  if (isPartyHeroId(defender?.id) || incomingDamage <= 0 || !shouldUseMonsterSpecial("defensive")) return incomingDamage;
  defender.usedSpecials = defender.usedSpecials ?? {};
  const roundKey = `parry-${state.round ?? 0}`;
  if (meleeAttack && hasMonsterSpecial(defender, /parrying fade/i) && !defender.usedSpecials[roundKey]) {
    defender.usedSpecials[roundKey] = true;
    const reduction = rollDice(1, 6).total;
    addLog(`${defender.name} uses Parrying Fade and reduces the hit by ${reduction}.`, "important");
    return Math.max(0, incomingDamage - reduction);
  }
  if (hasMonsterSpecial(defender, /mirror double/i) && !defender.usedSpecials.MirrorDouble) {
    defender.usedSpecials.MirrorDouble = true;
    const reduced = Math.floor(incomingDamage / 2);
    addLog(`${defender.name}'s Mirror Double blurs the attack, reducing the damage by ${incomingDamage - reduced}.`, "important");
    return reduced;
  }
  if (meleeAttack && hasMonsterSpecial(defender, /parry storm/i) && !defender.usedSpecials[roundKey]) {
    defender.usedSpecials[roundKey] = true;
    const reduction = rollDice(1, 8).total + 4;
    addLog(`${defender.name}'s Parry Storm reduces the hit by ${reduction}.`, "important");
    return Math.max(0, incomingDamage - reduction);
  }
  if (hasMonsterSpecial(defender, /ironbark guard/i) && !defender.usedSpecials[roundKey]) {
    defender.usedSpecials[roundKey] = true;
    const reduction = 5;
    addLog(`${defender.name}'s Ironbark Guard reduces the hit by ${reduction}.`, "important");
    return Math.max(0, incomingDamage - reduction);
  }
  if (hasMonsterSpecial(defender, /ancient bark/i)) {
    const cap = Math.max(1, Math.floor((defender.maxHp ?? 1) * 0.25));
    if (incomingDamage > cap) {
      addLog(`${defender.name}'s Ancient Bark caps the hit at ${cap} damage.`, "important");
      return cap;
    }
  }
  if (hasMonsterSpecial(defender, /grove body/i) && !defender.usedSpecials[roundKey]) {
    defender.usedSpecials[roundKey] = true;
    const reduced = Math.ceil(incomingDamage * 0.75);
    addLog(`${defender.name}'s Grove Body disperses part of the blow.`, "important");
    return reduced;
  }
  if (hasMonsterSpecial(defender, /adamantine frame|hard light of the forge|gear assembly|thickhide|frosthide/i) && !defender.usedSpecials[roundKey]) {
    defender.usedSpecials[roundKey] = true;
    const reduction = Math.max(3, 2 + monsterCategory(defender));
    addLog(`${defender.name}'s hardened frame reduces the hit by ${reduction}.`, "important");
    return Math.max(0, incomingDamage - reduction);
  }
  if (hasMonsterSpecial(defender, /burning guard|furnace shield|mirror heat|cyclone guard|hurricane guard|storm shell|current guard|glacial guard|stone hide|guarding slab|iron stance|mountain heart|tremor shell|diamond refraction|glass refract|black glass body|living cover|idol ward|open sea body|endless body|vortex body|worldstorm body|firestorm body|molten body/i) && !defender.usedSpecials[roundKey]) {
    defender.usedSpecials[roundKey] = true;
    const reduction = Math.max(2, monsterCategory(defender) + 2);
    addLog(`${defender.name}'s elemental guard reduces the hit by ${reduction}.`, "important");
    return Math.max(0, incomingDamage - reduction);
  }
  return incomingDamage;
}

async function applyMonsterReactiveSpecials(defender, attacker, incomingDamage, meleeAttack, incomingDamageType) {
  if (!attacker?.alive || incomingDamage <= 0 || !meleeAttack || !shouldUseMonsterSpecial("defensive")) return;
  const names = monsterSpecialNames(defender).join(" | ");
  if (/cinder body/i.test(names)) {
    applySpecialDamage(defender, attacker, Math.max(1, monsterCategory(defender)), "fire", "Cinder Body");
  }
  if (/barbed hide/i.test(names)) {
    const roll = rollDice(1, 6);
    applySpecialDamage(defender, attacker, Math.max(1, roll.total + Math.floor(monsterCategory(defender) / 2)), "piercing", "Barbed Hide");
  }
  if (/eidolic reversal|ghostly riposte/i.test(names) && incomingDamageType !== "radiant") {
    const dice = specialDamageDice(defender, 6);
    const roll = rollDice(dice.count, dice.sides);
    applySpecialDamage(defender, attacker, Math.max(1, Math.floor((roll.total + dice.bonus) / 2)), "force", /eidolic reversal/i.test(names) ? "Eidolic Reversal" : "Ghostly Riposte");
  }
  if (/abyssal riposte/i.test(names)) {
    const dice = specialDamageDice(defender, 8);
    const roll = rollDice(dice.count, dice.sides);
    applySpecialDamage(defender, attacker, Math.max(1, roll.total + dice.bonus), "slashing", "Abyssal Riposte");
  }
  if (/thorn nest|thorn hide|crown of thorns|rooted counter/i.test(names)) {
    const dice = specialDamageDice(defender, 6);
    const roll = rollDice(dice.count, dice.sides);
    const type = /rooted counter/i.test(names) ? "bludgeoning" : "piercing";
    applySpecialDamage(defender, attacker, Math.max(1, Math.floor((roll.total + dice.bonus) / 2)), type, /rooted counter/i.test(names) ? "Rooted Counter" : "Thorns");
  }
  if (/crushing shell|shard burst|overpressure burst/i.test(names)) {
    const dice = specialDamageDice(defender, /overpressure burst/i.test(names) ? 8 : 6);
    const roll = rollDice(dice.count, dice.sides);
    const type = /shard burst/i.test(names) ? "slashing" : /overpressure burst/i.test(names) ? "thunder" : "bludgeoning";
    applySpecialDamage(defender, attacker, Math.max(1, Math.floor((roll.total + dice.bonus) / 2)), type, /overpressure burst/i.test(names) ? "Overpressure Burst" : /shard burst/i.test(names) ? "Shard Burst" : "Crushing Shell");
    if (/crushing shell/i.test(names)) pushTargetAway(defender, attacker);
  }
  if (/molten body|firestorm body|burning guard|cinder crown|black glass body|vortex body|worldstorm body|storm shell|tremor shell|shatter spines|open sea body|endless body|blackwater seep/i.test(names)) {
    const dice = specialDamageDice(defender, 6);
    const roll = rollDice(dice.count, dice.sides);
    const damageType = /molten|firestorm|burning|cinder/i.test(names)
      ? "fire"
      : /vortex|worldstorm|storm shell/i.test(names)
        ? "thunder"
        : /open sea|endless body/i.test(names)
          ? "cold"
          : /blackwater/i.test(names)
            ? "acid"
            : /shatter|glass/i.test(names)
              ? "slashing"
              : "bludgeoning";
    applySpecialDamage(defender, attacker, Math.max(1, Math.floor((roll.total + dice.bonus) / 2)), damageType, "Elemental Body");
    if (/vortex|worldstorm|storm shell|tremor shell/i.test(names)) pushTargetAway(defender, attacker);
  }
  if (isPartyHeroId(attacker.id) && !attacker.alive) handleHeroDeath();
}

function maybeUseMonsterDeathDefiance(monster, damagePackets = []) {
  if (isPartyHeroId(monster?.id)) return false;
  if (!hasMonsterSpecial(monster, /king's return|unfinished death|final bargain|prince's second form|fungal rebirth|primordial regrowth|black rebirth|infernal wishflame|endless gale|mountain heart|older than roads|endless body|absolute stillness|hollow choir rebuild|mass grave rebuild/i)) return false;
  monster.usedSpecials = monster.usedSpecials ?? {};
  if (monster.usedSpecials.DeathDefiance) return false;
  const radiantDamage = damagePackets.some((packet) => packet.type === "radiant" && packet.damage > 0);
  const fireDamage = damagePackets.some((packet) => packet.type === "fire" && packet.damage > 0);
  if (radiantDamage && !hasMonsterSpecial(monster, /final bargain/i)) return false;
  if (fireDamage && hasMonsterSpecial(monster, /fungal rebirth|primordial regrowth/i)) return false;
  monster.usedSpecials.DeathDefiance = true;
  monster.hp = 1;
  monster.alive = true;
  applyStatusEffect(monster, { id: "death-defiance", label: "Death Defiance", acBonus: 1, attackBonus: 1, expiresAtEndOfTurn: true });
  return true;
}

async function maybeTriggerMonsterDeathBurst(monster) {
  if (!hasMonsterSpecial(monster, /death throes|greater death throes|industrial catastrophe|continental melt|end-breath ash|pebble scatter|iceberg break|split the heavens|worldspring eruption/i)) return false;
  const rangeFeet = hasMonsterSpecial(monster, /greater death throes/i) ? 30 : 20;
  const targets = monsterTargetableHeroes(monster).filter((hero) => hero.alive && fightersWithinSquares(hero, monster, rangeFeet / feetPerSquare));
  if (!targets.length) return false;
  const label = hasMonsterSpecial(monster, /industrial catastrophe/i) ? "Industrial Catastrophe" : hasMonsterSpecial(monster, /continental melt/i) ? "Continental Melt" : hasMonsterSpecial(monster, /end-breath ash/i) ? "End-Breath Ash" : hasMonsterSpecial(monster, /pebble scatter/i) ? "Pebble Scatter" : hasMonsterSpecial(monster, /iceberg break/i) ? "Iceberg Break" : hasMonsterSpecial(monster, /split the heavens/i) ? "Split the Heavens" : hasMonsterSpecial(monster, /worldspring eruption/i) ? "Worldspring Eruption" : hasMonsterSpecial(monster, /greater death throes/i) ? "Greater Death Throes" : "Death Throes";
  const dc = monsterSpecialDc(monster);
  const dice = specialDamageDice(monster, hasMonsterSpecial(monster, /greater death throes|industrial catastrophe|continental melt/i) ? 10 : 6);
  addLog(`${monster.name}'s ${label} erupts as it falls.`, "important");
  for (const target of targets.slice(0, 6)) {
    const save = await rollSavingThrow(target, "dex", dc, `${monster.name}'s ${label} forces ${target.name} to make a DEX save.`);
    const roll = rollDice(dice.count, dice.sides);
    const raw = Math.max(1, roll.total + dice.bonus);
    const damage = evasionAdjustedDamage(target, save, raw);
    const type = hasMonsterSpecial(monster, /industrial catastrophe|split the heavens/i)
      ? "thunder"
      : hasMonsterSpecial(monster, /pebble scatter/i)
        ? "bludgeoning"
        : hasMonsterSpecial(monster, /iceberg break/i)
          ? "cold"
          : hasMonsterSpecial(monster, /worldspring eruption/i)
            ? "force"
            : "fire";
    if (damage > 0) applySpecialDamage(monster, target, damage, type, label);
    if (!target.alive) handleHeroDeath();
  }
  return true;
}

function savingThrow(target, ability, dc, options = {}) {
  const normalizedAbility = String(ability ?? "").toLowerCase();
  const autoFailed = (target.statusEffects ?? []).some((effect) => (effect.autoFailSaves ?? []).map((entry) => String(entry).toLowerCase()).includes(normalizedAbility));
  const saveDisadvantage = (target.statusEffects ?? []).some((effect) => (effect.saveDisadvantageAbilities ?? []).map((entry) => String(entry).toLowerCase()).includes(normalizedAbility));
  const rollResult = rollD20ForFighter(target, { advantage: options.advantage && !saveDisadvantage, disadvantage: saveDisadvantage && !options.advantage });
  const roll = rollResult.roll;
  const statusBonus = (target.statusEffects ?? []).reduce((sum, effect) => sum + (effect.saveBonus ?? 0), 0) + (magicEffects(target).saveBonus ?? 0);
  const auraBonus = auraSaveBonus(target);
  const proficiency = (target.savingThrowProficiencies ?? []).includes(ability) ? rangerCompanionProficiencyBonus(target) : 0;
  const bonus = abilityMod(target, ability) + proficiency + statusBonus + auraBonus;
  let total = roll + bonus;
  let success = !autoFailed && total >= dc;
  let indomitable = null;
  const indomitableAbility = fighterAbilityDefinitions(target).find((entry) => entry.id === "indomitable");
  if (!autoFailed && !success && indomitableAbility && (target.level ?? 1) >= (indomitableAbility.level ?? 1) && (target.abilityUses?.indomitable ?? 0) < abilityMaxUses(target, indomitableAbility)) {
    const rerollResult = rollD20ForFighter(target, { disadvantage: saveDisadvantage });
    const rerollTotal = rerollResult.roll + bonus;
    target.abilityUses.indomitable = (target.abilityUses.indomitable ?? 0) + 1;
    indomitable = { roll: rerollResult.roll, rolls: rerollResult.rolls, rawRolls: rerollResult.rawRolls, rollResult: rerollResult, total: rerollTotal };
    total = rerollTotal;
    success = total >= dc;
  }
  const fanaticalFocus = fighterAbilityDefinitions(target).find((entry) => entry.id === "fanaticalFocus");
  if (!autoFailed && !success && target.subclassId === "zealot" && (target.level ?? 1) >= 6 && fanaticalFocus && (target.abilityUses?.fanaticalFocus ?? 0) < abilityMaxUses(target, fanaticalFocus)) {
    const rerollResult = rollD20ForFighter(target, { disadvantage: saveDisadvantage });
    const rerollTotal = rerollResult.roll + bonus;
    target.abilityUses = { ...(target.abilityUses ?? {}), fanaticalFocus: (target.abilityUses?.fanaticalFocus ?? 0) + 1 };
    total = rerollTotal;
    success = total >= dc;
    addLog(`${target.name}'s Fanatical Focus rerolls the save: ${rerollResult.roll} ${abilityLabel(bonus)} = ${total}.`, "important");
  }
  recordD20OutcomeForFighter(target, success);
  return { ability, roll, rolls: rollResult.rolls, rawRolls: rollResult.rawRolls, rollResult, bonus, proficiency, statusBonus, auraBonus, total, success, indomitable, autoFailed, saveDisadvantage };
}

function auraSaveBonus(target) {
  if (!isPartyHeroId(target?.id)) return 0;
  const paladin = partyHeroes().find((hero) => hero.alive && (hero.level ?? 1) >= 6 && hero.classId === "paladin" && fightersWithinSquares(hero, target, 2));
  return paladin ? Math.max(1, abilityMod(paladin, "cha")) : 0;
}

function savingThrowExplanation(message = "", ability = "") {
  const text = String(message);
  const label =
    text.match(/'s ([^.]+?) forces/i)?.[1] ??
    text.match(/'s ([^.]+?) tries/i)?.[1] ??
    text.match(/'s ([^.]+?) tests/i)?.[1] ??
    text.match(/'s ([^.]+?) wraps/i)?.[1] ??
    text.match(/'s ([^.]+?) bursts/i)?.[1] ??
    text.match(/'s ([^.]+?) batters/i)?.[1] ??
    "special ability";
  const lower = `${label} ${text}`.toLowerCase();
  const abilityText = String(ability).toUpperCase();
  if (/forge|furnace|coal|cinder|ember|fire|flame|burn|magma|lava|scald|boiling/.test(lower)) {
    return {
      flavor: `${label} releases heat, sparks, or molten spray around the target. ${abilityText} measures whether they get clear before the fire catches them directly.`,
      failure: "Failure means the target takes the listed fire damage and any burn, armor, or movement rider applies.",
      success: "Success means the target avoids the direct blast, taking reduced damage or avoiding the rider.",
    };
  }
  if (/poison|venom|sick|stench|bile|rot|plague|nausea/.test(lower)) {
    return {
      flavor: `${label} delivers venom, rot, or foul air into the target's body. ${abilityText} measures whether they fight it off before it spreads.`,
      failure: "Failure means poison damage, sickness, nausea, or another weakening condition applies.",
      success: "Success means the target resists the toxin or disease rider.",
    };
  }
  if (/dread|fear|whisper|malice|mind|hymn|chorus|verdict|debt|soul|life drain|drain|psychic/.test(lower)) {
    return {
      flavor: `${label} presses on the target's mind, courage, or life force. ${abilityText} measures whether they keep control before the effect takes hold.`,
      failure: "Failure means fear, necrotic damage, psychic pressure, or a weakening condition applies.",
      success: "Success means the target keeps control and avoids the main rider.",
    };
  }
  if (/chain|pull|drag|snare|web|grip|coil|cage|restrain|hamstring|pin|shard|needle|glass|cutting|whip/.test(lower)) {
    return {
      flavor: `${label} hooks, pins, cuts, or drags at the target. ${abilityText} measures whether they pull free before it controls their movement.`,
      failure: "Failure means the target is moved, slowed, restrained, or takes the listed extra damage.",
      success: "Success means the target keeps their footing and avoids the movement rider.",
    };
  }
  if (/storm|lightning|thunder|static|current|tide|water|ice|frost|mist|pressure|wind|air|chok|dust|smoke/.test(lower)) {
    return {
      flavor: `${label} releases a burst of lightning, thunder, air, cold, or choking vapor around the target. ${abilityText} measures whether they brace, dodge, or hold their breath in time.`,
      failure: "Failure means the target takes the listed elemental damage and any reaction loss, push, slow, or choking rider applies.",
      success: "Success means the target avoids the direct burst or only takes the reduced effect.",
    };
  }
  return {
    flavor: `${label} adds a special effect to the monster's attack. ${abilityText} measures whether the target avoids that follow-up effect.`,
    failure: "Failure means the listed damage, condition, movement, or reaction rider applies.",
    success: "Success means the target avoids or reduces that rider.",
  };
}

function showSavingThrowMenu({ target, ability, dc, message, explanation = null }) {
  return new Promise((resolve) => {
    const abilityText = ability.toUpperCase();
    const details = explanation ?? savingThrowExplanation(message, ability);
    let resultSave = null;
    els.gameDialogTitle.textContent = "Saving Throw";
    els.gameDialogMessage.innerHTML = `
      ${dialogActorMarkup(target)}
      <p>${escapeHtml(message)}</p>
      <p>${escapeHtml(details.flavor)}</p>
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
      const conditionNote = resultSave.autoFailed ? " Automatic failure from condition." : resultSave.saveDisadvantage ? " Rolled with disadvantage from condition." : "";
      els.gameDialogMessage.innerHTML = `
        ${dialogActorMarkup(target)}
        <p>${escapeHtml(message)}</p>
        <p>${escapeHtml(resultSave.success ? details.success : details.failure)}</p>
        <p><b>Result:</b> ${resultSave.roll} ${escapeHtml(abilityLabel(resultSave.bonus))} = ${resultSave.total} vs DC ${dc}.${escapeHtml(conditionNote)}</p>
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

async function rollSavingThrow(target, ability, dc, message, explanation = null) {
  const manualPlayerSave = isPartyHeroId(target?.id) && normalizeSaveRollMode(state?.saveRollMode ?? saveRollMode) === "manual";
  if (!manualPlayerSave) {
    if (isPartyHeroId(target?.id)) addLog(message, "important");
    const save = savingThrow(target, ability, dc);
    if (save.indomitable) addLog(`${target.name} uses Indomitable and rerolls ${save.indomitable.roll}.`, "important");
    const rollText = save.indomitable ? `${save.roll} -> ${save.indomitable.roll}` : save.roll;
    const conditionNote = save.autoFailed ? " (automatic failure)" : save.saveDisadvantage ? " with disadvantage" : "";
    addLog(`${target.name} rolls ${ability.toUpperCase()} save${conditionNote}: ${rollText} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
    addAdminLog(`${target.name} ${ability.toUpperCase()} save breakdown: ${d20RollDetail(save.rollResult)} + ability ${abilityLabel(abilityMod(target, ability))}${save.proficiency ? ` + proficiency ${save.proficiency}` : ""}${save.statusBonus ? ` + status ${save.statusBonus}` : ""}${save.auraBonus ? ` + aura ${save.auraBonus}` : ""}${save.autoFailed ? "; condition forces automatic failure" : save.saveDisadvantage ? "; condition imposes disadvantage" : ""}${save.indomitable ? `; Indomitable ${d20RollDetail(save.indomitable.rollResult)} => ${save.indomitable.total}` : ""} = ${save.total} vs DC ${dc}.`);
    return save;
  }
  addLog(message, "important");
  const save = await showSavingThrowMenu({ target, ability, dc, message, explanation });
  if (!save.autoFailed && !save.success) {
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
  if (!save.autoFailed && !save.success) {
    const candidate = partyHeroes().find((hero) => {
      const ability = reactionAbility(hero, "bendLuck");
      return hero.id !== target.id && heroCanAct(hero) && hasReactionAvailable(hero) && canSpendCombatAbility(hero, ability) && fightersWithinSquares(hero, target, 12);
    });
    if (candidate && save.total + 3 >= dc) {
      const useLuck = await showReactionPrompt({
        actor: candidate,
        title: "Bend Luck",
        message: `${target.name} failed by ${dc - save.total}. Spend sorcery to bend luck by +3?`,
        acceptLabel: "Bend Luck",
        declineLabel: "Save It",
      });
      const ability = reactionAbility(candidate, "bendLuck");
      if (useLuck && consumeReaction(candidate, "Bend Luck") && canSpendCombatAbility(candidate, ability)) {
        spendCombatAbilityUse(candidate, ability);
        save.total += 3;
        save.success = save.total >= dc;
        addLog(`${candidate.name}'s Bend Luck adds +3 to ${target.name}'s save.`, "important");
      }
    }
  }
  if (save.indomitable) addLog(`${target.name} uses Indomitable and rerolls ${save.indomitable.roll}.`, "important");
  const rollText = save.indomitable ? `${save.roll} -> ${save.indomitable.roll}` : save.roll;
  const conditionNote = save.autoFailed ? " (automatic failure)" : save.saveDisadvantage ? " with disadvantage" : "";
  addLog(`${target.name} rolls ${ability.toUpperCase()} save${conditionNote}: ${rollText} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
  addAdminLog(`${target.name} ${ability.toUpperCase()} save breakdown: ${d20RollDetail(save.rollResult)} + ability ${abilityLabel(abilityMod(target, ability))}${save.proficiency ? ` + proficiency ${save.proficiency}` : ""}${save.statusBonus ? ` + status ${save.statusBonus}` : ""}${save.auraBonus ? ` + aura ${save.auraBonus}` : ""}${save.autoFailed ? "; condition forces automatic failure" : save.saveDisadvantage ? "; condition imposes disadvantage" : ""}${save.indomitable ? `; Indomitable ${d20RollDetail(save.indomitable.rollResult)} => ${save.indomitable.total}` : ""} = ${save.total} vs DC ${dc}.`);
  return save;
}

function applyStatusEffect(target, effect) {
  const rawCondition = typeof inferConditionIdFromEffect === "function" ? inferConditionIdFromEffect(effect) : "";
  if ((rawCondition === "prone" || effect?.prone) && activeMagicItemByTemplate(target, barrowCrownItemIds.drownedLegionShield)) {
    const roll = rollD20ForFighter(target, { advantage: true });
    const total = roll.roll + proficiencyBonus(target);
    addLog(`${target.name}'s Bone-Bound shield resists being knocked prone: d20 ${roll.rolls.join(" / ")} -> ${roll.roll} ${abilityLabel(proficiencyBonus(target))} = ${total} vs DC 13.`, "important");
    if (total >= 13) return false;
  }
  if (rawCondition === "exhaustion" && effect && effect.exhaustionLevel == null && effect.level == null && effect.stacks == null) {
    const existingLevel = Math.max(0, ...(target?.statusEffects ?? []).filter((entry) => inferConditionIdFromEffect(entry) === "exhaustion").map((entry) => Number(entry.exhaustionLevel ?? entry.level ?? entry.stacks ?? 1) || 1));
    effect = { ...effect, exhaustionLevel: Math.min(6, existingLevel + 1) };
  }
  effect = typeof normalizeConditionEffect === "function" ? normalizeConditionEffect(effect) : { ...effect };
  if (effect.condition && typeof fighterIsImmuneToCondition === "function" && fighterIsImmuneToCondition(target, effect.condition)) {
    const conditionName = effect.conditionLabel ?? effect.label ?? effect.condition;
    addLog(`${target.name} is immune to ${conditionName}.`, "important");
    return false;
  }
  if ((effect.disease || effect.diseaseId) && typeof fighterIsImmuneToDisease === "function" && fighterIsImmuneToDisease(target)) {
    addLog(`${target.name} is immune to ${effect.label ?? "disease"}.`, "important");
    return false;
  }
  effect = prepareTimedEffect(effect);
  target.statusEffects = (target.statusEffects ?? []).filter((entry) => entry.id !== effect.id);
  target.statusEffects.push(effect);
  refreshDerivedStats(target);
  if (effect.tempHp) {
    target.temporaryHp = Math.max(target.temporaryHp ?? 0, effect.tempHp);
  }
  if (effect.condition === "exhaustion" && (effect.exhaustionLevel ?? 0) >= 6) {
    if (isPartyHeroId(target.id)) {
      killHero(target);
    } else {
      target.hp = 0;
      target.alive = false;
    }
    addLog(`${target.name} collapses from fatal exhaustion.`, "important");
  }
  return true;
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
  const previousElementalAdept = target.incomingElementalAdeptTypes;
  if (fighterHasFeat(source, "elemental-adept")) target.incomingElementalAdeptTypes = featChoiceValue(source, "elemental-adept", "elementalAdeptTypes") ?? [];
  const modified = calculateDamageModifiers(target, damage, type);
  target.incomingElementalAdeptTypes = previousElementalAdept;
  applyDamageToFighter(target, modified.damage);
  const note = modified.reason ? ` ${target.name} is ${modified.reason} to ${type} damage.` : "";
  addLog(`${source.name}'s ${label} deals ${modified.damage} ${type} damage to ${target.name}.${note}`, "damage");
  if (modified.damage !== damage || modified.reason) addAdminLog(`Damage modifier: ${target.name} incoming ${damage} ${type}, final ${modified.damage}${modified.reason ? ` (${modified.reason})` : ""}.`);
  maybeUseMonsterSoulSiphon(source, modified.damage, type);
  return modified.damage;
}

function evasionAdjustedDamage(target, save, rawDamage) {
  if (!isSidekickExpert(target) || (target.level ?? 1) < 7 || save?.ability !== "dex" || !heroCanAct(target)) return save?.success ? Math.floor(rawDamage / 2) : rawDamage;
  if (save.success) {
    addLog(`${target.name}'s Evasion avoids the damage.`, "important");
    return 0;
  }
  addLog(`${target.name}'s Evasion halves the damage.`, "important");
  return Math.floor(rawDamage / 2);
}

function rollWildShapeEffectDamage(damageText) {
  const match = String(damageText ?? "").match(/(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?/i);
  if (!match) return 0;
  const roll = rollDice(Number(match[1]), Number(match[2]));
  const bonus = Number(match[4] ?? 0) * (match[3] === "-" ? -1 : 1);
  return Math.max(0, roll.total + bonus);
}

async function applyWildShapeAttackEffects(attacker, defender, attackDamage) {
  if (!isWildShaped(attacker) || !defender?.alive) return;
  for (const effect of attackDamage.effects ?? []) {
    if (effect.type === "savingThrow") {
      const save = await rollSavingThrow(defender, effect.ability ?? "str", effect.dc ?? 10, `${attacker.name}'s ${attackDamage.actionName ?? "beast attack"} forces ${defender.name} to make a save.`);
      const damageText = save.success ? effect.onSuccessDamage : effect.onFailDamage;
      if (damageText) {
        const damageType = save.success ? effect.onSuccessDamageType : effect.onFailDamageType;
        applySpecialDamage(attacker, defender, rollWildShapeEffectDamage(damageText), damageType ?? "poison", attackDamage.actionName ?? "beast attack");
      }
      if (!save.success && /prone/i.test(effect.onFail ?? "")) {
        applyStatusEffect(defender, { id: "prone", label: "Prone", attackBonus: -2, speedBonusFeet: -10, expiresAtEndOfTurn: true });
        addLog(`${defender.name} is knocked prone.`, "important");
      }
    }
    if (effect.type === "grapple") {
      const save = await rollSavingThrow(defender, "str", effect.dc ?? 10, `${attacker.name}'s ${attackDamage.actionName ?? "beast attack"} tries to restrain ${defender.name}.`);
      if (!save.success) {
        applyStatusEffect(defender, { id: "restrained", label: effect.condition === "restrained" ? "Restrained" : "Grappled", speedLocked: true, attackBonus: -2, durationRounds: 1 });
        addLog(`${defender.name} is ${effect.condition ?? "grappled"}.`, "important");
      }
    }
  }
}

function spellcastingAbility(fighter) {
  return fighter?.spellcastingAbility ?? "wis";
}

function spellSaveDc(fighter, spell = null) {
  const ability = spell?.saveDcAbility ?? spellcastingAbility(fighter);
  const statusBonus = (fighter?.statusEffects ?? []).reduce((sum, effect) => sum + (effect.saveDcBonus ?? 0), 0);
  return 8 + proficiencyBonus(fighter) + abilityMod(fighter, ability) + statusBonus + (spell?.metamagic?.saveDcBonus ?? 0);
}

function spellAttackBonus(fighter, spell = null) {
  const statusBonus = (fighter?.statusEffects ?? []).reduce((sum, effect) => sum + (effect.spellAttackBonus ?? effect.attackBonus ?? 0), 0);
  return proficiencyBonus(fighter) + abilityMod(fighter, spell?.attackAbility ?? spell?.saveDcAbility ?? spellcastingAbility(fighter)) + statusBonus + (magicEffects(fighter).attackBonus ?? 0);
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

function metamagicAbilityForSpell(caster, id) {
  return fighterAbilityDefinitions(caster).find((ability) => ability.id === id && ability.metamagicOption);
}

function metamagicCostForSpell(spell, ability) {
  if (!ability) return 0;
  if (ability.id === "metamagicTwinned") return Math.max(1, spellCastLevel(spell));
  return Math.max(1, ability.uses ?? 1);
}

function metamagicPoolSpent(fighter) {
  return fighterAbilityDefinitions(fighter)
    .filter((ability) => ability.resourcePool === "metamagic")
    .reduce((sum, ability) => sum + (fighter?.abilityUses?.[ability.id] ?? 0), 0);
}

function canSpendMetamagic(caster, spell, ability) {
  if (!ability || (caster.level ?? 1) < (ability.level ?? 1)) return false;
  return metamagicPoolSpent(caster) + metamagicCostForSpell(spell, ability) <= abilityMaxUses(caster, ability);
}

function spellHasTimedEffect(spell) {
  return Boolean(durationSecondsFromDefinition(spell?.duration ?? {}) || durationSecondsFromDefinition(spell?.effect?.status ?? {}) || persistentAreaSpellIds().has(spell?.id));
}

function spellCanUseMetamagic(caster, spell, ability) {
  if (!(caster?.classId === "sorcerer" || fighterHasFeat(caster, "metamagic-adept")) || !spell || !ability || spell.metamagic) return false;
  if (ability.id === "metamagicDistant") return (spell.range?.feet ?? 0) > 0 && spell.target !== "self";
  if (ability.id === "metamagicEmpowered") return ["damage", "attackDamage"].includes(spell.effect?.kind);
  if (ability.id === "metamagicExtended") return spellHasTimedEffect(spell);
  if (ability.id === "metamagicHeightened") return Boolean(spell.save);
  if (ability.id === "metamagicQuickened") return (spell.resource ?? "action") === "action";
  if (ability.id === "metamagicTwinned") return spellTargetingMode(spell) === "target" && !spell.area && !["self", "point", "direction"].includes(spell.target) && spellTargetCount(spell) === 1;
  return false;
}

function applyMetamagicToSpell(caster, spell, ability) {
  const cost = metamagicCostForSpell(spell, ability);
  const meta = { id: ability.id, name: ability.name, cost };
  const next = {
    ...spell,
    metamagic: meta,
    range: spell.range ? { ...spell.range } : undefined,
    duration: spell.duration ? { ...spell.duration } : undefined,
    effect: spell.effect ? { ...spell.effect, status: spell.effect.status ? { ...spell.effect.status } : undefined } : undefined,
  };
  if (ability.id === "metamagicDistant" && next.range) next.range.feet = Math.max(next.range.feet ?? 0, (next.range.feet ?? 0) * 2);
  if (ability.id === "metamagicEmpowered") next.metamagic.damageBonus = Math.max(1, abilityMod(caster, spellcastingAbility(caster)));
  if (ability.id === "metamagicExtended") {
    if (next.duration?.rounds) next.duration.rounds *= 2;
    if (next.duration?.minutes) next.duration.minutes *= 2;
    if (next.duration?.hours) next.duration.hours *= 2;
    if (next.duration?.seconds) next.duration.seconds *= 2;
    if (next.effect?.status?.durationRounds) next.effect.status.durationRounds *= 2;
    if (next.effect?.status?.durationMinutes) next.effect.status.durationMinutes *= 2;
    if (next.effect?.status?.durationHours) next.effect.status.durationHours *= 2;
    if (next.effect?.status?.durationSeconds) next.effect.status.durationSeconds *= 2;
    next.metamagic.extended = true;
  }
  if (ability.id === "metamagicHeightened") next.metamagic.saveDcBonus = 3;
  if (ability.id === "metamagicQuickened") next.resource = "bonusAction";
  if (ability.id === "metamagicTwinned") next.metamagic.extraTarget = 1;
  return next;
}

function spendMetamagic(caster, spell) {
  const meta = spell?.metamagic;
  if (!meta?.id) return;
  const ability = metamagicAbilityForSpell(caster, meta.id);
  if (!ability) return;
  caster.abilityUses = { ...(caster.abilityUses ?? {}) };
  caster.abilityUses[ability.id] = (caster.abilityUses[ability.id] ?? 0) + (meta.cost ?? metamagicCostForSpell(spell, ability));
  addLog(`${caster.name} uses ${ability.name} (${meta.cost ?? 1} sorcery point${(meta.cost ?? 1) === 1 ? "" : "s"}).`, "important");
}

async function chooseMetamagicForSpell(caster, spell) {
  if (!(caster?.classId === "sorcerer" || fighterHasFeat(caster, "metamagic-adept")) || !(caster.knownMetamagic ?? []).length) return canCastSpell(caster, spell) ? spell : null;
  const choices = [];
  if (canCastSpell(caster, spell)) {
    choices.push({ value: "none", label: "No Metamagic", description: "Cast the spell normally." });
  }
  const abilities = fighterAbilityDefinitions(caster).filter((ability) => ability.metamagicOption);
  for (const ability of abilities) {
    if (!spellCanUseMetamagic(caster, spell, ability) || !canSpendMetamagic(caster, spell, ability)) continue;
    const adjusted = applyMetamagicToSpell(caster, spell, ability);
    if (!canCastSpell(caster, adjusted)) continue;
    choices.push({
      value: ability.id,
      label: `${ability.name} (${metamagicCostForSpell(spell, ability)} sorcery)`,
      description: ability.description,
    });
  }
  if (!choices.length) return null;
  if (choices.length === 1 && choices[0].value === "none") return spell;
  const choice = await showSelectChoiceDialog({
    title: "Metamagic",
    message: `Choose how ${caster.name} casts ${spell.name}.`,
    choices,
    actor: caster,
    label: "Option",
    defaultValue: choices[0].value,
    confirmText: "Cast",
  });
  if (!choice) return null;
  if (choice === "none") return spell;
  const ability = abilities.find((entry) => entry.id === choice);
  return ability ? applyMetamagicToSpell(caster, spell, ability) : spell;
}

function canStartSpellCast(caster, spell) {
  if (canCastSpell(caster, spell)) return true;
  if (!(caster?.classId === "sorcerer" || fighterHasFeat(caster, "metamagic-adept")) || !(caster.knownMetamagic ?? []).length) return false;
  return fighterAbilityDefinitions(caster)
    .filter((ability) => ability.metamagicOption)
    .some((ability) => spellCanUseMetamagic(caster, spell, ability) && canSpendMetamagic(caster, spell, ability) && canCastSpell(caster, applyMetamagicToSpell(caster, spell, ability)));
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

function spellDismissibleStatusId(spell) {
  const status = spell?.effect?.status;
  if (!status?.id) return "";
  if (status.dismissible || status.lightSource || spell.concentration) return status.id;
  return "";
}

function statusEffectMatchesDismissibleSpell(effect, caster, spell) {
  if (!effect || !caster || !spell) return false;
  const statusId = spellDismissibleStatusId(spell);
  if (!statusId || effect.id !== statusId) return false;
  if (effect.sourceSpellId === spell.id && effect.sourceId === caster.id) return true;
  return !effect.sourceSpellId && effect.dismissible && effect.sourceId === caster.id;
}

function activeDismissibleSpellEffect(caster, spell) {
  if (!caster || !spell) return null;
  if (spell.concentration && caster.concentration?.spellId === spell.id) return { type: "concentration" };
  const statusId = spellDismissibleStatusId(spell);
  if (!statusId) return null;
  for (const fighter of Object.values(state.fighters ?? {})) {
    if ((fighter.statusEffects ?? []).some((effect) => statusEffectMatchesDismissibleSpell(effect, caster, spell))) {
      return { type: "status", id: statusId };
    }
  }
  if ((caster.statusEffects ?? []).some((effect) => effect.id === statusId && !effect.sourceSpellId && (effect.dismissible || effect.lightSource))) {
    return { type: "status", id: statusId, legacySelf: true };
  }
  return null;
}

function dismissSpellEffect(spellId) {
  const caster = state.mode === "combat" ? activeFighter() : activeHero();
  const spell = spellDefinitionsForFighter(caster).find((entry) => entry.id === spellId);
  if (!caster || !spell) return false;
  const active = activeDismissibleSpellEffect(caster, spell);
  if (!active) {
    addLog(`${caster.name} has no active ${spell.name} effect to end.`, "important");
    renderLog();
    return false;
  }

  let removed = 0;
  const statusId = spellDismissibleStatusId(spell);
  if (statusId) {
    for (const fighter of Object.values(state.fighters ?? {})) {
      const before = fighter.statusEffects?.length ?? 0;
      fighter.statusEffects = (fighter.statusEffects ?? []).filter((effect) => !statusEffectMatchesDismissibleSpell(effect, caster, spell));
      if (fighter.statusEffects.length !== before) {
        removed += before - fighter.statusEffects.length;
        refreshDerivedStats(fighter);
      }
    }
    const beforeSelf = caster.statusEffects?.length ?? 0;
    caster.statusEffects = (caster.statusEffects ?? []).filter((effect) =>
      !(effect.id === statusId && !effect.sourceSpellId && (effect.dismissible || effect.lightSource)),
    );
    if (caster.statusEffects.length !== beforeSelf) {
      removed += beforeSelf - caster.statusEffects.length;
      refreshDerivedStats(caster);
    }
  }
  if (spell.concentration && caster.concentration?.spellId === spell.id) {
    endConcentration(caster, "dismissed");
  } else if (removed > 0) {
    addLog(`${caster.name} ends ${spell.name}.`, "important");
  }
  renderAbilitiesMenu();
  renderFavoriteActionsMenu();
  render();
  return true;
}

function favoredFoeDamageDie(fighter) {
  const level = fighter?.level ?? 1;
  return level >= 14 ? 8 : level >= 6 ? 6 : 4;
}

function favoredFoeTurnKey(fighter) {
  return `${state.round ?? 0}:${state.activeIndex ?? 0}:${fighter?.id ?? ""}`;
}

function activeFavoredFoeTarget(attacker) {
  return Object.values(state.fighters ?? {}).find((fighter) =>
    fighter.alive &&
      !fighter.dead &&
      (fighter.statusEffects ?? []).some((effect) => effect.id === `favored-foe-${attacker.id}` && effect.sourceId === attacker.id),
  ) ?? null;
}

function cleanupExpiredFavoredFoe(attacker) {
  if (attacker?.concentration?.spellId !== "favored-foe") return;
  if (!activeFavoredFoeTarget(attacker)) endConcentration(attacker, "favored foe defeated");
}

function favoredFoeAbility(attacker) {
  return fighterAbilityDefinitions(attacker).find((ability) => ability.id === "favoredFoe" && (attacker.level ?? 1) >= (ability.level ?? 1)) ?? null;
}

function favoredFoeUsesRemaining(attacker, ability = favoredFoeAbility(attacker)) {
  if (!ability) return 0;
  return Math.max(0, abilityMaxUses(attacker, ability) - (attacker.abilityUses?.[ability.id] ?? 0));
}

async function maybeApplyFavoredFoe(attacker, defender) {
  const ability = favoredFoeAbility(attacker);
  if (!ability || activeFighter()?.id !== attacker.id) return null;
  cleanupExpiredFavoredFoe(attacker);
  const turnKey = favoredFoeTurnKey(attacker);
  if (attacker.favoredFoeDamageTurnKey === turnKey) return null;
  let target = activeFavoredFoeTarget(attacker);
  if (target?.id !== defender.id) {
    if (target || favoredFoeUsesRemaining(attacker, ability) <= 0) return null;
    const choice = await showChoiceDialog({
      title: "Favored Foe",
      message: `${attacker.name} hit ${defender.name}. Mark this creature as your favored foe and add damage to this hit?`,
      actor: attacker,
      choices: [
        { value: "mark", label: "Mark Target", description: `${favoredFoeUsesRemaining(attacker, ability)} use${favoredFoeUsesRemaining(attacker, ability) === 1 ? "" : "s"} remaining.` },
        { value: "skip", label: "Not Now", description: "Keep the use for a later hit." },
      ],
    });
    if (choice !== "mark") return null;
    endConcentration(attacker, "Favored Foe");
    const id = concentrationId(attacker);
    attacker.concentration = { id, spellId: "favored-foe", spellName: "Favored Foe" };
    attacker.abilityUses = { ...(attacker.abilityUses ?? {}) };
    attacker.abilityUses[ability.id] = (attacker.abilityUses[ability.id] ?? 0) + 1;
    applyStatusEffect(defender, { id: `favored-foe-${attacker.id}`, label: "Favored Foe", sourceId: attacker.id, concentrationId: id, durationRounds: 10 });
    target = defender;
    addLog(`${attacker.name} marks ${defender.name} as a favored foe.`, "important");
  }
  if (target?.id !== defender.id) return null;
  attacker.favoredFoeDamageTurnKey = turnKey;
  const die = favoredFoeDamageDie(attacker);
  const roll = rollDice(1, die);
  return {
    raw: roll.total,
    type: "damage",
    label: `Favored Foe ${roll.rolls.join(" + ")} nature`,
  };
}

function canPaySpellCost(caster, spell) {
  if (spellBaseLevel(spell) === 0) return true;
  ensureSpellPointState(caster);
  return (caster.spellPoints ?? 0) >= spellPointCost(spell);
}

function canCastSpell(caster, spell) {
  const fromScroll = Boolean(spell?.castFromScroll);
  if (!heroCanAct(caster) || !spell || (!fromScroll && !canPaySpellCost(caster, spell))) return false;
  if (fromScroll && caster?.classId === "barbarian" && fighterIsRaging(caster)) return false;
  if (fromScroll && !caster?.inventory?.items?.some((item) => item.id === spell.scrollItemId)) return false;
  if (spell.potionBreath && !(caster?.statusEffects ?? []).some((effect) => effect.potionBreath?.type === spell.effect?.type && (Number(effect.potionBreath?.uses ?? 0) || 0) > 0)) return false;
  if (!fromScroll && spell.metamagic?.id && !canSpendMetamagic(caster, spell, metamagicAbilityForSpell(caster, spell.metamagic.id))) return false;
  if (isWildShaped(caster) && (caster.level ?? 1) < 18) return false;
  if (!fromScroll && spell.id === "dragonborn-breath" && (caster.abilityUses?.dragonbornBreath ?? 0) >= 1) return false;
  if (!fromScroll && spell.racialAbilityId) {
    const ability = fighterAbilityDefinitions(caster).find((entry) => entry.id === spell.racialAbilityId);
    if (!ability || (caster.level ?? 1) < (ability.level ?? 1)) return false;
    if ((caster.abilityUses?.[ability.id] ?? 0) >= abilityMaxUses(caster, ability)) return false;
  }
  if (state.mode === "combat") {
    if (spell.resource === "reaction") return Boolean(caster.hasReaction);
    if (activeFighter()?.id !== caster.id) return false;
    if (["bonusAction", "weaponRider"].includes(spell.resource)) return Boolean(caster.hasBonusAction);
    return Boolean(caster.hasAction);
  }
  return true;
}

function consumeSpellScrollItem(caster, spell) {
  if (!spell?.castFromScroll || !spell.scrollItemId || !caster?.inventory?.items) return false;
  const index = caster.inventory.items.findIndex((item) => item.id === spell.scrollItemId);
  if (index < 0) return false;
  const [item] = caster.inventory.items.splice(index, 1);
  for (const slot of equipmentSlots) {
    if (caster.equipment?.[slot.id] === item.id) caster.equipment[slot.id] = null;
  }
  addLog(`${caster.name} consumes ${item.name ?? "a spell scroll"}.`, "important");
  return true;
}

function spendSpellResources(caster, spell) {
  if (spell.concentration) startConcentration(caster, spell);
  const fromScroll = Boolean(spell?.castFromScroll);
  if (fromScroll) {
    consumeSpellScrollItem(caster, spell);
  }
  if (spell.potionBreath) {
    const effect = (caster.statusEffects ?? []).find((entry) => entry.potionBreath?.type === spell.effect?.type && (Number(entry.potionBreath?.uses ?? 0) || 0) > 0);
    if (effect?.potionBreath) {
      effect.potionBreath.uses = Math.max(0, (Number(effect.potionBreath.uses ?? 0) || 0) - 1);
      if (effect.potionBreath.uses <= 0) {
        caster.statusEffects = (caster.statusEffects ?? []).filter((entry) => entry.id !== effect.id);
        addLog(`${caster.name}'s ${effect.label ?? "breath potion"} is spent.`, "important");
      } else {
        addLog(`${caster.name} has ${effect.potionBreath.uses} ${effect.potionBreath.type} breath use${effect.potionBreath.uses === 1 ? "" : "s"} remaining.`, "important");
      }
    }
  }
  if (!fromScroll && spell.id === "dragonborn-breath") {
    caster.abilityUses = { ...(caster.abilityUses ?? {}), dragonbornBreath: 1 };
  }
  if (!fromScroll && spell.racialAbilityId) {
    caster.abilityUses = { ...(caster.abilityUses ?? {}), [spell.racialAbilityId]: (caster.abilityUses?.[spell.racialAbilityId] ?? 0) + 1 };
  }
  const cost = spellPointCost(spell);
  if (!fromScroll && cost > 0) {
    caster.spellPoints = Math.max(0, (caster.spellPoints ?? 0) - cost);
    addLog(`${caster.name} spends ${cost} SP on ${spell.name} (spell level ${spellCastLevel(spell)}).`, "important");
  }
  if (!fromScroll) spendMetamagic(caster, spell);
  if (state.mode === "combat") {
    if (spell.resource === "reaction") caster.hasReaction = false;
    else if (["bonusAction", "weaponRider"].includes(spell.resource)) caster.hasBonusAction = false;
    else caster.hasAction = false;
  }
  if (caster?.classId === "warlock" && spellPointCost(spell) > 0) {
    if (warlockKnowsInvocation(caster, "eldritchAegis")) {
      applyStatusEffect(caster, { id: "eldritch-aegis", label: "Eldritch Aegis", acBonus: 2, durationRounds: 1 });
      addLog(`${caster.name}'s Eldritch Aegis hardens around them.`, "important");
    }
    if (warlockKnowsInvocation(caster, "patronsAegis")) {
      applyStatusEffect(caster, { id: "patrons-aegis", label: "Patron's Aegis", resistances: ["acid", "cold", "fire", "force", "lightning", "necrotic", "poison", "psychic", "radiant", "thunder"], durationRounds: 1 });
      addLog(`${caster.name}'s patron grants a broad aegis.`, "important");
    }
    if (warlockKnowsInvocation(caster, "patronsStep")) {
      caster.movementLeft = (caster.movementLeft ?? 0) + 3;
      addLog(`${caster.name}'s patron opens a 15 ft step.`, "important");
    }
  }
}

function spellRangeSquares(spell) {
  return Math.max(1, Math.floor((spell.range?.feet ?? 5) / feetPerSquare));
}

function spellAreaSquares(spell) {
  const extraFeet = Math.max(0, spellCastLevel(spell) - spellBaseLevel(spell)) * (spell.upcast?.areaRadiusFeetPerLevel ?? 0);
  return Math.max(0, Math.floor(((spell.area?.radiusFeet ?? 0) + extraFeet) / feetPerSquare));
}

function spellAreaLengthSquares(spell, terrain = spell?.area ?? {}) {
  return Math.max(1, Math.floor((terrain.lengthFeet ?? spell?.area?.lengthFeet ?? terrain.radiusFeet ?? spell?.area?.radiusFeet ?? 5) / feetPerSquare));
}

function spellAreaWidthSquares(spell, terrain = spell?.area ?? {}) {
  return Math.max(1, Math.floor((terrain.widthFeet ?? spell?.area?.widthFeet ?? 5) / feetPerSquare));
}

function spellAreaOrientation(caster, position) {
  const direction = caster && position ? directionFromCasterToPosition(caster, position) : null;
  return direction === "east" || direction === "west" ? "vertical" : "horizontal";
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
  const baseTargets = { bless: 3, bane: 3, aid: 3, "mass-healing-word": 6, "prayer-of-healing": 6, "aura-of-vitality": 6, "beacon-of-hope": 6, "aura-of-life": 6, "aura-of-purity": 6, "circle-of-power": 6, "mass-cure-wounds": 6, "heroes-feast": 6, "holy-aura": 6, "mass-heal": 6 };
  const base = baseTargets[spell?.id] ?? 1;
  return base + (spell?.metamagic?.extraTarget ?? 0) + Math.max(0, spellCastLevel(spell) - spellBaseLevel(spell)) * (spell?.upcast?.targetsPerLevel ?? 0);
}

function pendingSpellTargetingState(caster, spell, mode, hoverPosition) {
  return {
    casterId: caster.id,
    spellId: spell.id,
    castLevel: spellCastLevel(spell),
    metamagicId: spell.metamagic?.id ?? null,
    castFromScroll: Boolean(spell.castFromScroll),
    scrollItemId: spell.scrollItemId ?? null,
    scrollTemplateId: spell.scrollTemplateId ?? null,
    mode,
    hoverPosition,
  };
}

function currentPendingSpellTargeting() {
  if (!pendingSpellTargeting) return null;
  const caster = state.fighters[pendingSpellTargeting.casterId];
  const spell = getContentDefinition("spells", pendingSpellTargeting.spellId);
  let castSpell = spell ? spellWithCastLevel(spell, pendingSpellTargeting.castLevel) : null;
  if (castSpell && pendingSpellTargeting.castFromScroll) {
    castSpell = {
      ...castSpell,
      castFromScroll: true,
      scrollItemId: pendingSpellTargeting.scrollItemId ?? null,
      scrollTemplateId: pendingSpellTargeting.scrollTemplateId ?? null,
    };
  }
  const metamagicAbility = pendingSpellTargeting.metamagicId ? metamagicAbilityForSpell(caster, pendingSpellTargeting.metamagicId) : null;
  if (castSpell && metamagicAbility) castSpell = applyMetamagicToSpell(caster, castSpell, metamagicAbility);
  if (castSpell?.id === "dragonborn-breath") {
    castSpell = {
      ...castSpell,
      save: { ...castSpell.save, ability: caster?.racialTraits?.dragonBreathSaveAbility ?? "dex" },
      effect: { ...castSpell.effect, type: caster?.racialTraits?.dragonDamageType ?? castSpell.effect?.type ?? "fire" },
    };
  }
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
    (fighter) => fighter.alive && !fighter.dead && window.DungeonGrid.fighterOccupies(fighter, position),
  ) ?? null;
}

function spellRequiresPhysicalLineOfSight(spell) {
  if (!spell || spell.requiresLineOfSight === false) return false;
  if (spell.range?.kind === "self" || spell.range?.kind === "touch" || spell.target === "self") return false;
  if (spell.requiresLineOfSight === true) return true;
  if (spell.effect?.kind === "attack" || spell.effect?.spellAttack || spell.effect?.spellAttackBonus) return true;
  if (spell.target === "enemy" || spell.target === "creature" || spell.target === "point") return spell.range?.kind === "ranged";
  return false;
}

function fighterInSpellRange(source, target, spell, range = spellRangeSquares(spell)) {
  if (attackGridDistanceBetweenFighters(source, target) > range) return false;
  if (!spellRequiresPhysicalLineOfSight(spell)) return true;
  return hasClearLineOfSightBetweenFighters(source, target);
}

function fightersWithinSquares(a, b, range) {
  return attackGridDistanceBetweenFighters(a, b) <= range;
}

function spellTargetsFor(caster, spell) {
  const range = spellRangeSquares(spell);
  if (spell.target === "self") {
    return caster?.alive ? [caster] : [];
  }
  if (spell.target === "ally") {
    if (spell.id === "spare-the-dying") {
      return partyHeroes().filter((hero) => !hero.dead && fightersWithinSquares(caster, hero, range));
    }
    return partyHeroes().filter((hero) => hero.alive && fightersWithinSquares(caster, hero, range));
  }
  if (spell.target === "enemy") {
    return visibleMonsters().filter((monster) => monster.alive && fighterInSpellRange(caster, monster, spell, range));
  }
  if (spell.target === "creature") {
    return Object.values(state.fighters).filter(
      (fighter) => fighter.alive && !fighter.dead && window.DungeonGrid.fighterCells(fighter).some(isKnownTile) && fighterInSpellRange(caster, fighter, spell, range),
    );
  }
  if (spell.target === "point") {
    return visibleMonsters().filter((monster) => monster.alive && fighterInSpellRange(caster, monster, spell, range));
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
  const pointTarget = { id: "spell-point", position };
  if (attackGridDistanceBetweenFighters(caster, pointTarget) > spellRangeSquares(spell)) return false;
  if (!hasClearLineOfSightBetweenFighters(caster, pointTarget)) return false;
  const casterRoom = roomForPosition(caster.position);
  const targetRoom = roomForPosition(position);
  return !casterRoom || targetRoom?.id === casterRoom.id;
}

function centeredLineCells(originPosition, spell, terrain = spell?.area ?? {}, orientation = terrain.orientation ?? spell?.area?.orientation ?? "horizontal") {
  if (!originPosition) return [];
  const length = spellAreaLengthSquares(spell, terrain);
  const width = spellAreaWidthSquares(spell, terrain);
  const halfLengthBefore = Math.floor((length - 1) / 2);
  const halfLengthAfter = length - halfLengthBefore - 1;
  const halfWidthBefore = Math.floor((width - 1) / 2);
  const halfWidthAfter = width - halfWidthBefore - 1;
  const cells = [];
  const walkable = currentWalkable(null, { includePersistentBlocks: false });
  for (let lengthOffset = -halfLengthBefore; lengthOffset <= halfLengthAfter; lengthOffset += 1) {
    for (let widthOffset = -halfWidthBefore; widthOffset <= halfWidthAfter; widthOffset += 1) {
      const cell =
        orientation === "vertical"
          ? { x: originPosition.x + widthOffset, y: originPosition.y + lengthOffset }
          : { x: originPosition.x + lengthOffset, y: originPosition.y + widthOffset };
      if (window.DungeonGrid.isInsideGrid(cell, currentGridSize()) && walkable.has(positionKey(cell))) cells.push(cell);
    }
  }
  return cells;
}

function cagePerimeterCells(originPosition, spell, terrain = spell?.area ?? {}) {
  if (!originPosition) return [];
  const radius = Math.max(1, Math.floor((terrain.radiusFeet ?? spell?.area?.radiusFeet ?? 10) / feetPerSquare));
  const cells = [];
  const walkable = currentWalkable(null, { includePersistentBlocks: false });
  for (let y = originPosition.y - radius; y <= originPosition.y + radius; y += 1) {
    for (let x = originPosition.x - radius; x <= originPosition.x + radius; x += 1) {
      const cell = { x, y };
      if (!window.DungeonGrid.isInsideGrid(cell, currentGridSize()) || !walkable.has(positionKey(cell))) continue;
      if (Math.abs(x - originPosition.x) === radius || Math.abs(y - originPosition.y) === radius) cells.push(cell);
    }
  }
  return cells;
}

function spellAreaCells(originPosition, spell) {
  if (!originPosition) return [];
  if (!spell.area) return [{ ...originPosition }];
  if (["line", "wall"].includes(spell.area.shape) && spell.target !== "direction") {
    return centeredLineCells(originPosition, spell, spell.area, spell.area.orientation ?? spell.orientation);
  }
  if (spell.area.shape === "cage") return cagePerimeterCells(originPosition, spell, spell.area);
  const radius = spellAreaSquares(spell);
  const cells = [];
  const walkable = currentWalkable(null, { includePersistentBlocks: false });
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
  return Object.values(state.fighters).filter(
    (fighter) => fighter.alive && !fighter.dead && window.DungeonGrid.fighterCells(fighter).some((cell) => keys.has(positionKey(cell))),
  );
}

function areaTargetsForSpell(origin, spell, caster) {
  const originPosition = origin?.position ?? origin;
  const targets = spell.area ? spellTargetsFromCells(spellAreaCells(originPosition, spell)) : spellTargetsFromCells([originPosition]);
  return targets.filter((target) => spellAffectsFighter(caster, spell, target));
}

function persistentAreaSpellIds() {
  return new Set(["moonbeam", "spike-growth", "fog-cloud", "silence", "darkness", "daylight", "dancing-lights", "hunger-of-hadar", "cloud-of-daggers", "dust-devil", "flaming-sphere", "plant-growth", "sleet-storm", "stinking-cloud", "wall-of-sand", "wall-of-water", "wind-wall", "black-tentacles", "grasping-vine", "guardian-of-faith", "sickening-radiance", "storm-sphere", "wall-of-fire", "watery-sphere", "cloudkill", "dawn", "insect-plague", "maelstrom", "transmute-rock", "wrath-of-nature", "blade-barrier", "forbiddance", "sunbeam", "wall-of-ice", "wall-of-thorns", "arcane-sword", "forcecage", "reverse-gravity", "symbol", "whirlwind", "earthquake", "incendiary-cloud", "maddening-darkness", "tsunami", "prismatic-wall", "storm-of-vengeance", "weird"]);
}

function ensureSpellAreas() {
  state.spellAreas = Array.isArray(state.spellAreas) ? state.spellAreas : [];
  return state.spellAreas;
}

function removeMagicalDarknessInCells(cells, maxSpellLevel = 3) {
  if (!cells?.length || !state?.spellAreas?.length) return 0;
  const affectedKeys = new Set(cells.map(positionKey));
  const before = state.spellAreas.length;
  state.spellAreas = state.spellAreas.filter((area) => {
    if (!magicalDarknessSpellIds.has(area.spellId)) return true;
    const spell = getContentDefinition("spells", area.spellId);
    const castLevel = area.castLevel ?? spell?.level ?? 0;
    if (castLevel > maxSpellLevel) return true;
    return !persistentAreaCells(area).some((cell) => affectedKeys.has(positionKey(cell)));
  });
  return before - state.spellAreas.length;
}

function createPersistentSpellArea(caster, spell, position, options = {}) {
  if (!persistentAreaSpellIds().has(spell?.id) || !position) return;
  const durationRounds = spell.duration?.rounds ?? spell.effect?.status?.durationRounds ?? 3;
  const durationSeconds = durationSecondsFromDefinition(spell.duration ?? { durationRounds });
  const area = {
    id: `${spell.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    spellId: spell.id,
    spellName: spell.name,
    casterId: caster.id,
    concentrationId: spell.concentration ? concentrationId(caster) : null,
    position: { ...position },
    origin: options.origin ? { ...options.origin } : { ...position },
    direction: options.direction ?? null,
    orientation: options.orientation ?? spellAreaOrientation(caster, position),
    castLevel: spellCastLevel(spell),
    durationRounds,
    durationSeconds,
    expiresAtDungeonTimeSeconds: dungeonElapsedSeconds({ sync: false }) + durationSeconds,
  };
  ensureSpellAreas().push(area);
  if (spell.lightSource?.dispelsMagicalDarkness || spell.effect?.dispelsMagicalDarkness) {
    const removed = removeMagicalDarknessInCells(persistentAreaCells(area), spell.effect?.dispelMaxSpellLevel ?? spell.lightSource?.dispelMaxSpellLevel ?? 3);
    if (removed) addLog(`${spell.name} burns away ${removed} magical darkness ${removed === 1 ? "area" : "areas"}.`, "important");
  }
  const durationText = spell.duration?.hours ? `${spell.duration.hours} ${spell.duration.hours === 1 ? "hour" : "hours"}` : `${durationRounds} rounds`;
  addLog(`${spell.name} persists in the area for ${durationText}.`, "important");
}

function persistentAreaCells(area) {
  const spell = getContentDefinition("spells", area.spellId);
  if (!spell) return [];
  const areaSpell = { ...spell, castLevel: area.castLevel, orientation: area.orientation };
  if (area.direction && spell.target === "direction") return spellDirectionCellsFromOrigin(area.origin ?? area.position, area.direction, areaSpell);
  return spellAreaCells(area.position, areaSpell);
}

function persistentAreaTileKeys() {
  const keys = new Set();
  for (const area of ensureSpellAreas()) {
    for (const cell of persistentAreaCells(area)) keys.add(positionKey(cell));
  }
  return keys;
}

function spellPersistentTerrain(spell) {
  return spell?.area?.terrain ?? spell?.persistentTerrain ?? null;
}

function persistentAreaTerrainCells(area) {
  const spell = getContentDefinition("spells", area.spellId);
  const terrain = spellPersistentTerrain(spell);
  if (!spell || !terrain) return [];
  const areaSpell = { ...spell, castLevel: area.castLevel, orientation: area.orientation };
  if (terrain.shape === "cage") return cagePerimeterCells(area.position, areaSpell, terrain);
  if (terrain.shape === "wall" || terrain.shape === "line") return centeredLineCells(area.position, areaSpell, terrain, area.orientation);
  if (area.direction && spell.target === "direction") return spellDirectionCellsFromOrigin(area.origin ?? area.position, area.direction, { ...areaSpell, area: { ...spell.area, ...terrain } });
  return spellAreaCells(area.position, { ...areaSpell, area: { ...spell.area, ...terrain } });
}

function persistentAreaTerrainKeys(predicate) {
  const keys = new Set();
  for (const area of ensureSpellAreas()) {
    const spell = getContentDefinition("spells", area.spellId);
    const terrain = spellPersistentTerrain(spell);
    if (!terrain || !predicate(terrain, spell, area)) continue;
    for (const cell of persistentAreaTerrainCells(area)) keys.add(positionKey(cell));
  }
  return keys;
}

function persistentSpellBlockingTileKeys() {
  return persistentAreaTerrainKeys((terrain) => terrain.blocksMovement);
}

function persistentSpellLineOfSightBlockingTileKeys() {
  return persistentAreaTerrainKeys((terrain) => terrain.blocksLineOfSight);
}

function persistentAreaDifficultTerrainKeys() {
  return persistentAreaTerrainKeys((terrain) => terrain.difficultTerrain);
}

function persistentAreaBlockingTileKeys() {
  return persistentSpellBlockingTileKeys();
}

function agePersistentSpellAreasForCaster(caster) {
  if (!caster?.id || !state?.spellAreas?.length) return;
  expireTimedSpellAreas();
}

async function applyPersistentSpellAreasAtTurnStart(fighter) {
  if (!fighter?.alive || fighter.dead) return;
  for (const area of [...ensureSpellAreas()]) {
    const caster = state.fighters?.[area.casterId];
    const spell = getContentDefinition("spells", area.spellId);
    const areaKeys = new Set(persistentAreaCells(area).map(positionKey));
    if (!caster || !spell || !window.DungeonGrid.fighterCells(fighter).some((cell) => areaKeys.has(positionKey(cell)))) continue;
    if (!spellAffectsFighter(caster, spell, fighter)) continue;
    const castSpell = { ...spell, castLevel: area.castLevel, casterLevel: caster.level ?? 1 };
    addLog(`${fighter.name} starts their turn in ${area.spellName}.`, "important");
    if (spell.effect?.kind === "damage") await applySpellDamage(caster, fighter, castSpell, { origin: area.origin ?? area.position });
    if (spell.effect?.kind === "status") await applySpellStatus(caster, fighter, castSpell);
    if (!fighter.alive && isPartyHeroId(fighter.id)) handleHeroDeath();
  }
  await applySpiritGuardiansAtTurnStart(fighter);
}

async function applySpiritGuardiansAtTurnStart(fighter) {
  if (!fighter?.alive || fighter.dead) return;
  for (const caster of Object.values(state.fighters ?? {})) {
    const guardian = (caster.statusEffects ?? []).find((effect) => effect.id === "spirit-guardians" && effect.aura);
    if (!guardian || !hostileTo(caster, fighter) || attackGridDistanceBetweenFighters(caster, fighter) > Math.floor((guardian.aura.radiusFeet ?? 15) / feetPerSquare)) continue;
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

function spellDirectionCellsFromOrigin(origin, direction, spell) {
  if (!origin || !direction) return [];
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
  for (const tileKey of currentWalkable(null, { includePersistentBlocks: false })) {
    const cell = positionFromKey(tileKey);
    const dx = cell.x - origin.x;
    const dy = cell.y - origin.y;
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

function positionInSpellDirection(caster, direction, spell, position) {
  if (!caster || !direction || !position) return false;
  const length = Math.max(1, Math.floor((spell.area?.lengthFeet ?? spell.range?.feet ?? 15) / feetPerSquare));
  const width = Math.max(1, Math.floor((spell.area?.widthFeet ?? 5) / feetPerSquare));
  const deltas = {
    north: { x: 0, y: -1 },
    east: { x: 1, y: 0 },
    south: { x: 0, y: 1 },
    west: { x: -1, y: 0 },
  };
  const delta = deltas[direction] ?? deltas.north;
  const dx = position.x - caster.position.x;
  const dy = position.y - caster.position.y;
  const forward = delta.x ? dx * delta.x : dy * delta.y;
  const side = delta.x ? Math.abs(dy) : Math.abs(dx);
  if (forward <= 0 || forward > length) return false;
  return spell.area?.shape === "cone" ? side <= forward : side < width;
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
  pendingSpellTargeting = pendingSpellTargetingState(caster, spell, mode, mode === "target" ? spellTargetsFor(caster, spell)[0]?.position ?? null : caster.position);
  const instructions = {
    point: "Choose a square for the spell area.",
    direction: "Choose a direction from the caster.",
    target: targetCount > 1 ? `Choose ${targetCount} targets.` : "Choose a creature to center or target the spell.",
  };
  const metamagicText = spell.metamagic?.name ? ` with ${spell.metamagic.name}` : "";
  addLog(`${caster.name} readies ${spell.name}${metamagicText} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP. ${instructions[mode]}`, "important");
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
      pendingSpellTargeting = pendingSpellTargetingState(caster, spell, mode, position);
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
      pendingSpellTargeting = pendingSpellTargetingState(caster, spell, mode, position);
      render();
      return true;
    }
    await castSpellInDirection(caster, spell, direction);
    return true;
  }
  const target = fighterAtPosition(position);
  if (!isValidSpellTarget(caster, spell, target)) {
    pendingSpellTargeting = pendingSpellTargetingState(caster, spell, mode, position);
    addLog(`That is not a valid target for ${spell.name}.`, "important");
    render();
    return true;
  }
  const targetCount = Math.min(spellTargetCount(spell), spellTargetsFor(caster, spell).length);
  if (targetCount > 1) {
    pendingMultiTargetSpell = pendingMultiTargetSpell ?? { targetIds: [] };
    if (!pendingMultiTargetSpell.targetIds.includes(target.id)) pendingMultiTargetSpell.targetIds.push(target.id);
    if (pendingMultiTargetSpell.targetIds.length < targetCount) {
      pendingSpellTargeting = pendingSpellTargetingState(caster, spell, mode, position);
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
  const cellTargets = spellTargetsFromCells(spellDirectionCells(caster, direction, spell));
  const geometricTargets = Object.values(state.fighters ?? {}).filter(
    (fighter) => fighter.alive && !fighter.dead && window.DungeonGrid.fighterCells(fighter).some((cell) => positionInSpellDirection(caster, direction, spell, cell)),
  );
  const targetsById = new Map([...cellTargets, ...geometricTargets].map((fighter) => [fighter.id, fighter]));
  return [...targetsById.values()].filter((fighter) => spellAffectsFighter(caster, spell, fighter));
}

function scaledSpellDice(spell) {
  const dice = { ...(spell.effect?.dice ?? { count: 1, sides: 6 }) };
  if (spell.id === "dragonborn-breath") {
    const casterLevel = spell.casterLevel ?? 1;
    dice.count = casterLevel >= 16 ? 5 : casterLevel >= 11 ? 4 : casterLevel >= 6 ? 3 : 2;
    return dice;
  }
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

function directionDelta(direction) {
  return {
    north: { x: 0, y: -1 },
    east: { x: 1, y: 0 },
    south: { x: 0, y: 1 },
    west: { x: -1, y: 0 },
  }[direction] ?? null;
}

function forcedMovementStepOptions(source, target, movement = {}, context = {}) {
  const mode = movement.mode ?? "push";
  const vector =
    movement.direction === "spell" && context.direction
      ? directionDelta(context.direction)
      : movement.direction && typeof movement.direction === "object"
        ? movement.direction
        : null;
  let dx = 0;
  let dy = 0;
  if (vector) {
    dx = Math.sign(vector.x ?? 0);
    dy = Math.sign(vector.y ?? 0);
  } else {
    const origin = movement.origin ?? context.origin ?? source?.position;
    if (!origin || !target?.position) return [];
    dx = Math.sign(target.position.x - origin.x);
    dy = Math.sign(target.position.y - origin.y);
    if (mode === "pull") {
      dx *= -1;
      dy *= -1;
    }
  }
  if (!dx && !dy) return [];
  if (Math.abs(dx) + Math.abs(dy) === 1) return [{ x: dx, y: dy }];
  return [
    { x: dx, y: dy },
    { x: dx, y: 0 },
    { x: 0, y: dy },
  ];
}

function forcedMovementDistanceSquares(movement = {}) {
  return Math.max(1, Math.floor((movement.distanceFeet ?? movement.feet ?? 5) / feetPerSquare));
}

function forcedMovementLabel(source, target, movement = {}, movedSquares = 0) {
  const feet = movedSquares * feetPerSquare;
  const mode = movement.mode ?? "push";
  if (mode === "pull") return `${source.name}'s ${movement.label ?? "magic"} pulls ${target.name} ${feet} ft.`;
  if (mode === "flee") return `${target.name} flees ${feet} ft from ${source.name}'s ${movement.label ?? "magic"}.`;
  return `${source.name}'s ${movement.label ?? "magic"} pushes ${target.name} ${feet} ft.`;
}

function applyForcedMovement(source, target, movement = {}, context = {}) {
  if (!source?.position || !target?.position || !target.alive || target.dead) return false;
  if (activeMagicItemByTemplate(target, barrowCrownItemIds.drownedLegionShield)) {
    const dc = movement.dc ?? 13;
    const roll = rollD20ForFighter(target, { advantage: true });
    const total = roll.roll + proficiencyBonus(target);
    addLog(`${target.name}'s Bone-Bound shield resists forced movement: d20 ${roll.rolls.join(" / ")} -> ${roll.roll} ${abilityLabel(proficiencyBonus(target))} = ${total} vs DC ${dc}.`, "important");
    if (total >= dc) return false;
  }
  if ((target.statusEffects ?? []).some((effect) => effect.speedLocked && movement.respectsSpeedLock !== false)) {
    addLog(`${target.name} is held in place and cannot be moved by ${movement.label ?? "the force"}.`, "important");
    return false;
  }
  const steps = forcedMovementDistanceSquares(movement);
  let moved = 0;
  for (let index = 0; index < steps; index += 1) {
    const options = forcedMovementStepOptions(source, target, movement, context);
    const destination = options
      .map((delta) => ({ x: target.position.x + delta.x, y: target.position.y + delta.y }))
      .find((position) => canPushTargetToPosition(source, target, position));
    if (!destination) break;
    target.position = destination;
    moved += 1;
  }
  if (!moved) {
    addLog(`${target.name} cannot be moved by ${movement.label ?? source.name}.`, "important");
    return false;
  }
  triggerTrapAtPosition(target, target.position);
  addLog(forcedMovementLabel(source, target, movement, moved), "important");
  return true;
}

function spellForcedMovement(spell) {
  const movement = spell?.effect?.forcedMovement ?? spell?.effect?.status?.forcedMovement ?? null;
  if (!movement) return null;
  return { label: spell.name, ...movement };
}

function applySpellForcedMovement(caster, target, spell, save = null, context = {}) {
  const movement = spellForcedMovement(spell);
  if (!movement) return false;
  if (movement.on === "failedSave" && save?.success) return false;
  if (movement.on === "successfulSave" && !save?.success) return false;
  return applyForcedMovement(caster, target, movement, context);
}

async function applySpellDamage(caster, target, spell, context = {}) {
  const dice = scaledSpellDice(spell);
  const roll = rollDice(dice.count, dice.sides);
  let raw = Math.max(1, roll.total + (dice.bonus ?? 0));
  let save = null;
  if (spell.id === "dragonborn-breath") {
    const bonusText = dice.bonus ? ` ${abilityLabel(dice.bonus)}` : "";
    addLog(`${caster.name}'s Breath Weapon damage roll: ${roll.rolls.join(" + ")}${bonusText} = ${raw} ${spell.effect?.type ?? "damage"}.`, "damage");
  } else {
    addAdminLog(`${caster.name}'s ${spell.name} damage roll: ${roll.rolls.join(" + ")}${dice.bonus ? ` ${abilityLabel(dice.bonus)}` : ""} = ${raw} ${spell.effect?.type ?? "damage"}.`);
  }
  if (spell.save) {
    save = await rollSavingThrow(target, spell.save.ability, spellSaveDc(caster, spell), `${caster.name}'s ${spell.name} forces ${target.name} to make a ${spell.save.ability.toUpperCase()} save.`);
    if (save.success && spellBaseLevel(spell) === 0 && !spell.save.halfDamage) {
      addLog(`${target.name} avoids ${spell.name}.`);
      return { save, damaged: false };
    }
    if (spell.save.halfDamage) raw = evasionAdjustedDamage(target, save, raw);
  }
  if (isSidekickSpellcaster(caster) && spellBaseLevel(spell) === 0 && (caster.level ?? 1) >= 6) raw += Math.max(0, abilityMod(caster, spellcastingAbility(caster)));
  if (isSidekickSpellcaster(caster) && spellBaseLevel(spell) > 0 && (caster.level ?? 1) >= 14 && caster.empoweredSpellSchool === spell.school) raw += Math.max(0, abilityMod(caster, spellcastingAbility(caster)));
  if (spell.metamagic?.damageBonus) raw += spell.metamagic.damageBonus;
  if (caster.classId === "cleric" && (caster.level ?? 1) >= 8 && spellBaseLevel(spell) === 0 && !caster.blessedStrikeUsedThisTurn) {
    const blessed = rollDice(1, 8);
    raw += blessed.total;
    caster.blessedStrikeUsedThisTurn = true;
    addLog(`${caster.name}'s Blessed Strike adds ${blessed.total} radiant force.`, "important");
  }
  if (raw <= 0) return { save, damaged: false };
  applySpecialDamage(caster, target, raw, spell.effect.type ?? "force", spell.name);
  if (spell.effect?.status && (!save || !save.success)) await applySpellStatus(caster, target, spell, { skipSave: true });
  else applySpellForcedMovement(caster, target, spell, save, context);
  return { save, damaged: true };
}

function applySpellHealing(caster, target, spell) {
  const dice = scaledSpellDice(spell);
  const roll = rollDice(dice.count, dice.sides);
  let bonus = spell.effect?.abilityBonus === "spellcasting" ? abilityMod(caster, spell?.saveDcAbility ?? spellcastingAbility(caster)) : spell.effect?.bonus ?? 0;
  if (isSidekickSpellcaster(caster) && spellBaseLevel(spell) > 0 && (caster.level ?? 1) >= 14 && caster.empoweredSpellSchool === spell.school) bonus += Math.max(0, abilityMod(caster, spellcastingAbility(caster)));
  const discipleBonus = caster?.subclassId === "life-domain" && (caster.level ?? 1) >= 3 && spellBaseLevel(spell) > 0 ? 2 + spellCastLevel(spell) : 0;
  const healed = applyHealingToHero(target, Math.max(0, roll.total + bonus + discipleBonus));
  const discipleText = discipleBonus > 0 ? ` + Disciple of Life ${discipleBonus}` : "";
  addLog(`${caster.name}'s ${spell.name} heals ${target.name} for ${healed} HP (${roll.rolls.join(" + ")} ${abilityLabel(bonus)}${discipleText}).`, "heal");
  if (caster?.subclassId === "life-domain" && (caster.level ?? 1) >= 10 && target?.id !== caster.id && spellBaseLevel(spell) > 0) {
    const selfHeal = Math.max(1, 2 + spellCastLevel(spell));
    const restored = applyHealingToHero(caster, selfHeal);
    if (restored > 0) addLog(`${caster.name}'s Blessed Healer restores ${restored} HP to themself.`, "heal");
  }
  void maybeFinishEncounterAfterHeroRecovery();
}

function restorationEffectIsNegative(effect) {
  if (!effect) return false;
  if (effect.condition && !["blessed", "invisible"].includes(effect.condition)) return true;
  return Boolean(
    (effect.attackBonus ?? 0) < 0 ||
      (effect.saveBonus ?? 0) < 0 ||
      (effect.skillBonus ?? 0) < 0 ||
      (effect.acBonus ?? 0) < 0 ||
      (effect.speedBonusFeet ?? 0) < 0 ||
      effect.speedLocked ||
      effect.actionLocked ||
      effect.poisoned ||
      effect.disease ||
      effect.curse
  );
}

function applySpellRestoration(caster, target, spell) {
  const before = target.statusEffects ?? [];
  const removeAll = spell.effect?.removeAll !== false;
  const removed = [];
  target.statusEffects = before.filter((effect) => {
    if ((effect.curse || effect.curseId) && !spell.effect?.removeCurses) return true;
    if (!restorationEffectIsNegative(effect)) return true;
    if (!removeAll && removed.length >= 1) return true;
    removed.push(effect);
    return false;
  });
  const diseaseIds = new Set(removed.map((effect) => effect.diseaseId).filter(Boolean));
  if (diseaseIds.size) {
    target.statusEffects = target.statusEffects.filter((effect) => {
      if (!diseaseIds.has(effect.diseaseId)) return true;
      removed.push(effect);
      return false;
    });
  }
  if (spell.effect?.removeCurses) {
    const curseResult = removeCursesFromFighter(target);
    removed.push(...curseResult.statuses);
  }
  if (spell.effect?.healDice) {
    const roll = rollDice(spell.effect.healDice.count, spell.effect.healDice.sides);
    const healed = applyHealingToHero(target, roll.total + (spell.effect.healBonus ?? 0));
    if (healed > 0) addLog(`${caster.name}'s ${spell.name} restores ${healed} HP to ${target.name}.`, "heal");
  } else {
    refreshDerivedStats(target);
  }
  if (removed.length) addLog(`${caster.name}'s ${spell.name} removes ${removed.map((effect) => effect.label ?? effect.id).join(", ")} from ${target.name}.`, "important");
  else addLog(`${caster.name}'s ${spell.name} finds no harmful effect on ${target.name}.`, "important");
}

function spellRevivalWindowSeconds(spell) {
  if (spell?.id === "revivify") return corpseRevivifyWindowSeconds;
  if (spell?.id === "raise-dead") return corpseRaiseDeadWindowSeconds;
  return Number.POSITIVE_INFINITY;
}

function canSpellReviveCorpse(caster, spell, corpseHero) {
  if (!caster || !spell || !corpseHero?.dead) return false;
  if (!heroCanAct(caster)) return false;
  if (spell.effect?.kind !== "revive") return false;
  if (!canPaySpellCost(caster, spell)) return false;
  const windowSeconds = spellRevivalWindowSeconds(spell);
  return corpseEffectiveAgeSeconds(corpseHero) <= windowSeconds;
}

function reviveCorpseWithSpell(caster, corpseHero, spell) {
  if (!canSpellReviveCorpse(caster, spell, corpseHero)) {
    addLog(`${spell?.name ?? "The spell"} cannot restore ${corpseHero?.name ?? "that corpse"} in its current state.`, "important");
    return false;
  }
  spendSpellResources(caster, spell);
  const reviveHp = Math.max(1, Math.floor(corpseHero.maxHp * (spell.effect?.hpFraction ?? 0)) || (spell.effect?.hp ?? 1));
  corpseHero.dead = false;
  corpseHero.alive = true;
  corpseHero.hp = Math.min(corpseHero.maxHp, reviveHp);
  corpseHero.temporaryHp = 0;
  corpseHero.stableAtZero = false;
  corpseHero.deathSaves = { successes: 0, failures: 0 };
  corpseHero.deathLootDropped = false;
  corpseHero.corpse = {
    ...(corpseHero.corpse ?? {}),
    revivedAtDungeonTimeSeconds: dungeonElapsedSeconds({ sync: false }),
    revivedAtCampaignTimeSeconds: campaignElapsedSeconds({ sync: false }),
    location: null,
  };
  corpseHero.corpseAtBase = false;
  if (state.mode !== "home" && caster.position) corpseHero.position = { ...caster.position };
  state.party.rosterIds = uniqueValues([...(state.party.rosterIds ?? []), corpseHero.id]);
  if (state.mode !== "home") state.party.heroIds = uniqueValues([...(state.party.heroIds ?? []), corpseHero.id]);
  if (!state.party.activeHeroId || state.fighters[state.party.activeHeroId]?.dead) state.party.activeHeroId = corpseHero.id;
  refreshDerivedStats(corpseHero);
  addLog(`${caster.name} casts ${spell.name}. ${corpseHero.name} returns to life with ${corpseHero.hp} HP.`, "important");
  void maybeFinishEncounterAfterHeroRecovery();
  return true;
}

function preserveCorpseWithSpell(caster, corpseHero, spell) {
  if (!caster || !spell || !corpseHero?.dead || !heroCanAct(caster) || spell.effect?.kind !== "preserveCorpse" || !canPaySpellCost(caster, spell)) return false;
  spendSpellResources(caster, spell);
  const corpse = ensureHeroCorpseState(corpseHero);
  const durationSeconds = spell.effect?.durationSeconds ?? corpseGentleReposeSeconds;
  const nowDungeonSeconds = dungeonElapsedSeconds({ sync: false });
  const nowCampaignSeconds = campaignElapsedSeconds({ sync: false });
  corpse.preservedUntilDungeonTimeSeconds = Math.max(corpse.preservedUntilDungeonTimeSeconds ?? 0, nowDungeonSeconds + durationSeconds);
  corpse.preservedUntilCampaignTimeSeconds = Math.max(corpse.preservedUntilCampaignTimeSeconds ?? 0, nowCampaignSeconds + durationSeconds);
  addLog(`${caster.name} casts ${spell.name}. ${corpseHero.name}'s body will not decay for ${formatDuration(corpse.preservedUntilCampaignTimeSeconds - nowCampaignSeconds)}.`, "important");
  return true;
}

function summonActorProfiles() {
  return {
    familiar: { monsterId: "summonFamiliarCat", name: "Familiar", behavior: "skirmisher", hpMultiplier: 1, damageBonus: 0, followDistanceSquares: 1 },
    steed: { monsterId: "summonSteedWarhorse", name: "Steed", behavior: "melee", hpMultiplier: 1, damageBonus: 0, followDistanceSquares: 1 },
    greaterSteed: { monsterId: "summonGreaterSteedPegasus", name: "Greater Steed", behavior: "melee", hpMultiplier: 1, damageBonus: 0, followDistanceSquares: 1 },
    skeleton: { monsterId: "skeletonArcher", name: "Skeleton", behavior: "rangedKiter", hpMultiplier: 0.9, followDistanceSquares: 2 },
    beast: { monsterId: "forestWolf", name: "Conjured Beast", behavior: "melee", hpMultiplier: 0.9, followDistanceSquares: 2 },
    elemental: { monsterId: "shaleHound", name: "Conjured Elemental", behavior: "melee", hpMultiplier: 1.25, damageBonus: 1, followDistanceSquares: 2 },
    hound: { monsterId: "blindCaveHound", name: "Faithful Hound", behavior: "guard", hpMultiplier: 1, attackBonus: 1, followDistanceSquares: 1 },
    arcaneHand: { monsterId: "pitImpScout", name: "Arcane Hand", behavior: "melee", hpMultiplier: 1.2, damageBonus: 2, followDistanceSquares: 1 },
    object: { monsterId: "skeletalSpearman", name: "Animated Object", behavior: "melee", hpMultiplier: 0.65, damageBonus: -1, followDistanceSquares: 1 },
  };
}

function summonOpenPositionsAround(owner, origin, count = 1) {
  const occupied = new Set(
    Object.values(state.fighters ?? {})
      .filter((fighter) => fighter.alive)
      .flatMap((fighter) => window.DungeonGrid.fighterCells(fighter).map(positionKey)),
  );
  const walkable = currentWalkable(owner);
  const candidates = [origin, ...window.DungeonGrid.neighbors(origin, currentGridSize()), ...surroundingCells(origin)]
    .filter(Boolean)
    .filter((position) => window.DungeonGrid.isInsideGrid(position, currentGridSize()))
    .sort((a, b) => distance(a, origin) - distance(b, origin));
  const positions = [];
  for (const position of candidates) {
    const key = positionKey(position);
    if (!walkable.has(key) || occupied.has(key) || positions.some((entry) => positionKey(entry) === key)) continue;
    if (owner?.position && !canTraverseMovementEdge(owner, owner.position, position, [])) {
      const adjacentToOrigin = Math.abs(position.x - origin.x) + Math.abs(position.y - origin.y) <= 1;
      if (!adjacentToOrigin) continue;
    }
    positions.push({ ...position });
    if (positions.length >= count) break;
  }
  return positions;
}

function scaleSummonedSpellActor(actor, caster, spell, summon = {}, profile = {}) {
  const level = caster.level ?? 1;
  const prof = proficiencyBonus(caster);
  const durationRounds = summon.durationRounds ?? spell.duration?.rounds ?? 6;
  const durationSeconds = durationSecondsFromDefinition(summon.duration ?? spell.duration ?? { durationRounds });
  actor.level = level;
  actor.maxHp = Math.max(1, Math.floor((actor.maxHp ?? 1) * (profile.hpMultiplier ?? 1)) + level * (summon.hpPerCasterLevel ?? 1));
  actor.baseMaxHp = actor.maxHp;
  actor.hp = actor.maxHp;
  actor.attackBonus = (actor.attackBonus ?? 3) + Math.max(0, prof - 2) + (profile.attackBonus ?? summon.attackBonus ?? 0);
  actor.damage = {
    ...(actor.damage ?? { count: 1, sides: 6, bonus: 0, type: "damage" }),
    bonus: Math.max(0, (actor.damage?.bonus ?? 0) + Math.floor(level / 5) + (profile.damageBonus ?? summon.damageBonus ?? 0)),
  };
  actor.baseDamage = { ...actor.damage };
  actor.summonedByHeroId = caster.id;
  actor.summonedBySpellId = spell.id;
  actor.summonDurationRounds = durationRounds;
  if (durationSeconds > 0) actor.summonExpiresAtDungeonTimeSeconds = dungeonElapsedSeconds({ sync: false }) + durationSeconds;
  const playerControlled = summon.control === "player";
  actor.renameable = summon.allowIdentity ? true : false;
  actor.companionControl = playerControlled ? "player" : "ai";
  actor.team = "heroes";
  actor.friendly = true;
  actor.partyMemberKind = playerControlled ? "companion" : "ally";
  actor.followHeroId = caster.id;
  actor.followDistanceSquares = profile.followDistanceSquares ?? summon.followDistanceSquares ?? 2;
  actor.behavior = profile.behavior ?? summon.behavior ?? "melee";
  actor.className = summon.className ?? profile.className ?? "Summoned Ally";
  refreshDerivedStats(actor);
  actor.hp = actor.maxHp;
  return actor;
}

function summonChoiceLabel(monsterId) {
  const monster = getMonsterTemplate(monsterId);
  return cleanSummonChoiceLabel(monster?.name ?? monsterId);
}

function cleanSummonChoiceLabel(name) {
  return String(name ?? "")
    .replace(/^(Familiar|Pact Familiar|Summoned|Ranger)\s+/i, "")
    .trim();
}

function summonMemoryFor(caster, key) {
  return key ? caster?.summonedCompanionMemory?.[key] ?? null : null;
}

function rememberSummonedCompanion(caster, key, options) {
  if (!caster || !key || !options?.monsterId) return;
  caster.summonedCompanionMemory = { ...(caster.summonedCompanionMemory ?? {}) };
  caster.summonedCompanionMemory[key] = {
    monsterId: options.monsterId,
    name: options.name,
    tokenArt: options.tokenArt ?? "",
  };
}

function removePreviousSummonedCompanion(caster, key) {
  if (!caster?.id || !key) return;
  const removeIds = Object.values(state.fighters ?? {})
    .filter((fighter) => fighter.summonedByHeroId === caster.id && fighter.summonMemoryKey === key)
    .map((fighter) => fighter.id);
  for (const id of removeIds) delete state.fighters[id];
  if (!removeIds.length) return;
  state.party.heroIds = (state.party.heroIds ?? []).filter((id) => !removeIds.includes(id));
  state.party.rosterIds = (state.party.rosterIds ?? []).filter((id) => !removeIds.includes(id));
  state.initiative = (state.initiative ?? []).filter((entry) => !removeIds.includes(entry.fighterId));
}

async function chooseSummonedCompanionOptions(caster, spell, summon = {}, profile = {}) {
  const memoryKey = summon.memoryKey ?? spell.id;
  const saved = summonMemoryFor(caster, memoryKey);
  if (saved?.monsterId && typeof showChoiceDialog === "function") {
    const mode = await showChoiceDialog({
      actor: caster,
      title: spell.name,
      message: `${caster.name} remembers ${saved.name ?? summonChoiceLabel(saved.monsterId)}. Resummon that companion or choose a new form?`,
      choices: [
        { value: "resummon", label: `Resummon ${saved.name ?? summonChoiceLabel(saved.monsterId)}` },
        { value: "new", label: "Choose New Form" },
      ],
    });
    if (!mode) return null;
    if (mode === "resummon") return { ...saved, memoryKey };
  }
  const choices = summon.chooseFrom ?? [];
  let monsterId = summon.monsterId ?? profile.monsterId;
  let identity = null;
  let template = null;
  let defaultName = summon.name ?? profile.name ?? spell.name;
  while (!identity) {
    if (choices.length > 1 && typeof showChoiceDialog === "function") {
      const picked = await showChoiceDialog({
        actor: caster,
        title: spell.name,
        message: "Choose the companion form to summon.",
        choices: choices.map((id) => ({ value: id, label: summonChoiceLabel(id) })),
      });
      if (!picked) return null;
      monsterId = picked;
    } else if (choices.length === 1) {
      monsterId = choices[0];
    }
    template = getMonsterTemplate(monsterId);
    const formName = summonChoiceLabel(monsterId);
    defaultName = summon.name && summon.name !== profile.name ? summon.name : formName || template?.name || profile.name || spell.name;
    identity = { name: defaultName, tokenArt: template?.tokenArt ?? "" };
    if (summon.allowIdentity && typeof showHeroIdentityDialog === "function") {
      const pickedIdentity = await showHeroIdentityDialog({
        title: spell.name,
        message: `Name your ${formName || "companion"} and choose its token picture.`,
        nameValue: defaultName,
        tokenArt: template?.tokenArt ?? "",
        confirmText: "Summon",
        backText: choices.length > 1 ? "Back" : "",
        cancelText: "Cancel",
      });
      if (pickedIdentity === dialogBackValue) {
        identity = null;
        continue;
      }
      if (!pickedIdentity) return null;
      identity = pickedIdentity;
    }
  }
  const chosen = { monsterId, name: identity.name || defaultName, tokenArt: identity.tokenArt ?? template?.tokenArt ?? "", memoryKey };
  rememberSummonedCompanion(caster, memoryKey, chosen);
  return chosen;
}

function createSimulacrumActor(caster, spell, position, summon = {}) {
  const copy = createCombatant({
    ...cloneData(caster),
    id: `${spell.id}-${caster.id}-${Date.now()}-simulacrum`,
    name: summon.name ?? `${caster.name}'s Simulacrum`,
    position,
    hp: undefined,
    maxHp: Math.max(1, Math.floor((caster.maxHp ?? 1) / 2)),
    baseMaxHp: Math.max(1, Math.floor((caster.maxHp ?? 1) / 2)),
    partyMemberKind: "ally",
    companionControl: "ai",
    team: "heroes",
    friendly: true,
    inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: [] },
    equipment: {},
  });
  copy.spells = [...(caster.spells ?? [])];
  copy.spellPointMax = Math.max(1, Math.floor(spellPointMaximum(caster) / 3));
  copy.spellPoints = copy.spellPointMax;
  return scaleSummonedSpellActor(copy, caster, spell, summon, { behavior: "rangedKiter", hpMultiplier: 1, followDistanceSquares: 2 });
}

function addSummonedSpellActorToCombat(caster, actor) {
  state.fighters[actor.id] = actor;
  state.party.heroIds = uniqueValues([...(state.party.heroIds ?? []), actor.id]);
  state.party.rosterIds = uniqueValues([...(state.party.rosterIds ?? []), actor.id]);
  if (state.mode === "combat") {
    const activeIndex = Math.max(0, state.activeIndex ?? 0);
    state.initiative.splice(activeIndex + 1, 0, { fighterId: actor.id, initiative: state.initiative[activeIndex]?.initiative ?? 10 });
  }
}

async function castSummonSpell(caster, spell, originTarget = caster, options = {}) {
  let resourcesSpent = false;
  const spendForSummon = () => {
    if (!options.spendResources || resourcesSpent) return;
    spendSpellResources(caster, spell);
    resourcesSpent = true;
  };
  const summon = spell.effect?.summon ?? {};
  const extraCount = Math.max(0, spellCastLevel(spell) - spellBaseLevel(spell)) * (spell.upcast?.targetsPerLevel ?? 0);
  const count = Math.max(1, (summon.count ?? 1) + extraCount);
  const origin = originTarget?.position ?? originTarget ?? caster.position;
  const positions = summonOpenPositionsAround(caster, origin, count);
  if (!positions.length) {
    spendForSummon();
    applyStatusEffect(caster, { id: `${spell.id}-summon-fallback`, label: spell.name, tempHp: 6 + proficiencyBonus(caster), durationRounds: 3 });
    addLog(`${spell.name} cannot find space for a summon, so the magic reinforces ${caster.name}.`, "important");
    return [];
  }
  const profileId = summon.profile ?? "beast";
  const profile = summonActorProfiles()[profileId] ?? summonActorProfiles().beast;
  const companionOptions = summon.control === "player" ? await chooseSummonedCompanionOptions(caster, spell, summon, profile) : null;
  if (summon.control === "player" && !companionOptions) {
    addLog(`${spell.name} was not completed.`, "important");
    return null;
  }
  spendForSummon();
  if (companionOptions?.memoryKey) removePreviousSummonedCompanion(caster, companionOptions.memoryKey);
  const actors = [];
  for (let index = 0; index < Math.min(count, positions.length); index += 1) {
    let actor = null;
    if (profileId === "simulacrum") {
      actor = createSimulacrumActor(caster, spell, positions[index], summon);
    } else {
      actor = createFriendlyBeastFromMonster(companionOptions?.monsterId ?? summon.monsterId ?? profile.monsterId, {
        id: `${spell.id}-${caster.id}-${Date.now()}-${index + 1}`,
        name: count > 1 ? `${summon.name ?? profile.name} ${index + 1}` : companionOptions?.name ?? summon.name ?? profile.name ?? spell.name,
        position: positions[index],
        tokenArt: companionOptions?.tokenArt,
        kind: summon.control === "player" ? "companion" : "ally",
        control: summon.control === "player" ? "player" : "ai",
        followHeroId: caster.id,
        followDistanceSquares: profile.followDistanceSquares ?? 2,
        className: summon.className ?? profile.className,
      });
      if (actor) scaleSummonedSpellActor(actor, caster, spell, summon, profile);
    }
    if (!actor) continue;
    if (companionOptions?.memoryKey) actor.summonMemoryKey = companionOptions.memoryKey;
    addSummonedSpellActorToCombat(caster, actor);
    actors.push(actor);
  }
  if (!actors.length) {
    spendForSummon();
    applyStatusEffect(caster, { id: `${spell.id}-summon-fallback`, label: spell.name, tempHp: 6 + proficiencyBonus(caster), durationRounds: 3 });
    addLog(`${spell.name} cannot shape a summon yet, so the magic reinforces ${caster.name}.`, "important");
    return [];
  }
  addLog(`${caster.name}'s ${spell.name} summons ${actors.map((actor) => actor.name).join(", ")}.`, "important");
  return actors;
}

async function applySpellAttack(caster, target, spell) {
  const lightContext = attackLightContext(caster, target);
  const rollResult = rollD20ForFighter(caster, { disadvantage: lightContext.disadvantage });
  const criticalResult = applyMeleeAutoCritical(resolveMonsterHeroCritical(caster, target, rollResult.roll), caster, target, hasMeleeAccess(caster, target));
  const roll = criticalResult.attackRoll;
  const bonus = spellAttackBonus(caster, spell);
  const total = roll + bonus;
  const targetAc = armorClass(target);
  addLog(`${caster.name} casts ${spell.name}${attackLightDisadvantageText(lightContext)}: spell attack ${roll} ${abilityLabel(bonus)} = ${total} vs AC ${targetAc}.${criticalResult.note ? ` ${criticalResult.note}` : ""}`, "important");
  addAdminLog(`${caster.name} spell attack breakdown vs ${target.name}: ${d20RollDetail(rollResult)}${criticalResult.attackRoll !== rollResult.roll ? ` -> ${d20ModeLabels.karmic} d20 ${roll}` : ""} + spell attack ${abilityLabel(bonus)} = ${total}; target AC ${targetAc}${criticalResult.note ? `; ${criticalResult.note}` : ""}${lightContext.note ? `; ${lightContext.note}` : ""}.`);
  recordD20OutcomeForFighter(caster, roll !== 1 && (criticalResult.forcedHit || total >= targetAc));
  if (roll === 1 || (!criticalResult.forcedHit && total < targetAc)) {
    addLog(`${spell.name} misses ${target.name}.`);
    return;
  }
  const dice = scaledSpellDice(spell);
  const damageRoll = rollDice(dice.count * (criticalResult.doublesDamage ? 2 : 1), dice.sides);
  const extra = spell.effect?.abilityBonus === "spellcasting" ? abilityMod(caster, spell?.attackAbility ?? spell?.saveDcAbility ?? spellcastingAbility(caster)) : 0;
  const rawDamage = Math.max(1, damageRoll.total + (dice.bonus ?? 0) + extra + (spell.metamagic?.damageBonus ?? 0));
  addAdminLog(`${caster.name}'s ${spell.name} hit damage roll: ${damageRoll.rolls.join(" + ")}${dice.bonus ? ` ${abilityLabel(dice.bonus)}` : ""}${extra ? ` + spell ability ${extra}` : ""} = ${rawDamage} ${spell.effect?.type ?? "force"}.`);
  let totalDamage = rawDamage;
  if (caster.classId === "cleric" && (caster.level ?? 1) >= 8 && spellBaseLevel(spell) === 0 && !caster.blessedStrikeUsedThisTurn) {
    const blessed = rollDice(1, 8);
    totalDamage += blessed.total;
    caster.blessedStrikeUsedThisTurn = true;
    addLog(`${caster.name}'s Blessed Strike adds ${blessed.total} radiant force.`, "important");
  }
  applySpecialDamage(caster, target, totalDamage, spell.effect?.type ?? "force", spell.name);
  if (spell.effect?.status) await applySpellStatus(caster, target, spell);
  else applySpellForcedMovement(caster, target, spell, null, { origin: caster.position });
}

function eldritchBlastBeamCount(caster) {
  const level = caster?.level ?? 1;
  return level >= 17 ? 4 : level >= 11 ? 3 : level >= 5 ? 2 : 1;
}

function warlockKnowsInvocation(caster, id) {
  return caster?.classId === "warlock" && (caster.knownInvocations ?? []).includes(id);
}

function warlockHasPact(caster, pactId) {
  return caster?.classId === "warlock" && caster?.pactBoon === pactId;
}

function targetIsInMagicalDarkness(target) {
  return (target?.statusEffects ?? []).some((effect) => effect.id === "darkness" || effect.label === "Darkness");
}

function targetIsCursedOrObscured(target) {
  return (target?.statusEffects ?? []).some((effect) => ["hex", "frightened", "darkness", "marked"].includes(effect.id) || ["Hexed", "Frightened", "Darkness", "Marked"].includes(effect.label));
}

function eldritchBlastRangeFeet(caster) {
  return warlockKnowsInvocation(caster, "eldritchSpear") ? 300 : 120;
}

function pullTargetToward(source, target) {
  const dx = Math.sign(source.position.x - target.position.x);
  const dy = Math.sign(source.position.y - target.position.y);
  const destination = { x: target.position.x + dx, y: target.position.y + dy };
  if (!window.DungeonGrid.isInsideGrid(destination, currentGridSize())) return false;
  if (!canFighterOccupyPosition(target, destination, movementWalkableFor(target))) return false;
  if (!canTraverseFootprintMovementEdge(target, target.position, destination, [])) return false;
  target.position = destination;
  return true;
}

function maybeApplyEldritchBlastInvocations(caster, target) {
  if (!target?.alive) return;
  if (warlockKnowsInvocation(caster, "repellingBlast") && pushTargetAway(caster, target)) {
    addLog(`${caster.name}'s Repelling Blast pushes ${target.name} away.`, "important");
  } else if (warlockKnowsInvocation(caster, "graspOfHadar") && pullTargetToward(caster, target)) {
    addLog(`${caster.name}'s Grasp of Hadar pulls ${target.name} closer.`, "important");
  }
  if (warlockKnowsInvocation(caster, "voidLance") && target.alive) {
    applyStatusEffect(target, { id: `void-lance-${caster.id}`, label: "Void Lance", speedBonusFeet: -10, expiresAtEndOfTurn: true });
    addLog(`${caster.name}'s Void Lance slows ${target.name}.`, "important");
  }
}

async function resolveEldritchBlastBeam(caster, target, beamIndex, beamCount) {
  if (!target?.alive || !hostileTo(caster, target) || !isInAttackRangeWithProfile(caster, target, { range: { kind: "ranged", feet: eldritchBlastRangeFeet(caster) } })) {
    addLog("Choose a visible enemy in range for Eldritch Blast.", "important");
    render();
    return false;
  }
  const devilSightAdvantage = warlockKnowsInvocation(caster, "devilsSight") && targetIsInMagicalDarkness(target);
  const witchSightAdvantage = warlockKnowsInvocation(caster, "witchSight") && targetIsCursedOrObscured(target);
  const lightContext = attackLightContext(caster, target);
  const sightAdvantage = devilSightAdvantage || witchSightAdvantage;
  const rollResult = rollD20ForFighter(caster, { advantage: sightAdvantage && !lightContext.disadvantage, disadvantage: lightContext.disadvantage && !sightAdvantage });
  const criticalResult = applyMeleeAutoCritical(resolveMonsterHeroCritical(caster, target, rollResult.roll), caster, target, hasMeleeAccess(caster, target));
  const roll = criticalResult.attackRoll;
  const bonus = spellAttackBonus(caster);
  const total = roll + bonus;
  const targetAc = armorClass(target);
  addLog(`${caster.name}'s Eldritch Blast beam ${beamIndex}/${beamCount}${devilSightAdvantage ? " with Devil's Sight" : witchSightAdvantage ? " with Witch Sight" : ""}${lightContext.disadvantage && !sightAdvantage ? attackLightDisadvantageText(lightContext) : ""}: spell attack ${roll} ${abilityLabel(bonus)} = ${total} vs AC ${targetAc}.${criticalResult.note ? ` ${criticalResult.note}` : ""}`, "important");
  addAdminLog(`${caster.name} Eldritch Blast beam ${beamIndex}/${beamCount} breakdown: ${d20RollDetail(rollResult)}${criticalResult.attackRoll !== rollResult.roll ? ` -> ${d20ModeLabels.karmic} d20 ${roll}` : ""} + spell attack ${abilityLabel(bonus)} = ${total}; target AC ${targetAc}${criticalResult.note ? `; ${criticalResult.note}` : ""}${lightContext.note ? `; ${lightContext.note}` : ""}.`);
  recordD20OutcomeForFighter(caster, roll !== 1 && (criticalResult.forcedHit || total >= targetAc));
  if (roll === 1 || (!criticalResult.forcedHit && total < targetAc)) {
    addLog(`Eldritch Blast misses ${target.name}.`);
    return true;
  }
  const damageRoll = rollDice(criticalResult.doublesDamage ? 2 : 1, 10);
  const agonizingBonus = warlockKnowsInvocation(caster, "agonizingBlast") ? Math.max(0, abilityMod(caster, "cha")) : 0;
  const hexingBonus = warlockKnowsInvocation(caster, "hexingBlast") && (target.statusEffects ?? []).some((effect) => effect.id === "hex") ? rollDie(6) : 0;
  const damage = Math.max(1, damageRoll.total + agonizingBonus + hexingBonus);
  addAdminLog(`${caster.name}'s Eldritch Blast damage roll: ${damageRoll.rolls.join(" + ")}${agonizingBonus ? ` + Agonizing Blast ${agonizingBonus}` : ""}${hexingBonus ? ` + Hexing Blast ${hexingBonus}` : ""} = ${damage} force.`);
  applySpecialDamage(caster, target, damage, "force", "Eldritch Blast");
  if (criticalResult.isCritical && warlockKnowsInvocation(caster, "eldritchDoom") && target.alive) {
    applyStatusEffect(target, { id: `eldritch-doom-${caster.id}`, label: "Eldritch Doom", speedLocked: true, actionLocked: true, durationRounds: 1 });
    addLog(`${caster.name}'s Eldritch Doom stuns ${target.name}.`, "important");
  }
  maybeApplyEldritchBlastInvocations(caster, target);
  if (!target.alive) {
    if (warlockKnowsInvocation(caster, "soulLeech")) {
      const tempHp = Math.max(3, abilityMod(caster, "cha") + proficiencyBonus(caster));
      applyStatusEffect(caster, { id: "soul-leech", label: "Soul Leech", tempHp, durationRounds: 10 });
      addLog(`${caster.name}'s Soul Leech grants ${tempHp} temporary HP.`, "important");
    }
    triggerMonsterDeathStory(target);
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
  addLog(`${caster.name} casts Eldritch Blast (${eldritchBlastRangeFeet(caster)} ft). Click target ${beamCount > 1 ? `1 of ${beamCount}` : ""}.`, "important");
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
    const save = await rollSavingThrow(target, spell.save.ability, spellSaveDc(caster, spell), `${caster.name}'s ${spell.name} forces ${target.name} to make a ${spell.save.ability.toUpperCase()} save.`);
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
  if (spellDismissibleStatusId(spell)) {
    effect.dismissible = true;
    effect.sourceId = caster.id;
    effect.sourceSpellId = spell.id;
  }
  if (spell.duration?.rounds && !effect.durationRounds && !effect.expiresAtEndOfTurn && !effect.expiresAtStartOfTurn) effect.durationRounds = spell.duration.rounds;
  if (spell.duration?.minutes && !effect.durationMinutes && !effect.expiresAtEndOfTurn && !effect.expiresAtStartOfTurn) effect.durationMinutes = spell.duration.minutes;
  if (spell.duration?.hours && !effect.durationHours && !effect.expiresAtEndOfTurn && !effect.expiresAtStartOfTurn) effect.durationHours = spell.duration.hours;
  if (spell.duration?.seconds && !effect.durationSeconds && !effect.expiresAtEndOfTurn && !effect.expiresAtStartOfTurn) effect.durationSeconds = spell.duration.seconds;
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
  if (typeof normalizeConditionEffect === "function") effect = normalizeConditionEffect(effect);
  if (effect.id === "spare-the-dying" && isPartyHeroId(target.id) && target.hp <= 0) {
    markFighterStableAtZero(target);
    addLog(`${target.name} is stabilized by ${spell.name}.`, "important");
    await maybeFinishEncounterAfterHeroRecovery();
  }
  if ((target.id?.startsWith("boss-") || target.tags?.includes("boss")) && effect.actionLocked) {
    effect.actionLocked = false;
    effect.speedLocked = false;
    effect.meleeAutoCritical = false;
    effect.incomingAttackAdvantage = false;
    effect.speedBonusFeet = Math.min(effect.speedBonusFeet ?? 0, -10);
    effect.attackBonus = Math.min(effect.attackBonus ?? 0, -2);
    effect.label = `${effect.label} Resisted`;
    effect.conditionDescription = "Powerful foe resists the full condition: actions are not locked, but speed and attacks are hindered.";
  }
  applySpellForcedMovement(caster, target, spell, null, { origin: caster.position });
  applyStatusEffect(target, effect);
  addLog(`${caster.name}'s ${spell.name} applies ${effect.label} to ${target.name}.`, "important");
}

async function castSpellAtTarget(caster, spell, target) {
  if (!canCastSpell(caster, spell) || !target) return;
  spell = { ...spell, casterLevel: caster.level ?? 1 };
  if (spell.effect?.kind === "summon") {
    await castSummonSpell(caster, spell, target, { spendResources: true });
    refreshDerivedStats(caster);
    hideAbilitiesMenu();
    render();
    return;
  }
  spendSpellResources(caster, spell);
  if (spell.effect?.kind === "healing") {
    applySpellHealing(caster, target, spell);
  } else if (spell.effect?.kind === "restoration") {
    applySpellRestoration(caster, target, spell);
  } else if (spell.effect?.kind === "status") {
    await applySpellStatus(caster, target, spell);
  } else if (spell.effect?.kind === "attackDamage") {
    const wasAlive = target.alive;
    await applySpellAttack(caster, target, spell);
    if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
      triggerMonsterDeathStory(target);
      if (isPartyHeroId(caster.id)) playSoundEffect("enemyDefeated");
      awardMonsterXp(target);
      dropLootForMonster(target);
      await finishEncounterAfterLastMonsterFalls();
    }
  } else if (spell.effect?.kind === "damage") {
    const targets = spell.area ? areaTargetsForSpell(target, spell, caster) : [target];
    const spellOrigin = { ...target.position };
    addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP${spell.area ? ` at ${target.name}` : ""}.`, "important");
    for (const entry of targets) {
      const wasAlive = entry.alive;
      await applySpellDamage(caster, entry, spell, { origin: spellOrigin });
      if (!entry.alive && isPartyHeroId(entry.id)) handleHeroDeath();
      if (wasAlive && !entry.alive && !isPartyHeroId(entry.id)) {
        triggerMonsterDeathStory(entry);
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
  if (spell.effect?.kind === "summon") {
    const target = targets[0];
    await castSummonSpell(caster, spell, target, { spendResources: true });
    refreshDerivedStats(caster);
    hideAbilitiesMenu();
    render();
    return;
  }
  spendSpellResources(caster, spell);
  addLog(`${caster.name} casts ${spell.name} on ${targets.map((target) => target.name).join(", ")}.`, "important");
  for (const target of targets) {
    if (spell.effect?.kind === "healing") {
      applySpellHealing(caster, target, spell);
    } else if (spell.effect?.kind === "restoration") {
      applySpellRestoration(caster, target, spell);
    } else if (spell.effect?.kind === "status") {
      await applySpellStatus(caster, target, spell);
    } else if (spell.effect?.kind === "damage") {
      const wasAlive = target.alive;
      await applySpellDamage(caster, target, spell, { origin: caster.position });
      if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
        triggerMonsterDeathStory(target);
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
    if (!canFighterOccupyPosition(caster, position, currentWalkable(caster))) {
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
  if (spell.effect?.kind === "summon") {
    await castSummonSpell(caster, spell, position, { spendResources: true });
    refreshDerivedStats(caster);
    hideAbilitiesMenu();
    render();
    return;
  }
  spendSpellResources(caster, spell);
  createPersistentSpellArea(caster, spell, position, { origin: position, orientation: spellAreaOrientation(caster, position) });
  if (spell.effect?.dispelsMagicalDarkness || spell.lightSource?.dispelsMagicalDarkness) {
    const removed = removeMagicalDarknessInCells(spellAreaCells(position, spell), spell.effect?.dispelMaxSpellLevel ?? spell.lightSource?.dispelMaxSpellLevel ?? 3);
    if (removed) addLog(`${spell.name} burns away ${removed} magical darkness ${removed === 1 ? "area" : "areas"}.`, "important");
  }
  const targets = spell.area ? areaTargetsForSpell(position, spell, caster) : spellTargetsFromCells([position]);
  addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP at (${position.x + 1}, ${position.y + 1}).`, "important");
  for (const target of targets) {
    const wasAlive = target.alive;
    if (spell.effect?.kind === "damage") await applySpellDamage(caster, target, spell, { origin: position });
    else if (spell.effect?.kind === "status") await applySpellStatus(caster, target, spell);
    if (!target.alive && isPartyHeroId(target.id)) handleHeroDeath();
    if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
      triggerMonsterDeathStory(target);
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
  if (spell.effect?.kind === "summon") {
    await castSummonSpell(caster, spell, caster, { spendResources: true });
    hideAbilitiesMenu();
    render();
    return;
  }
  spendSpellResources(caster, spell);
  const targets = breathTemplateTargets(caster, direction, spell);
  createPersistentSpellArea(caster, spell, caster.position, { origin: caster.position, direction });
  addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP ${direction}.`, "important");
  for (const target of targets) {
    const wasAlive = target.alive;
    if (spell.effect?.kind === "damage") await applySpellDamage(caster, target, spell, { direction, origin: caster.position });
    else if (spell.effect?.kind === "status") await applySpellStatus(caster, target, spell);
    if (wasAlive && !target.alive && !isPartyHeroId(target.id)) {
      triggerMonsterDeathStory(target);
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
  let spell = baseSpell ? spellWithCastLevel(baseSpell, castLevel ?? spellBaseLevel(baseSpell)) : null;
  spell = await chooseMetamagicForSpell(caster, spell);
  if (!spell || !canCastSpell(caster, spell)) return;
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

function monsterDiseaseCarriers(monster) {
  const text = [
    monster?.id,
    monster?.name,
    monster?.type,
    ...(monster?.tags ?? []),
    ...(monsterSpecialNames(monster) ?? []),
  ]
    .join(" ")
    .toLowerCase();
  const carriers = [];
  if (/\b(sewer|filth|plague|mange|rat|vermin|carrion|ghoul|zombie|rot|rotting|diseased)\b/.test(text)) carriers.push({ id: "sewer-plague", chance: 0.28 });
  if (/\b(fungus|fungal|spore|mold|eye|sight)\b/.test(text)) carriers.push({ id: "sight-rot", chance: 0.22 });
  if (/\b(cackle|laugh|hyena|madness|gibber)\b/.test(text)) carriers.push({ id: "cackle-fever", chance: 0.2 });
  if (/contagion|mindrot/.test(text)) carriers.push({ id: "mindfire", chance: 0.18 });
  return carriers.filter((entry, index, list) => list.findIndex((candidate) => candidate.id === entry.id) === index);
}

async function maybeApplyMonsterDiseaseOnHit(monster, target) {
  if (!target?.alive || !isPartyHeroId(target.id)) return false;
  const carriers = [...(monster?.diseases ?? []), ...monsterDiseaseCarriers(monster)];
  if (!carriers.length) return false;
  for (const carrier of carriers) {
    const diseaseId = typeof carrier === "string" ? carrier : carrier.id;
    if (!diseaseId || Math.random() > (carrier.chance ?? 0.25)) continue;
    return applyDiseaseExposure(monster, target, diseaseId, { saveDc: carrier.saveDc });
  }
  return false;
}

function pushTargetAway(source, target) {
  return applyForcedMovement(source, target, { mode: "push", distanceFeet: 5, label: "shove" });
}

function pullTargetToward(source, target) {
  return applyForcedMovement(source, target, { mode: "pull", distanceFeet: 5, label: "pull" });
}

async function applyMonsterOnHitSpecials(monster, target, baseDamage, critical) {
  if (!target.alive) return;
  await maybeApplyMonsterDiseaseOnHit(monster, target);
  const names = monsterSpecialNames(monster);
  if (!names.length || !shouldUseMonsterSpecial("onHit")) return;
  const normalized = names.join(" | ");
  const dc = monsterSpecialDc(monster);
  const matchingSpecialName = (pattern, fallback) => monsterSpecialNameMatching(monster, pattern) ?? fallback;

  if (/venom|poison|sickening|claw fever|deep venom|infernal sting|rotting tendrils|wyrmwood sap/i.test(normalized)) {
    const label = matchingSpecialName(/venom|poison|sickening|claw fever|deep venom|infernal sting|rotting tendrils|wyrmwood sap/i, "venom");
    const save = await rollSavingThrow(target, "con", dc, `${monster.name}'s ${label} forces ${target.name} to make a CON save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, /infernal sting/i.test(label) ? 4 : critical ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "poison", label);
      if (/sickening|claw fever/i.test(label)) {
        applyStatusEffect(target, { id: "sickened", label: "Sickened", attackBonus: -1, expiresAtEndOfTurn: true });
      }
      if (/wyrmwood sap/i.test(label)) {
        applyStatusEffect(target, { id: "sap-sickened", label: "Sap-Sickened", attackBonus: -1, expiresAtEndOfTurn: true });
      }
    }
  }

  if (/dread whisper|condemning mark|bone debt|marrow verdict/i.test(normalized)) {
    const label = matchingSpecialName(/dread whisper|condemning mark|bone debt|marrow verdict/i, "dread presence");
    const save = await rollSavingThrow(target, "wis", dc, `${monster.name}'s ${label} forces ${target.name} to make a WIS save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: `dread-${monster.id}`, label: /condemning mark/i.test(label) ? "Condemned" : "Shaken", attackBonus: -1, expiresAtEndOfTurn: true });
      addLog(`${target.name}'s attacks are shaken until the end of their next turn.`, "important");
    }
  }

  if (/dust bite|dust cough|smoke|smoke veil|sandblind ambush/i.test(normalized)) {
    const label = matchingSpecialName(/dust bite|dust cough|smoke|smoke veil|sandblind ambush/i, "choking dust");
    const save = await rollSavingThrow(target, "con", dc, `${monster.name}'s ${label} forces ${target.name} to make a CON save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: "smoke-choked", label: "Smoke-Choked", attackBonus: -1, expiresAtEndOfTurn: true });
      addLog(`${target.name} coughs through grit and smoke until the end of their next turn.`, "important");
    }
  }

  if (/kindle|heated spear|melt armor|lava wake|ignite ground|white-hot beam|magma breath|boiling spray|scalding puff|burning guard|cinder crown/i.test(normalized)) {
    const label = matchingSpecialName(/kindle|heated spear|melt armor|lava wake|ignite ground|white-hot beam|magma breath|boiling spray|scalding puff|burning guard|cinder crown/i, "burning strike");
    const save = await rollSavingThrow(target, "dex", dc, `${monster.name}'s ${label} forces ${target.name} to make a DEX save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, critical ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "fire", label);
      if (/melt armor|white-hot beam/i.test(label)) applyStatusEffect(target, { id: "melted-armor", label: "Armor Melted", acBonus: -1, expiresAtEndOfTurn: true });
    }
  }

  if (/ash cough|choking grasp|suffocating rain|dead sky|airless bite|drying wind|silence of no air|thin air aura|mist choke|drowning mist/i.test(normalized)) {
    const label = matchingSpecialName(/ash cough|choking grasp|suffocating rain|dead sky|airless bite|drying wind|silence of no air|thin air aura|mist choke|drowning mist/i, "choking element");
    const save = await rollSavingThrow(target, "con", dc, `${monster.name}'s ${label} forces ${target.name} to make a CON save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: "element-choked", label: "Choked", attackBonus: -1, speedBonusFeet: -5, expiresAtEndOfTurn: true });
      addLog(`${target.name} struggles for air until the end of their next turn.`, "important");
    }
  }

  if (/glass splinters|glasswind cut|razor pass|needle draft|needle spray|bleeding edge|shard pin|shatter spines|hailglass volley|aurora slash|prismatic lance|salt lash/i.test(normalized)) {
    const label = matchingSpecialName(/glass splinters|glasswind cut|razor pass|needle draft|needle spray|bleeding edge|shard pin|shatter spines|hailglass volley|aurora slash|prismatic lance|salt lash/i, "cutting element");
    const save = await rollSavingThrow(target, "dex", dc, `${monster.name}'s ${label} forces ${target.name} to make a DEX save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, critical ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "slashing", label);
      if (/shard pin|hailglass volley|needle/i.test(label)) applyStatusEffect(target, { id: "pinned-shards", label: "Shard-Pinned", speedBonusFeet: -10, expiresAtEndOfTurn: true });
    }
  }

  if (/static bite|lightning lash|crackling pulse|queenly thunderbolt|stormlord descent|rod draw|lesser stormcall|thunderclap|choir blast/i.test(normalized)) {
    const label = matchingSpecialName(/static bite|lightning lash|crackling pulse|queenly thunderbolt|stormlord descent|rod draw|lesser stormcall|thunderclap|choir blast/i, "storm effect");
    const save = await rollSavingThrow(target, "dex", dc, `${monster.name}'s ${label} forces ${target.name} to make a DEX save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, critical ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), /thunder|choir/i.test(label) ? "thunder" : "lightning", label);
      target.hasReaction = false;
    }
  }

  if (/life drain|greater life drain|abyssal drain|astral reap|devour soul|unending appetite/i.test(normalized)) {
    const label = matchingSpecialName(/life drain|greater life drain|abyssal drain|astral reap|devour soul|unending appetite/i, "life drain");
    const save = await rollSavingThrow(target, "con", dc, `${monster.name}'s ${label} forces ${target.name} to make a CON save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, /greater|abyssal|astral|devour soul|unending appetite/i.test(label) ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      const dealt = applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "necrotic", label);
      applyStatusEffect(target, { id: "drained", label: "Drained", speedBonusFeet: -5, expiresAtEndOfTurn: true });
      if (/abyssal drain|devour soul|unending appetite/i.test(label) && dealt > 0) {
        const healed = applyHealingToHero(monster, /devour soul|unending appetite/i.test(label) ? Math.ceil(dealt / 2) : dealt);
        if (healed > 0) addLog(`${monster.name} steals ${healed} HP from the draining wound.`, "heal");
      }
    }
  }

  if (/hellspines|stygian brand|hellbow pin|bone cage/i.test(normalized)) {
    const label = matchingSpecialName(/hellspines|stygian brand|hellbow pin|bone cage/i, "pinning strike");
    const ability = /hellbow pin/i.test(label) ? "str" : "dex";
    const save = await rollSavingThrow(target, ability, dc, `${monster.name}'s ${label} forces ${target.name} to make a ${ability.toUpperCase()} save.`);
    if (!save.success) {
      const speedPenalty = /stygian brand/i.test(label) ? -10 : -5;
      applyStatusEffect(target, { id: "pinned", label: "Pinned", speedBonusFeet: speedPenalty, speedLocked: /hellbow pin/i.test(label), expiresAtEndOfTurn: true });
      addLog(`${target.name}'s movement is hindered until the end of their next turn.`, "important");
    }
  }

  if (/ruin scratch|mind-pounce|mindrot sermon/i.test(normalized)) {
    const label = matchingSpecialName(/ruin scratch|mind-pounce|mindrot sermon/i, "ruinous strike");
    const save = await rollSavingThrow(target, "wis", dc, `${monster.name}'s ${label} forces ${target.name} to make a WIS save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: "ruined-reactions", label: "Ruined", attackBonus: -1, expiresAtEndOfTurn: true });
      target.hasReaction = false;
      addLog(`${target.name}'s reaction is torn away until their next turn.`, "important");
    }
  }

  if (/needling malice|ruin hymn|mindrot cloud|corruptive sporulation/i.test(normalized)) {
    const label = matchingSpecialName(/needling malice|ruin hymn|mindrot cloud|corruptive sporulation/i, "malice");
    const save = await rollSavingThrow(target, "wis", dc, `${monster.name}'s ${label} forces ${target.name} to make a WIS save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: "maliced", label: "Maliced", saveBonus: -1, expiresAtEndOfTurn: true });
      addLog(`${target.name}'s next saves are weakened until the end of their next turn.`, "important");
    }
  }

  if (/blood scent|blood in the water|salt the wound|bite and tear|feeding frenzy|flesh verdict|engulfing mass|acid maw|thousand maws|devouring bloom/i.test(normalized) && (target.hp ?? 0) <= Math.ceil((target.maxHp ?? 1) / 2)) {
    const label = matchingSpecialName(/blood scent|blood in the water|salt the wound|bite and tear|feeding frenzy|flesh verdict|engulfing mass|acid maw|thousand maws|devouring bloom/i, "frenzy");
    const dice = specialDamageDice(monster, /flesh verdict/i.test(normalized) ? 8 : 6);
    const roll = rollDice(dice.count, dice.sides);
    const type = /flesh verdict|blood scent|devouring bloom/i.test(label) ? "necrotic" : /acid maw/i.test(label) ? "acid" : "slashing";
    const dealt = applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), type, label);
    if (/engulfing mass|devouring bloom/i.test(label) && dealt > 0) {
      const healed = applyHealingToHero(monster, Math.max(1, Math.floor(dealt / 2)));
      if (healed > 0) addLog(`${monster.name} feeds and regains ${healed} HP.`, "heal");
    }
  }

  if (/spectral chain|hooking chain|chain coil|living chains|dragging lash|hookcap pull|canopy snatch|luring scent|hook and drag|dragged into the teeth|tidal pull|pull under|baronial undertow|leviathan drag|burial pull/i.test(normalized)) {
    const label = matchingSpecialName(/spectral chain|hooking chain|chain coil|living chains|dragging lash|hookcap pull|canopy snatch|luring scent|hook and drag|dragged into the teeth|tidal pull|pull under|baronial undertow|leviathan drag|burial pull/i, "chain");
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s ${label} forces ${target.name} to make a STR save.`);
    if (!save.success) {
      pullTargetToward(monster, target);
      if (/canopy snatch|dragged into the teeth|drop the hook|bone cage/i.test(label)) applyStatusEffect(target, { id: "restrained", label: "Restrained", speedLocked: true, attackBonus: -2, expiresAtEndOfTurn: true });
    }
  }

  if (/lightning whip/i.test(normalized)) {
    const label = matchingSpecialName(/lightning whip/i, "lightning whip");
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s ${label} forces ${target.name} to make a STR save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, 8);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "lightning", label);
      pullTargetToward(monster, target);
    }
  }

  if (/constricting coil|stranglehold|crushing claws|forest judgment|hoist prisoner|heated coil|living chain|cinder chain judgment|mud grip|clay bind|root lock|engulfing slide|coral snare|bone cage/i.test(normalized)) {
    const label = matchingSpecialName(/constricting coil|stranglehold|crushing claws|forest judgment|hoist prisoner|heated coil|living chain|cinder chain judgment|mud grip|clay bind|root lock|engulfing slide|coral snare|bone cage/i, "crushing claws");
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s ${label} forces ${target.name} to make a STR save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: "restrained", label: "Restrained", speedLocked: true, attackBonus: -2, expiresAtEndOfTurn: true });
    }
  }

  if (/crushing dominion/i.test(normalized)) {
    const label = matchingSpecialName(/crushing dominion/i, "crushing dominion");
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s ${label} forces ${target.name} to make a STR save.`);
    if (!save.success) {
      applyProneCondition(target, "crushing-dominion");
      pushTargetAway(monster, target);
    }
  }

  if (/crippling|hamstring|web|snare|dragging grasp|drowning grip|gear nip|grinding teeth|sleep poison bolt|ice slick|cold bite|frozen undertow|glacial advance|polar night|current guard/i.test(normalized)) {
    const label = matchingSpecialName(/crippling|hamstring|web|snare|dragging grasp|drowning grip|gear nip|grinding teeth|sleep poison bolt|ice slick|cold bite|frozen undertow|glacial advance|polar night|current guard/i, "restraint");
    const ability = /web|snare/i.test(label) ? "dex" : "str";
    const save = await rollSavingThrow(target, ability, dc, `${monster.name}'s ${label} forces ${target.name} to make a ${ability.toUpperCase()} save.`);
    if (!save.success) {
      if (/hamstring|crippling|gear nip|grinding teeth|sleep poison bolt/i.test(label)) {
        applyStatusEffect(target, { id: "hamstrung", label: "Hamstrung", speedBonusFeet: -10, expiresAtEndOfTurn: true });
        addLog(`${target.name}'s speed is reduced by 10 ft until the end of their next turn.`, "important");
        if (/sleep poison bolt/i.test(label)) target.hasReaction = false;
      } else {
        applyStatusEffect(target, { id: "snared", label: "Snared", speedLocked: true, expiresAtEndOfTurn: true });
        addLog(`${target.name}'s movement is stopped until the end of their next turn.`, "important");
      }
    }
  }

  if (/charge|pounce|lunge|rush|swooping|stomp|slam|burning dive|impaling advance|world-stamp|rift charge|siege charge|falling star dive|brittle dash|falling fronds|pouncing vines|briar slam|four-season slam|minecart shove|lava step|support-beam breaker|quake fist|stone pounce|avalanche hammer|pillar fall|crater slam|faultline strike|magma fault|crushing deep|pressure crush|whitewater rush|mudslide rush|thunderhead crash|tyrant downburst|shattering charge/i.test(normalized) && (monster.lastMoveFeet ?? 0) >= monsterSpecialAbilityTuning.chargeMinFeet) {
    const label = matchingSpecialName(/charge|pounce|lunge|rush|swooping|stomp|slam|burning dive|impaling advance|world-stamp|rift charge|siege charge|falling star dive|brittle dash|falling fronds|pouncing vines|briar slam|four-season slam|minecart shove|lava step|support-beam breaker|quake fist|stone pounce|avalanche hammer|pillar fall|crater slam|faultline strike|magma fault|crushing deep|pressure crush|whitewater rush|mudslide rush|thunderhead crash|tyrant downburst|shattering charge/i, "charge");
    const dice = specialDamageDice(monster, critical ? 8 : 6);
    const roll = rollDice(dice.count, dice.sides);
    const type = /burning dive|falling star dive|lava step|magma fault/i.test(label) ? "fire" : /impaling advance/i.test(label) ? "piercing" : /rift charge/i.test(label) ? "force" : /thunderhead|downburst/i.test(label) ? "thunder" : "bludgeoning";
    applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), type, label);
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s ${label} forces ${target.name} to make a STR save.`);
    if (!save.success && pushTargetAway(monster, target)) {
      addLog(`${target.name} is shoved back by ${monster.name}.`, "important");
    }
    if (/pouncing vines/i.test(label) && !save.success) applyProneCondition(target, "pouncing-vines");
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
  return monsterTargetableHeroes(monster).filter((hero) => hero.alive && attackGridDistanceBetweenFighters(monster, hero) <= maxSquares && hasClearLineOfSightBetweenFighters(monster, hero));
}

function monsterSpecialSaveExplanation(label, damageType, saveAbility, options = {}) {
  const abilityText = String(saveAbility).toUpperCase();
  const lower = String(label).toLowerCase();
  const rider = options.onFailStatus?.label ? ` and may leave the target ${String(options.onFailStatus.label).toLowerCase()}` : "";
  if (/dust spin/.test(lower)) {
    return {
      flavor: `${label} throws grit and cutting debris around the target. ${abilityText} measures whether they duck clear before the debris hits and slows them.`,
      failure: "Failure means slashing damage lands and the dust drags at their movement, slowing them briefly.",
      success: "Success means they slip through the edge of the vortex and avoid the movement penalty.",
    };
  }
  if (/thunderclap|choir blast|tempest choir|tyrant downburst|baronial cyclone|city-eater winds|neverending storm|worldstorm|stormfall|split the heavens|breath of the plane/.test(lower)) {
    return {
      flavor: `${label} hits the area with thunder, wind, or crushing pressure. ${abilityText} measures whether the target braces before the blast damages or shoves them.`,
      failure: `Failure means ${damageType} damage hits hard${rider}, and the blast may shove them out of position.`,
      success: "Success means they stay braced and take only the reduced effect.",
    };
  }
  if (/crackling|lightning|starstorm|queenly thunderbolt/.test(lower)) {
    return {
      flavor: `${label} arcs lightning through the target's space. ${abilityText} measures whether they dodge or ground themselves before the current hits directly.`,
      failure: `Failure means ${damageType} damage courses through them${rider}.`,
      success: "Success means the worst of the current misses or only clips them.",
    };
  }
  if (/falling machinery|drop the hook|anvil drop|colossus hammerfall|cave-in groan/.test(lower)) {
    return {
      flavor: `${label} drops heavy hooks, stone, machinery, or forge-weight onto the target. ${abilityText} measures whether they dive clear before impact.`,
      failure: "Failure means bludgeoning damage lands hard and the target is knocked prone.",
      success: "Success means the target avoids the center of the falling weight.",
    };
  }
  if (/pressure release/.test(lower)) {
    return {
      flavor: `${label} vents scalding pressure in a line. ${abilityText} measures whether the target gets out of the blast before it burns or shoves them.`,
      failure: "Failure means fire damage hits directly and the blast may push the target back.",
      success: "Success means the target turns aside from the worst of the venting pressure.",
    };
  }
  if (/web snare/.test(lower)) {
    return {
      flavor: `${label} launches sticky strands at the target's feet and limbs. ${abilityText} measures whether they slip clear before the web stops them.`,
      failure: "Failure means the target is snared and cannot move briefly.",
      success: "Success means the web misses or tears loose before it can hold.",
    };
  }
  return savingThrowExplanation(`${label} forces the target to make a ${abilityText} save.`, saveAbility);
}

async function tryMonsterAreaSpecial(monster, namePattern, label, damageType, saveAbility, rangeFeet, options = {}) {
  if (!hasMonsterSpecial(monster, namePattern)) return false;
  const publicLabel = options.publicLabel ?? monsterSpecialNameMatching(monster, namePattern) ?? label;
  if (!monster.hasAction) {
    addAdminLog(`${monster.name} cannot use ${publicLabel}: action already spent.`);
    return false;
  }
  if (!shouldAttemptMonsterActiveSpecial(monster, "area")) {
    addAdminLog(`${monster.name} skips ${publicLabel}: scorer preferred ${monster.preferredSpecialActionKind ?? "chance failed"}.`);
    return false;
  }
  const targets = targetsInMonsterSpecialRange(monster, rangeFeet);
  if (!targets.length) {
    addAdminLog(`${monster.name} cannot use ${publicLabel}: no target within ${rangeFeet} ft with line of sight.`);
    return false;
  }
  const explanation = options.explanation ?? monsterSpecialSaveExplanation(publicLabel, damageType, saveAbility, options);
  addAdminLog(`${monster.name} attempts ${publicLabel}: ${targets.length} target(s) in range, resolving up to ${options.maxTargets ?? 3}.`);
  if (await maybeUseSpellInterruptReaction(monster, publicLabel)) {
    monster.hasAction = false;
    addLog(`${monster.name}'s ${publicLabel} is interrupted before it takes hold.`, "important");
    return true;
  }
  monster.hasAction = false;
  const dc = monsterSpecialDc(monster);
  const dice = specialDamageDice(monster, namePattern.test("Fireball") ? 8 : 6);
  addLog(`${monster.name} uses ${publicLabel}.`, "important");
  for (const target of targets.slice(0, options.maxTargets ?? 3)) {
    const save = await rollSavingThrow(target, saveAbility, dc, `${monster.name}'s ${publicLabel} forces ${target.name} to make a ${saveAbility.toUpperCase()} save.`, explanation);
    const roll = rollDice(dice.count, dice.sides);
    const raw = Math.max(1, roll.total + dice.bonus);
    const damage = saveAbility === "dex" ? evasionAdjustedDamage(target, save, raw) : save.success ? Math.floor(raw / 2) : raw;
    if (save.success && damage > 0) addLog(`${target.name} takes half damage from ${publicLabel}.`);
    if (damage > 0) applySpecialDamage(monster, target, damage, damageType, publicLabel);
    if (!save.success && options.onFailStatus) {
      applyStatusEffect(target, typeof options.onFailStatus === "function" ? options.onFailStatus(target, monster) : { ...options.onFailStatus });
    }
    if (!save.success && options.onFail) options.onFail(target, monster, save);
    if (!save.success && options.pullTargets) pullTargetToward(monster, target);
    if (!save.success && options.pushTargets) pushTargetAway(monster, target);
    if (!target.alive) handleHeroDeath();
  }
  return true;
}

async function tryMonsterStatusSpecial(monster, namePattern, label, saveAbility, rangeFeet, statusFactory, options = {}) {
  if (!hasMonsterSpecial(monster, namePattern)) return false;
  const publicLabel = options.publicLabel ?? monsterSpecialNameMatching(monster, namePattern) ?? label;
  if (!monster.hasAction) {
    addAdminLog(`${monster.name} cannot use ${publicLabel}: action already spent.`);
    return false;
  }
  if (!shouldAttemptMonsterActiveSpecial(monster, "control")) {
    addAdminLog(`${monster.name} skips ${publicLabel}: scorer preferred ${monster.preferredSpecialActionKind ?? "chance failed"}.`);
    return false;
  }
  const targets = targetsInMonsterSpecialRange(monster, rangeFeet);
  if (!targets.length) {
    addAdminLog(`${monster.name} cannot use ${publicLabel}: no target within ${rangeFeet} ft with line of sight.`);
    return false;
  }
  const explanation = options.explanation ?? monsterSpecialSaveExplanation(publicLabel, "status", saveAbility, options);
  addAdminLog(`${monster.name} attempts ${publicLabel}: ${targets.length} target(s) in range, resolving up to ${options.maxTargets ?? 1}.`);
  if (await maybeUseSpellInterruptReaction(monster, publicLabel)) {
    monster.hasAction = false;
    addLog(`${monster.name}'s ${publicLabel} is interrupted before it takes hold.`, "important");
    return true;
  }
  monster.hasAction = false;
  const dc = monsterSpecialDc(monster);
  addLog(`${monster.name} uses ${publicLabel}.`, "important");
  for (const target of targets.slice(0, options.maxTargets ?? 1)) {
    const save = await rollSavingThrow(target, saveAbility, dc, `${monster.name}'s ${publicLabel} forces ${target.name} to make a ${saveAbility.toUpperCase()} save.`, explanation);
    if (save.success) continue;
    applyStatusEffect(target, statusFactory(target, monster));
    if (options.pullTargets) pullTargetToward(monster, target);
  }
  return true;
}

async function maybeUseSpellInterruptReaction(monster, label) {
  const candidate = partyHeroes().find((hero) => {
    if (!heroCanAct(hero) || !hasReactionAvailable(hero)) return false;
    const ability = fighterAbilityDefinitions(hero).find((entry) => entry.subclassEffect?.kind === "interruptSpell");
    return canSpendCombatAbility(hero, ability) && fightersWithinSquares(hero, monster, 12);
  });
  if (!candidate) return false;
  const ability = fighterAbilityDefinitions(candidate).find((entry) => entry.subclassEffect?.kind === "interruptSpell");
  const useInterrupt = await showReactionPrompt({
    actor: candidate,
    title: ability.name,
    message: `${monster.name} is using ${label}. Spend your reaction to interrupt it?`,
    acceptLabel: "Interrupt",
  });
  if (!useInterrupt || !consumeReaction(candidate, ability.name) || !canSpendCombatAbility(candidate, ability)) return false;
  spendCombatAbilityUse(candidate, ability);
  const restore = ability.subclassEffect?.restoreSpellPoints ?? 0;
  if (restore > 0) {
    candidate.spellPoints = Math.min(spellPointMaximum(candidate), (candidate.spellPoints ?? 0) + restore);
    addLog(`${candidate.name} steals ${restore} spell points from the broken magic.`, "important");
  }
  return true;
}

async function maybeUseMonsterStartSpecial(monster) {
  if (!monster?.alive || isPartyHeroId(monster.id)) return false;
  monster.usedSpecials = monster.usedSpecials ?? {};
  try {
    monster.preferredSpecialActionKind = chooseMonsterSpecialActionKind(monster);
    addAdminLog(`${monster.name} preferred special action kind: ${monster.preferredSpecialActionKind ?? "none"}.`);
  } catch (error) {
    monster.preferredSpecialActionKind = null;
    addAdminLog(`Monster special scoring failed for ${monster.name}: ${error?.message ?? error}`);
  }

  if (hasMonsterSpecial(monster, /selfheal/i) && !monster.usedSpecials.SelfHeal && monster.hp <= monster.maxHp / 2 && shouldUseMonsterSpecial("defensive")) {
    const heal = rollDice(1, 6).total + monsterCategory(monster);
    monster.hp = Math.min(monster.maxHp, monster.hp + heal);
    monster.usedSpecials.SelfHeal = true;
    addLog(`${monster.name} uses Self Heal and recovers ${heal} HP.`, "heal");
    render();
    return false;
  }

  maybeUseAncientPhotosynthesis(monster);

  if (await maybeUseMonsterAllyHealingAction(monster)) return true;

  if (hasMonsterSpecial(monster, /shellguard|thornhide|briarhide|thickhide|frosthide|stubborn beast/i) && !monster.usedSpecials.ShellGuard && shouldUseMonsterSpecial("defensive")) {
    applyStatusEffect(monster, { id: "guarded", label: "Guarded", acBonus: monsterSpecialAbilityTuning.shellGuardAcBonus, expiresAtEndOfTurn: true });
    monster.usedSpecials.ShellGuard = true;
    addLog(`${monster.name} braces defensively (+${monsterSpecialAbilityTuning.shellGuardAcBonus} AC this turn).`, "important");
    render();
    return false;
  }

  if (hasMonsterSpecial(monster, /bloodfrenzy/i) && monster.hp <= monster.maxHp / 2) {
    applyStatusEffect(monster, { id: "blood-frenzy", label: "Blood Frenzy", attackBonus: 1, expiresAtEndOfTurn: true });
  }

  if (hasMonsterSpecial(monster, /rapport spores|shriek alarm/i)) {
    for (const ally of combatMonsters().filter((candidate) => candidate.id !== monster.id && candidate.tags?.includes("plant") && fightersWithinSquares(candidate, monster, 3))) {
      applyStatusEffect(ally, { id: "spore-rapport", label: "Spore Rapport", attackBonus: 1, expiresAtEndOfTurn: true });
    }
  }

  if (hasMonsterSpecial(monster, /phalanx of flame/i)) {
    const adjacentFiend = combatMonsters().some((ally) => ally.id !== monster.id && ally.tags?.includes("fiend") && fightersWithinSquares(ally, monster, 1));
    if (adjacentFiend) applyStatusEffect(monster, { id: "phalanx-of-flame", label: "Phalanx", acBonus: 1, attackBonus: 1, expiresAtEndOfTurn: true });
  }

  if (hasMonsterSpecial(monster, /bark orders|mine lord's edict|stoke the furnace|forgeheart pulse|royal furnace oath|heart of ore and flame|command the dead|carrion crown command|imperial corpse decree|unburied retinue|lockstep/i)) {
    const allyTags = monster.tags ?? [];
    const bonusIsFire = hasMonsterSpecial(monster, /stoke the furnace|forgeheart pulse|heart of ore and flame/i);
    const bonusIsUndead = hasMonsterSpecial(monster, /command the dead|carrion crown command|imperial corpse decree|unburied retinue|lockstep/i);
    const bonusIsHumanoid = allyTags.includes("humanoid");
    for (const ally of combatMonsters().filter((candidate) => candidate.id !== monster.id && candidate.alive && fightersWithinSquares(candidate, monster, 3))) {
      const sharesTheme = (candidate.tags ?? []).some((tag) => allyTags.includes(tag) && ["embervein-deepworks", "embervein", "deepworks", "forge", "mine", "fire", "gear"].includes(tag));
      const sharesUndead = bonusIsUndead && (candidate.tags ?? []).some((tag) => ["undead", "skeletal", "zombie"].includes(tag));
      const sharesHumanoid = bonusIsHumanoid && (candidate.tags ?? []).includes("humanoid");
      if (!sharesTheme && !sharesUndead && !sharesHumanoid) continue;
      applyStatusEffect(ally, { id: bonusIsFire ? "forge-stoked" : bonusIsUndead ? "death-commanded" : "ordered", label: bonusIsFire ? "Stoked" : bonusIsUndead ? "Commanded" : "Ordered", attackBonus: 1, expiresAtEndOfTurn: true });
    }
  }

  if (hasMonsterSpecial(monster, /mass grave mortar|corpse cart spill/i) && !monster.usedSpecials.GraveMortar && shouldAttemptMonsterActiveSpecial(monster, "area")) {
    const targets = targetsInMonsterSpecialRange(monster, monsterSpecialAbilityTuning.rangedSpecialFeet).slice(0, 2);
    if (targets.length) {
      const label = monsterSpecialNameMatching(monster, /mass grave mortar|corpse cart spill/i) ?? "Corpse Barrage";
      addAdminLog(`${monster.name} chooses ${label}: ${targets.length} target(s) in ranged special range.`);
      monster.usedSpecials.GraveMortar = true;
      for (const target of targets) {
        const save = await rollSavingThrow(target, "dex", monsterSpecialDc(monster), `${monster.name}'s ${label} forces ${target.name} to make a DEX save.`);
        const dice = specialDamageDice(monster, 8);
        const roll = rollDice(dice.count, dice.sides);
        applySpecialDamage(monster, target, Math.max(1, Math.floor((roll.total + dice.bonus) / (save.success ? 2 : 1))), /mortar/i.test(label) ? "bludgeoning" : "poison", label);
        if (!save.success) applyStatusEffect(target, { id: "nauseated", label: "Nauseated", attackBonus: -1, expiresAtEndOfTurn: true });
      }
      monster.hasAction = false;
      render();
      return true;
    }
    addAdminLog(`${monster.name} did not use corpse barrage special: no target in ranged special range.`);
  }

  if (hasMonsterSpecial(monster, /rot stench|nauseating bulk|carrion perfume/i)) {
    const label = monsterSpecialNameMatching(monster, /rot stench|nauseating bulk|carrion perfume/i) ?? "Stench";
    for (const target of monsterTargetableHeroes(monster).filter((hero) => fightersWithinSquares(hero, monster, 1))) {
      const save = await rollSavingThrow(target, "con", monsterSpecialDc(monster), `${monster.name}'s ${label} forces ${target.name} to make a CON save.`);
      if (!save.success) applyStatusEffect(target, { id: "nauseated", label: "Nauseated", attackBonus: -1, expiresAtEndOfTurn: true });
    }
  }

  if (hasMonsterSpecial(monster, /furnace aura|hellfire wings|filth aura|crown of thorns|molten trail|bright seam|ignition flood|wake the (deepworks|mine)|heart of ore and flame/i)) {
    for (const target of monsterTargetableHeroes(monster).filter((hero) => fightersWithinSquares(hero, monster, 1))) {
      const dice = specialDamageDice(monster, 6);
      const roll = rollDice(dice.count, dice.sides);
      const isFilth = hasMonsterSpecial(monster, /filth aura/i);
      const isThorn = hasMonsterSpecial(monster, /crown of thorns/i);
      const label = isFilth ? "Filth Aura" : isThorn ? "Crown of Thorns" : hasMonsterSpecial(monster, /wake the (deepworks|mine)/i) ? "Wake the Mine" : hasMonsterSpecial(monster, /heart of ore and flame/i) ? "Heart of Ore and Flame" : hasMonsterSpecial(monster, /ignition flood/i) ? "Ignition Flood" : hasMonsterSpecial(monster, /bright seam/i) ? "Bright Seam" : hasMonsterSpecial(monster, /molten trail/i) ? "Molten Trail" : hasMonsterSpecial(monster, /hellfire wings/i) ? "Hellfire Wings" : "Furnace Aura";
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), isFilth ? "poison" : isThorn ? "piercing" : "fire", label);
      if (!target.alive) handleHeroDeath();
    }
  }

  if (hasMonsterSpecial(monster, /enlarge|hell-engine blueprint|gear assembly/i) && !monster.usedSpecials.EmberveinSelfBuff && shouldUseMonsterSpecial("defensive")) {
    applyStatusEffect(monster, { id: "engine-primed", label: "Engine-Primed", acBonus: 1, attackBonus: 1, expiresAtEndOfTurn: true });
    monster.usedSpecials.EmberveinSelfBuff = true;
    addLog(`${monster.name}'s machinery surges for a moment.`, "important");
    render();
    return false;
  }

  if (hasMonsterSpecial(monster, /flare step|cinder dance|vanish into soot|cloudstep|slipstream|high roost|whirlpool step|splash step|melt away|crater step|fault step|mountain walks|storm eye|sky crown|storm reading|furnace shield|living cover|open sea body|endless body|cyclone guard|hurricane guard|glacial guard|current guard|guarding slab|iron stance|fading retreat/i) && !monster.usedSpecials.ElementalSelfBuff && shouldUseMonsterSpecial("defensive")) {
    applyStatusEffect(monster, { id: "elemental-stance", label: "Elemental Stance", acBonus: 1, attackBonus: 1, expiresAtEndOfTurn: true });
    monster.usedSpecials.ElementalSelfBuff = true;
    addLog(`${monster.name}'s element gathers close around it.`, "important");
    render();
    return false;
  }

  if (hasMonsterSpecial(monster, /command the coals|pyre command|sultan's decree of flame|pearl command|current of kings|mantle command|open sky decree|skybreaker law|palace winds|cathedral winds|continental command|seismic dominion/i)) {
    const allyTags = monster.tags ?? [];
    for (const ally of combatMonsters().filter((candidate) => candidate.id !== monster.id && candidate.alive && fightersWithinSquares(candidate, monster, 3))) {
      const sharesElement = (candidate.tags ?? []).some((tag) => allyTags.includes(tag) && ["elemental", "fire", "air", "earth", "water", "storm", "stone", "ice"].includes(tag));
      if (!sharesElement) continue;
      applyStatusEffect(ally, { id: "elemental-command", label: "Commanded", attackBonus: 1, expiresAtEndOfTurn: true });
    }
  }

  if (hasMonsterSpecial(monster, /high tempest aura|thin air aura|maelstrom aura|buried city aura/i)) {
    const type = hasMonsterSpecial(monster, /maelstrom/i) ? "cold" : hasMonsterSpecial(monster, /buried city/i) ? "bludgeoning" : "thunder";
    for (const target of monsterTargetableHeroes(monster).filter((hero) => fightersWithinSquares(hero, monster, 1))) {
      const dice = specialDamageDice(monster, 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, Math.floor((roll.total + dice.bonus) / 2)), type, "Elemental Aura");
      if (!target.alive) handleHeroDeath();
    }
  }

  if (await tryMonsterAreaSpecial(monster, /fireball/i, "Fireball", "fire", "dex", monsterSpecialAbilityTuning.rangedSpecialFeet)) return true;
  if (await tryMonsterAreaSpecial(monster, /ashen burst|ember mortar|volcanic pulse|eruption cycle|open the pyre|caldera gate|world-pyre ascension|magma breath|dead sky|suffocating rain|blinding cyclone|crater slam|faultline strike|lava wake|split the battlefield/i, "Elemental Flame Burst", "fire", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "scorched", label: "Scorched", acBonus: -1, expiresAtEndOfTurn: true },
    pushTargets: /volcanic|eruption|crater|faultline/i.test(monsterSpecialNames(monster).join(" ")),
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /dust spin/i, "Dust Spin", "slashing", "dex", feetPerSquare, {
    onFailStatus: { id: "dust-slowed", label: "Slowed", speedBonusFeet: -5, expiresAtEndOfTurn: true },
    maxTargets: 8,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /thunderclap|crackling pulse|pressure rift|choir blast|tempest choir|split the heavens|starstorm fall|city-eater winds|neverending storm|cathedral winds|regent stormfall|tyrant downburst|queenly thunderbolt|baronial cyclone|breath of the plane|worldstorm body/i, "Elemental Storm Burst", /lightning|starstorm|crackling|queenly/i.test(monsterSpecialNames(monster).join(" ")) ? "lightning" : "thunder", "con", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "deafened", label: "Deafened", attackBonus: -1, expiresAtEndOfTurn: true },
    pushTargets: true,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /needle spray|royal tremor|collapse district|open sinkhole|sovereign faultline|fault throne|tectonic verdict|crown of cairns|avalanche hammer|pillar fall|quake fist|graveyard slam|seismic sentence/i, "Elemental Earth Burst", /needle|glass|shatter/i.test(monsterSpecialNames(monster).join(" ")) ? "slashing" : "bludgeoning", "str", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "shaken", label: "Shaken", attackBonus: -1, expiresAtEndOfTurn: true },
    pushTargets: true,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /boiling spray|tsunami front|crushing wave|endless deluge|drown the world|worldspring eruption|abyssal pressure|crown tide|leviathan roll|crush of oceans|corpse tide|hailglass volley|iceberg break|cloudburst devour|glacial advance/i, "Elemental Tide Burst", /boiling|steam|worldspring/i.test(monsterSpecialNames(monster).join(" ")) ? "fire" : /hailglass|iceberg|glacial/i.test(monsterSpecialNames(monster).join(" ")) ? "cold" : "bludgeoning", "str", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "waterlogged", label: "Waterlogged", speedBonusFeet: -10, expiresAtEndOfTurn: true },
    pullTargets: /undertow|tide|current|leviathan|crush/i.test(monsterSpecialNames(monster).join(" ")),
    pushTargets: /wave|tsunami|deluge|worldspring/i.test(monsterSpecialNames(monster).join(" ")),
  })) return true;
  if (await tryMonsterStatusSpecial(monster, /false horizon|gravityless zone|silence of no air|thin air aura|drying wind|fog cover|foam screen|mist choke|drowning mist|black pool|blackwater seep|coral growth|absolute stillness|topple curse|reverse weight|gemscale flash|resonant note/i, "Elemental Distortion", "wis", monsterSpecialAbilityTuning.rangedSpecialFeet, () => ({
    id: `elemental-distortion-${monster.id}`,
    label: "Distorted",
    attackBonus: -1,
    acBonus: -1,
    expiresAtEndOfTurn: true,
  }), { maxTargets: 2 })) return true;
  if (await tryMonsterStatusSpecial(monster, /coal toss/i, "Coal Toss", "dex", 10, () => ({
    id: "coal-blinded",
    label: "Blinded",
    attackBonus: -2,
    expiresAtEndOfTurn: true,
  }), {
    explanation: {
      flavor: "Coal Toss bursts into sharp black dust and hot grit around the target's face. DEX measures whether they turn away before the powder blinds them.",
      failure: "Failure means the target is briefly blinded by coal dust.",
      success: "Success means they avoid the worst of the dust cloud.",
    },
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /soot breath|furnace vent|valve twist|throw keg|molten slag breath|lava breath|anvil breath/i, "Forge Burst", "fire", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "scorched", label: "Scorched", acBonus: -1, expiresAtEndOfTurn: true },
    pushTargets: /throw keg|furnace vent|valve twist|anvil breath/i.test(monsterSpecialNames(monster).join(" ")),
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /drop the hook|anvil drop|colossus hammerfall|cave-in groan/i, "Falling Machinery", "bludgeoning", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFail: (target) => applyProneCondition(target, "falling-machinery"),
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /support-beam breaker/i, "Crushing Machinery", "bludgeoning", "str", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "shaken", label: "Shaken", attackBonus: -1, expiresAtEndOfTurn: true },
    pushTargets: true,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /pressure release/i, "Pressure Release", "fire", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    pushTargets: true,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /overpressure burst/i, "Pressure Burst", "thunder", "con", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "deafened", label: "Deafened", attackBonus: -1, expiresAtEndOfTurn: true },
    pushTargets: true,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /grinding floor/i, "Grinding Floor", "slashing", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "hamstrung", label: "Hamstrung", speedBonusFeet: -10, expiresAtEndOfTurn: true },
  })) return true;
  if (await tryMonsterStatusSpecial(monster, /black smoke cloud/i, "Black Smoke Cloud", "con", monsterSpecialAbilityTuning.burstRangeFeet, () => ({
    id: "smoke-blinded",
    label: "Smoke-Blinded",
    attackBonus: -2,
    expiresAtEndOfTurn: true,
  }), { maxTargets: 3 })) return true;
  if (await tryMonsterAreaSpecial(monster, /plague breath|bile spray|blight belch|rot burst|rot crown pulse/i, "Plague Breath", "poison", "con", monsterSpecialAbilityTuning.burstRangeFeet)) return true;
  if (await tryMonsterAreaSpecial(monster, /doom scream|void bell toll/i, "Doom Scream", "thunder", "con", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "frightened", label: "Frightened", attackBonus: -2, expiresAtEndOfTurn: true },
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /mournful cry|hollow wail|banshee keening|white bell wail|royal wail|grief pulse|origin wail|cathedral dirge|duke's war cry|crown of the ninefold pact|howl of hunger|panic shriek|abyssal roar|horror judgement|triple condemnation|chaos star|abyss unleashed|shriek alarm|panic spores|overmind spores/i, "Dread Wail", "psychic", "wis", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "frightened", label: "Frightened", attackBonus: -2, expiresAtEndOfTurn: true },
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /hurl debris|ethereal stomp|pit quake|world-stamp|world-cracker slam|dance of six deaths|whirling blades|rootquake|canopy collapse|first forest awakens|corpse slam/i, "Crushing Burst", /dance of six deaths|whirling blades/i.test(monsterSpecialNames(monster).join(" ")) ? "slashing" : "bludgeoning", "str", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "shaken", label: "Shaken", attackBonus: -1, expiresAtEndOfTurn: true },
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /soul lantern|grave breath|soul furnace|moonlit dominion|forbidden chorus|corrupt wish/i, "Soul Burst", "necrotic", "wis", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "drained", label: "Drained", speedBonusFeet: -10, expiresAtEndOfTurn: true },
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /profane radiance/i, "Profane Radiance", "radiant", "con", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "blinded", label: "Blinded", attackBonus: -2, expiresAtEndOfTurn: true },
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /hellhound breath|branding lash|guilty flame|brimstone shell|burning hand of command|confession by fire/i, "Infernal Burst", "fire", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "branded", label: "Branded", acBonus: -1, expiresAtEndOfTurn: true },
    pushTargets: /burning hand/i.test(monsterSpecialNames(monster).join(" ")),
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /impaling advance/i, "Impaling Advance", "piercing", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    pushTargets: true,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /abyssal bile|vomit plague/i, "Abyssal Bile", /vomit plague/i.test(monsterSpecialNames(monster).join(" ")) ? "acid" : "acid", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "scorched", label: "Scorched", acBonus: -1, expiresAtEndOfTurn: true },
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /dazzling spores/i, "Dazzling Spores", "radiant", "con", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "blinded", label: "Blinded", attackBonus: -2, expiresAtEndOfTurn: true },
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /carrion spores|spores of filth|venom bloom|titan sporefall|midnight spores|plague king's mass/i, "Carrion Spores", "poison", "con", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "poisoned", label: "Poisoned", attackBonus: -1, expiresAtEndOfTurn: true },
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /unstable fire/i, "Unstable Fire", "fire", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    pushTargets: true,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /soul tempest|abyss storm/i, "Soul Tempest", "lightning", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    pushTargets: true,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /flaming whipstorm|gate pulse|maw of the abyss|reality tear|rift sovereignty/i, "Abyssal Surge", /flaming whipstorm/i.test(monsterSpecialNames(monster).join(" ")) ? "fire" : /maw/i.test(monsterSpecialNames(monster).join(" ")) ? "piercing" : "force", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    pullTargets: /flaming whipstorm|gate pulse|maw of the abyss/i.test(monsterSpecialNames(monster).join(" ")),
    pushTargets: /reality tear|rift sovereignty/i.test(monsterSpecialNames(monster).join(" ")),
  })) return true;
  if (await tryMonsterStatusSpecial(monster, /false lantern|lesser possession|noble possession|petty bargain|sulphur hex|sweetened damnation|infernal verdict|name in the ledger|praetor's challenge|chains of grace|false promise|prince's mark|musk charm|luring scent/i, "Infernal Compulsion", "wis", monsterSpecialAbilityTuning.rangedSpecialFeet, () => ({
    id: `compelled-${monster.id}`,
    label: "Compelled",
    attackBonus: -2,
    acBonus: -1,
    expiresAtEndOfTurn: true,
  }), { pullTargets: /luring scent/i.test(monsterSpecialNames(monster).join(" ")) })) return true;
  if (await tryMonsterStatusSpecial(monster, /locking chain|sentence to chains|living chains|chains of the ninth gate|root snare|constricting coil|stranglehold|forest judgment|living jungle|command the brambles/i, "Binding Chains", "str", monsterSpecialAbilityTuning.burstRangeFeet, () => ({
    id: "restrained",
    label: "Restrained",
    speedLocked: true,
    attackBonus: -2,
    expiresAtEndOfTurn: true,
  }), { maxTargets: 3, pullTargets: true })) return true;
  if (await tryMonsterAreaSpecial(monster, /stampede|gravequake|stormhorn burst|root-rending roar|bossroar/i, "Roar", "bludgeoning", "str", monsterSpecialAbilityTuning.burstRangeFeet)) {
    for (const target of monsterTargetableHeroes(monster)) {
      if (fightersWithinSquares(monster, target, monsterSpecialAbilityTuning.burstRangeFeet / feetPerSquare)) {
        applyStatusEffect(target, { id: "shaken", label: "Shaken", attackBonus: monsterSpecialAbilityTuning.bossRoarAttackPenalty, expiresAtEndOfTurn: true });
      }
    }
    return true;
  }
  if (await tryMonsterStatusSpecial(monster, /web snare|websnare/i, "Web Snare", "dex", monsterSpecialAbilityTuning.rangedSpecialFeet, () => ({
    id: "web-snared",
    label: "Snared",
    speedLocked: true,
    expiresAtEndOfTurn: true,
  }))) return true;
  if (await tryMonsterAreaSpecial(monster, /venom spit/i, "Venom Spit", "poison", "con", monsterSpecialAbilityTuning.rangedSpecialFeet)) return true;
  if (await tryMonsterAreaSpecial(monster, /grave spark/i, "Grave Spark", "necrotic", "dex", monsterSpecialAbilityTuning.rangedSpecialFeet)) return true;

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
      advanceDungeonTime(combatRoundSeconds());
      addLog(`Round ${state.round} begins.`, "important");
    }
  } while (!activeFighter()?.alive);
  syncActiveHeroToTurn();
  resetTurnResources(activeFighter());
  addTurnStartLog(activeFighter());
  if (await resolveTurnStartHazardsForActiveFighter()) return;
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
  scheduleMonsterTurnStallGuard(activeFighter());
  maybeRunMonsterTurn();
}

function scheduleMonsterTurnStallGuard(fighter) {
  if (!fighter || isPlayerControlledPartyFighter(fighter) || !fighter.alive || partyDefeatedOrDying()) return;
  const activeMonsterId = fighter.id;
  const aiStartedAt = fighter.aiTurnStartedAt ?? 0;
  window.setTimeout(() => {
    const current = activeFighter();
    const visibleDialogOpen = Boolean(els.gameDialog && !els.gameDialog.classList.contains("hidden"));
    const reactionPromptOpen = Boolean(document.querySelector(".reaction-prompt"));
    if (!current || current.id !== activeMonsterId || isPlayerControlledPartyFighter(current) || visibleDialogOpen || reactionPromptOpen || partyDefeatedOrDying()) return;
    if (current.aiTurnResolving) return;
    if ((current.aiTurnStartedAt ?? 0) > aiStartedAt) return;
    addLog(`${current.name}'s turn stalled before acting, so combat advances.`, "important");
    window.DepthboundPlaytest?.syncNow?.();
    endTurn();
  }, Math.max(15000, tokenSlideMs * 28));
}

function maybeRunMonsterTurn() {
  const fighter = activeFighter();
  if (!fighter || isPlayerControlledPartyFighter(fighter) || !fighter.alive || partyDefeatedOrDying()) {
    if (adminEnabled?.()) addAdminLog(`Monster turn skipped before scheduling: fighter ${fighter?.id ?? "none"}, playerControlled ${Boolean(fighter && isPlayerControlledPartyFighter(fighter))}, alive ${Boolean(fighter?.alive)}, partyDefeated ${partyDefeatedOrDying()}.`);
    return;
  }

  els.attack.disabled = true;
  els.useItem.disabled = true;
  els.endTurn.disabled = true;
  window.clearTimeout(monsterTurnTimer);
  const now = performance.now();
  const dueAt = fighter.nextAiDecisionAt ?? 0;
  const delay = Math.max(tokenSlideMs, dueAt - now);
  addAdminLog(`Monster AI scheduled for ${fighter.name} in ${Math.round(delay)}ms.`);
  monsterTurnTimer = window.setTimeout(() => {
    const current = activeFighter();
    if (current && !isPlayerControlledPartyFighter(current)) {
      addAdminLog(`Monster AI starts for ${current.name}.`);
      current.aiTurnStartedAt = performance.now();
      current.nextAiDecisionAt = performance.now() + monsterAiDecisionIntervalMs;
      pathfindingJobsThisTurn = 0;
      perfStats.aiUpdates += 1;
      const activeMonsterId = current.id;
      current.aiTurnResolving = true;
      window.setTimeout(() => {
        const stillActive = activeFighter()?.id === activeMonsterId;
        const visibleDialogOpen = Boolean(els.gameDialog && !els.gameDialog.classList.contains("hidden"));
        const reactionPromptOpen = Boolean(document.querySelector(".reaction-prompt"));
        if (!stillActive || visibleDialogOpen || reactionPromptOpen || partyDefeatedOrDying()) return;
        if (current.aiTurnResolving) return;
        addLog(`${current.name}'s turn stalled, so combat advances.`, "important");
        window.DepthboundPlaytest?.syncNow?.();
        endTurn();
      }, Math.max(15000, tokenSlideMs * 28));
      Promise.resolve()
        .then(() => runMonsterAi(current))
        .catch((error) => {
          console.error(error);
          if (activeFighter()?.id !== activeMonsterId) return;
          addLog(`${current.name}'s turn could not resolve and is skipped.`, "important");
          window.DepthboundPlaytest?.syncNow?.();
          endTurn();
        })
        .finally(() => {
          current.aiTurnResolving = false;
        });
    } else {
      addAdminLog(`Monster AI timer found no monster: active ${current?.name ?? "none"}.`);
    }
  }, delay);
}

