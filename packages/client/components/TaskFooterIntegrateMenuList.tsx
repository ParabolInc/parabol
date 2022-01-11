import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useAllIntegrations from '../hooks/useAllIntegrations'
import useAtmosphere from '../hooks/useAtmosphere'
import useFilteredItems from '../hooks/useFilteredItems'
import useForm from '../hooks/useForm'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import CreateGitHubTaskIntegrationMutation from '../mutations/CreateGitHubTaskIntegrationMutation'
import CreateJiraTaskIntegrationMutation from '../mutations/CreateJiraTaskIntegrationMutation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {TaskFooterIntegrateMenuList_repoIntegrations} from '../__generated__/TaskFooterIntegrateMenuList_repoIntegrations.graphql'
import {TaskFooterIntegrateMenuList_task} from '../__generated__/TaskFooterIntegrateMenuList_task.graphql'
import Icon from './Icon'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import Menu from './Menu'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemHR from './MenuItemHR'
import MenuItemLabel from './MenuItemLabel'
import MenuSearch from './MenuSearch'
import RepoIntegrationGitHubMenuItem from './RepoIntegrationGitHubMenuItem'
import RepoIntegrationJiraMenuItem from './RepoIntegrationJiraMenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  placeholder: string
  repoIntegrations: TaskFooterIntegrateMenuList_repoIntegrations
  task: TaskFooterIntegrateMenuList_task
  label?: string
}

const SearchIcon = styled(Icon)({
  color: PALETTE.SLATE_600,
  fontSize: ICON_SIZE.MD18
})

const NoResults = styled(MenuItemLabel)({
  color: PALETTE.SLATE_600,
  justifyContent: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  fontStyle: 'italic'
})

const SearchItem = styled(MenuItemLabel)({
  margin: '0 8px 8px',
  overflow: 'visible',
  padding: 0,
  position: 'relative'
})

const StyledMenuItemIcon = styled(MenuItemComponentAvatar)({
  position: 'absolute',
  left: 8,
  margin: 0,
  pointerEvents: 'none',
  top: 4
})

const Label = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  padding: '8px 8px 0'
})

const getValue = (item: NonNullable<TaskFooterIntegrateMenuList_repoIntegrations['items']>[0]) => {
  const jiraItemName = item?.name ?? ''
  const githubName = item?.nameWithOwner ?? ''
  const name = jiraItemName || githubName
  return name.toLowerCase()
}

const TaskFooterIntegrateMenuList = (props: Props) => {
  const {mutationProps, menuProps, placeholder, repoIntegrations, task, label} = props
  const {hasMore} = repoIntegrations
  const items = repoIntegrations.items || []
  const {id: taskId, teamId, userId} = task

  const {fields, onChange} = useForm({
    search: {
      getDefault: () => ''
    }
  })
  const {search} = fields
  const {value} = search
  const query = value.toLowerCase()
  const atmosphere = useAtmosphere()
  const filteredIntegrations = useFilteredItems(query, items, getValue)
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
      <SearchItem key='search'>
        <StyledMenuItemIcon>
          <SearchIcon>search</SearchIcon>
        </StyledMenuItemIcon>
        <MenuSearch placeholder={placeholder} value={value} onChange={onChange} />
      </SearchItem>
      {(query && allItems.length === 0 && status !== 'loading' && (
        <NoResults key='no-results'>No integrations found!</NoResults>
      )) ||
        null}
      {allItems.slice(0, 10).map((repoIntegration) => {
        const {id, __typename} = repoIntegration
        const {submitMutation, onError, onCompleted} = mutationProps
        if (__typename === 'JiraRemoteProject') {
          const {cloudId, key: projectKey} = repoIntegration
          const onClick = () => {
            const variables = {cloudId, projectKey, taskId}
            submitMutation()
            CreateJiraTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
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
        if (__typename === '_xGitHubRepository') {
          const onClick = () => {
            const {nameWithOwner} = repoIntegration
            const variables = {nameWithOwner, taskId}
            submitMutation()
            CreateGitHubTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <RepoIntegrationGitHubMenuItem
              key={id}
              query={query}
              repoIntegration={repoIntegration}
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
    id
    ... on JiraRemoteProject {
      __typename
      id
      cloudId
      key
      name
    }
    ... on _xGitHubRepository {
      __typename
      nameWithOwner
    }
    ...RepoIntegrationJiraMenuItem_repoIntegration
    ...RepoIntegrationGitHubMenuItem_repoIntegration
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
