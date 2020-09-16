import PokerTemplate from '../../../database/types/PokerTemplate'
import TemplateDimension from '../../../database/types/TemplateDimension'
import TemplateScale from '../../../database/types/TemplateScale'
import makePokerTemplateDimension from './makePokerTemplateDimension'

interface DimensionObject {
  name: string
  description?: string
}

interface TemplateObject {
  [templateName: string]: DimensionObject[]
}

const makePokerTemplates = (teamId: string, orgId: string, templateObj: TemplateObject) => {
  const pokerScales: TemplateScale[] = []
  const pokerDimensions: TemplateDimension[] = []
  const templates: PokerTemplate[] = []
  const templateNames = Object.keys(templateObj)
  templateNames.forEach((templateName) => {
    const dimensionBase = templateObj[templateName]
    const template = new PokerTemplate({name: templateName, teamId, orgId})

    const dimensionAndScales = dimensionBase.map((dimension, idx) => {
      const newDimensionWithDefaultScales = makePokerTemplateDimension(teamId, template.id)
      const {newDimension, newScales} = newDimensionWithDefaultScales

      newDimension.name = dimension.name
      newDimension.sortOrder = idx
      newDimension.description = dimension.description || ''

      return {newDimension, newScales}
    })
    const dimensions = dimensionAndScales.map(({newDimension}) => newDimension)
    const scales = dimensionAndScales.map(({newScales}) => newScales).flat()
    templates.push(template)
    pokerDimensions.push(...dimensions)
    pokerScales.push(...scales)
  })
  return {pokerDimensions, pokerScales, templates}
}

export default makePokerTemplates
