import {GoogleAnalyzeEntitiesResponse} from './getEntitiesFromText'


const sanitizeAnalyzedEntitiesResponse = (responses: GoogleAnalyzeEntitiesResponse) => {
  if (!responses) return null
  const [firstResponse] = responses
  if (!firstResponse) return null
  const {entities} = firstResponse
  if (!Array.isArray(entities)) return null
  const validEntities = {} as {[lowerCaseName: string]: number}
  for (let ii = 0; ii < entities.length; ii++) {
    const entity = entities[ii]
    const {name, salience} = entity
    if (!name || !salience) continue
    const normalizedEntityName = name.toLowerCase()
    const cumlSalience = validEntities[normalizedEntityName] || 0
    validEntities[normalizedEntityName] = cumlSalience + salience
  }
  return Object.keys(validEntities).map((name) => ({
    name,
    salience: validEntities[name]
  }))
}

export default sanitizeAnalyzedEntitiesResponse
