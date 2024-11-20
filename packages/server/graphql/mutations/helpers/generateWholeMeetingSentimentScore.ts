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
  const hasNoAISummary = await dataLoader
    .get('featureFlagByOwnerId')
    .load({ownerId: facilitator.id, featureName: 'noAISummary'})
  if (hasNoAISummary || reflections.length === 0) return undefined
  const reflectionsWithSentimentScores = reflections.filter(
    ({sentimentScore}) => sentimentScore !== undefined
  )
  return reflectionsWithSentimentScores.length === 0
    ? undefined
    : reflectionsWithSentimentScores.reduce(
        (_prev, reflection) => _prev + reflection.sentimentScore!,
        0.0
      ) / reflectionsWithSentimentScores.length
}

export default generateWholeMeetingSentimentScore
