(() => {
  const refreshDays = 7;

  const storefrontDefinitions = {
    "general-market": {
      name: "General Market",
      shortName: "Market",
      tag: "SUPPLIES",
      description: "Rations, light, rope, ammunition, and the sort of small goods every road eventually demands.",
      scale: "all",
    },
    "village-smith": {
      name: "Village Smith",
      shortName: "Smith",
      tag: "BASIC ARMS",
      description: "Simple weapons, repairs, shields, and rough armor for farmers, guards, and travelers.",
      scale: "village",
    },
    herbalist: {
      name: "Herbalist",
      shortName: "Herbs",
      tag: "REMEDIES",
      description: "Poultices, healing draughts, and local plant lore.",
      scale: "all",
      services: ["disease-basic", "hunger-exhaustion"],
    },
    "camp-supplier": {
      name: "Camp Supplier",
      shortName: "Camp Gear",
      tag: "CAMP",
      description: "Portable comforts and field furniture for hero tents.",
      scale: "all",
      special: "campGear",
    },
    weaponsmith: {
      name: "Weaponsmith",
      shortName: "Weapons",
      tag: "WEAPONS",
      description: "A better-stocked forge with martial weapons and specialist ammunition.",
      scale: "city",
    },
    armorer: {
      name: "Armorer",
      shortName: "Armor",
      tag: "ARMOR",
      description: "Fitted armor, shields, and heavier mail for those who can pay for proper work.",
      scale: "city",
    },
    apothecary: {
      name: "Apothecary",
      shortName: "Apothecary",
      tag: "TREATMENT",
      description: "Prepared potions and paid treatment for disease and travel wear.",
      scale: "city",
      services: ["disease", "hunger-exhaustion"],
    },
    temple: {
      name: "Temple",
      shortName: "Temple",
      tag: "RESTORATION",
      description: "Costly blessings, cleansings, and abstracted revival rites for the fallen.",
      scale: "city",
      services: ["disease", "hunger-exhaustion", "revival-placeholder"],
    },
    furnisher: {
      name: "Furnisher",
      shortName: "Furnisher",
      tag: "HOME GOODS",
      description: "Household decor. Bought pieces go into the party inventory for later home placement.",
      scale: "all",
      special: "homeDecor",
    },
  };

  const villageShopPools = [
    ["general-market", 100],
    ["village-smith", 88],
    ["herbalist", 72],
    ["camp-supplier", 48],
    ["furnisher", 35],
  ];

  const cityShopPools = [
    ["general-market", 100],
    ["weaponsmith", 88],
    ["armorer", 82],
    ["apothecary", 76],
    ["temple", 70],
    ["camp-supplier", 58],
    ["furnisher", 72],
    ["herbalist", 42],
    ["village-smith", 35],
  ];

  function clone(value) {
    return JSON.parse(JSON.stringify(value ?? null));
  }

  function hashString(value = "") {
    let hash = 2166136261;
    const text = String(value);
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seededRandom(seed) {
    let value = hashString(seed) || 1;
    return () => {
      value += 0x6d2b79f5;
      let next = value;
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pickWeighted(pool, random) {
    const total = pool.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = random() * total;
    for (const [id, weight] of pool) {
      roll -= weight;
      if (roll <= 0) return id;
    }
    return pool[0]?.[0] ?? "";
  }

  function shuffle(values, random) {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function hexId(hex = {}) {
    return window.DepthboundWorldTravel?.cellId?.(hex.chunkX, hex.chunkY, hex.row, hex.col) ?? `${hex.chunkX ?? 0},${hex.chunkY ?? 0}:${hex.row ?? 0},${hex.col ?? 0}`;
  }

  function featureKind(feature = null) {
    const tile = String(feature?.tile ?? "").toLowerCase();
    const kind = String(feature?.kind || feature?.nameKind || window.DepthboundWorldNames?.structureKind?.(feature?.tile) || "").toLowerCase();
    if (kind === "city" || tile === "city" || tile.startsWith("city_")) return "city";
    return "village";
  }

  function settlementTraits(type, biome, seed) {
    const random = seededRandom(`${seed}:traits:${type}:${biome}`);
    const traits = [];
    if (String(biome).includes("forest")) traits.push("woodland");
    if (String(biome).includes("mountain") || String(biome).includes("highland")) traits.push("stonebound");
    if (String(biome).includes("coast") || String(biome).includes("lake")) traits.push("waterside");
    if (String(biome).includes("swamp")) traits.push("marshwise");
    if (String(biome).includes("desert") || String(biome).includes("savanna")) traits.push("dry-road");
    if (random() > 0.68) traits.push(type === "city" ? "trade-hub" : "market-day");
    if (random() > 0.78) traits.push("pilgrim-stop");
    return Array.from(new Set(traits)).slice(0, 3);
  }

  function chooseStorefronts({ id, type, biome }) {
    const pool = type === "city" ? cityShopPools : villageShopPools;
    const random = seededRandom(`${id}:storefronts:${type}:${biome}`);
    const minimum = type === "city" ? 5 : 3;
    const maximum = type === "city" ? 7 : 5;
    const wanted = minimum + Math.floor(random() * (maximum - minimum + 1));
    const shops = new Set(["general-market"]);
    if (type === "village") shops.add("village-smith");
    if (type === "city") {
      shops.add("weaponsmith");
      shops.add("armorer");
    }
    while (shops.size < wanted) {
      shops.add(pickWeighted(pool, random));
      if (shops.size >= pool.length) break;
    }
    return Array.from(shops).filter((shopId) => storefrontDefinitions[shopId]);
  }

  function chooseInnLayoutId(id) {
    const innLayouts = (window.DungeonSettlementLayouts?.list?.() ?? [])
      .filter((entry) => entry.kind === "inn")
      .map((entry) => entry.id);
    if (!innLayouts.length) return "inn-common-hall";
    const random = seededRandom(`${id}:inn-layout`);
    return innLayouts[Math.floor(random() * innLayouts.length)] ?? innLayouts[0];
  }

  function cpValue(cost = null) {
    if (!cost) return 0;
    const amount = Math.max(0, Number(cost.amount) || 0);
    if (cost.unit === "gp") return Math.round(amount * 100);
    if (cost.unit === "sp") return Math.round(amount * 10);
    return Math.round(amount);
  }

  function itemIdsForStorefront(storefrontId, profile) {
    const items = window.DungeonContent?.list?.("items") ?? [];
    const isPoorVillage = profile?.type === "village";
    const byId = (ids) => ids.filter((id) => window.DungeonContent?.get?.("items", id));
    if (storefrontId === "general-market") {
      return byId(["trail-ration", "torch", "lantern-oil", "hooded-lantern", "rope-hempen-50", "arrows-20", "bolts-20", "pebbles-20"]);
    }
    if (storefrontId === "village-smith") {
      return byId(["club", "dagger", "handaxe", "javelin", "mace", "quarterstaff", "spear", "shortbow", "sling", "leather", "hide", "shield", "arrows-20", "bolts-20"]);
    }
    if (storefrontId === "weaponsmith") {
      return items
        .filter((item) => item.type === "weapon" || item.type === "ammunition")
        .filter((item) => !item.magic && !item.loot?.unique)
        .sort((a, b) => cpValue(a.cost) - cpValue(b.cost) || String(a.name).localeCompare(String(b.name)))
        .map((item) => item.id);
    }
    if (storefrontId === "armorer") {
      return items
        .filter((item) => item.type === "armor")
        .filter((item) => !item.magic && (!isPoorVillage || !["plate", "half-plate"].includes(item.id)))
        .sort((a, b) => cpValue(a.cost) - cpValue(b.cost) || String(a.name).localeCompare(String(b.name)))
        .map((item) => item.id);
    }
    if (storefrontId === "herbalist") {
      return byId(["potion-healing"]);
    }
    if (storefrontId === "apothecary") {
      return items
        .filter((item) => item.type === "consumable" && (item.category === "potion" || item.tags?.includes("potion")))
        .filter((item) => cpValue(item.cost) <= 50000)
        .sort((a, b) => cpValue(a.cost) - cpValue(b.cost) || String(a.name).localeCompare(String(b.name)))
        .map((item) => item.id);
    }
    return [];
  }

  function decorIdsForStorefront(profile) {
    const allowedByType =
      profile?.type === "city"
        ? new Set(["poor", "modest", "comfortable", "wealthy", "aristocratic"])
        : new Set(["squalid", "poor", "modest"]);
    return (window.DungeonContent?.list?.("furniture") ?? [])
      .filter((entry) => {
        const decor = (entry.components ?? []).find((component) => component?.type === "homeDecor");
        return decor && allowedByType.has(decor.livingClass);
      })
      .sort((a, b) => {
        const decorA = (a.components ?? []).find((component) => component?.type === "homeDecor");
        const decorB = (b.components ?? []).find((component) => component?.type === "homeDecor");
        return (decorA?.priceCp ?? 0) - (decorB?.priceCp ?? 0) || String(a.name).localeCompare(String(b.name));
      })
      .map((entry) => entry.id);
  }

  function buildStock(profile, storefrontId, refreshIndex = 0) {
    const random = seededRandom(`${profile.id}:stock:${storefrontId}:${refreshIndex}`);
    if (storefrontId === "furnisher") {
      const ids = shuffle(decorIdsForStorefront(profile), random).slice(0, profile.type === "city" ? 18 : 10);
      return ids.map((id) => ({ kind: "homeDecor", id }));
    }
    const ids = shuffle(itemIdsForStorefront(storefrontId, profile), random);
    const limit =
      storefrontId === "general-market" ? 12 : storefrontId === "village-smith" ? 12 : storefrontId === "herbalist" ? 3 : storefrontId === "apothecary" ? 10 : 24;
    return ids.slice(0, limit).map((id) => ({ kind: "item", id }));
  }

  function ensureStocks(profile, day = 0) {
    profile.stocks ??= {};
    profile.stockLastRefreshDay = Math.floor(Number(profile.stockLastRefreshDay) || 0);
    profile.stockRefreshIndex = Math.floor(Number(profile.stockRefreshIndex) || 0);
    const currentDay = Math.floor(Number(day) || 0);
    if (currentDay - profile.stockLastRefreshDay >= refreshDays) {
      profile.stockLastRefreshDay = currentDay;
      profile.stockRefreshIndex += 1;
      profile.stocks = {};
    }
    for (const shopId of profile.storefronts ?? []) {
      if (!profile.stocks[shopId]) profile.stocks[shopId] = buildStock(profile, shopId, profile.stockRefreshIndex);
    }
    return profile;
  }

  function ensureProfile({ world, hex, feature, biome = "", name = "", day = 0 } = {}) {
    if (!world || !hex || !feature) return null;
    world.settlementsByHex = world.settlementsByHex && typeof world.settlementsByHex === "object" ? world.settlementsByHex : {};
    const id = hexId(hex);
    const type = featureKind(feature);
    const seed = `${world.seed ?? "depthbound"}:${id}:${feature?.id ?? ""}`;
    let profile = world.settlementsByHex[id];
    if (!profile || typeof profile !== "object") {
      profile = {
        id,
        featureId: feature?.id ?? "",
        name: name || feature?.name || (type === "city" ? "City" : "Village"),
        type,
        biome: biome || "",
        traits: settlementTraits(type, biome, seed),
        storefronts: chooseStorefronts({ id: seed, type, biome }),
        innLayoutId: chooseInnLayoutId(seed),
        stocks: {},
        stockLastRefreshDay: Math.floor(Number(day) || 0),
        stockRefreshIndex: 0,
        firstVisitedDay: Math.floor(Number(day) || 0),
      };
      world.settlementsByHex[id] = profile;
    }
    profile.name = profile.name || name || feature?.name || (type === "city" ? "City" : "Village");
    profile.type = profile.type || type;
    profile.biome = profile.biome || biome || "";
    profile.traits = Array.isArray(profile.traits) ? profile.traits : settlementTraits(profile.type, profile.biome, seed);
    profile.storefronts = Array.isArray(profile.storefronts) && profile.storefronts.length ? profile.storefronts.filter((shopId) => storefrontDefinitions[shopId]) : chooseStorefronts({ id: seed, type: profile.type, biome: profile.biome });
    profile.innLayoutId = profile.innLayoutId || chooseInnLayoutId(seed);
    ensureStocks(profile, day);
    return profile;
  }

  function stockFor(profile, storefrontId, day = 0) {
    if (!profile || !storefrontDefinitions[storefrontId]) return [];
    ensureStocks(profile, day);
    return clone(profile.stocks?.[storefrontId] ?? []);
  }

  window.DepthboundSettlementStorefronts = {
    refreshDays,
    definitions: storefrontDefinitions,
    ensureProfile,
    ensureStocks,
    stockFor,
    hexId,
  };
})();
