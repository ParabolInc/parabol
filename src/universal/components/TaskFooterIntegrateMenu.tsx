import {TaskFooterIntegrateMenu_task} from '__generated__/TaskFooterIntegrateMenu_task.graphql'
import {TaskFooterIntegrateMenu_viewer} from '__generated__/TaskFooterIntegrateMenu_viewer.graphql'
import React from 'react'
import styled from 'react-emotion'
import {createFragmentContainer, graphql} from 'react-relay'
import Icon from 'universal/components/Icon'
import Menu from 'universal/components/Menu'
import MenuItem from 'universal/components/MenuItem'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import TaskFooterIntegrateMenuSearch from 'universal/components/TaskFooterIntegrateMenuSearch'
import TaskFooterIntegrateMenuSuggestions from 'universal/components/TaskFooterIntegrateMenuSuggestions'
import {PALETTE} from 'universal/styles/paletteV2'
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

const TaskFooterIntegrateMenu = (props: Props) => {
  const {closePortal, mutationProps, viewer} = props
  // const {teamId} = task
  // const {suggestedIntegrations} = viewer
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
      <TaskFooterIntegrateMenuSuggestions
        closePortal={closePortal}
        mutationProps={mutationProps}
        viewer={viewer}
      />
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
      ...TaskFooterIntegrateMenuSuggestions_viewer
      suggestedIntegrations(teamId: $teamId) {
        service
        ... on SuggestedIntegrationJira {
          cloudId
          projectKey
          projectName
        }
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
