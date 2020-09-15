import TemplateScaleValue from '../../../database/types/TemplateScaleValue'
import PokerTemplate from '../../../database/types/PokerTemplate'
import TemplateDimension from '../../../database/types/TemplateDimension'
import TemplateScale from '../../../database/types/TemplateScale'

interface TemplateObject {
  [templateName: string]: string[]
}

const makePokerTemplateDimensionScale = (teamId: string, templateId: string) => {
  const newScaleValues = [
    new TemplateScaleValue({color: '#5CA0E5', label: 'XS', value: 1}),
    new TemplateScaleValue({color: '#5CA0E5', label: 'SM', value: 2}),
    new TemplateScaleValue({color: '#45E595', label: 'M', value: 3}),
    new TemplateScaleValue({color: '#E59545', label: 'L', value: 4}),
    new TemplateScaleValue({color: '#E59545', label: 'XL', value: 5})
  ]
  return new TemplateScale({
    name: 'T-Shirt Sizes',
    values: newScaleValues,
    teamId: teamId,
    templateId: templateId
  })
}

const makePokerTemplates = (teamId: string, orgId: string, templateObj: TemplateObject) => {
  const pokerScales: TemplateScale[] = []
  const pokerDimensions: TemplateDimension[] = []
  const templates: PokerTemplate[] = []
  const templateNames = Object.keys(templateObj)
  templateNames.forEach((templateName) => {
    const dimensionBase = templateObj[templateName]
    const template = new PokerTemplate({name: templateName, teamId, orgId})

    const dimensions = dimensionBase.map((dimensionName, idx) => {
      const newScale = makePokerTemplateDimensionScale(teamId, template.id)
      pokerScales.push()

      const newDimension = new TemplateDimension({
        name: dimensionName,
        teamId,
        templateId: template.id,
        sortOrder: idx,
        scaleId: newScale.id
      })

      return newDimension
    })
    templates.push(template)
    pokerDimensions.push(...dimensions)
  })
  return {pokerDimensions, pokerScales, templates}
}

export {makePokerTemplateDimensionScale, makePokerTemplates}
