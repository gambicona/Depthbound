(() => {
  function slug(value = "line") {
    return (
      String(value)
        .trim()
        .toLowerCase()
        .replace(/['"]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || "line"
    );
  }

  function pad(value, width = 3) {
    return String(value).padStart(width, "0");
  }

  function textBlocks(text = "", splitMode = "block") {
    const cleanText = String(text).replace(/\r\n/g, "\n").trim();
    if (!cleanText) return [];
    if (splitMode === "narration") return narrationBlocks(cleanText);
    if (splitMode !== "paragraphs") return [cleanText];
    return String(text)
      .replace(/\r\n/g, "\n")
      .split(/\n{2,}|\n/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  function sentenceCount(text = "") {
    return Math.max(1, (String(text).match(/[.!?]["'”’)]?(?=\s|$)/g) ?? []).length);
  }

  function splitQuotedSegments(text = "") {
    const output = [];
    let narration = "";
    let quote = "";
    let inQuote = false;

    const flushNarration = () => {
      const value = narration.trim();
      if (value) output.push({ kind: "narration", text: value });
      narration = "";
    };
    const flushQuote = () => {
      const value = quote.trim();
      if (value) output.push({ kind: "quote", text: value });
      quote = "";
    };

    for (const char of String(text)) {
      const isStraightQuote = char === '"';
      const isOpenQuote = char === "“";
      const isCloseQuote = char === "”";
      if (isStraightQuote || isOpenQuote || isCloseQuote) {
        if (inQuote && (isStraightQuote || isCloseQuote)) {
          flushQuote();
          inQuote = false;
        } else if (!inQuote && (isStraightQuote || isOpenQuote)) {
          flushNarration();
          inQuote = true;
        } else {
          if (inQuote) quote += char;
          else narration += char;
        }
      } else {
        if (inQuote) quote += char;
        else narration += char;
      }
    }
    if (inQuote) flushQuote();
    else flushNarration();
    return output;
  }

  function narrationBlocks(text = "", targetSentences = 4, maxCharacters = 700) {
    const segments = String(text)
      .replace(/\r\n/g, "\n")
      .split(/\n+/)
      .map((entry) => entry.trim())
      .filter(Boolean)
      .flatMap(splitQuotedSegments);
    const blocks = [];
    let current = [];
    let sentences = 0;
    let characters = 0;

    function flushCurrent() {
      if (!current.length) return;
      blocks.push({ kind: "narration", text: current.join("\n") });
      current = [];
      sentences = 0;
      characters = 0;
    }

    segments.forEach((segment) => {
      if (segment.kind === "quote") {
        flushCurrent();
        blocks.push(segment);
        return;
      }
      current.push(segment.text);
      sentences += sentenceCount(segment.text);
      characters += segment.text.length;
      if (sentences >= targetSentences || characters >= maxCharacters) flushCurrent();
    });
    flushCurrent();
    return blocks;
  }

  function lineIsDirection(text = "") {
    return /^(She |Her |Maelis's expression|A dry pause\.|A pause\.|The old woman |The merchant |The smith |The keeper )/i.test(String(text).trim());
  }

  function pushTextLines(output, config) {
    const parts = textBlocks(config.text, config.splitMode);
    parts.forEach((part, index) => {
      const text = typeof part === "string" ? part : part.text;
      const isQuote = typeof part === "object" && part.kind === "quote";
      const previousPart = parts[index - 1];
      const nextPart = parts[index + 1];
      output.push({
        id: `${config.idPrefix}.${pad(index + 1)}`,
        sourceId: config.sourceId,
        speaker: isQuote ? (config.quoteSpeaker ?? "Quoted Voice") : config.speaker,
        section: isQuote ? `${config.section}: Quoted Speech` : config.section,
        sourceGroupId: config.idPrefix,
        sourceRef: config.sourceRef ?? null,
        voiceKind: isQuote ? "quote" : "narration",
        nodeId: config.nodeId ?? config.idPrefix,
        text,
        previous: (typeof previousPart === "string" ? previousPart : previousPart?.text) ?? config.previous ?? "",
        next: (typeof nextPart === "string" ? nextPart : nextPart?.text) ?? config.next ?? "",
        player: config.player ?? "",
        options: config.options ?? "",
        tone: isQuote ? (config.quoteTone ?? "Quoted dialogue. Record/process this separately from narration.") : config.tone ?? "",
      });
    });
  }

  function literalSourceRef(file, originalText) {
    return { kind: "literal-js-string", file, originalText };
  }

  function maelisVoiceLines() {
    const data = window.DungeonNpcChats?.maelis ?? {};
    const output = [];
    (data.idleLines ?? []).forEach((text, index) => {
      output.push({
        id: `maelis.idle.${pad(index + 1)}`,
        sourceId: "maelis",
        speaker: "Sister Maelis",
        section: "Idle Lines",
        sourceGroupId: `maelis.idle.${pad(index + 1)}`,
        sourceRef: literalSourceRef("src/scripts/content/npcs/sister-maelis-chat.js", text),
        voiceKind: "dialogue",
        nodeId: "idleLines",
        text,
        previous: "",
        next: data.idleLines[index + 1] ?? "",
        tone: "Short ambient graveyard line.",
      });
    });
    for (const variant of data.stateVariants ?? []) {
      (variant.lines ?? []).forEach((text, index, arr) => {
        output.push({
          id: `maelis.state.${slug(variant.id)}.${pad(index + 1)}`,
          sourceId: "maelis",
          speaker: "Sister Maelis",
          section: `State: ${variant.label ?? variant.id}`,
          sourceGroupId: `maelis.state.${slug(variant.id)}.${pad(index + 1)}`,
          sourceRef: literalSourceRef("src/scripts/content/npcs/sister-maelis-chat.js", text),
          voiceKind: "dialogue",
          nodeId: variant.id,
          text,
          previous: arr[index - 1] ?? variant.addOn ?? "",
          next: arr[index + 1] ?? "",
          player: variant.label ?? "",
          tone: lineIsDirection(text) ? "Stage direction. Usually do not record unless you want narrated directions." : "Campaign-progress response.",
        });
      });
    }
    for (const [nodeId, node] of Object.entries(data.nodes ?? {})) {
      (node.lines ?? []).forEach((text, index, arr) => {
        output.push({
          id: `maelis.node.${slug(nodeId)}.${pad(index + 1)}`,
          sourceId: "maelis",
          speaker: "Sister Maelis",
          section: node.player ? `Reply to: ${node.player}` : nodeId,
          sourceGroupId: `maelis.node.${slug(nodeId)}.${pad(index + 1)}`,
          sourceRef: literalSourceRef("src/scripts/content/npcs/sister-maelis-chat.js", text),
          voiceKind: "dialogue",
          nodeId,
          text,
          previous: arr[index - 1] ?? "",
          next: arr[index + 1] ?? "",
          player: node.player ?? "",
          options: (node.options ?? []).map((option) => option.label).filter(Boolean).join("; "),
          tone: lineIsDirection(text) ? "Stage direction. Usually skip or record as narration only." : "Dialogue line.",
        });
      });
    }
    return output;
  }

  async function loadCampaignDungeon(campaignId, index) {
    if (window.DungeonCampaigns?.originalDungeon) {
      const template = await window.DungeonCampaigns.originalDungeon(campaignId, index);
      if (template) return template;
    }
    const campaign = window.DungeonCampaigns?.get?.(campaignId);
    const response = await fetch(`${campaign?.folder ?? `campaigns/${campaignId}`}/Dungeon${index}.json`, { cache: "no-cache" });
    return response.ok ? response.json() : null;
  }

  async function barrowCrownVoiceLines() {
    const campaignId = "barrow-crown";
    const campaign = window.DungeonCampaigns?.get?.(campaignId);
    const output = [];
    if (campaign?.description) {
      pushTextLines(output, {
        sourceId: campaignId,
        idPrefix: "barrow-crown.campaign.description",
        speaker: "Narrator",
        section: "Campaign Intro",
        nodeId: "campaign-description",
        text: campaign.description,
        sourceRef: { kind: "campaign-description", campaignId },
        splitMode: "narration",
        tone: "Opening campaign narration for the Barrow Crown.",
      });
    }
    const count = Math.max(0, Number(campaign?.count) || 0);
    for (let index = 1; index <= count; index += 1) {
      const dungeon = await loadCampaignDungeon(campaignId, index);
      if (!dungeon) continue;
      const dungeonId = `dungeon-${pad(index, 2)}`;
      const dungeonName = dungeon.name ?? `Dungeon ${index}`;
      pushTextLines(output, {
        sourceId: campaignId,
        idPrefix: `barrow-crown.${dungeonId}.intro`,
        speaker: "Narrator",
        section: `${dungeonName}: Intro`,
        nodeId: `${dungeonId}-intro`,
        text: dungeon.intro?.text ?? "",
        sourceRef: { kind: "campaign-dungeon", campaignId, index, field: "intro.text" },
        splitMode: "narration",
        tone: "Read when the dungeon begins.",
      });
      (dungeon.storyTriggers ?? []).forEach((trigger, triggerIndex) => {
        pushTextLines(output, {
          sourceId: campaignId,
          idPrefix: `barrow-crown.${dungeonId}.trigger.${slug(trigger.id ?? trigger.title ?? triggerIndex + 1)}`,
          speaker: "Narrator",
          section: `${dungeonName}: ${trigger.title ?? `Story Trigger ${triggerIndex + 1}`}`,
          nodeId: `${dungeonId}-trigger-${trigger.id ?? triggerIndex + 1}`,
          text: trigger.text ?? "",
          sourceRef: { kind: "campaign-dungeon", campaignId, index, field: "storyTrigger.text", triggerId: trigger.id ?? "", triggerIndex },
          splitMode: "narration",
          tone: "Triggered story beat inside the dungeon.",
        });
      });
      const waveStories = dungeon.waveEncounter?.preWaveStories ?? {};
      Object.entries(waveStories).forEach(([wave, story]) => {
        pushTextLines(output, {
          sourceId: campaignId,
          idPrefix: `barrow-crown.${dungeonId}.wave-${slug(wave)}.${slug(story.title ?? "story")}`,
          speaker: "Narrator",
          section: `${dungeonName}: ${story.title ?? `Wave ${wave}`}`,
          nodeId: `${dungeonId}-wave-${wave}`,
          text: story.text ?? "",
          sourceRef: { kind: "campaign-dungeon", campaignId, index, field: "waveStory.text", wave },
          splitMode: "narration",
          tone: "Wave encounter story beat.",
        });
      });
      pushTextLines(output, {
        sourceId: campaignId,
        idPrefix: `barrow-crown.${dungeonId}.outro`,
        speaker: "Narrator",
        section: `${dungeonName}: Outro`,
        nodeId: `${dungeonId}-outro`,
        text: dungeon.outro?.text ?? "",
        sourceRef: { kind: "campaign-dungeon", campaignId, index, field: "outro.text" },
        splitMode: "narration",
        tone: "Read when the dungeon is completed.",
      });
    }

    const crownDecisionOutros = {
      destroy: `The Barrow Crown is colder than iron should be. As it leaves the altar, every dead monarch in the vault turns to watch.
None attack.
Not yet.
A path opens behind the altar, leading deeper into the earth.
The Ashen Herald waits there, head bowed.
"Then you choose rebellion," it says. "The King Beneath will hear your argument in person."
The passage yawns open like a throat.`,
      claim: `The Barrow Crown is colder than iron should be. As it leaves the altar, every dead monarch in the vault turns to watch.
None bow.
Not yet.
A path opens behind the altar, leading deeper into the earth.
The Ashen Herald waits there with its black blade lowered across the way.
"Then you choose dominion," it says. "No hand claims the crown without answering the dead who guarded it."
The passage opens behind it, bright with ash-gray fire. To take the crown onward, the party must defeat the Herald and prove the right to bear what should have stayed buried.`,
    };
    Object.entries(crownDecisionOutros).forEach(([choice, text]) => {
      pushTextLines(output, {
        sourceId: campaignId,
        idPrefix: `barrow-crown.choice.${choice}`,
        speaker: "Narrator",
        section: `Crown Choice: ${choice === "destroy" ? "Destroy" : "Claim"}`,
        nodeId: `crown-choice-${choice}`,
        text,
        sourceRef: { kind: "barrow-crown-choice", choice },
        splitMode: "narration",
        tone: "Read after the party chooses the Crown's fate in dungeon 6.",
      });
    });
    return output;
  }

  function villageNpcVoiceLines() {
    const output = [];
    const npcs = window.DungeonContent?.all?.("npcs") ?? [];
    npcs
      .filter((npc) => npc?.id && npc.id !== "sister-maelis")
      .forEach((npc) => {
        const entryLines = npc.dialogue?.entryLines ?? [];
        entryLines.forEach((text, index) => {
          output.push({
            id: `village-npc.${slug(npc.id)}.entry.${pad(index + 1)}`,
            sourceId: "village-npcs",
            speaker: npc.name ?? npc.title ?? npc.id,
            section: `${npc.name ?? npc.title ?? npc.id}: Entry Lines`,
            sourceGroupId: `village-npc.${slug(npc.id)}.entry.${pad(index + 1)}`,
            sourceRef: literalSourceRef("src/scripts/content/npcs/village-npcs.js", text),
            voiceKind: "dialogue",
            nodeId: `${npc.id}-entry`,
            text,
            previous: entryLines[index - 1] ?? "",
            next: entryLines[index + 1] ?? "",
            tone: `${npc.title ?? "Village NPC"} ambient/shop greeting.`,
          });
        });
      });
    return output;
  }

  function oldLadyVoiceLines() {
    const data = window.DungeonNpcChats?.oldLady ?? {};
    const output = [];
    for (const [stateId, state] of Object.entries(data.states ?? {})) {
      pushTextLines(output, {
        sourceId: "old-lady",
        idPrefix: `old-lady.state.${slug(stateId)}.greeting`,
        speaker: "Old Lady Mara",
        section: `Mara: ${state.label ?? stateId}`,
        sourceRef: literalSourceRef("src/scripts/content/npcs/old-lady-chat.js", state.greeting ?? ""),
        voiceKind: "dialogue",
        nodeId: `${stateId}-greeting`,
        text: state.greeting ?? "",
        tone: "Opening line for this Mara conversation state.",
      });
      (state.options ?? []).forEach((option, optionIndex) => {
        const maraLines = (option.lines ?? []).filter((line) => line?.speaker !== "Player").map((line) => line.text).filter(Boolean);
        maraLines.forEach((text, lineIndex) => {
          output.push({
            id: `old-lady.state.${slug(stateId)}.option.${slug(option.id ?? optionIndex + 1)}.${pad(lineIndex + 1)}`,
            sourceId: "old-lady",
            speaker: "Old Lady Mara",
            section: `Mara reply: ${option.label ?? option.id ?? optionIndex + 1}`,
            sourceGroupId: `old-lady.state.${slug(stateId)}.option.${slug(option.id ?? optionIndex + 1)}.${pad(lineIndex + 1)}`,
            sourceRef: literalSourceRef("src/scripts/content/npcs/old-lady-chat.js", text),
            voiceKind: "dialogue",
            nodeId: `${stateId}-${option.id ?? optionIndex + 1}`,
            text,
            previous: maraLines[lineIndex - 1] ?? state.greeting ?? "",
            next: maraLines[lineIndex + 1] ?? "",
            player: option.label ?? "",
            tone: lineIsDirection(text) ? "Stage direction. Usually skip or record as narration only." : "Old Lady Mara dialogue line.",
          });
        });
      });
    }
    return output;
  }

  window.DepthboundVoiceCatalog = {
    lineIsDirection,
    sources: [
      {
        id: "maelis",
        label: "Sister Maelis",
        speaker: "Sister Maelis",
        buildLines: maelisVoiceLines,
      },
      {
        id: "barrow-crown",
        label: "Barrow Crown Story",
        speaker: "Narrator",
        buildLines: barrowCrownVoiceLines,
      },
      {
        id: "village-npcs",
        label: "Village NPC Lines",
        speaker: "Village NPCs",
        buildLines: villageNpcVoiceLines,
      },
      {
        id: "old-lady",
        label: "Old Lady Mara",
        speaker: "Old Lady Mara",
        buildLines: oldLadyVoiceLines,
      },
    ],
  };
})();
