import React, {PropTypes} from 'react';
import {
  DashColumns,
  DashContent,
  DashHeader,
  DashHeaderInfo,
  DashMain,
  dashTimestamp
} from 'universal/components/Dashboard';
import ProjectStatusMenu from 'universal/components/ProjectStatusMenu/ProjectStatusMenu';

const Outcomes = (props) => {
  const {preferredName} = props;
  return (
    <DashMain>
      <DashHeader>
        <DashHeaderInfo title="My Outcomes">
          {dashTimestamp} • Carpe diem!
        </DashHeaderInfo>
      </DashHeader>
      <DashContent>
        It’s the Me show! starring: <b>{preferredName}</b>
        <br />
        <br />
        ProjectStatusMenu
        <br />
        <br />
        <ProjectStatusMenu status="done" isArchived={false} />
        <DashColumns />
      </DashContent>
    </DashMain>
  );
};

Outcomes.propTypes = {
  preferredName: PropTypes.string
};

export default Outcomes;
