import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {CreateVideoMeetingMutation as TCreateVideoMeetingMutation} from '../__generated__/CreateVideoMeetingMutation.graphql'

graphql`
  fragment CreateVideoMeetingMutation_meeting on CreateVideoMeetingSuccess {
    meeting {
      id
      videoMeetingUrl
    }
  }
`

const mutation = graphql`
  mutation CreateVideoMeetingMutation(
    $service: IntegrationProviderServiceEnum!
    $meetingId: ID!
  ) {
    createVideoMeeting(
      service: $service
      meetingId: $meetingId
    ) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...CreateVideoMeetingMutation_meeting @relay(mask: false)
    }
  }
`

const CreateVideoMeetingMutation: StandardMutation<TCreateVideoMeetingMutation> = (
  atmosphere,
  variables,
  {onCompleted, onError}
) => {
  return commitMutation<TCreateVideoMeetingMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default CreateVideoMeetingMutation
