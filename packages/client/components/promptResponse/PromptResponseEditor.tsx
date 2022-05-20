import styled from '@emotion/styled'
import {Editor as EditorState} from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import {EditorContent, EditorEvents, JSONContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import areEqual from 'fbjs/lib/areEqual'
import React, {useState} from 'react'

const StyledEditor = styled('div')`
  .ProseMirror {
    min-height: 40px;
  }
  .ProseMirror p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }
  .ProseMirror-focused:focus {
    outline: none;
  }
`
/**
 * Returns tip tap extensions configuration shared by the client and the server
 * @param placeholder
 * @returns an array of extensions to be used by the tip tap editor
 */
export const createEditorExtensions = (placeholder?: string) => [
  StarterKit,
  Placeholder.configure({
    placeholder
  })
]

interface Props {
  autoFocus?: boolean
  content: JSONContent | null
  handleSubmit?: (editor: EditorState) => void
  readOnly: boolean
  placeholder?: string
}

const PromptResponseEditor = (props: Props) => {
  const {autoFocus: autoFocusProp, content, handleSubmit, readOnly, placeholder} = props
  const [_isEditing, setIsEditing] = useState(false)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)

  const setEditing = (isEditing: boolean) => {
    setIsEditing(isEditing)
    setAutoFocus(false)
  }

  const onUpdate = () => {
    setEditing(true)
  }

  const onSubmit = ({editor: newEditorState}: EditorEvents['blur']) => {
    setEditing(false)
    const newContent = newEditorState.getJSON()

    if (areEqual(content, newContent)) return

    handleSubmit?.(newEditorState)
  }

  const editor = useEditor(
    {
      content,
      extensions: createEditorExtensions(placeholder),
      autofocus: autoFocus,
      onUpdate,
      onBlur: onSubmit,
      editable: !readOnly
    },
    [content]
  )

  return (
    <StyledEditor>
      <EditorContent editor={editor} />
    </StyledEditor>
  )
}
export default PromptResponseEditor
