(() => {
const cp = (amount) => ({ amount, unit: "cp", text: `${amount} cp` });
const sp = (amount) => ({ amount, unit: "sp", text: `${amount} sp` });
const gp = (amount) => ({ amount, unit: "gp", text: `${amount} gp` });

function uniqueTags(tags) {
  return Array.from(new Set(tags.filter(Boolean).map((tag) => String(tag).trim().toLowerCase())));
}

function component(id, name, options = {}) {
  const existing = window.DungeonContent.get?.("items", id) ?? {};
  const category = options.category ?? options.kind ?? "material";
  const rarity = options.rarity ?? "common";
  window.DungeonContent.register("items", id, {
    ...existing,
    id,
    name,
    type: "component",
    category,
    cost: options.cost ?? cp(1),
    weightLb: options.weightLb ?? 0,
    quantity: 1,
    stackable: true,
    resourceInventory: "party",
    slots: options.slots ?? existing.slots ?? [],
    tags: uniqueTags([
      ...(existing.tags ?? []),
      "component",
      "crafting",
      "party-resource",
      `rarity:${rarity}`,
      category,
      options.kind,
      options.material,
      options.form,
      ...(options.tags ?? []),
    ]),
    component: {
      ...(existing.component ?? {}),
      kind: options.kind ?? category,
      material: options.material ?? null,
      form: options.form ?? null,
      rarity,
      quality: options.quality ?? "standard",
      source: options.source ?? null,
      sourceTags: uniqueTags(options.sourceTags ?? []),
      craftingValueCp: options.craftingValueCp ?? Math.max(1, options.costCp ?? 1),
      questKey: options.questKey ?? null,
      professions: uniqueTags(options.professions ?? []),
      biomes: uniqueTags(options.biomes ?? []),
      themes: uniqueTags(options.themes ?? []),
    },
    store: {
      ...(existing.store ?? {}),
      buyable: options.buyable ?? false,
      sellable: options.sellable ?? true,
      reason: options.reason ?? "crafting material",
      rate: options.sellRate ?? 1,
    },
    sell: options.sellValueCp !== undefined ? { valueCp: options.sellValueCp } : undefined,
    description: options.description ?? existing.description ?? options.short ?? name,
    ...(options.use ? { use: options.use } : existing.use ? { use: existing.use } : {}),
    flavor: {
      ...(existing.flavor ?? {}),
      short: options.short ?? name,
      description: options.description ?? options.short ?? name,
    },
  });
}

component("green-vines", "Green Vines", {
  category: "herb",
  kind: "herb",
  material: "plant",
  form: "vine",
  cost: cp(1),
  tags: ["alchemy", "plant", "herb", "vine", "nature", "forest", "forage", "food", "healing", "quest-item", "old-lady", "quest:old-lady", "quest:green-vines"],
  questKey: "quest:green-vines",
  professions: ["alchemist", "herbalist", "cook", "healer"],
  biomes: ["forest", "wilds"],
  reason: "Mara requested these, but they are also useful herbs",
  short: "Fresh green vines with a peppery scent.",
  description: "Supple forest vines with a clean, peppery scent. Useful for broths, poultices, and simple alchemy.",
});

component("black-briar-root", "Black Briar Root", {
  category: "alchemy reagent",
  kind: "herb",
  material: "plant",
  form: "root",
  rarity: "uncommon",
  cost: sp(3),
  craftingValueCp: 30,
  tags: ["alchemy", "plant", "herb", "root", "nature", "forest", "forage", "magic-reagent", "quest-item", "old-lady", "quest:old-lady", "quest:black-briar-root"],
  questKey: "quest:black-briar-root",
  professions: ["alchemist", "herbalist", "healer"],
  biomes: ["forest", "swamp", "wilds"],
  reason: "rare herbal reagent",
  short: "A bitter black root for strong brews.",
  description: "A dark, knotty root that smells like wet soil and old smoke. Useful in bitter remedies and dream-quieting brews.",
});

component("medicinal-herb", "Medicinal Herb", {
  category: "herb",
  kind: "herb",
  material: "plant",
  form: "bundle",
  cost: cp(5),
  craftingValueCp: 5,
  tags: ["alchemy", "plant", "herb", "nature", "forest", "forage", "healing", "food"],
  professions: ["alchemist", "herbalist", "healer", "cook"],
  short: "A clean-smelling bundle of useful herbs.",
  description: "A small bundle of medicinal leaves and stems, good for simple remedies and potion bases.",
});

component("living-wood", "Living Wood", {
  category: "wood",
  kind: "monster part",
  material: "wood",
  form: "splinter",
  rarity: "uncommon",
  cost: sp(4),
  craftingValueCp: 40,
  tags: ["monster-part", "monster", "plant", "wood", "forest", "crafting", "repair", "magic-reagent"],
  professions: ["carpenter", "weaponsmith", "enchanter", "alchemist"],
  biomes: ["forest", "wilds"],
  short: "A warm splinter of still-living wood.",
  description: "A piece of plant-creature wood that bends faintly toward moisture and light.",
});

component("thorn-spike", "Thorn Spike", {
  category: "monster part",
  kind: "monster part",
  material: "plant",
  form: "thorn",
  cost: cp(8),
  tags: ["monster-part", "monster", "plant", "thorn", "bramble", "forest", "alchemy", "trophy"],
  professions: ["alchemist", "jeweler", "weaponsmith"],
  biomes: ["forest", "jungle", "wilds"],
  short: "A hard thorn from a hostile plant.",
  description: "A sharp thorn suitable for charms, poisons, traps, or crude weapon work.",
});

component("glowspore-dust", "Glowspore Dust", {
  category: "alchemy reagent",
  kind: "monster part",
  material: "spore",
  form: "dust",
  rarity: "uncommon",
  cost: sp(5),
  craftingValueCp: 50,
  tags: ["alchemy", "monster-part", "monster", "plant", "fungus", "spore", "underdark", "magic-reagent"],
  professions: ["alchemist", "healer", "enchanter"],
  biomes: ["forest", "underdark", "wilds"],
  short: "A faintly glowing pouch of fungal dust.",
  description: "Spores gathered from dangerous fungi. They shimmer softly and cling to skin.",
});

component("glowcap", "Glowcap", {
  category: "alchemy reagent",
  kind: "herb",
  material: "fungus",
  form: "cap",
  rarity: "uncommon",
  cost: sp(3),
  craftingValueCp: 30,
  tags: ["alchemy", "plant", "fungus", "mushroom", "spore", "underdark", "cave", "light", "forage", "magic-reagent"],
  professions: ["alchemist", "herbalist", "healer", "enchanter"],
  biomes: ["underdark", "cave"],
  short: "A soft mushroom cap that glows in the dark.",
  description: "A pale fungal cap that sheds a steady blue-green light after being picked.",
});

component("spider-silk", "Spider Silk", {
  category: "cloth",
  kind: "monster part",
  material: "silk",
  form: "strand",
  rarity: "uncommon",
  cost: sp(5),
  craftingValueCp: 50,
  tags: ["monster-part", "monster", "beast", "spider", "silk", "underdark", "cave", "crafting", "cloth", "trade-good"],
  professions: ["tailor", "leatherworker", "enchanter"],
  biomes: ["underdark", "cave"],
  short: "Strong pale silk from cave-spiders.",
  description: "A bundle of tough, flexible silk strands. It is light, sticky, and surprisingly hard to cut.",
});

component("verdant-sap", "Verdant Sap", {
  category: "alchemy reagent",
  kind: "monster part",
  material: "sap",
  form: "vial",
  rarity: "uncommon",
  cost: sp(6),
  craftingValueCp: 60,
  tags: ["alchemy", "monster-part", "monster", "plant", "sap", "forest", "healing", "magic-reagent"],
  professions: ["alchemist", "healer", "enchanter"],
  biomes: ["forest", "jungle", "wilds"],
  short: "A sticky vial of potent green sap.",
  description: "A resinous sap that smells like rain and torn leaves. Useful in healing and growth magic.",
});

component("bone-dust", "Bone Dust", {
  category: "monster part",
  kind: "monster part",
  material: "bone",
  form: "dust",
  cost: cp(3),
  craftingValueCp: 3,
  tags: ["alchemy", "monster-part", "monster", "undead", "skeleton", "bone", "dust", "old-guardroom", "crypt"],
  professions: ["alchemist", "relic-scholar", "enchanter"],
  themes: ["old-guardroom"],
  short: "Fine pale dust from old bones.",
  description: "Powdered bone from restless dead. Useful in grim reagents, relic work, and warding mixtures.",
});

component("cracked-rib-bone", "Cracked Rib Bone", {
  category: "monster part",
  kind: "monster part",
  material: "bone",
  form: "shard",
  cost: cp(4),
  tags: ["monster-part", "monster", "undead", "skeleton", "bone", "old-guardroom", "crypt"],
  professions: ["alchemist", "relic-scholar", "enchanter"],
  themes: ["old-guardroom"],
  short: "A rib shard from an animated skeleton.",
  description: "A brittle rib fragment still marked by old grave-cold.",
});

component("skull-fragment", "Skull Fragment", {
  category: "monster part",
  kind: "monster part",
  material: "bone",
  form: "fragment",
  cost: cp(6),
  tags: ["monster-part", "monster", "undead", "skeleton", "bone", "old-guardroom", "crypt"],
  professions: ["alchemist", "relic-scholar", "enchanter"],
  themes: ["old-guardroom"],
  short: "A chipped fragment of skull.",
  description: "A skull fragment with faint scratches across the bone.",
});

component("grave-wax", "Grave Wax", {
  category: "alchemy reagent",
  kind: "reagent",
  material: "wax",
  form: "lump",
  rarity: "uncommon",
  cost: sp(1),
  craftingValueCp: 10,
  tags: ["alchemy", "magic-reagent", "undead", "old-guardroom", "crypt", "wax", "relic"],
  professions: ["alchemist", "enchanter", "relic-scholar"],
  themes: ["old-guardroom"],
  short: "A cold lump of pale grave wax.",
  description: "Pale wax scraped from places where the dead linger too long.",
});

component("ectoplasm", "Ectoplasm", {
  category: "arcane reagent",
  kind: "monster part",
  material: "spirit",
  form: "residue",
  rarity: "uncommon",
  cost: sp(2),
  craftingValueCp: 20,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "monster-part", "monster", "undead", "ghost", "spirit", "desert-ruins", "crypt"],
  professions: ["alchemist", "enchanter", "relic-scholar"],
  themes: ["desert-ruins", "old-guardroom"],
  short: "Cold translucent residue from an incorporeal undead.",
  description: "A slick, pale residue left behind by ghosts and shades. It clings to glass, silver, and old bone.",
});

component("soul-echo", "Soul Echo", {
  category: "arcane reagent",
  kind: "monster part",
  material: "spirit",
  form: "echo",
  rarity: "rare",
  cost: gp(2),
  craftingValueCp: 200,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "monster-part", "monster", "undead", "ghost", "soul", "relic", "desert-ruins", "crypt"],
  professions: ["enchanter", "relic-scholar", "alchemist"],
  themes: ["desert-ruins", "old-guardroom"],
  short: "A faint trapped resonance from a powerful spirit.",
  description: "A trembling trace of memory and will, gathered from a strong ghost before it fades completely.",
});

