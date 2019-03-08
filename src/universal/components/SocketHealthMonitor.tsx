import GQLTrebuchetClient from '@mattkrick/graphql-trebuchet-client'
import {Component} from 'react'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'
import popUpgradeAppToast from 'universal/mutations/toasts/popUpgradeAppToast'
import {APP_VERSION_KEY} from 'universal/utils/constants'
import {commitLocalUpdate} from 'react-relay'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'

interface Props extends WithAtmosphereProps {}

class SocketHealthMonitor extends Component<Props> {
  disconnectedToastTimer: number | null = null
  componentDidMount() {
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

  onData = (payload) => {
    if (!payload.version) return
    const {atmosphere} = this.props
    const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY)
    if (payload.version !== versionInStorage) {
      popUpgradeAppToast({atmosphere})
    }
  }

  onReconnected = () => {
    const {atmosphere} = this.props
    this.setConnectedStatus(true)
    if (this.disconnectedToastTimer) {
      clearTimeout(this.disconnectedToastTimer)
    } else {
      atmosphere.eventEmitter.emit('addToast', {
        level: 'success',
        autoDismiss: 5,
        title: 'You’re back online!',
        message: 'You were offline for a bit, but we’ve reconnected you.'
      })
    }
  }
  onDisconnected = () => {
    const {atmosphere} = this.props
    this.setConnectedStatus(false)
    this.disconnectedToastTimer = window.setTimeout(() => {
      this.disconnectedToastTimer = null
      atmosphere.eventEmitter.emit('addToast', {
        level: 'warning',
        autoDismiss: 5,
        title: 'You’re offline!',
        message: 'We’re trying to reconnect you'
      })
    }, 1000)
  }

  render() {
    return null
  }
}

export default withAtmosphere(SocketHealthMonitor)
