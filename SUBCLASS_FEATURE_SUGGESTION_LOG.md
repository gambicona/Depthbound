# Subclass Feature Suggestion Log

## 1. Summary

This log proposes a unified subclass progression for the dungeon crawler:

- Level 3: subclass identity and core loop.
- Level 6: reliable tactical tool, defense, or resource upgrade.
- Level 10: deeper loop, stronger passive, or improved resource economy.
- Level 14: powerful class-defining feature.
- Level 18: capstone-style upgrade that feels exciting without replacing the base class.

This differs from tabletop D&D 5e 2014 because each class normally uses its own subclass schedule. Fighters use 3/7/10/15/18, rogues use 3/9/13/17, clerics choose at 1, druids choose at 2, and so on. The unified schedule makes every class easier to plan, easier to compare, and easier to explain in the level-up UI.

Balance implication: level 3 must carry the subclass fantasy, but not overfill the action bar. Level 6 and 10 should usually be incremental. Level 14 can be the “this subclass has arrived” tier. Level 18 should be a strong upgrade, preferably resource-limited, once-per-combat, or passive in a narrow role rather than a permanent all-purpose damage spike.

The recommendation is to adapt tabletop fantasy, not duplicate tabletop rules. Social, travel, downtime, and open-ended features should become dungeon/combat equivalents.

## 2. Current System Analysis

### How classes currently work

Classes are content registry entries under `src/scripts/content/classes`. Each class defines base stats, proficiencies, spell lists, cantrip lists, spell point progression, class features, abilities, starting gear, and sometimes subclass definitions.

Current full player classes exist for all 12 standard 2014 classes:

- Barbarian
- Bard
- Cleric
- Druid
- Fighter
- Monk
- Paladin
- Ranger
- Rogue
- Sorcerer
- Warlock
- Wizard

Artificer appears only in spell availability data and should not be included in subclass design.

Fighter and Barbarian currently have implemented subclass arrays. Other classes mostly have base class mechanics only.

### How level-up progression currently works

Level-up is handled as a staged transaction. The hero gains level, HP, features, subclass choices, ASI, spells, expertise, and class-specific level choices, then a summary dialog appears. Recent changes make cancellation restore the hero to the pre-level-up state.

Current systems already support:

- ASI levels by class.
- Spell and cantrip choices.
- Expertise choices.
- Subclass selection at level 3 for Fighter and Barbarian.
- Subclass option choices such as maneuvers, Arcane Shots, runes, storm auras, and totems.
- Full, half, pact, third-caster, and sidekick spell point progressions.

### How combat and feature mechanics are represented

Combat features are generally represented as abilities with:

- id
- name
- level
- resource type: action, bonus action, reaction, none/free
- refresh type: turn, short rest, long rest
- uses or resource pool
- description

The live engine supports many hard-coded ability ids in combat/application code. That means new features are easiest when they reuse existing patterns, and hardest when they require generic “new rules objects.”

Supported or partially supported mechanics include:

- Spell points and spell casting.
- Cantrips.
- Weapon riders on the next hit.
- Extra damage packets.
- Sneak Attack.
- Divine Smite.
- Bardic Inspiration on attacks and saves.
- Rage and rage-specific riders.
- Reckless Attack.
- Wild Shape forms with beast HP and beast attacks.
- Ranger companion as a simplified command strike.
- Ki as a resource pool.
- Metamagic as a resource pool.
- Pact magic.
- Arcane Recovery.
- Channel Divinity.
- Lay on Hands.
- Temporary HP.
- AC bonuses.
- Attack bonuses and penalties.
- Damage bonuses and penalties.
- Saving throw bonuses.
- Speed bonuses and movement changes.
- Resistance, vulnerability, and immunity.
- Status effects such as prone, restrained, frightened, banished, charmed/beguiled, shaken, disarmed, distracted, enfeebled, hamstrung, marked.
- Reaction prompts for a growing number of defensive/counter features.
- Area spells, cone spells, direction spells, point spells, self buffs, weapon-rider spells.
- Death saves and stabilizing.
- Monster special abilities and saving throws.
- Companion/sidekick followers.
- Home comfort bonuses that can affect resources.

### Easy to implement

- Passive feature text and inspection display.
- New abilities that spend action, bonus action, reaction, or no action.
- Short-rest/long-rest/turn resources.
- Resource pools similar to superiority, ki, bardic inspiration, metamagic, psionic energy, wild shape.
- Weapon rider effects.
- Bonus damage once per turn or on next hit.
- Temporary HP.
- Basic healing.
- AC bonuses.
- Attack or save bonuses.
- Simple enemy debuffs.
- Simple party buffs.
- Movement bonuses.
- Resistance while a status is active.
- Spell list expansion.
- Bonus spell/cantrip selection.
- Improved crit range.
- Once-per-combat restoration-style effects.

### Needs small extension

- Generic subclass feature levels for all classes.
- Generic subclass option choices for all classes, not only Fighter/Barbarian.
- Generic “known option” pools for things like cleric domains, bard songs, warlock invocations, druid circles, monk traditions.
- Better generic companion/summon attacks.
- Better generic “once per turn when X happens” hooks.
- Better generic aura handling beyond current paladin save aura and status effects.
- Generic “replace ability behavior” hooks such as alternate Bardic Inspiration uses.
- More generic spell-list expansion by subclass.
- Better grouping of subclass features in UI for all classes.

### Product Direction for Larger Systems

These are no longer all treated as vague major blockers. The current design direction is:

- Summoned creatures should use the existing AI ally framework. Summons should appear as temporary allied tokens, not as a separate bespoke summon system.
- Pets and companions should use existing monster AI profiles for now. Default pet behavior should be melee attacker or ranged kiter, with clear room to add better pet AI later.
- Pet and summon stat scaling should be simple at first: proficiency bonus, class level bands, or owner ability modifier. Avoid full tabletop stat block recalculation.
- Mounts and mounted combat are cut completely. Do not reserve subclass power budget for mounts, saddles, mounted advantage, mounted movement, or mounted defense.
- Illusions are cut. Do not design subclass features around illusion duplicates, fake terrain, decoys, or open-ended illusion rulings.
- Scouting/divination should be limited to concrete dungeon tools. Keep effects like Find Traps, reveal nearby enemies, reveal hazards, initiative foresight, or stored Portent dice. Scrap open-ended scouting magic.
- Stealth rules are planned later. Subclasses may reference future stealth lightly, but must have a non-stealth combat fallback.
- Charm/domination with enemy allegiance changes is desired. Short-duration domination should make an enemy attack other monsters or waste its action for a short time.
- Counterspell-like interrupt systems are desired and should be implemented as reaction prompts.
- Wizards should not use tabletop prepared spell swapping or full spellbook management. Wizards should learn spells like other classes, but know more spells than comparable casters.
- Terrain should include difficult terrain. Weather and ecology simulation are cut.
- Social encounter systems are cut. The only planned social-style rolls are Animal Handling for befriending allies/companions and Persuasion/Deception for story-relevant rolls later.
- Full polymorph/shapechange beyond current Wild Shape is desired later. It should reuse the form-replacement logic from Wild Shape where possible.
- Rune, invocation, metamagic, maneuver, domain, song, and similar option systems should become fully data-driven over time.

### System Work To Prioritize

