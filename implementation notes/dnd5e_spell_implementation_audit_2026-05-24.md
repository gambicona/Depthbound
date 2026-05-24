# D&D 5e Spell Implementation Audit - 2026-05-24

Scope:
- Audited the current `src/scripts/content/spells/core-spells.js` spell registry against the in-game descriptions, the actual effect payloads, and the expected 2014-style D&D 5e spell behavior.
- The registry currently contains many alias and racial duplicate entries, such as `burning-hands`, `fire-genasi-burning-hands`, and `mephistopheles-burning-hands`. This audit covers canonical spell concepts once; racial copies inherit the same audit unless a note says otherwise.
- "Actual game effect" refers to the mechanical payload currently expressible in the crawler: damage, healing, status effects, teleport, weapon riders, persistent areas, saves, target counts, and duration.
- "5e delta" summarizes rules differences without quoting rules text.

## System-Level Findings

| System | Current State | Impact on Spell Fidelity | Recommended Next System |
|---|---|---|---|
| Conditions | Has lightweight status flags: attack/save/AC/damage bonuses, speed lock, action lock, flight, resistances, vulnerabilities, monster ignore targeting. | Many spells compress blinded, charmed, frightened, incapacitated, paralyzed, poisoned, prone, restrained, stunned, exhaustion, and banishment into generic penalties or action locks. | Add a real condition engine with named condition semantics, immunities, repeat saves, cleanup hooks, and UI explanation. |
| Concentration | Supports duration and concentration flags, but many spells are shortened to 3 rounds. | Long 5e spells are mechanically compressed for encounter pacing. | Add encounter, dungeon, short-rest, and long-rest duration tiers. |
| Reactions | Some reaction-like spells are represented as castable actions/reactions, but trigger automation is partial. | Shield and Hellish Rebuke are approximations rather than true timing reactions. | Add a reaction trigger queue for hit, damaged, spellcast, save failed, enemy enters area, and ally drops. |
| Persistent Areas | Exists for selected point spells. Areas tick/affect creatures but walls are represented as circular hazards. | Wall spells, moving clouds, and shaped areas are simplified. | Add wall/line templates, moving area controllers, blocking terrain, and "start/enter/end turn" triggers. |
| Forced Movement | Mostly represented as speed penalties or action locks. | Thunderwave, Dissonant Whispers, Thorn Whip, Telekinesis, Tsunami, Whirlwind, and similar spells lack true push/pull/path movement. | Add forced movement with collision, opportunity suppression, pits, hazards, and path previews. |
| Summons and Minions | Not broadly supported for spell-created creatures. | Conjure, Animate, Find, Summon, Arcane Hand, Faithful Hound, and similar spells are skipped or flattened. | Add summon creature templates, ownership, initiative, duration, AI, command actions, and scaling. |
| Lighting and Vision | No full light/darkvision/truesight model. | Light, Dancing Lights, Daylight, Darkness, True Seeing, Sunbeam, Sunburst, and Maddening Darkness are tactical debuffs/buffs instead of vision rules. | Add tile illumination, darkvision, magical darkness, blindsight/truesight, stealth visibility, and reveal rules. |
| Destructible Terrain | Not currently present as a general system. | Disintegrate, Shatter, Stone Shape, Wall spells, Earthquake, Bones of the Earth, Passwall, and Transmute Rock are simplified. | Add object/terrain HP, materials, break effects, doors/walls/object targeting, and repair hooks. |
| Exploration and Narrative Magic | Some trap/chest/skill hooks exist, but broad divination/social/travel systems are missing. | Detect, Locate, Commune, Teleport, Gate, Wish, and many utility spells are absent or deferred. | Add dungeon knowledge graph, quest/object tags, room forecasting, safe-rest spaces, travel nodes, and narrative spell resolvers. |
| Healing and Death | Healing exists, stabilization exists, but resurrection and condition restoration are limited. | Revivify, Raise Dead, Resurrection, True Resurrection, Restoration spells, Regenerate, and Power Word Heal are partial or skipped. | Add death timers, corpse state, resurrection costs, condition cure taxonomy, max HP penalties, and revival UI. |
| Creature Types and Immunities | Spells mostly do not check humanoid/beast/fiend/undead/construct/plant tags. | Hold Person, Dominate Beast/Person/Monster, Protection from Evil and Good, Turn-like effects, Blight, and creature-type riders are broad. | Add creature type tags, spell targeting constraints, immunities, and class/race feature interactions. |

## Spell-by-Spell Audit

### Cantrips

