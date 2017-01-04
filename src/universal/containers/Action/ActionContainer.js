import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Action from 'universal/components/Action/Action';
import injectGlobals from 'universal/styles/hepha';
import globalStyles from 'universal/styles/theme/globalStyles';
import {segmentEventPage} from 'universal/redux/segmentActions';
import socketCluster from 'socketcluster-client';
import {showWarning} from 'universal/modules/notifications/ducks/notifications';
import {APP_VERSION_KEY} from 'universal/utils/constants';
import signout from 'universal/containers/Signout/signout';
import {withRouter} from 'react-router';
import socketWithPresence from 'universal/decorators/socketWithPresence/socketWithPresence';

const updateAnalyticsPage = (dispatch, lastPage, nextPage) => {
  if (typeof document === 'undefined') return;
  const name = document && document.title || '';
  const properties = {
    title: name,
    referrer: lastPage,
    path: nextPage
  };
  dispatch(segmentEventPage(name, null, properties));
};

@connect()
@withRouter
@socketWithPresence
export default class ActionContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    dispatch: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string.isRequired
    }).isRequired
  };

  componentWillMount() {
    const {dispatch, router, location: {pathname: nextPage}} = this.props;
    updateAnalyticsPage(dispatch, '', nextPage);
    injectGlobals(globalStyles);
    const socket = socketCluster.connect();
    const versionChannel = socket.subscribe('version');
    versionChannel.watch((versionOnServer) => {
      const versionInStorage = window.localStorage.getItem(APP_VERSION_KEY) || '0.0.0';
      if (versionOnServer !== versionInStorage) {
        signout(dispatch, router);
        dispatch(showWarning({
          title: 'So long!',
          message: `Logging you out because a new version of Action is available`
        }));
      }
    });
  }

  componentDidUpdate(prevProps) {
    const {location: {pathname: lastPage}} = prevProps;
    const {dispatch, location: {pathname: nextPage}} = this.props;
    if (lastPage !== nextPage) {
      /*
       * Perform page update after component renders. That way,
       * document.title will be current after any child <Helmet />
       * element(s) are rendered.
       */
      updateAnalyticsPage(dispatch, lastPage, nextPage);
    }
  }

  render() {
    return <Action {...this.props} />;
  }
}
