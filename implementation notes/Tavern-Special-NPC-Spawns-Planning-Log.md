# Tavern Special NPC Spawns Planning Log

Date: 2026-06-01

## Goal

Taverns and inns should feel alive and worth checking whenever the party arrives in a village or city. A settlement inn can occasionally host special NPCs: recruitable allies, sidekicks, shady sellers, faction contacts, quest unlockers, rumor carriers, and strange one-off visitors.

The system should work for generated settlements without requiring hand-authored NPCs for every village. Later, specific story NPCs can override or reserve slots in named settlements.

## Design Principles

- Taverns are temporary homes, so NPCs should live in the inn UI and optionally appear as tokens on the inn map.
- The player should immediately understand why an NPC matters: Recruit, Vendor, Faction, Quest, Rumor, Service, or Stranger.
- Important unlock NPCs should not disappear forever because of one bad roll. They should either persist until handled or enter a rotation with a memory flag.
- Settlement identity matters. A mining town should attract different people than a harbor city, swamp village, shrine town, or frontier ruin stop.
- NPCs should be data-driven. Adding a new tavern NPC should be mostly one entry in a catalogue.
- The system should not unlock major factions accidentally before we decide their main unlock route. Faction representatives can be present as "rumor-only" or "teaser" entries until the unlock is enabled.

## Core System Proposal

### Save Data

Add settlement-level tavern state under the existing settlement profile:

```js
profile.tavern = {
  seed,
  lastRefreshDay,
  refreshIndex,
  npcSlots: [],
  seenNpcIds: {},
  persistentNpcIds: [],
  completedNpcIds: {},
}
```

Global memory can live in world state:

```js
state.world.tavernNpcHistory = {
  met: {},
  recruited: {},
  unlocked: {},
  completed: {},
  dismissed: {},
}
```

### NPC Catalogue Shape

```js
{
  id: "wandering-shieldbearer",
  name: "Marek Voss",
  title: "Wandering Shieldbearer",
  role: "recruit",
  rarity: "common",
  settlementTypes: ["village", "city"],
  biomeTags: ["grassland", "hills", "highlands"],
  settlementTraits: ["market-day", "stonebound"],
  minPartyLevel: 1,
  maxPartyLevel: 6,
  weight: 80,
  persistence: "until-recruited",
  tokenArt: "assets/tokens/marek-voss.jpg",
  portrait: "assets/npcs/marek-voss.jpg",
  spawnTags: ["front-room", "near-fireplace"],
  dialogueId: "tavern.marek-voss",
  actions: [
    { type: "recruitSidekick", templateId: "shieldbearer-sidekick", costCp: 0 },
    { type: "rumor", rumorPool: "local-danger" }
  ]
}
```

### Refresh Rules

- Normal tavern visitors refresh every 3 to 7 days.
- Rare visitors refresh every 10 to 20 days.
- Persistent visitors remain until their key interaction is resolved.
- Recruitable sidekicks remain for at least 7 days once generated.
- Story and faction unlock NPCs remain until their unlock conversation is completed.
- Do not replace visible NPCs while the player is inside the inn menu.

### Slot Counts

- Village inn: 1 to 2 special NPC slots.
- City inn: 2 to 4 special NPC slots.
- Home village tavern later: can have curated story arrivals, not random by default.
- Remote or dangerous settlements: fewer safe vendors, more scouts, hunters, cursed travelers, and wounded adventurers.

### Spawn Placement In Inn Maps

Use furniture tags and room zones:

- Bar: sellers, rumor brokers, faction contacts.
- Tables: quest givers, travelers, merchants.
- Fireplace: recruits, wounded adventurers, storytellers.
- Private booth: shady sellers, spies, noble agents.
- Corner or doorway: bounty hunters, scouts, suspicious strangers.
- Guest rooms: exhausted sidekicks, hidden story NPCs.

If the layout has no special spawn markers, use fallback floor cells near the bar or tables.

### UI Flow

In the temporary home inn menu:

- Add `Tavern Guests` or `Common Room` below `Village` and `Adventure`.
- Show cards for spawned NPCs with role labels: Recruit, Vendor, Faction, Quest, Rumor, Service, Stranger.
- Clicking an NPC opens a dialogue/service panel.
- NPC tokens on the inn map can also open the same panel when interacted with.

