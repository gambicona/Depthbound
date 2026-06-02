const TILE_BASE = "assets/bottomtiles/noiso_fitted/";
const MIDDLE_TILE_BASE = "assets/middletiles/";
const PATH_TILE_BASE = "assets/paths/";
const DEFAULT_WIDTH = 12;
const DEFAULT_HEIGHT = 12;
const TILE_SIZE = 172;
const HEX_WIDTH = 150;
const HEX_HEIGHT = 172;
const CROP_OVERSCAN = 0.035;
const OVERHANG_TILES = {
  forest_normal: { top: 0.18, shoulderInset: 0.08, sourceTop: 41, baseTop: 150 },
  mountain: { top: 0.22, shoulderInset: 0.28, sourceTop: 54, baseTop: 170 },
  swamp: { left: 0.1, sourceLeft: 110 }
};
const IMAGE_SOURCE_CROPS = {
  actic_frozenlake: crop(191, 119, 880, 1022),
  arctic: crop(207, 137, 841, 984),
  arctic_aurorasnowfield: crop(193, 123, 877, 1007),
  arctic_crackedice: crop(186, 112, 891, 1029),
  arctic_glacierfield: crop(186, 112, 891, 1031),
  arctic_rockytundra: crop(197, 128, 865, 998),
  arctic_snowplain: crop(186, 111, 890, 1031),
  arctic_snowypineedge: crop(186, 112, 892, 1033),
  ashland: crop(121, 40, 1016, 1150),
  badlands: crop(153, 58, 948, 1141),
  cave_underdark: crop(161, 72, 933, 1108),
  coast_beach: crop(161, 85, 932, 1081),
  coast_rocky: crop(142, 44, 980, 1148),
  crystalfield: crop(115, 54, 1025, 1171),
  desert: crop(146, 67, 969, 1086),
  desert_canyon: crop(146, 68, 970, 1087),
  desert_crackeddry: crop(148, 65, 965, 1087),
  desert_oasis: crop(146, 67, 968, 1085),
  desert_red: crop(146, 68, 969, 1086),
  desert_rocky: crop(162, 74, 931, 1113),
  desert_saltflat: crop(146, 66, 970, 1088),
  desert_sanddune: crop(144, 63, 971, 1092),
  forest_ancient: crop(113, 16, 1030, 1200),
  forest_autuum: crop(81, 24, 1092, 1198),
  forest_birch: crop(108, 15, 1043, 1211),
  forest_burnt: crop(106, 15, 1051, 1218),
  forest_dark: crop(122, 34, 1011, 1182),
  forest_darkmagical: crop(105, 10, 1048, 1209),
  forest_dead: crop(112, 42, 1032, 1170),
  forest_densepine: crop(113, 19, 1029, 1176),
  forest_fey: crop(99, 6, 1062, 1232),
  forest_jungle: crop(120, 69, 1016, 1123),
  forest_light: crop(113, 17, 1041, 1199),
  forest_mixed: crop(104, 9, 1054, 1217),
  forest_normal: crop(126, 150, 1001, 988),
  grassland: crop(166, 76, 923, 1069),
  grassland_flowermeadow: crop(156, 55, 948, 1127),
  grassland_hills: crop(137, 41, 983, 1166),
  grassland_lushplain: crop(154, 66, 947, 1107),
  grassland_openmeadow: crop(167, 75, 922, 1070),
  grassland_rocky: crop(165, 78, 925, 1090),
  grassland_rolllinghills: crop(137, 40, 983, 1166),
  grassland_windsweptsteppe: crop(158, 66, 943, 1119),
  highlands: crop(129, 37, 997, 1165),
  hills: crop(104, 21, 1054, 1212),
  jungle: crop(120, 69, 1016, 1123),
  jungle_dense: crop(106, 11, 1046, 1210),
  jungle_giantleaves: crop(116, 17, 1031, 1199),
  jungle_hill: crop(105, 10, 1048, 1212),
  jungle_mangrove: crop(106, 12, 1045, 1209),
  jungle_stoneovergrown: crop(106, 11, 1048, 1210),
  jungle_vine: crop(106, 11, 1049, 1209),
  jungle_wet: crop(106, 12, 1046, 1208),
  mountain: crop(174, 170, 904, 932),
  mountain_canyon: crop(129, 36, 997, 1166),
  mountain_cliffplateau: crop(128, 37, 1000, 1166),
  mountain_crystal: crop(128, 36, 999, 1166),
  mountain_greenhighland: crop(129, 36, 997, 1166),
  mountain_rocky: crop(131, 37, 995, 1166),
  mountain_snowy: crop(129, 37, 997, 1164),
  mountain_volcanic: crop(129, 36, 996, 1166),
  ocean: crop(163, 81, 929, 1087),
  ocean_coralreef: crop(163, 80, 930, 1089),
  ocean_darkabyssal: crop(164, 80, 927, 1088),
  ocean_deep: crop(164, 78, 930, 1089),
  ocean_icesea: crop(163, 80, 929, 1089),
  ocean_kelpforest: crop(163, 80, 929, 1089),
  ocean_shallow: crop(164, 80, 928, 1090),
  ocean_stormy: crop(163, 81, 928, 1087),
  savanna_drygrassland: crop(163, 69, 930, 1091),
  swamp: crop(152, 109, 950, 1037),
  swamp_blackwater: crop(82, 18, 1091, 1219),
  swamp_bog: crop(82, 18, 1091, 1220),
  swamp_deadtreebog: crop(82, 18, 1091, 1220),
  swamp_flooded: crop(100, 15, 1054, 1224),
  swamp_misty: crop(120, 25, 1027, 1195),
  swamp_muddymarsh: crop(82, 18, 1091, 1219),
  swamp_mushroom: crop(95, 11, 1066, 1232),
  swamp_reedmarsh: crop(100, 17, 1056, 1217),
  swamp_toxic: crop(83, 18, 1089, 1222),
  volcanic_sulfurwasteland: crop(151, 71, 953, 1101),
  volcano: crop(182, 107, 905, 1013),
  volcano_ashplain: crop(148, 88, 959, 1076),
  volcano_basaltfield: crop(167, 79, 924, 1091),
  volcano_lavacracks: crop(143, 66, 972, 1119),
  volcano_lavalake: crop(180, 107, 907, 1013),
  volcano_magmavent: crop(154, 81, 947, 1089),
  volcano_obsidianfield: crop(109, 70, 1037, 1115),
  wasteland: crop(105, 23, 1048, 1205),
  wasteland_corrupted: crop(123, 27, 1010, 1193)
};

const BIOME_TILES = [
  "actic_frozenlake",
  "arctic",
  "arctic_aurorasnowfield",
  "arctic_crackedice",
  "arctic_glacierfield",
  "arctic_rockytundra",
  "arctic_snowplain",
  "arctic_snowypineedge",
  "ashland",
  "badlands",
  "cave_underdark",
  "coast_beach",
  "coast_rocky",
  "crystalfield",
  "desert",
  "desert_canyon",
  "desert_crackeddry",
  "desert_oasis",
  "desert_red",
  "desert_rocky",
  "desert_saltflat",
  "desert_sanddune",
  "forest_ancient",
  "forest_autuum",
  "forest_birch",
  "forest_burnt",
  "forest_dark",
  "forest_darkmagical",
  "forest_dead",
  "forest_densepine",
  "forest_fey",
  "forest_jungle",
  "forest_light",
  "forest_mixed",
  "forest_normal",
  "grassland",
  "grassland_flowermeadow",
  "grassland_hills",
  "grassland_lushplain",
  "grassland_openmeadow",
  "grassland_rocky",
  "grassland_rolllinghills",
  "grassland_windsweptsteppe",
  "highlands",
  "hills",
  "jungle",
  "jungle_dense",
  "jungle_giantleaves",
  "jungle_hill",
  "jungle_mangrove",
  "jungle_stoneovergrown",
  "jungle_vine",
  "jungle_wet",
  "mountain",
  "mountain_canyon",
  "mountain_cliffplateau",
  "mountain_crystal",
  "mountain_greenhighland",
  "mountain_rocky",
  "mountain_snowy",
  "mountain_volcanic",
  "ocean",
  "ocean_coralreef",
  "ocean_darkabyssal",
  "ocean_deep",
  "ocean_icesea",
  "ocean_kelpforest",
  "ocean_shallow",
  "ocean_stormy",
  "savanna_drygrassland",
  "swamp",
  "swamp_blackwater",
  "swamp_bog",
  "swamp_deadtreebog",
  "swamp_flooded",
  "swamp_misty",
  "swamp_muddymarsh",
  "swamp_mushroom",
  "swamp_reedmarsh",
  "swamp_toxic",
  "volcanic_sulfurwasteland",
  "volcano",
  "volcano_ashplain",
  "volcano_basaltfield",
  "volcano_lavacracks",
  "volcano_lavalake",
  "volcano_magmavent",
  "volcano_obsidianfield",
  "wasteland",
  "wasteland_corrupted"
];
const MIDDLE_TILES = [
  "lake_1",
  "lake_2",
  "lake_3",
  "lake_4",
  "lake_5",
  "lake_6"
];
const STRUCTURE_TILES = [
  "abyssalrift",
  "alchemist",
  "ancientarena",
  "bandit hideout",
  "banditcamp",
  "bridge_NEtoSW",
  "bridge_NtoS",
  "bridge_NWtoSE",
  "bridge_WtoE",
  "burrow_beastden",
  "burrow_chimeranest",
  "burrow_dragon",
  "burrow_forest",
  "burrow_giantnest",
  "burrow_hydraswamp",
  "burrow_manticorecliffs",
  "burrow_spiders",
  "burrow_trollbridge",
  "burrow_wyvernpeak",
  "camp_border",
  "camp_caravan",
  "camp_fishing",
  "camp_goblin",
  "camp_hunting",
  "camp_lumber",
  "camp_market",
  "camp_nomad",
  "camp_pallisade",
  "camp_quarry",
  "camp_siege",
  "castle",
  "castle_coastal",
  "castle_knightly",
  "castle_mountain",
  "castle_square",
  "city_capital",
  "city_harbor",
  "city_large",
  "cursedtree",
  "demon scar",
  "demonscar",
  "elementalrift",
  "entrance_cave",
  "entrance_coalmine",
  "entrance_crypt",
  "entrance_crystalmine",
  "entrance_deserttemple",
  "entrance_goldmine",
  "entrance_icecave",
  "entrance_ironmine",
  "entrance_jungletemple",
  "entrance_mine",
  "entrance_saltmine",
  "entrance_volcanocave",
  "farm",
  "farm_watermill",
  "farm_windmill",
  "giantskeleton",
  "harbor",
  "hauntedbattlefield",
  "hellsportal",
  "herbgarden",
  "magic_obeslik",
  "magic_portal",
  "monsterbones",
  "oldbattlefield",
  "portal",
  "reef_kraken",
  "ruins_arctic",
  "ruins_battlefield",
  "ruins_buriedcity",
  "ruins_collapsedgate",
  "ruins_desert",
  "ruins_gate",
  "ruins_jungle",
  "ruins_overgrwon",
  "ruins_small",
  "ruins_stairway",
  "ruins_sunken",
  "ruins_swamp",
  "ruins_temple",
  "ruins_volcanic",
  "shrine_air",
  "shrine_crystal",
  "shrine_druidcircle",
  "shrine_earth",
  "shrine_fire",
  "shrine_forest",
  "shrine_necro",
  "shrine_small",
  "shrine_standingstones",
  "shrine_water",
  "sirenrocks",
  "swamp_sinkhole",
  "temple_desert",
  "temple_moon",
  "temple_shattered",
  "temple_sun",
  "tower_broken",
  "undead graveyard",
  "village",
  "village_arctic",
  "village_desert",
  "village_farming",
  "village_fishing",
  "village_forest",
  "village_forge",
  "village_fortified",
  "village_hamlet",
  "village_jungle",
  "village_mountain",
  "village_ruins",
  "village_swamp",
  "vineyard",
  "watchtower",
  "wizardtower"
];
const STRUCTURE_RIM_COLORS = {
  abyssalrift: "#9b6cff",
  alchemist: "#7dd6ff",
  banditcamp: "#d66a45",
  ancientarena: "#d9b577",
  cursedtree: "#7bb05f",
  demon: "#ff654d",
  elementalrift: "#80d8ff",
  giantskeleton: "#d8d1bd",
  hauntedbattlefield: "#b4a8a0",
  hellsportal: "#ff5b3e",
  monsterbones: "#d8d1bd",
  oldbattlefield: "#b4a8a0",
  reef: "#55c7df",
  tower: "#f5d98b",
  undead: "#9fc28b",
  bridge: "#c8a56a",
  burrow: "#b47a4d",
  camp: "#e08f4f",
  castle: "#f0d56a",
  city: "#ffbf5a",
  entrance: "#b7b0a1",
  farm: "#92d45a",
  harbor: "#55c7df",
  herbgarden: "#67d66f",
  magic: "#b276ff",
  mine: "#d9c16c",
  portal: "#bd78ff",
  ruins: "#a7a091",
  shrine: "#75d8c7",
  swamp: "#69b56b",
  temple: "#f0c777",
  village: "#ff9e55",
  vineyard: "#b7d66a",
  watchtower: "#f5d98b",
  wizardtower: "#8fb7ff"
};
const STRUCTURE_RIM_FALLBACK = "#f0c766";
const MIDDLE_TILE_SIZE = 190;
const RIVER_END_WIDTH = 4;
const RIVER_SAMPLE_STEP = 9;
const ROAD_SAMPLE_STEP = 12;
const PATH_SAMPLE_STEP = 10;
const PATH_CLOSE_DISTANCE = 26;
const MAX_GENERATED_PATCH_SIZE = 8;
const MAX_SPECIAL_PATCH_SIZE = 4;
const FANTASY_SPECIAL_BIOMES = new Set(["ashland", "badlands", "cave", "crystalfield", "volcano", "wasteland"]);
const EXCLUDED_GENERATED_BIOME_GROUPS = new Set(["coast"]);
const MIN_EXPORT_HEX_HEIGHT = 4;
const MAX_EXPORT_SIDE = 8192;
const MAX_EXPORT_PIXELS = 50000000;
const PATH_ASSETS = {
  coastalbeach: { label: "Coastal Beach", file: "coastalbeach.png", width: 42, smoothing: 0.45, color: "#d5ad6c", edge: "#775935", cap: "round", join: "round", textureMode: "tile", textureScale: 180 },
  coastalcliff: { label: "Coastal Cliff", file: "coastalcliff.png", width: 48, smoothing: 0.3, color: "#6d675b", edge: "#37342e", cap: "round", join: "round", textureMode: "tile", textureScale: 180 },
  dirtroad: { label: "Dirt Road", file: "dirtroad.png", width: 24, smoothing: 0.45, color: "#b1844d", edge: "#6f4c2b", cap: "round", join: "round", textureMode: "tile", textureScale: 160 },
  cobbleroad: { label: "Cobble Road", file: "cobbleroad.png", width: 28, smoothing: 0.35, color: "#9f9a8f", edge: "#625e57", cap: "round", join: "round", textureMode: "tile", textureScale: 150 },
  gravelroad: { label: "Gravel Road", file: "gravelroad.png", width: 22, smoothing: 0.25, color: "#9b8d78", edge: "#5d5448", cap: "round", join: "round", textureMode: "tile", textureScale: 130 },
  riverseam: { label: "River Seam", file: "riverseam.png", width: 22, smoothing: 0.55, color: "#2689b7", edge: "#125c78", cap: "round", join: "round", textureMode: "tile", textureScale: 180 }
};
const GROUP_OVERRIDES = {
  actic_frozenlake: "arctic",
  cave_underdark: "cave",
  coast_beach: "coast",
  coast_rocky: "coast",
  forest_dark: "forest",
  forest_dead: "forest",
  forest_fey: "forest",
  forest_jungle: "forest",
  forest_mixed: "forest",
  forest_normal: "forest",
  swamp_bog: "swamp",
  swamp_mushroom: "swamp",
  volcanic_sulfurwasteland: "volcano"
};
const GROUP_REPRESENTATIVES = {
  cave: "cave_underdark",
  coast: "coast_beach",
  forest: "forest_normal"
};
const BIOME_CLIMATE_GROUPS = {
  arctic: climate(0.06, 0.58),
  ashland: climate(0.82, 0.2),
  badlands: climate(0.72, 0.18),
  cave: climate(0.42, 0.54),
  coast: climate(0.58, 0.78),
  crystalfield: climate(0.36, 0.42),
  desert: climate(0.9, 0.08),
  forest: climate(0.5, 0.68),
  grassland: climate(0.55, 0.45),
  highlands: climate(0.38, 0.45),
  hills: climate(0.48, 0.42),
  jungle: climate(0.82, 0.9),
  mountain: climate(0.25, 0.48),
  ocean: climate(0.5, 1),
  savanna: climate(0.78, 0.24),
  swamp: climate(0.66, 0.96),
  volcano: climate(0.98, 0.14),
  wasteland: climate(0.62, 0.16)
};
const BIOME_CLIMATE_OVERRIDES = {
  actic_frozenlake: climate(0.01, 0.82),
  arctic_aurorasnowfield: climate(0.02, 0.62),
  arctic_crackedice: climate(0.03, 0.72),
  arctic_glacierfield: climate(0.01, 0.78),
  arctic_rockytundra: climate(0.12, 0.36),
  arctic_snowplain: climate(0.04, 0.48),
  arctic_snowypineedge: climate(0.09, 0.54),
  ashland: climate(0.84, 0.16),
  badlands: climate(0.74, 0.2),
  coast_beach: climate(0.62, 0.74),
  coast_rocky: climate(0.5, 0.76),
  desert_oasis: climate(0.86, 0.42),
  desert_red: climate(0.94, 0.1),
  desert_saltflat: climate(0.9, 0.02),
  desert_sanddune: climate(0.93, 0.06),
  forest_dark: climate(0.44, 0.72),
  forest_darkmagical: climate(0.4, 0.76),
  forest_dead: climate(0.5, 0.28),
  forest_fey: climate(0.54, 0.78),
  forest_jungle: climate(0.76, 0.86),
  forest_normal: climate(0.5, 0.65),
  grassland_flowermeadow: climate(0.55, 0.58),
  grassland_hills: climate(0.5, 0.46),
  grassland_lushplain: climate(0.56, 0.6),
  grassland_openmeadow: climate(0.56, 0.4),
  grassland_rocky: climate(0.48, 0.34),
  grassland_windsweptsteppe: climate(0.46, 0.28),
  jungle_dense: climate(0.83, 0.94),
  jungle_mangrove: climate(0.8, 0.98),
  jungle_wet: climate(0.78, 0.96),
  mountain_snowy: climate(0.12, 0.52),
  mountain_volcanic: climate(0.72, 0.2),
  ocean_darkabyssal: climate(0.38, 1),
  ocean_deep: climate(0.42, 1),
  ocean_shallow: climate(0.6, 0.98),
  ocean_stormy: climate(0.48, 1),
  savanna_drygrassland: climate(0.78, 0.22),
  swamp_blackwater: climate(0.62, 1),
  swamp_bog: climate(0.58, 0.98),
  swamp_deadtreebog: climate(0.56, 0.9),
  swamp_flooded: climate(0.68, 1),
  swamp_misty: climate(0.55, 0.96),
  swamp_muddymarsh: climate(0.7, 0.94),
  swamp_mushroom: climate(0.6, 0.92),
  swamp_reedmarsh: climate(0.68, 0.96),
  swamp_toxic: climate(0.74, 0.9),
  volcano: climate(1, 0.1),
  volcano_lavacracks: climate(0.98, 0.08),
  volcano_lavalake: climate(1, 0.18),
  volcano_magmavent: climate(0.98, 0.12),
  volcano_obsidianfield: climate(0.86, 0.14),
  wasteland_corrupted: climate(0.58, 0.22)
};
const BIOME_GROUPS = buildBiomeGroups();
const STRUCTURE_GROUPS = buildStructureGroups();
const SIDE_OVERLAP = 0;
const ROW_OVERLAP = 0;
const STEP_X = HEX_WIDTH - SIDE_OVERLAP;
const ROW_OFFSET = STEP_X * 0.5;
const STEP_Y = HEX_HEIGHT * 0.75 - ROW_OVERLAP;

const canvas = document.querySelector("#worldCanvas");
let ctx = canvas.getContext("2d");
const structureRimCache = new Map();
const palette = document.querySelector("#tilePalette");
const middlePalette = document.querySelector("#middlePalette");
const structurePalette = document.querySelector("#structurePalette");
const pathPalette = document.querySelector("#pathPalette");
const statusText = document.querySelector("#statusText");
const mapMeta = document.querySelector("#mapMeta");
const widthInput = document.querySelector("#mapWidth");
const heightInput = document.querySelector("#mapHeight");
const zoomControl = document.querySelector("#zoomControl");
const exportHexHeightInput = document.querySelector("#exportHexHeight");
const middleScaleControl = document.querySelector("#middleScale");
const middleRotationControl = document.querySelector("#middleRotation");
const riverWidthControl = document.querySelector("#riverWidth");
const roadWidthControl = document.querySelector("#roadWidth");
const pathWidthControl = document.querySelector("#pathWidth");
const pathSmoothingControl = document.querySelector("#pathSmoothing");
const singleMapModeButton = document.querySelector("#singleMapMode");
const bigMapModeButton = document.querySelector("#bigMapMode");
const bigMapControls = document.querySelector("#bigMapControls");
const chunkXInput = document.querySelector("#chunkX");
const chunkYInput = document.querySelector("#chunkY");
const chunkGrid = document.querySelector("#chunkGrid");
const worldExportHexHeightInput = document.querySelector("#worldExportHexHeight");

const state = {
  width: DEFAULT_WIDTH,
  height: DEFAULT_HEIGHT,
  activeLayer: "biome",
  selectedGroup: "grassland",
  selectedTile: "grassland",
  selectedMiddleTile: "lake_1",
  selectedStructureGroup: "village",
  selectedStructureTile: "village",
  middlePlacementScale: 1,
  middlePlacementRotation: 0,
  structurePlacementScale: 1,
  structurePlacementRotation: 0,
  selectedMiddleObjectId: null,
  selectedRiverId: null,
  selectedRoadId: null,
  selectedPathId: null,
  selectedPathPointIndex: null,
  selectedPathAsset: "dirtroad",
  selectedRoadType: "dirt",
  tool: "paint",
  grid: [],
  images: new Map(),
  middleImages: new Map(),
  structureImages: new Map(),
  pathImages: new Map(),
  middleObjects: [],
  structureObjects: [],
  rivers: [],
  roads: [],
  paths: [],
  climateGrid: [],
  nextMiddleObjectId: 1,
  nextStructureObjectId: 1,
  nextRiverId: 1,
  nextRoadId: 1,
  nextPathId: 1,
  riverDraft: null,
  roadDraft: null,
  pathDraft: null,
  view: { x: 0, y: 0, zoom: 1 },
  cursorScreen: null,
  cursorWorld: null,
  hover: null,
  hoverMiddleObjectId: null,
  hoverRiverId: null,
  hoverRoadId: null,
  hoverPathId: null,
  hoverPathPointIndex: null,
  painting: false,
  draggingMiddleObject: false,
  draggingRiver: false,
  draggingRoad: false,
  draggingPath: false,
  draggingPathPoint: false,
  middleDragOffset: p(0, 0),
  riverDragLast: p(0, 0),
  roadDragLast: p(0, 0),
  pathDragLast: p(0, 0),
  panning: false,
  lastPointer: { x: 0, y: 0 },
  generatorMode: "single",
  worldProject: createWorldProject()
};

async function boot() {
  buildPalette();
  buildMiddlePalette();
  buildStructurePalette();
  buildPathPalette();
  buildChunkGrid();
  bindUi();
  updateToolState();
  await loadImages();
  createMap(DEFAULT_WIDTH, DEFAULT_HEIGHT, "grassland");
  resizeCanvas();
  centerMap();
  render();
}

function buildPalette() {
  palette.innerHTML = "";
  for (const group of Object.values(BIOME_GROUPS)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile-choice";
    button.dataset.group = group.name;
    button.innerHTML = `
      <img src="${TILE_BASE}${group.current}.png" alt="">
      <span>${formatTileName(group.name)}</span>
    `;
    button.addEventListener("click", () => {
      selectGroup(group.name);
      state.activeLayer = "biome";
      state.tool = "paint";
      updateToolState();
      setStatus(`Painting ${formatTileName(state.selectedTile)}.`);
    });
    palette.append(button);
  }
}

