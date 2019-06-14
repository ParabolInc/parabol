import {MeetingStageTimeLimit_notification} from '__generated__/MeetingStageTimeLimit_notification.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import IconAvatar from 'universal/components/IconAvatar/IconAvatar'
import RaisedButton from 'universal/components/RaisedButton'
import Row from 'universal/components/Row/Row'
import ui from 'universal/styles/ui'
import NotificationButton from './NotificationButton'
import NotificationMessage from './NotificationMessage'
import useRouter from 'universal/hooks/useRouter'
import {meetingTypeToLabel, meetingTypeToSlug} from 'universal/utils/meetings/lookups'

interface Props {
  notification: MeetingStageTimeLimit_notification
}

const StyledButton = styled(RaisedButton)({...ui.buttonBlockStyles})

const MeetingStageTimeLimit = (props: Props) => {
  const {notification} = props
  const {history} = useRouter()
  const {meeting} = notification
  const {meetingType, team} = meeting
  const {id: teamId, name: teamName} = team
  const meetingLabel = meetingTypeToLabel[meetingType]

  const goThere = () => {
    const meetingSlug = meetingTypeToSlug[meetingType]
    history.push(`/${meetingSlug}/${teamId}`)
  }

  return (
    <Row>
      <IconAvatar icon='group' size='small' />
      <NotificationMessage>
        {'Your '}
        <b>{meetingLabel}</b>
        {' meeting for '}
        <b>{teamName}</b>
        {' is ready to move forward!'}
      </NotificationMessage>
      <NotificationButton>
        <StyledButton
          aria-label='Go to meeting'
          size={ui.notificationButtonSize}
          onClick={goThere}
          palette='warm'
        >
          {'Go There'}
        </StyledButton>
      </NotificationButton>
    </Row>
  )
}

export default createFragmentContainer(
  MeetingStageTimeLimit,
  graphql`
    fragment MeetingStageTimeLimit_notification on NotificationMeetingStageTimeLimit {
      id
      meeting {
        meetingType
        team {
          id
          name
        }
      }
    }
  `
)
