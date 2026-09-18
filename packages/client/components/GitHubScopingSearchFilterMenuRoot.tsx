import graphql from 'babel-plugin-relay/macro'
import {useLazyLoadQuery} from 'react-relay'
import type {GitHubScopingSearchFilterMenuRootQuery} from '../__generated__/GitHubScopingSearchFilterMenuRootQuery.graphql'
import type {FilterMenuProps} from '../integrations/platform/ScopingSearchState'
import GitHubScopingSearchFilterMenu from './GitHubScopingSearchFilterMenu'

const query = graphql`
  query GitHubScopingSearchFilterMenuRootQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        ...GitHubRepoSearchFilterMenu_teamMember
      }
    }
  }
`

const GitHubScopingSearchFilterMenuRoot = (props: FilterMenuProps) => {
  const {teamId, meetingId, state} = props
  const data = useLazyLoadQuery<GitHubScopingSearchFilterMenuRootQuery>(
    query,
    {teamId},
    {fetchPolicy: 'store-or-network'}
  )
  const teamMember = data.viewer.teamMember
  if (!teamMember) return null
  return (
    <GitHubScopingSearchFilterMenu meetingId={meetingId} state={state} teamMemberRef={teamMember} />
  )
}

export default GitHubScopingSearchFilterMenuRoot
