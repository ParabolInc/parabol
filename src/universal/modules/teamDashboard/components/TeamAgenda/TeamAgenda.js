import React, {PropTypes} from 'react';
import look, {StyleSheet} from 'react-look';

const TeamAgenda = () => {
  const {styles} = TeamAgenda;
  return (
    <div className={styles.root}>
      <div>
        AGENDA HEADER
      </div>
      <div>
        AGENDA LIST
      </div>
    </div>
  );
};

TeamAgenda.propTypes = {
  // TODO:
  children: PropTypes.any
};

TeamAgenda.styles = StyleSheet.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    padding: '1rem',
    width: '100%'
  }
});

export default look(TeamAgenda);
