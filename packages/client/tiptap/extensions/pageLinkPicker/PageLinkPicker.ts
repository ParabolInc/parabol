import {Extension, type Editor} from '@tiptap/core'
import {PluginKey} from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import graphql from 'babel-plugin-relay/macro'
import stringScore from 'string-score'
import {
  default as pageLinkPickerQuery,
  type PageLinkPickerQuery
} from '../../../__generated__/PageLinkPickerQuery.graphql'
import type Atmosphere from '../../../Atmosphere'
import renderSuggestion from '../renderSuggestion'
import {PageLinkMenu} from './PageLinkMenu'

graphql`
  query PageLinkPickerQuery($textFilter: String!) {
    viewer {
      pages(first: 100, textFilter: $textFilter) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  }
`

const extensionName = 'pageLinkPicker'
const pluginKey = new PluginKey(extensionName)
export const PageLinkPicker = Extension.create<{atmosphere: Atmosphere}, {open: boolean}>({
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
    let firstFrom: number | undefined = undefined
    return [
      Suggestion({
        editor: this.editor,
        pluginKey,
        findSuggestionMatch: (config) => {
          // Instead of relying on the character at the current position, we rely on a piece of state to determine if the menu is open
          if (!this.storage.open) {
            firstFrom = undefined
            return null
          }
          const text = config.$position.nodeBefore?.text || ''
          // the suggestion package determines if it should exit by checking if the cursor has moved & the query has changed
          // so, we just lie & say the cursor hasn't moved
          firstFrom = firstFrom || config.$position.pos
          return {
            range: {
              from: firstFrom,
              to: firstFrom
            },
            query: text,
            text
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
        items: async ({query}) => {
          const res = await this.options.atmosphere.fetchQuery<PageLinkPickerQuery>(
            pageLinkPickerQuery,
            {
              textFilter: query || ''
            }
          )
          if (!res || res instanceof Error) return []
          const {viewer} = res
          const {pages} = viewer
          const {edges} = pages
          return edges
            .map((edge) => {
              const {node} = edge
              const {id, title} = node
              const score = query ? stringScore(title, query) : 1
              return {
                id,
                title,
                score
              }
            })
            .sort((a, b) => (a.score < b.score ? 1 : -1))
            .map((p) => ({pageId: p.id, title: p.title}))
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
