import React, {PropTypes} from 'react';
import DashNavList from 'universal/components/DashNavList/DashNavList';
import {connect} from 'react-redux';
import {cashay} from 'cashay';

const dashNavListQuery = `
query {
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

const mapStateToProps = (state) => {
  const userId = state.auth.obj.sub;
  const {organizations, teams} = cashay.query(dashNavListQuery, {
    op: 'dashNavListContainer',
    key: userId,
    resolveCached: {
      teams: () => (doc) => !doc.isArchived
    },
    sort: {
      teams: (a, b) => a.name > b.name ? 1 : -1
    },
    variables: {
      userId
    }
  }).data;
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
