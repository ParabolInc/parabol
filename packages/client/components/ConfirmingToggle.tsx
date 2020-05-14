import styled from '@emotion/styled'
import React, {ReactNode} from 'react'
import {PALETTE} from '~/styles/paletteV2'
import {BezierCurve} from '~/types/constEnums'

const ConfirmingIcon = styled('div')<{isConfirming: boolean}>(({isConfirming}) => ({
  alignItems: 'center',
  justifyContent: 'center',
  color: PALETTE.EMPHASIS_WARM,
  display: 'flex',
  width: 24,
  height: 24,
  fontSize: 18,
  fontWeight: 600,
  position: 'absolute',
  opacity: isConfirming ? 1 : 0,
  transform: `scale(${isConfirming ? 1 : 0.5})`,
  transition: `transform 300ms ${BezierCurve.DECELERATE} 50ms`
}))

const PrimaryIcon = styled('div')<{isConfirming: boolean}>(({isConfirming}) => ({
  height: 24,
  opacity: isConfirming ? 0 : 1,
  transition: `opacity 150ms ${BezierCurve.DECELERATE}`
}))
interface Props {
  children: ReactNode
  isConfirming: boolean
}

const ConfirmingToggle = (props: Props) => {
  const {children, isConfirming} = props
  return (
    <>
      <ConfirmingIcon isConfirming={isConfirming}>?</ConfirmingIcon>
      <PrimaryIcon isConfirming={isConfirming}>{children}</PrimaryIcon>
    </>
  )
}

export default ConfirmingToggle
