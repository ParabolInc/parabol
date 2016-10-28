import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const NewTeam = (props) => {
  const {styles} = props;
  return (
    <div>
      New Team!
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
