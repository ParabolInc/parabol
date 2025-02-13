import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import {
  SlackNotificationEventEnum,
  SetNotificationSettingMutation as TSetSlackNotificationMutation
} from '../__generated__/SetNotificationSettingMutation.graphql'
import {StandardMutation} from '../types/relayMutations'

graphql`
  fragment SetNotificationSettingMutation_auth on SetNotificationSettingSuccess {
    auth {
      id
      events
    }
  }
`

const mutation = graphql`
  mutation SetNotificationSettingMutation(
    $authId: ID!
    $event: SlackNotificationEventEnum!
    $isEnabled: Boolean!
  ) {
    setNotificationSetting(authId: $authId, event: $event, isEnabled: $isEnabled) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetNotificationSettingMutation_auth @relay(mask: false)
    }
  }
`

const SetSlackNotificationMutation: StandardMutation<TSetSlackNotificationMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetSlackNotificationMutation>(atmosphere, {
    mutation,
    variables,
    optimisticUpdater: (store) => {
      const {authId, event, isEnabled} = variables
      const auth = store.get(authId)
      if (!auth) return
      const enabledEvents = auth.getValue('events') as SlackNotificationEventEnum[]
      if (!enabledEvents) return
      const newEvents = isEnabled
        ? [...enabledEvents, event]
        : enabledEvents.filter((enabledEvent) => enabledEvent !== event)
      auth.setValue(newEvents, 'events')
    },
    onCompleted,
    onError
  })
}

export default SetSlackNotificationMutation
