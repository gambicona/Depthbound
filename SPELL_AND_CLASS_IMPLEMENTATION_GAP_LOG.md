# Spell And Class Implementation Gap Log

Date: 2026-05-14

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
- Reactions now have a separate per-turn `hasReaction` resource.
- Shield, Hellish Rebuke, Uncanny Dodge, Bardic Inspiration dice, and opportunity attacks now use trigger-time reaction prompts when usable.
- Persistent spell-area state now exists for Moonbeam, Spike Growth, Fog Cloud, Silence, Darkness, and Hunger of Hadar.
- Spirit Guardians now has a start-turn aura damage hook tied to the caster.
- Next-hit rider secondary effects now exist for Thunderous Smite, Wrathful Smite, Branding Smite, Ensnaring Strike, and Hail of Thorns.
- Bless, Bane, Aid, and Mass Healing Word now support discrete multi-target click selection.
- Spell IDs are normalized through canonical hyphen IDs when fighter spell state is ensured.
- Fighting Style selection and first-pass effects exist for Archery, Defense, Dueling, and Great Weapon Fighting.
- Paladin Aura of Protection and basic Rogue/Bard expertise hooks exist.

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
- Summons, recurring commands, full pets, advanced resource systems, and deeper per-spell terrain rules still need runtime support.
- Boss/elite resistance exists only in a narrow hard-control downgrade path.
- Spell choice works, but there is no respec/preparation UI beyond initial/level-up choices.

## Global Spell System Gaps

### Spell IDs And Aliases

- The class instruction file uses underscore IDs, while earlier code used hyphen IDs.
- The current implementation keeps old hyphen IDs and registers underscore aliases.
- Fighter spell state now normalizes known spells and class spell lists to canonical hyphen IDs when spell state is ensured.
- Underscore aliases still exist for compatibility with older class data and saves.
- Remaining cleanup: persisted saves should be audited after load/migration so no stale alias IDs remain in stored JSON.

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
  - extra target scaling is implemented for the new discrete multi-target flow on Bless/Bane/Aid/Mass Healing Word, but not every spell with `targetsPerLevel`
  - longer duration is not generally applied
  - larger area works only for `areaRadiusFeetPerLevel`
  - weapon rider flat bonus scaling now applies, but exact tabletop rider scaling is still simplified
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
- Concentration area entities now exist for the first persistent spell-area set, but not every concentration spell creates an area entity.

### Duration Tracking

- Existing status expiration supports start-of-turn and end-of-turn flags.
- `durationRounds` now counts down at the affected creature's turn start.
- This is a workable tactical duration model, but it is still simpler than true round/initiative-source tracking.
- Encounter-duration spells are not formally tracked as encounter duration.

### Multi-Target Selection

- Spell data includes many "+1 target" upcast rules.
- The UI now supports selecting multiple discrete targets for Bless, Bane, Aid, and Mass Healing Word.
- Remaining gap: Shield of Faith, Barkskin, Heroism, Cause Fear, and other `targetsPerLevel` spells still need to be added to the discrete target-count map.
- Multi-target targeting is click-sequential and does not yet show a selected-target checklist.

### Reaction Spells

- Reactions now use a separate `hasReaction` resource that refreshes on the creature's turn.
- Shield can be offered when an incoming attack would hit and the +5 AC can matter.
- Hellish Rebuke can be offered after a hero takes damage, if the hero knows the spell, has SP, has reaction available, and has line of sight/range.
- Uncanny Dodge can be offered to level 5+ Rogues after a hit deals damage.
- Opportunity attacks now ask heroes before consuming their reaction; monsters spend reactions automatically.
- Remaining gap: reaction prompts are implemented for the current core triggers only, not a generic reaction-event registry.

### Weapon Rider Spells

- Weapon rider spells now apply self-statuses that release bonus damage on the next successful weapon hit and then consume themselves.
- The pipeline now also applies secondary effects for the first rider set:
  - Thunderous Smite can knock prone on a failed STR save
  - Wrathful Smite can frighten on a failed WIS save
  - Branding Smite applies a branded/revealed-style status
  - Ensnaring Strike can restrain on a failed STR save
  - Hail of Thorns splashes nearby enemies on a ranged hit
