# Spell And Class Implementation Gap Log

Date: 2026-05-13

This log documents what is not really implemented yet for the slim spell system and the 12-class implementation pass. The current code now has broad data coverage and basic hooks, but many class and spell mechanics are still simplified, placeholder, or data-only.

## Update After Latest Implementation Pass

Newly implemented or improved:

- Status effects with `durationRounds` now tick down at the affected creature's turn start.
- Concentration can now break when the caster takes damage and fails a CON save.
- Barbarian Rage now gives physical weapon damage resistance and a timed damage bonus.
- Martial Extra Attack is now wired into the attack action for Barbarian, Fighter, Monk, Paladin, and Ranger.
- Rogue Sneak Attack can now apply once per turn with a finesse/ranged weapon when an ally is adjacent to the target.
- Weapon rider statuses now release bonus damage on the next successful weapon hit and are consumed.
- Level-up HP gain now uses each class's hit die instead of one flat Fighter-style value.
- Class-resource hooks now exist for Bardic Inspiration, Channel Divinity, Wild Shape, Lay on Hands, Divine Smite, Ranger Companion, Empowered Spell, Arcane Recovery, and Eldritch Master.

## Summary

Implemented at a high level:

- All 12 base classes are selectable through class data.
- Caster classes have curated 10-spell slim spell lists.
- New spell-choice progression exists for full casters, half casters, and Warlock pact casting.
- Spell points, basic upcasting, basic concentration replacement, basic spell targeting, and basic status application exist.
- Many combat-relevant spell and class entries are represented as data.

Not fully implemented yet:

- Many class features are only names/data entries, not full mechanics.
- Many spell templates are simplified into existing damage/heal/status flows.
- Persistent hazards, auras, summons, recurring commands, true reactions, full pets, and advanced resource systems need real runtime support.
- Boss/elite resistance exists only in a narrow hard-control downgrade path.
- Spell choice works, but there is no respec/preparation UI beyond initial/level-up choices.

## Global Spell System Gaps

### Spell IDs And Aliases

- The class instruction file uses underscore IDs, while earlier code used hyphen IDs.
- The current implementation keeps old hyphen IDs and registers underscore aliases.
- This works, but the spell registry now contains duplicate definitions for many shared spells.
- Future cleanup should choose one canonical ID style internally and migrate old saves safely.

### Spell Choice Model

- Characters now choose spells instead of automatically receiving the full list.
- The system supports level 1 and level-up spell selection.
- There is no spell retraining or respec flow.
- There is no daily preparation system.
- There is no UI to inspect unchosen class spells outside the choice dialogs.
- If a player cancels spell choice, unused credits are stored, but there is no dedicated later UI to spend those credits except future level-up flow.

### Upcasting

- Upcasting supports basic dice scaling and cost scaling.
- Upcasting does not yet support every listed custom scaling rule:
  - extra targets are stored in data but not implemented as multi-target selection
  - longer duration is not generally applied
  - larger area works only for `areaRadiusFeetPerLevel`
  - weapon rider scaling is mostly data-only
  - temp HP scaling is mostly data-only except simple temp healing behavior
- Higher-level spell point costs exist, but the slim spell list mostly uses spell levels 1-3.

### Concentration

- Casting a new concentration spell ends the previous one.
- Concentration can end when a defeated character starts a turn at 0 HP.
- Taking damage now triggers a concentration CON save against DC 10 or half damage, whichever is higher.
- Concentration does not yet end when:
  - the caster becomes stunned/incapacitated outside the current narrow cases
  - combat ends, except indirectly through state refresh/rest paths
- Concentration status cleanup is basic and tied to status effects with a concentration ID.
- Concentration area entities do not exist yet.

### Duration Tracking

- Existing status expiration supports start-of-turn and end-of-turn flags.
- `durationRounds` now counts down at the affected creature's turn start.
- This is a workable tactical duration model, but it is still simpler than true round/initiative-source tracking.
- Encounter-duration spells are not formally tracked as encounter duration.