component("beast-hide", "Beast Hide", {
  category: "leather",
  kind: "monster part",
  material: "leather",
  form: "hide",
  cost: sp(1),
  tags: ["monster-part", "monster", "beast", "hide", "leather", "crafting", "repair", "upgrade"],
  professions: ["leatherworker", "armorer", "tailor"],
  short: "A workable patch of beast hide.",
  description: "A rough hide that can be tanned, patched into armor, or traded as a crafting material.",
});

component("beast-claw", "Beast Claw", {
  category: "monster part",
  kind: "monster part",
  material: "bone",
  form: "claw",
  cost: cp(8),
  tags: ["monster-part", "monster", "beast", "claw", "bone", "alchemy", "trophy"],
  professions: ["alchemist", "leatherworker", "jeweler"],
  short: "A sharp claw from a beast.",
  description: "A claw suitable for trophies, charms, or rough alchemical work.",
});

component("beast-fang", "Beast Fang", {
  category: "monster part",
  kind: "monster part",
  material: "bone",
  form: "fang",
  cost: cp(8),
  tags: ["monster-part", "monster", "beast", "fang", "bone", "alchemy", "trophy"],
  professions: ["alchemist", "jeweler", "leatherworker"],
  short: "A pointed beast fang.",
  description: "A fang that can be ground, drilled, mounted, or traded.",
});

