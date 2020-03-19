import {TaskFooterIntegrateMenuList_suggestedIntegrations} from '../__generated__/TaskFooterIntegrateMenuList_suggestedIntegrations.graphql'
import {TaskFooterIntegrateMenuList_task} from '../__generated__/TaskFooterIntegrateMenuList_task.graphql'
import React from 'react'
import styled from '@emotion/styled'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {ValueOf} from '../types/generics'
import Icon from './Icon'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import Menu from './Menu'
import MenuItemLabel from './MenuItemLabel'
import SuggestedIntegrationGitHubMenuItem from './SuggestedIntegrationGitHubMenuItem'
import SuggestedIntegrationJiraMenuItem from './SuggestedIntegrationJiraMenuItem'
import TaskFooterIntegrateMenuSearch from './TaskFooterIntegrateMenuSearch'
import useAllIntegrations from '../hooks/useAllIntegrations'
import useAtmosphere from '../hooks/useAtmosphere'
import useFilteredItems from '../hooks/useFilteredItems'
import {MenuProps} from '../hooks/useMenu'
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import {TaskServiceEnum} from '../types/graphql'
import useForm from '../hooks/useForm'
import {MenuMutationProps} from '../hooks/useMutationProps'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  placeholder: string
  suggestedIntegrations: TaskFooterIntegrateMenuList_suggestedIntegrations
  task: TaskFooterIntegrateMenuList_task
}

const SearchIcon = styled(Icon)({
  color: PALETTE.TEXT_GRAY,
  fontSize: ICON_SIZE.MD18
})

const NoResults = styled(MenuItemLabel)({
  color: PALETTE.TEXT_GRAY,
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

const serviceToMenuItemLookup = {
  [TaskServiceEnum.jira]: SuggestedIntegrationJiraMenuItem,
  [TaskServiceEnum.azuredevops]: SuggestedIntegrationAzureDevopsMenuItem,
  [TaskServiceEnum.github]: SuggestedIntegrationGitHubMenuItem
}

const TaskFooterIntegrateMenu = (props: Props) => {
  const {mutationProps, menuProps, placeholder, suggestedIntegrations, task} = props
  const {hasMore} = suggestedIntegrations
  const items = suggestedIntegrations.items || []
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
  const filteredIntegrations = useFilteredItems(query, items)
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
      <SearchItem key='search'>
        <StyledMenuItemIcon>
          <SearchIcon>search</SearchIcon>
        </StyledMenuItemIcon>
        <TaskFooterIntegrateMenuSearch
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </SearchItem>
      {(query && allItems.length === 0 && status !== 'loading' && (
        <NoResults key='no-results'>No integrations found!</NoResults>
      )) ||
        null}
      {allItems.slice(0, 10).map((suggestedIntegration) => {
        const {id, service} = suggestedIntegration
        const ServiceMenuItem = serviceToMenuItemLookup[service] as ValueOf<
          typeof serviceToMenuItemLookup
        >
        if (!ServiceMenuItem) return null
        return (
          <ServiceMenuItem
            {...mutationProps}
            key={id}
            query={query}
            suggestedIntegration={suggestedIntegration}
            taskId={taskId}
          />
        )
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
      projectName
    }
    ... on SuggestedIntegrationAzureDevops {
      projectName
    }
    ... on SuggestedIntegrationGitHub {
      nameWithOwner
    }
    ...SuggestedIntegrationJiraMenuItem_suggestedIntegration
    ...SuggestedIntegrationAzureDevopsMenuItem_suggestedIntegration
    ...SuggestedIntegrationGitHubMenuItem_suggestedIntegration
  }
`

export default createFragmentContainer(TaskFooterIntegrateMenu, {
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
