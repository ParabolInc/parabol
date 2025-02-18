import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {TiptapLinkExtension} from 'parabol-client/components/promptResponse/TiptapLinkExtension'
import {useTipTapEditorContent} from 'parabol-client/hooks/useTipTapEditorContent'
import {tiptapEmojiConfig} from 'parabol-client/utils/tiptapEmojiConfig'
import {tiptapTagConfig} from 'parabol-client/utils/tiptapTagConfig'

export const useTipTapTaskEditor = (content: string) => {
  const [contentJSON, editorRef] = useTipTapEditorContent(content)
  editorRef.current = useEditor({
    content: contentJSON,
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        showOnlyWhenEditable: false,
        placeholder: 'Describe what “Done” looks like'
      }),
      Mention.extend({name: 'taskTag'}).configure(tiptapTagConfig),
      Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
      TiptapLinkExtension.configure({
        openOnClick: false
      })
    ],
    editable: true,
    autofocus: true
  })
  return {editor: editorRef.current}
}
