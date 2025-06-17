import {Extension, type Editor} from '@tiptap/core'
import {PluginKey} from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import renderSuggestion from '../renderSuggestion'
import {PageLinkMenu} from './PageLinkMenu'

const extensionName = 'pageLinkPicker'
const pluginKey = new PluginKey(extensionName)
export const PageLinkPicker = Extension.create<any, {open: boolean}>({
  name: 'pageLinkPicker',
  priority: 200,
  onBeforeCreate(this) {
    this.editor.on('pageLinkPicker', ({willOpen}) => {
      this.storage.open = willOpen
    })
  },
  addStorage() {
    return {
      open: false
    }
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        pluginKey,
        findSuggestionMatch: (config) => {
          // Instead of relying on the character at the current position, we rely on a piece of state to determine if the menu is open
          if (!this.storage.open) return null
          return {
            range: {
              from: config.$position.pos,
              to: config.$position.pos
            },
            query: '',
            text: ''
          }
        },
        command: ({editor, props}: {editor: Editor; props: any}) => {
          const {view, state} = editor
          const {$head, $from} = view.state.selection

          const end = $from.pos
          const from = $head?.nodeBefore
            ? end -
              ($head.nodeBefore.text?.substring($head.nodeBefore.text?.indexOf('/')).length ?? 0)
            : $from.start()

          const tr = state.tr.deleteRange(from, end)
          view.dispatch(tr)

          props.action(editor)
          view.focus()
        },
        items: ({query}: {query: string}) => {
          console.log('query', query)
          return [
            {
              pageId: '123',
              title: 'Foo'
            },
            {
              pageId: '1234',
              title: 'Fodo'
            }
          ]
        },
        render: renderSuggestion(PageLinkMenu, {
          isPopupFixed: true,
          onHide: () => {
            this.editor.emit('pageLinkPicker', {willOpen: false})
          }
        })
      })
    ]
  }
})
