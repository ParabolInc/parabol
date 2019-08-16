import React from 'react'
import styled from '@emotion/styled'
import patternTile from '../styles/theme/images/icon-pattern-tile.svg'
import {DashTimeline} from '../types/constEnums'

const ROTATION = 15
const BACKGROUND_HEIGHT = 142
const BACKGROUND_WIDTH = DashTimeline.FEED_MAX_WIDTH

// make the pattern large enough to fill the background
// imagine fitting a rectangle into a larger rect that is rotated 15 degrees, how big is that bigger one?
const getRotatedBBox = (rotationDegrees: number, width: number, height: number) => {
  const radians = (rotationDegrees * Math.PI) / 180
  const sinROT = Math.sin(radians)
  const cosROT = Math.cos(radians)
  const w1 = sinROT * height
  const w2 = cosROT * width
  const h1 = cosROT * height
  const h2 = sinROT * width
  return {
    width: Math.ceil(w1 + w2),
    height: Math.ceil(h1 + h2),
    xOffset: Math.round(sinROT * h1),
    yOffset: Math.round(sinROT * w1)
  }
}

const {width, height, xOffset, yOffset} = getRotatedBBox(
  ROTATION,
  BACKGROUND_WIDTH,
  BACKGROUND_HEIGHT
)

const FullBackground = styled('div')({
  backgroundImage: `url(${patternTile})`,
  backgroundRepeat: 'repeat',
  height,
  opacity: 0.35,
  // needs rotate3d to not look blurry
  transform: `translate3d(${-xOffset}px,${yOffset}px,0)rotate3d(0,0,1,-${ROTATION}deg)`,
  transformOrigin: '0 0',
  width,
  position: 'absolute'
})

const ColorBackground = styled(FullBackground)<{backgroundColor: string}>(({backgroundColor}) => ({
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
