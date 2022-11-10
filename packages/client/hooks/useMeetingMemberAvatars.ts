import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {readInlineData} from 'relay-runtime'
import {useMeetingMemberAvatars_meeting$key} from '../__generated__/useMeetingMemberAvatars_meeting.graphql'
import useAtmosphere from './useAtmosphere'

const useMeetingMemberAvatars = (meetingRef: useMeetingMemberAvatars_meeting$key) => {
  const atmosphere = useAtmosphere()
  const meeting = readInlineData(
    graphql`
      fragment useMeetingMemberAvatars_meeting on NewMeeting @inline {
        id
        meetingMembers {
          id
          user {
            ...AvatarList_users
            id
            isConnected
            lastSeenAt
            lastSeenAtURLs
          }
        }
      }
    `,
    meetingRef
  )
  const {viewerId} = atmosphere
  const {id: meetingId, meetingMembers} = meeting
  const connectedMeetingMembers = useMemo(() => {
    return meetingMembers
      .map(({user}) => user)
      .filter((user) => {
        return user.lastSeenAtURLs?.includes(`/meet/${meetingId}`) && user.isConnected
      })
      .sort((a, b) => (a.id === viewerId ? -1 : a.lastSeenAt < b.lastSeenAt ? -1 : 1))
  }, [meetingMembers])
  return connectedMeetingMembers
}

export default useMeetingMemberAvatars
