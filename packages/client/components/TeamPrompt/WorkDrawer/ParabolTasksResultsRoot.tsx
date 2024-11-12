import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import parabolTasksResultsQuery, {
  ParabolTasksResultsQuery,
  TaskStatusEnum
} from '../../../__generated__/ParabolTasksResultsQuery.graphql'
import useAtmosphere from '../../../hooks/useAtmosphere'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import ParabolTasksResults from './ParabolTasksResults'

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
      <Suspense fallback={<Loader />}>
        {queryRef && <ParabolTasksResults queryRef={queryRef} selectedStatus={selectedStatus} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default ParabolTasksResultsRoot
