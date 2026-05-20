(() => {
  window.DungeonNpcChats ??= {};

  const line = (speaker, text) => ({ speaker, text });
  const option = (id, label, player, maraLines) => ({
    id,
    label,
    lines: [line("Player", player), ...maraLines.map((text) => line("Mara", text))],
  });

  window.DungeonNpcChats.oldLady = {
    states: {
      "green-vines-accepted": {
        greeting:
          "Still need those vines, dear. Green ones. Not brown, not thorny, not anything that bites back unless you bite first.",
        options: [
          option("vines-purpose", "What do you need the vines for?", "What do you need the Green Vines for?", [
            "For broth. Good broth, not that watery sadness the inn calls soup.",
            "Green Vines pull fever from the blood. Also bitterness from old bones, if you boil them right.",
          ]),
          option("herb-knowledge", "You know a lot about herbs.", "You know a lot about herbs.", [
            "I know enough not to die of a cough, which puts me ahead of half the village.",
            "My mother taught me. Her mother taught her. Men went to war; women learned what kept them alive when they came back full of holes.",
          ]),
          option("afraid-guardroom", "Are you afraid of the Guardroom?", "Are you afraid of the Old Guardroom?", [
            "Of course I am.",
            "Only fools and drunk boys aren't afraid of places where the dead still stand watch.",
          ]),
        ],
      },
      "green-vines-completed": {
        greeting: "That broth will do. Not perfect, but nothing is perfect after the grave gets involved.",
        options: [
          option("relieved", "You seem relieved.", "You seem relieved.", [
            "Relieved? No. Busy.",
            "Relief is for people who think trouble leaves when you close the door.",
          ]),
          option("always-lived-here", "Did you always live here?", "Did you always live near the Old Guardroom?", [
            "Long enough to remember when children dared each other to knock on its gate.",
            "Long enough to remember when something knocked back.",
          ]),
          option("sister-maelis", "Do you know Sister Maelis?", "Do you know Sister Maelis?", [
            "That grave-priestess? Good spine on her. Too much sorrow in the eyes.",
            "She prays over the dead. I feed the living. Between us, we're losing more slowly.",
          ]),
        ],
      },
      "crypt-guards-accepted": {
        greeting: "The ones at the door still standing? Then don't sit here warming your hands.",
        options: [
          option("why-guards", "Why the Crypt Guards first?", "Why do you care about the Crypt Guards?", [
            "Because guards at a door mean something behind it wants keeping.",
            "And if the dead are guarding again, then someone gave them orders.",
          ]),
          option("real-soldiers", "Were they soldiers?", "Were those Crypt Guards real soldiers once?", [
            "Aye. Most likely.",
            "That's the ugly part. Armor remembers duty even when the man inside is gone.",
          ]),
          option("guard-advice", "Any advice?", "Any advice before I fight them?", [
            "Don't admire the armor. Hit what's moving.",
            "And if one raises a shield, don't argue with it from the front.",
          ]),
        ],
      },
      "crypt-guards-completed": {
        greeting: "So. The door has fewer dead men around it. Good. Doors should know their place.",
        options: [
          option("knew-them", "You knew them, didn't you?", "You talk like you knew those guards.", [
            "The Guards? Not them. Their kind.",
            "Same boots. Same orders. Same habit of dying where someone important told them to stand.",
          ]),
          option("village-reaction", "What did the village say?", "How did the village react?", [
            "The baker crossed himself. The innkeeper charged more for ale. Sophie tried to sell me 'anti-ghost candles.'",
            "I told her I already own a broom.",
          ]),
          option("whats-next", "What's next?", "What do you think is deeper inside?", [
            "Names.",
            "Old rooms keep names better than people do. Find enough of them, and the dead start becoming men again.",
          ]),
        ],
      },
      "relics-accepted": {
        greeting: "Buttons, badges, nameplates. Little things. That's what's left when glory rots.",
        options: [
          option("why-relics", "Why collect old relics?", "Why do you want old guardroom relics?", [
            "Because a man's name on metal is still a name.",
            "You bring me those scraps, and I'll remember them properly. Someone should.",
          ]),
          option("married-soldier", "Were you married to a soldier?", "Did you have someone in the Guardroom?", [
            "Had? Hm.",
            "I had a husband who wore a watchman's badge and thought duty was warmer than his own bed.",
          ]),
          option("you-sound-angry", "You sound angry.", "You sound angry at them.", [
            "I am.",
            "And I loved them. Don't look so surprised. Those two things share a roof often enough.",
          ]),
        ],
      },
      "relics-completed": {
        greeting: "Set them there. Gently. Dead men have had enough rough handling.",
        options: [
          option("what-with-relics", "What will you do with them?", "What will you do with the relics?", [
            "Clean them. Read what names I can. Wrap them in cloth.",
            "Then I'll put them by the hearth until I can bear to bury them.",
          ]),
          option("recognize-names", "Do you recognize any?", "Do you recognize any of the names?", [
            "One. Maybe two.",
            "Time chews letters, but grief has sharp eyes.",
          ]),
          option("others-asking", "Did anyone else ask about them?", "Has anyone else been asking about these relics?", [
            "The dwarf armorsmith did. Borren Ashmantle. Pretended it was about metalwork.",
            "It wasn't. He hears things in old armor, that one.",
          ]),
        ],
      },
      "bones-bows-accepted": {
        greeting: "Bone recruits and bowmen now. Hah. Even dead armies need fools in the front and cowards in the back.",
        options: [
          option("why-recruits", "Why are there recruits?", "Why would there be Bone Recruits?", [
            "Because old commanders never stop recruiting.",
            "Boy dies scared, gets buried badly, and some curse puts a sword back in his hand. Cruel thing.",
          ]),
          option("pity-skeletons", "You pity them?", "You pity the skeletons?", [
            "I pity what they were.",
            "What they are now needs breaking before it breaks someone else.",
          ]),
          option("archer-advice", "What about the archers?", "Any advice about the Skeleton Archers?", [
            "Close distance. Break fingers. Don't stand in doorways looking heroic.",
            "Heroic people are very easy to aim at.",
          ]),
        ],
      },
      "bones-bows-completed": {
        greeting: "Good. Fewer bones walking. The ground may forgive us yet.",
        options: [
          option("you-look-tired", "You look tired.", "You look tired, Mara.", [
            "I am old. Tired is the tax on breathing.",
            "But I slept better when you brought fewer dead to my door.",
          ]),
          option("dead-dream", "Do the dead dream?", "Do you think the dead dream?", [
            "Some do.",
            "Not soft dreams. Bitter ones. Orders shouted in the dark. Doors they failed to hold. Faces they cannot remember.",
          ]),
          option("vaelion-help", "Did the weaponsmith help?", "Has Vaelion said anything about the undead weapons?", [
            "The elf? He says the old blades are ashamed.",
            "Elves always make sadness sound expensive, but I think he's right.",
          ]),
        ],
      },
      "bitter-root-accepted": {
        greeting: "Black Briar Root and the Old Sergeant. Mind you don't confuse them. The root is less stubborn.",
        options: [
          option("black-briar-root", "What is Black Briar Root?", "What is Black Briar Root?", [
            "A nasty root from nasty soil.",
            "Boil it wrong and it poisons you. Boil it right and it quiets dreams that should have ended years ago.",
          ]),
          option("old-sergeant", "Who was the Old Sergeant?", "Do you know who the Old Sergeant was?", [
            "I know what sergeants are.",
            "Men who shout boys into shape, then pretend not to love them when they die.",
          ]),
          option("personal", "Is this personal?", "Is this personal for you?", [
            "Everything with the dead is personal.",
            "You just don't always know whose heart is buried under the floor.",
          ]),
        ],
      },
      "bitter-root-completed": {
        greeting: "So the Sergeant is down. Good. May he finally stop counting men who aren't coming back.",
        options: [
          option("root-help", "Did the root help?", "Will the Black Briar Root help?", [
            "It will help me brew something strong enough for the last one.",
            "Not for his body. For what's still tied to it.",
          ]),
          option("knew-coming", "You knew this was coming.", "You knew there would be one more.", [
            "There is always one more.",
            "A place like that does not stay awake because of foot soldiers. Something gives the order.",
          ]),
          option("commander", "Who is the Commander?", "Who was the Guardroom Commander?", [
            "A good man, once. Or close enough to fool us.",
            "He chose the Guardroom over everything. Over supper. Over sleep. Over me.",
          ]),
        ],
      },
      "last-watchman-accepted": {
        greeting: "The Commander waits, then. Of course he does. Waiting was always his talent.",
        options: [
          option("husband", "Was he your husband?", "Mara... was the Commander your husband?", [
            "Yes.",
            "And no. The man I married left long before the corpse started walking.",
          ]),
          option("his-name", "What was his name?", "What was his name?", [
            "Harlan.",
            "Commander Harlan Vale, to people who liked titles. Harlan, to me. Stubborn mule, to the kettle.",
          ]),
          option("revenge", "Do you want revenge?", "Do you want revenge?", [
            "No.",
            "Revenge is for hot blood. Mine's gone cold. I want the door shut. I want the watch ended.",
          ]),
          option("if-he-speaks", "What should I do if he speaks?", "What if he speaks to me?", [
            "Listen once.",
            "Then remember that curses can wear familiar voices like borrowed coats.",
          ]),
        ],
      },
      "all-complete": {
        greeting: "You did it, then. The old fool has finally left his post.",
        options: [
          option("are-you-alright", "Are you alright?", "Are you alright, Mara?", [
            "No.",
            "But I am lighter. That will do for an old woman.",
          ]),
          option("what-now", "What will you do now?", "What will you do now?", [
            "Make soup. Sweep the floor. Complain about prices.",
            "The world ends slower when someone keeps the hearth lit.",
          ]),
          option("forgive-harlan", "Do you forgive him?", "Do you forgive Harlan?", [
            "Some days.",
            "Other days I hope the afterlife has chairs hard enough for men who loved duty too much.",
          ]),
          option("keep-helping", "Will you keep helping us?", "Will you still help us?", [
            "You bring trouble. I'll bring broth.",
            "That is not friendship, mind you. That is logistics.",
          ]),
          option("village-news", "Any news from the village?", "Any news from the village?", [
            "Sister Maelis came by. Stood outside a long while before knocking.",
            "She said the cemetery was quieter. I told her quiet is not peace, but it's a start.",
          ]),
        ],
      },
    },
  };
})();
