import PropTypes from 'prop-types';
import React from 'react';
import DashSidebar from 'universal/components/Dashboard/DashSidebar';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import Helmet from 'react-helmet';

const DashboardWrapper = (props) => {
  const {children, title} = props;
  return (
    <DashLayoutContainer>
      <Helmet title={title} />
      <DashSidebar />
      {children}
    </DashLayoutContainer>
  );
};

DashboardWrapper.propTypes = {
  children: PropTypes.any.isRequired,
  title: PropTypes.string
};

export default DashboardWrapper;
