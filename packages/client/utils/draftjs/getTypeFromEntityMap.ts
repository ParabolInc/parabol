import {RawDraftContentState} from 'draft-js'

const keyLookup = {
  TAG: 'value',
  MENTION: 'userId'
}

const getTypeFromEntityMap = (
  type: keyof typeof keyLookup,
  entityMap: RawDraftContentState['entityMap']
) => {
  const entityKeys = Object.keys(entityMap)
  const typeSet = new Set<string>()
  const id = keyLookup[type]
  for (let i = 0; i < entityKeys.length; i++) {
    const key = entityKeys[i]!
    const entity = entityMap[key]!
    if (entity.type === type) {
      typeSet.add(entity.data[id])
    }
  }
  return Array.from(typeSet)
}

export default getTypeFromEntityMap
