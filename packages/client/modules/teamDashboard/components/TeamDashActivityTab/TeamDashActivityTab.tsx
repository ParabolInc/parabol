import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TeamDashActivityTab_team$key} from '~/__generated__/TeamDashActivityTab_team.graphql'
import useTransition from '../../../../hooks/useTransition'
import MeetingCard from '../../../../components/MeetingCard'
import DemoMeetingCard from '../../../../components/DemoMeetingCard'
import TutorialMeetingCard from '../../../../components/TutorialMeetingCard'
import TeamDashInsights from '../TeamDashInsights/TeamDashInsights'

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
        insights {
          id
          ...TeamDashInsights_insights
        }
      }
    `,
    teamRef
  )

  const {activeMeetings, insights} = team
  const transitioningMeetings = useTransition(
    activeMeetings.map((meeting, displayIdx) => ({
      ...meeting,
      key: meeting.id,
      displayIdx
    }))
  )

  return (
    <div className='flex h-full w-full flex-1 flex-col overflow-auto pl-4'>
      <div className='flex flex-col pl-2'>
        <h3 className='mb-0 text-base font-semibold'>Open Meetings</h3>
        {transitioningMeetings.length === 0 && (
          <p className='my-2'>No meetings yet? You've come to the right place!</p>
        )}
      </div>
      <div className='flex w-full flex-wrap pr-4'>
        {transitioningMeetings.length > 0 ? (
          transitioningMeetings.map((meeting) => {
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
          })
        ) : (
          <>
            <DemoMeetingCard />
            <TutorialMeetingCard type='standup' />
            <TutorialMeetingCard type='poker' />
          </>
        )}
      </div>
      {insights && (
        <div className='flex w-full flex-wrap pr-4'>
          <TeamDashInsights teamInsightsRef={insights} />
        </div>
      )}
    </div>
  )
}
export default TeamDashActivityTab
