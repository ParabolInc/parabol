import {type Editor, Extension} from '@tiptap/core'
import Mention from '@tiptap/extension-mention'
import {CharacterCount, Placeholder} from '@tiptap/extensions'
import {type JSONContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useUploadUserAsset} from '../../mutations/useUploadUserAsset'
import {isEqualWhenSerialized} from '../../shared/isEqualWhenSerialized'
import {InsertedRangeHighlight} from '../../tiptap/extensions/insertedRangeHighlight/InsertedRangeHighlight'
import {SlashCommand} from '../../tiptap/extensions/slashCommand/SlashCommand'
import {Button} from '../../ui/Button/Button'
import {cn} from '../../ui/cn'
import {modEnter} from '../../utils/platform'
import {tiptapEmojiConfig} from '../../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../../utils/tiptapMentionConfig'
import {LoomExtension, unfurlLoomLinks} from '../TipTapEditor/LoomExtension'
import {TipTapEditor} from '../TipTapEditor/TipTapEditor'
import {TiptapLinkExtension} from '../TipTapEditor/TiptapLinkExtension'
import {useStreamedEditorContent} from '../TipTapEditor/useStreamedEditorContent'
import {STANDUP_SLASH_COMMANDS, standupBlockExtensions} from './standupEditorExtensions'

const submitButtonClasses = 'mt-3 rounded-[6px] px-3 py-1 font-normal text-sm leading-5 opacity-100'

const RESPONSE_CHARACTER_LIMIT = 500

interface Props {
  autoFocus?: boolean
  teamId: string
  content: JSONContent | null
  handleSubmit?: (editor: Editor) => void
  readOnly: boolean
  placeholder?: string
  draftStorageKey?: string
  showActions?: boolean
  onChange?: (editor: Editor) => void
  onModEnter?: () => void
  onTab?: () => void
  onFocusChange?: (isFocused: boolean) => void
  showListControls?: boolean
  enableSlashCommands?: boolean
  className?: string
  editorRef?: React.MutableRefObject<Editor | null>
}

const PromptResponseEditor = (props: Props) => {
  const {
    autoFocus: autoFocusProp = false,
    content: rawContent,
    handleSubmit,
    readOnly,
    placeholder,
    teamId,
    draftStorageKey,
    showActions = true,
    onChange,
    onModEnter,
    onTab,
    onFocusChange,
    showListControls,
    enableSlashCommands = false,
    className,
    editorRef
  } = props
  const atmosphere = useAtmosphere()
  const [uploadUserAsset] = useUploadUserAsset()
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const onModEnterRef = useRef(onModEnter)
  onModEnterRef.current = onModEnter
  const onTabRef = useRef(onTab)
  onTabRef.current = onTab
  const onFocusChangeRef = useRef(onFocusChange)
  onFocusChangeRef.current = onFocusChange
  const [isEditing, setIsEditing] = useState(false)
  const [autoFocus, setAutoFocus] = useState(autoFocusProp)
  const [isEditorEmpty, setIsEditorEmpty] = useState(true)

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
      setIsEditorEmpty(editor.isEmpty)
      if (draftStorageKey) {
        window.localStorage.setItem(draftStorageKey, JSON.stringify(editor.getJSON()))
      }
      onChangeRef.current?.(editor)
    },
    [setEditing, draftStorageKey]
  )

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
        StarterKit.configure({link: false}),
        CharacterCount.configure({limit: RESPONSE_CHARACTER_LIMIT}),
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder
        }),
        Mention.configure(tiptapMentionConfig(atmosphere, teamId)),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false
        }),
        InsertedRangeHighlight,
        Extension.create({
          name: 'promptEditorKeyboardShortcuts',
          addKeyboardShortcuts(this) {
            return {
              'Mod-Enter': () => {
                if (onModEnterRef.current) {
                  onModEnterRef.current()
                  return true
                }
                onSubmit()
                return true
              },
              Tab: ({editor}) => {
                if (editor.isActive('listItem') || editor.isActive('taskItem')) return false
                if (onTabRef.current) {
                  onTabRef.current()
                  return true
                }
                return false
              }
            }
          }
        }),
        ...standupBlockExtensions({
          teamId,
          atmosphere,
          commit: uploadUserAsset,
          editorWidth: 600 - 16 * 2
        }),
        ...(enableSlashCommands ? [SlashCommand.configure(STANDUP_SLASH_COMMANDS)] : [])
      ],
      autofocus: autoFocus,
      onUpdate,
      onFocus: () => onFocusChangeRef.current?.(true),
      onBlur: () => onFocusChangeRef.current?.(false),
      editable: !readOnly
    },
    // Intentionally omit `content`: we don't want to recreate the editor when the response grows.
    // Content updates are reconciled in the effect below so appended text can stream in word by word.
    [readOnly, onUpdate]
  )

  // Reconcile content updates into the editor: appended blocks (e.g. "Add to response") stream in
  // word by word, everything else applies instantly. See the hook for the full reconciliation rules.
  useStreamedEditorContent(editor, content, {wordDelayMs: 3})

  useEffect(() => {
    if (editorRef) editorRef.current = editor ?? null
  }, [editor, editorRef])

  const onSubmit = useCallback(() => {
    if (!editor) return
    setEditing(false)
    const newContentJSON = editor.getJSON()

    // to avoid creating an empty post on first blur
    if (!content && editor.isEmpty) return

    if (isEqualWhenSerialized(content, newContentJSON)) return

    handleSubmit?.(editor)
  }, [setEditing, content, editor, handleSubmit])

  const hasRestoredDraftRef = useRef(false)
  useEffect(() => {
    // Attempt to reload draft persisted to localstorage. Only run once per mount: later `content`
    // changes (e.g. when "Add to response" writes to the store) are reconciled by the streaming
    // effect above, and re-running this would clobber that fresh content with a stale draft.
    if (!editor || readOnly || !draftStorageKey) return
    if (hasRestoredDraftRef.current) return
    hasRestoredDraftRef.current = true

    const maybeDraft = window.localStorage.getItem(draftStorageKey)
    if (!maybeDraft) {
      return
    }

    const draftContent: JSONContent = JSON.parse(maybeDraft)
    if (isEqualWhenSerialized(content, draftContent)) return

    setEditing(true)
    editor.commands.setContent(draftContent)
  }, [editor])

  if (!editor) return null

  const buttonTitle = !content ? 'Submit' : 'Update'
  return (
    <>
      <TipTapEditor
        editor={editor}
        showBubbleMenu={!readOnly}
        showListControls={showListControls}
        className={cn('standup-editor', className)}
      />
      {!readOnly && showActions && (
        // The render conditions for these buttons *should* only be true when 'readOnly' is false, but let's be explicit
        // about it.
        <div className='flex items-center justify-end'>
          {!!content && isEditing && (
            <Button
              className={cn(submitButtonClasses, 'mr-3 bg-surface-well text-fg-primary')}
              onClick={() => onCancel()}
              size='md'
              aria-label='Cancel changes'
              title='Cancel changes'
            >
              Cancel
            </Button>
          )}
          {(!content || isEditing) && (
            <Button
              className={cn(
                submitButtonClasses,
                !editor || isEditorEmpty ? 'bg-surface-well text-fg-muted' : 'bg-accent text-white'
              )}
              onClick={() => onSubmit()}
              size='md'
              disabled={!editor || isEditorEmpty}
              aria-label={`${buttonTitle} your response`}
              title={`${buttonTitle} your response ${modEnter}`}
            >
              {buttonTitle}
            </Button>
          )}
        </div>
      )}
    </>
  )
}
export default PromptResponseEditor
