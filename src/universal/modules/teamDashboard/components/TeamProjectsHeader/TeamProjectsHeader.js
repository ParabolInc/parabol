import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

const TeamProjectsHeader = () => {
  const {styles} = TeamProjectsHeader;
  return (
    <div className={styles.root}>
      <div>
        Team Projects
      </div>
      <div>
        Show by team member: ALL TEAM MEMBERS
      </div>
    </div>
  );
};

TeamProjectsHeader.propTypes = {
  // TODO
  children: PropTypes.any
};

TeamProjectsHeader.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(TeamProjectsHeader);
