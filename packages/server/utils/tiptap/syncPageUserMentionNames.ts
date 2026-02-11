import * as Y from 'yjs'
import getKysely from '../../postgres/getKysely'

export const syncPageUserMentionNames = async (document: Y.Doc) => {
  const frag = document.getXmlFragment('default')
  const mentionElements: Y.XmlElement[] = []

  // @ts-ignore createTreeWalker is available on Y.XmlFragment in this environment
  const walker = frag.createTreeWalker((yxml) => {
    if (yxml instanceof Y.XmlElement && yxml.nodeName === 'pageUserMention') {
      return true
    }
    return false
  })

  for (const node of walker) {
    mentionElements.push(node as Y.XmlElement)
  }

  if (mentionElements.length === 0) return

  const userIds = Array.from(new Set(mentionElements.map((el) => el.getAttribute('id')))).filter(
    Boolean
  ) as string[]

  if (userIds.length === 0) return

  const dbUsers = await getKysely()
    .selectFrom('User')
    .select(['id', 'preferredName'])
    .where('id', 'in', userIds)
    .execute()

  const userMap = new Map(dbUsers.map((u) => [u.id, u.preferredName]))

  document.transact(() => {
    mentionElements.forEach((el) => {
      const id = el.getAttribute('id')
      if (!id) return
      const currentLabel = el.getAttribute('label')
      const correctName = userMap.get(id)
      if (correctName && correctName !== currentLabel) {
        el.setAttribute('label', correctName)
      }
    })
  })
}
