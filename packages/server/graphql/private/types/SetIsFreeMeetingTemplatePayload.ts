import getRethink from '../../../database/rethinkDriver'
import {SetIsFreeMeetingTemplatePayloadResolvers} from '../resolverTypes'

export type SetIsFreeMeetingTemplateSource =
  | {
      templateIds: string[]
    }
  | {error: {message: string}}

const SetIsFreeMeetingTemplate: SetIsFreeMeetingTemplatePayloadResolvers = {
  templates: async ({templateIds}, _args, {dataLoader}) => {
    // if (!templateIds) return null
    const r = await getRethink()
    return r.table('MeetingTemplate').getAll(r.args(templateIds)).run()
  }
}

export default SetIsFreeMeetingTemplate
