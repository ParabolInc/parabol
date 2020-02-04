import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import IconAvatar from '../../../components/IconAvatar/IconAvatar'
import RaisedButton from '../../../components/RaisedButton'
import Row from '../../../components/Row/Row'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useMutationProps from '../../../hooks/useMutationProps'
import useRouter from '../../../hooks/useRouter'
import SetNotificationStatusMutation from '../../../mutations/SetNotificationStatusMutation'
import ui from '../../../styles/ui'
import {MeetingStageTimeLimitEnd_notification} from '../../../__generated__/MeetingStageTimeLimitEnd_notification.graphql'
import AcknowledgeButton from './AcknowledgeButton/AcknowledgeButton'
import NotificationButton from './NotificationButton'
import NotificationErrorMessage from './NotificationErrorMessage'
import NotificationMessage from './NotificationMessage'
import {NotificationStatusEnum} from 'types/graphql'

interface Props {
  notification: MeetingStageTimeLimitEnd_notification
}

const StyledButton = styled(RaisedButton)({...ui.buttonBlockStyles})

const MeetingStageTimeLimitEnd = (props: Props) => {
  const {notification} = props
  const {history} = useRouter()
  const {id: notificationId, meeting} = notification
  const {id: meetingId, name: meetingName, team} = meeting
  const {name: teamName} = team
  const {error, submitMutation, onCompleted, onError, submitting} = useMutationProps()
  const atmosphere = useAtmosphere()
  const goThere = () => {
    history.push(`/meet/${meetingId}`)
  }

  const acknowledge = () => {
    if (submitting) return
    submitMutation()
    SetNotificationStatusMutation(
      atmosphere,
      {notificationId, status: NotificationStatusEnum.CLICKED},
      {onError, onCompleted}
    )
  }

  return (
    <>
      <Row>
        <IconAvatar>group</IconAvatar>
        <NotificationMessage>
          <b>{meetingName}</b>
          {' for '}
          <b>{teamName}</b>
          {' is ready to move forward!'}
        </NotificationMessage>
        <NotificationButton>
          <StyledButton aria-label='Go to meeting' size={'small'} onClick={goThere} palette='warm'>
            {'Go to Meeting'}
          </StyledButton>
        </NotificationButton>
        <AcknowledgeButton onClick={acknowledge} waiting={submitting} />
      </Row>
      <NotificationErrorMessage error={error} />
    </>
  )
}

export default createFragmentContainer(MeetingStageTimeLimitEnd, {
  notification: graphql`
    fragment MeetingStageTimeLimitEnd_notification on NotificationMeetingStageTimeLimitEnd {
      id
      meeting {
        id
        name
        team {
          name
        }
      }
    }
  `
})
