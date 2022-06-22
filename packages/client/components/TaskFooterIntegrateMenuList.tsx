import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import useAllIntegrations from '../hooks/useAllIntegrations'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import CreateTaskIntegrationMutation from '../mutations/CreateTaskIntegrationMutation'
import {PALETTE} from '../styles/paletteV3'
import {TaskFooterIntegrateMenuList_repoIntegrations} from '../__generated__/TaskFooterIntegrateMenuList_repoIntegrations.graphql'
import {TaskFooterIntegrateMenuList_task} from '../__generated__/TaskFooterIntegrateMenuList_task.graphql'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import Menu from './Menu'
import MenuItemHR from './MenuItemHR'
import RepoIntegrationGitHubMenuItem from './RepoIntegrationGitHubMenuItem'
import RepoIntegrationGitLabMenuItem from './RepoIntegrationGitLabMenuItem'
import RepoIntegrationJiraMenuItem from './RepoIntegrationJiraMenuItem'
import RepoIntegrationJiraServerMenuItem from './RepoIntegrationJiraServerMenuItem'
import {SearchMenuItem} from './SearchMenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  placeholder: string
  repoIntegrations: TaskFooterIntegrateMenuList_repoIntegrations
  task: TaskFooterIntegrateMenuList_task
  label?: string
}

const Label = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  padding: '8px 8px 0'
})

const getValue = (item: NonNullable<TaskFooterIntegrateMenuList_repoIntegrations['items']>[0]) => {
  const jiraItemName = item?.name ?? ''
  const githubName = item?.nameWithOwner ?? ''
  return jiraItemName || githubName
}

const TaskFooterIntegrateMenuList = (props: Props) => {
  const {mutationProps, menuProps, placeholder, repoIntegrations, task, label} = props
  const {hasMore} = repoIntegrations
  const items = repoIntegrations.items || []
  const {id: taskId, teamId, userId} = task

  const {
    query,
    filteredItems: filteredIntegrations,
    onQueryChange
  } = useSearchFilter(items, getValue)

  const atmosphere = useAtmosphere()
  const {allItems, status} = useAllIntegrations(
    atmosphere,
    query,
    filteredIntegrations,
    !!hasMore,
    teamId,
    userId
  )
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Export the task'}
      {...menuProps}
      resetActiveOnChanges={[allItems]}
    >
      {label && (
        <>
          <Label>{label}</Label>
          <MenuItemHR />
        </>
      )}
      <SearchMenuItem placeholder={placeholder} onChange={onQueryChange} value={query} />
      {(query && allItems.length === 0 && status !== 'loading' && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No integrations found!
        </EmptyDropdownMenuItemLabel>
      )) ||
        null}
      {allItems.slice(0, 10).map((repoIntegration) => {
        const {id, __typename} = repoIntegration
        const {submitMutation, onError, onCompleted} = mutationProps
        if (__typename === 'JiraRemoteProject') {
          const onClick = () => {
            const variables = {
              integrationRepoId: repoIntegration.id,
              taskId,
              integrationProviderService: 'jira' as const
            }
            submitMutation()
            CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <RepoIntegrationJiraMenuItem
              key={id}
              query={query}
              repoIntegration={repoIntegration}
              onClick={onClick}
            />
          )
        }
        if (__typename === 'JiraServerRemoteProject') {
          const onClick = () => {
            const variables = {
              integrationRepoId: repoIntegration.id,
              taskId,
              integrationProviderService: 'jiraServer' as const
            }
            submitMutation()
            CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <RepoIntegrationJiraServerMenuItem
              key={id}
              query={query}
              repoIntegration={repoIntegration}
              onClick={onClick}
            />
          )
        }
        if (__typename === '_xGitHubRepository') {
          const onClick = () => {
            const {nameWithOwner} = repoIntegration
            const variables = {
              integrationRepoId: nameWithOwner,
              taskId,
              integrationProviderService: 'github' as const
            }
            submitMutation()
            CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <RepoIntegrationGitHubMenuItem
              key={id}
              query={query}
              nameWithOwner={repoIntegration.nameWithOwner}
              onClick={onClick}
            />
          )
        }
        if (__typename === '_xGitLabProject') {
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
            <RepoIntegrationGitLabMenuItem
              key={id}
              query={query}
              fullPath={fullPath}
              onClick={onClick}
            />
          )
        }
        return null
      })}
      {status === 'loading' && (
        <LoadingComponent key='loading' spinnerSize={24} height={24} showAfter={0} />
      )}
    </Menu>
  )
}

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
    ...RepoIntegrationJiraMenuItem_repoIntegration
    ...RepoIntegrationJiraServerMenuItem_repoIntegration
  }
`

export default createFragmentContainer(TaskFooterIntegrateMenuList, {
  repoIntegrations: graphql`
    fragment TaskFooterIntegrateMenuList_repoIntegrations on RepoIntegrationQueryPayload {
      hasMore
      items {
        ...TaskFooterIntegrateMenuListItem @relay(mask: false)
      }
    }
  `,
  task: graphql`
    fragment TaskFooterIntegrateMenuList_task on Task {
      id
      teamId
      userId
    }
  `
})
