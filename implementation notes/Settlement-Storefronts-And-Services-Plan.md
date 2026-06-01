# Settlement Storefronts And Services Plan

## Goal

Make villages and cities feel distinct when discovered through world travel. The home village can keep its hand-authored NPCs, quests, and faction hooks. Other settlements should use generic but flavorful storefronts and service stations with different stock pools, prices, and availability.

The first implementation should focus on:

- giving each village or city a stable set of generated shops;
- letting shops sell from small, understandable item categories;
- allowing services such as disease treatment, curse removal, exhaustion recovery, paid meals, lodging, and revival;
- making the village/city menu feel local without needing custom quest NPCs yet;
- leaving clean hooks for later quest boards and faction access.

## Current Content Buckets To Reuse

Existing item and service categories already support these settlement shops:

- Travel supplies: `trail-ration`, `torch`, `hooded-lantern`, `lantern-oil`, ammunition.
- Basic healing: `potion-healing` and later stronger potions or remedies.
- Weapons: standard non-magic weapons from `equipment.js`, split by simple/martial, melee/ranged, rural/mining/military flavor.
- Armor: standard non-magic armor and shields from `equipment.js`, split by light/medium/heavy.
- Camp gear: current camp furniture options such as bedroll, lantern, folding stool, etc.
- Home decor: home furniture from `home-decor-pack.js`, currently tiered as squalid, poor, modest, comfortable, wealthy, aristocratic.
- Alchemical stock: thrown flasks, magic potions, resistance/breath potions, poison-adjacent content, but keep illegal poisons out of ordinary stores unless a black market shop exists.
- Services: cure disease exists through apothecary treatment, corpse revival exists through spell/corpse handling, curse removal exists in arcanist/wizard-style service code, hunger/exhaustion recovery exists through travel hunger and inn meals.
- Faction gear: should remain faction-gated and should not appear in generic shops except as future faction access hooks.

## Settlement Identity Model

Each generated settlement should get a persistent `settlementProfile` stored by world hex id:

```js
{
  id: "0,0:4,5",
  name: "Ham of the Lily Brook",
  type: "village" | "city",
  biome: "forest",
  structureId: "village",
  traits: ["logging", "pilgrim-road", "poor"],
  wealth: "poor" | "modest" | "comfortable" | "wealthy",
  danger: 1,
  shops: ["village-smith", "market-stall", "herbalist", "camp-supplier"],
  services: ["inn", "stable"],
  discovered: true,
  teleportCircleKnown: true
}
```

Profiles should be generated once and then saved. The same town should always have the same shops, services, prices, and future quest board identity.

## Village Vs City Rules

### Villages

Villages should feel limited, practical, and local. Most villages should have 2-4 storefronts/services.

Guaranteed:

- Inn or common house, because discovered villages become temporary homes.
- At least one practical supply source.

Likely:

- Village Smith
- Market Stall
- Herbalist or Wise Woman
- Camp Supplier
- Stable/Yard

Rare:

- Chapel
- Specialist Weaponsmith
- Armorer
- Curio Trader
- Black Market

Villages should usually sell low-tier goods: simple weapons, light/medium armor, shields, rations, torches, lantern oil, basic potions, poor/modest furniture, and camp furniture.

### Cities

Cities should feel broader and more expensive. Cities should have 5-9 storefronts/services.

Guaranteed:

- Inn
- General Market
- Smith district or weapon/armor shop
- Temple/Church or Healer
- Camp Supplier

Likely:

- Weaponsmith
- Armorer
- Apothecary
- Furnisher
- Arcanist
- Stables/Caravan Office
- Quest Board placeholder

Rare:

- Black Market
- Noble Furnisher
- Grand Temple
- Specialist faction contact

Cities can sell higher-tier items and services: martial weapons, heavy armor, stronger healing potions, curse removal, better lodging/food buffs, comfortable/wealthy furniture, and very expensive revival.

## Storefront Types

### General Market

Player-facing label examples:

