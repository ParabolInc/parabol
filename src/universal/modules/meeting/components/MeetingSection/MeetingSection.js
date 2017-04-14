import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const MeetingSection = (props) => {
  const {
    children,
    flexToFill,
    paddingBottom,
    paddingTop,
    styles
  } = props;
  const stylePadding = {
    paddingBottom,
    paddingTop
  };
  const rootStyles = css(
    styles.root,
    flexToFill && styles.flex
  );
  return (
    <div className={rootStyles} style={stylePadding}>
      {children}
    </div>
  );
};

MeetingSection.propTypes = {
  children: PropTypes.any,
  flexToFill: PropTypes.bool,
  paddingBottom: PropTypes.string,
  paddingTop: PropTypes.string,
  styles: PropTypes.object
};

MeetingSection.defaultProps = {
  paddingBottom: '0px',
  paddingTop: '0px'
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    display: 'flex !important',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '100%',
    width: '100%'
  },

  flex: {
    flex: 1
  }
});

export default withStyles(styleThunk)(MeetingSection);
