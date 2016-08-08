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
  op: 'DashNavList',
  mutationHandlers
};

const mapStateToProps = () => ({membershipQuery: cashay.query(getMemberships, queryOptions)});

const DashNavListContainer = (props) => {
  const teams = props.membershipQuery.data.currentUser.memberships.map(m => {
    const {id, name} = m.team;
    return {
      href: `/team/${id}`,
      label: name
    };
  });
  return <DashNavList teams={teams}/>;
};

DashNavListContainer.propTypes = {
  membershipQuery: PropTypes.object
};

export default connect(mapStateToProps)(DashNavListContainer);