### Multi-Target Selection

- Spell data includes many “+1 target” upcast rules.
- The UI currently does not support selecting multiple discrete targets for a spell.
- Multi-target heals/buffs/debuffs are approximated only when an area target is used.
- Bless, Bane, Shield of Faith, Barkskin, Heroism, Aid, Cause Fear, and similar spells need real multi-target selection.

### Reaction Spells

- Reaction spells are currently treated more like quick/bonus-action castable abilities.
- There is no true trigger timing for:
  - Shield when an attack would hit
  - Hellish Rebuke when the caster takes damage
  - Uncanny Dodge-like reactions
- There is no per-round reaction resource separate from action/bonus action.

### Weapon Rider Spells

- Weapon rider spells now apply self-statuses that release bonus damage on the next successful weapon hit and then consume themselves.
- The pipeline is still simplified and mostly handles damage, not every rider's unique secondary rule.
- Missing rider-specific behavior includes:
  - Thunderous Smite push/prone effect
  - Wrathful Smite fear on hit
  - Branding Smite reveal on hit
  - Ensnaring Strike restrain on hit
  - Hail of Thorns area burst
- Divine Favor persists as a flat weapon damage bonus rather than a typed per-hit radiant die.

### Persistent Ground Hazards

- Ground-targeted hazard spells can preview and apply initial effects to creatures in the area.
- They do not create persistent area entities yet.
- Missing enter/start/end triggers for:
  - Entangle
  - Web
  - Spike Growth
  - Fog Cloud
  - Silence
  - Darkness
  - Hunger of Hadar
  - Cordon of Arrows
  - Moonbeam
  - Call Lightning
- There is no area object displayed or stored in state for these spells.

### Auras

- Spirit Guardians is represented mostly as a caster status.
- It does not yet create an aura that follows the caster and damages/slows enemies when they enter/start inside.
- Aura preview/display after casting is not implemented.

### Recurring Command Spells

- Spiritual Weapon, Call Lightning, Vampiric Touch, and similar “use again each round” spells are simplified.
- There is no active spell entity with a command button each turn.
- Spiritual Weapon is currently closer to a one-off spell attack than a recurring summoned weapon.

### Summons And Pets

- No generic summon/companion spell framework exists.
- Summoned recurring attack behavior is not implemented.
- Pet action economy is not implemented.

### Friendly Fire And Target Filtering

- Area damage is filtered to hostile targets for player casting.
- There is no full friendly-fire option or per-spell ally/enemy targeting rule layer.
- Enemy spellcasting AI does not use the same spell system yet.

### Spell Visuals And Audio

- Class-specific spell visuals are not implemented.
- Spell animations are not implemented beyond existing grid highlights/logs.
- No class-specific audio cues are wired.

### Spell AI

- Spells have `aiCategory` data.
- Enemy/companion AI does not yet use these categories to choose spells.
- AI does not evaluate healing, AoE clustering, concentration replacement, hazard placement, or anti-caster tactics.

## Spell-Specific Gaps

### Cure Wounds

- Basic healing works.
- Upcast extra dice work.
- Adjacency/touch targeting relies on range and current targeting checks, but self-target convenience is limited.

### Healing Word

- Basic ranged healing works.
- It uses bonus-action style resource.
- The game does not enforce tabletop-style “one leveled spell per turn” limits.

### Guiding Bolt

- Spell attack and radiant damage work.
- Exposed is represented as a status, but “next attack consumes Exposed” is not implemented.
- Exposed currently behaves as a simple status modifier.

### Bless

- Status data exists.
- True +1d4 is simplified to a flat bonus.
- Multi-target selection is not implemented.
- Round duration uses the simplified turn-start countdown model.

### Bane

- Save and status data exist.
- True -1d4 is simplified to a flat penalty.
- Multi-target selection is not implemented.
- Round duration uses the simplified turn-start countdown model.

