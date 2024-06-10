import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {AutogroupMutation as TAutogroupMutation} from '../__generated__/AutogroupMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment AutogroupMutation_meeting on AutogroupSuccess {
    meeting {
      id
      resetReflectionGroups {
        groupTitle
      }
      reflectionGroups {
        id
        title
        reflections {
          id
          plaintextContent
        }
      }
    }
  }
`

const mutation = graphql`
  mutation AutogroupMutation($meetingId: ID!) {
    autogroup(meetingId: $meetingId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...AutogroupMutation_meeting @relay(mask: false)
    }
  }
`

const AutogroupMutation: StandardMutation<TAutogroupMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TAutogroupMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AutogroupMutation
