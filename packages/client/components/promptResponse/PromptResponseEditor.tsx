import React, {useEffect, useState} from 'react'
import Placeholder from '@tiptap/extension-placeholder'
import {EditorContent, EditorEvents, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface Props {
  autoFocus?: boolean
  initialDoc: string
  handleSubmit: (value: string) => void
  readOnly: boolean
  placeholder: string
}

const PromptResponseEditor = (props: Props) => {
  const {autoFocus: autoFocusProp, initialDoc,  handleSubmit, readOnly, placeholder} = props
  const [isEditing, setIsEditing] = useState(false)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)
  const [doc, setDoc] = useState(initialDoc)
  useEffect(() => {
    if (isEditing) return
    setDoc(initialDoc)
  }, [initialDoc])

  const setEditing = (isEditing: boolean) => {
    setIsEditing(isEditing)
    setAutoFocus(false)
  }

  const onUpdate = ({editor}: EditorEvents['update']) => {
    const nextDoc = JSON.stringify(editor.getJSON())
    setEditing(true)
    setDoc(nextDoc)
  }

  const onFocus = ({editor}: EditorEvents['focus']) => {
    if (editor.getText().toLowerCase().startsWith(placeholder.toLowerCase())) {
      editor.commands.selectAll()
    }
  }

  const onSubmit = async ({editor}: EditorEvents['blur']) => {
    const nextDoc = JSON.stringify(editor.getJSON())
    setEditing(false)
    setDoc(nextDoc)
    console.log(nextDoc)
    handleSubmit(nextDoc)
  }

  const reset = () => {
    setEditing(false)
    setDoc(initialDoc)
    editor?.commands.blur()
  }

  const onKeyDown = (_view: any, event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setTimeout(reset)
      return true
    }
    return false
  }

  const showPlaceholder = !doc && placeholder
  const editor = useEditor({
    content: JSON.parse(doc),
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: showPlaceholder ? placeholder : ''
      })
    ],
    editorProps: {
      handleKeyDown: onKeyDown,
    },
    autofocus: autoFocus,
    onUpdate,
    onFocus,
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
