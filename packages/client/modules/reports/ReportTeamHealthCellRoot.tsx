import {Suspense} from 'react'
import reportTeamHealthCellDetailsQuery, {
  type ReportTeamHealthCellDetailsQuery
} from '../../__generated__/ReportTeamHealthCellDetailsQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import ReportTeamHealthCellDetails from './ReportTeamHealthCellDetails'
import type {ReportTeamHealthSelection} from './reportTeamHealthCells'

interface Props {
  orgId: string
  selection: ReportTeamHealthSelection
}

const LOADING = (
  <div aria-busy className='flex flex-col gap-3'>
    <span className='h-4 w-1/3 animate-pulse rounded bg-surface-raised' />
    <span className='h-10 w-full animate-pulse rounded bg-surface-raised' />
    <span className='h-24 w-full animate-pulse rounded bg-surface-raised' />
  </div>
)

const ReportTeamHealthCellRoot = ({orgId, selection}: Props) => {
  const {check, category} = selection.cell
  const queryRef = useQueryLoaderNow<ReportTeamHealthCellDetailsQuery>(
    reportTeamHealthCellDetailsQuery,
    {orgId, meetingId: check.meetingId, categoryId: category.categoryId}
  )
  return (
    <Suspense fallback={LOADING}>
      {queryRef ? (
        <ReportTeamHealthCellDetails queryRef={queryRef} selection={selection} />
      ) : (
        LOADING
      )}
    </Suspense>
  )
}

export default ReportTeamHealthCellRoot
