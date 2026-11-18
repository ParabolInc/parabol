import graphql from 'babel-plugin-relay/macro'
import {Fragment, Suspense, useCallback, useEffect, useMemo, useState} from 'react'
import {fetchQuery, useFragment} from 'react-relay'
import useAtmosphere from '~/hooks/useAtmosphere'
import useSearchFilter from '~/hooks/useSearchFilter'
import mergeRepoIntegrationItems from '~/utils/mergeRepoIntegrationItems'
import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import type {TaskFooterIntegrateMenuList_teamMember$key} from '../__generated__/TaskFooterIntegrateMenuList_teamMember.graphql'
import type {TaskFooterIntegrateMenuListRetryQuery} from '../__generated__/TaskFooterIntegrateMenuListRetryQuery.graphql'
import type {MenuMutationProps} from '../hooks/useMutationProps'
import {
  isTaskClientIntegration,
  listClientIntegrationServices,
  type RegisteredClientIntegration
} from '../integrations/platform/registry'
import type {BeginConnect, ConnectInMenuState} from '../integrations/platform/useConnectInMenu'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {MenuSeparator} from '../ui/Menu/MenuSeparator'
import MenuSkeletonRows from '../ui/Menu/MenuSkeletonRows'
import menuSectionTitleClass from '../ui/Menu/menuSectionTitleClass'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TaskFooterIntegrateMenuConnectFailed from './TaskFooterIntegrateMenuConnectFailed'
import TaskFooterIntegrateMenuNeedsReconnect from './TaskFooterIntegrateMenuNeedsReconnect'
import TaskFooterIntegrateMenuServiceRepos, {
  type RepoIntegrationItem as Item,
  type RepoIntegrationService
} from './TaskFooterIntegrateMenuServiceRepos'
import TaskFooterIntegrateMenuToolFailure from './TaskFooterIntegrateMenuToolFailure'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

const retryQuery = graphql`
  query TaskFooterIntegrateMenuListRetryQuery($teamId: ID!) {
    viewer {
      teamMember(teamId: $teamId) {
        services {
          ...TaskFooterIntegrateMenuServiceRepos_service
        }
      }
    }
  }
`

interface Props {
  failure?: Extract<ConnectInMenuState, {phase: 'failed'}>
  onConnect?: BeginConnect
  mutationProps: MenuMutationProps
  newlyConnectedService?: RegisteredClientIntegration
  placeholder: string
  teamMemberRef: TaskFooterIntegrateMenuList_teamMember$key
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
  const {
    failure,
    onConnect,
    mutationProps,
    newlyConnectedService,
    onPushToIntegration,
    placeholder,
    teamMemberRef,
    label
  } = props
  const atmosphere = useAtmosphere()
  const [refreshingServices, setRefreshingServices] = useState<ReadonlySet<string>>(
    () => new Set(newlyConnectedService ? [newlyConnectedService] : [])
  )

  graphql`
    fragment TaskFooterIntegrateMenuListItem on RepoIntegration {
      id
      integrationRepoId
      service
      name
    }
  `

