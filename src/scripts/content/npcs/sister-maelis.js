const sisterMaelisNpcId = "sister-maelis";
let sisterMaelisPendingCardVoiceIds = [];
let sisterMaelisActiveAnswer = null;
let sisterMaelisChatStack = [];
let sisterMaelisCurrentBranch = "";
let sisterMaelisBranchOptionPage = 0;
let sisterMaelisSpeakerHeroId = "";

function sisterMaelisNpc() {
  return window.DungeonContent.get("npcs", sisterMaelisNpcId) ?? {
    id: sisterMaelisNpcId,
    name: "Sister Maelis",
    title: "Keeper of the Graveyard",
    portrait: "assets/tokens/Sister_Maelis.png",
    token: { fallbackLabel: "SM" },
  };
}

function sisterMaelisChatData() {
  return window.DungeonNpcChats?.maelis ?? { hubChoices: [], idleLines: [], stateVariants: [], nodes: {} };
}

function sisterMaelisClassHeroes() {
  return (state?.party?.heroIds?.length ? state.party.heroIds : ["hero"])
    .map((id) => state?.fighters?.[id])
    .filter((hero) => hero && !hero.dead && (typeof isClassHero !== "function" || isClassHero(hero)) && !(typeof isAutonomousAlly === "function" && isAutonomousAlly(hero)));
}

function sisterMaelisDefaultSpeakerId() {
  const activeId = state?.party?.activeHeroId;
  if (sisterMaelisClassHeroes().some((hero) => hero.id === activeId)) return activeId;
  return sisterMaelisClassHeroes()[0]?.id ?? "hero";
}

function sisterMaelisSpeakerId() {
  if (sisterMaelisClassHeroes().some((hero) => hero.id === sisterMaelisSpeakerHeroId)) return sisterMaelisSpeakerHeroId;
  sisterMaelisSpeakerHeroId = sisterMaelisDefaultSpeakerId();
  return sisterMaelisSpeakerHeroId;
}

function sisterMaelisSpeakerName() {
  return state?.fighters?.[sisterMaelisSpeakerId()]?.name ?? "You";
}

function sisterMaelisRelationship() {
  return window.DepthboundNpcRelationships?.get?.(sisterMaelisNpcId, sisterMaelisSpeakerId()) ?? {
    heroId: sisterMaelisSpeakerId(),
    heroName: sisterMaelisSpeakerName(),
    friendship: 0,
    chemistry: 0,
    level: "Stranger",
    friendshipReady: false,
    romanceReady: false,
  };
}

function sisterMaelisRelationshipMarkup() {
  const rel = sisterMaelisRelationship();
  const friendshipTargets = { Stranger: 5, Familiar: 15, Trusted: 25, Close: 40, Dear: Math.max(40, rel.friendship || 0) };
  const nextTarget = friendshipTargets[rel.level] ?? Math.max(1, (rel.friendship || 0) + 1);
  const filled = rel.level === "Dear" ? 100 : Math.min(100, Math.max(0, ((rel.friendship || 0) / Math.max(1, nextTarget)) * 100));
  const chemistryFilled = Math.min(100, Math.max(0, ((rel.chemistry || 0) / 5) * 100));
  const pathNote = rel.romanceReady ? "Romance path ready" : rel.friendshipReady ? "Friendship path ready" : `${rel.heroName ?? sisterMaelisSpeakerName()} speaking`;
  return `
    <div class="npc-relationship-meter">
      <div class="npc-relationship-header">
        <span>Friendship</span>
        <b>${escapeHtml(rel.level ?? "Stranger")}</b>
      </div>
      <div class="npc-relationship-track" aria-hidden="true"><i style="width: ${filled.toFixed(2)}%"></i></div>
      <small>${escapeHtml(`${rel.friendship ?? 0}${rel.level === "Dear" ? "+" : ` / ${nextTarget}`}`)}</small>
      <div class="npc-relationship-header secondary">
        <span>Chemistry</span>
      <b>${escapeHtml(rel.chemistry ?? 0)}</b>
      </div>
      <div class="npc-relationship-track chemistry" aria-hidden="true"><i style="width: ${chemistryFilled.toFixed(2)}%"></i></div>
      <small>${escapeHtml(pathNote)}</small>
      ${sisterMaelisAdminRelationshipControlsMarkup(rel)}
    </div>
  `;
}

function sisterMaelisAdminRelationshipControlsMarkup(rel) {
  if (!adminEnabled?.()) return "";
  const heroId = rel.heroId ?? sisterMaelisSpeakerId();
  const button = (field, delta, label) =>
    `<button type="button" data-action="admin-npc-relationship" data-npc="${sisterMaelisNpcId}" data-hero="${escapeAttribute(heroId)}" data-field="${escapeAttribute(field)}" data-delta="${escapeAttribute(delta)}">${escapeHtml(label)}</button>`;
  return `
    <div class="npc-relationship-admin">
      <b>Admin</b>
      <span>Friendship ${escapeHtml(rel.friendship ?? 0)}</span>
      <div>${button("friendship", -5, "-5")}${button("friendship", -1, "-1")}${button("friendship", 1, "+1")}${button("friendship", 5, "+5")}</div>
      <span>Chemistry ${escapeHtml(rel.chemistry ?? 0)}</span>
      <div>${button("chemistry", -5, "-5")}${button("chemistry", -1, "-1")}${button("chemistry", 1, "+1")}${button("chemistry", 5, "+5")}</div>
    </div>
  `;
}

