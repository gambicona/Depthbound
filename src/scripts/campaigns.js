(() => {
const emberveinFirstClaimText = window.DungeonNpcQuestText?.borren?.questChains?.claimHammer?.campaign ?? {
  giver: "Borren Ashmantle",
  initialTitle: "Recover the First Claim",
  initialDescription: "Enter the Deepworks and recover the Ashmantle relic.",
  progressTitle: "The First Claim Burns",
  progressDescription: "Push to the furnace heart and bring the relic home.",
  completedTitle: "The Hammer Returned",
  completedDescription: "The relic has been recovered. Borren may know why it matters.",
  description: "A compact one-dungeon Embervein adventure.",
};

const campaigns = [
  {
  id: "barrow-crown",
  name: "The Barrow Crown",
  quest: {
    giver: "Sister Maelis",
    initialTitle: "Help Sister Maelis",
    initialDescription: "Help Sister Maelis in putting the dead to rest in the Barrow Crown.",
    progressTitle: "Find the Barrow Crown",
    progressDescription: "Follow the trail through the Barrow Crown dungeons and recover the relic that keeps the old dead sleeping.",
    completedTitle: "The Barrow Crown Recovered",
    completedDescription: "The Barrow Crown campaign is complete. The placeholder ending text can be expanded when the finale is fully written.",
  },
  description: `For centuries, the hills north of the old road were left untouched.
Shepherds avoided them.
Kings refused to build upon them.
Even thieves knew better than to dig there.

They were called the Barrow Hills, burial place of the first royal bloodline.

Three nights ago, a storm split the sky.
Green fire burned over the largest mound, and by dawn, the ancient tomb had been broken open.

The grave-robbers who entered it did not all return.
Those who did came back pale, shaking, and speaking of a crown of black iron and old gold.

Since then, bells have rung beneath the earth. Dead nobles have been seen standing on hilltops at dusk. In village cemeteries, buried hands press upward through the soil.

Sister Maelis, keeper of the old graves, has sent for you.

She believes the thieves have stolen more than treasure. They have stolen the symbol that kept a dead kingdom sleeping.

If the Barrow Crown is not found, the first king will rise — and every oath once sworn to his throne will awaken with him.`,
  count: 7,
  folder: "campaigns/the-barrow-crown",
},
  {
    id: "thornwood-pact",
    name: "The Thornwood Pact",
    quest: {
      giver: "Old Lady Mara",
      initialTitle: "Help Old Lady Mara",
      initialDescription: "Help Old Lady Mara investigate the first signs of the Thornwood Pact. Placeholder story text until the full opening is written.",
      progressTitle: "Uncover the Thornwood Pact",
      progressDescription: "Push deeper into the Thornwood Pact campaign and learn what the forest has promised, and to whom. Placeholder story text until these dungeons are finalized.",
      completedTitle: "The Thornwood Pact Broken",
      completedDescription: "The Thornwood Pact campaign is complete. Placeholder ending text until the final pact resolution is written.",
    },
    description: "Placeholder campaign description for The Thornwood Pact. Edit this later.",
    count: 8,
    folder: "campaigns/the-thornwood-pact",
  },
  {
    id: "embervein-first-claim",
    name: "The First Claim of Embervein",
    quest: {
      giver: emberveinFirstClaimText.giver,
      initialTitle: emberveinFirstClaimText.initialTitle,
      initialDescription: emberveinFirstClaimText.initialDescription,
      progressTitle: emberveinFirstClaimText.progressTitle,
      progressDescription: emberveinFirstClaimText.progressDescription,
      completedTitle: emberveinFirstClaimText.completedTitle,
      completedDescription: emberveinFirstClaimText.completedDescription,
    },
    description: emberveinFirstClaimText.description,
    count: 1,
    folder: "campaigns/the-first-claim-of-embervein",
  },
  {
    id: "dwarven-smithy-ember-oath",
    name: "The Dwarven Smithy: The Ember Oath",
    unlock: {
      questFlag: "flag.borren.claimHammerReturned",
    },
    quest: {
      giver: "Borren Ashmantle",
      initialTitle: "Reopen the Ember Oath",
      initialDescription: "With the First Claim Hammer returned, Borren can trace the old Ashmantle forge-road into the Embervein Deepworks.",
      progressTitle: "The Ember Oath Burns",
      progressDescription: "Follow Borren's recovered claim through the old smithy road and restore what the Deepworks lost.",
      completedTitle: "The Ember Oath Reforged",
      completedDescription: "The Dwarven Smithy path is complete. The restored forge-road can be expanded with its final ending text later.",
    },
    description: `Borren Ashmantle has the First Claim Hammer again. Its maker's marks do not point to a single mine, but to an older dwarven forge-road: the Ember Oath.

These are placeholder campaign slots using the same 8-dungeon template lineup as the Forest of the Beasts main story, ready for Smithy dungeons to be pasted into place.`,
    count: 8,
    folder: "campaigns/the-dwarven-smithy-ember-oath",
  },
];

const cache = new Map();
const overrideStorageKey = "depthbound.campaignDungeonOverrides.v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeParse(text, fallback) {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

function overrideKey(campaignId, index) {
  return `${campaignId}:${index}`;
}

function loadOverrides() {
  window.localStorage.removeItem(overrideStorageKey);
  return {};
}

function saveOverrides(overrides) {
  window.localStorage.setItem(overrideStorageKey, JSON.stringify(overrides));
}

function normalizeOverrideTemplate(template, campaignId, index) {
  if (!template || typeof template !== "object") return null;
  return {
    ...clone(template),
    campaignId,
    campaignIndex: index,
    updatedAt: new Date().toISOString(),
  };
}

function getOverride(campaignId, index) {
  const template = loadOverrides()[overrideKey(campaignId, index)];
  return template ? normalizeOverrideTemplate(template, campaignId, index) : null;
}

function saveOverride(campaignId, index, template) {
  return null;
  const campaign = campaigns.find((entry) => entry.id === campaignId);
  if (!campaign || index < 1 || index > campaign.count) return null;
  const normalized = normalizeOverrideTemplate(template, campaignId, index);
  if (!normalized) return null;
  const overrides = loadOverrides();
  overrides[overrideKey(campaignId, index)] = normalized;
  saveOverrides(overrides);
  cache.set(overrideKey(campaignId, index), Promise.resolve(clone(normalized)));
  return clone(normalized);
}

function removeOverride(campaignId, index) {
  const overrides = loadOverrides();
  delete overrides[overrideKey(campaignId, index)];
  saveOverrides(overrides);
  cache.delete(overrideKey(campaignId, index));
}

function hasOverride(campaignId, index) {
  return Boolean(loadOverrides()[overrideKey(campaignId, index)]);
}

function isUnlocked(campaignId, gameState = window.state) {
  const campaign = campaigns.find((entry) => entry.id === campaignId);
  if (!campaign) return false;
  const unlock = campaign.unlock;
  if (!unlock) return true;
  if (unlock.questFlag && !gameState?.questFlags?.[unlock.questFlag]) return false;
  if (unlock.campaignId) {
    const required = Math.max(1, Math.floor(Number(unlock.campaignProgress) || 1));
    const completed = Math.floor(Number(gameState?.campaignProgress?.[unlock.campaignId]) || 0);
    if (completed < required) return false;
  }
  return true;
}

async function dungeon(campaignId, index) {
  const campaign = campaigns.find((entry) => entry.id === campaignId);
  if (!campaign || index < 1 || index > campaign.count) return null;
  const key = `${campaignId}:${index}`;
  const override = getOverride(campaignId, index);
  if (override) return override;
  if (!cache.has(key)) {
    cache.set(
      key,
      fetch(`${campaign.folder}/Dungeon${index}.json`)
        .then((response) => (response.ok ? response.json() : null))
        .then((template) => template ? { ...template, campaignId, campaignIndex: index } : null)
        .catch(() => null),
    );
  }
  return cache.get(key);
}

async function originalDungeon(campaignId, index) {
  const campaign = campaigns.find((entry) => entry.id === campaignId);
  if (!campaign || index < 1 || index > campaign.count) return null;
  return fetch(`${campaign.folder}/Dungeon${index}.json`)
    .then((response) => (response.ok ? response.json() : null))
    .then((template) => template ? { ...template, campaignId, campaignIndex: index } : null)
    .catch(() => null);
}

async function saveSource(campaignId, index, template) {
  const campaign = campaigns.find((entry) => entry.id === campaignId);
  if (!campaign || index < 1 || index > campaign.count || !template) return null;
  const normalized = {
    ...clone(template),
    campaignId,
    campaignIndex: index,
    updatedAt: new Date().toISOString(),
  };
  const response = await fetch("/save-source-dungeon", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "campaign", campaignId, index, template: normalized }),
  }).catch(() => null);
  if (!response?.ok) return null;
  const result = await response.json().catch(() => null);
  if (!result?.saved) return null;
  removeOverride(campaignId, index);
  cache.set(overrideKey(campaignId, index), Promise.resolve(clone(normalized)));
  return clone(normalized);
}

window.DungeonCampaigns = {
  list: () => campaigns.map((campaign) => ({ ...campaign })),
  get: (id) => campaigns.find((campaign) => campaign.id === id) ?? null,
  dungeon,
  originalDungeon,
  saveSource,
  isUnlocked,
  hasOverride,
  saveOverride,
  removeOverride,
};
})();
