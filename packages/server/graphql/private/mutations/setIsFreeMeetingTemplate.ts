import getRethink from '../../../database/rethinkDriver'
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
    const updatedTemplateIds = await r
      .table('MeetingTemplate')
      .getAll(r.args(templateIds))
      .update(
        {isFree},
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default(null)
      .run()
    return {templateIds: updatedTemplateIds}
  } else {
    const updatedTemplateIds = await r
      .table('MeetingTemplate')
      .filter((row) => r.expr(templateNames).contains(row('name')))
      .update(
        {isFree},
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default(null)
      .run()
    return {templateIds: updatedTemplateIds}
  }
}

export default setIsFreeMeetingTemplate