| Spell | In-Game Description Intent | Actual Game Effect | 5e Delta | Audit |
|---|---|---|---|---|
| Acid Splash | Small acid splash with scaling cantrip damage. | Point-target 5 ft area, DEX save, 1d6 acid. | 5e can hit one or two nearby creatures and scales by tier. | Close, but should support two-target adjacency and exact scaling. |
| Blade Ward | Short physical damage defense. | Self status: physical resistances until start of next turn. | 5e grants resistance to weapon B/P/S until next turn. | Good approximation. |
| Booming Blade | Weapon rider adds thunder damage. | Next weapon hit adds thunder rider damage. | 5e also punishes voluntary movement and has tier scaling. | Partial; needs movement-trigger damage. |
| Chill Touch | Ranged necrotic cantrip. | Spell attack for 1d8 necrotic. | 5e prevents healing and penalizes undead attacks. | Partial; missing anti-heal and undead rider. |
| Dancing Lights | Dim lights make enemies easier to hit. | Hidden from chooser earlier, registry has point debuff AC -1. | 5e creates movable light, no direct combat debuff. | Keep hidden until lighting system exists; current effect is a placeholder. |
| Druidcraft | Nature signs/exploration bonus. | Self skill bonus. | 5e is minor weather/plant/flame sensory utility. | Acceptable crawler utility, but not rules-faithful. |
| Eldritch Blast | Force beam cantrip. | Spell attack 1d10 force. | 5e adds more beams at tiers, invocations can alter it. | Partial; needs multi-beam targeting and invocation hooks. |
| Fire Bolt | Ranged fire cantrip. | Spell attack 1d10 fire. | 5e can ignite unattended flammable objects. | Damage close; missing object ignition. |
| Frostbite | Cold damage and attack penalty. | CON save, 1d6 cold, attack penalty. | 5e imposes disadvantage on next weapon attack. | Good slim translation. |
| Green-Flame Blade | Weapon rider adds fire. | Next weapon hit adds fire damage. | 5e jumps fire damage to a second adjacent target. | Partial; needs adjacent target splash. |
| Guidance | Skill support. | Passive party 1d4 skill bonus if known. | 5e targets one creature, concentration, one ability check. | Strong utility adaptation, but too passive/global. |
| Light | Exploration light bonus. | Ally status with skill bonus. Hidden from lists because no lighting system. | 5e creates bright/dim light on an object. | Keep hidden; needs lighting system. |
| Mage Hand | Remote chest interaction. | Status causes next chest to be opened safely at range. | 5e manipulates objects at range with hand limitations. | Good crawler-specific implementation. |
| Mind Sliver | Psychic damage and save penalty. | INT save, psychic damage, save penalty. | 5e subtracts from next save. | Good slim translation. |
| Poison Spray | Short poison cantrip. | CON save, 1d12 poison. | 5e short range poison damage. | Close. |
| Primal Savagery | Melee acid attack. | Melee spell attack 1d10 acid. | 5e melee acid cantrip scaling. | Close. |
| Produce Flame | Ranged fire use. | Spell attack 1d8 fire. | 5e also creates held light. | Damage close; missing light mode. |
| Ray of Frost | Cold damage and slow. | Spell attack 1d8 cold, speed penalty. | 5e reduces speed. | Good. |
| Resistance | Save support. | Touch ally save bonus. | 5e concentration and 1d4 to one save. | Good slim translation, concentration omitted. |
| Sacred Flame | Radiant save cantrip. | DEX save, 1d8 radiant. | 5e ignores cover. | Damage close; cover not modeled. |
| Shillelagh | Weapon empowerment. | Bonus action self damage bonus. | 5e changes club/quarterstaff damage and casting ability. | Partial; needs weapon-specific ability/die override. |
| Shocking Grasp | Melee lightning cantrip. | Melee spell attack, lightning, attack penalty. | 5e prevents reactions and advantage vs metal armor. | Partial; needs reaction suppression and metal armor hook. |
| Spare the Dying | Stabilize dying hero. | Stabilized status on downed ally. | 5e stabilizes living creature at 0 HP. | Good if death-state engine remains simple. |
| Thorn Whip | Pulling vine attack. | Ranged attack, piercing damage, speed penalty. | 5e pulls target toward caster. | Partial; needs forced movement. |
| Thunderclap | Close thunder burst. | Self-centered 5 ft area, CON save, thunder damage. | 5e affects nearby creatures. | Good. |
| Toll the Dead | Necrotic save cantrip. | WIS save, 1d8 necrotic. | 5e uses larger die if target is wounded. | Partial; needs wounded-target scaling. |
| True Strike | Setup advantage. | Self status grants attack advantage for 2 rounds. | 5e targets one creature and grants advantage next turn. | Crawler-friendly, slightly stronger/faster. |
| Vicious Mockery | Psychic damage and attack penalty. | WIS save, psychic damage, attack penalty. | 5e imposes disadvantage on next attack. | Good slim translation. |

Racial cantrip copies (`high-elf-fire-bolt`, `levistus-ray-of-frost`, `minor-illusion`, `yuan-ti-poison-spray`) inherit the closest base spell audit. Minor Illusion is currently a self AC buff, not a 5e illusion object/sound.

### Level 1

