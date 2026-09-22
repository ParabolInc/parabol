import {type ReactNode, useEffect, useState} from 'react'
import {RelayEnvironmentProvider} from 'react-relay'
import type {Environment} from 'relay-runtime'
import Atmosphere from '../../Atmosphere'

interface Props {
  children: ReactNode
  // a demo atmosphere has a bunch of junk we don't want to SSR, so we have client-only files pass it in
  getLocalAtmosphere?: () => Promise<{default: {new (): Environment}}>
}

const AtmosphereProvider = (props: Props) => {
  const {children, getLocalAtmosphere} = props
  const [atmosphere, setAtmosphere] = useState<Environment | undefined>(() => {
    if (!getLocalAtmosphere) {
      return new Atmosphere()
    }
    return undefined
  })

  useEffect(() => {
    if (!getLocalAtmosphere && atmosphere instanceof Atmosphere) {
      const cleanup = atmosphere.registerCookieListener(window)
      return cleanup
    }
    return undefined
  }, [atmosphere, getLocalAtmosphere])

  useEffect(() => {
    if (getLocalAtmosphere) {
      getLocalAtmosphere()
        .then((mod) => {
          setAtmosphere(new mod.default())
        })
        .catch(() => {
          /*ignore*/
        })
    }
  }, [getLocalAtmosphere])

  if (!atmosphere) return null
  return <RelayEnvironmentProvider environment={atmosphere}>{children}</RelayEnvironmentProvider>
}

export default AtmosphereProvider
