import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import NewTeamForm from 'universal/modules/teamDashboard/components/NewTeamForm/NewTeamForm';
import {connect} from 'react-redux';

const NewTeam = (props) => {
  const {dispatch, styles} = props;
  return (
    <div className={css(styles.newTeamView)}>
      <NewTeamForm dispatch={dispatch}/>
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

export default connect()(withStyles(styleThunk)(NewTeam));
