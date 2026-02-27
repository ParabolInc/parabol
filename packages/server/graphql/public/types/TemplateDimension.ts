import type {TemplateDimensionResolvers} from '../resolverTypes'

const TemplateDimension: TemplateDimensionResolvers = {
  isActive: ({removedAt}) => !removedAt,
  selectedScale: ({scaleId}, _args, {dataLoader}) => {
    return dataLoader.get('templateScales').loadNonNull(scaleId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  template: ({templateId}, _args, {dataLoader}) => {
    return dataLoader.get('meetingTemplates').loadNonNull(templateId)
  }
}

export default TemplateDimension
