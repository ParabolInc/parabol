import getRethink from '../../../database/rethinkDriver'
import MeetingSettingsPoker from '../../../database/types/MeetingSettingsPoker'
import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import {GQLContext} from '../../graphql'
import {getUserId} from '../../../utils/authorization'
import isValid from '../../isValid'
import {getFeatureTier} from '../../types/helpers/getFeatureTier'

const resolveSelectedTemplate =
  (fallbackTemplateId: string) =>
  async (
    source: MeetingSettingsPoker | MeetingSettingsRetrospective,
    _args: unknown,
    {authToken, dataLoader}: GQLContext
  ) => {
    const viewerId = getUserId(authToken)
    const {id: settingsId, selectedTemplateId, teamId} = source
    const [team, template, viewer] = await Promise.all([
      dataLoader.get('teams').loadNonNull(teamId),
      dataLoader.get('meetingTemplates').load(selectedTemplateId),
      dataLoader.get('users').loadNonNull(viewerId)
    ])
    if (template) {
      if (
        template.isFree ||
        template.scope !== 'PUBLIC' ||
        getFeatureTier(team) !== 'starter' ||
        viewer.featureFlags.includes('noTemplateLimit')
      ) {
        return template
      }
      // if anyone on the team has the noTemplateLimit flag, they might have selected a non-starter template
      const teamMembers = await dataLoader.get('teamMembersByTeamId').load(teamId)
      const userIds = teamMembers.map(({userId}) => userId)
      const users = (await dataLoader.get('users').loadMany(userIds)).filter(isValid)
      if (users.some(({featureFlags}) => featureFlags.includes('noTemplateLimit'))) {
        return template
      }
    }
    // there may be holes in our template deletion or reselection logic, so doing this to be safe
    source.selectedTemplateId = fallbackTemplateId
    const r = await getRethink()
    await r
      .table('MeetingSettings')
      .get(settingsId)
      .update({selectedTemplateId: fallbackTemplateId})
      .run()
    return dataLoader.get('meetingTemplates').load(fallbackTemplateId)
  }

export default resolveSelectedTemplate
