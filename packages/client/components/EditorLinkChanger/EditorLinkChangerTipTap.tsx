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
  const handleSubmit = ({text: newText, href}: {text: string; href: string}) => {
    tiptapEditor
      .chain()
      .focus()
      .setTextSelection(selection)
      .command(({tr}) => {
        if (text !== newText) {
          // Replace the existing text iff it was changed.
          tr.insertText(newText)
        }

        return true
      })
      // Something weird happens with the selection when the Link extension's 'inclusive' attribute is 'false' and we
      // change the text, so manually update the selection with what it should be based on the change in text length.
      .setTextSelection({
        from: selection.from,
        to: selection.to + newText.length - (text?.length ?? 0)
      })
      .setLink({href})
      .run()
  }

  const handleEscape = () => {
    setTimeout(() => tiptapEditor.commands.focus(), 0)
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

export default EditorLinkChangerTipTap
