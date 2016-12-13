import React, {PropTypes} from 'react';
import Organizations from 'universal/modules/userDashboard/components/Organizations/Organizations';
import {cashay} from 'cashay';
import {connect} from 'react-redux';

const teamProjectsHeaderQuery = `
query {
  organizations @live {
    id
    createdAt
    isTrial
    name
    validUntil
  }
  getOrgCount {
    id
    activeCount
  }
}
`;

const mapStateToProps = (state, props) => {
  const {organizations, getOrgCount} = cashay.query(teamProjectsHeaderQuery, {
    op: 'organizationsContainer',
    sort: {
      organizations: (a, b) => a.name > b.name ? 1 : -1
    }
  }).data;
  console.log('ge', getOrgCount)
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
