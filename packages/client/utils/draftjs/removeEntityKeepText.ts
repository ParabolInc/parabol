import {
  RawDraftContentBlock,
  RawDraftContentState,
  RawDraftEntity,
  RawDraftEntityRange
} from 'draft-js'

const updateBlockEntityRanges = (blocks: RawDraftContentBlock[], updatedKeyMap: any) => {
  const nextBlocks = [] as RawDraftContentBlock[]
  blocks.forEach((block) => {
    const {entityRanges} = block
    const nextEntityRanges = [] as RawDraftEntityRange[]
    entityRanges.forEach((entityRange) => {
      const nextKey = updatedKeyMap[entityRange.key]
      if (nextKey !== null) {
        nextEntityRanges.push({...entityRange, key: nextKey})
      }
    })
    nextBlocks.push({...block, entityRanges: nextEntityRanges})
  })
  return nextBlocks
}

/*
 * Removes the underlying entity but keeps the text in place
 * Useful for e.g. removing a mention but keeping the name
 */
const removeEntityKeepText = (rawContent: RawDraftContentState, eqFn: (entity: any) => boolean) => {
  const {blocks, entityMap} = rawContent
  const nextEntityMap = {} as RawDraftContentState['entityMap']
  // oldKey: newKey. null is a remove sentinel
  const updatedKeyMap = {} as {[key: string]: string | null}
  const removedEntities = [] as RawDraftEntity[]
  // I'm not really sure how draft-js assigns keys, so I just reuse what they give me FIFO
  const releasedKeys = [] as string[]

  for (const [key, entity] of Object.entries(entityMap)) {
    if (eqFn(entity)) {
      removedEntities.push(entity)
      updatedKeyMap[key] = null
      releasedKeys.push(key)
    } else {
      const nextKey = releasedKeys.length ? releasedKeys.shift()! : key
      nextEntityMap[nextKey] = entity
      updatedKeyMap[key] = nextKey
    }
  }

  return {
    rawContent:
      removedEntities.length === 0
        ? rawContent
        : {
            blocks: updateBlockEntityRanges(blocks, updatedKeyMap),
            entityMap: nextEntityMap
          },
    removedEntities
  }
}

export default removeEntityKeepText
