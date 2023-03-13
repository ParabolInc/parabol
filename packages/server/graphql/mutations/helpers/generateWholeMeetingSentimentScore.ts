import {DataLoaderWorker} from '../../graphql'

const generateWholeMeetingSentimentScore = async (
  meetingId: string,
  facilitatorUserId: string,
  dataLoader: DataLoaderWorker
) => {
  const [facilitator, reflections] = await Promise.all([
    dataLoader.get('users').loadNonNull(facilitatorUserId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  if (!facilitator.featureFlags.includes('aiSummary') || reflections.length === 0) return undefined
  return (
    reflections
      .filter(({sentimentScore}) => sentimentScore !== undefined)
      .reduce((_prev, reflection) => _prev + reflection.sentimentScore!, 0.0) / reflections.length
  )
}

export default generateWholeMeetingSentimentScore
