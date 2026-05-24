# D&D 5e Spell Backlog for Dungeon Crawler

Scope and assumptions:
- Baseline is legacy D&D 5e / 2014-style spell levels and class access for Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, and Wizard.
- Artificer is not listed as a main class because your earlier class plan excluded Artificer, even though your current `core-spells.js` includes some Artificer access entries.
- This is an implementation design list, not verbatim spell text.
- Purely social, disguise, language, message, and identity spells are omitted from the main backlog.
- Stealth, flying, scouting, light, detection, traps, summoning, resurrection, terrain control, and dungeon traversal spells are included because your game has or can support those mechanics.
- Status column:
  - IMPLEMENTED = matched to a spell currently present in `core-spells.js`
  - BACKLOG = not currently matched in `core-spells.js`
  - REVIEW = included, but likely needs a custom simplification because it is broad, narrative, or high-complexity.

Recommended higher-level spell cost curve:
- Cantrip: 0
- Level 1: 2
- Level 2: 3
- Level 3: 5
- Level 4: 7
- Level 5: 9
- Level 6: 11
- Level 7: 13
- Level 8: 15
- Level 9: 18

Recommended unlock levels:
- Full casters: spell level 1 at character level 1, then 2/3/4/5/6/7/8/9 at character levels 3/5/7/9/11/13/15/17.
- Half casters: spell levels 1/2/3/4/5 at character levels 2/5/9/13/17.


## Cantrips (Level 0)
| Spell | Classes | Status | Dungeon-crawler implementation description |
|---|---|---:|---|
| **Acid Splash** | Sorcerer, Wizard | IMPLEMENTED | Cantrip AoE: splash acid onto one or two adjacent targets; Dex save or take acid damage. |
| **Blade Ward** | Bard | IMPLEMENTED | Cantrip defense: reduce physical damage taken until the caster’s next turn. |
| **Booming Blade** | Sorcerer, Warlock, Wizard | IMPLEMENTED | Weapon cantrip: melee hit deals weapon damage and marks the target; if it moves, it takes thunder damage. |
| **Chill Touch** | Sorcerer, Warlock, Wizard | IMPLEMENTED | Ranged necrotic cantrip; prevents healing and may debuff undead attacks. |
| **Dancing Lights** | Bard, Sorcerer, Wizard | BACKLOG | Create small moving lights; reveal dark tiles, lure enemies, or mark paths, but weaker than Light for exploration. |
| **Druidcraft** | Druid | BACKLOG | Minor nature utility: reveal weather/biome clues, make small plants bloom, snuff/ignite tiny flames; low mechanical priority. |
| **Eldritch Blast** | Warlock | IMPLEMENTED | Ranged force cantrip; can scale with multiple beams and warlock upgrades. |
| **Fire Bolt** | Sorcerer, Wizard | IMPLEMENTED | Ranged fire cantrip; can ignite flammable objects. |
| **Frostbite** | Druid, Sorcerer, Warlock, Wizard | IMPLEMENTED | Cold cantrip: Con save for cold damage and target has disadvantage/reduced next weapon attack. |
| **Green-Flame Blade** | Sorcerer, Warlock, Wizard | IMPLEMENTED | Weapon cantrip: melee hit deals weapon damage and jumps fire damage to a nearby enemy. |
| **Guidance** | Cleric, Druid | IMPLEMENTED | Passive/active support: add small bonus to skill checks such as perception, investigation, disarm, harvest. |
| **Light** | Bard, Cleric, Sorcerer, Wizard | BACKLOG | Create light source on object; reveal dark area and suppress darkness penalties. |
| **Mage Hand** | Bard, Sorcerer, Warlock, Wizard | IMPLEMENTED | Remote interaction: manipulate objects/chests from distance; can trigger or avoid trap mechanics depending design. |
| **Mending** | Bard, Cleric, Druid, Sorcerer, Wizard | BACKLOG | Repair broken gear, doors, mechanisms, or damaged objects if small enough. |
| **Mind Sliver** | Sorcerer, Warlock, Wizard | IMPLEMENTED | Psychic cantrip: Int save for psychic damage and penalty to next save. |
| **Poison Spray** | Druid, Sorcerer, Warlock, Wizard | IMPLEMENTED | Short-range poison cantrip; Con save or poison damage. |
| **Primal Savagery** | Druid | IMPLEMENTED | Melee acid cantrip using claws/fangs. |
| **Produce Flame** | Druid | IMPLEMENTED | Create light and throw flame as ranged fire cantrip. |
| **Ray of Frost** | Sorcerer, Wizard | IMPLEMENTED | Ranged cold cantrip; damage and reduce movement. |
| **Resistance** | Cleric, Druid | IMPLEMENTED | Cantrip support: add small bonus to next saving throw. |
| **Sacred Flame** | Cleric | IMPLEMENTED | Radiant cantrip; Dex save, ignores cover if desired. |
| **Shillelagh** | Druid | IMPLEMENTED | Empower club/staff; use casting ability for attacks and improve damage. |
| **Shocking Grasp** | Sorcerer, Wizard | IMPLEMENTED | Melee lightning cantrip; prevents target reactions, advantage vs metal armor if used. |
| **Thorn Whip** | Druid | IMPLEMENTED | Melee/ranged vine cantrip: pull target toward caster and deal piercing damage. |
| **Thunderclap** | Bard, Druid, Sorcerer, Warlock, Wizard | IMPLEMENTED | Close burst thunder cantrip; nearby enemies Con save or damage. |
| **Toll the Dead** | Cleric, Warlock, Wizard | IMPLEMENTED | Necrotic cantrip; stronger against already damaged targets. |
| **True Strike** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Cantrip setup: mark target so caster’s next attack gains strong accuracy/advantage; generally weak but can help burst builds. |
| **Vicious Mockery** | Bard | IMPLEMENTED | Psychic cantrip; Wis save or damage and target’s next attack is penalized. |

