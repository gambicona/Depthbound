(() => {
const barbarianSubclassFeatureLevels = [3, 6, 10, 14];
const rageUsesByLevel = [{ level: 3, uses: 3 }, { level: 6, uses: 4 }, { level: 12, uses: 5 }, { level: 17, uses: 6 }, { level: 20, uses: 99 }];
const rageAbility = { id: "rage", name: "Rage", level: 1, refresh: "longRest", uses: 2, usesByLevel: rageUsesByLevel, resource: "bonusAction", description: "Enter a battle fury for 10 rounds: resist weapon damage and add +2 melee damage, improving to +3 at level 9 and +4 at level 16." };

const stormAuraOptions = [
  { id: "stormAuraDesert", name: "Desert Aura", aura: "desert", description: "Burn nearby enemies with desert heat whenever your storm aura flares." },
  { id: "stormAuraSea", name: "Sea Aura", aura: "sea", description: "Crack an enemy with storm lightning when your aura lashes out." },
  { id: "stormAuraTundra", name: "Tundra Aura", aura: "tundra", description: "Wrap your allies in cold endurance, granting temporary hit points." },
];

const totemSpiritOptions = [
  { id: "totemBear", name: "Bear Totem", totem: "bear", description: "Become the stubborn front line, taking punishment that would break others." },
  { id: "totemEagle", name: "Eagle Totem", totem: "eagle", description: "Move like a diving hunter, crossing the battlefield with sudden speed." },
  { id: "totemWolf", name: "Wolf Totem", totem: "wolf", description: "Fight as a pack leader, opening enemies to your allies' attacks." },
];

const barbarianSubclasses = [
  {
    id: "ancestral-guardian",
    name: "Path of the Ancestral Guardian",
    source: "Xanathar's Guide to Everything",
    summary: "A protector whose rage calls ancestral spirits to mark enemies and shield allies.",
    gameplayGuide: [
      "This path is strongest when you stand near allies and make yourself the problem enemies must answer.",
      "While raging, your first empowered hit can mark a foe with ancestral pressure, making them less effective against your friends.",
      "Spirit Shield and Vengeful Ancestors appear as reaction defenses, reducing damage to allies and later punishing the attacker.",
    ],
    featureNamesByLevel: { 3: ["Ancestral Protectors"], 6: ["Spirit Shield"], 10: ["Consult the Spirits"], 14: ["Vengeful Ancestors"] },
    features: [
      { level: 3, name: "Ancestral Protectors", description: "Your rage calls guardian spirits that harry the first enemy you strike, protecting allies from that foe." },
      { level: 6, name: "Spirit Shield", description: "Use your reaction to let ancestral spirits reduce damage against someone nearby." },
      { level: 10, name: "Consult the Spirits", description: "Your ancestors guide scouting and omens, giving this barbarian a supernatural explorer identity." },
      { level: 14, name: "Vengeful Ancestors", description: "When your spirits block damage, they lash back with force against the attacker." },
    ],
    abilities: [
      { id: "spiritShield", name: "Spirit Shield", level: 6, refresh: "turn", uses: 1, resource: "reaction", description: "When a nearby ally takes damage, reduce it with ancestral protection." },
    ],
  },
  {
    id: "battlerager",
    name: "Path of the Battlerager",
    source: "Sword Coast Adventurer's Guide",
    summary: "A brutal close-quarters rager who turns armor, momentum, and reckless pressure into damage.",
    gameplayGuide: [
      "Battlerager wants to be in melee during Rage, pressing into enemies instead of holding back.",
      "Battlerager Spikes gives you a bonus-action attack while raging, and Reckless Abandon rewards Reckless Attack with temporary HP.",
      "Later features add charging mobility and automatic spike punishment when enemies hit you in melee.",
    ],
    featureNamesByLevel: { 3: ["Battlerager Armor"], 6: ["Reckless Abandon"], 10: ["Battlerager Charge"], 14: ["Spiked Retribution"] },
    features: [
      { level: 3, name: "Battlerager Armor", description: "Your spiked armor style turns grappling, brawling, and bonus-action pressure into damage." },
      { level: 6, name: "Reckless Abandon", description: "When you attack recklessly, the thrill of danger grants temporary hit points." },
      { level: 10, name: "Battlerager Charge", description: "While raging, you can surge forward as a bonus action to reach the next fight." },
      { level: 14, name: "Spiked Retribution", description: "Enemies who hit you in melee are punished by your spikes." },
    ],
    abilities: [
      { id: "battleragerSpikes", name: "Battlerager Spikes", level: 3, refresh: "turn", uses: 1, resource: "bonusAction", description: "While raging, slam spikes into your current target with a quick bonus attack." },
      { id: "battleragerCharge", name: "Battlerager Charge", level: 10, refresh: "turn", uses: 1, resource: "bonusAction", description: "While raging, gain extra movement so you can crash into the next enemy." },
    ],
  },
  {
    id: "beast",
    name: "Path of the Beast",
    source: "Tasha's Cauldron of Everything",
    summary: "A shapeshifting predator whose rage manifests fangs, claws, tail, mobility, and infectious fury.",
    gameplayGuide: [
      "This path treats Rage as a partial transformation. When you enter Rage, choose Bite, Claws, or Tail for the whole rage.",
      "Bite favors staying alive, Claws favor extra offense, and Tail favors defensive reach. The form does not cost another bonus action after Rage.",
      "Higher levels add supernatural movement, infectious fury on weapon hits, and a pack-hunt rally for nearby allies.",
    ],
    featureNamesByLevel: { 3: ["Form of the Beast"], 6: ["Bestial Soul"], 10: ["Infectious Fury"], 14: ["Call the Hunt"] },
    features: [
      { level: 3, name: "Form of the Beast", description: "Your rage grows fangs, claws, or a lashing tail for different combat styles." },
      { level: 6, name: "Bestial Soul", description: "Your body adapts for primal movement and your beast strikes carry supernatural force." },
      { level: 10, name: "Infectious Fury", description: "Your ferocity can overwhelm a creature you hit, driving extra psychic pain or forced movement." },
      { level: 14, name: "Call the Hunt", description: "Your hunt-call steels nearby allies and adds predatory damage to your own attacks." },
    ],
    abilities: [
      { id: "infectiousFury", name: "Infectious Fury", level: 10, refresh: "longRest", uses: 3, resource: "bonusAction", description: "Charge your next hit with savage psychic fury that can stagger the target." },
      { id: "callTheHunt", name: "Call the Hunt", level: 14, refresh: "longRest", uses: 1, resource: "bonusAction", description: "Rally the party with a predator's call, gaining temporary HP and extra damage." },
    ],
  },
  {
    id: "berserker",
    name: "Path of the Berserker",
    source: "Player's Handbook",
    summary: "A direct fury path that trades restraint for extra attacks, fear, and retaliation.",
    gameplayGuide: [
      "Berserker is simple and aggressive: Rage first, then use Frenzy when you want another attack every round.",
      "Mindless Rage is passive protection against fear and charm while raging.",
      "Intimidating Presence spends your action to frighten a foe, and Retaliation appears as a reaction when enemies damage you in melee.",
    ],
    featureNamesByLevel: { 3: ["Frenzy"], 6: ["Mindless Rage"], 10: ["Intimidating Presence"], 14: ["Retaliation"] },
    features: [
      { level: 3, name: "Frenzy", description: "Push Rage into a battle frenzy and make an extra attack as a bonus action." },
      { level: 6, name: "Mindless Rage", description: "While raging, your fury burns through charm and fear." },
      { level: 10, name: "Intimidating Presence", description: "Use raw menace to frighten a visible enemy." },
      { level: 14, name: "Retaliation", description: "When a nearby enemy hurts you, strike back with your reaction." },
    ],
    abilities: [
      { id: "frenzy", name: "Frenzy", level: 3, refresh: "turn", uses: 1, resource: "bonusAction", description: "While raging, make one extra weapon attack against your current target." },
      { id: "intimidatingPresence", name: "Intimidating Presence", level: 10, refresh: "turn", uses: 1, resource: "action", description: "Frighten your current target with overwhelming menace." },
      { id: "retaliation", name: "Retaliation", level: 14, refresh: "turn", uses: 1, resource: "reaction", description: "When a melee enemy damages you, answer with a reaction strike." },
    ],
  },
  {
    id: "giant",
    name: "Path of the Giant",
    source: "Bigby Presents: Glory of the Giants",
    summary: "A giant-powered rager who grows, throws elemental force, and moves creatures around the field.",
    gameplayGuide: [
      "This path makes Rage feel huge: your reach, damage, and battlefield control grow with you.",
      "Elemental Cleaver charges your next weapon hit with chosen giant-element damage.",
      "Mighty Impel is a bonus-action control tool that moves a nearby enemy, and later features make your giant rage stronger.",
    ],
    featureNamesByLevel: { 3: ["Giant's Havoc"], 6: ["Elemental Cleaver"], 10: ["Mighty Impel"], 14: ["Demiurgic Colossus"] },
    features: [
      { level: 3, name: "Giant's Havoc", description: "Your rage swells with giant strength, making you hit harder and threaten more space." },
      { level: 6, name: "Elemental Cleaver", description: "Infuse a weapon strike with giant elemental power." },
      { level: 10, name: "Mighty Impel", description: "Use giant strength to shove a creature across the battlefield." },
      { level: 14, name: "Demiurgic Colossus", description: "Your giant transformation becomes more destructive." },
    ],
    abilities: [
      { id: "elementalCleaver", name: "Elemental Cleaver", level: 6, refresh: "turn", uses: 1, resource: "bonusAction", description: "While raging, charge your next hit with elemental giant power." },
      { id: "mightyImpel", name: "Mighty Impel", level: 10, refresh: "turn", uses: 1, resource: "bonusAction", description: "Throw your weight into a nearby enemy, slowing and disrupting them." },
    ],
  },
  {
    id: "storm-herald",
    name: "Path of the Storm Herald",
    source: "Xanathar's Guide to Everything",
    summary: "A primal storm bearer whose rage radiates desert fire, sea lightning, or tundra endurance.",
    gameplayGuide: [
      "Choose a storm aura. While raging, your aura ability uses that environment's effect.",
      "Desert damages nearby foes, Sea focuses lightning into one target, and Tundra shields allies with temporary HP.",
      "Later storm features add resistance, environmental protection, and a stronger aura burst.",
    ],
    featureNamesByLevel: { 3: ["Storm Aura"], 6: ["Storm Soul"], 10: ["Shielding Storm"], 14: ["Raging Storm"] },
    features: [
      { level: 3, name: "Storm Aura", description: "Your rage radiates a chosen storm environment that you can flare as a bonus action." },
      { level: 6, name: "Storm Soul", description: "Your chosen storm changes how you endure the world and resist damage." },
      { level: 10, name: "Shielding Storm", description: "Your storm's protection can extend to nearby allies." },
      { level: 14, name: "Raging Storm", description: "Your aura punishes enemies caught in the worst of your storm." },
    ],
    optionCounts: { stormAuras: [{ level: 3, count: 1 }] },
    stormAuraOptions,
    abilities: [
      { id: "stormAuraPulse", name: "Storm Aura", level: 3, refresh: "turn", uses: 1, resource: "bonusAction", description: "While raging, flare your chosen storm aura." },
    ],
  },
  {
    id: "totem-warrior",
    name: "Path of the Totem Warrior",
    source: "Player's Handbook",
    summary: "A spirit-touched rager who chooses animal totems for defense, mobility, or pack tactics.",
    gameplayGuide: [
      "Choose totem spirits as you level. Each totem shapes how your Rage supports your role.",
      "Bear is defensive, Eagle is mobile, and Wolf helps allies strike better.",
      "Later totem choices add exploration identity and stronger combat support, shown as passive bonuses or rage tools where the game can use them.",
    ],
    featureNamesByLevel: { 3: ["Spirit Seeker", "Totem Spirit"], 6: ["Aspect of the Beast"], 10: ["Spirit Walker"], 14: ["Totemic Attunement"] },
    features: [
      { level: 3, name: "Spirit Seeker", description: "You commune with primal spirits and carry their guidance outside battle." },
      { level: 3, name: "Totem Spirit", description: "Choose a totem that changes what your Rage is best at." },
      { level: 6, name: "Aspect of the Beast", description: "Your totem deepens into travel, senses, and strength beyond combat." },
      { level: 10, name: "Spirit Walker", description: "You can seek counsel from your animal spirit." },
      { level: 14, name: "Totemic Attunement", description: "Your totem grants a stronger combat gift while raging." },
    ],
    optionCounts: { totems: [{ level: 3, count: 1 }, { level: 6, count: 2 }, { level: 14, count: 3 }] },
    totemOptions: totemSpiritOptions,
    abilities: [
      { id: "totemSurge", name: "Totem Surge", level: 3, refresh: "turn", uses: 1, resource: "bonusAction", description: "While raging, call on your chosen totem for defense, speed, or pack pressure." },
    ],
  },
  {
    id: "wild-magic",
    name: "Path of Wild Magic",
    source: "Tasha's Cauldron of Everything",
    summary: "A chaotic rager whose fury bursts into unpredictable magic and party support.",
    gameplayGuide: [
      "When you Rage, wild magic surges into a random battle effect.",
      "Bolstering Magic is a support button that improves an ally's attacks and checks.",
      "Later features let you reroll a surge and improve the unstable magic when a fight needs a different answer.",
    ],
    featureNamesByLevel: { 3: ["Magic Awareness", "Wild Surge"], 6: ["Bolstering Magic"], 10: ["Unstable Backlash"], 14: ["Controlled Surge"] },
    features: [
      { level: 3, name: "Magic Awareness", description: "You sense nearby magic through primal instinct." },
      { level: 3, name: "Wild Surge", description: "Your Rage bursts into a random magical effect." },
      { level: 6, name: "Bolstering Magic", description: "Share wild power with an ally, improving their next attacks and checks." },
      { level: 10, name: "Unstable Backlash", description: "When danger hits you, your wild magic can flare again." },
      { level: 14, name: "Controlled Surge", description: "You gain more say over which wild surge shapes your Rage." },
    ],
    abilities: [
      { id: "bolsteringMagic", name: "Bolstering Magic", level: 6, refresh: "longRest", uses: 3, resource: "action", description: "Give yourself or an ally a wild-magic boost to attacks and checks." },
      { id: "unstableBacklash", name: "Unstable Backlash", level: 10, refresh: "turn", uses: 1, resource: "reaction", description: "When you take damage while raging, flare a new wild surge." },
    ],
  },
  {
    id: "zealot",
    name: "Path of the Zealot",
    source: "Xanathar's Guide to Everything",
    summary: "A divinely driven rager who adds radiant fury, bolsters allies, and refuses to fall.",
    gameplayGuide: [
      "Zealot adds divine damage to your rage offense with almost no extra setup.",
      "Fanatical Focus protects important saves, and Zealous Presence is a party-wide battle cry.",
      "At high level, Rage Beyond Death helps you keep acting when other heroes would drop.",
    ],
    featureNamesByLevel: { 3: ["Divine Fury", "Warrior of the Gods"], 6: ["Fanatical Focus"], 10: ["Zealous Presence"], 14: ["Rage Beyond Death"] },
    features: [
      { level: 3, name: "Divine Fury", description: "While raging, your first weapon hit each turn burns with divine damage." },
      { level: 3, name: "Warrior of the Gods", description: "Divine power marks you as a warrior whose soul is hard to keep down." },
      { level: 6, name: "Fanatical Focus", description: "Reroll a failed save through sheer holy conviction." },
      { level: 10, name: "Zealous Presence", description: "Unleash a battle cry that gives allies advantage on attacks and saves." },
      { level: 14, name: "Rage Beyond Death", description: "Your rage can keep you fighting at the edge of death." },
    ],
    abilities: [
      { id: "fanaticalFocus", name: "Fanatical Focus", level: 6, refresh: "longRest", uses: 1, resource: "none", description: "When you fail an important save, divine conviction can turn it around." },
      { id: "zealousPresence", name: "Zealous Presence", level: 10, refresh: "longRest", uses: 1, resource: "bonusAction", description: "Give nearby allies advantage on their next attacks and saving throws." },
    ],
  },
];

window.DungeonContent.register("classes", "barbarian", {
  name: "Stonebreaker",
  className: "Barbarian",
  classId: "barbarian",
  classRole: "barbarian",
  casterType: "none",
  role: "Level 1 Barbarian",
  level: 1,
  xp: 0,
  hitDie: 12,
  maxHp: 14,
  abilityMods: { str: 2, dex: 1, con: 2, wis: 1 },
  baseAc: 10,
  attackBonus: 4,
  damage: { count: 1, sides: 12, bonus: 2, type: "slashing", label: "1d12 + 2 slashing" },
  initiativeBonus: 1,
  speedFeet: 30,
  armorProficiencies: ["light", "medium", "shield"],
  weaponProficiencies: ["simple", "martial"],
  token: "B",
  classFeatures: [
    { level: 1, name: "Rage", description: "Enter a battle fury for 10 rounds: resist weapon damage and add scaling melee damage." },
    { level: 1, name: "Unarmored Defense", description: "While not wearing armor, your toughness and reflexes help protect you." },
    { level: 2, name: "Reckless Attack", description: "Trade defense for offense, striking with abandon to improve your attacks." },
    { level: 3, name: "Primal Path", description: "Choose the source and style of your barbarian rage." },
    { level: 5, name: "Extra Attack", description: "Attack more than once when you take the Attack action." },
    { level: 5, name: "Fast Movement", description: "Your speed increases by 10 ft while you are not wearing heavy armor." },
    { level: 7, name: "Feral Instinct", description: "Your instincts sharpen, helping you act early when combat begins." },
    { level: 9, name: "Brutal Critical", description: "Your critical melee hits become more devastating." },
    { level: 11, name: "Relentless Rage", description: "While raging, you can sometimes stay standing when damage would drop you." },
    { level: 18, name: "Indomitable Might", description: "Your raw Strength sets a high floor for feats of muscle." },
    { level: 20, name: "Primal Champion", description: "Your Strength and Constitution each increase by 4." },
  ],
  subclassFeatureLevels: barbarianSubclassFeatureLevels,
  subclasses: barbarianSubclasses,
  abilities: [
    rageAbility,
    { id: "recklessAttack", name: "Reckless Attack", level: 2, refresh: "turn", uses: 1, resource: "none", description: "Fight recklessly for better offense this turn while leaving yourself easier to hit." },
  ],
  equipment: { mainHand: "greataxe", torso: null },
  inventory: { money: { cp: 0, sp: 0, gp: 0 }, items: ["greataxe", "javelin", "javelin", "javelin", "javelin"] },
  startingGear: {
    steps: [
      {
        title: "Starting Weapon",
        message: "Choose your primary barbarian weapon.",
        choices: [
          { value: "greataxe", label: "Greataxe", equipment: { mainHand: "greataxe" }, inventory: ["greataxe"] },
          {
            value: "martial-melee",
            label: "Any martial melee weapon",
            select: { pool: "martialMeleeWeapons", title: "Choose Martial Melee Weapon", message: "Select a martial melee weapon.", label: "Weapon", slot: "mainHand" },
          },
        ],
      },
      {
        title: "Secondary Weapons",
        message: "Choose your additional barbarian weapons.",
        choices: [
          { value: "handaxes", label: "Two Handaxes", inventory: ["handaxe", "handaxe"] },
          {
            value: "simple",
            label: "Any simple weapon",
            select: { pool: "simpleWeapons", title: "Choose Simple Weapon", message: "Select a simple weapon.", label: "Weapon", slot: "" },
          },
        ],
      },
    ],
  },
});
})();
