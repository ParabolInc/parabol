import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import publish from '../../../utils/publish'
import getKysely from '../../../postgres/getKysely'
import {MutationResolvers} from '../resolverTypes'

const updateTemplateCategory: MutationResolvers['updateTemplateCategory'] = async (
  _source,
  {templateId, mainCategory},
  {dataLoader, socketId: mutatorId}
) => {
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}
  const pg = getKysely()

  // VALIDATION
  if (mainCategory.length < 1) return {error: {message: 'Category name cannot be blank'}}
  if (mainCategory.length > 100) return {error: {message: 'Category name is too long'}}

  // RESOLUTION
  await pg
    .updateTable('MeetingTemplate')
    .set({mainCategory})
    .where('id', '=', templateId)
    .executeTakeFirst()
  dataLoader.get('meetingTemplates').clear(templateId)
  const updatedTemplate = await dataLoader.get('meetingTemplates').load(templateId)
  const {teamId} = updatedTemplate
  const data = {templateId}
  publish(SubscriptionChannel.TEAM, teamId, 'UpdateTemplateCategorySuccess', data, subOptions)
  return data
}

export default updateTemplateCategory
