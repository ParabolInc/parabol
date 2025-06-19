import type {Editor, EditorEvents} from '@tiptap/core'
import {useEffect, type MutableRefObject} from 'react'

export const usePageLinkPlaceholder = (
  editor: Editor,
  placeholderRef: MutableRefObject<string | undefined>
) => {
  useEffect(() => {
    const setPageLinkPlaceholder = ({willOpen}: EditorEvents['pageLinkPicker']) => {
      const nextValue = willOpen ? 'Search for a page…' : undefined
      placeholderRef.current = nextValue
      // using state would trigger a re-render, resetting cursor position, so we use ref
      // ref won't trigger an update, so we manually change the placeholder for the first render
      const emptyEl = editor?.view.domAtPos(editor.state.selection.from)
        ?.node as HTMLParagraphElement
      emptyEl?.setAttribute('data-placeholder', nextValue || "Press '/' for commands")
    }
    editor?.on('pageLinkPicker', setPageLinkPlaceholder)
    return () => {
      editor?.off('pageLinkPicker', setPageLinkPlaceholder)
    }
  }, [])
  // return placeholderRef
}
