import Highlight from '@tiptap/extension-highlight'
import Mention from '@tiptap/extension-mention'
import {Placeholder} from '@tiptap/extensions'
import {Extension, type JSONContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useMemo, useRef} from 'react'
import type Atmosphere from '../Atmosphere'
import {LoomExtension} from '../components/TipTapEditor/LoomExtension'
import {TiptapLinkExtension} from '../components/TipTapEditor/TiptapLinkExtension'
import {SafeTextStyleKit} from '../shared/tiptap/extensions/SafeTextStyleKit'
import {mentionConfig} from '../shared/tiptap/serverTipTapExtensions'
import {ClearOnSubmit} from '../tiptap/extensions/ClearOnSubmit'
import {PopoverMention} from '../tiptap/extensions/popoverMention/PopoverMention'
import {MentionTaskTag} from '../utils/MentionTaskTag'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'
import {tiptapTagConfig} from '../utils/tiptapTagConfig'
import {useTipTapEditorSync} from './useTipTapEditorSync'

const isValid = <T>(obj: T | undefined | null | boolean): obj is T => {
  return !!obj
}

export const useTipTapCommentEditor = (
  content: string,
  options: {
    atmosphere?: Atmosphere
    teamId?: string
    readOnly?: boolean
    placeholder?: string
    onEnter?: () => void
    onEscape?: () => void
  }
) => {
  const {atmosphere, teamId, readOnly, placeholder, onEnter, onEscape} = options
  const contentJSON = useMemo(() => JSON.parse(content) as JSONContent, [content])
  const placeholderRef = useRef(placeholder)
  // Keeping it in a ref means we don't have to re-initialize the editor, so content is preserved
  placeholderRef.current = placeholder
  const editor = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit.configure({link: false}),
        Highlight,
        SafeTextStyleKit,
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: () => {
            return placeholderRef.current || 'Edit your comment'
          }
        }),
        PopoverMention,
        MentionTaskTag.configure(tiptapTagConfig),
        Mention.configure(
          atmosphere && teamId ? tiptapMentionConfig(atmosphere, teamId) : mentionConfig
        ),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false
        }),
        ClearOnSubmit,
        onEnter &&
          onEscape &&
          Extension.create({
            name: 'commentKeyboardShortcuts',
            addKeyboardShortcuts(this) {
              return {
                Enter: () => {
                  onEnter()
                  return true
                },
                Escape: () => {
                  onEscape()
                  return true
                }
              }
            }
          })
      ].filter(isValid),
      editable: !readOnly
    },
    []
  )
  useTipTapEditorSync(editor, contentJSON, !readOnly)
  return {editor}
}
