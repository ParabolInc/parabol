import type {NodeViewProps} from '@tiptap/react'
import {PageLinkBlockView} from './PageLinkBlockView'
import {SyncedBlockView} from './SyncedBlockView'

export const PageLinkNodeView = (props: NodeViewProps) =>
  props.node.attrs.synced ? <SyncedBlockView {...props} /> : <PageLinkBlockView {...props} />
