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
        reportTeamHealthCell(meetingId: $meetingId, categoryId: $categoryId) {
          question
          summary
          spreadScores
          comments {
            text
            author {
              id
              preferredName
              picture
            }
          }
          scoreHistory {
            endedAt
            score
          }
        }
      }
    }
  }
`

const ReportTeamHealthCellDetails = ({queryRef, selection}: Props) => {
  const {viewer} = usePreloadedQuery<ReportTeamHealthCellDetailsQuery>(query, queryRef)
  const details = viewer.organization?.reportTeamHealthCell
  const {cell, teamName, categoryName} = selection
  const {respondentCount, isLoadingSummary} = cell.category
  if (!details) {
    return (
      <p className='m-0 text-fg-secondary text-sm'>The details of this check can’t be shown.</p>
    )
  }
  return (
    <>
      <section className='flex flex-col gap-1'>
        <h3 className='m-0 font-semibold text-fg-muted text-xs uppercase tracking-wide'>
          Asked in this check
        </h3>
        <p className='m-0 text-[15px] leading-[22px]'>“{details.question}”</p>
      </section>
      <ReportTeamHealthTrend
        scoreHistory={details.scoreHistory}
        teamName={teamName}
        categoryName={categoryName}
      />
      <ReportTeamHealthCellSummary summary={details.summary} isLoadingSummary={isLoadingSummary} />
      <ReportTeamHealthSpread
        spreadScores={details.spreadScores}
        respondentCount={respondentCount}
      />
      <ReportTeamHealthComments comments={details.comments} respondentCount={respondentCount} />
    </>
  )
}

export default ReportTeamHealthCellDetails
