const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const rootDir = path.resolve(__dirname, "..", "..");
const serverPath = path.join(rootDir, "playtest-server.js");
const defaultPort = 8010;

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
  const child = spawn(process.execPath, [serverPath, String(port)], {
    cwd: rootDir,
    env: { ...process.env, HOST: "127.0.0.1", PORT: String(port) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const output = [];
  child.stdout.on("data", (chunk) => output.push(String(chunk)));
  child.stderr.on("data", (chunk) => output.push(String(chunk)));
  child.on("exit", (code) => {
    if (code && code !== 0) output.push(`server exited with ${code}`);
  });
  child.playtestOutput = output;
  return child;
}

function assert(condition, message, details = null) {
  if (condition) return;
  const error = new Error(message);
  if (details) error.details = details;
  throw error;
}

async function injectHostScenario(page) {
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
      monsterHunterGuild: { reputation: 82, completedContracts: 3, trophiesTurnedIn: 5 },
      gravebinders: { reputation: 64, completedContracts: 2, remainsRecovered: 4 },
    });

    let world;
    try {
      world = await window.DepthboundWorldTravel.createInitialWorldState({ seed: "qa-multiplayer-world" });
    } catch {
      world = {
        version: 2,
        generator: "qa",
        seed: "qa-multiplayer-world",
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
    state.world.rumoredHexes[window.DepthboundWorldTravel.cellId(0, 0, 3, 4)] = { label: "QA rumor", source: "test" };
    state.world.visitedStructures["qa-ruin"] = { status: "cleared", clearedDay: 8 };
    state.world.travelLog = [{ day: 8, text: "QA party scouted the old road." }];
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
            id: "qa-board-accepted",
            status: "accepted",
            title: "Recover the Survey Casket",
            sourceName: "Home Village",
            description: "The marked casket waits at the old survey site.",
            objective: "Recover the marked casket and return to the board.",
            targetHex: { chunkX: 0, chunkY: 0, row: 2, col: 3 },
            acceptedDay: 7,
            rewardCp: 7500,
          },
          {
            id: "qa-board-available",
            status: "available",
            title: "Quiet the Broken Watchtower",
            sourceName: "Home Village",
            description: "A nearby watchtower is attracting trouble.",
            objective: "Clear the tower.",
            targetHex: { chunkX: 0, chunkY: 0, row: 3, col: 4 },
            expiresDay: 14,
            rewardCp: 5000,
          },
        ],
      },
    };

    render();
    window.DepthboundPlaytest.syncNow();
    return {
      questFlagCount: Object.keys(state.questFlags).length,
      discoveredKeys: Object.keys(state.world.discoveredHexes),
      mode: state.mode,
    };
  });
}

async function collectGuestVisibility(page) {
  await page.evaluate(() => {
    window.__qa = {};

    try {
      showTravelMapMenu();
      window.__qa.travel = {
        hidden: document.querySelector("#travel-map-menu")?.classList.contains("hidden"),
        hexes: document.querySelectorAll(".travel-hex").length,
        text: (document.querySelector("#travel-map-menu")?.innerText || "").slice(0, 1000),
      };
      hideTravelMapMenu();
    } catch (error) {
      window.__qa.travelError = error.message;
    }

    try {
      if (typeof showVillageMenu === "function") showVillageMenu();
      window.__qa.village = {
        hidden: document.querySelector("#village-menu")?.classList.contains("hidden"),
        cards: document.querySelectorAll("#village-menu .village-entry-card").length,
        factionNames: Array.from(document.querySelectorAll("#village-menu .village-entry-card"))
          .map((card) => card.innerText || "")
          .filter((text) => /Trophy Lodge|Gravebinders|Crucible|Antiquarian|Expedition|Boom|Fighting Pit/i.test(text))
          .map((text) => text.split("\n").map((part) => part.trim()).filter(Boolean).slice(0, 3).join(" | ")),
      };
      hideVillageMenu();
    } catch (error) {
      window.__qa.villageError = error.message;
    }

    try {
      showQuestLog();
      window.__qa.questLog = {
        hidden: document.querySelector("#game-dialog")?.classList.contains("hidden"),
        title: document.querySelector("#game-dialog-title")?.textContent || "",
        entries: document.querySelectorAll(".quest-log-entry").length,
        acceptedEntries: typeof acceptedQuestLogEntries === "function" ? acceptedQuestLogEntries().length : -1,
        titles: typeof acceptedQuestLogEntries === "function" ? acceptedQuestLogEntries().map((entry) => entry.title) : [],
        text: (document.querySelector("#game-dialog-message")?.innerText || "").slice(0, 1600),
      };
      if (typeof activeDialogCancel === "function") activeDialogCancel();
    } catch (error) {
      window.__qa.questLogError = error.message;
    }
  });

  await page.evaluate(() => {
    try {
      renderSettlementQuestBoardMenu(settlementBoardHomeProfile());
      els.villageMenu?.classList.remove("hidden");
      window.__qa.boardBefore = {
        hidden: document.querySelector("#village-menu")?.classList.contains("hidden"),
        availableStatus: Object.values(state.questFlags.settlementQuestBoards || {})
          .flatMap((board) => board?.quests || [])
          .find((quest) => quest.id === "qa-board-available")?.status,
      };
    } catch (error) {
      window.__qa.boardError = error.message;
    }
  });

  await page.evaluate(() => {
    const button = document.querySelector("#village-menu [data-action='accept-settlement-board-quest'][data-quest='qa-board-available']");
    window.__qa.acceptMutationButtonFound = Boolean(button);
    button?.click();
  });

  return page.evaluate(() => ({
    role: window.DepthboundPlaytest.role,
    connected: window.DepthboundPlaytest.connected,
    lastSnapshotAt: window.DepthboundPlaytest.lastSnapshotAt,
    lastIntentStatus: window.DepthboundPlaytest.lastIntentStatus,
    flags: {
      monster: Boolean(state.questFlags["flag.village.monsterHunterGuildUnlocked"]),
      grave: Boolean(state.questFlags["flag.village.gravebindersUnlocked"]),
      monsterRep: state.questFlags.monsterHunterGuild?.reputation,
      graveRep: state.questFlags.gravebinders?.reputation,
      acceptedBoardStatus: Object.values(state.questFlags.settlementQuestBoards || {})
        .flatMap((board) => board?.quests || [])
        .find((quest) => quest.id === "qa-board-accepted")?.status,
      availableBoardStatus: Object.values(state.questFlags.settlementQuestBoards || {})
        .flatMap((board) => board?.quests || [])
        .find((quest) => quest.id === "qa-board-available")?.status,
    },
    world: {
      hasWorld: Boolean(state.world),
      discovered: Object.keys(state.world?.discoveredHexes || {}).length,
      rumored: Object.keys(state.world?.rumoredHexes || {}).length,
      travelLog: state.world?.travelLog?.[0]?.text || "",
    },
    ui: window.__qa,
  }));
}

