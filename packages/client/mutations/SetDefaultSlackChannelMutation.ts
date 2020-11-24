import graphql from 'babel-plugin-relay/macro'
import {commitMutation} from 'react-relay'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'
import {StandardMutation} from '../types/relayMutations'
import {SetDefaultSlackChannelMutation as TSetDefaultSlackChannelMutation} from '../__generated__/SetDefaultSlackChannelMutation.graphql'

graphql`
  fragment SetDefaultSlackChannelMutation_team on SetDefaultSlackChannelSuccess {
    teamMember {
      integrations {
        slack {
          notifications {
            channelId
          }
        }
      }
    }
  }
`

const mutation = graphql`
  mutation SetDefaultSlackChannelMutation($slackChannelId: ID!, $teamId: ID!) {
    setDefaultSlackChannel(slackChannelId: $slackChannelId, teamId: $teamId) {
      ... on ErrorPayload {
        error {
          message
        }
      }
      ...SetDefaultSlackChannelMutation_team @relay(mask: false)
    }
  }
`
export const setDefaultSlackChannelUpdater = (payload) => {
  const teamMember = payload.getLinkedRecord('teamMember')
  if (!teamMember) return
  const integrations = teamMember.getLinkedRecord('integrations')
  if (!integrations) return
  const slack = integrations.getLinkedRecord('slack')
  if (!slack) return
  const slackChannelId = payload.getValue('slackChannelId')
  slack.setValue(slackChannelId, 'defaultTeamChannelId')
}

const SetDefaultSlackChannelMutation: StandardMutation<TSetDefaultSlackChannelMutation> = (
  atmosphere,
  variables,
  {onError, onCompleted}
) => {
  return commitMutation<TSetDefaultSlackChannelMutation>(atmosphere, {
    mutation,
    variables,
    updater: (store) => {
      const {slackChannelId, teamId} = variables
      const payload = store.getRootField('setDefaultSlackChannel')
      if (!payload) return
      payload.setValue(teamId, 'teamId')
      payload.setValue(slackChannelId, 'slackChannelId')
      setDefaultSlackChannelUpdater(payload)
    },
    optimisticUpdater: (store) => {
      const {slackChannelId, teamId} = variables
      const {viewerId} = atmosphere
      const teamMemberId = toTeamMemberId(teamId, viewerId)
      const teamMember = store.get(teamMemberId)
      if (!teamMember) return
      const integrations = teamMember.getLinkedRecord('integrations')
      if (!integrations) return
      const slack = integrations.getLinkedRecord('slack')
      if (!slack) return
      slack.setValue(slackChannelId, 'defaultTeamChannelId')
    },
    onCompleted,
    onError
  })
}

export default SetDefaultSlackChannelMutation
