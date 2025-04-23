import graphql from 'babel-plugin-relay/macro'
import {Client4} from 'mattermost-redux/client'
import {Post} from 'mattermost-redux/types/posts'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {useCallback} from 'react'
import {useFragment} from 'react-relay'
import {useInviteToTeam_team$key} from '../__generated__/useInviteToTeam_team.graphql'
import {useConfig} from './useConfig'
import {useCurrentChannel} from './useCurrentChannel'
import useMassInvitationToken from './useMassInvitationToken'

export const useInviteToTeam = (teamRef?: useInviteToTeam_team$key) => {
  const team = useFragment(
    graphql`
      fragment useInviteToTeam_team on Team {
        id
        name
      }
    `,
    teamRef
  )

  const {id: teamId, name: teamName} = team || {}
  const getToken = useMassInvitationToken({teamId})
  const config = useConfig()
  const {parabolUrl} = config
  const channel = useCurrentChannel()

  const invite = useCallback(async () => {
    if (!channel) {
      return
    }
    const token = await getToken()
    if (!token) {
      return
    }

    const inviteUrl = `${parabolUrl}/invitation-link/${token}`
    const props = {
      attachments: [
        {
          //title: `${userName} invited you to join a team in [Parabol](${teamUrl})`,
          title: `You’re invited to join a team in Parabol.`,
          fallback: `Join the team ${teamName} in Parabol`,
          color: PALETTE.GRAPE_500,
          fields: [
            {short: true, title: 'Team', value: teamName},
            {
              short: false,
              value: `
| [Join Team](${inviteUrl}) |
|:--------------------:|
||`
            }
          ]
        }
      ]
    }
    Client4.createPost({
      channel_id: channel.id,
      props
    } as Partial<Post> as Post)
  }, [channel, getToken, teamName, parabolUrl])

  return invite
}
