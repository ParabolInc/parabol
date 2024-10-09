import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {TeamInsightsQuery} from '../../../../__generated__/TeamInsightsQuery.graphql'
import TeamInsightContent from './TeamInsightContent'
import TeamInsightEmptyState from './TeamInsightEmptyState'

interface Props {
  queryRef: PreloadedQuery<TeamInsightsQuery>
}

const query = graphql`
  query TeamInsightsQuery($teamId: ID!) {
    viewer {
      team(teamId: $teamId) {
        ...TeamInsights_team @relay(mask: false)
        name
        insight {
          wins
          ...TeamInsightContent_team
        }
      }
    }
  }
`

graphql`
  fragment TeamInsights_team on Team {
    id
    retroMeetingsCount
  }
`

const TeamInsights = (props: Props) => {
  const {queryRef} = props
  const data = usePreloadedQuery<TeamInsightsQuery>(query, queryRef)
  const {viewer} = data
  const {team} = viewer
  const {id: teamId, insight, name, retroMeetingsCount} = team ?? {}

  return (
    <div className='mb-8 space-y-6'>
      <p className='mb-6 mt-[20px] text-sm text-slate-900'>
        Only you (as <span className='font-bold'>Team Lead</span>) can see Team Insights. Insights
        are auto-generated.{' '}
        <a
          href='#'
          className='font-semibold text-sky-500 hover:underline'
          target='_blank'
          rel='noopener noreferrer'
        >
          Give us feedback
        </a>
      </p>
      {insight ? (
        <TeamInsightContent insightRef={insight} teamName={name} />
      ) : (
        <TeamInsightEmptyState teamId={teamId} meetingsCount={retroMeetingsCount} />
      )}
    </div>
  )
}

export default TeamInsights
