import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {GITHUB} from 'universal/utils/constants'
import incrementIntegrationCount from 'universal/utils/relay/incrementIntegrationCount'
import {IRemoveGitHubRepoOnMutationArguments} from '../types/graphql'
import {CompletedHandler, ErrorHandler} from '../types/relayMutations'
import safeRemoveNodeFromArray from 'universal/utils/relay/safeRemoveNodeFromArray'

const mutation = graphql`
  mutation RemoveGitHubRepoMutation($githubIntegrationId: ID!) {
    removeGitHubRepo(githubIntegrationId: $githubIntegrationId) {
      error {
        message
      }
      deletedId
    }
  }
`

export const removeGitHubRepoUpdater = (viewer, teamId, deletedId) => {
  const globalId = window.btoa(`GitHubIntegration:${deletedId}`)
  safeRemoveNodeFromArray(globalId, viewer, 'githubRepos', {storageKeyArgs: {teamId}})
  // update the providerMap
  incrementIntegrationCount(viewer, teamId, GITHUB, -1)
}

const RemoveGitHubRepoMutation = (
  atmosphere,
  variables: IRemoveGitHubRepoOnMutationArguments,
  context,
  onError: ErrorHandler,
  onCompleted: CompletedHandler
): Disposable => {
  const {viewerId} = atmosphere
  const {githubIntegrationId} = variables
  const {teamId} = context
  return commitMutation(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const viewer = store.get(viewerId)
      const payload = store.getRootField('removeGitHubRepo')
      if (!payload) return
      const deletedId = payload.getValue('deletedId')
      removeGitHubRepoUpdater(viewer, teamId, deletedId)
    },
    optimisticUpdater: (store) => {
      const viewer = store.get(viewerId)
      removeGitHubRepoUpdater(viewer, teamId, githubIntegrationId)
    },
    onError,
    onCompleted
  })
}

export default RemoveGitHubRepoMutation
