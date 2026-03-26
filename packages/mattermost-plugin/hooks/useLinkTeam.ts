import graphql from 'babel-plugin-relay/macro'
import {Client4} from 'mattermost-redux/client'
import {getConfig} from 'mattermost-redux/selectors/entities/general'
import type {useLinkTeamMutation} from 'parabol-client/__generated__/useLinkTeamMutation.graphql'
import {useCallback} from 'react'
import {useMutation} from 'react-relay'
import useAtmosphere from './useAtmosphere'
import {useCurrentChannel} from './useCurrentChannel'

graphql`
  fragment useLinkTeam_success on LinkMattermostChannelSuccess {
    teamId
    linkedChannels
  }
`

export const useLinkTeam = () => {
  const currentChannel = useCurrentChannel()
  const atmosphere = useAtmosphere()

  const [mutation, isLoading] = useMutation<useLinkTeamMutation>(graphql`
    mutation useLinkTeamMutation(
      $teamId: ID!
      $channelId: ID!
      $channelToken: String!
      $mattermostUrl: String!
    ) {
      linkMattermostChannel(
        teamId: $teamId
        channelId: $channelId
        channelToken: $channelToken
        mattermostUrl: $mattermostUrl
      ) {
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
      const mattermostUrl = getConfig(atmosphere.state.store.getState()).SiteURL ?? ''
      const linkRes = await fetch(
        `${atmosphere.state.serverUrl}/link?channelId=${currentChannel.id}`,
        Client4.getOptions({method: 'GET'})
      )
      const {channelToken} = await linkRes.json()
      return new Promise((resolve, reject) =>
        mutation({
          variables: {
            teamId,
            channelId: currentChannel.id,
            channelToken,
            mattermostUrl
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
    [currentChannel, mutation, isLoading, atmosphere]
  )

  return [linkTeam, isLoading] as const
}
