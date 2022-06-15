import {Editor, isNodeSelection, posToDOMRect} from '@tiptap/core'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

const getSelectionBoundingBox = (editor: Editor) => {
  const selection = editor.view.state.selection
  const {from, to} = selection

  if (isNodeSelection(selection)) {
    const node = editor.view.nodeDOM(from) as HTMLElement

    if (node) {
      return node.getBoundingClientRect()
    }
  }

  return posToDOMRect(editor?.view, from, to)
}

export const getLinkProps = (editor: Editor) => {
  const href: string | undefined = editor.getAttributes('link').href
  editor.commands.extendMarkRange('link')
  let {from, to} = editor.view.state.selection
  if (to === from && editor.isActive('link')) {
    // If the cursor is on a link, but hasn't selected any specific part of the link text, expand the selection
    // to the full link.
    editor.commands.setTextSelection({to: to - 1, from: from - 1})
    editor.commands.extendMarkRange('link')
    const selection = editor.view.state.selection
    to = selection.to
    from = selection.from
  }
  const text = editor.state.doc.textBetween(from, to, '')
  const originCoords = getSelectionBoundingBox(editor)

  return {text, href: href ?? '', originCoords}
}

/**
 * Returns tip tap extensions configuration shared by the client and the server
 * @param placeholder
 * @returns an array of extensions to be used by the tip tap editor
 */
export const createEditorExtensions = (
  isReadOnly?: boolean,
  setLinkMenuProps?,
  setLinkPreviewProps?,
  placeholder?: string
) => [
  StarterKit,
  Link.extend({
    addKeyboardShortcuts() {
      return {
        'Mod-k': () => {
          if (!setLinkMenuProps) {
            return false
          }

          setLinkMenuProps(getLinkProps(this.editor))
          return true
        }
      }
    },
    onSelectionUpdate() {
      const href = this.editor.getAttributes('link').href
      if (href && setLinkPreviewProps) {
        setLinkPreviewProps({href, originCoords: getSelectionBoundingBox(this.editor)})
      } else {
        setLinkPreviewProps(undefined)
      }
    }
  }).configure({
    openOnClick: isReadOnly
  }),
  Placeholder.configure({
    placeholder
  })
]
