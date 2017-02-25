import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

const DashContent = (props) => {
  const {children, hasOverlay, padding, styles} = props;
  const style = {padding};
  const rootStyles = css(
    styles.root,
    hasOverlay && styles.hasOverlay
  );
  return (
    <div className={rootStyles} style={style}>
      {children}
    </div>
  );
};

DashContent.propTypes = {
  children: PropTypes.any,
  hasOverlay: PropTypes.bool,
  padding: PropTypes.string,
  styles: PropTypes.object,
};

DashContent.defaultProps = {
  padding: '1rem'
};

const styleThunk = () => ({
  root: {
    backgroundColor: ui.dashBackgroundColor,
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  },

  hasOverlay: {
    filter: ui.filterBlur
  }
});

export default withStyles(styleThunk)(DashContent);
