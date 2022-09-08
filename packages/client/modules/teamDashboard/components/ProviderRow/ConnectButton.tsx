import {Add as AddIcon} from '@mui/icons-material'
import React from 'react'
import {useTranslation} from 'react-i18next'
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
  const {t} = useTranslation()

  const isDesktop = useBreakpoint(Breakpoint.SIDEBAR_LEFT)

  const {
    submitting,
    onConnectClick,
    connectButtonText = t('ConnectButton.Connect'),
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
