# Guild And Faction System Planning Log

Date: 2026-05-27

## High-Level Goal

Guilds should make the village feel more alive while giving dungeon runs more purpose than pure loot. Each guild can be a small faction with reputation, ranks, contracts, turn-ins, and unique rewards. Some guilds can be visible early, while others unlock through quest progress or admin mode while being developed.

The first version should stay small and data-driven:

- Add a shared faction progress model.
- Add guild NPCs or guild boards in the village.
- Let guilds offer contracts and material turn-ins.
- Unlock better stock, special services, titles, or passive preparation bonuses by rank.
- Keep faction conflict optional for later.

## Core Faction Model

Suggested state shape:

```js
state.factions = {
  monsterHunters: {
    unlocked: false,
    reputation: 0,
    rank: 0,
    activeContracts: [],
    completedContracts: [],
    claimedRankRewards: [],
    flags: {}
  }
};
```

Suggested rank names:

- Rank 0: Stranger
- Rank 1: Associate
- Rank 2: Trusted
- Rank 3: Adept
- Rank 4: Champion
- Rank 5: Guild Agent

The exact names can be faction-specific later. For example, the Gravebinders might use Initiate, Candlebearer, Warden, Exorcist, Grave-Saint instead.

Reputation sources:

- Completing guild contracts.
- Turning in requested materials.
- Killing tagged monsters during accepted contracts.
- Defeating bosses connected to a guild theme.
- Completing story quests tied to that faction.
- Discovering special dungeon rooms, relics, shrines, graves, lairs, or planar rifts.

Optional later resources:

- Hunter Marks
- Grave Seals
- Crucible Sigils
- Scholar Scrip
- Arena Glory

For the MVP, reputation alone is probably enough. Tokens are useful later if we want guild shops to feel separate from gold economy.

## Village NPC Integration

Guild NPCs can use the same unlock pattern as the alchemist and arcanist:

```js
{
  id: "village-monster-hunter-guild",
  name: "Mara Vale",
  title: "Huntmaster of the Trophy Lodge",
  type: "guild",
  factionId: "monsterHunters",
  hiddenUntilUnlocked: true,
  adminAvailable: true,
  unlockFlag: "flag.village.monsterHunterGuildUnlocked"
}
```

Useful NPC fields:

- `factionId`
- `guildType`
- `contracts`
- `turnIns`
- `rankRewards`
- `shopType`
- `buysFromParty`
- `adminAvailable`
- `unlockFlag`

The guild view should probably not be a normal shop. It should have:

- Current rank and reputation progress.
- Active contracts.
- Available contracts.
- Repeatable turn-ins.
- Rank rewards.
- Optional guild shop.

## Guild Board UI

The arcanist scroll issue showed that big flat lists get ugly fast. Guilds should use collapsible groups from the start.

Suggested sections:

- Status
- Active Contracts
- Available Contracts
- Turn-Ins
- Rank Rewards
- Guild Shop

Contract rows should show:

- Name
- Difficulty or recommended party level
- Objective
- Reward
- Reputation reward
- Accept/complete state

For admin mode:

- Unlock faction
- Add reputation
- Set rank
- Complete selected contract
- Reroll generated contracts

## Contract Types

Kill contracts:

- Kill a number of monsters with a tag, family, or exact monster id.
- Example: kill 6 beasts, 4 undead, 2 trolls, 1 named boss.

Material turn-ins:

- Pelts, fangs, claws, hides, venom sacs.
- Ectoplasm, bone dust, grave wax, cursed remains.
- Elemental motes, slag glass, crystal shards, ember cores.

Dungeon objectives:

- Cleanse a room.
- Destroy a spawner.
- Recover a relic.
- Seal a rift.
- Map a floor.
- Rescue or recover a body.

Boss warrants:

- Special high-value quests for named enemies.
- Good place for unlock flags and unique rewards.

Challenge contracts:

- Clear a dungeon without anyone falling.
- Kill a target with a specific damage type.
- Finish before a round/time limit.
- Do not use healing potions.

