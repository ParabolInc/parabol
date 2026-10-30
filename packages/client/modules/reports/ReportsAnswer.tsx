import graphql from 'babel-plugin-relay/macro'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ReportsAnswerQuery} from '../../__generated__/ReportsAnswerQuery.graphql'
import type {ReportSpec} from '../../shared/reports/reportCatalog'
import ReportPanel from './ReportPanel'
import type {ReportAddress} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import {describeReportSpec} from './reportSpecLabels'
import {parseReportSpecJSON} from './reportSpecParam'
import useResultSpec from './useResultSpec'

interface Props {
  queryRef: PreloadedQuery<ReportsAnswerQuery>
  orgId: string
  answer: ReportAddress
  period: ReportPagePeriod
  onSpecChange: (spec: ReportSpec, title: string) => void
  onClose: () => void
  onRetry: (() => void) | null
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
        recentReportQuestions {
          id
          title
          spec
        }
        ...ReportPanel_organization
      }
    }
  }
`

const ReportsAnswer = (props: Props) => {
  const {queryRef, orgId, answer, period, onSpecChange, onClose, onRetry} = props
  const {viewer} = usePreloadedQuery<ReportsAnswerQuery>(query, queryRef)
  const {organization} = viewer
  const {spec, reportQuestionId} = answer
  const {resultSpec, isUpdating} = useResultSpec(queryRef.variables.spec, spec, period)
  const levels = organization?.structure ?? []
  // the viewer's own question names its report, unless the report shown has changed from it
  const question = organization?.recentReportQuestions.find(({id}) => id === reportQuestionId)
  const questionSpec = question?.spec ? parseReportSpecJSON(question.spec) : null
  const title =
    question && questionSpec && JSON.stringify(questionSpec) === JSON.stringify(spec)
      ? question.title
      : null
  return (
    <ReportPanel
      organizationRef={organization}
      orgId={orgId}
      spec={spec}
      resultSpec={resultSpec}
      isUpdating={isUpdating}
      onRetry={onRetry}
      name={title ?? describeReportSpec(spec, levels)}
      period={period}
      reportQuestionId={reportQuestionId}
      onSpecChange={(nextSpec) => onSpecChange(nextSpec, describeReportSpec(nextSpec, levels))}
      onClose={onClose}
    />
  )
}

export default ReportsAnswer
