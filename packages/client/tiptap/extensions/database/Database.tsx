import {Node} from '@tiptap/core'
import {type NodeViewProps, NodeViewWrapper, ReactNodeViewRenderer} from '@tiptap/react'
import * as Y from 'yjs'
import {DatabaseView} from './DatabaseView'

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
