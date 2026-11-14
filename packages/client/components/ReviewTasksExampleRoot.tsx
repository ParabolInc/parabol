import {type ReactNode, Suspense} from 'react'
import type {ReviewTasksExampleQuery} from '../__generated__/ReviewTasksExampleQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import ReviewTasksExample, {reviewTasksExampleQuery} from './ReviewTasksExample'

interface Props {
  fallback: ReactNode
  render: (example: ReactNode | null) => ReactNode
  teamId: string
}

const ReviewTasksExampleRoot = (props: Props) => {
  const {fallback, render, teamId} = props
  const queryRef = useQueryLoaderNow<ReviewTasksExampleQuery>(reviewTasksExampleQuery, {teamId})
  return (
    <Suspense fallback={fallback}>
      {queryRef ? (
        <ReviewTasksExample queryRef={queryRef} render={render} teamId={teamId} />
      ) : (
        fallback
      )}
    </Suspense>
  )
}

export default ReviewTasksExampleRoot
