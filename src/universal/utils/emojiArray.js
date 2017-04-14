import emojis from 'markdown-it-emoji/lib/data/full.json';

delete emojis.shit;
delete emojis.fu;
export default Object.keys(emojis).map((name) => {
  return {
    value: `:${name}:`,
    emoji: emojis[name]
  };
});

