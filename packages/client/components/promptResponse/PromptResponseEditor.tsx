import React, {useState} from 'react'
import Placeholder from '@tiptap/extension-placeholder'
import {EditorContent, Editor, EditorEvents, useEditor} from '@tiptap/react'
import {Editor as EditorState} from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'

interface Props {
  autoFocus?: boolean
  editorState: EditorState
  setEditorState: (newEditorState: EditorState) => void
  handleSubmit: (editor: EditorState) => void
  readOnly: boolean
  placeholder: string
}

const PromptResponseEditor = (props: Props) => {
  const {autoFocus: autoFocusProp, editorState, setEditorState, handleSubmit, readOnly, placeholder} = props
  const [_isEditing, setIsEditing] = useState(false)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)

  const setEditing = (isEditing: boolean) => {
    setIsEditing(isEditing)
    setAutoFocus(false)
  }

  const onUpdate = ({editor: newEditorState}: EditorEvents['update']) => {
    setEditing(true)
    setEditorState(newEditorState)
  }

  const onSubmit = async ({editor: newEditorState}: EditorEvents['blur']) => {
    setEditing(false)
    handleSubmit(newEditorState)
  }

  const doc = editorState.getText()
  const showPlaceholder = !doc && !!placeholder
  const editor: Editor | null = useEditor({
    content: editorState.getJSON(),
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: showPlaceholder ? placeholder : ''
      })
    ],
    autofocus: autoFocus,
    onUpdate,
    onBlur: onSubmit,
    editable: !readOnly,
  })

  return (
    <EditorContent
      editor={editor}
    />
  )
}
export default PromptResponseEditor
