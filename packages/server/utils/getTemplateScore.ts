/*
 * On social sites (e.g. Reddit) hotness is a function of age & upvotes
 * Instead of upvotes, our templates rely on # meetings run
 * Unlike social sites, templates shouldn't age immediately after cretion
 * They get a 1-month period to grow in popularity before age plays against them
 * After 2 months, age stops helping the score & the score depends on usage
 * Adapted from https://stats.areppim.com/glossaire/scurve_def.htm.
 * Inverted the LN to invert the S shape
 */

const SATURTION = 1 // max score, we want a score that is 0-1
const MIDPOINT = 45 // after this many days, the score will be SATURATION / 2
const GROWTH_INTERVAL = 30 // 80% of the decline happens in this many days

// Default hotness factors for ranking templates
export const ORG_HOTNESS_FACTOR = 0.8
export const TEAM_HOTNESS_FACTOR = 0.9

const getAgeScore = (age: number) => {
  const ageDays = age / 1000 / 60 / 60 / 24
  return SATURTION / (1 + Math.exp((Math.log(81) / GROWTH_INTERVAL) * (ageDays - MIDPOINT)))
}

// weightCreatedAt: 0-1, how important is age vs. the number of meetings run
const getTemplateScore = (
  templateCreatedAt: Date,
  meetingsEndedAt: number[],
  newHotnessFactor: number
) => {
  const now = Date.now()
  const templateAge = now - templateCreatedAt.getTime()
  const templateScore = getAgeScore(templateAge)
  const meetingAges = meetingsEndedAt.map((endedAt) => now - endedAt)
  const meetingScore = meetingAges.reduce((sum, age) => sum + getAgeScore(age), 0)
  return newHotnessFactor * templateScore + (1 - newHotnessFactor) * meetingScore
}
export default getTemplateScore
