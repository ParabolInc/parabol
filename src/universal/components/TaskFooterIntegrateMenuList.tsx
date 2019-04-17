import {TaskFooterIntegrateMenuList_suggestedIntegrations} from '__generated__/TaskFooterIntegrateMenuList_suggestedIntegrations.graphql'
import React, {useEffect, useState} from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Icon from 'universal/components/Icon'
import Menu from 'universal/components/Menu'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import SuggestedIntegrationGitHubMenuItem from 'universal/components/SuggestedIntegrationGitHubMenuItem'
import SuggestedIntegrationJiraMenuItem from 'universal/components/SuggestedIntegrationJiraMenuItem'
import TaskFooterIntegrateMenuSearch from 'universal/components/TaskFooterIntegrateMenuSearch'
import {PALETTE} from 'universal/styles/paletteV2'
import {TaskServiceEnum} from 'universal/types/graphql'
import useForm from 'universal/utils/relay/useForm'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'
import TypeAheadFilter from 'universal/utils/TypeAheadFilter'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'

interface Props {
  closePortal: () => void
  mutationProps: MenuMutationProps
  placeholder: string
  taskId: string
  suggestedIntegrations: TaskFooterIntegrateMenuList_suggestedIntegrations
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

const typeAheadFilter = new TypeAheadFilter()

const TaskFooterIntegrateMenu = (props: Props) => {
  const {closePortal, mutationProps, placeholder, suggestedIntegrations} = props
  const {items} = suggestedIntegrations

  const [filteredIntegrations, setFilteredIntegrations] = useState(items)
  const {fields, onChange} = useForm({
    search: {
      getDefault: () => ''
    }
  })
  const {search} = fields
  const {value} = search
  const query = value.toLowerCase()

  useEffect(() => {
    if (!query) {
      setFilteredIntegrations(items)
    }
    const res = typeAheadFilter.compare(query, items, (item) =>
      (item.nameWithOwner || item.projectName).toLowerCase()
    )
    setFilteredIntegrations(res)
  }, [query])
  return (
    <Menu keepParentFocus ariaLabel={'Export the task'} closePortal={closePortal}>
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
      {(query && filteredIntegrations.length === 0 && (
        <NoResults key='no-results'>No integrations found!</NoResults>
      )) ||
        null}
      {filteredIntegrations.slice(0, 10).map((suggestedIntegration) => {
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
            suggestedIntegration={suggestedIntegration as any}
          />
        )
      })}
    </Menu>
  )
}

export default createFragmentContainer(
  TaskFooterIntegrateMenu,
  graphql`
    fragment TaskFooterIntegrateMenuList_suggestedIntegrations on SuggestedIntegrationQueryPayload {
      hasMore
      items {
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
    }
  `
)
