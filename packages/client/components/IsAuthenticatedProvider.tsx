import {createContext, type ReactNode, useContext, useEffect, useState} from 'react'
import useAtmosphere from '../hooks/useAtmosphere'
import useAtmosphereListener from '../hooks/useAtmosphereListener'

const IsAuthenticatedContext = createContext(false)

export function useIsAuthenticated(): boolean {
  return useContext(IsAuthenticatedContext)
}

/*
 * Provide !!atmosphere.authObj in a reliable way which also works when it's updated asynchronously
 *
 * This is a separate provider so it can be accessed also from the demo where Atmosphere is shadowed by LocalAtmosphere
 */
export function IsAuthenticatedProvider(props: {children: ReactNode}) {
  const atmosphere = useAtmosphere()
  const [isAuthenticated, setIsAuthenticated] = useState(!!atmosphere.authObj)

  useAtmosphereListener('authChanged', () => {
    setIsAuthenticated(!!atmosphere.authObj)
  })

  useEffect(() => {
    setIsAuthenticated(!!atmosphere.authObj)
  }, [atmosphere])

  return (
    <IsAuthenticatedContext.Provider value={isAuthenticated}>
      {props.children}
    </IsAuthenticatedContext.Provider>
  )
}
