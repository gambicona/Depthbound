# Faction Equipment Sets Implementation Plan

Date: 2026-05-29

## Goal

Add rank-gated faction equipment sets to the village faction boards. Every faction except Fizzwick's Boom Club receives four equipment tiers:

- Tier 1: Uncommon, unlocked after faction rank 1.
- Tier 2: Rare, unlocked after faction rank 2.
- Tier 3: Very Rare, unlocked after faction rank 3.
- Tier 4: Legendary, unlocked after the final faction rank.

Each full set has four required set slots. Every set piece requires attunement. A hero who is already attuned to three pieces from the same set can attune the fourth matching set slot for free, bypassing the normal three-item attunement limit. Weapon variants count as the same set slot, so a set can sell several weapon shapes without requiring all variants. Same for armor.

Purchases should support two prices:

- Gold price: expensive, item is not hero-bound and can be equipped by anyone.
- Hero Token price: cheaper, item becomes bound to the paying hero and only that hero can equip or attune it.

## Existing Hooks

Relevant files:

- `src/scripts/content/npcs/village-npcs.js`: faction NPC definitions already exist.
- `src/scripts/app/rendering-inventory.js`: faction board rendering, store rendering, inventory rendering, attunement UI, shop buy/sell handlers.
- `src/scripts/app/game-state.js`: item normalization, inventory shape, money, Hero Tokens, attunement state, magic effect aggregation, derived stat refresh.
- `src/scripts/content/items/magic_items.js`: magic weapon and armor registration patterns.
- `src/scripts/content/items/magic_accessories.js`: accessory registration patterns.
- `index.html`: item content files are loaded here.

Current useful behavior:

- Hero Tokens already live on each hero at `hero.inventory.heroTokens`.
- Attunement limit is `attunementLimit = 3`.
- `magicEffects(fighter)` already merges `magic.effects`, resistances, speed, AC, attack, damage, extra damage, ability bonuses, immunities, and max HP.
- Shops already buy with active hero money and add item instances to that hero inventory.
- Compact guild boards already have rank state and a stable place to add a shop section.

Current problem to account for:

- `normalizeAttunementState(fighter)` slices attuned item IDs to `attunementLimit`, so the fourth set item would be removed unless this function becomes set-aware.

## Data Model

Add a new item content file:

`src/scripts/content/items/faction-equipment-sets.js`

Load it in `index.html` after base equipment and after the generic magic item/accessory helpers if the new file reuses helper functions.

Recommended item fields:

```js
{
  id: "faction-trophy-trackfang-mail",
  name: "Trackfang Mail",
  type: "armor",
  requiresAttunement: true,
  factionSet: {
    factionId: "monster-guild",
    setId: "trophy-trackfang",
    setName: "Trackfang Set",
    tier: 1,
    rarity: "uncommon",
    slotKey: "armor",
    variantKey: "armor"
  },
  purchase: {
    factionId: "monster-guild",
    minRank: 1,
    goldCp: 120000,
    heroTokens: 4
  },
  magic: {
    kind: "armor",
    rarity: "uncommon",
    effects: { ... },
    description: "..."
  },
  store: {
    buyable: false,
    sellable: true,
    factionShop: true
  },
  tags: ["magic", "magic-item", "faction-set", "faction:monster-guild", "set:trophy-trackfang", "rarity:uncommon"]
}
```

For purchased instances, add:

```js
{
  purchasedWith: "gold" | "heroTokens",
  boundHeroId: "mira", // only when bought with Hero Tokens
  boundHeroName: "Mira",
  purchasedFromFactionId: "monster-guild"
}
```

## Rank Mapping

Use the rank index returned by each faction board:

- Rank 0: no set stock.
- Rank 1: Tier 1 stock.
- Rank 2: Tier 1 and Tier 2 stock.
- Rank 3: Tier 1, Tier 2, and Tier 3 stock.
- Final rank: all tiers, including Tier 4.

Most compact boards currently define five rank entries. Treat index `ranks.length - 1` as final rank. Fighting Pit uses its own renown path, so add a small helper that maps pit renown to the same four unlock thresholds.

