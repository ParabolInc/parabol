import React, {Component} from 'react'
import {RouteComponentProps, withRouter} from 'react-router'
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import isDemoRoute from '../utils/isDemoRoute'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  meetingId: string
}

class EndMeetingButton extends Component<Props> {
  endMeeting = () => {
    const {atmosphere, history, meetingId} = this.props
    EndNewMeetingMutation(atmosphere, {meetingId}, {history})
  }

  render() {
    const {submitting} = this.props
    const label = isDemoRoute() ? 'End Demo' : 'End Meeting'
    return (
      <BottomNavControl onClick={this.endMeeting} waiting={submitting}>
        <BottomNavIconLabel icon="flag" iconColor="blue" label={label} />
      </BottomNavControl>
    )
  }
}

export default withRouter(withAtmosphere(withMutationProps(EndMeetingButton)))
