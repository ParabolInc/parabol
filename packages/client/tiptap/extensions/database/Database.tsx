import {Node} from '@tiptap/core'
import {type NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer} from '@tiptap/react'
import {lazy} from 'react'
import * as Y from 'yjs'
import {appendColumn, appendRow, getColumns, getRows} from './data'

const DatabaseView = lazy(() => import(/* webpackChunkName: 'DatabaseView' */ './DatabaseView'))

function Component(props: NodeViewProps) {
  const {extension} = props

  return (
    <NodeViewWrapper className='relative overflow-auto'>
      <DatabaseView doc={extension.options.document} userId={extension.options.userId} />
    </NodeViewWrapper>
  )
}

export interface DatabaseOptions {
  document: Y.Doc
  userId?: string
}
export const Database = Node.create<DatabaseOptions>({
  name: 'database',
  onCreate() {
    // Add some initial content to make the first use easier
    const {document, userId} = this.options
    if (getRows(document).length === 0) {
      if (getColumns(document).length === 0) {
        appendColumn(document, {name: 'Text column', type: 'text'})
        appendColumn(document, {name: 'Number column', type: 'number'})
        appendColumn(document, {name: 'Check column', type: 'check'})
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