function sisterMaelisSpeakerSelectorMarkup() {
  const heroes = sisterMaelisClassHeroes();
  if (heroes.length <= 1) return "";
  const currentId = sisterMaelisSpeakerId();
  return `
    <div class="npc-chat-speaker">
      <span>Speaking as</span>
      <div>
        ${heroes
          .map(
            (hero) => `
              <button
                type="button"
                class="${hero.id === currentId ? "active" : ""}"
                data-action="npc-chat-speaker"
                data-npc="${sisterMaelisNpcId}"
                data-hero="${escapeAttribute(hero.id)}"
              >${escapeHtml(hero.name ?? "Hero")}</button>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

function sisterMaelisNodeVoiceId(nodeId = "", lineIndex = 0) {
  return `maelis.node.${slugVoicePart(nodeId)}.${String(lineIndex + 1).padStart(3, "0")}`;
}

function sisterMaelisStateVoiceId(nodeId = "", lineIndex = 0) {
  return `maelis.state.${slugVoicePart(nodeId)}.${String(lineIndex + 1).padStart(3, "0")}`;
}

function sisterMaelisVoiceIdForNodeLine(nodeId = "", lineIndex = 0) {
  return /^STATE_/i.test(String(nodeId)) ? sisterMaelisStateVoiceId(nodeId, lineIndex) : sisterMaelisNodeVoiceId(nodeId, lineIndex);
}

function sisterMaelisIdleVoiceId(index = 0) {
  return `maelis.idle.${String(index + 1).padStart(3, "0")}`;
}

function sisterMaelisBarrowProgress() {
  return Math.max(0, Math.floor(Number(state?.campaignProgress?.["barrow-crown"]) || 0));
}

function sisterMaelisFriendshipPoints() {
  return Math.max(0, Math.floor(Number(sisterMaelisRelationship().friendship) || 0));
}

const sisterMaelisProgressGates = {
  // D1: the robbed tomb, Orren, and the fact that the Crown is active.
  CROWN_01: 1,
  CROWN_02: 1,
  CROWN_03: 1,
  CROWN_04: 1,
  CROWN_05: 1,
  CROWN_11: 1,
  // D2/D3: enough evidence exists to discuss Crown-bound dead and stolen names.
  CROWN_06: 2,
  CROWN_08: 2,
  CROWN_10: 3,
  // D4: the Grave-Market has made the trade in the dead explicit.
  CROWN_09: 4,
  // D5: Lady Yseld and her guilt are now discovered.
  CROWN_07: 5,
  CROWN_12: 5,
  CROWN_14: 5,
  // D6: the Crown is close enough that Maelis will answer what to do with it.
  CROWN_13: 6,
  CROWN_15: 6,
  // D7: aftermath only makes sense once the finale is finished.
  CROWN_16: 7,
};

function sisterMaelisNodeUnlocked(nodeId = "") {
  const id = String(nodeId || "");
  if (
    !id ||
    id === "MAELIS_HUB" ||
    id === "MAELIS_TOPICS" ||
    id === "MAELIS_BACK" ||
    id === "MAELIS_MORE" ||
    id === "MAELIS_SERVICES" ||
    id === "MAELIS_GOODBYE" ||
    id === "MAELIS_CLOSE"
  )
    return true;
  const node = sisterMaelisNode(id);
  const requiredFriendship = Math.max(0, Math.floor(Number(node?.ifFriendshipAtLeast) || 0));
  if (requiredFriendship && sisterMaelisFriendshipPoints() < requiredFriendship) return false;
  const requiredProgress = sisterMaelisProgressGates[id] ?? 0;
  return sisterMaelisBarrowProgress() >= requiredProgress;
}

function sisterMaelisStateVariant() {
  const progress = sisterMaelisBarrowProgress();
  return sisterMaelisChatData().stateVariants
    ?.filter((entry) => progress >= (entry.progress ?? 0))
    .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0] ?? null;
}

function sisterMaelisRandomIdleLineData() {
  const lines = sisterMaelisChatData().idleLines ?? [];
  if (!lines.length) return { text: npcEntryLine(sisterMaelisNpc()), voiceIds: [] };
  const index = Math.floor(Math.random() * lines.length);
  return { text: lines[index], voiceIds: [sisterMaelisIdleVoiceId(index)] };
}

function sisterMaelisGraveyardLineData() {
  state.questFlags ??= {};
  if (!state.questFlags.sisterMaelisGraveyardIntroSeen) {
    state.questFlags.sisterMaelisGraveyardIntroSeen = true;
    return {
      text: "You are standing in a graveyard, carrying weapons, wounds, and questions. That means you are either very lost, very brave, or already one of my regular problems. I am Sister Maelis. Keeper of this yard, servant of Naevra, and the person who will be very cross if you die somewhere I cannot find the body.",
      voiceIds: [sisterMaelisNodeVoiceId("MAELIS_GREETING_FIRST", 2)],
    };
  }
  return sisterMaelisRandomIdleLineData();
}

function sisterMaelisCardMarkup() {
  const maelis = sisterMaelisNpc();
  const variant = sisterMaelisStateVariant();
  const line = sisterMaelisGraveyardLineData();
  sisterMaelisPendingCardVoiceIds = line.voiceIds ?? [];
  return `
    <section class="npc-card maelis-graveyard-card">
      ${npcPortraitMarkup(maelis)}
      <div class="maelis-card-copy">
        <b>${escapeHtml(maelis.name ?? "Sister Maelis")}</b>
        <span>${escapeHtml(maelis.title ?? "Keeper of the Graveyard")}</span>
        <p>${escapeHtml(line.text || "Back again. Good. I prefer repeat visitors when they are still breathing.")}</p>
        ${variant?.addOn ? `<p class="maelis-state-line">${escapeHtml(variant.addOn)}</p>` : ""}
      </div>
      <div class="maelis-card-actions">
        <button type="button" data-action="start-npc-chat" data-npc="${sisterMaelisNpcId}" data-chat-state="MAELIS_HUB">Have a chat with Sister Maelis</button>
        <button type="button" class="ghost-button" data-action="start-npc-chat" data-npc="${sisterMaelisNpcId}" data-chat-state="MAELIS_SERVICES">Ask About Services</button>
      </div>
    </section>
  `;
}