- Remaining gap: push distance, exact damage dice ownership, and more exact tabletop save/retry details are simplified.
- Divine Favor persists as a flat weapon damage bonus rather than a typed per-hit radiant die.

### Persistent Ground Hazards

- Ground-targeted hazard spells can preview and apply initial effects to creatures in the area.
- Persistent area entities now exist for Moonbeam, Spike Growth, Fog Cloud, Silence, Darkness, and Hunger of Hadar.
- Persistent areas are displayed as battlefield highlights and apply start-turn effects/status where supported.
- Missing or partial enter/start/end triggers for:
  - Entangle
  - Web
  - Cordon of Arrows
  - Call Lightning
- Spike Growth does not yet deal per-tile movement damage.
- Fog Cloud/Darkness/Silence persist, but line-of-sight, spellcasting prevention, and Devil's Sight style integrations are still simplified.

### Auras

- Spirit Guardians is represented as a caster status with a start-turn aura damage hook.
- The aura follows the caster for damage checks.
- Aura preview/display after casting is not implemented.
- Enter-aura triggers and exact movement-speed penalties are not fully implemented.

### Recurring Command Spells

- Spiritual Weapon, Call Lightning, Vampiric Touch, and similar "use again each round" spells are simplified.
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
- The game does not enforce tabletop-style â€œone leveled spell per turnâ€ limits.

### Guiding Bolt

- Spell attack and radiant damage work.
- Exposed is represented as a status, but â€œnext attack consumes Exposedâ€ is not implemented.
- Exposed currently behaves as a simple status modifier.

### Bless

- Status data exists.
- True +1d4 is simplified to a flat bonus.
- Multi-target selection is implemented for the base/upcast target count.
- Round duration uses the simplified turn-start countdown model.

### Bane

- Save and status data exist.
- True -1d4 is simplified to a flat penalty.
- Multi-target selection is implemented for the base/upcast target count.
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
- Start-turn aura damage now exists and follows the caster.
- No aura visual after casting.
- Enter-aura damage and exact slow behavior are not implemented.

### Mass Healing Word

- Uses discrete multi-target selection for up to 6 selected allies.
- Healing still uses the simplified spell-point/spell-dice model.

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

- Applies immediate area damage and creates a persistent beam zone.
- Start-turn damage exists while the zone persists.
- No command to move the beam.

### Spike Growth

- Simplified as initial damage/status.
- No movement-through damage per tile.
- Persistent area state exists, but difficult terrain/movement-through damage is not exact yet.

### Call Lightning

- Simplified as immediate area damage.
- No sustained cloud.
- No recurring lightning command.

### Magic Missile

- Auto-hit is stored in data but not fully special-cased.
- Current damage resolution still follows the general damage path and does not split darts between targets.
- No projectile assignment UI.

### Shield

- True reaction timing exists for incoming attacks when +5 AC can change the result.
- Casts from a bottom-right reaction prompt and consumes reaction/SP.
- Remaining gap: it is hard-wired into attack resolution rather than a generic reaction event.

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
- Thunderous Smite, Wrathful Smite, Branding Smite, Ensnaring Strike, and Hail of Thorns now apply first-pass secondary effects.
- Remaining gap: exact tabletop push distance, retry timing, and per-rider edge cases are simplified.

### Fog Cloud, Silence, Darkness

- Area-control data exists.
- Persistent area entities now exist.
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
- Hellish Rebuke is now a damage-triggered reaction with SP/reaction/range/line-of-sight checks.
- Cause Fear uses basic Frightened status.
- Hunger of Hadar now creates a persistent zone, but exact darkness/blindness and movement rules are simplified.
- Vampiric Touch is a one-off attack/status, not a sustained repeatable melee spell that heals for half damage.

## Global Class System Gaps

### All Classes

- All 12 classes have data entries.
- Most level progression is represented as feature names rather than complete mechanics.
- Starter gear choice groups exist for all 12 classes, using base items rather than magic variants.
- Armor proficiency blocks equipping armor; weapon proficiency affects attack bonus and is surfaced in inventory text.
- Extra Attack now works for the main martial classes, but it is still hard-coded by class/level rather than driven directly by structured class feature data.
- Subclasses are not implemented.
- Feats are not implemented.
- Many high-level features are placeholders only.

### Character Creation

- All 12 classes can be selected.
- Class-specific predefined ability arrays are wired.
- Starter gear choices are implemented for all 12 classes using base equipment pools.
- Packs/tools/foci/instruments are intentionally omitted.
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
- Rage, Bardic Inspiration, Channel Divinity, Wild Shape, Lay on Hands, Divine Smite, Empowered Spell, Ranger Companion, Eldritch Master, and Arcane Recovery now have ability hooks.
- Ki, Metamagic, Bardic Inspiration, Wild Shape, Lay on Hands, and Arcane Recovery now use more exact `abilityUses` pool sizing.
- Remaining gap: resources still share the generic `abilityUses` storage rather than dedicated named pool objects, and ally-target Lay on Hands spending is not implemented.

### Action Economy

- Action and bonus-action consumption exists.
- True reaction consumption exists for the current Shield/Hellish Rebuke/Uncanny Dodge/Bardic Inspiration/opportunity-attack hooks.
- Extra Attack now exists as a proper repeated weapon attack flow for Barbarian, Fighter, Monk, Paladin, and Ranger.
- Pet commands and recurring spell commands do not have a consistent action model yet.

## Class-Specific Gaps

### Barbarian

Implemented:

- Class data exists.
- Rage and Reckless Attack ability entries exist.
- Rage applies a simple damage bonus status, physical weapon damage resistance, and a timed duration.
- Rage cannot be entered while wearing heavy armor and ends after fights/short rests.
- Unarmored Defense is implemented.
- Reckless Attack applies a simple attack bonus / AC penalty status.
- Extra Attack is available from level 5.

Missing or simplified:

- Rage ending rules are simplified and do not check whether the Barbarian attacked or took damage.
- Danger Sense is not implemented.
- Fast Movement is only a feature name, not automatic movement scaling.
- Brutal Critical is not implemented.
- Relentless Rage is not implemented.
- Persistent Rage / Indomitable Might / Primal Champion are not implemented.

### Bard

Implemented:

- Class data and spell list exist.
- Full-caster spell-choice progression applies.
- Bardic Inspiration targets other heroes and grants a scaling die that can be spent on missed attacks or failed saves.

Missing or simplified:

- Jack of All Trades, Song of Rest, Countercharm, Magical Secrets, and Superior Inspiration are not implemented.
- Expertise has a basic hook for existing skill checks, but no player-facing expertise choice UI.
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
- Nature terrain identity now has a first persistent area framework for key spells, but exact difficult terrain/movement-through effects remain simplified.
- Beast forms, form HP, form attacks, and form duration are not implemented.

### Fighter

Implemented:

- Existing Fighter class remains.
- Second Wind and Action Surge work.
- Fighter ASI extra levels are wired.
- Fighter Extra Attack is available at levels 5, 11, and 20.
- Fighting Style choice and effects exist for the supported styles.

Missing or simplified:

- Indomitable is not implemented.
- Subclass/maneuver compensation is not implemented.

### Monk

Implemented:

- Class data exists.
- Some Ki-like ability entries exist.
- Flurry/Patient Defense entries are present.
- Ki uses now scale from Monk level through the generic ability-use pool.
- Unarmored Defense is implemented.

Missing or simplified:

- Ki is not a dedicated named resource object; it is represented through `abilityUses`.
- Martial Arts bonus attack is not implemented.
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
- Divine Smite spends spell points and scales its next-hit radiant rider.
- Extra Attack is available from level 5.
- Fighting Style choice/effects and Aura of Protection are implemented.

Missing or simplified:

