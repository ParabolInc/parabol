import {TopRetroTemplateResolvers} from '../resolverTypes'
import TopRetroTemplateId from 'parabol-client/shared/gqlIds/TopRetroTemplateId'
import ReflectTemplate from '../../../database/types/ReflectTemplate'

export type TopRetroTemplateSource = {
  teamId: string
  reflectTemplateId: string
  count: number
}

const TopRetroTemplate: TopRetroTemplateResolvers = {
  id: ({teamId, reflectTemplateId}) => TopRetroTemplateId.join(teamId, reflectTemplateId),
  reflectTemplate: async ({reflectTemplateId}, _args, {dataLoader}) => {
    return (await dataLoader
      .get('meetingTemplates')
      .loadNonNull(reflectTemplateId)) as ReflectTemplate
  }
}

export default TopRetroTemplate
