import React, {Component} from 'react'
import {commitLocalUpdate} from 'relay-runtime'
import createProxyRecord from 'universal/utils/relay/createProxyRecord'
import withAtmosphere, {
  WithAtmosphereProps
} from '../../../../decorators/withAtmosphere/withAtmosphere'

interface Props extends WithAtmosphereProps {}

class DebugButton extends Component<Props> {
  onClick = () => {
    const {atmosphere} = this.props
    commitLocalUpdate(atmosphere, (store) => {
      const teamId = 'qa1S56OMu'
      const viewer = store.getRoot().getLinkedRecord('viewer')!
      const suggestedAction = createProxyRecord(store, 'SuggestedActionTryRetroMeeting', {
        type: 'SuggestedActionTryRetroMeeting',
        teamId
      })
      const team = store.get(teamId)!
      suggestedAction.setLinkedRecord(team, 'team')
      viewer.setLinkedRecords([suggestedAction], 'suggestedActions')
    })
  }

  render () {
    return <div onClick={this.onClick}>DEBUG</div>
  }
}

export default withAtmosphere(DebugButton)
