import {DataLoaderWorker} from '../../graphql'

const isStartMeetingLocked = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const team = await dataLoader.get('teams').loadNonNull(teamId)
  const {isPaid, lockMessageHTML} = team
  if (isPaid) return null
  return lockMessageHTML
    ? 'Wow, you’re determined to use Parabol! That’s awesome! Do you want to keep sneaking over the gate, or walk through the door with our Sales team?'
    : 'Sorry! We are unable to start your meeting because your team has an overdue payment'
}

export default isStartMeetingLocked
