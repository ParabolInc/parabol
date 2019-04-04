import {AddAtlassianProjectMutation} from '__generated__/AddAtlassianProjectMutation.graphql'
import {commitMutation, graphql} from 'react-relay'
import {Disposable} from 'relay-runtime'
import {IAddAtlassianProjectOnMutationArguments} from '../types/graphql'
import {LocalHandlers} from '../types/relayMutations'

graphql`
  fragment AddAtlassianProjectMutation_team on AddAtlassianProjectPayload {
    team {
      ...JiraAvailableProjectsMenu_team
    }
  }
`

const mutation = graphql`
  mutation AddAtlassianProjectMutation($atlassianProjectId: ID!, $cloudId: ID!, $teamId: ID!) {
    addAtlassianProject(
      atlassianProjectId: $atlassianProjectId
      cloudId: $cloudId
      teamId: $teamId
    ) {
      error {
        message
      }
      ...AddAtlassianProjectMutation_team @relay(mask: false)
    }
  }
`

const AddAtlassianProjectMutation = (
  atmosphere,
  variables: IAddAtlassianProjectOnMutationArguments,
  {onError, onCompleted}: LocalHandlers
): Disposable => {
  return commitMutation<AddAtlassianProjectMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AddAtlassianProjectMutation
