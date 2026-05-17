# Player-Facing Feature Text Guidelines

Use these rules for all class features, subclass summaries, subclass feature descriptions, ability buttons, level-up choices, inspection panels, and similar player-facing text.

## Core Rule

Write for a player who may not know D&D rules yet.

The text should explain what the feature means in gameplay and fantasy terms:
- what the player can do
- when they should consider using it
- what resource it spends
- when that resource comes back
- what silent/passive benefits are being added
- what kind of character fantasy the choice supports

Avoid describing the engine implementation unless the player truly needs to know a limitation.

## Avoid Implementation-First Wording

Do not use text like:
- "implemented as..."
- "not automated..."
- "reaction prompt..."
- "logged as..."
- "approximated by..."
- "the engine supports..."

Instead, describe the player experience.

Bad:
> Superiority dice and maneuvers; implemented with three core maneuver buttons.

Good:
> Gain superiority dice and spend them on chosen maneuvers that add damage, defense, control, or command.

Bad:
> Reaction prompt: reduce melee damage by superiority die + DEX.

Good:
> Catch or turn aside a melee hit, reducing the damage with practiced defense.

## Subclass Summary Text

Subclass summaries should tell the player what kind of playstyle they are choosing.

Examples:
- Battle Master: "A tactical weapon master who spends superiority dice on precise attacks, counters, and ally support."
- Rune Knight: "A giant-taught warrior who carves runes, grows in battle, and invokes ancient giant magic."
- Champion: "A straightforward martial powerhouse with better critical hits, athletic talent, and steady survival."

## Subclass Info / Guide Text

Every subclass should have a practical guide shown behind or near a small `i` info marker during selection and in inspection.

This guide should explain the actual gameplay loop:
- resource pool
- rest refresh timing
- passive benefits
- active buttons
- reaction behavior
- level scaling
- hidden mechanics that otherwise happen silently

Example Battle Master guide:
> You have a pool of superiority dice that returns on a short or long rest.
> Most maneuvers spend one superiority die to enhance an attack, protect yourself, command an ally, or control an enemy.
> Some maneuvers are buttons you press before attacking, while reaction maneuvers appear as prompts when the right enemy action happens.
> At higher levels you learn more maneuvers, your dice get stronger, and Relentless gives one die back when combat starts if you are empty.

Example Rune Knight guide:
> You know a set of runes. Each rune represents passive giant lore plus an invoked combat effect.
> Rune invocations are limited uses and return on a short or long rest. Choose runes for the kind of defense, control, or damage you want.
> Giant's Might is separate from rune invocations: use it as a bonus action to grow in power and add weapon damage for the fight.
> Runic Shield is a reaction defense, while Master of Runes later lets your chosen runes be invoked more often.

## Feature Descriptions

Feature descriptions should be short, vivid, and useful. Mention exact mechanics when they help decision-making.

Good feature text usually answers one or two of these:
- Does this cost an action, bonus action, reaction, or no action?
- Does it spend a limited resource?
- Does it affect attacks, defense, movement, checks, saves, healing, or allies?
- Is it passive and always on?
- Does it come back on a short rest, long rest, or at combat start?

Examples:
- "Focus your resolve as a bonus action, gaining advantage on attacks and temporary hit points."
- "When a fight begins and your tactical reserves are empty, you recover one superiority die."
- "Your weapon attacks land devastating critical hits more often, starting on a 19 or 20."

## Choice Option Text

Choice descriptions should help the player decide between options.

For maneuver, spell, rune, shot, invocation, fighting style, or similar choices:
- describe the tactical use case
- describe the fantasy image
- avoid hidden numeric clutter unless the number is essential

Examples:
- "Steady the decisive swing or shot, adding a superiority die to your next attack roll."
- "Brand your next weapon hit with fiery chains that burn and briefly restrain the target."
- "Pack explosive force into an arrow so the hit erupts into nearby splash damage."

## Inspection Panel Text

The inspection panel should be a reference after the choice is made.

It should show:
- the subclass name
- a small `i` marker
- a "How to use this subclass" guide
- unlocked subclass features
- important resource counters elsewhere in the selected hero panel when relevant

Important resource examples:
- Battle Master: Superiority Dice current/max
- Arcane Archer: Arcane Shots current/max
- Psi Warrior: Psionic Energy current/max
- Rune Knight: Giant's Might and rune uses where available
- Samurai: Fighting Spirit current/max

## Handling Engine Limits

If a tabletop feature cannot be represented exactly, keep that explanation out of the main feature text whenever possible.

Use implementation logs for exact gaps and adaptations.

Only mention a limitation in player-facing text when it directly affects how the player should use the feature. Phrase it as gameplay behavior rather than a missing system.

Bad:
> Mounted movement feature; recorded but not automated.

Better:
> You are at home in the saddle, harder to unseat and quicker to recover when mounted.

If the current game behavior is materially different and the player needs to know, say it plainly:
> This game focuses this subclass on front-line protection; mounted combat is character flavor for now.

## Tone

Use clear fantasy language, but keep it practical.

Good tone:
- "shout a command"
- "steady the decisive swing"
- "grow with giant power"
- "throw up a telekinetic shield"
- "turn personal grit into healing"

Avoid:
- patch-note language
- developer shorthand
- vague lore with no gameplay clue
- unexplained D&D jargon without context

