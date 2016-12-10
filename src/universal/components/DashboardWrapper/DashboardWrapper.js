import React, {PropTypes} from 'react';
import {DashSidebar} from 'universal/components/Dashboard';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import Helmet from 'react-helmet';

const DashboardWrapper = (props) => {
  const {children, title} = props;
  return (
    <DashLayoutContainer>
      <Helmet title={title}/>
      <DashSidebar isUserSettings={title === 'User Settings'}/>
      {children}
    </DashLayoutContainer>
  );
};

DashboardWrapper.propTypes = {
  children: PropTypes.any,
  location: PropTypes.object
};

export default DashboardWrapper;
