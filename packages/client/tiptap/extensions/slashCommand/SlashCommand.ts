import {Extension, type Editor} from '@tiptap/core'
import {PluginKey} from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import renderSuggestion from '../renderSuggestion'
import {SlashCommandMenu} from './SlashCommandMenu'
import {slashCommands} from './slashCommands'

const extensionName = 'slashCommand'
export const SlashCommand = Extension.create({
  name: extensionName,
  priority: 200,
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        allowSpaces: true,
        startOfLine: true,
        pluginKey: new PluginKey(extensionName),
        allow: ({state, range}) => {
          const $from = state.doc.resolve(range.from)
          const isRootDepth = $from.depth === 1
          const isParagraph = $from.parent.type.name === 'paragraph'
          const isStartOfNode = $from.parent.textContent?.charAt(0) === '/'
          const isInColumn = this.editor.isActive('column')

          const afterContent = $from.parent.textContent?.substring(
            $from.parent.textContent?.indexOf('/')
          )
          const isValidAfterContent = !afterContent?.endsWith('  ')

          return (
            ((isRootDepth && isParagraph && isStartOfNode) ||
              (isInColumn && isParagraph && isStartOfNode)) &&
            isValidAfterContent
          )
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
          return slashCommands
            .map((group) => ({
              ...group,
              commands: group.commands.filter((item) => {
                const queryNormalized = query.toLowerCase().trim()
                const isQueryInTerm = item.searchTerms.some((searchTerm) =>
                  searchTerm.includes(queryNormalized)
                )
                if (!isQueryInTerm) return false
                return item.shouldHide ? !item.shouldHide(this.editor) : true
              })
            }))
            .filter((group) => group.commands.length > 0)
        },
        render: renderSuggestion(SlashCommandMenu)
      })
    ]
  }

  // addStorage() {
  //   return {
  //     rect: {
  //       width: 0,
  //       height: 0,
  //       left: 0,
  //       top: 0,
  //       right: 0,
  //       bottom: 0
  //     }
  //   }
  // }
})
