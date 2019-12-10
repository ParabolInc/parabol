import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import ms from 'ms'
import {useEffect, useRef} from 'react'
import {commitLocalUpdate} from 'react-relay'
import createProxyRecord from '../utils/relay/createProxyRecord'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'
import {LocalStorageKey} from 'types/constEnums'

const useTrebuchetEvents = () => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const firewallMessageSentRef = useRef(false)
  const recentDisconnectsRef = useRef([] as number[])

  useEffect(() => {
    const setConnectedStatus = (isConnected: boolean) => {
      commitLocalUpdate(atmosphere, (store) => {
        const root = store.getRoot()
        const viewer = root.getLinkedRecord('viewer')
        if (!viewer) {
          const tempViewer = createProxyRecord(store, 'User', {isConnected})
          root.setLinkedRecord(tempViewer, 'viewer')
        } else {
          viewer.setValue(isConnected, 'isConnected')
        }
      })
    }

    const onDisconnected = () => {
      setConnectedStatus(false)
      if (!firewallMessageSentRef.current) {
        const now = Date.now()
        recentDisconnectsRef.current = recentDisconnectsRef.current.filter(
          (time) => time > now - ms('1m')
        )
        recentDisconnectsRef.current.push(now)
        if (recentDisconnectsRef.current.length >= 4) {
          firewallMessageSentRef.current = true
          atmosphere.eventEmitter.emit('addSnackbar', {
            autoDismiss: 0,
            message: 'Your internet is unstable. Behind a firewall? Contact us for support',
            key: 'firewall'
          })
          return
        }
      }
      atmosphere.eventEmitter.emit('addSnackbar', {
        autoDismiss: 0,
        message: 'You’re offline, reconnecting…',
        key: 'offline'
      })
    }

    const onReconnected = () => {
      setConnectedStatus(true)
      atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === 'offline')
    }

    const onData = async (payload: string | object) => {
      // hacky but that way we don't have to double parse huge json payloads. SSE graphql payloads are pre-parsed
      if (typeof payload !== 'string' || !payload.startsWith('{"version":')) return
      const obj = JSON.parse(payload)
      if (obj.version !== __APP_VERSION__ && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration()
        registration?.update().catch()
      }
      if (obj.authToken) {
        atmosphere.setAuthToken(obj.authToken)
      }
    }

    const onClose = ({reason}) => {
      console.log('close')
      if (reason === 'sessionInvalidated') {
        window.localStorage.removeItem(LocalStorageKey.APP_TOKEN_KEY)
        atmosphere.eventEmitter.emit('addSnackbar', {
          key: 'logOutJWT',
          message: 'You’ve been logged out from another device',
          autoDismiss: 5
        })
        setTimeout(() => {
          atmosphere.close()
          history.replace('/')
        })
      }
    }

    atmosphere.eventEmitter.once('newSubscriptionClient', () => {
      const {transport} = atmosphere
      const {trebuchet} = transport as GQLTrebuchetClient
      trebuchet.on('reconnected' as any, onReconnected)
      trebuchet.on('disconnected' as any, onDisconnected)
      trebuchet.on('data' as any, onData)
      trebuchet.on('close', onClose)
      setConnectedStatus(true)
    })
  }, [])
}

export default useTrebuchetEvents
