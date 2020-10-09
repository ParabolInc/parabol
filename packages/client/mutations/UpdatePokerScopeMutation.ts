import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdatePokerScopeMutation as TUpdatePokerScopeMutation} from '../__generated__/UpdatePokerScopeMutation.graphql'

graphql`
  fragment UpdatePokerScopeMutation_meeting on UpdatePokerScopeSuccess {
    meeting {
      phases {
        ...PokerSidebarEstimateSectionEstimatePhase
        ...on EstimatePhase {
          stages {
            id
            isNavigableByFacilitator
            service
            serviceTaskId
            sortOrder
            ...on EstimateStageJira {
              issue {
                id
                summary
              }
            }
            ... on EstimateStageParabol {
              task {
                id
                content
              }
            }
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation UpdatePokerScopeMutation($meetingId: ID!, $updates: [UpdatePokerScopeItemInput!]!) {
    updatePokerScope(meetingId: $meetingId, updates: $updates) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdatePokerScopeMutation_meeting @relay(mask: false)
    }
  }
`

const UpdatePokerScopeMutation: StandardMutation<TUpdatePokerScopeMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdatePokerScopeMutation>(atmosphere, {
    mutation,
    variables,
    // TODO: Add optimistic updater
    // optimisticUpdater: (store) => {
    // },
    onCompleted,
    onError
  })
}

export default UpdatePokerScopeMutation