- Lay on Hands uses a level-sized healing pool but still only targets self.
- Divine Health is not relevant/implemented.
- Aura of Courage/Improvements are not implemented.
- Improved Divine Smite and Cleansing Touch are not implemented.
- Spell riders have next-hit behavior and first-pass secondary effects, but exact tabletop details remain simplified.

### Ranger

Implemented:

- Class data and spell list exist.
- Half-caster spell-choice progression starts at level 1.
- Level-1 Ranger has 2 SP.
- Ranger Companion has a basic companion strike ability hook.
- Extra Attack is available from level 5.
- Fighting Style choice/effects are implemented.

Missing or simplified:

- Favored Enemy/Favored Foe is not implemented.
- Natural Explorer is intentionally omitted.
- Ranger Companion is not a persistent pet with board presence, HP, targeting, or independent action economy.
- Land's Stride, Hide in Plain Sight, Vanish, Feral Senses, Foe Slayer are not implemented.
- Trap/hazard identity has first persistent spell-area support, but per-tile movement damage and full pet/hazard action economy are not implemented.

### Rogue

Implemented:

- Class data exists.
- Rogue ASI levels are wired.
- Cunning Action Dash and Uncanny Dodge-like entries exist.
- Sneak Attack can apply once per turn with a finesse/ranged weapon when an ally is adjacent to the target.
- Steady Aim can grant advantage and enable Sneak Attack.
- Uncanny Dodge is a reaction that halves incoming attack damage.
- Expertise has a basic hook for existing checks.

Missing or simplified:

- Sneak Attack does not yet support the full advantage/disadvantage rules or every ranged/finesse edge case.
- Cunning Action Hide/Disengage is not fully implemented.
- Expertise selection UI is not implemented.
- Evasion is not implemented.
- Reliable Talent, Blindsense, Slippery Mind, Elusive, Stroke of Luck are not implemented.

### Sorcerer

Implemented:

- Class data and spell list exist.
- Full-caster spell-choice progression applies.
- Empowered Spell has a basic metamagic-style ability hook.

Missing or simplified:

- Metamagic uses now scale from Sorcerer level through the generic ability-use pool, but are not a dedicated named resource object.
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
- Eldritch Blast is implemented as a scalable multi-beam spell attack with sequential target clicks and line-of-sight checks.

Missing or simplified:

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
- Arcane Recovery uses a once-per-long-rest pool hook.

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
- Spell IDs now normalize to canonical hyphen IDs during spell-state ensure; older save migration still needs audit coverage.
- Existing saves made during earlier spell/class work may contain full spell lists instead of chosen spells; migration may be needed.
- Level-up HP now uses each class's hit die average, but there is no roll/average choice or class progression preview.
- The ability menu is now doing a lot: class abilities, spell choices, upcast buttons. It may need a more organized spell/ability UI.
- Reaction timing exists for Shield, Hellish Rebuke, Uncanny Dodge, Bardic Inspiration dice, and opportunity attacks; a generic reaction-event registry is still future work.

## Suggested Next Implementation Order

1. Turn Ranger Companion and summon spells into persistent actors with pet command action economy.
2. Finish persistent terrain rules: enter/leave triggers, per-tile Spike Growth damage, Silence spellcasting prevention, Darkness/Fog line-of-sight integration, and movable Moonbeam/Call Lightning commands.
3. Expand the reaction system into a generic reaction-event registry so future reactions do not need bespoke attack-flow hooks.
4. Convert generic `abilityUses` resource pools into named resource objects with exact spend amounts, partial spending, and clearer UI.
5. Add ally targeting and partial point spending for Lay on Hands.
6. Finish Shield of Faith, Barkskin, Heroism, Cause Fear, and similar multi-target/upcast targeting.
7. Add richer Sneak Attack eligibility, Evasion, Indomitable, Danger Sense, and other missing class defenses.
8. Add Fighting Style coverage for any missing styles, full expertise selection UI, and subclass compensation features.
9. Add recurring command spells for Spiritual Weapon, Call Lightning, Vampiric Touch, Cordon of Arrows, and similar spells.
10. Audit old save migration for canonical spell IDs and pre-choice full spell-list saves.
