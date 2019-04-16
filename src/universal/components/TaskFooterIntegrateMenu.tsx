import {TaskFooterIntegrateMenu_task} from '__generated__/TaskFooterIntegrateMenu_task.graphql'
import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import AddToGitHubMenuItem from 'universal/components/AddToGitHubMenuItem'
import Menu from 'universal/components/Menu'
import MenuItemHR from 'universal/components/MenuItemHR'

interface Props {
  closePortal: () => void
  task: TaskFooterIntegrateMenu_task
}

const TaskFooterIntegrateMenu = (props: Props) => {
  const {closePortal, task, viewer} = props
  const {teamId} = task
  const {suggestedIntegrations} = viewer
  const hasJira = suggestedIntegrations.some((integration) => integration.service === IService.atlassian)
  const hasGitHub = suggestedIntegrations.some((integration) => integration.service === IService.Github)
  const hasAllProviders = hasJira && hasGitHub
  // suggested integrations
  // add a new one
  // search
  // search results
  return (
    <Menu ariaLabel={'Export the task'} closePortal={closePortal}>
      <TaskFooterIntegrateMenuSuggestions/>
      {!hasGitHub && <AddToGitHubMenuItem teamId={teamId} />}
      {!hasAllProviders && <MenuItemHR/>}
    </Menu>
  )
}

export default createFragmentContainer(
  TaskFooterIntegrateMenu,
  graphql`
    fragment TaskFooterIntegrateMenu_viewer on User {
      integrations(teamId: $teamId) {
        service
        ... on GitHubIntegrationItem {
          nameWithOwner
        }
        ... on JiraIntegrationItem {
          cloudId
          projectId
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
