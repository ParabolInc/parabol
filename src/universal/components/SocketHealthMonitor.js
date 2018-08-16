import PropTypes from 'prop-types'
import {Component} from 'react'
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere'
import {connect} from 'react-redux'
import popUpgradeAppToast from 'universal/mutations/toasts/popUpgradeAppToast'
import {showSuccess, showWarning} from 'universal/modules/toast/ducks/toastDuck'
import {APP_VERSION_KEY} from 'universal/utils/constants'

class SocketHealthMonitor extends Component {
  static propTypes = {
    atmosphere: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
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
    const {dispatch} = this.props
    const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY)
    if (payload.version !== versionInStorage) {
      popUpgradeAppToast({dispatch})
    }
  }

  onReconnected = () => {
    const {dispatch} = this.props
    dispatch(
      showSuccess({
        autoDismiss: 5,
        title: 'You’re back online!',
        message: 'You were offline for a bit, but we’ve reconnected you.'
      })
    )
  }
  onDisconnected = () => {
    const {dispatch} = this.props
    dispatch(
      showWarning({
        autoDismiss: 10,
        title: 'You’re offline!',
        message: 'We’re trying to reconnect you'
      })
    )
  }

  render () {
    return null
  }
}

export default connect()(withAtmosphere(SocketHealthMonitor))