- AI allied token support for summons and pets.
- Simple pet/summon stat scaling.
- Charm/domination allegiance switching.
- Counterspell and interrupt reaction prompts.
- Difficult terrain.
- Polymorph/shapechange based on Wild Shape-style form replacement.
- Fully data-driven option pools for subclass choices and class feature choices.

### Avoid / replace

- Pure social ribbons with no dungeon effect, except future story-roll hooks for Persuasion, Deception, and Animal Handling.
- Tool/language-only features as standalone subclass levels.
- Features that require a DM ruling.
- Features that require complex targeting during another creature's turn unless a reaction prompt already exists.
- Permanent broad bonuses that stack across party members without limits.
- Always-on party-wide damage boosts.
- Too many separate buttons per subclass.
- “Choose one of many small effects every turn” unless the selection UI is deliberately built for it.
- Mount features. Replace or delete them entirely.
- Illusion features. Replace with defensive magic, enemy debuffs, or stealth-adjacent combat effects.
- Weather/ecology features. Replace with damage resistance, difficult terrain, area control, or movement effects.
- Tabletop wizard preparation features. Replace with extra known spells, cheaper spell costs, or school-specific bonuses.

### What can be represented with existing mechanics

Most iconic subclass fantasies can be represented by combining:

- Existing abilities and resource pools.
- Weapon riders.
- Passive damage/status modifiers.
- Expanded spell lists.
- Short-rest and long-rest buttons.
- Temporary status effects.
- Reaction prompts.
- Existing spells as subclass identity.

### What needs simplified replacement

Subclasses with heavy noncombat identity need conversion:

- Bard colleges need combat songs and inspiration uses.
- Rogue Mastermind/Inquisitive-like features need tactical combat translations.
- Wizard schools need school-specific spell discounts or spell rider bonuses rather than full tabletop school libraries.
- Cleric domains need domain spells and Channel Divinity conversions.
- Druid circles need Wild Shape or spell-loop identities.
- Warlock patrons need patron damage, temp HP, curse, fear, or pact magic changes rather than narrative patron contact.

## 3. Global Subclass Design Rules

1. Level 3 should define the subclass's core playstyle.
2. Level 6 should add a reliable tactical tool or defensive identity.
3. Level 10 should deepen the resource loop or add a strong passive.
4. Level 14 should feel powerful and class-defining.
5. Level 18 should be a capstone-style upgrade, but not completely game-breaking.
6. Prefer features that work in the current dungeon crawler: damage, riders, temp HP, resistance, advantage/disadvantage, extra attacks, critical range, reaction effects, aura effects, resource-limited powers, once-per-combat effects, passive party buffs, enemy debuffs, movement, AI allies, simple summons/companions, spell list expansion, and resource conversion.
7. Avoid pure social features unless converted to dungeon combat or reserved for later story-roll hooks.
8. Avoid features that add too many new buttons.
9. Every subclass should have one clear “what do I do differently?” answer.
10. If a feature is passive, make sure the inspection text clearly explains when it matters.
11. If a feature is a resource, show it in the right panel and ability menu.
12. If a feature triggers as a reaction, prefer a reaction prompt over a manual ability button.
13. If tabletop gives multiple weak ribbons at one level, combine them into one dungeon-useful feature.
14. If a subclass is already strong because the base class is strong, favor utility, control, or resource smoothing over raw damage.
15. For summons and pets, use temporary AI allies first. Give them clear duration, ownership, and scaling rules.
16. For domination/charm, prefer short effects that make an enemy attack monsters, skip its action, or suffer a severe attack penalty. Avoid permanent allegiance changes.
17. For counterspell-like effects, use reaction prompts and clear resource costs.
18. For difficult terrain, make features either create it, ignore it, or punish enemies standing in it.
19. For polymorph/shapechange, reuse Wild Shape-style form replacement and overflow damage behavior where possible.
20. For wizards, do not design around prepared spell swapping. Give extra known spells, school discounts, or school riders instead.

## 4. Class-by-Class Subclass Suggestions

## Barbarian

Current support level: strong. Rage exists, rage riders exist, Barbarian subclasses are already implemented experimentally. The main design need is normalizing all paths to 3/6/10/14/18.

### Path of the Berserker

Fantasy identity: unstoppable fury.
Combat role: melee striker.
Mechanical identity: Rage turns into extra attacks, fear pressure, and retaliation.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Frenzy. While raging, spend a bonus action once per turn to make an extra weapon attack.
- Level 6: Mindless Rage. While raging, resist fear/charm-like combat debuffs and gain advantage or a bonus on mental saves against control.
- Level 10: Intimidating Presence. Action or bonus action fear effect against a visible enemy, applying frightened/shaken.
- Level 14: Retaliation. Reaction attack when a nearby enemy damages you.
- Level 18: Relentless Frenzy. Once per combat, if Frenzy is unavailable or your bonus action is spent, gain one free extra attack after hitting while raging.

Notes:

- Inspired by Frenzy, Mindless Rage, Intimidating Presence, and Retaliation.
- Exhaustion is omitted because it is not fun in this dungeon crawler.
- Existing mechanics support extra attacks, frightened/shaken, and reaction prompts.

### Path of the Totem Warrior

Fantasy identity: animal spirit warrior.
Combat role: flexible tank/support.
Mechanical identity: choose totem modes that alter Rage.
Potential implementation difficulty: Needs small extension if totem choices become reusable across all levels.

Feature progression:

- Level 3: Totem Spirit. Choose Bear, Eagle, or Wolf. Bear improves rage defense, Eagle improves rage mobility, Wolf improves ally pressure.
- Level 6: Aspect of the Beast. Upgrade the chosen totem with dungeon benefits: Bear gains carrying/athletics and temp HP, Eagle gains initiative/movement, Wolf gains perception/pack tactics.
- Level 10: Spirit Walker. Once per short rest, reveal or mark nearby enemies and gain a tactical buff before a fight.
- Level 14: Totemic Attunement. Bear punishes enemies that attack allies, Eagle gains reaction movement/avoidance, Wolf grants ally advantage against your marked target.
- Level 18: Primal Avatar. Once per long rest, empower all known totem effects for a fight.

Notes:

- Tabletop exploration features become combat/dungeon awareness tools.
- Current totem/rage support is partly present.
- Best if totem choices are shown as a compact dropdown, not many buttons.

### Path of the Zealot

Fantasy identity: divine rage martyr.
Combat role: durable radiant striker.
Mechanical identity: radiant rage damage, save recovery, party rally, near-death fury.
Potential implementation difficulty: Easy to moderate.

Feature progression:

- Level 3: Divine Fury. First weapon hit each turn while raging adds radiant or necrotic damage.
- Level 6: Fanatical Focus. Once per long rest, reroll a failed saving throw.
- Level 10: Zealous Presence. Bonus action party rally for advantage/bonus on attacks and saves for one round.
- Level 14: Rage Beyond Death. While raging, the first time you would drop to 0 HP each dungeon, remain at 1 HP or keep acting until rage ends.
- Level 18: Saint of Slaughter. Divine Fury improves and Zealous Presence also grants temporary HP.

Notes:

- Existing saving throw, temp HP, radiant damage, and reaction/near-death hooks can support this.
- Needs careful limit on Rage Beyond Death to avoid immortality.

Optional later Barbarian paths:

