(() => {
  const WORDS = {
    colors: [
      "Amber", "Ashen", "Black", "Blue", "Bright", "Bronze", "Brown", "Copper", "Crimson", "Dark", "Dawn", "Deep", "Dun", "Dusky", "Ebon", "Ember",
      "Fallow", "Frost", "Ghost", "Glass", "Golden", "Gray", "Green", "Iron", "Ivory", "Jade", "Moon", "Moss", "Ochre", "Pale", "Red", "Reed",
      "Rose", "Russet", "Sable", "Scarlet", "Shadow", "Silver", "Slate", "Snow", "Star", "Stone", "Sun", "Umber", "Viridian", "White"
    ],
    moods: [
      "Ancient", "Bitter", "Blessed", "Broken", "Buried", "Cold", "Crooked", "Crowned", "Dancing", "Drowned", "Elder", "Fallen", "Far", "Forgotten",
      "Gentle", "Hidden", "Hollow", "Last", "Little", "Long", "Lost", "Low", "Mournful", "Old", "Quiet", "Ragged", "Restless", "Sacred", "Secret",
      "Shattered", "Silent", "Sleeping", "Sorrow", "Still", "Storm", "Sunken", "Thorn", "Twilight", "Wandering", "Weathered", "Whispering", "Wild"
    ],
    natural: [
      "Alder", "Apple", "Ash", "Barley", "Beech", "Berry", "Birch", "Briar", "Brook", "Cedar", "Clover", "Elm", "Fern", "Flint", "Fox", "Hazel",
      "Heather", "Holly", "Juniper", "Larch", "Laurel", "Maple", "Marsh", "Meadow", "Mire", "Moss", "Oak", "Pine", "Rain", "Reed", "River",
      "Rowan", "Rush", "Sage", "Spring", "Stone", "Thistle", "Thorn", "Vale", "Willow", "Wind", "Wolf", "Yew"
    ],
    people: [
      "Ald", "Ansel", "Arlen", "Bram", "Bran", "Calder", "Cedric", "Corin", "Dain", "Doran", "Edric", "Elda", "Elian", "Elowen", "Fenn",
      "Garron", "Hadley", "Harlan", "Ilyra", "Isolde", "Jorin", "Kael", "Kara", "Liora", "Mara", "Merrin", "Nessa", "Oren", "Orla", "Perrin",
      "Riven", "Rowan", "Seren", "Tamsin", "Taren", "Thane", "Vera", "Wren"
    ],
    roots: [
      "aber", "acre", "arden", "barrow", "bast", "beck", "bel", "briar", "bridge", "brook", "burn", "bury", "cairn", "car", "caster", "cliff",
      "combe", "cote", "cross", "dale", "deep", "den", "down", "drift", "dun", "edge", "fall", "fell", "fen", "field", "ford", "gate", "glen",
      "grave", "grove", "hall", "ham", "harrow", "haven", "hearth", "helm", "hill", "hold", "hollow", "hurst", "keep", "kirk", "land", "leigh",
      "mere", "moor", "moss", "pass", "reach", "ridge", "rim", "rock", "run", "stead", "stone", "strand", "thorpe", "ton", "vale", "view", "watch",
      "water", "way", "well", "wick", "wood", "worth"
    ],
    villageSuffixes: [
      "barrow", "beck", "bridge", "brook", "bury", "by", "combe", "cote", "dale", "den", "field", "ford", "ham", "hollow", "hurst", "mere",
      "stead", "thorpe", "ton", "vale", "wick", "wood", "worth"
    ],
    citySuffixes: [
      "burg", "caster", "crown", "gate", "hall", "harbor", "haven", "hold", "keep", "market", "port", "spire", "watch"
    ],
    waterSuffixes: [
      "mere", "water", "lake", "pool", "pond", "deep", "wash", "spring", "run", "brook", "flow", "current", "reach", "ford", "basin"
    ],
    wildSuffixes: [
      "wood", "grove", "wilds", "fen", "mire", "marsh", "moor", "heath", "thicket", "brake", "copse", "hollow", "vale", "reach", "wold"
    ],
    mountainSuffixes: [
      "peak", "spire", "horn", "crag", "cliff", "ridge", "crown", "summit", "pass", "scar", "fang", "tooth", "height"
    ],
    ruinSuffixes: [
      "ruins", "stones", "arches", "vault", "gate", "stair", "cairn", "barrow", "watch", "circle", "hall", "court", "relic"
    ],
    sacredSuffixes: [
      "shrine", "sanctum", "circle", "altar", "standing stones", "chapel", "fane", "font", "oracle", "reliquary"
    ],
    lairSuffixes: [
      "burrow", "den", "nest", "lair", "hollow", "warren", "pit", "crawl", "sink", "cavern"
    ],
    campSuffixes: [
      "camp", "rest", "watch", "palisade", "crossing", "fires", "outpost", "station", "quarry", "landing", "hideout"
    ],
    prefixes: [
      "Ael", "Aer", "Al", "Am", "Ar", "Ash", "Bael", "Bar", "Bel", "Bryn", "Caer", "Cal", "Car", "Cor", "Dagger", "Dal", "Dawn", "Deep",
      "Dor", "Dun", "Eld", "Ember", "Ever", "Fal", "Fen", "Frost", "Glen", "Grey", "Hal", "Harrow", "High", "Iron", "Kel", "Kest", "Kor",
      "Lan", "Lark", "Low", "Mar", "Mere", "Mist", "Mor", "Mourn", "North", "Oak", "Old", "Raven", "Red", "Rime", "Riv", "Rose", "Salt",
      "Shadow", "Silver", "South", "Star", "Stone", "Storm", "Sun", "Thorn", "Val", "West", "White", "Wind", "Winter"
    ],
    suffixes: [
      "acre", "ash", "bell", "bend", "borne", "brook", "burn", "by", "cliff", "crest", "dale", "den", "fall", "field", "ford", "gate",
      "glen", "grave", "hall", "haven", "hearth", "helm", "hill", "hold", "hollow", "mark", "mere", "moor", "port", "reach", "ridge", "run",
      "shade", "shire", "stead", "stone", "strand", "vale", "view", "ward", "watch", "water", "well", "wick", "wood"
    ],
    lakeNouns: [
      "Mirror", "Moon", "Star", "Reed", "Mist", "Lantern", "Swan", "Heron", "Fisher", "Winter", "Summer", "Willow", "Lily", "Glass", "Bell",
      "Pearl", "Silver", "Rain", "Quiet", "Deep", "Blue", "Black", "Green", "White", "Frost", "Ash", "Thorn", "Moss"
    ],
    riverNouns: [
      "Arrow", "Barley", "Briar", "Cinder", "Crown", "Dagger", "Dawn", "Fallow", "Fennel", "Foam", "Fox", "Glass", "Heron", "Iron", "Lark",
      "Moss", "Rain", "Reed", "Rook", "Rush", "Silver", "Spear", "Stone", "Swan", "Thorn", "Trout", "Willow", "Wind"
    ],
    ancientFragments: [
      "Atha", "Belor", "Caedis", "Duskara", "Elohir", "Fara", "Gath", "Heskar", "Irun", "Jalara", "Keloth", "Lethar", "Mordain", "Neth",
      "Orun", "Palar", "Qorin", "Rhel", "Sarth", "Thalos", "Ulmar", "Vey", "Ydris", "Zalar"
    ]
  };

  const KIND_CONFIG = {
    village: { suffixes: WORDS.villageSuffixes, label: "Village" },
    hamlet: { suffixes: WORDS.villageSuffixes, label: "Hamlet" },
    town: { suffixes: [...WORDS.villageSuffixes, "market", "cross"], label: "Town" },
    city: { suffixes: WORDS.citySuffixes, label: "City" },
    harbor: { suffixes: ["harbor", "port", "landing", "quay", "haven"], label: "Harbor" },
    lake: { suffixes: WORDS.waterSuffixes, label: "Lake" },
    river: { suffixes: WORDS.waterSuffixes, label: "River" },
    forest: { suffixes: WORDS.wildSuffixes, label: "Forest" },
    swamp: { suffixes: ["fen", "mire", "marsh", "bog", "blackwater", "reedmarsh"], label: "Swamp" },
    mountain: { suffixes: WORDS.mountainSuffixes, label: "Mountain" },
    ruin: { suffixes: WORDS.ruinSuffixes, label: "Ruins" },
    shrine: { suffixes: WORDS.sacredSuffixes, label: "Shrine" },
    cave: { suffixes: ["cave", "cavern", "grotto", "hollow", "deep", "mouth"], label: "Cave" },
    mine: { suffixes: ["mine", "shaft", "delve", "pit", "lode", "quarry"], label: "Mine" },
    vineyard: { suffixes: ["vineyard", "vines", "grapes", "terraces", "press", "orchard"], label: "Vineyard" },
    farm: { suffixes: ["farm", "fields", "stead", "pastures", "mill", "acres"], label: "Farm" },
    tower: { suffixes: ["tower", "spire", "watch", "needle", "observatory"], label: "Tower" },
    burrow: { suffixes: WORDS.lairSuffixes, label: "Burrow" },
    camp: { suffixes: WORDS.campSuffixes, label: "Camp" },
    castle: { suffixes: ["castle", "keep", "hold", "fortress", "watch", "citadel"], label: "Castle" },
    road: { suffixes: ["road", "way", "trail", "path", "pass", "march"], label: "Road" },
    region: { suffixes: ["reach", "lands", "wilds", "vale", "march", "wold", "expanse"], label: "Region" },
    island: { suffixes: ["isle", "island", "key", "holm", "rock"], label: "Island" },
    battlefield: { suffixes: ["field", "battlefield", "grave", "scar", "redoubt"], label: "Battlefield" },
    generic: { suffixes: WORDS.suffixes, label: "Place" }
  };

  const BIOME_WORDS = {
    arctic: ["Frost", "Snow", "Rime", "Ice", "Winter", "White", "Aurora", "Cold", "Pale", "Glacier"],
    ashland: ["Ash", "Cinder", "Soot", "Ember", "Coal", "Smoke", "Black", "Furnace", "Pyre"],
    badlands: ["Red", "Dust", "Scar", "Vulture", "Bleak", "Dry", "Ragged", "Bone", "Dagger"],
    cave: ["Deep", "Black", "Echo", "Blind", "Hollow", "Under", "Stone", "Lantern", "Mushroom"],
    coast: ["Salt", "Gull", "Tide", "Shell", "Foam", "Wind", "Harbor", "Blue", "Pearl"],
    crystalfield: ["Crystal", "Glass", "Prism", "Shard", "Bright", "Glimmer", "Jade", "Violet"],
    desert: ["Dune", "Sun", "Gold", "Salt", "Red", "Mirage", "Saffron", "Dry", "Glass"],
    forest: ["Oak", "Pine", "Moss", "Thorn", "Briar", "Fern", "Fox", "Green", "Willow", "Holly"],
    grassland: ["Meadow", "Barley", "Clover", "Lark", "Hearth", "Golden", "Green", "Wind", "Sun"],
    highlands: ["High", "Heather", "Stone", "Glen", "Moor", "Grey", "Stag", "Cloud", "Ridge"],
    hills: ["Hill", "Hearth", "Sheep", "Barrow", "Round", "Green", "Old", "Low", "Flint"],
    jungle: ["Vine", "Emerald", "Rain", "Serpent", "Canopy", "Orchid", "Green", "Hidden", "Jaguar"],
    mountain: ["Stone", "Iron", "Anvil", "Peak", "Crag", "Storm", "Cloud", "Granite", "Frost"],
    ocean: ["Blue", "Deep", "Brine", "Foam", "Kelp", "Coral", "Wave", "Pearl", "Storm"],
    savanna: ["Gold", "Lion", "Acacia", "Sun", "Dust", "Dry", "Amber", "Grass", "Horizon"],
    swamp: ["Reed", "Mire", "Black", "Frog", "Mist", "Willow", "Bog", "Rot", "Lantern"],
    volcano: ["Fire", "Basalt", "Cinder", "Lava", "Ash", "Furnace", "Ember", "Obsidian", "Sulfur"],
    wasteland: ["Bone", "Dust", "Hollow", "Dead", "Grey", "Ruin", "Crow", "Bitter", "Lost"]
  };

  const STRUCTURE_KIND_ALIASES = [
    { prefix: "city", kind: "city" },
    { prefix: "village", kind: "village" },
    { prefix: "harbor", kind: "harbor" },
    { prefix: "castle", kind: "castle" },
    { prefix: "vineyard", kind: "vineyard" },
    { prefix: "farm", kind: "farm" },
    { prefix: "lake", kind: "lake" },
    { prefix: "entrance_mine", kind: "mine" },
    { prefix: "entrance_ironmine", kind: "mine" },
    { prefix: "entrance_goldmine", kind: "mine" },
    { prefix: "entrance_coalmine", kind: "mine" },
    { prefix: "entrance_crystalmine", kind: "mine" },
    { prefix: "entrance_saltmine", kind: "mine" },
    { prefix: "ruins", kind: "ruin" },
    { prefix: "entrance_cave", kind: "cave" },
    { prefix: "entrance", kind: "ruin" },
    { prefix: "temple", kind: "shrine" },
    { prefix: "shrine", kind: "shrine" },
    { prefix: "burrow", kind: "burrow" },
    { prefix: "camp", kind: "camp" },
    { prefix: "oldbattlefield", kind: "battlefield" },
    { prefix: "hauntedbattlefield", kind: "battlefield" },
    { prefix: "watchtower", kind: "tower" },
    { prefix: "wizardtower", kind: "tower" },
    { prefix: "bridge", kind: "road" }
  ];

  const NAMED_FEATURE_KINDS = new Set(["village", "city", "lake"]);

  const STRUCTURE_LABELS = {
    city: "City",
    city_large: "City",
    village: "Village",
    harbor: "Harbor",
    castle: "Castle",
    vineyard: "Vineyard",
    farm: "Farm",
    lake: "Lake",
    entrance_mine: "Mine Entrance",
    entrance_ironmine: "Iron Mine Entrance",
    entrance_goldmine: "Gold Mine Entrance",
    entrance_coalmine: "Coal Mine Entrance",
    entrance_crystalmine: "Crystal Mine Entrance",
    entrance_saltmine: "Salt Mine Entrance",
    entrance_cave: "Cave Entrance",
    ruins: "Ruins",
    entrance: "Ruins",
    temple: "Temple",
    shrine: "Shrine",
    burrow: "Burrow",
    camp: "Camp",
    oldbattlefield: "Old Battlefield",
    hauntedbattlefield: "Haunted Battlefield",
    watchtower: "Watchtower",
    wizardtower: "Wizard Tower",
    bridge: "Bridge"
  };

  function hashString(value) {
    let hash = 2166136261;
    const text = String(value ?? "");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function createRng(seed = Date.now()) {
    let value = hashString(seed) || 1;
    return () => {
      value += 0x6d2b79f5;
      let next = value;
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(list, rng) {
    if (!Array.isArray(list) || list.length === 0) return "";
    return list[Math.floor(rng() * list.length)];
  }

  function titleCaseToken(value) {
    return String(value ?? "")
      .split(/[_\s-]+/)
      .filter(Boolean)
      .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1).toLowerCase())
      .join(" ");
  }

  function normalizeKind(kind = "generic") {
    const normalized = String(kind || "generic").toLowerCase().replace(/[^a-z0-9_ -]/g, "");
    if (KIND_CONFIG[normalized]) return normalized;
    const alias = STRUCTURE_KIND_ALIASES.find((entry) => normalized.startsWith(entry.prefix));
    return alias?.kind ?? "generic";
  }

  function biomeGroup(tileOrGroup = "") {
    const value = String(tileOrGroup || "").toLowerCase();
    if (!value) return "";
    if (value.startsWith("arctic") || value.startsWith("actic")) return "arctic";
    if (value.startsWith("ashland")) return "ashland";
    if (value.startsWith("badlands")) return "badlands";
    if (value.startsWith("cave")) return "cave";
    if (value.startsWith("coast")) return "coast";
    if (value.startsWith("crystal")) return "crystalfield";
    if (value.startsWith("desert")) return "desert";
    if (value.startsWith("forest")) return "forest";
    if (value.startsWith("grassland")) return "grassland";
    if (value.startsWith("highlands")) return "highlands";
    if (value.startsWith("hills")) return "hills";
    if (value.startsWith("jungle")) return "jungle";
    if (value.startsWith("mountain")) return "mountain";
    if (value.startsWith("ocean")) return "ocean";
    if (value.startsWith("savanna")) return "savanna";
    if (value.startsWith("swamp")) return "swamp";
    if (value.startsWith("volcano") || value.startsWith("volcanic")) return "volcano";
    if (value.startsWith("wasteland")) return "wasteland";
    return value.split("_")[0];
  }

  function compoundName(kind, rng, options = {}) {
    const normalizedKind = normalizeKind(kind);
    const group = biomeGroup(options.biome);
    const biomeWords = BIOME_WORDS[group] ?? [];
    const config = KIND_CONFIG[normalizedKind] ?? KIND_CONFIG.generic;
    const firstPool = [
      ...biomeWords,
      ...WORDS.colors,
      ...WORDS.moods,
      ...WORDS.natural,
      ...WORDS.people
    ];
    const first = pick(firstPool, rng);
    const suffix = pick(config.suffixes, rng);
    const compactKinds = new Set(["village", "hamlet", "town", "city", "harbor"]);
    return compactKinds.has(normalizedKind) && !String(suffix).includes(" ") ? `${first}${suffix}` : `${first} ${titleCaseToken(suffix)}`;
  }

  function ancientName(rng, options = {}) {
    const a = pick(WORDS.ancientFragments, rng);
    const b = pick(WORDS.ancientFragments, rng).toLowerCase();
    const suffix = pick(options.suffixes ?? WORDS.ruinSuffixes, rng);
    return `${a}${b} ${titleCaseToken(suffix)}`;
  }

  function ofName(kind, rng, options = {}) {
    const normalizedKind = normalizeKind(kind);
    const config = KIND_CONFIG[normalizedKind] ?? KIND_CONFIG.generic;
    const group = biomeGroup(options.biome);
    const basePool = [
      ...(BIOME_WORDS[group] ?? []),
      ...WORDS.colors,
      ...WORDS.moods,
      ...WORDS.natural,
      ...WORDS.lakeNouns,
      ...WORDS.riverNouns
    ];
    if (normalizedKind === "lake" || normalizedKind === "river") {
      return `${config.label} of the ${pick(basePool, rng)} ${pick([...WORDS.natural, ...WORDS.moods], rng)}`;
    }
    return `${titleCaseToken(pick(config.suffixes, rng))} of the ${pick(basePool, rng)} ${pick([...WORDS.natural, ...WORDS.moods], rng)}`;
  }

  function prefixedName(kind, rng, options = {}) {
    const normalizedKind = normalizeKind(kind);
    const config = KIND_CONFIG[normalizedKind] ?? KIND_CONFIG.generic;
    const prefixPool = [...(BIOME_WORDS[biomeGroup(options.biome)] ?? []), ...WORDS.prefixes];
    const suffix = pick(config.suffixes, rng);
    const compactKinds = new Set(["village", "hamlet", "town", "city", "harbor"]);
    return compactKinds.has(normalizedKind) && !String(suffix).includes(" ") ? `${pick(prefixPool, rng)}${suffix}` : `${pick(prefixPool, rng)} ${titleCaseToken(suffix)}`;
  }

  function spacedName(kind, rng, options = {}) {
    const config = KIND_CONFIG[normalizeKind(kind)] ?? KIND_CONFIG.generic;
    const descriptorPool = [...(BIOME_WORDS[biomeGroup(options.biome)] ?? []), ...WORDS.colors, ...WORDS.moods, ...WORDS.natural];
    return `${pick(descriptorPool, rng)} ${titleCaseToken(pick(config.suffixes, rng))}`;
  }

  function waterName(kind, rng, options = {}) {
    const nounPool = normalizeKind(kind) === "river" ? WORDS.riverNouns : WORDS.lakeNouns;
    const patterns = [
      () => `${pick(nounPool, rng)}${pick(["mere", "water", "pool", "deep", "run", "flow"], rng)}`,
      () => `${normalizeKind(kind) === "river" ? "River" : "Lake"} ${pick(nounPool, rng)}`,
      () => `${pick([...WORDS.colors, ...WORDS.moods], rng)} ${normalizeKind(kind) === "river" ? "River" : "Lake"}`,
      () => ofName(kind, rng, options)
    ];
    return pick(patterns, rng)();
  }

  function generateName(kind = "generic", options = {}) {
    const normalizedKind = normalizeKind(kind);
    const seed = options.seed ?? `${normalizedKind}:${options.biome ?? ""}:${options.id ?? ""}:${options.index ?? ""}`;
    const rng = options.rng ?? createRng(seed);
    if (normalizedKind === "lake" || normalizedKind === "river") return waterName(normalizedKind, rng, options);

    const patterns = [
      () => compoundName(normalizedKind, rng, options),
      () => prefixedName(normalizedKind, rng, options),
      () => spacedName(normalizedKind, rng, options),
      () => ofName(normalizedKind, rng, options)
    ];
    if (["ruin", "shrine", "cave"].includes(normalizedKind)) patterns.push(() => ancientName(rng, { suffixes: KIND_CONFIG[normalizedKind].suffixes }));
    return pick(patterns, rng)();
  }

  function generateMany(kind = "generic", count = 10, options = {}) {
    const names = [];
    const used = new Set();
    let attempts = 0;
    while (names.length < count && attempts < count * 20) {
      const name = generateName(kind, { ...options, index: attempts, seed: `${options.seed ?? kind}:${attempts}` });
      attempts += 1;
      if (used.has(name)) continue;
      used.add(name);
      names.push(name);
    }
    return names;
  }

  function structureKind(tileId = "") {
    return normalizeKind(tileId);
  }

  function shouldGenerateFeatureName(kindOrTile = "") {
    return NAMED_FEATURE_KINDS.has(normalizeKind(kindOrTile));
  }

  function structureLabel(tileOrKind = "") {
    const normalizedTile = String(tileOrKind || "").toLowerCase().replace(/[^a-z0-9_ -]/g, "");
    if (STRUCTURE_LABELS[normalizedTile]) return STRUCTURE_LABELS[normalizedTile];
    const kind = normalizeKind(normalizedTile);
    return KIND_CONFIG[kind]?.label ?? titleCaseToken(normalizedTile || "structure");
  }

  function nameFeature(feature = {}, options = {}) {
    const kind = normalizeKind(options.kind ?? feature.kind ?? feature.type ?? feature.tile ?? "generic");
    const seed = options.seed ?? feature.id ?? `${feature.tile ?? kind}:${feature.x ?? feature.col ?? 0}:${feature.y ?? feature.row ?? 0}`;
    if (!shouldGenerateFeatureName(kind)) {
      return {
        ...feature,
        name: "",
        nameKind: kind,
        generatedName: false
      };
    }
    return {
      ...feature,
      name: feature.name || generateName(kind, { ...options, seed, biome: options.biome ?? feature.biome }),
      nameKind: kind,
      generatedName: feature.generatedName ?? !feature.name
    };
  }

  window.DepthboundWorldNames = {
    WORDS,
    KIND_CONFIG,
    BIOME_WORDS,
    createRng,
    generateName,
    generateMany,
    nameFeature,
    normalizeKind,
    structureKind,
    shouldGenerateFeatureName,
    structureLabel,
    biomeGroup
  };
})();
