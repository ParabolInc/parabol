import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {RefObject, useEffect, useRef, useState} from 'react'
import {useFragment} from 'react-relay'
import {PortalStatus} from '~/hooks/usePortal'
import {MAX_SPOTLIGHT_COLUMNS, SPOTLIGHT_TOP_SECTION_HEIGHT} from '~/utils/constants'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {BezierCurve, Breakpoint, ElementWidth, Times, ZIndex} from '../types/constEnums'
import {SpotlightModal_meeting$key} from '../__generated__/SpotlightModal_meeting.graphql'
import SpotlightResultsRoot from './SpotlightResultsRoot'
import SpotlightSearchBar from './SpotlightSearchBar'
import SpotlightSourceGroup from './SpotlightSourceGroup'
import SpotlightTopBar from './SpotlightTopBar'

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
  minHeight: SPOTLIGHT_TOP_SECTION_HEIGHT,
  justifyContent: 'space-between',
  padding: 16,
  position: 'relative',
  width: '100%',
  flexDirection: 'column',
  alignItems: 'center'
})
interface Props {
  closeSpotlight: () => void
  meetingRef: SpotlightModal_meeting$key
  sourceRef: RefObject<HTMLDivElement>
  portalStatus: number
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, meetingRef, sourceRef, portalStatus} = props
  const meeting = useFragment(
    graphql`
      fragment SpotlightModal_meeting on RetrospectiveMeeting {
        spotlightGroup {
          id
          reflections {
            id
          }
        }
        spotlightReflectionId
        ...SpotlightSearchBar_meeting
        ...SpotlightResultsRoot_meeting
        ...SpotlightSourceGroup_meeting
      }
    `,
    meetingRef
  )
  const modalRef = useRef<HTMLDivElement>(null)
  const [hideModal, setHideModal] = useState(true)
  const {spotlightGroup, spotlightReflectionId} = meeting
  const sourceReflections = spotlightGroup?.reflections
  const reflectionIdsToHideRef = useRef<string[] | null>(null)

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

  return (
    <Modal hideModal={hideModal} ref={modalRef}>
      <SourceSection>
        <SpotlightTopBar closeSpotlight={closeSpotlight} />
        <SpotlightSourceGroup
          meetingRef={meeting}
          sourceRef={sourceRef}
          modalRef={modalRef}
          reflectionIdsToHideRef={reflectionIdsToHideRef}
        />
        <SpotlightSearchBar meetingRef={meeting} />
      </SourceSection>
      <SpotlightResultsRoot
        phaseRef={modalRef}
        meetingRef={meeting}
        isSpotlightEntering={portalStatus === PortalStatus.Entering}
      />
    </Modal>
  )
}
export default SpotlightModal
