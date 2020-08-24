import db from '../../../db'
import getTemplateScore from '../../../utils/getTemplateScore'

const getPublicScoredTemplates = async (templates: {createdAt: Date; id: string}[]) => {
  const sharedTemplateIds = templates.map(({id}) => id)
  const sharedTemplateEndTimes = await db.readMany('endTimesByTemplateId', sharedTemplateIds)
  const scoreByTemplateId = {} as {[templateId: string]: number}
  const starterTemplates = new Set([
    'sailboatTemplate',
    'startStopContinueTemplate',
    'workingStuckTemplate',
    'fourLsTemplate',
    'gladSadMadTemplate'
  ])
  templates.forEach((template, idx) => {
    const {id: templateId, createdAt} = template
    const endTimes = sharedTemplateEndTimes[idx]
    const starterBonus = starterTemplates.has(templateId) ? 100 : 0
    const minUsagePenalty = sharedTemplateEndTimes.length < 10 && !starterBonus
    scoreByTemplateId[templateId] = minUsagePenalty
      ? -1
      : getTemplateScore(createdAt, endTimes, 0.2) + starterBonus
  })
  // mutative, but doesn't matter if we change the sort oder
  return templates
    .filter((template) => scoreByTemplateId[template.id] > 0)
    .sort((a, b) => {
      return scoreByTemplateId[a.id] > scoreByTemplateId[b.id] ? -1 : 1
    })
}

export default getPublicScoredTemplates
