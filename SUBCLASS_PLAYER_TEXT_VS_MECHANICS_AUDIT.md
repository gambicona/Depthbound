# Subclass Player Text vs Mechanical Grants Audit

Source scope: implementation source under `src/scripts`, the subclass suggestion log, level-up handling, combat hooks, and derived-stat hooks. Fighter and Barbarian admin-only `Full ...` subclasses are excluded.

This version distinguishes raw subclass data from hard-coded runtime hooks, especially reaction prompts and passive combat/stat rules.

## Barbarian (3 subclasses)

Excluded admin/full subclasses: Full Path of the Ancestral Guardian, Full Path of the Battlerager, Full Path of the Beast, Full Path of the Berserker, Full Path of the Giant, Full Path of the Storm Herald, Full Path of the Totem Warrior, Full Path of Wild Magic, Full Path of the Zealot

### Path of the Berserker
- L3 says: Frenzy: While raging, make an extra weapon attack as a bonus action.
  Actual: Frenzy [bonusAction, 1/turn]: make one extra weapon attack
- L6 says: Mindless Rage: While raging, resist fear and control pressure with stronger saving throws.
  Actual: Mindless Rage [bonusAction, 1/shortRest]: selfStatus(saveBonus=4, durationRounds=3)
- L10 says: Intimidating Presence: Use raw menace to frighten or shake a visible enemy.
  Actual: Intimidating Presence [action, 1/shortRest]: targetStatus(attackBonus=-2, durationRounds=2)
- L14 says: Retaliation: When a nearby enemy damages you, strike back with your reaction.
  Actual: Retaliation [reaction, 1/turn]: reaction prompt when a melee enemy damages you: rolls a normal equipped-weapon attack with normal attack bonus and weapon damage.
- L18 says: Relentless Frenzy: Once per rest, push your frenzy into one more brutal burst of attacks.
  Actual: Relentless Frenzy [bonusAction, 1/shortRest]: make one extra weapon attack

### Path of the Totem Warrior
- L3 says: Totem Spirit: Choose Bear, Eagle, or Wolf to shape your Rage.
  Actual: Totem Surge [bonusAction, 1/shortRest]: selfStatus(tempHp=8, speedBonusFeet=10, attackBonus=1, durationRounds=2) ; choice count totems: 1 ; choice: pick 1 totem. hard-coded Bear: while raging, resist all non-psychic damage.
- L6 says: Aspect of the Beast: Your chosen totem adds stronger dungeon and combat support.
  Actual: Aspect of the Beast [bonusAction, 1/shortRest]: selfStatus(tempHp=8, speedBonusFeet=10, skillBonus=3, durationRounds=3)
- L10 says: Spirit Walker: Reveal nearby danger and mark the flow of the fight with spirit guidance.
  Actual: Spirit Walker [action, 1/shortRest]: reveal traps + attackBonus=1, durationRounds=3
- L14 says: Totemic Attunement: Your totem becomes a stronger battle stance for protecting, moving, or enabling allies.
  Actual: Totemic Attunement [bonusAction, 1/shortRest]: selfStatus(tempHp=12, speedBonusFeet=10, attackBonus=2, durationRounds=3)
- L18 says: Primal Avatar: Once per rest, empower all your totem gifts for a decisive fight.
  Actual: Primal Avatar [bonusAction, 1/longRest]: selfStatus(tempHp=20, speedBonusFeet=20, attackBonus=2, damageBonus=4, durationRounds=3)

### Path of the Zealot
- L3 says: Divine Fury: While raging, your first weapon hit each turn burns with radiant or necrotic power.
  Actual: hard-coded: while raging, first melee hit/turn adds 1d6 + floor(level/2) radiant.
- L6 says: Fanatical Focus: Divine conviction can turn around a failed saving throw.
  Actual: Fanatical Focus [none, 1/longRest]: selfStatus(saveBonus=5, expiresAtEndOfTurn=true) ; hard-coded: failed save can auto-spend Fanatical Focus for +5 save.
- L10 says: Zealous Presence: Rally the party with a battle cry that improves attacks and saves.
  Actual: Zealous Presence [bonusAction, 1/longRest]: partyStatus(attackBonus=2, saveBonus=2, durationRounds=2)
- L14 says: Rage Beyond Death: The first time you would fall while raging, divine fury can keep you standing.
  Actual: hard-coded: while raging, drops to 1 HP instead of falling.
- L18 says: Saint of Slaughter: Your divine fury burns brighter and your rally grants temporary HP.
  Actual: Saint of Slaughter [bonusAction, 1/longRest]: partyStatus(tempHp=12, attackBonus=2, saveBonus=2, durationRounds=3)

## Bard (3 subclasses)

### College of Lore
- Always on selection: expanded spell list fireball, spirit_guardians, shield.
- L3 says: Cutting Words: Spend Bardic Inspiration as a reaction-like curse to spoil an enemy's attack, damage, or focus.
  Actual: Cutting Words [reaction, 3/longRest, pool bardicInspiration]: reaction prompt when an enemy attack would hit a hero: spends Bardic Inspiration to subtract a bardic die from the attack.
- L6 says: Additional Magical Secrets: Learn extra combat spells from outside the normal bard list.
  Actual: Magical Secret [bonusAction, 1/longRest]: next-hit rider 2d6 force
- L10 says: Superior Inspiration: When your rhythm falters, regain a burst of confidence for your next important move.
  Actual: Superior Inspiration [bonusAction, 1/shortRest]: selfStatus(attackBonus=3, saveBonus=3, expiresAtEndOfTurn=true)
- L14 says: Peerless Skill: Spend inspiration on yourself to make a key attack, save, or dungeon check more reliable.
  Actual: Peerless Skill [bonusAction, 1/longRest, pool bardicInspiration]: selfStatus(attackBonus=4, saveBonus=4, skillBonus=4, expiresAtEndOfTurn=true)
