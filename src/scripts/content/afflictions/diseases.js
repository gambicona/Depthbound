(() => {
const afflictions = window.DungeonAfflictions ?? { poisons: {}, diseases: {}, curses: {} };
window.DungeonAfflictions = afflictions;

const disease = (id, definition) => {
  afflictions.diseases[id] = {
    id,
    type: "disease",
    saveAbility: "con",
    saveDc: 12,
    curePriceCp: 2500,
    ...definition,
  };
};

disease("cackle-fever", {
  name: "Cackle Fever",
  saveDc: 13,
  curePriceCp: 5000,
  description: "A humanoid fever that breaks concentration and control with fits of laughter.",
  onsetText: "1d4 hours",
  status: {
    id: "disease-cackle-fever",
    label: "Cackle Fever",
    disease: true,
    diseaseId: "cackle-fever",
    conditionDescription: "Disorienting fever. At turn start, stress can trigger psychic damage and brief incapacitation.",
    skillBonus: -1,
    diseaseTurnTrigger: { saveDc: 13, chance: 0.35, damage: { count: 1, sides: 10, type: "psychic" }, incapacitateRounds: 1 },
  },
});

disease("sewer-plague", {
  name: "Sewer Plague",
  saveDc: 11,
  curePriceCp: 3500,
  description: "A filthy wasting sickness carried by sewage, rats, and fouled bites.",
  onsetText: "1d4 days",
  status: {
    id: "disease-sewer-plague",
    label: "Sewer Plague",
    disease: true,
    diseaseId: "sewer-plague",
    conditionDescription: "Wasting sickness. Healing is reduced and daily saves decide whether the weakness worsens or clears.",
    attackBonus: -1,
    saveBonus: -1,
    healingReceivedMultiplier: 0.5,
    diseaseTimedTrigger: { intervalHours: 24, saveDc: 11, successTarget: 1, failPenalty: { attackBonus: -1, saveBonus: -1 } },
  },
});

disease("sight-rot", {
  name: "Sight Rot",
  saveDc: 15,
  curePriceCp: 7500,
  description: "A painful eye infection that clouds vision and can end in blindness.",
  onsetText: "1 day",
  status: {
    id: "disease-sight-rot",
    label: "Sight Rot",
    disease: true,
    diseaseId: "sight-rot",
    conditionDescription: "Bleeding, clouded eyes. Repeated daily failures lead to blindness until cured.",
    attackBonus: -1,
    skillBonus: -1,
    diseaseTimedTrigger: {
      intervalHours: 24,
      saveDc: 15,
      successTarget: 2,
      failureBlindnessAt: 3,
      blindedStatus: { id: "disease-sight-rot-blinded", label: "Blinded by Sight Rot", condition: "blinded", attackBonus: -3, disease: true, diseaseId: "sight-rot" },
    },
  },
});

const contagionDisease = (id, name, status, curePriceCp = 10000) => disease(id, {
  name,
  saveDc: 14,
  curePriceCp,
  description: "A magical disease matching the legacy Contagion spell list.",
  onsetText: "immediate",
  magical: true,
  status: {
    id: `disease-${id}`,
    label: name,
    disease: true,
    diseaseId: id,
    durationHours: 168,
    ...status,
  },
});

contagionDisease("blinding-sickness", "Blinding Sickness", { condition: "blinded", attackBonus: -3, skillBonus: -2, conditionDescription: "Pain grips the mind and the eyes turn milky; blinded and poor Wisdom checks/saves." });
contagionDisease("filth-fever", "Filth Fever", { attackBonus: -2, skillBonus: -2, conditionDescription: "A raging fever weakens Strength checks, Strength saves, and Strength attacks." });
contagionDisease("flesh-rot", "Flesh Rot", { vulnerabilities: ["bludgeoning", "piercing", "slashing", "acid", "cold", "fire", "force", "lightning", "necrotic", "poison", "psychic", "radiant", "thunder"], skillBonus: -2, conditionDescription: "Flesh decays; Charisma suffers and all incoming damage is more dangerous." });
contagionDisease("mindfire", "Mindfire", { saveBonus: -2, skillBonus: -2, conditionDescription: "A fever burns through thought; Intelligence checks and saves suffer." });
contagionDisease("seizure", "Seizure", { attackBonus: -2, speedBonusFeet: -10, conditionDescription: "The body shakes uncontrollably; Dexterity checks, Dexterity saves, and Dexterity attacks suffer." });
contagionDisease("slimy-doom", "Slimy Doom", { saveBonus: -2, diseaseDamageTrigger: { stunnedRounds: 1 }, conditionDescription: "The body bleeds easily; Constitution checks and saves suffer, and damage can briefly stun." });
})();
