import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import {Component, useRef, useEffect} from 'react'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import {commitLocalUpdate} from 'react-relay'
import createProxyRecord from '../utils/relay/createProxyRecord'
import ms from 'ms'
import useAtmosphere from 'hooks/useAtmosphere'
import useEventCallback from 'hooks/useEventCallback'

interface Props extends WithAtmosphereProps {}

const upgradeServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    registration && registration.update().catch()
  }
}

const setupServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', this.onServiceWorkerChange)
  }
  return () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('controllerchange', this.onServiceWorkerChange)
    }
  }
}

const useServiceWorker = () => {
  const atmosphere = useAtmosphere()
  const isFirstServiceWorkerRef = useRef(true)
  useEffectect(() => {
    const setFirstServiceWorker = async () => {
      const registration = await navigator.serviceWorker.getRegistration()
      isFirstServiceWorkerRef.current = !registration
    }
    const onServiceWorkerChange = () => {
      if (isFirstServiceWorkerRef.current) {
        isFirstServiceWorkerRef.current = false
        return
      }
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'newVersion',
        autoDismiss: 0,
        message: 'A new version of Parabol is available',
        action: {
          label: 'Refresh to upgrade',
          callback: () => {
            window.location.reload()
          }
        }
      })
    }
    if ('serviceWorker' in navigator) {
      setFirstServiceWorker().catch()
      navigator.serviceWorker.addEventListener('controllerchange', onServiceWorkerChange)
    }
  }, [])
}
const SocketHealthMonitor = (props: Props) => {
  const recentDisconnectsRef = useRef([] as number[])
  const firewallMessageSentRef = useRef(false)

  const atmosphere = useAtmosphere()
  const {eventEmitter} = atmosphere

  useEffect(() => {
    eventEmitter.once('newSubscriptionClient', () => {
      const {transport} = atmosphere
      const {trebuchet} = transport as GQLTrebuchetClient
      trebuchet.on('reconnected' as any, this.onReconnected)
      trebuchet.on('disconnected' as any, this.onDisconnected)
      trebuchet.on('data' as any, this.onData)
      trebuchet.on('close', this.onClose)
      this.setConnectedStatus(true)
    })
  }, [])
}
class SocketHealthMonitor extends Component<Props> {
  recentDisconnects = [] as number[]
  firewallMessageSent = false
  isFirstServiceWorker = true
  componentDidMount() {
    const {atmosphere} = this.props
    atmosphere.eventEmitter.once('newSubscriptionClient', () => {
      const {transport} = atmosphere
      const {trebuchet} = transport as GQLTrebuchetClient
      trebuchet.on('reconnected' as any, this.onReconnected)
      trebuchet.on('disconnected' as any, this.onDisconnected)
      trebuchet.on('data' as any, this.onData)
      trebuchet.on('close', this.onClose)
      this.setConnectedStatus(true)
    })
    if ('serviceWorker' in navigator) {
      this.setFirstServiceWorker().catch()
      navigator.serviceWorker.addEventListener('controllerchange', this.onServiceWorkerChange)
    }
  }

  componentWillUnmount() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('controllerchange', this.onServiceWorkerChange)
    }
  }

  async setFirstServiceWorker() {
    const registration = await navigator.serviceWorker.getRegistration()
    this.isFirstServiceWorker = !registration
  }

  setConnectedStatus = (isConnected: boolean) => {
    const {atmosphere} = this.props
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

  onClose = ({reason}) => {
    if (reason === 'invalidated') {
    }
  }
  onData = (payload: string | object) => {
    const {atmosphere} = this.props
    // hacky but that way we don't have to double parse huge json payloads. SSE graphql payloads are pre-parsed
    if (typeof payload !== 'string' || !payload.startsWith('{"version":')) return
    const obj = JSON.parse(payload)
    if (obj.version !== __APP_VERSION__) {
      upgradeServiceWorker().catch(console.error)
    }
    if (obj.authToken) {
      atmosphere.setAuthToken(obj.authToken)
    }
  }

  onReconnected = () => {
    const {atmosphere} = this.props
    this.setConnectedStatus(true)
    atmosphere.eventEmitter.emit('removeSnackbar', ({key}) => key === 'offline')
  }
  onDisconnected = () => {
    const {atmosphere} = this.props
    this.setConnectedStatus(false)
    if (!this.firewallMessageSent) {
      const now = Date.now()
      this.recentDisconnects = this.recentDisconnects.filter((time) => time > now - ms('1m'))
      this.recentDisconnects.push(now)
      if (this.recentDisconnects.length >= 4) {
        this.firewallMessageSent = true
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

  render() {
    return null
  }
}

export default withAtmosphere(SocketHealthMonitor)