  const [reposByService, setReposByService] = useState<ReposByService>({})
  const teamMember = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuList_teamMember on TeamMember {
        ...TaskFooterIntegrateMenuNeedsReconnect_teamMember
        teamId
        prevUsedRepoIntegrations(first: 50) {
          items {
            ...TaskFooterIntegrateMenuListItem @relay(mask: false)
          }
        }
        services {
          service
          title
          isConnected
          ...TaskFooterIntegrateMenuServiceRepos_service @defer
        }
      }
    `,
    teamMemberRef
  )
  const services = useMemo(
    () =>
      listClientIntegrationServices(teamMember.services)
        .map(({integrationService}) => integrationService)
        .filter(({service}) => isTaskClientIntegration(service)),
    [teamMember.services]
  )
  const prevUsedItems = teamMember.prevUsedRepoIntegrations.items ?? []
  const connectedServices = useMemo(
    () => services.filter(({isConnected}) => isConnected).map(({service}) => service),
    [services]
  )
  const recentItems = useMemo(
    () => prevUsedItems.filter(({service}) => connectedServices.includes(service)),
    [prevUsedItems, connectedServices]
  )
  const items = useMemo(
    () =>
      mergeRepoIntegrationItems(
        recentItems,
        services.map(({service}) => reposByService[service] ?? [])
      ),
    [recentItems, services, reposByService]
  )
  const failedServices = connectedServices.filter(
    (service) => !refreshingServices.has(service) && reposByService[service] === null
  )
  const loadingCount = connectedServices.filter(
    (service) => refreshingServices.has(service) || !(service in reposByService)
  ).length
  const refresh = useCallback(
    (refreshed: readonly string[]) => {
      setRefreshingServices(new Set(refreshed))
      const done = () => setRefreshingServices(new Set())
      fetchQuery<TaskFooterIntegrateMenuListRetryQuery>(
        atmosphere,
        retryQuery,
        {teamId: teamMember.teamId},
        {fetchPolicy: 'network-only'}
      ).subscribe({complete: done, error: done})
    },
    [atmosphere, teamMember.teamId]
  )
  useEffect(() => {
    if (newlyConnectedService) refresh([newlyConnectedService])
  }, [newlyConnectedService, refresh])
  const onRepos = useCallback((service: RepoIntegrationService, repos: readonly Item[] | null) => {
    setReposByService((prev) => ({...prev, [service]: repos}))
  }, [])
  // TODO: make this filter work for Linear type-ahead search
  const {
    query,
    filteredItems: filteredIntegrations,
    onQueryChange
  } = useSearchFilter(items, getValue)

  return (
    <>
      {services.map((service) => (
        <Suspense key={service.service} fallback={null}>
          <TaskFooterIntegrateMenuServiceRepos serviceRef={service} onRepos={onRepos} />
        </Suspense>
      ))}
      {failure && <TaskFooterIntegrateMenuConnectFailed failure={failure} />}
      {label && (
        <>
          <div className='p-2 pt-2 pb-0 text-fg-secondary text-sm'>{label}</div>
          <MenuSeparator />
        </>
      )}
      <MenuSearch placeholder={placeholder} onChange={onQueryChange} value={query} />
      {(query && filteredIntegrations.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No integrations found!
        </EmptyDropdownMenuItemLabel>
      )) ||
        null}
      {filteredIntegrations.slice(0, 10).map((repoIntegration, index, shown) => {
        const {integrationRepoId, service, name} = repoIntegration
        if (!isTaskClientIntegration(service)) return null
        const isRecent = !query && recentItems.includes(repoIntegration)
        const startsRecent = isRecent && index === 0
        const startsAll =
          !query &&
          recentItems.length > 0 &&
          !isRecent &&
          !!shown[index - 1] &&
          recentItems.includes(shown[index - 1]!)
        return (
          <Fragment key={`${service}:${integrationRepoId}`}>
            {startsRecent && <div className={menuSectionTitleClass}>Recent</div>}
            {startsAll && <div className={menuSectionTitleClass}>All</div>}
            <TaskIntegrationMenuItem
              query={query}
              label={name}
              onClick={() => onPushToIntegration(integrationRepoId, service, name)}
              service={service}
            />
          </Fragment>
        )
      })}
      {!query && loadingCount > 0 && <MenuSkeletonRows count={Math.min(loadingCount * 2, 4)} />}
      {failedServices.length > 0 && (
        <TaskFooterIntegrateMenuToolFailure
          titles={services
            .filter(({service}) => failedServices.includes(service))
            .map(({title}) => title)}
          othersWork={failedServices.length < connectedServices.length}
          onRetry={() => refresh(failedServices)}
        />
      )}
      <TaskFooterIntegrateMenuNeedsReconnect
        onConnect={onConnect}
        mutationProps={mutationProps}
        teamMemberRef={teamMember}
      />
    </>
  )
}

export default TaskFooterIntegrateMenuList