component("monster-blood", "Monster Blood", {
  category: "alchemy reagent",
  kind: "monster part",
  material: "blood",
  form: "vial",
  cost: sp(1),
  tags: ["alchemy", "monster-part", "monster", "blood", "reagent"],
  professions: ["alchemist", "healer"],
  short: "A stoppered vial of monster blood.",
  description: "A small vial of preserved monster blood for alchemy, poisons, and stranger recipes.",
});

component("venom-gland", "Venom Gland", {
  category: "monster part",
  kind: "monster part",
  material: "venom",
  form: "gland",
  rarity: "uncommon",
  cost: sp(4),
  craftingValueCp: 40,
  tags: ["alchemy", "monster-part", "monster", "venom", "poison", "beast", "reagent"],
  professions: ["alchemist", "poisoner", "healer"],
  biomes: ["forest", "swamp", "desert", "underdark", "water"],
  short: "A carefully sealed venom sac.",
  description: "A small gland full of dangerous venom. Useful for poisons, antidotes, and risky alchemy.",
});

component("horn-and-antler", "Horn and Antler", {
  category: "monster part",
  kind: "monster part",
  material: "bone",
  form: "horn",
  rarity: "uncommon",
  cost: sp(3),
  craftingValueCp: 30,
  tags: ["monster-part", "monster", "beast", "horn", "antler", "bone", "trophy", "crafting"],
  professions: ["weaponsmith", "carver", "jeweler", "alchemist"],
  biomes: ["forest", "mountain", "grassland", "arctic"],
  short: "A sturdy horn or antler piece.",
  description: "Dense horn or antler from a dangerous beast. It can be carved, powdered, or mounted as a trophy.",
});

