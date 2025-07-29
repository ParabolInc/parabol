import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import type {InsightsBlockAttrs} from './InsightsBlock'
import {InsightsBlockDisabled} from './InsightsBlockDisabled'
import {InsightsBlockEditing} from './InsightsBlockEditing'
import {InsightsBlockNoData} from './InsightsBlockNoData'
import {InsightsBlockResult} from './InsightsBlockResult'
export const InsightsBlockView = (props: NodeViewProps) => {
  const {node} = props
  const attrs = node.attrs as InsightsBlockAttrs
  const {editing, error} = attrs

  return (
    <NodeViewWrapper>
      <div className='relative m-0 w-full p-0 text-slate-900'>
        <div className='flex flex-col rounded-sm bg-slate-200 p-4'>
          {error === 'disabled' && <InsightsBlockDisabled />}
          {error === 'nodata' && <InsightsBlockNoData {...props} />}
          {!error &&
            (editing ? <InsightsBlockEditing {...props} /> : <InsightsBlockResult {...props} />)}
        </div>
      </div>
    </NodeViewWrapper>
  )
}
