import getKysely from '../../../postgres/getKysely'
import {MeetingSettings} from '../../../postgres/types'
import {GQLContext} from '../../graphql'

const resolveSelectedTemplate =
  <TMeetingTypeEnum>(fallbackTemplateId: string) =>
  async (source: MeetingSettings, _args: unknown, {dataLoader}: GQLContext) => {
    const {id: settingsId, selectedTemplateId} = source
    if (selectedTemplateId) {
      const template = await dataLoader.get('meetingTemplates').load(selectedTemplateId)
      if (template) {
        return template
      }
    }
    // there may be holes in our template deletion or reselection logic, so doing this to be safe
    source.selectedTemplateId = fallbackTemplateId
    await getKysely()
      .updateTable('MeetingSettings')
      .set({selectedTemplateId: fallbackTemplateId})
      .where('id', '=', settingsId)
      .execute()

    const res = await dataLoader.get('meetingTemplates').loadNonNull(fallbackTemplateId)
    return res as typeof res & {type: TMeetingTypeEnum}
  }

export default resolveSelectedTemplate
