import React, { Component } from 'react';
import Helmet from 'react-helmet';

import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

const styles = require('./MeetingLayout.scss'); // eslint-disable-line

export default class MeetingLayout extends Component {

  componentWillMount() {
    const model = new falcor.Model({source: new HttpDataSource('/api/model.json') });
    model.
      get('greeting').
      then((response) => {
        console.log(response.json.greeting);
      });
  }

  render() {
    return (
      <div>
        <Helmet title="Meeting" />
        <p>I am content.</p>
      </div>
    );
  }
}
