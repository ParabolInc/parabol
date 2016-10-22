import React, {PropTypes} from 'react';
import Helmet from 'react-helmet';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import {head} from 'universal/utils/clientOptions';

const MeetingLayout = (props) => {
  const {children, styles, title} = props;
  return (
    <div className={css(styles.root)}>
      <Helmet title={title} {...head} />
      {children}
    </div>
  );
};

MeetingLayout.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object,
  title: PropTypes.string
};

const styleThunk = () => ({
  root: {
    backgroundColor: '#fff',
    display: 'flex !important',
    minHeight: '100vh'
  }
});

export default withStyles(styleThunk)(MeetingLayout);