### Player-Facing States

- New: NPC has not been spoken to.
- Met: player opened dialogue once.
- Waiting: NPC has an unresolved offer.
- Recruited: NPC joined roster or sidekick pool.
- Completed: NPC quest/service/unlock was handled.
- Gone: NPC left after deadline or dismissal.

## Spawn Filters

### By Settlement Type

- Villages: local helpers, herbalists, hunters, retired guards, desperate sidekicks, small quest hooks.
- Cities: better vendors, faction representatives, wealthy patrons, rare recruits, black-market dealers.
- Harbor/coast settlements: sailors, smugglers, navigators, storm priests, pearl divers.
- Mining settlements: delvers, ore brokers, cave scouts, wounded miners, Embervein rumor NPCs.
- Shrine settlements: pilgrims, acolytes, cursed travelers, relic seekers.
- Frontier villages: scouts, monster hunters, missing-person quest givers, caravan guards.

### By Biome

- Forest/Jungle: rangers, herbalists, druids, lost nobles, beast tamers, plant-curse victims.
- Swamp: leech doctors, marsh guides, graveboat ferrymen, disease cure sellers.
- Mountain/Highlands/Hills: climbers, miners, stone priests, goat-path scouts, avalanche survivors.
- Desert/Savanna/Badlands: water sellers, caravan masters, sun cult pilgrims, ruin guides.
- Coast/Ocean: sailors, navigators, pearl traders, wreck survivors, tide mages.
- Volcano/Ashland: fire cult defectors, forge scouts, heat-sick mercenaries.
- Arctic: fur traders, ice guides, frost-cursed refugees, white-waste hunters.
- Urban: spies, debt collectors, duelists, guild factors, black-market sellers.

## Spawn Categories

### Recruitable Sidekicks

Recruitable NPCs can join the roster as AI allies/sidekicks. They should be weaker or narrower than full heroes unless upgraded by later systems.

Possible recruitment requirements:

- Pay a signing fee.
- Pass a Persuasion/Intimidation/Performance check.
- Complete a small favor.
- Clear a local dungeon.
- Have a matching faction rank.
- Have room in the active party or roster.

### Shady Sellers

These sell unusual stock outside normal storefront rules.

Possible constraints:

- Limited stock.
- Overpriced magic items.
- Chance of cursed items.
- Reputation or skill check can reveal item quality.
- Some disappear after one purchase.
- Some require the party to be in a city.

### Faction Representatives

Faction NPCs can:

- Tease a faction without unlocking it.
- Unlock the faction once design allows it.
- Offer a starter contract.
- Point to the settlement where the faction has a real branch.
- Appear only in cities, or in settlements with matching traits.


### Quest Unlock NPCs

These open one-shot dungeons, settlement-specific jobs, burrow hunts, missing-person hooks, or later main-story side branches.

Quest NPCs should usually persist until the player accepts or refuses their first hook.

### Rumor NPCs

Rumor NPCs give:

- Nearby structure hints.
- Biome danger hints.
- Monster lair warnings.
- Shop/service hints.
- Teleport circle lore.
- Faction teasers.
- Road-building rumors once Expedition Board is ready.

## Extensive NPC Catalogue

### Recruitable Allies And Sidekicks

