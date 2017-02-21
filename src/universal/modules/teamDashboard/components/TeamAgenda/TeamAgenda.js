import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import AgendaHeader from 'universal/modules/teamDashboard/components/AgendaHeader/AgendaHeader';
import AgendaListAndInputContainer from 'universal/modules/teamDashboard/containers/AgendaListAndInput/AgendaListAndInputContainer';
import voidClick from 'universal/utils/voidClick';

const TeamAgenda = (props) => {
  const {styles, teamId} = props;
  return (
    <div className={css(styles.root)}>
      <AgendaHeader/>
      <AgendaListAndInputContainer context="dashboard" disabled={false} gotoItem={voidClick} teamId={teamId} />
    </div>
  );
};

TeamAgenda.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object,
  teamId: PropTypes.string,
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%'
  }
});

export default withStyles(styleThunk)(TeamAgenda);
