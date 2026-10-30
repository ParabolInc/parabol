import Mention from '@tiptap/extension-mention'
import {Placeholder} from '@tiptap/extensions'
import {generateText, type JSONContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useMemo} from 'react'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'
import {BlurOnSubmit} from '../tiptap/BlurOnSubmit'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {useTipTapEditorSync} from './useTipTapEditorSync'

export const useTipTapIcebreakerEditor = (content: string, options: {readOnly?: boolean}) => {
  const {readOnly} = options
  const contentJSON = useMemo(() => JSON.parse(content) as JSONContent, [content])
  const editor = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit,
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
    []
  )
  useTipTapEditorSync(editor, contentJSON, !readOnly)
  return {editor}
}
