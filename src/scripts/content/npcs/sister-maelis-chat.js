(() => {
  window.DungeonNpcChats ??= {};

  window.DungeonNpcChats.maelis = {
  "hubChoices": [
    {
      "id": "FAITH_01",
      "label": "Tell me about your faith."
    },
    {
      "id": "NAEVRA_01",
      "label": "Who is Naevra?"
    },
    {
      "id": "GRAVEYARD_01",
      "label": "What do you do here?"
    },
    {
      "id": "REVIVE_01",
      "label": "How does resurrection work?"
    },
    {
      "id": "CROWN_01",
      "label": "What do you know about the Barrow Crown?"
    },
    {
      "id": "MYTH_01",
      "label": "How was this world created?"
    },
    {
      "id": "PERSONAL_01",
      "label": "Tell me about yourself."
    },
    {
      "id": "FLIRT_01",
      "label": "You are strangely calm for someone surrounded by graves."
    },
    {
      "id": "MAELIS_SERVICES",
      "label": "I need your services."
    }
  ],
  "idleLines": [
    "Do not step on that grave. He was disagreeable in life and has not improved.",
    "If Matron Ash brings you a bone, praise her and give it to me.",
    "No, the funeral bell is not for sale.",
    "Yes, adventurers die more often than farmers. Farmers usually know when to stop digging.",
    "A clean graveyard is not a cheerful place. It is a disciplined one.",
    "If you hear singing from the old mausoleum, tell me whether it has harmony. Harmony means ghosts. No harmony means teenagers.",
    "The dead rarely mind visitors. They mind thieves.",
    "I keep tea in the chapel and holy water in the cupboard. Do not confuse them again.",
    "You have that look. The 'I touched the cursed object' look.",
    "Breathe. If you can still do that, most problems remain negotiable."
  ],
  "stateVariants": [
    {
      "progress": 1,
      "id": "STATE_D1_01",
      "addOn": "The robbed tomb was a lock. Now something below knows the lock has failed.",
      "label": "What did the tomb lock away?",
      "lines": [
        "Not only the Crown. A tomb can hold a body, a memory, an oath, or a command. This one held a command. Someone opened it without knowing what was listening."
      ]
    },
    {
      "progress": 2,
      "id": "STATE_D2_01",
      "addOn": "Oathbreakers, kneeling knights, a funeral mask. This is older than a theft. This is succession rot.",
      "label": "Why bind a king instead of kill him?",
      "lines": [
        "Because killing ends a reign. Binding preserves it for someone else to exploit. A dead king can become symbol, hostage, saint, curse, or weapon. The Crown made him all five."
      ]
    },
    {
      "progress": 3,
      "id": "STATE_D3_01",
      "addOn": "Those soldiers were buried with haste, not honor. Haste leaves gaps. The Depth loves gaps.",
      "label": "Can the drowned soldiers be saved?",
      "lines": [
        "Some, perhaps. Not by pretending they are all monsters. Find names. Break commands. Separate grief from orders. Then we may learn who can sleep and who must be fought."
      ]
    },
    {
      "progress": 4,
      "id": "STATE_D4_01",
      "addOn": "The Grave-Market proves what happens when the dead become inventory. Burn every ledger that prices a soul, but copy every name first.",
      "label": "Why copy the names before burning the ledgers?",
      "lines": [
        "Because evil records still contain victims. Destroying proof can be another burial without a name. We do not cleanse history by making it blank."
      ]
    },
    {
      "progress": 5,
      "id": "STATE_D5_01",
      "addOn": "The bells opened the way because bells were always meant to tell the dead the truth. That cathedral stayed silent for three hundred years. No wonder the dead knelt to the wrong sound.",
      "label": "Was Lady Yseld wrong?",
      "lines": [
        "She was afraid. She was manipulated. She was also responsible. Those truths do not cancel each other. Responsibility begins when fear stops being an excuse."
      ]
    },
    {
      "progress": 6,
      "id": "STATE_D6_01",
      "addOn": "If the Crown waits below, decide before you touch it. Relics like that prefer hesitation. Hesitation leaves room for whispers.",
      "label": "What would you do?",
      "lines": [
        "I would destroy it. Then I would write the names of everyone it used. Then I would sleep badly and call that mercy."
      ]
    },
    {
      "progress": 7,
      "id": "STATE_D7_01",
      "addOn": "The kingdom beneath the hills is becoming a tomb at last. That is not a small victory. Tombs are kinder than thrones when the ruler is dead.",
      "label": "Is it over?",
      "lines": [
        "One Crown is broken. One king is ended. One wound can begin to close. The world is full of other graves with other teeth. But yes, this thing is over."
      ]
    }
  ],
  "nodes": {
    "MAELIS_GREETING_FIRST": {
      "id": "MAELIS_GREETING_FIRST",
      "player": "",
      "lines": [
        "You are standing in a graveyard, carrying weapons, wounds, and questions. That means you are either very lost, very brave, or already one of my regular problems.",
        "She lifts her lantern slightly.",
        "I am Sister Maelis. Keeper of this yard, servant of Naevra, and the person who will be very cross if you die somewhere I cannot find the body."
      ],
      "options": [
        {
          "id": "FAITH_01",
          "label": "Tell me about your faith."
        },
        {
          "id": "NAEVRA_01",
          "label": "Who is Naevra?"
        },
        {
          "id": "GRAVEYARD_01",
          "label": "What do you do here?"
        },
        {
          "id": "REVIVE_01",
          "label": "How does resurrection work?"
        },
        {
          "id": "CROWN_01",
          "label": "What do you know about the Barrow Crown?"
        },
        {
          "id": "MYTH_01",
          "label": "How was this world created?"
        },
        {
          "id": "PERSONAL_01",
          "label": "Tell me about yourself."
        },
        {
          "id": "FLIRT_01",
          "label": "You are strangely calm for someone surrounded by graves."
        },
        {
          "id": "MAELIS_SERVICES",
          "label": "I need your services."
        },
        {
          "id": "MAELIS_GOODBYE",
          "label": "I should go."
        }
      ],
      "service": null
    },
    "MAELIS_GREETING_REPEAT": {
      "id": "MAELIS_GREETING_REPEAT",
      "player": "",
      "lines": [
        "Back again. Good. I prefer repeat visitors when they are still breathing."
      ],
      "options": [],
      "service": null
    },
    "FAITH_01": {
      "id": "FAITH_01",
      "player": "",
      "lines": [
        "My faith is not built on comfort. It is built on accuracy.",
        "Naevra teaches that the dead must be named, recorded, buried, mourned, and, when necessary, argued with. A body is not refuse. A ghost is not automatically a monster. A corpse is not a tool. Every dead person was once a whole world of habits, debts, sins, songs, and unfinished sentences."
      ],
      "options": [
        {
          "id": "NAEVRA_01",
          "label": "Who is Naevra?"
        },
        {
          "id": "FAITH_02",
          "label": "Why do names matter so much?"
        },
        {
          "id": "FAITH_03",
          "label": "Do you worship death?"
        },
        {
          "id": "FAITH_04",
          "label": "Are all undead evil?"
        },
        {
          "id": "FAITH_05",
          "label": "What does Naevra want from you?"
        }
      ],
      "service": null
    },
    "NAEVRA_01": {
      "id": "NAEVRA_01",
      "player": "",
      "lines": [
        "Naevra is the Keeper of Names. Not death. Death does not need worship. Death arrives whether praised or cursed.",
        "Naevra is what answers after death and asks, 'Who was this?' Her mercy is not that she prevents endings. Her mercy is that she refuses to let a person dissolve into nameless dark."
      ],
      "options": [
        {
          "id": "NAEVRA_02",
          "label": "Is she a true goddess?"
        },
        {
          "id": "NAEVRA_03",
          "label": "What is her symbol?"
        },
        {
          "id": "FAITH_02",
          "label": "Why do names matter?"
        },
        {
          "id": "MYTH_NAME_LEDGER",
          "label": "What is the Name-Ledger?"
        },
        {
          "id": "FAITH_06",
          "label": "Have you ever felt Naevra answer you?"
        }
      ],
      "service": null
    },
    "NAEVRA_02": {
      "id": "NAEVRA_02",
      "player": "",
      "lines": [
        "Yes. Though that answer is less simple than priests like to pretend.",
        "Naevra is real. Her miracles are real. But some old scholars say the Name-Ledger came before her. That she was its first keeper, or perhaps that the world needed memory so badly that memory made her.",
        "That does not weaken my faith. It gives it bones."
      ],
      "options": [
        {
          "id": "MYTH_NAME_LEDGER",
          "label": "What is the Name-Ledger?"
        },
        {
          "id": "MYTH_04",
          "label": "So the gods might not have come first?"
        },
        {
          "id": "FAITH_07",
          "label": "Does that trouble you?"
        },
        {
          "id": "NAEVRA_01",
          "label": "Tell me again who Naevra is."
        }
      ],
      "service": null
    },
    "NAEVRA_03": {
      "id": "NAEVRA_03",
      "player": "",
      "lines": [
        "A bell tied with grave-thread. A candle burning in fog. A ledger bound shut with black ribbon. A soldier's name-tag. A hand writing one more line when it would be easier to sleep.",
        "This is not decoration. It is a promise: someone heard, someone wrote, someone remembers."
      ],
      "options": [
        {
          "id": "GRAVEYARD_05",
          "label": "What is grave-thread?"
        },
        {
          "id": "FAITH_02",
          "label": "Why do names matter?"
        },
        {
          "id": "REVIVE_08",
          "label": "Does a name help with resurrection?"
        }
      ],
      "service": null
    },
    "FAITH_02": {
      "id": "FAITH_02",
      "player": "",
      "lines": [
        "A name is a handle. Love can hold it. Law can hold it. Grief can hold it. Mercy can hold it.",
        "Her voice softens.",
        "The Depth cannot easily swallow someone who is correctly named. It can gnaw at bones, rot stone, and drown roads, but a true name gives the living a way to pull back.",
        "That is why false names are dangerous. A wrong name on a grave is not a clerical error. It is a door."
      ],
      "options": [
        {
          "id": "FAITH_08",
          "label": "What happens to the nameless?"
        },
        {
          "id": "GRAVEYARD_04",
          "label": "What do you write in the death-book?"
        },
        {
          "id": "MYTH_NAME_LEDGER",
          "label": "What is the Name-Ledger?"
        },
        {
          "id": "CROWN_08",
          "label": "Did the Barrow Crown steal names?"
        }
      ],
      "service": null
    },
    "FAITH_03": {
      "id": "FAITH_03",
      "player": "",
      "lines": [
        "No. I work beside it.",
        "People mistake us for death-priests because we wash bodies and ring bells. That is like calling a midwife a pregnancy. Death happens. We deal with what follows."
      ],
      "options": [
        {
          "id": "REVIVE_13",
          "label": "Is resurrection against your faith?"
        },
        {
          "id": "FAITH_04",
          "label": "Are all undead evil?"
        },
        {
          "id": "PERSONAL_04",
          "label": "How do you live with all this?"
        }
      ],
      "service": null
    },
    "FAITH_04": {
      "id": "FAITH_04",
      "player": "",
      "lines": [
        "No. That would make my work easier, and my work is almost never easy.",
        "Some undead are victims. Some are witnesses. Some are oath-bound. Some are echoes. Some are crimes still moving. Some are hollow things wearing the dead like clothing.",
        "Her expression hardens.",
        "The last kind I burn without apology."
      ],
      "options": [
        {
          "id": "CROWN_06",
          "label": "What kind of undead does the Barrow Crown make?"
        },
        {
          "id": "GRAVEYARD_06",
          "label": "Can you lay undead to rest?"
        },
        {
          "id": "REVIVE_10",
          "label": "Can an undead person be revived?"
        }
      ],
      "service": null
    },
    "FAITH_05": {
      "id": "FAITH_05",
      "player": "",
      "lines": [
        "Precision. Mercy. Patience.",
        "And clean handwriting, though that may be my superior's doctrine rather than the goddess's.",
        "Then she grows serious.",
        "Naevra wants the dead named, the nameless restored, the restless understood, and the dangerous bound or laid down properly."
      ],
      "options": [
        {
          "id": "GRAVEYARD_01",
          "label": "What do you do here?"
        },
        {
          "id": "GRAVEYARD_04",
          "label": "What do you write in the death-book?"
        },
        {
          "id": "PERSONAL_02",
          "label": "Why did you choose this life?"
        }
      ],
      "service": null
    },
    "FAITH_06": {
      "id": "FAITH_06",
      "player": "",
      "lines": [
        "Yes.",
        "A long pause.",
        "Not as a voice from the clouds. More like remembering a face I had never seen. Once, after a battlefield recovery, I wrote a soldier's name before anyone told it to me. His mother arrived three days later with the same name sewn inside his collar.",
        "I slept badly after that. Miracles are not always comforting."
      ],
      "options": [
        {
          "id": "PERSONAL_05",
          "label": "Does your work frighten you?"
        },
        {
          "id": "FAITH_07",
          "label": "Does your faith ever trouble you?"
        },
        {
          "id": "GRAVEYARD_07",
          "label": "What was your hardest burial?"
        }
      ],
      "service": null
    },
    "FAITH_07": {
      "id": "FAITH_07",
      "player": "",
      "lines": [
        "Constantly. Faith that never troubles you is usually obedience wearing perfume.",
        "I believe Naevra is merciful. I also believe she cannot, or will not, stop every horror before it happens. That means people like me must stand where the roof has broken and hold a bucket under the rain."
      ],
      "options": [
        {
          "id": "FAITH_03",
          "label": "Do you worship death?"
        },
        {
          "id": "CROWN_11",
          "label": "Why did Naevra not stop the Barrow Crown?"
        },
        {
          "id": "PERSONAL_04",
          "label": "How do you keep going?"
        }
      ],
      "service": null
    },
    "FAITH_08": {
      "id": "FAITH_08",
      "player": "",
      "lines": [
        "They drift.",
        "A named soul can be mourned, judged, bargained with, resurrected, or laid to rest. A nameless soul is harder to find. Worse, empty spaces attract things. When no correct name holds a grave shut, something else may answer.",
        "Not forever lost. But harder to save."
      ],
      "options": [
        {
          "id": "GRAVEYARD_08",
          "label": "Can you restore a lost name?"
        },
        {
          "id": "REVIVE_08",
          "label": "Does a name help with resurrection?"
        },
        {
          "id": "CROWN_08",
          "label": "Did the Crown make people nameless?"
        }
      ],
      "service": null
    },
    "GRAVEYARD_01": {
      "id": "GRAVEYARD_01",
      "player": "",
      "lines": [
        "I keep the graveyard from becoming a dungeon.",
        "I wash the dead, bind jaws, ring bells, write names, mark debts, tend grave-candles, speak with ghosts when speaking is wiser than exorcism, and put down what cannot be reasoned with.",
        "This yard is not storage. It is an anchor."
      ],
      "options": [
        {
          "id": "GRAVEYARD_02",
          "label": "What happens when a hero dies?"
        },
        {
          "id": "GRAVEYARD_03",
          "label": "Why is the graveyard an anchor?"
        },
        {
          "id": "REVIVE_01",
          "label": "How does resurrection work?"
        },
        {
          "id": "GRAVEYARD_06",
          "label": "Can you lay undead to rest?"
        }
      ],
      "service": null
    },
    "GRAVEYARD_02": {
      "id": "GRAVEYARD_02",
      "player": "",
      "lines": [
        "If the body is recovered, I receive it here. I write the name, cause of death, belongings, companions present, and whether the soul feels near or far.",
        "Heroes are kept in the cold room under grave-thread until a decision is made: burial, revival, or binding rites if something has gone wrong.",
        "A small frown.",
        "Try not to make me guess which limb belongs to whom."
      ],
      "options": [
        {
          "id": "REVIVE_01",
          "label": "How do I bring someone back?"
        },
        {
          "id": "REVIVE_04",
          "label": "What if the body is missing?"
        },
        {
          "id": "GRAVEYARD_04",
          "label": "What do you write in the death-book?"
        },
        {
          "id": "FLIRT_06",
          "label": "Would you miss me if I died?"
        }
      ],
      "service": null
    },
    "GRAVEYARD_03": {
      "id": "GRAVEYARD_03",
      "player": "",
      "lines": [
        "Because a properly kept grave says: this person existed here, was known here, and is not available for the Depth to repurpose.",
        "A village with no graveyard forgets its dead. A village that forgets its dead soon finds them knocking."
      ],
      "options": [
        {
          "id": "MYTH_01",
          "label": "Tell me the creation myth."
        },
        {
          "id": "FAITH_02",
          "label": "Why do names matter?"
        },
        {
          "id": "GRAVEYARD_06",
          "label": "Can you prevent undead?"
        }
      ],
      "service": null
    },
    "GRAVEYARD_04": {
      "id": "GRAVEYARD_04",
      "player": "",
      "lines": [
        "Name. Trade. Kin. Place found. Cause of death if known. Last words if witnessed. Debts if important. Favorite foolishness if someone loved them enough to remember it.",
        "A complete record can do what a sword cannot. It can tell a ghost who it was before pain made it forget."
      ],
      "options": [
        {
          "id": "PERSONAL_03",
          "label": "Do you really record foolish habits?"
        },
        {
          "id": "REVIVE_08",
          "label": "Does that help resurrection?"
        },
        {
          "id": "FAITH_02",
          "label": "Why do names matter?"
        }
      ],
      "service": null
    },
    "GRAVEYARD_05": {
      "id": "GRAVEYARD_05",
      "player": "",
      "lines": [
        "Black linen thread blessed over a death-book and tied to a bell, wrist, jaw, coffin, or weapon.",
        "It marks a thing as witnessed. Not safe. Witnessed. There is a difference."
      ],
      "options": [
        {
          "id": "REVIVE_05",
          "label": "Can grave-thread preserve a body?"
        },
        {
          "id": "NAEVRA_03",
          "label": "What is Naevra's symbol?"
        },
        {
          "id": "CROWN_09",
          "label": "Would grave-thread stop the Crown?"
        }
      ],
      "service": null
    },
    "GRAVEYARD_06": {
      "id": "GRAVEYARD_06",
      "player": "",
      "lines": [
        "Sometimes. Correct burial helps. Naming helps. Grave-candles help. Removing curses helps. Burning a necromancer's notes helps tremendously.",
        "But undeath is not one disease. It is a family of disasters. You do not treat oath-binding the same way you treat corpse-puppetry."
      ],
      "options": [
        {
          "id": "FAITH_04",
          "label": "Are all undead evil?"
        },
        {
          "id": "CROWN_06",
          "label": "What kind of undead does the Crown make?"
        },
        {
          "id": "REVIVE_10",
          "label": "Can undead be revived?"
        }
      ],
      "service": null
    },
    "GRAVEYARD_07": {
      "id": "GRAVEYARD_07",
      "player": "",
      "lines": [
        "A cart of soldiers after spring thaw. Nineteen bodies. Sixteen names. Two likely guesses. One silence.",
        "The silence followed us until we burned the guesses. That is when I learned that a wrong name can be crueler than no name."
      ],
      "options": [
        {
          "id": "FAITH_08",
          "label": "What happens to the nameless?"
        },
        {
          "id": "PERSONAL_05",
          "label": "Does your work frighten you?"
        },
        {
          "id": "GRAVEYARD_08",
          "label": "Can you restore a lost name?"
        }
      ],
      "service": null
    },
    "GRAVEYARD_08": {
      "id": "GRAVEYARD_08",
      "player": "",
      "lines": [
        "Yes, if enough remains.",
        "A keepsake. A tooth-marked pipe. A scar described by a sister. A debt in a tavern ledger. A song only one fool sang badly. Names are not just sounds. They are connections.",
        "But the longer the Depth has chewed, the less there is to hold."
      ],
      "options": [
        {
          "id": "REVIVE_04",
          "label": "What if the body is missing?"
        },
        {
          "id": "MYTH_NAME_LEDGER",
          "label": "What is the Name-Ledger?"
        },
        {
          "id": "CROWN_08",
          "label": "Did the Crown steal names?"
        }
      ],
      "service": null
    },
    "REVIVE_01": {
      "id": "REVIVE_01",
      "player": "",
      "lines": [
        "Poorly, if you ask the grieving. Miraculously, if you ask the dead.",
        "To return a soul, three things must be reachable: the body, the name, and the willing soul. Gold only buys the diamond focus. It does not bribe death. And it certainly does not bribe Naevra."
      ],
      "options": [
        {
          "id": "REVIVE_02",
          "label": "What are the exact costs?"
        },
        {
          "id": "REVIVE_03",
          "label": "How long after death can someone return?"
        },
        {
          "id": "REVIVE_04",
          "label": "What if the body is missing?"
        },
        {
          "id": "REVIVE_07",
          "label": "Why diamonds?"
        },
        {
          "id": "REVIVE_13",
          "label": "Is resurrection against your faith?"
        }
      ],
      "service": null
    },
    "REVIVE_02": {
      "id": "REVIVE_02",
      "player": "",
      "lines": [
        "These are the rites I can arrange through the graveyard. Prices are the diamond or sacred material cost. My scolding is free.",
        "If you plan to die often, buy diamonds before you need them. Merchants become philosophical when demand rises."
      ],
      "options": [
        {
          "id": "REVIVE_03",
          "label": "Explain the time limits."
        },
        {
          "id": "REVIVE_06",
          "label": "Can the time limit be extended?"
        },
        {
          "id": "REVIVE_11",
          "label": "What are the penalties?"
        },
        {
          "id": "REVIVE_14",
          "label": "Can I pay later?"
        }
      ],
      "service": null
    },
    "REVIVE_03": {
      "id": "REVIVE_03",
      "player": "",
      "lines": [
        "One minute for the fast rite. Ten days for ordinary restoration. A century for deep resurrection. Two centuries for the rarest true-name rite.",
        "Do not hear those numbers and become careless. The earlier the call, the cleaner the return. Souls are not parcels waiting on a shelf."
      ],
      "options": [
        {
          "id": "REVIVE_02",
          "label": "Show me the costs again."
        },
        {
          "id": "REVIVE_06",
          "label": "Can the time limit be extended?"
        },
        {
          "id": "REVIVE_08",
          "label": "Does the true name matter?"
        },
        {
          "id": "REVIVE_12",
          "label": "Can someone refuse to return?"
        }
      ],
      "service": null
    },
    "REVIVE_04": {
      "id": "REVIVE_04",
      "player": "",
      "lines": [
        "Then we need stronger magic, a truer name, or better boots to go find it.",
        "No body: ordinary rites fail. A body part allows deeper resurrection. No remains at all requires true-name restoration, and that is not a service one buys casually between errands."
      ],
      "options": [
        {
          "id": "REVIVE_08",
          "label": "How do you prove a true name?"
        },
        {
          "id": "GRAVEYARD_08",
          "label": "Can you restore a lost name?"
        },
        {
          "id": "REVIVE_02",
          "label": "What does the no-body rite cost?"
        }
      ],
      "service": null
    },
    "REVIVE_05": {
      "id": "REVIVE_05",
      "player": "",
      "lines": [
        "Yes, briefly. Grave-thread, cold stone, salt, and prayer can keep a body from becoming unusable while companions crawl back from whatever regrettable hole killed them.",
        "I recommend avoiding lava. It is inconsiderate to everyone involved."
      ],
      "options": [
        {
          "id": "REVIVE_06",
          "label": "Can time limits be extended?"
        },
        {
          "id": "GRAVEYARD_05",
          "label": "What is grave-thread?"
        },
        {
          "id": "REVIVE_02",
          "label": "What does preservation cost?"
        }
      ],
      "service": null
    },
    "REVIVE_06": {
      "id": "REVIVE_06",
      "player": "",
      "lines": [
        "Yes. Gentle Keeping delays decay and steadies the name, but it is not infinite.",
        "For game purposes: if the body reaches my graveyard before the rite expires, preservation can hold it safely until you gather materials. If the soul has already passed beyond the rite's reach, preservation becomes respectful storage, not a loophole."
      ],
      "options": [
        {
          "id": "REVIVE_02",
          "label": "Show the costs."
        },
        {
          "id": "REVIVE_12",
          "label": "Can a soul refuse?"
        },
        {
          "id": "REVIVE_13",
          "label": "Is this acceptable to Naevra?"
        }
      ],
      "service": null
    },
    "REVIVE_07": {
      "id": "REVIVE_07",
      "player": "",
      "lines": [
        "Because diamond remembers pressure without becoming mud.",
        "The dead are pulled downward by silence, grief, and the Depth. A diamond is a hard, clean anchor. It gives the spell something bright and stubborn to burn through while calling the name back.",
        "Also because gods, priests, and merchants share one terrible quality: none of them made resurrection cheap."
      ],
      "options": [
        {
          "id": "REVIVE_02",
          "label": "What are the costs?"
        },
        {
          "id": "MYTH_01",
          "label": "What does pressure have to do with creation?"
        },
        {
          "id": "FLIRT_07",
          "label": "So diamonds impress you?"
        }
      ],
      "service": null
    },
    "REVIVE_08": {
      "id": "REVIVE_08",
      "player": "",
      "lines": [
        "A true name is the road home.",
        "Her voice becomes very gentle.",
        "The body is the house. The diamond is the lantern. The name is the road. Without it, the soul may hear calling, but not know which door is meant."
      ],
      "options": [
        {
          "id": "FAITH_02",
          "label": "Why do names matter?"
        },
        {
          "id": "REVIVE_04",
          "label": "What if the body is missing?"
        },
        {
          "id": "GRAVEYARD_04",
          "label": "What do you write in the death-book?"
        }
      ],
      "service": null
    },
    "REVIVE_09": {
      "id": "REVIVE_09",
      "player": "",
      "lines": [
        "No. Old age is not an injury. A soul may refuse. A body may be too ruined for lesser rites. Some curses chain the dead elsewhere. Some bargains sell the road home.",
        "If you sign anything in blood, ash, or unusually polite legal language, bring it to me before dying."
      ],
      "options": [
        {
          "id": "REVIVE_12",
          "label": "Can a soul refuse?"
        },
        {
          "id": "REVIVE_10",
          "label": "Can undead be revived?"
        },
        {
          "id": "CROWN_10",
          "label": "Can the Crown stop resurrection?"
        }
      ],
      "service": null
    },
    "REVIVE_10": {
      "id": "REVIVE_10",
      "player": "",
      "lines": [
        "Sometimes. First we must know what kind of undead they are.",
        "A corpse puppet has no soul in it. A ghost may need peace before return. An oath-bound knight may need release. A Crown-bound dead thing may need command severed before any holy rite can find the person underneath.",
        "Her mouth tightens.",
        "That last one is ugly work."
      ],
      "options": [
        {
          "id": "FAITH_04",
          "label": "Are all undead evil?"
        },
        {
          "id": "CROWN_06",
          "label": "What does the Barrow Crown do to undead?"
        },
        {
          "id": "REVIVE_02",
          "label": "What rite would be needed?"
        }
      ],
      "service": null
    },
    "REVIVE_11": {
      "id": "REVIVE_11",
      "player": "",
      "lines": [
        "Returning is not waking from a nap.",
        "She lists them with practiced severity.",
        "The newly returned may suffer weakness, exhaustion, memory tremors, death-dreams, or a temporary fear of whatever killed them. Stronger rites reduce failure, not consequence.",
        "A pause.",
        "And yes, I have seen a barbarian resurrected after a spider bite refuse to enter a pantry for three weeks."
      ],
      "options": [
        {
          "id": "REVIVE_02",
          "label": "Show the costs again."
        },
        {
          "id": "PERSONAL_06",
          "label": "What is the strangest resurrection you have seen?"
        },
        {
          "id": "REVIVE_13",
          "label": "Is resurrection holy or unnatural?"
        }
      ],
      "service": null
    },
    "REVIVE_12": {
      "id": "REVIVE_12",
      "player": "",
      "lines": [
        "Yes. And it should be allowed to.",
        "Love may call. Duty may call. Gold may pay. But the soul must answer. Dragging an unwilling soul back is not resurrection. It is theft with candles."
      ],
      "options": [
        {
          "id": "REVIVE_13",
          "label": "Is resurrection against your faith?"
        },
        {
          "id": "FAITH_05",
          "label": "What does Naevra want?"
        },
        {
          "id": "PERSONAL_07",
          "label": "Have you ever wanted someone to refuse?"
        }
      ],
      "service": null
    },
    "REVIVE_13": {
      "id": "REVIVE_13",
      "player": "",
      "lines": [
        "No. Not when done rightly.",
        "Naevra keeps names. If a soul is named, willing, and not finished with the living, helping it return can be mercy. But resurrection without consent, without record, or for vanity? That is necromancy wearing a cleaner robe."
      ],
      "options": [
        {
          "id": "REVIVE_12",
          "label": "Can a soul refuse?"
        },
        {
          "id": "FAITH_03",
          "label": "Do you worship death?"
        },
        {
          "id": "CROWN_12",
          "label": "Was the first king resurrected?"
        }
      ],
      "service": null
    },
    "REVIVE_14": {
      "id": "REVIVE_14",
      "player": "",
      "lines": [
        "The diamond must be present for the rite. I cannot resurrect someone with an invoice.",
        "But I can preserve a body, record a debt, and glare at you until you return with the materials.",
        "A faint smile.",
        "I am told my glare has excellent collection rates."
      ],
      "options": [
        {
          "id": "REVIVE_02",
          "label": "What are the costs?"
        },
        {
          "id": "MAELIS_SERVICES",
          "label": "Show me services."
        },
        {
          "id": "FLIRT_08",
          "label": "Is the glare included?"
        }
      ],
      "service": null
    },
    "MYTH_01": {
      "id": "MYTH_01",
      "player": "",
      "lines": [
        "The oldest stories say the world was raised, not made.",
        "First there was the Below Without Bottom: pressure, hunger, silence, erosion, forgetting. The gods, or perhaps powers older than gods, lifted the world out of it and pinned it in place.",
        "We live on something rescued from sinking."
      ],
      "options": [
        {
          "id": "MYTH_02",
          "label": "What pinned the world in place?"
        },
        {
          "id": "MYTH_03",
          "label": "What is the Depth?"
        },
        {
          "id": "MYTH_04",
          "label": "Did the gods come first?"
        },
        {
          "id": "MYTH_NAME_LEDGER",
          "label": "What is the Name-Ledger?"
        },
        {
          "id": "MYTH_EMPTY_CROWN",
          "label": "What is the Empty Crown?"
        }
      ],
      "service": null
    },
    "MYTH_02": {
      "id": "MYTH_02",
      "player": "",
      "lines": [
        "The Anchor Tools. Not tools like a hammer on a shelf, though one of them is called a hammer. They are principles. Wounds. Relics. Myths that still answer.",
        "The First Lantern gave direction. The Hearth-Nail made place. The Road-Spindle made distance crossable. The Name-Ledger gave memory and burial. The Deep Hammer shaped pressure and ore.",
        "Her expression darkens.",
        "And then there is the Empty Crown, if it belongs on the list at all."
      ],
      "options": [
        {
          "id": "MYTH_NAME_LEDGER",
          "label": "Tell me about the Name-Ledger."
        },
        {
          "id": "MYTH_EMPTY_CROWN",
          "label": "Tell me about the Empty Crown."
        },
        {
          "id": "MYTH_05",
          "label": "How do the Five Bonds fit this?"
        },
        {
          "id": "CROWN_02",
          "label": "Is the Barrow Crown tied to the Empty Crown?"
        }
      ],
      "service": null
    },
    "MYTH_03": {
      "id": "MYTH_03",
      "player": "",
      "lines": [
        "The Depth is what the world was raised from, and what still wants everything back.",
        "It is forgetting given weight. Roads vanish into it. Villages fail into it. Bodies unnamed slide toward it. The dead who lose themselves hear it first as silence, then as invitation."
      ],
      "options": [
        {
          "id": "GRAVEYARD_03",
          "label": "How does the graveyard resist it?"
        },
        {
          "id": "FAITH_08",
          "label": "What happens to the nameless?"
        },
        {
          "id": "MYTH_01",
          "label": "Tell me the creation myth again."
        }
      ],
      "service": null
    },
    "MYTH_04": {
      "id": "MYTH_04",
      "player": "",
      "lines": [
        "That depends which temple you ask and how much trouble you want.",
        "A small smile.",
        "Most temples say the gods raised the world. Older shrine traditions say the Anchor Tools came first, and the gods were born from the first light, first hearth, first road, first name, and first deep pressure.",
        "She shrugs.",
        "A church can preserve real miracles and still be wrong about history. People manage that with much smaller subjects."
      ],
      "options": [
        {
          "id": "NAEVRA_02",
          "label": "So what does that mean for Naevra?"
        },
        {
          "id": "MYTH_NAME_LEDGER",
          "label": "What came before Naevra?"
        },
        {
          "id": "FAITH_07",
          "label": "Does that trouble you?"
        }
      ],
      "service": null
    },
    "MYTH_NAME_LEDGER": {
      "id": "MYTH_NAME_LEDGER",
      "player": "",
      "lines": [
        "The principle of memory made sacred. Identity. Burial. Contracts. Lineage. True names. The reason a person can remain a person after the body stops arguing.",
        "My book is not the Name-Ledger. It is a candle lit from a distant fire.",
        "A pause.",
        "Naevra keeps the Ledger. Whether she wrote the first page is a question for theologians with good locks on their doors."
      ],
      "options": [
        {
          "id": "FAITH_02",
          "label": "Why do names matter?"
        },
        {
          "id": "NAEVRA_02",
          "label": "Is Naevra older than the Ledger?"
        },
        {
          "id": "CROWN_08",
          "label": "Can the Crown erase names?"
        }
      ],
      "service": null
    },
    "MYTH_EMPTY_CROWN": {
      "id": "MYTH_EMPTY_CROWN",
      "player": "",
      "lines": [
        "Command without a worthy head. Hierarchy without mercy. Sovereignty without service.",
        "Her fingers tighten around the bell.",
        "Some call it a sixth Anchor Tool. Some call it a corruption made when mortal kings tried to imitate the older powers. Some call it the first Depth-mask ever worn by law.",
        "I call it dangerous."
      ],
      "options": [
        {
          "id": "CROWN_02",
          "label": "Is the Barrow Crown the Empty Crown?"
        },
        {
          "id": "CROWN_05",
          "label": "What does command do to the dead?"
        },
        {
          "id": "MYTH_02",
          "label": "Tell me about the Anchor Tools."
        }
      ],
      "service": null
    },
    "MYTH_05": {
      "id": "MYTH_05",
      "player": "",
      "lines": [
        "The Hearth gives people a place to return. The Road lets them leave without being lost. The Crown binds them into law. The Name keeps the dead and the living remembered. The Pact teaches civilization it is not alone.",
        "When the Bonds were strong, the dead slept. When they broke, the dead started listening for other orders."
      ],
      "options": [
        {
          "id": "CROWN_01",
          "label": "Tell me about the Barrow Crown."
        },
        {
          "id": "GRAVEYARD_03",
          "label": "How does the graveyard anchor the Name?"
        },
        {
          "id": "MYTH_03",
          "label": "What is the Depth?"
        }
      ],
      "service": null
    },
    "CROWN_01": {
      "id": "CROWN_01",
      "player": "",
      "lines": [
        "Enough to dislike it.",
        "The Barrow Crown was not just jewelry. It was a command-symbol. It bound dead kings, battlefield spirits, old guardrooms, and oath-sworn soldiers into service. When it broke, its authority did not die. It scattered.",
        "Her voice lowers.",
        "And scattered command is still command. It only needs someone foolish enough to wear it."
      ],
      "options": [
        {
          "id": "CROWN_02",
          "label": "Is it tied to the Empty Crown?"
        },
        {
          "id": "CROWN_03",
          "label": "What happened in the robbed tomb?"
        },
        {
          "id": "CROWN_05",
          "label": "Why is command over the dead so dangerous?"
        },
        {
          "id": "CROWN_13",
          "label": "Should we destroy it?"
        }
      ],
      "service": null
    },
    "CROWN_02": {
      "id": "CROWN_02",
      "player": "",
      "lines": [
        "Yes. Or it is pretending to be. With relics like this, the distinction can kill you.",
        "The Empty Crown is the idea that one will can bind many. The Barrow Crown is that idea hammered into a royal curse, buried, broken, bought, and carried through too many dead hands."
      ],
      "options": [
        {
          "id": "MYTH_EMPTY_CROWN",
          "label": "Tell me about the Empty Crown."
        },
        {
          "id": "CROWN_05",
          "label": "Why is command over the dead dangerous?"
        },
        {
          "id": "CROWN_11",
          "label": "Why did Naevra not stop it?"
        }
      ],
      "service": null
    },
    "CROWN_03": {
      "id": "CROWN_03",
      "player": "",
      "lines": [
        "The tomb was not merely robbed. It was opened like a lock.",
        "The grave-charms had snapped. The air smelled of extinguished candles. The thief said they lifted a black iron crown with gold thorns, and something beneath the tomb laughed. Then the ghosts took it downward.",
        "Her mouth tightens.",
        "That is not theft. That is a summons answered."
      ],
      "options": [
        {
          "id": "CROWN_04",
          "label": "Who was Orren?"
        },
        {
          "id": "CROWN_05",
          "label": "Why would ghosts take it?"
        },
        {
          "id": "CROWN_13",
          "label": "Should we destroy it?"
        }
      ],
      "service": null
    },
    "CROWN_04": {
      "id": "CROWN_04",
      "player": "",
      "lines": [
        "A grave-robber who survived long enough to become evidence.",
        "A dry pause.",
        "That sounds unkind. It is also accurate.",
        "He saw the Crown taken, heard the laughter beneath the tomb, and lived with enough fear left in him to tell the truth. Fear is not virtue, but sometimes it drags virtue behind it."
      ],
      "options": [
        {
          "id": "CROWN_03",
          "label": "What happened in the tomb?"
        },
        {
          "id": "CROWN_07",
          "label": "Can guilt save someone?"
        },
        {
          "id": "PERSONAL_08",
          "label": "Do you forgive grave-robbers?"
        }
      ],
      "service": null
    },
    "CROWN_05": {
      "id": "CROWN_05",
      "player": "",
      "lines": [
        "Because the dead are vulnerable to unfinished things: oaths, grief, shame, orders, names, crowns.",
        "A living soldier can disobey. A dead soldier bound to command may not remember how. The Barrow Crown does not inspire loyalty. It exploits the part of the soul still standing at attention."
      ],
      "options": [
        {
          "id": "CROWN_06",
          "label": "What kind of undead does it make?"
        },
        {
          "id": "FAITH_04",
          "label": "Are all undead evil?"
        },
        {
          "id": "CROWN_13",
          "label": "Should we destroy it?"
        }
      ],
      "service": null
    },
    "CROWN_06": {
      "id": "CROWN_06",
      "player": "",
      "lines": [
        "Not one kind. That is what makes it vile.",
        "Skeletons that still obey captains. Ghosts that still guard doors. Ghouls that clutch at invisible coronets. Dead monarchs who mistake memory for authority. Even frightened dead who are not hostile, only trapped in a kingdom never allowed to become a tomb.",
        "The Crown does not merely raise corpses. It keeps hierarchy alive after mercy has died."
      ],
      "options": [
        {
          "id": "REVIVE_10",
          "label": "Can Crown-bound undead be revived?"
        },
        {
          "id": "CROWN_05",
          "label": "Why is command dangerous?"
        },
        {
          "id": "CROWN_13",
          "label": "Should we destroy it?"
        }
      ],
      "service": null
    },
    "CROWN_07": {
      "id": "CROWN_07",
      "player": "",
      "lines": [
        "Sometimes guilt is the first honest bell a person hears.",
        "But guilt alone is not atonement. Orren being frightened did not fix the tomb. Lady Yseld being uncertain did not free the king's dead. Regret opens the door. Action walks through."
      ],
      "options": [
        {
          "id": "CROWN_04",
          "label": "Tell me about Orren."
        },
        {
          "id": "CROWN_12",
          "label": "Tell me about Lady Yseld."
        },
        {
          "id": "PERSONAL_08",
          "label": "Do you forgive grave-robbers?"
        }
      ],
      "service": null
    },
    "CROWN_08": {
      "id": "CROWN_08",
      "player": "",
      "lines": [
        "It stole priority.",
        "A name says: I am myself. A crown says: you are mine. In the Crown's presence, command tries to stand above identity. Soldier. Guard. Traitor. Subject. Corpse. Those are not names. They are handles for obedience."
      ],
      "options": [
        {
          "id": "FAITH_02",
          "label": "Why do names matter?"
        },
        {
          "id": "MYTH_NAME_LEDGER",
          "label": "What is the Name-Ledger?"
        },
        {
          "id": "CROWN_05",
          "label": "Why is command dangerous?"
        }
      ],
      "service": null
    },
    "CROWN_09": {
      "id": "CROWN_09",
      "player": "",
      "lines": [
        "No. It may help a soul remember it has a name, but thread does not stop a crown by itself.",
        "Rites, names, broken seals, honest violence, and a very clear refusal to kneel-those might."
      ],
      "options": [
        {
          "id": "CROWN_13",
          "label": "Should we destroy it?"
        },
        {
          "id": "GRAVEYARD_05",
          "label": "What is grave-thread?"
        },
        {
          "id": "CROWN_06",
          "label": "What does it do to undead?"
        }
      ],
      "service": null
    },
    "CROWN_10": {
      "id": "CROWN_10",
      "player": "",
      "lines": [
        "It can complicate it terribly.",
        "If the Crown has bound the dead under command, the soul may not hear its own name clearly. The rite might call, but the command answers first. Sever the command, then call the name."
      ],
      "options": [
        {
          "id": "REVIVE_10",
          "label": "Can undead be revived?"
        },
        {
          "id": "REVIVE_08",
          "label": "Does the name help?"
        },
        {
          "id": "CROWN_13",
          "label": "Should we destroy it?"
        }
      ],
      "service": null
    },
    "CROWN_11": {
      "id": "CROWN_11",
      "player": "",
      "lines": [
        "Why does a roof leak if carpenters exist?",
        "The answer is quiet, but not evasive.",
        "Gods are not everywhere equally. Power follows rites, anchors, names, places, and willing hands. The Crown was buried under law, betrayal, royal blood, and fear. Naevra's servants can oppose it. That does not mean she can simply erase every wrong done to the dead.",
        "That is where we come in."
      ],
      "options": [
        {
          "id": "FAITH_07",
          "label": "Does that trouble you?"
        },
        {
          "id": "CROWN_13",
          "label": "Should we destroy it?"
        },
        {
          "id": "NAEVRA_02",
          "label": "How do gods work in this world?"
        }
      ],
      "service": null
    },
    "CROWN_12": {
      "id": "CROWN_12",
      "player": "",
      "lines": [
        "A woman standing where blood, guilt, inheritance, and fear all pull in different directions.",
        "She bought the Crown, yes. But she also listened when the dead warned her. That does not absolve her. It means she may still choose rightly.",
        "A dry note returns.",
        "I prefer people before they buy cursed royal relics, but we work with the living we have."
      ],
      "options": [
        {
          "id": "CROWN_07",
          "label": "Can guilt save someone?"
        },
        {
          "id": "CROWN_13",
          "label": "What is the right choice?"
        },
        {
          "id": "CROWN_14",
          "label": "Was the first king murdered?"
        }
      ],
      "service": null
    },
    "CROWN_13": {
      "id": "CROWN_13",
      "player": "",
      "lines": [
        "Yes.",
        "No hesitation.",
        "Not hide. Not wear. Not study until it whispers something flattering. Destroy.",
        "The question is not whether command can be useful. Of course it can. The question is whether any living person has the right to command the dead after their names, grief, and rest have already been stolen.",
        "Her answer is colder than the graveyard air.",
        "No."
      ],
      "options": [
        {
          "id": "CROWN_15",
          "label": "What if I claim it?"
        },
        {
          "id": "CROWN_05",
          "label": "Why is command so dangerous?"
        },
        {
          "id": "CROWN_16",
          "label": "What happens after it breaks?"
        }
      ],
      "service": null
    },
    "CROWN_14": {
      "id": "CROWN_14",
      "player": "",
      "lines": [
        "No. Worse.",
        "He was crowned after death. Made to rule from the grave. Murder ends a reign. This denied the ending. The Crown made a kingdom that was never allowed to become a tomb."
      ],
      "options": [
        {
          "id": "CROWN_12",
          "label": "What does that mean for Lady Yseld?"
        },
        {
          "id": "CROWN_16",
          "label": "What happens after it breaks?"
        },
        {
          "id": "MYTH_EMPTY_CROWN",
          "label": "Is this the Empty Crown's work?"
        }
      ],
      "service": null
    },
    "CROWN_15": {
      "id": "CROWN_15",
      "player": "",
      "lines": [
        "Then I will write your name very carefully.",
        "Not because I expect to honor you. Because if you become something wearing your face, I want the record to prove there was once a person beneath it.",
        "A beat.",
        "Do not mistake that for permission."
      ],
      "options": [
        {
          "id": "CROWN_13",
          "label": "So destroy it?"
        },
        {
          "id": "FAITH_02",
          "label": "Why write my name?"
        },
        {
          "id": "FLIRT_09",
          "label": "That almost sounded like concern."
        }
      ],
      "service": null
    },
    "CROWN_16": {
      "id": "CROWN_16",
      "player": "",
      "lines": [
        "The dead lower their weapons. The commands lose their teeth. The kingdom beneath the hills finally begins to become a tomb.",
        "That does not fix every grave. It does not restore every name. But it ends one great theft. Sometimes mercy is not raising the dead. Sometimes mercy is letting them lie down."
      ],
      "options": [
        {
          "id": "FAITH_03",
          "label": "Do you worship death?"
        },
        {
          "id": "GRAVEYARD_01",
          "label": "What will you do afterward?"
        },
        {
          "id": "PERSONAL_04",
          "label": "How do you keep going?"
        }
      ],
      "service": null
    },
    "PERSONAL_01": {
      "id": "PERSONAL_01",
      "player": "",
      "lines": [
        "I am Sister Maelis. I keep the graveyard. I serve Naevra. I own three good ledgers, one bad kettle, and a cat who refuses theological instruction.",
        "I was born in a road village east of here. I joined the Gravebinders after a winter fever took half the village and the other half argued over whose dead mattered first."
      ],
      "options": [
        {
          "id": "PERSONAL_02",
          "label": "Why did you become a Gravebinder?"
        },
        {
          "id": "PERSONAL_03",
          "label": "You have a cat?"
        },
        {
          "id": "PERSONAL_04",
          "label": "What is your daily life like?"
        },
        {
          "id": "FLIRT_02",
          "label": "That was almost charming."
        }
      ],
      "service": null
    },
    "PERSONAL_02": {
      "id": "PERSONAL_02",
      "player": "",
      "lines": [
        "Because someone had to write the names.",
        "A pause.",
        "I was young. Angry. Certain that grief should make people kinder. It does not always. Sometimes grief makes people practical, selfish, stupid, holy, or cruel. The Gravebinders gave me work sharp enough to hold my anger without letting it rot."
      ],
      "options": [
        {
          "id": "FAITH_05",
          "label": "What does Naevra want from you?"
        },
        {
          "id": "PERSONAL_05",
          "label": "Are you still angry?"
        },
        {
          "id": "GRAVEYARD_07",
          "label": "What was your hardest burial?"
        }
      ],
      "service": null
    },
    "PERSONAL_03": {
      "id": "PERSONAL_03",
      "player": "",
      "lines": [
        "Her name is Matron Ash.",
        "Maelis's expression becomes solemn in a way that is clearly false.",
        "She has murdered three mice, two funeral ribbons, and one visiting deacon's dignity. I respect her professionally."
      ],
      "options": [
        {
          "id": "PERSONAL_04",
          "label": "What else do you do besides grave work?"
        },
        {
          "id": "FLIRT_03",
          "label": "Can I meet Matron Ash?"
        },
        {
          "id": "PERSONAL_06",
          "label": "Any stranger stories?"
        }
      ],
      "service": null
    },
    "PERSONAL_04": {
      "id": "PERSONAL_04",
      "player": "",
      "lines": [
        "Dawn bell. Grave walk. Candle checks. Ledger work. Tea if the kettle behaves. Burial rites if needed. Arguments with ghosts if they are lucid. Arguments with villagers if they are not.",
        "In the evenings I repair thread, copy names, read bad poetry, and pretend I will sleep early."
      ],
      "options": [
        {
          "id": "PERSONAL_09",
          "label": "Bad poetry?"
        },
        {
          "id": "FLIRT_04",
          "label": "You read poetry in a graveyard?"
        },
        {
          "id": "GRAVEYARD_01",
          "label": "What do you do here?"
        }
      ],
      "service": null
    },
    "PERSONAL_05": {
      "id": "PERSONAL_05",
      "player": "",
      "lines": [
        "Yes.",
        "Fear is useful if you make it carry a lantern. It tells you where not to step. It tells you when a corpse is too quiet. It tells you when a grieving person is about to do something unforgivable.",
        "I am not fearless. I am practiced."
      ],
      "options": [
        {
          "id": "FAITH_06",
          "label": "Have you felt Naevra answer?"
        },
        {
          "id": "CROWN_01",
          "label": "Does the Crown frighten you?"
        },
        {
          "id": "FLIRT_05",
          "label": "Practiced looks good on you."
        }
      ],
      "service": null
    },
    "PERSONAL_06": {
      "id": "PERSONAL_06",
      "player": "",
      "lines": [
        "A ranger returned after being eaten by a troll insisted he could still smell onions through the troll's nose.",
        "He could not. But he refused stew for a year. Trauma is rarely dignified."
      ],
      "options": [
        {
          "id": "REVIVE_11",
          "label": "What are resurrection penalties?"
        },
        {
          "id": "PERSONAL_03",
          "label": "Tell me more about Matron Ash."
        },
        {
          "id": "FLIRT_02",
          "label": "You are funnier than expected."
        }
      ],
      "service": null
    },
    "PERSONAL_07": {
      "id": "PERSONAL_07",
      "player": "",
      "lines": [
        "Yes.",
        "Her face becomes still.",
        "And I performed the rite correctly anyway, because the soul was willing and the living had the right materials.",
        "A pause.",
        "Priests who only serve people they like become cultists with better candles."
      ],
      "options": [
        {
          "id": "REVIVE_12",
          "label": "Can a soul refuse?"
        },
        {
          "id": "FAITH_07",
          "label": "Does your faith trouble you?"
        },
        {
          "id": "PERSONAL_08",
          "label": "Do you forgive people easily?"
        }
      ],
      "service": null
    },
    "PERSONAL_08": {
      "id": "PERSONAL_08",
      "player": "",
      "lines": [
        "Not as a category.",
        "I can forgive a starving fool who took a ring to buy bread and later brought back the finger bone with tears in his eyes. I do not forgive people who sell the dead as inventory.",
        "Her eyes harden.",
        "The Grave-Market can burn."
      ],
      "options": [
        {
          "id": "CROWN_04",
          "label": "What about Orren?"
        },
        {
          "id": "CROWN_07",
          "label": "Can guilt save someone?"
        },
        {
          "id": "CROWN_03",
          "label": "What happened after the tomb robbery?"
        }
      ],
      "service": null
    },
    "PERSONAL_09": {
      "id": "PERSONAL_09",
      "player": "",
      "lines": [
        "Terrible poetry. Village romances, overwrought epics, funeral verse with too many ravens.",
        "It is restful to read something where the dead remain metaphors."
      ],
      "options": [
        {
          "id": "FLIRT_04",
          "label": "Read me some sometime."
        },
        {
          "id": "PERSONAL_04",
          "label": "What is your daily life like?"
        },
        {
          "id": "FLIRT_10",
          "label": "So there is softness under all that black cloth."
        }
      ],
      "service": null
    },
    "FLIRT_01": {
      "id": "FLIRT_01",
      "player": "",
      "lines": [
        "And you are strangely alive for someone who says things like that in graveyards.",
        "Calm is part of the work. Panic makes poor ink."
      ],
      "options": [
        {
          "id": "FLIRT_02",
          "label": "You are sharper than I expected."
        },
        {
          "id": "PERSONAL_01",
          "label": "Tell me about yourself."
        },
        {
          "id": "GRAVEYARD_01",
          "label": "What is your work here?"
        }
      ],
      "service": null
    },
    "FLIRT_02": {
      "id": "FLIRT_02",
      "player": "",
      "lines": [
        "People expect graveyard keepers to mumble, sigh, and drift through fog.",
        "I do sigh. But I try to aim it well."
      ],
      "options": [
        {
          "id": "FLIRT_03",
          "label": "Do you ever stop working?"
        },
        {
          "id": "PERSONAL_04",
          "label": "What do you do in the evenings?"
        },
        {
          "id": "FLIRT_07",
          "label": "What impresses you?"
        }
      ],
      "service": null
    },
    "FLIRT_03": {
      "id": "FLIRT_03",
      "player": "",
      "lines": [
        "You may attempt an introduction. Whether she accepts your existence is between you, the cat, and whatever pride you are willing to lose.",
        "A tiny smile.",
        "If she sits on your lap, do not move. That is not affection. It is appointment."
      ],
      "options": [
        {
          "id": "PERSONAL_03",
          "label": "Tell me about the cat again."
        },
        {
          "id": "FLIRT_04",
          "label": "Maybe I should visit in the evening."
        },
        {
          "id": "PERSONAL_01",
          "label": "Tell me more about yourself."
        }
      ],
      "service": null
    },
    "FLIRT_04": {
      "id": "FLIRT_04",
      "player": "",
      "lines": [
        "Where else should poetry be supervised?",
        "Her smile is small but real.",
        "The dead are honest critics. They never applaud out of politeness."
      ],
      "options": [
        {
          "id": "PERSONAL_09",
          "label": "What kind of poetry?"
        },
        {
          "id": "FLIRT_10",
          "label": "Read to me sometime."
        },
        {
          "id": "MAELIS_HUB",
          "label": "I had another question."
        }
      ],
      "service": null
    },
    "FLIRT_05": {
      "id": "FLIRT_05",
      "player": "",
      "lines": [
        "That is dangerously close to a compliment.",
        "Careful. I record notable last words, and flirtation has a way of becoming one."
      ],
      "options": [
        {
          "id": "FLIRT_06",
          "label": "Would you miss me if I died?"
        },
        {
          "id": "FLIRT_09",
          "label": "That almost sounded like concern."
        },
        {
          "id": "PERSONAL_05",
          "label": "Does your work frighten you?"
        }
      ],
      "service": null
    },
    "FLIRT_06": {
      "id": "FLIRT_06",
      "player": "",
      "lines": [
        "I would write your name correctly.",
        "And if you had been tolerable company, I might use the good ink."
      ],
      "options": [
        {
          "id": "REVIVE_01",
          "label": "Could you bring me back?"
        },
        {
          "id": "FLIRT_09",
          "label": "Good ink? I am honored."
        },
        {
          "id": "GRAVEYARD_04",
          "label": "What would you write about me?"
        }
      ],
      "service": null
    },
    "FLIRT_07": {
      "id": "FLIRT_07",
      "player": "",
      "lines": [
        "Only when used responsibly.",
        "A diamond bought for vanity is a shiny confession. A diamond saved to pull a friend back from death? That has character.",
        "A faint smile.",
        "Character impresses me."
      ],
      "options": [
        {
          "id": "REVIVE_07",
          "label": "Why diamonds?"
        },
        {
          "id": "FLIRT_08",
          "label": "And what else impresses you?"
        },
        {
          "id": "REVIVE_02",
          "label": "Show me the costs again."
        }
      ],
      "service": null
    },
    "FLIRT_08": {
      "id": "FLIRT_08",
      "player": "",
      "lines": [
        "No. The glare is complimentary.",
        "Repeated foolishness may incur additional fees."
      ],
      "options": [
        {
          "id": "REVIVE_14",
          "label": "Can I pay later?"
        },
        {
          "id": "FLIRT_05",
          "label": "You are enjoying this."
        },
        {
          "id": "MAELIS_SERVICES",
          "label": "Show me services."
        }
      ],
      "service": null
    },
    "FLIRT_09": {
      "id": "FLIRT_09",
      "player": "",
      "lines": [
        "Do not become arrogant. I am concerned by mold, cracked bells, and improperly labeled jars.",
        "Her gaze lingers for half a breath.",
        "But yes. I prefer you alive. You ask better questions that way."
      ],
      "options": [
        {
          "id": "FLIRT_06",
          "label": "Would you miss me if I died?"
        },
        {
          "id": "CROWN_15",
          "label": "What if I claimed the Crown?"
        },
        {
          "id": "PERSONAL_01",
          "label": "Tell me about yourself."
        }
      ],
      "service": null
    },
    "FLIRT_10": {
      "id": "FLIRT_10",
      "player": "",
      "lines": [
        "That depends.",
        "If you want romance, bring patience. If you want tragedy, bring wine. If you want funeral verse, bring better taste than the last person who donated a poem to this chapel.",
        "A small smile.",
        "And if you only want an excuse to sit near me, bring tea. I am not unreasonable."
      ],
      "options": [
        {
          "id": "PERSONAL_09",
          "label": "What poetry do you like?"
        },
        {
          "id": "FLIRT_07",
          "label": "What impresses you?"
        },
        {
          "id": "MAELIS_HUB",
          "label": "I had another question."
        }
      ],
      "service": null
    },
    "MAELIS_SERVICES": {
      "id": "MAELIS_SERVICES",
      "player": "",
      "lines": [
        "Services of the graveyard are practical, sacred, and occasionally expensive. Choose carefully."
      ],
      "options": [
        {
          "id": "SERVICE_REVIVE",
          "label": "Revive a dead hero."
        },
        {
          "id": "SERVICE_PRESERVE",
          "label": "Preserve a body."
        },
        {
          "id": "SERVICE_BLESSING",
          "label": "Receive a graveyard blessing."
        },
        {
          "id": "SERVICE_IDENTIFY_REMAINS",
          "label": "Identify remains."
        },
        {
          "id": "SERVICE_LAY_REST",
          "label": "Lay undead or a ghost to rest."
        },
        {
          "id": "REVIVE_02",
          "label": "Explain resurrection costs."
        },
        {
          "id": "MAELIS_HUB",
          "label": "Ask something else."
        }
      ],
      "service": "blessing"
    },
    "SERVICE_REVIVE": {
      "id": "SERVICE_REVIVE",
      "player": "",
      "lines": [
        "Bring me the body, the name, and the diamonds. If any one of those is missing, tell me before hope makes you stupid."
      ],
      "options": [
        {
          "id": "REVIVE_02",
          "label": "Show costs."
        },
        {
          "id": "REVIVE_04",
          "label": "The body is missing."
        },
        {
          "id": "REVIVE_12",
          "label": "What if the soul refuses?"
        },
        {
          "id": "MAELIS_SERVICES",
          "label": "Back to services."
        }
      ],
      "service": "revive"
    },
    "SERVICE_PRESERVE": {
      "id": "SERVICE_PRESERVE",
      "player": "",
      "lines": [
        "I can preserve remains with grave-thread, salt, cold stone, and bell prayer. This buys time. It does not buy a soul."
      ],
      "options": [
        {
          "id": "REVIVE_06",
          "label": "How long does preservation help?"
        },
        {
          "id": "REVIVE_02",
          "label": "Show resurrection costs."
        },
        {
          "id": "MAELIS_SERVICES",
          "label": "Back to services."
        }
      ],
      "service": "preserve"
    },
    "SERVICE_BLESSING": {
      "id": "SERVICE_BLESSING",
      "player": "",
      "lines": [
        "Kneel if you are respectful. Stand if your knees object.",
        "Naevra keep your name clear, your road home marked, and your corpse difficult to misuse.",
        "*Game effect suggestion:**",
        "`Graveyard Blessing`: Until next long rest, first time the hero would become frightened by undead, gain advantage or resist the effect. Alternatively, +1 to death saving throws while in Barrow Crown dungeons."
      ],
      "options": [
        {
          "id": "FAITH_05",
          "label": "What does Naevra want?"
        },
        {
          "id": "MAELIS_SERVICES",
          "label": "Back to services."
        }
      ],
      "service": "blessing"
    },
    "SERVICE_IDENTIFY_REMAINS": {
      "id": "SERVICE_IDENTIFY_REMAINS",
      "player": "",
      "lines": [
        "Place them on the cloth. Do not look so nervous. Bones are less judgmental than the living.",
        "I will need time, context, and preferably no interruptions from amateur necromancers.",
        "*Game effect suggestion:**",
        "Consumes unidentified remains item. Returns a name, clue, quest hook, or burial reward."
      ],
      "options": [
        {
          "id": "GRAVEYARD_08",
          "label": "Can you restore a lost name?"
        },
        {
          "id": "FAITH_02",
          "label": "Why do names matter?"
        },
        {
          "id": "MAELIS_SERVICES",
          "label": "Back to services."
        }
      ],
      "service": "identify"
    },
    "SERVICE_LAY_REST": {
      "id": "SERVICE_LAY_REST",
      "player": "",
      "lines": [
        "Tell me what haunts you, where it died, and what it still wants.",
        "If it can be reasoned with, we speak. If it must be bound, we bind. If it is only hunger in a dead face, we end it.",
        "*Game effect suggestion:**",
        "Open ghost/undead quest resolution, curse removal, or bounty turn-in."
      ],
      "options": [
        {
          "id": "FAITH_04",
          "label": "Are all undead evil?"
        },
        {
          "id": "GRAVEYARD_06",
          "label": "Can you prevent undead?"
        },
        {
          "id": "MAELIS_SERVICES",
          "label": "Back to services."
        }
      ],
      "service": "lay-rest"
    },
    "STATE_D1_01": {
      "id": "STATE_D1_01",
      "player": "What did the tomb lock away?",
      "lines": [
        "Not only the Crown. A tomb can hold a body, a memory, an oath, or a command. This one held a command. Someone opened it without knowing what was listening."
      ],
      "options": []
    },
    "STATE_D2_01": {
      "id": "STATE_D2_01",
      "player": "Why bind a king instead of kill him?",
      "lines": [
        "Because killing ends a reign. Binding preserves it for someone else to exploit. A dead king can become symbol, hostage, saint, curse, or weapon. The Crown made him all five."
      ],
      "options": []
    },
    "STATE_D3_01": {
      "id": "STATE_D3_01",
      "player": "Can the drowned soldiers be saved?",
      "lines": [
        "Some, perhaps. Not by pretending they are all monsters. Find names. Break commands. Separate grief from orders. Then we may learn who can sleep and who must be fought."
      ],
      "options": []
    },
    "STATE_D4_01": {
      "id": "STATE_D4_01",
      "player": "Why copy the names before burning the ledgers?",
      "lines": [
        "Because evil records still contain victims. Destroying proof can be another burial without a name. We do not cleanse history by making it blank."
      ],
      "options": []
    },
    "STATE_D5_01": {
      "id": "STATE_D5_01",
      "player": "Was Lady Yseld wrong?",
      "lines": [
        "She was afraid. She was manipulated. She was also responsible. Those truths do not cancel each other. Responsibility begins when fear stops being an excuse."
      ],
      "options": []
    },
    "STATE_D6_01": {
      "id": "STATE_D6_01",
      "player": "What would you do?",
      "lines": [
        "I would destroy it. Then I would write the names of everyone it used. Then I would sleep badly and call that mercy."
      ],
      "options": []
    },
    "STATE_D7_01": {
      "id": "STATE_D7_01",
      "player": "Is it over?",
      "lines": [
        "One Crown is broken. One king is ended. One wound can begin to close. The world is full of other graves with other teeth. But yes, this thing is over."
      ],
      "options": []
    }
  }
};
})();