- L18 says: Grand Secret: Once per rest, recover a deep reserve of spell points for your strongest stolen magic.
  Actual: Grand Secret [bonusAction, 1/longRest]: restore 8 spell points

### College of Valor
- L3 says: Combat Inspiration: Your inspiration can harden an ally and make their next hit stronger.
  Actual: Combat Inspiration [bonusAction, 3/longRest, pool bardicInspiration]: allyStatus(tempHp=6, weaponRider=true, damageBonus=4, damageType=damage, durationRounds=3)
- L6 says: Extra Attack: When you take the Attack action, attack twice instead of once.
  Actual: hard-coded: Attack action makes 2 attacks.
- L10 says: War Chant: As a bonus action, give the party temporary HP and a short attack bonus.
  Actual: War Chant [bonusAction, 1/shortRest]: partyStatus(tempHp=base:4,proficiencyMultiplier:1, attackBonus=1, durationRounds=2)
- L14 says: Battle Magic: After casting a bard spell, prepare a weapon strike empowered by the same rhythm.
  Actual: Battle Magic [bonusAction, 1/shortRest]: next-hit rider 2d8 force
- L18 says: Heroic Chorus: Your first inspiration in combat affects more allies.
  Actual: Heroic Chorus [action, 1/longRest]: partyStatus(tempHp=12, attackBonus=2, durationRounds=3)

### College of Swords
- L3 says: Blade Flourish: Spend inspiration to turn a weapon hit into damage plus defense, movement, or control.
  Actual: Blade Flourish [bonusAction, 3/longRest, pool bardicInspiration]: next-hit rider 1d8 slashing, distracted
- L6 says: Extra Attack: When you take the Attack action, attack twice instead of once.
  Actual: hard-coded: Attack action makes 2 attacks.
- L10 says: Flourish Mastery: Your flourish die becomes stronger and you can prepare a reliable flourish more often.
  Actual: Flourish Mastery [bonusAction, 1/shortRest]: next-hit rider 1d10 slashing, distracted
- L14 says: Master's Flourish: Once per turn, prepare a smaller flourish without spending Bardic Inspiration.
  Actual: Master's Flourish [bonusAction, 1/turn]: next-hit rider 1d6 slashing
- L18 says: Finale: Once per rest, perform a decisive flourish that boosts your blade work and footwork.
  Actual: Finale [bonusAction, 1/longRest]: selfStatus(acBonus=2, speedBonusFeet=10, damageBonus=3, durationRounds=3)

## Cleric (3 subclasses)

### Life Domain
- Always on selection: expanded spell list aid, cure_wounds, mass_healing_word.
- L3 says: Disciple of Life: When you cast a healing spell, it restores extra HP equal to 2 + the spell's level.
  Actual: hard-coded: leveled healing spells heal +2 + spell level.
- L6 says: Preserve Life: As an action once per short rest, heal wounded party members for 5 times your cleric level HP each.
  Actual: Preserve Life [action, 1/shortRest]: party heal levelMultiplier:5 HP
- L10 says: Blessed Healer: When you heal an ally with a spell, you also recover a smaller amount of HP.
  Actual: hard-coded: healing an ally with a leveled spell heals caster for 2 + spell level.
- L14 says: Supreme Healing: Once per rest, flood the party with extra healing and temporary HP.
  Actual: Supreme Healing [action, 1/longRest]: party heal base:10,levelMultiplier:2 HP + tempHp=base:4,proficiencyMultiplier:2, durationRounds=3
- L18 says: Beacon of Life: Once per rest, surround the party with powerful healing light.
  Actual: Beacon of Life [action, 1/longRest]: party heal 24 HP + tempHp=10, durationRounds=3

### Tempest Domain
- Always on selection: expanded spell list thunderwave, shatter, call_lightning.
- L3 says: Wrath of the Storm: When danger closes in, answer with a burst of lightning or thunder.
  Actual: Wrath of the Storm [reaction, 1/shortRest]: reaction prompt after taking damage from a visible enemy: deals listed lightning damage and rider status to the attacker.
- L6 says: Destructive Wrath: Channel Divinity turns thunder or lightning into a reliable burst.
  Actual: Destructive Wrath [action, 1/shortRest]: AOE radius 3: 3d8 thunder, hamstrung
- L10 says: Thunderbolt Strike: Storm power batters enemies, slowing or knocking them off balance.
  Actual: Thunderbolt Strike [bonusAction, 1/shortRest]: next-hit rider 2d8 thunder, prone
- L14 says: Storm Shield: Briefly grant the party resistance against lightning and thunder.
  Actual: Storm Shield [bonusAction, 1/shortRest]: partyStatus(resistances=lightning/thunder, durationRounds=3)
- L18 says: Avatar of the Tempest: A short storm aura damages and hinders nearby enemies.
  Actual: Avatar of the Tempest [bonusAction, 1/longRest]: selfStatus(resistances=lightning/thunder, damageBonus=5, durationRounds=3)

### War Domain
- Always on selection: expanded spell list divine_favor, spiritual_weapon, spirit_guardians.
- L3 says: War Priest: Make a bonus weapon strike a limited number of times.
  Actual: War Priest Strike [bonusAction, 3/longRest]: make one extra weapon attack
- L6 says: Guided Strike: Channel Divinity steadies an important attack.
  Actual: Guided Strike [bonusAction, 1/shortRest]: selfStatus(attackBonus=8, expiresAtEndOfTurn=true)
- L10 says: War God's Blessing: Bless an ally's next strike with divine accuracy.
  Actual: War God's Blessing [bonusAction, 1/shortRest]: allyStatus(attackBonus=6, expiresAtEndOfTurn=true)
