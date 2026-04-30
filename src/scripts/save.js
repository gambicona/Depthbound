(() => {
const storageKey = "dungeonCrawler.save.v1";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

window.DungeonSave = {
  hasSave() {
    return Boolean(window.localStorage.getItem(storageKey));
  },

  save(state) {
    const payload = {
      version: 1,
      savedAt: new Date().toISOString(),
      state: clone(state),
    };
    window.localStorage.setItem(storageKey, JSON.stringify(payload));
    return payload;
  },

  load() {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    if (payload.version !== 1 || !payload.state) {
      throw new Error("Unsupported save file.");
    }

    return payload;
  },
};
})();
