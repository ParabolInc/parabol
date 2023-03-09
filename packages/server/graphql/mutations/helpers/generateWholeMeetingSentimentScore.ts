import {DataLoaderWorker} from '../../graphql'

const generateWholeMeetingSentimentScore = async (
  meetingId: string,
  dataLoader: DataLoaderWorker
) => {
  const reflections = await dataLoader.get('retroReflectionsByMeetingId').load(meetingId)
  return (
    reflections.reduce((_prev, reflection) => _prev + reflection.sentimentScore, 0.0) /
    reflections.length
  )
}

export default generateWholeMeetingSentimentScore
