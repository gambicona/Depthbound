(() => {
const buckets = {
  classes: new Map(),
  monsters: new Map(),
  dungeons: new Map(),
  lootTables: new Map(),
  themes: new Map(),
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function ensureBucket(type) {
  if (!buckets[type]) {
    buckets[type] = new Map();
  }
  return buckets[type];
}

window.DungeonContent = {
  register(type, id, definition) {
    ensureBucket(type).set(id, clone({ id, ...definition }));
  },

  get(type, id) {
    const definition = ensureBucket(type).get(id);
    return definition ? clone(definition) : null;
  },

  list(type) {
    return Array.from(ensureBucket(type).values()).map(clone);
  },
};
})();
