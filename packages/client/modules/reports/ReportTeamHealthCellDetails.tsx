import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ReportTeamHealthCellDetailsQuery} from '../../__generated__/ReportTeamHealthCellDetailsQuery.graphql'
import ReportTeamHealthCellSummary from './ReportTeamHealthCellSummary'
import ReportTeamHealthComments from './ReportTeamHealthComments'
import ReportTeamHealthSpread from './ReportTeamHealthSpread'
import ReportTeamHealthTrend from './ReportTeamHealthTrend'
import type {ReportTeamHealthSelection} from './reportTeamHealthCells'

interface Props {
  queryRef: PreloadedQuery<ReportTeamHealthCellDetailsQuery>
  selection: ReportTeamHealthSelection
}

const query = graphql`
  query ReportTeamHealthCellDetailsQuery($orgId: ID!, $meetingId: ID!, $categoryId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        reportTeamHealthStage(meetingId: $meetingId, categoryId: $categoryId) {
          score
          summary
          isLoadingSummary
          spreadScores
          responses {
            id
            commentParaphrased
            commentAuthor {
              id
              preferredName
              picture
            }
          }
          scoreHistory {
            endedAt
            score
          }
          # aliased like the meeting's: NewMeetingStage.question is a String on the embedded TeamHealthStage
          healthQuestion: question {
            question
          }
        }
      }
    }
  }
`

const ReportTeamHealthCellDetails = ({queryRef, selection}: Props) => {
  const {viewer} = usePreloadedQuery<ReportTeamHealthCellDetailsQuery>(query, queryRef)
  const details = viewer.organization?.reportTeamHealthStage
  const {cell, teamName, categoryName} = selection
  if (!details) {
    return (
      <p className='m-0 text-fg-secondary text-sm'>The details of this check can’t be shown.</p>
    )
  }
  const {score, summary, isLoadingSummary, spreadScores, responses, healthQuestion} = details
  // this check and the 2 before it, oldest first
  const scoreHistory = [
    ...details.scoreHistory.slice(-2),
    ...(score === null || score === undefined ? [] : [{endedAt: cell.check.endedAt, score}])
  ]
  // longest first, so the order says nothing about who answered when
  const comments = responses
    .flatMap(({commentParaphrased, commentAuthor}) =>
      commentParaphrased ? [{text: commentParaphrased, author: commentAuthor}] : []
    )
    .sort((a, b) => b.text.length - a.text.length)
  return (
    <>
      <section className='flex flex-col gap-1'>
        <h3 className='m-0 font-semibold text-fg-muted text-xs uppercase tracking-wide'>
          Question
        </h3>
        <p className='m-0 text-[15px] leading-[22px]'>“{healthQuestion.question}”</p>
      </section>
      <ReportTeamHealthTrend
        scoreHistory={scoreHistory}
        teamName={teamName}
        categoryName={categoryName}
      />
      <ReportTeamHealthCellSummary summary={summary} isLoadingSummary={isLoadingSummary} />
      <ReportTeamHealthSpread spreadScores={spreadScores} />
      <ReportTeamHealthComments comments={comments} />
    </>
  )
}

export default ReportTeamHealthCellDetails
