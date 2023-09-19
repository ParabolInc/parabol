import React, {Suspense} from 'react'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import parabolTasksResultsQuery, {
  ParabolTasksResultsQuery,
  TaskStatusEnum
} from '../../../__generated__/ParabolTasksResultsQuery.graphql'
import ErrorBoundary from '../../ErrorBoundary'
import ParabolTasksResults from './ParabolTasksResults'
import {renderLoader} from '~/utils/relay/renderLoader'
import useAtmosphere from '../../../hooks/useAtmosphere'

interface Props {
  selectedStatus: TaskStatusEnum
}

const ParabolTasksResultsRoot = (props: Props) => {
  const {selectedStatus} = props
  const atmosphere = useAtmosphere()
  const queryRef = useQueryLoaderNow<ParabolTasksResultsQuery>(parabolTasksResultsQuery, {
    userId: atmosphere.viewerId
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={renderLoader()}>
        {queryRef && <ParabolTasksResults queryRef={queryRef} selectedStatus={selectedStatus} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default ParabolTasksResultsRoot
