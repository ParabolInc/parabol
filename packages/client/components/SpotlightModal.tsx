import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import {type RefObject, useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import {MAX_SPOTLIGHT_COLUMNS, SPOTLIGHT_TOP_SECTION_HEIGHT} from '~/utils/constants'
import makeMinWidthMediaQuery from '~/utils/makeMinWidthMediaQuery'
import type {SpotlightModal_meeting$key} from '../__generated__/SpotlightModal_meeting.graphql'
import {Elevation} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {Breakpoint, ElementWidth, Times, ZIndex} from '../types/constEnums'
import SpotlightResultsRoot from './SpotlightResultsRoot'
import SpotlightSearchBar from './SpotlightSearchBar'
import SpotlightSourceGroup from './SpotlightSourceGroup'
import SpotlightTopBar from './SpotlightTopBar'

const desktopBreakpoint = makeMinWidthMediaQuery(Breakpoint.SIDEBAR_LEFT)
const MODAL_PADDING = 72

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

const modalStyles = {
  backgroundColor: `${PALETTE.WHITE}`,
  borderRadius: 8,
  boxShadow: Elevation.Z8,
  display: 'flex' as const,
  flexDirection: 'column' as const,
  height: '90vh',
  justifyContent: 'flex-start' as const,
  margin: 'auto',
  position: 'fixed' as const,
  inset: 0,
  width: '90vw',
  zIndex: ZIndex.DIALOG,
  [desktopBreakpoint]: {
    height: '100%',
    width: `${ElementWidth.REFLECTION_COLUMN * MAX_SPOTLIGHT_COLUMNS + MODAL_PADDING}px`
  }
}

interface Props {
  closeSpotlight: () => void
  meetingRef: SpotlightModal_meeting$key
  sourceRef: RefObject<HTMLDivElement>
}

const SpotlightModal = (props: Props) => {
  const {closeSpotlight, meetingRef, sourceRef} = props
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
  const {spotlightGroup, spotlightReflectionId} = meeting
  const sourceReflections = spotlightGroup?.reflections
  const reflectionIdsToHideRef = useRef<string[] | null>(null)

  if (reflectionIdsToHideRef.current === null && sourceReflections) {
    reflectionIdsToHideRef.current = sourceReflections
      .filter(({id}) => id !== spotlightReflectionId)
      .map(({id}) => id)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSpotlight()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [closeSpotlight])

  useEffect(() => {
    if (!spotlightGroup) return
    let timeout: number | undefined
    const sourceReflectionIds = sourceReflections?.map(({id}) => id)
    if (!spotlightReflectionId || !sourceReflectionIds?.includes(spotlightReflectionId)) {
      timeout = window.setTimeout(() => {
        closeSpotlight()
      }, Times.REFLECTION_DROP_DURATION)
    }
    return () => clearTimeout(timeout)
  }, [sourceReflections])

  return (
    <motion.div
      ref={modalRef}
      style={modalStyles}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0, transition: {duration: Times.SPOTLIGHT_MODAL_DURATION / 1000, delay: 0}}}
      transition={{
        duration: Times.SPOTLIGHT_MODAL_DURATION / 1000,
        delay: Times.SPOTLIGHT_SOURCE_DURATION / 1000
      }}
    >
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
      <SpotlightResultsRoot phaseRef={modalRef} meetingRef={meeting} />
    </motion.div>
  )
}
export default SpotlightModal
