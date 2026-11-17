import type * as React from 'react'
import ProviderRowEntry from './ProviderRowEntry'
import ProviderRowShell from './ProviderRowShell'

export interface ProviderRowBaseProps {
  connected: boolean
  configMenu: React.ReactNode
  providerName: string
  providerDescription: React.ReactElement | string
  providerLogo: React.ReactElement
  children?: React.ReactElement | false
  connectButton: React.ReactElement
  error?: React.ReactElement | string
}

const ProviderRowBase = (props: ProviderRowBaseProps) => {
  const {
    connectButton,
    connected,
    error,
    configMenu,
    providerName,
    providerDescription,
    providerLogo,
    children
  } = props
  return (
    <ProviderRowShell providerLogo={providerLogo} panel={children}>
      <ProviderRowEntry
        name={providerName}
        description={providerDescription}
        error={error}
        connected={connected}
        connectButton={connectButton}
        configMenu={configMenu}
      />
    </ProviderRowShell>
  )
}

export default ProviderRowBase
