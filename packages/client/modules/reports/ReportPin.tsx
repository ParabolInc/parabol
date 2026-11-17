import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {ReportPinQuery} from '../../__generated__/ReportPinQuery.graphql'
import ReportLinkMissing from './ReportLinkMissing'
import ReportPageLoader from './ReportPageLoader'
import {toReportPinParam} from './reportPaths'
import type {ReportPagePeriod} from './reportPeriodParam'
import {parseReportSpecJSON} from './reportSpecParam'

interface Props {
  queryRef: PreloadedQuery<ReportPinQuery>
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

const ReportPin = ({queryRef, orgId, pinParam, period}: Props) => {
  const {viewer} = usePreloadedQuery<ReportPinQuery>(query, queryRef)
  const pin = viewer.organization?.pinnedReports.find(({id}) => toReportPinParam(id) === pinParam)
  const spec = useMemo(() => (pin ? parseReportSpecJSON(pin.spec) : null), [pin])
  if (!pin || !spec) {
    return (
      <ReportLinkMissing orgId={orgId} period={period} message='This report isn’t pinned anymore' />
    )
  }
  return (
    <ReportPageLoader
      orgId={orgId}
      spec={spec}
      title={pin.title}
      pinId={pin.id}
      period={period}
      reportQuestionId={null}
    />
  )
}

export default ReportPin
