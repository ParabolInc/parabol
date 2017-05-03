import Bundle from "../../../../components/Bundle/Bundle";
import React from "react";
import resolveDefault from "../../../../utils/resolveDefault";
import {PropTypes} from 'prop-types';

const TeamBundle = ({match}) => {
  const promises = {
    component: import('universal/modules/teamDashboard/containers/Team/TeamContainer').then(resolveDefault),
    socket: import('redux-socket-cluster').then((res) => res.socketClusterReducer),
    teamDashboard: import('universal/modules/teamDashboard/ducks/teamDashDuck').then(resolveDefault)
  };
  console.log('created promises! (see this more than once & it is bad)')
  return <Bundle match={match} promises={promises}/>;
};

TeamBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default TeamBundle;
