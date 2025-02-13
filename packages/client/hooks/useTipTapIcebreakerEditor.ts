import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {generateText, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {BlurOnSubmit} from '../tiptap/BlurOnSubmit'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {useTipTapEditorContent} from './useTipTapEditorContent'

export const useTipTapIcebreakerEditor = (content: string, options: {readOnly?: boolean}) => {
  const {readOnly} = options
  const [contentJSON, editorRef] = useTipTapEditorContent(content)
  editorRef.current = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit,
        Underline,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: 'e.g. How are you?'
        }),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        BlurOnSubmit
      ],
      editable: !readOnly,
      autofocus: generateText(contentJSON, serverTipTapExtensions).length === 0
    },
    [contentJSON, readOnly]
  )
  return {editor: editorRef.current}
}
