import styled from '@emotion/styled'
import {Editor} from '@tiptap/core'
import graphql from 'babel-plugin-relay/macro'
import {memo} from 'react'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {OutcomeCard_task$key} from '~/__generated__/OutcomeCard_task.graphql'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import EditingStatus from '~/components/EditingStatus/EditingStatus'
import {PALETTE} from '~/styles/paletteV3'
import IntegratedTaskContent from '../../../../components/IntegratedTaskContent'
import {TipTapEditor} from '../../../../components/promptResponse/TipTapEditor'
import TaskIntegrationLink from '../../../../components/TaskIntegrationLink'
import TaskWatermark from '../../../../components/TaskWatermark'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {UseTaskChild} from '../../../../hooks/useTaskChildFocus'
import UpdateTaskMutation from '../../../../mutations/UpdateTaskMutation'
import {cardFocusShadow, cardHoverShadow, cardShadow, Elevation} from '../../../../styles/elevation'
import cardRootStyles from '../../../../styles/helpers/cardRootStyles'
import {Card} from '../../../../types/constEnums'
import isTaskArchived from '../../../../utils/isTaskArchived'
import isTaskPrivate from '../../../../utils/isTaskPrivate'
import {taskStatusLabels} from '../../../../utils/taskStatus'
import TaskFooter from '../OutcomeCardFooter/TaskFooter'
import OutcomeCardStatusIndicator from '../OutcomeCardStatusIndicator/OutcomeCardStatusIndicator'

const RootCard = styled('div')<{
  isTaskHovered: boolean
  isTaskFocused: boolean
  isDragging: boolean
  isTaskHighlighted: boolean
}>(({isTaskHovered, isTaskFocused, isDragging, isTaskHighlighted}) => ({
  ...cardRootStyles,
  borderTop: 0,
  outline: isTaskHighlighted ? `2px solid ${PALETTE.SKY_300}` : 'none',
  padding: `${Card.PADDING} 0 0`,
  transition: `box-shadow 100ms ease-in`,
  // hover before focus, it matters
  boxShadow: isDragging
    ? Elevation.CARD_DRAGGING
    : isTaskHighlighted
      ? cardHoverShadow
      : isTaskFocused
        ? cardFocusShadow
        : isTaskHovered
          ? cardHoverShadow
          : cardShadow
}))

const ContentBlock = styled('div')({
  position: 'relative'
})

const StatusIndicatorBlock = styled('div')({
  display: 'flex'
})

interface Props {
  area: AreaEnum
  isTaskFocused: boolean
  isTaskHovered: boolean
  editor: Editor
  handleCardUpdate: () => void
  isAgenda: boolean
  isDraggingOver: TaskStatusEnum | undefined
  task: OutcomeCard_task$key
  useTaskChild: UseTaskChild
  addTaskChild(name: string): void
  removeTaskChild(name: string): void
}

const OutcomeCard = memo((props: Props) => {
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
      fragment OutcomeCard_task on Task @argumentDefinitions(meetingId: {type: "ID"}) {
        ...IntegratedTaskContent_task
        discussionId
        editors {
          userId
        }
        id
        integration {
          __typename
          ...TaskIntegrationLink_integration
        }
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
  const {integration, status, id: taskId, isHighlighted, editors, discussionId} = task
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const otherEditors = editors.filter((editor) => editor.userId !== viewerId)
  const isEditing = editors.length > otherEditors.length
  const type = integration?.__typename
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
  return (
    <RootCard
      isTaskHovered={isTaskHovered}
      isTaskFocused={isTaskFocused}
      isDragging={!!isDraggingOver}
      isTaskHighlighted={!!isHighlighted}
    >
      <TaskWatermark type={type} />
      <ContentBlock>
        <EditingStatus
          isTaskHovered={isTaskHovered}
          isArchived={isArchived}
          task={task}
          useTaskChild={useTaskChild}
        >
          <StatusIndicatorBlock title={statusIndicatorTitle}>
            <OutcomeCardStatusIndicator status={isDraggingOver || status} />
            {isPrivate && <OutcomeCardStatusIndicator status='private' />}
            {isArchived && <OutcomeCardStatusIndicator status='archived' />}
          </StatusIndicatorBlock>
        </EditingStatus>
        <IntegratedTaskContent task={task} />
        {!type && (
          <div
            className='cursor-text'
            onBlur={() => {
              removeTaskChild('root')
              setTimeout(handleCardUpdate)
            }}
            onFocus={() => addTaskChild('root')}
          >
            <TipTapEditor
              className='px-4'
              editor={editor}
              useLinkEditor={() => useTaskChild('editor-link-changer')}
              onBlur={onFocusChange(false)}
              onFocus={onFocusChange(true)}
            />
          </div>
        )}
        <TaskIntegrationLink integration={integration || null} />
        <TaskFooter
          area={area}
          cardIsActive={isTaskFocused || isTaskHovered || isEditing}
          toggleTag={toggleTag}
          isAgenda={isAgenda}
          task={task}
          useTaskChild={useTaskChild}
        />
      </ContentBlock>
    </RootCard>
  )
})

export default OutcomeCard
