import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import getVendorRepo from '../../../integrations/platform/getVendorRepo'
import type {RepoContainerResolvers} from '../resolverTypes'

const RepoContainer: RepoContainerResolvers = {
  id: (repo) => `${repo.service}:${IntegrationRepoId.join(repo)}`,
  integrationRepoId: (repo) => IntegrationRepoId.join(repo),
  name: (repo) => getVendorRepo(repo).name(repo),
  repo: (repo) => repo
}

export default RepoContainer
