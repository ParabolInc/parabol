import React from 'react';
import Helmet from 'react-helmet';
import InvoiceContainer from 'universal/modules/invoice/containers/InvoiceContainer/InvoiceContainer';

const rootStyle = {
  margin: '0 auto',
  maxWidth: '80rem',
  padding: '2rem'
};

const PatternsContainer = () =>
  <div style={rootStyle}>
    <Helmet title="Welcome to the Action Pattern Library" />

    <h1>Pattern Library</h1>

    <InvoiceContainer />

  </div>;

export default PatternsContainer;
