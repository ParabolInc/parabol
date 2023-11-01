import React, {Suspense} from 'react'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import retroDrawerQuery, {RetroDrawerQuery} from '../__generated__/RetroDrawerQuery.graphql'
import RetroDrawer from './RetroDrawer'

type Props = {
  showDrawer: boolean
  setShowDrawer: (showDrawer: boolean) => void
}

const RetroDrawerRoot = (props: Props) => {
  const {showDrawer, setShowDrawer} = props
  const queryRef = useQueryLoaderNow<RetroDrawerQuery>(retroDrawerQuery, {first: 200})
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <RetroDrawer showDrawer={showDrawer} setShowDrawer={setShowDrawer} queryRef={queryRef} />
      )}
    </Suspense>
  )
}

export default RetroDrawerRoot