function renderGraveyardMenu() {
  if (typeof stopDungeonVoiceLine === "function") stopDungeonVoiceLine();
  els.villageMenu?.classList.remove("npc-chat-open", "maelis-chat-open", "guild-open", "village-index-open");
  setVillageBackButtonVisible(true);
  setVillageMusicKey("");
  const dead = deadRosterHeroes();
  els.villageBody.innerHTML = `
    ${sisterMaelisCardMarkup()}
    ${sisterMaelisFriendshipQuestRowsMarkup()}
    <p class="empty-note">Dead companions can be preserved, looted, or restored here once their body has been sent home.</p>
    <section class="graveyard-list">
      ${dead.length ? dead.map(graveyardCorpseMarkup).join("") : `<p class="empty-note">No dead companions are recorded.</p>`}
    </section>
  `;
  void playDungeonVoiceLineSequence(sisterMaelisPendingCardVoiceIds);
  resetVillageScroll();
}

const sisterMaelisTopicGroups = [
  { title: "Faith & Naevra", ids: ["FAITH_01", "NAEVRA_01", "MYTH_01"] },
  { title: "The Graveyard", ids: ["GRAVEYARD_01", "REVIVE_01"] },
  { title: "The Barrow Crown", ids: ["CROWN_01"] },
  { title: "Personal", ids: ["PERSONAL_01", "FLIRT_01"] },
  { title: "Trust", ids: ["TRUST_FAMILIAR_01", "TRUST_TRUSTED_01", "TRUST_CLOSE_01", "TRUST_DEAR_01"] },
  { title: "Services", ids: ["MAELIS_SERVICES"] },
];

function sisterMaelisNode(nodeId = "MAELIS_HUB") {
  if (nodeId === "MAELIS_GOODBYE") {
    return {
      id: "MAELIS_GOODBYE",
      player: "I should go.",
      lines: ["Then go alive, return named, and do not make extra work for me."],
      options: [],
    };
  }
  return sisterMaelisChatData().nodes?.[nodeId] ?? null;
}

const sisterMaelisQuestStateKey = "sisterMaelisFriendshipQuests";
const sisterMaelisQuestDefinitions = {
  "recover-names": {
    title: "Names From Old Places",
    description: "Maelis wants evidence of names from old graves, crypts, or restless dead.",
    requirements: [{ label: "Name-bearing grave relics or undead remains", requirement: { type: "component", tagsAny: ["undead", "crypt", "relic", "bone", "soul", "ghost"] }, quantity: 3 }],
    rewardCp: 5000,
    rewardItemId: "maelis-name-thread",
    friendship: 2,
    acceptedLog: "Sister Maelis asks the party to bring name-bearing grave relics or remains from old places.",
    completeLog: "Sister Maelis copies every mark, speaks a quiet prayer over the remains, and twists a small length of name-thread for the party.",
  },
  "little-bell": {
    title: "Little Bell",
    description: "Maelis is searching for a child's lost trace: a small bell, soul echo, or grave relic that can restore a name.",
    requirements: [{ label: "Childlike bell, soul echo, or grave relic", requirement: { type: "component", tagsAny: ["bell", "soul", "ghost", "spirit", "relic", "wax", "crypt"] }, quantity: 2 }],
    rewardCp: 10000,
    rewardItemId: "maelis-ledger-bell",
    friendship: 3,
    acceptedLog: "Sister Maelis opens a ledger to the line marked Little Bell and asks the party to bring anything that might restore the child's name.",
    completeLog: "Sister Maelis does not smile when the bell is found, but her hand stops shaking when she writes the recovered name.",
  },
  "faith-cost": {
    title: "Weatherproof Names",
    description: "Maelis needs wax, thread or cloth, and clean ash for records that survive rain, fear, and bad burial.",
    requirements: [
      { label: "Grave wax or relic stock", requirement: { type: "component", tagsAny: ["wax", "relic", "crypt", "magic-reagent"] }, quantity: 2 },
      { label: "Thread, cloth, or repair material", requirement: { type: "component", tagsAny: ["thread", "cloth", "crafting", "repair"] }, quantity: 2 },
      { label: "Clean ash or sacred fire residue", requirement: { type: "component", tagsAny: ["ash", "fire", "holy", "alchemy"] }, quantity: 1 },
    ],
    rewardCp: 15000,
    rewardItemId: "maelis-grave-ledger-seal",
    friendship: 4,
    acceptedLog: "Sister Maelis asks for materials that can keep names legible through rain, fear, and neglect.",
    completeLog: "Sister Maelis binds the records against weather and grief, then presses a grave-ledger seal into the party's keeping.",
  },
  "black-ribbon": {
    title: "The Black Ribbon Page",
    description: "Maelis will trust the party with a rare Naevran rite if they bring high-grade grave or soul materials for a lost page.",
    requirements: [
      { label: "High-grade grave or soul materials", requirement: { type: "component", tagsAny: ["soul", "relic", "crypt", "undead", "arcane-reagent", "magic-reagent"] }, quantity: 5 },
      { label: "Binding cloth, thread, or wax", requirement: { type: "component", tagsAny: ["cloth", "thread", "wax", "crafting"] }, quantity: 1 },
    ],
    rewardCp: 0,
    rewardItemId: "maelis-black-ribbon-rite",
    friendship: 5,
    acceptedLog: "Sister Maelis entrusts the party with the search for the black ribbon's lost page.",
    completeLog: "Sister Maelis ties the black ribbon around the restored page and teaches the party a graveyard rite most priests only read about.",
  },
};

const sisterMaelisActionQuestIds = {
  MAELIS_RECOVER_NAMES_ACCEPT: "recover-names",
  MAELIS_LITTLE_BELL_ACCEPT: "little-bell",
  MAELIS_FAITH_COST_ACCEPT: "faith-cost",
  MAELIS_BLACK_RIBBON_ACCEPT: "black-ribbon",
};

