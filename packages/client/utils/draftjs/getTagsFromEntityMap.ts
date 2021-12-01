import {RawDraftContentState} from 'draft-js'

const getTagsFromEntityMap = <T = string>(entityMap: RawDraftContentState['entityMap']) => {
  const tags = new Set<T>()
  Object.values(entityMap).forEach((entity) => {
    if (entity.type === 'TAG') {
      tags.add(entity.data.value)
    }
  })
  return Array.from(tags)
}

export default getTagsFromEntityMap
