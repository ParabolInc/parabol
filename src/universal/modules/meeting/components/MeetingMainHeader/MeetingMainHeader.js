import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const MeetingMainHeader = (props) => {
  const {
    children,
    styles
  } = props;
  return (
    <div className={css(styles.meetingMainHeaderRoot)}>
      {children}
    </div>
  );
};

MeetingMainHeader.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object
};

const styleThunk = () => ({
  meetingMainHeaderRoot: {
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    maxWidth: '100%',
    overflow: 'hidden',
    padding: '1rem',
    width: '100%'
  }
});

export default withStyles(styleThunk)(MeetingMainHeader);
