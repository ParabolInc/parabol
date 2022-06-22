import styled from '@emotion/styled'
import {Editor as EditorState} from '@tiptap/core'
import {EditorContent, EditorEvents, JSONContent, PureEditorContent, useEditor} from '@tiptap/react'
import areEqual from 'fbjs/lib/areEqual'
import React, {useCallback, useRef, useState} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import EditorLinkChangerTipTap from '../EditorLinkChanger/EditorLinkChangerTipTap'
import EditorLinkViewerTipTap from '../EditorLinkViewer/EditorLinkViewerTipTap'
import {createEditorExtensions, getLinkProps, LinkMenuProps, LinkPreviewProps} from './tiptapConfig'

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
  const [_isEditing, setIsEditing] = useState(false)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)

  const [linkOverlayProps, setLinkOverlayProps] = useState<
    | {
        linkMenuProps: LinkMenuProps
        linkPreviewProps: undefined
      }
    | {
        linkMenuProps: undefined
        linkPreviewProps: LinkPreviewProps
      }
    | undefined
  >()

  const setLinkMenuProps = useCallback(
    (props: LinkMenuProps) => {
      setLinkOverlayProps({linkMenuProps: props, linkPreviewProps: undefined})
    },
    [setLinkOverlayProps]
  )
  const setLinkPreviewProps = useCallback(
    (props: LinkPreviewProps) => {
      setLinkOverlayProps({linkPreviewProps: props, linkMenuProps: undefined})
    },
    [setLinkOverlayProps]
  )

  const editorRef = useRef<PureEditorContent>(null)

  const setEditing = useCallback(
    (isEditing: boolean) => {
      setIsEditing(isEditing)
      setAutoFocus(false)
    },
    [setIsEditing, setAutoFocus]
  )

  const onUpdate = useCallback(() => {
    setEditing(true)
  }, [setEditing])

  const onSubmit = useCallback(
    ({editor: newEditorState}: EditorEvents['blur']) => {
      setEditing(false)
      const newContent = newEditorState.getJSON()

      // to avoid creating an empty post on first blur
      if (!content && newEditorState.isEmpty) return

      if (areEqual(content, newContent)) return

      handleSubmit?.(newEditorState)
    },
    [setEditing, content, handleSubmit]
  )

  const editor = useEditor(
    {
      content,
      extensions: createEditorExtensions(
        readOnly,
        setLinkMenuProps,
        setLinkPreviewProps,
        setLinkOverlayProps,
        placeholder
      ),
      autofocus: autoFocus,
      onUpdate,
      onBlur: onSubmit,
      editable: !readOnly
    },
    [
      content,
      readOnly,
      setLinkMenuProps,
      setLinkPreviewProps,
      setLinkOverlayProps,
      onSubmit,
      onUpdate
    ]
  )

  const onAddHyperlink = () => {
    if (!editor) {
      return
    }

    setLinkMenuProps(getLinkProps(editor))
  }

  return (
    <StyledEditor>
      {editor && linkOverlayProps?.linkMenuProps && (
        <EditorLinkChangerTipTap
          text={linkOverlayProps.linkMenuProps.text}
          link={linkOverlayProps.linkMenuProps.href}
          tiptapEditor={editor}
          originCoords={linkOverlayProps.linkMenuProps.originCoords}
          removeModal={() => {
            setLinkOverlayProps(undefined)
          }}
        />
      )}
      {editor && linkOverlayProps?.linkPreviewProps && (
        <EditorLinkViewerTipTap
          href={linkOverlayProps.linkPreviewProps.href}
          tiptapEditor={editor}
          addHyperlink={onAddHyperlink}
          originCoords={linkOverlayProps.linkPreviewProps.originCoords}
          removeModal={() => {
            setLinkOverlayProps(undefined)
          }}
        />
      )}
      <EditorContent ref={editorRef} editor={editor} />
    </StyledEditor>
  )
}
export default PromptResponseEditor