## Level 1
| Spell | Classes | Status | Dungeon-crawler implementation description |
|---|---|---:|---|
| **Absorb Elements** | Druid, Ranger, Sorcerer, Wizard | BACKLOG | Reaction defense: reduce incoming acid/cold/fire/lightning/thunder damage, then empower the caster’s next melee hit with a small matching elemental bonus. |
| **Alarm** | Ranger, Wizard | BACKLOG | Trap/ward utility: mark a tile/room; notify the party when enemies enter or spawn there. |
| **Armor of Agathys** | Warlock | IMPLEMENTED | Self buff: gain temp HP; while temp HP remains, melee attackers take cold damage. |
| **Arms of Hadar** | Warlock | IMPLEMENTED | Short-radius tentacle burst: nearby enemies take necrotic damage and lose reactions/movement options on failed save. |
| **Bane** | Bard, Cleric | IMPLEMENTED | Debuff up to several enemies; affected targets take a penalty to attacks and saving throws. |
| **Bless** | Cleric, Paladin | IMPLEMENTED | Buff several allies with bonus to attacks/saves for a duration. |
| **Burning Hands** | Sorcerer, Wizard | IMPLEMENTED | Cone fire spell; Dex save for half damage. |
| **Catapult** | Sorcerer, Wizard | BACKLOG | Launch a loose object in a line; target Dex save or takes bludgeoning damage and object breaks. |
| **Cause Fear** | Warlock | IMPLEMENTED | Single-target fear: Wis save or frightened for a duration. |
| **Chaos Bolt** | Sorcerer | BACKLOG | Ranged chaotic damage spell that can jump to another target on lucky rolls; random damage type. |
| **Chromatic Orb** | Sorcerer, Wizard | BACKLOG | Ranged elemental attack; caster chooses damage type from major elements. |
| **Color Spray** | Sorcerer, Wizard | BACKLOG | Cone control: blinds low-HP/weak enemies in front of the caster. |
| **Command** | Cleric, Paladin | BACKLOG | One-word combat control: force a target to flee, drop item, fall prone, approach, or skip action on failed save. |
| **Create or Destroy Water** | Cleric, Druid | BACKLOG | Create water, extinguish fires, clear steam, fill basins, or damage water-vulnerable hazards. |
| **Cure Wounds** | Bard, Cleric, Druid, Paladin, Ranger | IMPLEMENTED | Touch heal: restore HP to one adjacent ally. |
| **Detect Evil and Good** | Cleric, Paladin | BACKLOG | Reveal nearby aberrations, celestials, elementals, fey, fiends, undead, and consecrated/desecrated zones. |
| **Detect Magic** | Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Wizard | BACKLOG | Reveal magical traps, loot, hidden enchantments, and active magical effects nearby. |
| **Detect Poison and Disease** | Cleric, Druid, Paladin, Ranger | BACKLOG | Reveal poison/disease hazards, infected creatures, contaminated loot/food/water. |
| **Dissonant Whispers** | Bard | IMPLEMENTED | Psychic single-target spell; Wis save or damage and forced movement away from caster. |
| **Divine Favor** | Paladin | IMPLEMENTED | Self buff: caster’s weapon attacks deal bonus radiant damage. |
| **Earth Tremor** | Bard, Druid, Sorcerer, Wizard | BACKLOG | Ground shock around caster; Dex save or take bludgeoning damage and fall prone; creates difficult terrain. |
| **Ensnaring Strike** | Ranger | IMPLEMENTED | Next weapon hit restrains target with vines and deals ongoing piercing damage until escaped. |
| **Entangle** | Druid | IMPLEMENTED | Area vines restrain enemies and create difficult terrain. |
| **Expeditious Retreat** | Sorcerer, Warlock, Wizard | BACKLOG | Self mobility buff: dash/extra movement as quick action each round. |
| **Faerie Fire** | Bard, Druid | IMPLEMENTED | Area reveal: enemies failing save are outlined, lose stealth/invisibility, and attacks against them gain advantage. |
| **False Life** | Sorcerer, Wizard | BACKLOG | Self temp HP buffer. |
| **Feather Fall** | Bard, Sorcerer, Wizard | BACKLOG | Reaction: prevent fall damage and allow safe descent. |
| **Find Familiar** | Wizard | BACKLOG | Summon small scout/assistant; can reveal traps, carry tiny objects, or grant minor combat support. |
| **Floating Disk** | Wizard | BACKLOG | Summon carrying platform for loot, heavy objects, or pressure plate puzzles. |
| **Fog Cloud** | Druid, Ranger, Sorcerer, Wizard | IMPLEMENTED | Obscuring area; blocks line of sight and supports stealth/escape. |
| **Goodberry** | Druid, Ranger | BACKLOG | Create healing berries/consumables; each restores small HP and can count as supply. |
| **Grease** | Wizard | IMPLEMENTED | Slippery area; enemies may fall prone and terrain becomes hazardous/difficult. |
| **Guiding Bolt** | Cleric | IMPLEMENTED | Ranged radiant attack; next attack against hit target gains advantage/bonus. |
| **Hail of Thorns** | Ranger | IMPLEMENTED | Next ranged hit bursts thorns around the target for piercing area damage. |
| **Healing Word** | Bard, Cleric, Druid | IMPLEMENTED | Ranged quick heal; useful to revive downed allies. |
| **Hellish Rebuke** | Warlock | IMPLEMENTED | Reaction: when hit, blast attacker with fire damage. |
| **Heroism** | Bard, Paladin | IMPLEMENTED | Buff: target becomes immune/resistant to fear and gains temp HP each round. |
| **Hex** | Warlock | IMPLEMENTED | Curse target: bonus necrotic damage from caster hits and penalty to chosen checks. |
| **Hideous Laughter** | Bard, Wizard | IMPLEMENTED | Single-target control: Wis save or incapacitated/prone; damage allows repeat save. |
| **Hunter's Mark** | Ranger | IMPLEMENTED | Mark target; caster weapon hits deal bonus damage and tracking/reveal improves. |
| **Ice Knife** | Druid, Wizard | BACKLOG | Ranged ice shard: hit one target, then burst cold damage around it. |
| **Identify** | Bard, Wizard | BACKLOG | Reveal item properties, curses, magical locks, or trap enchantments. |
| **Inflict Wounds** | Cleric | IMPLEMENTED | Melee necrotic spell attack with high damage. |
| **Jump** | Druid, Ranger, Sorcerer, Wizard | BACKLOG | Triple jump distance; cross gaps or reach elevated tiles. |
| **Longstrider** | Bard, Druid, Ranger, Wizard | IMPLEMENTED | Buff speed/movement for duration. |
| **Mage Armor** | Sorcerer, Wizard | IMPLEMENTED | Set unarmored target’s base armor/AC to a protective magical value. |
| **Magic Missile** | Sorcerer, Wizard | IMPLEMENTED | Automatic force darts; never misses unless shielded. |
| **Protection from Evil and Good** | Cleric, Paladin, Warlock, Wizard | BACKLOG | Buff target against aberrations/celestials/elementals/fey/fiends/undead; attacks hindered and possession/charm/fear blocked. |
| **Sanctuary** | Cleric | BACKLOG | Protective ward: enemies must save to attack target or choose another action. |
| **Searing Smite** | Paladin | BACKLOG | Smite attack: fire damage and ongoing burning until target saves/extinguishes. |
| **Shield** | Sorcerer, Wizard | IMPLEMENTED | Reaction defense: increase AC/defense until next turn and block Magic Missile. |
| **Shield of Faith** | Cleric, Paladin | IMPLEMENTED | Buff AC/defense of one target. |
| **Silent Image** | Bard, Sorcerer, Wizard | BACKLOG | Create visual illusion as decoy, cover, lure, or fake obstacle; enemies may inspect/disbelieve. |
| **Sleep** | Bard, Sorcerer, Wizard | IMPLEMENTED | Area HP-based control: lowest-HP enemies fall unconscious until damaged/woken. |
| **Speak with Animals** | Bard, Druid, Ranger | BACKLOG | Exploration info: ask beasts for nearby enemies, hazards, food, routes, or secrets. |
| **Thunderous Smite** | Paladin | IMPLEMENTED | Smite attack: thunder damage, push, and prone on failed save. |
| **Thunderwave** | Bard, Druid, Sorcerer, Wizard | IMPLEMENTED | Close cube/cone thunder blast; push enemies and damage them. |
| **Unseen Servant** | Bard, Warlock, Wizard | BACKLOG | Invisible helper for simple object interactions, pressure plates, doors, and loot hauling. |
| **Wrathful Smite** | Paladin | IMPLEMENTED | Smite attack: psychic damage and frighten target. |
| **Zephyr Strike** | Ranger | BACKLOG | Ranger mobility buff: move without opportunity attacks and empower one weapon strike. |

