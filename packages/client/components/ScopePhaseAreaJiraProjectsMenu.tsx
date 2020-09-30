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
import {PALETTE} from '../styles/paletteV2'
import {ICON_SIZE} from '../styles/typographyV2'
import {ScopePhaseAreaJiraProjectsMenu_suggestedIntegrations} from '../__generated__/ScopePhaseAreaJiraProjectsMenu_suggestedIntegrations.graphql'
import Icon from './Icon'
import LoadingComponent from './LoadingComponent/LoadingComponent'
import Menu from './Menu'
import MenuItemComponentAvatar from './MenuItemComponentAvatar'
import MenuItemLabel from './MenuItemLabel'
import SuggestedIntegrationJiraMenuItem from './SuggestedIntegrationJiraMenuItem'
import TaskFooterIntegrateMenuSearch from './TaskFooterIntegrateMenuSearch'

interface Props {
  menuProps: MenuProps
  mutationProps: MenuMutationProps
  suggestedIntegrations: ScopePhaseAreaJiraProjectsMenu_suggestedIntegrations
  teamId: string
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

// TODO: adapt to be part of the jira project filter
const ScopePhaseAreaJiraProjectsMenu = (props: Props) => {
  const {menuProps, suggestedIntegrations, teamId} = props
  const {hasMore} = suggestedIntegrations
  const items = suggestedIntegrations.items || []

  const {fields, onChange} = useForm({
    search: {
      getDefault: () => ''
    }
  })
  const {search} = fields
  const {value} = search
  const query = value.toLowerCase()
  const atmosphere = useAtmosphere()
  const {viewerId} = atmosphere
  const filteredIntegrations = useFilteredItems(query, items)
  const {allItems, status} = useAllIntegrations(
    atmosphere,
    query,
    filteredIntegrations,
    !!hasMore,
    teamId,
    viewerId
  )
  return (
    <Menu
      keepParentFocus
      ariaLabel={'Add a Project'}
      {...menuProps}
      resetActiveOnChanges={[allItems]}
    >
      <SearchItem key='search'>
        <StyledMenuItemIcon>
          <SearchIcon>search</SearchIcon>
        </StyledMenuItemIcon>
        <TaskFooterIntegrateMenuSearch
          placeholder={'Search Jira'}
          value={value}
          onChange={onChange}
        />
      </SearchItem>
      {(query && allItems.length === 0 && status !== 'loading' && (
        <NoResults key='no-results'>No Jira Projects found!</NoResults>
      )) ||
        null}
      {allItems.slice(0, 10).map((suggestedIntegration) => {
        if (!suggestedIntegration) return null
        const {id} = suggestedIntegration
        const onClick = () => {}
        return (
          <SuggestedIntegrationJiraMenuItem
            key={id}
            query={query}
            suggestedIntegration={suggestedIntegration}
            onClick={onClick}
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
  fragment ScopePhaseAreaJiraProjectsMenuListItem on SuggestedIntegrationJira {
    id
    service
    projectName
    ...SuggestedIntegrationJiraMenuItem_suggestedIntegration
  }
`

export default createFragmentContainer(ScopePhaseAreaJiraProjectsMenu, {
  suggestedIntegrations: graphql`
    fragment ScopePhaseAreaJiraProjectsMenu_suggestedIntegrations on SuggestedIntegrationQueryPayload {
      hasMore
      items {
        ...ScopePhaseAreaJiraProjectsMenuListItem @relay(mask: false)
      }
    }
  `
})
