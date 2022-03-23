import React, {useEffect, useState} from 'react'
import Placeholder from '@tiptap/extension-placeholder'
import {EditorContent, EditorEvents, useEditor, JSONContent} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

interface Props {
  autoFocus?: boolean
  initialDoc: JSONContent
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
    const nextDoc = editor.getJSON()
    setEditing(true)
    setDoc(nextDoc)
  }

  const onSubmit = async ({editor}: EditorEvents['blur']) => {
    const nextDoc = editor.getJSON()
    setEditing(false)
    setDoc(nextDoc)
    handleSubmit(JSON.stringify(nextDoc))
  }

  const showPlaceholder = !doc.text && !!placeholder
  const editor = useEditor({
    content: doc,
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
