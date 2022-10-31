import getRethink from '../../../database/rethinkDriver'
import {ResolversTypes, SetIsFreeMeetingTemplateSuccessResolvers} from '../../private/resolverTypes'

export type SetIsFreeMeetingTemplateSuccessSource = {
  updatedTemplateIds: string[]
}

const SetIsFreeMeetingTemplateSuccess: SetIsFreeMeetingTemplateSuccessResolvers = {
  updatedTemplates: async ({updatedTemplateIds}) => {
    if (!updatedTemplateIds) return null
    const r = await getRethink()
    const updatedTemplates = (await r
      .table('MeetingTemplate')
      .getAll(r.args(updatedTemplateIds))
      .run()) as ResolversTypes['MeetingTemplate'][]
    return updatedTemplates
  }
}

export default SetIsFreeMeetingTemplateSuccess
