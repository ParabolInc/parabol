import {mergeAttributes, type Editor} from '@tiptap/core'
import BaseLink from '@tiptap/extension-link'
import {Plugin} from '@tiptap/pm/state'
import {LinkMenuState} from './TipTapLinkMenu'

declare module '@tiptap/core' {
  interface EditorEvents {
    linkStateChange: {editor: Editor; linkState: LinkMenuState}
  }
}

export const TiptapLinkExtension = BaseLink.extend({
  // if the caret is at the end of the link, it is not part of the link
  inclusive: false,
  addKeyboardShortcuts(this) {
    return {
      'Mod-k': () => {
        this.editor.emit('linkStateChange', {editor: this.editor, linkState: 'edit'})
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
    const linkState = href ? 'preview' : null
    this.editor.emit('linkStateChange', {editor: this.editor, linkState})
  },
  addProseMirrorPlugins() {
    const {editor} = this
    return [
      ...(this.parent?.() || []),
      new Plugin({
        props: {
          handleKeyDown: (_view, event) => {
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
