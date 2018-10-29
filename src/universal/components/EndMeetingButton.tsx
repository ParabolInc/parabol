import React, {Component} from 'react'
import {connect} from 'react-redux'
import {RouteComponentProps, withRouter} from 'react-router'
import {Dispatch} from 'redux'
import EndNewMeetingMutation from 'universal/mutations/EndNewMeetingMutation'
import withAtmosphere, {WithAtmosphereProps} from '../decorators/withAtmosphere/withAtmosphere'
import isDemoRoute from '../utils/isDemoRoute'
import withMutationProps, {WithMutationProps} from '../utils/relay/withMutationProps'
import BottomNavControl from './BottomNavControl'
import BottomNavIconLabel from './BottomNavIconLabel'

interface Props extends WithAtmosphereProps, WithMutationProps, RouteComponentProps<{}> {
  dispatch: Dispatch<any>
  meetingId: string
}

class EndMeetingButton extends Component<Props> {
  endMeeting = () => {
    const {atmosphere, dispatch, history, meetingId} = this.props
    EndNewMeetingMutation(atmosphere, {meetingId}, {dispatch, history})
  }

  render () {
    const {submitting} = this.props
    const label = isDemoRoute() ? 'End Demo' : 'End Meeting'
    return (
      <BottomNavControl onClick={this.endMeeting} waiting={submitting}>
        <BottomNavIconLabel icon='flag' iconColor='blue' label={label} />
      </BottomNavControl>
    )
  }
}

export default (connect() as any)(withRouter(withAtmosphere(withMutationProps(EndMeetingButton))))
