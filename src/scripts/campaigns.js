(() => {
const campaigns = [
  {
  id: "barrow-crown",
  name: "The Barrow Crown",
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
    description: "Placeholder campaign description for The Thornwood Pact. Edit this later.",
    count: 8,
    folder: "campaigns/the-thornwood-pact",
  },
];

const cache = new Map();

async function dungeon(campaignId, index) {
  const campaign = campaigns.find((entry) => entry.id === campaignId);
  if (!campaign || index < 1 || index > campaign.count) return null;
  const key = `${campaignId}:${index}`;
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

window.DungeonCampaigns = {
  list: () => campaigns.map((campaign) => ({ ...campaign })),
  get: (id) => campaigns.find((campaign) => campaign.id === id) ?? null,
  dungeon,
};
})();
