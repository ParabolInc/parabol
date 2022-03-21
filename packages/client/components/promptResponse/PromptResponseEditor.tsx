import styled from '@emotion/styled'
import React, {useEffect, useState} from 'react'
import {Card} from '../../types/constEnums'
import Placeholder from '@tiptap/extension-placeholder'
import {EditorContent, EditorEvents, JSONContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const RootEditor = styled('div')<{noText: boolean; readOnly: boolean | undefined}>(
  ({noText, readOnly}) => ({
    cursor: readOnly ? undefined : 'text',
    fontSize: Card.FONT_SIZE,
    lineHeight: Card.LINE_HEIGHT,
    padding: `0 ${Card.PADDING}`,
    height: noText ? '2.75rem' : undefined // Use this if the placeholder wraps
  })
)

interface Props {
  autoFocus?: boolean
  initialValue: string
  handleSubmit: (value: string) => void
  readOnly: boolean
  placeholder: string
}

const PromptResponseEditor = (props: Props) => {
  const {autoFocus: autoFocusProp, initialValue,  handleSubmit, readOnly, placeholder} = props
  const [isEditing, setIsEditing] = useState(false)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)
  const [value, setValue] = useState(initialValue)
  useEffect(() => {
    if (isEditing) return
    setValue(initialValue)
  }, [initialValue])

  const setEditing = (isEditing: boolean) => {
    setIsEditing(isEditing)
    setAutoFocus(false)
  }

  const onUpdate = ({editor}: EditorEvents['update']) => {
    const nextValue = editor.getText()
    setEditing(true)
    setValue(nextValue)
  }

  const onFocus = ({editor}: EditorEvents['focus']) => {
    if (editor.getText().toLowerCase().startsWith(placeholder.toLowerCase())) {
      editor.commands.selectAll()
    }
  }

  const onSubmit = async ({editor}: EditorEvents['blur']) => {
    const nextValue = editor.getText()
    setEditing(false)
    setValue(nextValue)
    handleSubmit(nextValue)
  }

  const reset = () => {
    setEditing(false)
    setValue(initialValue)
    editor?.commands.blur()
  }

  const onKeyDown = (_view, event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setTimeout(reset)
      return true
    }
    return false
  }

  const showPlaceholder = !value && placeholder
  const editor = useEditor({
    content: value,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: showPlaceholder ? placeholder : ''
      })
    ],
    editorProps: {
      handleKeyDown: onKeyDown,
    },
    autofocus: true,
    onUpdate,
    onFocus,
    onBlur: onSubmit,
  })

  //const noText = value.text === ''
  return (
    <EditorContent
      editor={editor}
    />
  )
}
export default PromptResponseEditor