1. Marek Voss, Wandering Shieldbearer: Common fighter sidekick. Found in villages and road towns. Wants honest work and a warm meal.
2. Talla Reed, Hedge Archer: Ranged scout sidekick. Forest, grassland, and village inns. Can teach basic tracking rumors.
3. Brother Caldus, Tired Acolyte: Healer-support sidekick. Shrine towns and cities. Joins after the party helps pay temple debt.
4. Sera Flintstep, Caravan Knife: Rogue-skirmisher sidekick. Desert, savanna, badlands. Requires a small signing fee.
5. Odrin Bell, Retired Pit Bruiser: Tanky melee sidekick. City taverns with fighting pit access. Likes parties with pit renown.
6. Lysa Quill, Apprentice Scribe-Mage: Low-level utility caster. Cities and academy-adjacent towns. Wants relic notes.
7. Bram Kettle, Camp Cook: Noncombat camp follower or weak sidekick. Improves ration use and inn/camp food events.
8. Nessa Vale, Beast-Touched Ranger: Ranger sidekick. Forest/jungle villages. May bring a small animal companion later.
9. Torv Ashhand, Mine Delver: Durable miner sidekick. Mining settlements and mountain inns. Gives mine/Embervein hints.
10. Ina of the Lantern, Grave Tender: Anti-undead support sidekick. Graveyard-heavy towns, temples, and haunted areas.
11. Kel Marrow, Former Bandit: Rogue sidekick. Shady city inns. Requires Insight or Persuasion to trust.
12. Mirren Glass, Duelist Out Of Coin: Dexterity melee sidekick. Cities, noble districts, wealthy taverns.
13. Hobb Three-Shoes, Lucky Porter: Weak combatant, strong exploration helper. Helps carry loot and reduces travel mishaps.
14. Edda Frostwake, Ice Guide: Arctic/highland recruit. Helps foraging and cold events.
15. Joric Tan, River Spear: Coast/swamp recruit. Good around water and beasts.
16. Pella Wicks, Torchbearer: Cheap low-level helper. Improves light handling and trap caution.
17. Durn Copperjaw, Debt-Bound Guard: Heavy guard sidekick. Can be recruited by paying debt or intimidating creditor.
18. Veyra Softstep, Quiet Burglar: Stealth recruit. Cities and wealthy inns. May conflict with lawful faction contacts.
19. Rowan Briar, Field Medic: Healing-kit support sidekick. Common after plague/disease events.
20. Maela Songturn, Tavern Performer: Bardic support sidekick. Can play instruments and improve inn morale.

### Shady Magic Item Sellers

21. Silk Naro, Smile With Too Many Rings: Black-market trinket seller. City inns. Sells minor magic and cursed curios.
22. Old Glass Enoch, Bottle-Witch Broker: Potion and elixir seller. Swamp/city inns. Some items are unidentified.
23. Veil-Madam Corra, Private Booth Dealer: Sells scrolls, charms, and rumors. Requires city or wealthy inn layout.
24. Pell The Almost Honest: Cheap magic seller with flawed stock. Can sell fake items unless Insight succeeds.
25. Nym Understairs, Contraband Finder: Sells stolen faction gear scraps, keys, and lock tools.
26. Arvik Moonpawn, Pawned Relic Trader: Sells one expensive odd relic per visit.
27. Candle-Tooth Yara: Curse-adjacent seller. Offers strong bargains with possible side effects.
28. The Red Ledger Clerk: Sells infernal contracts, demon ichor, and dangerous services in cities.
29. Moth-Eyed Sim: Sells dream charms, sleep wards, and weird map fragments.
30. Brindle Jax, Wand Cartel Runner: Sells wands with low charges. Disappears after one purchase.
31. Sister No-Name: Sells holy relic fragments quietly outside temple channels.
32. Vargo In Ash: Volcano/forge seller with fire-resistant gear and unstable bombs.
33. The Pearl Widow: Coast seller with water-breathing items and drowned relics.
34. Lace Rem, Noble Estate Liquidator: Wealthy inn seller with aristocratic decor and rare accessories.
35. Coal-Eye Petric: Mining seller with ore charms, lanterns, and Embervein-adjacent rumors.

### Faction Representatives

