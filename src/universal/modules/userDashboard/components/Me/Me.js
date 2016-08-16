import React, {PropTypes} from 'react';
import {DashLayout, DashSidebar} from 'universal/components/Dashboard';
import Outcomes from 'universal/modules/userDashboard/components/Outcomes/Outcomes';

const Me = (props) => {
  const {activeMeetings, preferredName, projects} = props;
  return (
    <DashLayout title="My Dashboard" activeMeetings={activeMeetings}>
      <DashSidebar activeArea="outcomes"/>
      <Outcomes preferredName={preferredName} projects={projects}/>
    </DashLayout>
  );
};

Me.propTypes = {
  activeMeetings: PropTypes.array,
  preferredName: PropTypes.string,
  projects: PropTypes.array
};

export default Me;
