// @flow
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import type {Location} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

type Props = {
  atmosphere: Object,
  location: Location,
}

const autoLogin = (ComposedComponent) => {
  class AutoLogin extends Component<Props> {
    static propTypes = {
      history: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired
    };

    constructor(props) {
      super(props);
      const {atmosphere: {authObj}, history, location: {search}} = props;
      if (authObj) {
        const isNew = !authObj.tms;
        if (isNew) {
          history.push('/welcome');
          this.redir = true;
        } else {
          const nextUrl = new URLSearchParams(search).get('redirectTo') || '/me';
          history.push(nextUrl);
          this.redir = true;
        }
      }
    }

    render() {
      if (this.redir) return null;
      return <ComposedComponent {...this.props} />
    }
  }
  return withAtmosphere(withRouter(AutoLogin));
};

export default autoLogin;

