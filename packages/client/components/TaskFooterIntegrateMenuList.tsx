import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useState} from 'react'
import {useFragment, useLazyLoadQuery} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import IntegrationRepoId from '~/shared/gqlIds/IntegrationRepoId'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import CreateTaskIntegrationMutation from '../mutations/CreateTaskIntegrationMutation'
import {PALETTE} from '../styles/paletteV3'
import {
  TaskFooterIntegrateMenuListLocalQuery,
  TaskFooterIntegrateMenuListLocalQueryResponse
} from '../__generated__/TaskFooterIntegrateMenuListLocalQuery.graphql'
import {TaskFooterIntegrateMenuList_task$key} from '../__generated__/TaskFooterIntegrateMenuList_task.graphql'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import Menu from './Menu'
import MenuItemHR from './MenuItemHR'
import {SearchMenuItem} from './SearchMenuItem'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  placeholder: string
  task: TaskFooterIntegrateMenuList_task$key
  label?: string
}

const Label = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  padding: '8px 8px 0'
})

type Item = NonNullable<
  NonNullable<
    TaskFooterIntegrateMenuListLocalQueryResponse['viewer']['teamMember']
  >['repoIntegrations']['items']
>[0]

const getValue = (item: Item) => {
  const {service} = item
  if (service === 'jira' || service === 'azureDevOps' || service === 'jiraServer')
    return item.name ?? ''
  else if (service === 'github') return item.nameWithOwner ?? ''
  else if (service === 'gitlab') return item.fullPath ?? ''
  return ''
}

const TaskFooterIntegrateMenuList = (props: Props) => {
  const {mutationProps, menuProps, placeholder, task: taskRef, label} = props

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
    }
  `

  const task = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuList_task on Task {
        id
        teamId
      }
    `,
    taskRef
  )
  const {id: taskId, teamId} = task
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
    {teamId, networkOnly, first},
    {UNSTABLE_renderPolicy: 'full'}
  )
  const items = viewer?.teamMember?.repoIntegrations.items ?? []
  const {
    query,
    filteredItems: filteredIntegrations,
    onQueryChange
  } = useSearchFilter(items, getValue)
  const atmosphere = useAtmosphere()

  useEffect(() => {
    // if searching for a repoIntegration that doesnt exist in the cache, it could be stale so use the network
    if (!networkOnly && filteredIntegrations.length === 0) {
      setNetworkOnly(true)
      setKeepParentFocus(false)
      setFirst((first) => first + 50)
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
          <Label>{label}</Label>
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
        const {submitMutation, onError, onCompleted} = mutationProps
        if (service === 'jira' && repoIntegration.name) {
          const onClick = () => {
            const variables = {
              integrationRepoId,
              taskId,
              integrationProviderService: 'jira' as const
            }
            submitMutation()
            CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={repoIntegration.name}
              onClick={onClick}
              service='jira'
            />
          )
        }
        if (service === 'jiraServer' && repoIntegration.name) {
          const onClick = () => {
            const variables = {
              integrationRepoId,
              taskId,
              integrationProviderService: 'jiraServer' as const
            }
            submitMutation()
            CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={repoIntegration.name}
              onClick={onClick}
              service='jiraServer'
            />
          )
        }
        if (service === 'github' && repoIntegration.nameWithOwner) {
          const {nameWithOwner} = repoIntegration
          const onClick = () => {
            const variables = {
              integrationRepoId: nameWithOwner,
              taskId,
              integrationProviderService: 'github' as const
            }
            submitMutation()
            CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={repoIntegration.nameWithOwner}
              onClick={onClick}
              service='github'
            />
          )
        }
        if (service === 'gitlab' && repoIntegration.fullPath) {
          const {fullPath} = repoIntegration
          const onClick = () => {
            const variables = {
              integrationRepoId: fullPath,
              taskId,
              integrationProviderService: 'gitlab' as const
            }
            submitMutation()
            CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={fullPath}
              onClick={onClick}
              service='gitlab'
            />
          )
        }
        if (service === 'azureDevOps' && repoIntegration.name) {
          const {name, id: projectId, instanceId} = repoIntegration
          const onClick = () => {
            const integrationRepoId = IntegrationRepoId.join({
              instanceId: instanceId!,
              projectId,
              service: 'azureDevOps'
            })
            const variables = {
              integrationRepoId,
              taskId,
              integrationProviderService: 'azureDevOps' as const
            }
            submitMutation()
            CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <TaskIntegrationMenuItem
              key={integrationRepoId}
              query={query}
              label={name}
              onClick={onClick}
              service='azureDevOps'
            />
          )
        }
        return null
      })}
    </Menu>
  )
}

export default TaskFooterIntegrateMenuList
