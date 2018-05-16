import {commitMutation} from 'react-relay'

graphql`
  fragment AutoGroupReflectionsMutation_team on AutoGroupReflectionsPayload {
    meeting {
      id
      nextAutoGroupThreshold
      reflectionGroups {
        ...CompleteReflectionGroupFrag @relay(mask: false)
        reflections {
          id
          reflectionGroupId
          retroReflectionGroup {
            id
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation AutoGroupReflectionsMutation($meetingId: ID!, $groupingThreshold: Float!) {
    autoGroupReflections(meetingId: $meetingId, groupingThreshold: $groupingThreshold) {
      ...AutoGroupReflectionsMutation_team @relay(mask: false)
    }
  }
`

const AutoGroupReflectionsMutation = (atmosphere, variables, onError, onCompleted) => {
  return commitMutation(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default AutoGroupReflectionsMutation
