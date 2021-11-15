/*
 * Make a list of all the entities mentioned across all the reflections
 */

const getAllLemmasFromReflections = (
  reflectionEntities: {lemma?: string; name: string; salience: number}[][] = []
) => {
  const lemmaSet = new Set<string>()
  reflectionEntities.forEach((entities) => {
    if (!Array.isArray(entities)) return
    entities.forEach((entity) => {
      const {lemma} = entity
      if (lemma) {
        lemmaSet.add(lemma)
      }
    })
  })
  return Array.from(lemmaSet)
}

export default getAllLemmasFromReflections
