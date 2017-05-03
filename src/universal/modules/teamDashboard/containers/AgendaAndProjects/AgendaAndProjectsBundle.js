import Bundle from "../../../../components/Bundle/Bundle";
import React from "react";
import resolveDefault from "../../../../utils/resolveDefault";

const AgendaAndProjectsBundle = ({match}) => {
  const promises = {
    component: import('./AgendaAndProjectsContainer').then(resolveDefault),
  };
  return (
    <Bundle match={match} promises={promises}/>
  )
};

export default AgendaAndProjectsBundle;
