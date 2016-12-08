import React, {Component, PropTypes} from 'react';

export default class OrganizationContainer extends Component {
  render() {
    const {params: {orgId}} = this.props;
    return (
      <div>
        Org: {orgId}
      </div>
    );
  }
}
