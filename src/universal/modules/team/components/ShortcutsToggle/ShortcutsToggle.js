import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import FontAwesome from 'react-fontawesome';
import appTheme from 'universal/styles/theme/appTheme';
import {srOnly} from 'universal/styles/helpers';

const ShortcutsToggle = (props) => {
  const {handleOnClick, styles} = props;
  return (
    <a className={css(styles.root)} href="#" onClick={handleOnClick} title="Show shortcuts">
      <FontAwesome name="keyboard-o" />
      &nbsp;
      <FontAwesome name="question-circle" />
      <span className={css(styles.srOnly)}>Show shortcuts</span>
    </a>
  );
};

ShortcutsToggle.propTypes = {
  handleOnClick: PropTypes.func,
  styles: PropTypes.object
};
const hoverFocus = {
  backgroundColor: appTheme.palette.dark30l,
  color: appTheme.palette.dark10d,
  textDecoration: 'none'
};

const styleThunk = () => ({
  root: {
    backgroundColor: appTheme.palette.dark10l,
    borderRadius: '4em',
    bottom: '2rem',
    color: appTheme.palette.dark50d,
    fontSize: appTheme.typography.s3,
    display: 'inline-block',
    padding: '.25rem .75rem',
    position: 'fixed',
    right: '2rem',

    ':hover': {
      ...hoverFocus
    },
    ':focus': {
      ...hoverFocus
    }
  },

  srOnly: {
    ...srOnly
  }
});

export default withStyles(styleThunk)(ShortcutsToggle);
