import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {CategoryID, MAIN_CATEGORIES} from '../../../../client/components/ActivityLibrary/Categories'
import getKysely from '../../../postgres/getKysely'
import publish from '../../../utils/publish'
import {MutationResolvers} from '../resolverTypes'

const updateTemplateCategory: MutationResolvers['updateTemplateCategory'] = async (
  _source,
  args,
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()
  const {templateId} = args
  const mainCategory = args.mainCategory as CategoryID

  // VALIDATION
  if (!MAIN_CATEGORIES.includes(mainCategory)) {
    return {error: {message: 'Custom categories not available'}}
  }
  // Auth permissions guarantee viewer can edit templateId

  // RESOLUTION
  await pg
    .updateTable('MeetingTemplate')
    .set({mainCategory})
    .where('id', '=', templateId)
    .executeTakeFirst()
  dataLoader.get('meetingTemplates').clear(templateId)
  const updatedTemplate = await dataLoader.get('meetingTemplates').loadNonNull(templateId)
  const {teamId} = updatedTemplate
  const data = {templateId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateTemplateCategorySuccess', data, subOptions)
  return data
}

export default updateTemplateCategory
