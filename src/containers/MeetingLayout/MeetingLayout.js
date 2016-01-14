import React, { Component } from 'react';
import Helmet from 'react-helmet';

const styles = require('./MeetingLayout.scss'); // eslint-disable-line

export default class MeetingLayout extends Component {
  render() {
    return (
      <div>
        <Helmet title="Meeting" />
        <p>I am content.</p>
      </div>
    );
  }
}
