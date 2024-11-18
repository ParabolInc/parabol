import {mergeAttributes} from '@tiptap/core'
import BaseLink, {LinkOptions} from '@tiptap/extension-link'
import {Plugin} from '@tiptap/pm/state'
import {EditorView} from '@tiptap/pm/view'
import {LinkMenuState} from './LinkMenu'

interface ExtendedOptions extends LinkOptions {
  popover: {
    setLinkState: (linkState: LinkMenuState) => void
  }
}
export const TiptapLink = BaseLink.extend<ExtendedOptions>({
  // if the caret is at the end of the link, it is not part of the link
  inclusive: false,
  addKeyboardShortcuts(this) {
    return {
      'Mod-k': () => {
        this.options.popover.setLinkState('edit')
        return true
      }
    }
  },
  parseHTML() {
    return [{tag: 'a[href]:not([data-type="button"]):not([href *= "javascript:" i])'}]
  },

  renderHTML({HTMLAttributes}) {
    return ['a', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {class: 'link'}), 0]
  },
  onSelectionUpdate() {
    const href = this.editor.getAttributes('link').href
    this.options.popover.setLinkState(href ? 'preview' : null)
  },
  addProseMirrorPlugins() {
    const {editor} = this
    return [
      ...(this.parent?.() || []),
      new Plugin({
        props: {
          handleKeyDown: (_view: EditorView, event: KeyboardEvent) => {
            const {selection} = editor.state
            if (event.key === 'Escape' && selection.empty !== true) {
              editor.commands.focus(selection.to, {scrollIntoView: false})
              return true
            }
            return false
          }
        }
      })
    ]
  }
})
