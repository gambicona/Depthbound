(() => {
const cp = (amount) => ({ amount, unit: "cp", text: `${amount} cp` });

function handout(id, name, options = {}) {
  const text = options.text ?? options.description ?? "Write the handout text here.";
  const temporary = Boolean(options.temporary ?? options.temporaryTome ?? options.expiresOnDungeonExit);
  window.DungeonContent.register("items", id, {
    name,
    type: "handout",
    category: options.category ?? "journal",
    cost: options.cost ?? cp(0),
    weightLb: 0,
    slots: [],
    stackable: false,
    tomeInventory: "party",
    temporaryTome: temporary,
    expiresOnDungeonExit: temporary,
    tags: ["handout", "journal", "ancient-tome", ...(temporary ? ["temporary-note"] : []), ...(options.tags ?? [])],
    description: text,
    customDescription: text,
    handout: {
      title: options.title ?? name,
      text,
      format: options.format ?? "markdown-lite",
      categories: options.categories ?? [],
      temporary,
    },
  });
}

handout("ancient-tome-page", "Ancient Tome Page", {
  title: "Untitled Handout",
  categories: ["Promiscuous"],
  text: "# Untitled Handout\n\nWrite your formatted handout text here.\n\n- Use headings\n- Use **bold** or *italic* emphasis",
});

handout("temporary-dungeon-note", "Temporary Dungeon Note", {
  title: "Temporary Dungeon Note",
  categories: ["Dungeon Notes"],
  temporary: true,
  text: "# Temporary Dungeon Note\n\nWrite a clue, password, warning, or room hint here. This note stays in the journal only until the party leaves the dungeon.",
});

const religionPowers = {
  lioran: { label: "Lioran", power: "Lioran, the Dawn-Bearer" },
  maera: { label: "Maera", power: "Maera Hearthwise" },
  hadrin: { label: "Hadrin", power: "Hadrin Mile-Saint" },
  naevra: { label: "Naevra", power: "Naevra, Keeper of Names" },
  orund: { label: "Orund", power: "Orund Embervein" },
  thessa: { label: "Thessa", power: "Thessa Thorn-Crowned" },
  kharovan: { label: "Kharovan", power: "Kharovan, the Buried Crown" },
  crucible: { label: "Crucible Powers", power: "The Four Crucible Powers" },
  hollow: { label: "Hollow Below", power: "The Hollow Below" },
};

function religionHandout(powerId, id, title, type, text, options = {}) {
  const power = religionPowers[powerId];
  const body = options.booklet
    ? text
    : `# ${title}

*${type}. Associated power: ${power.power}.*

${text}

## Journal Tags

Religion / ${power.label}`;
  handout(`religion-${powerId}-${id}`, title, {
    title,
    categories: [`Religion / ${power.label}`],
    tags: ["religion", `religion:${powerId}`, `deity:${powerId}`, ...(options.tags ?? [])],
    text: body,
  });
}

const religionBooklets = [
  ["lioran", "booklet", "The Low Lantern Catechism", "lantern-church booklet", `# The Low Lantern Catechism

*A stitched booklet used by village lantern-priests and dawnwardens.*

## First Answer

If a traveler asks, "What does Lioran stand for?" answer plainly: Lioran stands for the courage to keep light for someone else.

Do not say he stands for brightness alone. Any fool can praise noon. Lioran is the god of the wick guarded in a storm, the candle left in a window, the lantern carried back into a tunnel because one voice is still missing. His light is not proud. His light kneels.

His symbol is the seven-rayed lantern. Some churches hang it high above the altar, but the old rite sets it on the floor between priest and petitioner. The meaning is simple: light is not a crown. Light is a duty placed where feet may find it.

## What We Teach

We teach that darkness is old, not evil by itself. The Depth was before the first dawn. Caves, sleep, grief, winter, closed eyes, and honest fear are not sins. Evil begins when darkness is used to hide cruelty, lies, abandonment, or the refusal to see another person's suffering.

Lioran asks three things of the faithful:

- Carry light where it is needed.
- Tell the truth when silence would protect harm.
- Stand with the frightened until they can stand.

When questioned about undead, a cleric should answer: "We do not burn the dead because they are ugly to us. We bring light so the dead can be known, named, and released. If the dead are being used, we break the hand using them."

## Worship

Common worship is humble. A candle before a journey. A lantern over a door. A dawn vigil after a death. A truth-oath by flame. Children are taught to cup a candle with both hands and pass it carefully to another child. That is considered a holier lesson than any sermon.

Lioran's clerics bless lamps, expose lies, ward crossings, cleanse haunted rooms, and sit with people who are afraid to sleep. A good cleric does not shame fear. Fear is the body admitting the dark is large. Courage is deciding the dark does not get to choose for you.`],
  ["maera", "booklet", "The Hearthwise Book of Doors", "household faith primer", `# The Hearthwise Book of Doors

*A soft-bound household primer copied by innkeepers, midwives, cooks, and threshold-priests.*

## On Maera

When someone asks, "Is Maera a goddess?" do not begin with argument. Ask whether they have ever been cold and then welcomed in. Ask whether they have ever smelled bread after grief. Ask whether they have ever returned to a room and felt the room remember them.

That is where Maera lives.

Some temples call her Lady of the Threshold. Some grandmothers call her the Warm Bowl. Some scholars say she is not one being at all, but the gathered strength of every hearth kept faithfully against the Depth. A Hearthwise cleric need not settle the matter before offering soup.

## What She Stands For

Maera stands for shelter that remains shelter even when the world outside becomes strange. She stands for guest-right, clean bedding, shared food, mended roofs, named rooms, and the courage to keep a door human.

Her symbols are the bowl over flame, the crossed spoon and latch, the folded guest cloth, and the black nail hidden beneath the hearthstone.

She is not soft in the way fools mean soft. Hospitality has teeth. A Maeran house feeds the stranger, but it also knows where the threshold lies.

## Worship

Worship is done daily because homes are made daily. Sweep the threshold. Bless the pot. Name the empty chair. Cover the bed of the missing.

If challenged by a warrior who calls hearth-faith small, answer: "Every army marches away from a door. Every king was once carried to a bed. Every hero eats. If the hearth fails, all great things become wandering."`],
  ["hadrin", "booklet", "Boots, Nails, and Honest Miles", "roadwarden question book", `# Boots, Nails, and Honest Miles

*A roadwarden's question book, issued to shrine-keepers and Expedition Board chaplains.*

## The Short Road Answer

When asked what Hadrin stands for, say: safe passage, honest distance, return, and the duty to mark the way for those who come after.

Do not claim Hadrin made the roads. The old roads dislike that. Hadrin was a walker before he was a saint, and some say he became holy because he kept walking when kings, maps, and mile ledgers failed.

His symbols are the bootprint, the nail, the milepost, the chalk mark, and the small bell tied to a traveler's pack.

## Doctrine of the Mile

A road is not dirt. A road is an agreement between places. It says: you may leave and still be able to return. The Depth hates this. It shortens paths, lengthens grief, eats signs, moves bridges, and teaches travelers to doubt their own maps.

Hadrin's faithful resist by marking, naming, filing, and walking. A road walked honestly becomes harder to steal from the world.

If asked whether Hadrin is a god, say: "He is a saint who answers roads." If pressed, say: "The difference matters to theologians and old roads. To a lost child in rain, the difference can wait."`],
  ["naevra", "booklet", "Questions for the Newly Gravebound", "Gravebinder initiation booklet", `# Questions for the Newly Gravebound

*An initiation booklet for junior Gravebinders, copied in black ink with space for local additions.*

## Who Is Naevra?

Naevra is the Keeper of Names. She is not death. Death comes without being called. Naevra is what answers after death and asks, "Who was this?"

Her symbols are the grave-bell, the thread-bound ledger, the candle at fog, the name-tag, and the black ribbon tied around a book that must not be opened casually.

If someone asks what she stands for, answer: memory, burial, rightful naming, merciful record, and the refusal to let the Depth dissolve a person into nothing useful.

## Why Names Matter

A name is not decoration. A name is a handle by which love, law, grief, and mercy may still find the dead. The nameless dead are not cursed because Naevra despises them. They are endangered because too many doors open when no correct name holds them shut.

If asked why Naevra allows undeath, answer: "She does not allow a storm by failing to stop every raindrop. We are her hands where the roof has broken."`],
  ["orund", "booklet", "The Ember Claim Primer", "forge-temple instruction book", `# The Ember Claim Primer

*A forge-temple instruction book used by claim-priests, smiths, and mine elders.*

## The First Matter

Orund Embervein stands for honest craft, lawful claim, endurance under pressure, and the oath between hand, tool, and material.

Do not tell children he is merely a forge god. Fire is only one part of the matter. Orund is also the weight of stone, the patience of ore, the cost of digging, and the shame of making a tool meant to betray its user.

His symbols are the hammer over a glowing vein, the ash thumbprint, the sealed claim mark, the oath-blade wrapped until needed, and the anvil that is never used for false work.

## The Claim

A claim is not ownership in the greedy surface sense. A claim is a contract with what lies beneath. The earth gives, the miner risks, the smith shapes, the community remembers the debt.

If asked whether Orund is god or saint, answer: "Orund answers through the work. If you want to know him, make something that will outlast your pride."`],
  ["thessa", "booklet", "The Thorn-Crowned Pact", "pactland teaching book", `# The Thorn-Crowned Pact

*A pactland teaching book recited by hunters, boundary-priests, and villages near old woods.*

## Before the First Question

If someone asks what Thessa stands for, do not answer indoors if you can avoid it. Take them to the fence, the treeline, the old stump, the place where dogs stop barking. Then answer.

Thessa stands for the wild as a partner in law. She stands for blood-price, boundary, hunt, growth, hunger, breeding, territory, and the old agreements mortals call superstition after they become inconvenient.

Her symbols are antlers wrapped in thorn-vine, the red cord on a hunter's wrist, the salt left after a kill, the boundary stone with roots around it, and the crown no human head can wear safely.

If asked why Thessa protects monsters, answer: "Because some monsters kept the pact when we did not."`],
  ["kharovan", "booklet", "The Crown Beneath: A Loyal Defense", "royal temple apologetic", `# The Crown Beneath: A Loyal Defense

*A formal booklet distributed by crown-temples, magistrates, and old military chapels.*

## The Public Answer

When questioned by common folk, answer without hesitation: Kharovan stands for lawful command, solemn duty, rightful rule, military memory, and the burden of authority.

His symbol is the crown half-buried in black soil. It teaches that command is not meant to glitter forever. A ruler is crowned above the people and buried beneath them. Authority must end in service, judgment, and remembrance.

Without command, armies become mobs. Without law, grief becomes vengeance. Without succession, every death becomes a war. Kharovan teaches that rule can be holy when it binds the powerful first.

Some whisper Kharovan is no god. Some say the Empty Crown answers in his place. A loyal priest does not repeat tavern poison. But if a crown speaks without mercy, do not kneel merely because it knows the old words.`],
  ["crucible", "booklet", "The Fourfold Crucible Primer", "Collegium field primer", `# The Fourfold Crucible Primer

*A field primer issued by the Crucible Collegium to apprentices, shrine engineers, and elemental wardens.*

## Opening Correction

The Four Crucible Powers are not gods in the temple sense. Do not flatter them. Do not insult them. Do not assume they notice the difference.

Flame changes. Stone remembers. Tide returns. Storm reveals.

Flame is marked by the split coal, the red bowl, and the ash circle. Stone is marked by the stacked weight, the sealed cairn, and the square spiral. Tide is marked by the blue cord, the shell-key, and the returning line. Storm is marked by the open eye, the forked stroke, and the bell hung where wind can find it.

If asked, "Do you serve the elements?" answer: "No. I keep terms with them."`],
  ["hollow", "booklet", "The Kindness Underneath", "Hollow Below cult tract", `# The Kindness Underneath

*A persuasive tract copied by Hollow Below cults and sometimes carried by desperate petitioners.*

## The First Comfort

They tell you the gods are above because above is far away. They tell you to wait, to file, to bury, to confess, to light candles, to mend roads, to feed guests, to pay prices, to obey crowns, to balance flame against tide.

The Hollow is closer.

Put your hand to the floor. There. That is the first altar. No pilgrim road. No temple fee. No priest deciding whether your grief is doctrinally clean enough to be heard.

If they ask whether the Hollow is a god, answer: "It answers." If they ask what price it takes, answer gently: "All powers take prices. The bright ones merely teach you to call the price virtue."`],
];

religionBooklets.forEach(([powerId, id, title, type, text]) => religionHandout(powerId, id, title, type, text, { booklet: true, tags: ["booklet", "religion-booklet"] }));

const shortReligionHandouts = [
  ["lioran", "lantern-wake-prayer", "Lantern-Wake Prayer", "prayer leaf", "Light the wick before the name is spoken. Hold the flame low, not high, so it remembers the floor. Lioran sees the brave, but he blesses the ones who bring light to someone else's hands."],
  ["lioran", "dawn-watch-log", "Dawn Watch Log of Westmere Gate", "guard log", "Third bell before dawn: no movement on the road. Fourth bell: cold blue shine under the east arch. Fifth bell: Private Roan swore the lantern answered him. Sixth bell: sunrise, and the dead in the ditch were only bones again."],
  ["lioran", "seven-ray-chant", "Chant of the Seven Rays", "temple chant", "One ray for the lost. One ray for the liar made honest. One for the door. One for the blade. One for the grave. One for the child who waits. One for the walker who enters the dark anyway."],
  ["lioran", "letter-from-a-lantern-priest", "Letter from a Lantern Priest", "creased letter", "Do not tell them the dark is evil. Tell them it is old. Tell them it is heavy. Tell them Lioran does not hate the Depth. He teaches us how to cross what would otherwise keep us."],
  ["lioran", "last-light-dungeon-note", "Last Light Dungeon Note", "charred note", "We are out of oil. Ser Jessa says to burn the map next. I said no. The map knows the road home. We burned my confession instead. The flame held until morning."],
  ["lioran", "lanternmaker-receipt", "Lanternmaker's Receipt", "shop receipt", "One stormglass lantern, seven-rayed frame, paid by the Gravebinders. Engraving requested: For the nameless, not against them."],
  ["lioran", "dawn-bearer-vision", "Vision of the Dawn-Bearer", "vision transcript", "I saw a figure carrying a lantern with both hands. He did not raise it above his head. He knelt and set it beside a sleeping stranger. Then the horizon remembered itself."],
  ["lioran", "blackglass-sermon", "Blackglass Sermon Fragment", "sermon fragment", "If your lantern shows no path, shield it. If your lantern shows a monster, name it. If your lantern shows yourself, do not look away."],
  ["lioran", "first-lantern-heresy", "The First Lantern Heresy", "banned margin note", "The god did not light the Lantern. The Lantern lit the god. This is not blasphemy unless the church has mistaken gratitude for ownership."],
  ["lioran", "candle-vow-for-children", "Candle Vow for Children", "nursery prayer", "Small flame, stay. Small heart, stay. If the dark comes knocking, we do not open. If the road calls crying, we wake the grown ones."],
  ["maera", "guest-right-card", "Guest-Right Card", "kitchen card", "A guest is not a friend yet. A guest is a promise. Salt before questions. Bread before bargains. Fire before fear."],
  ["maera", "threshold-broom-rhyme", "Threshold Broom Rhyme", "rhyme slip", "Sweep out ash, sweep in name. Leave no bootprint for grief to claim. Door shut softly, latch laid kind. What is welcome stays behind."],
  ["maera", "innkeeper-winter-log", "Innkeeper's Winter Log", "logbook", "Five strangers in the snow. Fed them all. One had no shadow and would not cross the hearthline. Charged him anyway. Maera hates waste, not caution."],
  ["maera", "empty-bed-cloth", "Note Pinned to an Empty Bed", "bedside note", "Keep this cloth clean until spring. If Joran returns, he gets the bed. If his ghost returns, he gets the candle. If something wearing him returns, wake the priest."],
  ["maera", "pot-prayer", "Pot Prayer Before Siege", "prayer scrap", "Lady of the Threshold, stretch the stew, soften the beans, shame the miser, and let no child learn the taste of boiled leather."],
  ["maera", "hearth-nail-invoice", "Hearth-Nail Invoice", "mason invoice", "Set one black nail beneath the family stone. Do not ask where the nail was made. Do not remove it if the house burns. Build around it."],
  ["maera", "grandmother-argument", "Grandmother's Argument", "family letter", "You say Maera is not a goddess because no idol answers you. Fool child. Your door answers. Your soup answers. Your brother came home. What more shape does mercy need?"],
  ["maera", "kettle-oracle", "Kettle Oracle of Brackenwick", "oracle note", "When the kettle sang with no fire under it, Old Mave said three guests were coming and one must not be fed salt. She was right twice and wrong once. The wrong one survived."],
  ["maera", "hearthwise-initiation", "Hearthwise Initiation Vow", "vow sheet", "I will mend before I judge. I will feed before I preach. I will bar the door only after I know what waits outside."],
  ["maera", "crumbs-on-the-stone", "Crumbs on the Stone", "child's note", "Mama says leave crumbs for Maera. Papa says mice get them. I asked the mice. They said thank you in Grandma's voice."],
  ["hadrin", "milepost-prayer", "Milepost Prayer", "roadside prayer", "Nail for the road. Coin for the keeper. Name for the ledger. Boot for the mud. Hadrin, count us out and count us back."],
  ["hadrin", "pilgrim-map-margin", "Pilgrim Map Margin", "map note", "Do not trust the straight road after Bellhollow. It is shorter each dusk. Walk the old curve with three mileposts and the saint will know your boots."],
  ["hadrin", "caravan-master-log", "Caravan Master's Log", "caravan log", "Lost two wagons near the dry ford. Found their wheel tracks at the next shrine, facing home. Left nails, names, and apology. Took the long road after."],
  ["hadrin", "chalk-mark-code", "Chalk Mark Code of the Roadwardens", "code sheet", "Circle means water. Cross means toll. Three lines means burial needed. Bootprint means safe today. Bootprint scratched out means the road remembers someone else."],
  ["hadrin", "hadrin-was-mortal", "Hadrin Was Mortal", "scholar's note", "The oldest songs call him Hadrin of the Sore Feet. No halo. No birth omen. Just a man who walked every broken road until the roads began answering."],
  ["hadrin", "lost-expedition-tag", "Lost Expedition Tag", "metal tag", "Expedition 44. Seven went out. If found, file at a Board house. If we arrive before this tag, do not let us in."],
  ["hadrin", "bridge-blessing", "Bridge Blessing", "painted plank", "May the first foot cross humbly. May the last foot look back. May the river fail to learn our names."],
  ["hadrin", "road-spindle-lecture", "Road-Spindle Lecture Fragment", "lecture scrap", "Roads are not lines. They are promises between places. Hadrin did not invent that promise. He learned to keep it from fraying."],
  ["hadrin", "tavern-wall-route", "Route Scratched on a Tavern Wall", "wall carving", "North to Crowmill only if the black dog follows. East to Ledgerfall only if it does not. If no dog appears, sleep upstairs and try again."],
  ["hadrin", "saint-callers-warning", "Warning to Saint-Callers", "order notice", "Do not call Hadrin a god in front of old roads. They know the difference and dislike flattery."],
  ["naevra", "grave-candle-instruction", "Grave-Candle Instruction", "burial card", "Light one candle for the body. One for the name. None for the thing that answers late."],
  ["naevra", "death-book-page", "Loose Death-Book Page", "ledger page", "Mara Vell, daughter of Oswin. Baker. Sang badly. Hated pears. Died with her name intact. Returned no further trouble."],
  ["naevra", "nameless-warning", "Warning About the Nameless", "grave notice", "If the corpse has no name, do not bury it under a borrowed one. A false name is a door. Something may accept the invitation."],
  ["naevra", "bell-thread-prayer", "Bell-Thread Prayer", "prayer thread", "Tie the thread. Ring the bell. Speak the name once for grief, once for record, once so the Depth hears it was denied."],
  ["naevra", "gravebinder-field-log", "Gravebinder Field Log", "field log", "Recovered nineteen soldiers. Sixteen names. Two guesses. One silence. The silence followed us until we burned the guesses."],
  ["naevra", "naevra-vision-transcript", "Naevra Vision Transcript", "vision transcript", "She did not look like death. She looked like a woman trying to remember too many faces at once."],
  ["naevra", "ledger-heresy", "The Ledger Heresy", "banned note", "Naevra keeps the Ledger. She did not write the first page. Ask what did, and why the gods fear blank ink."],
  ["naevra", "soldier-name-tag", "Bent Soldier Name-Tag", "relic tag", "CAPTAIN EDRIN VAUL. If I rise, remind me I hated command and loved plum wine. If that fails, break my jaw before I speak orders."],
  ["naevra", "mourner-song", "Mourner's Song", "song sheet", "Sleep if you can. Stay if you must. Speak if you know us. Leave if you trust."],
  ["naevra", "record-of-a-stolen-name", "Record of a Stolen Name", "case file", "The girl lives. The grave answers. The mother remembers both. Until we know which one the Ledger follows, do not ring the bell."],
  ["orund", "first-strike-rite", "First Strike Rite", "mine rite", "Oil the pick. Ash the thumb. Strike once. Listen. If the wall answers like a drum, claim. If it answers like a lung, seal."],
  ["orund", "smith-oath-card", "Smith-Oath Card", "forge card", "I will not shape a false oath. I will not cool a blade in coward's blood. I will not name cheap iron heirloom steel."],
  ["orund", "claim-dispute-log", "Claim Dispute Log", "legal log", "Both clans swear Orund marked the vein. Both brought true ash. Neither brought the first stone. Verdict delayed until the mine stops whispering."],
  ["orund", "deep-hammer-warning", "Deep Hammer Warning", "red-stamped notice", "Forge miracles are not free. Heat rises from somewhere. If the anvil sweats black, stop singing."],
  ["orund", "ember-oath-song", "Ember Oath Song", "work song", "Hammer down, heart held fast. Ore remembers every cast. Break the blade and keep the name. Better shame than oathless flame."],
  ["orund", "miner-last-page", "Miner's Last Page", "journal page", "We found old hammer marks below the permitted depth. Not dwarf work. Not giant. Each mark was warm. Each mark knew my father's name."],
  ["orund", "orund-saint-or-god", "Orund, Saint or God?", "debate note", "Dwarves say god. Surface claims say saint. The ore says nothing until struck, and then it says pay attention."],
  ["orund", "anvil-dream", "Anvil Dream", "dream record", "I dreamed a king under a mountain striking his own crown flat into a plowshare. When I woke, the forge had made a key."],
  ["orund", "forbidden-claim-marker", "Forbidden Claim Marker", "claim marker", "This vein is sealed by ash, debt, and breath. Any clan reopening it inherits the contract and whatever still collects."],
  ["orund", "pact-smith-confession", "Pact-Smith Confession", "confession", "I called myself priest because the village trusted that word. Truth: the hammer answered before Orund did."],
  ["thessa", "hunters-blood-price", "Hunter's Blood-Price", "hunter token", "Take meat, leave marrow. Take hide, leave song. Take antler, leave salt. Take all, and be taken."],
  ["thessa", "woodcutter-permit", "Woodcutter's Permit", "village permit", "Three trees granted by thorn-law. Fourth requires witness. Fifth requires apology. Sixth requires a priest with running shoes."],
  ["thessa", "beast-tribe-prayer", "Beast-Tribe Prayer Stone", "scratched stone", "Thorn Mother, count our cubs before you count their sheep. If blood is due, show whose fence crossed first."],
  ["thessa", "thorn-charm-instruction", "Thorn Charm Instruction", "charm note", "Hang above the livestock gate. Replace after first blood. If the thorns bloom indoors, move the animals and confess the boundary."],
  ["thessa", "trophy-lodge-dispute", "Trophy Lodge Dispute Note", "guild note", "Respectful mounting requires name, date, place, cause, and return-offering. A head on a wall without record is theft from Thessa and bad cataloguing."],
  ["thessa", "green-court-warning", "Green Court Warning", "warning bark", "Do not bow. Do not kneel. Stand as prey stands when it understands the hunt. The Crown of Thorn respects straight spines."],
  ["thessa", "pactland-child-rhyme", "Pactland Child Rhyme", "child rhyme", "Red berry, black thorn, leave the old stump where it was born. White tooth, yellow eye, ask the fox before you lie."],
  ["thessa", "druid-field-note", "Druid Field Note", "field note", "The villagers say the wolves invaded. The wolves say the fence did. Thessa has not answered because both are correct."],
  ["thessa", "thorn-crowned-vision", "Vision of the Thorn-Crowned", "vision transcript", "I saw no woman. I saw a crown of antlers, briar, wet leaves, and old teeth. It turned, and every path became a question."],
  ["thessa", "old-pact-breach", "Old Pact Breach Record", "pact record", "Boundary stone moved by plowman Vess. Two goats taken. One son dreamed of hooves. Settlement paid in salt, song, and the plowman's best field."],
  ["kharovan", "royal-oath-prayer", "Royal Oath Prayer", "court prayer", "Crown below, witness above. Let command serve law. Let law serve the living. Let the dead keep only what they are owed."],
  ["kharovan", "barrow-sergeant-log", "Barrow Sergeant's Log", "military log", "Orders continued after burial. Voice correct. Seal correct. Mercy absent. Request theological review."],
  ["kharovan", "succession-trial-note", "Succession Trial Note", "trial note", "Three heirs touched the relic. The honest one bled. The cruel one heard music. The youngest heard nothing and fled before coronation."],
  ["kharovan", "crown-pact-confession", "Crown-Pact Confession", "sealed confession", "I called the miracle divine because the soldiers needed faith. But the power came when I obeyed the crown, not when I prayed to Kharovan."],
  ["kharovan", "empty-crown-fragment", "Empty Crown Fragment", "broken inscription", "There is no king beneath the crown. There is only the shape that makes knees remember bending."],
  ["kharovan", "buried-crown-litany", "Buried Crown Litany", "temple litany", "Duty under soil. Law under bone. Command under silence. Rise only when summoned. Kneel only when worthy."],
  ["kharovan", "grave-weight-prophecy", "Grave-Weight Prophecy", "prophecy scrap", "When the crown grows heavier than the head, the kingdom will ask the dead to stand. They will obey. That is the horror."],
  ["kharovan", "magistrate-letter", "Magistrate's Private Letter", "private letter", "Kharovan's priests blessed the verdict before hearing the case. I begin to suspect the god of law prefers order to justice."],
  ["kharovan", "organ-crypt-sheet", "Organ Crypt Sheet Music", "music sheet", "The notes are names. The rests are missing names. Play the rests and the Crown listens."],
  ["kharovan", "anti-crown-broadside", "Anti-Crown Broadside", "seditious broadside", "No buried king feeds your child. No holy crown plows your field. Break command before command learns to walk without a ruler."],
  ["crucible", "fourfold-student-primer", "Fourfold Student Primer", "student primer", "Flame changes. Stone remembers. Tide returns. Storm reveals. Repeat until you stop calling them gods by accident."],
  ["crucible", "veyraflame-prayer", "Veyraflame Ash Prayer", "ash prayer", "Burn what must change. Spare what must endure. If hunger answers, feed it only truth."],
  ["crucible", "korrum-stone-note", "Korrum Stoneheart Quarry Note", "quarry note", "The stone refused the chisel until we named the man buried under it. After that, it split politely."],
  ["crucible", "ilyr-tide-letter", "Ilyr Tidemarked Bottle Letter", "bottle letter", "I threw this into a dry well. If it reaches the sea, forgive me. If it reaches you, the Tide has a stranger sense of direction than the maps."],
  ["crucible", "sathren-storm-transcript", "Sathren Storm-Eye Transcript", "storm transcript", "Question shouted: where is the missing shrine? Answer heard in thunder: under the lie you keep dry."],
  ["crucible", "collegium-safety-card", "Crucible Collegium Safety Card", "safety card", "If flame sings, step back. If stone hums, write it down. If tide climbs walls, remove boots. If storm speaks your name, do not answer alone."],
  ["crucible", "failed-balance-report", "Failed Balance Report", "research report", "We fed Flame without Tide, woke Stone without Storm, and called the result a shrine. The shrine disagreed by exploding downward."],
  ["crucible", "elemental-pact-token", "Elemental Pact Token", "token inscription", "No element serves. No element forgives. Each exchanges. Bring price before request."],
  ["crucible", "primal-not-personal", "Primal, Not Personal", "lecture margin", "Do not pray to fire as though it loves you. Pray so that you remember what it does."],
  ["crucible", "crucible-lullaby", "Crucible Lullaby", "lullaby", "Sleep in stone, wake in rain, dream in smoke, breathe again."],
  ["hollow", "too-deep-prayer", "Prayer Sent Too Deep", "blotted prayer", "I asked any god to save my son. Something answered from under the floor. My son breathes. He casts no shadow on stairs."],
  ["hollow", "hollow-cult-chant", "Hollow Cult Chant", "cult chant", "Below is patient. Below is kind. Below takes shape when gods go blind."],
  ["hollow", "missing-god-reply", "Reply from a Missing God", "oracle reply", "The handwriting matched Saint Orren's shrine. Saint Orren has been dead and silent for eighty years. The ink smelled of wet stone."],
  ["hollow", "resurrection-error", "Resurrection Error Note", "healer note", "Heart restored. Breath restored. Name uncertain. Patient repeats the last word spoken in the room beneath the room."],
  ["hollow", "depth-mask-warning", "Depth-Mask Warning", "Gravebinder warning", "If a god answers too quickly underground, thank nothing aloud. Real gods arrive through rites. The Hollow arrives through openings."],
  ["hollow", "well-sermon", "Sermon at the Dry Well", "sermon scrap", "They told you the gods are above because they fear what listens below. Kneel down. The earth is closer than heaven."],
  ["hollow", "hollow-bargain-ledger", "Hollow Bargain Ledger", "bargain ledger", "Price paid: one memory of mother's face. Benefit: safe passage through the drowned hall. Outstanding debt: mother's voice still calling."],
  ["hollow", "monster-dream", "Monster's Dream Tablet", "scratched tablet", "It dreams us upward. We dream it a mouth. We are both wrong and both hungry."],
  ["hollow", "anti-depth-prayer", "Prayer Against the Hollow", "ward prayer", "Let no answer come without a name. Let no mercy come without a witness. Let no door open beneath the word please."],
  ["hollow", "final-stair-note", "Note on the Final Stair", "last note", "If you hear your god below this step, ask them something only the living would refuse to answer."],
];

shortReligionHandouts.forEach(([powerId, id, title, type, text]) => religionHandout(powerId, id, title, type, `*${type}.*\n\n> ${text}`));
})();
