import ms from 'ms'
import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import gcalIntegrationResultsQuery, {
  GCalIntegrationResultsQuery
} from '../../../__generated__/GCalIntegrationResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import GCalIntegrationResults from './GCalIntegrationResults'

interface Props {
  teamId: string
  eventRangeKey: 'past7d' | 'today' | 'upcoming'
}

const TODAY_MIDNIGHT = new Date().setHours(0, 0, 0, 0)

const GCAL_QUERY_MAPPING = {
  past7d: {
    startDate: new Date(TODAY_MIDNIGHT - ms('7d')).toJSON(),
    endDate: new Date(TODAY_MIDNIGHT).toJSON(),
    order: 'DESC'
  },
  today: {
    startDate: new Date(TODAY_MIDNIGHT).toJSON(),
    endDate: new Date(TODAY_MIDNIGHT + ms('1d')).toJSON(),
    order: 'ASC'
  },
  upcoming: {
    startDate: new Date(TODAY_MIDNIGHT + ms('1d')).toJSON(),
    endDate: new Date(TODAY_MIDNIGHT + ms('6d')).toJSON(),
    order: 'ASC'
  }
} as const

const GCalIntegrationResultsRoot = (props: Props) => {
  const {teamId, eventRangeKey} = props
  const eventRange = GCAL_QUERY_MAPPING[eventRangeKey]
  const queryRef = useQueryLoaderNow<GCalIntegrationResultsQuery>(gcalIntegrationResultsQuery, {
    teamId: teamId,
    startDate: eventRange.startDate,
    endDate: eventRange.endDate
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && (
          <GCalIntegrationResults queryRef={queryRef} order={eventRange.order} teamId={teamId} />
        )}
      </Suspense>
    </ErrorBoundary>
  )
}

export default GCalIntegrationResultsRoot
