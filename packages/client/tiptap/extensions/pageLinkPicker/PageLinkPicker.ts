import {type Editor, Extension} from '@tiptap/core'
import {PluginKey} from '@tiptap/pm/state'
import Suggestion from '@tiptap/suggestion'
import graphql from 'babel-plugin-relay/macro'
import stringScore from 'string-score'
import {
  type PageLinkPickerQuery,
  default as pageLinkPickerQuery
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
    let firstFrom: number | undefined
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
          const {pageId, title} = props
          const pageCode = Number(pageId.split(':')[1])

          const {state} = editor
          const {selection} = state
          const {$from} = selection
          const nodeBefore = $from.nodeBefore
          editor.emit('pageLinkPicker', {willOpen: false})
          const command = editor.chain().focus()
          if (nodeBefore) {
            command.deleteRange({
              from: $from.pos - nodeBefore.nodeSize,
              to: $from.pos
            })
          }
          command.setPageLinkBlock({pageCode, title}).run()
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
