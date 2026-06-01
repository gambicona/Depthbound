# Expedition Board Campaign Mileposts Planning Log

## Goal

Create a small Expedition Board campaign that makes `Campaign Mileposts` feel like faction-specific route work instead of a generic campaign-dungeon counter.

The campaign should be about proving that a road network can survive real pressure: scouting, marking, clearing hazards, defending work crews, and establishing reliable waypoints between settlements and important sites.

This should be smaller than a main story chain. It should sit beside the road-building system and give the Expedition Board its own identity.

## Current Hook

Current `Campaign Mileposts` contract:

- Requires `2` campaign-linked expeditions.
- Rewards `160 gp` and `50` Expedition Board reputation.
- Currently checks only `context.campaignId`.

Proposed change later:

- Make `Campaign Mileposts` count only campaign dungeons/events with an Expedition Board campaign id, probably `expedition-mileposts`.
- Keep the contract unlocked at `Signed Scout`.
- Use it to point players toward a 2-4 mission mini-campaign.

## Campaign Name Ideas

Preferred:

- `The Milepost Ledger`

Other usable names:

- `The First Road Charter`
- `Lanterns on the Old Track`
- `Nella's Milepost Work`
- `The Board's Bad Road`

## Campaign Premise

Nella Waymark wants the party to prove that the Expedition Board can do more than pay for reports. A road is only useful if someone can rely on it after the heroes leave.

The Board has identified an old route between the home village and the nearest important settlement or point of interest. The line is promising but not yet trustworthy. It needs mileposts, hazard marks, cleared shelters, and a final proof that travelers can survive it.

The party is asked to carry the Board's route charter into the field and turn a dangerous trail into a documented corridor.

## Tone

- Practical, grounded, and field-work focused.
- Less ancient prophecy, more mud, ledger ink, broken wagon wheels, and bad maps.
- Nella should be dry, exacting, and quietly proud when the party proves the work.
- The Board should feel like civilization being built one ugly, useful marker at a time.

## Structure

Recommended first pass: 3 missions.

This keeps the campaign small while giving `Campaign Mileposts` enough identity.

### Mission 1: Survey the Bad Mile

Theme:

- Biome dungeon based on the road target's biome.
- Usually small.

Player-facing setup:

Nella gives the party a route charter, a bundle of painted stakes, and a list of what does not count as a road report. The first milepost site is marked on the travel map.

Objective:

- Enter a short wilderness delve at or near a road project target.
- Find and mark three survey points.
- Reach the exit after placing the final milepost marker.

Dungeon concept:

- Natural hazards, blocked paths, unstable ground, abandoned campsite.
- Optional small fight against local beasts, bandits, or terrain-appropriate monsters.
- Goal object examples:
  - `Survey Stake`
  - `Washed-Out Marker`
  - `Old Cart Rut`
  - `Milepost Stone`

Completion reward:

- Expedition reputation.
- A few road-building kits.
- Unlocks the next mission.

Implementation hook:

- Campaign id: `expedition-mileposts`
- Campaign index: `1`
- Goal type: collect/place route markers.

### Mission 2: Clear the Wayhouse

Theme:

- Structure-adjacent dungeon, but still Expedition Board flavored.
- Use `oldGuardroom`, `outlawCamp`, `goblinWarren`, `forestOfTheBeasts`, or biome-specific theme depending on the map target.

Player-facing setup:

The first survey proves the road line is real, but a ruined wayhouse or natural shelter along it is unsafe. Nella wants it cleared so future road crews and caravans have somewhere to stop.

Objective options:

- Clear a ruined wayhouse.
- Recover the old wayhouse ledger.
- Defeat the current occupant leader.
- Light or repair the wayhouse lantern before leaving.

Dungeon concept:

- 2-4 room small/medium dungeon.
- A defensible shelter with signs of past travel.
- Enemies should fit the local route:
  - bandits on road/city routes
  - goblins near wilderness
  - undead if the route passes battlefield/ruin/crypt-like areas
  - beasts or monstrosities for deep wilds

Completion reward:

- More Board reputation.
- Gold.
- Roadside events become slightly more common or safer on connected roads.
- Unlocks the final proof mission.

Implementation hook:

- Campaign id: `expedition-mileposts`
- Campaign index: `2`
- Goal type: boss/leader defeated plus object interaction.

### Mission 3: The Lantern Run

Theme:

- Route defense or final proof run.
- Could be one medium dungeon, one wave-like encounter, or a travel-event chain.

Player-facing setup:

Nella refuses to certify a road just because heroes walked it once. The Board needs proof that a marked courier can follow the route under pressure. The party carries a sealed lantern from one milepost to the next.

Objective:

- Escort or carry the Board lantern through a dangerous route segment.
- Keep the lantern lit.
- Defeat the ambush/road predator/claim-jumper trying to break the route.
- Reach the final milepost.

Dungeon concept:

- Linear-ish route dungeon with road markers as progress points.
- Environmental pressure:
  - wind, rain, darkness, difficult terrain, ambush alarms.