### Shield Of Faith

- AC bonus status exists.
- Multi-target upcast is not implemented.
- Round duration uses the simplified turn-start countdown model.

### Spiritual Weapon

- Implemented only as a simplified spell attack/damage entry.
- No summoned weapon entity.
- No recurring bonus attack each round.
- No movement/repositioning of the weapon.

### Hold Person

- WIS save and Held-like status exist.
- Humanoid/living type filtering is not implemented.
- Boss protection is only a simple hard-control downgrade.
- Sustained concentration duration is simplified.

### Spirit Guardians

- Data/status exists.
- No actual moving aura damage/slow trigger.
- No aura visual after casting.
- No start-turn/enter-aura damage.

### Mass Healing Word

- Represented as area healing.
- Does not implement “up to 6 selected allies.”
- Target selection is area-based, not chosen-target based.

### Entangle

- Initial area status works in simplified form.
- No persistent difficult terrain.
- No repeated terrain effect.
- Area upcast works only through radius metadata.

### Faerie Fire

- Initial area save/status exists.
- Revealed/Exposed are simplified statuses.
- No stealth/invisibility system integration.

### Thunderwave

- Cone damage exists.
- Push on failed save is stored in data but not implemented for spell damage.

### Barkskin

- Simplified as AC bonus.
- No defensive floor rule.
- Multi-target upcast not implemented.

### Heat Metal

- Simplified as immediate damage/status.
- Does not check whether target has metal armor or weapon.
- No recurring damage each round.

### Moonbeam

- Simplified as immediate area damage.
- No persistent beam zone.
- No command to move the beam.

### Spike Growth

- Simplified as initial damage/status.
- No movement-through damage per tile.
- No persistent difficult terrain.

### Call Lightning

- Simplified as immediate area damage.
- No sustained cloud.
- No recurring lightning command.

### Magic Missile

- Auto-hit is stored in data but not fully special-cased.
- Current damage resolution still follows the general damage path and does not split darts between targets.
- No projectile assignment UI.

### Shield

- No true reaction timing.
- Currently behaves as a self defensive cast/status.
- Does not interrupt or modify an incoming attack roll after seeing the result.

### Burning Hands

- Cone damage/save works at a basic level.
- No special fire visual.

### Scorching Ray

- Simplified as one spell attack/damage packet.
- No separate rays.
- No split targeting.
- No separate attack rolls per ray.

### Misty Step

- Teleport targeting works in a basic form.
- Destination validation is basic.
- Does not handle edge cases like enemy zones, special terrain, or teleport blockers.

### Shatter

- Basic area damage/save exists.
- No object/environment interaction.

### Web

- Initial area restrain status exists.
- No persistent web area.
- No burnable web behavior.

### Lightning Bolt

- Direction/line area exists through the line template.
- Width/line edge behavior is approximate.

### Grease

- Initial area prone/slow status exists.
- No persistent slippery terrain.
- No repeated saves for entering/moving through area.

### Haste

- Simplified as AC/speed/attack bonus status.
- Does not grant a controlled extra limited action.
- No lethargy drawback when it ends.

### Sleep

- WIS save approximation exists.
- Does not use HP pool targeting.
- Does not wake on damage unless another system removes status.

### Mage Armor

- Simplified as +3 AC status.
- Does not check whether target is wearing armor.

### Mirror Image

- Simplified as +3 AC.
- No image count.
- No attacks randomly consuming images.

### Dissonant Whispers

- Damage and Frightened-style status exist.
- No forced movement away from caster.

### Heroism

- Simplified status/temporary HP behavior.
- Does not refresh temp HP each turn.
- Fear immunity is not implemented.

### Hypnotic Pattern

- Initial area control exists.
- Damage-breaking the effect is not implemented.
- Boss downgrade is basic.

### Paladin And Ranger Rider Spells

