import graphql from 'babel-plugin-relay/macro'
import {motion} from 'motion/react'
import {type RefObject, useEffect, useRef} from 'react'
import {useFragment} from 'react-relay'
import type {SpotlightModal_meeting$key} from '../__generated__/SpotlightModal_meeting.graphql'
import {Times} from '../types/constEnums'
import SpotlightResultsRoot from './SpotlightResultsRoot'
import SpotlightSearchBar from './SpotlightSearchBar'
import SpotlightSourceGroup from './SpotlightSourceGroup'
import SpotlightTopBar from './SpotlightTopBar'

// z-24 = ZIndex.DIALOG; shadow = Elevation.Z8; sidebar-left width =
// ElementWidth.REFLECTION_COLUMN (320) * MAX_SPOTLIGHT_COLUMNS (3) + 72px modal padding
const modalClass =
  'fixed inset-0 z-24 m-auto flex h-[90vh] w-[90vw] flex-col justify-start rounded-lg bg-surface-card shadow-[rgba(0,0,0,.2)_0px_5px_5px_-3px,rgba(0,0,0,.14)_0px_8px_10px_1px,rgba(0,0,0,.12)_0px_3px_14px_2px] sidebar-left:h-full sidebar-left:w-[1032px]'

// min-h-[236px] = SPOTLIGHT_TOP_SECTION_HEIGHT
const sourceSectionClass =
  'relative flex min-h-[236px] w-full flex-col items-center justify-between rounded-t-lg bg-surface-raised p-4'

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
      className={modalClass}
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0, transition: {duration: Times.SPOTLIGHT_MODAL_DURATION / 1000, delay: 0}}}
      transition={{
        duration: Times.SPOTLIGHT_MODAL_DURATION / 1000,
        delay: Times.SPOTLIGHT_SOURCE_DURATION / 1000
      }}
    >
      <div className={sourceSectionClass}>
        <SpotlightTopBar closeSpotlight={closeSpotlight} />
        <SpotlightSourceGroup
          meetingRef={meeting}
          sourceRef={sourceRef}
          modalRef={modalRef}
          reflectionIdsToHideRef={reflectionIdsToHideRef}
        />
        <SpotlightSearchBar meetingRef={meeting} />
      </div>
      <SpotlightResultsRoot phaseRef={modalRef} meetingRef={meeting} />
    </motion.div>
  )
}
export default SpotlightModal
