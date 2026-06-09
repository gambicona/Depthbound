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

const apothecaryLines = [
  "Sit there. No, not on the clean stool. The other one.",
  "I charge by the symptom, not the scream.",
  "If it came from a sewer, a bite, or a mushroom, I have seen worse.",
  "Medicine first, heroic explanations after.",
  "Keep your hands away from the labeled jars unless you can read Old Elvish.",
];

const wizardLines = [
  "No, I do not remove curses for free. I am retired, not dead.",
  "Bring the reagent first. Then we may discuss your poor decisions.",
  "If it whispers in your sleep, stop sleeping near it.",
  "Do not put cursed rings in your mouth. Why does everyone need this explained?",
  "Yes, yes, tragic doom. Put it on the table.",
];

const alchemistLines = [
  "Potions, yes, yes, but have you considered the educational value of a controlled detonation?",
  "Flowers are for poets. Brimstone is for discovery.",
  "Stand behind the yellow line. No, the other yellow line. The first one burned off.",
  "I buy things that hiss, spark, smoke, pop, or make responsible adults nervous.",
  "Healing is fine. Fire is faster.",
];

const arcanistLines = [
  "Please do not touch the vellum unless you can pronounce vellum.",
  "Yes, the scrolls are expensive. So is literacy at this level.",
  "I sell magic. I do not appraise pocket lint, heirloom knives, or whatever that is leaking in your bag.",
  "A spell scroll is not paper. It is a bottled decision made by someone cleverer than most kings.",
  "If you must ask whether it is safe to read aloud, begin with a cheaper scroll.",
];