| Spell | Current Intent and Actual Effect | 5e Delta and Follow-Up |
|---|---|---|
| Armor of Agathys | Temp HP; racial copy also gives cold resistance. | Needs automatic cold retaliation only while temp HP remains. |
| Arms of Hadar | Close necrotic burst with no-reaction style status. | Good slim version; should block reactions explicitly. |
| Bane | Multi-target WIS-save debuff to attacks/saves. | Good slim version; exact d4 subtraction omitted. |
| Bless | Multi-ally attack/save buff. | Good slim version; exact d4 omitted. |
| Burning Hands | 15 ft cone, DEX half, 3d6 fire. | Close. |
| Catapult | Single target DEX half bludgeoning. | 5e launches an object in a line and can miss target; needs object/line collision. |
| Cause Fear | WIS save frighten/action pressure. | Good slim version; creature-type and repeat save missing. |
| Chaos Bolt | Force spell attack with disruption. | 5e random damage type and possible jump are missing. |
| Color Spray | Cone blind/control. | 5e is HP-threshold based with no save; current save version is simpler. |
| Command | WIS save action lock. | Needs command modes: approach, drop, flee, grovel, halt. |
| Compelled Duel | Mark/attack penalty. | Needs forced target preference and range break rules. |
| Cure Wounds | Touch heal scaling. | Close. |
| Dissonant Whispers | Psychic damage and frighten. | Needs forced movement away. |
| Divine Favor | Self weapon damage bonus. | Good slim version. |
| Earth Tremor | Close area bludgeoning, prone/slow. | Close; needs difficult terrain. |
| Ensnaring Strike | Weapon rider restrains/pressure. | Good slim version; needs ongoing escape/check loop. |
| Entangle | Point area STR save restraint. | Good; needs persistent difficult terrain/repeat checks. |
| Expeditious Retreat | Bonus action speed buff. | Good slim translation of repeated Dash. |
| Faerie Fire | Area reveal/exposed. | Good; needs invisibility negation and advantage semantics. |
| False Life | Self temp HP. | Close. |
| Fog Cloud | Persistent obscurement zone. | Good if vision system exists; currently mostly status/area pressure. |
| Grease | Point area prone/slow. | Good; needs persistent re-save on entry/turn. |
| Guiding Bolt | Radiant attack plus exposed. | Good slim version. |
| Hail of Thorns | Weapon rider with splash hook. | Good slim version; needs exact save/splash scaling. |
| Healing Word | Bonus-action ranged heal. | Close. |
| Hellish Rebuke | Reaction-style fire damage. | Needs automatic trigger when damaged. |
| Heroism | Ally courage/temp HP/attack buff. | Needs fear immunity and recurring temp HP per turn. |
| Hex | Target mark/weakening. | Needs bonus damage on every hit and ability-check choice. |
| Hideous Laughter | WIS save action lock. | Needs prone, incapacitated, damage repeat save. |
| Hunter's Mark | Target mark. | Needs bonus damage on weapon hits and transfer. |
| Ice Knife | Small cold burst. | Needs initial attack plus separate DEX burst. |
| Inflict Wounds | Melee necrotic attack. | Close. |
| Longstrider | One-hour speed buff. | Close. |
| Mage Armor | +3 AC. | Needs unarmored-only AC formula rather than flat status. |
| Magic Missile | Auto-hit force damage. | Close; Shield interaction should be automatic. |
| Sanctuary | AC + monster-ignore ward. | Needs WIS save to attack warded target and break-on-attack. |
| Searing Smite | Weapon rider plus brief burn. | Needs ongoing fire damage/save/end condition. |
| Shield | Reaction AC buff. | Needs automatic timing and magic missile block. |
| Shield of Faith | Concentration AC buff. | Close. |
| Sleep | Area WIS save sleep. | 5e is HP-pool based with no save; current is simplified. |
| Thunderous Smite | Weapon rider thunder/prone pressure. | Needs push distance and save. |
| Thunderwave | Cone thunder damage. | Needs push and cube/position fidelity. |
| Wrathful Smite | Weapon rider psychic/fear pressure. | Needs WIS save and action check to end fear. |
| Zephyr Strike | Weapon rider speed/advantage/damage. | Good slim version; needs no-opportunity movement. |

### Level 2

| Spell | Current Intent and Actual Effect | 5e Delta and Follow-Up |
|---|---|---|
| Acid Arrow | Acid spell attack and brief AC burn. | Needs delayed acid damage on next turn. |
| Aganazzar's Scorcher | Line fire damage. | Close. |
| Aid | Ally HP/temp HP buff. | Needs max/current HP increase to multiple allies for 8 hours. |
| Alter Self | Self defense/damage/skill boost. | Needs selectable aquatic/natural weapon/appearance modes. |
| Barkskin | Ally AC buff. | Should set AC floor rather than flat AC bonus. |
| Blindness/Deafness | CON save blind. | Deafness mode omitted; acceptable until sound mechanics exist. |
| Blur | Self AC buff. | Should impose disadvantage to attackers, not flat AC. |
| Branding Smite | Weapon rider radiant/reveal. | Good; needs invisibility suppression. |
| Calm Emotions | Area calming attack penalty/action pressure. | Needs charm/fear suppression and hostility modes. |
| Cloud of Daggers | Persistent small slashing zone. | Good; needs start/enter trigger clarity. |
| Cordon of Arrows | Trap zone burst. | Good crawler adaptation; needs charges and enemy entry triggers. |
| Crown of Madness | WIS action lock. | Needs forced attack on adjacent target. |
| Darkness | Obscurement zone. | Needs actual vision/light/darkvision rules. |
| Dust Devil | Persistent small bludgeoning/debuff area. | Needs movable hazard and push. |
| Earthbind | Anti-flight debuff. | Good if flying exists; otherwise generic slow/accuracy penalty. |
| Enhance Ability | Skill bonus/temp HP. | Needs selectable ability benefits and advantage semantics. |
| Enlarge/Reduce | Ally enlarge only. | Needs enemy reduce mode, size, carrying, advantage/check effects. |
| Flame Blade | Self fire damage buff. | Needs summoned melee spell attack weapon. |
| Flaming Sphere | Persistent fire zone. | Needs movable bonus-action sphere and ram. |
| Gust of Wind | Line damage/slow. | Needs sustained pushing wind and gas dispersal. |
| Heat Metal | Fire damage and attack penalty. | Needs metal equipment targeting, drop/disadvantage mode, ongoing bonus action. |
| Hold Person | WIS hold/action lock. | Needs humanoid-only targeting, paralysis, repeat saves, melee crit support. |
| Invisibility | Ally ignored/stealth. | Needs break on attack/cast and true unseen mechanics. |
| Levitate | Racial self flight/AC/speed buff. | Needs vertical control, enemy disable, and object use. |
| Magic Weapon | Ally attack/damage buff. | Close; needs nonmagical weapon conversion. |
| Maximilian's Earthen Grasp | Single target bludgeon/restraint. | Needs persistent hand that can crush/move to new targets. |
| Mirror Image | Self AC buff. | Needs duplicate charges and attack redirection. |
| Misty Step | Bonus teleport. | Good. |
| Moonbeam | Persistent radiant point damage. | Needs shapeshifter rider and movable beam. |
| Pass without Trace | Skill buff. | Good crawler adaptation; concentration/duration okay. |
| Phantasmal Force | Psychic damage and distraction. | Needs illusion persistence and target behavior constraint. |
| Prayer of Healing | Multi-ally heal. | Should be out-of-combat 10-minute cast; current combat action is generous. |
| Protection from Poison | Poison resistance/save buff. | Needs poison neutralization/removal. |
| Ray of Enfeeblement | Necrotic spell attack and damage debuff. | Needs strength weapon damage halving and repeat saves. |
| Scorching Ray | Single attack for combined rays. | Needs separate ray attacks/targets. |
| Shadow Blade | Self advantage/damage buff. | Needs weapon creation, thrown range, dim-light advantage. |
| Shatter | Thunder area damage. | Needs construct/inorganic object riders. |
| Silence | Persistent silenced zone. | Needs real spellcasting verbal-component suppression. |
| Snilloc's Snowball Swarm | Cold area damage/slow. | Close. |
| Spike Growth | Persistent piercing/slow area. | Needs hidden terrain and movement-distance damage. |
| Spiritual Weapon | Spell attack damage. | Needs persistent bonus-action weapon. |
| Suggestion | Racial WIS action lock. | Narrative suggestion is intentionally collapsed. |
| Warding Bond | AC/save/resistance buff. | Needs paired damage sharing. |
| Warding Wind | Self defense/speed buff. | Needs deafening, ranged attack disadvantage, gas dispersal. |
| Web | Area restraint. | Needs flammable web and repeat STR checks. |

