import {GoogleAnalyzedEntities} from '../../../../GoogleLanguageManager'

const sanitizeAnalyzedEntitiesResponse = (response: GoogleAnalyzedEntities | null) => {
  if (!response) return null
  const {entities} = response
  if (!Array.isArray(entities)) return null
  // very important to Object.create(null) since validEntities['constructor'] would return a function!
  const validEntities = Object.create(null) as {[lowerCaseName: string]: number}
  entities.forEach((entity) => {
    const {name, salience} = entity
    if (!name || !salience) return
    const normalizedEntityName = name.toLowerCase()
    const cumlSalience = validEntities[normalizedEntityName] || 0
    validEntities[normalizedEntityName] = cumlSalience + salience
  })
  return Object.keys(validEntities).map((name) => ({
    name,
    salience: validEntities[name]!
  }))
}

export default sanitizeAnalyzedEntitiesResponse
