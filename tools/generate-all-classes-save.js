const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("playwright");

async function main() {
  const root = path.resolve(__dirname, "..");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://127.0.0.1:8003/index.html", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.DungeonContent && window.DungeonContent.list("classes").length >= 12 && typeof createHomeState === "function");

  const payload = await page.evaluate(() => {
    const classIds = ["barbarian", "bard", "cleric", "druid", "fighter", "monk", "paladin", "ranger", "rogue", "sorcerer", "warlock", "wizard"];
    const racePairs = Object.entries(speciesDefinitions).flatMap(([raceId, race]) => Object.keys(race.subraces ?? {}).map((subraceId) => ({ raceId, subraceId })));
    const names = Object.fromEntries(classIds.map((classId) => [classId, `Test ${getHeroTemplate(classId).className ?? getHeroTemplate(classId).name ?? classId}`]));
    const tokens = { barbarian: "X", bard: "B", cleric: "C", druid: "D", fighter: "F", monk: "M", paladin: "P", ranger: "N", rogue: "R", sorcerer: "S", warlock: "K", wizard: "W" };

    const allEligibleClassSpells = (classTemplate) =>
      eligibleSpellChoicesFor({
        ...classTemplate,
        classSpellList: [...(classTemplate.classSpellList ?? classTemplate.spellList ?? classTemplate.spells ?? [])],
        level: 1,
      }).map((spell) => spell.id);

    const allEligibleClassCantrips = (classTemplate) =>
      eligibleCantripChoicesFor({
        ...classTemplate,
        classCantripList: [...(classTemplate.classCantripList ?? classTemplate.cantripList ?? [])],
        level: 1,
      }).map((spell) => spell.id);

    const heroes = classIds.map((classId, index) => {
      const raceSelection = normalizeRaceSelection({
        ...racePairs[index % racePairs.length],
        dragonAncestryId: "red",
        abilityChoices: ["str", "dex", "con", "int", "wis", "cha"],
      });
      const classTemplate = getHeroTemplate(classId);
      const classSpellList = [...(classTemplate.classSpellList ?? classTemplate.spellList ?? classTemplate.spells ?? [])];
      const classCantripList = [...(classTemplate.classCantripList ?? classTemplate.cantripList ?? [])];
      const spells = [...allEligibleClassCantrips(classTemplate), ...allEligibleClassSpells(classTemplate)];
      const options = {
        classId,
        raceSelection,
        abilityScores: classPredefinedAbilityScores[classId] ?? pregeneratedAbilityScores,
        fightingStyle: fightingStyleChoicesForClass(classId)[0]?.value ?? null,
        classSpellList,
        classCantripList,
        spells,
        unusedSpellChoiceCredits: 0,
        unusedCantripChoiceCredits: 0,
        ...quickStartProficiencies(classId, raceSelection),
        ...createQuickStartGearOptions(classId, raceSelection),
        d20Mode: "karmic",
      };
      const hero = createCombatant(applyHeroCreationOptions({ ...classTemplate, id: `hero-${classId}`, name: names[classId], position: { x: 0, y: 0 } }, options));
      hero.id = `hero-${classId}`;
      hero.name = names[classId];
      hero.token = tokens[classId];
      hero.partyRole = ["fighter", "barbarian", "paladin"].includes(classId) ? "tank" : ["cleric", "bard", "druid"].includes(classId) ? "support" : "striker";
      hero.testSaveNotes = {
        purpose: "Level 1 all-classes test hero",
        race: raceDisplayName(raceSelection),
        spellcasterSpellPolicy: spells.length
          ? "All level-1-eligible class spells and cantrips available from the class list, intentionally not limited to normal creation choice count."
          : "No level-1 spell choices for this class.",
      };
      ensureSpellPointState(hero);
      return hero;
    });

    const state = createHomeState(heroes, [], { cp: 0, sp: 0, gp: 0 }, {
      activeHeroId: heroes[0].id,
      heroIds: heroes.map((hero) => hero.id),
      rosterIds: heroes.map((hero) => hero.id),
      partyTomes: [],
    });
    const testHomePositions = [
      { x: 16, y: 14 }, { x: 17, y: 14 }, { x: 18, y: 14 }, { x: 19, y: 14 },
      { x: 16, y: 15 }, { x: 17, y: 15 }, { x: 18, y: 15 }, { x: 19, y: 15 },
      { x: 16, y: 16 }, { x: 17, y: 16 }, { x: 18, y: 16 }, { x: 19, y: 16 },
    ];
    state.party.heroIds.forEach((heroId, index) => {
      if (state.fighters[heroId]) state.fighters[heroId].position = { ...testHomePositions[index] };
    });
    state.saveSlotId = 1;
    state.d20Mode = "karmic";
    state.log = [{ text: "All-class level 1 test save generated for QA.", type: "important" }];

    return {
      schemaVersion: 2,
      version: 2,
      slotId: 1,
      name: "All Classes Level 1 Test Save",
      savedAt: new Date().toISOString(),
      format: { app: "Depthbound", storage: "manual-test-file" },
      state,
      testSaveSummary: heroes.map((hero) => ({
        id: hero.id,
        name: hero.name,
        classId: hero.classId,
        className: hero.className,
        race: raceDisplayName(hero.raceSelection),
        spells: hero.spells ?? [],
        classSpellListCount: (hero.classSpellList ?? []).length,
        classCantripListCount: (hero.classCantripList ?? []).length,
      })),
    };
  });

  await browser.close();
  const outPath = path.join(root, "depthbound-all-classes-level-1-test-save.json");
  await fs.writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(JSON.stringify({ outPath, heroes: payload.testSaveSummary.length, activeParty: payload.state.party.heroIds }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
