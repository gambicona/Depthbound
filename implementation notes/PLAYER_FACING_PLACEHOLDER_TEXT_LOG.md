# Player-Facing Placeholder Text Log

Created 2026-05-16 after scanning class/race feature text, spell descriptions, furniture/item descriptions, NPC quest text, and visible app UI strings for wording such as "stored", "future", "later", "placeholder", "not implemented", and similar.

## Updated Because The Feature Exists Now

- `src/scripts/content/spells/core-spells.js:425` - Bless description no longer says "+1 target later"; multi-target upcast support exists.
- `src/scripts/content/spells/core-spells.js:439` - Bane description no longer says "+1 target later"; multi-target upcast support exists.
- `src/scripts/content/spells/core-spells.js:452` - Shield of Faith description no longer says "+1 target later"; multi-target upcast support exists.
- `src/scripts/content/spells/core-spells.js:491` - Spirit Guardians description no longer says damage is for a later full implementation; the radiant aura damage is active.
- `src/scripts/content/items/magic_accessories.js:448` - Boots of Striding visible description no longer mentions future pit-jump support; current player-facing effect is speed only.
- `src/scripts/app/rendering-inventory.js:3676` - Warrior Sidekick Defender choice no longer says future reaction support; the reaction popup is implemented.
- `src/scripts/app/bootstrap.js:223` - Elf Keen Senses no longer says "stored"; it is active as Perception proficiency.

## Still Needs Implementation Or Design

### Race And Ancestry Text

- `src/scripts/app/bootstrap.js:200` - Duergar Resilience still says future condition/magic saves. Needs condition/magic-save handling.
- `src/scripts/app/bootstrap.js:201` - Duergar Invisibility is listed as stored for stealth rules. Needs invisibility/stealth implementation or a replacement combat effect.
- `src/scripts/app/bootstrap.js:223` and `288` - Fey Ancestry still says future charm/sleep handling. Needs charm/sleep condition support.
- `src/scripts/app/bootstrap.js:230` - Drow Dancing Lights and Darkness are listed as stored. Darkness spell exists generally, but racial Drow Darkness is not hooked as an innate feature here.
- `src/scripts/app/bootstrap.js:255` - Wood Elf Mask of the Wild waits on stealth rules.
- `src/scripts/app/bootstrap.js:267` - Chromatic Warding waits on a usable dragonborn defensive feature.
- `src/scripts/app/bootstrap.js:268` - Gem Psionic Mind and Gem Flight wait on communication/flight systems or combat substitutes.
- `src/scripts/app/bootstrap.js:269` - Metallic Breath Weapon waits on a second breath/control implementation.
- `src/scripts/app/bootstrap.js:274` - Gnome Cunning waits on magic-save context.
- `src/scripts/app/bootstrap.js:276` - Deep Gnome Stone Camouflage waits on stealth rules.
- `src/scripts/app/bootstrap.js:277` - Forest Gnome Speak with Small Beasts is omitted for dungeon combat.
- `src/scripts/app/bootstrap.js:278` - Rock Gnome Artificer's Lore waits on lore checks.
- `src/scripts/app/bootstrap.js:293` - Wood Half-Elf descent says Fleet of Foot choice is not auto-applied. Needs either a choice UI or explicit removal from player-facing ancestry text.
- `src/scripts/app/bootstrap.js:303` - Halfling Brave and Nimbleness wait on frightened saves and creature-size movement.
- `src/scripts/app/bootstrap.js:306` - Ghostwise Silent Speech waits on social/telepathy systems.
- `src/scripts/app/bootstrap.js:307` - Lightfoot Naturally Stealthy waits on stealth rules.
- `src/scripts/app/bootstrap.js:331` - Aasimar Light Bearer has no current dungeon effect.
- `src/scripts/app/bootstrap.js:346` - Goliath Powerful Build waits on carrying rules.
- `src/scripts/app/bootstrap.js:358` - Yuan-ti Magic Resistance and poisoned-condition immunity wait on spell-save/condition systems.
- `src/scripts/app/bootstrap.js:359` - Yuan-ti Animal Friendship waits on beast/social rules.
- `src/scripts/app/bootstrap.js:370`, `373`, `374`, and `376` - Genasi breathing, water, terrain, and related utility traits wait on environmental systems; Earth Genasi Pass without Trace waits on stealth rules.
- `src/scripts/app/bootstrap.js:383`, `386`, `387`, `389`, and `390` - Several Tiefling innate spells are marked stored. Needs per-subrace innate spell hooks or replacement combat effects for Thaumaturgy, Crown of Madness, Disguise Self, Invisibility, Darkness, Mage Hand, Flame Blade, and Searing Smite where applicable.

### Quest Content

- `src/scripts/content/npcs/old-lady.js:259` and `src/scripts/content/npcs/Old_Lady.txt:28` - Green Vines are placeholder quest items. Needs actual item/drop/source.
- `src/scripts/content/npcs/old-lady.js:349` and `src/scripts/content/npcs/Old_Lady.txt:93` - Old Guardroom Relics are placeholder tagged valuables. Needs actual loot items with `old-guardroom-relic`.
- `src/scripts/content/npcs/old-lady.js:446` and `src/scripts/content/npcs/Old_Lady.txt:161` - Black Briar Root is a placeholder rare herb. Needs item and drop/source.

### Item Follow-Ups

- `src/scripts/content/items/magic_accessories.js:448` - Boots of Striding still have a non-player implementation note for future pit-jump support. Visible text is cleaned up; implement when pit-jump rules exist.

## Ignored False Positives

- `Stored Coins`, `Stored/Withdrew`, `restored token picture`, and search input `placeholder` attributes in `rendering-inventory.js` are normal UI text, not implementation placeholders.
- Developer-only comments in item/content files were not treated as player-facing unless they describe a visible item, quest, feature, or spell.
