(() => {
const els = {
  template: document.querySelector("#template-item"),
  id: document.querySelector("#custom-item-id"),
  name: document.querySelector("#item-name"),
  type: document.querySelector("#item-type"),
  category: document.querySelector("#item-category"),
  value: document.querySelector("#item-value"),
  weight: document.querySelector("#item-weight"),
  slots: document.querySelector("#item-slots"),
  description: document.querySelector("#item-description"),
  rarity: document.querySelector("#magic-rarity"),
  magicAttack: document.querySelector("#magic-attack"),
  magicDamage: document.querySelector("#magic-damage"),
  magicAc: document.querySelector("#magic-ac"),
  magicMaxHp: document.querySelector("#magic-maxhp"),
  magicSpeed: document.querySelector("#magic-speed"),
  magicInitiative: document.querySelector("#magic-initiative"),
  magicSave: document.querySelector("#magic-save"),
  magicSkill: document.querySelector("#magic-skill"),
  magicResistances: document.querySelector("#magic-resistances"),
  magicImmunities: document.querySelector("#magic-immunities"),
  magicExtraDice: document.querySelector("#magic-extra-dice"),
  magicExtraType: document.querySelector("#magic-extra-type"),
  useKind: document.querySelector("#use-kind"),
  useHealDice: document.querySelector("#use-heal-dice"),
  useHealBonus: document.querySelector("#use-heal-bonus"),
  useCharges: document.querySelector("#use-charges"),
  useRefresh: document.querySelector("#use-refresh"),
  useResource: document.querySelector("#use-resource"),
  curseList: document.querySelector("#curse-list"),
  curseJson: document.querySelector("#curse-json"),
  bibliography: document.querySelector("#bibliography"),
  status: document.querySelector("#status"),
  save: document.querySelector("#save-item"),
  fresh: document.querySelector("#new-item"),
  openDungeonCreator: document.querySelector("[data-open-dungeon-creator]"),
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const itemValueCp = (item = {}) => item.cost?.unit === "gp" ? (item.cost.amount ?? 0) * 100 : item.cost?.unit === "sp" ? (item.cost.amount ?? 0) * 10 : item.cost?.amount ?? item.treasure?.valueCp ?? 0;
const price = (gp) => ({ amount: Math.max(0, Math.floor(Number(gp) || 0)), unit: "gp", text: `${Math.max(0, Math.floor(Number(gp) || 0))} gp` });
const slug = (value) => String(value || "custom-item").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "custom-item";
const parseList = (value) => String(value || "").split(",").map((entry) => entry.trim()).filter(Boolean);
const damageTypes = ["", "acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"];
const numberValue = (input) => {
  const value = Number(input?.value);
  return Number.isFinite(value) && value !== 0 ? value : 0;
};

function encodeTransferPayload(value) {
  const json = JSON.stringify(value ?? []);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function updateDungeonCreatorLink() {
  if (!els.openDungeonCreator) return;
  const payload = encodeTransferPayload(customItems());
  els.openDungeonCreator.href = payload ? `dungeon-creator.html#customItems=${payload}` : "dungeon-creator.html";
}
const parseDice = (value) => {
  const match = String(value ?? "").trim().match(/^(\d+)d(\d+)$/i);
  return match ? { count: Number(match[1]), sides: Number(match[2]) } : null;
};

function templates() {
  return window.DungeonContent.list("items").filter((item) => !item.customBibliographyItem).sort((a, b) => a.name.localeCompare(b.name));
}

function selectedTemplate() {
  return window.DungeonContent.get("items", els.template.value) ?? templates()[0] ?? {};
}

function customItems() {
  return window.DungeonCustomItems.load();
}

function selectedCurses() {
  const checked = Array.from(els.curseList.querySelectorAll("input[type='checkbox']:checked")).map((input) => {
    const curse = window.DungeonAfflictions.curses[input.value];
    const id = input.value;
    const vulnerability = els.curseList.querySelector(`[data-curse-vulnerable="${id}"]`)?.value || "";
    const healingMode = els.curseList.querySelector(`[data-curse-healing="${id}"]`)?.value || "";
    const healPercent = Number(els.curseList.querySelector(`[data-curse-heal-percent="${id}"]`)?.value) || 0;
    const maxHpPenaltyPercent = Number(els.curseList.querySelector(`[data-curse-maxhp="${id}"]`)?.value) || 0;
    const acPenalty = Number(els.curseList.querySelector(`[data-curse-ac="${id}"]`)?.value) || 0;
    const attackPenalty = Number(els.curseList.querySelector(`[data-curse-attack="${id}"]`)?.value) || 0;
    const savePenalty = Number(els.curseList.querySelector(`[data-curse-save="${id}"]`)?.value) || 0;
    const skillPenalty = Number(els.curseList.querySelector(`[data-curse-skill="${id}"]`)?.value) || 0;
    const speedPenalty = Number(els.curseList.querySelector(`[data-curse-speed="${id}"]`)?.value) || 0;
    const status = {};
    if (vulnerability) status.vulnerabilities = [vulnerability];
    if (healingMode === "none") status.healingReceivedMultiplier = 0;
    if (healingMode === "reduced") status.healingReceivedMultiplier = Math.max(0, Math.min(1, healPercent / 100 || 0.5));
    if (maxHpPenaltyPercent > 0) status.maxHpPenaltyPercent = maxHpPenaltyPercent;
    if (acPenalty > 0) status.acBonus = -acPenalty;
    if (attackPenalty > 0) status.attackBonus = -attackPenalty;
    if (savePenalty > 0) status.saveBonus = -savePenalty;
    if (skillPenalty > 0) status.skillBonus = -skillPenalty;
    if (speedPenalty > 0) status.speedBonusFeet = -speedPenalty;
    return {
      id,
      mode: els.curseList.querySelector(`[data-curse-mode="${id}"]`)?.value || curse?.mode || "equip",
      cannotUnequip: Boolean(els.curseList.querySelector(`[data-curse-lock="${id}"]`)?.checked),
      persistsAfterUnequip: Boolean(els.curseList.querySelector(`[data-curse-persist="${id}"]`)?.checked),
      ...(Object.keys(status).length ? { status } : {}),
    };
  });
  const raw = els.curseJson.value.trim();
  if (!raw) return checked;
  try {
    const parsed = JSON.parse(raw);
    return [...checked, ...(Array.isArray(parsed) ? parsed : [parsed])].filter((entry) => entry?.id);
  } catch {
    els.status.textContent = "Advanced curse JSON is not valid, so it was ignored.";
    return checked;
  }
}

function selectedMagic() {
  const effects = {};
  const abilityScoreBonuses = {};
  for (const input of document.querySelectorAll("[data-ability-bonus]")) {
    const value = numberValue(input);
    if (value) abilityScoreBonuses[input.dataset.abilityBonus] = value;
  }
  if (Object.keys(abilityScoreBonuses).length) effects.abilityScoreBonuses = abilityScoreBonuses;
  for (const [key, value] of [
    ["acBonus", numberValue(els.magicAc)],
    ["maxHpBonus", numberValue(els.magicMaxHp)],
    ["speedBonusFeet", numberValue(els.magicSpeed)],
    ["initiativeBonus", numberValue(els.magicInitiative)],
    ["saveBonus", numberValue(els.magicSave)],
    ["skillBonus", numberValue(els.magicSkill)],
    ["attackBonus", numberValue(els.magicAttack)],
    ["damageBonus", numberValue(els.magicDamage)],
  ]) {
    if (value) effects[key] = value;
  }
  const resistances = parseList(els.magicResistances.value);
  const immunities = parseList(els.magicImmunities.value);
  if (resistances.length) effects.resistances = resistances;
  if (immunities.length) effects.immunities = immunities;
  const extraDice = parseDice(els.magicExtraDice.value);
  if (extraDice && els.magicExtraType.value) effects.extraDamage = [{ ...extraDice, type: els.magicExtraType.value }];
  const rarity = els.rarity.value;
  if (!rarity && !Object.keys(effects).length) return null;
  return {
    kind: "custom",
    rarity: rarity || "custom",
    priceGp: Number(els.value.value) || 0,
    attackBonus: numberValue(els.magicAttack),
    damageBonus: numberValue(els.magicDamage),
    resistances,
    immunities,
    extraDamage: effects.extraDamage ?? [],
    effects,
    description: els.description.value.trim(),
  };
}

function selectedUse() {
  if (!els.useKind.value) return null;
  const charges = Math.max(0, Math.floor(Number(els.useCharges.value) || 0));
  const common = {
    kind: els.useKind.value,
    resource: els.useResource.value || "bonusAction",
    consume: false,
    ...(charges > 0 ? { charges: { max: charges, refresh: els.useRefresh.value || "newDungeon" } } : {}),
  };
  if (els.useKind.value === "healing") {
    const dice = parseDice(els.useHealDice.value) ?? { count: 2, sides: 4 };
    return { ...common, dice, bonus: Number(els.useHealBonus.value) || 0 };
  }
  if (els.useKind.value === "buff") {
    return { ...common, effects: selectedMagic()?.effects ?? {}, duration: "encounter" };
  }
  return null;
}

function fillFromTemplate() {
  const template = selectedTemplate();
  els.id.value = "";
  els.name.value = `${template.name ?? "Item"} Variant`;
  els.type.value = template.type ?? "";
  els.category.value = template.category ?? "";
  els.value.value = String(Math.floor(itemValueCp(template) / 100));
  els.weight.value = String(template.weightLb ?? 0);
  els.slots.value = (template.slots ?? []).join(", ");
  els.description.value = template.description ?? template.magic?.description ?? template.handout?.text ?? "";
  fillMagicControls(template);
  fillUseControls(template.use);
  els.curseJson.value = "";
  els.curseList.querySelectorAll("input[type='checkbox']").forEach((input) => { input.checked = false; });
  resetEasyCurseControls();
}

function fillFromItem(item) {
  if (!item) return;
  els.id.value = item.id;
  els.template.value = item.baseItemId ?? item.itemId ?? item.id;
  els.name.value = item.name ?? "";
  els.type.value = item.type ?? "";
  els.category.value = item.category ?? "";
  els.value.value = String(Math.floor(itemValueCp(item) / 100));
  els.weight.value = String(item.weightLb ?? 0);
  els.slots.value = (item.slots ?? []).join(", ");
  els.description.value = item.description ?? item.customDescription ?? "";
  fillMagicControls(item);
  fillUseControls(item.use);
  const ids = new Set((item.curses ?? []).map((entry) => typeof entry === "string" ? entry : entry.id));
  els.curseList.querySelectorAll("input[type='checkbox']").forEach((input) => { input.checked = ids.has(input.value); });
  resetEasyCurseControls();
  for (const entry of item.curses ?? []) {
    if (typeof entry === "string") continue;
    applyEasyCurseControls(entry);
  }
  els.curseJson.value = JSON.stringify((item.curses ?? []).filter((entry) => !ids.has(typeof entry === "string" ? entry : entry.id) || typeof entry !== "string"), null, 2);
}

function fillMagicControls(item = {}) {
  const magic = item.magic ?? {};
  const effects = magic.effects ?? {};
  els.rarity.value = magic.rarity && [...els.rarity.options].some((option) => option.value === magic.rarity) ? magic.rarity : "";
  els.magicAttack.value = magic.attackBonus || effects.attackBonus || "";
  els.magicDamage.value = magic.damageBonus || effects.damageBonus || "";
  els.magicAc.value = effects.acBonus || "";
  els.magicMaxHp.value = effects.maxHpBonus || "";
  els.magicSpeed.value = effects.speedBonusFeet || "";
  els.magicInitiative.value = effects.initiativeBonus || "";
  els.magicSave.value = effects.saveBonus || "";
  els.magicSkill.value = effects.skillBonus || "";
  els.magicResistances.value = [...(effects.resistances ?? []), ...(magic.resistances ?? [])].join(", ");
  els.magicImmunities.value = [...(effects.immunities ?? []), ...(magic.immunities ?? [])].join(", ");
  const extra = (effects.extraDamage ?? magic.extraDamage ?? [])[0];
  els.magicExtraDice.value = extra ? `${extra.count}d${extra.sides}` : "";
  els.magicExtraType.value = extra?.type ?? "";
  for (const input of document.querySelectorAll("[data-ability-bonus]")) input.value = effects.abilityScoreBonuses?.[input.dataset.abilityBonus] ?? "";
}

function fillUseControls(use = null) {
  els.useKind.value = use?.kind && ["healing", "buff"].includes(use.kind) ? use.kind : "";
  els.useHealDice.value = use?.dice ? `${use.dice.count}d${use.dice.sides}` : "";
  els.useHealBonus.value = use?.bonus ?? "";
  els.useCharges.value = use?.charges?.max ?? "";
  els.useRefresh.value = use?.charges?.refresh ?? "newDungeon";
  els.useResource.value = use?.resource ?? "bonusAction";
}

function resetEasyCurseControls() {
  els.curseList.querySelectorAll("[data-curse-mode]").forEach((input) => { input.value = "equip"; });
  els.curseList.querySelectorAll("[data-curse-vulnerable], [data-curse-healing]").forEach((input) => { input.value = ""; });
  els.curseList.querySelectorAll("[data-curse-heal-percent]").forEach((input) => { input.value = "50"; });
  els.curseList.querySelectorAll("[data-curse-maxhp], [data-curse-ac], [data-curse-attack], [data-curse-save], [data-curse-skill], [data-curse-speed]").forEach((input) => { input.value = ""; });
}

function applyEasyCurseControls(entry) {
  const id = entry.id;
  const status = entry.status ?? {};
  const set = (selector, value) => {
    const input = els.curseList.querySelector(`[${selector}="${id}"]`);
    if (input && value != null) input.value = String(value);
  };
  set("data-curse-mode", entry.mode ?? "equip");
  set("data-curse-vulnerable", status.vulnerabilities?.[0] ?? "");
  if (status.healingReceivedMultiplier === 0) set("data-curse-healing", "none");
  else if (status.healingReceivedMultiplier != null && status.healingReceivedMultiplier < 1) {
    set("data-curse-healing", "reduced");
    set("data-curse-heal-percent", Math.round(status.healingReceivedMultiplier * 100));
  }
  set("data-curse-maxhp", status.maxHpPenaltyPercent ?? "");
  set("data-curse-ac", status.acBonus < 0 ? Math.abs(status.acBonus) : "");
  set("data-curse-attack", status.attackBonus < 0 ? Math.abs(status.attackBonus) : "");
  set("data-curse-save", status.saveBonus < 0 ? Math.abs(status.saveBonus) : "");
  set("data-curse-skill", status.skillBonus < 0 ? Math.abs(status.skillBonus) : "");
  set("data-curse-speed", status.speedBonusFeet < 0 ? Math.abs(status.speedBonusFeet) : "");
}

function buildItem() {
  const template = selectedTemplate();
  const existingId = els.id.value;
  const id = existingId || `custom-${slug(els.name.value || template.name)}-${Date.now()}`;
  const curses = selectedCurses();
  const magic = selectedMagic();
  const use = selectedUse();
  return {
    ...clone(template),
    id,
    baseItemId: template.id,
    name: els.name.value.trim() || `${template.name} Variant`,
    type: els.type.value.trim() || template.type,
    category: els.category.value.trim() || template.category,
    description: els.description.value.trim() || template.description || "",
    customDescription: els.description.value.trim(),
    weightLb: Number(els.weight.value) || 0,
    cost: price(els.value.value),
    slots: parseList(els.slots.value),
    ...(magic ? { magic } : {}),
    ...(use ? { use } : {}),
    curses,
    tags: Array.from(new Set([...(template.tags ?? []), "custom-item", ...(magic ? ["magic", "magic-item", "loot:magic"] : []), ...(curses.length ? ["cursed"] : [])])),
  };
}

function saveItem() {
  const item = buildItem();
  const next = customItems().filter((entry) => entry.id !== item.id);
  next.push(item);
  window.DungeonCustomItems.save(next);
  window.DungeonCustomItems.registerAll();
  els.id.value = item.id;
  els.status.textContent = `Saved ${item.name}. Reopen or refresh the game to see it in the admin vault.`;
  renderBibliography();
}

function deleteItem(itemId) {
  window.DungeonCustomItems.save(customItems().filter((entry) => entry.id !== itemId));
  els.status.textContent = "Deleted custom item.";
  renderBibliography();
}

function renderCurses() {
  els.curseList.innerHTML = Object.values(window.DungeonAfflictions.curses ?? {}).map((curse) => `
    <div class="curse-card">
      <label><input type="checkbox" value="${curse.id}" /> ${curse.name}</label>
      <p class="small-note">${curse.description ?? ""}</p>
      <div class="row">
        <label>Trigger <select data-curse-mode="${curse.id}"><option value="equip">Equip</option><option value="use">Use</option></select></label>
        <div>
          <label><input type="checkbox" data-curse-lock="${curse.id}" ${curse.cannotUnequip ? "checked" : ""} /> cannot unequip</label>
          <label><input type="checkbox" data-curse-persist="${curse.id}" ${curse.persistsAfterUnequip ? "checked" : ""} /> persists after unequip</label>
        </div>
      </div>
      <div class="effect-grid">
        <label>Vulnerability <select data-curse-vulnerable="${curse.id}">${damageTypes.map((type) => `<option value="${type}">${type || "None"}</option>`).join("")}</select></label>
        <label>Healing <select data-curse-healing="${curse.id}"><option value="">Normal</option><option value="none">Cannot heal</option><option value="reduced">Reduced to %</option></select></label>
        <label>Healing % <input type="number" min="0" max="100" step="5" value="50" data-curse-heal-percent="${curse.id}" /></label>
        <label>Max HP -% <input type="number" min="0" max="95" step="5" data-curse-maxhp="${curse.id}" /></label>
        <label>AC penalty <input type="number" min="0" max="10" step="1" data-curse-ac="${curse.id}" /></label>
        <label>Speed penalty ft <input type="number" min="0" max="60" step="5" data-curse-speed="${curse.id}" /></label>
        <label>Attack penalty <input type="number" min="0" max="10" step="1" data-curse-attack="${curse.id}" /></label>
        <label>Save penalty <input type="number" min="0" max="10" step="1" data-curse-save="${curse.id}" /></label>
        <label>Skill penalty <input type="number" min="0" max="10" step="1" data-curse-skill="${curse.id}" /></label>
      </div>
    </div>
  `).join("");
}

function renderBibliography() {
  const items = customItems();
  updateDungeonCreatorLink();
  els.bibliography.innerHTML = items.length ? items.map((item) => `
    <article class="item-card">
      <b>${item.name}</b>
      <p class="small-note">${item.type ?? "item"} - ${item.magic ? "magic" : "mundane"} - ${(item.curses ?? []).map((entry) => window.DungeonAfflictions.curses?.[entry.id ?? entry]?.name ?? entry.id ?? entry).join(", ") || "no curse"}</p>
      <p>${item.description ?? ""}</p>
      <div class="actions">
        <button type="button" data-edit="${item.id}">Edit</button>
        <button type="button" class="secondary" data-delete="${item.id}">Delete</button>
      </div>
    </article>
  `).join("") : `<p class="small-note">No custom items saved yet.</p>`;
}

function init() {
  els.template.innerHTML = templates().map((item) => `<option value="${item.id}">${item.name}</option>`).join("");
  els.magicExtraType.innerHTML = damageTypes.map((type) => `<option value="${type}">${type || "None"}</option>`).join("");
  renderCurses();
  fillFromTemplate();
  renderBibliography();
  els.template.addEventListener("change", fillFromTemplate);
  els.save.addEventListener("click", saveItem);
  els.fresh.addEventListener("click", fillFromTemplate);
  els.bibliography.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]");
    const del = event.target.closest("[data-delete]");
    if (edit) fillFromItem(customItems().find((item) => item.id === edit.dataset.edit));
    if (del) deleteItem(del.dataset.delete);
  });
}

init();
})();
