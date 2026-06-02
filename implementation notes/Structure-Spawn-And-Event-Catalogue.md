# Structure Spawn And Event Catalogue

Date: 2026-06-02

This audits every asset in `hexagonalworldbuilder/assets/middletiles` against the current big-world generator and travel structure event system.

## Summary

- Middle-tile artwork files found: 122.
- Big-world generated middle structures: 116 structure tiles plus 6 lake middle tiles.
- Assets that currently cannot spawn through big-world generation: `bridge_NEtoSW`, `bridge_NWtoSE`, `bridge_NtoS`, `bridge_WtoE`, `camp_siege`, `castle_coastal`.
- Generated assets with no explicit structure event yet: `abyssalrift`, `alchemist`, `ancientarena`, `cursedtree`, `demon scar`, `demonscar`, `elementalrift`, `entrance_cave`, `giantskeleton`, `hellsportal`, `herbgarden`, `magic_obeslik`, `magic_portal`, `monsterbones`, `portal`, `reef_kraken`, `shrine_crystal`, `shrine_druidcircle`, `shrine_forest`, `shrine_small`, `sirenrocks`, `swamp_sinkhole`, `temple_moon`, `temple_sun`, `undead graveyard`.
- Current road-building mismatch: the road-danger classifier treats all `camp` kind structures as clearable road threats, even peaceful/utility camp art such as `camp_market`, `camp_lumber`, `camp_hunting`, `camp_fishing`, `camp_caravan`, `camp_nomad`, and `camp_quarry`. Those have no explicit hostile structure event right now.
- Current labeler mismatch: many special structures still fall back to generic `Place` because `world-name-generator.js` has no aliases for rifts, graveyards, skeletons, obelisks, sinkholes, siren rocks, etc.

## Structure Event Odds

When the party steps on a structure, the travel system first gathers matching structure events by tile, kind, biome, or special site. Then it rolls the structure event category.

First visit:

- Quiet: 15
- Text: 45
- Dungeon: 25
- Fight: 15

Revisit:

- Quiet: 30
- Text: 42
- Dungeon: 18
- Fight: 10

If no matching structure event exists, the result is quiet unless another system, such as a quest board target or a road-danger fallback, forces content.

## Spawn Status Key

- Generated: can appear in the current big-world generator.
- Palette/manual only: exists in the builder palette and artwork, but is not rolled by big-world generation.
- Event coverage: lists what can happen once a matching event is selected. Checks are written as skill plus DC. "Reward" means rations or money. "Dungeon" and "fight" mean the choice can start that activity.

## Full Catalogue

