import {lazy, Suspense} from 'react'
import {useSelector} from 'react-redux'

import {isInviteToMeetingModalVisible} from '../../selectors'

const InviteToMeetingModal = lazy(
  () => import(/* webpackChunkName: 'CreateTaskModal' */ './InviteToMeetingModal')
)

const InviteToMeetingModalRoot = () => {
  const isVisible = useSelector(isInviteToMeetingModalVisible)
  if (!isVisible) {
    return null
  }
  return (
    <Suspense fallback={null}>
      <InviteToMeetingModal />
    </Suspense>
  )
}

export default InviteToMeetingModalRoot
