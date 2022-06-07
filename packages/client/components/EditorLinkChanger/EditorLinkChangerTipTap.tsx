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
  const handleSubmit = ({text, href}) => {
    tiptapEditor.chain().focus().setTextSelection(selection).setLink({href}).run()
    console.log(text, href)
  }

  const handleEscape = () => {
    /* noop */
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
