import {TaskFooterIntegrateMenu_task} from '__generated__/TaskFooterIntegrateMenu_task.graphql'
import {TaskFooterIntegrateMenu_viewer} from '__generated__/TaskFooterIntegrateMenu_viewer.graphql'
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
  task: TaskFooterIntegrateMenu_task
  viewer: TaskFooterIntegrateMenu_viewer
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

const serviceToMenuItemLookup = {
  [TaskServiceEnum.jira]: SuggestedIntegrationJiraMenuItem,
  [TaskServiceEnum.github]: SuggestedIntegrationGitHubMenuItem
}

const typeAheadFilter = new TypeAheadFilter()

const TaskFooterIntegrateMenu = (props: Props) => {
  const {closePortal, mutationProps, viewer} = props
  // const {teamId} = task
  const {suggestedIntegrations} = viewer
  const [filteredIntegrations, setFilteredIntegrations] = useState(suggestedIntegrations)
  const {
    fields: {
      search: {value}
    },
    onChange
  } = useForm({
    search: {
      getDefault: () => ''
    }
  })
  const query = value.toLowerCase()

  useEffect(() => {
    if (!query) {
      setFilteredIntegrations(suggestedIntegrations)
    }
    const res = typeAheadFilter.compare(query, suggestedIntegrations, (item) =>
      (item.nameWithOwner || item.projectName).toLowerCase()
    )
    setFilteredIntegrations(res)
  }, [query])
  // const hasJira = suggestedIntegrations.some(
  //   (integration) => integration.service === TaskServiceEnum.jira
  // )
  // const hasGitHub = suggestedIntegrations.some(
  //   (integration) => integration.service === TaskServiceEnum.github
  // )
  // const hasAllProviders = hasJira && hasGitHub
  // suggested integrations
  // add a new one
  // search
  // search results
  return (
    <Menu keepParentFocus ariaLabel={'Export the task'} closePortal={closePortal}>
      <MenuItemLabel>
        <MenuItemComponentAvatar>
          <SearchIcon>search</SearchIcon>
        </MenuItemComponentAvatar>
        <TaskFooterIntegrateMenuSearch value={value} onChange={onChange} />
      </MenuItemLabel>
      {(query && filteredIntegrations.length === 0 && (
        <NoResults key='no-results'>No integrations found!</NoResults>
      )) ||
        null}
      {filteredIntegrations.map((suggestedIntegration) => {
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
      {/*{!hasGitHub && <AddToGitHubMenuItem teamId={teamId} />}*/}
      {/*{!hasAllProviders && <MenuItemHR />}*/}
      {/*<AddToGitHubMenuItem teamId={teamId} />*/}
      {/*<AddToJiraMenuItem teamId={teamId} />*/}
      {/*<JiraAvailableProjectsMenu*/}
      {/*  accessToken={accessToken}*/}
      {/*  sites={sites}*/}
      {/*  onError={onError}*/}
      {/*  onCompleted={onCompleted}*/}
      {/*  submitMutation={submitMutation}*/}
      {/*  team={team}*/}
      {/*  closePortal={closePortal}*/}
      {/*  originRef={originRef}*/}
      {/*/>*/}
    </Menu>
  )
}

export default createFragmentContainer(
  TaskFooterIntegrateMenu,
  graphql`
    fragment TaskFooterIntegrateMenu_viewer on User {
      suggestedIntegrations(teamId: $teamId, userId: $userId) {
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
    fragment TaskFooterIntegrateMenu_task on Task {
      id
      content
      status
      tags
      teamId
    }
  `
)
