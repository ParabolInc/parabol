import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';

const combineStyles = StyleSheet.combineStyles;

let s = {};

const MeetingContent = (props) => {
  const {
    children,
    flexToFill,
    paddingBottom,
    paddingTop
  } = props;
  const stylePadding = {
    paddingBottom,
    paddingTop
  };
  const flexStyles = combineStyles(s.root, s.flex);
  const rootStyles = flexToFill ? flexStyles : s.root;
  return (
    <div className={rootStyles} style={stylePadding}>
      {children}
    </div>
  );
};

MeetingContent.propTypes = {
  children: PropTypes.any,
  flexToFill: PropTypes.bool,
  paddingBottom: PropTypes.string,
  paddingTop: PropTypes.string
};

MeetingContent.defaultProps = {
  paddingBottom: '0px',
  paddingTop: '0px'
};

s = StyleSheet.create({
  root: {
    alignItems: 'center',
    backgroundColor: '#fff',
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

export default withStyles(styleThunk)(MeetingContent);