- Beast: already experimental; keep as high-flavor admin option.
- Ancestral Guardian: good defender but needs robust reaction ally-protection.
- Storm Herald: viable but needs aura clarity.
- Wild Magic: fun, but random effects need good UI and logs.
- Giant and Battlerager: playable, but less core 2014.

## Bard

Current support level: moderate. Bard has spellcasting and Bardic Inspiration, but many tabletop Bard features are social/exploration and need combat replacement.

### College of Lore

Fantasy identity: clever magical generalist.
Combat role: control/support caster.
Mechanical identity: inspiration disrupts enemies; later gains flexible spell access.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Cutting Words. Spend Bardic Inspiration as a reaction to reduce an enemy attack roll, damage roll, or saving throw result.
- Level 6: Magical Secrets. Add two off-list combat spells to the bard spell list.
- Level 10: Superior Inspiration. If combat starts and you have no Bardic Inspiration, regain one use.
- Level 14: Peerless Skill. Spend Bardic Inspiration on your own attack, save, or important skill-like roll.
- Level 18: Grand Secret. Choose one powerful spell from any list and reduce its spell point cost once per long rest.

Notes:

- Replaces broad skill/social value with combat flexibility.
- Existing Bardic Inspiration, spell list, reactions, and spell points support most of this.

### College of Valor

Fantasy identity: battle-skald.
Combat role: martial support caster.
Mechanical identity: inspiration improves ally offense/defense and Bard can fight with weapons.
Potential implementation difficulty: Easy to moderate.

Feature progression:

- Level 3: Combat Inspiration. Allies can spend Bardic Inspiration for weapon damage or AC against an incoming hit.
- Level 6: Extra Attack. Bard can attack twice with the Attack action.
- Level 10: War Chant. Bonus action song grants nearby allies temporary HP and attack bonus for one round.
- Level 14: Battle Magic. After casting a bard spell, make one weapon attack as a bonus action.
- Level 18: Heroic Chorus. Once per long rest, grant all active allies Bardic Inspiration or refresh one spent inspiration on each ally.

Notes:

- Keeps the battlefield-leader fantasy.
- Needs small extension for ally use of inspiration as damage/AC.

### College of Swords

Fantasy identity: spellblade performer.
Combat role: mobile melee striker.
Mechanical identity: Bardic Inspiration fuels flourishes.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Blade Flourish. After hitting with a weapon, spend Bardic Inspiration for one flourish: defensive AC, splash damage, or movement.
- Level 6: Extra Attack. Attack twice.
- Level 10: Flourish Mastery. First flourish each combat costs no inspiration or refunds on kill.
- Level 14: Master’s Flourish. Use a weaker flourish without spending Bardic Inspiration once per turn.
- Level 18: Finale. Once per long rest, perform a devastating flourish that damages one target and buffs nearby allies.

Notes:

- Needs a compact flourish choice UI or three separate favoriteable abilities.
- Very good fit if weapon rider options are made generic.

### Bard Combat Replacement Section

Bards should not feel like weak Wizards. The Bard should be a tactical tempo class:

- Bardic Inspiration should be a core combat resource.
- Bard subclasses should spend, alter, or multiply Bardic Inspiration in distinct ways.
- Social ribbons should become songs, debuffs, enemy penalties, or party tempo shifts.

Recommended Bard conversions:

- Damage boost: inspiration adds damage to ally weapon hit.
- Hit chance boost: current inspiration support already helps missed attacks.
- Saving throw boost: current support already helps failed saves.
- Temporary HP: inspiration can become a quick morale shield.
- Defensive reaction: Cutting Words/Combat Inspiration can reduce enemy hit or raise AC.
- Enemy debuff: Vicious Mockery/Cutting Words style attack penalty.
- Party song: short duration party-wide buff, usually once per short/long rest.
- Swords/Valor: weapon attack support so Bard does not live only in spellbook.
- Lore: magical secrets and reaction control.
- Glamour later: temp HP and repositioning.
- Whispers later: psychic burst and fear.
- Spirits later: controlled-random support effects, reusing Wild Magic style randomness if cleaned up.

Why this still feels like Bard:

- The Bard wins by timing, rhythm, and morale.
- Subclasses change what “inspiration” means.
- The Bard’s combat identity is not raw spell damage; it is party tempo.

Optional later Bard colleges:

- Glamour: temp HP and repositioning song.
- Whispers: psychic strike and fear.
- Spirits: random support tales.

## Cleric

Current support level: moderate. Cleric has full casting and Channel Divinity, but no domains. Domains should provide spell list identity and Channel Divinity variants.

### Life Domain

Fantasy identity: dedicated healer.
Combat role: sustain support.
Mechanical identity: stronger healing, better emergency recovery.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Disciple of Life. Healing spells restore extra HP.
- Level 6: Preserve Life. Channel Divinity heals multiple wounded allies or heavily heals one adjacent ally.
- Level 10: Blessed Healer. When healing an ally, the Cleric also heals a small amount.
- Level 14: Supreme Healing. Once per long rest, a healing spell rolls maximum healing or grants extra temporary HP.
- Level 18: Beacon of Life. Once per dungeon, party-wide healing burst and poison/condition cleanse.

Notes:

- Tabletop starts at level 1; shifted to level 3.
- Existing healing, temp HP, Channel Divinity, and party targeting support this.

### Tempest Domain

Fantasy identity: storm priest.
Combat role: burst/control caster.
Mechanical identity: thunder/lightning damage, reaction punishment, push/slow effects.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Wrath of the Storm. Reaction lightning/thunder damage when hit.
- Level 6: Destructive Wrath. Channel Divinity maximizes or heavily boosts one thunder/lightning spell.
- Level 10: Thunderbolt Strike. Lightning/thunder damage slows, pushes, or knocks prone.
- Level 14: Storm Shield. Gain lightning/thunder resistance and grant it to nearby allies briefly.
- Level 18: Avatar of the Storm. Once per long rest, storm aura damages and hinders nearby enemies for several rounds.

Notes:

- Existing damage types, reactions, status effects, and area effects support this.
- Push movement is not robust; slow/prone is safer.

### War Domain

Fantasy identity: battle priest.
Combat role: martial support bruiser.
Mechanical identity: weapon attacks, accuracy boosts, party offense.
Potential implementation difficulty: Easy to moderate.

Feature progression:

- Level 3: War Priest. Bonus action weapon attack limited by Wisdom/long rest.
- Level 6: Guided Strike. Channel Divinity adds a large hit bonus to your attack.
- Level 10: War God’s Blessing. Reaction/feature grants an ally hit bonus.
- Level 14: Divine Strike. Once per turn weapon hit adds radiant damage.
- Level 18: Avatar of Battle. Once per long rest, gain weapon resistance, damage bonus, and party attack support.

Notes:

- Existing attack bonuses, weapon riders, and reaction prompts support this.
- Avoid making it outdamage Fighter every round.

Optional later Cleric domains:

- Light: radiant/fire blaster.
- Trickery: stealth/control, but needs stealth value.
- Grave/Death: necrotic support, risky but flavorful.

## Druid

Current support level: strong for Wild Shape, moderate for spellcasting. Druid circles should either modify Wild Shape, deepen spell roles, or use temporary AI allies for summons.

### Circle of the Moon

Fantasy identity: battle shapeshifter.
Combat role: tank/bruiser.
Mechanical identity: stronger Wild Shape forms and faster/reliable transformation.
Potential implementation difficulty: Easy because Wild Shape already exists.