## Purchase Flow

Add a faction shop section to guild boards, not to the normal merchant store. This keeps the player in the faction UI.

The board should also include a read-only set catalog. The catalog is visible even when ranks are locked, so players can inspect future purchases before committing to a faction path.

Catalog row requirements:

- Faction and set name.
- Tier, rarity, and rank needed.
- All item slots/pieces in the set, including weapon variants.
- Short item effect summaries.
- Four-piece set bonus summary.
- Purchase state: available now, locked until rank, or preview-only/not implemented.

New helpers:

```js
function factionRankForShop(factionId)
function factionSetStock(factionId)
function factionSetStockUnlocked(item, rank)
function factionSetCatalogEntries(factionId)
function factionSetCatalogMarkup(factionId, rank)
function heroCanBuyFactionItem(hero, item, method)
function buyFactionSetItem(factionId, itemId, method)
function bindPurchasedFactionItem(item, hero, method, factionId)
```

UI row should show:

- Item name.
- Set name, tier, rarity, set slot.
- Short effect summary.
- Gold buy button.
- Hero Token buy button.
- Disabled state with clear reason: rank locked, not enough gold, not enough Hero Tokens, or already owned if duplicate prevention is chosen.

Price guidance:

| Rarity | Gold price | Hero Token price |
| --- | ---: | ---: |
| Uncommon | 1,200 gp | 4 tokens |
| Rare | 7,500 gp | 8 tokens |
| Very Rare | 30,000 gp | 14 tokens |
| Legendary | 120,000 gp | 24 tokens |

Weapon variants can use the same tier price. If you want heavier martial weapons to cost more later, apply a small gold-only surcharge, but keep Hero Tokens flat by tier so the faction reward path stays clean.

## Binding Rules

Hero Token purchases bind the item to the paying hero:

- The paying hero receives the item.
- Only that hero can equip it.
- Only that hero can attune it.
- Bound items can still be stored or transferred for inventory management, but equip/attune buttons should be disabled for other heroes.
- Item details should display `Bound to Mira`.

Implementation points:

- Add `itemBoundToOtherHero(fighter, item)`.
- In `equipActionForItem`, disable equip if the bound hero is not the current fighter.
- In `attunementActionForItem` and `changeItemAttunement`, disable/deny attunement if the bound hero is not the current fighter.
- In item details and inventory row summaries, show bound owner.

## Attunement Set Overflow

The fourth-piece rule needs to work in both UI and state normalization.

Recommended logic:

```js
function factionSetInfo(item)
function attunedFactionSetPieces(fighter, setId)
function factionSetSlotKeysAttuned(fighter, setId)
function itemCanUseFreeSetAttunement(fighter, item)
function attunementIdsWithAllowedSetOverflow(fighter, proposedIds)
```

Rule:

1. Candidate must require attunement and have `factionSet.setId`.
2. Candidate must not already be attuned.
3. The hero must already have exactly three attuned pieces from the same `setId`.
4. Those three pieces must cover three distinct `slotKey` values.
5. Candidate must cover the missing fourth `slotKey`, not a duplicate variant slot.
6. Candidate may exceed the normal attunement limit by one.

Recommended first version:

- Allow one free faction set overflow per hero at a time.
- This avoids a hero wearing three pieces from several different sets and stacking many fourth-piece overflow items.
- Show attunement as `4/3, set complete` when overflow is active.

Update these places:

- `attunementActionForItem`: do not disable the fourth item when `itemCanUseFreeSetAttunement` is true.
- `changeItemAttunement`: allow adding the item even when `ids.size >= attunementLimit` if the free set rule passes.
- `normalizeAttunementState`: keep valid overflow IDs instead of blindly slicing to three.
- `attunementSummaryMarkup`: show set overflow in the summary.
- Unequip handling: if a hero removes a set piece and invalidates overflow, automatically unattune the free fourth piece or show a cleanup warning and normalize immediately.

## Set Bonus Implementation

Each item has its own magic effect, but the complete four-piece set should add a modest set bonus. Add this data to a registry:

