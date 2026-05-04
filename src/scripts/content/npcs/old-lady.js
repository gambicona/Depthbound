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
  window.DungeonContent.register("items", id, {
    id,
    ...item,
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
          "Three Green Vines, honey. Green. If it twitches, stomp it first. Then bring it to me.",
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
    image: "assets/npcs/old-lady-token.png",
    portrait: "assets/npcs/old-lady-portrait.png",
    fallbackLabel: "M",
    fallbackTitle: "Old Lady Mara",
    ringColor: "#d7a84f",
    backgroundColor: "#2a211d",
  },

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

  dialogue: {
    firstMeeting:
      "Come in, honey. Shut the door behind you. If the dead want soup, they can learn manners first.",
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
      "Your pockets are full, honey. Come back when you are carrying fewer mistakes.",
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
})();