(() => {
  const factionGuests = [
    {
      id: "faction-monster-guild",
      role: "faction",
      title: "Scarred Big-Game Scout",
      factionId: "monster-guild",
      factionLabel: "The Trophy Lodge",
      unlockFlag: "flag.village.monsterHunterGuildUnlocked",
      skill: "survival",
      ability: "wis",
      dc: 12,
      opener: "They listen only after the party proves they can read claw marks, spoor, and bad weather.",
      about:
        "The Trophy Lodge posts monster contracts, pays for trophies, and teaches practical field tricks to parties that can bring back proof instead of inflated stories.",
      success: "The scout nods once and promises to send a Trophy Lodge huntmaster to {home}.",
      failure: "The scout is not convinced yet. Better field stories or better tracks might change that.",
      weight: 0.05,
    },
    {
      id: "faction-gravebinders",
      role: "faction",
      title: "Ash-Cloaked Candle Scribe",
      factionId: "gravebinders",
      factionLabel: "The Gravebinders",
      unlockFlag: "flag.village.gravebindersUnlocked",
      skill: "religion",
      ability: "int",
      dc: 12,
      opener: "They ask whether the party knows how to speak about the dead without inviting them in.",
      about:
        "The Gravebinders handle undead contracts, cursed remains, haunt work, and grave materials. They reward clean endings and careful handling of the dead.",
      success: "The scribe seals a black letter and says a Candlewarden will come to {home}.",
      failure: "The scribe keeps the black wax unbroken. Some doors should not open for careless voices.",
      weight: 0.04,
    },
    {
      id: "faction-crucible-collegium",
      role: "faction",
      title: "Elemental Field Lecturer",
      factionId: "crucible-collegium",
      factionLabel: "Crucible Collegium",
      unlockFlag: "flag.village.crucibleCollegiumUnlocked",
      skill: "arcana",
      ability: "int",
      dc: 13,
      opener: "They want a clean explanation of why lightning crawls sideways near old shrines.",
      about:
        "The Crucible Collegium studies elemental violence, planar reagents, shrine phenomena, and unstable magic. They offer contracts, research payments, and elemental gear paths.",
      success: "The lecturer brightens and sends for a Collegium desk to be opened in {home}.",
      failure: "The lecturer smiles politely, which somehow hurts more than a direct insult.",
      weight: 0.04,
    },
    {
      id: "faction-antiquarian-society",
      role: "faction",
      title: "Traveling Relic Archivist",
      factionId: "antiquarian-society",
      factionLabel: "Antiquarian Society",
      unlockFlag: "flag.village.antiquarianSocietyUnlocked",
      skill: "history",
      ability: "int",
      dc: 12,
      opener: "They test the party with a half-remembered dynasty, a cracked seal, and a very sharp eyebrow.",
      about:
        "The Antiquarian Society pays for tomes, inscriptions, relics, field notes, and properly cataloged old things. They turn dungeon dirt into reputation and funding.",
      success: "The archivist writes a neat recommendation and sends the Society toward {home}.",
      failure: "The archivist files the party under promising, noisy, and not yet reliable.",
      weight: 0.04,
    },
    {
      id: "faction-expedition-board",
      role: "faction",
      title: "Mud-Booted Route Clerk",
      factionId: "expedition-board",
      factionLabel: "Expedition Board",
      unlockFlag: "flag.village.expeditionBoardUnlocked",
      skill: "survival",
      ability: "wis",
      dc: 11,
      opener: "They ask for proof the party can describe a route better than 'bad, dark, uphill'.",
      about:
        "The Expedition Board rewards mapped routes, completed delves, scouted sites, supplies recovered from the field, and reliable reports. Roads and outposts will later tie into this.",
      success: "The clerk marks the party as useful and arranges an Expedition Board post in {home}.",
      failure: "The clerk underlines three errors and tells the party to try again after seeing more roads.",
      weight: 0.05,
    },
    {
      id: "faction-boom-club",
      role: "faction",
      title: "Cheerful Blast Witness",
      factionId: "boom-club",
      factionLabel: "Fizzwick's Boom Club",
      unlockFlag: "flag.village.boomClubUnlocked",
      skill: "arcana",
      ability: "int",
      dc: 13,
      opener: "They slide over a singed diagram and ask what exploded first.",
      about:
        "Fizzwick's Boom Club collects volatile reagents, field tests dangerous ideas, and pays for discoveries that hiss, spark, smoke, or make sensible people step backward.",
      success: "They cackle, stamp the paper twice, and promise Boom Club attention in {home}.",
      failure: "The diagram is returned upside down. Apparently that was part of the test.",
      weight: 0.035,
    },
    {
      id: "faction-fighting-pit",
      role: "faction",
      title: "Retired Arena Bellkeeper",
      factionId: "fighting-pit",
      factionLabel: "Fighting Pit",
      unlockFlag: "flag.village.fightingPitUnlocked",
      skill: "athletics",
      ability: "str",
      dc: 12,
      opener: "They want a grip, a stance, and the confidence to survive a crowd shouting for blood.",
      about:
        "The Fighting Pit offers public arena bouts, wave fights, prize purses, and renown. The rules are blunt weapons, medics ready, and enough danger to matter.",
      success: "The bellkeeper grins and says a Pit Marshal will set up terms in {home}.",
      failure: "The bellkeeper likes the spirit, but not enough to bring the bell yet.",
      cityOnly: true,
      weight: 0.03,
    },
  ];

  const classRecruitDefinitions = [
    ["barbarian", "Barbarian", "Rage-Blood Bruiser", "They have split knuckles, a battered axe, and the calm of someone saving their anger for later.", "rage, hard charges, and reckless front-line pressure", 0.28],
    ["bard", "Bard", "Roadsong Support", "They tune a battered instrument while listening to three conversations at once.", "inspiration, light healing, and battlefield misdirection", 0.28],
    ["cleric", "Cleric", "Temple Field Healer", "Their holy symbol is worn smooth from hard prayers and hurried battlefield work.", "reliable healing, blessings, and armored support", 0.34],
    ["druid", "Druid", "Greenward Mender", "Leaves cling to their cloak no matter how clean the floor looks.", "nature magic, healing, and control roots", 0.25],
    ["fighter", "Fighter", "Company Veteran", "Their sword belt has been repaired more often than replaced.", "steady armor, second winds, and clean weapon work", 0.32],
    ["monk", "Monk", "Open-Hand Wanderer", "They sit perfectly still until a cup starts to fall, then catch it without looking.", "mobility, flurries, and defensive focus", 0.22],
    ["paladin", "Paladin", "Oathbound Protector", "Their armor is travel-worn, but the oath-mark on it is polished bright.", "front-line protection, lay on hands, and smiting blows", 0.28],
    ["ranger", "Ranger", "Trail Hunter", "They sit with their back to the wall and mud from three roads on their boots.", "tracking, ranged pressure, and marked prey", 0.3],
    ["rogue", "Rogue", "Lockstep Cutpurse", "They keep their hands visible with the theatrical patience of someone proving a point.", "sneak attacks, quick movement, and dirty tricks", 0.26],
    ["sorcerer", "Sorcerer", "Wild Spark Caster", "A candle gutters whenever they laugh, though the room has no draft.", "raw spell blasts and unstable arcane tricks", 0.22],
    ["warlock", "Warlock", "Pactbound Blaster", "Their shadow arrives a heartbeat later than the rest of them.", "eldritch blasts, curses, and pact pressure", 0.23],
    ["wizard", "Wizard", "Book-Taught Arcanist", "They have ink on one sleeve, chalk on the other, and opinions about every lock in the building.", "arcane bolts, wards, and prepared control", 0.24],
  ].map(([classId, className, title, opener, specialty, weight]) => {
    const stem = className.replace(/[^A-Za-z0-9]/g, "");
    return {
      id: `recruit-class-${classId}`,
      role: "recruit",
      title,
      tiers: [
        { maxCategory: 1, monsterId: `recruit${stem}Lv1`, costCp: 1400, label: `Novice ${className}` },
        { maxCategory: 2, monsterId: `recruit${stem}Lv3`, costCp: 3200, label: `Tested ${className}` },
        { maxCategory: 3, monsterId: `recruit${stem}Lv5`, costCp: 7600, label: `Seasoned ${className}` },
        { maxCategory: 4, monsterId: `recruit${stem}Lv7`, costCp: 13500, label: `Veteran ${className}` },
        { maxCategory: 5, monsterId: `recruit${stem}Lv9`, costCp: 21000, label: `Hardened ${className}` },
        { maxCategory: 6, monsterId: `recruit${stem}Lv11`, costCp: 32000, label: `Elite ${className}` },
        { maxCategory: 7, monsterId: `recruit${stem}Lv13`, costCp: 47000, label: `Master ${className}` },
        { maxCategory: 8, monsterId: `recruit${stem}Lv15`, costCp: 68000, label: `Paragon ${className}` },
        { maxCategory: 9, monsterId: `recruit${stem}Lv17`, costCp: 95000, label: `Legendary ${className}` },
        { maxCategory: 10, monsterId: `recruit${stem}Lv19`, costCp: 130000, label: `Mythic ${className}` },
      ],
      className: `Hired ${className}`,
      opener,
      success: `{name} signs a ten-day contract and brings ${specialty} to the party.`,
      weight,
    };
  });

  const recruitGuests = [
    {
      id: "recruit-shieldhand",
      role: "recruit",
      title: "Shieldhand Looking for Work",
      costCp: 2500,
      tiers: [
        { maxCategory: 1, monsterId: "roadsideBandit", costCp: 1200, label: "Green Shieldhand" },
        { maxCategory: 3, monsterId: "shieldedFootpad", costCp: 2500, label: "Steady Shieldhand" },
        { maxCategory: 5, monsterId: "ironboundGuard", costCp: 7000, label: "Veteran Shieldhand" },
        { maxCategory: 10, monsterId: "magebreakerSentinel", costCp: 14000, label: "Elite Shieldhand" },
      ],
      className: "Hired Shieldhand",
      opener: "A battered shield leans against their stool. They are sober, watchful, and clearly between contracts.",
      success: "{name} signs on as a paid hireling and will follow the party into future danger.",
      weight: 0.8,
    },
    {
      id: "recruit-scout",
      role: "recruit",
      title: "Quiet Trail Scout",
      costCp: 3000,
      tiers: [
        { maxCategory: 1, monsterId: "slingRuffian", costCp: 1400, label: "Green Trail Scout" },
        { maxCategory: 3, monsterId: "banditArcher", costCp: 3000, label: "Trail Scout" },
        { maxCategory: 5, monsterId: "crossbowVeteran", costCp: 7600, label: "Veteran Trail Scout" },
        { maxCategory: 10, monsterId: "arcaneMarksman", costCp: 15000, label: "Elite Trail Scout" },
      ],
      className: "Hired Scout",
      opener: "They sit where they can see every door and name three exits before giving their own name.",
      success: "{name} joins as a paid hireling and keeps an eye on the party's flanks.",
      weight: 0.75,
    },
    {
      id: "recruit-apprentice",
      role: "recruit",
      title: "Nervous Spell Apprentice",
      costCp: 4000,
      tiers: [
        { maxCategory: 2, monsterId: "apprenticeHexer", costCp: 2200, label: "Nervous Spell Apprentice" },
        { maxCategory: 4, monsterId: "noviceBattleMage", costCp: 4000, label: "Battle-Mage Apprentice" },
        { maxCategory: 6, monsterId: "pyromancerInitiate", costCp: 9500, label: "Seasoned Spellblade" },
        { maxCategory: 10, monsterId: "infernalContractMage", costCp: 18000, label: "Dangerous Spell Contractor" },
      ],
      className: "Hired Apprentice",
      opener: "Their spellbook is wrapped in oilcloth, string, and several layers of worry.",
      success: "{name} joins as a paid hireling and promises to stand behind the armored people.",
      cityOnly: true,
      weight: 0.45,
    },
    {
      id: "recruit-caravan-knife",
      role: "recruit",
      title: "Caravan Knife Between Roads",
      tiers: [
        { maxCategory: 1, monsterId: "cutpurseKnifeman", costCp: 1500, label: "Green Caravan Knife" },
        { maxCategory: 3, monsterId: "backAlleyDuelist", costCp: 3200, label: "Caravan Knife" },
        { maxCategory: 5, monsterId: "blackknifeAssassin", costCp: 8500, label: "Veteran Caravan Knife" },
        { maxCategory: 10, monsterId: "masterThief", costCp: 16500, label: "Elite Caravan Knife" },
      ],
      className: "Hired Knife",
      opener: "A short blade vanishes into their sleeve whenever someone laughs too loud.",
      success: "{name} takes the contract and promises to keep trouble facing the wrong way.",
      weight: 0.52,
    },
    {
      id: "recruit-field-medic",
      role: "recruit",
      title: "Field Medic With Clean Needles",
      tiers: [
        { maxCategory: 3, monsterId: "cultAcolyte", costCp: 2800, label: "Tired Acolyte" },
        { maxCategory: 5, monsterId: "battlefieldMedic", costCp: 7800, label: "Field Medic" },
        { maxCategory: 10, monsterId: "warPriest", costCp: 14500, label: "War-Shrine Medic" },
      ],
      className: "Hired Medic",
      opener: "Their kit is cleaner than the table, and they keep checking the exits between sips.",
      success: "{name} joins as a paid medic and warns that courage is not a substitute for bandages.",
      weight: 0.42,
    },
    {
      id: "recruit-mine-delver",
      role: "recruit",
      title: "Mine Delver",
      tiers: [
        { maxCategory: 2, monsterId: "roadsideBandit", costCp: 1600, label: "Lantern Delver" },
        { maxCategory: 4, monsterId: "mercenarySpearman", costCp: 4200, label: "Mine Delver" },
        { maxCategory: 7, monsterId: "ironboundGuard", costCp: 9000, label: "Deep Delver" },
        { maxCategory: 10, monsterId: "magebreakerSentinel", costCp: 17000, label: "Stone-Oath Delver" },
      ],
      className: "Hired Delver",
      opener: "Coal dust marks every line in their hands. They look toward the cellar whenever the floorboards creak.",
      success: "{name} signs on and checks the party's lanterns before anything else.",
      weight: 0.45,
    },
    {
      id: "recruit-duelist",
      role: "recruit",
      title: "Duelist Out of Coin",
      tiers: [
        { maxCategory: 3, monsterId: "bladeAdept", costCp: 4200, label: "Hungry Duelist" },
        { maxCategory: 5, monsterId: "veteranDuelist", costCp: 9500, label: "Veteran Duelist" },
        { maxCategory: 10, monsterId: "voidbladeMystic", costCp: 20000, label: "Voidblade Duelist" },
      ],
      className: "Hired Duelist",
      opener: "Their coat is too fine for their purse, and their sword has been polished more recently than their boots.",
      success: "{name} bows, accepts the purse, and calls the arrangement temporary with great dignity.",
      cityOnly: true,
      weight: 0.3,
    },
    ...classRecruitDefinitions,
  ];

  const vendorGuests = [
    {
      id: "seller-shady-charms",
      role: "vendor",
      title: "Shady Charm Seller",
      opener: "They unfold a velvet cloth under the table and smile like the room owes them money.",
      stock: ["potion-healing", "torch", "alchemists-fire"],
      stockQuantityRange: [1, 2],
      priceMultiplier: 1.35,
      weight: 0.7,
    },
    {
      id: "seller-road-peddler",
      role: "vendor",
      title: "Road Peddler",
      opener: "Their pack has rope, rations, chalk, and the smell of three weather systems.",
      stock: ["trail-ration", "torch", "potion-healing"],
      stockQuantityRange: [1, 4],
      priceMultiplier: 1.15,
      weight: 0.8,
    },
    {
      id: "seller-bottle-witch",
      role: "vendor",
      title: "Bottle-Witch Broker",
      opener: "Every bottle in their satchel has a string tag, a wax seal, and a warning written too small.",
      stock: ["potion-healing", "potion-greater-healing", "alchemists-fire"],
      stockQuantityRange: [1, 2],
      priceMultiplier: 1.45,
      cityOnly: true,
      weight: 0.55,
    },
    {
      id: "seller-wand-runner",
      role: "vendor",
      title: "Contraband Wand Runner",
      opener: "They keep tapping a narrow case and pretending the sparks are someone else's problem.",
      stock: ["potion-fire-breath", "potion-heroism", "alchemists-fire"],
      stockQuantityRange: [1, 1],
      priceMultiplier: 1.65,
      cityOnly: true,
      weight: 0.25,
    },
    {
      id: "seller-lantern-monger",
      role: "vendor",
      title: "Lantern Monger",
      opener: "Their coat smells of oil, smoke, and the firm belief that darkness is a solvable problem.",
      stock: ["torch", "hooded-lantern", "lantern-oil", "trail-ration"],
      stockQuantityRange: [2, 5],
      priceMultiplier: 1.1,
      weight: 0.55,
    },
    {
      id: "seller-music-case",
      role: "vendor",
      title: "Performer Selling Spare Instruments",
      opener: "Their instrument case is patched, polished, and guarded like a sleeping child.",
      stock: ["instrument-flute", "instrument-drum", "instrument-lute"],
      stockQuantityRange: [1, 1],
      priceMultiplier: 1.2,
      weight: 0.22,
    },
  ];

  const askGuests = [
    {
      id: "ask-embervein-ore",
      role: "materialAsk",
      title: "Traveling Forge Buyer",
      itemId: "embervein-ore",
      quantity: 2,
      rewardCp: 900,
      opener: "Their sample box is lined with scorched wool. They are buying heat-holding ore tonight.",
      request: "Bring 2 nuggets of Embervein Ore.",
      success: "They weigh the ore, pay fairly, and leave a little forge gossip behind.",
      weight: 0.65,
    },
    {
      id: "ask-beast-hide",
      role: "materialAsk",
      title: "Strap-Cutter with a Rush Order",
      itemId: "beast-hide",
      quantity: 3,
      rewardCp: 750,
      opener: "They have buckles, waxed thread, and no patience for weak leather.",
      request: "Bring 3 Beast Hides.",
      success: "They cut a clean corner from one hide, nod, and pay without haggling.",
      weight: 0.7,
    },
    {
      id: "ask-demon-ichor",
      role: "materialAsk",
      title: "Sealed-Vial Collector",
      itemId: "demon-ichor",
      quantity: 1,
      rewardCp: 1800,
      opener: "Every bottle in their case is corked, waxed, and labeled in a hand that expects trouble.",
      request: "Bring 1 vial of Demon Ichor.",
      success: "The collector stores the vial in a padded box and pays before it can hiss.",
      cityOnly: true,
      weight: 0.4,
    },
    {
      id: "ask-monster-knowledge",
      role: "monsterAsk",
      title: "Monster Tale Collector",
      rewardCp: 600,
      opener: "They carry a ledger of field stories, corrected rumors, and names crossed out after autopsy.",
      request: "Tell them about a creature your party has already encountered.",
      success: "They copy the account in quick strokes and pay for details that sound survived rather than invented.",
      weight: 0.9,
    },
  ];

  const rumorGuests = [
    {
      id: "rumor-local-auntie",
      role: "rumor",
      title: "Rumor Auntie",
      opener: "They sit at the loudest table and somehow hear the quietest corner.",
      rumors: [
        "A good inn tells you where not to sleep. Ask about burrows before you ask about treasure.",
        "Villages remember who arrives hungry and who pays. Cities remember who leaves through the wrong gate.",
        "If a mine entrance has fresh bootprints and no cart noise, someone is hiding work from the daylight.",
      ],
      weight: 0.65,
    },
    {
      id: "rumor-bad-cartographer",
      role: "rumor",
      title: "Bad Cartographer",
      opener: "Their map has three north arrows and none of them agree.",
      rumors: [
        "They can sketch nearby trouble, but every useful mark comes with a doubtful apology.",
        "They insist ruins are easier to find from taverns than from roads. That may even be true.",
        "They mark towers with little angry flags and warn that some doors know when they are being watched.",
      ],
      weight: 0.45,
    },
    {
      id: "rumor-lantern-watchman",
      role: "rumor",
      title: "Lantern Watchman",
      opener: "Their lantern is shuttered, but the habit of watching dark corners has not left them.",
      rumors: [
        "Graveyards stay quiet until people start calling quiet the same thing as safe.",
        "If the dead have a road, it usually starts under a stone no one wants to lift.",
        "Undead work is cleaner when finished before midnight. They say this like a rule, not a superstition.",
      ],
      weight: 0.4,
    },
    {
      id: "rumor-mine-bell-listener",
      role: "rumor",
      title: "Mine Bell Listener",
      opener: "They pause mid-sentence whenever metal rings in the kitchen.",
      rumors: [
        "A mine that echoes twice has open depth. A mine that echoes once has something listening.",
        "Ore buyers ask polite questions. Delvers ask how many carts came back.",
        "The old miners tied bells to the bad shafts. The worse shafts learned to stay quiet.",
      ],
      weight: 0.38,
    },
    {
      id: "rumor-quiet-shepherd",
      role: "rumor",
      title: "Quiet Shepherd",
      opener: "They smell of wet wool and keep counting the room as if something followed them in.",
      rumors: [
        "Burrows do not become empty because the field is silent. Silence is often the burrow breathing.",
        "If sheep avoid a hill for three mornings, the hill has earned an armed visit.",
        "The large lairs are not fair fights. They are promises made by teeth.",
      ],
      weight: 0.42,
    },
    {
      id: "rumor-smiling-clerk",
      role: "rumor",
      title: "Smiling Clerk",
      opener: "They know every shop sign in town and exactly which ones are lying.",
      rumors: [
        "A settlement's best store is not always the loudest one. Look for who the guards visit after sundown.",
        "Temple services cost more in towns that have recently needed them.",
        "If the inn has too many empty chairs, the road has been eating travelers.",
      ],
      weight: 0.4,
    },
  ];

  const questHookGuests = [
    {
      id: "hook-quest-seeker",
      role: "questHook",
      title: "Quiet Patron",
      opener: "They listen more than they speak and clearly have a job in mind for the right kind of party.",
      request: "Quest hooks can attach here later.",
      weight: 0.12,
      disabled: true,
    },
  ];

  const definitions = [...factionGuests, ...recruitGuests, ...vendorGuests, ...askGuests, ...rumorGuests, ...questHookGuests];
  const byId = Object.fromEntries(definitions.map((definition) => [definition.id, definition]));
  const questUnlockers = {};

  function hashText(text = "") {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seeded(seed) {
    let value = seed >>> 0;
    return () => {
      value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
      return value / 4294967296;
    };
  }

  function pickWeighted(entries, random) {
    const total = entries.reduce((sum, entry) => sum + Math.max(0.01, Number(entry.weight) || 1), 0);
    let roll = random() * total;
    for (const entry of entries) {
      roll -= Math.max(0.01, Number(entry.weight) || 1);
      if (roll <= 0) return entry;
    }
    return entries[entries.length - 1] ?? null;
  }

  function randomCharacterIdentity(random) {
    const entry = window.DepthboundHeroNames?.randomEntry?.(random);
    if (entry?.name) return { name: entry.name, gender: ["f", "m", "d"].includes(entry.gender) ? entry.gender : "d" };
    const names = window.DepthboundHeroNames?.names ?? [];
    if (names.length) return { name: names[Math.floor(random() * names.length)] ?? "Stranger", gender: "d" };
    return { name: window.DepthboundHeroNames?.random?.() ?? "Stranger", gender: "d" };
  }

  function preheroTokenGender(entry) {
    const path = String(entry?.path ?? entry?.name ?? "").toLowerCase();
    if (/(^|[_-])f(\.|_|-)/.test(path) || /_f\.[a-z0-9]+$/.test(path)) return "f";
    if (/(^|[_-])m\d*(\.|_|-)/.test(path) || /_m\d*\.[a-z0-9]+$/.test(path)) return "m";
    return "d";
  }

  function randomPremadeTokenArtForGender(gender, random) {
    const entries = typeof predefinedHeroTokenArt !== "undefined" && Array.isArray(predefinedHeroTokenArt) ? predefinedHeroTokenArt : [];
    if (!entries.length) return "";
    const desired = ["f", "m"].includes(gender) ? gender : "";
    const pool = desired ? entries.filter((entry) => preheroTokenGender(entry) === desired) : entries;
    const candidates = pool.length ? pool : entries;
    return candidates[Math.floor(random() * candidates.length)]?.path ?? "";
  }

  function monsterTemplateIsHumanoid(monsterId = "") {
    const monster = window.DungeonContent?.get?.("monsters", monsterId);
    return Boolean(monster && (monster.tags ?? []).map((tag) => String(tag).toLowerCase()).includes("humanoid"));
  }

  function definitionAllowed(definition, context = {}) {
    if (!definition || definition.disabled) return false;
    if (definition.cityOnly && context.profile?.type !== "city") return false;
    if (definition.role === "faction" && definition.unlockFlag && context.state?.questFlags?.[definition.unlockFlag]) return false;
    if (definition.role === "vendor" && !(definition.stock ?? []).some((itemId) => window.DungeonContent?.get?.("items", itemId))) return false;
    if (definition.role === "materialAsk" && !window.DungeonContent?.get?.("items", definition.itemId)) return false;
    if (definition.role === "recruit") {
      const tiers = Array.isArray(definition.tiers) ? definition.tiers : [];
      if (tiers.length && !tiers.some((tier) => monsterTemplateIsHumanoid(tier.monsterId))) return false;
      if (!tiers.length && definition.allyMonsterId && !monsterTemplateIsHumanoid(definition.allyMonsterId)) return false;
    }
    return true;
  }

  function desiredGuestCount(profile) {
    return profile?.type === "city" ? 4 : 3;
  }

  function guestIsExpired(guest, currentDay) {
    const departureDay = Math.max(0, Math.floor(Number(guest?.departureDay) || 0));
    return departureDay > 0 && currentDay >= departureDay;
  }

  function createVendorStockCounts(definition, random) {
    if (definition?.role !== "vendor") return {};
    const [minRaw, maxRaw] = Array.isArray(definition.stockQuantityRange) ? definition.stockQuantityRange : [1, 2];
    const min = Math.max(0, Math.floor(Number(minRaw) || 0));
    const max = Math.max(min, Math.floor(Number(maxRaw) || min));
    return Object.fromEntries((definition.stock ?? []).map((itemId) => {
      const quantity = min + Math.floor(random() * (max - min + 1));
      return [itemId, quantity];
    }));
  }

  function normalizeExistingGuest(guest, profile, currentDay) {
    if (!guest?.defId) return null;
    const definition = byId[guest.defId] ?? null;
    const seedText = `${profile.id ?? profile.name}:${guest.id ?? guest.defId}:${guest.spawnedDay ?? currentDay}:duration`;
    const random = seeded(hashText(seedText));
    const identity = guest.name && guest.gender
      ? { name: guest.name, gender: ["f", "m", "d"].includes(guest.gender) ? guest.gender : "d" }
      : randomCharacterIdentity(random);
    const spawnedDay = Math.max(1, Math.floor(Number(guest.spawnedDay) || currentDay));
    const durationDays = Math.max(2, Math.floor(Number(guest.durationDays) || (2 + Math.floor(random() * 29))));
    const departureDay = Math.max(spawnedDay + 2, Math.floor(Number(guest.departureDay) || spawnedDay + durationDays));
    return {
      ...guest,
      name: identity.name,
      gender: identity.gender,
      tokenArt: guest.tokenArt || randomPremadeTokenArtForGender(identity.gender, random),
      spawnedDay,
      durationDays,
      departureDay,
      state: guest.state ?? "available",
      completed: Boolean(guest.completed),
      failedToday: Boolean(guest.failedToday),
      stockCounts: definition?.role === "vendor"
        ? { ...createVendorStockCounts(definition, random), ...(guest.stockCounts && typeof guest.stockCounts === "object" ? guest.stockCounts : {}) }
        : guest.stockCounts,
    };
  }

  function createGuest(profile, context, slotIndex, usedDefinitions) {
    const currentDay = Math.max(1, Math.floor(Number(context.day) || 1));
    profile.tavernGuests.nextSerial = Math.max(1, Math.floor(Number(profile.tavernGuests.nextSerial) || 1));
    const serial = profile.tavernGuests.nextSerial;
    const random = seeded(hashText(`${profile.id ?? profile.name}:tavern-guest:${currentDay}:${serial}:${slotIndex}`));
    const pool = definitions.filter((definition) => !usedDefinitions.has(definition.id) && definitionAllowed(definition, { ...context, profile }));
    if (!pool.length) return null;
    const definition = pickWeighted(pool, random);
    if (!definition) return null;
    usedDefinitions.add(definition.id);
    profile.tavernGuests.nextSerial += 1;
    const durationDays = 2 + Math.floor(random() * 29);
    const identity = randomCharacterIdentity(random);
    return {
      id: `${profile.id ?? profile.name}-guest-${currentDay}-${serial}`,
      defId: definition.id,
      name: identity.name,
      gender: identity.gender,
      tokenArt: randomPremadeTokenArtForGender(identity.gender, random),
      state: "available",
      spawnedDay: currentDay,
      durationDays,
      departureDay: currentDay + durationDays,
      completed: false,
      failedToday: false,
      stockCounts: createVendorStockCounts(definition, random),
    };
  }

  function ensureForProfile(profile, context = {}) {
    if (!profile) return [];
    profile.tavernGuests ??= {};
    const currentDay = Math.max(1, Math.floor(Number(context.day) || 1));
    const count = desiredGuestCount(profile);
    const existing = Array.isArray(profile.tavernGuests.guests) ? profile.tavernGuests.guests : [];
    let guests = existing
      .map((guest) => normalizeExistingGuest(guest, profile, currentDay))
      .filter((guest) => guest && !guestIsExpired(guest, currentDay));
    const used = new Set(guests.map((guest) => guest.defId).filter(Boolean));
    for (let index = guests.length; index < count; index += 1) {
      const guest = createGuest(profile, context, index, used);
      if (!guest) break;
      guests.push(guest);
    }
    profile.tavernGuests.guests = guests;
    profile.tavernGuests.lastVisitedDay = currentDay;
    return guests;
  }

  function ensureBarkeeper(profile, context = {}) {
    if (!profile) return null;
    profile.tavernGuests ??= {};
    const random = seeded(hashText(`${profile.id ?? profile.name}:barkeeper`));
    if (profile.tavernGuests.barkeeper?.name) {
      const barkeeper = profile.tavernGuests.barkeeper;
      barkeeper.gender = ["f", "m", "d"].includes(barkeeper.gender) ? barkeeper.gender : "d";
      barkeeper.tokenArt = barkeeper.tokenArt || randomPremadeTokenArtForGender(barkeeper.gender, random);
      return barkeeper;
    }
    const identity = randomCharacterIdentity(random);
    profile.tavernGuests.barkeeper = {
      id: `${profile.id ?? profile.name}-barkeeper`,
      name: identity.name,
      gender: identity.gender,
      tokenArt: randomPremadeTokenArtForGender(identity.gender, random),
      title: "Barkeeper",
      spawnedDay: Math.max(1, Math.floor(Number(context.day) || 1)),
    };
    return profile.tavernGuests.barkeeper;
  }

  function registerQuestUnlocker(id, handler) {
    if (!id || typeof handler !== "function") return;
    questUnlockers[id] = handler;
  }

  window.DepthboundTavernGuests = {
    definitions,
    byId,
    ensureForProfile,
    ensureBarkeeper,
    definition: (id) => byId[id] ?? null,
    desiredGuestCount,
    registerQuestUnlocker,
    questUnlockers,
  };
})();
