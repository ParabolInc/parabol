import {Editor} from '@tiptap/react'
import React from 'react'
import {BBox} from '../../types/animations'
import EditorLinkViewer from './EditorLinkViewer'

interface Props {
  href: string
  addHyperlink: () => void
  tiptapEditor: Editor
  originCoords: BBox
  removeModal: () => void
}

const EditorLinkViewerDraft = (props: Props) => {
  const {href, addHyperlink, removeModal, tiptapEditor, originCoords} = props

  const handleRemove = () => {
    const {from, to} = tiptapEditor.view.state.selection
    if (to === from) {
      // TipTap won't correctly extend to the full mark if the cursor is just to the right of the link.
      tiptapEditor.commands.setTextSelection({to: to - 1, from: from - 1})
    }

    tiptapEditor.chain().extendMarkRange('link').unsetLink().run()
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
