import {useState} from 'react'
import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import {useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {tiptapTagConfig} from 'parabol-client/utils/tiptapTagConfig'
import {tiptapEmojiConfig} from 'parabol-client/utils/tiptapEmojiConfig'
import {TiptapLinkExtension} from 'parabol-client/components/promptResponse/TiptapLinkExtension'
import {useTipTapEditorContent} from 'parabol-client/hooks/useTipTapEditorContent'
import {LinkMenuState} from 'parabol-client/components/promptResponse/TipTapLinkMenu'

export const useTipTapTaskEditor = (
  content: string,
) => {
  const [contentJSON, editorRef] = useTipTapEditorContent(content)
  const [linkState, setLinkState] = useState<LinkMenuState>(null)
  editorRef.current = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: 'Describe what “Done” looks like'
        }),
        Mention.extend({name: 'taskTag'}).configure(tiptapTagConfig),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false,
          popover: {
            setLinkState
          }
        }),
      ],
      editable: true,
      autofocus: true,
    }
  )
  return {editor: editorRef.current, linkState, setLinkState}
}