### Level 3

| Spell | Current Intent and Actual Effect | 5e Delta and Follow-Up |
|---|---|---|
| Aura of Vitality | Multi-ally bonus-action heal. | Needs aura duration with repeated bonus-action healing. |
| Beacon of Hope | Multi-ally saves/temp HP. | Needs advantage on WIS/death saves and max healing received. |
| Bestow Curse | WIS debuff. | Needs selectable curse modes and attack/save riders. |
| Blinding Smite | Weapon rider radiant/blind. | Needs CON save and continuing blindness. |
| Blink | Self AC/ignore targeting. | Needs random ethereal phase timing. |
| Call Lightning | Lightning area damage. | Needs repeated storm calls and outdoor/storm scaling. |
| Conjure Barrage | Cone weapon damage. | Close. |
| Crusader's Mantle | Self damage aura simplified. | Should buff nearby allies' weapon hits, not only caster. |
| Dispel Magic | Present in lists but not audited as a full combat effect. | Needs effect-removal targeting and ability checks by spell level. |
| Elemental Weapon | Ally attack/damage buff. | Needs selectable element and higher-level scaling. |
| Enemies Abound | INT confusion/action lock. | Needs random target attacks. |
| Erupting Earth | Bludgeoning area/slow. | Needs difficult terrain. |
| Fear | Cone action lock/frighten pressure. | Needs drop items and flee behavior. |
| Flame Arrows | Ally weapon damage buff. | Needs ammunition count. |
| Fly | Existing movement/flying buff. | Good if flight pathing supports it; needs fall on end. |
| Gaseous Form | Ally flight/ignore/resistance. | Needs no attacks/casts, squeezing, slow movement. |
| Haste | Existing speed/AC/action buff. | Needs extra restricted action and lethargy on end. |
| Hunger of Hadar | Existing persistent zone. | Needs cold/acid split and blindness/darkness fidelity. |
| Hypnotic Pattern | Existing control. | Needs charm/incapacitation and break-on-damage/shake. |
| Lightning Arrow | Weapon rider and splash hook. | Good slim version; needs miss behavior and save details. |
| Lightning Bolt | Existing line lightning. | Close. |
| Mass Healing Word | Existing multi-heal. | Close. |
| Melf's Minute Meteors | Simplified fire burst. | Needs stored meteors fired over rounds. |
| Plant Growth | Persistent slow zone. | Good terrain simplification. |
| Protection from Energy | Broad elemental resistance. | 5e chooses one damage type; current is stronger. |
| Sleet Storm | Persistent prone/slow area. | Needs concentration checks, obscurement, and difficult terrain. |
| Slow | WIS area slow/debuff. | Needs action economy restrictions and spell delay details. |
| Spirit Guardians | Existing self aura. | Needs creature-type visuals, start/enter damage, half speed. |
| Stinking Cloud | Persistent action lock zone. | Good slim version; needs poison/obscurement details. |
| Thunder Step | Teleport only. | Missing departure thunder damage and passenger. |
| Tidal Wave | Area bludgeoning/prone. | Good; needs exact rectangular shape. |
| Vampiric Touch | Necrotic attack and caster vitality. | Needs repeated melee spell attack via concentration. |
| Wall of Sand | Line slow/attack penalty. | Needs true wall template and obscured vision. |
| Wall of Water | Line slow/fire resistance. | Needs projectile/fire/cold interactions. |
| Wind Wall | Line damage/debuff. | Needs wall blocking gases/projectiles and shaped wall. |

### Levels 4-9

Most high-level spells were deliberately implemented as encounter-scale tactical effects. They are useful in the game, but many are not full 5e recreations because the engine lacks true walls, summons, selectable modes, per-turn spell controllers, creature-type filters, and long-duration campaign magic.

