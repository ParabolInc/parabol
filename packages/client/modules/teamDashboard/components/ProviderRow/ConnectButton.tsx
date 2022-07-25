import React from 'react'
import Icon from '../../../../components/Icon'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {Breakpoint} from '../../../../types/constEnums'
import ProviderRowActionButton from './ProviderRowActionButton'

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
    <ProviderRowActionButton
      key='linkAccount'
      onClick={onConnectClick}
      palette='warm'
      waiting={submitting}
    >
      {isDesktop ? connectButtonText : connectButtonIcon}
    </ProviderRowActionButton>
  )
}

export default ConnectButton