## Level 2
| Spell | Classes | Status | Dungeon-crawler implementation description |
|---|---|---:|---|
| **Acid Arrow** | Wizard | BACKLOG | Ranged spell attack: deal acid damage immediately and apply acid damage-over-time for 1 round. |
| **Aganazzar's Scorcher** | Sorcerer, Wizard | BACKLOG | Line spell: fire erupts in a straight path; Dex save for half fire damage. |
| **Aid** | Cleric, Paladin | IMPLEMENTED | Party buff: increase current and maximum HP for several allies for the dungeon run or a long duration. |
| **Alter Self** | Sorcerer, Wizard | BACKLOG | Self buff with selectable modes: aquatic movement, natural weapon, or defensive/adaptive body trait. |
| **Arcane Lock** | Wizard | BACKLOG | Lock a door/chest/gate; hostile creatures need a high DC check or key effect to open it. |
| **Augury** | Cleric | REVIEW | Dungeon hint: spend a resource to preview whether the next room/event is favorable, dangerous, mixed, or empty. |
| **Barkskin** | Druid, Ranger | IMPLEMENTED | Defensive buff: set or raise target armor/AC floor for a duration. |
| **Blindness/Deafness** | Bard, Cleric, Sorcerer, Wizard | BACKLOG | Debuff: Con save or target becomes blinded; deafened can be ignored unless sound mechanics matter. |
| **Blur** | Sorcerer, Wizard | BACKLOG | Self defense: attackers have disadvantage/reduced hit chance against the caster. |
| **Branding Smite** | Paladin | IMPLEMENTED | Smite attack: radiant damage and reveals invisible/hidden enemies, preventing stealth. |
| **Calm Emotions** | Bard, Cleric | BACKLOG | Combat pacification: suppress charm/fear or reduce aggression in a small area for a duration. |
| **Cloud of Daggers** | Bard, Warlock, Wizard | BACKLOG | Small persistent hazard: enemies entering/starting in the tile take slashing damage. |
| **Continual Flame** | Cleric, Wizard | BACKLOG | Permanent magical light source; create light object/torch that cannot be extinguished normally. |
| **Cordon of Arrows** | Ranger | IMPLEMENTED | Place a trap zone of magical arrows that fires at enemies entering range. |
| **Crown of Madness** | Bard, Warlock, Wizard | BACKLOG | Charm/control: target may be forced to attack a nearby creature each turn. |
| **Darkness** | Sorcerer, Warlock, Wizard | IMPLEMENTED | Create a magical darkness zone that blocks sight and enables stealth unless countered by special vision. |
| **Darkvision** | Druid, Ranger, Sorcerer, Wizard | BACKLOG | Grant darkvision/low-light vision; reveal dark room contents without light penalties. |
| **Detect Thoughts** | Bard, Sorcerer, Wizard | BACKLOG | Detect hidden living/intelligent enemies or read surface intent; optionally reveal ambushes. |
| **Dragon's Breath** | Sorcerer, Wizard | BACKLOG | Buff ally/self to exhale elemental cone damage each round for a duration. |
| **Dust Devil** | Druid | BACKLOG | Summon small moving air hazard that damages/pushes enemies and obscures a tile. |
| **Earthbind** | Druid, Sorcerer, Warlock, Wizard | BACKLOG | Anti-flight spell: Str save or flying target is pulled to ground and loses flying. |
| **Enhance Ability** | Bard, Cleric, Druid, Sorcerer | BACKLOG | Buff one ability category; for crawler use as advantage/bonus to related checks and maybe temp HP for endurance mode. |
| **Enlarge/Reduce** | Sorcerer, Wizard | BACKLOG | Resize target: enlarged allies gain damage/strength; reduced enemies deal less damage and may fit/escape. |
| **Find Steed** | Paladin | BACKLOG | Summon mount/companion that increases mobility and can act as simple ally. |
| **Find Traps** | Cleric, Druid, Ranger | BACKLOG | Reveal nearby traps/hidden hazards and optionally mark their trigger tiles. |
| **Flame Blade** | Druid | BACKLOG | Create melee spell blade dealing fire damage with spell attack. |
| **Flaming Sphere** | Druid, Wizard | BACKLOG | Summon movable burning sphere that damages/blocks enemies near it each round. |
| **Gentle Repose** | Cleric, Wizard | BACKLOG | Preserve corpse to extend resurrection timer and prevent undead conversion. |
| **Gust of Wind** | Druid, Sorcerer, Wizard | BACKLOG | Line wind effect: pushes enemies, disperses gas/fog, and hampers movement toward caster. |
| **Healing Spirit** | Druid | BACKLOG | Summon spirit zone that heals allies entering/starting in it, with capped uses. |
| **Heat Metal** | Bard, Druid | IMPLEMENTED | Damage armored/weapon-bearing target each round; may impose disadvantage or force dropping metal item. |
| **Hold Person** | Bard, Cleric, Druid, Sorcerer, Warlock, Wizard | IMPLEMENTED | Paralyze humanoid; repeated saves, critical melee hits if paralyzed. |
| **Invisibility** | Bard, Sorcerer, Warlock, Wizard | IMPLEMENTED | Grant stealth/invisible state until attacking/casting or duration ends. |
| **Knock** | Bard, Sorcerer, Wizard | BACKLOG | Open locked door/chest; loud noise may alert or spawn enemies. |
| **Lesser Restoration** | Bard, Cleric, Druid, Paladin, Ranger | BACKLOG | Remove minor conditions: blinded, deafened, paralyzed, poisoned, or disease. |
| **Levitate** | Sorcerer, Wizard | BACKLOG | Move target vertically; disable melee enemy or cross vertical obstacles; flying-ish movement. |
| **Locate Animals or Plants** | Bard, Druid, Ranger | BACKLOG | Find nearby resource nodes, beasts, plants, harvestables, or biome clues. |
| **Locate Object** | Bard, Cleric, Druid, Paladin, Ranger, Wizard | BACKLOG | Point toward named/known object, loot, key, or quest item within range. |
| **Magic Weapon** | Paladin, Wizard | BACKLOG | Buff nonmagical weapon into magical weapon with attack/damage bonus. |
| **Maximilian's Earthen Grasp** | Sorcerer, Wizard | BACKLOG | Summon earthen hand that restrains/crushes one target and can move to another. |
| **Mirror Image** | Sorcerer, Warlock, Wizard | IMPLEMENTED | Self defense: create duplicates that can absorb hits. |
| **Misty Step** | Sorcerer, Warlock, Wizard | IMPLEMENTED | Bonus/quick teleport to visible nearby tile. |
| **Moonbeam** | Druid | IMPLEMENTED | Persistent radiant column; damages shapeshifters/undead well and can move each round. |
| **Pass without Trace** | Druid, Ranger | IMPLEMENTED | Party stealth buff; strong bonus to stealth checks and ambush avoidance. |
| **Phantasmal Force** | Bard | BACKLOG | Single-target illusion hazard; target takes psychic damage and behaves as if illusion is real. |
| **Prayer of Healing** | Cleric | BACKLOG | Out-of-combat group heal with longer cast time. |
| **Protection from Poison** | Cleric, Druid, Paladin, Ranger | BACKLOG | Neutralize poison and grant resistance/advantage against poison. |
| **Pyrotechnics** | Bard, Sorcerer, Wizard | BACKLOG | Turn fire into smoke cloud or blinding fireworks. |
| **Ray of Enfeeblement** | Warlock, Wizard | BACKLOG | Ranged necrotic debuff: target’s weapon damage is reduced. |
| **Rope Trick** | Wizard | BACKLOG | Create small extradimensional hiding/rest space reachable by rope. |
| **Scorching Ray** | Sorcerer, Wizard | IMPLEMENTED | Multiple ranged fire rays; can split targets. |
| **See Invisibility** | Bard, Sorcerer, Wizard | BACKLOG | Reveal invisible/ethereal enemies and remove hidden penalties against them. |
| **Shadow Blade** | Sorcerer, Warlock, Wizard | BACKLOG | Create psychic melee blade; stronger in dim light/darkness. |
| **Shatter** | Bard, Sorcerer, Warlock, Wizard | IMPLEMENTED | Area thunder burst; strong versus constructs/crystal/objects; Con save for half damage. |
| **Silence** | Bard, Cleric, Ranger | IMPLEMENTED | Area anti-sound: prevents verbal spells, blocks noise, supports stealth. |
| **Snilloc's Snowball Swarm** | Sorcerer, Wizard | BACKLOG | Small cold explosion; Dex save for half cold damage. |
| **Spider Climb** | Sorcerer, Warlock, Wizard | BACKLOG | Climb walls/ceilings; bypass pits, ground hazards, and vertical obstacles. |
| **Spike Growth** | Druid, Ranger | IMPLEMENTED | Hidden thorn terrain: difficult terrain and piercing damage per movement through it. |
| **Spiritual Weapon** | Cleric | IMPLEMENTED | Summon floating weapon that attacks each round as bonus/quick action. |
| **Warding Bond** | Cleric | BACKLOG | Link ally to caster: ally gains defenses/resistance, caster shares damage. |
| **Warding Wind** | Bard, Druid, Sorcerer, Wizard | BACKLOG | Self aura: deafens, disperses gas/fog, hinders ranged attacks and movement near caster. |
| **Web** | Sorcerer, Wizard | IMPLEMENTED | Area webs restrain enemies, create difficult terrain, and can burn. |

