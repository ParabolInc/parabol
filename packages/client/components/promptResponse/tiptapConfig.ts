import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

/**
 * Returns tip tap extensions configuration shared by the client and the server
 * @param placeholder
 * @returns an array of extensions to be used by the tip tap editor
 */
export const createEditorExtensions = (onOpenLinkMenu?, setSelectedHref?, placeholder?: string) => [
  StarterKit,
  Link.extend({
    addKeyboardShortcuts() {
      return {
        // ↓ your new keyboard shortcut
        'Mod-k': () => {
          if (!onOpenLinkMenu) {
            return false
          }

          const href: string | undefined = this.editor.getAttributes('link').href
          let {from, to} = this.editor.view.state.selection
          if (to === from) {
            this.editor.commands.setTextSelection({to: to - 1, from: from - 1})
            this.editor.commands.extendMarkRange('link')
            const selection = this.editor.view.state.selection
            to = selection.to
            from = selection.from
          }
          const text = this.editor.state.doc.textBetween(from, to, '')
          onOpenLinkMenu({text, href})
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
  }),
  Placeholder.configure({
    placeholder
  })
]