- Market Stalls
- Village Market
- Covered Market
- Provisioner Row
- Roadside Goods

Stock:

- `trail-ration`
- `torch`
- `hooded-lantern`
- `lantern-oil`
- arrows/bolts if ammunition exists
- occasional `potion-healing`

Village version:

- cheap supplies, limited stock, mostly rations/light gear.

City version:

- broader supply stock, more stack availability, slightly better chance for healing potions.

Use case:

- Default fallback shop when a settlement needs practical goods.

### Village Smith

Player-facing label examples:

- Village Smith
- Anvil Shed
- Farmforge
- Copper Nail Forge
- Roadside Smithy

Stock:

- simple melee weapons
- simple ranged weapons in hunting villages
- shields
- light armor
- a few medium armor pieces
- repair service placeholder

Avoid:

- full martial catalogue
- plate armor
- magical gear

Biome/trait flavor:

- forest/logging: handaxes, spears, shortbows.
- hills/highlands/mining: hammers, picks if added later, shields, medium armor.
- coast: spears, daggers, light armor.

### Weaponsmith

Player-facing label examples:

- Weaponsmith
- Bladesmith
- Bowyer And Fletcher
- Guild Forge
- Ironmark Weapons

Stock:

- martial weapons
- better ranged weapons
- ammunition
- some simple weapons

City common, village rare. A village may get one if it has traits like `frontier`, `mining`, `fortified`, `monster-road`, or is near a lair.

Possible subtypes:

- Bowyer: bows, crossbows, arrows, light blades.
- Bladesmith: swords, daggers, axes.
- War Forge: martial weapons and heavier options.

### Armorer

Player-facing label examples:

- Armorer
- Shieldwright
- Mail And Plate
- Guard Armory
- Leather And Chain

Stock:

- shields
- light armor
- medium armor
- heavy armor in cities or wealthy/fortified settlements

Village version:

- leather, hide, scale mail, shields.

City version:

- chain mail, breastplate, splint, plate if wealth is high.

### Herbalist

Player-facing label examples:

- Herbalist
- Green Shelf
- Root And Remedy
- Wise Woman's Remedies
- Marsh Herb Stall

Stock/services:

- `potion-healing`
- minor antidote/remedy placeholder if added
- disease treatment in villages with herbalist, but cheaper/weaker than church/apothecary
- forage-related flavor items later

Biome flavor:

- forest/swamp/jungle villages should have higher herbalist chance.
- desert/arctic villages may have rarer but more expensive remedies.

### Apothecary

Player-facing label examples:

- Apothecary
- Physic House
- Alchemist's Counter
- Red Glass Apothecary
- Bottled Mercies

Stock/services:

- `potion-healing`
- stronger healing potions if available
- resistance/breath potions in cities with high wealth
- cure disease service
- cure poison service later
- exhaustion tonic/service later

City common, village uncommon. Should replace or upgrade the herbalist when both would be too redundant.

### Temple / Church

Player-facing label examples:

- Church
- Temple
- Shrine House
- House of Mercy
- Bell Chapel

Services:

- cure disease
- remove curse in better temples
- cure exhaustion/restoration service
- revive dead hero, very expensive and probably city-only
- blessing buff later

Suggested service tiers:

- Chapel: cure disease, small blessing, maybe one exhaustion recovery.
- Temple: cure disease, remove curse, restoration/exhaustion recovery.
- Grand Temple: all above plus revival.

Village chapel should be rare and limited. City church should be common. Grand temple should be city + wealthy or religious trait.

### Arcanist

Player-facing label examples:

- Arcanist
- Scroll Room
- Glass Star Arcanum
- Wand And Ward
- Spellwright

Stock/services:

- remove curse
- identify/inspect magic placeholder
- limited magic consumables later
- rare potions
- spell scrolls if implemented later

City mostly. Village only if trait says `arcane`, `ruin-nearby`, `wizard-road`, or similar.

### Camp Supplier

Player-facing label examples:

