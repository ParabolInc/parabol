import React, {PropTypes} from 'react';
import DashNavList from 'universal/components/DashNavList/DashNavList';
import {connect} from 'react-redux';
import {cashay} from 'cashay';

const dashNavListQuery = `
query {
  teams @live {
    id
    name
    meetingId
  }
}
`;

const mapStateToProps = () => {
  const {teams} = cashay.query(dashNavListQuery, {
    op: 'dashNavListContainer'
  }).data;
  return {
    teams
  };
};

const DashNavListContainer = (props) => {
  const {teams} = props;
  return <DashNavList teams={teams}/>;
};

DashNavListContainer.propTypes = {
  teams: PropTypes.array
};

// needs to be false since this is the last container before we use Link to detect an active route
export default connect(mapStateToProps, undefined, undefined, {pure: false})(DashNavListContainer);
