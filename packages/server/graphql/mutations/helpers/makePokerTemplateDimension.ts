import TemplateScale from '../../../database/types/TemplateScale'
import TemplateDimension from '../../../database/types/TemplateDimension'
import makePokerTemplateScales from './makePokerTemplateScales'

const makePokerTemplateDimensions = (teamId: string, templateId: string) => {
  const newScales: TemplateScale[] = []
  const defaultScales = makePokerTemplateScales(teamId, templateId) as TemplateScale[]

  const newDimension = new TemplateDimension({
    scaleId: defaultScales[0].id,
    description: '',
    sortOrder: 0,
    name: '*New dimension',
    teamId,
    templateId
  })

  newScales.push(...defaultScales)
  return {newDimension, newScales}
}

export default makePokerTemplateDimensions
