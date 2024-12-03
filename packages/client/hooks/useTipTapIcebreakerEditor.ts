import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import {Extension, generateText, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
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
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: 'e.g. How are you?'
        }),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        Extension.create({
          name: 'blurOnSubmit',
          addKeyboardShortcuts(this) {
            const submit = () => {
              this.editor.commands.blur()
              return true
            }
            return {
              Enter: submit,
              Tab: submit
            }
          }
        })
      ],
      editable: !readOnly,
      autofocus: generateText(contentJSON, serverTipTapExtensions).length === 0
    },
    [contentJSON, readOnly]
  )
  return {editor: editorRef.current}
}