Feature progression:

- Level 3: Combat Wild Shape. Wild Shape becomes better in combat: stronger forms, bonus action transformation, or temp HP on shift.
- Level 6: Primal Strikes. Beast attacks count as magical and gain a small damage bonus.
- Level 10: Elemental Wild Shape Lite. Choose an elemental battle-form buff rather than a full new token form.
- Level 14: Thousand Forms. Gain self-healing or defensive adaptation when shifting.
- Level 18: Archdruid Shape. If combat starts with no Wild Shape uses, regain one; beast form can maintain limited spellcasting.

Notes:

- Exact tabletop elemental forms would need more beast/elemental stat blocks.
- Existing Wild Shape can support most of this.

### Circle of the Land

Fantasy identity: terrain-bound spellcaster.
Combat role: flexible control caster.
Mechanical identity: land choice gives spell list and recovery.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Natural Recovery. Once per long rest, recover spell points after a short rest or as an ability.
- Level 6: Land Circle Spells. Choose a land theme that adds always-available combat spells.
- Level 10: Nature’s Ward. Resist one damage type based on land and ignore or move freely through difficult terrain from natural or magical ground effects.
- Level 14: Nature’s Sanctuary. Enemies suffer attack penalties or saves when trying to strike you after you cast nature magic.
- Level 18: Elder Land. First land spell each combat is cheaper or gains a rider.

Notes:

- Needs land-theme selection UI.
- Can mostly reuse spell list, resistance, and future difficult terrain systems.
- Do not build weather or ecology simulation for this subclass. Land identity should come from spells, resistances, movement through difficult terrain, and area control.

### Circle of the Shepherd

Fantasy identity: spirit caller and beast friend.
Combat role: summon/support.
Mechanical identity: spirit totems and improved companions/summons.
Potential implementation difficulty: Moderate. Use AI allies for spirit summons instead of a separate summon framework.

Feature progression:

- Level 3: Spirit Totem. Choose Bear, Hawk, or Unicorn spirit aura for temp HP, attack accuracy, or healing boost.
- Level 6: Mighty Summoner. Summoned beasts or spirits appear as temporary AI allies using melee or ranged-kiter behavior, scaled by druid level/proficiency.
- Level 10: Guardian Spirit. Allies in your spirit aura heal a small amount or gain temp HP each round.
- Level 14: Faithful Summons. When reduced low, automatically call temporary spirit beasts as AI allies for a short duration.
- Level 18: Great Spirit. Spirit Totem affects a larger area and can change once per combat.

Notes:

- Use existing AI ally behavior. Start with simple melee spirit and ranged-kiter spirit profiles.
- Scaling should be simple: HP, attack bonus, and damage increase by druid level bands or proficiency.
- Keep aura support as the subclass's reliable baseline so the subclass remains useful even if summon positioning is imperfect.

Optional later Druid circles:

- Spores: necrotic temp HP melee caster.
- Stars: archer/chalice/dragon stances.
- Dreams: healing/teleport support.

## Fighter

Current support level: very strong. Fighter subclasses are already experimental. Recommendation is to normalize features to 3/6/10/14/18 later.

### Champion

Fantasy identity: simple physical excellence.
Combat role: low-complexity striker.
Mechanical identity: improved crits, athletic passive, self-sustain.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Improved Critical. Weapon crits on 19-20.
- Level 6: Remarkable Athlete. Better initiative, physical checks, and movement.
- Level 10: Additional Fighting Style. Choose another combat style.
- Level 14: Superior Critical. Weapon crits on 18-20.
- Level 18: Survivor. Regenerate HP when below half health at start of turn.

Notes:

- Moved tabletop level 7 and 15 features into unified slots.
- Existing crit and passive support can handle this.

### Battle Master

Fantasy identity: tactical weapon master.
Combat role: control striker/support.
Mechanical identity: superiority dice and maneuvers.
Potential implementation difficulty: Already mostly present.

Feature progression:

- Level 3: Combat Superiority. Choose maneuvers and gain superiority dice.
- Level 6: Tactical Expansion. Learn more maneuvers and gain one more die.
- Level 10: Improved Combat Superiority. Superiority die improves and tactical assessment becomes dungeon-useful.
- Level 14: Relentless. Recover one die at combat start if empty.
- Level 18: Master of War. Once per combat, use a maneuver without spending a die or use two compatible maneuver effects on one hit.

Notes:

- Existing maneuver system supports this.
- Avoid too many maneuvers in the active list; favorites help.

### Eldritch Knight

Fantasy identity: armored spellblade.
Combat role: martial caster.
Mechanical identity: third-caster spell points, cantrips, weapon/spell rhythm.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Spellcasting. Gain wizard cantrips/spells and third-caster spell points.
- Level 6: War Magic. After using a cantrip, make or empower a weapon attack.
- Level 10: Eldritch Strike. Weapon hits make target vulnerable to your next spell or reduce their save.
- Level 14: Arcane Charge. Action Surge includes teleport/reposition.
- Level 18: Improved War Magic. After casting a leveled spell, make or empower a weapon attack.

Notes:

- Existing spell list, spell points, weapon riders, and mobility can support this.
- Needs careful action economy to avoid double-dipping too often.

Optional later Fighter archetypes:

- Arcane Archer, Rune Knight, Samurai, Cavalier, Echo Knight, Psi Warrior, Banneret.

## Monk

Current support level: moderate. Ki exists, Flurry and Patient Defense exist. Subclasses should mostly spend or improve ki.

### Way of the Open Hand

Fantasy identity: pure martial artist.
Combat role: control striker.
Mechanical identity: Flurry adds control.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Open Hand Technique. Flurry can knock prone, push/slow, or block reactions.
- Level 6: Wholeness of Body. Action heal using a long-rest resource.
- Level 10: Tranquility. Start combat with temp HP or a defensive stance.
- Level 14: Quivering Palm Lite. Once per long rest, mark a hit target; later detonate for heavy necrotic/force damage.
- Level 18: Perfect Body. If combat starts with low/no ki, regain ki; Open Hand control improves.

Notes:

- Push should be translated to slow/prone until forced movement is robust.
- Existing ki and status effects support this.

### Way of Shadow

Fantasy identity: ninja mystic.
Combat role: skirmisher/control.
Mechanical identity: darkness/teleport/stealth-like combat advantage.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Shadow Arts. Spend ki for darkness/silence-like debuffs or minor teleport.
- Level 6: Shadow Step. Bonus action teleport between visible dark/valid spaces and gain advantage.
- Level 10: Cloak of Shadows. Become briefly hidden/untargetable or gain strong defense until attacking.
- Level 14: Opportunist. Reaction attack when an adjacent enemy is hit by an ally.
- Level 18: Master of Shadow. First Shadow Step each combat is free and applies a brief frightened/hamstrung rider.

Notes:

- True light/darkness terrain is missing.
- Use teleport, advantage, and debuffs as replacement.

### Way of the Drunken Master

Fantasy identity: unpredictable evasive brawler.
Combat role: mobile skirmisher.
Mechanical identity: Flurry improves movement and defense.
Potential implementation difficulty: Easy to moderate.

Feature progression:

- Level 3: Drunken Technique. After Flurry, gain disengage-like movement and bonus speed.
- Level 6: Tipsy Sway. Reaction turns a missed melee attack into a counter or redirects it.
- Level 10: Drunkard’s Luck. Spend ki to cancel disadvantage or reroll a bad d20.
- Level 14: Intoxicated Frenzy. Flurry can hit multiple nearby enemies.
- Level 18: Impossible Rhythm. Once per combat, gain a free Flurry and reaction defense in the same round.

Notes:

- Existing movement, reaction, and extra attack support this.

Optional later Monk traditions:

- Four Elements: spell-like ki, but needs careful UI.
- Mercy: healing/harm monk, good future support.
- Kensei: weapon monk, easy later.

## Paladin

Current support level: moderate. Paladin has spell points, Divine Smite, Lay on Hands, and Aura of Protection.

### Oath of Devotion

Fantasy identity: holy protector.
Combat role: defensive striker/support.
Mechanical identity: radiant weapon, charm/fear defense, party protection.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Sacred Weapon. Channel Oath to add Charisma to weapon accuracy and radiant flavor for a fight.
- Level 6: Aura of Devotion. Nearby allies resist fear/charm-like debuffs.
- Level 10: Purifying Smite. Divine Smite can remove a negative status from you or an ally.
- Level 14: Holy Nimbus Lite. Once per long rest, radiant aura damages nearby enemies and boosts saves.
- Level 18: Beacon of Devotion. Sacred Weapon and aura effects improve and start combat with one free defensive pulse.

Notes:

- Tabletop level 20 capstone is adapted to 14/18.
- Existing smite, aura, status cleanse, and radiant damage support this.

### Oath of Vengeance

Fantasy identity: relentless avenger.
Combat role: single-target striker.
Mechanical identity: mark one enemy and destroy it.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Vow of Enmity. Mark one visible enemy; gain advantage/bonus damage against it.
- Level 6: Relentless Avenger. After hitting marked target, gain movement or prevent escape.
- Level 10: Soul of Vengeance. Reaction attack when marked enemy attacks.
- Level 14: Avenging Angel Lite. Once per long rest, gain speed, fear aura, and bonus radiant damage.
- Level 18: Final Judgment. Against your marked target, first smite each combat costs less or deals extra radiant damage.

Notes:

- Existing marked status and weapon riders fit this well.

### Oath of the Ancients

Fantasy identity: green knight of light and life.
Combat role: defensive aura support.
Mechanical identity: nature control, spell resistance, radiant/nature healing.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Nature’s Wrath. Channel Oath restrains or slows a target with vines.
- Level 6: Aura of Warding. Nearby allies gain resistance or save bonus against spell damage.
- Level 10: Undying Sentinel. Once per long rest, drop to 1 HP instead of 0.
- Level 14: Elder Champion Lite. Once per long rest, gain regeneration and nature/radiant weapon rider.
- Level 18: Ancient Ward. Aura improves and Nature’s Wrath can affect a small area.

Notes:

- Existing restrained, resistance, near-death, and healing support this.

Optional later Paladin oaths:

- Crown: tank/taunt.
- Conquest: fear control.
- Redemption: damage redirection.

## Ranger

Current support level: moderate. Ranger has half casting and a simplified companion strike. Subclasses should make martial/spell/companion identity clearer. Beast Master should move toward an AI ally pet using existing ally behavior.

### Hunter

Fantasy identity: monster slayer.
Combat role: martial striker.
Mechanical identity: choose hunting tactics against common dungeon threats.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Hunter’s Prey. Choose Colossus Slayer, Horde Breaker, or Giant Killer-style mode.
- Level 6: Defensive Tactics. Resist opportunity/reaction damage, gain AC against marked enemies, or improve saves.
- Level 10: Multiattack Defense. Enemy that hits you becomes easier to avoid next time.
- Level 14: Volley/Whirlwind Lite. Once per short rest, hit multiple nearby enemies or fire a small-area shot.
- Level 18: Apex Predator. First hit each combat against a wounded/marked target deals major bonus damage.

Notes:

- Existing extra damage and area targeting support most of this.

### Beast Master

Fantasy identity: ranger and loyal beast.
Combat role: pet striker/support.
Mechanical identity: companion command and scaling beast support.
Potential implementation difficulty: Moderate. Use existing AI ally token behavior; avoid building a bespoke pet system first.

Feature progression:

- Level 3: Ranger’s Companion. Gain a pet AI ally. Choose melee hunter or ranged kiter behavior. The pet acts as an allied token and follows the ranger.
- Level 6: Coordinated Attack. When you attack your marked target, your pet gains a bonus attack or damage rider against that target.
- Level 10: Bestial Defense. Pet grants you temp HP, AC, or reaction protection when adjacent or when it damages your marked target.
- Level 14: Storm of Claws. Once per short rest, command the pet to make a strong strike that can prone, hamstring, or distract.
- Level 18: Primal Bond. Pet gains improved scaling and one free command each combat.

Notes:

- Use current AI ally infrastructure.
- Pet AI should initially reuse melee monster AI or ranged-kiter monster AI.
- Leave a clear extension point for smarter pet AI later.
- Pet scaling should be simple and visible: HP, attack bonus, damage, and AC improve by ranger level bands or proficiency bonus.

### Gloom Stalker

Fantasy identity: ambush predator of darkness.
Combat role: opener/skirmisher.
Mechanical identity: initiative, first-round burst, stealth-like defense.
Potential implementation difficulty: Easy to moderate.

Feature progression:

- Level 3: Dread Ambusher. Bonus initiative, extra movement, and first-turn bonus damage/attack.
- Level 6: Umbral Defense. Harder to hit before you attack or when at range.
- Level 10: Iron Mind. Gain Wisdom save support and resist fear.
- Level 14: Stalker’s Flurry. Once per turn when you miss, make or empower another attack.
- Level 18: Shadow Apex. First attack each combat can frighten/hamstring and deals extra psychic/weapon damage.

Notes:

- Existing initiative prompt, attack advantage, and status riders support this.

Optional later Ranger conclaves:

- Monster Slayer: mark plus anti-magic reaction prompts against boss spell-like effects.
- Horizon Walker: force damage and teleport.
- Swarmkeeper: forced movement/status riders.

## Rogue

Current support level: strong base. Sneak Attack, Cunning Action, Steady Aim, Uncanny Dodge, and Evasion exist. Subclasses should modify Sneak Attack and action economy.

### Thief

Fantasy identity: fast-handed dungeon specialist.
Combat role: utility skirmisher.
Mechanical identity: faster item use, movement, trap/loot advantage.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Fast Hands. Use items, potions, or certain object interactions as bonus action.
- Level 6: Second-Story Work. Gain climb/movement bonus and advantage on mobility checks.
- Level 10: Supreme Sneak. If you did not move far this turn, gain stealth/advantage support.
- Level 14: Use Magic Device Lite. Once per long rest, use a magic item or scroll-like effect regardless of class.
- Level 18: Thief’s Reflexes. Once per combat, gain an extra action or bonus action on the first turn.

Notes:

- Item systems already exist.
- Needs careful UI to avoid item abuse.

### Assassin

