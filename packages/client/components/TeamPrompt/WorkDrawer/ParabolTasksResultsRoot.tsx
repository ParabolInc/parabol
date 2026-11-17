import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import parabolTasksResultsQuery, {
  type ParabolTasksResultsQuery,
  type TaskStatusEnum
} from '../../../__generated__/ParabolTasksResultsQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import ParabolTasksResults from './ParabolTasksResults'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface Props {
  selectedStatuses: TaskStatusEnum[]
  dateRange: WorkDrawerDateRange | undefined
  searchQuery: string
  onResultCount: (searchQuery: string, count: number) => void
}

const ParabolTasksResultsRoot = (props: Props) => {
  const {selectedStatuses, dateRange, searchQuery, onResultCount} = props
  const atmosphere = useAtmosphere()
  const queryRef = useQueryLoaderNow<ParabolTasksResultsQuery>(parabolTasksResultsQuery, {
    userId: atmosphere.viewerId
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && (
          <ParabolTasksResults
            queryRef={queryRef}
            selectedStatuses={selectedStatuses}
            dateRange={dateRange}
            searchQuery={searchQuery}
            onResultCount={onResultCount}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  )
}

export default ParabolTasksResultsRoot
