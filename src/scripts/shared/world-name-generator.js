(() => {
  const DEFAULT_PRESET_COUNT = 500;

  const WORDS = {
    colors: [
      "Amber", "Amethyst", "Apricot", "Ashen", "Azure", "Black", "Blue", "Bone", "Brass", "Bright", "Bronze", "Brown", "Carmine", "Celadon", "Cerulean",
      "Copper", "Coral", "Crimson", "Dark", "Dawn", "Deep", "Dun", "Dusky", "Ebon", "Ember", "Emerald", "Fallow", "Frost", "Ghost", "Glass",
      "Golden", "Gray", "Green", "Honey", "Indigo", "Iron", "Ivory", "Jade", "Lavender", "Lilac", "Marble", "Moon", "Moss", "Ochre", "Opal",
      "Pale", "Pearl", "Red", "Reed", "Rose", "Ruby", "Russet", "Sable", "Saffron", "Scarlet", "Sepia", "Shadow", "Silver", "Slate", "Snow",
      "Star", "Stone", "Sun", "Teal", "Umber", "Verdant", "Vermilion", "Violet", "Viridian", "White"
    ],

    moods: [
      "Ancient", "Bitter", "Blessed", "Bleak", "Broken", "Buried", "Cold", "Crooked", "Crowned", "Dancing", "Distant", "Drowned", "Elder", "Fallen",
      "Far", "Feral", "Forgotten", "Gentle", "Grim", "Hidden", "Hollow", "Hushed", "Last", "Little", "Long", "Lost", "Low", "Mournful",
      "Nameless", "Old", "Quiet", "Ragged", "Restless", "Royal", "Sacred", "Secret", "Shattered", "Silent", "Sleeping", "Sorrow", "Still", "Storm",
      "Sunken", "Thorn", "Twilight", "Veiled", "Wandering", "Weathered", "Whispering", "Wild", "Witching", "Withered"
    ],

    natural: [
      "Alder", "Apple", "Ash", "Aspen", "Badger", "Barley", "Beech", "Berry", "Birch", "Boar", "Bramble", "Briar", "Brook", "Cedar", "Clover",
      "Crow", "Deer", "Elm", "Falcon", "Fern", "Finch", "Fir", "Flint", "Fox", "Hare", "Hazel", "Heather", "Holly", "Ivy", "Juniper",
      "Larch", "Laurel", "Maple", "Marsh", "Meadow", "Mire", "Moss", "Oak", "Otter", "Pine", "Rain", "Raven", "Reed", "River", "Rowan",
      "Rush", "Sage", "Sparrow", "Spring", "Stag", "Stone", "Thistle", "Thorn", "Vale", "Vine", "Willow", "Wind", "Wolf", "Yew"
    ],

    water: [
      "Arrow", "Barley", "Briar", "Brine", "Cinder", "Crown", "Dagger", "Dawn", "Fallow", "Fennel", "Foam", "Fox", "Glass", "Heron", "Iron",
      "Kelp", "Lantern", "Lily", "Mirror", "Mist", "Moon", "Moss", "Pearl", "Rain", "Reed", "Rill", "Rook", "Rush", "Silver", "Spear",
      "Star", "Stone", "Swan", "Thorn", "Tide", "Trout", "Willow", "Wind"
    ],

    earth: [
      "Anvil", "Basalt", "Boulder", "Cairn", "Chalk", "Clay", "Coal", "Crag", "Crystal", "Diamond", "Dust", "Flint", "Granite", "Gravel",
      "Iron", "Limestone", "Marble", "Obsidian", "Ore", "Quartz", "Ridge", "Salt", "Sand", "Shard", "Slate", "Stone", "Tin", "Vein"
    ],

    fire: [
      "Ash", "Bellows", "Blaze", "Brand", "Cinder", "Coal", "Ember", "Flame", "Forge", "Furnace", "Glow", "Hearth", "Kiln", "Lantern",
      "Lava", "Pyre", "Smoke", "Spark", "Sulfur", "Torch"
    ],

    weather: [
      "Aurora", "Cloud", "Drizzle", "Fog", "Frost", "Gale", "Hail", "Lightning", "Mist", "Rain", "Rime", "Snow", "Squall", "Storm",
      "Sun", "Thunder", "Wind"
    ],

    people: [
      "Ald", "Ansel", "Arlen", "Bram", "Bran", "Calder", "Cedric", "Corin", "Dain", "Doran", "Edric", "Elda", "Elian", "Elowen", "Fenn",
      "Garron", "Hadley", "Harlan", "Ilyra", "Isolde", "Jorin", "Kael", "Kara", "Liora", "Mara", "Merrin", "Nessa", "Oren", "Orla",
      "Perrin", "Riven", "Rowan", "Seren", "Tamsin", "Taren", "Thane", "Vera", "Wren", "Yorin"
    ],

    oldOccupations: [
      "Baker", "Binder", "Brewer", "Carter", "Chandler", "Cooper", "Dyer", "Fletcher", "Glasswright", "Gravesinger", "Herbalist", "Hunter",
      "Mason", "Miller", "Miner", "Reeve", "Shepherd", "Smith", "Tanner", "Wainwright", "Weaver", "Wheelwright"
    ],

    roots: [
      "aber", "acre", "arden", "barrow", "bast", "beck", "bel", "briar", "bridge", "brook", "burn", "bury", "cairn", "car", "caster", "cliff",
      "combe", "cote", "cross", "dale", "deep", "den", "down", "drift", "dun", "edge", "fall", "fell", "fen", "field", "ford", "gate", "glen",
      "grave", "grove", "hall", "ham", "harrow", "haven", "hearth", "helm", "hill", "hold", "hollow", "hurst", "keep", "kirk", "land", "leigh",
      "mere", "moor", "moss", "pass", "reach", "ridge", "rim", "rock", "run", "stead", "stone", "strand", "thorpe", "ton", "vale", "view",
      "watch", "water", "way", "well", "wick", "wood", "worth"
    ],

    prefixes: [
      "Ael", "Aer", "Al", "Am", "Ar", "Ash", "Bael", "Bar", "Bel", "Bryn", "Caer", "Cal", "Car", "Cor", "Dagger", "Dal", "Dawn", "Deep",
      "Dor", "Dun", "Eld", "Ember", "Ever", "Fal", "Fen", "Frost", "Glen", "Grey", "Hal", "Harrow", "High", "Iron", "Kel", "Kest", "Kor",
      "Lan", "Lark", "Low", "Mar", "Mere", "Mist", "Mor", "Mourn", "North", "Oak", "Old", "Raven", "Red", "Rime", "Riv", "Rose", "Salt",
      "Shadow", "Silver", "South", "Star", "Stone", "Storm", "Sun", "Thorn", "Val", "West", "White", "Wind", "Winter", "Wyrm"
    ],

    suffixes: [
      "acre", "ash", "bell", "bend", "borne", "brook", "burn", "by", "cliff", "crest", "dale", "den", "fall", "field", "ford", "gate",
      "glen", "grave", "hall", "haven", "hearth", "helm", "hill", "hold", "hollow", "mark", "mere", "moor", "port", "reach", "ridge",
      "run", "shade", "shire", "stead", "stone", "strand", "vale", "view", "ward", "watch", "water", "well", "wick", "wood"
    ],

    villageSuffixes: [
      "barrow", "beck", "bridge", "brook", "bury", "by", "combe", "cote", "dale", "den", "field", "ford", "ham", "hollow", "hurst", "mere",
      "mill", "stead", "thorpe", "ton", "vale", "wick", "wood", "worth"
    ],

    citySuffixes: [
      "burg", "caster", "crown", "gate", "hall", "harbor", "haven", "hold", "keep", "market", "port", "spire", "watch", "ward", "wall"
    ],

    waterSuffixes: [
      "mere", "water", "lake", "pool", "pond", "deep", "wash", "spring", "run", "brook", "flow", "current", "reach", "ford", "basin",
      "rill", "stream", "tarn", "lagoon", "bay", "inlet", "fenwater"
    ],

    wildSuffixes: [
      "wood", "grove", "wilds", "fen", "mire", "marsh", "moor", "heath", "thicket", "brake", "copse", "hollow", "vale", "reach", "wold",
      "canopy", "boughs", "glade", "green", "weald"
    ],

    mountainSuffixes: [
      "peak", "spire", "horn", "crag", "cliff", "ridge", "crown", "summit", "pass", "scar", "fang", "tooth", "height", "slope",
      "shoulder", "needle", "anvil", "tor"
    ],

    ruinSuffixes: [
      "ruins", "stones", "arches", "vault", "gate", "stair", "cairn", "barrow", "watch", "circle", "hall", "court", "relic", "obelisk",
      "foundation", "remnant", "sepulcher", "broken crown"
    ],

    sacredSuffixes: [
      "shrine", "sanctum", "circle", "altar", "standing stones", "chapel", "fane", "font", "oracle", "reliquary", "priory", "monastery",
      "abbey", "garden", "vestry"
    ],

    lairSuffixes: [
      "burrow", "den", "nest", "lair", "hollow", "warren", "pit", "crawl", "sink", "cavern", "hole", "scrape", "roost"
    ],

    campSuffixes: [
      "camp", "rest", "watch", "palisade", "crossing", "fires", "outpost", "station", "quarry", "landing", "hideout", "stockade",
      "encampment", "bivouac", "rally"
    ],

    ancientFragments: [
      "Atha", "Belor", "Caedis", "Duskara", "Elohir", "Fara", "Gath", "Heskar", "Irun", "Jalara", "Keloth", "Lethar", "Mordain", "Neth",
      "Orun", "Palar", "Qorin", "Rhel", "Sarth", "Thalos", "Ulmar", "Vey", "Ydris", "Zalar", "Anku", "Drav", "Eresh", "Ith", "Karn",
      "Lorath", "Myr", "Ossu", "Phaer", "Ruun", "Syr", "Tava", "Vor", "Xel", "Zuun"
    ]
  };

  const CULTURE_WORDS = {
    common: {
      descriptors: ["Green", "Stone", "Miller", "Hearth", "Brook", "Old", "High", "Low", "King", "Queen", "Market", "Shepherd", "Warden"],
      prefixes: ["Ald", "Bar", "Bel", "Bram", "Cal", "Car", "Dun", "Ed", "Fen", "Gar", "Hal", "Mar", "Nor", "Oak", "Red", "West"],
      suffixes: ["ford", "ham", "ton", "wick", "bury", "stead", "field", "worth", "market", "bridge"]
    },
    elven: {
      descriptors: ["Ael", "Moon", "Star", "Silver", "Willow", "Lorien", "Everbloom", "Glass", "Mist", "Dawn", "Violet", "Swan"],
      prefixes: ["Ael", "Aer", "Ela", "Faer", "Iri", "Lau", "Lio", "Myr", "Nym", "Sael", "Shae", "Syl", "Tha", "Vael"],
      suffixes: ["lath", "rion", "thalas", "wyn", "lora", "syl", "dell", "vyr", "mir", "neth"]
    },
    dwarven: {
      descriptors: ["Anvil", "Iron", "Hammer", "Deep", "Forge", "Keg", "Granite", "Copper", "Coal", "Oath", "Vault", "Rune"],
      prefixes: ["Bar", "Beld", "Brom", "Dorn", "Dur", "Garr", "Grim", "Khar", "Mor", "Thar", "Tor", "Ulf"],
      suffixes: ["delve", "hold", "barak", "grum", "kaz", "kuld", "forge", "deep", "vault", "anvil"]
    },
    nordic: {
      descriptors: ["Frost", "Rime", "Wolf", "Bear", "Raven", "Storm", "Long", "Skald", "Whale", "Spear", "Winter", "Shield"],
      prefixes: ["Astr", "Bjorn", "Eir", "Fjord", "Hrafn", "Jor", "Kald", "Ragn", "Skor", "Svan", "Tyr", "Ul"],
      suffixes: ["vik", "fjord", "heim", "gard", "skald", "holm", "ness", "havn", "fell", "borg"]
    },
    desert: {
      descriptors: ["Sun", "Dune", "Saffron", "Mirage", "Salt", "Scorpion", "Glass", "Sirocco", "Oasis", "Amber", "Sultan", "Caravan"],
      prefixes: ["Akh", "Az", "Bah", "Dar", "Im", "Jas", "Kha", "Mir", "Qas", "Rash", "Sam", "Zah"],
      suffixes: ["qamar", "sahir", "dara", "azir", "kesh", "mir", "sarra", "zir", "dune", "oasis"]
    },
    steppe: {
      descriptors: ["Horse", "Kite", "Grass", "Sky", "Horizon", "Yurt", "Arrow", "Thunder", "Open", "Dust", "Mare", "Falcon"],
      prefixes: ["Ar", "Batu", "Kara", "Kesh", "Naran", "Ordu", "Sarn", "Tolu", "Ulan", "Yeke"],
      suffixes: ["kur", "tal", "ordu", "steppe", "gol", "khur", "qan", "teng", "yurt", "wind"]
    },
    jungle: {
      descriptors: ["Emerald", "Vine", "Serpent", "Orchid", "Rain", "Canopy", "Jaguar", "Hidden", "Root", "Parrot", "Green", "Temple"],
      prefixes: ["Chak", "Ix", "Kan", "Koa", "Maka", "Nahu", "Oro", "Tala", "Uru", "Xil", "Yara", "Zin"],
      suffixes: ["canopy", "tikal", "xal", "vara", "zuma", "root", "temple", "orchid", "rain", "green"]
    },
    coastal: {
      descriptors: ["Salt", "Gull", "Tide", "Kelp", "Pearl", "Foam", "Harbor", "Anchor", "Shell", "Blue", "Net", "Brine"],
      prefixes: ["Brin", "Coast", "Gull", "Mar", "Pearl", "Salt", "Shell", "Tide", "Wave", "Wind"],
      suffixes: ["port", "quay", "haven", "bay", "inlet", "holm", "strand", "dock", "harbor", "tide"]
    },
    infernal: {
      descriptors: ["Ash", "Chain", "Brand", "Brimstone", "Cinder", "Iron", "Red", "Black", "Oath", "Wicked", "Hell", "Sulfur"],
      prefixes: ["Az", "Bel", "Car", "Draz", "Mal", "Ner", "Rhaz", "Vor", "Xar", "Zul"],
      suffixes: ["mord", "kar", "zeth", "brand", "chain", "pyre", "fane", "scar", "gate", "vault"]
    },
    celestial: {
      descriptors: ["Dawn", "Star", "Aureate", "Halo", "Radiant", "Gold", "White", "Seraph", "Crown", "Mercy", "Bell", "Sun"],
      prefixes: ["Auri", "Cael", "Ely", "Hali", "Lumen", "Ora", "Ser", "Sol", "Val", "Zion"],
      suffixes: ["dawn", "spire", "sanctum", "halo", "light", "font", "aure", "mercy", "crown", "bell"]
    },
    underdark: {
      descriptors: ["Deep", "Blind", "Mushroom", "Echo", "Black", "Crystal", "Fungal", "Glow", "Umber", "Night", "Drip", "Chasm"],
      prefixes: ["Drik", "Gloam", "Kez", "Nar", "Nul", "Oth", "Ssz", "Thul", "Vorn", "Zil"],
      suffixes: ["deep", "grotto", "chasm", "spore", "glow", "vault", "drip", "cavern", "black", "under"]
    },
    halfling: {
      descriptors: ["Apple", "Honey", "Hearth", "Pip", "Barley", "Pipe", "Merry", "Little", "Cider", "Bramble", "Warm", "Supper"],
      prefixes: ["Bell", "Bram", "Cobb", "Dew", "Fin", "Hob", "Merr", "Pip", "Ros", "Tuck"],
      suffixes: ["by", "burrow", "field", "patch", "mill", "hearth", "garden", "brook", "hill", "meadow"]
    },
    orcish: {
      descriptors: ["Tusker", "Red", "Iron", "Blood", "Drum", "Skull", "Fang", "Smoke", "War", "Black", "Bone", "Axe"],
      prefixes: ["Barg", "Drog", "Ghar", "Gruk", "Krag", "Mog", "Ruk", "Thog", "Urg", "Zarg"],
      suffixes: ["gash", "hold", "drum", "fang", "skull", "camp", "scar", "grub", "rock", "pit"]
    },
    gnomish: {
      descriptors: ["Copper", "Cog", "Spark", "Tinker", "Bright", "Bell", "Gear", "Whistle", "Lantern", "Clock", "Bubble", "Glim"],
      prefixes: ["Bix", "Fizz", "Glim", "Kip", "Nim", "Pock", "Quib", "Tib", "Wizzle", "Zan"],
      suffixes: ["wick", "whistle", "gear", "spark", "pocket", "bell", "cog", "nook", "tinker", "works"]
    },
    ancient: {
      descriptors: ["Aurelian", "Elder", "First", "Sunken", "Old", "Lost", "Rune", "Obelisk", "Oracle", "Sable", "Titan", "Nameless"],
      prefixes: ["Atha", "Belor", "Caedis", "Duskara", "Elohir", "Gath", "Heskar", "Keloth", "Mordain", "Thalos", "Ulmar", "Zalar"],
      suffixes: ["gate", "vault", "cairn", "obelisk", "circle", "relic", "court", "stair", "sanctum", "ruin"]
    }
  };

  const KIND_CONFIG = {
    village: { suffixes: WORDS.villageSuffixes, label: "Village" },
    hamlet: { suffixes: WORDS.villageSuffixes, label: "Hamlet" },
    town: { suffixes: [...WORDS.villageSuffixes, "market", "cross", "square", "common"], label: "Town" },
    city: { suffixes: WORDS.citySuffixes, label: "City" },
    harbor: { suffixes: ["harbor", "port", "landing", "quay", "haven", "dock", "anchorage", "breakwater"], label: "Harbor" },
    lake: { suffixes: WORDS.waterSuffixes, label: "Lake" },
    river: { suffixes: WORDS.waterSuffixes, label: "River" },
    forest: { suffixes: WORDS.wildSuffixes, label: "Forest" },
    swamp: { suffixes: ["fen", "mire", "marsh", "bog", "blackwater", "reedmarsh", "sink", "wetlands", "muck"], label: "Swamp" },
    mountain: { suffixes: WORDS.mountainSuffixes, label: "Mountain" },
    ruin: { suffixes: WORDS.ruinSuffixes, label: "Ruins" },
    shrine: { suffixes: WORDS.sacredSuffixes, label: "Shrine" },
    cave: { suffixes: ["cave", "cavern", "grotto", "hollow", "deep", "mouth", "tunnel", "sink", "chasm"], label: "Cave" },
    mine: { suffixes: ["mine", "shaft", "delve", "pit", "lode", "quarry", "vein", "works", "dig"], label: "Mine" },
    vineyard: { suffixes: ["vineyard", "vines", "grapes", "terraces", "press", "orchard", "cellar", "rows"], label: "Vineyard" },
    farm: { suffixes: ["farm", "fields", "stead", "pastures", "mill", "acres", "barn", "orchard", "range"], label: "Farm" },
    tower: { suffixes: ["tower", "spire", "watch", "needle", "observatory", "belfry", "turret", "rookery"], label: "Tower" },
    burrow: { suffixes: WORDS.lairSuffixes, label: "Burrow" },
    camp: { suffixes: WORDS.campSuffixes, label: "Camp" },
    castle: { suffixes: ["castle", "keep", "hold", "fortress", "watch", "citadel", "bailey", "redoubt", "bastion"], label: "Castle" },
    road: { suffixes: ["road", "way", "trail", "path", "pass", "march", "causeway", "track", "route"], label: "Road" },
    region: { suffixes: ["reach", "lands", "wilds", "vale", "march", "wold", "expanse", "domain", "frontier", "fold"], label: "Region" },
    island: { suffixes: ["isle", "island", "key", "holm", "rock", "atoll", "skerry"], label: "Island" },
    battlefield: { suffixes: ["field", "battlefield", "grave", "scar", "redoubt", "slaughter", "stand", "bannerfall"], label: "Battlefield" },
    bridge: { suffixes: ["bridge", "crossing", "span", "ford", "causeway", "arch", "viaduct"], label: "Bridge" },
    inn: { suffixes: ["inn", "tavern", "rest", "alehouse", "hearth", "taproom", "lodge"], label: "Inn" },
    temple: { suffixes: ["temple", "sanctum", "fane", "chapel", "cathedral", "reliquary", "priory"], label: "Temple" },
    dungeon: { suffixes: ["dungeon", "gaol", "pit", "vault", "cellars", "underhold", "oubliette"], label: "Dungeon" },
    fortress: { suffixes: ["fortress", "fort", "redoubt", "wall", "bastion", "citadel", "bulwark"], label: "Fortress" },
    oasis: { suffixes: ["oasis", "spring", "palm", "well", "pool", "garden", "shade"], label: "Oasis" },
    canyon: { suffixes: ["canyon", "gorge", "ravine", "gulch", "scar", "rift", "cut"], label: "Canyon" },
    desert: { suffixes: ["dunes", "waste", "sands", "erg", "saltflat", "mirage", "expanse"], label: "Desert" },
    glacier: { suffixes: ["glacier", "icefield", "floe", "rime", "snowfield", "whiteflow"], label: "Glacier" },
    volcano: { suffixes: ["volcano", "caldera", "cindercone", "furnace", "crater", "firemount"], label: "Volcano" },
    market: { suffixes: ["market", "bazaar", "square", "exchange", "fair", "plaza"], label: "Market" },
    monastery: { suffixes: ["monastery", "abbey", "cloister", "priory", "retreat", "scriptorium"], label: "Monastery" },
    graveyard: { suffixes: ["graveyard", "cemetery", "boneyard", "barrowfield", "cryptfield", "memorial"], label: "Graveyard" },
    portal: { suffixes: ["portal", "rift", "gate", "threshold", "tear", "archway", "breach"], label: "Portal" },
    grove: { suffixes: ["grove", "glade", "circle", "copse", "green", "boughs"], label: "Grove" },
    pass: { suffixes: ["pass", "gap", "saddle", "gate", "notch", "trail"], label: "Pass" },
    quarry: { suffixes: ["quarry", "cut", "pit", "stoneworks", "dig", "scar"], label: "Quarry" },
    lighthouse: { suffixes: ["lighthouse", "beacon", "lamp", "watch", "light", "signal"], label: "Lighthouse" },
    mill: { suffixes: ["mill", "watermill", "windmill", "wheel", "grind", "press"], label: "Mill" },
    academy: { suffixes: ["academy", "college", "lyceum", "school", "archive", "athenaeum"], label: "Academy" },
    guildhall: { suffixes: ["guildhall", "hall", "lodge", "house", "union", "chapterhouse"], label: "Guildhall" },
    generic: { suffixes: WORDS.suffixes, label: "Place" }
  };

  const BIOME_WORDS = {
    arctic: ["Frost", "Snow", "Rime", "Ice", "Winter", "White", "Aurora", "Cold", "Pale", "Glacier", "Seal", "Walrus", "Blue"],
    ashland: ["Ash", "Cinder", "Soot", "Ember", "Coal", "Smoke", "Black", "Furnace", "Pyre", "Char", "Grey"],
    badlands: ["Red", "Dust", "Scar", "Vulture", "Bleak", "Dry", "Ragged", "Bone", "Dagger", "Coyote", "Salt"],
    cave: ["Deep", "Black", "Echo", "Blind", "Hollow", "Under", "Stone", "Lantern", "Mushroom", "Drip", "Crystal"],
    coast: ["Salt", "Gull", "Tide", "Shell", "Foam", "Wind", "Harbor", "Blue", "Pearl", "Kelp", "Anchor"],
    crystalfield: ["Crystal", "Glass", "Prism", "Shard", "Bright", "Glimmer", "Jade", "Violet", "Quartz", "Opal"],
    desert: ["Dune", "Sun", "Gold", "Salt", "Red", "Mirage", "Saffron", "Dry", "Glass", "Scorpion", "Oasis"],
    forest: ["Oak", "Pine", "Moss", "Thorn", "Briar", "Fern", "Fox", "Green", "Willow", "Holly", "Stag"],
    grassland: ["Meadow", "Barley", "Clover", "Lark", "Hearth", "Golden", "Green", "Wind", "Sun", "Sheep"],
    highlands: ["High", "Heather", "Stone", "Glen", "Moor", "Grey", "Stag", "Cloud", "Ridge", "Hawk"],
    hills: ["Hill", "Hearth", "Sheep", "Barrow", "Round", "Green", "Old", "Low", "Flint", "Hare"],
    jungle: ["Vine", "Emerald", "Rain", "Serpent", "Canopy", "Orchid", "Green", "Hidden", "Jaguar", "Parrot"],
    mountain: ["Stone", "Iron", "Anvil", "Peak", "Crag", "Storm", "Cloud", "Granite", "Frost", "Goat"],
    ocean: ["Blue", "Deep", "Brine", "Foam", "Kelp", "Coral", "Wave", "Pearl", "Storm", "Whale"],
    savanna: ["Gold", "Lion", "Acacia", "Sun", "Dust", "Dry", "Amber", "Grass", "Horizon", "Thorn"],
    swamp: ["Reed", "Mire", "Black", "Frog", "Mist", "Willow", "Bog", "Rot", "Lantern", "Cypress"],
    volcano: ["Fire", "Basalt", "Cinder", "Lava", "Ash", "Furnace", "Ember", "Obsidian", "Sulfur", "Smoke"],
    wasteland: ["Bone", "Dust", "Hollow", "Dead", "Grey", "Ruin", "Crow", "Bitter", "Lost", "Thirst"]
  };

  const STRUCTURE_KIND_ALIASES = [
    { prefix: "city_large", kind: "city" },
    { prefix: "city", kind: "city" },
    { prefix: "village", kind: "village" },
    { prefix: "town", kind: "town" },
    { prefix: "hamlet", kind: "hamlet" },
    { prefix: "harbor", kind: "harbor" },
    { prefix: "castle", kind: "castle" },
    { prefix: "fortress", kind: "fortress" },
    { prefix: "vineyard", kind: "vineyard" },
    { prefix: "farm", kind: "farm" },
    { prefix: "lake", kind: "lake" },
    { prefix: "river", kind: "river" },
    { prefix: "forest", kind: "forest" },
    { prefix: "swamp", kind: "swamp" },
    { prefix: "mountain", kind: "mountain" },
    { prefix: "entrance_mine", kind: "mine" },
    { prefix: "entrance_ironmine", kind: "mine" },
    { prefix: "entrance_goldmine", kind: "mine" },
    { prefix: "entrance_coalmine", kind: "mine" },
    { prefix: "entrance_crystalmine", kind: "mine" },
    { prefix: "entrance_saltmine", kind: "mine" },
    { prefix: "ruins", kind: "ruin" },
    { prefix: "ruin", kind: "ruin" },
    { prefix: "entrance_cave", kind: "cave" },
    { prefix: "cave", kind: "cave" },
    { prefix: "entrance", kind: "ruin" },
    { prefix: "temple", kind: "temple" },
    { prefix: "shrine", kind: "shrine" },
    { prefix: "burrow", kind: "burrow" },
    { prefix: "camp", kind: "camp" },
    { prefix: "oldbattlefield", kind: "battlefield" },
    { prefix: "hauntedbattlefield", kind: "battlefield" },
    { prefix: "battlefield", kind: "battlefield" },
    { prefix: "watchtower", kind: "tower" },
    { prefix: "wizardtower", kind: "tower" },
    { prefix: "tower", kind: "tower" },
    { prefix: "bridge", kind: "bridge" },
    { prefix: "road", kind: "road" },
    { prefix: "island", kind: "island" },
    { prefix: "inn", kind: "inn" },
    { prefix: "tavern", kind: "inn" },
    { prefix: "dungeon", kind: "dungeon" },
    { prefix: "oasis", kind: "oasis" },
    { prefix: "canyon", kind: "canyon" },
    { prefix: "desert", kind: "desert" },
    { prefix: "glacier", kind: "glacier" },
    { prefix: "volcano", kind: "volcano" },
    { prefix: "market", kind: "market" },
    { prefix: "monastery", kind: "monastery" },
    { prefix: "graveyard", kind: "graveyard" },
    { prefix: "portal", kind: "portal" },
    { prefix: "grove", kind: "grove" },
    { prefix: "pass", kind: "pass" },
    { prefix: "quarry", kind: "quarry" },
    { prefix: "lighthouse", kind: "lighthouse" },
    { prefix: "mill", kind: "mill" },
    { prefix: "academy", kind: "academy" },
    { prefix: "guildhall", kind: "guildhall" }
  ];

  const NAMED_FEATURE_KINDS = new Set(Object.keys(KIND_CONFIG).filter((kind) => kind !== "generic"));

  const STRUCTURE_LABELS = {
    city: "City",
    city_large: "City",
    village: "Village",
    town: "Town",
    hamlet: "Hamlet",
    harbor: "Harbor",
    castle: "Castle",
    fortress: "Fortress",
    vineyard: "Vineyard",
    farm: "Farm",
    lake: "Lake",
    river: "River",
    forest: "Forest",
    swamp: "Swamp",
    mountain: "Mountain",
    entrance_mine: "Mine Entrance",
    entrance_ironmine: "Iron Mine Entrance",
    entrance_goldmine: "Gold Mine Entrance",
    entrance_coalmine: "Coal Mine Entrance",
    entrance_crystalmine: "Crystal Mine Entrance",
    entrance_saltmine: "Salt Mine Entrance",
    entrance_cave: "Cave Entrance",
    cave: "Cave",
    ruins: "Ruins",
    ruin: "Ruins",
    entrance: "Ruins",
    temple: "Temple",
    shrine: "Shrine",
    burrow: "Burrow",
    camp: "Camp",
    oldbattlefield: "Old Battlefield",
    hauntedbattlefield: "Haunted Battlefield",
    battlefield: "Battlefield",
    watchtower: "Watchtower",
    wizardtower: "Wizard Tower",
    tower: "Tower",
    bridge: "Bridge",
    road: "Road",
    region: "Region",
    island: "Island",
    inn: "Inn",
    tavern: "Tavern",
    dungeon: "Dungeon",
    oasis: "Oasis",
    canyon: "Canyon",
    desert: "Desert",
    glacier: "Glacier",
    volcano: "Volcano",
    market: "Market",
    monastery: "Monastery",
    graveyard: "Graveyard",
    portal: "Portal",
    grove: "Grove",
    pass: "Pass",
    quarry: "Quarry",
    lighthouse: "Lighthouse",
    mill: "Mill",
    academy: "Academy",
    guildhall: "Guildhall"
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

  function titleCaseWords(value) {
    return String(value ?? "")
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
      .join(" ");
  }

  function cleanPlaceName(value) {
    return titleCaseWords(String(value ?? "")
      .replace(/\s+/g, " ")
      .replace(/\bOf The The\b/g, "of the")
      .replace(/\bThe The\b/g, "the")
      .trim());
  }

  function normalizeKind(kind = "generic") {
    const normalized = String(kind || "generic").toLowerCase().replace(/[^a-z0-9_ -]/g, "");
    if (KIND_CONFIG[normalized]) return normalized;
    const alias = STRUCTURE_KIND_ALIASES.find((entry) => normalized.startsWith(entry.prefix));
    return alias?.kind ?? "generic";
  }

  function normalizeCulture(culture = "") {
    const normalized = String(culture || "").toLowerCase().replace(/[^a-z0-9_ -]/g, "");
    if (CULTURE_WORDS[normalized]) return normalized;
    if (normalized.startsWith("elf")) return "elven";
    if (normalized.startsWith("dwarf")) return "dwarven";
    if (normalized.startsWith("north") || normalized.startsWith("viking") || normalized.startsWith("frost")) return "nordic";
    if (normalized.startsWith("coast") || normalized.startsWith("sea")) return "coastal";
    if (normalized.startsWith("ancient") || normalized.startsWith("ruin")) return "ancient";
    return "";
  }

  function biomeGroup(tileOrGroup = "") {
    const value = String(tileOrGroup || "").toLowerCase();
    if (!value) return "";
    if (value.startsWith("arctic") || value.startsWith("actic") || value.startsWith("ice")) return "arctic";
    if (value.startsWith("ashland")) return "ashland";
    if (value.startsWith("badlands")) return "badlands";
    if (value.startsWith("cave") || value.startsWith("underdark")) return "cave";
    if (value.startsWith("coast") || value.startsWith("shore")) return "coast";
    if (value.startsWith("crystal")) return "crystalfield";
    if (value.startsWith("desert")) return "desert";
    if (value.startsWith("forest")) return "forest";
    if (value.startsWith("grassland")) return "grassland";
    if (value.startsWith("highlands")) return "highlands";
    if (value.startsWith("hills")) return "hills";
    if (value.startsWith("jungle")) return "jungle";
    if (value.startsWith("mountain")) return "mountain";
    if (value.startsWith("ocean") || value.startsWith("sea")) return "ocean";
    if (value.startsWith("savanna")) return "savanna";
    if (value.startsWith("swamp")) return "swamp";
    if (value.startsWith("volcano") || value.startsWith("volcanic")) return "volcano";
    if (value.startsWith("wasteland")) return "wasteland";
    return value.split("_")[0];
  }

  function descriptorPool(options = {}) {
    const group = biomeGroup(options.biome);
    const culture = normalizeCulture(options.culture);
    return [
      ...(BIOME_WORDS[group] ?? []),
      ...(CULTURE_WORDS[culture]?.descriptors ?? []),
      ...WORDS.colors,
      ...WORDS.moods,
      ...WORDS.natural,
      ...WORDS.water,
      ...WORDS.earth,
      ...WORDS.fire,
      ...WORDS.weather,
      ...WORDS.people
    ];
  }

  function prefixPool(options = {}) {
    const culture = normalizeCulture(options.culture);
    return [
      ...(CULTURE_WORDS[culture]?.prefixes ?? []),
      ...(BIOME_WORDS[biomeGroup(options.biome)] ?? []),
      ...WORDS.prefixes,
      ...WORDS.people,
      ...WORDS.natural
    ];
  }

  function suffixPool(kind, options = {}) {
    const normalizedKind = normalizeKind(kind);
    const culture = normalizeCulture(options.culture);
    return [
      ...(KIND_CONFIG[normalizedKind]?.suffixes ?? KIND_CONFIG.generic.suffixes),
      ...(CULTURE_WORDS[culture]?.suffixes ?? [])
    ];
  }

  function compoundName(kind, rng, options = {}) {
    const normalizedKind = normalizeKind(kind);
    const first = pick(descriptorPool(options), rng);
    const suffix = pick(suffixPool(normalizedKind, options), rng);
    const compactKinds = new Set(["village", "hamlet", "town", "city", "harbor", "inn", "mill"]);
    const result = compactKinds.has(normalizedKind) && !String(suffix).includes(" ")
      ? `${first}${suffix}`
      : `${first} ${titleCaseToken(suffix)}`;
    return cleanPlaceName(result);
  }

  function ancientName(rng, options = {}) {
    const a = pick(WORDS.ancientFragments, rng);
    const b = pick(WORDS.ancientFragments, rng).toLowerCase();
    const suffix = pick(options.suffixes ?? WORDS.ruinSuffixes, rng);
    return cleanPlaceName(`${a}${b} ${titleCaseToken(suffix)}`);
  }

  function ofName(kind, rng, options = {}) {
    const normalizedKind = normalizeKind(kind);
    const config = KIND_CONFIG[normalizedKind] ?? KIND_CONFIG.generic;
    const basePool = descriptorPool(options);
    const first = pick(basePool, rng);
    const second = pick([...WORDS.natural, ...WORDS.moods, ...WORDS.earth, ...WORDS.weather], rng);
    if (normalizedKind === "lake" || normalizedKind === "river") {
      return cleanPlaceName(`${config.label} of the ${first} ${second}`);
    }
    return cleanPlaceName(`${titleCaseToken(pick(suffixPool(normalizedKind, options), rng))} of the ${first} ${second}`);
  }

  function prefixedName(kind, rng, options = {}) {
    const normalizedKind = normalizeKind(kind);
    const suffix = pick(suffixPool(normalizedKind, options), rng);
    const compactKinds = new Set(["village", "hamlet", "town", "city", "harbor", "inn", "mill"]);
    const result = compactKinds.has(normalizedKind) && !String(suffix).includes(" ")
      ? `${pick(prefixPool(options), rng)}${suffix}`
      : `${pick(prefixPool(options), rng)} ${titleCaseToken(suffix)}`;
    return cleanPlaceName(result);
  }

  function spacedName(kind, rng, options = {}) {
    return cleanPlaceName(`${pick(descriptorPool(options), rng)} ${titleCaseToken(pick(suffixPool(kind, options), rng))}`);
  }

  function cultureName(kind, rng, options = {}) {
    const culture = normalizeCulture(options.culture) || pick(Object.keys(CULTURE_WORDS), rng);
    const words = CULTURE_WORDS[culture] ?? CULTURE_WORDS.common;
    const config = KIND_CONFIG[normalizeKind(kind)] ?? KIND_CONFIG.generic;
    const pattern = Math.floor(rng() * 4);
    if (pattern === 0) return cleanPlaceName(`${pick(words.prefixes, rng)}${pick(words.suffixes, rng)}`);
    if (pattern === 1) return cleanPlaceName(`${pick(words.descriptors, rng)} ${titleCaseToken(pick(config.suffixes, rng))}`);
    if (pattern === 2) return cleanPlaceName(`${pick(words.prefixes, rng)}${pick(words.suffixes, rng)} ${config.label}`);
    return cleanPlaceName(`${config.label} of ${pick(words.descriptors, rng)} ${pick([...WORDS.natural, ...WORDS.earth, ...WORDS.fire], rng)}`);
  }

  function occupationalName(kind, rng, options = {}) {
    const normalizedKind = normalizeKind(kind);
    const config = KIND_CONFIG[normalizedKind] ?? KIND_CONFIG.generic;
    const occupation = pick(WORDS.oldOccupations, rng);
    if (["village", "hamlet", "town", "city"].includes(normalizedKind)) {
      return cleanPlaceName(`${occupation}${pick(["ton", "wick", "ford", "ham", "stead", "field"], rng)}`);
    }
    return cleanPlaceName(`${occupation}'s ${titleCaseToken(pick(config.suffixes, rng))}`);
  }

  function waterName(kind, rng, options = {}) {
    const normalizedKind = normalizeKind(kind);
    const nounPool = normalizedKind === "river" ? WORDS.water : [...WORDS.water, "Mirror", "Moon", "Star", "Reed", "Swan", "Lily"];
    const label = normalizedKind === "river" ? "River" : "Lake";
    const patterns = [
      () => `${pick(nounPool, rng)}${pick(["mere", "water", "pool", "deep", "run", "flow", "wash", "tarn"], rng)}`,
      () => `${label} ${pick(nounPool, rng)}`,
      () => `${pick([...WORDS.colors, ...WORDS.moods, ...WORDS.weather], rng)} ${label}`,
      () => ofName(normalizedKind, rng, options),
      () => `${pick(descriptorPool(options), rng)} ${titleCaseToken(pick(WORDS.waterSuffixes, rng))}`
    ];
    return cleanPlaceName(pick(patterns, rng)());
  }

  function generateName(kind = "generic", options = {}) {
    const normalizedKind = normalizeKind(kind);
    const seed = options.seed ?? `${normalizedKind}:${options.biome ?? ""}:${options.culture ?? ""}:${options.id ?? ""}:${options.index ?? ""}`;
    const rng = options.rng ?? createRng(seed);
    if (normalizedKind === "lake" || normalizedKind === "river") return waterName(normalizedKind, rng, options);

    const patterns = [
      () => compoundName(normalizedKind, rng, options),
      () => prefixedName(normalizedKind, rng, options),
      () => spacedName(normalizedKind, rng, options),
      () => ofName(normalizedKind, rng, options),
      () => cultureName(normalizedKind, rng, options)
    ];

    if (["village", "hamlet", "town", "city"].includes(normalizedKind)) patterns.push(() => occupationalName(normalizedKind, rng, options));
    if (["ruin", "shrine", "cave", "temple", "dungeon", "portal", "monastery", "graveyard"].includes(normalizedKind)) {
      patterns.push(() => ancientName(rng, { suffixes: KIND_CONFIG[normalizedKind].suffixes }));
    }

    return cleanPlaceName(pick(patterns, rng)());
  }

  function generateMany(kind = "generic", count = 10, options = {}) {
    const names = [];
    const used = new Set();
    let attempts = 0;
    const maxAttempts = Math.max(count * 80, 200);
    while (names.length < count && attempts < maxAttempts) {
      const name = generateName(kind, { ...options, index: attempts, seed: `${options.seed ?? kind}:${options.biome ?? ""}:${options.culture ?? ""}:${attempts}` });
      attempts += 1;
      if (used.has(name)) continue;
      used.add(name);
      names.push(name);
    }
    return names;
  }

  function generateCatalog(count = DEFAULT_PRESET_COUNT, options = {}) {
    const catalog = {};
    for (const kind of Object.keys(KIND_CONFIG)) {
      if (kind === "generic") continue;
      catalog[kind] = generateMany(kind, count, {
        ...options,
        seed: `${options.seed ?? "depthbound-world-names"}:${kind}`
      });
    }
    return catalog;
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
    if (kind === "generic" && normalizedTile && normalizedTile !== "generic") return titleCaseToken(normalizedTile);
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
      name: feature.name || randomName(kind, { ...options, seed, biome: options.biome ?? feature.biome, preferCatalog: options.preferCatalog ?? true }),
      nameKind: kind,
      generatedName: feature.generatedName ?? !feature.name
    };
  }

  const PREGENERATED = generateCatalog(DEFAULT_PRESET_COUNT, { seed: "depthbound-world-names-pregenerated-v2" });

  function randomFrom(list, random = Math.random) {
    return Array.isArray(list) && list.length
      ? list[Math.floor(random() * list.length)]
      : "";
  }

  function randomName(kind = "generic", options = {}) {
    const normalizedKind = normalizeKind(kind);
    const random = options.random ?? (options.seed ? createRng(options.seed) : Math.random);
    const list = PREGENERATED[normalizedKind];
    if (Array.isArray(list) && list.length && (options.preferCatalog || (!options.biome && !options.culture))) {
      return randomFrom(list, random);
    }
    return generateName(normalizedKind, { ...options, seed: options.seed ?? `${Date.now()}:${random()}:${normalizedKind}` });
  }

  function nameOptions(kind = "generic", count = 100, options = {}) {
    const normalizedKind = normalizeKind(kind);
    const target = Math.max(1, Math.floor(Number(count) || 100));
    const list = PREGENERATED[normalizedKind] ?? [];
    if (Array.isArray(list) && list.length && (options.preferCatalog ?? true)) {
      return list.slice(0, target);
    }
    return generateMany(normalizedKind, target, options);
  }

  window.DepthboundWorldNames = {
    WORDS,
    CULTURE_WORDS,
    KIND_CONFIG,
    BIOME_WORDS,
    STRUCTURE_LABELS,
    PREGENERATED,
    DEFAULT_PRESET_COUNT,
    createRng,
    generateName,
    generateMany,
    generateCatalog,
    randomName,
    nameOptions,
    nameFeature,
    normalizeKind,
    normalizeCulture,
    structureKind,
    shouldGenerateFeatureName,
    structureLabel,
    biomeGroup
  };
})();
