import {TaskFooterIntegrateMenu_task} from '__generated__/TaskFooterIntegrateMenu_task.graphql'
import {TaskFooterIntegrateMenu_viewer} from '__generated__/TaskFooterIntegrateMenu_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Icon from 'universal/components/Icon'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import SuggestedIntegrationGitHubMenuItem from 'universal/components/SuggestedIntegrationGitHubMenuItem'
import SuggestedIntegrationJiraMenuItem from 'universal/components/SuggestedIntegrationJiraMenuItem'
import TaskFooterIntegrateMenuSearch from 'universal/components/TaskFooterIntegrateMenuSearch'
import {PALETTE} from 'universal/styles/paletteV2'
import {TaskServiceEnum} from 'universal/types/graphql'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'
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

const serviceToMenuItemLookup = {
  [TaskServiceEnum.jira]: SuggestedIntegrationJiraMenuItem,
  [TaskServiceEnum.github]: SuggestedIntegrationGitHubMenuItem
}

const TaskFooterIntegrateMenu = (props: Props) => {
  const {closePortal, mutationProps, viewer} = props
  // const {teamId} = task
  const {suggestedIntegrations} = viewer
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
    <Menu ariaLabel={'Export the task'} closePortal={closePortal}>
      <MenuItem
        noCloseOnClick
        label={
          <MenuItemLabel>
            <MenuItemComponentAvatar>
              <SearchIcon>search</SearchIcon>
            </MenuItemComponentAvatar>
            <TaskFooterIntegrateMenuSearch />
          </MenuItemLabel>
        }
      />
      {suggestedIntegrations.map((suggestedIntegration) => {
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
