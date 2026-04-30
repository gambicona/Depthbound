(() => {
const { gridSize: defaultGridSize } = window.DungeonConfig;

window.DungeonGrid = {
  distance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  },

  isAdjacent(a, b) {
    return window.DungeonGrid.distance(a.position, b.position) === 1;
  },

  isInsideGrid(position, gridSize = defaultGridSize) {
    return position.x >= 0 && position.x < gridSize && position.y >= 0 && position.y < gridSize;
  },

  isOccupied(position, fighters, ignoredFighter = null) {
    return Object.values(fighters).some(
      (fighter) =>
        fighter.alive &&
        fighter.id !== ignoredFighter?.id &&
        fighter.position.x === position.x &&
        fighter.position.y === position.y,
    );
  },

  positionKey(position) {
    return `${position.x},${position.y}`;
  },

  neighbors(position, gridSize = defaultGridSize) {
    return [
      { x: position.x, y: position.y - 1 },
      { x: position.x + 1, y: position.y },
      { x: position.x, y: position.y + 1 },
      { x: position.x - 1, y: position.y },
    ].filter((next) => window.DungeonGrid.isInsideGrid(next, gridSize));
  },

  findPath(start, goal, mover, fighters, options = {}) {
    const gridSize = options.gridSize ?? defaultGridSize;
    const walkable = options.walkable ?? null;
    if (window.DungeonGrid.isOccupied(goal, fighters, mover)) return null;
    if (walkable && !walkable.has(window.DungeonGrid.positionKey(goal))) return null;

    const queue = [{ position: start, path: [] }];
    const visited = new Set([window.DungeonGrid.positionKey(start)]);

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.position.x === goal.x && current.position.y === goal.y) {
        return current.path;
      }

      for (const next of window.DungeonGrid.neighbors(current.position, gridSize)) {
        const key = window.DungeonGrid.positionKey(next);
        if (walkable && !walkable.has(key)) continue;
        if (visited.has(key) || window.DungeonGrid.isOccupied(next, fighters, mover)) continue;
        visited.add(key);
        queue.push({ position: next, path: [...current.path, next] });
      }
    }

    return null;
  },

  reachableTiles(fighter, fighters, options = {}) {
    const gridSize = options.gridSize ?? defaultGridSize;
    const walkable = options.walkable ?? null;
    const reachable = new Map();
    const queue = [{ position: fighter.position, cost: 0 }];
    const visited = new Set([window.DungeonGrid.positionKey(fighter.position)]);

    while (queue.length > 0) {
      const current = queue.shift();

      for (const next of window.DungeonGrid.neighbors(current.position, gridSize)) {
        const nextCost = current.cost + 1;
        const key = window.DungeonGrid.positionKey(next);
        if (
          visited.has(key) ||
          (walkable && !walkable.has(key)) ||
          nextCost > fighter.movementLeft ||
          window.DungeonGrid.isOccupied(next, fighters, fighter)
        ) {
          continue;
        }

        visited.add(key);
        reachable.set(key, nextCost);
        queue.push({ position: next, cost: nextCost });
      }
    }

    return reachable;
  },
};
})();
