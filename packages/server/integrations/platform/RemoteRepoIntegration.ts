import type {ServerIntegrations} from './registry'
import type {RepoListCapability} from './ServerIntegrationDefinition'

type ListedRepo<TDefinition> = TDefinition extends {
  capabilities: {repoList: RepoListCapability<infer TRepo>}
}
  ? TRepo
  : never

export type RemoteRepoIntegration = ListedRepo<ServerIntegrations[keyof ServerIntegrations]>