```js
window.DungeonContent.register("factionSets", "trophy-trackfang", {
  factionId: "monster-guild",
  name: "Trackfang Set",
  tier: 1,
  rarity: "uncommon",
  requiredSlotKeys: ["armor", "weapon", "sidearm", "cloak"],
  setBonus: {
    label: "Trackfang Ambush",
    effects: { initiativeBonus: 1, skillBonus: 1 },
    description: "When all four pieces are attuned, gain +1 initiative and +1 to tracking/perception-style checks."
  }
});
```

Then update `magicEffects(fighter)` or add `factionSetEffects(fighter)` and merge it from `magicEffects`.

Count complete sets by attuned items, not merely equipped items. The item must also be carried by that hero. For normal equipment-like behavior, the item should be equipped before its effects apply; for safety, set bonus should require the four pieces to be equipped and attuned.

## Faction Set Catalog

Below, "item effect" means the single-piece magic while equipped and attuned. "4-piece bonus" means the complete set bonus when all four set slots are equipped and attuned.

### Trophy Lodge

Theme: ranger/barbarian hunter gear, quarry control, mobility, beast-slaying, survival.

#### Tier 1: Trackfang Set, Uncommon

Slots:

- Armor: Trackfang Mail, medium armor.
- Weapon: Trackfang Longbow.
- Sidearm: Trackfang Hunting Knife, dagger.
- Cloak: Trackfang Hunter's Cloak.

Item effects:

- Armor: +1 AC as magic armor; advantage-style +1 skill bonus for tracking and survival checks through `skillBonus: 1`.
- Longbow: +1 attack and damage; +1d4 piercing against beasts, monstrosities, and marked quarry if monster family tags are available.
- Hunting Knife: +1 attack; +1d4 poison or piercing when attacking a target below full HP.
- Cloak: +5 ft speed and +1 initiative.

4-piece bonus: Trackfang Ambush. First weapon hit each combat deals +1d6 piercing, and the hero gains +2 initiative. If first-hit tracking is too much for MVP, implement as `initiativeBonus: 2` and `extraDamage: [{ count: 1, sides: 4, type: "piercing" }]`.

#### Tier 2: Briarhook Set, Rare

Slots:

- Armor: Briarhook Hide, hide armor.
- Weapon: Briarhook Heavy Crossbow.
- Sidearm: Briarhook Handaxe.
- Boots: Briarhook Tracking Boots.

Item effects:

- Armor: +1 AC; resistance to poison.
- Heavy Crossbow: +1 attack and damage; +1d6 piercing against large or larger enemies if size tags exist, otherwise against enemies above half HP.
- Handaxe: +1 attack and damage; thrown attacks add +1d4 slashing.
- Boots: +10 ft speed; difficult terrain from natural terrain can be ignored if terrain hooks exist, otherwise `skillBonus: 2`.

4-piece bonus: Briar Snare. Once per combat on hit, slow the target by 10 ft until end of its next turn. MVP data fallback: `extraDamage: [{ count: 1, sides: 6, type: "poison" }]` and `speedBonusFeet: 5`.

#### Tier 3: Great Quarry Set, Very Rare

Slots:

- Armor: Great Quarry Scale, scale mail.
- Weapon: Great Quarry Pike or Boar Spear.
- Amulet: Great Quarry Trophy Amulet.
- Bracers: Great Quarry Bracers.

Item effects:

- Armor: +2 AC; resistance to bludgeoning from nonmagical or beast attacks if source tags exist, otherwise max HP +8.
- Pike/Boar Spear: +2 attack and damage; reach; +1d8 piercing against bosses/elites.
- Amulet: +2 to saves against fear and poison through `saveBonus: 2`; resistance to poison.
- Bracers: +1 AC; +1 damage with melee weapons.

4-piece bonus: Bring Down the Quarry. The hero gains +1d8 damage against bloodied targets and cannot be frightened. MVP fallback: `extraDamage: [{ count: 1, sides: 8, type: "piercing" }]`, `saveBonus: 1`.

#### Tier 4: Apex Stalker Set, Legendary

Slots:

