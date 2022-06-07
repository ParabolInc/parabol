import {EditorState, SelectionState} from 'draft-js'
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
  const handleSubmit = ({text, href}) => {
    const focusedEditorState = EditorState.forceSelection(editorState, selectionState)
    const nextEditorState = completeEntity(focusedEditorState, 'LINK', {href}, text, {
      keepSelection: true
    })
    setEditorState(nextEditorState)
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
