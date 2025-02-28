import {NodeViewWrapper, type NodeViewProps} from '@tiptap/react'
import type {InsightsBlockAttrs} from './InsightsBlock'
import {InsightsBlockEditing} from './InsightsBlockEditing'
import {InsightsBlockResult} from './InsightsBlockResult'
export const InsightsBlockView = (props: NodeViewProps) => {
  const {node, updateAttributes} = props
  const attrs = node.attrs as InsightsBlockAttrs
  const {editing, title} = attrs

  return (
    <NodeViewWrapper>
      <div className='m-0 w-full p-0 text-slate-900' contentEditable={false}>
        <div className='flex flex-col rounded-sm bg-slate-200 p-4'>
          <input
            className='bg-inherit p-4 text-lg ring-0 outline-0'
            onChange={(e) => {
              updateAttributes({title: e.target.value})
            }}
            value={title}
          />
          {editing ? (
            <InsightsBlockEditing {...props} />
          ) : (
            <InsightsBlockResult updateAttributes={updateAttributes} />
          )}
        </div>
      </div>
    </NodeViewWrapper>
  )
}
