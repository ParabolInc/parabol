import React, { Component } from 'react';
import Helmet from 'react-helmet';
import config from '../../config';
import { Landing } from 'containers';

const styles = require('./LandingLayout.scss'); // eslint-disable-line

export default class LandingLayout extends Component {
  render() {
    return (
      <div>
        <Helmet {...config.app.head}/>
        <Landing />
      </div>
    );
  }
}
