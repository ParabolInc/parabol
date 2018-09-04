import React, {Component} from 'react'
import styled, {keyframes} from 'react-emotion'
import {DECELERATE} from 'universal/styles/animation'
import appTheme from 'universal/styles/theme/appTheme'
import ui from 'universal/styles/ui'
import elevation from 'universal/styles/elevation'
import {
  REFLECTION_CARD_WIDTH,
  REFLECTION_WIDTH
} from 'universal/utils/multiplayerMasonry/masonryConstants'
import plural from 'universal/utils/plural'
import TinyLabel from 'universal/components/TinyLabel'

interface Props {
  count: number
  editorCount: number
}

const {
  brand: {
    primary: {purpleLightened, orange, teal}
  }
} = appTheme

const CHIT_MARGIN = 4
const CHIT_GUTTER = 8
const CHITS_PER_ROW = 8
const MAX_ROWS = 5
const CHIT_WIDTH = (REFLECTION_CARD_WIDTH - CHIT_GUTTER * (CHITS_PER_ROW - 1)) / CHITS_PER_ROW
const CHIT_HEIGHT = 17
const OFFSET = CHIT_MARGIN * 2 + CHIT_WIDTH
const PROGRESS_WIDTH = REFLECTION_WIDTH
const PROGRESS_MARGIN = 2

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0);
  }
	100% {
	  opacity: 1;
	  transform: scale(1);
	}
`

// easiest way to debug this is to just print it to a string
// we need 4 things to fake a circle:
// pos at 0%, % when pos is at progress width, % when pos is back at 0, and pos at 100%
// doing this gives the illusion that there is a single progress bar & each chit is just a mask
const shiftColor = (idx) => keyframes`
  0% {
    background-position: ${idx * OFFSET}px;
  }
	${100 - idx * OFFSET / (PROGRESS_WIDTH / 100)}% {
	  background-position: ${PROGRESS_WIDTH}px;
	}
	${100 - idx * OFFSET / (PROGRESS_WIDTH / 100) + 0.0001}% {
	  background-position: 0px;
	}
	100% {
	  background-position: ${idx === 0 ? PROGRESS_WIDTH : idx * OFFSET}px;
	}
`

const Chit = styled('div')({
  animation: `${fadeIn} 300ms ${DECELERATE}`,
  backgroundColor: '#fff',
  borderRadius: '2px',
  boxShadow: elevation[1],
  height: CHIT_HEIGHT,
  width: CHIT_WIDTH
})

const ActiveChitMask = styled('div')({
  borderRadius: '2px',
  height: CHIT_HEIGHT - PROGRESS_MARGIN * 2,
  margin: PROGRESS_MARGIN,
  overflow: 'hidden',
  width: CHIT_WIDTH - PROGRESS_MARGIN * 2
})

const ActiveChit = styled('div')(({idx}: {idx: number}) => ({
  animation: `${shiftColor(idx)} 2000ms linear infinite`,
  background: `linear-gradient(90deg, ${purpleLightened} 0%, ${orange} 33%, ${teal} 66%, ${purpleLightened} 100%)`,
  height: CHIT_HEIGHT,
  width: PROGRESS_WIDTH
}))

const ChitArea = styled('div')({
  display: 'grid',
  gridGap: CHIT_GUTTER,
  gridTemplateColumns: `repeat(${CHITS_PER_ROW}, ${CHIT_WIDTH}px)`,
  width: REFLECTION_CARD_WIDTH
})

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

class PhaseItemChits extends Component<Props> {
  render() {
    const {count, editorCount} = this.props
    const chitCount = Math.min(count, MAX_ROWS * CHITS_PER_ROW)
    const chits = [...Array(chitCount).keys()]
    const activeChits = [...Array(editorCount).keys()]
    return (
      <div>
        <ChitAreaLabel>{getStatus(count, editorCount)}</ChitAreaLabel>
        <ChitArea>
          {chits.map((idx) => <Chit key={idx} />)}

          {activeChits.map((idx) => (
            <Chit key={idx}>
              <ActiveChitMask>
                <ActiveChit idx={activeChits.length - 1 - idx} />
              </ActiveChitMask>
            </Chit>
          ))}
        </ChitArea>
      </div>
    )
  }
}

export default PhaseItemChits
