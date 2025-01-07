import {lazy, Suspense} from 'react'
import {useSelector} from 'react-redux'

import {isInviteToTeamModalVisible} from '../../selectors'

const InviteToTeamModal = lazy(
  () => import(/* webpackChunkName: 'CreateTaskModal' */ './InviteToTeamModal')
)

const InviteToTeamModalRoot = () => {
  const isVisible = useSelector(isInviteToTeamModalVisible)
  if (!isVisible) {
    return null
  }
  return (
    <Suspense fallback={null}>
      <InviteToTeamModal />
    </Suspense>
  )
}

export default InviteToTeamModalRoot
