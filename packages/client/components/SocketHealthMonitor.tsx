import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import {Component} from 'react'
import withAtmosphere, {
  WithAtmosphereProps
} from '../decorators/withAtmosphere/withAtmosphere'
import {APP_VERSION_KEY} from '../utils/constants'
import {commitLocalUpdate} from 'react-relay'
import createProxyRecord from '../utils/relay/createProxyRecord'
import ms from 'ms'

interface Props extends WithAtmosphereProps {}

class SocketHealthMonitor extends Component<Props> {
  recentDisconnects = [] as number[]
  firewallMessageSent = false

  componentDidMount () {
    const {atmosphere} = this.props
    atmosphere.eventEmitter.once('newSubscriptionClient', () => {
      const {transport} = atmosphere
      const {trebuchet} = transport as GQLTrebuchetClient
      trebuchet.on('reconnected' as any, this.onReconnected)
      trebuchet.on('disconnected' as any, this.onDisconnected)
      trebuchet.on('data' as any, this.onData)
      this.setConnectedStatus(true)
    })
  }

  setConnectedStatus = (isConnected: boolean) => {
    const {atmosphere} = this.props
    commitLocalUpdate(atmosphere, (store) => {
      const root = store.getRoot()
      const viewer = root.getLinkedRecord('viewer')
      if (!viewer) {
        const tempViewer = createProxyRecord(store, 'User', {id: atmosphere.viewerId, isConnected})
        root.setLinkedRecord(tempViewer, 'viewer')
      } else {
        viewer.setValue(isConnected, 'isConnected')
      }
    })
  }

  onData = (payload: string) => {
    // hacky but that way we don't have to double parse huge json payloads
    if (!payload.startsWith('{"version":')) return
    const obj = JSON.parse(payload)
    const {atmosphere} = this.props
    const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY)
    if (obj.version !== versionInStorage) {
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

  render () {
    return null
  }
}

export default withAtmosphere(SocketHealthMonitor)