function sisterMaelisQuestRoot() {
  state.questFlags = { ...(state.questFlags ?? {}) };
  state.questFlags[sisterMaelisQuestStateKey] ??= {};
  return state.questFlags[sisterMaelisQuestStateKey];
}

function sisterMaelisQuestState(questId = "") {
  const root = sisterMaelisQuestRoot();
  root[questId] ??= { status: "available" };
  return root[questId];
}

function acceptSisterMaelisQuest(questId = "") {
  const def = sisterMaelisQuestDefinitions[questId];
  if (!def) return;
  const quest = sisterMaelisQuestState(questId);
  if (quest.status === "completed" || quest.status === "accepted") return;
  quest.status = "accepted";
  quest.acceptedAt = Date.now();
  addLog(def.acceptedLog, "important");
  renderQuestLogButton();
}

function sisterMaelisRunAction(actionId = "") {
  const questId = sisterMaelisActionQuestIds[actionId];
  if (questId) acceptSisterMaelisQuest(questId);
}

function sisterMaelisQuestRequirementProgress(entry) {
  return Math.min(Math.max(1, entry.quantity ?? 1), materialCountForRequirement(entry.requirement));
}

function sisterMaelisQuestReady(questId = "") {
  const def = sisterMaelisQuestDefinitions[questId];
  const quest = sisterMaelisQuestState(questId);
  if (!def || quest.status !== "accepted") return false;
  return (def.requirements ?? []).every((entry) => materialCountForRequirement(entry.requirement) >= Math.max(1, entry.quantity ?? 1));
}

function completeSisterMaelisQuest(questId = "") {
  const def = sisterMaelisQuestDefinitions[questId];
  const quest = sisterMaelisQuestState(questId);
  if (!def || quest.status !== "accepted" || !sisterMaelisQuestReady(questId)) return;
  for (const entry of def.requirements ?? []) {
    if (!consumeMaterialsForRequirement(entry.requirement, Math.max(1, entry.quantity ?? 1))) return;
  }
  quest.status = "completed";
  quest.completedAt = Date.now();
  if (def.rewardCp) addMoney(partyPurse(), def.rewardCp);
  if (def.rewardItemId) addItemToPartyInventory(createItemInstance(def.rewardItemId, "sister-maelis"), "sister-maelis-reward");
  window.DepthboundNpcRelationships?.add?.(sisterMaelisNpcId, def.friendship ?? 2, `quest:${sisterMaelisNpcId}:${questId}`, { heroId: sisterMaelisSpeakerId() });
  addLog(`${def.completeLog}${def.rewardCp ? ` Maelis pays ${priceText(def.rewardCp)}.` : ""}`, "important");
  render();
  renderGraveyardMenu();
  renderQuestLogButton();
}

function cancelSisterMaelisQuest(questId = "") {
  const quest = sisterMaelisQuestState(questId);
  if (quest.status !== "accepted") return false;
  quest.status = "available";
  quest.cancelledAt = Date.now();
  delete quest.acceptedAt;
  addLog("Sister Maelis's graveyard trust is no longer tracked.", "important");
  return true;
}

function sisterMaelisQuestLogEntries() {
  return Object.entries(sisterMaelisQuestDefinitions)
    .map(([questId, def]) => {
      const quest = sisterMaelisQuestState(questId);
      if (!["accepted", "completed"].includes(quest.status)) return null;
      const ready = quest.status === "accepted" && sisterMaelisQuestReady(questId);
      return {
        id: `sister-maelis-${questId}`,
        giver: "Sister Maelis",
        title: def.title,
        description: def.description,
        ready,
        completed: quest.status === "completed",
        cancelable: quest.status === "accepted",
        cancelType: "npc",
        npcId: sisterMaelisNpcId,
        questId,
        objectives: (def.requirements ?? []).map((entry) => ({
          label: entry.label,
          progress: sisterMaelisQuestRequirementProgress(entry),
          target: Math.max(1, entry.quantity ?? 1),
        })),
      };
    })
    .filter(Boolean);
}

function sisterMaelisFriendshipQuestRowsMarkup() {
  const rows = Object.entries(sisterMaelisQuestDefinitions)
    .map(([questId, def]) => {
      const quest = sisterMaelisQuestState(questId);
      if (!["accepted", "completed"].includes(quest.status)) return "";
      const ready = sisterMaelisQuestReady(questId);
      return `
        <article class="store-row ${ready ? "ready" : ""}">
          <div>
            <b>${escapeHtml(def.title)}</b>
            <span>${escapeHtml(def.description)}</span>
            ${(def.requirements ?? [])
              .map((entry) => {
                const target = Math.max(1, entry.quantity ?? 1);
                return `<small>${escapeHtml(entry.label)}: ${escapeHtml(Math.min(target, materialCountForRequirement(entry.requirement)))}/${escapeHtml(target)}</small>`;
              })
              .join("")}
          </div>
          ${
            quest.status === "completed"
              ? `<button type="button" disabled>Done</button>`
              : `<button type="button" data-action="complete-npc-quest" data-npc="${sisterMaelisNpcId}" data-quest="${escapeAttribute(questId)}" ${ready ? "" : "disabled"}>${ready ? "Hand In" : "Need Items"}</button>`
          }
        </article>
      `;
    })
    .join("");
  return rows ? `<section class="store-section"><h3>Maelis's Trusts</h3><div class="store-list">${rows}</div></section>` : "";
}

function sisterMaelisAcceptedQuestMarkup(actionId = "") {
  const questId = sisterMaelisActionQuestIds[actionId];
  const def = sisterMaelisQuestDefinitions[questId];
  if (!def) return "";
  return `<p class="maelis-service-note">Quest tracked: ${escapeHtml(def.title)}. Return to the graveyard records below when you have the materials.</p>`;
}

