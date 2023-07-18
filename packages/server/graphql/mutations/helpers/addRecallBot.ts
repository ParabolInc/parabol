import getRethink from '../../../database/rethinkDriver'
import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'
import {DataLoaderWorker} from '../../graphql'

const getBotId = async (videoMeetingURL: string) => {
  const manager = new RecallAIServerManager()
  const botId = await manager.createBot(videoMeetingURL)
  return botId
}

const addRecallBot = async (teamId: string, dataLoader: DataLoaderWorker) => {
  const r = await getRethink()
  const settings = (await dataLoader
    .get('meetingSettingsByType')
    .load({teamId, meetingType: 'retrospective'})) as MeetingSettingsRetrospective
  const {id: settingsId, videoMeetingURL} = settings
  if (!videoMeetingURL) return
  const recallBotId = await getBotId(videoMeetingURL)
  await r.table('MeetingSettings').get(settingsId).update({recallBotId}).run()
}

export default addRecallBot