- L14 says: Divine Strike: Prepare a radiant weapon blow once per turn.
  Actual: Divine Strike [bonusAction, 1/turn]: next-hit rider 2d8 radiant
- L18 says: Avatar of Battle: You resist weapon punishment and inspire the party's offense.
  Actual: Avatar of Battle [bonusAction, 1/longRest]: selfStatus(resistances=bludgeoning/piercing/slashing, damageBonus=4, durationRounds=3)

## Druid (3 subclasses)

### Circle of the Moon
- L3 says: Combat Wild Shape: Wild Shape is your combat form, giving you a front-line HP buffer and natural attacks.
  Actual: Combat Wild Shape [bonusAction, 1/shortRest, pool wildShape]: selfStatus(tempHp=base:4,levelMultiplier:1, durationRounds=3)
- L6 says: Primal Strikes: Your beast-form pressure becomes more dangerous.
  Actual: Primal Strikes [bonusAction, 1/shortRest]: next-hit rider 1d8 force
- L10 says: Elemental Shape: Your form can take on elemental resistance and damage.
  Actual: Elemental Shape [bonusAction, 1/shortRest]: selfStatus(resistances=fire/cold/lightning, damageBonus=4, durationRounds=3)
- L14 says: Thousand Forms: Shift defensively to regain HP and adapt under pressure.
  Actual: Thousand Forms [bonusAction, 1/longRest]: self heal base:6,levelMultiplier:2 HP
- L18 says: Archdruid Shape: Recover a Wild Shape rhythm and keep spellcasting pressure while transformed.
  Actual: Archdruid Shape [bonusAction, 1/shortRest]: restore 6 spell points

### Circle of the Land
- Always on selection: expanded spell list spike_growth, call_lightning, barkskin.
- L3 says: Natural Recovery: Once per long rest, recover spell points equal to 2 times your druid level.
  Actual: Natural Recovery [none, 1/longRest]: restore levelMultiplier:2 spell points
- L6 says: Circle Spells: Learn extra land-themed combat spells.
  Actual: mechanic is granted through the subclass expanded spell list at subclass selection, not as a separate level-6 button.
- L10 says: Nature's Ward: Ignore difficult terrain while moving through the dungeon.
  Actual: hard-coded: ignores difficult-terrain movement cost.
- L14 says: Nature's Sanctuary: Enemies struggle to strike you after nature magic.
  Actual: Nature's Sanctuary [bonusAction, 1/shortRest]: selfStatus(acBonus=3, durationRounds=3)
- L18 says: Elder Land: Your land magic refills enough power to keep casting through a long fight.
  Actual: Elder Land [bonusAction, 1/longRest]: restore 8 spell points

### Circle of the Shepherd
- L3 says: Spirit Totem: As a bonus action once per short rest, give the party temporary HP equal to 5 + your druid level and +1 to attack rolls for 3 rounds.
  Actual: Spirit Totem [bonusAction, 1/shortRest]: partyStatus(tempHp=base:5,levelMultiplier:1, attackBonus=1, durationRounds=3)
- L6 says: Summon Spirit Ally: Call a temporary melee spirit for 4 rounds; it acts on its own beside the party and scales with your level.
  Actual: Summon Spirit Ally [action, 1/shortRest]: summon Spirit Beast (melee, 4 rounds; fallback strike/THP if no space)
- L10 says: Guardian Spirit: Your spirit aura restores a small amount of party endurance.
  Actual: Guardian Spirit [bonusAction, 1/shortRest]: party heal base:3,proficiencyMultiplier:2 HP + tempHp=proficiencyMultiplier:1, durationRounds=2
- L14 says: Faithful Summons: When the fight turns dangerous, call stronger spirit help.
  Actual: Faithful Summons [action, 1/longRest]: summon Faithful Spirit (melee, 5 rounds; fallback strike/THP if no space)
- L18 says: Great Spirit: Your spirit totem becomes a stronger party-wide battle blessing.
  Actual: Great Spirit [bonusAction, 1/shortRest]: partyStatus(tempHp=base:8,levelMultiplier:1, attackBonus=2, durationRounds=3)

## Fighter (3 subclasses)

Excluded admin/full subclasses: Full Arcane Archer, Full Banneret, Full Battle Master, Full Cavalier, Full Champion, Full Echo Knight, Full Eldritch Knight, Full Psi Warrior, Full Rune Knight, Full Samurai

### Champion
- L3 says: Improved Critical: Your weapon attacks land critical hits more often, starting on a 19 or 20.
  Actual: hard-coded: weapon crit threshold becomes 19-20.
- L6 says: Remarkable Athlete: Your physical training helps strength, dexterity, and constitution checks when you are not already trained.
  Actual: hard-coded: untrained STR/DEX/CON skill checks add half proficiency rounded up.
- L10 says: Additional Fighting Style: Broaden your martial training with one more fighting style.
  Actual: level-up choice: choose an Additional Fighting Style.
- L14 says: Superior Critical: Your weapon attacks become even more lethal, critting on an 18, 19, or 20.
  Actual: hard-coded: weapon crit threshold becomes 18-20.
- L18 says: Survivor: When you are badly hurt, you recover HP at the start of your turns and keep fighting through the pain.
  Actual: hard-coded: at turn start below/equal half HP, heal 5 + CON mod.

### Battle Master
- L3 says: Combat Superiority: Gain superiority dice and spend them on chosen maneuvers.
  Actual: Precision Attack [bonusAction, 4/shortRest, pool superiority]: next-hit rider 1d8 scaling sides L10=d10/L18=d12 damage ; Menacing Attack [bonusAction, 4/shortRest, pool superiority]: next-hit rider 1d8 scaling sides L10=d10/L18=d12 damage, frightened ; Trip Attack [bonusAction, 4/shortRest, pool superiority]: next-hit rider 1d8 scaling sides L10=d10/L18=d12 damage, prone ; choice count maneuvers: 3 ; choice: choose 3 maneuvers; only chosen superiority abilities are usable.
