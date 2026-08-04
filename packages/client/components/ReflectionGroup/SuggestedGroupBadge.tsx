import AddToPhotosIcon from '@mui/icons-material/AddToPhotos'
import {motion} from 'motion/react'
import {cn} from '../../ui/cn'

/** idle: the card belongs to a suggestion. match/source: that suggestion is being hovered */
export type SuggestedGroupBadgeState = 'idle' | 'match' | 'source'

interface Props {
  state: SuggestedGroupBadgeState
  /** The Group button is hovered, so the source and its matches all light up together */
  isGroupMatchArmed?: boolean
  /** Merge every matched group into this one. Only reachable from the source state */
  onGroup?: () => void
  /** Light this group and its matches: pointing at the badge, or tapping the resting hint */
  onHoverGroup?: () => void
  onLeaveGroup?: () => void
}

// Wide enough to hold the icon, narrow enough that the arc clears the card's first line of text
const BADGE_SIZE = 20
// A quarter disc pinned to the card's top-right corner: the outer corner follows the card's own
// radius and the arc faces back into the card
const IDLE_RADII = {
  borderTopLeftRadius: 0,
  borderTopRightRadius: 4,
  borderBottomRightRadius: 0,
  borderBottomLeftRadius: BADGE_SIZE
}
// Half the pill's height is enough to round both ends, and it interpolates cleanly from the disc
const PILL_RADII = {
  borderTopLeftRadius: 12,
  borderTopRightRadius: 12,
  borderBottomRightRadius: 12,
  borderBottomLeftRadius: 12
}

/**
 * Advertises that a card belongs to a suggested group before anyone hovers it.
 *
 * At rest it's a quarter disc in the corner, mirroring the prompt's ColorBadge on the other side.
 * Hovering the card promotes it in place — the same element grows into the pill (or the Group
 * button on the hovered card itself) and deepens in color, so the hint and the action read as one
 * affordance rather than two badges swapping.
 */
const SuggestedGroupBadge = (props: Props) => {
  const {state, isGroupMatchArmed, onGroup, onHoverGroup, onLeaveGroup} = props
  const isIdle = state === 'idle'
  const isSource = state === 'source'
  const radii = isIdle ? IDLE_RADII : PILL_RADII
  return (
    <motion.button
      type='button'
      layout
      // A tap has no hover to promote the hint with, so the badge itself is the promotion: the
      // first tap grows it into the Group button, the second one merges. Only tab-reachable once
      // it is that button, so a board of hints doesn't become a board of tab stops
      tabIndex={isSource ? 0 : -1}
      aria-label={isSource ? 'Group these reflections' : 'Show the suggested group'}
      initial={{opacity: 0, ...radii}}
      animate={{opacity: 1, ...radii}}
      exit={{opacity: 0}}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 40,
        mass: 0.6,
        opacity: {duration: 0.15}
      }}
      onClick={isSource ? onGroup : onHoverGroup}
      onMouseEnter={onHoverGroup}
      onMouseLeave={onLeaveGroup}
      className={cn(
        'absolute z-10 flex cursor-pointer overflow-hidden font-semibold text-white transition-colors duration-150',
        // Grape is categorical and doesn't flip with the theme, so the resting hint is a step
        // lighter than the lit state in light mode and a step dimmer in dark mode
        isIdle
          ? 'top-0 right-0 size-5 items-start justify-end bg-grape-500 p-0.5 dark:bg-grape-600/60'
          : '-top-2 right-2 items-center justify-center whitespace-nowrap px-2 py-0.5 text-xs leading-4 shadow',
        !isIdle && (isGroupMatchArmed ? 'bg-grape-700 dark:bg-grape-500' : 'bg-grape-600'),
        // Darkening on hover reads as "pressed" on a light board but as fading into the surface on
        // a dark one, where lifting to grape-500 (the Suggest Groups fill) is the legible direction
        isSource && 'hover:bg-grape-700 dark:hover:bg-grape-500',
        // A mouse promotes the hint by hovering the card, so letting the hint itself take the
        // pointer would start a flicker: it grows out from under the cursor, unhovers, shrinks
        // back. Only a coarse pointer, which has no hover to lose, gets to hit it directly
        !isSource && 'pointer-events-none pointer-coarse:pointer-events-auto'
      )}
    >
      <motion.span layout='position' className='flex items-center'>
        {isSource ? 'Group ✨' : <AddToPhotosIcon className='size-3' />}
      </motion.span>
    </motion.button>
  )
}

export default SuggestedGroupBadge
