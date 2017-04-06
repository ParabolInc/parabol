import React, {PropTypes} from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import ui from 'universal/styles/ui';

const DashHeaderInfo = (props) => {
  const {children, styles, title} = props;
  return (
    <div className={css(styles.root)}>
      <div className={css(styles.title)}>
        {title}
      </div>
      {children}
    </div>
  );
};


DashHeaderInfo.propTypes = {
  children: PropTypes.any,
  styles: PropTypes.object,
  title: PropTypes.any
};

const styleThunk = () => ({
  root: {
    alignItems: 'center',
    display: 'flex',
    width: '100%'
  },

  title: {
    ...ui.dashHeaderTitleStyles,
    marginRight: '1.5rem'
  }
});

export default withStyles(styleThunk)(DashHeaderInfo);
