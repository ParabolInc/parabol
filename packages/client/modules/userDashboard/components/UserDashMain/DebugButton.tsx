import React, {Component} from 'react'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'

interface Props extends WithAtmosphereProps {}

class DebugButton extends Component<Props> {
  onClick = () => {
    const {atmosphere} = this.props
    // atmosphere.eventEmitter.emit('addSnackbar', {
    //   message: 'hello',
    //   autoDismiss: 2,
    //   type: 'foo'
    // })
    atmosphere.eventEmitter.emit('addSnackbar', {
      autoDismiss: 5,
      message: 'Your internet is unstable. Behind a firewall? Contact us for support',
      key: 'firewall',
      action: {
        label: 'nice',
        callback: () => {
          console.log('hey')
        }
      }
    })
    // commitLocalUpdate(atmosphere, (store) => {
    //   const teamId = 'qa1S56OMu'
    //   const viewer = store.getRoot().getLinkedRecord('viewer')!
    //   const suggestedAction = createProxyRecord(store, 'SuggestedActionTryRetroMeeting', {
    //     type: 'SuggestedActionTryRetroMeeting',
    //     teamId
    //   })
    //   const team = store.get(teamId)!
    //   suggestedAction.setLinkedRecord(team, 'team')
    //   viewer.setLinkedRecords([suggestedAction], 'suggestedActions')
    // })
  }

  render() {
    return <div onClick={this.onClick}>DEBUG</div>
  }
}

export default withAtmosphere(DebugButton)