- Armor: Apex Stalker Half Plate.
- Weapon: Apex Greatbow or Apex War Bow.
- Sidearm: Apex Monster-Slayer Axe.
- Cloak: Apex Trophy Mantle.

Item effects:

- Armor: +3 AC; resistance to poison and cold.
- Greatbow/War Bow: +3 attack and damage; +1d10 force or piercing against elites/bosses.
- Monster-Slayer Axe: +3 attack and damage; +1d10 slashing against creatures above half HP.
- Trophy Mantle: +2 initiative; +10 ft speed; resistance to fear through `saveBonus: 2`.

4-piece bonus: Apex Predator. First round attacks have advantage if that hook is available; otherwise +2 attack and +1d10 extra piercing. Also immune to frightened.

### Gravebinders

Theme: cleric/paladin/warden gear, radiant and necrotic resistance, undead control, protection.

#### Tier 1: Gravesalt Set, Uncommon

Slots:

- Armor: Gravesalt Chain Shirt.
- Shield: Gravesalt Shield.
- Weapon: Gravesalt Mace.
- Amulet: Gravesalt Charm.

Item effects:

- Armor: +1 AC; resistance to necrotic.
- Shield: +1 shield AC through magic armor/shield handling; +1 saves.
- Mace: +1 attack and damage; +1d4 radiant against undead.
- Amulet: resistance to necrotic or `saveBonus: 1` if duplicate resistance is too much.

4-piece bonus: Salt Circle. Allies adjacent to the hero gain +1 AC against undead if aura hooks exist. MVP fallback: hero gains `acBonus: 1` and radiant `extraDamage: 1d4`.

#### Tier 2: Candlewarden Set, Rare

Slots:

- Armor: Candlewarden Chain Mail.
- Shield: Candlewarden Shield.
- Weapon: Candlewarden Longsword.
- Lantern: Candlewarden Warding Lantern, offhand/accessory focus.

Item effects:

- Armor: +1 AC; necrotic resistance.
- Shield: +1 AC; max HP +8.
- Longsword: +1 attack and damage; +1d6 radiant against undead or cursed enemies.
- Lantern: dim/bright light source; +2 saves against frightened/charmed through `saveBonus: 2`.

4-piece bonus: No Grave Opens. Once per dungeon, prevent a hero from dropping below 1 HP if death-prevention hooks exist. MVP fallback: max HP +12 and necrotic immunity/resistance upgrade.

#### Tier 3: Ashbound Set, Very Rare

Slots:

- Armor: Ashbound Splint.
- Weapon: Ashbound Warhammer.
- Cloak: Ashbound Cloak.
- Ring: Ashbound Ring.

Item effects:

- Armor: +2 AC; resistance to necrotic.
- Warhammer: +2 attack and damage; +1d8 radiant.
- Cloak: resistance to fire and necrotic or `saveBonus: 2`.
- Ring: max HP +10; +1 AC.

4-piece bonus: Ashen Reprieve. Healing received +2 and undead attackers take 1d6 radiant when they hit if thorns hooks exist. MVP fallback: `maxHpBonus: 12`, `saveBonus: 1`, `extraDamage: 1d6 radiant`.

#### Tier 4: Sepulcher Oath Set, Legendary

Slots:

- Armor: Sepulcher Oath Plate.
- Shield: Sepulcher Oath Tower Shield or Kite Shield.
- Weapon: Sepulcher Executioner's Sword or Greatsword.
- Head: Crownless Helm.

Item effects:

- Armor: +3 AC; necrotic resistance; max HP +12.
- Shield: +2 AC; +2 saves.
- Executioner's Sword/Greatsword: +3 attack and damage; +1d10 radiant or necrotic chosen at item creation, preferably radiant for Gravebinders.
- Crownless Helm: immunity to frightened if supported; otherwise `saveBonus: 3` and `initiativeBonus: 1`.

4-piece bonus: Oath Against the Last Door. Necrotic immunity if immunity stacking is acceptable, otherwise resistance plus max HP +20. Weapon hits against undead add +1d10 radiant.

### Crucible Collegium

