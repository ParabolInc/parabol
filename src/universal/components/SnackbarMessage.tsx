import styled from '@emotion/styled'
import {TransitionStatus} from 'universal/hooks/useTransition'
import {PALETTE} from 'universal/styles/paletteV2'
import {Radius, ZIndex} from 'universal/types/constEnums'
import React from 'react'
import {DECELERATE} from 'universal/styles/animation'
import {SnackAction} from 'universal/components/Snackbar'
import SnackbarMessageAction from 'universal/components/SnackbarMessageAction'
import {snackbarShadow} from 'universal/styles/elevation'

interface Props {
  onTransitionEnd: () => void
  message: string
  status: TransitionStatus
  dismissSnack: () => void
  action?: SnackAction
  secondaryAction?: SnackAction
  onMouseEnter: () => void
  onMouseLeave: () => void
}

const Space = styled('div')({
  paddingBottom: 8
})

const Text = styled('div')({
  color: '#fff',
  fontSize: 14,
  padding: '6px 8px'
})

const MessageStyles = styled('div')<{status: TransitionStatus}>(({status}) => ({
  alignItems: 'center',
  background: PALETTE.BACKGROUND_DARK_OPAQUE,
  borderRadius: Radius.SNACKBAR,
  boxShadow: snackbarShadow,
  display: 'flex',
  padding: 8,
  transition: `all 300ms ${DECELERATE}`,
  opacity: status === TransitionStatus.MOUNTED || status === TransitionStatus.EXITING ? 0 : 1,
  transform: `translateY(${
    status === TransitionStatus.MOUNTED ? 20 : status === TransitionStatus.EXITING ? -20 : 0
  }px)`,
  pointerEvents: 'auto',
  userSelect: 'none',
  zIndex: ZIndex.SNACKBAR
}))

const SnackbarMessage = (props: Props) => {
  const {
    action,
    secondaryAction,
    status,
    message,
    onTransitionEnd,
    dismissSnack,
    onMouseEnter,
    onMouseLeave
  } = props
  return (
    <Space>
      <MessageStyles
        status={status}
        onTransitionEnd={onTransitionEnd}
        onClick={dismissSnack}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <Text>{message}</Text>
        <SnackbarMessageAction action={action} />
        <SnackbarMessageAction action={secondaryAction} />
      </MessageStyles>
    </Space>
  )
}

export default SnackbarMessage