- Camp Supplier
- Outfitter
- Trail Gear
- Tentwright
- Pack And Pole

Stock:

- camp furniture items
- trail rations
- torches/lantern oil
- possibly bedrolls, portable lanterns, small comfort items

This should be the normal way to buy camp furniture for the shared party camp pack. In the village menu it should remain under Shops & Services and generally appear late, after practical shops.

### Furnisher

Player-facing label examples:

- Furnisher
- Home Goods
- Cabinetmaker
- Weaver And Joiner
- Fine Furnishings

Stock:

- home decor furniture

Tier rules:

- village poor: squalid/poor furniture.
- village modest: poor/modest furniture.
- city modest: poor/modest/comfortable.
- city wealthy: comfortable/wealthy.
- rare noble city: wealthy/aristocratic.

This gives non-home settlements a strong identity later: a wealthy city becomes the place to buy excellent decor, while a rural village might only sell rough furniture.

### Inn / Tavern

Player-facing label examples:

- `<Town Name> Inn`
- Common House
- Roadhouse
- Hearth Hall
- Taproom

Services:

- existing inn rest screen
- buy simple meal
- buy better food/drinks for comfort-style buffs
- persuasion option for free simple supper if broke
- sleep until morning

Future variants:

- poor inn: cheaper, lower buff ceiling.
- good inn: better buff options.
- famous tavern: occasional rumor/quest board bonus.

### Stable / Caravan Yard

Player-facing label examples:

- Stable
- Mule Yard
- Caravan Office
- Roadwarden Post
- Boat Landing, if coastal

Services:

- future travel speed/ration reduction
- buy pack animals/mounts later
- pay for guided travel later
- pay to reveal nearby road/settlement hints

For now this can be a placeholder service station that says travel services are not ready, or it can offer a small paid "route advice" map/scout hint later.

### Black Market

Player-facing label examples:

- Backroom Trader
- Shuttered Stall
- Quiet Dealer
- Night Market
- Under-Counter Goods

Stock:

- poison items if we decide to make non-admin poison sales possible
- rare potions
- stolen/discounted weapons or armor later

Rules:

- city rare, village very rare.
- not guaranteed.
- prices volatile.
- should not appear too early unless settlement trait supports it.

### Quest Board

Player-facing label examples:

- Notice Board
- Village Board
- City Contract Board
- Guild Notices

First pass:

- visible but not functional, or points to later expansion.

Later:

- local generic quests based on biome, nearby structures, lairs, dungeons, roads, shortages.
- city boards can include faction postings.

### Faction Access Point

Player-facing label examples:

- Fighting Pit
- Expedition Office
- Gravebinder Chapel
- Antiquarian Desk
- Monster Hunter Lodge
- Crucible Annex

First pass:

- do not generate actual faction stores yet unless the faction system already unlocks it.
- add profile hooks so a settlement can advertise "faction access possible here".

Later:

- cities may have multiple faction offices.
- themed villages may have one faction contact.
- faction gear remains faction-gated and uses hero tokens where appropriate.

## Services Detail

### Cure Disease

Available at:

- Herbalist: rare/basic villages, limited but cheaper.
- Apothecary: common city service.
- Chapel/Temple: more expensive but reliable.

Should use the existing disease treatment logic where possible.

### Cure Exhaustion

Available at:

- Inn: food/rest can recover travel hunger exhaustion as currently implemented.
- Apothecary: costly restorative tonic.
- Temple: restoration prayer/service.

Suggested first implementation:

- "Treat Exhaustion": remove one exhaustion level from one hero.
- Pricing scales by settlement quality and hero level.

### Remove Curse

Available at:

- Temple: medium/high settlements.
- Arcanist: city or arcane trait.

Should be expensive enough that cursed gear still matters.

### Revival

Available at:

- Grand Temple, city only by default.
- Rare holy village only if settlement trait says `pilgrim`, `sacred`, or `relic`.

Suggested player-facing service names:

- Last Breath Rite
- Raise the Fallen
- Bell of Return
- Sanctuary Revival

