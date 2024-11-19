import styled from '@emotion/styled'
import {Link} from '@mui/icons-material'
import {Editor as EditorState} from '@tiptap/core'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import {BubbleMenu, EditorContent, JSONContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import areEqual from 'fbjs/lib/areEqual'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {Radius} from '~/types/constEnums'
import useAtmosphere from '../../hooks/useAtmosphere'
import {tiptapEmojiConfig} from '../../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../../utils/tiptapMentionConfig'
import BaseButton from '../BaseButton'
import isTextSelected from './isTextSelected'
import LinkMenu, {LinkMenuState} from './LinkMenu'
import {LoomExtension, unfurlLoomLinks} from './loomExtension'
import {TiptapLink} from './TiptapLink'

const LinkIcon = styled(Link)({
  height: 18,
  width: 18
})

const BubbleMenuWrapper = styled('div')({
  display: 'flex',
  alignItems: 'center',
  background: '#FFFFFF',
  border: '1px solid',
  borderRadius: '4px',
  borderColor: PALETTE.SLATE_600,
  padding: '4px'
})

const BubbleMenuButton = styled(BaseButton)<{isActive?: boolean}>(({isActive}) => ({
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

interface Props {
  autoFocus?: boolean
  teamId: string
  content: JSONContent | null
  handleSubmit?: (editor: EditorState) => void
  readOnly: boolean
  placeholder?: string
  draftStorageKey?: string
}

const PromptResponseEditor = (props: Props) => {
  const {
    autoFocus: autoFocusProp,
    content: rawContent,
    handleSubmit,
    readOnly,
    placeholder,
    teamId,
    draftStorageKey
  } = props
  const atmosphere = useAtmosphere()
  const [isEditing, setIsEditing] = useState(false)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)

  const content = useMemo(
    () => (rawContent && readOnly ? unfurlLoomLinks(rawContent) : rawContent),
    [rawContent, readOnly]
  )

  const editorRef = useRef<HTMLDivElement>(null)

  const setEditing = useCallback(
    (newIsEditing: boolean) => {
      setIsEditing(newIsEditing)
      setAutoFocus(false)
    },
    [setIsEditing, setAutoFocus]
  )

  const onUpdate = useCallback(
    ({editor: editorState}: {editor: EditorState}) => {
      setEditing(true)
      if (draftStorageKey) {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(editorState.getJSON()))
      }
    },
    [setEditing, draftStorageKey]
  )

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
    if (draftStorageKey) {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(content))
    }
  }

  const [linkState, setLinkState] = useState<LinkMenuState>(null)

  const openLinkEditor = () => {
    setLinkState('edit')
  }

  const editor = useEditor(
    {
      content,
      extensions: [
        StarterKit,
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder
        }),
        Mention.configure(tiptapMentionConfig(atmosphere, teamId)),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLink.configure({
          openOnClick: false,
          popover: {
            setLinkState
          }
        })
      ],
      autofocus: autoFocus,
      onUpdate,
      editable: !readOnly
    },
    [content, readOnly, onSubmit, onUpdate]
  )

  useEffect(() => {
    // Attempt to reload draft persisted to localstorage.
    if (!draftStorageKey || readOnly) {
      return
    }

    const maybeDraft = window.localStorage.getItem(draftStorageKey)
    if (!maybeDraft) {
      return
    }

    const draftContent: JSONContent = JSON.parse(maybeDraft)
    if (areEqual(content, draftContent)) return

    setEditing(true)
    editor?.commands.setContent(draftContent)
  }, [editor])

  const shouldShowBubbleMenu = () => {
    if (!editor || editor.isActive('link')) return false
    return isTextSelected(editor)
  }

  return (
    <>
      <div>
        {editor && !readOnly && (
          <>
            <div>
              <BubbleMenu
                editor={editor}
                tippyOptions={{duration: 100}}
                shouldShow={shouldShowBubbleMenu}
              >
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
                  <BubbleMenuButton onClick={openLinkEditor}>
                    <LinkIcon />
                  </BubbleMenuButton>
                </BubbleMenuWrapper>
              </BubbleMenu>
            </div>
            <LinkMenu
              editor={editor}
              setLinkState={(linkState: LinkMenuState) => {
                editor.commands.focus()
                setLinkState(linkState)
              }}
              linkState={linkState}
            />
          </>
        )}
        <EditorContent ref={editorRef} editor={editor} />
      </div>
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
