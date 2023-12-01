import {JSONContent} from '@tiptap/core'

export const getKudosUserIdsFromJson = (doc: JSONContent, emoji: string): string[] => {
  const mentionedIds = new Set<string>()

  if (!doc.content) return []
  for (const paragraph of doc.content) {
    if (paragraph.content) {
      let emojiFound = false
      const tempMentions = new Set<string>()

      for (const node of paragraph.content) {
        if (node.type === 'text' && node.text?.includes(emoji)) {
          emojiFound = true
        }

        if (node.type === 'mention') {
          tempMentions.add(node.attrs?.id)
        }
      }

      if (emojiFound) {
        tempMentions.forEach((id) => mentionedIds.add(id))
      }
    }
  }

  return Array.from(mentionedIds)
}