Possible price tiers:

- Revivify-style quick rite: only for recently dead/transported corpse, very expensive.
- Raise Dead-style rite: more expensive, city/grand temple.
- Resurrection-style rite: late-game/extreme price, major city only.

Implementation can initially expose only one "Revive Fallen Hero" action that calls existing corpse revival logic with a large coin price.

### Curse/Disease/Death UX

Settlement service panels should show:

- affected hero;
- condition name;
- price;
- why a button is disabled;
- clear result log after service.

## Storefront Generation

### Inputs

Use:

- settlement type: village/city;
- biome group: forest, swamp, desert, mountain, coast, grassland, arctic, jungle, etc.;
- nearby structure hints: mine entrance, ruin, shrine, lair;
- wealth roll;
- settlement traits;
- world seed and hex id.

### Traits

Useful traits:

- `logging`: smith favors axes, bows; more wood/home furniture.
- `mining`: stronger smith/armorer chance; mine supplies.
- `farming`: better market, rations, simple goods.
- `fishing`: coastal food, spears, nets later.
- `pilgrim-road`: chapel/temple chance.
- `frontier`: weaponsmith/camp supplier chance.
- `fortified`: armorer/weaponsmith chance.
- `arcane`: arcanist chance.
- `wealthy`: furnisher, temple, better stock.
- `poor`: fewer shops, cheaper/rougher furniture.
- `dangerous-road`: more weapons, more healing, fewer luxury shops.
- `trade-crossing`: more shops and broader stock.

### Village Template

Minimum:

- Inn/Common House
- Market or Camp Supplier
- One extra shop

Roll examples:

- 70% Village Smith
- 55% Herbalist in forest/swamp/jungle, 30% elsewhere
- 45% Camp Supplier
- 20% Chapel
- 15% Furnisher
- 10% Weaponsmith
- 5% Black Market

### City Template

Minimum:

- Inn
- Market
- Smith district
- Apothecary or Temple
- Camp Supplier

Roll examples:

- 80% Weaponsmith
- 75% Armorer
- 70% Apothecary
- 65% Temple/Church
- 55% Furnisher
- 35% Arcanist
- 30% Stable/Caravan Yard
- 20% Quest Board placeholder
- 15% Black Market
- 10% Grand Temple, higher with wealthy/pilgrim trait

## Stock Pool Rules

Each storefront should define stock by filters rather than hard-coded full lists where possible.

Examples:

```js
{
  id: "village-smith",
  stockRules: [
    { type: "weapon", categoryIncludes: "simple", limit: 5 },
    { type: "armor", categoryIncludes: "light", limit: 2 },
    { type: "armor", categoryIncludes: "medium", limit: 1 },
    { id: "shield", chance: 0.7 }
  ]
}
```

```js
{
  id: "general-market",
  stockRules: [
    { id: "trail-ration", quantity: "2d6+4" },
    { id: "torch", quantity: "2d6+2" },
    { id: "lantern-oil", quantity: "1d4+1" },
    { id: "hooded-lantern", chance: 0.35 },
    { type: "ammunition", limit: 2 }
  ]
}
```

Stock should be persistent per settlement and refresh later only if we intentionally add market restocking.

## Pricing

Suggested pricing modifiers:

- home village: normal current prices.
- village poor: 90%-105%, limited stock.
- village remote/dangerous: 110%-140%, especially rations and potions.
- city trade: 95%-110%, broad stock.
- city wealthy: 110%-150%, better stock and services.
- black market: 80%-180%, with risk later.

Show the price normally in stores; do not expose generator mechanics.

## Menu UX

Village/city menu should show grouped cards:

- Rest And Travel
- Shops & Services
- Notices
- Faction Contacts

Storefront card format:

- name;
- short local flavor line;
- type tag, such as `Smith`, `Temple`, `Outfitter`;
- button: `Enter`, `Buy Supplies`, `Seek Treatment`, etc.

Inside a generic storefront:

