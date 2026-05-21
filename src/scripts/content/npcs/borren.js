(() => {
  window.DungeonNpcQuestText ??= {};

  const claimHammer = {
    id: "borren-claim-hammer",
    npcId: "armorsmith",
    itemId: "magic-embervein-claim-hammer",
    questKey: "borrenClaimHammer",
    storeSectionTitle: "Relic Claim",
    itemName: "Embervein Claim Hammer",
    rewardText: "100 gp, 3 Embervein Ore, smith chain started",
    storeText: {
      available: "Borren notices the Ashmantle mark beneath the soot and asks to see the hammer. His eyes widen when he recognizes it.",
      accepted: "It seems to be a bit of panic in his voice as the says: 'Terrible. Thats terrible news. That means the old forge has been disturbed. Please, go deeper an check on the old watchers. They are old relatives om mine. I hope they are ok.' Here is 100GP for you.",
      completed: "Did you find Bromdus?",
    },
    buttons: {
      accept: "Ask Borren",
      complete: "Give Hammer",
      incomplete: "Need Hammer",
      completed: "Returned",
    },
    logs: {
      accept: "Borren Ashmantle recognizes the Embervein Claim Hammer and asks the party to return it to his forge.",
      complete: "Borren accepts the First Claim Hammer. The Ashmantle smithing chain has begun.",
      cancel: "Borren's claim hammer request is no longer accepted.",
    },
    questLog: {
      giver: "Borren Ashmantle",
      title: "The First Claim Hammer",
      description:
        "Borren recognized the Ashmantle maker's mark on the Embervein Claim Hammer. Bring it back to his forge so he can begin tracing the claim.",
      objectiveLabel: "Embervein Claim Hammer",
    },
    campaign: {
      giver: "Borren Ashmantle",
      initialTitle: "Recover the First Claim",
      initialDescription:
        "Borren has heard an old Embervein claim bell ringing again. Enter the Deepworks, defeat the thief at the furnace heart, and recover whatever Ashmantle relic remains.",
      progressTitle: "The First Claim Burns",
      progressDescription:
        "The Embervein Deepworks has been reopened by a soot-marked crew. Push to the furnace heart and bring the First Claim Hammer home.",
      completedTitle: "The Hammer Returned",
      completedDescription:
        "The First Claim Hammer has been recovered from the Embervein Deepworks. Borren Ashmantle may know why it matters.",
      description: `Borren Ashmantle's family claim in the Embervein Deepworks has started ringing from below the hills.

Someone has broken into the old forge-mine, restarted the furnaces, and stolen the First Claim Hammer from its sealed rack.

This is a compact one-dungeon adventure for four level 2 heroes: a cold lift, coal silos, pressure valves, moving chain hoists, and a furnace-heart boss who would rather burn the mine than give the hammer back.`,
    },
  };

  window.DungeonNpcQuestText.borren = {
    id: "borren",
    npcId: "armorsmith",
    name: "Borren Ashmantle",
    questChains: {
      claimHammer,
    },
  };

  window.DungeonContent?.register?.("questChains", "borrenClaimHammerChain", {
    id: "borrenClaimHammerChain",
    npcId: "armorsmith",
    name: "Borren's Embervein Claim",
    summary: "Borren recognizes the First Claim Hammer and starts the Ashmantle smithing chain.",
    tags: ["borren", "ashmantle", "embervein", "quest-chain", "home"],
    repeatable: false,
    quests: [
      {
        id: claimHammer.id,
        title: claimHammer.questLog.title,
        statusFlag: claimHammer.questKey,
        objectives: [
          {
            id: "return-embervein-claim-hammer",
            kind: "collectItems",
            displayName: claimHammer.questLog.objectiveLabel,
            itemId: claimHammer.itemId,
            count: 1,
            consumeOnTurnIn: true,
          },
        ],
        rewards: {
          money: { gp: 100 },
          items: [{ itemId: "embervein-ore", quantity: 3 }],
          flagsSet: ["flag.borren.claimHammerReturned", "flag.borren.smithChainStarted"],
        },
        dialogue: {
          offer: claimHammer.storeText.available,
          accept: claimHammer.logs.accept,
          reminder: claimHammer.storeText.accepted,
          complete: claimHammer.logs.complete,
        },
      },
    ],
  });

  window.DungeonNpcBehaviors ??= {};
  window.DungeonNpcBehaviors.armorsmith = (() => {
    const adminStages = [
      {
        id: "embervein-first-claim-unstarted",
        label: "Embervein Unstarted",
        description: "The First Claim of Embervein has not been completed, and Borren's hammer request is reset.",
      },
      {
        id: "embervein-first-claim-hammer-recovered",
        label: "Hammer Recovered",
        description: "The First Claim dungeon is complete and the hammer is in the party, but Borren has not been asked or paid yet.",
      },
    ];

    function questState() {
      state.questFlags = { ...(state.questFlags ?? {}) };
      state.questFlags[claimHammer.questKey] ??= { status: "available" };
      return state.questFlags[claimHammer.questKey];
    }

    function hammerRequirement() {
      return { itemId: claimHammer.itemId };
    }

    function clearHammerItems() {
      while ((materialCountForRequirement?.(hammerRequirement()) ?? 0) > 0) {
        if (!consumeMaterialsForRequirement?.(hammerRequirement(), 1)) break;
      }
    }

    function giveHammerIfMissing() {
      if ((materialCountForRequirement?.(hammerRequirement()) ?? 0) > 0) return;
      const item = createItemInstance?.(claimHammer.itemId, "admin-borren");
      const hero = activeHero?.();
      if (item && hero) addItemToInventory?.(hero, item, "admin-borren-stack");
    }

    function resetClaimFlags() {
      state.questFlags = { ...(state.questFlags ?? {}) };
      state.questFlags[claimHammer.questKey] = { status: "available", adminSet: true };
      delete state.questFlags["flag.borren.claimHammerReturned"];
      delete state.questFlags["flag.borren.smithChainStarted"];
    }

    function setCampaignProgress(value) {
      state.campaignProgress = { ...(state.campaignProgress ?? {}) };
      state.campaignProgress["embervein-first-claim"] = value;
    }

    function setUnstarted() {
      resetClaimFlags();
      setCampaignProgress(0);
      clearHammerItems();
    }

    function setHammerRecovered() {
      resetClaimFlags();
      setCampaignProgress(1);
      giveHammerIfMissing();
    }

    function currentStageId() {
      const quest = state?.questFlags?.[claimHammer.questKey];
      const progress = state?.campaignProgress?.["embervein-first-claim"] ?? 0;
      const hammerCount = materialCountForRequirement?.(hammerRequirement()) ?? 0;
      if (progress >= 1 && hammerCount > 0 && (!quest || quest.status === "available")) return "embervein-first-claim-hammer-recovered";
      return "embervein-first-claim-unstarted";
    }

    return {
      adminProgressEntries() {
        const activeId = currentStageId();
        return adminStages.map((stage) => ({
          npcId: "armorsmith",
          id: stage.id,
          groupId: "borren",
          groupLabel: "Borren Ashmantle",
          label: stage.label,
          description: stage.description,
          active: stage.id === activeId,
        }));
      },
      setAdminProgress(progressId) {
        if (progressId === "embervein-first-claim-unstarted") setUnstarted();
        else if (progressId === "embervein-first-claim-hammer-recovered") setHammerRecovered();
        else return;
        const stage = adminStages.find((entry) => entry.id === progressId);
        addLog?.(`Admin set Borren progress: ${stage?.label ?? progressId}.`, "important");
        render?.();
        renderInventoryMenu?.();
      },
    };
  })();
})();
