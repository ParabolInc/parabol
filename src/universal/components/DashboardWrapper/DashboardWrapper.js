import React, {PropTypes} from 'react';
import {DashSidebar} from 'universal/components/Dashboard';
import DashLayoutContainer from 'universal/containers/DashLayoutContainer/DashLayoutContainer';
import Helmet from 'react-helmet';

const DashboardWrapper = (props) => {
  const {children, dispatch, location, title} = props;
  return (
    <DashLayoutContainer dispatch={dispatch}>
      <Helmet title={title}/>
      <DashSidebar isUserSettings={title === 'User Settings'} location={location} />
      {children}
    </DashLayoutContainer>
  );
};

DashboardWrapper.propTypes = {
  children: PropTypes.any,
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.string,
  title: PropTypes.string
};

export default DashboardWrapper;
