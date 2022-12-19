import getRethink from '../../../database/rethinkDriver'
import MeetingSettingsPoker from '../../../database/types/MeetingSettingsPoker'
import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import {getUserId} from '../../../utils/authorization'
import {GQLContext} from '../../graphql'

const resolveSelectedTemplate =
  (fallbackTemplateId: string) =>
  async (
    source: MeetingSettingsPoker | MeetingSettingsRetrospective,
    _args: unknown,
    {authToken, dataLoader}: GQLContext
  ) => {
    const {id: settingsId, selectedTemplateId, teamId} = source
    const viewerId = getUserId(authToken)
    const [viewer, team, template] = await Promise.all([
      dataLoader.get('users').loadNonNull(viewerId),
      dataLoader.get('teams').loadNonNull(teamId),
      dataLoader.get('meetingTemplates').load(selectedTemplateId)
    ])
    const {tier} = team
    const {isFree, scope} = template
    const hasFeatureFlag = viewer.featureFlags.includes('templateLimit')
    if (template && (hasFeatureFlag ? isFree || scope !== 'PUBLIC' || tier !== 'starter' : true)) {
      return template
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
