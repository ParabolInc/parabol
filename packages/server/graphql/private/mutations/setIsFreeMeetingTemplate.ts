import {GraphQLError} from 'graphql'
import updateMeetingTemplateFreeStatusById from '../../../postgres/queries/updateMeetingTemplateFreeStatusById'
import updateMeetingTemplateFreeStatusByName from '../../../postgres/queries/updateMeetingTemplateFreeStatusByName'
import type {MutationResolvers} from '../resolverTypes'

const setIsFreeMeetingTemplate: MutationResolvers['setIsFreeMeetingTemplate'] = async (
  _source,
  {isFree, templateIds, templateNames}
) => {
  // VALIDATION
  if (!templateIds?.length && !templateNames?.length) {
    throw new GraphQLError('Must provide template ids or names', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }
  if (templateIds?.length && templateNames?.length) {
    throw new GraphQLError('Please provide template ids or names, not both', {
      extensions: {code: 'BAD_USER_INPUT'}
    })
  }

  // RESOLUTION
  if (templateIds?.length) {
    const updatedTemplateIds = await updateMeetingTemplateFreeStatusById(templateIds, isFree)
    return {updatedTemplateIds}
  } else if (templateNames?.length) {
    const updatedTemplateIds = await updateMeetingTemplateFreeStatusByName(templateNames, isFree)
    return {updatedTemplateIds}
  }
  throw new GraphQLError('Invalid args', {extensions: {code: 'BAD_USER_INPUT'}})
}

export default setIsFreeMeetingTemplate
