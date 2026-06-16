import {useCallback, useEffect, useState} from 'react'
import BeginDemoModal from '../components/BeginDemoModal'
import type LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import useAtmosphere from './useAtmosphere'
import useForceUpdate from './useForceUpdate'

const useDemoMeeting = () => {
  const atmosphere = useAtmosphere()
  const forceUpdate = useForceUpdate()
  const [isOpen, setIsOpen] = useState(false)
  const {clientGraphQLServer} = atmosphere as unknown as LocalAtmosphere

  useEffect(() => {
    if (clientGraphQLServer) {
      clientGraphQLServer.on('botsFinished', () => {
        // for the demo, we're essentially using the isBotFinished() prop as state
        forceUpdate()
      })
      if (!clientGraphQLServer.db._started) {
        setIsOpen(true)
      }
    }
  }, [atmosphere, forceUpdate])

  const startDemo = useCallback(() => {
    clientGraphQLServer.startDemo()
    setIsOpen(false)
    setTimeout(() => {
      clientGraphQLServer.emit('startDemo')
    }, 1000)
  }, [])

  return () => <BeginDemoModal isOpen={isOpen} startDemo={startDemo} />
}

export default useDemoMeeting
