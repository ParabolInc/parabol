import Bundle from "universal/components/Bundle/Bundle";
import React from "react";
import resolveDefault from "universal/utils/resolveDefault";

const TeamSettingsBundle = ({match}) => {
  const promises = {
    component: import('./TeamSettingsContainer').then(resolveDefault),
  };
  return (
    <Bundle match={match} promises={promises}/>
  )
};

export default TeamSettingsBundle;
