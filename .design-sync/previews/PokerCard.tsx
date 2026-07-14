import {useRef} from 'react'
import {PokerCard} from 'parabol-client'

// PokerCard is absolute-positioned (fanned-deck geometry). We neutralize the
// geometry (rotation/radius/yOffset = 0, not collapsed) so each card sits
// upright inside its own relative 125x175 box, then lay a few out as a hand.
const noop = () => {}

const Card = ({color, label, isSelected = false}: {color: string; label: string; isSelected?: boolean}) => {
  const deckRef = useRef<HTMLDivElement>(null)
  return (
    <div className='relative' style={{width: 125, height: 175}}>
      <PokerCard
        scaleValue={{color, label}}
        deckRef={deckRef}
        idx={0}
        isCollapsed={false}
        isSelected={isSelected}
        leftEdge={0}
        onClick={noop}
        onMouseEnter={noop}
        onMouseLeave={noop}
        radius={0}
        rotation={0}
        showTransition={false}
        totalCards={1}
        yOffset={0}
      />
    </div>
  )
}

export const Hand = () => (
  <div className='flex gap-3'>
    <Card color='#4C9EE7' label='1' />
    <Card color='#7C6BD6' label='3' />
    <Card color='#5CB88B' label='5' isSelected />
    <Card color='#E39A3B' label='8' />
  </div>
)

export const Selected = () => (
  <div className='flex gap-3'>
    <Card color='#5CB88B' label='5' isSelected />
  </div>
)
