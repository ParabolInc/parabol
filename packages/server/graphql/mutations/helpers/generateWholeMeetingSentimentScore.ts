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
  if (!facilitator.featureFlags.includes('aiSummary')) return undefined
  return (
    reflections.reduce((_prev, reflection) => _prev + reflection.sentimentScore, 0.0) /
    reflections.length
  )
}

export default generateWholeMeetingSentimentScore
