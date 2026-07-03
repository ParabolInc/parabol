import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import gcalIntegrationResultsQuery, {
  type GCalIntegrationResultsQuery
} from '../../../__generated__/GCalIntegrationResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import GCalIntegrationResults from './GCalIntegrationResults'

interface Props {
  teamId: string
  startDate: string
  endDate: string
  order: 'DESC' | 'ASC'
  searchQuery: string
  onResultCount: (searchQuery: string, count: number) => void
}

const GCalIntegrationResultsRoot = (props: Props) => {
  const {teamId, startDate, endDate, order, searchQuery, onResultCount} = props
  const queryRef = useQueryLoaderNow<GCalIntegrationResultsQuery>(gcalIntegrationResultsQuery, {
    teamId,
    startDate,
    endDate
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && (
          <GCalIntegrationResults
            queryRef={queryRef}
            order={order}
            teamId={teamId}
            searchQuery={searchQuery}
            onResultCount={onResultCount}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  )
}

export default GCalIntegrationResultsRoot
