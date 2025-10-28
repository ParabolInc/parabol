import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'relay-runtime'
import type {useMeetingMemberAvatars_meeting$key} from '../__generated__/useMeetingMemberAvatars_meeting.graphql'
import useAtmosphere from './useAtmosphere'
import {useConnectedMeetingMembers} from './useConnectedMeetingMembers'

const useMeetingMemberAvatars = (meetingRef: useMeetingMemberAvatars_meeting$key) => {
  const atmosphere = useAtmosphere()
  const meeting = readInlineData(
    graphql`
      fragment useMeetingMemberAvatars_meeting on NewMeeting @inline {
        id
        meetingMembers {
          id
          isConnectedAt
          user {
            ...AvatarList_users
            id
          }
        }
      }
    `,
    meetingRef
  )
  const {viewerId} = atmosphere
  const {id: meetingId, meetingMembers} = meeting
  useConnectedMeetingMembers(meetingId, false)
  const connectedMeetingMembers = useMemo(() => {
    return meetingMembers
      .filter((mm) => mm.isConnectedAt)
      .sort((a, b) => (a.id === viewerId ? -1 : a.isConnectedAt! < b.isConnectedAt! ? -1 : 1))
      .map(({user}) => user)
  }, [meetingMembers])
  return connectedMeetingMembers
}

export default useMeetingMemberAvatars
