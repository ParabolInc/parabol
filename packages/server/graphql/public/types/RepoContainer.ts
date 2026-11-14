import getRepoListCapability from '../../../integrations/platform/getRepoListCapability'
import type {RemoteRepoIntegration} from '../../../integrations/platform/RemoteRepoIntegration'
import type {RepoContainerResolvers} from '../resolverTypes'
import type {TYPENAME_BY_SERVICE} from './RepoIntegration'

type TypenameByService = typeof TYPENAME_BY_SERVICE
type ContainerService = {
  [Service in keyof TypenameByService]: TypenameByService[Service] extends 'RepoContainer'
    ? Service
    : never
}[keyof TypenameByService]

export type RepoContainerSource = Extract<RemoteRepoIntegration, {service: ContainerService}>

const RepoContainer: RepoContainerResolvers = {
  id: (repo) => `${repo.service}:${getRepoListCapability(repo).integrationRepoId(repo)}`,
  integrationRepoId: (repo) => getRepoListCapability(repo).integrationRepoId(repo),
  name: (repo) => getRepoListCapability(repo).name(repo)
}

export default RepoContainer
