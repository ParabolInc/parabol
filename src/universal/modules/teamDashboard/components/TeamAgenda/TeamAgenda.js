import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
import AgendaHeader from 'universal/modules/teamDashboard/components/AgendaHeader/AgendaHeader';
import AgendaListAndInputContainer from 'universal/modules/teamDashboard/containers/AgendaListAndInput/AgendaListAndInputContainer';
const TeamAgenda = (props) => {
  const {styles} = TeamAgenda;
  const {teamId} = props;
  return (
    <div className={styles.root}>
      <AgendaHeader/>
      <AgendaListAndInputContainer teamId={teamId}/>
    </div>
  );
};

TeamAgenda.propTypes = {
  teamId: PropTypes.string,
  children: PropTypes.any
};

TeamAgenda.const styleThunk = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%'
  }
});

export default withStyles(styleThunk)(TeamAgenda);
