import type {DataLoaderWorker} from '../../graphql'

const closesAt = ({scheduledEndTime}: {scheduledEndTime: Date | null}) =>
  scheduledEndTime?.getTime() ?? Number.POSITIVE_INFINITY

// the team's open check that closes soonest. Nothing stops a one-off running beside a series, so
// there can be two
const getOpenTeamHealthMeeting = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const activeMeetings = await dataLoader.get('activeMeetingsByTeamId').load(teamId)
  const [soonestCheck] = activeMeetings
    .filter((meeting) => meeting.meetingType === 'teamHealth')
    .sort((a, b) => closesAt(a) - closesAt(b) || a.createdAt.getTime() - b.createdAt.getTime())
  return soonestCheck ?? null
}

export default getOpenTeamHealthMeeting
