# Achievements And Trophies Ideas

Date: 2026-06-04

## Why This Fits Depthbound Now

Depthbound already has enough long-running systems to make achievements feel earned instead of pasted on. The strongest hooks are:

- Campaign progress in `state.campaignProgress`.
- Quest and unlock history in `state.questFlags`.
- Settlement board quests in `questFlags.settlementBoards`.
- World travel history, visited structures, teleport circles, road projects, and camp state under `state.world`.
- Faction reputation/renown loops for the Trophy Lodge, Gravebinders, Crucible Collegium, Antiquarian Society, Expedition Board, Boom Club, and Fighting Pit.
- Home building, beds, comfort, instruments, herbs, meals, storage, and furniture placement.
- Combat outcomes, boss tags, monster material drops, death saves, revives, dungeon goals, one-shot completions, and fighting pit waves.

The game does not need achievements as generic popups only. It can make them part of the world: a trophy shelf at home, a village hall ledger, faction badges, arena banners, road-charter stamps, relic plaques, and campfire stories.

## Design Goals

- Make achievements feel diegetic: things the village notices, not just a checklist.
- Track party history across saves without requiring perfect old-save data.
- Reward different play styles: explorers, decorators, arena players, faction grinders, careful survivalists, chaos players, collectors, and story finishers.
- Keep rewards mostly cosmetic, informational, or convenience-based to avoid power creep.
- Use hidden achievements sparingly for surprising moments.
- Let trophies double as home decorations later.

## Suggested Global Trophy Shape

Achievements and trophies should not live only inside one adventure save. Many of the best ideas compare multiple parties, multiple campaigns, and long-term player history, so they need a profile-wide record.

Use a global achievement profile first, then let individual saves contribute events to it.

Recommended storage:

- **Primary browser store**: `localStorage["depthbound.achievements.v1"]`.
- **Optional portable file**: `depthbound-achievements.json`, exported/imported from the save menu for players who use file saves or switch browsers.
- **Per-save snapshot**: each save can include a read-only-ish `payload.achievementSnapshot` for display/debugging, but unlock truth should come from the global profile.

This gives the player one trophy history no matter which slot, party, campaign, or file save earned the deed.

```js
{
  schemaVersion: 1,
  profileId: "local-browser-profile",
  updatedAt: 1760000000000,
  unlocked: {
    "first-blood": {
      at: 1760000000000,
      source: {
        slotId: "slot-1",
        adventureId: "2026-06-04-party-ember",
        partyName: "The Ember Company",
        worldDay: 2
      }
    },
    "road-charter": {
      at: 1760000000000,
      source: {
        saveFileName: "depthbound-slot-2.json",
        adventureId: "2026-06-01-road-test",
        partyName: "Lantern Crew",
        worldDay: 14
      },
      meta: { routeId: "...", routeLabel: "Home to Ashford" }
    }
  },
  counters: {
    lifetimeDungeonsCompleted: 24,
    lifetimeBossesDefeated: 31,
    lifetimeSettlementBoardQuestsCompleted: 9,
    lifetimeRoadSegmentsBuilt: 42,
    lifetimeUniqueStructuresVisited: 18,
    campaignsCompleted: {
      "barrow-crown": 1,
      "thornwood-pact": 1
    }
  },
  trophyCase: {
    displayed: ["first-blood", "fang-ledger", "the-ledger-holds"]
  },
  saveSources: {
    "slot-1": { lastSeenAt: 1760000000000, adventureId: "2026-06-04-party-ember" },
    "depthbound-slot-2.json": { lastSeenAt: 1760000000000, adventureId: "2026-06-01-road-test" }
  }
}
```

Important rule: adventure saves should record what happened in that adventure, but the global profile decides whether a trophy has been unlocked before.

Good helper names:

```js
loadAchievementProfile()
saveAchievementProfile(profile)
exportAchievementProfile()
importAchievementProfile(file)
recordAchievementEvent(event, state)
unlockAchievement(achievementId, source, meta)
incrementLifetimeCounter(counterId, amount, source)
mergeAchievementProfiles(baseProfile, importedProfile)
```

The merge rule should keep the earliest unlock timestamp for each achievement, add lifetime counters carefully, and union known campaign completions, unique monsters, unique structures, and displayed trophies.

## Adventure Save Contribution Shape

Each normal save can keep lightweight local history so the global profile can be rebuilt or merged later.

```js
payload.state.questFlags.achievementEvents = [
  {
    id: "first-blood",
    at: 1760000000000,
    worldDay: 2,
    type: "unlock",
    meta: { monsterId: "skeletal-spearman" }
  },
  {
    id: "dungeon-completed",
    at: 1760000000000,
    worldDay: 3,
    type: "counter",
    amount: 1,
    meta: { dungeonName: "The Old Guardroom" }
  }
];
```

