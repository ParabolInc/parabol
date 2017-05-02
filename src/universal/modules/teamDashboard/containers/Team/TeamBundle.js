import Bundle from "../../../../components/Bundle/Bundle";
import React from "react";
import resolveDefault from "../../../../utils/resolveDefault";

const TeamBundle = () => {
  console.log('getting team bundle');
  const promises = {
    component: import('universal/modules/teamDashboard/containers/AgendaAndProjects/AgendaAndProjectsContainer').then(resolveDefault),
    socket: import('redux-socket-cluster').then((res) => res.socketClusterReducer),
    teamDashboard: import('universal/modules/teamDashboard/ducks/teamDashDuck').then(resolveDefault)
  };
  console.log('created promises')
  return (
    <Bundle promises={promises}/>
  )
};

export default TeamBundle;