| Tile | Label | Kind | Spawn | Event coverage when stepped on |
| --- | --- | --- | --- | --- |
| `abyssalrift` | Place | generic | Generated | No explicit structure event yet. Can be quiet unless a quest/road system targets it. |
| `alchemist` | Place | generic | Generated | No explicit structure event yet. Good candidate for future service/seller/odd-lab event. |
| `ancientarena` | Place | generic | Generated | No explicit structure event yet. Good candidate for arena trial, duelist, or relic fight. |
| `bandit hideout` | Place | generic | Generated | Bandit Camp: raid fight, break hideout dungeon, stealth DC 13 supply steal with reward or fight, or watch from afar. Road-danger fallback can force a bandit clear event. |
| `banditcamp` | Place | generic | Generated | Bandit Camp: raid fight, break hideout dungeon, stealth DC 13 supply steal with reward or fight, or watch from afar. Road-danger fallback can force a bandit clear event. |
| `bridge_NEtoSW` | Bridge | road | Palette/manual only | Bridge Toll: investigation DC 12 for cache or ambush, or cross and camp. |
| `bridge_NWtoSE` | Bridge | road | Palette/manual only | Bridge Toll: investigation DC 12 for cache or ambush, or cross and camp. |
| `bridge_NtoS` | Bridge | road | Palette/manual only | Bridge Toll: investigation DC 12 for cache or ambush, or cross and camp. |
| `bridge_WtoE` | Bridge | road | Palette/manual only | Bridge Toll: investigation DC 12 for cache or ambush, or cross and camp. |
| `burrow_beastden` | Burrow | burrow | Generated | Beast Den: single lair fight against `lairRootfangBeast`, or leave. Also matches generic Occupied Burrow: beast fight, small generic dungeon, or leave. Blocks road work until cleared, then can become dangerous again after 10+ days. |
| `burrow_chimeranest` | Burrow | burrow | Generated | Chimera Nest: single lair fight against `lairTwoMawChimera`, or mark danger. Also matches generic Occupied Burrow. Blocks road work until cleared, then can become dangerous again after 10+ days. |
| `burrow_dragon` | Burrow | burrow | Generated | Dragon Burrow: single lair fight against `lairYoungCragDragon`, or circle wide. Also matches generic Occupied Burrow. Blocks road work until cleared, then can become dangerous again after 10+ days. |
| `burrow_forest` | Burrow | burrow | Generated | Beast Den: single lair fight against `lairRootfangBeast`, or leave. Also matches generic Occupied Burrow. Blocks road work until cleared, then can become dangerous again after 10+ days. |
| `burrow_giantnest` | Burrow | burrow | Generated | Giant Nest: single lair fight against `lairHillGiantNestkeeper`, or creep past. Also matches generic Occupied Burrow. Blocks road work until cleared, then can become dangerous again after 10+ days. |
| `burrow_hydraswamp` | Burrow | burrow | Generated | Hydra Burrow: single lair fight against `venomBogHydra`, or avoid. Also matches generic Occupied Burrow. Blocks road work until cleared, then can become dangerous again after 10+ days. |
| `burrow_manticorecliffs` | Burrow | burrow | Generated | Manticore Cliffs: single lair fight against `lairCliffManticore`, or leave. Also matches generic Occupied Burrow. Blocks road work until cleared, then can become dangerous again after 10+ days. |
| `burrow_spiders` | Burrow | burrow | Generated | Spider Burrow: single lair fight against `lairWebmotherSpider`, or mark webs. Also matches generic Occupied Burrow. Blocks road work until cleared, then can become dangerous again after 10+ days. |
| `burrow_trollbridge` | Burrow | burrow | Generated | Troll Bridge Burrow: single lair fight against `lairFungalTroll`, or find another crossing. Also matches generic Occupied Burrow. Blocks road work until cleared, then can become dangerous again after 10+ days. |
| `burrow_wyvernpeak` | Burrow | burrow | Generated | Wyvern Peak: single lair fight against `lairCliffWyvern`, or avoid ledge. Also matches generic Occupied Burrow. Blocks road work until cleared, then can become dangerous again after 10+ days. |
| `camp_border` | Camp | camp | Generated | Bandit Camp: raid fight, outlaw camp dungeon, stealth DC 13 supply steal with reward or fight, or watch from afar. Current road classifier treats it as road-blocking danger. |
| `camp_caravan` | Camp | camp | Generated | No explicit structure event yet. Current road classifier still treats it as road-blocking danger because it is kind `camp`; likely should be changed to non-danger unless a hostile quest targets it. |
| `camp_fishing` | Camp | camp | Generated | No explicit structure event yet. Current road classifier still treats it as road-blocking danger because it is kind `camp`; likely should be changed to non-danger. |
| `camp_goblin` | Camp | camp | Generated | Goblin Hideout: small `goblinWarren` dungeon, deception DC 13 lure with reward or fight, or avoid. Road-danger fallback can force a goblin clear event. |
| `camp_hunting` | Camp | camp | Generated | No explicit structure event yet. Current road classifier still treats it as road-blocking danger because it is kind `camp`; likely should be changed to non-danger. |
| `camp_lumber` | Camp | camp | Generated | No explicit structure event yet. Current road classifier still treats it as road-blocking danger because it is kind `camp`; likely should be changed to non-danger. |
| `camp_market` | Camp | camp | Generated | No explicit structure event yet. Current road classifier still treats it as road-blocking danger because it is kind `camp`; likely should be changed to non-danger. |
| `camp_nomad` | Camp | camp | Generated | No explicit structure event yet. Current road classifier still treats it as road-blocking danger because it is kind `camp`; likely should be changed to non-danger. |
| `camp_pallisade` | Camp | camp | Generated | Bandit Camp: raid fight, outlaw camp dungeon, stealth DC 13 supply steal with reward or fight, or watch from afar. Current road classifier treats it as road-blocking danger. |
| `camp_quarry` | Camp | camp | Generated | No explicit structure event yet. Current road classifier still treats it as road-blocking danger because it is kind `camp`; likely should be changed to non-danger. |
| `camp_siege` | Camp | camp | Palette/manual only | Bandit Camp: raid fight, outlaw camp dungeon, stealth DC 13 supply steal with reward or fight, or watch from afar. Not generated automatically. |
| `castle` | Castle | castle | Generated | Closed Gate: persuasion DC 14 parley for supplies or soldier fight, or find postern for medium `castleKeep` dungeon. Repeatable adventure site, does not block roads. |
| `castle_coastal` | Castle | castle | Palette/manual only | Closed Gate: persuasion DC 14 parley for supplies or soldier fight, or find postern for medium `castleKeep` dungeon. Not generated automatically. |
| `castle_knightly` | Castle | castle | Generated | Closed Gate: persuasion DC 14 parley for supplies or soldier fight, or find postern for medium `castleKeep` dungeon. |
| `castle_mountain` | Castle | castle | Generated | Closed Gate: persuasion DC 14 parley for supplies or soldier fight, or find postern for medium `castleKeep` dungeon. |
| `castle_square` | Castle | castle | Generated | Closed Gate: persuasion DC 14 parley for supplies or soldier fight, or find postern for medium `castleKeep` dungeon. |
| `city_capital` | City | city | Generated | Gate Work: insight DC 13 for coin or urban fight, or pass through. On arrival it unlocks/uses settlement systems: inn, quest board, shops/services, teleport circle once discovered. |
| `city_harbor` | City | city | Generated | Gate Work plus Night Ferry: persuasion DC 12 for supplies or dock fight, board ferry for small `underwater` dungeon, or sleep ashore. Settlement systems apply. |
| `city_large` | City | city | Generated | Gate Work: insight DC 13 for coin or urban fight, or pass through. Settlement systems apply. |
| `cursedtree` | Place | generic | Generated | No explicit structure event yet. Good candidate for forest curse, blight, or Gravebinder/Antiquarian hook. |
| `demon scar` | Place | generic | Generated | No explicit structure event yet. Good candidate for fiend scar or Boom Club/Crucible hook. |
| `demonscar` | Place | generic | Generated | No explicit structure event yet. Same event need as `demon scar`. |
| `elementalrift` | Place | generic | Generated | No explicit structure event yet. Good candidate for elemental crucible or rift event. |
| `entrance_cave` | Cave Entrance | cave | Generated | No explicit structure event yet. Empty/quest systems may still start biome dungeons; explicit cave entrance event is missing. |
| `entrance_coalmine` | Coal Mine Entrance | mine | Generated | Black Air Shaft: enter medium `emberveinDeepworks` mine dungeon, nature DC 13 for ore/coin or underground fight, or mark unsafe. If this site is the nearest starting mine with `embervein-first-claim`, The First Claim campaign option can override with the story claim event. |
| `entrance_crypt` | Ruins | ruin | Generated | Open Threshold: history DC 13 to find safer entry or trigger undead fight, enter small generic dungeon, or camp outside. |
| `entrance_crystalmine` | Crystal Mine Entrance | mine | Generated | Black Air Shaft plus Crystal Harmonics: arcana DC 14 for crystal reward or crystal fight, or medium mine dungeon. |
| `entrance_deserttemple` | Ruins | ruin | Generated | Open Threshold plus Buried Avenue: medium `desertRuins` dungeon, investigation DC 14 for coin or undead fight. |
| `entrance_goldmine` | Gold Mine Entrance | mine | Generated | Black Air Shaft mine event. Can also be the special Embervein First Claim if marked as the nearest starting mine. |
| `entrance_icecave` | Ruins | ruin | Generated | Open Threshold generic ruin event. Explicit arctic cave event is missing. |
| `entrance_ironmine` | Iron Mine Entrance | mine | Generated | Black Air Shaft mine event. Can also be the special Embervein First Claim if marked as the nearest starting mine. |
| `entrance_jungletemple` | Ruins | ruin | Generated | Open Threshold generic ruin event. Explicit jungle temple event is missing. |
| `entrance_mine` | Mine Entrance | mine | Generated | Black Air Shaft mine event. Can also be the special Embervein First Claim if marked as the nearest starting mine. |
| `entrance_saltmine` | Salt Mine Entrance | mine | Generated | Black Air Shaft mine event. Explicit salt mine/desert mine flavor is missing. |
| `entrance_volcanocave` | Ruins | ruin | Generated | Open Threshold generic ruin event. Explicit volcanic cave event is missing. |
| `farm` | Farm | farm | Generated | Sour Vintage: nature DC 12 for food or plant fight, or burn warning mark. |
| `farm_watermill` | Farm | farm | Generated | Sour Vintage farm event. |
| `farm_windmill` | Farm | farm | Generated | Sour Vintage farm event. |
| `giantskeleton` | Place | generic | Generated | No explicit structure event yet. Good candidate for monster-bone harvesting, giant lore, or boss clue. |
| `harbor` | Harbor | harbor | Generated | Gate Work plus Night Ferry: persuasion DC 12 for supplies or dock fight, board ferry for small `underwater` dungeon, or sleep ashore. Repeatable adventure site. |
| `hauntedbattlefield` | Haunted Battlefield | battlefield | Generated | Restless Ground: religion DC 13 to honor fallen for coin or undead fight, or cross fast. |
| `hellsportal` | Place | generic | Generated | No explicit structure event yet. Good candidate for fiend portal fight/dungeon. |
| `herbgarden` | Place | generic | Generated | No explicit structure event yet. Good candidate for herbalist salvage, medicine check, poison/blight event. |
| `lake_1` | Lake | lake | Generated | Below The Mirror: dive for small `underwater` dungeon, or survival DC 12 fishing for rations or lake predator fight. |
| `lake_2` | Lake | lake | Generated | Below The Mirror lake event. |
| `lake_3` | Lake | lake | Generated | Below The Mirror lake event. |
| `lake_4` | Lake | lake | Generated | Below The Mirror lake event. |
| `lake_5` | Lake | lake | Generated | Below The Mirror lake event. |
| `lake_6` | Lake | lake | Generated | Below The Mirror lake event. |
| `magic_obeslik` | Place | generic | Generated | No explicit structure event yet. Note spelling is `obeslik`; likely intended `obelisk`. Good Arcana/Antiquarian hook. |
| `magic_portal` | Place | generic | Generated | No explicit structure event yet. Good portal/rift dungeon hook. |
| `monsterbones` | Place | generic | Generated | No explicit structure event yet. Good Trophy Lodge/monster compendium hook. |
| `oldbattlefield` | Old Battlefield | battlefield | Generated | Restless Ground: religion DC 13 for coin or undead fight, or cross fast. |
| `portal` | Place | generic | Generated | No explicit structure event yet. Good portal dungeon hook. |
| `reef_kraken` | Place | generic | Generated | No explicit structure event yet. Ocean danger/site event missing. |
| `ruins_arctic` | Ruins | ruin | Generated | Open Threshold: history DC 13 to safer entry or undead fight, enter small generic dungeon, or camp outside. |
| `ruins_battlefield` | Ruins | ruin | Generated | Open Threshold generic ruin event. |
| `ruins_buriedcity` | Ruins | ruin | Generated | Open Threshold plus Buried Avenue: medium `desertRuins` dungeon, investigation DC 14 for coin or undead fight. |
| `ruins_collapsedgate` | Ruins | ruin | Generated | Open Threshold generic ruin event. |
| `ruins_desert` | Ruins | ruin | Generated | Open Threshold plus Buried Avenue desert ruin event. |
| `ruins_gate` | Ruins | ruin | Generated | Open Threshold generic ruin event. |
| `ruins_jungle` | Ruins | ruin | Generated | Open Threshold generic ruin event. Explicit jungle ruin flavor is missing. |
| `ruins_overgrwon` | Ruins | ruin | Generated | Open Threshold generic ruin event. Note spelling is `overgrwon`; likely intended `overgrown`. |
| `ruins_small` | Ruins | ruin | Generated | Open Threshold generic ruin event. |
| `ruins_stairway` | Ruins | ruin | Generated | Open Threshold generic ruin event. |
| `ruins_sunken` | Ruins | ruin | Generated | Open Threshold generic ruin event. Explicit underwater/sunken ruin flavor is missing. |
| `ruins_swamp` | Ruins | ruin | Generated | Open Threshold generic ruin event. Explicit swamp ruin flavor is missing. |
| `ruins_temple` | Ruins | ruin | Generated | Open Threshold generic ruin event. |
| `ruins_volcanic` | Ruins | ruin | Generated | Open Threshold generic ruin event. Explicit volcanic ruin flavor is missing. |
| `shrine_air` | Shrine | shrine | Generated | Air Shrine: small `crucibleOfStorms` dungeon, or religion DC 13 wind-listen for reward or air elemental fight. |
| `shrine_crystal` | Shrine | shrine | Generated | No explicit structure event yet. Good crystal shrine/Crucible hook. |
| `shrine_druidcircle` | Shrine | shrine | Generated | No explicit structure event yet. Good forest/druid event hook. |
| `shrine_earth` | Shrine | shrine | Generated | Earth Shrine: small `crucibleOfStone` dungeon, or nature DC 13 offering with earth elemental fight on failure. |
| `shrine_fire` | Shrine | shrine | Generated | Fire Shrine: small `crucibleOfFlame` dungeon, or arcana DC 13 flame-bank for reward or fire elemental fight. |
| `shrine_forest` | Shrine | shrine | Generated | No explicit structure event yet. Good forest spirit/druid event hook. |
| `shrine_necro` | Shrine | shrine | Generated | Necromantic Shrine: undead fight, medium `oldGuardroom` dungeon, or leave quickly. |
| `shrine_small` | Shrine | shrine | Generated | No explicit structure event yet. Could use generic shrine event. |
| `shrine_standingstones` | Shrine | shrine | Generated | Earth Shrine event. |
| `shrine_water` | Shrine | shrine | Generated | Water Shrine: small `crucibleOfTides` dungeon, or medicine DC 12 to purify water for reward or water elemental fight. |
| `sirenrocks` | Place | generic | Generated | No explicit structure event yet. Ocean/coast siren event missing. |
| `swamp_sinkhole` | Place | generic | Generated | No explicit structure event yet. Swamp descent/monster event missing. |
| `temple_desert` | Shrine | shrine | Generated | Buried Avenue: medium `desertRuins` dungeon, or investigation DC 14 for coin or undead fight. |
| `temple_moon` | Shrine | shrine | Generated | No explicit structure event yet. Good moon temple/undead/fey hook. |
| `temple_shattered` | Shrine | shrine | Generated | Necromantic Shrine event. |
| `temple_sun` | Shrine | shrine | Generated | No explicit structure event yet. Good sun temple/relic hook. |
| `tower_broken` | Place | generic | Generated | Dead Signal Tower: perception DC 13 for coin or soldier fight, or small `castleKeep` cellar dungeon. |
| `undead graveyard` | Place | generic | Generated | No explicit structure event yet. Should probably become Graveyard/Crypt event and Gravebinders hook. |
| `village` | Village | village | Generated | Village Rumors: persuasion DC 11 chores for rations, or keep moving. Arrival unlocks settlement systems and teleport circle if newly discovered. |
| `village_arctic` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_desert` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_farming` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_fishing` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_forest` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_forge` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_fortified` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_hamlet` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_jungle` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_mountain` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_ruins` | Village | village | Generated | Village Rumors plus settlement systems. |
| `village_swamp` | Village | village | Generated | Village Rumors plus settlement systems. |
| `vineyard` | Vineyard | vineyard | Generated | Sour Vintage: nature DC 12 for food or plant fight, or burn warning mark. |
| `watchtower` | Watchtower | tower | Generated | Dead Signal Tower: perception DC 13 for coin or soldier fight, or small `castleKeep` cellar dungeon. |
| `wizardtower` | Wizard Tower | tower | Generated | Wizard Tower: arcana DC 14 to open safer route or caster fight, force door for medium `wizardTower` dungeon, or leave. |

