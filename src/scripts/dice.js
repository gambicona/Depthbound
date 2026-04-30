window.DungeonDice = {
  rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
  },

  rollDice(count, sides) {
    const rolls = Array.from({ length: count }, () => window.DungeonDice.rollDie(sides));
    return {
      rolls,
      total: rolls.reduce((sum, roll) => sum + roll, 0),
    };
  },

  abilityLabel(value) {
    return value >= 0 ? `+${value}` : `${value}`;
  },
};
