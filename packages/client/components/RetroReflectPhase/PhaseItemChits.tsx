import {ElementWidth} from '../../types/constEnums'
import {cn} from '../../ui/cn'
import plural from '../../utils/plural'
import TinyLabel from '../TinyLabel'

interface Props {
  count: number
  editorCount: number
}

const CHIT_MARGIN = 4
const CHIT_GUTTER = 8
const CHITS_PER_ROW = 8
const CHIT_WIDTH =
  (ElementWidth.REFLECTION_CARD_PADDED - CHIT_GUTTER * (CHITS_PER_ROW - 1)) / CHITS_PER_ROW
const CHIT_HEIGHT = 16
const OFFSET = CHIT_MARGIN * 2 + CHIT_WIDTH
const PROGRESS_WIDTH = ElementWidth.REFLECTION_CARD
const PROGRESS_MARGIN = 2
const SHIFT_DURATION = 2000

const getStatus = (count: number, editorCount: number) => {
  if (count) {
    const status = `${count} team member ${plural(count, 'reflection')}`
    if (editorCount) {
      return `${status} + ${editorCount} in progress`
    }
    return status
  } else if (editorCount) {
    return `${editorCount} team ${plural(editorCount, 'member')} writing reflections...`
  }
  return ''
}

const overflowStyles = [
  'rotate-2 brightness-95',
  '-rotate-3 brightness-90',
  '-rotate-2 brightness-85'
]
const overflowTops = [4, 2, -2]
const overflowLefts = [4, 6, 4]

const PhaseItemChits = (props: Props) => {
  const {count, editorCount} = props
  const totalCount = count + editorCount
  const chitCount = Math.min(totalCount, CHITS_PER_ROW + overflowStyles.length)

  const chitList = Array.from({length: chitCount})
    .map((_, idx) => {
      const isOverflow = idx >= CHITS_PER_ROW
      const overflowIdx = idx - CHITS_PER_ROW
      return (
        <div
          key={totalCount - idx}
          className={cn(
            'absolute animate-chit-fade-in rounded-[2px] bg-surface-card shadow-card transition-all duration-300',
            isOverflow ? overflowStyles[overflowIdx] : ''
          )}
          style={{
            height: CHIT_HEIGHT,
            width: CHIT_WIDTH,
            top: !isOverflow ? 0 : overflowTops[overflowIdx]!,
            left: !isOverflow
              ? idx * (CHIT_WIDTH + CHIT_GUTTER)
              : (CHITS_PER_ROW - 1) * (CHIT_WIDTH + CHIT_GUTTER) + overflowLefts[overflowIdx]!
          }}
        >
          {idx < editorCount && (
            <div
              className='m-0.5 overflow-hidden rounded-[2px]'
              style={{
                height: CHIT_HEIGHT - PROGRESS_MARGIN * 2,
                width: CHIT_WIDTH - PROGRESS_MARGIN * 2
              }}
            >
              <div
                className='animate-chit-shift bg-[linear-gradient(90deg,var(--color-grape-500)_0%,var(--color-tomato-500)_33%,var(--color-aqua-400)_66%,var(--color-grape-500)_100%)]'
                style={{
                  height: CHIT_HEIGHT,
                  width: PROGRESS_WIDTH,
                  animationDelay: `${-((idx * OFFSET) / PROGRESS_WIDTH) * SHIFT_DURATION}ms`
                }}
              />
            </div>
          )}
        </div>
      )
    })
    .reverse()

  return (
    <div className='flex flex-none flex-col'>
      <TinyLabel className='mb-[1em]'>{getStatus(count, editorCount)}</TinyLabel>
      <div className='relative h-5 w-full'>{chitList}</div>
    </div>
  )
}

export default PhaseItemChits
