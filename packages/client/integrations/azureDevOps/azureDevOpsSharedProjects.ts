import graphql from 'babel-plugin-relay/macro'
import type {IntegrationRepoAccessEnum} from '../../__generated__/azureDevOpsSharedProjects_service.graphql'
import findIntegrationService from '../platform/findIntegrationService'

graphql`
  fragment azureDevOpsSharedProjects_service on AzureDevOpsIntegrationService {
    repoAccess
    repos {
      id
      name
      organization
      integrationRepoId
    }
  }
`

export interface AzureDevOpsSharedProject {
  id: string
  name: string
  organization: string
  integrationRepoId: string
}

interface ServiceWithSharedProjects {
  service: string
  repoAccess?: IntegrationRepoAccessEnum
  repos?: readonly AzureDevOpsSharedProject[] | null
}

/** The projects the viewer's Azure DevOps connection shares with the team, read off TeamMember.services */
export const getAzureDevOpsSharedProjects = (
  services: readonly ServiceWithSharedProjects[] | null | undefined
) => {
  const service = findIntegrationService(services ?? [], 'azureDevOps')
  return {
    sharesEveryProject: service?.repoAccess === 'all',
    /** False while the list is unknown: the service is missing or its live fetch failed */
    isListed: !!service?.repos,
    projects: service?.repos ?? []
  }
}