This is not the primary trophy record. It is a contribution log that helps file saves update the global profile when loaded or imported.

For old saves without this field, detect obvious achievements from existing state on load and mark them as inferred:

```js
unlockAchievement("old-world-walker", source, { inferred: true });
```

## Storage Flow

For normal browser slot saves:

1. Load the save.
2. Load `depthbound.achievements.v1` from localStorage.
3. Reconcile the save's `achievementEvents` into the global profile.
4. During play, achievement checks write to the global profile immediately.
5. Saving the adventure writes only the current adventure state plus an optional snapshot.

For file saves:

1. Loading `depthbound-slot-n.json` imports that adventure's contribution events into the global profile.
2. Unlocks during play still write to localStorage.
3. The player can export `depthbound-achievements.json` from the save/load menu.
4. The player can import that trophy file on another browser or machine and merge it with the current local profile.

If localStorage is unavailable, keep an in-memory profile for the session and offer an export prompt from the trophies screen.

## Achievement Types

- **Milestone**: unlocked by normal progress.
- **Challenge**: requires a special constraint, such as no deaths or no long rest.
- **Collection**: counts unique themes, trophies, relics, monsters, roads, circles, or furniture.
- **Faction Badge**: tied to rank, reputation, contracts, and turn-ins.
- **World Deed**: tied to travel, structures, roads, camps, and teleport circles.
- **Home Trophy**: visible decoration or plaque in the home.
- **Secret**: hidden until earned.

## First Implementation Pass

Start with achievements that can be detected from existing state with low risk:

1. Dungeon completions from `state.completed`, `campaignProgress`, and one-shot completion flags.
2. Campaign milestones from `state.campaignProgress`.
3. Settlement board quest completions from board quest `completedDay` / `claimedDay`.
4. Faction ranks and Fighting Pit renown from current faction progress.
5. World deeds from `state.world.visitedStructures`, `state.world.teleportCircles`, and road project flags.
6. Home deeds from `state.home.objects`, assigned beds, herbs, meals, instruments, and comfort totals.

Avoid starting with fragile combat constraints like "no damage" unless a reliable dungeon-run stats object is added.

## Core Achievement Ideas

### First Steps

- **Boots On The Stone**: Complete the first dungeon.
- **The Door Opens Both Ways**: Return home from a dungeon and save the party state.
- **Pack Weight Wisdom**: Move loot from heroes into party storage or the home chest for the first time.
- **The First Good Bed**: Assign a hero to a proper bed at home.
- **Soup Before Steel**: Cook a hearty meal before leaving on an adventure.
- **Green Thumb, Red Hands**: Harvest the home herb garden and clear a dungeon before it regrows.

### Dungeon And Combat

- **First Blood**: Defeat the first monster.
- **Boss Key Without The Key**: Complete a `killBoss` dungeon goal.
- **The Room Falls Quiet**: Clear a wave encounter.
- **Nobody Stayed Down**: Complete a dungeon where every hero rolled death saves but everyone returned alive.
- **Last Breath Stand**: Win a fight after a hero succeeds on death saves.
- **The Healer Was Busy**: Revive a dead companion with a spell.
- **Clean Exit**: Complete a dungeon without any hero dying.
- **One More Door**: Complete a dungeon after using the last available short rest.
- **Bring A Lantern Next Time**: Complete a dungeon with darkness or light-source pressure active.
- **The Boss Had Pockets**: Loot a magic item from a boss.
- **Twelve Rounds Later**: Defeat a boss after a long fight.
- **No Potion Panic**: Complete a dungeon without drinking a healing potion.
- **Every Exit Is A Plan**: Complete each custom goal type once: reach exit, collect item, kill boss, kill monster type, interact object, escort NPC.

### Campaigns

- **Crowned In Barrow Dust**: Finish The Barrow Crown.
- **The Pact Breaker**: Finish The Thornwood Pact.
- **First Claim Returned**: Finish The First Claim Of Embervein.
- **The Ember Oath Reforged**: Finish The Dwarven Smithy Ember Oath.
- **The Ledger Holds**: Finish The Milepost Ledger.
- **Seven Doors Deep**: Complete seven campaign dungeons in one campaign.
- **Story Keeper**: Finish three different campaigns on one save.
- **The Old Road Remembers**: Complete an Expedition Mileposts mission connected to a road project.

### Settlement Boards