## Level 3
| Spell | Classes | Status | Dungeon-crawler implementation description |
|---|---|---:|---|
| **Animate Dead** | Cleric, Wizard | BACKLOG | Summon/control undead minion from a corpse tile; minion persists for the room or until destroyed. |
| **Aura of Vitality** | Paladin | BACKLOG | Healing aura: caster can repeatedly heal nearby allies for several rounds as a bonus/quick action. |
| **Beacon of Hope** | Cleric | BACKLOG | Party support: allies gain stronger healing and advantage/resistance against fear and death effects. |
| **Bestow Curse** | Bard, Cleric, Wizard | BACKLOG | Touch debuff: choose curse mode such as weaker attacks, vulnerability, damage-over-time, or disadvantage on saves. |
| **Blinding Smite** | Paladin | BACKLOG | Smite attack: radiant damage and blinds target on failed save. |
| **Blink** | Sorcerer, Wizard | BACKLOG | Self buff: caster phases out at end of turns, becoming untargetable part of the time. |
| **Call Lightning** | Druid | IMPLEMENTED | Persistent storm spell: each round call a lightning strike into a small area. |
| **Catnap** | Bard, Sorcerer, Wizard | BACKLOG | Short-rest acceleration: put allies into a brief magical rest to recover limited resources outside combat. |
| **Clairvoyance** | Bard, Cleric, Sorcerer, Wizard | REVIEW | Scouting sensor: reveal/observe a chosen room or corridor for a duration. |
| **Conjure Animals** | Druid, Ranger | BACKLOG | Summon beast allies; implement as one pack/minion group rather than many individual creatures. |
| **Conjure Barrage** | Ranger | BACKLOG | Ranger cone/line volley: weapon/ammo duplicates strike enemies in an area. |
| **Counterspell** | Sorcerer, Warlock, Wizard | BACKLOG | Reaction: cancel an enemy spell; higher-level enemy spells may require a check or cost. |
| **Create Food and Water** | Cleric, Paladin | BACKLOG | Survival/rest utility: restore supplies, remove hunger/thirst pressure, or enable long rest in harsh dungeons. |
| **Crusader's Mantle** | Paladin | BACKLOG | Party aura: allied weapon attacks deal bonus radiant damage. |
| **Daylight** | Cleric, Druid, Paladin, Ranger, Sorcerer | BACKLOG | Large bright light; dispels darkness and reveals hidden/shadow enemies. |
| **Dispel Magic** | Bard, Cleric, Druid, Paladin, Sorcerer, Warlock, Wizard | IMPLEMENTED | Remove magical effects, hazards, buffs, debuffs, or summoned objects from target/area. |
| **Elemental Weapon** | Paladin | BACKLOG | Buff weapon with attack bonus and chosen elemental damage. |
| **Enemies Abound** | Bard, Warlock, Wizard | BACKLOG | Mental confusion: target treats all creatures as enemies and may attack allies. |
| **Erupting Earth** | Druid, Sorcerer, Wizard | BACKLOG | Area ground burst: bludgeoning damage and difficult terrain. |
| **Fear** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Cone fear: enemies drop/lose actions and flee while frightened. |
| **Feign Death** | Bard | BACKLOG | Put ally/target into protected deathlike state; ignore poison/disease or fake corpse for encounters. |
| **Fireball** | Sorcerer, Wizard | IMPLEMENTED | Large fire explosion; Dex save for half damage; ignites flammable objects. |
| **Flame Arrows** | Druid, Ranger, Sorcerer, Wizard | BACKLOG | Buff ammunition/ranged attacks with bonus fire damage for several shots. |
| **Fly** | Sorcerer, Warlock, Wizard | IMPLEMENTED | Grant flying movement; ignore ground hazards and gaps until duration ends. |
| **Gaseous Form** | Sorcerer, Warlock, Wizard | BACKLOG | Transform into mist; resist damage and pass through cracks, but weak offense/movement. |
| **Glyph of Warding** | Bard, Cleric, Wizard | BACKLOG | Place magical trap/rune that detonates or stores a spell when triggered. |
| **Haste** | Sorcerer, Wizard | IMPLEMENTED | Buff ally: extra action/attack, speed, AC, Dex saves; causes lethargy when it ends. |
| **Hunger of Hadar** | Warlock | IMPLEMENTED | Darkness/acid/cold zone: blinds area, damages creatures inside, creates difficult terrain. |
| **Hypnotic Pattern** | Bard, Sorcerer, Warlock, Wizard | IMPLEMENTED | Area charm/stun-like control; affected enemies are incapacitated until damaged or shaken awake. |
| **Lightning Arrow** | Ranger | BACKLOG | Next ranged hit becomes lightning burst that damages target and nearby enemies. |
| **Lightning Bolt** | Sorcerer, Wizard | IMPLEMENTED | Line lightning spell; Dex save for half damage. |
| **Magic Circle** | Cleric, Paladin, Warlock, Wizard | BACKLOG | Create ward against selected creature types; blocks entry/exit/possession/charm/fear. |
| **Major Image** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Large illusion used as decoy, cover, lure, or fake obstacle; enemies may inspect/disbelieve. |
| **Meld into Stone** | Cleric, Druid | BACKLOG | Merge with stone to avoid danger, hide, or bypass detection in stone dungeons. |
| **Melf's Minute Meteors** | Sorcerer, Wizard | BACKLOG | Create small meteors; fire them over several turns as bonus area bursts. |
| **Nondetection** | Bard, Ranger, Wizard | BACKLOG | Stealth buff against magical detection/scouting. |
| **Phantom Steed** | Wizard | BACKLOG | Summon fast mount for exploration and travel; fragile in combat. |
| **Plant Growth** | Bard, Druid, Ranger | BACKLOG | Turn area into severe difficult terrain or enrich/activate plant growth for puzzles/resources. |
| **Protection from Energy** | Cleric, Druid, Ranger, Sorcerer, Wizard | BACKLOG | Grant resistance to one elemental damage type. |
| **Remove Curse** | Cleric, Paladin, Warlock, Wizard | BACKLOG | End curse effects on creature, item, or area. |
| **Revivify** | Cleric, Paladin | BACKLOG | Emergency combat resurrection if used shortly after death. |
| **Sleet Storm** | Druid, Sorcerer, Wizard | BACKLOG | Large slippery storm: difficult terrain, prone checks, breaks concentration, obscures vision. |
| **Slow** | Sorcerer, Wizard | BACKLOG | Area debuff: reduced speed, AC, attacks/actions, and casting efficiency. |
| **Speak with Dead** | Bard, Cleric | BACKLOG | Question corpse for clues, passwords, lore, or hidden objective hints. |
| **Speak with Plants** | Bard, Druid, Ranger | BACKLOG | Make plants reveal routes/hazards or create/clear plant difficult terrain. |
| **Spirit Guardians** | Cleric | IMPLEMENTED | Aura damage/control: enemies near caster are slowed and take radiant/necrotic damage each round. |
| **Stinking Cloud** | Bard, Sorcerer, Wizard | BACKLOG | Poison cloud: Con save or lose action; obscures area. |
| **Thunder Step** | Sorcerer, Warlock, Wizard | BACKLOG | Teleport away and create thunder burst at departure point. |
| **Tidal Wave** | Druid, Sorcerer, Wizard | BACKLOG | Water wave area: bludgeoning damage, prone, extinguishes flames. |
| **Tiny Hut** | Bard, Wizard | BACKLOG | Create safe dome for long rest; blocks creatures/weather/projectiles if allowed by dungeon rules. |
| **Vampiric Touch** | Warlock, Wizard | IMPLEMENTED | Melee necrotic spell attack each round; caster heals for part of damage dealt. |
| **Wall of Sand** | Wizard | BACKLOG | Obscuring/difficult wall that blocks line of sight and slows movement. |
| **Wall of Water** | Druid, Sorcerer, Wizard | BACKLOG | Water wall: difficult terrain, ranged fire penalties, cold can freeze sections. |
| **Water Breathing** | Druid, Ranger, Sorcerer, Wizard | BACKLOG | Party can breathe underwater; enables underwater dungeon zones. |
| **Water Walk** | Cleric, Druid, Ranger, Sorcerer | BACKLOG | Party walks on liquid surfaces; bypass water/lava/acid if allowed. |
| **Wind Wall** | Druid, Ranger | BACKLOG | Line wall that blocks arrows/gases/small flyers and damages/pushes creatures. |

