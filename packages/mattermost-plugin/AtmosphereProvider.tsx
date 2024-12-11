import {Client4} from 'mattermost-redux/client'
import {ReactNode, useCallback, useEffect} from 'react'
import {useSelector} from 'react-redux'
import {RelayEnvironmentProvider} from 'react-relay'
import {Atmosphere} from './Atmosphere'
import {getPluginServerRoute} from './selectors'

type Props = {
  environment: Atmosphere
  children: ReactNode
}

export default function AtmosphereProvider({environment, children}: Props) {
  const pluginServerRoute = useSelector(getPluginServerRoute)
  const serverUrl = `${pluginServerRoute}/login`
  const login = useCallback(async () => {
    const response = await fetch(
      serverUrl,
      Client4.getOptions({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
    )
    const body = await response.json()
    console.log('GEORG response', body)
    environment.state.authToken = body.authToken
  }, [serverUrl])

  useEffect(() => {
    if (!environment.state.authToken) {
      login()
    }
  }, [environment.state.authToken, login])

  if (!environment.state.authToken) {
    return null
  }

  return <RelayEnvironmentProvider environment={environment}>{children}</RelayEnvironmentProvider>
}
