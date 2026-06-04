(() => {
const shapeTypes = ["rectangle", "square", "l", "t"];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function key(position) {
  return `${position.x},${position.y}`;
}

function makeShapeCells(shape, width, height) {
  const cells = [];
  const radiusX = (width - 1) / 2;
  const radiusY = (height - 1) / 2;
  const centerX = radiusX;
  const centerY = radiusY;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let include = true;

      if (shape === "circle") {
        const normalizedX = radiusX > 0 ? (x - centerX) / radiusX : 0;
        const normalizedY = radiusY > 0 ? (y - centerY) / radiusY : 0;
        include = normalizedX * normalizedX + normalizedY * normalizedY <= 1.08;
      }

      if (shape === "l") {
        include = x < Math.ceil(width * 0.48) || y >= Math.floor(height * 0.52);
      }

      if (shape === "t") {
        include = y < Math.ceil(height * 0.38) || Math.abs(x - Math.floor(width / 2)) <= 1;
      }

      if (include) cells.push({ x, y });
    }
  }

  return cells;
}

function rangeValue(range, fallbackMin, fallbackMax) {
  const min = range?.min ?? fallbackMin;
  const max = range?.max ?? fallbackMax;
  return randomInt(min, max);
}

function pick(values, fallback) {
  if (!Array.isArray(values) || values.length === 0) return fallback;
  return values[randomInt(0, values.length - 1)];
}

function makeRoom(id, x, y, options = {}, shape = pick(options.roomShapes, shapeTypes[randomInt(0, shapeTypes.length - 1)])) {
  const width = shape === "square" ? rangeValue(options.squareSize, 5, 8) : rangeValue(options.roomWidth, 5, 11);
  const height = shape === "square" ? width : rangeValue(options.roomHeight, 5, 10);
  const cells = makeShapeCells(shape, width, height).map((cell) => ({ x: x + cell.x, y: y + cell.y }));

  return {
    id: `room-${id}`,
    name: id === 0 ? "Entrance Hall" : `Dungeon Room ${id + 1}`,
    shape,
    x,
    y,
    width,
    height,
    cells,
    doors: [],
    connections: [],
  };
}

function center(room) {
  const total = room.cells.reduce((sum, cell) => ({ x: sum.x + cell.x, y: sum.y + cell.y }), { x: 0, y: 0 });
  return {
    x: Math.round(total.x / room.cells.length),
    y: Math.round(total.y / room.cells.length),
  };
}

function roomHasCell(room, position) {
  return room.cells.some((cell) => cell.x === position.x && cell.y === position.y);
}

function roomCellSet(room) {
  return new Set(room.cells.map(key));
}

function adjacentCells(position) {
  return [
    { x: position.x, y: position.y - 1 },
    { x: position.x + 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x - 1, y: position.y },
  ];
}

