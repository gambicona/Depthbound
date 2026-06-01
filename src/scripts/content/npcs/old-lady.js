(() => {
/*
CODEX IMPLEMENTATION NOTES

This file is a data-first NPC module. It defines one static questgiver NPC, her reward items,
and her full quest chain. It intentionally does not change core gameplay by itself.

Recommended core hooks:
1. NPC registry and spawning
   - Read window.DungeonContent.list("npcs").
   - Spawn static NPC tokens in home mode, safe rooms, or configured dungeon rooms.
   - NPCs are not fighters: no initiative, no stats, no attacks, no targeting.
   - Use npc.token.image if present; otherwise use token.fallbackLabel.

2. NPC interaction
   - When the hero is adjacent to or on the same room screen as the NPC, open a dialogue panel.
   - Dialogue should show greeting, available quests, active quests, and completed quest history.
   - Use npc.dialogue keys and quest.dialogue blocks.

3. Quest state
   - Store quest flags in the save file, for example state.questFlags or hero.questFlags.
   - Track per-quest state: locked, available, accepted, readyToTurnIn, completed.
   - Unlock a quest when all unlock.flagsAll are true and all unlock.completedQuests are completed.
   - Set quest.flags.onAccept when accepted.
   - Set quest.flags.onComplete when rewards are claimed.

4. Kill objectives
   - When a monster dies, emit or call a quest progress update with monster.id and monster.tags.
   - A kill objective can match by monsterId or monsterTag.
   - Example: objective monsterId "cryptGuard" should count slain Crypt Guards.

5. Item delivery objectives
   - Objectives can match inventory items by itemId, itemTag, or lootTag.
   - If consumeOnTurnIn is true, remove the required quantity from inventory when turning in.
   - Green Vines are intentionally not registered here. Later add any item with tags:
     ["green-vines", "quest-item", "old-lady"] or id "green-vines".

6. Rewards
   - Add reward.money to hero.inventory.money.
   - Add reward.items by creating item instances from the registered item ids.
   - reward.flagsSet should be merged into the persistent quest flags.

7. Hearty Soup / full healing
   - This file uses use.kind: "fullHealing" for Hearty Soup.
   - Implement it like a healing potion, but set hero.hp = hero.maxHp and then consume the item.
   - It occupies belt slots so it can be used from the same UI as potions.

8. Hearth amulet passive effects
   - The amulet is registered as an accessory and can be equipped in the amulet slot.
   - Its max HP / healing bonus / resistance effects are metadata until your magic accessory hooks apply them.
*/

const gp = (amount) => ({ amount, unit: "gp", text: `${amount} gp` });
const sp = (amount) => ({ amount, unit: "sp", text: `${amount} sp` });

function uniqueTags(tags) {
  return Array.from(new Set(tags.filter(Boolean)));
}

function registerItem(id, item) {
  const existing = window.DungeonContent.get?.("items", id) ?? {};
  window.DungeonContent.register("items", id, {
    ...existing,
    id,
    ...item,
    tags: uniqueTags([...(existing.tags ?? []), ...(item.tags ?? [])]),
    component: item.component || existing.component ? { ...(existing.component ?? {}), ...(item.component ?? {}) } : undefined,
    store: item.store || existing.store ? { ...(existing.store ?? {}), ...(item.store ?? {}) } : undefined,
    flavor: item.flavor || existing.flavor ? { ...(existing.flavor ?? {}), ...(item.flavor ?? {}) } : undefined,
  });
}

registerItem("old-lady-hearty-soup", {
  name: "Old Lady's Hearty Soup",
  type: "consumable",
  category: "food",
  cost: gp(25),
  weightLb: 0.5,
  slots: ["belt1", "belt2", "belt3", "belt4", "belt5"],
  tags: uniqueTags([
    "consumable",
    "food",
    "healing",
    "full-healing",
    "quest-reward",
    "old-lady",
    "not-for-random-store",
  ]),
  store: {
    buyable: false,
    sellable: true,
    reason: "quest reward food",
  },
  use: {
    kind: "fullHealing",
    resource: "bonusAction",
    consume: true,
    description: "Restore HP to maximum. Consumed on use.",
    codexImplementation: "Handle like a potion use action, but set hero.hp = hero.maxHp instead of rolling dice.",
  },
  flavor: {
    short: "Still warm, somehow.",
    description:
      "A covered clay bowl of thick herb soup. It smells like onions, pepper, and the kind of care that refuses to die.",
  },
});

registerItem("green-vines", {
  name: "Green Vines",
  type: "component",
  category: "herb",
  cost: { amount: 1, unit: "cp", text: "1 cp" },
  weightLb: 0,
  quantity: 1,
  stackable: true,
  resourceInventory: "party",
  tags: uniqueTags(["component", "crafting", "alchemy", "herb", "plant", "vine", "nature", "forest", "forage", "food", "healing", "green-vines", "quest-item", "party-resource", "old-lady", "quest:old-lady", "quest:green-vines"]),
  component: {
    kind: "herb",
    material: "plant",
    form: "vine",
    rarity: "common",
    quality: "standard",
    source: "forest forage",
    sourceTags: ["nature", "forest", "forage"],
    craftingValueCp: 1,
    questKey: "quest:green-vines",
    professions: ["alchemist", "herbalist", "cook", "healer"],
    biomes: ["forest", "wilds"],
  },
  store: {
    buyable: false,
    sellable: true,
    reason: "Mara requested these, but they are also useful herbs",
    rate: 1,
  },
  flavor: {
    short: "Fresh green vines for Mara's first pot.",
    description:
      "Supple forest vines with a clean, peppery scent. Mara asked for the lively green ones, and these look lively enough to argue.",
  },
});

registerItem("black-briar-root", {
  name: "Black Briar Root",
  type: "component",
  category: "alchemy reagent",
  cost: { amount: 3, unit: "sp", text: "3 sp" },
  weightLb: 0,
  quantity: 1,
  stackable: true,
  resourceInventory: "party",
  tags: uniqueTags(["component", "crafting", "alchemy", "herb", "plant", "root", "nature", "forest", "forage", "magic-reagent", "black-briar-root", "quest-item", "party-resource", "old-lady", "quest:old-lady", "quest:black-briar-root"]),
  component: {
    kind: "herb",
    material: "plant",
    form: "root",
    rarity: "uncommon",
    quality: "standard",
    source: "forest forage",
    sourceTags: ["nature", "forest", "forage"],
    craftingValueCp: 30,
    questKey: "quest:black-briar-root",
    professions: ["alchemist", "herbalist", "healer"],
    biomes: ["forest", "swamp", "wilds"],
  },
  store: {
    buyable: false,
    sellable: true,
    reason: "rare herbal reagent",
    rate: 1,
  },
  flavor: {
    short: "A bitter black root for a later errand.",
    description: "A dark, knotty root that smells like wet soil and old smoke.",
  },
});

registerItem("old-guardroom-relic", {
  name: "Old Guardroom Relic",
  type: "treasure",
  category: "keepsake",
  cost: gp(5),
  weightLb: 0.1,
  tags: uniqueTags(["old-guardroom-relic", "quest-item", "old-lady", "old-guardroom", "treasure"]),
  component: {
    kind: "relic",
    material: "metal",
    form: "keepsake",
    rarity: "common",
    quality: "worn",
    source: "old guardroom",
    sourceTags: ["old-guardroom", "barracks", "crypt", "dungeon"],
    craftingValueCp: 500,
    questKey: "quest:old-lady",
    professions: ["relic-scholar", "jeweler", "blacksmith"],
    themes: ["old-guardroom"],
  },
  store: {
    buyable: false,
    sellable: true,
    reason: "old guardroom keepsake",
  },
  sell: {
    valueCp: 500,
  },
  treasure: {
    kind: "old guardroom relic",
    valueCp: 500,
    valueGp: 5,
  },
  flavor: {
    short: "A small keepsake from the old guardroom.",
    description: "A bent button, badge, or nameplate from soldiers who no longer remember being people.",
  },
});

registerItem("old-lady-broth", {
  name: "Old Lady's Restorative Broth",
  type: "consumable",
  category: "food",
  cost: sp(8),
  weightLb: 0.5,
  slots: ["belt1", "belt2", "belt3", "belt4", "belt5"],
  tags: uniqueTags(["consumable", "food", "healing", "quest-reward", "old-lady", "not-for-random-store"]),
  store: {
    buyable: false,
    sellable: true,
    reason: "quest reward food",
  },
  use: {
    kind: "healing",
    resource: "bonusAction",
    dice: { count: 2, sides: 4 },
    bonus: 2,
    consume: true,
    description: "Heal 2d4 + 2 HP. Consumed on use.",
  },
  flavor: {
    short: "A humble healing broth.",
    description: "A little jar of salty herb broth with a scrap of cloth tied around the lid.",
  },
});

registerItem("old-lady-hearth-amulet", {
  name: "Old Lady's Hearth Amulet",
  type: "accessory",
  category: "amulet",
  cost: gp(250),
  weightLb: 0.1,
  slots: ["amulet"],
  tags: uniqueTags([
    "magic",
    "magic-item",
    "magic-accessory",
    "quest-reward",
    "old-lady",
    "slot:amulet",
    "max-hp:+5",
    "healing-bonus:+2",
    "not-for-random-store",
  ]),
  store: {
    buyable: false,
    sellable: true,
    reason: "unique quest reward",
  },
  loot: {
    kind: "quest amulet",
    rarity: "uncommon",
    priceGp: 250,
    priceCp: 25000,
    dropWeight: 0,
    unique: true,
  },
  magic: {
    kind: "accessory",
    slotGroup: "Amulet",
    rarity: "uncommon",
    priceGp: 250,
    effects: {
      maxHpBonus: 5,
      healingReceivedBonus: 2,
    },
    description: "Grants +5 max HP. Whenever you heal, restore 2 additional HP.",
    implementation:
      "Apply maxHpBonus while equipped. When this character receives healing, add healingReceivedBonus after the healing roll/full-heal calculation, then clamp to max HP.",
  },
  flavor: {
    short: "A warm little charm of twine, brass, and dried herbs.",
    description:
      "The amulet is not impressive at first glance: a brass button, a loop of red thread, and a pinch of dried green leaves sealed behind cloudy glass. It feels warm against the chest.",
  },
});

registerItem("old-lady-widows-locket", {
  name: "Widow's Locket of the Last Hearth",
  type: "accessory",
  category: "amulet",
  cost: gp(1200),
  weightLb: 0.1,
  slots: ["amulet"],
  tags: uniqueTags([
    "magic",
    "magic-item",
    "magic-accessory",
    "quest-reward",
    "old-lady",
    "slot:amulet",
    "max-hp:+10",
    "resistance:necrotic",
    "not-for-random-store",
  ]),
  store: {
    buyable: false,
    sellable: true,
    reason: "unique quest reward",
  },
  loot: {
    kind: "quest amulet",
    rarity: "rare",
    priceGp: 1200,
    priceCp: 120000,
    dropWeight: 0,
    unique: true,
  },
  magic: {
    kind: "accessory",
    slotGroup: "Amulet",
    rarity: "rare",
    priceGp: 1200,
    effects: {
      maxHpBonus: 10,
      resistances: ["necrotic"],
    },
    description: "Grants +10 max HP and necrotic resistance.",
    implementation: "Apply while equipped through the same passive accessory effect system as other magic accessories.",
  },
  flavor: {
    short: "A closed locket with a name scratched away.",
    description:
      "A blackened silver locket. Inside is a pressed green vine and the faded outline of a person whose face has been rubbed away by a thumb over many years.",
  },
});

const oldLadyQuestChain = {
  id: "oldLadyKindnessChain",
  npcId: "oldLady",
  name: "The Old Lady's Errands",
  summary: "A gentle, suspiciously durable old woman asks for herbs, keepsakes, and small acts of violence against the restless dead.",
  tags: ["old-lady", "home", "quest-chain", "starter", "old-guardroom"],
  repeatable: false,
  quests: [
    {
      id: "old-lady-quest-green-vines",
      order: 1,
      title: "Green Vines for the Pot",
      shortTitle: "Green Vines",
      levelHint: "Level 1+",
      statusFlag: "quest.oldLady.greenVines",
      unlock: {
        flagsAll: [],
        completedQuests: [],
        description: "Available as soon as the Old Lady is unlocked.",
      },
      objectives: [
        {
          id: "bring-green-vines-3",
          kind: "collectItems",
          displayName: "Green Vines",
          itemId: "green-vines",
          itemTag: "green-vines",
          count: 3,
          consumeOnTurnIn: true,
          placeholder: true,
          progressText: "Bring 3 Green Vines to the Old Lady.",
          codexImplementation:
            "Count inventory items where item.id === 'green-vines' or item.tags includes 'green-vines'. Consume 3 on turn-in.",
        },
      ],
      rewards: {
        money: { gp: 15, sp: 0, cp: 0 },
        items: [
          { itemId: "old-lady-broth", quantity: 1 },
          { itemId: "old-lady-hearty-soup", quantity: 1 },
        ],
        xp: 0,
        flagsSet: ["flag.oldLady.knowsYou", "flag.oldLady.greenVinesDone"],
      },
      dialogue: {
        offer:
          "There you are, honey. The stones outside are colder than they have any right to be. Bring me three Green Vines, and I'll make something that keeps the chill out of your bones.",
        accept:
          "Good. Pick the lively ones, not the grey ones. Grey vines are for widows and taxes, and I have had enough of both.",
        reminder:
          "Three Green Vines, honey. Green. If it twitches, stomp it first. Then bring it to me. You should find some in the forest.",
        ready:
          "Ah, smell that? Sharp and clean. You found good vines. Hand them here before they learn to crawl away.",
        complete:
          "There. Soup for the road, broth for the bruises, and a few coins because bravery spends faster than sense.",
      },
    },
    {
      id: "old-lady-quest-cryptguards",
      order: 2,
      title: "The Ones at the Door",
      shortTitle: "Crypt Guards",
      levelHint: "Level 1-2",
      statusFlag: "quest.oldLady.cryptguards",
      unlock: {
        flagsAll: ["flag.oldLady.greenVinesDone"],
        completedQuests: ["old-lady-quest-green-vines"],
        description: "Unlocked after Green Vines for the Pot.",
      },
      objectives: [
        {
          id: "kill-crypt-guards-5",
          kind: "killMonsters",
          displayName: "Crypt Guards",
          monsterId: "cryptGuard",
          monsterTag: "crypt-guard",
          count: 5,
          progressText: "Kill 5 Crypt Guards.",
          codexImplementation:
            "Increment when a defeated monster has id/baseId 'cryptGuard' or tags containing 'crypt-guard'.",
        },
      ],
      rewards: {
        money: { gp: 30, sp: 0, cp: 0 },
        items: [{ itemId: "old-lady-hearty-soup", quantity: 1 }],
        xp: 0,
        flagsSet: ["flag.oldLady.cryptguardsDone"],
      },
      dialogue: {
        offer:
          "Those Crypt Guards keep scraping at the threshold after midnight. Polite dead men would knock. Kill five of them for me, honey.",
        accept: "Five. Not four and a half. If one is still crawling, it is still being rude.",
        reminder: "The Crypt Guards are still making that awful scraping sound. Five of them, honey.",
        ready: "Quiet night. I heard the difference. You did it, didn't you?",
        complete: "Take this soup. You look like someone hit you with a door. Several doors, maybe.",
      },
    },
    {
      id: "old-lady-quest-barracks-relics",
      order: 3,
      title: "Buttons for the Dead",
      shortTitle: "Old Relics",
      levelHint: "Level 2+",
      statusFlag: "quest.oldLady.barracksRelics",
      unlock: {
        flagsAll: ["flag.oldLady.cryptguardsDone"],
        completedQuests: ["old-lady-quest-cryptguards"],
        description: "Unlocked after The Ones at the Door.",
      },
      objectives: [
        {
          id: "bring-old-guardroom-relics-5",
          kind: "collectItems",
          displayName: "Old Guardroom Relics",
          itemId: null,
          itemTag: "old-guardroom-relic",
          lootTag: "old-guardroom-relic",
          count: 5,
          consumeOnTurnIn: true,
          placeholder: true,
          examples: ["rusted-button", "broken-watch-badge", "barracks-nameplate"],
          progressText: "Bring 5 items tagged old-guardroom-relic.",
          codexImplementation:
            "Later, tag small dungeon valuables or junk loot with 'old-guardroom-relic'. Count any matching inventory item. Consume 5 on turn-in.",
        },
      ],
      rewards: {
        money: { gp: 45, sp: 0, cp: 0 },
        items: [{ itemId: "old-lady-hearth-amulet", quantity: 1 }],
        xp: 0,
        flagsSet: ["flag.oldLady.relicsDone", "flag.oldLady.gaveHearthAmulet"],
      },
      dialogue: {
        offer:
          "The old soldiers used to wear little brass buttons. Badges too. Names on bits of metal. Bring me five keepsakes from the guardroom, honey. The dead forget themselves without small things.",
        accept: "Five relics. Nothing grand. Grand things lie. Small things remember.",
        reminder:
          "Buttons, badges, nameplates. Five little guardroom relics. Bring them here and don't polish them. Dirt is part of memory.",
        ready: "Oh. Yes. These will do. This one still has a thumb mark on it.",
        complete:
          "Here. A charm for your neck. It is not pretty, but neither are you after a fight, and I still think you are worth protecting.",
      },
    },
    {
      id: "old-lady-quest-bones-and-bows",
      order: 4,
      title: "Bones and Bowstrings",
      shortTitle: "Skeleton Cleanup",
      levelHint: "Level 2-3",
      statusFlag: "quest.oldLady.bonesAndBows",
      unlock: {
        flagsAll: ["flag.oldLady.relicsDone"],
        completedQuests: ["old-lady-quest-barracks-relics"],
        description: "Unlocked after Buttons for the Dead.",
      },
      objectives: [
        {
          id: "kill-bone-recruits-6",
          kind: "killMonsters",
          displayName: "Bone Recruits",
          monsterId: "boneRecruit",
          monsterTag: "bone-recruit",
          count: 6,
          progressText: "Kill 6 Bone Recruits.",
        },
        {
          id: "kill-skeleton-archers-4",
          kind: "killMonsters",
          displayName: "Skeleton Archers",
          monsterId: "skeletonArcher",
          monsterTag: "skeleton-archer",
          count: 4,
          progressText: "Kill 4 Skeleton Archers.",
        },
      ],
      rewards: {
        money: { gp: 75, sp: 0, cp: 0 },
        items: [
          { itemId: "old-lady-hearty-soup", quantity: 2 },
          { itemId: "old-lady-broth", quantity: 2 },
        ],
        xp: 0,
        flagsSet: ["flag.oldLady.bonesAndBowsDone"],
      },
      dialogue: {
        offer:
          "Now the little bones are gathering bows. I do not like a corpse that learns logistics. Break six Bone Recruits and four Skeleton Archers for me, honey.",
        accept:
          "Mind the arrows. They never aim well, but there are enough of them that luck starts pretending to be skill.",
        reminder:
          "Six Bone Recruits. Four Skeleton Archers. And keep your shield up unless you want me sewing you shut again.",
        ready: "No clattering, no bowstrings. Good. The silence is almost decent tonight.",
        complete: "You are too thin for the amount of trouble you find. Take two soups. No arguing.",
      },
    },
    {
      id: "old-lady-quest-bitter-root",
      order: 5,
      title: "Bitter Root for Bitter Dreams",
      shortTitle: "Bitter Root",
      levelHint: "Level 3+",
      statusFlag: "quest.oldLady.bitterRoot",
      unlock: {
        flagsAll: ["flag.oldLady.bonesAndBowsDone"],
        completedQuests: ["old-lady-quest-bones-and-bows"],
        description: "Unlocked after Bones and Bowstrings.",
      },
      objectives: [
        {
          id: "bring-black-briar-root-1",
          kind: "collectItems",
          displayName: "Black Briar Root",
          itemId: "black-briar-root",
          itemTag: "black-briar-root",
          count: 1,
          consumeOnTurnIn: true,
          placeholder: true,
          progressText: "Bring 1 Black Briar Root.",
          codexImplementation:
            "Later add a rare herb item with id or tag 'black-briar-root'. It can drop from deeper rooms, nature objects, or special chests.",
        },
        {
          id: "kill-old-sergeant-1",
          kind: "killMonsters",
          displayName: "Old Sergeant",
          monsterId: "oldSergeant",
          monsterTag: "old-sergeant",
          count: 1,
          progressText: "Defeat 1 Old Sergeant.",
        },
      ],
      rewards: {
        money: { gp: 120, sp: 0, cp: 0 },
        items: [{ itemId: "old-lady-hearty-soup", quantity: 3 }],
        xp: 0,
        flagsSet: ["flag.oldLady.bitterRootDone"],
      },
      dialogue: {
        offer:
          "There is a root that grows where nightmares leak into mortar. Black Briar. Bring me one. And if you meet the Old Sergeant, put him down. He has marched long enough.",
        accept:
          "Do not chew the root. Do not smell the root. Do not listen if the root starts giving advice.",
        reminder: "One Black Briar Root, and the Old Sergeant laid quiet. That is the work.",
        ready: "There it is. Bitter little thing. And the Sergeant is quiet? Good. Good, honey.",
        complete:
          "This batch will bite going down, but it will keep you alive. Living is rarely polite.",
      },
    },
    {
      id: "old-lady-quest-last-watch",
      order: 6,
      title: "The Last Watchman",
      shortTitle: "Last Watchman",
      levelHint: "Level 3-4 boss quest",
      statusFlag: "quest.oldLady.lastWatchman",
      unlock: {
        flagsAll: ["flag.oldLady.bitterRootDone"],
        completedQuests: ["old-lady-quest-bitter-root"],
        description: "Unlocked after Bitter Root for Bitter Dreams.",
      },
      objectives: [
        {
          id: "kill-guardroom-commander-1",
          kind: "killMonsters",
          displayName: "Guardroom Commander",
          monsterId: "guardroomCommander",
          monsterTag: "guardroom-commander",
          count: 1,
          progressText: "Defeat the Guardroom Commander.",
          codexImplementation:
            "Count either monster id 'guardroomCommander' or tag 'guardroom-commander'. If your boss id differs, map it here.",
        },
      ],
      rewards: {
        money: { gp: 250, sp: 0, cp: 0 },
        items: [
          { itemId: "old-lady-widows-locket", quantity: 1 },
          { itemId: "old-lady-hearty-soup", quantity: 3 },
        ],
        xp: 0,
        flagsSet: ["flag.oldLady.lastWatchmanDone", "flag.oldLady.questChainComplete"],
      },
      dialogue: {
        offer:
          "Only one name still knocks inside my skull. The Commander. He kept the watch when the watch stopped meaning anything. End him, honey. Not for me. For the room.",
        accept: "He will stand straighter than the others. That does not mean he is noble. Rot can learn posture.",
        reminder: "The Guardroom Commander still keeps his last watch. Bring him peace, or whatever passes for it now.",
        ready: "I felt it. Like a door closing three houses away. He is gone, isn't he?",
        complete:
          "Then take this. I kept it too long. It knows grief, but it knows how to keep a heart beating through it.",
      },
    },
    {
      id: "old-lady-quest-hearth-for-the-road",
      order: 7,
      title: "A Pot of Your Own",
      shortTitle: "Cooking Pot",
      levelHint: "Final home reward",
      statusFlag: "quest.oldLady.cookingPot",
      unlock: {
        flagsAll: ["flag.oldLady.questChainComplete"],
        completedQuests: ["old-lady-quest-last-watch"],
        description: "Unlocked after The Last Watchman.",
      },
      objectives: [
        {
          id: "speak-to-mara-final",
          kind: "talkToNpc",
          displayName: "Hear Mara out",
          count: 1,
          progressText: "Speak with Old Lady Mara after her last errand.",
        },
      ],
      rewards: {
        money: { gp: 0, sp: 0, cp: 0 },
        items: [],
        homeFurniture: [{ furnitureId: "home-cooking-pot", quantity: 1 }],
        xp: 0,
        flagsSet: ["flag.oldLady.cookingPotGifted"],
      },
      dialogue: {
        offer:
          "You have run enough errands for my old bones, honey. Take a pot of your own. Put it near your door, move it if you must, and try to eat before the bleeding starts.",
        accept: "There. A little hearth follows you now.",
        reminder: "The pot is yours, honey. Use it. Heroes who forget soup become cautionary tales.",
        ready: "I brought the pot. Don't look so surprised. I can carry more than gossip.",
        complete: "There. Home should smell like something worth returning to.",
      },
    },
  ],
};

const oldLadyNpc = {
  id: "oldLady",
  name: "Old Lady Mara",
  displayName: "Old Lady",
  title: "Keeper of the Hearth",
  type: "npc",
  role: "questgiver",
  static: true,
  combatant: false,
  targetable: false,
  blocksMovement: false,
  blocksLineOfSight: false,
  tags: ["npc", "questgiver", "old-lady", "home", "healer", "old-guardroom"],

  token: {
    image: "assets/npcs/old-lady.png",
    portrait: "assets/npcs/old-lady.png",
    fallbackLabel: "M",
    fallbackTitle: "Old Lady Mara",
    ringColor: "#d7a84f",
    backgroundColor: "#2a211d",
  },
  portrait: "assets/npcs/old-lady.png",

  spawn: {
    mode: "home",
    roomId: "home",
    preferredPosition: { x: 1, y: 5 },
    fallbackPosition: { x: 1, y: 1 },
    interactionRangeSquares: 1,
    visibleFromStart: true,
    unlockFlagsAny: [],
    hideWhenQuestChainComplete: false,
  },
  village: {
    unlocked: true,
    unlockFlag: "oldLadyAvailable",
    label: "Old Lady's Hut",
    description: "Mara's warm, suspiciously well-stocked hut.",
    hiddenUntilUnlocked: true,
    order: 60,
    lockText: "Someone may come calling after the first Thornwood errand.",
  },
  arrival: {
    title: "A Knock at the Door",
    confirmText: "Welcome Mara",
    cancelText: "Later",
    paragraphs: [
      "Old Lady Mara arrives wrapped in shawls, smelling of pepper and woodsmoke.",
      "\"May I come in, honey? I heard you have been venturing into the forest. I might need a thing or two from there, if you care for an Old Lady like me.\"",
      "She introduces herself as the keeper of a little hut near the village edge. She gives you her first errand into your hands: bring her 3 Green Vines from the beast-haunted forest, and she will make something that keeps adventurers alive.",
    ],
  },

  description: {
    short:
      "A tiny old woman wrapped in shawls, smelling of pepper, woodsmoke, and stubborn mercy.",
    look:
      "Mara is small enough that her layered shawls seem to have more mass than she does. Her hands tremble until they touch a kettle, a bandage, or a knife; then they become steady. Her eyes are pale and bright, like morning through old glass.",
    personality:
      "Kind, bossy, unsettlingly perceptive, and impossible to impress. She calls the hero honey even while asking for dangerous work.",
    voice:
      "Warm, dry, and practical. She speaks like every horror is an inconvenience that can be solved with herbs, soup, and a sufficiently sharp blade.",
    secret:
      "She once knew several soldiers whose bodies now patrol the Old Guardroom. She remembers their names, but only says them after the final quest.",
  },
  inspection:
    "Mara is tiny, wrapped in layered shawls, and impossible to hurry. Her hands tremble until they touch a kettle, a bandage, or a knife; then they become steady. She calls adventurers honey while asking them to do deeply dangerous things.",

  dialogue: {
    entryLines: [
      "Come in, honey. Mind the kettle. It bites less than most things, but only because I taught it manners.",
      "You look underfed for someone carrying that much trouble.",
      "Sit if you are bleeding. Stand if you are pretending not to be.",
      "I put the soup on before you knocked. That is not magic, honey, that is experience.",
      "Do not drip on the good rug. It has survived worse than you, but I like it better.",
      "If you brought something cursed, set it by the door and do not make eye contact with it.",
      "Warm your hands. Cold fingers make bad decisions.",
      "You have that dungeon smell again. Stone dust, panic, and ambition.",
      "No, I am not surprised you lived. I am only pleased.",
      "Tell me what followed you home before it finds the windows.",
    ],
    firstMeeting:
      "May I come in, honey? I heard you have been venturing into the forest. I might need a thing or two from there, if you care for an Old Lady like me.",
    greetingDefault:
      "Back again? Sit if you are bleeding. Stand if you are pretending not to be.",
    greetingNoQuestAvailable:
      "Nothing for you today, honey. Which is not the same as peace, but we take what crumbs we get.",
    greetingQuestAvailable:
      "I have a little errand. Dangerous, naturally. The safe errands were all taken by cowards.",
    greetingQuestActive:
      "You still have work for me, honey. Try not to make me worry more than necessary.",
    greetingQuestReady:
      "There you are. You have that look. The one that means trouble happened and somehow you won.",
    chainComplete:
      "The room is quieter now. Not clean. Not healed. But quieter. That matters.",
    refuse:
      "No? Sensible. Disappointing, but sensible.",
    noInventorySpace:
      "Your pockets are full, honey. Come back when you are carrying fewer supplies.",
  },

  questChain: oldLadyQuestChain,

  relationship: {
    startsAt: 0,
    max: 6,
    increasePerCompletedQuest: 1,
    labels: [
      { min: 0, label: "Stranger" },
      { min: 1, label: "Helpful Child" },
      { min: 3, label: "Trusted" },
      { min: 5, label: "Hearth-Kin" },
    ],
  },

  codex: {
    suggestedFilePath: "src/scripts/content/npcs/old-lady.js",
    suggestedScriptTag: '<script src="src/scripts/content/npcs/old-lady.js" defer></script>',
    requiredSystems: [
      "NPC registry rendering",
      "NPC interaction menu/dialogue panel",
      "Persistent quest flags",
      "Kill objective progress events",
      "Inventory item objective matching and consuming",
      "Reward granting",
      "Optional fullHealing consumable support",
      "Optional passive accessory effect support",
    ],
  },
};

window.DungeonContent.register("questChains", oldLadyQuestChain.id, oldLadyQuestChain);
window.DungeonContent.register("npcs", oldLadyNpc.id, oldLadyNpc);

window.DungeonNpcBehaviors ??= {};
window.DungeonNpcBehaviors.oldLady = (() => {
  const npcId = "oldLady";
  const questStateKey = "oldLadyQuests";
  const killStateKey = "oldLadyKills";
  let askedChatOptionsThisVisit = new Set();
  let activeChatAnswer = null;

  function npc() {
    const base = window.DungeonContent.get("npcs", npcId) ?? oldLadyNpc;
    if (!state?.questFlags?.[questStateKey]?.["old-lady-quest-hearth-for-the-road"] || questStatus({ id: "old-lady-quest-hearth-for-the-road" }) !== "completed") return base;
    return {
      ...base,
      portrait: "assets/npcs/old-lady-final.png",
      token: {
        ...(base.token ?? {}),
        image: "assets/npcs/old-lady-final.png",
        portrait: "assets/npcs/old-lady-final.png",
      },
    };
  }

  function quests() {
    return (npc().questChain?.quests ?? []).slice().sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
  }

  const adminQuestProgressStages = [
    { id: "locked", label: "Mara Locked", description: "Old Lady's Hut hidden. Use this to test pre-arrival saves.", completed: [], accepted: null },
    { id: "available", label: "Mara Available", description: "Old Lady's Hut visible, first quest not accepted.", completed: [], accepted: null, available: true },
    { id: "q1-accepted", label: "Q1 Accepted", description: "Green Vines for the Pot accepted, incomplete.", completed: [], accepted: "old-lady-quest-green-vines" },
    { id: "q1-complete", label: "Q1 Complete", description: "Quest 1 completed, The Ones at the Door not accepted.", completed: ["old-lady-quest-green-vines"], accepted: null },
    { id: "q2-accepted", label: "Q2 Accepted", description: "The Ones at the Door accepted, incomplete.", completed: ["old-lady-quest-green-vines"], accepted: "old-lady-quest-cryptguards" },
    { id: "q2-complete", label: "Q2 Complete", description: "Quest 2 completed, Buttons for the Dead not accepted.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards"], accepted: null },
    { id: "q3-accepted", label: "Q3 Accepted", description: "Buttons for the Dead accepted, incomplete.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards"], accepted: "old-lady-quest-barracks-relics" },
    { id: "q3-complete", label: "Q3 Complete", description: "Quest 3 completed, Bones and Bowstrings not accepted.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards", "old-lady-quest-barracks-relics"], accepted: null },
    { id: "q4-accepted", label: "Q4 Accepted", description: "Bones and Bowstrings accepted, incomplete.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards", "old-lady-quest-barracks-relics"], accepted: "old-lady-quest-bones-and-bows" },
    { id: "q4-complete", label: "Q4 Complete", description: "Quest 4 completed, Bitter Root not accepted.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards", "old-lady-quest-barracks-relics", "old-lady-quest-bones-and-bows"], accepted: null },
    { id: "q5-accepted", label: "Q5 Accepted", description: "Bitter Root for Bitter Dreams accepted, incomplete.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards", "old-lady-quest-barracks-relics", "old-lady-quest-bones-and-bows"], accepted: "old-lady-quest-bitter-root" },
    { id: "q5-complete", label: "Q5 Complete", description: "Quest 5 completed, The Last Watchman not accepted.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards", "old-lady-quest-barracks-relics", "old-lady-quest-bones-and-bows", "old-lady-quest-bitter-root"], accepted: null },
    { id: "q6-accepted", label: "Q6 Accepted", description: "The Last Watchman accepted, incomplete.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards", "old-lady-quest-barracks-relics", "old-lady-quest-bones-and-bows", "old-lady-quest-bitter-root"], accepted: "old-lady-quest-last-watch" },
    { id: "q6-complete", label: "Q6 Complete", description: "Guardroom Commander done, cooking pot quest not accepted.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards", "old-lady-quest-barracks-relics", "old-lady-quest-bones-and-bows", "old-lady-quest-bitter-root", "old-lady-quest-last-watch"], accepted: null },
    { id: "q7-accepted", label: "Q7 Accepted", description: "A Pot of Your Own accepted, ready to complete.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards", "old-lady-quest-barracks-relics", "old-lady-quest-bones-and-bows", "old-lady-quest-bitter-root", "old-lady-quest-last-watch"], accepted: "old-lady-quest-hearth-for-the-road" },
    { id: "all-complete", label: "All Complete", description: "Quest 7 completed. Final Mara portrait should be active.", completed: ["old-lady-quest-green-vines", "old-lady-quest-cryptguards", "old-lady-quest-barracks-relics", "old-lady-quest-bones-and-bows", "old-lady-quest-bitter-root", "old-lady-quest-last-watch", "old-lady-quest-hearth-for-the-road"], accepted: null },
  ];

  function questState() {
    state.questFlags = { ...(state.questFlags ?? {}) };
    state.questFlags[questStateKey] ??= {};
    state.questFlags[killStateKey] ??= {};
    return state.questFlags[questStateKey];
  }

  function questStatus(quest) {
    const legacyDone =
      quest?.id === "old-lady-quest-green-vines" && state.questFlags?.oldLadyGreenVinesDone
        ? "completed"
        : quest?.id === "old-lady-quest-green-vines" && state.questFlags?.oldLadyGreenVinesAccepted
          ? "accepted"
          : null;
    return questState()[quest?.id]?.status ?? legacyDone ?? "available";
  }

  function questUnlocked(quest) {
    if (!quest) return false;
    return quests()
      .filter((entry) => (entry.order ?? 0) < (quest.order ?? 0))
      .every((entry) => questStatus(entry) === "completed");
  }

  function activeQuest() {
    return quests().find((quest) => questUnlocked(quest) && questStatus(quest) !== "completed") ?? quests().at(-1) ?? null;
  }

  function itemMatchesObjective(item, objective) {
    return itemMatchesRequirement(item, objective);
  }

  function inventoryItemCount(objective) {
    return materialCountForRequirement(objective);
  }

  function resourceCountForObjective(objective) {
    if (objective.itemId || objective.itemTag || objective.lootTag || objective.type || objective.category || objective.material || objective.tagsAll || objective.tagsAny) return inventoryItemCount(objective);
    return 0;
  }

  function objectiveProgress(objective) {
    if (objective.kind === "talkToNpc") return questStatus(activeQuest()) === "accepted" ? 1 : 0;
    if (objective.kind === "collectItems") return resourceCountForObjective(objective);
    if (objective.kind === "killMonsters") {
      const kills = state.questFlags?.[killStateKey] ?? {};
      return Math.max(kills[objective.monsterId] ?? 0, kills[objective.monsterTag] ?? 0);
    }
    return 0;
  }

  function questReady(quest) {
    if (!quest || questStatus(quest) !== "accepted") return false;
    return (quest.objectives ?? []).every((objective) => objectiveProgress(objective) >= Math.max(1, objective.count ?? 1));
  }

  function questProgressMarkup(quest) {
    return (quest.objectives ?? [])
      .map((objective) => {
        const target = Math.max(1, objective.count ?? 1);
        const progress = Math.min(target, objectiveProgress(objective));
        return `<div class="quest-progress">${escapeHtml(objective.displayName ?? objective.id)}: ${progress}/${target}</div>`;
      })
      .join("");
  }

  function chatStateIdForQuestState(quest, status, allDone) {
    if (allDone || !quest || quest.id === "old-lady-quest-hearth-for-the-road") return "all-complete";
    if (quest.id === "old-lady-quest-green-vines" && status === "accepted") return "green-vines-accepted";
    if (quest.id === "old-lady-quest-cryptguards" && status === "available") return "green-vines-completed";
    if (quest.id === "old-lady-quest-cryptguards" && status === "accepted") return "crypt-guards-accepted";
    if (quest.id === "old-lady-quest-barracks-relics" && status === "available") return "crypt-guards-completed";
    if (quest.id === "old-lady-quest-barracks-relics" && status === "accepted") return "relics-accepted";
    if (quest.id === "old-lady-quest-bones-and-bows" && status === "available") return "relics-completed";
    if (quest.id === "old-lady-quest-bones-and-bows" && status === "accepted") return "bones-bows-accepted";
    if (quest.id === "old-lady-quest-bitter-root" && status === "available") return "bones-bows-completed";
    if (quest.id === "old-lady-quest-bitter-root" && status === "accepted") return "bitter-root-accepted";
    if (quest.id === "old-lady-quest-last-watch" && status === "available") return "bitter-root-completed";
    if (quest.id === "old-lady-quest-last-watch" && status === "accepted") return "last-watchman-accepted";
    return null;
  }

  function activeChatState(quest, status, allDone) {
    const stateId = chatStateIdForQuestState(quest, status, allDone);
    const chat = window.DungeonNpcChats?.oldLady?.states?.[stateId];
    return chat ? { id: stateId, ...chat } : null;
  }

  function chatMarkup(chat) {
    if (!chat) return "";
    return `
      <button type="button" data-action="start-npc-chat" data-npc="${npcId}" data-chat-state="${escapeAttribute(chat.id)}">Have a chat</button>
    `;
  }

  function setVillageChatLayout(enabled) {
    els.villageMenu?.classList.toggle("npc-chat-open", Boolean(enabled));
  }

  function consumeObjectiveResources(quest) {
    for (const objective of quest.objectives ?? []) {
      if (objective.kind !== "collectItems" || !objective.consumeOnTurnIn) continue;
      let remaining = Math.max(1, objective.count ?? 1);
      if (!consumeMaterialsForRequirement(objective, remaining)) return false;
    }
    return true;
  }

  function addHomeCookingPotReward() {
    state.home = normalizeHomeData(state.home);
    if ((state.home.objects ?? []).some((object) => object.type === "home-cooking-pot")) return false;
    const template = objectTemplate("home-cooking-pot");
    const door = state.home.doors?.find((entry) => entry.to === "outside") ?? { x: 19, y: 15 };
    const candidates = surroundingCells(door)
      .concat([{ x: door.x - 2, y: door.y }, { x: door.x - 1, y: door.y - 1 }, { x: door.x - 1, y: door.y + 1 }])
      .filter((cell) => state.home.cells.some((homeCell) => positionKey(homeCell) === positionKey(cell)));
    const position = candidates.find((cell) => !homeObjectOverlaps("home-cooking-pot", cell)) ?? state.home.cells.find((cell) => !homeObjectOverlaps("home-cooking-pot", cell));
    if (!position) return false;
    state.home.objects.push({
      id: `home-cooking-pot-reward-${Date.now()}`,
      type: "home-cooking-pot",
      position: { ...position },
      width: template?.width ?? 1,
      height: template?.height ?? 1,
      homePlaced: true,
      movable: true,
    });
    state.home.unlockedFurniture = uniqueValues([...(state.home.unlockedFurniture ?? []), "home-cooking-pot"]);
    if (state.mode === "home") state.dungeonObjects = state.home.objects;
    return true;
  }

  function grantRewards(quest) {
    const hero = activeHero();
    const rewardParts = [];
    const moneyCp = moneyToCp(quest.rewards?.money ?? {});
    if (moneyCp > 0) {
      addMoney(hero.inventory.money, moneyCp);
      rewardParts.push(moneyText(cpToMoney(moneyCp)));
    }
    for (const reward of quest.rewards?.items ?? []) {
      let granted = 0;
      for (let index = 0; index < Math.max(1, reward.quantity ?? 1); index += 1) {
        const item = createItemInstance(reward.itemId, "old-lady-reward");
        if (item) {
          addItemToInventory(hero, item, "old-lady-reward-stack");
          granted += 1;
        }
      }
      if (granted > 0) rewardParts.push(`${granted}x ${getItemTemplate(reward.itemId)?.name ?? reward.itemId}`);
    }
    let homeReward = false;
    for (const reward of quest.rewards?.homeFurniture ?? []) {
      if (reward.furnitureId === "home-cooking-pot") homeReward = addHomeCookingPotReward() || homeReward;
    }
    for (const flag of quest.rewards?.flagsSet ?? []) state.questFlags[flag] = true;
    if (homeReward) {
      addLog("Old Lady Mara leaves a Cooking Pot near the home door. You can move it in Build Your Home.", "important");
      rewardParts.push("Cooking Pot for the home");
    }
    addLog(`${hero.name} receives Old Lady Mara's reward for ${quest.title}: ${rewardParts.join(", ") || "thanks and a warm look"}.`, "important");
  }

  function renderHut() {
    setVillageChatLayout(false);
    const mara = npc();
    const quest = activeQuest();
    const status = questStatus(quest);
    const completed = status === "completed";
    const accepted = status === "accepted";
    const ready = questReady(quest);
    const allDone = quests().every((entry) => questStatus(entry) === "completed");
    const chat = activeChatState(quest, status, allDone);
    els.villageBody.innerHTML = `
      <section class="npc-card">
        ${npcPortraitMarkup(mara)}
        <div>
          <b>${escapeHtml(mara.name ?? "Old Lady Mara")}</b>
          <span>Old Lady's Hut</span>
          <p>${escapeHtml(allDone ? (mara.dialogue?.chainComplete ?? "The room is quieter now.") : (npcEntryLine(mara) || mara.dialogue?.greetingDefault || "Come in, honey. Sit if you are bleeding."))}</p>
        </div>
      </section>
      ${
        quest
          ? `<section class="npc-quest-card">
              <h3>${escapeHtml(quest.title ?? "Errand")}</h3>
              <p>${escapeHtml(completed ? quest.dialogue?.complete ?? "That will do." : accepted ? (ready ? quest.dialogue?.ready : quest.dialogue?.reminder) ?? "Still working?" : quest.dialogue?.offer ?? "I have an errand.")}</p>
              ${questProgressMarkup(quest)}
              ${
                completed
                  ? `<p class="empty-note">${allDone ? "Quest chain complete." : "Come back for the next errand."}</p>`
                  : accepted
                    ? `<button type="button" data-action="complete-npc-quest" data-npc="${npcId}" data-quest="${escapeAttribute(quest.id)}" ${ready ? "" : "disabled"}>${ready ? "Complete Quest" : "Objective Incomplete"}</button>`
                    : `<button type="button" data-action="accept-npc-quest" data-npc="${npcId}" data-quest="${escapeAttribute(quest.id)}">Accept Quest</button>`
              }
            </section>`
          : `<p class="empty-note">Mara has no errands today.</p>`
      }
      ${chatMarkup(chat)}
    `;
    els.villageMenu.classList.remove("hidden");
  }

  function renderChat(chatStateId) {
    const mara = npc();
    const chat = window.DungeonNpcChats?.oldLady?.states?.[chatStateId];
    if (!chat) {
      renderHut();
      return;
    }
    setVillageChatLayout(true);
    const answer = activeChatAnswer?.chatStateId === chatStateId ? activeChatAnswer.entry : null;
    const promptText = answer?.lines?.find((line) => line.speaker === "Player")?.text ?? "";
    const maraLines = answer?.lines?.filter((line) => line.speaker === "Mara").map((line) => line.text) ?? [];
    els.villageBody.innerHTML = `
      <section class="old-lady-chat-view">
        <div class="old-lady-chat-portrait">
          ${npcPortraitMarkup(mara, "old-lady-chat-image", { clickable: false })}
        </div>
        <div class="old-lady-chat-text">
          <span>${escapeHtml(mara.name ?? "Old Lady Mara")}</span>
          ${
            answer
              ? `
                <p class="old-lady-chat-player">You: ${escapeHtml(promptText)}</p>
                ${maraLines.map((text) => `<p>Mara: ${escapeHtml(text)}</p>`).join("")}
              `
              : `<p>Mara: ${escapeHtml(chat.greeting ?? "Mara watches you over the rim of her cup.")}</p>`
          }
        </div>
        <div class="old-lady-chat-options">
          ${(chat.options ?? [])
            .map((entry) => {
              const asked = askedChatOptionsThisVisit.has(`${chatStateId}:${entry.id}`);
              return `
                <button type="button" data-action="npc-chat-option" data-npc="${npcId}" data-chat-state="${escapeAttribute(chatStateId)}" data-option="${escapeAttribute(entry.id)}" ${asked ? "disabled" : ""}>
                  ${escapeHtml(entry.label)}
                </button>
              `;
            })
            .join("")}
        </div>
      </section>
      <hr />
      <button type="button" data-action="return-npc-visit" data-npc="${npcId}">Back to Mara</button>
    `;
    els.villageMenu.classList.remove("hidden");
  }

  function showChatOption(chatStateId, optionId) {
    const chat = window.DungeonNpcChats?.oldLady?.states?.[chatStateId];
    const entry = chat?.options?.find((candidate) => candidate.id === optionId);
    if (!entry) return;
    askedChatOptionsThisVisit.add(`${chatStateId}:${optionId}`);
    activeChatAnswer = { chatStateId, entry };
    renderChat(chatStateId);
  }

  function showArrivalDialog() {
    const mara = npc();
    return new Promise((resolve) => {
      restoreDialogInputField();
      els.gameDialogTitle.textContent = mara.arrival?.title ?? "A Knock at the Door";
      els.gameDialogMessage.innerHTML = `
        <section class="npc-inspection">
          ${npcPortraitMarkup(mara, "npc-inspection-portrait", { clickable: false })}
          ${(mara.arrival?.paragraphs ?? []).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
        </section>
      `;
      els.gameDialogField.classList.add("hidden");
      els.gameDialogActions.innerHTML = `
        <button type="button" data-dialog-action="welcome-npc">${escapeHtml(mara.arrival?.confirmText ?? "Welcome")}</button>
        <button type="button" class="ghost-button" data-dialog-action="welcome-npc">${escapeHtml(mara.arrival?.cancelText ?? "Later")}</button>
      `;
      const cleanup = () => {
        els.gameDialogActions.removeEventListener("click", handleClick);
        els.gameDialog.classList.add("hidden");
        activeDialogCancel = null;
        resolve(true);
      };
      const handleClick = (event) => {
        if (event.target.closest("[data-dialog-action='welcome-npc']")) cleanup();
      };
      els.gameDialogActions.addEventListener("click", handleClick);
      activeDialogCancel = cleanup;
      els.gameDialog.classList.remove("hidden");
      els.gameDialogActions.querySelector("[data-dialog-action='welcome-npc']")?.focus();
    });
  }

  function unlockIntro() {
    state.questFlags = { ...(state.questFlags ?? {}) };
    if (state.questFlags.oldLadyAvailable || state.questFlags.oldLadyIntroPending) return false;
    state.questFlags.oldLadyGreenVinesAccepted = true;
    state.questFlags.oldLadyIntroPending = true;
    return true;
  }

  function clearAdminQuestFlags() {
    state.questFlags = { ...(state.questFlags ?? {}) };
    const preserve = {};
    for (const [key, value] of Object.entries(state.questFlags)) {
      if (key.startsWith("oldLady") || key.startsWith("flag.oldLady") || key.startsWith("quest.oldLady")) continue;
      preserve[key] = value;
    }
    state.questFlags = preserve;
    state.questFlags[questStateKey] = {};
    state.questFlags[killStateKey] = {};
  }

  function setAdminQuestFlagsForStage(stage) {
    clearAdminQuestFlags();
    if (stage.id === "locked") return;
    state.questFlags.oldLadyAvailable = true;
    state.questFlags.oldLadyIntroPending = false;
    const stages = questState();
    for (const quest of quests()) {
      if (stage.completed?.includes(quest.id)) stages[quest.id] = { status: "completed", completedAt: Date.now(), adminSet: true };
      else if (stage.accepted === quest.id) stages[quest.id] = { status: "accepted", adminSet: true };
    }
    if (stage.accepted === "old-lady-quest-green-vines") state.questFlags.oldLadyGreenVinesAccepted = true;
    if (stage.completed?.includes("old-lady-quest-green-vines")) {
      state.questFlags.oldLadyGreenVinesDone = true;
      state.questFlags["flag.oldLady.knowsYou"] = true;
      state.questFlags["flag.oldLady.greenVinesDone"] = true;
    }
    if (stage.completed?.includes("old-lady-quest-cryptguards")) state.questFlags["flag.oldLady.cryptguardsDone"] = true;
    if (stage.completed?.includes("old-lady-quest-barracks-relics")) {
      state.questFlags["flag.oldLady.relicsDone"] = true;
      state.questFlags["flag.oldLady.gaveHearthAmulet"] = true;
    }
    if (stage.completed?.includes("old-lady-quest-bones-and-bows")) state.questFlags["flag.oldLady.bonesAndBowsDone"] = true;
    if (stage.completed?.includes("old-lady-quest-bitter-root")) state.questFlags["flag.oldLady.bitterRootDone"] = true;
    if (stage.completed?.includes("old-lady-quest-last-watch")) {
      state.questFlags["flag.oldLady.lastWatchmanDone"] = true;
      state.questFlags["flag.oldLady.questChainComplete"] = true;
    }
    if (stage.completed?.includes("old-lady-quest-hearth-for-the-road")) state.questFlags["flag.oldLady.cookingPotGifted"] = true;
  }

  function currentAdminStageId() {
    if (!state.questFlags?.oldLadyAvailable) return "locked";
    for (const stage of adminQuestProgressStages.slice().reverse()) {
      if (stage.id === "locked") continue;
      const completedMatches = (stage.completed ?? []).every((questId) => questStatus({ id: questId }) === "completed");
      const acceptedMatches = stage.accepted ? questStatus({ id: stage.accepted }) === "accepted" : true;
      const futureCompleted = quests().some((quest) => !(stage.completed ?? []).includes(quest.id) && questStatus(quest) === "completed");
      if (completedMatches && acceptedMatches && !futureCompleted) return stage.id;
    }
    return "available";
  }

  return {
    maybeUnlockFromProgress() {
      if ((state.campaignProgress?.["thornwood-pact"] ?? 0) < 1) return false;
      return unlockIntro();
    },
    onDungeonComplete(context = {}) {
      if (context.themeId !== "forestOfTheBeasts" && context.campaignId !== "thornwood-pact") return false;
      return unlockIntro();
    },
    maybeTriggerArrival() {
      if (state.mode !== "home" || !state.questFlags?.oldLadyIntroPending) return false;
      state.questFlags.oldLadyIntroPending = false;
      state.questFlags.oldLadyAvailable = true;
      state.questFlags.oldLadyGreenVinesAccepted = true;
      showArrivalDialog().then(() => {
        render();
        window.DepthboundPlaytest?.syncNow?.();
      });
      return true;
    },
    visit() {
      askedChatOptionsThisVisit = new Set();
      activeChatAnswer = null;
      renderHut();
    },
    returnToVisit() {
      activeChatAnswer = null;
      renderHut();
    },
    startChat(chatStateId) {
      activeChatAnswer = null;
      renderChat(chatStateId);
    },
    useChatOption(chatStateId, optionId) {
      showChatOption(chatStateId, optionId);
    },
    adminProgressEntries() {
      const activeId = currentAdminStageId();
      return adminQuestProgressStages.map((stage) => ({
        npcId,
        id: stage.id,
        groupId: "old-lady",
        groupLabel: "Old Lady Mara",
        label: stage.label,
        description: stage.description,
        active: stage.id === activeId,
      }));
    },
    questLogEntries() {
      return quests()
        .filter((quest) => questStatus(quest) === "accepted")
        .map((quest) => ({
          id: quest.id,
          giver: npc().name ?? "Old Lady Mara",
          title: quest.title ?? "Errand",
          description: quest.dialogue?.reminder ?? quest.dialogue?.offer ?? "",
          ready: questReady(quest),
          cancelable: true,
          cancelType: "npc",
          npcId,
          questId: quest.id,
          objectives: (quest.objectives ?? []).map((objective) => {
            const target = Math.max(1, objective.count ?? 1);
            return {
              label: objective.displayName ?? objective.id ?? "Objective",
              progress: Math.min(target, objectiveProgress(objective)),
              target,
            };
          }),
        }));
    },
    setAdminProgress(progressId) {
      const stage = adminQuestProgressStages.find((entry) => entry.id === progressId);
      if (!stage) return;
      setAdminQuestFlagsForStage(stage);
      askedChatOptionsThisVisit = new Set();
      activeChatAnswer = null;
      addLog(`Admin set Mara progress: ${stage.label}.`, "important");
      render();
      renderInventoryMenu();
    },
    acceptQuest(questId) {
      const quest = quests().find((entry) => entry.id === questId);
      if (!quest || !questUnlocked(quest) || questStatus(quest) === "completed") return;
      questState()[quest.id] = { status: "accepted" };
      if (quest.id === "old-lady-quest-green-vines") state.questFlags.oldLadyGreenVinesAccepted = true;
      state.questFlags.oldLadyAvailable = true;
      addLog(`Old Lady Mara gives the party a quest: ${quest.title}.`, "important");
      renderHut();
    },
    cancelQuest(questId) {
      const quest = quests().find((entry) => entry.id === questId);
      if (!quest || questStatus(quest) !== "accepted") return false;
      questState()[quest.id] = { status: "available", cancelledAt: Date.now() };
      if (quest.id === "old-lady-quest-green-vines") delete state.questFlags.oldLadyGreenVinesAccepted;
      state.questFlags.oldLadyAvailable = true;
      addLog(`The party cancels Old Lady Mara's quest: ${quest.title}.`, "important");
      return true;
    },
    completeQuest(questId) {
      const quest = quests().find((entry) => entry.id === questId);
      if (!quest || !questReady(quest)) return;
      if (!consumeObjectiveResources(quest)) return;
      questState()[quest.id] = { status: "completed", completedAt: Date.now() };
      if (quest.id === "old-lady-quest-green-vines") {
        state.questFlags.oldLadyGreenVinesDone = true;
        state.questFlags["flag.oldLady.knowsYou"] = true;
      }
      grantRewards(quest);
      addLog(`Old Lady Mara completes ${quest.title}.`, "important");
      renderHut();
      render();
    },
    recordMonsterKill(monster) {
      if (!monster || monster.oldLadyKillRecorded) return;
      monster.oldLadyKillRecorded = true;
      state.questFlags = { ...(state.questFlags ?? {}) };
      state.questFlags[killStateKey] ??= {};
      const ids = uniqueValues([monster.baseMonsterId, monster.templateId, monster.id, ...(monster.tags ?? [])].filter(Boolean));
      for (const id of ids) state.questFlags[killStateKey][id] = (state.questFlags[killStateKey][id] ?? 0) + 1;
      if (ids.includes("cryptGuard") || ids.includes("boneRecruit") || ids.includes("skeletonArcher")) {
        monster.extraLoot = [...(monster.extraLoot ?? []), { kind: "item", itemId: "old-guardroom-relic" }];
      }
      if (ids.includes("oldSergeant") && partyResourceCount("black-briar-root") <= 0) {
        monster.extraLoot = [...(monster.extraLoot ?? []), { kind: "item", itemId: "black-briar-root" }];
      }
    },
  };
})();
})();