These should be optional and mostly later-game.

## Proposed Guilds

## Monster Hunter Guild / Trophy Lodge

Theme:

Professional hunters, trappers, trophy collectors, and practical monster experts.

Village face:

- Huntmaster of the Trophy Lodge
- Could be stern but warm, very practical, and impressed by results.

Core loop:

- Accept bounty.
- Hunt specific monster family.
- Bring trophies/materials back.
- Gain reputation.
- Unlock hunter tools and better bounties.

Buys:

- Pelts
- Fangs
- Claws
- Hides
- Venom sacs
- Monster trophies

Sells/unlocks:

- Traps
- Monster lures
- Tracking chalk
- Anti-beast oil
- Trophy kits
- Special ammunition later

Features:

- Bounty board sorted by monster family.
- "Preferred Quarry" rank perk: choose one monster family for a small preparation bonus.
- Bestiary insight: reveal resistances/vulnerabilities for contracted targets.
- Trophy display furniture for the home.
- Extra reward for first kill of a new monster type.

Example contracts:

- Wolf Trouble: kill 5 beasts.
- Fang Ledger: turn in 6 fangs or claws.
- Big Game Warrant: defeat a large or elite monster.
- A Pelt Too Clean: bring back an intact hide from a stronger beast.

Good MVP candidate because monster kills are already central to the game.

## Gravebinders / Order Against The Undead

Theme:

An order of wardens, exorcists, undertakers, and oathkeepers who oppose restless dead.

Village face:

- Gravebinder Warden
- Quiet, severe, respectful toward the dead.

Core loop:

- Accept undead contracts.
- Recover remains or cursed relics.
- Cleanse rooms or destroy necromantic anchors.
- Gain reputation and unlock anti-undead services.

Buys:

- Ectoplasm
- Bone dust
- Grave wax
- Cursed remains
- Haunted relics
- Ash from undead bosses

Sells/unlocks:

- Holy water
- Grave salt
- Consecrated lantern oil
- Anti-undead charms
- Necrotic resistance consumables
- Turn-undead style scrolls or services later

Features:

- Cheaper resurrection or corpse recovery at higher rank.
- Reduced death penalty in undead dungeons.
- Cleanse graveyard projects in the village.
- Special rewards for returning named remains instead of selling them.
- Possible conflict later with necromancer or black-market factions.

Example contracts:

- Ashes That Walk: destroy 8 undead.
- Names For The Nameless: recover remains from a crypt.
- Seal The Open Grave: cleanse a necromantic room.
- Candle In The Barrow: defeat an undead elite while carrying a warding lantern.

Strong second MVP because it gives undead dungeons a distinct identity.

## Elementalist Circle / Crucible Collegium

Theme:

Planar researchers, elemental wardens, and dangerous experimenters.

Village face:

- Crucible Savant
- More academic than Fizzwick, but still very comfortable around explosions.

Core loop:

- Fight elementals or survive elemental hazards.
- Bring back elemental essences.
- Unlock resistance tools and elemental recipes.

Buys:

- Ember cores
- Frost motes
- Storm glass
- Crystal shards
- Slag glass
- Elemental essences

Sells/unlocks:

- Elemental resistance potions.
- Elemental bombs.
- Hazard-clearing kits.
- Temporary elemental attunements.

Features:

- Attune to one element before a dungeon for a temporary resistance.
- Reroll or weaken some elemental hazards.
- Unlock stronger bomb variants for the alchemist.
- Special contracts for rifts, portals, and elemental rooms.

This guild can connect nicely to Fizzwick's boom-focused alchemy without replacing him.

## Relic Scholars / Antiquarian Society

Theme:

Historians, scroll-readers, artifact catalogers, and rich collectors with opinions.

Village face:

- Senior Antiquarian
- Polite, nosy, and a little too excited about cursed objects.

Core loop:

- Recover tomes, relics, maps, tablets, and inscriptions.
- Gain reputation for first discoveries.
- Unlock identification, lore, and dungeon information services.

