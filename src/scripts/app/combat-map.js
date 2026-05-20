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

function killHero(hero) {
  hero.hp = 0;
  hero.alive = false;
  hero.dead = true;
  hero.stableAtZero = false;
  hero.deathSaves = { successes: 0, failures: 3 };
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
  addLog(`${defender.name} drops to 0 HP and starts making death saves.`, "important");
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
    const label = rollResult.mode === "karmic" ? "Karmic outcome" : "adjusted outcome";
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
      note: "Karmic outcome: monster natural 20 becomes a natural 19 hit.",
    };
  }
  if (mode === "tymora") {
    return {
      attackRoll,
      isCritical: true,
      doublesDamage: false,
      forcedHit: false,
      note: "Tymora's Favorite prevents the monster critical from doubling damage.",
    };
  }
  return { attackRoll, isCritical: true, doublesDamage: true, forcedHit: false, note: "" };
}

function addAdminCheckLog({ actor, label, rollResult, bonus = 0, guidance = 0, total, dc, target = "", success = false, note = "" }) {
  const guidanceText = guidance ? ` + Guidance ${guidance}` : "";
  const targetText = target ? ` on ${target}` : "";
  addAdminLog(`${actor?.name ?? "Unknown"} ${label}${targetText}: ${d20RollDetail(rollResult)} ${abilityLabel(bonus)}${guidanceText} = ${total} vs DC ${dc} => ${success ? "success" : "failure"}${note ? `. ${note}` : ""}.`);
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
  return { totalAttack: totalAttack + roll, used: true, roll };
}

async function maybeUseBendLuckAttack(attacker, totalAttack, defenderAc) {
  if (!isPartyHeroId(attacker?.id) || totalAttack >= defenderAc || totalAttack + 3 < defenderAc) return { totalAttack, used: false };
  const candidate = partyHeroes().find((hero) => {
    const ability = reactionAbility(hero, "bendLuck");
    return hero.id !== attacker.id && heroCanAct(hero) && hasReactionAvailable(hero) && canSpendCombatAbility(hero, ability) && distance(hero.position, attacker.position) <= 12;
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
    return canSpendCombatAbility(hero, ability) && distance(hero.position, target.position) <= rangeSquares;
  });
}

