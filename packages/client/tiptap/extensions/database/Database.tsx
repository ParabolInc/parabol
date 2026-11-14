import {HocuspocusProvider} from '@hocuspocus/provider'
import {type NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer} from '@tiptap/react'
import {lazy, Suspense} from 'react'
import {DatabaseBase} from '../../../shared/tiptap/extensions/DatabaseBase'
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
      {/* without a boundary of its own, the suspending chunk hides the editor, which tears down & recreates this node view in a loop */}
      <Suspense
        fallback={<div className='h-28 rounded-lg border border-hairline bg-surface-card' />}
      >
        <DatabaseView
          provider={extension.options.provider}
          editor={editor}
          userId={extension.options.userId}
        />
      </Suspense>
    </NodeViewWrapper>
  )
}

export interface DatabaseOptions {
  provider?: HocuspocusProvider
  userId?: string
}
export const Database = DatabaseBase.extend<DatabaseOptions>({
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
  addNodeView() {
    return ReactNodeViewRenderer(Component, {
      contentDOMElementTag: 'div',
      // the grid handles its own input. Left to ProseMirror, a click on an icon or label selects the node & pulls focus back to the editor, closing the menu that click just opened
      stopEvent: () => true
    })
  }
})
