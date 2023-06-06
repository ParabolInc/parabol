import React, {Suspense, useCallback, useEffect} from 'react'
import {useHistory, useLocation} from 'react-router'
import useRouter from '../hooks/useRouter'
import useModal from '../hooks/useModal'
import ShareTopicModal from '~/components/ShareTopicModal'
const ShareTopicRoot = () => {
  const {match} = useRouter<{stageId: string; meetingId: string}>()
  const {params} = match

  const {meetingId} = params

  const location = useLocation<{backgroundLocation?: Location}>()
  const history = useHistory()

  const onClose = useCallback(() => {
    const state = location.state
    history.replace(state?.backgroundLocation ?? `/new-summary/${meetingId}`)
  }, [location])

  const {openPortal, closePortal, modalPortal} = useModal({
    id: 'shareTopicModal',
    onClose
  })

  useEffect(() => {
    openPortal()
    return () => {
      closePortal()
    }
  }, [])

  return (
    <Suspense fallback={''}>{modalPortal(<ShareTopicModal closePortal={closePortal} />)}</Suspense>
  )
}

export default ShareTopicRoot