function manhattan(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function overlaps(room, rooms, padding = 2) {
  const occupied = new Set();
  for (const existing of rooms) {
    for (const cell of existing.cells) {
      for (let y = cell.y - padding; y <= cell.y + padding; y += 1) {
        for (let x = cell.x - padding; x <= cell.x + padding; x += 1) {
          occupied.add(key({ x, y }));
        }
      }
    }
  }

  return room.cells.some((cell) => occupied.has(key(cell)));
}

function overlapsCorridors(room, corridors, padding = 1) {
  const occupied = new Set();
  for (const cell of corridors) {
    for (let y = cell.y - padding; y <= cell.y + padding; y += 1) {
      for (let x = cell.x - padding; x <= cell.x + padding; x += 1) {
        occupied.add(key({ x, y }));
      }
    }
  }

  return room.cells.some((cell) => occupied.has(key(cell)));
}

function isInBounds(room, gridSize) {
  return room.cells.every((cell) => cell.x > 1 && cell.y > 1 && cell.x < gridSize - 2 && cell.y < gridSize - 2);
}

function carvePath(start, end, style = "horizontal-first") {
  const cells = [];
  let x = start.x;
  let y = start.y;
  const horizontalFirst = style === "random-bend" ? Math.random() < 0.5 : style !== "vertical-first";

  const stepX = () => {
    while (x !== end.x) {
      cells.push({ x, y });
      x += Math.sign(end.x - x);
    }
  };
  const stepY = () => {
    while (y !== end.y) {
      cells.push({ x, y });
      y += Math.sign(end.y - y);
    }
  };

  if (horizontalFirst) {
    stepX();
    stepY();
  } else {
    stepY();
    stepX();
  }

  cells.push({ x, y });
  return cells;
}

function widenPath(cells, width = 1) {
  const corridorWidth = Math.max(1, Math.floor(width));
  const widened = new Map();
  for (let index = 0; index < cells.length; index += 1) {
    const cell = cells[index];
    const previous = cells[index - 1] ?? cell;
    const next = cells[index + 1] ?? cell;
    const horizontal = Math.abs(next.x - previous.x) >= Math.abs(next.y - previous.y);
    for (let offset = 0; offset < corridorWidth; offset += 1) {
      const sideOffset = offset - Math.floor(corridorWidth / 2);
      const widenedCell = horizontal ? { x: cell.x, y: cell.y + sideOffset } : { x: cell.x + sideOffset, y: cell.y };
      widened.set(key(widenedCell), widenedCell);
    }
  }
  return Array.from(widened.values());
}

function edgeKey(a, b) {
  return [key(a), key(b)].sort().join("|");
}

function makeCorridorPassage(id, cells) {
  const edges = [];
  for (let index = 1; index < cells.length; index += 1) {
    edges.push(edgeKey(cells[index - 1], cells[index]));
  }

  return {
    id: `corridor-${id}`,
    cells: cells.map((cell) => ({ ...cell })),
    edges,
  };
}

function nearestBoundaryDoor(room, target) {
  const cells = roomCellSet(room);
  const candidates = [];

  for (const cell of room.cells) {
    for (const outside of adjacentCells(cell)) {
      if (!cells.has(key(outside))) {
        candidates.push({ door: cell, outside });
      }
    }
  }

  return candidates.sort((a, b) => manhattan(a.outside, target) - manhattan(b.outside, target))[0];
}

function pathCutsThroughRoom(path, rooms) {
  const roomCells = new Set(rooms.flatMap((room) => room.cells.map(key)));
  return path.some((cell) => roomCells.has(key(cell)));
}

function hasCorridorExit(door, corridorKeys) {
  return adjacentCells(door).some((cell) => corridorKeys.has(key(cell)));
}

function pruneDanglingDoors(rooms, corridors) {
  const roomById = new Map(rooms.map((room) => [room.id, room]));
  const corridorKeys = new Set(corridors.map(key));

  for (const room of rooms) {
    room.doors = room.doors.filter((door) => {
      const target = roomById.get(door.to);
      if (!target || !hasCorridorExit(door, corridorKeys)) return false;

      return target.doors.some(
        (targetDoor) => targetDoor.to === room.id && hasCorridorExit(targetDoor, corridorKeys),
      );
    });
    room.connections = room.doors.map((door) => door.to);
  }
}

function connectRooms(a, b, corridors, rooms, options = {}) {
  const aConnection = nearestBoundaryDoor(a, center(b));
  const bConnection = nearestBoundaryDoor(b, center(a));
  if (!aConnection || !bConnection) return false;

  const corridor = widenPath(
    carvePath(aConnection.outside, bConnection.outside, options.corridorStyle ?? "horizontal-first"),
    options.corridorWidth ?? 1,
  );
  if (pathCutsThroughRoom(corridor, rooms)) return false;

  const passage = makeCorridorPassage(corridors.passages.length, corridor);
  corridors.cells.push(...corridor);
  corridors.passages.push(passage);
  a.doors.push({ ...aConnection.door, corridor: { ...aConnection.outside }, to: b.id });
  b.doors.push({ ...bConnection.door, corridor: { ...bConnection.outside }, to: a.id });
  a.connections.push(b.id);
  b.connections.push(a.id);
  return true;
}

function connectLinearRooms(a, b, corridors, options = {}) {
  const aConnection = nearestBoundaryDoor(a, center(b));
  const bConnection = nearestBoundaryDoor(b, center(a));
  if (!aConnection || !bConnection) return false;

  const corridor = widenPath(
    carvePath(aConnection.outside, bConnection.outside, options.corridorStyle ?? "horizontal-first"),
    options.corridorWidth ?? 1,
  );
  const passage = makeCorridorPassage(corridors.passages.length, corridor);
  corridors.cells.push(...corridor);
  corridors.passages.push(passage);
  a.doors.push({ ...aConnection.door, corridor: { ...aConnection.outside }, to: b.id });
  b.doors.push({ ...bConnection.door, corridor: { ...bConnection.outside }, to: a.id });
  a.connections.push(b.id);
  b.connections.push(a.id);
  return true;
}

function roomStartPosition(room) {
  const firstDoor = room.doors[0] ?? center(room);
  const doorKeys = new Set((room.doors ?? []).map(key));
  const sorted = room.cells
    .slice()
    .filter((cell) => !doorKeys.has(key(cell)))
    .sort((a, b) => Math.abs(a.x - firstDoor.x) + Math.abs(a.y - firstDoor.y) - (Math.abs(b.x - firstDoor.x) + Math.abs(b.y - firstDoor.y)));
  return sorted[0] ?? center(room);
}

function estimateLinearGridSize(options = {}, roomCount = 8) {
  const baseGridSize = options.gridSize ?? 72;
  const maxWidth = options.roomWidth?.max ?? options.squareSize?.max ?? 9;
  const maxGap = options.corridorLength?.max ?? 6;
  const neededWidth = 8 + roomCount * (maxWidth + maxGap + 2);
  return Math.max(baseGridSize, Math.min(180, neededWidth));
}

function generateLinearDungeon(options = {}) {
  const roomCount = Math.max(1, Math.floor(Number(options.roomCount) || 8));
  const gridSize = estimateLinearGridSize(options, roomCount);
  const rooms = [];
  const corridors = { cells: [], passages: [] };
  const entranceShape = options.entranceShape ?? "rectangle";
  const lineOptions = {
    ...options,
    roomShapes: options.linearRoomShapes ?? options.roomShapes ?? ["rectangle", "square"],
    roomWidth: options.linearRoomWidth ?? options.roomWidth ?? { min: 5, max: 8 },
    roomHeight: options.linearRoomHeight ?? options.roomHeight ?? { min: 4, max: 7 },
    squareSize: options.linearSquareSize ?? options.squareSize ?? { min: 5, max: 7 },
    corridorStyle: "horizontal-first",
  };

  let cursorX = 3;
  const baseY = Math.floor(gridSize / 2);
  for (let index = 0; index < roomCount; index += 1) {
    const shape = index === 0 ? entranceShape : pick(lineOptions.roomShapes, "rectangle");
    const room = makeRoom(index, cursorX, baseY - 3, lineOptions, shape);
    if (!isInBounds(room, gridSize)) break;
    if (rooms.length > 0 && !connectLinearRooms(rooms[rooms.length - 1], room, corridors, lineOptions)) break;
    rooms.push(room);
    cursorX = room.x + room.width + rangeValue(options.corridorLength, 4, 7) + 2;
  }

  pruneDanglingDoors(rooms, corridors.cells);

  const walkable = new Set();
  const doors = [];
  for (const room of rooms) {
    room.cells.forEach((cell) => walkable.add(key(cell)));
    room.doors.forEach((door) => {
      walkable.add(key(door));
      doors.push({ ...door, roomId: room.id });
    });
  }
  corridors.cells.forEach((cell) => walkable.add(key(cell)));

  const entranceRoom = rooms[0];
  const entranceDoor = entranceRoom?.doors?.[0] ?? center(entranceRoom);
  const startPosition = roomStartPosition(entranceRoom);

  return {
    id: `dungeon-${Date.now()}`,
    gridSize,
    roomCount: rooms.length,
    rooms,
    corridors: corridors.cells,
    corridorPassages: corridors.passages,
    doors,
    entranceRoomId: entranceRoom.id,
    entranceDoor,
    startPosition,
    walkable: Array.from(walkable).map((cellKey) => {
      const [x, y] = cellKey.split(",").map(Number);
      return { x, y };
    }),
  };
}

function estimateBattlefieldGridSize(options = {}, roomCount = 12) {
  const baseGridSize = options.gridSize ?? 84;
  const rows = Math.max(2, Math.min(4, Math.floor(Number(options.battlefieldRows) || 3)));
  const columns = Math.ceil(roomCount / rows);
  const maxWidth = options.battlefieldRoomWidth?.max ?? options.roomWidth?.max ?? options.squareSize?.max ?? 12;
  const maxHeight = options.battlefieldRoomHeight?.max ?? options.roomHeight?.max ?? options.squareSize?.max ?? 9;
  const gapX = options.battlefieldColumnGap ?? 7;
  const gapY = options.battlefieldRowGap ?? 5;
  const neededWidth = 10 + columns * (maxWidth + gapX);
  const neededHeight = 10 + rows * (maxHeight + gapY);
  return Math.max(baseGridSize, Math.min(180, Math.max(neededWidth, neededHeight)));
}

function generateBattlefieldDungeon(options = {}) {
  const roomCount = Math.max(1, Math.floor(Number(options.roomCount) || 12));
  const rows = Math.max(2, Math.min(4, Math.floor(Number(options.battlefieldRows) || 3)));
  const columns = Math.ceil(roomCount / rows);
  const gridSize = estimateBattlefieldGridSize(options, roomCount);
  const rooms = [];
  const roomSlots = [];
  const corridors = { cells: [], passages: [] };
  const fieldOptions = {
    ...options,
    roomShapes: options.battlefieldRoomShapes ?? options.roomShapes ?? ["rectangle", "l", "t"],
    roomWidth: options.battlefieldRoomWidth ?? options.roomWidth ?? { min: 6, max: 12 },
    roomHeight: options.battlefieldRoomHeight ?? options.roomHeight ?? { min: 4, max: 8 },
    squareSize: options.battlefieldSquareSize ?? options.squareSize ?? { min: 6, max: 8 },
    corridorWidth: options.battlefieldCorridorWidth ?? options.corridorWidth ?? 2,
    corridorStyle: options.battlefieldCorridorStyle ?? options.corridorStyle ?? "horizontal-first",
  };
  const maxWidth = fieldOptions.roomWidth?.max ?? fieldOptions.squareSize?.max ?? 12;
  const maxHeight = fieldOptions.roomHeight?.max ?? fieldOptions.squareSize?.max ?? 9;
  const columnStep = maxWidth + (options.battlefieldColumnGap ?? 7);
  const rowStep = maxHeight + (options.battlefieldRowGap ?? 5);
  const startX = 3;
  const startY = Math.max(3, Math.floor(gridSize / 2) - Math.floor((rows * rowStep) / 2));

  for (let column = 0; column < columns && rooms.length < roomCount; column += 1) {
    for (let row = 0; row < rows && rooms.length < roomCount; row += 1) {
      const shape = rooms.length === 0 ? (options.entranceShape ?? "rectangle") : pick(fieldOptions.roomShapes, "rectangle");
      const stagger = row % 2 === 1 ? Math.floor(columnStep / 4) : 0;
      const x = startX + column * columnStep + stagger + randomInt(-1, 1);
      const y = startY + row * rowStep + randomInt(-1, 1);
      const room = makeRoom(rooms.length, x, y, fieldOptions, shape);
      if (!isInBounds(room, gridSize) || overlaps(room, rooms, options.roomPadding ?? 1)) continue;
      rooms.push(room);
      roomSlots.push({ room, row, column });
    }
  }

  const roomAt = (row, column) => roomSlots.find((slot) => slot.row === row && slot.column === column)?.room ?? null;
  const connectBattlefieldRooms = (a, b) => {
    if (!a || !b || a.id === b.id || a.connections.includes(b.id)) return false;
    return connectRooms(a, b, corridors, rooms, fieldOptions) || connectLinearRooms(a, b, corridors, fieldOptions);
  };
  for (const slot of roomSlots) {
    const left = roomAt(slot.row, slot.column - 1);
    if (left) connectBattlefieldRooms(left, slot.room);
    const leftFlank = roomAt(slot.row - 1, slot.column - 1) ?? roomAt(slot.row + 1, slot.column - 1);
    if (leftFlank && Math.random() < 0.55) connectBattlefieldRooms(leftFlank, slot.room);
    const sameColumnFlank = roomAt(slot.row - 1, slot.column);
    if (sameColumnFlank && Math.random() < 0.35) connectBattlefieldRooms(sameColumnFlank, slot.room);
  }

  const extraConnections = Math.floor(roomCount * (options.extraConnectionRatio ?? 0.25));
  for (let i = 0; i < extraConnections; i += 1) {
    const a = rooms[randomInt(0, rooms.length - 1)];
    const b = rooms[randomInt(0, rooms.length - 1)];
    connectBattlefieldRooms(a, b);
  }

  pruneDanglingDoors(rooms, corridors.cells);

  const walkable = new Set();
  const doors = [];
  for (const room of rooms) {
    room.cells.forEach((cell) => walkable.add(key(cell)));
    room.doors.forEach((door) => {
      walkable.add(key(door));
      doors.push({ ...door, roomId: room.id });
    });
  }
  corridors.cells.forEach((cell) => walkable.add(key(cell)));

  const entranceRoom = rooms[0];
  const entranceDoor = entranceRoom?.doors?.[0] ?? center(entranceRoom);
  const startPosition = roomStartPosition(entranceRoom);

  return {
    id: `dungeon-${Date.now()}`,
    gridSize,
    roomCount: rooms.length,
    rooms,
    corridors: corridors.cells,
    corridorPassages: corridors.passages,
    doors,
    entranceRoomId: entranceRoom.id,
    entranceDoor,
    startPosition,
    walkable: Array.from(walkable).map((cellKey) => {
      const [x, y] = cellKey.split(",").map(Number);
      return { x, y };
    }),
  };
}

function estimateTowerGridSize(options = {}, roomCount = 5) {
  const maxDiameter = options.towerRoomDiameter?.max ?? options.roomWidth?.max ?? options.squareSize?.max ?? 15;
  const gap = options.towerFloorGap ?? 4;
  const neededHeight = 8 + roomCount * (maxDiameter + gap);
  const neededWidth = 8 + maxDiameter * 2;
  return Math.max(options.gridSize ?? 72, Math.min(180, Math.max(neededWidth, neededHeight)));
}

function makeTowerRoom(id, x, y, diameter) {
  const size = Math.max(3, Math.floor(diameter));
  const cells = makeShapeCells("circle", size, size).map((cell) => ({ x: x + cell.x, y: y + cell.y }));
  return {
    id: `room-${id}`,
    name: id === 0 ? "Tower Base" : `Tower Floor ${id + 1}`,
    shape: "circle",
    x,
    y,
    width: size,
    height: size,
    cells,
    doors: [],
    connections: [],
  };
}

function generateTowerDungeon(options = {}) {
  const requestedRoomCount = Math.max(1, Math.floor(Number(options.roomCount) || 5));
  const roomCount = Math.max(
    options.towerMinRooms ?? 4,
    Math.min(options.towerMaxRooms ?? 9, requestedRoomCount),
  );
  const diameterRange = options.towerRoomDiameter ?? { min: 5, max: 15 };
  const minDiameter = Math.max(3, Math.floor(diameterRange.min ?? 5));
  const maxDiameter = Math.max(minDiameter, Math.floor(diameterRange.max ?? 15));
  const gridSize = estimateTowerGridSize(options, roomCount);
  const rooms = [];
  const walkable = new Set();
  const portalLinks = [];
  const gap = options.towerFloorGap ?? 4;
  const centerX = Math.floor(gridSize / 2);
  let cursorY = gridSize - maxDiameter - 4;

  for (let index = 0; index < roomCount; index += 1) {
    const progress = roomCount <= 1 ? 0 : index / (roomCount - 1);
    const diameter = Math.max(minDiameter, Math.round(maxDiameter - (maxDiameter - minDiameter) * progress));
    const room = makeTowerRoom(index, centerX - Math.floor(diameter / 2), cursorY, diameter);
    rooms.push(room);
    cursorY -= diameter + gap;
  }

  for (let index = 0; index < rooms.length; index += 1) {
    const room = rooms[index];
    room.cells.forEach((cell) => walkable.add(key(cell)));
    if (index > 0) room.connections.push(rooms[index - 1].id);
    if (index < rooms.length - 1) {
      room.connections.push(rooms[index + 1].id);
      portalLinks.push({ fromRoomId: room.id, toRoomId: rooms[index + 1].id });
    }
  }

  const entranceRoom = rooms[0];
  const startPosition = roomStartPosition(entranceRoom);

  return {
    id: `dungeon-${Date.now()}`,
    gridSize,
    roomCount: rooms.length,
    rooms,
    corridors: [],
    corridorPassages: [],
    doors: [],
    portalLinks,
    entranceRoomId: entranceRoom.id,
    entranceDoor: center(entranceRoom),
    startPosition,
    walkable: Array.from(walkable).map((cellKey) => {
      const [x, y] = cellKey.split(",").map(Number);
      return { x, y };
    }),
  };
}

function generateDungeon(options = {}) {
  const gridSize = options.gridSize ?? 72;
  const roomCount = options.roomCount ?? 20;
  const layout = options.layout ?? "branching";
  if (layout === "linear") return generateLinearDungeon({ ...options, gridSize, roomCount });
  if (layout === "battlefield") return generateBattlefieldDungeon({ ...options, gridSize, roomCount });
  if (layout === "tower") return generateTowerDungeon({ ...options, gridSize, roomCount });
  const entranceShape = options.entranceShape ?? "rectangle";
  const rooms = [makeRoom(0, Math.floor(gridSize / 2) - 4, Math.floor(gridSize / 2) - 3, options, entranceShape)];
  const corridors = { cells: [], passages: [] };
  let attempts = 0;

  while (rooms.length < roomCount && attempts < (options.maxAttempts ?? 900)) {
    attempts += 1;
    const parent = layout === "linear" ? rooms[rooms.length - 1] : rooms[randomInt(0, rooms.length - 1)];
    const parentCenter = center(parent);
    const direction = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ][randomInt(0, 3)];
    const gap = rangeValue(options.corridorLength, 4, 8);
    const offsetMin = options.roomOffset?.min ?? 6;
    const offsetMax = options.roomOffset?.max ?? 10;
    const jitterX = options.roomJitter?.x ?? [2, 6];
    const jitterY = options.roomJitter?.y ?? [2, 5];
    const candidate = makeRoom(
      rooms.length,
      parentCenter.x + direction.x * (gap + randomInt(offsetMin, offsetMax)) - randomInt(jitterX[0], jitterX[1]),
      parentCenter.y + direction.y * (gap + randomInt(offsetMin, offsetMax)) - randomInt(jitterY[0], jitterY[1]),
      options,
    );

    if (
      !isInBounds(candidate, gridSize) ||
      overlaps(candidate, rooms, options.roomPadding ?? 2) ||
      overlapsCorridors(candidate, corridors.cells, options.corridorPadding ?? 1)
    ) {
      continue;
    }
    if (!connectRooms(parent, candidate, corridors, [...rooms, candidate], options)) continue;
    rooms.push(candidate);
  }

  const extraConnections = layout === "linear" ? 0 : Math.floor(roomCount * (options.extraConnectionRatio ?? 0.35));
  for (let i = 0; i < extraConnections; i += 1) {
    const a = rooms[randomInt(0, rooms.length - 1)];
    const b = rooms[randomInt(0, rooms.length - 1)];
    if (a.id !== b.id && !a.connections.includes(b.id)) {
      connectRooms(a, b, corridors, rooms, options);
    }
  }

  pruneDanglingDoors(rooms, corridors.cells);

  const walkable = new Set();
  const doors = [];
  for (const room of rooms) {
    room.cells.forEach((cell) => walkable.add(key(cell)));
    room.doors.forEach((door) => {
      walkable.add(key(door));
      doors.push({ ...door, roomId: room.id });
    });
  }
  corridors.cells.forEach((cell) => walkable.add(key(cell)));

  const entranceRoom = rooms[0];
  const entranceDoor = entranceRoom.doors[0] ?? center(entranceRoom);
  const startPosition = roomStartPosition(entranceRoom);

  return {
    id: `dungeon-${Date.now()}`,
    gridSize,
    roomCount: rooms.length,
    rooms,
    corridors: corridors.cells,
    corridorPassages: corridors.passages,
    doors,
    entranceRoomId: entranceRoom.id,
    entranceDoor,
    startPosition,
    walkable: Array.from(walkable).map((cellKey) => {
      const [x, y] = cellKey.split(",").map(Number);
      return { x, y };
    }),
  };
}

window.DungeonGenerator = {
  generateDungeon,
  roomHasCell,
};
})();