function reactionWeaponAttackDamage(attacker, defender, label, extraDamage = 0, extraType = null) {
  if (!attacker?.alive || !defender?.alive || !hasMeleeAccess(attacker, defender)) return false;
  const profile = opportunityAttackProfile(attacker);
  const attackRollResult = rollD20ForFighter(attacker);
  const criticalResult = resolveMonsterHeroCritical(attacker, defender, attackRollResult.roll);
  const attackRoll = criticalResult.attackRoll;
  const bonus = profile.weapon ? attackBonusForWeapon(attacker, profile.weapon) : attackBonusForAbility(attacker, profile.attackAbility ?? "str");
  const total = attackRoll + bonus;
  const targetAc = armorClass(defender);
  addLog(`${attacker.name}'s ${label}: d20 ${attackRoll} ${abilityLabel(bonus)} = ${total} vs AC ${targetAc}.${criticalResult.note ? ` ${criticalResult.note}` : ""}`, "important");
  addAdminLog(`${attacker.name} ${label} breakdown vs ${defender.name}: ${d20RollDetail(attackRollResult)}${criticalResult.attackRoll !== attackRollResult.roll ? ` -> d20 ${attackRoll}` : ""} + attack ${abilityLabel(bonus)} = ${total}; target AC ${targetAc}.`);
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
  if (totalAttack < defenderAc || !hasReactionAvailable(defender) || distance(attacker.position, defender.position) > 2 || !hasClearLineOfSight(defender.position, attacker.position)) return { acBonus: 0, blocked: false };
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
  if (canSpendCombatAbility(defender, wrath) && distance(defender.position, attacker.position) <= 12 && hasClearLineOfSight(defender.position, attacker.position)) {
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
      attackGridDistance(candidate.position, attacker.position) <= 1 &&
      hasClearLineOfSight(candidate.position, attacker.position) &&
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
  if (!currentWalkable(target).has(positionKey(position))) return false;
  if (window.DungeonGrid.isOccupied(position, state.fighters, target)) return false;
  const dx = Math.abs(position.x - target.position.x);
  const dy = Math.abs(position.y - target.position.y);
  if (dx + dy === 1) return canTraverseMovementEdge(target, target.position, position, []);
  if (Math.max(dx, dy) !== 1) return false;
  const cornerA = { x: position.x, y: target.position.y };
  const cornerB = { x: target.position.x, y: position.y };
  const walkable = currentWalkable(target);
  return (
    (walkable.has(positionKey(cornerA)) && canTraverseMovementEdge(target, target.position, cornerA, []) && canTraverseMovementEdge(target, cornerA, position, [])) ||
    (walkable.has(positionKey(cornerB)) && canTraverseMovementEdge(target, target.position, cornerB, []) && canTraverseMovementEdge(target, cornerB, position, []))
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

function currentWalkable(fighter = null) {
  const walkable = new Set((state.dungeon?.walkable ?? []).map(positionKey));
  blockingObjectKeys(fighter).forEach((tileKey) => walkable.delete(tileKey));
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
  visibleWalkable().forEach((tileKey) => keys.add(tileKey));
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
    const visibleCorridors = visibleWalkable();
    return adjacentCells(position).some((cell) => currentOpenedKeys().has(positionKey(cell)) || visibleCorridors.has(positionKey(cell)));
  }
  if (corridorTiles().has(tileKey)) {
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

function visibleWalkable(fighter = null) {
  const known = new Set();
  const openedKeys = currentOpenedKeys();
  const discovered = currentDiscoveredRoomIds();
  for (const room of state.dungeon?.rooms ?? []) {
    if (discovered.has(room.id)) {
      room.cells.forEach((cell) => known.add(positionKey(cell)));
      room.doors.forEach((door) => known.add(positionKey(door)));
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
    if (adjacentCells(door).some((cell) => openedKeys.has(positionKey(cell)))) {
      known.add(positionKey(door));
    }
  }
  blockingObjectKeys(fighter).forEach((tileKey) => known.delete(tileKey));
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

function objectTargetName(object) {
  return objectTemplate(object?.type)?.name ?? object?.name ?? "Object";
}

function objectTargetPosition(object, attacker = activeFighter()) {
  const cells = objectCells(object);
  if (!cells.length) return object?.position;
  if (!attacker?.position) return cells[0];
  return cells.slice().sort((a, b) => attackGridDistance(attacker.position, a) - attackGridDistance(attacker.position, b))[0];
}

function isObjectInAttackRangeWithProfile(attacker, object, profile) {
  if (!objectIsDestructible(object)) return false;
  const range = profileRangeSquares(profile);
  const cells = objectCells(object);
  if (range <= 1) {
    return cells.some((cell) => attackGridDistance(attacker.position, cell) <= 1);
  }
  return cells.some((cell) => attackGridDistance(attacker.position, cell) <= range && hasClearLineOfSight(attacker.position, cell));
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
  const fighterIsHero = heroIds.has(fighter.id) || fighter.team === "heroes" || fighter.friendly;
  const candidateIsHero = heroIds.has(candidate.id) || candidate.team === "heroes" || candidate.friendly;
  return fighterIsHero ? !candidateIsHero : candidateIsHero;
}

function canOpportunityAttack(attacker, defender, from, to) {
  if (state.mode !== "combat" || !attacker.alive || !defender.alive || !hostileTo(attacker, defender)) return false;
  if (defender.disengaged) return false;
  if (fighterHasFeat(defender, "mobile") && (defender.mobileNoOpportunityFrom ?? []).includes(attacker.id)) return false;
  const profile = opportunityAttackProfile(attacker);
  const range = profileRangeSquares(profile);
  const hadThreat = attackGridDistance(attacker.position, from) <= range;
  const keepsThreat = attackGridDistance(attacker.position, to) <= range;
  return hadThreat && !keepsThreat;
}

async function shouldTakeOpportunityAttack(attacker, defender) {
  return true;
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
  playSoundEffect("meleeAttack");
  const attackRollResult = rollD20ForFighter(attacker, { disadvantage: defender.dodging });
  const attackRolls = attackRollResult.rolls;
  const criticalResult = resolveMonsterHeroCritical(attacker, defender, attackRollResult.roll);
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
  const isMiss = attackRoll === 1 || hitReaction.blocked || (!criticalResult.forcedHit && totalAttack < defenderAc) || shieldBlocked;

  addLog(
    `${attacker.name} makes an opportunity attack with ${profile.weaponName}${defender.dodging ? " with disadvantage" : ""}: d20 ${defender.dodging ? `${attackRolls.join(" / ")} -> ${attackRoll}` : attackRoll} ${abilityLabel(currentAttackBonus)} = ${totalAttack} vs AC ${defenderAc}.${criticalResult.note ? ` ${criticalResult.note}` : ""}`,
    "important",
  );
  addAdminLog(`${attacker.name} opportunity attack breakdown vs ${defender.name}: ${d20RollDetail(attackRollResult)}${criticalResult.attackRoll !== attackRollResult.roll ? ` -> Karmic outcome d20 ${attackRoll}` : ""} + attack ${abilityLabel(currentAttackBonus)}${inspiration.used ? ` + inspiration ${inspiration.roll}` : ""} = ${totalAttack}; target AC ${defenderAc}; ${isMiss ? "miss" : isCritical ? "critical hit" : "hit"}${criticalResult.note ? `; ${criticalResult.note}` : ""}.`);

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
  return state.mode === "home" && hero?.alive && isPartyHeroId(hero.id) && !isAutonomousAlly(hero);
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
        goalText: customGoalStatus().text,
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
  if (!goal || goal.type === "reachExit") return { met: true, text: "Reach the exit." };
  if (goal.type === "collectItem") {
    const item = getItemTemplate(goal.itemId);
    return {
      met: partyHasBaseItem(goal.itemId),
      text: `Collect ${item?.name ?? goal.itemId ?? "the required object"}.`,
    };
  }
  if (goal.type === "collectItemCount") {
    const item = getItemTemplate(goal.itemId);
    const target = Math.max(1, Number(goal.count) || 1);
    const collected = partyBaseItemCount(goal.itemId);
    return {
      met: collected >= target,
      text: `Collect ${target} ${item?.name ?? goal.itemId ?? "required item"}${target === 1 ? "" : "s"} (${collected}/${target}).`,
    };
  }
  if (goal.type === "killBoss") {
    return {
      met: !aliveMonsters().some((monster) => monster.customBoss || monster.id?.startsWith("boss-") || monster.tags?.includes("boss")),
      text: "Defeat the boss monster.",
    };
  }
  if (goal.type === "killMonsterType") {
    const initial = state.customDungeon?.monsterSummary?.[goal.monsterId] ?? 0;
    const alive = aliveMonsters().filter((monster) => (monster.baseMonsterId ?? monster.templateId ?? monster.id) === goal.monsterId).length;
    const killed = Math.max(0, initial - alive);
    const target = Math.max(1, Number(goal.count) || 1);
    const monster = getMonsterTemplate(goal.monsterId);
    return {
      met: killed >= target,
      text: `Defeat ${target} ${monster?.name ?? goal.monsterId ?? "chosen monster"}${target === 1 ? "" : "s"} (${killed}/${target}).`,
    };
  }
  if (goal.type === "escortNpc") {
    return { met: false, text: "Find the NPC and bring them to the exit. This goal type is reserved for the NPC escort system." };
  }
  return { met: false, text: "Complete the dungeon goal." };
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
    const completedContext = {
      themeId: state.themeId,
      campaignId: state.campaignId,
      campaignIndex: state.campaignIndex,
    };
    const completedCampaign = state.campaignId && state.campaignIndex ? { ...state.campaignProgress } : state.campaignProgress;
    const questFlags = { ...(state.questFlags ?? {}) };
    const partyResources = normalizePartyResources(state.partyResources ?? {});
    if (state.campaignId && state.campaignIndex) {
      completedCampaign[state.campaignId] = Math.max(completedCampaign[state.campaignId] ?? 0, state.campaignIndex);
    }
    state = createHomeState(rosterHeroes(), state.chest ?? [], state.chestMoney ?? {}, {
      ...state.party,
      campaignProgress: completedCampaign,
      questFlags,
      partyResources,
      home: homeWithRegrownResources(state.home),
      monsterCompendium: state.monsterCompendium,
    });
    state.combatStarted = false;
    roomIsBuilt = false;
    handleNpcDungeonComplete(completedContext);
    maybeUnlockNpcProgress();
    addLog(`${hero.name} reaches the exit. Dungeon complete. The party gained ${tokenAward} Hero Token${tokenAward === 1 ? "" : "s"} each.`, "important");
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
  const idText = Array.from(ids).map((id) => String(id).toLowerCase());
  const hasFoodCue = (...cues) => cues.some((cue) => {
    const normalized = String(cue).toLowerCase();
    return ids.has(normalized) || idText.some((id) => id.includes(normalized));
  });
  const add = (itemId, options = {}) => {
    monster.extraLoot = [...(monster.extraLoot ?? []), { kind: "item", itemId, ...options }];
  };
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
  addMonsterMaterialDrops(monster);
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
  recordMonsterKill(monster);
  const xp = monster.xp ?? 50;
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
    if (!window.DungeonGrid.isInsideGrid(cell, currentGridSize())) return false;
    if (!walkable.has(positionKey(cell))) return false;
    if (window.DungeonGrid.isOccupied(cell, state.fighters, fighter)) return false;
    return canTraverseMovementEdge(fighter, fighter.position, cell, []);
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
  const heroes = partyHeroes();
  if (!heroes.length) return;
  const activeTiles = activeTileKeys();

  for (const trap of state.dungeonObjects ?? []) {
    if (!objectIsTrap(trap) || trap.detected || !objectCells(trap).some((cell) => activeTiles.has(positionKey(cell)) && isKnownTile(cell))) continue;

    trap.spotCheckedBy = trap.spotCheckedBy ?? [];
    for (const hero of heroes.filter((entry) => !trap.spotCheckedBy.includes(entry.id))) {
      trap.spotCheckedBy.push(hero.id);
      const rollResult = rollD20ForFighter(hero);
      const roll = reliableTalentRoll(hero, "perception", rollResult.roll);
      const bonus = skillCheckBonus(hero, "wis", "perception");
      const guidance = guidanceSkillBonus();
      const total = roll + bonus + guidance;
      const dc = trap.spotDc ?? 12;
      trap.detected = total >= dc;
      recordD20OutcomeForFighter(hero, trap.detected);
      addAdminCheckLog({ actor: hero, label: "Perception check to spot hidden trap", rollResult, bonus, guidance, total, dc, success: trap.detected, note: `trap id ${trap.id ?? "unknown"}` });
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
      const rollResult = rollD20ForFighter(hero);
      const roll = reliableTalentRoll(hero, "perception", rollResult.roll);
      const bonus = skillCheckBonus(hero, "wis", "perception");
      const guidance = guidanceSkillBonus();
      const total = roll + bonus + guidance;
      const dc = chest.trap.spotDc ?? 12;
      chest.trap.detected = total >= dc;
      recordD20OutcomeForFighter(hero, chest.trap.detected);
      addAdminCheckLog({ actor: hero, label: "Perception check to spot hidden trap", target: objectTemplate(chest.type)?.name ?? "a feature", rollResult, bonus, guidance, total, dc, success: chest.trap.detected, note: `object id ${chest.id ?? "unknown"}` });
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
    if (!targetRoom || !targetDoor) {
      if (!doorRoom) continue;
      openedDoorKeys.add(positionKey(entry));
      if (entry.corridor) openedCorridorKeys.add(positionKey(entry.corridor));
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
  return openDoor(door);
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
  return [els.mainMenu, els.fighterInfo, els.inventoryMenu, els.useItemMenu, els.abilitiesMenu, els.homeMenu, els.villageMenu, els.storeMenu, els.gameDialog].some(
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
  const thrownAsMelee = weapon?.properties?.includes("thrown") && objectCells(object).some((cell) => attackGridDistance(attacker.position, cell) <= 1);
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

  const attackRollResult = rollD20ForFighter(attacker);
  const attackRoll = attackRollResult.roll;
  const currentAttackBonus = attackBonusForWeapon(attacker, weapon);
  const targetAc = objectArmorClass(object);
  const totalAttack = attackRoll + currentAttackBonus;
  const isCritical = attackRoll === 20;
  const isMiss = attackRoll === 1 || totalAttack < targetAc;
  const targetName = objectTargetName(object);
  addLog(`${attacker.name} attacks ${targetName}: d20 ${attackRoll} ${abilityLabel(currentAttackBonus)} = ${totalAttack} vs AC ${targetAc}.`);
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
  object.hp = Math.max(0, (object.hp ?? objectMaxHp(object)) - totalDamage);
  const critText = isCritical ? " Critical hit." : "";
  addLog(`${attacker.name} hits ${targetName} for ${totalDamage} damage (${damageRoll.rolls.join(" + ")} ${abilityLabel(attackDamage.bonus)}${attackDamage.type ? ` ${attackDamage.type}` : ""}). ${object.hp}/${object.maxHp} HP remains.${critText}`, "damage");
  const destroyed = object.hp <= 0;
  if (destroyed) destroyDungeonObject(object, attacker);
  render();
  if (destroyed) hideFighterInfo?.();
  else if (!els.fighterInfo.classList.contains("hidden")) showDungeonObjectInfo(object);
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
  const attackAdvantage =
    (attacker.statusEffects ?? []).some((effect) => effect.attackAdvantage) ||
    (fighterHasFeat(attacker, "grappler") && fighterStatusEffect(defender, "grappled")?.grappledBy === attacker.id) ||
    (warlockKnowsInvocation(attacker, "devilsSight") && targetIsInMagicalDarkness(defender)) ||
    (warlockKnowsInvocation(attacker, "witchSight") && targetIsCursedOrObscured(defender));
  const defenderDodge = defender.dodging;
  const defendedBySidekick = await maybeUseWarriorDefender(attacker, defender);
  const hasDisadvantage = rangedDisadvantage || defenderDodge || defendedBySidekick;
  const attackRollResult = rollD20ForFighter(attacker, { advantage: attackAdvantage && !hasDisadvantage, disadvantage: hasDisadvantage && !attackAdvantage });
  const attackRolls = attackRollResult.rolls;
  const criticalResult = resolveMonsterHeroCritical(attacker, defender, attackRollResult.roll);
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
    `${attacker.name} ${options.actionLabel ?? "attacks"}${attackAdvantage && !hasDisadvantage ? " with advantage" : ""}${rangedDisadvantage && !attackAdvantage ? " with disadvantage" : ""}${defenderDodge && !attackAdvantage ? " because the target is dodging" : ""}${defendedBySidekick && !attackAdvantage ? " because of Defender" : ""}: d20 ${
      attackRolls.length > 1 ? `${attackRolls.join(" / ")} -> ${attackRoll}` : attackRoll
    } ${abilityLabel(currentAttackBonus)}${inspiration.used ? " + inspiration" : ""} = ${totalAttack} vs AC ${
      defenderAc
    }.${criticalResult.note ? ` ${criticalResult.note}` : ""}`,
  );
  addAdminLog(`${attacker.name} attack breakdown vs ${defender.name}: ${d20RollDetail(attackRollResult)}${criticalResult.attackRoll !== attackRollResult.roll ? ` -> Karmic outcome d20 ${attackRoll}` : ""} + attack ${abilityLabel(currentAttackBonus)}${inspiration.used ? ` + inspiration ${inspiration.roll}` : ""} = ${totalAttack}; target AC ${defenderAc}; ${isMiss ? "miss" : isCritical ? "critical hit" : "hit"}${criticalResult.note ? `; ${criticalResult.note}` : ""}.`);

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
  const rider = consumeWeaponRider(attacker);
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
    if (rider.riderStatus === "banished") applyStatusEffect(defender, { id: "banished", label: "Banished", speedLocked: true, actionLocked: true, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "charmed") applyStatusEffect(defender, { id: "beguiled", label: "Beguiled", attackBonus: -2, expiresAtEndOfTurn: true });
    if (rider.riderStatus === "stunned") applyStatusEffect(defender, { id: "stunned", label: "Stunned", speedLocked: true, actionLocked: true, durationRounds: 1 });
    if (rider.riderStatus === "sweeping") {
      const splash = visibleMonsters().find((monster) => monster.id !== defender.id && distance(monster.position, defender.position) <= 1);
      if (splash) applySpecialDamage(attacker, splash, Math.max(1, Math.floor(rider.damageBonus / 2)), attackDamage.type, "Sweeping Attack");
    }
  }
  if (isPartyHeroId(defender.id) && adminEnabled() && adminGodMode) {
    addLog(`God mode prevents ${attacker.name}'s damage to ${defender.name}.`, "important");
    render();
    return;
  }
  const resolvedPackets = packets.map((packet) => ({ ...packet, ...calculateDamageModifiers(defender, packet.raw, packet.type) }));
  addAdminLog(`${attacker.name} damage packets vs ${defender.name}: ${resolvedPackets.map((packet) => `${packet.label} => raw ${packet.raw}, final ${packet.damage}${packet.reason ? ` (${packet.reason})` : ""}`).join("; ")}.`);
  let totalDamage = resolvedPackets.reduce((sum, packet) => sum + packet.damage, 0);
  if (hitReaction.resistance) totalDamage = Math.floor(totalDamage / 2);
  totalDamage = maybeUseMonsterDamageReduction(defender, attacker, totalDamage, !rangedAttack);
  totalDamage = await maybeUseUncannyDodge(defender, attacker, totalDamage);
  totalDamage = await maybeUseStoneEndurance(defender, totalDamage);
  totalDamage = await maybeUseBattleMasterParry(defender, attacker, totalDamage, !rangedAttack);
  totalDamage = await maybeUseProtectiveField(defender, totalDamage);
  totalDamage = await maybeUseSpiritShield(defender, attacker, totalDamage);
  applyDamageToFighter(defender, totalDamage);
  defender.lastDamagedById = attacker.id;
  if (!rangedAttack && warlockKnowsInvocation(attacker, "lifedrinker") && totalDamage > 0) {
    const healed = applyHealingToHero(attacker, Math.max(1, Math.floor(abilityMod(attacker, "cha") / 2)));
    if (healed > 0) addLog(`${attacker.name}'s Lifedrinker restores ${healed} HP.`, "heal");
  }
  if (!isPartyHeroId(attacker.id)) {
    await applyMonsterOnHitSpecials(attacker, defender, totalDamage, doublesDamage);
  }
  if (!isPartyHeroId(defender.id)) {
    await applyMonsterReactiveSpecials(defender, attacker, totalDamage, !rangedAttack, attackDamage.type);
  }
  await maybeUseBarbarianAfterDamage(defender, attacker, totalDamage, !rangedAttack);
  await maybeUseSubclassAfterDamageReactions(defender, attacker, totalDamage, !rangedAttack);
  if (options.beastFormAttack === "bite" && totalDamage > 0 && !attacker.beastFormHitThisTurn && (attacker.hp ?? 0) < ((attacker.maxHp ?? 1) / 2)) {
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
  await applyWeaponRiderSecondary(attacker, defender, rider, attackDamage);
  await applyWildShapeAttackEffects(attacker, defender, attackDamage);
  if (totalDamage > 0) await maybeUseHellishRebuke(defender, attacker);
  await maybeUseStoneRuneAfterAttack(attacker, defender);
  await maybeUseBeastClawExtraAttack(attacker, defender, options);

  if (!defender.alive && maybeUseMonsterDeathDefiance(defender, resolvedPackets)) {
    addLog(`${defender.name} claws back from the edge at 1 HP.`, "important");
  } else if (!defender.alive && maybeUseUndeadFortitude(defender, totalDamage)) {
    addLog(`${defender.name} refuses to fall and remains at 1 HP.`, "important");
  }

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
  const targets = monsterTargetableHeroes().filter((hero) => hero.alive && distance(hero.position, monster.position) <= rangeFeet / feetPerSquare);
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

function savingThrow(target, ability, dc) {
  const rollResult = rollD20ForFighter(target);
  const roll = rollResult.roll;
  const statusBonus = (target.statusEffects ?? []).reduce((sum, effect) => sum + (effect.saveBonus ?? 0), 0) + (magicEffects(target).saveBonus ?? 0);
  const auraBonus = auraSaveBonus(target);
  const proficiency = (target.savingThrowProficiencies ?? []).includes(ability) ? rangerCompanionProficiencyBonus(target) : 0;
  const bonus = abilityMod(target, ability) + proficiency + statusBonus + auraBonus;
  let total = roll + bonus;
  let success = total >= dc;
  let indomitable = null;
  const indomitableAbility = fighterAbilityDefinitions(target).find((entry) => entry.id === "indomitable");
  if (!success && indomitableAbility && (target.level ?? 1) >= (indomitableAbility.level ?? 1) && (target.abilityUses?.indomitable ?? 0) < abilityMaxUses(target, indomitableAbility)) {
    const rerollResult = rollD20ForFighter(target);
    const rerollTotal = rerollResult.roll + bonus;
    target.abilityUses.indomitable = (target.abilityUses.indomitable ?? 0) + 1;
    indomitable = { roll: rerollResult.roll, rolls: rerollResult.rolls, rawRolls: rerollResult.rawRolls, rollResult: rerollResult, total: rerollTotal };
    total = rerollTotal;
    success = total >= dc;
  }
  const fanaticalFocus = fighterAbilityDefinitions(target).find((entry) => entry.id === "fanaticalFocus");
  if (!success && target.subclassId === "zealot" && (target.level ?? 1) >= 6 && fanaticalFocus && (target.abilityUses?.fanaticalFocus ?? 0) < abilityMaxUses(target, fanaticalFocus)) {
    const rerollResult = rollD20ForFighter(target);
    const rerollTotal = rerollResult.roll + bonus;
    target.abilityUses = { ...(target.abilityUses ?? {}), fanaticalFocus: (target.abilityUses?.fanaticalFocus ?? 0) + 1 };
    total = rerollTotal;
    success = total >= dc;
    addLog(`${target.name}'s Fanatical Focus rerolls the save: ${rerollResult.roll} ${abilityLabel(bonus)} = ${total}.`, "important");
  }
  recordD20OutcomeForFighter(target, success);
  return { ability, roll, rolls: rollResult.rolls, rawRolls: rollResult.rawRolls, rollResult, bonus, proficiency, statusBonus, auraBonus, total, success, indomitable };
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
    if (save.indomitable) addLog(`${target.name} uses Indomitable and rerolls ${save.indomitable.roll}.`, "important");
    const rollText = save.indomitable ? `${save.roll} -> ${save.indomitable.roll}` : save.roll;
    addLog(`${target.name} rolls ${ability.toUpperCase()} save: ${rollText} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
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
  if (!save.success) {
    const candidate = partyHeroes().find((hero) => {
      const ability = reactionAbility(hero, "bendLuck");
      return hero.id !== target.id && heroCanAct(hero) && hasReactionAvailable(hero) && canSpendCombatAbility(hero, ability) && distance(hero.position, target.position) <= 12;
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
  addLog(`${target.name} rolls ${ability.toUpperCase()} save: ${rollText} ${abilityLabel(save.bonus)} = ${save.total} vs DC ${dc}${save.success ? " (success)" : " (failure)"}.`, save.success ? "" : "important");
  addAdminLog(`${target.name} ${ability.toUpperCase()} save breakdown: ${d20RollDetail(save.rollResult)} + ability ${abilityLabel(abilityMod(target, ability))}${save.proficiency ? ` + proficiency ${save.proficiency}` : ""}${save.statusBonus ? ` + status ${save.statusBonus}` : ""}${save.auraBonus ? ` + aura ${save.auraBonus}` : ""}${save.indomitable ? `; Indomitable ${d20RollDetail(save.indomitable.rollResult)} => ${save.indomitable.total}` : ""} = ${save.total} vs DC ${dc}.`);
  return save;
}

function applyStatusEffect(target, effect) {
  effect = prepareTimedEffect(effect);
  target.statusEffects = (target.statusEffects ?? []).filter((entry) => entry.id !== effect.id);
  target.statusEffects.push(effect);
  refreshDerivedStats(target);
  if (effect.tempHp) {
    target.temporaryHp = Math.max(target.temporaryHp ?? 0, effect.tempHp);
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
  const previousElementalAdept = target.incomingElementalAdeptTypes;
  if (fighterHasFeat(source, "elemental-adept")) target.incomingElementalAdeptTypes = featChoiceValue(source, "elemental-adept", "elementalAdeptTypes") ?? [];
  const modified = calculateDamageModifiers(target, damage, type);
  target.incomingElementalAdeptTypes = previousElementalAdept;
  applyDamageToFighter(target, modified.damage);
  const note = modified.reason ? ` ${target.name} is ${modified.reason} to ${type} damage.` : "";
  addLog(`${source.name}'s ${label} deals ${modified.damage} ${type} damage to ${target.name}.${note}`, "damage");
  if (modified.damage !== damage || modified.reason) addAdminLog(`Damage modifier: ${target.name} incoming ${damage} ${type}, final ${modified.damage}${modified.reason ? ` (${modified.reason})` : ""}.`);
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
  if (!heroCanAct(caster) || !spell || !canPaySpellCost(caster, spell)) return false;
  if (spell.metamagic?.id && !canSpendMetamagic(caster, spell, metamagicAbilityForSpell(caster, spell.metamagic.id))) return false;
  if (isWildShaped(caster) && (caster.level ?? 1) < 18) return false;
  if (spell.id === "dragonborn-breath" && (caster.abilityUses?.dragonbornBreath ?? 0) >= 1) return false;
  if (spell.racialAbilityId) {
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

function spendSpellResources(caster, spell) {
  if (spell.concentration) startConcentration(caster, spell);
  if (spell.id === "dragonborn-breath") {
    caster.abilityUses = { ...(caster.abilityUses ?? {}), dragonbornBreath: 1 };
  }
  if (spell.racialAbilityId) {
    caster.abilityUses = { ...(caster.abilityUses ?? {}), [spell.racialAbilityId]: (caster.abilityUses?.[spell.racialAbilityId] ?? 0) + 1 };
  }
  const cost = spellPointCost(spell);
  if (cost > 0) {
    caster.spellPoints = Math.max(0, (caster.spellPoints ?? 0) - cost);
    addLog(`${caster.name} spends ${cost} SP on ${spell.name} (spell level ${spellCastLevel(spell)}).`, "important");
  }
  spendMetamagic(caster, spell);
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
  return base + (spell?.metamagic?.extraTarget ?? 0) + Math.max(0, spellCastLevel(spell) - spellBaseLevel(spell)) * (spell?.upcast?.targetsPerLevel ?? 0);
}

function currentPendingSpellTargeting() {
  if (!pendingSpellTargeting) return null;
  const caster = state.fighters[pendingSpellTargeting.casterId];
  const spell = getContentDefinition("spells", pendingSpellTargeting.spellId);
  let castSpell = spell ? spellWithCastLevel(spell, pendingSpellTargeting.castLevel) : null;
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
  const durationSeconds = durationSecondsFromDefinition(spell.duration ?? { durationRounds });
  const area = {
    id: `${spell.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    spellId: spell.id,
    spellName: spell.name,
    casterId: caster.id,
    concentrationId: spell.concentration ? concentrationId(caster) : null,
    position: { ...position },
    castLevel: spellCastLevel(spell),
    durationRounds,
    durationSeconds,
    expiresAtDungeonTimeSeconds: dungeonElapsedSeconds({ sync: false }) + durationSeconds,
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
  expireTimedSpellAreas();
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
    metamagicId: spell.metamagic?.id ?? null,
    mode,
    hoverPosition: mode === "target" ? spellTargetsFor(caster, spell)[0]?.position ?? null : caster.position,
  };
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
      pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), metamagicId: spell.metamagic?.id ?? null, mode, hoverPosition: position };
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
      pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), metamagicId: spell.metamagic?.id ?? null, mode, hoverPosition: position };
      render();
      return true;
    }
    await castSpellInDirection(caster, spell, direction);
    return true;
  }
  const target = fighterAtPosition(position);
  if (!isValidSpellTarget(caster, spell, target)) {
    pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), metamagicId: spell.metamagic?.id ?? null, mode, hoverPosition: position };
    addLog(`That is not a valid target for ${spell.name}.`, "important");
    render();
    return true;
  }
  const targetCount = Math.min(spellTargetCount(spell), spellTargetsFor(caster, spell).length);
  if (targetCount > 1) {
    pendingMultiTargetSpell = pendingMultiTargetSpell ?? { targetIds: [] };
    if (!pendingMultiTargetSpell.targetIds.includes(target.id)) pendingMultiTargetSpell.targetIds.push(target.id);
    if (pendingMultiTargetSpell.targetIds.length < targetCount) {
      pendingSpellTargeting = { casterId: caster.id, spellId: spell.id, castLevel: spellCastLevel(spell), metamagicId: spell.metamagic?.id ?? null, mode, hoverPosition: position };
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

async function applySpellDamage(caster, target, spell) {
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
      return;
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
  if (raw <= 0) return;
  applySpecialDamage(caster, target, raw, spell.effect.type ?? "force", spell.name);
  if (spell.effect?.status && (!save || !save.success)) await applySpellStatus(caster, target, spell, { skipSave: true });
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

async function applySpellAttack(caster, target, spell) {
  const rollResult = rollD20ForFighter(caster);
  const criticalResult = resolveMonsterHeroCritical(caster, target, rollResult.roll);
  const roll = criticalResult.attackRoll;
  const bonus = spellAttackBonus(caster, spell);
  const total = roll + bonus;
  const targetAc = armorClass(target);
  addLog(`${caster.name} casts ${spell.name}: spell attack ${roll} ${abilityLabel(bonus)} = ${total} vs AC ${targetAc}.${criticalResult.note ? ` ${criticalResult.note}` : ""}`, "important");
  addAdminLog(`${caster.name} spell attack breakdown vs ${target.name}: ${d20RollDetail(rollResult)}${criticalResult.attackRoll !== rollResult.roll ? ` -> Karmic outcome d20 ${roll}` : ""} + spell attack ${abilityLabel(bonus)} = ${total}; target AC ${targetAc}${criticalResult.note ? `; ${criticalResult.note}` : ""}.`);
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
  if (!movementWalkableFor(target).has(positionKey(destination))) return false;
  if (!canTraverseMovementEdge(target, target.position, destination, [])) return false;
  if (window.DungeonGrid.isOccupied(destination, state.fighters, target)) return false;
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
  const rollResult = rollD20ForFighter(caster, { advantage: devilSightAdvantage || witchSightAdvantage });
  const criticalResult = resolveMonsterHeroCritical(caster, target, rollResult.roll);
  const roll = criticalResult.attackRoll;
  const bonus = spellAttackBonus(caster);
  const total = roll + bonus;
  const targetAc = armorClass(target);
  addLog(`${caster.name}'s Eldritch Blast beam ${beamIndex}/${beamCount}${devilSightAdvantage ? " with Devil's Sight" : witchSightAdvantage ? " with Witch Sight" : ""}: spell attack ${roll} ${abilityLabel(bonus)} = ${total} vs AC ${targetAc}.${criticalResult.note ? ` ${criticalResult.note}` : ""}`, "important");
  addAdminLog(`${caster.name} Eldritch Blast beam ${beamIndex}/${beamCount} breakdown: ${d20RollDetail(rollResult)}${criticalResult.attackRoll !== rollResult.roll ? ` -> Karmic outcome d20 ${roll}` : ""} + spell attack ${abilityLabel(bonus)} = ${total}; target AC ${targetAc}${criticalResult.note ? `; ${criticalResult.note}` : ""}.`);
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
  if (effect.id === "spare-the-dying" && isPartyHeroId(target.id) && target.hp <= 0) {
    markFighterStableAtZero(target);
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
      triggerMonsterDeathStory(target);
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
  spendSpellResources(caster, spell);
  const targets = breathTemplateTargets(caster, direction, spell);
  addLog(`${caster.name} casts ${spell.name} at spell level ${spellCastLevel(spell)} for ${spellPointCost(spell)} SP ${direction}.`, "important");
  for (const target of targets) {
    const wasAlive = target.alive;
    if (spell.effect?.kind === "damage") await applySpellDamage(caster, target, spell);
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

function pushTargetAway(source, target) {
  const destination = shovePushDestination(source, target);
  if (!canPushTargetToPosition(source, target, destination)) {
    addLog(`${target.name} cannot be pushed farther away from ${source.name}.`, "important");
    return false;
  }
  target.position = destination;
  triggerTrapAtPosition(target, destination);
  addLog(`${source.name} pushes ${target.name} 5 ft away.`, "important");
  return true;
}

function pullTargetToward(source, target) {
  const dx = Math.sign(source.position.x - target.position.x);
  const dy = Math.sign(source.position.y - target.position.y);
  if (!dx && !dy) return false;
  const candidates = [
    { x: target.position.x + dx, y: target.position.y + dy },
    dx ? { x: target.position.x + dx, y: target.position.y } : null,
    dy ? { x: target.position.x, y: target.position.y + dy } : null,
  ].filter(Boolean);
  const destination = candidates.find((position) => canPushTargetToPosition(source, target, position));
  if (!destination) {
    addLog(`${target.name} cannot be pulled closer to ${source.name}.`, "important");
    return false;
  }
  target.position = destination;
  triggerTrapAtPosition(target, destination);
  addLog(`${source.name} pulls ${target.name} 5 ft closer.`, "important");
  return true;
}

async function applyMonsterOnHitSpecials(monster, target, baseDamage, critical) {
  if (!target.alive) return;
  const names = monsterSpecialNames(monster);
  if (!names.length || !shouldUseMonsterSpecial("onHit")) return;
  const normalized = names.join(" | ");
  const dc = monsterSpecialDc(monster);

  if (/venom|poison|sickening|claw fever|deep venom|infernal sting|rotting tendrils|wyrmwood sap/i.test(normalized)) {
    const label = /infernal sting/i.test(normalized) ? "infernal sting" : "venom";
    const save = await rollSavingThrow(target, "con", dc, `${monster.name}'s ${label} forces ${target.name} to make a CON save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, /infernal sting/i.test(normalized) ? 4 : critical ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "poison", label);
      if (/sickening|claw fever/i.test(normalized)) {
        applyStatusEffect(target, { id: "sickened", label: "Sickened", attackBonus: -1, expiresAtEndOfTurn: true });
      }
      if (/wyrmwood sap/i.test(normalized)) {
        applyStatusEffect(target, { id: "sap-sickened", label: "Sap-Sickened", attackBonus: -1, expiresAtEndOfTurn: true });
      }
    }
  }

  if (/dread whisper|condemning mark|bone debt|marrow verdict/i.test(normalized)) {
    const save = await rollSavingThrow(target, "wis", dc, `${monster.name}'s dread presence forces ${target.name} to make a WIS save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: `dread-${monster.id}`, label: /condemning mark/i.test(normalized) ? "Condemned" : "Shaken", attackBonus: -1, expiresAtEndOfTurn: true });
      addLog(`${target.name}'s attacks are shaken until the end of their next turn.`, "important");
    }
  }

  if (/dust bite|dust cough|coal toss|black smoke cloud|smoke|smoke veil|sandblind ambush/i.test(normalized)) {
    const save = await rollSavingThrow(target, "con", dc, `${monster.name}'s choking dust forces ${target.name} to make a CON save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: "smoke-choked", label: "Smoke-Choked", attackBonus: -1, expiresAtEndOfTurn: true });
      addLog(`${target.name} coughs through grit and smoke until the end of their next turn.`, "important");
    }
  }

  if (/kindle|heated spear|melt armor|lava wake|ignite ground|white-hot beam|magma breath|boiling spray|scalding puff|burning guard|cinder crown/i.test(normalized)) {
    const save = await rollSavingThrow(target, "dex", dc, `${monster.name}'s burning strike forces ${target.name} to make a DEX save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, critical ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "fire", "Elemental Flame");
      if (/melt armor|white-hot beam/i.test(normalized)) applyStatusEffect(target, { id: "melted-armor", label: "Armor Melted", acBonus: -1, expiresAtEndOfTurn: true });
    }
  }

  if (/ash cough|choking grasp|suffocating rain|dead sky|airless bite|drying wind|silence of no air|thin air aura|mist choke|drowning mist/i.test(normalized)) {
    const save = await rollSavingThrow(target, "con", dc, `${monster.name}'s choking element forces ${target.name} to make a CON save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: "element-choked", label: "Choked", attackBonus: -1, speedBonusFeet: -5, expiresAtEndOfTurn: true });
      addLog(`${target.name} struggles for air until the end of their next turn.`, "important");
    }
  }

  if (/glass splinters|glasswind cut|razor pass|needle draft|needle spray|bleeding edge|shard pin|shatter spines|hailglass volley|aurora slash|prismatic lance|salt lash/i.test(normalized)) {
    const save = await rollSavingThrow(target, "dex", dc, `${monster.name}'s cutting element forces ${target.name} to make a DEX save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, critical ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "slashing", "Elemental Shards");
      if (/shard pin|hailglass volley|needle/i.test(normalized)) applyStatusEffect(target, { id: "pinned-shards", label: "Shard-Pinned", speedBonusFeet: -10, expiresAtEndOfTurn: true });
    }
  }

  if (/static bite|lightning lash|crackling pulse|queenly thunderbolt|stormlord descent|rod draw|lesser stormcall|thunderclap|choir blast/i.test(normalized)) {
    const save = await rollSavingThrow(target, "dex", dc, `${monster.name}'s storm strike forces ${target.name} to make a DEX save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, critical ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), /thunder|choir/i.test(normalized) ? "thunder" : "lightning", "Elemental Storm");
      target.hasReaction = false;
    }
  }

  if (/life drain|greater life drain|abyssal drain|astral reap|devour soul|unending appetite/i.test(normalized)) {
    const save = await rollSavingThrow(target, "con", dc, `${monster.name}'s life drain forces ${target.name} to make a CON save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, /greater|abyssal|astral|devour soul|unending appetite/i.test(normalized) ? 8 : 6);
      const roll = rollDice(dice.count, dice.sides);
      const dealt = applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "necrotic", "life drain");
      applyStatusEffect(target, { id: "drained", label: "Drained", speedBonusFeet: -5, expiresAtEndOfTurn: true });
      if (/abyssal drain|devour soul|unending appetite/i.test(normalized) && dealt > 0) {
        const healed = applyHealingToHero(monster, /devour soul|unending appetite/i.test(normalized) ? Math.ceil(dealt / 2) : dealt);
        if (healed > 0) addLog(`${monster.name} steals ${healed} HP from the draining wound.`, "heal");
      }
    }
  }

  if (/hellspines|stygian brand|hellbow pin|bone cage/i.test(normalized)) {
    const ability = /hellbow pin/i.test(normalized) ? "str" : "dex";
    const save = await rollSavingThrow(target, ability, dc, `${monster.name}'s pinning strike forces ${target.name} to make a ${ability.toUpperCase()} save.`);
    if (!save.success) {
      const speedPenalty = /stygian brand/i.test(normalized) ? -10 : -5;
      applyStatusEffect(target, { id: "pinned", label: "Pinned", speedBonusFeet: speedPenalty, speedLocked: /hellbow pin/i.test(normalized), expiresAtEndOfTurn: true });
      addLog(`${target.name}'s movement is hindered until the end of their next turn.`, "important");
    }
  }

  if (/ruin scratch|mind-pounce|mindrot sermon/i.test(normalized)) {
    const save = await rollSavingThrow(target, "wis", dc, `${monster.name}'s ruinous strike forces ${target.name} to make a WIS save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: "ruined-reactions", label: "Ruined", attackBonus: -1, expiresAtEndOfTurn: true });
      target.hasReaction = false;
      addLog(`${target.name}'s reaction is torn away until their next turn.`, "important");
    }
  }

  if (/needling malice|ruin hymn|mindrot cloud|corruptive sporulation/i.test(normalized)) {
    const save = await rollSavingThrow(target, "wis", dc, `${monster.name}'s malice forces ${target.name} to make a WIS save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: "maliced", label: "Maliced", saveBonus: -1, expiresAtEndOfTurn: true });
      addLog(`${target.name}'s next saves are weakened until the end of their next turn.`, "important");
    }
  }

  if (/blood scent|blood in the water|salt the wound|bite and tear|feeding frenzy|flesh verdict|engulfing mass|acid maw|thousand maws|devouring bloom/i.test(normalized) && (target.hp ?? 0) <= Math.ceil((target.maxHp ?? 1) / 2)) {
    const dice = specialDamageDice(monster, /flesh verdict/i.test(normalized) ? 8 : 6);
    const roll = rollDice(dice.count, dice.sides);
    const type = /flesh verdict|blood scent|devouring bloom/i.test(normalized) ? "necrotic" : /acid maw/i.test(normalized) ? "acid" : "slashing";
    const dealt = applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), type, "frenzy");
    if (/engulfing mass|devouring bloom/i.test(normalized) && dealt > 0) {
      const healed = applyHealingToHero(monster, Math.max(1, Math.floor(dealt / 2)));
      if (healed > 0) addLog(`${monster.name} feeds and regains ${healed} HP.`, "heal");
    }
  }

  if (/spectral chain|hooking chain|chain coil|living chains|dragging lash|hookcap pull|canopy snatch|luring scent|hook and drag|dragged into the teeth|drop the hook|tidal pull|pull under|baronial undertow|leviathan drag|burial pull/i.test(normalized)) {
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s chain forces ${target.name} to make a STR save.`);
    if (!save.success) {
      pullTargetToward(monster, target);
      if (/canopy snatch|dragged into the teeth|drop the hook|bone cage/i.test(normalized)) applyStatusEffect(target, { id: "restrained", label: "Restrained", speedLocked: true, attackBonus: -2, expiresAtEndOfTurn: true });
    }
  }

  if (/lightning whip/i.test(normalized)) {
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s lightning whip forces ${target.name} to make a STR save.`);
    if (!save.success) {
      const dice = specialDamageDice(monster, 8);
      const roll = rollDice(dice.count, dice.sides);
      applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), "lightning", "Lightning Whip");
      pullTargetToward(monster, target);
    }
  }

  if (/constricting coil|stranglehold|crushing claws|forest judgment|hoist prisoner|heated coil|living chain|cinder chain judgment|mud grip|clay bind|root lock|engulfing slide|coral snare|bone cage/i.test(normalized)) {
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s crushing claws force ${target.name} to make a STR save.`);
    if (!save.success) {
      applyStatusEffect(target, { id: "restrained", label: "Restrained", speedLocked: true, attackBonus: -2, expiresAtEndOfTurn: true });
    }
  }

  if (/crushing dominion/i.test(normalized)) {
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s crushing dominion forces ${target.name} to make a STR save.`);
    if (!save.success) {
      applyProneCondition(target, "crushing-dominion");
      pushTargetAway(monster, target);
    }
  }

  if (/crippling|hamstring|web|snare|dragging grasp|drowning grip|gear nip|grinding teeth|sleep poison bolt|ice slick|cold bite|frozen undertow|glacial advance|polar night|current guard/i.test(normalized)) {
    const ability = /web|snare/i.test(normalized) ? "dex" : "str";
    const save = await rollSavingThrow(target, ability, dc, `${monster.name}'s restraint forces ${target.name} to make a ${ability.toUpperCase()} save.`);
    if (!save.success) {
      if (/hamstring|crippling|gear nip|grinding teeth|sleep poison bolt/i.test(normalized)) {
        applyStatusEffect(target, { id: "hamstrung", label: "Hamstrung", speedBonusFeet: -10, expiresAtEndOfTurn: true });
        addLog(`${target.name}'s speed is reduced by 10 ft until the end of their next turn.`, "important");
        if (/sleep poison bolt/i.test(normalized)) target.hasReaction = false;
      } else {
        applyStatusEffect(target, { id: "snared", label: "Snared", speedLocked: true, expiresAtEndOfTurn: true });
        addLog(`${target.name}'s movement is stopped until the end of their next turn.`, "important");
      }
    }
  }

  if (/charge|pounce|lunge|rush|swooping|stomp|slam|burning dive|impaling advance|world-stamp|rift charge|siege charge|falling star dive|brittle dash|falling fronds|pouncing vines|briar slam|four-season slam|minecart shove|lava step|support-beam breaker|quake fist|stone pounce|avalanche hammer|pillar fall|crater slam|faultline strike|magma fault|crushing deep|pressure crush|whitewater rush|mudslide rush|thunderhead crash|tyrant downburst|shattering charge/i.test(normalized) && (monster.lastMoveFeet ?? 0) >= monsterSpecialAbilityTuning.chargeMinFeet) {
    const dice = specialDamageDice(monster, critical ? 8 : 6);
    const roll = rollDice(dice.count, dice.sides);
    const type = /burning dive|falling star dive|lava step|magma fault/i.test(normalized) ? "fire" : /impaling advance/i.test(normalized) ? "piercing" : /rift charge/i.test(normalized) ? "force" : /thunderhead|downburst/i.test(normalized) ? "thunder" : "bludgeoning";
    applySpecialDamage(monster, target, Math.max(1, roll.total + dice.bonus), type, "charge");
    const save = await rollSavingThrow(target, "str", dc, `${monster.name}'s charge forces ${target.name} to make a STR save.`);
    if (!save.success && pushTargetAway(monster, target)) {
      addLog(`${target.name} is shoved back by ${monster.name}.`, "important");
    }
    if (/pouncing vines/i.test(normalized) && !save.success) applyProneCondition(target, "pouncing-vines");
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

async function tryMonsterAreaSpecial(monster, namePattern, label, damageType, saveAbility, rangeFeet, options = {}) {
  if (!hasMonsterSpecial(monster, namePattern) || !monster.hasAction || !shouldUseMonsterSpecial("active")) return false;
  const targets = targetsInMonsterSpecialRange(monster, rangeFeet);
  if (!targets.length) return false;
  if (await maybeUseSpellInterruptReaction(monster, label)) {
    monster.hasAction = false;
    addLog(`${monster.name}'s ${label} is interrupted before it takes hold.`, "important");
    return true;
  }
  monster.hasAction = false;
  const dc = monsterSpecialDc(monster);
  const dice = specialDamageDice(monster, namePattern.test("Fireball") ? 8 : 6);
  addLog(`${monster.name} uses ${label}.`, "important");
  for (const target of targets.slice(0, options.maxTargets ?? 3)) {
    const save = await rollSavingThrow(target, saveAbility, dc, `${monster.name}'s ${label} forces ${target.name} to make a ${saveAbility.toUpperCase()} save.`);
    const roll = rollDice(dice.count, dice.sides);
    const raw = Math.max(1, roll.total + dice.bonus);
    const damage = saveAbility === "dex" ? evasionAdjustedDamage(target, save, raw) : save.success ? Math.floor(raw / 2) : raw;
    if (save.success && damage > 0) addLog(`${target.name} takes half damage from ${label}.`);
    if (damage > 0) applySpecialDamage(monster, target, damage, damageType, label);
    if (!save.success && options.onFailStatus) {
      applyStatusEffect(target, typeof options.onFailStatus === "function" ? options.onFailStatus(target, monster) : { ...options.onFailStatus });
    }
    if (!save.success && options.pullTargets) pullTargetToward(monster, target);
    if (!save.success && options.pushTargets) pushTargetAway(monster, target);
    if (!target.alive) handleHeroDeath();
  }
  return true;
}

async function tryMonsterStatusSpecial(monster, namePattern, label, saveAbility, rangeFeet, statusFactory, options = {}) {
  if (!hasMonsterSpecial(monster, namePattern) || !monster.hasAction || !shouldUseMonsterSpecial("active")) return false;
  const targets = targetsInMonsterSpecialRange(monster, rangeFeet);
  if (!targets.length) return false;
  if (await maybeUseSpellInterruptReaction(monster, label)) {
    monster.hasAction = false;
    addLog(`${monster.name}'s ${label} is interrupted before it takes hold.`, "important");
    return true;
  }
  monster.hasAction = false;
  const dc = monsterSpecialDc(monster);
  addLog(`${monster.name} uses ${label}.`, "important");
  for (const target of targets.slice(0, options.maxTargets ?? 1)) {
    const save = await rollSavingThrow(target, saveAbility, dc, `${monster.name}'s ${label} forces ${target.name} to make a ${saveAbility.toUpperCase()} save.`);
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
    return canSpendCombatAbility(hero, ability) && distance(hero.position, monster.position) <= 12;
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

  if (hasMonsterSpecial(monster, /selfheal/i) && !monster.usedSpecials.SelfHeal && monster.hp <= monster.maxHp / 2 && shouldUseMonsterSpecial("defensive")) {
    const heal = rollDice(1, 6).total + monsterCategory(monster);
    monster.hp = Math.min(monster.maxHp, monster.hp + heal);
    monster.usedSpecials.SelfHeal = true;
    addLog(`${monster.name} uses Self Heal and recovers ${heal} HP.`, "heal");
    render();
    return false;
  }

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
    for (const ally of combatMonsters().filter((candidate) => candidate.id !== monster.id && candidate.tags?.includes("plant") && distance(candidate.position, monster.position) <= 3)) {
      applyStatusEffect(ally, { id: "spore-rapport", label: "Spore Rapport", attackBonus: 1, expiresAtEndOfTurn: true });
    }
  }

  if (hasMonsterSpecial(monster, /phalanx of flame/i)) {
    const adjacentFiend = combatMonsters().some((ally) => ally.id !== monster.id && ally.tags?.includes("fiend") && distance(ally.position, monster.position) <= 1);
    if (adjacentFiend) applyStatusEffect(monster, { id: "phalanx-of-flame", label: "Phalanx", acBonus: 1, attackBonus: 1, expiresAtEndOfTurn: true });
  }

  if (hasMonsterSpecial(monster, /bark orders|mine lord's edict|stoke the furnace|forgeheart pulse|royal furnace oath|heart of ore and flame|command the dead|carrion crown command|imperial corpse decree|unburied retinue|lockstep/i)) {
    const allyTags = monster.tags ?? [];
    const bonusIsFire = hasMonsterSpecial(monster, /stoke the furnace|forgeheart pulse|heart of ore and flame/i);
    const bonusIsUndead = hasMonsterSpecial(monster, /command the dead|carrion crown command|imperial corpse decree|unburied retinue|lockstep/i);
    for (const ally of combatMonsters().filter((candidate) => candidate.id !== monster.id && candidate.alive && distance(candidate.position, monster.position) <= 3)) {
      const sharesTheme = (candidate.tags ?? []).some((tag) => allyTags.includes(tag) && ["embervein-deepworks", "embervein", "deepworks", "forge", "mine", "fire", "gear"].includes(tag));
      const sharesUndead = bonusIsUndead && (candidate.tags ?? []).some((tag) => ["undead", "skeletal", "zombie"].includes(tag));
      if (!sharesTheme && !sharesUndead) continue;
      applyStatusEffect(ally, { id: bonusIsFire ? "forge-stoked" : bonusIsUndead ? "death-commanded" : "ordered", label: bonusIsFire ? "Stoked" : bonusIsUndead ? "Commanded" : "Ordered", attackBonus: 1, expiresAtEndOfTurn: true });
    }
  }

  if (hasMonsterSpecial(monster, /mass grave mortar|corpse cart spill/i) && !monster.usedSpecials.GraveMortar && shouldUseMonsterSpecial("active")) {
    const targets = targetsInMonsterSpecialRange(monster, monsterSpecialAbilityTuning.rangedSpecialFeet).slice(0, 2);
    if (targets.length) {
      monster.usedSpecials.GraveMortar = true;
      for (const target of targets) {
        const save = await rollSavingThrow(target, "dex", monsterSpecialDc(monster), `${monster.name}'s corpse barrage forces ${target.name} to make a DEX save.`);
        const dice = specialDamageDice(monster, 8);
        const roll = rollDice(dice.count, dice.sides);
        applySpecialDamage(monster, target, Math.max(1, Math.floor((roll.total + dice.bonus) / (save.success ? 2 : 1))), /mortar/i.test(monsterSpecialNames(monster).join(" ")) ? "bludgeoning" : "poison", "Corpse Barrage");
        if (!save.success) applyStatusEffect(target, { id: "nauseated", label: "Nauseated", attackBonus: -1, expiresAtEndOfTurn: true });
      }
      monster.hasAction = false;
      render();
      return true;
    }
  }

  if (hasMonsterSpecial(monster, /rot stench|nauseating bulk|carrion perfume/i)) {
    for (const target of monsterTargetableHeroes().filter((hero) => distance(hero.position, monster.position) <= 1)) {
      const save = await rollSavingThrow(target, "con", monsterSpecialDc(monster), `${monster.name}'s stench forces ${target.name} to make a CON save.`);
      if (!save.success) applyStatusEffect(target, { id: "nauseated", label: "Nauseated", attackBonus: -1, expiresAtEndOfTurn: true });
    }
  }

  if (hasMonsterSpecial(monster, /furnace aura|hellfire wings|filth aura|crown of thorns|molten trail|bright seam|ignition flood|wake the deepworks|heart of ore and flame/i)) {
    for (const target of monsterTargetableHeroes().filter((hero) => distance(hero.position, monster.position) <= 1)) {
      const dice = specialDamageDice(monster, 6);
      const roll = rollDice(dice.count, dice.sides);
      const isFilth = hasMonsterSpecial(monster, /filth aura/i);
      const isThorn = hasMonsterSpecial(monster, /crown of thorns/i);
      const label = isFilth ? "Filth Aura" : isThorn ? "Crown of Thorns" : hasMonsterSpecial(monster, /wake the deepworks/i) ? "Wake the Deepworks" : hasMonsterSpecial(monster, /heart of ore and flame/i) ? "Heart of Ore and Flame" : hasMonsterSpecial(monster, /ignition flood/i) ? "Ignition Flood" : hasMonsterSpecial(monster, /bright seam/i) ? "Bright Seam" : hasMonsterSpecial(monster, /molten trail/i) ? "Molten Trail" : hasMonsterSpecial(monster, /hellfire wings/i) ? "Hellfire Wings" : "Furnace Aura";
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
    for (const ally of combatMonsters().filter((candidate) => candidate.id !== monster.id && candidate.alive && distance(candidate.position, monster.position) <= 3)) {
      const sharesElement = (candidate.tags ?? []).some((tag) => allyTags.includes(tag) && ["elemental", "fire", "air", "earth", "water", "storm", "stone", "ice"].includes(tag));
      if (!sharesElement) continue;
      applyStatusEffect(ally, { id: "elemental-command", label: "Commanded", attackBonus: 1, expiresAtEndOfTurn: true });
    }
  }

  if (hasMonsterSpecial(monster, /high tempest aura|thin air aura|maelstrom aura|buried city aura/i)) {
    const type = hasMonsterSpecial(monster, /maelstrom/i) ? "cold" : hasMonsterSpecial(monster, /buried city/i) ? "bludgeoning" : "thunder";
    for (const target of monsterTargetableHeroes().filter((hero) => distance(hero.position, monster.position) <= 1)) {
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
  if (await tryMonsterAreaSpecial(monster, /dust spin|thunderclap|crackling pulse|pressure rift|choir blast|tempest choir|split the heavens|starstorm fall|city-eater winds|neverending storm|cathedral winds|regent stormfall|tyrant downburst|queenly thunderbolt|baronial cyclone|breath of the plane|worldstorm body/i, "Elemental Storm Burst", /lightning|starstorm|crackling|queenly/i.test(monsterSpecialNames(monster).join(" ")) ? "lightning" : "thunder", "con", monsterSpecialAbilityTuning.burstRangeFeet, {
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
  if (await tryMonsterAreaSpecial(monster, /coal toss|soot breath|furnace vent|valve twist|throw keg|molten slag breath|lava breath|anvil breath/i, "Forge Burst", "fire", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "scorched", label: "Scorched", acBonus: -1, expiresAtEndOfTurn: true },
    pushTargets: /throw keg|furnace vent|valve twist|anvil breath/i.test(monsterSpecialNames(monster).join(" ")),
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /cave-in groan|drop the hook|anvil drop|colossus hammerfall|support-beam breaker/i, "Crushing Machinery", "bludgeoning", "str", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "shaken", label: "Shaken", attackBonus: -1, expiresAtEndOfTurn: true },
    pushTargets: true,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /pressure release|overpressure burst|valve lock/i, "Pressure Burst", "thunder", "con", monsterSpecialAbilityTuning.burstRangeFeet, {
    onFailStatus: { id: "deafened", label: "Deafened", attackBonus: -1, expiresAtEndOfTurn: true },
    pushTargets: true,
  })) return true;
  if (await tryMonsterAreaSpecial(monster, /grinding floor|grinding teeth|dragged into the teeth/i, "Grinding Teeth", "slashing", "dex", monsterSpecialAbilityTuning.burstRangeFeet, {
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
  window.setTimeout(() => {
    const current = activeFighter();
    const visibleDialogOpen = Boolean(els.gameDialog && !els.gameDialog.classList.contains("hidden"));
    const reactionPromptOpen = Boolean(document.querySelector(".reaction-prompt"));
    if (!current || current.id !== activeMonsterId || isPlayerControlledPartyFighter(current) || visibleDialogOpen || reactionPromptOpen || partyDefeatedOrDying()) return;
    addLog(`${current.name}'s turn stalled before acting, so combat advances.`, "important");
    window.DepthboundPlaytest?.syncNow?.();
    endTurn();
  }, Math.max(6500, tokenSlideMs * 14));
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
      current.nextAiDecisionAt = performance.now() + monsterAiDecisionIntervalMs;
      pathfindingJobsThisTurn = 0;
      perfStats.aiUpdates += 1;
      const activeMonsterId = current.id;
      window.setTimeout(() => {
        const stillActive = activeFighter()?.id === activeMonsterId;
        const visibleDialogOpen = Boolean(els.gameDialog && !els.gameDialog.classList.contains("hidden"));
        const reactionPromptOpen = Boolean(document.querySelector(".reaction-prompt"));
        if (!stillActive || visibleDialogOpen || reactionPromptOpen || partyDefeatedOrDying()) return;
        addLog(`${current.name}'s turn stalled, so combat advances.`, "important");
        window.DepthboundPlaytest?.syncNow?.();
        endTurn();
      }, Math.max(5000, tokenSlideMs * 12));
      Promise.resolve()
        .then(() => runMonsterAi(current))
        .catch((error) => {
          console.error(error);
          if (activeFighter()?.id !== activeMonsterId) return;
          addLog(`${current.name}'s turn could not resolve and is skipped.`, "important");
          window.DepthboundPlaytest?.syncNow?.();
          endTurn();
        });
    } else {
      addAdminLog(`Monster AI timer found no monster: active ${current?.name ?? "none"}.`);
    }
  }, delay);
}

