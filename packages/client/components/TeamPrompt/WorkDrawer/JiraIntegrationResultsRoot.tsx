import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import jiraIntegrationResultsQuery, {
  JiraIntegrationResultsQuery
} from '../../../__generated__/JiraIntegrationResultsQuery.graphql'
import ErrorBoundary from '../../ErrorBoundary'
import JiraIntegrationResults from './JiraIntegrationResults'
import {Loader} from '~/utils/relay/renderLoader'

interface Props {
  teamId: string
}

const JiraIntegrationResultsRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<JiraIntegrationResultsQuery>(jiraIntegrationResultsQuery, {
    teamId: teamId
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && <JiraIntegrationResults queryRef={queryRef} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default JiraIntegrationResultsRoot
