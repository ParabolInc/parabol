import {TaskFooterIntegrateMenuList_suggestedIntegrations} from '__generated__/TaskFooterIntegrateMenuList_suggestedIntegrations.graphql'
import {TaskFooterIntegrateMenuList_task} from '__generated__/TaskFooterIntegrateMenuList_task.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Icon from 'universal/components/Icon'
import LoadingComponent from 'universal/components/LoadingComponent/LoadingComponent'
import Menu from 'universal/components/Menu'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import SuggestedIntegrationGitHubMenuItem from 'universal/components/SuggestedIntegrationGitHubMenuItem'
import SuggestedIntegrationJiraMenuItem from 'universal/components/SuggestedIntegrationJiraMenuItem'
import TaskFooterIntegrateMenuSearch from 'universal/components/TaskFooterIntegrateMenuSearch'
import useAllIntegrations from 'universal/hooks/useAllIntegrations'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import useFilteredItems from 'universal/hooks/useFilteredItems'
import {PALETTE} from 'universal/styles/paletteV2'
import {TaskServiceEnum} from 'universal/types/graphql'
import useForm from 'universal/utils/relay/useForm'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'

interface Props {
  closePortal: () => void
  mutationProps: MenuMutationProps
  placeholder: string
  suggestedIntegrations: TaskFooterIntegrateMenuList_suggestedIntegrations
  task: TaskFooterIntegrateMenuList_task
}

const SearchIcon = styled(Icon)({
  color: PALETTE.TEXT.MAIN,
  fontSize: 20
})

const NoResults = styled(MenuItemLabel)({
  paddingLeft: 44,
  fontStyle: 'italic',
  fontWeight: 600
})

const SearchItem = styled(MenuItemLabel)({
  padding: 0,
  margin: '0 8px 8px',
  borderRadius: 2,
  boxShadow: `0px 0px 2px 2px ${PALETTE.BACKGROUND.BLUE}`
})

const serviceToMenuItemLookup = {
  [TaskServiceEnum.jira]: SuggestedIntegrationJiraMenuItem,
  [TaskServiceEnum.github]: SuggestedIntegrationGitHubMenuItem
}

const TaskFooterIntegrateMenu = (props: Props) => {
  const {closePortal, mutationProps, placeholder, suggestedIntegrations, task} = props
  const {hasMore} = suggestedIntegrations
  const items = suggestedIntegrations.items || []
  const {teamId, userId} = task

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
      closePortal={closePortal}
      resetActiveOnChanges={[allItems]}
    >
      <SearchItem>
        <MenuItemComponentAvatar>
          <SearchIcon>search</SearchIcon>
        </MenuItemComponentAvatar>
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
        const MenuItem = serviceToMenuItemLookup[
          service
        ] as any /*ValueOf<typeof serviceToMenuItemLookup>*/
        if (!MenuItem) return null
        return (
          <MenuItem
            {...mutationProps}
            key={id}
            closePortal={closePortal}
            query={query}
            suggestedIntegration={suggestedIntegration}
          />
        )
      })}
      {status === 'loading' && <LoadingComponent spinnerSize={24} height={24} showAfter={0} />}
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
    ... on SuggestedIntegrationGitHub {
      nameWithOwner
    }
    ...SuggestedIntegrationJiraMenuItem_suggestedIntegration
    ...SuggestedIntegrationGitHubMenuItem_suggestedIntegration
  }
`

export default createFragmentContainer(
  TaskFooterIntegrateMenu,
  graphql`
    fragment TaskFooterIntegrateMenuList_suggestedIntegrations on SuggestedIntegrationQueryPayload {
      hasMore
      items {
        ...TaskFooterIntegrateMenuListItem @relay(mask: false)
      }
    }
    fragment TaskFooterIntegrateMenuList_task on Task {
      id
      teamId
      userId
    }
  `
)
