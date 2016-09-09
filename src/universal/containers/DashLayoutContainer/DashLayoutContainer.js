import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import {cashay} from 'cashay';
import DashLayout from 'universal/components/Dashboard/DashLayout';

const resolveActiveMeetings = (teams) => {
  if (teams !== resolveActiveMeetings.teams) {
    resolveActiveMeetings.teams = teams;
    resolveActiveMeetings.cache = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      if (team.meetingId) {
        resolveActiveMeetings.cache.push({
          link: `/meeting/${team.id}`,
          name: team.name
        });
      }
    }
  }
  return resolveActiveMeetings.cache;
};

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
    op: 'dashLayoutContainer'
  }).data;
  return {
    activeMeetings: resolveActiveMeetings(teams)
  };
};

const DashLayoutContainer = (props) => {
  const {activeMeetings, children, title} = props;
  return (
    <DashLayout activeMeetings={activeMeetings} children={children} title={title}/>
  );
};

DashLayoutContainer.propTypes = {
  activeMeetings: PropTypes.array,
  children: PropTypes.any,
  title: PropTypes.string
};

export default connect(mapStateToProps)(DashLayoutContainer);