Buys:

- Ancient tomes
- Relics
- Tablets
- Maps
- Strange keys
- Inscribed stones

Sells/unlocks:

- Identification services.
- Lore hints.
- Map fragments.
- Scroll discounts or special scroll stock.
- Dungeon room previews.

Features:

- Better rewards for unique relics than ordinary selling.
- First-discovery reputation when entering rare rooms.
- Archive UI that records discovered lore.
- Synergy with Master Arcanist, maybe unlocking limited discounts despite his attitude.

This faction can support exploration players who like lore and completion.

## Adventurers' League / Expedition Board

Theme:

The broad, practical guild for dungeon delvers.

Village face:

- Expedition Marshal
- Efficient, organized, a little tired.

Core loop:

- Complete general dungeon goals.
- Earn reputation for mapping, survival, and party achievements.
- Unlock convenience systems.

Buys:

- Maybe nothing special.
- Could accept maps, scouting notes, and proof of floor completion.

Sells/unlocks:

- Insurance.
- Basic supply bundles.
- Recruit introductions.
- Camp upgrades.
- Dungeon preparation services.

Features:

- Daily/weekly expedition contracts.
- Mapping contracts.
- No-death run bonus.
- New recruit availability at higher ranks.
- Party prestige titles.

This might be the "default" guild if the game needs one faction that every party naturally touches.

## Black Powder League / Fizzwick's Boom Club

Theme:

Not necessarily a formal guild. More like Fizzwick's circle of enthusiasts, powder merchants, and nervous investors.

Village face:

- Fizzwick Boomwhistle can anchor this.

Core loop:

- Turn in volatile materials.
- Test explosive consumables.
- Unlock bomb recipes.

Buys:

- Brimstone
- Coal
- Hellfire ember
- Slag glass
- Crystal shards
- Fire reagents
- Volatile alchemical materials

Sells/unlocks:

- Alchemist's Fire
- Stronger bomb tiers
- Smoke bombs
- Flash powder
- Acid flasks
- Blast-resistant gloves

Features:

- Experimental contracts with risky bonus rewards.
- Test a bomb in a dungeon and report back.
- Unlock thrown consumable variants.
- Chance of discount or bonus stock after successful tests.

This can reuse the alchemist's current material request flavor.

## Arena / Fighting Pit

Theme:

A glory track instead of a normal guild.

Village face:

- Pitmaster
- Loud, theatrical, and extremely practical about injuries.

Core loop:

- Fight waves or duel champions.
- Earn glory.
- Unlock titles, wagers, and special rewards.

Buys:

- Nothing, or maybe trophies from arena champions.

Sells/unlocks:

- Special training.
- Cosmetic titles.
- Wager options.
- Rare recruit introductions.
- Spectator favor buffs.

Features:

- Wave fights.
- Boss rematches.
- Class-specific challenges.
- Party survival challenges.
- Glory leaderboard.

This should probably come after the first guild MVP because it needs separate encounter flow.

## Faction Conflict And Affinity

This can wait until guilds are useful on their own.

Lightweight version:

- Some actions give small reputation to one faction and reduce reputation with another.
- Example: selling haunted relics to scholars may annoy Gravebinders.
- Example: helping necromantic interests would anger Gravebinders.

Safer first version:

- No reputation penalties.
- Instead, use "affinity" flags for special dialogue and future branching.

Reason:

Permanent penalties can make players feel punished for experimenting. Positive-only reputation is friendlier for the first implementation.

## Rewards That Avoid Power Creep

Best reward types:

- Consumables.
- Discounts.
- Information.
- One-run preparation buffs.
- Special contracts.
- Village/home cosmetics.
- Convenience services.
- New shop stock.

Use permanent combat bonuses carefully. If used, keep them small and thematic.

Good examples:

