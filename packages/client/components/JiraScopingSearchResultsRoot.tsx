import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {QueryRenderer} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import MockScopingList from '../modules/meeting/components/MockScopingList'
import renderQuery from '../utils/relay/renderQuery'
import {ScopePhaseAreaJiraScoping_meeting} from '../__generated__/ScopePhaseAreaJiraScoping_meeting.graphql'
import JiraScopingSearchResults from './JiraScopingSearchResults'

const query = graphql`
  query JiraScopingSearchResultsRootQuery($teamId: ID!, $queryString: String, $isJQL: Boolean!, $projectKeyFilters: [ID!], $first: Int) {
    viewer {
      ...JiraScopingSearchResults_viewer
    }
  }
`

interface Props {
  queryString: string | null | undefined,
  isJQL: boolean,
  projectKeyFilters?: string[]
  teamId: string
  meeting: ScopePhaseAreaJiraScoping_meeting
}

const JiraScopingSearchResultsRoot = (props: Props) => {
  const atmosphere = useAtmosphere()
  const {queryString, isJQL, projectKeyFilters, teamId, meeting} = props
  return (
    <QueryRenderer
      environment={atmosphere}
      query={query}
      variables={{teamId, queryString, isJQL, projectKeyFilters, first: 100}}
      fetchPolicy={'store-or-network' as any}
      render={renderQuery(JiraScopingSearchResults, {Loader: <MockScopingList />, props: {meeting}})}
    />
  )
}

export default JiraScopingSearchResultsRoot
