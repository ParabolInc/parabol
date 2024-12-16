import {Editor, JSONContent} from '@tiptap/react'
import {useMemo, useRef} from 'react'
import {isEqualWhenSerialized} from '../shared/isEqualWhenSerialized'

export const useTipTapEditorContent = (content: string) => {
  const editorRef = useRef<Editor | null>(null)
  const contentJSONRef = useRef<JSONContent>()
  // When receiving new content, it's important to make sure it's different from the current value
  // Unnecessary re-renders mess up things like the coordinates of the link menu
  const contentJSON = useMemo(() => {
    const newContentJSON = JSON.parse(content) as JSONContent
    // use HTML because text won't include data that we don't see (e.g. mentions) and JSON key order is non-deterministic >:-(
    const oldContentJSON = editorRef.current ? editorRef.current.getJSON() : {}
    if (!isEqualWhenSerialized(newContentJSON, oldContentJSON)) {
      contentJSONRef.current = newContentJSON
    }
    return contentJSONRef.current!
  }, [content])

  return [contentJSON, editorRef] as const
}
