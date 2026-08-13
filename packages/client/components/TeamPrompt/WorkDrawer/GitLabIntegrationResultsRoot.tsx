import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import gitLabIntegrationResultsQuery, {
  type GitLabIntegrationResultsQuery
} from '../../../__generated__/GitLabIntegrationResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import GitLabIntegrationResults from './GitLabIntegrationResults'

interface Props {
  teamId: string
}

const GitLabIntegrationResultsRoot = (props: Props) => {
  const {teamId} = props
  const queryRef = useQueryLoaderNow<GitLabIntegrationResultsQuery>(gitLabIntegrationResultsQuery, {
    teamId
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && <GitLabIntegrationResults queryRef={queryRef} teamId={teamId} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default GitLabIntegrationResultsRoot
