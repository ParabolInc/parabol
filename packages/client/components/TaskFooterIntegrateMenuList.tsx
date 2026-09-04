import graphql from 'babel-plugin-relay/macro'
import {Suspense, useCallback, useEffect, useMemo, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import IntegrationRepoId from '~/shared/gqlIds/IntegrationRepoId'
import {getLinearRepoName} from '~/utils/getLinearRepoName'
import interleave from '~/utils/interleave'
import type {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import type {TaskFooterIntegrateMenuListLocalQuery} from '../__generated__/TaskFooterIntegrateMenuListLocalQuery.graphql'
import LinearProjectId from '../shared/gqlIds/LinearProjectId'
import {MenuSearch} from '../ui/Menu/MenuSearch'
import {MenuSeparator} from '../ui/Menu/MenuSeparator'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import TaskFooterIntegrateMenuServiceRepos, {
  type RepoIntegrationItem as Item,
  type RepoIntegrationService
} from './TaskFooterIntegrateMenuServiceRepos'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
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

type LinearProjectItem = Item & {__typename: '_xLinearProject'}

const getValue = (item: Item) => {
  const {service} = item
  if (service === 'jira' || service === 'azureDevOps' || service === 'jiraServer')
    return item.name ?? ''
  else if (service === 'github') return item.nameWithOwner ?? ''
  else if (service === 'gitlab') return item.fullPath ?? ''
  else if (service === 'linear' && item.__typename === '_xLinearTeam') return item.displayName ?? ''
  else if (service === 'linear' && item.__typename === '_xLinearProject')
    return getLinearRepoName(item as LinearProjectItem)
  return ''
}

const mergeItems = (prevUsed: readonly Item[], lists: (readonly Item[])[]) => {
  const seen = new Set<string>()
  return [...prevUsed, ...interleave(lists)].filter((item) => {
    const key = `${item.service}:${item.id}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const TaskFooterIntegrateMenuList = (props: Props) => {
  const {onPushToIntegration, placeholder, teamId, label} = props

  graphql`
    fragment TaskFooterIntegrateMenuListItem on RepoIntegration {
      __typename
      id
      service
      ... on JiraRemoteProject {
        cloudId
        key
        name
      }
      ... on _xGitHubRepository {
        nameWithOwner
      }
      ... on _xGitLabProject {
        fullPath
      }
      ... on AzureDevOpsRemoteProject {
        id
        name
        instanceId
      }
      ... on JiraServerRemoteProject {
        name
      }
      ... on _xLinearTeam {
        displayName
      }
      ... on _xLinearProject {
        name
        teams(first: 1) {
          nodes {
            id
            displayName
          }
        }
      }
    }
  `

  const [networkOnly, setNetworkOnly] = useState(false)
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
    return mergeItems(
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
      {filteredIntegrations.slice(0, 10).map((repoIntegration) => {
        const {id: integrationRepoId, service} = repoIntegration
        if (service === 'jira' && repoIntegration.name) {
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={repoIntegration.name}
              onClick={() => onPushToIntegration(integrationRepoId, 'jira', repoIntegration.name)}
              service='jira'
            />
          )
        }
        if (service === 'jiraServer' && repoIntegration.name) {
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={repoIntegration.name}
              onClick={() =>
                onPushToIntegration(integrationRepoId, 'jiraServer', repoIntegration.name)
              }
              service='jiraServer'
            />
          )
        }
        if (service === 'github' && repoIntegration.nameWithOwner) {
          const {nameWithOwner} = repoIntegration
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={repoIntegration.nameWithOwner}
              onClick={() =>
                onPushToIntegration(nameWithOwner, 'github', repoIntegration.nameWithOwner)
              }
              service='github'
            />
          )
        }
        if (service === 'gitlab' && repoIntegration.fullPath) {
          const {fullPath} = repoIntegration
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={fullPath}
              onClick={() => onPushToIntegration(fullPath, 'gitlab', fullPath)}
              service='gitlab'
            />
          )
        }
        if (service === 'azureDevOps' && repoIntegration.name) {
          const {name, id: projectId, instanceId} = repoIntegration
          const integrationRepoId = IntegrationRepoId.join({
            instanceId: instanceId!,
            projectId,
            service: 'azureDevOps'
          })
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={name}
              onClick={() => onPushToIntegration(integrationRepoId, 'azureDevOps', name)}
              service='azureDevOps'
            />
          )
        }
        if (
          service === 'linear' &&
          repoIntegration.__typename === '_xLinearTeam' &&
          repoIntegration.displayName
        ) {
          const {id: teamId, displayName: teamName} = repoIntegration
          if (!teamId) return null
          const integrationRepoId = LinearProjectId.join(teamId)
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={`${teamName}`}
              onClick={() => onPushToIntegration(integrationRepoId, 'linear')}
              service='linear'
            />
          )
        }
        if (
          service === 'linear' &&
          repoIntegration.__typename === '_xLinearProject' &&
          repoIntegration.name
        ) {
          const {id: projectId, teams} = repoIntegration
          const {id: teamId} = teams?.nodes?.[0] ?? {}
          if (!teamId) return null
          const nameWithTeam = getLinearRepoName(repoIntegration)
          const integrationRepoId = LinearProjectId.join(teamId, projectId)
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={nameWithTeam}
              onClick={() => onPushToIntegration(integrationRepoId, 'linear')}
              service='linear'
            />
          )
        }
        return null
      })}
    </>
  )
}

export default TaskFooterIntegrateMenuList
