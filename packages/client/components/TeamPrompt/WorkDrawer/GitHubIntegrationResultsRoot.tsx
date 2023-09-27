import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import gitHubIntegrationResultsQuery, {
  GitHubIntegrationResultsQuery
} from '../../../__generated__/GitHubIntegrationResultsQuery.graphql'
import ErrorBoundary from '../../ErrorBoundary'
import GitHubIntegrationResults from './GitHubIntegrationResults'
import {renderLoader} from '~/utils/relay/renderLoader'

interface Props {
  teamId: string
  queryType: 'issue' | 'pullRequest'
  selectedRepos: string[]
}

const GITHUB_QUERY_MAPPING = {
  issue: 'is:issue sort:updated assignee:@me',
  pullRequest: 'is:pr sort:updated author:@me'
}

const GitHubIntegrationResultsRoot = (props: Props) => {
  const {teamId, queryType, selectedRepos} = props
  const repoQueryString = selectedRepos.map((repo) => `repo:${repo}`).join(' ')
  const queryRef = useQueryLoaderNow<GitHubIntegrationResultsQuery>(gitHubIntegrationResultsQuery, {
    teamId: teamId,
    searchQuery: `${GITHUB_QUERY_MAPPING[queryType]} ${repoQueryString}`
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={renderLoader()}>
        {queryRef && <GitHubIntegrationResults queryRef={queryRef} queryType={queryType} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default GitHubIntegrationResultsRoot