## Level 4
| Spell | Classes | Status | Dungeon-crawler implementation description |
|---|---|---:|---|
| **Arcane Eye** | Wizard | BACKLOG | Scouting utility: reveal distant rooms/tiles, traps, or enemies without moving the party. |
| **Aura of Life** | Paladin | BACKLOG | Party aura: allies resist necrotic damage, cannot have max HP reduced, and downed allies stabilize/recover slightly. |
| **Aura of Purity** | Paladin | BACKLOG | Party aura: resistance/advantage against poison, disease, fear, charm, paralysis, blind/deaf/stun-style effects. |
| **Banishment** | Cleric, Paladin, Sorcerer, Warlock, Wizard | BACKLOG | Single-target removal: Cha save or target is removed from combat for a duration; extraplanar foes may be permanently dismissed if defeated. |
| **Black Tentacles** | Wizard | BACKLOG | Area control: tentacles make terrain difficult, restrain enemies, and deal bludgeoning damage each round. |
| **Blight** | Druid, Sorcerer, Warlock, Wizard | BACKLOG | Single-target necrotic nuke, especially strong against plants; Con save for half damage. |
| **Charm Monster** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Combat charm: non-humanoid creature stops attacking or treats caster as ally until damaged/expired; bosses need reduced effect. |
| **Compulsion** | Bard | BACKLOG | Area control: force affected enemies to move in chosen directions. |
| **Confusion** | Bard, Druid, Sorcerer, Wizard | BACKLOG | Area control: affected enemies act randomly, lose turns, move unpredictably, or attack wrong targets. |
| **Conjure Minor Elementals** | Druid, Wizard | BACKLOG | Summon a group of minor elemental allies or hazards; use capped minion count. |
| **Conjure Woodland Beings** | Druid, Ranger | BACKLOG | Summon fey/nature allies; use a single support swarm or capped minions. |
| **Control Water** | Cleric, Druid, Wizard | BACKLOG | Water-room control: lower/raise water, part water, redirect currents, or create whirlpool hazards. |
| **Death Ward** | Cleric, Paladin | BACKLOG | One-time death prevention: target drops to 1 HP instead of 0/death and resists instant-kill effects. |
| **Dimension Door** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Teleport caster and one ally to a visible/known tile within long range, bypassing obstacles. |
| **Divination** | Cleric | REVIEW | Divine hint for a goal, boss, route, or treasure; use as stronger Augury. |
| **Dominate Beast** | Druid, Sorcerer | BACKLOG | Control a beast enemy temporarily; command it as an ally while concentration holds. |
| **Elemental Bane** | Druid, Wizard | BACKLOG | Debuff target against chosen element; first hit each turn deals bonus damage and ignores resistance. |
| **Fabricate** | Wizard | REVIEW | Convert raw materials into object/bridge/barricade/tool; strong crafting/puzzle spell. |
| **Faithful Hound** | Wizard | BACKLOG | Invisible watchdog: guards an area, reveals intruders, and bites enemies entering range. |
| **Fire Shield** | Wizard | BACKLOG | Self buff: resistance to cold or fire and retaliatory fire/cold damage to melee attackers. |
| **Freedom of Movement** | Bard, Cleric, Druid, Ranger | BACKLOG | Buff: ignore difficult terrain, restraints, paralysis, webs, and underwater movement penalties. |
| **Giant Insect** | Druid | BACKLOG | Transform insects into temporary giant insect allies. |
| **Grasping Vine** | Ranger | BACKLOG | Create vine that pulls enemies toward a tile each round. |
| **Greater Invisibility** | Bard, Sorcerer, Wizard | BACKLOG | Target stays invisible even after attacking/casting for a short duration. |
| **Guardian of Faith** | Cleric | BACKLOG | Place stationary radiant guardian; damages enemies entering/nearby until damage pool is spent. |
| **Guardian of Nature** | Ranger | BACKLOG | Ranger self transformation: choose beast/plant form for speed, advantage, temp HP, or damage bonuses. |
| **Hallucinatory Terrain** | Bard, Druid, Warlock, Wizard | BACKLOG | Change perceived terrain; use as encounter modifier, stealth route, false hazard, or ambush setup. |
| **Ice Storm** | Druid, Sorcerer, Wizard | BACKLOG | Area hailstorm: bludgeoning/cold damage and difficult terrain. |
| **Locate Creature** | Bard, Cleric, Druid, Paladin, Ranger, Wizard | BACKLOG | Point toward nearest known creature type/name within range unless blocked. |
| **Mass Healing Word** | Cleric | IMPLEMENTED | Ranged quick group heal; revives multiple downed allies at low HP. |
| **Phantasmal Killer** | Wizard | BACKLOG | Fear/psychic damage-over-time; target repeats saves. |
| **Polymorph** | Bard, Druid, Sorcerer, Wizard | BACKLOG | Transform target into beast form; ally gains beast HP/attacks, enemy is neutralized into harmless form on failed save. |
| **Private Sanctum** | Wizard | REVIEW | Secure room: block teleportation, divination, sound, and vision across boundaries; safe-room setup. |
| **Resilient Sphere** | Wizard | BACKLOG | Trap/protect target in force sphere; blocks damage and movement. |
| **Secret Chest** | Wizard | REVIEW | Store loot in extradimensional chest and recall it later; inventory/storage utility. |
| **Shadow of Moil** | Warlock | BACKLOG | Warlock self-shroud: heavily obscures caster, damages attackers, grants resistance to radiant. |
| **Sickening Radiance** | Sorcerer, Warlock, Wizard | BACKLOG | Area radiant/poison-like hazard; damages and stacks exhaustion-style debuff on failed saves. |
| **Staggering Smite** | Paladin | BACKLOG | Smite attack: psychic damage and target has penalties to attacks/checks/reactions. |
| **Stone Shape** | Cleric, Druid, Wizard | BACKLOG | Reshape stone door/wall/object into passage, cover, seal, or bridge. |
| **Stoneskin** | Druid, Ranger, Sorcerer, Wizard | BACKLOG | Buff: resist nonmagical physical damage. |
| **Storm Sphere** | Sorcerer, Wizard | BACKLOG | Persistent storm area: difficult terrain/damage plus bonus lightning attacks. |
| **Vitriolic Sphere** | Sorcerer, Wizard | BACKLOG | Acid explosion with immediate and delayed acid damage. |
| **Wall of Fire** | Druid, Sorcerer, Wizard | BACKLOG | Create fire wall/ring; blocks routes and damages one side/creatures crossing. |
| **Watery Sphere** | Druid, Sorcerer, Wizard | BACKLOG | Large water bubble restrains and moves creatures around battlefield. |

## Level 5
| Spell | Classes | Status | Dungeon-crawler implementation description |
|---|---|---:|---|
| **Animate Objects** | Bard, Sorcerer, Wizard | BACKLOG | Turn nearby objects into temporary allied attackers; use a capped swarm/minion implementation to avoid performance issues. |
| **Antilife Shell** | Druid | BACKLOG | Protective aura: living creatures cannot enter adjacent tiles around the caster; undead/constructs may ignore it. |
| **Arcane Hand** | Wizard | BACKLOG | Summon a force hand that can strike, shove, block movement, or restrain one target each round. |
| **Banishing Smite** | Paladin | BACKLOG | Smite attack: heavy force damage and banish/remove a weakened target briefly or execute extraplanar enemies. |
| **Circle of Power** | Paladin | BACKLOG | Party aura: allies resist spell damage and get strong saves versus magical effects. |
| **Cloudkill** | Sorcerer, Wizard | BACKLOG | Moving poison cloud: heavily damages creatures inside and drifts each round. |
| **Commune** | Cleric | REVIEW | Divine hint spell: ask limited yes/no questions; use for dungeon secrets/objectives. |
| **Commune with Nature** | Druid, Ranger | REVIEW | Dungeon-region scan: reveal nearby terrain, creatures, hazards, resources, or points of interest. |
| **Cone of Cold** | Sorcerer, Wizard | BACKLOG | Large cone cold spell; Con save for half damage. |
| **Conjure Elemental** | Druid, Wizard | BACKLOG | Summon elemental ally; concentration break may turn it hostile or dismiss it. |
| **Conjure Volley** | Ranger | BACKLOG | Large ranged weapon storm; enemies in a big area make Dex save or take weapon-type damage. |
| **Contagion** | Cleric, Druid | BACKLOG | Melee disease curse: apply a severe debuff such as poison, vulnerability, disadvantage, or damage-over-time after failed saves. |
| **Creation** | Sorcerer, Wizard | REVIEW | Create temporary nonmagical material/object for puzzles, cover, bridges, weights, or crafting. |
| **Danse Macabre** | Warlock, Wizard | BACKLOG | Raise several corpses as temporary undead attackers with a spellcasting bonus. |
| **Dawn** | Wizard | BACKLOG | Radiant cylinder hazard: damages enemies each round and can move slowly. |
| **Destructive Wave** | Paladin | BACKLOG | Paladin shockwave: nearby enemies take thunder/radiant or necrotic damage and fall prone. |
| **Dispel Evil and Good** | Cleric, Paladin | BACKLOG | Protective anti-outsider/undead buff; can break charm/fear/possession or dismiss extraplanar target. |
| **Dominate Person** | Bard, Sorcerer, Wizard | BACKLOG | Control a humanoid enemy temporarily; command movement/actions with repeated saves on damage. |
| **Enervation** | Warlock, Wizard | BACKLOG | Necrotic tether: damage target each round and heal caster for part of the damage. |
| **Far Step** | Warlock, Wizard | BACKLOG | Short teleport each round while concentration lasts. |
| **Flame Strike** | Cleric | BACKLOG | Vertical radiant/fire blast; creatures in cylinder take split fire/radiant damage. |
| **Greater Restoration** | Bard, Cleric, Druid | BACKLOG | Remove major debuffs: curse, petrification, exhaustion, max HP reduction, charm, or ability drain. |
| **Hallow** | Cleric | BACKLOG | Consecrate an area: block selected creature types and add one persistent protective or harmful holy effect. |
| **Hold Monster** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Paralyze non-immune creature; repeated saves, critical melee hits if paralyzed. |
| **Immolation** | Sorcerer, Wizard | BACKLOG | Single-target fire burst plus ongoing burning damage each round. |
| **Infernal Calling** | Warlock, Wizard | BACKLOG | Summon devil ally with control risk; stronger if caster has binding/true name mechanics. |
| **Insect Plague** | Cleric, Druid, Sorcerer | BACKLOG | Large area swarm: piercing damage and difficult/obscured terrain. |
| **Legend Lore** | Bard, Cleric, Wizard | REVIEW | Reveal lore, weaknesses, history, or hidden properties of named item/place/creature. |
| **Maelstrom** | Druid | BACKLOG | Water vortex area: difficult terrain, damage, and pull creatures toward center. |
| **Mass Cure Wounds** | Bard, Cleric, Druid | BACKLOG | Area heal: restore HP to several allies in radius. |
| **Mislead** | Bard, Wizard | BACKLOG | Become invisible and create controllable illusory double for scouting/decoy tactics. |
| **Negative Energy Flood** | Warlock, Wizard | BACKLOG | Necrotic single-target damage; if killed, creates undead or empowers undead target. |
| **Passwall** | Wizard | BACKLOG | Open temporary passage through wall/stone/wood obstacle. |
| **Planar Binding** | Bard, Cleric, Druid, Wizard | REVIEW | Bind summoned extraplanar creature to serve longer without concentration. |
| **Raise Dead** | Bard, Cleric, Paladin | BACKLOG | Return recently dead ally to life with penalties/resource cost. |
| **Reincarnate** | Druid | BACKLOG | Revive dead ally in new random body/ancestry; campaign-level consequence. |
| **Scrying** | Bard, Cleric, Druid, Warlock, Wizard | REVIEW | Remote vision on creature/location; reveal room, boss, or objective information. |
| **Skill Empowerment** | Bard, Sorcerer, Wizard | BACKLOG | Double proficiency/large bonus to one skill such as athletics, stealth, investigation, disarm, harvest. |
| **Steel Wind Strike** | Ranger, Wizard | BACKLOG | Teleport-strike several enemies with force melee spell attacks, ending at chosen position. |
| **Swift Quiver** | Ranger | BACKLOG | Ranger buff: make extra ranged attacks each turn. |
| **Synaptic Static** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Psychic AoE: Int save for damage and penalty to attacks/checks/concentration for a duration. |
| **Telekinesis** | Sorcerer, Wizard | BACKLOG | Move/restrain creatures or manipulate heavy objects each round with contested check/save. |
| **Telepathic Bond** | Wizard | BACKLOG | Party link: coordinate without speech; improves stealth/team tactics and sharing detection. |
| **Teleportation Circle** | Bard, Sorcerer, Wizard | REVIEW | Create fixed portal to known circle; town/dungeon travel system. |
| **Transmute Rock** | Druid, Wizard | BACKLOG | Turn stone to mud or mud to stone, creating restraint/difficult terrain or solid barriers. |
| **Tree Stride** | Druid, Ranger | BACKLOG | Teleport between trees each round; forest/nature mobility. |
| **Wall of Force** | Wizard | BACKLOG | Invisible force wall/dome; blocks movement and most attacks, no normal damage break. |
| **Wall of Stone** | Druid, Sorcerer, Wizard | BACKLOG | Create stone walls/bridges/cover; can become permanent. |
| **Wrath of Nature** | Druid, Ranger | BACKLOG | Animate local nature: roots, rocks, trees, and wind harass enemies each round. |

