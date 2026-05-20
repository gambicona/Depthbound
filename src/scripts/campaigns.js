(() => {
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
      giver: "Borren Ashmantle",
      initialTitle: "Recover the First Claim",
      initialDescription: "Borren has heard an old Embervein claim bell ringing again. Enter the Deepworks, defeat the thief at the furnace heart, and recover whatever Ashmantle relic remains.",
      progressTitle: "The First Claim Burns",
      progressDescription: "The Embervein Deepworks has been reopened by a soot-marked crew. Push to the furnace heart and bring the First Claim Hammer home.",
      completedTitle: "The Hammer Returned",
      completedDescription: "The First Claim Hammer has been recovered from the Embervein Deepworks. Borren Ashmantle may know why it matters.",
    },
    description: `Borren Ashmantle's family claim in the Embervein Deepworks has started ringing from below the hills.

Someone has broken into the old forge-mine, restarted the furnaces, and stolen the First Claim Hammer from its sealed rack.

This is a compact one-dungeon adventure for four level 2 heroes: a cold lift, coal silos, pressure valves, moving chain hoists, and a furnace-heart boss who would rather burn the mine than give the hammer back.`,
    count: 1,
    folder: "campaigns/the-first-claim-of-embervein",
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
  const parsed = safeParse(window.localStorage.getItem(overrideStorageKey), {});
  return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
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

window.DungeonCampaigns = {
  list: () => campaigns.map((campaign) => ({ ...campaign })),
  get: (id) => campaigns.find((campaign) => campaign.id === id) ?? null,
  dungeon,
  originalDungeon,
  hasOverride,
  saveOverride,
  removeOverride,
};
})();
