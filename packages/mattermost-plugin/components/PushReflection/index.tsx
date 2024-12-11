import {lazy, Suspense} from 'react'
import {useSelector} from 'react-redux'

import {pushPostAsReflection} from '../../selectors'

const PushReflectionModal = lazy(
  () => import(/* webpackChunkName: 'PushReflectionModal' */ './PushReflectionModal')
)

const PushReflectionModalRoot = () => {
  const postId = useSelector(pushPostAsReflection)
  if (!postId) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <PushReflectionModal />
    </Suspense>
  )
}

export default PushReflectionModalRoot
