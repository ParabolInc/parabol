import {lazy, Suspense} from 'react'
import {useSelector} from 'react-redux'

import {isStartActivityModalVisible} from '../../selectors'

const StartActivityModal = lazy(
  () => import(/* webpackChunkName: 'StartActivityModal' */ './StartActivityModal')
)

const StartActivityModalRoot = () => {
  const isVisible = useSelector(isStartActivityModalVisible)
  if (!isVisible) {
    return null
  }
  return (
    <Suspense fallback={null}>
      <StartActivityModal />
    </Suspense>
  )
}

export default StartActivityModalRoot
