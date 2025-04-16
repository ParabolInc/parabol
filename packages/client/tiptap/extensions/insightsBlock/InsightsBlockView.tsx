import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import type {InsightsBlockAttrs} from './InsightsBlock'
import {InsightsBlockEditing} from './InsightsBlockEditing'
import {InsightsBlockResult} from './InsightsBlockResult'
export const InsightsBlockView = (props: NodeViewProps) => {
  const {node} = props
  const attrs = node.attrs as InsightsBlockAttrs
  const {editing} = attrs

  return (
    <NodeViewWrapper>
      <div className='relative m-0 w-full p-0 text-slate-900'>
        <div className='flex flex-col rounded-sm bg-slate-200 p-4'>
          {editing ? <InsightsBlockEditing {...props} /> : <InsightsBlockResult {...props} />}
        </div>
      </div>
    </NodeViewWrapper>
  )
}
