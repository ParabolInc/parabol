import {
  ContentState,
  convertFromRaw,
  convertToRaw,
  EditorState,
  Entity,
  Modifier,
  RawDraftContentState,
  RawDraftEntityRange,
  SelectionState
} from 'draft-js'
import unicodeSubstring from 'unicode-substring'

const getUTF16Range = (text: string, range: RawDraftEntityRange) => {
  const offset = unicodeSubstring(text, 0, range.offset).length
  return {
    key: range.key,
    offset,
    length: offset + unicodeSubstring(text, offset, range.length).length
  }
}

const getEntities = (
  entityMap: RawDraftContentState['entityMap'],
  entityType: string,
  eqFn: (entityData: any) => void
) => {
  const entities = [] as string[]
  for (const [key, entity] of Object.entries(entityMap)) {
    if (entity.type === entityType && eqFn(entity.data)) {
      entities.push(key)
    }
  }
  return entities
}

const getRemovalRanges = (
  entities: Entity[],
  entityRanges: RawDraftEntityRange[],
  text: string
) => {
  const removalRanges = [] as {start: any; end: any}[]
  entityRanges.forEach((utf8Range) => {
    const entityKey = String(utf8Range.key)
    if (entities.includes(entityKey)) {
      const {offset, length} = getUTF16Range(text, utf8Range)
      const entityEnd = offset + length
      const end = offset === 0 && text[entityEnd] === ' ' ? entityEnd + 1 : entityEnd
      const start = text[offset - 1] === ' ' ? offset - 1 : offset
      removalRanges.push({start, end})
    }
  })
  removalRanges.sort((a, b) => (a.end < b.end ? 1 : -1))
  return removalRanges
}

const removeRangesForEntity = (content: string, entityType: string, eqFn: any) => {
  const rawContent = JSON.parse(content)
  const {blocks, entityMap} = rawContent
  const entities = getEntities(entityMap, entityType, eqFn)
  // it's an arduous task to update the next entities after removing 1, so use the removeRange helper
  const editorState = EditorState.createWithContent(convertFromRaw(rawContent))
  let contentState = editorState.getCurrentContent()
  const selectionState = editorState.getSelection()
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i]
    const {entityRanges, key: blockKey, text} = block
    const removalRanges = getRemovalRanges(entities, entityRanges, text)
    removalRanges.forEach((range) => {
      const selectionToRemove = selectionState.merge({
        anchorKey: blockKey,
        focusKey: blockKey,
        anchorOffset: range.start,
        focusOffset: range.end
      }) as SelectionState
      contentState = Modifier.removeRange(contentState, selectionToRemove, 'backward')
    })
    if (contentState.getBlockForKey(blockKey).getText() === '') {
      contentState = contentState.merge({
        blockMap: contentState.getBlockMap().delete(blockKey)
      }) as ContentState
    }
  }
  return contentState === editorState.getCurrentContent()
    ? null
    : JSON.stringify(convertToRaw(contentState))
}

export default removeRangesForEntity
