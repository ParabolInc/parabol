import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import jiraIntegrationResultsQuery, {
  JiraServerIntegrationResultsQuery
} from '../../../__generated__/JiraServerIntegrationResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import JiraServerIntegrationResults from './JiraServerIntegrationResults'

interface Props {
  teamId: string
}

const JiraServerIntegrationResultsRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<JiraServerIntegrationResultsQuery>(
    jiraIntegrationResultsQuery,
    {
      teamId: teamId
    }
  )
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && <JiraServerIntegrationResults queryRef={queryRef} teamId={teamId} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default JiraServerIntegrationResultsRoot