Fantasy identity: ambush killer.
Combat role: opener burst striker.
Mechanical identity: initiative and first-turn Sneak Attack burst.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Assassinate. Advantage against enemies that have not acted; first-turn hit deals extra damage.
- Level 6: Infiltration Expert Replacement. Gain dungeon ambush preparation: start combat hidden/with advantage once per short rest.
- Level 10: Impostor Replacement. Mark a target before combat; first hit against that target applies frightened/shaken.
- Level 14: Death Strike Lite. Once per long rest, first critical or surprise hit deals greatly increased damage.
- Level 18: Perfect Ambush. If combat starts and you win initiative, regain Steady Aim and add Sneak Attack dice.

Notes:

- Social disguise features become ambush preparation.
- Existing initiative and sneak attack support this well.

### Arcane Trickster

Fantasy identity: sneaky enchantment/control rogue.
Combat role: control skirmisher.
Mechanical identity: third-caster spells plus Sneak Attack synergy, without open-ended illusions.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Spellcasting. Gain wizard-style cantrips/spells, focused on enchantment, control, mobility, and debuffs. Do not rely on illusion spells.
- Level 6: Mage Hand Legerdemain Replacement. Bonus action trick imposes distracted or lowers AC.
- Level 10: Magical Ambush. Spells cast while hidden/steady have harder saves.
- Level 14: Versatile Trickster. Bonus action distracts target, enabling Sneak Attack.
- Level 18: Spell Thief Lite. Once per long rest, reaction interrupts an enemy spell-like effect, reduces its damage or cancels its status, and restores spell points.

Notes:

- Needs third-caster progression and spell list.
- Existing distracted status, spell points, Sneak Attack, and future counterspell-style reactions support this.
- Illusion identity should be replaced by enchantment, misdirection-as-debuff, stealth-adjacent advantage, and spell interruption.

Optional later Rogue archetypes:

- Swashbuckler: one-on-one mobile rogue.
- Scout: mobility/reaction escape.
- Soulknife: psionic ranged rogue, needs psionic dice.

## Sorcerer

Current support level: moderate. Sorcerer has full casting and metamagic as a resource pool. Subclasses should shape spell damage and survivability.

### Draconic Bloodline

Fantasy identity: dragon-blooded caster.
Combat role: durable elemental blaster.
Mechanical identity: resistance, elemental damage boost, dragon fear/aura.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Draconic Resilience. Better AC/HP and choose elemental ancestry.
- Level 6: Elemental Affinity. Spells of ancestry type deal extra damage and can grant resistance.
- Level 10: Dragon Wings Lite. Bonus action movement/escape and brief AC bonus.
- Level 14: Draconic Presence. Once per long rest, frighten or charm nearby enemies.
- Level 18: Dragon Avatar. Once per long rest, gain resistance, damage aura, and empowered ancestry spells.

Notes:

- Needs ancestry choice.
- Existing resistance, damage type, and fear support this.

### Wild Magic

Fantasy identity: unstable arcane chaos.
Combat role: unpredictable burst/support.
Mechanical identity: surge table, luck manipulation.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Wild Surge. Casting leveled spells can trigger a controlled random effect.
- Level 6: Bend Luck. Spend metamagic/reaction to add or subtract from a d20.
- Level 10: Controlled Chaos. Roll two surge effects and choose one.
- Level 14: Spell Bombardment Lite. Once per turn, high spell damage can add bonus damage.
- Level 18: Chaos Mastery. Once per long rest, trigger a chosen wild surge and regain metamagic.

Notes:

- Existing Barbarian Wild Magic can inspire this.
- Needs clean logs and capped randomness.

### Divine Soul

Fantasy identity: divine-blooded sorcerer.
Combat role: healer/blaster hybrid.
Mechanical identity: cleric spells, saving grace, radiant healing.
Potential implementation difficulty: Easy to moderate.

Feature progression:

- Level 3: Divine Magic. Add cleric spells to sorcerer choices and gain a once-per-rest save boost.
- Level 6: Empowered Healing. Spend metamagic to reroll or boost healing.
- Level 10: Otherworldly Wings Lite. Bonus action movement/defense and radiant aura.
- Level 14: Unearthly Recovery. Once per long rest, heal yourself when below half HP.
- Level 18: Divine Conduit. Once per long rest, cast a cleric/sorcerer spell at reduced cost and grant party temp HP.

Notes:

- Existing cleric spell list and healing mechanics support this.

Optional later Sorcerous origins:

- Shadow: darkness/necrotic survival.
- Storm: lightning movement.
- Aberrant Mind: psychic control.

## Warlock

Current support level: moderate. Warlock has pact spell points, Eldritch Blast, and pact magic. Patrons should define damage type, curse, and defensive identity.

### The Fiend

Fantasy identity: infernal bargain.
Combat role: blasting survivor.
Mechanical identity: temp HP on kills, fire/hellish damage, luck.
Potential implementation difficulty: Easy.

Feature progression:

- Level 3: Dark One’s Blessing. Gain temp HP when you reduce an enemy to 0 HP.
- Level 6: Dark One’s Own Luck. Once per short rest, add a die/bonus to a failed save or attack.
- Level 10: Fiendish Resilience. Choose or gain resistance to a common damage type after rest.
- Level 14: Hurl Through Hell Lite. Once per long rest, weapon/spell hit banishes and deals psychic/fire damage.
- Level 18: Infernal Patronage. First kill each combat restores pact spell points or grants a free Hellish Rebuke.

Notes:

- Existing temp HP, banished, damage, and pact points support this.

### Hexblade

Fantasy identity: cursed weapon pact.
Combat role: weapon/cantrip striker.
Mechanical identity: curse, Charisma weapon pressure, defensive curse.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Hexblade’s Curse. Mark enemy; gain bonus damage, improved crit, and healing on kill.
- Level 6: Accursed Specter. On kill, summon a short-duration specter AI ally using melee or ranged-kiter behavior, or fall back to temp HP and a shadow strike rider if token space is bad.
- Level 10: Armor of Hexes. Reaction chance/bonus to make cursed target miss.
- Level 14: Master of Hexes. Move curse to a new target when cursed target dies.
- Level 18: Cursed Sovereign. Once per long rest, curse all nearby enemies or empower Eldritch Blast/weapon hits against cursed target.

Notes:

- Use existing AI ally behavior for the specter.
- Keep duration short and scale simply by warlock level/proficiency.
- Existing mark, crit, temp HP, and reaction systems fit.

### Great Old One

Fantasy identity: alien mind patron.
Combat role: psychic control caster.
Mechanical identity: psychic damage, fear/confusion, defensive mind.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Awakened Mind Replacement. Psychic cantrip/telepathic mark that applies shaken or disadvantage.
- Level 6: Entropic Ward. Reaction imposes disadvantage or AC bonus against an attack; next attack gains advantage.
- Level 10: Thought Shield. Psychic resistance and reflect psychic damage.
- Level 14: Alien Thrall. Once per long rest, briefly dominate one enemy. A dominated enemy should attack another monster if a target is available; otherwise it wastes or loses its action. Bosses and important elites should suffer a shorter beguiled/shaken fallback instead of full allegiance change.
- Level 18: Elder Revelation. Once per long rest, area psychic burst with frightened/shaken.

Notes:

- This should use the planned short-duration charm/domination system.
- Keep the duration short and make the combat log explicit so the player understands why the enemy changed sides.
- Full permanent control is not desired. Boss-safe fallback effects keep the subclass useful without trivializing major fights.

Optional later Patrons:

- Archfey: charm/fear/teleport.
- Celestial: healing warlock.
- Undead/Undying: necrotic survival.

