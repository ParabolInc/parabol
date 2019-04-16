import {createFragmentContainer, graphql} from 'react-relay'
import MenuItemLabel from 'universal/components/MenuItemLabel'
import MenuItem from 'universal/components/MenuItem'
import useAtmosphere from 'universal/hooks/useAtmosphere'
import React from 'react'

interface Props {
  suggestedIntegration: SuggestedIntegrationJiraMenuItem_suggestedIntegration
}

const SuggestedIntegrationJiraMenuItem = (props: Props) => {
  const {suggestedIntegration} = props
  const atmosphere = useAtmosphere()
  return (
    <MenuItem label={<MenuItemLabel>

    </MenuItemLabel>
    } onClick={() => {
      const variables = {cloudId, projectKey, taskId}
      CreateJiraIssueMutation(atmosphere, variables)
    }
    }/>
  )
}

export default createFragmentContainer(
  SuggestedIntegrationJiraMenuItem,
  graphql`
  fragment SuggestedIntegrationJiraMenuItem_suggestedIntegration on SuggestedIntegrationJira {
    cloudId
    projectKey
    projectName
  }`
)