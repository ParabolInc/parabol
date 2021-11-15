import {RawDraftContentState} from 'draft-js'

const keyLookup = {
  TAG: 'value',
  MENTION: 'userId'
}

const getTypeFromEntityMap = (
  type: keyof typeof keyLookup,
  entityMap: RawDraftContentState['entityMap']
) => {
  const typeSet = new Set<string>()
  const id = keyLookup[type]
  Object.values(entityMap).forEach((entity) => {
    if (entity.type === type) {
      typeSet.add(entity.data[id])
    }
  })
  return Array.from(typeSet)
}

export default getTypeFromEntityMap
