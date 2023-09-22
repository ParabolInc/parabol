import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {MeetingEngagementCard_insights$key} from '~/__generated__/MeetingEngagementCard_insights.graphql'
import TeamInsightsCard from './TeamInsightsCard'

// TODO: We need to tune this once we have some data on real teams
const HIGH_ENGAGEMENT_THRESHOLD = 0.8
const LOW_ENGAGEMENT_THRESHOLD = 0.6

const getDescription = (engagement: number) => {
  if (engagement > HIGH_ENGAGEMENT_THRESHOLD) {
    return 'Great job! Your meetings have a higher engagement rate than the average team using Parabol. Keep it up!'
  }
  if (engagement <= LOW_ENGAGEMENT_THRESHOLD) {
    return 'Your engagement rate is lower than other Parabol teams. Try starting with an icebreaker to get everyone talking or discuss why people don’t feel like contributing to your meeting.'
  }
  return 'You have an average meeting engagement rate, but there’s always room for improvement! Try mixing things up with a new template.'
}

interface Props {
  teamInsightsRef: MeetingEngagementCard_insights$key
}

const MeetingEngagementCard = (props: Props) => {
  const {teamInsightsRef} = props
  const insights = useFragment(
    graphql`
      fragment MeetingEngagementCard_insights on TeamInsights {
        ...TeamInsightsCard_insights
        meetingEngagement {
          all
        }
      }
    `,
    teamInsightsRef
  )

  const {meetingEngagement} = insights
  const all = meetingEngagement?.all
  if (all === undefined) {
    return null
  }

  const percent = `${Math.round(all * 100)}%`
  const description = getDescription(all)

  return (
    <TeamInsightsCard
      teamInsightsRef={insights}
      title='Meeting Engagement'
      tooltip='Reflections, groups, comments and emoji reactions created in your last meetings, relative to the number of participants'
    >
      <div className='flex justify-center pb-6 text-5xl text-grape-500'>{percent}</div>
      <div className='text-sm'>{description}</div>
    </TeamInsightsCard>
  )
}

export default MeetingEngagementCard
