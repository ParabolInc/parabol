import React from "react";
import Bundle from "../../../../components/Bundle/Bundle";
import resolveDefault from "../../../../utils/resolveDefault";

const LandingBundle = () => {
  const promises = {
    component: import('universal/modules/landing/containers/Landing/LandingContainer').then(resolveDefault),
  };
  return <Bundle promises={promises}/>;
};

export default LandingBundle;
