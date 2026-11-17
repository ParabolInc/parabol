import {type Editor, Extension} from '@tiptap/core'
import {PluginKey} from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import renderSuggestion from '../renderSuggestion'
import {SlashCommandMenu} from './SlashCommandMenu'
import {type CommandTitle, type SlashCommandGroup, slashCommands} from './slashCommands'

const extensionName = 'slashCommand'
export const SlashCommand = Extension.create<{commands: Record<CommandTitle, boolean>}>({
  name: extensionName,
  priority: 200,
  addOptions() {
    const titles = slashCommands.flatMap((sc) => sc.commands.map((command) => command.title))
    const commands = titles.reduce(
      (obj, title) => {
        obj[title] = false
        return obj
      },
      {} as Record<CommandTitle, boolean>
    )
    return {commands}
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
          const isInDetails = this.editor.isActive('detailsContent')

          const afterContent = $from.parent.textContent?.substring(
            $from.parent.textContent?.indexOf('/')
          )
          const isValidAfterContent = !afterContent?.endsWith('  ')

          return (
            ((isRootDepth && isParagraph && isStartOfNode) ||
              ((isInColumn || isInDetails) && isParagraph && isStartOfNode)) &&
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
          const queryNormalized = query.toLowerCase().trim()
          return slashCommands
            .map((group) => ({
              ...group,
              commands: group.commands
                .filter((item) => {
                  if (!this.options.commands[item.title]) return false
                  const isQueryInTerm = item.searchTerms.some((searchTerm) =>
                    searchTerm.includes(queryNormalized)
                  )
                  if (!isQueryInTerm) return false
                  const {shouldHide} = item as unknown as SlashCommandGroup['commands'][number]
                  return shouldHide ? !shouldHide(this.editor) : true
                })
                .map((item) => ('forQuery' in item ? item.forQuery(queryNormalized) : null) ?? item)
            }))
            .filter((group) => group.commands.length > 0)
        },
        render: renderSuggestion(SlashCommandMenu)
      })
    ]
  }
})
