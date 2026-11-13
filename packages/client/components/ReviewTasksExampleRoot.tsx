import {type ReactNode, Suspense} from 'react'
import type {ReviewTasksExampleQuery} from '../__generated__/ReviewTasksExampleQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import ReviewTasksExample, {reviewTasksExampleQuery} from './ReviewTasksExample'

interface Props {
  board: ReactNode
  teamId: string
}

const ReviewTasksExampleRoot = (props: Props) => {
  const {board, teamId} = props
  const queryRef = useQueryLoaderNow<ReviewTasksExampleQuery>(reviewTasksExampleQuery, {teamId})
  return (
    <Suspense fallback={null}>
      {queryRef && <ReviewTasksExample board={board} queryRef={queryRef} teamId={teamId} />}
    </Suspense>
  )
}

export default ReviewTasksExampleRoot
