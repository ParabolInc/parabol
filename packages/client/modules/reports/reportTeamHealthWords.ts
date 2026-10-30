import dayjs from 'dayjs'
import type {
  TeamHealthAttentionInput,
  TeamHealthMark
} from '../../shared/reports/teamHealthAttention'
import type {ReportTeamHealthCell, ReportTeamHealthCheck} from './reportTeamHealthCells'

export const TEAM_HEALTH_MARK_NAMES: Record<TeamHealthMark, string> = {
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
  BRIGHT_SPOT: 'Bright spot'
}
export const TEAM_HEALTH_MARK_ORDER = ['HIGH', 'MEDIUM', 'LOW', 'BRIGHT_SPOT'] as const

const ORDINAL_SUFFIXES = new Intl.PluralRules('en-US', {type: 'ordinal'})
const SUFFIXES: Record<string, string> = {one: 'st', two: 'nd', few: 'rd', other: 'th'}
export const toOrdinal = (count: number) => `${count}${SUFFIXES[ORDINAL_SUFFIXES.select(count)]}`

export const formatCheckDate = (endedAt: string) => dayjs(endedAt).format('MMM D')

// someone who answered and left the team since still counts as one of the people asked
const toAskedCount = ({respondentCount, memberCount}: ReportTeamHealthCheck) =>
  Math.max(respondentCount, memberCount)

export const formatAnswered = (check: ReportTeamHealthCheck) =>
  `${check.respondentCount} of ${toAskedCount(check)}`

// how many answered checks that show, out of how many people were asked
export const formatAnsweredTogether = (checks: readonly ReportTeamHealthCheck[]) => {
  const shownChecks = checks.filter(({stages}) => stages.length > 0)
  if (shownChecks.length === 0) return null
  const respondentCount = shownChecks.reduce((sum, check) => sum + check.respondentCount, 0)
  const askedCount = shownChecks.reduce((sum, check) => sum + toAskedCount(check), 0)
  return `${respondentCount} of ${askedCount}`
}

// from the spread's input, which is 0 at a standard deviation of 0.6 or less and 1 at 1.4 or more
export const describeSpread = (spread: number) =>
  spread >= 0.6
    ? 'Far apart'
    : spread >= 0.4
      ? 'Spread out'
      : spread >= 0.15
        ? 'Fairly close'
        : 'Close together'

const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const inputOf = (
  inputs: readonly TeamHealthAttentionInput[],
  key: TeamHealthAttentionInput['key']
) => inputs.find((input) => input.key === key)?.value ?? null

export const describeReasons = ({inputs, stage}: ReportTeamHealthCell) => {
  const sentiment = inputOf(inputs, 'sentiment')
  const spread = inputOf(inputs, 'spread')
  const commented = inputOf(inputs, 'commented')
  const reasons = [
    sentiment !== null && sentiment >= 0.35
      ? `${sentiment >= 0.85 ? 'very negative' : sentiment >= 0.6 ? 'negative' : 'mixed'} summary`
      : null,
    spread !== null && spread >= 0.35 ? `answers ${describeSpread(spread).toLowerCase()}` : null,
    commented !== null && commented >= 0.35
      ? `${stage.commentCount} of ${stage.respondentCount ?? 0} commented`
      : null
  ].filter(Boolean)
  return upperFirst(reasons.join(' · '))
}
