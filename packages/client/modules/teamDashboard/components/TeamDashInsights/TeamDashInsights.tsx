import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TeamDashInsights_insights$key} from '~/__generated__/TeamDashInsights_insights.graphql'
import MostUsedEmojisCard from './MostUsedEmojisCard'
import MeetingEngagementCard from './MeetingEngagementCard'

interface Props {
  teamInsightsRef: TeamDashInsights_insights$key
}

const TeamDashInsights = (props: Props) => {
  const {teamInsightsRef} = props
  const insights = useFragment(
    graphql`
      fragment TeamDashInsights_insights on TeamInsights {
        id
        ...MostUsedEmojisCard_insights
        ...MeetingEngagementCard_insights
      }
    `,
    teamInsightsRef
  )

  return (
    <div>
      <h3 className='mb-0 pl-2 text-base font-semibold'>Team Insights</h3>
      <div className='flex w-full flex-wrap'>
        <MostUsedEmojisCard teamInsightsRef={insights} />
        <MeetingEngagementCard teamInsightsRef={insights} />
      </div>
    </div>
  )
}
export default TeamDashInsights
