(() => {
const cp = (amount) => ({ amount, unit: "cp", text: `${amount} cp` });

function handout(id, name, options = {}) {
  const text = options.text ?? options.description ?? "Write the handout text here.";
  const temporary = Boolean(options.temporary ?? options.temporaryTome ?? options.expiresOnDungeonExit);
  window.DungeonContent.register("items", id, {
    name,
    type: "handout",
    category: options.category ?? "journal",
    cost: options.cost ?? cp(0),
    weightLb: 0,
    slots: [],
    stackable: false,
    tomeInventory: "party",
    temporaryTome: temporary,
    expiresOnDungeonExit: temporary,
    tags: ["handout", "journal", "ancient-tome", ...(temporary ? ["temporary-note"] : []), ...(options.tags ?? [])],
    description: text,
    customDescription: text,
    handout: {
      title: options.title ?? name,
      text,
      format: options.format ?? "markdown-lite",
      categories: options.categories ?? [],
      temporary,
    },
  });
}

handout("ancient-tome-page", "Ancient Tome Page", {
  title: "Untitled Handout",
  categories: ["Promiscuous"],
  text: "# Untitled Handout\n\nWrite your formatted handout text here.\n\n- Use headings\n- Use **bold** or *italic* emphasis",
});

handout("temporary-dungeon-note", "Temporary Dungeon Note", {
  title: "Temporary Dungeon Note",
  categories: ["Dungeon Notes"],
  temporary: true,
  text: "# Temporary Dungeon Note\n\nWrite a clue, password, warning, or room hint here. This note stays in the journal only until the party leaves the dungeon.",
});
})();
