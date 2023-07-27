import getRethink from '../../../database/rethinkDriver'
import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import {isTeamMember} from '../../../utils/authorization'
import RecallAIServerManager from '../../../utils/RecallAIServerManager'
import {MutationResolvers} from '../resolverTypes'

const addTranscriptionBot: MutationResolvers['addTranscriptionBot'] = async (
  _source,
  {teamId, videoMeetingURL},
  {authToken, dataLoader}
) => {
  if (!isTeamMember(authToken, teamId)) {
    return {error: {message: 'Not on team'}}
  }
  const r = await getRethink()

  const manager = new RecallAIServerManager()
  const recallBotId = await manager.createBot(videoMeetingURL)

  const settings = (await dataLoader
    .get('meetingSettingsByType')
    .load({teamId, meetingType: 'retrospective'})) as MeetingSettingsRetrospective
  await r.table('MeetingSettings').get(settings.id).update({recallBotId, videoMeetingURL}).run()

  return true
}

export default addTranscriptionBot
