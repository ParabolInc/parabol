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
}
`;

const mapStateToProps = (state, props) => {
  const {organizations} = cashay.query(teamProjectsHeaderQuery, {
    op: 'organizationsContainer',
    sort: {
      organizations: (a, b) => a.name > b.name ? 1 : -1
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
