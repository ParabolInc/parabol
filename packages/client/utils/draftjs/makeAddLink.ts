import {ContentState, EditorState, Modifier} from 'draft-js'

const makeAddLink =
  (blockKey: string, anchorOffset: number, focusOffset: number, url: string) =>
  (editorState: EditorState) => {
    const contentState = editorState.getCurrentContent()
    const contentStateWithEntity = contentState.createEntity('LINK', 'MUTABLE', {
      href: url
    })
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const selectionState = editorState.getSelection()
    const linkSelectionState = selectionState.merge({
      anchorKey: blockKey,
      focusKey: blockKey,
      anchorOffset,
      focusOffset
    })
    const contentWithUrl = Modifier.applyEntity(contentState, linkSelectionState, entityKey).merge({
      selectionAfter: selectionState,
      selectionBefore: selectionState
    }) as ContentState
    return EditorState.push(editorState, contentWithUrl, 'apply-entity')
  }

export default makeAddLink
