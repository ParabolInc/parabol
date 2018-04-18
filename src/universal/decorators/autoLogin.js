// @flow
import * as React from 'react';
import type {Location, RouterHistory} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import withAtmosphere from 'universal/decorators/withAtmosphere/withAtmosphere';

const {Component} = React;

type Props = {
  atmosphere: Object,
  history: RouterHistory,
  location: Location,
}

const autoLogin = (ComposedComponent: React.ComponentType<any>) => {
  class AutoLogin extends Component<Props> {
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

    redir: boolean;

    render() {
      if (this.redir) return null;
      return <ComposedComponent {...this.props} />;
    }
  }

  return withAtmosphere(withRouter(AutoLogin));
};

export default autoLogin;

