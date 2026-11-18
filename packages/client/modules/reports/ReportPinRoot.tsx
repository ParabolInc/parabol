import {useLocation, useParams} from '@tanstack/react-router'
import {Suspense, useMemo} from 'react'
import reportPinQuery, {type ReportPinQuery} from '../../__generated__/ReportPinQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import ReportPin from './ReportPin'
import {parseReportPeriodParam} from './reportPeriodParam'

const ReportPinRoot = () => {
  const {orgId, pinParam} = useParams({strict: false})
  const searchStr = useLocation({select: (location) => location.searchStr})
  const searchParams = useMemo(() => new URLSearchParams(searchStr), [searchStr])
  const period = parseReportPeriodParam(searchParams.get('period'))
  const queryRef = useQueryLoaderNow<ReportPinQuery>(reportPinQuery, {orgId: orgId!})
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <ReportPin queryRef={queryRef} orgId={orgId!} pinParam={pinParam!} period={period} />
      )}
    </Suspense>
  )
}

export default ReportPinRoot
