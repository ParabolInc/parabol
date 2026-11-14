import type {ReportTeamHealthView_teamHealth$data} from '../../__generated__/ReportTeamHealthView_teamHealth.graphql'
import {
  combineTeamHealthAttention,
  markTeamHealthCells,
  type TeamHealthAttentionInput,
  type TeamHealthMark,
  toTeamHealthAttentionInputs,
  toTeamHealthDeviation
} from '../../shared/reports/teamHealthAttention'

export type ReportTeamHealthCheck = ReportTeamHealthView_teamHealth$data['checks'][number]
type ReportTeamHealthStage = ReportTeamHealthCheck['stages'][number]

export interface ReportTeamHealthCell {
  key: string
  check: ReportTeamHealthCheck
  stage: ReportTeamHealthStage
  categoryId: string
  // the category's scores in the 2 checks before this one that showed it, newest first
  previousScores: number[]
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
    check.stages.map((stage) => {
      const categoryId = stage.healthQuestion.category.id
      const sentimentScore = stage.sentimentScore ?? null
      const respondentCount = stage.respondentCount ?? 0
      const commentedShare = respondentCount > 0 ? stage.commentCount / respondentCount : 0
      const inputs = toTeamHealthAttentionInputs({
        sentimentScore,
        deviation: stage.spreadScores ? toTeamHealthDeviation(stage.spreadScores) : null,
        commentedShare
      })
      return {
        key: toTeamHealthCellKey(check.teamId, categoryId),
        check,
        stage,
        categoryId,
        previousScores: stage.scoreHistory
          .slice(-2)
          .reverse()
          .map(({score}) => score),
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
