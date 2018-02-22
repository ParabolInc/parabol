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
    display: 'flex',
    maxWidth: ui.taskColumnsMaxWidth,
    padding: '1rem',
    position: 'relative',
    width: '100%'
  }
});

export default withStyles(styleThunk)(DashSectionHeader);