- Divine Favor, Thunderous Smite, Wrathful Smite, Branding Smite, Ensnaring Strike, and Hail of Thorns are simplified self-statuses.
- Next-hit consumption now exists for weapon rider statuses.
- They still need rider-specific secondary effects such as push, fear, reveal, restrain, or area burst behavior.

### Fog Cloud, Silence, Darkness

- Area-control data exists.
- No persistent areas.
- No line-of-sight or ranged attack path penalty integration.
- Silence does not actually prevent spellcasting yet.
- Darkness does not integrate with Devil's Sight.

### Cordon Of Arrows

- Simplified as initial area damage.
- No trap zone entity.
- No limited trigger count.

### Warlock Spells

- Armor of Agathys has temp HP data but no retaliation damage.
- Arms of Hadar has damage/status but no specific reaction-lock mechanics beyond status label.
- Hex is a mark/debuff only; extra damage on caster hits is not implemented.
- Hellish Rebuke is not a true damage-triggered reaction.
- Cause Fear uses basic Frightened status.
- Hunger of Hadar is immediate area damage/status, not a persistent zone.
- Vampiric Touch is a one-off attack/status, not a sustained repeatable melee spell that heals for half damage.

## Global Class System Gaps

### All Classes

- All 12 classes have data entries.
- Most level progression is represented as feature names rather than complete mechanics.
- Starter gear is mostly fixed curated defaults, not full choice-group UI.
- Proficiency data is not fully enforced beyond equipment usability already present in the engine.
- Extra Attack now works for the main martial classes, but it is still hard-coded by class/level rather than driven directly by structured class feature data.
- Subclasses are not implemented.
- Feats are not implemented.
- Many high-level features are placeholders only.

### Character Creation

- All 12 classes can be selected.
- Class-specific predefined ability arrays are wired.
- Starter gear choices are still simplified:
  - many classes use fixed gear
  - generic category choices like “any martial weapon” are not implemented for every class
  - packs/tools/foci/instruments are intentionally omitted
- Spell choice UI exists through simple choice dialogs.
- There is no class feature preview panel showing full level progression before choosing a class.

### Leveling

- Level-up increases HP and supports class-specific ASI levels.
- Level-up grants spell-choice events for relevant casters.
- Level-up feature text comes from class data.
- Most class feature effects are not automatically granted beyond available `abilities` entries and a few generic hooks.
- Class-specific HP gain now uses each class's hit die average plus CON modifier.
- Remaining HP gap: there is still no roll-vs-average choice or preview of exact class HP progression.

### Resources

- Existing `abilityUses` can represent class resources.
- Turn, short-rest, and long-rest distinctions are partial.
- Long-rest recovery for custom resources depends on existing full rest preparation paths.
- Rage, Bardic Inspiration, Channel Divinity, Wild Shape, Lay on Hands, Divine Smite, Empowered Spell, Ranger Companion, Eldritch Master, and Arcane Recovery now have basic ability hooks.
- Ki, Metamagic Points, Invocations, and most class resources are still not modeled as separate tabletop-style resource pools.

### Action Economy

- Action and bonus-action consumption exists.
- True reactions do not exist.
- Extra Attack now exists as a proper repeated weapon attack flow for Barbarian, Fighter, Monk, Paladin, and Ranger.
- Pet commands and recurring spell commands do not have a consistent action model yet.
- Pet commands and recurring spell commands do not have a consistent action model yet.

## Class-Specific Gaps

### Barbarian

Implemented:

- Class data exists.
- Rage and Reckless Attack ability entries exist.
- Rage applies a simple damage bonus status, physical weapon damage resistance, and a timed duration.
- Reckless Attack applies a simple attack bonus / AC penalty status.
- Extra Attack is available from level 5.

Missing or simplified:

- Rage ending rules are simplified and do not check whether the Barbarian attacked or took damage.
- Unarmored Defense is not implemented.
- Danger Sense is not implemented.
- Fast Movement is only a feature name, not automatic movement scaling.
- Brutal Critical is not implemented.
- Relentless Rage is not implemented.
- Persistent Rage / Indomitable Might / Primal Champion are not implemented.

