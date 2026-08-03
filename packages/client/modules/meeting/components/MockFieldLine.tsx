import {keyframes} from '@emotion/react'
import styled from '@emotion/styled'

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
  backgroundImage: `linear-gradient(90deg, var(--color-hairline-strong) 0px, var(--color-surface-well) 40px, var(--color-hairline-strong) 80px)`,
  backgroundSize: 260,
  width: '100%'
}))
export default MockFieldLine
