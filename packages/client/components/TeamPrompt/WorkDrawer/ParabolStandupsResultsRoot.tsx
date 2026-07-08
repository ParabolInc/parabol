import dayjs from 'dayjs'
import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import parabolStandupsResultsQuery, {
  type ParabolStandupsResultsQuery
} from '../../../__generated__/ParabolStandupsResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import ParabolStandupsResults from './ParabolStandupsResults'
import type {WorkDrawerDateRange} from './WorkDrawerDateFilter'

interface Props {
  teamId: string
  dateRange: WorkDrawerDateRange | undefined
}

const ParabolStandupsResultsRoot = (props: Props) => {
  const {teamId, dateRange} = props
  const queryRef = useQueryLoaderNow<ParabolStandupsResultsQuery>(parabolStandupsResultsQuery, {
    teamId,
    after: dateRange?.startAt ?? null,
    before: dateRange?.endAt ?? dayjs().endOf('day').toISOString()
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && <ParabolStandupsResults queryRef={queryRef} teamId={teamId} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default ParabolStandupsResultsRoot