### Bard

Implemented:

- Class data and spell list exist.
- Full-caster spell-choice progression applies.
- Bardic Inspiration has a basic support ability hook that gives a flat attack/save bonus status.

Missing or simplified:

- Bardic Inspiration dice, scaling, target choice, and ally reaction usage are not implemented.
- Jack of All Trades, Expertise, Song of Rest, Countercharm, Magical Secrets, and Superior Inspiration are not implemented.
- Bard has no separate support feature UI beyond spells.

### Cleric

Implemented:

- Class data and spell list exist.
- Full-caster spell-choice progression applies.
- Basic spellcasting works.
- Channel Divinity has a basic radiant burst ability hook.

Missing or simplified:

- Channel Divinity is simplified and does not yet model Turn Undead or domain options.
- Turn Undead is not implemented.
- Divine Intervention is not implemented.
- Blessed Strike baseline compensation is not implemented.
- Domain/subclass features are intentionally absent.

### Druid

Implemented:

- Class data and spell list exist.
- Full-caster spell-choice progression applies.
- Wild Shape has a basic combat-form ability hook with temporary durability and bonus damage.

Missing or simplified:

- Wild Shape is simplified and does not transform into chosen beast forms.
- Combat Wild Shape compensation is only approximated by the basic form hook.
- Nature terrain identity depends on spells, but persistent terrain is not yet real.
- Beast forms, form HP, form attacks, and form duration are not implemented.

### Fighter

Implemented:

- Existing Fighter class remains.
- Second Wind and Action Surge work.
- Fighter ASI extra levels are wired.
- Fighter Extra Attack is available at levels 5, 11, and 20.

Missing or simplified:

- Indomitable is not implemented.
- Fighting Style is not implemented.
- Subclass/maneuver compensation is not implemented.

### Monk

Implemented:

- Class data exists.
- Some Ki-like ability entries exist.
- Flurry/Patient Defense entries are present.

Missing or simplified:

- Ki is not a separate resource pool.
- Martial Arts bonus attack is not implemented.
- Unarmored Defense is not implemented.
- Unarmored Movement scaling is not implemented.
- Step of the Wind is not implemented.
- Stunning Strike is not implemented.
- Deflect Missiles, Slow Fall, Evasion, Stillness of Mind, Diamond Soul, Empty Body, Perfect Self are not implemented.

### Paladin

Implemented:

- Class data and spell list exist.
- Half-caster spell-choice progression starts at level 1.
- Level-1 Paladin has 2 SP.
- Lay on Hands has a basic self-heal ability hook.
- Divine Smite has a basic next-hit radiant weapon rider hook.
- Extra Attack is available from level 5.

Missing or simplified:

- Lay on Hands does not use a spendable healing pool or support ally targeting yet.
- Divine Smite does not spend spell slots/SP dynamically or scale by spell level yet.
- Fighting Style is not implemented.
- Divine Health is not relevant/implemented.
- Aura of Protection/Courage/Improvements are not implemented.
- Improved Divine Smite and Cleansing Touch are not implemented.
- Spell riders need real next-hit behavior.

### Ranger

Implemented:

- Class data and spell list exist.
- Half-caster spell-choice progression starts at level 1.
- Level-1 Ranger has 2 SP.
- Ranger Companion has a basic companion strike ability hook.
- Extra Attack is available from level 5.

Missing or simplified:

- Favored Enemy/Favored Foe is not implemented.
- Natural Explorer is intentionally omitted.
- Fighting Style is not implemented.
- Ranger Companion is not a persistent pet with board presence, HP, targeting, or independent action economy.
- Land's Stride, Hide in Plain Sight, Vanish, Feral Senses, Foe Slayer are not implemented.
- Trap/hazard identity depends on spells, but persistent hazard entities are not real yet.