- L6 says: Tactical Expansion: Learn another maneuver and gain a wider set of tactical answers.
  Actual: Rally [bonusAction, 4/shortRest, pool superiority]: allyStatus(tempHp=8, attackBonus=1, durationRounds=3) ; choice count maneuvers: 4 ; choice: known maneuvers increase to 4.
- L10 says: Improved Combat Superiority: Your superiority dice become d10s, so damage and accuracy maneuvers roll a larger die.
  Actual: Riposte [reaction, 5/shortRest, pool superiority]: reaction prompt when a melee enemy misses you: rolls a normal equipped-weapon attack and adds superiority die damage on hit. ; choice count maneuvers: 5 ; choice: known maneuvers increase to 5; superiority die abilities scale to d10 and uses to 5.
- L14 says: Relentless: If combat begins and you are empty, recover one superiority die.
  Actual: hard-coded: when combat starts and a tracked superiority ability is spent out, Relentless restores one use.
- L18 says: Master Tactician: Your superiority dice become d12s and you can sustain tactical pressure longer in hard fights.
  Actual: superiority die abilities scale to d12 and uses to 6.

### Eldritch Knight
- Always on selection: spell list magic-missile, shield, burning-hands, sleep, grease, scorching-ray, web, misty-step, shatter, lightning-bolt, fireball, haste; cantrip list mage-hand, blade-ward, fire-bolt, mind-sliver, thunderclap, chill-touch, acid-splash, booming-blade, frostbite, green-flame-blade, ray-of-frost, shocking-grasp, toll-the-dead.
- Always on selection: casterType third, ability int, spell points by level present.
- L3 says: Spellcasting: Learn wizard cantrips and combat spells, giving your fighter ranged magic, defenses, and area control.
  Actual: level-up choice: choose 2 wizard cantrips and 3 wizard spells; gains third-caster spell points and INT spellcasting.
- L6 says: War Magic: After a cantrip or quick spell setup, empower your next weapon hit.
  Actual: War Magic [bonusAction, 1/turn]: next-hit rider 1d8 force
- L10 says: Eldritch Strike: Your weapon hits can make a target more vulnerable to your next spell.
  Actual: Eldritch Strike [bonusAction, 1/shortRest]: next-hit rider 2d6 force, shaken ; level-up choice: +1 EK cantrip.
- L14 says: Arcane Charge: When you surge into action, reposition in a flash of arcane force.
  Actual: hard-coded: using Action Surge applies Arcane Charge, a +30 ft teleport-like movement burst until end of turn.
- L18 says: Improved War Magic: After casting a leveled spell, empower a weapon attack with stronger arcane force.
  Actual: Improved War Magic [bonusAction, 1/shortRest]: next-hit rider 3d8 force

## Monk (3 subclasses)

### Way of the Open Hand
- L3 says: Open Hand Technique: Your strikes can knock prone, shove, or stagger.
  Actual: Open Hand Technique [bonusAction, 2/shortRest, pool ki]: next-hit rider 1d6 bludgeoning, prone
- L6 says: Wholeness of Body: As an action once per long rest, heal yourself for 3 times your monk level HP.
  Actual: Wholeness of Body [action, 1/longRest]: self heal levelMultiplier:3 HP
- L10 says: Tranquility: Begin a hard exchange with defensive focus and temporary HP.
  Actual: Tranquility [bonusAction, 1/shortRest]: selfStatus(tempHp=base:4,levelMultiplier:1, acBonus=2, durationRounds=3)
- L14 says: Quivering Palm: Prepare a devastating delayed strike.
  Actual: Quivering Palm [bonusAction, 1/longRest]: next-hit rider 5d10 force
- L18 says: Perfect Body: Recover your rhythm and sharpen Open Hand control for one more decisive turn.
  Actual: Perfect Body [bonusAction, 1/longRest]: selfStatus(acBonus=2, weaponRider=true, damageBonus=8, damageType=force, durationRounds=3)

### Way of Shadow
- L3 says: Shadow Arts: Spend ki on shadow tricks that hinder enemies and prepare a safe attack.
  Actual: Shadow Arts [bonusAction, 2/shortRest, pool ki]: targetStatus(acBonus=-2, attackBonus=-2, durationRounds=1)
- L6 says: Shadow Step: Teleport-like movement gives advantage on your next strike.
  Actual: Shadow Step [bonusAction, 2/shortRest, pool ki]: selfStatus(speedBonusFeet=20, attackAdvantage=true, expiresAtEndOfTurn=true)
- L10 says: Cloak of Shadows: Become harder to hit until you strike.
  Actual: Cloak of Shadows [bonusAction, 2/shortRest, pool ki]: selfStatus(acBonus=3, attackAdvantage=true, expiresAtEndOfTurn=true)
- L14 says: Opportunist: Prepare a reaction-like punish when an ally exposes an enemy.
  Actual: Opportunist [bonusAction, 1/turn, pool ki]: next-hit rider 3d6 necrotic
- L18 says: Living Shadow: Become a short-lived shadow battle-form.
  Actual: Living Shadow [bonusAction, 1/longRest]: selfStatus(acBonus=3, speedBonusFeet=20, damageBonus=4, durationRounds=3)

### Way of the Drunken Master
- L3 says: Drunken Technique: After quick strikes, gain movement and defense.
  Actual: Drunken Technique [bonusAction, 2/shortRest, pool ki]: selfStatus(speedBonusFeet=10, acBonus=2, weaponRider=true, damageBonus=4, damageType=bludgeoning, expiresAtEndOfTurn=true)
