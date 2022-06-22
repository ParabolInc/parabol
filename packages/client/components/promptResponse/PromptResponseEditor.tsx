import styled from '@emotion/styled'
import {Editor as EditorState} from '@tiptap/core'
import {BubbleMenu, EditorContent, JSONContent, PureEditorContent, useEditor} from '@tiptap/react'
import areEqual from 'fbjs/lib/areEqual'
import React, {useCallback, useRef, useState} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {Radius} from '~/types/constEnums'
import BaseButton from '../BaseButton'
import EditorLinkChangerTipTap from '../EditorLinkChanger/EditorLinkChangerTipTap'
import EditorLinkViewerTipTap from '../EditorLinkViewer/EditorLinkViewerTipTap'
import {createEditorExtensions, getLinkProps, LinkMenuProps, LinkPreviewProps} from './tiptapConfig'

const BubbleMenuWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  background: '#FFFFFF',
  border: '1px solid',
  borderRadius: '4px',
  borderColor: PALETTE.SLATE_600,
  padding: '4px'
})

const BubbleMenuButton = styled(BaseButton)<{isActive: boolean}>(({isActive}) => ({
  height: '20px',
  width: '22px',
  padding: '4px 0px 4px 0px',
  borderRadius: '2px',
  background: isActive ? PALETTE.SLATE_300 : undefined,
  ':hover': {
    background: PALETTE.SLATE_300
  }
}))

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
  const [isEditing, setIsEditing] = useState(false)
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
    (newIsEditing: boolean) => {
      setIsEditing(newIsEditing)
      setAutoFocus(false)
    },
    [setIsEditing, setAutoFocus]
  )

  const onUpdate = useCallback(() => {
    setEditing(true)
  }, [setEditing])

  const onSubmit = useCallback(
    (newEditorState: EditorState) => {
      setEditing(false)
      const newContent = newEditorState.getJSON()

      // to avoid creating an empty post on first blur
      if (!content && newEditorState.isEmpty) return

      if (areEqual(content, newContent)) return

      handleSubmit?.(newEditorState)
    },
    [setEditing, content, handleSubmit]
  )

  const onCancel = (editor: EditorState) => {
    setEditing(false)
    editor?.commands.setContent(content)
  }

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
    <>
      <StyledEditor>
        {editor && (
          <BubbleMenu editor={editor} tippyOptions={{duration: 100}}>
            <BubbleMenuWrapper>
              <BubbleMenuButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
              >
                <b>B</b>
              </BubbleMenuButton>
              <BubbleMenuButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
              >
                <i>I</i>
              </BubbleMenuButton>
              <BubbleMenuButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
              >
                <s>S</s>
              </BubbleMenuButton>
            </BubbleMenuWrapper>
          </BubbleMenu>
        )}
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
      {!readOnly && (
        // The render conditions for these buttons *should* only be true when 'readOnly' is false, but let's be explicit
        // about it.
        <SubmissionButtonWrapper>
          {!!content && isEditing && (
            <CancelButton onClick={() => editor && onCancel(editor)} size='medium'>
              Cancel
            </CancelButton>
          )}
          {(!content || isEditing) && (
            <SubmitButton
              onClick={() => editor && onSubmit(editor)}
              size='medium'
              disabled={!editor || editor.isEmpty}
            >
              {!content ? 'Submit' : 'Update'}
            </SubmitButton>
          )}
        </SubmissionButtonWrapper>
      )}
    </>
  )
}
export default PromptResponseEditor
