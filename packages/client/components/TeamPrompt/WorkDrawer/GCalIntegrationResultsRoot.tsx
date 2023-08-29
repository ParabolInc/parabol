import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import gcalIntegrationResultsQuery, {
  GCalIntegrationResultsQuery
} from '../../../__generated__/GCalIntegrationResultsQuery.graphql'
import ErrorBoundary from '../../ErrorBoundary'
import GCalIntegrationResults from './GCalIntegrationResults'
import {renderLoader} from '~/utils/relay/renderLoader'

interface Props {
  teamId: string
}

const GCalIntegrationResultsRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<GCalIntegrationResultsQuery>(gcalIntegrationResultsQuery, {
    teamId: teamId
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={renderLoader()}>
        {queryRef && <GCalIntegrationResults queryRef={queryRef} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default GCalIntegrationResultsRoot
