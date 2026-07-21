import styled from '@emotion/styled'
import {PALETTE} from '../styles/paletteV3'
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
  // Deliberately theme-invariant. Both layers above are translucent (0.5 / 0.35), so they
  // composite against whatever is behind them — the card's surface token. On the dark card
  // that muddied the illustration, so pin the backdrop to white and keep the artwork at its
  // intended contrast in both themes.
  backgroundColor: PALETTE.WHITE,
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