function sisterMaelisDialogueIsPersonal(nodeId = "") {
  const id = String(nodeId || "");
  return id.startsWith("PERSONAL_");
}

function sisterMaelisDialogueIsFlirt(nodeId = "") {
  return String(nodeId || "").startsWith("FLIRT_");
}

function sisterMaelisAwardDialogue(nodeId = "") {
  const id = String(nodeId || "");
  if (!id || id === "MAELIS_HUB" || id === "MAELIS_GOODBYE" || id === "MAELIS_SERVICES") return;
  const heroId = sisterMaelisSpeakerId();
  if (sisterMaelisDialogueIsFlirt(id)) {
    window.DepthboundNpcRelationships?.addFlirt?.(sisterMaelisNpcId, 1, `dialogue:${id}`, { heroId });
    return;
  }
  const key = sisterMaelisDialogueIsPersonal(id) ? "personal" : "general";
  const threshold = key === "personal" ? 5 : 10;
  state.npcRelationships ??= {};
  state.npcRelationships[sisterMaelisNpcId] ??= { heroes: {} };
  state.npcRelationships[sisterMaelisNpcId].heroes ??= {};
  state.npcRelationships[sisterMaelisNpcId].heroes[heroId] ??= { friendship: 0, flirt: 0, awarded: {}, dialogueCounts: { general: 0, personal: 0 } };
  const bucket = state.npcRelationships[sisterMaelisNpcId].heroes[heroId];
  if (!bucket) return;
  bucket.awarded ??= {};
  const source = `dialogue-question:${id}`;
  if (bucket.awarded[source]) return;
  bucket.awarded[source] = true;
  bucket.dialogueCounts ??= { general: 0, personal: 0 };
  bucket.dialogueProgress = bucket.dialogueProgress && typeof bucket.dialogueProgress === "object" ? bucket.dialogueProgress : {};
  bucket.dialogueProgress.general = Math.max(0, Math.floor(Number(bucket.dialogueProgress.general ?? ((bucket.dialogueCounts.general ?? 0) % 10)) || 0));
  bucket.dialogueProgress.personal = Math.max(0, Math.floor(Number(bucket.dialogueProgress.personal ?? ((bucket.dialogueCounts.personal ?? 0) % 5)) || 0));
  bucket.dialogueCounts[key] = Math.max(0, Math.floor(Number(bucket.dialogueCounts[key]) || 0)) + 1;
  bucket.dialogueProgress[key] += 1;
  if (bucket.dialogueProgress[key] >= threshold) {
    bucket.dialogueProgress[key] -= threshold;
    window.DepthboundNpcRelationships?.add?.(sisterMaelisNpcId, 1, `dialogue-${key}-milestone:${bucket.dialogueCounts[key]}`, { heroId });
  }
}

function sisterMaelisChoiceLabel(nodeId = "") {
  if (nodeId === "MAELIS_HUB") return "Ask something else.";
  if (nodeId === "MAELIS_TOPICS") return "Now, something else...";
  if (nodeId === "MAELIS_BACK") return "Wait, go back a moment.";
  if (nodeId === "MAELIS_MORE") return "I still have more questions about this.";
  if (nodeId === "MAELIS_SERVICES") return "I need your services.";
  if (nodeId === "MAELIS_GOODBYE") return "I should go.";
  const node = sisterMaelisNode(nodeId);
  return node?.player || node?.options?.[0]?.label || nodeId;
}

function sisterMaelisOptionButton(option, className = "") {
  if (option?.id === "MAELIS_BACK" || option?.id === "MAELIS_TOPICS" || option?.id === "MAELIS_MORE") {
    return `<button type="button" class="${className}" data-action="npc-chat-option" data-npc="${sisterMaelisNpcId}" data-chat-state="MAELIS_HUB" data-option="${escapeAttribute(option.id)}">${escapeHtml(option.label ?? sisterMaelisChoiceLabel(option.id))}</button>`;
  }
  if (option?.id === "MAELIS_CLOSE") {
    return `<button type="button" class="${className}" data-action="npc-chat-option" data-npc="${sisterMaelisNpcId}" data-chat-state="MAELIS_HUB" data-option="MAELIS_CLOSE">${escapeHtml(option.label ?? "Leave")}</button>`;
  }
  if (!option?.id || option.id === "MAELIS_GOODBYE") {
    return `<button type="button" class="${className}" data-action="npc-chat-option" data-npc="${sisterMaelisNpcId}" data-chat-state="MAELIS_HUB" data-option="MAELIS_GOODBYE">${escapeHtml(option?.label ?? "I should go.")}</button>`;
  }
  const label = option.label || sisterMaelisChoiceLabel(option.id);
  return `<button type="button" class="${className}" data-action="npc-chat-option" data-npc="${sisterMaelisNpcId}" data-chat-state="MAELIS_HUB" data-option="${escapeAttribute(option.id)}">${escapeHtml(label)}</button>`;
}

function sisterMaelisChoiceUnlocked(choice = {}) {
  const requiredFriendship = Math.max(0, Math.floor(Number(choice.ifFriendshipAtLeast) || 0));
  return !requiredFriendship || sisterMaelisFriendshipPoints() >= requiredFriendship;
}

function sisterMaelisHubChoices() {
  const data = sisterMaelisChatData();
  const choices = [...(data.hubChoices ?? [])];
  const variant = sisterMaelisStateVariant();
  if (variant?.id) choices.splice(5, 0, { id: variant.id, label: variant.label });
  return choices.filter((choice) => choice.id && sisterMaelisChoiceUnlocked(choice) && sisterMaelisNode(choice.id) && sisterMaelisNodeUnlocked(choice.id));
}

