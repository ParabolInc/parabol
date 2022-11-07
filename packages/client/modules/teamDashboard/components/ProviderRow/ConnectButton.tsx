import {Add as AddIcon} from '@mui/icons-material'
import React from 'react'
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
    connectButtonIcon = <AddIcon />
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
