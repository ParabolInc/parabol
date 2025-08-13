import {EditorContent, type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import Avatar from '../../../components/Avatar/Avatar'
import {useTipTapTaskEditor} from '../../../hooks/useTipTapTaskEditor'
import type {ResponseBlockAttrs} from '../../../shared/tiptap/extensions/ResponseBlockBase'
export const ResponseBlockView = (props: NodeViewProps) => {
  const {node} = props
  const attrs = node.attrs as ResponseBlockAttrs
  const {content, preferredName, avatar} = attrs
  // the task card should be one giant read-only block, so we render a read-only editor
  const {editor} = useTipTapTaskEditor(content, {readOnly: true})
  return (
    <NodeViewWrapper data-type='taskBlock'>
      <div className='w-[268px] min-w-64 rounded-sm p-4 shadow-card'>
        <div className='pb-2'>
          <div className='flex'>
            <Avatar className='size-6' picture={avatar} />
            <div className='break-words pl-2 font-semibold text-slate-600 text-xs leading-6'>
              {preferredName}
            </div>
          </div>
        </div>
        {editor && <EditorContent editor={editor} />}
      </div>
    </NodeViewWrapper>
  )
}
