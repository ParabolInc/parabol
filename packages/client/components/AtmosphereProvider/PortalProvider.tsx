import React, {ReactNode, useMemo, useState} from 'react'
import {createPortal} from 'react-dom'

export type SetPortal = (id: string, portal: ReactNode) => void
export const PortalContext = React.createContext((() => {}) as SetPortal)

interface Props {
  children: ReactNode
}

const ROOT = document.getElementById('root')!

const PortalProvider = (props: Props) => {
  const {children} = props
  const [portals, setPortals] = useState({} as {[portalId: string]: ReactNode})
  const setPortal: SetPortal = (id, portal) => {
    if (portal === null) {
      const nextPortals = {...portals}
      delete nextPortals[id]
      setPortals(nextPortals)
    } else {
      setPortals({...portals, [id]: portal})
    }
  }
  const nodes = useMemo(() => {
    return Object.values(portals).map((portal) => createPortal(portal, ROOT))
  }, [portals])

  return (
    <PortalContext.Provider value={setPortal}>
      {children}
      {nodes}
    </PortalContext.Provider>
  )
}

export default PortalProvider
