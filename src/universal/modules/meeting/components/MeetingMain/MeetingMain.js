import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite';

const MeetingMain = (props) => {
  const {children, styles} = props;
  return (
    <div className={css(styles.root)}>
      {children}
    </div>
  );
};


MeetingMain.propTypes = {
  children: PropTypes.any
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    display: 'flex !important',
    flex: 1,
    flexDirection: 'column',
    width: '100%'
  }
});

export default withStyles(styleThunk)(MeetingMain);
