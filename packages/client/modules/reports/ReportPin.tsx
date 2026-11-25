import {useNavigate} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ReportPageQuery} from '../../__generated__/ReportPageQuery.graphql'
import type {ReportPinQuery} from '../../__generated__/ReportPinQuery.graphql'
import findReportPin from './findReportPin'
import ReportLinkMissing from './ReportLinkMissing'
import ReportPage from './ReportPage'
import ReportPageLoadError from './ReportPageLoadError'
import {toReportPagePath, toReportPinPath} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import useReportSpecChange from './useReportSpecChange'

interface Props {
  queryRef: PreloadedQuery<ReportPinQuery>
  reportQueryRef: PreloadedQuery<ReportPageQuery> | null
  orgId: string
  pinParam: string
  period: ReportPagePeriod
}

const query = graphql`
  query ReportPinQuery($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        pinnedReports {
          id
          title
          spec
        }
      }
    }
  }
`

const ReportPin = ({queryRef, reportQueryRef, orgId, pinParam, period}: Props) => {
  const {viewer} = usePreloadedQuery<ReportPinQuery>(query, queryRef)
  const navigate = useNavigate()
  const pinnedReports = viewer.organization?.pinnedReports
  const reportPin = useMemo(() => findReportPin(pinnedReports, pinParam), [pinnedReports, pinParam])
  const onSpecChange = useReportSpecChange(orgId, null, (nextSpec, questionId) =>
    toReportPagePath(orgId, nextSpec, period, questionId)
  )
  if (!reportPin) {
    return (
      <ReportLinkMissing orgId={orgId} period={period} message='This report isn’t pinned anymore' />
    )
  }
  if (!reportQueryRef) return <ReportPageLoadError />
  const {pin, spec} = reportPin
  const onPeriodChange = (nextPeriod: ReportPagePeriod) => {
    navigate({href: toReportPinPath(orgId, pin.id, nextPeriod), replace: true})
  }
  return (
    <ReportPage
      queryRef={reportQueryRef}
      orgId={orgId}
      spec={spec}
      title={pin.title}
      period={period}
      reportQuestionId={null}
      onPeriodChange={onPeriodChange}
      onSpecChange={onSpecChange}
    />
  )
}

export default ReportPin
