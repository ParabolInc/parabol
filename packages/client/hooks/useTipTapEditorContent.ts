import {Editor, generateHTML, JSONContent} from '@tiptap/react'
import {useMemo, useRef} from 'react'
import {serverTipTapExtensions} from '../shared/tiptap/serverTipTapExtensions'

export const useTipTapEditorContent = (content: string) => {
  const editorRef = useRef<Editor | null>(null)
  const contentJSONRef = useRef<JSONContent>()
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
    return contentJSONRef.current as JSONContent
  }, [content])

  return [contentJSON, editorRef] as const
}
