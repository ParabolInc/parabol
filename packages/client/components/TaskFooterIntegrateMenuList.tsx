import graphql from 'babel-plugin-relay/macro'
import {Suspense, useCallback, useEffect, useMemo, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import mergeRepoIntegrationItems from '~/utils/mergeRepoIntegrationItems'
import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import type {TaskFooterIntegrateMenuListLocalQuery} from '../__generated__/TaskFooterIntegrateMenuListLocalQuery.graphql'
import type {MenuProps} from '../hooks/useMenu'
import {isRegisteredClientIntegration} from '../integrations/platform/registry'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItemHR from './MenuItemHR'
import {SearchMenuItem} from './SearchMenuItem'
import TaskFooterIntegrateMenuServiceRepos, {
  type RepoIntegrationItem as Item,
  type RepoIntegrationService
} from './TaskFooterIntegrateMenuServiceRepos'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  menuProps: MenuProps
  placeholder: string
  teamId: string
  label?: string
  onPushToIntegration: (
    integrationRepoId: string,
    integrationProviderService: Exclude<TaskServiceEnum, 'PARABOL'>,
    integrationLabel?: string
  ) => void
}

type ReposByService = Partial<Record<RepoIntegrationService, readonly Item[] | null>>

const getValue = (item: Item) => item.name

const TaskFooterIntegrateMenuList = (props: Props) => {
  const {menuProps, onPushToIntegration, placeholder, teamId, label} = props

  graphql`
    fragment TaskFooterIntegrateMenuListItem on RepoIntegration {
      id
      integrationRepoId
      service
      name
    }
  `

  const [networkOnly, setNetworkOnly] = useState(false)
  const [keepParentFocus, setKeepParentFocus] = useState(true)
  const [reposByService, setReposByService] = useState<ReposByService>({})
  const {viewer} = useLazyLoadQuery<TaskFooterIntegrateMenuListLocalQuery>(
    graphql`
      query TaskFooterIntegrateMenuListLocalQuery($teamId: ID!, $networkOnly: Boolean!) {
        viewer {
          teamMember(teamId: $teamId) {
            prevUsedRepoIntegrations(first: 50) {
              items {
                ...TaskFooterIntegrateMenuListItem @relay(mask: false)
              }
            }
            services {
              service
              isConnected
              ...TaskFooterIntegrateMenuServiceRepos_service @defer
            }
          }
        }
      }
    `,
    {teamId, networkOnly}
  )
  const services = viewer?.teamMember?.services ?? []
  const prevUsedItems = viewer?.teamMember?.prevUsedRepoIntegrations.items ?? []
  const items = useMemo(() => {
    const connectedServices = new Set(
      services.filter(({isConnected}) => isConnected).map(({service}) => service)
    )
    return mergeRepoIntegrationItems(
      prevUsedItems.filter(({service}) => connectedServices.has(service)),
      services.map(({service}) => reposByService[service] ?? [])
    )
  }, [prevUsedItems, services, reposByService])
  const isEveryServiceResolved = services.every(({service}) => service in reposByService)
  const onRepos = useCallback((service: RepoIntegrationService, repos: readonly Item[] | null) => {
    setReposByService((prev) => ({...prev, [service]: repos}))
  }, [])
  // TODO: make this filter work for Linear type-ahead search
  const {
    query,
    filteredItems: filteredIntegrations,
    onQueryChange
  } = useSearchFilter(items, getValue)

  useEffect(() => {
    // a search miss against the cache may be stale, so refetch every service from the network once
    if (!networkOnly && isEveryServiceResolved && filteredIntegrations.length === 0) {
      setNetworkOnly(true)
      setKeepParentFocus(false)
      setReposByService({})
    }
  }, [isEveryServiceResolved, filteredIntegrations.length])

  return (
    <>
      {services.map((service) => (
        <Suspense key={service.service} fallback={null}>
          <TaskFooterIntegrateMenuServiceRepos serviceRef={service} onRepos={onRepos} />
        </Suspense>
      ))}
      <Menu
        keepParentFocus={keepParentFocus}
        ariaLabel={'Export the task'}
        {...menuProps}
        resetActiveOnChanges={[filteredIntegrations]}
      >
        {label && (
          <>
            <div className='p-2 pt-2 pb-0 text-fg-secondary text-sm'>{label}</div>
            <MenuItemHR />
          </>
        )}
        <SearchMenuItem placeholder={placeholder} onChange={onQueryChange} value={query} />
        {(query && filteredIntegrations.length === 0 && (
          <EmptyDropdownMenuItemLabel key='no-results'>
            No integrations found!
          </EmptyDropdownMenuItemLabel>
        )) ||
          null}
        {filteredIntegrations.slice(0, 10).map((repoIntegration) => {
          const {integrationRepoId, service, name} = repoIntegration
          if (!isRegisteredClientIntegration(service)) return null
          return (
            <TaskIntegrationMenuItem
              key={`${service}:${integrationRepoId}`}
              query={query}
              label={name}
              onClick={() => onPushToIntegration(integrationRepoId, service, name)}
              service={service}
            />
          )
        })}
      </Menu>
    </>
  )
}

export default TaskFooterIntegrateMenuList