function buildMiddlePalette() {
  middlePalette.innerHTML = "";
  for (const tile of MIDDLE_TILES) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile-choice middle-choice";
    button.dataset.middleTile = tile;
    button.innerHTML = `
      <img src="${MIDDLE_TILE_BASE}${tile}.png" alt="">
      <span>${formatTileName(tile)}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedMiddleTile = tile;
      state.activeLayer = "middle";
      state.tool = "paint";
      state.selectedMiddleObjectId = null;
      updateToolState();
      setStatus(`Placing ${formatTileName(tile)} freely on the water layer.`);
      render();
    });
    middlePalette.append(button);
  }
}

function buildStructurePalette() {
  structurePalette.innerHTML = "";
  for (const group of Object.values(STRUCTURE_GROUPS)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile-choice middle-choice structure-choice";
    button.dataset.structureGroup = group.name;
    button.innerHTML = `
      <img src="${MIDDLE_TILE_BASE}${group.current}.png" alt="">
      <span>${formatTileName(group.name)}</span>
    `;
    button.addEventListener("click", () => {
      selectStructureGroup(group.name);
      state.activeLayer = "structures";
      state.tool = "paint";
      state.selectedMiddleObjectId = null;
      updateToolState();
      setStatus(`Placing ${formatTileName(state.selectedStructureTile)} freely on the structures layer.`);
      render();
    });
    structurePalette.append(button);
  }
}

function buildPathPalette() {
  pathPalette.innerHTML = "";
  for (const [assetId, asset] of Object.entries(PATH_ASSETS)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile-choice path-choice";
    button.dataset.pathAsset = assetId;
    button.innerHTML = `
      <img src="${PATH_TILE_BASE}${asset.file}" alt="">
      <span>${asset.label}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedPathAsset = assetId;
      state.activeLayer = "paths";
      state.tool = "path";
      state.pathDraft = null;
      state.selectedPathId = null;
      pathWidthControl.value = String(asset.width);
      pathSmoothingControl.value = String(asset.smoothing);
      updateToolState();
      setStatus(`${asset.label} path: left-click points, right-click or Enter to finish.`);
      render();
    });
    pathPalette.append(button);
  }
}

function buildChunkGrid() {
  if (!chunkGrid) {
    return;
  }
  chunkGrid.innerHTML = "";
  const { currentX, currentY, chunks } = state.worldProject;
  for (let y = currentY - 1; y <= currentY + 1; y += 1) {
    for (let x = currentX - 1; x <= currentX + 1; x += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "chunk-cell";
      button.classList.toggle("is-current", x === currentX && y === currentY);
      button.classList.toggle("has-map", Boolean(chunks[chunkKey(x, y)]));
      button.textContent = `${x}, ${y}`;
      button.addEventListener("click", () => setCurrentChunk(x, y));
      chunkGrid.append(button);
    }
  }
}

function setGeneratorMode(mode) {
  if (state.generatorMode !== mode && state.generatorMode === "big") {
    saveCurrentChunk();
  }
  state.generatorMode = mode;
  singleMapModeButton.classList.toggle("is-active", mode === "single");
  bigMapModeButton.classList.toggle("is-active", mode === "big");
  bigMapControls.classList.toggle("is-hidden", mode !== "big");
  setStatus(mode === "big" ? "Big Map mode: select or generate same-sized chunks in a project grid." : "Single Map mode: generate the current map as one standalone map.");
  buildChunkGrid();
}

function setCurrentChunk(x, y) {
  saveCurrentChunk();
  state.worldProject.currentX = x;
  state.worldProject.currentY = y;
  chunkXInput.value = String(x);
  chunkYInput.value = String(y);
  const chunk = state.worldProject.chunks[chunkKey(x, y)];
  if (chunk) {
    restoreChunk(chunk);
    setStatus(`Loaded saved chunk ${x}, ${y}.`);
  } else {
    createMap(state.worldProject.chunkWidth, state.worldProject.chunkHeight, null);
    state.middleObjects = [];
    state.rivers = [];
    state.roads = [];
    state.paths = [];
    state.climateGrid = [];
    setStatus(`Selected empty chunk ${x}, ${y}. Generate it to fit the big-map climate.`);
  }
  buildChunkGrid();
  centerMap();
  render();
}

function bindUi() {
  document.querySelectorAll(".layer-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeLayer = button.dataset.layer;
      if (state.activeLayer === "paths") {
        state.tool = "path";
      }
      state.painting = false;
      state.draggingMiddleObject = false;
      state.draggingRiver = false;
      state.draggingRoad = false;
      state.draggingPath = false;
      state.draggingPathPoint = false;
      state.hover = null;
      state.hoverMiddleObjectId = null;
      state.hoverRiverId = null;
      state.hoverRoadId = null;
      state.hoverPathId = null;
      state.hoverPathPointIndex = null;
      updateToolState();
      setStatus(layerStatus());
      render();
    });
  });

  document.querySelector("#resizeMap").addEventListener("click", () => {
    const width = clamp(Number(widthInput.value), 1, 40);
    const height = clamp(Number(heightInput.value), 1, 40);
    createMap(width, height, state.selectedTile);
    if (state.generatorMode === "big") {
      state.worldProject.chunkWidth = width;
      state.worldProject.chunkHeight = height;
      state.worldProject.chunks = {};
      buildChunkGrid();
      setStatus("Changed big-map chunk size and cleared saved chunks so the project stays consistent.");
    }
    centerMap();
    render();
  });

  document.querySelectorAll(".tool").forEach((button) => {
    button.addEventListener("click", () => {
      state.tool = button.dataset.tool;
      updateToolState();
      setStatus(state.tool === "erase" ? "Erasing biome tiles." : `Painting ${formatTileName(state.selectedTile)}.`);
    });
  });

  document.querySelector("#clearMap").addEventListener("click", () => {
    forEachCell((cell) => {
      cell.tile = null;
    });
    setStatus("Cleared the biome layer.");
    render();
  });
  document.querySelector("#generateBiomes").addEventListener("click", () => {
    if (state.generatorMode === "big") {
      generateCurrentChunk();
    } else {
      generateClimateBiomes();
    }
    state.activeLayer = "biome";
    state.tool = "paint";
    updateToolState();
    setStatus("Generated climate biomes, lakes, rivers, mountain chains, and starter structures.");
    render();
  });
  singleMapModeButton.addEventListener("click", () => setGeneratorMode("single"));
  bigMapModeButton.addEventListener("click", () => setGeneratorMode("big"));
  document.querySelector("#generateChunk").addEventListener("click", () => {
    generateCurrentChunk();
    setStatus(`Generated big-map chunk ${state.worldProject.currentX}, ${state.worldProject.currentY}.`);
    render();
  });
  document.querySelector("#saveChunk").addEventListener("click", () => {
    saveCurrentChunk();
    setStatus(`Saved chunk ${state.worldProject.currentX}, ${state.worldProject.currentY} into the big-map project.`);
    buildChunkGrid();
  });
  document.querySelector("#exportWorldPng").addEventListener("click", () => exportWorldImage("png"));
  document.querySelector("#exportWorldJpg").addEventListener("click", () => exportWorldImage("jpg"));
  chunkXInput.addEventListener("change", () => setCurrentChunk(Number(chunkXInput.value) || 0, state.worldProject.currentY));
  chunkYInput.addEventListener("change", () => setCurrentChunk(state.worldProject.currentX, Number(chunkYInput.value) || 0));

  document.querySelector("#centerMap").addEventListener("click", () => {
    centerMap();
    render();
  });

  document.querySelector("#exportMap").addEventListener("click", exportMap);
  document.querySelector("#importMap").addEventListener("change", importMap);
  document.querySelector("#exportPng").addEventListener("click", () => exportImage("png"));
  document.querySelector("#exportJpg").addEventListener("click", () => exportImage("jpg"));
  document.querySelector("#riverTool").addEventListener("click", () => {
    state.activeLayer = "middle";
    state.tool = "river";
    state.selectedMiddleObjectId = null;
    state.selectedRiverId = null;
    state.selectedRoadId = null;
    state.selectedPathId = null;
    state.selectedPathPointIndex = null;
    state.riverDraft = null;
    state.roadDraft = null;
    state.pathDraft = null;
    updateToolState();
    setStatus("River tool: left-click the wide mouth points, right-click the tiny source end.");
    render();
  });

  document.querySelectorAll(".road-tool").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeLayer = "middle";
      state.tool = "road";
      state.selectedRoadType = button.dataset.roadType;
      state.selectedMiddleObjectId = null;
      state.selectedRiverId = null;
      state.selectedRoadId = null;
      state.selectedPathId = null;
      state.selectedPathPointIndex = null;
      state.riverDraft = null;
      state.roadDraft = null;
      state.pathDraft = null;
      updateToolState();
      setStatus(`${formatTileName(state.selectedRoadType)} road tool: left-click path points, right-click to finish.`);
      render();
    });
  });

  pathWidthControl.addEventListener("input", () => {
    const width = Number(pathWidthControl.value);
    const path = selectedPath();
    if (state.pathDraft) {
      state.pathDraft.width = width;
      render();
    } else if (path) {
      path.width = width;
      path.updatedAt = Date.now();
      render();
    }
    setStatus(`Path width ${pathWidthControl.value}px.`);
  });

  pathSmoothingControl.addEventListener("input", () => {
    const smoothing = Number(pathSmoothingControl.value);
    const path = selectedPath();
    if (state.pathDraft) {
      state.pathDraft.smoothing = smoothing;
      render();
    } else if (path) {
      path.smoothing = smoothing;
      path.updatedAt = Date.now();
      render();
    }
    setStatus(`Path smoothing ${Number(pathSmoothingControl.value).toFixed(2)}.`);
  });

  document.querySelector("#togglePathClosed").addEventListener("click", () => {
    const path = selectedPath();
    if (state.pathDraft) {
      state.pathDraft.closed = !state.pathDraft.closed;
      setStatus(state.pathDraft.closed ? "Draft path will close as a loop." : "Draft path is open.");
    } else if (path) {
      path.closed = !path.closed;
      path.updatedAt = Date.now();
      setStatus(path.closed ? "Path closed into a loop." : "Path opened.");
    }
    updateToolState();
    render();
  });

  riverWidthControl.addEventListener("input", () => {
    if (state.riverDraft) {
      state.riverDraft.startWidth = Number(riverWidthControl.value);
      render();
    }
    setStatus(`River mouth width ${riverWidthControl.value}px.`);
  });

  roadWidthControl.addEventListener("input", () => {
    if (state.roadDraft) {
      state.roadDraft.width = Number(roadWidthControl.value);
      render();
    }
    setStatus(`Road width ${roadWidthControl.value}px.`);
  });

  middleScaleControl.addEventListener("input", () => {
    const object = selectedMiddleObject();
    if (!object) {
      if (state.tool === "paint" && (state.activeLayer === "middle" || state.activeLayer === "structures")) {
        setPlacementScale(Number(middleScaleControl.value));
        setStatus(`Next ${state.activeLayer === "structures" ? "structure" : "water piece"} size ${getPlacementScale().toFixed(2)}.`);
        render();
      }
      return;
    }
    object.scale = Number(middleScaleControl.value);
    setStatus(`${formatTileName(object.tile)} size ${object.scale.toFixed(2)}.`);
    render();
  });

  middleRotationControl.addEventListener("input", () => {
    const object = selectedMiddleObject();
    if (!object) {
      if (state.tool === "paint" && (state.activeLayer === "middle" || state.activeLayer === "structures")) {
        setPlacementRotation(degreesToRadians(Number(middleRotationControl.value) || 0));
        setStatus(`Next ${state.activeLayer === "structures" ? "structure" : "water piece"} rotation ${Math.round(radiansToDegrees(getPlacementRotation()))} degrees.`);
        render();
      }
      return;
    }
    object.rotation = degreesToRadians(Number(middleRotationControl.value));
    setStatus(`${formatTileName(object.tile)} rotation ${Math.round(radiansToDegrees(object.rotation))} degrees.`);
    render();
  });

  document.querySelector("#rotateLeft").addEventListener("click", () => rotateSelectedMiddleObject(-15));
  document.querySelector("#rotateRight").addEventListener("click", () => rotateSelectedMiddleObject(15));

  zoomControl.addEventListener("input", () => {
    const oldZoom = state.view.zoom;
    state.view.zoom = Number(zoomControl.value);
    zoomAround(canvas.width / 2, canvas.height / 2, oldZoom, state.view.zoom);
    render();
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    render();
  });
  window.addEventListener("keydown", (event) => {
    if (state.activeLayer === "paths") {
      handlePathKey(event);
      return;
    }
    if (event.key !== "Delete" && event.key !== "Backspace") {
      return;
    }
    if (state.activeLayer !== "middle" && state.activeLayer !== "structures") {
      return;
    }
    if (state.selectedRiverId) {
      deleteRiver(state.selectedRiverId);
      setStatus("Removed selected river.");
      render();
      return;
    }
    if (state.selectedRoadId) {
      deleteRoad(state.selectedRoadId);
      setStatus("Removed selected road.");
      render();
      return;
    }
    if (state.selectedMiddleObjectId) {
      const object = selectedMiddleObject();
      deleteMiddleObject(state.selectedMiddleObjectId);
      setStatus(`Removed ${object ? formatTileName(object.tile) : "water piece"}.`);
      render();
    }
  });

  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointermove", pointerMove);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointerleave", pointerUp);
  canvas.addEventListener("wheel", wheelVariants, { passive: false });
}

function loadImages() {
  const biomeSources = BIOME_TILES.map((tile) => `${TILE_BASE}${tile}.png`);
  const middleSources = MIDDLE_TILES.map((tile) => `${MIDDLE_TILE_BASE}${tile}.png`);
  const structureSources = STRUCTURE_TILES.map((tile) => `${MIDDLE_TILE_BASE}${tile}.png`);
  const pathSources = Object.values(PATH_ASSETS).map((asset) => `${PATH_TILE_BASE}${asset.file}`);
  return Promise.all([
    Promise.all(biomeSources.map(loadImage)),
    Promise.all(middleSources.map(loadImage)),
    Promise.all(structureSources.map(loadImage)),
    Promise.all(pathSources.map(loadImage))
  ]).then(([biomeImages, middleImages, structureImages, pathImages]) => {
    for (const image of biomeImages) {
      state.images.set(image.name, image.element);
    }
    for (const image of middleImages) {
      state.middleImages.set(image.name, image.element);
    }
    for (const image of structureImages) {
      state.structureImages.set(image.name, image.element);
    }
    for (const image of pathImages) {
      state.pathImages.set(image.name, image.element);
    }
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const name = src.split("/").pop().replace(".png", "");
      resolve({ name, element: image });
    };
    image.onerror = reject;
    image.src = src;
  });
}

function createMap(width, height, fillTile) {
  state.width = width;
  state.height = height;
  state.grid = Array.from({ length: height }, (_, row) =>
    Array.from({ length: width }, (_, col) => ({
      row,
      col,
      tile: fillTile
    }))
  );
  state.climateGrid = [];
  widthInput.value = width;
  heightInput.value = height;
  mapMeta.textContent = `${width} x ${height} biome layer`;
}

function generateClimateBiomes(climateGrid = generateClimateGrid(state.width, state.height)) {
  clearGeneratedWorldDetails();
  const elevationGrid = generateElevationGrid();
  const chosenGroups = Array.from({ length: state.height }, () => Array.from({ length: state.width }, () => null));
  const chosenTiles = Array.from({ length: state.height }, () => Array.from({ length: state.width }, () => null));
  for (let row = 0; row < state.height; row += 1) {
    for (let col = 0; col < state.width; col += 1) {
      const target = climateGrid[row][col];
      const forcedOcean = oceanDecisionForLocalCell(row, col) === true;
      const terrainGroup = terrainGroupFromElevation(elevationGrid[row][col], row, col, target);
      const group = (forcedOcean || (canGenerateOceanAt(row, col, target) && Math.random() < 0.82))
        ? BIOME_GROUPS.ocean
        : terrainGroup || chooseBiomeGroupForClimate(target, chosenGroups, row, col);
      chosenGroups[row][col] = group.name;
      const tile = chooseBiomeVariantForClimate(group, target, chosenTiles, row, col);
      chosenTiles[row][col] = tile;
      state.grid[row][col].tile = tile;
      const biomeGroup = BIOME_GROUPS[group.name];
      if (biomeGroup) {
        biomeGroup.current = tile;
      }
    }
  }
  state.climateGrid = climateGrid;
  normalizeGeneratedOceans();
  addGeneratedMountainChains();
  addGeneratedFoothills();
  capGeneratedSpecialBiomePatches();
  normalizeGeneratedOceans();
  addGeneratedOceanRims();
  const lakes = addGeneratedLakes();
  addGeneratedRivers(lakes);
  addGeneratedStructures(lakes);
  updateBiomePaletteFromMap();
}

function generateClimateGrid(width, height) {
  const temperature = randomGradientParams();
  const moisture = randomGradientParams();
  return Array.from({ length: height }, (_, row) =>
    Array.from({ length: width }, (_, col) => {
      const x = width > 1 ? col / (width - 1) : 0.5;
      const y = height > 1 ? row / (height - 1) : 0.5;
      return {
        temperature: climateFieldValue(x, y, temperature),
        moisture: climateFieldValue(x, y, moisture)
      };
    })
  );
}

function generateClimateGridForChunk(chunkX, chunkY) {
  const project = state.worldProject;
  return Array.from({ length: state.height }, (_, row) =>
    Array.from({ length: state.width }, (_, col) => {
      const worldCol = chunkX * state.width + col;
      const worldRow = chunkY * state.height + row;
      return {
        temperature: worldClimateFieldValue(worldCol, worldRow, project.temperature),
        moisture: worldClimateFieldValue(worldCol, worldRow, project.moisture)
      };
    })
  );
}

function worldClimateFieldValue(worldCol, worldRow, params) {
  const x = worldCol / params.scale;
  const y = worldRow / params.scale;
  const projected = x * Math.cos(params.angle) + y * Math.sin(params.angle);
  const broad = Math.sin(projected + params.phaseA) * 0.28;
  const detail =
    Math.sin(x * 1.7 + params.phaseB) * 0.12 +
    Math.cos(y * 1.35 - params.phaseA) * 0.1 +
    Math.sin((x + y) * 0.9 + params.phaseB) * 0.08;
  return clamp(params.center + broad + detail, 0, 1);
}

function generateElevationGrid() {
  return Array.from({ length: state.height }, (_, row) =>
    Array.from({ length: state.width }, (_, col) => {
      if (state.generatorMode === "big") {
        const worldCol = state.worldProject.currentX * state.width + col;
        const worldRow = state.worldProject.currentY * state.height + row;
        return worldElevationFieldValue(worldCol, worldRow);
      }
      const x = state.width > 1 ? col / (state.width - 1) : 0.5;
      const y = state.height > 1 ? row / (state.height - 1) : 0.5;
      return clamp(
        0.5 +
          Math.sin(x * Math.PI * 2.1 + y * Math.PI * 1.4 + state.climateGrid?.[row]?.[col]?.temperature * 2) * 0.22 +
          Math.cos(x * Math.PI * 1.1 - y * Math.PI * 2.3) * 0.16 +
          Math.sin((x - y) * Math.PI * 3.4) * 0.08,
        0,
        1
      );
    })
  );
}

function worldElevationFieldValue(worldCol, worldRow) {
  const project = state.worldProject;
  if (!project.elevation) {
    project.elevation = createWorldElevationParams();
  }
  const params = project.elevation;
  const x = worldCol / params.scale;
  const y = worldRow / params.scale;
  const along = x * Math.cos(params.ridgeAngle) + y * Math.sin(params.ridgeAngle);
  const across = -x * Math.sin(params.ridgeAngle) + y * Math.cos(params.ridgeAngle);
  const ridge =
    Math.abs(Math.sin(across * 1.38 + Math.sin(along * 0.62 + params.phaseA) * 0.9 + params.phaseB));
  const ridgeSharpness = Math.pow(1 - ridge, 2.8);
  const broad =
    Math.sin(along * 0.55 + params.phaseA) * 0.16 +
    Math.cos((x + y) * 0.42 + params.phaseB) * 0.12;
  const detail =
    Math.sin(x * 2.1 + params.phaseB) * 0.07 +
    Math.cos(y * 1.7 - params.phaseA) * 0.06;
  return clamp(0.34 + ridgeSharpness * 0.62 + broad + detail, 0, 1);
}

function terrainGroupFromElevation(elevation, row, col, target) {
  if (groupNameFor(state.grid?.[row]?.[col]?.tile) === "ocean") {
    return null;
  }
  if (elevation > 0.82) {
    return BIOME_GROUPS.mountain;
  }
  if (elevation > 0.72 && Math.random() < 0.72) {
    return BIOME_GROUPS.highlands;
  }
  if (elevation > 0.62 && Math.random() < 0.6) {
    return BIOME_GROUPS.hills;
  }
  if (elevation < 0.2 && target.moisture > 0.64 && Math.random() < 0.28) {
    return BIOME_GROUPS.swamp;
  }
  return null;
}

function generateCurrentChunk() {
  const { currentX, currentY } = state.worldProject;
  const climateGrid = generateClimateGridForChunk(currentX, currentY);
  generateClimateBiomes(climateGrid);
  reconcileCurrentChunkEdges();
  addGeneratedOceanRims();
  saveCurrentChunk();
  buildChunkGrid();
}

function reconcileCurrentChunkEdges() {
  const { currentX, currentY, chunks } = state.worldProject;
  const neighbors = [
    { dx: -1, dy: 0, side: "left" },
    { dx: 1, dy: 0, side: "right" },
    { dx: 0, dy: -1, side: "top" },
    { dx: 0, dy: 1, side: "bottom" }
  ];
  for (const neighbor of neighbors) {
    const chunk = chunks[chunkKey(currentX + neighbor.dx, currentY + neighbor.dy)];
    if (!chunk || !Array.isArray(chunk.tiles)) {
      continue;
    }
    reconcileEdgeWithNeighbor(chunk, neighbor.side);
  }
  capGeneratedBiomePatches();
  normalizeGeneratedOceans();
}

function reconcileEdgeWithNeighbor(chunk, side) {
  const limit = side === "left" || side === "right" ? state.height : state.width;
  for (let index = 0; index < limit; index += 1) {
    const local = edgeCellForSide(side, index, false);
    const remote = edgeCellForSide(side, index, true);
    const remoteTile = normalizeTileName(chunk.tiles?.[remote.row]?.[remote.col]);
    if (!remoteTile || !BIOME_TILES.includes(remoteTile)) {
      continue;
    }
    const remoteGroupName = groupNameFor(remoteTile);
    if (EXCLUDED_GENERATED_BIOME_GROUPS.has(remoteGroupName)) {
      continue;
    }
    if (remoteGroupName === "ocean" && !canGenerateOceanAt(local.row, local.col, state.climateGrid[local.row][local.col])) {
      continue;
    }
    const target = state.climateGrid[local.row][local.col];
    const remoteGroup = BIOME_GROUPS[remoteGroupName];
    const currentGroup = groupNameFor(state.grid[local.row][local.col].tile);
    if (!remoteGroup || currentGroup === remoteGroupName) {
      continue;
    }
    const remoteScore = biomeGroupClimateScore(remoteGroup, target) + biomePlacementPenalty(remoteGroupName, local.row, local.col);
    const currentScore = biomeGroupClimateScore(BIOME_GROUPS[currentGroup] || remoteGroup, target) + biomePlacementPenalty(currentGroup, local.row, local.col);
    if (remoteScore <= currentScore + 0.2) {
      state.grid[local.row][local.col].tile = chooseBiomeVariantForClimate(remoteGroup, target);
    }
  }
}

function edgeCellForSide(side, index, remote) {
  if (side === "left") return { row: index, col: remote ? state.width - 1 : 0 };
  if (side === "right") return { row: index, col: remote ? 0 : state.width - 1 };
  if (side === "top") return { row: remote ? state.height - 1 : 0, col: index };
  return { row: remote ? 0 : state.height - 1, col: index };
}

function randomGradientParams() {
  const cold = 0.03 + Math.random() * 0.22;
  const hot = 0.78 + Math.random() * 0.2;
  const angle = Math.random() * Math.PI * 2;
  const invert = Math.random() < 0.5;
  return {
    low: invert ? hot : cold,
    high: invert ? cold : hot,
    angle,
    phaseA: Math.random() * Math.PI * 2,
    phaseB: Math.random() * Math.PI * 2,
    wave: 0.05 + Math.random() * 0.07
  };
}

function climateFieldValue(x, y, params) {
  const centeredX = x * 2 - 1;
  const centeredY = y * 2 - 1;
  const projected = (centeredX * Math.cos(params.angle) + centeredY * Math.sin(params.angle) + 1) * 0.5;
  const wave =
    Math.sin(x * Math.PI * 2 + params.phaseA) * params.wave +
    Math.cos(y * Math.PI * 2 + params.phaseB) * params.wave * 0.65 +
    Math.sin((x + y) * Math.PI * 3 + params.phaseA * 0.7) * params.wave * 0.45;
  return clamp(lerp(params.low, params.high, projected) + wave, 0, 1);
}

function chooseBiomeGroupForClimate(target, chosenGroups, row, col) {
  const groups = Object.values(BIOME_GROUPS)
    .filter((group) => !EXCLUDED_GENERATED_BIOME_GROUPS.has(group.name))
    .filter((group) => group.name !== "ocean" || canGenerateOceanAt(row, col, target))
    .map((group) => ({
      group,
      score: biomeGroupClimateScore(group, target) + biomePlacementPenalty(group.name, row, col)
    }))
    .sort((a, b) => a.score - b.score);

  const neighbors = [
    chosenGroups[row]?.[col - 1],
    chosenGroups[row - 1]?.[col],
    chosenGroups[row - 1]?.[col + (row % 2 ? 1 : -1)]
  ].filter(Boolean);
  for (const neighborName of neighbors.sort(() => Math.random() - 0.5)) {
    const neighborGroup = BIOME_GROUPS[neighborName];
    if (!neighborGroup) {
      continue;
    }
    const score = biomeGroupClimateScore(neighborGroup, target);
    const inertia = FANTASY_SPECIAL_BIOMES.has(neighborName) ? 0.06 : 0.16;
    const chance = FANTASY_SPECIAL_BIOMES.has(neighborName) ? 0.42 : 0.76;
    if (score < groups[0].score + inertia && Math.random() < chance) {
      return neighborGroup;
    }
  }

  const top = groups.slice(0, Math.min(5, groups.length));
  return weightedClimateChoice(top).group;
}