## Wizard

Current support level: moderate. Wizard has full spellcasting and Arcane Recovery. Wizards should not use tabletop prepared spell swapping or full spellbook management in this crawler. They should learn spells like other classes, but know more spells than comparable casters. Schools should change spell economy, grant extra known spells, and add school riders.

### School of Evocation

Fantasy identity: precise battle mage.
Combat role: area blaster.
Mechanical identity: safer AoE and stronger damage spells.
Potential implementation difficulty: Easy to moderate.

Feature progression:

- Level 3: Sculpt Spells. Allies take reduced or no damage from your area spells.
- Level 6: Potent Cantrip. Cantrips gain ability modifier damage or partial damage on save.
- Level 10: Empowered Evocation. Evocation spells add Intelligence to damage.
- Level 14: Overchannel Lite. Once per long rest, maximize a low/mid-level damage spell.
- Level 18: Arch-Evoker. First evocation each combat costs less or gains a small splash rider.

Notes:

- Friendly-fire rules need checking; if not robust, convert Sculpt Spells to ally resistance vs own AoE.

### School of Necromancy

Fantasy identity: life-draining death mage.
Combat role: sustain/debuff caster.
Mechanical identity: necrotic kills heal, undead support later.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Grim Harvest. When a spell kills an enemy, regain HP or spell points.
- Level 6: Undead Thrall. Summon a temporary skeletal AI ally using melee or ranged-kiter behavior, scaled by wizard level/proficiency. If token space is unavailable, fall back to a once-per-turn necrotic skeletal strike.
- Level 10: Inured to Undeath. Necrotic resistance and max HP drain immunity.
- Level 14: Command Undead. Once per long rest, briefly dominate an undead or death-marked enemy. Bosses and important elites suffer frightened/slowed instead.
- Level 18: Deathly Conduit. Necrotic spells heal you and your undead strike improves.

Notes:

- Use the same AI ally foundation as pets and summons.
- Start with simple undead profiles rather than full tabletop undead stat blocks.
- Keep the fallback necrotic strike so the subclass still functions in tight maps where another token cannot be placed.

### School of Divination

Fantasy identity: fate reader.
Combat role: control support.
Mechanical identity: portent dice and resource prediction.
Potential implementation difficulty: Moderate.

Feature progression:

- Level 3: Portent. Roll/store two d20 results after rest; replace attack/save rolls.
- Level 6: Expert Divination. Casting divination/control spells restores a little spell power once per turn/round.
- Level 10: Third Eye. Choose a dungeon sense: initiative bonus, reveal hidden/traps, or resistance to surprise.
- Level 14: Greater Portent. Store a third portent die.
- Level 18: Fate Master. Once per long rest, force enemy failure or ally success within bounded limits.

Notes:

- Portent is iconic but requires a roll replacement UI/system.
- If delayed, use reaction “add/subtract 1d8” first.
- Divination should stay concrete: Portent dice, trap/enemy/hazard reveal, initiative foresight, and bounded roll replacement. Do not design around open-ended scouting or remote viewing.

Optional later Wizard schools:

- Abjuration: arcane ward.
- Illusion: do not prioritize. If included later, convert to defensive phantasmal debuffs, stealth-adjacent advantage, or enemy attack penalties. Do not build true illusion duplicates, fake terrain, or open-ended illusion rulings.
- Bladesinging: weapon wizard.

## 5. Foundation Implementation Instructions

These instructions describe how the new foundation systems should work when implementation begins. They are not implementation code.

### AI Ally Summons and Pets

- Use the existing AI ally/follower approach as the base for summoned creatures, pets, spirit allies, undead thralls, and patron specters.
- A summon or pet should have an owner, a duration, an allegiance, a behavior profile, a visible name, and simple scaling.
- First-pass behavior profiles should be limited to melee attacker and ranged kiter.
- Melee attacker pets should move toward enemies, avoid blocking the owner when possible, and attack the nearest or owner-marked target.
- Ranged kiter pets should stay at a useful distance, avoid melee when possible, and attack marked or vulnerable enemies.
- Temporary summons should normally last a small number of rounds or until combat ends.
- Persistent pets, such as Beast Master companions, may stay with the party across rooms, but should use the same combat AI foundation.
- Scaling should use easy visible numbers: owner proficiency bonus, owner level bands, owner spellcasting ability modifier, or class level.
- Do not build full tabletop stat block recalculation. The player should understand that the ally grows stronger because the owner grows stronger.
- If no valid tile exists for a summoned ally, the feature should fall back to a clean effect such as temporary HP, a one-time strike, or a short combat buff rather than failing silently.

### Charm and Domination

- Charm/domination should be a short-duration combat allegiance effect.
- A dominated enemy should prefer attacking monsters instead of heroes.
- If no valid monster target exists, the dominated enemy should waste its action, move poorly, or suffer a strong attack penalty for the duration.
- Bosses, story enemies, and important elites should usually resist full control. Their fallback should be beguiled, shaken, slowed, action-penalized, or forced to make a saving throw against a weaker version.
- Domination should have clear combat log text so the player sees that the enemy is temporarily turned against its allies.
- Permanent enemy conversion is not part of subclass balance.

### Counterspell and Interrupt Reactions

- Counterspell-style features should trigger from reaction prompts when an enemy casts a spell or uses a spell-like special ability.
- The prompt should show the resource cost and likely effect in player-facing language.
- First-pass interrupt outcomes can be simple: cancel the effect, reduce damage, prevent a condition, or impose disadvantage on the enemy's spell attack/save DC.
- Strong interrupts should cost a reaction plus a class resource, spell points, pact magic, or limited-use feature.
- Boss abilities should not always be fully cancelable. Partial reduction is acceptable and easier to balance.

### Wizard Spell Learning

- Wizards should not use tabletop prepared spell swapping or a separate spellbook management UI.
- Wizards should learn spells like other classes, but with more known spells and more school identity.
- Wizard subclasses can grant extra known spells, school-specific spell point discounts, stronger school riders, or once-per-rest school powers.
- Avoid features that ask the player to rebuild a prepared spell list every adventuring day.

### Difficult Terrain

- Difficult terrain should be a tile or area property that increases movement cost.
- Subclass features can create difficult terrain, ignore difficult terrain, punish enemies standing in difficult terrain, or gain bonuses while fighting inside it.
- Do not expand this into weather, ecology, seasons, survival simulation, or complex environmental modeling.
- The player should see why movement changed through tile visuals, hover text, combat log text, or a clear status marker.

### Stealth, Scouting, and Divination

- Stealth rules are planned later, but subclass features must not depend only on stealth until that system exists.
- Scouting and divination should stay concrete and dungeon-readable: reveal traps, reveal hazards, reveal nearby enemies, boost initiative, prevent surprise, or store Portent-style dice.
- Illusions are cut. Replace illusion identity with defensive phantasms, enemy attack penalties, distraction, stealth-adjacent advantage, or control debuffs.

### Social and Story Rolls

- Broad social encounter systems are out of scope for subclass combat design.
- Animal Handling can later support befriending allies and companions.
- Persuasion and Deception can later support story-relevant rolls.
- Combat subclass features should not spend level budget on pure social ribbons.

### Polymorph and Shapechange

