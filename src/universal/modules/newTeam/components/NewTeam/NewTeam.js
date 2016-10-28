import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import NewTeamForm from 'universal/modules/teamDashboard/components/NewTeamForm/NewTeamForm';

const NewTeam = (props) => {
  const {styles} = props;
  return (
    <div className={css(styles.newTeamView)}>
      <NewTeamForm/>
    </div>
  );
};

NewTeam.propTypes = {
  styles: PropTypes.object,
};

const styleThunk = () => ({
  newTeamView: {
    padding: '2rem'
  }
});

export default withStyles(styleThunk)(NewTeam);
