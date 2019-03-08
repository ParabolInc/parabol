import React, {Component} from 'react'
import ToastSystem from 'react-notification-system'
import appTheme from 'universal/styles/theme/appTheme'
import withAtmosphere, {
  WithAtmosphereProps
} from 'universal/decorators/withAtmosphere/withAtmosphere'

interface Props extends WithAtmosphereProps {}

/*
 * NOTE: these true inline styles
 */
const styles = {
  NotificationItem: {
    DefaultStyle: {
      // Applied to every notification, regardless of the notification level
    },

    success: {
      // Applied only to the success notification container
      borderTop: `2px solid ${appTheme.palette.cool}`,
      backgroundColor: appTheme.palette.cool20l,
      color: appTheme.palette.cool,
      WebkitBoxShadow: `0 0 1px ${appTheme.palette.cool90a}`,
      MozBoxShadow: `0 0 1px ${appTheme.palette.cool90a}`,
      boxShadow: `0 0 1px ${appTheme.palette.cool90a}`
    }
  },
  Action: {
    DefaultStyle: {},
    success: {
      backgroundColor: appTheme.palette.cool
    }
  },
  Dismiss: {
    DefaultStyle: {},
    success: {
      color: appTheme.palette.cool20l,
      backgroundColor: appTheme.palette.cool90l
    }
  },
  Title: {
    DefaultStyle: {},
    success: {
      color: appTheme.palette.cool
    }
  }
}

class Toast extends Component<Props> {
  el: any

  componentDidMount() {
    const {atmosphere} = this.props
    atmosphere.eventEmitter.on('addToast', this.addToast)
    atmosphere.eventEmitter.on('removeToast', this.removeToast)
  }

  componentWillUnmount() {
    const {atmosphere} = this.props
    atmosphere.eventEmitter.off('addToast', this.addToast)
    atmosphere.eventEmitter.off('removeToast', this.removeToast)
  }

  addToast = (toast) => {
    this.el.addNotification({
      level: 'success',
      ...toast,
      onRemove: () => this.removeToast(toast)
    })
  }

  removeToast = (toast: object | string) => {
    this.el.removeNotification(toast)
  }

  render() {
    return (
      <ToastSystem
        ref={(c) => {
          this.el = c
        }}
        style={styles}
      />
    )
  }
}

export default withAtmosphere(Toast)
