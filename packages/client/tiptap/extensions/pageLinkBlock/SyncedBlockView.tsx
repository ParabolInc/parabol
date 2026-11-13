import {type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import {useContext, useMemo, useRef} from 'react'
import {SyncedBlockContent} from './SyncedBlockContent'
import {canNestSyncedBlock, getEnclosingChain, SyncedBlockChainContext} from './syncedBlockNesting'

export const SyncedBlockView = (props: NodeViewProps) => {
  const {node, editor, getPos} = props
  const pageCode = Number(node.attrs.pageCode)
  const sizeRef = useRef(node.nodeSize)
  sizeRef.current = node.nodeSize
  const providedChain = useContext(SyncedBlockChainContext)
  const chain = getEnclosingChain(providedChain, editor.storage.pageLinkBlock.pageId)
  const nestedChain = useMemo(() => [...chain, pageCode], [chain.join(','), pageCode])
  const canNest = canNestSyncedBlock(chain, pageCode)
  return (
    <NodeViewWrapper
      data-synced-block
      className='my-3 rounded-md px-3 py-1 outline outline-1 outline-transparent focus-within:outline-2 focus-within:outline-accent-active hover:outline-hairline-strong'
    >
      {pageCode <= 0 ? (
        <div className='h-6 rounded-sm bg-surface-hover' />
      ) : canNest ? (
        <SyncedBlockChainContext.Provider value={nestedChain}>
          <SyncedBlockContent
            key={pageCode}
            pageCode={pageCode}
            hostEditor={editor}
            getPos={getPos}
            getSize={() => sizeRef.current}
          />
        </SyncedBlockChainContext.Provider>
      ) : (
        <div
          contentEditable={false}
          className='flex min-h-6 items-center rounded-sm bg-surface-hover px-2 text-fg-muted text-sm'
        >
          This synced block can't be shown inside itself.
        </div>
      )}
    </NodeViewWrapper>
  )
}
