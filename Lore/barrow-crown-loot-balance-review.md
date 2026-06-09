# Barrow Crown Loot Balance Review

This is the readable version of the loot audit. It uses the manually tuned first two dungeons as the rough reference point.

## Random Loot Fix

The monster `randomEquipmentDrop()` pool has been tightened.

- Allowed now: weapons, armor, ammunition, tools.
- Excluded now: handouts, components, treasure, healing items, magic loot.
- Small healing potions are still fine. They come from the separate healing-potion roll and from chest/furniture pools, not from random equipment.

## Quick Verdict

The campaign is not wildly broken, but it is uneven.

D1 and D2 feel like the current intended style: lots of searchable furniture, a few healing items, one or two meaningful magic/treasure highlights, and the new lore handouts tucked into appropriate places.

D3 is the biggest spike. It has several strong magic rewards in furniture, especially Shield of the Drowned Legion, Bracers of Archery, Leather Armor +1, Warhammer +1, and extra monster drops. If D1-D2 are the baseline, D3 is probably too generous unless it is meant to be a major reward dungeon.

D4 and D5 used to be much leaner in furniture loot. They now have a small number of deliberate exploration rewards, so they should feel less empty without becoming treasure piles.

D6 is mostly fine as a late vault-style dungeon: furniture loot is moderate, while boss fixed drops carry the reward weight. It now has one rare vault relic in furniture, which is high but understandable for a crown-vault climax.

D7 is intentionally sparse in room loot because it is a one-room wave finale. The final reward already branches correctly: destroying/breaking the crown route drops the Crownshard Longsword from the King Beneath, while claiming the crown route swaps in the Ashen Herald and drops the Barrow Crown artifact.

## Per-Dungeon Balance Table

| Dungeon | Fixed furniture loot | Fixed monster loot | Balance read |
|---|---:|---:|---|
| D1 The Robbed Tomb | 15 items, about 4520 gp listed value, 1 magic item, 3 healing items, 2 handouts | none | Good baseline if the Gold Funerary Mask and Gravebreaker's Lantern are intentional marquee finds. |
| D2 The Hall of Oathbreakers | 17 items, about 7626 gp listed value, 2 magic items, 7 healing items, 2 handouts | Plate armor from one monster | Rich, but coherent as your manual reference. Lots of sustain and a few memorable finds. |
| D3 The Sunken Ossuary | 22 items, about 12971 gp listed value, 4 magic items, 6 healing items, 2 handouts | Bone Key and Shield +1 | Too high compared to D1-D2. The Drowned Legion shield plus Bracers of Archery creates a big spike. |
| D4 The Grave-Market | Adds Gravekiss Dagger, Cloak of the Quiet Grave, and Necrotic Ward Draught, plus 2 handouts | Grave-Market Ledger and Black Market Coin from boss | Much healthier now. The market has actual illicit finds without outshining the boss coin. |
| D5 The Silent Cathedral | Adds Necrotic Ward Draught and Ring of the Last Breath, plus story/lore items | Bell-Ringer's Maul from boss | Better. Still solemn and boss-focused, but exploration has a small payoff. |
| D6 The Crown Vault | Adds Bracers of the Pallbearer, plus earlier healing/treasure/lore | 4 fixed magic boss drops | Reward-heavy but appropriate for the vault. Do not add much more unless the boss drops are reduced. |
| D7 The King Beneath | 2 lore handouts only | Crownshard Longsword on destroy route, Barrow Crown artifact on claim route | Fine for a one-room wave finale. The real reward is the ending branch. |

## Recommendations

1. Keep D1-D2 as the reference.
2. Tune D3 down slightly:
   - Move either Bracers of Archery or Shield of the Drowned Legion later, or make one of them optional/locked behind a harder secret.
   - Consider removing either Leather Armor +1 or Warhammer +1 if D3 should stay close to D2's reward level.
3. Keep D4-D5 story-forward. They now have enough exploration reward.
4. Keep D6 boss-reward heavy and avoid adding more fixed magic unless another reward is removed.
5. Keep D7 as the branch reward finale: Crownshard blade for the destroy route, Barrow Crown artifact for the claim route.
