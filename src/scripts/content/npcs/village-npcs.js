(() => {
const npc = (id, definition) => window.DungeonContent.register("npcs", id, { id, ...definition });

const generalLines = [
  "Welcome in. If it fits in a pack and does not bite, I probably have it.",
  "Mind the crates. The last adventurer tripped over arrows and blamed the arrows.",
  "Coins on the counter, questions after. I am friendly, not free.",
  "You look like someone who needs practical things before heroic things.",
  "Potions are on the left, bolts and arrows on the right. Please do not test either indoors.",
  "Back from the dark already? Good. I prefer customers who survive long enough to pay twice.",
  "I keep the everyday goods. The dangerous steel has its own loud neighbor.",
  "If you find something strange underground, I might buy it. If it whispers, keep it wrapped.",
  "Supplies first, glory second. That order saves lives.",
  "No refunds on goods used inside monsters, fires, cursed fountains, or mysterious doors.",
];

const weaponLines = [
  "Welcome to the forge. Pick something honest, sharp, or heavy. Best if it is all three.",
  "Do not tap the blades. They bite before they know your name.",
  "A good weapon should feel like an answer in your hand.",
  "If you need pretty, look at the polish. If you need alive, look at the edge.",
  "I sell steel, iron, and bad ideas shaped into useful lengths.",
  "That dent? Character. That crack? Discount. That missing handle? No, I am not selling that one.",
  "Bows are carpenter work. I deal in metal that means what it says.",
  "Bring coin, leave with confidence. Or at least with something pointy.",
  "Every blade here has been balanced. Some owners less so.",
  "Choose carefully. A weapon remembers the hand that panics.",
];

const armorLines = [
  "Welcome. If something is trying to kill you, put better work between it and your organs.",
  "Stand still and breathe. Armor that fits badly is just a slow trap.",
  "Leather, mail, plate, shields. Bruises cost less when you buy before the fight.",
  "I can sell you confidence by the pound.",
  "Do not ask if plate is heavy. Ask if being stabbed is heavier.",
  "The straps matter. The buckle that saves you is never the fancy one.",
  "A shield is not cowardice. It is a portable wall with ambition.",
  "If it squeaks, oil it. If it cracks, replace it. If it glows, ask a wizard.",
  "Good armor lets you make one more mistake than the other fool.",
  "Come in whole, leave harder to ruin.",
];

npc("general-merchant", {
  name: "Marra Vell",
  title: "General Merchant",
  portrait: "assets/npcs/general-merchant.png",
  token: { fallbackLabel: "GM" },
  village: { unlocked: true, order: 10 },
  dialogue: { entryLines: generalLines },
  inspection:
    "Marra is a practical, sharp-eyed trader who follows trouble because trouble always needs rope, oil, lanterns, rations, and \"things people forgot until they were already bleeding.\" She has set up a small wagon-stall near Sister Maelis's cemetery chapel.",
  shop: { type: "general", sellRate: 0.4, acceptsSoldTypes: ["any"] },
  description: "Everyday supplies, ammunition, and basic recovery goods.",
});

npc("weaponsmith", {
  name: "Vaelion Thornlark",
  title: "Weaponsmith",
  portrait: "assets/npcs/weaponsmith.png",
  token: { fallbackLabel: "WS" },
  village: { unlocked: true, order: 20 },
  dialogue: { entryLines: weaponLines },
  inspection:
    "Vaelion is an old elven bladesmith with silver-streaked black hair, calm hands, and a bitter dislike for things that does not want to stay dead. His weapons are elegant, precise, and often engraved with protective script.",
  shop: { type: "weaponsmith", sellRate: 0.5, acceptsSoldTypes: ["weapon"] },
  description: "Standard non-magical metal weapons.",
});

npc("armorsmith", {
  name: "Borren Ashmantle",
  title: "Armorsmith",
  portrait: "assets/npcs/armorsmith.png",
  token: { fallbackLabel: "AS" },
  village: { unlocked: true, order: 30 },
  dialogue: { entryLines: armorLines },
  inspection:
    "Borren is a broad, soot-stained dwarf armorer who repairs mail, shields, helmets, and grave-dented plate from a portable forge wagon. He is gruff, fair, and deeply offended by badly maintained armor.",
  shop: { type: "armorsmith", sellRate: 0.5, acceptsSoldTypes: ["armor"] },
  description: "Standard non-magical armor and shields.",
});

npc("monster-guild", {
  name: "Monster Guild",
  title: "Bounties and Contracts",
  portrait: "assets/npcs/monster-guild.png",
  token: { fallbackLabel: "MG" },
  village: { unlocked: false, lockText: "Locked until a later story step.", order: 40 },
  dialogue: { entryLines: ["The guild hall is shut. Something large scratches at the other side."] },
  description: "Future monster contracts and bounty chains.",
});

npc("alchemist", {
  name: "Alchemist",
  title: "Potions and Reagents",
  portrait: "assets/npcs/alchemist.png",
  token: { fallbackLabel: "AL" },
  village: { unlocked: false, lockText: "Locked until a later story step.", order: 50 },
  dialogue: { entryLines: ["Colored glass bottles glow behind a locked door."] },
  description: "Future potions, bombs, and reagents.",
});
})();
