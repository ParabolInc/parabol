import {DataLoaderWorker} from '../../graphql'
import canAccessAI from './canAccessAI'

const generateWholeMeetingSentimentScore = async (
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  const [meeting, reflections] = await Promise.all([
    dataLoader.get('newMeetings').loadNonNull(meetingId),
    dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  ])
  const team = await dataLoader.get('teams').loadNonNull(meeting.teamId)
  const isAIAvailable = await canAccessAI(team, dataLoader)
  if (!isAIAvailable || reflections.length === 0) return undefined
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