- Monster Hunter rank 2: reveal target family traits during active contracts.
- Gravebinder rank 2: cheaper corpse recovery after undead dungeon deaths.
- Elementalist rank 2: once per dungeon, choose a minor resistance prep.
- Scholars rank 2: identify one relic per visit at a discount.
- Adventurers' League rank 2: one free basic supply bundle per dungeon.

## Implementation Suggestions

Potential new files:

- `src/scripts/content/factions/guilds.js`
- `src/scripts/content/factions/contracts.js`
- `src/scripts/app/faction-state.js`
- `src/scripts/app/rendering-guilds.js`

Useful helper functions:

- `getFactionProgress(factionId)`
- `addFactionReputation(factionId, amount, reason)`
- `getFactionRank(factionId)`
- `factionIsUnlocked(factionId)`
- `acceptGuildContract(factionId, contractId)`
- `completeGuildContract(factionId, contractId)`
- `recordFactionMonsterKill(monster, context)`
- `completeFactionTurnIn(factionId, turnInId)`

Existing systems to connect:

- Village NPC rendering.
- Quest log rendering.
- Monster defeat/combat result hooks.
- Material commission system.
- Inventory resource/satchel handling.
- Admin mode unlock helpers.

The material commission system can probably become a generic "turn-in request" system instead of each NPC having a custom path.

## MVP Order

1. Add a faction registry and faction progress state.
2. Add helpers for reputation, rank, unlocks, and admin testing.
3. Add a generic guild view for one NPC.
4. Implement Monster Hunter Guild with:
   - One kill contract.
   - One material turn-in.
   - One rank reward.
   - Admin unlock.
5. Add contract progress tracking on monster defeat.
6. Add Gravebinders with undead-focused contracts and turn-ins.
7. Add rank-based shop unlocks.
8. Add generated weekly contracts if the static version feels good.

## First Two Guilds To Build

Recommended first:

- Monster Hunter Guild.

Reason:

- It works with the current combat loop.
- It gives immediate use to monster drops.
- It can start simple and still feel meaningful.

Recommended second:

- Gravebinders.

Reason:

- It makes undead content more flavorful.
- It can connect to death, resurrection, corpse recovery, and graveyard features.
- It creates a strong contrast with the practical hunter guild.

## Early Contract Examples

Monster Hunter Guild:

```js
{
  id: "wolf-trouble",
  factionId: "monsterHunters",
  name: "Wolf Trouble",
  objective: { type: "killMonsterTag", tag: "beast", count: 5 },
  rewards: { goldCp: 7500, reputation: 25 },
  minRank: 0
}
```

Gravebinders:

```js
{
  id: "ashes-that-walk",
  factionId: "gravebinders",
  name: "Ashes That Walk",
  objective: { type: "killMonsterTag", tag: "undead", count: 6 },
  rewards: { goldCp: 9000, reputation: 30 },
  minRank: 0
}
```

Material turn-in:

```js
{
  id: "fang-ledger",
  factionId: "monsterHunters",
  name: "Fang Ledger",
  requiredItems: [{ itemId: "monster-fang", quantity: 4 }],
  rewards: { goldCp: 4000, reputation: 12 },
  repeatable: true
}
```

## Open Design Questions

- Should a player be able to join every guild, or should some guilds eventually lock each other out?
- Should guild reputation be party-wide or tied to the current adventuring company?
- Should contracts be accepted manually, or should some be auto-tracked once a guild is unlocked?
- Should guilds use only gold/reputation, or should each faction eventually get its own token currency?
- Should completed contracts appear in the main quest log, a guild log, or both?
- Should village building upgrades unlock guilds, or should story quests unlock them?
- Should guilds have home/base decorations that show progression?

## Recommendation

Start with positive-only reputation, no faction penalties, and no faction currencies. Build one shared system that supports guild NPCs, contracts, turn-ins, rank rewards, and admin unlocks.

Then make the Monster Hunter Guild the first real implementation. Once that path feels solid, add Gravebinders as the second guild to prove the system supports a different theme and reward loop.

After both work, consider Elementalists, Scholars, the Adventurers' League, and the Arena.
