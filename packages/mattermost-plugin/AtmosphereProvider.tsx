import {ReactNode} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'
import {Atmosphere} from './Atmosphere'

type Props = {
  environment: Atmosphere
  children: ReactNode
}

export default function AtmosphereProvider({environment, children}: Props) {
  return <RelayEnvironmentProvider environment={environment}>{children}</RelayEnvironmentProvider>
}
