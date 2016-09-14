import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';
import FontAwesome from 'react-fontawesome';
import {Link} from 'react-router';

const TeamArchiveHeader = (props) => {
  const {teamId} = props;
  const {styles} = TeamArchiveHeader;
  return (
    <div className={styles.root}>
      <div className={styles.heading}>
        <div>
          <FontAwesome name="calendar"/>
          Archived Items
        </div>
        <Link to={`/team/${teamId}`}>
          <FontAwesome name="arrow-circle-o-left"/>
          Back to Team Projects
        </Link>
      </div>
    </div>
  );
};

TeamArchiveHeader.propTypes = {
  // TODO
  children: PropTypes.any
};

TeamArchiveHeader.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flex: 1,
    // padding: '1rem',
    width: '100%'
  },

  heading: {
    display: 'flex'
    // display: 'none'
  },

  controls: {
    flex: 1,
    textAlign: 'right'
  }
});

export default look(TeamArchiveHeader);
