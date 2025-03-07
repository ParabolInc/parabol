import graphql from 'babel-plugin-relay/macro'
import {useCallback} from 'react'
import {useMutation} from 'react-relay'
import {useLinkTeamMutation} from '../__generated__/useLinkTeamMutation.graphql'
import {useCurrentChannel} from './useCurrentChannel'

graphql`
  fragment useLinkTeam_success on LinkMattermostChannelSuccess {
    teamId
    linkedChannels
  }
`

export const useLinkTeam = () => {
  const currentChannel = useCurrentChannel()

  const [mutation, isLoading] = useMutation<useLinkTeamMutation>(graphql`
    mutation useLinkTeamMutation($teamId: ID!, $channelId: ID!) {
      linkMattermostChannel(teamId: $teamId, channelId: $channelId) {
        ... on ErrorPayload {
          error {
            message
          }
        }
        ...useLinkTeam_success
      }
    }
  `)

  const linkTeam = useCallback(
    async (teamId: string) => {
      if (!currentChannel) {
        return
      }
      if (isLoading) {
        return
      }
      return new Promise((resolve, reject) =>
        mutation({
          variables: {
            teamId,
            channelId: currentChannel.id
          },
          updater: (store) => {
            const payload = store.getRootField('linkMattermostChannel')
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
          },
          onCompleted: (data) => {
            if (data.linkMattermostChannel?.error) {
              reject(data.linkMattermostChannel.error.message)
            }
            resolve(data)
          },
          onError: (error) => reject(error)
        })
      )
    },
    [currentChannel, mutation, isLoading]
  )

  return [linkTeam, isLoading] as const
}
