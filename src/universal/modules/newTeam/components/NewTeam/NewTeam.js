import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import NewTeamForm from 'universal/modules/teamDashboard/components/NewTeamForm/NewTeamForm';

const NewTeam = (props) => {
  const {styles} = props;
  return (
    <div>
      <NewTeamForm/>
    </div>
  );
};

NewTeam.propTypes = {
  styles: PropTypes.object,
};

const styleThunk = () => ({
  root: {
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column'
  },

  body: {
    maxWidth: '20rem'
  },

  row: {
    margin: '0 0 1.5rem'
  }
});

export default withStyles(styleThunk)(NewTeam);
