const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const rootDir = path.resolve(__dirname, "..", "..");
const serverPath = path.join(rootDir, "playtest-server.js");
const defaultPort = 8012;

function argValue(name, fallback = "") {
  const prefix = `${name}=`;
  const exactIndex = process.argv.indexOf(name);
  if (exactIndex >= 0 && process.argv[exactIndex + 1]) return process.argv[exactIndex + 1];
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  return inline ? inline.slice(prefix.length) : fallback;
}

const port = Number(argValue("--port", process.env.PLAYTEST_PORT || defaultPort)) || defaultPort;
const noStart = process.argv.includes("--no-start");
const headed = process.argv.includes("--headed") || process.env.HEADED === "1";
const baseUrl = `http://127.0.0.1:${port}`;

function getJson(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`GET ${url} returned ${response.statusCode}: ${body.slice(0, 200)}`));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.on("error", reject);
  });
}

async function waitForStatus(timeoutMs = 15000) {
  const started = Date.now();
  let lastError = null;
  while (Date.now() - started < timeoutMs) {
    try {
      return await getJson(`${baseUrl}/playtest-status`);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error(`Playtest server did not become ready on ${baseUrl}: ${lastError?.message || "timeout"}`);
}

function startServer() {
  return spawn(process.execPath, [serverPath, String(port)], {
    cwd: rootDir,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function assert(condition, message, details = null) {
  if (condition) return;
  const error = new Error(message);
  if (details) error.details = details;
  throw error;
}

async function injectScenario(page) {
  return page.evaluate(async () => {
    const save = await fetch("/depthbound-slot-1.json").then((response) => response.json());
    state = save.state;
    gameHasStarted = true;
    state.mode = "home";
    state.questFlags = { ...(state.questFlags || {}) };
    Object.assign(state.questFlags, {
      "flag.village.monsterHunterGuildUnlocked": true,
      "flag.village.gravebindersUnlocked": true,
      factionFirstContactSeen: { "monster-guild": true, gravebinders: true },
      monsterHunterGuild: { reputation: 45, completedContracts: 1, trophiesTurnedIn: 2 },
      gravebinders: { reputation: 25, completedContracts: 1, remainsRecovered: 1 },
    });

    let world;
    try {
      world = await window.DepthboundWorldTravel.createInitialWorldState({ seed: "qa-normal-world" });
    } catch {
      world = {
        version: 2,
        generator: "qa",
        seed: "qa-normal-world",
        chunkWidth: 8,
        chunkHeight: 8,
        chunks: {
          "0,0": {
            width: 8,
            height: 8,
            cells: Array.from({ length: 8 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => ({ row, col, biome: "grassland", tile: "grassland" })),
            ),
            objects: [],
          },
        },
        currentHex: { chunkX: 0, chunkY: 0, row: 1, col: 1 },
        homeHex: { chunkX: 0, chunkY: 0, row: 1, col: 1 },
        homeVillageId: "",
        discoveredHexes: {},
        rumoredHexes: {},
        visitedStructures: {},
        settlementsByHex: {},
        teleportCircles: {},
        travelPlan: [],
        routeHistory: [],
        tavernRumors: [],
        travelLog: [],
      };
    }

    state.world = window.DepthboundWorldTravel.normalizeWorldState(world);
    state.world.discoveredHexes[window.DepthboundWorldTravel.cellId(0, 0, 2, 3)] = true;
    state.world.rumoredHexes[window.DepthboundWorldTravel.cellId(0, 0, 3, 4)] = { label: "Normal QA rumor", source: "test" };
    state.world.travelLog = [{ day: 3, text: "Normal QA party mapped a landmark." }];

    const homeBoardId = typeof settlementBoardId === "function"
      ? settlementBoardId(settlementBoardHomeProfile())
      : `home:${state.world.homeVillageId || "home-village"}`;
    const boardWindowStart = Math.floor((Number(state.worldDay) || 1) / 7) * 7;
    state.questFlags.settlementQuestBoards = {
      [homeBoardId]: {
        boardId: homeBoardId,
        sourceName: "Home Village",
        windowStartDay: boardWindowStart,
        refreshDay: boardWindowStart + 7,
        quests: [
          {
            id: "qa-normal-board-available",
            status: "available",
            title: "Clear the Lantern Ford",
            sourceName: "Home Village",
            description: "Something is stalking the ford after dusk.",
            objective: "Clear the ford.",
            targetHex: { chunkX: 0, chunkY: 0, row: 2, col: 3 },
            expiresDay: boardWindowStart + 7,
            rewardCp: 5000,
          },
        ],
      },
    };

    render();
    return {
      mode: state.mode,
      heroes: state.party?.heroIds?.length || 0,
      boardId: homeBoardId,
    };
  });
}

async function collectFunctionality(page) {
  return page.evaluate(() => {
    const result = { errors: {} };

    try {
      showTravelMapMenu();
      result.travel = {
        hidden: document.querySelector("#travel-map-menu")?.classList.contains("hidden"),
        hexes: document.querySelectorAll(".travel-hex").length,
        hasRumor: /RUMOR/i.test(document.querySelector("#travel-map-menu")?.innerText || ""),
      };
      hideTravelMapMenu();
    } catch (error) {
      result.errors.travel = error.message;
    }

    try {
      showVillageMenu();
      result.village = {
        hidden: document.querySelector("#village-menu")?.classList.contains("hidden"),
        cards: document.querySelectorAll("#village-menu .village-entry-card").length,
        factionCards: Array.from(document.querySelectorAll("#village-menu .village-entry-card"))
          .filter((card) => /Trophy Lodge|Gravebinders/i.test(card.innerText || "")).length,
      };
      hideVillageMenu();
    } catch (error) {
      result.errors.village = error.message;
    }

    try {
      renderSettlementQuestBoardMenu(settlementBoardHomeProfile());
      els.villageMenu?.classList.remove("hidden");
      const before = Object.values(state.questFlags.settlementQuestBoards || {})
        .flatMap((board) => board?.quests || [])
        .find((quest) => quest.id === "qa-normal-board-available")?.status;
      document.querySelector("#village-menu [data-action='accept-settlement-board-quest'][data-quest='qa-normal-board-available']")?.click();
      const after = Object.values(state.questFlags.settlementQuestBoards || {})
        .flatMap((board) => board?.quests || [])
        .find((quest) => quest.id === "qa-normal-board-available")?.status;
      result.board = {
        before,
        after,
        logMentionsAccepted: (state.log || []).some((entry) => /accepted/i.test(entry.text || "")),
      };
      hideVillageMenu();
    } catch (error) {
      result.errors.board = error.message;
    }

    try {
      showQuestLog();
      result.questLog = {
        hidden: document.querySelector("#game-dialog")?.classList.contains("hidden"),
        entries: document.querySelectorAll(".quest-log-entry").length,
        titles: typeof acceptedQuestLogEntries === "function" ? acceptedQuestLogEntries().map((entry) => entry.title) : [],
        text: (document.querySelector("#game-dialog-message")?.innerText || "").slice(0, 1000),
      };
      if (typeof activeDialogCancel === "function") activeDialogCancel();
    } catch (error) {
      result.errors.questLog = error.message;
    }

    try {
      showHomeMenu();
      result.home = {
        hidden: document.querySelector("#home-menu")?.classList.contains("hidden"),
        text: (document.querySelector("#home-menu")?.innerText || "").slice(0, 500),
      };
      hideHomeMenu();
    } catch (error) {
      result.errors.home = error.message;
    }

    try {
      const heroes = (state.party?.rosterIds || state.party?.heroIds || [])
        .map((id) => state.fighters?.[id])
        .filter(Boolean);
      const heroSummaries = heroes.map((hero) => {
        const abilities = typeof availableFighterAbilities === "function" ? availableFighterAbilities(hero) : [];
        const spells = typeof spellDefinitionsForFighter === "function" ? spellDefinitionsForFighter(hero) : [];
        const groups = typeof abilityMenuGroups === "function"
          ? abilityMenuGroups(hero, abilities, spells)
          : { class: [], subclass: [], racial: [], other: [], spellGroups: new Map() };
        const subclassOptions = [...(hero.subclasses || []), ...(hero.adminSubclasses || [])];
        return {
          id: hero.id,
          name: hero.name,
          classId: hero.classId,
          race: hero.race,
          subrace: hero.subrace,
          level: hero.level,
          spellCount: spells.length,
          abilityCount: abilities.length,
          classAbilityCount: groups.class?.length || 0,
          subclassAbilityCount: groups.subclass?.length || 0,
          racialAbilityCount: groups.racial?.length || 0,
          otherAbilityCount: groups.other?.length || 0,
          spellLevelGroups: groups.spellGroups ? Array.from(groups.spellGroups.keys()) : [],
          classFeatureCount: hero.classFeatures?.length || 0,
          subclassOptionCount: subclassOptions.length,
          subclassAbilityOptionCount: subclassOptions.reduce((sum, subclass) => sum + (subclass.abilities?.length || 0), 0),
          knownSpellIds: (hero.spells || []).slice(0, 12),
          abilityIds: abilities.map((ability) => ability.id).slice(0, 12),
        };
      });

      const sampleIds = ["hero-wizard", "hero-warlock", "hero-rogue", "hero-cleric"].filter((id) => state.fighters?.[id]);
      const renderedMenus = {};
      for (const heroId of sampleIds) {
        setActiveHero(heroId);
        showAbilitiesMenu();
        const text = document.querySelector("#abilities-menu")?.innerText || "";
        renderedMenus[heroId] = {
          hidden: document.querySelector("#abilities-menu")?.classList.contains("hidden"),
          text: text.slice(0, 1600),
          hasClassSection: /Class Abilities/i.test(text),
          hasSubclassSection: /Subclass Abilities/i.test(text),
          hasRacialSection: /Racial Abilities/i.test(text),
          hasSpellbook: /Spellbook/i.test(text),
          rowCount: document.querySelectorAll("#abilities-menu .use-item-row").length,
        };
        hideAbilitiesMenu();
      }

      const subclassSampleSource = heroes.find((hero) =>
        [...(hero.subclasses || []), ...(hero.adminSubclasses || [])].some((subclass) => (subclass.abilities || []).length),
      );
      let subclassSample = null;
      if (subclassSampleSource) {
        const subclass = [...(subclassSampleSource.subclasses || []), ...(subclassSampleSource.adminSubclasses || [])]
          .find((entry) => (entry.abilities || []).length);
        const minLevel = Math.max(3, ...((subclass?.abilities || []).map((ability) => Number(ability.level) || 1)));
        const hero = subclassSampleSource;
        const previous = {
          level: hero.level,
          subclassId: hero.subclassId,
          subclassName: hero.subclassName,
          subclassVariant: hero.subclassVariant,
          abilities: hero.abilities,
          abilityUses: hero.abilityUses,
        };
        hero.level = Math.max(hero.level || 1, minLevel);
        hero.subclassId = subclass.id;
        hero.subclassName = subclass.name;
        hero.subclassVariant = subclass.adminOnly ? "full" : "";
        ensureFighterAbilityState(hero);
        setActiveHero(hero.id);
        showAbilitiesMenu();
        const text = document.querySelector("#abilities-menu")?.innerText || "";
        const abilities = availableFighterAbilities(hero);
        const groups = abilityMenuGroups(hero, abilities, spellDefinitionsForFighter(hero));
        subclassSample = {
          heroId: hero.id,
          classId: hero.classId,
          subclassId: subclass.id,
          subclassName: subclass.name,
          level: hero.level,
          subclassAbilityCount: groups.subclass?.length || 0,
          hidden: document.querySelector("#abilities-menu")?.classList.contains("hidden"),
          hasSubclassSection: /Subclass Abilities/i.test(text),
          text: text.slice(0, 1200),
        };
        hideAbilitiesMenu();
        Object.assign(hero, previous);
      }

      result.capabilities = {
        heroes: heroSummaries,
        totals: {
          heroes: heroSummaries.length,
          spellcasters: heroSummaries.filter((hero) => hero.spellCount > 0).length,
          heroesWithClassAbilities: heroSummaries.filter((hero) => hero.classAbilityCount > 0).length,
          heroesWithRacialAbilities: heroSummaries.filter((hero) => hero.racialAbilityCount > 0).length,
          heroesWithSubclassOptions: heroSummaries.filter((hero) => hero.subclassOptionCount > 0).length,
          subclassAbilityOptions: heroSummaries.reduce((sum, hero) => sum + hero.subclassAbilityOptionCount, 0),
        },
        renderedMenus,
        subclassSample,
      };
    } catch (error) {
      result.errors.capabilities = error.message;
    }

    return result;
  });
}

async function runScenario() {
  const browser = await chromium.launch({ headless: !headed });
  const context = await browser.newContext();
  const page = await context.newPage();
  const logs = [];
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) logs.push(`${message.type()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => logs.push(`pageerror: ${error.message}`));

  await page.goto(`${baseUrl}/index.html`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => window.DepthboundWorldTravel && typeof render === "function", { timeout: 30000 });
  const setup = await injectScenario(page);
  const functionality = await collectFunctionality(page);
  await browser.close();

  const result = {
    scenario: "normal-functionality",
    baseUrl,
    setup,
    functionality,
    logs,
  };

  assert(setup.heroes > 0, "Scenario did not load party heroes.", result);
  assert(functionality.travel && !functionality.travel.hidden && functionality.travel.hexes > 0, "World map did not open/render.", result);
  assert(functionality.village && !functionality.village.hidden && functionality.village.factionCards >= 2, "Village/faction directory did not render.", result);
  assert(functionality.board?.before === "available" && functionality.board?.after === "accepted", "Normal quest-board accept flow failed.", result);
  assert(functionality.questLog && !functionality.questLog.hidden && functionality.questLog.titles.includes("Clear the Lantern Ford"), "Quest log did not show newly accepted board quest.", result);
  assert(functionality.home && !functionality.home.hidden, "Home menu did not open.", result);
  assert(functionality.capabilities?.totals?.heroes >= 12, "Capability check did not see the all-class roster.", result);
  assert(functionality.capabilities?.totals?.spellcasters >= 6, "Spell capability check did not find enough spellcasting heroes.", result);
  assert(functionality.capabilities?.totals?.heroesWithClassAbilities >= 7, "Class ability check did not find enough class abilities.", result);
  assert(functionality.capabilities?.totals?.heroesWithRacialAbilities >= 2, "Race ability check did not find racial abilities.", result);
  assert(functionality.capabilities?.totals?.heroesWithSubclassOptions >= 10, "Subclass metadata check did not find enough subclass option sets.", result);
  assert(functionality.capabilities?.totals?.subclassAbilityOptions > 0, "Subclass metadata check did not find subclass abilities.", result);
  assert(functionality.capabilities?.renderedMenus?.["hero-wizard"]?.hasSpellbook, "Wizard abilities menu did not render a Spellbook section.", result);
  assert(functionality.capabilities?.renderedMenus?.["hero-warlock"]?.hasRacialSection, "Warlock abilities menu did not render racial abilities.", result);
  assert(functionality.capabilities?.renderedMenus?.["hero-rogue"]?.hasClassSection, "Rogue abilities menu did not render class abilities.", result);
  assert(functionality.capabilities?.subclassSample?.hasSubclassSection && functionality.capabilities?.subclassSample?.subclassAbilityCount > 0, "Subclass abilities menu did not render for promoted sample hero.", result);
  assert(Object.keys(functionality.errors || {}).length === 0, "One or more UI actions threw errors.", result);

  return result;
}

(async () => {
  let server = null;
  try {
    if (!noStart) server = startServer();
    await waitForStatus();
    const result = await runScenario();
    console.log(JSON.stringify({ ok: true, ...result }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({ ok: false, error: error.message, details: error.details || null }, null, 2));
    process.exitCode = 1;
  } finally {
    if (server && !server.killed) server.kill();
  }
})();
