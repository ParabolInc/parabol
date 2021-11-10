import styled from '@emotion/styled'
import React, {RefObject, Suspense, useEffect, useRef, useState} from 'react'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {Elevation} from '../styles/elevation'
import spotlightResultsRootQuery, {
  SpotlightResultsRootQuery
} from '../__generated__/SpotlightResultsRootQuery.graphql'
import SpotlightResultsRoot from './SpotlightResultsRoot'
import SpotlightTopBar from './SpotlightTopBar'
import SpotlightSearchBar from './SpotlightSearchBar'
import useQueryLoaderNow from '../hooks/useQueryLoaderNow'
import SpotlightSourceReflectionCard from './SpotlightSourceReflectionCard'
import {PALETTE} from '../styles/paletteV3'
import {GroupingKanban_meeting$data} from '../__generated__/GroupingKanban_meeting.graphql'
import {
  BezierCurve,
  Breakpoint,
  ElementWidth,
  Spotlight,
  Times,
  ZIndex
} from '../types/constEnums'
import {MAX_SPOTLIGHT_COLUMNS} from '~/utils/constants'
import {PortalStatus} from '~/hooks/usePortal'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)
const MODAL_PADDING = 72

const Modal = styled('div')<{hideModal: boolean}>(({hideModal}) => ({
  backgroundColor: `${PALETTE.WHITE}`,
  borderRadius: 8,
  boxShadow: Elevation.Z8,
  display: 'flex',
  flexDirection: 'column',
  height: '90vh',
  justifyContent: 'center',
  // We animate the source and then fade in the modal behind it. Source animation needs to know its
  // final position in the modal so render the modal with opacity 0 until source animation is complete.
  opacity: hideModal ? 0 : 1,
  transition: `opacity ${Times.SPOTLIGHT_MODAL_DURATION}ms ${BezierCurve.DECELERATE}`,
  width: '90vw',
  zIndex: ZIndex.DIALOG,
  [desktopBreakpoint]: {
    height: '100%',
    width: `${ElementWidth.REFLECTION_COLUMN * MAX_SPOTLIGHT_COLUMNS + MODAL_PADDING}px`
  }
}))

const SourceSection = styled('div')({
  background: PALETTE.SLATE_100,
  borderRadius: '8px 8px 0px 0px',
  display: 'flex',
  flexWrap: 'wrap',
  height: `${Spotlight.SELECTED_HEIGHT_PERC}%`,
  justifyContent: 'center',
  padding: 16,
  position: 'relative',
  width: '100%'
})
interface Props {
  closeSpotlight: () => void
  meeting: GroupingKanban_meeting$data
  sourceRef: RefObject<HTMLDivElement>
  portalStatus: number
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, meeting, sourceRef, portalStatus} = props
  const modalRef = useRef<HTMLDivElement>(null)
  const [hideModal, setHideModal] = useState(true)
  const {id: meetingId, spotlightGroup, spotlightReflectionId} = meeting
  const sourceReflections = spotlightGroup?.reflections
  const spotlightGroupId = spotlightGroup?.id
  const groupIdRef = useRef('')
  const nextGroupId = spotlightGroupId ?? ''
  if (nextGroupId) {
    groupIdRef.current = nextGroupId
  }
  const reflectionIdsToHideRef = useRef<string[] | null>(null)
  if (!spotlightReflectionId) {
    return null
  }
  const spotlightSearchQuery = meeting.spotlightSearchQuery ?? ""


  useEffect(() => {
    if (!spotlightGroup) return
    let timeout: number | undefined
    const sourceReflectionIds = sourceReflections?.map(({id}) => id)
    if (reflectionIdsToHideRef.current === null) {
      // if Spotlight group initially contains several reflections, only show reflection at the top of the stack
      reflectionIdsToHideRef.current =
        sourceReflections?.filter(({id}) => id !== spotlightReflectionId).map(({id}) => id) || []
    } else if (!spotlightReflectionId || !sourceReflectionIds?.includes(spotlightReflectionId)) {
      timeout = window.setTimeout(() => {
        closeSpotlight()
      }, Times.REFLECTION_DROP_DURATION)
    }
    return () => clearTimeout(timeout)
  }, [sourceReflections])

  useEffect(() => {
    if (portalStatus !== PortalStatus.Entered) return
    const timeout = setTimeout(() => {
      setHideModal(false)
    }, Times.SPOTLIGHT_SOURCE_DURATION)
    return () => clearTimeout(timeout)
  }, [portalStatus])


  const queryRef = useQueryLoaderNow<SpotlightResultsRootQuery>(spotlightResultsRootQuery, {
    reflectionGroupId: groupIdRef.current,
    searchQuery: spotlightSearchQuery,
    meetingId
  }, 'network-only')
  return (
    <Modal hideModal={hideModal} ref={modalRef}>
      <SourceSection>
        <SpotlightTopBar closeSpotlight={closeSpotlight} />
        <SpotlightSourceReflectionCard meeting={meeting} sourceRef={sourceRef} modalRef={modalRef} reflectionIdsToHideRef={reflectionIdsToHideRef} />
        <SpotlightSearchBar meetingId={meetingId} spotlightSearchQuery={spotlightSearchQuery} />
      </SourceSection>
      <Suspense fallback={''}>
        {queryRef && (
          <SpotlightResultsRoot queryRef={queryRef} phaseRef={modalRef} />
        )}
      </Suspense>
    </Modal>
  )
}
export default SpotlightModal
