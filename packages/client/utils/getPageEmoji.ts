const segmenter = new Intl.Segmenter()
const isEmoji = (s: string) => /\p{Emoji_Presentation}|\p{Emoji}️/u.test(s)

export function getPageEmoji(title: string): string | null {
  const [first, second] = segmenter.segment(title)
  if (!first) return null
  const {segment} = first
  if (!isEmoji(segment)) return null
  if (second && isEmoji(second.segment)) return null
  return segment
}

export function stripPageEmoji(title: string, emoji: string): string {
  return title.slice(emoji.length).trimStart()
}
