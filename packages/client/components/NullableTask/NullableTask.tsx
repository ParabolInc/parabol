import {useEventCallback} from '@mui/material'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {AreaEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {NullableTask_task$key} from '../../__generated__/NullableTask_task.graphql'
import DraggableTaskWrapper from '../../containers/TaskCard/DraggableTaskWrapper'
import useAtmosphere from '../../hooks/useAtmosphere'
import useTaskChildFocus from '../../hooks/useTaskChildFocus'
import {useTipTapTaskEditor} from '../../hooks/useTipTapTaskEditor'
import OutcomeCardContainer from '../../modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer'
import DeleteTaskMutation from '../../mutations/DeleteTaskMutation'
import UpdateTaskMutation from '../../mutations/UpdateTaskMutation'
import {isEqualWhenSerialized} from '../../shared/isEqualWhenSerialized'
import isTaskArchived from '../../utils/isTaskArchived'
import isTempId from '../../utils/relay/isTempId'
import NullCard from '../NullCard/NullCard'

type Props = {
  area: AreaEnum
  className?: string
  isAgenda?: boolean
  task: NullableTask_task$key
  isViewerMeetingSection?: boolean
  meetingId?: string
} & (
  | {
      isDraggable?: false | undefined
      draggableIndex?: undefined
    }
  | {
      isDraggable: true
      draggableIndex: number
    }
)

const NullableTask = (props: Props) => {
  const {
    area,
    className,
    isAgenda,
    task: taskRef,
    isViewerMeetingSection,
    meetingId,
    isDraggable,
    draggableIndex
  } = props
  const task = useFragment(
    graphql`
      # from this place upward the tree, the task components are also used outside of meetings, thus we default to null here
      fragment NullableTask_task on Task
      @argumentDefinitions(meetingId: {type: "ID", defaultValue: null}) {
        id
        content
        createdBy
        sortOrder
        createdByUser {
          preferredName
        }
        integration {
          __typename
        }
        status
        teamId
        tags
        ...OutcomeCardContainer_task @arguments(meetingId: $meetingId)
      }
    `,
    taskRef
  )
  const {content, createdBy, createdByUser, integration, teamId, id: taskId, tags} = task
  const isIntegration = !!integration?.__typename
  const {preferredName} = createdByUser
  const atmosphere = useAtmosphere()
  const isArchived = isTaskArchived(tags)
  const readOnly = isTempId(taskId) || isArchived || isIntegration

  const {isTaskFocused} = useTaskChildFocus(taskId)

  const handleCardUpdate = useEventCallback(() => {
    if (!editor || readOnly) return
    const isFocused = isTaskFocused()
    if (editor.isEmpty && !isFocused) {
      DeleteTaskMutation(atmosphere, {taskId})
      return
    }
    const nextContentJSON = editor.getJSON()
    if (isEqualWhenSerialized(JSON.parse(content), nextContentJSON)) return
    const updatedTask = {
      id: taskId,
      content: JSON.stringify(nextContentJSON)
    }
    UpdateTaskMutation(atmosphere, {updatedTask, area}, {})
  })

  const onModEnter = useEventCallback(() => {
    handleCardUpdate()
    editor?.commands.blur()
  })

  const {editor} = useTipTapTaskEditor(content, {
    atmosphere,
    teamId,
    readOnly,
    onModEnter: onModEnter,
    onBlur: handleCardUpdate
  })

  const showOutcome =
    editor && (!editor.isEmpty || createdBy === atmosphere.viewerId || isIntegration)
  const renderTask = showOutcome ? (
    <OutcomeCardContainer
      area={area}
      className={className}
      editor={editor}
      isAgenda={isAgenda}
      task={task}
      isViewerMeetingSection={isViewerMeetingSection}
      meetingId={meetingId}
      handleCardUpdate={handleCardUpdate}
    />
  ) : (
    <NullCard className={className} preferredName={preferredName} />
  )
  if (isDraggable) {
    return (
      <DraggableTaskWrapper draggableId={taskId} index={draggableIndex}>
        {renderTask}
      </DraggableTaskWrapper>
    )
  }
  return renderTask
}

export default NullableTask
