import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';
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
  children: PropTypes.any
};

const styleThunk = () => ({
  root: {
    display: 'flex',
    maxWidth: ui.projectColumnsMaxWidth,
    padding: '1rem',
    position: 'relative',
    width: '100%',
    zIndex: 400
  }
});

export default withStyles(styleThunk)(DashSectionHeader);
