import React from 'react';
import Helmet from 'react-helmet';
import InvoiceContainer from 'universal/modules/invoice/containers/InvoiceContainer/InvoiceContainer';
import IconAvatar from 'universal/components/IconAvatar/IconAvatar';

const rootStyle = {
  // margin: '0 auto',
  // maxWidth: '80rem',
  // padding: '2rem'
};

const PatternsContainer = () =>
  <div style={rootStyle}>
    <Helmet title="Welcome to the Action Pattern Library" />
    <h2>IconAvatar examples</h2>
    <IconAvatar colorPalette="mid" icon="bell" size="small" />
    <IconAvatar colorPalette="cool" icon="user" size="medium" />
    <IconAvatar colorPalette="warm" icon="credit-card" size="large" />
    <InvoiceContainer />
  </div>;

export default PatternsContainer;
