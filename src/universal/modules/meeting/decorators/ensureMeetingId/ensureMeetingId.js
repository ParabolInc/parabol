import React, {PropTypes, Component} from 'react';
import {setMeetingId} from '../../ducks/meeting';
import {push} from 'react-router-redux';

export default ComposedComponent => {
  return class EnsureMeetingId extends Component {
    static propTypes = {
      meeting: PropTypes.object,
      params: PropTypes.object,
      dispatch: PropTypes.func
    }

    componentWillMount() {
      const {meeting, params, dispatch} = this.props;
      if (!meeting.instance.id) {
        if (params.id) {
          dispatch(setMeetingId(params.id));
        } else {
          dispatch(push('/404'));
        }
      }
    }

    render() {
      const {instance} = this.props.meeting;
      if (instance && instance.id) {
        return <ComposedComponent {...this.props}/>;
      }
      return <div>Fetching meeting...</div>;
    }
  };
};
