import PropTypes from 'prop-types';
import React from 'react';
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
    tier
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
  const {history, organizations} = props;
  return (
    <Organizations history={history} organizations={organizations} />
  );
};

OrganizationsContainer.propTypes = {
  history: PropTypes.object.isRequired,
  organizations: PropTypes.array
};

export default connect(mapStateToProps)(OrganizationsContainer);
