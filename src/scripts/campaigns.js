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

const expeditionMilepostMissions = [
  {
    name: "Survey the Bad Mile",
    themeId: "grasslands",
    dungeonSizeId: "small",
    roomCount: 6,
    category: 2,
    partyLevelRange: "3-4",
    intro: "Nella's ledger marks one stretch of road as guessed, smudged, and therefore embarrassing. Walk it end to end, mark the bad turns, and come back with proof that a cart could survive the route.",
    outro: "The last marker is set. The bad mile is no longer guesswork.",
    goal: { type: "reachExit" },
  },
  {
    name: "Clear the Wayhouse",
    themeId: "outlawCamp",
    dungeonSizeId: "medium",
    roomCount: 7,
    category: 4,
    partyLevelRange: "7-8",
    intro: "A roofless wayhouse sits across the planned road line. Someone has been using it as a toll knife. Clear the rooms and leave the route fit for honest boots.",
    outro: "The wayhouse falls quiet. The road can pass through without asking permission.",
    goal: { type: "reachExit" },
  },
  {
    name: "The Lantern Run",
    themeId: "oldGuardroom",
    dungeonSizeId: "medium",
    roomCount: 8,
    category: 6,
    partyLevelRange: "11-12",
    intro: "The Board wants lantern posts tested under pressure: one straight push, no pretty detours, light every stretch, and prove the line holds when the dark presses back.",
    outro: "The final lantern catches. Behind the party, the road line shines in a clean, stubborn row.",
    goal: { type: "reachExit" },
  },
  {
    name: "The Last Milepost",
    themeId: "castleKeep",
    dungeonSizeId: "medium",
    roomCount: 9,
    category: 8,
    partyLevelRange: "15-16",
    intro: "Nella opens the sealed page at the back of the ledger. One old route still has no honest end-marker. Carry the Board's last milepost through the broken watchline and make the road official.",
    outro: "The last milepost is hammered into place. The route has a name now, and the Board has a road it can defend.",
    goal: { type: "reachExit" },
  },
];

const expeditionMilepostGoblinMonsterGroups = [
  ["humanoid", "goblin", "goblin-camp"],
  ["humanoid", "goblin"],
];

function generatedExitForDungeon(dungeon) {
  const start = dungeon?.startPosition ?? { x: 0, y: 0 };
  const exitRoom = dungeon?.rooms?.at?.(-1) ?? dungeon?.rooms?.[0];
  const position = exitRoom?.cells
    ?.slice()
    .sort((a, b) => Math.abs(b.x - start.x) + Math.abs(b.y - start.y) - (Math.abs(a.x - start.x) + Math.abs(a.y - start.y)))?.[0] ?? start;
  return { roomId: exitRoom?.id ?? dungeon?.entranceRoomId ?? "room-0", position: { ...position } };
}

