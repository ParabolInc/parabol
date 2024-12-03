import {ReactNode} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'

type Props = {
  environment: any
  children: ReactNode
}

export default function AtmosphereProvider({ environment, children }: Props) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      {children}
    </RelayEnvironmentProvider>
  )
}
