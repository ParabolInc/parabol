import styled from '@emotion/styled'
import React, {useEffect} from 'react'
import {TransitionStatus} from '../hooks/useTransition'
import {DECELERATE} from '../styles/animation'
import {snackbarShadow} from '../styles/elevation'
import {PALETTE} from '../styles/paletteV3'
import {ICON_SIZE} from '../styles/typographyV2'
import {Radius, ZIndex} from '../types/constEnums'
import Icon from './Icon'
import {SnackAction} from './Snackbar'
import SnackbarMessageAction from './SnackbarMessageAction'

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
  color: '#FFFFFF',
  fontSize: 14,
  padding: '6px 8px'
})

const MessageStyles = styled('div')<{status: TransitionStatus}>(({status}) => ({
  alignItems: 'center',
  background: PALETTE.SLATE_700,
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

const DismissButton = styled('button')({
  border: 'none',
  backgroundColor: 'inherit',
  marginLeft: '8px',
  cursor: 'pointer',
  padding: 5,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
})

const StyledIcon = styled(Icon)({
  color: PALETTE.SLATE_500,
  fontSize: ICON_SIZE.MD18,
  '&:hover': {
    opacity: 0.5
  }
})
const useTransitionEnd = (
  timeout: number,
  status: TransitionStatus,
  onTransitionEnd: () => void
) => {
  useEffect(() => {
    setTimeout(onTransitionEnd, timeout)
  }, [status])
}

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
  useTransitionEnd(300, status, onTransitionEnd)
  //Currently do not need dismiss button
  const displayDismissButton = false
  return (
    <Space>
      <MessageStyles
        status={status}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={displayDismissButton ? undefined : dismissSnack}
      >
        <Text>{message}</Text>
        <SnackbarMessageAction action={action} />
        <SnackbarMessageAction action={secondaryAction} />
        {displayDismissButton && (
          <DismissButton onClick={dismissSnack}>
            <StyledIcon>close</StyledIcon>
          </DismissButton>
        )}
      </MessageStyles>
    </Space>
  )
}

export default SnackbarMessage