function sisterMaelisHubMarkup() {
  const choices = sisterMaelisHubChoices();
  const byId = new Map(choices.map((choice) => [choice.id, choice]));
  const grouped = sisterMaelisTopicGroups
    .map((group) => ({
      ...group,
      choices: group.ids.map((id) => byId.get(id)).filter(Boolean),
    }))
    .filter((group) => group.choices.length);
  const groupedIds = new Set(grouped.flatMap((group) => group.choices.map((choice) => choice.id)));
  const remaining = choices.filter((choice) => !groupedIds.has(choice.id));
  return `
    <div class="maelis-topic-groups">
      ${grouped
        .map(
          (group) => `
            <section class="maelis-topic-group">
              <h4>${escapeHtml(group.title)}</h4>
              <div>${group.choices.map((choice) => sisterMaelisOptionButton(choice)).join("")}</div>
            </section>
          `,
        )
        .join("")}
      ${
        remaining.length
          ? `<section class="maelis-topic-group"><h4>Current Matters</h4><div>${remaining.map((choice) => sisterMaelisOptionButton(choice)).join("")}</div></section>`
          : ""
      }
    </div>
  `;
}

const sisterMaelisBranchRules = {
  faith: ["FAITH_", "NAEVRA_", "MYTH_"],
  graveyard: ["GRAVEYARD_", "REVIVE_"],
  barrow: ["CROWN_", "STATE_"],
  personal: ["PERSONAL_", "FLIRT_"],
  trust: ["TRUST_"],
  services: ["MAELIS_SERVICES", "SERVICE_", "REVIVE_"],
};
const sisterMaelisBranchPageSize = 3;
const sisterMaelisConversationLabels = {
  faith: "Of faith and names",
  graveyard: "Of graves and returning",
  barrow: "Of the Barrow Crown",
  personal: "Of Maelis herself",
  trust: "Of earned trust",
  services: "Of practical rites",
};

function sisterMaelisBranchForNode(nodeId = "") {
  const id = String(nodeId || "");
  if (id === "MAELIS_SERVICES" || id.startsWith("SERVICE_")) return "services";
  if (id.startsWith("CROWN_") || id.startsWith("STATE_")) return "barrow";
  if (id.startsWith("GRAVEYARD_") || id.startsWith("REVIVE_")) return "graveyard";
  if (id.startsWith("FAITH_") || id.startsWith("NAEVRA_") || id.startsWith("MYTH_")) return "faith";
  if (id.startsWith("TRUST_")) return "trust";
  if (id.startsWith("PERSONAL_") || id.startsWith("FLIRT_")) return "personal";
  return "";
}

function sisterMaelisOptionBelongsToBranch(nodeId = "", branch = sisterMaelisCurrentBranch) {
  const id = String(nodeId || "");
  if (!branch) return true;
  return (sisterMaelisBranchRules[branch] ?? []).some((prefix) => id === prefix || id.startsWith(prefix));
}

function sisterMaelisAllBranchOptions(answer) {
  if (!answer) return [];
  const stackIds = new Set(sisterMaelisChatStack);
  return (answer.options ?? []).filter((option) => {
    if (!option?.id || option.id === "MAELIS_HUB" || option.id === "MAELIS_GOODBYE") return false;
    if (!sisterMaelisNode(option.id) || !sisterMaelisNodeUnlocked(option.id)) return false;
    if (!sisterMaelisOptionBelongsToBranch(option.id)) return false;
    return !stackIds.has(option.id);
  });
}

function sisterMaelisBranchOptions(answer) {
  const options = sisterMaelisAllBranchOptions(answer);
  if (sisterMaelisCurrentBranch === "services") return options;
  const start = Math.max(0, sisterMaelisBranchOptionPage) * sisterMaelisBranchPageSize;
  return options.slice(start, start + sisterMaelisBranchPageSize);
}

function sisterMaelisHasMoreBranchOptions(answer) {
  if (sisterMaelisCurrentBranch === "services") return false;
  const options = sisterMaelisAllBranchOptions(answer);
  const nextStart = (Math.max(0, sisterMaelisBranchOptionPage) + 1) * sisterMaelisBranchPageSize;
  return nextStart < options.length;
}

const sisterMaelisResurrectionCosts = [
  {
    rite: "Last Spark",
    time: "Up to 1 minute",
    remains: "Mostly intact body",
    cost: "300 gp diamond",
    notes: "Fast combat revival. Best used before the soul drifts.",
  },
  {
    rite: "Grave Recall",
    time: "Up to 10 days",
    remains: "Body mostly present",
    cost: "500 gp diamond",
    notes: "Restores a dead hero with weakness afterward. Cannot fix old age.",
  },
  {
    rite: "Deep Calling",
    time: "Up to 100 years",
    remains: "At least a body part",
    cost: "1,000 gp diamond",
    notes: "Stronger rite. Harder on the soul. Cannot restore someone dead of old age.",
  },
  {
    rite: "True Name Restoration",
    time: "Up to 200 years",
    remains: "No body needed if true name is proven",
    cost: "25,000 gp diamonds",
    notes: "Legendary rite. Requires death-book proof or a true-name anchor.",
  },
  {
    rite: "Gentle Keeping",
    time: "Before the limit expires",
    remains: "Body or remains",
    cost: "50 gp grave materials",
    notes: "Preserves the body and delays decay. Does not revive alone.",
  },
];

