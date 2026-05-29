# Faction Mission Completable Audit

Date: 2026-05-28

Scope: village faction/guild contracts, turn-ins, and the Fighting Pit activity as currently implemented.

Legend:
- OK: Completable through current gameplay hooks.
- BLOCKED: Not completable in the current state without code/content changes.
- CONDITIONAL: Completable, but requires a specific dungeon theme, campaign run, or item source.

## Trophy Lodge

Contracts:
- OK - Wolf Trouble: progresses from monster kills matching beast tags/text. Beast monsters exist in current themes and monster kills call `recordNpcMonsterKill`.
- OK - Fang Ledger: same beast kill hook as Wolf Trouble; higher count only.
- OK - Big Game Warrant: progresses from boss/custom boss/category 2+ quarry or large-game text matches. Bosses and category scaling exist.

Turn-ins:
- OK - Fangs and Claws: accepts Beast Claw and Beast Fang.
- OK - Good Hides: accepts Beast Hide.
- OK - Venom Proof: accepts Venom Gland from venom/poison beast drops.
- OK - Trophy Table: accepts current monster-part trophy items such as Beast Claw, Beast Fang, Horn and Antler, Scale and Shell, and Thorn Spike.

Notes: All Trophy Lodge missions are completable. Some turn-ins are drop-rate dependent, but the matching items exist and can be generated.

## Gravebinders

Contracts:
- OK - Ashes That Walk: progresses from undead/skeleton/zombie style kills.
- OK - Lantern for the Lost: progresses from ghost/specter/wraith/banshee/spirit style kills.
- OK - Seal the Open Grave: progresses from boss/custom boss/category 2+ undead or haunt kills.

Turn-ins:
- OK - Bone Ledger: accepts Bone Dust, Cracked Rib Bone, Skull Fragment, and other bone-tagged components.
- OK - Grave-Wax Candles: accepts Grave Wax.
- OK - Ectoplasm Vials: accepts Ectoplasm.
- OK - Unquiet Relics: accepts Grave Wax, Ectoplasm, Soul Echo, Grave Flesh, and matching undead relic/flesh/ghost components.

Notes: All Gravebinder missions are completable. Haunt work depends on ghost-bearing themes/encounters.

## Crucible Collegium

Contracts:
- OK - Motes in Motion: progresses from elemental kills.
- OK - Fourfold Sample: progresses from elemental kills that also carry fire/air/earth/water/etc. aspect tags or text.
- OK - Rift Tempering: progresses from boss/custom boss/category 2+ elemental kills.

Turn-ins:
- OK - Loose Motes: accepts Elemental Mote.
- OK - Balanced Essences: accepts Flame Essence, Storm Essence, Earth Essence, and Water Essence.
- OK - Pressure and Crystal: accepts Pressure Core, Crystal Shard, Arcane Gear, Slag Glass, and other arcane/pressure/crystal matches.
- OK - Primal Core Study: accepts Primal Core.

Notes: All Crucible missions are completable. The higher ones are theme/drop-rate dependent but supported.

## Antiquarian Society

Contracts:
- OK - Field Notes: progresses when handout/tome/journal items are collected. Ancient Tome Page and Temporary Dungeon Note exist, and tome collection calls the NPC item hook.
- OK - Objects of Provenance: progresses from treasure/art/valuable/relic style collected items. Current treasure generation supports these.
- OK - Dangerous Antiquities: progresses from major relic checks using treasure value and name/text keywords. Current high-value treasure includes royal, crown, reliquary, funerary, ancient, sapphire, emerald, diamond, ruby, and similar matches.

Turn-ins:
- OK - Tome Pages: accepts party tome entries matching handout/journal/ancient-tome.
- OK - Small Antiquities: accepts current art object and valuable treasure items.
- BLOCKED - Reliquary Cases: requirement checks treasure tags `relic`, `reliquary`, `saint`, `funerary`, or `prayer`, but current matching treasure items such as Gem-Studded Reliquary, Platinum Reliquary, Gold Funerary Mask, Silvered Saint Icon, and Painted Prayer Tile are not tagged with those keywords.
- BLOCKED - Royal Provenance: requirement checks treasure tags `royal`, `crown`, `charter`, `signet`, or `coronet` plus 250 gp value, but current matching treasure items such as Jeweled Coronet, Diamond-Studded Crown, Illuminated Royal Charter, and Platinum Signet Chain are not tagged with those keywords.

