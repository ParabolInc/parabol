import getRethink from '../../../database/rethinkDriver'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'

const getBotId = async (videoMeetingURL: string) => {
  const manager = new RecallAIServerManager()
  const botId = await manager.createBot(videoMeetingURL)
  return botId
}

const addRecallBot = async (meetingId: string, videoMeetingURL: string) => {
  const r = await getRethink()
  const recallBotId = (await getBotId(videoMeetingURL)) ?? undefined
  await r.table('NewMeeting').get(meetingId).update({recallBotId, videoMeetingURL}).run()
}

export default addRecallBot
