import emojis from 'universal/utils/emojis.json';

// delete emojis.shit;
// delete emojis.fu;
export default Object.keys(emojis).map((name) => {
  return {
    value: `:${name}:`,
    emoji: emojis[name]
  };
});

