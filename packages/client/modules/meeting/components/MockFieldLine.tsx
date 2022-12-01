import {keyframes} from '@emotion/core'
import styled from '@emotion/styled'
import {PALETTE} from '../../../styles/paletteV3'

export const skeletonShine = keyframes`
  0% {
    background-position: -40px;
  }
  40%, 100% {
    background-position: 180px;
  }
`
const MockFieldLine = styled('div')<{delay: number}>(({delay}) => ({
  animation: `${skeletonShine.toString()} 2400ms infinite linear ${delay}ms`,
  height: 16,
  borderRadius: '20px',
  backgroundImage: `linear-gradient(90deg, ${PALETTE.SLATE_400} 0px, ${PALETTE.SLATE_200} 40px, ${PALETTE.SLATE_400} 80px)`,
  backgroundSize: 260,
  width: '100%'
}))
export default MockFieldLine
