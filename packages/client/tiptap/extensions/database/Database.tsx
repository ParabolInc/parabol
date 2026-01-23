import {HocuspocusProvider} from '@hocuspocus/provider'
import {Node} from '@tiptap/core'
import {type NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer} from '@tiptap/react'
import {lazy} from 'react'
import {appendColumn, appendRow, getColumns, getRows} from './data'

const DatabaseView = lazy(() => import(/* webpackChunkName: 'DatabaseView' */ './DatabaseView'))

export const DEFAULT_COLUMNS = [
  {name: 'Text column', type: 'text'},
  {name: 'Number column', type: 'number'},
  {name: 'Check column', type: 'check'}
] as const

function Component(props: NodeViewProps) {
  const {editor, extension} = props

  return (
    <NodeViewWrapper className='relative'>
      <DatabaseView
        provider={extension.options.provider}
        editor={editor}
        userId={extension.options.userId}
      />
    </NodeViewWrapper>
  )
}

export interface DatabaseOptions {
  // provider doesn't exist on the server, but we still want to use this extension for parsing there
  provider?: HocuspocusProvider
  userId?: string
}
export const Database = Node.create<DatabaseOptions>({
  name: 'database',
  onCreate() {
    // Add some initial content to make the first use easier
    const {provider, userId} = this.options
    const document = provider?.document
    if (!document) return
    if (getRows(document).length === 0) {
      if (getColumns(document).length === 0) {
        DEFAULT_COLUMNS.forEach((column) =>
          appendColumn(document, {name: column.name, type: column.type})
        )
      }
      appendRow(document, userId)
    }
  },
  renderHTML() {
    return ['div']
  },
  parseHTML() {
    return [{tag: 'database'}]
  },
  addNodeView() {
    return ReactNodeViewRenderer(Component, {contentDOMElementTag: 'div'})
  }
})