component("scale-and-shell", "Scale and Shell", {
  category: "monster part",
  kind: "monster part",
  material: "shell",
  form: "plate",
  rarity: "uncommon",
  cost: sp(4),
  craftingValueCp: 40,
  tags: ["monster-part", "monster", "beast", "scale", "shell", "carapace", "armor", "crafting"],
  professions: ["armorsmith", "leatherworker", "enchanter"],
  biomes: ["swamp", "water", "desert", "underdark"],
  short: "A hard scale or shell plate.",
  description: "A durable plate of scale, shell, or carapace from a heavily protected creature.",
});

component("giant-feather", "Giant Feather", {
  category: "monster part",
  kind: "monster part",
  material: "feather",
  form: "plume",
  rarity: "uncommon",
  cost: sp(2),
  craftingValueCp: 20,
  tags: ["monster-part", "monster", "beast", "bird", "feather", "flying", "crafting"],
  professions: ["fletcher", "tailor", "enchanter"],
  biomes: ["forest", "mountain", "grassland", "arctic", "urban"],
  short: "A broad feather from a large beast.",
  description: "A strong, oversized feather suitable for fletching, charms, and light ornamentation.",
});

component("devil-blood", "Devil Blood", {
  category: "alchemy reagent",
  kind: "monster part",
  material: "blood",
  form: "vial",
  rarity: "uncommon",
  cost: sp(8),
  craftingValueCp: 80,
  tags: ["alchemy", "monster-part", "monster", "blood", "reagent", "fiend", "devil", "infernal", "poison", "fire"],
  professions: ["alchemist", "healer", "enchanter"],
  short: "A hot black-red vial of infernal blood.",
  description: "Infernal blood that stays warm long after death. Useful for poisons, fire reagents, and pact-work.",
});

component("hellfire-ember", "Hellfire Ember", {
  category: "arcane reagent",
  kind: "monster part",
  material: "fire",
  form: "ember",
  rarity: "rare",
  cost: gp(3),
  craftingValueCp: 300,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "monster-part", "monster", "fiend", "devil", "infernal", "fire", "ember"],
  professions: ["alchemist", "enchanter", "blacksmith"],
  short: "A coal that burns with infernal heat.",
  description: "A dark ember that glows red through ash-black cracks. It is prized for fire magic and cruel enchantments.",
});

component("infernal-iron-shard", "Infernal Iron Shard", {
  category: "metal",
  kind: "monster part",
  material: "infernal iron",
  form: "shard",
  rarity: "uncommon",
  cost: sp(6),
  craftingValueCp: 60,
  tags: ["building", "metal", "iron", "crafting", "repair", "upgrade", "monster-part", "monster", "fiend", "devil", "infernal"],
  professions: ["blacksmith", "armorer", "weaponsmith", "enchanter"],
  short: "A jagged shard of hell-forged iron.",
  description: "A hard, soot-dark fragment from infernal chains, armor, or weaponry.",
});