Notes: Antiquarian contracts are completable. Two high-flavor turn-ins are blocked because generic requirement matching looks at tags, not treasure names/descriptions.

## Expedition Board

Contracts:
- OK - Prove the Road: progresses on any completed dungeon via `handleNpcDungeonComplete`.
- OK - Campaign Mileposts: progresses on completed dungeons with `campaignId` in the completion context.
- OK - Long-Haul Ledger: progresses on any completed dungeon; higher count only.

Turn-ins:
- OK - Torch Bundles: accepts Torches.
- OK - Lantern Oil: accepts Lantern Oil.
- OK - Repair Stock: accepts wood, cloth, leather, metal, and crafting components.

Notes: All Expedition Board missions are completable. Campaign Mileposts specifically requires campaign dungeon runs, not random dungeons.

## Fizzwick's Boom Club

Contracts:
- OK - Spark Samples: progresses from collected fire/brimstone/coal/hot materials.
- OK - Boom Inventory: progresses from explosive/bomb/volatile/alchemy items and Alchemist's Fire.
- OK - Pressure and Regret: progresses from pressure/primal/chaos/infernal/abyssal/arcane/magic reagent materials.

Turn-ins:
- OK - Coal and Brimstone: accepts Coal Chunk and Brimstone Chunk style materials.
- OK - Fire Reagents: accepts Hellfire Ember, Flame Essence, Slag Glass, Brimstone Chunk, and other fire/ember/ash/heat/lava matches.
- OK - Pressure Parts: accepts Pressure Core, Arcane Gear, Slag Glass, Crystal Shard, and similar matches.
- OK - Infernal Volatiles: accepts Demon Ichor, Abyssal Bile, Chaos Shard, Hellfire Ember, Brimstone Chunk, and other infernal/abyssal/hell/demon/devil/chaos matches.

Notes: All Boom Club missions are completable. Collection contracts only count items collected after the contract is accepted.

## Fighting Pit

Activity:
- OK - Fighting Pit run: starts a custom arena state, spawns scaled waves, pays rewards and renown after cleared waves, offers optional short rests after boss waves, and uses nonlethal pit safety.

Notes: This is not a normal accept/claim contract board, but the activity is usable and progress/rewards are implemented.

## Implementation Notes For Blocked Missions

Blocked items:
- Antiquarian Society - Reliquary Cases
- Antiquarian Society - Royal Provenance

Recommended fix:
- Add explicit tags to relevant treasure definitions in `src/scripts/content/items/treasure.js`.
- For Reliquary Cases, tag suitable art objects with `relic`, `reliquary`, `saint`, `funerary`, or `prayer`.
- For Royal Provenance, tag suitable art objects with `royal`, `crown`, `charter`, `signet`, or `coronet`.

Good candidate treasure tag updates:
- Painted Prayer Tile: add `prayer`.
- Silvered Saint Icon: add `saint`, `prayer`, `relic`.
- Gem-Studded Reliquary: add `reliquary`, `relic`.
- Gold Funerary Mask: add `funerary`, `relic`.
- Platinum Reliquary: add `reliquary`, `relic`.
- Adamantine Reliquary: add `reliquary`, `relic`.
- Platinum Signet Chain: add `signet`, `royal`.
- Jeweled Coronet: add `coronet`, `royal`.
- Illuminated Royal Charter: add `royal`, `charter`.
- Diamond-Studded Crown: add `crown`, `royal`.

Alternative broader fix:
- Extend `itemMatchesRequirement` so treasure requirements can optionally match against item name, description, category, and `treasure.description`, not only tags.
- This would make current text-rich treasure names usable without tagging every item, but it is broader and could make turn-ins less predictable.

Preferred implementation:
- Use explicit tags on treasure definitions. It keeps the turn-in system predictable and avoids accidental matches from decorative wording.
