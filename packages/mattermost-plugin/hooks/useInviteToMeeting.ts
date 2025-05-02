import graphql from 'babel-plugin-relay/macro'
import {Client4} from 'mattermost-redux/client'
import {Post} from 'mattermost-redux/types/posts'
import {PALETTE} from 'parabol-client/styles/paletteV3'
import {useCallback} from 'react'
import {useFragment} from 'react-relay'
import {
  MeetingTypeEnum,
  useInviteToMeeting_meeting$key
} from '../__generated__/useInviteToMeeting_meeting.graphql'
import {useConfig} from './useConfig'
import {useCurrentChannel} from './useCurrentChannel'
import useMassInvitationToken from './useMassInvitationToken'

const MeetingTypeToReadable = {
  action: 'Team Check-in',
  poker: 'Sprint Poker',
  retrospective: 'Retrospective',
  teamPrompt: 'Standup'
} satisfies Record<MeetingTypeEnum, string>

export const useInviteToMeeting = (meetingRef?: useInviteToMeeting_meeting$key) => {
  const meeting = useFragment(
    graphql`
      fragment useInviteToMeeting_meeting on NewMeeting {
        id
        name
        meetingType
        team {
          id
          name
        }
      }
    `,
    meetingRef
  )

  const {id: meetingId, team, name: meetingName, meetingType} = meeting || {}
  const {id: teamId, name: teamName} = team || {}
  const getToken = useMassInvitationToken({teamId, meetingId})
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
    const readableMeetingType = MeetingTypeToReadable[meetingType!]
    const props = {
      attachments: [
        {
          fallback: `Join the meeting ${meetingName} in Parabol`,
          title: `You’re invited to join a ${readableMeetingType} meeting in Parabol.`,
          color: PALETTE.GRAPE_500,
          fields: [
            {
              short: true,
              title: 'Team',
              value: teamName
            },
            {
              short: true,
              title: 'Meeting',
              value: meetingName
            },
            {
              short: false,
              value: `
| [Join Meeting](${inviteUrl}) |
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
  }, [channel, getToken, meetingName, meetingType, parabolUrl, teamName])

  return invite
}
