import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useRenameMeeting} from '~/hooks/useRenameMeeting'
import NewMeetingAvatarGroup from '~/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {PALETTE} from '~/styles/paletteV3'
import {TeamPromptTopBar_meeting$key} from '~/__generated__/TeamPromptTopBar_meeting.graphql'
import {meetingAvatarMediaQueries, meetingTopBarMediaQuery} from '../../styles/meeting'
import EditableText from '../EditableText'
import LogoBlock from '../LogoBlock/LogoBlock'
import {IconGroupBlock, MeetingTopBarStyles} from '../MeetingTopBar'
import {HumanReadableRecurrenceRule} from './Recurrence/HumanReadableRecurrenceRule'
import {TeamPromptEndedBadge} from './TeamPromptEndedBadge'
import TeamPromptOptions from './TeamPromptOptions'

const TeamPromptLogoBlock = styled(LogoBlock)({
  marginRight: '8px',
  paddingLeft: '0',
  flexShrink: 0
})

const TeamPromptHeaderTitle = styled('h1')({
  fontSize: 16,
  lineHeight: '24px',
  margin: 0,
  padding: 0,
  fontWeight: 600,
  [meetingTopBarMediaQuery]: {
    fontSize: 18
  }
})

const EditableTeamPromptHeaderTitle = TeamPromptHeaderTitle.withComponent(EditableText)

const MeetingTitleSection = styled('div')({
  margin: 'auto 0',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flex: 1
})

const MiddleSection = styled('div')({
  margin: 'auto 0',
  flex: 2,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
})

export const RightSection = styled(IconGroupBlock)({
  margin: 'auto 0',
  flex: 1,
  display: 'flex',
  justifyContent: 'flex-end'
})

export const RightSectionContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
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

const BetaBadge = styled('div')({
  borderRadius: 44,
  backgroundColor: PALETTE.GRAPE_500,
  color: PALETTE.SLATE_100,
  fontWeight: 600,
  fontSize: 12,
  lineHeight: '11px',
  marginRight: 53,
  padding: '8px 16px 8px 16px'
})

interface Props {
  meetingRef: TeamPromptTopBar_meeting$key
  isDesktop: boolean
}

const TeamPromptTopBar = (props: Props) => {
  const {meetingRef, isDesktop} = props

  const meeting = useFragment(
    graphql`
      fragment TeamPromptTopBar_meeting on TeamPromptMeeting {
        id
        name
        endedAt
        facilitatorUserId
        meetingSeries {
          id
          cancelledAt
          recurrenceRule
        }
        ...TeamPromptOptions_meeting
        ...NewMeetingAvatarGroup_meeting
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const {id: meetingId, name: meetingName, facilitatorUserId, endedAt, meetingSeries} = meeting
  const isFacilitator = viewerId === facilitatorUserId
  const {handleSubmit, validate, error} = useRenameMeeting(meetingId)
  const isMeetingEnded = !!endedAt
  const isRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt

  return (
    <MeetingTopBarStyles>
      <MeetingTitleSection>
        <TeamPromptLogoBlock />
        <div>
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
          {isRecurrenceEnabled && (
            <HumanReadableRecurrenceRule recurrenceRule={meetingSeries.recurrenceRule} />
          )}
        </div>
      </MeetingTitleSection>
      {isDesktop && isMeetingEnded && (
        <MiddleSection>
          <TeamPromptEndedBadge />
        </MiddleSection>
      )}
      <RightSection>
        <RightSectionContainer>
          {isDesktop && <BetaBadge>BETA</BetaBadge>}
          <NewMeetingAvatarGroup meetingRef={meeting} />
          <ButtonContainer>
            <TeamPromptOptions meetingRef={meeting} />
          </ButtonContainer>
        </RightSectionContainer>
      </RightSection>
    </MeetingTopBarStyles>
  )
}

export default TeamPromptTopBar
