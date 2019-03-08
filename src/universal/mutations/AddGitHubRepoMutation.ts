import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {GITHUB} from 'universal/utils/constants'
import getOptimisticTeamMember from 'universal/utils/relay/getOptimisticTeamMember'
import incrementIntegrationCount from 'universal/utils/relay/incrementIntegrationCount'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import addNodeToArray from 'universal/utils/relay/addNodeToArray'
import {IAddGitHubRepoOnMutationArguments} from 'universal/types/graphql'
import {CompletedHandler, ErrorHandler} from 'universal/types/relayMutations'

const mutation = graphql`
  mutation AddGitHubRepoMutation($nameWithOwner: String!, $teamId: ID!) {
    addGitHubRepo(nameWithOwner: $nameWithOwner, teamId: $teamId) {
      error {
        message
      }
      repo {
        id
        adminUserId
        nameWithOwner
        teamMembers {
          id
          preferredName
          picture
        }
      }
    }
  }
`

export const addGitHubRepoUpdater = (store, viewerId, teamId, newNode) => {
  // update the integration list
  const viewer = store.get(viewerId)
  addNodeToArray(newNode, viewer, 'githubRepos', 'nameWithOwner', {storageKeyArgs: {teamId}})
  incrementIntegrationCount(viewer, teamId, GITHUB, 1)
}

const AddGitHubRepoMutation = (
  atmosphere: any,
  variables: IAddGitHubRepoOnMutationArguments,
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  const {viewerId} = atmosphere
  const {nameWithOwner, teamId} = variables
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const payload = store.getRootField('addGitHubRepo')
      if (!payload) return
      const node = payload.getLinkedRecord('repo')
      addGitHubRepoUpdater(store, viewerId, teamId, node)
    },
    optimisticUpdater: (store) => {
      const teamMemberNode = getOptimisticTeamMember(store, viewerId, teamId)
      const repo = createProxyRecord(store, 'GitHubRepo', {
        adminUserId: viewerId,
        nameWithOwner
      })
      repo.setLinkedRecords([teamMemberNode], 'teamMembers')
      addGitHubRepoUpdater(store, viewerId, teamId, repo)
    },
    onCompleted,
    onError
  })
}

export default AddGitHubRepoMutation
