import styled from '@emotion/styled'
import {Editor} from '@tiptap/core'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {JSONContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useCallback, useEffect, useMemo, useState} from 'react'
import {PALETTE} from '~/styles/paletteV3'
import {Radius} from '~/types/constEnums'
import useAtmosphere from '../../hooks/useAtmosphere'
import {isEqualWhenSerialized} from '../../shared/isEqualWhenSerialized'
import {tiptapEmojiConfig} from '../../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../../utils/tiptapMentionConfig'
import BaseButton from '../BaseButton'
import {LoomExtension, unfurlLoomLinks} from './loomExtension'
import {TipTapEditor} from './TipTapEditor'
import {TiptapLinkExtension} from './TiptapLinkExtension'

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
  handleSubmit?: (editor: Editor) => void
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

  const setEditing = useCallback(
    (newIsEditing: boolean) => {
      setIsEditing(newIsEditing)
      setAutoFocus(false)
    },
    [setIsEditing, setAutoFocus]
  )

  const onUpdate = useCallback(
    ({editor}: {editor: Editor}) => {
      setEditing(true)
      if (draftStorageKey) {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(editor.getJSON()))
      }
    },
    [setEditing, draftStorageKey]
  )

  const onSubmit = useCallback(() => {
    if (!editor) return
    setEditing(false)
    const newContentJSON = editor.getJSON()

    // to avoid creating an empty post on first blur
    if (!content && editor.isEmpty) return

    if (isEqualWhenSerialized(content, newContentJSON)) return

    handleSubmit?.(editor)
  }, [setEditing, content, handleSubmit])

  const onCancel = () => {
    setEditing(false)
    editor?.commands.setContent(content)
    if (draftStorageKey) {
      window.localStorage.setItem(draftStorageKey, JSON.stringify(content))
    }
  }

  const editor = useEditor(
    {
      content,
      extensions: [
        StarterKit,
        Underline,
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder
        }),
        Mention.configure(tiptapMentionConfig(atmosphere, teamId)),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false
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
    if (isEqualWhenSerialized(content, draftContent)) return

    setEditing(true)
    editor?.commands.setContent(draftContent)
  }, [editor])

  if (!editor) return null
  return (
    <>
      <TipTapEditor editor={editor} showBubbleMenu={!readOnly} />
      {!readOnly && (
        // The render conditions for these buttons *should* only be true when 'readOnly' is false, but let's be explicit
        // about it.
        <div className='flex items-center justify-end'>
          {!!content && isEditing && (
            <CancelButton onClick={() => onCancel()} size='medium'>
              Cancel
            </CancelButton>
          )}
          {(!content || isEditing) && (
            <SubmitButton
              onClick={() => onSubmit()}
              size='medium'
              disabled={!editor || editor.isEmpty}
            >
              {!content ? 'Submit' : 'Update'}
            </SubmitButton>
          )}
        </div>
      )}
    </>
  )
}
export default PromptResponseEditor
