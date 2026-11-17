import type {Editor} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {memo, Suspense, useEffect} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import type {TaskCard_task$key} from '~/__generated__/TaskCard_task.graphql'
import type {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import EditingStatus from '~/components/EditingStatus/EditingStatus'
import {cn} from '~/ui/cn'
import TaskWatermark from '../../../../components/TaskWatermark'
import {TipTapEditor} from '../../../../components/TipTapEditor/TipTapEditor'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import type {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import {MEETING} from '../../../../utils/constants'
import isTaskArchived from '../../../../utils/isTaskArchived'
import isTaskPrivate from '../../../../utils/isTaskPrivate'
import {taskStatusLabels} from '../../../../utils/taskStatus'
import TaskFooter from '../TaskCardFooter/TaskFooter'
import TaskCardStatusIndicator from '../TaskCardStatusIndicator/TaskCardStatusIndicator'
import TaskCardIntegration from './TaskCardIntegration'

interface Props {
  area: AreaEnum
  isTaskFocused: boolean
  isTaskHovered: boolean
  editor: Editor
  handleCardUpdate: () => void
  isAgenda: boolean
  isDraggingOver: TaskStatusEnum | undefined
  task: TaskCard_task$key
  useTaskChild: UseTaskChild
  addTaskChild(name: string): void
  removeTaskChild(name: string): void
}

const TaskCard = memo((props: Props) => {
  const {
    addTaskChild,
    removeTaskChild,
    area,
    isTaskFocused,
    isTaskHovered,
    editor,
    handleCardUpdate,
    isAgenda,
    isDraggingOver,
    task: taskRef,
    useTaskChild
  } = props
  const task = useFragment(
    graphql`
      fragment TaskCard_task on Task @argumentDefinitions(meetingId: {type: "ID"}) {
        ...TaskCardIntegration_task @defer
        discussionId
        editors {
          userId
        }
        id
        taskService
        status
        tags
        # grab userId to ensure sorting on connections works
        userId
        isHighlighted(meetingId: $meetingId)
        ...EditingStatus_task
        ...TaskFooter_task
      }
    `,
    taskRef
  )
  const isPrivate = isTaskPrivate(task.tags)
  const isArchived = isTaskArchived(task.tags)
  const toggleTag = (tagId: string) => {
    const {state, view} = editor
    const {doc, schema, tr} = state
    if (task.tags.includes(tagId)) {
      doc.descendants((node, pos) => {
        if (node.type.name === 'taskTag' && node.attrs.id === tagId) {
          tr.delete(pos, pos + node.nodeSize)
        }
      })
      view.dispatch(tr)
      const nextContent = JSON.stringify(editor.getJSON())
      UpdateTaskMutation(atmosphere, {updatedTask: {id: taskId, content: nextContent}}, {})
      return
    }
    // Create the mention node
    const mentionNode = schema.nodes.taskTag!.create({id: tagId})

    // Insert the mention node at the end
    const transaction = tr.insert(doc.content.size, mentionNode)
    view.dispatch(transaction)
    const nextContent = JSON.stringify(editor.getJSON())
    UpdateTaskMutation(atmosphere, {updatedTask: {id: taskId, content: nextContent}}, {})
  }
  const {taskService, status, id: taskId, isHighlighted, editors, discussionId} = task
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const isIntegrated = !!taskService
  const otherEditors = editors.filter((editor) => editor.userId !== viewerId)
  const isEditing = editors.length > otherEditors.length
  const statusTitle = `Card status: ${taskStatusLabels[status]}`
  const privateTitle = ', marked as #private'
  const archivedTitle = ', set as #archived'
  const statusIndicatorTitle = `${statusTitle}${isPrivate ? privateTitle : ''}${
    isArchived ? archivedTitle : ''
  }`
  const onFocusChange = (isFocus: boolean) => () => {
    if (!discussionId) return
    commitLocalUpdate(atmosphere, (store) => {
      store.get(discussionId)?.setValue(isFocus ? taskId : null, 'editingTaskId')
    })
  }

  useEffect(() => {
    if (isDraggingOver) {
      if (!editor.isEmpty) {
        handleCardUpdate()
      }
    }
  }, [!!isDraggingOver, editor, handleCardUpdate])

  const taskEditor = (
    <div
      className='cursor-text'
      onBlur={() => {
        removeTaskChild('root')
        setTimeout(handleCardUpdate)
      }}
      onFocus={() => addTaskChild('root')}
    >
      <TipTapEditor
        className='min-h-[44px] px-4'
        editor={editor}
        // biome-ignore lint/correctness/useHookAtTopLevel: legacy
        useLinkEditor={() => useTaskChild('editor-link-changer')}
        onBlur={onFocusChange(false)}
        onFocus={onFocusChange(true)}
      />
    </div>
  )

  return (
    <div
      className={cn(
        'relative w-full min-w-[256px] max-w-[300px] rounded bg-surface-card pt-4 transition-shadow duration-100 ease-in',
        isDraggingOver
          ? 'shadow-[var(--shadow-card-dragging)]'
          : isHighlighted
            ? 'shadow-[var(--shadow-card-hover)]'
            : isTaskFocused
              ? 'shadow-[var(--shadow-card-focus)]'
              : isTaskHovered
                ? 'shadow-[var(--shadow-card-hover)]'
                : 'shadow-[var(--shadow-card)]',
        isHighlighted && 'outline-2 outline-sky-300',
        !isHighlighted && 'outline-none'
      )}
    >
      <TaskWatermark service={taskService} />
      <div className='relative'>
        <EditingStatus
          isTaskHovered={isTaskHovered}
          isArchived={isArchived}
          task={task}
          useTaskChild={useTaskChild}
          defaultMetaField={area === MEETING ? 'createdIn' : 'createdAt'}
          openTopicInNewTab={area === MEETING}
        >
          <div className='flex' title={statusIndicatorTitle}>
            <TaskCardStatusIndicator status={isDraggingOver || status} />
            {isPrivate && <TaskCardStatusIndicator status='private' />}
            {isArchived && <TaskCardStatusIndicator status='archived' />}
          </div>
        </EditingStatus>
        {isIntegrated ? (
          <Suspense
            fallback={<div className='mx-4 mb-1 h-5 animate-pulse rounded bg-surface-well' />}
          >
            <TaskCardIntegration task={task}>{taskEditor}</TaskCardIntegration>
          </Suspense>
        ) : (
          taskEditor
        )}
        <TaskFooter
          area={area}
          cardIsActive={isTaskFocused || isTaskHovered || isEditing}
          toggleTag={toggleTag}
          isAgenda={isAgenda}
          task={task}
          useTaskChild={useTaskChild}
        />
      </div>
    </div>
  )
})

export default TaskCard
