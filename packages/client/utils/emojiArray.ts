import emojis from './emojis'

// delete emojis.shit;
// delete emojis.fu;
export default Object.keys(emojis).map((name) => {
  return {
    value: `:${name}:`,
    emoji: emojis[name as keyof typeof emojis]
  }
})
