import getRethink from '../../../database/rethinkDriver'
import updateMeetingTemplateFreeStatusById from '../../../postgres/queries/updateMeetingTemplateFreeStatusById'
import updateMeetingTemplateFreeStatusByName from '../../../postgres/queries/updateMeetingTemplateFreeStatusByName'
import {MutationResolvers} from '../resolverTypes'

const setIsFreeMeetingTemplate: MutationResolvers['setIsFreeMeetingTemplate'] = async (
  _source,
  {isFree, templateIds, templateNames}
) => {
  const r = await getRethink()
  // VALIDATION
  if (!templateIds?.length && !templateNames?.length) {
    return {error: {message: 'Must provide template ids or names'}}
  }
  if (templateIds?.length && templateNames?.length) {
    return {error: {message: 'Please provide template ids or names, not both'}}
  }

  // RESOLUTION
  if (templateIds?.length) {
    const updatedTemplateIds = await updateMeetingTemplateFreeStatusById(templateIds, isFree)
    return {updatedTemplateIds}
  } else if (templateNames?.length) {
    const updatedTemplateIds = await updateMeetingTemplateFreeStatusByName(templateNames, isFree)
    return {updatedTemplateIds}
  }
  return {error: {message: 'Invalid args'}}
}

export default setIsFreeMeetingTemplate
