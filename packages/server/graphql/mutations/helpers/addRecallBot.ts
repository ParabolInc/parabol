import getKysely from '../../../postgres/getKysely'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'

const getBotId = async (videoMeetingURL: string) => {
  const manager = new RecallAIServerManager()
  const botId = await manager.createBot(videoMeetingURL)
  return botId
}

const addRecallBot = async (meetingId: string, videoMeetingURL: string) => {
  const recallBotId = (await getBotId(videoMeetingURL)) ?? undefined
  await getKysely()
    .updateTable('NewMeeting')
    .set({recallBotId, videoMeetingURL})
    .where('id', '=', meetingId)
    .execute()
}

export default addRecallBot