async function runScenario() {
  const browser = await chromium.launch({ headless: !headed });
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();
  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();
  const logs = { host: [], guest: [] };

  for (const [name, page] of [["host", hostPage], ["guest", guestPage]]) {
    page.on("console", (message) => {
      if (["error", "warning"].includes(message.type())) logs[name].push(`${message.type()}: ${message.text()}`);
    });
    page.on("pageerror", (error) => logs[name].push(`pageerror: ${error.message}`));
  }

  await hostPage.goto(`${baseUrl}/index.html?playtest=host&name=Host`, { waitUntil: "domcontentloaded" });
  await guestPage.goto(`${baseUrl}/index.html?playtest=guest&name=Guest`, { waitUntil: "domcontentloaded" });
  await hostPage.waitForFunction(() => window.DepthboundPlaytest && window.DepthboundWorldTravel && typeof render === "function", { timeout: 30000 });
  await guestPage.waitForFunction(() => window.DepthboundPlaytest && typeof render === "function", { timeout: 30000 });

  const setup = await injectHostScenario(hostPage);
  await guestPage.waitForFunction(
    () =>
      window.DepthboundPlaytest?.lastSnapshotAt > 0 &&
      state?.questFlags?.["flag.village.monsterHunterGuildUnlocked"] &&
      state?.world?.travelLog?.length,
    { timeout: 30000 },
  );

  const guest = await collectGuestVisibility(guestPage);
  const status = await getJson(`${baseUrl}/playtest-status`);
  await browser.close();

  const result = {
    scenario: "multiplayer-visibility",
    baseUrl,
    setup,
    guest,
    server: {
      socketCount: status.socketCount,
      latestSummary: status.latestSummary,
      latestSnapshotStats: status.latestSnapshotStats,
    },
    logs,
  };

  assert(guest.connected, "Guest socket did not connect.", result);
  assert(guest.flags.monster && guest.flags.grave, "Guest did not receive faction unlock flags.", result);
  assert(guest.flags.monsterRep === 82 && guest.flags.graveRep === 64, "Guest did not receive faction progress values.", result);
  assert(guest.flags.acceptedBoardStatus === "accepted", "Guest did not receive accepted board quest status.", result);
  assert(guest.flags.availableBoardStatus === "available", "Guest was able to mutate an available board quest.", result);
  assert(guest.world.hasWorld && guest.world.discovered >= 2 && guest.world.rumored >= 1, "Guest did not receive world map progress.", result);
  assert(guest.ui.travel && !guest.ui.travel.hidden && guest.ui.travel.hexes > 0, "Guest could not render the world hex map.", result);
  assert(guest.ui.village && !guest.ui.village.hidden && guest.ui.village.factionNames.length >= 2, "Guest could not see unlocked faction cards.", result);
  assert(guest.ui.questLog && !guest.ui.questLog.hidden && guest.ui.questLog.entries >= 1, "Guest could not open the quest log.", result);
  assert(guest.ui.questLog.titles.includes("Recover the Survey Casket"), "Guest quest log did not include the accepted board quest.", result);
  assert(/only the host can change/i.test(guest.lastIntentStatus || ""), "Guest mutation attempt did not report read-only protection.", result);

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
