import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'

/**
 * Returns tip tap extensions configuration shared by the client and the server
 * @param placeholder
 * @returns an array of extensions to be used by the tip tap editor
 */
export const createEditorExtensions = (onOpenLinkMenu?, placeholder?: string) => [
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
          this.editor.commands.extendMarkRange('link')

          const {from, to} = this.editor.view.state.selection
          const text = this.editor.state.doc.textBetween(from, to, '')
          onOpenLinkMenu({text, href})
          return true
        }
      }
    }
  }),
  Placeholder.configure({
    placeholder
  })
]
