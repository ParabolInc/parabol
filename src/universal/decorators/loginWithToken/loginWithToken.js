import React, {PropTypes, Component} from 'react';
import {loginUserSuccess} from '../../modules/auth/ducks/auth';
import jwtDecode from 'jwt-decode';

// eslint-disable-next-line arrow-body-style
export default ({authTokenName, profileName}) => ComposedComponent => {
  return class TokenizedComp extends Component {
    static propTypes = {
      dispatch: PropTypes.func.isRequired
    }

    componentWillMount() {
      if (__CLIENT__) {
        const authToken = localStorage.getItem(authTokenName);
        if (authToken) {
          const authTokenObj = jwtDecode(authToken);
          if (authTokenObj.exp < Date.now() / 1000) {
            localStorage.removeItem(authTokenName);
          } else {
            const profile = localStorage.getItem(profileName);
            this.props.dispatch(loginUserSuccess({authToken, profile: JSON.parse(profile)}));
          }
        }
      }
    }

    render() {
      return (
        <ComposedComponent {...this.props} />
      );
    }
  };
};
