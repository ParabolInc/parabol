import {EditorContent, type NodeViewProps, NodeViewWrapper} from '@tiptap/react'
import type {TaskStatusEnum} from '../../../__generated__/CreateTaskMutation.graphql'
import Avatar from '../../../components/Avatar/Avatar'
import {useTipTapTaskEditor} from '../../../hooks/useTipTapTaskEditor'
import OutcomeCardStatusIndicator from '../../../modules/outcomeCard/components/OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'
import type {TaskBlockAttrs} from '../../../shared/tiptap/extensions/TaskBlockBase'
export const TaskBlockView = (props: NodeViewProps) => {
  const {node} = props
  const attrs = node.attrs as TaskBlockAttrs
  const {content, status, preferredName, avatar} = attrs
  // the task card should be one giant read-only block, so we render a read-only editor
  const {editor} = useTipTapTaskEditor(content, {readOnly: true})
  return (
    <NodeViewWrapper data-type='taskBlock'>
      <div className='w-[268px] min-w-64 rounded-sm p-4 shadow-card'>
        <OutcomeCardStatusIndicator
          status={(status as TaskStatusEnum) || 'active'}
          className='mb-1'
        />
        {editor && <EditorContent editor={editor} />}
        <div className='pt-2'>
          <div className='flex'>
            <Avatar className='size-6' picture={avatar} />
            <div className='break-words pl-2 font-semibold text-slate-600 text-xs leading-6'>
              {preferredName}
            </div>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}
