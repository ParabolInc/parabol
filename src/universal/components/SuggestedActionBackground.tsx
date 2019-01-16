import React from 'react'
import styled from 'react-emotion'
import patternTile from '../styles/theme/images/icon-pattern-tile.svg'
import {DASH_TIMELINE} from './MyDashboardTimeline'

const ROTATION = 15
const ROT_RADS = ROTATION * Math.PI / 180
const BACKGROUND_HEIGHT = 142
const BACKGROUND_WIDTH = DASH_TIMELINE.FEED_MAX_WIDTH

// make the pattern large enough to fill the background
// imagine fitting a rectangle into a larger rect that is rotated 15 degrees, how big is that bigger one?

const sinROT = Math.sin(ROT_RADS)
const cosROT = Math.cos(ROT_RADS)
const w1 = sinROT * BACKGROUND_HEIGHT
const w2 = cosROT * BACKGROUND_WIDTH
const h1 = cosROT * BACKGROUND_HEIGHT
const h2 = sinROT * BACKGROUND_WIDTH
const width = Math.ceil(w1 + w2)
const height = Math.ceil(h1 + h2)
const yOffset = sinROT * w1

const FullBackground = styled('div')({
  backgroundImage: `url(${patternTile})`,
  backgroundRepeat: 'repeat',
  height,
  opacity: 0.35,
  // needs rotate3d to not look blurry
  transform: `translate3d(${-w1}px,${yOffset}px,0)rotate3d(0,0,1,-${ROTATION}deg)`,
  transformOrigin: '0 0',
  width,
  position: 'absolute'
})

const ColorBackground = styled(FullBackground)(({backgroundColor}: {backgroundColor: string}) => ({
  backgroundImage: 'none',
  backgroundColor,
  opacity: 0.5
}))

const BackgroundClip = styled('div')({
  height: BACKGROUND_HEIGHT,
  overflow: 'hidden',
  position: 'relative',
  width: '100%'
})

interface Props {
  backgroundColor: string
}

const SuggestedActionBackground = (props: Props) => {
  const {backgroundColor} = props
  return (
    <BackgroundClip>
      <ColorBackground backgroundColor={backgroundColor} />
      <FullBackground />
    </BackgroundClip>
  )
}

export default SuggestedActionBackground
