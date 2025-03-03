import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {
  SlackNotificationEventEnum,
  SetTeamNotificationSettingMutation as TSetTeamNotificationSettingMutation
} from '../__generated__/SetTeamNotificationSettingMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment SetTeamNotificationSettingMutation_settings on SetTeamNotificationSettingSuccess {
    teamNotificationSettings {
      id
      events
    }
  }
`

const mutation = graphql`
  mutation SetTeamNotificationSettingMutation(
    $id: ID!
    $event: SlackNotificationEventEnum!
    $isEnabled: Boolean!
  ) {
    setTeamNotificationSetting(id: $id, event: $event, isEnabled: $isEnabled) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetTeamNotificationSettingMutation_settings @relay(mask: false)
    }
  }
`

const SetTeamNotificationMutation: StandardMutation<TSetTeamNotificationSettingMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetTeamNotificationSettingMutation>(atmosphere, {
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

export default SetTeamNotificationMutation