component("brimstone-chunk", "Brimstone Chunk", {
  category: "stone",
  kind: "building material",
  material: "brimstone",
  form: "chunk",
  rarity: "uncommon",
  cost: sp(4),
  craftingValueCp: 40,
  tags: ["building", "stone", "crafting", "alchemy", "reagent", "fire", "sulfur", "brimstone", "hell", "infernal", "trade-good"],
  professions: ["alchemist", "blacksmith", "enchanter", "mason"],
  short: "A yellow-black chunk of sulfurous hellstone.",
  description: "A brittle chunk of brimstone that smells of smoke, sulfur, and old fire.",
});

component("demon-ichor", "Demon Ichor", {
  category: "alchemy reagent",
  kind: "monster part",
  material: "ichor",
  form: "vial",
  rarity: "uncommon",
  cost: sp(7),
  craftingValueCp: 70,
  tags: ["alchemy", "monster-part", "monster", "blood", "ichor", "reagent", "fiend", "demon", "abyssal", "chaos", "poison"],
  professions: ["alchemist", "healer", "enchanter"],
  short: "A foul vial of shifting abyssal ichor.",
  description: "Demon ichor never quite settles in its vial. It is useful for volatile alchemy, curses, and abyssal reagents.",
});

component("abyssal-bile", "Abyssal Bile", {
  category: "alchemy reagent",
  kind: "monster part",
  material: "bile",
  form: "vial",
  rarity: "uncommon",
  cost: sp(9),
  craftingValueCp: 90,
  tags: ["alchemy", "monster-part", "monster", "bile", "acid", "reagent", "fiend", "demon", "abyssal", "plague"],
  professions: ["alchemist", "poisoner", "healer"],
  short: "A corrosive vial of abyssal bile.",
  description: "A sour, smoking fluid gathered from plague demons, maw-fiends, and other abyssal horrors.",
});

component("chaos-shard", "Chaos Shard", {
  category: "arcane reagent",
  kind: "monster part",
  material: "chaos",
  form: "shard",
  rarity: "rare",
  cost: gp(3),
  craftingValueCp: 300,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "monster-part", "monster", "fiend", "demon", "abyssal", "chaos", "rift"],
  professions: ["alchemist", "enchanter", "relic-scholar"],
  short: "A splinter of unstable abyssal force.",
  description: "A trembling shard left where a demon's body unravels into raw abyssal energy.",
});

component("mutated-flesh", "Mutated Flesh", {
  category: "monster part",
  kind: "monster part",
  material: "flesh",
  form: "sample",
  rarity: "uncommon",
  cost: sp(5),
  craftingValueCp: 50,
  tags: ["alchemy", "monster-part", "monster", "flesh", "mutation", "fiend", "demon", "abyssal"],
  professions: ["alchemist", "healer", "relic-scholar"],
  short: "A twitching sample of abyss-touched flesh.",
  description: "A sample of flesh that still tries to become something else. Dangerous, but valuable to the right crafter.",
});

component("grave-flesh", "Grave Flesh", {
  category: "monster part",
  kind: "monster part",
  material: "flesh",
  form: "scrap",
  cost: cp(6),
  craftingValueCp: 6,
  tags: ["alchemy", "monster-part", "monster", "undead", "zombie", "flesh", "rot", "disease", "grave"],
  professions: ["alchemist", "relic-scholar", "poisoner"],
  themes: ["old-guardroom", "desert-ruins"],
  short: "A preserved scrap of undead flesh.",
  description: "Rotten but strangely persistent tissue from a corpse-creature. Useful in grim alchemy and disease study.",
});

component("raw-meat", "Raw Meat", {
  category: "food ingredient",
  kind: "food ingredient",
  material: "meat",
  form: "cut",
  cost: cp(5),
  tags: ["food", "beast", "monster-part", "meat", "cook", "trade-good"],
  professions: ["cook"],
  short: "A usable cut of raw meat.",
  description: "Not pretty, but a cook can make it useful.",
});

component("fish-meat", "Fish Meat", {
  category: "food ingredient",
  kind: "food ingredient",
  material: "meat",
  form: "fillet",
  cost: cp(5),
  craftingValueCp: 5,
  tags: ["food", "ingredient", "meat", "fish", "water", "beast", "cooking"],
  professions: ["cook", "alchemist"],
  biomes: ["water", "swamp", "coast"],
  short: "A clean cut of fish or aquatic beast meat.",
  description: "Fresh meat from a water-dwelling creature. Good for stews, drying, or bait.",
});

