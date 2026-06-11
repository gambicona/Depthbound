const sisterMaelisNpcId = "sister-maelis";
let sisterMaelisPendingCardVoiceIds = [];
let sisterMaelisActiveAnswer = null;

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
  if (!id || id === "MAELIS_HUB" || id === "MAELIS_SERVICES" || id === "MAELIS_GOODBYE" || id === "MAELIS_CLOSE") return true;
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

function sisterMaelisChoiceLabel(nodeId = "") {
  if (nodeId === "MAELIS_HUB") return "Ask something else.";
  if (nodeId === "MAELIS_SERVICES") return "I need your services.";
  if (nodeId === "MAELIS_GOODBYE") return "I should go.";
  const node = sisterMaelisNode(nodeId);
  return node?.player || node?.options?.[0]?.label || nodeId;
}

function sisterMaelisOptionButton(option, className = "") {
  if (option?.id === "MAELIS_CLOSE") {
    return `<button type="button" class="${className}" data-action="npc-chat-option" data-npc="${sisterMaelisNpcId}" data-chat-state="MAELIS_HUB" data-option="MAELIS_CLOSE">${escapeHtml(option.label ?? "Leave")}</button>`;
  }
  if (!option?.id || option.id === "MAELIS_GOODBYE") {
    return `<button type="button" class="${className}" data-action="npc-chat-option" data-npc="${sisterMaelisNpcId}" data-chat-state="MAELIS_HUB" data-option="MAELIS_GOODBYE">${escapeHtml(option?.label ?? "I should go.")}</button>`;
  }
  const label = option.label || sisterMaelisChoiceLabel(option.id);
  return `<button type="button" class="${className}" data-action="npc-chat-option" data-npc="${sisterMaelisNpcId}" data-chat-state="MAELIS_HUB" data-option="${escapeAttribute(option.id)}">${escapeHtml(label)}</button>`;
}

function sisterMaelisHubChoices() {
  const data = sisterMaelisChatData();
  const choices = [...(data.hubChoices ?? [])];
  const variant = sisterMaelisStateVariant();
  if (variant?.id) choices.splice(5, 0, { id: variant.id, label: variant.label });
  return choices.filter((choice) => choice.id && sisterMaelisNode(choice.id) && sisterMaelisNodeUnlocked(choice.id));
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
  return "";
}

function sisterMaelisAnswerMarkup(answer) {
  if (!answer) return "";
  const suggested = (answer.options ?? []).filter((option) => option.id && sisterMaelisNode(option.id) && sisterMaelisNodeUnlocked(option.id));
  return `
    <section class="maelis-answer">
      ${answer.player ? `<p class="maelis-player-line">You: ${escapeHtml(answer.player)}</p>` : ""}
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
        suggested.length
          ? `<div class="maelis-suggested"><b>Suggested follow-ups</b><div>${suggested.map((option) => sisterMaelisOptionButton(option)).join("")}</div></div>`
          : ""
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

function renderSisterMaelisChat(nodeId = "MAELIS_HUB") {
  if (typeof stopDungeonVoiceLine === "function") stopDungeonVoiceLine();
  if (!sisterMaelisNodeUnlocked(nodeId)) nodeId = "MAELIS_HUB";
  els.villageMenu?.classList.add("npc-chat-open", "maelis-chat-open");
  setVillageBackButtonVisible(true);
  setVillageMusicKey("village:gravebinders");
  const maelis = sisterMaelisNpc();
  const isHub = !nodeId || nodeId === "MAELIS_HUB";
  const isServices = nodeId === "MAELIS_SERVICES";
  const isGoodbye = nodeId === "MAELIS_GOODBYE";
  const answer = isHub ? null : sisterMaelisNode(nodeId);
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
          isGoodbye
            ? ""
            : `<section class="maelis-main-topics">
                <h3>${isHub ? "Ask Sister Maelis" : "Main Topics"}</h3>
                ${sisterMaelisHubMarkup()}
              </section>`
        }
        <div class="maelis-chat-footer">
          ${
            isGoodbye
              ? sisterMaelisOptionButton({ id: "MAELIS_CLOSE", label: "Leave" }, "ghost-button")
              : `
                ${!isHub ? sisterMaelisOptionButton({ id: "MAELIS_HUB", label: "Ask something else." }, "ghost-button") : ""}
                ${!isServices ? sisterMaelisOptionButton({ id: "MAELIS_SERVICES", label: "I need your services." }, "ghost-button") : ""}
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
  void playDungeonVoiceLineSequence(voiceIds);
  resetVillageScroll();
}

function sisterMaelisUseChatOption(optionId = "") {
  if (typeof stopDungeonVoiceLine === "function") stopDungeonVoiceLine();
  if (optionId === "MAELIS_CLOSE") {
    sisterMaelisActiveAnswer = null;
    renderGraveyardMenu();
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
    renderSisterMaelisChat(chatStateId || "MAELIS_HUB");
  },
  useChatOption(_chatStateId, optionId) {
    sisterMaelisUseChatOption(optionId);
  },
};
