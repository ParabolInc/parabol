import getRethink from '../../../database/rethinkDriver'
import {RDatum} from '../../../database/stricterR'
import {TemplateScaleResolvers} from '../resolverTypes'

const TemplateScale: TemplateScaleResolvers = {
  isActive: ({removedAt}) => !removedAt,
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },

  dimensions: async ({id: scaleId, teamId}) => {
    const r = await getRethink()
    return r
      .table('TemplateDimension')
      .getAll(teamId, {index: 'teamId'})
      .filter((row: RDatum) =>
        row('removedAt').default(null).eq(null).and(row('scaleId').eq(scaleId))
      )
      .run()
  },

  values: ({id, values}) => {
    return values.map((value, index) => ({
      ...value,
      scaleId: id,
      sortOrder: index
    }))
  }
}

export default TemplateScale
