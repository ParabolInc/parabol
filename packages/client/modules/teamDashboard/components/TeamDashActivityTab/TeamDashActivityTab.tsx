import graphql from 'babel-plugin-relay/macro'
import {AnimatePresence} from 'motion/react'
import {useMemo} from 'react'
import {useFragment} from 'react-relay'
import type {TeamDashActivityTab_team$key} from '~/__generated__/TeamDashActivityTab_team.graphql'
import DemoMeetingCard from '../../../../components/DemoMeetingCard'
import MeetingCard from '../../../../components/MeetingCard'
import ScheduledSeriesCard from '../../../../components/ScheduledSeriesCard'
import TutorialMeetingCard from '../../../../components/TutorialMeetingCard'

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

  return (
    <div className='flex h-full w-full flex-1 flex-col overflow-auto px-5'>
      <div className='flex flex-col'>
        <h3 className='mb-0 font-semibold text-base'>Open Meetings</h3>
        {meetings.length === 0 && scheduledSeries.length === 0 && (
          <p className='my-2'>No meetings yet? You've come to the right place!</p>
        )}
      </div>
      <div className='flex w-full flex-wrap'>
        <AnimatePresence initial={false}>
          {scheduledSeries.map((series) => (
            <ScheduledSeriesCard key={`series-${series.id}`} series={series} />
          ))}
          {meetings.length > 0 ? (
            meetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} />)
          ) : scheduledSeries.length === 0 ? (
            <>
              <DemoMeetingCard />
              <TutorialMeetingCard type='retro' />
              <TutorialMeetingCard type='standup' />
              <TutorialMeetingCard type='poker' />
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}
export default TeamDashActivityTab