- **Posted Work**: Accept the first settlement board quest.
- **Stamp Paid**: Claim the first completed settlement board reward.
- **Local Hero**: Complete three quests from the home village board.
- **Good Name, Bad Roads**: Complete quests for three different settlements.
- **No Suitable Nearby Work**: Reveal a settlement board with no candidates after scouting the nearby map.
- **Target On The Map**: Travel to a quest-marked hex and resolve the board objective.
- **Board Regular**: Complete ten settlement board quests.

### World Travel

- **Past The Last Fence**: Leave the home village by world travel.
- **A Day Out**: Travel one day from home and make camp.
- **Good Camp**: Prepare a successful travel camp.
- **Hungry Road**: Rest at camp after running out of rations.
- **Inn Lights**: Spend the night at a generated inn.
- **First Stranger Road**: Visit a non-home settlement.
- **Marked On The Map**: Visit ten unique structures.
- **The Long Way Around**: Travel a route of five or more days.
- **No World Map Left Behind**: Load an old save and generate a missing world map through the migration helper.
- **Old Circle, New Shortcut**: Discover the first non-home teleportation circle.
- **Circle Maker**: Buy and place an Expedition teleportation circle charter.
- **The Map Has Teeth**: Trigger a structure event that starts a fight.
- **Useful Detour**: Resolve a travel event that grants supplies or money.

### Roads And Expedition Work

- **One Segment Safer**: Build the first road segment.
- **Road Kit Well Spent**: Spend a road-building kit during travel.
- **Line On The Ledger**: Complete the first Expedition Board road project.
- **Chartered Route**: Finish a road project between home and another settlement.
- **Board Engineer**: Build twenty road segments.
- **Wayhouse Cleared**: Complete a road-related structure mission.
- **The Lantern Run**: Complete the final Milepost Ledger mission.
- **Cart Could Survive This**: Build or certify a route with at least five connected road segments.
- **Roads Before Glory**: Reach high Expedition Board reputation before finishing a main campaign.

### Factions

- **Lodge Card**: Unlock the Trophy Lodge.
- **Clean Trophy**: Complete the first Trophy Lodge turn-in or contract.
- **Grave Candle**: Unlock the Gravebinders.
- **Names For The Nameless**: Complete a Gravebinder undead contract.
- **Element Logged**: Complete a Crucible Collegium elemental commission.
- **Do Not Shake The Box**: Complete a Boom Club volatile sample turn-in.
- **Catalogued, Not Cursed**: Complete an Antiquarian Society relic or tome turn-in.
- **Signed Scout**: Reach the first meaningful Expedition Board rank.
- **Guild Favorite**: Reach high rank with any faction.
- **Village Famous**: Reach high rank with three factions.
- **Everyone Has Opinions**: Unlock every current village faction.
- **Full Set Patron**: Buy or earn every piece of one faction gear set.
- **Rank Has Perks**: Claim a faction rank reward.

### Fighting Pit

- **Bell Rings Once**: Clear the first Fighting Pit wave.
- **Category Climber**: Defeat the first Pit boss wave.
- **No Feather Beds**: Clear three waves using only the pit's short-rest checkpoints.
- **Crowd Favorite**: Earn 200 Fighting Pit renown.
- **Ironbell Regular**: Reach the second Pit rank.
- **Boss Bell**: Defeat a boss at category 3 or higher.
- **Still Standing**: Clear a wave where at least one hero dropped to 0 HP.
- **Glory-King Candidate**: Reach the highest Pit rank.

### Home And Comfort

- **A Place To Fall Over**: Place the first home furniture item.
- **Assigned Quarters**: Assign beds to every roster hero.
- **Comfort Zone**: Give one hero at least 10 comfort.
- **Company House**: Give every roster hero at least 5 comfort.
- **Room With A Tune**: Play an instrument at home.
- **The House Sings Back**: Play a magical/autoplay instrument.
- **Pantry Logic**: Store rations, herbs, or potions at home.
- **Herbal Rotation**: Harvest the herb garden five times.
- **Feast Before The Dark**: Cook ten hearty meals across a save.
- **Interior Adventurer**: Place twenty home objects.
- **Trophy Wall**: Display five unlocked trophy plaques once trophy display exists.

### Collections

- **Monster Notebook**: Defeat one monster from five different tags or families.
- **Big Game Shelf**: Collect five different monster-part trophy items.
- **Fang Ledger**: Turn in fangs, claws, hides, or horns to the Trophy Lodge.
- **Ash And Bone**: Collect grave materials from undead.
- **Element Jar**: Collect materials tied to fire, water, air, and earth.
- **Relic Drawer**: Own five relic, tome, tablet, map, or handout-style items.
- **Pack Opener**: Open a provision/medicine/resource pack once those pack items are added.
- **Set Dresser**: Equip three matching faction set pieces on one hero.
- **The Whole Cabinet**: Complete one full faction equipment set.

