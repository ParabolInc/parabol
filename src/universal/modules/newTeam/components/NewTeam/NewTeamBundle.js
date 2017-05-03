import Bundle from "../../../../components/Bundle/Bundle";
import React from "react";
import resolveDefault from "../../../../utils/resolveDefault";
import PropTypes from 'prop-types';

const NewTeamBundle = ({match}) => {
  const promises = {
    component: import('universal/modules/newTeam/components/NewTeam/NewTeam').then(resolveDefault),
    socket: import('redux-socket-cluster').then((res) => res.socketClusterReducer),
  };
  return <Bundle match={match} promises={promises}/>;
};

NewTeamBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default NewTeamBundle;
