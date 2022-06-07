import styled from '@emotion/styled'
import {Editor as EditorState} from '@tiptap/core'
import {EditorContent, EditorEvents, JSONContent, PureEditorContent, useEditor} from '@tiptap/react'
import areEqual from 'fbjs/lib/areEqual'
import React, {useRef, useState} from 'react'
import useForceUpdate from '~/hooks/useForceUpdate'
import {PALETTE} from '~/styles/paletteV3'
import {BBox} from '~/types/animations'
import EditorLinkChangerTipTap from '../EditorLinkChanger/EditorLinkChangerTipTap'
import {createEditorExtensions} from './tiptapConfig'

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

  a {
    text-decoration: underline;
    color: ${PALETTE.SLATE_600};
    :hover {
      cursor: pointer;
    }
  }
`

interface Props {
  autoFocus?: boolean
  content: JSONContent | null
  handleSubmit?: (editor: EditorState) => void
  readOnly: boolean
  placeholder?: string
}

const PromptResponseEditor = (props: Props) => {
  const {autoFocus: autoFocusProp, content, handleSubmit, readOnly, placeholder} = props
  const [_isEditing, setIsEditing] = useState(autoFocusProp ?? false)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)
  const [linkMenuProps, setLinkMenuProps] = useState<{text: string; href: string} | undefined>()
  const editorRef = useRef<PureEditorContent>(null)
  const forceUpdate = useForceUpdate()

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

    // to avoid creating an empty post on first blur
    if (!content && newEditorState.isEmpty) return

    if (areEqual(content, newContent)) return

    handleSubmit?.(newEditorState)
  }

  const editor = useEditor(
    {
      content,
      extensions: createEditorExtensions(setLinkMenuProps, placeholder),
      autofocus: autoFocus,
      onUpdate,
      onBlur: onSubmit,
      editable: !readOnly
    },
    [content, setLinkMenuProps]
  )

  const cachedCoordsRef = useRef<BBox | null>(null)

  const renderLinkChanger = () => {
    const originCoords = editorRef.current?.editorContentRef.current.getBoundingClientRect()
    if (originCoords) {
      cachedCoordsRef.current = originCoords
    }
    if (!cachedCoordsRef.current) {
      setTimeout(forceUpdate)
      return null
    }

    return (
      editor &&
      linkMenuProps && (
        <EditorLinkChangerTipTap
          text={linkMenuProps.text}
          link={linkMenuProps.href}
          tiptapEditor={editor}
          originCoords={originCoords}
          removeModal={() => {
            setLinkMenuProps(undefined)
          }}
        />
      )
    )
  }

  return (
    <StyledEditor>
      {renderLinkChanger()}
      <EditorContent ref={editorRef} editor={editor} />
    </StyledEditor>
  )
}
export default PromptResponseEditor
