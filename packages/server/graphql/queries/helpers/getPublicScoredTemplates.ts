import db from '../../../db'
import getTemplateScore from '../../../utils/getTemplateScore'

const getPublicScoredTemplates = async (
  templates: {createdAt: Date; id: string; isStarter?: boolean; isFree?: boolean}[]
) => {
  const sharedTemplateIds = templates.map(({id}) => id)
  const sharedTemplateEndTimes = await db.readMany('endTimesByTemplateId', sharedTemplateIds)
  const scoreByTemplateId = {} as {[templateId: string]: number}
  templates.forEach((template, idx) => {
    const {id: templateId, createdAt, isStarter, isFree} = template
    const endTimes = sharedTemplateEndTimes[idx]!
    const isFreeBonus = isFree ? 1000 : 0
    const starterBonus = isStarter ? 100 : 0
    const bonuses = isFreeBonus + starterBonus
    const minUsagePenalty = sharedTemplateEndTimes.length < 10 && !bonuses
    scoreByTemplateId[templateId] = minUsagePenalty
      ? -1
      : getTemplateScore(createdAt, endTimes, 0.2) + bonuses
  })
  // mutative, but doesn't matter if we change the sort oder
  return templates
    .filter((template) => scoreByTemplateId[template.id]! > 0)
    .sort((a, b) => {
      return scoreByTemplateId[a.id]! > scoreByTemplateId[b.id]! ? -1 : 1
    })
}

export default getPublicScoredTemplates
