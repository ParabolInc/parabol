import graphql from 'babel-plugin-relay/macro'
import findIntegrationService from '../platform/findIntegrationService'

graphql`
  fragment clickUpLists_service on ClickUpIntegrationService {
    repos {
      id
      name
      integrationRepoId
    }
  }
`

export interface ClickUpList {
  id: string
  name: string
  integrationRepoId: string
}

interface ServiceWithLists {
  service: string
  repos?: readonly ClickUpList[] | null
}

const NO_LISTS: readonly ClickUpList[] = []

export const getClickUpLists = (services: readonly ServiceWithLists[] | null | undefined) =>
  findIntegrationService(services ?? [], 'clickup')?.repos ?? NO_LISTS
