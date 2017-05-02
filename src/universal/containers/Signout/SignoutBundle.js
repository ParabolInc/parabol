import Bundle from "universal/components/Bundle/Bundle";
import React from "react";
import resolveDefault from "universal/utils/resolveDefault";

const SignoutBundle = () => {
  const promises = {
    component: import('universal/containers/Signout/SignoutContainer').then(resolveDefault)
  };
  return (
    <Bundle promises={promises}/>
  )
};

export default SignoutBundle;
