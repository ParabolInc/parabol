import ms from 'ms'
import {useEffect, useState} from 'react'
import useAtmosphere from '~/hooks/useAtmosphere'
import useRouter from '~/hooks/useRouter'
import fromTeamMemberId from '~/utils/relay/fromTeamMemberId'
import {TopBarMeetingsActiveMeetings} from '~/__generated__/TopBarMeetingsActiveMeetings.graphql'

const useSnacksForNewMeetings = (meetings: TopBarMeetingsActiveMeetings['activeMeetings']) => {
  const [dismissedMeetingIds] = useState(() => new Set<string>())
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useEffect(() => {
    const {viewerId} = atmosphere
    const fiveMinsAgo = new Date(Date.now() - ms('5m'))
    const fiveSecsAgo = new Date(Date.now() - ms('5s'))
    const sortedMeetings = meetings
      .filter(
        (meeting) => {
          if (dismissedMeetingIds.has(meeting.id)) return false
          const createdAt = new Date(meeting.createdAt)
          if (createdAt < fiveMinsAgo) return false
          const {userId: facilitatorUserId} = fromTeamMemberId(meeting.facilitator.id)
          if (facilitatorUserId === viewerId && createdAt > fiveSecsAgo) return false
          return true
        })
      .sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1))
    const [snackedMeeting] = sortedMeetings
    if (!snackedMeeting) return
    const {id: meetingId, name: meetingName, facilitator} = snackedMeeting
    const {id: facilitatorId, preferredName} = facilitator
    const {userId: facilitatorUserId} = fromTeamMemberId(facilitatorId)
    const isInit = facilitatorUserId === viewerId
    const name = isInit ? 'You' : preferredName
    atmosphere.eventEmitter.emit('addSnackbar', {
      autoDismiss: 15,
      key: `newMeeting:${meetingId}`,
      message: `${name} just started ${meetingName}`,
      onDismiss: () => {
        dismissedMeetingIds.add(meetingId)
      },
      action: {
        label: 'Join Now',
        callback: () => {
          history.push(`/meet/${meetingId}`)
        }
      }
    })
  }, [meetings.length])
}

export default useSnacksForNewMeetings
