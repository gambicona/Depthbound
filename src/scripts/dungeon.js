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

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let include = true;

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

function makeRoom(id, x, y, shape = shapeTypes[randomInt(0, shapeTypes.length - 1)]) {
  const width = shape === "square" ? randomInt(5, 8) : randomInt(5, 11);
  const height = shape === "square" ? width : randomInt(5, 10);
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

function carvePath(start, end) {
  const cells = [];
  let x = start.x;
  let y = start.y;

  while (x !== end.x) {
    cells.push({ x, y });
    x += Math.sign(end.x - x);
  }

  while (y !== end.y) {
    cells.push({ x, y });
    y += Math.sign(end.y - y);
  }

  cells.push({ x, y });
  return cells;
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

function connectRooms(a, b, corridors, rooms) {
  const aConnection = nearestBoundaryDoor(a, center(b));
  const bConnection = nearestBoundaryDoor(b, center(a));
  if (!aConnection || !bConnection) return false;

  const corridor = carvePath(aConnection.outside, bConnection.outside);
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

function roomStartPosition(room) {
  const firstDoor = room.doors[0] ?? center(room);
  const sorted = room.cells
    .slice()
    .filter((cell) => !(cell.x === firstDoor.x && cell.y === firstDoor.y))
    .sort((a, b) => Math.abs(a.x - firstDoor.x) + Math.abs(a.y - firstDoor.y) - (Math.abs(b.x - firstDoor.x) + Math.abs(b.y - firstDoor.y)));
  return sorted[0] ?? center(room);
}

function generateDungeon(options = {}) {
  const gridSize = options.gridSize ?? 72;
  const roomCount = options.roomCount ?? 20;
  const rooms = [makeRoom(0, Math.floor(gridSize / 2) - 4, Math.floor(gridSize / 2) - 3, "rectangle")];
  const corridors = { cells: [], passages: [] };
  let attempts = 0;

  while (rooms.length < roomCount && attempts < 900) {
    attempts += 1;
    const parent = rooms[randomInt(0, rooms.length - 1)];
    const parentCenter = center(parent);
    const direction = [
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
    ][randomInt(0, 3)];
    const gap = randomInt(4, 8);
    const candidate = makeRoom(
      rooms.length,
      parentCenter.x + direction.x * (gap + randomInt(6, 10)) - randomInt(2, 6),
      parentCenter.y + direction.y * (gap + randomInt(6, 10)) - randomInt(2, 5),
    );

    if (!isInBounds(candidate, gridSize) || overlaps(candidate, rooms) || overlapsCorridors(candidate, corridors.cells)) {
      continue;
    }
    if (!connectRooms(parent, candidate, corridors, [...rooms, candidate])) continue;
    rooms.push(candidate);
  }

  for (let i = 0; i < Math.floor(roomCount * 0.35); i += 1) {
    const a = rooms[randomInt(0, rooms.length - 1)];
    const b = rooms[randomInt(0, rooms.length - 1)];
    if (a.id !== b.id && !a.connections.includes(b.id)) {
      connectRooms(a, b, corridors, rooms);
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
    startPosition: { ...entranceDoor },
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
