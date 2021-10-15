import styled from '@emotion/styled'
import React, {Suspense, useRef} from 'react'
import {DECELERATE, fadeUp} from '../styles/animation'
import useBreakpoint from '../hooks/useBreakpoint'
import {Elevation} from '../styles/elevation'
import {Breakpoint, ZIndex} from '../types/constEnums'
import spotlightResultsRootQuery, {
  SpotlightResultsRootQuery
} from '../__generated__/SpotlightResultsRootQuery.graphql'
import SpotlightResultsRoot from './SpotlightResultsRoot'
import SpotlightSearchBar from './SpotlightSearchBar'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import SpotlightSourceReflectionCard from './SpotlightSourceReflectionCard'
import {SpotlightSourceReflectionCard_meeting$key} from '../__generated__/SpotlightSourceReflectionCard_meeting.graphql'

const ModalContainer = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  animation: `${fadeUp.toString()} 300ms ${DECELERATE} 300ms forwards`,
  background: '#FFFF',
  borderRadius: 8,
  boxShadow: Elevation.Z8,
  display: 'flex',
  flexWrap: 'wrap',
  height: '80vh',
  justifyContent: 'center',
  opacity: 0,
  overflow: 'hidden',
  width: isDesktop ? '80vw' : '90vw',
  zIndex: ZIndex.DIALOG
}))
interface Props {
  closeSpotlight: () => void
  meetingId: string
  flipRef: (instance: HTMLDivElement) => void
  spotlightReflectionId?: string
  spotlightSearch: string
  meeting: SpotlightSourceReflectionCard_meeting$key
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, meetingId, flipRef, spotlightReflectionId, spotlightSearch, meeting} = props
  const reflectionIdRef = useRef('')
  const nextReflectionId = spotlightReflectionId ?? ''
  if (nextReflectionId) {
    reflectionIdRef.current = nextReflectionId
  }
  const queryRef = useQueryLoaderNow<SpotlightResultsRootQuery>(spotlightResultsRootQuery, {
    reflectionId: reflectionIdRef.current,
    searchQuery: spotlightSearch,
    meetingId
  }, 'network-only')
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  const phaseRef = useRef(null)
  return (
    <ModalContainer isDesktop={isDesktop} ref={phaseRef}>
      <SpotlightSearchBar closeSpotlight={closeSpotlight} meetingId={meetingId} spotlightSearch={spotlightSearch} />
      <Suspense fallback={''}>
          {queryRef && (
            <SpotlightResultsRoot queryRef={queryRef}/>
          )}
      </Suspense>
      <SpotlightSourceReflectionCard meeting={meeting} flipRef={flipRef} />
    </ModalContainer>
  )
}
export default SpotlightModal