36. Brakka's Runner: Fighting Pit scout. Appears in any city. Points to pit bouts and explains safe arena rules.
37. Trophy Lodge Skinner: Monster hunter contact. Offers monster-guild rumors and later unlock hooks.
38. Gravebinder Candle Acolyte: Gravebinder representative. Appears near graveyards, temples, undead-heavy regions.
39. Crucible Initiate: Crucible Collegium recruiter. Appears near shrines and elemental structures.
40. Antiquarian Field Clerk: Antiquarian Society contact. Appears near ruins, cities, and wealthy inns.
41. Expedition Board Roadwright: Expedition Board teaser. For now rumor-only until faction unlock is decided.
42. Fizzwick's Powder Cousin: Boom Club contact. Cities, mining towns, badlands, and forge areas.
43. Arena Surgeon: Fighting Pit service contact. Can preview pit safety and later sell recovery services.
44. Hunt-Tax Assessor: Monster guild bureaucrat. Unlocks bounty board later.
45. Black Ribbon Archivist: Antiquarian contact with artifact appraisal hooks.
46. Waymark Surveyor: Expedition Board map NPC. Later ties to road-building quests.
47. Elemental Writ-Bearer: Crucible faction courier with shrine directions.
48. Ash-Bell Mourner: Gravebinder quest contact for haunted sites.
49. Pit Champion In Disguise: Fighting Pit rank gate NPC for higher-tier bouts.
50. Trophy Cook: Monster guild flavor NPC who trades monster-part cooking rumors.

### Quest Unlockers

51. The Wounded Miner: Unlocks a mine rescue or Embervein side entrance.
52. A Noble With Muddy Boots: Unlocks escort, missing heir, or ruined manor hook.
53. The Silent Child With A Map: Unlocks a small forest ruin or lost shrine.
54. The Failed Adventuring Party: Offers revenge hook against a nearby dungeon boss.
55. The Drowned Sailor: Unlocks shipwreck, harbor, or underwater event.
56. The Taxed Caravan Master: Unlocks road ambush or caravan escort.
57. The Pilgrim With Broken Bells: Unlocks shrine event or curse removal chain.
58. The Farmer Counting Teeth: Unlocks burrow/lair hunt near a village.
59. The Innkeeper's Cousin: Unlocks local cellar, smugglers, or missing supplies.
60. The Blue-Sashed Courier: Unlocks message delivery between settlements.
61. The Ruin Sketcher: Unlocks ruin POI and sells a rough map.
62. The Fevered Scout: Unlocks jungle/swamp disease source dungeon.
63. The Ash-Covered Apprentice: Unlocks volcano/forge accident site.
64. The Lost Bridegroom: Unlocks ghost or fey-adjacent rescue event.
65. The Belligerent Goat-Herder: Unlocks mountain lair or cliff route event.
66. The Drunk Cartographer: Reveals a nearby undiscovered structure after a check.
67. The Soot-Black Pageboy: Noble-city quest hook involving arson or cultists.
68. The Muddy Gravedigger: Unlocks undead crawl or corpse-theft quest.
69. The Old Soldier's Medal: Starts a one-room duel, memorial, or battlefield ruin.
70. The Contract On The Table: Anonymous bounty hook for a generated monster lair.

### Rumor And Information NPCs

71. Bent-Nose Harla, Rumor Auntie: Cheap local rumors. More accurate in villages.
72. Otho Reedmap, Bad Cartographer: Structure hints with occasional wrong details.
73. Sarai Cupsong, Tavern Singer: Sings about nearby ruins, cities, faction gossip.
74. The Dice Table Regulars: Group NPC; pay drinks for three random rumors.
75. Old Mara's Cousin: Forest-specific hints, but should not trigger Old Lady Mara story beats.
76. The Weather-Lame Sailor: Coast/ocean forecasts and harbor hints.
77. The Burned Road Priest: Volcano/ashland warnings and shrine rumors.
78. The Quiet Shepherd: Burrow/lair warnings.
79. The Lantern Watchman: Undead and graveyard hints.
80. The Smiling Clerk: Storefront and service hints for the settlement.
81. The Cook Who Hears Everything: Inn gossip in exchange for buying supper.
82. The Pilgrim Chorus: Shrine and temple hints, group NPC.
83. The Card Reader: Vague hints; can reveal random nearby POI.
84. The Mine Bell Listener: Mining and underdark hints.
85. The Bridge Toll Widow: Road-building teaser for Expedition Board later.

### Service NPCs