- L6 says: Tipsy Sway: Slip away from a bad exchange and turn your stumble into defense.
  Actual: Tipsy Sway [reaction, 2/shortRest, pool ki]: reaction prompt when an attack would hit you: applies the listed AC/rider status immediately, possibly turning the hit into a miss.
- L10 says: Drunkard's Luck: Cancel a bad moment with a burst of lucky momentum.
  Actual: Drunkard's Luck [bonusAction, 2/shortRest, pool ki]: selfStatus(attackBonus=4, saveBonus=4, expiresAtEndOfTurn=true)
- L14 says: Intoxicated Frenzy: Turn a crowded fight into multiple strikes.
  Actual: Intoxicated Frenzy [action, 1/longRest]: AOE radius 2: 4d6 bludgeoning, distracted
- L18 says: Impossible Rhythm: Once per rest, gain both offensive and defensive momentum in the same round.
  Actual: Impossible Rhythm [bonusAction, 1/longRest]: selfStatus(speedBonusFeet=20, acBonus=3, weaponRider=true, damageBonus=10, damageType=bludgeoning, durationRounds=2)

## Paladin (3 subclasses)

### Oath of Devotion
- Always on selection: expanded spell list bless, shield_of_faith, spirit_guardians.
- L3 says: Sacred Weapon: Bless your weapon for better accuracy and radiant pressure.
  Actual: Sacred Weapon [bonusAction, 1/shortRest]: selfStatus(attackBonus=3, damageBonus=3, durationRounds=3)
- L6 says: Aura of Devotion: Nearby allies resist fear and charm-like pressure through your steady faith.
  Actual: Aura of Devotion [bonusAction, 1/shortRest]: partyStatus(saveBonus=2, durationRounds=3)
- L10 says: Purifying Smite: Prepare a smite that also cleanses pressure from the fight.
  Actual: Purifying Smite [bonusAction, 1/shortRest]: next-hit rider 2d8 radiant, shaken
- L14 says: Holy Nimbus: Radiant light damages nearby enemies and boosts divine defense.
  Actual: Holy Nimbus [action, 1/longRest]: AOE radius 3: 3d8 radiant, frightened
- L18 says: Beacon of Devotion: Your sacred weapon and aura become a stronger party-wide defensive pulse.
  Actual: Beacon of Devotion [action, 1/longRest]: AOE radius 3: 4d8 radiant, frightened

### Oath of Vengeance
- Always on selection: expanded spell list hunters_mark, misty_step, haste.
- L3 says: Vow of Enmity: Mark one enemy for advantage and extra damage.
  Actual: Vow of Enmity [bonusAction, 1/shortRest]: selfStatus(attackAdvantage=true, weaponRider=true, damageBonus=8, damageType=radiant, expiresAtEndOfTurn=true)
- L6 says: Relentless Avenger: After committing to your prey, move faster and keep pressure on them.
  Actual: Relentless Avenger [bonusAction, 1/shortRest]: selfStatus(speedBonusFeet=10, weaponRider=true, damageBonus=4, damageType=radiant, expiresAtEndOfTurn=true)
- L10 says: Soul of Vengeance: When a melee enemy damages you, answer with a radiant reaction strike.
  Actual: Soul of Vengeance [reaction, 1/shortRest]: reaction prompt when a melee enemy damages you: rolls a normal equipped-weapon attack and adds the listed radiant damage on hit.
- L14 says: Avenging Angel: Become a frightening radiant avenger.
  Actual: Avenging Angel [action, 1/longRest]: AOE radius 3: 3d8 radiant, frightened
- L18 says: Final Judgment: Your first smite-like strike against your prey becomes especially punishing.
  Actual: Final Judgment [bonusAction, 1/longRest]: next-hit rider 4d8 radiant, marked

### Oath of the Ancients
- Always on selection: expanded spell list ensnaring_strike, barkskin, moonbeam.
- L3 says: Nature's Wrath: Restraining vines pin or slow an enemy.
  Actual: Nature's Wrath [action, 1/shortRest]: single-target damage 2d6 piercing, restrained
- L6 says: Aura of Warding: Give the party a short protective aura against spell-like harm.
  Actual: Aura of Warding [bonusAction, 1/shortRest]: partyStatus(saveBonus=2, resistances=force, durationRounds=3)
- L10 says: Undying Sentinel: Once per rest, refuse to fall by drawing on ancient endurance.
  Actual: Undying Sentinel [bonusAction, 1/longRest]: selfStatus(tempHp=base:10,levelMultiplier:1, durationRounds=3)
- L14 says: Elder Champion: Take on a regenerative nature form.
  Actual: Elder Champion [bonusAction, 1/longRest]: selfStatus(tempHp=15, resistances=necrotic/poison, damageBonus=4, durationRounds=3)
- L18 says: Ancient Ward: Your ancient aura grows stronger and Nature's Wrath can spread pressure.
  Actual: Ancient Ward [action, 1/longRest]: AOE radius 3: 4d6 piercing, restrained

## Ranger (3 subclasses)

### Hunter
- L3 says: Hunter's Prey: Your next hit deals extra damage and can slow the target.
  Actual: Hunter's Prey [bonusAction, 1/turn]: next-hit rider 1d8 damage, hamstrung
- L6 says: Defensive Tactics: Brace against your chosen prey with a short defensive stance.
  Actual: Defensive Tactics [bonusAction, 1/shortRest]: selfStatus(acBonus=2, saveBonus=2, durationRounds=3)
- L10 says: Multiattack Defense: After a dangerous exchange, harden yourself against repeat attacks.
  Actual: Multiattack Defense [reaction, 1/shortRest]: reaction prompt after taking damage: applies the listed AC bonus for follow-up attacks.