npc("general-merchant", {
  name: "Sophie",
  title: "General Merchant",
  portrait: "assets/npcs/general-merchant.png",
  token: { fallbackLabel: "GM" },
  village: { unlocked: true, order: 10 },
  dialogue: { entryLines: generalLines },
  inspection:
    "Sophie is a practical, sharp-eyed trader who follows trouble because trouble always needs rope, oil, lanterns, rations, and \"things people forgot until they were already bleeding.\" She has set up a small wagon-stall near Sister Maelis's cemetery chapel.",
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

npc("apothecary", {
  name: "Ilyra Fen",
  title: "Apothecary",
  portrait: "assets/npcs/apothecary.jpg",
  token: { fallbackLabel: "AP" },
  village: { unlocked: true, order: 35 },
  dialogue: { entryLines: apothecaryLines },
  inspection:
    "Ilyra is a steady-handed village apothecary with a travel case full of clean needles, bitter tonics, poultices, and precise little knives. She treats dungeon sickness for coin and keeps notes on anything unusual the party brings back.",
  shop: { type: "apothecary", sellRate: 0.3, acceptsSoldTypes: [] },
  description: "Disease diagnosis and treatment.",
});

npc("sister-maelis", {
  name: "Sister Maelis",
  title: "Keeper of the Graveyard",
  portrait: "assets/tokens/Sister_Maelis.png",
  token: { fallbackLabel: "SM" },
  dialogue: {
    entryLines: [
      "Do not step on that grave. He was disagreeable in life and has not improved.",
      "No, the funeral bell is not for sale.",
      "The dead rarely mind visitors. They mind thieves.",
      "Breathe. If you can still do that, most problems remain negotiable.",
    ],
  },
  inspection:
    "Sister Maelis is a Naevran graveyard keeper and local Gravebinder with dark practical robes, a lantern, a funeral bell, ink-stained fingers, and grave-thread bracelets. She protects names, bodies, ghosts, and records from being turned into tools by the Depth.",
  description: "Graveyard keeper, resurrection witness, and Naevran priestess.",
});

npc("grumpy-wizard", {
  name: "Old Master Vell",
  title: "Grumpy Old Wizard",
  portrait: "assets/npcs/grumpy-wizard.jpg",
  token: { fallbackLabel: "GW" },
  village: { unlocked: true, order: 37 },
  dialogue: { entryLines: wizardLines },
  inspection:
    "Vell is an ancient, crabby hedge-wizard wrapped in patched robes and professional disappointment. He can break curses, but only if the party brings exactly the reagent he asks for.",
  shop: { type: "cursebreaker", sellRate: 0.2, acceptsSoldTypes: [] },
  description: "Curse removal for a specific reagent.",
});

npc("monster-guild", {
  name: "Kessa Briarhook",
  title: "Huntmaster of the Trophy Lodge",
  portrait: "assets/npcs/trophy-lodge-npc.jpg",
  token: { fallbackLabel: "TL" },
  village: {
    label: "The Trophy Lodge",
    unlocked: true,
    unlockFlag: "flag.village.monsterHunterGuildUnlocked",
    hiddenUntilUnlocked: true,
    adminAvailable: true,
    lockText: "Locked until a later story step.",
    order: 40,
  },
  dialogue: {
    entryLines: [
      "If it leaves tracks, teeth, or a smell that scares horses, we can put a price on it.",
      "Bring proof, not stories. Stories do not tan into leather.",
      "The board is fresh. Try not to bleed on the ink.",
      "A monster is only mysterious until someone survives taking notes.",
      "Good hunters come back with trophies. Great hunters come back with the rest of the party.",
    ],
  },
  inspection:
    "Kessa Briarhook runs the Trophy Lodge with a ledger, a scarred longknife, and the patience of someone who has heard every exaggerated monster story twice. She pays for clean trophies, posts dangerous contracts, and teaches practical tricks to parties who prove they can return from the dark.",
  description: "Monster hunting contracts, trophy turn-ins, and hunter reputation.",
});

npc("gravebinders", {
  name: "Odran Vellshade",
  title: "Candlewarden of the Gravebinders",
  portrait: "assets/npcs/gravebinders-npc.jpg",
  token: { fallbackLabel: "GB" },
  village: {
    label: "The Gravebinders",
    unlocked: true,
    unlockFlag: "flag.village.gravebindersUnlocked",
    hiddenUntilUnlocked: true,
    adminAvailable: true,
    lockText: "Locked until a later story step.",
    order: 45,
  },
  dialogue: {
    entryLines: [
      "Speak softly. Some debts are old enough to hear their names from under stone.",
      "Bring ash, wax, bone, or proof the restless have been put down.",
      "The dead do not need fear. They need boundaries.",
      "If something followed you home, say so before it learns the door.",
      "We pay for endings. Clean ones, when possible.",
    ],
  },
  inspection:
    "Odran Vellshade keeps the Gravebinders' candle-ledger in a case of black oak and tarnished silver. He is pale, precise, and unhurried, with the manner of someone who has argued with ghosts and won by waiting. His order pays for undead work, cursed remains, and materials taken from places where the dead refuse to stay quiet.",
  description: "Undead contracts, grave-material turn-ins, and quiet warding rewards.",
});

npc("crucible-collegium", {
  name: "Tavren Quillflare",
  title: "Provost of the Crucible Collegium",
  portrait: "assets/npcs/crucible-collegium-npc.jpg",
  token: { fallbackLabel: "CC" },
  village: {
    label: "Crucible Collegium",
    unlocked: true,
    unlockFlag: "flag.village.crucibleCollegiumUnlocked",
    hiddenUntilUnlocked: true,
    adminAvailable: true,
    lockText: "Locked until a later story step.",
    order: 47,
  },
  dialogue: {
    entryLines: [
      "Do not call them sparks. Sparks are what apprentices make before paperwork.",
      "Bring essence, cores, motes, and observations that survived contact with reality.",
      "If it melted your boots, froze your lantern, or argued with gravity, I want notes.",
      "The elements are not moods. They are laws with teeth.",
      "Fizzwick makes noise. We make repeatable noise.",
    ],
  },
  inspection:
    "Tavren Quillflare is a bright-eyed tiefling scholar with brass spectacles, ink-stained gloves, and a laboratory coat reinforced with scorch plates. He treats elemental violence as a solvable equation, provided someone else is willing to stand close enough to collect data.",
  description: "Elemental contracts, planar reagents, and Collegium reputation.",
});

npc("antiquarian-society", {
  name: "Professor Seraphel Inkglass",
  title: "Chair of the Antiquarian Society",
  portrait: "assets/npcs/antiquarian-society-npc.jpg",
  token: { fallbackLabel: "AQ" },
  village: {
    label: "Antiquarian Society",
    unlocked: true,
    unlockFlag: "flag.village.antiquarianSocietyUnlocked",
    hiddenUntilUnlocked: true,
    adminAvailable: true,
    lockText: "Locked until a later story step.",
    order: 48,
  },
  dialogue: {
    entryLines: [
      "Do not polish the relics. Dirt is context.",
      "A cracked tablet is still a sentence, if one has the courtesy to listen.",
      "Treasure is vulgar until cataloged. Then it becomes funding.",
      "Bring me inscriptions, field notes, old seals, and objects with suspicious provenance.",
      "If it hums in a dead language, wrap it twice and look smug.",
    ],
  },
  inspection:
    "Professor Seraphel Inkglass presides over the Antiquarian Society from behind a mobile archive desk stacked with vellum tubes, brass lenses, and more bookmarks than seems structurally safe. She is delighted by old things, unimpressed by shiny things, and ruthless about labeling.",
  description: "Tome cataloging, relic turn-ins, and scholarly field commissions.",
});

npc("expedition-board", {
  name: "Nella Waymark",
  title: "Expedition Clerk",
  portrait: "assets/npcs/expedition-board-npc.jpg",
  token: { fallbackLabel: "EX" },
  village: {
    label: "Expedition Board",
    unlocked: true,
    unlockFlag: "flag.village.expeditionBoardUnlocked",
    hiddenUntilUnlocked: true,
    adminAvailable: true,
    lockText: "Locked until a later story step.",
    order: 49,
  },
  dialogue: {
    entryLines: [
      "Sign the route, bring back a mark on the map, and try not to make me file a missing party notice.",
      "Successful expeditions get paid. Dramatic expeditions get corrected in red ink.",
      "The Board wants roads proved, ruins checked, and supply ledgers that do not smell like panic.",
      "If you found a shortcut, write it down before the bard improves it.",
      "No, 'very dark and bad' is not a terrain report.",
    ],
  },
  inspection:
    "Nella Waymark manages the Expedition Board with a wax pencil, pinned route cards, and the expression of someone who has heard too many adventurers call getting lost 'scouting'. She pays for completed delves, mapped routes, recovered supplies, and field reliability.",
  description: "Dungeon completion contracts, route work, and expedition supply turn-ins.",
});

npc("boom-club", {
  name: "Fizzwick Boomwhistle",
  title: "Founder of Fizzwick's Boom Club",
  portrait: "assets/npcs/alchemist.jpg",
  token: { fallbackLabel: "BC" },
  village: {
    label: "Fizzwick's Boom Club",
    unlocked: true,
    unlockFlag: "flag.village.boomClubUnlocked",
    hiddenUntilUnlocked: true,
    adminAvailable: true,
    lockText: "Locked until a later story step.",
    order: 51,
  },
  dialogue: {
    entryLines: [
      "Welcome to the club. The first rule is goggles. The second rule is still goggles, but louder.",
      "Bring me coal, brimstone, pressure cores, and anything that makes a sensible person step backward.",
      "We are not reckless. We are aggressively curious with excellent ventilation.",
      "If a vial whispers, label it. If it screams, label it from farther away.",
      "Remember: a failed experiment is just a successful warning.",
    ],
  },
  inspection:
    "Fizzwick's Boom Club is less a club and more a semi-formal waiting list for scorch-resistant curiosity. Fizzwick tracks volatile reagents, field tests, and explosive discoveries with genuine brilliance, dramatic underlining, and several ink blots that may once have been sparks.",
  description: "Volatile reagent commissions, explosive turn-ins, and lightly singed reputation.",
});

npc("fighting-pit", {
  name: "Brakka Ironbell",
  title: "Pit Marshal",
  portrait: "assets/npcs/fighting-pit-npc.jpg",
  token: { fallbackLabel: "FP" },
  village: {
    label: "Fighting Pit",
    unlocked: true,
    unlockFlag: "flag.village.fightingPitUnlocked",
    hiddenUntilUnlocked: true,
    adminAvailable: true,
    lockText: "Locked until a later story step.",
    order: 52,
  },
  dialogue: {
    entryLines: [
      "Step in, stand together, and give the crowd something cleaner than a tavern argument. Blunted steel, medics ready, no funerals.",
      "Three heats, then a champion. Then the next bracket starts meaner.",
      "Boss falls, you breathe. Short rest only. No feather beds in my pit.",
      "The bell rings when you earn it, not when you ask nicely.",
      "Renown is simple: win where people can see you.",
    ],
  },
  inspection:
    "Brakka Ironbell runs the Fighting Pit with a brass bell, a ledger of odds, and a voice that carries over steel. The weapons are blunted, medics wait at the rail, and the rules forbid lethal finishes. She keeps the arena fair enough to be sport and dangerous enough to matter. Parties earn coin and renown by surviving escalating waves.",
  description: "Wave arena battles, boss checkpoints, rewards, and pit renown.",
});

npc("alchemist", {
  name: "Fizzwick Boomwhistle",
  title: "Master of Volatile Solutions",
  portrait: "assets/npcs/alchemist.jpg",
  token: { fallbackLabel: "AL" },
  village: {
    unlocked: true,
    unlockFlag: "flag.village.alchemistUnlocked",
    hiddenUntilUnlocked: true,
    adminAvailable: true,
    lockText: "Locked until a later story step.",
    order: 50,
  },
  dialogue: { entryLines: alchemistLines },
  inspection:
    "Fizzwick is a soot-smudged gnome alchemist with singed eyebrows, oversized goggles, and a satchel that clinks in a deeply worrying way. He stocks potions because adventurers insist on surviving, but his real joy is anything explosive, volatile, or likely to make a door regret existing.",
  shop: { type: "alchemist", sellRate: 0.45, acceptsSoldTypes: ["consumable", "component"] },
  description: "Potions, Alchemist's Fire, and random requests for explosive materials.",
});

npc("arcanist", {
  name: "Sarthax Veyrune",
  title: "Master Arcanist",
  portrait: "assets/npcs/arcanist.jpg",
  token: { fallbackLabel: "AR" },
  village: {
    unlocked: true,
    unlockFlag: "flag.village.arcanistUnlocked",
    hiddenUntilUnlocked: true,
    adminAvailable: true,
    lockText: "Locked until a later story step.",
    order: 55,
  },
  dialogue: { entryLines: arcanistLines },
  inspection:
    "Sarthax is a crimson-scaled dragonborn arcanist in immaculate robes, each claw tipped with a silver writing cap. He sells carefully sealed spell scrolls at prices he considers reasonable, which is to say prices that imply the buyer should be grateful to be allowed near them.",
  shop: { type: "arcanist", buyPriceMultiplier: 2, acceptsSoldTypes: [], buysFromParty: false },
  description: "Expensive spell scrolls. Does not buy party goods.",
});
})();
