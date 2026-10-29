import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ReportsAnswerQuery} from '../../__generated__/ReportsAnswerQuery.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportPanel from './ReportPanel'
import type {ReportAddress} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import {describeReportSpec} from './reportSpecLabels'
import useResultSpec from './useResultSpec'

interface Props {
  queryRef: PreloadedQuery<ReportsAnswerQuery>
  orgId: string
  answer: ReportAddress
  period: ReportPagePeriod
  onSpecChange: (spec: ReportSpec, title: string) => void
  onClose: () => void
}

const query = graphql`
  query ReportsAnswerQuery(
    $orgId: ID!
    $spec: ReportSpecInput!
    $timeZone: String!
    $lastHeldSpec: ReportSpecInput!
    $hasLastHeld: Boolean!
    $allTeamsSpec: ReportSpecInput!
    $allTeamsTotalSpec: ReportSpecInput!
    $hasAllTeams: Boolean!
  ) {
    viewer {
      organization(orgId: $orgId) {
        structure {
          id
          name
        }
        ...ReportPanel_organization
      }
    }
  }
`

const ReportsAnswer = ({queryRef, orgId, answer, period, onSpecChange, onClose}: Props) => {
  const {viewer} = usePreloadedQuery<ReportsAnswerQuery>(query, queryRef)
  const {organization} = viewer
  const {spec, title, reportQuestionId} = answer
  const resultSpec = useResultSpec(queryRef.variables.spec, spec)
  const levels = organization?.structure ?? []
  return (
    <ReportPanel
      organizationRef={organization}
      orgId={orgId}
      spec={spec}
      resultSpec={resultSpec}
      name={title ?? describeReportSpec(spec, levels)}
      period={period}
      reportQuestionId={reportQuestionId}
      onSpecChange={(nextSpec) => onSpecChange(nextSpec, describeReportSpec(nextSpec, levels))}
      onClose={onClose}
    />
  )
}

export default ReportsAnswer
