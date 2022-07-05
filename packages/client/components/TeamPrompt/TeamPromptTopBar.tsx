import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useRenameMeeting} from '~/hooks/useRenameMeeting'
import NewMeetingAvatarGroup from '~/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {TeamPromptTopBar_meeting$key} from '~/__generated__/TeamPromptTopBar_meeting.graphql'
import {meetingAvatarMediaQueries} from '../../styles/meeting'
import BackButton from '../BackButton'
import EditableText from '../EditableText'
import {IconGroupBlock, MeetingTopBarStyles} from '../MeetingTopBar'
import TeamPromptOptions from './TeamPromptOptions'

const TeamPromptHeaderTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  padding: 0,
  fontWeight: 600
})

const EditableTeamPromptHeaderTitle = TeamPromptHeaderTitle.withComponent(EditableText)

const TeamPromptHeader = styled('div')({
  margin: 'auto 0',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start'
})

const ButtonContainer = styled('div')({
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
  height: 32,
  [meetingAvatarMediaQueries[0]]: {
    height: 48,
    marginLeft: 10
  },
  [meetingAvatarMediaQueries[1]]: {
    height: 56
  }
})

interface Props {
  meetingRef: TeamPromptTopBar_meeting$key
}

const TeamPromptTopBar = (props: Props) => {
  const {meetingRef} = props

  const meeting = useFragment(
    graphql`
      fragment TeamPromptTopBar_meeting on TeamPromptMeeting {
        id
        name
        facilitatorUserId
        ...TeamPromptOptions_meeting
        ...NewMeetingAvatarGroup_meeting
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {id: meetingId, name: meetingName, facilitatorUserId} = meeting
  const isFacilitator = viewerId === facilitatorUserId
  const {handleSubmit, validate, error} = useRenameMeeting(meetingId)

  return (
    <MeetingTopBarStyles>
      <TeamPromptHeader>
        <BackButton ariaLabel='Back to Meetings' to='/meetings' />
        {isFacilitator ? (
          <EditableTeamPromptHeaderTitle
            error={error?.message}
            handleSubmit={handleSubmit}
            initialValue={meetingName}
            isWrap
            maxLength={50}
            validate={validate}
            placeholder={'Best Meeting Ever!'}
          />
        ) : (
          <TeamPromptHeaderTitle>{meetingName}</TeamPromptHeaderTitle>
        )}
      </TeamPromptHeader>
      <IconGroupBlock>
        <NewMeetingAvatarGroup meeting={meeting} />
        <ButtonContainer>
          <TeamPromptOptions meetingRef={meeting} />
        </ButtonContainer>
      </IconGroupBlock>
    </MeetingTopBarStyles>
  )
}

export default TeamPromptTopBar
