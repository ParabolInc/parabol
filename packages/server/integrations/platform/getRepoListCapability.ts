import type {RemoteRepoIntegration} from './RemoteRepoIntegration'
import {getServerIntegration} from './registry'
import type {RepoListCapability} from './ServerIntegrationDefinition'

/** The definition that produced a cached repo, widened so one call site serves every service */
const getRepoListCapability = (repo: RemoteRepoIntegration): RepoListCapability =>
  getServerIntegration(repo.service).capabilities.repoList

export default getRepoListCapability
