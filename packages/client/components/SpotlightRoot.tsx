import React, {Suspense, useRef} from 'react'
import spotlightModalQuery, {
  SpotlightModalQuery
} from '../__generated__/SpotlightModalQuery.graphql'
import SpotlightModal from './SpotlightModal'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'

interface Props {
  closeSpotlight: () => void
  meetingId: string
  flipRef: (instance: HTMLDivElement) => void
  spotlightReflectionId?: string
}

const SpotlightRoot = (props: Props) => {
  const {closeSpotlight, meetingId, flipRef, spotlightReflectionId} = props
  const searchQuery = '' // TODO: implement searchQuery
  const reflectionIdRef = useRef('')
  const nextReflectionId = spotlightReflectionId ?? ''
  if (nextReflectionId) {
    reflectionIdRef.current = nextReflectionId
  }
  const queryRef = useQueryLoaderNow<SpotlightModalQuery>(spotlightModalQuery, {
    reflectionId: reflectionIdRef.current,
    searchQuery,
    meetingId
  })
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <SpotlightModal closeSpotlight={closeSpotlight} flipRef={flipRef} queryRef={queryRef} />
      )}
    </Suspense>
  )
}
export default SpotlightRoot
