import {lazy, Suspense} from 'react'
import {useSelector} from 'react-redux'

import {isCreateTaskModalVisible} from '../../selectors'

const CreateTaskModal = lazy(
  () => import(/* webpackChunkName: 'CreateTaskModal' */ './CreateTaskModal')
)

const CreateTaskModalRoot = () => {
  const isVisible = useSelector(isCreateTaskModalVisible)
  if (!isVisible) {
    return null
  }
  return (
    <Suspense fallback={null}>
      <CreateTaskModal />
    </Suspense>
  )
}

export default CreateTaskModalRoot