component("lean-game-meat", "Lean Game Meat", {
  category: "food ingredient",
  kind: "food ingredient",
  material: "meat",
  form: "cut",
  cost: cp(7),
  craftingValueCp: 7,
  tags: ["food", "beast", "monster-part", "meat", "game", "lean", "cook", "trade-good"],
  professions: ["cook"],
  short: "A clean cut of lean wild meat.",
  description: "A trim cut from a swift forest creature. It cooks quickly and takes herbs well.",
});

component("boar-haunch", "Boar Haunch", {
  category: "food ingredient",
  kind: "food ingredient",
  material: "meat",
  form: "haunch",
  cost: cp(9),
  craftingValueCp: 9,
  tags: ["food", "beast", "monster-part", "meat", "boar", "fatty", "cook", "trade-good"],
  professions: ["cook"],
  short: "A heavy haunch of rich boar meat.",
  description: "Dense, flavorful meat from a tusked beast. Best roasted long or chopped into stew.",
});

component("bear-fat", "Bear Fat", {
  category: "food ingredient",
  kind: "food ingredient",
  material: "fat",
  form: "rendering",
  cost: cp(8),
  craftingValueCp: 8,
  tags: ["food", "beast", "monster-part", "fat", "bear", "cook", "preserve", "trade-good"],
  professions: ["cook", "alchemist"],
  short: "A wrapped lump of useful cooking fat.",
  description: "Rich beast fat that can be rendered for frying, preserving, or fortifying trail meals.",
});

component("game-bird-breast", "Game Bird Breast", {
  category: "food ingredient",
  kind: "food ingredient",
  material: "meat",
  form: "breast",
  cost: cp(8),
  craftingValueCp: 8,
  tags: ["food", "beast", "monster-part", "meat", "bird", "flying", "cook", "trade-good"],
  professions: ["cook"],
  short: "A pale cut of game bird meat.",
  description: "Light meat from a large bird or raptor, good for quick skewers and restorative broths.",
});

component("spider-eggs", "Spider Eggs", {
  category: "food ingredient",
  kind: "food ingredient",
  material: "egg",
  form: "cluster",
  cost: cp(6),
  craftingValueCp: 6,
  tags: ["food", "beast", "monster-part", "egg", "spider", "cave", "underdark", "cook", "poison"],
  professions: ["cook", "alchemist", "poisoner"],
  biomes: ["underdark", "cave", "forest"],
  short: "A small wrapped cluster of spider eggs.",
  description: "Pale eggs from a giant spider. Risky raw, but useful to cooks with steady hands.",
});

component("edible-fungus", "Edible Fungus", {
  category: "food ingredient",
  kind: "food ingredient",
  material: "fungus",
  form: "cap",
  cost: cp(5),
  craftingValueCp: 5,
  tags: ["food", "plant", "fungus", "mushroom", "cave", "underdark", "forage", "cook", "trade-good"],
  professions: ["cook", "herbalist"],
  biomes: ["underdark", "cave", "forest", "swamp"],
  short: "A safe, earthy mushroom cap.",
  description: "A plain but nourishing fungus, prized mostly because it will not glow, scream, or poison the stew.",
});

component("sweet-nectar-pod", "Sweet Nectar Pod", {
  category: "food ingredient",
  kind: "food ingredient",
  material: "plant",
  form: "pod",
  cost: cp(6),
  craftingValueCp: 6,
  tags: ["food", "plant", "nectar", "flower", "sweet", "forest", "jungle", "forage", "cook", "healing"],
  professions: ["cook", "herbalist", "healer"],
  biomes: ["forest", "jungle", "wilds"],
  short: "A sticky pod of floral nectar.",
  description: "A sweet, fragrant pod from a dangerous plant. It can soften bitter herbs or glaze trail rations.",
});

component("iron-scrap", "Iron Scrap", {
  category: "metal",
  kind: "building material",
  material: "iron",
  form: "scrap",
  cost: cp(5),
  tags: ["building", "metal", "iron", "crafting", "repair", "upgrade", "trade-good"],
  professions: ["blacksmith", "armorer", "weaponsmith", "tinker"],
  short: "A handful of reusable iron scrap.",
  description: "Bent nails, broken fittings, and useful iron bits for repairs or crafting.",
});

