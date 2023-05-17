import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {Link} from 'react-router-dom'
import React from 'react'
import {useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useRenameMeeting} from '~/hooks/useRenameMeeting'
import NewMeetingAvatarGroup from '~/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import {TeamPromptTopBar_meeting$key} from '~/__generated__/TeamPromptTopBar_meeting.graphql'
import useModal from '../../hooks/useModal'
import {meetingAvatarMediaQueries, meetingTopBarMediaQuery} from '../../styles/meeting'
import EditableText from '../EditableText'
import LogoBlock from '../LogoBlock/LogoBlock'
import {IconGroupBlock, MeetingTopBarStyles} from '../MeetingTopBar'
import {HumanReadableRecurrenceRule} from './Recurrence/HumanReadableRecurrenceRule'
import {UpdateRecurrenceSettingsModal} from './Recurrence/UpdateRecurrenceSettingsModal'
import {EndRecurringMeetingModal} from './Recurrence/EndRecurringMeetingModal'
import {TeamPromptMeetingStatus} from './TeamPromptMeetingStatus'
import TeamPromptOptions from './TeamPromptOptions'
import {KeyboardArrowLeft, KeyboardArrowRight} from '@mui/icons-material'

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
        facilitatorUserId
        prevMeeting {
          id
        }
        nextMeeting {
          id
        }
        meetingSeries {
          id
          cancelledAt
          recurrenceRule
        }
        ...TeamPromptOptions_meeting
        ...NewMeetingAvatarGroup_meeting
        ...TeamPromptMeetingStatus_meeting
        ...UpdateRecurrenceSettingsModal_meeting
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {togglePortal: toggleRecurrenceSettingsModal, modalPortal: recurrenceSettingsModal} =
    useModal({id: 'updateRecurrenceSettingsModal'})
  const {togglePortal: toggleEndRecurringMeetingModal, modalPortal: endRecurringMeetingModal} =
    useModal({id: 'endRecurringMeetingModal'})

  const {viewerId} = atmosphere
  const {
    id: meetingId,
    name: meetingName,
    facilitatorUserId,
    meetingSeries,
    prevMeeting,
    nextMeeting
  } = meeting
  const isFacilitator = viewerId === facilitatorUserId
  const {handleSubmit, validate, error} = useRenameMeeting(meetingId)
  const isRecurrenceEnabled = meetingSeries && !meetingSeries.cancelledAt

  return (
    <MeetingTopBarStyles>
      <MeetingTitleSection>
        <TeamPromptLogoBlock />
        <div>
          <div className='flex w-max gap-1'>
            {isRecurrenceEnabled && prevMeeting && (
              <Link className='text-slate-600' to={`/meet/${prevMeeting.id}`}>
                <KeyboardArrowLeft />
              </Link>
            )}
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
            {isRecurrenceEnabled && nextMeeting && (
              <Link className='text-slate-600' to={`/meet/${nextMeeting.id}`}>
                <KeyboardArrowRight />
              </Link>
            )}
          </div>
        </div>
      </MeetingTitleSection>
      {isDesktop && (
        <MiddleSection>
          <TeamPromptMeetingStatus meetingRef={meeting} />
        </MiddleSection>
      )}
      <RightSection>
        <RightSectionContainer>
          <NewMeetingAvatarGroup meetingRef={meeting} />
          <ButtonContainer>
            <TeamPromptOptions
              meetingRef={meeting}
              openRecurrenceSettingsModal={toggleRecurrenceSettingsModal}
              openEndRecurringMeetingModal={toggleEndRecurringMeetingModal}
            />
          </ButtonContainer>
        </RightSectionContainer>
      </RightSection>
      {recurrenceSettingsModal(
        <UpdateRecurrenceSettingsModal
          meeting={meeting}
          closeModal={toggleRecurrenceSettingsModal}
        />
      )}
      {endRecurringMeetingModal(
        <EndRecurringMeetingModal
          meetingId={meetingId}
          recurrenceRule={isRecurrenceEnabled ? meetingSeries.recurrenceRule : undefined}
          closeModal={toggleEndRecurringMeetingModal}
        />
      )}
    </MeetingTopBarStyles>
  )
}

export default TeamPromptTopBar
