import PropTypes from 'prop-types';
import React from 'react';
import Helmet from 'universal/components/ParabolHelmet/ParabolHelmet';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';

const MeetingLayout = (props) => {
  const {children, styles, title} = props;
  return (
    <div className={css(styles.root)}>
      <Helmet title={title} />
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
    height: '100vh'
  }
});

export default withStyles(styleThunk)(MeetingLayout);
