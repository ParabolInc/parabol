import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {
  SlackNotificationEventEnum,
  UpdateTeamNotificationSettingMutation as TUpdateTeamNotificationMutation
} from '../__generated__/UpdateTeamNotificationSettingMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment UpdateTeamNotificationSettingMutation_settings on UpdateTeamNotificationSettingSuccess {
    teamNotificationSettings {
      id
      events
    }
  }
`

const mutation = graphql`
  mutation UpdateTeamNotificationSettingMutation(
    $id: ID!
    $event: SlackNotificationEventEnum!
    $isEnabled: Boolean!
  ) {
    updateTeamNotificationSetting(id: $id, event: $event, isEnabled: $isEnabled) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...UpdateTeamNotificationSettingMutation_settings @relay(mask: false)
    }
  }
`

const UpdateTeamNotificationMutation: StandardMutation<TUpdateTeamNotificationMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TUpdateTeamNotificationMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {id, event, isEnabled} = variables
      const settings = store.get(id)
      if (!settings) return
      const enabledEvents = settings.getValue('events') as SlackNotificationEventEnum[]
      if (!enabledEvents) return
      const newEvents = isEnabled
        ? [...enabledEvents, event]
        : enabledEvents.filter((enabledEvent) => enabledEvent !== event)
      settings.setValue(newEvents, 'events')
    },
    onCompleted,
    onError
  })
}

export default UpdateTeamNotificationMutation
