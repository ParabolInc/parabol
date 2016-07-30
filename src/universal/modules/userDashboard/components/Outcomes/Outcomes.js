import React, {PropTypes} from 'react';
import {
  DashColumns,
  DashContent,
  DashHeader,
  DashMain,
  dashTimestamp
} from 'universal/components/Dashboard';
import ProjectStatusMenu from 'universal/components/ProjectStatusMenu/ProjectStatusMenu';

const Outcomes = (props) => {
  const {preferredName} = props;
  return (
    <DashMain>
      <DashHeader title="My Outcomes">
        {dashTimestamp} • Carpe diem!
      </DashHeader>
      <DashContent>
        It’s the Me show! starring: <b>{preferredName}</b>
        <br />
        <br />
        ProjectStatusMenu
        <br />
        <br />
        <ProjectStatusMenu />
        <DashColumns />
      </DashContent>
    </DashMain>
  );
};

Outcomes.propTypes = {
  user: PropTypes.shape({
    preferredName: PropTypes.string
  })
};

export default Outcomes;
