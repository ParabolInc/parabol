import IntegrationRepoId from 'parabol-client/shared/gqlIds/IntegrationRepoId'
import type {LinearRemoteProjectResolvers} from '../resolverTypes'

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
