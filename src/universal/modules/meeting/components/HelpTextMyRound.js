import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';

const HelpTextMyRound = (props) => {
  const {styles, updateUserHasProjects} = props;
  const helpText = updateUserHasProjects ? 'Quick updates only, please.' : 'Add cards to track your current work.';
  return (
    <span className={css(styles.helpText)}>{`(Your turn to share. ${helpText})`}</span>
  );
};

HelpTextMyRound.propTypes = {
  styles: PropTypes.object,
  updateUserHasProjects: PropTypes.bool
};

const styleThunk = () => ({
  helpText: {
    fontWeight: 700,
    userSelect: 'none'
  }
});

export default withStyles(styleThunk)(HelpTextMyRound);
