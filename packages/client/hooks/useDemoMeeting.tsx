import React, {useEffect} from 'react'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import lazyPreload from '../utils/lazyPreload'
import useAtmosphere from './useAtmosphere'
import useForceUpdate from './useForceUpdate'
import useModal from './useModal'

const BeginDemoModal = lazyPreload(
  () => import(/* webpackChunkName: 'BeginDemoModal' */ '../components/BeginDemoModal')
)

const useDemoMeeting = () => {
  const atmosphere = useAtmosphere()
  const forceUpdate = useForceUpdate()
  const {modalPortal, closePortal, openPortal} = useModal({noClose: true})
  useEffect(() => {
    const {clientGraphQLServer} = atmosphere as unknown as LocalAtmosphere
    if (clientGraphQLServer) {
      clientGraphQLServer.on('botsFinished', () => {
        // for the demo, we're essentially using the isBotFinished() prop as state
        forceUpdate()
      })
      if (clientGraphQLServer.isNew) {
        openPortal()
      }
    }
  }, [atmosphere, forceUpdate])
  return () => modalPortal(<BeginDemoModal closePortal={closePortal} />)
}

export default useDemoMeeting
