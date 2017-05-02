import Bundle from "../../../../components/Bundle/Bundle";
import React from "react";
import resolveDefault from "../../../../utils/resolveDefault";

const TeamBundle = () => {
  const promises = {
    component: import('universal/modules/landing/containers/Landing/LandingContainer').then(resolveDefault),
    socket: import('redux-socket-cluster').then((res) => res.socketClusterReducer),
    teamDashboard: import('universal/modules/teamDashboard/ducks/teamDashDuck').then(resolveDefault)
  };
  console.log('created promises')
  return (
    <Bundle promises={promises}/>
  )
};

export default TeamBundle;
