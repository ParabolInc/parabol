import React, {PropTypes} from 'react';
import {
  DashContent,
  DashHeader,
  DashHeaderInfo,
  DashMain,
  dashTimestamp
} from 'universal/components/Dashboard';
import look, {StyleSheet} from 'react-look';
import UserActions from 'universal/modules/userDashboard/components/UserActions/UserActions';
import ProjectColumns from 'universal/components/ProjectColumns/ProjectColumns';

const Outcomes = (props) => {
  const {projects} = props;
  const {styles} = Outcomes;
  return (
    <DashMain>
      <DashHeader>
        <DashHeaderInfo title="My Dashboard">
          {dashTimestamp} • Carpe diem!
        </DashHeaderInfo>
      </DashHeader>
      <DashContent>
        <div className={styles.root}>
          <div className={styles.actionsLayout}>
            <UserActions />
          </div>
          <div className={styles.projectsLayout}>
            <ProjectColumns
              projects={projects}
            />
          </div>
        </div>
      </DashContent>
    </DashMain>
  );
};

Outcomes.propTypes = {
  preferredName: PropTypes.string,
  projects: PropTypes.array
};

Outcomes.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    padding: '1rem',
    width: '100%'
  },

  actionsLayout: {
    width: '20%'
  },

  projectsLayout: {
    width: '80%'
  }
});

export default look(Outcomes);
