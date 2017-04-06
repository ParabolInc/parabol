import React, {PropTypes} from 'react';
import DashNavList from 'universal/components/DashNavList/DashNavList';
import {connect} from 'react-redux';
import {cashay} from 'cashay';

const dashNavListQuery = `
query {
  teams @cached(type: "[Team]") {
    id
    isArchived
    isPaid
    name
    meetingId
  }
}
`;

const mapStateToProps = () => {
  const {teams} = cashay.query(dashNavListQuery, {
    op: 'dashNavListContainer',
    resolveCached: {
      teams: () => (doc) => !doc.isArchived
    },
    sort: {
      teams: (a, b) => a.name > b.name ? 1 : -1
    }
  }).data;
  return {
    teams
  };
};

const DashNavListContainer = (props) => {
  const {teams} = props;
  return <DashNavList teams={teams} />;
};

DashNavListContainer.propTypes = {
  teams: PropTypes.array
};

export default connect(mapStateToProps, undefined, undefined, {pure: false})(DashNavListContainer);
