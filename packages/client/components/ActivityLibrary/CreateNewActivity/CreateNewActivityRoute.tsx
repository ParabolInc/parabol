import React, {Suspense} from 'react'

import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {renderLoader} from '../../../utils/relay/renderLoader'
import {CreateNewActivity} from './CreateNewActivity'

import createNewActivityQuery, {
  CreateNewActivityQuery
} from '~/__generated__/CreateNewActivityQuery.graphql'

const CreateNewActivityRoute = () => {
  const queryRef = useQueryLoaderNow<CreateNewActivityQuery>(createNewActivityQuery)

  return (
    <Suspense fallback={renderLoader()}>
      {queryRef && <CreateNewActivity queryRef={queryRef} />}
    </Suspense>
  )
}

export default CreateNewActivityRoute
