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
      <DatabaseView doc={extension.options.document} />
    </NodeViewWrapper>
  )
}

export interface DatabaseOptions {
  document: Y.Doc
}
export const Database = Node.create<DatabaseOptions>({
  name: 'database',
  onCreate() {
    // Add some initial content to make the first use easier
    const doc = this.options.document
    if (getRows(doc).length === 0) {
      if (getColumns(doc).length === 0) {
        appendColumn(doc, {name: 'Text column', type: 'text'})
        appendColumn(doc, {name: 'Number column', type: 'number'})
        appendColumn(doc, {name: 'Check column', type: 'check'})
      }
      appendRow(doc)
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
