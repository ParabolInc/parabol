import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {useEffect, useMemo, useRef, useState} from 'react'
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
import {TaskFooterIntegrateMenuList_teamMember$key} from '../__generated__/TaskFooterIntegrateMenuList_teamMember.graphql'
import {EmptyDropdownMenuItemLabel} from './EmptyDropdownMenuItemLabel'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import Menu from './Menu'
import MenuItem from './MenuItem'
import MenuItemHR from './MenuItemHR'
import MenuItemLabel from './MenuItemLabel'
import {SearchMenuItem} from './SearchMenuItem'
import TaskIntegrationMenuItem from './TaskIntegrationMenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  placeholder: string
  teamMemberRef: TaskFooterIntegrateMenuList_teamMember$key
  task: TaskFooterIntegrateMenuList_task$key
  label?: string
}

const Label = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  padding: '8px 8px 0'
})

const StyledMenuItemLabel = styled(MenuItemLabel)({
  display: 'flex',
  justifyContent: 'center'
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
  const {mutationProps, menuProps, placeholder, teamMemberRef, task: taskRef, label} = props

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

  const {prevRepoIntegrations} = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuList_teamMember on TeamMember {
        prevRepoIntegrations {
          ...TaskFooterIntegrateMenuListItem @relay(mask: false)
        }
      }
    `,
    teamMemberRef
  )
  const task = useFragment(
    graphql`
      fragment TaskFooterIntegrateMenuList_task on Task {
        id
        teamId
        userId
      }
    `,
    taskRef
  )
  const {id: taskId, teamId, userId} = task
  const [showRepoIntegrations, setShowRepoIntegrations] = useState(!prevRepoIntegrations)
  const {viewer} = useLazyLoadQuery<TaskFooterIntegrateMenuListLocalQuery>(
    graphql`
      query TaskFooterIntegrateMenuListLocalQuery($teamId: ID!) {
        viewer {
          teamMember(teamId: $teamId) {
            repoIntegrations(first: 50) {
              __typename
              hasMore
              items {
                ...TaskFooterIntegrateMenuListItem @relay(mask: false)
              }
            }
          }
        }
      }
    `,
    {teamId},
    {
      UNSTABLE_renderPolicy: 'full',
      // fetchPolicy: showRepoIntegrations ? 'store-or-network' : 'store-only'
      fetchPolicy: true ? 'store-or-network' : 'store-only'
    }
  )
  const repoIntegrations = viewer?.teamMember?.repoIntegrations
  const hasMore = repoIntegrations?.hasMore
  const hasRepoIntegrations = !!repoIntegrations?.items?.length
  const items = useMemo(() => {
    if (!hasRepoIntegrations) prevRepoIntegrations ?? []
    if (!prevRepoIntegrations) return repoIntegrations?.items ?? []

    const filteredItems =
      repoIntegrations?.items?.filter((item) => {
        return !prevRepoIntegrations.some(
          (prevRepoIntegration) => getValue(item) === getValue(prevRepoIntegration as any)
        )
      }) ?? []
    return [...prevRepoIntegrations, ...filteredItems]
  }, [prevRepoIntegrations?.length, showRepoIntegrations, hasRepoIntegrations])
  const {
    query,
    filteredItems: filteredIntegrations,
    onQueryChange
  } = useSearchFilter(items, getValue)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // when typing into the search input, show all repoIntegrations if there are no matching prevRepoIntegrations
    if (!showRepoIntegrations && filteredIntegrations.length === 0) {
      setShowRepoIntegrations(true)
    }
  }, [filteredIntegrations.length])

  const atmosphere = useAtmosphere()
  const handleShowMore = () => {
    if (!showRepoIntegrations) {
      setShowRepoIntegrations(true)
    }
  }
  // const {allItems, status} = useAllIntegrations(
  //   atmosphere,
  //   query,
  //   filteredIntegrations,
  //   !!hasMore,
  //   teamId,
  //   userId
  // )

  return (
    <Menu
      keepParentFocus
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
      {/* {(query && filteredIntegrations.length === 0 && status !== 'loading' && ( */}
      {(query && filteredIntegrations.length === 0 && (
        <EmptyDropdownMenuItemLabel key='no-results'>
          No integrations found!
        </EmptyDropdownMenuItemLabel>
      )) ||
        null}
      {filteredIntegrations.slice(0, 10).map((repoIntegration) => {
        const {id, service, __typename} = repoIntegration
        const {submitMutation, onError, onCompleted} = mutationProps
        if (service === 'jira' && repoIntegration.name) {
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
            <TaskIntegrationMenuItem
              key={id}
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
              integrationRepoId: repoIntegration.id,
              taskId,
              integrationProviderService: 'jiraServer' as const
            }
            submitMutation()
            CreateTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <TaskIntegrationMenuItem
              key={id}
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
              key={id}
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
              key={id}
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
              key={id}
              query={query}
              label={name}
              onClick={onClick}
              service='azureDevOps'
            />
          )
        }
        return null
      })}
      {!hasRepoIntegrations && (
        <>
          <MenuItemHR />
          <MenuItem
            ref={ref}
            key={'show-more'}
            onClick={handleShowMore}
            label={<StyledMenuItemLabel>{'Show more'}</StyledMenuItemLabel>}
            noCloseOnClick
          />
        </>
      )}
      {status === 'loading' && (
        <LoadingComponent key='loading' spinnerSize={24} height={24} showAfter={0} />
      )}
    </Menu>
  )
}

export default TaskFooterIntegrateMenuList
