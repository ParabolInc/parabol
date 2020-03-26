import useAtmosphere from 'hooks/useAtmosphere'
import useRouter from 'hooks/useRouter'
import ms from 'ms'
import {useEffect, useState} from 'react'
import {TopBarMeetingsActiveMeetings} from '__generated__/TopBarMeetingsActiveMeetings.graphql'
import fromTeamMemberId from 'utils/relay/fromTeamMemberId'

const useSnacksForNewMeetings = (meetings: TopBarMeetingsActiveMeetings['activeMeetings']) => {
  const [dismissedMeetingIds] = useState(() => new Set<string>())
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  useEffect(() => {
    const fiveMinsAgo = new Date(Date.now() - ms('5m'))
    const sortedMeetings = meetings
      .filter(
        (meeting) =>
          !dismissedMeetingIds.has(meeting.id) && new Date(meeting.createdAt) > fiveMinsAgo
      )
      .sort((a, b) => (new Date(a.createdAt) < new Date(b.createdAt) ? -1 : 1))
    const [snackedMeeting] = sortedMeetings
    if (!snackedMeeting) return
    const {id: meetingId, name: meetingName, facilitator} = snackedMeeting
    const {id: facilitatorId, preferredName} = facilitator
    const {viewerId} = atmosphere
    const {userId: facilitatorUserId} = fromTeamMemberId(facilitatorId)
    const isInit = facilitatorUserId === viewerId
    const name = isInit ? 'You' : preferredName
    atmosphere.eventEmitter.emit('addSnackbar', {
      autoDismiss: 5,
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
