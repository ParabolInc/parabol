import styled from 'react-emotion'
import {TransitionStatus} from 'universal/hooks/useTransition'
import {PALETTE} from 'universal/styles/paletteV2'
import {Radius} from 'universal/types/constEnums'
import React from 'react'
import {DECELERATE} from 'universal/styles/animation'

interface SnackProps {
  onTransitionEnd: () => void
  message: string
  status: TransitionStatus
  dismissSnack: () => void
}

const Space = styled('div')({
  paddingBottom: 8
})

const MessageStyles = styled('div')(({status}: {status: TransitionStatus}) => ({
  background: PALETTE.BACKGROUND_DARK,
  borderRadius: Radius.SNACKBAR,
  color: '#fff',
  padding: 16,
  transition: `all 300ms ${DECELERATE}`,
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transform: `translateY(${
    status === TransitionStatus.MOUNTED ? 20 : status === TransitionStatus.EXITING ? -20 : 0
  }px)`,
  pointerEvents: 'auto',
  userSelect: 'none'
}))

const SnackbarMessage = (props: SnackProps) => {
  const {status, message, onTransitionEnd, dismissSnack} = props
  return (
    <Space>
      <MessageStyles status={status} onTransitionEnd={onTransitionEnd} onClick={dismissSnack}>
        {message}
      </MessageStyles>
    </Space>
  )
}

export default SnackbarMessage
