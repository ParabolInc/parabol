import React from 'react'
import ConnectButton from './ConnectButton'
import ProviderRowBase, {ProviderRowBaseProps} from './ProviderRowBase'

interface Props extends Omit<ProviderRowBaseProps, 'connectButton'> {
  onConnectClick: () => void
  submitting: boolean
  connectButtonText?: string
  connectButtonIcon?: React.ReactElement
}

const ProviderRow = (props: Props) => {
  const {onConnectClick, submitting, ...other} = props

  const connectButton = <ConnectButton onConnectClick={onConnectClick} submitting={submitting} />

  return <ProviderRowBase {...other} connectButton={connectButton} />
}

export default ProviderRow
