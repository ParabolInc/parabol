import getRethink from '../../../database/rethinkDriver'
import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'
import {DataLoaderWorker} from '../../graphql'

const getBotId = async (videoMeetingURL: string) => {
  const manager = new RecallAIServerManager()
  const botId = await manager.createBot(videoMeetingURL)
  return botId
}

// if the videoMeetingURL was added in the settings, it'll be undefined here
// if it's added in the Discuss phase, we'll need to include it here
const addRecallBot = async (
  teamId: string,
  videoURL: undefined | string,
  dataLoader: DataLoaderWorker
) => {
  const r = await getRethink()
  const settings = (await dataLoader
    .get('meetingSettingsByType')
    .load({teamId, meetingType: 'retrospective'})) as MeetingSettingsRetrospective
  const {id: settingsId} = settings
  const videoMeetingURL = videoURL || settings.videoMeetingURL
  if (!videoMeetingURL) return
  const recallBotId = await getBotId(videoMeetingURL)
  await r.table('MeetingSettings').get(settingsId).update({recallBotId, videoMeetingURL}).run()
  return settingsId
}

export default addRecallBot
