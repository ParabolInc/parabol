import PropTypes from 'prop-types';
import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

const DashSectionHeader = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      {children}
    </div>
  );
};

DashSectionHeader.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  root: {
    alignItems: 'flex-end',
    display: 'flex',
    margin: '0 auto',
    maxWidth: ui.taskColumnsMaxWidth,
    padding: `2rem ${ui.dashGutterSmall}`,
    position: 'relative',
    width: '100%',
    [ui.dashBreakpoint]: {
      padding: `3rem ${ui.dashGutterLarge} 2.25rem`
    }
  }
});

export default withStyles(styleThunk)(DashSectionHeader);
