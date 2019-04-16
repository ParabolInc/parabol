import React from 'react'
import {createFragmentContainer, graphql} from 'react-relay'

interface Props {
  closePortal: () => void
  viewer: TaskFooterIntegrateMenuSuggestions_viewer
}

const serviceToMenuItemLookup = [
  [IService.atlassian]: SuggestedIntegrationJiraMenuItem
]
const TaskFooterIntegrateMenuSuggestions = (props: Props) => {
  const {closePortal, viewer} = props
  const {suggestedIntegrations} = viewer

  // suggested integrations
  // add a new one
  // search
  // search results
  return suggestedIntegrations.map((suggestedIntegration) => {
    const {service} = suggestedIntegration
    const MenuItem = serviceToMenuItemLookup[service]
    if (!MenuItem) return null
    return <MenuItem suggestedIntegration={suggestedIntegration}/>
  })
}

export default createFragmentContainer(
  TaskFooterIntegrateMenuSuggestions,
  graphql`
    fragment TaskFooterIntegrateMenuSuggestions_viewer on User {
      integrations(teamId: $teamId) {
        id
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
  `
)
