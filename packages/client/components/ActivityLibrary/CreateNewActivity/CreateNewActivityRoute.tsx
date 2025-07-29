import {Suspense} from 'react'
import createNewActivityQuery, {
  type CreateNewActivityQuery
} from '~/__generated__/CreateNewActivityQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {Loader} from '../../../utils/relay/renderLoader'
import {CreateNewActivity} from './CreateNewActivity'

const CreateNewActivityRoute = () => {
  const queryRef = useQueryLoaderNow<CreateNewActivityQuery>(createNewActivityQuery)

  return (
    <Suspense fallback={<Loader />}>
      {queryRef && <CreateNewActivity queryRef={queryRef} />}
    </Suspense>
  )
}

export default CreateNewActivityRoute