function biomePlacementPenalty(groupName, row, col) {
  const edge = edgeCloseness(row, col);
  if (groupName === "ocean") {
    if (!canGenerateOceanAt(row, col, state.climateGrid?.[row]?.[col])) {
      return 999;
    }
    return state.generatorMode === "big" ? -0.04 : -0.22;
  }
  if (groupName === "coast") {
    return edge > 0.55 ? -0.03 : 0.16;
  }
  if (groupName === "crystalfield") return 0.62;
  if (groupName === "cave") return 0.3;
  if (groupName === "volcano") return 0.38;
  if (groupName === "ashland") return 0.18;
  if (groupName === "wasteland") return 0.14;
  if (groupName === "badlands") return 0.08;
  if (groupName === "mountain") {
    return state.generatorMode === "big" ? -0.03 : edge > 0.72 ? 0.06 : 0;
  }
  return 0;
}

function edgeCloseness(row, col) {
  const maxCol = Math.max(1, state.width - 1);
  const maxRow = Math.max(1, state.height - 1);
  const distance = Math.min(col, maxCol - col, row, maxRow - row);
  const maxDistance = Math.max(1, Math.min(maxCol, maxRow) * 0.5);
  return 1 - clamp(distance / maxDistance, 0, 1);
}

function chooseBiomeVariantForClimate(group, target, chosenTiles = null, row = null, col = null) {
  const neighborTiles = chosenTiles && row !== null
    ? [
        chosenTiles[row]?.[col - 1],
        chosenTiles[row - 1]?.[col],
        chosenTiles[row - 1]?.[col + (row % 2 ? 1 : -1)]
      ].filter((tile) => tile && groupNameFor(tile) === group.name)
    : [];
  if (neighborTiles.length && Math.random() < 0.68) {
    const tile = randomItem(neighborTiles);
    if (tile !== "coast_beach" && climateScore(getBiomeClimate(tile), target) < 0.36) {
      return tile;
    }
  }

  const options = group.variants
    .filter((tile) => tile !== "coast_beach")
    .map((tile) => ({ tile, score: climateScore(getBiomeClimate(tile), target) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, Math.min(5, group.variants.length));
  return weightedClimateChoice(options).tile;
}

function weightedClimateChoice(options) {
  const weights = options.map((option) => 1 / Math.max(0.015, option.score + 0.02));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;
  for (let index = 0; index < options.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) {
      return options[index];
    }
  }
  return options[0];
}

function biomeGroupClimateScore(group, target) {
  return Math.min(...group.variants.map((tile) => climateScore(getBiomeClimate(tile), target)));
}

function getBiomeClimate(tile) {
  return BIOME_CLIMATE_OVERRIDES[tile] || BIOME_CLIMATE_GROUPS[groupNameFor(tile)] || climate(0.5, 0.5);
}

function climateScore(source, target) {
  return Math.hypot((source.temperature - target.temperature) * 1.15, source.moisture - target.moisture);
}

function normalizeGeneratedOceans() {
  forEachCell((cell) => {
    if (groupNameFor(cell.tile) !== "ocean" || canGenerateOceanAt(cell.row, cell.col, state.climateGrid[cell.row][cell.col])) {
      return;
    }
    const target = state.climateGrid[cell.row][cell.col];
    const replacement = chooseAlternativeBiomeGroup(target, "ocean", cell.row, cell.col);
    cell.tile = chooseBiomeVariantForClimate(replacement, target);
  });
}

function canGenerateOceanAt(row, col, climateCell) {
  if (state.generatorMode !== "big") {
    return isOuterEdgeCell(row, col);
  }
  const decided = oceanDecisionForLocalCell(row, col);
  if (decided !== null) {
    return decided;
  }
  return isBigMapOceanCell(row, col, climateCell);
}

function isBigMapOceanCell(row, col, climateCell) {
  if (!climateCell) {
    return false;
  }
  const { currentX, currentY } = state.worldProject;
  const worldCol = currentX * state.width + col;
  const worldRow = currentY * state.height + row;
  return decideBigMapOceanAtWorld(worldRow, worldCol, false, climateCell);
}

function oceanDecisionForLocalCell(row, col) {
  if (state.generatorMode !== "big") {
    return null;
  }
  const { currentX, currentY } = state.worldProject;
  return getOceanDecision(currentY * state.height + row, currentX * state.width + col);
}

function getOceanDecision(worldRow, worldCol) {
  const value = state.worldProject?.oceanDecisions?.[worldCellKey(worldRow, worldCol)];
  return typeof value === "boolean" ? value : null;
}

function decideBigMapOceanAtWorld(worldRow, worldCol, persist = false, climateCell = null) {
  const existing = getOceanDecision(worldRow, worldCol);
  if (existing !== null) {
    return existing;
  }
  const climate = climateCell || climateForWorldCell(worldRow, worldCol);
  const sea = worldSeaFieldValue(worldCol, worldRow);
  const ocean = sea + climate.moisture * 0.18 > 0.54;
  if (persist) {
    state.worldProject.oceanDecisions[worldCellKey(worldRow, worldCol)] = ocean;
  }
  return ocean;
}

function climateForWorldCell(worldRow, worldCol) {
  const project = state.worldProject;
  return {
    temperature: worldClimateFieldValue(worldCol, worldRow, project.temperature),
    moisture: worldClimateFieldValue(worldCol, worldRow, project.moisture)
  };
}

function worldCellKey(worldRow, worldCol) {
  return `${worldRow},${worldCol}`;
}

function worldSeaFieldValue(worldCol, worldRow) {
  const project = state.worldProject;
  const x = worldCol / Math.max(6, project.moisture.scale * 0.75);
  const y = worldRow / Math.max(6, project.moisture.scale * 0.75);
  return clamp(
    0.5 +
    Math.sin(x * 0.95 + project.moisture.phaseA) * 0.22 +
    Math.cos(y * 0.8 + project.moisture.phaseB) * 0.18 +
    Math.sin((x + y) * 0.55 + project.temperature.phaseA) * 0.16,
    0,
    1
  );
}

function specialPatchLimit(groupName) {
  if (groupName === "ocean" && state.generatorMode === "big") {
    return Math.max(MAX_GENERATED_PATCH_SIZE, Math.round(state.width * state.height * 0.18));
  }
  if (["mountain", "hills", "highlands", "forest", "grassland", "desert", "jungle", "swamp"].includes(groupName)) {
    return Math.max(MAX_GENERATED_PATCH_SIZE, Math.round(state.width * state.height * 0.28));
  }
  return ["crystalfield", "cave", "volcano", "ocean"].includes(groupName) ? MAX_SPECIAL_PATCH_SIZE : MAX_GENERATED_PATCH_SIZE;
}

function clearGeneratedWorldDetails() {
  state.middleObjects = [];
  state.rivers = [];
  state.roads = [];
  state.selectedMiddleObjectId = null;
  state.selectedRiverId = null;
  state.selectedRoadId = null;
  state.nextMiddleObjectId = 1;
  state.nextRiverId = 1;
  state.nextRoadId = 1;
}

function capGeneratedBiomePatches() {
  for (let pass = 0; pass < 6; pass += 1) {
    let changed = false;
    const visited = Array.from({ length: state.height }, () => Array.from({ length: state.width }, () => false));
    for (let row = 0; row < state.height; row += 1) {
      for (let col = 0; col < state.width; col += 1) {
        if (visited[row][col]) {
          continue;
        }
        const patch = collectBiomePatch(row, col, visited);
        const groupName = groupNameFor(state.grid[row][col].tile);
        const maxPatchSize = specialPatchLimit(groupName);
        if (patch.length <= maxPatchSize) {
          continue;
        }
        const keep = new Set(patch.slice(0, maxPatchSize).map((cell) => `${cell.row},${cell.col}`));
        for (const cell of patch) {
          if (keep.has(`${cell.row},${cell.col}`)) {
            continue;
          }
          const currentGroup = groupNameFor(state.grid[cell.row][cell.col].tile);
          const target = state.climateGrid[cell.row][cell.col];
          const alternative = chooseAlternativeBiomeGroup(target, currentGroup, cell.row, cell.col);
          state.grid[cell.row][cell.col].tile = chooseBiomeVariantForClimate(alternative, target);
          changed = true;
        }
      }
    }
    if (!changed) {
      break;
    }
  }
}

function capGeneratedSpecialBiomePatches() {
  for (const groupName of FANTASY_SPECIAL_BIOMES) {
    capGeneratedBiomeGroupPatches(groupName, groupName === "crystalfield" || groupName === "volcano" ? 3 : 5);
  }
}

function capGeneratedBiomeGroupPatches(groupName, limit) {
  for (let pass = 0; pass < 4; pass += 1) {
    let changed = false;
    const visited = Array.from({ length: state.height }, () => Array.from({ length: state.width }, () => false));
    for (let row = 0; row < state.height; row += 1) {
      for (let col = 0; col < state.width; col += 1) {
        if (visited[row][col] || groupNameFor(state.grid[row][col].tile) !== groupName) {
          continue;
        }
        const patch = collectBiomePatch(row, col, visited);
        if (patch.length <= limit) {
          continue;
        }
        for (const cell of patch.slice(limit)) {
          const target = state.climateGrid[cell.row][cell.col];
          const alternative = chooseAlternativeBiomeGroup(target, groupName, cell.row, cell.col);
          state.grid[cell.row][cell.col].tile = chooseBiomeVariantForClimate(alternative, target);
          changed = true;
        }
      }
    }
    if (!changed) {
      break;
    }
  }
}

function collectBiomePatch(startRow, startCol, visited) {
  const group = groupNameFor(state.grid[startRow][startCol].tile);
  const queue = [{ row: startRow, col: startCol }];
  const patch = [];
  visited[startRow][startCol] = true;
  while (queue.length) {
    const cell = queue.shift();
    patch.push(cell);
    for (const neighbor of hexNeighbors(cell.row, cell.col)) {
      if (!inBounds(neighbor.row, neighbor.col) || visited[neighbor.row][neighbor.col]) {
        continue;
      }
      if (groupNameFor(state.grid[neighbor.row][neighbor.col].tile) !== group) {
        continue;
      }
      visited[neighbor.row][neighbor.col] = true;
      queue.push(neighbor);
    }
  }
  return patch;
}

function chooseAlternativeBiomeGroup(target, excludedGroupName, row, col) {
  const neighborGroups = new Set(hexNeighbors(row, col)
    .filter((neighbor) => inBounds(neighbor.row, neighbor.col))
    .map((neighbor) => groupNameFor(state.grid[neighbor.row][neighbor.col].tile)));
  let groups = Object.values(BIOME_GROUPS)
    .filter((group) => !EXCLUDED_GENERATED_BIOME_GROUPS.has(group.name))
    .filter((group) => group.name !== excludedGroupName && !neighborGroups.has(group.name));
  if (!groups.length) {
    groups = Object.values(BIOME_GROUPS)
      .filter((group) => !EXCLUDED_GENERATED_BIOME_GROUPS.has(group.name))
      .filter((group) => group.name !== excludedGroupName);
  }
  const scored = groups
    .map((group) => ({ group, score: biomeGroupClimateScore(group, target) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 6);
  return weightedClimateChoice(scored).group;
}

function addGeneratedMountainChains() {
  const chainCount = state.width * state.height >= 100 ? (state.generatorMode === "big" ? 3 : 2) : 1;
  for (let chainIndex = 0; chainIndex < chainCount; chainIndex += 1) {
    let current = randomBestCell((row, col) => {
      const climateHere = state.climateGrid[row][col];
      const elevation = state.generatorMode === "big"
        ? worldElevationFieldValue(state.worldProject.currentX * state.width + col, state.worldProject.currentY * state.height + row)
        : 0.5;
      return elevation * 0.9 + (1 - climateHere.temperature) * 0.22 + (1 - edgeCloseness(row, col)) * 0.14 + Math.random() * 0.12;
    });
    const length = randomInt(state.generatorMode === "big" ? 8 : 6, state.generatorMode === "big" ? 15 : 10);
    let direction = randomInt(0, 5);
    for (let step = 0; step < length && current; step += 1) {
      if (groupNameFor(state.grid[current.row][current.col].tile) !== "ocean") {
        setCellGroup(current.row, current.col, "mountain");
      }
      for (const neighbor of hexNeighbors(current.row, current.col)) {
        if (inBounds(neighbor.row, neighbor.col) && Math.random() < 0.68 && groupNameFor(state.grid[neighbor.row][neighbor.col].tile) !== "ocean") {
          const ridgeNeighbor = Math.random() < 0.22 && step > 1 ? "mountain" : Math.random() < 0.58 ? "highlands" : "hills";
          setCellGroup(neighbor.row, neighbor.col, ridgeNeighbor);
        }
      }
      const options = hexNeighbors(current.row, current.col).filter((neighbor, index) =>
        inBounds(neighbor.row, neighbor.col) && circularDirectionDistance(index, direction) <= 1
      ).sort((a, b) => mountainStepScore(b, direction) - mountainStepScore(a, direction));
      current = options.length ? options[Math.min(randomInt(0, 1), options.length - 1)] : null;
      if (Math.random() < 0.22) {
        direction = modulo(direction + randomItem([-1, 1]), 6);
      }
    }
  }
}

function mountainStepScore(cell, direction) {
  const group = groupNameFor(state.grid[cell.row][cell.col].tile);
  if (group === "ocean") {
    return -999;
  }
  const elevation = state.generatorMode === "big"
    ? worldElevationFieldValue(state.worldProject.currentX * state.width + cell.col, state.worldProject.currentY * state.height + cell.row)
    : 0.5;
  return elevation + (["mountain", "highlands", "hills"].includes(group) ? 0.2 : 0) + Math.random() * 0.08;
}

function circularDirectionDistance(a, b) {
  const diff = Math.abs(a - b);
  return Math.min(diff, 6 - diff);
}

function addGeneratedFoothills() {
  const mountainCells = allCells().filter((cell) => groupNameFor(state.grid[cell.row][cell.col].tile) === "mountain");
  for (const cell of mountainCells) {
    for (const neighbor of hexNeighbors(cell.row, cell.col)) {
      if (!inBounds(neighbor.row, neighbor.col)) {
        continue;
      }
      const group = groupNameFor(state.grid[neighbor.row][neighbor.col].tile);
      if (group === "ocean" || group === "mountain") {
        continue;
      }
      if (Math.random() < 0.58) {
        setCellGroup(neighbor.row, neighbor.col, Math.random() < 0.62 ? "highlands" : "hills");
      }
    }
  }
}

function addGeneratedLakes() {
  const lakeCount = clamp(Math.round((state.width * state.height) / 55), 2, 5);
  const candidates = allCells()
    .filter((cell) => {
      const group = groupNameFor(state.grid[cell.row][cell.col].tile);
      const moisture = state.climateGrid[cell.row][cell.col].moisture;
      return moisture > 0.5 && ["grassland", "forest", "jungle", "swamp", "hills"].includes(group);
    })
    .sort((a, b) => state.climateGrid[b.row][b.col].moisture - state.climateGrid[a.row][a.col].moisture + (Math.random() - 0.5) * 0.2);
  const lakes = [];
  for (const cell of candidates) {
    if (lakes.length >= lakeCount) {
      break;
    }
    if (lakes.some((lake) => hexDistance(cell, lake.cell) < 3)) {
      continue;
    }
    const center = jitteredCellPlacement(cell, 0.34);
    const tile = randomItem(MIDDLE_TILES);
    const object = addMiddleObject(tile, center.x, center.y, "middle");
    object.scale = randomRange(0.65, 1.05);
    object.rotation = randomRange(-Math.PI, Math.PI);
    object.generatedCell = { row: cell.row, col: cell.col };
    object.kind = "lake";
    object.nameKind = "lake";
    lakes.push({ cell, object });
  }
  return lakes;
}

function addGeneratedOceanRims() {
  state.paths = state.paths.filter((path) => !path.generatedOceanRim);
  const segments = [];
  forEachCell((cell) => {
    if (groupNameFor(cell.tile) !== "ocean") {
      return;
    }
    const pos = tilePosition(cell.row, cell.col, cell.tile);
    const corners = footprintPoints(pos.x, pos.y);
    const neighbors = hexPolygonEdgeNeighbors(cell.row, cell.col);
    for (let side = 0; side < 6; side += 1) {
      const neighbor = neighbors[side];
      if (groupNameFor(tileForOceanRimNeighbor(neighbor.row, neighbor.col)) === "ocean") {
        continue;
      }
      segments.push({
        start: corners[side],
        end: corners[(side + 1) % 6]
      });
    }
  });

  for (const line of stitchBoundarySegments(segments)) {
    if (line.length < 2) {
      continue;
    }
    state.paths.push({
      id: state.nextPathId++,
      type: "path",
      assetId: PATH_ASSETS.coastalcliff ? "coastalcliff" : "riverseam",
      generatedOceanRim: true,
      points: line,
      closed: distance(line[0], line[line.length - 1]) < 2,
      width: 12,
      smoothing: 0,
      layer: 2,
      opacity: 0.9,
      tint: null,
      capStart: "round",
      capEnd: "round",
      joinStyle: "round",
      textureMode: "tile",
      textureScale: 180,
      textureOffset: 0,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
}

function tileForOceanRimNeighbor(row, col) {
  if (inBounds(row, col)) {
    return state.grid[row][col].tile;
  }
  if (state.generatorMode !== "big") {
    return null;
  }
  const neighbor = chunkCellForLocalOffset(row, col);
  const chunk = state.worldProject.chunks[chunkKey(neighbor.chunkX, neighbor.chunkY)];
  const savedTile = normalizeTileName(chunk?.tiles?.[neighbor.row]?.[neighbor.col] ?? null);
  if (savedTile) {
    return savedTile;
  }
  return decideBigMapOceanAtWorld(neighbor.worldRow, neighbor.worldCol, true) ? chooseBiomeVariantForClimate(BIOME_GROUPS.ocean, climateForWorldCell(neighbor.worldRow, neighbor.worldCol)) : null;
}

function mod(value, size) {
  return ((value % size) + size) % size;
}

function chunkCellForLocalOffset(row, col) {
  const project = state.worldProject;
  const chunkDx = Math.floor(col / state.width);
  const chunkDy = Math.floor(row / state.height);
  const localCol = mod(col, state.width);
  const localRow = mod(row, state.height);
  const chunkX = project.currentX + chunkDx;
  const chunkY = project.currentY + chunkDy;
  return {
    chunkX,
    chunkY,
    row: localRow,
    col: localCol,
    worldRow: chunkY * state.height + localRow,
    worldCol: chunkX * state.width + localCol
  };
}

function stitchBoundarySegments(segments) {
  const byPoint = new Map();
  segments.forEach((segment, index) => {
    for (const point of [segment.start, segment.end]) {
      const key = pointKey(point);
      if (!byPoint.has(key)) {
        byPoint.set(key, []);
      }
      byPoint.get(key).push(index);
    }
  });

  const used = new Set();
  const lines = [];
  for (let index = 0; index < segments.length; index += 1) {
    if (used.has(index)) {
      continue;
    }
    const segment = segments[index];
    used.add(index);
    const line = [segment.start, segment.end];
    extendBoundaryLine(line, segments, byPoint, used, "end");
    extendBoundaryLine(line, segments, byPoint, used, "start");
    lines.push(line);
  }
  return lines;
}

function extendBoundaryLine(line, segments, byPoint, used, endName) {
  let extended = true;
  while (extended) {
    extended = false;
    const point = endName === "end" ? line[line.length - 1] : line[0];
    const candidates = byPoint.get(pointKey(point)) || [];
    for (const index of candidates) {
      if (used.has(index)) {
        continue;
      }
      const segment = segments[index];
      used.add(index);
      const next = pointKey(segment.start) === pointKey(point) ? segment.end : segment.start;
      if (endName === "end") {
        line.push(next);
      } else {
        line.unshift(next);
      }
      extended = true;
      break;
    }
  }
}

function pointKey(point) {
  return `${Math.round(point.x * 10) / 10},${Math.round(point.y * 10) / 10}`;
}

function addGeneratedRivers(lakes) {
  const riverSources = allCells()
    .filter((cell) => ["mountain", "highlands"].includes(groupNameFor(state.grid[cell.row][cell.col].tile)))
    .sort((a, b) => riverElevation(b) - riverElevation(a));
  const targets = generatedRiverTargets(lakes);
  if (!riverSources.length || !targets.length) {
    return;
  }
  const usedRiverCells = new Set();
  const usedSources = new Set();
  const riverCount = Math.min(targets.length, riverSources.length, state.generatorMode === "big" ? 3 : 2);
  for (let index = 0; index < riverCount; index += 1) {
    const target = chooseRiverTarget(targets, usedRiverCells);
    const sourceOptions = riverSources.filter((cell) => {
      const distanceToTarget = hexDistance(cell, target.cell);
      return distanceToTarget > 2 && distanceToTarget <= 10 && !usedSources.has(cellKey(cell.row, cell.col)) && riverElevation(cell) > riverElevation(target.cell) + 0.08;
    });
    const source = sourceOptions[0] || riverSources.find((cell) => !usedSources.has(cellKey(cell.row, cell.col))) || randomItem(riverSources);
    if (!source || !target) {
      continue;
    }
    usedSources.add(cellKey(source.row, source.col));
    const route = buildRiverCellRoute(source, target.cell, usedRiverCells);
    if (!isValidGeneratedRiverRoute(route, target.cell)) {
      continue;
    }
    const points = buildWigglyRiverPoints(route, target.point);
    if (points.length < 2 || !isValidGeneratedRiverDrawing(points, target.type)) {
      continue;
    }
    route.forEach((cell) => usedRiverCells.add(cellKey(cell.row, cell.col)));
    state.rivers.push({
      id: state.nextRiverId++,
      points: points.reverse(),
      startWidth: randomRange(16, 26),
      endWidth: RIVER_END_WIDTH,
      seed: Math.random(),
      mouthType: target.type
    });
  }
}

function generatedRiverTargets(lakes) {
  const lakeTargets = lakes.map((lake) => ({ type: "lake", cell: lake.cell, point: p(lake.object.x, lake.object.y), weight: 1.2 }));
  const oceanTargets = allCells()
    .filter((cell) => groupNameFor(state.grid[cell.row][cell.col].tile) === "ocean")
    .flatMap((cell) => hexNeighbors(cell.row, cell.col)
      .filter((neighbor) => inBounds(neighbor.row, neighbor.col) && isRiverPassableCell(neighbor, cell))
      .map((landNeighbor) => ({
        type: "ocean",
        cell,
        point: oceanMouthPoint(landNeighbor, cell),
        weight: 0.85
      })));
  return [...lakeTargets, ...oceanTargets];
}

function chooseRiverTarget(targets, usedRiverCells) {
  const scored = targets
    .map((target) => ({
      target,
      score: Math.random() / target.weight + (usedRiverCells.has(cellKey(target.cell.row, target.cell.col)) ? 1.5 : 0)
    }))
    .sort((a, b) => a.score - b.score);
  return scored[0]?.target || null;
}

function oceanMouthPoint(landCell, oceanCell) {
  const land = cellCenter(landCell.row, landCell.col);
  const ocean = cellCenter(oceanCell.row, oceanCell.col);
  return p(lerp(land.x, ocean.x, 0.5), lerp(land.y, ocean.y, 0.5));
}

function addGeneratedStructures(lakes = []) {
  const lakeCells = new Set(lakes.map((lake) => cellKey(lake.cell.row, lake.cell.col)));
  const landCells = allCells().filter((cell) => isGeneratedLandCell(cell, lakeCells));
  if (!landCells.length) {
    return;
  }
  const shorelineCells = landCells.filter((cell) => isNextToGeneratedWater(cell, lakeCells));
  const cityTile = chooseGeneratedCityTile(shorelineCells);
  const settlementCells = [];
  placeStructureNear(chooseGeneratedCastleTile(), landCells, 0.8, (cell) => ["hills", "highlands", "mountain", "grassland"].includes(groupNameFor(state.grid[cell.row][cell.col].tile)), { lakeCells });
  const city = placeStructureNear(cityTile, cityTile === "city_harbor" ? shorelineCells : landCells, 0.85, (cell) => {
    const group = groupNameFor(state.grid[cell.row][cell.col].tile);
    return ["grassland", "forest", "hills"].includes(group);
  }, { lakeCells, shoreline: true });
  if (city?.generatedCell) {
    settlementCells.push(city.generatedCell);
  }
  const villageCount = clamp(Math.round(state.width * state.height / 45), 2, 5);
  for (let index = 0; index < villageCount; index += 1) {
    const sourceCell = randomItem(landCells);
    if (!sourceCell) {
      continue;
    }
    const villageTile = bestVillageForCell(sourceCell, isNextToGeneratedWater(sourceCell, lakeCells));
    const candidates = villageTile === "village_fishing" ? shorelineCells : landCells;
    const village = placeStructureNear(villageTile, candidates, 0.62, () => true, { lakeCells, shoreline: villageTile === "village_fishing" });
    if (village?.generatedCell) {
      settlementCells.push(village.generatedCell);
    }
  }
  placeMiscStructures(lakeCells, settlementCells);
}

function chooseGeneratedCastleTile() {
  return randomItem(["castle", "castle_knightly", "castle_mountain", "castle_square"]);
}

function chooseGeneratedCityTile(shorelineCells = []) {
  if (shorelineCells.length && Math.random() < 0.45) {
    return "city_harbor";
  }
  return randomItem(["city_capital", "city_large"]);
}

function placeMiscStructures(lakeCells, settlementCells = []) {
  const cells = allCells();
  const landCells = cells.filter((cell) => isGeneratedLandCell(cell, lakeCells));
  const shorelineCells = landCells.filter((cell) => isNextToGeneratedWater(cell, lakeCells));
  const waterCells = cells.filter((cell) => isGeneratedWaterCell(cell, lakeCells));
  const budget = clamp(Math.round(state.width * state.height / 24), 6, 18);
  let placed = 0;
  for (const rule of shuffledStructureRules()) {
    if (placed >= budget || Math.random() > rule.chance) {
      continue;
    }
    const pool = rule.water ? waterCells : rule.shoreline ? shorelineCells : cells;
    const object = placeStructureNear(rule.tile, pool, rule.scale, (cell) => structureRuleMatchesCell(rule, cell), {
      lakeCells,
      shoreline: rule.shoreline,
      allowNonLand: rule.allowNonLand,
      nearCells: rule.nearSettlement ? settlementCells : null,
      minNearDistance: rule.minNearDistance,
      maxNearDistance: rule.maxNearDistance || 2
    });
    if (object) {
      placed += 1;
    }
  }
}

function shuffledStructureRules() {
  return [
    structureRule("harbor", 0.34, ["grassland", "forest", "hills"], { shoreline: true, scale: 0.62 }),
    structureRule("farm", 0.65, ["grassland", "hills"], { nearSettlement: true, scale: 0.52 }),
    structureRule("farm_windmill", 0.4, ["grassland", "hills", "savanna"], { nearSettlement: true, scale: 0.52 }),
    structureRule("farm_watermill", 0.32, ["grassland", "forest", "hills"], { shoreline: true, nearSettlement: true, scale: 0.54 }),
    structureRule("vineyard", 0.28, ["grassland", "hills", "savanna"], { nearSettlement: true, scale: 0.52 }),
    structureRule("herbgarden", 0.26, ["grassland", "forest"], { nearSettlement: true, scale: 0.5 }),
    structureRule("alchemist", 0.22, ["grassland", "forest", "city"], { nearSettlement: true, scale: 0.55 }),
    structureRule(randomItem(["entrance_mine", "entrance_ironmine", "entrance_goldmine", "entrance_coalmine"]), 0.72, ["mountain", "hills", "highlands"], { nearSettlement: true, scale: 0.55 }),
    structureRule("entrance_crystalmine", 0.28, ["crystalfield", "mountain"], { nearSettlement: true, scale: 0.56 }),
    structureRule("entrance_saltmine", 0.22, ["desert", "badlands"], { nearSettlement: true, scale: 0.54 }),
    structureRule("camp_quarry", 0.4, ["mountain", "hills", "highlands"], { nearSettlement: true, scale: 0.55 }),
    structureRule("camp_lumber", 0.42, ["forest"], { nearSettlement: true, scale: 0.54 }),
    structureRule("camp_hunting", 0.4, ["forest", "jungle", "hills"], { nearSettlement: true, scale: 0.54 }),
    structureRule("camp_fishing", 0.3, ["grassland", "forest", "swamp"], { shoreline: true, nearSettlement: true, scale: 0.54 }),
    structureRule("camp_market", 0.24, ["grassland", "hills"], { nearSettlement: true, scale: 0.56 }),
    structureRule("camp_caravan", 0.26, ["desert", "savanna", "badlands", "grassland"], { nearSettlement: true, scale: 0.56 }),
    structureRule("camp_nomad", 0.22, ["desert", "savanna", "badlands"], { nearSettlement: true, scale: 0.55 }),
    structureRule("camp_border", 0.2, ["highlands", "hills", "grassland"], { nearSettlement: true, scale: 0.55 }),
    structureRule("camp_pallisade", 0.18, ["forest", "grassland", "hills"], { nearSettlement: true, scale: 0.56 }),
    structureRule("banditcamp", 0.42, ["forest", "hills", "badlands", "wasteland", "grassland"], { nearSettlement: true, minNearDistance: 1, maxNearDistance: 3, scale: 0.58 }),
    structureRule("bandit hideout", 0.34, ["forest", "hills", "badlands", "wasteland", "grassland"], { nearSettlement: true, minNearDistance: 1, maxNearDistance: 3, scale: 0.56 }),
    structureRule("camp_goblin", 0.38, ["forest", "hills", "wasteland", "grassland"], { nearSettlement: true, minNearDistance: 1, maxNearDistance: 3, scale: 0.54 }),
    structureRule("watchtower", 0.4, ["hills", "highlands", "forest", "grassland"], { scale: 0.54 }),
    structureRule("tower_broken", 0.2, ["hills", "highlands", "wasteland", "forest"], { scale: 0.54 }),
    structureRule("wizardtower", 0.2, ["highlands", "forest", "crystalfield", "mountain"], { scale: 0.58 }),
    structureRule(randomItem(["magic_portal", "portal", "magic_obeslik", "elementalrift"]), 0.18, ["crystalfield", "wasteland", "forest", "highlands"], { scale: 0.52 }),
    structureRule("abyssalrift", 0.08, ["wasteland", "cave", "crystalfield"], { scale: 0.58 }),
    structureRule("hellsportal", 0.08, ["volcano", "ashland", "wasteland"], { allowNonLand: true, scale: 0.56 }),
    structureRule(randomItem(["demon scar", "demonscar"]), 0.1, ["volcano", "ashland", "wasteland"], { allowNonLand: true, scale: 0.56 }),
    structureRule("burrow_dragon", 0.18, ["mountain", "highlands", "volcano"], { allowNonLand: true, scale: 0.56 }),
    structureRule("burrow_wyvernpeak", 0.2, ["mountain", "highlands"], { scale: 0.56 }),
    structureRule("burrow_manticorecliffs", 0.18, ["mountain", "badlands", "highlands"], { scale: 0.56 }),
    structureRule("burrow_giantnest", 0.18, ["mountain", "highlands", "hills"], { scale: 0.56 }),
    structureRule("burrow_chimeranest", 0.15, ["wasteland", "badlands", "mountain"], { scale: 0.56 }),
    structureRule("burrow_beastden", 0.32, ["forest", "hills", "grassland"], { scale: 0.54 }),
    structureRule("burrow_forest", 0.32, ["forest", "jungle"], { scale: 0.54 }),
    structureRule("burrow_hydraswamp", 0.2, ["swamp"], { allowNonLand: true, scale: 0.56 }),
    structureRule("burrow_trollbridge", 0.18, ["swamp", "forest", "hills"], { allowNonLand: true, scale: 0.55 }),
    structureRule("burrow_spiders", 0.24, ["forest", "swamp", "wasteland"], { allowNonLand: true, scale: 0.54 }),
    structureRule("entrance_cave", 0.34, ["mountain", "hills", "highlands", "cave"], { scale: 0.55 }),
    structureRule("entrance_crypt", 0.22, ["wasteland", "swamp", "grassland"], { allowNonLand: true, scale: 0.54 }),
    structureRule("entrance_deserttemple", 0.2, ["desert"], { scale: 0.58 }),
    structureRule("entrance_icecave", 0.2, ["arctic"], { scale: 0.55 }),
    structureRule("entrance_jungletemple", 0.22, ["jungle"], { scale: 0.58 }),
    structureRule("entrance_volcanocave", 0.18, ["volcano"], { allowNonLand: true, scale: 0.56 }),
    structureRule(randomItem(["ruins_battlefield", "ruins_gate", "ruins_stairway", "ruins_temple", "ruins_small", "ruins_collapsedgate", "oldbattlefield", "hauntedbattlefield"]), 0.5, ["grassland", "wasteland", "badlands", "forest", "desert"], { scale: 0.55 }),
    structureRule("ancientarena", 0.16, ["grassland", "desert", "badlands", "wasteland"], { scale: 0.58 }),
    structureRule("ruins_arctic", 0.14, ["arctic"], { scale: 0.55 }),
    structureRule(randomItem(["ruins_desert", "ruins_buriedcity"]), 0.2, ["desert", "badlands"], { scale: 0.56 }),
    structureRule("ruins_jungle", 0.18, ["jungle"], { scale: 0.56 }),
    structureRule("ruins_overgrwon", 0.18, ["forest", "jungle"], { scale: 0.56 }),
    structureRule("ruins_swamp", 0.16, ["swamp"], { allowNonLand: true, scale: 0.56 }),
    structureRule("ruins_volcanic", 0.12, ["volcano", "ashland"], { allowNonLand: true, scale: 0.56 }),
    structureRule("ruins_sunken", 0.12, ["ocean", "swamp"], { allowNonLand: true, scale: 0.56 }),
    structureRule("swamp_sinkhole", 0.22, ["swamp"], { allowNonLand: true, scale: 0.55 }),
    structureRule(randomItem(["temple_desert", "temple_moon", "temple_sun", "temple_shattered"]), 0.34, ["desert", "grassland", "highlands", "jungle", "wasteland"], { scale: 0.58 }),
    structureRule(randomItem(["shrine_air", "shrine_earth", "shrine_small", "shrine_standingstones"]), 0.42, ["highlands", "hills", "grassland", "mountain"], { scale: 0.5 }),
    structureRule("shrine_crystal", 0.2, ["crystalfield"], { scale: 0.5 }),
    structureRule("shrine_druidcircle", 0.24, ["forest", "jungle"], { scale: 0.5 }),
    structureRule("shrine_fire", 0.2, ["volcano", "desert", "ashland"], { allowNonLand: true, scale: 0.5 }),
    structureRule("shrine_forest", 0.22, ["forest"], { scale: 0.5 }),
    structureRule("shrine_necro", 0.18, ["wasteland", "swamp"], { allowNonLand: true, scale: 0.5 }),
    structureRule("shrine_water", 0.24, ["grassland", "forest", "swamp"], { shoreline: true, scale: 0.5 }),
    structureRule("cursedtree", 0.16, ["forest", "swamp", "wasteland"], { allowNonLand: true, scale: 0.54 }),
    structureRule("undead graveyard", 0.18, ["wasteland", "swamp", "grassland"], { allowNonLand: true, scale: 0.54 }),
    structureRule(randomItem(["giantskeleton", "monsterbones"]), 0.16, ["desert", "badlands", "wasteland", "mountain"], { scale: 0.56 }),
    structureRule(randomItem(["reef_kraken", "sirenrocks"]), 0.16, ["ocean"], { allowNonLand: true, water: true, scale: 0.58 })
  ].sort(() => Math.random() - 0.5);
}

function structureRule(tile, chance, biomes, options = {}) {
  return { tile, chance, biomes, ...options };
}

function structureRuleMatchesCell(rule, cell) {
  const tile = state.grid[cell.row][cell.col].tile;
  const group = groupNameFor(tile);
  return rule.biomes.some((biome) => biome === group || biome === tile);
}

function placeStructureNear(tile, candidates, scale, predicate, options = {}) {
  if (!tile || !STRUCTURE_TILES.includes(tile)) {
    return null;
  }
  const lakeCells = options.lakeCells || new Set();
  const waterAllowed = isWaterStructure(tile);
  const usable = candidates.filter((cell) =>
    predicate(cell) &&
    (waterAllowed || options.allowNonLand || isGeneratedLandCell(cell, lakeCells)) &&
    (!options.shoreline || isNextToGeneratedWater(cell, lakeCells)) &&
    (!options.nearCells || isNearAnyCell(cell, options.nearCells, options.maxNearDistance || 2, options.minNearDistance || 0)) &&
    !state.middleObjects.some((object) => object.layer === "structures" && distance(object, cellCenter(cell.row, cell.col)) < HEX_WIDTH * 1.25)
  );
  if (!usable.length) {
    return null;
  }
  const cell = randomItem(usable);
  const center = options.shoreline ? shorelinePlacement(cell, lakeCells) : jitteredCellPlacement(cell, 0.28);
  const object = addMiddleObject(tile, center.x, center.y, "structures");
  object.scale = scale;
  object.rotation = 0;
  object.generatedCell = { row: cell.row, col: cell.col };
  return object;
}

function isNearAnyCell(cell, cells, maxDistance, minDistance = 0) {
  return Array.isArray(cells) && cells.some((candidate) => {
    const distance = hexDistance(cell, candidate);
    return distance >= minDistance && distance <= maxDistance;
  });
}

function bestVillageForCell(cell, nextToWater = false) {
  const group = groupNameFor(state.grid[cell.row][cell.col].tile);
  if (nextToWater && Math.random() < 0.38) return "village_fishing";
  if (group === "arctic") return "village_arctic";
  if (group === "desert" || group === "savanna") return "village_desert";
  if (group === "forest") return "village_forest";
  if (group === "jungle") return "village_jungle";
  if (group === "mountain" || group === "highlands") return "village_mountain";
  if (group === "swamp") return "village_swamp";
  return randomItem(["village", "village_farming", "village_hamlet"]);
}

function isGeneratedLandCell(cell, lakeCells = new Set()) {
  const group = groupNameFor(state.grid[cell.row][cell.col].tile);
  return !lakeCells.has(cellKey(cell.row, cell.col)) && !["ocean", "swamp", "volcano"].includes(group);
}

function isGeneratedWaterCell(cell, lakeCells = new Set()) {
  return lakeCells.has(cellKey(cell.row, cell.col)) || groupNameFor(state.grid[cell.row][cell.col].tile) === "ocean";
}

function isNextToGeneratedWater(cell, lakeCells = new Set()) {
  return hexNeighbors(cell.row, cell.col)
    .filter((neighbor) => inBounds(neighbor.row, neighbor.col))
    .some((neighbor) => isGeneratedWaterCell(neighbor, lakeCells));
}

function isWaterStructure(tile) {
  return tile === "harbor" || tile === "city_harbor" || tile === "village_fishing" || tile.startsWith("bridge_");
}

function jitteredCellPlacement(cell, amount = 0.25) {
  const center = cellCenter(cell.row, cell.col);
  return p(
    center.x + randomRange(-HEX_WIDTH * amount, HEX_WIDTH * amount),
    center.y + randomRange(-HEX_HEIGHT * amount, HEX_HEIGHT * amount)
  );
}

function shorelinePlacement(cell, lakeCells = new Set()) {
  const center = cellCenter(cell.row, cell.col);
  const waterNeighbor = hexNeighbors(cell.row, cell.col)
    .filter((neighbor) => inBounds(neighbor.row, neighbor.col) && isGeneratedWaterCell(neighbor, lakeCells))
    .map((neighbor) => cellCenter(neighbor.row, neighbor.col))[0];
  if (!waterNeighbor) {
    return jitteredCellPlacement(cell, 0.2);
  }
  return p(
    lerp(center.x, waterNeighbor.x, 0.34) + randomRange(-10, 10),
    lerp(center.y, waterNeighbor.y, 0.34) + randomRange(-10, 10)
  );
}

function buildRiverCellRoute(sourceCell, targetCell, usedRiverCells) {
  const route = [{ row: sourceCell.row, col: sourceCell.col }];
  const visited = new Set([cellKey(sourceCell.row, sourceCell.col)]);
  let current = sourceCell;
  const limit = Math.max(5, hexDistance(sourceCell, targetCell) + 5);
  for (let step = 0; step < limit && hexDistance(current, targetCell) > 0; step += 1) {
    const options = hexNeighbors(current.row, current.col)
      .filter((cell) => inBounds(cell.row, cell.col) && !visited.has(cellKey(cell.row, cell.col)))
      .filter((cell) => isRiverPassableCell(cell, targetCell))
      .map((cell) => {
        const group = groupNameFor(state.grid[cell.row][cell.col].tile);
        const wet = state.climateGrid[cell.row][cell.col].moisture;
        const nextDistance = hexDistance(cell, targetCell);
        const elevationDrop = riverElevation(current) - riverElevation(cell);
        let score = nextDistance * 4 + Math.random() * 0.9;
        if (nextDistance >= hexDistance(current, targetCell)) score += 3.5;
        if (usedRiverCells.has(cellKey(cell.row, cell.col))) score += 12;
        if (group === "mountain" && nextDistance > 1) score += 1.8;
        if (group === "volcano") score += 5;
        if (group === "ocean" && nextDistance > 0) score += 999;
        if (elevationDrop > 0) score -= Math.min(2.2, elevationDrop * 4);
        if (elevationDrop < -0.04) score += Math.min(5, Math.abs(elevationDrop) * 5);
        if (["forest", "jungle", "grassland", "hills", "swamp"].includes(group)) score -= wet * 0.45;
        return { cell, score };
      })
      .sort((a, b) => a.score - b.score);
    if (!options.length) {
      break;
    }
    current = options[0].cell;
    visited.add(cellKey(current.row, current.col));
    route.push({ row: current.row, col: current.col });
  }
  if (hexDistance(route[route.length - 1], targetCell) > 0) {
    appendDirectRiverRoute(route, targetCell, visited);
  }
  return route;
}

function appendDirectRiverRoute(route, targetCell, visited) {
  let current = route[route.length - 1];
  let guard = state.width + state.height;
  while (hexDistance(current, targetCell) > 0 && guard > 0) {
    const next = hexNeighbors(current.row, current.col)
      .filter((cell) => inBounds(cell.row, cell.col))
      .filter((cell) => !visited.has(cellKey(cell.row, cell.col)) || hexDistance(cell, targetCell) === 0)
      .filter((cell) => isRiverPassableCell(cell, targetCell))
      .sort((a, b) => {
        const climbA = Math.max(0, riverElevation(a) - riverElevation(current));
        const climbB = Math.max(0, riverElevation(b) - riverElevation(current));
        return hexDistance(a, targetCell) + climbA * 2 - (hexDistance(b, targetCell) + climbB * 2);
      })[0];
    if (!next || cellKey(next.row, next.col) === cellKey(current.row, current.col)) {
      break;
    }
    current = next;
    visited.add(cellKey(current.row, current.col));
    route.push({ row: current.row, col: current.col });
    guard -= 1;
  }
}

function isValidGeneratedRiverRoute(route, targetCell) {
  if (!route || route.length < 2 || hexDistance(route[route.length - 1], targetCell) > 0) {
    return false;
  }
  return route.every((cell, index) => isRiverPassableCell(cell, targetCell) || index === route.length - 1);
}

function isValidGeneratedRiverDrawing(points, mouthType) {
  const samples = sampleRiver({
    points,
    startWidth: 20,
    endWidth: RIVER_END_WIDTH,
    seed: 0
  });
  return samples.every((point, index) => {
    const cell = pickCellAtWorld(point.x, point.y);
    const group = groupNameFor(cell?.tile);
    if (group === "volcano") {
      return false;
    }
    if (group === "ocean") {
      return mouthType === "ocean" && index <= 1;
    }
    return true;
  });
}

function isRiverPassableCell(cell, targetCell) {
  const group = groupNameFor(state.grid[cell.row][cell.col].tile);
  if (group === "volcano") {
    return false;
  }
  if (group !== "ocean") {
    return true;
  }
  return targetCell && cell.row === targetCell.row && cell.col === targetCell.col;
}

function riverElevation(cell) {
  const group = groupNameFor(state.grid[cell.row][cell.col].tile);
  if (group === "ocean") return 0;
  if (group === "swamp") return 0.12;
  const base = state.generatorMode === "big"
    ? worldElevationFieldValue(state.worldProject.currentX * state.width + cell.col, state.worldProject.currentY * state.height + cell.row)
    : biomeRiverElevation(group);
  return clamp(base + biomeRiverElevation(group) * 0.35, 0, 1.2);
}

function biomeRiverElevation(group) {
  if (group === "mountain") return 0.95;
  if (group === "highlands") return 0.78;
  if (group === "hills") return 0.58;
  if (group === "forest" || group === "jungle") return 0.38;
  if (group === "grassland" || group === "savanna") return 0.28;
  if (group === "desert" || group === "badlands" || group === "wasteland") return 0.24;
  if (group === "arctic") return 0.32;
  return 0.3;
}

function buildWigglyRiverPoints(route, finalPoint = null) {
  if (!route || route.length < 2) {
    return [];
  }
  const points = [];
  const simplifiedRoute = simplifyRiverRoute(route);
  for (let index = 0; index < simplifiedRoute.length; index += 1) {
    const current = cellCenter(simplifiedRoute[index].row, simplifiedRoute[index].col);
    const prev = simplifiedRoute[Math.max(0, index - 1)];
    const next = simplifiedRoute[Math.min(simplifiedRoute.length - 1, index + 1)];
    const prevCenter = cellCenter(prev.row, prev.col);
    const nextCenter = cellCenter(next.row, next.col);
    const tangent = p(nextCenter.x - prevCenter.x, nextCenter.y - prevCenter.y);
    const length = Math.hypot(tangent.x, tangent.y) || 1;
    const normal = p(-tangent.y / length, tangent.x / length);
    const bend = index === 0 || index === simplifiedRoute.length - 1 ? 0 : randomRange(-HEX_WIDTH * 0.11, HEX_WIDTH * 0.11);
    points.push(p(current.x + normal.x * bend + randomRange(-8, 8), current.y + normal.y * bend + randomRange(-8, 8)));
  }
  if (finalPoint) {
    points[points.length - 1] = p(finalPoint.x, finalPoint.y);
  }
  return points;
}

function simplifyRiverRoute(route) {
  if (route.length <= 5) {
    return route;
  }
  const simplified = [route[0]];
  const stride = Math.max(1, Math.floor(route.length / 4));
  for (let index = stride; index < route.length - 1; index += stride) {
    simplified.push(route[index]);
  }
  simplified.push(route[route.length - 1]);
  return simplified.slice(0, 6);
}

function updateBiomePaletteFromMap() {
  forEachCell((cell) => {
    const group = BIOME_GROUPS[groupNameFor(cell.tile)];
    if (group) {
      group.current = cell.tile;
    }
  });
}

function setCellGroup(row, col, groupName) {
  const group = BIOME_GROUPS[groupName];
  if (!group) {
    return;
  }
  state.grid[row][col].tile = chooseBiomeVariantForClimate(group, state.climateGrid[row][col]);
}

function allCells() {
  const cells = [];
  forEachCell((cell) => cells.push({ row: cell.row, col: cell.col }));
  return cells;
}

function cellCenter(row, col) {
  const origin = cellPosition(row, col);
  return p(origin.x + HEX_WIDTH * 0.5, origin.y + HEX_HEIGHT * 0.5);
}

function cellKey(row, col) {
  return `${row},${col}`;
}

function hexNeighbors(row, col) {
  const odd = row % 2 === 1;
  const diagonals = odd
    ? [{ row: row - 1, col }, { row: row - 1, col: col + 1 }, { row: row + 1, col }, { row: row + 1, col: col + 1 }]
    : [{ row: row - 1, col: col - 1 }, { row: row - 1, col }, { row: row + 1, col: col - 1 }, { row: row + 1, col }];
  return [
    { row, col: col - 1 },
    diagonals[0],
    diagonals[1],
    { row, col: col + 1 },
    diagonals[3],
    diagonals[2]
  ];
}

function hexPolygonEdgeNeighbors(row, col) {
  const odd = row % 2 === 1;
  return odd
    ? [
        { row: row - 1, col: col + 1 },
        { row, col: col + 1 },
        { row: row + 1, col: col + 1 },
        { row: row + 1, col },
        { row, col: col - 1 },
        { row: row - 1, col }
      ]
    : [
        { row: row - 1, col },
        { row, col: col + 1 },
        { row: row + 1, col },
        { row: row + 1, col: col - 1 },
        { row, col: col - 1 },
        { row: row - 1, col: col - 1 }
      ];
}

function inBounds(row, col) {
  return row >= 0 && col >= 0 && row < state.height && col < state.width;
}

function isOuterEdgeCell(row, col) {
  return row === 0 || col === 0 || row === state.height - 1 || col === state.width - 1;
}

function hexDistance(a, b) {
  return Math.max(Math.abs(a.row - b.row), Math.abs(a.col - b.col));
}

function nearestCell(origin, cells) {
  if (!cells.length) {
    return null;
  }
  return cells.reduce((best, cell) => (hexDistance(origin, cell) < hexDistance(origin, best) ? cell : best), cells[0]);
}

function randomBestCell(scoreFn) {
  return allCells()
    .map((cell) => ({ cell, score: scoreFn(cell.row, cell.col) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)[randomInt(0, Math.min(11, state.width * state.height - 1))]?.cell || { row: 0, col: 0 };
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomRange(min, max + 1));
}

function forEachCell(callback) {
  for (const row of state.grid) {
    for (const cell of row) {
      callback(cell);
    }
  }
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * scale);
  canvas.height = Math.floor(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
}

function render() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.save();
  ctx.translate(state.view.x, state.view.y);
  ctx.scale(state.view.zoom, state.view.zoom);

  drawMapContent({ includeSelection: true, includeEmptyHexes: true, includeShadow: true });
  drawFreePlacementPreview();

  if (state.hover && state.activeLayer === "biome") {
    drawHover(state.hover);
  }

  ctx.restore();
  drawBrushPreview();
}

function drawMapContent(options = {}) {
  const {
    includeSelection = true,
    includeEmptyHexes = true,
    includeShadow = false
  } = options;

  if (includeShadow) {
    drawShadow();
  }

  forEachCell((cell) => {
    drawCell(cell, includeEmptyHexes);
  });

  drawMiddleLayer(includeSelection);
}

function drawShadow() {
  const bounds = boardBounds();
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.ellipse(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height - 34,
    bounds.width * 0.42,
    bounds.height * 0.12,
    0,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();
}

function drawCell(cell, includeEmptyHexes = true) {
  const tile = cell.tile;
  if (!tile) {
    if (includeEmptyHexes) {
      drawEmptyHex(cell.row, cell.col);
    }
    return;
  }
  const pos = tilePosition(cell.row, cell.col, tile);
  const image = state.images.get(tile);
  ctx.save();
  if (OVERHANG_TILES[tile]) {
    const overhang = OVERHANG_TILES[tile];
    if (overhang.top) {
      drawOverhangTop(image, tile, pos.x, pos.y, overhang);
    }
    if (overhang.left) {
      drawOverhangLeft(image, tile, pos.x, pos.y, overhang);
    }
    drawHexImage(image, tile, pos.x, pos.y);
  } else {
    drawHexImage(image, tile, pos.x, pos.y);
  }
  ctx.restore();
}

function drawEmptyHex(row, col) {
  const pos = tilePosition(row, col);
  ctx.save();
  tracePolygon(footprintPoints(pos.x, pos.y));
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = "rgba(246, 231, 168, 0.72)";
  ctx.lineWidth = 1.2 / state.view.zoom;
  ctx.stroke();
  ctx.restore();
}

function drawHexImage(image, tile, x, y) {
  const points = footprintPoints(x, y);
  const source = expandedCrop(
    IMAGE_SOURCE_CROPS[tile] || crop(0, 0, image.naturalWidth, image.naturalHeight),
    image
  );
  ctx.save();
  tracePolygon(points);
  ctx.clip();
  ctx.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    x,
    y,
    HEX_WIDTH,
    HEX_HEIGHT
  );
  ctx.restore();
}

function drawOverhangTop(image, tile, x, y, config) {
  const baseSource = expandedCrop(
    IMAGE_SOURCE_CROPS[tile] || crop(0, 0, image.naturalWidth, image.naturalHeight),
    image
  );
  const overhangPixels = HEX_HEIGHT * config.top;
  const overhangPoints = overhangFootprintPoints(x, y, overhangPixels, config.shoulderInset || 0);
  const sourceTop = config.sourceTop ?? Math.max(0, baseSource.y - baseSource.height * config.top);
  const sourceHeight = Math.max(1, baseSource.y + baseSource.height - sourceTop);
  const sourceWidth = baseSource.width;
  const sourceX = baseSource.x;
  const drawHeight = HEX_HEIGHT + overhangPixels;

  ctx.save();
  tracePolygon(overhangPoints);
  ctx.clip();
  ctx.drawImage(
    image,
    sourceX,
    sourceTop,
    sourceWidth,
    sourceHeight,
    x,
    y - overhangPixels,
    HEX_WIDTH,
    drawHeight
  );
  ctx.restore();
}

function drawOverhangLeft(image, tile, x, y, config) {
  const baseSource = expandedCrop(
    IMAGE_SOURCE_CROPS[tile] || crop(0, 0, image.naturalWidth, image.naturalHeight),
    image
  );
  const overhangPixels = HEX_WIDTH * config.left;
  const sourceLeft = config.sourceLeft ?? Math.max(0, baseSource.x - baseSource.width * config.left);
  const sourceWidth = Math.max(1, baseSource.x + baseSource.width - sourceLeft);
  const points = leftOverhangFootprintPoints(x, y, overhangPixels);

  ctx.save();
  tracePolygon(points);
  ctx.clip();
  ctx.drawImage(
    image,
    sourceLeft,
    baseSource.y,
    sourceWidth,
    baseSource.height,
    x - overhangPixels,
    y,
    HEX_WIDTH + overhangPixels,
    HEX_HEIGHT
  );
  ctx.restore();
}

function drawHover(cell) {
  const tile = cell.tile || "template";
  const pos = tilePosition(cell.row, cell.col, tile);
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.lineWidth = 2 / state.view.zoom;
  ctx.strokeStyle = "#f0c766";
  ctx.fillStyle = "rgba(240, 199, 102, 0.08)";
  const points = footprintPoints(pos.x, pos.y);
  tracePolygon(points);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawMiddleLayer(includeSelection = true) {
  for (const road of state.roads) {
    drawRoad(road, includeSelection);
  }
  if (state.roadDraft) {
    drawRoad(state.roadDraft, false, true);
  }
  for (const river of state.rivers) {
    drawRiver(river, includeSelection);
  }
  if (state.riverDraft) {
    drawRiver(state.riverDraft, false, true);
  }
  for (const object of state.middleObjects) {
    if (object.layer === "structures") {
      continue;
    }
    drawMiddleObject(object, includeSelection);
  }
  for (const path of state.paths) {
    drawEditablePath(path, includeSelection);
  }
  if (state.pathDraft) {
    drawEditablePath(state.pathDraft, false, true);
  }
  for (const object of state.middleObjects) {
    if (object.layer !== "structures") {
      continue;
    }
    drawMiddleObject(object, includeSelection);
  }
}

function drawRiver(river, includeSelection = true, isDraft = false) {
  if (river.points.length < 2) {
    drawRiverPoint(river.points[0], river.startWidth, isDraft);
    return;
  }

  const samples = sampleRiver(river);
  const outline = riverOutline(samples);
  const lakeImage = state.middleImages.get("lake_3") || state.middleImages.get("lake_1");

  ctx.save();
  addRiverOutlinePath(outline);
  ctx.clip();
  if (lakeImage) {
    const pattern = ctx.createPattern(lakeImage, "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(riverBounds(outline).minX, riverBounds(outline).minY, riverBounds(outline).width, riverBounds(outline).height);
    }
  }
  ctx.fillStyle = isDraft ? "rgba(35, 145, 185, 0.58)" : "rgba(26, 128, 170, 0.66)";
  ctx.fillRect(riverBounds(outline).minX, riverBounds(outline).minY, riverBounds(outline).width, riverBounds(outline).height);
  if ((river.mouthType === "ocean" || river.mouthType === "lake") && !isDraft) {
    applyRiverMouthFade(river);
  }
  ctx.restore();

  ctx.save();
  addRiverOutlinePath(outline);
  ctx.strokeStyle = isDraft ? "rgba(210, 236, 241, 0.5)" : "rgba(185, 225, 230, 0.36)";
  ctx.lineWidth = 1.2 / state.view.zoom;
  ctx.stroke();
  if (includeSelection && (river.id === state.selectedRiverId || river.id === state.hoverRiverId)) {
    ctx.strokeStyle = river.id === state.selectedRiverId ? "#f0c766" : "rgba(246, 231, 168, 0.58)";
    ctx.lineWidth = 2 / state.view.zoom;
    ctx.setLineDash([7 / state.view.zoom, 5 / state.view.zoom]);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRiverPoint(point, width, isDraft) {
  if (!point) {
    return;
  }
  ctx.save();
  ctx.fillStyle = isDraft ? "rgba(35, 145, 185, 0.62)" : "rgba(26, 128, 170, 0.72)";
  ctx.beginPath();
  ctx.arc(point.x, point.y, Math.max(3, width * 0.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function applyRiverMouthFade(river) {
  if (!river.points.length) {
    return;
  }
  const mouth = river.points[0];
  const next = river.points[1] || mouth;
  const dx = next.x - mouth.x;
  const dy = next.y - mouth.y;
  const len = Math.hypot(dx, dy) || 1;
  const fadeLength = Math.max(20, (river.startWidth || 24) * 0.9);
  const gradient = ctx.createLinearGradient(mouth.x, mouth.y, mouth.x + (dx / len) * fadeLength, mouth.y + (dy / len) * fadeLength);
  gradient.addColorStop(0, "rgba(255, 255, 255, 0.82)");
  gradient.addColorStop(0.42, "rgba(255, 255, 255, 0.28)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = gradient;
  ctx.fillRect(mouth.x - fadeLength, mouth.y - fadeLength, fadeLength * 2, fadeLength * 2);
  ctx.globalCompositeOperation = "source-over";
}

function drawRoad(road, includeSelection = true, isDraft = false) {
  if (road.points.length < 2) {
    drawRoadPoint(road.points[0], road.width, road.type, isDraft);
    return;
  }

  const samples = sampleRoad(road);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = road.type === "street" ? "#6f6b62" : "#7b5834";
  ctx.lineWidth = road.width + (road.type === "street" ? 5 : 6);
  drawPathStroke(samples);
  ctx.stroke();

  ctx.strokeStyle = road.type === "street" ? "#aaa397" : "#b1844d";
  ctx.lineWidth = road.width;
  drawPathStroke(samples);
  ctx.stroke();

  if (road.type === "street") {
    ctx.strokeStyle = "rgba(220, 215, 204, 0.32)";
    ctx.lineWidth = Math.max(1, road.width * 0.18);
    ctx.setLineDash([10, 12]);
    drawPathStroke(samples);
    ctx.stroke();
    ctx.setLineDash([]);
  } else {
    ctx.strokeStyle = "rgba(68, 45, 24, 0.28)";
    ctx.lineWidth = Math.max(1, road.width * 0.16);
    ctx.setLineDash([6, 11]);
    drawPathStroke(samples);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (isDraft || (includeSelection && (road.id === state.selectedRoadId || road.id === state.hoverRoadId))) {
    ctx.strokeStyle = road.id === state.selectedRoadId ? "#f0c766" : "rgba(246, 231, 168, 0.58)";
    ctx.lineWidth = Math.max(2 / state.view.zoom, road.width + 10);
    ctx.setLineDash([7 / state.view.zoom, 5 / state.view.zoom]);
    drawPathStroke(samples);
    ctx.stroke();
  }
  ctx.restore();
}

function drawRoadPoint(point, width, type, isDraft) {
  if (!point) {
    return;
  }
  ctx.save();
  ctx.fillStyle = type === "street" ? "#aaa397" : "#b1844d";
  ctx.globalAlpha = isDraft ? 0.72 : 1;
  ctx.beginPath();
  ctx.arc(point.x, point.y, Math.max(3, width * 0.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPathStroke(samples) {
  ctx.beginPath();
  samples.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
}

function drawEditablePath(path, includeSelection = true, isDraft = false) {
  if (!path.points.length) {
    return;
  }
  const asset = PATH_ASSETS[path.assetId] || PATH_ASSETS.dirtroad;
  const samples = sampleEditablePath(path);
  if (samples.length < 2) {
    drawEditablePathPoint(path.points[0], path.width, asset, isDraft);
    return;
  }

  ctx.save();
  ctx.globalAlpha = path.opacity ?? 1;
  ctx.lineCap = path.capEnd || asset.cap || "round";
  ctx.lineJoin = path.joinStyle || asset.join || "round";
  const texture = state.pathImages.get(path.assetId);
  if (texture) {
    drawTexturedPathSegments(samples, path, texture);
  } else {
    ctx.strokeStyle = asset.edge;
    ctx.lineWidth = path.width + 5;
    drawPathStroke(samples);
    if (path.closed) {
      ctx.closePath();
    }
    ctx.stroke();

    ctx.strokeStyle = asset.color;
    ctx.lineWidth = path.width;
    drawPathStroke(samples);
    if (path.closed) {
      ctx.closePath();
    }
    ctx.stroke();
  }

  if (path.tint) {
    ctx.globalCompositeOperation = "source-atop";
    ctx.strokeStyle = path.tint;
    ctx.globalAlpha = 0.22;
    drawPathStroke(samples);
    if (path.closed) {
      ctx.closePath();
    }
    ctx.stroke();
  }

  const isSelected = includeSelection && path.id === state.selectedPathId;
  const isHovered = includeSelection && path.id === state.hoverPathId;
  if (isDraft || isSelected || isHovered) {
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.strokeStyle = isSelected || isDraft ? "#f0c766" : "rgba(246, 231, 168, 0.58)";
    ctx.lineWidth = Math.max(2 / state.view.zoom, path.width + 10);
    ctx.setLineDash([7 / state.view.zoom, 5 / state.view.zoom]);
    drawPathStroke(samples);
    if (path.closed) {
      ctx.closePath();
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();

  if (isDraft || isSelected) {
    drawPathHandles(path, isDraft);
  }
}

function drawEditablePathPoint(point, width, asset, isDraft) {
  ctx.save();
  ctx.fillStyle = asset.color;
  ctx.globalAlpha = isDraft ? 0.72 : 1;
  ctx.beginPath();
  ctx.arc(point.x, point.y, Math.max(4, width * 0.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawPathHandles(path, isDraft = false) {
  ctx.save();
  for (let index = 0; index < path.points.length; index += 1) {
    const point = path.points[index];
    const selected = !isDraft && path.id === state.selectedPathId && index === state.selectedPathPointIndex;
    ctx.fillStyle = selected ? "#f0c766" : "#17130a";
    ctx.strokeStyle = "#f0c766";
    ctx.lineWidth = 2 / state.view.zoom;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5 / state.view.zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  if (isDraft && path.previewPoint && path.points.length) {
    ctx.strokeStyle = "rgba(240, 199, 102, 0.72)";
    ctx.lineWidth = 1.5 / state.view.zoom;
    ctx.setLineDash([5 / state.view.zoom, 5 / state.view.zoom]);
    ctx.beginPath();
    const last = path.points[path.points.length - 1];
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(path.previewPoint.x, path.previewPoint.y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawTexturedPathSegments(samples, path, image) {
  const sourceScale = image.naturalHeight / Math.max(1, path.width);
  let traveled = path.textureOffset || 0;
  ctx.save();
  for (let index = 1; index < samples.length; index += 1) {
    const start = samples[index - 1];
    const end = samples[index];
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const segmentLength = Math.hypot(dx, dy);
    if (segmentLength < 0.5) {
      continue;
    }
    const angle = Math.atan2(dy, dx);
    const steps = Math.max(1, Math.ceil(segmentLength / 18));
    for (let step = 0; step < steps; step += 1) {
      const startT = step / steps;
      const endT = (step + 1) / steps;
      const midT = (startT + endT) * 0.5;
      const center = p(lerp(start.x, end.x, midT), lerp(start.y, end.y, midT));
      const drawLength = segmentLength / steps + 3;
      const sourceWidth = Math.max(1, drawLength * sourceScale);
      const sourceX = modulo(traveled * sourceScale, image.naturalWidth);
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.rotate(angle);
      drawTextureSlice(image, sourceX, sourceWidth, -drawLength * 0.5, -path.width * 0.5, drawLength, path.width);
      ctx.restore();
      traveled += segmentLength / steps;
    }
  }
  ctx.restore();
}

function drawTextureSlice(image, sourceX, sourceWidth, destX, destY, destWidth, destHeight) {
  if (sourceX + sourceWidth <= image.naturalWidth) {
    ctx.drawImage(image, sourceX, 0, sourceWidth, image.naturalHeight, destX, destY, destWidth, destHeight);
    return;
  }

  const firstWidth = image.naturalWidth - sourceX;
  const firstDestWidth = destWidth * (firstWidth / sourceWidth);
  ctx.drawImage(image, sourceX, 0, firstWidth, image.naturalHeight, destX, destY, firstDestWidth, destHeight);
  const remainingSourceWidth = sourceWidth - firstWidth;
  ctx.drawImage(
    image,
    0,
    0,
    Math.min(remainingSourceWidth, image.naturalWidth),
    image.naturalHeight,
    destX + firstDestWidth,
    destY,
    destWidth - firstDestWidth,
    destHeight
  );
}

function drawMiddleObject(object, includeSelection = true) {
  const image = object.layer === "structures" ? state.structureImages.get(object.tile) : state.middleImages.get(object.tile);
  if (!image) {
    return;
  }

  const bounds = middleObjectBounds(object);
  ctx.save();
  ctx.translate(object.x, object.y);
  ctx.rotate(object.rotation);
  if (object.layer === "structures") {
    drawStructureRim(object, image, bounds);
  }
  ctx.drawImage(image, -bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);

  if (includeSelection && (object.id === state.selectedMiddleObjectId || object.id === state.hoverMiddleObjectId)) {
    ctx.lineWidth = 2 / state.view.zoom;
    ctx.strokeStyle = object.id === state.selectedMiddleObjectId ? "#f0c766" : "rgba(246, 231, 168, 0.58)";
    ctx.setLineDash(object.id === state.selectedMiddleObjectId ? [] : [6 / state.view.zoom, 5 / state.view.zoom]);
    ctx.strokeRect(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
  }
  ctx.restore();
}

function drawStructureRim(object, image, bounds) {
  const color = structureRimColor(object.tile);
  const tinted = tintedStructureImage(object.tile, image, color);
  const rim = Math.max(2 / state.view.zoom, Math.min(bounds.width, bounds.height) * 0.028);
  const offsets = [
    [-rim, 0],
    [rim, 0],
    [0, -rim],
    [0, rim]
  ];

  ctx.save();
  ctx.globalAlpha = 0.62;
  for (const [offsetX, offsetY] of offsets) {
    ctx.drawImage(tinted, -bounds.width / 2 + offsetX, -bounds.height / 2 + offsetY, bounds.width, bounds.height);
  }
  ctx.restore();
}

function tintedStructureImage(tile, image, color) {
  const key = `${tile}:${color}`;
  if (structureRimCache.has(key)) {
    return structureRimCache.get(key);
  }
  const buffer = document.createElement("canvas");
  buffer.width = image.naturalWidth;
  buffer.height = image.naturalHeight;
  const bufferCtx = buffer.getContext("2d");
  bufferCtx.drawImage(image, 0, 0);
  bufferCtx.globalCompositeOperation = "source-in";
  bufferCtx.fillStyle = color;
  bufferCtx.fillRect(0, 0, buffer.width, buffer.height);
  structureRimCache.set(key, buffer);
  return buffer;
}

function structureRimColor(tile) {
  return STRUCTURE_RIM_COLORS[structureRimGroupFor(tile)] || STRUCTURE_RIM_FALLBACK;
}

function structureRimGroupFor(tile) {
  if (tile.includes("mine")) {
    return "mine";
  }
  if (tile.startsWith("bridge_")) {
    return "bridge";
  }
  if (tile.startsWith("city_")) {
    return "city";
  }
  if (tile.startsWith("castle_")) {
    return "castle";
  }
  if (tile.startsWith("village_")) {
    return "village";
  }
  return structureGroupNameFor(tile);
}

function drawFreePlacementPreview() {
  if (
    !state.cursorWorld ||
    state.tool !== "paint" ||
    (state.activeLayer !== "middle" && state.activeLayer !== "structures") ||
    state.draggingMiddleObject ||
    state.draggingRiver ||
    state.draggingRoad ||
    state.draggingPath
  ) {
    return;
  }

  const isStructure = state.activeLayer === "structures";
  const tile = isStructure ? state.selectedStructureTile : state.selectedMiddleTile;
  const image = isStructure ? state.structureImages.get(tile) : state.middleImages.get(tile);
  if (!image) {
    return;
  }

  const preview = {
    id: null,
    tile,
    layer: isStructure ? "structures" : "middle",
    x: state.cursorWorld.x,
    y: state.cursorWorld.y,
    scale: getPlacementScale(),
    rotation: getPlacementRotation()
  };
  const bounds = middleObjectBounds(preview);

  ctx.save();
  ctx.translate(preview.x, preview.y);
  ctx.rotate(preview.rotation);
  ctx.globalAlpha = 0.72;
  if (isStructure) {
    drawStructureRim(preview, image, bounds);
  }
  ctx.drawImage(image, -bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
  ctx.globalAlpha = 1;
  ctx.lineWidth = 2 / state.view.zoom;
  ctx.strokeStyle = "rgba(240, 199, 102, 0.86)";
  ctx.setLineDash([7 / state.view.zoom, 5 / state.view.zoom]);
  ctx.strokeRect(-bounds.width / 2, -bounds.height / 2, bounds.width, bounds.height);
  ctx.restore();
}

function drawBrushPreview() {
  if (!state.cursorScreen || state.tool !== "paint" || state.activeLayer !== "biome") {
    return;
  }

  const image = state.images.get(state.selectedTile);
  if (!image) {
    return;
  }

  const boxSize = 88;
  const imageSize = 74;
  const x = state.cursorScreen.x + 18;
  const y = state.cursorScreen.y + 18;
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "rgba(18, 19, 21, 0.68)";
  roundedRect(x, y, boxSize, boxSize, 8);
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(240, 199, 102, 0.86)";
  ctx.lineWidth = 2;
  roundedRect(x + 0.5, y + 0.5, boxSize - 1, boxSize - 1, 8);
  ctx.stroke();
  ctx.globalAlpha = 0.95;
  drawFlatHexThumbnail(image, state.selectedTile, x + (boxSize - imageSize) * 0.5, y + (boxSize - imageSize) * 0.5, imageSize);
  ctx.restore();
}

function drawFlatHexThumbnail(image, tile, x, y, size) {
  const width = size * (HEX_WIDTH / HEX_HEIGHT);
  const offsetX = (size - width) * 0.5;
  const points = flatHexPoints(x + offsetX, y, width, size);
  const source = expandedCrop(
    IMAGE_SOURCE_CROPS[tile] || crop(0, 0, image.naturalWidth, image.naturalHeight),
    image
  );
  ctx.save();
  tracePolygon(points);
  ctx.clip();
  ctx.drawImage(
    image,
    source.x,
    source.y,
    source.width,
    source.height,
    x + offsetX,
    y,
    width,
    size,
  );
  ctx.restore();
  tracePolygon(points);
  ctx.strokeStyle = "rgba(246, 231, 168, 0.84)";
  ctx.lineWidth = 1.4;
  ctx.stroke();
}

function roundedRect(x, y, width, height, radius) {
  const r = Math.min(radius, width * 0.5, height * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function footprintPoints(x, y) {
  return flatHexPoints(x, y, HEX_WIDTH, HEX_HEIGHT);
}

function overhangFootprintPoints(x, y, topOverhang, shoulderInset) {
  const insetX = HEX_WIDTH * shoulderInset;
  return [
    p(x + HEX_WIDTH * 0.5, y - topOverhang),
    p(x + HEX_WIDTH - insetX, y + HEX_HEIGHT * 0.25),
    p(x + HEX_WIDTH, y + HEX_HEIGHT * 0.75),
    p(x + HEX_WIDTH * 0.5, y + HEX_HEIGHT),
    p(x, y + HEX_HEIGHT * 0.75),
    p(x + insetX, y + HEX_HEIGHT * 0.25)
  ];
}

function leftOverhangFootprintPoints(x, y, leftOverhang) {
  return [
    p(x + HEX_WIDTH * 0.5, y),
    p(x + HEX_WIDTH, y + HEX_HEIGHT * 0.25),
    p(x + HEX_WIDTH, y + HEX_HEIGHT * 0.75),
    p(x + HEX_WIDTH * 0.5, y + HEX_HEIGHT),
    p(x - leftOverhang, y + HEX_HEIGHT * 0.75),
    p(x - leftOverhang, y + HEX_HEIGHT * 0.25)
  ];
}

function flatHexPoints(x, y, width, height) {
  return [
    p(x + width * 0.5, y),
    p(x + width, y + height * 0.25),
    p(x + width, y + height * 0.75),
    p(x + width * 0.5, y + height),
    p(x, y + height * 0.75),
    p(x, y + height * 0.25)
  ];
}

function tracePolygon(points) {
  ctx.beginPath();
  addPolygonPath(points);
}

function addPolygonPath(points) {
  points.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });
  ctx.closePath();
}

function cellPosition(row, col) {
  return {
    x: col * STEP_X + (row % 2) * ROW_OFFSET,
    y: row * STEP_Y
  };
}

function tilePosition(row, col, tile) {
  const origin = cellPosition(row, col);
  return {
    x: origin.x,
    y: origin.y
  };
}

function boardBounds() {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  forEachCell((cell) => {
    const pos = tilePosition(cell.row, cell.col, cell.tile || "template");
    const overhangConfig = cell.tile ? OVERHANG_TILES[cell.tile] : null;
    const overhang = overhangConfig ? HEX_HEIGHT * (overhangConfig.top || 0) : 0;
    const leftOverhang = overhangConfig ? HEX_WIDTH * (overhangConfig.left || 0) : 0;
    minX = Math.min(minX, pos.x - leftOverhang);
    minY = Math.min(minY, pos.y - overhang);
    maxX = Math.max(maxX, pos.x + HEX_WIDTH);
    maxY = Math.max(maxY, pos.y + HEX_HEIGHT);
  });

  for (const object of state.middleObjects) {
    const bounds = transformedMiddleObjectBounds(object);
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
  }

  for (const river of state.rivers) {
    const samples = sampleRiver(river);
    if (!samples.length) {
      continue;
    }
    const bounds = riverBounds(riverOutline(samples));
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
  }

  for (const road of state.roads) {
    const bounds = roadBounds(road);
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
  }

  for (const path of state.paths) {
    const bounds = editablePathBounds(path);
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function centerMap() {
  const rect = canvas.getBoundingClientRect();
  const bounds = boardBounds();
  state.view.x = (rect.width - bounds.width * state.view.zoom) / 2 - bounds.x * state.view.zoom;
  state.view.y = (rect.height - bounds.height * state.view.zoom) / 2 - bounds.y * state.view.zoom + 26;
}

function pointerDown(event) {
  canvas.setPointerCapture(event.pointerId);
  state.lastPointer = canvasPoint(event);
  state.cursorScreen = state.lastPointer;
  state.cursorWorld = screenToWorld(state.lastPointer.x, state.lastPointer.y);

  if (state.activeLayer === "middle" && state.tool === "river") {
    pointerDownRiver(event);
    return;
  }
  if (state.activeLayer === "middle" && state.tool === "road") {
    pointerDownRoad(event);
    return;
  }
  if (state.activeLayer === "paths") {
    pointerDownPath(event);
    return;
  }

  if (event.button === 2 || event.altKey || event.metaKey) {
    state.panning = true;
    canvas.style.cursor = "grabbing";
    return;
  }

  if (state.activeLayer === "middle" || state.activeLayer === "structures") {
    pointerDownMiddle(event);
    return;
  }

  state.painting = true;
  paintAt(event);
}

function pointerMove(event) {
  const point = canvasPoint(event);
  state.cursorScreen = point;
  state.cursorWorld = screenToWorld(point.x, point.y);

  if (state.panning) {
    state.view.x += point.x - state.lastPointer.x;
    state.view.y += point.y - state.lastPointer.y;
    state.lastPointer = point;
    render();
    return;
  }

  if (state.activeLayer === "middle") {
    if (state.tool === "river") {
      pointerMoveRiver(point);
      return;
    }
    if (state.tool === "road") {
      pointerMoveRoad(point);
      return;
    }
    pointerMoveMiddle(point);
    return;
  }
  if (state.activeLayer === "paths") {
    pointerMovePath(point);
    return;
  }
  if (state.activeLayer === "structures") {
    pointerMoveMiddle(point);
    return;
  }

  const cell = pickCell(point.x, point.y);
  if (cell !== state.hover) {
    state.hover = cell;
    render();
  }

  if (state.painting) {
    paintAt(event);
  }
}

function pointerUp() {
  state.painting = false;
  state.draggingMiddleObject = false;
  state.draggingRiver = false;
  state.draggingRoad = false;
  state.draggingPath = false;
  state.draggingPathPoint = false;
  state.panning = false;
  canvas.style.cursor = "crosshair";
  render();
}

function pointerDownPath(event) {
  const world = screenToWorld(state.lastPointer.x, state.lastPointer.y);
  if (event.button === 2) {
    finishPathAt(world);
    render();
    return;
  }

  if (event.button !== 0) {
    return;
  }

  if (!state.pathDraft) {
    const hitPoint = pickPathPoint(world.x, world.y);
    if (hitPoint) {
      selectPath(hitPoint.path.id, hitPoint.index);
      state.draggingPathPoint = true;
      state.pathDragLast = world;
      canvas.style.cursor = "grabbing";
      render();
      return;
    }

    const selected = selectedPath();
    if (selected && state.selectedPathId) {
      const insert = nearestPathSegment(selected, world.x, world.y);
      if (insert && insert.distance <= Math.max(10 / state.view.zoom, selected.width * 0.5 + 6)) {
        selected.points.splice(insert.index, 0, insert.point);
        selected.updatedAt = Date.now();
        state.selectedPathPointIndex = insert.index;
        state.draggingPathPoint = true;
        state.pathDragLast = world;
        canvas.style.cursor = "grabbing";
        setStatus("Inserted path point. Drag to position it.");
        render();
        return;
      }
    }

    const hitPath = pickPath(world.x, world.y);
    if (hitPath) {
      selectPath(hitPath.id, null);
      state.draggingPath = true;
      state.pathDragLast = world;
      canvas.style.cursor = "grabbing";
      render();
      return;
    }
  }

  if (!state.pathDraft) {
    const asset = PATH_ASSETS[state.selectedPathAsset] || PATH_ASSETS.dirtroad;
    const now = Date.now();
    state.selectedPathId = null;
    state.selectedPathPointIndex = null;
    state.pathDraft = {
      id: null,
      type: "path",
      assetId: state.selectedPathAsset,
      points: [world],
      previewPoint: null,
      closed: false,
      width: Number(pathWidthControl.value) || asset.width,
      smoothing: Number(pathSmoothingControl.value) || asset.smoothing,
      layer: 2,
      opacity: 1,
      tint: null,
      capStart: asset.cap || "round",
      capEnd: asset.cap || "round",
      joinStyle: asset.join || "round",
      textureMode: asset.textureMode || "tile",
      textureScale: asset.textureScale || 160,
      textureOffset: 0,
      createdAt: now,
      updatedAt: now
    };
    setStatus(`${asset.label} path started. Left-click points, right-click or Enter to finish.`);
  } else if (state.pathDraft.points.length >= 3 && distance(world, state.pathDraft.points[0]) <= PATH_CLOSE_DISTANCE) {
    state.pathDraft.closed = true;
    finishPathAt(state.pathDraft.points[0], true);
  } else {
    state.pathDraft.points.push(world);
    setStatus(`${state.pathDraft.points.length} path points. Right-click or Enter to finish.`);
  }
  updateToolState();
  render();
}

function pointerMovePath(point) {
  const world = screenToWorld(point.x, point.y);
  if (state.draggingPathPoint) {
    const path = selectedPath();
    if (path && state.selectedPathPointIndex !== null && path.points[state.selectedPathPointIndex]) {
      path.points[state.selectedPathPointIndex] = world;
      path.updatedAt = Date.now();
      render();
    }
    return;
  }

  if (state.draggingPath) {
    moveSelectedPath(world.x - state.pathDragLast.x, world.y - state.pathDragLast.y);
    state.pathDragLast = world;
    render();
    return;
  }

  if (state.pathDraft) {
    state.pathDraft.previewPoint = world;
    render();
    return;
  }

  const hitPoint = pickPathPoint(world.x, world.y);
  const hitPath = hitPoint ? hitPoint.path : pickPath(world.x, world.y);
  const nextHoverPathId = hitPath ? hitPath.id : null;
  const nextHoverPointIndex = hitPoint ? hitPoint.index : null;
  if (state.hoverPathId !== nextHoverPathId || state.hoverPathPointIndex !== nextHoverPointIndex) {
    state.hoverPathId = nextHoverPathId;
    state.hoverPathPointIndex = nextHoverPointIndex;
    canvas.style.cursor = hitPath ? "grab" : "crosshair";
    render();
  }
}

function finishPathAt(world, alreadyClosed = false) {
  if (!state.pathDraft || state.pathDraft.points.length < 1) {
    return;
  }
  const points = [...state.pathDraft.points];
  const shouldClose = alreadyClosed || (points.length >= 3 && distance(world, points[0]) <= PATH_CLOSE_DISTANCE);
  if (!shouldClose && points.length === 1) {
    points.push(world);
  } else if (!shouldClose && distance(world, points[points.length - 1]) > 1) {
    points.push(world);
  }
  if (points.length < 2 || (shouldClose && points.length < 3)) {
    state.pathDraft = null;
    return;
  }
  const now = Date.now();
  const path = {
    ...state.pathDraft,
    id: state.nextPathId,
    points,
    previewPoint: null,
    closed: shouldClose || state.pathDraft.closed,
    updatedAt: now
  };
  state.nextPathId += 1;
  state.paths.push(path);
  state.pathDraft = null;
  selectPath(path.id, null);
  setStatus(`${(PATH_ASSETS[path.assetId] || PATH_ASSETS.dirtroad).label} path finished. Click points to edit, click the strip to move it.`);
}

function pointerDownMiddle(event) {
  const world = screenToWorld(state.lastPointer.x, state.lastPointer.y);
  const hitObject = pickMiddleObject(world.x, world.y);
  const hitRiver = hitObject ? null : pickRiver(world.x, world.y);
  const hitRoad = hitObject || hitRiver ? null : pickRoad(world.x, world.y);

  if (state.tool === "erase") {
    if (hitObject) {
      deleteMiddleObject(hitObject.id);
      setStatus(`Removed ${formatTileName(hitObject.tile)}.`);
      render();
    } else if (hitRiver) {
      deleteRiver(hitRiver.id);
      setStatus("Removed river.");
      render();
    } else if (hitRoad) {
      deleteRoad(hitRoad.id);
      setStatus(`Removed ${formatTileName(hitRoad.type)} road.`);
      render();
    }
    return;
  }

  if (hitObject) {
    selectMiddleObject(hitObject.id);
    state.selectedRiverId = null;
    state.draggingMiddleObject = true;
    state.middleDragOffset = p(world.x - hitObject.x, world.y - hitObject.y);
    canvas.style.cursor = "grabbing";
    render();
    return;
  }

  if (hitRiver) {
    selectRiver(hitRiver.id);
    state.draggingRiver = true;
    state.riverDragLast = world;
    canvas.style.cursor = "grabbing";
    render();
    return;
  }

  if (hitRoad) {
    selectRoad(hitRoad.id);
    state.draggingRoad = true;
    state.roadDragLast = world;
    canvas.style.cursor = "grabbing";
    render();
    return;
  }

  if (state.tool === "paint") {
    const tile = state.activeLayer === "structures" ? state.selectedStructureTile : state.selectedMiddleTile;
    const layer = state.activeLayer === "structures" ? "structures" : "middle";
    const object = addMiddleObject(tile, world.x, world.y, layer);
    object.scale = getPlacementScale(layer);
    object.rotation = getPlacementRotation(layer);
    selectMiddleObject(object.id);
    state.selectedRiverId = null;
    state.selectedRoadId = null;
    state.draggingMiddleObject = true;
    state.middleDragOffset = p(0, 0);
    canvas.style.cursor = "grabbing";
    setStatus(`Placed ${formatTileName(object.tile)}. Drag to move it.`);
    render();
  }
}

function pointerDownRiver(event) {
  const world = screenToWorld(state.lastPointer.x, state.lastPointer.y);
  if (event.button === 2) {
    finishRiverAt(world);
    render();
    return;
  }

  if (event.button !== 0) {
    return;
  }

  if (!state.riverDraft) {
    const hitRiver = pickRiver(world.x, world.y);
    if (hitRiver) {
      selectRiver(hitRiver.id);
      state.draggingRiver = true;
      state.riverDragLast = world;
      canvas.style.cursor = "grabbing";
      render();
      return;
    }
  }

  if (!state.riverDraft) {
    state.selectedRiverId = null;
    state.riverDraft = {
      id: null,
      points: [world],
      previewPoint: null,
      startWidth: Number(riverWidthControl.value),
      endWidth: RIVER_END_WIDTH,
      seed: Math.random()
    };
    setStatus("River mouth placed. Left-click more flow points, right-click the tiny source end.");
  } else {
    state.riverDraft.points.push(world);
    setStatus(`${state.riverDraft.points.length} river points. Right-click to finish with a tiny end.`);
  }
  render();
}

function pointerMoveRiver(point) {
  const world = screenToWorld(point.x, point.y);
  if (state.draggingRiver) {
    moveSelectedRiver(world.x - state.riverDragLast.x, world.y - state.riverDragLast.y);
    state.riverDragLast = world;
    render();
    return;
  }
  if (state.riverDraft) {
    state.riverDraft.previewPoint = world;
    render();
  }
}

function finishRiverAt(world) {
  if (!state.riverDraft || state.riverDraft.points.length < 1) {
    return;
  }
  const points = [...state.riverDraft.points, world];
  if (points.length < 2) {
    state.riverDraft = null;
    return;
  }
  const river = {
    id: state.nextRiverId,
    points,
    startWidth: state.riverDraft.startWidth,
    endWidth: RIVER_END_WIDTH,
    seed: state.riverDraft.seed
  };
  state.nextRiverId += 1;
  state.rivers.push(river);
  state.selectedRiverId = river.id;
  state.riverDraft = null;
  setStatus("River finished. Left-click to start another river mouth.");
}

function pointerDownRoad(event) {
  const world = screenToWorld(state.lastPointer.x, state.lastPointer.y);
  if (event.button === 2) {
    finishRoadAt(world);
    render();
    return;
  }

  if (event.button !== 0) {
    return;
  }

  if (!state.roadDraft) {
    const hitRoad = pickRoad(world.x, world.y);
    if (hitRoad) {
      selectRoad(hitRoad.id);
      state.draggingRoad = true;
      state.roadDragLast = world;
      canvas.style.cursor = "grabbing";
      render();
      return;
    }
  }

  if (!state.roadDraft) {
    state.selectedRoadId = null;
    state.roadDraft = {
      id: null,
      type: state.selectedRoadType,
      points: [world],
      previewPoint: null,
      width: Number(roadWidthControl.value)
    };
    setStatus(`${formatTileName(state.selectedRoadType)} road started. Left-click more points, right-click to finish.`);
  } else {
    state.roadDraft.points.push(world);
    setStatus(`${state.roadDraft.points.length} road points. Right-click to finish.`);
  }
  render();
}

function pointerMoveRoad(point) {
  const world = screenToWorld(point.x, point.y);
  if (state.draggingRoad) {
    moveSelectedRoad(world.x - state.roadDragLast.x, world.y - state.roadDragLast.y);
    state.roadDragLast = world;
    render();
    return;
  }
  if (state.roadDraft) {
    state.roadDraft.previewPoint = world;
    render();
  }
}

function finishRoadAt(world) {
  if (!state.roadDraft || state.roadDraft.points.length < 1) {
    return;
  }
  const points = [...state.roadDraft.points, world];
  if (points.length < 2) {
    state.roadDraft = null;
    return;
  }
  const road = {
    id: state.nextRoadId,
    type: state.roadDraft.type,
    points,
    width: state.roadDraft.width
  };
  state.nextRoadId += 1;
  state.roads.push(road);
  state.selectedRoadId = road.id;
  state.roadDraft = null;
  setStatus(`${formatTileName(road.type)} road finished. Click it to move or delete it.`);
}

function selectRiver(id) {
  state.selectedRiverId = id;
  state.selectedMiddleObjectId = null;
  state.selectedRoadId = null;
  state.selectedPathId = null;
  state.selectedPathPointIndex = null;
  state.riverDraft = null;
  state.roadDraft = null;
  state.pathDraft = null;
  setStatus("Selected river. Drag to move it, or press Delete/Backspace to remove it.");
}

function deleteRiver(id) {
  state.rivers = state.rivers.filter((river) => river.id !== id);
  if (state.selectedRiverId === id) {
    state.selectedRiverId = null;
  }
}

function moveSelectedRiver(dx, dy) {
  const river = selectedRiver();
  if (!river) {
    return;
  }
  river.points = river.points.map((point) => p(point.x + dx, point.y + dy));
}

function selectedRiver() {
  return state.rivers.find((river) => river.id === state.selectedRiverId) || null;
}

function selectRoad(id) {
  state.selectedRoadId = id;
  state.selectedRiverId = null;
  state.selectedMiddleObjectId = null;
  state.selectedPathId = null;
  state.selectedPathPointIndex = null;
  state.riverDraft = null;
  state.roadDraft = null;
  state.pathDraft = null;
  setStatus("Selected road. Drag to move it, or press Delete/Backspace to remove it.");
}

function deleteRoad(id) {
  state.roads = state.roads.filter((road) => road.id !== id);
  if (state.selectedRoadId === id) {
    state.selectedRoadId = null;
  }
}

function moveSelectedRoad(dx, dy) {
  const road = selectedRoad();
  if (!road) {
    return;
  }
  road.points = road.points.map((point) => p(point.x + dx, point.y + dy));
}

function selectedRoad() {
  return state.roads.find((road) => road.id === state.selectedRoadId) || null;
}

function selectPath(id, pointIndex = null) {
  const path = state.paths.find((item) => item.id === id);
  if (!path) {
    return;
  }
  state.selectedPathId = id;
  state.selectedPathPointIndex = pointIndex;
  state.selectedMiddleObjectId = null;
  state.selectedRiverId = null;
  state.selectedRoadId = null;
  state.pathDraft = null;
  const index = state.paths.findIndex((item) => item.id === id);
  if (index >= 0) {
    const [item] = state.paths.splice(index, 1);
    state.paths.push(item);
  }
  pathWidthControl.value = String(path.width);
  pathSmoothingControl.value = String(path.smoothing);
  updateToolState();
  setStatus(pointIndex === null ? "Selected path. Drag to move it, or click its points to edit." : "Selected path point. Drag to move it or press Delete.");
}

function deletePath(id) {
  state.paths = state.paths.filter((path) => path.id !== id);
  if (state.selectedPathId === id) {
    state.selectedPathId = null;
    state.selectedPathPointIndex = null;
  }
}

function moveSelectedPath(dx, dy) {
  const path = selectedPath();
  if (!path) {
    return;
  }
  path.points = path.points.map((point) => p(point.x + dx, point.y + dy));
  path.updatedAt = Date.now();
}

function selectedPath() {
  return state.paths.find((path) => path.id === state.selectedPathId) || null;
}

function pointerMoveMiddle(point) {
  const world = screenToWorld(point.x, point.y);

  if (state.draggingRiver) {
    moveSelectedRiver(world.x - state.riverDragLast.x, world.y - state.riverDragLast.y);
    state.riverDragLast = world;
    render();
    return;
  }

  if (state.draggingRoad) {
    moveSelectedRoad(world.x - state.roadDragLast.x, world.y - state.roadDragLast.y);
    state.roadDragLast = world;
    render();
    return;
  }

  if (state.draggingMiddleObject) {
    const object = selectedMiddleObject();
    if (object) {
      object.x = world.x - state.middleDragOffset.x;
      object.y = world.y - state.middleDragOffset.y;
      render();
    }
    return;
  }

  const hitObject = pickMiddleObject(world.x, world.y);
  const nextHoverId = hitObject ? hitObject.id : null;
  const hitRiver = hitObject ? null : pickRiver(world.x, world.y);
  const nextHoverRiverId = hitRiver ? hitRiver.id : null;
  const hitRoad = hitObject || hitRiver ? null : pickRoad(world.x, world.y);
  const nextHoverRoadId = hitRoad ? hitRoad.id : null;
  if (state.hoverMiddleObjectId !== nextHoverId || state.hoverRiverId !== nextHoverRiverId || state.hoverRoadId !== nextHoverRoadId) {
    state.hoverMiddleObjectId = nextHoverId;
    state.hoverRiverId = nextHoverRiverId;
    state.hoverRoadId = nextHoverRoadId;
    canvas.style.cursor = hitObject || hitRiver || hitRoad ? "grab" : "crosshair";
    render();
    return;
  }
  if (state.tool === "paint") {
    render();
  }
}

function paintAt(event) {
  const point = canvasPoint(event);
  const cell = pickCell(point.x, point.y);
  if (!cell) {
    return;
  }

  const nextTile = state.tool === "erase" ? null : state.selectedTile;
  if (cell.tile !== nextTile) {
    cell.tile = nextTile;
    setStatus(`${state.tool === "erase" ? "Erased" : "Painted"} row ${cell.row + 1}, column ${cell.col + 1}.`);
    render();
  }
}

function pickCell(screenX, screenY) {
  const worldX = (screenX - state.view.x) / state.view.zoom;
  const worldY = (screenY - state.view.y) / state.view.zoom;
  return pickCellAtWorld(worldX, worldY);
}

function pickCellAtWorld(worldX, worldY) {
  for (let row = state.height - 1; row >= 0; row -= 1) {
    for (let col = state.width - 1; col >= 0; col -= 1) {
      const cell = state.grid[row][col];
      const tile = cell.tile || "template";
      const pos = tilePosition(row, col, tile);
      const localX = worldX - pos.x;
      const localY = worldY - pos.y;
      if (localX < 0 || localY < 0 || localX >= HEX_WIDTH || localY >= HEX_HEIGHT) {
        continue;
      }
      if (pointInPolygon({ x: worldX, y: worldY }, footprintPoints(pos.x, pos.y))) {
        return cell;
      }
    }
  }
  return null;
}

function addMiddleObject(tile, x, y, layer = "middle") {
  const object = {
    id: state.nextMiddleObjectId,
    tile,
    layer,
    x,
    y,
    scale: 1,
    rotation: 0
  };
  state.nextMiddleObjectId += 1;
  state.middleObjects.push(object);
  return object;
}

function deleteMiddleObject(id) {
  state.middleObjects = state.middleObjects.filter((object) => object.id !== id);
  if (state.selectedMiddleObjectId === id) {
    state.selectedMiddleObjectId = null;
  }
  syncMiddleControls();
}

function selectMiddleObject(id) {
  state.selectedMiddleObjectId = id;
  state.selectedRiverId = null;
  state.selectedRoadId = null;
  state.selectedPathId = null;
  state.selectedPathPointIndex = null;
  const index = state.middleObjects.findIndex((object) => object.id === id);
  if (index >= 0) {
    const [object] = state.middleObjects.splice(index, 1);
    state.middleObjects.push(object);
  }
  syncMiddleControls();
}

function selectedMiddleObject() {
  return state.middleObjects.find((object) => object.id === state.selectedMiddleObjectId) || null;
}

function pickMiddleObject(worldX, worldY) {
  for (let index = state.middleObjects.length - 1; index >= 0; index -= 1) {
    const object = state.middleObjects[index];
    if (state.activeLayer === "middle" && object.layer === "structures") {
      continue;
    }
    if (state.activeLayer === "structures" && object.layer !== "structures") {
      continue;
    }
    if (pointInMiddleObject(worldX, worldY, object)) {
      return object;
    }
  }
  return null;
}

function pickRiver(worldX, worldY) {
  for (let index = state.rivers.length - 1; index >= 0; index -= 1) {
    const river = state.rivers[index];
    if (pointInRiver(worldX, worldY, river)) {
      return river;
    }
  }
  return null;
}

function pickRoad(worldX, worldY) {
  for (let index = state.roads.length - 1; index >= 0; index -= 1) {
    const road = state.roads[index];
    if (pointInRoad(worldX, worldY, road)) {
      return road;
    }
  }
  return null;
}

function pickPath(worldX, worldY) {
  for (let index = state.paths.length - 1; index >= 0; index -= 1) {
    const path = state.paths[index];
    if (pointInPath(worldX, worldY, path)) {
      return path;
    }
  }
  return null;
}

function pickPathPoint(worldX, worldY) {
  const radius = Math.max(8 / state.view.zoom, 6);
  for (let pathIndex = state.paths.length - 1; pathIndex >= 0; pathIndex -= 1) {
    const path = state.paths[pathIndex];
    for (let pointIndex = path.points.length - 1; pointIndex >= 0; pointIndex -= 1) {
      const point = path.points[pointIndex];
      if (Math.hypot(worldX - point.x, worldY - point.y) <= radius) {
        return { path, index: pointIndex };
      }
    }
  }
  return null;
}

function pointInPath(worldX, worldY, path) {
  const samples = sampleEditablePath(path);
  if (samples.length < 2) {
    return false;
  }
  for (let index = 1; index < samples.length; index += 1) {
    const start = samples[index - 1];
    const end = samples[index];
    if (distanceToSegment(p(worldX, worldY), start, end) <= path.width * 0.5 + 8) {
      return true;
    }
  }
  if (path.closed && samples.length > 2) {
    const first = samples[0];
    const last = samples[samples.length - 1];
    return distanceToSegment(p(worldX, worldY), last, first) <= path.width * 0.5 + 8;
  }
  return false;
}

function nearestPathSegment(path, worldX, worldY) {
  let nearest = null;
  const sourcePoints = path.points;
  const segmentCount = path.closed ? sourcePoints.length : sourcePoints.length - 1;
  for (let index = 0; index < segmentCount; index += 1) {
    const start = sourcePoints[index];
    const end = sourcePoints[(index + 1) % sourcePoints.length];
    const projection = projectPointToSegment(p(worldX, worldY), start, end);
    if (!nearest || projection.distance < nearest.distance) {
      nearest = {
        index: index + 1,
        point: projection.point,
        distance: projection.distance
      };
    }
  }
  return nearest;
}

function pointInRoad(worldX, worldY, road) {
  const samples = sampleRoad(road);
  if (samples.length < 2) {
    return false;
  }
  for (let index = 1; index < samples.length; index += 1) {
    const start = samples[index - 1];
    const end = samples[index];
    const distance = distanceToSegment(p(worldX, worldY), start, end);
    if (distance <= road.width * 0.5 + 8) {
      return true;
    }
  }
  return false;
}

function pointInRiver(worldX, worldY, river) {
  const samples = sampleRiver(river);
  if (samples.length < 2) {
    return false;
  }
  for (let index = 1; index < samples.length; index += 1) {
    const start = samples[index - 1];
    const end = samples[index];
    const distance = distanceToSegment(p(worldX, worldY), start, end);
    const width = Math.max(start.width, end.width) * 0.5 + 8;
    if (distance <= width) {
      return true;
    }
  }
  return false;
}

function distanceToSegment(point, start, end) {
  return projectPointToSegment(point, start, end).distance;
}

function projectPointToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (!lengthSquared) {
    return {
      point: p(start.x, start.y),
      distance: Math.hypot(point.x - start.x, point.y - start.y)
    };
  }
  const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
  const projected = p(start.x + dx * t, start.y + dy * t);
  return {
    point: projected,
    distance: Math.hypot(point.x - projected.x, point.y - projected.y)
  };
}

function pointInMiddleObject(worldX, worldY, object) {
  const bounds = middleObjectBounds(object);
  const dx = worldX - object.x;
  const dy = worldY - object.y;
  const cos = Math.cos(-object.rotation);
  const sin = Math.sin(-object.rotation);
  const localX = dx * cos - dy * sin;
  const localY = dx * sin + dy * cos;
  return Math.abs(localX) <= bounds.width / 2 && Math.abs(localY) <= bounds.height / 2;
}

function middleObjectBounds(object) {
  return {
    width: MIDDLE_TILE_SIZE * object.scale,
    height: MIDDLE_TILE_SIZE * object.scale
  };
}

function transformedMiddleObjectBounds(object) {
  const bounds = middleObjectBounds(object);
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;
  const cos = Math.cos(object.rotation);
  const sin = Math.sin(object.rotation);
  const corners = [
    p(-halfWidth, -halfHeight),
    p(halfWidth, -halfHeight),
    p(halfWidth, halfHeight),
    p(-halfWidth, halfHeight)
  ].map((corner) =>
    p(
      object.x + corner.x * cos - corner.y * sin,
      object.y + corner.x * sin + corner.y * cos
    )
  );
  return {
    minX: Math.min(...corners.map((corner) => corner.x)),
    minY: Math.min(...corners.map((corner) => corner.y)),
    maxX: Math.max(...corners.map((corner) => corner.x)),
    maxY: Math.max(...corners.map((corner) => corner.y))
  };
}

function rotateSelectedMiddleObject(degrees) {
  const object = selectedMiddleObject();
  if (!object) {
    return;
  }
  object.rotation = normalizeRadians(object.rotation + degreesToRadians(degrees));
  syncMiddleControls();
  setStatus(`${formatTileName(object.tile)} rotation ${Math.round(radiansToDegrees(object.rotation))} degrees.`);
  render();
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const crosses = yi > point.y !== yj > point.y;
    if (crosses) {
      const xOnEdge = ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;
      if (point.x < xOnEdge) {
        inside = !inside;
      }
    }
  }
  return inside;
}

function sampleRiver(river) {
  const sourcePoints = river.previewPoint ? [...river.points, river.previewPoint] : river.points;
  if (sourcePoints.length < 2) {
    return [];
  }

  const smoothed = [];
  for (let index = 0; index < sourcePoints.length - 1; index += 1) {
    const p0 = sourcePoints[Math.max(0, index - 1)];
    const p1 = sourcePoints[index];
    const p2 = sourcePoints[index + 1];
    const p3 = sourcePoints[Math.min(sourcePoints.length - 1, index + 2)];
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = Math.max(3, Math.ceil(distance / RIVER_SAMPLE_STEP));
    for (let step = 0; step < steps; step += 1) {
      const t = step / steps;
      smoothed.push(catmullRomPoint(p0, p1, p2, p3, t));
    }
  }
  smoothed.push(sourcePoints[sourcePoints.length - 1]);

  const totalLength = pathLength(smoothed);
  let traveled = 0;
  return smoothed.map((point, index) => {
    if (index > 0) {
      traveled += Math.hypot(point.x - smoothed[index - 1].x, point.y - smoothed[index - 1].y);
    }
    const progress = totalLength > 0 ? traveled / totalLength : 0;
    const width = lerp(river.startWidth, river.endWidth, progress);
    return wiggleRiverPoint(point, smoothed, index, width, river.seed, progress);
  });
}

function sampleRoad(road) {
  const sourcePoints = road.previewPoint ? [...road.points, road.previewPoint] : road.points;
  if (sourcePoints.length < 2) {
    return [];
  }
  const smoothed = [];
  for (let index = 0; index < sourcePoints.length - 1; index += 1) {
    const p0 = sourcePoints[Math.max(0, index - 1)];
    const p1 = sourcePoints[index];
    const p2 = sourcePoints[index + 1];
    const p3 = sourcePoints[Math.min(sourcePoints.length - 1, index + 2)];
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    const steps = Math.max(3, Math.ceil(distance / ROAD_SAMPLE_STEP));
    for (let step = 0; step < steps; step += 1) {
      smoothed.push(catmullRomPoint(p0, p1, p2, p3, step / steps));
    }
  }
  smoothed.push(sourcePoints[sourcePoints.length - 1]);
  return smoothed;
}

function sampleEditablePath(path) {
  const sourcePoints = path.previewPoint ? [...path.points, path.previewPoint] : path.points;
  if (sourcePoints.length < 2) {
    return sourcePoints;
  }
  if ((Number(path.smoothing) || 0) <= 0) {
    return path.closed ? [...sourcePoints, sourcePoints[0]] : sourcePoints;
  }

  const smoothed = [];
  const segmentCount = path.closed ? sourcePoints.length : sourcePoints.length - 1;
  for (let index = 0; index < segmentCount; index += 1) {
    const p1 = sourcePoints[index];
    const p2 = sourcePoints[(index + 1) % sourcePoints.length];
    const p0 = path.closed
      ? sourcePoints[(index - 1 + sourcePoints.length) % sourcePoints.length]
      : sourcePoints[Math.max(0, index - 1)];
    const p3 = path.closed
      ? sourcePoints[(index + 2) % sourcePoints.length]
      : sourcePoints[Math.min(sourcePoints.length - 1, index + 2)];
    const segmentDistance = distance(p1, p2);
    const steps = Math.max(3, Math.ceil(segmentDistance / PATH_SAMPLE_STEP));
    for (let step = 0; step < steps; step += 1) {
      const point = catmullRomPoint(p0, p1, p2, p3, step / steps);
      smoothed.push(lerpPoint(p1, point, Number(path.smoothing) || 0));
    }
  }
  if (path.closed) {
    smoothed.push(smoothed[0]);
  } else {
    smoothed.push(sourcePoints[sourcePoints.length - 1]);
  }
  return smoothed;
}

function roadBounds(road) {
  const samples = sampleRoad(road);
  if (!samples.length) {
    const point = road.points[0] || p(0, 0);
    return { minX: point.x, minY: point.y, maxX: point.x, maxY: point.y };
  }
  const padding = road.width * 0.5 + 8;
  const bounds = riverBounds(samples);
  return {
    minX: bounds.minX - padding,
    minY: bounds.minY - padding,
    maxX: bounds.maxX + padding,
    maxY: bounds.maxY + padding,
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2
  };
}

function editablePathBounds(path) {
  const samples = sampleEditablePath(path);
  if (!samples.length) {
    const point = path.points[0] || p(0, 0);
    return { minX: point.x, minY: point.y, maxX: point.x, maxY: point.y };
  }
  const padding = path.width * 0.5 + 10;
  const bounds = riverBounds(samples);
  return {
    minX: bounds.minX - padding,
    minY: bounds.minY - padding,
    maxX: bounds.maxX + padding,
    maxY: bounds.maxY + padding,
    width: bounds.width + padding * 2,
    height: bounds.height + padding * 2
  };
}

function catmullRomPoint(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return p(
    0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
  );
}

function wiggleRiverPoint(point, points, index, width, seed, progress) {
  const prev = points[Math.max(0, index - 1)];
  const next = points[Math.min(points.length - 1, index + 1)];
  const dx = next.x - prev.x;
  const dy = next.y - prev.y;
  const length = Math.hypot(dx, dy) || 1;
  const normal = p(-dy / length, dx / length);
  const noise = Math.sin(index * 0.72 + seed * 1000) + Math.sin(index * 0.23 + seed * 1700) * 0.5;
  const amount = noise * Math.min(width * 0.28, 9) * Math.sin(progress * Math.PI);
  return {
    x: point.x + normal.x * amount,
    y: point.y + normal.y * amount,
    width
  };
}

function riverOutline(samples) {
  const left = [];
  const right = [];
  for (let index = 0; index < samples.length; index += 1) {
    const current = samples[index];
    const prev = samples[Math.max(0, index - 1)];
    const next = samples[Math.min(samples.length - 1, index + 1)];
    const dx = next.x - prev.x;
    const dy = next.y - prev.y;
    const length = Math.hypot(dx, dy) || 1;
    const nx = -dy / length;
    const ny = dx / length;
    const half = current.width * 0.5;
    left.push(p(current.x + nx * half, current.y + ny * half));
    right.push(p(current.x - nx * half, current.y - ny * half));
  }
  return left.concat(right.reverse());
}

function addRiverOutlinePath(outline) {
  ctx.beginPath();
  addPolygonPath(outline);
}

function riverBounds(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

function pathLength(points) {
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
  }
  return length;
}

function lerp(start, end, progress) {
  return start + (end - start) * progress;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function modulo(value, divisor) {
  return ((value % divisor) + divisor) % divisor;
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function screenToWorld(screenX, screenY) {
  return {
    x: (screenX - state.view.x) / state.view.zoom,
    y: (screenY - state.view.y) / state.view.zoom
  };
}

function wheelVariants(event) {
  event.preventDefault();
  if (state.activeLayer === "middle" || state.activeLayer === "structures") {
    wheelMiddleLayer(event);
    return;
  }
  if (state.activeLayer === "paths") {
    cyclePathAsset(event.deltaY > 0 ? 1 : -1);
    return;
  }
  if (cycleVariant(event.deltaY > 0 ? 1 : -1)) {
    render();
  }
}

function wheelMiddleLayer(event) {
  const object = selectedMiddleObject();
  if (
    event.ctrlKey &&
    state.tool === "paint" &&
    (state.activeLayer === "middle" || state.activeLayer === "structures") &&
    (!object || state.hoverMiddleObjectId !== object.id)
  ) {
    const nextScale = clamp(getPlacementScale() + (event.deltaY > 0 ? -0.05 : 0.05), 0.35, 2.5);
    setPlacementScale(nextScale);
    middleScaleControl.value = nextScale.toFixed(2);
    setStatus(`Next ${state.activeLayer === "structures" ? "structure" : "water piece"} size ${nextScale.toFixed(2)}.`);
    render();
    return;
  }

  if (object) {
    if (event.ctrlKey || event.shiftKey) {
      object.scale = clamp(object.scale + (event.deltaY > 0 ? -0.05 : 0.05), 0.35, 2.5);
      setStatus(`${formatTileName(object.tile)} size ${object.scale.toFixed(2)}.`);
    } else {
      object.rotation = normalizeRadians(object.rotation + degreesToRadians(event.deltaY > 0 ? 15 : -15));
      setStatus(`${formatTileName(object.tile)} rotation ${Math.round(radiansToDegrees(object.rotation))} degrees.`);
    }
    syncMiddleControls();
    render();
    return;
  }

  cycleMiddleTile(event.deltaY > 0 ? 1 : -1);
}

function cycleMiddleTile(direction) {
  if (state.activeLayer === "structures") {
    cycleStructureVariant(direction);
    return;
  }
  const tiles = state.activeLayer === "structures" ? STRUCTURE_TILES : MIDDLE_TILES;
  const key = state.activeLayer === "structures" ? "selectedStructureTile" : "selectedMiddleTile";
  const currentIndex = tiles.indexOf(state[key]);
  const nextIndex = (currentIndex + direction + tiles.length) % tiles.length;
  state[key] = tiles[nextIndex];
  setStatus(`Placing ${formatTileName(state[key])} freely on the ${state.activeLayer === "structures" ? "structures" : "water"} layer.`);
  updateToolState();
  render();
}

function cyclePathAsset(direction) {
  const assetIds = Object.keys(PATH_ASSETS);
  const currentIndex = assetIds.indexOf(state.selectedPathAsset);
  const nextIndex = (currentIndex + direction + assetIds.length) % assetIds.length;
  const assetId = assetIds[nextIndex];
  const asset = PATH_ASSETS[assetId];
  state.selectedPathAsset = assetId;
  if (!selectedPath() && !state.pathDraft) {
    pathWidthControl.value = String(asset.width);
    pathSmoothingControl.value = String(asset.smoothing);
  }
  updateToolState();
  setStatus(`Path material: ${asset.label}.`);
  render();
}

function lerpPoint(start, end, progress) {
  return p(lerp(start.x, end.x, progress), lerp(start.y, end.y, progress));
}

function zoomAround(screenX, screenY, oldZoom, nextZoom) {
  const worldX = (screenX - state.view.x) / oldZoom;
  const worldY = (screenY - state.view.y) / oldZoom;
  state.view.x = screenX - worldX * nextZoom;
  state.view.y = screenY - worldY * nextZoom;
}

function exportImage(format) {
  const bounds = boardBounds();
  const padding = 12;
  if (!Number.isFinite(bounds.x) || !Number.isFinite(bounds.y) || bounds.width <= 0 || bounds.height <= 0) {
    setStatus("Image export failed because the map bounds are invalid. Try resizing the map or placing one biome tile.");
    return;
  }
  const requestedHexHeight = clamp(Number(exportHexHeightInput.value) || HEX_HEIGHT, MIN_EXPORT_HEX_HEIGHT, 512);
  exportHexHeightInput.value = String(requestedHexHeight);
  const scale = requestedHexHeight / HEX_HEIGHT;
  const exportWidth = Math.ceil((bounds.width + padding * 2) * scale);
  const exportHeight = Math.ceil((bounds.height + padding * 2) * scale);
  if (exportWidth > MAX_EXPORT_SIDE || exportHeight > MAX_EXPORT_SIDE || exportWidth * exportHeight > MAX_EXPORT_PIXELS) {
    setStatus(exportSizeMessage(exportWidth, exportHeight, scale));
    return;
  }

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;
  const exportCtx = exportCanvas.getContext("2d");
  if (!exportCtx) {
    setStatus("Image export failed because the browser could not create the export canvas.");
    return;
  }
  const previousCtx = ctx;

  try {
    ctx = exportCtx;
    ctx.save();
    if (format === "jpg") {
      ctx.fillStyle = "#141719";
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }
    ctx.scale(scale, scale);
    ctx.translate(-bounds.x + padding, -bounds.y + padding);
    drawMapContent({ includeSelection: false, includeEmptyHexes: false, includeShadow: false });
    ctx.restore();
  } catch (error) {
    ctx = previousCtx;
    setStatus(`Image export failed while drawing the map: ${error.message}`);
    return;
  }
  ctx = previousCtx;

  const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
  const extension = format === "jpg" ? "jpg" : "png";
  try {
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) {
          setStatus(exportSizeMessage(exportWidth, exportHeight, scale));
          return;
        }
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `world-${state.width}x${state.height}-${Math.round(HEX_HEIGHT * scale)}px.${extension}`;
        link.click();
        URL.revokeObjectURL(link.href);
        setStatus(`Exported ${exportCanvas.width} x ${exportCanvas.height} ${extension.toUpperCase()} for VTT use.`);
      },
      mimeType,
      0.92
    );
  } catch (error) {
    setStatus(exportFailureMessage(error));
  }
}

function exportWorldImage(format) {
  saveCurrentChunk();
  const chunks = Object.entries(state.worldProject.chunks);
  if (!chunks.length) {
    setStatus("No big-map chunks saved yet. Generate or save at least one chunk first.");
    return;
  }
  const parsed = chunks.map(([key, chunk]) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y, chunk };
  });
  const minChunkX = Math.min(...parsed.map((item) => item.x));
  const maxChunkX = Math.max(...parsed.map((item) => item.x));
  const minChunkY = Math.min(...parsed.map((item) => item.y));
  const maxChunkY = Math.max(...parsed.map((item) => item.y));
  const scale = clamp(Number(worldExportHexHeightInput.value) || 24, MIN_EXPORT_HEX_HEIGHT, 128) / HEX_HEIGHT;
  worldExportHexHeightInput.value = String(Math.round(HEX_HEIGHT * scale));
  const chunkStrideX = state.worldProject.chunkWidth * STEP_X;
  const chunkStrideY = state.worldProject.chunkHeight * STEP_Y;
  const chunkPixelWidth = chunkStrideX + HEX_WIDTH + ROW_OFFSET;
  const chunkPixelHeight = chunkStrideY + HEX_HEIGHT;
  const exportWidth = Math.ceil(((maxChunkX - minChunkX) * chunkStrideX + chunkPixelWidth) * scale);
  const exportHeight = Math.ceil(((maxChunkY - minChunkY) * chunkStrideY + chunkPixelHeight) * scale);
  if (exportWidth > MAX_EXPORT_SIDE || exportHeight > MAX_EXPORT_SIDE || exportWidth * exportHeight > MAX_EXPORT_PIXELS) {
    setStatus(exportSizeMessage(exportWidth, exportHeight, scale));
    return;
  }

  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = exportWidth;
  exportCanvas.height = exportHeight;
  const exportCtx = exportCanvas.getContext("2d");
  if (!exportCtx) {
    setStatus("World image export failed because the browser could not create the export canvas.");
    return;
  }

  const snapshot = captureEditorSnapshot();
  const previousCtx = ctx;
  try {
    ctx = exportCtx;
    if (format === "jpg") {
      ctx.fillStyle = "#141719";
      ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }
    for (const item of parsed) {
      restoreChunkForWorldExport(item.chunk);
      ctx.save();
      ctx.scale(scale, scale);
      ctx.translate((item.x - minChunkX) * chunkStrideX, (item.y - minChunkY) * chunkStrideY);
      drawMapContent({ includeSelection: false, includeEmptyHexes: false, includeShadow: false });
      ctx.restore();
    }
  } catch (error) {
    setStatus(`World image export failed while drawing chunks: ${error.message}`);
    return;
  } finally {
    ctx = previousCtx;
    restoreEditorSnapshot(snapshot);
  }

  const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
  const extension = format === "jpg" ? "jpg" : "png";
  try {
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) {
          setStatus(exportSizeMessage(exportWidth, exportHeight, scale));
          return;
        }
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `world-project-${parsed.length}-chunks-${Math.round(HEX_HEIGHT * scale)}px.${extension}`;
        link.click();
        URL.revokeObjectURL(link.href);
        setStatus(`Exported full world ${exportCanvas.width} x ${exportCanvas.height} ${extension.toUpperCase()} from ${parsed.length} chunks.`);
      },
      mimeType,
      0.9
    );
  } catch (error) {
    setStatus(exportFailureMessage(error));
  }
}

function captureEditorSnapshot() {
  return {
    width: state.width,
    height: state.height,
    grid: state.grid,
    climateGrid: state.climateGrid,
    middleObjects: state.middleObjects,
    rivers: state.rivers,
    roads: state.roads,
    paths: state.paths,
    nextMiddleObjectId: state.nextMiddleObjectId,
    nextRiverId: state.nextRiverId,
    nextRoadId: state.nextRoadId,
    nextPathId: state.nextPathId
  };
}

function restoreEditorSnapshot(snapshot) {
  state.width = snapshot.width;
  state.height = snapshot.height;
  state.grid = snapshot.grid;
  state.climateGrid = snapshot.climateGrid;
  state.middleObjects = snapshot.middleObjects;
  state.rivers = snapshot.rivers;
  state.roads = snapshot.roads;
  state.paths = snapshot.paths;
  state.nextMiddleObjectId = snapshot.nextMiddleObjectId;
  state.nextRiverId = snapshot.nextRiverId;
  state.nextRoadId = snapshot.nextRoadId;
  state.nextPathId = snapshot.nextPathId;
  widthInput.value = state.width;
  heightInput.value = state.height;
  mapMeta.textContent = `${state.width} x ${state.height} biome layer`;
}

function restoreChunkForWorldExport(chunk) {
  createMap(Number(chunk.width) || state.worldProject.chunkWidth, Number(chunk.height) || state.worldProject.chunkHeight, null);
  forEachCell((cell) => {
    const tile = normalizeTileName(chunk.tiles?.[cell.row]?.[cell.col] ?? null);
    cell.tile = BIOME_TILES.includes(tile) ? tile : null;
  });
  state.climateGrid = normalizeImportedClimateGrid(chunk.climateGrid);
  state.middleObjects = Array.isArray(chunk.middleObjects)
    ? chunk.middleObjects.map((object, index) => ({
        id: index + 1,
        tile: object.tile,
        layer: object.layer === "structures" ? "structures" : "middle",
        x: Number(object.x) || 0,
        y: Number(object.y) || 0,
        scale: clamp(Number(object.scale) || 1, 0.35, 2.5),
        rotation: Number(object.rotation) || 0
      }))
    : [];
  state.rivers = Array.isArray(chunk.rivers)
    ? chunk.rivers.map((river, index) => ({
        id: index + 1,
        points: river.points.map((point) => p(Number(point.x) || 0, Number(point.y) || 0)),
        startWidth: clamp(Number(river.startWidth) || 34, 8, 80),
        endWidth: clamp(Number(river.endWidth) || RIVER_END_WIDTH, 2, 20),
        seed: Number(river.seed) || Math.random(),
        mouthType: river.mouthType === "ocean" ? "ocean" : river.mouthType === "lake" ? "lake" : null
      }))
    : [];
  state.roads = Array.isArray(chunk.roads)
    ? chunk.roads.map((road, index) => ({
        id: index + 1,
        type: road.type === "street" ? "street" : "dirt",
        points: road.points.map((point) => p(Number(point.x) || 0, Number(point.y) || 0)),
        width: clamp(Number(road.width) || 18, 8, 48)
      }))
    : [];
  state.paths = Array.isArray(chunk.paths)
    ? chunk.paths
        .filter((path) => PATH_ASSETS[path.assetId] && Array.isArray(path.points) && path.points.length >= 2)
        .map((path, index) => ({ ...normalizeImportedPath(path), id: index + 1 }))
    : [];
}

function exportSizeMessage(width, height, scale) {
  const sideRatio = Math.min(MAX_EXPORT_SIDE / Math.max(width, 1), MAX_EXPORT_SIDE / Math.max(height, 1));
  const pixelRatio = Math.sqrt(MAX_EXPORT_PIXELS / Math.max(1, width * height));
  const safeRatio = Math.min(sideRatio, pixelRatio, 1);
  const suggestedHexHeight = Math.max(MIN_EXPORT_HEX_HEIGHT, Math.floor(HEX_HEIGHT * scale * safeRatio));
  const farAwayHint = suggestedHexHeight <= MIN_EXPORT_HEX_HEIGHT
    ? " If it still fails at that size, one free object/path point is probably very far away from the map."
    : "";
  return `Image export is too large at ${width} x ${height}. Lower Hex Height Pixels to about ${suggestedHexHeight}.${farAwayHint}`;
}

function exportFailureMessage(error) {
  if (window.location.protocol === "file:") {
    return `Image export failed: ${error.message}. Open the builder through a local server, then refresh and export again.`;
  }
  return `Image export failed: ${error.message}. Try lowering Hex Height Pixels or exporting PNG.`;
}

function handlePathKey(event) {
  if (event.key === "Escape") {
    if (state.pathDraft) {
      state.pathDraft = null;
      setStatus("Canceled path drawing.");
      render();
    }
    return;
  }

  if (event.key === "Enter") {
    if (state.pathDraft) {
      event.preventDefault();
      finishPathAt(state.pathDraft.previewPoint || state.pathDraft.points[state.pathDraft.points.length - 1]);
      render();
    }
    return;
  }

  if (event.key !== "Delete" && event.key !== "Backspace") {
    return;
  }
  event.preventDefault();
  if (state.pathDraft) {
    state.pathDraft.points.pop();
    if (!state.pathDraft.points.length) {
      state.pathDraft = null;
      setStatus("Canceled path drawing.");
    } else {
      setStatus(`${state.pathDraft.points.length} path points. Right-click or Enter to finish.`);
    }
    render();
    return;
  }

  const path = selectedPath();
  if (!path) {
    return;
  }
  if (state.selectedPathPointIndex !== null && path.points.length > (path.closed ? 3 : 2)) {
    path.points.splice(state.selectedPathPointIndex, 1);
    state.selectedPathPointIndex = null;
    path.updatedAt = Date.now();
    setStatus("Removed path point.");
    render();
    return;
  }
  deletePath(path.id);
  setStatus("Removed selected path.");
  render();
}

function currentChunkData() {
  return {
    width: state.width,
    height: state.height,
    tiles: state.grid.map((row) => row.map((cell) => cell.tile)),
    climateGrid: state.climateGrid,
    middleObjects: state.middleObjects.map((object) => ({
      id: object.id,
      tile: object.tile,
      layer: object.layer || "middle",
      x: object.x,
      y: object.y,
      scale: object.scale,
      rotation: object.rotation,
      generatedCell: object.generatedCell ? { row: object.generatedCell.row, col: object.generatedCell.col } : null,
      kind: object.kind,
      nameKind: object.nameKind,
      name: object.name
    })),
    rivers: state.rivers.map((river) => ({
      points: river.points,
      startWidth: river.startWidth,
      endWidth: river.endWidth,
      seed: river.seed,
      mouthType: river.mouthType || null
    })),
    roads: state.roads.map((road) => ({
      type: road.type,
      points: road.points,
      width: road.width
    })),
    paths: state.paths.map((path) => ({
      type: "path",
      assetId: path.assetId,
      generatedOceanRim: Boolean(path.generatedOceanRim),
      points: path.points,
      closed: path.closed,
      width: path.width,
      smoothing: path.smoothing,
      layer: path.layer,
      opacity: path.opacity,
      tint: path.tint,
      capStart: path.capStart,
      capEnd: path.capEnd,
      joinStyle: path.joinStyle,
      textureMode: path.textureMode,
      textureScale: path.textureScale,
      textureOffset: path.textureOffset,
      createdAt: path.createdAt,
      updatedAt: path.updatedAt
    }))
  };
}

function saveCurrentChunk() {
  if (state.generatorMode !== "big") {
    return;
  }
  const key = chunkKey(state.worldProject.currentX, state.worldProject.currentY);
  state.worldProject.chunkWidth = state.width;
  state.worldProject.chunkHeight = state.height;
  state.worldProject.chunks[key] = JSON.parse(JSON.stringify(currentChunkData()));
}

function restoreChunk(chunk) {
  createMap(Number(chunk.width) || state.worldProject.chunkWidth, Number(chunk.height) || state.worldProject.chunkHeight, null);
  forEachCell((cell) => {
    const tile = normalizeTileName(chunk.tiles?.[cell.row]?.[cell.col] ?? null);
    cell.tile = BIOME_TILES.includes(tile) ? tile : null;
  });
  state.climateGrid = normalizeImportedClimateGrid(chunk.climateGrid);
  state.middleObjects = Array.isArray(chunk.middleObjects)
    ? chunk.middleObjects
        .filter((object) => MIDDLE_TILES.includes(object.tile) || STRUCTURE_TILES.includes(object.tile))
        .map((object) => ({
          id: state.nextMiddleObjectId++,
          tile: object.tile,
          layer: object.layer === "structures" ? "structures" : "middle",
          x: Number(object.x) || 0,
          y: Number(object.y) || 0,
          scale: clamp(Number(object.scale) || 1, 0.35, 2.5),
          rotation: Number(object.rotation) || 0
        }))
    : [];
  state.rivers = Array.isArray(chunk.rivers)
    ? chunk.rivers
        .filter((river) => Array.isArray(river.points) && river.points.length >= 2)
        .map((river) => ({
          id: state.nextRiverId++,
          points: river.points.map((point) => p(Number(point.x) || 0, Number(point.y) || 0)),
          startWidth: clamp(Number(river.startWidth) || 34, 8, 80),
          endWidth: clamp(Number(river.endWidth) || RIVER_END_WIDTH, 2, 20),
          seed: Number(river.seed) || Math.random(),
          mouthType: river.mouthType === "ocean" ? "ocean" : river.mouthType === "lake" ? "lake" : null
        }))
    : [];
  state.roads = Array.isArray(chunk.roads)
    ? chunk.roads
        .filter((road) => Array.isArray(road.points) && road.points.length >= 2)
        .map((road) => ({
          id: state.nextRoadId++,
          type: road.type === "street" ? "street" : "dirt",
          points: road.points.map((point) => p(Number(point.x) || 0, Number(point.y) || 0)),
          width: clamp(Number(road.width) || 18, 8, 48)
        }))
    : [];
  state.paths = Array.isArray(chunk.paths)
    ? chunk.paths
        .filter((path) => PATH_ASSETS[path.assetId] && Array.isArray(path.points) && path.points.length >= 2)
        .map((path) => normalizeImportedPath(path))
    : [];
  state.selectedMiddleObjectId = null;
  state.selectedRiverId = null;
  state.selectedRoadId = null;
  state.selectedPathId = null;
  state.selectedPathPointIndex = null;
}

function exportMap() {
  saveCurrentChunk();
  const data = {
    version: 3,
    type: "hexagonalworldbuilder.biome-map",
    generatorMode: state.generatorMode,
    bigMapProject: state.worldProject,
    width: state.width,
    height: state.height,
    tiles: state.grid.map((row) => row.map((cell) => cell.tile)),
    climateGrid: state.climateGrid,
    middleObjects: state.middleObjects.map((object) => ({
      tile: object.tile,
      layer: object.layer || "middle",
      x: object.x,
      y: object.y,
      scale: object.scale,
      rotation: object.rotation
    })),
    rivers: state.rivers.map((river) => ({
      points: river.points,
      startWidth: river.startWidth,
      endWidth: river.endWidth,
      seed: river.seed
    })),
    roads: state.roads.map((road) => ({
      type: road.type,
      points: road.points,
      width: road.width
    })),
    paths: state.paths.map((path) => ({
      id: path.id,
      type: "path",
      assetId: path.assetId,
      points: path.points,
      closed: path.closed,
      width: path.width,
      smoothing: path.smoothing,
      layer: path.layer,
      opacity: path.opacity,
      tint: path.tint,
      capStart: path.capStart,
      capEnd: path.capEnd,
      joinStyle: path.joinStyle,
      textureMode: path.textureMode,
      textureScale: path.textureScale,
      textureOffset: path.textureOffset,
      createdAt: path.createdAt,
      updatedAt: path.updatedAt
    }))
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `world-${state.width}x${state.height}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  setStatus("Exported map JSON.");
}

function importMap(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.tiles) || !data.width || !data.height) {
        throw new Error("Invalid map file.");
      }
      if (data.bigMapProject) {
        state.worldProject = normalizeImportedWorldProject(data.bigMapProject);
        state.generatorMode = data.generatorMode === "big" ? "big" : "single";
      }
      createMap(Number(data.width), Number(data.height), null);
      forEachCell((cell) => {
        const tile = normalizeTileName(data.tiles[cell.row]?.[cell.col] ?? null);
        cell.tile = BIOME_TILES.includes(tile) ? tile : null;
      });
      state.climateGrid = normalizeImportedClimateGrid(data.climateGrid);
      state.middleObjects = Array.isArray(data.middleObjects)
        ? data.middleObjects
            .filter((object) => MIDDLE_TILES.includes(object.tile) || STRUCTURE_TILES.includes(object.tile))
            .map((object) => ({
              id: state.nextMiddleObjectId++,
              tile: object.tile,
              layer: object.layer === "structures" ? "structures" : "middle",
              x: Number(object.x) || 0,
              y: Number(object.y) || 0,
              scale: clamp(Number(object.scale) || 1, 0.35, 2.5),
              rotation: Number(object.rotation) || 0
            }))
        : [];
      state.rivers = Array.isArray(data.rivers)
        ? data.rivers
            .filter((river) => Array.isArray(river.points) && river.points.length >= 2)
            .map((river) => ({
              id: state.nextRiverId++,
              points: river.points.map((point) => p(Number(point.x) || 0, Number(point.y) || 0)),
              startWidth: clamp(Number(river.startWidth) || 34, 8, 80),
              endWidth: clamp(Number(river.endWidth) || RIVER_END_WIDTH, 2, 20),
              seed: Number(river.seed) || Math.random(),
              mouthType: river.mouthType === "ocean" ? "ocean" : river.mouthType === "lake" ? "lake" : null
            }))
        : [];
      state.roads = Array.isArray(data.roads)
        ? data.roads
            .filter((road) => Array.isArray(road.points) && road.points.length >= 2)
            .map((road) => ({
              id: state.nextRoadId++,
              type: road.type === "street" ? "street" : "dirt",
              points: road.points.map((point) => p(Number(point.x) || 0, Number(point.y) || 0)),
              width: clamp(Number(road.width) || 18, 8, 48)
            }))
        : [];
      state.paths = Array.isArray(data.paths)
        ? data.paths
            .filter((path) => PATH_ASSETS[path.assetId] && Array.isArray(path.points) && path.points.length >= 2)
            .map((path) => normalizeImportedPath(path))
        : [];
      state.selectedMiddleObjectId = null;
      state.selectedRiverId = null;
      state.selectedRoadId = null;
      state.selectedPathId = null;
      state.selectedPathPointIndex = null;
      state.riverDraft = null;
      state.roadDraft = null;
      state.pathDraft = null;
      syncMiddleControls();
      setGeneratorMode(state.generatorMode);
      chunkXInput.value = String(state.worldProject.currentX);
      chunkYInput.value = String(state.worldProject.currentY);
      centerMap();
      render();
      setStatus("Imported map JSON.");
    } catch (error) {
      setStatus(error.message);
    } finally {
      event.target.value = "";
    }
  };
  reader.readAsText(file);
}

function normalizeImportedPath(path) {
  const asset = PATH_ASSETS[path.assetId] || PATH_ASSETS.dirtroad;
  const now = Date.now();
  return {
    id: state.nextPathId++,
    type: "path",
    assetId: path.assetId,
    generatedOceanRim: Boolean(path.generatedOceanRim),
    points: path.points.map((point) => p(Number(point.x) || 0, Number(point.y) || 0)),
    closed: Boolean(path.closed),
    width: clamp(Number(path.width) || asset.width, 4, 160),
    smoothing: clamp(Number(path.smoothing) || 0, 0, 1),
    layer: Number(path.layer) || 2,
    opacity: clamp(Number(path.opacity) || 1, 0.05, 1),
    tint: path.tint || null,
    capStart: path.capStart || asset.cap || "round",
    capEnd: path.capEnd || asset.cap || "round",
    joinStyle: path.joinStyle || asset.join || "round",
    textureMode: path.textureMode || asset.textureMode || "tile",
    textureScale: Number(path.textureScale) || asset.textureScale || 160,
    textureOffset: Number(path.textureOffset) || 0,
    createdAt: Number(path.createdAt) || now,
    updatedAt: Number(path.updatedAt) || now
  };
}

function normalizeImportedClimateGrid(climateGrid) {
  if (!Array.isArray(climateGrid) || climateGrid.length !== state.height) {
    return [];
  }
  const rows = climateGrid.map((row) => {
    if (!Array.isArray(row) || row.length !== state.width) {
      return null;
    }
    return row.map((cell) => ({
      temperature: clamp(Number(cell?.temperature) || 0, 0, 1),
      moisture: clamp(Number(cell?.moisture) || 0, 0, 1)
    }));
  });
  return rows.includes(null) ? [] : rows;
}

function normalizeImportedWorldProject(project) {
  const fallback = createWorldProject();
  const normalized = {
    chunkWidth: clamp(Number(project.chunkWidth) || DEFAULT_WIDTH, 1, 40),
    chunkHeight: clamp(Number(project.chunkHeight) || DEFAULT_HEIGHT, 1, 40),
    currentX: Number(project.currentX) || 0,
    currentY: Number(project.currentY) || 0,
    chunks: {},
    oceanDecisions: {},
    temperature: normalizeWorldClimateParams(project.temperature, fallback.temperature),
    moisture: normalizeWorldClimateParams(project.moisture, fallback.moisture),
    elevation: normalizeWorldElevationParams(project.elevation, fallback.elevation)
  };
  if (project.chunks && typeof project.chunks === "object") {
    for (const [key, chunk] of Object.entries(project.chunks)) {
      if (chunk && Array.isArray(chunk.tiles)) {
        normalized.chunks[key] = chunk;
      }
    }
  }
  if (project.oceanDecisions && typeof project.oceanDecisions === "object") {
    for (const [key, value] of Object.entries(project.oceanDecisions)) {
      if (/^-?\d+,-?\d+$/.test(key) && typeof value === "boolean") {
        normalized.oceanDecisions[key] = value;
      }
    }
  }
  return normalized;
}

function normalizeWorldClimateParams(params, fallback) {
  return {
    center: clamp(Number(params?.center) || fallback.center, 0, 1),
    angle: Number(params?.angle) || fallback.angle,
    phaseA: Number(params?.phaseA) || fallback.phaseA,
    phaseB: Number(params?.phaseB) || fallback.phaseB,
    scale: clamp(Number(params?.scale) || fallback.scale, 4, 50)
  };
}

function normalizeWorldElevationParams(params, fallback) {
  return {
    ridgeAngle: Number(params?.ridgeAngle) || fallback.ridgeAngle,
    phaseA: Number(params?.phaseA) || fallback.phaseA,
    phaseB: Number(params?.phaseB) || fallback.phaseB,
    scale: clamp(Number(params?.scale) || fallback.scale, 4, 50)
  };
}

function updateToolState() {
  document.querySelectorAll(".tool").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.tool === state.tool);
  });
  document.querySelector("#riverTool").classList.toggle("is-active", state.activeLayer === "middle" && state.tool === "river");
  document.querySelectorAll(".road-tool").forEach((button) => {
    button.classList.toggle("is-active", state.activeLayer === "middle" && state.tool === "road" && button.dataset.roadType === state.selectedRoadType);
  });
  document.querySelectorAll(".layer-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.layer === state.activeLayer);
  });
  document.querySelectorAll(".layer-panel").forEach((panel) => {
    panel.classList.toggle("is-hidden", panel.dataset.layerPanel !== state.activeLayer);
  });
  document.querySelectorAll(".tile-choice").forEach((button) => {
    const group = BIOME_GROUPS[button.dataset.group];
    if (button.dataset.group) {
      button.classList.toggle("is-active", button.dataset.group === state.selectedGroup && state.activeLayer === "biome");
    }
    if (group) {
      button.querySelector("img").src = `${TILE_BASE}${group.current}.png`;
    }
  });
  document.querySelectorAll(".middle-choice").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.middleTile === state.selectedMiddleTile && state.activeLayer === "middle");
  });
  document.querySelectorAll(".structure-choice").forEach((button) => {
    const group = STRUCTURE_GROUPS[button.dataset.structureGroup];
    button.classList.toggle("is-active", button.dataset.structureGroup === state.selectedStructureGroup && state.activeLayer === "structures");
    if (group) {
      button.querySelector("img").src = `${MIDDLE_TILE_BASE}${group.current}.png`;
    }
  });
  document.querySelectorAll(".path-choice").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.pathAsset === state.selectedPathAsset && state.activeLayer === "paths");
  });
  document.querySelector("#togglePathClosed").classList.toggle("is-active", Boolean((state.pathDraft && state.pathDraft.closed) || (selectedPath() && selectedPath().closed)));
  syncMiddleControls();
  syncPathControls();
}

function layerStatus() {
  if (state.activeLayer === "middle") {
    return "Water/Road layer: place lakes, draw rivers and roads, or select and move existing pieces.";
  }
  if (state.activeLayer === "paths") {
    return "Paths layer: pick a texture, click points, right-click or Enter to finish, then drag paths or points to edit.";
  }
  if (state.activeLayer === "structures") {
    return "Structures layer: place, select, drag, rotate, and scale structure pieces.";
  }
  return `Painting ${formatTileName(state.selectedTile)}.`;
}

function syncMiddleControls() {
  const object = selectedMiddleObject();
  const canUsePlacementDefaults = state.tool === "paint" && (state.activeLayer === "middle" || state.activeLayer === "structures");
  const disabled = !object && !canUsePlacementDefaults;
  middleScaleControl.disabled = disabled;
  middleRotationControl.disabled = disabled;
  document.querySelector("#rotateLeft").disabled = !object;
  document.querySelector("#rotateRight").disabled = !object;

  if (!object) {
    if (canUsePlacementDefaults) {
      middleScaleControl.value = String(getPlacementScale());
      middleRotationControl.value = String(Math.round(radiansToDegrees(getPlacementRotation())));
    }
    return;
  }

  middleScaleControl.value = String(object.scale);
  middleRotationControl.value = String(Math.round(radiansToDegrees(object.rotation)));
}

function getPlacementScale(layer = state.activeLayer) {
  return layer === "structures" ? state.structurePlacementScale : state.middlePlacementScale;
}

function setPlacementScale(scale, layer = state.activeLayer) {
  const nextScale = clamp(Number(scale) || 1, 0.35, 2.5);
  if (layer === "structures") {
    state.structurePlacementScale = nextScale;
  } else {
    state.middlePlacementScale = nextScale;
  }
}

function getPlacementRotation(layer = state.activeLayer) {
  return layer === "structures" ? state.structurePlacementRotation : state.middlePlacementRotation;
}

function setPlacementRotation(rotation, layer = state.activeLayer) {
  if (layer === "structures") {
    state.structurePlacementRotation = normalizeRadians(rotation);
  } else {
    state.middlePlacementRotation = normalizeRadians(rotation);
  }
}

function syncPathControls() {
  const path = selectedPath();
  const asset = PATH_ASSETS[state.selectedPathAsset] || PATH_ASSETS.dirtroad;
  if (path) {
    pathWidthControl.value = String(path.width);
    pathSmoothingControl.value = String(path.smoothing);
    return;
  }
  if (!state.pathDraft) {
    pathWidthControl.value = String(asset.width);
    pathSmoothingControl.value = String(asset.smoothing);
  }
}

function setStatus(message) {
  statusText.textContent = message;
}

function p(x, y) {
  return { x, y };
}

function climate(temperature, moisture) {
  return { temperature, moisture };
}

function createWorldProject() {
  return {
    chunkWidth: DEFAULT_WIDTH,
    chunkHeight: DEFAULT_HEIGHT,
    currentX: 0,
    currentY: 0,
    chunks: {},
    oceanDecisions: {},
    temperature: createWorldClimateParams(),
    moisture: createWorldClimateParams(),
    elevation: createWorldElevationParams()
  };
}

function createWorldClimateParams() {
  return {
    center: randomRange(0.42, 0.58),
    angle: Math.random() * Math.PI * 2,
    phaseA: Math.random() * Math.PI * 2,
    phaseB: Math.random() * Math.PI * 2,
    scale: randomRange(9, 16)
  };
}

function createWorldElevationParams() {
  return {
    ridgeAngle: Math.random() * Math.PI * 2,
    phaseA: Math.random() * Math.PI * 2,
    phaseB: Math.random() * Math.PI * 2,
    scale: randomRange(7, 13)
  };
}

function chunkKey(x, y) {
  return `${x},${y}`;
}

function crop(x, y, width, height) {
  return { x, y, width, height };
}

function expandedCrop(source, image) {
  const growX = source.width * CROP_OVERSCAN;
  const growY = source.height * CROP_OVERSCAN;
  const x = clamp(source.x + growX, 0, image.naturalWidth - 1);
  const y = clamp(source.y + growY, 0, image.naturalHeight - 1);
  const right = clamp(source.x + source.width - growX, x + 1, image.naturalWidth);
  const bottom = clamp(source.y + source.height - growY, y + 1, image.naturalHeight);
  return crop(x, y, right - x, bottom - y);
}

function buildBiomeGroups() {
  const groups = {};
  for (const tile of BIOME_TILES) {
    const name = groupNameFor(tile);
    if (!groups[name]) {
      groups[name] = { name, variants: [], current: tile };
    }
    groups[name].variants.push(tile);
  }

  for (const group of Object.values(groups)) {
    group.variants.sort((a, b) => {
      const representative = GROUP_REPRESENTATIVES[group.name] || group.name;
      if (a === representative) return -1;
      if (b === representative) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
    group.current = group.variants[0];
  }

  return Object.fromEntries(
    Object.values(groups)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((group) => [group.name, group])
  );
}

function buildStructureGroups() {
  const groups = {};
  for (const tile of STRUCTURE_TILES) {
    const name = structureGroupNameFor(tile);
    if (!groups[name]) {
      groups[name] = { name, variants: [], current: tile };
    }
    groups[name].variants.push(tile);
  }

  for (const group of Object.values(groups)) {
    group.variants.sort((a, b) => {
      if (a === group.name) return -1;
      if (b === group.name) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
    group.current = group.variants[0];
  }

  return Object.fromEntries(
    Object.values(groups)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((group) => [group.name, group])
  );
}

function groupNameFor(tile) {
  if (!tile) {
    return "";
  }
  if (GROUP_OVERRIDES[tile]) {
    return GROUP_OVERRIDES[tile];
  }
  return tile.includes("_") ? tile.split("_")[0] : tile;
}

function structureGroupNameFor(tile) {
  if (!tile) {
    return "";
  }
  return tile.includes("_") ? tile.split("_")[0] : tile;
}

function selectGroup(groupName) {
  const group = BIOME_GROUPS[groupName];
  if (!group) {
    return;
  }
  state.selectedGroup = groupName;
  state.selectedTile = group.current;
}

function cycleVariant(direction) {
  const group = BIOME_GROUPS[state.selectedGroup];
  if (!group || group.variants.length < 2) {
    return false;
  }

  const currentIndex = group.variants.indexOf(state.selectedTile);
  const nextIndex = (currentIndex + direction + group.variants.length) % group.variants.length;
  group.current = group.variants[nextIndex];
  state.selectedTile = group.current;
  setStatus(`Painting ${formatTileName(state.selectedTile)}.`);
  updateToolState();
  return true;
}

function selectStructureGroup(groupName) {
  const group = STRUCTURE_GROUPS[groupName];
  if (!group) {
    return;
  }
  state.selectedStructureGroup = groupName;
  state.selectedStructureTile = group.current;
}

function cycleStructureVariant(direction) {
  const group = STRUCTURE_GROUPS[state.selectedStructureGroup];
  if (!group || group.variants.length < 2) {
    setStatus(`Placing ${formatTileName(state.selectedStructureTile)} freely on the structures layer.`);
    render();
    return;
  }

  const currentIndex = group.variants.indexOf(state.selectedStructureTile);
  const nextIndex = (currentIndex + direction + group.variants.length) % group.variants.length;
  group.current = group.variants[nextIndex];
  state.selectedStructureTile = group.current;
  setStatus(`Structure variant: ${formatTileName(state.selectedStructureTile)}.`);
  updateToolState();
  render();
}

function builderSeededRandom(seed = "hex-world") {
  let value = 2166136261;
  const text = String(seed);
  for (let index = 0; index < text.length; index += 1) {
    value ^= text.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function withBuilderSeed(seed, callback) {
  const originalRandom = Math.random;
  Math.random = builderSeededRandom(seed);
  try {
    return callback();
  } finally {
    Math.random = originalRandom;
  }
}

function generateBigWorldChunkForGame(options = {}) {
  const seed = String(options.seed ?? "depthbound-world");
  const chunkX = Math.floor(Number(options.chunkX) || 0);
  const chunkY = Math.floor(Number(options.chunkY) || 0);
  const width = clamp(Number(options.chunkWidth) || DEFAULT_WIDTH, 1, 40);
  const height = clamp(Number(options.chunkHeight) || DEFAULT_HEIGHT, 1, 40);
  const project = options.project ? normalizeImportedWorldProject(options.project) : withBuilderSeed(`${seed}:project`, () => createWorldProject());
  project.chunkWidth = width;
  project.chunkHeight = height;
  state.generatorMode = "big";
  state.worldProject = project;
  state.worldProject.currentX = chunkX;
  state.worldProject.currentY = chunkY;
  createMap(width, height, null);
  withBuilderSeed(`${seed}:chunk:${chunkKey(chunkX, chunkY)}`, () => generateCurrentChunk());
  const key = chunkKey(chunkX, chunkY);
  return {
    seed,
    chunkX,
    chunkY,
    chunkKey: key,
    project: JSON.parse(JSON.stringify(state.worldProject)),
    chunk: JSON.parse(JSON.stringify(state.worldProject.chunks[key] ?? currentChunkData()))
  };
}

window.HexagonalWorldBuilder = {
  ...(window.HexagonalWorldBuilder ?? {}),
  generateBigWorldChunkForGame
};

function formatTileName(tile) {
  return tile.replaceAll("_", " ");
}

function normalizeTileName(tile) {
  if (tile === "beach") {
    return "coast_beach";
  }
  if (tile === "coast_beach1") {
    return "coast_beach";
  }
  if (tile === "coast_rocky1") {
    return "coast_rocky";
  }
  if (tile === "cave_msuhroom") {
    return "cave_underdark";
  }
  if (tile === "crystafield") {
    return "crystalfield";
  }
  if (tile === "forest") {
    return "forest_normal";
  }
  if (tile === "jungle") {
    return "forest_jungle";
  }
  return tile;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function radiansToDegrees(radians) {
  return (radians * 180) / Math.PI;
}

function normalizeRadians(radians) {
  let degrees = radiansToDegrees(radians);
  while (degrees > 180) degrees -= 360;
  while (degrees < -180) degrees += 360;
  return degreesToRadians(degrees);
}

const hexagonalWorldBuilderReady = boot().then(() => true);
window.HexagonalWorldBuilder.ready = hexagonalWorldBuilderReady;
window.addEventListener("message", async (event) => {
  const data = event.data ?? {};
  if (data.type !== "depthbound-builder-generate") return;
  const targetOrigin = event.origin && event.origin !== "null" ? event.origin : "*";
  try {
    await window.HexagonalWorldBuilder.ready;
    const result = generateBigWorldChunkForGame(data.options ?? {});
    event.source?.postMessage({ type: "depthbound-builder-result", requestId: data.requestId, result }, targetOrigin);
  } catch (error) {
    event.source?.postMessage({ type: "depthbound-builder-result", requestId: data.requestId, error: error?.message ?? "World generation failed." }, targetOrigin);
  }
});
hexagonalWorldBuilderReady.catch((error) => {
  setStatus(`Could not start builder: ${error.message}`);
});