function sisterMaelisResurrectionCostTableMarkup() {
  return `
    <div class="maelis-rite-table-wrap" aria-label="Resurrection rite prices">
      <table class="maelis-rite-table">
        <thead>
          <tr>
            <th>Rite</th>
            <th>Time Since Death</th>
            <th>Required Remains</th>
            <th>Cost</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${sisterMaelisResurrectionCosts
            .map(
              (entry) => `
                <tr>
                  <td>${escapeHtml(entry.rite)}</td>
                  <td>${escapeHtml(entry.time)}</td>
                  <td>${escapeHtml(entry.remains)}</td>
                  <td>${escapeHtml(entry.cost)}</td>
                  <td>${escapeHtml(entry.notes)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function sisterMaelisSpecialAnswerMarkup(answer) {
  if (answer?.id === "REVIVE_02") return sisterMaelisResurrectionCostTableMarkup();
  if (answer?.action) return sisterMaelisAcceptedQuestMarkup(answer.action);
  return "";
}

function sisterMaelisAnswerMarkup(answer) {
  if (!answer) return "";
  const suggested = sisterMaelisBranchOptions(answer);
  const moreButton = sisterMaelisHasMoreBranchOptions(answer)
    ? sisterMaelisOptionButton({ id: "MAELIS_MORE", label: "I still have more questions about this." })
    : "";
  return `
    <section class="maelis-answer">
      ${answer.player ? `<p class="maelis-player-line">${escapeHtml(sisterMaelisSpeakerName())}: ${escapeHtml(answer.player)}</p>` : ""}
      ${answer.lines.map(sisterMaelisLineMarkup).join("")}
      ${sisterMaelisSpecialAnswerMarkup(answer)}
      ${
        answer.service
          ? `<p class="maelis-service-note">${escapeHtml(
              answer.service === "revive"
                ? "Use the corpse records below this conversation to choose an available resurrection rite."
                : answer.service === "preserve"
                  ? "Preservation is handled through the corpse records when a suitable rite or spell is available."
                  : "This service is noted for future graveyard systems; for now, Maelis explains how it works.",
            )}</p>`
          : ""
      }
      ${
        suggested.length || moreButton
          ? `<div class="maelis-suggested"><b>Continue asking</b><div>${suggested.map((option) => sisterMaelisOptionButton(option)).join("")}${moreButton}</div></div>`
          : `<p class="maelis-branch-end">You have no more questions about this.</p>`
      }
    </section>
  `;
}

function sisterMaelisLineIsDirection(line = "") {
  const text = String(line).trim();
  if (!text) return false;
  return /^(A (beat|dry note returns|dry pause|pause|small frown|small smile)\.?|No hesitation\.?|The answer is quiet\b|She (begins|closes|considers|counts|does not blink|exhales|folds|frowns|gestures|gives|glances|holds|leans|lets|lifts|lists|looks|lowers|marks|meets|opens|pauses|picks|pockets|points|prepares|raises|rests|rings|says|shrugs|shuts|shows|sighs|smiles|softens|studies|taps|tilts|touches|turns|watches)\b|Her (answer|eyes|expression|face|fingers|gaze|mouth|smile|voice)\b|Maelis's expression\b)/i.test(text);
}

function sisterMaelisLineMarkup(line = "") {
  const text = String(line).trim();
  if (!text) return "";
  if (sisterMaelisLineIsDirection(text)) {
    return `<p class="maelis-stage-direction">${escapeHtml(text)}</p>`;
  }
  return `<p>Maelis: ${escapeHtml(text)}</p>`;
}

function sisterMaelisGreetingLineIndex(greetingNode) {
  return (greetingNode?.lines ?? []).findIndex((entry) => !sisterMaelisLineIsDirection(entry));
}

function sisterMaelisGreetingMarkup(greetingNode) {
  const index = sisterMaelisGreetingLineIndex(greetingNode);
  const line = index >= 0 ? greetingNode.lines[index] : "";
  return line ? sisterMaelisLineMarkup(line) : "";
}

function sisterMaelisVoiceIdsForNode(nodeId = "", node = null, visibleOnly = false) {
  const lines = node?.lines ?? [];
  if (visibleOnly) {
    const index = sisterMaelisGreetingLineIndex(node);
    return index >= 0 ? [sisterMaelisVoiceIdForNodeLine(nodeId, index)] : [];
  }
  return lines.map((_line, index) => sisterMaelisVoiceIdForNodeLine(nodeId, index)).filter(Boolean);
}

function renderSisterMaelisChat(nodeId = "MAELIS_HUB", options = {}) {
  if (typeof stopDungeonVoiceLine === "function") stopDungeonVoiceLine();
  if (!sisterMaelisNodeUnlocked(nodeId)) nodeId = "MAELIS_HUB";
  if (options.resetStack) sisterMaelisSpeakerHeroId = sisterMaelisDefaultSpeakerId();
  if (!nodeId || nodeId === "MAELIS_HUB") {
    sisterMaelisChatStack = [];
    sisterMaelisCurrentBranch = "";
    sisterMaelisBranchOptionPage = 0;
  } else if (options.resetStack || !sisterMaelisChatStack.length || sisterMaelisBranchForNode(nodeId) !== sisterMaelisCurrentBranch) {
    sisterMaelisChatStack = [nodeId];
    sisterMaelisCurrentBranch = sisterMaelisBranchForNode(nodeId);
    sisterMaelisBranchOptionPage = 0;
  } else if (options.push !== false && sisterMaelisChatStack[sisterMaelisChatStack.length - 1] !== nodeId) {
    sisterMaelisChatStack.push(nodeId);
    sisterMaelisBranchOptionPage = 0;
  } else if (!options.keepOptionPage) {
    sisterMaelisBranchOptionPage = 0;
  }
  els.villageMenu?.classList.add("npc-chat-open", "maelis-chat-open");
  setVillageBackButtonVisible(true);
  setVillageMusicKey("village:gravebinders");
  const maelis = sisterMaelisNpc();
  const isHub = !nodeId || nodeId === "MAELIS_HUB";
  const isServices = nodeId === "MAELIS_SERVICES";
  const isGoodbye = nodeId === "MAELIS_GOODBYE";
  const answer = isHub ? null : sisterMaelisNode(nodeId);
  if (!options.suppressAward && !isHub) sisterMaelisAwardDialogue(nodeId);
  if (!options.suppressAward && answer?.action) sisterMaelisRunAction(answer.action);
  const threadName = sisterMaelisConversationLabels[sisterMaelisCurrentBranch] ?? "This matter";
  state.questFlags ??= {};
  const greetingNode = state.questFlags.sisterMaelisChatMet ? sisterMaelisNode("MAELIS_GREETING_REPEAT") : sisterMaelisNode("MAELIS_GREETING_FIRST");
  const greetingNodeId = state.questFlags.sisterMaelisChatMet ? "MAELIS_GREETING_REPEAT" : "MAELIS_GREETING_FIRST";
  state.questFlags.sisterMaelisChatMet = true;
  sisterMaelisActiveAnswer = answer;
  els.villageBody.innerHTML = `
    <section class="maelis-chat-view">
      <aside class="maelis-chat-portrait">
        ${npcPortraitMarkup(maelis, "old-lady-chat-image", { clickable: false })}
        <div>
          <b>${escapeHtml(maelis.name ?? "Sister Maelis")}</b>
          <span>Naevran graveyard keeper</span>
        </div>
        ${sisterMaelisSpeakerSelectorMarkup()}
        ${sisterMaelisRelationshipMarkup()}
      </aside>
      <div class="maelis-chat-main">
        <section class="maelis-chat-text">
          ${
            isHub
              ? sisterMaelisGreetingMarkup(greetingNode)
              : sisterMaelisAnswerMarkup(answer)
          }
        </section>
        ${
          isGoodbye || !isHub
            ? ""
            : `<section class="maelis-main-topics">
                <h3>Choose a topic</h3>
                ${sisterMaelisHubMarkup()}
              </section>`
        }
        ${
          !isHub && !isGoodbye
            ? `<section class="maelis-branch-trail">
                <b>${escapeHtml(threadName)}</b>
                <span>${escapeHtml(sisterMaelisChatStack.map((id) => sisterMaelisChoiceLabel(id)).join(" / "))}</span>
              </section>`
            : ""
        }
        <div class="maelis-chat-footer">
          ${
            isGoodbye
              ? sisterMaelisOptionButton({ id: "MAELIS_CLOSE", label: "Leave" }, "ghost-button")
              : `
                ${!isHub && sisterMaelisChatStack.length > 1 ? sisterMaelisOptionButton({ id: "MAELIS_BACK", label: "Wait, go back a moment." }, "ghost-button") : ""}
                ${!isHub ? sisterMaelisOptionButton({ id: "MAELIS_TOPICS", label: "Now, something else..." }, "ghost-button") : ""}
                ${sisterMaelisOptionButton({ id: "MAELIS_GOODBYE", label: "I should go." }, "ghost-button")}
              `
          }
        </div>
      </div>
    </section>
  `;
  const voiceIds = isHub
    ? sisterMaelisVoiceIdsForNode(greetingNodeId, greetingNode, true)
    : sisterMaelisVoiceIdsForNode(nodeId, answer, false);
  if (!options.suppressVoice) void playDungeonVoiceLineSequence(voiceIds);
  resetVillageScroll();
}

function sisterMaelisSwitchSpeaker(heroId = "") {
  if (!sisterMaelisClassHeroes().some((hero) => hero.id === heroId)) return;
  sisterMaelisSpeakerHeroId = heroId;
  renderSisterMaelisChat(sisterMaelisChatStack[sisterMaelisChatStack.length - 1] || "MAELIS_HUB", { push: false, suppressVoice: true, suppressAward: true });
}

window.sisterMaelisSwitchSpeaker = sisterMaelisSwitchSpeaker;

function sisterMaelisUseChatOption(optionId = "") {
  if (typeof stopDungeonVoiceLine === "function") stopDungeonVoiceLine();
  if (optionId === "MAELIS_CLOSE") {
    sisterMaelisActiveAnswer = null;
    sisterMaelisChatStack = [];
    sisterMaelisCurrentBranch = "";
    sisterMaelisBranchOptionPage = 0;
    renderVillageMenu();
    return;
  }
  if (optionId === "MAELIS_MORE") {
    sisterMaelisBranchOptionPage += 1;
    renderSisterMaelisChat(sisterMaelisChatStack[sisterMaelisChatStack.length - 1] || "MAELIS_HUB", { push: false, keepOptionPage: true, suppressVoice: true, suppressAward: true });
    return;
  }
  if (optionId === "MAELIS_BACK") {
    if (sisterMaelisChatStack.length > 1) {
      sisterMaelisChatStack.pop();
      sisterMaelisBranchOptionPage = 0;
      renderSisterMaelisChat(sisterMaelisChatStack[sisterMaelisChatStack.length - 1], { push: false, suppressVoice: true, suppressAward: true });
    } else {
      renderSisterMaelisChat("MAELIS_HUB", { suppressVoice: true, suppressAward: true });
    }
    return;
  }
  if (optionId === "MAELIS_TOPICS" || optionId === "MAELIS_HUB") {
    renderSisterMaelisChat("MAELIS_HUB", { suppressVoice: true, suppressAward: true });
    return;
  }
  if (!sisterMaelisNodeUnlocked(optionId)) {
    renderSisterMaelisChat("MAELIS_HUB");
    return;
  }
  renderSisterMaelisChat(optionId || "MAELIS_HUB");
}

window.DungeonNpcBehaviors ??= {};
window.DungeonNpcBehaviors[sisterMaelisNpcId] = {
  visit() {
    renderGraveyardMenu();
  },
  returnToVisit() {
    renderGraveyardMenu();
  },
  startChat(chatStateId = "MAELIS_HUB") {
    renderSisterMaelisChat(chatStateId || "MAELIS_HUB", { resetStack: true });
  },
  useChatOption(_chatStateId, optionId) {
    sisterMaelisUseChatOption(optionId);
  },
  acceptQuest: acceptSisterMaelisQuest,
  completeQuest: completeSisterMaelisQuest,
  cancelQuest: cancelSisterMaelisQuest,
  questLogEntries: sisterMaelisQuestLogEntries,
};