| Spell | Current Intent and Actual Effect | 5e Delta and Follow-Up |
|---|---|---|
| Antilife Shell | Self defense/monster avoidance. | Needs living-creature exclusion aura, not just AC/ignore targeting. |
| Antimagic Field | Self defense/save buff. | Needs suppression of magic items, spells, summons, and magical areas. |
| Arcane Sword | Persistent small force hazard. | Needs movable bonus-action spell weapon attacks. |
| Aura of Life | Multi-ally temp HP/necrotic ward. | Needs aura preventing HP max reduction and helping at 0 HP. |
| Aura of Purity | Multi-ally poison/save ward. | Needs disease/poison/charm/frighten/stun condition advantage. |
| Banishment | CHA action-lock/removed status. | Needs extraplanar permanent banish case and true temporary removal. |
| Banishing Smite | Weapon rider force/banish. | Needs HP-threshold banish and concentration. |
| Black Tentacles | Persistent damage/restraint zone. | Good slim version; needs escape checks and difficult terrain. |
| Blade Barrier | Persistent slashing zone. | Needs true wall/ring shape and cover/blocking behavior. |
| Blight | Necrotic single-target nuke. | Needs plant/plant creature riders. |
| Chain Lightning | Area lightning burst. | Needs primary plus three secondary target selection. |
| Charm Monster | WIS action-lock charm. | Needs charm relationship, advantage if hostile, upcast groups. |
| Circle of Death | Large necrotic area. | Close. |
| Circle of Power | Multi-ally save/resistance ward. | Needs spell/magical-effect-only filtering and no-damage-on-save success. |
| Cloudkill | Persistent poison area. | Needs moving cloud and heavy obscurement. |
| Compulsion | Area action lock. | Needs forced movement direction controlled by caster. |
| Cone of Cold | Large cold cone. | Close; missing corpse-freezing flavor only. |
| Confusion | Persistent action lock zone. | Needs random behavior table. |
| Conjure Volley | Large piercing area. | Close. |
| Contagion | Poison attack/disease debuff. | Needs disease options and delayed onset/save sequence. |
| Crown of Stars | Self attack/damage buff. | Needs seven separate radiant mote attacks. |
| Dawn | Persistent radiant zone. | Needs movable sunlight column. |
| Death Ward | Temp HP/save buffer. | Needs one-time drop-to-1/death-spell prevention. |
| Delayed Blast Fireball | Immediate large fire burst. | Needs delayed growing bead and detonation timing. |
| Destructive Wave | Large radiant/thunder/prone burst. | Good slim version; damage type split omitted. |
| Dimension Door | Self teleport. | Needs passenger and longer range/known destination support. |
| Disintegrate | Heavy force damage. | Needs zero-on-success, object/force destruction, dusting kills. |
| Dispel Evil and Good | Ally defense/save ward. | Needs aberration/celestial/elemental/fey/fiend/undead protection and dismissal. |
| Divine Word | Area action pressure. | Needs HP-threshold effects: deaf/blind/stun/banish/kill. |
| Dominate Beast/Person/Monster | WIS action lock/attack penalty. | Needs creature-type targeting, controlled actions, repeat saves on damage. |
| Earthquake | Persistent damage/slow zone. | Needs fissures, structure damage, concentration disruption, prone. |
| Elemental Bane | Elemental vulnerability/save debuff. | 5e chooses one damage type and adds damage once per turn; current applies broad vulnerabilities. |
| Enervation | Necrotic damage/debuff. | Needs sustained beam and caster healing. |
| Etherealness | Self ignore/flying/AC. | Needs full ethereal plane movement and multi-target upcast. |
| Eyebite | Single status lockdown. | Needs repeated gaze choices: asleep, panicked, sickened. |
| Far Step | Bonus teleport. | Needs repeat bonus-action teleport while concentration lasts. |
| Feeblemind | Psychic damage/debuff. | Needs severe spellcasting/intelligence shutdown and long recovery. |
| Finger of Death | Necrotic nuke. | Needs zombie creation on humanoid kill. |
| Fire Shield | Self defense/resistance/damage. | Needs hot/cold shield choice and melee retaliation. |
| Fire Storm | Large fire area. | Needs shapeable multiple connected cubes and object damage choices. |
| Flame Strike | Radiant/fire area. | Damage split omitted. |
| Flesh to Stone | Petrifying action lock. | Needs progressive save track ending in petrified. |
| Forcecage | Persistent action-lock zone. | Needs no-save cage/box, teleport escape CHA save, no concentration. |
| Forbiddance | Persistent radiant zone. | Needs huge ward, creature-type selection, teleport prevention, long casting. |
| Foresight | Strong all-purpose ally buff. | Good slim version; needs enemy disadvantage and no-surprise hooks. |
| Freedom of Movement | Speed/save buff. | Needs explicit ignore difficult terrain, paralyzed/restrained, underwater penalties. |
| Freezing Sphere | Cold area/slow. | Needs delayed globe option and water freezing. |
| Globe of Invulnerability | Self defense/save buff. | Needs actual low-level spell blocking. |
| Grasping Vine | Persistent hold zone. | Needs movable vine pulling creatures. |
| Greater Invisibility | Ally advantage/AC/ignore. | Needs invisibility not broken by attacks/casts and vision counters. |
| Guardian of Faith | Persistent radiant zone. | Needs fixed guardian with damage pool/trigger limits. |
| Guardian of Nature | Self primal buff. | Needs two selectable forms. |
| Harm | Heavy necrotic/debuff. | Needs max HP reduction until rest/restoration. |
| Heal | Large heal. | Needs exact flat 70 HP and condition removal. |
| Heroes' Feast | Multi-ally temp HP/save/poison ward. | Needs feast preparation, max HP increase, fear/poison immunity, wisdom save advantage. |
| Hold Monster | WIS paralyze status. | Needs non-undead restriction? 5e excludes undead in 2014. |
| Holy Aura | Multi-ally AC/save buff. | Needs enemy disadvantage, fiend/undead blind rider, and save advantage. |
| Horrid Wilting | Large necrotic area. | Needs construct/undead/plant/water elemental special cases. |
| Ice Storm | Cold area/slow. | Needs bludgeoning+cold split and difficult terrain. |
| Immolation | Fire damage/burn. | Needs ongoing damage until save and ash kill flavor. |
| Incendiary Cloud | Persistent fire zone. | Needs moving cloud and obscurement. |
| Insect Plague | Persistent piercing/debuff zone. | Needs difficult terrain/light obscurement. |
| Investiture spells | Self elemental forms. | Need each form's active attack and exact immunities/resistances. |
| Irresistible Dance | WIS action lock/dance. | 5e has no initial save, target can use action to save later. |
| Maddening Darkness | Persistent psychic darkness. | Needs magical darkness/vision integration. |
| Maelstrom | Persistent bludgeoning/slow zone. | Needs pull-to-center forced movement. |
| Mass Cure Wounds | Six-target heal. | Close. |
| Mass Heal | Six-target large heal. | Needs distributable 700 HP pool and condition removal. |
| Maze | No-save action lock. | Needs extradimensional removal and INT check to escape. |
| Mental Prison | Psychic damage plus restraint. | Needs damage if moved/pushed out and illusion logic. |
| Meteor Swarm | Huge fire damage. | Needs four separate impact points and fire+bludgeoning split. |
| Mind Blank | Psychic resistance/save buff. | Needs immunity to psychic, charm, divination, mind reading. |
| Negative Energy Flood | Necrotic nuke. | Needs zombie rider if humanoid killed and undead temp HP mode. |
| Phantasmal Killer | Psychic/frighten. | Needs ongoing fear damage over turns. |
| Power Word Heal | Huge heal. | Needs full heal, stand up, and condition removal. |
| Power Word Kill | Massive necrotic damage. | Needs HP-threshold instant death, no damage roll. |
| Power Word Pain | No-save debuff. | Needs HP threshold and action/casting penalties. |
| Power Word Stun | No-save 1 round stun. | Needs HP threshold and repeat CON saves. |
| Prismatic Spray | Force cone/daze. | Needs random ray table by target. |
| Prismatic Wall | Persistent force hazard/debuff. | Needs seven layers with distinct colors/counters. |
| Primordial Ward | Elemental resistance/save buff. | Needs discharge-to-immunity option. |
| Psychic Scream | Psychic area/stun. | Needs up to 10 targets, INT save, exploding head kill flavor. |
| Regenerate | Immediate heal. | Needs ongoing healing and limb restoration. |
| Resilient Sphere | Creature action-lock/protection. | Needs target can be protected but not attacked; sphere movement/immune damage. |
| Reverse Gravity | Area damage/lift lock. | Needs true vertical falling, ceiling collision, end fall. |
| Shadow of Moil | Self defense/damage/ignore. | Needs obscurement and radiant resistance/retaliation. |
| Sickening Radiance | Persistent radiant/debuff. | Needs exhaustion stack and anti-invisibility glow. |
| Skill Empowerment | Skill bonus. | Good crawler adaptation; needs chosen skill expertise. |
| Staggering Smite | Weapon rider stun. | Needs WIS save and attack/check/reaction penalties. |
| Steel Wind Strike | Force area burst. | Needs five separate melee spell attacks and teleport. |
| Stoneskin | Physical resistance. | Good slim version; material cost ignored. |
| Storm Sphere | Persistent lightning zone. | Needs bonus-action lightning bolt attack. |
| Storm of Vengeance | Persistent thunder storm. | Needs escalating round-by-round effects. |
| Sunbeam | Line radiant/blind. | Needs repeated line action while concentrating. |
| Sunburst | Radiant area/blind. | Good slim version; undead/ooze rider not modeled. |
| Swift Quiver | Self ranged attack buff. | Needs two bonus-action weapon attacks. |
| Symbol | Persistent control glyph. | Needs glyph modes and triggered/long-duration trap behavior. |
| Synaptic Static | Psychic area/debuff. | Good slim version; d6 attack/check/concentration subtraction abstracted. |
| Telekinesis | STR save grip. | Needs contested ability checks and object movement. |
| Transmute Rock | Persistent mire. | Needs rock-to-mud/mud-to-rock modes, restraint, terrain alteration. |
| Tsunami | Persistent wave zone. | Needs moving wall, push, height, and round-by-round shrinking. |
| Vitriolic Sphere | Acid area/burn. | Needs delayed second-round acid on failed save. |
| Wall of Fire | Persistent fire zone. | Needs true wall/ring shape and side selection. |
| Wall of Ice | Persistent cold zone. | Needs wall panels, break HP, cold blast on break. |
| Wall of Thorns | Persistent piercing/slow zone. | Needs true wall, movement-through damage, repeated cutting. |
| Watery Sphere | Persistent hold zone. | Needs sphere movement and engulfed creature count. |
| Weird | Persistent psychic/frighten zone. | Needs ongoing fear saves and damage while frightened. |
| Whirlwind | Persistent bludgeoning/trap zone. | Needs moving vortex, restrained/lifted, thrown on exit. |
| Wrath of Nature | Persistent nature damage/debuff. | Needs terrain-specific roots/rocks/trees/grass effects. |

