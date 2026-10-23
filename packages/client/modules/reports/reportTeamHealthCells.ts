import type {ReportTeamHealthView_teamHealth$data} from '../../__generated__/ReportTeamHealthView_teamHealth.graphql'
import {
  combineTeamHealthAttention,
  markTeamHealthCells,
  type TeamHealthAttentionInput,
  type TeamHealthMark,
  toTeamHealthAttentionInputs
} from '../../shared/reports/teamHealthAttention'

export type ReportTeamHealthCheck = ReportTeamHealthView_teamHealth$data['checks'][number]
type ReportTeamHealthCategory = ReportTeamHealthCheck['categories'][number]

export interface ReportTeamHealthCell {
  key: string
  check: ReportTeamHealthCheck
  category: ReportTeamHealthCategory
  inputs: TeamHealthAttentionInput[]
  rawAttention: number
  attention: number
  mark: TeamHealthMark | null
}

export interface ReportTeamHealthSelection {
  cell: ReportTeamHealthCell
  teamName: string
  categoryName: string
}

export const toTeamHealthCellKey = (teamId: string, categoryId: string) => `${teamId}:${categoryId}`

// every category of every check is marked at once, since the cap counts them all
export const markReportTeamHealthCells = (checks: readonly ReportTeamHealthCheck[]) => {
  const candidates = checks.flatMap((check) =>
    check.categories.map((category) => {
      const sentimentScore = category.sentimentScore ?? null
      const commentedShare = category.commenterCount / category.respondentCount
      const inputs = toTeamHealthAttentionInputs({
        sentimentScore,
        deviation: category.deviation ?? null,
        commentedShare
      })
      return {
        key: toTeamHealthCellKey(check.teamId, category.categoryId),
        check,
        category,
        inputs,
        sentimentScore,
        commentedShare,
        rawAttention: combineTeamHealthAttention(inputs)
      }
    })
  )
  return new Map(
    markTeamHealthCells(candidates).map(
      ({cell, attention, mark}): [string, ReportTeamHealthCell] => [
        cell.key,
        {...cell, attention, mark}
      ]
    )
  )
}

export const hasFallenTwice = (
  score: number | null,
  previousScores: readonly (number | null | undefined)[]
) => {
  const [previous, beforeThat] = previousScores
  return (
    score !== null &&
    previous != null &&
    beforeThat != null &&
    score < previous &&
    previous < beforeThat
  )
}
