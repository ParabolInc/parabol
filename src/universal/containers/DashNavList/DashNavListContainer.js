import React, {PropTypes} from 'react';
import DashNavList from 'universal/components/DashNavList/DashNavList';
import {connect} from 'react-redux';
import {cashay} from 'cashay';

const getMemberships = `
query {
  currentUser: getCurrentUser {
    id,
    memberships {
      id,
      team {
        id,
        name
      }
    }
  }
}`;

const mutationHandlers = {
  acceptInvitation(optimisticVariables, queryResponse, currentResponse) {
    if (queryResponse) {
      currentResponse.user.memberships.push(queryResponse);
    }
    return undefined;
  }
};

const queryOptions = {
  component: 'DashNavList',
  mutationHandlers
};

const mapStateToProps = () => ({membershipQuery: cashay.query(getMemberships, queryOptions)});

const DashNavListContainer = (props) => {
  const {active, activeTeamId, dispatch, membershipQuery} = props;
  const teams = membershipQuery.data.currentUser.memberships.map(m => {
    const {id, name} = m.team;
    return {
      active: active && id === activeTeamId,
      href: `/team/${id}`,
      label: name
    };
  });
  return <DashNavList teams={teams} dispatch={dispatch}/>;
};

DashNavListContainer.propTypes = {
  active: PropTypes.bool.isRequired,
  activeTeamId: PropTypes.string,
  dispatch: PropTypes.func
};

export default connect(mapStateToProps)(DashNavListContainer);
