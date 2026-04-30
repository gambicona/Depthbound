(() => {
const storagePrefix = "dungeonCrawler.saveSlot.v1.";
const slotCount = 4;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

window.DungeonSave = {
  slotCount,

  getSlots() {
    return Array.from({ length: slotCount }, (_, index) => {
      const slotId = index + 1;
      const payload = window.DungeonSave.load(slotId);
      return {
        id: slotId,
        name: payload?.name ?? `Save Slot ${slotId}`,
        savedAt: payload?.savedAt ?? null,
        hasSave: Boolean(payload),
      };
    });
  },

  hasSave(slotId) {
    return Boolean(window.localStorage.getItem(`${storagePrefix}${slotId}`));
  },

  save(slotId, name, state) {
    const payload = {
      version: 1,
      slotId,
      name: name.trim() || `Save Slot ${slotId}`,
      savedAt: new Date().toISOString(),
      state: clone(state),
    };
    window.localStorage.setItem(`${storagePrefix}${slotId}`, JSON.stringify(payload));
    return payload;
  },

  load(slotId) {
    const raw = window.localStorage.getItem(`${storagePrefix}${slotId}`);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    if (payload.version !== 1 || !payload.state) {
      throw new Error("Unsupported save file.");
    }

    return payload;
  },
};
})();
