import getRethink from '../../../database/rethinkDriver'
import MeetingSettingsPoker from '../../../database/types/MeetingSettingsPoker'
import MeetingSettingsRetrospective from '../../../database/types/MeetingSettingsRetrospective'
import getKysely from '../../../postgres/getKysely'
import {GQLContext} from '../../graphql'

const resolveSelectedTemplate =
  (fallbackTemplateId: string) =>
  async (
    source: MeetingSettingsPoker | MeetingSettingsRetrospective,
    _args: unknown,
    {dataLoader}: GQLContext
  ) => {
    const {id: settingsId, selectedTemplateId} = source
    const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)
    if (template) {
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
    await getKysely()
      .updateTable('MeetingSettings')
      .set({selectedTemplateId: fallbackTemplateId})
      .where('id', '=', settingsId)
      .execute()

    return dataLoader.get('meetingTemplates').loadNonNull(fallbackTemplateId)
  }

export default resolveSelectedTemplate
