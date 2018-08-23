import React, {Component} from 'react'
import styled, {keyframes} from 'react-emotion'
import ui from 'universal/styles/ui'
import {REFLECTION_WIDTH} from 'universal/utils/multiplayerMasonry/masonryConstants'
import {DECELERATE} from 'universal/styles/animation'

interface Props {
  count: number,
}

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

const CHIT_MARGIN = 4
const CHITS_PER_ROW = 8
const MAX_ROWS = 5
const Chit = styled('div')({
  animation: `${fadeIn} 300ms ${DECELERATE}`,
  backgroundColor: '#fff',
  borderRadius: '2px',
  boxShadow: ui.shadow[0],
  height: 16,
  margin: CHIT_MARGIN,
  minWidth: (REFLECTION_WIDTH - CHIT_MARGIN * 2 * (CHITS_PER_ROW)) / CHITS_PER_ROW,
})

const ChitArea = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  marginLeft: -4,
  marginRight: -4,
  width: REFLECTION_WIDTH
})

class PhaseItemChits extends Component<Props> {
  render() {
    const {count} = this.props
    const chitCount = Math.min(count, MAX_ROWS * CHITS_PER_ROW)
    const chits = [...Array(chitCount).keys()]
    return (
      <div>
        <div>
          {`${count} anonymous cards`}
        </div>
        <ChitArea>
          {chits.map((idx) => <Chit key={idx} />)}
        </ChitArea>
      </div>
    )
  }
}

export default PhaseItemChits
