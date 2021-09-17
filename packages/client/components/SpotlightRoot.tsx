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
  spotlightGroupId?: string
}

const SpotlightRoot = (props: Props) => {
  const {closeSpotlight, meetingId, flipRef, spotlightGroupId} = props
  const searchQuery = '' // TODO: implement searchQuery
  const groupIdRef = useRef('')
  const nextGroupId = spotlightGroupId ?? ''
  if (nextGroupId) {
    groupIdRef.current = nextGroupId
  }
  const queryRef = useQueryLoaderNow<SpotlightModalQuery>(
    spotlightModalQuery,
    {
      reflectionGroupId: groupIdRef.current,
      searchQuery,
      meetingId
    },
    'network-only'
  )
  return (
    <Suspense fallback={''}>
      {queryRef && (
        <SpotlightModal closeSpotlight={closeSpotlight} flipRef={flipRef} queryRef={queryRef} />
      )}
    </Suspense>
  )
}
export default SpotlightRoot
