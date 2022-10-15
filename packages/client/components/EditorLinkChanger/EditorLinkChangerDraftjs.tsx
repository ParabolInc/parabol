import {ContentState, EditorState, Modifier, SelectionState} from 'draft-js'
import React, {RefObject} from 'react'
import {UseTaskChild} from '../../hooks/useTaskChildFocus'
import {BBox} from '../../types/animations'
import completeEntity from '../../utils/draftjs/completeEntity'
import EditorLinkChangerModal from './EditorLinkChangerModal'

interface Props {
  editorState: EditorState
  editorRef: RefObject<HTMLTextAreaElement>

  link: string | null

  originCoords: BBox
  removeModal(allowFocus: boolean): void

  selectionState: SelectionState

  setEditorState(editorState: EditorState): void

  text: string | null

  useTaskChild: UseTaskChild
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

const EditorLinkChangerDraftjs = (props: Props) => {
  const {
    editorState,
    editorRef,
    selectionState,
    setEditorState,
    text,
    link,
    removeModal,
    originCoords,
    useTaskChild
  } = props
  useTaskChild('editor-link-changer')
  const handleSubmit = ({text, href}: {text: string; href: string}) => {
    // don't include leading and trailing whitespace in the link text
    const nonWhitespaceFromStart = text.search(/\S/)
    const nonWhitespaceFromEnd = text.search(/\s*$/)
    const startStr = nonWhitespaceFromStart === -1 ? '' : text.slice(0, nonWhitespaceFromStart)
    const endStr = nonWhitespaceFromEnd === -1 ? '' : text.slice(nonWhitespaceFromEnd)
    const hasTextTitle = text.trim()
    // trim link text if it contains any non-whitespace characters, otherwise keep it verbatim
    const trimmedText = hasTextTitle || text
    const focusedEditorState = EditorState.forceSelection(editorState, selectionState)
    let newEditorState = focusedEditorState
    if (hasTextTitle) {
      const contentState = focusedEditorState.getCurrentContent()
      const expandedSelectionState = focusedEditorState.getSelection()
      const contentStateAfterStartStr: ContentState = expandedSelectionState.isCollapsed()
        ? Modifier.insertText(contentState, expandedSelectionState, startStr)
        : Modifier.replaceText(contentState, expandedSelectionState, startStr)
      newEditorState = EditorState.push(
        focusedEditorState,
        contentStateWithFocusAtEnd(contentStateAfterStartStr, expandedSelectionState),
        'insert-characters'
      )
    }
    newEditorState = completeEntity(newEditorState, 'LINK', {href}, trimmedText, {
      keepSelection: true
    })
    const selectionStateAfterTrimmedText = newEditorState.getSelection()
    let contentStateAfterEndStr = newEditorState.getCurrentContent()
    if (hasTextTitle) {
      const contentWithEntity = newEditorState.getCurrentContent()
      contentStateAfterEndStr = Modifier.insertText(
        contentWithEntity,
        selectionStateAfterTrimmedText,
        endStr
      )
    }
    newEditorState = EditorState.push(
      editorState,
      contentStateWithFocusAtEnd(contentStateAfterEndStr, selectionStateAfterTrimmedText),
      'apply-entity'
    )
    setEditorState(newEditorState)
    setTimeout(() => editorRef.current && editorRef.current.focus(), 0)
  }

  const handleEscape = () => {
    setTimeout(() => editorRef.current && editorRef.current.focus(), 0)
  }

  return (
    <EditorLinkChangerModal
      text={text}
      link={link}
      removeModal={removeModal}
      handleSubmit={handleSubmit}
      handleEscape={handleEscape}
      originCoords={originCoords}
    />
  )
}

export default EditorLinkChangerDraftjs
