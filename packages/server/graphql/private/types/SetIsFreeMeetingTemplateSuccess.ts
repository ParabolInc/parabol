import getRethink from '../../../database/rethinkDriver'
import {SetIsFreeMeetingTemplateSuccessResolvers} from '../../private/resolverTypes'

export type SetIsFreeMeetingTemplateSuccessSource = {
  updatedTemplateIds: string[]
}

const SetIsFreeMeetingTemplateSuccess: SetIsFreeMeetingTemplateSuccessResolvers = {
  updatedTemplates: async ({updatedTemplateIds}) => {
    const r = await getRethink()
    const updatedTemplates = await r
      .table('MeetingTemplate')
      .getAll(r.args(updatedTemplateIds))
      .run()
    return updatedTemplates
  }
}

export default SetIsFreeMeetingTemplateSuccess
