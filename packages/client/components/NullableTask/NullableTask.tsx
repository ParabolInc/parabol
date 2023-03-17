import graphql from 'babel-plugin-relay/macro'
import {convertFromRaw} from 'draft-js'
import React, {useMemo} from 'react'
import {useFragment} from 'react-relay'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import OutcomeCardContainer from '../../modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer'
import makeEmptyStr from '../../utils/draftjs/makeEmptyStr'
import {NullableTask_task$key} from '../../__generated__/NullableTask_task.graphql'
import NullCard from '../NullCard/NullCard'

interface Props {
  area: AreaEnum
  className?: string
  isAgenda?: boolean
  isDraggingOver?: TaskStatusEnum
  task: NullableTask_task$key
  dataCy: string
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
    dataCy,
    isViewerMeetingSection,
    meetingId
  } = props
  const task = useFragment(
    graphql`
      # from this place upward the tree, the task components are also used outside of meetings, thus we default to null here
      fragment NullableTask_task on Task
      @argumentDefinitions(meetingId: {type: "ID", defaultValue: null}) {
        content
        createdBy
        createdByUser {
          preferredName
        }
        integration {
          __typename
        }
        status
        ...OutcomeCardContainer_task @arguments(meetingId: $meetingId)
      }
    `,
    taskRef
  )
  const {content, createdBy, createdByUser, integration} = task
  const {preferredName} = createdByUser
  const contentState = useMemo(() => {
    try {
      return convertFromRaw(JSON.parse(content))
    } catch (e) {
      return convertFromRaw(JSON.parse(makeEmptyStr()))
    }
  }, [content])

  const atmosphere = useAtmosphere()

  const showOutcome = contentState.hasText() || createdBy === atmosphere.viewerId || integration
  return showOutcome ? (
    <OutcomeCardContainer
      dataCy={`${dataCy}`}
      area={area}
      className={className}
      contentState={contentState}
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
