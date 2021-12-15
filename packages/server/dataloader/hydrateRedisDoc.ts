import IUser from '../postgres/types/IUser'

const hydrators = {
  publicTemplates: (publicTemplates: any[]) => {
    publicTemplates.forEach((template) => {
      template.createdAt = new Date(template.createdAt)
    })
    return publicTemplates
  },
  User: (user: IUser) => {
    user.createdAt = new Date(user.createdAt)
    user.lastSeenAt = user.lastSeenAt ? new Date(user.lastSeenAt) : null
    user.updatedAt = new Date(user.updatedAt)
    return user
  }
}

const hydrateRedisDoc = (docStr: string, type: keyof typeof hydrators) => {
  const doc = JSON.parse(docStr)
  const hydrator = hydrators[type]
  if (!hydrator) return doc
  return hydrator(doc)
}

export default hydrateRedisDoc
