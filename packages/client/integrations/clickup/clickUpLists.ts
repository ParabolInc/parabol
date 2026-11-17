import graphql from 'babel-plugin-relay/macro'
import plural from '../../utils/plural'
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

const didClickUpListsFailToLoad = (services: readonly ServiceWithLists[] | null | undefined) =>
  findIntegrationService(services ?? [], 'clickup')?.repos === null

export const getUnavailableClickUpListLabel = (
  services: readonly ServiceWithLists[] | null | undefined
) => (didClickUpListsFailToLoad(services) ? 'List could not be loaded' : 'List no longer available')

export const getUnavailableClickUpListsSummary = (
  services: readonly ServiceWithLists[] | null | undefined,
  count: number
) =>
  didClickUpListsFailToLoad(services)
    ? `${count} ${plural(count, 'list')} could not be loaded`
    : `${count} unavailable ${plural(count, 'list')}`

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
