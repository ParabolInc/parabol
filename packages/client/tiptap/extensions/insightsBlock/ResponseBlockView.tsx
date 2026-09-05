import {EditorContent, type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import Avatar from '../../../components/Avatar/Avatar'
import {useTipTapStandupResponseEditor} from '../../../hooks/useTipTapStandupResponseEditor'
import type {ResponseBlockAttrs} from '../../../shared/tiptap/extensions/ResponseBlockBase'

export const ResponseBlockView = (props: NodeViewProps) => {
  const {node} = props
  const attrs = node.attrs as ResponseBlockAttrs
  const {content, preferredName, avatar} = attrs
  const {editor} = useTipTapStandupResponseEditor(content, 268 - 16 * 2)
  return (
    <NodeViewWrapper data-type='taskBlock'>
      <div className='w-[268px] min-w-64 rounded bg-surface-card p-4 shadow-[var(--shadow-card)]'>
        <div className='pb-2'>
          <div className='flex'>
            <Avatar className='size-6' picture={avatar} />
            <div className='break-words pl-2 font-semibold text-fg-secondary text-xs leading-6'>
              {preferredName}
            </div>
          </div>
        </div>
        {editor && <EditorContent className='standup-editor' editor={editor} />}
      </div>
    </NodeViewWrapper>
  )
}
