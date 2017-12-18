import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';

const HelpTextMyRound = (props) => {
  const {styles} = props;
  return (
    <span className={css(styles.helpText)}>{'(It’s your turn to share. Add cards to track your current work.)'}</span>
  );
};

HelpTextMyRound.propTypes = {
  styles: PropTypes.object
};

const styleThunk = () => ({
  helpText: {
    fontWeight: 700,
    userSelect: 'none'
  }
});

export default withStyles(styleThunk)(HelpTextMyRound);
