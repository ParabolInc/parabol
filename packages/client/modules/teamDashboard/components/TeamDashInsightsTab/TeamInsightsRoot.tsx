import {Suspense} from 'react'
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
    <div className='flex flex-col items-center px-4 py-0'>
      <Suspense fallback={''}>{queryRef && <TeamInsights queryRef={queryRef} />}</Suspense>
    </div>
  )
}

export default TeamInsightsRoot
