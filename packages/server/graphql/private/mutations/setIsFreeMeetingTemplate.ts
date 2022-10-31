import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'

const setIsFreeMeetingTemplate: MutationResolvers['setIsFreeMeetingTemplate'] = async (
  _source,
  {isFree, templateIds, templateNames}
) => {
  const r = await getRethink()
  // VALIDATION
  if (!templateIds?.length && !templateNames?.length) {
    throw new Error('Must provide template ids or names')
  }
  if (templateIds?.length && templateNames?.length) {
    throw new Error('Please provide template ids or names, not both')
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
    return {updatedTemplateIds}
  } else {
    const updatedTemplateIds = await r
      .table('MeetingTemplate')
      .getAll('aGhostTeam', {index: 'teamId'})
      .filter((row) => r.expr(templateNames).contains(row('name')))
      .update(
        {isFree},
        {returnChanges: true}
      )('changes')('new_val')('id')
      .default(null)
      .run()
    return {updatedTemplateIds}
  }
}

export default setIsFreeMeetingTemplate
