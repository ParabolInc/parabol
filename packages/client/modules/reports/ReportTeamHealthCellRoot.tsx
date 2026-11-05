import {Suspense} from 'react'
import type {PreloadedQuery} from 'react-relay'
import type {ReportTeamHealthCellDetailsQuery} from '../../__generated__/ReportTeamHealthCellDetailsQuery.graphql'
import ReportTeamHealthCellDetails from './ReportTeamHealthCellDetails'
import type {ReportTeamHealthSelection} from './reportTeamHealthCells'

interface Props {
  queryRef: PreloadedQuery<ReportTeamHealthCellDetailsQuery> | null | undefined
  selection: ReportTeamHealthSelection
}

const LOADING = (
  <div aria-busy className='flex flex-col gap-3'>
    <span className='h-4 w-1/3 animate-pulse rounded bg-surface-raised' />
    <span className='h-10 w-full animate-pulse rounded bg-surface-raised' />
    <span className='h-24 w-full animate-pulse rounded bg-surface-raised' />
  </div>
)

const ReportTeamHealthCellRoot = ({queryRef, selection}: Props) => {
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
