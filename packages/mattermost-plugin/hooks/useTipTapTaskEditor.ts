import Mention from '@tiptap/extension-mention'
import {Placeholder} from '@tiptap/extensions'
import {type JSONContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {TiptapLinkExtension} from 'parabol-client/components/TipTapEditor/TiptapLinkExtension'
import {useTipTapEditorSync} from 'parabol-client/hooks/useTipTapEditorSync'
import {MentionTaskTag} from 'parabol-client/utils/MentionTaskTag'
import {tiptapEmojiConfig} from 'parabol-client/utils/tiptapEmojiConfig'
import {tiptapTagConfig} from 'parabol-client/utils/tiptapTagConfig'
import {useMemo} from 'react'

export const useTipTapTaskEditor = (content: string) => {
  const contentJSON = useMemo(() => JSON.parse(content) as JSONContent, [content])
  const editor = useEditor({
    content: contentJSON,
    extensions: [
      StarterKit.configure({link: false}),
      Placeholder.configure({
        showOnlyWhenEditable: false,
        placeholder: 'Describe what “Done” looks like'
      }),
      MentionTaskTag.configure(tiptapTagConfig),
      Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
      TiptapLinkExtension.configure({
        openOnClick: false
      })
    ],
    editable: true,
    autofocus: true
  })
  useTipTapEditorSync(editor, contentJSON, true)
  return {editor}
}
