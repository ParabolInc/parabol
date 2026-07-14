import {useRef} from 'react'
import {PokerCardDeck} from 'parabol-client'

// Identity Relay stub: the PokerCardDeck_meeting $data. The deck reads its cards
// from localStage.dimensionRef.scale.values (each a PokerCard_scaleValue).
const card = (color: string, label: string) => ({color, label})

const meeting = {
  id: 'meeting1',
  rightDrawerOpen: null,
  showSidebar: false,
  phases: [{stages: []}],
  localStage: {
    id: 'stage1',
    isVoting: true,
    dimensionRef: {
      scale: {
        values: [
          card('#4C9EE7', '1'),
          card('#7C6BD6', '3'),
          card('#5CB88B', '5'),
          card('#E39A3B', '8'),
          card('#E0567F', '13')
        ]
      }
    },
    scores: []
  },
  viewerMeetingMember: {isSpectating: false}
}

export const Deck = () => {
  const estimateAreaRef = useRef<HTMLDivElement>(null)
  return (
    <div ref={estimateAreaRef} className='relative h-64 w-full overflow-hidden bg-slate-200'>
      <PokerCardDeck meeting={meeting} estimateAreaRef={estimateAreaRef} />
    </div>
  )
}
