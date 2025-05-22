export type SetMeetingMusicSuccessSource = {
  meetingId: string
  trackSrc: string | null
  isPlaying: boolean
  timestamp: number | null
}

// Since we don't have a resolver that depends on the meeting field,
// we can just use an empty object for the resolvers
const SetMeetingMusicSuccess = {}

export default SetMeetingMusicSuccess
