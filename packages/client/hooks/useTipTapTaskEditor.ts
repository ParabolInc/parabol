import Mention from '@tiptap/extension-mention'
import Placeholder from '@tiptap/extension-placeholder'
import {Editor, generateHTML, JSONContent, useEditor} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {useMemo, useRef} from 'react'
import Atmosphere from '../Atmosphere'
import {LoomExtension} from '../components/promptResponse/loomExtension'
import {TiptapLinkExtension} from '../components/promptResponse/TiptapLinkExtension'
import {LinkMenuState} from '../components/promptResponse/TipTapLinkMenu'
import {serverTipTapExtensions} from '../shared/serverTipTapExtensions'
import {tiptapEmojiConfig} from '../utils/tiptapEmojiConfig'
import {tiptapMentionConfig} from '../utils/tiptapMentionConfig'
import {tiptapTagConfig} from '../utils/tiptapTagConfig'

export const useTipTapTaskEditor = (
  content: string,
  atmosphere: Atmosphere,
  teamId: string,
  setLinkState: (linkState: LinkMenuState) => void,
  readOnly?: boolean
) => {
  const editorRef = useRef<Editor | null>(null)
  const contentJSONRef = useRef<JSONContent | null>(null)
  // When receiving new content, it's important to make sure it's different from the current value
  // Unnecessary re-renders mess up things like the coordinates of the link menu
  const contentJSON = useMemo(() => {
    const newContent = JSON.parse(content)
    // use HTML because text won't include data that we don't see (e.g. mentions) and JSON key order is non-deterministic >:-(
    const oldHTML = editorRef.current ? editorRef.current.getHTML() : ''
    const newHTML = generateHTML(newContent, serverTipTapExtensions)
    if (oldHTML !== newHTML) {
      contentJSONRef.current = newContent
    }
    return contentJSONRef.current
  }, [content])

  editorRef.current = useEditor(
    {
      content: contentJSON,
      extensions: [
        StarterKit,
        LoomExtension,
        Placeholder.configure({
          showOnlyWhenEditable: false,
          placeholder: 'Describe what “Done” looks like'
        }),
        Mention.extend({name: 'taskTag'}).configure(tiptapTagConfig),
        Mention.configure(tiptapMentionConfig(atmosphere, teamId)),
        Mention.extend({name: 'emojiMention'}).configure(tiptapEmojiConfig),
        TiptapLinkExtension.configure({
          openOnClick: false,
          popover: {
            setLinkState
          }
        })
      ],
      autofocus: false,
      editable: !readOnly
    },
    [contentJSON, readOnly]
  )
  return editorRef.current
}
