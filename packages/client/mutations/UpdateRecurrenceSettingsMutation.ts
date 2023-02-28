import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {StandardMutation} from '../types/relayMutations'
import {UpdateRecurrenceSettingsMutation as TUpdateRecurrenceSettingsMutation} from '../__generated__/UpdateRecurrenceSettingsMutation.graphql'

graphql`
  fragment UpdateRecurrenceSettingsMutation_team on UpdateRecurrenceSettingsSuccess {
    meeting {
      id
      meetingSeriesId
      meetingSeries {
        id
        recurrenceRule
        duration
        cancelledAt
      }
      scheduledEndTime
    }
  }
`

const mutation = graphql`
  mutation UpdateRecurrenceSettingsMutation($meetingId: ID!, $recurrenceRule: RRule) {
    updateRecurrenceSettings(meetingId: $meetingId, recurrenceRule: $recurrenceRule) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateRecurrenceSettingsMutation_team @relay(mask: false)
    }
  }
`

const UpdateRecurrenceSettingsMutation: StandardMutation<TUpdateRecurrenceSettingsMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateRecurrenceSettingsMutation>(atmosphere, {
    mutation,
    variables,
    onCompleted,
    onError
  })
}

export default UpdateRecurrenceSettingsMutation