component("wood-bundle", "Wood Bundle", {
  category: "wood",
  kind: "building material",
  material: "wood",
  form: "bundle",
  cost: cp(4),
  tags: ["building", "wood", "crafting", "repair", "trade-good"],
  professions: ["carpenter", "weaponsmith", "tinker"],
  short: "A bundle of workable wood.",
  description: "Cut wood that can become shafts, handles, braces, or building components.",
});

component("stone-chip", "Stone Chip", {
  category: "stone",
  kind: "building material",
  material: "stone",
  form: "chip",
  cost: cp(3),
  tags: ["building", "stone", "crafting", "repair", "trade-good"],
  professions: ["mason", "relic-scholar"],
  short: "A usable chip of stone.",
  description: "A piece of workable stone for masonry, repairs, and ritual markings.",
});

component("cloth-scrap", "Cloth Scrap", {
  category: "cloth",
  kind: "repair material",
  material: "cloth",
  form: "scrap",
  cost: cp(2),
  tags: ["cloth", "crafting", "repair", "trade-good"],
  professions: ["tailor", "healer"],
  short: "A clean scrap of cloth.",
  description: "Useful for bandages, padding, stitching, and simple repairs.",
});

component("leather-scrap", "Leather Scrap", {
  category: "leather",
  kind: "repair material",
  material: "leather",
  form: "scrap",
  cost: cp(4),
  tags: ["leather", "crafting", "repair", "upgrade", "trade-good"],
  professions: ["leatherworker", "armorer"],
  short: "A scrap of usable leather.",
  description: "A small leather piece suitable for patching straps, armor, or gear.",
});

component("crystal-shard", "Crystal Shard", {
  category: "arcane reagent",
  kind: "reagent",
  material: "crystal",
  form: "shard",
  rarity: "uncommon",
  cost: gp(1),
  craftingValueCp: 100,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "crystal", "crafting", "upgrade"],
  professions: ["alchemist", "enchanter", "jeweler"],
  short: "A faintly humming crystal shard.",
  description: "A small crystal shard useful for enchantment, alchemy, and arcane devices.",
});

component("arcane-gear", "Arcane Gear", {
  category: "arcane reagent",
  kind: "reagent",
  material: "metal",
  form: "gear",
  rarity: "uncommon",
  cost: gp(2),
  craftingValueCp: 200,
  tags: ["construct", "arcane-reagent", "magic-reagent", "metal", "crafting", "repair", "upgrade"],
  professions: ["tinker", "enchanter", "blacksmith"],
  short: "A small gear etched with arcane marks.",
  description: "A delicate gear from a magical mechanism or construct.",
});

component("coal-chunk", "Coal Chunk", {
  category: "fuel",
  kind: "crafting material",
  material: "coal",
  form: "chunk",
  cost: cp(4),
  tags: ["fuel", "coal", "crafting", "forge", "mine", "industrial", "embervein", "trade-good"],
  professions: ["blacksmith", "tinker", "alchemist"],
  themes: ["embervein-deepworks"],
  short: "A usable chunk of hard black coal.",
  description: "Coal from a deep forge seam, useful for fuel, black powder mixes, and dirty repairs.",
});

component("embervein-ore", "Embervein Ore", {
  category: "metal",
  kind: "crafting material",
  material: "ore",
  form: "nugget",
  rarity: "uncommon",
  cost: sp(8),
  craftingValueCp: 80,
  tags: ["metal", "ore", "fire", "earth", "crafting", "forge", "mine", "embervein", "trade-good"],
  professions: ["blacksmith", "armorer", "weaponsmith", "jeweler"],
  themes: ["embervein-deepworks"],
  short: "Warm ore threaded with dim orange veins.",
  description: "A dense nugget from the Embervein seam. It holds heat longer than ordinary iron.",
});

component("slag-glass", "Slag Glass", {
  category: "arcane reagent",
  kind: "reagent",
  material: "glass",
  form: "shard",
  rarity: "uncommon",
  cost: gp(1),
  craftingValueCp: 100,
  tags: ["glass", "slag", "fire", "earth", "alchemy", "arcane-reagent", "magic-reagent", "forge", "embervein"],
  professions: ["alchemist", "enchanter", "jeweler"],
  themes: ["embervein-deepworks"],
  short: "Sharp glass cooled from living slag.",
  description: "A smoky shard of slag glass that flickers faintly when held near flame.",
});

