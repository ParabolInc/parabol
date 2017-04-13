import React, {PropTypes} from 'react';
import DashNavList from 'universal/components/DashNavList/DashNavList';
import {connect} from 'react-redux';
import {cashay} from 'cashay';

const dashNavListQuery = `
query {
  orgCount(userId: $userId),\
  organizations(userId: $userId) @live {
    id
    name
  },
  teams @cached(type: "[Team]") {
    id
    isArchived
    isPaid
    name
    meetingId
    orgId
  }
}
`;

const mapStateToProps = () => {
  const {organizations, teams} = cashay.query(dashNavListQuery, {
    op: 'dashNavListContainer',
    resolveCached: {
      teams: () => (doc) => !doc.isArchived
    },
    sort: {
      teams: (a, b) => a.name > b.name ? 1 : -1
    }
  }).data;
  console.dir(organizations);
  console.dir(teams);
  return {
    organizations,
    teams
  };
};

const DashNavListContainer = (props) => {
  const {organizations, teams} = props;
  return <DashNavList teams={teams} organizations={organizations} />;
};

DashNavListContainer.propTypes = {
  organizations: PropTypes.array,
  teams: PropTypes.array
};

export default connect(mapStateToProps, undefined, undefined, {pure: false})(DashNavListContainer);
