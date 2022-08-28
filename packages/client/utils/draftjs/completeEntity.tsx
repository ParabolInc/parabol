import {ContentState, EditorState, Modifier, SelectionState} from 'draft-js'
import getAnchorLocation from '../../components/TaskEditor/getAnchorLocation'
import getWordAt from '../../components/TaskEditor/getWordAt'

const operationTypes = {
  EMOJI: {
    editorChangeType: 'apply-entity',
    entityType: 'IMMUTABLE'
  },
  TAG: {
    editorChangeType: 'apply-entity',
    entityType: 'IMMUTABLE'
  },
  LINK: {
    editorChangeType: 'apply-entity',
    entityType: 'MUTABLE'
  },
  MENTION: {
    editorChangeType: 'apply-entity',
    entityType: 'SEGMENTED'
  }
}

const getExpandedSelectionState = (editorState: EditorState) => {
  const selectionState = editorState.getSelection()
  if (selectionState.isCollapsed()) {
    const {block, anchorOffset} = getAnchorLocation(editorState)
    const {begin, end} = getWordAt(block.getText(), anchorOffset - 1)
    return selectionState.merge({
      anchorOffset: begin,
      focusOffset: end
    }) as SelectionState
  }
  return selectionState as SelectionState
}

const contentStateWithFocusAtEnd = (givenContentState, givenSelectionState) => {
  const endKey = givenContentState.getSelectionAfter().getEndKey()
  const endOffset = givenContentState.getSelectionAfter().getEndOffset()
  const collapsedSelectionState = givenSelectionState.merge({
    anchorKey: endKey,
    anchorOffset: endOffset,
    focusKey: endKey,
    focusOffset: endOffset
  })
  return givenContentState.merge({
    selectionAfter: collapsedSelectionState
  }) as ContentState
}

export const makeContentWithEntity = (
  contentState: ContentState,
  selectionState: SelectionState,
  mention: string,
  entityKey: string
) => {
  if (!mention) {
    // anchorKey && focusKey should be different here (used for EditorLinkChanger)
    return Modifier.applyEntity(contentState, selectionState, entityKey)
  }
  return Modifier.insertText(contentState, selectionState, mention, undefined, entityKey)
}

export const autoCompleteEmoji = (editorState: EditorState, emoji: string) => {
  const contentState = editorState.getCurrentContent()
  const expandedSelectionState = getExpandedSelectionState(editorState)

  const nextContentState = Modifier.replaceText(contentState, expandedSelectionState, emoji)
  const endKey = nextContentState.getSelectionAfter().getEndKey()
  const endOffset = nextContentState.getSelectionAfter().getEndOffset()
  const collapsedSelectionState = expandedSelectionState.merge({
    anchorKey: endKey,
    anchorOffset: endOffset,
    focusKey: endKey,
    focusOffset: endOffset
  })
  const finalContent = nextContentState.merge({
    selectionAfter: collapsedSelectionState
    // selectionBefore: collapsedSelectionState,
  }) as ContentState
  return EditorState.push(editorState, finalContent, 'remove-characters' as any)
}

interface Options {
  keepSelection?: boolean
}
const completeEntity = (
  editorState: EditorState,
  entityName: string,
  entityData: any,
  mention: string,
  options: Options = {}
) => {
  const {keepSelection} = options
  const {editorChangeType, entityType} = operationTypes[entityName]
  const contentState = editorState.getCurrentContent()
  // for https://github.com/ParabolInc/parabol/issues/7088
  const nonWhitespaceFromStart = mention.search(/\S/)
  const nonWhitespaceFromEnd = mention.search(/\s*$/)
  let startStr = ''
  let endStr = ''
  if (nonWhitespaceFromStart > -1) {
    startStr = mention.slice(0, nonWhitespaceFromStart)
  }
  if (nonWhitespaceFromEnd > -1) {
    endStr = mention.slice(nonWhitespaceFromEnd)
  }
  const expandedSelectionState = keepSelection
    ? editorState.getSelection()
    : getExpandedSelectionState(editorState)
  let contentStateAfterStartStr
  if (expandedSelectionState.isCollapsed()) {
    contentStateAfterStartStr = Modifier.insertText(contentState, expandedSelectionState, startStr)
  } else {
    contentStateAfterStartStr = Modifier.replaceText(contentState, expandedSelectionState, startStr)
  }
  const contentStateWithEntity = contentStateAfterStartStr.createEntity(
    entityName,
    entityType,
    entityData
  )
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
  editorState = EditorState.push(
    editorState,
    contentStateWithFocusAtEnd(contentStateAfterStartStr, expandedSelectionState),
    'insert-characters'
  )
  const selectionStateAfterStartStr = editorState.getSelection()
  const contentWithEntity = makeContentWithEntity(
    contentStateAfterStartStr,
    selectionStateAfterStartStr,
    mention.trim(),
    entityKey
  )
  editorState = EditorState.push(
    editorState,
    contentStateWithFocusAtEnd(contentWithEntity, selectionStateAfterStartStr),
    'insert-characters'
  )
  const selectionStateAfterMention = editorState.getSelection()
  const contentStateAfterEndStr = Modifier.insertText(
    contentWithEntity,
    selectionStateAfterMention,
    endStr
  )
  return EditorState.push(
    editorState,
    contentStateWithFocusAtEnd(contentStateAfterEndStr, selectionStateAfterMention),
    editorChangeType
  )
}

export default completeEntity