Theme: wizard/sorcerer/warlock elemental gear, spell power, elemental defenses, controlled volatility.

#### Tier 1: Apprentice Crucible Set, Uncommon

Slots:

- Armor: Apprentice Crucible Robe or Light Armor.
- Weapon: Apprentice Crucible Quarterstaff.
- Ring: Focus Ring.
- Gloves: Crucible Gloves.

Item effects:

- Robe/Light Armor: +1 AC; choose one elemental resistance variant: fire, cold, lightning, acid.
- Quarterstaff: +1 attack; +1d4 elemental damage.
- Ring: +1 spell attack through `spellAttackBonus: 1`; if not wired, use `attackBonus: 1`.
- Gloves: +1 damage with spells or elemental attacks through `damageBonus: 1`.

4-piece bonus: Stable Reaction. Resistance to one chosen element and +1 spell save DC if `saveDcBonus` is wired; MVP fallback: `saveBonus: 1`, elemental `extraDamage: 1d4`.

#### Tier 2: Rift-Savant Set, Rare

Slots:

- Armor: Rift-Savant Reinforced Coat.
- Weapon: Rift-Savant Wand.
- Amulet: Elemental Amulet.
- Boots: Rift-Savant Boots.

Item effects:

- Coat: +1 AC; resistance to two elements chosen by variant.
- Wand: +1 spell attack; +1d6 elemental extra damage.
- Amulet: +1 spell save DC or `saveBonus: 1`; elemental resistance.
- Boots: +10 ft speed; resistance to lightning or force if force is used.

4-piece bonus: Controlled Rift. Once per combat short teleport if movement hooks exist. MVP fallback: `speedBonusFeet: 10`, `initiativeBonus: 1`, `extraDamage: 1d6 force`.

#### Tier 3: Planar Attunement Set, Very Rare

Slots:

- Cloak: Planar Attunement Mantle.
- Weapon: Planar Attunement Staff.
- Bracers: Planar Bracers.
- Head: Planar Circlet.

Item effects:

- Mantle: resistance to fire, cold, lightning, or acid by variant; +1 AC.
- Staff: +2 spell attack; +1d8 elemental damage.
- Bracers: +1 AC; `damageBonus: 1`.
- Circlet: +2 spell save DC if wired, otherwise `saveBonus: 2` and `initiativeBonus: 1`.

4-piece bonus: Elemental Convergence. The hero gains resistance to fire, cold, lightning, and acid, and elemental attacks add +1d8 damage. This is strong but tier-appropriate.

#### Tier 4: Fourfold Crucible Set, Legendary

Slots:

- Armor: Fourfold Master Robe or Light Armor.
- Weapon: Fourfold Archmage Staff.
- Head: Elemental Crown.
- Ring: Fourfold Attunement Ring.

Item effects:

- Master Robe: +3 AC if robe/light armor; resistance to fire, cold, lightning, and acid.
- Archmage Staff: +3 spell attack; +1d10 elemental damage.
- Elemental Crown: +2 spell save DC if wired; otherwise `saveBonus: 3` and `initiativeBonus: 2`.
- Attunement Ring: +1 AC; max HP +10; elemental resistance.

4-piece bonus: Fourfold Mastery. Once per turn elemental extra damage +1d10; immunity to one selected element if selection exists, otherwise resistance to four elements and max HP +15.

### Antiquarian Society

Theme: scholar/caster/bard relic gear, lore, precision, utility, arcane finesse.

#### Tier 1: Cataloger's Set, Uncommon

Slots:

- Armor: Cataloger's Scholar Robe or Light Armor.
- Weapon: Cataloger's Rapier.
- Head: Cataloger's Spectacles.
- Cloak: Cataloger's Satchel-Cloak.

Item effects:

- Robe/Light Armor: +1 AC; `skillBonus: 1`.
- Rapier: +1 attack and damage; +1d4 psychic on targets already hit this turn if hooks exist, otherwise flat +1d4 psychic.
- Spectacles: +1 initiative and `skillBonus: 1`.
- Satchel-Cloak: max HP +5 and `saveBonus: 1`.

