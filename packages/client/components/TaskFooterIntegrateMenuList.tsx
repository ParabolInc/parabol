import graphql from 'babel-plugin-relay/macro'
import {useEffect, useState} from 'react'
import {useLazyLoadQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import IntegrationRepoId from '~/shared/gqlIds/IntegrationRepoId'
import {getLinearRepoName} from '~/utils/getLinearRepoName'
import {TaskServiceEnum} from '../__generated__/CreateTaskMutation.graphql'
import {TaskFooterIntegrateMenuListLocalQuery} from '../__generated__/TaskFooterIntegrateMenuListLocalQuery.graphql'
import {MenuProps} from '../hooks/useMenu'
import LinearProjectId from '../shared/gqlIds/LinearProjectId'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItemHR from './MenuItemHR'
import {SearchMenuItem} from './SearchMenuItem'
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

type Item = NonNullable<
  NonNullable<
    TaskFooterIntegrateMenuListLocalQuery['response']['viewer']['teamMember']
  >['repoIntegrations']['items']
>[0]

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

const TaskFooterIntegrateMenuList = (props: Props) => {
  const {menuProps, onPushToIntegration, placeholder, teamId, label} = props

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
  const [keepParentFocus, setKeepParentFocus] = useState(true)
  const [first, setFirst] = useState(50)
  const {viewer} = useLazyLoadQuery<TaskFooterIntegrateMenuListLocalQuery>(
    graphql`
      query TaskFooterIntegrateMenuListLocalQuery(
        $teamId: ID!
        $networkOnly: Boolean!
        $first: Int!
      ) {
        viewer {
          teamMember(teamId: $teamId) {
            repoIntegrations(first: $first, networkOnly: $networkOnly) {
              __typename
              items {
                ...TaskFooterIntegrateMenuListItem @relay(mask: false)
              }
            }
          }
        }
      }
    `,
    {teamId, networkOnly, first}
  )
  const items = viewer?.teamMember?.repoIntegrations.items ?? []
  // TODO: make this filter work for Linear type-ahead search
  const {
    query,
    filteredItems: filteredIntegrations,
    onQueryChange
  } = useSearchFilter(items, getValue)

  useEffect(() => {
    // if searching for a repoIntegration that doesnt exist in the cache, it could be stale so use the network
    // It is possible that user has a lot of repositories, if nothing was found in initial request, query everything
    const veryBigNumberOfRepositories = 10000
    if (!networkOnly && filteredIntegrations.length === 0) {
      setNetworkOnly(true)
      setKeepParentFocus(false)
      setFirst((first) => first + veryBigNumberOfRepositories)
    }
  }, [filteredIntegrations.length])

  return (
    <Menu
      keepParentFocus={keepParentFocus}
      ariaLabel={'Export the task'}
      {...menuProps}
      resetActiveOnChanges={[filteredIntegrations]}
    >
      {label && (
        <>
          <div className='p-2 pt-2 pb-0 text-sm text-slate-600'>{label}</div>
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
    </Menu>
  )
}

export default TaskFooterIntegrateMenuList