- L14 says: Volley: Spread damage through clustered enemies.
  Actual: Volley [action, 1/shortRest]: AOE radius 4: 3d6 piercing
- L18 says: Apex Predator: Your first focused strike in a hard fight deals major bonus damage.
  Actual: Apex Predator [bonusAction, 1/shortRest]: next-hit rider 4d8 damage, marked

### Beast Master
- L3 says: Call Beast Companion: Call a loyal companion that fights beside you and grows stronger as you level.
  Actual: Call Beast Companion [action, 1/shortRest]: summon Beast Companion (melee, 99 rounds; fallback strike/THP if no space)
- L6 says: Coordinated Attack: Command the companion and empower your next hit against the same prey.
  Actual: Coordinated Command [bonusAction, 1/turn]: next-hit rider 1d8 piercing, marked
- L10 says: Bestial Defense: Your bond gives you temporary HP and defensive confidence.
  Actual: Bestial Defense [bonusAction, 1/shortRest]: selfStatus(tempHp=base:4,levelMultiplier:1, acBonus=1, durationRounds=3)
- L14 says: Storm of Claws: Command a brutal companion strike that hinders the enemy.
  Actual: Storm of Claws [action, 1/shortRest]: single-target damage 4d6 slashing, prone
- L18 says: Primal Bond: Your companion bond reaches its peak, improving commands and durability.
  Actual: Primal Bond [bonusAction, 1/shortRest]: selfStatus(attackBonus=2, acBonus=2, weaponRider=true, damageBonus=8, damageType=piercing, durationRounds=2)

### Gloom Stalker
- L3 says: Dread Ambusher: Start combat with speed, accuracy, and extra damage.
  Actual: Dread Ambusher [bonusAction, 1/shortRest]: selfStatus(speedBonusFeet=10, attackBonus=2, weaponRider=true, damageBonus=6, damageType=psychic, expiresAtEndOfTurn=true)
- L6 says: Umbral Defense: Become harder to hit before you fully reveal yourself.
  Actual: Umbral Defense [bonusAction, 1/shortRest]: selfStatus(acBonus=2, speedBonusFeet=10, durationRounds=2)
- L10 says: Iron Mind: Steady your mind against fear and control.
  Actual: Iron Mind [bonusAction, 1/shortRest]: selfStatus(saveBonus=3, durationRounds=3)
- L14 says: Stalker's Flurry: Recover from a miss by preparing another strike.
  Actual: Stalker's Flurry [bonusAction, 1/turn]: selfStatus(attackAdvantage=true, weaponRider=true, damageBonus=5, damageType=damage, expiresAtEndOfTurn=true)
- L18 says: Shadow Apex: Your opening strike can terrify and wound a priority target.
  Actual: Shadow Apex [bonusAction, 1/shortRest]: next-hit rider 3d8 psychic, frightened

## Rogue (3 subclasses)

### Thief
- L3 says: Fast Hands: Use a quick trick as a bonus action to distract or hinder a foe.
  Actual: Fast Hands Trick [bonusAction, 1/turn]: single-target damage 1d4 bludgeoning, distracted
- L6 says: Second-Story Work: Move like a dungeon climber, gaining speed and better mobility checks for a short burst.
  Actual: Second-Story Work [bonusAction, 1/shortRest]: selfStatus(speedBonusFeet=10, skillBonus=3, durationRounds=3)
- L10 says: Supreme Sneak: Set up a careful approach that makes your next strike much more reliable.
  Actual: Supreme Sneak [bonusAction, 1/shortRest]: selfStatus(attackAdvantage=true, speedBonusFeet=10, expiresAtEndOfTurn=true)
- L14 says: Use Magic Device: Trigger a stolen magical trick even without being a spellcaster.
  Actual: Use Magic Device [action, 1/longRest]: AOE radius 3: 4d6 force, shaken
- L18 says: Thief's Reflexes: At the start of combat, gain a burst of speed and advantage.
  Actual: Thief's Reflexes [none, 1/longRest]: selfStatus(speedBonusFeet=20, attackAdvantage=true, expiresAtEndOfTurn=true)

### Assassin
- L3 says: Assassinate: Your first strike against an unprepared or marked enemy hits harder.
  Actual: Assassinate [bonusAction, 1/shortRest]: next-hit rider 2d6 piercing, shaken
- L6 says: Ambush Preparation: Prepare a poisoned opening for your next Sneak Attack.
  Actual: Ambush Preparation [bonusAction, 2/longRest]: next-hit rider 2d6 poison, enfeebled
- L10 says: Marked Impostor: Mark a target and make your next hit shake their confidence.
  Actual: Marked Impostor [bonusAction, 1/shortRest]: next-hit rider 2d8 psychic, shaken
- L14 says: Death Strike: Once per rest, prepare a devastating strike for a priority enemy.
  Actual: Death Strike [bonusAction, 1/longRest]: next-hit rider 5d8 piercing
- L18 says: Perfect Ambush: If you open cleanly, your next strike becomes brutally reliable.
  Actual: Perfect Ambush [bonusAction, 1/shortRest]: selfStatus(attackAdvantage=true, weaponRider=true, damageBonus=12, damageType=piercing, expiresAtEndOfTurn=true)

### Arcane Trickster
- Always on selection: expanded spell list sleep, grease, hold_person, misty_step, web; expanded cantrip list mage-hand, mind-sliver, blade-ward.
- Always on selection: casterType third, ability int, spell points by level present.
- L3 says: Trickster Spellcasting: Learn wizard cantrips and spells focused on control, movement, and debuffs.
  Actual: level-up choice: choose 2 subclass cantrips from the trickster list and 3 spells from the trickster spell list; gains third-caster spell points and INT spellcasting.
