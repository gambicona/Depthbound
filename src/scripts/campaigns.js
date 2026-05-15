(() => {
const campaigns = [
  {
    id: "barrow-crown",
    name: "The Barrow Crown",
    description: "Placeholder campaign description for The Barrow Crown. Edit this later.",
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