## Big-World Generator Placement Notes

The following list is the current automatic placement logic in broad terms.

- Cities: one city per generated chunk pass, chosen from `city_capital`, `city_large`, or sometimes `city_harbor` if shoreline is available.
- Villages: 2 to 5 per 10x10-like chunk size, chosen by biome from all `village_*` variants.
- Castles: one castle attempt from `castle`, `castle_knightly`, `castle_mountain`, or `castle_square`.
- Farms and services near settlements: `farm`, `farm_windmill`, `farm_watermill`, `vineyard`, `herbgarden`, `alchemist`.
- Mines near settlements and rough terrain: `entrance_mine`, `entrance_ironmine`, `entrance_goldmine`, `entrance_coalmine`, `entrance_crystalmine`, `entrance_saltmine`.
- Utility camps near settlements: `camp_quarry`, `camp_lumber`, `camp_hunting`, `camp_fishing`, `camp_market`, `camp_caravan`, `camp_nomad`, `camp_border`, `camp_pallisade`.
- Hostile camps: `banditcamp`, `bandit hideout`, `camp_goblin`.
- Towers and arcane sites: `watchtower`, `tower_broken`, `wizardtower`, `magic_portal`, `portal`, `magic_obeslik`, `elementalrift`, `abyssalrift`, `hellsportal`, `demon scar`, `demonscar`.
- Lairs/burrows: all `burrow_*` assets currently spawn.
- Entrances and ruins: cave, crypt, desert temple, ice cave, jungle temple, volcanic cave, battlefield ruins, gates, stairs, temples, small ruins, collapsed gates, old/haunted battlefields, arctic/desert/jungle/overgrown/swamp/volcanic/sunken ruins.
- Shrines and temples: air, earth, small, standing stones, crystal, druid circle, fire, forest, necro, water, plus desert/moon/sun/shattered temples.
- Ocean/water sites: generated lakes use `lake_1` through `lake_6`; ocean structure rules can place `reef_kraken` and `sirenrocks`.

## Recommended Follow-Up

1. Narrow road-blocking camps to only hostile camps: `camp_goblin`, `banditcamp`, `bandit hideout`, `camp_border`, `camp_pallisade`, `camp_siege`, and future clearly dangerous camps.
2. Add label aliases for generic structures so map tooltips do not say `Place` for rifts, graveyards, obelisks, bones, sinkholes, and portals.
3. Add explicit events for the generated no-event sites, especially `undead graveyard`, `entrance_cave`, `elementalrift`, `hellsportal`, `abyssalrift`, `cursedtree`, `sirenrocks`, `reef_kraken`, and the missing shrine variants.
4. Decide whether the six manual-only structures should enter generation. Bridges should probably wait for the road/expedition board system, while `camp_siege` and `castle_coastal` can safely be added to big-world rules if desired.