- L6 says: Mage Hand Trickery: Distract a target at range to help set up Sneak Attack.
  Actual: Mage Hand Trickery [bonusAction, 1/turn]: targetStatus(acBonus=-2, expiresAtEndOfTurn=true)
- L10 says: Magical Ambush: Your next spell or strike is harder for the enemy to resist after a setup.
  Actual: Magical Ambush [bonusAction, 1/shortRest]: selfStatus(attackBonus=3, saveDcBonus=2, expiresAtEndOfTurn=true)
- L14 says: Versatile Trickster: Distract a target as a quick setup for Sneak Attack.
  Actual: Versatile Trickster [bonusAction, 1/turn]: targetStatus(acBonus=-3, expiresAtEndOfTurn=true)
- L18 says: Spell Thief: Use a reaction-style interrupt to blunt enemy spell-like powers.
  Actual: Spell Thief [reaction, 1/shortRest]: ready spell interrupt + restore 3 SP

## Sorcerer (3 subclasses)

### Draconic Bloodline
- L3 says: Draconic Resilience: Your draconic blood gives you temporary toughness and a sturdier battle stance.
  Actual: Draconic Resilience [bonusAction, 1/shortRest]: selfStatus(tempHp=base:3,levelMultiplier:1, acBonus=1, durationRounds=3)
- L6 says: Elemental Affinity: Empower spells and attacks with your draconic element.
  Actual: Elemental Affinity [bonusAction, 1/shortRest]: next-hit rider 2d6 fire
- L10 says: Dragon Wings: Burst across the battlefield with draconic movement and defense.
  Actual: Dragon Wings [bonusAction, 1/shortRest]: selfStatus(speedBonusFeet=20, acBonus=2, durationRounds=2)
- L14 says: Draconic Presence: Frighten nearby enemies with ancient majesty.
  Actual: Draconic Presence [action, 1/longRest]: AOE radius 3: 2d6 psychic, frightened
- L18 says: Dragon Avatar: Become a short-lived avatar of your draconic bloodline.
  Actual: Dragon Avatar [bonusAction, 1/longRest]: selfStatus(resistances=fire, damageBonus=5, durationRounds=3)

### Wild Magic
- L3 says: Wild Surge: Casting and subclass powers can spark a random combat boon.
  Actual: Wild Sorcery Surge [bonusAction, 1/shortRest]: roll random wild-surge combat boon
- L6 says: Bend Luck: Spend sorcery as a reaction to help an ally turn a near miss or failed save into success.
  Actual: Bend Luck [reaction, 3/longRest, pool metamagic]: reaction prompt when an ally narrowly misses an attack or fails a save: adds +3 if that can turn it into success.
- L10 says: Controlled Chaos: Trigger a more reliable wild surge when you need chaos to help.
  Actual: Controlled Chaos [bonusAction, 1/shortRest]: roll random wild-surge combat boon
- L14 says: Spell Bombardment: Push your next damaging hit into a bigger chaotic burst.
  Actual: Spell Bombardment [bonusAction, 1/shortRest]: next-hit rider 3d8 force
- L18 says: Chaos Mastery: Choose a decisive surge and recover sorcery power.
  Actual: Chaos Mastery [bonusAction, 1/longRest]: restore 8 spell points

### Divine Soul
- Always on selection: expanded spell list cure_wounds, healing_word, guiding_bolt, aid.
- L3 says: Divine Magic: Learn sacred spells alongside sorcerer magic.
  Actual: mechanic is granted through expanded sacred spell access at subclass selection, not as a separate level-3 button.
- L6 says: Empowered Healing: Boost a healing moment with divine sorcery.
  Actual: Empowered Healing [bonusAction, 1/shortRest]: party heal base:4,levelMultiplier:1 HP
- L10 says: Otherworldly Wings: Move with radiant grace and protect yourself briefly.
  Actual: Otherworldly Wings [bonusAction, 1/shortRest]: selfStatus(speedBonusFeet=20, acBonus=2, weaponRider=true, damageBonus=5, damageType=radiant, durationRounds=2)
- L14 says: Unearthly Recovery: Recover a large amount of HP when badly hurt.
  Actual: Unearthly Recovery [bonusAction, 1/longRest]: self heal 40 HP
- L18 says: Divine Conduit: Recover spell power and bless the party with temporary HP.
  Actual: Divine Conduit [action, 1/longRest]: partyStatus(tempHp=12, saveBonus=2, durationRounds=3)

## Warlock (3 subclasses)

### The Fiend
- Always on selection: expanded spell list burning_hands, fireball, scorching_ray.
- L3 says: Dark One's Blessing: Feed on victory, gaining temporary HP after a kill or as an infernal combat burst.
  Actual: Dark One's Blessing [bonusAction, 1/shortRest]: selfStatus(tempHp=base:2,levelMultiplier:1, durationRounds=3)
- L6 says: Dark One's Own Luck: Add infernal luck to an important roll.
  Actual: Dark One's Own Luck [bonusAction, 1/shortRest]: selfStatus(attackBonus=4, saveBonus=4, expiresAtEndOfTurn=true)
- L10 says: Fiendish Resilience: Briefly resist common dungeon damage with infernal toughness.
  Actual: Fiendish Resilience [bonusAction, 1/shortRest]: selfStatus(resistances=fire/poison, durationRounds=3)
- L14 says: Hurl Through Hell: Banish a foe through nightmare fire for heavy damage.
  Actual: Hurl Through Hell [action, 1/longRest]: single-target damage 6d10 psychic, banished
- L18 says: Infernal Patronage: Recover pact power and ready hellfire when your patron pushes you onward.
  Actual: Infernal Patronage [bonusAction, 1/longRest]: restore 8 spell points