## Official D&D 5e Spells Not Fully Implemented

This section lists official 2014-era spells from the working backlog that are absent, intentionally hidden, or only represented as a placeholder. It also names the system that would make each worthwhile.

### Lighting, Vision, Stealth, and Detection

| Spell | Current State | Why Not Full | System Needed |
|---|---|---|---|
| Dancing Lights | Registered but should remain hidden. | No lighting grid or lure/path marker behavior. | Tile illumination, enemy attention/lures, magical darkness counters. |
| Light | Registered but should remain hidden. | No light radius/darkness penalties. | Lighting, darkvision, object light sources. |
| Daylight | Missing. | No light/darkness suppression model. | Strong magical light, darkness dispel, visibility states. |
| Darkvision | Missing. | No per-creature vision mode. | Vision profiles and light penalties. |
| See Invisibility | Missing. | No robust invisible/hidden detection pipeline. | Hidden/invisible flags, reveal logic, truesight/blindsight. |
| Detect Magic | Missing. | No magical aura/object/trap query system. | Tagged magic objects, traps, effects, reveal overlays. |
| Detect Evil and Good | Missing. | Creature-type and consecration tags are limited. | Creature type sensing, room aura tags. |
| Detect Poison and Disease | Missing. | No poison/disease hazard metadata. | Hazard tags and condition detection. |
| Detect Thoughts | Missing. | No intelligent enemy intent/ambush information model. | Enemy intent hints, stealth ambush reveal. |
| Clairvoyance | Missing. | No remote room sensor system. | Remote reveal camera/scry sensor. |
| Arcane Eye | Missing. | No controllable scout actor. | Scouting entities, fog-of-war exploration. |
| Locate Object / Creature / Animals or Plants | Missing. | No objective/resource locator graph. | Tagged objects/creatures/resources and path hints. |
| Find Traps | Missing. | Trap reveal exists indirectly but no spell scan. | Trap index, detection radius, UI markers. |
| True Seeing | Implemented as buff. | No real truesight categories. | Full vision taxonomy. |

