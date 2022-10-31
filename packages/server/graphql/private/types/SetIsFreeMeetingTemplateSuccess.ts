import getRethink from '../../../database/rethinkDriver'
import {SetIsFreeMeetingTemplateSuccessResolvers} from '../../private/resolverTypes'

export type SetIsFreeMeetingTemplateSuccessSource = {
  updatedTemplateIds: string[]
}

const SetIsFreeMeetingTemplateSuccess: SetIsFreeMeetingTemplateSuccessResolvers = {
  updatedTemplates: async ({updatedTemplateIds}) => {
    if (!updatedTemplateIds) return null
    const r = await getRethink()
    return r.table('MeetingTemplate').getAll(r.args(updatedTemplateIds)).run()
  }
}

export default SetIsFreeMeetingTemplateSuccess
