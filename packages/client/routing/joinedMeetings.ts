import type {PreloadedQuery} from 'react-relay'
import type {MeetingSelectorQuery} from '../__generated__/MeetingSelectorQuery.graphql'
import type Atmosphere from '../Atmosphere'
import type {NavigateFn} from '../types/relayMutations'
import type {QueryRefs} from './queryRefs'

interface JoinedMeeting {
  meetingId: string
  queryRef: Promise<PreloadedQuery<MeetingSelectorQuery>>
  leases: number
  leaveTimer?: number
  leave: () => void
}

export type JoinedMeetings = ReturnType<typeof createJoinedMeetings>

// One join per meeting: the meeting route's loader starts it, and the page holds it while it shows the meeting
export const createJoinedMeetings = (
  atmosphere: Atmosphere,
  queryRefs: QueryRefs,
  router: {navigate: NavigateFn}
) => {
  const meetings = new Map<string, JoinedMeeting>()

  const leave = (meeting: JoinedMeeting) => {
    if (meetings.get(meeting.meetingId) === meeting) meetings.delete(meeting.meetingId)
    meeting.leave()
  }

  // The subscription and the meeting query are too big for the entry bundle
  const start = (meetingId: string) => {
    let hasLeft = false
    let leaveJoin = () => {}
    const queryRef = import(/* webpackChunkName: 'joinMeeting' */ './joinMeeting').then(
      ({default: joinMeeting}) => {
        if (hasLeft) throw new Error(`Left meeting ${meetingId} before joining it`)
        const joined = joinMeeting(atmosphere, router, queryRefs, meetingId)
        leaveJoin = joined.leave
        return joined.queryRef
      }
    )
    const meeting: JoinedMeeting = {
      meetingId,
      queryRef,
      leases: 0,
      leave: () => {
        if (hasLeft) return
        hasLeft = true
        leaveJoin()
      }
    }
    meetings.set(meetingId, meeting)
    return meeting
  }

  // A navigation that ends before its page opens leaves the meeting it joined
  const join = async (meetingId: string, signal: AbortSignal) => {
    const meeting = meetings.get(meetingId) ?? start(meetingId)
    signal.addEventListener('abort', () => {
      if (meeting.leases === 0) leave(meeting)
    })
    try {
      return await meeting.queryRef
    } catch (error) {
      if (meeting.leases === 0) leave(meeting)
      throw error
    }
  }

  const lease = (meetingId: string) => {
    // a page that outlived its join, like one Suspense hid for a while, joins again without waiting for it
    const meeting = meetings.get(meetingId) ?? start(meetingId)
    meeting.queryRef.catch(() => {})
    window.clearTimeout(meeting.leaveTimer)
    meeting.leases++
    return () => {
      meeting.leases--
      if (meeting.leases > 0) return
      // StrictMode leases again in the same commit
      meeting.leaveTimer = window.setTimeout(() => leave(meeting))
    }
  }

  return {join, lease}
}
