import React, {PropTypes, Component} from 'react';
import App from '../../components/App/App';
import {connect} from 'react-redux';
import {localStorageVars} from '../../utils/clientOptions';
import loginWithToken from '../../decorators/loginWithToken/loginWithToken';
import {ensureState} from 'redux-optimistic-ui';

function mapStateToProps(state) {
  return {
    isAuthenticated: ensureState(state).getIn(['auth', 'isAuthenticated'])
  };
}

@connect(mapStateToProps)
@loginWithToken(localStorageVars)
// for the decorators
// eslint-disable-next-line react/prefer-stateless-function
export default class AppContainer extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    isAuthenticated: PropTypes.bool.isRequired
  };

  render() {
    return <App {...this.props} />;
  }
}
