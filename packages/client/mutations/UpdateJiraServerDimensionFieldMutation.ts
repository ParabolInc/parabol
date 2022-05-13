import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateJiraServerDimensionFieldMutation as TUpdateJiraServerDimensionFieldMutation} from '../__generated__/UpdateJiraServerDimensionFieldMutation.graphql'

graphql`
  fragment UpdateJiraServerDimensionFieldMutation_team on UpdateDimensionFieldSuccess {
    meeting {
      phases {
        ... on EstimatePhase {
          stages {
            serviceField {
              name
              type
            }
          }
        }
      }
    }
    team {
      integrations {
        atlassian {
          jiraDimensionFields {
            cloudId
            projectKey
            dimensionName
            fieldName
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation UpdateJiraServerDimensionFieldMutation(
    $dimensionName: String!
    $issueType: ID!
    $fieldName: ID!
    $projectId: ID!
    $meetingId: ID!
  ) {
    updateJiraServerDimensionField(
      dimensionName: $dimensionName
      issueType: $issueType
      fieldName: $fieldName
      projectId: $projectId
      meetingId: $meetingId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateJiraServerDimensionFieldMutation_team @relay(mask: false)
    }
  }
`

const UpdateJiraServerDimensionFieldMutation: StandardMutation<
  TUpdateJiraServerDimensionFieldMutation
> = (atmosphere, variables, {onCompleted, onError}) => {
  return commitMutation<TUpdateJiraServerDimensionFieldMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpdateJiraServerDimensionFieldMutation
