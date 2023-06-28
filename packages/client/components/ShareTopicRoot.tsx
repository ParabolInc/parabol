import React, {Suspense, useCallback, useEffect} from 'react'
import {useHistory, useLocation} from 'react-router'
import useRouter from '../hooks/useRouter'
import ShareTopicModal from '~/components/ShareTopicModal'
import {renderLoader} from '../utils/relay/renderLoader'

const ShareTopicRoot = () => {
  const {match} = useRouter<{stageId: string; meetingId: string}>()
  const {params} = match

  const {meetingId, stageId} = params

  const location = useLocation<{backgroundLocation?: Location}>()
  const history = useHistory()

  const [open, setOpen] = React.useState(false)

  const onClose = useCallback(() => {
    const state = location.state
    history.replace(state?.backgroundLocation ?? `/new-summary/${meetingId}`)
  }, [location])

  useEffect(() => {
    setOpen(true)
    return () => {
      setOpen(false)
    }
  }, [])

  return (
    <Suspense fallback={renderLoader()}>
      <ShareTopicModal stageId={stageId} open={open} onClose={onClose} />
    </Suspense>
  )
}

export default ShareTopicRoot
