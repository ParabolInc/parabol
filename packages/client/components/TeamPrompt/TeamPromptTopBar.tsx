import styled from '@emotion/styled'
import {KeyboardArrowLeft, KeyboardArrowRight} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {commitLocalUpdate, useFragment} from 'react-relay'
import {Link} from 'react-router-dom'
import {TeamPromptTopBar_meeting$key} from '~/__generated__/TeamPromptTopBar_meeting.graphql'
import useAtmosphere from '~/hooks/useAtmosphere'
import {useRenameMeeting} from '~/hooks/useRenameMeeting'
import NewMeetingAvatarGroup from '~/modules/meeting/components/MeetingAvatarGroup/NewMeetingAvatarGroup'
import useModal from '../../hooks/useModal'
import {meetingAvatarMediaQueries, meetingTopBarMediaQuery} from '../../styles/meeting'
import SendClientSideEvent from '../../utils/SendClientSideEvent'
import EditableText from '../EditableText'
import IconLabel from '../IconLabel'
import LogoBlock from '../LogoBlock/LogoBlock'
import {IconGroupBlock, MeetingTopBarStyles} from '../MeetingTopBar'
import {EndRecurringMeetingModal} from '../Recurrence/EndRecurringMeetingModal'
import {HumanReadableRecurrenceRule} from '../Recurrence/HumanReadableRecurrenceRule'
import {UpdateRecurrenceSettingsModal} from '../Recurrence/UpdateRecurrenceSettingsModal'
import {TeamPromptMeetingStatus} from './TeamPromptMeetingStatus'
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
  marginLeft: '16px',
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
        teamId
        isRightDrawerOpen
        showWorkSidebar
        facilitatorUserId
        localStageId
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
        ...EndRecurringMeetingModal_meeting
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

  const onOpenWorkSidebar = () => {
    if (meeting.isRightDrawerOpen && meeting.showWorkSidebar && !meeting.localStageId) {
      // If we're clicking on 'Your Work' when it's already open, just close the drawer.
      commitLocalUpdate(atmosphere, (store) => {
        const meetingProxy = store.get(meetingId)
        if (!meetingProxy) return
        meetingProxy.setValue(false, 'isRightDrawerOpen')

        SendClientSideEvent(atmosphere, 'Your Work Drawer Closed', {
          teamId: meeting.teamId,
          meetingId: meeting.id,
          source: 'top bar'
        })
      })
    } else {
      commitLocalUpdate(atmosphere, (store) => {
        const meetingProxy = store.get(meetingId)
        if (!meetingProxy) return
        meetingProxy.setValue(null, 'localStageId')
        meetingProxy.setValue(true, 'showWorkSidebar')
        meetingProxy.setValue(true, 'isRightDrawerOpen')

        SendClientSideEvent(atmosphere, 'Your Work Drawer Opened', {
          teamId: meeting.teamId,
          meetingId: meeting.id,
          source: 'top bar'
        })
      })
    }
  }

  const buttons = (
    <ButtonContainer>
      <button
        className='group flex h-max w-max cursor-pointer flex-col items-center bg-transparent px-2 text-sm font-semibold text-sky-500 hover:text-sky-600'
        onClick={onOpenWorkSidebar}
      >
        <IconLabel icon='task_alt' iconLarge />
        <div className='text-slate-700 group-hover:text-slate-900'>Your work</div>
      </button>
      <TeamPromptOptions
        meetingRef={meeting}
        openRecurrenceSettingsModal={toggleRecurrenceSettingsModal}
        openEndRecurringMeetingModal={toggleEndRecurringMeetingModal}
      />
    </ButtonContainer>
  )

  return (
    <>
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
                  <div className='hidden md:block'>
                    <HumanReadableRecurrenceRule recurrenceRule={meetingSeries.recurrenceRule} />
                  </div>
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
        <MiddleSection className='hidden md:flex'>
          <TeamPromptMeetingStatus meetingRef={meeting} />
        </MiddleSection>
        <RightSection>
          <RightSectionContainer>
            <NewMeetingAvatarGroup meetingRef={meeting} />
            <div className='hidden md:block'>{buttons}</div>
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
            meetingRef={meeting}
            recurrenceRule={isRecurrenceEnabled ? meetingSeries.recurrenceRule : undefined}
            closeModal={toggleEndRecurringMeetingModal}
          />
        )}
      </MeetingTopBarStyles>
      <div className='block flex justify-between border-y border-solid border-slate-300 px-4 py-2 md:hidden'>
        <div className='my-1'>
          <TeamPromptMeetingStatus meetingRef={meeting} />
        </div>
        {buttons}
      </div>
    </>
  )
}

export default TeamPromptTopBar
