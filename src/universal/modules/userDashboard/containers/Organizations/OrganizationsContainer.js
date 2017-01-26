import React, {PropTypes} from 'react';
import Organizations from 'universal/modules/userDashboard/components/Organizations/Organizations';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const teamProjectsHeaderQuery = `
query {
  organizations(userId: $userId) @live {
    id
    isTrial
    activeUserCount
    inactiveUserCount
    name
    picture
  }
}
`;

const mapStateToProps = (state, props) => {
  const userId = state.auth.obj.sub;
  const {organizations} = cashay.query(teamProjectsHeaderQuery, {
    op: 'organizationsContainer',
    key: userId,
    sort: {
      organizations: (a, b) => a.name > b.name ? 1 : -1
    },
    variables: {
      userId
    }
  }).data;
  return {
    organizations
  };
};

const OrganizationsContainer = (props) => {
  const {organizations} = props;
  return (
    <Organizations organizations={organizations}/>
  );
};

export default connect(mapStateToProps)(OrganizationsContainer);
