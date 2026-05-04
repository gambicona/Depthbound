(() => {
const cp = (amount) => ({ amount, unit: "cp", text: `${amount} cp` });
const sp = (amount) => ({ amount, unit: "sp", text: `${amount} sp` });
const gp = (amount) => ({ amount, unit: "gp", text: `${amount} gp` });

function costForGp(valueGp) {
  if (valueGp >= 1) return gp(valueGp);
  if (valueGp >= 0.1) return sp(Math.round(valueGp * 10));
  return cp(Math.round(valueGp * 100));
}

function valueTier(valueGp) {
  if (valueGp >= 5000) return "legendary";
  if (valueGp >= 1000) return "very rare";
  if (valueGp >= 500) return "rare";
  if (valueGp >= 100) return "uncommon";
  return "common";
}

function appraiseDc(valueGp) {
  if (valueGp >= 5000) return 20;
  if (valueGp >= 1000) return 18;
  if (valueGp >= 500) return 16;
  if (valueGp >= 100) return 14;
  return 12;
}

function slug(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function treasure(id, name, treasureKind, valueGp, options = {}) {
  const tags = Array.from(
    new Set([
      "treasure",
      treasureKind,
      `treasure:${treasureKind}`,
      `value:${valueGp}gp`,
      ...(options.tags ?? []),
    ]),
  );

  window.DungeonContent.register("items", id, {
    name,
    type: "treasure",
    category: treasureKind,
    cost: costForGp(valueGp),
    weightLb: options.weightLb ?? 0,
    slots: [],
    stackable: options.stackable ?? false,
    rarityTier: options.rarityTier ?? valueTier(valueGp),
    tags,

    sell: {
      rate: 1,
      reason: "treasure sells at full value",
    },

    treasure: {
      kind: treasureKind,
      valueGp,
      valueCp: Math.round(valueGp * 100),
      valueTierGp: valueGp,
      appraiseDc: options.appraiseDc ?? appraiseDc(valueGp),
      condition: options.condition ?? "intact",
      material: options.material ?? null,
      color: options.color ?? null,
      shape: options.shape ?? null,
      size: options.size ?? "tiny",
      culture: options.culture ?? null,
      theme: options.theme ?? null,
      description: options.description ?? "",
      icon: options.icon ?? options.image ?? null,
      image: options.image ?? options.icon ?? null,
      dropWeight: options.dropWeight ?? Math.max(1, Math.round(1000 / Math.sqrt(Math.max(1, valueGp)))),
    },
  });
}

function gemstone(name, valueGp, color, description, extra = {}) {
  treasure(`gem-${slug(name)}`, name, "gemstone", valueGp, {
    color,
    description,
    material: "gemstone",
    size: "tiny",
    shape: extra.shape ?? "cut or polished stone",
    tags: ["gem", "gemstone", ...(extra.tags ?? [])],
    ...extra,
  });
}

function artObject(name, valueGp, material, description, extra = {}) {
  treasure(`art-${slug(name)}`, name, "art object", valueGp, {
    material,
    description,
    size: extra.size ?? "small",
    tags: ["art", "art-object", ...(extra.tags ?? [])],
    ...extra,
  });
}

function valuable(name, valueGp, material, description, extra = {}) {
  treasure(`valuable-${slug(name)}`, name, "valuable", valueGp, {
    material,
    description,
    size: extra.size ?? "small",
    tags: ["valuable", "trade-good", ...(extra.tags ?? [])],
    ...extra,
  });
}

// Gemstones, using the normal D&D-style value tiers.
gemstone("Azurite", 10, "mottled blue", "Opaque blue stone with pale mineral flecks.");
gemstone("Banded Agate", 10, "striped brown, red, or white", "Layered agate polished into a smooth cabochon.");
gemstone("Blue Quartz", 10, "pale blue", "Cloudy blue quartz with faint internal shimmer.");
gemstone("Eye Agate", 10, "ringed gray, white, and brown", "Round agate whose bands resemble a watchful eye.");
gemstone("Hematite", 10, "metallic dark gray", "Dense iron-dark stone with a mirrorlike polish.");
gemstone("Lapis Lazuli", 10, "deep blue with gold flecks", "Rich blue stone speckled like a midnight sky.");
gemstone("Malachite", 10, "banded green", "Green stone with swirling rings and veins.");
gemstone("Moss Agate", 10, "clear with green inclusions", "Pale stone marked by mosslike mineral growths.");
gemstone("Obsidian", 10, "glossy black", "Volcanic glass with a razor-bright sheen.");
gemstone("Rhodochrosite", 10, "rose pink", "Soft pink stone with milky bands.");
gemstone("Tiger Eye", 10, "golden brown", "Chatoyant brown-gold stone that catches light in a narrow stripe.");
gemstone("Turquoise", 10, "blue green", "Matte blue-green stone veined with darker matrix.");

gemstone("Bloodstone", 50, "dark green with red flecks", "Green stone spattered with rust-red spots.");
gemstone("Carnelian", 50, "orange red", "Warm translucent stone, often cut as a seal.");
gemstone("Chalcedony", 50, "milky white or pale blue", "Waxy stone with a soft inner glow.");
gemstone("Chrysoprase", 50, "apple green", "Bright green chalcedony prized by jewelers.");
gemstone("Citrine", 50, "yellow gold", "Clear yellow quartz, bright as captured sunlight.");
gemstone("Jasper", 50, "red, brown, or green", "Opaque patterned stone with earthy bands.");
gemstone("Moonstone", 50, "white with blue sheen", "Pale feldspar that glimmers when tilted.");
gemstone("Onyx", 50, "black or banded black and white", "Smooth black stone often carved for cameos.");
gemstone("Quartz", 50, "clear or smoky", "Hard crystal with clean planes and cold light.");
gemstone("Sardonyx", 50, "red brown with white bands", "Layered stone suited to signets and intaglios.");
gemstone("Star Rose Quartz", 50, "pink with star sheen", "Rose quartz showing a faint star under direct light.");
gemstone("Zircon", 50, "clear, pale blue, or golden", "Brilliant small stone with sharp fire.");

gemstone("Amber", 100, "golden orange", "Fossil resin with warm honey depth.");
gemstone("Amethyst", 100, "purple", "Violet quartz associated with nobility and wards.");
gemstone("Chrysoberyl", 100, "yellow green", "Hard green-gold gem with crisp sparkle.");
gemstone("Coral", 100, "red, pink, or white", "Polished sea growth used in beads and charms.");
gemstone("Garnet", 100, "deep red", "Dark red gem like a drop of wine.");
gemstone("Jade", 100, "green or white", "Smooth tough stone, cool to the touch.");
gemstone("Jet", 100, "deep black", "Lightweight black fossil wood with a velvet shine.");
gemstone("Pearl", 100, "white, cream, or pink", "Lustrous ocean gem with a soft glow.");
gemstone("Spinel", 100, "red, blue, or violet", "Brilliant gem often mistaken for ruby or sapphire.");
gemstone("Tourmaline", 100, "green, pink, or mixed", "Clear crystal with vivid internal color bands.");

gemstone("Alexandrite", 500, "green to red color-shift", "Rare gem that changes color under different light.");
gemstone("Aquamarine", 500, "sea blue", "Clear blue beryl with oceanlike depth.");
gemstone("Black Pearl", 500, "black with silver sheen", "Dark pearl carrying an oily moonlit luster.");
gemstone("Blue Spinel", 500, "clear blue", "Fine blue spinel with bright fire.");
gemstone("Peridot", 500, "olive green", "Lively green gem with golden warmth.");
gemstone("Topaz", 500, "golden yellow, blue, or clear", "Brilliant gem cut into clean angular facets.");

gemstone("Black Opal", 1000, "dark with rainbow fire", "Dark opal alive with shifting color.");
gemstone("Blue Sapphire", 1000, "royal blue", "Deep blue corundum prized by rulers and mages.");
gemstone("Emerald", 1000, "rich green", "Clear green beryl with gardenlike inclusions.");
gemstone("Fire Opal", 1000, "orange red", "Fiery opal glowing like a coal beneath glass.");
gemstone("Opal", 1000, "white with rainbow fire", "Milky gem flashing with hidden colors.");
gemstone("Star Ruby", 1000, "red with star sheen", "Red corundum that reveals a six-rayed star.");
gemstone("Star Sapphire", 1000, "blue with star sheen", "Blue corundum crossed by a pale star.");
gemstone("Yellow Sapphire", 1000, "golden yellow", "Yellow corundum with royal brilliance.");

gemstone("Black Sapphire", 5000, "inky blue black", "Near-black sapphire with a cold inner gleam.");
gemstone("Diamond", 5000, "clear white", "Hard brilliant gem with sharp spectral fire.");
gemstone("Jacinth", 5000, "orange red", "Precious red-orange gem with a hot, glassy shine.");
gemstone("Ruby", 5000, "deep red", "Precious red corundum with bloodlike brilliance.");

// Art objects.
artObject("Silver-Plated Goblet", 25, "silver-plated bronze", "A dented drinking cup etched with faded vinework.");
artObject("Carved Bone Dice", 25, "bone", "A matched set of dice carved with tiny skull pips.");
artObject("Bronze Officer Brooch", 25, "bronze", "A military brooch from a forgotten watch company.", { theme: "old guardroom" });
artObject("Embroidered Silk Handkerchief", 25, "silk", "A courtly handkerchief stitched with metallic thread.");
artObject("Velvet Masquerade Mask", 25, "velvet and brass", "A dark mask with cracked brass edging.");
artObject("Polished Obsidian Pendant", 25, "obsidian and copper", "A black glass pendant set into a copper loop.");
artObject("Painted Prayer Tile", 25, "glazed ceramic", "A small tile showing a saint with chipped gold paint.");
artObject("Ivory-Fluted Whistle", 25, "ivory", "A slender carved whistle with a clear piercing tone.");
artObject("Enamel Snuffbox", 25, "brass and enamel", "A palm-sized box decorated with blue enamel.");
artObject("Small Gold Bracelet", 25, "gold", "A narrow bracelet sized for a noble child.");

artObject("Gold Filigree Clasp", 250, "gold", "A delicate cloak clasp shaped like interlocking leaves.");
artObject("Decorative Jade-Hilt Dagger", 250, "jade and steel", "A ceremonial dagger too ornate for practical fighting.");
artObject("Silver Hand Mirror", 250, "silver and glass", "A polished mirror with a handle shaped like a swan.");
artObject("Crystal Decanter", 250, "cut crystal", "A heavy decanter that catches firelight in sharp facets.");
artObject("Ivory Strategy Set", 250, "ivory and ebony", "A boxed board-game set with opposing ivory and ebony pieces.");
artObject("Embroidered Battle Banner", 250, "silk and gold thread", "A folded banner from an old regiment.", { theme: "old guardroom", size: "medium" });
artObject("Electrum Incense Burner", 250, "electrum", "A pierced burner shaped like a sleeping lion.");
artObject("Porcelain Court Mask", 250, "porcelain", "A flawless white mask painted with red lips.");
artObject("Carved Coral Comb", 250, "coral", "A sea-red comb carved with wave patterns.");
artObject("Gem-Studded Reliquary", 250, "silver and semi-precious stones", "A small reliquary with missing interior relics.");

artObject("Gilded Drinking Horn", 750, "horn and gold", "A battle horn rimmed with gold knotwork.", { theme: "old guardroom" });
artObject("Platinum Signet Chain", 750, "platinum", "A chain bearing a blank noble signet.");
artObject("Gold-Thread Court Robe", 750, "silk and gold thread", "A ceremonial robe heavy with metallic embroidery.", { size: "medium" });
artObject("Moonstone-Inlaid Lute", 750, "wood, silver, and moonstone", "A finely built lute with pale stones around the sound hole.", { size: "medium" });
artObject("Ancient Bronze Helm", 750, "bronze", "A crested helm too old and ornate for the battlefield.", { theme: "old guardroom" });
artObject("Silvered Saint Icon", 750, "silver and painted wood", "A devotional icon framed in hammered silver.");
artObject("Carved Marble Statuette", 750, "marble", "A small marble figure with delicate drapery.");
artObject("Lacquered War Fan", 750, "lacquered wood and silk", "A stiff fan painted with a cavalry charge.");
artObject("Gold-Framed Miniature Portrait", 750, "gold and paint", "A tiny portrait of a severe unknown noble.");
artObject("Electrum Astrolabe", 750, "electrum", "A precise astronomical instrument with fine etched rings.");

artObject("Jeweled Coronet", 2500, "gold and gemstones", "A slim coronet set with small bright stones.");
artObject("Gold Funerary Mask", 2500, "gold", "A serene mask made to cover the face of the dead.");
artObject("Platinum Reliquary", 2500, "platinum", "A miniature shrine covered in tiny script.");
artObject("Sapphire-Inlaid Chalice", 2500, "gold and sapphire", "A ritual chalice with blue stones around the rim.");
artObject("Dragonbone Harp", 2500, "bone, gold, and wire", "A pale harp carved from a huge rib bone.", { size: "medium" });
artObject("Illuminated Royal Charter", 2500, "vellum and gold leaf", "A sealed charter edged with exquisite illumination.");
artObject("Mithral-Framed Mirror", 2500, "mithral and glass", "A hand mirror in a light silvery frame.");
artObject("Emerald-Studded Sword Scabbard", 2500, "leather, gold, and emerald", "A ceremonial scabbard more valuable than most swords.");
artObject("Golden Idol of a Forgotten Saint", 2500, "gold", "A palm-high idol with an unreadable halo inscription.");
artObject("Pearl-Inlaid Music Box", 2500, "wood, pearl, and gold", "A delicate music box that still plays a wavering tune.");

artObject("Diamond-Studded Crown", 7500, "gold and diamond", "A heavy crown bright with old royal stones.");
artObject("Ruby Throne Plaque", 7500, "gold and ruby", "A ceremonial plaque likely torn from a royal seat.");
artObject("Ancient Imperial Orb", 7500, "gold, crystal, and gemstones", "A ruler's orb engraved with a dead empire's map.");
artObject("Celestial Sapphire Icon", 7500, "sapphire, silver, and gold", "A sacred icon showing constellations in blue stone.");
artObject("Adamantine Reliquary", 7500, "adamantine and gemstones", "A dark metal reliquary locked with jeweled clasps.");
artObject("Phoenix-Feather Fan in Gold Case", 7500, "gold and preserved feather", "A sealed case holding impossible red-gold feathers.");
artObject("Jade Dragon Statue with Pearl Eyes", 7500, "jade and pearl", "A coiled dragon sculpture with luminous pearl eyes.");
artObject("Platinum Sunburst Altar Piece", 7500, "platinum and gold", "A radiant altar ornament too large for a pouch.", { size: "medium" });
artObject("Black Opal Funeral Diadem", 7500, "black opal and silver", "A mourning diadem that glitters in dim light.");
artObject("Jeweled Warlord Mantle", 7500, "silk, gold, and gemstones", "A ceremonial mantle sewn with hundreds of stones.", { size: "medium", theme: "old guardroom" });

// Compact valuables.
valuable("Silver Trade Bar", 5, "silver", "A stamped trade bar accepted by most merchants.", { tags: ["metal", "bar"], stackable: true });
valuable("Gold Trade Bar", 50, "gold", "A compact gold bar marked by an old mint.", { tags: ["metal", "bar"], stackable: true });
valuable("Platinum Trade Bar", 500, "platinum", "A dense platinum bar wrapped in oiled cloth.", { tags: ["metal", "bar"], stackable: true });
valuable("Electrum Wire Bundle", 25, "electrum", "A spool of precious pale-gold wire.", { tags: ["metal", "crafting"], stackable: true });
valuable("Rare Incense Casket", 100, "incense and cedar", "A cedar casket filled with temple-grade incense.");
valuable("Exotic Spice Tin", 50, "spices and tin", "A sealed tin of costly red and black spices.");
valuable("Perfume Vial", 25, "glass and perfume", "A small vial of sharp floral perfume.");
valuable("Sealed Noble Wax", 10, "wax", "A packet of colored sealing wax used by heralds.", { stackable: true });
valuable("Fine Parchment Roll", 10, "parchment", "A pristine roll of expensive writing parchment.", { stackable: true });
valuable("Bolt of Silk", 50, "silk", "A folded bolt of fine silk cloth.", { size: "medium" });

const treasureItemIds = window.DungeonContent
  .list("items")
  .filter((item) => item.tags?.includes("treasure"))
  .map((item) => item.id);

window.DungeonContent.register("lootTables", "treasureOnly", {
  name: "Treasure Only",
  itemIds: treasureItemIds,
  entries: [
    { id: "minor-treasure", name: "Minor treasure", kind: "treasure", valueTierGp: 10, weight: 50 },
    { id: "modest-treasure", name: "Modest treasure", kind: "treasure", valueTierGp: 50, weight: 30 },
    { id: "fine-treasure", name: "Fine treasure", kind: "treasure", valueTierGp: 100, weight: 15 },
    { id: "rare-treasure", name: "Rare treasure", kind: "treasure", valueTierGp: 500, weight: 4 },
    { id: "legendary-treasure", name: "Legendary treasure", kind: "treasure", valueTierGp: 1000, weight: 1 },
  ],
});
})();