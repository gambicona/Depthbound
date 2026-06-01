(function () {
  const clone = (value) => {
    try {
      return JSON.parse(JSON.stringify(value));
    } catch {
      return value;
    }
  };

  function hashString(value = "") {
    let hash = 2166136261;
    for (let index = 0; index < String(value).length; index += 1) {
      hash ^= String(value).charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function rngFromSeed(seed = "") {
    let state = hashString(seed) || 1;
    return () => {
      state = Math.imul(state ^ (state >>> 15), 1 | state);
      state ^= state + Math.imul(state ^ (state >>> 7), 61 | state);
      return ((state ^ (state >>> 14)) >>> 0) / 4294967296;
    };
  }

  function weightedPick(entries = [], random = Math.random) {
    const weighted = entries.filter((entry) => Number(entry.weight ?? 1) > 0);
    const total = weighted.reduce((sum, entry) => sum + Number(entry.weight ?? 1), 0);
    if (total <= 0) return null;
    let roll = random() * total;
    for (const entry of weighted) {
      roll -= Number(entry.weight ?? 1);
      if (roll <= 0) return entry;
    }
    return weighted.at(-1) ?? null;
  }

  const EVENT_CATEGORY_WEIGHTS = {
    empty: { none: 45, text: 35, fight: 12, dungeon: 8 },
    emptyRoad: { none: 60, text: 30, fight: 6, dungeon: 4 },
    structure: { quiet: 15, text: 45, dungeon: 25, fight: 15 },
    structureRevisit: { quiet: 30, text: 42, dungeon: 18, fight: 10 },
  };

  function eventCategory(event = {}) {
    const tags = new Set(event.tags ?? []);
    if (tags.has("dungeon")) return "dungeon";
    if (tags.has("fight")) return "fight";
    const outcomes = (event.choices ?? []).flatMap((choice) => [choice.outcome, choice.success, choice.failure].filter(Boolean));
    if (outcomes.some((outcome) => outcome.dungeon)) return "dungeon";
    if (outcomes.some((outcome) => outcome.fight)) return "fight";
    return "text";
  }

  function weightedCategory(weights = {}, random = Math.random) {
    const entries = Object.entries(weights).map(([id, weight]) => ({ id, weight }));
    return weightedPick(entries, random)?.id ?? Object.keys(weights)[0] ?? "text";
  }

  function recentlyFiltered(pool = [], recentEventIds = []) {
    const recent = new Set(recentEventIds ?? []);
    const filtered = pool.filter((event) => !recent.has(event.id));
    return filtered.length ? filtered : pool;
  }

  function pickByCategory(pool = [], category, random = Math.random) {
    if (!pool.length) return null;
    const categoryPool = pool.filter((event) => eventCategory(event) === category);
    return weightedPick(categoryPool.length ? categoryPool : pool, random);
  }

  const travelEmptyHexEvents = [
    {
      id: "forage-bramble-cache",
      title: "Bramble Cache",
      tags: ["text", "forage"],
      biomes: ["forest", "jungle", "grassland", "savanna", "hills", "highlands", "swamp"],
      weight: 10,
      text: "Fresh tracks bend toward a patch of heavy brambles. Something has been feeding here, and the bushes still hold berries, tubers, and nests.",
      choices: [
        {
          id: "forage",
          label: "Forage",
          description: "Survival DC 12. Rangers automatically pass.",
          check: { ability: "wis", skill: "survival", dc: 12, autoSuccessClasses: ["ranger"] },
          success: { text: "The party gathers enough food to stretch the camp stores.", rewards: { rations: 2 } },
          failure: { text: "The brambles cut hands and waste time. Nothing useful is found." },
        },
        { id: "ignore", label: "Ignore", description: "Leave the patch alone.", outcome: { text: "The party keeps moving and makes camp without delay." } },
      ],
    },
    {
      id: "animal-tracks",
      title: "Fresh Tracks",
      tags: ["choice", "fight"],
      biomes: ["forest", "jungle", "grassland", "savanna", "hills", "highlands", "swamp"],
      weight: 8,
      text: "Wide prints cross the route and vanish into nearby cover. The ground is churned as if a hungry pack passed only moments ago.",
      choices: [
        {
          id: "track",
          label: "Track Them",
          description: "Survival DC 13. Success avoids the worst of it; failure draws the pack in.",
          check: { ability: "wis", skill: "survival", dc: 13, autoSuccessClasses: ["ranger"] },
          success: { text: "The tracker reads the trail early and guides the party around the pack." },
          failure: { text: "The tracks loop behind the party. Shapes burst from cover.", fight: { monsterTags: ["beast"], count: "party", size: "skirmish" } },
        },
        { id: "avoid", label: "Avoid", description: "Give the area a wide berth.", outcome: { text: "The detour is slow but quiet." } },
      ],
    },
    {
      id: "sunken-stair",
      title: "Sunken Stair",
      tags: ["dungeon"],
      biomes: ["swamp", "coast", "forest", "jungle", "grassland", "highlands"],
      weight: 5,
      text: "A cracked stair sinks beneath roots and wet stone. Cold air breathes from below, carrying the smell of old chambers.",
      choices: [
        { id: "descend", label: "Descend", description: "Follow the stair into the dark below.", outcome: { text: "The party lights the way and descends.", dungeon: { size: "small" } } },
        { id: "mark", label: "Mark It", description: "Leave it for another journey.", outcome: { text: "The place is marked on the map and left undisturbed for now." } },
      ],
    },
    {
      id: "wind-carved-door",
      title: "Wind-Carved Door",
      tags: ["dungeon"],
      biomes: ["mountain", "hills", "highlands", "desert", "badlands", "tundra"],
      weight: 5,
      text: "A door-shaped crack hums in the stone. Dust pulls inward with every gust, as if the mountain is breathing.",
      choices: [
        { id: "enter", label: "Enter", description: "Squeeze through the stone and follow the passage.", outcome: { text: "The party squeezes through the singing stone.", dungeon: { size: "medium" } } },
        { id: "leave", label: "Leave", description: "Camp outside and move on.", outcome: { text: "The door keeps humming after sunset, but nothing follows." } },
      ],
    },
    {
      id: "stranger-fire",
      title: "Stranger's Fire",
      tags: ["text", "choice"],
      biomes: ["forest", "grassland", "savanna", "hills", "highlands", "desert", "swamp", "tundra"],
      weight: 7,
      text: "A thin cookfire burns in a hollow, but no traveler answers the party's call. A small pack lies beside the stones.",
      choices: [
        {
          id: "inspect",
          label: "Inspect",
          description: "Investigation DC 12. Success finds supplies; failure draws trouble.",
          check: { ability: "int", skill: "investigation", dc: 12 },
          success: { text: "The pack holds dry bread, salt, and a careful note: take what you need.", rewards: { rations: 1 } },
          failure: { text: "A hidden cord snaps. Something waiting nearby takes the sound as a signal.", fight: { monsterTags: ["humanoid"], count: "small", size: "skirmish" } },
        },
        { id: "respect", label: "Leave It", description: "Do not touch another traveler's camp.", outcome: { text: "The party leaves the lonely fire to burn itself out." } },
      ],
    },
    {
      id: "old-bone-ring",
      title: "Old Bone Ring",
      tags: ["fight"],
      biomes: ["desert", "badlands", "tundra", "swamp", "highlands"],
      weight: 6,
      text: "Bleached bones form a circle around a patch of bare ground. The air inside the ring is colder than the coming night.",
      choices: [
        { id: "break", label: "Break The Ring", description: "Shatter the old circle and face whatever answers.", outcome: { text: "The bones collapse inward, and the dead answer.", fight: { monsterTags: ["undead"], count: "party", size: "skirmish" } } },
        { id: "avoid", label: "Avoid", description: "Camp away from the ring.", outcome: { text: "The party gives the bones a respectful distance." } },
      ],
    },
    {
      id: "glittering-gully",
      title: "Glittering Gully",
      tags: ["text", "choice"],
      biomes: ["mountain", "hills", "highlands", "desert", "badlands"],
      weight: 6,
      text: "A narrow gully glitters where the last light catches exposed stone. The footing is poor, but the vein might be useful.",
      choices: [
        {
          id: "climb",
          label: "Climb Down",
          description: "Athletics DC 13. Success finds coin; failure finds teeth.",
          check: { ability: "str", skill: "athletics", dc: 13 },
          success: { text: "The climb pays off with loose coin wedged between the stones.", rewards: { money: { sp: 6, cp: 20 } } },
          failure: { text: "Loose rock clatters into a den below. Something comes up angry.", fight: { monsterTags: ["beast"], count: "small", size: "skirmish" } },
        },
        { id: "skip", label: "Skip It", description: "Keep boots on level ground.", outcome: { text: "The gully is left glittering behind the party." } },
      ],
    },
    {
      id: "drowned-idol",
      title: "Drowned Idol",
      tags: ["dungeon", "choice"],
      biomes: ["coast", "swamp", "ocean"],
      weight: 5,
      text: "A stone idol lies half-submerged in dark water. A seam behind it opens when the tide pulls away.",
      choices: [
        { id: "open", label: "Open The Seam", description: "Let the water fall away and take the steps down.", outcome: { text: "The idol grinds aside and the water drops into black steps.", dungeon: { size: "small", themeId: "underwater" } } },
        { id: "camp", label: "Camp Inland", description: "Leave the idol alone.", outcome: { text: "The party makes camp well away from the tide line." } },
      ],
    },
    {
      id: "forest-hart-glade",
      title: "White Hart Glade",
      tags: ["text", "choice", "forage"],
      biomes: ["forest"],
      weight: 8,
      text: "A white hart watches from a ring of old trees. Mushrooms grow in a perfect crescent around its tracks, untouched by insects or rot.",
      choices: [
        {
          id: "follow",
          label: "Follow Quietly",
          description: "Animal Handling DC 13. Success finds food; failure startles the glade.",
          check: { ability: "wis", skill: "animal-handling", dc: 13 },
          success: { text: "The hart leads the party to clean water and edible roots, then vanishes between the trees.", rewards: { rations: 3 } },
          failure: { text: "A snapped twig breaks the hush. The glade answers with claws.", fight: { monsterTags: ["beast"], count: "small", size: "skirmish", themeId: "forestOfTheBeasts" } },
        },
        { id: "bow", label: "Bow And Leave", description: "Respect the strange animal.", outcome: { text: "The hart lowers its head once before the party leaves the glade." } },
      ],
    },
    {
      id: "forest-hollow-root",
      title: "Hollow Root Door",
      tags: ["dungeon"],
      biomes: ["forest"],
      weight: 5,
      text: "A tree wider than a cottage has split at the roots. Warm air rises from below, and faint claw marks score the inner bark.",
      choices: [
        { id: "crawl", label: "Crawl Below", description: "Crawl into the root-dark beneath the old tree.", outcome: { text: "The party crawls into the root-dark and finds worked stone beneath the old tree.", dungeon: { size: "small", themeId: "forestOfTheBeasts" } } },
        { id: "seal", label: "Seal With Stones", description: "Block it for now.", outcome: { text: "The party wedges stones across the opening before making camp." } },
      ],
    },
    {
      id: "jungle-singing-canopy",
      title: "Singing Canopy",
      tags: ["text", "choice"],
      biomes: ["jungle"],
      weight: 8,
      text: "Vines sway without wind, knocking hollow seedpods together in a rhythm that almost sounds like speech.",
      choices: [
        {
          id: "listen",
          label: "Listen",
          description: "Nature DC 14. Success reads the warning; failure walks into it.",
          check: { ability: "int", skill: "nature", dc: 14 },
          success: { text: "The rhythm marks a predator path. The party shifts camp before anything finds them." },
          failure: { text: "The song becomes a hunting call, and the undergrowth erupts.", fight: { monsterTags: ["beast"], count: "party", size: "skirmish", themeId: "jungle" } },
        },
        { id: "cut", label: "Cut Through", description: "Force a path.", outcome: { text: "The party hacks a loud but quick path through the vines." } },
      ],
    },
    {
      id: "jungle-gold-fever",
      title: "Gold-Flecked Pool",
      tags: ["text", "choice"],
      biomes: ["jungle"],
      weight: 6,
      text: "A still pool shines with gold dust beneath black water. Tiny bones lie in the mud around it.",
      choices: [
        {
          id: "pan",
          label: "Pan The Silt",
          description: "Sleight of Hand DC 13. Success gains coin; failure wakes the pool.",
          check: { ability: "dex", skill: "sleight-of-hand", dc: 13 },
          success: { text: "A careful hand gathers real gold from the silt.", rewards: { money: { gp: 1, sp: 8 } } },
          failure: { text: "The silt clouds red. Something below the surface bites.", fight: { monsterTags: ["beast"], count: "small", size: "skirmish", themeId: "jungle" } },
        },
        { id: "leave", label: "Leave The Pool", description: "Bones are usually a note.", outcome: { text: "The pool remains perfectly still as the party backs away." } },
      ],
    },
    {
      id: "swamp-witchlights",
      title: "Witchlights",
      tags: ["choice", "dungeon"],
      biomes: ["swamp"],
      weight: 8,
      text: "Blue lights drift between cypress trunks, stopping whenever the party stops. Their reflections show a stone causeway that is not visible above the water.",
      choices: [
        {
          id: "study",
          label: "Study The Lights",
          description: "Arcana DC 14. Success follows safely; failure draws undead.",
          check: { ability: "int", skill: "arcana", dc: 14 },
          success: { text: "The lights reveal the safe stones and lead to a drowned threshold.", dungeon: { size: "small", themeId: "swamp" } },
          failure: { text: "The reflections twist into faces, and the mud begins to move.", fight: { monsterTags: ["undead"], count: "party", size: "skirmish", themeId: "swamp" } },
        },
        { id: "ignore", label: "Ignore Them", description: "Camp on drier ground.", outcome: { text: "The witchlights wait until dawn, then sink under the water." } },
      ],
    },
    {
      id: "swamp-black-leeches",
      title: "Black Leech Crossing",
      tags: ["text", "choice", "forage"],
      biomes: ["swamp"],
      weight: 7,
      text: "The only dry route crosses a shallow channel full of black leeches. Reeds on the far side carry ripe seedheads.",
      choices: [
        {
          id: "wade",
          label: "Wade Across",
          description: "Medicine DC 12. Success harvests food; failure draws blood and attention.",
          check: { ability: "wis", skill: "medicine", dc: 12 },
          success: { text: "The party treats the bites quickly and harvests enough reed grain for supper.", rewards: { rations: 2 } },
          failure: { text: "The water darkens with blood. Something larger follows the scent.", fight: { monsterTags: ["beast"], count: "small", size: "skirmish", themeId: "swamp" } },
        },
        { id: "detour", label: "Detour", description: "Lose time, keep blood.", outcome: { text: "The party camps tired but unbitten." } },
      ],
    },
    {
      id: "desert-glass-saints",
      title: "Glass Saints",
      tags: ["text", "choice"],
      biomes: ["desert", "badlands"],
      weight: 8,
      text: "Lightning has fused the sand into kneeling figures. Their glass hands point toward a buried stone mouth.",
      choices: [
        {
          id: "dig",
          label: "Dig Where They Point",
          description: "Investigation DC 14. Success opens a ruin; failure disturbs guardians.",
          check: { ability: "int", skill: "investigation", dc: 14 },
          success: { text: "A slab gives way beneath the sand, revealing stairs into hot darkness.", dungeon: { size: "small", themeId: "desertRuins" } },
          failure: { text: "The glass figures crack at once. Something beneath them wakes.", fight: { monsterTags: ["undead"], count: "party", size: "skirmish", themeId: "desertRuins" } },
        },
        { id: "pray", label: "Leave An Offering", description: "Spend no resources, disturb nothing.", outcome: { text: "The glass saints glitter silently until the sun goes down." } },
      ],
    },
    {
      id: "desert-mirage-market",
      title: "Mirage Market",
      tags: ["text", "choice"],
      biomes: ["desert", "badlands"],
      weight: 6,
      text: "A market shimmers between dunes: awnings, bells, stacked fruit. The voices are cheerful, but none of the shadows point the right way.",
      choices: [
        {
          id: "bargain",
          label: "Bargain",
          description: "Persuasion DC 13. Success gains food; failure buys trouble.",
          check: { ability: "cha", skill: "persuasion", dc: 13 },
          success: { text: "The bargain leaves real dates and water skins in the party's packs by sunset.", rewards: { rations: 2 } },
          failure: { text: "The coins turn to beetles, the stalls fold inward, and blades appear behind the cloth.", fight: { monsterTags: ["humanoid"], count: "small", size: "skirmish", themeId: "desertRuins" } },
        },
        { id: "walk", label: "Walk Through", description: "Trust the compass, not the market.", outcome: { text: "The market vanishes behind the party like heat from stone." } },
      ],
    },
    {
      id: "mountain-echo-shrine",
      title: "Echo Shrine",
      tags: ["dungeon", "choice"],
      biomes: ["mountain", "hills", "highlands"],
      weight: 8,
      text: "A shrine is carved into a cliff face, but every word spoken nearby returns in a different voice. The last echo says, 'Below.'",
      choices: [
        {
          id: "answer",
          label: "Answer The Echo",
          description: "Religion DC 13. Success opens a path; failure calls stone-kin.",
          check: { ability: "int", skill: "religion", dc: 13 },
          success: { text: "The shrine grinds open and reveals a steep passage into the mountain.", dungeon: { size: "medium", themeId: "mountain" } },
          failure: { text: "The echo laughs, and stones roll together into hostile shapes.", fight: { monsterTags: ["construct"], count: "small", size: "skirmish", themeId: "mountain" } },
        },
        { id: "camp", label: "Camp Below", description: "Let the mountain keep talking.", outcome: { text: "The echoes continue until sleep takes the camp." } },
      ],
    },
    {
      id: "mountain-goat-path",
      title: "Goat Path",
      tags: ["text", "choice"],
      biomes: ["mountain", "hills", "highlands"],
      weight: 7,
      text: "A narrow path climbs to a ledge where wild goats have scraped lichen from the stone. The ledge might overlook a safer route.",
      choices: [
        {
          id: "climb",
          label: "Climb Up",
          description: "Athletics DC 12. Success finds a safe campsite and food.",
          check: { ability: "str", skill: "athletics", dc: 12 },
          success: { text: "The ledge offers shelter and enough lichen, roots, and goat-milk luck for a simple meal.", rewards: { rations: 1 } },
          failure: { text: "Loose scree turns the climb into a noisy scramble. Predators hear it.", fight: { monsterTags: ["beast"], count: "small", size: "skirmish", themeId: "mountain" } },
        },
        { id: "pass", label: "Pass By", description: "Avoid the climb.", outcome: { text: "The path remains a white scratch above the party's camp." } },
      ],
    },
    {
      id: "arctic-blue-crevasse",
      title: "Blue Crevasse",
      tags: ["dungeon", "choice"],
      biomes: ["arctic", "tundra", "snow"],
      weight: 8,
      text: "A crack in the ice glows blue from far below. Something down there beats like a slow heart under the frozen world.",
      choices: [
        {
          id: "descend",
          label: "Descend",
          description: "Survival DC 14. Success reaches an ice dungeon; failure starts a fight on the rim.",
          check: { ability: "wis", skill: "survival", dc: 14, autoSuccessClasses: ["ranger"] },
          success: { text: "The party anchors ropes and descends into chambers of blue ice.", dungeon: { size: "small", themeId: "arctic" } },
          failure: { text: "The rope line rings like a bell. Shapes rise from the crevasse wall.", fight: { monsterTags: ["beast"], count: "party", size: "skirmish", themeId: "arctic" } },
        },
        { id: "snowmark", label: "Mark With Poles", description: "Leave it visible for later.", outcome: { text: "The party marks the crevasse and makes camp where the ice is thicker." } },
      ],
    },
    {
      id: "arctic-frozen-caravan",
      title: "Frozen Caravan",
      tags: ["text", "choice", "forage"],
      biomes: ["arctic", "tundra", "snow"],
      weight: 7,
      text: "A caravan stands frozen in drifted snow, every wagon door sealed by ice. The mules are long gone. The cargo might not be.",
      choices: [
        {
          id: "thaw",
          label: "Thaw The Locks",
          description: "Survival DC 13. Success salvages supplies; failure wakes the dead cold.",
          check: { ability: "wis", skill: "survival", dc: 13, autoSuccessClasses: ["ranger"] },
          success: { text: "The party salvages hard tack, tallow, and a sealed tin of tea.", rewards: { rations: 3 } },
          failure: { text: "The ice breaks like glass. The things inside were not dead enough.", fight: { monsterTags: ["undead"], count: "small", size: "skirmish", themeId: "arctic" } },
        },
        { id: "leave", label: "Leave The Dead", description: "Do not disturb the caravan.", outcome: { text: "Snow covers the caravan again before dawn." } },
      ],
    },
    {
      id: "coast-bell-buoy",
      title: "Bell Buoy On Dry Land",
      tags: ["dungeon", "choice"],
      biomes: ["coast", "ocean"],
      weight: 8,
      text: "A barnacled bell buoy hangs from a dead tree far from the tide. It rings once whenever nobody is looking at it.",
      choices: [
        {
          id: "ring",
          label: "Ring It Back",
          description: "Follow the bell's answer beneath the roots.",
          outcome: { text: "The bell answers from underground, and a hatch opens beneath the roots.", dungeon: { size: "small", themeId: "underwater" } },
        },
        {
          id: "cut",
          label: "Cut It Down",
          description: "Athletics DC 13. Success gains coin; failure calls drowned hands.",
          check: { ability: "str", skill: "athletics", dc: 13 },
          success: { text: "The buoy falls open. Old coins spill from its hollow frame.", rewards: { money: { gp: 1, sp: 4 } } },
          failure: { text: "The rope snaps upward instead of down. Drowned hands rise from the soil.", fight: { monsterTags: ["undead"], count: "small", size: "skirmish", themeId: "underwater" } },
        },
        { id: "mute", label: "Stuff The Bell", description: "Quiet it and camp away.", outcome: { text: "The bell stays quiet until the party sleeps." } },
      ],
    },
    {
      id: "grassland-thunder-herd",
      title: "Thunder Herd",
      tags: ["text", "choice"],
      biomes: ["grassland", "savanna"],
      weight: 8,
      text: "The ground trembles before the party sees the herd. Hundreds of heavy animals are running from something behind the horizon.",
      choices: [
        {
          id: "read",
          label: "Read The Herd",
          description: "Animal Handling DC 13. Success finds safety and forage.",
          check: { ability: "wis", skill: "animal-handling", dc: 13 },
          success: { text: "The party moves with the herd's edge and later finds flattened grain enough for camp.", rewards: { rations: 2 } },
          failure: { text: "The herd splits around the party, leaving the real hunters with a clear path.", fight: { monsterTags: ["beast"], count: "party", size: "skirmish", themeId: "grasslands" } },
        },
        { id: "hide", label: "Hide Low", description: "Drop into the grass and wait.", outcome: { text: "The herd passes like rolling thunder, and the party rises covered in dust." } },
      ],
    },
    {
      id: "grassland-standing-stones",
      title: "Standing Stones",
      tags: ["dungeon", "choice"],
      biomes: ["grassland", "savanna", "hills"],
      weight: 6,
      text: "Seven stones stand in the open grass. Between sunset and moonrise, their shadows form a stairway leading down.",
      choices: [
        { id: "step", label: "Take The Stair", description: "Trust the shadow-stair before it fades.", outcome: { text: "The shadow-stair holds underfoot, and the party descends beneath the stones.", dungeon: { size: "small", themeId: "grasslands" } } },
        { id: "wait", label: "Wait It Out", description: "Let the shadows pass.", outcome: { text: "When moonlight settles, the stair disappears." } },
      ],
    },
    {
      id: "volcanic-ember-rain",
      title: "Ember Rain",
      tags: ["choice", "fight"],
      biomes: ["volcano", "volcanic", "lava", "ashland"],
      weight: 8,
      text: "Ash darkens the sky, and tiny embers begin to fall like red snow. The ground cracks with dull orange light.",
      choices: [
        {
          id: "shelter",
          label: "Find Shelter",
          description: "Survival DC 14. Success shelters safely; failure finds a hot den.",
          check: { ability: "wis", skill: "survival", dc: 14, autoSuccessClasses: ["ranger"] },
          success: { text: "The party finds a basalt overhang and waits out the ember rain." },
          failure: { text: "The shelter is already occupied, and its owner is burning awake.", fight: { monsterTags: ["fire"], count: "small", size: "skirmish", themeId: "crucibleOfFlame" } },
        },
        { id: "push", label: "Push Through", description: "Enter the furnace-lit passage.", outcome: { text: "The cracks widen into a furnace-lit passage.", dungeon: { size: "small", themeId: "crucibleOfFlame" } } },
      ],
    },
    {
      id: "cave-breathing-wall",
      title: "Breathing Wall",
      tags: ["dungeon", "choice"],
      biomes: ["cave", "underdark", "mountain"],
      weight: 5,
      text: "A rock wall flexes with a slow breath. Dust puffs from the seams every few seconds, warm and mineral-sweet.",
      choices: [
        {
          id: "open",
          label: "Open The Seam",
          description: "Arcana DC 14. Success opens the seam; failure wakes what is inside.",
          check: { ability: "int", skill: "arcana", dc: 14 },
          success: { text: "The breathing slows, the seam parts, and a worked tunnel waits beyond.", dungeon: { size: "medium", themeId: "emberveinDeepworks" } },
          failure: { text: "The wall exhales spores and something answers from inside.", fight: { monsterTags: ["aberration"], count: "party", size: "skirmish", themeId: "underdarkDepths" } },
        },
        { id: "chalk", label: "Mark It", description: "Leave a warning mark.", outcome: { text: "The chalk mark pulses faintly with the wall's breath." } },
      ],
    },
  ];

  const travelStructureEvents = [
    {
      id: "village-local-news",
      title: "Village Rumors",
      kinds: ["village"],
      weight: 10,
      text: "Smoke rises from small chimneys, and the locals are eager to trade road stories for a little help.",
      choices: [
        {
          id: "help",
          label: "Help With Chores",
          description: "Persuasion DC 11. Success earns a meal and directions.",
          check: { ability: "cha", skill: "persuasion", dc: 11 },
          success: { text: "The village shares a hot meal and a wrapped bundle for the road.", rewards: { rations: 2 } },
          failure: { text: "The work is honest, but nobody has much to spare today." },
        },
        { id: "rest", label: "Keep Moving", description: "Do not spend daylight here.", outcome: { text: "The party takes water at the well and moves on to camp." } },
      ],
    },
    {
      id: "city-gate-work",
      title: "Gate Work",
      kinds: ["city", "harbor"],
      weight: 9,
      text: "The gatewardens are short-handed. A wagon queue snarls the road, and a clerk waves the party over with tired eyes.",
      choices: [
        {
          id: "mediate",
          label: "Mediate The Queue",
          description: "Insight DC 13. Success earns coin; failure draws a brawl.",
          check: { ability: "wis", skill: "insight", dc: 13 },
          success: { text: "The queue untangles, and the clerk pays from a lockbox marked road expense.", rewards: { money: { gp: 1, sp: 5 } } },
          failure: { text: "A smuggler decides the party saw too much.", fight: { monsterTags: ["humanoid"], count: "small", size: "skirmish", themeId: "urban" } },
        },
        { id: "pass", label: "Pass Through", description: "Avoid civic work.", outcome: { text: "The party slips through the city traffic and camps beyond the walls." } },
      ],
    },
    {
      id: "embervein-first-claim-site",
      title: "The First Claim",
      specialSites: ["embervein-first-claim"],
      weight: 30,
      text: "The mine mouth bears a fresh Ashmantle mark. Heatless red light moves far below, like an old claim remembering its owner.",
      choices: [
        { id: "claim", label: "Enter The First Claim", description: "Follow Borren's claim-mark into the Embervein mine.", outcome: { text: "The party follows the Ashmantle mark into the old Embervein claim.", campaign: { id: "embervein-first-claim" } } },
        { id: "wait", label: "Return Later", description: "Leave the claim-mark untouched for now.", outcome: { text: "The mark glows once, then settles back into the stone." } },
      ],
    },
    {
      id: "mine-black-air",
      title: "Black Air Shaft",
      kinds: ["mine"],
      weight: 10,
      text: "Cold air breathes from the mine mouth. The old warning bell beside the track is split down the middle.",
      choices: [
        { id: "enter", label: "Enter The Mine", description: "Light lanterns and follow the rails into the black air.", outcome: { text: "The party lights lanterns and follows the rails into the black air.", dungeon: { size: "medium", themeId: "emberveinDeepworks" } } },
        {
          id: "test",
          label: "Test The Air",
          description: "Nature DC 13. Success finds ore scraps; failure wakes things below.",
          check: { ability: "int", skill: "nature", dc: 13 },
          success: { text: "The mine is unsafe, but the party salvages a pouch of loose ore and coin from a side shed.", rewards: { money: { gp: 1, sp: 2 } } },
          failure: { text: "A lantern flame gutters blue. Something climbs up the shaft.", fight: { monsterTags: ["underground"], count: "party", size: "skirmish", themeId: "emberveinDeepworks" } },
        },
        { id: "mark", label: "Mark Unsafe", description: "Leave it for a better-prepared delve.", outcome: { text: "The party marks the broken bell and camps outside the fall line." } },
      ],
    },
    {
      id: "crystal-mine-hum",
      title: "Crystal Harmonics",
      tiles: ["entrance_crystalmine"],
      weight: 12,
      text: "The mine mouth hums in several notes at once. Every metal buckle on the party's gear vibrates toward the dark.",
      choices: [
        {
          id: "tune",
          label: "Tune The Crystals",
          description: "Arcana DC 14. Success calms the resonance; failure wakes the crystal growths.",
          check: { ability: "int", skill: "arcana", dc: 14 },
          success: { text: "The notes settle into a clear chord. Loose crystals can be gathered safely.", rewards: { money: { gp: 2 } } },
          failure: { text: "The chord shatters into pain, and the mine answers with living stone.", fight: { monsterTags: ["crystal"], count: "party", size: "skirmish", themeId: "emberveinDeepworks" } },
        },
        { id: "delve", label: "Delve Deeper", description: "Follow the humming vein into the mine.", outcome: { text: "The party follows the humming vein into the mine.", dungeon: { size: "medium", themeId: "emberveinDeepworks" } } },
      ],
    },
    {
      id: "ruin-open-threshold",
      title: "Open Threshold",
      kinds: ["ruin"],
      weight: 10,
      text: "The ruin still has one clean doorway. No dust lies across its threshold, though the stones around it are centuries old.",
      choices: [
        {
          id: "read",
          label: "Read The Marks",
          description: "History DC 13. Success identifies the safest entry; failure triggers guardians.",
          check: { ability: "int", skill: "history", dc: 13 },
          success: { text: "The marks describe a lower hall and the safest stair down.", dungeon: { size: "small" } },
          failure: { text: "The marks flare under touch. Old guardians take shape.", fight: { monsterTags: ["undead"], count: "party", size: "skirmish" } },
        },
        { id: "enter", label: "Enter Anyway", description: "Step past the threshold into stale air.", outcome: { text: "The party steps past the threshold into stale air.", dungeon: { size: "small" } } },
        { id: "camp", label: "Camp Outside", description: "Leave the ruin sealed tonight.", outcome: { text: "The doorway remains empty all night, which is somehow worse." } },
      ],
    },
    {
      id: "buried-city-avenue",
      title: "Buried Avenue",
      tiles: ["ruins_buriedcity", "ruins_desert", "entrance_deserttemple", "temple_desert"],
      weight: 12,
      text: "Sand pours away from a paved avenue lined with broken statues. Far below, a buried city catches the last light.",
      choices: [
        { id: "descend", label: "Descend", description: "Follow the avenue under the dunes.", outcome: { text: "The party follows the avenue under the dunes.", dungeon: { size: "medium", themeId: "desertRuins" } } },
        {
          id: "search",
          label: "Search The Statues",
          description: "Investigation DC 14. Success finds coin; failure disturbs tomb guards.",
          check: { ability: "int", skill: "investigation", dc: 14 },
          success: { text: "One statue hides a funerary cache of old stamped coins.", rewards: { money: { gp: 2, sp: 6 } } },
          failure: { text: "A statue opens its stone mouth and calls the dead by name.", fight: { monsterTags: ["undead"], count: "party", size: "skirmish", themeId: "desertRuins" } },
        },
      ],
    },
    {
      id: "shrine-air-crucible",
      title: "Air Shrine",
      tiles: ["shrine_air"],
      weight: 12,
      text: "Prayer flags snap in wind that never touches the ground. A stair of cloud forms above the altar.",
      choices: [
        { id: "ascend", label: "Ascend", description: "Climb the cloud stair into thunder-lit halls.", outcome: { text: "The party climbs the cloud stair into thunder-lit halls.", dungeon: { size: "small", themeId: "crucibleOfStorms" } } },
        {
          id: "listen",
          label: "Listen To The Wind",
          description: "Religion DC 13. Success receives guidance; failure calls air spirits.",
          check: { ability: "int", skill: "religion", dc: 13 },
          success: { text: "The wind names a safe campsite and blows fresh water from a hidden spring.", rewards: { rations: 1 } },
          failure: { text: "The wind takes offense and condenses into cutting shapes.", fight: { monsterTags: ["elemental", "air"], count: "small", size: "skirmish", themeId: "crucibleOfStorms" } },
        },
      ],
    },
    {
      id: "shrine-earth-crucible",
      title: "Earth Shrine",
      tiles: ["shrine_earth", "shrine_standingstones"],
      weight: 12,
      text: "The shrine stones are warm, and a deep drumbeat pulses beneath the soil.",
      choices: [
        { id: "enter", label: "Touch The Stone", description: "Open the stair into the earth.", outcome: { text: "The stones sink in sequence, revealing a stair into the earth.", dungeon: { size: "small", themeId: "crucibleOfStone" } } },
        {
          id: "offer",
          label: "Make An Offering",
          description: "Nature DC 13. Success earns a safe camp; failure rouses stone guardians.",
          check: { ability: "int", skill: "nature", dc: 13 },
          success: { text: "The drumbeat slows, and the ground shelters the camp from wind and rain." },
          failure: { text: "The soil buckles. Stones drag themselves upright.", fight: { monsterTags: ["elemental", "earth"], count: "small", size: "skirmish", themeId: "crucibleOfStone" } },
        },
      ],
    },
    {
      id: "shrine-fire-crucible",
      title: "Fire Shrine",
      tiles: ["shrine_fire"],
      weight: 12,
      text: "A smokeless flame burns in a cracked bowl. Its light shows doors in the air where there are none.",
      choices: [
        { id: "step", label: "Step Through", description: "Step through the heat shimmer.", outcome: { text: "The party steps through the heat shimmer into a furnace-bright passage.", dungeon: { size: "small", themeId: "crucibleOfFlame" } } },
        {
          id: "bank",
          label: "Bank The Flame",
          description: "Arcana DC 13. Success cooks a perfect meal; failure spills fire.",
          check: { ability: "int", skill: "arcana", dc: 13 },
          success: { text: "The flame softens and leaves warm coals for camp cooking.", rewards: { rations: 1 } },
          failure: { text: "The bowl cracks, and fire crawls out with hands.", fight: { monsterTags: ["elemental", "fire"], count: "small", size: "skirmish", themeId: "crucibleOfFlame" } },
        },
      ],
    },
    {
      id: "shrine-water-crucible",
      title: "Water Shrine",
      tiles: ["shrine_water"],
      weight: 12,
      text: "A shallow font reflects the party from below, as if they are standing on the ceiling of a flooded hall.",
      choices: [
        { id: "dive", label: "Step Into The Font", description: "Let the font carry the party into the drowned corridor.", outcome: { text: "The water closes over the party, then opens into a drowned corridor.", dungeon: { size: "small", themeId: "crucibleOfTides" } } },
        {
          id: "purify",
          label: "Purify Waterskins",
          description: "Medicine DC 12. Success preserves supplies; failure draws water spirits.",
          check: { ability: "wis", skill: "medicine", dc: 12 },
          success: { text: "The shrine water clears the party's stores and makes the evening meal stretch further.", rewards: { rations: 1 } },
          failure: { text: "The reflections climb out first.", fight: { monsterTags: ["elemental", "water"], count: "small", size: "skirmish", themeId: "crucibleOfTides" } },
        },
      ],
    },
    {
      id: "necro-shrine",
      title: "Necromantic Shrine",
      tiles: ["shrine_necro", "temple_shattered"],
      weight: 12,
      text: "Black candles burn without wicks. Names scratched into the altar rearrange themselves while nobody blinks.",
      choices: [
        { id: "break", label: "Break The Altar", description: "Split the altar and face the named dead.", outcome: { text: "The altar splits and the named dead rise angry.", fight: { monsterTags: ["undead"], count: "party", size: "skirmish", themeId: "oldGuardroom" } } },
        { id: "descend", label: "Follow The Names", description: "Follow the names to the stair beneath the shrine.", outcome: { text: "The names form an arrow toward a stair beneath the shrine.", dungeon: { size: "medium", themeId: "oldGuardroom" } } },
        { id: "leave", label: "Leave Quickly", description: "Do not read the names.", outcome: { text: "The party leaves before the altar finishes spelling anyone familiar." } },
      ],
    },
    {
      id: "dragon-burrow",
      title: "Dragon Burrow",
      tiles: ["burrow_dragon"],
      weight: 14,
      text: "The burrow mouth is glassed black around the edges. Heat rolls from the tunnel in slow breaths.",
      choices: [
        { id: "challenge", label: "Enter The Burrow", description: "Step into the heat and call the dragon out.", outcome: { text: "A scaled shape unfolds from the dark, and the tunnel fills with ember-light.", fight: { monsterIds: ["lairYoungCragDragon"], monsterTags: ["dragon"], count: 1, size: "skirmish", themeId: "mountain" } } },
        { id: "circle", label: "Circle Wide", description: "Leave the burrow sleeping.", outcome: { text: "The party gives the scorched hollow a long, careful distance." } },
      ],
    },
    {
      id: "wyvern-burrow",
      title: "Wyvern Peak",
      tiles: ["burrow_wyvernpeak"],
      weight: 13,
      text: "Bones hang from ledges above the nest mouth. The wind carries a sharp, venom-sour stink.",
      choices: [
        { id: "climb", label: "Climb To The Nest", description: "Reach the ledge before the wyvern dives.", outcome: { text: "Wings scrape stone overhead as the nest-owner drops from the cliff.", fight: { monsterIds: ["lairCliffWyvern"], monsterTags: ["wyvern"], count: 1, size: "skirmish", themeId: "mountain" } } },
        { id: "avoid", label: "Avoid The Ledge", description: "Keep low and move on.", outcome: { text: "The party stays below the cliff line until the shadow passes." } },
      ],
    },
    {
      id: "manticore-burrow",
      title: "Manticore Cliffs",
      tiles: ["burrow_manticorecliffs"],
      weight: 13,
      text: "Spines stud the ground like caltrops. Something paces above the cliff mouth, laughing under its breath.",
      choices: [
        { id: "bait", label: "Draw It Down", description: "Use the open ground to force the manticore out.", outcome: { text: "The manticore leaps down with a roar, tail already snapping forward.", fight: { monsterIds: ["lairCliffManticore"], monsterTags: ["manticore"], count: 1, size: "skirmish", themeId: "mountain" } } },
        { id: "leave", label: "Leave The Cliffs", description: "Do not cross the spine field.", outcome: { text: "The party backs away while the cliff-laughter follows them." } },
      ],
    },
    {
      id: "giant-burrow",
      title: "Giant Nest",
      tiles: ["burrow_giantnest"],
      weight: 13,
      text: "A crude nest of logs, hides, and cracked shields blocks the hollow. Huge footprints churn the earth around it.",
      choices: [
        { id: "wake", label: "Wake The Giant", description: "Call the nestkeeper into the open.", outcome: { text: "The nest shifts, and a boulder rises in one enormous hand.", fight: { monsterIds: ["lairHillGiantNestkeeper"], monsterTags: ["giant"], count: 1, size: "skirmish", themeId: "mountain" } } },
        { id: "creep", label: "Creep Past", description: "Leave the giant sleeping.", outcome: { text: "The party slips past between slow, ground-shaking snores." } },
      ],
    },
    {
      id: "chimera-burrow",
      title: "Chimera Nest",
      tiles: ["burrow_chimeranest"],
      weight: 12,
      text: "Three kinds of tracks circle the same den. The air smells of hot fur, old blood, and scorched feathers.",
      choices: [
        { id: "enter", label: "Enter The Den", description: "Face whatever shares the nest.", outcome: { text: "A many-throated roar answers from inside the den.", fight: { monsterIds: ["lairTwoMawChimera"], monsterTags: ["chimera"], count: 1, size: "skirmish", themeId: "desertRuins" } } },
        { id: "mark", label: "Mark The Danger", description: "Warn future travelers and leave.", outcome: { text: "The party marks the trail with crossed bones and leaves the den undisturbed." } },
      ],
    },
    {
      id: "troll-burrow",
      title: "Troll Bridge Burrow",
      tiles: ["burrow_trollbridge"],
      weight: 12,
      text: "A half-sunk bridge crosses black water into a burrow choked with fungus and gnawed planks.",
      choices: [
        { id: "cross", label: "Cross The Bridge", description: "Draw the bridge-lurker into the open.", outcome: { text: "The water erupts beside the bridge as a long-armed shape hauls itself up.", fight: { monsterIds: ["lairFungalTroll"], monsterTags: ["troll"], count: 1, size: "skirmish", themeId: "swamp" } } },
        { id: "ford", label: "Find Another Crossing", description: "Give the bridge to its owner.", outcome: { text: "The party loses time finding safer ground, but nothing follows." } },
      ],
    },
    {
      id: "beast-den-burrow",
      title: "Beast Den",
      tiles: ["burrow_beastden", "burrow_forest"],
      weight: 12,
      text: "Fresh claw marks stripe the trees around the den. Smaller animals have gone quiet for a long way around it.",
      choices: [
        { id: "hunt", label: "Hunt The Den-Beast", description: "Enter the den and face the alpha.", outcome: { text: "A heavy shape charges from the den with roots and old bones in its jaws.", fight: { monsterIds: ["lairRootfangBeast"], monsterTags: ["beast"], count: 1, size: "skirmish", themeId: "forestOfTheBeasts" } } },
        { id: "leave", label: "Leave The Den", description: "Do not challenge the alpha.", outcome: { text: "The party leaves the den to its ruler and keeps moving." } },
      ],
    },
    {
      id: "spider-burrow",
      title: "Spider Burrow",
      tiles: ["burrow_spiders"],
      weight: 12,
      text: "Webbing seals the burrow in pearly sheets. Something inside taps the strands and waits for the answer.",
      choices: [
        { id: "cut", label: "Cut The Webs", description: "Open the burrow and face the webmother.", outcome: { text: "The webbed door tears open, and too many legs spill from the dark.", fight: { monsterIds: ["lairWebmotherSpider"], monsterTags: ["spider"], count: 1, size: "skirmish", themeId: "forestOfTheBeasts" } } },
        { id: "burnmark", label: "Mark The Webs", description: "Warn the road and move on.", outcome: { text: "The party scorches a warning mark into a nearby trunk and leaves the webbing intact." } },
      ],
    },
    {
      id: "hydra-burrow",
      title: "Hydra Burrow",
      tiles: ["burrow_hydraswamp"],
      weight: 14,
      text: "Several tunnels open into the same reeking hollow. Every tunnel exhales at a different rhythm.",
      choices: [
        { id: "hunt", label: "Hunt The Hydra", description: "Enter the hollow and draw the hydra out.", outcome: { text: "The party enters the hollow, and too many heads turn at once.", fight: { monsterIds: ["venomBogHydra"], monsterTags: ["hydra"], count: 1, size: "skirmish", themeId: "swamp" } } },
        { id: "avoid", label: "Avoid The Hollow", description: "Camp upwind.", outcome: { text: "The party makes camp upwind and keeps watch on every ripple in the mud." } },
      ],
    },
    {
      id: "monster-burrow",
      title: "Occupied Burrow",
      kinds: ["burrow"],
      weight: 10,
      text: "The entrance is fresh, clawed open from inside. Bones and shed scales lie in the churned soil.",
      choices: [
        { id: "flush", label: "Flush It Out", description: "Make noise at the burrow mouth and be ready.", outcome: { text: "The party makes noise at the mouth of the burrow. Something answers.", fight: { monsterTags: ["beast"], count: "party", size: "skirmish" } } },
        { id: "crawl", label: "Crawl Inside", description: "Crawl into the tunnel system below.", outcome: { text: "The burrow opens into a larger tunnel system than it should.", dungeon: { size: "small" } } },
        { id: "leave", label: "Leave Tracks Alone", description: "Camp at a distance.", outcome: { text: "The party gives the burrow a wide, respectful circle." } },
      ],
    },
    {
      id: "vineyard-sour-vintage",
      title: "Sour Vintage",
      kinds: ["vineyard", "farm"],
      weight: 9,
      text: "Rows of crops stand too still. A broken cart carries bottles sealed with black wax and a warning scratched into the wood.",
      choices: [
        {
          id: "sample",
          label: "Inspect The Stores",
          description: "Nature DC 12. Success salvages food; failure wakes plant-things.",
          check: { ability: "int", skill: "nature", dc: 12 },
          success: { text: "Enough unspoiled stores remain to fill the cookpot.", rewards: { rations: 2 } },
          failure: { text: "The vines pull tight around the rows and begin to move.", fight: { monsterTags: ["plant"], count: "party", size: "skirmish", themeId: "forestOfTheBeasts" } },
        },
        { id: "burn", label: "Burn A Warning Mark", description: "Leave the place marked.", outcome: { text: "Smoke marks the roadward post, warning the next travelers." } },
      ],
    },
    {
      id: "wizard-tower",
      title: "Wizard Tower",
      tiles: ["wizardtower"],
      weight: 14,
      text: "A narrow tower leans against the sky. Blue fire crawls behind the windows, and the front door has too many locks for an abandoned place.",
      choices: [
        {
          id: "read",
          label: "Read The Wards",
          description: "Arcana DC 14. Success opens a safer way in; failure wakes the tower.",
          check: { ability: "int", skill: "arcana", dc: 14 },
          success: { text: "The outer wards fold aside one by one, revealing a stair into the tower's working rooms.", dungeon: { size: "medium", themeId: "wizardTower" } },
          failure: { text: "The ward-script snaps bright. A spellkeeper answers from inside.", fight: { monsterTags: ["humanoid", "caster"], count: "party", size: "skirmish", themeId: "wizardTower" } },
        },
        { id: "force", label: "Force The Door", description: "Break into the tower and take whatever answers.", outcome: { text: "The locks break in a shower of sparks, and the tower opens into arcane danger.", dungeon: { size: "medium", themeId: "wizardTower" } } },
        { id: "leave", label: "Leave The Tower", description: "Mark the place for another day.", outcome: { text: "The tower lights burn behind the party until the road bends away." } },
      ],
    },
    {
      id: "watchtower-signal",
      title: "Dead Signal Tower",
      tiles: ["watchtower", "tower_broken"],
      weight: 9,
      text: "The tower lantern is cold, but its signal mirror turns to follow the party. Someone has recently watched from the top.",
      choices: [
        {
          id: "climb",
          label: "Climb The Tower",
          description: "Perception DC 13. Success spots an ambush; failure meets it.",
          check: { ability: "wis", skill: "perception", dc: 13 },
          success: { text: "From the top, the party spots hidden bedrolls, a stash of coins, and the safer way down.", rewards: { money: { gp: 1, sp: 3 } } },
          failure: { text: "The trapdoor slams below. Crossbows scrape in the dark.", fight: { monsterTags: ["humanoid", "soldier"], count: "party", size: "skirmish", themeId: "castleKeep" } },
        },
        { id: "search", label: "Search Below", description: "Open the hatch under the tower stairs.", outcome: { text: "A cellar hatch opens under the tower stairs.", dungeon: { size: "small", themeId: "castleKeep" } } },
      ],
    },
    {
      id: "battlefield-restless-ground",
      title: "Restless Ground",
      kinds: ["battlefield"],
      weight: 10,
      text: "Rusty weapons prick through the soil. When the wind passes, the grass bends into marching lines.",
      choices: [
        {
          id: "honor",
          label: "Honor The Fallen",
          description: "Religion DC 13. Success quiets the field; failure raises it.",
          check: { ability: "int", skill: "religion", dc: 13 },
          success: { text: "The marching grass stills. A half-buried strongbox offers a final soldier's pay.", rewards: { money: { gp: 1, sp: 8 } } },
          failure: { text: "The field remembers the wrong side of death.", fight: { monsterTags: ["undead"], count: "party", size: "skirmish", themeId: "oldGuardroom" } },
        },
        { id: "cross", label: "Cross Fast", description: "Do not linger.", outcome: { text: "The party crosses before sunset and camps where the grass grows straight." } },
      ],
    },
    {
      id: "lake-below-mirror",
      title: "Below The Mirror",
      kinds: ["lake"],
      weight: 10,
      text: "The lake is clear enough to see a stone doorway below the surface. The reflection above it shows stars that are not yet out.",
      choices: [
        { id: "dive", label: "Dive Down", description: "Dive through the reflection below the lake.", outcome: { text: "The party dives through the reflection and finds air under the lake.", dungeon: { size: "small", themeId: "underwater" } } },
        {
          id: "fish",
          label: "Fish The Reeds",
          description: "Survival DC 12. Success gains rations; failure draws a lake predator.",
          check: { ability: "wis", skill: "survival", dc: 12, autoSuccessClasses: ["ranger"] },
          success: { text: "The reeds hide fat fish and clean mussels.", rewards: { rations: 2 } },
          failure: { text: "The line goes tight around something much larger than a fish.", fight: { monsterTags: ["beast"], count: "small", size: "skirmish", themeId: "underwater" } },
        },
      ],
    },
    {
      id: "goblin-camp",
      title: "Goblin Hideout",
      tiles: ["camp_goblin"],
      weight: 15,
      text: "The camp is smaller than it first looked because half of it is underground. Smoke leaks from holes between stacked shields and stolen canvas.",
      choices: [
        { id: "crawl", label: "Enter The Hideout", description: "Follow the smoke holes into the goblin den.", outcome: { text: "The party squeezes into the low dark, where voices hiss and metal scrapes.", dungeon: { size: "small", themeId: "goblinWarren" } } },
        {
          id: "lure",
          label: "Draw Them Out",
          description: "Deception DC 13. Success scatters the watch; failure starts a messy fight.",
          check: { ability: "cha", skill: "deception", dc: 13 },
          success: { text: "A thrown voice and a clattering pot send the lookouts chasing shadows. The party steals food before the shouting settles.", rewards: { rations: 2 } },
          failure: { text: "The trick almost works, then a horn squeals from below.", fight: { monsterTags: ["humanoid", "goblin"], count: "party", size: "skirmish", themeId: "goblinWarren" } },
        },
        { id: "avoid", label: "Avoid The Holes", description: "Do not test the den today.", outcome: { text: "The party leaves the smoking holes alone and makes camp out of earshot." } },
      ],
    },
    {
      id: "bandit-camp",
      title: "Bandit Camp",
      tiles: ["banditcamp", "bandit hideout", "camp_siege", "camp_pallisade", "camp_palisade", "camp_border"],
      weight: 12,
      text: "Fresh tracks circle the camp, and the firepit is still warm. Supplies are stacked where guards can see them.",
      choices: [
        { id: "raid", label: "Raid The Camp", description: "Rush the camp before the lookouts can shout.", outcome: { text: "The party rushes the camp before the lookouts can shout.", fight: { monsterTags: ["humanoid", "criminal"], count: "party", size: "skirmish", themeId: "outlawCamp" } } },
        { id: "break", label: "Break The Hideout", description: "Push through the camp and clear the inner stockade.", outcome: { text: "The party pushes past the outer fires and into the guarded heart of the camp.", dungeon: { size: "small", themeId: "outlawCamp" } } },
        {
          id: "sneak",
          label: "Steal Supplies",
          description: "Stealth DC 13. Success gains rations; failure starts the raid anyway.",
          check: { ability: "dex", skill: "stealth", dc: 13 },
          success: { text: "The party slips away with food bundles and nobody the wiser.", rewards: { rations: 3 } },
          failure: { text: "A guard turns at the wrong moment.", fight: { monsterTags: ["humanoid", "criminal"], count: "party", size: "skirmish", themeId: "outlawCamp" } },
        },
        { id: "watch", label: "Watch From Afar", description: "Avoid the camp.", outcome: { text: "The party camps far enough away to see the fire but not smell the smoke." } },
      ],
    },
    {
      id: "harbor-night-ferry",
      title: "Night Ferry",
      tiles: ["harbor", "city_harbor"],
      weight: 12,
      text: "A narrow ferry waits by the harbor pilings, lantern swinging though nobody stands aboard. The tide is perfect for a quiet crossing.",
      choices: [
        {
          id: "hire",
          label: "Hire The Ferry",
          description: "Persuasion DC 12. Success gains safe passage and supplies; failure draws dock thieves.",
          check: { ability: "cha", skill: "persuasion", dc: 12 },
          success: { text: "A sleepy ferryman appears, takes a modest fare from nowhere in particular, and shares salted fish for the road.", rewards: { rations: 2 } },
          failure: { text: "The ferryman is a lookout, and dock thieves close in from the fog.", fight: { monsterTags: ["humanoid"], count: "small", size: "skirmish", themeId: "urban" } },
        },
        { id: "board", label: "Board Anyway", description: "Let the ferry carry the party under the pier.", outcome: { text: "The ferry drifts under the pier and into a drowned passage.", dungeon: { size: "small", themeId: "underwater" } } },
        { id: "sleep", label: "Sleep Ashore", description: "Use the harbor as a safe camp landmark.", outcome: { text: "The party camps above the tide line and lets the ferry drift unanswered." } },
      ],
    },
    {
      id: "bridge-toll",
      title: "Bridge Toll",
      kinds: ["road"],
      weight: 10,
      text: "A bridge crosses the hard part of the route. Someone has painted a toll mark on the stones, but the tollkeeper is nowhere to be seen.",
      choices: [
        {
          id: "inspect",
          label: "Inspect The Toll",
          description: "Investigation DC 12. Success finds a hidden cache; failure springs an ambush.",
          check: { ability: "int", skill: "investigation", dc: 12 },
          success: { text: "A loose bridge stone hides old road coin and a note warning of bad camps ahead.", rewards: { money: { sp: 8, cp: 40 } } },
          failure: { text: "The toll mark was a signal. Bandits rise from beneath the bridge.", fight: { monsterTags: ["humanoid"], count: "small", size: "skirmish", themeId: "urban" } },
        },
        { id: "cross", label: "Cross And Camp", description: "Take the safe road onward.", outcome: { text: "The bridge cuts the roughest ground from the day's march." } },
      ],
    },
    {
      id: "castle-closed-gate",
      title: "Closed Gate",
      kinds: ["castle"],
      weight: 9,
      text: "The castle gate is barred, but banners still hang from the wall. A voice from above asks for names and business.",
      choices: [
        {
          id: "parley",
          label: "Parley",
          description: "Persuasion DC 14. Success earns supplies; failure reveals an occupied keep.",
          check: { ability: "cha", skill: "persuasion", dc: 14 },
          success: { text: "The gate opens just enough for a basket of food and news of the roads.", rewards: { rations: 2 } },
          failure: { text: "The voice was bait. Shapes move behind the arrow slits.", fight: { monsterTags: ["humanoid", "soldier"], count: "party", size: "skirmish", themeId: "castleKeep" } },
        },
        { id: "postern", label: "Find The Postern", description: "Slip into the old service halls.", outcome: { text: "A narrow postern opens into the old service halls.", dungeon: { size: "medium", themeId: "castleKeep" } } },
      ],
    },
  ];

  function eventMatchesBiome(event, biomeGroup = "") {
    return !event.biomes?.length || event.biomes.includes(String(biomeGroup || "").toLowerCase());
  }

  function normalizedTile(value = "") {
    return String(value || "").toLowerCase().replace(/\.(png|jpg|jpeg|webp)$/i, "");
  }

  function eventMatchesStructure(event, context = {}) {
    const kind = String(context.kind || "").toLowerCase();
    const tile = normalizedTile(context.tile);
    const biomeGroup = String(context.biomeGroup || "").toLowerCase();
    const specialSite = String(context.feature?.specialSite || "").toLowerCase();
    const matchesSpecialSite = !event.specialSites?.length || event.specialSites.map((site) => String(site).toLowerCase()).includes(specialSite);
    const matchesKind = !event.kinds?.length || event.kinds.includes(kind);
    const matchesTile = !event.tiles?.length || event.tiles.map(normalizedTile).includes(tile);
    const matchesBiome = !event.biomes?.length || event.biomes.includes(biomeGroup);
    return matchesSpecialSite && matchesKind && matchesTile && matchesBiome;
  }

  function pickEmptyHexEvent(context = {}) {
    const biomeGroup = String(context.biomeGroup ?? "").toLowerCase();
    const seed = [
      context.seed,
      context.day,
      context.hex?.chunkX,
      context.hex?.chunkY,
      context.hex?.row,
      context.hex?.col,
      context.biome,
    ].join(":");
    const random = rngFromSeed(seed);
    const weights = context.safeRoute ? EVENT_CATEGORY_WEIGHTS.emptyRoad : EVENT_CATEGORY_WEIGHTS.empty;
    const category = weightedCategory(weights, random);
    if (category === "none") return null;
    const biomePool = travelEmptyHexEvents.filter((event) => eventMatchesBiome(event, biomeGroup) && !event.kinds?.includes("road"));
    const roadPool = context.safeRoute ? travelEmptyHexEvents.filter((event) => event.kinds?.includes("road")) : [];
    const combinedPool = [...biomePool, ...roadPool];
    const pool = recentlyFiltered(combinedPool.length ? combinedPool : travelEmptyHexEvents, context.recentEventIds);
    return clone(pickByCategory(pool, category, random));
  }

  function pickStructureEvent(context = {}) {
    const seed = [
      context.seed,
      context.visitCount,
      context.feature?.id,
      context.kind,
      context.tile,
      context.biome,
    ].join(":");
    const random = rngFromSeed(seed);
    const matchingEvents = travelStructureEvents.filter((event) => eventMatchesStructure(event, context));
    const specialEvents = matchingEvents.filter((event) => event.specialSites?.length);
    const pool = recentlyFiltered(specialEvents.length ? specialEvents : matchingEvents, context.recentEventIds);
    const weights = Number(context.visitCount ?? 1) > 1 ? EVENT_CATEGORY_WEIGHTS.structureRevisit : EVENT_CATEGORY_WEIGHTS.structure;
    const category = weightedCategory(weights, random);
    if (category === "quiet") return null;
    return clone(pickByCategory(pool, category, random));
  }

  window.DepthboundTravelEvents = {
    version: 1,
    categoryWeights: EVENT_CATEGORY_WEIGHTS,
    emptyHexEvents: travelEmptyHexEvents,
    structureEvents: travelStructureEvents,
    pickEmptyHexEvent,
    pickStructureEvent,
  };
})();
