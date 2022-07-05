import React from 'react'
import Icon from '../../../../components/Icon'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint} from '../../../../types/constEnums'
import StyledButton from './StyledButton'

interface Props {
  onConnectClick: () => void
  submitting: boolean
  connectButtonText?: string
  connectButtonIcon?: React.ReactElement
}

const ConnectButton = (props: Props) => {
  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const {
    submitting,
    onConnectClick,
    connectButtonText = 'Connect',
    connectButtonIcon = <Icon>add</Icon>
  } = props

  return (
    <StyledButton key='linkAccount' onClick={onConnectClick} palette='warm' waiting={submitting}>
      {isDesktop ? connectButtonText : connectButtonIcon}
    </StyledButton>
  )
}

export default ConnectButton
