import graphql from 'babel-plugin-relay/macro'
import {useCallback} from 'react'
import {useMutation} from 'react-relay'
import {useUnlinkTeamMutation} from '../__generated__/useUnlinkTeamMutation.graphql'
import {useCurrentChannel} from './useCurrentChannel'

graphql`
  fragment useUnlinkTeam_success on UnlinkMattermostChannelSuccess {
    teamId
    linkedChannels
  }
`

export const useUnlinkTeam = () => {
  const currentChannel = useCurrentChannel()

  const [mutation, isLoading] = useMutation<useUnlinkTeamMutation>(graphql`
    mutation useUnlinkTeamMutation($teamId: ID!, $channelId: ID!) {
      unlinkMattermostChannel(teamId: $teamId, channelId: $channelId) {
        ... on ErrorPayload {
          error {
            message
          }
        }
        ...useUnlinkTeam_success
      }
    }
  `)

  const unlinkTeam = useCallback(
    async (teamId: string) => {
      if (!currentChannel) {
        return
      }
      if (isLoading) {
        return
      }
      return mutation({
        variables: {
          teamId,
          channelId: currentChannel.id
        },
        updater: (store) => {
          const payload = store.getRootField('unlinkMattermostChannel')
          if (!payload) return
          const teamId = payload.getValue('teamId') as string
          const linkedChannels = payload.getValue('linkedChannels')
          const team = store.get(teamId)
          if (!team || !linkedChannels) return
          team
            .getLinkedRecord('viewerTeamMember')
            ?.getLinkedRecord('integrations')
            ?.getLinkedRecord('mattermost')
            ?.setValue(linkedChannels, 'linkedChannels')
        }
      })
    },
    [currentChannel, mutation, isLoading]
  )

  return unlinkTeam
}
