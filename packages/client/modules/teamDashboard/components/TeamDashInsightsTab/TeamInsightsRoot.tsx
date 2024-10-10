import React, {Suspense} from 'react'
import teamInsightsQuery, {
  TeamInsightsQuery
} from '../../../../__generated__/TeamInsightsQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import TeamInsights from './TeamInsights'

interface Props {
  teamId: string
}

const TeamInsightsRoot = ({teamId}: Props) => {
  const queryRef = useQueryLoaderNow<TeamInsightsQuery>(teamInsightsQuery, {
    teamId
  })
  return (
    <div className='flex flex-col items-center py-0 px-4'>
      <Suspense fallback={''}>{queryRef && <TeamInsights queryRef={queryRef} />}</Suspense>
    </div>
  )
}

export default TeamInsightsRoot