function expeditionMilepostTemplate(campaignId, index) {
  const mission = expeditionMilepostMissions[index - 1];
  if (!mission || !window.DungeonGenerator?.generateDungeon) return null;
  const generatorOverrides = {
    layout: "linear",
    roomCount: mission.roomCount,
    gridSize: 96,
    corridorLength: { min: 4, max: 7 },
    corridorWidth: 1,
    linearRoomShapes: ["rectangle", "square"],
    linearRoomWidth: { min: 5, max: 8 },
    linearRoomHeight: { min: 4, max: 7 },
    ambientLight: "bright",
    difficultyCategory: mission.category,
    monsterTagGroups: expeditionMilepostGoblinMonsterGroups,
  };
  const dungeon = window.DungeonGenerator.generateDungeon(generatorOverrides);
  dungeon.ambientLight = "bright";
  const id = `${campaignId}-${index}`;
  return {
    id,
    name: mission.name,
    themeId: mission.themeId,
    dungeonSizeId: mission.dungeonSizeId,
    generated: {
      themeId: mission.themeId,
      dungeonSizeId: mission.dungeonSizeId,
      generatorOverrides,
    },
    dungeon,
    exit: generatedExitForDungeon(dungeon),
    goal: mission.goal,
    difficultyCategory: mission.category,
    partyLevelRange: mission.partyLevelRange,
    ambientLight: "bright",
    intro: { text: mission.intro, images: [] },
    outro: { text: mission.outro, images: [] },
    customItems: [],
    objects: [],
    monsters: [],
    campaignId,
    campaignIndex: index,
  };
}

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
  {
    id: "expedition-mileposts",
    name: "The Milepost Ledger",
    quest: {
      giver: "Nella Waymark",
      initialTitle: "Open the Milepost Ledger",
      initialDescription: "The Expedition Board has special road missions for parties trusted with real route work.",
      progressTitle: "Prove the Mileposts",
      progressDescription: "Complete the Board's straight-line road missions and bring the route proofs home.",
      completedTitle: "The Ledger Holds",
      completedDescription: "The Expedition Board has enough proof to mark the first real mileposts.",
    },
    description: "Special Expedition Board missions along dangerous old road markers.",
    count: expeditionMilepostMissions.length,
    folder: "campaigns/the-milepost-ledger",
    generator: expeditionMilepostTemplate,
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

function barrowCrownFinaleBranch(template, gameState = window.state) {
  if (!template) return null;
  const fate = gameState?.questFlags?.barrowCrownDecision;
  if (fate !== "destroy" && fate !== "claim") return template;
  const next = clone(template);
  next.barrowCrownDecision = fate;
  if (fate === "destroy") {
    return next;
  } else {
    next.name = "The Ashen Herald's Challenge";
    next.intro = {
      ...(next.intro ?? {}),
      text: "The final stair leads below the graves, below the ossuaries, below even the oldest roots of the hills.\nThere, beneath the world of the living, waits a kingdom that was never allowed to die.\nYou see stone roads lined with dead soldiers. Empty houses carved into cavern walls. Banners hang without wind. At the center of it all rises a palace of burial stone, its towers pressing against the underside of the earth.\n\nThe Barrow Crown is not on your head yet. It hangs in the air before you, black iron and old gold, cold as judgment.\n\nAt the palace gates, the Ashen Herald waits alone.\n\"You would claim what even kings failed to carry,\" it says. \"Then I must know whether you are strong enough to withstand its power, and wise enough to survive its corruption.\"\n\nBehind the Herald, in the throne hall beyond, sits the corpse of the King Beneath, wrapped in royal burial cloth and ancient armor. The Herald reaches out one ashen hand.\n\nThe corpse of the first king crumbles into dust.\n\nThe dead army rises under the Herald's command.\n\"Stand,\" the Herald says. \"Test them.\"",
    };
    next.outro = {
      ...(next.outro ?? {}),
      text: "The Ashen Herald falls to one knee, its burning wings guttering into gray ash. Around the throne hall, the dead army lowers its weapons. Not in mercy. In recognition.\n\nThe Barrow Crown drifts down from the air and waits before you, heavier than iron, colder than the grave, alive with the need to command.\n\nThe Herald looks up one last time.\n\"Then rule,\" it says. \"And pray you remain yourself long enough to understand what you have taken.\"\n\nThe crown accepts your claim.",
    };
    if (next.waveEncounter) {
      next.waveEncounter.completeLog = "The Ashen Herald is defeated. The Barrow Crown accepts its new claimant, and the exit is ready.";
      next.waveEncounter.goalText = "Survive all five waves and defeat the Ashen Herald.";
      next.waveEncounter.preWaveStories = {
        ...(next.waveEncounter.preWaveStories ?? {}),
        5: {
          title: "The Herald's Judgment",
          text: "The throne hall goes still. The army of the dead parts around the empty throne, and the Ashen Herald steps through them with ash falling from its wings.\n\n\"Enough,\" it says. \"The crown does not belong to the merely victorious. It belongs to the one who can carry command without being hollowed by it.\"\n\nA pale fire gathers in the Herald's hands. Behind it, the dust of the King Beneath scatters across the dais.\n\n\"Face me. Claim it, if you can.\"",
          actionLabel: "Face the Herald",
        },
      };
      const finalWave = next.waveEncounter.waves?.find((wave) => Math.max(1, Math.floor(Number(wave.wave) || 1)) === 5);
      if (finalWave) {
        finalWave.label = "Wave 5 - The Ashen Herald's Judgment";
        finalWave.monsters = [
          {
            id: "boss-ashen-herald",
            monsterId: "mourningDukeEidolon",
            name: "The Ashen Herald",
            isBoss: true,
            position: { x: 15, y: 5 },
            extraLoot: ["magic-undead-barrowcrown-barrow-crown"],
            overrides: {
              role: "Corrupted celestial herald of the buried dynasty",
              tags: ["celestial", "corrupted", "undead", "herald", "boss", "flying"],
              category: 3,
              maxHp: 145,
              ac: 18,
              attackBonus: 9,
              multiattack: { attacks: 2 },
              damage: { count: 3, sides: 8, bonus: 5, type: "radiant", attackType: "spell", label: "3d8 + 5 radiant", range: { kind: "melee", feet: 10 } },
              damageResistances: ["necrotic", "radiant", "fire"],
              damageVulnerabilities: ["thunder"],
              damageImmunities: ["poison"],
              conditionImmunities: ["poisoned", "charmed", "frightened"],
              specialAbility: ["Command the Dead", "SelfHeal", "Royal Wail"],
              xp: 1800,
              speedFeet: 40,
              token: "H",
            },
          },
          { monsterId: "graveMistBanshee", name: "Choir of the Herald", position: { x: 8, y: 8 } },
          { monsterId: "corpseStitchedGoliath", name: "Crown-Oath Corpse Guard", position: { x: 22, y: 8 } },
        ];
      }
    }
  }
  return next;
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
    if (typeof campaign.generator === "function") {
      cache.set(
        key,
        fetch(`${campaign.folder}/Dungeon${index}.json`)
          .then((response) => (response.ok ? response.json() : null))
          .then((template) => {
            if (!template) return campaign.generator(campaignId, index);
            const { generated, ...savedTemplate } = template;
            return { ...savedTemplate, campaignId, campaignIndex: index };
          })
          .catch(() => campaign.generator(campaignId, index)),
      );
    } else {
      cache.set(
        key,
        fetch(`${campaign.folder}/Dungeon${index}.json`)
          .then((response) => (response.ok ? response.json() : null))
          .then((template) => template ? { ...template, campaignId, campaignIndex: index } : null)
          .catch(() => null),
      );
    }
  }
  return cache.get(key).then((template) => {
    if (campaignId === "barrow-crown" && index === 7) return barrowCrownFinaleBranch(template);
    return template;
  });
}

async function originalDungeon(campaignId, index) {
  const campaign = campaigns.find((entry) => entry.id === campaignId);
  if (!campaign || index < 1 || index > campaign.count) return null;
  if (typeof campaign.generator === "function") return campaign.generator(campaignId, index);
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
