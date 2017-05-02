import React from "react";
import Bundle from "../../../../components/Bundle/Bundle";
import resolveDefault from "../../../../utils/resolveDefault";

const WelcomeBundle = () => {
  console.log('wel bun')
  const promises = {
    component: import('universal/modules/welcome/containers/Welcome/Welcome').then(resolveDefault),
    welcome: import('universal/modules/welcome/ducks/welcomeDuck').then(resolveDefault)
  };
  return <Bundle promises={promises}/>;
};

export default WelcomeBundle;