## Level 6
| Spell | Classes | Status | Dungeon-crawler implementation description |
|---|---|---:|---|
| **Blade Barrier** | Cleric | BACKLOG | Wall spell: creates a damaging blade wall that blocks or punishes movement through it. |
| **Bones of the Earth** | Druid | BACKLOG | Summon stone pillars that lift, block, crush, or create cover on selected tiles. |
| **Chain Lightning** | Sorcerer, Wizard | BACKLOG | Multi-target lightning nuke: primary target plus several jumps to nearby enemies. |
| **Circle of Death** | Sorcerer, Warlock, Wizard | BACKLOG | Large necrotic explosion centered at range; Con save for half damage. |
| **Conjure Fey** | Druid, Warlock | BACKLOG | Summon a fey creature or fey combat effect; implement as one strong ally/control summon. |
| **Contingency** | Wizard | REVIEW | Preload a defensive/self spell that triggers automatically when a condition is met. |
| **Create Undead** | Cleric, Warlock, Wizard | BACKLOG | Create stronger undead minions from corpse tiles; limited control duration. |
| **Disintegrate** | Sorcerer, Wizard | BACKLOG | High-damage ray; if it kills, target is destroyed and some obstacles/walls can be removed. |
| **Eyebite** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Sustained gaze spell: each round choose a target to sleep, frighten, or sicken. |
| **Find the Path** | Bard, Cleric, Druid | REVIEW | Navigation spell: reveal shortest safe route to a known objective or exit. |
| **Flesh to Stone** | Warlock, Wizard | BACKLOG | Petrification control: Con saves over rounds; failure restrains then petrifies. |
| **Forbiddance** | Cleric | BACKLOG | Ward a large area against teleportation/planar creatures; damages selected creature types entering. |
| **Freezing Sphere** | Wizard | BACKLOG | Large cold explosion; can freeze water surfaces and damage creatures. |
| **Globe of Invulnerability** | Sorcerer, Wizard | BACKLOG | Stationary aura: blocks lower-level spells from affecting creatures inside. |
| **Guards and Wards** | Bard, Wizard | REVIEW | Dungeon defense spell: fill area with fog, locks, confusion, and magical wards/traps. |
| **Harm** | Cleric | BACKLOG | Necrotic single-target damage that also reduces target’s max HP until restored. |
| **Heal** | Cleric, Druid | BACKLOG | Large single-target heal and remove blindness/deafness/disease. |
| **Heroes' Feast** | Cleric, Druid | BACKLOG | Major party preparation: max HP increase, poison/fear immunity, and save bonuses until next rest. |
| **Instant Summons** | Wizard | BACKLOG | Bind item for later recall; inventory/quest item recovery mechanic. |
| **Investiture of Flame** | Sorcerer, Wizard | BACKLOG | Self elemental form: fire immunity/resistance, fire aura, and line fire attack. |
| **Investiture of Ice** | Sorcerer, Wizard | BACKLOG | Self elemental form: cold resistance, ice terrain aura, and cone cold attack. |
| **Investiture of Stone** | Sorcerer, Wizard | BACKLOG | Self elemental form: resist physical damage, move through stone, and knock enemies prone. |
| **Investiture of Wind** | Sorcerer, Wizard | BACKLOG | Self elemental form: flying, ranged attacks against you hindered, and gust attack. |
| **Irresistible Dance** | Bard, Wizard | BACKLOG | Single-target control: target dances, loses movement/defense, and grants advantage to attackers. |
| **Magic Jar** | Wizard | REVIEW | Possession spell: caster spirit enters container and can attempt to control humanoid bodies. |
| **Mental Prison** | Wizard | BACKLOG | Psychic restraint: target is trapped by illusion, takes psychic damage if it moves/breaks out. |
| **Move Earth** | Druid, Sorcerer, Wizard | BACKLOG | Reshape earth/stone terrain over time: trenches, ramps, cover, blocked paths. |
| **Planar Ally** | Cleric | REVIEW | Call extraplanar ally; use as expensive summon/quest bargain. |
| **Primordial Ward** | Druid | BACKLOG | Self protection against elemental damage; can discharge to gain immunity briefly. |
| **Programmed Illusion** | Bard, Wizard | REVIEW | Set triggered illusion for ambush, lure, distraction, or trap-like effect. |
| **Scatter** | Wizard | BACKLOG | Teleport several creatures to chosen visible tiles; use for rescue or battlefield repositioning. |
| **Soul Cage** | Warlock, Wizard | BACKLOG | Trap soul of dying humanoid to gain healing, advantage, answers, or distant sensing. |
| **Sunbeam** | Druid, Sorcerer, Wizard | BACKLOG | Sustained radiant line each round; blinds and damages, strong vs undead. |
| **Transport via Plants** | Druid | REVIEW | Teleport through large plants to another plant; nature dungeon travel shortcut. |
| **True Seeing** | Bard, Cleric, Sorcerer, Warlock, Wizard | BACKLOG | Grant truesight: see invisibility, illusions, shapechangers, ethereal creatures, and magical darkness. |
| **Wall of Ice** | Wizard | BACKLOG | Ice wall that blocks movement, can be broken, and releases cold damage/hazard. |
| **Wall of Thorns** | Druid | BACKLOG | Thorn wall: blocks/slows movement and deals piercing damage. |
| **Wind Walk** | Druid | REVIEW | Turn party into fast cloud forms for travel; limited combat use, strong exploration bypass. |
| **Word of Recall** | Cleric | BACKLOG | Emergency teleport party to prepared sanctuary. |

