import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import type {StageTimerControl_meeting$key} from '~/__generated__/StageTimerControl_meeting.graphql'
import {MenuPosition} from '../hooks/useCoords'
import useMenu from '../hooks/useMenu'
import {MeetingLabels} from '../types/constEnums'
import lazyPreload from '../utils/lazyPreload'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'

interface Props {
  cancelConfirm: (() => void) | undefined
  defaultTimeLimit: number
  meeting: StageTimerControl_meeting$key
}

const StageTimerModal = lazyPreload(
  async () => import(/* webpackChunkName: 'StageTimerModal' */ './StageTimerModal')
)

const StageTimerControl = (props: Props) => {
  const {cancelConfirm, defaultTimeLimit, meeting: meetingRef} = props
  const meeting = useFragment(
    graphql`
      fragment StageTimerControl_meeting on NewMeeting {
        id
        meetingMembers {
          isConnectedAt
        }
        localStage {
          ...StageTimerControlStage @relay(mask: false)
        }
        phases {
          stages {
            ...StageTimerControlStage @relay(mask: false)
          }
        }
        viewerMeetingMember {
          teamMember {
            ...StageTimerModal_teamMember
          }
        }
      }
    `,
    meetingRef
  )
  const {meetingMembers, localStage, viewerMeetingMember, id: meetingId} = meeting
  // The timer controls only render for the facilitator, so the viewer is always the facilitator here.
  // We read the viewer's own team member (not facilitator) because TeamMember.integrations is private
  // to its owner and must not be fetched for other team members.
  const teamMember = viewerMeetingMember?.teamMember
  const {isAsync} = localStage
  const connectedMemberCount = meetingMembers.filter((member) => member.isConnectedAt).length
  const color = 'green'
  const icon = isAsync ? 'event' : 'timer'
  const label = isAsync ? MeetingLabels.TIME_LIMIT : MeetingLabels.TIMER
  const {menuProps, menuPortal, originRef, togglePortal} = useMenu<HTMLDivElement>(
    MenuPosition.LOWER_LEFT,
    {
      isDropdown: true,
      id: 'StageTimerModal'
    }
  )
  return (
    <>
      <BottomNavControl
        confirming={!!cancelConfirm}
        onMouseEnter={StageTimerModal.preload}
        onClick={cancelConfirm || togglePortal}
      >
        <BottomNavIconLabel ref={originRef} icon={icon} iconColor={color} label={label} />
      </BottomNavControl>
      {teamMember &&
        menuPortal(
          <StageTimerModal
            defaultToAsync={connectedMemberCount <= 1}
            defaultTimeLimit={defaultTimeLimit}
            meetingId={meetingId}
            menuProps={menuProps}
            stage={localStage}
            teamMember={teamMember}
          />
        )}
    </>
  )
}

graphql`
  fragment StageTimerControlStage on NewMeetingStage {
    ...StageTimerModal_stage
    isAsync
    isComplete
  }
`

export default StageTimerControl
