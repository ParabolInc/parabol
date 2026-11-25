import {TeamHealthDemo} from '../../modules/demo/teamHealthDemoIds'
import {RetroDemo} from '../../types/constEnums'

// the path that every url of a meeting's stages starts with
const getMeetingPathRoot = (meetingId: string) => {
  if (meetingId === RetroDemo.MEETING_ID) return '/retrospective-demo'
  if (meetingId === TeamHealthDemo.MEETING_ID) return TeamHealthDemo.ROUTE
  return `/meet/${meetingId}`
}

export default getMeetingPathRoot
