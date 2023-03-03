import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TransitionStatus} from '~/hooks/useTransition'
import {StageTimerControl_meeting$key} from '~/__generated__/StageTimerControl_meeting.graphql'
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
  onTransitionEnd: () => void
  status: TransitionStatus
}

const StageTimerModal = lazyPreload(
  async () => import(/* webpackChunkName: 'StageTimerModal' */ './StageTimerModal')
)

const StageTimerControl = (props: Props) => {
  const {cancelConfirm, defaultTimeLimit, meeting: meetingRef, status, onTransitionEnd} = props
  const meeting = useFragment(
    graphql`
      fragment StageTimerControl_meeting on NewMeeting {
        id
        meetingMembers {
          user {
            isConnected
          }
        }
        localStage {
          ...StageTimerControlStage @relay(mask: false)
        }
        phases {
          stages {
            ...StageTimerControlStage @relay(mask: false)
          }
        }
        facilitator {
          ...StageTimerModal_facilitator
        }
      }
    `,
    meetingRef
  )
  const {meetingMembers, localStage, facilitator, id: meetingId} = meeting
  const {isAsync} = localStage
  const connectedMemberCount = meetingMembers.filter((member) => member.user.isConnected).length
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
        status={status}
        onTransitionEnd={onTransitionEnd}
      >
        <BottomNavIconLabel ref={originRef} icon={icon} iconColor={color} label={label} />
      </BottomNavControl>
      {menuPortal(
        <StageTimerModal
          defaultToAsync={connectedMemberCount <= 1}
          defaultTimeLimit={defaultTimeLimit}
          meetingId={meetingId}
          menuProps={menuProps}
          stage={localStage}
          facilitator={facilitator}
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
