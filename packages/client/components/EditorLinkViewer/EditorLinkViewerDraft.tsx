import {EditorState} from 'draft-js'
import React from 'react'
import {BBox} from '../../types/animations'
import removeLink from '../../utils/draftjs/removeLink'
import EditorLinkViewer from './EditorLinkViewer'

interface Props {
  href: string
  addHyperlink: () => void
  editorState: EditorState
  originCoords: BBox
  setEditorState: (newEditorState: EditorState) => void
  removeModal: () => void
}

const EditorLinkViewerDraft = (props: Props) => {
  const {href, addHyperlink, editorState, removeModal, setEditorState, originCoords} = props

  const handleRemove = () => {
    setEditorState(removeLink(editorState))
  }

  return (
    <EditorLinkViewer
      href={href}
      addHyperlink={addHyperlink}
      onRemove={handleRemove}
      originCoords={originCoords}
      removeModal={removeModal}
    />
  )
}

export default EditorLinkViewerDraft