- Polymorph and shapechange should reuse Wild Shape-style form replacement where possible.
- A form should define attacks, AC or defensive profile, movement, temporary/form HP, and whether spellcasting is blocked or limited.
- Overflow damage and return-to-original-form behavior should follow the current Wild Shape model unless a feature explicitly says otherwise.
- Start with a small curated form list. Do not build open-ended monster-form selection at first.
- Enemy polymorph can use a simplified harmful form or status effect instead of replacing every monster stat block.

### Data-Driven Option Pools

- Maneuvers, Arcane Shots, runes, invocations, metamagic choices, bard songs, cleric domain choices, druid land themes, and similar option lists should move toward one shared option-pool pattern.
- Each option should have player-facing name text, a short gameplay description, a how-to-use note, a level requirement, a resource/cost if any, and tags for passive, action, bonus action, reaction, spell, rider, or summon.
- The UI should support dropdown selection for large-description choices and collapsed detail text after selection.
- Options should be grouped in inspection and ability menus by class feature, subclass feature, spellbook, and favorites.
- Avoid creating one-off UI flows for every subclass unless a subclass truly needs a unique interaction.

## 6. Balance Notes

Potential strongest:

- Battle Master, because many maneuvers can solve many situations.
- Moon Druid, if Wild Shape HP is too generous.
- Evocation Wizard, if area damage can avoid ally cost.
- Vengeance Paladin, if mark plus smite stacks too hard.
- Gloom Stalker and Assassin, if first-turn burst deletes bosses.

Potential weakest:

- Bard if Bardic Inspiration remains only reactive and not subclass-shaped.
- Thief if item/action utility is not valuable enough.
- Land Druid if land choices are only spell list expansion.
- Great Old One if charm/control is too simplified.
- Totem Warrior if totem choices remain vague/passive.

Needs resource limits:

- Extra attacks.
- Party-wide buffs.
- Area damage.
- Reaction defenses that can block attacks.
- Kill-trigger temp HP or spell point recovery.
- Summon and companion allies, especially if they act every round.
- Charm/domination effects that turn enemy actions against other monsters.
- Counterspell-style interrupts that can cancel boss abilities.
- Polymorph/shapechange forms with large HP buffers.
- Any feature that improves smite, sneak attack, or spell damage.

Needs cooldowns:

- Bard songs.
- Paladin oath auras.
- Warlock curse movement.
- Ranger multiattack/volley.
- Monk control flurries.
- Wizard overchannel.
- Druid spirit totems.
- Domination/charm effects.
- Counterspell-style interrupts.
- Strong polymorph/shapechange forms.

Needs simplified UI:

- Battle Master maneuvers.
- Bard flourishes/songs.
- Totem choices.
- Land Druid terrain choices.
- Warlock invocations/pacts.
- Wizard Portent.
- Shepherd spirit totems.
- Pet/summon behavior selection.
- Polymorph/shapechange form selection.
- Bard song and inspiration-use selection.
- Large data-driven option pools.

Build as foundation before dependent subclasses:

- AI allies for summons, companions, undead thralls, and specters.
- Simple pet/summon scaling.
- Charm/domination allegiance changes with boss-safe fallback effects.
- Counterspell and spell-interrupt reaction prompts.
- Difficult terrain.
- Polymorph/shapechange using Wild Shape-style form replacement.
- Shared data-driven option pools.

Do not build:

- Mounted combat.
- Illusion systems.
- Weather and ecology simulation.
- Full tabletop wizard preparation or spellbook management.
- Broad social encounter systems as subclass mechanics.

Easiest to implement first:

- Champion.
- Berserker.
- Zealot.
- Life Cleric.
- War Cleric.
- Hunter Ranger.
- Assassin Rogue.
- Thief Rogue.
- Draconic Sorcerer.
- Fiend Warlock.
- Evocation Wizard.
- Open Hand Monk.

Easiest after foundation systems:

- Beast Master after AI allies and pet scaling.
- Shepherd after AI allies and aura cleanup.
- Necromancy after AI allies and undead profiles.
- Hexblade after specter AI ally support.
- Great Old One after charm/domination.
- Arcane Trickster, Abjuration Wizard, and Monster Slayer after counterspell/interrupt prompts.

## 7. Recommended Implementation Order

Foundation pass:

1. Shared data-driven option pools for maneuvers, runes, invocations, metamagic, songs, domains, land themes, and similar choices.
2. AI allied tokens for pets and summons, using melee attacker and ranged-kiter behavior profiles first.
3. Simple pet/summon scaling by proficiency bonus, owner level band, owner ability modifier, or class level.
4. Reaction interrupt framework for counterspell-like features, Spell Thief, Monster Slayer, and anti-magic subclass tools.
5. Short-duration charm/domination with boss-safe fallback effects.
6. Difficult terrain as a clear movement-cost tile/area property.
7. Polymorph and shapechange using Wild Shape-style form replacement.

First pass:

1. Fighter: Champion, Battle Master, Eldritch Knight.
2. Rogue: Thief, Assassin, Arcane Trickster.
3. Cleric: Life, Tempest, War.
4. Barbarian: Berserker, Totem Warrior, Zealot.
5. Ranger: Hunter, Beast Master, Gloom Stalker.
6. Wizard: Evocation, Necromancy, Divination.
7. Paladin: Devotion, Vengeance, Ancients.
8. Druid: Moon, Land, Shepherd.
9. Warlock: Fiend, Hexblade, Great Old One.
10. Sorcerer: Draconic Bloodline, Wild Magic, Divine Soul.
11. Monk: Open Hand, Shadow, Drunken Master.
12. Bard: Lore, Valor, Swords.

Reasoning:

- Fighter and Barbarian already have subclass patterns.
- Rogue, Cleric, Ranger, and Paladin can reuse weapon riders, marks, healing, Channel Divinity, and spell points.
- Wizard/Sorcerer/Warlock mostly need spell-list and resource tweaks.
- Druid is strong; Shepherd becomes more practical after AI ally support.
- Bard should be designed carefully so it becomes a tactical support caster rather than a weak Wizard.
- Monk needs ki expansion but can mostly reuse existing bonus-action ability patterns.
- Beast Master, Shepherd, Necromancy, Hexblade, and other pet/summon subclasses should follow the AI ally foundation instead of receiving one-off companion logic.
- Great Old One and similar control subclasses should follow the shared charm/domination foundation.
- Arcane Trickster, Monster Slayer, Abjuration Wizard, and other anti-magic subclasses should follow the shared reaction interrupt foundation.

## 8. Optional Expansion Notes

Subclasses already present or clearly planned:

- Fighter: Arcane Archer, Banneret, Battle Master, Cavalier, Champion, Echo Knight, Eldritch Knight, Psi Warrior, Rune Knight, Samurai.
- Barbarian: Ancestral Guardian, Battlerager, Beast, Berserker, Giant, Storm Herald, Totem Warrior, Wild Magic, Zealot.

Suggested handling:

- Keep all current “Full” experimental subclasses admin-gated until tested.
- Normalize Fighter/Barbarian subclass features to 3/6/10/14/18 before expanding other classes too far.
- For existing subclasses with original 7/15 features, move or split them into 6/14 equivalents.
- Add level 18 capstones to Barbarian paths that currently end at 14.

## 9. No Implementation Performed

No live class data was changed.
No spells were changed.
No UI was changed.
No balance values were changed.
No mechanics were implemented.

Only this design suggestion log was changed.
