import React, {useCallback, useEffect} from 'react'
import LocalAtmosphere from '../modules/demo/LocalAtmosphere'
import lazyPreload from '../utils/lazyPreload'
import useAtmosphere from './useAtmosphere'
import useForceUpdate from './useForceUpdate'
import useModal from './useModal'

const BeginDemoModal = lazyPreload(
  () => import(/* webpackChunkName: 'BeginDemoModal' */ '../components/BeginDemoModal')
)

const a = '1'
const bo = a == '1'
console.log('========bo========', bo)

const useDemoMeeting = () => {
  const atmosphere = useAtmosphere()
  const forceUpdate = useForceUpdate()
  const {modalPortal, openPortal, closePortal} = useModal({noClose: true})
  const {clientGraphQLServer} = atmosphere as unknown as LocalAtmosphere

  useEffect(() => {
    if (clientGraphQLServer) {
      clientGraphQLServer.on('botsFinished', () => {
        // for the demo, we're essentially using the isBotFinished() prop as state
        forceUpdate()
      })
      if (!clientGraphQLServer.db._started) {
        openPortal()
      }
    }
  }, [atmosphere, forceUpdate])

  const startDemo = useCallback(() => {
    clientGraphQLServer.startDemo()

    closePortal()

    setTimeout(() => {
      clientGraphQLServer.emit('startDemo')
    }, 1000)
  }, [])

  return () => modalPortal(<BeginDemoModal startDemo={startDemo} />)
}

export default useDemoMeeting
