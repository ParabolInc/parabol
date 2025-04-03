import {getMarkRange, getMarkType, mergeAttributes, type Editor} from '@tiptap/core'
import BaseLink from '@tiptap/extension-link'
import {EditorState, Plugin} from '@tiptap/pm/state'

export type LinkMenuState = 'preview' | 'edit' | null

declare module '@tiptap/core' {
  interface EditorEvents {
    linkStateChange: {editor: Editor; linkState: LinkMenuState}
  }

  interface Commands<ReturnType> {
    upsertLink: {
      upsertLink: (link: {text: string; url: string}) => ReturnType
    }
    removeLink: {
      removeLink: () => ReturnType
    }
  }
}

export const getRangeForType = (state: EditorState, typeOrName: string) => {
  const {selection, schema} = state
  const {$from} = selection
  const type = getMarkType(typeOrName, schema)
  return getMarkRange($from, type)
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
  addCommands(this) {
    return {
      ...this.parent?.(),
      upsertLink:
        ({text, url}) =>
        ({chain, state}) => {
          const range = getRangeForType(state, 'link')
          if (!range) {
            const {selection} = state
            const {from} = selection
            const nextTo = from + text.length
            // adding a new link
            return chain()
              .focus()
              .command(({tr}) => {
                tr.insertText(text)
                return true
              })
              .setTextSelection({
                from,
                to: nextTo
              })
              .setLink({href: url, target: '_blank'})
              .setTextSelection({from: nextTo, to: nextTo})
              .run()
          }
          const {from} = range
          const to = from + text.length
          return chain()
            .focus()
            .setTextSelection(range)
            .insertContent(text)
            .setTextSelection({
              from,
              to
            })
            .setLink({href: url, target: '_blank'})
            .setTextSelection({from: to, to})
            .run()
        },
      removeLink:
        () =>
        ({state, chain}) => {
          const range = getRangeForType(state, 'link')
          if (!range) return false
          return chain()
            .focus()
            .extendMarkRange('link')
            .unsetLink()
            .setTextSelection({from: range.to, to: range.to})
            .run()
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
