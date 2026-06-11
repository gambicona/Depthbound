(() => {
  const stores = {};

  window.DungeonContent ??= {
    register(type, id, definition) {
      if (!type || !id) return definition;
      stores[type] ??= {};
      stores[type][id] = definition;
      return definition;
    },
    get(type, id) {
      return stores[type]?.[id] ?? null;
    },
    all(type) {
      return Object.values(stores[type] ?? {});
    },
  };

  window.DungeonNpcChats ??= {};
  window.DungeonNpcQuestText ??= {};
  window.DungeonNpcBehaviors ??= {};
})();