4-piece bonus: Cross-Referenced Weakness. +1 attack and +1d4 psychic damage; if bestiary hooks exist, reveal enemy traits faster.

#### Tier 2: Inkglass Set, Rare

Slots:

- Armor: Inkglass Fine Coat.
- Weapon: Inkglass Cane-Sword.
- Ring: Inkglass Signet Ring.
- Amulet: Inkglass Relic Amulet.

Item effects:

- Fine Coat: +1 AC; `skillBonus: 2`.
- Cane-Sword: +1 attack and damage; +1d6 psychic.
- Signet Ring: +1 spell attack or `attackBonus: 1`; `initiativeBonus: 1`.
- Relic Amulet: resistance to psychic; `saveBonus: 1`.

4-piece bonus: Annotated Strike. First hit against a newly encountered monster family deals +1d8 psychic. MVP fallback: `extraDamage: 1d6 psychic`, `skillBonus: 1`.

#### Tier 3: Vault-Seeker Set, Very Rare

Slots:

- Armor: Vault-Seeker Explorer's Coat.
- Weapon: Vault-Seeker Staff.
- Bracers: Vault-Seeker Bracers.
- Head: Vault-Seeker Lens or Monocle.

Item effects:

- Explorer's Coat: +2 AC; resistance to psychic.
- Staff: +2 attack/spell attack; +1d8 force.
- Bracers: +1 AC; `saveBonus: 1`.
- Lens/Monocle: +2 initiative; `skillBonus: 2`.

4-piece bonus: Vault Pattern. +2 saves, +2 initiative, and +1d8 force damage. If trap/secret-door hooks exist later, add a strong detection bonus.

#### Tier 4: First Archive Set, Legendary

Slots:

- Cloak: First Archive Mantle.
- Offhand: First Archive Ancient Tome.
- Sidearm: First Archive Jeweled Dagger.
- Head: First Archive Crown or Circlet.

Item effects:

- Mantle: +2 AC; resistance to psychic and force.
- Ancient Tome: +3 spell attack or +2 spell save DC if wired; `saveBonus: 2`.
- Jeweled Dagger: +3 attack and damage; +1d10 psychic.
- Crown/Circlet: +3 initiative; `skillBonus: 3`.

4-piece bonus: Original Citation. Spell and weapon attacks gain +1d10 force or psychic damage; max HP +10; immunity/resistance to psychic.

### Expedition Board

Theme: practical delver gear, reliability, marching durability, command, all-purpose martial use.

#### Tier 1: Waymark Set, Uncommon

Slots:

- Armor: Waymark Medium Armor.
- Shield: Waymark Shield.
- Weapon: Waymark Battleaxe.
- Boots: Waymark Explorer Boots.

Item effects:

- Armor: +1 AC; max HP +5.
- Shield: +1 AC.
- Battleaxe: +1 attack and damage.
- Boots: +5 ft speed; `skillBonus: 1`.

4-piece bonus: Keep Moving. +5 ft speed, +1 saves, and +1 initiative.

#### Tier 2: Routebreaker Set, Rare

Slots:

- Armor: Routebreaker Breastplate.
- Weapon: Routebreaker Warhammer.
- Cloak: Utility Cloak.
- Amulet: Compass Amulet.

Item effects:

- Breastplate: +1 AC; max HP +8.
- Warhammer: +1 attack and damage; +1d6 bludgeoning.
- Utility Cloak: +1 AC; `skillBonus: 1`.
- Compass Amulet: +1 initiative; `saveBonus: 1`.

4-piece bonus: No Bad Roads. +10 ft speed and resistance to bludgeoning/piercing/slashing from environmental hazards if hooks exist. MVP fallback: max HP +10 and `saveBonus: 1`.

#### Tier 3: Deep Delver Set, Very Rare

Slots:

- Armor: Deep Delver Half Plate.
- Weapon: Deep Delver Greatsword.
- Gauntlets: Deep Delver Gauntlets.
- Ring: Deep Delver Ring.

Item effects:

