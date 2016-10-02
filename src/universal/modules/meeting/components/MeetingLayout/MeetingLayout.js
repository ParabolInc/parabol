import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';

const MeetingLayout = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      {children}
    </div>
  );
}

MeetingLayout.propTypes = {
  children: PropTypes.any
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    display: 'flex !important',
    minHeight: '100vh'
  }
});

export default withStyles(styleThunk)(MeetingLayout);
