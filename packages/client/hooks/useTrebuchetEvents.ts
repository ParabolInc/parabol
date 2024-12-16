import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import ms from 'ms'
import {useEffect, useRef} from 'react'
import {commitLocalUpdate} from 'react-relay'
import {TrebuchetCloseReason} from '~/types/constEnums'
import createProxyRecord from '../utils/relay/createProxyRecord'
import handleInvalidatedSession from './handleInvalidatedSession'
import useAtmosphere from './useAtmosphere'
import useRouter from './useRouter'

const useTrebuchetEvents = () => {
  const atmosphere = useAtmosphere()
  const {history} = useRouter()
  const firewallMessageSentRef = useRef(false)
  const recentDisconnectsRef = useRef([] as number[])
  const serverVersionRef = useRef(__APP_VERSION__)

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
      const obj = typeof payload === 'string' ? JSON.parse(payload) : payload

      if (obj.version) {
        if (obj.version !== serverVersionRef.current) {
          serverVersionRef.current = obj.version
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.getRegistration()
            registration?.update().catch(() => {
              /*ignore*/
            })
          }
        } else if (recentDisconnectsRef.current.length > 0) {
          // retry if reconnect and versions are the same
          atmosphere.retries.forEach((retry) => retry())
        }
      }
      if (obj.authToken) {
        atmosphere.setAuthToken(obj.authToken)
      }
    }

    const onClose = ({reason}: {reason?: TrebuchetCloseReason}) => {
      handleInvalidatedSession(reason, {atmosphere, history})
    }

    atmosphere.eventEmitter.once('newSubscriptionClient', () => {
      const {transport} = atmosphere
      const {trebuchet} = transport as GQLTrebuchetClient
      trebuchet.on('reconnected' as any, onReconnected)
      trebuchet.on('disconnected' as any, onDisconnected)
      trebuchet.on('data' as any, onData)
      trebuchet.on('close' as any, onClose)
      setConnectedStatus(true)
    })
  }, [])
}

export default useTrebuchetEvents