- Half Plate: +2 AC; max HP +10.
- Greatsword: +2 attack and damage; +1d8 slashing.
- Gauntlets: `damageBonus: 1`; `abilityScoreBonuses: { str: 1 }`.
- Ring: +1 AC; resistance to poison or necrotic.

4-piece bonus: Stand the Line. +1 AC, +1 saves, and weapon hits add +1d8 force while the hero is below half HP if conditional hooks exist. MVP fallback: max HP +15 and `extraDamage: 1d8 force`.

#### Tier 4: Grand Expedition Set, Legendary

Slots:

- Armor: Grand Expedition Heavy Explorer Plate.
- Weapon: Grand Expedition Greataxe.
- Cloak: Banner Cloak.
- Head: Command Helm.

Item effects:

- Heavy Explorer Plate: +3 AC; max HP +15.
- Greataxe: +3 attack and damage; +1d10 slashing.
- Banner Cloak: +2 saves; +1 AC.
- Command Helm: +2 initiative; `saveBonus: 2`.

4-piece bonus: Expedition Marshal. Party aura +1 attack/saves if aura hooks exist. MVP fallback for wearer: +2 attack, +2 saves, +10 ft speed, max HP +15.

### Fighting Pit

Theme: arena durability, momentum, physical damage, glory, aggressive martial builds.

#### Tier 1: Pit-Blood Set, Uncommon

Slots:

- Armor: Pit-Blood Gladiator Harness or Heavy Armor.
- Weapon: Pit-Blood Longsword.
- Gauntlets: Pit-Blood Gauntlets.
- Belt: Pit-Blood Arena Belt.

Item effects:

- Harness/Armor: +1 AC; max HP +5.
- Longsword: +1 attack and damage.
- Gauntlets: `damageBonus: 1`.
- Belt: `saveBonus: 1`; max HP +5.

4-piece bonus: Crowd Heat. When combat starts, gain temporary HP if temp HP hooks are easy; MVP fallback: max HP +10 and +1 initiative.

#### Tier 2: Ironbell Set, Rare

Slots:

- Armor: Ironbell Scale or Half Plate.
- Weapon: Ironbell Greataxe.
- Bracers: Ironbell Bracers.
- Cloak: Ironbell Victory Cloak.

Item effects:

- Scale/Half Plate: +1 AC; max HP +10.
- Greataxe: +1 attack and damage; +1d6 slashing.
- Bracers: +1 AC.
- Victory Cloak: +1 initiative; `saveBonus: 1`.

4-piece bonus: Bell-Ringer. Critical hits or boss hits add extra damage if hooks exist. MVP fallback: `extraDamage: 1d6 thunder`, `maxHpBonus: 8`.

#### Tier 3: Champion's Heat Set, Very Rare

Slots:

- Armor: Champion's Heat Plate.
- Weapon: Champion's Maul or Warhammer.
- Head: Champion's Helm.
- Ring: Champion's Heat Ring.

Item effects:

- Plate: +2 AC; max HP +12.
- Maul/Warhammer: +2 attack and damage; +1d8 thunder.
- Helm: +2 initiative; immune/resistant to frightened via `saveBonus: 2`.
- Ring: +1 AC; `damageBonus: 1`.

4-piece bonus: Champion's Pressure. +1 AC while adjacent to enemies if hooks exist; MVP fallback: +1 AC, +1d8 thunder extra damage, max HP +10.

#### Tier 4: Glory-King Set, Legendary

Slots:

- Armor: Glory-King Arena Plate.
- Weapon: Glory-King Paired Greatswords or Massive Greatsword.
- Head: Champion's Crown.
- Cloak: Spectator Mantle.

Item effects:

- Arena Plate: +3 AC; max HP +20.
- Paired Greatswords/Massive Greatsword: +3 attack and damage; +1d10 slashing or thunder.
- Champion's Crown: +3 initiative; `saveBonus: 2`.
- Spectator Mantle: +1 AC; max HP +10; resistance to bludgeoning/piercing/slashing if acceptable at legendary.

4-piece bonus: The Bell Answers. Once per combat extra action/attack if action hooks exist. MVP fallback: +2 attack, +2 damage, +1d10 thunder, max HP +20.

## Weapon Variants

