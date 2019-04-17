import {SuggestedIntegrationJiraMenuItem_suggestedIntegration} from '__generated__/SuggestedIntegrationJiraMenuItem_suggestedIntegration.graphql'
import React, {forwardRef} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import JiraSVG from 'universal/components/JiraSVG'
import MenuItem from 'universal/components/MenuItem'
import MenuItemComponentAvatar from 'universal/components/MenuItemComponentAvatar'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import TypeAheadLabel from 'universal/components/TypeAheadLabel'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import CreateJiraIssueMutation from 'universal/mutations/CreateJiraIssueMutation'
import {WithMutationProps} from 'universal/utils/relay/withMutationProps'

interface Props {
  closePortal: () => void
  suggestedIntegration: SuggestedIntegrationJiraMenuItem_suggestedIntegration
  taskId: string
  submitMutation: WithMutationProps['submitMutation']
  onError: WithMutationProps['onError']
  onCompleted: WithMutationProps['onCompleted']
  query: string
}

const SuggestedIntegrationJiraMenuItem = forwardRef((props: Props, ref: any) => {
  const {suggestedIntegration, taskId, submitMutation, onError, onCompleted, query} = props
  const {cloudId, projectKey, projectName} = suggestedIntegration
  const atmosphere = useAtmosphere()
  return (
    <MenuItem
      ref={ref}
      label={
        <MenuItemLabel>
          <MenuItemComponentAvatar>
            <JiraSVG />
          </MenuItemComponentAvatar>
          <TypeAheadLabel query={query} label={projectName} />
        </MenuItemLabel>
      }
      onClick={() => {
        const variables = {cloudId, projectKey, taskId}
        submitMutation()
        CreateJiraIssueMutation(atmosphere, variables, {onError, onCompleted})
      }}
    />
  )
})

export default createFragmentContainer(
  SuggestedIntegrationJiraMenuItem,
  graphql`
    fragment SuggestedIntegrationJiraMenuItem_suggestedIntegration on SuggestedIntegrationJira {
      cloudId
      projectKey
      projectName
    }
  `
)
