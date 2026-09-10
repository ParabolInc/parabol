import getRepoListCapability from '../../../integrations/platform/getRepoListCapability'
import type {RepoContainerResolvers} from '../resolverTypes'

const RepoContainer: RepoContainerResolvers = {
  id: (repo) => `${repo.service}:${getRepoListCapability(repo).integrationRepoId(repo)}`,
  integrationRepoId: (repo) => getRepoListCapability(repo).integrationRepoId(repo),
  name: (repo) => getRepoListCapability(repo).name(repo)
}

export default RepoContainer
