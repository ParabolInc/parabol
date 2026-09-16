import graphql from 'babel-plugin-relay/macro'
import type {ReactElement} from 'react'
import {useFragment} from 'react-relay'
import type {NewMeetingCheckIn_meeting$key} from '~/__generated__/NewMeetingCheckIn_meeting.graphql'
import type useGotoStageId from '~/hooks/useGotoStageId'
import {RecordVoiceOver} from '~/ui/icons'
import useAtmosphere from '../hooks/useAtmosphere'
import NewMeetingCheckInPrompt from '../modules/meeting/components/MeetingCheckInPrompt/NewMeetingCheckInPrompt'
import MeetingFacilitationHint from '../modules/meeting/components/MeetingFacilitationHint/MeetingFacilitationHint'
import findStageAfterId from '../utils/meetings/findStageAfterId'
import {phaseLabelLookup} from '../utils/meetings/lookups'
import MeetingContent from './MeetingContent'
import MeetingHeaderAndPhase from './MeetingHeaderAndPhase'
import MeetingTopBar from './MeetingTopBar'
import PhaseHeaderTitle from './PhaseHeaderTitle'
import PhaseWrapper from './PhaseWrapper'

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
          ...NewMeetingCheckInLocalStage @relay(mask: false) @alias
        }
        phases {
          stages {
            id
            ...NewMeetingCheckInLocalStage @relay(mask: false) @alias
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
  const user = localStage.NewMeetingCheckInLocalStage?.teamMember.user
  const nextStageRes = findStageAfterId(phases, localStageId)
  // in case the checkin is the last phase of the meeting
  if (!nextStageRes || !user) return null
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
          <NewMeetingCheckInPrompt meetingRef={meeting} userRef={user} />
          <div className='flex min-h-[98px] w-full justify-center p-4'>
            {isViewerMeetingSection && (
              <div className='mt-4'>
                <RecordVoiceOver className='mx-auto mb-1 block text-fg-secondary' />
                <MeetingFacilitationHint>
                  {'Verbally share your response with the team'}
                </MeetingFacilitationHint>
              </div>
            )}
          </div>
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
