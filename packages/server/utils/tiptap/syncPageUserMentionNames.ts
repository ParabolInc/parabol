import * as Y from 'yjs'
import getKysely from '../../postgres/getKysely'

const MAX_MENTIONED_USERS = 500

export const syncPageUserMentionNames = async (document: Y.Doc, pageId: number) => {
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

  const userIds = (
    Array.from(new Set(mentionElements.map((el) => el.getAttribute('id')))).filter(
      (id) => typeof id === 'string' && id
    ) as string[]
  ).slice(0, MAX_MENTIONED_USERS)

  if (userIds.length === 0) return

  // Mention ids are written by any editor, so only name people who share an org with someone who can read the page
  const dbUsers = await getKysely()
    .selectFrom('User')
    .select(['id', 'preferredName', 'isRemoved'])
    .where('id', 'in', userIds)
    .where(({exists, selectFrom}) =>
      exists(
        selectFrom('OrganizationUser as mentioned')
          .innerJoin('OrganizationUser as reader', 'reader.orgId', 'mentioned.orgId')
          .innerJoin('PageAccess', 'PageAccess.userId', 'reader.userId')
          .select('mentioned.id')
          .whereRef('mentioned.userId', '=', 'User.id')
          .where('reader.removedAt', 'is', null)
          .where('PageAccess.pageId', '=', pageId)
      )
    )
    .execute()

  const userMap = new Map(
    dbUsers.map((u) => [u.id, u.isRemoved ? 'Deactivated User' : u.preferredName])
  )

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
