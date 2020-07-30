const hydrators = {
  publicTemplates: (publicTemplates: any[]) => {
    publicTemplates.forEach((template) => {
      template.createdAt = new Date(template.createdAt)
    })
    return publicTemplates
  }
}

const hydrateRedisDoc = (docStr: string, type: string) => {
  const doc = JSON.parse(docStr)
  const hydrator = hydrators[type]
  if (!hydrator) return doc
  return hydrator(doc)
}

export default hydrateRedisDoc