## Level 7
| Spell | Classes | Status | Dungeon-crawler implementation description |
|---|---|---:|---|
| **Arcane Sword** | Bard, Wizard | BACKLOG | Summon a floating force blade that attacks one target each round as a persistent spell weapon. |
| **Conjure Celestial** | Cleric | BACKLOG | Summon a celestial ally with healing/support attacks for a duration. |
| **Crown of Stars** | Sorcerer, Warlock, Wizard | BACKLOG | Create several radiant motes; each mote can be fired as a ranged radiant attack over time. |
| **Delayed Blast Fireball** | Sorcerer, Wizard | BACKLOG | Place a growing fire orb; detonate later for stronger area damage. |
| **Divine Word** | Cleric | BACKLOG | Holy burst: hostile creatures under HP thresholds are blinded, stunned, banished, or killed. |
| **Etherealness** | Bard, Cleric, Sorcerer, Warlock, Wizard | BACKLOG | Phase movement: caster bypasses walls/enemies/traps and becomes untargetable except by special effects. |
| **Finger of Death** | Sorcerer, Warlock, Wizard | BACKLOG | Heavy necrotic single-target damage; humanoid killed may rise as a zombie minion. |
| **Fire Storm** | Cleric, Druid, Sorcerer | BACKLOG | Shapeable fire area; multiple connected cells/tiles take heavy fire damage. |
| **Forcecage** | Bard, Warlock, Wizard | BACKLOG | Create inescapable force prison around target area; limited counters/teleport checks. |
| **Magnificent Mansion** | Bard, Wizard | REVIEW | Create safe extradimensional rest room with no combat; high-level safe long rest. |
| **Mirage Arcane** | Bard, Druid, Wizard | REVIEW | Large terrain rewrite: create/alter terrain for encounter-scale obstacles, hazards, cover, or routes. |
| **Plane Shift** | Cleric, Druid, Sorcerer, Warlock, Wizard | REVIEW | Travel/banish: move party to another plane or banish one enemy on failed save. |
| **Power Word Pain** | Warlock, Wizard | BACKLOG | Debuff target under HP threshold with pain penalties and concentration disruption. |
| **Prismatic Spray** | Sorcerer, Wizard | BACKLOG | Random multi-ray cone; each target suffers random elemental/control effect. |
| **Project Image** | Bard, Wizard | REVIEW | Create distant illusionary duplicate for scouting/casting presence. |
| **Regenerate** | Bard, Cleric, Druid | BACKLOG | Long healing buff: restores HP each round and can regrow lost limbs/body damage. |
| **Resurrection** | Bard, Cleric | BACKLOG | Restore dead ally after longer death window; stronger than Raise Dead. |
| **Reverse Gravity** | Druid, Sorcerer, Wizard | BACKLOG | Area control: creatures fall upward, take fall damage when spell ends, and lose ground positioning. |
| **Sequester** | Wizard | REVIEW | Hide creature/object from detection and suspend it until trigger. |
| **Simulacrum** | Wizard | REVIEW | Create duplicate ally with limited resources; expensive, high-complexity summon/companion. |
| **Symbol** | Bard, Cleric, Wizard | BACKLOG | Place magical trap glyph with selected effect: death, discord, fear, pain, sleep, stunning, etc. |
| **Teleport** | Bard, Sorcerer, Wizard | REVIEW | Instant long-distance travel with mishap chance; dungeon escape/return tool. |
| **Whirlwind** | Druid, Sorcerer, Wizard | BACKLOG | Moving wind vortex: damage, restrain/lift, and throw enemies. |

## Level 8
| Spell | Classes | Status | Dungeon-crawler implementation description |
|---|---|---:|---|
| **Abi-Dalzim's Horrid Wilting** | Sorcerer, Warlock, Wizard | BACKLOG | Large necrotic burst: living creatures in the area make a Con save or take heavy necrotic damage; constructs/undead can be immune or resistant. |
| **Animal Shapes** | Druid | REVIEW | Transform willing allies into beast forms for a mass combat/exploration buff. |
| **Antimagic Field** | Cleric, Wizard | BACKLOG | Aura that suppresses spells, magical buffs, summons, and magical hazards in a radius around the caster. |
| **Antipathy/Sympathy** | Druid, Wizard | REVIEW | Large-area control rune: selected creature types are either repelled from or drawn toward a marked zone. |
| **Clone** | Wizard | REVIEW | Long-term resurrection insurance; create a stored backup body for campaign/dungeon persistence. |
| **Control Weather** | Cleric, Druid, Wizard | REVIEW | Large-scale environmental control; change dungeon weather/visibility/hazard intensity over time. |
| **Demiplane** | Warlock, Wizard | REVIEW | Create/access pocket room; use as storage, prison, or special dungeon transition. |
| **Dominate Monster** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Control any non-immune creature temporarily; boss enemies should get repeated saves or reduced effect. |
| **Earthquake** | Cleric, Druid, Sorcerer | BACKLOG | Massive terrain disaster: damages structures, creates fissures/difficult terrain, knocks creatures prone. |
| **Feeblemind** | Bard, Druid, Warlock, Wizard | BACKLOG | Severe psychic attack: Int save or target takes damage and loses spellcasting/special abilities. |
| **Holy Aura** | Cleric | BACKLOG | Powerful party aura: advantage on saves, enemies have disadvantage to hit, fiends/undead may be blinded. |
| **Incendiary Cloud** | Sorcerer, Wizard | BACKLOG | Moving smoke/fire cloud: obscures and burns creatures inside each round. |
| **Maddening Darkness** | Warlock, Wizard | BACKLOG | Huge magical darkness zone with psychic damage each round. |
| **Maze** | Wizard | BACKLOG | Remove target into maze dimension; Int check each turn to escape. |
| **Mind Blank** | Bard, Wizard | BACKLOG | Protect target from psychic damage, charm, fear, mind reading, and divination. |
| **Power Word Stun** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Stun target under HP threshold; repeats Con saves to recover. |
| **Sunburst** | Druid, Sorcerer, Wizard | BACKLOG | Large radiant explosion; blinds and damages, strong vs undead/oozes. |
| **Tsunami** | Druid | BACKLOG | Massive moving water wall: damages, pushes, restrains/prones, and floods battlefield. |

## Level 9
| Spell | Classes | Status | Dungeon-crawler implementation description |
|---|---|---:|---|
| **Astral Projection** | Cleric, Warlock, Wizard | REVIEW | Endgame travel spell: enter special astral/dimensional routes; best as dungeon/realm transition rather than combat spell. |
| **Foresight** | Bard, Druid, Warlock, Wizard | BACKLOG | Ultimate buff: target gains advantage/bonus on attacks/saves/checks and enemies have disadvantage against it. |
| **Gate** | Cleric, Sorcerer, Wizard | REVIEW | Open planar portal or summon a named creature; use as boss/realm transition spell. |
| **Imprisonment** | Warlock, Wizard | REVIEW | Endgame containment: remove a target into a magical prison until special release condition. |
| **Mass Heal** | Cleric | BACKLOG | Huge party heal distributed among allies and removes major conditions. |
| **Mass Polymorph** | Bard | REVIEW | Transform multiple creatures; use as mass buff, crowd control, or emergency HP pool. |
| **Meteor Swarm** | Sorcerer, Wizard | BACKLOG | Ultimate area nuke: multiple huge explosions dealing fire/bludgeoning damage. |
| **Power Word Heal** | Bard | BACKLOG | Instantly heal and restore one ally, remove conditions, and let them stand. |
| **Power Word Kill** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Instantly kill target under HP threshold; no save. |
| **Prismatic Wall** | Wizard | BACKLOG | Ultimate layered wall: blocks passage and applies multiple elemental/control layers. |
| **Psychic Scream** | Bard, Sorcerer, Warlock, Wizard | BACKLOG | Huge psychic burst against many targets; Int save or stunned and damaged. |
| **Shapechange** | Druid, Wizard | REVIEW | Transform caster into powerful creature forms with retained mind/spell options; endgame self-buff. |
| **Storm of Vengeance** | Druid | BACKLOG | Huge storm over many rounds: thunder, acid, lightning, hail, and wind effects escalate. |
| **Time Stop** | Sorcerer, Wizard | REVIEW | Caster takes several turns while others are frozen; ends early if directly affecting another creature. |
| **True Polymorph** | Bard, Warlock, Wizard | REVIEW | Permanent transformation of creature/object into another creature/object; endgame control/creation. |
| **True Resurrection** | Cleric, Druid | BACKLOG | Restore dead ally without body and remove major death penalties. |
| **Weird** | Wizard | BACKLOG | Area nightmare: frightened and psychic damage over time. |
| **Wish** | Sorcerer, Wizard | REVIEW | Ultimate spell: duplicate lower-level spells or trigger custom miracle with risk. |

