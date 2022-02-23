import graphql from 'babel-plugin-relay/macro'
import {convertFromRaw} from 'draft-js'
import React, {useEffect, useMemo} from 'react'
import {createFragmentContainer} from 'react-relay'
import {AreaEnum, TaskStatusEnum} from '~/__generated__/UpdateTaskMutation.graphql'
import useAtmosphere from '../../hooks/useAtmosphere'
import OutcomeCardContainer from '../../modules/outcomeCard/containers/OutcomeCard/OutcomeCardContainer'
import makeEmptyStr from '../../utils/draftjs/makeEmptyStr'
import {NullableTask_task} from '../../__generated__/NullableTask_task.graphql'
import NullCard from '../NullCard/NullCard'

interface Props {
  area: AreaEnum
  className?: string
  isAgenda?: boolean
  isDraggingOver?: TaskStatusEnum
  measure?: () => void
  task: NullableTask_task
  dataCy: string
  isViewerMeetingSection?: boolean
  meetingId?: string
}

const NullableTask = (props: Props) => {
  const {area, className, isAgenda, task, isDraggingOver, dataCy, isViewerMeetingSection, meetingId} = props
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
  useEffect(
    () => {
      let isMounted = true
      setTimeout(() => {
        isMounted && props.measure && props.measure()
      })
      return () => {
        isMounted = false
      }
    },
    [
      /* eslint-disable-line react-hooks/exhaustive-deps*/
    ]
  )

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

export default createFragmentContainer(NullableTask, {
  task: graphql`
    fragment NullableTask_task on Task @argumentDefinitions(meetingId: {type: "ID", defaultValue: null}) {
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
  `
})
