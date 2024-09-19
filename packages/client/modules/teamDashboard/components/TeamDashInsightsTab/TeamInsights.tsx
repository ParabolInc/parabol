import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
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
  // TODO: use the query rather than just console logging it
  console.log('🚀 ~ data:', data)

  return (
    <div className='space-y-6'>
      <p className='text-sm text-slate-700'>
        Only you (as <span className='font-bold'>Team Lead</span>) can see Team Insights. Insights
        are auto-generated.{' '}
        <a href='#' className='font-semibold text-sky-500 hover:underline'>
          Give us feedback
        </a>
        .
      </p>
      <div className='mx-auto aspect-[1/1.414] max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-md'>
        <h2 className='mb-4 flex items-center text-2xl font-semibold'>
          <AutoAwesomeIcon className='mr-2 text-grape-500' />
          <span>Insights - Aug to Sep 2024</span>
        </h2>
      </div>
    </div>
  )
}

export default Insights
