import React from 'react'
import ConnectButton from './ConnectButton'
import ProviderRowBase, {ProviderRowBaseProps} from './ProviderRowBase'

interface Props extends Omit<ProviderRowBaseProps, 'connectButton'> {
  onConnectClick: () => void
  submitting: boolean
  connectButtonText?: string
  connectButtonIcon?: React.ReactElement
  error?: React.ReactElement | string
}

const ProviderRow = (props: Props) => {
  const {onConnectClick, submitting, error, ...other} = props

  const connectButton = <ConnectButton onConnectClick={onConnectClick} submitting={submitting} />

  return (
    <ProviderRowBase {...other} connectButton={connectButton}>
      {!!error && (
        <div className='px-4 pb-2 text-tomato-500 [&_a]:font-semibold [&_a]:text-tomato-500 [&_a]:underline'>
          {error}
        </div>
      )}
    </ProviderRowBase>
  )
}

export default ProviderRow
