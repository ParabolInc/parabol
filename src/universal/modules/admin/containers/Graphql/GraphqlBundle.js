import Bundle from "universal/components/Bundle/Bundle";
import React from "react";
import resolveDefault from "universal/utils/resolveDefault";
import PropTypes from 'prop-types';

const GraphqlBundle = ({match}) => {
  const promises = {
    component: import('./GraphqlContainer').then(resolveDefault)
  };
  return <Bundle match={match} promises={promises} />;
};

GraphqlBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default GraphqlBundle;
