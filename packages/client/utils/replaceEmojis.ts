import emojis from './emojis'

function replaceEmojis(text: string): string {
  const emojiRegex = /:(\w+):/g

  return text.replace(emojiRegex, (match, emojiKey) => {
    const emoji = emojis[emojiKey as keyof typeof emojis]
    return emoji ? emoji : match
  })
}

export default replaceEmojis
