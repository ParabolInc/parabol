import PropTypes from 'prop-types'
import {Component} from 'react'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import popUpgradeAppToast from 'universal/mutations/toasts/popUpgradeAppToast'
import {APP_VERSION_KEY} from 'universal/utils/constants'

class SocketHealthMonitor extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired
  }

  componentWillMount () {
    const {atmosphere} = this.props
    atmosphere.eventEmitter.once('newSubscriptionClient', () => {
      const {
        transport: {trebuchet}
      } = atmosphere
      trebuchet.on('reconnected', this.onReconnected, this)
      trebuchet.on('disconnected', this.onDisconnected, this)
      trebuchet.on('data', this.onData, this)
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
    this.disconnectedToastTimer = setTimeout(() => {
      this.disconnectedToastTimer = undefined
      atmosphere.eventEmitter.emit('addToast', {
        level: 'warning',
        autoDismiss: 5,
        title: 'You’re offline!',
        message: 'We’re trying to reconnect you'
      })
    }, 1000)
  }

  render () {
    return null
  }
}

export default withAtmosphere(SocketHealthMonitor)
