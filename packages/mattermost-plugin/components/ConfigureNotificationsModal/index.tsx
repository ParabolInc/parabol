import {lazy, Suspense} from 'react'
import {useSelector} from 'react-redux'

import {isConfigureNotificationsModalVisible} from '../../selectors'

const ConfigureNotificationsModal = lazy(
  () =>
    import(/* webpackChunkName: 'ConfigureNotificationsModal' */ './ConfigureNotificationsModal')
)

const ConfigureNotificationsModalRoot = () => {
  const isVisible = useSelector(isConfigureNotificationsModalVisible)
  if (!isVisible) {
    return null
  }

  return (
    <Suspense fallback={null}>
      <ConfigureNotificationsModal />
    </Suspense>
  )
}

export default ConfigureNotificationsModalRoot
