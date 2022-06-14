import {Editor} from '@tiptap/core'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

export const getLinkProps = (editor: Editor) => {
  const href: string | undefined = editor.getAttributes('link').href
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

  return {text, href: href ?? ''}
}

/**
 * Returns tip tap extensions configuration shared by the client and the server
 * @param placeholder
 * @returns an array of extensions to be used by the tip tap editor
 */
export const createEditorExtensions = (
  isReadOnly?: boolean,
  setLinkMenuProps?,
  setSelectedHref?,
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
      if (href && setSelectedHref) {
        setSelectedHref(href)
      } else {
        setSelectedHref(undefined)
      }
    }
  }).configure({
    openOnClick: isReadOnly
  }),
  Placeholder.configure({
    placeholder
  })
]
