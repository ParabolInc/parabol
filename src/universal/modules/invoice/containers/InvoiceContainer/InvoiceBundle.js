import Bundle from "universal/components/Bundle/Bundle";
import React from "react";
import resolveDefault from "universal/utils/resolveDefault";
import PropTypes from 'prop-types';

const InvoiceBundle = ({match}) => {
  const promises = {
    component: import('./InvoiceContainer').then(resolveDefault)
  };
  return <Bundle match={match} promises={promises} />;
};

InvoiceBundle.propTypes = {
  match: PropTypes.object.isRequired
};

export default InvoiceBundle;
