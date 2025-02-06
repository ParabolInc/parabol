import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import {NullableTask_task$key} from '../../__generated__/NullableTask_task.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import {useTipTapTaskEditor} from '../../hooks/useTipTapTaskEditor'
import OutcomeCardContainer from '../../modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer'
import isTaskArchived from '../../utils/isTaskArchived'
import isTempId from '../../utils/relay/isTempId'
import NullCard from '../NullCard/NullCard'

interface Props {
  area: AreaEnum
  className?: string
  isAgenda?: boolean
  isDraggingOver?: TaskStatusEnum
  task: NullableTask_task$key
  isViewerMeetingSection?: boolean
  meetingId?: string
}

const NullableTask = (props: Props) => {
  const {
    area,
    className,
    isAgenda,
    task: taskRef,
    isDraggingOver,
    isViewerMeetingSection,
    meetingId
  } = props
  const task = useFragment(
    graphql`
      # from this place upward the tree, the task components are also used outside of meetings, thus we default to null here
      fragment NullableTask_task on Task
      @argumentDefinitions(meetingId: {type: "ID", defaultValue: null}) {
        id
        content
        createdBy
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
  const readOnly = isTempId(taskId) || isArchived || !!isDraggingOver || isIntegration
  const {editor} = useTipTapTaskEditor(content, {
    atmosphere,
    teamId,
    readOnly
  })

  const showOutcome =
    editor && (!editor.isEmpty || createdBy === atmosphere.viewerId || isIntegration)
  return showOutcome ? (
    <OutcomeCardContainer
      area={area}
      className={className}
      editor={editor}
      isDraggingOver={isDraggingOver}
      isAgenda={isAgenda}
      task={task}
      isViewerMeetingSection={isViewerMeetingSection}
      meetingId={meetingId}
    />
  ) : (
    <NullCard className={className} preferredName={preferredName} />
  )
}

export default NullableTask
