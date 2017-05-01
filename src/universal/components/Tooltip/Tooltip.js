import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';

// TODO: make this a tooltip module where the container controls tooltip position and opened/closed states

const Tooltip = (props) => {
  const {
    children,
    styles
  } = props;
  return (
    <div className={css(styles.meetingPromptRoot)}>
      {children}
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.any,
  orientation: PropTypes.object,
  styles: PropTypes.object
};

const styleThunk = (theme, {orientation}) => ({
  tooltip: {
    backgroundColor: appTheme.palette.dark80a,
    content: `"${orientation}"`,
    maxWidth: '16rem',
    width: 'auto'
  }
});

export default withStyles(styleThunk)(Tooltip);