86. Ressa Warmhands, Traveling Healer: Basic paid healing and disease check.
87. Emon Blueglass, Appraiser: Identifies magic items and cursed items.
88. Tuck Wain, Hireling Broker: Generates mundane hirelings or porters.
89. Nera Coil, Locksmith: Opens mundane locks, sells thieves' tools, gives trap tips.
90. Sister Pell, Gentle Repose Nun: Corpse preservation service where temple is absent.
91. Iron Mave, Repair Smith: Repairs gear and sells basic metalwork in inns without smiths.
92. The Bathhouse Man: Removes travel grime, gives small comfort buff in cities.
93. Saffron Jil, Spice Cook: Sells expensive meal buff, especially in cities.
94. Corven Silt, Disease Reader: Diagnoses disease before treatment.
95. The Letter Desk: Sends messages between known settlements.

### Strange One-Off Visitors

96. The Person Who Knows Tomorrow's Rain: Weather omen NPC; helps one travel day.
97. The Masked Twin: Offers a mysterious duplicate-style quest or warning.
98. The Man With The Locked Harp: Music/instrument hook.
99. The Woman Selling Her Shadow: Curse bargain.
100. The Gentleman Under The Table: Hidden noble, spy, or shapeshifter hook.
101. The Last Guest Awake: Appears only at night after long rest; starts eerie event.
102. The Ash In The Chair: Ghostly visitor tied to fire/forge deaths.
103. The Empty Armor Drinking Ale: Animated armor or cursed knight hook.
104. The Map That Ordered Soup: Living map/quest object.
105. The Door-To-Door Door Seller: Absurd but useful magic door vendor.
106. The Three Silent Musicians: Unlocks instrument/music, bardic, or fey-style event.
107. The Blue Cat Mask: Spy contact; can unlock city intrigue later.
108. The Woman With Too Many Keys: Dungeon-key rumor/service NPC.
109. The Candle That Speaks For A Dead Man: Gravebinder/undead clue.
110. The Guest Whose Reflection Pays: Mirror/curse seller.

## Rarity Bands

- Common: simple recruits, rumor NPCs, mundane service NPCs.
- Uncommon: sidekicks with stronger hooks, small quest NPCs, special vendors.
- Rare: faction contacts, magic item sellers, strong recruits, major quest unlockers.
- Legendary: strange visitors, main-story hooks, high-value sellers, unique NPCs.

## Suggested First Implementation Phase

1. Add tavern NPC catalogue module.
2. Add settlement tavern state and refresh helper.
3. Render `Tavern Guests` in settlement inn/home menu.
4. Start with harmless roles: rumor, recruit, shady seller, service.
5. Add city fighting pit representative as always available in city taverns.
6. Add faction representatives as teaser-only entries until their unlock rules are finalized.
7. Add NPC token placement in inn maps after the card UI works.

## First Safe NPC Set

Start with these before adding complex quest logic:

- Marek Voss: recruitable shieldbearer.
- Talla Reed: recruitable archer/scout.
- Bram Kettle: camp cook helper.
- Silk Naro: shady minor magic seller.
- Emon Blueglass: appraiser.
- Brakka's Runner: city fighting pit representative.
- Bent-Nose Harla: local rumor NPC.
- Wounded Miner: mine quest teaser.
- Trophy Lodge Skinner: monster hunter teaser.
- Expedition Board Roadwright: road-building teaser only, no unlock yet.

## Open Decisions

- Should sidekicks count against active party size or use a separate follower slot? they already are ai allies with their own slots and not active party size.
- Should recruitable NPCs be generated with random names, fixed names, or a mix? random but take fitting pregenerated stats as for the heros, so that they are not like totally bad in what they should do.
- Should shady sellers be able to sell cursed items before identify/curse systems are fully polished? yes
- Should faction representatives unlock factions from taverns or only point toward faction headquarters? mix of both
- Should tavern NPCs appear physically on the inn map in phase one, or start as menu cards? phsyically as tokens and then the party can go to them and talk to them.
- Should the player be able to ask the innkeeper about current guests? yeah thats cool. then add a barkeeper npc which is there always.
- Should special guests cost a room fee or drink purchase to approach? yeah why not

## Notes For Later

The Expedition Board is a perfect place to own actual road-building. Once unlocked, it can add:

- Survey contracts between known settlements.
- Road construction projects that consume gold/materials/days.
- Safer route flags between specific hexes.
- Roadside events that only enter the pool after a road exists.
- Visible player-built road overlays on the travel map.

Until then, generated worldbuilder roads should remain ignored by travel mechanics.
