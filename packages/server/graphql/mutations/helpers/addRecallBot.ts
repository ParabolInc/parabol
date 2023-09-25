import getRethink from '../../../database/rethinkDriver'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'
import {DataLoaderWorker} from '../../graphql'

const getBotId = async (videoMeetingURL: string) => {
  const manager = new RecallAIServerManager()
  const botId = await manager.createBot(videoMeetingURL)
  return botId
}

const addRecallBot = async (meetingId: string, videoURL: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const meeting = (await dataLoader.get('newMeetings').load(meetingId)) as MeetingRetrospective
  const videoMeetingURL = videoURL || meeting.videoMeetingURL
  if (!videoMeetingURL) return
  const recallBotId = (await getBotId(videoMeetingURL)) ?? undefined
  console.log('🚀 ~ recallBotId:', recallBotId)

  await r.table('NewMeeting').get(meetingId).update({recallBotId, videoMeetingURL}).run()
  return true
}

export default addRecallBot
