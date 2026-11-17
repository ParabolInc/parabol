import type {CSSProperties} from 'react'
import patternTile from '../styles/theme/images/icon-pattern-tile.svg'
import {DashTimeline} from '../types/constEnums'
import getRotatedBBox from '../utils/getRotatedBBox'

const ROTATION = 15
const BACKGROUND_HEIGHT = 142
const BACKGROUND_WIDTH = DashTimeline.FEED_MAX_WIDTH

const {width, height, xOffset, yOffset} = getRotatedBBox(
  ROTATION,
  BACKGROUND_WIDTH,
  BACKGROUND_HEIGHT
)

// needs rotate3d to not look blurry
const BBOX_STYLE: CSSProperties = {
  height,
  width,
  transform: `translate3d(${-xOffset}px,${yOffset}px,0)rotate3d(0,0,1,-${ROTATION}deg)`
}

interface Props {
  backgroundColor: string
}

const SuggestedActionBackground = (props: Props) => {
  const {backgroundColor} = props
  return (
    <div className='relative h-[142px] w-full overflow-hidden bg-surface-card'>
      <div
        className='absolute origin-top-left opacity-50'
        style={{...BBOX_STYLE, backgroundColor}}
      />
      <div
        className='absolute origin-top-left bg-repeat opacity-35'
        style={{...BBOX_STYLE, backgroundImage: `url(${patternTile})`}}
      />
    </div>
  )
}

export default SuggestedActionBackground
