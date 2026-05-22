import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {TeamDashActivityTab_team$key} from '~/__generated__/TeamDashActivityTab_team.graphql'
import DemoMeetingCard from '../../../../components/DemoMeetingCard'
import MeetingCard from '../../../../components/MeetingCard'
import ScheduledSeriesCard from '../../../../components/ScheduledSeriesCard'
import TutorialMeetingCard from '../../../../components/TutorialMeetingCard'
import useTransition from '../../../../hooks/useTransition'

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
          meetingSeries {
            id
            cancelledAt
          }
        }
        activeMeetingSeries {
          id
          cancelledAt
          mostRecentMeeting {
            id
            ...MeetingCard_meeting
          }
          ...ScheduledSeriesCard_series
        }
      }
    `,
    teamRef
  )

  const {activeMeetings, activeMeetingSeries} = team
  const activeSeries = useMemo(
    () => activeMeetingSeries.filter((series) => !series.cancelledAt),
    [activeMeetingSeries]
  )
  const meetings = useMemo(() => {
    const meetingSeriesMeetings = activeSeries
      .map(({mostRecentMeeting}) => mostRecentMeeting)
      .filter((meeting): meeting is NonNullable<typeof meeting> => !!meeting)
    const otherActiveMeetings = activeMeetings.filter(
      (meeting) => !meeting.meetingSeries || meeting.meetingSeries.cancelledAt
    )
    return [...meetingSeriesMeetings, ...otherActiveMeetings]
  }, [activeMeetings, activeSeries])

  const scheduledSeries = useMemo(
    () => activeSeries.filter((s) => !s.mostRecentMeeting),
    [activeSeries]
  )

  const transitioningMeetings = useTransition(
    meetings.map((meeting, displayIdx) => ({
      ...meeting,
      key: meeting.id,
      displayIdx
    }))
  )
  const transitioningSeries = useTransition(
    scheduledSeries.map((series, displayIdx) => ({
      ...series,
      key: `series-${series.id}`,
      displayIdx
    }))
  )

  return (
    <div className='flex h-full w-full flex-1 flex-col overflow-auto px-5'>
      <div className='flex flex-col'>
        <h3 className='mb-0 font-semibold text-base'>Open Meetings</h3>
        {transitioningMeetings.length === 0 && transitioningSeries.length === 0 && (
          <p className='my-2'>No meetings yet? You've come to the right place!</p>
        )}
      </div>
      <div className='flex w-full flex-wrap'>
        {transitioningSeries.map((series) => {
          const {child} = series
          const {id, displayIdx} = child
          return (
            <ScheduledSeriesCard
              key={`series-${id}`}
              displayIdx={displayIdx}
              series={series.child}
              onTransitionEnd={series.onTransitionEnd}
              status={series.status}
            />
          )
        })}
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
        ) : transitioningSeries.length === 0 ? (
          <>
            <DemoMeetingCard />
            <TutorialMeetingCard type='retro' />
            <TutorialMeetingCard type='standup' />
            <TutorialMeetingCard type='poker' />
          </>
        ) : null}
      </div>
    </div>
  )
}
export default TeamDashActivityTab
