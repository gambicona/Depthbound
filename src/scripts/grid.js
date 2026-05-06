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

  neighbors(position, gridSize = defaultGridSize, includeDiagonals = false) {
    const cardinal = [
      { x: position.x, y: position.y - 1 },
      { x: position.x + 1, y: position.y },
      { x: position.x, y: position.y + 1 },
      { x: position.x - 1, y: position.y },
    ];
    const diagonal = [
      { x: position.x - 1, y: position.y - 1 },
      { x: position.x + 1, y: position.y - 1 },
      { x: position.x + 1, y: position.y + 1 },
      { x: position.x - 1, y: position.y + 1 },
    ];
    return (includeDiagonals ? [...cardinal, ...diagonal] : cardinal).filter((next) =>
      window.DungeonGrid.isInsideGrid(next, gridSize),
    );
  },

  findPath(start, goal, mover, fighters, options = {}) {
    const gridSize = options.gridSize ?? defaultGridSize;
    const walkable = options.walkable ?? null;
    const canTraverse = options.canTraverse ?? (() => true);
    const includeDiagonals = options.includeDiagonals ?? false;
    const stateKey = options.stateKey ?? ((position) => window.DungeonGrid.positionKey(position));
    const neighborsFor = options.neighborsFor ?? ((position, path) =>
       window.DungeonGrid.neighbors(position, gridSize, includeDiagonals)
        );

    const moveCost = options.moveCost ?? (() => 1);
    if (window.DungeonGrid.isOccupied(goal, fighters, mover)) return null;
    if (walkable && !walkable.has(window.DungeonGrid.positionKey(goal))) return null;

    const queue = [{ position: start, path: [] }];
    const visited = new Set([stateKey(start, [])]);

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.position.x === goal.x && current.position.y === goal.y) {
        return current.path;
      }

      for (const next of neighborsFor(current.position, current.path)) {
        const key = window.DungeonGrid.positionKey(next);
        if (walkable && !walkable.has(key)) continue;
        if (!canTraverse(current.position, next, current.path)) continue;
        const nextPath = [...current.path, next];
        const nextStateKey = stateKey(next, nextPath);
        if (visited.has(nextStateKey) || window.DungeonGrid.isOccupied(next, fighters, mover)) continue;
        visited.add(nextStateKey);
        queue.push({ position: next, path: nextPath });
      }
    }

    return null;
  },

  reachableTiles(fighter, fighters, options = {}) {
    const gridSize = options.gridSize ?? defaultGridSize;
    const walkable = options.walkable ?? null;
    const maxCost = options.maxCost ?? fighter.movementLeft;
    const canTraverse = options.canTraverse ?? (() => true);
    const includeDiagonals = options.includeDiagonals ?? false;
    const stateKey = options.stateKey ?? ((position) => window.DungeonGrid.positionKey(position));
    const reachable = new Map();
    const queue = [{ position: fighter.position, cost: 0, path: [] }];
    const visited = new Set([stateKey(fighter.position, [])]);
    const neighborsFor = options.neighborsFor ?? ((position, path) =>
      window.DungeonGrid.neighbors(position, gridSize, includeDiagonals)
    );

    const moveCost = options.moveCost ?? (() => 1);


    while (queue.length > 0) {
      const current = queue.shift();

      for (const next of window.DungeonGrid.neighbors(current.position, gridSize, includeDiagonals)) {
        const stepCost = moveCost(current.position, next, current.path);
      const nextCost = current.cost + stepCost;
        const key = window.DungeonGrid.positionKey(next);
        if (
          (walkable && !walkable.has(key)) ||
          !canTraverse(current.position, next, current.path) ||
          nextCost > maxCost ||
          window.DungeonGrid.isOccupied(next, fighters, fighter)
        ) {
          continue;
        }

        const nextPath = [...current.path, next];
        const nextStateKey = stateKey(next, nextPath);
        if (visited.has(nextStateKey)) continue;

        visited.add(nextStateKey);
        reachable.set(key, Math.min(reachable.get(key) ?? nextCost, nextCost));
        queue.push({ position: next, cost: nextCost, path: nextPath });
      }
    }

    return reachable;
  },
};
})();
