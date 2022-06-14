import {Editor} from '@tiptap/react'
import React, {useState} from 'react'
import {BBox} from '~/types/animations'
import EditorLinkChangerModal from './EditorLinkChangerModal'

interface Props {
  link: string | null

  originCoords: BBox
  removeModal(allowFocus: boolean): void

  tiptapEditor: Editor

  text: string | null
}

const EditorLinkChangerTipTap = (props: Props) => {
  const {text, link, removeModal, originCoords, tiptapEditor} = props
  const [selection] = useState(tiptapEditor.view.state.selection)
  const handleSubmit = ({text: newText, href}) => {
    tiptapEditor
      .chain()
      .focus()
      .setTextSelection(selection)
      .setLink({href})
      .command(({tr}) => {
        if (text !== newText) {
          // Replace the existing text iff it was changed.
          tr.insertText(newText)
        }

        return true
      })
      .run()
  }

  return (
    <EditorLinkChangerModal
      text={text}
      link={link}
      removeModal={removeModal}
      handleSubmit={handleSubmit}
      originCoords={originCoords}
    />
  )
}

export default EditorLinkChangerTipTap
