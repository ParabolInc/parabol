import {JSONContent} from '@tiptap/core'

export const getKudosUserIdsFromJson = (doc: JSONContent, emoji: string): string[] => {
  const mentionedIds = new Set<string>()

  const searchForMentionsAndEmojis = (node: JSONContent | undefined) => {
    if (!node || !node.content) return

    node.content.forEach((contentNode) => {
      if (contentNode.type === 'paragraph') {
        const tempMentions: string[] = []
        let emojiFound = false

        contentNode.content?.forEach((item) => {
          if (item.type === 'text' && item.text?.includes(emoji)) {
            emojiFound = true
          }
          if (item.type === 'mention') {
            tempMentions.push(item.attrs?.id)
          }
        })

        if (emojiFound) {
          tempMentions.forEach((id) => mentionedIds.add(id))
        }
      } else if (contentNode.content) {
        searchForMentionsAndEmojis(contentNode)
      }
    })
  }

  searchForMentionsAndEmojis(doc)

  return Array.from(mentionedIds)
}
