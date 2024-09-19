import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {TeamInsightsQuery} from '../../../../__generated__/TeamInsightsQuery.graphql'

interface Props {
  queryRef: PreloadedQuery<TeamInsightsQuery>
}

const query = graphql`
  query TeamInsightsQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        id
        name
      }
    }
  }
`

const Insights = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<TeamInsightsQuery>(query, queryRef)
  const {viewer} = data

  return (
    <div>
      <h2>Insights for {viewer.team?.name}</h2>
      {/* Add your insights UI components here */}
    </div>
  )
}

export default Insights