- no named NPC required;
- show "Party Purse";
- bought items go into party inventory;
- faction-token items, when added later, still go directly to the chosen hero if they are bound.

## Example Settlement Profiles

### Forest Village

Name: Willowmere

Traits: `logging`, `forest-road`, `modest`

Shops/services:

- Willowmere Inn
- Village Smith
- Herbalist
- Camp Supplier
- Notice Board placeholder

Stock feel:

- rations, torches, handaxes, spears, shortbows, leather armor, healing potions, modest camp gear.

### Mining Village

Name: Stonebriar

Traits: `mining`, `dangerous-road`, `poor`

Shops/services:

- Common House
- Anvil Shed
- Camp Supplier
- Chapel, maybe

Stock feel:

- hammers, axes, shields, medium armor, lantern oil, rations. Fewer herbs, more hard goods.

### Trade City

Name: Corhaven

Traits: `trade-crossing`, `comfortable`, `fortified`

Shops/services:

- Corhaven Inn
- Covered Market
- Weaponsmith
- Armorer
- Apothecary
- Temple
- Furnisher
- Caravan Yard
- Quest Board placeholder

Stock feel:

- broad adventuring gear, martial weapons, medium/heavy armor, disease treatment, remove curse, better furniture, better food buffs.

### Pilgrim City

Name: Bellspire

Traits: `pilgrim-road`, `wealthy`, `sacred`

Shops/services:

- Pilgrim Inn
- Market
- Grand Temple
- Apothecary
- Arcanist
- Furnisher
- Quest Board placeholder

Stock feel:

- costly services, remove curse, revival, good potions, wealthy/aristocratic decor, fewer black market options.

## Implementation Phases

### Phase 1: Data Definitions

- Add `settlement-storefronts.js`.
- Define storefront templates with id, label pools, settlement eligibility, stock rules, service actions, price modifiers, and flavor lines.
- Add settlement profile generation using world seed + hex id.
- Store profiles in `state.world.settlementsByHex`.

### Phase 2: Settlement Menu Integration

- When opening a discovered non-home village/city menu, render generated storefront cards.
- Keep home village special NPC menu separate.
- Let inns remain the temporary home/rest screen.
- Add visible party inventory access, already now available in home/camp/inn menus.

### Phase 3: Generic Store Renderer

- Reuse the existing store renderer where possible, but allow `storefrontId` instead of `npcId`.
- Purchases spend party purse.
- Purchases go into party inventory.
- Sell actions can remain hero-carried item based for now, with coin going to party purse.

### Phase 4: Generic Services

- Implement disease treatment at Herbalist/Apothecary/Temple.
- Implement remove curse at Temple/Arcanist.
- Implement cure exhaustion at Apothecary/Temple.
- Implement revival at Grand Temple.

### Phase 5: Local Flavor And Future Hooks

- Add quest board placeholder entries per settlement profile.
- Add faction access slots but keep them inactive until faction rules are attached.
- Add stock refresh rules later.
- Add settlement reputation later if desired.

## Open Design Questions

- Should home decor bought away from home go into party inventory as furniture deeds, or directly into home build storage? party inventory
- Should city revival require the corpse to be in party inventory/transported, or can temples retrieve fallen heroes abstractly? abstract i think, i dont need not overcomplicate this
- Should village/city stock refresh after a number of days, or stay fixed forever for now? yes they should
- Should expensive services require a discovered teleport circle for easy return trips? no
- Should black market poison sales be locked behind rogue/persuasion checks, a settlement trait, or a future faction? uhh yeah thats gives the idea for the rogue faction as blackmarket, smugglers den etc. we will tie that to another faction that we will make.

## Recommended First Pass

Implement these storefronts first:

1. General Market
2. Village Smith
3. Herbalist
4. Camp Supplier
5. Inn
6. Weaponsmith
7. Armorer
8. Apothecary
9. Temple
10. Furnisher

Then add Arcanist, Stable/Caravan Yard, Black Market, Quest Board, and Faction Access once the generic renderer is stable.

