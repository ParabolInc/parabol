import React, {Suspense} from 'react'
import retroDrawerQuery, {RetroDrawerQuery} from '../__generated__/RetroDrawerQuery.graphql'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import RetroDrawer from './RetroDrawer'

type Props = {
  showDrawer: boolean
  setShowDrawer: (showDrawer: boolean) => void
  meetingId: string
}

const RetroDrawerRoot = (props: Props) => {
  const {showDrawer, setShowDrawer, meetingId} = props
  const queryRef = useQueryLoaderNow<RetroDrawerQuery>(retroDrawerQuery, {
    first: 2000,
    type: 'retrospective',
    meetingId
  })
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <RetroDrawer showDrawer={showDrawer} setShowDrawer={setShowDrawer} queryRef={queryRef} />
      )}
    </Suspense>
  )
}

export default RetroDrawerRoot
