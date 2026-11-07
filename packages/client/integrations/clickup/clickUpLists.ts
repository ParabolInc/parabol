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

export const getUnavailableClickUpListLabel = (
  services: readonly ServiceWithLists[] | null | undefined
) =>
  findIntegrationService(services ?? [], 'clickup')?.repos === null
    ? 'List could not be loaded'
    : 'List no longer available'

export const getUnavailableClickUpListIds = (
  lists: readonly ClickUpList[],
  selectedListIds: readonly string[]
) =>
  selectedListIds.filter(
    (listId) => !lists.some(({integrationRepoId}) => integrationRepoId === listId)
  )

export const getVisibleClickUpLists = (
  lists: readonly ClickUpList[],
  matchingLists: readonly ClickUpList[],
  selectedListIds: readonly string[],
  maxLists: number
) => {
  const selectedLists = lists.filter(({integrationRepoId}) =>
    selectedListIds.includes(integrationRepoId)
  )
  return Array.from(new Set([...selectedLists, ...matchingLists])).slice(
    0,
    Math.max(maxLists, selectedListIds.length + 1)
  )
}
