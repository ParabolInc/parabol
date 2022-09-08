import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useTranslation} from 'react-i18next'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useRenameMeeting} from '~/hooks/useRenameMeeting'
import NewMeetingAvatarGroup from '~/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {PALETTE} from '~/styles/paletteV3'
import {TeamPromptTopBar_meeting$key} from '~/__generated__/TeamPromptTopBar_meeting.graphql'
import {meetingAvatarMediaQueries} from '../../styles/meeting'
import BackButton from '../BackButton'
import EditableText from '../EditableText'
import {IconGroupBlock, MeetingTopBarStyles} from '../MeetingTopBar'
import TeamPromptOptions from './TeamPromptOptions'

const TeamPromptHeaderTitle = styled('h1')({
  fontSize: 18,
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

  const {t} = useTranslation()

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
        <BackButton ariaLabel={t('TeamPromptTopBar.BackToMeetings')} to='/meetings' />
        {isFacilitator ? (
          <EditableTeamPromptHeaderTitle
            error={error?.message}
            handleSubmit={handleSubmit}
            initialValue={meetingName}
            isWrap
            maxLength={50}
            validate={validate}
            placeholder={t('TeamPromptTopBar.BestMeetingEver')}
          />
        ) : (
          <TeamPromptHeaderTitle>{meetingName}</TeamPromptHeaderTitle>
        )}
      </TeamPromptHeader>
      <IconGroupBlock>
        {isDesktop && <BetaBadge>{t('TeamPromptTopBar.Beta')}</BetaBadge>}
        <NewMeetingAvatarGroup meeting={meeting} />
        <ButtonContainer>
          <TeamPromptOptions meetingRef={meeting} />
        </ButtonContainer>
      </IconGroupBlock>
    </MeetingTopBarStyles>
  )
}

export default TeamPromptTopBar