### Secrets And Oddities

- **It Was Furniture**: Defeat a construct or ambush creature that began as a dungeon object once hiding monsters are added.
- **The Grass Moved First**: Defeat a hidden assassin or concealed ambusher once that wishlist feature exists.
- **Wet Boots, Better Choices**: Use water, oil, or acid-soaked tiles tactically once temporary soaked tiles exist.
- **Under The Surface**: Complete an underwater dungeon after underwater content ships.
- **Bad Idea, Good Story**: Survive a travel event failure that starts a fight.
- **The Crown Disagrees**: Trigger a Barrow Crown death-prevention or soul-trap effect.
- **Promptly Ignored**: Complete a dungeon after rejecting or canceling an optional contract tied to it.

## Physical Trophy Ideas

These would become home decorations, faction hall displays, or village plaques.

- **Boss Skull Plaque**: Awarded for first boss defeat; displayable at home.
- **Road Charter Frame**: Awarded for first completed road project.
- **Pit Banner**: Awarded for a Pit boss checkpoint.
- **Grave Candle Stand**: Awarded for Gravebinder rank.
- **Hunter's Clean Hook**: Awarded for Trophy Lodge turn-ins.
- **Collegium Element Jar**: Awarded for collecting all four elemental material families.
- **Antiquarian Label Cabinet**: Awarded for turning in unique relics.
- **Milepost Stone Miniature**: Awarded for finishing The Milepost Ledger.
- **Campaign Banner**: One banner per completed campaign.
- **Teleport Circle Chalkboard**: Awarded for placing an Expedition circle.

Implementation idea: each achievement can optionally include:

```js
trophy: {
  furnitureId: "achievement-road-charter-frame",
  displayName: "Road Charter Frame",
  category: "wall"
}
```

The home builder can then list unlocked trophy furniture in a "Trophies" catalogue group.

## Achievement UI Ideas

- Add a **Trophies** tab to the home menu or party journal.
- Show locked achievements as silhouettes when not secret.
- Use dense cards matching the existing Verdigris UI.
- Let each card show:
  - Name.
  - Short flavor line.
  - Progress counter if applicable.
  - Unlock day.
  - Source category.
  - Display toggle if it grants a trophy.
- Add small toast/log entries: `Trophy unlocked: Road Charter Frame`.
- Add an optional "Recent Trophies" panel in the home menu.

## Counter Hooks Worth Adding

To support richer challenge achievements, add lightweight run stats when a dungeon starts:

```js
state.runStats = {
  dungeonStartedAtWorldDay: state.worldDay,
  monstersDefeated: 0,
  bossesDefeated: 0,
  heroesDroppedToZero: 0,
  heroesDied: 0,
  revivesCast: 0,
  potionsDrunk: 0,
  shortRestsTaken: 0,
  longRestsTaken: 0,
  trapsTriggered: 0,
  secretDoorsFound: 0,
  roomsDiscovered: 0,
  damageTaken: 0,
  damageDealt: 0
};
```

Then fold totals into the global achievement profile when the dungeon ends or the party returns home. The current save can also keep the raw run summary as an adventure event so file-save imports can rebuild the same global counters later.

## Suggested MVP Achievement List

Start with these 20 because they are broad, satisfying, and mostly easy to detect:

1. Boots On The Stone
2. First Blood
3. Boss Key Without The Key
4. Clean Exit
5. The First Good Bed
6. Soup Before Steel
7. Past The Last Fence
8. A Day Out
9. First Stranger Road
10. Posted Work
11. Stamp Paid
12. One Segment Safer
13. Line On The Ledger
14. Old Circle, New Shortcut
15. Lodge Card
16. Clean Trophy
17. Bell Rings Once
18. Category Climber
19. Campaign Banner: Barrow Crown
20. Trophy Wall

## Later Expansion Ideas

- Achievement-based title selection for the party.
- Trophy display furniture with inspectable stories.
- Faction representatives commenting on achievements.
- A village "Hall Of Deeds" board that summarizes the save.
- Rare achievements that unlock cosmetic furniture only, not power.
- Optional exportable "adventure chronicle" summarizing unlocked achievements and major campaign events.

## Recommendation

Build the system as a party history layer first, not a reward economy. The best immediate value is making the save feel remembered: where the party went, who noticed, what was displayed at home, and which bad ideas somehow became famous.