component("pressure-core", "Pressure Core", {
  category: "arcane reagent",
  kind: "reagent",
  material: "metal",
  form: "core",
  rarity: "rare",
  cost: gp(8),
  craftingValueCp: 800,
  tags: ["construct", "elemental", "steam", "pressure", "gear", "arcane-reagent", "magic-reagent", "forge", "embervein"],
  professions: ["tinker", "enchanter", "blacksmith"],
  themes: ["embervein-deepworks"],
  short: "A hot little engine heart under pressure.",
  description: "A compact core from a steam engine, gear construct, or pressure elemental. It ticks even when still.",
});

component("elemental-mote", "Elemental Mote", {
  category: "arcane reagent",
  kind: "monster part",
  material: "elemental essence",
  form: "mote",
  rarity: "uncommon",
  cost: sp(5),
  craftingValueCp: 50,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "monster-part", "monster", "elemental", "primal", "crafting"],
  professions: ["alchemist", "enchanter", "relic-scholar"],
  short: "A tiny knot of raw elemental force.",
  description: "A flickering mote left behind by an elemental body. It changes temperature, weight, and texture when ignored.",
});

component("flame-essence", "Flame Essence", {
  category: "arcane reagent",
  kind: "monster part",
  material: "fire",
  form: "vial",
  rarity: "uncommon",
  cost: sp(8),
  craftingValueCp: 80,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "monster-part", "monster", "elemental", "fire", "ash", "lava", "heat"],
  professions: ["alchemist", "enchanter", "blacksmith"],
  themes: ["desert-ruins", "depths-of-hells", "embervein-deepworks"],
  short: "A sealed shimmer of living heat.",
  description: "Condensed fire gathered from flame, ash, lava, or furnace elementals. The vial stays warm in darkness.",
});

component("storm-essence", "Storm Essence", {
  category: "arcane reagent",
  kind: "monster part",
  material: "air",
  form: "vial",
  rarity: "uncommon",
  cost: sp(8),
  craftingValueCp: 80,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "monster-part", "monster", "elemental", "air", "storm", "wind", "lightning", "thunder"],
  professions: ["alchemist", "enchanter", "tinker"],
  themes: ["desert-ruins", "underdark-depths"],
  short: "A restless vial of pressure and sparks.",
  description: "Air and lightning trapped in a tight reagent vial. It hums when thunder or deep wind passes nearby.",
});

component("earth-essence", "Earth Essence", {
  category: "arcane reagent",
  kind: "monster part",
  material: "earth",
  form: "shard",
  rarity: "uncommon",
  cost: sp(8),
  craftingValueCp: 80,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "monster-part", "monster", "elemental", "earth", "stone", "crystal", "mud", "sand", "ore"],
  professions: ["alchemist", "enchanter", "mason", "jeweler"],
  themes: ["desert-ruins", "underdark-depths", "embervein-deepworks"],
  short: "A dense shard of living stone-force.",
  description: "A condensed piece of earth elemental power. It feels heavier than its size allows.",
});

component("water-essence", "Water Essence", {
  category: "arcane reagent",
  kind: "monster part",
  material: "water",
  form: "vial",
  rarity: "uncommon",
  cost: sp(8),
  craftingValueCp: 80,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "monster-part", "monster", "elemental", "water", "ice", "mist", "steam", "acid", "coral"],
  professions: ["alchemist", "enchanter", "healer"],
  themes: ["forest-of-the-beasts", "underdark-depths"],
  short: "A vial of impossibly clear elemental water.",
  description: "Condensed water, mist, ice, or brine essence. It beads against the glass instead of resting inside it.",
});

component("primal-core", "Primal Core", {
  category: "arcane reagent",
  kind: "monster part",
  material: "primal essence",
  form: "core",
  rarity: "rare",
  cost: gp(6),
  craftingValueCp: 600,
  tags: ["alchemy", "arcane-reagent", "magic-reagent", "monster-part", "monster", "elemental", "primal", "rare", "boss"],
  professions: ["alchemist", "enchanter", "relic-scholar"],
  short: "A rare heart of concentrated elemental law.",
  description: "A hard, bright core from a powerful elemental. It pulls nearby flame, dust, mist, and wind into slow orbit.",
});
})();
