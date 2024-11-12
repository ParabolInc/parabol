import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import jiraIntegrationResultsQuery, {
  JiraIntegrationResultsQuery
} from '../../../__generated__/JiraIntegrationResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import JiraIntegrationResults from './JiraIntegrationResults'

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
        {queryRef && <JiraIntegrationResults queryRef={queryRef} teamId={teamId} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default JiraIntegrationResultsRoot
