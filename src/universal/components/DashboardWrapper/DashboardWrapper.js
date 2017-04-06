import React, {PropTypes} from 'react';
import {DashSidebar} from 'universal/components/Dashboard';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import Helmet from 'react-helmet';

const DashboardWrapper = (props) => {
  const {children, location, title} = props;
  return (
    <DashLayoutContainer>
      <Helmet title={title} />
      <DashSidebar isUserSettings={title === 'User Settings'} location={location} />
      {children}
    </DashLayoutContainer>
  );
};

DashboardWrapper.propTypes = {
  children: PropTypes.any,
  location: PropTypes.string,
  title: PropTypes.string
};

export default DashboardWrapper;
