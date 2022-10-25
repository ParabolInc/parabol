import getRethink from '../../../database/rethinkDriver'
import {MutationResolvers} from '../resolverTypes'

const setIsFreeMeetingTemplate: MutationResolvers['setIsFreeMeetingTemplate'] = async (
  _source,
  {isFree, templateIds},
  {dataLoader}
) => {
  const r = await getRethink()
  // VALIDATION
  if (!templateIds.length) {
    return {error: {message: 'Must provide at least one template id'}}
  }

  // RESOLUTION
  await r.table('MeetingTemplate').getAll(r.args(templateIds)).update({isFree}).run()
  return templateIds
}

export default setIsFreeMeetingTemplate
