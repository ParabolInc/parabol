import {Suspense, useState} from 'react'
import retroDrawerQuery, {RetroDrawerQuery} from '../__generated__/RetroDrawerQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import MeetingOptions from './MeetingOptions'
import RetroDrawer from './RetroDrawer'

type Props = {
  meetingId: string
}

const RetroDrawerRoot = (props: Props) => {
  const {meetingId} = props
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)

  const handleOpenMenu = () => {
    setIsMenuOpen(true)
  }

  const queryRef = useQueryLoaderNow<RetroDrawerQuery>(retroDrawerQuery, {
    first: 2000,
    type: 'retrospective',
    meetingId,
    isMenuOpen
  })
  return (
    <>
      <MeetingOptions
        showDrawer={showDrawer}
        setShowDrawer={setShowDrawer}
        handleOpenMenu={handleOpenMenu}
        meetingId={meetingId}
      />
      <Suspense fallback={''}>
        {queryRef && (
          <RetroDrawer queryRef={queryRef} showDrawer={showDrawer} setShowDrawer={setShowDrawer} />
        )}
      </Suspense>
    </>
  )
}

export default RetroDrawerRoot
