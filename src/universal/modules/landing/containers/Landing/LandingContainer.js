import React, {PropTypes, Component} from 'react';
import Landing from 'universal/modules/landing/components/Landing/Landing';
import {connect} from 'react-redux';
import {ensureState} from 'redux-optimistic-ui';
import Helmet from 'react-helmet';
import {head, auth0} from 'universal/utils/clientOptions';
import {push} from 'react-router-redux';
import Auth0Lock from 'auth0-lock';

const mapStateToProps = state => {
  return {
    isAuthenticated: ensureState(state).getIn(['auth', 'isAuthenticated']),
    meeting: ensureState(state).getIn(['meeting', 'instance'])
  };
}

@connect(mapStateToProps)
export default class LandingContainer extends Component {
  static propTypes = {
    children: PropTypes.element,
    isAuthenticated: PropTypes.bool.isRequired,
    meeting: PropTypes.shape({
      content: PropTypes.string,
      id: PropTypes.string
      // TODO what else?
    }),
    dispatch: PropTypes.func.isRequired
  };

  render() {
    return (
      <div>
        <Helmet title="Welcome to Action" {...head} />
        <Landing onMeetinCreateClick={this.handleOnMeetingCreateClick} {...this.props} />
      </div>
    );
  }

  handleOnMeetingCreateClick = () => {
    const {isAuthenticated, meeting, dispatch} = this.props;
    if (isAuthenticated) {
      // TODO should meeting be persisted in localStorage?
      if (meeting && meeting.id) {
        dispatch(push(`/meeting/${meeting.id}`));
      } else {
        dispatch(push(`/signin/createmeeting`));
      }
    } else {
      const {clientId, account} = auth0;
      const lock = new Auth0Lock(clientId, account);
      lock.show({
        authParams: {
          state: '/signin/createmeeting'
        }
      })
    }
  }
}
