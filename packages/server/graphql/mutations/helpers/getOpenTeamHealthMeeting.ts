import type {DataLoaderWorker} from '../../graphql'

const closesAt = ({scheduledEndTime}: {scheduledEndTime: Date | null}) =>
  scheduledEndTime?.getTime() ?? Number.POSITIVE_INFINITY

// the check a retro shows: the one it started while that is still open, else the team's open check
// that closes soonest. Nothing stops a one-off running beside a series, so there can be two
const getOpenTeamHealthMeeting = async (
  teamId: string,
  startedTeamHealthMeetingId: string | null | undefined,
  dataLoader: DataLoaderWorker
) => {
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const openChecks = activeMeetings.filter((meeting) => meeting.meetingType === 'teamHealth')
  const startedCheck = openChecks.find(({id}) => id === startedTeamHealthMeetingId)
  if (startedCheck) return startedCheck
  const [soonestCheck] = openChecks.sort(
    (a, b) => closesAt(a) - closesAt(b) || a.createdAt.getTime() - b.createdAt.getTime()
  )
  return soonestCheck ?? null
}

export default getOpenTeamHealthMeeting
