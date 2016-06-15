import React, {PropTypes, Component} from 'react';
import App from '../../components/App/App';
import {connect} from 'react-redux';
import {localStorageVars} from '../../utils/clientOptions';
import loginWithToken from '../../decorators/loginWithToken/loginWithToken';

const mapStateToProps = (state) => ({
  isAuthenticated: state.getIn(['auth', 'isAuthenticated'])
});

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
