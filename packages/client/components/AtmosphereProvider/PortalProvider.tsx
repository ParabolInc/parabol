import React, {ReactNode, useRef} from 'react'
import {createPortal} from 'react-dom'
import useForceUpdate from '../../hooks/useForceUpdate'

export type SetPortal = (id: string, portal: ReactNode) => void
export const PortalContext = React.createContext((() => {
  /* noop */
}) as SetPortal)

interface Props {
  children: ReactNode
}

const ROOT = document.getElementById('root')!

const PortalProvider = (props: Props) => {
  const {children} = props
  const forceUpdate = useForceUpdate()
  const portalsRef = useRef({} as {[portalId: string]: ReactNode})
  const {current: portals} = portalsRef
  const setPortal: SetPortal = (id, portal) => {
    if (portal === null) {
      delete portals[id]
    } else {
      portals[id] = portal
    }
    forceUpdate()
  }
  return (
    <PortalContext.Provider value={setPortal}>
      {children}
      {Object.values(portals).map((portal) => createPortal(portal, ROOT))}
    </PortalContext.Provider>
  )
}

export default PortalProvider
