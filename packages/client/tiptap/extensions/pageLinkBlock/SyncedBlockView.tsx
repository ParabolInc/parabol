import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useRef} from 'react'
import {SyncedBlockContent} from './SyncedBlockContent'

export const SyncedBlockView = (props: NodeViewProps) => {
  const {node, editor, getPos} = props
  const pageCode = Number(node.attrs.pageCode)
  const sizeRef = useRef(node.nodeSize)
  sizeRef.current = node.nodeSize
  return (
    <NodeViewWrapper
      data-synced-block
      className='my-3 rounded-md px-3 py-1 outline outline-1 outline-transparent focus-within:outline-2 focus-within:outline-accent-active hover:outline-hairline-strong'
    >
      {pageCode > 0 ? (
        <SyncedBlockContent
          key={pageCode}
          pageCode={pageCode}
          hostEditor={editor}
          getPos={getPos}
          getSize={() => sizeRef.current}
        />
      ) : (
        <div className='h-6 rounded-sm bg-surface-hover' />
      )}
    </NodeViewWrapper>
  )
}
