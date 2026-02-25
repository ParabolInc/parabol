import type {PersistGitHubSearchQuerySuccessResolvers} from '../resolverTypes'

export type PersistGitHubSearchQuerySuccessSource = {
  teamId: string
  userId: string
}

const PersistGitHubSearchQuerySuccess: PersistGitHubSearchQuerySuccessResolvers = {
  githubIntegration: ({teamId, userId}, _args, {dataLoader}) => {
    return dataLoader.get('githubAuth').loadNonNull({teamId, userId})
  }
}

export default PersistGitHubSearchQuerySuccess
