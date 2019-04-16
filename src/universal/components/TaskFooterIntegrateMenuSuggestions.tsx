import {TaskFooterIntegrateMenuSuggestions_viewer} from '__generated__/TaskFooterIntegrateMenuSuggestions_viewer.graphql'
import React, {forwardRef} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import SuggestedIntegrationGitHubMenuItem from 'universal/components/SuggestedIntegrationGitHubMenuItem'
import SuggestedIntegrationJiraMenuItem from 'universal/components/SuggestedIntegrationJiraMenuItem'
import {TaskServiceEnum} from 'universal/types/graphql'
import {MenuMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props {
  closePortal: () => void
  mutationProps: MenuMutationProps
  viewer: TaskFooterIntegrateMenuSuggestions_viewer
}

const serviceToMenuItemLookup = {
  [TaskServiceEnum.jira]: SuggestedIntegrationJiraMenuItem,
  [TaskServiceEnum.github]: SuggestedIntegrationGitHubMenuItem
}

const TaskFooterIntegrateMenuSuggestions = forwardRef((props: Props, ref: any) => {
  const {closePortal, mutationProps, viewer} = props
  const {suggestedIntegrations} = viewer

  return (
    <>
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
            ref={ref}
            closePortal={closePortal}
            suggestedIntegration={suggestedIntegration as any}
          />
        )
      })}
    </>
  )
})

export default createFragmentContainer(
  TaskFooterIntegrateMenuSuggestions,
  graphql`
    fragment TaskFooterIntegrateMenuSuggestions_viewer on User {
      suggestedIntegrations(teamId: $teamId) {
        id
        service
        ...SuggestedIntegrationJiraMenuItem_suggestedIntegration
        ...SuggestedIntegrationGitHubMenuItem_suggestedIntegration
      }
    }
  `
)