### The Hexblade
- L3 says: Hexblade's Curse: Mark a foe so your hits against it are stronger.
  Actual: Hexblade's Curse [bonusAction, 1/shortRest]: next-hit rider 1d8 necrotic, marked
- L6 says: Accursed Specter: Call a short-duration specter ally.
  Actual: Accursed Specter [action, 1/longRest]: summon Accursed Specter (rangedKiter, 4 rounds; fallback strike/THP if no space)
- L10 says: Armor of Hexes: When your curse is active, wrap yourself in defensive shadow.
  Actual: Armor of Hexes [reaction, 1/shortRest]: reaction prompt when an attack would hit you: applies the listed AC bonus immediately, possibly turning the hit into a miss.
- L14 says: Master of Hexes: Move your curse's pressure into another strike when a target falls.
  Actual: Master of Hexes [bonusAction, 1/shortRest]: next-hit rider 2d8 necrotic, marked
- L18 says: Cursed Sovereign: Empower your curse against multiple enemies or one doomed target.
  Actual: Cursed Sovereign [action, 1/longRest]: AOE radius 3: 4d8 necrotic, marked

### The Great Old One
- L3 says: Psychic Intrusion: Press alien thoughts into a target, dealing psychic damage and shaking its attacks.
  Actual: Psychic Intrusion [bonusAction, 1/shortRest]: single-target damage 2d6 psychic, shaken
- L6 says: Entropic Ward: Twist probability to protect yourself and set up your next strike.
  Actual: Entropic Ward [reaction, 1/shortRest]: reaction prompt when an attack would hit you: applies the listed AC bonus and next-attack advantage immediately, possibly turning the hit into a miss.
- L10 says: Thought Shield: Resist psychic pressure and punish minds that strike yours.
  Actual: Thought Shield [bonusAction, 1/shortRest]: selfStatus(resistances=psychic, weaponRider=true, damageBonus=6, damageType=psychic, durationRounds=3)
- L14 says: Alien Thrall: Briefly dominate an enemy or weaken a boss-safe target.
  Actual: Alien Thrall [action, 1/longRest]: dominate target 1 round; bosses/elites get beguiled instead
- L18 says: Elder Revelation: Unleash a psychic burst that frightens the room.
  Actual: Elder Revelation [action, 1/longRest]: AOE radius 4: 5d8 psychic, frightened

## Wizard (3 subclasses)

### School of Evocation
- L3 says: Sculpt Spells: Your area evocation spells are shaped around allies in this crawler's monster-targeting spell system.
  Actual: implemented by the spell targeting model: damaging/status area spells affect hostile targets, so allies are excluded from the caster's AoE effects.
- L6 says: Potent Cantrip: Prepare a cantrip or quick blast to hit harder.
  Actual: Potent Cantrip [bonusAction, 1/shortRest]: next-hit rider 1d8 force
- L10 says: Empowered Evocation: Drive extra Intelligence-fueled force into your next evocation hit.
  Actual: Empowered Evocation [bonusAction, 1/shortRest]: next-hit rider 2d8 force
- L14 says: Overchannel: Once per rest, push a damage spell beyond normal limits.
  Actual: Overchannel [bonusAction, 1/longRest]: next-hit rider 4d8 force
- L18 says: Arch-Evoker: Your first big blast in a hard fight becomes cheaper to follow up.
  Actual: Arch-Evoker [bonusAction, 1/shortRest]: restore 6 spell points

### School of Necromancy
- Always on selection: expanded spell list chill-touch, vampiric_touch, arms_of_hadar.
- L3 says: Grim Harvest: When death magic finishes a foe, recover through necromantic momentum.
  Actual: Grim Harvest [bonusAction, 1/shortRest]: self heal base:4,levelMultiplier:1 HP
- L6 says: Undead Thrall: Summon a temporary skeletal ally that fights beside you.
  Actual: Undead Thrall [action, 1/shortRest]: summon Skeletal Thrall (rangedKiter, 5 rounds; fallback strike/THP if no space)
- L10 says: Inured to Undeath: Briefly harden yourself against necrotic harm and draining effects.
  Actual: Inured to Undeath [bonusAction, 1/shortRest]: selfStatus(resistances=necrotic, tempHp=base:4,proficiencyMultiplier:2, durationRounds=3)
- L14 says: Command Undead: Briefly dominate or frighten an undead or death-marked enemy.
  Actual: Command Undead [action, 1/longRest]: dominate target 1 round; bosses/elites get beguiled instead
- L18 says: Deathly Conduit: Necrotic power heals you and strengthens your death magic.
  Actual: Deathly Conduit [bonusAction, 1/longRest]: selfStatus(tempHp=12, weaponRider=true, damageBonus=10, damageType=necrotic, durationRounds=3)

### School of Divination
- L3 says: Portent: Store a fate die and spend it as a bonus to your next important roll.
  Actual: Portent Die [bonusAction, 2/longRest]: selfStatus(attackBonus=5, saveBonus=3, expiresAtEndOfTurn=true)
- L6 says: Expert Divination: Reading the fight restores a little spell power.
  Actual: Expert Divination [bonusAction, 1/shortRest]: restore 3 spell points
- L10 says: Third Eye: Reveal nearby traps and gain initiative foresight.
  Actual: Third Eye [action, 1/shortRest]: reveal traps + skillBonus=3, durationRounds=3
- L14 says: Greater Portent: Hold an even stronger fate die for a decisive moment.
  Actual: Greater Portent [bonusAction, 3/longRest]: selfStatus(attackBonus=7, saveBonus=5, expiresAtEndOfTurn=true)
- L18 says: Fate Master: Once per rest, force fate strongly toward an ally's success.
  Actual: Fate Master [bonusAction, 1/longRest]: selfStatus(attackAdvantage=true, saveBonus=8, expiresAtEndOfTurn=true)
