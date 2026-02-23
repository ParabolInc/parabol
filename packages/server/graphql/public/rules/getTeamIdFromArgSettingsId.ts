import type {MeetingSettings} from '../../../postgres/types'
import type {GQLContext} from '../../graphql'

const getTeamIdFromArgSettingsId = async (
  _source: any,
  args: any,
  context: GQLContext
): Promise<string | Error> => {
  const settings = (await context.dataLoader
    .get('meetingSettings')
    .load(args.settingsId)) as MeetingSettings
  if (!settings) {
    return new Error('Settings not found')
  }

  return settings.teamId
}

export default getTeamIdFromArgSettingsId