### Object, Trap, Door, Item, and Terrain Utility

| Spell | Current State | Why Not Full | System Needed |
|---|---|---|---|
| Mending | Removed/hidden. | Nothing breaks in a repairable way. | Durability for gear, doors, mechanisms. |
| Alarm | Missing. | No persistent ward trigger system. | Room/tile triggers and alert events. |
| Arcane Lock | Missing. | Door/chest locking by spell not supported. | Lock states, magical locks, break DCs. |
| Knock | Missing. | Lock system exists only partly. | Lock/door/chest action resolver and noise alert. |
| Identify | Missing. | Item properties are already known/simple. | Unidentified items, curses, magic item inspection. |
| Continual Flame | Missing. | No permanent light object. | Light source item creation. |
| Floating Disk | Missing. | Encumbrance/hauling not meaningful. | Encumbrance, haulable loot, pressure plates. |
| Rope Trick | Missing. | No extradimensional short rest pocket. | Safe rest pocket, encounter interruption rules. |
| Tiny Hut | Missing. | No safe campsite/rest interruption model. | Rest safety zones and dungeon time. |
| Glyph of Warding | Missing. | Magical trap authoring is not general. | Player-placed traps, trigger conditions, stored spells. |
| Magic Circle | Missing. | Creature-type warding not modeled. | Creature types, area entry restrictions. |
| Meld into Stone / Stone Shape / Move Earth | Missing. | No mutable wall/stone terrain. | Terrain editing and object material states. |
| Passwall | Missing. | No temporary tunnels/openings. | Wall carving, path graph updates. |
| Wall of Force / Wall of Stone | Missing. | No blocking wall templates. | True wall placement, collision, break HP. |
| Bones of the Earth | Missing. | No pillar/cover creation. | Summoned terrain blocks, elevation, crush logic. |
| Control Water | Missing. | No water volume/flooding. | Water terrain, flooding, currents. |
| Create or Destroy Water | Missing. | No water/fire/steam environmental layer. | Environmental fluid and fire interactions. |
| Fabricate / Creation / Secret Chest / Instant Summons | Missing. | Crafting/storage economy not modeled. | Crafting recipes, inventory binding, extradimensional storage. |

### Summons, Companions, and Created Creatures

| Spell | Current State | Why Not Full | System Needed |
|---|---|---|---|
| Find Familiar | Missing. | No tiny scout/assistant entity. | Summon actors, scouting AI, help action. |
| Unseen Servant | Missing. | No noncombat helper actor. | Helper agents and object interaction queue. |
| Find Steed | Missing. | No mount/companion system. | Mounted movement and companion actors. |
| Healing Spirit | Missing. | No movable healing spirit with capped uses. | Friendly persistent zones with charges. |
| Animate Dead / Create Undead / Danse Macabre | Missing. | No corpse-to-minion pipeline. | Corpses, undead templates, control duration. |
| Conjure Animals / Minor Elementals / Woodland Beings / Elemental / Fey / Celestial | Missing. | General summon AI not present. | Summon templates, initiative, ownership, commands. |
| Animate Objects | Missing. | No animated object actors. | Object actor conversion and swarm handling. |
| Arcane Hand | Missing. | No large controlled hand actor. | Persistent controllable spell entity. |
| Faithful Hound | Missing. | No invisible guard summon. | Stationary guardian actors and trigger attacks. |
| Giant Insect | Missing. | No insect conversion/summon templates. | Creature transformation/summon templates. |
| Infernal Calling / Planar Ally / Planar Binding | Missing. | No negotiated extraplanar allies. | Summon contracts, faction/cost systems. |
| Simulacrum | Missing. | No duplicate companion with limited resources. | Clone actor and resource copy rules. |

