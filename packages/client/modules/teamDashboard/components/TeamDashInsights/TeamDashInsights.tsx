import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {TeamDashInsights_insights$key} from '~/__generated__/TeamDashInsights_insights.graphql'

interface Props {
  teamInsightsRef: TeamDashInsights_insights$key
}

const TeamDashInsights = (props: Props) => {
  const {teamInsightsRef} = props
  // TODO: implement
  useFragment(
    graphql`
      fragment TeamDashInsights_insights on TeamInsights {
        id
        mostUsedEmojis
      }
    `,
    teamInsightsRef
  )

  return (
    <div>
      <h3 className='mb-0 text-base font-semibold'>Team Insights</h3>
      <div className='flex w-full flex-wrap'></div>
    </div>
  )
}
export default TeamDashInsights
