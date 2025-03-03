import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {Extension, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useRef} from 'react'
import Atmosphere from '../Atmosphere'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {mentionConfig} from '../shared/tiptap/serverTipTapExtensions'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'
import {tiptapTagConfig} from '../utils/tiptapTagConfig'
import {useTipTapEditorContent} from './useTipTapEditorContent'

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
  const [contentJSON, editorRef] = useTipTapEditorContent(content)
  const placeholderRef = useRef(placeholder)
  // Keeping it in a ref means we don't have to re-initialize the editor, so content is preserved
  placeholderRef.current = placeholder
  editorRef.current = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit,
        Underline,
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: () => {
            return placeholderRef.current || 'Edit your comment'
          }
        }),
        Mention.extend({name: 'taskTag'}).configure(tiptapTagConfig),
        Mention.configure(
          atmosphere && teamId ? tiptapMentionConfig(atmosphere, teamId) : mentionConfig
        ),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false
        }),
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
    [readOnly]
  )
  return {editor: editorRef.current}
}