## Omitted because they are mostly social / identity / language / communication spells

- Level 0: Message (Bard, Sorcerer, Wizard)
- Level 0: Minor Illusion (Bard, Sorcerer, Warlock, Wizard)
- Level 0: Prestidigitation (Bard, Sorcerer, Warlock, Wizard)
- Level 0: Thaumaturgy (Cleric)
- Level 1: Animal Friendship (Bard, Druid, Ranger)
- Level 1: Charm Person (Bard, Druid, Sorcerer, Warlock, Wizard)
- Level 1: Comprehend Languages (Bard, Sorcerer, Warlock, Wizard)
- Level 1: Disguise Self (Bard, Sorcerer, Wizard)
- Level 1: Illusory Script (Bard, Warlock, Wizard)
- Level 1: Purify Food and Drink (Cleric, Druid, Paladin)
- Level 2: Animal Messenger (Bard, Druid, Ranger)
- Level 2: Arcanist's Magic Aura (Wizard)
- Level 2: Enthrall (Bard, Warlock)
- Level 2: Magic Mouth (Bard, Wizard)
- Level 2: Skywrite (Bard)
- Level 2: Suggestion (Bard, Sorcerer, Warlock, Wizard)
- Level 2: Zone of Truth (Bard, Cleric, Paladin)
- Level 3: Sending (Bard, Cleric, Wizard)
- Level 3: Tongues (Bard, Cleric, Sorcerer, Warlock, Wizard)
- Level 5: Awaken (Bard, Druid)
- Level 5: Contact Other Plane (Warlock, Wizard)
- Level 5: Dream (Bard, Warlock, Wizard)
- Level 5: Geas (Bard, Cleric, Druid, Paladin, Wizard)
- Level 5: Modify Memory (Bard, Wizard)
- Level 5: Seeming (Bard, Sorcerer, Wizard)
- Level 6: Mass Suggestion (Bard, Sorcerer, Warlock, Wizard)
- Level 8: Glibness (Bard, Warlock)

## Backlog-only quick index by level

### Level 0
Dancing Lights, Druidcraft, Light, Mending, True Strike

### Level 1
Absorb Elements, Alarm, Catapult, Chaos Bolt, Chromatic Orb, Color Spray, Command, Create or Destroy Water, Detect Evil and Good, Detect Magic, Detect Poison and Disease, Earth Tremor, Expeditious Retreat, False Life, Feather Fall, Find Familiar, Floating Disk, Goodberry, Ice Knife, Identify, Jump, Protection from Evil and Good, Sanctuary, Searing Smite, Silent Image, Speak with Animals, Unseen Servant, Zephyr Strike

### Level 2
Acid Arrow, Aganazzar's Scorcher, Alter Self, Arcane Lock, Augury, Blindness/Deafness, Blur, Calm Emotions, Cloud of Daggers, Continual Flame, Crown of Madness, Darkvision, Detect Thoughts, Dragon's Breath, Dust Devil, Earthbind, Enhance Ability, Enlarge/Reduce, Find Steed, Find Traps, Flame Blade, Flaming Sphere, Gentle Repose, Gust of Wind, Healing Spirit, Knock, Lesser Restoration, Levitate, Locate Animals or Plants, Locate Object, Magic Weapon, Maximilian's Earthen Grasp, Phantasmal Force, Prayer of Healing, Protection from Poison, Pyrotechnics, Ray of Enfeeblement, Rope Trick, See Invisibility, Shadow Blade, Snilloc's Snowball Swarm, Spider Climb, Warding Bond, Warding Wind

### Level 3
Animate Dead, Aura of Vitality, Beacon of Hope, Bestow Curse, Blinding Smite, Blink, Catnap, Clairvoyance, Conjure Animals, Conjure Barrage, Counterspell, Create Food and Water, Crusader's Mantle, Daylight, Elemental Weapon, Enemies Abound, Erupting Earth, Fear, Feign Death, Flame Arrows, Gaseous Form, Glyph of Warding, Lightning Arrow, Magic Circle, Major Image, Meld into Stone, Melf's Minute Meteors, Nondetection, Phantom Steed, Plant Growth, Protection from Energy, Remove Curse, Revivify, Sleet Storm, Slow, Speak with Dead, Speak with Plants, Stinking Cloud, Thunder Step, Tidal Wave, Tiny Hut, Wall of Sand, Wall of Water, Water Breathing, Water Walk, Wind Wall

### Level 4
Arcane Eye, Aura of Life, Aura of Purity, Banishment, Black Tentacles, Blight, Charm Monster, Compulsion, Confusion, Conjure Minor Elementals, Conjure Woodland Beings, Control Water, Death Ward, Dimension Door, Divination, Dominate Beast, Elemental Bane, Fabricate, Faithful Hound, Fire Shield, Freedom of Movement, Giant Insect, Grasping Vine, Greater Invisibility, Guardian of Faith, Guardian of Nature, Hallucinatory Terrain, Ice Storm, Locate Creature, Phantasmal Killer, Polymorph, Private Sanctum, Resilient Sphere, Secret Chest, Shadow of Moil, Sickening Radiance, Staggering Smite, Stone Shape, Stoneskin, Storm Sphere, Vitriolic Sphere, Wall of Fire, Watery Sphere

### Level 5
Animate Objects, Antilife Shell, Arcane Hand, Banishing Smite, Circle of Power, Cloudkill, Commune, Commune with Nature, Cone of Cold, Conjure Elemental, Conjure Volley, Contagion, Creation, Danse Macabre, Dawn, Destructive Wave, Dispel Evil and Good, Dominate Person, Enervation, Far Step, Flame Strike, Greater Restoration, Hallow, Hold Monster, Immolation, Infernal Calling, Insect Plague, Legend Lore, Maelstrom, Mass Cure Wounds, Mislead, Negative Energy Flood, Passwall, Planar Binding, Raise Dead, Reincarnate, Scrying, Skill Empowerment, Steel Wind Strike, Swift Quiver, Synaptic Static, Telekinesis, Telepathic Bond, Teleportation Circle, Transmute Rock, Tree Stride, Wall of Force, Wall of Stone, Wrath of Nature

### Level 6
Blade Barrier, Bones of the Earth, Chain Lightning, Circle of Death, Conjure Fey, Contingency, Create Undead, Disintegrate, Eyebite, Find the Path, Flesh to Stone, Forbiddance, Freezing Sphere, Globe of Invulnerability, Guards and Wards, Harm, Heal, Heroes' Feast, Instant Summons, Investiture of Flame, Investiture of Ice, Investiture of Stone, Investiture of Wind, Irresistible Dance, Magic Jar, Mental Prison, Move Earth, Planar Ally, Primordial Ward, Programmed Illusion, Scatter, Soul Cage, Sunbeam, Transport via Plants, True Seeing, Wall of Ice, Wall of Thorns, Wind Walk, Word of Recall

### Level 7
Arcane Sword, Conjure Celestial, Crown of Stars, Delayed Blast Fireball, Divine Word, Etherealness, Finger of Death, Fire Storm, Forcecage, Magnificent Mansion, Mirage Arcane, Plane Shift, Power Word Pain, Prismatic Spray, Project Image, Regenerate, Resurrection, Reverse Gravity, Sequester, Simulacrum, Symbol, Teleport, Whirlwind

### Level 8
Abi-Dalzim's Horrid Wilting, Animal Shapes, Antimagic Field, Antipathy/Sympathy, Clone, Control Weather, Demiplane, Dominate Monster, Earthquake, Feeblemind, Holy Aura, Incendiary Cloud, Maddening Darkness, Maze, Mind Blank, Power Word Stun, Sunburst, Tsunami

### Level 9
Astral Projection, Foresight, Gate, Imprisonment, Mass Heal, Mass Polymorph, Meteor Swarm, Power Word Heal, Power Word Kill, Prismatic Wall, Psychic Scream, Shapechange, Storm of Vengeance, Time Stop, True Polymorph, True Resurrection, Weird, Wish

