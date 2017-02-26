import React, {PropTypes} from 'react';
import Organizations from 'universal/modules/userDashboard/components/Organizations/Organizations';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const teamProjectsHeaderQuery = `
query {
  ownedOrganizations(userId: $userId) @live {
    id
    activeUserCount
    inactiveUserCount
    name
    picture
  }
}
`;

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  const {ownedOrganizations: organizations} = cashay.query(teamProjectsHeaderQuery, {
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

OrganizationsContainer.propTypes = {
  organizations: PropTypes.array
};

export default connect(mapStateToProps)(OrganizationsContainer);
