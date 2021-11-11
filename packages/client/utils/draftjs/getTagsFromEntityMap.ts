import {RawDraftContentState} from 'draft-js'

const getTagsFromEntityMap = <T = string>(entityMap: RawDraftContentState['entityMap']) => {
  const entityKeys = Object.keys(entityMap)
  const tags = new Set<T>()
  for (let i = 0; i < entityKeys.length; i++) {
    const key = entityKeys[i]!
    const entity = entityMap[key]!
    if (entity.type === 'TAG') {
      tags.add(entity.data.value)
    }
  }
  return Array.from(tags)
}

export default getTagsFromEntityMap
