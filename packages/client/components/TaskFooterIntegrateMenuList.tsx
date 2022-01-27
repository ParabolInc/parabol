import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {createFragmentContainer} from 'react-relay'
import useSearchFilter from '~/hooks/useSearchFilter'
import useAllIntegrations from '../hooks/useAllIntegrations'
import useAtmosphere from '../hooks/useAtmosphere'
import {MenuProps} from '../hooks/useMenu'
import {MenuMutationProps} from '../hooks/useMutationProps'
import CreateGitHubTaskIntegrationMutation from '../mutations/CreateGitHubTaskIntegrationMutation'
import CreateJiraTaskIntegrationMutation from '../mutations/CreateJiraTaskIntegrationMutation'
import {PALETTE} from '../styles/paletteV3'
import {TaskFooterIntegrateMenuList_suggestedIntegrations} from '../__generated__/TaskFooterIntegrateMenuList_suggestedIntegrations.graphql'
import {TaskFooterIntegrateMenuList_task} from '../__generated__/TaskFooterIntegrateMenuList_task.graphql'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import Menu from './Menu'
import MenuItemHR from './MenuItemHR'
import MenuItemLabel from './MenuItemLabel'
import {SearchMenuItem} from './SearchMenuItem'
import SuggestedIntegrationGitHubMenuItem from './SuggestedIntegrationGitHubMenuItem'
import SuggestedIntegrationJiraMenuItem from './SuggestedIntegrationJiraMenuItem'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  placeholder: string
  suggestedIntegrations: TaskFooterIntegrateMenuList_suggestedIntegrations
  task: TaskFooterIntegrateMenuList_task
  label?: string
}

const NoResults = styled(MenuItemLabel)({
  color: PALETTE.SLATE_600,
  justifyContent: 'center',
  paddingLeft: 8,
  paddingRight: 8,
  fontStyle: 'italic'
})

const Label = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 14,
  padding: '8px 8px 0'
})

const getValue = (
  item: NonNullable<TaskFooterIntegrateMenuList_suggestedIntegrations['items']>[0]
) => {
  const jiraItemName = item?.projectKey ?? ''
  const githubName = item?.nameWithOwner ?? ''
  const name = jiraItemName || githubName
  return name.toLowerCase()
}

const TaskFooterIntegrateMenuList = (props: Props) => {
  const {mutationProps, menuProps, placeholder, suggestedIntegrations, task, label} = props
  const {hasMore} = suggestedIntegrations
  const items = suggestedIntegrations.items || []
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
        <NoResults key='no-results'>No integrations found!</NoResults>
      )) ||
        null}
      {allItems.slice(0, 10).map((suggestedIntegration) => {
        const {id, service} = suggestedIntegration
        const {submitMutation, onError, onCompleted} = mutationProps
        if (service === 'jira') {
          const {cloudId, projectKey} = suggestedIntegration
          const onClick = () => {
            const variables = {cloudId, projectKey, taskId}
            submitMutation()
            CreateJiraTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <SuggestedIntegrationJiraMenuItem
              key={id}
              query={query}
              suggestedIntegration={suggestedIntegration}
              onClick={onClick}
            />
          )
        }
        if (service === 'github') {
          const onClick = () => {
            const {nameWithOwner} = suggestedIntegration
            const variables = {nameWithOwner, taskId}
            submitMutation()
            CreateGitHubTaskIntegrationMutation(atmosphere, variables, {onError, onCompleted})
          }
          return (
            <SuggestedIntegrationGitHubMenuItem
              key={id}
              query={query}
              suggestedIntegration={suggestedIntegration}
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
  fragment TaskFooterIntegrateMenuListItem on SuggestedIntegration {
    id
    service
    ... on SuggestedIntegrationJira {
      remoteProject {
        name
      }
      projectKey
      cloudId
    }
    ... on SuggestedIntegrationGitHub {
      nameWithOwner
    }
    ...SuggestedIntegrationJiraMenuItem_suggestedIntegration
    ...SuggestedIntegrationGitHubMenuItem_suggestedIntegration
  }
`

export default createFragmentContainer(TaskFooterIntegrateMenuList, {
  suggestedIntegrations: graphql`
    fragment TaskFooterIntegrateMenuList_suggestedIntegrations on SuggestedIntegrationQueryPayload {
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
