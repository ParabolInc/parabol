import Bundle from "universal/components/Bundle/Bundle";
import React from "react";
import resolveDefault from "universal/utils/resolveDefault";

const NotFoundBundle = () => {
  const promises = {
    component: import('universal/components/NotFound/NotFound').then(resolveDefault)
  };
  return (
    <Bundle promises={promises}/>
  )
};

export default NotFoundBundle;
