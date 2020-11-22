import styled from '@emotion/styled'
import {keyframes} from '@emotion/core'
import {PALETTE} from '../../../styles/paletteV2'

export const skeletonShine = keyframes`
  0% {
    background-position: -80px;
  }
  40%, 100% {
    background-position: 320px;
  }
`
const MockJiraFieldLine = styled('div')<{delay: number}>(({delay}) => ({
  animation: `${skeletonShine.toString()} 2400ms infinite linear ${delay}ms`,
  height: 16,
  borderRadius: '20px',
  backgroundImage: `linear-gradient(90deg, ${PALETTE.TEXT_LIGHT_DARK} 0px, ${PALETTE.TEXT_LIGHT} 40px, ${PALETTE.TEXT_LIGHT_DARK} 80px)`,
  backgroundSize: 400,
  marginLeft: 16,
  marginTop: 16,
  width: 240
}))
export default MockJiraFieldLine
