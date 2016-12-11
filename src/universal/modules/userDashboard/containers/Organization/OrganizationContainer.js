import React, {Component, PropTypes} from 'react';
import Organization from 'universal/modules/userDashboard/components/Organization/Organization';

const organizationContainer = `
query {
  organization(orgId: $orgId) @live {
    id
    createdAt
    name
    picture
    activeUsers
    totalUsers
  }
}
`;

const mapStateToProps = (state, props) => {
  const {params: {orgId}} = props;

  return {
    // org
  }
};

export default class OrganizationContainer extends Component {
  render() {
    const {org} = this.props;
    return (
      <Organization org={org}/>
    );
  }
};
