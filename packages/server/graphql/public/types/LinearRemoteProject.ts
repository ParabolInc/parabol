import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {LinearProject} from '../../../integrations/platform/RemoteRepoIntegration'
import type {LinearRemoteProjectResolvers} from '../resolverTypes'

export type LinearRemoteProjectSource = LinearProject

const LinearRemoteProject: LinearRemoteProjectResolvers = {
  id: (project) => IntegrationRepoId.join(project),
  service: () => 'linear',
  name: ({name, teams}) => {
    const teamName = teams?.nodes?.[0]?.displayName
    return teamName ? `${teamName}/${name}` : name
  },
  integrationRepoId: (project) => IntegrationRepoId.join(project)
}

export default LinearRemoteProject
