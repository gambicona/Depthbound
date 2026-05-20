(() => {
const cp = (amount) => ({ amount, unit: "cp", text: `${amount} cp` });

function handout(id, name, options = {}) {
  const text = options.text ?? options.description ?? "Write the handout text here.";
  window.DungeonContent.register("items", id, {
    name,
    type: "handout",
    category: options.category ?? "journal",
    cost: options.cost ?? cp(0),
    weightLb: 0,
    slots: [],
    stackable: false,
    tomeInventory: "party",
    tags: ["handout", "journal", "ancient-tome", ...(options.tags ?? [])],
    description: text,
    customDescription: text,
    handout: {
      title: options.title ?? name,
      text,
      format: options.format ?? "markdown-lite",
      categories: options.categories ?? [],
    },
  });
}

handout("ancient-tome-page", "Ancient Tome Page", {
  title: "Untitled Handout",
  categories: ["Promiscuous"],
  text: "# Untitled Handout\n\nWrite your formatted handout text here.\n\n- Use headings\n- Use **bold** or *italic* emphasis",
});
})();
