import styled from '@emotion/styled'
import {RecordVoiceOver} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import {ReactElement} from 'react'
import {useFragment} from 'react-relay'
import {NewMeetingCheckIn_meeting$key} from '~/__generated__/NewMeetingCheckIn_meeting.graphql'
import useGotoStageId from '~/hooks/useGotoStageId'
import useAtmosphere from '../hooks/useAtmosphere'
import NewMeetingCheckInPrompt from '../modules/meeting/components/MeetingCheckInPrompt/NewMeetingCheckInPrompt'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import {PALETTE} from '../styles/paletteV3'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'

const CheckIn = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  minHeight: 98,
  padding: 16,
  width: '100%'
})

const Hint = styled('div')({
  marginTop: 16
})

const StyledIcon = styled(RecordVoiceOver)({
  color: PALETTE.SLATE_600,
  display: 'block',
  margin: '0 auto 4px'
})

interface Props {
  avatarGroup: ReactElement
  meeting: NewMeetingCheckIn_meeting$key
  toggleSidebar: () => void
  gotoStageId?: ReturnType<typeof useGotoStageId>
}

const NewMeetingCheckIn = (props: Props) => {
  const {avatarGroup, meeting: meetingRef, toggleSidebar} = props
  const meeting = useFragment(
    graphql`
      fragment NewMeetingCheckIn_meeting on NewMeeting {
        ...NewMeetingCheckInPrompt_meeting
        endedAt
        showSidebar
        facilitatorStageId
        localStage {
          id
          ...NewMeetingCheckInLocalStage @relay(mask: false)
        }
        phases {
          stages {
            id
            ...NewMeetingCheckInLocalStage @relay(mask: false)
          }
        }
        teamId
      }
    `,
    meetingRef
  )
  const atmosphere = useAtmosphere()
  const {endedAt, showSidebar, localStage, phases} = meeting
  const {id: localStageId} = localStage
  const user = localStage.teamMember?.user
  const nextStageRes = findStageAfterId(phases, localStageId)
  // in case the checkin is the last phase of the meeting
  if (!nextStageRes) return null
  const {viewerId} = atmosphere
  const isViewerMeetingSection = user?.id === viewerId
  return (
    <MeetingContent>
      <MeetingHeaderAndPhase hideBottomBar={!!endedAt}>
        <MeetingTopBar
          avatarGroup={avatarGroup}
          isMeetingSidebarCollapsed={!showSidebar}
          toggleSidebar={toggleSidebar}
        >
          <PhaseHeaderTitle>{phaseLabelLookup.checkin}</PhaseHeaderTitle>
        </MeetingTopBar>
        <PhaseWrapper>
          <NewMeetingCheckInPrompt meetingRef={meeting} userRef={user!} />
          <CheckIn>
            {isViewerMeetingSection && (
              <Hint>
                <StyledIcon />
                <MeetingFacilitationHint>
                  {'Verbally share your response with the team'}
                </MeetingFacilitationHint>
              </Hint>
            )}
          </CheckIn>
        </PhaseWrapper>
      </MeetingHeaderAndPhase>
    </MeetingContent>
  )
}

graphql`
  fragment NewMeetingCheckInLocalStage on CheckInStage {
    teamMember {
      user {
        id
        ...NewMeetingCheckInPrompt_user
      }
    }
  }
`

export default NewMeetingCheckIn
