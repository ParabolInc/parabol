import React from 'react'
import ConnectButton from './ConnectButton'
import ContactUsButton from './ContactUsButton'
import ProviderRowBase, {ProviderRowBaseProps} from './ProviderRowBase'

interface Props extends Omit<ProviderRowBaseProps, 'connectButton'> {
  onConnectClick: () => void
  connectButtonText?: string
  connectButtonIcon?: React.ReactElement
  submitting: boolean
  contactUsUrl: string
  onContactUsSubmit: () => void
  hasProvider: boolean
}

const ProviderRowContactUs = (props: Props) => {
  const {contactUsUrl, onContactUsSubmit, onConnectClick, submitting, hasProvider, ...other} = props

  const connectButton = !hasProvider ? (
    <ContactUsButton contactUsUrl={contactUsUrl} onContactUsSubmit={onContactUsSubmit} />
  ) : (
    <ConnectButton onConnectClick={onConnectClick} submitting={submitting} />
  )

  return <ProviderRowBase {...other} connectButton={connectButton} />
}

export default ProviderRowContactUs
