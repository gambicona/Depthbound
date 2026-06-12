(() => {
  const npcChats = {
    "general-merchant": {
      npcId: "general-merchant",
      start: "SOPHIE_HUB",
      portraitCaption: "General merchant",
      topicTitle: "Ask Sophie",
      backLabel: "Wait, go back a moment.",
      topicsLabel: "Something else.",
      leaveLabel: "Goodbye.",
      shopLabel: "Open the shop.",
      end: "SOPHIE_END",
      nodes: {
        SOPHIE_HUB: {
          lines: [
            { speaker: "Sophie", text: "Need rope, oil, bolts, rations, or the thing you forgot until something bit you? Good. I sell regret before it becomes fatal." },
          ],
          options: [
            ["SOPHIE_SHOP_01", "What are you selling?"],
            ["SOPHIE_CEMETERY_01", "Why set up beside the cemetery?"],
            ["SOPHIE_RUMORS_01", "Any rumors from the road?"],
            ["SOPHIE_ADVICE_01", "Got any survival advice?"],
            ["SOPHIE_PERSONAL_01", "You look worried."],
            { id: "SOPHIE_FAMILIAR_01", label: "Can you put something aside for me?", ifFriendshipAtLeast: 5 },
            { id: "SOPHIE_TRUSTED_01", label: "What do you need for your brother?", ifFriendshipAtLeast: 15 },
            { id: "SOPHIE_CLOSE_01", label: "Why stay open for adventurers?", ifFriendshipAtLeast: 25 },
            { id: "SOPHIE_DEAR_01", label: "I trust your judgment.", ifFriendshipAtLeast: 40 },
          ],
        },
        SOPHIE_SHOP_01: {
          prompt: "What are you selling?",
          lines: [
            { speaker: "Sophie", text: "Everything sensible people buy before they enter a hole in the earth. Rope. Oil. Torches. Lantern glass. Crossbow bolts. Sling stones. Rations that only taste a little like boot leather. Bandages, needles, chalk, crowbars, and enough sacks to carry whatever terrible idea you call treasure." },
          ],
          options: [
            ["SOPHIE_SHOP_02", "What should I always carry?"],
            ["SOPHIE_SHOP_03", "Anything good against undead?"],
            ["SHOP", "Open the shop."],
          ],
        },
        SOPHIE_SHOP_02: {
          prompt: "What should I always carry?",
          lines: [
            { speaker: "Sophie", text: "Two ropes. Not one. One rope is what optimists buy. Two ropes are what survivors carry. Also oil, chalk, dry rations, a spare light, and something sharp enough to cut yourself free when your brave friend ties the knot badly." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_SHOP_03: {
          prompt: "Anything good against undead?",
          lines: [
            { speaker: "Sophie", text: "Fire if they rot. Blunt force if they rattle. Distance if they whisper. And do not waste expensive arrows on bones unless the bow is better than your judgment." },
            { type: "stage", text: "She taps a crate of oil flasks." },
            { speaker: "Sophie", text: "Oil is cheap. Panic is expensive." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_CEMETERY_01: {
          prompt: "Why set up beside the cemetery?",
          lines: [
            { speaker: "Sophie", text: "Because adventurers go into tombs, then come out bleeding, hungry, soaked, cursed, or missing half their kit. Sister Maelis handles souls. I handle rope burns, snapped buckles, and the sudden need for more arrows." },
          ],
          options: [
            ["SOPHIE_CEMETERY_02", "Does Maelis approve?"],
            ["SOPHIE_CEMETERY_03", "Doesn't this place frighten you?"],
            ["SOPHIE_CEMETERY_04", "Do you buy things from tombs?"],
          ],
        },
        SOPHIE_CEMETERY_02: {
          prompt: "Does Maelis approve?",
          lines: [
            { speaker: "Sophie", text: "She tolerates me, which is practically a blessing from a grave-priestess. I do not sell finger bones, saint teeth, or anything with a name still attached. That keeps her bell out of my face." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_CEMETERY_03: {
          prompt: "Doesn't this place frighten you?",
          lines: [
            { speaker: "Sophie", text: "Of course it does. I am not stupid." },
            { type: "stage", text: "She glances toward the chapel." },
            { speaker: "Sophie", text: "But fear with a lantern is better than courage in the dark. Besides, the dead here are named. It is the unnamed ones out there that worry me." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_CEMETERY_04: {
          prompt: "Do you buy things from tombs?",
          lines: [
            { type: "stage", text: "Her eyes narrow by a fraction." },
            { speaker: "Sophie", text: "I buy salvage. Tools. Coin. Broken weapons. Things with no curse on them and no grieving widow looking for them." },
            { type: "stage", text: "She adjusts a cloth over a small locked box under the stall." },
            { speaker: "Sophie", text: "If something came from a grave, ask Maelis before waving it around. Some bargains keep breathing." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_RUMORS_01: {
          prompt: "Any rumors from the road?",
          lines: [
            { speaker: "Sophie", text: "Customers talk when they think merchants are counting coins. Lately they talk about cracked barrows, missing diggers, cold lights under the hills, and a horn sounding where no army stands." },
          ],
          options: [
            ["SOPHIE_RUMORS_02", "What do people say about the barrows?"],
            ["SOPHIE_RUMORS_03", "Any word about grave-robbers?"],
            ["SOPHIE_RUMORS_04", "Any safer rumors?"],
          ],
        },
        SOPHIE_RUMORS_02: {
          prompt: "What do people say about the barrows?",
          lines: [
            { speaker: "Sophie", text: "That they should have stayed shut. That something old is moving below them. That the dead do not wander like drunkards anymore; they march like they heard orders." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_RUMORS_03: {
          prompt: "Any word about grave-robbers?",
          lines: [
            { speaker: "Sophie", text: "Fewer than last week." },
            { type: "stage", text: "She says it flatly." },
            { speaker: "Sophie", text: "Some ran. Some vanished. Some learned there are doors a crowbar should not open. If you find one still breathing, listen before judging. Fear makes poor liars and excellent witnesses." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_RUMORS_04: {
          prompt: "Any safer rumors?",
          lines: [
            { speaker: "Sophie", text: "A farmer swears his goat can smell ghosts. A mason says the old road-stones hum at night. And someone keeps buying all my black thread without telling me why." },
            { type: "stage", text: "She shrugs." },
            { speaker: "Sophie", text: "So, no. No safer rumors." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_ADVICE_01: {
          prompt: "Got any survival advice?",
          lines: [
            { speaker: "Sophie", text: "Yes. Do not enter any place that looks like a mouth. If you must enter it, mark the way out. If the way out moves, stop being brave and start being fast." },
          ],
          options: [
            ["SOPHIE_ADVICE_02", "What about traps?"],
            ["SOPHIE_ADVICE_03", "What about supplies?"],
            ["SOPHIE_ADVICE_04", "What about fear?"],
          ],
        },
        SOPHIE_ADVICE_02: {
          prompt: "What about traps?",
          lines: [
            { speaker: "Sophie", text: "Dust tells stories. Scrapes near doors, clean patches on dirty floors, little holes in walls, bones in corners. If a corridor looks too empty, it is probably full of someone's cleverness." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_ADVICE_03: {
          prompt: "What about supplies?",
          lines: [
            { speaker: "Sophie", text: "Buy boring things. Boring things save lives. Nobody sings ballads about chalk marks and spare socks, but the dead are full of people who packed only swords." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_ADVICE_04: {
          prompt: "What about fear?",
          lines: [
            { speaker: "Sophie", text: "Fear is a bill collector. It arrives whether you like it or not. Pay it attention, not obedience." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_PERSONAL_01: {
          prompt: "You look worried.",
          lines: [
            { speaker: "Sophie", text: "I sell supplies beside a graveyard while the hills learn to growl. Worry is the sane response." },
            { type: "stage", text: "She sorts coins with quick fingers." },
            { speaker: "Sophie", text: "I have family to move before this village becomes another sad name in Maelis's book." },
          ],
          options: [
            ["SOPHIE_PERSONAL_02", "Family?"],
            ["SOPHIE_PERSONAL_03", "Why not leave now?"],
            ["SOPHIE_PERSONAL_04", "You care more than you pretend."],
          ],
        },
        SOPHIE_PERSONAL_02: {
          prompt: "Family?",
          lines: [
            { speaker: "Sophie", text: "A younger brother. Too young to know when adults are lying and old enough to notice the doors being barred at sunset." },
            { type: "stage", text: "She looks away." },
            { speaker: "Sophie", text: "I need coin. Then we leave. That is the whole plan, and I would appreciate the world not becoming dramatic before I finish it." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_PERSONAL_03: {
          prompt: "Why not leave now?",
          lines: [
            { speaker: "Sophie", text: "Because roads cost coin, guards cost coin, food costs coin, and safe towns charge extra for pretending to be safe." },
            { type: "stage", text: "She gives a hard smile." },
            { speaker: "Sophie", text: "So I stand where trouble spends money." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_PERSONAL_04: {
          prompt: "You care more than you pretend.",
          lines: [
            { speaker: "Sophie", text: "Care is bad for bargaining." },
            { type: "stage", text: "A small pause." },
            { speaker: "Sophie", text: "But yes. I care. Quietly. With inventory." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        SOPHIE_FAMILIAR_01: {
          prompt: "Can you put something aside for me?",
          action: "SOPHIE_RESERVE_UNLOCK",
          lines: [
            { speaker: "Sophie", text: "That is either the smartest thing you have said to me or the saddest." },
            { speaker: "Sophie", text: "Fine. I will keep a little shelf. Oil, lights, rations, bolts, clean bandages, and the sort of thing people only remember after the ceiling starts moving." },
            { type: "stage", text: "She points two fingers toward the shop crates." },
            { speaker: "Sophie", text: "Do not make me sentimental about inventory. I charge extra for that." },
          ],
          options: [["SHOP", "Show me the reserve shelf."]],
        },
        SOPHIE_TRUSTED_01: {
          prompt: "What do you need for your brother?",
          action: "SOPHIE_TRAVEL_PAPERS_ACCEPT",
          lines: [
            { speaker: "Sophie", text: "Coin, yes. But coin is simple. The hard part is papers." },
            { speaker: "Sophie", text: "Safe towns do not say they are afraid of refugees. They say proper names, proper stamps, proper proof of kinship. My brother has me, a birth charm, and a face that still believes adults solve things." },
            { speaker: "Sophie", text: "If you find sealed noble wax, a working signet, or an old charter with enough authority left on it to frighten a clerk, bring it to me. I can make survival look official." },
          ],
          options: [["SHOP", "I will check what we have."]],
        },
        SOPHIE_CLOSE_01: {
          prompt: "Why stay open for adventurers?",
          action: "SOPHIE_PACKS_UNLOCK",
          lines: [
            { speaker: "Sophie", text: "Because some of them come back." },
            { speaker: "Sophie", text: "Because my brother asks whether the people I sold torches to made it home, and I hate lying badly. Because Maelis cannot name the dead if nobody brings bodies back. Because someone has to hand fools a lantern before the dark gets them." },
            { speaker: "Sophie", text: "There. You made me say something decent. Buy something so we can both recover." },
          ],
          options: [["SHOP", "Show me the packs you would choose."]],
        },
        SOPHIE_DEAR_01: {
          prompt: "I trust your judgment.",
          action: "SOPHIE_LAST_MINUTE_ACCEPT",
          lines: [
            { speaker: "Sophie", text: "Do not say that too loudly. If people learn merchants have judgment, they ask us moral questions instead of prices." },
            { speaker: "Sophie", text: "But yes. I can prepare a kit for you. Not cheap. Not pretty. Useful. A pouch of little answers for ugly rooms." },
            { speaker: "Sophie", text: "Bring me good cloth, leather, wood, and something clean enough to hold a shape. If I put my brother's old lucky button in it, you give it back. That is not a sale." },
          ],
          options: [["SHOP", "What do you need for the kit?"]],
        },
        SOPHIE_END: {
          lines: [
            { speaker: "Sophie", text: "Come back before you run out. Coming back after is how people become cautionary examples." },
          ],
          end: true,
        },
      },
    },
    "monster-guild": {
      npcId: "monster-guild",
      start: "KESSA_HUB",
      end: "KESSA_END",
      flirtEnd: "KESSA_END_FLIRT",
      preserveVisit: true,
      returnToVisitOnClose: true,
      portraitCaption: "Huntmaster of the Trophy Lodge",
      topicTitle: "Ask Kessa",
      backLabel: "Hold. Back up.",
      topicsLabel: "Another thing.",
      leaveLabel: "That is all.",
      nodes: {
        KESSA_HUB: {
          lines: [
            { speaker: "Kessa", text: "If you came for glory, go bother the bards. If you came for work, show me your hands." },
            { type: "stage", text: "She looks you over like she is checking whether you know which end of a spear goes first." },
            { speaker: "Kessa", text: "Monster contracts are on the board. Trophies on the table. Lies outside." },
          ],
          options: [
            ["KESSA_LODGE_01", "What does the Trophy Lodge do?"],
            ["KESSA_CONTRACTS_01", "Got any contracts?"],
            ["KESSA_TROPHY_01", "How do I bring in a proper trophy?"],
            ["KESSA_CLEAN_01", "What makes a clean kill?"],
            ["KESSA_HABITS_01", "Tell me about monster habits."],
            ["KESSA_LIFE_01", "Tell me about yourself."],
            ["KESSA_FLIRT_01", "You're watching me like prey."],
            { id: "KESSA_FAMILIAR_01", label: "Teach me how to read tracks.", ifFriendshipAtLeast: 5 },
            { id: "KESSA_TRUSTED_01", label: "What prey still worries you?", ifFriendshipAtLeast: 15 },
            { id: "KESSA_CLOSE_01", label: "Why did you become a hunter?", ifFriendshipAtLeast: 25 },
            { id: "KESSA_DEAR_01", label: "Hunt beside us.", ifFriendshipAtLeast: 40 },
          ],
        },
        KESSA_LODGE_01: {
          prompt: "What does the Trophy Lodge do?",
          lines: [
            { speaker: "Kessa", text: "We track monsters, pay for proof, mark lairs, clear routes, and keep farmers from calling every big shadow a dragon." },
            { type: "stage", text: "She taps a row of carved tally marks." },
            { speaker: "Kessa", text: "A trophy is not decoration. It proves the threat had a shape, a place, and an ending." },
          ],
          options: [
            ["KESSA_LODGE_02", "So you just kill monsters?"],
            ["KESSA_LODGE_03", "Why keep trophies?"],
            ["KESSA_LODGE_04", "Do you hunt everything?"],
          ],
        },
        KESSA_LODGE_02: {
          prompt: "So you just kill monsters?",
          lines: [
            { speaker: "Kessa", text: "No. Bad hunters just kill. Good hunters know when not to." },
            { speaker: "Kessa", text: "A beast in its den is territory. A beast eating travelers on the road is a contract. Learn the difference or the Lodge will not pay you for making the woods angrier." },
          ],
        },
        KESSA_LODGE_03: {
          prompt: "Why keep trophies?",
          lines: [
            { speaker: "Kessa", text: "Because people forget danger when they cannot see its teeth." },
            { speaker: "Kessa", text: "This says: something killed here, someone faced it, and now we know what to watch for next time." },
          ],
        },
        KESSA_LODGE_04: {
          prompt: "Do you hunt everything?",
          lines: [
            { speaker: "Kessa", text: "No. We do not kill cubs, nesting mothers unless there is no choice, bound guardian beasts doing old duty, or creatures driven mad by someone else's magic until we know who caused it." },
            { speaker: "Kessa", text: "Sometimes the monster is just the loudest symptom." },
          ],
        },
        KESSA_CONTRACTS_01: {
          prompt: "Got any contracts?",
          lines: [
            { speaker: "Kessa", text: "Always. Something is always hungry, lost, wounded, nesting too close, or clever enough to charge a toll." },
            { speaker: "Kessa", text: "Read the conditions. Bring proof. Do not invent heroics after the fact." },
          ],
          options: [
            ["KESSA_CONTRACTS_02", "What kind of proof?"],
            ["KESSA_CONTRACTS_03", "What if the monster flees?"],
            ["BOARD", "Show me the contract board."],
          ],
        },
        KESSA_CONTRACTS_02: {
          prompt: "What kind of proof?",
          lines: [
            { speaker: "Kessa", text: "Depends on the creature. Ear, fang, stinger, scale patch, venom sac, marked hide, sometimes a sketch of track pattern if the body falls somewhere stupid." },
            { speaker: "Kessa", text: "Do not bring me random bones. I know random bones." },
          ],
          options: [["BOARD", "Show me the contract board."]],
        },
        KESSA_CONTRACTS_03: {
          prompt: "What if the monster flees?",
          lines: [
            { speaker: "Kessa", text: "Then track it or report it honestly. A wounded monster changes territory. If you leave it angry and call the job done, next blood is partly yours." },
          ],
          options: [["BOARD", "Show me the contract board."]],
        },
        KESSA_TROPHY_01: {
          prompt: "How do I bring in a proper trophy?",
          lines: [
            { speaker: "Kessa", text: "Clean cut. Keep the identifying part intact. Salt soft tissue. Do not let the wizard preserve it creatively. Label where you took it and what killed it." },
          ],
          options: [
            ["KESSA_TROPHY_02", "What ruins a trophy?"],
            ["KESSA_TROPHY_03", "Can I sell rare parts?"],
            ["BOARD", "Let's look at trophy turn-ins."],
          ],
        },
        KESSA_TROPHY_02: {
          prompt: "What ruins a trophy?",
          lines: [
            { speaker: "Kessa", text: "Fire, rot, bad cuts, acid, panic, and people hacking at the head because they saw it done once in a tavern painting." },
            { speaker: "Kessa", text: "Field dressing is a skill. Learn it or bring the whole carcass and apologize." },
          ],
          options: [["BOARD", "Let's look at trophy turn-ins."]],
        },
        KESSA_TROPHY_03: {
          prompt: "Can I sell rare parts?",
          lines: [
            { speaker: "Kessa", text: "Yes. Venom sacs, glands, hide plates, horns, spines, monster bone, alchemical organs. Lie about condition and I pay you in public embarrassment." },
          ],
          options: [["BOARD", "Let's look at trophy turn-ins."]],
        },
        KESSA_CLEAN_01: {
          prompt: "What makes a clean kill?",
          lines: [
            { speaker: "Kessa", text: "A clean kill ends the danger without making more of it. Quick if possible. Controlled if not." },
            { speaker: "Kessa", text: "No wounded monster crawling into a village ditch. No burning a whole den because you got scared of one claw." },
          ],
          options: [
            ["KESSA_CLEAN_02", "Does mercy matter?"],
            ["KESSA_CLEAN_03", "What about traps?"],
            ["KESSA_CLEAN_04", "What about reputation?"],
          ],
        },
        KESSA_CLEAN_02: {
          prompt: "Does mercy matter?",
          lines: [
            { speaker: "Kessa", text: "Yes. But mercy without skill is just another way to prolong pain. If you decide something must die, make sure you are good enough to mean it." },
          ],
        },
        KESSA_CLEAN_03: {
          prompt: "What about traps?",
          lines: [
            { speaker: "Kessa", text: "Good traps are clean. Bad traps are cowardice with a rope. A snare that holds a manticore until the hunters arrive? Good. A spike pit that leaves a bear screaming for two days? Bad. Also lazy." },
          ],
        },
        KESSA_CLEAN_04: {
          prompt: "What about reputation?",
          lines: [
            { speaker: "Kessa", text: "Hunters are remembered by what they leave behind. Clean camps. Paid debts. Honest trophies. Fewer grieving farmers. That is reputation." },
          ],
        },
        KESSA_HABITS_01: {
          prompt: "Tell me about monster habits.",
          lines: [
            { speaker: "Kessa", text: "Most monsters are not random. They feed, nest, flee, claim, mate, mark, and return. Learn the pattern and you live longer than the loud one with the axe." },
          ],
          options: [
            ["KESSA_HABITS_02", "How do I read tracks?"],
            ["KESSA_HABITS_03", "How do I know it is wounded?"],
            ["KESSA_HABITS_04", "How do I know it is unnatural?"],
          ],
        },
        KESSA_HABITS_02: {
          prompt: "How do I read tracks?",
          lines: [
            { speaker: "Kessa", text: "Depth, spacing, drag marks, broken brush, blood height, mud direction. Tracks tell you weight, speed, injury, and whether it knew it was being followed. That last one matters most." },
          ],
        },
        KESSA_HABITS_03: {
          prompt: "How do I know it is wounded?",
          lines: [
            { speaker: "Kessa", text: "Uneven tracks. Shorter stride. Blood on one side. Claw marks lower than usual. More aggression near cover. A wounded monster does not become weaker. It becomes less predictable." },
          ],
        },
        KESSA_HABITS_04: {
          prompt: "How do I know it is unnatural?",
          lines: [
            { speaker: "Kessa", text: "Normal hunger leaves a pattern. Magic leaves arguments with the pattern. Wrong footprints. Meat untouched. Birds silent where they should be screaming." },
          ],
        },
        KESSA_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Kessa", text: "Kessa Briarhook. Huntmaster because I survived long enough to tell younger fools which mistakes already have graves." },
            { speaker: "Kessa", text: "I have been bitten, clawed, poisoned, frozen, and proposed to by a man holding a wyvern gland. The bite was more sensible." },
          ],
        },
        KESSA_FLIRT_01: {
          prompt: "You're watching me like prey.",
          lines: [
            { speaker: "Kessa", text: "Prey runs without looking. Hunters ask better questions." },
            { type: "stage", text: "Her smile is brief and sharp." },
            { speaker: "Kessa", text: "So far, you are undecided." },
          ],
        },
        KESSA_FAMILIAR_01: {
          prompt: "Teach me how to read tracks.",
          action: "KESSA_TRACK_CASTS_ACCEPT",
          lines: [
            { speaker: "Kessa", text: "First lesson: tracks lie less than witnesses and more than bones." },
            { speaker: "Kessa", text: "Do not stare at the footprint. Look at what the beast avoided. A careful predator steps around loose stone. A wounded one stops pretending. A hungry one stops caring." },
            { speaker: "Kessa", text: "Bring me clean track casts in wax or clay, not drawings. Drawings flatter the artist." },
          ],
        },
        KESSA_TRUSTED_01: {
          prompt: "What prey still worries you?",
          action: "KESSA_WYVERN_TEETH_ACCEPT",
          lines: [
            { speaker: "Kessa", text: "Things that learn." },
            { speaker: "Kessa", text: "A wyvern is dangerous. A wyvern that avoids the same trap twice is a problem. A beast that starts hunting healers first is a war story beginning to stand up." },
            { speaker: "Kessa", text: "If you find teeth or signs from a predator that marked a party before killing them, bring proof. I will know if it came from a trader's necklace." },
          ],
        },
        KESSA_CLOSE_01: {
          prompt: "Why did you become a hunter?",
          action: "KESSA_LEARNED_BEAST_ACCEPT",
          lines: [
            { speaker: "Kessa", text: "Because monsters do not pretend their hunger is law." },
            { speaker: "Kessa", text: "People dress cruelty in uniforms, crowns, contracts, prayers. A manticore wants meat. A basilisk wants you still. There is honesty in that, even when it is trying to eat you." },
            { speaker: "Kessa", text: "And because someone has to stand between villages and teeth. I was good at standing. Then I got better at teeth." },
          ],
        },
        KESSA_DEAR_01: {
          prompt: "Hunt beside us.",
          action: "KESSA_FANG_GUARD_ACCEPT",
          lines: [
            { speaker: "Kessa", text: "Dangerous words." },
            { speaker: "Kessa", text: "A contract ends when the proof is counted. Choosing means I remember your footfalls. It means I watch your blind side without being paid for every glance." },
            { speaker: "Kessa", text: "Fine. Bring me a trophy worthy of being ugly on my wall, and I will make you something that keeps uglier things away from your throat." },
          ],
        },
        KESSA_END: {
          lines: [{ speaker: "Kessa", text: "Come back with proof, not excuses." }],
          end: true,
        },
        KESSA_END_FLIRT: {
          lines: [{ speaker: "Kessa", text: "Come back with proof and all your limbs. I dislike interesting people becoming trophies." }],
          end: true,
        },
      },
    },
    gravebinders: {
      npcId: "gravebinders",
      start: "ODRAN_HUB",
      end: "ODRAN_END",
      flirtEnd: "ODRAN_END_FLIRT",
      preserveVisit: true,
      returnToVisitOnClose: true,
      portraitCaption: "Candlewarden of the Gravebinders",
      topicTitle: "Ask Odran",
      backLabel: "Let us step back.",
      topicsLabel: "Another matter.",
      leaveLabel: "That is all.",
      nodes: {
        ODRAN_HUB: {
          lines: [
            { speaker: "Odran", text: "Speak softly. The dead do not mind noise, but the grieving do." },
            { type: "stage", text: "He adjusts a thin black candle in a brass holder." },
            { speaker: "Odran", text: "I am Candlewarden Odran Vellshade. If your business concerns restless dead, improper burial, grave materials, or a corpse behaving with poor manners, begin." },
          ],
          options: [
            ["ODRAN_ORDER_01", "What do the Gravebinders do?"],
            ["ODRAN_CONTRACTS_01", "Got any undead contracts?"],
            ["ODRAN_RESTLESS_01", "Why do some corpses refuse peace?"],
            ["ODRAN_WARDS_01", "Can you help with wards?"],
            ["ODRAN_GHOSTS_01", "Do you really argue with ghosts?"],
            ["ODRAN_LIFE_01", "Tell me about yourself."],
            ["ODRAN_FLIRT_01", "You have a strange calm."],
            { id: "ODRAN_FAMILIAR_01", label: "Teach me a proper grave mark.", ifFriendshipAtLeast: 5 },
            { id: "ODRAN_TRUSTED_01", label: "What work do you trust to few people?", ifFriendshipAtLeast: 15 },
            { id: "ODRAN_CLOSE_01", label: "What grief still follows you?", ifFriendshipAtLeast: 25 },
            { id: "ODRAN_DEAR_01", label: "Let me carry one of your candles.", ifFriendshipAtLeast: 40 },
          ],
        },
        ODRAN_ORDER_01: {
          prompt: "What do the Gravebinders do?",
          lines: [
            { speaker: "Odran", text: "We keep the dead from being misused, misplaced, misnamed, or misunderstood." },
            { speaker: "Odran", text: "Burial rites. Grave ledgers. Undead identification. Warding. Spirit arbitration. Corpse recovery when the living have made a mess and then become philosophical." },
          ],
          options: [
            ["ODRAN_ORDER_02", "Do you destroy all undead?"],
            ["ODRAN_ORDER_03", "Why do names matter?"],
            ["ODRAN_ORDER_04", "What is proper burial?"],
          ],
        },
        ODRAN_ORDER_02: {
          prompt: "Do you destroy all undead?",
          lines: [
            { speaker: "Odran", text: "No. That would be crude. Some undead are victims. Some are witnesses. Some are legal problems. Some are hungry mistakes. We identify first. Then we negotiate, bind, release, or destroy." },
          ],
        },
        ODRAN_ORDER_03: {
          prompt: "Why do names matter?",
          lines: [
            { speaker: "Odran", text: "A name gives the dead a shape the world can still recognize. Without one, grief becomes fog, and fog invites things that enjoy empty spaces." },
          ],
        },
        ODRAN_ORDER_04: {
          prompt: "What is proper burial?",
          lines: [
            { speaker: "Odran", text: "Name spoken. Body or remains placed. Cause noted if known. Debts marked. Grave sealed. Candle burned. No theft, no shortcuts, no sentimental improvisation with necromancy." },
            { speaker: "Odran", text: "The last rule is violated often." },
          ],
        },
        ODRAN_CONTRACTS_01: {
          prompt: "Got any undead contracts?",
          lines: [
            { speaker: "Odran", text: "Yes. A bone patrol near the old road. A weeping cellar spirit. Three graves breathing in sequence. One corpse that returns home every night and knocks politely." },
            { speaker: "Odran", text: "Do not laugh. Polite undead are often the worst paperwork." },
          ],
          options: [
            ["ODRAN_CONTRACTS_02", "What proof do you need?"],
            ["ODRAN_CONTRACTS_03", "Can some contracts end peacefully?"],
            ["BOARD", "Show me the undead contracts."],
          ],
        },
        ODRAN_CONTRACTS_02: {
          prompt: "What proof do you need?",
          lines: [
            { speaker: "Odran", text: "Bone ash, grave tokens, torn burial cloth, spectral residue, marked coffin nails, copied inscriptions, or witness testimony from a spirit coherent enough to be useful." },
            { speaker: "Odran", text: "Not skulls unless requested. People become vulgar around skulls." },
          ],
          options: [["BOARD", "Show me the undead contracts."]],
        },
        ODRAN_CONTRACTS_03: {
          prompt: "Can some contracts end peacefully?",
          lines: [
            { speaker: "Odran", text: "Many should. A ghost may need a name restored, a debt paid, a murderer found, or a door opened. Violence is appropriate for hunger, malice, and hollow things. Not for every sorrow that learned to glow." },
          ],
          options: [["BOARD", "Show me the undead contracts."]],
        },
        ODRAN_RESTLESS_01: {
          prompt: "Why do some corpses refuse peace?",
          lines: [
            { speaker: "Odran", text: "Refuse is usually the wrong word. Some are held. Some are called. Some were buried badly. Some died with a promise tied around the throat." },
          ],
          options: [
            ["ODRAN_RESTLESS_02", "Can they be helped?"],
            ["ODRAN_RESTLESS_03", "What makes them dangerous?"],
            ["ODRAN_RESTLESS_04", "What if the living caused it?"],
          ],
        },
        ODRAN_RESTLESS_02: {
          prompt: "Can they be helped?",
          lines: [
            { speaker: "Odran", text: "Often. A name, a candle, a debt paid, a relic returned, a killer named. The dead are not always asking for battle. Many are asking for completion." },
          ],
        },
        ODRAN_RESTLESS_03: {
          prompt: "What makes them dangerous?",
          lines: [
            { speaker: "Odran", text: "Hunger, command, repetition, and loneliness. The last sounds gentle until a ghost repeats the same grief into every living mind it touches." },
          ],
        },
        ODRAN_RESTLESS_04: {
          prompt: "What if the living caused it?",
          lines: [
            { speaker: "Odran", text: "Then we correct the living. Preferably with law, confession, or restitution. If they resist, the dead are not the only party in need of binding." },
          ],
        },
        ODRAN_WARDS_01: {
          prompt: "Can you help with wards?",
          lines: [
            { speaker: "Odran", text: "With proper materials, yes. Salt, ash, grave wax, black thread, bell-metal, and a written name do more work than most people expect." },
          ],
          options: [
            ["ODRAN_WARDS_02", "Can wards stop possession?"],
            ["ODRAN_WARDS_03", "What breaks a ward?"],
            ["BOARD", "Show me grave turn-ins."],
          ],
        },
        ODRAN_WARDS_02: {
          prompt: "Can wards stop possession?",
          lines: [
            { speaker: "Odran", text: "A good ward can discourage, slow, or expose possession. Nothing replaces a strong will and a companion who notices when you begin speaking in antique grammar." },
          ],
        },
        ODRAN_WARDS_03: {
          prompt: "What breaks a ward?",
          lines: [
            { speaker: "Odran", text: "Bad inscription, wrong name, stolen ash, careless blood, mockery, rain, and children with sticks. I list children because they are common." },
          ],
        },
        ODRAN_GHOSTS_01: {
          prompt: "Do you really argue with ghosts?",
          lines: [
            { speaker: "Odran", text: "Frequently. The dead are not wiser for being dead. Some are merely more repetitive." },
          ],
          options: [
            ["ODRAN_GHOSTS_02", "Do they lie?"],
            ["ODRAN_GHOSTS_03", "Can they remember clearly?"],
            ["ODRAN_GHOSTS_04", "Are you afraid of them?"],
          ],
        },
        ODRAN_GHOSTS_02: {
          prompt: "Do they lie?",
          lines: [
            { speaker: "Odran", text: "Yes. So do the living. Ghosts simply have fewer new excuses." },
          ],
        },
        ODRAN_GHOSTS_03: {
          prompt: "Can they remember clearly?",
          lines: [
            { speaker: "Odran", text: "Memory after death is a room with missing walls. One must listen for drafts." },
          ],
        },
        ODRAN_GHOSTS_04: {
          prompt: "Are you afraid of them?",
          lines: [
            { speaker: "Odran", text: "I am afraid of unfinished things. Ghosts are only one variety." },
          ],
        },
        ODRAN_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Odran", text: "Odran Vellshade. Candlewarden. I keep ledgers, negotiate with stubborn remains, and explain to armed strangers that grave law is still law." },
            { speaker: "Odran", text: "I sleep lightly, drink bitter tea, and have never once been improved by a bard's song about necromancy." },
          ],
        },
        ODRAN_FLIRT_01: {
          prompt: "You have a strange calm.",
          lines: [
            { speaker: "Odran", text: "Calm is a courtesy. Panic spreads faster than mold in crypt stone." },
            { type: "stage", text: "His gaze lingers, precise and unreadable." },
            { speaker: "Odran", text: "Besides, I reserve visible alarm for truly rare phenomena." },
          ],
        },
        ODRAN_FAMILIAR_01: {
          prompt: "Teach me a proper grave mark.",
          action: "ODRAN_GRAVE_MARK_ACCEPT",
          lines: [
            { speaker: "Odran", text: "A proper grave mark tells the living where to put grief and tells the dead they have not become weather." },
            { speaker: "Odran", text: "Name first. Then token. Then cause if known. Never begin with a title. Titles are what people argued over while alive." },
            { speaker: "Odran", text: "Bring me burial tokens or marked bone suitable for practice. I will show you how to write without turning memory into decoration." },
          ],
        },
        ODRAN_TRUSTED_01: {
          prompt: "What work do you trust to few people?",
          action: "ODRAN_BLACK_CANDLE_ACCEPT",
          lines: [
            { speaker: "Odran", text: "Carrying words from the dead to the living without improving them." },
            { speaker: "Odran", text: "Most people edit grief until it flatters them. A Gravebinder must not. The last words of the bitter, frightened, selfish, and brave all deserve accurate ink." },
            { speaker: "Odran", text: "Bring grave wax, ash, or spirit traces. I have black candles to make, and I would rather you learn why they matter before you need one." },
          ],
        },
        ODRAN_CLOSE_01: {
          prompt: "What grief still follows you?",
          action: "ODRAN_LEDGER_DEBTS_ACCEPT",
          lines: [
            { speaker: "Odran", text: "The unnamed ones." },
            { speaker: "Odran", text: "Not the dead who scream. Them we hear. I mean the bodies found after flood, fire, battle, hunger. No kin. No witness. No one left to say whether they hated turnips or sang badly." },
            { speaker: "Odran", text: "Bring me lost-name evidence: grave tokens, inscriptions, old cloth, anything that might let a person become particular again." },
          ],
        },
        ODRAN_DEAR_01: {
          prompt: "Let me carry one of your candles.",
          action: "ODRAN_NAME_BELL_ACCEPT",
          lines: [
            { speaker: "Odran", text: "That is not a romantic object." },
            { type: "stage", text: "He says it too quickly, then takes a moment to trim the candle wick." },
            { speaker: "Odran", text: "It is a promise to notice when the world tries to erase someone. Bring me materials fit for a name-bell, and I will decide whether your hands are steady enough." },
          ],
        },
        ODRAN_END: {
          lines: [{ speaker: "Odran", text: "Walk carefully. The dead are not the only ones listening." }],
          end: true,
        },
        ODRAN_END_FLIRT: {
          lines: [{ speaker: "Odran", text: "Return carefully. I prefer speaking with you before you require a ledger entry." }],
          end: true,
        },
      },
    },
    "crucible-collegium": {
      npcId: "crucible-collegium",
      start: "TAVREN_HUB",
      end: "TAVREN_END",
      flirtEnd: "TAVREN_END_FLIRT",
      preserveVisit: true,
      returnToVisitOnClose: true,
      portraitCaption: "Provost of the Crucible Collegium",
      topicTitle: "Ask Tavren",
      backLabel: "Rewind the thought.",
      topicsLabel: "New hypothesis.",
      leaveLabel: "Enough experiments for now.",
      nodes: {
        TAVREN_HUB: {
          lines: [
            { speaker: "Tavren", text: "Do not touch the blue vial, the black vial, or the vial that appears to be touching itself." },
            { type: "stage", text: "He lifts his brass spectacles and gives you a delighted, appraising look." },
            { speaker: "Tavren", text: "Tavren Quillflare, Crucible Collegium. If you bring unstable samples, improbable elemental residue, or a question that smokes, we may both profit." },
          ],
          options: [
            ["TAVREN_COLLEGIUM_01", "What does the Collegium do?"],
            ["TAVREN_CONTRACTS_01", "Got any studies open?"],
            ["TAVREN_REAGENTS_01", "What samples do you need?"],
            ["TAVREN_THEORY_01", "How do the elements work?"],
            ["TAVREN_EXPERIMENTS_01", "What are you testing?"],
            ["TAVREN_LIFE_01", "Tell me about yourself."],
            ["TAVREN_FLIRT_01", "You seem excited to nearly explode."],
            { id: "TAVREN_FAMILIAR_01", label: "Show me safe sample handling.", ifFriendshipAtLeast: 5 },
            { id: "TAVREN_TRUSTED_01", label: "What experiment needs brave hands?", ifFriendshipAtLeast: 15 },
            { id: "TAVREN_CLOSE_01", label: "What theory keeps you awake?", ifFriendshipAtLeast: 25 },
            { id: "TAVREN_DEAR_01", label: "Let me help with the impossible question.", ifFriendshipAtLeast: 40 },
          ],
        },
        TAVREN_COLLEGIUM_01: {
          prompt: "What does the Collegium do?",
          lines: [
            { speaker: "Tavren", text: "We study dangerous matter before dangerous matter studies us back." },
            { speaker: "Tavren", text: "Elemental residues, unstable stones, living flame, bottled storms, suspicious mud, persuasive crystals. We classify, test, contain, and occasionally apologize." },
          ],
          options: [
            ["TAVREN_COLLEGIUM_02", "Why here?"],
            ["TAVREN_COLLEGIUM_03", "Is this safe?"],
            ["TAVREN_COLLEGIUM_04", "Do you work with adventurers often?"],
          ],
        },
        TAVREN_COLLEGIUM_02: {
          prompt: "Why here?",
          lines: [
            { speaker: "Tavren", text: "Because the ground misbehaves nearby. Excellent research begins where sensible people say, 'absolutely not there.'" },
          ],
        },
        TAVREN_COLLEGIUM_03: {
          prompt: "Is this safe?",
          lines: [
            { speaker: "Tavren", text: "Safe is a lazy word. Contained, observed, measured, and unlikely to remove the roof are better words." },
          ],
        },
        TAVREN_COLLEGIUM_04: {
          prompt: "Do you work with adventurers often?",
          lines: [
            { speaker: "Tavren", text: "Adventurers enter places scholars are forbidden from entering by ethics committees, locked doors, and common survival instinct. Naturally, we collaborate." },
          ],
        },
        TAVREN_CONTRACTS_01: {
          prompt: "Got any studies open?",
          lines: [
            { speaker: "Tavren", text: "Always. Current studies involve elemental traces, reactive monster organs, anomalous stone, and one regrettable question about whether lightning can ferment." },
          ],
          options: [
            ["TAVREN_CONTRACTS_02", "What counts as evidence?"],
            ["TAVREN_CONTRACTS_03", "What if a sample explodes?"],
            ["BOARD", "Show me the studies."],
          ],
        },
        TAVREN_CONTRACTS_02: {
          prompt: "What counts as evidence?",
          lines: [
            { speaker: "Tavren", text: "Samples with labels. Notes with context. Residue in a sealed vial. Sketches of glyph behavior. Measurements taken before the screaming began." },
          ],
          options: [["BOARD", "Show me the studies."]],
        },
        TAVREN_CONTRACTS_03: {
          prompt: "What if a sample explodes?",
          lines: [
            { speaker: "Tavren", text: "Then it has communicated vigorously. Bring the fragments, describe the color, and avoid breathing near anything still enthusiastic." },
          ],
          options: [["BOARD", "Show me the studies."]],
        },
        TAVREN_REAGENTS_01: {
          prompt: "What samples do you need?",
          lines: [
            { speaker: "Tavren", text: "Cores, glands, residue, charged dust, crystallized heat, storm glass, tidal salts, and any stone that hums in a language it should not know." },
          ],
          options: [
            ["TAVREN_REAGENTS_02", "How should we carry them?"],
            ["TAVREN_REAGENTS_03", "What should we not bring?"],
            ["BOARD", "Show me sample turn-ins."],
          ],
        },
        TAVREN_REAGENTS_02: {
          prompt: "How should we carry them?",
          lines: [
            { speaker: "Tavren", text: "Wrapped, labeled, separated, and never in the same pouch as lunch. Especially if the lunch contains onions. Do not ask why." },
          ],
        },
        TAVREN_REAGENTS_03: {
          prompt: "What should we not bring?",
          lines: [
            { speaker: "Tavren", text: "Anything still attached to an angry creature, anything whispering your childhood name, and anything that has already eaten the container." },
          ],
        },
        TAVREN_THEORY_01: {
          prompt: "How do the elements work?",
          lines: [
            { speaker: "Tavren", text: "Beautifully, violently, and only sometimes as advertised. Flame consumes, stone remembers, storm insists, tide returns. The interesting cases are when they borrow each other's habits." },
          ],
          options: [
            ["TAVREN_THEORY_02", "What is the strangest crossing?"],
            ["TAVREN_THEORY_03", "Can elements be corrupted?"],
            ["TAVREN_THEORY_04", "Can they be negotiated with?"],
          ],
        },
        TAVREN_THEORY_02: {
          prompt: "What is the strangest crossing?",
          lines: [
            { speaker: "Tavren", text: "Stone that burns without heat. Fire that flows uphill. Rain that leaves ashes. I dislike choosing favorites when all of them threaten furniture." },
          ],
        },
        TAVREN_THEORY_03: {
          prompt: "Can elements be corrupted?",
          lines: [
            { speaker: "Tavren", text: "Corrupted, compelled, starved, overfed, harmonized badly. Nature is less a temple and more an orchestra with knives." },
          ],
        },
        TAVREN_THEORY_04: {
          prompt: "Can they be negotiated with?",
          lines: [
            { speaker: "Tavren", text: "Not with words, usually. With pressure, channels, offerings, boundaries, and occasionally a very rude valve." },
          ],
        },
        TAVREN_EXPERIMENTS_01: {
          prompt: "What are you testing?",
          lines: [
            { speaker: "Tavren", text: "Today? Conductive moss, memory-bearing basalt, and whether a thunder glyph can be taught manners." },
          ],
          options: [
            ["TAVREN_EXPERIMENTS_02", "Can we help?"],
            ["TAVREN_EXPERIMENTS_03", "What could go wrong?"],
            ["TAVREN_EXPERIMENTS_04", "Should I stand farther away?"],
          ],
        },
        TAVREN_EXPERIMENTS_02: {
          prompt: "Can we help?",
          lines: [
            { speaker: "Tavren", text: "Excellent. You already exceed two former assistants by asking before touching anything." },
          ],
          options: [["BOARD", "Show me the work."]],
        },
        TAVREN_EXPERIMENTS_03: {
          prompt: "What could go wrong?",
          lines: [
            { speaker: "Tavren", text: "A limited and unhelpful question. What could go right in an unexpected direction? Now there is a useful category." },
          ],
        },
        TAVREN_EXPERIMENTS_04: {
          prompt: "Should I stand farther away?",
          lines: [
            { speaker: "Tavren", text: "Statistically, yes. Emotionally, I appreciate the confidence." },
            { speaker: "Tavren", text: "There. Now only your eyebrows are at philosophical risk." },
          ],
        },
        TAVREN_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Tavren", text: "Tavren Quillflare. Provost, lecturer, researcher, survivor of peer review, three laboratory fires, and one deeply unfair ban on indoor lightning." },
            { speaker: "Tavren", text: "I believe the world becomes less terrifying when measured. Usually." },
          ],
        },
        TAVREN_FLIRT_01: {
          prompt: "You seem excited to nearly explode.",
          lines: [
            { speaker: "Tavren", text: "Nearly is an important word. Precision separates genius from debris." },
            { speaker: "Tavren", text: "Danger is only attractive when properly contained. Though I admit, containment is sometimes a matter of mutual discipline." },
          ],
        },
        TAVREN_FAMILIAR_01: {
          prompt: "Show me safe sample handling.",
          action: "TAVREN_FIELD_NOTES_ACCEPT",
          lines: [
            { speaker: "Tavren", text: "Safe sample handling begins with the radical premise that jars should close." },
            { speaker: "Tavren", text: "Label source, temperature, color, smell, last insulting noise, and whether the sample attempted escape. Especially the last one." },
            { speaker: "Tavren", text: "Bring me stable motes, crystal, or pressure pieces. I will show you how to collect evidence without teaching your eyebrows mortality." },
          ],
        },
        TAVREN_TRUSTED_01: {
          prompt: "What experiment needs brave hands?",
          action: "TAVREN_CONDUCTIVE_MOSS_ACCEPT",
          lines: [
            { speaker: "Tavren", text: "Conductive moss. Delightful phrase. Terrible floor covering." },
            { speaker: "Tavren", text: "It drinks storm essence, remembers footsteps, and occasionally tries to complete unfinished thoughts by shocking them out of people." },
            { speaker: "Tavren", text: "Bring storm, crystal, or living-growth reagents. I need to learn whether it is a plant behaving like lightning or lightning wearing a salad." },
          ],
        },
        TAVREN_CLOSE_01: {
          prompt: "What theory keeps you awake?",
          action: "TAVREN_FOURFOLD_LENS_ACCEPT",
          lines: [
            { speaker: "Tavren", text: "That the elements are not four houses, but four arguments about change." },
            { speaker: "Tavren", text: "Fire says become. Stone says remain. Tide says return. Storm says move. Every monster, spell, and catastrophe is some compromise between them." },
            { speaker: "Tavren", text: "Bring me balanced essences from more than one argument. If I can tune the lens correctly, perhaps it will stop exploding when philosophy enters the room." },
          ],
        },
        TAVREN_DEAR_01: {
          prompt: "Let me help with the impossible question.",
          action: "TAVREN_STORM_VALVE_ACCEPT",
          lines: [
            { speaker: "Tavren", text: "Wonderful. Terrifying. Both." },
            { speaker: "Tavren", text: "The impossible question is whether a surge can be persuaded to become a door instead of an event report." },
            { speaker: "Tavren", text: "Bring me a primal core, pressure housing, and storm essence if you find them. I will build a valve, and we will stand at the correct distance from destiny." },
          ],
        },
        TAVREN_END: {
          lines: [{ speaker: "Tavren", text: "Do not mix unknown powders, bottled lightning, and optimism without supervision." }],
          end: true,
        },
        TAVREN_END_FLIRT: {
          lines: [{ speaker: "Tavren", text: "Return safely. Preferably with samples. But safely first. I am told that distinction matters." }],
          end: true,
        },
      },
    },
    "antiquarian-society": {
      npcId: "antiquarian-society",
      start: "SERAPHEL_HUB",
      end: "SERAPHEL_END",
      flirtEnd: "SERAPHEL_END_FLIRT",
      preserveVisit: true,
      returnToVisitOnClose: true,
      portraitCaption: "Chair of the Antiquarian Society",
      topicTitle: "Ask Seraphel",
      backLabel: "Return to the previous point.",
      topicsLabel: "Another scholarly matter.",
      leaveLabel: "That is all.",
      nodes: {
        SERAPHEL_HUB: {
          lines: [
            { speaker: "Seraphel", text: "Careful. If that is ancient, place it on the felt. If it is cursed, place it on the slate. If it is both, do not smile like that near my catalogues." },
            { type: "stage", text: "She adjusts a pair of ink-smudged gloves." },
            { speaker: "Seraphel", text: "Professor Seraphel Inkglass, Chair of the Antiquarian Society. What have you disturbed?" },
          ],
          options: [
            ["SERAPHEL_SOCIETY_01", "What does the Antiquarian Society do?"],
            ["SERAPHEL_RELIC_01", "Can you examine a relic?"],
            ["SERAPHEL_CONTEXT_01", "Why does context matter so much?"],
            ["SERAPHEL_INSCRIPTIONS_01", "Can you read inscriptions?"],
            ["SERAPHEL_RUINS_01", "What should I bring back from ruins?"],
            ["SERAPHEL_LIFE_01", "Tell me about yourself."],
            ["SERAPHEL_FLIRT_01", "You seem very passionate about labels."],
            { id: "SERAPHEL_FAMILIAR_01", label: "Teach me proper cataloging.", ifFriendshipAtLeast: 5 },
            { id: "SERAPHEL_TRUSTED_01", label: "What find would you trust me with?", ifFriendshipAtLeast: 15 },
            { id: "SERAPHEL_CLOSE_01", label: "What history still haunts you?", ifFriendshipAtLeast: 25 },
            { id: "SERAPHEL_DEAR_01", label: "Let me help preserve something dangerous.", ifFriendshipAtLeast: 40 },
          ],
        },
        SERAPHEL_SOCIETY_01: {
          prompt: "What does the Antiquarian Society do?",
          lines: [
            { speaker: "Seraphel", text: "We rescue history from treasure hunters, rainwater, bad shelves, and people who think 'old' and 'valuable' are the same word." },
            { speaker: "Seraphel", text: "We identify relics, catalogue ruins, copy inscriptions, preserve dangerous objects, and attach labels before some fool invents a heroic lie about them." },
          ],
          options: [
            ["SERAPHEL_SOCIETY_02", "So you collect treasure?"],
            ["SERAPHEL_SOCIETY_03", "Why label everything?"],
            ["BOARD", "Open Society contracts."],
          ],
        },
        SERAPHEL_SOCIETY_02: {
          prompt: "So you collect treasure?",
          lines: [
            { speaker: "Seraphel", text: "No. We collect meaning. A golden cup without context is a shiny drinking problem. A cracked clay cup with a maker's mark, burial layer, and matching inscription can rewrite a century." },
          ],
        },
        SERAPHEL_SOCIETY_03: {
          prompt: "Why label everything?",
          lines: [
            { speaker: "Seraphel", text: "Because an unlabeled relic becomes rumor. A labeled relic becomes evidence. Name, origin, material, condition, hazard, and acquisition site. That is how you stop history from becoming tavern smoke." },
          ],
        },
        SERAPHEL_RELIC_01: {
          prompt: "Can you examine a relic?",
          lines: [
            { speaker: "Seraphel", text: "With pleasure and caution, ideally in that order. Place it here. Do not polish it. Do not pry off anything that looks like just a bit of dirt. Dirt is sometimes the most honest witness." },
          ],
          options: [
            ["SERAPHEL_RELIC_02", "What can you tell from an object?"],
            ["SERAPHEL_RELIC_03", "What if it is cursed?"],
            ["BOARD", "Open relic appraisal."],
          ],
        },
        SERAPHEL_RELIC_02: {
          prompt: "What can you tell from an object?",
          lines: [
            { speaker: "Seraphel", text: "Material source, tool marks, age, repairs, ritual use, trade route, burial practice, owner status, and occasionally whether the previous holder died surprised. Objects gossip. One simply needs training to hear it." },
          ],
        },
        SERAPHEL_RELIC_03: {
          prompt: "What if it is cursed?",
          lines: [
            { speaker: "Seraphel", text: "Then we label it more aggressively. Curse, handling instructions, symptoms, known triggers, and whether it whispers in first or third person. Never underestimate grammar in dangerous objects." },
          ],
        },
        SERAPHEL_CONTEXT_01: {
          prompt: "Why does context matter so much?",
          lines: [
            { speaker: "Seraphel", text: "Because treasure tells you what someone had. Context tells you who they were. A coin in a purse, a coin under a tongue, and a coin nailed above a door are three different stories. Same metal. Different world." },
          ],
          options: [
            ["SERAPHEL_CONTEXT_02", "What ruins context?"],
            ["SERAPHEL_CONTEXT_03", "What should I record?"],
            ["SERAPHEL_CONTEXT_04", "What if I already moved the relic?"],
          ],
        },
        SERAPHEL_CONTEXT_02: {
          prompt: "What ruins context?",
          lines: [
            { speaker: "Seraphel", text: "Looting, washing, sorting things into valuable and trash, moving bones, prying tablets from walls, and adventurers saying they remember where it was with confidence. Confidence is not a map." },
          ],
        },
        SERAPHEL_CONTEXT_03: {
          prompt: "What should I record?",
          lines: [
            { speaker: "Seraphel", text: "Room, position, nearby markings, container, damage, smell, temperature, traps, bodies, water level, ash, and whether the object was hidden, displayed, discarded, or worshipped. If you remember only one thing, remember where it was." },
          ],
        },
        SERAPHEL_CONTEXT_04: {
          prompt: "What if I already moved the relic?",
          lines: [
            { speaker: "Seraphel", text: "Then we do not panic. We reconstruct. You tell me exactly where it was, what was around it, which way it faced, and whether anyone stepped on anything important while being brave." },
          ],
        },
        SERAPHEL_INSCRIPTIONS_01: {
          prompt: "Can you read inscriptions?",
          lines: [
            { speaker: "Seraphel", text: "Some. Others I can insult until they reveal their grammar. Dwarven claim marks, old Crownroad ledger script, funerary hands, trade stamps, shrine formulae, and several languages that should have died more politely." },
          ],
          options: [
            ["SERAPHEL_INSCRIPTIONS_02", "What if the inscription is damaged?"],
            ["SERAPHEL_INSCRIPTIONS_03", "What if it is magical?"],
            ["BOARD", "Open inscription study."],
          ],
        },
        SERAPHEL_INSCRIPTIONS_02: {
          prompt: "What if the inscription is damaged?",
          lines: [
            { speaker: "Seraphel", text: "Then we use pattern, spacing, surviving strokes, and parallel examples. A missing word is not an empty word. It leaves a shape. Scholars live in those shapes." },
          ],
        },
        SERAPHEL_INSCRIPTIONS_03: {
          prompt: "What if it is magical?",
          lines: [
            { speaker: "Seraphel", text: "Then do not read it aloud. Copy the shape. Do not speak the words. Do not trace it with blood, saliva, holy water, enthusiasm, or whatever possessed the last assistant." },
          ],
        },
        SERAPHEL_RUINS_01: {
          prompt: "What should I bring back from ruins?",
          lines: [
            { speaker: "Seraphel", text: "Field notes first. Then seals, inscriptions, old tools, marked pottery, intact tablets, shrine fragments, catalogued relics, and anything whose value is not improved by polishing." },
          ],
          options: [["BOARD", "Open Society commissions."]],
        },
        SERAPHEL_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Seraphel", text: "Professor Seraphel Inkglass. I have devoted my life to rescuing truth from dust, vanity, and badly packed saddlebags." },
            { speaker: "Seraphel", text: "I enjoy quiet rooms, honest labels, and discoveries that arrive with their provenance intact." },
          ],
        },
        SERAPHEL_FLIRT_01: {
          prompt: "You seem very passionate about labels.",
          lines: [
            { speaker: "Seraphel", text: "Labels are how one proves attention. Anyone can admire a relic. It takes care to know what it is, where it came from, and how not to ruin it by being impressed too loudly." },
          ],
        },
        SERAPHEL_FAMILIAR_01: {
          prompt: "Teach me proper cataloging.",
          action: "SERAPHEL_CATALOGING_ACCEPT",
          lines: [
            { speaker: "Seraphel", text: "Proper cataloging begins with humility. The object is not yours simply because you survived the room it was in." },
            { speaker: "Seraphel", text: "Record place, position, container, damage, neighbors, inscriptions, and what you touched before realizing you should not touch things." },
            { speaker: "Seraphel", text: "Bring me modest antiquities or clear field fragments. I will show you how to make an object useful without making it louder than its context." },
          ],
        },
        SERAPHEL_TRUSTED_01: {
          prompt: "What find would you trust me with?",
          action: "SERAPHEL_PROVENANCE_ACCEPT",
          lines: [
            { speaker: "Seraphel", text: "A damaged thing with enough truth left to save." },
            { speaker: "Seraphel", text: "Pristine relics are easy to flatter. Broken ones require discipline. A scratch may be vandalism, repair, ritual, or the only surviving signature." },
            { speaker: "Seraphel", text: "Bring reliquary fragments, old art, marked valuables, or inscriptions with their context intact. If you guess, say you guessed." },
          ],
        },
        SERAPHEL_CLOSE_01: {
          prompt: "What history still haunts you?",
          action: "SERAPHEL_LOST_ROOM_ACCEPT",
          lines: [
            { speaker: "Seraphel", text: "The lost rooms." },
            { speaker: "Seraphel", text: "Not ruins. Ruins announce themselves. I mean rooms erased by renovations, fires, frightened heirs, and kings who preferred memory to become flattering." },
            { speaker: "Seraphel", text: "Bring me charters, seals, royal fragments, or contradictory records. I am trying to prove a room existed before its absence becomes official." },
          ],
        },
        SERAPHEL_DEAR_01: {
          prompt: "Let me help preserve something dangerous.",
          action: "SERAPHEL_BLACK_LABEL_ACCEPT",
          lines: [
            { speaker: "Seraphel", text: "Dangerous history is not evil because it can harm you. It is dangerous because it can persuade you it was always inevitable." },
            { speaker: "Seraphel", text: "We preserve it with labels, locks, witnesses, and the refusal to become impressed into stupidity." },
            { speaker: "Seraphel", text: "Bring me a major relic or dangerous antiquity with enough provenance to stand trial. I will prepare a black label and decide whether you are steady enough to read it." },
          ],
        },
        SERAPHEL_END: {
          lines: [{ speaker: "Seraphel", text: "Bring me history, not merely old things." }],
          end: true,
        },
        SERAPHEL_END_FLIRT: {
          lines: [{ speaker: "Seraphel", text: "Bring me something with context. Or at least bring yourself back with your context intact." }],
          end: true,
        },
      },
    },
    "expedition-board": {
      npcId: "expedition-board",
      start: "NELLA_HUB",
      end: "NELLA_END",
      flirtEnd: "NELLA_END_FLIRT",
      preserveVisit: true,
      returnToVisitOnClose: true,
      portraitCaption: "Expedition Clerk",
      topicTitle: "Ask Nella",
      backLabel: "Back up a line.",
      topicsLabel: "Another form.",
      leaveLabel: "That is all.",
      nodes: {
        NELLA_HUB: {
          lines: [
            { speaker: "Nella", text: "If you are reporting a completed route, use the left ledger. If you are reporting a missing party, use the red ledger. If you are about to call getting lost scouting, use the door." },
            { type: "stage", text: "She looks up from a map covered in pins." },
            { speaker: "Nella", text: "Name, destination, and whether anyone is currently on fire." },
          ],
          options: [
            ["NELLA_BOARD_01", "What does the Expedition Board do?"],
            ["NELLA_DUNGEON_01", "Any dungeon contracts?"],
            ["NELLA_SUPPLY_01", "Any supply turn-ins?"],
            ["NELLA_ROADS_01", "Tell me about roads and maps."],
            ["NELLA_MISSING_01", "Any missing parties?"],
            ["NELLA_LIFE_01", "Tell me about yourself."],
            ["NELLA_FLIRT_01", "You run this place like a battlefield."],
            { id: "NELLA_FAMILIAR_01", label: "Teach me proper route notes.", ifFriendshipAtLeast: 5 },
            { id: "NELLA_TRUSTED_01", label: "What goes in the red ledger?", ifFriendshipAtLeast: 15 },
            { id: "NELLA_CLOSE_01", label: "What route still bothers you?", ifFriendshipAtLeast: 25 },
            { id: "NELLA_DEAR_01", label: "Trust me with the hard map.", ifFriendshipAtLeast: 40 },
          ],
        },
        NELLA_BOARD_01: {
          prompt: "What does the Expedition Board do?",
          lines: [
            { speaker: "Nella", text: "We turn wandering into routes, panic into reports, and heroic exaggeration into usable data. The Board tracks roads, dungeon clearances, supply needs, missing parties, bridge damage, map errors, and adventurers who forget that someone has to know where they died." },
          ],
          options: [
            ["NELLA_BOARD_02", "So you manage quests?"],
            ["NELLA_BOARD_03", "Why all the paperwork?"],
            ["BOARD", "Open Expedition Board."],
          ],
        },
        NELLA_BOARD_02: {
          prompt: "So you manage quests?",
          lines: [
            { speaker: "Nella", text: "No. I manage consequences. A dungeon cleared means a road may reopen. A missing scout means a caravan waits. A wrong map means three people freeze in a ditch. Your quest is someone else's logistics." },
          ],
          options: [["BOARD", "Open Expedition Board."]],
        },
        NELLA_BOARD_03: {
          prompt: "Why all the paperwork?",
          lines: [
            { speaker: "Nella", text: "Because memory lies and blood washes off boots. Paper says who went where, with what supplies, for what reason, and when we should start worrying." },
          ],
          options: [["BOARD", "Open Expedition Board."]],
        },
        NELLA_DUNGEON_01: {
          prompt: "Any dungeon contracts?",
          lines: [
            { speaker: "Nella", text: "Yes. Scout, clear, map, recover proof, mark hazards, confirm boss kills, retrieve lost packs, and stop writing spooky as a room description. Completion pays better when completion is documented." },
          ],
          options: [
            ["NELLA_DUNGEON_02", "What counts as completed?"],
            ["NELLA_DUNGEON_03", "What proof do you need?"],
            ["BOARD", "Open dungeon contracts."],
          ],
        },
        NELLA_DUNGEON_02: {
          prompt: "What counts as completed?",
          lines: [
            { speaker: "Nella", text: "Objective met. Main threat handled. Exit confirmed. Hazards marked. Survivors accounted for. Looting optional, despite what adventurers seem to believe. If the place is still screaming, it is not complete." },
          ],
        },
        NELLA_DUNGEON_03: {
          prompt: "What proof do you need?",
          lines: [
            { speaker: "Nella", text: "Map notes, marked tokens, enemy proof, recovered contract item, route confirmation, or witness statements from someone not trying to sell me a ballad. Sketches help. Accurate sketches help more." },
          ],
        },
        NELLA_SUPPLY_01: {
          prompt: "Any supply turn-ins?",
          lines: [
            { speaker: "Nella", text: "Always. Torches, oil, rope, repair stock, field rations, spare canvas, and the deeply unromantic things that keep people alive long enough to be interesting." },
          ],
          options: [["BOARD", "Open supply turn-ins."]],
        },
        NELLA_ROADS_01: {
          prompt: "Tell me about roads and maps.",
          lines: [
            { speaker: "Nella", text: "A road is a promise with mud on it. A map is a promise that admits it might be wrong. Bring me routes that wagons can survive and notes honest enough to correct the next fool." },
          ],
        },
        NELLA_MISSING_01: {
          prompt: "Any missing parties?",
          lines: [
            { speaker: "Nella", text: "There are always missing parties. Some are delayed. Some are lost. Some are dead. The trick is not pretending those are the same ledger entry." },
          ],
        },
        NELLA_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Nella", text: "Nella Waymark. I used to scout routes. Then I learned more people survive when someone competent stays behind with ink and a temper." },
          ],
        },
        NELLA_FLIRT_01: {
          prompt: "You run this place like a battlefield.",
          lines: [
            { speaker: "Nella", text: "Because it is one. The enemy is confusion, weather, distance, and optimism without supplies." },
            { type: "stage", text: "A small smile appears." },
            { speaker: "Nella", text: "Competence is attractive. Prove some." },
          ],
        },
        NELLA_FAMILIAR_01: {
          prompt: "Teach me proper route notes.",
          action: "NELLA_ROUTE_NOTES_ACCEPT",
          lines: [
            { speaker: "Nella", text: "Proper route notes are written for tired people in rain, not for bards." },
            { speaker: "Nella", text: "Distance, landmarks, water, shelter, hazards, broken bridges, suspicious quiet, and where the mud becomes personal. If you write 'safe enough,' I will make you define enough." },
            { speaker: "Nella", text: "Bring repair stock and basic route supplies. I will show you how to turn wandering into information another party can survive." },
          ],
        },
        NELLA_TRUSTED_01: {
          prompt: "What goes in the red ledger?",
          action: "NELLA_RED_LEDGER_ACCEPT",
          lines: [
            { speaker: "Nella", text: "The names of people who may not come back." },
            { speaker: "Nella", text: "Last route, last supplies, last weather, last witness, last stupid decision if known. The red ledger is not dramatic. Drama wastes time." },
            { speaker: "Nella", text: "Bring rations, light, and salvageable field gear. Missing-party searches fail when the searchers become a second entry." },
          ],
        },
        NELLA_CLOSE_01: {
          prompt: "What route still bothers you?",
          action: "NELLA_MILEPOST_CACHE_ACCEPT",
          lines: [
            { speaker: "Nella", text: "The one with two correct maps that disagree." },
            { speaker: "Nella", text: "Both scouts were competent. Both returned shaken. One marked a ford. One marked a sinkhole. Same mile, same day, no flood." },
            { speaker: "Nella", text: "I need prepared road materials and field stock for a cache. If the land is lying, I want supplies waiting where the lie begins." },
          ],
        },
        NELLA_DEAR_01: {
          prompt: "Trust me with the hard map.",
          action: "NELLA_WAYMARK_CHARTER_ACCEPT",
          lines: [
            { speaker: "Nella", text: "Hard maps do not show where roads are. They show where people will die if no one builds one." },
            { speaker: "Nella", text: "I do not hand those routes to heroes. Heroes chase symbols. I hand them to people who come back with corrections." },
            { speaker: "Nella", text: "Bring enough road kits and repair stock for a serious charter. Then I will mark a route under your name and expect you to deserve the ink." },
          ],
        },
        NELLA_END: {
          lines: [{ speaker: "Nella", text: "Take a map. Mark your route. If you get lost, at least have the decency to learn something." }],
          end: true,
        },
        NELLA_END_FLIRT: {
          lines: [{ speaker: "Nella", text: "Come back with accurate notes. I am embarrassingly fond of useful people." }],
          end: true,
        },
      },
    },
    "fighting-pit": {
      npcId: "fighting-pit",
      start: "BRAKKA_HUB",
      end: "BRAKKA_END",
      flirtEnd: "BRAKKA_END_FLIRT",
      preserveVisit: true,
      returnToVisitOnClose: true,
      boardNpcId: "fighting-pit",
      portraitCaption: "Pit Marshal of the Fighting Pit",
      topicTitle: "Ask Brakka",
      backLabel: "Step back.",
      topicsLabel: "Another bout of questions.",
      leaveLabel: "That is all.",
      nodes: {
        BRAKKA_HUB: {
          lines: [
            { speaker: "Brakka", text: "Step clear of the gate unless you're entering. Blood on the sand is fine. Blood in the queue is bad management." },
            { type: "stage", text: "She folds her arms, iron bracelets clinking." },
            { speaker: "Brakka", text: "I'm Brakka Ironbell, Pit Marshal. You want coin, renown, bruises, or all three?" },
          ],
          options: [
            ["BRAKKA_PIT_01", "What is the Fighting Pit?"],
            ["BRAKKA_FIGHT_01", "Can I enter a fight?"],
            ["BRAKKA_RULES_01", "What are the rules?"],
            ["BRAKKA_RENOWN_01", "What is renown worth?"],
            ["BRAKKA_SPORT_01", "What separates sport from murder?"],
            ["BRAKKA_LIFE_01", "Tell me about yourself."],
            ["BRAKKA_FLIRT_01", "You look like you could throw me through that gate."],
            { id: "BRAKKA_FAMILIAR_01", label: "Teach me footwork.", ifFriendshipAtLeast: 5 },
            { id: "BRAKKA_TRUSTED_01", label: "What do you need for clean bouts?", ifFriendshipAtLeast: 15 },
            { id: "BRAKKA_CLOSE_01", label: "What fight still follows you?", ifFriendshipAtLeast: 25 },
            { id: "BRAKKA_DEAR_01", label: "Train me like one of yours.", ifFriendshipAtLeast: 40 },
          ],
        },
        BRAKKA_PIT_01: {
          prompt: "What is the Fighting Pit?",
          lines: [
            { speaker: "Brakka", text: "A place where violence gets rules, witnesses, medics, and a bell." },
            { speaker: "Brakka", text: "Combat trials. Escalating waves. Champion bouts. Beast cages when the Trophy Lodge signs off. No back-alley stabbing. No unpaid grudges. No pretending a duel is a murder with nicer boots." },
          ],
          options: [
            ["BRAKKA_PIT_02", "So it is just entertainment?"],
            ["BRAKKA_PIT_03", "Who fights here?"],
            ["BOARD", "Open the Pit board."],
          ],
        },
        BRAKKA_PIT_02: {
          prompt: "So it is just entertainment?",
          lines: [
            { speaker: "Brakka", text: "Entertainment pays for sand, gates, healers, and burial cloth. But no, not just entertainment. The Pit teaches people what panic costs before a dungeon teaches them permanently." },
          ],
          options: [["BOARD", "Open the Pit board."]],
        },
        BRAKKA_PIT_03: {
          prompt: "Who fights here?",
          lines: [
            { speaker: "Brakka", text: "Adventurers, caravan guards, sellswords, militia hopefuls, fools with rent due, champions with names to defend, and the occasional noble who thinks pain respects bloodline." },
            { speaker: "Brakka", text: "Pain does not." },
          ],
          options: [["BOARD", "Open the Pit board."]],
        },
        BRAKKA_FIGHT_01: {
          prompt: "Can I enter a fight?",
          lines: [
            { speaker: "Brakka", text: "If you can sign your name, stand without wobbling, and understand the word yield, yes. We run waves. Start simple, escalate clean. Win, and you earn coin and renown. Lose, and you earn humility if the medics are quick." },
          ],
          options: [
            ["BRAKKA_FIGHT_02", "How do waves work?"],
            ["BRAKKA_FIGHT_03", "What if I yield?"],
            ["BOARD", "Enter a fight."],
          ],
        },
        BRAKKA_FIGHT_02: {
          prompt: "How do waves work?",
          lines: [
            { speaker: "Brakka", text: "First wave tests your feet. Second tests your breathing. Third tests whether you know when not to chase. Higher ranks add beasts, shield-breakers, spell hazards, mixed enemies, and champions who enjoy correcting arrogance." },
          ],
          options: [["BOARD", "Enter a fight."]],
        },
        BRAKKA_FIGHT_03: {
          prompt: "What if I yield?",
          lines: [
            { speaker: "Brakka", text: "Then you live and some drunk in the stands complains until I stare at him. Yielding before death is not cowardice. Yielding before effort is. Learn the difference." },
          ],
          options: [["BOARD", "Enter a fight."]],
        },
        BRAKKA_RULES_01: {
          prompt: "What are the rules?",
          lines: [
            { speaker: "Brakka", text: "No killing once a yield is given. No poisoned blades. No attacking medics. No hidden friends in the stands. No curses without declaration. No looting opponents unless the bout says so." },
            { speaker: "Brakka", text: "And if you bite, you had better be a wolf or ready to explain yourself." },
          ],
          options: [
            ["BRAKKA_RULES_02", "What happens if someone cheats?"],
            ["BRAKKA_RULES_03", "Why allow magic at all?"],
            ["BRAKKA_RULES_04", "Who enforces the rules?"],
          ],
        },
        BRAKKA_RULES_02: {
          prompt: "What happens if someone cheats?",
          lines: [
            { speaker: "Brakka", text: "First offense: disqualification, fine, public shame. Serious offense: banned. Murder disguised as sport: chains. The Pit has blood. It does not have excuses." },
          ],
        },
        BRAKKA_RULES_03: {
          prompt: "Why allow magic at all?",
          lines: [
            { speaker: "Brakka", text: "Because dungeons allow magic. We restrict, declare, and ward it. Fighters need to learn what a spellcaster looks like before one sets their beard on fire underground." },
          ],
        },
        BRAKKA_RULES_04: {
          prompt: "Who enforces the rules?",
          lines: [
            { speaker: "Brakka", text: "I do. My bell does. The ward-scribes do. The medics do. The crowd does, when properly terrified of me. When that rings, everyone stops. Anyone who doesn't becomes my personal exercise." },
          ],
        },
        BRAKKA_RENOWN_01: {
          prompt: "What is renown worth?",
          lines: [
            { speaker: "Brakka", text: "Access. Harder bouts. Better purses. Champion trials. Pit gear. Training rights. Sponsors. People remembering your name without needing to see your teeth first." },
          ],
          options: [
            ["BRAKKA_RENOWN_02", "How do I earn renown?"],
            ["BRAKKA_RENOWN_03", "Can renown be lost?"],
            ["BOARD", "Open renown rewards."],
          ],
        },
        BRAKKA_RENOWN_02: {
          prompt: "How do I earn renown?",
          lines: [
            { speaker: "Brakka", text: "Win clean. Fight fair. Take harder waves. Protect allies. Finish objectives. Respect yields. Do something brave enough that the crowd remembers and disciplined enough that I respect it." },
          ],
          options: [["BOARD", "Open renown rewards."]],
        },
        BRAKKA_RENOWN_03: {
          prompt: "Can renown be lost?",
          lines: [
            { speaker: "Brakka", text: "Fast. Cheat. Kill after yield. Endanger medics. Lie about a bout. Hurt someone outside the ring over ring business. The Pit remembers glory, but it remembers filth better." },
          ],
          options: [["BOARD", "Open renown rewards."]],
        },
        BRAKKA_SPORT_01: {
          prompt: "What separates sport from murder?",
          lines: [
            { speaker: "Brakka", text: "Consent, rules, witnesses, medics, and a way to stop. Take those away, and you are not fighting in my Pit. You are just hurting someone where I can see you." },
          ],
          options: [
            ["BRAKKA_SPORT_02", "Can violence be honorable?"],
            ["BRAKKA_SPORT_03", "Do you enjoy watching people fight?"],
            ["BRAKKA_SPORT_04", "What makes a good fighter?"],
          ],
        },
        BRAKKA_SPORT_02: {
          prompt: "Can violence be honorable?",
          lines: [
            { speaker: "Brakka", text: "Yes. Rarely by accident. Honor is control when anger wants the hand. It is stopping at the bell. It is helping an opponent stand after proving they could fall." },
          ],
        },
        BRAKKA_SPORT_03: {
          prompt: "Do you enjoy watching people fight?",
          lines: [
            { speaker: "Brakka", text: "I enjoy watching people improve. And yes, sometimes I enjoy watching someone arrogant get introduced to the floor. The floor is an excellent teacher." },
          ],
        },
        BRAKKA_SPORT_04: {
          prompt: "What makes a good fighter?",
          lines: [
            { speaker: "Brakka", text: "Discipline. Feet before hands. Breath before fury. Knowing when to press, when to guard, and when the bell has already saved you from your own pride." },
          ],
        },
        BRAKKA_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Brakka", text: "Brakka Ironbell. Pit Marshal, former shield-breaker, current keeper of rules that keep fools from becoming corpses too quickly." },
            { speaker: "Brakka", text: "I like fair fights, clean bells, honest bruises, and people who can lose without making it everyone else's problem." },
          ],
        },
        BRAKKA_FLIRT_01: {
          prompt: "You look like you could throw me through that gate.",
          lines: [
            { speaker: "Brakka", text: "I could." },
            { type: "stage", text: "She looks you up and down." },
            { speaker: "Brakka", text: "Question is whether you'd land well." },
          ],
          options: [
            ["BRAKKA_FLIRT_02", "Want to find out?"],
            ["BRAKKA_FLIRT_03", "I was hoping for training, not throwing."],
            ["BRAKKA_FLIRT_04", "You always this direct?"],
          ],
        },
        BRAKKA_FLIRT_02: {
          prompt: "Want to find out?",
          lines: [
            { speaker: "Brakka", text: "Careful. I like confidence, but I charge for arena damage. Still, you've got nerve. Nerve is useful if you attach discipline to it." },
          ],
        },
        BRAKKA_FLIRT_03: {
          prompt: "I was hoping for training, not throwing.",
          lines: [
            { speaker: "Brakka", text: "Training often starts with learning how not to be thrown. I can teach that. If you listen better than you posture." },
          ],
        },
        BRAKKA_FLIRT_04: {
          prompt: "You always this direct?",
          lines: [
            { speaker: "Brakka", text: "No. Sometimes I use the bell. With you, words may still work." },
          ],
        },
        BRAKKA_FAMILIAR_01: {
          prompt: "Teach me footwork.",
          action: "BRAKKA_FOOTWORK_ACCEPT",
          lines: [
            { speaker: "Brakka", text: "Good. Feet first. Hands lie when pride gets loud. Feet tell the truth." },
            { speaker: "Brakka", text: "A fighter who cannot step cannot choose. They only react, and reaction gets expensive when blades are involved." },
            { speaker: "Brakka", text: "Bring leather, cloth, or repair stock. I will mark practice straps and show you how not to trip over your own legend." },
          ],
        },
        BRAKKA_TRUSTED_01: {
          prompt: "What do you need for clean bouts?",
          action: "BRAKKA_CLEAN_BOUTS_ACCEPT",
          lines: [
            { speaker: "Brakka", text: "Rules people can feel before they remember them." },
            { speaker: "Brakka", text: "Blunted edges, proper wraps, water near the medics, sand without glass, and fighters who know the bell is not a suggestion." },
            { speaker: "Brakka", text: "Bring healing supplies and repair stock. Clean bouts are built before anyone swings." },
          ],
        },
        BRAKKA_CLOSE_01: {
          prompt: "What fight still follows you?",
          action: "BRAKKA_STOP_BELL_ACCEPT",
          lines: [
            { speaker: "Brakka", text: "The one I won too late." },
            { type: "stage", text: "Her hand rests on the iron bell at her belt." },
            { speaker: "Brakka", text: "Crowd was shouting. Blood in both ears. I did not hear the yield until the floor went quiet. Bring me metal and leather for stop-bell repairs. I keep every bell honest now." },
          ],
        },
        BRAKKA_DEAR_01: {
          prompt: "Train me like one of yours.",
          action: "BRAKKA_CHAMPION_WRAP_ACCEPT",
          lines: [
            { speaker: "Brakka", text: "That means no applause lessons." },
            { speaker: "Brakka", text: "I will teach guard when tired, mercy when angry, and how to stand after the crowd has already decided who you are." },
            { speaker: "Brakka", text: "Bring proper materials for champion wraps. If I put my mark on them, you carry my rules when I am not there to ring the bell." },
          ],
        },
        BRAKKA_END: {
          lines: [{ speaker: "Brakka", text: "Keep your guard high and your pride low. Both save teeth." }],
          end: true,
        },
        BRAKKA_END_FLIRT: {
          lines: [{ speaker: "Brakka", text: "Come back if you want a bout, a lesson, or another chance to stand too close to trouble." }],
          end: true,
        },
      },
    },
    arcanist: {
      npcId: "arcanist",
      start: "SARTHAX_HUB",
      end: "SARTHAX_END",
      flirtEnd: "SARTHAX_END_FLIRT",
      shopNpcId: "arcanist",
      portraitCaption: "Master Arcanist",
      topicTitle: "Ask Sarthax",
      backLabel: "Return to the prior point.",
      topicsLabel: "Another precise question.",
      leaveLabel: "Goodbye.",
      nodes: {
        SARTHAX_HUB: {
          lines: [
            { speaker: "Sarthax", text: "Do not touch the scrolls. Do not lean over the ink. Do not ask whether I buy random magic junk. I do not." },
            { type: "stage", text: "The crimson dragonborn lowers his gaze to you." },
            { speaker: "Sarthax", text: "I am Sarthax Veyrune, Master Arcanist. If you require spellwork, speak precisely. If you require bargaining, leave bravely." },
          ],
          options: [
            ["SARTHAX_SHOP_01", "What do you sell?"],
            ["SARTHAX_PRICES_01", "Why are your prices so high?"],
            ["SARTHAX_SCROLLCRAFT_01", "Tell me about scrollcraft."],
            ["SARTHAX_POWER_01", "Can you teach me about controlled power?"],
            ["SARTHAX_BUY_01", "Do you buy magical goods?"],
            ["SARTHAX_LIFE_01", "Tell me about yourself."],
            ["SARTHAX_FLIRT_01", "You are very intense."],
            { id: "SARTHAX_FAMILIAR_01", label: "Teach me proper scroll handling.", ifFriendshipAtLeast: 5 },
            { id: "SARTHAX_TRUSTED_01", label: "What work requires exact hands?", ifFriendshipAtLeast: 15 },
            { id: "SARTHAX_CLOSE_01", label: "What formula still vexes you?", ifFriendshipAtLeast: 25 },
            { id: "SARTHAX_DEAR_01", label: "Trust me with a controlled consequence.", ifFriendshipAtLeast: 40 },
          ],
        },
        SARTHAX_SHOP_01: {
          prompt: "What do you sell?",
          lines: [
            { speaker: "Sarthax", text: "Spell scrolls of verified structure, properly dried magical inks, sealed scroll cases, copying vellum, binding dust, and limited arcane instruments." },
            { speaker: "Sarthax", text: "Nothing here is cheap. Cheap scrolls kill the reader first and the target second, if one is lucky." },
          ],
          options: [
            ["SARTHAX_SHOP_02", "What scrolls should I buy?"],
            ["SARTHAX_SHOP_03", "Do you sell combat magic?"],
            ["SHOP", "Open scroll shop."],
          ],
        },
        SARTHAX_SHOP_02: {
          prompt: "What scrolls should I buy?",
          lines: [
            { speaker: "Sarthax", text: "The one you can cast correctly under fear. Utility scrolls save expeditions. Defensive scrolls save lives. Offensive scrolls save time, provided the caster understands distance, timing, and not standing in the consequence." },
          ],
          options: [["SHOP", "Open scroll shop."]],
        },
        SARTHAX_SHOP_03: {
          prompt: "Do you sell combat magic?",
          lines: [
            { speaker: "Sarthax", text: "Yes. Carefully. Fire, force, warding, binding, disruption, countermeasures. I refuse to sell certain scrolls to those who cannot describe what they do without making explosion gestures." },
          ],
          options: [["SHOP", "Open scroll shop."]],
        },
        SARTHAX_PRICES_01: {
          prompt: "Why are your prices so high?",
          lines: [
            { speaker: "Sarthax", text: "Because errors in scrollcraft are paid for in ash, blindness, dimensional embarrassment, and lawsuits from relatives. You are not buying paper. You are buying controlled consequence." },
          ],
          options: [
            ["SARTHAX_PRICES_02", "Can you lower them?"],
            ["SARTHAX_PRICES_03", "What makes a scroll expensive?"],
            ["SHOP", "Open scroll shop."],
          ],
        },
        SARTHAX_PRICES_02: {
          prompt: "Can you lower them?",
          lines: [
            { speaker: "Sarthax", text: "No. I can lower quality, safety, or my opinion of the buyer. Only one of those is currently negotiable, and it is already happening." },
          ],
        },
        SARTHAX_PRICES_03: {
          prompt: "What makes a scroll expensive?",
          lines: [
            { speaker: "Sarthax", text: "Ink purity, vellum preparation, spell complexity, containment geometry, drying time, failure testing, and the fact that a proper arcanist values his fingers." },
          ],
        },
        SARTHAX_SCROLLCRAFT_01: {
          prompt: "Tell me about scrollcraft.",
          lines: [
            { speaker: "Sarthax", text: "Scrollcraft is spell architecture under constraint. Every line carries intent. Every circle controls pressure. Every smudge is a future apology if one is careless." },
          ],
          options: [
            ["SARTHAX_SCROLLCRAFT_02", "Why do scrolls fail?"],
            ["SARTHAX_SCROLLCRAFT_03", "Can anyone use one?"],
            ["SHOP", "Open scroll shop."],
          ],
        },
        SARTHAX_SCROLLCRAFT_02: {
          prompt: "Why do scrolls fail?",
          lines: [
            { speaker: "Sarthax", text: "Bad ink, damp storage, clumsy activation, copied errors, arrogance, panic, and people reading aloud while upside down. That last one is rarer than it should be." },
          ],
        },
        SARTHAX_SCROLLCRAFT_03: {
          prompt: "Can anyone use one?",
          lines: [
            { speaker: "Sarthax", text: "Anyone can try. Success is a narrower category. Literacy, discipline, and a basic respect for magical notation improve the odds considerably." },
          ],
        },
        SARTHAX_POWER_01: {
          prompt: "Can you teach me about controlled power?",
          lines: [
            { speaker: "Sarthax", text: "Power without control is merely weather with opinions. Control begins before casting: preparation, position, target, escape route, and knowing what the spell refuses to do." },
          ],
          options: [
            ["SARTHAX_POWER_02", "What is the first lesson?"],
            ["SARTHAX_POWER_03", "What do sloppy casters get wrong?"],
          ],
        },
        SARTHAX_POWER_02: {
          prompt: "What is the first lesson?",
          lines: [
            { speaker: "Sarthax", text: "Aim is not the first lesson. Restraint is. A spell not cast at the wrong moment is often the most powerful spell in the room." },
          ],
        },
        SARTHAX_POWER_03: {
          prompt: "What do sloppy casters get wrong?",
          lines: [
            { speaker: "Sarthax", text: "They confuse volume with mastery. Fire is not improved by surprise. Force is not improved by panic. Magic rewards clarity and punishes theatrical stupidity." },
          ],
        },
        SARTHAX_BUY_01: {
          prompt: "Do you buy magical goods?",
          lines: [
            { speaker: "Sarthax", text: "No. I sell expertise and scrollcraft. I do not run a pawn counter for glowing curiosities, cursed heirlooms, or objects whose owners say it is probably valuable." },
          ],
          options: [
            ["SARTHAX_BUY_02", "Why not?"],
            ["SARTHAX_BUY_03", "Who should buy them?"],
            ["SARTHAX_BUY_04", "Can you at least identify them?"],
          ],
        },
        SARTHAX_BUY_02: {
          prompt: "Why not?",
          lines: [
            { speaker: "Sarthax", text: "Because provenance matters, curses hide, and adventurers overestimate both sentimental value and market demand. I prefer inventory that does not lie back." },
          ],
        },
        SARTHAX_BUY_03: {
          prompt: "Who should buy them?",
          lines: [
            { speaker: "Sarthax", text: "A collector, an antiquarian, a specialist, or an enemy you dislike. I recommend the first three." },
          ],
        },
        SARTHAX_BUY_04: {
          prompt: "Can you at least identify them?",
          lines: [
            { speaker: "Sarthax", text: "Perhaps. For a fee. Identification is expertise, not gossip. But understand this: identification is not an offer to purchase. Do not confuse knowledge with appetite." },
          ],
        },
        SARTHAX_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Sarthax", text: "Sarthax Veyrune. Master Arcanist. Scrollwright. Keeper of controlled formulae. Formerly of institutions that mistook committee caution for intellectual rigor." },
            { speaker: "Sarthax", text: "I now sell magic to those who can afford not to misuse it." },
          ],
          options: [
            ["SARTHAX_LIFE_02", "Why scrolls?"],
            ["SARTHAX_LIFE_03", "Why leave those institutions?"],
            ["SARTHAX_LIFE_04", "Do you enjoy village life?"],
          ],
        },
        SARTHAX_LIFE_02: {
          prompt: "Why scrolls?",
          lines: [
            { speaker: "Sarthax", text: "Because scrolls are disciplined magic. A spell in the mind can be altered by panic. A scroll, properly made, holds its structure until the exact moment of release." },
          ],
        },
        SARTHAX_LIFE_03: {
          prompt: "Why leave those institutions?",
          lines: [
            { speaker: "Sarthax", text: "Because I tired of asking permission from people whose greatest spell was delay. Caution is valuable. Cowardice wearing spectacles is not." },
          ],
        },
        SARTHAX_LIFE_04: {
          prompt: "Do you enjoy village life?",
          lines: [
            { speaker: "Sarthax", text: "Enjoy is imprecise. The village is noisy, undereducated, vulnerable, and occasionally sincere. It also allows me to work without a dean breathing on my margins. Acceptable." },
          ],
        },
        SARTHAX_FLIRT_01: {
          prompt: "You are very intense.",
          lines: [
            { speaker: "Sarthax", text: "An imprecise observation, but not an incorrect one." },
            { type: "stage", text: "His eyes narrow with measured interest." },
            { speaker: "Sarthax", text: "Does intensity trouble you?" },
          ],
          options: [
            ["SARTHAX_FLIRT_02", "No. I like it."],
            ["SARTHAX_FLIRT_03", "Only when it is aimed at me."],
            ["SARTHAX_FLIRT_04", "You make arrogance look elegant."],
          ],
        },
        SARTHAX_FLIRT_02: {
          prompt: "No. I like it.",
          lines: [
            { speaker: "Sarthax", text: "Then you have either taste or poor survival instinct. Possibly both. Interesting combinations are rarely inexpensive." },
          ],
        },
        SARTHAX_FLIRT_03: {
          prompt: "Only when it is aimed at me.",
          lines: [
            { speaker: "Sarthax", text: "Then stand still. Moving targets are harder to evaluate." },
          ],
        },
        SARTHAX_FLIRT_04: {
          prompt: "You make arrogance look elegant.",
          lines: [
            { speaker: "Sarthax", text: "Arrogance is confidence without accounting. I account for everything. But I will accept elegant." },
          ],
        },
        SARTHAX_FAMILIAR_01: {
          prompt: "Teach me proper scroll handling.",
          action: "SARTHAX_SCROLL_HANDLING_ACCEPT",
          lines: [
            { speaker: "Sarthax", text: "At last, a request that does not begin with a discount. Scrolls die from damp, heat, folded corners, careless hands, and dramatic fools who wave them while shouting." },
            { speaker: "Sarthax", text: "Bring me clean arcane practice materials. I will prepare a handling set and teach you enough not to ruin what you buy from me." },
          ],
        },
        SARTHAX_TRUSTED_01: {
          prompt: "What work requires exact hands?",
          action: "SARTHAX_INK_PURITY_ACCEPT",
          lines: [
            { speaker: "Sarthax", text: "Ink purity. Everyone praises the spell. No one praises the hour spent keeping one grain of ash from turning teleportation into a cautionary mural." },
            { speaker: "Sarthax", text: "Find crystal, reagent, or alchemical stock clean enough to test. If it passes, I will mark you as useful. Temporarily. Do not become proud." },
          ],
        },
        SARTHAX_CLOSE_01: {
          prompt: "What formula still vexes you?",
          action: "SARTHAX_CONTAINMENT_GEOMETRY_ACCEPT",
          lines: [
            { speaker: "Sarthax", text: "A containment geometry for pressure magic. The structure holds beautifully until stressed, then behaves like a scholar denied funding." },
            { speaker: "Sarthax", text: "Bring materials that remember strain: pressure cores, crystal, gears, arcane fittings. I will build the test. You will stand behind the marked line." },
          ],
        },
        SARTHAX_DEAR_01: {
          prompt: "Trust me with a controlled consequence.",
          action: "SARTHAX_CONTROLLED_CONSEQUENCE_ACCEPT",
          lines: [
            { type: "stage", text: "Sarthax studies you for a long moment, then locks the nearest scroll case." },
            { speaker: "Sarthax", text: "Trust is not sentiment. It is repeated evidence surviving contact with risk. You have provided some." },
            { speaker: "Sarthax", text: "Bring high-grade arcane materials. I will let you assist with a controlled consequence script. If it works, you may carry a copy. If it fails, we will both deny choosing the name." },
          ],
        },
        SARTHAX_END: {
          lines: [{ speaker: "Sarthax", text: "Store scrolls dry, cast with intent, and do not bring me objects you merely hope are valuable." }],
          end: true,
        },
        SARTHAX_END_FLIRT: {
          lines: [{ speaker: "Sarthax", text: "Return when you require power, precision, or conversation conducted without fumbling." }],
          end: true,
        },
      },
    },
    alchemist: {
      npcId: "alchemist",
      start: () => (state?.questFlags?.knowsBoomClub ? "FIZZ_HUB_CLUB" : "FIZZ_HUB_NORMAL"),
      end: () => (state?.questFlags?.knowsBoomClub ? "FIZZ_END_CLUB" : "FIZZ_END_NORMAL"),
      boardNpcId: "boom-club",
      shopNpcId: "alchemist",
      portraitCaption: "Master of Volatile Solutions",
      topicTitle: "Ask Fizzwick",
      backLabel: "Back away carefully.",
      topicsLabel: "Another volatile question.",
      leaveLabel: "Goodbye.",
      shopLabel: "Open the shop.",
      nodes: {
        FIZZ_HUB_NORMAL: {
          lines: [
            { speaker: "Fizzwick", text: "Ah! Visitor! Stand there. No, one inch left. Perfect. That patch of floor has only exploded once." },
            { speaker: "Fizzwick", text: "Fizzwick Boomwhistle. Inventor, reagent enthusiast, and survivor of several misunderstandings with pressure." },
          ],
          options: [
            ["FIZZ_WORK_01", "What do you do here?"],
            ["FIZZ_SAFE_01", "Are those experiments safe?"],
            ["FIZZ_BUILD_01", "What are you building?"],
            ["FIZZ_SHOP_NORMAL_01", "Do you sell anything?"],
            ["FIZZ_LIFE_01", "Tell me about yourself."],
            ["FIZZ_FLIRT_NORMAL_01", "You have a certain dangerous charm."],
            { id: "FIZZ_JOIN_CLUB", label: "I want to join the Boom Club.", ifFlag: "knowsBoomClub", unlessFlag: "flag.village.boomClubUnlocked" },
            { id: "FIZZ_FAMILIAR_01", label: "Give me an experiment that leaves the building standing.", ifFriendshipAtLeast: 5 },
            { id: "FIZZ_TRUSTED_01", label: "What is the Boom Club really for?", ifFriendshipAtLeast: 15 },
            { id: "FIZZ_CLOSE_01", label: "What blew up before?", ifFriendshipAtLeast: 25 },
            { id: "FIZZ_DEAR_01", label: "Build us something only you would dare make.", ifFriendshipAtLeast: 40 },
          ],
        },
        FIZZ_HUB_CLUB: {
          lines: [
            { speaker: "Fizzwick", text: "Welcome adjacent to the club! Goggles are encouraged, paperwork is inevitable, and scorch marks are only embarrassing if unlabeled." },
          ],
          options: [
            ["FIZZ_CLUB_01", "Tell me about the Boom Club."],
            { id: "FIZZ_JOIN_CLUB", label: "I want to join the Boom Club.", unlessFlag: "flag.village.boomClubUnlocked" },
            { id: "BOARD", label: "Open the Boom Club board.", ifFlag: "flag.village.boomClubUnlocked" },
            ["FIZZ_RANKS_01", "What are the club ranks?"],
            ["FIZZ_EXPERIMENTS_01", "Got any experiments?"],
            ["FIZZ_VOLATILES_01", "What volatile materials do you need?"],
            ["FIZZ_SHOP_CLUB_01", "What do you sell now?"],
            ["FIZZ_LIFE_01", "Tell me about yourself."],
            { id: "FIZZ_FAMILIAR_01", label: "Give me an experiment that leaves the building standing.", ifFriendshipAtLeast: 5 },
            { id: "FIZZ_TRUSTED_01", label: "What is the Boom Club really for?", ifFriendshipAtLeast: 15 },
            { id: "FIZZ_CLOSE_01", label: "What blew up before?", ifFriendshipAtLeast: 25 },
            { id: "FIZZ_DEAR_01", label: "Build us something only you would dare make.", ifFriendshipAtLeast: 40 },
          ],
        },
        FIZZ_WORK_01: {
          prompt: "What do you do here?",
          action: "DISCOVER_BOOM_CLUB",
          lines: [
            { speaker: "Fizzwick", text: "I convert suspicious materials into controlled usefulness. Coal, brimstone, fire salts, pressure cores, unstable gears, infernal glass, bottled heat, reluctant smoke. That sort of thing." },
            { type: "stage", text: "A green spark pops behind him. He leans closer." },
            { speaker: "Fizzwick", text: "Also, unofficially, I founded a club." },
          ],
          options: [
            ["FIZZ_WORK_02", "A club?"],
            ["FIZZ_WORK_03", "Controlled usefulness?"],
            { id: "FIZZ_JOIN_CLUB", label: "I want to join the Boom Club.", unlessFlag: "flag.village.boomClubUnlocked" },
          ],
        },
        FIZZ_WORK_02: {
          prompt: "A club?",
          action: "DISCOVER_BOOM_CLUB",
          lines: [
            { speaker: "Fizzwick", text: "Fizzwick's Boom Club! The first rule is goggles. The second rule is still goggles, but louder. We accept volatile errands, reagent tests, field observations, and all materials that make sensible people step backward." },
          ],
          options: [{ id: "FIZZ_JOIN_CLUB", label: "I want to join the Boom Club.", unlessFlag: "flag.village.boomClubUnlocked" }],
        },
        FIZZ_WORK_03: {
          prompt: "Controlled usefulness?",
          lines: [
            { speaker: "Fizzwick", text: "Yes! An explosion in a pantry is tragedy. An explosion in the correct direction, at the correct wall, after the correct countdown, is engineering. Usually." },
          ],
        },
        FIZZ_SAFE_01: {
          prompt: "Are those experiments safe?",
          lines: [
            { speaker: "Fizzwick", text: "Compared to what? Compared to soup? No. Compared to dragon bile in a clay jar? Very. Compared to my early career? Astonishingly safe." },
          ],
          options: [
            ["FIZZ_SAFE_02", "What was your early career like?"],
            ["FIZZ_SAFE_03", "Should I wear goggles?"],
            ["FIZZ_SAFE_04", "You have a club, don't you?"],
          ],
        },
        FIZZ_SAFE_02: {
          prompt: "What was your early career like?",
          lines: [
            { speaker: "Fizzwick", text: "Educational! Briefly airborne. Twice on fire. Once legally a weather event. I learned many things, including the importance of distance and assistants who can count down properly." },
          ],
        },
        FIZZ_SAFE_03: {
          prompt: "Should I wear goggles?",
          lines: [
            { speaker: "Fizzwick", text: "Yes. For chemistry, for combat, for chopping onions, for emotional stability. Goggles say: I respect my eyes and mistrust the room." },
          ],
        },
        FIZZ_SAFE_04: {
          prompt: "You have a club, don't you?",
          action: "DISCOVER_BOOM_CLUB",
          lines: [
            { speaker: "Fizzwick", text: "Possibly! Officially, a research club. Unofficially, also a research club, but with better punctuation and more distant observers." },
          ],
          options: [{ id: "FIZZ_JOIN_CLUB", label: "I want to join the Boom Club.", unlessFlag: "flag.village.boomClubUnlocked" }],
        },
        FIZZ_BUILD_01: {
          prompt: "What are you building?",
          lines: [
            { speaker: "Fizzwick", text: "Currently? A pressure-stable reagent casing, a directional wall-opener, a self-warning flask, and a shelf that ducks." },
            { type: "stage", text: "A shelf behind him twitches." },
            { speaker: "Fizzwick", text: "That last one is nearly emotionally ready." },
          ],
          options: [
            ["FIZZ_BUILD_02", "What is a wall-opener?"],
            ["FIZZ_BUILD_03", "What is a self-warning flask?"],
            ["FIZZ_BUILD_04", "Is this for your club?"],
          ],
        },
        FIZZ_BUILD_02: {
          prompt: "What is a wall-opener?",
          lines: [
            { speaker: "Fizzwick", text: "A tool for turning inconvenient stone into negotiable gravel. Not for doors. Doors are already a technology. This is for walls that have become arrogant." },
          ],
        },
        FIZZ_BUILD_03: {
          prompt: "What is a self-warning flask?",
          lines: [
            { speaker: "Fizzwick", text: "A flask that screams before it fails. Early versions screamed after failing, which was still informative but considerably less helpful." },
          ],
        },
        FIZZ_BUILD_04: {
          prompt: "Is this for your club?",
          action: "DISCOVER_BOOM_CLUB",
          lines: [
            { speaker: "Fizzwick", text: "Some of it! Club members test devices, recover volatile samples, and help me prove which ideas are brilliant before the council proves they are forbidden." },
          ],
          options: [{ id: "FIZZ_JOIN_CLUB", label: "I want to join the Boom Club.", unlessFlag: "flag.village.boomClubUnlocked" }],
        },
        FIZZ_SHOP_NORMAL_01: {
          prompt: "Do you sell anything?",
          lines: [
            { speaker: "Fizzwick", text: "Potions, alchemist's fire, bottles that should remain stoppered, and practical liquids for impractical people." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        FIZZ_CLUB_01: {
          prompt: "Tell me about the Boom Club.",
          action: "DISCOVER_BOOM_CLUB",
          lines: [
            { speaker: "Fizzwick", text: "Members bring volatile samples, test experimental devices, and earn reputation. Reputation unlocks better errands, better tools, and less suspicious shop access." },
          ],
          options: [
            ["FIZZ_CLUB_02", "Is this legal?"],
            ["FIZZ_CLUB_03", "What do members do?"],
            { id: "BOARD", label: "Open Boom Club page.", ifFlag: "flag.village.boomClubUnlocked" },
            { id: "FIZZ_JOIN_CLUB", label: "I want to join the Boom Club.", unlessFlag: "flag.village.boomClubUnlocked" },
          ],
        },
        FIZZ_CLUB_02: {
          prompt: "Is this legal?",
          lines: [
            { speaker: "Fizzwick", text: "In several interpretations! We are not a bomb cult, not a siege guild, not a fire cult, and only temporarily a noise problem." },
          ],
        },
        FIZZ_CLUB_03: {
          prompt: "What do members do?",
          lines: [
            { speaker: "Fizzwick", text: "Collect samples, recover pressure parts, test devices, report unexpected smoke colors, and bring me anything that makes sensible people step backward. Not cursed dolls. That was a Gravebinder misunderstanding." },
          ],
        },
        FIZZ_JOINED_01: {
          prompt: "I want to join the Boom Club.",
          lines: [
            { speaker: "Fizzwick", text: "Splendid! Stand behind the yellow line, sign nothing while smoking, and accept these provisional goggles. You are now club-adjacent in the formal sense." },
          ],
          options: [
            ["FIZZ_HUB_CLUB", "Back to normal questions."],
            ["BOARD", "Open the Boom Club board."],
          ],
        },
        FIZZ_RANKS_01: {
          prompt: "What are the club ranks?",
          lines: [
            { speaker: "Fizzwick", text: "Observer, Fuse Holder, Certified Spark, Blast Fellow, and Honorary Crater. Each rank proves you can handle more interesting materials without turning the village into a cautionary crater." },
          ],
          options: [
            ["FIZZ_RANKS_02", "What does ranking up give me?"],
            ["FIZZ_RANKS_03", "Honorary Crater?"],
            { id: "BOARD", label: "Open Boom Club page.", ifFlag: "flag.village.boomClubUnlocked" },
          ],
        },
        FIZZ_RANKS_02: {
          prompt: "What does ranking up give me?",
          lines: [
            { speaker: "Fizzwick", text: "More shop access. Better experimental tools. More potent magic-adjacent devices. Stronger volatile reagents. Rank is trust. Trust is access. Access is carefully labeled danger." },
          ],
        },
        FIZZ_RANKS_03: {
          prompt: "Honorary Crater?",
          lines: [
            { speaker: "Fizzwick", text: "The highest rank. Not because you make craters. Because you understand why not to. Power is not the size of the boom. Power is knowing where the boom belongs." },
          ],
        },
        FIZZ_EXPERIMENTS_01: {
          prompt: "Got any experiments?",
          lines: [
            { speaker: "Fizzwick", text: "Yes! Field tests, inventory recovery, pressure studies, regret reduction, and several devices currently classified as probably fine. Failed experiments are just successful warnings." },
          ],
          options: [
            ["FIZZ_EXPERIMENTS_02", "What is a field test?"],
            ["FIZZ_EXPERIMENTS_03", "What is pressure and regret?"],
            { id: "BOARD", label: "Open experiments.", ifFlag: "flag.village.boomClubUnlocked" },
          ],
        },
        FIZZ_EXPERIMENTS_02: {
          prompt: "What is a field test?",
          lines: [
            { speaker: "Fizzwick", text: "You take a controlled device into an uncontrolled environment and observe whether reality cooperates. Report distance, smoke color, sound, heat, startled enemies, and whether eyebrows remain." },
          ],
        },
        FIZZ_EXPERIMENTS_03: {
          prompt: "What is pressure and regret?",
          lines: [
            { speaker: "Fizzwick", text: "A project to make pressure cores safer, smaller, and less inclined to become everyone's final lesson. The regret is mostly historical. Mostly." },
          ],
        },
        FIZZ_VOLATILES_01: {
          prompt: "What volatile materials do you need?",
          lines: [
            { speaker: "Fizzwick", text: "Coal, brimstone, fire reagents, infernal volatiles, pressure parts, slag glass, strange gears, and anything that makes a careful person move it with tongs." },
          ],
          options: [{ id: "BOARD", label: "Open volatile turn-ins.", ifFlag: "flag.village.boomClubUnlocked" }],
        },
        FIZZ_SHOP_CLUB_01: {
          prompt: "What do you sell now?",
          lines: [
            { speaker: "Fizzwick", text: "Still potions, because people keep bleeding. But club trust opens louder inventory: better fire, stranger bottles, and tools labeled with increasingly sincere warnings." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        FIZZ_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Fizzwick", text: "Fizzwick Boomwhistle: inventor, alchemist, practical optimist, and living proof that controlled explosions build character, provided the character stands far enough away." },
          ],
        },
        FIZZ_FLIRT_NORMAL_01: {
          prompt: "You have a certain dangerous charm.",
          lines: [
            { speaker: "Fizzwick", text: "Thank you! That is usually what people say about unstable compounds shortly before I move them to a safer shelf." },
          ],
        },
        FIZZ_FAMILIAR_01: {
          prompt: "Give me an experiment that leaves the building standing.",
          action: "FIZZ_LEAST_DANGEROUS_ACCEPT",
          lines: [
            { speaker: "Fizzwick", text: "Wonderful restraint! Suspicious, but wonderful." },
            { speaker: "Fizzwick", text: "We shall begin with pressure, heat, and the noble art of standing behind something heavy. Bring coal, glass, and one reagent that smells like bad decisions." },
          ],
        },
        FIZZ_TRUSTED_01: {
          prompt: "What is the Boom Club really for?",
          action: "FIZZ_COMMUNITY_DOCUMENTATION_ACCEPT",
          lines: [
            { speaker: "Fizzwick", text: "Community!" },
            { type: "stage", text: "He snaps his fingers, reconsiders, then points at a stack of scorched notes." },
            { speaker: "Fizzwick", text: "Also documentation. Mostly community. No, documentation. The world is full of dangerous reactions happening without applause or safety goggles. I intend to fix at least one of those problems." },
          ],
        },
        FIZZ_CLOSE_01: {
          prompt: "What blew up before?",
          action: "FIZZ_BRASS_REGULATOR_ACCEPT",
          lines: [
            { speaker: "Fizzwick", text: "That is rude, accurate, and emotionally flammable." },
            { speaker: "Fizzwick", text: "There was a lab. There was a mentor. There was a valve marked 'do not tighten.' In my defense, the label was on the other side after the first blast." },
            { speaker: "Fizzwick", text: "If you find brass regulator parts with blue scoring, bring them to me. I owe an apology to a machine." },
          ],
        },
        FIZZ_DEAR_01: {
          prompt: "Build us something only you would dare make.",
          action: "FIZZ_ALMOST_RESPONSIBLE_ACCEPT",
          lines: [
            { speaker: "Fizzwick", text: "I have waited my entire life for someone to say that and survive the sentence." },
            { speaker: "Fizzwick", text: "We need demon ichor, pressure crystal, treated brass, and a very brave table. The result will be safe, useful, and almost certainly legal somewhere." },
          ],
        },
        FIZZ_END_NORMAL: {
          lines: [{ speaker: "Fizzwick", text: "Mind the floor. The safe spots are marked in chalk, unless the chalk moved." }],
          end: true,
        },
        FIZZ_END_CLUB: {
          lines: [{ speaker: "Fizzwick", text: "Return with samples, notes, and the same number of eyebrows if convenient." }],
          end: true,
        },
      },
    },
    apothecary: {
      npcId: "apothecary",
      start: "ILYRA_HUB",
      end: "ILYRA_END",
      flirtEnd: "ILYRA_END_FLIRT",
      portraitCaption: "Village apothecary",
      topicTitle: "Ask Ilyra",
      backLabel: "Wait, go back a moment.",
      topicsLabel: "Something else.",
      leaveLabel: "Goodbye.",
      shopLabel: "Open the shop.",
      nodes: {
        ILYRA_HUB: {
          lines: [
            { speaker: "Ilyra", text: "Sit if you're dizzy. Stand if you're bleeding on my clean floor. Speak if you can form useful words." },
            { type: "stage", text: "She looks you over with practiced calm." },
            { speaker: "Ilyra", text: "And if this is about a rash from touching glowing fungus, do not lie. They always lie." },
          ],
          options: [
            ["ILYRA_SHOP_01", "What do you sell?"],
            ["ILYRA_TREAT_01", "Can you treat me?"],
            ["ILYRA_DUNGEON_01", "What sicknesses come from dungeons?"],
            ["ILYRA_SYMPTOMS_01", "I found strange symptoms."],
            ["ILYRA_LIFE_01", "Tell me about yourself."],
            ["ILYRA_FLIRT_01", "You look very focused."],
            { id: "ILYRA_FAMILIAR_01", label: "What do wounded adventurers always misunderstand?", ifFriendshipAtLeast: 5 },
            { id: "ILYRA_TRUSTED_01", label: "What would help your shelves more than coin?", ifFriendshipAtLeast: 15 },
            { id: "ILYRA_PERSONAL_CLOSE_01", label: "Who taught you to heal?", ifFriendshipAtLeast: 25 },
            { id: "ILYRA_DEAR_01", label: "Trust us with the medicine you cannot waste.", ifFriendshipAtLeast: 40 },
          ],
        },
        ILYRA_SHOP_01: {
          prompt: "What do you sell?",
          lines: [
            { speaker: "Ilyra", text: "Things that taste awful because they work. Bitter tonics, fever drops, poultices, clean needles, stitching thread, burn salve, antitoxin, stomach charcoal, wound wash, and a few recovery draughts for people who confuse courage with blood loss." },
          ],
          options: [
            ["ILYRA_SHOP_02", "What should I carry into a dungeon?"],
            ["ILYRA_SHOP_03", "Why is everything bitter?"],
            ["SHOP", "Open the shop."],
          ],
        },
        ILYRA_SHOP_02: {
          prompt: "What should I carry into a dungeon?",
          lines: [
            { speaker: "Ilyra", text: "Bandages. Antitoxin. Wound wash. Something for fever. Something for nausea. And clean water." },
            { type: "stage", text: "She gives you a sharp look." },
            { speaker: "Ilyra", text: "No, ale is not clean water. I do not care what the tavern says." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        ILYRA_SHOP_03: {
          prompt: "Why is everything bitter?",
          lines: [
            { speaker: "Ilyra", text: "Because nature has poor bedside manners." },
            { type: "stage", text: "She holds up a dark vial." },
            { speaker: "Ilyra", text: "Sweet things are often for comfort. Bitter things argue with infection, fever, poison, and whatever you inhaled in that charming death-hole you call an adventure." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        ILYRA_TREAT_01: {
          prompt: "Can you treat me?",
          lines: [
            { speaker: "Ilyra", text: "That depends whether you are injured, poisoned, infected, cursed, or simply dramatic." },
            { type: "stage", text: "She gestures to the examination stool." },
            { speaker: "Ilyra", text: "Sit. Show me the wound, describe the pain, and do not say 'it's fine' unless you want the larger needle." },
          ],
          options: [
            ["ILYRA_TREAT_02", "I need healing."],
            ["ILYRA_TREAT_03", "I might be poisoned."],
            ["ILYRA_TREAT_04", "I think I caught something."],
            ["SHOP", "Open treatment services."],
          ],
        },
        ILYRA_TREAT_02: {
          prompt: "I need healing.",
          lines: [
            { speaker: "Ilyra", text: "Most people do. They just wait until the floor tells them." },
            { type: "stage", text: "She cleans her hands, then reaches for salve and bandage." },
            { speaker: "Ilyra", text: "I can close cuts, reduce swelling, drain bad fluid, stitch clean wounds, and make you regret moving too quickly afterward." },
          ],
          options: [["SHOP", "Open treatment services."]],
        },
        ILYRA_TREAT_03: {
          prompt: "I might be poisoned.",
          lines: [
            { speaker: "Ilyra", text: "Describe the taste in your mouth, the color of your vision, and whether your fingers feel too large for your hands." },
            { type: "stage", text: "She prepares three small vials." },
            { speaker: "Ilyra", text: "Poison is rude, but usually consistent. Your symptoms will tell me which insult it used." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        ILYRA_TREAT_04: {
          prompt: "I think I caught something.",
          lines: [
            { speaker: "Ilyra", text: "Likely. Dungeons are damp stone boxes full of corpses, vermin, fungus, old magic, and men who refuse to wash their hands." },
            { type: "stage", text: "She points to the stool." },
            { speaker: "Ilyra", text: "Sit. Fever first, lungs second, skin third. Then we decide whether you need medicine, isolation, or a lecture." },
          ],
          options: [["SHOP", "Open treatment services."]],
        },
        ILYRA_DUNGEON_01: {
          prompt: "What sicknesses come from dungeons?",
          lines: [
            { speaker: "Ilyra", text: "Common ones? Corpse fever, tunnel lung, rot-bite infection, black mold cough, sewer gut, grave chill, fungal rash, spider venom aftersickness, and whatever happens when someone drinks from a ceremonial basin because it 'looked fresh.'" },
          ],
          options: [
            ["ILYRA_DUNGEON_02", "What is corpse fever?"],
            ["ILYRA_DUNGEON_03", "What is tunnel lung?"],
            ["ILYRA_DUNGEON_04", "How do I avoid dungeon sickness?"],
          ],
        },
        ILYRA_DUNGEON_02: {
          prompt: "What is corpse fever?",
          lines: [
            { speaker: "Ilyra", text: "Fever, shaking, bad dreams, sour breath, and tenderness around old wounds. Usually from dead flesh, old blood, or flies that have been places flies should not be proud of." },
            { type: "stage", text: "She selects a brown bottle." },
            { speaker: "Ilyra", text: "Treat early. Once the fever starts speaking in someone else's voice, fetch Vell as well." },
          ],
        },
        ILYRA_DUNGEON_03: {
          prompt: "What is tunnel lung?",
          lines: [
            { speaker: "Ilyra", text: "Dust, spores, ash, and bad air scraping the inside of your chest." },
            { type: "stage", text: "She presses two fingers against her own throat." },
            { speaker: "Ilyra", text: "If your cough tastes like metal or old bread, leave the dungeon. If you cough black, leave faster." },
          ],
        },
        ILYRA_DUNGEON_04: {
          prompt: "How do I avoid dungeon sickness?",
          lines: [
            { speaker: "Ilyra", text: "Do not drink unknown water. Do not touch wet walls with open cuts. Do not sleep beside corpses. Boil cloth masks. Burn moldy bandages. Keep wounds covered." },
            { type: "stage", text: "She pauses." },
            { speaker: "Ilyra", text: "And stop letting the rogue taste powders." },
          ],
        },
        ILYRA_SYMPTOMS_01: {
          prompt: "I found strange symptoms.",
          lines: [
            { speaker: "Ilyra", text: "Good. Strange symptoms are better than vague ones. Vague symptoms make me want to throw jars." },
            { type: "stage", text: "She opens a notebook." },
            { speaker: "Ilyra", text: "Color, smell, timing, pain, dreams, appetite, and whether the patient hears anything that is not physically present." },
          ],
          options: [
            ["ILYRA_SYMPTOMS_02", "The patient has black veins."],
            ["ILYRA_SYMPTOMS_03", "The patient hears bells or whispers."],
            ["ILYRA_SYMPTOMS_04", "The wound will not close."],
          ],
        },
        ILYRA_SYMPTOMS_02: {
          prompt: "The patient has black veins.",
          lines: [
            { speaker: "Ilyra", text: "Poison, curse, necrotic contamination, or very bad ink injected by an idiot." },
            { type: "stage", text: "She reaches for gloves." },
            { speaker: "Ilyra", text: "Check if the veins move toward the heart, the wound, or a mark on the skin. Direction matters." },
          ],
        },
        ILYRA_SYMPTOMS_03: {
          prompt: "The patient hears bells or whispers.",
          lines: [
            { speaker: "Ilyra", text: "That leaves medicine and enters priest-or-wizard territory." },
            { type: "stage", text: "She still writes it down." },
            { speaker: "Ilyra", text: "Fever can make whispers. Curses can make commands. Ghosts can make both. I can reduce fever. I cannot politely ask a haunting to stop." },
          ],
        },
        ILYRA_SYMPTOMS_04: {
          prompt: "The wound will not close.",
          lines: [
            { speaker: "Ilyra", text: "Then it is not only a wound." },
            { type: "stage", text: "She becomes very still." },
            { speaker: "Ilyra", text: "Could be cursed metal, lingering venom, grave rot, or something still lodged inside. People forget that bodies are doors. Sometimes a wound stays open because something is using it." },
          ],
        },
        ILYRA_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Ilyra", text: "Ilyra Fen. Apothecary, wound-closer, fever-watcher, needle-owner, and the last person many fools consult before admitting they should have come yesterday." },
            { type: "stage", text: "She labels a vial without looking down." },
            { speaker: "Ilyra", text: "I prefer accurate symptoms, clean instruments, and patients who do not flirt while losing blood." },
          ],
          options: [
            ["ILYRA_LIFE_02", "Why become an apothecary?"],
            ["ILYRA_LIFE_03", "Do you like this village?"],
            ["ILYRA_LIFE_04", "Do people listen to your advice?"],
          ],
        },
        ILYRA_LIFE_02: {
          prompt: "Why become an apothecary?",
          lines: [
            { speaker: "Ilyra", text: "Because bodies tell the truth when people do not." },
            { type: "stage", text: "She closes the vial case." },
            { speaker: "Ilyra", text: "A bruise remembers direction. A fever remembers exposure. A scar remembers poor decisions. I find that comforting." },
          ],
        },
        ILYRA_LIFE_03: {
          prompt: "Do you like this village?",
          lines: [
            { speaker: "Ilyra", text: "I like parts of it. The herb garden. The old well. The children who bring me beetles and ask whether they are poisonous." },
            { type: "stage", text: "A faint smile." },
            { speaker: "Ilyra", text: "The adults are less charming. They wait until a limb smells wrong before asking if it needs attention." },
          ],
        },
        ILYRA_LIFE_04: {
          prompt: "Do people listen to your advice?",
          lines: [
            { speaker: "Ilyra", text: "Eventually." },
            { type: "stage", text: "She smiles thinly." },
            { speaker: "Ilyra", text: "Pain improves attention. Fever improves humility. A clean needle improves honesty very quickly." },
          ],
        },
        ILYRA_FLIRT_01: {
          prompt: "You look very focused.",
          lines: [
            { speaker: "Ilyra", text: "I am holding a needle, three remedies, and a complete lack of patience for vague complaints." },
            { type: "stage", text: "She looks up at you." },
            { speaker: "Ilyra", text: "But yes. Focus can be attractive when it keeps people alive." },
          ],
          options: [
            ["ILYRA_FLIRT_02", "I trust your hands."],
            ["ILYRA_FLIRT_03", "Do you examine everyone this closely?"],
            ["ILYRA_FLIRT_04", "Maybe I just wanted an excuse to visit."],
          ],
        },
        ILYRA_FLIRT_02: {
          prompt: "I trust your hands.",
          lines: [
            { speaker: "Ilyra", text: "Wise. They are steady, clean, and very good at finding where someone hurts." },
            { type: "stage", text: "She lets the silence sit for one precise second." },
            { speaker: "Ilyra", text: "Medically speaking, of course." },
          ],
          end: false,
        },
        ILYRA_FLIRT_03: {
          prompt: "Do you examine everyone this closely?",
          lines: [
            { speaker: "Ilyra", text: "Yes." },
            { type: "stage", text: "She studies your face." },
            { speaker: "Ilyra", text: "But not everyone makes it interesting." },
          ],
        },
        ILYRA_FLIRT_04: {
          prompt: "Maybe I just wanted an excuse to visit.",
          lines: [
            { speaker: "Ilyra", text: "Then bring herbs next time, not injuries." },
            { type: "stage", text: "Her mouth curves slightly." },
            { speaker: "Ilyra", text: "I accept moonmint, feverfew, clean glass bottles, and conversations that do not begin with 'don't be angry, but...'" },
          ],
        },
        ILYRA_FAMILIAR_01: {
          prompt: "What do wounded adventurers always misunderstand?",
          action: "ILYRA_FIRST_AID_ACCEPT",
          lines: [
            { speaker: "Ilyra", text: "That healing is not undoing." },
            { speaker: "Ilyra", text: "A potion can close a wound and leave the body frightened. Rest is not laziness. Clean cloth is not optional. Pain is information, not a moral failing." },
            { speaker: "Ilyra", text: "Bring me clean first-aid stock. I will show you what to carry before someone starts calling blood loss bravery." },
          ],
        },
        ILYRA_TRUSTED_01: {
          prompt: "What would help your shelves more than coin?",
          action: "ILYRA_RARE_HERBS_ACCEPT",
          lines: [
            { speaker: "Ilyra", text: "Moonmoss, feverleaf, grave-mint if Maelis approves the picking, and clean honey from hives that have not nested beside corpse flowers." },
            { speaker: "Ilyra", text: "Do not bring me mystery leaves in a boot. I will throw both away." },
          ],
        },
        ILYRA_PERSONAL_CLOSE_01: {
          prompt: "Who taught you to heal?",
          action: "ILYRA_AUNTS_REMEDY_ACCEPT",
          lines: [
            { speaker: "Ilyra", text: "My aunt. She healed with warm hands and terrifying patience." },
            { type: "stage", text: "Ilyra's hands slow over the medicine case." },
            { speaker: "Ilyra", text: "She said every village has two hearts: the place people gather to celebrate, and the place they go when celebration fails. I inherited the second." },
            { speaker: "Ilyra", text: "If you find good root, honey, and clean bittering herbs, I can make one of her old remedies properly." },
          ],
        },
        ILYRA_DEAR_01: {
          prompt: "Trust us with the medicine you cannot waste.",
          action: "ILYRA_LAST_BREATH_ACCEPT",
          lines: [
            { speaker: "Ilyra", text: "Then I need something difficult." },
            { speaker: "Ilyra", text: "There is a restorative I can make only once this season. It needs a living root from a tree struck by healing magic, not lightning." },
            { speaker: "Ilyra", text: "The dose can pull someone back from the edge, but not if fools drink it for courage. Bring the root, and bring proof you understand the difference." },
          ],
        },
        ILYRA_END: {
          lines: [
            { speaker: "Ilyra", text: "Wash your hands. Boil your water. If something changes color, smell, or starts speaking, come back immediately." },
          ],
          end: true,
        },
        ILYRA_END_FLIRT: {
          lines: [
            { speaker: "Ilyra", text: "Come back before the next wound. I prefer visits that do not begin with bleeding." },
          ],
          end: true,
        },
      },
    },
    "grumpy-wizard": {
      npcId: "grumpy-wizard",
      start: "VELL_HUB",
      end: "VELL_END",
      portraitCaption: "Grumpy hedge-wizard",
      topicTitle: "Ask Vell",
      backLabel: "Wait, go back a moment.",
      topicsLabel: "Something else.",
      leaveLabel: "Goodbye.",
      shopLabel: "Open curse removal.",
      nodes: {
        VELL_HUB: {
          lines: [
            { speaker: "Vell", text: "If you are here to ask whether the glowing thing is dangerous, the answer is yes. If you touched it already, the answer is also idiot." },
            { type: "stage", text: "He squints." },
            { speaker: "Vell", text: "Well? Out with it." },
          ],
          options: [
            ["VELL_CURSE_01", "Can you remove curses?"],
            ["VELL_IDENTIFY_01", "Can you identify strange magic?"],
            ["VELL_REAGENT_01", "How do reagents work?"],
            ["VELL_ADVICE_01", "Got any advice about magic?"],
            ["VELL_LIFE_01", "Tell me about yourself."],
            { id: "VELL_FAMILIAR_01", label: "If we wanted you less annoyed, what would we bring?", ifFriendshipAtLeast: 5 },
            { id: "VELL_TRUSTED_01", label: "Why does demon ichor work on curses?", ifFriendshipAtLeast: 15 },
            { id: "VELL_PERSONAL_CLOSE_01", label: "What curse did you fail to break?", ifFriendshipAtLeast: 25 },
            { id: "VELL_DEAR_01", label: "Break something impossible for us.", ifFriendshipAtLeast: 40 },
          ],
        },
        VELL_CURSE_01: {
          prompt: "Can you remove curses?",
          lines: [
            { speaker: "Vell", text: "Yes. With the correct reagent, the correct words, and silence from everyone not currently doing the work." },
            { type: "stage", text: "He points a crooked finger." },
            { speaker: "Vell", text: "No reagent, no removal. I am not peeling curses off people with good intentions and village gossip." },
          ],
          options: [
            ["VELL_CURSE_02", "What kind of curses?"],
            ["VELL_CURSE_03", "What happens if we use the wrong reagent?"],
            ["SHOP", "Open curse removal."],
          ],
        },
        VELL_CURSE_02: {
          prompt: "What kind of curses?",
          lines: [
            { speaker: "Vell", text: "Grave curses. Blood curses. Hexed trinkets. Bad luck knots. Bone-words. Things that cling to weapons, names, shadows, or foolish hands." },
            { type: "stage", text: "He sniffs." },
            { speaker: "Vell", text: "Not heartbreak. I charge extra for listening to that." },
          ],
          options: [["SHOP", "Open curse removal."]],
        },
        VELL_CURSE_03: {
          prompt: "What happens if we use the wrong reagent?",
          lines: [
            { speaker: "Vell", text: "The curse laughs, I swear, and someone grows extra symptoms." },
            { type: "stage", text: "He glares." },
            { speaker: "Vell", text: "Correct reagent. Correct curse. Correct timing. Magic is not stew. You cannot fix it by adding more onion." },
          ],
          options: [
            ["VELL_CURSE_04", "What reagent do you mean?"],
            ["SHOP", "Open curse removal."],
          ],
        },
        VELL_CURSE_04: {
          prompt: "What reagent do you mean?",
          lines: [
            { speaker: "Vell", text: "For the curses I am willing to strip from adventurers who should know better? Demon Ichor. One vial. Fresh enough to still resent being bottled." },
            { type: "stage", text: "He jabs a finger toward the worktable." },
            { speaker: "Vell", text: "Bring that, the cursed thing, and fewer questions than usual." },
          ],
          options: [
            ["VELL_CURSE_05", "Why Demon Ichor?"],
            ["SHOP", "Open curse removal."],
          ],
        },
        VELL_CURSE_05: {
          prompt: "Why Demon Ichor?",
          lines: [
            { speaker: "Vell", text: "Because it works." },
            { type: "stage", text: "His stare could curdle milk." },
            { speaker: "Vell", text: "The rest is none of your business, unless you have taken up advanced curse theory and surviving explosions as hobbies. You have not. Bring the ichor." },
          ],
          options: [["SHOP", "Open curse removal."]],
        },
        VELL_IDENTIFY_01: {
          prompt: "Can you identify strange magic?",
          lines: [
            { speaker: "Vell", text: "I can identify most strange magic and insult the rest until it behaves." },
            { type: "stage", text: "He leans closer." },
            { speaker: "Vell", text: "Show me the object, mark, wound, shadow, dream residue, or suspiciously humming bone." },
          ],
          options: [
            ["VELL_IDENTIFY_02", "What signs are dangerous?"],
            ["VELL_IDENTIFY_03", "What if the magic is old?"],
          ],
        },
        VELL_IDENTIFY_02: {
          prompt: "What signs are dangerous?",
          lines: [
            { speaker: "Vell", text: "Cold light. Warm shadows. Writing that changes when ignored. Bells with no bell. Teeth where no mouth is present." },
            { type: "stage", text: "He pauses." },
            { speaker: "Vell", text: "And any item that makes you think, 'Surely one touch is safe.'" },
          ],
        },
        VELL_IDENTIFY_03: {
          prompt: "What if the magic is old?",
          lines: [
            { speaker: "Vell", text: "Then it has had longer to become petty." },
            { type: "stage", text: "He taps his staff." },
            { speaker: "Vell", text: "Old magic is not wiser. It is simply more practiced at surviving fools." },
          ],
        },
        VELL_REAGENT_01: {
          prompt: "How do reagents work?",
          lines: [
            { speaker: "Vell", text: "Reagents are not garnish. They are leverage. Grave salt for grave curses. Moonwort for dream hexes. Ash glass for fire-binding. Iron filings for command knots. Black myrrh for old dead things that refuse polite dismissal." },
          ],
          options: [
            ["VELL_REAGENT_02", "Where do I find reagents?"],
            ["VELL_REAGENT_03", "Can I substitute something else?"],
          ],
        },
        VELL_REAGENT_02: {
          prompt: "Where do I find reagents?",
          lines: [
            { speaker: "Vell", text: "In dangerous places, naturally. If reagents grew beside comfortable chairs, everyone would be a wizard and the world would be even worse." },
          ],
        },
        VELL_REAGENT_03: {
          prompt: "Can I substitute something else?",
          lines: [
            { speaker: "Vell", text: "Yes, if you enjoy failure with creativity." },
            { type: "stage", text: "He folds his arms." },
            { speaker: "Vell", text: "No substitutions unless I name them. And if a merchant says 'works just as well,' bring me the merchant. I need a new warning example." },
          ],
        },
        VELL_ADVICE_01: {
          prompt: "Got any advice about magic?",
          lines: [
            { speaker: "Vell", text: "Yes. Do not trust magic that flatters you." },
            { type: "stage", text: "He narrows his eyes." },
            { speaker: "Vell", text: "Useful magic does work. Dangerous magic makes promises." },
          ],
          options: [
            ["VELL_ADVICE_02", "What promises?"],
            ["VELL_ADVICE_03", "What about cursed items?"],
          ],
        },
        VELL_ADVICE_02: {
          prompt: "What promises?",
          lines: [
            { speaker: "Vell", text: "Power without cost. Knowledge without price. Victory without consequence. Love without consent. Life without endings." },
            { type: "stage", text: "He jabs the air with his pipe." },
            { speaker: "Vell", text: "If magic says you are special, ask what it eats." },
          ],
        },
        VELL_ADVICE_03: {
          prompt: "What about cursed items?",
          lines: [
            { speaker: "Vell", text: "If it whispers, wrap it. If it bleeds, bury it. If it calls you master, throw it in a river and move villages." },
            { type: "stage", text: "He grunts." },
            { speaker: "Vell", text: "Or bring it here, if you insist on being professional." },
          ],
          options: [["SHOP", "Open curse removal."]],
        },
        VELL_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Vell", text: "No." },
          ],
          options: [
            ["VELL_LIFE_02", "Really?"],
            ["VELL_LIFE_03", "Fair enough."],
          ],
        },
        VELL_LIFE_02: {
          prompt: "Really?",
          lines: [
            { speaker: "Vell", text: "Old Master Vell. Hedge-wizard. Curse-breaker. Retired from three things, banned from two, blamed for one unfairly and one accurately." },
            { type: "stage", text: "He points to the door." },
            { speaker: "Vell", text: "That is biography enough." },
          ],
        },
        VELL_LIFE_03: {
          prompt: "Fair enough.",
          lines: [
            { speaker: "Vell", text: "Good. A rare talent: stopping." },
          ],
        },
        VELL_FAMILIAR_01: {
          prompt: "If we wanted you less annoyed, what would we bring?",
          action: "VELL_ICHOR_STOCK_ACCEPT",
          lines: [
            { speaker: "Vell", text: "Silence." },
            { type: "stage", text: "He waits just long enough to imply you have already failed." },
            { speaker: "Vell", text: "Failing that, demon ichor. Proper ichor. Not red slime from a bottle sold by a man with too many rings. Demon ichor clings to curses like debt clings to fools." },
          ],
        },
        VELL_TRUSTED_01: {
          prompt: "Why does demon ichor work on curses?",
          action: "VELL_ICHOR_THEORY_ACCEPT",
          lines: [
            { speaker: "Vell", text: "Because curses are arrogant and demons are worse." },
            { speaker: "Vell", text: "A curse expects a clean answer: prayer, silver, repentance, some tidy little moral. Demon ichor gives it something foul and louder to chew on while I cut the knot." },
            { speaker: "Vell", text: "Do not quote me. Especially accurately." },
          ],
        },
        VELL_PERSONAL_CLOSE_01: {
          prompt: "What curse did you fail to break?",
          action: "VELL_CURSE_KNOT_ACCEPT",
          lines: [
            { speaker: "Vell", text: "They did." },
            { type: "stage", text: "His hand tightens around the pipe before he remembers not to break it." },
            { speaker: "Vell", text: "There was a boy who laughed every time the curse hurt him. Thought it made his mother less afraid. I broke six bindings and missed the seventh." },
            { speaker: "Vell", text: "If you find black-thread curse knots, bring them here before some cheerful idiot wears one as a bracelet." },
          ],
        },
        VELL_DEAR_01: {
          prompt: "Break something impossible for us.",
          action: "VELL_KNOT_CUTTER_ACCEPT",
          lines: [
            { speaker: "Vell", text: "I sit. Standing is for people with optimistic knees." },
            { speaker: "Vell", text: "But yes. Bring me a curse with teeth. Bring ichor. Bring patience. Bring no bards." },
            { speaker: "Vell", text: "If the work holds, I will make you something that cuts knots before they learn your name." },
          ],
        },
        VELL_END: {
          lines: [
            { speaker: "Vell", text: "Do not touch glowing objects. Do not read floor-writing aloud. Do not bring me jars that knock from the inside." },
          ],
          end: true,
        },
      },
    },
    weaponsmith: {
      npcId: "weaponsmith",
      start: "VAELION_HUB",
      portraitCaption: "Elven weaponsmith",
      topicTitle: "Ask Vaelion",
      backLabel: "Wait, go back a moment.",
      topicsLabel: "Something else.",
      leaveLabel: "Goodbye.",
      shopLabel: "Open the shop.",
      end: "VAELION_END",
      nodes: {
        VAELION_HUB: {
          lines: [
            { speaker: "Vaelion", text: "Do not touch the edge unless you mean to bleed. Do not touch the hilt unless you mean to be responsible for what follows." },
          ],
          options: [
            ["VAELION_SHOP_01", "Show me your weapons."],
            ["VAELION_UNDEAD_01", "Why do you hate undead?"],
            ["VAELION_CRAFT_01", "Tell me about your craft."],
            ["VAELION_STEEL_01", "What is royal steel?"],
            ["VAELION_PAST_01", "You sound like you know the barrows."],
            { id: "VAELION_FAMILIAR_01", label: "What makes a weapon honest?", ifFriendshipAtLeast: 5 },
            { id: "VAELION_PERSONAL_TRUSTED_01", label: "What did undeath take from you?", ifFriendshipAtLeast: 15 },
            { id: "VAELION_CLOSE_01", label: "What blade would you make if coin did not matter?", ifFriendshipAtLeast: 25 },
            { id: "VAELION_DEAR_01", label: "Make us the quiet blade.", ifFriendshipAtLeast: 40 },
          ],
        },
        VAELION_SHOP_01: {
          prompt: "Show me your weapons.",
          lines: [
            { speaker: "Vaelion", text: "I sell tools for ending danger, not decorations for vanity. Blades, arrowheads, spearheads, repairs, edge setting, balance correction, and script-work for weapons meant to strike things that have forgotten they are dead." },
          ],
          options: [
            ["VAELION_SHOP_02", "What weapon should I use?"],
            ["VAELION_SHOP_03", "Can you improve my weapon?"],
            ["SHOP", "Open the shop."],
          ],
        },
        VAELION_SHOP_02: {
          prompt: "What weapon should I use?",
          lines: [
            { speaker: "Vaelion", text: "The one you can keep between yourself and panic." },
            { type: "stage", text: "He studies your stance." },
            { speaker: "Vaelion", text: "A sword rewards discipline. A spear rewards patience. An axe rewards commitment. A bow rewards honesty about distance." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_SHOP_03: {
          prompt: "Can you improve my weapon?",
          lines: [
            { speaker: "Vaelion", text: "If the steel is honest, yes. If it is cheap, I can make it less embarrassing. If it is cursed, I will charge extra and insult whoever sold it to you." },
          ],
          options: [["SHOP", "Open upgrade services."]],
        },
        VAELION_UNDEAD_01: {
          prompt: "Why do you hate undead?",
          lines: [
            { speaker: "Vaelion", text: "I hate waste. Undeath is waste wearing a face." },
            { type: "stage", text: "He returns a blade to the heat." },
            { speaker: "Vaelion", text: "A dead soldier should be remembered, not marched. A dead king should be buried, not obeyed. Human crowns are bad enough while their owners breathe." },
          ],
          options: [
            ["VAELION_UNDEAD_02", "What makes oathbound dead different?"],
            ["VAELION_UNDEAD_03", "Can a good weapon help?"],
            ["VAELION_UNDEAD_04", "You sound angry."],
          ],
        },
        VAELION_UNDEAD_02: {
          prompt: "What makes oathbound dead different?",
          lines: [
            { speaker: "Vaelion", text: "They are not merely hungry. They are directed." },
            { type: "stage", text: "He draws one finger along engraved script." },
            { speaker: "Vaelion", text: "An oath can preserve courage. It can also preserve obedience after judgment should have ended. That is why oathbound dead are dangerous. They still think someone has the right to command them." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_UNDEAD_03: {
          prompt: "Can a good weapon help?",
          lines: [
            { speaker: "Vaelion", text: "A good weapon cannot make a fool wise, but it can make a wise hand decisive." },
            { type: "stage", text: "He points to pale script along a blade." },
            { speaker: "Vaelion", text: "Protective engraving helps the edge remember its purpose. Against oathbound dead, purpose matters." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_UNDEAD_04: {
          prompt: "You sound angry.",
          lines: [
            { speaker: "Vaelion", text: "I am old. Anger has had time to become precise." },
            { type: "stage", text: "The hammer falls once." },
            { speaker: "Vaelion", text: "Imprecise anger breaks things. Precise anger becomes a blade." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_CRAFT_01: {
          prompt: "Tell me about your craft.",
          lines: [
            { speaker: "Vaelion", text: "A weapon is a promise made in metal. It says: when danger comes close enough, I will not be empty-handed." },
            { type: "stage", text: "He turns the blade under the lantern light." },
            { speaker: "Vaelion", text: "Most smiths make sharp iron. I prefer responsible steel." },
          ],
          options: [
            ["VAELION_CRAFT_02", "What is responsible steel?"],
            ["VAELION_CRAFT_03", "What do the engravings mean?"],
            ["VAELION_CRAFT_04", "Do you make beautiful weapons on purpose?"],
          ],
        },
        VAELION_CRAFT_02: {
          prompt: "What is responsible steel?",
          lines: [
            { speaker: "Vaelion", text: "Steel made for a wielder, not for a story. Balanced for their hand. Tempered for its task. Marked so its owner remembers that drawing it changes the room." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_CRAFT_03: {
          prompt: "What do the engravings mean?",
          lines: [
            { speaker: "Vaelion", text: "Warnings, mostly. Old words for edge, restraint, severance, return. Some scripts are prayers. Some are arguments with death. The best ones are both." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_CRAFT_04: {
          prompt: "Do you make beautiful weapons on purpose?",
          lines: [
            { speaker: "Vaelion", text: "Of course." },
            { type: "stage", text: "He sounds faintly offended." },
            { speaker: "Vaelion", text: "Ugly tools teach careless habits. Beauty makes the hand pause. A pause before violence is useful." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_STEEL_01: {
          prompt: "What is royal steel?",
          lines: [
            { speaker: "Vaelion", text: "Old barrow metal. Guard blades, throne hinges, broken oath-seals, crown nails, coffin braces. Steel that sat close to command for too long." },
            { type: "stage", text: "He watches the forge flame." },
            { speaker: "Vaelion", text: "Dangerous raw. Useful reforged." },
          ],
          options: [
            ["VAELION_STEEL_02", "Why do you want it?"],
            ["VAELION_STEEL_03", "Is it cursed?"],
            ["VAELION_STEEL_04", "Can it harm oathbound dead?"],
          ],
        },
        VAELION_STEEL_02: {
          prompt: "Why do you want it?",
          lines: [
            { speaker: "Vaelion", text: "To turn command against itself." },
            { type: "stage", text: "He lays a narrow blade on the anvil." },
            { speaker: "Vaelion", text: "If dead knights were bound by royal steel and royal oaths, then properly reforged royal steel may cut the knot." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_STEEL_03: {
          prompt: "Is it cursed?",
          lines: [
            { speaker: "Vaelion", text: "Some of it. Some is merely guilty." },
            { type: "stage", text: "He glances at a locked rack behind him." },
            { speaker: "Vaelion", text: "Do not laugh. Metal remembers hands. It remembers banners. It remembers which side of a door it was on when the screaming started." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_STEEL_04: {
          prompt: "Can it harm oathbound dead?",
          lines: [
            { speaker: "Vaelion", text: "If cleaned, named, heated, folded, and engraved correctly, yes. A blade can become a legal argument. Against oathbound dead, a good argument must be sharp." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_PAST_01: {
          prompt: "You sound like you know the barrows.",
          lines: [
            { speaker: "Vaelion", text: "I know old work when I see it." },
            { type: "stage", text: "His hands become very still." },
            { speaker: "Vaelion", text: "The barrow weapons were not made by fools. That is part of the shame." },
          ],
          options: [
            ["VAELION_PAST_02", "Whose shame?"],
            ["VAELION_PAST_03", "Did elves make those weapons?"],
            ["VAELION_PAST_04", "Why not tell me everything?"],
          ],
        },
        VAELION_PAST_02: {
          prompt: "Whose shame?",
          lines: [
            { speaker: "Vaelion", text: "Whoever armed men to kneel before a dead king and called it loyalty." },
            { type: "stage", text: "He returns to the blade." },
            { speaker: "Vaelion", text: "Names matter. Proof matters more. Bring me old steel, and perhaps the metal will speak more plainly than memory." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_PAST_03: {
          prompt: "Did elves make those weapons?",
          lines: [
            { speaker: "Vaelion", text: "Some edges carry elven habits. Thin fullers. Patient balance. Script hidden where human eyes admire polish." },
            { type: "stage", text: "He does not look at you." },
            { speaker: "Vaelion", text: "That does not prove guilt. Only proximity." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_PAST_04: {
          prompt: "Why not tell me everything?",
          lines: [
            { speaker: "Vaelion", text: "Because suspicion is not history." },
            { type: "stage", text: "He looks up at last." },
            { speaker: "Vaelion", text: "And because old families have a talent for preserving heirlooms while misplacing confessions." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        VAELION_FAMILIAR_01: {
          prompt: "What makes a weapon honest?",
          action: "VAELION_HONEST_EDGE_ACCEPT",
          lines: [
            { speaker: "Vaelion", text: "Balance." },
            { speaker: "Vaelion", text: "An honest weapon tells the hand what it can do. A liar flatters. Too much shine, too little spine. Pretty edges. Weak tangs. Hero-killers, most of them." },
            { speaker: "Vaelion", text: "Bring me decent steel, oil, or repair stock. I will show you how to hear a weapon before it betrays you." },
          ],
        },
        VAELION_PERSONAL_TRUSTED_01: {
          prompt: "What did undeath take from you?",
          action: "VAELION_COMPANY_TOKEN_ACCEPT",
          lines: [
            { speaker: "Vaelion", text: "Old wounds still open when weather changes." },
            { type: "stage", text: "He sets the blade down without finishing the stroke." },
            { speaker: "Vaelion", text: "I knew a company that vanished into a tomb under green stone. They came back in pieces, then all at once, wearing their own faces badly." },
            { speaker: "Vaelion", text: "I learned then that a sword can hesitate if the hand remembers too much. If you find a lost company token, bring it to me." },
          ],
        },
        VAELION_CLOSE_01: {
          prompt: "What blade would you make if coin did not matter?",
          action: "VAELION_QUIET_BLADE_STUDY_ACCEPT",
          lines: [
            { speaker: "Vaelion", text: "A quiet blade." },
            { speaker: "Vaelion", text: "Not silent. Quiet. A weapon that does not hunger, boast, flare, or sing. Something made for ending harm without learning to enjoy it." },
            { speaker: "Vaelion", text: "Rare steel helps. Rarer hands help more. Bring metal worth the attempt." },
          ],
        },
        VAELION_DEAR_01: {
          prompt: "Make us the quiet blade.",
          action: "VAELION_QUIET_EDGE_ACCEPT",
          lines: [
            { speaker: "Vaelion", text: "That is either trust or vanity. I will test which." },
            { speaker: "Vaelion", text: "Bring star-cold iron, grave-salt, and proof you spared an enemy when killing would have been easier. I will not make a mercy blade for butchers." },
          ],
        },
        VAELION_END: {
          lines: [
            { speaker: "Vaelion", text: "Keep your edge clean. Keep your purpose cleaner." },
          ],
          end: true,
        },
      },
    },
    armorsmith: {
      npcId: "armorsmith",
      start: () => (borrenTriggerActive() ? "BORREN_HUB_TRIGGER" : "BORREN_HUB_NORMAL"),
      end: () => (borrenTriggerActive() ? "TRIGGER_END" : "BORREN_END_NORMAL"),
      portraitCaption: "Village armorsmith",
      topicTitle: "Ask Borren",
      backLabel: "Wait, go back a moment.",
      topicsLabel: "Something else.",
      leaveLabel: "Goodbye.",
      shopLabel: "Open the shop.",
      nodes: {
        BORREN_HUB_NORMAL: {
          lines: [
            { speaker: "Borren", text: "Door shut. Heat stays in, cold stays out. That rule's older than you and twice as useful." },
            { type: "stage", text: "He looks up from the anvil." },
            { speaker: "Borren", text: "If it's repairs, put the piece on the bench. If it's talk, make it worth the coal." },
          ],
          options: [
            ["BORREN_WORK_01", "What do you do here?"],
            ["BORREN_SHOP_01", "Show me your wares."],
            ["BORREN_ADVICE_01", "Got any armor advice?"],
            ["BORREN_LIFE_01", "Tell me about yourself."],
            ["BORREN_APPRENTICE_01", "Who works with you?"],
            ["BORREN_FORGE_01", "Your forge looks old."],
            ["BORREN_RUMORS_01", "Any rumors around the village?"],
            { id: "BORREN_FAMILIAR_01", label: "Show me how to care for armor.", ifFriendshipAtLeast: 5 },
            { id: "BORREN_TRUSTED_01", label: "What did your family watch over?", ifFriendshipAtLeast: 15 },
            { id: "BORREN_PERSONAL_CLOSE_01", label: "Tell me about Borin.", ifFriendshipAtLeast: 25 },
            { id: "BORREN_DEAR_01", label: "Make a weapon for me, not for a shelf.", ifFriendshipAtLeast: 40 },
          ],
        },
        BORREN_WORK_01: {
          prompt: "What do you do here?",
          lines: [
            { speaker: "Borren", text: "I keep fools alive after they buy armor too late." },
            { type: "stage", text: "He turns a half-finished breastplate under the light." },
            { speaker: "Borren", text: "Helms, shields, mail patches, buckles, rivets, hinge work, dents hammered out of plates that should've been maintained before something tried to cave them in." },
          ],
          options: [
            ["BORREN_WORK_02", "You sound strict about armor."],
            ["BORREN_WORK_03", "Do you make weapons too?"],
            ["BORREN_WORK_04", "Does the village need that much armor?"],
          ],
        },
        BORREN_WORK_02: {
          prompt: "You sound strict about armor.",
          lines: [
            { speaker: "Borren", text: "Armor is a promise. Bad armor is a lie with straps." },
            { type: "stage", text: "He taps the breastplate." },
            { speaker: "Borren", text: "If I sell you steel, I'm saying it'll stand between your ribs and the world. That means I do the work properly, and you stop treating buckles like decorations." },
          ],
        },
        BORREN_WORK_03: {
          prompt: "Do you make weapons too?",
          lines: [
            { speaker: "Borren", text: "When needed. But any hammer-happy fool can make something sharp enough to cause regret." },
            { type: "stage", text: "He gestures to the armor racks." },
            { speaker: "Borren", text: "Armor is quieter work. More honest. A blade asks how to kill. Armor asks how to come home." },
          ],
        },
        BORREN_WORK_04: {
          prompt: "Does the village need that much armor?",
          lines: [
            { speaker: "Borren", text: "Village near old hills, old roads, old graves, and people who think 'probably safe' is a plan? Aye. It does." },
            { type: "stage", text: "He glances toward the door." },
            { speaker: "Borren", text: "Quiet places don't stay quiet by accident. Someone keeps hinges mended, tools sharp, and fools covered in metal." },
          ],
        },
        BORREN_SHOP_01: {
          prompt: "Show me your wares.",
          lines: [
            { speaker: "Borren", text: "Armor, shields, repairs, mail patches, helm fitting, rivets, buckles, and reinforcement. If you want shiny parade nonsense, go find someone with softer hands." },
          ],
          options: [
            ["BORREN_SHOP_02", "Can you repair my gear?"],
            ["BORREN_SHOP_03", "What should I buy first?"],
            ["SHOP", "Open the shop."],
          ],
        },
        BORREN_SHOP_02: {
          prompt: "Can you repair my gear?",
          lines: [
            { speaker: "Borren", text: "If it's metal, yes. If it's leather, mostly. If it's held together by hope, sweat, and three heroic mistakes, I'll repair it after I insult it." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        BORREN_SHOP_03: {
          prompt: "What should I buy first?",
          lines: [
            { speaker: "Borren", text: "A shield, if you don't have one. A helm, if your skull matters to you. Repairs, if your gear rattles when you breathe." },
            { type: "stage", text: "He squints at you." },
            { speaker: "Borren", text: "And if you say 'I dodge instead,' I charge extra." },
          ],
          options: [["SHOP", "Open the shop."]],
        },
        BORREN_ADVICE_01: {
          prompt: "Got any armor advice?",
          lines: [
            { speaker: "Borren", text: "Clean the joints. Oil the buckles. Replace straps before they break. Don't sleep in plate unless you enjoy waking up shaped like a mistake." },
          ],
          options: [
            ["BORREN_ADVICE_02", "What ruins armor fastest?"],
            ["BORREN_ADVICE_03", "What about fighting underground?"],
            ["BORREN_ADVICE_04", "What about undead?"],
          ],
        },
        BORREN_ADVICE_02: {
          prompt: "What ruins armor fastest?",
          lines: [
            { speaker: "Borren", text: "Neglect. Then rust. Then owners who think dents add character." },
            { type: "stage", text: "He points at a battered pauldron." },
            { speaker: "Borren", text: "A dent is a place where the next hit starts winning." },
          ],
        },
        BORREN_ADVICE_03: {
          prompt: "What about fighting underground?",
          lines: [
            { speaker: "Borren", text: "Mind your head, your footing, and your light. Underground, sound lies and shadows make fools confident." },
            { type: "stage", text: "He pauses for half a breath." },
            { speaker: "Borren", text: "My mother's line had a saying: stone forgives nothing, but it warns the careful." },
          ],
        },
        BORREN_ADVICE_04: {
          prompt: "What about undead?",
          lines: [
            { speaker: "Borren", text: "Don't let them close. Don't let them surround you. Don't assume bones are fragile just because they're old." },
            { type: "stage", text: "He tightens a rivet." },
            { speaker: "Borren", text: "And if something dead is wearing armor, check the straps after you drop it. Good metal shouldn't be punished for bad company." },
          ],
        },
        BORREN_LIFE_01: {
          prompt: "Tell me about yourself.",
          lines: [
            { speaker: "Borren", text: "Borren Ashmantle. Village armorsmith. Dwarf. Bad singer. Good with rivets. I like work done right, stew thick enough to hold a spoon, and people who admit when they don't know what they're doing." },
          ],
          options: [
            ["BORREN_LIFE_02", "Ashmantle is a strong name."],
            ["BORREN_LIFE_03", "Were you born here?"],
            ["BORREN_LIFE_04", "What do you do when you're not working?"],
          ],
        },
        BORREN_LIFE_02: {
          prompt: "Ashmantle is a strong name.",
          lines: [
            { speaker: "Borren", text: "Aye. Old name. My mother's line carried it before me." },
            { type: "stage", text: "He wipes soot from his hands." },
            { speaker: "Borren", text: "Means you keep the fire covered when it should sleep, and feed it properly when it should work. Family names are like tools. Pretty useless if you only hang them on a wall." },
          ],
        },
        BORREN_LIFE_03: {
          prompt: "Were you born here?",
          lines: [
            { speaker: "Borren", text: "Near enough. Hills raised me more than streets did." },
            { type: "stage", text: "He nods toward the window." },
            { speaker: "Borren", text: "Village folk think the hills are scenery. Dwarves know better. Hills remember feet, picks, smoke, songs, and debts." },
          ],
        },
        BORREN_LIFE_04: {
          prompt: "What do you do when you're not working?",
          lines: [
            { speaker: "Borren", text: "Sleep. Eat. Sharpen chisels. Complain about other people's hinge work." },
            { type: "stage", text: "A brief pause." },
            { speaker: "Borren", text: "Sometimes I copy old family marks. Maker signs, claim stamps, furnace cuts. Keeps the hand steady." },
          ],
        },
        BORREN_APPRENTICE_01: {
          prompt: "Who works with you?",
          lines: [
            { speaker: "Borren", text: "My apprentice, Borin Emberhand. Good lad. Too curious by half, which is better than too lazy by whole." },
            { type: "stage", text: "He looks toward a half-organized tool rack." },
            { speaker: "Borren", text: "Still learning which questions are useful and which ones wake old arguments." },
          ],
          options: [
            ["BORREN_APPRENTICE_02", "Is he any good?"],
            ["BORREN_APPRENTICE_03", "Why take an apprentice?"],
            ["BORREN_APPRENTICE_04", "What does he work on?"],
          ],
        },
        BORREN_APPRENTICE_02: {
          prompt: "Is he any good?",
          lines: [
            { speaker: "Borren", text: "He listens to metal. That matters." },
            { type: "stage", text: "Borren grunts." },
            { speaker: "Borren", text: "Hands are still too quick, head's still too full of sparks, but he notices wrongness. Bad heat. Missing tools. Fresh soot where no fresh soot should be." },
          ],
        },
        BORREN_APPRENTICE_03: {
          prompt: "Why take an apprentice?",
          lines: [
            { speaker: "Borren", text: "Because work dies if no one learns it." },
            { type: "stage", text: "He sets down his hammer." },
            { speaker: "Borren", text: "And because young hands should learn proper craft before some traveling hack teaches them to make shiny trash with weak rivets." },
          ],
        },
        BORREN_APPRENTICE_04: {
          prompt: "What does he work on?",
          lines: [
            { speaker: "Borren", text: "Cleaning, sorting, basic repairs, copying marks, measuring plates, and learning not to touch hot iron twice." },
            { type: "stage", text: "He glances at a shelf with old chisels." },
            { speaker: "Borren", text: "Lately he's been too interested in old tool marks. Says some of them don't match village work. Might be right. Might be nosy." },
          ],
        },
        BORREN_FORGE_01: {
          prompt: "Your forge looks old.",
          lines: [
            { speaker: "Borren", text: "It is old. Still works. That makes it better than half the people who call old things useless." },
            { type: "stage", text: "He runs a hand over the stone side of the forge." },
            { speaker: "Borren", text: "Some stones came from older works. Family habit. You keep good stone when buildings fail." },
          ],
          options: [
            ["BORREN_FORGE_02", "Older works?"],
            ["BORREN_FORGE_03", "Do the markings mean something?"],
            ["BORREN_FORGE_04", "Why keep old stone?"],
          ],
        },
        BORREN_FORGE_02: {
          prompt: "Older works?",
          lines: [
            { speaker: "Borren", text: "Old dwarf work in the hills. Cold now. Sealed, mostly. Not worth your boots unless you like dust, bad air, and arguing with locked doors." },
            { type: "stage", text: "He gives you a hard look." },
            { speaker: "Borren", text: "And no, that was not an invitation." },
          ],
        },
        BORREN_FORGE_03: {
          prompt: "Do the markings mean something?",
          lines: [
            { speaker: "Borren", text: "Maker's marks. Heat marks. Work marks. Some are mine. Some were my mother's. Some are older." },
            { type: "stage", text: "He brushes soot away from one small stamped symbol." },
            { speaker: "Borren", text: "A mark says: I made this, I witnessed this, I answer for this. People should try it more often." },
          ],
        },
        BORREN_FORGE_04: {
          prompt: "Why keep old stone?",
          lines: [
            { speaker: "Borren", text: "Because good stone has already survived its first mistakes." },
            { type: "stage", text: "He knocks on the forge wall." },
            { speaker: "Borren", text: "This piece held heat before I was born. Maybe before my mother was born. You don't throw away something that remembers how to do its work." },
          ],
        },
        BORREN_RUMORS_01: {
          prompt: "Any rumors around the village?",
          lines: [
            { speaker: "Borren", text: "Rumors are what people make when they don't have measurements." },
            { type: "stage", text: "He shrugs." },
            { speaker: "Borren", text: "But folk have been complaining about smoke on the lower hill, tools going missing, and a ringing sound no one wants to admit they heard." },
          ],
          options: [
            ["BORREN_RUMORS_02", "Smoke on the hill?"],
            ["BORREN_RUMORS_03", "Missing tools?"],
            ["BORREN_RUMORS_04", "A ringing sound?"],
          ],
        },
        BORREN_RUMORS_02: {
          prompt: "Smoke on the hill?",
          lines: [
            { speaker: "Borren", text: "Thin black smoke. Not hearth smoke. Not charcoal clamp smoke either." },
            { type: "stage", text: "His brow tightens." },
            { speaker: "Borren", text: "Could be poachers. Could be fools burning wet wood. Could be nothing. I dislike nothing when it smells like old soot." },
          ],
        },
        BORREN_RUMORS_03: {
          prompt: "Missing tools?",
          lines: [
            { speaker: "Borren", text: "Small things. Chisels. Punches. A soot hook. Things worth little to sell and much to someone doing specific work." },
            { type: "stage", text: "He looks at his tool rack." },
            { speaker: "Borren", text: "Bandits take coin. Smiths take tools. Someone taking tools without knowing how to use them worries me more than both." },
          ],
        },
        BORREN_RUMORS_04: {
          prompt: "A ringing sound?",
          lines: [
            { speaker: "Borren", text: "Could be a loose wagon chain. Could be chapel metal in the fog. Could be folk hearing trouble because they expect trouble." },
            { type: "stage", text: "He stops working for just a second." },
            { speaker: "Borren", text: "Or it could be an old bell that should not be awake. Best not build a tower out of guesses." },
          ],
        },
        BORREN_FAMILIAR_01: {
          prompt: "Show me how to care for armor.",
          action: "BORREN_ARMOR_CARE_ACCEPT",
          lines: [
            { speaker: "Borren", text: "Cleaning." },
            { type: "stage", text: "He lets the word sit like a hammer on the bench." },
            { speaker: "Borren", text: "There. Great mystery revealed. Blood rots straps. Mud hides cracks. Sweat eats padding. Most heroes do not need better armor. They need to stop treating good work like a bucket." },
            { speaker: "Borren", text: "Bring me repair stock. I'll show you what should have been obvious before something tried to put a dent in your ribs." },
          ],
        },
        BORREN_TRUSTED_01: {
          prompt: "What did your family watch over?",
          action: "BORREN_CLAIM_MARKS_ACCEPT",
          lines: [
            { speaker: "Borren", text: "Means somebody had to remember which doors stay shut." },
            { speaker: "Borren", text: "My mother's people kept claim marks, furnace warnings, sealed routes. Not kings. Not priests. Smiths. Because iron remembers heat and families remember mistakes." },
            { speaker: "Borren", text: "Old claim marks, furnace plates, seal cuts. Bring those if you find them. Some warnings are only useful when someone can still read them." },
          ],
        },
        BORREN_PERSONAL_CLOSE_01: {
          prompt: "Tell me about Borin.",
          action: "BORREN_BORIN_MARK_ACCEPT",
          lines: [
            { speaker: "Borren", text: "Of course I worry." },
            { speaker: "Borren", text: "Apprentices are supposed to be irritating inside arm's reach. If they are irritating somewhere dangerous, the world has broken the arrangement." },
            { speaker: "Borren", text: "Find anything with his scratch-mark on it, you bring it. Even if it looks useless." },
          ],
        },
        BORREN_DEAR_01: {
          prompt: "Make a weapon for me, not for a shelf.",
          action: "BORREN_CUSTOM_WEAPON_ACCEPT",
          lines: [
            { speaker: "Borren", text: "Weapons are not my favorite work. That is why I do it carefully." },
            { speaker: "Borren", text: "If I make one for you, I put my mark on it and your name in the metal. It will not be a thing for selling. It will be a thing for answering danger." },
            { speaker: "Borren", text: "Bring embervein ore, good steel, and proof you stood your ground for someone weaker. Then choose the shape, and I will make it honest." },
          ],
        },
        BORREN_END_NORMAL: {
          lines: [
            { speaker: "Borren", text: "Keep your straps tight and your head lower than your shield. Come back before your armor sounds like a sack of pans." },
          ],
          end: true,
        },
        BORREN_HUB_TRIGGER: {
          lines: [
            { type: "stage", text: "The forge is colder than usual. Borren has not banked the fire properly. He stands beside the old stone wall, one hand pressed against it." },
            { speaker: "Borren", text: "You hear it?" },
            { type: "stage", text: "For a moment, beneath the village noise, there is a faint iron ringing from under the hills. Borren's face is hard, but his voice is lower than usual." },
            { speaker: "Borren", text: "That's not chapel metal. That's not a wagon chain. That's an Embervein claim bell. My family's bell. And it should be dead quiet." },
          ],
          options: [
            ["TRIGGER_CLAIM_01", "What is Embervein?"],
            ["TRIGGER_BELL_01", "Why is the bell ringing?"],
            ["TRIGGER_FAMILY_01", "What does your family have to do with it?"],
            ["TRIGGER_BORIN_01", "Is Borin involved?"],
            ["TRIGGER_TASK_01", "What do you need us to do?"],
          ],
        },
        TRIGGER_CLAIM_01: {
          prompt: "What is Embervein?",
          lines: [
            { speaker: "Borren", text: "Old forge-mine under the hills. Proper name: Embervein Deepworks. My mother's line held the claim." },
            { type: "stage", text: "He grabs an iron key from a locked drawer." },
            { speaker: "Borren", text: "Not a treasure hole. Not a place for brave idiots. It was a duty. Worked, watched, sealed." },
          ],
          options: [
            ["TRIGGER_CLAIM_02", "Why was it sealed?"],
            ["TRIGGER_CLAIM_03", "Why hide it?"],
          ],
        },
        TRIGGER_CLAIM_02: {
          prompt: "Why was it sealed?",
          lines: [
            { speaker: "Borren", text: "Because old heat doesn't always die when the forge goes cold." },
            { type: "stage", text: "He closes his fist around the key." },
            { speaker: "Borren", text: "My family shut the lower works generations ago. Coal, fire, stone. That's all the warning I inherited, and it was enough." },
          ],
        },
        TRIGGER_CLAIM_03: {
          prompt: "Why hide it?",
          lines: [
            { speaker: "Borren", text: "To keep fools from doing exactly what someone has done." },
            { type: "stage", text: "He points toward the hill." },
            { speaker: "Borren", text: "An old claim is not safer because people know about it. It's safer when the right people remember and everyone else walks past." },
          ],
        },
        TRIGGER_BELL_01: {
          prompt: "Why is the bell ringing?",
          lines: [
            { speaker: "Borren", text: "Claim breach. Old forge oath. Deep trouble." },
            { type: "stage", text: "He speaks each phrase like he hates it." },
            { speaker: "Borren", text: "I opened no door. Swore no oath. Lit no old furnace. So someone else has broken in." },
          ],
          options: [
            ["TRIGGER_BELL_02", "Can you stop it?"],
            ["TRIGGER_BELL_03", "What happens if it keeps ringing?"],
          ],
        },
        TRIGGER_BELL_02: {
          prompt: "Can you stop it?",
          lines: [
            { speaker: "Borren", text: "Not from here. Bells like that are not stopped by stuffing cloth in the mouth." },
            { type: "stage", text: "He takes a breath." },
            { speaker: "Borren", text: "You answer them properly, with witness, mark, and proof. Or you find what woke them and put it right." },
          ],
        },
        TRIGGER_BELL_03: {
          prompt: "What happens if it keeps ringing?",
          lines: [
            { speaker: "Borren", text: "Then whatever is below stays awake." },
            { type: "stage", text: "He looks toward the floor." },
            { speaker: "Borren", text: "And if old furnaces are waking under this village, we need answers before the hill starts giving us heat we didn't ask for." },
          ],
        },
        TRIGGER_FAMILY_01: {
          prompt: "What does your family have to do with it?",
          lines: [
            { speaker: "Borren", text: "The Ashmantles held the claim through my mother's blood. Worked it when it was lawful. Sealed it when it wasn't. Watched the marks after." },
            { type: "stage", text: "He looks uncomfortable saying this much." },
            { speaker: "Borren", text: "I thought I inherited a warning and a locked door. Seems I inherited unfinished work." },
          ],
          options: [
            ["TRIGGER_FAMILY_02", "Are you responsible for it?"],
            ["TRIGGER_FAMILY_03", "What were they guarding?"],
          ],
        },
        TRIGGER_FAMILY_02: {
          prompt: "Are you responsible for it?",
          lines: [
            { speaker: "Borren", text: "I didn't break in. But responsibility isn't only blame." },
            { type: "stage", text: "He picks up his hammer, then sets it down again." },
            { speaker: "Borren", text: "If your family leaves a locked door and the lock fails, you don't stand there arguing with the hinge. You fix the damned problem." },
          ],
        },
        TRIGGER_FAMILY_03: {
          prompt: "What were they guarding?",
          lines: [
            { speaker: "Borren", text: "Fragments are all I have." },
            { type: "stage", text: "He counts on thick fingers." },
            { speaker: "Borren", text: "Coal. Fire. Stone. The forge-road. Old watchers. First heat. My grandmother said those words like nails in a door." },
            { type: "stage", text: "He scowls." },
            { speaker: "Borren", text: "That is not a map. Don't treat it like one." },
          ],
        },
        TRIGGER_BORIN_01: {
          prompt: "Is Borin involved?",
          lines: [
            { speaker: "Borren", text: "He's missing." },
            { type: "stage", text: "Borren's voice comes out rough." },
            { speaker: "Borren", text: "Not late. Not sulking. Missing. He noticed tools gone, old soot marks near the lower path, smoke where no smoke belongs. Then he went looking, because apparently I taught him to be useful and stupid." },
          ],
          options: [
            ["TRIGGER_BORIN_02", "What tools were stolen?"],
            ["TRIGGER_BORIN_03", "Could he still be alive?"],
          ],
        },
        TRIGGER_BORIN_02: {
          prompt: "What tools were stolen?",
          lines: [
            { speaker: "Borren", text: "Marking chisels. A soot hook. A bellows key. Old punches from the locked rack." },
            { type: "stage", text: "He looks at the empty spaces on the wall." },
            { speaker: "Borren", text: "Not valuable to sell. Valuable to someone trying to work old systems without the right hands." },
          ],
        },
        TRIGGER_BORIN_03: {
          prompt: "Could he still be alive?",
          lines: [
            { speaker: "Borren", text: "He'd better be." },
            { type: "stage", text: "The answer is too sharp. Borren reins it in." },
            { speaker: "Borren", text: "He knows enough to hide from ordinary danger. Not enough for old Deepworks trouble. If you find him, drag him out before listening to whatever clever thing he thinks he discovered." },
          ],
        },
        TRIGGER_TASK_01: {
          prompt: "What do you need us to do?",
          lines: [
            { speaker: "Borren", text: "Enter through the cold lift. Find who reopened the Deepworks. Look for Borin. Recover stolen tools if you can." },
            { type: "stage", text: "He hesitates." },
            { speaker: "Borren", text: "And if you find an old hammer in a sealed rack, or missing from one, bring it back or bring proof. Don't swing it around like a tavern trophy." },
          ],
          options: [
            ["TRIGGER_TASK_02", "Where is the cold lift?"],
            ["TRIGGER_TASK_03", "What proof do you need?"],
            ["TRIGGER_TASK_04", "Any last advice?"],
            ["SHOP", "Open the shop."],
          ],
        },
        TRIGGER_TASK_02: {
          prompt: "Where is the cold lift?",
          lines: [
            { speaker: "Borren", text: "North hill path. Split cairn. Iron frame sunk into the rock. Chain should be cold. If it's warm, step back and listen." },
            { type: "stage", text: "He hands over the key." },
            { speaker: "Borren", text: "This opens the outer lock. If something deeper opens for you, be suspicious." },
          ],
        },
        TRIGGER_TASK_03: {
          prompt: "What proof do you need?",
          lines: [
            { speaker: "Borren", text: "Claim marks. Stolen tools. Rack plates. Old maker signs under fresh soot. Anything that tells us who touched what." },
            { type: "stage", text: "He taps the bench." },
            { speaker: "Borren", text: "Stories bend. Iron doesn't, unless someone heats it first." },
          ],
        },
        TRIGGER_TASK_04: {
          prompt: "Any last advice?",
          lines: [
            { speaker: "Borren", text: "Take water. Take rope. Wrap your hands before touching old chains. If a furnace is lit and no smith is near it, assume the room is bait." },
            { type: "stage", text: "He points at your gear." },
            { speaker: "Borren", text: "And tighten that strap. I refuse to have my rescue plan ruined by lazy buckles." },
          ],
        },
        TRIGGER_END: {
          lines: [
            { speaker: "Borren", text: "Bring light. Bring proof. Bring Borin if you find him. And don't make me write your names on a failure list." },
          ],
          end: true,
        },
      },
    },
  };

  npcChats["boom-club"] = {
    ...npcChats.alchemist,
    npcId: "boom-club",
    boardNpcId: "boom-club",
    shopNpcId: "alchemist",
    preserveVisit: true,
    returnToVisitOnClose: true,
    portraitCaption: "Founder of Fizzwick's Boom Club",
    topicTitle: "Ask Fizzwick",
  };

  const chatState = {};

  function chatConfig(npcId = "") {
    return npcChats[npcId] ?? null;
  }

  function borrenTriggerActive() {
    const currentState = typeof state === "undefined" ? null : state;
    const progress = Number(currentState?.campaignProgress?.["embervein-first-claim"] ?? 0);
    const quest = currentState?.questFlags?.borrenClaimHammer;
    return progress > 0 || ["accepted", "completed"].includes(quest?.status) || Boolean(currentState?.questFlags?.["flag.borren.smithChainStarted"]);
  }

  function startNodeId(config) {
    return typeof config?.start === "function" ? config.start() : config?.start;
  }

  function endNodeId(config, npcId = "") {
    const local = stateFor(npcId);
    if (local.lastTone === "flirt" && config?.flirtEnd) {
      return typeof config.flirtEnd === "function" ? config.flirtEnd() : config.flirtEnd;
    }
    return typeof config?.end === "function" ? config.end() : config?.end;
  }

  function chatNode(config, nodeId = "") {
    return config?.nodes?.[nodeId] ?? null;
  }

  function canonicalChatNpcId(npcId = "") {
    return npcId === "boom-club" ? "alchemist" : npcId;
  }

  function stateFor(npcId = "") {
    const key = canonicalChatNpcId(npcId);
    chatState[key] ??= { stack: [] };
    return chatState[key];
  }

  const relationshipLevels = [
    { min: 0, label: "Stranger" },
    { min: 5, label: "Familiar" },
    { min: 15, label: "Trusted" },
    { min: 25, label: "Close" },
    { min: 40, label: "Dear" },
  ];
  const friendshipReadyPoints = 15;

  function relationshipKey(npcId = "") {
    return canonicalChatNpcId(npcId);
  }

  function activePartyChatHeroes() {
    return (state?.party?.heroIds?.length ? state.party.heroIds : ["hero"])
      .map((id) => state?.fighters?.[id])
      .filter((hero) => isRelationshipClassHero(hero));
  }

  function defaultRelationshipHeroId() {
    const activeId = state?.party?.activeHeroId;
    if (activeId && isRelationshipClassHero(state?.fighters?.[activeId])) return activeId;
    return (state?.party?.heroIds ?? ["hero"]).find((id) => isRelationshipClassHero(state?.fighters?.[id])) ?? "hero";
  }

  function activeRelationshipHeroId(npcId = "") {
    const local = npcId ? stateFor(npcId) : null;
    const localId = local?.speakerHeroId;
    if (localId && isRelationshipClassHero(state?.fighters?.[localId])) return localId;
    return defaultRelationshipHeroId();
  }

  function activeRelationshipHeroIds() {
    const ids = state?.party?.heroIds?.length ? state.party.heroIds : [activeRelationshipHeroId()];
    return ids.filter((id) => isRelationshipClassHero(state?.fighters?.[id]));
  }

  function isRelationshipAutonomousAlly(fighter) {
    return typeof isAutonomousAlly === "function" ? isAutonomousAlly(fighter) : false;
  }

  function isRelationshipClassHero(fighter) {
    return Boolean(fighter && !fighter.dead && (typeof isClassHero !== "function" || isClassHero(fighter)) && !isRelationshipAutonomousAlly(fighter));
  }

  function relationshipHeroName(heroId = "") {
    return state?.fighters?.[heroId]?.name ?? "Active Hero";
  }

  function relationshipEntryFor(npcId = "") {
    if (typeof state === "undefined" || !state) return { heroes: {} };
    state.npcRelationships ??= {};
    const key = relationshipKey(npcId);
    const existing = state.npcRelationships[key] && typeof state.npcRelationships[key] === "object" ? state.npcRelationships[key] : {};
    existing.heroes = existing.heroes && typeof existing.heroes === "object" ? existing.heroes : {};
    if ((existing.points || existing.flirt || existing.awarded) && Object.keys(existing.heroes).length === 0) {
      const heroId = activeRelationshipHeroId(npcId);
      existing.heroes[heroId] = {
        friendship: Math.max(0, Math.floor(Number(existing.points) || 0)),
        flirt: Math.max(0, Math.floor(Number(existing.flirt) || 0)),
        awarded: existing.awarded && typeof existing.awarded === "object" ? existing.awarded : {},
      };
      delete existing.points;
      delete existing.flirt;
      delete existing.awarded;
    }
    state.npcRelationships[key] = existing;
    return existing;
  }

  function relationshipFor(npcId = "", heroId = activeRelationshipHeroId(npcId)) {
    const entry = relationshipEntryFor(npcId);
    entry.heroes ??= {};
    const existing = entry.heroes[heroId] && typeof entry.heroes[heroId] === "object" ? entry.heroes[heroId] : {};
    existing.friendship = Math.max(0, Math.floor(Number(existing.friendship ?? existing.points) || 0));
    existing.flirt = Math.max(0, Math.floor(Number(existing.flirt) || 0));
    existing.awarded = existing.awarded && typeof existing.awarded === "object" ? existing.awarded : {};
    existing.dialogueCounts = existing.dialogueCounts && typeof existing.dialogueCounts === "object" ? existing.dialogueCounts : {};
    existing.dialogueCounts.general = Math.max(0, Math.floor(Number(existing.dialogueCounts.general) || 0));
    existing.dialogueCounts.personal = Math.max(0, Math.floor(Number(existing.dialogueCounts.personal) || 0));
    existing.dialogueProgress = existing.dialogueProgress && typeof existing.dialogueProgress === "object" ? existing.dialogueProgress : {};
    existing.dialogueProgress.general = Math.max(0, Math.floor(Number(existing.dialogueProgress.general ?? (existing.dialogueCounts.general % 10)) || 0));
    existing.dialogueProgress.personal = Math.max(0, Math.floor(Number(existing.dialogueProgress.personal ?? (existing.dialogueCounts.personal % 5)) || 0));
    delete existing.points;
    entry.heroes[heroId] = existing;
    return existing;
  }

  function relationshipLevel(points = 0) {
    let current = relationshipLevels[0];
    let next = null;
    for (let index = 0; index < relationshipLevels.length; index += 1) {
      if (points >= relationshipLevels[index].min) {
        current = relationshipLevels[index];
        next = relationshipLevels[index + 1] ?? null;
      }
    }
    return { current, next };
  }

  function relationshipTargetHeroIds(options = {}) {
    if (Array.isArray(options.heroIds) && options.heroIds.length) return [...new Set(options.heroIds.filter((id) => isRelationshipClassHero(state?.fighters?.[id])))];
    if (options.heroId && isRelationshipClassHero(state?.fighters?.[options.heroId])) return [options.heroId];
    if (options.scope === "active-party") return activeRelationshipHeroIds();
    return [activeRelationshipHeroId(options.npcId ?? "")];
  }

  function addNpcRelationship(npcId = "", amount = 1, source = "", options = {}) {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    if (!npcId || value <= 0) return false;
    let changed = false;
    for (const heroId of relationshipTargetHeroIds({ ...options, npcId })) {
      const rel = relationshipFor(npcId, heroId);
      const key = source ? `${source}` : "";
      if (key) {
        rel.awarded ??= {};
        if (rel.awarded[key]) continue;
        rel.awarded[key] = true;
      }
      rel.friendship = Math.max(0, Math.floor(Number(rel.friendship) || 0)) + value;
      if (options.flirt) rel.flirt = Math.max(0, Math.floor(Number(rel.flirt) || 0)) + Math.max(0, Math.floor(Number(options.flirt) || 0));
      changed = true;
    }
    return changed;
  }

  function addNpcFlirt(npcId = "", amount = 1, source = "", options = {}) {
    return addNpcRelationship(npcId, amount, source, { ...options, flirt: amount });
  }

  function relationshipHasAward(npcId = "", heroId = activeRelationshipHeroId(npcId), source = "") {
    if (!source) return false;
    const rel = relationshipFor(npcId, heroId);
    return Boolean(rel.awarded?.[source]);
  }

  function romanceEligible(npcId = "", heroId = activeRelationshipHeroId(npcId)) {
    const rel = relationshipFor(npcId, heroId);
    return rel.friendship >= friendshipReadyPoints && rel.flirt >= 3;
  }

  function friendshipEligible(npcId = "", heroId = activeRelationshipHeroId(npcId)) {
    return relationshipFor(npcId, heroId).friendship >= friendshipReadyPoints;
  }

  function awardDialogueRelationship(npcId = "", nodeId = "") {
    if (!nodeId || nodeId === startNodeId(chatConfig(npcId))) return;
    const heroId = activeRelationshipHeroId(npcId);
    const local = stateFor(npcId);
    const nodeKey = String(nodeId);
    if (nodeKey.includes("_FLIRT_")) {
      local.lastTone = "flirt";
      addNpcFlirt(npcId, 1, `dialogue:${nodeKey}`, { npcId, heroId });
      return;
    }
    if (nodeKey.endsWith("_END") || nodeKey.includes("_END_")) return;
    awardQuestionFamiliarity(npcId, heroId, nodeKey);
  }

  function personalDialogueNode(nodeId = "") {
    const id = String(nodeId || "");
    if (id.includes("_LIFE_") || id.includes("_PERSONAL_") || id.includes("_PAST_") || id.includes("_FAMILY_")) return true;
    return [
      "VAELION_UNDEAD_04",
      "BORREN_APPRENTICE_01",
      "BORREN_APPRENTICE_02",
      "BORREN_APPRENTICE_03",
      "BORREN_APPRENTICE_04",
      "BORREN_FORGE_01",
      "BORREN_FORGE_02",
      "BORREN_FORGE_03",
      "BORREN_FORGE_04",
    ].includes(id);
  }

  function awardQuestionFamiliarity(npcId = "", heroId = "", nodeId = "") {
    const rel = relationshipFor(npcId, heroId);
    const source = `dialogue-question:${nodeId}`;
    if (rel.awarded?.[source]) return;
    rel.awarded[source] = true;
    const personal = personalDialogueNode(nodeId);
    const kind = personal ? "personal" : "general";
    const threshold = personal ? 5 : 10;
    rel.dialogueCounts ??= { general: 0, personal: 0 };
    rel.dialogueCounts[kind] = Math.max(0, Math.floor(Number(rel.dialogueCounts[kind]) || 0)) + 1;
    rel.dialogueProgress ??= { general: 0, personal: 0 };
    rel.dialogueProgress[kind] = Math.max(0, Math.floor(Number(rel.dialogueProgress[kind]) || 0)) + 1;
    if (rel.dialogueProgress[kind] >= threshold) {
      rel.dialogueProgress[kind] -= threshold;
      addNpcRelationship(npcId, 1, `dialogue-${kind}-milestone:${rel.dialogueCounts[kind]}`, { npcId, heroId });
    }
  }

  function adjustNpcRelationship(npcId = "", field = "", delta = 0, options = {}) {
    if (!adminEnabled?.()) return false;
    const heroId = options.heroId && isRelationshipClassHero(state?.fighters?.[options.heroId]) ? options.heroId : activeRelationshipHeroId(npcId);
    const rel = relationshipFor(npcId, heroId);
    const key = field === "chemistry" || field === "flirt" ? "flirt" : "friendship";
    const amount = Math.floor(Number(delta) || 0);
    rel[key] = Math.max(0, Math.floor(Number(rel[key]) || 0) + amount);
    return true;
  }

  function adminRelationshipControlsMarkup(npcId = "", heroId = "", friendship = 0, chemistry = 0) {
    if (!adminEnabled?.()) return "";
    const button = (field, delta, label) =>
      `<button type="button" data-action="admin-npc-relationship" data-npc="${escapeAttribute(npcId)}" data-hero="${escapeAttribute(heroId)}" data-field="${escapeAttribute(field)}" data-delta="${escapeAttribute(delta)}">${escapeHtml(label)}</button>`;
    return `
      <div class="npc-relationship-admin">
        <b>Admin</b>
        <span>Friendship ${escapeHtml(friendship)}</span>
        <div>${button("friendship", -5, "-5")}${button("friendship", -1, "-1")}${button("friendship", 1, "+1")}${button("friendship", 5, "+5")}</div>
        <span>Chemistry ${escapeHtml(chemistry)}</span>
        <div>${button("chemistry", -5, "-5")}${button("chemistry", -1, "-1")}${button("chemistry", 1, "+1")}${button("chemistry", 5, "+5")}</div>
      </div>
    `;
  }

  function relationshipMarkup(npcId = "") {
    const heroId = activeRelationshipHeroId(npcId);
    const rel = relationshipFor(npcId, heroId);
    const points = Math.max(0, Math.floor(Number(rel.friendship) || 0));
    const flirt = Math.max(0, Math.floor(Number(rel.flirt) || 0));
    const { current, next } = relationshipLevel(points);
    const base = current?.min ?? 0;
    const target = next?.min ?? Math.max(points, base + 1);
    const span = Math.max(1, target - base);
    const filled = next ? Math.min(100, Math.max(0, ((points - base) / span) * 100)) : 100;
    const note = next ? `${points} / ${target} to ${next.label}` : `${points}+`;
    const flirtFilled = Math.min(100, (flirt / 5) * 100);
    const pathNote = romanceEligible(npcId, heroId) ? "Romance path ready" : friendshipEligible(npcId, heroId) ? "Friendship path ready" : `${relationshipHeroName(heroId)} speaking`;
    return `
      <div class="npc-relationship-meter">
        <div class="npc-relationship-header">
          <span>Friendship</span>
          <b>${escapeHtml(current?.label ?? "Stranger")}</b>
        </div>
        <div class="npc-relationship-track" aria-hidden="true"><i style="width: ${filled.toFixed(2)}%"></i></div>
        <small>${escapeHtml(note)}</small>
        <div class="npc-relationship-header secondary">
          <span>Chemistry</span>
          <b>${escapeHtml(flirt)}</b>
        </div>
        <div class="npc-relationship-track chemistry" aria-hidden="true"><i style="width: ${flirtFilled.toFixed(2)}%"></i></div>
        <small>${escapeHtml(pathNote)}</small>
        ${adminRelationshipControlsMarkup(npcId, heroId, points, flirt)}
      </div>
    `;
  }

  function speakerSelectorMarkup(npcId = "") {
    const heroes = activePartyChatHeroes();
    if (heroes.length <= 1) return "";
    const currentId = activeRelationshipHeroId(npcId);
    return `
      <div class="npc-chat-speaker">
        <span>Speaking as</span>
        <div>
          ${heroes
            .map((hero) => `
              <button
                type="button"
                class="${hero.id === currentId ? "active" : ""}"
                data-action="npc-chat-speaker"
                data-npc="${escapeAttribute(npcId)}"
                data-hero="${escapeAttribute(hero.id)}"
              >${escapeHtml(hero.name ?? "Hero")}</button>
            `)
            .join("")}
        </div>
      </div>
    `;
  }

  function flagValue(flag = "") {
    return Boolean(flag && state?.questFlags?.[flag]);
  }

  function normalizeOption(option) {
    if (Array.isArray(option)) return { id: option[0], label: option[1] };
    return option ?? null;
  }

  function optionVisible(option, config = null) {
    if (!option) return false;
    if (option.ifFlag && !flagValue(option.ifFlag)) return false;
    if (option.unlessFlag && flagValue(option.unlessFlag)) return false;
    if (option.ifFriendshipAtLeast !== undefined) {
      const required = Math.max(0, Math.floor(Number(option.ifFriendshipAtLeast) || 0));
      const npcId = option.ifFriendshipNpc || config?.npcId || "";
      if ((relationshipFor(npcId).friendship ?? 0) < required) return false;
    }
    if (option.ifFriendship && !friendshipEligible(option.ifFriendship === true ? config?.npcId ?? "" : option.ifFriendship)) return false;
    if (option.ifRomance && !romanceEligible(option.ifRomance === true ? config?.npcId ?? "" : option.ifRomance)) return false;
    return true;
  }

  function optionButton(config, option, className = "") {
    const normalized = normalizeOption(option);
    const { id, label } = normalized ?? {};
    return `<button type="button" class="${className}" data-action="npc-chat-option" data-npc="${escapeAttribute(config.npcId)}" data-chat-state="${escapeAttribute(startNodeId(config))}" data-option="${escapeAttribute(id)}">${escapeHtml(label)}</button>`;
  }

  function lineMarkup(line) {
    if (!line) return "";
    if (line.type === "stage") return `<p class="maelis-stage-direction">${escapeHtml(line.text ?? "")}</p>`;
    return `<p><b>${escapeHtml(line.speaker ?? "")}:</b> ${escapeHtml(line.text ?? "")}</p>`;
  }

  function closeShopkeeperChat(npcId, config) {
    const local = stateFor(npcId);
    local.stack = [];
    local.lastTone = "";
    window.stopCurrentVoiceLine?.();
    els.villageMenu?.classList.remove("npc-chat-open", "maelis-chat-open");
    if (config?.returnToVisitOnClose) {
      const behavior = window.DungeonNpcBehaviors?.[npcId];
      if (typeof behavior?.returnToVisit === "function") {
        behavior.returnToVisit();
        return;
      }
    }
    renderVillageMenu();
  }

  function revealBoomClub() {
    if (!state) return;
    state.questFlags ??= {};
    state.questFlags.knowsBoomClub = true;
  }

  async function joinBoomClub(npcId, config) {
    if (!state) return;
    revealBoomClub();
    state.questFlags["flag.village.boomClubUnlocked"] = true;
    renderShopkeeperChat(npcId, "FIZZ_JOINED_01", { push: false });
    await window.DepthboundFactionIntros?.presentNow?.("boom-club");
    renderShopkeeperChat(npcId, startNodeId(config), { resetStack: true });
    renderQuestLogButton?.();
  }

  function applyChatNodeAction(npcId, nodeId, node) {
    if (node?.action === "DISCOVER_BOOM_CLUB") revealBoomClub();
    if (node?.action === "SOPHIE_RESERVE_UNLOCK") window.DepthboundSophieQuests?.unlockReserve?.();
    if (node?.action === "SOPHIE_TRAVEL_PAPERS_ACCEPT") window.DepthboundSophieQuests?.accept?.("travel-papers");
    if (node?.action === "SOPHIE_PACKS_UNLOCK") window.DepthboundSophieQuests?.unlockPacks?.();
    if (node?.action === "SOPHIE_LAST_MINUTE_ACCEPT") window.DepthboundSophieQuests?.accept?.("last-minute-kit");
    if (node?.action === "KESSA_TRACK_CASTS_ACCEPT") window.DepthboundKessaQuests?.accept?.("track-casts");
    if (node?.action === "KESSA_WYVERN_TEETH_ACCEPT") window.DepthboundKessaQuests?.accept?.("wyvern-teeth");
    if (node?.action === "KESSA_LEARNED_BEAST_ACCEPT") window.DepthboundKessaQuests?.accept?.("beast-that-learned");
    if (node?.action === "KESSA_FANG_GUARD_ACCEPT") window.DepthboundKessaQuests?.accept?.("fang-guard");
    if (node?.action === "ODRAN_GRAVE_MARK_ACCEPT") window.DepthboundOdranQuests?.accept?.("grave-mark");
    if (node?.action === "ODRAN_BLACK_CANDLE_ACCEPT") window.DepthboundOdranQuests?.accept?.("black-candle");
    if (node?.action === "ODRAN_LEDGER_DEBTS_ACCEPT") window.DepthboundOdranQuests?.accept?.("ledger-debts");
    if (node?.action === "ODRAN_NAME_BELL_ACCEPT") window.DepthboundOdranQuests?.accept?.("name-bell");
    if (node?.action === "TAVREN_FIELD_NOTES_ACCEPT") window.DepthboundTavrenQuests?.accept?.("field-notes");
    if (node?.action === "TAVREN_CONDUCTIVE_MOSS_ACCEPT") window.DepthboundTavrenQuests?.accept?.("conductive-moss");
    if (node?.action === "TAVREN_FOURFOLD_LENS_ACCEPT") window.DepthboundTavrenQuests?.accept?.("fourfold-lens");
    if (node?.action === "TAVREN_STORM_VALVE_ACCEPT") window.DepthboundTavrenQuests?.accept?.("storm-valve");
    if (node?.action === "SERAPHEL_CATALOGING_ACCEPT") window.DepthboundSeraphelQuests?.accept?.("cataloging");
    if (node?.action === "SERAPHEL_PROVENANCE_ACCEPT") window.DepthboundSeraphelQuests?.accept?.("provenance");
    if (node?.action === "SERAPHEL_LOST_ROOM_ACCEPT") window.DepthboundSeraphelQuests?.accept?.("lost-room");
    if (node?.action === "SERAPHEL_BLACK_LABEL_ACCEPT") window.DepthboundSeraphelQuests?.accept?.("black-label");
    if (node?.action === "NELLA_ROUTE_NOTES_ACCEPT") window.DepthboundNellaQuests?.accept?.("route-notes");
    if (node?.action === "NELLA_RED_LEDGER_ACCEPT") window.DepthboundNellaQuests?.accept?.("red-ledger");
    if (node?.action === "NELLA_MILEPOST_CACHE_ACCEPT") window.DepthboundNellaQuests?.accept?.("milepost-cache");
    if (node?.action === "NELLA_WAYMARK_CHARTER_ACCEPT") window.DepthboundNellaQuests?.accept?.("waymark-charter");
    if (node?.action === "BRAKKA_FOOTWORK_ACCEPT") window.DepthboundBrakkaQuests?.accept?.("footwork-straps");
    if (node?.action === "BRAKKA_CLEAN_BOUTS_ACCEPT") window.DepthboundBrakkaQuests?.accept?.("clean-bouts");
    if (node?.action === "BRAKKA_STOP_BELL_ACCEPT") window.DepthboundBrakkaQuests?.accept?.("stop-bell");
    if (node?.action === "BRAKKA_CHAMPION_WRAP_ACCEPT") window.DepthboundBrakkaQuests?.accept?.("champion-wraps");
    if (node?.action === "SARTHAX_SCROLL_HANDLING_ACCEPT") window.DepthboundSarthaxQuests?.accept?.("scroll-handling");
    if (node?.action === "SARTHAX_INK_PURITY_ACCEPT") window.DepthboundSarthaxQuests?.accept?.("ink-purity");
    if (node?.action === "SARTHAX_CONTAINMENT_GEOMETRY_ACCEPT") window.DepthboundSarthaxQuests?.accept?.("containment-geometry");
    if (node?.action === "SARTHAX_CONTROLLED_CONSEQUENCE_ACCEPT") window.DepthboundSarthaxQuests?.accept?.("controlled-consequence");
    if (node?.action === "FIZZ_LEAST_DANGEROUS_ACCEPT") window.DepthboundFizzwickQuests?.accept?.("least-dangerous");
    if (node?.action === "FIZZ_COMMUNITY_DOCUMENTATION_ACCEPT") window.DepthboundFizzwickQuests?.accept?.("community-documentation");
    if (node?.action === "FIZZ_BRASS_REGULATOR_ACCEPT") window.DepthboundFizzwickQuests?.accept?.("brass-regulator");
    if (node?.action === "FIZZ_ALMOST_RESPONSIBLE_ACCEPT") window.DepthboundFizzwickQuests?.accept?.("almost-responsible");
    if (node?.action === "ILYRA_FIRST_AID_ACCEPT") window.DepthboundIlyraQuests?.accept?.("first-aid-stock");
    if (node?.action === "ILYRA_RARE_HERBS_ACCEPT") window.DepthboundIlyraQuests?.accept?.("rare-herbs");
    if (node?.action === "ILYRA_AUNTS_REMEDY_ACCEPT") window.DepthboundIlyraQuests?.accept?.("aunts-remedy");
    if (node?.action === "ILYRA_LAST_BREATH_ACCEPT") window.DepthboundIlyraQuests?.accept?.("last-breath-cordial");
    if (node?.action === "VELL_ICHOR_STOCK_ACCEPT") window.DepthboundVellQuests?.accept?.("ichor-stock");
    if (node?.action === "VELL_ICHOR_THEORY_ACCEPT") window.DepthboundVellQuests?.accept?.("ichor-theory");
    if (node?.action === "VELL_CURSE_KNOT_ACCEPT") window.DepthboundVellQuests?.accept?.("curse-knot");
    if (node?.action === "VELL_KNOT_CUTTER_ACCEPT") window.DepthboundVellQuests?.accept?.("knot-cutter");
    if (node?.action === "VAELION_HONEST_EDGE_ACCEPT") window.DepthboundVaelionQuests?.accept?.("honest-edge");
    if (node?.action === "VAELION_COMPANY_TOKEN_ACCEPT") window.DepthboundVaelionQuests?.accept?.("company-token");
    if (node?.action === "VAELION_QUIET_BLADE_STUDY_ACCEPT") window.DepthboundVaelionQuests?.accept?.("quiet-blade-study");
    if (node?.action === "VAELION_QUIET_EDGE_ACCEPT") window.DepthboundVaelionQuests?.accept?.("quiet-edge");
    if (node?.action === "BORREN_ARMOR_CARE_ACCEPT") window.DepthboundBorrenQuests?.accept?.("armor-care");
    if (node?.action === "BORREN_CLAIM_MARKS_ACCEPT") window.DepthboundBorrenQuests?.accept?.("claim-marks");
    if (node?.action === "BORREN_BORIN_MARK_ACCEPT") window.DepthboundBorrenQuests?.accept?.("borin-mark");
    if (node?.action === "BORREN_CUSTOM_WEAPON_ACCEPT") window.DepthboundBorrenQuests?.accept?.("custom-weapon");
    awardDialogueRelationship(npcId, nodeId);
  }

  function currentChatNodeId(config, npcId = "") {
    const local = stateFor(npcId);
    return local.stack?.[local.stack.length - 1] || startNodeId(config);
  }

  function switchChatSpeaker(npcId = "", heroId = "") {
    const config = chatConfig(npcId);
    if (!config || !isRelationshipClassHero(state?.fighters?.[heroId])) return;
    const local = stateFor(npcId);
    local.speakerHeroId = heroId;
    renderShopkeeperChat(npcId, currentChatNodeId(config, npcId), { push: false, skipAction: true });
  }

  function renderShopkeeperChat(npcId = "", nodeId = "", options = {}) {
    const config = chatConfig(npcId);
    if (!config) return renderVillageMenu();
    const npc = window.DungeonContent?.get?.("npcs", npcId);
    const start = startNodeId(config);
    const current = nodeId || start;
    const node = chatNode(config, current) ?? chatNode(config, start);
    const isHub = current === start || !nodeId;
    const local = stateFor(npcId);
    if (!isRelationshipClassHero(state?.fighters?.[local.speakerHeroId])) {
      local.speakerHeroId = defaultRelationshipHeroId();
    }
    if (!options.skipAction) applyChatNodeAction(npcId, current, node);
    hideStoreMenu?.();
    if (isHub || options.resetStack) {
      local.stack = isHub ? [] : [current];
      if (options.resetStack) local.lastTone = "";
      if (options.resetStack) local.speakerHeroId = defaultRelationshipHeroId();
    } else if (options.push !== false && local.stack[local.stack.length - 1] !== current) {
      local.stack.push(current);
    }
    const speakerName = relationshipHeroName(activeRelationshipHeroId(npcId));
    const visibleOptions = (node?.options ?? [])
      .map(normalizeOption)
      .filter((entry) => optionVisible(entry, config))
      .filter((entry) => isHub || entry.id !== "SHOP");

    els.villageMenu?.classList.remove("hidden", "guild-open");
    els.villageMenu?.classList.add("npc-chat-open", "maelis-chat-open");
    setVillageBackButtonVisible(true);
    const musicKey = config.musicKey || (typeof villageMusicKeyForNpc === "function" ? villageMusicKeyForNpc(npcId) : "village");
    setVillageMusicKey(musicKey || "village");
    els.villageBody.innerHTML = `
      <section class="maelis-chat-view">
        <aside class="maelis-chat-portrait">
          ${npcPortraitMarkup(npc, "old-lady-chat-image", { clickable: false })}
          <div>
            <b>${escapeHtml(npc?.name ?? "Merchant")}</b>
            <span>${escapeHtml(config.portraitCaption ?? npc?.title ?? "")}</span>
          </div>
          ${speakerSelectorMarkup(npcId)}
          ${relationshipMarkup(npcId)}
        </aside>
        <div class="maelis-chat-main">
          <section class="maelis-chat-text">
            ${node?.prompt ? `<p class="old-lady-chat-player">${escapeHtml(speakerName)}: ${escapeHtml(node.prompt)}</p>` : ""}
            ${(node?.lines ?? []).map(lineMarkup).join("")}
          </section>
          ${
            node?.end || !visibleOptions.length
              ? ""
              : `<section class="maelis-main-topics">
                  <h3>${escapeHtml(isHub ? config.topicTitle : "Continue asking")}</h3>
                  <div class="maelis-topic-grid">
                    ${visibleOptions.map((entry) => optionButton(config, entry)).join("")}
                  </div>
                </section>`
          }
          <div class="maelis-chat-footer">
            ${
              node?.end
                ? optionButton(config, ["CLOSE", "Leave"], "ghost-button")
                : `
                  ${!isHub && local.stack.length > 1 ? optionButton(config, ["BACK", config.backLabel], "ghost-button") : ""}
                  ${!isHub ? optionButton(config, ["TOPICS", config.topicsLabel], "ghost-button") : ""}
                  ${optionButton(config, ["END", config.leaveLabel], "ghost-button")}
                `
            }
          </div>
        </div>
      </section>
    `;
    resetVillageScroll();
  }

  function useShopkeeperChatOption(npcId = "", optionId = "") {
    const config = chatConfig(npcId);
    if (!config) return;
    const local = stateFor(npcId);
    if (optionId === "SHOP") {
      showStoreMenu(config.shopNpcId || npcId);
      return;
    }
    if (optionId === "FIZZ_JOIN_CLUB") {
      joinBoomClub(npcId, config);
      return;
    }
    if (optionId === "BOARD") {
      const boardNpcId = config.boardNpcId;
      if (boardNpcId && window.DungeonNpcBehaviors?.[boardNpcId]?.visit) {
        stateFor(npcId).stack = [];
        window.stopCurrentVoiceLine?.();
        els.villageMenu?.classList.remove("npc-chat-open", "maelis-chat-open");
        window.DungeonNpcBehaviors[boardNpcId].visit();
        return;
      }
      closeShopkeeperChat(npcId, config);
      return;
    }
    if (optionId === "CLOSE") {
      closeShopkeeperChat(npcId, config);
      return;
    }
    if (optionId === "END") {
      renderShopkeeperChat(npcId, endNodeId(config, npcId));
      return;
    }
    if (optionId === "TOPICS") {
      renderShopkeeperChat(npcId, startNodeId(config), { push: false });
      return;
    }
    if (optionId === "BACK") {
      if (local.stack.length > 1) {
        local.stack.pop();
        renderShopkeeperChat(npcId, local.stack[local.stack.length - 1], { push: false });
      } else {
        renderShopkeeperChat(npcId, startNodeId(config), { push: false });
      }
      return;
    }
    if (!chatNode(config, optionId)) {
      renderShopkeeperChat(npcId, startNodeId(config), { push: false });
      return;
    }
    renderShopkeeperChat(npcId, optionId);
  }

  window.DepthboundNpcRelationships = {
    add: addNpcRelationship,
    addParty(npcId = "", amount = 1, source = "") {
      return addNpcRelationship(npcId, amount, source, { scope: "active-party" });
    },
    addFlirt: addNpcFlirt,
    adjust: adjustNpcRelationship,
    switchSpeaker: switchChatSpeaker,
    canFriend: friendshipEligible,
    canRomance: romanceEligible,
    get(npcId = "", heroId = activeRelationshipHeroId()) {
      const rel = relationshipFor(npcId, heroId);
      return {
        heroId,
        heroName: relationshipHeroName(heroId),
        friendship: Math.max(0, Math.floor(Number(rel.friendship) || 0)),
        chemistry: Math.max(0, Math.floor(Number(rel.flirt) || 0)),
        level: relationshipLevel(rel.friendship).current?.label ?? "Stranger",
        friendshipReady: friendshipEligible(npcId, heroId),
        romanceReady: romanceEligible(npcId, heroId),
      };
    },
  };

  window.DungeonNpcBehaviors ??= {};
  for (const npcId of Object.keys(npcChats)) {
    const existingBehavior = window.DungeonNpcBehaviors[npcId] ?? {};
    const config = npcChats[npcId];
    const chatVisit = () => renderShopkeeperChat(npcId, startNodeId(config), { resetStack: true });
    window.DungeonNpcBehaviors[npcId] = {
      ...existingBehavior,
      visit: config.preserveVisit && typeof existingBehavior.visit === "function" ? existingBehavior.visit : chatVisit,
      returnToVisit:
        config.preserveVisit && typeof existingBehavior.returnToVisit === "function" ? existingBehavior.returnToVisit : chatVisit,
      startChat(chatStateId) {
        renderShopkeeperChat(npcId, chatStateId || startNodeId(config), { resetStack: true });
      },
      useChatOption(_chatStateId, optionId) {
        useShopkeeperChatOption(npcId, optionId);
      },
    };
  }
})();
