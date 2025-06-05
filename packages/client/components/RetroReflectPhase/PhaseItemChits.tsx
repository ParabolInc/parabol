import {keyframes} from '@emotion/react'
import styled from '@emotion/styled'
import {DECELERATE, fadeIn} from '../../styles/animation'
import {Elevation} from '../../styles/elevation'
import {PALETTE} from '../../styles/paletteV3'
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

// easiest way to debug this is to just print it to a string
// we need 4 things to fake a circle:
// pos at 0%, % when pos is at progress width, % when pos is back at 0, and pos at 100%
// doing this gives the illusion that there is a single progress bar & each chit is just a mask
const shiftColor = (idx: number) => keyframes`
  0% {
    background-position: ${idx * OFFSET}px;
  }
  ${100 - (idx * OFFSET) / (PROGRESS_WIDTH / 100)}% {
    background-position: ${PROGRESS_WIDTH}px;
  }
  ${100 - (idx * OFFSET) / (PROGRESS_WIDTH / 100) + 0.0001}% {
    background-position: 0px;
  }
  100% {
    background-position: ${idx === 0 ? PROGRESS_WIDTH : idx * OFFSET}px;
  }
`

const Chit = styled('div')({
  animation: `${fadeIn.toString()} 300ms ${DECELERATE}`,
  backgroundColor: '#FFFFFF',
  borderRadius: 2,
  boxShadow: Elevation.Z1,
  height: CHIT_HEIGHT,
  width: CHIT_WIDTH
})

const ActiveChitMask = styled('div')({
  borderRadius: 2,
  height: CHIT_HEIGHT - PROGRESS_MARGIN * 2,
  margin: PROGRESS_MARGIN,
  overflow: 'hidden',
  width: CHIT_WIDTH - PROGRESS_MARGIN * 2
})

const ActiveChit = styled('div')<{idx: number}>(({idx}) => ({
  animation: `${shiftColor(idx).toString()} 2000ms linear infinite`,
  background: `linear-gradient(90deg, ${PALETTE.GRAPE_500} 0%, ${PALETTE.TOMATO_500} 33%, ${PALETTE.AQUA_400} 66%, ${PALETTE.GRAPE_500} 100%)`,
  height: CHIT_HEIGHT,
  width: PROGRESS_WIDTH
}))

const ChitAreaLabel = styled(TinyLabel)({
  margin: '0 0 1em'
})

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
        <Chit
          key={totalCount - idx}
          className={cn(
            'absolute transition-[left] transition-[top] transition-all duration-300',
            isOverflow ? overflowStyles[overflowIdx] : ''
          )}
          style={{
            top: !isOverflow ? '0px' : `${overflowTops[overflowIdx]!}px`,
            left: !isOverflow
              ? `${idx * (CHIT_WIDTH + CHIT_GUTTER)}px`
              : `${(CHITS_PER_ROW - 1) * (CHIT_WIDTH + CHIT_GUTTER) + overflowLefts[overflowIdx]!}px`
          }}
        >
          {idx < editorCount && (
            <ActiveChitMask>
              <ActiveChit idx={idx} />
            </ActiveChitMask>
          )}
        </Chit>
      )
    })
    .reverse()

  return (
    <div className='flex flex-col'>
      <ChitAreaLabel>{getStatus(count, editorCount)}</ChitAreaLabel>
      <div className='relative h-5 w-full'>{chitList}</div>
    </div>
  )
}

export default PhaseItemChits
