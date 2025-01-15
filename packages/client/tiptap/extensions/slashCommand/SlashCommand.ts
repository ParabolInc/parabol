import {Extension, type Editor} from '@tiptap/core'
import {PluginKey} from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import renderSuggestion from '../renderSuggestion'
import {SlashCommandMenu} from './SlashCommandMenu'
import {slashCommands, type CommandTitle, type SlashCommandGroup} from './slashCommands'

const extensionName = 'slashCommand'
export const SlashCommand = Extension.create<Record<CommandTitle, boolean>>({
  name: extensionName,
  priority: 200,
  addOptions() {
    const commands = slashCommands.flatMap((sc) => sc.commands.map((command) => command.title))
    return commands.reduce(
      (obj, item) => {
        obj[item] = true
        return obj
      },
      {} as Record<CommandTitle, boolean>
    )
  },
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
                if (!this.options[item.title]) return false
                const queryNormalized = query.toLowerCase().trim()
                const isQueryInTerm = item.searchTerms.some((searchTerm) =>
                  searchTerm.includes(queryNormalized)
                )
                if (!isQueryInTerm) return false
                const {shouldHide} = item as unknown as SlashCommandGroup['commands'][number]
                return shouldHide ? !shouldHide(this.editor) : true
              })
            }))
            .filter((group) => group.commands.length > 0)
        },
        render: renderSuggestion(SlashCommandMenu)
      })
    ]
  }
})