- Final encounter:
  - a bandit road-boss,
  - a territorial beast,
  - a goblin toll-king,
  - an undead road warden,
  - or a biome-appropriate lair creature.

Completion reward:

- Big Expedition reputation bump.
- Gold.
- Several road-building kits.
- A permanent route boon for that connected road.

Possible boon:

- `Certified Road`: road events on this route are more likely to be helpful or neutral.
- `Board Mileposts`: travel tooltip shows the route as certified.
- `Courier Confidence`: inns/cities connected by certified route get a small service discount later.

Implementation hook:

- Campaign id: `expedition-mileposts`
- Campaign index: `3`
- Goal type: reach exit with route lantern intact.

## Optional Mission 4: The Charter Stone

Use later if the chain needs more weight.

Premise:

The Board wants a permanent charter stone placed at the road's far end. A rival claim, dangerous monster, or old territorial ward contests the work.

This can be a one-room boss or small site event rather than a full dungeon.

Objective:

- Place the charter stone.
- Survive the challenge.
- Return to Nella.

Reward:

- Unlock higher Expedition Board rank progression.
- Unlock advanced road projects to major POIs.
- Maybe unlock future outpost construction.

## Dynamic Target Selection

The campaign should pick a target from the current world state:

Priority:

1. Nearest discovered or generated village/city not already road-connected.
2. Nearest road project target that has been accepted.
3. Nearest important POI within 5-8 days if no settlement target exists.
4. Fallback: generated wilderness milepost site near the home village.

Target data to store:

```js
questFlags.expeditionMileposts = {
  targetId,
  targetLabel,
  targetHex,
  anchorHex,
  currentIndex,
  completed: {},
  certifiedRoutes: {}
}
```

## Player Flow

1. Player unlocks Expedition Board.
2. Player reaches `Signed Scout`.
3. `Campaign Mileposts` becomes available.
4. Accepting it opens a faction campaign entry from Nella.
5. Nella explains the chosen route and gives the first mission.
6. Each mission returns the party to the Board or camp as normal.
7. Completing two missions satisfies the existing `Campaign Mileposts` contract.
8. Completing the full chain grants a route certification boon.

## How It Should Interact With Road Building

Road-building projects and Mileposts should reinforce each other.

Road projects:

- Build physical road segments.
- Consume Road-Building Kits.
- Pay for completed infrastructure.

Mileposts campaign:

- Proves the route is reliable.
- Adds narrative/faction legitimacy.
- Unlocks safer or richer road-related systems later.

Good interaction:

- Mission rewards include road kits.
- Mission target should prefer active road projects.
- Final mission can certify a road only if at least part of the road exists, or it can certify the intended route before full construction.

Avoid:

- Requiring the entire road to be built before the campaign can start.
- Making the campaign replace the normal road project loop.

## Quest Objective Ideas

Reusable objective types:

- `placeMarkers`: interact with 2-4 marker objects.
- `recoverLedger`: collect a Board ledger from a boss or container.
- `clearWayhouse`: defeat leader and interact with hearth/lantern.
- `carryLantern`: reach exit while a party flag is active.
- `defendCrew`: survive waves or protect a stationary object.
- `certifyRoute`: mark route as certified in world state.

## Reward Ideas

Mission rewards:

- Gold.
- Expedition reputation.
- Road-building kits.
- Rations or travel supplies.
- Map rumors for nearby POIs.

Campaign completion rewards:

- Certified road flag.
- Better road events on that route.
- A small stock of free road kits.
- Unlock higher-tier Expedition Board postings.
- Optional faction gear discount or Expedition gear token later.

## Needed Implementation Pieces

Required for first pass:

- Add a dedicated Expedition campaign id.
- Add Nella dialogue/action to start the campaign when `Campaign Mileposts` is accepted.
- Generate or store the campaign target.
- Add 2-3 campaign dungeon/event generators.
- Make `Campaign Mileposts` count only `expedition-mileposts` completions, not every campaign dungeon.

Nice later:

- Route certification overlays on travel map.
- Better road event pool for certified routes.
- Roadside wayhouse temporary camp art.
- Actual protect-the-crew encounter type.
- Expedition Board rank gate for outpost construction.

## Open Decisions

- Should completing two missions finish the contract while the third remains an optional faction capstone?
- Should road certification require built road segments, or can it certify a planned route first?
- Should `Campaign Mileposts` be repeatable for different roads later?
- Should cities ask for more formal charters than villages?
- Should dangerous routes scale by party level or by target distance?

## Recommended First Implementation

Implement a 3-step chain:

1. `Survey the Bad Mile`
2. `Clear the Wayhouse`
3. `The Lantern Run`

Make the current `Campaign Mileposts` contract complete after any 2 of those 3 missions, but keep the third available for a larger route certification reward.

This makes the existing contract achievable without forcing a long faction arc, while still giving the Board a campaign identity worth expanding later.
