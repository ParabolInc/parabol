import graphql from 'babel-plugin-relay/macro'
import {Suspense, useState} from 'react'
import {useFragment} from 'react-relay'
import type {StageTimerControl_meeting$key} from '~/__generated__/StageTimerControl_meeting.graphql'
import {MeetingLabels} from '../types/constEnums'
import {Menu} from '../ui/Menu/Menu'
import {MenuContent} from '../ui/Menu/MenuContent'
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
  const [isOpen, setIsOpen] = useState(false)

  if (cancelConfirm) {
    return (
      <BottomNavControl confirming onMouseEnter={StageTimerModal.preload} onClick={cancelConfirm}>
        <BottomNavIconLabel icon={icon} iconColor={color} label={label} />
      </BottomNavControl>
    )
  }

  return (
    <Menu
      open={isOpen}
      onOpenChange={setIsOpen}
      trigger={
        <BottomNavControl onMouseEnter={StageTimerModal.preload}>
          <BottomNavIconLabel icon={icon} iconColor={color} label={label} />
        </BottomNavControl>
      }
    >
      <MenuContent
        side='top'
        align='start'
        className='max-h-none w-auto max-w-none overflow-visible'
        // the date & hour pickers open their own radix menus, which would otherwise dismiss this one
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement | null
          // the hour picker is item-aligned, so it has no popper wrapper to match on
          if (target?.closest('[data-radix-popper-content-wrapper],[role="listbox"]'))
            e.preventDefault()
        }}
      >
        <Suspense fallback={null}>
          {teamMember && (
            <StageTimerModal
              defaultToAsync={connectedMemberCount <= 1}
              defaultTimeLimit={defaultTimeLimit}
              meetingId={meetingId}
              closePortal={() => setIsOpen(false)}
              stage={localStage}
              teamMember={teamMember}
            />
          )}
        </Suspense>
      </MenuContent>
    </Menu>
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
