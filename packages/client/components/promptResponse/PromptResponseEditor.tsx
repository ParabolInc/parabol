import styled from '@emotion/styled'
import {Editor as EditorState} from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import {EditorContent, JSONContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import areEqual from 'fbjs/lib/areEqual'
import React, {useState} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {Radius} from '~/types/constEnums'
import BaseButton from '../BaseButton'

const SubmissionButtonWrapper = styled('div')({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center'
})

const SubmitButton = styled(BaseButton)<{disabled?: boolean}>(({disabled}) => ({
  backgroundColor: disabled ? PALETTE.SLATE_200 : PALETTE.SKY_500,
  opacity: 1,
  borderRadius: Radius.BUTTON_PILL,
  color: disabled ? PALETTE.SLATE_600 : '#FFFFFF',
  outline: 0,
  marginTop: 12,
  padding: '4px 12px 4px 12px',
  fontSize: 14,
  lineHeight: '20px',
  fontWeight: 400
}))

const CancelButton = styled(SubmitButton)({
  backgroundColor: PALETTE.SLATE_200,
  marginRight: 12,
  color: PALETTE.SLATE_700
})

const StyledEditor = styled('div')`
  .ProseMirror {
    min-height: 40px;
  }

  .ProseMirror :is(ul, ol) {
    list-style-position: outside;
    padding-inline-start: 16px;
    margin-block-start: 16px;
    margin-block-end: 16px;
  }

  .ProseMirror :is(ol) {
    margin-inline-start: 2px;
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

  const onSubmit = (newEditorState: EditorState) => {
    setEditing(false)
    const newContent = newEditorState.getJSON()

    // to avoid creating an empty post on first blur
    if (!content && newEditorState.isEmpty) return

    if (areEqual(content, newContent)) return

    handleSubmit?.(newEditorState)
  }

  const onCancel = (editor: EditorState) => {
    setEditing(false)
    editor?.commands.setContent(content)
  }

  const editor = useEditor(
    {
      content,
      extensions: createEditorExtensions(placeholder),
      autofocus: autoFocus,
      onUpdate,
      editable: !readOnly
    },
    [content]
  )

  return (
    <>
      <StyledEditor>
        <EditorContent editor={editor} />
      </StyledEditor>
      <SubmissionButtonWrapper>
        {!!content && _isEditing && (
          <CancelButton onClick={() => editor && onCancel(editor)} size='medium'>
            Cancel
          </CancelButton>
        )}
        {(!content || _isEditing) && (
          <SubmitButton
            onClick={() => editor && onSubmit(editor)}
            size='medium'
            disabled={!editor || editor.isEmpty}
          >
            {!content ? 'Submit' : 'Update'}
          </SubmitButton>
        )}
      </SubmissionButtonWrapper>
    </>
  )
}
export default PromptResponseEditor
