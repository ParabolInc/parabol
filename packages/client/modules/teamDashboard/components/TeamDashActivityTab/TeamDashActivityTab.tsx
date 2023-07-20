import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TeamDashActivityTab_team$key} from '~/__generated__/TeamDashActivityTab_team.graphql'
import useTransition from '../../../../hooks/useTransition'
import MeetingCard from '../../../../components/MeetingCard'

interface Props {
  teamRef: TeamDashActivityTab_team$key
}

const TeamDashActivityTab = (props: Props) => {
  const {teamRef} = props
  const team = useFragment(
    graphql`
      fragment TeamDashActivityTab_team on Team {
        activeMeetings {
          id
          ...MeetingCard_meeting
        }
      }
    `,
    teamRef
  )

  const {activeMeetings} = team
  const transitioningMeetings = useTransition(
    activeMeetings.map((meeting, displayIdx) => ({
      ...meeting,
      key: meeting.id,
      displayIdx
    }))
  )

  return (
    <div className='flex h-full w-full'>
      {transitioningMeetings.map((meeting) => {
        const {child} = meeting
        const {id, displayIdx} = child
        return (
          <MeetingCard
            key={id}
            displayIdx={displayIdx}
            meeting={meeting.child}
            onTransitionEnd={meeting.onTransitionEnd}
            status={meeting.status}
          />
        )
      })}
    </div>
  )
}
export default TeamDashActivityTab