### Rogue

Implemented:

- Class data exists.
- Rogue ASI levels are wired.
- Cunning Action Dash and Uncanny Dodge-like entries exist.
- Sneak Attack can apply once per turn with a finesse/ranged weapon when an ally is adjacent to the target.

Missing or simplified:

- Sneak Attack does not yet support the full advantage/disadvantage rules or every ranged/finesse edge case.
- Cunning Action Hide/Disengage is not fully implemented.
- Expertise is not relevant/implemented.
- Uncanny Dodge is simplified as Dodge, not true reaction half damage.
- Evasion is not implemented.
- Reliable Talent, Blindsense, Slippery Mind, Elusive, Stroke of Luck are not implemented.

### Sorcerer

Implemented:

- Class data and spell list exist.
- Full-caster spell-choice progression applies.
- Empowered Spell has a basic metamagic-style ability hook.

Missing or simplified:

- Sorcery/Metamagic points are not implemented as a separate resource pool.
- Full Metamagic option selection is not implemented.
- Font of Magic conversion is not implemented.
- Sorcerous Restoration is not implemented.
- No origin/subclass features are implemented.

### Warlock

Implemented:

- Class data exists.
- Pact spell point table exists.
- Pact spell list exists.
- Pact SP refreshes on short rest.
- Eldritch Blast and Eldritch Master ability entries exist.

Missing or simplified:

- Eldritch Blast is only an ability entry, not a real scalable multi-beam spell attack.
- Invocations are not implemented.
- Pact Boon is not implemented.
- Mystic Arcanum is not implemented.
- Eldritch Master is simplified as full pact SP restore.
- Warlock spells are mostly simplified through generic spell templates.

### Wizard

Implemented:

- Class data and spell list exist.
- Full-caster spell-choice progression applies.
- Arcane Recovery has a basic spell-point restoration ability hook.

Missing or simplified:

- Spellbook is simplified into chosen spells.
- Arcane Recovery does not yet follow exact short-rest level-budget rules.
- Spell Mastery is not implemented.
- Signature Spells are not implemented.
- Arcane Tradition/subclass features are intentionally absent.

## Important Technical Debt

- `durationRounds` now has a basic turn-start countdown, but source-relative duration ownership is still simplified.
- Status effect types should be normalized into shared definitions.
- Class features should move toward structured reusable effect templates.
- Spell and class IDs should be migrated to one canonical style.
- Existing saves made during earlier spell/class work may contain full spell lists instead of chosen spells; migration may be needed.
- Level-up HP now uses each class's hit die average, but there is no roll/average choice or class progression preview.
- The ability menu is now doing a lot: class abilities, spell choices, upcast buttons. It may need a more organized spell/ability UI.
- The combat engine needs true reaction timing before Shield, Hellish Rebuke, and Uncanny Dodge can be considered implemented.

## Suggested Next Implementation Order

1. Add true reaction resource/timing for Shield, Hellish Rebuke, Uncanny Dodge, and similar effects.
2. Add persistent area entities for hazards, fog/darkness/silence, Moonbeam, and Spirit Guardians.
3. Expand the next-hit weapon rider pipeline with each rider's secondary effects.
4. Add Warlock Eldritch Blast as a real scalable multi-beam attack.
5. Turn Ranger Companion and summon spells into persistent actors with pet command action economy.
6. Convert Ki, Metamagic Points, Bardic Inspiration, Channel Divinity, Wild Shape, Lay on Hands, and Arcane Recovery into exact class resource systems.
7. Add richer Sneak Attack eligibility, Bardic Inspiration reaction dice, exact Divine Smite spending/scaling, and Rage ending rules.
8. Add Fighting Style, Unarmored Defense, aura, expertise, and subclass compensation features.
9. Add multi-target spell selection for Bless, Bane, Mass Healing Word, Aid, and similar spells.
10. Clean up spell ID aliases into one canonical ID style with save migration.