Support multiple items in the same set slot by using the same `factionSet.slotKey`:

```js
{
  factionSet: {
    setId: "grave-sepulcher-oath",
    slotKey: "weapon",
    variantKey: "greatsword"
  }
}
```

For the fourth-piece rule, count distinct `slotKey`, not item count alone.

Recommended extra variants:

- Trophy Lodge: longbow/greatbow/war bow variants, axe/handaxe variants.
- Gravebinders: longsword/greatsword/warhammer variants where listed.
- Crucible Collegium: staff/wand/quarterstaff variants should stay within their tier slot.
- Antiquarian Society: rapier/cane-sword/staff/dagger variants as listed.
- Expedition Board: battleaxe/warhammer/greatsword/greataxe variants as listed.
- Fighting Pit: longsword/greataxe/maul/warhammer/greatsword variants as listed.

## Implementation Steps

1. Create `faction-equipment-sets.js`.
   - Add helper registration functions for faction set weapons, armor, shields, and accessories.
   - Register all six faction catalogs and the set metadata.
   - Add catalog-only metadata for later tiers before all items are implemented, so locked future sets are visible from the board.
   - Add script tag in `index.html`.

2. Add faction set shop support.
   - Add a `factionShopMarkup(config)` hook to `createCompactGuildBoard`.
   - Add a `factionSetCatalogMarkup(config)` hook near the shop or rewards area.
   - Add special shop support for Fighting Pit.
   - Add buy buttons with `data-action="buy-faction-set-item"` and `data-method="gold|heroTokens"`.
   - Wire the click handler in `app.js` where other village button actions live.

3. Add purchase and binding logic.
   - Deduct from `activeHero().inventory.money` for gold.
   - Deduct from `activeHero().inventory.heroTokens` for Hero Tokens.
   - Create a normalized unique item instance and push it to the buyer inventory.
   - Stamp `boundHeroId` only for Hero Token purchases.

4. Add bound-item equip and attune restrictions.
   - Disable equip/attune controls for wrong hero.
   - Prevent direct drag-equip for wrong hero as well.
   - Show bound owner in item details and inventory summary.

5. Add faction set attunement overflow.
   - Replace hard `slice(0, attunementLimit)` normalization with set-aware normalization.
   - Update attune button state and log messages.
   - Show `Set complete: fourth piece attuned freely` in the item or summary UI.

6. Add complete set effects.
   - Register `factionSets`.
   - Merge complete-set effects into `magicEffects(fighter)`.
   - Start with passive supported effects: AC, HP, speed, initiative, save, attack, damage, extra damage, resistances, immunities.
   - Leave special triggers as descriptions until the combat hook exists.

7. Add admin/testing tools.
   - Add temporary admin buttons to grant Hero Tokens to active hero.
   - Add admin rank presets already exist for compact boards; ensure final rank unlocks Tier 4.
   - Add a debug label listing active set pieces and set completion.

8. QA.
   - Buy a Tier 1 piece with gold and equip it on another hero.
   - Buy a Tier 1 piece with Hero Tokens and confirm another hero cannot equip/attune it.
   - Attune three normal magic items and confirm a fourth unrelated item is blocked.
   - Attune three same-set pieces and confirm the fourth same-set missing slot is allowed.
   - Confirm a duplicate weapon variant is not allowed as the free fourth piece.
   - Save/load after a completed four-piece set and confirm attunement overflow remains.
   - Unequip or transfer one of the first three pieces and confirm overflow is cleaned up.

## Open Decisions

- Should Hero Token purchases be unsellable? Recommended: yes, or sell value 0, to avoid token-to-gold conversion.
- Should a hero be allowed to have multiple complete faction sets with multiple free fourth attunements? Recommended first version: no, only one overflow item per hero.
- Should Tier 4 require exact final rank or can it unlock at high admin preset? Recommended: exact final rank for live play; admin high preset can set enough reputation for testing.
- Should full-set bonuses require equipped plus attuned or only attuned? Recommended: equipped plus attuned.
- Should set items drop as loot? Recommended: no. Keep them faction-shop-only at first.