### Restoration, Death, Resurrection, and Body Changes

| Spell | Current State | Why Not Full | System Needed |
|---|---|---|---|
| Lesser Restoration | Missing. | Conditions not classified enough. | Removable condition taxonomy. |
| Greater Restoration | Missing. | No exhaustion/curse/petrification/max HP reduction model. | Major condition and penalty cleanup. |
| Remove Curse | Missing. | Curse items/effects not general. | Curse tagging and removal rules. |
| Gentle Repose | Missing. | Corpse decay/resurrection window absent. | Corpse timers and death states. |
| Feign Death | Missing. | No fake-death threat/targeting state. | Untargetable/downed-but-safe state. |
| Revivify / Raise Dead / Reincarnate / Resurrection / True Resurrection | Missing. | Death recovery is not deep enough. | Death timers, corpse requirements, costs, penalties, revive UI. |
| Regenerate | Partial. | Immediate heal only. | Ongoing healing and limb/body injury model. |
| Polymorph / Mass Polymorph / True Polymorph / Shapechange / Animal Shapes | Missing. | Arbitrary form replacement not supported. | Form templates, HP replacement, stat swap, revert logic. |
| Clone | Missing. | Long-term death insurance absent. | Persistent backup bodies and campaign death hooks. |

### Social, Language, Communication, and Narrative Divination

| Spell | Current State | Why Not Full | System Needed |
|---|---|---|---|
| Message / Minor Illusion / Prestidigitation / Thaumaturgy | Mostly omitted or racial-only placeholder. | Social/utility cantrips lack tactical impact. | Object/sound/attention/roleplay interaction layer. |
| Animal Friendship / Speak with Animals / Speak with Plants / Speak with Dead | Missing. | No dialogue/info sources. | Creature/NPC/plant/corpse prompt data. |
| Charm Person / Suggestion / Mass Suggestion / Enthrall / Zone of Truth / Geas / Modify Memory | Mostly missing or racial placeholder. | Social control is not meaningful in combat-only resolver. | Dialogue checks, factions, noncombat encounters. |
| Comprehend Languages / Tongues / Telepathic Bond | Missing. | Language barriers are not modeled. | Language tags and party communication state. |
| Sending / Dream / Contact Other Plane / Commune / Commune with Nature / Divination / Augury / Legend Lore / Find the Path / Scrying | Missing. | No oracle/hint/remote information system. | Dungeon knowledge graph, hint budget, room previews. |
| Illusory Script / Magic Mouth / Programmed Illusion / Project Image / Major Image / Silent Image / Hallucinatory Terrain / Mirage Arcane / Seeming / Mislead | Missing. | Illusions are not modeled beyond simple penalties. | Illusion entities, enemy disbelief, decoy AI, fake terrain. |

### Travel, Planes, Safe Rest, and Campaign-Scale Magic

| Spell | Current State | Why Not Full | System Needed |
|---|---|---|---|
| Water Breathing / Water Walk / Wind Walk / Tree Stride / Transport via Plants | Missing. | Dungeon traversal surfaces are not deep enough. | Terrain movement modes and travel nodes. |
| Teleportation Circle / Teleport / Word of Recall / Plane Shift / Astral Projection / Gate | Missing or deferred. | Long-distance/planar travel needs campaign map semantics. | Travel destinations, failure/mishap, sanctuary nodes, planes. |
| Magnificent Mansion / Demiplane | Missing. | No extradimensional safe room/storage. | Pocket spaces, safe long rest, storage. |
| Sequester | Missing. | No long-term hidden/suspended object state. | Persistent hidden/suspended state. |
| Time Stop | Missing. | Turn engine cannot safely grant isolated multi-turn sequences yet. | Extra-turn stack with targeting restrictions. |
| Wish | Missing. | Requires a high-level miracle/duplicate-spell framework. | Spell duplication, scripted miracles, risk/stress rules. |

## Priority Recommendations

1. Add a real condition engine first. This immediately improves dozens of implemented spells without changing their UI.
2. Add forced movement second. This unlocks faithful versions of Thunderwave, Dissonant Whispers, Thorn Whip, Gust of Wind, Maelstrom, Tsunami, Whirlwind, Telekinesis, and more.
3. Add wall/shape templates and blocking terrain third. This repairs most Wall spells, Blade Barrier, Forcecage, Prismatic Wall, Earthquake, and persistent hazard fidelity.
4. Add summon actors fourth. This unlocks the largest missing family: Find Familiar, Find Steed, Animate Dead, Conjure spells, Arcane Hand, Faithful Hound, Animate Objects, and Simulacrum.
5. Add vision/light/detection fifth. This justifies un-hiding Light and Dancing Lights and makes Darkness, Daylight, True Seeing, See Invisibility, Sunbeam, Sunburst, and Maddening Darkness much better.
6. Add death/restoration/corpse systems sixth. This unlocks Restoration, Revivify, Raise Dead, Resurrection, True Resurrection, Regenerate, Gentle Repose, and many necromancy riders.

## Overall Conclusion

The current spell implementation is playable and broad, but it is intentionally a slim tactical translation rather than a faithful 5e simulator. Damage and simple buffs are usually close. Control, walls, movement, summons, long-duration utility, resurrection, divination, and planar magic are the largest fidelity gaps. The best next work is not adding more spell rows; it is adding the shared systems above so existing spells can become more faithful with less one-off code.
