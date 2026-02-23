import {GraphQLError} from 'graphql'
import type {GQLContext} from '../../graphql'

const getTeamIdFromArgSettingsId = async (
  _source: any,
  args: any,
  context: GQLContext
): Promise<string | Error> => {
  const settings = await context.dataLoader.get('meetingSettings').load(args.settingsId)
  if (!settings) {
    return new GraphQLError('Settings not found')
  }

  return settings.teamId
}

export default getTeamIdFromArgSettingsId
